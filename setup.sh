#!/usr/bin/env bash
# ============================================================
#  Mellow's Hive — VPS Setup Script
#  Run as root on a fresh Ubuntu 22.04 / 24.04 server:
#    bash setup.sh
# ============================================================
set -euo pipefail

# ── Colours ─────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

log()  { echo -e "${CYAN}${BOLD}[setup]${RESET} $*"; }
ok()   { echo -e "${GREEN}${BOLD}[  ok ]${RESET} $*"; }
warn() { echo -e "${YELLOW}${BOLD}[ warn]${RESET} $*"; }
die()  { echo -e "${RED}${BOLD}[error]${RESET} $*" >&2; exit 1; }

# ── Root check ──────────────────────────────────────────────
[[ "$EUID" -eq 0 ]] || die "Run this script as root: sudo bash setup.sh"

# ── OS check ────────────────────────────────────────────────
. /etc/os-release 2>/dev/null || true
[[ "${ID:-}" == "ubuntu" ]] || warn "Script tested on Ubuntu — other distros may need tweaks."

# ============================================================
#  CONFIGURATION — edit these or answer prompts below
# ============================================================
APP_USER="${APP_USER:-mellows}"
APP_DIR="${APP_DIR:-/var/www/mellows-hive}"
NODE_MAJOR="${NODE_MAJOR:-20}"

# PostgreSQL
PG_USER="${PG_USER:-mellow_hive}"
PG_PASS="${PG_PASS:-}"          # filled by prompt if empty
PG_DB="${PG_DB:-mellows_hive}"
PG_VERSION="${PG_VERSION:-16}"

# Git
REPO_URL="${REPO_URL:-}"        # filled by prompt if empty
REPO_BRANCH="${REPO_BRANCH:-main}"

# App
APP_PORT="${APP_PORT:-3000}"
DOMAIN="${DOMAIN:-}"            # e.g. mellowshive.com — blank skips nginx

# ============================================================
#  STEP 0 — Interactive prompts for missing values
# ============================================================
echo
echo -e "${BOLD}════════════════════════════════════════${RESET}"
echo -e "${BOLD}   Mellow's Hive — VPS Setup Wizard     ${RESET}"
echo -e "${BOLD}════════════════════════════════════════${RESET}"
echo

prompt() {
  local var="$1" label="$2" default="$3"
  if [[ -z "${!var:-}" ]]; then
    if [[ -n "$default" ]]; then
      read -rp "  $label [${default}]: " input
      printf -v "$var" '%s' "${input:-$default}"
    else
      while [[ -z "${!var:-}" ]]; do
        read -rp "  $label: " input
        printf -v "$var" '%s' "$input"
      done
    fi
  fi
}

prompt REPO_URL    "Git repo URL (e.g. https://github.com/rub3sh/tmr_site.git)" ""
prompt PG_PASS     "PostgreSQL password for user '${PG_USER}'" "$(openssl rand -base64 18 | tr -d '/+=' | head -c 20)"
prompt DOMAIN      "Domain name (leave blank to skip nginx, e.g. mellowshive.com)" ""

echo
log "Config:"
echo "  App user   : $APP_USER"
echo "  App dir    : $APP_DIR"
echo "  Node.js    : v${NODE_MAJOR}.x LTS"
echo "  PostgreSQL : ${PG_VERSION}  |  db=${PG_DB}  user=${PG_USER}"
echo "  Git repo   : $REPO_URL  (branch: $REPO_BRANCH)"
echo "  Port       : $APP_PORT"
echo "  Domain     : ${DOMAIN:-<none — skip nginx>}"
echo
read -rp "  Proceed? [Y/n]: " go
[[ "${go,,}" =~ ^(y|yes|)$ ]] || die "Aborted."

# ============================================================
#  STEP 1 — System packages
# ============================================================
log "Updating package index…"
apt-get update -qq

log "Installing base dependencies…"
apt-get install -y -qq \
  curl wget git ca-certificates gnupg lsb-release \
  build-essential python3 \
  ufw nginx certbot python3-certbot-nginx \
  software-properties-common apt-transport-https
ok "Base packages installed."

# ── Node.js via NodeSource ───────────────────────────────────
if ! command -v node &>/dev/null || [[ "$(node -e 'process.exit(+process.version.slice(1).split(".")[0]<'"$NODE_MAJOR"'?1:0)')" -eq 0 ]]; then
  log "Installing Node.js ${NODE_MAJOR}.x…"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs
  ok "Node $(node -v) installed."
else
  ok "Node $(node -v) already installed."
fi

# ── PM2 ─────────────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  log "Installing PM2…"
  npm install -g pm2 --silent
  ok "PM2 $(pm2 -v) installed."
else
  ok "PM2 $(pm2 -v) already installed."
fi

# ── PostgreSQL ───────────────────────────────────────────────
if ! command -v psql &>/dev/null; then
  log "Installing PostgreSQL ${PG_VERSION}…"
  curl -fsSL "https://www.postgresql.org/media/keys/ACCC4CF8.asc" \
    | gpg --dearmor -o /usr/share/keyrings/postgresql.gpg
  echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] \
https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list
  apt-get update -qq
  apt-get install -y -qq "postgresql-${PG_VERSION}" "postgresql-client-${PG_VERSION}"
  ok "PostgreSQL ${PG_VERSION} installed."
else
  ok "PostgreSQL already installed: $(psql --version | head -1)."
fi

# ── Ensure PostgreSQL is running ────────────────────────────
systemctl enable --now postgresql >/dev/null 2>&1 || true
pg_isready -q || die "PostgreSQL is not reachable — check service status."
ok "PostgreSQL is running."

# ============================================================
#  STEP 2 — PostgreSQL database & user
# ============================================================
log "Setting up database '${PG_DB}' and user '${PG_USER}'…"

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${PG_USER}') THEN
    CREATE USER "${PG_USER}" WITH PASSWORD '${PG_PASS}';
    RAISE NOTICE 'Created role ${PG_USER}';
  ELSE
    ALTER USER "${PG_USER}" WITH PASSWORD '${PG_PASS}';
    RAISE NOTICE 'Updated password for ${PG_USER}';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE "${PG_DB}" OWNER "${PG_USER}"'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname='${PG_DB}')
\gexec

GRANT ALL PRIVILEGES ON DATABASE "${PG_DB}" TO "${PG_USER}";
SQL

# Allow password auth for our user
PG_HBA="/etc/postgresql/${PG_VERSION}/main/pg_hba.conf"
if [[ -f "$PG_HBA" ]]; then
  # Add md5 rule before the local all all peer line if not already present
  if ! grep -q "host.*${PG_DB}.*${PG_USER}" "$PG_HBA"; then
    sed -i "/^local   all             all/i host    ${PG_DB}    ${PG_USER}    127.0.0.1/32    md5" "$PG_HBA"
    systemctl reload postgresql >/dev/null 2>&1 || true
  fi
fi
ok "Database ready: postgresql://${PG_USER}:*****@localhost:5432/${PG_DB}"

# ============================================================
#  STEP 3 — App user & directory
# ============================================================
if ! id "$APP_USER" &>/dev/null; then
  log "Creating system user '${APP_USER}'…"
  useradd -m -s /bin/bash "$APP_USER"
  ok "User '${APP_USER}' created."
else
  ok "User '${APP_USER}' already exists."
fi

log "Cloning / updating repository…"
if [[ -d "$APP_DIR/.git" ]]; then
  warn "Repo already exists at ${APP_DIR} — pulling latest ${REPO_BRANCH}…"
  git -C "$APP_DIR" fetch --all -q
  git -C "$APP_DIR" reset --hard "origin/${REPO_BRANCH}" -q
else
  git clone --branch "$REPO_BRANCH" --depth 1 "$REPO_URL" "$APP_DIR"
fi
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"
ok "Code at ${APP_DIR} (branch: ${REPO_BRANCH})."

# ============================================================
#  STEP 4 — Environment file
# ============================================================
ENV_FILE="$APP_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  log "Creating .env from template…"
  [[ -f "$APP_DIR/.env.example" ]] && cp "$APP_DIR/.env.example" "$ENV_FILE" \
    || touch "$ENV_FILE"
fi

# Build the DATABASE_URL from our known values
DATABASE_URL="postgresql://${PG_USER}:${PG_PASS}@localhost:5432/${PG_DB}"

# Update/append each key we know
set_env() {
  local key="$1" val="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$ENV_FILE"
  else
    echo "${key}=${val}" >> "$ENV_FILE"
  fi
}

NEXTAUTH_SECRET_VAL="$(openssl rand -base64 32)"
APP_URL="http://${DOMAIN:-localhost}${DOMAIN:+}${DOMAIN:-:${APP_PORT}}"
[[ -n "$DOMAIN" ]] && APP_URL="https://${DOMAIN}" || APP_URL="http://localhost:${APP_PORT}"

set_env DATABASE_URL    "$DATABASE_URL"
set_env NEXTAUTH_URL    "$APP_URL"
set_env NEXT_PUBLIC_APP_URL "$APP_URL"

# Only set NEXTAUTH_SECRET if it still has the placeholder
if grep -q "generate-a-32-char" "$ENV_FILE" 2>/dev/null; then
  set_env NEXTAUTH_SECRET "$NEXTAUTH_SECRET_VAL"
fi

chown "$APP_USER":"$APP_USER" "$ENV_FILE"
chmod 600 "$ENV_FILE"
ok ".env configured."

warn "──────────────────────────────────────────────────────────"
warn "ACTION REQUIRED: Fill in your API keys in:"
warn "  ${ENV_FILE}"
warn "  Keys to set: DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET,"
warn "               RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET,"
warn "               VDOCIPHER_API_SECRET, RESEND_API_KEY"
warn "──────────────────────────────────────────────────────────"

# ============================================================
#  STEP 5 — npm install + Prisma + Build
# ============================================================
log "Installing npm packages (npm ci)…"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR' && npm ci --silent"
ok "npm packages installed."

log "Generating Prisma client…"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR' && npx prisma generate --no-hints"
ok "Prisma client generated."

log "Pushing Prisma schema to database…"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR' && npx prisma db push --accept-data-loss"
ok "Database schema synced."

log "Seeding database…"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR' && npx tsx prisma/seed.ts" || warn "Seed skipped (may already exist)."
ok "Database seeded."

log "Building Next.js production bundle…"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR' && npm run build"
ok "Next.js build complete."

# ============================================================
#  STEP 6 — PM2 process manager
# ============================================================
log "Configuring PM2…"

PM2_ECOSYSTEM="$APP_DIR/ecosystem.config.js"
cat > "$PM2_ECOSYSTEM" <<ECOSYSTEM
module.exports = {
  apps: [
    {
      name: 'mellows-hive',
      script: 'node_modules/.bin/next',
      args: 'start -p ${APP_PORT}',
      cwd: '${APP_DIR}',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_file: '${APP_DIR}/.env',
      env: {
        NODE_ENV: 'production',
        PORT: '${APP_PORT}',
      },
      error_file: '/var/log/mellows-hive/err.log',
      out_file: '/var/log/mellows-hive/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
ECOSYSTEM

mkdir -p /var/log/mellows-hive
chown "$APP_USER":"$APP_USER" /var/log/mellows-hive
chown "$APP_USER":"$APP_USER" "$PM2_ECOSYSTEM"

# Start / reload app
sudo -u "$APP_USER" bash -c "pm2 delete mellows-hive 2>/dev/null; pm2 start '$PM2_ECOSYSTEM'"
sudo -u "$APP_USER" bash -c "pm2 save"

# Register PM2 to start on boot
PM2_STARTUP="$(pm2 startup systemd -u "$APP_USER" --hp "/home/${APP_USER}" | grep 'sudo')"
eval "$PM2_STARTUP" >/dev/null 2>&1 || true
ok "PM2 configured — app running on port ${APP_PORT}."

# ============================================================
#  STEP 7 — Firewall (UFW)
# ============================================================
log "Configuring UFW firewall…"
ufw --force reset >/dev/null
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow ssh >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
# Only open app port directly if no domain (otherwise nginx proxies it)
[[ -z "$DOMAIN" ]] && ufw allow "${APP_PORT}/tcp" >/dev/null
ufw --force enable >/dev/null
ok "Firewall active: SSH, 80, 443${DOMAIN:+} open.${DOMAIN:-", ${APP_PORT} open."}"

# ============================================================
#  STEP 8 — Nginx reverse proxy (only if domain provided)
# ============================================================
if [[ -n "$DOMAIN" ]]; then
  log "Configuring nginx for ${DOMAIN}…"

  NGINX_CONF="/etc/nginx/sites-available/mellows-hive"
  cat > "$NGINX_CONF" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1024;

    # Next.js static files — served directly with long cache
    location /_next/static/ {
        alias ${APP_DIR}/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Public assets
    location /public/ {
        alias ${APP_DIR}/public/;
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
    }

    # Proxy everything else to Next.js
    location / {
        proxy_pass         http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        client_max_body_size 50M;
    }
}
NGINX

  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/mellows-hive
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
  ok "Nginx configured for ${DOMAIN}."

  log "Obtaining SSL certificate via Let's Encrypt…"
  if certbot --nginx -d "$DOMAIN" -d "www.${DOMAIN}" \
       --non-interactive --agree-tos -m "admin@${DOMAIN}" \
       --redirect >/dev/null 2>&1; then
    ok "SSL certificate installed — HTTPS enabled."

    # Update .env with https URL
    set_env NEXTAUTH_URL    "https://${DOMAIN}"
    set_env NEXT_PUBLIC_APP_URL "https://${DOMAIN}"

    # Restart app with updated env
    sudo -u "$APP_USER" bash -c "pm2 restart mellows-hive" >/dev/null
  else
    warn "SSL failed — DNS may not be pointed yet. Run manually later:"
    warn "  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
  fi
else
  log "No domain set — skipping nginx and SSL."
  warn "App is accessible at: http://<server-ip>:${APP_PORT}"
fi

# ============================================================
#  DONE
# ============================================================
echo
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}   Setup complete!                          ${RESET}"
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════${RESET}"
echo
echo -e "  ${BOLD}App directory :${RESET} ${APP_DIR}"
echo -e "  ${BOLD}App user      :${RESET} ${APP_USER}"
echo -e "  ${BOLD}Database      :${RESET} postgresql://${PG_USER}:*****@localhost:5432/${PG_DB}"
if [[ -n "$DOMAIN" ]]; then
  echo -e "  ${BOLD}URL           :${RESET} https://${DOMAIN}"
else
  echo -e "  ${BOLD}URL           :${RESET} http://<server-ip>:${APP_PORT}"
fi
echo
echo -e "  ${BOLD}Useful commands:${RESET}"
echo -e "    pm2 status                   — check app status"
echo -e "    pm2 logs mellows-hive        — view live logs"
echo -e "    pm2 restart mellows-hive     — restart app"
echo -e "    sudo nano ${ENV_FILE}        — edit env vars"
echo -e "    cd ${APP_DIR} && git pull && npm ci && npm run build && pm2 restart mellows-hive"
echo -e "                                 — deploy updates"
echo
if grep -q "your-discord\|re_xxxxx\|rzp_test_xxxxx\|xxxxx" "$ENV_FILE" 2>/dev/null; then
  echo -e "${YELLOW}${BOLD}  ⚠  Fill in API keys in: ${ENV_FILE}${RESET}"
  echo -e "${YELLOW}     Then restart: pm2 restart mellows-hive${RESET}"
  echo
fi

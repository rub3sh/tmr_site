# VPS Deployment Guide

Deploy Mellow's Hive on a Ubuntu 22.04 VPS with a public IP using Nginx as a reverse proxy and PM2 as the process manager.

---

## Architecture

```
Internet → Nginx (port 80/443) → PM2 (Next.js on port 3000)
                                → PostgreSQL (local, port 5432)
```

---

## 1. Initial Server Setup

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y

# Create a non-root user (replace 'deploy' with your preferred username)
adduser deploy
usermod -aG sudo deploy

# Switch to deploy user for the rest of this guide
su - deploy
```

---

## 2. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # should print v20.x.x
```

---

## 3. Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib

# Start and enable on boot
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create DB user and database
sudo -u postgres psql <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mellow_hive'
  ) THEN
    CREATE ROLE mellow_hive LOGIN PASSWORD 'CHANGE_THIS_PASSWORD';
  END IF;
END
$$;
SQL

sudo -u postgres psql -c "CREATE DATABASE mellows_hive OWNER mellow_hive;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mellows_hive TO mellow_hive;"
```

> Use a strong password. Update `DATABASE_URL` in `.env` to match.

---

## 4. Install Nginx and PM2

```bash
sudo apt install -y nginx
sudo npm install -g pm2
```

---

## 5. Clone and Build the App

```bash
# Clone your repo (or upload via scp/rsync)
git clone <your-repo-url> /var/www/mellows-hive
cd /var/www/mellows-hive

# Install dependencies
npm install --legacy-peer-deps

# Create .env from example
cp .env.example .env
nano .env   # fill in all real values (see below)
```

### Required .env values for production

```env
DATABASE_URL=postgresql://mellow_hive:CHANGE_THIS_PASSWORD@localhost:5432/mellows_hive

NEXTAUTH_URL=http://YOUR_VPS_IP          # or https://yourdomain.com if you have a domain
NEXTAUTH_SECRET=<run: openssl rand -base64 32>

DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key

VDOCIPHER_API_SECRET=your_vdocipher_secret

RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

NEXT_PUBLIC_APP_URL=http://YOUR_VPS_IP   # or https://yourdomain.com
```

---

## 6. Initialize Database and Build

```bash
cd /var/www/mellows-hive

# Push schema and seed
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

# Build Next.js for production
npm run build
```

---

## 7. Start App with PM2

```bash
pm2 start npm --name "mellows-hive" -- start
pm2 save
pm2 startup   # follow the command it prints to enable auto-start on reboot
```

Verify the app is running:

```bash
pm2 status
curl http://localhost:3000   # should return HTML
```

---

## 8. Configure Nginx

### Without a domain (IP only)

```bash
sudo nano /etc/nginx/sites-available/mellows-hive
```

Paste:

```nginx
server {
    listen 80;
    server_name YOUR_VPS_IP;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mellows-hive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Your app is now live at `http://YOUR_VPS_IP`.

---

### With a domain + HTTPS (recommended)

Point your domain's A record to `YOUR_VPS_IP`, then:

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo nano /etc/nginx/sites-available/mellows-hive
# Change server_name YOUR_VPS_IP; → server_name yourdomain.com www.yourdomain.com;
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot automatically updates the Nginx config and sets up auto-renewal.

Update your `.env`:

```env
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Rebuild and restart:

```bash
npm run build
pm2 restart mellows-hive
```

---

## 9. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # ports 80 and 443
sudo ufw enable
sudo ufw status
```

---

## 10. Discord OAuth Redirect URI

In your Discord Developer Portal → OAuth2 → Redirects, add:

```
http://YOUR_VPS_IP/api/auth/callback/discord
# or if using domain:
https://yourdomain.com/api/auth/callback/discord
```

---

## 11. Razorpay Webhook

In the Razorpay dashboard, add a webhook pointing to:

```
https://yourdomain.com/api/payments/webhook
```

Set the webhook secret and add it to `.env` as `RAZORPAY_WEBHOOK_SECRET`.

---

## 12. Deploying Updates

```bash
cd /var/www/mellows-hive

git pull

npm install --legacy-peer-deps  # only if dependencies changed

npx prisma generate             # only if schema changed
npx prisma db push              # only if schema changed

npm run build
pm2 restart mellows-hive
```

---

## 13. Useful Commands

| Task                        | Command                              |
|-----------------------------|--------------------------------------|
| View app logs               | `pm2 logs mellows-hive`              |
| Restart app                 | `pm2 restart mellows-hive`           |
| Stop app                    | `pm2 stop mellows-hive`              |
| Nginx error logs            | `sudo tail -f /var/nginx/error.log`  |
| Nginx access logs           | `sudo tail -f /var/nginx/access.log` |
| Open Prisma Studio          | `npm run db:studio` (local only)     |
| Check DB                    | `psql -U mellow_hive -d mellows_hive`|

---

## 14. Production Checklist

- [ ] Strong PostgreSQL password (not `mellow_joel`)
- [ ] `NEXTAUTH_SECRET` set to a random 32-char string
- [ ] Admin password changed from default `admin123456`
- [ ] HTTPS configured (Certbot)
- [ ] Firewall enabled (ufw)
- [ ] Discord OAuth redirect URI updated
- [ ] Razorpay webhook URL updated
- [ ] `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` point to the live URL
- [ ] PM2 startup hook configured (`pm2 startup && pm2 save`)



● Yes, absolutely possible. You don't need a VPS for this — use a tunnel that gives your local VM a public URL in under 2 minutes.             
                                                                                                                                               
  Best options (free, no port forwarding needed)                                                                                               
                                                                                                                                               
  Option 1 — Cloudflare Tunnel (recommended, no account needed for temp use)                                                                   
                                                                                                                                               
  # Install cloudflared                                                                                                                        
  wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
  sudo dpkg -i cloudflared-linux-amd64.deb                                                                                                     
                                                                                                                                               
  # Start your Next.js app first
  npm run build && npm start   # or pm2 start npm -- start                                                                                     
                                                                                                                                               
  # In a second terminal, create the tunnel
  cloudflared tunnel --url http://localhost:3000                                                                                               
                                                                                                                                               
  It prints a URL like https://random-name.trycloudflare.com — share that, it works immediately. No account, no signup.                        
                                                                                                                                               
  ---                                                                                                                                          
  Option 2 — ngrok (needs free account)                     
                                                                                                                                               
  # Install
  curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null                                
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list                                    
  sudo apt update && sudo apt install ngrok                                                                                                    
                                                                                                                                               
  # Authenticate (one-time, get token from ngrok.com dashboard)                                                                                
  ngrok config add-authtoken YOUR_TOKEN                     
                                                                                                                                               
  # Expose app                                              
  ngrok http 3000

  Gives you https://xxxx.ngrok-free.app.                                                                                                       
   
  ---                                                                                                                                          
  What you need to update in .env                           
                                                                                                                                               
  Whichever tunnel URL you get, update these two lines:
                                                                                                                                               
  NEXTAUTH_URL=https://your-tunnel-url.trycloudflare.com    
  NEXT_PUBLIC_APP_URL=https://your-tunnel-url.trycloudflare.com                                                                                
   
  Then rebuild:                                                                                                                                
                                                            
  npm run build && pm2 restart mellows-hive
  # or if not using pm2:                                                                                                                       
  npm run build && npm start
                                                                                                                                               
  Also update your Discord OAuth redirect in the Discord Developer Portal:                                                                     
  https://your-tunnel-url.trycloudflare.com/api/auth/callback/discord
                                                                                                                                               
  ---                                                                                                                                          
  Limitations to keep in mind
                                                                                                                                               
  ┌───────────────────────────┬──────────────────────────────────────────────────┐
  │           Thing           │                      Detail                      │                                                             
  ├───────────────────────────┼──────────────────────────────────────────────────┤
  │ URL changes every restart │ Free Cloudflare tunnel gives a new URL each time │                                                             
  ├───────────────────────────┼──────────────────────────────────────────────────┤
  │ VM must stay on           │ Tunnel dies if your machine sleeps/shuts down    │                                                             
  ├───────────────────────────┼──────────────────────────────────────────────────┤                                                             
  │ Speed                     │ Fine for testing, not for real users             │                                                             
  ├───────────────────────────┼──────────────────────────────────────────────────┤                                                             
  │ ngrok free tier           │ 1 tunnel, limited connections/min                │
  └───────────────────────────┴──────────────────────────────────────────────────┘                                                             
   
  Cloudflare tunnel is the cleanest option — no account, HTTPS out of the box, and fast. Once your VPS is verified in 24hrs, migrate using     
  VPS_DEPLOY.md. 
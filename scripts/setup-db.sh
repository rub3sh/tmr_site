#!/usr/bin/env bash
# Auto-setup database before dev server starts
set -euo pipefail

if [[ -f ".env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

DB_URL="${DATABASE_URL:-}"
DB_HOST="localhost"
DB_PORT="5432"

if [[ -n "$DB_URL" ]]; then
  parsed_host="$(echo "$DB_URL" | sed -E 's#^[^:]+://[^@]+@([^:/?]+).*#\1#')"
  parsed_port="$(echo "$DB_URL" | sed -nE 's#^[^:]+://[^@]+@[^:/?]+:([0-9]+).*#\1#p')"

  if [[ -n "$parsed_host" && "$parsed_host" != "$DB_URL" ]]; then
    DB_HOST="$parsed_host"
  fi

  if [[ -n "$parsed_port" ]]; then
    DB_PORT="$parsed_port"
  fi
fi

# Start PostgreSQL if not running
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -q 2>/dev/null; then
  echo "PostgreSQL is not reachable at ${DB_HOST}:${DB_PORT}."
  echo "Trying to start PostgreSQL service..."
  sudo systemctl start postgresql 2>/dev/null || true
fi

if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -q 2>/dev/null; then
  echo "ERROR: Database is still unreachable at ${DB_HOST}:${DB_PORT}."
  echo "Check your DATABASE_URL in .env and ensure that PostgreSQL is running on that host/port."
  exit 1
fi

# Only regenerate Prisma client if node_modules/.prisma doesn't exist
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "Generating Prisma client..."
  npx prisma generate --no-hints
fi

# Only push schema if this is a fresh DB (check if User table exists)
if ! npx prisma db execute --stdin <<< "SELECT 1 FROM \"User\" LIMIT 1;" >/dev/null 2>&1; then
  echo "Pushing schema..."
  npx prisma db push --accept-data-loss --skip-generate
  echo "Seeding..."
  npx tsx prisma/seed.ts || true
fi

echo "DB ready"

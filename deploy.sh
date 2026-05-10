#!/bin/bash
set -e

echo "==> Pulling latest code..."
git pull origin main

echo "==> Installing dependencies (if changed)..."
npm ci --omit=dev 2>/dev/null || npm install --omit=dev

echo "==> Building..."
chown -R ubuntu:ubuntu .next 2>/dev/null || true
npm run build

echo "==> Restarting with pm2..."
pm2 restart tmr-site

echo "==> Waiting for startup..."
sleep 3

status=$(pm2 jlist | python3 -c "import sys,json; procs=json.load(sys.stdin); p=[x for x in procs if x['name']=='tmr-site']; print(p[0]['pm2_env']['status'] if p else 'not found')")
if [ "$status" = "online" ]; then
  echo "✓ Site is live at https://themarketrevelation.com"
  pm2 status
else
  echo "✗ Service not online (status: $status) — check: pm2 logs tmr-site"
  exit 1
fi

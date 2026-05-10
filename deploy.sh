#!/bin/bash
set -e

echo "==> Pulling latest code..."
git pull origin main

echo "==> Installing dependencies (if changed)..."
npm ci --omit=dev 2>/dev/null || npm install --omit=dev

echo "==> Building..."
sudo chown -R ubuntu:ubuntu .next 2>/dev/null || true
npm run build

echo "==> Restarting service..."
sudo systemctl restart tmr-site

echo "==> Waiting for startup..."
sleep 3

status=$(sudo systemctl is-active tmr-site)
if [ "$status" = "active" ]; then
  echo "✓ Site is live at https://themarketrevelation.com"
else
  echo "✗ Service failed to start — check logs: sudo journalctl -u tmr-site -n 50"
  exit 1
fi

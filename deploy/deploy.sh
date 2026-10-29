#!/usr/bin/env bash
# Build and (re)start the site on the server. Run from /srv/rig/app.
set -euo pipefail
cd "$(dirname "$0")/.."

npm ci
npm run db:setup          # migrations + first-time seed + admin user
npm run build             # prerenders pages from the live database
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
cp .env .next/standalone/.env
ln -sfn "$(pwd)/data" .next/standalone/data
ln -sfn "$(pwd)/uploads" .next/standalone/uploads
pm2 startOrReload deploy/ecosystem.config.cjs
pm2 save
echo "Deployed."

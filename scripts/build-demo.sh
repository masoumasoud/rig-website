#!/usr/bin/env bash
# Builds the static GitHub Pages demo into ./demo-out.
#
# The demo contains only the public pages. It is built from a throw-away copy of the project so the
# real app (panel, API, proxy, email worker) is never touched.
#
#   BASE_PATH=/rig-website SITE_URL=https://<user>.github.io/rig-website ./scripts/build-demo.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$ROOT/.demo-build"
BASE_PATH="${BASE_PATH-/rig-website}"
SITE_URL="${SITE_URL:-https://example.github.io$BASE_PATH}"

rm -rf "$WORK" "$ROOT/demo-out"
mkdir -p "$WORK"
rsync -a \
  --exclude node_modules --exclude .next --exclude out --exclude .demo-build --exclude demo-out \
  --exclude .git --exclude data --exclude uploads --exclude docs --exclude .env \
  "$ROOT/" "$WORK/"
cp -R "$ROOT/node_modules" "$WORK/node_modules" 2>/dev/null || ln -s "$ROOT/node_modules" "$WORK/node_modules"

cd "$WORK"
# Everything that needs a server: panel, API, generated images, uploads, mail worker, locale proxy.
rm -rf src/app/admin src/app/api src/app/og src/app/media src/app/llms.txt src/proxy.ts src/instrumentation.ts
# Metadata routes (robots, sitemap, manifest) cannot be exported together with Cache Components.
rm -f src/app/robots.ts src/app/sitemap.ts src/app/manifest.ts

export DATABASE_URL="file:./data/demo.db" ADMIN_EMAIL="demo@example.com" ADMIN_PASSWORD="not-used-in-demo-build" APP_SECRET="demo"
mkdir -p data
npm run db:setup

NEXT_PUBLIC_DEMO=1 NEXT_PUBLIC_BASE_PATH="$BASE_PATH" SITE_URL="$SITE_URL" npx next build

cp -R out "$ROOT/demo-out"
touch "$ROOT/demo-out/.nojekyll"
# The root has no page of its own (Persian lives under /fa), so send visitors there.
cat > "$ROOT/demo-out/index.html" <<HTML
<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>گروه صنعتی رضایی</title>
<meta http-equiv="refresh" content="0;url=$BASE_PATH/fa/"><link rel="canonical" href="$BASE_PATH/fa/"></head>
<body><p><a href="$BASE_PATH/fa/">ورود به سایت</a></p><script>location.replace("$BASE_PATH/fa/")</script></body></html>
HTML
rm -rf "$WORK"
echo "Demo ready in $ROOT/demo-out"

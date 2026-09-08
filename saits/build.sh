#!/usr/bin/env bash
# ============================================================
# build.sh — собирает все три лендинга в production (dist/)
#
# vite build для каждого сайта (8 страниц + assets в dist/).
# Запуск:  ./build.sh
# ============================================================
set -euo pipefail

SAITS_DIR="$(cd "$(dirname "$0")" && pwd)"

log() { printf "\033[32m[build]\033[0m %s\n" "$*"; }
err() { printf "\033[31m[err]\033[0m %s\n" "$*" >&2; }

for site in sait-00 sait-01 sait-02; do
  dir="$SAITS_DIR/$site"
  if [ ! -d "$dir/node_modules" ]; then
    log "Installing deps for $site..."
    (cd "$dir" && npm install --silent)
  fi

  log "Building $site ..."
  if ! (cd "$dir" && npm run build); then
    err "Build failed for $site"
    exit 1
  fi
done

echo ""
log "Build complete:"
log "  sait-00  →  $SAITS_DIR/sait-00/dist"
log "  sait-01  →  $SAITS_DIR/sait-01/dist"
log "  sait-02  →  $SAITS_DIR/sait-02/dist"
echo ""
log "To preview built sites, run:  npx vite preview --port 8000 (inside each site dir)"

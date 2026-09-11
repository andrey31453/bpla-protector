#!/usr/bin/env bash
# ============================================================
# build.sh — собирает все сайты (sait-00 … sait-12) в production (dist/)
#
# Vite-сайты собираются с --base=./ (относительные пути),
# Gulp-сайты — через `npx gulp build`. После сборки запускается
# fix-paths.mjs, который переводит абсолютные пути в относительные,
# чтобы сайты открывались из подпапки (GitHub Pages).
#
# Запуск:  ./build.sh
# ============================================================
set -euo pipefail

SAITS_DIR="$(cd "$(dirname "$0")" && pwd)"

log() { printf "\033[32m[build]\033[0m %s\n" "$*"; }
err() { printf "\033[31m[err]\033[0m %s\n" "$*" >&2; }

for dir in "$SAITS_DIR"/sait-*; do
  [ -d "$dir" ] || continue
  site="$(basename "$dir")"

  if [ ! -d "$dir/node_modules" ]; then
    log "Installing deps for $site ..."
    (cd "$dir" && npm install --no-audit --no-fund)
  fi

  if [ -f "$dir/vite.config.js" ]; then
    log "Building $site (vite) ..."
    (cd "$dir" && npx vite build --base=./) || { err "Build failed for $site"; exit 1; }
  elif [ -f "$dir/gulpfile.js" ]; then
    log "Building $site (gulp) ..."
    (cd "$dir" && npx gulp build) || { err "Build failed for $site"; exit 1; }
  else
    err "Unknown build type for $site (no vite.config.js / gulpfile.js)"
    exit 1
  fi
done

log "Fixing absolute paths in dist/ ..."
node "$SAITS_DIR/fix-paths.mjs" "$SAITS_DIR"

echo ""
log "Build complete for all sites."
log "To assemble the deploy folder (hub + sites), run:"
log "  node \"$SAITS_DIR/assemble.mjs\" \"$SAITS_DIR\""

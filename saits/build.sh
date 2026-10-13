#!/usr/bin/env bash
# ============================================================
# build.sh — собирает сайты в production (dist/)
#
# Vite-сайты собираются с --base=./ (относительные пути),
# Gulp-сайты — через `npx gulp build`. После сборки запускается
# fix-paths.mjs, который переводит абсолютные пути в относительные,
# чтобы сайты открывались из подпапки (GitHub Pages).
#
# Запуск:  ./build.sh              # все сайты sait-*
#          ./build.sh sait-13      # только указанные сайты
#          ./build.sh sait-13 sait-01
# ============================================================
set -euo pipefail

SAITS_DIR="$(cd "$(dirname "$0")" && pwd)"

log() { printf "\033[32m[build]\033[0m %s\n" "$*"; }
err() { printf "\033[31m[err]\033[0m %s\n" "$*" >&2; }

# Без аргументов — все сайты по порядку номеров; с аргументами — только они
# (так workflow выкладки на хостинг собирает один сайт, см.
# .github/workflows/deploy-hosting.yml).
SITES=()
if [ "$#" -gt 0 ]; then
  for arg in "$@"; do
    case "$arg" in
      --help | -h)
        sed -n '2,14p' "$0"
        exit 0
        ;;
      -*) err "Неизвестный ключ: $arg"; exit 2 ;;
      *) SITES+=("$arg") ;;
    esac
  done
else
  for dir in "$SAITS_DIR"/sait-*; do
    [ -d "$dir" ] || continue
    SITES+=("$(basename "$dir")")
  done
fi

[ "${#SITES[@]}" -gt 0 ] || { err "Не нашлось ни одного сайта"; exit 1; }

for site in "${SITES[@]}"; do
  dir="$SAITS_DIR/$site"
  [ -d "$dir" ] || { err "Нет такого сайта: $dir"; exit 1; }

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
node "$SAITS_DIR/fix-paths.mjs" "$SAITS_DIR" "${SITES[@]}"

echo ""
log "Build complete: ${SITES[*]}"
log "To assemble the deploy folder (hub + sites), run:"
log "  node \"$SAITS_DIR/assemble.mjs\" \"$SAITS_DIR\""

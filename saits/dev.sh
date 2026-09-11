#!/usr/bin/env bash
# ============================================================
# dev.sh — запускает все лендинги (sait-00 … sait-13) в dev-режиме параллельно
#
# sait-00 → http://localhost:8000
# sait-01 → http://localhost:8001
# ...
# sait-13 → http://localhost:8013
#
# Запуск:  ./dev.sh
# Стоп:    Ctrl+C (убивает все дочерние процессы)
# ============================================================
set -euo pipefail

SAITS_DIR="$(cd "$(dirname "$0")" && pwd)"

# --- helpers ---
log() { printf "\033[32m[dev]\033[0m %s\n" "$*"; }
err() { printf "\033[31m[err]\033[0m %s\n" "$*" >&2; }

FIRST=0
LAST=13

# --- check node_modules ---
for n in $(seq -w "$FIRST" "$LAST"); do
  site="sait-$n"
  dir="$SAITS_DIR/$site"
  [ -d "$dir" ] || { err "Skip (not found): $dir"; continue; }
  if [ ! -d "$dir/node_modules" ]; then
    log "Installing deps for $site..."
    (cd "$dir" && npm install --silent)
  fi
done

# --- cleanup on exit ---
cleanup() {
  log "Stopping all dev servers..."
  kill 0 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# --- run all sites in background ---
PIDS=()
for n in $(seq -w "$FIRST" "$LAST"); do
  site="sait-$n"
  dir="$SAITS_DIR/$site"
  [ -d "$dir" ] || continue
  port=$((8000 + 10#$n))
  log "Starting $site on http://localhost:$port ..."
  (cd "$dir" && npm run dev) &
  PIDS+=("$!")
done

echo ""
log "All dev servers running:"
for n in $(seq -w "$FIRST" "$LAST"); do
  site="sait-$n"
  dir="$SAITS_DIR/$site"
  [ -d "$dir" ] || continue
  port=$((8000 + 10#$n))
  log "  $site  →  http://localhost:$port"
done
echo ""
log "Press Ctrl+C to stop all."
echo ""

# wait for any child to exit (error or manual kill)
wait "${PIDS[@]}"

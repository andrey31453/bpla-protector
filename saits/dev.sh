#!/usr/bin/env bash
# ============================================================
# dev.sh — запускает все три лендинга в dev-режиме параллельно
#
# sait-00 → http://localhost:8000  (ЗОК-ИНЖИНИРИНГ, тёмная тема)
# sait-01 → http://localhost:8001  (ЗОК-ШИЛД, тёмная + акцент)
# sait-02 → http://localhost:8002  (БАСТИОН · ЗОК, olive-тема)
#
# Запуск:  ./dev.sh
# Стоп:    Ctrl+C (убивает все дочерние процессы)
# ============================================================
set -euo pipefail

SAITS_DIR="$(cd "$(dirname "$0")" && pwd)"

# --- helpers ---
log() { printf "\033[32m[dev]\033[0m %s\n" "$*"; }
err() { printf "\033[31m[err]\033[0m %s\n" "$*" >&2; }

# --- check node_modules ---
for site in sait-00 sait-01 sait-02; do
  dir="$SAITS_DIR/$site"
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

# --- run all three in background ---
log "Starting sait-00 on http://localhost:8000 ..."
(cd "$SAITS_DIR/sait-00" && npm run dev) &
PID0=$!

log "Starting sait-01 on http://localhost:8001 ..."
(cd "$SAITS_DIR/sait-01" && npm run dev) &
PID1=$!

log "Starting sait-02 on http://localhost:8002 ..."
(cd "$SAITS_DIR/sait-02" && npm run dev) &
PID2=$!

echo ""
log "All dev servers running:"
log "  sait-00  →  http://localhost:8000"
log "  sait-01  →  http://localhost:8001"
log "  sait-02  →  http://localhost:8002"
echo ""
log "Press Ctrl+C to stop all."
echo ""

# wait for any child to exit (error or manual kill)
wait $PID0 $PID1 $PID2

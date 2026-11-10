#!/usr/bin/env bash
# ============================================================
# bootstrap.sh — разовая (и безопасно повторяемая) подготовка VPS под сайт.
#
# Что делает:
#   1) ставит nginx, rsync, curl, ufw, fail2ban (если чего-то ещё нет);
#   2) создаёт документ-рут /var/www/site;
#   3) включает конфиг nginx из этого же каталога (deploy/nginx/site.conf)
#      и убирает стандартную заглушку Debian;
#   4) открывает 22, 80, 443 в firewall;
#   5) включает nginx и fail2ban в автозапуск и проверяет ответ локально.
#
# Запуск на сервере от root. Скрипт копируется вместе с конфигом nginx:
#
#   scp -r saits/sait-13/deploy root@177.177.212.73:/root/site-deploy
#   ssh root@177.177.212.73 'bash /root/site-deploy/bootstrap.sh'
#
# Повторный запуск ничего не ломает: пакеты уже стоят, каталог уже есть,
# симлинк пересоздаётся, nginx перезагружается только после успешного nginx -t.
#
# ВАЖНО про firewall: скрипт открывает SSH-порт 22. Если sshd слушает другой
# порт, задайте его перед запуском: SSH_PORT=2222 bash bootstrap.sh
# ============================================================
set -euo pipefail

DOCROOT="${DOCROOT:-/var/www/site}"
SSH_PORT="${SSH_PORT:-22}"
CONF_NAME="site.conf"
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONF_SRC="${DEPLOY_DIR}/nginx/${CONF_NAME}"

log() { printf '\n== %s\n' "$*"; }
err() { printf '\n!! %s\n' "$*" >&2; }

if [ "$(id -u)" != "0" ]; then
  err "запускать от root: sudo bash $0"
  exit 1
fi

if [ ! -f "$CONF_SRC" ]; then
  err "не найден конфиг nginx: ${CONF_SRC} — копируйте каталог deploy целиком"
  exit 1
fi

log "Пакеты"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx rsync curl ufw fail2ban ca-certificates

log "Документ-рут ${DOCROOT}"
install -d -m 755 -o root -g root "$DOCROOT"

log "Конфиг nginx"
install -m 644 "$CONF_SRC" "/etc/nginx/sites-available/${CONF_NAME}"
ln -sfn "/etc/nginx/sites-available/${CONF_NAME}" "/etc/nginx/sites-enabled/${CONF_NAME}"
# Заглушка Debian отвечает на любой Host и перехватила бы запросы к сайту.
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable --now nginx
systemctl reload nginx

log "Firewall"
ufw allow "${SSH_PORT}/tcp"
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose

log "fail2ban"
systemctl enable --now fail2ban

log "Проверка"
if curl -fsS -o /dev/null -w 'HTTP %{http_code} на http://127.0.0.1/\n' http://127.0.0.1/; then
  log "Готово: nginx отдаёт ${DOCROOT}"
else
  err "nginx не ответил на 127.0.0.1 — смотрите: systemctl status nginx, tail -n 50 /var/log/nginx/site.error.log"
  exit 1
fi

#!/usr/bin/env bash
# ============================================================
# bootstrap.sh — разовая (и безопасно повторяемая) подготовка VPS под сайт.
#
# Что делает:
#   1) ставит nginx, rsync, curl, openssl, ufw, fail2ban (если чего-то нет);
#   2) создаёт документ-рут /var/www/site;
#   3) включает HTTPS: deploy/install-tls.sh кладёт сертификат zok.pro и ставит
#      конфиг nginx (сайт по HTTP и HTTPS, редирект http → https);
#   4) открывает 22, 80, 443 в firewall;
#   5) включает nginx и fail2ban в автозапуск и проверяет ответы локально.
#
# Запуск на сервере от root. Скрипт копируется вместе с каталогом deploy и
# файлами сертификата — конфиг nginx и сертификат ставит install-tls.sh,
# вручную в /etc/nginx ничего не копируется:
#
#   scp -r saits/sait-13/deploy zok_pro.crt zok_pro.key root@177.177.212.73:/root/
#   ssh root@177.177.212.73 \
#     'TLS_CERT=/root/zok_pro.crt TLS_KEY=/root/zok_pro.key bash /root/deploy/bootstrap.sh'
#
# Если сертификат уже установлен (/etc/ssl/zok.pro/), аргументы не нужны:
#
#   ssh root@177.177.212.73 'bash /root/deploy/bootstrap.sh'
#
# Повторный запуск ничего не ломает: пакеты уже стоят, каталог уже есть,
# симлинк пересоздаётся, nginx перезагружается только после успешного
# `nginx -t`, а установка сертификата идемпотентна.
#
# ВАЖНО про firewall: скрипт открывает SSH-порт 22. Если sshd слушает другой
# порт, задайте его перед запуском: SSH_PORT=2222 bash bootstrap.sh
# ============================================================
set -euo pipefail

DOCROOT="${DOCROOT:-/var/www/site}"
SSH_PORT="${SSH_PORT:-22}"
SSL_DIR="${SSL_DIR:-/etc/ssl/zok.pro}"
TLS_CERT="${TLS_CERT:-}"
TLS_KEY="${TLS_KEY:-}"
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TLS_SCRIPT="${DEPLOY_DIR}/install-tls.sh"

log() { printf '\n== %s\n' "$*"; }
err() { printf '\n!! %s\n' "$*" >&2; }

if [ "$(id -u)" != "0" ]; then
  err "запускать от root: sudo bash $0"
  exit 1
fi

if [ ! -f "$TLS_SCRIPT" ]; then
  err "не найден ${TLS_SCRIPT} — копируйте каталог deploy целиком"
  exit 1
fi

# Сертификат нужен до установки конфига: в site.conf есть блок :443, и без
# файлов /etc/ssl/zok.pro/* проверка конфига не пройдёт. Проверяем заранее,
# чтобы не ставить пакеты ради сообщения об ошибке в конце.
if [ -z "$TLS_CERT" ] && [ -z "$TLS_KEY" ]; then
  if [ -f "${SSL_DIR}/fullchain.pem" ] && [ -f "${SSL_DIR}/privkey.pem" ]; then
    TLS_CERT="${SSL_DIR}/fullchain.pem"
    TLS_KEY="${SSL_DIR}/privkey.pem"
  else
    err "сертификата нет: ${SSL_DIR}/{fullchain,privkey}.pem отсутствуют.
   Скопируйте сертификат и ключ на сервер и укажите их:
   scp zok_pro.crt zok_pro.key root@<сервер>:/root/
   ssh root@<сервер> 'TLS_CERT=/root/zok_pro.crt TLS_KEY=/root/zok_pro.key bash ${TLS_SCRIPT}'
   Затем повторите bootstrap.sh — или сразу запустите install-tls.sh, он ставит
   и конфиг nginx, и HTTPS (deploy/README.md, раздел 5)."
    exit 1
  fi
else
  [ -n "$TLS_CERT" ] && [ -n "$TLS_KEY" ] || {
    err "нужны оба файла: TLS_CERT=… TLS_KEY=… bash bootstrap.sh"
    exit 1
  }
fi

log "Пакеты"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx rsync curl openssl ufw fail2ban ca-certificates

log "Документ-рут ${DOCROOT}"
install -d -m 755 -o root -g root "$DOCROOT"
if [ "$DOCROOT" != "/var/www/site" ]; then
  # Конфиг nginx адресует корень как /var/www/site: другой DOCROOT надо
  # переписать в nginx/site-common.conf, иначе nginx будет искать файлы не там.
  err "DOCROOT=${DOCROOT} задан, но nginx/site-common.conf указывает root /var/www/site — поправьте конфиг или оставьте DOCROOT по умолчанию"
fi

log "HTTPS: сертификат и конфиг nginx"
bash "$TLS_SCRIPT" "$TLS_CERT" "$TLS_KEY"

log "Firewall"
ufw allow "${SSH_PORT}/tcp"
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose

log "fail2ban"
systemctl enable --now fail2ban

log "Проверка"
if curl -fsS -o /dev/null -w 'HTTP %{http_code} на http://127.0.0.1/\n' http://127.0.0.1/ &&
  curl -fsS -o /dev/null -w 'HTTPS %{http_code} на https://zok.pro/ (через 127.0.0.1)\n' \
    --resolve zok.pro:443:127.0.0.1 https://zok.pro/; then
  log "Готово: nginx отдаёт ${DOCROOT} по HTTP и HTTPS"
  printf 'Проверка снаружи: ./saits/sait-13/deploy/check-live.sh (с машины разработчика)\n'
else
  err "nginx не ответил на 127.0.0.1 — смотрите: systemctl status nginx, tail -n 50 /var/log/nginx/site.error.log"
  exit 1
fi

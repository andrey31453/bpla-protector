#!/usr/bin/env bash
# ============================================================
# install-tls.sh — включает HTTPS на сервере: кладёт сертификат zok.pro,
# ставит конфиг nginx (сайт по HTTP и HTTPS) и проверяет результат.
#
# Запуск на сервере от root. Скрипт копируется вместе с каталогом deploy:
#
#   scp -r saits/sait-13/deploy zok_pro.crt zok_pro.key root@177.177.212.73:/root/
#   ssh root@177.177.212.73 'bash /root/deploy/install-tls.sh /root/zok_pro.crt /root/zok_pro.key'
#
# Без аргументов скрипт берёт уже установленные файлы (/etc/ssl/zok.pro/) и
# переустанавливает только конфиг nginx — это же запускать после правки
# nginx/site.conf или nginx/site-common.conf в репозитории.
#
# Что проверяется до установки (чтобы не отдать в интернет битый TLS):
#   - ключ читается и является приватным ключом;
#   - ключ подходит к сертификату (совпадает публичная часть);
#   - в SAN сертификата есть zok.pro (иначе браузеры покажут ошибку);
#   - срок действия: меньше 30 дней — предупреждение;
#   - цепочка проверяется системным хранилищем (иначе — предупреждение).
#
# Полный сертификат собирается из присланного .crt так: лист + промежуточный
# сертификат. Самоподписанный корневой сертификат (GlobalSign Root R46) из
# файла выбрасывается: браузеры его не используют, а лишний сертификат в
# цепочке только раздувает handshake.
#
# Повторный запуск безопасен: файлы перезаписываются, конфиг бэкапится в
# /etc/nginx/backup-<дата>/, nginx перезагружается только после успешного
# `nginx -t`, а если проверка конфига не прошла — возвращается предыдущий.
#
# Приватный ключ в репозиторий не попадает: docs/ssl/ в .gitignore, на сервер
# файлы передаются командой scp (deploy/README.md, раздел 5).
# ============================================================
set -euo pipefail

DOMAIN="${DOMAIN:-zok.pro}"
WWW="www.${DOMAIN}"

SSL_DIR="${SSL_DIR:-/etc/ssl/${DOMAIN}}"
CERT_DST="${SSL_DIR}/fullchain.pem"
KEY_DST="${SSL_DIR}/privkey.pem"

NGINX_SITES_AVAILABLE="${NGINX_SITES_AVAILABLE:-/etc/nginx/sites-available}"
NGINX_SITES_ENABLED="${NGINX_SITES_ENABLED:-/etc/nginx/sites-enabled}"
NGINX_SNIPPETS="${NGINX_SNIPPETS:-/etc/nginx/snippets}"

# Системное хранилище корневых сертификатов: им проверяется цепочка. На Debian
# и Ubuntu это ca-certificates; путь можно переопределить, если он другой.
CA_FILE="${CA_FILE:-/etc/ssl/certs/ca-certificates.crt}"

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONF_SRC="${DEPLOY_DIR}/nginx/site.conf"
COMMON_SRC="${DEPLOY_DIR}/nginx/site-common.conf"

CERT_SRC="${1:-}"
KEY_SRC="${2:-}"

TMP_DIR="$(mktemp -d)"
cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

log() { printf '\n== %s\n' "$*"; }
err() { printf '\n!! %s\n' "$*" >&2; }
die() {
  err "$*"
  exit 1
}

# ---------- проверки окружения ----------
[ "$(id -u)" = "0" ] || die "запускать от root: sudo bash $0 /path/zok_pro.crt /path/zok_pro.key"
command -v nginx >/dev/null 2>&1 || die "nginx не установлен: сначала deploy/bootstrap.sh"
command -v openssl >/dev/null 2>&1 || die "openssl не установлен: apt-get install -y openssl"

for f in "$CONF_SRC" "$COMMON_SRC"; do
  [ -f "$f" ] || die "не найден ${f} — копируйте каталог deploy целиком"
done

# Источник сертификата: аргументы, а если их нет — уже установленные файлы
# (переустановка одного конфига, без повторной передачи ключа).
if [ -z "$CERT_SRC" ] && [ -z "$KEY_SRC" ]; then
  [ -f "$CERT_DST" ] && [ -f "$KEY_DST" ] ||
    die "сертификат не установлен: bash $0 /path/zok_pro.crt /path/zok_pro.key"
  log "Сертификат и ключ уже лежат в ${SSL_DIR} — переустанавливаю только конфиг nginx"
else
  [ -n "$CERT_SRC" ] && [ -n "$KEY_SRC" ] ||
    die "нужны оба файла: bash $0 /path/zok_pro.crt /path/zok_pro.key"
  [ -f "$CERT_SRC" ] || die "не найден файл сертификата: ${CERT_SRC}"
  [ -f "$KEY_SRC" ] || die "не найден файл ключа: ${KEY_SRC}"
fi

# ---------- 1. Ключ и сертификат: годность, пара, домен, срок ----------
if [ -n "$CERT_SRC" ]; then
  log "Проверка ключа"
  openssl pkey -in "$KEY_SRC" -noout >/dev/null 2>&1 ||
    die "${KEY_SRC} — не читается как приватный ключ (или он под паролем: nginx такие ключи не принимает)"

  # Разбор присланного бандла: сертификаты по одному, в исходном порядке.
  awk -v dir="$TMP_DIR" '
    /-----BEGIN CERTIFICATE-----/ { n++; f = sprintf("%s/cert-%03d.pem", dir, n) }
    f { print > f }
    /-----END CERTIFICATE-----/ { f = "" }
  ' "$CERT_SRC"
  cert_count="$(find "$TMP_DIR" -name 'cert-*.pem' | wc -l | tr -d ' ')"
  [ "$cert_count" -ge 1 ] ||
    die "в ${CERT_SRC} нет ни одного сертификата (ожидается PEM: -----BEGIN CERTIFICATE-----)"

  LEAF="${TMP_DIR}/cert-001.pem"
  CHAIN="${TMP_DIR}/chain.pem"
  : >"$CHAIN"
  skipped=""
  for f in "$TMP_DIR"/cert-*.pem; do
    [ "$f" = "$LEAF" ] && continue
    subj_c="$(openssl x509 -in "$f" -noout -subject -nameopt RFC2253)"
    issu_c="$(openssl x509 -in "$f" -noout -issuer -nameopt RFC2253)"
    if [ "${subj_c#subject=}" = "${issu_c#issuer=}" ]; then
      # Самоподписанный корневой сертификат: в цепочку не идёт.
      skipped="$(basename "$f")"
      continue
    fi
    cat "$f" >>"$CHAIN"
  done

  log "Проверка пары «сертификат + ключ»"
  cert_pub="$(openssl x509 -in "$LEAF" -noout -pubkey)"
  key_pub="$(openssl pkey -in "$KEY_SRC" -pubout)"
  [ "$cert_pub" = "$key_pub" ] ||
    die "ключ ${KEY_SRC} не подходит к сертификату ${CERT_SRC}: перепутаны файлы или выбран другой сертификат"

  log "Проверка имён в сертификате"
  san="$(openssl x509 -in "$LEAF" -noout -ext subjectAltName 2>/dev/null || true)"
  case "$san" in
    *"DNS:${DOMAIN}"*) log "SAN содержит ${DOMAIN}" ;;
    *)
      subj_c="$(openssl x509 -in "$LEAF" -noout -subject)"
      die "в сертификате нет имени ${DOMAIN} — браузер покажет ошибку. Subject: ${subj_c:-?}; SAN: ${san:-не читается}"
      ;;
  esac

  log "Срок действия"
  end_date="$(openssl x509 -in "$LEAF" -noout -enddate | cut -d= -f2)"
  printf '   сертификат действует до: %s\n' "$end_date"
  if openssl x509 -in "$LEAF" -noout -checkend 2592000 >/dev/null 2>&1; then
    printf '   до истечения больше 30 дней — продление не срочно\n'
  else
    err "сертификат истекает в течение 30 дней (${end_date}). Перевыпустите его и запустите скрипт ещё раз: deploy/README.md, раздел 5"
  fi

  log "Проверка цепочки"
  if [ -s "$CHAIN" ] && openssl verify -CAfile "$CA_FILE" \
    -untrusted "$CHAIN" "$LEAF" >/dev/null 2>&1; then
    log "Цепочка проходит проверку системным хранилищем"
  else
    err "цепочка не проверяется системным хранилищем ${CA_FILE}:
   в ${CERT_SRC} должен быть лист + промежуточный сертификат. HTTPS включится,
   но браузеры могут ругаться на неполную цепочку — посмотрите вывод:
   openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} -showcerts </dev/null"
  fi

  if [ -n "$skipped" ]; then
    log "Корневой сертификат в цепочку не включается ($skipped) — это норма"
  fi

  # Итоговый fullchain: лист + промежуточные, корень выброшен.
  cat "$LEAF" "$CHAIN" >"${TMP_DIR}/fullchain.pem"
fi


# ---------- 2. Установка файлов сертификата ----------
log "Установка сертификата в ${SSL_DIR}"
install -d -m 755 -o root -g root "$SSL_DIR"

if [ -n "$CERT_SRC" ]; then
  # Если файл уже лежит в /etc/ssl/zok.pro и передан этим же путём, install
  # скопировал бы файл сам в себя и упал — такие случаи просто пропускаем.
  if [ "$(readlink -f "$CERT_SRC")" != "$(readlink -f "$CERT_DST")" ]; then
    install -m 644 -o root -g root "${TMP_DIR}/fullchain.pem" "$CERT_DST"
  fi
  if [ "$(readlink -f "$KEY_SRC")" != "$(readlink -f "$KEY_DST")" ]; then
    install -m 600 -o root -g root "$KEY_SRC" "$KEY_DST"
  fi
fi

# Права выставляются всегда: у ключа не должно быть ни группы, ни «мира».
chown root:root "$CERT_DST" "$KEY_DST"
chmod 644 "$CERT_DST"
chmod 600 "$KEY_DST"
printf '   %s (644 root:root)\n   %s (600 root:root)\n' "$CERT_DST" "$KEY_DST"

# ---------- 3. Конфиг nginx с бэкапом ----------
stamp="$(date +%Y%m%d-%H%M%S)"
# Рядом с sites-available: по умолчанию /etc/nginx/backup-<штамп>/, и тот же
# каталог, если пути nginx переопределены.
BACKUP_DIR="$(dirname "$NGINX_SITES_AVAILABLE")/backup-${stamp}"

backup_file() { # $1 — существующий файл, $2 — имя копии в бэкапе
  [ -f "$1" ] || return 0
  install -d -m 700 "$BACKUP_DIR"
  cp -a "$1" "$2"
}

log "Установка конфига nginx"
install -d -m 755 "$NGINX_SITES_AVAILABLE" "$NGINX_SITES_ENABLED" "$NGINX_SNIPPETS"
# Каталог для проверок домена (/.well-known/acme-challenge/ в site.conf):
# отдаётся по HTTP без редиректа, чтобы проверка не ломалась при смене CA.
install -d -m 755 /var/www/acme
backup_file "${NGINX_SITES_AVAILABLE}/site.conf" "${BACKUP_DIR}/site.conf"
backup_file "${NGINX_SNIPPETS}/site-common.conf" "${BACKUP_DIR}/site-common.conf"

install -m 644 -o root -g root "$CONF_SRC" "${NGINX_SITES_AVAILABLE}/site.conf"
install -m 644 -o root -g root "$COMMON_SRC" "${NGINX_SNIPPETS}/site-common.conf"
ln -sfn "${NGINX_SITES_AVAILABLE}/site.conf" "${NGINX_SITES_ENABLED}/site.conf"
# Заглушка Debian отвечает на любой Host и перехватила бы запросы к сайту.
rm -f "${NGINX_SITES_ENABLED}/default"

log "Проверка конфигурации nginx"
if ! nginx -t; then
  err "конфиг не прошёл проверку — возвращаю предыдущий"
  if [ -f "${BACKUP_DIR}/site.conf" ]; then
    cp -a "${BACKUP_DIR}/site.conf" "${NGINX_SITES_AVAILABLE}/site.conf"
  fi
  if [ -f "${BACKUP_DIR}/site-common.conf" ]; then
    cp -a "${BACKUP_DIR}/site-common.conf" "${NGINX_SNIPPETS}/site-common.conf"
  fi
  nginx -t || true
  err "конфиг откачен; причина выше (частые: порт 443 занят другой службой, нет файла сертификата)"
  exit 1
fi

systemctl enable --now nginx
systemctl reload nginx
log "nginx перезагружен"

# ---------- 4. Проверка результата ----------
# Запросы идут на 127.0.0.1 с --resolve: проверяется именно этот сервер, а не
# DNS и не промежуточный прокси.
#
# `systemctl reload nginx` возвращает управление раньше, чем новые воркеры
# начнут обслуживать запросы, поэтому первая попытка может попасть на старый
# конфиг (например, http отдаст 200 вместо 301). Поэтому код читается с
# повторами: до 5 попыток с интервалом 1 с, $4 — ожидаемый код.
http_code() {
  local scheme="$1" host="$2" port="$3" expect="$4" code=""
  for _ in 1 2 3 4 5; do
    code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
      --resolve "${host}:${port}:127.0.0.1" "${scheme}://${host}/" || true)"
    case "$code" in
      $expect) break ;;
    esac
    sleep 1
  done
  printf '%s' "$code"
}

log "Проверка HTTPS локально (--resolve на 127.0.0.1)"
checks_ok=1

https_code="$(http_code https "$DOMAIN" 443 '200')"
if [ "$https_code" = "200" ]; then
  printf '   https://%s/ — 200\n' "$DOMAIN"
else
  printf '   https://%s/ — код %s (ожидался 200: /var/log/nginx/site.error.log)\n' "$DOMAIN" "${https_code:-000}"
  checks_ok=0
fi

redirect_code="$(http_code http "$DOMAIN" 80 '301')"
if [ "$redirect_code" = "301" ]; then
  printf '   http://%s/ — 301 на HTTPS\n' "$DOMAIN"
else
  printf '   http://%s/ — код %s (ожидался 301)\n' "$DOMAIN" "${redirect_code:-000}"
  checks_ok=0
fi

www_code="$(http_code https "$WWW" 443 '301')"
printf '   https://%s/ — код %s (ожидался 301 → https://%s/)\n' "$WWW" "${www_code:-000}" "$DOMAIN"
if [ "$www_code" != "301" ]; then
  checks_ok=0
fi

served_end="$(echo | openssl s_client -connect 127.0.0.1:443 -servername "$DOMAIN" 2>/dev/null |
  openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || true)"
if [ -n "$served_end" ]; then
  printf '   nginx отдаёт сертификат, действующий до: %s\n' "$served_end"
fi

if [ "$checks_ok" = "1" ]; then
  log "Готово: HTTPS включён, http://${DOMAIN} редиректит на https://${DOMAIN}"
  printf '\nПроверка снаружи (с машины разработчика): ./saits/sait-13/deploy/check-live.sh\n'
else
  err "nginx перезагружен, но проверка не прошла — смотрите /var/log/nginx/site.error.log и systemctl status nginx"
  exit 1
fi


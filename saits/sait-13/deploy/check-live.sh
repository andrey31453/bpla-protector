#!/usr/bin/env bash
# ============================================================
# check-live.sh — «почему домен не открывается»: одна команда, пять проверок.
#
# Смотрит на сайт снаружи, без доступа к серверу (только dig/curl/node):
#   1) DNS: куда указывает A-запись боевого домена и совпадает ли она
#      с адресом сервера из hosting.json;
#   2) сервер по IP: отвечает ли nginx по HTTP (то есть запущен ли он
#      и открыт ли 80-й порт в firewall);
#   3) домен: http и https — привязка, сертификат, редирект;
#   4) закрытие от индексации: X-Robots-Tag и robots.txt — стейдж это
#      или боевой режим (поле staging в hosting.json);
#   5) canonical в отданном index.html — какой адрес сайт считает своим.
#
# Ничего не меняет и ничего не выкладывает, учётных данных не требует.
# Адрес сервера, домен, publicUrl и staging берутся из конфигов сайта
# (saits/sait-13/hosting.json, src/data/site.json), а не задаются в скрипте.
#
# Запуск:      ./saits/sait-13/deploy/check-live.sh
# Код выхода:  0 — всё на месте, 1 — есть проблемы (печатается, что именно).
#
# Что делать с найденным — saits/sait-13/deploy/README.md, раздел «Диагностика».
# ============================================================
set -uo pipefail

SITE="sait-13"
DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="$(cd "${DEPLOY_DIR}/.." && pwd)"
SAITS_DIR="$(cd "${SITE_DIR}/.." && pwd)"

problems=0

ok() { printf '[ok]   %s\n' "$*"; }
warn() { printf '[!]    %s\n' "$*"; }
bad() {
  printf '[FAIL] %s\n' "$*"
  problems=$((problems + 1))
}
step() { printf '\n== %s\n' "$*"; }

for tool in node curl; do
  command -v "$tool" >/dev/null 2>&1 || {
    printf '[FAIL] не найден %s: без него проверка не запустится\n' "$tool" >&2
    exit 1
  }
done

# ---------- конфиги сайта: единственный источник адресов ----------
if ! config_env="$(node "${SAITS_DIR}/hosting-list.mjs" --format env --site "${SITE}")"; then
  printf '[FAIL] не читается saits/%s/hosting.json (см. сообщение выше)\n' "$SITE" >&2
  exit 1
fi
eval "$config_env"

site_json="${SITE_DIR}/src/data/site.json"
DOMAIN="$(node -e '
const { readFileSync } = require("node:fs")
try {
  const site = JSON.parse(readFileSync(process.argv[1], "utf8"))
  process.stdout.write(new URL(site.baseUrl).hostname)
} catch {
  process.exit(1)
}' "$site_json")" || {
  printf '[FAIL] в %s нет корректного baseUrl — не понять боевой домен сайта\n' "$site_json" >&2
  exit 1
}

printf 'Сайт:        %s\n' "$SITE"
printf 'Сервер:      %s:%s (%s)\n' "$HOSTING_HOST" "$HOSTING_PORT" "$HOSTING_TRANSPORT"
printf 'Домен:       %s\n' "$DOMAIN"
printf 'Проверка:    %s\n' "${HOSTING_PUBLIC_URL:-по IP}"
printf 'Режим:       %s\n' "$(
  [ "$HOSTING_STAGING" = "yes" ] && printf 'стейдж — noindex, закрытый robots.txt' || printf 'боевой — индексация открыта'
)"


# A-запись домена: dig есть не везде, дальше — host и getent. Повторяем попытку:
# публичный DNS иногда не отвечает с первого раза, и одна осечка не должна
# превращаться в вывод «домена нет».
resolve_a() {
  local name="$1" attempt out=""
  for attempt in 1 2 3; do
    out=""
    if command -v dig >/dev/null 2>&1; then
      out="$(dig +short A "$name" 2>/dev/null | grep -E '^([0-9]{1,3}\.){3}[0-9]{1,3}$' | tail -n 1)"
    fi
    if [ -z "$out" ] && command -v host >/dev/null 2>&1; then
      out="$(host -t A "$name" 2>/dev/null | awk '/has address/{print $NF; exit}')"
    fi
    if [ -z "$out" ] && command -v getent >/dev/null 2>&1; then
      out="$(getent ahostsv4 "$name" 2>/dev/null | awk 'NR==1{print $1}')"
    fi
    [ -n "$out" ] && break
    sleep 1
  done
  printf '%s' "$out"
}

# HTTP-код ответа: 000 — соединения нет (порт закрыт, nginx не запущен).
http_code() {
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "$1" 2>/dev/null)"
  [ -n "$code" ] || code="000"
  printf '%s' "$code"
}

# Заголовки ответа с учётом редиректов.
http_headers() {
  curl -sS -I -L --max-time 15 "$1" 2>/dev/null
}

# ---------- 1. DNS ----------
step "1. DNS домена ${DOMAIN}"
domain_a="$(resolve_a "$DOMAIN")"
if [ -z "$domain_a" ]; then
  bad "A-запись ${DOMAIN} не находится: домен не привязан ни к какому серверу. Правка — у регистратора (A ${DOMAIN} → ${HOSTING_HOST})"
elif [ "$domain_a" = "$HOSTING_HOST" ]; then
  ok "A-запись ${DOMAIN} = ${domain_a} — это наш сервер"
else
  bad "A-запись ${DOMAIN} = ${domain_a}, а сервер сайта — ${HOSTING_HOST}: домен смотрит в другую сторону, поэтому по домену открывается чужая заглушка. Правка — у регистратора (A ${DOMAIN} → ${HOSTING_HOST}), затем подождать TTL (обычно минуты, максимум сутки)"
fi

# ---------- 2. Сервер по IP ----------
step "2. Сервер по IP ${HOSTING_HOST}"
ip_code="$(http_code "http://${HOSTING_HOST}/")"
case "$ip_code" in
  200) ok "http://${HOSTING_HOST}/ отвечает 200 — nginx отдаёт сайт" ;;
  000) bad "http://${HOSTING_HOST}/ не отвечает: 80-й порт закрыт или nginx не запущен. На сервере: systemctl status nginx, ufw status; если сервер ещё не готовили — deploy/bootstrap.sh (README, раздел 1)" ;;
  404) bad "http://${HOSTING_HOST}/ отдаёт 404 — nginx работает, но в документ-руте /var/www/site нет index.html: нужна выкладка (workflow deploy-hosting.yml или ./saits/hosting-deploy.sh ${SITE})" ;;
  *) bad "http://${HOSTING_HOST}/ ответил кодом ${ip_code} — смотрите /var/log/nginx/site.error.log на сервере" ;;
esac
if [ "$ip_code" != "000" ]; then
  https_ip_code="$(http_code "https://${HOSTING_HOST}/")"
  if [ "$https_ip_code" = "000" ]; then
    warn "https://${HOSTING_HOST}/ не отвечает — сертификата на IP нет и не будет: HTTPS включается только для домена (certbot --nginx -d ${DOMAIN})"
  else
    ok "https://${HOSTING_HOST}/ отвечает кодом ${https_ip_code}"
  fi
fi

# ---------- 3. Домен ----------
step "3. Домен ${DOMAIN}"
domain_http="$(http_code "http://${DOMAIN}/")"
domain_https="$(http_code "https://${DOMAIN}/")"
case "$domain_https" in
  200) ok "https://${DOMAIN}/ отвечает 200 — домен и сертификат на месте" ;;
  000) bad "https://${DOMAIN}/ не открывается: либо DNS ещё не привёл к серверу (проверка 1), либо сертификата нет — на сервере certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}. Проверка 2 покажет, жив ли сам сервер" ;;
  *) bad "https://${DOMAIN}/ ответил кодом ${domain_https}: смотрите nginx и сертификат на сервере (nginx -t, tail /var/log/nginx/site.error.log)" ;;
esac
if [ "$domain_http" = "301" ] || [ "$domain_http" = "308" ]; then
  ok "http://${DOMAIN}/ редиректит на HTTPS (${domain_http}) — как и должно быть после переезда"
elif [ "$domain_http" = "200" ] && [ "$domain_https" = "200" ]; then
  warn "http://${DOMAIN}/ отвечает 200 без редиректа на HTTPS — включите редирект (certbot --nginx это делает сам)"
elif [ "$domain_http" = "000" ]; then
  warn "http://${DOMAIN}/ не отвечает"
else
  warn "http://${DOMAIN}/ ответил кодом ${domain_http}"
fi

# ---------- 4. Индексация и стейдж ----------
step "4. Закрытие от индексации (staging: ${HOSTING_STAGING})"
probe_url="http://${HOSTING_HOST}/"
robots_header="$(http_headers "$probe_url" | grep -i '^x-robots-tag:' | tr -d '\r')"
robots_body="$(curl -sS --max-time 15 "${probe_url}robots.txt" 2>/dev/null)"
robots_txt="$(printf '%s' "$robots_body" | grep -iE '^(allow|disallow)' | head -n 3 | tr '\n' ' ' | sed 's/ *$//')"
# Состояние robots.txt: закрыт целиком (Disallow: /), открыт или недоступен.
if [ -z "$robots_body" ]; then
  robots_state="empty"
elif printf '%s' "$robots_body" | grep -qiE '^disallow:[[:space:]]*/[[:space:]]*$'; then
  robots_state="closed"
else
  robots_state="open"
fi
if [ "$HOSTING_STAGING" = "yes" ]; then
  if [ -n "$robots_header" ]; then
    ok "X-Robots-Tag на месте: ${robots_header#*: }"
  elif [ "$ip_code" = "000" ]; then
    warn "проверить X-Robots-Tag нельзя: ${probe_url} не ответил (сначала проверка 2)"
  else
    bad "X-Robots-Tag нет, а staging: true — стейдж-адрес попадёт в поиск. Проверьте строку add_header X-Robots-Tag в nginx/site.conf на сервере"
  fi
  case "$robots_state" in
    closed) ok "robots.txt закрыт: ${robots_txt}" ;;
    empty) warn "robots.txt не прочитан (сервер не ответил) — проверить после того, как поднимется nginx" ;;
    *) bad "robots.txt не закрыт (${robots_txt}), хотя staging: true — пересоберите сайт с SITE_STAGING=1" ;;
  esac
else
  if [ "$ip_code" = "000" ]; then
    warn "проверить X-Robots-Tag нельзя: ${probe_url} не ответил (сначала проверка 2)"
  elif [ -n "$robots_header" ]; then
    bad "на боевом режиме стоит ${robots_header#*: } — уберите строку add_header X-Robots-Tag из nginx/site.conf"
  else
    ok "X-Robots-Tag нет — индексация открыта"
  fi
  case "$robots_state" in
    empty) warn "robots.txt не прочитан (сервер не ответил)" ;;
    closed) bad "robots.txt закрыт (${robots_txt}), хотя staging: false — пересоберите сайт без SITE_STAGING" ;;
    *) ok "robots.txt открыт: ${robots_txt}" ;;
  esac
fi

# ---------- 5. canonical отданной страницы ----------
step "5. Canonical в отданном index.html"
canonical="$(curl -sS --max-time 15 "$probe_url" 2>/dev/null |
  grep -o 'rel="canonical" href="[^"]*"' | head -n 1 | sed 's/.*href="//; s/"$//')"
if [ -z "$canonical" ]; then
  warn "canonical не найден — страница не отдалась или собрана без него (проверка 2)"
elif [ "$HOSTING_STAGING" = "yes" ]; then
  staging_origin="${HOSTING_STAGING_BASE_URL%/}"
  case "$canonical" in
    "$staging_origin" | "$staging_origin"/*) ok "canonical = ${canonical} — временный адрес, боевой домен в поиск не уходит" ;;
    *) warn "canonical = ${canonical}, а на стейдже ожидается ${HOSTING_STAGING_BASE_URL} — проверьте SITE_BASE_URL в сборке" ;;
  esac
else
  case "$canonical" in
    https://"$DOMAIN" | https://"$DOMAIN"/*) ok "canonical = ${canonical} — боевой домен" ;;
    *) bad "canonical = ${canonical}, а боевой адрес — https://${DOMAIN}/: сборка шла с SITE_BASE_URL стейджа или со старым доменом" ;;
  esac
fi

# ---------- итог ----------
step "Итог"
if [ "$problems" -eq 0 ]; then
  printf 'Всё на месте: DNS смотрит на сервер, сайт отдаётся, режим индексации соответствует staging.\n'
  exit 0
fi
printf 'Проблем: %s. Что делать по каждой — saits/sait-13/deploy/README.md, раздел «Диагностика».\n' "$problems"
printf 'Порядок переезда: DNS → bootstrap/nginx → certbot → staging: false (README, разделы 1–5).\n'
exit 1

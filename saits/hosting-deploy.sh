#!/usr/bin/env bash
# ============================================================
# hosting-deploy.sh — выкладывает собранный сайт на хостинг (FTP/FTPS).
#
# Что нужно для запуска:
#   1) конфиг сайта — saits/sait-XX/hosting.json (адрес, логин, каталог,
#      имя секрета с паролем; сам пароль в репозитории не хранится);
#   2) собранный сайт — saits/sait-XX/dist (см. ./build.sh sait-XX);
#   3) установленный lftp;
#   4) пароль в переменной HOSTING_PASSWORD — в CI её подставляет workflow
#      .github/workflows/deploy-hosting.yml из GitHub-секрета.
#
# Запуск:  HOSTING_PASSWORD=… ./hosting-deploy.sh sait-13
#
# Пароль не печатается и не попадает в аргументы командной строки: lftp берёт
# его из переменной окружения LFTP_PASSWORD.
# ============================================================
set -euo pipefail

SAITS_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE="${1:-}"

log() { printf "\033[32m[deploy]\033[0m %s\n" "$*"; }
err() { printf "\033[31m[err]\033[0m %s\n" "$*" >&2; }

if [ -z "$SITE" ]; then
  err "Укажите сайт: ./hosting-deploy.sh sait-13"
  exit 2
fi

# Единственный источник настроек — конфиг самого сайта.
eval "$(node "$SAITS_DIR/hosting-list.mjs" --format env --site "$SITE")"

if ! command -v lftp >/dev/null 2>&1; then
  err "lftp не установлен (Debian/Ubuntu: apt-get install -y lftp; macOS: brew install lftp)"
  exit 1
fi

if [ ! -f "$HOSTING_DIST/index.html" ]; then
  err "Нет собранного сайта: $HOSTING_DIST/index.html — сначала соберите его: ./build.sh $SITE"
  exit 1
fi

if [ -z "${HOSTING_PASSWORD:-}" ]; then
  err "Не задан пароль для «$HOSTING_SITE». Положите его в GitHub-секрет «$HOSTING_SECRET» (Settings → Secrets and variables → Actions) или запустите локально: HOSTING_PASSWORD=… ./hosting-deploy.sh $SITE"
  exit 1
fi

# Служебные каталоги панели не зеркалим и не удаляем — их ведёт сама панель.
EXCLUDES=""
for pattern in $HOSTING_EXCLUDE; do
  EXCLUDES="$EXCLUDES --exclude-glob=$pattern"
done

# Удаляем на хостинге то, чего нет в dist/: иначе хешированные файлы прошлых
# сборок копятся и сайт занимает место мусором.
DELETE_FLAG=""
if [ "$HOSTING_DELETE" = "yes" ]; then
  DELETE_FLAG="--delete"
fi

# ftps — явный TLS поверх 21-го порта; ftp — без шифрования.
SSL_FORCE="no"
if [ "$HOSTING_PROTOCOL" = "ftps" ]; then
  SSL_FORCE="yes"
fi

log "$HOSTING_SITE → $HOSTING_PROTOCOL://$HOSTING_HOST:$HOSTING_PORT/$HOSTING_REMOTE_DIR"
log "источник: $HOSTING_DIST"

# Пароль передаётся переменной окружения LFTP_PASSWORD и включается ключом
# --env-password: без него lftp спросит пароль интерактивно и деплой в CI
# зависнет на запросе ввода. В аргументах командной строки пароль не светится.
#
# Команды идут одной строкой через ";": многострочный -e lftp завершает пустой
# командой ("Ambiguous command") и возвращает ошибку, хотя файлы уже переданы.
LFTP_COMMANDS="set cmd:fail-exit yes"
LFTP_COMMANDS+="; set net:max-retries 3"
LFTP_COMMANDS+="; set net:timeout 25"
LFTP_COMMANDS+="; set ftp:passive-mode true"
LFTP_COMMANDS+="; set ftp:use-mlsd true"
LFTP_COMMANDS+="; set ssl:verify-certificate $HOSTING_VERIFY_CERT"
LFTP_COMMANDS+="; set ftp:ssl-force $SSL_FORCE"
LFTP_COMMANDS+="; set ftp:ssl-protect-data $SSL_FORCE"
LFTP_COMMANDS+="; mirror -R $DELETE_FLAG --parallel=4 --verbose=1 $EXCLUDES $HOSTING_DIST $HOSTING_REMOTE_DIR"

LFTP_PASSWORD="$HOSTING_PASSWORD" lftp -u "$HOSTING_USER" --env-password "$HOSTING_HOST:$HOSTING_PORT" -e "$LFTP_COMMANDS"

log "Готово: $HOSTING_SITE выложен${HOSTING_PUBLIC_URL:+ — $HOSTING_PUBLIC_URL}"

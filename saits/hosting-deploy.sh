#!/usr/bin/env bash
# ============================================================
# hosting-deploy.sh — выкладывает собранный сайт на боевой сервер.
#
# Транспорт выбирается полем transport в saits/sait-XX/hosting.json:
#   ssh      — rsync поверх SSH в документ-рут nginx на нашем сервере;
#   ftp/ftps — зеркало lftp (прошлый хостинг, оставлено для отката).
#
# Что нужно для запуска:
#   1) конфиг сайта — saits/sait-XX/hosting.json (адрес, логин, каталог,
#      имя секрета с паролем или ключом; сами данные в репозитории не хранятся);
#   2) собранный сайт — saits/sait-XX/dist (см. ./build.sh sait-XX);
#   3) ssh: rsync + ssh + sshpass (если авторизуемся паролем); ftp: lftp;
#   4) учётные данные в переменной HOSTING_CREDENTIAL — в CI её подставляет
#      workflow .github/workflows/deploy-hosting.yml из GitHub-секрета.
#      Устаревшее имя HOSTING_PASSWORD тоже поддерживается.
#
# Запуск:  HOSTING_CREDENTIAL=… ./hosting-deploy.sh sait-13
#
# Учётные данные не печатаются и не попадают в аргументы командной строки:
# sshpass берёт пароль из переменной SSHPASS (ключ -e), lftp — из LFTP_PASSWORD.
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

# Наличие lftp/rsync проверяет уже выбранный транспорт (deploy_ftp / deploy_ssh):
# ssh-выкладке lftp не нужен и наоборот.
if [ ! -f "$HOSTING_DIST/index.html" ]; then
  err "Нет собранного сайта: ${HOSTING_DIST}/index.html — сначала соберите его: ./build.sh ${SITE}"
  exit 1
fi

# ---------- общее ----------
CREDENTIAL="${HOSTING_CREDENTIAL:-${HOSTING_PASSWORD:-}}"

# Подстановки в сообщениях — в фигурных скобках: в некоторых локалях (macOS,
# bash 3.2 + C.UTF-8) байты русской кавычки « прилипают к имени переменной и
# `set -u` роняет скрипт на «unbound variable» вместо понятного текста.
if [ -z "$CREDENTIAL" ]; then
  err "Не задан секрет для «${HOSTING_SITE}». Положите его в GitHub-секрет «${HOSTING_SECRET}» (Settings → Secrets and variables → Actions → Secrets, именно repository secret) или запустите локально: HOSTING_CREDENTIAL=… ./hosting-deploy.sh ${SITE}"
  exit 1
fi

# ---------- ssh: rsync в документ-рут nginx ----------
# Каждая выкладка приводит каталог сервера к состоянию dist/: файлы передаются
# с нормальными правами, лишнее (кеш прошлых сборок) удаляется при delete: true.
deploy_ssh() {
  command -v rsync >/dev/null 2>&1 || {
    err "rsync не установлен (Debian/Ubuntu: apt-get install -y rsync; macOS: brew install rsync)"
    exit 1
  }

  local -a tmp_files
  cleanup() {
    for f in "${tmp_files[@]+"${tmp_files[@]}"}"; do
      rm -f "$f"
    done
  }
  trap cleanup EXIT

  local -a ssh_opts
  ssh_opts=(
    -p "$HOSTING_PORT"
    -o ConnectTimeout=20
    -o ServerAliveInterval=15
    -o ServerAliveCountMax=3
    -o NumberOfPasswordPrompts=1
  )

  # Ключ хоста: если окружение передало отпечаток (SSH_KNOWN_HOSTS), доверяем
  # только ему — подмена сервера не пройдёт. Иначе принимаем новый ключ один
  # раз: на первом деплое сервера ещё нет в known_hosts, а CI неинтерактивен.
  if [ -n "${SSH_KNOWN_HOSTS:-}" ]; then
    known_hosts_file="$(mktemp)"
    tmp_files+=("$known_hosts_file")
    printf '%s\n' "$SSH_KNOWN_HOSTS" >"$known_hosts_file"
    ssh_opts+=(-o StrictHostKeyChecking=yes -o UserKnownHostsFile="$known_hosts_file")
  else
    ssh_opts+=(-o StrictHostKeyChecking=accept-new)
  fi

  # Авторизация: пароль (sshpass) или приватный ключ из секрета (файл 600).
  local rsync_ssh
  if [ "$HOSTING_SECRET_KIND" = "key" ]; then
    key_file="$(mktemp)"
    tmp_files+=("$key_file")
    printf '%s\n' "$CREDENTIAL" >"$key_file"
    chmod 600 "$key_file"
    ssh_opts+=(-i "$key_file" -o IdentitiesOnly=yes -o BatchMode=yes)
    rsync_ssh="ssh ${ssh_opts[*]}"
  else
    command -v sshpass >/dev/null 2>&1 || {
      err "sshpass не установлен (Debian/Ubuntu: apt-get install -y sshpass)"
      exit 1
    }
    ssh_opts+=(-o PreferredAuthentications=password -o PubkeyAuthentication=no)
    export SSHPASS="$CREDENTIAL"
    rsync_ssh="sshpass -e ssh ${ssh_opts[*]}"
  fi

  # Служебные команды идут тем же способом авторизации, что и rsync.
  remote() {
    if [ "$HOSTING_SECRET_KIND" = "key" ]; then
      ssh "${ssh_opts[@]}" "${HOSTING_USER}@${HOSTING_HOST}" "$1"
    else
      sshpass -e ssh "${ssh_opts[@]}" "${HOSTING_USER}@${HOSTING_HOST}" "$1"
    fi
  }

  local -a excludes
  for pattern in $HOSTING_EXCLUDE; do
    excludes+=("--exclude=$pattern")
  done

  local delete_flag=""
  if [ "$HOSTING_DELETE" = "yes" ]; then
    delete_flag="--delete"
  fi

  log "${HOSTING_SITE} → ssh://${HOSTING_USER}@${HOSTING_HOST}:${HOSTING_PORT}${HOSTING_REMOTE_DIR}"
  log "источник: ${HOSTING_DIST}"

  # Документ-рут создаём заранее: rsync не создаёт больше одного уровня
  # вложенности, а первый деплой идёт на чистый сервер.
  if ! remote "mkdir -p '${HOSTING_REMOTE_DIR}'"; then
    err "Не удалось подключиться по SSH к ${HOSTING_USER}@${HOSTING_HOST}:${HOSTING_PORT} — проверьте адрес, логин и секрет «${HOSTING_SECRET}»"
    return 1
  fi

  if ! rsync -az $delete_flag \
    --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
    "${excludes[@]+"${excludes[@]}"}" \
    -e "$rsync_ssh" \
    "${HOSTING_DIST}/" "${HOSTING_USER}@${HOSTING_HOST}:${HOSTING_REMOTE_DIR}/"; then
    err "rsync не смог выложить ${HOSTING_SITE} — смотрите сообщение выше (доступ, права на ${HOSTING_REMOTE_DIR}, свободное место на сервере)"
    return 1
  fi

  if [ -z "$HOSTING_PUBLIC_URL" ] || ! command -v curl >/dev/null 2>&1; then
    log "Готово: ${HOSTING_SITE} выложен"
    return 0
  fi

  # Проверка после выкладки: если nginx не отдаёт страницу, деплой считается
  # неуспешным — иначе «выложено» было бы утверждением без измерения.
  local attempt
  for attempt in 1 2 3; do
    if curl -fsS -o /dev/null --max-time 15 "$HOSTING_PUBLIC_URL"; then
      log "Готово: ${HOSTING_SITE} выложен — ${HOSTING_PUBLIC_URL} отвечает"
      return 0
    fi
    if [ "$attempt" -lt 3 ]; then
      sleep 3
    fi
  done

  err "Файлы переданы, но ${HOSTING_PUBLIC_URL} не ответил: смотрите nginx на сервере (nginx -t, systemctl status nginx)"
  return 1
}

# ---------- ftp/ftps: зеркало lftp ----------
deploy_ftp() {
  command -v lftp >/dev/null 2>&1 || {
    err "lftp не установлен (Debian/Ubuntu: apt-get install -y lftp; macOS: brew install lftp)"
    exit 1
  }

  # Служебные каталоги панели не зеркалим и не удаляем — их ведёт сама панель.
  local excludes=""
  for pattern in $HOSTING_EXCLUDE; do
    excludes="$excludes --exclude-glob=$pattern"
  done

  # Удаляем на хостинге то, чего нет в dist/: иначе хешированные файлы прошлых
  # сборок копятся и сайт занимает место мусором.
  local delete_flag=""
  if [ "$HOSTING_DELETE" = "yes" ]; then
    delete_flag="--delete"
  fi

  # ftps — явный TLS поверх 21-го порта; ftp — без шифрования.
  local ssl_force="no"
  if [ "$HOSTING_PROTOCOL" = "ftps" ]; then
    ssl_force="yes"
  fi

log "${HOSTING_SITE} → ${HOSTING_PROTOCOL}://${HOSTING_HOST}:${HOSTING_PORT}/${HOSTING_REMOTE_DIR}"
log "источник: ${HOSTING_DIST}"

  # Пароль передаётся переменной окружения LFTP_PASSWORD и включается ключом
  # --env-password: без него lftp спросит пароль интерактивно и деплой в CI
  # зависнет на запросе ввода. В аргументах командной строки пароль не светится.
  #
  # Команды идут одной строкой через ";": многострочный -e lftp завершает пустой
  # командой ("Ambiguous command") и возвращает ошибку, хотя файлы уже переданы.
  local commands="set cmd:fail-exit yes"
  commands+="; set net:max-retries 3"
  commands+="; set net:timeout 25"
  commands+="; set ftp:passive-mode true"
  commands+="; set ftp:use-mlsd true"
  commands+="; set ssl:verify-certificate $HOSTING_VERIFY_CERT"
  commands+="; set ftp:ssl-force $ssl_force"
  commands+="; set ftp:ssl-protect-data $ssl_force"
  commands+="; mirror -R $delete_flag --parallel=4 --verbose=1 $excludes $HOSTING_DIST $HOSTING_REMOTE_DIR"

  LFTP_PASSWORD="$CREDENTIAL" lftp -u "$HOSTING_USER" --env-password \
    "${HOSTING_HOST}:${HOSTING_PORT}" -e "$commands"

  log "Готово: ${HOSTING_SITE} выложен${HOSTING_PUBLIC_URL:+ — ${HOSTING_PUBLIC_URL}}"
}

# ---------- выбор транспорта ----------
case "$HOSTING_TRANSPORT" in
  ssh) deploy_ssh ;;
  ftp | ftps) deploy_ftp ;;
  *)
    err "Неизвестный транспорт «${HOSTING_TRANSPORT}» в ${HOSTING_CONFIG}: допустимо ssh, ftp, ftps"
    exit 2
    ;;
esac

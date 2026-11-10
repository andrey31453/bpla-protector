#!/usr/bin/env node
// ============================================================
// hosting-list.mjs — список сайтов, у которых настроена выкладка на хостинг.
//
// Источник данных — `saits/sait-XX/hosting.json` внутри папки самого сайта:
// изоляция сайтов сохраняется, конфиг не собирается в общий файл. Паролей в
// конфиге нет — только имя GitHub-секрета с паролем (репозиторий публичный).
//
// Режимы:
//   node hosting-list.mjs                     список для человека
//   node hosting-list.mjs --matrix            JSON для strategy.matrix workflow
//   node hosting-list.mjs --json [сайт]       JSON-конфигурация сайта/сайтов
//   node hosting-list.mjs --format env <сайт> shell-переменные (eval) для деплоя
//
// Опция: --site <сайт> — работать только с одним сайтом; --help — справка.
// Зависимостей нет: только node:fs и node:path.
// ============================================================
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SAITS_DIR = dirname(fileURLToPath(import.meta.url))

// Обязательные поля конфига сайта. Без них деплой не соберётся.
const REQUIRED = ['host', 'user', 'remoteDir']

// Транспорт выкладки: ssh — rsync поверх SSH в документ-рут nginx на нашем
// сервере; ftp/ftps — зеркало lftp (прошлый хостинг, оставлено для отката).
const TRANSPORTS = ['ssh', 'ftp', 'ftps']

// Поля, которых в конфиге быть не должно: учётные данные живут только в секрете.
const FORBIDDEN = [
  'password',
  'pass',
  'passwordFtp',
  'ftpPassword',
  'sshKey',
  'privateKey',
  'keyFile',
  'passphrase',
]

// Имя поля с секретом зависит от того, чем авторизуемся на сервере.
const SECRET_FIELDS = { password: 'passwordSecret', key: 'sshKeySecret' }

function fail(message) {
  console.error(`[hosting-list] ${message}`)
  process.exit(1)
}

function parseArgs(argv) {
  const args = { mode: 'list', site: '', format: '' }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--matrix') args.mode = 'matrix'
    else if (arg === '--json') args.mode = 'json'
    else if (arg === '--format') {
      args.format = String(argv[i + 1] || '')
      i += 1
      args.mode = args.format === 'env' ? 'env' : 'json'
    } else if (arg === '--site') {
      args.site = String(argv[i + 1] || '')
      i += 1
    } else if (arg === '--help' || arg === '-h') args.mode = 'help'
    else fail(`неизвестный аргумент: ${arg} (см. --help)`)
  }
  return args
}

// Сайты с конфигом хостинга, в порядке номеров.
function findSites() {
  return readdirSync(SAITS_DIR)
    .filter((name) => /^sait-\d+$/.test(name))
    .filter((name) => existsSync(join(SAITS_DIR, name, 'hosting.json')))
    .sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)))
}

function loadConfig(site) {
  const file = join(SAITS_DIR, site, 'hosting.json')
  let raw
  try {
    raw = readFileSync(file, 'utf8')
  } catch {
    fail(`не читается ${file}`)
  }

  let cfg
  try {
    cfg = JSON.parse(raw)
  } catch (err) {
    fail(`битый JSON в ${file}: ${err.message}`)
  }

  for (const key of FORBIDDEN) {
    if (cfg[key]) {
      fail(
        `${file}: поле "${key}" хранить здесь нельзя — пароль задаётся GitHub-секретом, а в конфиге лежит только его имя (passwordSecret)`,
      )
    }
  }

  if (cfg.enabled === false) return null // выкладка выключена самим сайтом

  for (const key of REQUIRED) {
    if (!cfg[key]) fail(`${file}: не задано обязательное поле "${key}"`)
  }

  // transport — новый ключ. Старые конфиги без него читаются по protocol,
  // поэтому перевод сайта с FTP на SSH не ломает остальные сайты.
  const transport = cfg.transport
    ? String(cfg.transport)
    : cfg.protocol === 'ftp'
      ? 'ftp'
      : 'ftps'
  if (!TRANSPORTS.includes(transport)) {
    fail(`${file}: неизвестный transport "${transport}" — допустимо: ${TRANSPORTS.join(', ')}`)
  }

  // Ровно один секрет: имя поля показывает, чем авторизуемся на сервере.
  const secretFields = Object.values(SECRET_FIELDS).filter((key) => cfg[key])
  if (secretFields.length === 0) {
    fail(
      `${file}: не задано имя GitHub-секрета — укажите "${SECRET_FIELDS.password}" (пароль) или "${SECRET_FIELDS.key}" (SSH-ключ). Сам секрет в репозитории не хранится`,
    )
  }
  if (secretFields.length > 1) {
    fail(`${file}: заданы оба секрета (${secretFields.join(', ')}) — оставьте один`)
  }
  const secretField = secretFields[0]
  const secretKind = secretField === SECRET_FIELDS.key ? 'key' : 'password'

  if (transport !== 'ssh' && secretKind !== 'password') {
    fail(`${file}: ключ деплоя поддерживается только для transport "ssh"`)
  }

  // Для ssh remoteDir — абсолютный путь документ-рута: относительный путь уехал
  // бы в домашний каталог пользователя, и сайт оказался бы не там.
  const remoteDir = String(cfg.remoteDir)
  if (transport === 'ssh' && !remoteDir.startsWith('/')) {
    fail(
      `${file}: для transport "ssh" поле remoteDir должно быть абсолютным путём, например /var/www/site`,
    )
  }

  // Стейдж: площадка ещё не на боевом домене. Тогда адрес для canonical/OG/
  // sitemap берётся из stagingBaseUrl, а сборка дополнительно включает noindex,
  // закрытый robots.txt и отключённый счётчик Метрики (см. nunjucks-plugin.mjs).
  const staging = cfg.staging === true
  const stagingBaseUrl = String(cfg.stagingBaseUrl || cfg.publicUrl || '').replace(/\/+$/, '')
  if (staging && !stagingBaseUrl) {
    fail(
      `${file}: включён staging, но не задан stagingBaseUrl — адрес, по которому сайт открыт сейчас`,
    )
  }

  return {
    site,
    file,
    transport,
    protocol: transport === 'ssh' ? '' : transport,
    host: String(cfg.host),
    port: Number(cfg.port || (transport === 'ssh' ? 22 : 21)),
    user: String(cfg.user),
    secret: String(cfg[secretField]),
    secretKind,
    remoteDir: transport === 'ssh' ? remoteDir : remoteDir.replace(/^\/+|\/+$/g, '') || '.',
    verifyCertificate: cfg.verifyCertificate !== false,
    delete: cfg.delete !== false,
    exclude: Array.isArray(cfg.exclude) ? cfg.exclude.map(String) : [],
    publicUrl: cfg.publicUrl ? String(cfg.publicUrl) : '',
    staging,
    stagingBaseUrl,
    dist: join(SAITS_DIR, site, 'dist'),
  }
}

// Значение в одинарных кавычках — годится для `eval "$(…)"`.
function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`
}

function envFormat(cfg) {
  const values = {
    HOSTING_SITE: cfg.site,
    HOSTING_TRANSPORT: cfg.transport,
    HOSTING_PROTOCOL: cfg.protocol,
    HOSTING_HOST: cfg.host,
    HOSTING_PORT: String(cfg.port),
    HOSTING_USER: cfg.user,
    HOSTING_SECRET: cfg.secret,
    HOSTING_SECRET_KIND: cfg.secretKind,
    HOSTING_REMOTE_DIR: cfg.remoteDir,
    HOSTING_VERIFY_CERT: cfg.verifyCertificate ? 'yes' : 'no',
    HOSTING_DELETE: cfg.delete ? 'yes' : 'no',
    HOSTING_EXCLUDE: cfg.exclude.join(' '),
    HOSTING_PUBLIC_URL: cfg.publicUrl,
    HOSTING_STAGING: cfg.staging ? 'yes' : 'no',
    HOSTING_STAGING_BASE_URL: cfg.stagingBaseUrl,
    HOSTING_DIST: cfg.dist,
    HOSTING_CONFIG: cfg.file,
  }
  return Object.entries(values)
    .map(([key, value]) => `${key}=${shellQuote(value)}`)
    .join('\n')
}

function helpFormat() {
  return [
    'usage: node hosting-list.mjs [--matrix | --json | --format env] [--site sait-XX]',
    '',
    '  (без аргументов)             список сайтов с hosting.json',
    '  --matrix                     JSON для strategy.matrix (site, transport, secret, url, staging)',
    '  --json                       JSON-конфигурация сайта или всех сайтов',
    '  --format env --site sait-XX  shell-переменные HOSTING_* для деплой-скрипта',
    '',
    'Транспорт выкладки задаётся в конфиге: transport "ssh" (rsync поверх SSH',
    'в документ-рут nginx) или "ftp"/"ftps" (зеркало lftp).',
    'Конфиг сайта: saits/sait-XX/hosting.json (шаблон — saits/hosting.example.json).',
  ].join('\n')
}

const args = parseArgs(process.argv.slice(2))

if (args.mode === 'help') {
  console.log(helpFormat())
  process.exit(0)
}

if (args.site && !existsSync(join(SAITS_DIR, args.site, 'hosting.json'))) {
  fail(`у сайта ${args.site} нет saits/${args.site}/hosting.json — он не публикуется на хостинг`)
}

const sites = args.site ? [args.site] : findSites()
const configs = sites.map(loadConfig).filter(Boolean)

if (configs.length === 0) {
  if (args.site) {
    fail(`сайт ${args.site} отключён от хостинга (enabled: false в saits/${args.site}/hosting.json)`)
  }
  if (args.mode === 'matrix') {
    console.log('{"include":[]}')
  } else {
    console.log('[hosting-list] сайтов с настроенным хостингом нет: нет ни одного saits/sait-XX/hosting.json')
  }
  process.exit(0)
}

if (args.mode === 'matrix') {
  const include = configs.map((cfg) => ({
    site: cfg.site,
    transport: cfg.transport,
    secret: cfg.secret,
    secretKind: cfg.secretKind,
    url: cfg.publicUrl,
    staging: cfg.staging,
    baseUrl: cfg.stagingBaseUrl,
  }))
  console.log(JSON.stringify({ include }))
} else if (args.mode === 'env') {
  if (configs.length !== 1) fail('--format env требует ровно один сайт: добавьте --site sait-XX')
  console.log(envFormat(configs[0]))
} else if (args.mode === 'json') {
  console.log(JSON.stringify(configs.length === 1 ? configs[0] : configs, null, 2))
} else {
  const rows = configs.map((cfg) => {
    const target =
      cfg.transport === 'ssh'
        ? `ssh://${cfg.host}:${cfg.port}${cfg.remoteDir}`
        : `${cfg.protocol}://${cfg.host}:${cfg.port}/${cfg.remoteDir}`
    const url = cfg.publicUrl ? `, ${cfg.publicUrl}` : ''
    const stage = cfg.staging ? ', стейдж (noindex)' : ''
    return `  ${cfg.site}  →  ${target}  (секрет ${cfg.secret}${url}${stage})`
  })
  console.log(`[hosting-list] сайтов с хостингом: ${configs.length}`)
  console.log(rows.join('\n'))
}

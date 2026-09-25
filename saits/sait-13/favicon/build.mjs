#!/usr/bin/env node
// ============================================================
// favicon/build.mjs — генератор фавиконов сайта фортТех.
//
// 1. Собирает SVG-варианты знака в favicon/variants/. Геометрия знака и
//    монограммы «ФТ» описана здесь один раз, поэтому варианты не расходятся.
// 2. Растеризует нужные размеры в public/: favicon.ico, favicon-16/32/48,
//    apple-touch-icon, android-chrome-192/512, maskable-192/512.
//    Мелкие размеры рисуются с 4-кратным запасом и уменьшаются: иначе
//    сглаживание «съедает» тонкие штрихи монограммы. У 16 px свой знак
//    (primary-tiny) — на нём монограмма крупнее, иначе она «мылится».
// 3. Дописывает favicon.svg (масштабируемый знак) и safari-pinned-tab.svg.
// 4. Собирает favicon/preview.html — превью всех вариантов и готовых файлов.
//
// Имена файлов иконок лежат в src/data/site.json (site.icons) — там же их
// берут <head> (head.njk), site.webmanifest и JSON-LD. Здесь они только читаются.
//
// Растеризация — headless Google Chrome, без новых зависимостей.
//
// Запуск (из папки saits/sait-13):
//   node favicon/build.mjs                     # собрать всё, основной знак — v1-shield
//   node favicon/build.mjs --primary v3-sight  # другой основной вариант
//   node favicon/build.mjs --only-svg          # только SVG и превью, без PNG/ICO
//   CHROME_PATH=/путь/к/chrome node favicon/build.mjs
// ============================================================
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// ---------- пути и режим запуска ----------
const SITE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FAVICON_DIR = join(SITE_DIR, 'favicon')
const VARIANTS_DIR = join(FAVICON_DIR, 'variants')
const PUBLIC_DIR = join(SITE_DIR, 'public')
const TMP_DIR = join(tmpdir(), 'fortteh-favicon')

const argv = process.argv.slice(2)
const has = (name) => argv.includes(name)
const opt = (name, fallback) => {
  const i = argv.indexOf(name)
  return i > -1 && argv[i + 1] ? argv[i + 1] : fallback
}
const PRIMARY = opt('--primary', 'v1-shield')
const ONLY_SVG = has('--only-svg')
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const site = JSON.parse(readFileSync(join(SITE_DIR, 'src/data/site.json'), 'utf8'))
const ICONS = site.icons || {}
const ARIA = `${site.brand} — ${site.brandTag}`

// ---------- палитра знака (как в src/style.css и логотипе .brand__mark) ----------
const NIGHT = '#0b0f13' // фон плиты
const INK = '#14100a' // монограмма внутри оранжевой плиты
const SNOW = '#eef2f4' // монограмма на тёмном фоне
const FLAME2 = '#ff9c4a'
const FLAME = '#ff7a2f'
const EMBER = '#cf4418'

const n = (v) => Number(v.toFixed(3)) // аккуратные числа в разметке SVG
const esc = (v) =>
  String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')


// ---------- геометрия знака ----------
// Монограмма «ФТ» повторяет логику знака бренда из шапки: буква Ф — кольцо
// со сквозной стойкой, буква Т — перекладина со стойкой. Рисуем силуэтами,
// без шрифта: так знак выглядит одинаково в любой системе и в любом браузере.
// w — толщина штриха, capH — высота буквы, letterW — ширина колонки буквы
// (как в моно-шрифте: у обеих букв она одинаковая), gap — пробел между колонками.
function monogram({ cx, cy, k = 1, w = 3.2, capH = 18, letterW = 15, gap = 4, fill }) {
  // Локальные координаты: x = 0 — левый край колонки «Ф», y = 0 — верх габарита букв.
  const rect = (x, y, ww, hh) => `M${n(x)} ${n(y)}h${n(ww)}v${n(hh)}h${n(-ww)}Z`
  const circle = (cxx, cyy, rr) =>
    `M${n(cxx - rr)} ${n(cyy)}a${n(rr)} ${n(rr)} 0 1 0 ${n(rr * 2)} 0a${n(rr)} ${n(rr)} 0 1 0 ${n(-rr * 2)} 0Z`
  const ringR = letterW / 2 - 0.5 // внешний радиус кольца «Ф» — чуть уже колонки
  const colT = letterW + gap // начало колонки «Т»
  const barT = letterW - 1.5 // перекладина «Т» с боковыми пробелами
  // «Ф»: кольцо (вырез — внутренняя окружность) и сквозная стойка выше и ниже буквы
  const ring = `${circle(letterW / 2, capH / 2, ringR)}${circle(letterW / 2, capH / 2, ringR - w)}`
  const stemF = rect(letterW / 2 - w / 2, -w / 2, w, capH + w)
  // «Т»: перекладина и стойка; заливка nonzero, поэтому их пересечение не вырезается
  const bar = rect(colT + (letterW - barT) / 2, 0, barT, w)
  const stemT = rect(colT + letterW / 2 - w / 2, 0, w, capH)
  const totalW = letterW * 2 + gap
  return `<g transform="translate(${n(cx - (totalW * k) / 2)} ${n(cy - (capH * k) / 2)}) scale(${n(k)})" fill="${fill}">
    <path fill-rule="evenodd" d="${ring}"/>
    <path d="${stemF}${bar}${stemT}"/>
  </g>`
}

// Плита со срезанным правым нижним углом — форма из clip-path у .brand__mark.
function cutPlate({ x = 4, size = 56, cut = 0.7 } = {}) {
  const far = x + size
  const c = n(x + size * cut)
  return `M${x} ${x}H${far}V${c}L${c} ${far}H${x}Z`
}

// ---------- варианты знака ----------
// body — содержимое в системе координат 64×64: фон и фигуры.
// Каждый вариант живёт под своим slug и выбирается под размер (см. pick ниже):
// v1…v4 — претенденты на основной знак, primary-small / primary-tiny /
// primary-maskable — служебные версии того же знака для мелких размеров,
// 16 px и маскируемых иконок.
const variants = [
  {
    slug: 'v1-shield',
    title: 'Щит-плита',
    note: 'Повторяет знак бренда из шапки: оранжевая плита со срезанным углом и монограмма «ФТ». Максимально узнаваемо рядом с логотипом.',
    body: `<rect width="64" height="64" fill="${NIGHT}"/>
    <path d="${cutPlate()}" fill="url(#flame)"/>
    ${monogram({ cx: 30.5, cy: 28, k: 1.25, fill: INK })}`,
  },
  {
    slug: 'v2-fort',
    title: 'Крепостная стена',
    note: 'Прямая отсылка к «форту»: зубчатый бастион в оранжевом градиенте, над стеной — белая монограмма. Читается с 32 px.',
    body: `<rect width="64" height="64" fill="${NIGHT}"/>
    <path d="M0 50h6v-8h12v8h8v-8h12v8h8v-8h12v8h6v14H0Z" fill="url(#flame)"/>
    ${monogram({ cx: 32, cy: 25, k: 1, fill: SNOW })}`,
  },
  {
    slug: 'v3-sight',
    title: 'Прицел',
    note: 'Тема противодействия БПЛА: рамка-визир с засечками и монограмма в центре. Самый «охранный» знак, но деталей больше — на 16 px мельче.',
    body: `<rect width="64" height="64" fill="${NIGHT}"/>
    <g fill="url(#flame)">
      <path d="M8 8h18v4H12v14H8Z"/>
      <path d="M56 8v18h-4V12H38V8Z"/>
      <path d="M56 56H38v-4h14V38h4Z"/>
      <path d="M8 56V38h4v14h14v4Z"/>
      <path d="M30 8h4v6h-4Z"/>
      <path d="M30 50h4v6h-4Z"/>
      <path d="M8 30h6v4H8Z"/>
      <path d="M50 30h6v4h-6Z"/>
    </g>
    ${monogram({ cx: 32, cy: 32, k: 0.92, fill: SNOW })}`,
  },
  {
    slug: 'v4-mono',
    title: 'Крупная монограмма',
    note: 'Минимум деталей: большая градиентная монограмма и «фундамент» под ней. Лучше всех держится на 16 px.',
    body: `<rect width="64" height="64" fill="${NIGHT}"/>
    ${monogram({ cx: 32, cy: 27.5, k: 1.41, fill: 'url(#flame)' })}
    <rect x="8" y="49" width="48" height="5.5" rx="2.75" fill="url(#flame)"/>`,
  },
  {
    slug: 'primary-small',
    title: 'Щит-плита, упрощённый',
    note: 'Тот же знак, что и основной, но штрихи монограммы толще, детали убраны: используется для иконок 16–48 px и favicon.ico.',
    body: `<rect width="64" height="64" fill="${NIGHT}"/>
    <path d="${cutPlate({ x: 4, size: 56 })}" fill="url(#flame)"/>
    ${monogram({ cx: 31, cy: 31, k: 1.05, w: 5, capH: 27, letterW: 19, gap: 4, fill: INK })}`,
  },
  {
    slug: 'primary-tiny',
    title: 'Щит-плита, для 16 px',
    note: 'Отдельный знак самого мелкого размера (16 px и запись 16 в favicon.ico): монограмма крупнее и плотнее, просвет кольца «Ф» шире — при 1.38 вместо 1.05 знак не «мылится». На больших размерах не используется.',
    body: `<rect width="64" height="64" fill="${NIGHT}"/>
    <path d="${cutPlate({ x: 4, size: 56 })}" fill="url(#flame)"/>
    ${monogram({ cx: 31.5, cy: 31, k: 1.38, w: 4.5, capH: 28, letterW: 17.6, gap: 2, fill: INK })}`,
  },
  {
    slug: 'primary-maskable',
    title: 'Щит-плита, maskable',
    note: 'Фон плиты на всю площадь, монограмма — в «безопасной зоне»: Android и iOS маскируют края иконки. Для apple-touch-icon и maskable-*.png.',
    body: `<rect width="64" height="64" fill="url(#flame)"/>
    ${monogram({ cx: 32, cy: 32, k: 1.2, fill: INK })}`,
  },
]

// ---------- выбор вариантов под конкретную роль ----------
// --primary меняет детальную иконку; «мелкая» и maskable-версии могут быть
// отдельными вариантами (primary-small / primary-maskable), иначе берутся
// любые подходящие по роли — так скрипт работает и для других основных знаков.
const byslug = (slug) => variants.find((v) => v.slug === slug)
if (!byslug(PRIMARY)) {
  console.error(`[favicon] нет варианта «${PRIMARY}». Доступные: ${variants.map((v) => v.slug).join(', ')}`)
  process.exit(1)
}
const pick = {
  detail: byslug(PRIMARY),
  small: byslug(`${PRIMARY}-small`) || byslug('primary-small'),
  maskable: byslug(`${PRIMARY}-maskable`) || byslug('primary-maskable'),
  // 16 px — самый мелкий размер: у него свой знак (primary-tiny), крупнее и
  // плотнее small. Если у выбранного --primary своего tiny нет, берём общий.
  tiny: byslug(`${PRIMARY}-tiny`) || byslug('primary-tiny'),
}


// ---------- сборка SVG-файлов ----------
const svgDoc = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="${esc(ARIA)}">
  <defs>
    <linearGradient id="flame" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${FLAME2}"/>
      <stop offset="0.45" stop-color="${FLAME}"/>
      <stop offset="1" stop-color="${EMBER}"/>
    </linearGradient>
  </defs>
  ${body}
</svg>
`

// svgMono — одноцветный силуэт для mask-icon (закреплённая вкладка Safari):
// браузер берёт из файла альфа-канал, поэтому цвет здесь только чёрный.
const svgMono = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="${esc(ARIA)}">
  ${body}
</svg>
`

// ---------- растеризация (headless Chrome) ----------
let pageSeq = 0

const pageHtml = (src, size) => `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; }
  img { display: block; width: ${size}px; height: ${size}px; }
</style></head><body><img src="${src}"></body></html>
`

function shoot(html, size, outFile) {
  mkdirSync(TMP_DIR, { recursive: true })
  const page = join(TMP_DIR, `page-${++pageSeq}.html`)
  writeFileSync(page, html)
  execFileSync(
    CHROME,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--virtual-time-budget=2000',
      `--window-size=${size},${size}`,
      `--screenshot=${outFile}`,
      pathToFileURL(page).href,
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  )
  if (!existsSync(outFile)) throw new Error(`Chrome не создал файл: ${outFile}`)
  return outFile
}

// Иконки рисуем с запасом по размеру (для мелких — 4×), затем уменьшаем:
// Chrome усредняет пиксели картинки, поэтому тонкие штрихи не пропадают.
function raster(svgFile, size, outFile) {
  const big = size < 96 ? Math.min(size * 4, 1024) : size
  const src =
    big === size
      ? pathToFileURL(svgFile).href
      : pathToFileURL(shoot(pageHtml(pathToFileURL(svgFile).href, big), big, join(TMP_DIR, `big-${size}.png`))).href
  shoot(pageHtml(src, size), size, outFile)
  return outFile
}

// ---------- favicon.ico ----------
// ICO-контейнер с PNG-содержимым: понимают все современные браузеры и Windows.
function icoBuffer(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2) // тип: иконка
  header.writeUInt16LE(images.length, 4)
  const entries = []
  const payload = []
  let offset = 6 + images.length * 16
  for (const { size, png } of images) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0) // ширина (0 означает 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1) // высота
    entry.writeUInt8(0, 2) // число цветов палитры
    entry.writeUInt8(0, 3) // зарезервировано
    entry.writeUInt16LE(1, 4) // плоскости
    entry.writeUInt16LE(32, 6) // бит на пиксель
    entry.writeUInt32LE(png.length, 8)
    entry.writeUInt32LE(offset, 12)
    entries.push(entry)
    payload.push(png)
    offset += png.length
  }
  return Buffer.concat([header, ...entries, ...payload])
}

// ---------- раскладка файлов по ролям ----------
// key — поле в site.icons, role — какой вариант знака, size — размер в пикселях.
const RASTER_PLAN = [
  { key: 'png16', role: 'tiny', size: 16 },
  { key: 'png32', role: 'small', size: 32 },
  { key: 'png48', role: 'small', size: 48 },
  { key: 'appleTouch', role: 'maskable', size: 180 },
  { key: 'android192', role: 'detail', size: 192 },
  { key: 'android512', role: 'detail', size: 512 },
  { key: 'maskable192', role: 'maskable', size: 192 },
  { key: 'maskable512', role: 'maskable', size: 512 },
]
const ICO_SIZES = [16, 32, 48]

// ---------- превью для выбора варианта ----------
const PREVIEW_SIZES = [16, 24, 32, 48, 64, 128]

const previewHtml = () => {
  const tiles = (src) =>
    PREVIEW_SIZES.map(
      (s) =>
        `<figure class="tile"><img src="${src}" width="${s}" height="${s}" alt=""><figcaption>${s} px</figcaption></figure>`,
    ).join('')

  const tab = (src) =>
    `<span class="tab"><img src="${src}" width="16" height="16" alt=""><span class="tab__title">${esc(site.brand)} — ${esc(site.tagline)}</span><span class="tab__x">×</span></span>`

  const cards = variants
    .map(
      (v) => `<section class="card">
      <header class="card__head">
        <h2>${esc(v.title)} <code>${v.slug}</code>${v.slug === pick.detail.slug ? '<span class="badge">основной</span>' : ''}</h2>
        <p>${esc(v.note)}</p>
        ${tab(`variants/${v.slug}.svg`)}
      </header>
      <div class="row row--dark">${tiles(`variants/${v.slug}.svg`)}</div>
      <div class="row row--light">${tiles(`variants/${v.slug}.svg`)}</div>
    </section>`,
    )
    .join('\n')

  const fileRow = (title, src, size) =>
    `<figure class="tile"><img src="${src}" width="${size}" height="${size}" alt=""><figcaption>${title}</figcaption></figure>`

  const files = [
    fileRow('favicon.ico', `../public/${basename(ICONS.ico)}`, 48),
    fileRow('favicon.svg', `../public/${basename(ICONS.svg)}`, 128),
    fileRow('16×16 png', `../public/${basename(ICONS.png16)}`, 16),
    fileRow('32×32 png', `../public/${basename(ICONS.png32)}`, 32),
    fileRow('48×48 png', `../public/${basename(ICONS.png48)}`, 48),
    fileRow('apple-touch 180', `../public/${basename(ICONS.appleTouch)}`, 120),
    fileRow('android 192', `../public/${basename(ICONS.android192)}`, 96),
    fileRow('maskable 192', `../public/${basename(ICONS.maskable192)}`, 96),
    fileRow('maskable 512', `../public/${basename(ICONS.maskable512)}`, 128),
    fileRow('android 512', `../public/${basename(ICONS.android512)}`, 128),
  ].join('')

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Варианты фавикона — ${esc(site.brand)}</title>
  <style>
    :root { --night: #0b0f13; --panel: #141c25; --line: #26313c; --mist: #8fa1ad; --snow: #eef2f4; --flame: #ff7a2f; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 32px; background: #06080a; color: var(--snow); font: 15px/1.6 Inter, system-ui, sans-serif; }
    h1 { margin: 0 0 8px; font-size: 26px; }
    h2 { margin: 0 0 6px; font-size: 17px; }
    p { margin: 0 0 14px; color: var(--mist); }
    code { font-family: ui-monospace, Menlo, monospace; color: var(--flame); font-size: 13px; }
    .lead { max-width: 900px; margin-bottom: 28px; }
    .badge { margin-left: 8px; padding: 2px 8px; border-radius: 99px; background: rgba(255,122,47,.16); color: var(--flame); font-size: 11px; text-transform: uppercase; letter-spacing: .08em; vertical-align: middle; }
    .card { margin-bottom: 22px; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; background: var(--panel); }
    .card__head { padding: 18px 20px 6px; }
    .row { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 20px; padding: 18px 20px; }
    .row--dark { background: #06080a; }
    .row--light { background: #f2f0ea; color: #0d1214; }
    .tile { margin: 0; text-align: center; }
    .tile img { display: block; margin: 0 auto 6px; }
    .tile figcaption { font-size: 11px; opacity: .6; }
    .tab { display: inline-flex; align-items: center; gap: 8px; max-width: 360px; padding: 6px 10px; border: 1px solid var(--line); border-radius: 8px 8px 0 0; background: #1b232c; }
    .tab img { display: block; }
    .tab__title { font-size: 12px; color: #cfd8dd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tab__x { color: var(--mist); }
    .hint { margin: 26px 0 12px; font-size: 14px; color: var(--mist); }
    .hint code { color: var(--snow); }
  </style>
</head>
<body>
  <h1>Варианты фавикона — ${esc(site.brand)}</h1>
  <div class="lead">
    <p>Служебная страница генератора (в сборку не попадает): показывает все варианты знака в разных размерах, на тёмном и светлом фоне, плюс имитацию вкладки браузера и уже собранные файлы из <code>public/</code>.</p>
    <p>Основной вариант сейчас — <code>${pick.detail.slug}</code>. Пересобрать знак с другим основным вариантом: <code>node favicon/build.mjs --primary v3-sight</code></p>
  </div>
${cards}
  <h2 class="hint">Готовые файлы в public/</h2>
  <section class="card"><div class="row row--dark">${files}</div></section>
</body>
</html>
`
}


const log = (msg) => console.log(`[favicon] ${msg}`)

// ---------- запуск ----------
if (!ICONS.svg || !ICONS.ico) {
  console.error(
    '[favicon] в src/data/site.json нет site.icons — список файлов иконок обязателен: он единый для <head>, site.webmanifest и JSON-LD',
  )
  process.exit(1)
}

mkdirSync(VARIANTS_DIR, { recursive: true })
mkdirSync(PUBLIC_DIR, { recursive: true })
rmSync(TMP_DIR, { recursive: true, force: true })

// 1. Варианты дизайна — в favicon/variants/ (для выбора; в сборку не попадают)
for (const v of variants) writeFileSync(join(VARIANTS_DIR, `${v.slug}.svg`), svgDoc(v.body))
log(`варианты знака: ${variants.length} → favicon/variants/`)

// 2. Основной масштабируемый знак + одноцветный силуэт для закреплённой вкладки Safari
writeFileSync(join(PUBLIC_DIR, basename(ICONS.svg)), svgDoc(pick.detail.body))
writeFileSync(
  join(PUBLIC_DIR, basename(ICONS.safariPinnedTab)),
  svgMono(monogram({ cx: 32, cy: 32, k: 1.45, fill: '#000000' })),
)
log(`${basename(ICONS.svg)} ← вариант ${pick.detail.slug}`)

// 3. PNG и ICO
if (!ONLY_SVG) {
  if (!existsSync(CHROME)) {
    console.error(`[favicon] не найден Chrome: ${CHROME}\n          укажите путь через CHROME_PATH=/путь/к/chrome`)
    process.exit(1)
  }

  const svgFiles = new Map([
    ['detail', join(VARIANTS_DIR, `${pick.detail.slug}.svg`)],
    ['small', join(VARIANTS_DIR, `${pick.small.slug}.svg`)],
    ['tiny', join(VARIANTS_DIR, `${pick.tiny.slug}.svg`)],
    ['maskable', join(VARIANTS_DIR, `${pick.maskable.slug}.svg`)],
  ])
  const smallPng = new Map()

  for (const { key, role, size } of RASTER_PLAN) {
    const out = join(PUBLIC_DIR, basename(ICONS[key]))
    raster(svgFiles.get(role), size, out)
    if (ICO_SIZES.includes(size)) smallPng.set(size, readFileSync(out))
    log(`${basename(ICONS[key])} — ${size}×${size} (${role}: ${pick[role].slug})`)
  }

  writeFileSync(
    join(PUBLIC_DIR, basename(ICONS.ico)),
    icoBuffer(ICO_SIZES.map((size) => ({ size, png: smallPng.get(size) }))),
  )
  log(
    `${basename(ICONS.ico)} — ${ICO_SIZES.join('/')} px (16 → ${pick.tiny.slug}, остальные → ${pick.small.slug})`,
  )
}

// 4. Превью всех вариантов
writeFileSync(join(FAVICON_DIR, 'preview.html'), previewHtml())
log('preview.html — превью вариантов и готовых файлов')
log('готово')


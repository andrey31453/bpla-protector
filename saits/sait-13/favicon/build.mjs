#!/usr/bin/env node
// ============================================================
// favicon/build.mjs — генератор фавиконов сайта фортТех.
//
// 1. Собирает SVG знака в favicon/variants/: основной знак (без фона, как логотип)
//    и maskable-версию для домашних экранов.
// 2. Растеризует нужные размеры в public/: favicon.ico, favicon-16/32/48,
//    apple-touch-icon, android-chrome-192/512, maskable-192/512.
//    Мелкие размеры рисуются с 4-кратным запасом и уменьшаются: иначе
//    сглаживание «съедает» зазоры между плитами.
// 3. Дописывает favicon.svg (масштабируемый знак) и safari-pinned-tab.svg.
// 4. Собирает favicon/preview.html — превью знака в размерах и готовых файлов.
//
// Геометрия знака приходит из src/data/site.json (site.brandMark) — тот же
// источник, что у логотипа (src/partials/brand.njk), поэтому пропорции и зазоры
// у иконки и логотипа всегда одинаковые. Знак масштабируется целиком (k один и
// тот же по обеим осям, без правок ширин плит и зазоров): зазор между плитами
// равен 8 единицам знака на любом размере иконки.
//
// Имена файлов иконок лежат в src/data/site.json (site.icons) — там же их
// берут <head> (head.njk), site.webmanifest и JSON-LD. Здесь они только читаются.
//
// Растеризация — headless Google Chrome, без новых зависимостей.
//
// Запуск (из папки saits/sait-13):
//   node favicon/build.mjs            # всё: SVG, PNG, favicon.ico, превью
//   node favicon/build.mjs --only-svg # только SVG и превью, без PNG/ICO
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
const ONLY_SVG = has('--only-svg')
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const site = JSON.parse(readFileSync(join(SITE_DIR, 'src/data/site.json'), 'utf8'))
const ICONS = site.icons || {}
const ARIA = `${site.brand} — ${site.brandTag}`

// ---------- палитра знака (как в src/style.css и логотипе .brand__mark) ----------
// Цвет плит знака берётся из его же fill в логотипе: в шапке это currentColor
// (--color-snow, фон тёмный), в иконке — по теме браузера (см. вариант «mark»).
// Правая плита везде фирменный оранжевый --color-flame, без градиента: иконка
// должна быть один в один с логотипом.
const SNOW = '#eef2f4' // --color-snow: плиты знака на тёмном фоне (логотип в шапке)
const NIGHT = '#0b0f13' // --color-night: плиты знака на светлой панели + плита maskable
const FLAME = '#ff7a2f' // --color-flame: акцентная правая плита

const n = (v) => Number(v.toFixed(3)) // аккуратные числа в разметке SVG
const esc = (v) =>
  String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')


// ---------- геометрия знака ----------
// Знак — три плиты на общей базе. Пути берём из src/data/site.json
// (site.brandMark) — это тот же источник, что у логотипа (src/partials/brand.njk),
// поэтому иконка и логотип не могут разойтись. Там же описаны пропорции
// (104×137), ширины плит (28 / 32 / 28) и одинаковый зазор 8 между плитами.
// Рисуем силуэтами, без шрифта и растровых картинок: знак одинаково выглядит в
// любой системе и масштабируется без потерь.
const MARK = site.brandMark
if (!MARK || !MARK.viewBox || !MARK.paths) {
  console.error(
    '[favicon] в src/data/site.json нет site.brandMark — геометрия знака обязательна: её же использует логотип (src/partials/brand.njk)',
  )
  process.exit(1)
}

// Масштаб основного знака: 137 × 0.36 ≈ 49 единиц из 64 по высоте — у иконки
// остаётся поле, она не распирает вкладку. Пропорции при этом не меняются.
const MARK_K = 0.36

// mark — знак, вписанный в иконку: cx/cy — центр, k — масштаб. k один и тот же
// по обеим осям, поэтому ширины плит и зазоры всегда те же, что у логотипа: под
// размер ничего не подгоняется, зазор остаётся 8 единиц знака.
// Цвета задают классы .mark__side / .mark__accent в <style> варианта — так один
// и тот же знак перекрашивается под фон.
function mark({ cx, cy, k = MARK_K }) {
  const gx = n(cx - (MARK.width * k) / 2)
  const gy = n(cy - (MARK.height * k) / 2)
  return `<g transform="translate(${gx} ${gy}) scale(${n(k)})">
    <path class="mark__side" d="${MARK.paths.sideLeft}"/>
    <path class="mark__side" d="${MARK.paths.middle}"/>
    <path class="mark__accent" d="${MARK.paths.sideRight}"/>
  </g>`
}

// ---------- варианты знака ----------
// body — содержимое в системе координат 64×64: цвета и (для maskable) плита.
// Вариантов ровно два, потому что знак один — тот же, что в логотипе:
//   mark     — знак без фона (вкладка, ярлык, android-chrome, favicon.svg);
//   maskable — тот же знак на залитой плите (маскируемые иконки, apple-touch-icon).
// body — то, что уходит в SVG-файл варианта (в нём у знака без фона цвет плит
// зависит от темы браузера). raster — тот же знак, но с постоянной заливкой:
// из него и только из него делаются PNG и ICO. Причина разделения: в PNG тему
// браузера передать нечем, а Chrome растеризует SVG по теме машины сборки — на
// машине с тёмной темой @media перекрасил бы плиты в ${SNOW}, и на светлой
// панели браузера иконка стала бы невидимой. Превью показывает оба варианта как
// есть (то есть с @media), а растр всегда предсказуемый.
const markBody =
  `<style>.mark__side { fill: ${NIGHT} } .mark__accent { fill: ${FLAME} } @media (prefers-color-scheme: dark) { .mark__side { fill: ${SNOW} } }</style>
    ${mark({ cx: 32, cy: 32, k: MARK_K })}`
const markBodyFlat =
  `<style>.mark__side { fill: ${NIGHT} } .mark__accent { fill: ${FLAME} }</style>
    ${mark({ cx: 32, cy: 32, k: MARK_K })}`
const maskableBody =
  `<style>.mark__side { fill: ${SNOW} } .mark__accent { fill: ${FLAME} }</style>
    <rect width="64" height="64" fill="${NIGHT}"/>
    ${mark({ cx: 32, cy: 32, k: 0.29 })}`

const variants = [
  {
    slug: 'mark',
    title: 'Знак без фона',
    note: 'Основной знак — один в один как логотип в шапке: три плиты, зазор между ними везде одинаковый (8 единиц знака), фона нет, пропорции не подгоняются под размер. Плиты тёмные на светлой панели браузера и светлые на тёмной — так же, как логотип, который берёт цвет из currentColor. Правая плита — фирменный оранжевый, как в логотипе.',
    body: markBody,
    raster: markBodyFlat,
  },
  {
    slug: 'maskable',
    title: 'Знак на тёмной плите',
    note: 'Только для maskable-*.png и apple-touch-icon: им нужна залитая плита на всю площадь, потому что край такой иконки система обрезает по своей маске. Знак уменьшен и держится в безопасной зоне, но пропорции и зазоры те же, что в логотипе.',
    body: maskableBody,
    raster: maskableBody,
  },
]

// ---------- роли иконок ----------
// Ролей две, и обе берут один и тот же знак из site.json: icon — без фона,
// maskable — на плите. Никаких «мелких» версий с другими зазорами нет: знак
// масштабируется целиком, поэтому иконка и логотип совпадают на всех размерах.
const byslug = (slug) => variants.find((v) => v.slug === slug)
const pick = {
  icon: byslug('mark'),
  maskable: byslug('maskable'),
}


// ---------- сборка SVG-файлов ----------
// Никаких defs и градиентов: знак тот же, что в логотипе, цвета — только
// акцентный оранжевый в правой плите. Прозрачный фон у варианта mark — это и
// есть требование «иконка без фона»: плиты лежат прямо на панели браузера.
const svgDoc = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="${esc(ARIA)}">
  ${body}
</svg>
`

// svgMono — одноцветный силуэт для mask-icon (закреплённая вкладка Safari):
// браузер берёт из файла альфа-канал, поэтому цвет здесь только чёрный.
const svgMono = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="${esc(ARIA)}">
  <style>.mark__side,.mark__accent{fill:#000}</style>
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
      '--default-background-color=00000000',
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
// --default-background-color=00000000 обязателен: без него Chrome сохраняет PNG
// без альфа-канала, и прозрачный фон знака становится белой плитой.
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
// key — поле в site.icons, role — какой знак (icon — без фона, maskable — на
// плите), size — размер в пикселях. Знак ровно один, поэтому роль не меняет
// пропорции: меняется только размер (в maskable знак ещё и меньше — нужна
// безопасная зона под маску системы).
const RASTER_PLAN = [
  { key: 'png16', role: 'icon', size: 16 },
  { key: 'png32', role: 'icon', size: 32 },
  { key: 'png48', role: 'icon', size: 48 },
  { key: 'appleTouch', role: 'maskable', size: 180 },
  { key: 'android192', role: 'icon', size: 192 },
  { key: 'android512', role: 'icon', size: 512 },
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
        <h2>${esc(v.title)} <code>${v.slug}</code>${v.slug === pick.icon.slug ? '<span class="badge">идёт в head</span>' : ''}</h2>
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
  <h1>Знак и фавикон — ${esc(site.brand)}</h1>
  <div class="lead">
    <p>Служебная страница генератора (в сборку не попадает). Знак один: те же три плиты, что в логотипе шапки, с одинаковым зазором 8 единиц знака и без фона. Здесь видно, как он читается в размерах вкладки и как выглядят готовые файлы из <code>public/</code>.</p>
    <p>Цвет плит знак берёт из темы браузера (как логотип — из <code>currentColor</code>): на светлой теме плиты тёмные <code>${NIGHT}</code>, на тёмной — светлые <code>${SNOW}</code>, поэтому на превью он такой, как в вашей системе. Правая плита всегда фирменный оранжевый <code>${FLAME}</code>. Пересобрать после правки геометрии в <code>src/data/site.json</code>: <code>node favicon/build.mjs</code></p>
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

// 1. SVG знака — в favicon/variants/ (в сборку не попадают: нужны для растров
//    и чтобы превью показывало знак)
for (const v of variants) writeFileSync(join(VARIANTS_DIR, `${v.slug}.svg`), svgDoc(v.body))
log(`SVG знака: ${variants.map((v) => v.slug).join(', ')} → favicon/variants/`)

// 2. Основной масштабируемый знак + одноцветный силуэт для закреплённой вкладки Safari
writeFileSync(join(PUBLIC_DIR, basename(ICONS.svg)), svgDoc(pick.icon.body))
writeFileSync(
  join(PUBLIC_DIR, basename(ICONS.safariPinnedTab)),
  svgMono(mark({ cx: 32, cy: 32, k: MARK_K })),
)
log(`${basename(ICONS.svg)} — знак без фона, тот же, что логотип в шапке`)

// 3. PNG и ICO
if (!ONLY_SVG) {
  if (!existsSync(CHROME)) {
    console.error(`[favicon] не найден Chrome: ${CHROME}\n          укажите путь через CHROME_PATH=/путь/к/chrome`)
    process.exit(1)
  }

  // Растр идёт из файла с постоянной заливкой, а не из favicon/variants/:
  // там у знака без фона цвет плит зависит от темы браузера, а PNG такую тему
  // передать не может — иконка должна получаться одинаковой на любой машине.
  mkdirSync(TMP_DIR, { recursive: true })
  const svgFiles = new Map(
    Object.entries(pick).map(([role, v]) => {
      const file = join(TMP_DIR, `raster-${v.slug}.svg`)
      writeFileSync(file, svgDoc(v.raster))
      return [role, file]
    }),
  )
  const smallPng = new Map()

  for (const { key, role, size } of RASTER_PLAN) {
    const out = join(PUBLIC_DIR, basename(ICONS[key]))
    raster(svgFiles.get(role), size, out)
    if (ICO_SIZES.includes(size)) smallPng.set(size, readFileSync(out))
    log(`${basename(ICONS[key])} — ${size}×${size} (${role}, тот же знак)`)
  }

  writeFileSync(
    join(PUBLIC_DIR, basename(ICONS.ico)),
    icoBuffer(ICO_SIZES.map((size) => ({ size, png: smallPng.get(size) }))),
  )
  log(`${basename(ICONS.ico)} — ${ICO_SIZES.join('/')} px (из файлов без фона)`)
}

// 4. Превью знака и готовых файлов
writeFileSync(join(FAVICON_DIR, 'preview.html'), previewHtml())
log('preview.html — превью знака в размерах и готовых файлов')
log('готово')


#!/usr/bin/env node
// assemble.mjs — собирает папку _site/ с хаб-страницей (список всех сайтов)
// и копирует туда все sait-*/dist. Запуск: node assemble.mjs <saits_dir>
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  cpSync,
  statSync,
  existsSync,
} from 'node:fs'
import { join, resolve } from 'node:path'

const SAITS_DIR = resolve(process.argv[2] || '.')
const OUT = join(SAITS_DIR, '_site')

const sites = readdirSync(SAITS_DIR)
  .filter((n) => /^sait-\d+$/.test(n) && existsSync(join(SAITS_DIR, n, 'dist', 'index.html')))
  .sort((a, b) => Number(a.split('-')[1]) - Number(b.split('-')[1]))

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/gi, '\u00a0')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&laquo;/gi, '«')
    .replace(/&raquo;/gi, '»')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function titleOf(site) {
  try {
    const html = readFileSync(join(SAITS_DIR, site, 'dist', 'index.html'), 'utf8')
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    if (m) return decodeEntities(m[1])
  } catch {
    /* ignore */
  }
  return site
}

const cards = sites
  .map((s) => {
    const num = s.replace('sait-', '')
    const t = escapeHtml(titleOf(s))
    return `      <a class="card" href="${s}">
        <span class="num">Вариант ${num}</span>
        <span class="title">${t}</span>
        <span class="go">Открыть →</span>
      </a>`
  })
  .join('\n')

const hub = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Защитные конструкции от БПЛА — варианты лендингов</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background: #0b1220; color: #e5e7eb; line-height: 1.5; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 48px 24px 80px; }
  header { padding: 40px 0 8px; }
  .eyebrow { font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: #67e8f9; margin: 0 0 12px; font-weight: 600; }
  h1 { font-size: 32px; margin: 0 0 10px; letter-spacing: -0.02em; }
  .sub { color: #94a3b8; max-width: 640px; margin: 0; font-size: 15px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; margin-top: 30px; }
  .card { display: flex; flex-direction: column; gap: 8px; padding: 20px; background: #111a2c; border: 1px solid #1e2a44; border-radius: 14px; text-decoration: none; color: inherit; transition: border-color .15s ease, transform .15s ease; }
  .card:hover { border-color: #67e8f9; transform: translateY(-2px); }
  .num { font-size: 12px; font-weight: 700; letter-spacing: .12em; color: #67e8f9; }
  .title { font-size: 15px; font-weight: 600; color: #f1f5f9; }
  .go { margin-top: auto; font-size: 13px; color: #64748b; }
  .card:hover .go { color: #67e8f9; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <p class="eyebrow">Демонстрация</p>
    <h1>Защитные конструкции от БПЛА</h1>
    <p class="sub">Варианты лендингов — выберите вариант, чтобы открыть его.</p>
  </header>
  <div class="grid">
${cards}
  </div>
</div>
</body>
</html>
`

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

writeFileSync(join(OUT, 'index.html'), hub)
writeFileSync(join(OUT, '.nojekyll'), '') // отключаем Jekyll-обработку на GitHub Pages

for (const s of sites) {
  cpSync(join(SAITS_DIR, s, 'dist'), join(OUT, s), { recursive: true })
}

console.log(`[assemble] сайтов: ${sites.length} → ${OUT}`)
console.log(`[assemble] хаб-страница: ${join(OUT, 'index.html')}`)

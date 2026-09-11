#!/usr/bin/env node
// fix-paths.mjs — переводит корневые абсолютные пути в относительные,
// чтобы сайты корректно открывались из подпапки (GitHub Pages).
// Запуск: node fix-paths.mjs <saits_dir>
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, resolve, dirname, relative, sep } from 'node:path'

const SAITS_DIR = resolve(process.argv[2] || '.')
const EXT = new Set(['.html', '.htm', '.css', '.svg', '.xml'])

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    const p = join(dir, name)
    let st
    try {
      st = statSync(p)
    } catch {
      continue
    }
    if (st.isDirectory()) walk(p, out)
    else {
      const i = p.lastIndexOf('.')
      if (i >= 0 && EXT.has(p.slice(i).toLowerCase())) out.push(p)
    }
  }
  return out
}

// префикс пути из папки, где лежит файл, до корня dist/.
// index.html лежит в корне dist → "./"; css в css/ → "../../../../" и т.д.
function relToDist(file, distDir) {
  const rel = relative(dirname(file), distDir).split(sep).join('/')
  return rel === '' ? './' : rel + '/'
}

// href="/…", src="/…", url(/…) → относительные; НЕ трогаем "//…" (protocol-relative)
// ВАЖНО: url() в CSS резолвится относительно самого CSS-файла (а не страницы),
// поэтому префикс зависит от глубины вложенности файла (relToDist), иначе
// браузер ищет картинку в css/… и получает 404.
function fix(s, prefix) {
  return s
    .replace(
      /(\b(?:href|src|action|poster|content|data-src|data-href|data-bg|data-background|xlink:href)\s*=\s*["'])\/(?!\/)/gi,
      '$1' + prefix,
    )
    .replace(/url\(\s*(['"]?)\/(?!\/)/gi, 'url($1' + prefix)
}

let changed = 0
for (const site of readdirSync(SAITS_DIR)) {
  const dist = join(SAITS_DIR, site, 'dist')
  let st
  try {
    st = statSync(dist)
  } catch {
    continue
  }
  if (!st.isDirectory()) continue

  for (const file of walk(dist)) {
    const before = readFileSync(file, 'utf8')
    const after = fix(before, relToDist(file, dist))
    if (after !== before) {
      writeFileSync(file, after)
      changed++
    }
  }
}

console.log(`[fix-paths] исправлено файлов: ${changed}`)

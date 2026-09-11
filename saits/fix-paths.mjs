#!/usr/bin/env node
// fix-paths.mjs — переводит корневые абсолютные пути в относительные,
// чтобы сайты корректно открывались из подпапки (GitHub Pages).
// Запуск: node fix-paths.mjs <saits_dir>
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

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

// href="/…", src="/…", url(/…) → относительные; НЕ трогаем "//…" (protocol-relative)
function fix(s) {
  return s
    .replace(
      /(\b(?:href|src|action|poster|content|data-src|data-href|data-bg|data-background|xlink:href)\s*=\s*["'])\/(?!\/)/gi,
      '$1./',
    )
    .replace(/url\(\s*(['"]?)\/(?!\/)/gi, 'url($1./')
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
    const after = fix(before)
    if (after !== before) {
      writeFileSync(file, after)
      changed++
    }
  }
}

console.log(`[fix-paths] исправлено файлов: ${changed}`)

// Build-time only. Без зависимостей и привязки к Vite.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
export const loadForm = () => JSON.parse(readFileSync(resolve(root, 'config/form.json'), 'utf8'))

export function mailAssets(site, form = loadForm()) {
  if (!/^https?:\/\//.test(site.baseUrl) || !site.brand) throw new Error('mail-form: site.brand and site.baseUrl required')
  const config = Buffer.from(JSON.stringify({
    form, site: { brand: site.brand, baseUrl: site.baseUrl },
  })).toString('base64')
  return [
    { fileName: 'api/lead.php', source: readFileSync(resolve(root, 'server/lead.php'), 'utf8') },
    { fileName: 'api/lead-config.php', source: `<?php\nreturn json_decode(base64_decode('${config}'), true);\n` },
  ]
}

// node mail-form/build.mjs path/to/site.json path/to/output
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [, , sitePath, output] = process.argv
  if (!sitePath || !output) throw new Error('Usage: node mail-form/build.mjs <site.json> <output-dir>')
  const site = JSON.parse(readFileSync(resolve(sitePath), 'utf8'))
  for (const asset of mailAssets(site)) {
    const destination = resolve(output, asset.fileName)
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, asset.source)
  }
}
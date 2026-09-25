import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { nunjucksPlugin } from './nunjucks-plugin.mjs'

const root = dirname(fileURLToPath(import.meta.url))

// Многостраничный билд: каждая страница сайта лежит в корне saits/sait-13.
const input = Object.fromEntries(
  readdirSync(root)
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file.replace(/\.html$/, ''), join(root, file)]),
)

export default defineConfig({
  base: './',
  plugins: [nunjucksPlugin(root), tailwindcss()],
  server: {
    port: 8013,
    host: true,
    open: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input },
  },
})

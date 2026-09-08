import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// Все HTML-страницы — входные точки для сборки (многостраничник).
const pages = [
  'index',
  'ugrozy',
  'konstrukcii',
  'princip',
  'proektirovanie',
  'primenenie',
  'montazh',
  'kompleksnaya',
]

const input = Object.fromEntries(
  pages.map((name) => [name, fileURLToPath(new URL(`${name}.html`, import.meta.url))]),
)

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    // Дев-сервер с hot reload на порту 8001.
    port: 8001,
  },
  build: {
    rollupOptions: {
      input,
    },
  },
})

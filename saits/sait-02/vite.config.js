import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

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
    port: 8002,
    strictPort: true,
  },
  build: {
    rollupOptions: { input },
  },
})

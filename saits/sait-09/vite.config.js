import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const pages = {
  index: 'index.html',
  ugrozy: 'ugrozy.html',
  konstrukcii: 'konstrukcii.html',
  princip: 'princip.html',
  proektirovanie: 'proektirovanie.html',
  primenenie: 'primenenie.html',
  montazh: 'montazh.html',
  kompleksnaya: 'kompleksnaya.html',
}

export default defineConfig({
  plugins: [tailwindcss()],
  base: './',
  server: { port: 8014, host: true },
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(pages).map(([name, file]) => [
          name,
          fileURLToPath(new URL(file, import.meta.url)),
        ]),
      ),
    },
  },
})

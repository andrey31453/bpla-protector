import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// sait-03 — самодостаточный одностраничный прототип (инлайн CSS + JS).
export default defineConfig({
  server: {
    port: 8003,
    host: true,
  },
  preview: {
    port: 8003,
  },
  build: {
    rollupOptions: {
      input: fileURLToPath(new URL('./index.html', import.meta.url)),
    },
  },
})

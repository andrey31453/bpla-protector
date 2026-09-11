import { defineConfig } from 'vite'

// sait-01 — один самодостаточный index.html.
// Dev-сервер доступен на http://localhost:8001
export default defineConfig({
  server: {
    port: 8001,
    open: false,
  },
  preview: {
    port: 8001,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})

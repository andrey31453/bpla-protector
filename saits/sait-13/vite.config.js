import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 8013,
    host: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})

import { defineConfig } from 'vite';

// Порт согласован с saits/dev.sh: sait-06 → http://localhost:8006
export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 8006,
    strictPort: true
  },
  build: {
    outDir: 'dist'
  }
});

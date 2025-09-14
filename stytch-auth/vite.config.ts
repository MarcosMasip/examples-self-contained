import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: './assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
  },
  plugins: [react()],
})
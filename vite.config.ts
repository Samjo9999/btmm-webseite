import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: './src',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    middlewareMode: false,
  },
  preview: {
    port: 4173,
    host: true,
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    outDir: 'dist',
    sourcemap: false,
  },
})

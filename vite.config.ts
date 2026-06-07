import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Plugin to strip `crossorigin` from the built HTML.
// Electron loads via file:// where `crossorigin` causes module scripts to fail.
const stripCrossoriginPlugin = (): Plugin => ({
  name: 'strip-crossorigin',
  transformIndexHtml(html) {
    return html.replace(/\s+crossorigin(=["'][^"']*["'])?/gi, '')
  },
})

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), stripCrossoriginPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
  build: {
    cssCodeSplit: false,
  },
})

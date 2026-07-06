import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.config'

// Store build (PAGELENS_STORE=1): omits the `debugger` permission and the
// deep-scan feature so Chrome Web Store review stays fast. Output goes to
// dist-store/ to keep it separate from the full dev build in dist/.
const isStore = process.env.PAGELENS_STORE === '1'

export default defineConfig({
  define: {
    __STORE_BUILD__: JSON.stringify(isStore),
  },
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: isStore ? 'dist-store' : 'dist',
  },
  server: {
    // crxjs requires a stable HMR port for the extension.
    port: 5173,
    strictPort: true,
    hmr: { port: 5173 },
  },
})

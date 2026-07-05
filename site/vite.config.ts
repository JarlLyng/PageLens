import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed as a GitHub Pages project site → served from /PageLens/.
// Override with SITE_BASE (e.g. "/" for a custom domain).
const base = process.env.SITE_BASE ?? '/PageLens/'

export default defineConfig({
  base,
  plugins: [react()],
})

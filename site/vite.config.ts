import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from the root of the custom domain (pagelens.iamjarl.com).
// Override with SITE_BASE if ever hosted under a sub-path again.
const base = process.env.SITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
})

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'
import '@iamjarl/design-tokens/components'
// The web-tools display face (#84). Imported from JS rather than @import in
// index.css so that Vite, not Tailwind's own @import inliner, resolves the
// sheet — Vite rebases the relative url() to the woff2 and emits the file
// from this site's origin. No CDN, no Google Fonts.
import '@iamjarl/design-tokens/fonts/outfit.css'
import '@iamjarl/design-tokens/identity/pagelens.css'

const root = document.getElementById('root')
if (!root) throw new Error('#root not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

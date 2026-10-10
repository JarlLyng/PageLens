import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './App'

/**
 * The home page as HTML, rendered once at build time by
 * prerender() in vite.config.ts and written into #root (#92).
 * main.tsx then hydrates it. Same tree as main.tsx renders, so the two match.
 */
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

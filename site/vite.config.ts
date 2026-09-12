import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Served from the root of the custom domain (pagelens.iamjarl.com).
// Override with SITE_BASE if ever hosted under a sub-path again.
const base = process.env.SITE_BASE ?? '/'

const require = createRequire(import.meta.url)

export type CrossLink = { href: string; label: string }

/**
 * The portfolio cross-links, read at build time from the design system's
 * pre-rendered fragment.
 *
 * <ij-footer> can generate these itself, but only after JavaScript runs, and
 * the crawlers that matter for discovery do not run JavaScript. Reading the
 * fragment here puts the same anchors in the served HTML.
 *
 * Resolved through the package's `exports` map rather than a hand-written
 * node_modules path, so a downgrade below v1.8.0 (which introduced
 * `./footers/*`) fails here instead of silently shipping no links.
 */
function readCrossLinks(): { html: string; links: CrossLink[] } {
  const path = require.resolve('@iamjarl/design-tokens/footers/pagelens.html')
  const html = readFileSync(path, 'utf8')

  const links: CrossLink[] = []
  const anchor = /<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g
  for (const match of html.matchAll(anchor)) {
    links.push({ href: match[1], label: match[2].trim() })
  }

  // A footer that renders an empty "More from IAMJARL" column is worse than a
  // failed build, and it would be easy to miss in review.
  if (links.length === 0) {
    throw new Error(
      `No cross-links parsed from ${path} — the fragment format changed.`,
    )
  }

  return { html, links }
}

const { html: crossLinksHtml, links: crossLinks } = readCrossLinks()

/** Inlines the fragment into the pre-JS markup in index.html. */
function inlineCrossLinks(): Plugin {
  const placeholder = '<!-- @ij-cross-links -->'
  return {
    name: 'pagelens:inline-cross-links',
    transformIndexHtml(html, ctx) {
      if (!html.includes(placeholder)) {
        throw new Error(
          `index.html is missing the ${placeholder} placeholder — the ` +
            `cross-links would not reach the served HTML.`,
        )
      }

      const filled = html
        .replace(placeholder, crossLinksHtml.trim())
        // React prints the current year; the pre-JS copy would otherwise be
        // frozen at whenever someone last edited the file by hand.
        .replaceAll('<!-- @ij-year -->', String(new Date().getFullYear()))

      // Comments are for whoever opens index.html, not for every visitor.
      // The pre-JS markup carries a lot of them, and the inlined fragment
      // brings its own "paste this by hand" header, which is doubly useless
      // once a build is doing the pasting. Dev keeps them so view-source
      // still explains itself. Must run after the substitutions above —
      // the placeholders are comments too.
      if (ctx.server) return filled
      return filled.replace(/<!--[\s\S]*?-->/g, '').replace(/\n\s*\n+/g, '\n')
    },
  }
}

export default defineConfig({
  base,
  plugins: [react(), inlineCrossLinks()],
  define: {
    // Same links, same source, for the footer React renders after mount.
    __IJ_CROSS_LINKS__: JSON.stringify(crossLinks),
  },
})

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build, defineConfig, type Plugin, type Rollup } from 'vite'
import react from '@vitejs/plugin-react'

// Served from the root of the custom domain (pagelens.iamjarl.com).
// Override with SITE_BASE if ever hosted under a sub-path again.
const base = process.env.SITE_BASE ?? '/'

const require = createRequire(import.meta.url)
const siteDir = dirname(fileURLToPath(import.meta.url))

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

const LINKS_PLACEHOLDER = '<!-- @ij-cross-links -->'
const YEAR_PLACEHOLDER = '<!-- @ij-year -->'
const SCRIPT_PLACEHOLDER = '<!-- @ij-footer-script -->'

/** Fills the cross-links and the year into one page's footer markup. */
function fillFooter(html: string, page: string): string {
  if (!html.includes(LINKS_PLACEHOLDER)) {
    throw new Error(
      `${page} is missing the ${LINKS_PLACEHOLDER} placeholder — the ` +
        `cross-links would not reach the served HTML.`,
    )
  }
  return (
    html
      .replace(LINKS_PLACEHOLDER, crossLinksHtml.trim())
      // React prints the current year on the home page; the pre-JS copies
      // would otherwise be frozen at whenever someone last edited them.
      .replaceAll(YEAR_PLACEHOLDER, String(new Date().getFullYear()))
  )
}

/**
 * Comments are for whoever opens the source, not for every visitor. The
 * footer markup carries a lot of them, and the inlined fragment brings its own
 * "paste this by hand" header, which is doubly useless once a build is doing
 * the pasting. Must run after the substitutions — the placeholders are
 * comments too.
 */
function stripComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, '').replace(/\n\s*\n+/g, '\n')
}

const PRERENDER_PLACEHOLDER = '<!-- @ij-prerender -->'

/**
 * The home page rendered to HTML, for #root in the served index.html (#92).
 *
 * Without this the home served a few hundred readable characters to anything
 * that does not run JavaScript; features, how-it-works and the FAQ appeared
 * only after the bundle ran. This builds src/entry-server.tsx for Node with
 * the same define as the client, runs it once, and returns the markup. The
 * client then hydrates that markup rather than replacing it.
 *
 * A separate, config-less build, so this plugin does not run inside itself.
 */
async function prerender(): Promise<string> {
  const result = (await build({
    configFile: false,
    root: siteDir,
    logLevel: 'warn',
    plugins: [react()],
    define: { __IJ_CROSS_LINKS__: JSON.stringify(crossLinks) },
    build: { ssr: 'src/entry-server.tsx', write: false, minify: false },
  })) as Rollup.RollupOutput
  const chunks = result.output.filter((file) => file.type === 'chunk')
  if (chunks.length !== 1) {
    throw new Error(`Prerender built ${chunks.length} chunks, expected 1.`)
  }

  // Written inside node_modules so that the bundle's bare imports (react,
  // react-dom/server) resolve to this site's own copies.
  const dir = join(siteDir, 'node_modules', '.cache', 'pagelens-prerender')
  mkdirSync(dir, { recursive: true })
  const file = join(dir, `entry-server-${process.pid}-${Date.now()}.mjs`)
  writeFileSync(file, chunks[0].code)
  try {
    const { render } = (await import(pathToFileURL(file).href)) as {
      render: () => string
    }
    const html = render()
    if (!html.includes('<h1') || !html.includes('id="faq"')) {
      throw new Error('Prerendered home is missing the hero or the FAQ.')
    }
    return html
  } finally {
    rmSync(file, { force: true })
  }
}

/**
 * The pages that live in public/ rather than going through Vite. Vite copies
 * them as they are, so transformIndexHtml never sees them; they are filled in
 * after the bundle is written instead (#79).
 */
const STATIC_PAGES = ['guide/index.html', 'privacy.html']

/**
 * The <ij-footer> component, as its own small file for the static pages. The
 * home page bundles it with React; these two pages load no bundle at all, so
 * they get the component alone. Content-hashed so it can be cached for good.
 */
const componentSource = readFileSync(
  require.resolve('@iamjarl/design-tokens/components'),
)
const componentFile = `assets/ij-footer-${createHash('sha256')
  .update(componentSource)
  .digest('hex')
  .slice(0, 8)}.js`

/**
 * The display face for the static pages (#84). The home page imports the
 * design system's sheets from main.tsx and Vite emits the woff2; these pages
 * load no bundle, so they get the same two sheets inlined into <head>, with the
 * font's relative url() pointed at the file Vite emitted. One font file, one
 * source, for every page.
 */
const DISPLAY_FACE_PLACEHOLDER = '<!-- @ij-display-face -->'
const FONT_BASENAME = 'outfit-latin-wght-normal'
const outfitCss = readFileSync(
  require.resolve('@iamjarl/design-tokens/fonts/outfit.css'),
  'utf8',
)
const identityCss = readFileSync(
  require.resolve('@iamjarl/design-tokens/identity/pagelens.css'),
  'utf8',
)

function displayFaceStyle(fontUrl: string): string {
  const fontFace = outfitCss.replace(
    /url\((['"]?)[^'")]*outfit-latin-wght-normal\.woff2\1\)/,
    `url('${fontUrl}')`,
  )
  if (fontFace === outfitCss) {
    throw new Error(
      "Could not find the woff2 url() in the design system's outfit.css — " +
        'its format changed.',
    )
  }
  const css = (fontFace + identityCss)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\n\s*\n+/g, '\n')
    .trim()
  return `<style>\n${css}\n</style>`
}

/**
 * Where each sitemap URL's content comes from, relative to site/. The sitemap
 * carries no hand-written <lastmod>: a date typed once in July and never
 * updated told Google there was nothing new to crawl (#80). It is taken from
 * the last commit that touched these paths instead.
 */
const SITEMAP_SOURCES: Record<string, string[]> = {
  'https://pagelens.iamjarl.com/': ['index.html', 'src'],
  'https://pagelens.iamjarl.com/guide/': ['public/guide/index.html'],
  'https://pagelens.iamjarl.com/privacy.html': ['public/privacy.html'],
}

function git(...args: string[]): string {
  return execFileSync('git', args, { cwd: siteDir, encoding: 'utf8' }).trim()
}

/**
 * Last-change dates per URL, or null when the history cannot be trusted. A
 * shallow clone — what actions/checkout gives by default — knows only the
 * newest commit, so every page would get today's date. That is as dishonest
 * as a stale date, so in that case no <lastmod> is emitted at all.
 */
function lastModified(): Record<string, string> | null {
  try {
    if (git('rev-parse', '--is-shallow-repository') === 'true') return null
    return Object.fromEntries(
      Object.entries(SITEMAP_SOURCES).map(([url, paths]) => [
        url,
        git('log', '-1', '--format=%cs', '--', ...paths),
      ]),
    )
  } catch {
    return null
  }
}

function buildSitemap(xml: string, dates: Record<string, string> | null) {
  if (xml.includes('<lastmod>')) {
    throw new Error(
      'public/sitemap.xml contains a hand-written <lastmod>; remove it — ' +
        'the build sets it from git history.',
    )
  }
  return xml.replace(/<loc>([^<]+)<\/loc>/g, (match, url: string) => {
    if (!(url in SITEMAP_SOURCES)) {
      throw new Error(
        `sitemap.xml lists ${url}, which has no entry in SITEMAP_SOURCES ` +
          `(vite.config.ts) — say which files it is built from.`,
      )
    }
    const date = dates?.[url]
    return date ? `${match}\n    <lastmod>${date}</lastmod>` : match
  })
}

function pagelensBuild(): Plugin {
  // Set in generateBundle, once Vite has named the woff2 it emitted.
  let fontFile: string | undefined
  return {
    name: 'pagelens:inline-cross-links',

    // The dev server leaves #root empty and main.tsx renders from scratch.
    async transformIndexHtml(html, ctx) {
      if (ctx.server) return html
      const parts = html.split(PRERENDER_PLACEHOLDER)
      if (parts.length !== 2) {
        throw new Error(
          `index.html must contain ${PRERENDER_PLACEHOLDER} exactly once, ` +
            `inside #root.`,
        )
      }
      // Comments are stripped around the rendered markup, not from it: React
      // separates adjacent text with <!-- --> and hydration relies on them.
      const [before, after] = parts.map(stripComments)
      return before + (await prerender()) + after
    },

    generateBundle(_options, bundle) {
      fontFile = Object.keys(bundle).find(
        (name) => name.includes(FONT_BASENAME) && name.endsWith('.woff2'),
      )
      this.emitFile({
        type: 'asset',
        fileName: componentFile,
        source: componentSource,
      })
    },

    // In dev, public/ is served untouched: the static pages show their
    // footer without cross-links and the sitemap without dates. Only the
    // build is what visitors and crawlers see.
    writeBundle({ dir }) {
      if (!dir) return

      const root = base.replace(/\/?$/, '/')
      if (!fontFile) {
        throw new Error(
          `No ${FONT_BASENAME}.woff2 in the bundle — is the design system's ` +
            `fonts/outfit.css still imported from main.tsx?`,
        )
      }
      const face = displayFaceStyle(`${root}${fontFile}`)
      const script = `<script type="module" src="${root}${componentFile}"></script>`
      for (const page of STATIC_PAGES) {
        const file = join(dir, page)
        const html = readFileSync(file, 'utf8')
        if (!html.includes(SCRIPT_PLACEHOLDER)) {
          throw new Error(
            `${page} is missing the ${SCRIPT_PLACEHOLDER} placeholder — its ` +
              `footer would never upgrade.`,
          )
        }
        if (!html.includes(DISPLAY_FACE_PLACEHOLDER)) {
          throw new Error(
            `${page} is missing the ${DISPLAY_FACE_PLACEHOLDER} placeholder — ` +
              `its headings would fall back to the system font.`,
          )
        }
        writeFileSync(
          file,
          stripComments(
            fillFooter(html, page)
              .replace(SCRIPT_PLACEHOLDER, script)
              .replace(DISPLAY_FACE_PLACEHOLDER, face),
          ),
        )
      }

      const dates = lastModified()
      if (!dates) {
        this.warn(
          'No usable git history (shallow clone?) — sitemap.xml ships ' +
            'without <lastmod> rather than with a wrong date.',
        )
      }
      const sitemap = join(dir, 'sitemap.xml')
      writeFileSync(sitemap, buildSitemap(readFileSync(sitemap, 'utf8'), dates))
    },
  }
}

export default defineConfig({
  base,
  plugins: [react(), pagelensBuild()],
  define: {
    // Same links, same source, for the footer React renders after mount.
    __IJ_CROSS_LINKS__: JSON.stringify(crossLinks),
  },
})

import { STORE_URL } from '../config'

// The portfolio cross-links are not written out here: they come from the
// design system's pre-rendered fragment, inlined at build time by the
// pagelens:inline-cross-links plugin in vite.config.ts and handed to this
// component as __IJ_CROSS_LINKS__. One source feeds both this footer and the
// pre-JS copy in index.html, so the two cannot drift.
//
// <ij-footer> would happily build these links itself, and did until now. But
// links it builds exist only after JavaScript runs, and the crawlers that
// matter for discovery do not run JavaScript — the same reason the hero has a
// pre-JS copy (#47). Providing them switches the component to its slotted
// path, so they are not rendered twice.
//
// The unslotted children at the end are the pre-upgrade fallback: custom
// elements render their own children until they upgrade, so that markup is
// what a visitor sees if the component script never loads.
export function Footer() {
  const year = new Date().getFullYear()

  // The component brings its own top border and vertical rhythm, but no
  // horizontal padding or max-width — by design, so each site frames it with
  // its own content width.
  return (
    <div className="mx-auto max-w-content px-6 pb-10">
      <ij-footer
        app="pagelens"
        tagline="See the carbon footprint of any web page."
        links-label="PageLens"
      >
        <a slot="links" href={STORE_URL}>
          Add to Chrome
        </a>
        <a slot="links" href="/guide/">
          Guide
        </a>
        <a slot="links" href="#faq">
          FAQ
        </a>
        <a slot="links" href="/privacy.html">
          Privacy
        </a>

        {__IJ_CROSS_LINKS__.map((link) => (
          <a key={link.href} slot="cross-links" href={link.href}>
            {link.label}
          </a>
        ))}

        <p slot="fineprint">
          © {year} IAMJARL · Powered by{' '}
          <a href="https://www.thegreenwebfoundation.org/co2-js/">CO2.js</a>{' '}
          &amp;{' '}
          <a href="https://www.thegreenwebfoundation.org/">
            The Green Web Foundation
          </a>
        </p>

        {/* Pre-upgrade fallback — not rendered once the element upgrades. */}
        <p>© {year} IAMJARL</p>
      </ij-footer>
    </div>
  )
}

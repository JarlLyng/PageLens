import { STORE_URL } from '../config'

// The portfolio cross-links (BotLens, Made by Human, iamjarl.com …) are not
// listed here: <ij-footer app="pagelens"> derives them from the design system's
// app registry, so they stay correct as the portfolio changes. We only slot in
// what is ours — PageLens's own links and the colophon.
//
// The unslotted children at the end are the pre-upgrade fallback: custom
// elements render their own children until they upgrade, so that markup is what
// a visitor sees if the component script never loads.
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

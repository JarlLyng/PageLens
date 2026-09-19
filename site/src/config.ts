// Chrome Web Store listing for the published PageLens extension.
export const STORE_URL =
  'https://chromewebstore.google.com/detail/pagelens/mkajolhhjdlpmjlgdfnmbhfpbbeebgja'

/** Where on the page a store link sits, for attributing the click. */
export type StorePlacement = 'header' | 'hero' | 'midpage' | 'footer'

/**
 * Umami attributes for a link that leaves the site for the Chrome Web Store.
 *
 * Spread onto the anchor rather than written out at each call site: the event
 * name and store are the portfolio-wide convention, and a typo in either would
 * not fail anything — it would quietly split the metric into two, which is the
 * kind of bug you only find months later when the numbers look wrong.
 *
 * Umami is cookieless and this sends no personal data and no click ID, which
 * is what the privacy policy already describes.
 */
export function storeClickAttrs(placement: StorePlacement) {
  return {
    'data-umami-event': 'store-click',
    'data-umami-event-store': 'chrome-web-store',
    'data-umami-event-placement': placement,
    'data-umami-event-locale': 'en',
  } as const
}

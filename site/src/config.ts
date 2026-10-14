// The source, for the header (#92). The methodology is the product's argument.
export const GITHUB_URL = 'https://github.com/JarlLyng/PageLens'

/**
 * The store link and its Umami click event for a text link, from the design
 * system's registry (#102): the listing URL, `store-click` and its store,
 * placement and locale. Spread onto the anchor.
 *
 * Read from the registry rather than written out here: a typo in the event or
 * the store would not fail anything, it would quietly split the metric in
 * two. Umami is cookieless and this sends no personal data and no click ID,
 * which is what the privacy policy already describes.
 *
 * `nav` is the header's call to action and `footer` the footer's link. The
 * hero and the closing call to action carry the badge instead (StoreBadge).
 */
export function storeLink(placement: 'nav' | 'footer') {
  return __IJ_STORE__[placement]
}

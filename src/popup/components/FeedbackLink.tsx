/** The one support address across IAMJARL apps (#81). */
export const SUPPORT_EMAIL = 'support@iamjarl.com'

/**
 * A mailto URL with the subject prefilled, so a reply arrives already labelled
 * with the product and the exact version the person is running.
 *
 * Deliberately no body and no page URL: PageLens promises that only a
 * hostname ever leaves the device, and a feedback link should not quietly
 * draft an email containing the page someone was on. What to share is theirs
 * to write.
 */
export function feedbackHref(version: string): string {
  const subject = encodeURIComponent(`PageLens ${version} feedback`)
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}`
}

/**
 * Shown on every popup state, including errors — a scan that fails is when
 * someone most wants to say so. The extension collects no usage data, so what
 * people choose to send is how you learn how it is used, and a private route
 * gives an unhappy user somewhere to go other than a public review.
 */
export function FeedbackLink() {
  const version = chrome.runtime.getManifest().version
  return (
    <footer className="flex justify-center border-t border-ij-border pt-3 text-xs text-ij-text-secondary">
      <a
        href={feedbackHref(version)}
        target="_blank"
        rel="noopener"
        className="underline-offset-2 hover:text-ij-text hover:underline"
      >
        Send feedback
      </a>
    </footer>
  )
}

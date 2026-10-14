/**
 * The design system's store button: the Chrome Web Store badge, its link and
 * click event, and the facts line, as the registry generates them (#102).
 *
 * Inserted as the fragment's own HTML, not rebuilt in JSX, so the served page
 * carries exactly what the design system published, version comment included:
 * the hub's store check compares the two. The only change on the way in is
 * that the badge is served from this site (vite.config.ts).
 */
export function StoreBadge({
  placement,
  className,
}: {
  placement: 'hero' | 'midpage'
  className?: string
}) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: __IJ_STORE__[placement] }}
    />
  )
}

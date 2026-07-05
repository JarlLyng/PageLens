export function Methodology() {
  return (
    <details className="rounded-ij-md border border-ij-border text-sm">
      <summary className="cursor-pointer list-none p-2.5 font-semibold">
        How this is calculated
      </summary>
      <div className="flex flex-col gap-2 border-t border-ij-border px-2.5 py-2 text-xs leading-relaxed text-ij-text-secondary">
        <p>
          PageLens gives an <strong>actionable estimate</strong>, not an exact
          measurement.
        </p>
        <ul className="flex list-disc flex-col gap-1 pl-4">
          <li>
            <strong>Page weight</strong> comes from the browser&rsquo;s Resource
            Timing API. Cross-origin files without timing headers report no
            transfer size, so those bytes are approximated and marked
            &ldquo;estimated&rdquo;.
          </li>
          <li>
            <strong>Carbon</strong> uses CO2.js (Sustainable Web Design model)
            from The Green Web Foundation, applied to transferred bytes.
          </li>
          <li>
            <strong>Green hosting</strong> is looked up via the Green Web
            Foundation greencheck API and cached per domain.
          </li>
          <li>
            <strong>Eco Score</strong> blends carbon (40%), page weight (30%),
            green hosting (15%) and best practices (15%) into 0&ndash;100 and an
            A&ndash;F grade.
          </li>
        </ul>
        <p className="text-ij-text-tertiary">
          Note: true &ldquo;unused JavaScript&rdquo; needs a page reload with
          deeper instrumentation and isn&rsquo;t measured in this quick scan.
        </p>
      </div>
    </details>
  )
}

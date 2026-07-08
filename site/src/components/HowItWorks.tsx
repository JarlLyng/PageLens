const STEPS = [
  {
    n: '1',
    title: 'Measure',
    body: 'PageLens reads the transferred bytes of every resource on the page using the browser’s Performance API.',
  },
  {
    n: '2',
    title: 'Estimate',
    body: 'Those bytes feed CO2.js to estimate emissions, adjusted for whether the host runs on green energy.',
  },
  {
    n: '3',
    title: 'Score & advise',
    body: 'The result becomes an A–F Eco Score with a prioritized, plain-language list of what to fix first.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="border-y border-ij-border bg-ij-muted">
      <div className="mx-auto max-w-content px-6 py-20">
        <h2 className="mb-12 text-3xl font-bold">How it works</h2>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-ij-primary font-bold text-ij-on-primary">
                {s.n}
              </span>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ij-text-secondary">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-12 max-w-2xl rounded-ij-md border border-ij-border bg-ij-bg p-4 text-sm text-ij-text-secondary">
          PageLens gives an{' '}
          <strong className="text-ij-text">actionable estimate</strong>, not an
          exact measurement. It’s transparent about its methodology and clearly
          flags any figure it has to approximate.
        </p>
      </div>
    </section>
  )
}

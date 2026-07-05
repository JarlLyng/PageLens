const FEATURES = [
  {
    icon: '🎯',
    title: 'Eco Score, A–F',
    body: 'One 0–100 score blending carbon, page weight, green hosting and best practices — inspired by Lighthouse.',
  },
  {
    icon: '🌍',
    title: 'Carbon estimate',
    body: 'Grams of CO₂ per view and a yearly projection, using CO2.js (Sustainable Web Design model).',
  },
  {
    icon: '⚡',
    title: 'Green hosting check',
    body: 'Instantly see whether the site runs on green energy via The Green Web Foundation.',
  },
  {
    icon: '📊',
    title: 'Page-weight breakdown',
    body: 'Transferred bytes by type — HTML, JS, CSS, images, fonts, video — plus third-party share.',
  },
  {
    icon: '🛠️',
    title: 'Actionable fixes',
    body: 'Prioritized recommendations: oversized images, heavy JS, autoplay video, and more.',
  },
  {
    icon: '🔬',
    title: 'Deep scan',
    body: 'Opt-in DevTools-Protocol scan for exact transferred bytes and real unused JavaScript & CSS.',
  },
]

export function Features() {
  return (
    <section className="mx-auto max-w-content px-6 py-20">
      <h2 className="mb-3 text-center text-3xl font-bold">
        Everything you need to make pages lighter
      </h2>
      <p className="mx-auto mb-12 max-w-xl text-center text-ij-text-secondary">
        Built for developers, designers, agencies and sustainability teams.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex flex-col gap-2 rounded-ij-lg border border-ij-border bg-ij-card p-6"
          >
            <span className="text-2xl" aria-hidden>
              {f.icon}
            </span>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-ij-text-secondary">
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

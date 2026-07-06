// Keep these Q&As in sync with the FAQPage JSON-LD in index.html.
export const FAQ_ITEMS = [
  {
    q: 'What is PageLens?',
    a: 'PageLens is a free Chrome extension that estimates the carbon footprint of any web page and turns it into an actionable A–F Eco Score, with concrete recommendations to make the page lighter.',
  },
  {
    q: 'How does PageLens estimate CO₂ emissions?',
    a: 'It measures the bytes transferred when a page loads and applies CO2.js (the Sustainable Web Design model) from The Green Web Foundation, adjusting the estimate for whether the site is hosted on green energy.',
  },
  {
    q: 'How is the Eco Score calculated?',
    a: 'The Eco Score is a 0–100 rating, graded A–F, that blends four factors: carbon per view (40%), page weight (30%), green hosting (15%) and best practices (15%).',
  },
  {
    q: 'Is PageLens free?',
    a: 'Yes. PageLens is completely free to use and open about how its score is calculated.',
  },
  {
    q: 'Does PageLens collect my data?',
    a: 'No. PageLens analyzes the current page locally in your browser. Only the site’s hostname is sent to The Green Web Foundation to check for green hosting. There is no tracking, no analytics, and no account required.',
  },
  {
    q: 'Is the carbon estimate exact?',
    a: 'No — it is an actionable estimate, not a precise measurement. PageLens is transparent about its methodology and clearly flags any figure it has to approximate, such as cross-origin resources without timing data.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-content px-6 py-20">
      <h2 className="mb-10 text-center text-3xl font-bold">
        Frequently asked questions
      </h2>
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {FAQ_ITEMS.map((item) => (
          <div
            key={item.q}
            className="rounded-ij-lg border border-ij-border bg-ij-card p-6"
          >
            <h3 className="mb-2 text-lg font-semibold">{item.q}</h3>
            <p className="text-ij-text-secondary">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

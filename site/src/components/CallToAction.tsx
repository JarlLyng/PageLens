const REPO_URL = 'https://github.com/JarlLyng/PageLens'

export function CallToAction() {
  return (
    <section className="mx-auto max-w-content px-6 py-20 text-center">
      <div className="rounded-ij-lg bg-ij-primary px-6 py-16 text-ij-on-primary">
        <h2 className="mb-3 text-3xl font-bold">Make your web lighter</h2>
        <p className="mx-auto mb-8 max-w-md opacity-90">
          Install PageLens and get an Eco Score for the page you’re on in one
          click.
        </p>
        <a
          href={REPO_URL}
          className="inline-block rounded-ij-md bg-ij-on-primary px-6 py-3 font-semibold text-ij-primary transition-transform hover:scale-105"
        >
          Get PageLens
        </a>
      </div>
    </section>
  )
}

import { STORE_URL } from '../config'

export function CallToAction() {
  return (
    <section className="mx-auto max-w-content px-6 py-20 text-center">
      <div className="rounded-ij-lg bg-ij-primary px-6 py-16 text-ij-on-primary">
        <h2 className="mb-3 text-3xl font-bold">Make your web lighter</h2>
        <p className="mx-auto mb-8 max-w-md opacity-90">
          PageLens gives you an Eco Score for the page you&rsquo;re on in one
          click.
        </p>
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener"
          className="inline-block rounded-ij-md bg-ij-on-primary px-6 py-3 font-semibold text-ij-primary transition-transform hover:scale-105"
        >
          Add to Chrome — free
        </a>
      </div>
    </section>
  )
}

import { StoreBadge } from './StoreBadge'

export function CallToAction() {
  return (
    <section className="mx-auto max-w-content px-6 py-20">
      <div className="rounded-ij-lg bg-ij-primary px-8 py-14 text-ij-on-primary">
        <h2 className="mb-3 text-3xl font-bold">Make your web lighter</h2>
        <p className="mb-8 max-w-md opacity-90">
          PageLens gives you an Eco Score for the page you&rsquo;re on in one
          click.
        </p>
        {/* The badge's facts line in the panel's own text colour: the page's
            secondary text is not legible on the primary colour. */}
        <StoreBadge
          placement="midpage"
          className="[&_.ij-store-facts]:text-ij-on-primary"
        />
      </div>
    </section>
  )
}

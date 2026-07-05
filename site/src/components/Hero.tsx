import { PopupMock } from './PopupMock'

const REPO_URL = 'https://github.com/JarlLyng/PageLens'

export function Hero() {
  return (
    <header className="border-b border-ij-border">
      <nav className="mx-auto flex max-w-content items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-ij-sm bg-ij-primary font-bold text-ij-on-primary">
            P
          </span>
          <span className="text-lg font-semibold">PageLens</span>
        </div>
        <a
          href={REPO_URL}
          className="text-sm font-medium text-ij-text-secondary transition-colors hover:text-ij-text"
        >
          GitHub ↗
        </a>
      </nav>

      <div className="mx-auto grid max-w-content items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-full bg-ij-primary-subtle px-3 py-1 text-xs font-semibold text-ij-primary">
            Chrome extension
          </span>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            See the carbon footprint of any web page.
          </h1>
          <p className="max-w-md text-lg text-ij-text-secondary">
            PageLens estimates a page&rsquo;s digital emissions and turns them
            into an actionable A&ndash;F Eco Score — with concrete ways to make
            the web lighter.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={REPO_URL}
              className="rounded-ij-md bg-ij-primary px-5 py-3 font-semibold text-ij-on-primary transition-colors hover:bg-ij-primary-hover"
            >
              Get PageLens
            </a>
            <a
              href="#how"
              className="rounded-ij-md border border-ij-border px-5 py-3 font-semibold text-ij-text transition-colors hover:border-ij-border-strong"
            >
              How it works
            </a>
          </div>
          <p className="text-xs text-ij-text-tertiary">
            Free &amp; open methodology · Powered by CO2.js &amp; The Green Web
            Foundation
          </p>
        </div>

        <div className="flex justify-center md:justify-end">
          <PopupMock />
        </div>
      </div>
    </header>
  )
}

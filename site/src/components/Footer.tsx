const REPO_URL = 'https://github.com/JarlLyng/PageLens'

export function Footer() {
  return (
    <footer className="border-t border-ij-border">
      <div className="mx-auto flex max-w-content flex-col items-center gap-4 px-6 py-10 text-sm text-ij-text-secondary sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-ij-sm bg-ij-primary text-xs font-bold text-ij-on-primary">
            P
          </span>
          <span>PageLens</span>
        </div>
        <nav className="flex flex-wrap items-center gap-5">
          <a href={REPO_URL} className="transition-colors hover:text-ij-text">
            GitHub
          </a>
          <a
            href="https://www.thegreenwebfoundation.org/co2-js/"
            className="transition-colors hover:text-ij-text"
          >
            CO2.js
          </a>
          <a
            href="https://www.thegreenwebfoundation.org/"
            className="transition-colors hover:text-ij-text"
          >
            Green Web Foundation
          </a>
        </nav>
        <span className="text-ij-text-tertiary">
          © {new Date().getFullYear()} Jarl Lyng
        </span>
      </div>
    </footer>
  )
}

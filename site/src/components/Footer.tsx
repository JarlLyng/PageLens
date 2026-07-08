import { STORE_URL } from '../config'

const PAGELENS_LINKS = [
  { label: 'Add to Chrome', href: STORE_URL },
  { label: 'Guide', href: '/guide/' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Privacy', href: '/privacy.html' },
]

const IAMJARL_PROJECTS = [
  { label: 'IAMJARL', href: 'https://iamjarl.com/' },
  { label: 'Made by Human', href: 'https://madebyhuman.iamjarl.com/' },
  { label: 'BotLens', href: 'https://botlens.iamjarl.com/' },
]

function LinkColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-ij-text-tertiary">
        {title}
      </h2>
      <ul className="flex flex-col gap-2 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-ij-text-secondary transition-colors hover:text-ij-text"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-ij-border">
      <div className="mx-auto grid max-w-content gap-10 px-6 py-12 sm:grid-cols-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-ij-sm bg-ij-primary text-xs font-bold text-ij-on-primary">
              P
            </span>
            <span className="font-semibold">PageLens</span>
          </div>
          <p className="max-w-xs text-sm text-ij-text-secondary">
            Website carbon footprint, by IAMJARL.
          </p>
          <p className="text-xs text-ij-text-tertiary">
            Powered by{' '}
            <a
              href="https://www.thegreenwebfoundation.org/co2-js/"
              className="underline transition-colors hover:text-ij-text-secondary"
            >
              CO2.js
            </a>{' '}
            &amp;{' '}
            <a
              href="https://www.thegreenwebfoundation.org/"
              className="underline transition-colors hover:text-ij-text-secondary"
            >
              The Green Web Foundation
            </a>
          </p>
        </div>

        <LinkColumn title="PageLens" links={PAGELENS_LINKS} />
        <LinkColumn title="More from IAMJARL" links={IAMJARL_PROJECTS} />
      </div>

      <div className="border-t border-ij-border">
        <p className="mx-auto max-w-content px-6 py-6 text-sm text-ij-text-tertiary">
          © {new Date().getFullYear()} IAMJARL
        </p>
      </div>
    </footer>
  )
}

# PageLens

[![CI](https://github.com/JarlLyng/PageLens/actions/workflows/ci.yml/badge.svg)](https://github.com/JarlLyng/PageLens/actions/workflows/ci.yml)

A Chrome extension (Manifest V3) that estimates the carbon footprint of the page
you're viewing and turns it into an actionable A–F sustainability score.

🌐 **Website:** https://pagelens.iamjarl.com · 📐 **Design:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

The marketing site lives in [`site/`](site/) (Vite + React, deployed to GitHub
Pages via [`.github/workflows/deploy-site.yml`](.github/workflows/deploy-site.yml)).

## Tech stack

React · TypeScript · Vite · `@crxjs/vite-plugin` · Tailwind CSS · Chrome MV3

Styling is driven by the [iamjarl-design](https://github.com/JarlLyng/iamjarl-design)
token system (`@iamjarl/design-tokens`). Its CSS custom properties are imported in
`src/popup/index.css` and mapped onto Tailwind's theme as `ij-*` colors,
`rounded-ij-*` radii, and the `font-sans`/`font-mono` families. Tokens auto-switch
light/dark via `prefers-color-scheme`. The A–F Eco grade + impact colors are a
separate local data-viz scale (`eco-*`), since the token system has no grade gradient.

## Getting started

```bash
npm install
npm run dev     # HMR dev build (writes to dist/, reloads the extension)
npm run build   # production build → dist/
npm test        # unit tests for the core/ analysis logic
npm run icons   # regenerate toolbar icons → public/icons/
```

Toolbar icons are generated (no binary assets in the repo) by
`scripts/generate-icons.mjs`, a dependency-free PNG encoder that draws the
brand-purple lens mark at 16/32/48/128 px.

## Chrome Web Store

The published build omits the `debugger` permission (and deep scan) for faster
review:

```bash
npm run package:store   # → pagelens-store.zip from a debugger-free dist-store/
```

See [docs/chrome-store-listing.md](docs/chrome-store-listing.md) for the full
submission guide and listing copy, and [PRIVACY.md](PRIVACY.md) /
[the hosted policy](https://pagelens.iamjarl.com/privacy.html).

## Load the extension in Chrome

1. Run `npm run dev` (or `npm run build`).
2. Open `chrome://extensions`.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select the `dist/` folder.
5. Pin PageLens and click its toolbar icon on any page.

During `npm run dev`, crxjs hot-reloads the extension on source changes.

## Status

**MVP complete.** Click the toolbar icon on any page to get:

- Eco Score (0–100) with an A–F grade
- Estimated CO₂ per view + configurable yearly projection (CO2.js / SWD model)
- Green-hosting status (Green Web Foundation, cached per domain)
- Page-weight breakdown by resource type + third-party share
- Prioritized recommendations (High / Medium / Low)
- Methodology explainer

**Deep scan (opt-in):** the "Run deep scan" button attaches the DevTools Protocol
(`chrome.debugger`) and reloads the page to measure **exact** transferred bytes
(including cross-origin) and **real unused JavaScript and CSS** via V8 precise
coverage + CSS rule-usage tracking. It shows Chrome's "PageLens is debugging this
browser" banner while it runs — hence the explicit opt-in. The quick scan
(Performance API) needs no such permission.

The pure analysis logic lives in `src/core/` and is covered by unit tests
(`npm test`). Remaining post-MVP ideas (history/compare across visits, PDF export)
are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

# CLAUDE.md — PageLens

Quick-start context for developers and AI assistants. Detailed design in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## What is PageLens?

PageLens is a free Chrome extension (Manifest V3) that estimates the carbon
footprint of the web page you're viewing and turns it into an actionable A–F
Eco Score with recommendations. It analyzes the current page **locally** in the
browser; the only data that leaves the device is the site's **hostname**, sent
to The Green Web Foundation to check green hosting. No accounts, no analytics in
the extension, no tracking.

- **Developer:** Jarl Lyng / [IAMJARL](https://iamjarl.com)
- **Website:** [pagelens.iamjarl.com](https://pagelens.iamjarl.com)
- **License:** [MIT](LICENSE) — open source.
- **Price:** Free (no in-app purchases, no subscription, no ads)
- **Status:** Launched — [Chrome Web Store](https://chromewebstore.google.com/detail/pagelens/mkajolhhjdlpmjlgdfnmbhfpbbeebgja) (item `mkajolhhjdlpmjlgdfnmbhfpbbeebgja`). Current version `1.1.0` (see [CHANGELOG](CHANGELOG.md)).
- **The outlier:** unlike most IAMJARL apps (native Apple, pay-once), PageLens
  is a free, open-source web extension — chosen deliberately for its use case.

## Strategy lives in the private hub

Target audience, positioning, pricing reasoning, SEO/marketing playbooks, and
competitor analysis are **not** in this public repo — they're in the private
[iamjarl-strategy](https://github.com/JarlLyng/iamjarl-strategy) hub (folder
`PageLens/`). Before any audience/positioning/marketing-planning work, read that
repo's `CONVENTIONS.md` and `SEO_GUIDANCE.md` and write results **there**, not
here. This public repo keeps only code, normal OSS docs, and the marketing site.

## App features (be precise — do not invent features that don't exist)

- **Quick scan** (default, no special permission): reads the page's
  `PerformanceResourceTiming`, classifies resources, and produces a page-weight
  breakdown, third-party share, a CO₂ estimate (CO2.js, SWD model), a green-
  hosting check (Green Web Foundation), an A–F Eco Score, and recommendations.
- **Deep scan** (opt-in): attaches `chrome.debugger`, reloads the page, and
  measures **exact** transferred bytes plus **real unused JS & CSS** (V8 precise
  coverage + CSS rule-usage). Not in the published store build.
- **Configurable monthly visits** for the yearly carbon projection (stored via
  `chrome.storage`).

### Features that do NOT exist (common hallucination targets)

- No accounts, login, or cloud sync.
- No history / compare-across-visits or trend graphs (yet — roadmap).
- No PDF export (yet — roadmap).
- No SPA route-change re-scan (single-load snapshot only).
- No unused-JS/CSS measurement in **quick** scan — that's deep-scan only.
- No analytics or tracking in the extension; no data sold or shared.
- The published store build has **no** `debugger` permission / deep scan.

## Requirements

- Google Chrome (Manifest V3). Node 20+ to build (see `.nvmrc`).

## Build & run

```bash
npm install
npm run dev            # HMR build → dist/, load unpacked in chrome://extensions
npm run build          # production (full, incl. deep scan) → dist/
npm run package:store  # debugger-free store zip → pagelens-store.zip
npm test               # vitest (core/ analysis logic)
npm run lint           # eslint
npm run format         # prettier
```

The marketing site lives in [`site/`](site/) (its own `npm` project).

## Conventions

- Pure, framework-free analysis in `src/core/` (unit-tested); Chrome APIs only
  at the edges (`background/`, `content/`, `popup/`).
- Styling uses [`iamjarl-design`](https://github.com/JarlLyng/iamjarl-design)
  tokens — no hardcoded colors/spacing/radius/type. Light + dark, WCAG AA.
- Privacy-first: the only off-device call is the hostname greencheck (disclosed
  in [PRIVACY.md](PRIVACY.md)).
- Scoring thresholds live in `src/core/constants.ts`, pinned by
  `tests/calibration.test.ts`.

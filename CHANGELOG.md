# Changelog

All notable changes to PageLens are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/), and this project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- Third-party detection now recognises hosting platforms. Resources from a
  different account on the same platform (`github.io`, `vercel.app`,
  `netlify.app`, `pages.dev`, `blogspot.com`, `s3.amazonaws.com` …) were
  counted as first-party, which under-reported the third-party share and
  flattered the score. **Pages hosted on those platforms may score slightly
  lower**, and more accurately; ordinary domains are unaffected.

### Internal

- Dependency housekeeping: Vite 7 for the extension build, design system
  v1.9.0, tldts 7.4.12, `@types/chrome` 0.2.9, eslint 10.10.0.
- Publish workflow moved to Chrome Web Store API V2 (`chrome-webstore-upload-cli`
  v4) ahead of Google retiring V1 on 15 October 2026.

## [1.1.0] - 2026-07-18

### Changed

- Updated to CO2.js 0.19 (newer Sustainable Web Design model). Carbon estimates
  are now lower and more accurate — a median page is ~0.34 g (was ~0.88 g).
- Recalibrated the carbon thresholds so the **A–F grade distribution is
  unchanged**; only the displayed CO₂ figure moves.

### Internal

- Dependency & tooling housekeeping (`@types/chrome`, `eslint-plugin-react-hooks`,
  GitHub Actions, Pages deploy actions).

## [1.0.0] - 2026-07-06

First public release on the Chrome Web Store.

### Added

- Deep scan (opt-in): exact transferred bytes plus real unused JavaScript & CSS
  via the DevTools Protocol (V8 precise coverage + CSS rule-usage tracking).
- Marketing site at [pagelens.iamjarl.com](https://pagelens.iamjarl.com) with a
  sustainable web design guide.

### Changed

- Recalibrated the Eco Score thresholds against real-world data (HTTP Archive
  page-weight medians + actual CO2.js SWD output) so a typical page lands
  mid-scale (C/D) rather than failing. Green hosting is the deciding factor at
  the median.

## [0.1.0] - 2026-07-05

Initial MVP (unlisted).

### Added

- Eco Score (0–100, graded A–F) blending carbon, page weight, green hosting and
  best practices.
- CO₂ estimate per view + configurable yearly projection (CO2.js, SWD model).
- Green-hosting check via The Green Web Foundation, cached per domain.
- Page-weight breakdown by resource type with third-party share.
- Prioritized recommendations and a methodology explainer.

# Contributing to PageLens

Thanks for your interest in improving PageLens! This guide covers how to get set
up and the conventions the project follows.

## Development setup

Requires **Node 20+** (see `.nvmrc`).

```bash
npm install
npm run dev        # HMR build → dist/, hot-reloads the loaded extension
```

Load the extension: open `chrome://extensions`, enable **Developer mode**, click
**Load unpacked**, and select the `dist/` folder.

## Before you open a PR

```bash
npm run typecheck   # tsc --noEmit
npm test            # unit tests (vitest)
npm run build       # production build
npm run format      # apply Prettier
```

CI runs type-check, tests, and build on every PR — they must pass.

## Project conventions

- **`src/core/` is pure and framework-free.** No `chrome.*` or DOM access lives
  there — only typed, unit-tested logic (classify, aggregate, carbon, score,
  recommendations, coverage). This is where most behavior changes belong, and it
  is the easiest place to add tests.
- **Chrome APIs stay at the edges** — `src/background/` (service worker),
  `src/content/` (injected collector), and `src/popup/` (React UI).
- **Scoring thresholds** live in `src/core/constants.ts`. If you change them,
  update `tests/calibration.test.ts` so the grade distribution stays intentional.
- Match the surrounding style; Prettier enforces formatting.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full design.

## Reporting bugs & requesting features

Use the [issue templates](.github/ISSUE_TEMPLATE). For bugs, include your Chrome
version, the scan mode (quick/deep), and the page if it's shareable.

## Security

Please report vulnerabilities privately — see [SECURITY.md](SECURITY.md).

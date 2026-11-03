# PageLens — Architecture

How the extension is built, as it is in the code today. A Chrome MV3 extension
that estimates the carbon footprint of the current page and turns it into an
A–F Eco Score with recommendations.

Numbers that tune the result (score thresholds, rule limits, cache lifetime)
are not repeated here: they live in
[`src/core/constants.ts`](../src/core/constants.ts), and the grade
distribution they produce is pinned by
[`tests/calibration.test.ts`](../tests/calibration.test.ts).

---

## 1. How bytes are measured: two scans

Everything else (weight, CO₂, score, recommendations) depends on how many bytes
the page transferred. The browser offers three ways to find out:

| Approach                                  | Byte accuracy                                                                                   | Permission cost                                                       | Needs reload |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------ |
| **PerformanceResourceTiming** (injected)  | Good for same-origin and Timing-Allow-Origin hosts; `transferSize` is 0 for opaque cross-origin | `activeTab` + `scripting`, no banner                                  | No           |
| **`chrome.debugger`** (DevTools Protocol) | Exact: real transferred bytes per response, plus JS and CSS coverage                            | `debugger`, which shows a "PageLens is debugging this browser" banner | Yes          |
| **`chrome.webRequest`**                   | Poor: MV3 gives no reliable encoded sizes                                                       | `webRequest` + broad host permissions                                 | No           |

PageLens uses the first two:

- **Quick scan** (default). `chrome.scripting.executeScript` runs
  [`collectPageResources`](../src/content/collector.ts) in the page, which reads
  the resource and navigation timing entries and counts `<video autoplay>`. No
  banner, no reload. Where a cross-origin `transferSize` is 0, the bytes fall
  back to `encodedBodySize`, then `decodedBodySize`, and are counted as
  **estimated** (`resolveBytes` in `core/classify.ts`); the popup says how much
  of the total that is.
- **Deep scan** (opt-in, full build only).
  [`background/deep-scan.ts`](../src/background/deep-scan.ts) attaches the
  debugger, enables `Network`, `Page`, `Profiler` (precise coverage), `DOM` and
  `CSS` (rule-usage tracking), reloads the tab ignoring the cache, waits for
  the load event plus a short settle, then reads exact bytes per response and
  the JS and CSS coverage, and detaches. This is the only scan that measures
  **unused JS and CSS**.

The published store build leaves the deep scan out entirely: see section 6.

---

## 2. Components

```
┌─────────────┐  ANALYZE / DEEP_SCAN  ┌────────────────────────────┐
│   Popup     │ ────────────────────▶ │  Service worker            │
│ (React app) │ ◀──────────────────── │  - runs core/ pipeline      │
└─────────────┘   AnalysisSnapshot    │  - Green Web Foundation     │
                                      │  - deep scan (full build)   │
                                      └──────┬──────────────┬──────┘
                       chrome.scripting      │              │ fetch (hostname only)
                                             ▼              ▼
                                   ┌─────────────┐  ┌───────────────────────┐
                                   │  Collector  │  │ GWF greencheck API    │
                                   │ (injected)  │  │ (cached per hostname) │
                                   └─────────────┘  └───────────────────────┘
```

**Flow:**

1. The toolbar click opens the popup.
   [`useAnalysis`](../src/popup/hooks/useAnalysis.ts) finds the active tab,
   refuses browser-internal pages, and sends `ANALYZE` (or `DEEP_SCAN`) to the
   service worker ([`lib/messaging.ts`](../src/lib/messaging.ts)).
2. The [service worker](../src/background/service-worker.ts) gets the raw
   capture from the collector or the deep scan.
3. Both feed one pipeline, `buildSnapshot`: classify → aggregate →
   recommendations → green-hosting check → CO₂ → Eco Score.
4. The worker returns an `AnalysisSnapshot` and the popup renders it.

Nothing about the scan is stored. A result lives in the popup until it closes;
there is no history.

**Why the worker owns the work:** the popup can close at any moment, which
would kill an in-flight `fetch` or a deep scan, and the debugger is driven from
the background. The analysis itself is framework-free, so it is unit-tested
without a browser.

---

## 3. Directory layout

```
manifest.config.ts         MV3 manifest (via @crxjs/vite-plugin)
vite.config.ts             build; __STORE_BUILD__ flag
src/
  core/                    pure, framework-free, unit-tested
    types.ts               raw capture, classified resources, snapshot
    classify.ts            category, first/third party, byte fallback
    aggregate.ts           bytes and counts per category, third-party share
    carbon.ts              CO2.js (SWD model)
    score.ts               sub-scores → 0–100 → A–F
    recommendations.ts     rule engine + best-practices sub-score
    coverage.ts            JS and CSS coverage → unused bytes (deep scan)
    constants.ts           thresholds, weights, limits
    format.ts              bytes, grams, percentages
  background/
    service-worker.ts      message handler, shared pipeline
    deep-scan.ts           chrome.debugger / DevTools Protocol scan
  content/collector.ts     injected Performance-timing harvest
  lib/
    messaging.ts           typed popup ↔ worker protocol
    greenweb.ts            Green Web Foundation client + cache
    settings.ts            monthly visits, in storage.local
    format.ts              re-export of core/format for the UI
  popup/                   React UI (index.html, App.tsx, components/, hooks/)
tests/                     vitest suites
scripts/
  generate-icons.mjs       dependency-free icon generator
  cws.mjs                  Chrome Web Store API publishing (used by CI)
site/                      marketing site, its own npm project
```

---

## 4. Classification and weight

- **Category** ([`core/classify.ts`](../src/core/classify.ts)): from the file
  extension first, then `initiatorType`: `html | css | js | image | font |
video | other`. The deep scan maps DevTools resource types to the same
  initiator names, so one classifier serves both scans.
- **First vs third party:** each resource's registrable domain against the
  page's, with **`tldts`** and the public suffix list's private section on
  (`allowPrivateDomains`), so two accounts on `github.io` or `vercel.app` count
  as different sites.
- **Weight** ([`core/aggregate.ts`](../src/core/aggregate.ts)): the main
  document comes from the navigation entry and counts as `html`; third-party
  bytes and count are tracked across categories (a script can be both `js` and
  third party); estimated bytes are summed separately.

---

## 5. Carbon, score and recommendations

- **Carbon** ([`core/carbon.ts`](../src/core/carbon.ts)): CO2.js, Sustainable
  Web Design model, per byte, on the total transferred bytes. Only a confirmed
  green host takes the green path; unknown counts as not green. Yearly =
  grams per view × monthly visits × 12, where monthly visits is the user's
  setting.
- **Eco Score** ([`core/score.ts`](../src/core/score.ts)): a weighted sum of
  four sub-scores, each 0–100:

  | Sub-score      | Weight | How                                                            |
  | -------------- | ------ | -------------------------------------------------------------- |
  | Carbon / view  | 40%    | log scale between `CARBON_BEST_G` and `CARBON_WORST_G`         |
  | Page weight    | 30%    | log scale between `WEIGHT_BEST_BYTES` and `WEIGHT_WORST_BYTES` |
  | Green hosting  | 15%    | green 100 · unknown 50 · not green 0                           |
  | Best practices | 15%    | 100 minus a deduction per recommendation, by impact            |

  **Grade:** A ≥ 90 · B ≥ 80 · C ≥ 70 · D ≥ 60 · E ≥ 50 · F below.

- **Recommendations**
  ([`core/recommendations.ts`](../src/core/recommendations.ts)): one rule per
  finding, each returning a recommendation or nothing, sorted by impact and
  then by bytes saved:

  | Rule                    | Scan      |
  | ----------------------- | --------- |
  | `oversized-images`      | both      |
  | `animated-gif`          | both      |
  | `large-js`              | both      |
  | `excessive-third-party` | both      |
  | `large-fonts`           | both      |
  | `autoplay-video`        | both      |
  | `large-css`             | both      |
  | `unused-js`             | deep only |
  | `unused-css`            | deep only |

**Honesty rule:** what a scan cannot measure is not shown as if it could. The
quick scan never reports unused JS or CSS, and estimated bytes are labelled.

---

## 6. Manifest and builds

- MV3, an `action` popup, a module service worker
  ([`manifest.config.ts`](../manifest.config.ts)).
- **Permissions:** `activeTab`, `scripting`, `storage`, plus `debugger` in the
  full build only.
- **Host permission:** `https://api.thegreenwebfoundation.org/*`, for the
  greencheck. It is the only request that leaves the device, and it sends the
  hostname only.
- **Two builds** from one source, switched by `PAGELENS_STORE=1`:
  - `npm run build` → `dist/`: the full extension, deep scan included.
  - `npm run package:store` → `dist-store/` and `pagelens-store.zip`: no
    `debugger` permission, and `__STORE_BUILD__` makes the deep-scan import
    unreachable, so the bundler drops that code.

---

## 7. Storage

All in `chrome.storage.local`, on the device:

- `monthlyVisits`, the setting for the yearly projection
  ([`lib/settings.ts`](../src/lib/settings.ts)). Never `storage.sync`: with
  Chrome sync on, that is copied to the user's Google account. Up to 1.2.0 it
  was in `storage.sync`; the worker moves it on install and update.
- `gwf:<hostname>`, the greencheck result, for `GWF_CACHE_TTL_MS`
  ([`lib/greenweb.ts`](../src/lib/greenweb.ts)). A failed lookup is
  "unknown" and is not cached.

---

## 8. Limits

- **Cross-origin bytes in the quick scan** are estimated where the server sends
  no Timing-Allow-Origin. The deep scan measures them exactly.
- **One load, one snapshot.** A single-page app's route changes are not
  re-scanned (#8).
- **No history or export yet.** Compare across visits (#5) and PDF export (#6)
  are on the roadmap.

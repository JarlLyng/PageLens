# PageLens — Architecture & Implementation Plan

A Chrome MV3 extension that estimates the carbon footprint of the current page and
turns it into an actionable A–F sustainability score.

> **Status:** This began as the implementation plan and remains the reference for
> the design rationale. Both tiers are now built and shipped — the quick scan
> (Performance API) **and** the opt-in deep scan (`chrome.debugger` for exact
> bytes + real unused JS/CSS). Remaining ideas below (history/compare, PDF
> export) are tracked as GitHub issues.

---

## 1. The core architectural decision: how do we capture transferred bytes?

Everything downstream (weight, CO₂, score, recommendations) depends on this. Three options:

| Approach                                       | Byte accuracy                                                                             | Permission cost                                                      | Needs reload                        | Cross-origin         |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------- | -------------------- |
| **PerformanceResourceTiming** (content script) | Good for same-origin & TAO-enabled hosts; `transferSize` is **0** for opaque cross-origin | `activeTab` + `scripting` only — no scary UI                         | No — reads already-loaded resources | blind spot (0 bytes) |
| **`chrome.debugger` / CDP `Network` domain**   | Best — real `encodedDataLength` per response, headers, compression                        | `debugger` → shows a **"PageLens is debugging this browser"** banner | Yes — must attach before load       | full visibility      |
| **`chrome.webRequest`**                        | Poor — MV3 gives no reliable encoded sizes                                                | `webRequest` + broad host perms                                      | No                                  | headers only         |

**Decision: two-tier capture.**

- **Tier 1 — Quick scan (default, MVP):** `PerformanceResourceTiming` via `chrome.scripting.executeScript`. Zero friction, no permission banner, instant. Handles the common case well.
  - Mitigate the cross-origin `transferSize === 0` gap: fall back to `encodedBodySize`, then `decodedBodySize`, and **flag the result as "estimated"** in the UI so we never present a false-precise number.
- **Tier 2 — Deep scan (post-MVP, opt-in):** attach `chrome.debugger`, reload the tab, capture the full `Network` + `Coverage` domains. This is the _only_ way to truly measure **unused JS/CSS** and exact transferred bytes. Gated behind an explicit "Run accurate scan (reloads page)" button.

This staging lets the MVP ship without the debugger permission while keeping the accurate path on the roadmap. It's also honest — we label estimates as estimates.

---

## 2. Component topology (MV3)

```
┌─────────────┐   ANALYZE(tabId)   ┌──────────────────────┐
│   Popup     │ ─────────────────▶ │  Service Worker (bg)  │
│ (React app) │ ◀───────────────── │  - GWF greencheck     │
└─────────────┘   AnalysisResult   │  - storage / history  │
      │                            │  - (later) CDP scans  │
      │ chrome.scripting                     │
      ▼                                       │ fetch()
┌─────────────┐                     ┌─────────▼──────────┐
│  Collector  │  raw entries        │ Green Web Found. API│
│ (injected)  │ ───────────────────▶ (cached per-domain) │
└─────────────┘                     └─────────────────────┘
```

**Flow:**

1. Toolbar click → popup opens, requests analysis for the active tab.
2. Service worker injects the collector (`activeTab` grant), receives raw `PerformanceResourceTiming[]` + `PerformanceNavigationTiming`.
3. Worker runs the pure `core/` pipeline: classify → aggregate → GWF lookup (cached) → CO₂ (CO2.js) → score → recommendations.
4. Result cached in `chrome.storage.session` (per tab) + appended to history in `chrome.storage.local`.
5. Popup renders.

**Why the worker, not the popup, owns compute:** the popup can be closed at any moment (killing in-flight `fetch`/state), GWF results should be cached across popup opens, and history/compare features need a persistent home. Core logic stays framework-free so it's equally callable from either context and unit-testable.

---

## 3. Directory layout

```
pagelens/
├── manifest.config.ts          # MV3 manifest (via @crxjs/vite-plugin)
├── vite.config.ts
├── src/
│   ├── popup/                   # React UI, entry: popup.html
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── EcoScoreCard.tsx      # A–F badge + 0–100 gauge
│   │   │   ├── CarbonEstimate.tsx    # g/view + yearly (configurable visits)
│   │   │   ├── HostingBadge.tsx      # ✅ / ⚪ / ❌
│   │   │   ├── ResourceChart.tsx     # transferred-data breakdown
│   │   │   ├── Recommendations.tsx   # prioritized expandable list
│   │   │   └── Methodology.tsx
│   │   └── hooks/useAnalysis.ts
│   ├── background/service-worker.ts
│   ├── content/collector.ts    # PerformanceResourceTiming harvest
│   ├── core/                   # PURE, framework-free, vitest-covered
│   │   ├── types.ts            # ResourceEntry, Category, AnalysisResult…
│   │   ├── classify.ts         # entry → category + first/third-party
│   │   ├── aggregate.ts        # bytes per category
│   │   ├── carbon.ts           # CO2.js (SWD model) wrapper
│   │   ├── score.ts            # sub-scores → 0–100 → A–F
│   │   ├── recommendations.ts  # rule engine
│   │   └── constants.ts        # benchmarks, thresholds, weights
│   ├── lib/
│   │   ├── messaging.ts        # typed message protocol
│   │   ├── greenweb.ts         # GWF API client + cache
│   │   └── storage.ts          # chrome.storage wrappers + history
│   └── components/ui/          # shadcn/ui primitives
└── tests/                      # unit tests for core/
```

---

## 4. Resource classification

- **Category** from `initiatorType` + URL/extension + MIME hints: `html | css | js | image | font | video | other`.
- **First vs third party**: compare each resource's registrable domain (eTLD+1) to the page's. Bundle **`tldts`** for correct public-suffix handling (don't hand-roll — `foo.co.uk` breaks naïve `split('.')`).
- Third-party bytes and count are tracked as a cross-cutting dimension (a JS file can be both "js" and "third-party").

---

## 5. Carbon model (CO2.js)

- Use CO2.js from The Green Web Foundation, **Sustainable Web Design (SWD) model** (current default; more transparent than the legacy 1-byte model).
- Feed total transferred bytes; pass the **green-hosting boolean** so the model applies the correct grid intensity for hosting.
- Outputs: **g CO₂ / page view**. Yearly = `gPerView × monthlyVisits × 12`, with `monthlyVisits` a user setting (default e.g. 10,000) persisted in storage.
- Surface a first-visit vs return-visit note (caching changes real-world transfer) in Methodology — MVP scores the measured (cold-ish) load.

---

## 6. Scoring model (concrete)

**Eco Score (0–100)** = weighted sum of four sub-scores:

| Sub-score      | Weight | 100 pts at | 0 pts at  | Curve                                |
| -------------- | ------ | ---------- | --------- | ------------------------------------ |
| Carbon / view  | 40%    | ≤ 0.1 g    | ≥ 3.0 g   | log                                  |
| Page weight    | 30%    | ≤ 500 KB   | ≥ 5 MB    | log                                  |
| Green hosting  | 15%    | green      | not green | green=100 / unknown=50 / not-green=0 |
| Best practices | 15%    | no issues  | —         | 100 minus per-issue deductions       |

**Grade:** A ≥90 · B 80–89 · C 70–79 · D 60–69 · E 50–59 · F <50.

Benchmarks anchored to HTTP Archive medians (~2.2 MB desktop) so a "typical" site lands around C. All thresholds live in `core/constants.ts` for easy tuning.

---

## 7. Performance insights & recommendations

Rule engine — each rule: `{ id, detect(analysis) → boolean, impact: high|medium|low, savingEstimate?, title, detail, category }`.

| Signal                        | Detectable in Tier 1? | Notes                                        |
| ----------------------------- | --------------------- | -------------------------------------------- |
| Oversized images              | ✅                    | large single image transfers vs threshold    |
| Large JS bundles              | ✅                    | proxy for "unused JS"                        |
| **Unused JS/CSS %**           | ❌ Tier 2 only        | needs CDP `Coverage` — don't fake it in MVP  |
| Excessive third-party scripts | ✅                    | count/bytes of 3p js                         |
| Large fonts                   | ✅                    | font bytes + count                           |
| Autoplay video                | ⚠️ partial            | collector inspects `<video autoplay>` in DOM |
| Large CSS bundles             | ✅                    | css bytes threshold                          |

Recommendations sort by `impact` then estimated CO₂ saving. Each renders as an expandable row (title + why + how).

**Honesty rule:** any feature the current tier can't truly measure is either hidden or clearly labeled an estimate. No fabricated precision.

---

## 8. Manifest V3 essentials

- `manifest_version: 3`, `action` with popup, `background.service_worker` (module type).
- **Permissions:** `activeTab`, `scripting`, `storage`. (`debugger` added only when Tier 2 ships.)
- **host_permissions:** `https://api.thegreenwebfoundation.org/*` for the greencheck call.
- Build with **`@crxjs/vite-plugin`** — handles MV3 multi-entry (popup + worker + content), HMR, and manifest generation cleanly with Vite.

---

## 9. Build order (recommended increments)

1. **Skeleton** — Vite + React + TS + Tailwind + crxjs; extension loads, popup opens, reads active tab URL.
2. **Capture + classify** — collector + `core/classify` + `core/aggregate`; show raw weight breakdown.
3. **Carbon + hosting** — CO2.js wrapper + GWF client (+ cache); Eco Score + grade.
4. **Recommendations** — rule engine + UI.
5. **Polish** — pie chart, Methodology, visits setting, empty/error/loading states.
6. **Nice-to-have** — history & compare, Tier 2 CDP deep scan, PDF export.

Ship 1–5 as MVP.

---

## 10. Key risks / open decisions

- **Cross-origin `transferSize = 0`** — biggest accuracy risk in Tier 1. Mitigation: fallback fields + "estimated" labeling. Revisit with Tier 2.
- **"Unused JS" is unmeasurable without CDP** — MVP substitutes "large bundle" heuristics and is explicit about it.
- **GWF API rate/availability** — cache per registrable domain in `storage.local` with a TTL; degrade to "Unknown ⚪" on failure.
- **Score calibration** — initial thresholds are best-guess; validate against a sample of real sites and tune `constants.ts`.
- **Single-load snapshot** — no SPA route-change tracking in MVP; note as a limitation.

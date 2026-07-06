# Chrome Web Store — submission guide

Everything needed to publish PageLens. The **store build** (no `debugger`
permission, no deep scan) is what gets uploaded, to keep review fast.

## Build the upload package

```bash
npm run package:store
```

This produces `pagelens-store.zip` from `dist-store/` (a `debugger`-free build).
Upload that zip in the Developer Dashboard.

> The full build (`npm run build` → `dist/`) keeps the deep-scan feature for
> local/unpacked use. Do **not** upload that one — its `debugger` permission
> triggers stricter, slower review.

## One-time setup

- [ ] Register a Chrome Web Store developer account (one-time $5 USD fee)
- [ ] Have the privacy policy URL ready: https://pagelens.iamjarl.com/privacy.html

## Listing copy

**Name**

```
PageLens — Website Carbon Footprint
```

**Short description** (≤132 chars)

```
See any web page's carbon footprint. Get an A–F Eco Score, CO₂ estimate, green-hosting check, and tips to make it lighter.
```

**Category:** Developer Tools

**Detailed description**

```
PageLens estimates the environmental impact of the web page you're viewing and
turns it into a simple, actionable A–F Eco Score.

Click the toolbar icon on any page to see:

• Eco Score — one 0–100 score (graded A–F) blending carbon, page weight, green
  hosting and best practices.
• Carbon estimate — grams of CO₂ per view plus a yearly projection, using CO2.js
  (Sustainable Web Design model) from The Green Web Foundation.
• Green hosting — whether the site runs on green energy, via the Green Web
  Foundation greencheck.
• Page-weight breakdown — transferred bytes by type (HTML, JS, CSS, images,
  fonts, video) and third-party share.
• Recommendations — a prioritized list of what to fix first: oversized images,
  heavy JavaScript, autoplay video, large CSS, and more.

PageLens gives an actionable estimate, not an exact measurement, and is
transparent about how the score is calculated.

Built for developers, designers, agencies and sustainability teams.

Privacy: PageLens collects no personal data and has no trackers. Only the
hostname of the site you analyze is sent to the Green Web Foundation to check
green hosting. See the privacy policy for details.
```

**Single purpose** (required field)

```
PageLens analyzes the currently viewed web page and estimates its carbon
footprint, presenting a sustainability score and improvement recommendations.
```

## Permission justifications

| Permission | Justification |
|---|---|
| `activeTab` | Read the active tab's URL and run the analysis only on the page the user explicitly invokes PageLens on. |
| `scripting` | Inject a small collector script that reads the page's Performance resource-timing entries to measure transferred bytes. |
| `storage` | Persist the user's "monthly visits" setting and cache green-hosting lookups locally. |
| Host permission: `api.thegreenwebfoundation.org` | Look up whether the current site's hostname is hosted on green energy. |

_(The store build intentionally omits `debugger`; do not request it in the listing.)_

## Assets checklist

- [x] **Icon** — 128×128 PNG (`public/icons/icon128.png`)
- [x] **Small promo tile** (optional) — 440×280
      (`store-assets/promo-small-440x280.png`)
- [x] **Marquee promo** (optional) — 1400×560
      (`store-assets/promo-marquee-1400x560.png`)
- [ ] **Screenshots** — at least one; 1280×800 or 640×400 PNG. Capture the real
      popup (see below).

Promo tiles are designed marketing graphics, generated via `npm run og` (in
`site/`) and committed under `store-assets/`. Screenshots should be **real**
captures of the running extension — the store can reject fabricated ones.

### How to capture screenshots (2 minutes)

1. `npm run build:store` (produces `dist-store/`)
2. `chrome://extensions` → Developer mode → **Load unpacked** → select `dist-store/`
3. Open a content-rich site (e.g. a news article) and click the PageLens icon
4. With the popup open, capture it:
   - macOS: `Cmd+Shift+4`, then press `Space`, then click the popup window
5. Repeat on a couple of sites to show different scores. Pad/scale the image to
   1280×800 if needed (the store accepts 1280×800 or 640×400).

Good screenshots to include: the full popup (Eco Score + carbon + hosting),
and one scrolled to the recommendations list.

## Submission steps

1. `npm run package:store` → get `pagelens-store.zip`
2. Developer Dashboard → **New item** → upload the zip
3. Fill in the listing copy above
4. Add screenshots + icon
5. Set the privacy policy URL and complete the privacy/data-use disclosures
   (declare: no data sold; only hostname sent for green-hosting check)
6. Submit for review

## Notes

- Review time varies; the minimal permission set (no `debugger`) should keep it
  on the faster path.
- If you later want the deep-scan feature in the store, expect a longer review
  and a required justification for `debugger` — see issue #3.

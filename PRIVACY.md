# PageLens — Privacy Policy

_Last updated: 6 July 2026_

Canonical version: https://jarllyng.github.io/PageLens/privacy.html

PageLens is a Chrome extension that estimates the carbon footprint of the web
page you are viewing. It is designed to work without collecting personal data.

## What the extension accesses

When you click the PageLens toolbar icon on a page, it reads:

- the **URL** of the active tab, to identify the site and its hosting domain;
- the **resource timing** of the page (sizes and types of loaded files), to
  calculate page weight and emissions.

This happens only for the active tab, and only when you invoke PageLens.

## What leaves your device

The only data sent off your device is the **hostname** of the site being
analyzed (e.g. `example.com`), sent to
[The Green Web Foundation](https://www.thegreenwebfoundation.org/) greencheck API
to check for green hosting.

No page content, full URLs, browsing history, or personal data is transmitted.
PageLens contains **no analytics, no advertising, and no third-party trackers**.

## What is stored

Stored locally via the Chrome Storage API, never uploaded:

- your "monthly visits" setting (for the yearly carbon estimate);
- cached green-hosting results.

## Data sharing & sale

We do not collect, store, share, or sell any personal information.

## Contact

Open an issue on the [PageLens GitHub repository](https://github.com/JarlLyng/PageLens).

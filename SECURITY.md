# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, email **support@iamjarl.com** with:

- a description of the issue and its impact,
- steps to reproduce, and
- the affected version.

We'll acknowledge your report and keep you updated on the fix.

## Scope

PageLens runs entirely in the browser. It reads the active tab's resource
timing and URL on demand, stores a couple of settings locally, and sends only
the current site's **hostname** to The Green Web Foundation to check for green
hosting. It has no backend and collects no personal data — see
[PRIVACY.md](PRIVACY.md).

Relevant areas for security reports include the injected collector
(`src/content/`), the optional `chrome.debugger`-based deep scan (dev build
only), and handling of untrusted page data in the analysis pipeline.

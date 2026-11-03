# Releasing PageLens

How a new version reaches the Chrome Web Store. The **store build** (no
`debugger` permission, no deep scan) is what gets uploaded, to keep review
fast.

## Build the upload package

```bash
npm run package:store
```

This produces `pagelens-store.zip` from `dist-store/` (a `debugger`-free build).
The release workflow below uploads it; by hand, it goes in the Developer
Dashboard.

> The full build (`npm run build` → `dist/`) keeps the deep-scan feature for
> local/unpacked use. Do **not** upload that one — its `debugger` permission
> triggers stricter, slower review.

## Smoke-test the exact build you upload

```bash
npm run build:store   # → dist-store/
```

`chrome://extensions` → Developer mode → **Load unpacked** → select
`dist-store/`, then open the popup on a content-rich page and confirm you get a
score, a weight breakdown and recommendations.

CI builds the extension but never loads it, so a change to the build chain
(Vite, crxjs, a Manifest V3 field) can pass every check and still ship
something Chrome refuses to run.

## Automated publishing (GitHub Actions)

Updates publish automatically via
[`.github/workflows/publish-extension.yml`](../.github/workflows/publish-extension.yml)
using Chrome Web Store API V2 (`scripts/cws.mjs`).

**Authentication is keyless.** GitHub's own OIDC token is exchanged, through
Workload Identity Federation, for a short-lived Google access token for the
service account `cws-publisher@iamjarl.iam.gserviceaccount.com`, which the
Developer Dashboard lists as this publisher's. There is no client secret and no
refresh token, so nothing expires after 7 days and nothing needs rotating. The
same service account publishes JarlLyng/BotLens; Google accepts the token only
from those two repos.

**Setup** is three repository _variables_ — none of them is a credential:

```bash
gh variable set CWS_WIF_PROVIDER     # projects/…/workloadIdentityPools/github/providers/jarllyng
gh variable set CWS_SERVICE_ACCOUNT  # cws-publisher@iamjarl.iam.gserviceaccount.com
gh variable set CWS_PUBLISHER_ID     # same publisher as BotLens
```

The extension ID is public (it is in the store URL) and hardcoded in the
workflow.

**To ship an update:**

```bash
# bump the version in package.json (the manifest reads it), then:
git commit -am "Release vX.Y.Z"
git tag vX.Y.Z
git push --tags
```

The workflow type-checks, tests, builds the debugger-free store zip, and
uploads + submits it for review. The version tag must match `package.json`
(the workflow fails otherwise).

**Checking authentication without releasing:** run the workflow manually from
the Actions tab (**workflow_dispatch**). Its `mode` input defaults to `check`,
which only asks the API for the item's status and changes nothing. `draft`
uploads without submitting; `publish` uploads and submits for review.

A `draft` run with `package.json` still on the version that is already live will
be refused — the store only takes a higher version. That refusal comes _after_
Google has accepted the authentication, so it is not a credentials problem.

> **Smoke-test before you push the tag** (below). This path uploads _and
> submits_ with no human in the loop, and nothing in it ever loads the
> extension.

## Notes

- Review time varies; the minimal permission set (no `debugger`) should keep it
  on the faster path.
- If you later want the deep-scan feature in the store, expect a longer review
  and a required justification for `debugger` — see issue #3.

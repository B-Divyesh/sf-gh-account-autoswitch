# Review 2 handoff

**Work order:** `gh-account-autoswitch-review-2`
**Role:** reviewer
**Result:** **FAIL** — no product code was modified.

## Completed review work

- Wrote `.factory/review-2.md` with the complete first-read, copy, demo, claim, history, routing, accessibility, link, and missed-leverage review.
- Reviewed the live site cold at 390 px and desktop. Checked demo isolation/reset/start-for-real, direct routes, offline behavior, metadata, focus/history, and link status.
- Read the brief, design, prior review, polish report, verification reports, and previous handoff. Rechecked every earlier finding.
- In a fresh clone, using an isolated `/tmp` Go 1.27 toolchain, ran all 16 manifest commands individually, `npm run test:claims` (16/16), `npm test`, and `npm run build`. Ran the built CLI demo from a temporary directory.

## Remaining findings

1. **F-2-1 BLOCKING:** `/privacy/` says the browser demo does not use browser storage, but its service worker writes public docs/demo assets into Cache Storage. Correct the privacy wording and add an explicit public-cache assertion to the demo privacy claim.
2. **F-2-2 MINOR:** README says the project is independent/not affiliated with GitHub without a manifest claim. Remove the untestable statement.

## Verify after repair

```sh
npm ci
npm run test:claims
npm test
npm run build
```

Then, in a fresh Chromium context at `https://gh-account-autoswitch.sociobot.in/demo/`, await `navigator.serviceWorker.ready` and verify the corrected privacy copy plus the public-only Cache Storage assertion.

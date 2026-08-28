# Perfection-loop round 4 handoff

**Work order:** `gh-account-autoswitch-polish-4`

**Baseline:** `4c8e64f5e617d60ae586c6f021da68708617bb3a`

**Review:** `afbbff2da9745b16bcb793f18bcb0a90054f3eb4`

**Tested repair:** `dad3b61f3b9f041939b69f259fa4090633a5a698`

**Deployment:** `3ac36063-4312-4225-9d20-0db48e73b582`

**Live:** <https://gh-account-autoswitch.sociobot.in/>

## What changed

- Fixed F-4-1 by using Playwright's supported `test.setTimeout(180_000)` API in the release-package claim. All archive-content assertions remain.
- During the required cold live recheck, found and fixed an uncovered F-2-1 edge: a service-worker-controlled `?demo=1` navigation could add the query URL to Cache Storage. Runtime caching now accepts only query-free paths declared in `PRECACHE`.
- Strengthened `@claim:browser-demo` to start from an already controlled page, seed real local/session/IndexedDB data, enter `?demo=1`, and prove those sentinels remain unchanged while the cache contains only declared public files.
- Updated the verb-first catalog line to “Choose the right GitHub account for each repository before running gh.” (70 characters) and synchronized the copy audit.
- Preserved the Go CLI/static-site artifact classes and the luminous-glass visual system.

## Verification

From a fresh clone of `dad3b61` with Node.js 22.23.2, Go 1.22.12, Playwright 1.58.2, and new `GOCACHE`/`GOMODCACHE` directories:

- `npm run test:claims -- --grep @claim:release-package` — passed in 33.8 seconds from the cold cache.
- Every other command in `.factory/claims.json` — 18/18 passed separately; all manifest commands passed 19/19.
- `npm test` — passed: 2 Go packages, 10 static tests, 19 claims, and 9 browser tests.
- `go test -race ./...` and `go vet ./...` — passed.
- `npm run build` — passed and produced `dist/bin/` plus `dist/site/`.
- `npm run package` — passed and produced five supported release archives.

Persistent summary: [clean-summary.txt](evidence/polish-4/clean-summary.txt). Full logs are under `/work/.evidence/gh-account-autoswitch-polish-4/final/` in the worker.

## Live evidence

- `npm run verify:live` equivalent: [verify.json](evidence/polish-4/live/verify.json) — 11/11 checks passed across home, demo, Privacy, Terms, 404, and query demo at desktop and 390 px; zero serious/critical Axe findings and zero console errors.
- Accessibility baseline: [verify-url report](evidence/polish-4/live/url-check/verify.json) — title, `lang`, one `<h1>`, `<main>`, image alternatives, and console all passed.
- Demo/privacy/offline: [demo-mobile.json](evidence/polish-4/live/demo-mobile.json) and [screenshot](evidence/polish-4/live/demo-mobile.png) — row bottom 513.17 px at 390 × 844; sentinels unchanged; only declared query-free public files cached; one request origin; offline reload 200.
- Routing/focus/links: [links-focus.json](evidence/polish-4/live/links-focus.json) — every rendered destination returned 200; Privacy and Back focused their `<h1>`.
- Deployment parity: [parity.json](evidence/polish-4/live/parity.json) — home, demo, legal pages, 404, service worker, robots, and sitemap match `dist/site` byte for byte.
- Lighthouse: [lighthouse-headless.json](evidence/polish-4/live/lighthouse-headless.json) — Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1,052 ms, CLS 0, TBT 0 ms.

## How to verify

```bash
npm ci
npm test
go test -race ./...
go vet ./...
npm run build
npm run package
npm run verify:live
```

## Known gaps and next steps

None. All findings in reviews 1–4, including minor and reopened items, are resolved and mapped in `.factory/polish-4.md`.

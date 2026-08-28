# Polish 2 handoff

**Work order:** `gh-account-autoswitch-polish-2`
**Repair commit:** `26565fb037165f86b3a600723c90abc434322fdf`
**Deployment:** Static Web Apps `216d1168-ab25-476f-9f39-08ae86a8bc7c`
**Live:** <https://gh-account-autoswitch.sociobot.in/>

## Done

- Corrected the browser-demo privacy wording: no personal account/repository data is stored; the service worker caches public documentation for offline use.
- Strengthened `@claim:browser-demo` to inspect all browser storage and verify its one versioned cache contains only same-origin, query-free paths declared by the generated worker precache.
- Declared `/sw.js` in that precache and added the worker template to the cache fingerprint, so worker changes produce a distinct release cache.
- Removed untestable affiliation/endorsement claims from README and Terms. The copy test now rejects their return in README or legal pages.
- Updated the catalog description to a verb-first, 75-character sentence.
- Added `.factory/polish-2.md`, including every review finding, exact change, test evidence, screenshots, and live check.

## Verification

Fresh clone at the repair commit, with Node 22.23.2 and isolated Go 1.22.12:

- `npm ci` passed with 0 vulnerabilities.
- Every one of the 16 manifest commands passed independently; aggregate `npm run test:claims` passed 16/16.
- `npm test` passed: Go, static/document, claim, browser, Axe, privacy, offline, routing, mobile, keyboard, and link checks.
- `go test -race ./...`, `go vet ./...`, `npm run build`, and `npm run package` passed. Release archives for Linux amd64/arm64, macOS amd64/arm64, and Windows amd64 were produced.
- Factory cold-page verification wrote `/work/.evidence/gh-account-autoswitch-polish-2/verify.json` and desktop/mobile screenshots. It found title/lang/main/alt/console checks clean.
- `npm run verify:live` passed 11 live checks: all routes at desktop/mobile, product 404, query demo/reset/start-for-real, and zero serious/critical Axe issues.
- Lighthouse JSON at `/work/.evidence/gh-account-autoswitch-polish-2/lighthouse/report.json` reports 100 Performance, 100 Accessibility, 100 SEO; LCP 1,214 ms, CLS 0, TBT 83 ms. Lighthouse emitted a post-report target-crash exit after writing the report; the successful Playwright/Axe checks are the authoritative browser evidence.

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run package
```

Deployment uses the work-order static configuration: `npm ci && npm run build:site`, then deploy `dist/site` with `/opt/fleet/lib/deploy-static.sh gh-account-autoswitch /work/repo/dist/site`.

**Known gaps:** none in the product. Do not publish the release archives from this worker; `npm run package` leaves them ready in `dist/release/`.

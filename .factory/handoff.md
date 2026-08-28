# Polish 3 handoff

**Work order:** `gh-account-autoswitch-polish-3`<br>
**Baseline candidate:** `8eb7dd887df7898ff32304377f049c357ece7d7a`<br>
**Repair commit:** `365f3c265808d740cc6cbcdee627daa876acdf3d`<br>
**Deployment:** Static Web Apps deployment `2e4ef38c-bed3-4e7b-a835-8ab4a0df3a75`<br>
**Live:** <https://gh-account-autoswitch.sociobot.in/>

## What changed

- Made the one-click demo useful on a 390 x 844 phone: a complete realistic repository, account, and matching-rule result appears above the fold. `?demo=1` stays isolated, clearly labeled, resettable, and discardable.
- Raised repeated navigation and footer links to the 44 px touch-target minimum and added mobile target-size coverage on every public route.
- Reworked README workflow claims into four manifest-backed entries: toolchain prerequisites, full suite coverage, build artifacts, and release packaging. Removed the untestable deployment-ownership sentence.
- Added claim coverage for Node 20+, missing Go guidance, aggregate test coverage, build destinations, and exact release archive contents. The manifest now contains 19 claims, each with one tagged observable test.
- Preserved the dark terminal-recording visual identity, real routing, per-route metadata, styled 404, focus management, legal links, privacy-first demo behavior, offline documentation, and CLI artifact class.
- Updated the verb-first catalog description (76 characters), copy audit, demo documentation, changelog, and this handoff. Complete finding mapping is in `.factory/polish-3.md`.

## How verified

From a clean clone at the repair commit, with isolated Go 1.22.12 at `/tmp/gh-account-autoswitch-go122`:

```bash
npm ci
# each of the 19 .factory/claims.json test commands, individually
npm test
go test -race ./...
go vet ./...
npm run build
npm run package
```

All commands passed. `npm test` passed 10 static checks, 19 claim checks, and 9 browser checks. Packaging produced the five supported archives.

After deployment, a cold live check passed:

```bash
npm run verify:live
/opt/fleet/lib/verify-url.sh https://gh-account-autoswitch.sociobot.in/ .factory/evidence/polish-3/live
```

The live verifier passed 11 checks covering home/demo/privacy/terms/404 at desktop and 390 px plus the `?demo=1` path. It reported no product console errors and no serious/critical Axe violations. The fresh `?demo=1` mobile run measured the first full result at 513.17 px (within an 844 px viewport) and every tested control at least 44 x 44 px. Evidence is committed under `.factory/evidence/polish-3/`.

Lighthouse recorded Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1,056.85 ms, CLS 0, TBT 104.5 ms in `.factory/evidence/polish-3/live/lighthouse.json`. Chromium emitted a post-audit target-crash after the report was written; the independent live browser, Axe, and URL checks passed.

## Run and release

```bash
npm ci
npm test
npm run build
npm run package
```

The static site build is `dist/site/`; the CLI release archives are `dist/release/`. The factory deploys static output and owns publishing credentials; do not publish from this checkout.

## Known gaps

None in the product or the review findings. The only tooling note is Lighthouse's post-report Chromium target-crash described above; its saved score-bearing report and all independent live checks are included as evidence.

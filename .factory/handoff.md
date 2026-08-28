# Perfection-loop round 1 handoff

**Work order:** `gh-account-autoswitch-polish-1-all-findings`

**Repair commit:** `202851ce044f795a0fc6ecae30e0523294102345`

**Live site:** <https://gh-account-autoswitch.sociobot.in/>

**Deployment ID:** `b922a3b8-e76f-4eca-b29e-b2982a533cfc`

**Result:** PASS — every finding in `.factory/review-1.md` is resolved.

## Delivered

- Kept the required headline and audience sentence, with the one-click sample action and three first-screen facts visible at 390 px.
- Hardened `?demo=1` → `/demo/`, the persistent no-save banner, Reset demo feedback/focus, Start for real, and the self-hosted terminal recording.
- Made CLI demo cleanup truthful: it now verifies temporary-workspace deletion before reporting success.
- Expanded `.factory/claims.json` from 12 to 16 traceable claims. New dedicated coverage proves the browser demo, concurrent account isolation, three remote URL forms, unknown-key rejection, and toolchain/authentication guidance.
- Completed route metadata and consistent branded headers/footers, including manifest, touch icon, social image, canonical, Open Graph, and Twitter fields.
- Made route focus resilient across normal navigation and the back/forward cache.
- Removed the remaining untestable future-maintenance promise and retained the luminous glass data landscape.
- Updated the 89-character, verb-first catalog description and the copy/design/demo records.
- Added `npm run verify:live` for repeatable cold checks of all production routes, the 404, responsive layout, Axe, console, network origins, and demo controls.

The complete finding matrix is in `.factory/polish-1.md`.

## Clean-clone verification

A separate clone at `/tmp/gh-autoswitch-clean.sQUxQD` checked out `202851c` and ran with Node 22.23.2, npm 10.9.8, Go 1.22.12, and Playwright 1.58.2.

- `npm ci`: PASS; 0 vulnerabilities.
- Every `.factory/claims.json` command run separately: **16/16 PASS**.
- `npm test`: PASS — Go packages 2/2, static tests 10/10, claims 16/16, browser tests 7/7.
- `go test -race ./...`: PASS for both Go packages.
- `go vet ./...`: PASS.
- `npm run build`: PASS; emitted `dist/bin` and `dist/site`.
- `npm run package`: PASS; emitted Linux amd64/arm64, macOS amd64/arm64, and Windows amd64 archives.
- Production sizes: JS 4,589 B; CSS 19,743 B; desktop hero 83,046 B; mobile hero 33,714 B.

## Live verification

The site was built with the work-order command and deployed from `dist/site`.

- `/opt/fleet/lib/verify-url.sh` passed cold checks for `/` and `/?demo=1`; see [.factory/evidence/live-home/verify.json](evidence/live-home/verify.json) and [.factory/evidence/live-demo/verify.json](evidence/live-demo/verify.json).
- `npm run verify:live`: PASS, 11 checks. `/`, `/demo/`, `/privacy/`, and `/terms/` return 200. `/no-such-page` returns the branded 404. Both 1440 px and 390 px have correct titles, one `h1`, one `main`, no overflow, same-origin-only requests, no console errors, and zero serious/critical Axe findings.
- The cold `?demo=1` flow shows four sample rows, persistent banner, working replay/reset, empty browser storage, heading focus after reset, and working Start for real.
- Lighthouse 13 mobile: Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**; LCP **1.1 s**, CLS **0**, TBT **30 ms**.
- Root CSP, HSTS, Permissions Policy, referrer policy, `nosniff`, and frame denial are present. Hashed assets return one-year immutable caching.
- SHA-256 matches local production output for root, demo, privacy, terms, 404, service worker, JS, and CSS.

Screenshots: [home desktop](evidence/live-home/screenshot-desktop.webp), [home mobile](evidence/live-home/screenshot-mobile.webp), [demo desktop](evidence/live-demo/screenshot-desktop.webp), [demo mobile](evidence/live-demo/screenshot-mobile.webp).

## Run locally

```sh
npm ci
npm test
npm run build
npm run package
VERIFY_URL=https://gh-account-autoswitch.sociobot.in npm run verify:live
```

## Known gaps

None. Registry and GitHub release publication remain factory-owned and were not performed.

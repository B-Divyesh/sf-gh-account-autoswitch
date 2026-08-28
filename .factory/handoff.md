# Review 3 handoff

**Work order:** `gh-account-autoswitch-review-3`
**Candidate:** `8eb7dd887df7898ff32304377f049c357ece7d7a`
**Live:** <https://gh-account-autoswitch.sociobot.in/>
**Verdict:** FAIL

## Done

- Wrote `.factory/review-3.md` after fresh 390 px and desktop live checks.
- Audited every landing-page and README sentence, all current claim entries, all earlier review/polish findings, demo isolation, offline behavior, routing, metadata, links, accessibility, and visual identity.
- Made no product-code changes.

## Verification

- Every one of the 16 `.factory/claims.json` commands passed independently in a clean clone using Go 1.22.12.
- Clean-clone `npm test` and `npm run build` passed; `npm run package` produced all five supported archives.
- The published `go install ...@latest` command installed version `0.1.0` successfully.
- `npm run verify:live` passed 11 checks with zero serious/critical Axe findings and no product console errors.
- `/opt/fleet/lib/verify-url.sh` passed.
- Offline demo reload, same-origin request capture, storage sentinels, reset/focus, link crawl, route metadata, browser history focus, and candidate/live hashes were checked directly.

## Findings left for the next repair

- **F-3-1 (blocking):** no realistic repository/account result appears within the first 390 × 844 demo viewport.
- **F-3-2 (major):** repeated Demo and Terms links are 41–42 px wide, below the 44 px touch-target contract.
- **F-3-3–F-3-9 (minor):** seven README development/deployment assertions have no corresponding claims manifest entries.

See `.factory/review-3.md` for exact quotes, evidence, historical verification, and concrete fixes.

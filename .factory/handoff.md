# Review 4 handoff

**Work order:** `gh-account-autoswitch-review-4`
**Reviewed revision:** `4c8e64f5e617d60ae586c6f021da68708617bb3a`
**Live:** <https://gh-account-autoswitch.sociobot.in/>

## What was done

- Performed independent cold mobile (390 × 844) and desktop checks of the live site.
- Audited landing/README copy, claims, demo isolation, offline behavior, links, metadata, focus, accessibility, and the complete prior-review trail.
- Ran all 19 declared claim commands separately from a clean clone using isolated Go 1.22.12. Eighteen passed.
- Repeated the failing release-package command in a second clean clone with isolated `GOCACHE` and `GOMODCACHE`.
- Wrote `.factory/review-4.md`. No product code was changed.

## How to verify

```bash
npm ci
npm run test:claims -- --grep @claim:release-package
npm test
npm run verify:live
```

The live verifier passed all 11 checks at desktop and 390 px with zero serious/critical Axe findings and zero product console errors. The demo preserved seeded real-storage sentinels, made only same-origin requests, reset correctly, showed a full result above the mobile fold, and reloaded offline after service-worker activation.

## Known gap

`npm run test:claims -- --grep @claim:release-package` fails from a fresh Go cache with Playwright's default 30-second timeout. It failed twice in independent clean clones. The test's intended 180-second timeout is not applied. This is blocking F-4-1, reopening F-3-7; details are in `.factory/review-4.md`.

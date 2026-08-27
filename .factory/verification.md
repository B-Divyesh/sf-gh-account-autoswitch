# Independent verification — FAIL

**Candidate:** `4877ae8f766ba2bfe8cda205c976e546ecea6783` (`main` at checkout time)
**Live URL:** <https://gh-account-autoswitch.sociobot.in/>
**Verified:** 2026-08-27 UTC
**Scope:** clean-clone build, CLI/package behavior, static site, live deployment, privacy/security, accessibility, PWA and delivery checks.

## Verdict

**FAIL.** The Go CLI fulfils the researched v1 job and the live site is an exact match for the candidate build, but the deployment fails the repository's required immutable-cache policy and has incomplete PWA update and security-header delivery controls. These are release blockers under `AGENTS.md` even though the normal product flow works.

## Clean checkout and build evidence

A fresh detached clone was checked out at the exact candidate SHA. The disposable image had no Go installation, so Go 1.22.12 was installed under `/tmp/verify-go` only; the repository was not changed.

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 16 packages, npm audit reported 0 vulnerabilities |
| `npm test` | Pass; Go package/CLI tests and four built-site tests all pass |
| `npm run build` | Pass; host CLI and `dist/site/` produced |
| `go vet ./...` | Pass |
| `npm run package` | Pass; Linux amd64/arm64, macOS amd64/arm64 tarballs and Windows amd64 zip produced |
| Clean consumer | Pass; extracted Linux archive contained the executable, README and MIT license; `--help`, `version --json`, `which --json`, and `run` worked |

The built initial assets are 2,248 B JS (1,053 B gzip), 14,503 B CSS (3,958 B gzip), 83,046 B desktop hero WebP, and 33,714 B mobile hero WebP: all within the stated budgets.

## CLI end-to-end evidence

Used fresh temporary git repositories and a deterministic fake `gh`, never a real credential store.

- Normal SSH remote `git@github.com:acme-corp/payments.git` selected `alice`; `which --json` returned canonical `github.com/acme-corp/payments` and the first matching rule.
- `run -- show-env` replaced inherited `GH_TOKEN` and `GH_ENTERPRISE_TOKEN`; only the child received `GH_TOKEN=token-for-alice`.
- Two simultaneous invocations for Acme and personal repositories received `token-for-alice` and `token-for-bob` respectively, with no shared global state.
- GHES remote `ssh://git@github.corp.example/platform/sso.git` passed only `GH_ENTERPRISE_TOKEN` to its child.
- Boundary/recovery: non-repository/no matching rule returned exit 3; directory-only recovery outside a git repository selected the directory rule.
- Malformed config containing an unknown key failed closed with exit 2. A selected but unavailable account returned exit 4 and did not print a token. A fake real-`gh` exit 17 was preserved.
- `init --dry-run --json` discovered and rendered three fake authenticated accounts without writing a config.

This verifies the brief's essential safety claim: the shim selects by context and scopes the selected token to the one child process, rather than invoking `gh auth switch` or persisting a token.

## Site, accessibility, privacy and PWA evidence

- Desktop 1440×900 and mobile 390×844 were exercised in Chromium. The mobile navigation intentionally hides Rules, selects the mobile image, retains 44×44 px Copy targets, and has no console or page errors. The interactive normal/personal/no-match rule traces update correctly.
- Keyboard-only first Tab reaches the skip link with a visible cyan 3 px outline and dark halo. Reduced-motion reports 0.01 ms transition/animation duration and `scroll-behavior: auto`.
- axe-core 4.13.0 was injected in Chromium after the CLI's Selenium launcher proved incompatible with this browser image. It found **zero serious or critical violations** on `/`, `/privacy/`, and `/terms/`.
- Semantic checks pass: titles, `lang=en`, one `h1`, one `main`, local alt-described image, and privacy/terms pages.
- Browser network capture found no third-party runtime request, analytics, remote font, or tracker. Source inspection found no token persistence, localStorage, sessionStorage, IndexedDB, beacon, or telemetry. The privacy statement is consistent with these observations.
- Service worker registers, controls on reload, and an offline reload renders the cached home page and the offline notice with no errors. It precaches only public files.
- A Lighthouse CLI run could not produce scores because its browser tab crashed in this container; no Lighthouse score is asserted here. Browser, axe, bundle-size, and offline checks above completed successfully.

## Candidate/live parity and delivery evidence

The live root document, `main-D3vlKLx7.js`, `style-M3n2iWs6.css`, and `sw.js` had SHA-256 hashes exactly equal to this candidate's production build. Live page interaction (including the personal trace) had no console/page errors and made only same-origin requests.

## Defects

### P1 — hashed assets are not immutable cached (release blocker)

At the live URL, `GET /assets/main-D3vlKLx7.js`, `/assets/style-M3n2iWs6.css`, and `/assets/route-landscape.webp` all return:

```text
Cache-Control: public, must-revalidate, max-age=30
```

The assets are content-hashed but receive only a 30-second cache lifetime; they do not have a long-lived `immutable` policy. This fails the explicit factory performance/delivery requirement for long-lived immutable hashed assets and needlessly forces revalidation. Serve fingerprinted assets with a one-year immutable policy; keep HTML/service-worker revalidation short.

### P2 — PWA update cache is not release-versioned

`site/public/sw.js` hard-codes `const CACHE = 'gh-account-autoswitch-v1'`; no build value, release identity, or update activation strategy changes it. Offline reload works now, but a normal new asset deployment does not change the worker/cache identity, so a service-worker update cannot be reliably verified as a new release. Generate a cache version from the build/release identity and define the intended activation policy (for example, notify then activate, or `skipWaiting` with a reload prompt).

### P2 — missing browser policy headers on the live deployment

Live responses include HSTS, `nosniff`, and a referrer policy, but do not include `Content-Security-Policy`, `X-Frame-Options` or CSP `frame-ancestors`, nor `Permissions-Policy`. HSTS has only `max-age=10886400` despite advertising `preload` (below the preload eligibility duration). Add a restrictive static-site CSP, framing protection, permissions policy, and appropriate HSTS duration at deployment.

## Non-blocking notes

- The package is private npm metadata but correctly provides release archives; `npm pack` is not applicable to this Go CLI package. `npm run package` is the ready-to-publish artifact command.
- The candidate's earlier handoff claims Lighthouse 100 scores. They were not independently reproducible in this verification environment because Lighthouse crashed, so those values should not be used as current verification evidence.

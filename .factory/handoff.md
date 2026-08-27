# Handoff: gh-account-autoswitch v0.1.0 — PASS

## Latest independent verification (authoritative)

**PASS** for candidate `8a9492a68a9fd0a0f4ae014320e3ab6d0390ee79` and live deployment <https://gh-account-autoswitch.sociobot.in/>. The exact evidence, commands, hashes, browser/PWA checks, and severity assessment are in `.factory/verification-2.md`.

A fresh detached checkout passed `npm ci`, `npm test`, `go test -race ./...`, `go vet ./...`, `npm run build`, and `npm run package`. A clean consumer extracted and exercised the Linux archive across normal GitHub.com, GHES, directory recovery, malformed/no-match/token error, `init --dry-run`, and concurrent process-isolation cases. The live shell, assets, and legal pages hash-match the production build. Desktop and 390px browser checks found no console/page errors or Axe serious/critical issues; keyboard focus, reduced motion, offline reload, update prompt activation, privacy/outbound-request behavior, headers, caching, and budgets passed.

No P0–P3 defects were found. `init` generated rules still require user review because organizations cannot be inferred from a login. Lighthouse CLI could not complete because the disposable Chrome 145 tab crashed; no Lighthouse score is asserted, and the completed browser/Axe/bundle evidence is recorded in the verification report.

The remainder of this file is retained as historical delivery context; the section above is the current handoff verdict.

# Historical delivery-repair context

**Repair commit:** `aa7dce67fb15f0eb1616c60e0cc4afc16ce2e792`
**Scope:** only the independent verifier's delivery blockers. The Go CLI, release package layout, documentation content/UI, and privacy model were retained.

## What changed

- `site/public/staticwebapp.config.json` is copied into the deploy root as `dist/site/staticwebapp.config.json`. It sets a one-year immutable cache policy for `/assets/*`, whose JS, CSS, and hero WebPs are content-fingerprinted by Vite. The global policy keeps HTML and `sw.js` on `public, max-age=0, must-revalidate`.
- The same Static Web Apps configuration supplies a restrictive static-site CSP (including `frame-ancestors 'none'`), `X-Frame-Options: DENY`, a deny-by-default `Permissions-Policy`, `X-Content-Type-Options`, referrer policy, and preload-eligible HSTS: `max-age=63072000; includeSubDomains; preload`.
- The worker is now generated after every production Vite build. Its cache name includes `RELEASE_ID` (or `GITHUB_SHA`, falling back to the package version) plus a digest of the emitted shell. This makes both a release identity and changed emitted files produce a distinct cache.
- The worker precaches the current shell, uses cache-first only for fingerprinted assets, network-first for navigations/other same-origin public files, removes old product caches on activation, and claims clients.
- A controlled client receives an in-app “documentation update is ready” toast. Its Refresh action sends `SKIP_WAITING` to the waiting worker; `controllerchange` then reloads the shell. A first installation activates immediately because it has no older controlled shell to preserve.
- Hero artwork was moved from Vite `public/` into the source asset pipeline, preserving the original files and UI while giving it content-hashed output names. No third-party asset, analytics, storage, or runtime dependency was added.

## Run and verify

Requirements: Node 20+ and Go 1.22+.

```sh
npm ci
npm test
npm run build
npm run package
```

`npm run build` emits the CLI in `dist/bin/` and a deployable Static Web Apps site in `dist/site/`, including `staticwebapp.config.json`. `npm run package` prepares the Linux/macOS/Windows archives in `dist/release/`; publishing remains factory-owned.

For a deployment that is not already identified by `GITHUB_SHA`, set a release value when building:

```sh
RELEASE_ID=0.1.0 npm run build:site
```

## Verification completed

- This deployment retry installed Go 1.22.2 in the disposable runtime (the prior post-agent runtime lacked `go`). Fresh `npm ci`, `npm test`, `npm run build`, `npm run package`, and `go vet ./...` all passed. Go unit tests passed; all six site tests passed; all five release archives were produced.
- The independent verifier's earlier Go 1.22.12 evidence remains preserved in `.factory/verification.md`, including end-to-end fake-`gh` account selection, scoped child-process tokens, concurrent invocations, GHES behavior, recovery/error exits, and `init --dry-run` coverage.
- The built site test verifies the deploy-root Static Web Apps policy, fingerprinted hero assets, the generated release cache identity, and that `SKIP_WAITING` is invoked only after the explicit update message.
- Chromium browser verification against the production build passed with no console/page errors. Axe found zero violations. After service-worker control, an offline reload rendered the cached home page. A second build with `RELEASE_ID=browser-update-check` produced the update toast; activating it switched the browser to the new cache.
- Header configuration was inspected in the exact `dist/site/staticwebapp.config.json` output. A live-header curl was also run against the currently deployed pre-repair site: as expected before deployment, it still returned `max-age=30` and the old HSTS lifetime and lacked the new policies.

## Deployment completed

`dist/site/` was deployed to the production Static Web App `sf-gh-account-autoswitch` on 2026-08-27 UTC. The custom domain `https://gh-account-autoswitch.sociobot.in/` now serves byte-identical `index.html` and `sw.js` to the local production output. Live header checks confirm `public, max-age=0, must-revalidate` for HTML and `/sw.js`; `public, max-age=31536000, immutable` for the fingerprinted main JS; the restrictive CSP and `X-Frame-Options: DENY`; the deny-by-default Permissions Policy; and preload-eligible HSTS.

## Known product limitations retained

- `init` can discover authenticated logins/hosts but cannot infer all organizations belonging to each identity; generated rules still need review.
- Release archives are prepared but not published. The factory owns release and hosting actions.

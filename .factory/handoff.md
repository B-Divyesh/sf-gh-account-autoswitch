# Handoff: gh-account-autoswitch v0.1.0 — delivery repair ready

**Repair base:** `9c89a4877382fe42b0554702dd8142db180233f9`
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

- Clean `npm ci`, `npm test`, `npm run build`, and `npm run package` passed with Go 1.22.12. Go unit tests passed; all six site tests passed; all five release archives were produced. The Linux tarball and Windows zip were inspected for binary, README, and MIT license.
- The built site test verifies the deploy-root Static Web Apps policy, fingerprinted hero assets, the generated release cache identity, and that `SKIP_WAITING` is invoked only after the explicit update message.
- Chromium browser verification against the production build passed with no console/page errors. Axe found zero violations. After service-worker control, an offline reload rendered the cached home page. A second build with `RELEASE_ID=browser-update-check` produced the update toast; activating it switched the browser to the new cache.
- Header configuration was inspected in the exact `dist/site/staticwebapp.config.json` output. A live-header curl was also run against the currently deployed pre-repair site: as expected before deployment, it still returned `max-age=30` and the old HSTS lifetime and lacked the new policies.

## Deployment follow-up

The repository does not modify hosting infrastructure. Deploy `dist/site/` from this commit, then confirm on `https://gh-account-autoswitch.sociobot.in/` that HTML and `/sw.js` return `public, max-age=0, must-revalidate`, a fingerprinted `/assets/*` response returns `public, max-age=31536000, immutable`, and CSP, frame, permissions, and HSTS headers are present. That live confirmation cannot occur until the factory deploys this commit.

## Known product limitations retained

- `init` can discover authenticated logins/hosts but cannot infer all organizations belonging to each identity; generated rules still need review.
- Release archives are prepared but not published. The factory owns release and hosting actions.

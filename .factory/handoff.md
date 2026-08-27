# Handoff: gh-account-autoswitch v0.1.0 — **FAIL independent verification**

**Candidate tested:** `4877ae8f766ba2bfe8cda205c976e546ecea6783`
**Live URL tested:** <https://gh-account-autoswitch.sociobot.in/>
**Verification report:** [`.factory/verification.md`](verification.md)

## Release status

**FAIL — do not mark this candidate accepted.** Core CLI, package, site, accessibility, privacy, offline reload, and candidate/live parity passed. The live delivery does not meet the factory contract: fingerprinted assets have only `Cache-Control: public, must-revalidate, max-age=30` rather than long-lived immutable caching; the service-worker cache stays at hard-coded `gh-account-autoswitch-v1`; and live responses lack CSP/framing/permissions protections. Exact reproduction steps and severity evidence are in the verification report.

Required follow-up before acceptance:

1. Configure one-year immutable caching for hashed static assets, retaining short revalidation for HTML and service worker.
2. Version the service-worker cache from each release and explicitly implement/test its update activation behavior.
3. Add a static-site CSP, frame protection, permissions policy, and suitable HSTS lifetime at deployment.

## What shipped

- A zero-dependency Go CLI with `which`, `run`, `init`, `--json`, `--config`, `--cwd`, documented help, stable exit codes, and version output.
- Strict ordered rules for exact hosts, owner/remote regular expressions, and `*`/`**` directory globs. SSH, `ssh://`, and HTTPS Git remotes are normalized; `origin` is preferred.
- A concurrency-safe execution path: the selected token is fetched with `gh auth token --hostname … --user …`, inherited token overrides are scrubbed, and only the child `gh` process receives `GH_TOKEN` or `GH_ENTERPRISE_TOKEN`. No global auth mutation or token persistence occurs.
- `init` discovers every account returned by `gh auth status --json hosts`, writes a mode-0600 starter config, refuses to overwrite by default, and supports dry-run/JSON output.
- A responsive static docs site in the product-specific luminous glass data landscape described in `.factory/design.md`, including an interactive rule trace, install copy feedback, no-match state, offline state and service-worker cache, privacy, and terms pages.
- An original AI-generated routing landscape, produced with the factory image deployment and optimized to 82 KB desktop / 33 KB mobile WebP. The exact prompt and provenance are in `.factory/design.md`.
- Cross-platform release packaging for Linux, macOS, and Windows, with README and MIT license in every archive.

## Run and verify

Requirements: Go 1.22+ and Node 20+.

```sh
npm ci
npm test
npm run build
```

The reproducible build outputs the host CLI at `dist/bin/gh-account-autoswitch` and the deployable site (with `index.html` at its root) at `dist/site/`.

To preview the site:

```sh
npm run dev
```

To create ready-to-publish release archives (publishing is intentionally not performed by the worker):

```sh
npm run package
```

## Prior builder-reported verification (superseded as acceptance evidence)

The following is retained as implementation history. It is not the independent acceptance result; the verdict and evidence above control.

- `go test ./... -race`: pass.
- `go vet ./...`: pass.
- `npm test`: pass (Go package/CLI tests plus built-site structure and asset-budget tests).
- `npm run build`: pass; outputs both the CLI and `dist/site/index.html`.
- Fresh-clone check: `npm ci && npm test && npm run build` passed from a new local clone with no working-tree cache.
- `npm run package`: pass; Linux/macOS amd64+arm64 tarballs and Windows amd64 zip inspected for binary, README, and license.
- axe-core 4.13, WCAG 2 A/AA/2.1 AA: zero violations on `/`, `/privacy/`, and `/terms/`.
- Lighthouse 12.8.2 mobile against the production preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.4 s, CLS 0, total blocking time 0 ms.
- Lighthouse console-errors, responsive-image, image sizing, color-contrast, and transfer-size audits: pass. Mobile transfer measured 44 KB under Lighthouse throttling/cache conditions.
- 390×844 and 1440×1000 browser screenshots inspected; mobile content stacks intentionally and has no horizontal page overflow. Reduced-motion removes transitions and smooth scrolling.
- `npm audit --omit=dev`: zero vulnerabilities.

## Known gaps and next steps

- `init` can know authenticated usernames and hosts, but GitHub CLI does not expose the organizations that belong to each identity. Generated owner rules therefore use the account login as a safe suggestion and must be reviewed or replaced with organization/path rules before use.
- Live token retrieval was exercised through deterministic fake-`gh` integration tests rather than a real developer credential store in the disposable build environment. The command and JSON formats were cross-checked against the current official `gh auth status` and `gh auth token` manuals.
- Release archives are prepared but not published; the factory should attach them to a `v0.1.0` GitHub release. No registry, DNS, infrastructure, or billing changes were made.
- If GitHub CLI later ships native contextual account selection with equivalent process isolation, publish a migration note and place this utility in maintenance mode as documented in the README.

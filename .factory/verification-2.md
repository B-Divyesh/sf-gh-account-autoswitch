# Independent verification 2 — PASS

**Candidate:** `8a9492a68a9fd0a0f4ae014320e3ab6d0390ee79`  
**Live URL:** <https://gh-account-autoswitch.sociobot.in/>  
**Verified:** 2026-08-27 UTC  
**Method:** fresh detached clone at the candidate SHA; no product-code changes.

## Verdict

**PASS.** The candidate delivers the researched v1: it resolves a Git remote or directory rule, obtains the selected existing `gh` account token, and scopes it to just the child `gh` process. It does not call `gh auth switch`, write a token, or mutate global authentication. The live documentation/PWA deployment is byte-identical to the candidate's production output and satisfies its stated privacy, accessibility, caching, and browser-policy claims.

## Clean-clone quality gates

Go 1.22.12 was installed under `/tmp/verify-go` because the disposable base image did not provide Go. Node was 22.23.2. The detached source checkout and the original worktree remained source-clean throughout testing.

| Command/check | Result |
| --- | --- |
| `npm ci` | PASS; 16 packages, `npm audit` found 0 vulnerabilities |
| `npm test` | PASS; Go package tests plus all 6 built-site tests |
| `go test -race ./...` | PASS |
| `go vet ./...` | PASS |
| `npm run build` | PASS; exact production CLI and `dist/site/` emitted |
| `npm run package` | PASS; Linux amd64/arm64, macOS amd64/arm64, and Windows amd64 archives emitted |
| lint/typecheck | No dedicated repository script exists; Vite production compilation and Go vet/type compilation passed |

Built initial assets: JS 3,085 B (1,380 B gzip), CSS 15,059 B (4,070 B gzip), desktop WebP 83,046 B, and mobile WebP 33,714 B. Each is under the applicable budget (200 KB JS, 50 KB CSS, 300 KB hero).

## CLI and clean-consumer exercise

The Linux amd64 release archive was extracted into a fresh consumer directory. All account responses came from a deterministic fake `gh`; no real credential store or token was accessed.

- Normal SSH remote `git@github.com:acme-corp/payments.git`: `which --json` selected `alice` and the Acme rule.
- `run -- show-env` replaced inherited `GH_TOKEN` and `GH_ENTERPRISE_TOKEN`; the GitHub.com child received only its selected `GH_TOKEN`.
- GHES remote `ssh://git@github.corp.example/platform/sso.git` received only `GH_ENTERPRISE_TOKEN`.
- A non-repository directory rule selected `bob`, demonstrating the documented directory-only recovery path.
- No rule returned exit 3; an unknown TOML key failed closed with exit 2; an unavailable selected account returned exit 4 without printing the fake token; a real-`gh` exit 17 was preserved.
- `init --dry-run --json` discovered GitHub.com and GHES accounts without writing a configuration. `--help` and `version --json` also passed.
- Concurrent Acme and directory invocations independently received their own fake tokens, with no shared token environment or global switch.

This directly validates the brief's identity-safety claim under concurrent invocation rather than only exercising unit tests.

## Live site, privacy, security, and accessibility

Chromium exercised the live home page at 1440×900 and 390×844. Normal, personal, and no-match trace selections updated as expected. Both viewports had one `h1` and one `main`, no console or page errors, and only same-origin runtime requests (HTML, local JS/CSS/image, mark, and worker). No third-party script, font, analytics, tracker, beacon, or token-bearing request was seen. Source/runtime inspection also found no `localStorage`, `sessionStorage`, or IndexedDB use; the intended service-worker Cache Storage holds only public files, consistent with `/privacy`.

- Keyboard-only first Tab reaches the skip link with a visible cyan 3 px focus outline. No keyboard trap was encountered.
- Axe-core 4.13.0 found **zero serious or critical violations** on the live home page at both sizes. HTML/title/lang/main/heading and image-alt checks passed.
- With reduced motion, animation and transition duration became `0.00001s` and scroll behavior became `auto`.
- The live worker controlled a reload; an offline reload at 390 px rendered the cached page and offline notice with no errors.
- A local production-output simulation serving a changed worker produced the “A documentation update is ready” notice. Its Refresh action activated the waiting worker and controlled the reloaded page.

Live headers are appropriate for the static product: HTML and `sw.js` use `public, max-age=0, must-revalidate`; fingerprinted assets use `public, max-age=31536000, immutable`; HSTS is two years with subdomains and preload; CSP is self-only with `frame-ancestors 'none'`; framing is denied; the Permissions Policy denies sensitive features; `nosniff` and a strict referrer policy are set.

Lighthouse CLI itself could not complete in this container: its Chrome 145 tab crashed/was unreachable. This is a tooling limitation, not a product error; the independent browser, Axe, offline, header, and asset-budget checks above completed. No Lighthouse score is asserted.

## Candidate/live parity

SHA-256 matched between the exact production build and the live response for `/`, `/sw.js`, both hashed JS/CSS assets, both hero WebPs, `/privacy/`, and `/terms/`. The deployed hashes included:

| Resource | SHA-256 |
| --- | --- |
| `/` | `97113767c484616debb9bb2331307244e185b407e311d35286b6d17b501b5eb7` |
| `/sw.js` | `130f2573c7bf838f36590b72b95552ba1ebf5bfbf4b4b2ff539c8635993fb8c8` |
| `/assets/main-S3hPx4Fq.js` | `f497e6253c989cecfa1dae6dc7eaf65b211f0861d4307afd7fa269a576767582` |
| `/assets/style-DVKmIDlC.css` | `943399bf6428f3ef71ff805f17c55efe9e9ee365f8d474fd325b026046a731d3` |

## Defects by severity

None found: P0 0, P1 0, P2 0, P3 0.

## Non-blocking limitations

- `init` can discover authenticated logins and hosts but cannot infer every organization owned by an identity, so generated rules require review.
- Archives are ready for factory publishing; no registry or release was published during verification.


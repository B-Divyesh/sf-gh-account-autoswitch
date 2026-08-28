# Perfection-loop polish 1

**Work order:** `gh-account-autoswitch-polish-1-all-findings`

**Reviewed baseline:** `3d3ea74d14d80435d1bf6ac1db26a3031a1dd0b2`

**Adversarial report:** `52066ffd077e2c07f77bb6d5fa44ee4e50c12bec`

**Repair commit:** `202851ce044f795a0fc6ecae30e0523294102345`

**Deployment:** `b922a3b8-e76f-4eca-b29e-b2982a533cfc`

**Live URL:** <https://gh-account-autoswitch.sociobot.in/>

No earlier `.factory/polish-*.md` existed. `review-1.md` was the only matching review file.

## Evidence key

- **H:** live home at <https://gh-account-autoswitch.sociobot.in/>; [desktop screenshot](evidence/live-home/screenshot-desktop.webp), [390 px screenshot](evidence/live-home/screenshot-mobile.webp), and [cold-check result](evidence/live-home/verify.json).
- **D:** cold query entry at <https://gh-account-autoswitch.sociobot.in/?demo=1>; [desktop screenshot](evidence/live-demo/screenshot-desktop.webp), [390 px screenshot](evidence/live-demo/screenshot-mobile.webp), and [cold-check result](evidence/live-demo/verify.json).
- **R:** `npm run verify:live` checked `/`, `/demo/`, `/privacy/`, `/terms/`, and `/no-such-page` at 1440 and 390 px: correct status/title, one `h1`/`main`, no overflow, same-origin requests, no console errors, and zero serious/critical Axe findings. It also exercised query-demo replay, reset, storage isolation, and Start for real.
- **C:** a separate clean clone at `202851c`; all 16 commands in `.factory/claims.json` passed individually, followed by `npm test`, `go test -race ./...`, `go vet ./...`, `npm run build`, and `npm run package`.

## Review findings 1–8

| ID | Change made | Evidence |
| --- | --- | --- |
| 1 | Replaced the first screen with the required eight-word job headline and 15-word audience sentence. | `first screen and catalog use the reviewed plain wording`; H |
| 2 | Added the first-screen sample action, `?demo=1` entry, real `/demo/`, persistent banner, replay/reset, Start for real, bundled samples, and CLI `demo`. Reset now restores state, announces it, and focuses the heading. | `@claim:browser-demo`, `@claim:demo-selection`, `@claim:demo-isolation`; D, R |
| 3 | Expanded `.factory/claims.json` to 16 independently runnable claims and made the static suite reject missing, duplicate, or undeclared claim tags. | `every declared claim has exactly one tagged test`; 16/16 individual claim commands in C |
| 4 | Kept real demo/privacy/terms routes, sitemap entries, Static Web Apps rewrites, and the product-styled 404 with local assets and a route home. | `routing owns demo, legal paths, and 404 responses`, `unknown paths use the product 404`; R |
| 5 | Kept the real matcher-backed CLI demo in an OS temporary directory and now verifies removal before it reports success. | `@claim:demo-selection`, `@claim:demo-isolation`; D, C |
| 6 | Completed per-route title/description/canonical/OG/Twitter/manifest/icon metadata, identical route chrome, build label, legal links, and back/forward focus handling. | `every route has complete local metadata`, `document navigation focuses its heading and browser history remains usable`; R |
| 7 | Replaced every listed jargon-first string with stable account/rule/folder/token language and retained the complete sentence audit. | `.factory/copy-audit.md`; `first screen and catalog use the reviewed plain wording`; H |
| 8 | Kept the actionable Go 1.22 preflight, documented the prerequisite beside `npm test`, and added a claim test for the version and missing-auth guidance. | `@claim:toolchain-prerequisites`; clean clone C used Go 1.22.12 |

## Unlisted-claim findings U1–U9

| ID | Change made | Evidence |
| --- | --- | --- |
| U1 | Token output, logs, config, and temporary files are scanned for a canary token. | `@claim:token-confidentiality`; C |
| U2 | Two account commands now run concurrently with hostile inherited tokens; the call log forbids `gh auth switch` and the active-account sentinel stays unchanged. | `@claim:command-isolation`; C |
| U3 | Three bundled repositories resolve to their exact accounts; child fixtures receive the account-specific token. | `@claim:demo-selection`, `@claim:command-isolation`; D, C |
| U4 | The fake GitHub CLI log proves one token request per run and the child sees only its selected token. | `@claim:command-isolation`; C |
| U5 | A table-driven rule fixture covers host, owner, full remote, folder, all-fields matching, and first-match order. | `@claim:matching-rules`; C |
| U6 | `which` succeeds while a token-request fixture would fail, and its JSON fields are asserted. | `@claim:which-safe`, `@claim:json-output`; C |
| U7 | Usage, no-match, missing-token, and child exit codes are observed; no-match proves `gh` was not run. | `@claim:exit-codes`; C |
| U8 | Go 1.22+, empty authentication guidance, and private starter-rule generation are tested. | `@claim:toolchain-prerequisites`, `@claim:starter-rules`; C |
| U9 | Remote formats, unknown-key rejection, JSON output, site privacy, offline routes, license, and all remaining documented behavior have dedicated manifest entries. Untestable future-maintenance promises were removed. | `@claim:remote-formats`, `@claim:config-safety`, `@claim:json-output`, `@claim:site-private`, `@claim:offline-docs`, `@claim:free-license`; H, R, C |

## Copy findings C1–C25

| ID | Change made | Evidence |
| --- | --- | --- |
| C1 | Kept the product name as the wordmark and made the page heading the user’s job. | plain-wording test; H |
| C2 | Replaced the isolated “Rules” label with contextual account-rule wording. | banned/legacy phrase scan; H |
| C3 | Made “Try it with sample data” primary and renamed installation to “Install the command.” | plain-wording test; H, D |
| C4 | Replaced identity/policy language with account matching and “matching rule found.” | copy audit; H |
| C5 | Replaced the slogan with “Choose the right GitHub account per repository.” | plain-wording test; H |
| C6 | Added the required audience sentence for developers with work and personal accounts. | plain-wording test; H |
| C7 | Standardized on “active GitHub account” and removed global-state/race metaphors. | copy audit; `@claim:command-isolation`; H |
| C8 | Replaced Process-scoped, Context-aware, and Agent-safe with outcome labels. | copy audit; H |
| C9 | Replaced abstract numbered headings with task-specific headings. | copy audit; H |
| C10 | Replaced policy-layer/credential-store wording with rules and signed-in accounts. | copy audit; H |
| C11 | Explained token handoff in plain language and kept implementation detail in README. | copy audit; `@claim:command-isolation`; H |
| C12 | Defined match fields through examples and plain labels; JSON/TOML detail remains only where needed. | copy audit; `@claim:matching-rules`, `@claim:json-output`; H |
| C13 | Renamed the step “Run the command with that account.” | copy audit; H |
| C14 | Renamed the section “See which account a repository will use.” | copy audit; H |
| C15 | Renamed the control “See a sample repository match.” | copy audit; H |
| C16 | Standardized user-facing terminology on GitHub account, command, and scripts. | terminology table and banned/legacy phrase scan; H |
| C17 | Copy buttons now name “install command,” “create-rules command,” and “demo command.” | browser keyboard/copy controls; H, D |
| C18 | Renamed the safety section “What the command does not change.” | copy audit; H |
| C19 | Replaced the secret-sync metaphor with “Does not save tokens.” | copy audit; `@claim:token-confidentiality`; H |
| C20 | Replaced silent-fallback wording with “Stops without a match.” | copy audit; `@claim:exit-codes`; H |
| C21 | Replaced the identity-lane slogan with “Choose one GitHub account for each repository.” | copy audit; H |
| C22 | Split exit-code guidance into short sentences and test each documented result. | `@claim:exit-codes`; C |
| C23 | Renamed “Safety model” to “How tokens and accounts are handled.” | copy audit; README |
| C24 | Offline status now says “You are offline. Installation instructions are still available.” | `@claim:offline-docs`; H |
| C25 | Update notice now says “An update is ready. Refresh to use it.” | service-worker static test; H |

## Final release evidence

- Lighthouse 13 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, CLS 0, TBT 30 ms.
- Production assets: JS 4,589 bytes, CSS 19,743 bytes, desktop hero 83,046 bytes, mobile hero 33,714 bytes.
- Live HTML, service worker, JS, CSS, 404, demo, privacy, and terms files matched the deployed build by SHA-256.
- HTML and service worker revalidate; hashed assets return `public, max-age=31536000, immutable`. CSP, HSTS, Permissions Policy, referrer policy, `nosniff`, and frame denial are live.

**Unresolved findings:** none.

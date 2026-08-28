# Perfection-loop polish 2

**Baseline:** `463649844c3e39d0453c30e7c43c50c78f72040f`
**Review:** `4a2a0828d31fb64c09719d8a5aef8d4e249fc8a9`
**Repair:** `26565fb037165f86b3a600723c90abc434322fdf`
**Deployment:** Static Web Apps deployment `216d1168-ab25-476f-9f39-08ae86a8bc7c`
**Live URL:** <https://gh-account-autoswitch.sociobot.in/>

## Evidence key

- **Clean claims:** fresh clone at `26565fb`; `npm ci`, then each of the 16 commands in `.factory/claims.json` separately. All passed. The aggregate `npm run test:claims` also passed 16/16.
- **Clean suite:** the same clone passed `npm test`, `go test -race ./...`, `go vet ./...`, `npm run build`, and `npm run package`, using isolated Go 1.22.12 at `/tmp/gh-account-autoswitch-go122` because the base image has no Go installation.
- **Live:** `npm run verify:live` passed all 11 checks: home/demo/privacy/terms/404 at 1440 and 390 px, plus query-demo banner/reset/start-for-real. It found zero serious/critical Axe violations and zero product console errors. The factory cold check is at `/work/.evidence/gh-account-autoswitch-polish-2/verify.json`; screenshots are `/work/.evidence/gh-account-autoswitch-polish-2/screenshot-desktop.png` and `/work/.evidence/gh-account-autoswitch-polish-2/screenshot-mobile.png`.
- **Performance:** the saved Lighthouse JSON reports Performance 100, Accessibility 100, SEO 100; LCP 1,214 ms, CLS 0, TBT 83 ms at `/work/.evidence/gh-account-autoswitch-polish-2/lighthouse/report.json`. The runner emitted a post-report target-crash exit after writing that report, so browser/Axe checks above remain the release accessibility evidence.

## Current review findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Rewrote Privacy to say the demo stores no personal account or repository data and that public documentation is cached offline. `browser-demo` now inspects Cache Storage, asserts empty local/session/IndexedDB, one versioned cache, same-origin query-free entries, and exact membership in the generated `PRECACHE`. The worker now declares `/sw.js` too, and its template participates in the cache fingerprint. | `@claim:browser-demo`; Clean claims; live `/privacy/` contains the corrected sentence; Live screenshots and `verify.json`. |
| F-2-2 | Removed the untestable affiliation/endorsement sentences from README and Terms. The copy audit test now scans README and both legal pages and rejects those phrases. | `first screen and catalog use the reviewed plain wording`; Clean suite; live `/terms/` cold check; Live screenshots and `verify.json`. |

## Review 1 findings retained and rechecked

| Finding | Change made | Evidence |
| --- | --- | --- |
| 1 | Retained the eight-word job headline and explicit work/personal-account audience sentence on the first screen. | static plain-wording test; live `/`; desktop/mobile screenshots. |
| 2 | Retained the one-click `?demo=1` entry, `/demo/` route, persistent banner, replay/reset, Start for real, and real CLI recording. | `@claim:browser-demo`, `@claim:demo-selection`, `@claim:demo-isolation`; live `/?demo=1`; mobile screenshot. |
| 3 | Retained the 16-entry manifest with exactly one tagged observable test per claim. | manifest uniqueness test; Clean claims 16/16. |
| 4 | Retained direct demo/legal routes, sitemap entries, Static Web Apps routing, and styled 404. | routing test; live `/demo/`, `/privacy/`, `/terms/`, `/no-such-page`; `verify.json`. |
| 5 | Retained the matcher-backed `demo` command and temporary-workspace removal check. | `@claim:demo-selection`, `@claim:demo-isolation`; Clean claims. |
| 6 | Retained route metadata, shared chrome, legal links, and destination-heading focus/history behavior. | metadata and navigation browser tests; live route checks; `verify.json`. |
| 7 | Retained account/rule/folder/token terminology and the complete copy audit. | plain-wording/copy audit tests; live screenshots. |
| 8 | Retained the Go 1.22 preflight and documented full-suite prerequisite. | `@claim:toolchain-prerequisites`; Clean suite on Go 1.22.12. |

## Unlisted-claim findings retained and rechecked

| Finding | Change made | Evidence |
| --- | --- | --- |
| U1 | Canary-token tests prove tokens are absent from output, logs, config, and files. | `@claim:token-confidentiality`; Clean claims. |
| U2 | Concurrent fixtures prove no global account switch or shared token environment. | `@claim:command-isolation`; Clean claims. |
| U3 | Bundled work, personal, and client repositories resolve to their stated accounts. | `@claim:demo-selection`, `@claim:command-isolation`; live demo screenshot. |
| U4 | Fake GitHub CLI log proves one token request and child-only token exposure. | `@claim:command-isolation`; Clean claims. |
| U5 | Host, owner, remote, folder, all-fields, and first-match ordering are fixture-covered. | `@claim:matching-rules`; Clean claims. |
| U6 | `which` has token-free plain and JSON output. | `@claim:which-safe`, `@claim:json-output`; Clean claims. |
| U7 | Usage/no-match/missing-token/child exit behavior is observed without fallback. | `@claim:exit-codes`; Clean claims. |
| U8 | Go/auth guidance and private starter-rule generation are covered. | `@claim:toolchain-prerequisites`, `@claim:starter-rules`; Clean claims. |
| U9 | Remote formats, bad config, JSON, runtime privacy, offline docs, and MIT license remain individually claimed. | `@claim:remote-formats`, `@claim:config-safety`, `@claim:json-output`, `@claim:site-private`, `@claim:offline-docs`, `@claim:free-license`; Clean claims and live checks. |

## Copy findings retained and rechecked

| Finding IDs | Change retained | Evidence |
| --- | --- | --- |
| C1 | Wordmark remains separate from the job heading. | static plain-wording test; live `/`. |
| C2 | Navigation uses contextual account-rule wording. | copy audit; live screenshots. |
| C3 | Sample demo remains the primary action and installation names its result. | static plain-wording test; live `/?demo=1`. |
| C4 | Identity/policy wording remains replaced by account/matching-rule wording. | copy audit; live screenshots. |
| C5 | The plain job headline remains in place. | static plain-wording test; live `/`. |
| C6 | The audience sentence remains explicit. | static plain-wording test; live `/`. |
| C7 | Active GitHub account wording remains consistent. | copy audit; `@claim:command-isolation`. |
| C8 | Abstract labels remain replaced by outcome labels. | copy audit; live screenshots. |
| C9 | Numbered headings remain task-specific. | copy audit; live screenshots. |
| C10 | Rules and signed-in accounts replace credential-store metaphors. | copy audit; live `/`. |
| C11 | Token handoff remains concrete and test-backed. | `@claim:command-isolation`; live `/`. |
| C12 | Matching fields and JSON are explained by labeled examples. | `@claim:matching-rules`, `@claim:json-output`; live `/`. |
| C13 | The run step names the account result. | copy audit; live `/`. |
| C14 | The inspection section names the account decision. | copy audit; live `/`. |
| C15 | The sample control names the repository match. | copy audit; live `/`. |
| C16 | Account/command/script terms remain stable. | copy-audit terminology table; live screenshots. |
| C17 | Copy controls name their copied command. | browser keyboard/copy test; live `/`. |
| C18 | Safety content names the unchanged things. | copy audit; live `/`. |
| C19 | Token copy says it does not save tokens. | `@claim:token-confidentiality`; live `/`. |
| C20 | No-match copy states the stop result. | `@claim:exit-codes`; live `/`. |
| C21 | Footer retains the one-account-per-repository statement. | skeleton test; live screenshots. |
| C22 | Exit guidance is short and observable. | `@claim:exit-codes`; Clean claims. |
| C23 | README explains token/account handling directly. | copy audit; README clean-clone check. |
| C24 | Offline notice says what remains available. | `@claim:offline-docs`; live browser check. |
| C25 | Update notice says refresh to use it. | service-worker static test; live service-worker check. |

**Unresolved findings:** none.

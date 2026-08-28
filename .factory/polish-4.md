# Perfection-loop polish 4

**Baseline candidate:** `4c8e64f5e617d60ae586c6f021da68708617bb3a`

**Adversarial review:** `afbbff2da9745b16bcb793f18bcb0a90054f3eb4`

**Tested repair:** `dad3b61f3b9f041939b69f259fa4090633a5a698`

**Deployment:** Static Web Apps deployment `3ac36063-4312-4225-9d20-0db48e73b582`

**Live URL:** <https://gh-account-autoswitch.sociobot.in/>

## Evidence key

- **C:** [clean-clone summary](evidence/polish-4/clean-summary.txt). Every one of the 19 manifest commands passed separately from a clone of `dad3b61`; the release-package test used a new Go cache and passed in 33.8 seconds.
- **T:** The same clone passed `npm test` (2 Go packages, 10 static tests, 19 claim tests, 9 browser tests), `go test -race ./...`, `go vet ./...`, `npm run build`, and `npm run package`.
- **L:** [live verifier](evidence/polish-4/live/verify.json) passed 11 checks over home, demo, Privacy, Terms, 404, and `?demo=1` at desktop and 390 px. Every page had zero serious/critical Axe findings and zero console errors.
- **D:** [live demo audit](evidence/polish-4/live/demo-mobile.json) and [390 px screenshot](evidence/polish-4/live/demo-mobile.png) prove the banner, first result above the fold, reset/focus behavior, seeded-storage isolation, declared public cache, same-origin requests, and offline reload.
- **V:** `verify-url.sh` passed; see its [report](evidence/polish-4/live/url-check/verify.json), [desktop screenshot](evidence/polish-4/live/url-check/screenshot-desktop.png), and [mobile screenshot](evidence/polish-4/live/url-check/screenshot-mobile.png).
- **R:** [link/focus audit](evidence/polish-4/live/links-focus.json) and [deployed-file parity](evidence/polish-4/live/parity.json) confirm live links, route focus, statuses, and byte-for-byte release parity.
- **P:** [Lighthouse report](evidence/polish-4/live/lighthouse-headless.json): Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1,052 ms, CLS 0, TBT 0 ms.

## Review 4 finding

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-4-1 | Replaced the ignored third `test()` argument with Playwright's supported `test.setTimeout(180_000)` inside the release-package claim. The five archive names and executable/README/LICENSE checks remain intact. | `@claim:release-package`; cold new-cache run passed in 33.8 s; C, T. |

## Review 1 findings

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| 1 | Retained the eight-word job headline and explicit work/personal-account audience on the first screen. | `first screen and catalog use the reviewed plain wording`; V. |
| 2 | Retained the one-click `?demo=1` entry, real demo route, persistent banner, reset, Start for real, recording, and isolated CLI demo. Tightened the worker so a controlled query entry is never cached. | `@claim:browser-demo`, `@claim:demo-selection`, `@claim:demo-isolation`; D. |
| 3 | Retained 19 unique manifest claims with exactly one observable tagged test each. | `every declared claim has exactly one tagged test`; 19/19 individual commands in C. |
| 4 | Retained real demo/legal routes, sitemap entries, route rewrites, and product-styled 404. | `routing owns demo, legal paths, and 404 responses`; L, R. |
| 5 | Retained the matcher-backed CLI demo in a removed operating-system temporary directory. | `@claim:demo-selection`, `@claim:demo-isolation`; C. |
| 6 | Retained route-specific metadata, shared chrome/legal links, local social assets, destination focus, and history behavior. | `every route has complete local metadata`; browser focus test; L, R. |
| 7 | Retained consistent account/rule/folder/remote/token/demo language and the complete copy audit. | `first screen and catalog use the reviewed plain wording`; `.factory/copy-audit.md`; V. |
| 8 | Retained the Go 1.22 preflight and prominent Node/Go test prerequisites. | `@claim:toolchain-prerequisites`; C, T. |

## Review 1 unlisted-claim findings

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| U1 | Canary-token checks prove tokens are absent from output, rules, and temporary files. | `@claim:token-confidentiality`; C. |
| U2 | Concurrent fixtures prove no active-account switch or shared token state. | `@claim:command-isolation`; C. |
| U3 | Bundled work, personal, and client repositories resolve to their stated accounts. | `@claim:demo-selection`, `@claim:command-isolation`; C, D. |
| U4 | The fake GitHub CLI proves one token request per run and child-only token exposure. | `@claim:command-isolation`; C. |
| U5 | Host, owner, remote, folder, combined fields, and first-match order remain fixture-tested. | `@claim:matching-rules`; C. |
| U6 | `which` remains token-free in plain and JSON output. | `@claim:which-safe`, `@claim:json-output`; C. |
| U7 | Usage, no-match, missing-token, and child exit behavior remain observable without fallback. | `@claim:exit-codes`; C. |
| U8 | Node/Go/auth guidance and private starter-rule generation remain tested. | `@claim:toolchain-prerequisites`, `@claim:starter-rules`; C. |
| U9 | Remote formats, invalid config, JSON, workflow outputs, privacy, offline docs, and MIT licensing remain separately claimed. Untestable status promises remain absent. | `@claim:remote-formats`, `config-safety`, `json-output`, `full-suite`, `build-artifacts`, `release-package`, `site-private`, `offline-docs`, `free-license`; C, T. |

## Review 1 copy findings

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| C1 | The wordmark remains separate from the job `<h1>`. | static wording test; V. |
| C2 | Navigation retains contextual account-rule wording. | copy audit; V. |
| C3 | The sample demo remains primary; installation names its result. | static wording test; D, V. |
| C4 | Account and matching-rule words remain in place of identity/policy jargon. | copy audit; V. |
| C5 | The plain job headline remains in place. | static wording test; V. |
| C6 | The audience sentence still names developers with work and personal accounts. | static wording test; V. |
| C7 | “Active GitHub account” remains the consistent term. | copy audit; `@claim:command-isolation`. |
| C8 | Outcome labels remain in place of abstract labels. | copy audit; V. |
| C9 | Numbered headings remain task-specific. | copy audit; V. |
| C10 | Rules and signed-in accounts remain in place of credential-store metaphors. | copy audit; V. |
| C11 | Token handoff remains concrete and test-backed. | `@claim:command-isolation`; V. |
| C12 | Match fields and JSON remain explained with labels and examples. | `@claim:matching-rules`, `@claim:json-output`; V. |
| C13 | The run step names the selected-account result. | copy audit; V. |
| C14 | The inspection heading says which account a repository will use. | copy audit; V. |
| C15 | The sample control names the repository match. | copy audit; V. |
| C16 | Account, command, and script terminology remains stable. | terminology table in `.factory/copy-audit.md`. |
| C17 | Copy controls name the command copied. | browser keyboard/copy coverage; V. |
| C18 | The safety section states what the command does not change. | copy audit; V. |
| C19 | Token copy says tokens are not saved. | `@claim:token-confidentiality`; V. |
| C20 | No-match copy states that the command stops. | `@claim:exit-codes`; V. |
| C21 | The footer states one GitHub account per repository. | skeleton test; V. |
| C22 | Exit guidance is split into short, tested sentences. | `@claim:exit-codes`; C. |
| C23 | README directly explains token and account handling. | copy audit; C. |
| C24 | Offline notice says installation instructions remain available. | `@claim:offline-docs`; C, D. |
| C25 | Update notice says to refresh. | service-worker static test; T. |

## Review 2 findings

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| F-2-1 | Privacy still distinguishes personal data from public offline files. Round 4 closed an uncovered edge by restricting runtime caching to query-free paths already in `PRECACHE`; the claim now starts from a controlled page with seeded local/session/IndexedDB sentinels. | `@claim:browser-demo`; D shows `publicCacheOnly: true`, one versioned cache, unchanged sentinels, and offline 200. |
| F-2-2 | The untestable affiliation/endorsement sentence remains absent from README and Terms. | wording regression scan; T, R. |

## Review 3 findings

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| F-3-1 | The compact mobile demo still shows a complete repository/account/rule result without scrolling. | `one mobile demo click shows a complete sample match`; D records row bottom 513.17 px in an 844 px viewport. |
| F-3-2 | Every visible mobile control remains at least 44 by 44 CSS pixels. | `every visible mobile control has a 44 pixel hit area`; L. |
| F-3-3 | Node.js 20+ and Go 1.22+ remain part of the tested toolchain claim. | `@claim:toolchain-prerequisites`; C. |
| F-3-4 | Missing-Go guidance remains exercised with a PATH that cannot find Go. | `@claim:toolchain-prerequisites`; C. |
| F-3-5 | The aggregate Go/static/claim/browser/Axe/privacy/offline suite remains manifest-backed. | `@claim:full-suite`; T. |
| F-3-6 | Clean CLI and static-site build outputs remain asserted. | `@claim:build-artifacts`; C, T. |
| F-3-7 | The archive set and contents remain asserted; its test now has a working 180-second timeout. | `@claim:release-package`; F-4-1 evidence in C. |
| F-3-8 | The `build:site` destination remains included in build-artifact coverage. | `@claim:build-artifacts`; C, T. |
| F-3-9 | The untestable deployment-ownership sentence remains absent from public README copy. | wording regression scan; T. |

## Final status

Every current and historical finding is fixed and rechecked. No severity is deferred, and no unresolved finding remains.

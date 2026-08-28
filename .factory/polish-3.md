# Perfection-loop polish 3

**Baseline candidate:** `8eb7dd887df7898ff32304377f049c357ece7d7a`  
**Adversarial review:** `2b534333b8c4d27f6ee37985897ece5ec2558599`  
**Product repair:** `365f3c265808d740cc6cbcdee627daa876acdf3d`  
**Deployment:** Static Web Apps deployment `2e4ef38c-bed3-4e7b-a835-8ab4a0df3a75`  
**Live URL:** <https://gh-account-autoswitch.sociobot.in/>

## Evidence key

- **Clean clone claims:** a fresh clone at `365f3c265808d740cc6cbcdee627daa876acdf3d` ran `npm ci`, then every one of the 19 commands in `.factory/claims.json` separately. All 19 passed. The Go 1.22.12 toolchain was supplied at `/tmp/gh-account-autoswitch-go122` because the base image intentionally has no Go installation.
- **Clean clone suite:** that same clone passed `npm test` (10 static, 19 claims, 9 browser checks), `go test -race ./...`, `go vet ./...`, `npm run build`, and `npm run package`.
- **Live cold check:** `npm run verify:live` passed all 11 checks over `/`, `/demo/`, `/privacy/`, `/terms/`, `/no-such-page`, and `?demo=1`, at desktop and 390 px. Axe reported zero serious/critical issues and the browser reported zero console errors. `verify-url.sh` also passed.
- **Live artifacts:** [verify.json](evidence/polish-3/live/verify.json), [mobile demo metrics](evidence/polish-3/live/demo-mobile.json), [mobile demo screenshot](evidence/polish-3/live/demo-mobile.png), [desktop screenshot](evidence/polish-3/live/screenshot-desktop.png), and [mobile site screenshot](evidence/polish-3/live/screenshot-mobile.png). The cold 390 x 844 demo check measured the first complete sample result at `bottom: 513.17px` and every interactive control at least 44 px in both dimensions.
- **Performance:** [Lighthouse JSON](evidence/polish-3/live/lighthouse.json) recorded Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 1,056.85 ms, CLS 0, and TBT 104.5 ms. Chromium emitted a post-audit target-crash after writing the score-bearing report; the independent live browser, Axe, and `verify-url.sh` checks above passed.

## Review 3 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | Rewrote the demo heading and made recording result rows compact, labeled, and stacked on 390 px. The first work repository, account, and matching rule now appear before the fold after one click or at `?demo=1`. | `browser.spec.ts` mobile demo test; `npm run verify:live`; `demo-mobile.json`; live `?demo=1`. |
| F-3-2 | Gave repeated navigation and footer links a 44 x 44 px minimum target. Added a 390 px all-control target-size assertion on every route. | `browser.spec.ts`; `verify-live.mjs`; `demo-mobile.json`; live routes. |
| F-3-3 | Expanded `toolchain-prerequisites` to cover Node.js 20+ and Go 1.22+ with an observable Node version check. | `@claim:toolchain-prerequisites`; clean-clone claim pass. |
| F-3-4 | Made the missing-Go diagnostic part of `toolchain-prerequisites` and ran it with an empty `PATH` fixture. | `@claim:toolchain-prerequisites`; clean-clone claim pass. |
| F-3-5 | Added the `full-suite` claim and test for the aggregate script graph and Go, static, claim, browser, Axe, privacy, and offline coverage. | `@claim:full-suite`; clean-clone claim pass. |
| F-3-6 | Added the `build-artifacts` claim and test that runs `build` and checks CLI and public site output in `dist/`. | `@claim:build-artifacts`; clean-clone claim pass. |
| F-3-7 | Added the `release-package` claim and test that inspects every archive for executable, README, and license. | `@claim:release-package`; clean-clone claim pass. |
| F-3-8 | Included `build:site` and `dist/site/` in the tested `build-artifacts` claim. | `@claim:build-artifacts`; clean-clone claim pass. |
| F-3-9 | Removed the untestable factory-deployment-ownership assertion. README gives only the verifiable static build recipe. | README copy audit; `npm run test:site`; live `/`. |

## Earlier review findings retained and rechecked

| Finding | Change retained | Evidence |
| --- | --- | --- |
| 1 | The first screen keeps the plain job heading and explicit work, personal, and client-account audience. | static plain-wording test; live `/`; screenshots. |
| 2 | The direct `?demo=1` and `/demo/` sandbox keeps its banner, Reset demo, Start for real, and visible sample result. | `@claim:browser-demo`, `@claim:demo-selection`, `@claim:demo-isolation`; live `?demo=1`. |
| 3 | `.factory/claims.json` now has 19 unique claim IDs and exactly one observable tagged test each. | manifest test; all 19 clean-clone commands. |
| 4 | Direct demo/legal URLs, history/focus behavior, sitemap, fallback, and styled 404 remain real routes. | routing/browser checks; `verify.json`. |
| 5 | The CLI `demo` command uses bundled repositories in a temporary workspace and removes it afterwards. | `@claim:demo-selection`, `@claim:demo-isolation`. |
| 6 | Route metadata, shared chrome, legal links, and destination-heading focus remain in place. | metadata/navigation browser checks; `verify.json`. |
| 7 | Account, rule, folder, and token terminology remains consistent and the copy audit has no visitor-copy flags. | copy audit/static tests; live screenshots. |
| 8 | Toolchain and authenticated-`gh` guidance is manifest-backed, including Node and missing-Go behavior. | `@claim:toolchain-prerequisites`; clean suite. |

## Unlisted-claim findings retained and rechecked

| Finding | Change retained | Evidence |
| --- | --- | --- |
| U1 | Token canaries prove tokens are absent from output, logs, configuration, and files. | `@claim:token-confidentiality`. |
| U2 | Concurrent fixtures prove no global switch or shared token environment. | `@claim:command-isolation`. |
| U3 | Bundled work, personal, and client repositories resolve to their shown accounts. | `@claim:demo-selection`, `@claim:command-isolation`; live demo. |
| U4 | The fake GitHub CLI proves one token request and child-only exposure. | `@claim:command-isolation`. |
| U5 | Host, owner, remote, folder, all-fields, and first-match precedence are fixture-covered. | `@claim:matching-rules`. |
| U6 | `which` remains token-free in plain and JSON output. | `@claim:which-safe`, `@claim:json-output`. |
| U7 | Usage, no-match, missing-token, and child exit behavior remain observed with no fallback. | `@claim:exit-codes`. |
| U8 | Go/auth guidance and private starter-rule generation remain observable. | `@claim:toolchain-prerequisites`, `@claim:starter-rules`. |
| U9 | Remote formats, config rejection, JSON, runtime privacy, offline documentation, and MIT licensing remain separately claimed. | `@claim:remote-formats`, `@claim:config-safety`, `@claim:json-output`, `@claim:site-private`, `@claim:offline-docs`, `@claim:free-license`. |

## Copy findings retained and rechecked

| Finding | Change retained | Evidence |
| --- | --- | --- |
| C1 | The wordmark is separate from the job heading. | static plain-wording test; live `/`. |
| C2 | Navigation uses contextual account-rule wording. | copy audit; live screenshots. |
| C3 | The sample demo is primary and installation names its result. | static plain-wording test; live `?demo=1`. |
| C4 | Account and matching-rule words replaced identity and policy jargon. | copy audit; live screenshots. |
| C5 | The plain job headline remains in place. | static plain-wording test; live `/`. |
| C6 | The audience sentence remains explicit. | static plain-wording test; live `/`. |
| C7 | “Active GitHub account” remains the consistent term. | copy audit; `@claim:command-isolation`. |
| C8 | Outcome labels replace abstract labels. | copy audit; live screenshots. |
| C9 | Numbered headings remain task-specific. | copy audit; live screenshots. |
| C10 | Rules and signed-in accounts replace credential-store metaphors. | copy audit; live `/`. |
| C11 | Token handoff is concrete and tested. | `@claim:command-isolation`; live `/`. |
| C12 | Match fields and JSON use labels and examples. | `@claim:matching-rules`, `@claim:json-output`; live `/`. |
| C13 | The run step names the account result. | copy audit; live `/`. |
| C14 | The inspection section names the account decision. | copy audit; live `/`. |
| C15 | The sample control names the repository match. | copy audit; live `/`. |
| C16 | Account, command, and script terminology remains stable. | terminology table; live screenshots. |
| C17 | Copy controls name the command they copy. | browser keyboard/copy test; live `/`. |
| C18 | Safety content names what remains unchanged. | copy audit; live `/`. |
| C19 | Token copy says tokens are not saved. | `@claim:token-confidentiality`; live `/`. |
| C20 | No-match copy states the stop result. | `@claim:exit-codes`; clean claims. |
| C21 | The footer says one account per repository. | skeleton test; live screenshots. |
| C22 | Exit guidance is short, split, and observable. | `@claim:exit-codes`; clean claims. |
| C23 | README directly explains token and account handling. | copy audit; clean-clone check. |
| C24 | Offline notice says what remains available. | `@claim:offline-docs`; live browser check. |
| C25 | Update notice says to refresh. | service-worker static test; live worker check. |

## Review 2 findings retained and rechecked

| Finding | Change retained | Evidence |
| --- | --- | --- |
| F-2-1 | Privacy distinguishes personal demo storage from the public documentation cache; cache membership is inspected for exact same-origin precache content. | `@claim:browser-demo`; live `/privacy/`; `verify.json`. |
| F-2-2 | The untestable affiliation assertion remains absent from README and Terms, guarded by the copy regression scan. | copy audit/static tests; live `/terms/`. |

**Unresolved findings:** none.

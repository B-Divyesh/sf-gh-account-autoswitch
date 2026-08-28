# Adversarial first-read review 3

**Product:** gh-account-autoswitch
**Reviewed:** 2026-08-28
**Candidate:** `8eb7dd887df7898ff32304377f049c357ece7d7a`
**Live URL:** <https://gh-account-autoswitch.sociobot.in/>
**Contexts:** fresh Chromium contexts at 390 × 844 and 1440 × 900; clean clone; isolated Go 1.22.12 toolchain.

## Verdict: FAIL

One blocking finding, one major finding, and seven minor unlisted-claim findings remain. The landing page is clear, the CLI works, the sandbox is isolated, and every declared claim test passes. The mobile demo nevertheless makes the visitor scroll before seeing even one repository-to-account result. Several narrow footer/header links also miss the repository's 44 px touch-target contract. Finally, seven development/deployment assertions in the README are not represented in `.factory/claims.json`.

## Findings

### F-3-1 — BLOCKING — The mobile demo's first screen contains no realistic sample result

- **Quote/location:** the landing action says **“Try it with sample data”** and promises **“Shows three repository-to-account matches; nothing is saved.”** After one click at 390 × 844, `/demo/` shows the banner, title, explanation, recording title, command, and **“Demo — bundled sample data; no token is requested and nothing is saved.”** The first actual result, `github.com/acme-corp/payments → dev@acme.example`, starts at CSS pixel **y=886**, below the 844 px viewport.
- **Why:** the required first screen after clicking does not show the product being used with realistic sample data. A phone visitor sees a recording shell but no repository, selected account, rule, or result. This is a partial fix of **review-1 finding 2**, which required the demo's first screen to show the value.
- **Concrete fix:** compact the mobile demo intro/stage so at least one complete repository → account → rule row is visible without scrolling. Keep the persistent banner and controls. Add a 390 × 844 browser assertion that the first sample row's bottom edge is within the viewport immediately after clicking the landing CTA.

### F-3-2 — MAJOR — Three repeated mobile links are narrower than the required 44 px touch target

- **Quote/location:** at 390 px, header/footer **“Demo”** links measure 42 × 44 px and footer **“Terms”** measures 41 × 44 px on `/`, `/demo/`, `/privacy/`, `/terms/`, and the designed 404. In `site/src/style.css`, `.nav-links a` and `.footer-grid nav a` set only `min-height: 44px`.
- **Why:** the attached accessibility contract requires every target to be at least 44 px. These common navigation targets are undersized on every route.
- **Concrete fix:** add at least 44 px of inline hit area, for example `min-inline-size: 44px; justify-content: center`, without reducing spacing. Add a mobile test that checks both computed width and height for every visible link, button, input, and select.

### F-3-3 — MINOR — The Node.js prerequisite is an unlisted claim

- **Quote/location:** `README.md`, Development: **“Install Node.js 20+ and Go 1.22+ before running the full suite.”**
- **Why:** `toolchain-prerequisites` lists and tests Go and GitHub CLI account guidance, not Node.js 20+. This is a separate version promise a contributor can rely on.
- **Concrete fix:** extend the manifest claim and its one tagged test to assert Node.js 20+ as well as Go 1.22+, or remove the Node version assertion.

### F-3-4 — MINOR — The missing-Go diagnostic is an unlisted claim

- **Quote/location:** `README.md`, Development: **“A missing Go toolchain produces an actionable error.”**
- **Why:** the declared toolchain test runs with Go available; it does not hide `go` and assert the promised diagnostic.
- **Concrete fix:** add the behavior to the toolchain claim and run `npm test` or the preflight with a PATH that cannot find Go, asserting the exact next-step message. Otherwise remove this sentence.

### F-3-5 — MINOR — The aggregate test coverage list is an unlisted claim

- **Quote/location:** `README.md`, Development: **“`npm test` runs Go, static, claim, browser, accessibility, privacy, and offline checks.”**
- **Why:** this precise coverage assertion has no `.factory/claims.json` entry, even though the review observed it to be true today.
- **Concrete fix:** add a manifest claim with a non-recursive test that validates the aggregate script graph and required suites, or shorten the copy to the imperative **“Run `npm test`.”**

### F-3-6 — MINOR — The build-output statement is an unlisted claim

- **Quote/location:** `README.md`, Development: **“`npm run build` writes the CLI and static site to `dist/`.”**
- **Why:** no manifest entry asserts the promised artifacts after a clean build.
- **Concrete fix:** add a build-artifacts claim/test that removes prior output, runs the build, and asserts the CLI plus `dist/site/`; or remove the output promise.

### F-3-7 — MINOR — The release-package statement is an unlisted claim

- **Quote/location:** `README.md`, Development: **“`npm run package` creates release archives in `dist/release/`.”**
- **Why:** no manifest claim checks the archive set or contents. The command produced five archives during this review, but that evidence is not tied to a declared claim.
- **Concrete fix:** add a packaging claim whose test asserts the supported archive names and required executable, README, and license contents; or remove the assertion.

### F-3-8 — MINOR — The site-only build destination is an unlisted claim

- **Quote/location:** `README.md`, Deployment: **“The static documentation site builds with `npm run build:site` into `dist/site/`.”**
- **Why:** this is a concrete, testable output promise without a claims entry.
- **Concrete fix:** include it in the build-artifacts claim/test proposed for F-3-6, or rewrite the section as a command-only deployment recipe.

### F-3-9 — MINOR — The deployment ownership sentence is unlisted and not sandbox-verifiable

- **Quote/location:** `README.md`, Deployment: **“The factory deploys that directory.”**
- **Why:** this asserts an external operational process that the product sandbox cannot prove and `.factory/claims.json` does not list.
- **Concrete fix:** remove it from public product documentation. Keep deployment ownership in `.factory/handoff.md`, where it is operational context rather than a product claim.

## Cold first screen

Before scrolling, in my own words:

- **What it does:** chooses which signed-in GitHub account a `gh` command uses based on the repository.
- **For whom:** developers who keep work and personal GitHub accounts on one machine.
- **First click:** **“Try it with sample data.”** The adjacent note says it will show three repository-to-account matches and save nothing.

This passes at both 390 × 844 and 1440 × 900. The headline is eight words, the audience sentence is 16 words, both actions and all three facts are visible on mobile, and the cold loads produced no console errors or third-party requests.

## Copy audit

Counts use whitespace-delimited visible words after Markdown/HTML formatting is removed; an inline code phrase contributes its visible words. Commands, code blocks, configuration, addresses, table cells, and product/UI labels are audited separately because they are not sentences.

### Landing-page sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| You are offline. | 3 | Pass |
| Installation instructions are still available. | 5 | Pass |
| For developers with work and personal GitHub accounts, it picks one account for each `gh` command. | 16 | Pass |
| Shows three repository-to-account matches; nothing is saved. | 7 | Pass |
| The token goes only to that command. | 7 | Pass |
| Use its host, owner, remote, or folder. | 8 | Pass |
| Your active GitHub account stays unchanged. | 6 | Pass |
| The command uses your rules and accounts already signed in to the GitHub CLI. | 14 | Pass |
| Check its `origin` remote and current folder. | 7 | Pass |
| Each field in a rule must match. | 7 | Pass |
| Rules are checked from top to bottom. | 7 | Pass |
| The selected token goes only to the GitHub command you started. | 11 | Pass |
| `which` shows the matching input and rule. | 7 | Pass |
| It does not ask the GitHub CLI for a token. | 10 | Pass |
| The first complete match wins. | 5 | Pass |
| Match one GitHub or GitHub Enterprise Server host. | 8 | Pass |
| Match an organization or user name pattern. | 7 | Pass |
| Match the complete host, owner, and repository path. | 8 | Pass |
| Match a local folder pattern. | 5 | Pass |
| Source installation requires Go 1.22 or newer and an authenticated GitHub CLI. | 12 | Pass |
| It never runs `gh auth switch`. | 6 | Pass |
| A selected token is not printed, logged, or added to the rules file. | 13 | Pass |
| If no rule matches, it exits with code 3 and does not run `gh`. | 14 | Pass |
| Choose one GitHub account for each repository. | 7 | Pass |
| Command copied to clipboard. | 4 | Pass |
| Copy was blocked. | 3 | Pass |
| Select the command text and copy it manually. | 8 | Pass |
| An update is ready. | 4 | Pass |
| Refresh to use it. | 4 | Pass |

No landing sentence exceeds 22 words or contains a banned marketing adjective. `origin`, `gh`, token, and GitHub Enterprise Server are necessary CLI/Git terms and are used with concrete actions.

### Landing headings, controls, and short facts

| Copy | Words | Result |
| --- | ---: | --- |
| Account matching for the GitHub CLI | 6 | Contextual heading |
| Choose the right GitHub account per repository | 8 | Job headline |
| Try it with sample data | 5 | Result-naming action |
| Install the command | 3 | Result-naming action |
| Free under MIT | 3 | Plain tested fact |
| No site analytics | 3 | Plain tested fact |
| Offline after one visit | 4 | Plain tested fact |
| Uses one account for one command | 6 | Contextual heading |
| Matches the repository | 3 | Contextual heading |
| Works beside other commands | 4 | Contextual heading |
| How account rules work | 4 | Contextual heading |
| Choose an account before `gh` runs | 6 | Contextual heading |
| Read the repository | 3 | Verb heading |
| Find the first complete match | 5 | Verb heading |
| Run the command with that account | 6 | Verb heading |
| Check a match before running | 5 | Contextual heading |
| See which account a repository will use | 8 | Contextual heading |
| See a sample repository match | 5 | Result-naming label |
| Ways to match a repository | 5 | Contextual heading |
| Write small rules for each account | 7 | Verb heading |
| Install and create rules | 4 | Contextual heading |
| Add the command, then review your rules | 8 | Verb heading |
| Read the complete CLI reference | 5 | Result-naming link |
| Copy install command | 3 | Result-naming button |
| Copy create-rules command | 3 | Result-naming button |
| What the command does not change | 6 | Contextual heading |
| Keep other GitHub commands untouched | 6 | Contextual heading |
| Keeps the active account | 4 | Contextual heading |
| Does not save tokens | 4 | Contextual heading |
| Stops without a match | 5 | Contextual heading |
| Run the bundled sample | 4 | Contextual heading |
| Check three account matches first | 6 | Contextual heading |

No label is jargon-first, and every action names its result. The site consistently uses **account**, **rule**, **folder**, **remote**, **token**, and **demo** for its core concepts.

### README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Choose the right GitHub account for each repository before a `gh` command runs. | 13 | Pass |
| This command is for developers who use work, personal, or client GitHub accounts on one machine. | 16 | Pass |
| It does not change the active account used by other commands. | 11 | Pass |
| The demo matches three sample repositories and shows one unmatched repository. | 11 | Pass |
| It does not read your rules or request a token. | 10 | Pass |
| The command creates a temporary workspace and removes it before exit. | 11 | Pass |
| The shipped inputs are in `examples/demo`. | 6 | Pass |
| Open the one-click recording at <https://gh-account-autoswitch.sociobot.in/?demo=1>. | 6 | Pass |
| Source installation requires Go 1.22 or newer. | 7 | Pass |
| Normal use also requires an authenticated GitHub CLI. | 8 | Pass |
| Keep the installed `gh` command. | 5 | Pass |
| Add this function to your shell configuration. | 7 | Pass |
| Open a new shell after saving the function. | 8 | Pass |
| Generate starter rules from the accounts reported by the GitHub CLI. | 11 | Pass |
| Review `~/.config/gh-accounts.toml` before running commands. | 5 | Pass |
| Each rule can match a host, owner, complete remote, local folder, or a combination. | 14 | Pass |
| Every present field must match. | 5 | Pass |
| Rules are checked from top to bottom. | 7 | Pass |
| The first complete match wins. | 5 | Pass |
| GitHub.com and GitHub Enterprise Server remotes work in SSH, `ssh://`, and HTTPS forms. | 13 | Pass |
| See the selected account without requesting a token. | 8 | Pass |
| Run the GitHub command with that account. | 7 | Pass |
| Add `--json` to `which`, `init`, `demo`, or `run` for machine-readable output. | 11 | Pass |
| Use explicit paths in scripts when needed. | 7 | Pass |
| `which` never requests a token. | 5 | Pass |
| `run` requests the selected account’s token from the installed GitHub CLI. | 11 | Pass |
| The selected token exists only in the child command environment. | 10 | Pass |
| It is not printed, logged, or saved in the rules file. | 11 | Pass |
| The command never runs `gh auth switch`. | 7 | Pass |
| An unmatched repository exits with code 3 and does not run `gh`. | 12 | Pass |
| Usage or configuration errors exit 2. | 6 | Pass |
| A missing selected token exits 4. | 6 | Pass |
| Other command failures preserve the GitHub CLI exit code. | 9 | Pass |
| The parser rejects unknown rule keys. | 6 | Pass |
| Do not put tokens in `gh-accounts.toml`. | 6 | Pass |
| Install Node.js 20+ and Go 1.22+ before running the full suite. | 11 | **F-3-3** |
| `npm test` runs Go, static, claim, browser, accessibility, privacy, and offline checks. | 12 | **F-3-5** |
| A missing Go toolchain produces an actionable error. | 8 | **F-3-4** |
| `npm run build` writes the CLI and static site to `dist/`. | 11 | **F-3-6** |
| `npm run package` creates release archives in `dist/release/`. | 8 | **F-3-7** |
| Run `npm run dev` for the local documentation site. | 9 | Instruction |
| The static documentation site builds with `npm run build:site` into `dist/site/`. | 11 | **F-3-8** |
| The factory deploys that directory. | 5 | **F-3-9** |
| The site has no analytics or third-party runtime scripts. | 9 | Pass |
| A service worker keeps public documentation available after the first visit. | 11 | Pass |
| The project uses the MIT License. | 6 | Pass |
| See `CHANGELOG.md` for release notes. | 5 | Instruction |

No README sentence exceeds 22 words, contains a banned adjective, or changes the established core terminology. README headings are understandable out of context. The seven flags above concern claim registration, not wording length.

## Demo and sandbox behavior

- The landing CTA reaches `/demo/` in one click and `/?demo=1` redirects there.
- The persistent banner says **“Demo — sample data, nothing is saved”** and exposes **Reset demo** and **Start for real**.
- Reset restores the original recording, announces **“Reset restored the starting sample.”**, and focuses the demo `<h1>`.
- The four recorded results are realistic: Acme work, personal, client GHES, and an unmatched repository with exit 3.
- A seeded `real:sentinel` in localStorage and sessionStorage and a seeded `real-sentinel` IndexedDB database were unchanged after entry, replay, and reset.
- The only Cache Storage entry was the versioned documentation cache, and every cached request was a declared same-origin public file. The seeded personal storage values remained untouched.
- After an online visit, an intercepted offline reload of `/demo/` returned 200 with the banner and all five table rows.
- From a fresh temporary current directory, the built CLI's `demo --json` selected the three stated accounts, returned one exit-3 result, reported `saved:false`, `token_requested:false`, and `workspace_removed:true`, and left the caller directory empty.
- F-3-1 remains because those realistic rows are not visible in the initial mobile viewport.

## Claims audit

Every listed command was run independently in the clean clone, not only through the aggregate suite.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `demo-selection` | PASS | Three exact account matches plus the shipped unmatched fixture. |
| `browser-demo` | PASS | Query entry, banner, five rows in the DOM, replay, reset, empty origin-data stores, declared public cache. |
| `demo-isolation` | PASS | Hostile home/config/token sentinels unchanged; temporary workspace removed. |
| `which-safe` | PASS | Correct selection with no token request. |
| `command-isolation` | PASS | Concurrent child-specific tokens; active-account sentinel unchanged; no `gh auth switch`. |
| `token-confidentiality` | PASS | Canary absent from output and files. |
| `matching-rules` | PASS | Host, owner, remote, folder, all-fields, and first complete rule verified. |
| `remote-formats` | PASS | SCP-style SSH, `ssh://`, and HTTPS across GitHub.com/GHES verified. |
| `exit-codes` | PASS | Usage 2, no match 3, missing token 4, child 17 preserved. |
| `config-safety` | PASS | Unknown key stops before GitHub CLI invocation. |
| `starter-rules` | PASS | GitHub CLI accounts produce mode-0600 starter rules. |
| `toolchain-prerequisites` | PASS | Go 1.22+ and no-account guidance verified; F-3-3/F-3-4 identify narrower copy outside the claim. |
| `json-output` | PASS | `which`, `init`, `demo`, and `run` JSON parsed. |
| `site-private` | PASS | Full demo flow made only same-origin requests and stored no origin data. |
| `offline-docs` | PASS | Home, demo, Privacy, and Terms reloaded offline after first visit. |
| `free-license` | PASS | MIT license and live statements matched. |

No declared claim test failed. The landing, demo, Privacy, Terms, and metadata claims map to these entries. F-3-3 through F-3-9 are the remaining README claims without manifest entries.

## Earlier findings rechecked on live and in code

The live root, demo, Privacy, Terms, 404, service worker, robots, and sitemap files are byte-for-byte equal to the clean candidate build. The table therefore records both deployed and source confirmation.

### Review 1 findings

| Earlier ID | Result now | Live and code confirmation |
| --- | --- | --- |
| 1 | Fixed | Eight-word job headline and explicit work/personal audience sentence are above the fold and in `site/index.html`. |
| 2 | **Partly fixed; BLOCKING again as F-3-1** | CTA, route, banner, reset, controls, and recording exist, but no sample match is visible in the first 390 × 844 demo screen. |
| 3 | Fixed | Sixteen unique manifest entries and sixteen matching tags exist; all commands pass. |
| 4 | Fixed | `/demo/` and product 404 deep links work with local branded assets and correct statuses. |
| 5 | Fixed | Built CLI demo runs its matcher in a removed temporary workspace without tokens or real configuration. |
| 6 | Fixed | All routes have complete metadata/chrome; live focus moves to headings and Back/Forward restore it. |
| 7 | Fixed | Account/rule/folder/token language is consistent; the former jargon is absent. |
| 8 | Fixed | Go prerequisite and preflight remain documented; clean suite passes with Go 1.22.12. |

| Earlier ID | Result now | Live and code confirmation |
| --- | --- | --- |
| U1 | Fixed | Canary-token confidentiality test passes. |
| U2 | Fixed | Concurrent no-switch/state-isolation test passes. |
| U3 | Fixed | Three bundled repositories resolve to their stated accounts. |
| U4 | Fixed | Fake GitHub CLI log proves per-command token retrieval and child-only exposure. |
| U5 | Fixed | Rule fields and file-order precedence are fixture-tested. |
| U6 | Fixed | `which` remains token-free in plain and JSON behavior. |
| U7 | Fixed | Exit 2/3/4 and child-code preservation are observed. |
| U8 | Fixed | Go/auth guidance and starter-rule generation are tested. |
| U9 | Fixed for the original claims | Remote formats, config rejection, JSON, runtime privacy, offline docs, and MIT tests pass. New README workflow gaps are F-3-3–F-3-9. |

| Earlier ID | Result now | Live and code confirmation |
| --- | --- | --- |
| C1 | Fixed | Wordmark is separate from the job `<h1>`. |
| C2 | Fixed | Navigation uses contextual labels. |
| C3 | Fixed | Demo is primary and installation names its action. |
| C4 | Fixed | Account/rule wording replaced identity/policy wording. |
| C5 | Fixed | Plain job headline remains. |
| C6 | Fixed | Audience sentence remains explicit. |
| C7 | Fixed | “Active GitHub account” is used consistently. |
| C8 | Fixed | Outcome labels replaced abstract labels. |
| C9 | Fixed | Numbered headings are task-specific. |
| C10 | Fixed | Rules and signed-in accounts replaced credential-store metaphors. |
| C11 | Fixed | Token handoff is concrete and tested. |
| C12 | Fixed | Match fields and JSON are explained with labeled examples. |
| C13 | Fixed | Run step names the account result. |
| C14 | Fixed | Inspection heading names the account decision. |
| C15 | Fixed | Sample control names the repository match. |
| C16 | Fixed | Account, command, and script terms remain stable. |
| C17 | Fixed | Copy controls name the copied command. |
| C18 | Fixed | Safety section names what stays unchanged. |
| C19 | Fixed | Token copy says it is not saved. |
| C20 | Fixed | No-match copy states the stop result. |
| C21 | Fixed | Footer says one account per repository. |
| C22 | Fixed | Exit guidance is split, plain, and tested. |
| C23 | Fixed | README heading directly names tokens and accounts. |
| C24 | Fixed | Offline notice states what remains available. |
| C25 | Fixed | Update notice says to refresh. |

### Review 2 findings

| Earlier ID | Result now | Live and code confirmation |
| --- | --- | --- |
| F-2-1 | Fixed | Privacy accurately separates personal data from the public documentation cache; storage/cache tests pass. |
| F-2-2 | Fixed | The untestable affiliation sentence is absent from README and Terms; the regression scan passes. |

`polish-1.md`, `polish-2.md`, `verification.md`, `verification-2.md`, and the prior handoff were also read. They introduce no additional unresolved finding IDs beyond those above.

## Structure, links, accessibility, and identity

- `/`, `/demo/`, `/privacy/`, and `/terms/` return 200; `/no-such-page` returns the designed product 404. Slashless legal/demo deep links also return the intended page.
- Titles follow the product/action pattern and are under 60 characters. Every route has one `<h1>`, one `<main>`, `lang=en`, a description, canonical, complete OG/Twitter metadata, local SVG favicon, 180 × 180 touch icon, and the local 1200 × 630 social image.
- Heading levels do not skip. Header, footer, skip link, Privacy, Terms, attribution, and version are consistent.
- Live Privacy navigation focuses its `<h1>`; Back and Forward focus the restored route heading.
- Every crawled internal and external link returned 200, including source and issue-tracker links. `robots.txt` and `sitemap.xml` list the public routes.
- `verify-url.sh` passed with no console errors. The repository's Playwright Axe integration found zero serious/critical issues on all routes at both sizes. Keyboard focus and reduced motion passed. F-3-2 is a stricter 44 × 44 target-size failure not reported by Axe.
- The initial JS is 4.59 kB uncompressed. The mobile and desktop hero images are 33.71 kB and 83.05 kB.
- Live CSP, framing denial, permissions policy, HSTS, referrer policy, `nosniff`, and immutable hashed-asset caching are present.
- The dark mineral ground, cyan/lime routing rails, glass rule prism, terminal traces, geometric mark, and non-looping motion implement the recorded visual thesis. This is product-specific rather than a generic SaaS template.

## Missed leverage

No missing AI, import/export, or sync feature is justified by the brief. Rule selection must be deterministic and auditable; an AI step would weaken that property. `init` imports the useful local state from authenticated GitHub CLI accounts, `which` previews a decision, `run` performs it, and `demo` supplies the no-credential sample. No provider keys or decorative AI feature are present.

## Verification record

- All 16 commands from `.factory/claims.json`: PASS individually in a fresh clone.
- `npm test`: PASS — Go tests, 10 static tests, 16 claim tests, and 7 browser tests.
- `npm run build`: PASS; `dist/bin` and `dist/site` produced.
- `npm run package`: produced Linux amd64/arm64, macOS amd64/arm64, and Windows amd64 archives.
- Published `go install github.com/B-Divyesh/sf-gh-account-autoswitch/cmd/gh-account-autoswitch@latest`: PASS; installed version reports `0.1.0`.
- Live verification: 11 route/demo checks passed; zero serious/critical Axe findings and zero product console errors.
- Offline/network interception: PASS; offline demo returns 200 and all observed requests are same-origin.
- Candidate/live parity: root, demo, Privacy, Terms, 404, service worker, robots, and sitemap SHA-256 hashes match.

## What would make this perfect

Show at least one complete repository/account/rule result inside the initial 390 × 844 demo viewport, enlarge every mobile link target to at least 44 × 44 px, and resolve each unlisted README claim by adding an exact sandbox test or removing the assertion. Re-run the cold mobile demo, target-size scan, individual claim commands, aggregate suite, and live parity check. Nothing else observed needs changing.

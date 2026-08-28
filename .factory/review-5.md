# Adversarial first-read review 5

**Product:** gh-account-autoswitch

**Reviewed:** 2026-08-28 UTC

**Candidate/live revision:** `90efdbfef1312a51ace8d0233e68d48fc27248ad`

**Live URL:** <https://gh-account-autoswitch.sociobot.in/>

**Contexts:** fresh Chromium contexts at 390 × 844 and 1440 × 900; fresh local clone; isolated Go 1.22.12 toolchain.

## Verdict: PASS

Zero findings remain. The first screen is clear at both widths, the browser and CLI demos are immediately useful and isolated, all 19 listed claim commands pass independently from a clean clone, no unlisted claim was found, every earlier finding remains fixed in the deployed site and current code, and the route/accessibility/link checks pass.

## Cold first screen

No scrolling or prior context was used.

| Question | First-read answer | Exact on-screen evidence |
| --- | --- | --- |
| What does it do? | It chooses the signed-in GitHub account that `gh` should use for each repository. | “Choose the right GitHub account per repository” |
| For whom? | Developers who keep work and personal GitHub accounts on one machine. | “For developers with work and personal GitHub accounts, it picks one account for each `gh` command.” |
| What should I click first? | **Try it with sample data.** | The primary action says “Try it with sample data”; the adjacent result says “Shows three repository-to-account matches; nothing is saved.” |

At 390 px, the headline, audience sentence, both actions, outcome sentence, and all three facts end at CSS pixel 754.27 within the 844 px viewport. At 1440 px they end at pixel 872.11 within the 900 px viewport. Both cold loads returned 200, stayed at scroll position 0, used only same-origin resources, and emitted no console or page errors.

## Findings

None.

## Copy audit

Counts below use whitespace-delimited visible words after markup is removed; an inline code term or URL counts as one word. Executable code, TOML fields, terminal output, and addresses are not prose sentences. No sentence exceeds 22 words. No banned marketing adjective, inconsistent core term, contextless heading, or non-result-naming action was found.

### Landing page sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| You are offline. | 3 | Pass |
| Installation instructions are still available. | 5 | Pass |
| For developers with work and personal GitHub accounts, it picks one account for each `gh` command. | 16 | Pass |
| Shows three repository-to-account matches; nothing is saved. | 7 | Pass |
| The token goes only to that command. | 7 | Pass |
| Use its host, owner, remote, or folder. | 7 | Pass |
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
| Two separate account routes pass through a matching rule and reach one repository. | 13 | Pass |
| Command copied to clipboard. | 4 | Pass |
| Copy was blocked. | 3 | Pass |
| Select the command text and copy it manually. | 8 | Pass |
| An update is ready. | 4 | Pass |
| Refresh to use it. | 4 | Pass |

### Landing headings, labels, and actions

| Copy | Words | Result |
| --- | ---: | --- |
| Account matching for the GitHub CLI | 6 | Contextual heading |
| Choose the right GitHub account per repository | 8 | Plain job headline |
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
| Write small rules for each account | 6 | Verb heading |
| Install and create rules | 4 | Contextual heading |
| Add the command, then review your rules | 7 | Verb heading |
| What the command does not change | 6 | Contextual heading |
| Keep other GitHub commands untouched | 5 | Contextual heading |
| Keeps the active account | 4 | Contextual heading |
| Does not save tokens | 4 | Contextual heading |
| Stops without a match | 4 | Contextual heading |
| Run the bundled sample | 4 | Contextual heading |
| Check three account matches first | 5 | Contextual heading |
| Try it with sample data | 5 | Result-naming action |
| Install the command | 3 | Result-naming action |
| Read the complete CLI reference | 5 | Result-naming link |
| Copy install command | 3 | Result-naming button |
| Copy create-rules command | 3 | Result-naming button |
| Refresh | 1 | Verb action; adjacent copy names the result |

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
| Open the one-click recording at `https://gh-account-autoswitch.sociobot.in/?demo=1`. | 6 | Pass |
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
| Install Node.js 20+ and Go 1.22+ before running the full suite. | 11 | Pass |
| `npm test` runs Go, static, claim, browser, accessibility, privacy, and offline checks. | 12 | Pass |
| A missing Go toolchain produces an actionable error. | 8 | Pass |
| `npm run build` writes the CLI and static site to `dist/`. | 11 | Pass |
| `npm run package` creates release archives in `dist/release/`. | 8 | Pass |
| Run `npm run dev` for the local documentation site. | 9 | Pass |
| The static documentation site builds with `npm run build:site` into `dist/site/`. | 11 | Pass |
| The site has no analytics or third-party runtime scripts. | 9 | Pass |
| A service worker keeps public documentation available after the first visit. | 11 | Pass |
| The project uses the MIT License. | 6 | Pass |
| See `CHANGELOG.md` for release notes. | 5 | Pass |

README headings—“gh-account-autoswitch,” “Try the bundled sample,” “Install,” “Create account rules,” “Check and run,” “How tokens and accounts are handled,” “Development,” “Deployment,” and “License and status”—make sense in the document outline. No README button is present. The established terms remain **account**, **rule**, **folder**, **remote**, **token**, **active GitHub account**, and **demo**.

## Demo and sandbox behavior

- One click on the first-screen action reaches `/demo/`; `/?demo=1` also enters it directly.
- The persistent banner says **“Demo — sample data, nothing is saved”** and contains **Reset demo** and **Start for real**.
- At 390 × 844, the first complete result is already visible: `github.com/acme-corp/payments` → `dev@acme.example` → `Acme work`. Its bottom edge is 513.17 px.
- Replay changes the control state. Reset restores the recording, announces “Reset restored the starting sample.”, and focuses the demo `<h1>`.
- Seeded `localStorage`, `sessionStorage`, and IndexedDB sentinels remained unchanged. The only browser persistence was the documented versioned cache of declared, query-free public files.
- Landing, demo, replay, reset, and offline reload made requests only to `https://gh-account-autoswitch.sociobot.in`. The offline demo reload returned 200 with its banner and sample.
- From an unrelated temporary working directory with hostile home/config/token variables and an unusable `gh` path, the built `demo --json` returned three exact matches and one exit-3 no-match. It reported `saved:false`, `token_requested:false`, and `workspace_removed:true`; its reported workspace did not exist afterward and the outer directory contained no files.

## Claims audit

Every exact `test` command in `.factory/claims.json` was run separately from a fresh clone of `90efdbf` with Node.js 22.23.2, Playwright 1.58.2, and isolated Go 1.22.12 module/build caches.

| Claim ID | Result | Claim ID | Result |
| --- | --- | --- | --- |
| `demo-selection` | PASS | `browser-demo` | PASS |
| `demo-isolation` | PASS | `which-safe` | PASS |
| `command-isolation` | PASS | `token-confidentiality` | PASS |
| `matching-rules` | PASS | `remote-formats` | PASS |
| `exit-codes` | PASS | `config-safety` | PASS |
| `starter-rules` | PASS | `toolchain-prerequisites` | PASS |
| `full-suite` | PASS | `build-artifacts` | PASS |
| `release-package` | PASS in 35 seconds from the cold cache | `json-output` | PASS |
| `site-private` | PASS | `offline-docs` | PASS |
| `free-license` | PASS |  |  |

The aggregate `npm test` also passed: 2 Go packages, 10 static checks, 19 claim tests, and 9 browser tests. The build emitted `dist/bin/` and `dist/site/`; initial JS is 4.59 kB uncompressed, CSS is 20.66 kB, and the responsive hero images are 33.71 kB and 83.05 kB.

### Unlisted-claim cross-check

No unlisted claim was found. Landing, metadata, demo, legal, and README claims map as follows:

| Public claim group | Manifest evidence |
| --- | --- |
| Three sample repositories select the shown accounts; the demo requests no token | `demo-selection`, `demo-isolation` |
| Browser demo entry, reset, storage boundary, and public cache | `browser-demo` |
| Repository fields, rule order, and GitHub/GHES remote forms | `matching-rules`, `remote-formats` |
| Token-free inspection, child-only tokens, unchanged active account, and no saved/printed token | `which-safe`, `command-isolation`, `token-confidentiality` |
| Exit codes and invalid-rule rejection | `exit-codes`, `config-safety` |
| Starter rules, Node/Go versions, and missing-tool/auth guidance | `starter-rules`, `toolchain-prerequisites` |
| JSON output and documented test/build/archive outputs | `json-output`, `full-suite`, `build-artifacts`, `release-package` |
| No analytics/third-party runtime requests, offline docs, and MIT status | `site-private`, `offline-docs`, `free-license` |

## Earlier findings rechecked live and in code

Every earlier review, polish report, verification report, and prior handoff was read. “Fixed” below means the deployed behavior was re-exercised and its current implementation/test was inspected.

| Earlier ID | Result | Current confirmation |
| --- | --- | --- |
| Review 1 / 1 | Fixed | Job headline, audience, and first action are above the fold at both widths. |
| Review 1 / 2 | Fixed | One-click browser demo, banner, reset, Start for real, recording, and samples work. |
| Review 1 / 3 | Fixed | Nineteen unique listed claim commands pass independently. |
| Review 1 / 4 | Fixed | Demo/legal deep links work; unknown paths use the designed 404. |
| Review 1 / 5 | Fixed | CLI demo runs the bundled matcher in a removed temporary workspace. |
| Review 1 / 6 | Fixed | Route metadata, shared chrome, legal links, focus, and history pass. |
| Review 1 / 7 | Fixed | Account/rule/folder/remote/token terms remain consistent; old jargon is absent. |
| Review 1 / 8 | Fixed | Go prerequisite and actionable missing-Go diagnostic pass in the clean clone. |
| Review 1 / U1 | Fixed | Canary-token test finds no token in output, rules, or files. |
| Review 1 / U2 | Fixed | Concurrent commands preserve the active-account sentinel and never call `gh auth switch`. |
| Review 1 / U3 | Fixed | Three bundled repositories resolve to their stated accounts. |
| Review 1 / U4 | Fixed | Fake `gh` proves one account-specific token request and child-only exposure. |
| Review 1 / U5 | Fixed | Host, owner, remote, folder, combined fields, and first-match order pass. |
| Review 1 / U6 | Fixed | Plain and JSON `which` remain token-free. |
| Review 1 / U7 | Fixed | Usage, no-match, missing-token, and child exit codes are observed. |
| Review 1 / U8 | Fixed | Toolchain/auth guidance and private starter-rule generation pass. |
| Review 1 / U9 | Fixed | Remaining remote/config/JSON/workflow/privacy/offline/license behavior is listed and tested. |
| Review 1 / C1 | Fixed | Product wordmark remains separate from the job `<h1>`. |
| Review 1 / C2 | Fixed | Navigation uses contextual account-rule wording. |
| Review 1 / C3 | Fixed | Sample demo is primary; installation names its result. |
| Review 1 / C4 | Fixed | Account and matching-rule language replaces identity/policy jargon. |
| Review 1 / C5 | Fixed | The eight-word job headline remains. |
| Review 1 / C6 | Fixed | The audience sentence explicitly names work/personal-account developers. |
| Review 1 / C7 | Fixed | “Active GitHub account” is the stable term. |
| Review 1 / C8 | Fixed | Concrete outcome labels replace abstract labels. |
| Review 1 / C9 | Fixed | Numbered section labels are task-specific. |
| Review 1 / C10 | Fixed | Rules and signed-in accounts replace policy/credential-store metaphors. |
| Review 1 / C11 | Fixed | Token handoff is concrete and tested. |
| Review 1 / C12 | Fixed | Fields and JSON are explained with labels and examples. |
| Review 1 / C13 | Fixed | Run step names the selected-account result. |
| Review 1 / C14 | Fixed | Inspection heading names which account the repository will use. |
| Review 1 / C15 | Fixed | Sample control names the repository match. |
| Review 1 / C16 | Fixed | Account, command, and script terms remain stable. |
| Review 1 / C17 | Fixed | Copy controls name the command copied. |
| Review 1 / C18 | Fixed | Safety section states what the command does not change. |
| Review 1 / C19 | Fixed | Token copy says tokens are not saved. |
| Review 1 / C20 | Fixed | No-match copy states that the command stops. |
| Review 1 / C21 | Fixed | Footer states one GitHub account per repository. |
| Review 1 / C22 | Fixed | Exit guidance is split into short, tested sentences. |
| Review 1 / C23 | Fixed | README directly explains token and account handling. |
| Review 1 / C24 | Fixed | Offline notice says installation instructions remain available. |
| Review 1 / C25 | Fixed | Update notice says to refresh and names the result. |
| F-2-1 | Fixed | Privacy distinguishes personal data from cached public files; sentinels and exact cache membership pass. |
| F-2-2 | Fixed | The untestable affiliation sentence remains absent from README and Terms. |
| F-3-1 | Fixed | Full mobile repository/account/rule result is visible at 513.17 px without scrolling. |
| F-3-2 | Fixed | Every visible mobile control is at least 44 × 44 CSS pixels on all routes. |
| F-3-3 | Fixed | Node.js 20+ is included in `toolchain-prerequisites`. |
| F-3-4 | Fixed | Missing-Go guidance is exercised with a PATH that cannot find Go. |
| F-3-5 | Fixed | Aggregate Go/static/claim/browser/Axe/privacy/offline coverage is manifest-backed. |
| F-3-6 | Fixed | Clean CLI and static-site build outputs are asserted. |
| F-3-7 | Fixed | Five release archives and their executable/README/LICENSE contents are asserted. |
| F-3-8 | Fixed | `build:site` and `dist/site/` remain in build-artifact coverage. |
| F-3-9 | Fixed | Untestable deployment-ownership copy remains absent. |
| F-4-1 | Fixed | `test.setTimeout(180_000)` is present; the exact cold-cache command passed in 35 seconds. |

## Structure, accessibility, links, and identity

- `/`, `/demo/`, `/privacy/`, and `/terms/` return 200; an unknown route returns the product-styled 404 with routes home and to the demo.
- Each route has `lang="en"`, one `<main>`, one `<h1>`, an ordered heading outline, a route-pattern title under 60 characters, a description under 155 characters, canonical URL, complete OG/Twitter metadata, local favicon, local 180 px touch icon, and the product social image.
- Header, footer, skip link, Privacy, Terms, Param Factory credit, and version remain consistent. `robots.txt` and `sitemap.xml` are present and list all public routes.
- Every rendered internal fragment exists. Every normal internal and external destination returned 200. The 404 page’s self-targeting skip link correctly retains the page’s 404 status and reaches `#main`.
- Privacy navigation focuses its destination `<h1>`; Back and Forward restore and focus the corresponding route heading.
- Live verification passed 11 desktop/mobile route checks with zero serious/critical Axe findings, zero product console errors, no horizontal overflow, correct security headers, and 44 px mobile controls. Keyboard focus and reduced-motion checks also pass in the clean suite.
- The dark mineral field, cyan/lime account rails, glass rule prism, terminal traces, and geometric mark match `.factory/design.md`. The visual system is specific to account routing and is not a generic SaaS template.
- Clean production output and live responses match byte-for-byte for home, demo, Privacy, Terms, 404, service worker, robots, and sitemap.

## Missed leverage

No missing AI, import/export, or sync feature is implied. Account selection must remain deterministic and auditable; AI would be decorative here. `init` imports the useful state from locally authenticated GitHub CLI accounts, `which` previews the decision, JSON output supports automation/export, and cloud sync would weaken the local account boundary. No provider key or decorative AI feature is present.

## What would make this perfect

Nothing observed requires a change. The current live release meets the stated “actually nothing left to do” standard for this review.

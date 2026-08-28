# Adversarial first-read review 2

**Product:** gh-account-autoswitch  
**Reviewed:** 2026-08-28  
**URL:** <https://gh-account-autoswitch.sociobot.in/>  
**Contexts:** fresh Chromium at 390 × 844 and 1440 × 900; fresh Git clone at `463649844c3e39d0453c30e7c43c50c78f72040f`.

## Verdict: FAIL

Two findings remain. The product is clear and tryable, but its Privacy page makes a false browser-storage statement and the README makes an unlisted affiliation claim. `PASS` requires zero findings.

## Cold first screen

Before scrolling, at both sizes, I understood: it selects the signed-in GitHub account that `gh` should use for the current repository; it is for developers using work and personal GitHub accounts; I should click **“Try it with sample data.”** The outcome is adjacent: **“Shows three repository-to-account matches; nothing is saved.”** This passes the first-read test. Fresh mobile and desktop loads made only same-origin document, local CSS/JS, and local hero-image requests, with no page or console errors.

## Findings

### F-2-1 — BLOCKING — The Privacy page falsely says the browser demo uses no browser storage

- **Quote/location:** `/privacy/`, “**The browser demo uses fixed public examples and does not use browser storage.** Reset restores those examples.”
- **Evidence:** A fresh live context opened directly at `/demo/`, awaited `navigator.serviceWorker.ready`, and found Cache Storage named `gh-account-autoswitch-0.1.0-819198d3f27a`. It held `/demo/`, `/demo/index.html`, and public site assets. `localStorage` and `sessionStorage` were empty, but Cache Storage is browser storage.
- **Why:** The privacy statement is broader than the implementation. `@claim:browser-demo` checks only local/session storage, so it cannot prove its own broader browser-storage claim. A visitor receives an inaccurate answer about what the demo writes in the browser.
- **Fix:** Replace it with: “**The browser demo stores no personal account or repository data. The site caches public documentation for offline use. Reset restores the fixed examples.**” Update `browser-demo`, or add a claim, to assert Cache Storage contains only declared public precache paths and no personal/account-specific data; retain local/session/IndexedDB checks.

### F-2-2 — MINOR — README includes an unlisted affiliation claim

- **Quote/location:** `README.md`, License and status: “**It is independent community software and is not affiliated with GitHub.**”
- **Why:** This is a visitor-reliant factual/legal claim, yet `.factory/claims.json` has no entry or observable test. The claims contract requires removing claims that cannot be shown in the sandbox.
- **Fix:** Remove the sentence. Keep the tested “The project uses the MIT License.” If a disclaimer is legally required, handle it in a policy/provenance process rather than claims-based product copy.

## Demo and sandbox verification

- The first-screen action from `/?demo=1` redirected to `/demo/` and immediately showed a real CLI recording: three named repository-to-account matches and one explicit no-match (`exit 3`).
- The persistent banner read **“Demo — sample data, nothing is saved”** with **Reset demo** and **Start for real**. Reset restored the recording, announced “Reset restored the starting sample.”, and focused the demo `<h1>`. Start for real went to `/#install` without the banner.
- The live full demo flow made only same-origin requests. `localStorage` and `sessionStorage` remained empty. F-2-1 is the public-cache wording/test gap.
- From a fresh temporary directory, clean-build `gh-account-autoswitch demo --json` returned three selected accounts, one exit-3 no-match, `"saved":false`, `"token_requested":false`, and `"workspace_removed":true`.
- After one online visit, an offline `/demo/` reload returned 200 and rendered the demo. It relies on the public service-worker cache identified in F-2-1.

## Claims audit

Every manifest command was run separately from a fresh clone, then the full claim suite was run again. Go 1.27 was installed only under `/tmp/gh-review-go.2gUHXe`.

| Claim | Result |
| --- | --- |
| `demo-selection` | PASS |
| `browser-demo` | PASS, but incomplete for Cache Storage (F-2-1) |
| `demo-isolation` | PASS |
| `which-safe` | PASS |
| `command-isolation` | PASS |
| `token-confidentiality` | PASS |
| `matching-rules` | PASS |
| `remote-formats` | PASS |
| `exit-codes` | PASS |
| `config-safety` | PASS |
| `starter-rules` | PASS |
| `toolchain-prerequisites` | PASS |
| `json-output` | PASS |
| `site-private` | PASS |
| `offline-docs` | PASS |
| `free-license` | PASS |

`npm run test:claims` completed **16/16**. `npm test` and `npm run build` completed in that clone. The suite correctly checks every declared tag exactly once. Landing claims map to matching, token/account isolation, exit-code, prerequisite, privacy, offline, and license entries. README claims map to those entries except F-2-2.

## Copy audit

Method: visible natural-language words; command/TOML/path/hostname literals are excluded. No sentence exceeds 22 words. Banned marketing words are absent. Terminology is consistent: **account**, **rule**, **folder**, **remote**, **token**, **demo**. The only flags are F-2-1 and F-2-2.

### Landing page sentences

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

### Landing headings, controls, and short facts

| Copy | Words | Result |
| --- | ---: | --- |
| Account matching for the GitHub CLI | 6 | Contextual heading |
| Choose the right GitHub account per repository | 8 | Job headline |
| Try it with sample data | 5 | Result-naming primary action |
| Install the command | 3 | Result-naming action |
| Free under MIT | 3 | Tested fact |
| No site analytics | 3 | Tested fact |
| Offline after one visit | 4 | Tested fact |
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
| See a sample repository match | 5 | Form label |
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
| Open the one-click recording at `https://gh-account-autoswitch.sociobot.in/?demo=1`. | 7 | Pass |
| Source installation requires Go 1.22 or newer. | 8 | Pass |
| Normal use also requires an authenticated GitHub CLI. | 8 | Pass |
| Keep the installed `gh` command. | 5 | Pass |
| Add this function to your shell configuration. | 8 | Pass |
| Open a new shell after saving the function. | 8 | Pass |
| Generate starter rules from the accounts reported by the GitHub CLI. | 11 | Pass |
| Review `~/.config/gh-accounts.toml` before running commands. | 7 | Pass |
| Each rule can match a host, owner, complete remote, local folder, or a combination. | 14 | Pass |
| Every present field must match. | 5 | Pass |
| Rules are checked from top to bottom. | 7 | Pass |
| The first complete match wins. | 5 | Pass |
| GitHub.com and GitHub Enterprise Server remotes work in SSH, `ssh://`, and HTTPS forms. | 13 | Pass |
| See the selected account without requesting a token. | 8 | Pass |
| Run the GitHub command with that account. | 8 | Pass |
| Add `--json` to `which`, `init`, `demo`, or `run` for machine-readable output. | 12 | Pass |
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
| Install Node.js 20+ and Go 1.22+ before running the full suite. | 10 | Pass |
| `npm test` runs Go, static, claim, browser, accessibility, privacy, and offline checks. | 12 | Pass |
| A missing Go toolchain produces an actionable error. | 8 | Pass |
| `npm run build` writes the CLI and static site to `dist/`. | 11 | Pass |
| `npm run package` creates release archives in `dist/release/`. | 8 | Pass |
| Run `npm run dev` for the local documentation site. | 9 | Pass |
| The static documentation site builds with `npm run build:site` into `dist/site/`. | 12 | Pass |
| The factory deploys that directory. | 5 | Operational documentation |
| The site has no analytics or third-party runtime scripts. | 9 | Pass |
| A service worker keeps public documentation available after the first visit. | 11 | Pass |
| The project uses the MIT License. | 6 | Pass |
| It is independent community software and is not affiliated with GitHub. | 11 | **F-2-2** |
| See `CHANGELOG.md` for release notes. | 6 | Pass |

README headings and labels (“Try the bundled sample”, “Install”, “Create account rules”, “Check and run”, “How tokens and accounts are handled”, “Development”, “Deployment”, and “License and status”) are contextual. Executable examples are commands/configuration rather than marketing copy.

## Structure, accessibility, and links

- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/no-such-page` had intended statuses (the last 404), one `<h1>`, one `<main>`, `lang=en`, local favicon/touch icon, canonical, description, Open Graph, and Twitter metadata. Titles follow the route/product pattern and are under 60 characters.
- The designed 404 kept the product visual language and offered **Return home** and **Try the demo**. Chromium logs the expected network error for a 404 navigation itself; there was no product JavaScript error.
- Header/footer, skip link, Privacy/Terms, attribution, and version are consistent. Every crawled internal link returned 200; anchors resolved in-page; both GitHub links returned 200.
- Primary-nav Privacy navigation focused its `<h1>`; browser Back restored focus to the home `<h1>`. Direct demo/legal/404 loads worked.
- Axe found zero serious/critical violations at 390 px on all five routes. The dark mineral ground, lime/cyan route art, policy prism, and terminal trace are specific to the documented luminous-glass identity, not a generic SaaS template.

## Earlier-review verification

Each item from `review-1.md` and `polish-1.md` was rechecked. The earlier items below remain fixed; F-2-1 is a new public-cache wording/test issue, not a return of the prior user-data-storage finding.

| Earlier ID | Current confirmation |
| --- | --- |
| 1 | Job headline and work/personal audience are visible before scroll. |
| 2 | One-click demo, banner, reset, Start for real, samples, recording, and CLI demo work. |
| 3 | 16 declared unique claim tests passed. |
| 4 | Demo/legal/sitemap/404 routes direct-load correctly. |
| 5 | CLI demo uses a temp workspace and reports cleanup. |
| 6 | Metadata, shared chrome, direct URLs, focus, and history work. |
| 7 | Account/rule/folder/token wording is consistent; legacy jargon absent. |
| 8 | Go prerequisite is documented and clean-clone suite passed. |
| U1 | Canary-token confidentiality test passed. |
| U2 | Concurrent isolation/no-switch test passed. |
| U3 | Three sample repositories select stated accounts. |
| U4 | Child-only token request/environment test passed. |
| U5 | Host/owner/remote/folder/first-match test passed. |
| U6 | Token-free `which` and JSON test passed. |
| U7 | Exit 2/3/4/child preservation test passed. |
| U8 | Toolchain/auth guidance and starter-rules test passed. |
| U9 | Remote/config/JSON/privacy-origin/offline/license tests passed; F-2-2 is separate. |
| C1 | Wordmark is separate from job `<h1>`. |
| C2 | Contextual navigation replaces isolated Rules. |
| C3 | Sample demo is primary; installation names its result. |
| C4 | Account/matching-rule language replaced identity/policy language. |
| C5 | Explicit job headline replaces old slogan. |
| C6 | Audience sentence names work/personal developers. |
| C7 | “Active GitHub account” is consistent. |
| C8 | Outcome labels replace abstract labels. |
| C9 | Numbered headings are task-specific. |
| C10 | Rules/signed-in accounts replace policy-layer language. |
| C11 | Token handoff is concrete and tested. |
| C12 | Fields/JSON detail use labels/examples. |
| C13 | Step says “Run the command with that account.” |
| C14 | Section says which account a repository will use. |
| C15 | Form label names the sample match. |
| C16 | Account/command/script terminology is stable. |
| C17 | Copy buttons name copied commands. |
| C18 | Safety section names what does not change. |
| C19 | Token section says “Does not save tokens.” |
| C20 | No-match wording states the result. |
| C21 | Footer says one account per repository. |
| C22 | Exit guidance is short and tested. |
| C23 | README heading explains token/account handling. |
| C24 | Offline notice says what remains available. |
| C25 | Update notice says refresh to use it. |

## Missed leverage

No missing AI feature is expected: local rule selection is deterministic, so AI would be decorative. Existing `init`, `which`, `run`, and temp-directory `demo` satisfy the brief; import/export or cloud sync would weaken the local-first safety model.

## What would make this perfect

Correct the browser-storage wording and test Cache Storage explicitly, then remove the untestable README affiliation sentence. Re-run the 16 claim commands in a clean clone and repeat the live privacy/demo check. Those changes would leave no observed finding.

# Adversarial first-read review 4

**Product:** gh-account-autoswitch
**Reviewed:** 2026-08-28
**Candidate/live revision:** `4c8e64f5e617d60ae586c6f021da68708617bb3a`
**Live URL:** <https://gh-account-autoswitch.sociobot.in/>

## Verdict: FAIL

One blocking finding remains. The live product is clear, tryable, and privacy-safe in its demo, but one required clean-sandbox claim command fails twice. A claim command that fails cannot verify the release assertion it supports.

## F-4-1 — BLOCKING — The release-package claim times out from a clean clone

- **Quote/location:** `.factory/claims.json`, `release-package`: “`npm run package` creates supported release archives in `dist/release/` with the executable, README, and MIT license.” Required test: `npm run test:claims -- --grep @claim:release-package`.
- **Evidence:** A fresh clone of this candidate with Go 1.22.12 reached `tests/claims.spec.ts:296` and failed with **“Test timeout of 30000ms exceeded.”** The same test failed in a second fresh clone with isolated `GOCACHE` and `GOMODCACHE`. It builds five release targets through `npm run package`. The 180-second third argument on `test()` is not applying in Playwright 1.58.2.
- **Why:** The claims contract requires each listed command to pass in a clean sandbox. A later warm-cache `npm test` passed, but that does not make the cold-cache result reliable or the claim verified.
- **Concrete fix:** Set the timeout through Playwright’s supported API: put `test.setTimeout(180_000)` first in this test, or use `test('…', { timeout: 180_000 }, async () => { … })`. Re-run the exact command from a new clone with a new Go cache and retain the archive-content assertions.

## Cold first screen

Fresh Chromium contexts at 390 × 844 and 1440 × 900 were opened before scrolling.

| Question | First-read answer | On-screen evidence |
| --- | --- | --- |
| What does it do? | Choose the signed-in GitHub account for this repository before `gh` runs. | “Choose the right GitHub account per repository” |
| For whom? | Developers using work and personal GitHub accounts on one machine. | “For developers with work and personal GitHub accounts…” |
| What should I click first? | **Try it with sample data.** | Primary action with “Shows three repository-to-account matches; nothing is saved.” |

The mobile facts ended at 754 px in the 844 px viewport. The fresh page made same-origin requests only and emitted no console or page errors. This passes the cold-read requirement.

## Demo and sandbox checks

- The landing action redirects `/?demo=1` to `/demo/` in one click.
- At 390 px, the persistent **“Demo — sample data, nothing is saved”** banner, Reset demo, Start for real, and full first row (`github.com/acme-corp/payments` → `dev@acme.example` → `Acme work`) are visible without scrolling. The row bottom was 513.17 px.
- Replay changes to “Recording replayed.” Reset restores the recording, announces “Reset restored the starting sample.”, and focuses the demo `<h1>`.
- Pre-seeded real `localStorage` and `sessionStorage` sentinels remained unchanged; IndexedDB was empty. The only persisted browser object was the documented versioned cache of public site files.
- Interception across landing, demo, replay, reset, and Start for real recorded only the product origin. An offline reload after service-worker activation returned 200 with the demo heading and banner.
- The passing `demo-selection` and `demo-isolation` commands exercise the shipped CLI demo in a temporary directory, preserve a hostile real-config sentinel, request no token, and verify cleanup.

No AI, sync, or import/export feature is expected by the brief. Deterministic, auditable account rules are the valuable behavior; an AI step would be decorative and weaken it.

## Claims audit

From a clean clone with isolated Go 1.22.12, every manifest command was run separately. Eighteen passed. One failed as F-4-1. A later warm-cache `npm test` passed its 19 claim and 9 browser tests, which does not supersede the required cold-clone evidence.

| Claim | Result | Claim | Result |
| --- | --- | --- | --- |
| demo-selection | PASS | browser-demo | PASS |
| demo-isolation | PASS | which-safe | PASS |
| command-isolation | PASS | token-confidentiality | PASS |
| matching-rules | PASS | remote-formats | PASS |
| exit-codes | PASS | config-safety | PASS |
| starter-rules | PASS | toolchain-prerequisites | PASS |
| full-suite | PASS | build-artifacts | PASS |
| release-package | **FAIL — F-4-1** | json-output | PASS |
| site-private | PASS | offline-docs | PASS |
| free-license | PASS |  |  |

All visitor-reliant landing and README claims map to a manifest entry: matching to `matching-rules`/`remote-formats`; token and active-account isolation to `which-safe`/`command-isolation`/`token-confidentiality`; exits to `exit-codes`; setup to `starter-rules`/`toolchain-prerequisites`; build/package claims to their workflow entries; privacy/offline/license to `site-private`/`offline-docs`/`free-license`. No new unlisted claim was found. F-4-1 is a listed but failing claim.

## Copy audit

Method: visible natural-language sentences, including offline notice, footer, and image alt. A hyphenated compound and inline code term count as one word. Commands, configuration/path literals, controls, short facts, and headings appear after the tables. No sentence exceeds 22 words.

### Landing sentences

| Sentence | Words |
| --- | ---: |
| You are offline. | 3 |
| Installation instructions are still available. | 5 |
| For developers with work and personal GitHub accounts, it picks one account for each `gh` command. | 16 |
| Shows three repository-to-account matches; nothing is saved. | 7 |
| The token goes only to that command. | 7 |
| Use its host, owner, remote, or folder. | 7 |
| Your active GitHub account stays unchanged. | 6 |
| The command uses your rules and accounts already signed in to the GitHub CLI. | 14 |
| Check its `origin` remote and current folder. | 7 |
| Each field in a rule must match. | 7 |
| Rules are checked from top to bottom. | 7 |
| The selected token goes only to the GitHub command you started. | 11 |
| `which` shows the matching input and rule. | 7 |
| It does not ask the GitHub CLI for a token. | 10 |
| The first complete match wins. | 5 |
| Match one GitHub or GitHub Enterprise Server host. | 8 |
| Match an organization or user name pattern. | 7 |
| Match the complete host, owner, and repository path. | 8 |
| Match a local folder pattern. | 5 |
| Source installation requires Go 1.22 or newer and an authenticated GitHub CLI. | 12 |
| It never runs `gh auth switch`. | 6 |
| A selected token is not printed, logged, or added to the rules file. | 13 |
| If no rule matches, it exits with code 3 and does not run `gh`. | 14 |
| Choose one GitHub account for each repository. | 7 |
| Two separate account routes pass through a matching rule and reach one repository. | 13 |

### README sentences

| Sentence | Words |
| --- | ---: |
| Choose the right GitHub account for each repository before a `gh` command runs. | 13 |
| This command is for developers who use work, personal, or client GitHub accounts on one machine. | 16 |
| It does not change the active account used by other commands. | 11 |
| The demo matches three sample repositories and shows one unmatched repository. | 11 |
| It does not read your rules or request a token. | 10 |
| The command creates a temporary workspace and removes it before exit. | 11 |
| The shipped inputs are in `examples/demo`. | 6 |
| Open the one-click recording at `https://gh-account-autoswitch.sociobot.in/?demo=1`. | 7 |
| Source installation requires Go 1.22 or newer. | 8 |
| Normal use also requires an authenticated GitHub CLI. | 8 |
| Keep the installed `gh` command. | 5 |
| Add this function to your shell configuration. | 8 |
| Open a new shell after saving the function. | 8 |
| Generate starter rules from the accounts reported by the GitHub CLI. | 11 |
| Review `~/.config/gh-accounts.toml` before running commands. | 7 |
| Each rule can match a host, owner, complete remote, local folder, or a combination. | 14 |
| Every present field must match. | 5 |
| Rules are checked from top to bottom. | 7 |
| The first complete match wins. | 5 |
| GitHub.com and GitHub Enterprise Server remotes work in SSH, `ssh://`, and HTTPS forms. | 13 |
| See the selected account without requesting a token. | 8 |
| Run the GitHub command with that account. | 8 |
| Add `--json` to `which`, `init`, `demo`, or `run` for machine-readable output. | 12 |
| Use explicit paths in scripts when needed. | 7 |
| `which` never requests a token. | 5 |
| `run` requests the selected account’s token from the installed GitHub CLI. | 11 |
| The selected token exists only in the child command environment. | 10 |
| It is not printed, logged, or saved in the rules file. | 11 |
| The command never runs `gh auth switch`. | 7 |
| An unmatched repository exits with code 3 and does not run `gh`. | 12 |
| Usage or configuration errors exit 2. | 6 |
| A missing selected token exits 4. | 6 |
| Other command failures preserve the GitHub CLI exit code. | 9 |
| The parser rejects unknown rule keys. | 6 |
| Do not put tokens in `gh-accounts.toml`. | 6 |
| Install Node.js 20+ and Go 1.22+ before running the full suite. | 10 |
| `npm test` runs Go, static, claim, browser, accessibility, privacy, and offline checks. | 12 |
| A missing Go toolchain produces an actionable error. | 8 |
| `npm run build` writes the CLI and static site to `dist/`. | 11 |
| `npm run package` creates release archives in `dist/release/`. | 8 |
| Run `npm run dev` for the local documentation site. | 9 |
| The static documentation site builds with `npm run build:site` into `dist/site/`. | 12 |
| The site has no analytics or third-party runtime scripts. | 9 |
| A service worker keeps public documentation available after the first visit. | 11 |
| The project uses the MIT License. | 6 |
| See `CHANGELOG.md` for release notes. | 6 |

The release-package README sentence is F-4-1; all other rows pass the length and claims check. The headline is an eight-word job statement. Headings are contextual, buttons name results (“Try it with sample data,” “Install the command,” “Copy install command”), banned marketing words are absent, and terminology is stable: **account**, **rule**, **folder**, **remote**, **token**, **demo**. No separate copy finding was observed.

## Structure, accessibility, links, and identity

- Live `/`, `/demo/`, `/privacy/`, `/terms/`, and `/no-such-page` returned their intended 200/404 response with one `<main>`, one `<h1>`, `lang="en"`, route-specific title, description, canonical URL, OG/Twitter tags, and local favicon/touch icon.
- Direct loads and reloads work. Privacy navigation focused its `<h1>`; Back focused the home `<h1>`.
- Every normal rendered internal/external link crawled to 200. The 404 page’s current-page skip anchor retains 404 status and is not a dead destination.
- `npm run verify:live` passed all 11 desktop/390-px checks: zero serious/critical Axe issues, zero product console errors, correct 404, and isolated query demo. All visible mobile controls met 44 × 44 px.
- The dark mineral ground, cyan/lime account rails, glass rule prism, terminal traces, and geometric mark implement the luminous-glass thesis and are not a generic SaaS template.

## Earlier findings rechecked

All earlier review, polish, and handoff records were read. Live behavior and current code confirm the following status for every prior ID.

| Earlier IDs | Result | Confirmation |
| --- | --- | --- |
| 1 | Fixed | Plain job headline and explicit audience remain above the mobile fold. |
| 2 | Fixed | One-click demo, banner, reset, Start for real, recording, and CLI demo work. |
| 3 | Fixed | Manifest/tag integrity works; F-4-1 is a separate failed command. |
| 4 | Fixed | Direct demo/legal routes and styled 404 work. |
| 5 | Fixed | Temp-workspace demo cleanup is tested. |
| 6 | Fixed | Metadata, shared chrome, focus, and history work. |
| 7 | Fixed | Account/rule/folder/token language remains consistent. |
| 8 | Fixed | Go/auth prerequisite test passes. |
| U1 | Fixed | Token-canary confidentiality test passes. |
| U2 | Fixed | Concurrent no-switch isolation test passes. |
| U3 | Fixed | Three sample repositories select the shown accounts. |
| U4 | Fixed | Fake `gh` confirms child-only token use. |
| U5 | Fixed | Host/owner/remote/folder/order matching passes. |
| U6 | Fixed | `which` remains token-free, including JSON. |
| U7 | Fixed | Observable exit-code behavior passes. |
| U8 | Fixed | Toolchain/auth and starter-rule checks pass. |
| U9 | Fixed | Remote/config/JSON/site privacy/offline/license claims remain covered. |
| C1 | Fixed | Product wordmark is separate from job headline. |
| C2 | Fixed | Navigation uses contextual account-rule wording. |
| C3 | Fixed | Sample demo is primary and install names its result. |
| C4 | Fixed | Account/matching-rule wording replaces identity/policy terms. |
| C5 | Fixed | Plain job headline remains. |
| C6 | Fixed | Audience sentence remains explicit. |
| C7 | Fixed | “Active GitHub account” wording is stable. |
| C8 | Fixed | Abstract labels remain outcome labels. |
| C9 | Fixed | Numbered headings are task-specific. |
| C10 | Fixed | Rules/signed-in accounts replace credential-store metaphors. |
| C11 | Fixed | Token handoff is concrete and test-backed. |
| C12 | Fixed | Fields and JSON use labeled examples. |
| C13 | Fixed | Run step names the selected account. |
| C14 | Fixed | Inspection section says which account is used. |
| C15 | Fixed | Sample control names the repository match. |
| C16 | Fixed | Account/command terms remain stable. |
| C17 | Fixed | Copy controls name copied commands. |
| C18 | Fixed | Safety section names unchanged behavior. |
| C19 | Fixed | Token copy says it does not save tokens. |
| C20 | Fixed | No-match copy states the stop result. |
| C21 | Fixed | Footer retains one-account-per-repository statement. |
| C22 | Fixed | Exit guidance is short and observable. |
| C23 | Fixed | README explains token/account handling directly. |
| C24 | Fixed | Offline notice says what stays available. |
| C25 | Fixed | Update notice names the refresh action. |
| F-2-1 | Fixed | Privacy distinguishes personal demo data and public cache. |
| F-2-2 | Fixed | Unverifiable affiliation copy is absent. |
| F-3-1 | Fixed | A full sample result is visible in the initial mobile demo. |
| F-3-2 | Fixed | Controls meet 44 × 44 px on tested routes. |
| F-3-3 | Fixed | Node/Go prerequisite is listed and tested. |
| F-3-4 | Fixed | Missing-Go guidance is tested. |
| F-3-5 | Fixed | Aggregate suite statement has a claim test. |
| F-3-6 | Fixed | Build outputs have a claim test. |
| F-3-7 | **Reopened as F-4-1** | The listed release-package claim fails from a cold cache. |
| F-3-8 | Fixed | Site build destination is in build-artifacts coverage. |
| F-3-9 | Fixed | Untestable deployment-ownership copy remains removed. |

## What would make this perfect

Make the release-package claim test apply an effective timeout, prove it from a new clone with a new Go cache, then re-run every manifest command, `npm test`, the 390-px cold demo, and `npm run verify:live`. No other finding was observed.

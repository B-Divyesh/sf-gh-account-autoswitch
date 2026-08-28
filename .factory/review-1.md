# Adversarial first-read review 1

**Product:** gh-account-autoswitch  
**Reviewed:** 2026-08-28  
**Contexts:** fresh Chromium contexts at 390 × 844 and 1440 × 900; clean local clone; live site at `https://gh-account-autoswitch.sociobot.in`.

## Verdict: FAIL

There are five BLOCKING findings. A cold visitor has no no-setup way to see the CLI choose an account, the required demo routes do not work, claims have no manifest or observable claim tests, and unknown routes show the host's generic 404. The first screen also does not name the intended user plainly enough.

## First screen, before scrolling

At 390 px, the first screen showed the wordmark, “How it works,” “Install,” the headline, lede, install/source actions, and two safety statements. At desktop it showed the same content. No console errors occurred.

My first-read interpretation was: “This is a wrapper for `gh` that chooses a GitHub account from the current repository.” The apparent first click is **“Install the shim.”** I could not answer *for whom* from the screen: it never says “developers with work and personal GitHub accounts,” and instead ends with the unexplained phrase **“colliding with another agent.”**

### Findings

1. **BLOCKING — The first screen fails the plain-language audience test.**

   - Quote: “Route each `gh` command through the account that belongs to this repository—without changing global auth or colliding with another agent.”
   - Why: It does not name the user or their situation. “Global auth” and “another agent” require prior technical context. A first-time visitor cannot tell whether this is for ordinary developers with two accounts, automation, or AI agents.
   - Fix: use the headline **“Choose the right GitHub account per repository”** and the one-line explanation **“For developers with work and personal GitHub accounts, it picks one account for each `gh` command.”**

2. **BLOCKING — There is no one-click sample-data demo.**

   - Quote: the only hero actions are “Install the shim” and “View source.” `GET /demo` returned `404` with title **“Azure Static Web Apps - 404: Not found”**. `/?demo=1` returned the normal landing page with no demo banner, no Reset action, and no “Start for real” action.
   - Why: The visitor must install Go, configure `gh`, and create rules before seeing the job work. There is no visible realistic sample, no `Demo — sample data, nothing is saved` indication, no reset, and no isolated demo storage to verify.
   - Fix: put **“Try it with sample data”** on the first screen, with adjacent text **“Shows three repository-to-account matches; nothing is saved.”** For this CLI, ship `examples/` and `gh-account-autoswitch demo`, which creates a temporary sample repository/configuration, runs the real matching command, and prints the output location. Add a self-hosted terminal recording of that command on `/demo`; make `/demo` a designed 200 route with the persistent demo banner and Reset/Start-for-real controls. Add `.factory/demo.md` stating the command, sample, reset behavior, and separate storage/temporary-directory boundary.

3. **BLOCKING — The product has no claim manifest or claim tests.**

   - Quote: `.factory/claims.json` is absent. Examples of visitor-reliant, unlisted claims include “Never stores tokens,” “Never mutates global state,” “`which` never retrieves a token,” “No matching rule is exit code 3,” and README text “Tokens are never printed, logged, or written to the config.”
   - Why: A visitor is being asked to trust account and token handling without a test that runs from a clean demo entry point. There was therefore no listed claim test to execute, and the supplied claim contract cannot be verified.
   - Fix: add `.factory/claims.json` and exactly one clean-sandbox test per claim. At minimum test: selected account for representative work/personal/unmatched repositories; `which` does not execute token retrieval; `run` supplies the selected token only to a child fixture and does not modify parent/global auth; tokens are absent from stdout/stderr/config; no-match exits 3; and `demo` leaves the real config, environment, and storage untouched. Remove any claim that cannot be tested. The complete unlisted-claim inventory is enumerated below.

4. **BLOCKING — Deep demo and unknown routes are the hosting provider's generic 404.**

   - Quote: `/demo` and `/no-such-page` return **“Azure Static Web Apps - 404: Not found.”** The 404 has no product `<h1>`, description, canonical URL, header, or footer; its console logs an external CSS CORS error, and Axe reports a critical `image-alt` violation.
   - Why: A shared link to the required demo fails, the result looks unrelated to the product, and the visitor has no route back. This also fails the designed-404 and no-console-errors checks.
   - Fix: publish a product-styled `404.html` with a plain `<h1>` such as **“This page does not exist”**, a Home link, product metadata, header/footer, and no external resources. Add a real `/demo` page and include it in `sitemap.xml`; configure the host routing so direct loads return those pages rather than its default error page.

5. **BLOCKING — The real job cannot be tried from the required CLI sandbox.**

   - Quote: `go run ./cmd/gh-account-autoswitch demo` exits 127 in the supplied sandbox because Go is unavailable, and the command is not implemented or documented as a demo entry point.
   - Why: The CLI class requires a shipped `--demo` or `demo` command using bundled samples. There is no way to prove account selection, isolation, reset, or non-persistence from a temporary directory.
   - Fix: implement and document `gh-account-autoswitch demo`; test it with only its bundled sample and a temporary directory. It must leave `$HOME`, the user's `gh` authentication, and real configuration untouched.

6. **MAJOR — Metadata and route skeleton are incomplete.**

   - Quote: all three successful routes have zero `og:*` and `twitter:*` tags and no `apple-touch-icon`. The legal pages reduce the header to only Install and their footers omit “Built by Param Factory” and a version/build identifier.
   - Why: Link previews have no product art or description, iOS has no supplied touch icon, and route navigation/footer content is inconsistent. After clicking Privacy from the landing page, focus remained on `<body>`, not the destination `<h1>`.
   - Fix: provide title/description/canonical/OG/Twitter metadata and a local 1200 × 630 product image on every route, plus a 180 px local Apple touch icon. Keep the standard header/footer on all routes; move focus to the new `<h1>` after route navigation (or use ordinary document navigation with an appropriate focus-management script) and verify Back/Forward behavior.

7. **MAJOR — Copy has several jargon-first labels and inconsistent terms.**

   - Quote: “Identity routing,” “Process-scoped,” “Context-aware,” “Agent-safe,” “A policy layer,” “Tiny surface,” “global auth,” “global state,” and “global switch.”
   - Why: These labels are not the job in the visitor's words. The same concepts rotate among account/identity/user, and global auth/state/switch, making a safety-sensitive tool harder to scan.
   - Fix: use **account** throughout; use **active GitHub account** for the state that is not changed; replace labels with **“Uses one account for one command,” “Matches the repository,” “Works beside other commands,”** and **“How account rules work.”** The detailed per-string rewrites are in the copy findings.

8. **MINOR — Full `npm test` is not runnable in this supplied clean sandbox.**

   - Evidence: clean-clone `npm test` invoked `go test ./...` and stopped with `sh: 1: go: not found` (exit 127). `npm run test:site` passed all six tests and `npm run build:site` passed.
   - Why: This is an environment/toolchain limitation rather than evidence of a Go test failure, but it prevents this review from confirming the CLI suite. The README states Go 1.22+ for source installation but does not make the test prerequisite prominent.
   - Fix: make the Go test prerequisite explicit next to `npm test` and have the test script fail with an actionable “Install Go 1.22+” message. Run the full suite in a Go-equipped clean environment as part of the claim-test evidence.

## Claims check and sandbox evidence

`claims.json` is missing, so there were **zero declared claim tests to run**. This is itself finding 3, not a passing claim audit. The full `npm test` command was attempted from a fresh local clone but was blocked before tests by the absent Go executable; static-site verification passed (6/6).

I did independently exercise the landing site's narrow offline/privacy statement. In a fresh browser context, the first online load requested only these same-origin resources: `/`, the responsive WebP hero, `/assets/main-*.js`, and `/assets/style-*.css`. After the service worker became controlling, an offline reload returned 200 and retained the landing `<h1>`. This confirms only the static documentation page's offline cache behavior; it does **not** prove the CLI's token or account-isolation claims.

The following claim-like copy has no entry in a claims manifest and is therefore unlisted. Grouping is only for readability; every quoted statement needs its own listed test or removal.

| ID | Unlisted claim-like copy | Required observable test |
| --- | --- | --- |
| U1 | “Never stores tokens”; “Tokens stay in the existing `gh` credential store and one child environment”; “Tokens are never printed, logged, or written to the config.” | Run sample `which`/`run`; inspect output, config, and temp files for a fixture token. |
| U2 | “Never mutates global state”; “Your active account remains untouched”; “No shared switch to race.” | Seed `gh` fixture state; run concurrent sample commands; assert state byte-for-byte unchanged. |
| U3 | “Route each `gh` command through the account that belongs to this repository”; “One token. One command.” | Three sample repositories must resolve to shown account; child fixture receives only its expected token. |
| U4 | “The shim reads context… and exposes it to one child process only”; “Retrieve the token from `gh` and pass it only to the requested command.” | Fixture records token-request and child environment; assert one request and no parent environment mutation. |
| U5 | “Inspect `origin`… host and owner… directory”; “Every field in the first winning rule must match.” | Table-driven sample remotes/directories, including first-match precedence. |
| U6 | “`which` never retrieves a token”; “It shows the exact input and winning rule, in plain text or JSON.” | Fake `gh` records invocations; run both outputs and assert no token call and exact fields. |
| U7 | “No matching rule is exit code 3”; “No silent fallback.” | Unmatched sample exits 3 and fake real `gh` is not executed. |
| U8 | “Requires Go 1.22+ and an existing authenticated GitHub CLI”; “Generate your starter rules…” | Version/auth preflight and generated-rule fixture tests. |
| U9 | README: account selection, `gh auth switch` avoidance, support for GitHub.com/GHES, first-match behavior, remote parsing, documented exit codes, unknown-key rejection, concurrent isolation, no analytics/third-party runtime/user-data storage, and maintenance/migration promises. | Split into individual testable CLI/site claims; remove policy/status prose that has no observable test. |

## Copy audit

Method: word counts are whitespace-like word tokens in visitor-facing copy. Commands and configuration values are excluded as executable examples; their natural-language labels and the configuration comment are included. A **flag** is a separate finding with a proposed rewrite immediately after the tables. No landing prose sentence exceeds 22 words. README sentences exceeding 22 are marked `>22`.

### Landing page — complete copy inventory

| Copy unit | Words | Flag |
| --- | ---: | --- |
| Offline copy — installation docs are still available. | 7 | C24, U9 |
| Skip to main content | 4 | — |
| gh/autoswitch | 1 | C1 |
| How it works | 3 | — |
| Rules | 1 | C2 |
| Install | 1 | C3 |
| Identity routing for the GitHub CLI | 6 | C4 |
| Right repo. | 2 | C5 |
| Right account. | 2 | C5 |
| Every time. | 2 | C5 |
| Route each `gh` command through the account that belongs to this repository—without changing global auth or colliding with another agent. | 21 | C6 |
| Install the shim | 3 | C3 |
| View source | 2 | — |
| Never stores tokens | 3 | U1 |
| Never mutates global state | 4 | C7, U2 |
| personal@github.com / policy matched / work@github.com | 4 | C4 |
| Process-scoped | 2 | C8 |
| One token. | 2 | U3 |
| One command. | 2 | U3 |
| Context-aware | 2 | C8 |
| Remote, owner, host, or path. | 5 | — |
| Agent-safe | 2 | C8 |
| No shared switch to race. | 5 | C7, U2 |
| 01 / The handoff | 3 | C9 |
| A policy layer, not another credential store. | 7 | C10 |
| The shim reads context, asks your existing `gh` installation for the selected token, and exposes it to one child process only. | 21 | C11, U4 |
| Read the repository | 3 | — |
| Inspect `origin`, its host and owner, plus the absolute working directory. | 11 | U5 |
| Resolve one rule | 3 | — |
| Evaluate your TOML top to bottom. | 6 | C12 |
| Every field in the first winning rule must match. | 9 | U5 |
| Run in isolation | 3 | C13 |
| Retrieve the token from `gh` and pass it only to the requested command. | 13 | U4 |
| 02 / Explain first | 3 | C9 |
| See the decision before you trust it. | 7 | C14 |
| `which` never retrieves a token. | 5 | U6 |
| It shows the exact input and winning rule, in plain text or JSON. | 13 | C12, U6 |
| Try a repository | 3 | C15 |
| Host / github.com / Owner / acme-corp / Directory / ~/src/work/payments / Matched / Acme work · rule 1 / Account / dev@acme.example | 15 | — |
| 03 / Tiny surface | 3 | C9 |
| Four ways to describe where an identity belongs. | 8 | C16 |
| First complete match wins. | 5 | U5 |
| Exact host, including your GHES domain. | 6 | C12 |
| Regular expression for an organization or user. | 7 | C12 |
| Regular expression for canonical host/owner/repo. | 5 | C12 |
| Path glob with `~`, `*`, and `**`. | 4 | C12 |
| 04 / Get routed | 3 | C9 |
| Two commands. | 2 | — |
| No global switch. | 3 | C7, U2 |
| Requires Go 1.22+ and an existing authenticated GitHub CLI. | 10 | U8 |
| Generate your starter rules, review them, then keep working as usual. | 10 | U8 |
| Read the complete CLI reference | 5 | — |
| 1 · Install | 2 | C3 |
| 2 · Create rules | 3 | — |
| Copy (shown twice) | 1 | C17 |
| Command copied to clipboard. | 4 | — |
| Copy was blocked. | 4 | — |
| Select the command text and copy it manually. | 8 | — |
| A documentation update is ready. | 5 | C25 |
| Refresh | 1 | — |
| Safety, by construction | 3 | C18 |
| Nothing global to race. | 4 | C7 |
| Nothing secret to sync. | 4 | C19 |
| No account switching | 3 | U2 |
| The shim never invokes `gh auth switch`. | 6 | U2 |
| Your active account remains untouched. | 5 | U2 |
| No token storage | 3 | U1 |
| Tokens stay in the existing `gh` credential store and one child environment. | 12 | U1 |
| No silent fallback | 3 | C20 |
| No matching rule is exit code 3, not permission to use whatever account happens to be active. | 17 | U7 |
| Open source · MIT | 3 | — |
| Keep every identity in its own lane. | 7 | C21 |
| Install gh-account-autoswitch | 2 | C3 |
| Independent community software. | 3 | — |
| Not affiliated with GitHub. | 4 | — |
| GitHub / Privacy / Terms | 3 | — |

### README — complete copy inventory

| Copy unit | Words | Flag |
| --- | ---: | --- |
| gh-account-autoswitch | 1 | C1 |
| `gh-account-autoswitch` selects the right authenticated GitHub account for each repository, then runs the real `gh` with that account's token scoped to one child process. | 25 | >22, C11, U3 |
| It never calls `gh auth switch`, never stores a token, and cannot change another shell or coding agent's active account. | 21 | C7, U1, U2 |
| It is for developers who keep work, personal, or client GitHub identities on the same machine. | 16 | C16 |
| Version `0.1.0` supports GitHub.com and GitHub Enterprise Server accounts already authenticated in `gh`. | 13 | U9 |
| Install | 1 | — |
| Build from source (Go 1.22+): | 5 | — |
| Keep the real `gh` command and add a shell function that delegates through the shim: | 15 | C11 |
| Add that function to `.zshrc`, `.bashrc`, or the equivalent, then open a new shell. | 14 | C11 |
| The shim locates the real `gh` binary with `PATH`, ignoring shell functions. | 12 | C11, U9 |
| Usage | 1 | — |
| Generate a starter config from the accounts already known to `gh`: | 11 | U8 |
| Edit `~/.config/gh-accounts.toml` and make each rule specific. | 7 | C12 |
| Rules are checked in file order; the first matching rule wins. | 11 | U5 |
| Explain the decision without retrieving a token or running `gh`: | 10 | U6 |
| Machine-readable output is available for every product command: | 8 | C12, U9 |
| Run a real command through the selected identity: | 8 | C16, U3 |
| `run --json` prints the selection as one JSON object to stderr before replacing the process; the real `gh` command still owns stdout and the final exit code. | 27 | >22, C12, U9 |
| Useful overrides for automation: | 4 | C16 |
| Matching behavior | 2 | — |
| A rule may contain any combination of: | 7 | — |
| `host`: exact, case-insensitive remote host such as `github.com` or `github.corp.example`. | 10 | C12, U9 |
| `owner`: Go regular expression matched against the remote owner. | 9 | C12, U9 |
| `remote`: Go regular expression matched against canonical host/owner/repo. | 8 | C12, U9 |
| `directory`: doublestar-style path glob (`*`, `?`, `**`) matched against the absolute working directory. | 10 | C12, U9 |
| A leading `~/` expands to the current home directory. | 8 | U9 |
| All fields present in one rule must match. | 8 | U5 |
| The first complete match wins. | 5 | U5 |
| Remote URLs in SSH (`git@github.com:owner/repo.git`), `ssh://`, and HTTPS forms are understood. | 12 | C12, U9 |
| The `origin` remote is preferred; otherwise the first configured remote is used. | 12 | U9 |
| The command exits with code `2` for configuration or usage errors, `3` when no rule matches, `4` when a selected token cannot be obtained, and otherwise preserves the real `gh` exit code. | 32 | >22, C22, U9 |
| Safety model | 2 | C23 |
| The shim asks the real binary for a token using `gh auth token --hostname HOST --user ACCOUNT`, places it in `GH_TOKEN` (or `GH_ENTERPRISE_TOKEN` for GHES) only in the child environment, and then replaces itself with the real `gh`. | 41 | >22, C11, U4 |
| Tokens are never printed, logged, or written to the config. | 10 | U1 |
| Concurrent invocations do not share mutable state. | 7 | C7, U2 |
| Do not put tokens in `gh-accounts.toml`. | 6 | U1 |
| The parser rejects unknown keys so mistakes fail closed. | 9 | C22, U9 |
| If an inherited `GH_TOKEN` or `GH_ENTERPRISE_TOKEN` is present, the shim replaces it only for the selected child process. | 21 | C11, U4 |
| Development | 1 | — |
| Run the site locally with `npm run dev`. | 8 | — |
| Package release archives with `npm run package`; outputs land in `dist/release/`. | 11 | C16 |
| Registry and GitHub releases are owned by the factory; this repository does not publish itself. | 15 | C16 |
| Deployment | 1 | — |
| The static documentation site deploys from `dist/site` to <https://gh-account-autoswitch.sociobot.in>. | 10 | U9 |
| The CLI is distributed separately as versioned release archives. | 9 | U9 |
| No runtime analytics, third-party scripts, remote fonts, user-data storage, or payment system are included. | 14 | U9 |
| Project status | 2 | — |
| This is an independent community utility, not an official GitHub project. | 11 | U9 |
| If `gh` ships safe contextual account selection natively, the project will document migration and enter maintenance mode rather than compete with the built-in behavior. | 24 | >22, C16, U9 |
| See [CHANGELOG.md](CHANGELOG.md) for releases. | 5 | — |
| MIT licensed. | 2 | — |

### Copy flags and proposed rewrites

| Flag | Finding and rewrite |
| --- | --- |
| C1 | Product-name-only wordmark/heading is not a job. Keep it as the wordmark; use “Choose the right GitHub account per repository” as the content heading. |
| C2 | “Rules” has little context in isolation. Use “Account rules” in navigation. |
| C3 | “Install” / “Install the shim” skips the try-first result and “shim” is jargon. Primary action: “Try it with sample data.” Installation action: “Install the command.” |
| C4 | “Identity routing” and “policy matched” are specialist labels. Use “Choose an account for each repository” and “matching rule found.” |
| C5 | The headline is memorable but omits `gh`, GitHub, the action, and the user. Replace with the F1 headline. |
| C6 | “Global auth” and “another agent” are undefined. Rewrite: “It chooses one GitHub account for this repository and leaves your active account unchanged.” |
| C7 | “Global state,” “switch to race,” and “mutable state” vary for one concept. Use “active GitHub account” consistently. |
| C8 | “Process-scoped,” “Context-aware,” and “Agent-safe” are jargon labels. Use “One account for one command,” “Matches this repository,” and “Does not change other commands.” |
| C9 | “The handoff,” “Explain first,” “Tiny surface,” and “Get routed” do not identify their sections when heard alone. Use “How account rules work,” “Check a match before running,” “Ways to match a repository,” and “Install and create rules.” |
| C10 | “Policy layer” and “credential store” are implementation language. Rewrite: “It uses your rules and the accounts already signed in to `gh`.” |
| C11 | “shim,” “child process,” “real binary,” `PATH`, shell function, and environment-variable names need a first-use explanation. For example: “The command asks your installed GitHub CLI for a token, then gives it only to the GitHub command you started.” Put technical detail under an “Advanced details” heading. |
| C12 | TOML, JSON, GHES, regular expression, canonical, path glob, doublestar, SSH, and stderr are developer jargon. Define each at first use or show plain examples: “Organization name pattern (for example, `acme-corp`).” Spell out “GitHub Enterprise Server” before “GHES.” |
| C13 | “Run in isolation” does not state the outcome. Use “Run the command with that account.” |
| C14 | “See the decision before you trust it” is vague. Use “Check which account a repository will use.” |
| C15 | “Try a repository” suggests a live trial but only changes a static visual. Use “See a sample repository match.” |
| C16 | “identity,” “real command,” “automation,” release ownership, and “contextual switching” vary from the user task. Prefer “GitHub account,” “command,” “scripts,” and concrete ownership/status wording. |
| C17 | Visual “Copy” is not result-naming. Use “Copy install command” and “Copy create-rules command.” |
| C18 | “Safety, by construction” makes an unproved quality assertion. Use “What the command does not change.” |
| C19 | “Nothing secret to sync” is metaphorical. Use “It does not copy or save tokens.” |
| C20 | “No silent fallback” is implementation phrasing. Use “Stops when no rule matches.” |
| C21 | “Keep every identity in its own lane” is a slogan, not the job. Use “Choose the account for each repository.” |
| C22 | The 32-word exit-code sentence and “fail closed” pack several rules into jargon. Split: “Configuration mistakes exit with code 2. No matching rule exits with code 3. A missing token exits with code 4. Other errors keep `gh`’s exit code.” |
| C23 | “Safety model” is abstract. Use “How it handles tokens and accounts.” |
| C24 | “Offline copy” is unclear. Use “You are offline. Installation instructions are still available.” |
| C25 | “A documentation update is ready” is less direct than “An update is ready. Refresh to use it.” |

## Structure, visual, and accessibility checks

- Landing, Privacy, and Terms each returned 200 with one `<h1>`, `<main>`, `lang="en"`, title, description, canonical link, header, footer, skip link, local favicon, and no Axe WCAG A/AA violations. The landing did not log console errors at either viewport.
- Every visible landing link resolved successfully (same-page fragments, home, Privacy, Terms, and the GitHub repository/reference). The overall dark mineral/luminous-route artwork is product-specific and matches `.factory/design.md`; it is not a generic SaaS-template surface.
- The landing title is within the requested “Product — what it does” pattern. Privacy and Terms title patterns are correct. There is no title/metadata check that can pass for the generic 404.
- `robots.txt` and sitemap exist, but sitemap omits the required demo route because no demo route exists.
- Missing items are recorded as findings above: product 404, `/demo`, OG/Twitter metadata, Apple touch icon, full consistent header/footer/build label, and focus placement after navigation.

## Reproduction commands

```sh
# Clean-clone static verification (passed)
npm ci
npm run test:site
npm run build:site

# Full suite attempted; this sandbox lacks Go
npm test

# Live checks used fresh Playwright contexts
# https://gh-account-autoswitch.sociobot.in/
# https://gh-account-autoswitch.sociobot.in/demo
# https://gh-account-autoswitch.sociobot.in/?demo=1
# https://gh-account-autoswitch.sociobot.in/no-such-page
```

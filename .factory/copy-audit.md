# Copy audit

Audited 2026-08-28 against `site/index.html`, `site/demo/index.html`, the legal routes, `README.md`, and the catalog description.

## First screen

| Copy unit | Words | Result |
| --- | ---: | --- |
| Choose the right GitHub account per repository | 8 | pass |
| For developers with work and personal GitHub accounts, it picks one account for each `gh` command. | 15 | pass |
| Try it with sample data | 5 | pass |
| Install the command | 3 | pass |
| Shows three repository-to-account matches; nothing is saved. | 7 | pass |
| Free under MIT | 3 | pass |
| No site analytics | 3 | pass |
| Offline after one visit | 4 | pass |

The headline states the job in eight words. The following sentence names developers with work and personal accounts. The primary action and its result fit in one breath.

## Landing page sentences

| Sentence | Words |
| --- | ---: |
| The token goes only to that command. | 7 |
| Use its host, owner, remote, or folder. | 8 |
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

## Demo sentences

| Sentence | Words |
| --- | ---: |
| The same sample ships in `examples/demo`. | 6 |
| The CLI runs it in a temporary folder and removes that folder afterward. | 13 |
| Three rules use an owner, a folder, and a GitHub Enterprise Server remote. | 13 |
| The fourth repository proves that no match stops with exit code 3. | 12 |
| The command never opens your rules file or asks `gh` for a token. | 13 |
| The command creates and removes its own temporary workspace. | 9 |

## Legal and README check

All prose sentences are 22 words or fewer. Commands, code samples, table rows, navigation labels, and addresses are not sentences. The banned-word scan returned no matches.

## Terminology

| Concept | Required word |
| --- | --- |
| GitHub login selected by a rule | account |
| Repository location on the machine | folder |
| Repository URL known to Git | remote |
| User-authored selection entry | rule |
| Account used by ordinary `gh` commands | active GitHub account |
| Credential passed to one command | token |
| No-setup example mode | demo |

No visitor-facing copy substitutes identity, global state, policy layer, shim, process-scoped, context-aware, or agent-safe for these terms.

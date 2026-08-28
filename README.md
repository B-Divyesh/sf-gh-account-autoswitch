# gh-account-autoswitch

Choose the right GitHub account for each repository before a `gh` command runs.

This command is for developers who use work, personal, or client GitHub accounts on one machine. It does not change the active account used by other commands.

## Try the bundled sample

The demo matches three sample repositories and shows one unmatched repository. It does not read your rules or request a token.

```sh
gh-account-autoswitch demo
gh-account-autoswitch demo --json
```

The command creates a temporary workspace and removes it before exit. The shipped inputs are in [`examples/demo`](examples/demo).

Open the one-click recording at <https://gh-account-autoswitch.sociobot.in/?demo=1>.

## Install

Source installation requires Go 1.22 or newer. Normal use also requires an authenticated [GitHub CLI](https://cli.github.com/).

```sh
go install github.com/B-Divyesh/sf-gh-account-autoswitch/cmd/gh-account-autoswitch@latest
```

Keep the installed `gh` command. Add this function to your shell configuration:

```sh
gh() { gh-account-autoswitch run -- "$@"; }
```

Open a new shell after saving the function.

## Create account rules

Generate starter rules from the accounts reported by the GitHub CLI:

```sh
gh-account-autoswitch init
```

Review `~/.config/gh-accounts.toml` before running commands.

```toml
version = 1

[[rules]]
name = "Acme work"
account = "dev@acme.example"
host = "github.com"
owner = "^acme-corp$"

[[rules]]
name = "Personal projects"
account = "octocat"
directory = "~/src/personal/**"
```

Each rule can match a host, owner, complete remote, local folder, or a combination. Every present field must match.

Rules are checked from top to bottom. The first complete match wins.

GitHub.com and GitHub Enterprise Server remotes work in SSH, `ssh://`, and HTTPS forms.

## Check and run

See the selected account without requesting a token:

```text
$ gh-account-autoswitch which
Account:   dev@acme.example
Rule:      Acme work (#1)
Remote:    github.com/acme-corp/payments
Directory: /Users/dev/src/acme/payments
```

Run the GitHub command with that account:

```sh
gh-account-autoswitch run -- pr create
```

Add `--json` to `which`, `init`, `demo`, or `run` for machine-readable output.

Use explicit paths in scripts when needed:

```sh
gh-account-autoswitch --config ./fixtures/accounts.toml --cwd ./repo which
GH_AUTOSWITCH_CONFIG=./accounts.toml gh-account-autoswitch which
```

## How tokens and accounts are handled

`which` never requests a token. `run` requests the selected account’s token from the installed GitHub CLI.

The selected token exists only in the child command environment. It is not printed, logged, or saved in the rules file.

The command never runs `gh auth switch`. An unmatched repository exits with code 3 and does not run `gh`.

Usage or configuration errors exit 2. A missing selected token exits 4. Other command failures preserve the GitHub CLI exit code.

The parser rejects unknown rule keys. Do not put tokens in `gh-accounts.toml`.

## Development

Install Node.js 20+ and Go 1.22+ before running the full suite.

```sh
npm ci
npm test
npm run build
npm run package
```

`npm test` runs Go, static, claim, browser, accessibility, privacy, and offline checks. A missing Go toolchain produces an actionable error.

`npm run build` writes the CLI and static site to `dist/`. `npm run package` creates release archives in `dist/release/`.

Run `npm run dev` for the local documentation site.

## Deployment

The static documentation site builds with `npm run build:site` into `dist/site/`. The factory deploys that directory.

The site has no analytics or third-party runtime scripts. A service worker keeps public documentation available after the first visit.

## License and status

The project uses the MIT License. It is independent community software and is not affiliated with GitHub.

See [CHANGELOG.md](CHANGELOG.md) for release notes.

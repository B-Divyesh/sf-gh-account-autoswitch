# gh-account-autoswitch

`gh-account-autoswitch` selects the right authenticated GitHub account for each repository, then runs the real `gh` with that account's token scoped to one child process. It never calls `gh auth switch`, never stores a token, and cannot change another shell or coding agent's active account.

It is for developers who keep work, personal, or client GitHub identities on the same machine. Version `0.1.0` supports GitHub.com and GitHub Enterprise Server accounts already authenticated in `gh`.

## Install

Build from source (Go 1.22+):

```sh
go install github.com/B-Divyesh/sf-gh-account-autoswitch/cmd/gh-account-autoswitch@latest
```

Keep the real `gh` command and add a shell function that delegates through the shim:

```sh
gh() { gh-account-autoswitch run -- "$@"; }
```

Add that function to `.zshrc`, `.bashrc`, or the equivalent, then open a new shell. The shim locates the real `gh` binary with `PATH`, ignoring shell functions.

## Usage

Generate a starter config from the accounts already known to `gh`:

```sh
gh-account-autoswitch init
```

Edit `~/.config/gh-accounts.toml` and make each rule specific. Rules are checked in file order; the first matching rule wins.

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
host = "github.com"
directory = "~/src/personal/**"
```

Explain the decision without retrieving a token or running `gh`:

```text
$ gh-account-autoswitch which
Account:   dev@acme.example
Rule:      Acme work (#1)
Remote:    github.com/acme-corp/payments
Directory: /Users/dev/src/acme/payments
```

Machine-readable output is available for every product command:

```sh
gh-account-autoswitch which --json
gh-account-autoswitch init --json --dry-run
gh-account-autoswitch run --json -- repo view
```

Run a real command through the selected identity:

```sh
gh-account-autoswitch run -- pr create
```

`run --json` prints the selection as one JSON object to stderr before replacing the process; the real `gh` command still owns stdout and the final exit code.

Useful overrides for automation:

```sh
gh-account-autoswitch --config ./fixtures/accounts.toml --cwd ./repo which
GH_AUTOSWITCH_CONFIG=./accounts.toml gh-account-autoswitch which
```

## Matching behavior

A rule may contain any combination of:

- `host`: exact, case-insensitive remote host such as `github.com` or `github.corp.example`.
- `owner`: Go regular expression matched against the remote owner.
- `remote`: Go regular expression matched against canonical `host/owner/repo`.
- `directory`: doublestar-style path glob (`*`, `?`, `**`) matched against the absolute working directory. A leading `~/` expands to the current home directory.

All fields present in one rule must match. The first complete match wins. Remote URLs in SSH (`git@github.com:owner/repo.git`), `ssh://`, and HTTPS forms are understood. The `origin` remote is preferred; otherwise the first configured remote is used.

The command exits with code `2` for configuration or usage errors, `3` when no rule matches, `4` when a selected token cannot be obtained, and otherwise preserves the real `gh` exit code.

## Safety model

The shim asks the real binary for a token using `gh auth token --hostname HOST --user ACCOUNT`, places it in `GH_TOKEN` (or `GH_ENTERPRISE_TOKEN` for GHES) only in the child environment, and then replaces itself with the real `gh`. Tokens are never printed, logged, or written to the config. Concurrent invocations do not share mutable state.

Do not put tokens in `gh-accounts.toml`. The parser rejects unknown keys so mistakes fail closed. If an inherited `GH_TOKEN` or `GH_ENTERPRISE_TOKEN` is present, the shim replaces it only for the selected child process.

## Development

```sh
npm ci
npm test              # Go tests + static-site tests
npm run build         # CLI binaries + site -> dist/
npm run build:site    # site only -> dist/site/
```

Run the site locally with `npm run dev`. Package release archives with `npm run package`; outputs land in `dist/release/`. Registry and GitHub releases are owned by the factory; this repository does not publish itself.

## Deployment

The static documentation site deploys from `dist/site` to <https://gh-account-autoswitch.sociobot.in>. The CLI is distributed separately as versioned release archives. No runtime analytics, third-party scripts, remote fonts, user-data storage, or payment system are included.

## Project status

This is an independent community utility, not an official GitHub project. If `gh` ships safe contextual account selection natively, the project will document migration and enter maintenance mode rather than compete with the built-in behavior.

See [CHANGELOG.md](CHANGELOG.md) for releases. MIT licensed.

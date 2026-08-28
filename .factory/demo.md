# Demo sandbox

## Browser entry

Open <https://gh-account-autoswitch.sociobot.in/?demo=1>. The query entry redirects to the real `/demo/` route.

The page shows a recorded run with three matches and one expected no-match result. The persistent banner contains **Reset demo** and **Start for real**.

Reset restores the initial recording and heading focus. The browser demo uses no `localStorage`, `sessionStorage`, IndexedDB, account data, or repository data.

## CLI entry

Run:

```sh
gh-account-autoswitch demo
gh-account-autoswitch demo --json
```

The command creates a unique operating-system temporary directory. It writes only sample rules inside that directory, runs the production matcher, prints four results, and removes the directory before exit.

The demo does not resolve the default config path, inspect the current repository, find `gh`, request a token, or change the environment. The real home directory and GitHub CLI authentication are outside its boundary.

Shipped sample inputs are in `examples/demo/gh-accounts.toml` and `examples/demo/repositories.json`.

## Verification

Run every demo and isolation claim with:

```sh
npm run test:claims
```

The `@claim:demo-selection` and `@claim:demo-isolation` tests use fresh temporary directories and assert cleanup.

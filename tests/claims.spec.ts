import { test, expect } from '@playwright/test';
import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);
const binary = join(process.cwd(), 'dist', 'bin', process.platform === 'win32' ? 'gh-account-autoswitch.exe' : 'gh-account-autoswitch');

async function temp(prefix: string) {
  return mkdtemp(join(tmpdir(), `${prefix}-`));
}

async function command(args: string[], env: NodeJS.ProcessEnv = {}) {
  try {
    const result = await execFile(binary, args, { env: { ...process.env, ...env }, encoding: 'utf8' });
    return { code: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error: any) {
    return { code: Number(error.code), stdout: String(error.stdout || ''), stderr: String(error.stderr || '') };
  }
}

async function configFor(root: string, account = 'work') {
  const path = join(root, 'accounts.toml');
  await writeFile(path, `version = 1\n[[rules]]\nname = "Selected"\naccount = "${account}"\ndirectory = "${root.replaceAll('\\', '/')}"\n`, { mode: 0o600 });
  return path;
}

async function fakeGH(root: string, body: string) {
  const path = join(root, 'gh');
  await writeFile(path, `#!/bin/sh\nset -eu\n${body}\n`, { mode: 0o700 });
  return path;
}

async function allFileText(root: string): Promise<string> {
  let output = '';
  for (const name of await readdir(root)) {
    const path = join(root, name);
    if ((await stat(path)).isDirectory()) output += await allFileText(path);
    else output += await readFile(path, 'utf8');
  }
  return output;
}

test('bundled demo selects three accounts @claim:demo-selection', async () => {
  const result = await command(['demo', '--json']);
  expect(result.code).toBe(0);
  const demo = JSON.parse(result.stdout);
  expect(demo.token_requested).toBe(false);
  expect(demo.results.map((item: any) => [item.repository, item.account, item.exit_code])).toEqual([
    ['github.com/acme-corp/payments', 'dev@acme.example', 0],
    ['github.com/octocat/dotfiles', 'octocat', 0],
    ['github.corp.example/field-team/mobile', 'consultant@client.example', 0],
    ['github.com/unknown-org/prototype', undefined, 3]
  ]);
  const shipped = JSON.parse(await readFile(join(process.cwd(), 'examples/demo/repositories.json'), 'utf8'));
  expect(shipped).toHaveLength(4);
});

test('which never asks for a token @claim:which-safe', async () => {
  const root = await temp('which-safe');
  const config = await configFor(root);
  const log = join(root, 'gh-calls');
  const gh = await fakeGH(root, `printf '%s\\n' "$*" >> "$CALL_LOG"; exit 91`);
  const result = await command(['--config', config, '--cwd', root, 'which', '--json'], { GH_AUTOSWITCH_GH: gh, CALL_LOG: log });
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout).account).toBe('work');
  expect(existsSync(log)).toBe(false);
  expect(result.stdout).not.toContain('token');
});

test('run isolates its token and active account @claim:command-isolation', async () => {
  const root = await temp('command-isolation');
  const config = await configFor(root, 'work-user');
  const calls = join(root, 'calls');
  const child = join(root, 'child');
  const active = join(root, 'active-account');
  await writeFile(active, 'personal-user\n');
  const gh = await fakeGH(root, `
printf '%s\\n' "$*" >> "$CALLS"
if [ "$1" = auth ] && [ "$2" = token ]; then printf '%s\\n' "$FIXTURE_TOKEN"; exit 0; fi
printf '%s|%s|%s' "${'$'}{GH_TOKEN:-}" "${'$'}{GH_ENTERPRISE_TOKEN:-}" "$*" > "$CHILD"
`);
  const inherited = 'inherited-token';
  const result = await command(['--config', config, '--cwd', root, 'run', '--', 'repo', 'view'], { GH_AUTOSWITCH_GH: gh, CALLS: calls, CHILD: child, FIXTURE_TOKEN: 'selected-token', GH_TOKEN: inherited, GH_ENTERPRISE_TOKEN: 'old-enterprise' });
  expect(result.code).toBe(0);
  expect(await readFile(child, 'utf8')).toBe('selected-token||repo view');
  expect(await readFile(active, 'utf8')).toBe('personal-user\n');
  expect(await readFile(calls, 'utf8')).toBe('auth token --hostname github.com --user work-user\nrepo view\n');
  expect(process.env.GH_TOKEN).not.toBe('selected-token');
});

test('selected tokens stay out of output and saved files @claim:token-confidentiality', async () => {
  const root = await temp('token-confidentiality');
  const config = await configFor(root);
  const gh = await fakeGH(root, `if [ "$1" = auth ]; then printf '%s\\n' "$FIXTURE_TOKEN"; else printf done > "$RESULT"; fi`);
  const secret = 'canary-secret-4b8fd3';
  const result = await command(['--config', config, '--cwd', root, 'run', '--', 'repo', 'view'], { GH_AUTOSWITCH_GH: gh, FIXTURE_TOKEN: secret, RESULT: join(root, 'result') });
  expect(result.code).toBe(0);
  expect(result.stdout + result.stderr).not.toContain(secret);
  expect(await allFileText(root)).not.toContain(secret);
});

test('matching fields and file order select the first complete rule @claim:matching-rules', async () => {
  const root = await temp('matching-rules');
  const repo = join(root, 'repo');
  await mkdir(repo);
  await execFile('git', ['init', '-q', repo]);
  await execFile('git', ['-C', repo, 'remote', 'add', 'origin', 'git@github.com:acme-corp/payments.git']);
  const config = join(root, 'accounts.toml');
  await writeFile(config, `version = 1
[[rules]]
name = "Wrong complete fields"
account = "wrong"
host = "github.com"
owner = "^other$"
directory = "${root}/**"
[[rules]]
name = "First complete match"
account = "first"
host = "github.com"
owner = "^acme-corp$"
remote = "^github[.]com/acme-corp/payments$"
directory = "${root}/**"
[[rules]]
name = "Later match"
account = "later"
directory = "${root}/**"
`);
  const result = await command(['--config', config, '--cwd', repo, 'which', '--json']);
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({ account: 'first', rule: 'First complete match', rule_index: 2, host: 'github.com', remote: 'github.com/acme-corp/payments' });
  await execFile('git', ['-C', repo, 'remote', 'set-url', 'origin', 'https://github.com/acme-corp/payments.git']);
  expect(JSON.parse((await command(['--config', config, '--cwd', repo, 'which', '--json'])).stdout).account).toBe('first');
  const enterprise = join(root, 'enterprise');
  await mkdir(enterprise);
  await execFile('git', ['init', '-q', enterprise]);
  await execFile('git', ['-C', enterprise, 'remote', 'add', 'origin', 'ssh://git@github.corp.example:2222/field-team/mobile.git']);
  const enterpriseConfig = join(root, 'enterprise.toml');
  await writeFile(enterpriseConfig, 'version = 1\n[[rules]]\naccount = "enterprise"\nhost = "github.corp.example"\nowner = "^field-team$"\n');
  expect(JSON.parse((await command(['--config', enterpriseConfig, '--cwd', enterprise, 'which', '--json'])).stdout).account).toBe('enterprise');
});

test('documented exit codes are observable @claim:exit-codes', async () => {
  const root = await temp('exit-codes');
  const unmatched = join(root, 'unmatched.toml');
  await writeFile(unmatched, 'version = 1\n[[rules]]\naccount = "work"\ndirectory = "/definitely/not/here/**"\n');
  const never = join(root, 'never');
  const ghNever = await fakeGH(root, `printf called > "$NEVER"`);
  expect((await command(['--config', unmatched, '--cwd', root, 'run', '--', 'status'], { GH_AUTOSWITCH_GH: ghNever, NEVER: never })).code).toBe(3);
  expect(existsSync(never)).toBe(false);
  expect((await command(['unknown-command'])).code).toBe(2);
  const invalid = join(root, 'invalid.toml');
  await writeFile(invalid, 'version = 1\n[[rules]]\naccount = "work"\nunknown = "unsafe"\n');
  expect((await command(['--config', invalid, '--cwd', root, 'which'])).code).toBe(2);
  const config = await configFor(root);
  const ghTokenFail = await fakeGH(root, `if [ "$1" = auth ]; then exit 1; fi`);
  expect((await command(['--config', config, '--cwd', root, 'run', '--', 'status'], { GH_AUTOSWITCH_GH: ghTokenFail })).code).toBe(4);
  const ghExit = await fakeGH(root, `if [ "$1" = auth ]; then printf token; exit 0; fi; exit 17`);
  expect((await command(['--config', config, '--cwd', root, 'run', '--', 'status'], { GH_AUTOSWITCH_GH: ghExit })).code).toBe(17);
});

test('demo is isolated and removes its workspace @claim:demo-isolation', async () => {
  const home = await temp('demo-home');
  const realConfig = join(home, 'real-accounts.toml');
  const sentinel = 'real-config-must-not-change\n';
  await writeFile(realConfig, sentinel);
  const result = await command(['demo', '--json'], { HOME: home, XDG_CONFIG_HOME: home, GH_AUTOSWITCH_CONFIG: realConfig, GH_AUTOSWITCH_GH: '/does/not/exist', GH_TOKEN: 'inherited-secret' });
  expect(result.code).toBe(0);
  const demo = JSON.parse(result.stdout);
  expect(demo.saved).toBe(false);
  expect(demo.workspace_removed).toBe(true);
  expect(existsSync(demo.workspace)).toBe(false);
  expect(await readFile(realConfig, 'utf8')).toBe(sentinel);
  expect(result.stdout + result.stderr).not.toContain('inherited-secret');
  expect(await readdir(home)).toEqual(['real-accounts.toml']);
});

test('init creates starter rules from gh accounts @claim:starter-rules', async () => {
  const root = await temp('starter-rules');
  const config = join(root, 'generated.toml');
  const gh = await fakeGH(root, `printf '%s' '{"hosts":{"github.com":[{"login":"octocat"}],"github.corp.example":[{"login":"work-user"}]}}'`);
  const result = await command(['--config', config, 'init'], { GH_AUTOSWITCH_GH: gh });
  expect(result.code).toBe(0);
  const output = await readFile(config, 'utf8');
  expect(output).toContain('account = "octocat"');
  expect(output).toContain('account = "work-user"');
  expect((await stat(config)).mode & 0o777).toBe(0o600);
});

test('site makes only same-origin runtime requests @claim:site-private', async ({ page, context }) => {
  const origins = new Set<string>();
  page.on('request', request => origins.add(new URL(request.url()).origin));
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Replay recording' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  expect((await context.storageState()).origins).toEqual([]);
});

test('docs reload offline after one visit @claim:offline-docs', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(async () => {
    try { return await page.evaluate(() => Boolean(navigator.serviceWorker.controller)); } catch { return false; }
  }).toBe(true);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Choose the right GitHub account');
  await expect(page.getByText('You are offline.')).toBeVisible();
});

test('MIT license is shipped and stated @claim:free-license', async ({ page }) => {
  expect(await readFile(join(process.cwd(), 'LICENSE'), 'utf8')).toContain('Permission is hereby granted, free of charge');
  await page.goto('/');
  await expect(page.getByText('Free under MIT')).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByText('free, open-source software under the MIT License')).toBeVisible();
});

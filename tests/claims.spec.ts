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
  const shipped = JSON.parse(await readFile(join(process.cwd(), 'examples/demo/repositories.json'), 'utf8'));
  expect(demo.results.map((item: any) => ({
    remote: item.repository,
    directory: item.directory,
    ...(item.account ? { account: item.account } : {}),
    ...(item.exit_code ? { exit_code: item.exit_code } : {})
  }))).toEqual(shipped);
  const shippedRules = await readFile(join(process.cwd(), 'examples/demo/gh-accounts.toml'), 'utf8');
  for (const account of ['dev@acme.example', 'octocat', 'consultant@client.example']) {
    expect(shippedRules).toContain(`account = "${account}"`);
  }
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
  const work = join(root, 'work');
  const personal = join(root, 'personal');
  await Promise.all([mkdir(work), mkdir(personal)]);
  const config = join(root, 'accounts.toml');
  await writeFile(config, `version = 1
[[rules]]
name = "Work"
account = "work-user"
directory = "${work}"
[[rules]]
name = "Personal"
account = "personal-user"
directory = "${personal}"
`);
  const calls = join(root, 'calls');
  const child = join(root, 'child');
  const active = join(root, 'active-account');
  await writeFile(active, 'personal-user\n');
  const gh = await fakeGH(root, `
printf '%s\\n' "$*" >> "$CALLS"
if [ "$1" = auth ] && [ "$2" = switch ]; then printf changed > "$ACTIVE"; exit 90; fi
if [ "$1" = auth ] && [ "$2" = token ]; then printf 'token-%s\\n' "$6"; exit 0; fi
printf '%s|%s|%s\\n' "${'$'}{GH_TOKEN:-}" "${'$'}{GH_ENTERPRISE_TOKEN:-}" "$*" >> "$CHILD"
`);
  const env = { GH_AUTOSWITCH_GH: gh, CALLS: calls, CHILD: child, ACTIVE: active, GH_TOKEN: 'inherited-token', GH_ENTERPRISE_TOKEN: 'old-enterprise' };
  const [workResult, personalResult] = await Promise.all([
    command(['--config', config, '--cwd', work, 'run', '--', 'repo', 'view', 'work'], env),
    command(['--config', config, '--cwd', personal, 'run', '--', 'repo', 'view', 'personal'], env)
  ]);
  expect(workResult.code).toBe(0);
  expect(personalResult.code).toBe(0);
  expect((await readFile(child, 'utf8')).trim().split('\n').sort()).toEqual([
    'token-personal-user||repo view personal',
    'token-work-user||repo view work'
  ]);
  expect(await readFile(active, 'utf8')).toBe('personal-user\n');
  const callLog = await readFile(calls, 'utf8');
  expect(callLog).toContain('auth token --hostname github.com --user work-user');
  expect(callLog).toContain('auth token --hostname github.com --user personal-user');
  expect(callLog).not.toContain('auth switch');
  expect(process.env.GH_TOKEN || '').not.toMatch(/^token-/);
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

test('GitHub and enterprise remote URL forms resolve @claim:remote-formats', async () => {
  const root = await temp('remote-formats');
  const config = join(root, 'accounts.toml');
  await writeFile(config, `version = 1
[[rules]]
account = "github-user"
host = "github.com"
owner = "^acme-corp$"
[[rules]]
account = "enterprise-user"
host = "github.corp.example"
owner = "^field-team$"
`);
  for (const [name, remote, account] of [
    ['scp', 'git@github.com:acme-corp/payments.git', 'github-user'],
    ['https', 'https://github.com/acme-corp/payments.git', 'github-user'],
    ['ssh', 'ssh://git@github.corp.example:2222/field-team/mobile.git', 'enterprise-user']
  ]) {
    const repo = join(root, name);
    await mkdir(repo);
    await execFile('git', ['init', '-q', repo]);
    await execFile('git', ['-C', repo, 'remote', 'add', 'origin', remote]);
    const result = await command(['--config', config, '--cwd', repo, 'which', '--json']);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.stdout).account).toBe(account);
  }
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
  const config = await configFor(root);
  const ghTokenFail = await fakeGH(root, `if [ "$1" = auth ]; then exit 1; fi`);
  expect((await command(['--config', config, '--cwd', root, 'run', '--', 'status'], { GH_AUTOSWITCH_GH: ghTokenFail })).code).toBe(4);
  const ghExit = await fakeGH(root, `if [ "$1" = auth ]; then printf token; exit 0; fi; exit 17`);
  expect((await command(['--config', config, '--cwd', root, 'run', '--', 'status'], { GH_AUTOSWITCH_GH: ghExit })).code).toBe(17);
});

test('unknown rule keys stop before selection @claim:config-safety', async () => {
  const root = await temp('config-safety');
  const invalid = join(root, 'invalid.toml');
  const callLog = join(root, 'gh-calls');
  const gh = await fakeGH(root, `printf called > "$CALL_LOG"`);
  await writeFile(invalid, 'version = 1\n[[rules]]\naccount = "work"\nunknown = "unsafe"\n');
  const result = await command(['--config', invalid, '--cwd', root, 'run', '--', 'status'], { GH_AUTOSWITCH_GH: gh, CALL_LOG: callLog });
  expect(result.code).toBe(2);
  expect(result.stderr).toContain('unknown rule key "unknown"');
  expect(existsSync(callLog)).toBe(false);
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

test('source and authentication prerequisites fail with guidance @claim:toolchain-prerequisites', async () => {
  const go = await execFile('go', ['version']);
  const match = go.stdout.match(/go(\d+)\.(\d+)/);
  expect(match).not.toBeNull();
  expect(Number(match?.[1]) > 1 || Number(match?.[2]) >= 22).toBe(true);
  const root = await temp('prerequisites');
  const gh = await fakeGH(root, `printf '%s' '{"hosts":{}}'`);
  const result = await command(['--config', join(root, 'generated.toml'), 'init'], { GH_AUTOSWITCH_GH: gh });
  expect(result.code).toBe(2);
  expect(result.stderr).toContain('run `gh auth login` first');
});

test('all documented product commands emit parseable JSON @claim:json-output', async () => {
  const root = await temp('json-output');
  const config = await configFor(root, 'work-user');
  const gh = await fakeGH(root, `
if [ "$1" = auth ] && [ "$2" = status ]; then printf '%s' '{"hosts":{"github.com":[{"login":"work-user"}]}}'; exit 0; fi
if [ "$1" = auth ] && [ "$2" = token ]; then printf '%s' 'fixture-token'; exit 0; fi
exit 0
`);
  const env = { GH_AUTOSWITCH_GH: gh };

  const which = await command(['--config', config, '--cwd', root, 'which', '--json'], env);
  expect(JSON.parse(which.stdout)).toMatchObject({ account: 'work-user' });

  const init = await command(['--config', join(root, 'generated.toml'), 'init', '--dry-run', '--json'], env);
  expect(JSON.parse(init.stdout)).toMatchObject({ written: false });

  const demo = await command(['demo', '--json'], env);
  expect(JSON.parse(demo.stdout)).toMatchObject({ demo: true, saved: false });

  const run = await command(['--config', config, '--cwd', root, 'run', '--json', '--', 'status'], env);
  expect(run.code).toBe(0);
  expect(JSON.parse(run.stderr)).toMatchObject({ account: 'work-user' });
});

test('site makes only same-origin runtime requests @claim:site-private', async ({ page, context }) => {
  const origins = new Set<string>();
  page.on('request', request => origins.add(new URL(request.url()).origin));
  await page.goto('/?demo=1');
  await expect(page).toHaveURL(/\/demo\/$/);
  await page.getByRole('button', { name: 'Replay recording' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/#install$/);
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  expect((await context.storageState()).origins).toEqual([]);
});

test('query demo opens the isolated sample and resets it @claim:browser-demo', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(5);
  await page.getByRole('button', { name: 'Replay recording' }).click();
  await expect(page.getByRole('button', { name: 'Recording replayed' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('button', { name: 'Replay recording' })).toBeVisible();
  await expect(page.getByText('Reset restored the starting sample.')).toHaveText('Reset restored the starting sample.');
  await expect(page.locator('h1')).toBeFocused();
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  await expect(page.getByRole('link', { name: 'Start for real' })).toHaveAttribute('href', '/#install');
});

test('docs reload offline after one visit @claim:offline-docs', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(async () => {
    try { return await page.evaluate(() => Boolean(navigator.serviceWorker.controller)); } catch { return false; }
  }).toBe(true);
  await context.setOffline(true);
  for (const [route, heading] of [
    ['/', 'Choose the right GitHub account'],
    ['/demo/', 'Watch three repositories choose three accounts'],
    ['/privacy/', 'Privacy'],
    ['/terms/', 'Terms']
  ]) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
  }
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('You are offline.')).toBeVisible();
});

test('MIT license is shipped and stated @claim:free-license', async ({ page }) => {
  expect(await readFile(join(process.cwd(), 'LICENSE'), 'utf8')).toContain('Permission is hereby granted, free of charge');
  await page.goto('/');
  await expect(page.getByText('Free under MIT')).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByText('free, open-source software under the MIT License')).toBeVisible();
});

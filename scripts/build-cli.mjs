import { mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

await mkdir(new URL('../dist/bin', import.meta.url), { recursive: true });
const output = process.platform === 'win32' ? 'dist/bin/gh-account-autoswitch.exe' : 'dist/bin/gh-account-autoswitch';
const result = spawnSync('go', ['build', '-trimpath', '-ldflags=-s -w', '-o', output, './cmd/gh-account-autoswitch'], {
  stdio: 'inherit'
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

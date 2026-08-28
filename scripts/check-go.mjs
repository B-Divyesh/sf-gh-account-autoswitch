import { spawnSync } from 'node:child_process';

const result = spawnSync('go', ['version'], { encoding: 'utf8' });
if (result.error || result.status !== 0) {
  console.error('Go 1.22+ is required for the CLI tests. Install Go from https://go.dev/dl/ and run npm test again.');
  process.exit(1);
}
const match = `${result.stdout}${result.stderr}`.match(/go(\d+)\.(\d+)/);
if (!match || Number(match[1]) < 1 || (Number(match[1]) === 1 && Number(match[2]) < 22)) {
  console.error(`Go 1.22+ is required; found ${result.stdout.trim() || 'an unknown version'}.`);
  process.exit(1);
}

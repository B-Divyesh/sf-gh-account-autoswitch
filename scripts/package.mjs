import { copyFile, mkdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const version = '0.1.0';
const targets = [
  ['linux', 'amd64'], ['linux', 'arm64'], ['darwin', 'amd64'], ['darwin', 'arm64'], ['windows', 'amd64']
];
await rm('dist/release', { recursive: true, force: true });
await mkdir('dist/release', { recursive: true });
for (const [goos, goarch] of targets) {
  const name = `gh-account-autoswitch_${version}_${goos}_${goarch}`;
  const stage = `dist/release/${name}`;
  const binary = goos === 'windows' ? 'gh-account-autoswitch.exe' : 'gh-account-autoswitch';
  await mkdir(stage, { recursive: true });
  const build = spawnSync('go', ['build', '-trimpath', '-ldflags=-s -w', '-o', `${stage}/${binary}`, './cmd/gh-account-autoswitch'], {
    stdio: 'inherit', env: { ...process.env, GOOS: goos, GOARCH: goarch, CGO_ENABLED: '0' }
  });
  if (build.status !== 0) process.exit(build.status ?? 1);
  await Promise.all([copyFile('README.md', `${stage}/README.md`), copyFile('LICENSE', `${stage}/LICENSE`)]);
  const pack = goos === 'windows'
    ? spawnSync('zip', ['-qr', `../${name}.zip`, '.'], { cwd: stage, stdio: 'inherit' })
    : spawnSync('tar', ['-czf', `${name}.tar.gz`, '-C', name, '.'], { cwd: 'dist/release', stdio: 'inherit' });
  if (pack.error) throw pack.error;
  if (pack.status !== 0) process.exit(pack.status ?? 1);
  await rm(stage, { recursive: true, force: true });
}

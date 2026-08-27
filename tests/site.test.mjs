import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const root = new URL('../dist/site/', import.meta.url);

test('built pages have required accessible structure', async () => {
  for (const page of ['index.html', 'privacy/index.html', 'terms/index.html']) {
    const html = await readFile(new URL(page, root), 'utf8');
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.equal((html.match(/<main(?:\s|>)/g) || []).length, 1, `${page}: one main`);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${page}: one h1`);
    assert.match(html, /class="skip-link"/);
  }
});

test('hero images are explicit, local, and within budget', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  assert.match(html, /<img[^>]+width="1536"[^>]+height="1024"[^>]+alt="[^"]+"/);
  const images = [...html.matchAll(/assets\/(route-landscape(?:-mobile)?-[\w-]+\.webp)/g)].map(match => `assets/${match[1]}`);
  assert.equal(new Set(images).size, 2, 'hero images are fingerprinted by Vite');
  for (const image of new Set(images)) {
    const info = await stat(new URL(image, root));
    assert.ok(info.size <= 300 * 1024, `${image} is ${info.size} bytes`);
  }
});

test('initial scripts and styles stay within budgets', async () => {
  const assets = new URL('assets/', root);
  const { readdir } = await import('node:fs/promises');
  let js = 0, css = 0;
  for (const file of await readdir(assets)) {
    const size = (await stat(new URL(file, assets))).size;
    if (file.endsWith('.js')) js += size;
    if (file.endsWith('.css')) css += size;
  }
  assert.ok(js <= 200 * 1024, `JS is ${js} bytes`);
  assert.ok(css <= 50 * 1024, `CSS is ${css} bytes`);
});

test('site has no third-party runtime resources', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  assert.doesNotMatch(html, /<(script|img|source)[^>]+(?:src|srcset)="https?:\/\//i);
  assert.doesNotMatch(html, /<link[^>]+rel="stylesheet"[^>]+href="https?:\/\//i);
});

test('Static Web Apps policy keeps HTML and the worker revalidating while immutable assets cache for a year', async () => {
  const config = JSON.parse(await readFile(new URL('staticwebapp.config.json', root), 'utf8'));
  assert.equal(config.globalHeaders['Cache-Control'], 'public, max-age=0, must-revalidate');
  assert.equal(config.globalHeaders['Strict-Transport-Security'], 'max-age=63072000; includeSubDomains; preload');
  assert.match(config.globalHeaders['Content-Security-Policy'], /frame-ancestors 'none'/);
  assert.equal(config.globalHeaders['X-Frame-Options'], 'DENY');
  assert.match(config.globalHeaders['Permissions-Policy'], /camera=\(\)/);
  assert.deepEqual(config.routes, [{ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } }]);
});

test('release worker has a content-derived cache and waits for explicit client activation', async () => {
  const worker = await readFile(new URL('sw.js', root), 'utf8');
  assert.doesNotMatch(worker, /__CACHE_NAME__|__PRECACHE__/);
  assert.match(worker, /gh-account-autoswitch-[\w.-]+-[a-f0-9]{12}/);
  assert.match(worker, /self\.clients\.claim\(\)/);
  const listeners = new Map();
  let skipWaitingCalls = 0;
  const self = {
    addEventListener: (name, callback) => listeners.set(name, callback),
    skipWaiting: () => { skipWaitingCalls += 1; },
    location: { origin: 'https://docs.test' },
    clients: { matchAll: async () => [] }
  };
  vm.runInNewContext(worker, { self, caches: {}, URL, fetch: () => {} });
  assert.equal(skipWaitingCalls, 0, 'install does not replace a controlled shell');
  listeners.get('message')({ data: { type: 'SKIP_WAITING' } });
  assert.equal(skipWaitingCalls, 1, 'the update action explicitly activates the waiting worker');
});

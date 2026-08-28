import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { test } from 'node:test';
import vm from 'node:vm';

const root = new URL('../dist/site/', import.meta.url);
const pages = ['index.html', 'demo/index.html', 'privacy/index.html', 'terms/index.html', '404.html'];

test('every declared claim has exactly one tagged test', async () => {
  const claims = JSON.parse(await readFile(new URL('../.factory/claims.json', import.meta.url), 'utf8'));
  const claimTests = await readFile(new URL('claims.spec.ts', import.meta.url), 'utf8');
  assert.equal(new Set(claims.map(claim => claim.id)).size, claims.length, 'claim IDs are unique');
  for (const claim of claims) {
    const tag = `@claim:${claim.id}`;
    assert.equal(claimTests.split(tag).length - 1, 1, `${tag} appears exactly once`);
    assert.equal(claim.test, `npm run test:claims -- --grep ${tag}`);
  }
});

test('built routes have one accessible document skeleton', async () => {
  for (const page of pages) {
    const html = await readFile(new URL(page, root), 'utf8');
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.equal((html.match(/<main(?:\s|>)/g) || []).length, 1, `${page}: one main`);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${page}: one h1`);
    assert.match(html, /class="skip-link"/);
    assert.match(html, /<header class="site-header">/);
    assert.match(html, /<footer class="site-footer">/);
    assert.match(html, /Built by Param Factory · v0\.1\.0/);
  }
});

test('every route has complete local metadata', async () => {
  for (const page of pages) {
    const html = await readFile(new URL(page, root), 'utf8');
    assert.match(html, /<meta name="description" content="[^"]+">/);
    assert.match(html, /<link rel="canonical" href="https:\/\/gh-account-autoswitch\.sociobot\.in\/[^"]*">/);
    assert.match(html, /<meta property="og:title" content="[^"]+">/);
    assert.match(html, /<meta property="og:url" content="https:\/\/gh-account-autoswitch\.sociobot\.in\/[^"]*">/);
    assert.match(html, /<meta property="og:image" content="https:\/\/gh-account-autoswitch\.sociobot\.in\/social-card\.png">/);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
    assert.match(html, /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png">/);
  }
  assert.equal((await stat(new URL('social-card.png', root))).size > 0, true);
  assert.equal((await stat(new URL('apple-touch-icon.png', root))).size > 0, true);
});

test('hero images are explicit, local, and within budget', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  assert.match(html, /<img[^>]+width="1536"[^>]+height="1024"[^>]+alt="[^"]+"/);
  const images = [...html.matchAll(/assets\/(route-landscape(?:-mobile)?-[\w-]+\.webp)/g)].map(match => `assets/${match[1]}`);
  assert.equal(new Set(images).size, 2);
  for (const image of new Set(images)) assert.ok((await stat(new URL(image, root))).size <= 300 * 1024, image);
});

test('initial scripts and styles stay within budgets', async () => {
  let js = 0, css = 0;
  for (const file of await readdir(new URL('assets/', root))) {
    const size = (await stat(new URL(`assets/${file}`, root))).size;
    if (file.endsWith('.js')) js += size;
    if (file.endsWith('.css')) css += size;
  }
  assert.ok(js <= 200 * 1024, `JS is ${js} bytes`);
  assert.ok(css <= 50 * 1024, `CSS is ${css} bytes`);
});

test('site has no third-party runtime resources', async () => {
  for (const page of pages) {
    const html = await readFile(new URL(page, root), 'utf8');
    assert.doesNotMatch(html, /<(script|img|source)[^>]+(?:src|srcset)="https?:\/\//i);
    assert.doesNotMatch(html, /<link[^>]+rel="stylesheet"[^>]+href="https?:\/\//i);
  }
});

test('routing owns demo, legal paths, and 404 responses', async () => {
  const config = JSON.parse(await readFile(new URL('staticwebapp.config.json', root), 'utf8'));
  assert.deepEqual(config.responseOverrides['404'], { rewrite: '/404.html', statusCode: 404 });
  assert.ok(config.routes.some(route => route.route === '/demo' && route.rewrite === '/demo/index.html'));
  const sitemap = await readFile(new URL('sitemap.xml', root), 'utf8');
  assert.match(sitemap, /\/demo\//);
});

test('security policy and immutable asset cache are configured', async () => {
  const config = JSON.parse(await readFile(new URL('staticwebapp.config.json', root), 'utf8'));
  assert.equal(config.globalHeaders['Cache-Control'], 'public, max-age=0, must-revalidate');
  assert.match(config.globalHeaders['Content-Security-Policy'], /frame-ancestors 'none'/);
  assert.equal(config.globalHeaders['X-Frame-Options'], 'DENY');
  assert.ok(config.routes.some(route => route.route === '/assets/*' && route.headers['Cache-Control'].includes('immutable')));
});

test('release worker precaches every first-party route and waits for activation', async () => {
  const worker = await readFile(new URL('sw.js', root), 'utf8');
  assert.doesNotMatch(worker, /__CACHE_NAME__|__PRECACHE__/);
  for (const route of ['/demo/', '/privacy/', '/terms/', '/404.html']) assert.match(worker, new RegExp(route.replaceAll('/', '\\/')));
  const listeners = new Map();
  let skipWaitingCalls = 0;
  const self = { addEventListener: (name, callback) => listeners.set(name, callback), skipWaiting: () => { skipWaitingCalls += 1; }, location: { origin: 'https://docs.test' }, clients: { matchAll: async () => [] } };
  vm.runInNewContext(worker, { self, caches: {}, URL, fetch: () => {} });
  assert.equal(skipWaitingCalls, 0);
  listeners.get('message')({ data: { type: 'SKIP_WAITING' } });
  assert.equal(skipWaitingCalls, 1);
});

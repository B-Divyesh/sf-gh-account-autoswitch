import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { test } from 'node:test';

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
  for (const image of ['assets/route-landscape.webp', 'assets/route-landscape-mobile.webp']) {
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
  assert.match(await readFile(new URL('sw.js', root), 'utf8'), /gh-account-autoswitch-v1/);
});

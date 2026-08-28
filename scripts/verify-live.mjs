import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = new URL(process.env.VERIFY_URL || 'https://gh-account-autoswitch.sociobot.in');
const expected = new Map([
  ['/', ['gh-account-autoswitch — choose an account per repository', 200]],
  ['/demo/', ['Demo — gh-account-autoswitch', 200]],
  ['/privacy/', ['Privacy — gh-account-autoswitch', 200]],
  ['/terms/', ['Terms — gh-account-autoswitch', 200]],
  ['/no-such-page', ['Page not found — gh-account-autoswitch', 404]]
]);

const browser = await chromium.launch();
const results = [];

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  for (const [route, [title, status]] of expected) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    const origins = new Set();
    page.on('console', message => {
      if (message.type() === 'error' && !/Failed to load resource: the server responded with a status of 404/.test(message.text())) errors.push(message.text());
    });
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => origins.add(new URL(request.url()).origin));
    const response = await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), status, `${route} status`);
    assert.equal(await page.title(), title, `${route} title`);
    assert.equal(await page.locator('html').getAttribute('lang'), 'en', `${route} language`);
    assert.equal(await page.locator('main').count(), 1, `${route} main`);
    assert.equal(await page.locator('h1').count(), 1, `${route} h1`);
    assert.deepEqual(errors, [], `${route} console`);
    assert.deepEqual([...origins], [base.origin], `${route} request origins`);
    const width = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    assert.equal(width[0], width[1], `${route} ${viewport.width}px overflow`);
    if (viewport.width === 390) {
      const controls = await page.locator('a, button, input, select').evaluateAll(elements => elements
        .filter(element => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
        })
        .map(element => {
          const rect = element.getBoundingClientRect();
          return { label: (element.getAttribute('aria-label') || element.textContent || element.tagName).trim(), width: rect.width, height: rect.height };
        }));
      for (const control of controls) {
        assert.ok(control.width >= 44, `${route} ${control.label} width`);
        assert.ok(control.height >= 44, `${route} ${control.label} height`);
      }
    }
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    assert.deepEqual(axe.violations.filter(item => ['serious', 'critical'].includes(item.impact || '')), [], `${route} axe`);
    results.push({ route, viewport: viewport.width, status, axeSeriousCritical: 0, consoleErrors: 0 });
    await context.close();
  }
}

const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const demoOrigins = new Set();
page.on('request', request => demoOrigins.add(new URL(request.url()).origin));
await page.goto(new URL('/?demo=1', base).href, { waitUntil: 'networkidle' });
assert.match(page.url(), /\/demo\/$/, 'query entry reaches demo route');
assert.equal(await page.getByText('Demo — sample data, nothing is saved').isVisible(), true, 'demo banner');
assert.equal(await page.getByRole('row').count(), 5, 'sample rows');
assert.ok(await page.locator('[data-demo-row="work"]').evaluate(element => element.getBoundingClientRect().bottom) <= 844, 'first mobile sample row is above the fold');
await page.getByRole('button', { name: 'Replay recording' }).click();
await page.getByRole('button', { name: 'Reset demo' }).click();
assert.equal(await page.getByRole('button', { name: 'Replay recording' }).isVisible(), true, 'reset restores replay state');
assert.equal(await page.locator('h1').evaluate(element => element === document.activeElement), true, 'reset focuses heading');
assert.deepEqual(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })), { local: 0, session: 0 }, 'demo storage');
assert.deepEqual([...demoOrigins], [base.origin], 'demo request origins');
await page.getByRole('link', { name: 'Start for real' }).click();
assert.match(page.url(), /\/#install$/, 'Start for real leaves demo for install section');
results.push({ route: '/?demo=1', viewport: 390, banner: true, reset: true, isolatedStorage: true, startForReal: true });
await context.close();

for (const route of ['/', '/demo/', '/privacy/', '/terms/', '/no-such-page']) {
  const response = await fetch(new URL(route, base));
  assert.match(response.headers.get('content-security-policy') || '', /frame-ancestors 'none'/, `${route} CSP`);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff', `${route} nosniff`);
}

await browser.close();
console.log(JSON.stringify({ base: base.origin, checks: results.length, results }, null, 2));

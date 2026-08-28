import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('all routes render without console errors and pass serious accessibility checks', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/', '/demo/', '/privacy/', '/terms/']) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await expect.poll(async () => {
      try { return await page.evaluate(() => Boolean(navigator.serviceWorker.controller)); } catch { return false; }
    }).toBe(true);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(result.violations.filter(item => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('query demo entry is one click and reset stays isolated', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).first().click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(5);
  await page.getByRole('button', { name: 'Replay recording' }).click();
  await expect(page.getByRole('button', { name: 'Recording replayed' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.getByRole('link', { name: 'Start for real' })).toHaveAttribute('href', '/#install');
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  await page.goto('/?demo=1');
  await expect(page).toHaveURL(/\/demo\/$/);
});

test('unknown paths use the product 404', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — gh-account-autoswitch');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist');
  await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(result.violations.filter(item => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  expect(errors.filter(message => !/Failed to load resource: the server responded with a status of 404/.test(message))).toEqual([]);
});

test('document navigation focuses its heading and browser history remains usable', async ({ page }) => {
  await page.goto('/');
  await page.locator('.nav-links').getByRole('link', { name: 'Privacy' }).click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.locator('h1')).toBeFocused();
});

test('mobile first screen and demo fit without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Choose the right GitHub account per repository');
  await expect(page.getByRole('link', { name: 'Try it with sample data' }).first()).toBeVisible();
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBe(dimensions.client);
  const firstFactsBottom = await page.locator('.trust-list').evaluate(element => element.getBoundingClientRect().bottom);
  expect(firstFactsBottom).toBeLessThanOrEqual(844);
  await page.goto('/demo/');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  const demoDimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(demoDimensions.scroll).toBe(demoDimensions.client);
});

test('keyboard focus and reduced motion are visible and respected', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(async () => {
    try { return await page.evaluate(() => Boolean(navigator.serviceWorker.controller)); } catch { return false; }
  }).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  const focus = await page.locator('.skip-link').evaluate(element => getComputedStyle(element).outlineWidth);
  expect(focus).toBe('3px');
  const motion = await page.locator('.button.primary').first().evaluate(element => ({ transition: getComputedStyle(element).transitionDuration, scroll: getComputedStyle(document.documentElement).scrollBehavior }));
  expect(Number(motion.transition.replace('s', ''))).toBeLessThanOrEqual(0.00001);
  expect(motion.scroll).toBe('auto');
});

test('all same-origin links on every route resolve', async ({ page, request }) => {
  for (const route of ['/', '/demo/', '/privacy/', '/terms/', '/no-such-page']) {
    await page.goto(route);
    const links = await page.locator('a[href]').evaluateAll(elements => elements.map(element => ({ href: (element as HTMLAnchorElement).href, raw: element.getAttribute('href') || '' })));
    for (const { href, raw } of links) {
      if (raw.startsWith('#')) continue;
      const url = new URL(href);
      if (url.origin !== 'http://127.0.0.1:4173') continue;
      const response = await request.get(url.origin + url.pathname);
      expect(response.status(), `${route} -> ${url.pathname}`).toBe(200);
    }
  }
});

import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [], failures = [], consoleErrors = [];
page.on('console', message => { if (message.type() === 'warning' || message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400) failures.push(String(response.status()) + ' ' + response.url()); });
const response = await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
assert.equal(response.status(), 200);
assert.equal(await page.title(), 'Nexora — Software que mueve tu negocio');
assert.equal(await page.locator('h1').isVisible(), true);
assert.equal(await page.locator('#hero-scene').count(), 1);
assert.equal(await page.locator('.tech-section').count(), 0);
assert.equal(await page.locator('#method-scene').count(), 1);
await page.waitForTimeout(1400);
assert.deepEqual(errors, []);
assert.equal(await page.locator('.hero-stage').getAttribute('data-core-state'), 'ready');
assert.equal(await page.locator('.method-visual').getAttribute('data-core-state'), 'ready');
await page.getByRole('button', { name: 'Explorar núcleo' }).click();
assert.equal(await page.getByRole('button', { name: 'Unir piezas' }).getAttribute('aria-pressed'), 'true');
await page.getByRole('button', { name: 'Unir piezas' }).click();
await page.getByRole('button', { name: 'Pausar', exact: true }).click();
assert.equal(await page.getByRole('button', { name: 'Reanudar' }).getAttribute('aria-pressed'), 'true');
await page.getByRole('button', { name: 'Reanudar' }).click();
assert.equal(await page.locator('video').count(), 3);
await page.screenshot({ path: 'artifacts/nexora-desktop.png', fullPage: false });

await page.locator('[data-filter="video"]').click();
assert.equal(await page.locator('.project-card:not([hidden])').count(), 3);
await page.locator('[data-filter="dashboard"]').click();
assert.equal(await page.locator('.project-card:not([hidden])').count(), 1);
await page.locator('[data-filter="all"]').click();
assert.equal(await page.locator('.project-card:not([hidden])').count(), 4);
await page.locator('#contact-form input[name=name]').fill('David');
await page.locator('#contact-form input[name=email]').fill('david@example.com');
await page.locator('#contact-form textarea').fill('Quiero hablar sobre una plataforma.');
await page.locator('#contact-form button[type=submit]').click();
assert.equal(await page.locator('#form-success').isVisible(), true);

for (const width of [320, 390, 680, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(120);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Horizontal overflow at ' + width + 'px');
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.locator('.menu-button').click();
assert.equal(await page.locator('#mobile-nav').isVisible(), true);
await page.locator('#mobile-nav a[href="#proyectos"]').click();
assert.equal(await page.locator('#mobile-nav').isVisible(), false);
await page.waitForTimeout(400);
await page.screenshot({ path: 'artifacts/nexora-mobile.png', fullPage: true });

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(500);
const brokenImages = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src));
assert.deepEqual(brokenImages, []);
assert.deepEqual(errors, []);
assert.deepEqual(failures, []);
const report = { passed: true, checks: ['HTTP 200', '3D canvas', 'project filters', 'contact form', 'mobile navigation', 'responsive overflow', 'all local images', 'zero JavaScript errors', 'zero failed resources'] };
await writeFile('artifacts/qa-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();








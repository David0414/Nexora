import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [], warnings = [], failed = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', msg => { if (msg.type() === 'warning') warnings.push(msg.text()); if (msg.type() === 'error') errors.push(msg.text()); });
page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
const settleScroll = async top => { await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), top); await page.waitForTimeout(1250); };
try {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1700);
  const status = await page.locator('html').getAttribute('data-motion');
  console.log(JSON.stringify({ status, warnings, errors }));
  assert.equal(status, 'ready');
  const motionWords = await page.locator('.motion-word').count();
  assert.equal(motionWords, 6);
  await page.screenshot({ path: 'artifacts/motion-hero.png' });
  const originalTransform = await page.locator('.hero-content').evaluate(el => getComputedStyle(el).transform);
  await settleScroll(400);
  assert.notEqual(await page.locator('.hero-content').evaluate(el => getComputedStyle(el).transform), originalTransform);
  assert.notEqual(await page.locator('.scroll-progress').evaluate(el => getComputedStyle(el).transform), 'matrix(0, 0, 0, 1, 0, 0)');

  await page.locator('.crowd-panel').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  await page.waitForFunction(() => document.querySelector('#audience-3d').dataset.state === 'ready', { timeout: 20000 });
  await page.locator('.crowd-panel').screenshot({ path: 'artifacts/motion-3d.png' });
  await page.locator('[data-audience="feeds"]').click();
  await page.waitForTimeout(1000);
  await page.locator('.crowd-panel').screenshot({ path: 'artifacts/motion-3d-feeds.png' });

  // Scroll from the first to the last funnel stage while the section remains pinned.
  const range = await page.evaluate(() => { const t = window.ScrollTrigger.getById('process-pin'); return { start: t.start, end: t.end }; });
  await settleScroll(range.start + 20);
  assert.equal(await page.locator('[data-step="0"]').getAttribute('aria-selected'), 'true');
  const firstTop = await page.locator('.process-layout').evaluate(el => el.getBoundingClientRect().top);
  await page.screenshot({ path: 'artifacts/motion-process-start.png' });
  await settleScroll(range.start + (range.end - range.start) * .8);
  assert.equal(await page.locator('[data-step="3"]').getAttribute('aria-selected'), 'true');
  const lastTop = await page.locator('.process-layout').evaluate(el => el.getBoundingClientRect().top);
  assert.ok(Math.abs(firstTop - lastTop) < 3, 'Pinned stage must stay in the same viewport position.');
  await page.screenshot({ path: 'artifacts/motion-process-end.png' });
  await settleScroll(range.end + 1200);

  await page.locator('.price-card.featured').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const card = page.locator('.price-card.featured');
  const rect = await card.boundingBox();
  const beforeTilt = await card.evaluate(el => getComputedStyle(el).transform);
  await page.mouse.move(rect.x + rect.width * .83, rect.y + rect.height * .27);
  await page.waitForTimeout(800);
  assert.notEqual(await card.evaluate(el => getComputedStyle(el).transform), beforeTilt);
  await page.screenshot({ path: 'artifacts/motion-cards.png' });

  // No pinned scrolling or cropped hero title on a narrow touch screen.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1400);
  assert.equal(await page.evaluate(() => !!window.ScrollTrigger.getById('process-pin')), false);
  const titleBounds = await page.locator('#hero-title').boundingBox();
  assert.ok(titleBounds.x >= 0 && titleBounds.x + titleBounds.width <= 391);
  await page.screenshot({ path: 'artifacts/motion-mobile.png' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);

  // Reduced motion and unavailable WebGL both keep the page usable.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('data-motion'), 'reduced');
  assert.equal(await page.locator('#audience-3d canvas').count(), 0);
  assert.equal(await page.evaluate(() => window.ScrollTrigger.getAll().length), 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) { if (type.startsWith('webgl')) return null; return original.call(this, type, ...args); };
  });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.locator('.crowd-panel').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('#audience-3d').getAttribute('data-state'), 'fallback');
  assert.equal(await page.locator('#crowd-canvas').evaluate(el => getComputedStyle(el).opacity), '1');
  assert.deepEqual(errors, []);
  assert.deepEqual(failed, []);
  const report = { passed: true, checks: ['GSAP and ScrollTrigger start', 'perspective word entrance', 'scroll parallax', 'scroll progress', 'real WebGL audience scene', 'audience channel controls', 'pinned funnel progression', 'pointer-driven 3D card tilt', 'mobile layout', 'mobile pin disabled', 'reduced motion', 'WebGL fallback', 'no failed resources', 'no JS or WebGL errors'], warnings };
  await writeFile('artifacts/qa-motion-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }

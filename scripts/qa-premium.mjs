import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [], failures = [], checks = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
const scroll = async y => { await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y); await page.waitForTimeout(1100); };
try {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);
  assert.equal(await page.locator('html').evaluate(el => el.classList.contains('premium-ready')), true);
  await page.screenshot({ path: 'artifacts/premium-hero.png' });
  await page.locator('.hero-hint').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.campaign-note').count(), 1);
  checks.push('Keyboard-accessible campaign pulse');

  await page.locator('.desktop-explore').click();
  await page.waitForTimeout(850);
  assert.equal(await page.locator('#explore-menu').isVisible(), true);
  await page.screenshot({ path: 'artifacts/premium-menu.png' });
  await page.locator('#explore-menu a[href="#services"]').click();
  await page.locator('#explore-menu').waitFor({ state: 'hidden' });
  await page.waitForTimeout(1100);
  assert.equal(new URL(page.url()).hash, '#services');
  checks.push('Fullscreen menu and navigation');

  for (const index of [1, 5, 2, 4]) await page.locator(`[data-service="${index}"]`).click();
  await page.waitForTimeout(1100);
  assert.equal(await page.locator('#service-title').textContent(), 'Sites that turn visits into calls.');
  assert.equal(await page.locator('.service-outgoing').count(), 0);
  assert.equal(await page.locator('#service-panel [id]').evaluateAll(elements => new Set(elements.map(el => el.id)).size === elements.length), true);
  await page.locator('#service-panel').screenshot({ path: 'artifacts/premium-service.png' });
  checks.push('Rapid service changes and cleaned transition snapshots');

  await page.locator('.crowd-panel').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#audience-3d').dataset.state === 'ready');
  await page.locator('[data-scene-mode="network"]').click();
  await page.waitForFunction(() => document.querySelector('#audience-3d').dataset.morph === '1.00');
  assert.equal(await page.locator('[data-scene-mode="network"]').getAttribute('aria-pressed'), 'true');
  await page.locator('.crowd-panel').screenshot({ path: 'artifacts/premium-network.png' });
  await page.locator('[data-scene-mode="crowd"]').click();
  await page.waitForFunction(() => document.querySelector('#audience-3d').dataset.morph === '0.00');
  checks.push('Real 3D crowd-to-globe transformation and return');

  await page.locator('.report-chart').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  const chart = await page.locator('.report-chart').boundingBox();
  await page.mouse.move(chart.x + chart.width * .6, chart.y + chart.height * .5);
  await page.waitForTimeout(300);
  assert.match(await page.locator('.report-tooltip').textContent(), /2025 · SAMPLE/);
  assert.ok(Number(await page.locator('.report-tooltip').evaluate(el => getComputedStyle(el).opacity)) > .9);
  await page.locator('.report').screenshot({ path: 'artifacts/premium-report.png' });
  checks.push('Interactive graph crosshair and month tooltip');

  const gallery = await page.evaluate(() => { const trigger = window.ScrollTrigger.getById('gallery-pin'); return { start: trigger.start, end: trigger.end }; });
  await scroll(gallery.start + 10);
  const first = await page.locator('.social-grid').evaluate(el => el.scrollLeft);
  await scroll(gallery.start + (gallery.end - gallery.start) * .75);
  const last = await page.locator('.social-grid').evaluate(el => el.scrollLeft);
  assert.ok(last > first + 250);
  await page.screenshot({ path: 'artifacts/premium-gallery.png' });
  await scroll(gallery.start + 5);
  await page.locator('.gallery-next').click();
  await page.waitForTimeout(1500);
  assert.ok(await page.locator('.social-grid').evaluate(el => el.scrollLeft) > 100);
  await scroll(gallery.start + 5);
  const track = await page.locator('.social-grid').boundingBox();
  await page.mouse.move(track.x + 450, track.y + 170);
  await page.mouse.down(); await page.mouse.move(track.x + 180, track.y + 170, { steps: 12 }); await page.mouse.up();
  await page.waitForTimeout(1000);
  assert.ok(await page.locator('.social-grid').evaluate(el => el.scrollLeft) > 100);
  assert.equal(await page.locator('.social-grid.is-dragging').count(), 0);
  checks.push('Pinned horizontal gallery, arrow navigation and pointer dragging');

  const detail = page.locator('#faq-list details').nth(1);
  await detail.locator('summary').click(); await page.waitForTimeout(600);
  assert.equal(await detail.getAttribute('open'), '');
  await detail.locator('summary').click(); await page.waitForTimeout(500);
  assert.equal(await detail.getAttribute('open'), null);
  await detail.locator('summary').click(); await detail.locator('summary').click(); await detail.locator('summary').click(); await page.waitForTimeout(650);
  assert.equal(await detail.getAttribute('open'), '');
  checks.push('Accordion opening, closing and rapid reversal');

  await page.locator('[data-open="seo-article"]').click(); await page.waitForTimeout(750);
  assert.equal(await page.locator('#detail-dialog').isVisible(), true);
  await page.keyboard.press('Escape'); await page.locator('#detail-dialog').waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  checks.push('Animated modal exit and restored scrolling');

  await page.locator('.chapter-dock a[href="#pricing"]').click();
  await page.waitForTimeout(1000);
  assert.equal(new URL(page.url()).hash, '#pricing');
  assert.equal(await page.locator('.page-wipe').evaluate(el => getComputedStyle(el).pointerEvents), 'none');
  checks.push('Chapter navigation with complete page wipe');

  for (const width of [320, 390, 680, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 }); await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Horizontal overflow at ${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' }); await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  assert.equal(await page.locator('.desktop-explore').isVisible(), false);
  assert.equal(await page.evaluate(() => !!window.ScrollTrigger.getById('gallery-pin')), false);
  await page.screenshot({ path: 'artifacts/premium-mobile.png' });
  await page.locator('.social-grid').scrollIntoViewIfNeeded(); await page.waitForTimeout(700);
  await page.locator('.gallery-next').click(); await page.waitForTimeout(700);
  assert.ok(await page.locator('.social-grid').evaluate(el => el.scrollLeft) > 100);
  await page.screenshot({ path: 'artifacts/premium-mobile-gallery.png' });
  checks.push('Responsive widths and unpinned mobile gallery');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('data-motion'), 'reduced');
  assert.equal(await page.locator('.page-wipe,.cursor-orbit,.scene-mode-switch').count(), 0);
  checks.push('Reduced-motion fallback');
  assert.deepEqual(errors, []); assert.deepEqual(failures, []);
  const report = { passed: true, checks, jsErrors: errors, failedResources: failures };
  await writeFile('artifacts/qa-premium-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }

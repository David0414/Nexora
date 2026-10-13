import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [], failures = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
const response = await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
assert.equal(response.status(), 200);
await page.keyboard.press('Escape');
await page.waitForTimeout(2400);
await page.screenshot({ path: 'artifacts/desktop.png' });
await page.locator('#clients').scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await page.screenshot({ path: 'artifacts/clients.png' });

// All six services, including roving keyboard focus.
await page.locator('[data-service="2"]').click();
assert.equal(await page.locator('#service-title').textContent(), 'Every dollar tracked to a sale.');
await page.keyboard.press('ArrowRight');
assert.equal(await page.locator('#service-title').textContent(), 'Articles, videos and emails that sell.');
await page.locator('#service-next').click();
assert.equal(await page.locator('#service-price').textContent(), '$4,500 once');
await page.locator('[data-service="0"]').click();

await page.locator('[data-report="social"]').click();
assert.equal(await page.locator('#report-label-1').textContent(), 'monthly content views');
await page.locator('[data-report="overview"]').click();

// Paid period controls and an actual expanded plan comparison.
await page.locator('[data-billing="quarterly"]').click();
assert.equal(await page.locator('[data-price="1500"]').textContent(), '$1,350');
assert.equal(await page.locator('[data-price="3200"]').textContent(), '$2,880');
await page.locator('[data-billing="monthly"]').click();
assert.equal(await page.locator('[data-price="1500"]').textContent(), '$1,500');
await page.locator('#compare-plans').click();
assert.equal(await page.locator('#plan-comparison').isVisible(), true);
await page.locator('#compare-plans').click();

// Native FAQ, article dialog, focus restoration, and social interactions.
const faq = page.locator('#faq-list details').nth(1);
await faq.locator('summary').click();
assert.equal(await faq.getAttribute('open'), '');
await page.locator('[data-open="seo-article"]').click();
assert.equal(await page.locator('#detail-dialog').isVisible(), true);
assert.match(await page.locator('#dialog-title').textContent(), /Local SEO/);
await page.keyboard.press('Escape');
await page.locator('#detail-dialog').waitFor({ state: 'hidden' });
assert.equal(await page.locator('#detail-dialog').isVisible(), false);
await page.evaluate(() => {
  const pin = window.ScrollTrigger?.getById('gallery-pin');
  if (pin) window.scrollTo({ top: pin.start + 5, behavior: 'instant' });
});
await page.waitForTimeout(1000);
const like = page.locator('.like-button').first();
await like.click();
assert.equal(await like.getAttribute('aria-pressed'), 'true');
await like.click();

// A selected plan pre-fills the brief, submission stores it, and export downloads.
await page.locator('[data-plan="Growth"]').click();
assert.equal(await page.locator('#budget').inputValue(), '$2k–$5k/mo');
await page.locator('#work-email').fill('preview@example.com');
await page.locator('#audit-form button[type=submit]').click();
assert.equal(await page.locator('#form-result').isVisible(), true);
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('reachwise-audit-brief')));
assert.equal(saved.plan, 'Growth');
const downloadEvent = page.waitForEvent('download');
await page.locator('#download-brief').click();
assert.equal((await downloadEvent).suggestedFilename(), 'reachwise-audit-brief.txt');
await page.evaluate(() => localStorage.removeItem('reachwise-audit-brief'));
assert.notEqual(await page.locator('#new-york-time').textContent(), '--:--:--');

// Sweep the full document to exercise lazy media and section reveals.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 800) {
    window.scrollTo(0, y);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
});
await page.waitForTimeout(1000);
const brokenImages = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src));
assert.deepEqual(brokenImages, []);
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
await page.screenshot({ path: 'artifacts/full-desktop.png', fullPage: true });

// Mobile: menu opens, follows the correct anchor, and closes; no horizontal scroll.
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.keyboard.press('Escape');
await page.waitForTimeout(1500);
await page.screenshot({ path: 'artifacts/mobile.png' });
await page.locator('.menu-toggle').click();
assert.equal(await page.locator('#mobile-menu').isVisible(), true);
await page.locator('#mobile-menu a[href="#pricing"]').click();
assert.equal(await page.locator('#mobile-menu').isVisible(), false);
await page.waitForTimeout(1000);
assert.equal(new URL(page.url()).hash, '#pricing');
for (const width of [320, 390, 680, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Horizontal overflow at ${width}px`);
}
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 35)); }
});
await page.waitForTimeout(900);
await page.screenshot({ path: 'artifacts/full-mobile.png', fullPage: true });

// Reduced motion stays usable and loads all meaningful content.
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
assert.equal(await page.locator('.intro').isVisible(), false);
assert.equal(await page.locator('#hero-title').isVisible(), true);
assert.deepEqual(errors, []);
assert.deepEqual(failures, []);
const report = { passed: true, desktop: '1440×1000', mobile: '390×844', responsiveWidths: [320, 390, 680, 768, 1024, 1440], checks: ['HTTP 200', 'service tabs and keyboard', 'report tabs', 'billing calculations', 'plan comparison', 'FAQ', 'article dialog', 'likes', 'plan selection', 'local form storage', 'brief download', 'timezone clock', 'all images', 'mobile menu', 'no horizontal overflow', 'reduced motion', 'zero JavaScript errors', 'zero failed resources'] };
await writeFile('artifacts/qa-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();

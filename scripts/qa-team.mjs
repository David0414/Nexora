import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
await mkdir('artifacts', { recursive: true });
const page = await browser.newPage({ viewport: { width: 1362, height: 870 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const baseURL = process.env.TEST_URL || 'http://localhost:5174';
async function state(label) {
 const cards = await page.locator('.team-card').evaluateAll(elements => elements.map(el => ({ opacity: Number(getComputedStyle(el).opacity), imageLoaded: el.querySelector('img').naturalWidth > 0 })));
 assert.equal(cards.length, 6, label);
 assert.ok(cards.every(card => card.opacity > .99 && card.imageLoaded), `${label}: all six portraits must stay visible after their entrance.`);
 console.log(`${label}: all six portraits visible and loaded`);
}
try {
 await page.goto(baseURL, { waitUntil: 'networkidle' }); await page.keyboard.press('Escape');
 await page.evaluate(() => window.scrollTo({ top: document.querySelector('#team').getBoundingClientRect().top + scrollY + 160, behavior: 'instant' }));
 await page.waitForTimeout(1800); await state('desktop-team'); await page.screenshot({ path: 'artifacts/team-fixed.png' });
 await page.setViewportSize({ width: 908, height: 580 });
 await page.waitForTimeout(600);
 await page.evaluate(() => window.scrollTo({ top: document.querySelector('#team').getBoundingClientRect().top + scrollY + 160, behavior: 'instant' }));
 await page.waitForTimeout(1600); await state('zoom-team'); await page.screenshot({ path: 'artifacts/team-fixed-zoom.png' });
 await page.goto(`${baseURL}/#team`, { waitUntil: 'networkidle' }); await page.keyboard.press('Escape');
 await page.waitForTimeout(1500); await state('direct-anchor');
 await page.setViewportSize({ width: 390, height: 844 });
 await page.goto(`${baseURL}/#team`, { waitUntil: 'networkidle' }); await page.keyboard.press('Escape');
 await page.waitForTimeout(1700); await state('mobile-team');
 await page.locator('.team-card').first().scrollIntoViewIfNeeded();
 await page.waitForTimeout(500); await page.screenshot({ path: 'artifacts/team-fixed-mobile.png' });
 assert.deepEqual(errors, []);
} finally { await browser.close(); }

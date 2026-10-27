import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL = process.env.TEST_URL || 'http://localhost:5173';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
await mkdir('artifacts', { recursive: true });
const errors = [], failures = [];
const monitor = page => {
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
};
const count = page => page.evaluate(() => window.__coreDraws['hero-scene'] || 0);
const instrument = context => context.addInitScript(() => {
  window.__coreDraws = {};
  for (const name of ['drawElements', 'drawArrays']) {
    const original = WebGL2RenderingContext.prototype[name];
    WebGL2RenderingContext.prototype[name] = function (...args) {
      const id = this.canvas.id;
      window.__coreDraws[id] = (window.__coreDraws[id] || 0) + 1;
      return original.apply(this, args);
    };
  }
});

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await instrument(context);
  const page = await context.newPage();
  monitor(page);
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !document.querySelector('#intro-screen'));
  assert.equal(await page.locator('.hero-stage').getAttribute('data-core-state'), 'ready');
  const activeCount = await count(page);
  await page.waitForTimeout(350);
  assert.ok(await count(page) > activeCount, 'Visible model should animate');
  await page.screenshot({ path: 'artifacts/nexora-core-desktop.png' });

  const bounds = await page.locator('#hero-scene').boundingBox();
  await page.mouse.move(bounds.x + 40, bounds.y + bounds.height / 2);
  await page.waitForTimeout(350);
  const left = await page.locator('#hero-scene').screenshot();
  await page.mouse.move(bounds.x + bounds.width - 40, bounds.y + bounds.height / 2);
  await page.waitForTimeout(350);
  assert.notDeepEqual(await page.locator('#hero-scene').screenshot(), left, 'The scene should respond to the pointer');

  await page.getByRole('button', { name: 'Explorar núcleo' }).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.getByRole('button', { name: 'Unir piezas' }).getAttribute('aria-pressed'), 'true');
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'artifacts/nexora-core-expanded.png' });
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.waitForTimeout(150);
  const pausedCount = await count(page);
  await page.waitForTimeout(350);
  assert.equal(await count(page), pausedCount, 'Pause must stop rendering');
  await page.getByRole('button', { name: 'Reanudar' }).click();
  await page.waitForTimeout(350);
  assert.ok(await count(page) > pausedCount, 'Resume must restart rendering');

  await page.locator('#metodo').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const offscreenCount = await count(page);
  await page.waitForTimeout(300);
  assert.equal(await count(page), offscreenCount, 'Offscreen hero must stop rendering');
  const methodSteps = page.locator('.method-step');
  for (const [index, name] of [[1, 'DISEÑAR'], [3, 'EVOLUCIONAR']]) {
    await methodSteps.nth(index).evaluate(element => window.scrollTo({ top: element.getBoundingClientRect().top + scrollY - innerHeight * .4, behavior: 'instant' }));
    await page.waitForFunction(label => document.querySelector('[data-core-phase]').textContent.includes(label), name);
  }
  const methodBounds = await page.locator('.method-visual').boundingBox();
  assert.ok(methodBounds.y >= 70 && methodBounds.y + methodBounds.height <= 1000, 'Method core must remain visible through the last step');
  await page.screenshot({ path: 'artifacts/nexora-core-method.png' });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(400);
  assert.ok(await count(page) > offscreenCount, 'Hero should restart after returning into view');
  await context.close();

  const staticContext = await browser.newContext({ viewport: { width: 1200, height: 900 }, reducedMotion: 'reduce' });
  await instrument(staticContext);
  const staticPage = await staticContext.newPage();
  monitor(staticPage);
  await staticPage.goto(baseURL, { waitUntil: 'networkidle' });
  assert.equal(await staticPage.locator('#intro-screen').count(), 0);
  assert.equal(await staticPage.locator('[data-core-pause]').isVisible(), false);
  const staticCount = await count(staticPage);
  await staticPage.waitForTimeout(350);
  assert.equal(await count(staticPage), staticCount, 'Reduced motion should render once');
  const assembled = await staticPage.locator('#hero-scene').screenshot();
  await staticPage.getByRole('button', { name: 'Explorar núcleo' }).click();
  const expanded = await staticPage.locator('#hero-scene').screenshot();
  assert.notDeepEqual(expanded, assembled, 'Reduced-motion control must still open the assembly');
  await staticPage.setViewportSize({ width: 1024, height: 800 });
  await staticPage.waitForTimeout(150);
  assert.ok(await count(staticPage) > staticCount, 'Static scene must redraw after resize');
  await staticContext.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const mobilePage = await mobileContext.newPage();
  monitor(mobilePage);
  await mobilePage.goto(baseURL, { waitUntil: 'networkidle' });
  await mobilePage.getByRole('button', { name: 'Explorar núcleo' }).tap();
  assert.equal(await mobilePage.getByRole('button', { name: 'Unir piezas' }).getAttribute('aria-pressed'), 'true');
  await mobilePage.waitForTimeout(650);
  await mobilePage.screenshot({ path: 'artifacts/nexora-core-mobile.png' });
  for (const width of [320, 390, 680]) {
    await mobilePage.setViewportSize({ width, height: 844 });
    assert.equal(await mobilePage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `No overflow at ${width}px`);
  }
  await mobileContext.close();

  const fallbackContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await fallbackContext.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.startsWith('webgl') ? null : getContext.call(this, type, ...args);
    };
  });
  const fallbackPage = await fallbackContext.newPage();
  monitor(fallbackPage);
  await fallbackPage.goto(baseURL, { waitUntil: 'networkidle' });
  assert.equal(await fallbackPage.locator('.hero-stage').getAttribute('data-core-state'), 'fallback');
  assert.equal(await fallbackPage.locator('.core-controls').isVisible(), false);
  assert.match(await fallbackPage.locator('.hero-stage').evaluate(element => getComputedStyle(element, '::before').backgroundImage), /nexora-core\.svg/);
  await fallbackPage.waitForFunction(() => !document.querySelector('#intro-screen'));
  await fallbackPage.screenshot({ path: 'artifacts/nexora-core-fallback.png' });
  await fallbackContext.close();

  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  const report = { passed: true, checks: ['3D render', 'pointer response', 'keyboard exploration', 'pause and resume', 'offscreen suspension', 'scroll assembly', 'reduced motion', 'static resize', 'touch interaction', 'mobile widths', 'WebGL fallback', 'zero page errors', 'zero failed resources'] };
  await writeFile('artifacts/qa-core-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}

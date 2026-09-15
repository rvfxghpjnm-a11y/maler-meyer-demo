const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const url = process.env.DEMO_URL || 'http://127.0.0.1:4175/';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const width of [390, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('[data-action="navigate"][data-view="planning"]:visible').first().click();

      const checkbox = page.locator('.plan-check-grid:not(.days) label').first();
      const labelBox = await checkbox.boundingBox();
      const inputBox = await checkbox.locator('input').boundingBox();
      const nameBox = await checkbox.locator('span').boundingBox();
      assert.ok(labelBox && inputBox && nameBox, 'Auswahl muss sichtbar sein');
      assert.ok(inputBox.width <= 24 && inputBox.height <= 24, `Checkbox bei ${width}px zu groß`);
      assert.ok(inputBox.x + inputBox.width + 2 <= nameBox.x, `Checkbox überlappt Name bei ${width}px`);
      assert.ok(nameBox.x + nameBox.width <= labelBox.x + labelBox.width + 1, `Name ragt bei ${width}px aus Auswahl`);

      const cell = page.locator('.planning-cell[data-employee="M-0001"][data-day="0"]');
      assert.equal((await cell.locator('strong').textContent()).trim(), '26-102');
      assert.ok((await cell.locator('.planning-site-name').textContent()).trim().length > 2, `Baustellenname fehlt bei ${width}px`);
      assert.ok((await cell.getAttribute('title')).includes('26-102'));

      if (width === 390) {
        await checkbox.locator('input').check();
        assert.equal(await checkbox.locator('input').isChecked(), true, 'Mobile Mitarbeiterauswahl muss bedienbar sein');
        await checkbox.scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(os.tmpdir(), 'maler-meyer-planning-layout-390.png') });
      }

      const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(pageWidth <= width + 2, `Seite hat bei ${width}px horizontales Überlaufen: ${pageWidth}px`);
      assert.deepEqual(errors, [], `JavaScript-Fehler bei ${width}px`);
      console.log(`OK Planungslayout ${width}px: Checkbox, Name, Bau-Nr. + Baustelle, kein Seitenüberlauf`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

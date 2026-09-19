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

      const weekSelect = page.locator('form[data-form="plan-batch"] select[name="week"]');
      assert.equal(await weekSelect.inputValue(), '2026-09-07', 'Planungsbox muss die angezeigte KW vorauswählen');
      const optionLabels = await weekSelect.locator('option').allTextContents();
      assert.ok(optionLabels.length >= 5 && optionLabels.every(text => /^KW \d+ \/ \d{4} · \d{2}\.\d{2}\.–\d{2}\.\d{2}\.\d{4}$/.test(text)), 'KW, Jahr und Datumsbereich statt relativer Wochenbegriffe');
      assert.match(await page.locator('.batch-week-context strong').textContent(), /^Aktuelle Kalenderwoche: KW \d+ \/ \d{4}$/);
      assert.match(await page.locator('.batch-week-selected').textContent(), /Ausgewählt: KW 37/);

      if (width === 390) {
        await checkbox.locator('input').check();
        assert.equal(await checkbox.locator('input').isChecked(), true, 'Mobile Mitarbeiterauswahl muss bedienbar sein');
        await checkbox.scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(os.tmpdir(), 'maler-meyer-planning-layout-390.png') });
        await weekSelect.scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(os.tmpdir(), 'maler-meyer-batch-week-390.png') });

        await weekSelect.selectOption('2026-09-14');
        await page.getByRole('heading', { name: 'Kolonne oder mehrere Tage planen · KW 38 / 2026' }).waitFor();
        assert.equal(await page.locator('form[data-form="plan-batch"] select[name="week"]').inputValue(), '2026-09-14');
        assert.equal(await page.locator('form[data-form="plan-batch"] input[name="employee"][value="M-0001"]').isChecked(), true, 'Mitarbeiterwahl bleibt beim KW-Wechsel erhalten');
        assert.match(await page.locator('.batch-week-selected').textContent(), /Ausgewählt: KW 38/);
        await page.getByRole('heading', { name: 'Wochenplanung 2026 · KW 38' }).waitFor();
        await page.locator('form[data-form="plan-batch"] input[name="employee"][value="M-0001"]').check();
        await page.locator('form[data-form="plan-batch"] input[name="day"][value="0"]').check();
        await page.locator('form[data-form="plan-batch"] select[name="value"]').selectOption('26-103');
        await page.locator('form[data-form="plan-batch"] button.primary').click();
        const data = await page.evaluate(() => JSON.parse(localStorage.getItem('maler-meyer-demo-v11')).data);
        assert.equal(data.weekPlans.find(x => x.week === 38).rows.find(x => x.employeeId === 'M-0001').values[0], '26-103');
        assert.notEqual(data.weekPlans.find(x => x.week === 37).rows.find(x => x.employeeId === 'M-0001').values[0], '26-103', 'Andere KW darf nicht verändert werden');
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

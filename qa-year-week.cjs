const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.DEMO_URL || 'http://127.0.0.1:4175/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('[data-action="navigate"][data-view="planning"]:visible').first().click();

    async function create(monday) {
      await page.locator('[data-action="new-plan-week"]').click();
      await page.locator('form[data-form="new-plan-week"] input[name="monday"]').fill(monday);
      await page.locator('form[data-form="new-plan-week"] input[name="monday"]').dispatchEvent('change');
      assert.match(await page.locator('[data-week-preview]').textContent(), /Kalenderwoche: KW \d+ \/ \d{4}/);
      await page.locator('form[data-form="new-plan-week"] button.primary').click();
    }
    await create('2026-12-21'); // KW 52/2026
    await create('2027-01-04'); // KW 1/2027
    await page.getByRole('heading', { name: 'Wochenplanung 2027 · KW 1' }).waitFor();
    await create('2027-12-27'); // KW 52/2027, same week number as 2026

    let state = await page.evaluate(() => JSON.parse(localStorage.getItem('maler-meyer-demo-v11')).data);
    assert.equal(state.weekPlans.filter(item => item.week === 52).length, 2);
    assert.deepEqual(state.weekPlans.filter(item => item.week === 52).map(item => item.monday), ['2026-12-21', '2027-12-27']);
    await page.locator('.planning-cell[data-employee="M-0001"][data-day="0"]').click();
    await page.locator('form[data-form="plan-cell"] select[name="value"]').selectOption('Krank');
    await page.locator('form[data-form="plan-cell"] button.primary').click();
    state = await page.evaluate(() => JSON.parse(localStorage.getItem('maler-meyer-demo-v11')).data);
    assert.equal(state.weekPlans.find(item => item.monday === '2027-12-27').rows.find(item => item.employeeId === 'M-0001').values[0], 'Krank');
    assert.notEqual(state.weekPlans.find(item => item.monday === '2026-12-21').rows.find(item => item.employeeId === 'M-0001').values[0], 'Krank');

    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-mm-action="xlsx-planning"]:visible').first().click();
    const download = await downloadPromise;
    const workbook = fs.readFileSync(await download.path()).toString('utf8');
    assert.match(workbook, /name="KW 52-2026"/);
    assert.match(workbook, /name="KW 01-2027"/);
    assert.match(workbook, /name="KW 52-2027"/);
    assert.deepEqual(errors, []);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), true);
    console.log('OK KW/Jahr: Jahreswechsel, gleiche KW in verschiedenen Jahren, Änderung und XLSX');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

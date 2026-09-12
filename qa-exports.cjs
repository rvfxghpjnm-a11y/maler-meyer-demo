const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const url = process.env.DEMO_URL || 'http://127.0.0.1:4175/';
const outputDir = process.env.QA_EXPORT_DIR || path.join(os.tmpdir(), 'maler-meyer-export-qa');
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('button[data-action="navigate"][data-view="exports"]:visible').click();
  await page.getByRole('heading', { name: 'Dokumente & Exporte', exact: true }).waitFor();

  for (const action of ['xlsx-planning', 'xlsx-calculation', 'xlsx-project', 'xlsx-invoices', 'csv-times', 'csv-invoices']) {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-mm-action="' + action + '"]').first().click();
    const download = await downloadPromise;
    const filePath = path.join(outputDir, download.suggestedFilename());
    await download.saveAs(filePath);
    assert.ok(fs.statSync(filePath).size > 500, action + ' ist zu klein');
  }

  const templates = ['timesheet', 'planning', 'invoice-list', 'work-order', 'material-request', 'material-usage', 'day-work', 'measurement', 'protocol', 'leave', 'offer'];
  for (const template of templates) {
    const popupPromise = page.waitForEvent('popup');
    await page.locator('[data-mm-action="print"][data-template="' + template + '"]').first().click();
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    await popup.locator('.demo-watermark').first().waitFor();
    await popup.emulateMedia({ media: 'print' });
    const pdfPath = path.join(outputDir, template + '.pdf');
    await popup.pdf({ path: pdfPath, format: 'A4', printBackground: true, preferCSSPageSize: true });
    assert.ok(fs.statSync(pdfPath).size > 2000, template + ' PDF ist zu klein');
    await popup.close();
  }

  assert.deepEqual(errors, []);
  await browser.close();
  console.log('OK exports ' + outputDir);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});


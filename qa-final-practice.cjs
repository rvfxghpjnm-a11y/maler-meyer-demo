const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const url = process.env.DEMO_URL || 'http://127.0.0.1:4175/';
const storageKey = 'maler-meyer-demo-v11';

async function nav(page, view) {
  let button = page.locator('[data-action="navigate"][data-view="' + view + '"]:visible').first();
  if (!await button.count()) { await page.locator('.profile-button:visible').click(); button = page.locator('[data-action="navigate"][data-view="' + view + '"]:visible').first(); }
  await button.click();
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const checks = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
    const page = await context.newPage();
    const errors = [];
    const external = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { const host = new URL(request.url()).hostname; if (!['127.0.0.1', 'localhost'].includes(host)) external.push(request.url()); });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    await nav(page, 'planning');
    await page.locator('[data-action="planning-week"][data-week="2026-09-14"]').click();
    await page.getByRole('heading', { name: 'Wochenplanung 2026 · KW 38' }).waitFor();
    assert.equal(await page.locator('.planning-cell').count() > 20, true);
    checks.push('25 vollständige neue Woche ist zellenweise planbar');

    await page.locator('.planning-cell[data-employee="M-0001"][data-day="2"]').click();
    await page.locator('form[data-form="plan-cell"] select[name="value"]').selectOption('26-103');
    await page.locator('form[data-form="plan-cell"] button.primary').click();
    let state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
    assert.equal(state.weekPlans.find(x => x.week === 38).rows.find(x => x.employeeId === 'M-0001').values[2], '26-103');
    checks.push('26 einzelner Mittwoch einer zukünftigen Woche geändert');

    for (const id of ['M-0001', 'M-0002', 'M-0003']) await page.locator('form[data-form="plan-batch"] input[name="employee"][value="' + id + '"]').check();
    for (const day of ['0', '1', '2']) await page.locator('form[data-form="plan-batch"] input[name="day"][value="' + day + '"]').check();
    await page.locator('form[data-form="plan-batch"] select[name="value"]').selectOption('26-103');
    await page.locator('form[data-form="plan-batch"] button.primary').click();
    state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
    assert.deepEqual(state.weekPlans.find(x => x.week === 38).rows.find(x => x.employeeId === 'M-0002').values.slice(0, 3), ['26-103', '26-103', '26-103']);
    checks.push('27 drei Mitarbeiter Montag bis Mittwoch derselben Baustelle zugeordnet');

    await page.locator('[data-action="planning-week"][data-week="2026-09-07"]').click();
    await page.locator('.planning-cell[data-employee="M-0004"][data-day="3"]').click();
    await page.locator('form[data-form="plan-cell"] select[name="value"]').selectOption('26-105');
    await page.locator('form[data-form="plan-cell"] button.primary').click();
    state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
    assert.equal(state.assignments.find(x => x.employeeId === 'M-0004').site, '26-105', 'Demo-Tag muss heutige Zuordnung aktualisieren');
    await page.locator('[data-action="planning-week"][data-week="2026-09-14"]').click();
    await page.locator('.planning-cell[data-employee="M-0004"][data-day="3"]').click();
    await page.locator('form[data-form="plan-cell"] select[name="value"]').selectOption('26-101');
    await page.locator('form[data-form="plan-cell"] button.primary').click();
    state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
    assert.equal(state.assignments.find(x => x.employeeId === 'M-0004').site, '26-105', 'Andere Woche darf heutige Zuordnung nicht verändern');
    checks.push('Planungsdatum aktualisiert nur am synthetischen Demo-Tag die heutige Zuordnung');

    await page.locator('[data-action="new-plan-week"]').click();
    await page.locator('form[data-form="new-plan-week"] input[name="monday"]').fill('2026-09-21');
    await page.locator('form[data-form="new-plan-week"] select[name="mode"]').selectOption('COPY');
    await page.locator('form[data-form="new-plan-week"] button.primary').click();
    state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
    assert.equal(state.weekPlans.find(x => x.week === 39).rows.length, state.weekPlans.find(x => x.week === 38).rows.length);
    checks.push('28 Vorwoche kopiert');

    await page.locator('[data-action="planning-week"][data-week="2026-09-14"]').click();
    await page.locator('[data-action="publish-plan"][data-week="2026-09-14"]').click();
    await nav(page, 'more');
    await page.locator('[data-action="switch-role"][data-role="employee"]').click();
    await page.getByRole('heading', { name: 'Meine Woche · KW 38 / 2026' }).waitFor();
    assert.equal(await page.locator('.my-week-days').getByText(/26-103/).count() >= 1, true);
    checks.push('29 Mitarbeiter sieht eigene veröffentlichte Woche');
    await nav(page, 'notifications');
    assert.equal(await page.getByText('Deine Planung für KW 38 / 2026 wurde geändert.', { exact: true }).count() >= 1, true);
    checks.push('30 Planänderung erzeugt Mitarbeiter-Hinweis');

    await nav(page, 'more');
    await page.locator('[data-action="switch-role"][data-role="management"]').click();
    await nav(page, 'sites');
    await page.locator('[data-action="open-site"][data-id="26-103"]').first().click();
    await page.locator('[data-action="open-project-cost"][data-site="26-103"]').click();
    await page.locator('form[data-form="project-cost"] select[name="type"]').selectOption('LIFT');
    await page.locator('form[data-form="project-cost"] input[name="description"]').fill('Arbeitsbühne Torben-Test');
    await page.locator('form[data-form="project-cost"] input[name="net"]').fill('321.45');
    await page.locator('form[data-form="project-cost"] button.primary').click();
    state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
    assert.equal(state.projectCostEntries.some(x => x.description === 'Arbeitsbühne Torben-Test' && x.net === 321.45), true);
    checks.push('31 Liftkosten manuell hinzugefügt');

    await page.locator('[data-action="open-supplier-invoice"][data-site="26-103"]').click();
    await page.locator('form[data-form="supplier-invoice"] input[name="invoiceNumber"]').fill('DEMO-E-PRAXIS-01');
    await page.locator('form[data-form="supplier-invoice"] input[name="net"]').fill('417.20');
    await page.locator('form[data-form="supplier-invoice"] button.primary').click();
    state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
    assert.equal(state.supplierInvoices.some(x => x.invoiceNumber === 'DEMO-E-PRAXIS-01' && x.site === '26-103'), true);
    assert.equal(state.projectCostEntries.some(x => x.reference === 'DEMO-E-PRAXIS-01'), true);
    checks.push('32 Eingangsrechnung manuell der Bau-Nr. zugeordnet');

    await page.locator('[data-action="open-billing-record"][data-site="26-103"]').click();
    await page.locator('form[data-form="billing-record"] input[name="reference"]').fill('DEMO-R-PRAXIS-01');
    await page.locator('form[data-form="billing-record"] input[name="net"]').fill('2100');
    await page.locator('form[data-form="billing-record"] button.primary').click();
    state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
    assert.equal(state.billingRecords.some(x => x.reference === 'DEMO-R-PRAXIS-01' && x.site === '26-103'), true);
    checks.push('33 geschriebene Rechnung im Projekt erfasst');

    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-mm-action="xlsx-project"][data-site="26-103"]').click();
    const download = await downloadPromise;
    const target = path.join(os.tmpdir(), 'maler-meyer-v11-project-test.xlsx');
    await download.saveAs(target);
    const bytes = fs.readFileSync(target);
    assert.equal(bytes.includes(Buffer.from('Arbeitsbühne Torben-Test')), true);
    assert.equal(bytes.includes(Buffer.from('DEMO-R-PRAXIS-01')), true);
    checks.push('34 Änderungen im Projekt-Unterkonto-XLSX enthalten');

    for (const viewport of [{ width: 390, height: 844 }, { width: 820, height: 1180 }, { width: 1440, height: 1000 }]) {
      await page.setViewportSize(viewport); await page.reload({ waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
      assert.equal(overflow, false, 'horizontaler Seitenüberlauf bei ' + viewport.width);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    console.log(JSON.stringify({ ok: true, checks }, null, 2));
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const url = process.env.DEMO_URL || 'http://127.0.0.1:4175/';
const storageKey = 'maler-meyer-demo-v11';
const outputDir = path.join(__dirname, 'output', 'pilot');
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport, acceptDownloads: true });
      const errors = [];
      const external = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => {
        const hostname = new URL(request.url()).hostname;
        if (!['127.0.0.1', 'localhost'].includes(hostname)) external.push(request.url());
      });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('[data-action="load-torben-pilot"]:visible').first().click();
      await page.getByRole('heading', { name: /Projekt Stephan \(Demo\)/ }).first().waitFor();
      const report = await page.evaluate(key => {
        const db = JSON.parse(localStorage.getItem(key)).data;
        const scenario = db.pilotScenario;
        const project = db.sites.find(item => item.number === scenario.projectNumber);
        const account = window.MMExcel.account(db, db.projectAccounts.find(item => item.site === project.number));
        const plan = db.weekPlans.find(item => item.monday === scenario.weekMonday);
        const workbook = window.MMSourceWorkbooks.calculation(db);
        const sheet = workbook.find(item => item.name === project.number);
        return {
          scenario, project, employeeNames: scenario.employeeIds.map(id => db.employees.find(item => item.id === id)?.name),
          planRows: scenario.employeeIds.map(id => plan.rows.find(row => row.employeeId === id)?.values),
          publishedRows: scenario.employeeIds.map(id => plan.publishedRows.find(row => row.employeeId === id)?.values),
          material: db.materialRecords.filter(item => item.site === project.number).map(item => item.type),
          supplier: db.supplierInvoices.find(item => item.site === project.number),
          invoiceTask: db.invoiceTasks.find(item => item.site === project.number),
          account: { offerNet: account.offerNet, planned: account.plannedHoursCalculated,
            accepted: account.acceptedHours, travel: account.travelHoursRaw,
            materials: account.material, lift: account.lift, billed: account.writtenInvoices,
            total: account.totalCosts, result: account.result },
          sheetName: sheet?.name, sheetInvoice: sheet?.rows?.[53]?.[22]?.v,
          count: db.sites.length, employees: db.employees.length
        };
      }, storageKey);
      assert.match(report.scenario.projectNumber, /^26-\d{3}$/);
      assert.equal(report.project.name, 'Projekt Stephan (Demo)');
      assert.deepEqual(report.employeeNames, ['Stefan Eins (Demo)', 'Stefan Zwei (Demo)']);
      assert.deepEqual(report.planRows.map(row => row.slice(0, 2)),
        [[report.scenario.projectNumber, report.scenario.projectNumber],
          [report.scenario.projectNumber, report.scenario.projectNumber]]);
      assert.deepEqual(report.publishedRows, report.planRows);
      assert.deepEqual(new Set(report.material), new Set(['REQUEST', 'WITHDRAWAL', 'USAGE']));
      assert.equal(report.supplier.net, 120);
      assert.equal(report.invoiceTask.status, 'GESCHRIEBEN');
      assert.deepEqual(report.account, { offerNet: 6000, planned: 100, accepted: 16,
        travel: 2, materials: 120, lift: 80, billed: 1200, total: 1160, result: 40 });
      assert.equal(report.sheetName, report.scenario.projectNumber);
      assert.equal(report.sheetInvoice, 1200);
      assert.equal(await page.locator('.commercial-project').getByText('40,00 €').count() > 0, true);
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-mm-action="xlsx-project"][data-site="' + report.scenario.projectNumber + '"]').click();
      const download = await downloadPromise;
      assert.match(download.suggestedFilename(), new RegExp(report.scenario.projectNumber + '\\.xlsx$'));
      if (viewport.width === 1440) {
        await download.saveAs(path.join(outputDir, 'pilot-project.xlsx'));
        await page.locator('.profile-button:visible').click();
        await page.locator('[data-action="navigate"][data-view="exports"]:visible').first().click();
        for (const [action, file] of [['xlsx-calculation', 'pilot-main.xlsx'], ['xlsx-planning', 'pilot-planning.xlsx']]) {
          const wait = page.waitForEvent('download');
          await page.locator('[data-mm-action="' + action + '"]').first().click();
          await (await wait).saveAs(path.join(outputDir, file));
        }
      } else {
        await page.locator('.profile-button:visible').click();
      }
      await page.locator('[data-action="load-torben-pilot"]:visible').count().then(count => assert.equal(count, 0));
      const after = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
      assert.equal(after.sites.length, report.count);
      assert.equal(after.employees.length, report.employees);
      await page.reload({ waitUntil: 'networkidle' });
      const persisted = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data.pilotScenario, storageKey);
      assert.equal(persisted.projectNumber, report.scenario.projectNumber);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
      assert.deepEqual(errors, []);
      assert.deepEqual(external, []);
      await page.close();
      console.log('OK Praxistest ' + viewport.width + 'px · ' + report.scenario.projectNumber);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

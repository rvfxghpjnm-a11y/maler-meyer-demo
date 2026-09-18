const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.DEMO_URL || 'http://127.0.0.1:4175/', { waitUntil: 'networkidle' });
  const report = await page.evaluate(() => {
    const db = window.createDemoSeed();
    const first = db.projectAccounts[0];
    const baseline = window.MMExcel.account(db, first);
    const workbook = window.MMSourceWorkbooks.calculation(db);
    const row = workbook[0].rows[3];
    const detail = workbook[2].rows;
    const formulas = {
      planned: row[6].f, hours: row[7].f, travel: row[8].f, trainee: row[9].f,
      hourlyRevenue: row[10].f, personnel: row[11].f, material: row[12].f,
      totalCost: row[17].f, invoice: row[18].f, result: row[19].f, hourlyValue: row[20].f,
      materialSum: detail[238][10].f, liftSum: detail[243][10].f,
      subSum: detail[255][10].f, tempSum: detail[265][10].f,
      scaffoldSum: detail[270][10].f, otherSum: detail[275][10].f
    };
    db.projectCostEntries.push({ site: first.site, type: 'LIFT', net: 125, description: 'Zusätzlicher Demo-Lift' });
    db.billingRecords.push({ site: first.site, date: '2026-09-12', reference: 'DEMO-TEST-01', net: 300 });
    const changed = window.MMExcel.account(db, first);
    const changedSheet = window.MMSourceWorkbooks.calculation(db);
    const changedRow = changedSheet[0].rows[3];
    const changedDetail = changedSheet[2].rows;
    const emptyHours = Object.assign({}, first, { acceptedHours: 0 });
    const emptyModel = window.MMExcel.account(db, emptyHours);
    const stress = window.createDemoSeed();
    for (let i = 0; i < 4; i += 1) stress.projectCostEntries.push({ site: first.site, type: 'LIFT', net: 10, description: 'Synthetischer Lift ' + i });
    for (let i = 0; i < 52; i += 1) stress.billingRecords.push({ site: first.site, date: '2026-09-12', reference: 'DEMO-MEHR-' + i, net: 10 });
    const stressSheet = window.MMSourceWorkbooks.calculation(stress);
    return {
      count: workbook.length, baseline: baseline, changed: changed,
      formulas: formulas, originalCachedLift: row[13].v, changedCachedLift: changedRow[13].v,
      changedCachedInvoices: changedRow[18].v, changedDetailLift: changedDetail[243][10].v,
      changedDetailInvoices: changedDetail[57][22].v,
      emptyHoursRevenue: emptyModel.hourlyRevenue, emptyHoursValue: emptyModel.currentHourlyValue,
      overflowLiftFormula: stressSheet[2].rows[243][10].f,
      overflowInvoiceFormula: stressSheet[2].rows[57][22].f,
      overflowInvoiceCache: stressSheet[2].rows[57][22].v,
      overflowInvoiceExpected: window.MMExcel.account(stress, stress.projectAccounts[0]).writtenInvoices,
      sourceNames: workbook.map(sheet => sheet.name)
    };
  });
  assert.equal(report.count, report.sourceNames.length);
  assert.equal(report.sourceNames[0], 'Bau-Nr.-Liste');
  assert.equal(report.sourceNames[1], 'Demo-Annahmen');
  assert.match(report.formulas.planned, /'Demo-Annahmen'!\$B\$2/);
  assert.match(report.formulas.hours, /!C6$/);
  assert.match(report.formulas.travel, /!O6$/);
  assert.match(report.formulas.trainee, /!AB6$/);
  assert.match(report.formulas.material, /!K239$/);
  assert.match(report.formulas.personnel, /!K266$/);
  assert.match(report.formulas.invoice, /!W58$/);
  assert.equal(report.formulas.result, 'S4-R4');
  assert.equal(report.formulas.materialSum, 'SUM(K65:K238)');
  assert.equal(report.formulas.liftSum, 'SUM(K242:L243)');
  assert.equal(report.formulas.subSum, 'SUM(K247:L255)');
  assert.equal(report.formulas.tempSum, 'SUM(K259:L265)');
  assert.equal(report.formulas.scaffoldSum, 'SUM(K269:L270)');
  assert.equal(report.formulas.otherSum, 'SUM(K274:L275)');
  assert.equal(report.changedCachedLift - report.originalCachedLift, 125);
  assert.equal(report.changedCachedLift, report.changedDetailLift);
  assert.equal(report.changedCachedInvoices - report.baseline.writtenInvoices, 300);
  assert.equal(report.changedCachedInvoices, report.changedDetailInvoices);
  assert.equal(report.changed.result - report.baseline.result, 175);
  assert.equal(report.emptyHoursRevenue, null);
  assert.equal(report.emptyHoursValue, null);
  assert.match(report.overflowLiftFormula, /K28\d/);
  assert.match(report.overflowInvoiceFormula, /W28\d/);
  assert.equal(report.overflowInvoiceCache, report.overflowInvoiceExpected);
  assert.deepEqual(errors, []);
  await browser.close();
  console.log('OK source-based synthetic Excel formulas and live links');
})().catch(error => { console.error(error); process.exitCode = 1; });

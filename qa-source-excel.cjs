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
      materialSum: detail[229][10].f, liftSum: detail[235][10].f,
      subSum: detail[240][10].f, tempSum: detail[245][10].f,
      scaffoldSum: detail[250][10].f, otherSum: detail[255][10].f
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
    const leaveSheet = window.MMSourceWorkbooks.leaveCalendar(db, 2026)[0];
    const approvedEmployeeIndex = db.employees.findIndex(item => item.id === 'M-0024');
    return {
      count: workbook.length, baseline: baseline, changed: changed,
      formulas: formulas, originalCachedLift: row[13].v, changedCachedLift: changedRow[13].v,
      changedCachedInvoices: changedRow[18].v, changedDetailLift: changedDetail[235][10].v,
      changedDetailInvoices: changedDetail[53][22].v,
      emptyHoursRevenue: emptyModel.hourlyRevenue, emptyHoursValue: emptyModel.currentHourlyValue,
      overflowLiftFormula: stressSheet[2].rows[235][10].f,
      overflowInvoiceFormula: stressSheet[2].rows[53][22].f,
      overflowInvoiceCache: stressSheet[2].rows[53][22].v,
      overflowInvoiceExpected: window.MMExcel.account(stress, stress.projectAccounts[0]).writtenInvoices,
      sourceNames: workbook.map(sheet => sheet.name),
      sourceHours: detail[5][2].f,
      sourceTravel: detail[5][14].f,
      sourceTrainee: detail[5][26].f,
      aggregateRow: detail[6][0],
      auditNotes: workbook[1].rows.map(row => row[0]).join(' '),
      leaveName: leaveSheet.name,
      leaveFirstDate: leaveSheet.rows[1][1].v,
      leaveNextDateFormula: leaveSheet.rows[1][2].f,
      leaveMarchFormula: leaveSheet.rows[35][1].f,
      leaveApprovedStatus: leaveSheet.rows[138 + approvedEmployeeIndex][21].v,
      leaveApprovedStyle: leaveSheet.rows[138 + approvedEmployeeIndex][21].s,
      leaveBlankStyle: leaveSheet.rows[138 + approvedEmployeeIndex][20].s
    };
  });
  assert.equal(report.count, report.sourceNames.length);
  assert.equal(report.sourceNames[0], 'Bau-Nr.-Liste');
  assert.equal(report.sourceNames[1], 'Demo-Annahmen');
  assert.match(report.formulas.planned, /'Demo-Annahmen'!\$B\$2/);
  assert.match(report.formulas.hours, /!C6$/);
  assert.match(report.formulas.travel, /!O6$/);
  assert.match(report.formulas.trainee, /!AA6$/);
  assert.match(report.formulas.material, /!K230$/);
  assert.match(report.formulas.personnel, /!K246$/);
  assert.match(report.formulas.invoice, /!W54$/);
  assert.equal(report.formulas.result, 'S4-R4');
  assert.equal(report.sourceHours, 'SUM(D6:M6)');
  assert.equal(report.sourceTravel, 'SUM(O7:O60)');
  assert.equal(report.sourceTrainee, 'SUM(AB6:AL6)');
  assert.match(report.aggregateRow, /KW offen/);
  assert.match(report.auditNotes, /K162\/K163/);
  assert.equal(report.leaveName, 'Urlaubsplan 2026');
  assert.equal(report.leaveFirstDate, 46023);
  assert.equal(report.leaveNextDateFormula, 'B2+1');
  assert.equal(report.leaveMarchFormula, 'BH2+1');
  assert.equal(report.leaveApprovedStatus, 'U');
  assert.equal(report.leaveApprovedStyle, 6);
  assert.equal(report.leaveBlankStyle, 9);
  assert.equal(report.formulas.materialSum, 'SUM(K67:K229)');
  assert.equal(report.formulas.liftSum, 'SUM(K234:L235)');
  assert.equal(report.formulas.subSum, 'SUM(K239:L240)');
  assert.equal(report.formulas.tempSum, 'SUM(K244:L245)');
  assert.equal(report.formulas.scaffoldSum, 'SUM(K249:L250)');
  assert.equal(report.formulas.otherSum, 'SUM(K254:L255)');
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

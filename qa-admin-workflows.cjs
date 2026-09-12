const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const url = process.env.DEMO_URL || 'http://127.0.0.1:4173/';
const storageKey = 'maler-meyer-demo-v9';
const outputDir = path.join(__dirname, 'output', 'ui');
fs.mkdirSync(outputDir, { recursive: true });

async function freshPage(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  return { context, page, errors };
}

async function openAdmin(page) {
  await page.locator('[data-action="navigate"][data-view="admin"]:visible').first().click();
  await page.getByRole('heading', { name: 'Verwaltung', exact: true }).waitFor();
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const checks = [];
  try {
    const desktop = await freshPage(browser, { width: 1440, height: 1000 });
    const page = desktop.page;
    await openAdmin(page);
    await page.screenshot({ path: path.join(outputDir, 'admin-desktop.png'), fullPage: true });
    for (const name of ['Torben', 'Steffen', 'Sabine Beispiel', 'Tina Demo']) {
      assert.equal(await page.getByText(name, { exact: true }).count() >= 1, true, 'Admin-Konto fehlt: ' + name);
    }
    checks.push('vier umfangreich berechtigte Verwaltungs-Konten sichtbar');

    const projectForm = page.locator('form[data-form="admin-project-create"]');
    await projectForm.locator('[name="number"]').fill('26-107');
    await projectForm.locator('[name="name"]').fill('Wohnhaus Regenbogen');
    await projectForm.locator('[name="customer"]').fill('Regenbogen Projektservice Beispiel');
    await projectForm.locator('[name="address"]').fill('Demoweg 7, 12348 Teststadt');
    await projectForm.locator('[name="contact"]').fill('Alex Beispiel · Projektleitung');
    await projectForm.locator('[name="tasks"]').fill('Räume abdecken\nWandflächen vorbereiten');
    await projectForm.getByRole('button', { name: 'Projekt anlegen' }).click();
    await page.getByText(/Projekt 26-107 wurde angelegt/).waitFor();
    assert.equal(await page.getByText(/Bau-Nr\. 26-107 · Wohnhaus Regenbogen/).count() >= 1, true);
    checks.push('Projekt anlegen und mit Audit-Struktur verbinden');

    const employeeForm = page.locator('form[data-form="admin-employee-create"]');
    await employeeForm.locator('[name="name"]').fill('Nora Prüfling');
    await employeeForm.locator('[name="job"]').fill('Mitarbeiterin');
    await employeeForm.locator('[name="site"]').selectOption('26-107');
    await employeeForm.getByRole('button', { name: 'Mitarbeiter anlegen' }).click();
    await page.getByText(/Nora Prüfling wurde als M-0030 angelegt/).waitFor();

    await page.locator('[data-action="navigate"][data-view="employees"]:visible').first().click();
    if (!await page.getByRole('button', { name: 'Deaktivieren' }).count()) await page.getByText('Nora Prüfling', { exact: true }).click();
    await page.getByRole('button', { name: 'Im Büro helfen' }).click();
    const support = page.locator('form[data-form="admin-support-action"]');
    await support.locator('[name="event"]').selectOption('WORK_START');
    await support.locator('[name="reason"]').fill('Telefonisch gemeldet, Handy heute nicht verfügbar.');
    await support.getByRole('button', { name: 'Stellvertretende Buchung speichern' }).click();
    await page.getByText(/Büro-Hilfe gespeichert/).waitFor();
    let saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
    const created = saved.employees.find(item => item.name === 'Nora Prüfling');
    assert.equal(created.id, 'M-0030');
    assert.equal(created.status, 'WORKING');
    const assisted = saved.events.filter(item => item.employeeId === created.id).at(-1);
    assert.equal(assisted.createdBy, 'management');
    assert.match(assisted.note, /Telefonische Büro-Hilfe/);
    assert.equal(saved.audit[0].type, 'OFFICE_ASSISTED_EVENT');
    checks.push('telefonische Büro-Hilfe als getrennte stellvertretende Buchung protokolliert');

    await page.locator('[data-action="navigate"][data-view="employees"]:visible').first().click();
    if (!await page.getByRole('button', { name: 'Deaktivieren' }).count()) await page.getByText('Nora Prüfling', { exact: true }).click();
    await page.getByRole('button', { name: 'Deaktivieren' }).click();
    await page.getByText(/wurde deaktiviert; Historie bleibt erhalten/).waitFor();
    saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
    assert.equal(saved.employees.find(item => item.id === created.id).active, false);
    assert.equal(saved.events.some(item => item.employeeId === created.id && item.type === 'WORK_START'), true);
    await page.getByRole('button', { name: 'Deaktiviert', exact: true }).click();
    if (!await page.getByRole('button', { name: 'Reaktivieren' }).count()) await page.getByText('Nora Prüfling', { exact: true }).click();
    await page.getByRole('button', { name: 'Reaktivieren' }).click();
    checks.push('Deaktivieren und Reaktivieren ohne Verlust historischer Zeitereignisse');

    await openAdmin(page);
    const project = page.locator('details.admin-record').filter({ hasText: '26-107' });
    await project.locator('summary').click();
    await project.getByRole('button', { name: 'Archivieren' }).click();
    await page.getByText(/26-107 wurde archiviert/).waitFor();
    await project.locator('summary').click();
    await project.getByRole('button', { name: 'Reaktivieren' }).click();
    checks.push('Projekt bearbeiten, archivieren und reaktivieren');

    for (const role of ['management2', 'office', 'office2']) {
      await page.locator('[data-action="navigate"][data-view="more"]:visible').first().click();
      await page.locator('[data-action="switch-role"][data-role="' + role + '"]').click();
      await openAdmin(page);
      assert.equal(await page.getByRole('heading', { name: 'Verwaltung', exact: true }).isVisible(), true);
    }
    checks.push('Torben, Steffen und beide Büro-Konten erreichen dieselbe Verwaltung');
    assert.deepEqual(desktop.errors, []);
    await desktop.context.close();

    for (const viewport of [{ width: 390, height: 844 }, { width: 1024, height: 1366 }]) {
      const run = await freshPage(browser, viewport);
      await openAdmin(run.page);
      await run.page.screenshot({ path: path.join(outputDir, viewport.width === 390 ? 'admin-mobile.png' : 'admin-tablet.png'), fullPage: true });
      assert.equal(await run.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
      assert.equal(await run.page.getByRole('heading', { name: 'Direkte Büro-Hilfe' }).isVisible(), true);
      assert.deepEqual(run.errors, []);
      await run.context.close();
    }
    checks.push('Verwaltung und Büro-Hilfe auf Smartphone und Tablet ohne Seitenüberlauf');

    console.log(JSON.stringify({ ok: true, checks }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

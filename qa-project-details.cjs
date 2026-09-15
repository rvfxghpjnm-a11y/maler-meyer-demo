const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const url = process.env.DEMO_URL || 'http://127.0.0.1:4173/';
const key = 'maler-meyer-demo-v11';

async function openAdmin(page) {
  await page.locator('[data-action="navigate"][data-view="admin"]:visible').first().click();
  await page.getByRole('heading', { name: 'Verwaltung', exact: true }).waitFor();
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const checks = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await openAdmin(page);
    const create = page.locator('form[data-form="admin-project-create"]');
    assert.equal(await create.locator('[name="number"]').inputValue(), '26-107');
    assert.equal(await create.locator('[name="number"]').isEditable(), true);
    assert.equal(await page.evaluate(() => window.MMProjectAdmin.nextNumber([{ number: '26-106', active: false }], 2027)), '27-001');
    checks.push('editierbarer aktueller Nummernvorschlag und Reset auf 27-001 im neuen Jahr');

    assert.equal(await page.evaluate(() => window.MMProjectAdmin.validDetails({ plannedStart: '2026-10-15', plannedEnd: '2026-10-01', offerNet: 0, plannedHours: 0 }).length > 0), true);
    await create.locator('[name="number"]').fill('26-106');
    await create.locator('[name="name"]').fill('Doppelnummer Test');
    await create.locator('[name="customer"]').fill('Fiktiver Kunde');
    await create.locator('[name="address"]').fill('Fiktiver Weg');
    await create.locator('[name="contact"]').fill('Testkontakt');
    await create.locator('[name="tasks"]').fill('Demo-Aufgabe');
    await create.getByRole('button', { name: 'Projekt anlegen' }).click();
    await page.getByText(/Diese Bau-Nr. ist bereits vorhanden/).waitFor();
    await create.locator('[name="number"]').fill('26-107');
    checks.push('Doppelnummer und umgekehrter Zeitraum werden abgefangen');

    await create.locator('[name="name"]').fill('Haus Sonnenseite Demo');
    await create.locator('[name="customer"]').fill('Musterprojekt GmbH');
    await create.locator('[name="address"]').fill('Fiktivweg 12, 12345 Teststadt');
    await create.locator('[name="contact"]').fill('Pat Demo');
    await create.locator('[name="tasks"]').fill('Untergrund prüfen\nFlächen vorbereiten');
    await create.locator('[name="plannedStart"]').fill('2026-10-01');
    await create.locator('[name="plannedEnd"]').fill('2026-10-15');
    await create.locator('[name="siteLead"]').fill('Robin Beispiel');
    await create.locator('[name="access"]').fill('Zugang über fiktiven Hausmeister');
    await create.locator('[name="description"]').fill('Innenräume synthetisch streichen');
    await create.locator('[name="extraTasks"]').fill('Fenster abdecken');
    await create.locator('[name="materials"]').fill('Abdeckvlies');
    await create.locator('[name="offerNet"]').fill('12500');
    await create.locator('[name="plannedHours"]').fill('80');
    await create.locator('[name="invoice"]').fill('Rechnung nach Demo-Prüfung');
    await create.locator('[name="internalNote"]').fill('Nur Büro-Demo');
    await create.getByRole('button', { name: 'Projekt anlegen' }).click();
    await page.getByText(/Projekt 26-107 wurde angelegt/).waitFor();
    assert.equal(await page.locator('form[data-form="admin-project-create"] [name="number"]').inputValue(), '26-108');
    let saved = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)).data, key);
    let project = saved.sites.find(item => item.number === '26-107');
    let account = saved.projectAccounts.find(item => item.site === '26-107');
    assert.equal(project.access, 'Zugang über fiktiven Hausmeister');
    assert.equal(project.plannedStart, '2026-10-01');
    assert.equal(project.plannedEnd, '2026-10-15');
    assert.deepEqual(project.extraTasks, ['Fenster abdecken']);
    assert.equal(project.internalNote, 'Nur Büro-Demo');
    assert.equal(account.offerNet, 12500);
    assert.equal(account.plannedHours, 80);
    checks.push('weitere Projektdetails und sichere Rohwerte werden gespeichert');

    const record = page.locator('details.admin-record').filter({ hasText: '26-107' });
    await record.locator(':scope > summary').click();
    const edit = record.locator('form[data-form="admin-project-edit"]');
    await edit.locator('[name="access"]').fill('Neuer fiktiver Zugang');
    await edit.locator('[name="offerNet"]').fill('13000');
    await edit.locator('[name="plannedHours"]').fill('82');
    await edit.getByRole('button', { name: 'Änderungen speichern' }).click();
    saved = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)).data, key);
    project = saved.sites.find(item => item.number === '26-107');
    account = saved.projectAccounts.find(item => item.site === '26-107');
    assert.equal(project.access, 'Neuer fiktiver Zugang');
    assert.equal(account.offerNet, 13000);
    assert.equal(account.plannedHours, 82);
    assert.equal(saved.audit[0].type, 'PROJECT_UPDATED');
    checks.push('Bearbeitung aktualisiert Projekt und Unterkonto mit Audit');

    assert.equal(await page.evaluate(() => window.MMProjectAdmin.nextNumber([{ number: '26-107', active: false }, { number: '26-120' }], 2026)), '26-121');
    assert.equal(await page.evaluate(() => window.MMProjectAdmin.nextNumber([{ number: '26-999' }], 2026)), '');
    checks.push('archivierte und manuell höhere Nummern zählen mit, Überlauf wird nicht erfunden');

    for (const width of [390, 820]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), true, 'Seitenüberlauf bei ' + width);
    }
    assert.deepEqual(errors, []);
    checks.push('Smartphone/Tablet ohne Seitenüberlauf oder JavaScript-Fehler');
    await context.close();
    console.log(JSON.stringify({ ok: true, checks }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

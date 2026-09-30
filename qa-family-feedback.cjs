const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const url = process.env.DEMO_URL || 'http://127.0.0.1:4175/';
const storageKey = 'maler-meyer-demo-v11';
const outputDir = path.join(__dirname, 'output', 'family-feedback-v16');
fs.mkdirSync(outputDir, { recursive: true });

async function freshPage(browser, viewport) {
  const context = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  const external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => {
    const host = new URL(request.url()).hostname;
    if (!['127.0.0.1', 'localhost'].includes(host)) external.push(request.url());
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  return { context, page, errors, external };
}

async function assertNoHorizontalOverflow(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), true, label);
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const checks = [];
  try {
    const phone = await freshPage(browser, { width: 390, height: 844 });
    let page = phone.page;
    await page.locator('[data-action="load-torben-pilot"]:visible').first().click();
    assert.match(await page.locator('h1').first().innerText(), /Guten/);
    assert.equal((await page.evaluate(key => JSON.parse(localStorage.getItem(key)).version, storageKey)), 19);
    await assertNoHorizontalOverflow(page, 'Startseite läuft auf dem iPhone horizontal über');
    checks.push('Praxistest bleibt nach dem Laden im Morgencheck auf Heute');

    const search = page.locator('#global-search');
    await search.fill('Feedback');
    await page.getByRole('button', { name: /Feedback \/ Bedienproblem melden/ }).click();
    await page.getByRole('heading', { name: 'Feedback und Fehlermeldung' }).waitFor();
    await page.goBack();
    await page.getByRole('heading', { name: /Guten/ }).waitFor();
    checks.push('globale Funktionssuche und Browser-Zurück funktionieren');

    await search.fill('Neue Baustelle');
    await page.getByRole('button', { name: /Neue Baustelle anlegen/ }).click();
    assert.equal(await page.locator('form[data-form="admin-project-create"]').count(), 1);
    assert.equal(await page.locator('form[data-form="admin-employee-create"]').count(), 0);
    assert.equal(await page.locator('[name="contactPhone"]').count(), 1);
    assert.equal(await page.getByText('Baustellenzugang / Schlüssel', { exact: true }).count() >= 1, true);
    assert.equal(await page.getByText(/Voraussichtlicher Materialbedarf/).count() >= 1, true);
    await assertNoHorizontalOverflow(page, 'Projektanlage läuft auf dem iPhone horizontal über');
    checks.push('Projektanlage ist getrennt und enthält die geklärten Detailfelder');
    await phone.context.close();

    const tablet = await freshPage(browser, { width: 1180, height: 820 });
    page = tablet.page;
    await page.locator('[data-action="load-torben-pilot"]:visible').first().click();
    const state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data.pilotScenario, storageKey);
    await page.locator('[data-action="open-site"][data-id="' + state.projectNumber + '"]:visible').first().click();
    const card = page.locator('.site-card-open');
    await card.waitFor();
    const cardBox = await card.boundingBox();
    const contentBox = await page.locator('.content').boundingBox();
    assert.equal(cardBox.width >= contentBox.width * 0.92, true);
    assert.equal(await page.getByText('Interner Ansprechpartner Maler Meyer', { exact: true }).count(), 1);
    assert.equal(await page.getByRole('button', { name: 'Projektkosten & Rechnungen als XLSX' }).count(), 1);
    await assertNoHorizontalOverflow(page, 'Baustellenmappe läuft auf iPad quer horizontal über');
    await page.screenshot({ path: path.join(outputDir, 'project-ipad-landscape.png'), fullPage: true });
    checks.push('geöffnete Baustelle nutzt iPad-Breite und Projektbegriffe bleiben im Feld');

    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Arbeitszettel', exact: true }).click();
    const popup = await popupPromise;
    await popup.waitForLoadState('load');
    assert.equal(await popup.getByRole('button', { name: 'Zurück zur App' }).count(), 1);
    await popup.close();
    checks.push('Druckansicht bietet sichtbare Rückkehr zur App');
    await tablet.context.close();

    const desktop = await freshPage(browser, { width: 1440, height: 1000 });
    page = desktop.page;
    await page.locator('[data-action="navigate"][data-view="employees"]:visible').first().click();
    await page.getByRole('button', { name: 'Neuen Mitarbeiter anlegen' }).click();
    assert.equal(await page.locator('form[data-form="admin-employee-create"]').count(), 1);
    assert.equal(await page.locator('form[data-form="admin-project-create"]').count(), 0);
    assert.equal(await page.locator('form[data-form="admin-employee-create"] [name="site"]').count(), 0);
    assert.equal(await page.getByText(/keine Personalakte/i).count() >= 1, true);
    checks.push('Mitarbeiteranlage ist getrennt und erzeugt keine erste Planung');

    await page.locator('[data-action="navigate"][data-view="today"]:visible').first().click();
    await page.locator('[data-action="extra-filter"][data-filter="reported"]').click();
    await page.getByRole('heading', { name: 'Zusatzarbeiten', exact: true }).waitFor();
    assert.equal(await page.locator('.extra-status-grid .status-card.active').count(), 1);
    checks.push('Zusatzarbeitszahlen öffnen die passend gefilterte Liste');

    await page.locator('#global-search').fill('Feedback');
    await page.getByRole('button', { name: /Feedback \/ Bedienproblem melden/ }).click();
    const firstFeedback = page.locator('details.feedback-card').first();
    if (await firstFeedback.count()) {
      await firstFeedback.locator(':scope > summary').click();
      assert.equal(await firstFeedback.locator('.feedback-detail').isVisible(), true);
    }
    await assertNoHorizontalOverflow(page, 'Desktopansicht läuft horizontal über');
    assert.deepEqual(desktop.errors, []);
    assert.deepEqual(desktop.external, []);
    await desktop.context.close();
    checks.push('Feedbackfälle sind aufklappbar; keine unerwarteten externen Requests oder JS-Fehler');

    console.log(JSON.stringify({ ok: true, checks }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });


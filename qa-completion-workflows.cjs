const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const url = process.env.DEMO_URL || 'http://127.0.0.1:4175/';
const storageKey = 'maler-meyer-demo-v10';
const outputDir = path.join(__dirname, 'output', 'completion');
fs.mkdirSync(outputDir, { recursive: true });

async function freshPage(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  const external = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', request => {
    const requestUrl = request.url();
    if (/^(blob:|data:)/.test(requestUrl)) return;
    const target = new URL(requestUrl);
    if (!['127.0.0.1', 'localhost'].includes(target.hostname)) external.push(requestUrl);
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  return { context, page, errors, external };
}

async function switchRole(page, role) {
  await page.locator('.profile-button').click();
  await page.locator('[data-action="switch-role"][data-role="' + role + '"]').click();
}

async function navigate(page, view) {
  let button = page.locator('[data-action="navigate"][data-view="' + view + '"]:visible');
  if (!await button.count()) {
    await page.locator('.profile-button').click();
    button = page.locator('[data-action="navigate"][data-view="' + view + '"]:visible');
  }
  await button.first().click();
}

async function assertClean(page, errors, external, label) {
  assert.deepEqual(errors, [], label + ': JavaScript-/Konsolenfehler');
  assert.deepEqual(external, [], label + ': unerwartete externe Requests');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true, label + ': horizontaler Seitenüberlauf');
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    {
      const { context, page, errors, external } = await freshPage(browser, { width: 390, height: 844 });
      await switchRole(page, 'employee');

      await navigate(page, 'documentation');
      await page.getByRole('button', { name: /Schaden \/ Problem/ }).click();
      const fileInput = page.locator('[data-local-photo]');
      await fileInput.setInputFiles({ name: 'synthetisches-demo-foto.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nXsAAAAASUVORK5CYII=', 'base64') });
      await page.locator('[data-photo-preview] img').waitFor();
      await page.locator('[data-action="speech-demo"]').click();
      await page.locator('[data-speech-panel]').waitFor();
      await page.screenshot({ path: path.join(outputDir, 'smartphone-photo-speech.png'), fullPage: true });
      await page.locator('[data-action="speech-accept"]').click();
      await page.getByRole('button', { name: 'Speichern', exact: true }).click();
      await page.getByText(/Notiz der Baustellenmappe zugeordnet/).waitFor();

      await page.locator('[data-action="toggle-offline"]').click();
      await navigate(page, 'today');
      await page.locator('[data-action="employee-event"]:visible').first().click();
      await page.getByRole('button', { name: 'Notiz / Foto', exact: true }).click();
      await page.locator('[name="text"]').fill('Offline erfasste synthetische Notiz.');
      await page.getByRole('button', { name: 'Speichern', exact: true }).click();
      await page.getByRole('button', { name: 'Zusatzarbeit', exact: true }).click();
      await page.locator('form[data-form="employee-action"] [name="description"]').fill('Offline erfasste synthetische Zusatzarbeit.');
      await page.getByRole('button', { name: 'Speichern', exact: true }).click();
      await navigate(page, 'material');
      await page.locator('form[data-form="material-entry"] [name="article"]').fill('Abdeckvlies');
      await page.locator('form[data-form="material-entry"] [name="quantity"]').fill('3');
      await page.locator('form[data-form="material-entry"] [name="unit"]').fill('Rolle');
      await page.locator('form[data-form="material-entry"] button[type="submit"], form[data-form="material-entry"] button:not([type])').first().click();
      await page.locator('form[data-form="material-entry"] [name="type"]').selectOption('WITHDRAWAL');
      await page.locator('form[data-form="material-entry"] [name="article"]').fill('Innenfarbe weiss');
      await page.locator('form[data-form="material-entry"] [name="quantity"]').fill('2');
      await page.locator('form[data-form="material-entry"] [name="unit"]').fill('Eimer / 15 l');
      await page.locator('form[data-form="material-entry"] button[type="submit"], form[data-form="material-entry"] button:not([type])').first().click();
      await page.locator('form[data-form="material-entry"] [name="type"]').selectOption('USAGE');
      await page.locator('form[data-form="material-entry"] [name="article"]').fill('Tiefengrund');
      await page.locator('form[data-form="material-entry"] [name="quantity"]').fill('12');
      await page.locator('form[data-form="material-entry"] [name="unit"]').fill('Liter');
      await page.locator('form[data-form="material-entry"] button[type="submit"], form[data-form="material-entry"] button:not([type])').first().click();
      let state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
      assert.equal(state.offlineSimulation.queue.length, 6, 'sechs Offline-Vorgänge vorgemerkt');
      assert.ok(state.projectMaterialItems.some(item => item.article === 'Tiefengrund' && item.unitPrice === null), 'Verbrauch unbewertet im Projekt-Unterkonto vorgemerkt');
      await page.locator('[data-action="toggle-offline"]').click();
      state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
      assert.equal(state.offlineSimulation.queue.length, 0, 'Warteschlange nach Wieder-Online sichtbar geleert');

      await navigate(page, 'leave');
      await page.locator('form[data-form="leave-request"] [name="from"]').fill('2026-10-12');
      await page.locator('form[data-form="leave-request"] [name="to"]').fill('2026-10-16');
      await page.getByRole('button', { name: 'Urlaub beantragen' }).click();
      await navigate(page, 'feedback');
      await page.locator('form[data-form="feedback-case"] [name="description"]').fill('Synthetischer Smartphone-Testfall.');
      await page.getByRole('button', { name: 'Demo-Fall anlegen' }).click();

      await navigate(page, 'shared-device');
      await page.locator('[data-action="select-shared-user"][data-id="M-0001"]').click();
      for (let index = 0; index < 5; index += 1) {
        await page.locator('form[data-form="shared-pin"] [name="pin"]').fill('000000');
        await page.getByRole('button', { name: 'Eigene Ansicht öffnen' }).click();
      }
      await page.locator('p.problem-text', { hasText: 'Demo-Cooldown aktiv' }).waitFor();
      await page.waitForTimeout(5200);
      await page.locator('form[data-form="shared-pin"] [name="pin"]').fill('123456');
      await page.getByRole('button', { name: 'Eigene Ansicht öffnen' }).click();
      await page.getByText(/Fahrzeuggerät · Max Beispiel/).waitFor();
      await page.getByRole('button', { name: 'Gerät sperren' }).click();
      await page.getByRole('heading', { name: 'Gemeinsames Firmen-iPad' }).waitFor();
      await page.screenshot({ path: path.join(outputDir, 'smartphone.png'), fullPage: true });
      await assertClean(page, errors, external, 'Smartphone');
      await context.close();
      console.log('OK smartphone advanced workflows');
    }

    {
      const { context, page, errors, external } = await freshPage(browser, { width: 820, height: 1180 });
      await navigate(page, 'shared-device');
      await page.locator('[data-action="select-shared-user"][data-id="M-0001"]').click();
      await page.locator('[name="pin"]').fill('123456');
      await page.getByRole('button', { name: 'Eigene Ansicht öffnen' }).click();
      await page.getByRole('button', { name: 'Benutzer wechseln' }).click();
      await page.getByRole('heading', { name: 'Gemeinsames Firmen-iPad' }).waitFor();
      await switchRole(page, 'management');
      await navigate(page, 'planning');
      await page.getByRole('heading', { name: /Wochenplanung 2026/ }).waitFor();
      await navigate(page, 'material');
      await page.getByRole('heading', { name: 'Material', exact: true }).waitFor();
      await navigate(page, 'leave');
      await page.getByRole('heading', { name: 'Urlaub', exact: true }).waitFor();
      await page.screenshot({ path: path.join(outputDir, 'tablet.png'), fullPage: true });
      await assertClean(page, errors, external, 'Tablet');
      await context.close();
      console.log('OK tablet advanced workflows');
    }

    {
      const { context, page, errors, external } = await freshPage(browser, { width: 1440, height: 1000 });
      await navigate(page, 'material');
      await page.locator('[data-action="material-status"][data-id="MATV-001"]').click();
      await page.getByText('In Bearbeitung', { exact: true }).first().waitFor();
      await navigate(page, 'leave');
      await page.locator('form[data-form="leave-decision"][data-id="U-001"] [name="reason"]').fill('Synthetische Demo-Genehmigung.');
      await page.locator('form[data-form="leave-decision"][data-id="U-001"] button[value="APPROVED"]').click();
      await navigate(page, 'planning');
      await page.getByText('Urlaub', { exact: true }).first().waitFor();
      await navigate(page, 'sites');
      await page.locator('[data-action="open-site"][data-id="26-103"]').first().click();
      await page.getByRole('heading', { name: 'Materialverlauf' }).waitFor();
      await navigate(page, 'admin');
      await page.getByRole('heading', { name: 'Verwaltung', exact: true }).waitFor();
      await navigate(page, 'exports');
      await page.getByText('Projekt-Unterkonto', { exact: true }).waitFor();
      await page.screenshot({ path: path.join(outputDir, 'desktop.png'), fullPage: true });
      await navigate(page, 'more');
      await page.locator('[data-action="reset-demo"]').click();
      const resetState = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
      assert.equal(resetState.version, 10, 'Demo-Version nach Reset');
      assert.equal(resetState.data.materialRecords.length, 3, 'synthetischer Material-Ausgangsstand nach Reset');
      await assertClean(page, errors, external, 'Desktop');
      await context.close();
      console.log('OK desktop advanced workflows');
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });


const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const url = process.env.DEMO_URL || 'http://127.0.0.1:4175/';
const outputDir = path.join(__dirname, 'output', 'interactive-test-v17');
fs.mkdirSync(outputDir, { recursive: true });

async function openFresh(browser, viewport) {
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

async function assertNoOverflow(page, label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2), true, label);
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const checks = [];
  try {
    const desktop = await openFresh(browser, { width: 1440, height: 1000 });
    const page = desktop.page;
    assert.equal(await page.evaluate(() => window.MMPraxisTest.getItems().length), 46);
    await page.locator('[data-action="navigate"][data-view="more"]:visible').first().click();
    await page.getByRole('button', { name: 'Interaktiven Test starten' }).click();
    await page.locator('form[data-form="practice-start"] input[name="tester"]').fill('Familientest Beispiel');
    await page.locator('form[data-form="practice-start"]').getByRole('button', { name: 'Test starten' }).click();
    assert.match(await page.locator('.practice-current h2').innerText(), /Morgencheck/);
    assert.equal(await page.getByText(/Keine Audioaufnahme/).count() >= 1, true);
    await page.screenshot({ path: path.join(outputDir, 'interactive-test-desktop.png'), fullPage: true });
    checks.push('Test startet lokal mit 34 Bedienaufgaben und 12 Fachfragen ohne Audioaufnahme');

    await page.getByRole('button', { name: 'Aufgabe in der Demo öffnen' }).click();
    await page.getByRole('heading', { name: /Guten/ }).waitFor();
    assert.equal(await page.locator('.practice-dock').count(), 1);
    await page.locator('.practice-dock [data-action="practice-skip"]').click();
    assert.match(await page.locator('.practice-dock-main strong').innerText(), /Bau-Nr/);
    checks.push('Feste Teststeuerung bleibt während der normalen Demo-Bedienung sichtbar und Überspringen arbeitet');

    await page.locator('.practice-dock [data-action="practice-pause"]').click();
    await page.getByRole('heading', { name: 'Test ist pausiert' }).waitFor();
    const partialDownload = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Zwischenstand herunterladen' }).first().click()
    ]).then(values => values[0]);
    const partialPath = path.join(outputDir, await partialDownload.suggestedFilename());
    await partialDownload.saveAs(partialPath);
    const partial = JSON.parse(fs.readFileSync(partialPath, 'utf8'));
    assert.equal(partial.session.status, 'PAUSED');
    assert.equal(partial.session.results.T01.status, 'SKIPPED');
    assert.equal(partial.privacy.includes('keine Audioaufnahme'), true);
    assert.ok(partial.syntheticDemoState);
    checks.push('Pause speichert Zustand und bietet vollständigen JSON-Zwischenstand zum Download');

    await page.getByRole('button', { name: 'Test fortsetzen' }).click();
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await page.locator('[data-practice-note]').fill('Morgencheck war verständlich; Status Arbeitsstart fehlt ist klar.');
    await page.getByRole('button', { name: 'Fehler', exact: true }).click();
    const stored = await page.evaluate(() => window.MMPraxisTest.getSession());
    assert.equal(stored.results.T01.status, 'ERROR');
    assert.match(stored.results.T01.note, /Morgencheck/);
    checks.push('Zurückspringen, Notiz und Bewertung bleiben lokal erhalten');

    await page.locator('details.practice-overview > summary').click();
    await page.locator('[data-action="practice-jump"][data-id="Q12"]').click();
    assert.match(await page.locator('.practice-current h2').innerText(), /Pilotbetrieb/);
    await page.locator('.practice-current').getByRole('button', { name: 'Überspringen', exact: true }).click();
    await page.getByRole('button', { name: 'Test beenden' }).click();
    await page.getByRole('heading', { name: 'Praxistest beendet' }).waitFor();
    const finalDownload = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Ergebnisdatei herunterladen' }).click()
    ]).then(values => values[0]);
    const finalPath = path.join(outputDir, await finalDownload.suggestedFilename());
    await finalDownload.saveAs(finalPath);
    const finalResult = JSON.parse(fs.readFileSync(finalPath, 'utf8'));
    assert.equal(finalResult.session.status, 'ENDED');
    assert.equal(finalResult.items.length, 46);
    assert.ok(finalResult.session.interactions.length >= 2);
    assert.equal(finalResult.session.errors.length, 0);
    checks.push('Direktsprung, Ende und vollständige Ergebnisdatei funktionieren');
    await assertNoOverflow(page, 'Interaktiver Test läuft auf Desktop horizontal über');
    assert.deepEqual(desktop.errors, []);
    assert.deepEqual(desktop.external, []);
    await desktop.context.close();

    for (const viewport of [{ width: 390, height: 844, label: 'iPhone' }, { width: 1180, height: 820, label: 'iPad quer' }]) {
      const run = await openFresh(browser, viewport);
      await run.page.locator('[data-action="navigate"][data-view="more"]:visible').first().click();
      await run.page.getByRole('button', { name: 'Interaktiven Test starten' }).click();
      await run.page.locator('form[data-form="practice-start"]').getByRole('button', { name: 'Test starten' }).click();
      await run.page.getByRole('button', { name: 'Aufgabe in der Demo öffnen' }).click();
      assert.equal(await run.page.locator('.practice-dock').isVisible(), true);
      await assertNoOverflow(run.page, viewport.label + ': Teststeuerung läuft horizontal über');
      await run.page.screenshot({ path: path.join(outputDir, 'test-dock-' + viewport.label.replace(/\s+/g, '-').toLowerCase() + '.png'), fullPage: true });
      assert.deepEqual(run.errors, []);
      assert.deepEqual(run.external, []);
      await run.context.close();
      checks.push(viewport.label + ': Testbereich und feste Steuerung ohne Layoutfehler');
    }

    console.log(JSON.stringify({ ok: true, checks }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const url = process.env.DEMO_URL || 'http://127.0.0.1:4175/';
const sizes = [
  { name: 'smartphone', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 1000 },
];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const size of sizes) {
      const page = await browser.newPage({ viewport: size });
      const errors = [];
      const external = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => {
        const requestUrl = new URL(request.url());
        if (!['127.0.0.1', 'localhost'].includes(requestUrl.hostname)) external.push(request.url());
      });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.locator('.meyer-wordmark:visible').first().waitFor();
      await page.getByRole('heading', { name: /Guten (Morgen|Tag|Abend), Torben/ }).waitFor();
      await page.getByRole('heading', { name: 'Aufmerksamkeit nötig' }).waitFor();
      await page.getByText('Bau-Nr. 25148', { exact: true }).first().waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${size.name}: horizontaler Überlauf`);
      const sidebarDisplay = await page.locator('.sidebar').evaluate(element => getComputedStyle(element).display);
      const mobileDisplay = await page.locator('.mobile-nav').evaluate(element => getComputedStyle(element).display);
      if (size.width <= 760) { assert.equal(sidebarDisplay, 'none'); assert.notEqual(mobileDisplay, 'none'); }
      else { assert.notEqual(sidebarDisplay, 'none'); assert.equal(mobileDisplay, 'none'); }

      await page.screenshot({ path: path.join(os.tmpdir(), `maler-meyer-management-${size.name}.png`), fullPage: true });

      await page.locator('button[data-action="navigate"][data-view="sites"]:visible').first().click();
      await page.getByRole('heading', { name: 'Baustellen', exact: true }).waitFor();
      await page.locator('button[data-action="navigate"][data-view="today"]:visible').first().click();
      await page.locator('button[data-action="filter-employees"][data-filter="WORKING"]').click();
      await page.getByRole('heading', { name: 'Mitarbeiter', exact: true }).waitFor();
      await page.locator('button[data-action="open-employee"]').first().click();
      await page.getByRole('heading', { name: /Tagesverlauf/ }).waitFor();
      await page.locator('button[data-action="navigate"][data-view="today"]:visible').first().click();
      await page.locator('button[data-action="navigate"][data-view="extras"]:visible').first().click();
      await page.getByRole('heading', { name: 'Zusatzarbeiten', exact: true }).waitFor();
      await page.getByText('Bestätigung der dokumentierten Zusatzarbeit', { exact: true }).first().waitFor();
      await page.getByRole('button', { name: 'Als geprüft simulieren' }).first().click();
      await page.getByRole('status').waitFor();
      await page.locator('button[data-action="navigate"][data-view="today"]:visible').first().click();
      await page.locator('button[data-action="navigate"][data-view="weeks"]:visible').first().click();
      await page.getByRole('heading', { name: 'Wochenzettel', exact: true }).waitFor();
      await page.getByText('Excel bleibt in V1 bestehen', { exact: false }).waitFor();
      await page.getByRole('button', { name: 'Wochenzettel prüfen' }).first().click();
      await page.getByRole('status').waitFor();
      await page.locator('button[data-action="navigate"][data-view="today"]:visible').first().click();

      await page.locator('#global-search').fill('25148');
      await page.getByRole('button', { name: /Bau-Nr. 25148 · M&B Schinkel/ }).first().click();
      await page.getByRole('heading', { name: 'Foto-Dokumentation' }).waitFor();
      await page.getByText('Arbeitsbeginn von Max fehlt', { exact: true }).waitFor();

      if (size.name === 'smartphone') {
        await page.getByRole('button', { name: /Zeiten/ }).last().click();
      } else {
        await page.getByRole('button', { name: /Zeiten prüfen/ }).first().click();
      }
      await page.getByRole('heading', { name: '2 offene Zeitprobleme' }).waitFor();
      await page.getByRole('button', { name: 'Prüfen und korrigieren' }).first().click();
      await page.getByLabel('Grund der Korrektur').fill('Erfundene Prüfung für den Browsertest.');
      await page.getByRole('button', { name: 'Korrektur protokollieren' }).click();
      await page.getByRole('heading', { name: 'Korrekturverlauf dieser Demo' }).waitFor();

      if (size.name === 'smartphone') await page.getByRole('button', { name: /Mehr/ }).last().click();
      else await page.getByRole('button', { name: /Mehr/ }).first().click();
      await page.getByRole('button', { name: 'Anmeldeseite ansehen' }).click();
      await page.getByText('Dieses Gerät wird von mehreren Mitarbeitern genutzt', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Schließen' }).click();
      await page.getByRole('button', { name: 'Als Mitarbeiter ansehen' }).click();
      await page.getByRole('heading', { name: /Guten (Morgen|Tag|Abend), Max/ }).waitFor();
      await page.getByRole('button', { name: 'ARBEIT STARTEN' }).click();
      await page.getByText('Arbeitet seit 07:00', { exact: true }).waitFor();

      await page.locator('button[data-action="open-employee-action"][data-kind="extra"]:visible').first().click();
      await page.getByRole('heading', { name: 'Zusatzarbeit melden' }).waitFor();
      await page.getByLabel('Was wurde zusätzlich gemacht?').fill('Zusätzliche Türzarge gespachtelt');
      await page.getByLabel('Menge oder Umfang – optional').fill('2 Türzargen');
      await page.screenshot({ path: path.join(os.tmpdir(), `maler-meyer-action-${size.name}.png`), fullPage: true });
      await page.getByRole('button', { name: 'Zusatzarbeit speichern' }).click();
      await page.getByRole('heading', { name: 'Meine Meldungen' }).waitFor();
      await page.getByText('Zusatzarbeit gemeldet', { exact: true }).first().waitFor();

      await page.locator('button[data-action="open-employee-action"][data-kind="note"]:visible').first().click();
      await page.getByRole('textbox', { name: 'Notiz', exact: true }).fill('Fensterbank ist für den zweiten Anstrich vorbereitet.');
      await page.getByRole('button', { name: 'Notiz speichern' }).click();
      await page.getByText('Baustellennotiz gespeichert', { exact: true }).first().waitFor();

      await page.locator('button[data-action="open-employee-action"][data-kind="correction"]:visible').click();
      await page.getByLabel('Richtige Uhrzeit').fill('06:55');
      await page.getByLabel('Was soll korrigiert werden?').fill('Arbeitsbeginn war fünf Minuten früher.');
      await page.getByRole('button', { name: 'Korrektur senden' }).click();
      await page.getByText('Korrektur gemeldet', { exact: true }).first().waitFor();

      await page.locator('button[data-action="open-employee-action"][data-kind="feedback"]:visible').click();
      await page.getByLabel('Deine Nachricht').fill('Die großen Baustellenbuttons sind gut lesbar.');
      await page.getByRole('button', { name: 'Feedback senden' }).click();
      await page.getByText('Feedback gesendet', { exact: true }).first().waitFor();

      await page.screenshot({ path: path.join(os.tmpdir(), `maler-meyer-employee-${size.name}.png`), fullPage: true });
      await page.getByRole('button', { name: 'PAUSE STARTEN' }).click();
      await page.getByText('Pause seit 09:30', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'PAUSE BEENDEN' }).click();
      await page.getByRole('button', { name: 'BAUSTELLE WECHSELN' }).click();
      await page.getByText('Unterwegs zu Bau-Nr. 25152', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'FAHRT BEENDEN · ARBEIT FORTSETZEN' }).click();
      await page.getByText('Arbeitet auf Bau-Nr. 25152', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'FEIERABEND' }).click();
      await page.getByText('Feierabend seit 15:00', { exact: true }).waitFor();
      assert.deepEqual(errors, [], `${size.name}: Browserfehler`);
      assert.deepEqual(external, [], `${size.name}: externe Anfrage`);
      await page.close();
      console.log(`PASS ${size.name} ${size.width}x${size.height}`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

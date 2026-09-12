const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const url = process.env.DEMO_URL || 'http://127.0.0.1:4175/';
const allowedHost = new URL(url).hostname;
const sizes = [
  { name: 'smartphone', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 1000 }
];

async function clickNav(page, view) {
  let target = page.locator('button[data-action="navigate"][data-view="' + view + '"]:visible');
  if (!await target.count()) {
    await page.locator('.profile-button:visible').click();
    target = page.locator('button[data-action="navigate"][data-view="' + view + '"]:visible');
  }
  await target.first().click();
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const size of sizes) {
      const page = await browser.newPage({ viewport: size });
      const errors = [];
      const external = [];
      page.on('pageerror', error => { errors.push(error.message); console.error('PAGEERROR ' + size.name + ': ' + error.message); });
      page.on('request', request => {
        const requestUrl = new URL(request.url());
        if (!['127.0.0.1', 'localhost', allowedHost].includes(requestUrl.hostname)) external.push(request.url());
      });
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });

      await page.getByRole('heading', { name: /Guten (Morgen|Tag|Abend), Torben/ }).waitFor();
      await page.getByText('18', { exact: true }).first().waitFor();
      await page.getByText('Demo-Annahme', { exact: true }).first().waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, size.name + ': horizontaler Überlauf');
      const sidebarDisplay = await page.locator('.sidebar').evaluate(element => getComputedStyle(element).display);
      const mobileDisplay = await page.locator('.mobile-nav').evaluate(element => getComputedStyle(element).display);
      if (size.width <= 760) { assert.equal(sidebarDisplay, 'none'); assert.notEqual(mobileDisplay, 'none'); }
      else { assert.notEqual(sidebarDisplay, 'none'); assert.equal(mobileDisplay, 'none'); }

      await clickNav(page, 'sites');
      await page.getByRole('heading', { name: 'Baustellen', exact: true }).waitFor();
      await page.locator('[data-action="open-site"][data-id="26-103"]').first().click();
      await page.getByText('Digitale Baustellenmappe', { exact: true }).waitFor();
      await page.getByText('Feuchtigkeitsschaden im Treppenhaus entdeckt und dokumentiert.', { exact: true }).waitFor();
      assert.equal(await page.getByText('Synthetisches Beispielbild', { exact: true }).count() >= 2, true);

      await clickNav(page, 'more');
      await page.locator('[data-action="switch-role"][data-role="employee"]').click();
      await page.getByRole('heading', { name: /Guten (Morgen|Tag|Abend), Max/ }).waitFor();
      await page.getByRole('button', { name: 'ARBEIT STARTEN' }).click();
      await page.getByText('Arbeit gestartet', { exact: true }).first().waitFor();
      await page.getByRole('button', { name: 'PAUSE STARTEN' }).click();
      await page.getByRole('button', { name: 'PAUSE BEENDEN' }).click();
      await page.getByRole('button', { name: 'Baustelle wechseln' }).click();
      await page.locator('form[data-form="site-switch"] select').selectOption('26-104');
      await page.getByRole('button', { name: 'Baustelle verlassen und Fahrt starten' }).click();
      await page.getByRole('button', { name: 'FAHRT BEENDEN / ARBEIT FORTSETZEN' }).click();
      await page.getByText('Bau-Nr. 26-104', { exact: true }).first().waitFor();

      await page.getByRole('button', { name: 'Zusatzarbeit', exact: true }).last().click();
      await page.locator('form[data-form="employee-action"] textarea[name="description"]').fill('Synthetische Zusatzarbeit für den Browsertest');
      await page.locator('form[data-form="employee-action"] input[name="quantity"]').fill('7');
      await page.locator('form[data-form="employee-action"] input[name="unit"]').fill('m²');
      await page.locator('form[data-form="employee-action"] input[name="photo"]').check();
      await page.locator('form[data-form="employee-action"] button.primary').click();
      await page.getByText('Zusatzarbeit in allen Ansichten ergänzt.', { exact: true }).waitFor();

      if (size.name === 'smartphone') {
        await page.getByRole('button', { name: 'Notiz / Foto', exact: true }).last().click();
        await page.locator('form[data-form="employee-action"] textarea[name="text"]').fill('Synthetische Fortschrittsnotiz aus dem Browsertest');
        await page.locator('form[data-form="employee-action"] input[name="photo"]').check();
        await page.locator('form[data-form="employee-action"] button.primary').click();
        await page.getByText('Notiz der Baustellenmappe zugeordnet.', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'Korrektur melden', exact: true }).last().click();
        await page.locator('form[data-form="employee-action"] input[name="suggestion"]').fill('07:05');
        await page.locator('form[data-form="employee-action"] textarea[name="description"]').fill('Arbeitsbeginn wurde in der Demo vergessen');
        await page.locator('form[data-form="employee-action"] button.primary').click();
        await page.getByText('Korrekturmeldung an Büro und Geschäftsführung gesendet.', { exact: true }).waitFor();
      }

      await clickNav(page, 'more');
      await page.locator('[data-action="switch-role"][data-role="management"]').click();
      if (size.name === 'desktop') {
        await page.locator('#global-search').fill('26-103');
        await page.locator('.search-result[data-id="26-103"]').click();
        await page.getByText('Digitale Baustellenmappe', { exact: true }).waitFor();
        await page.locator('#global-search').fill('Lena Muster');
        await page.locator('.search-result[data-id="M-0002"]').click();
        await page.getByText('Lena Muster', { exact: true }).first().waitFor();
        await clickNav(page, 'planning');
        const planningForm = page.locator('form[data-form="planning-change"][data-employee="M-0002"]');
        await planningForm.locator('select[name="site"]').selectOption('26-105');
        await planningForm.locator('input[name="reason"]').fill('Kurzfristige synthetische Umplanung');
        await planningForm.locator('button').click();
        await page.getByText('Tageszuordnung geändert und protokolliert.', { exact: true }).waitFor();
      }
      await clickNav(page, 'employees');
      if (size.name === 'desktop') {
        await page.getByText('Bau-Nr. 26-105', { exact: true }).first().waitFor();
      }
      await page.locator('[data-action="open-employee"][data-id="M-0001"]').first().click();
      await page.getByText('Bau-Nr. 26-104', { exact: true }).first().waitFor();
      await clickNav(page, 'extras');
      await page.getByText('Synthetische Zusatzarbeit für den Browsertest', { exact: true }).waitFor();
      if (size.name === 'desktop') {
        await page.locator('[data-action="decide-extra"][data-id="ZA-201"]').click();
        await page.locator('form[data-form="extra-decision"] select[name="decision"]').selectOption('NOT_BILLABLE');
        await page.locator('form[data-form="extra-decision"] textarea[name="reason"]').fill('Synthetische kaufmännische Entscheidung');
        await page.locator('form[data-form="extra-decision"] button.primary').click();
        await page.getByText('Entscheidung gespeichert; Vorgang bleibt erhalten.', { exact: true }).waitFor();
      }

      await clickNav(page, 'more');
      await page.locator('[data-action="switch-role"][data-role="office"]').click();
      await page.getByText('Arbeitsvorrat im Büro', { exact: false }).waitFor();
      await clickNav(page, 'times');
      await page.locator('[data-action="open-correction"][data-id="KR-002"]').click();
      await page.locator('form[data-form="time-correction"] textarea[name="reason"]').fill('Synthetische Prüfung im Browsertest');
      await page.locator('form[data-form="time-correction"] button.primary').click();
      await page.waitForFunction(() => {
        const stored = JSON.parse(localStorage.getItem('maler-meyer-demo-v6') || '{}');
        return stored.data?.corrections?.some(item => item.reason === 'Synthetische Prüfung im Browsertest');
      });

      await clickNav(page, 'more');
      await page.locator('[data-action="switch-role"][data-role="foreman"]').click();
      await clickNav(page, 'crew');
      await page.locator('input[name="employee"]').first().check();
      await page.locator('form[data-form="crew-action"] select[name="event"]').selectOption('WORK_END');
      await page.locator('form[data-form="crew-action"] button.primary').click();
      await page.getByText(/1 einzelne Buchungen gespeichert/).waitFor();
      await page.getByText(/gebucht durch Jan Testmann/).first().waitFor();

      await clickNav(page, 'more');
      await page.locator('[data-action="switch-role"][data-role="management"]').click();
      await clickNav(page, 'weeks');
      await page.locator('[data-action="open-week"][data-id="W-008"]').click();
      await page.getByText('5 Tage sichtbar', { exact: true }).first().waitFor();
      await page.locator('[data-action="approve-week"][data-id="W-008"]').click();
      await page.getByText('Wochenzettel betrieblich freigegeben.', { exact: true }).waitFor();

      if (size.name === 'desktop') {
        await clickNav(page, 'exports');
        for (const action of ['download-times', 'download-calculation', 'download-selected-week']) {
          const downloadPromise = page.waitForEvent('download');
          await page.locator('[data-action="' + action + '"]').click();
          const artifact = await downloadPromise;
          assert.match(artifact.suggestedFilename(), action === 'download-selected-week' ? /\.pdf$/ : /\.csv$/);
          assert.equal((await artifact.createReadStream()) !== null, true, action + ': Download nicht lesbar');
        }
      }

      await page.screenshot({ path: path.join(os.tmpdir(), 'maler-meyer-v6-' + size.name + '.png'), fullPage: true });
      assert.deepEqual(errors, [], size.name + ': JavaScript-Fehler');
      assert.deepEqual(external, [], size.name + ': unerwartete externe Requests');
      await page.close();
      console.log('OK ' + size.name);
    }
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

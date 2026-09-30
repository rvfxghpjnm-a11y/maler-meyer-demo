'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const url = 'http://127.0.0.1:4173/';
const storageKey = 'maler-meyer-demo-v11';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.locator('[data-action="navigate"][data-view="planning"]:visible').first().click();
  await page.locator('[data-action="new-plan-week"]').click();
  await page.locator('form[data-form="new-plan-week"] [name="monday"]').fill('2026-10-05');
  assert.equal(await page.locator('form[data-form="new-plan-week"] [name="mode"]').inputValue(), 'EMPTY');
  await page.locator('form[data-form="new-plan-week"] button.primary').click();

  let state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
  let plan = state.weekPlans.find(item => item.monday === '2026-10-05');
  assert.ok(plan.rows.every(row => row.values.every(value => value === '')), 'neue Woche muss leer starten');

  await page.locator('.planning-cell[data-employee="M-0001"][data-day="0"]').click();
  const form = page.locator('form[data-form="plan-cell"]');
  await form.locator('[name="value"]').selectOption('26-103');
  await form.locator('[name="time"]').fill('bis 12:00');
  await form.locator('[name="value2"]').selectOption('26-104');
  await form.locator('[name="time2"]').fill('ab 12:00');
  await form.locator('button.primary').click();

  await page.locator('form[data-form="plan-note"] textarea').fill('Dienstag 08:00 Uhr Termin bei Familie Beispiel');
  await page.locator('form[data-form="plan-note"] button').click();
  await page.locator('form[data-form="plan-absence"] [name="employee"]').selectOption('M-0002');
  await page.locator('form[data-form="plan-absence"] [name="value"]').selectOption({ label: 'Krank' });
  await page.locator('form[data-form="plan-absence"] [name="from"]').fill('2026-10-06');
  await page.locator('form[data-form="plan-absence"] [name="to"]').fill('2026-10-08');
  await page.locator('form[data-form="plan-absence"] button').click();

  state = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data, storageKey);
  plan = state.weekPlans.find(item => item.monday === '2026-10-05');
  assert.equal(plan.dayDetails['M-0001:0'].length, 2);
  assert.match(plan.note, /08:00/);
  assert.deepEqual(plan.rows.find(row => row.employeeId === 'M-0002').values.slice(1, 4), ['Krank', 'Krank', 'Krank']);

  await page.locator('[data-action="publish-plan"]').click();
  await page.locator('[data-action="navigate"][data-view="more"]:visible').first().click();
  await page.locator('[data-action="switch-role"][data-role="employee"]').click();
  await page.getByText('Gesamte veröffentlichte Wochenplanung ansehen', { exact: true }).waitFor();

  await page.locator('[data-action="navigate"][data-view="weeks"]:visible').first().click();
  await page.locator('[data-action="open-week"][data-id="W-001"]').click();
  await page.getByText(/Frühstück/).first().waitFor();

  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ ok: true, checks: ['neue Woche startet leer', 'zwei Tagesstationen mit Zeiten', 'Wochenhinweis', 'Abwesenheit von-bis', 'veröffentlichte Gesamtplanung nur lesend', 'getrennte Pausen im Wochenzettel'] }, null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });


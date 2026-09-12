const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');

const url = process.env.DEMO_URL || 'http://127.0.0.1:4173/';
const storageKey = 'maler-meyer-demo-v9';
const outputDir = path.join(__dirname, 'output', 'pdf');
fs.mkdirSync(outputDir, { recursive: true });

async function freshPage(browser, viewport, notificationStub = false) {
  const context = await browser.newContext({ viewport });
  if (notificationStub) {
    await context.addInitScript(() => {
      window.__demoNotifications = [];
      class DemoNotification {
        static permission = 'granted';
        static requestPermission = async () => 'granted';
        constructor(title, options) { window.__demoNotifications.push({ title, options }); }
      }
      window.Notification = DemoNotification;
    });
  }
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && !message.text().includes('icon.svg')) errors.push(message.text()); });
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator('h1').first().waitFor();
  return { context, page, errors };
}

async function switchRole(page, role) {
  await page.locator('.profile-button').click();
  await page.locator(`[data-action="switch-role"][data-role="${role}"]`).click();
}

async function navigate(page, view) {
  let button = page.locator(`[data-action="navigate"][data-view="${view}"]:visible`).first();
  if (!await button.count()) {
    await page.locator('.profile-button').click();
    button = page.locator(`[data-action="navigate"][data-view="${view}"]:visible`).first();
  }
  await button.click();
}

async function drawTouch(page, clearFirst = false) {
  const canvas = page.locator('.signature-canvas');
  await canvas.waitFor();
  const enable = page.locator('[data-signature-enable]');
  if (await enable.count() && !await canvas.evaluate(element => element.classList.contains('active'))) await enable.click();
  if (clearFirst) await page.locator('[data-signature-clear]').click();
  const box = await canvas.boundingBox();
  const points = [[.18,.58],[.28,.38],[.36,.65],[.47,.35],[.58,.61],[.71,.41],[.81,.55]];
  await canvas.dispatchEvent('pointerdown', { pointerId: 7, pointerType: 'touch', button: 0, clientX: box.x + box.width * points[0][0], clientY: box.y + box.height * points[0][1], bubbles: true });
  for (const point of points.slice(1)) {
    await canvas.dispatchEvent('pointermove', { pointerId: 7, pointerType: 'touch', button: 0, clientX: box.x + box.width * point[0], clientY: box.y + box.height * point[1], bubbles: true });
  }
  await canvas.dispatchEvent('pointerup', { pointerId: 7, pointerType: 'touch', button: 0, clientX: box.x + box.width * points.at(-1)[0], clientY: box.y + box.height * points.at(-1)[1], bubbles: true });
}

async function drawMouse(page) {
  const enable = page.locator('[data-signature-enable]');
  if (await enable.count()) await enable.click();
  const box = await page.locator('.signature-canvas').boundingBox();
  await page.mouse.move(box.x + 50, box.y + 120);
  await page.mouse.down();
  await page.mouse.move(box.x + 140, box.y + 70, { steps: 5 });
  await page.mouse.move(box.x + 230, box.y + 130, { steps: 5 });
  await page.mouse.up();
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const checks = [];
  try {
    const mobile = await freshPage(browser, { width: 390, height: 844 }, true);
    const page = mobile.page;
    await switchRole(page, 'employee');
    checks.push('schmale Mitarbeiteransicht');

    await navigate(page, 'notifications');
    await page.locator('[data-action="test-notification"]').click();
    assert.equal(await page.evaluate(() => window.__demoNotifications.length), 1);
    await page.locator('[data-action="open-notification"][data-id="NOT-001"]').click();
    await page.locator('.week-detail').waitFor();
    assert.match(await page.locator('h1').textContent(), /Wochenübersichten/);
    checks.push('Benachrichtigung öffnet KW 37 direkt');

    await page.locator('[data-action="confirm-week"][data-id="W-001"]').click();
    await page.locator('[data-signature-without]').click();
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).data.weeklySnapshots.some(item => item.sheetId === 'W-001' && item.version === 1 && !item.signatureDataUrl), storageKey);
    checks.push('Bestätigung ohne gezeichnete Unterschrift');

    await page.locator('[data-action="week-correction"][data-id="W-001"]').click();
    await page.locator('form[data-form="week-correction"] select[name="weekDay"]').selectOption('Do');
    await page.locator('form[data-form="week-correction"] select[name="bookingField"]').selectOption('start');
    await page.locator('form[data-form="week-correction"] textarea[name="description"]').fill('Arbeitsbeginn wurde fünf Minuten zu spät dokumentiert.');
    await page.locator('form[data-form="week-correction"] input[name="suggestion"]').fill('07:10');
    await page.locator('form[data-form="week-correction"] button.primary').click();
    assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data.weeklySheets.find(item => item.id === 'W-001').status, storageKey), 'CORRECTION_REQUESTED');
    checks.push('Korrektur nach Bestätigung angefordert');

    await switchRole(page, 'office');
    await navigate(page, 'times');
    const requestId = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data.correctionRequests.find(item => item.sheetId === 'W-001' && item.status === 'OPEN').id, storageKey);
    await page.locator(`[data-action="open-correction"][data-id="${requestId}"]`).click();
    await page.locator(`form[data-form="time-correction"][data-id="${requestId}"] textarea[name="reason"]`).fill('Mit Mitarbeiter im synthetischen Testfall geprüft.');
    await page.locator(`form[data-form="time-correction"][data-id="${requestId}"] button[data-action="submit-correction"]`).click();
    await page.waitForFunction(key => {
      const data = JSON.parse(localStorage.getItem(key)).data;
      const sheet = data.weeklySheets.find(item => item.id === 'W-001');
      const old = data.weeklySnapshots.find(item => item.sheetId === 'W-001' && item.version === 1);
      return sheet.version === 2 && sheet.status === 'NEEDS_RECONFIRM' && old.supersededByVersion === 2 && !sheet.confirmedSnapshotId;
    }, storageKey);
    checks.push('Bürokorrektur erzeugt Version 2 und erhält Version 1');

    await switchRole(page, 'employee');
    await navigate(page, 'weeks');
    if (!await page.locator('.week-detail').count()) await page.locator('[data-action="open-week"][data-id="W-001"]').click();
    await page.locator('[data-action="confirm-week"][data-id="W-001"]').click();
    await drawTouch(page);
    await page.locator('[data-signature-clear]').click();
    await drawTouch(page);
    await page.locator('[data-signature-save]').click();
    await page.waitForFunction(key => {
      const snapshots = JSON.parse(localStorage.getItem(key)).data.weeklySnapshots.filter(item => item.sheetId === 'W-001');
      const v1 = snapshots.find(item => item.version === 1);
      const v2 = snapshots.find(item => item.version === 2);
      return snapshots.length === 2 && !v1.signatureDataUrl && v2.signatureDataUrl?.startsWith('data:image/png');
    }, storageKey);
    checks.push('Touch-Signatur löschen, neu zeichnen und nur auf Version 2 speichern');

    await navigate(page, 'today');
    await page.locator('[data-action="open-employee-action"][data-kind="extra"]').first().click();
    await page.locator('[data-action="load-extra-scenario"]').click();
    await page.locator('form[data-form="employee-action"] input[name="confirmAfter"]').check();
    await page.locator('form[data-form="employee-action"] button.primary').click();
    await page.locator('form[data-form="extra-confirm-details"]').waitFor();
    await page.locator('form[data-form="extra-confirm-details"] button.primary').click();
    await drawTouch(page);
    await page.locator('[data-signature-save]').click();
    const newExtraId = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).data.extras[0].id, storageKey);
    await page.waitForFunction(({ key, id }) => JSON.parse(localStorage.getItem(key)).data.extraConfirmations.some(item => item.extraId === id && item.content.quantity === '18'), { key: storageKey, id: newExtraId });
    checks.push('Zusatzarbeit 26-104 mit Vor-Ort-Bestätigung und 18 m²');

    await page.locator(`[data-action="edit-extra"][data-id="${newExtraId}"]`).click();
    await page.locator('form[data-form="extra-edit"] input[name="quantity"]').fill('24');
    await page.locator('form[data-form="extra-edit"] button.primary').click();
    await page.waitForFunction(({ key, id }) => {
      const data = JSON.parse(localStorage.getItem(key)).data;
      const extra = data.extras.find(item => item.id === id);
      const first = data.extraConfirmations.find(item => item.extraId === id);
      return extra.quantity === '24' && first.content.quantity === '18';
    }, { key: storageKey, id: newExtraId });
    checks.push('Änderung 18 m² auf 24 m² lässt alten Snapshot unverändert');

    await page.locator(`[data-action="confirm-extra"][data-id="${newExtraId}"]`).click();
    await page.locator('form[data-form="extra-confirm-details"] input[name="confirmerName"]').fill('Robin Muster');
    await page.locator('form[data-form="extra-confirm-details"] input[name="confirmerRole"]').fill('Bauleitung (synthetisch)');
    await page.locator('form[data-form="extra-confirm-details"] button.primary').click();
    await page.locator('[data-signature-without]').click();
    await page.waitForFunction(({ key, id }) => {
      const records = JSON.parse(localStorage.getItem(key)).data.extraConfirmations.filter(item => item.extraId === id);
      return records.length === 2 && records.some(item => item.content.quantity === '18') && records.some(item => item.content.quantity === '24');
    }, { key: storageKey, id: newExtraId });
    checks.push('neue Bestätigung für geänderten Zusatzarbeitsstand');

    await navigate(page, 'weeks');
    if (!await page.locator('.week-detail').count()) await page.locator('[data-action="open-week"][data-id="W-001"]').click();
    const weekPopupPromise = page.waitForEvent('popup');
    await page.locator('[data-action="print-week-snapshot"]').first().click();
    const weekPopup = await weekPopupPromise;
    await weekPopup.waitForLoadState('domcontentloaded');
    await weekPopup.pdf({ path: path.join(outputDir, 'confirmed-weekly-sheet-demo.pdf'), format: 'A4', landscape: true, printBackground: true });

    await navigate(page, 'today');
    await page.locator('.confirmation-history summary').first().click();
    const printExtra = page.locator(`[data-action="print-extra-confirmation"]`).first();
    const extraPopupPromise = page.waitForEvent('popup');
    await printExtra.click();
    const extraPopup = await extraPopupPromise;
    await extraPopup.waitForLoadState('domcontentloaded');
    await extraPopup.pdf({ path: path.join(outputDir, 'extra-work-confirmation-demo.pdf'), format: 'A4', printBackground: true });
    checks.push('beide bestätigten Druckansichten als PDF gerendert');

    assert.deepEqual(mobile.errors, []);
    await mobile.context.close();

    for (const setup of [
      { name: 'tablet-touch', viewport: { width: 1024, height: 1366 }, pointer: 'touch' },
      { name: 'desktop-mouse', viewport: { width: 1440, height: 1000 }, pointer: 'mouse' }
    ]) {
      const test = await freshPage(browser, setup.viewport);
      await switchRole(test.page, 'employee');
      await navigate(test.page, 'weeks');
      await test.page.locator('[data-action="open-week"][data-id="W-001"]').click();
      await test.page.locator('[data-action="confirm-week"][data-id="W-001"]').click();
      if (setup.pointer === 'touch') await drawTouch(test.page); else await drawMouse(test.page);
      await test.page.locator('[data-signature-save]').click();
      await test.page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).data.weeklySnapshots.some(item => item.sheetId === 'W-001' && item.signatureDataUrl), storageKey);
      assert.ok(await test.page.locator('.content').evaluate(element => element.scrollWidth <= element.clientWidth + 2));
      assert.deepEqual(test.errors, []);
      checks.push(setup.name + ' Signatur und Layout');
      await test.context.close();
    }

    console.log(JSON.stringify({ ok: true, checks, pdfs: ['confirmed-weekly-sheet-demo.pdf', 'extra-work-confirmation-demo.pdf'] }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });

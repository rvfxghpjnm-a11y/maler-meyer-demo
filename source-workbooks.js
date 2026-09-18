'use strict';

// Synthetic reconstruction of the observed worksheet relationships. No source
// workbook, customer row, employee, supplier, price, or source rate is embedded.
(function exposeSourceWorkbooks() {
  function c(value, style, formula) { return { v: value, s: style || 0, f: formula || '' }; }
  function amount(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
  function put(rows, row, col, value) {
    if (!rows[row - 1]) rows[row - 1] = [];
    rows[row - 1][col - 1] = value;
  }
  function group(db, site, type) {
    return (db.projectCostEntries || []).filter(function (item) { return item.site === site && item.type === type; });
  }
  function safeSheetName(value) { return String(value).replace(/[\\/?*\[\]:]/g, '-').slice(0, 31); }

  function projectSheet(db, original, linkedToMain) {
    const x = window.MMExcel.account(db, original);
    const rows = Array.from({ length: 278 }, function () { return []; });
    const site = safeSheetName(x.site);
    put(rows, 2, 1, x.site);
    put(rows, 2, 3, x.project);
    put(rows, 4, 1, 'Kalenderwoche');
    put(rows, 4, 4, 'Gesellen-Stunden');
    put(rows, 4, 15, 'Fahrzeit roh');
    put(rows, 4, 29, 'Azubi-Stunden');
    put(rows, 6, 2, 'Summe:');
    put(rows, 6, 3, c(x.acceptedHours, 5, 'SUM(D6:M6)'));
    put(rows, 6, 4, c(x.acceptedHours, 5, 'SUM(D7:D58)'));
    for (let col = 5; col <= 13; col += 1) put(rows, 6, col, c(0, 5, 'SUM(' + letter(col) + '7:' + letter(col) + '58)'));
    put(rows, 6, 15, c(x.travelHoursRaw, 5, 'SUM(O7:O60)'));
    put(rows, 6, 28, c(x.traineeHours, 5, 'SUM(AC6:AL6)'));
    put(rows, 6, 29, c(x.traineeHours, 5, 'SUM(AC7:AC58)'));
    for (let col = 30; col <= 38; col += 1) put(rows, 6, col, c(0, 5, 'SUM(' + letter(col) + '7:' + letter(col) + '58)'));
    [0.22, 0.27, 0.25, 0.26].forEach(function (fraction, i) {
      const r = 7 + i;
      put(rows, r, 1, 'KW ' + (34 + i));
      put(rows, r, 4, c(Number((amount(x.acceptedHours) * fraction).toFixed(3)), 5));
      put(rows, r, 15, c(Number((amount(x.travelHoursRaw) * fraction).toFixed(3)), 5));
      put(rows, r, 29, c(Number((amount(x.traineeHours) * fraction).toFixed(3)), 5));
    });
    put(rows, 7, 21, 'geschriebene Rechnungen');
    put(rows, 8, 21, 'Datum'); put(rows, 8, 22, 'Beleg'); put(rows, 8, 23, 'Netto-Betrag');
    const projectBills = (db.billingRecords || []).filter(function (bill) { return bill.site === x.site; });
    projectBills.slice(0, 49).forEach(function (bill, i) {
      const r = i + 9;
      put(rows, r, 21, bill.date); put(rows, r, 22, bill.reference); put(rows, r, 23, c(amount(bill.net), 4));
    });
    put(rows, 58, 22, 'Summe');
    let invoiceFormula = 'SUM(W8:W57)';
    projectBills.slice(49).forEach(function (bill, i) {
      const r = 281 + i;
      put(rows, r, 21, bill.date); put(rows, r, 22, bill.reference); put(rows, r, 23, c(amount(bill.net), 4));
      invoiceFormula = invoiceFormula.slice(0, -1) + ',W' + r + ')';
    });
    put(rows, 58, 23, c(x.writtenInvoices, 4, invoiceFormula));
    put(rows, 61, 1, 'Materialverbrauch:');
    put(rows, 63, 1, 'Menge'); put(rows, 63, 2, 'Einheit'); put(rows, 63, 3, 'Artikel'); put(rows, 63, 9, 'EP'); put(rows, 63, 11, 'GP');
    put(rows, 64, 1, 'Materialanforderungen:');
    const overflow = [];
    const material = group(db, x.site, 'MATERIAL_EXTERNAL');
    const unpriced = (db.projectMaterialItems || []).filter(function (item) { return item.site === x.site && (item.unitPrice == null || !Number.isFinite(Number(item.unitPrice))); });
    material.forEach(function (item, i) {
      const r = 65 + i;
      if (r > 238) { overflow.push({ type: 'Material', item: item, sumRow: 239 }); return; }
      put(rows, r, 1, c(1)); put(rows, r, 2, 'Position'); put(rows, r, 3, item.description);
      put(rows, r, 9, c(amount(item.net), 4)); put(rows, r, 11, c(amount(item.net), 4, 'A' + r + '*I' + r));
    });
    unpriced.forEach(function (item, i) {
      const r = 65 + material.length + i;
      if (r > 238) {
        const extraRow = 281 + projectBills.slice(49).length + i;
        put(rows, extraRow, 1, c(amount(item.quantity))); put(rows, extraRow, 2, item.unit);
        put(rows, extraRow, 3, item.article); put(rows, extraRow, 9, 'Preis offen');
        return;
      }
      put(rows, r, 1, c(amount(item.quantity))); put(rows, r, 2, item.unit); put(rows, r, 3, item.article);
      put(rows, r, 9, 'Preis offen');
    });
    put(rows, 239, 1, 'Gesamtsumme Material');
    put(rows, 239, 11, c(x.material, 4, 'SUM(K65:K238)'));
    function costBlock(type, label, first, last, sumRow, total) {
      const entries = group(db, x.site, type);
      put(rows, first - 2, 1, label);
      entries.forEach(function (item, i) {
        const r = first + i;
        if (r > last) { overflow.push({ type: label, item: item, sumRow: sumRow }); return; }
        put(rows, r, 1, c(1)); put(rows, r, 3, item.description);
        put(rows, r, 9, c(amount(item.net), 4)); put(rows, r, 11, c(amount(item.net), 4, 'A' + r + '*I' + r));
      });
      put(rows, sumRow, 1, 'Gesamtsumme ' + label);
      put(rows, sumRow, 11, c(total, 4, 'SUM(K' + first + ':L' + last + ')'));
    }
    costBlock('LIFT', 'Lift', 242, 243, 244, x.lift);
    costBlock('SUBCONTRACTOR', 'Subunternehmer', 247, 255, 256, x.subcontractor);
    costBlock('TEMP_STAFF', 'Zeitarbeitsfirmen', 259, 265, 266, x.tempStaff);
    costBlock('SCAFFOLD_WASTE', 'Gerüste + Müllentsorgung', 269, 270, 271, x.scaffoldWaste);
    const other = group(db, x.site, 'OTHER').slice();
    if (amount(x.carryover)) other.push({ description: 'Synthetischer Übertrag', net: x.carryover });
    other.forEach(function (item, i) {
      const r = 274 + i;
      if (r > 275) { overflow.push({ type: 'Sonstiges', item: item, sumRow: 276 }); return; }
      put(rows, r, 1, c(1)); put(rows, r, 3, item.description);
      put(rows, r, 9, c(amount(item.net), 4)); put(rows, r, 11, c(amount(item.net), 4, 'A' + r + '*I' + r));
    });
    put(rows, 272, 1, 'Sonstiges / Übertrag');
    put(rows, 276, 1, 'Gesamtsumme Sonstiges');
    put(rows, 276, 11, c(x.otherAndCarryover, 4, 'SUM(K274:L275)'));
    if (overflow.length) {
      put(rows, 280, 1, 'Weitere Demo-Positionen bei mehr Einträgen als im Papierlayout');
      overflow.forEach(function (entry, i) {
        const r = 281 + projectBills.slice(49).length + unpriced.length + i;
        put(rows, r, 1, c(1)); put(rows, r, 2, entry.type); put(rows, r, 3, entry.item.description);
        put(rows, r, 9, c(amount(entry.item.net), 4)); put(rows, r, 11, c(amount(entry.item.net), 4, 'A' + r + '*I' + r));
      });
      [239, 244, 256, 266, 271, 276].forEach(function (sumRow) {
        const matching = overflow.map(function (entry, i) { return entry.sumRow === sumRow ? 'K' + (281 + projectBills.slice(49).length + unpriced.length + i) : null; }).filter(Boolean);
        if (matching.length) rows[sumRow - 1][10].f = rows[sumRow - 1][10].f.slice(0, -1) + ',' + matching.join(',') + ')';
      });
    }
    if (linkedToMain) put(rows, 1, 1, 'Projektblatt · ' + site);
    else put(rows, 1, 1, 'Projekt-Unterkonto · ' + site);
    return { name: site, rows: rows, widths: [16, 18, 32, 12, 11, 11, 11, 11, 14, 10, 16, 11, 11, 4, 15, 11, 11, 11, 11, 4, 15, 22, 18, 10, 10, 10, 10, 14, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11], freeze: { rows: 6, cols: 3 }, landscape: true };
  }

  function letter(col) { let result = ''; for (let n = col; n; n = Math.floor((n - 1) / 26)) result = String.fromCharCode(65 + (n - 1) % 26) + result; return result; }
  function assumptions() {
    return { name: 'Demo-Annahmen', rows: [['Synthetische Kalkulationsannahme'], ['Demo-Stundensatz', c(window.MMExcel.demoRate, 4)], ['Dieser Wert stammt ausdrücklich nicht aus den Originaldateien.']], widths: [30, 18, 40], freeze: { rows: 0, cols: 0 }, landscape: false };
  }
  function calculation(db) {
    const rows = [['Bauliste 2026'], ['30Min/60Min', 'Bau-Nr.', '', 'Bauvorhaben', '', 'Angebotssumme netto', 'Std. Vorgabe · Demo-Satz', 'Gesellen tatsächlich ben. Stunden', 'Stunden Fahrzeiten roh', 'Azubi Stunden', 'Stundenumsatz', 'Kosten Zeitpersonal', 'Kosten Material (Netto)', 'Kosten Lift', 'Kosten Subunternehmer', 'Kosten Gerüste + Müll', 'Übertrag / Kosten Sonstiges', 'Gesamtkosten', 'geschriebene Rechnungen', 'Ergebnis', 'aktueller Stundenwert'], []];
    const projects = (db.projectAccounts || []).map(function (account) { return projectSheet(db, account, true); });
    (db.projectAccounts || []).forEach(function (original, i) {
      const x = window.MMExcel.account(db, original);
      const row = i + 4;
      const name = safeSheetName(x.site).replace(/'/g, "''");
      const link = function (cellAddress) { return "'" + name + "'!" + cellAddress; };
      rows.push(['', x.site, '', x.project, x.manager, c(x.offerNet, 4), c(x.plannedHoursCalculated, 5, 'IF(\'Demo-Annahmen\'!$B$2=0,"",F' + row + '/\'Demo-Annahmen\'!$B$2)'), c(x.acceptedHours, 5, link('C6')), c(x.travelHoursRaw, 5, link('O6')), c(x.traineeHours, 5, link('AB6')), c(x.hourlyRevenue == null ? '' : x.hourlyRevenue, 4, 'IF(H' + row + '=0,"",F' + row + '/H' + row + ')'), c(x.tempStaff, 4, link('K266')), c(x.material, 4, link('K239')), c(x.lift, 4, link('K244')), c(x.subcontractor, 4, link('K256')), c(x.scaffoldWaste, 4, link('K271')), c(x.otherAndCarryover, 4, link('K276')), c(x.totalCosts, 4, 'H' + row + '*\'Demo-Annahmen\'!$B$2+M' + row + '+N' + row + '+O' + row + '+P' + row + '+Q' + row + '+L' + row), c(x.writtenInvoices, 4, link('W58')), c(x.result, 4, 'S' + row + '-R' + row), c(x.currentHourlyValue == null ? '' : x.currentHourlyValue, 4, 'IF(H' + row + '=0,"",(S' + row + '-L' + row + '-M' + row + '-N' + row + '-O' + row + '-P' + row + '-Q' + row + ')/H' + row + ')')]);
    });
    return [{ name: 'Bau-Nr.-Liste', rows: rows, widths: [15, 13, 4, 35, 17, 19, 18, 18, 15, 14, 17, 17, 17, 14, 19, 18, 20, 18, 20, 18, 19], freeze: { rows: 2, cols: 4 }, landscape: true }, assumptions()].concat(projects);
  }
  function project(db, site) {
    const selected = (db.projectAccounts || []).find(function (item) { return item.site === site; });
    return selected ? [projectSheet(db, selected, false), assumptions()] : [];
  }
  window.MMSourceWorkbooks = { calculation: calculation, project: project, projectSheet: projectSheet };
}());

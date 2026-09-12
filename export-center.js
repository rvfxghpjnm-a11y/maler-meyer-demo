'use strict';

(function exposeExportCenter() {
  const statusLabels = { OFFEN: 'offen', VORBEREITUNG: 'kommt / in Vorbereitung', GESCHRIEBEN: 'geschrieben', RUECKFRAGE: 'Rückfrage' };

  function h(value) {
    return String(value == null ? '' : value).replace(/[&<>\"]/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]; });
  }
  function isoToDe(value) { const parts = String(value || '').split('-'); return parts.length === 3 ? parts[2] + '.' + parts[1] + '.' + parts[0] : value; }
  function project(db, number) { return db.sites.find(function (item) { return item.number === number; }) || db.sites[0]; }
  function employee(db, id) { return db.employees.find(function (item) { return item.id === id; }) || db.employees[0]; }
  function selectOptions(items, value, label) { return items.map(function (item) { return '<option value="' + h(value(item)) + '">' + h(label(item)) + '</option>'; }).join(''); }
  function button(label, action, kind, extra) { return '<button class="' + (kind === 'primary' ? 'primary' : 'secondary') + '" data-mm-action="' + action + '" ' + (extra || '') + '>' + h(label) + '</button>'; }
  function formatMoney(value) { return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value); }

  function render(db) {
    const projectOptions = selectOptions(db.sites, function (item) { return item.number; }, function (item) { return item.number + ' · ' + item.name; });
    const employeeOptions = selectOptions(db.employees, function (item) { return item.id; }, function (item) { return item.name; });
    const weekOptions = db.weekPlans.map(function (item) { return '<option value="' + item.week + '">KW ' + item.week + '</option>'; }).join('');
    return headBlock() +
      '<section class="card card-pad export-controls"><div><label>Baustelle / Bau-Nr.<select id="mm-export-project">' + projectOptions + '</select></label></div><div><label>Mitarbeiter<select id="mm-export-employee">' + employeeOptions + '</select></label></div><div><label>Planungswoche<select id="mm-export-week">' + weekOptions + '</select></label></div></section>' +
      '<section class="section"><div class="section-title"><h2>Besonders wichtige Übergangsexporte</h2><span class="meta">an den heutigen Unterlagen orientiert</span></div><div class="export-grid mm-export-grid">' +
        exportCard('Arbeitszeitnachweis / Wochenzettel', 'Querformat mit mehreren Abschnitten je Tag, Legende und Unterschriften.', [button('PDF / Druckansicht', 'print', 'primary', 'data-template="timesheet"'), button('Zeitdaten als CSV', 'csv-times', '', '')], 'PDF · CSV') +
        exportCard('Wochenplanung', 'Wochenmatrix für Mitarbeiter, Auszubildende und Subunternehmer.', [button('XLSX herunterladen', 'xlsx-planning', 'primary'), button('PDF / Druckansicht', 'print', '', 'data-template="planning"')], 'XLSX · PDF') +
        exportCard('Bauliste 2026 / Nachkalkulation', 'Jahresübersicht mit Bau-Nr., Stunden-Rohdaten, Kostenblöcken und klar offenen Kennzahlen.', [button('XLSX herunterladen', 'xlsx-calculation', 'primary')], 'XLSX') +
        exportCard('Projekt-Unterkonto', 'Projektblatt mit Stunden, Rechnungen, Material und weiteren Kostenblöcken.', [button('XLSX herunterladen', 'xlsx-project', 'primary')], 'XLSX') +
        exportCard('Rechnung schreiben?', 'Laufende Büroliste mit dem heutigen einfachen Spaltenaufbau.', [button('XLSX herunterladen', 'xlsx-invoices', 'primary'), button('CSV herunterladen', 'csv-invoices'), button('PDF / Druckansicht', 'print', '', 'data-template="invoice-list"')], 'XLSX · CSV · PDF') +
        exportCard('Arbeitszettel', 'Baustellenblatt mit Aufgaben, Zusatzarbeiten, Material und Zugangsinformation.', [button('PDF / Druckansicht', 'print', 'primary', 'data-template="work-order"')], 'PDF') +
      '</div></section>' +
      '<section class="section"><div class="section-title"><h2>Baustellenformulare</h2><span class="meta">kontextbezogen über die Bau-Nr.</span></div><div class="export-grid mm-export-grid">' +
        exportCard('Materialanforderung', 'Zwei Materiallisten mit Mengenfeldern, Datum und Unterschrift.', [button('PDF / Druckansicht', 'print', 'primary', 'data-template="material-request"')], 'PDF') +
        exportCard('Materialeinsatz', 'Artikel, Farbton und Ort / Gegenstand. Keine erfundene Mengenspalte.', [button('PDF / Druckansicht', 'print', 'primary', 'data-template="material-usage"')], 'PDF') +
        exportCard('Tageslohnnachweis', 'Arbeitsaufwand, Art der Arbeit, Materialaufwand und Unterschriften.', [button('PDF / Druckansicht', 'print', 'primary', 'data-template="day-work"')], 'PDF') +
        exportCard('Aufmaß', 'Originalspalten mit manuell befüllten synthetischen Werten; Fachformel bleibt offen.', [button('PDF / Druckansicht', 'print', 'primary', 'data-template="measurement"')], 'PDF') +
        exportCard('Baubesprechungsprotokoll', 'Teilnehmer und großer linierter Protokollbereich.', [button('PDF / Druckansicht', 'print', 'primary', 'data-template="protocol"')], 'PDF') +
        exportCard('Urlaubsantrag', 'Originalnahes Formular; digitaler Freigabeprozess bleibt Demo-Annahme.', [button('PDF / Druckansicht', 'print', 'primary', 'data-template="leave"')], 'PDF') +
        exportCard('Angebot', 'Zweiseitige Druckvorlage mit Positionen, Übertrag und Summen.', [button('PDF / Druckansicht', 'print', 'primary', 'data-template="offer"')], 'PDF') +
      '</div></section>' +
      renderDigitalProcesses(db) +
      '<p class="assumption"><strong>Klare Grenze</strong><span>Fahrt wird nur roh ausgewiesen. Lohn, Überstunden, Aufmaßformeln und rechtliche Wirkungen von Unterschriften bleiben OFFEN.</span></p>';
  }

  function headBlock() {
    return '<div class="page-head"><div><h1>Dokumente & Exporte</h1><p>Originalnahe Demo-Ausgaben mit vollständig erfundenen Daten</p></div><span class="demo-context">TESTSYSTEM</span></div><div class="export-intro"><strong>Die Bau-Nr. verbindet alle Unterlagen.</strong><p>Wähle oben Baustelle, Mitarbeiter und Woche. Jeder Export wird daraus als synthetisches Beispiel erzeugt.</p></div>';
  }
  function exportCard(title, text, buttons, type) {
    return '<article class="card export-card mm-export-card"><span class="export-icon">' + h(type) + '</span><h3>' + h(title) + '</h3><p>' + h(text) + '</p><div class="form-actions">' + buttons.join('') + '</div></article>';
  }

  function renderDigitalProcesses(db) {
    const lastRequests = db.materialRequests.slice(-2).map(function (request) {
      return '<li><strong>Bau-Nr. ' + h(request.site) + '</strong> · ' + request.items.map(function (item) { return h(item.quantity + ' ' + item.unit + ' ' + item.article); }).join(', ') + '</li>';
    }).join('');
    const rest = db.restTasks.map(function (task) {
      return '<article class="audit-box"><strong>Bau-Nr. ' + h(task.site) + ' · ' + h(task.area) + '</strong><p>' + h(task.description) + '</p><small>' + h(task.author) + ' · ' + h(task.date) + ' · ' + h(task.status.toLowerCase()) + '</small></article>';
    }).join('');
    const invoices = db.supplierInvoices.map(function (item) {
      return '<article class="document-row"><span><strong>' + h(item.supplier) + ' · ' + h(item.invoiceNumber) + '</strong><small>' + h(item.site ? 'Bau-Nr. ' + item.site : 'Bau-Nr. noch zuordnen') + ' · ' + h(formatMoney(item.total)) + '</small></span><span class="badge ' + (item.site ? 'ok' : 'warn') + '">' + h(item.site ? 'zugeordnet' : 'offen') + '</span></article>';
    }).join('');
    return '<section class="section"><div class="section-title"><h2>Bedienbare Demo-Prozesse</h2><span class="meta">lokal im Browser</span></div><div class="detail-grid">' +
      '<section class="detail-block"><h3>Materialanforderung erfassen</h3><form data-mm-form="material-request"><label>Menge<input name="quantity" type="number" min="0.1" step="0.1" value="2" required></label><label>Artikel<select name="article">' + db.materialCatalog.map(function (item) { return '<option value="' + h(item.id) + '">' + h(item.article + ' · ' + item.unit) + '</option>'; }).join('') + '</select></label><button class="primary">Anforderung speichern</button></form><ul class="compact-list">' + lastRequests + '</ul></section>' +
      '<section class="detail-block"><h3>Materialeinsatz erfassen</h3><form data-mm-form="material-usage"><label>Artikel<input name="article" value="Innenfarbe weiss" required></label><label>Farbton<input name="color" value="Reinweiss (Demo)" required></label><label>Ort / Gegenstand<input name="place" value="Flur, 1. OG" required></label><button class="primary">Materialeinsatz speichern</button></form></section>' +
      '<section class="detail-block full-span"><h3>Digitale Restarbeiten / offene Punkte</h3><div class="list">' + rest + '</div><form class="inline-demo-form" data-mm-form="rest-task"><label>Bereich<input name="area" value="Treppenhaus" required></label><label>Beschreibung<input name="description" value="Letzten Anstrich nach Trocknung prüfen." required></label><button class="secondary">Restarbeit ergänzen</button></form></section>' +
      '<section class="detail-block full-span"><h3>Synthetischer Rechnungseingang</h3><p>Der Importfall zeigt nur die spätere Zuordnung einer Lieferantenrechnung zur Bau-Nr. Es findet keine OCR statt.</p>' + invoices + '<button class="secondary" data-mm-action="assign-supplier">Offenen Demo-Beleg der gewählten Bau-Nr. zuordnen</button></section>' +
    '</div></section>';
  }

  function selected(db, target) {
    const siteSelect = document.getElementById('mm-export-project');
    const employeeSelect = document.getElementById('mm-export-employee');
    const weekSelect = document.getElementById('mm-export-week');
    return {
      site: target && target.dataset.site ? target.dataset.site : (siteSelect ? siteSelect.value : db.sites[0].number),
      employeeId: employeeSelect ? employeeSelect.value : db.employees[0].id,
      week: Number(target && target.dataset.week ? target.dataset.week : (weekSelect ? weekSelect.value : db.weekPlans[db.weekPlans.length - 1].week))
    };
  }

  function handleAction(target, db, hooks) {
    const action = target.dataset.mmAction;
    if (!action) return false;
    const pick = selected(db, target);
    if (action === 'print') openPrint(db, target.dataset.template, pick);
    if (action === 'xlsx-planning') saveXlsx('Maler-Meyer-Demo-Wochenplanung.xlsx', planningWorkbook(db));
    if (action === 'xlsx-calculation') saveXlsx('Maler-Meyer-Demo-Bauliste-2026.xlsx', calculationWorkbook(db));
    if (action === 'xlsx-project') saveXlsx('Maler-Meyer-Demo-Projekt-' + pick.site + '.xlsx', projectWorkbook(db, pick.site));
    if (action === 'xlsx-invoices') saveXlsx('Maler-Meyer-Demo-Rechnung-schreiben.xlsx', invoiceWorkbook(db));
    if (action === 'csv-times') saveCsv('Maler-Meyer-Demo-Zeitdaten.csv', timeRows(db));
    if (action === 'csv-invoices') saveCsv('Maler-Meyer-Demo-Rechnung-schreiben.csv', invoiceRows(db));
    if (action === 'assign-supplier') {
      const item = db.supplierInvoices.find(function (invoice) { return !invoice.site; });
      if (item) { item.site = pick.site; item.status = 'ZUGEORDNET'; hooks.save(); hooks.toast('Synthetischer Beleg wurde Bau-Nr. ' + pick.site + ' zugeordnet.'); }
      else hooks.toast('Alle synthetischen Belege sind bereits zugeordnet.');
      return true;
    }
    if (action.indexOf('xlsx-') === 0) hooks.toast('XLSX mit synthetischen Daten erstellt.');
    if (action.indexOf('csv-') === 0) hooks.toast('CSV mit synthetischen Daten erstellt.');
    return true;
  }

  function handleSubmit(form, values, db, hooks) {
    const kind = form.dataset.mmForm;
    if (!kind) return false;
    const pick = selected(db);
    if (kind === 'material-request') {
      const article = db.materialCatalog.find(function (item) { return item.id === values.get('article'); });
      db.materialRequests.push({ id: 'MA-' + Date.now(), site: pick.site, date: '2026-09-10', requestedBy: pick.employeeId, items: [{ article: article.article, unit: article.unit, quantity: Number(values.get('quantity')) }] });
      hooks.save(); hooks.toast('Materialanforderung für Bau-Nr. ' + pick.site + ' gespeichert.'); return true;
    }
    if (kind === 'material-usage') {
      db.materialUsage.push({ id: 'ME-' + Date.now(), site: pick.site, date: '2026-09-10', article: values.get('article'), color: values.get('color'), place: values.get('place') });
      hooks.save(); hooks.toast('Materialeinsatz für Bau-Nr. ' + pick.site + ' gespeichert.'); return true;
    }
    if (kind === 'rest-task') {
      db.restTasks.unshift({ id: 'RT-' + Date.now(), site: pick.site, date: '2026-09-10', author: employee(db, pick.employeeId).name, category: 'Restarbeit', area: values.get('area'), description: values.get('description'), status: 'OFFEN', history: ['10.09. · als Demo-Eintrag angelegt'] });
      hooks.save(); hooks.toast('Restarbeit in der Baustellenmappe ergänzt.'); return true;
    }
    return false;
  }

  function openPrint(db, template, pick) {
    const views = {
      timesheet: timesheetHtml, planning: planningHtml, 'invoice-list': invoiceListHtml,
      'work-order': workOrderHtml, 'material-request': materialRequestHtml, 'material-usage': materialUsageHtml,
      'day-work': dayWorkHtml, measurement: measurementHtml, protocol: protocolHtml, leave: leaveHtml, offer: offerHtml
    };
    const build = views[template];
    if (!build) return;
    const result = build(db, pick);
    if (template === 'day-work') result.body = result.body.replace('<main class="page">', '<main class="page daywork-doc">');
    if (template === 'work-order') result.body = result.body.replace('<main class="page">', '<main class="page workorder-doc">');
    if (template === 'material-usage') result.body = result.body.replace('<main class="page">', '<main class="page materialusage-doc">');
    if (template === 'protocol') result.body = result.body.replace('<main class="page">', '<main class="page protocol-doc">');
    if (template === 'leave') result.body = result.body.replace('<main class="page">', '<main class="page leave-doc">');
    if (template === 'offer') result.body = result.body.replace(/<main class="page/g, '<main class="page offer-doc');
    const popup = window.open('', '_blank');
    if (!popup) { alert('Bitte Pop-ups für die Druckansicht erlauben.'); return; }
    popup.document.open(); popup.document.write(printDocument(result.title, result.body, result.orientation || 'portrait')); popup.document.close();
  }

  function printDocument(title, body, orientation) {
    return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + h(title) + '</title><style>' + printCss(orientation) + compactPrintCss() + '</style></head><body><div class="printbar"><strong>TESTSYSTEM · ausschließlich synthetische Daten</strong><button onclick="window.print()">Drucken / als PDF sichern</button></div>' + body + '</body></html>';
  }

  function compactPrintCss() {
    return '.planning-doc{font-size:7pt}.planning-doc .doc-head{margin-bottom:7px}.planning-doc th,.planning-doc td{padding:2px 3px;line-height:1.1}.timesheet-doc{font-size:8pt}.timesheet-doc .doc-head{margin-bottom:7px}.timesheet-doc th,.timesheet-doc td{padding:2px 3px;line-height:1.05}.timesheet-doc .signatures{margin-top:8px}.timesheet-doc .signature{padding-top:12px}.daywork-doc{font-size:8pt}.daywork-doc .doc-head{margin-bottom:8px}.daywork-doc .section-title{margin:11px 0 5px}.daywork-doc th,.daywork-doc td{padding:3px 4px}.daywork-doc .writing-lines div{height:17px}.daywork-doc .signatures{margin-top:12px}.daywork-doc .signature{padding-top:12px}.workorder-doc .field{grid-template-columns:155px 1fr;font-size:9pt}.materialusage-doc{font-size:8pt}.materialusage-doc .doc-head{margin-bottom:8px}.materialusage-doc th,.materialusage-doc td{padding:3px 4px}.protocol-doc{font-size:8pt}.protocol-doc .doc-head{margin-bottom:8px}.protocol-doc .section-title{margin:11px 0 5px}.protocol-doc .writing-lines div{height:17px}.leave-doc .demo-watermark,.offer-doc .demo-watermark{position:static;text-align:right;margin-bottom:6px}';
  }
  function printCss(orientation) {
    return '@page{size:A4 ' + orientation + ';margin:12mm}*{box-sizing:border-box}body{margin:0;color:#181818;font:10pt Arial,sans-serif;background:#e9edf0}.printbar{position:sticky;top:0;z-index:3;display:flex;justify-content:space-between;align-items:center;padding:12px 20px;background:#17324d;color:white}.printbar button{border:0;border-radius:7px;background:#fff;padding:10px 15px;font-weight:700}.page{width:' + (orientation === 'landscape' ? '297mm' : '210mm') + ';min-height:' + (orientation === 'landscape' ? '210mm' : '297mm') + ';margin:16px auto;padding:12mm;background:white;box-shadow:0 4px 24px #0002;position:relative}.demo-watermark{position:absolute;right:10mm;top:6mm;font-size:8pt;color:#6b7280}.logo{display:inline-grid;line-height:.67;font-size:25px;font-weight:900;letter-spacing:-2px}.logo span:last-child{color:#2f8a43}.doc-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}.doc-title{font-size:23px;font-weight:500;margin:0}.line{border-bottom:1px solid #222;min-height:18px}.fields{display:grid;grid-template-columns:1fr 1fr;gap:8px 22px}.field{display:grid;grid-template-columns:120px 1fr;gap:8px;align-items:end}.field strong{font-weight:400}table{border-collapse:collapse;width:100%}th,td{border:1px solid #555;padding:5px 6px;vertical-align:top}th{font-weight:700;text-align:left}.no-grid td,.no-grid th{border:0}.section-title{font-size:12pt;font-weight:700;margin:18px 0 7px}.writing-lines div{height:22px;border-bottom:1px solid #555}.signatures{display:grid;grid-template-columns:1fr 1fr 1fr;gap:28px;margin-top:28px}.signature{padding-top:30px;border-bottom:1px solid #333;font-size:8pt}.small{font-size:8pt;color:#444}.center{text-align:center}.right{text-align:right}.bold{font-weight:700}.muted{color:#666}.page-break{break-before:page}.offer-table td{border-width:0 0 1px;padding:8px 4px}.offer-table th{border-width:0 0 1.5px}.offer-desc{display:block;margin-top:4px;font-weight:400}.sum-box{width:45%;margin:22px 0 0 auto}.sum-box td{border:0;border-bottom:1px solid #444}.bars{border-top:10px solid #777;border-bottom:10px solid #777;padding:10px 0}.checkbox{display:inline-block;width:12px;height:12px;border:1px solid #222;margin:0 4px 0 18px}@media print{body{background:#fff}.printbar{display:none}.page{width:auto;min-height:auto;margin:0;padding:0;box-shadow:none;break-after:page}.page:last-child{break-after:auto}}';
  }
  function docHeader(title) { return '<div class="demo-watermark">DEMO · KEINE PRODUKTIVDATEN</div><div class="doc-head"><div class="logo"><span>maler</span><span>meyer</span></div><h1 class="doc-title">' + h(title) + '</h1></div>'; }
  function field(label, value) { return '<div class="field"><strong>' + h(label) + '</strong><div class="line">' + h(value || '') + '</div></div>'; }
  function blanks(count) { return new Array(count).fill('<tr><td>&nbsp;</td><td></td><td></td></tr>').join(''); }

  function timesheetHtml(db, pick) {
    const emp = employee(db, pick.employeeId);
    const requestedWeek = 'KW ' + pick.week;
    const sheet = db.weeklySheets.find(function (item) { return item.employeeId === emp.id && item.week === requestedWeek; });
    const plan = db.weekPlans.find(function (item) { return item.week === pick.week; }) || db.weekPlans[0];
    const monday = new Date((plan && plan.monday ? plan.monday : '2026-09-07') + 'T12:00:00');
    const days = ['Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'];
    const rows = days.map(function (day, index) {
      const date = new Date(monday); date.setDate(date.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      const sourceDay = sheet && sheet.days[index];
      const record = db.monthHistory.find(function (row) { return row.employeeId === emp.id && row.date === key; });
      const siteNumber = sourceDay && /^26-/.test(sourceDay.site) ? sourceDay.site : record && record.site;
      const marker = sourceDay && !/^26-/.test(sourceDay.site) && sourceDay.site !== '–' ? sourceDay.site : (record && record.marker) || '';
      const values = sourceDay ? [marker, sourceDay.start === '–' ? '' : sourceDay.start, sourceDay.break === '–' ? '' : sourceDay.break, sourceDay.end === '–' ? '' : sourceDay.end, record && record.acceptedMinutes != null ? (record.acceptedMinutes / 60).toFixed(2).replace('.', ',') + ' Std.' : '', siteNumber ? project(db, siteNumber).name : '', siteNumber || ''] : ['', '', '', '', '', '', ''];
      return '<tr><td rowspan="3" class="bold">' + day + '</td><td rowspan="3">' + isoToDe(key) + '</td>' + values.map(function (v) { return '<td>' + h(v) + '</td>'; }).join('') + '</tr><tr>' + new Array(7).fill('<td>&nbsp;</td>').join('') + '</tr><tr>' + new Array(7).fill('<td>&nbsp;</td>').join('') + '</tr>';
    }).join('');
    const saturday = new Date(monday); saturday.setDate(saturday.getDate() + 5);
    return { title: 'Arbeitszeitnachweis', orientation: 'landscape', body: '<main class="page timesheet-doc">' + docHeader('Vorlage zur Dokumentation der täglichen Arbeitszeit') + '<div class="fields">' + field('Name des Mitarbeiters:', emp.name) + field('Personal-Nr.:', emp.id) + field('Woche / Datum:', requestedWeek + ' · ' + isoToDe(plan.monday) + '–' + isoToDe(saturday.toISOString().slice(0, 10))) + '</div><table style="margin-top:8px"><thead><tr><th>Tag</th><th>Datum</th><th></th><th>Arbeitsbeginn auf der Baustelle (Uhrzeit)</th><th>Pause (Dauer)</th><th>Ende Arbeitszeit auf der Baustelle (Uhrzeit)</th><th>Reine Arbeitszeit (Summe)</th><th>Baustelle</th><th>Bau-Nr.</th></tr></thead><tbody>' + rows + '</tbody></table><p class="small">K = Krank &nbsp;&nbsp; U = Urlaub &nbsp;&nbsp; UU = unbezahlter Urlaub &nbsp;&nbsp; F = Feiertag &nbsp;&nbsp; SA = Stundenweise abwesend</p><p class="small"><strong>Hinweis:</strong> Die reine Arbeitszeit ist hier ein synthetischer, bereits akzeptierter Demo-Wert. Fahrzeit-/Überstundenbewertung bleibt OFFEN.</p><div class="signatures"><div class="signature">Datum · Unterschrift des Arbeitnehmers</div><div></div><div class="signature">Datum · Unterschrift des Arbeitgebers</div></div></main>' };
  }

  function planningHtml(db, pick) {
    const plan = db.weekPlans.find(function (item) { return item.week === pick.week; }) || db.weekPlans[0];
    const monday = new Date(plan.monday + 'T12:00:00');
    const dates = new Array(6).fill(0).map(function (_, index) { const date = new Date(monday); date.setDate(date.getDate() + index); return isoToDe(date.toISOString().slice(0, 10)); });
    const group = function (name) { const rows = plan.rows.filter(function (row) { return row.group === name; }); return '<tr><th colspan="8" style="background:#d9ead3">' + h(name) + '</th></tr>' + rows.map(function (row, index) { const who = row.displayName || employee(db, row.employeeId).name; return '<tr><td>' + (index + 1) + '</td><td class="bold">' + h(who) + '</td>' + row.values.map(function (value) { const color = value === 'Krank' ? 'color:#c62828;font-weight:700' : value === 'Urlaub' ? 'color:#2f8a43;font-weight:700' : ''; return '<td style="' + color + '">' + h(value) + '</td>'; }).join('') + '</tr>'; }).join(''); };
    return { title: 'Wochenplanung 2026', orientation: 'landscape', body: '<main class="page planning-doc">' + docHeader('Wochenplanung 2026') + '<table><thead><tr><th>KW ' + plan.week + '</th><th></th>' + ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'].map(function (d,i){return '<th class="center">'+d+'<br><span class="small">'+dates[i]+'</span></th>';}).join('') + '</tr></thead><tbody>' + group('Mitarbeiter') + group('Auszubildende / Praktikum') + group('Subunternehmer') + '</tbody></table></main>' };
  }

  function invoiceListHtml(db) { return { title: 'Rechnung schreiben?', body: '<main class="page">' + docHeader('Rechnung schreiben?') + '<table><thead><tr><th>Datum</th><th>BV / Kunde</th><th>Mitarbeiter</th><th>Rechnung schreiben?</th></tr></thead><tbody>' + db.invoiceTasks.map(function (item) { return '<tr><td>' + h(isoToDe(item.date)) + '</td><td>' + h(item.project) + '</td><td>' + h(item.employee) + '</td><td>' + h(statusLabels[item.status] + (item.note ? ' · ' + item.note : '')) + '</td></tr>'; }).join('') + '</tbody></table><p class="small">Digitale Status sind ein Demo-Vorschlag und keine abschließend beschlossene Betriebsregel.</p></main>' }; }
  function workOrderHtml(db, pick) { const p = project(db, pick.site); const contact = String(p.contact || '').split(' · 0')[0]; return { title: 'Arbeitszettel ' + p.number, body: '<main class="page">' + docHeader('Arbeitszettel') + '<div class="right">Beispielort, den 10.09.2026</div><div class="fields">' + field('Auftraggeber:', p.customer) + field('Bauvorhaben:', p.name) + field('Bst-Nr.:', p.number) + field('Schlüssel:', p.access) + field('Termin:', p.dates) + field('Ansprechpartner/Bauleiter:', contact) + '</div><div class="section-title">zu erledigende Arbeiten:</div><div class="writing-lines">' + p.tasks.map(function (x) { return '<div>– ' + h(x) + '</div>'; }).join('') + '<div></div></div><div class="section-title">Zusätzlich zu erledigende Arbeiten:</div><div class="writing-lines">' + p.extraTasks.map(function (x) { return '<div>– ' + h(x) + '</div>'; }).join('') + '<div></div></div><div class="section-title">Material:</div><div class="writing-lines">' + p.materials.map(function (x) { return '<div>– ' + h(x) + '</div>'; }).join('') + new Array(4).fill('<div></div>').join('') + '</div></main>' }; }
  function materialRequestHtml(db, pick) { const p = project(db, pick.site); const rows = db.materialCatalog; const half = Math.ceil(rows.length / 2); const table = function (items) { return '<table><thead><tr><th>Menge</th><th>Einheit</th><th>Artikel</th></tr></thead><tbody>' + items.map(function (item, index) { return '<tr><td>' + (index % 5 === 0 ? '2' : '') + '</td><td>' + h(item.unit) + '</td><td>' + h(item.article) + '</td></tr>'; }).join('') + blanks(4) + '</tbody></table>'; }; return { title: 'Materialanforderung ' + p.number, body: '<main class="page">' + docHeader('Materialanforderung') + '<div class="fields">' + field('Baustelle:', p.name) + field('Bau-Nr.:', p.number) + '</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">' + table(rows.slice(0,half)) + table(rows.slice(half)) + '</div><div class="signatures"><div class="signature">Datum</div><div></div><div class="signature">Unterschrift</div></div></main>' }; }
  function materialUsageHtml(db, pick) { const p = project(db, pick.site); const items = db.materialUsage.filter(function (item) { return item.site === p.number; }); return { title: 'Materialeinsatz ' + p.number, body: '<main class="page">' + docHeader('Materialeinsatz') + '<div class="fields">' + field('Baustelle:', p.name) + field('Bau-Nr.:', p.number) + '</div><table style="margin-top:18px"><thead><tr><th>Artikel</th><th>Farbton</th><th>Ort / Gegenstand</th></tr></thead><tbody>' + items.map(function (item) { return '<tr><td>' + h(item.article) + '</td><td>' + h(item.color) + '</td><td>' + h(item.place) + '</td></tr>'; }).join('') + blanks(20) + '</tbody></table></main>' }; }
  function dayWorkHtml(db, pick) { const p = project(db, pick.site); const crew = db.employees.filter(function (item) { return item.site === p.number; }).slice(0, 7); return { title: 'Tageslohnnachweis ' + p.number, body: '<main class="page">' + docHeader('Tageslohnnachweis') + '<div class="fields">' + field('vom', '07.09.2026') + field('bis', '11.09.2026') + field('Baustelle:', p.name) + field('Bau-Nummer:', p.number) + field('Baustellenleiter:', crew[0] ? crew[0].name : 'Jan Testmann') + '</div><div class="section-title">Arbeitsaufwand zum Nachweis</div><table><thead><tr><th>Mitarbeiter</th><th>Mo</th><th>Di</th><th>Mi</th><th>Do</th><th>Fr</th><th>Sa</th><th>So</th><th>Ges. Std.</th><th>Azubi Std.</th></tr></thead><tbody>' + crew.map(function (person) { return '<tr><td>' + h(person.name) + '</td><td>8,3</td><td>8,3</td><td>8,3</td><td>8,3</td><td>6,0</td><td></td><td></td><td>39,2</td><td>' + (/Auszubild/.test(person.job) ? '39,2' : '') + '</td></tr>'; }).join('') + '</tbody></table><div class="right bold">gesamte Stunden: ' + (crew.length * 39.2).toFixed(1).replace('.', ',') + '</div><div class="section-title">Art der Arbeit:</div><div class="writing-lines"><div>Vorarbeiten, Spachteln und Anstricharbeiten (synthetisch)</div><div></div><div></div></div><div class="section-title">Materialaufwand pauschal: <span class="checkbox"></span>10 % <span class="checkbox"></span>25 % <span class="checkbox"></span>50 %</div><div class="section-title">Materialverbrauch zum Nachweis</div><table><tbody><tr><td>Innenfarbe weiss</td><td>24 l</td><td>Abdeckvlies</td><td>4 Rollen</td><td>Fuellspachtel</td><td>2 Sack</td></tr><tr><td>Tiefengrund</td><td>10 l</td><td>Klebeband</td><td>6 Rollen</td><td>Sonstiges</td><td></td></tr></tbody></table><div class="signatures"><div class="signature">Unterschrift Mitarbeiter</div><div class="signature">Datum</div><div class="signature">Unterschrift Bauleitung / Auftraggeber</div></div><p class="small">Keine Lohn-, Fahrzeit- oder Überstundenregel ergänzt.</p></main>' }; }
  function measurementHtml(db, pick) { const p = project(db, pick.site); const items = db.measurements.filter(function (item) { return item.site === p.number; }); const empty = new Array(Math.max(0, 24-items.length)).fill('<tr>' + new Array(8).fill('<td>&nbsp;</td>').join('') + '</tr>').join(''); return { title: 'Aufmaß ' + p.number, body: '<main class="page">' + docHeader('Aufmaß') + '<div class="field">' + field('BV:', p.name) + '</div><table style="margin-top:14px"><thead><tr><th>Etage</th><th>Wohnung</th><th>Länge</th><th>Breite</th><th>Höhe</th><th>Summe</th><th>Abzüge</th><th>Massen</th></tr></thead><tbody>' + items.map(function (x) { return '<tr><td>'+h(x.floor)+'</td><td>'+h(x.apartment)+'</td><td>'+x.length.toFixed(2).replace('.',',')+'</td><td>'+x.width.toFixed(2).replace('.',',')+'</td><td>'+x.height.toFixed(2).replace('.',',')+'</td><td>'+x.sum.toFixed(2).replace('.',',')+'</td><td>'+x.deductions.toFixed(2).replace('.',',')+'</td><td>'+x.mass.toFixed(2).replace('.',',')+'</td></tr>'; }).join('') + empty + '</tbody></table><p class="small"><strong>OFFEN:</strong> Die malerfachliche Berechnung von Summe, Abzügen und Massen wurde nicht automatisiert.</p></main>' }; }
  function protocolHtml(db, pick) { const p=project(db,pick.site); const item=db.protocols.find(function(x){return x.site===p.number;}); return { title:'Baubesprechungsprotokoll '+p.number, body:'<main class="page">'+docHeader('Baubesprechungsprotokoll')+'<div class="fields">'+field('Laufende Nummer:',item?item.id:'DEMO-01')+field('Bau-Nr.:',p.number)+field('Datum:',item?isoToDe(item.date):'10.09.2026')+field('Bauvorhaben:',p.name)+'</div><div class="section-title">Teilnehmer:</div><div class="writing-lines"><div>'+(item?h(item.participants.join(', ')):'')+'</div><div></div><div></div></div><div class="section-title">Protokoll:</div><div class="writing-lines"><div>'+(item?h(item.text):'')+'</div>'+new Array(20).fill('<div></div>').join('')+'</div><div class="right">Seite: 1</div></main>'}; }
  function leaveHtml(db,pick){const emp=employee(db,pick.employeeId);const req=db.leaveRequests.find(function(x){return x.employeeId===emp.id;})||db.leaveRequests[0];return{title:'Urlaubsantrag',body:'<main class="page"><div class="bars">'+docHeader('Urlaubsantrag')+'</div><div style="height:55px"></div><div class="fields" style="grid-template-columns:1fr">'+field('Name:',emp.name)+field('Urlaub von:',isoToDe(req.from)+' bis '+isoToDe(req.to))+field('Anzahl der Urlaubstage:',req.days+' Tag(e)')+'</div><div style="height:65px"></div><div class="field"><strong>Genehmigt:</strong><div class="signature">Datum / Unterschrift Geschäftsführung</div></div><p class="small" style="margin-top:55px">Digitaler Freigabeprozess ist eine Demo-Annahme; die endgültige Regel bleibt OFFEN.</p></main>'};}
  function offerHtml(db,pick){const p=project(db,pick.site);const positions=[{q:1,u:'pschl.',t:'Pauschale für Abdeckarbeiten',d:'Abdecken der Arbeitsbereiche mit Papier, Folie und Klebeband.',ep:390},{q:42,u:'m²',t:'Wandflächen spachteln',d:'Untergrund vorbereiten, spachteln und schleifen. Ort: Treppenhaus und Flur.',ep:28.5},{q:85,u:'m²',t:'Wand- und Deckenflächen streichen',d:'Deckender Innenanstrich im synthetischen Wunschfarbton.',ep:14.8},{q:6,u:'Std.',t:'Zusätzliche Gesellenstunden',d:'Nur nach dokumentierter Rücksprache; keine automatische Freigabe.',ep:64}];const net=positions.reduce(function(s,x){return s+x.q*x.ep;},0);const vat=net*.19;const row=function(x,i){return '<tr><td>'+(i+1)+'</td><td>'+String(x.q).replace('.',',')+'</td><td>'+h(x.u)+'</td><td class="bold">'+h(x.t)+'<span class="offer-desc">'+h(x.d)+'</span></td><td class="right">'+formatMoney(x.ep)+'</td><td class="right">'+formatMoney(x.q*x.ep)+'</td></tr>';};return{title:'Angebot '+p.number,body:'<main class="page"><div class="demo-watermark">DEMO · KEINE PRODUKTIVDATEN</div><div class="doc-head"><div><p>'+h(p.customer)+'</p><p>'+h(p.address)+'</p></div><div><strong>Angebot</strong><br>Datum: 10.09.2026<br>Kunden-/Projektreferenz: DEMO-K-101<br>Beleg: DEMO-A-2026-01<br>Bearbeiter: Tina Demo</div></div><h2>BV: '+h(p.name)+' · Bau-Nr. '+h(p.number)+'</h2><p>Sehr geehrte Damen und Herren,</p><p>wir unterbreiten Ihnen folgendes vollständig synthetisches Beispielangebot:</p><table class="offer-table"><thead><tr><th>Pos.</th><th>Menge</th><th>Einh.</th><th>Leistung</th><th>EP [€]</th><th>Gesamt [€]</th></tr></thead><tbody>'+positions.slice(0,2).map(row).join('')+'</tbody></table><div class="right bold" style="margin-top:20px">Übertrag '+formatMoney(positions.slice(0,2).reduce(function(s,x){return s+x.q*x.ep;},0))+'</div></main><main class="page page-break"><div class="demo-watermark">DEMO · KEINE PRODUKTIVDATEN</div><h3>Seite 2</h3><table class="offer-table"><thead><tr><th>Pos.</th><th>Menge</th><th>Einh.</th><th>Leistung</th><th>EP [€]</th><th>Gesamt [€]</th></tr></thead><tbody>'+positions.slice(2).map(function(x,i){return row(x,i+2);}).join('')+'</tbody></table><table class="sum-box"><tr><td>Nettosumme</td><td class="right">'+formatMoney(net)+'</td></tr><tr><td>+ MwSt. 19,00 %</td><td class="right">'+formatMoney(vat)+'</td></tr><tr class="bold"><td>Endsumme</td><td class="right">'+formatMoney(net+vat)+'</td></tr></table><p style="margin-top:45px">Dieses synthetische Angebot dient ausschließlich zur Prüfung des Dokumentlayouts. Es enthält keine realen Kunden-, Projekt- oder Preisdaten.</p></main>'};}

  function timeRows(db){const rows=[['Datum','Mitarbeiter-ID','Mitarbeiter','Bau-Nr.','Arbeitsbeginn','Pause Minuten','Arbeitsende','Fahrt Minuten roh','Akzeptierte Arbeitszeit Minuten','Status/Hinweis']];db.monthHistory.forEach(function(x){rows.push([x.date,x.employeeId,employee(db,x.employeeId).name,x.site,x.start,x.breakMinutes,x.end,x.travelMinutes,x.acceptedMinutes==null?'':x.acceptedMinutes,x.issue||x.marker]);});return rows;}
  function invoiceRows(db){return [['Datum','BV / Kunde','Mitarbeiter','Rechnung schreiben?']].concat(db.invoiceTasks.map(function(x){return[isoToDe(x.date),x.project,x.employee,statusLabels[x.status]+(x.note?' · '+x.note:'')];}));}
  function saveCsv(name,rows){const csv='\uFEFF'+rows.map(function(row){return row.map(function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"';}).join(';');}).join('\r\n');saveBlob(name,new Blob([csv],{type:'text/csv;charset=utf-8'}));}
  function saveBlob(name,blob){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1500);}

  function cell(v,s,f){return{v:v,s:s||0,f:f||''};}
  function calculationWorkbook(db){const rows=[['Bauliste 2026'],['Bau-Nr.','Bauvorhaben','Bearbeiter','Angebotssumme / Auftragswert netto','Soll-Stunden','Gesellen Ist-Stunden','Fahrzeit roh','Azubi-Stunden','Stundenumsatz','Kosten Zeitpersonal','Kosten Material','Kosten Lift','Kosten Subunternehmer','Kosten Gerüste / Müll','Kosten Sonstiges','Übertrag','Gesamtkosten','geschriebene Rechnungen','Ergebnis','aktueller Stundenwert']];db.projectAccounts.forEach(function(x,i){const r=i+3;rows.push([x.site,x.project,x.manager,cell(x.offerNet,4),cell(x.plannedHours,5),cell(x.acceptedHours,5),cell(x.travelHoursRaw,5),cell(x.traineeHours,5),'OFFEN',cell(x.tempStaff,4),cell(x.materials,4),cell(x.lift,4),cell(x.subcontractor,4),cell(x.scaffoldWaste,4),cell(x.other,4),cell(x.carryover,4),cell(0,4,'SUM(J'+r+':P'+r+')'),cell(db.billingRecords.filter(function(b){return b.site===x.site;}).reduce(function(s,b){return s+b.net;},0),4),'OFFEN','OFFEN']);});return[{name:'Bau-Nr.-Liste',rows:rows,widths:[12,34,18,18,13,14,12,12,15,15,15,12,16,17,14,12,15,18,14,18],freeze:{rows:2,cols:2},landscape:true}];}
  function projectWorkbook(db, site) {
    const x = db.projectAccounts.find(function (account) { return account.site === site; }) || db.projectAccounts[0];
    const rows = [
      ['Projekt-Unterkonto · ' + x.site + ' · ' + x.project], [],
      ['Kalenderwoche', 'Gesellen-Stunden', 'Fahrzeit roh', 'Azubi-Stunden'],
      ['KW 34', 34, 2.0, 6], ['KW 35', 38, 1.5, 4], ['KW 36', 42, 1.0, 2], ['KW 37', 52, 1.25, 3],
      ['Summe', cell(0, 5, 'SUM(B4:B7)'), cell(0, 5, 'SUM(C4:C7)'), cell(0, 5, 'SUM(D4:D7)')], [],
      ['geschriebene Rechnungen'], ['Datum', 'Beleg', 'Netto-Betrag']
    ];
    const bills = db.billingRecords.filter(function (billing) { return billing.site === site; });
    const firstBillRow = rows.length + 1;
    bills.forEach(function (billing) { rows.push([billing.date, billing.reference, cell(billing.net, 4)]); });
    const lastBillRow = rows.length;
    rows.push(['Summe', '', cell(0, 4, bills.length ? 'SUM(C' + firstBillRow + ':C' + lastBillRow + ')' : '0')], []);
    rows.push(['Materialverbrauch:'], ['Menge', 'Einheit', 'Artikel', 'EP', 'GP']);
    const firstMaterialRow = rows.length + 1;
    [[4, 'Rolle', 'Abdeckvlies', 18.5], [12, 'Liter', 'Tiefengrund', 7.8], [2, 'Sack / 25 kg', 'Fuellspachtel', 42]].forEach(function (item) {
      const rowNumber = rows.length + 1;
      rows.push([item[0], item[1], item[2], cell(item[3], 4), cell(0, 4, 'A' + rowNumber + '*D' + rowNumber)]);
    });
    rows.push(['Gesamtsumme Material', '', '', '', cell(0, 4, 'SUM(E' + firstMaterialRow + ':E' + rows.length + ')')], []);
    rows.push(['Weitere Kostenblöcke', 'Betrag']);
    const firstCostRow = rows.length + 1;
    rows.push(['Lift', cell(x.lift, 4)], ['Subunternehmer', cell(x.subcontractor, 4)], ['Zeitarbeitsfirmen', cell(x.tempStaff, 4)], ['Gerüste + Müllentsorgung', cell(x.scaffoldWaste, 4)], ['Sonstiges', cell(x.other, 4)]);
    rows.push(['Gesamtsumme weitere Kosten', cell(0, 4, 'SUM(B' + firstCostRow + ':B' + rows.length + ')')], [], ['Hinweis', 'Fahrzeitwerte sind Rohdaten. Lohn-, Überstunden- und Ergebnislogik bleiben OFFEN.']);
    return [{ name: x.site, rows: rows, widths: [22, 20, 32, 14, 14], freeze: { rows: 1, cols: 0 }, landscape: true }];
  }
  function planningWorkbook(db){return db.weekPlans.map(function(plan){const rows=[['Wochenplanung 2026'],['KW '+plan.week,'Mitarbeiter','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']];['Mitarbeiter','Auszubildende / Praktikum','Subunternehmer'].forEach(function(group){rows.push([cell(group,3)]);plan.rows.filter(function(r){return r.group===group;}).forEach(function(r,i){rows.push([i+1,r.displayName||employee(db,r.employeeId).name].concat(r.values));});});return{name:'KW '+plan.week,rows:rows,widths:[8,24,22,22,22,22,22,22],freeze:{rows:2,cols:2},landscape:true};});}
  function invoiceWorkbook(db){return[{name:'Rechnung schreiben',rows:[['Rechnung schreiben?'],['Datum','BV / Kunde','Mitarbeiter','Rechnung schreiben?']].concat(db.invoiceTasks.map(function(x){return[x.date,x.project,x.employee,statusLabels[x.status]+(x.note?' · '+x.note:'')];})),widths:[14,42,22,36],freeze:{rows:2,cols:0},landscape:false}];}

  function saveXlsx(name,sheets){saveBlob(name,buildXlsx(sheets));}
  function buildXlsx(sheets){const files=[];const add=function(name,text){files.push({name:name,data:new TextEncoder().encode(text)});};add('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+sheets.map(function(_,i){return'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';}).join('')+'</Types>');add('_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');add('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+sheets.map(function(s,i){return'<sheet name="'+xml(s.name)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>';}).join('')+'</sheets><calcPr calcMode="auto" fullCalcOnLoad="1"/></workbook>');add('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+sheets.map(function(_,i){return'<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>';}).join('')+'<Relationship Id="rId'+(sheets.length+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');add('xl/styles.xml',stylesXml());sheets.forEach(function(s,i){add('xl/worksheets/sheet'+(i+1)+'.xml',sheetXml(s));});return new Blob([zip(files)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});}
  function stylesXml(){return'<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0.00 [$€-407];[Red]-#,##0.00 [$€-407];-"/><numFmt numFmtId="165" formatCode="0.00&quot; h&quot;"/></numFmts><fonts count="4"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="14"/><name val="Arial"/><color rgb="FF17324D"/></font><font><b/><sz val="10"/><name val="Arial"/><color rgb="FFFFFFFF"/></font><font><b/><sz val="10"/><name val="Arial"/><color rgb="FF17324D"/></font></fonts><fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF17324D"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFD9EAD3"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFE8A3"/></patternFill></fill></fills><borders count="2"><border/><border><left style="thin"><color rgb="FF777777"/></left><right style="thin"><color rgb="FF777777"/></right><top style="thin"><color rgb="FF777777"/></top><bottom style="thin"><color rgb="FF777777"/></bottom></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="7"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0"/><xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';}
  function sheetXml(sheet){const rows=sheet.rows||[];const cols=(sheet.widths||[]).map(function(w,i){return'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>';}).join('');const body=rows.map(function(row,ri){return'<row r="'+(ri+1)+'" ht="'+(ri===0?24:ri===1?34:18)+'" customHeight="1">'+row.map(function(raw,ci){const obj=raw&&typeof raw==='object'&&Object.prototype.hasOwnProperty.call(raw,'v')?raw:{v:raw,s:ri===0?1:ri===1?2:0,f:''};const ref=column(ci+1)+(ri+1);const style=obj.s||0;if(obj.f)return'<c r="'+ref+'" s="'+style+'"><f>'+xml(obj.f)+'</f><v>'+Number(obj.v||0)+'</v></c>';if(typeof obj.v==='number')return'<c r="'+ref+'" s="'+style+'"><v>'+obj.v+'</v></c>';return'<c r="'+ref+'" s="'+style+'" t="inlineStr"><is><t xml:space="preserve">'+xml(obj.v==null?'':obj.v)+'</t></is></c>';}).join('')+'</row>';}).join('');const pane=sheet.freeze?'<sheetViews><sheetView workbookViewId="0"><pane xSplit="'+(sheet.freeze.cols||0)+'" ySplit="'+(sheet.freeze.rows||0)+'" topLeftCell="'+column((sheet.freeze.cols||0)+1)+((sheet.freeze.rows||0)+1)+'" state="frozen"/></sheetView></sheetViews>':'<sheetViews><sheetView workbookViewId="0"/></sheetViews>';return'<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+pane+'<cols>'+cols+'</cols><sheetData>'+body+'</sheetData><pageSetup orientation="'+(sheet.landscape?'landscape':'portrait')+'" paperSize="9" fitToWidth="1" fitToHeight="0"/><pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/></worksheet>';}
  function column(n){let s='';while(n){n-=1;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26);}return s;}
  function xml(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];});}
  function crc32(bytes){let crc=-1;for(let i=0;i<bytes.length;i+=1){crc^=bytes[i];for(let j=0;j<8;j+=1)crc=(crc>>>1)^((crc&1)?0xEDB88320:0);}return(crc^-1)>>>0;}
  function u16(v){return new Uint8Array([v&255,(v>>>8)&255]);}function u32(v){return new Uint8Array([v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255]);}
  function concat(parts){const length=parts.reduce(function(s,p){return s+p.length;},0);const out=new Uint8Array(length);let offset=0;parts.forEach(function(p){out.set(p,offset);offset+=p.length;});return out;}
  function zip(files){const local=[];const central=[];let offset=0;files.forEach(function(file){const name=new TextEncoder().encode(file.name);const crc=crc32(file.data);const header=concat([u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(file.data.length),u32(file.data.length),u16(name.length),u16(0),name]);local.push(header,file.data);central.push(concat([u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(file.data.length),u32(file.data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]));offset+=header.length+file.data.length;});const centralBytes=concat(central);return concat(local.concat([centralBytes,u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(centralBytes.length),u32(offset),u16(0)]));}

  window.MMExports = { render: render, handleAction: handleAction, handleSubmit: handleSubmit, openPrint: openPrint, buildXlsx: buildXlsx };
}());


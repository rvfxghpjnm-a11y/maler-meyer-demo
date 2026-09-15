'use strict';

(function installFinalPracticeWorkflows() {
  const previousFactory = window.createDemoSeed;
  const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const DEMO_TODAY = '2026-09-10';
  const COST_TYPES = {
    MATERIAL_EXTERNAL: 'Material extern', LIFT: 'Lift', SUBCONTRACTOR: 'Subunternehmer',
    TEMP_STAFF: 'Zeitarbeit', SCAFFOLD_WASTE: 'Gerüst / Müll', OTHER: 'Sonstiges'
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function h(value) { return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]; }); }
  function iso(date) { return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0'); }
  function dateFor(plan, dayIndex) { const d = new Date(plan.monday + 'T12:00:00'); d.setDate(d.getDate() + dayIndex); return iso(d); }
  function dateLabel(plan, dayIndex) { const d = new Date(dateFor(plan, dayIndex) + 'T12:00:00'); return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.'; }
  function currentCalendarWeek() {
    const now = new Date();
    const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const year = date.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    return { week: Math.ceil((((date - yearStart) / 86400000) + 1) / 7), year: year, today: now.toLocaleDateString('de-DE') };
  }
  function weekRange(p) {
    const firstYear = new Date(dateFor(p, 0) + 'T12:00:00').getFullYear();
    const lastYear = new Date(dateFor(p, 5) + 'T12:00:00').getFullYear();
    return dateLabel(p, 0) + (firstYear === lastYear ? '' : firstYear) + '–' + dateLabel(p, 5) + lastYear;
  }
  function employee(db, id) { return db.employees.find(function (x) { return x.id === id; }); }
  function project(db, number) { return db.sites.find(function (x) { return x.number === number; }); }
  function plan(db, week) { return db.weekPlans.find(function (x) { return x.week === Number(week); }); }
  function projectLabel(db, value) { const item = project(db, value); return item ? value + ' · ' + item.name : value || 'frei'; }
  function activeRows(db, p) { return p.rows.filter(function (row) { const person = employee(db, row.employeeId); return !person || person.active !== false; }); }
  function rowName(db, row) { const person = employee(db, row.employeeId); return row.displayName || (person && person.name) || row.employeeId; }
  function account(db, site) { return (db.projectAccounts || []).find(function (x) { return x.site === site; }); }
  function money(value) { return Number(value || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }); }
  function categoryTotal(db, site, type) { return (db.projectCostEntries || []).filter(function (x) { return x.site === site && x.type === type; }).reduce(function (sum, x) { return sum + Number(x.net || 0); }, 0); }
  function planValueOptions(db, selected) {
    const values = [['', 'Nicht eingeplant / frei'], ['Urlaub', 'Urlaub'], ['Krank', 'Krank'], ['Schule / Fortbildung', 'Schule / Fortbildung · Demo-Vorschlag'], ['Sonstige Abwesenheit', 'Sonstige Abwesenheit · Demo-Vorschlag']];
    db.sites.filter(function (x) { return x.active !== false; }).forEach(function (x) { values.push([x.number, x.number + ' · ' + x.name]); });
    return values.map(function (x) { return '<option value="' + h(x[0]) + '" ' + (x[0] === selected ? 'selected' : '') + '>' + h(x[1]) + '</option>'; }).join('');
  }

  function initializePlan(p) {
    p.status = p.status || 'PUBLISHED';
    p.publishedRows = p.publishedRows || clone(p.rows);
    p.pendingEmployeeIds = p.pendingEmployeeIds || [];
    p.publishedAt = p.publishedAt || 'Ausgangsstand der synthetischen Demo';
  }

  function seedCostEntries(db) {
    const entries = [];
    (db.projectAccounts || []).forEach(function (x, index) {
      [['MATERIAL_EXTERNAL', x.materials, 'Synthetische Material-Sammelposition'], ['LIFT', x.lift, 'Arbeitsbühne / Lift'], ['SUBCONTRACTOR', x.subcontractor, 'Nachunternehmer-Leistung'], ['TEMP_STAFF', x.tempStaff, 'Zeitarbeit'], ['SCAFFOLD_WASTE', x.scaffoldWaste, 'Gerüst und Entsorgung'], ['OTHER', x.other, 'Sonstige Projektkosten']].forEach(function (row, subIndex) {
        if (!row[1]) return;
        entries.push({ id: 'KOST-' + String(index + 1).padStart(2, '0') + '-' + (subIndex + 1), site: x.site, date: '2026-09-0' + ((index % 8) + 1), type: row[0], description: row[2], supplier: 'Beispielbetrieb ' + (index + 1), net: Number(row[1]), reference: 'DEMO-BELEG-' + (index + 1) + (subIndex + 1), source: 'SEED', createdAt: 'Synthetischer Ausgangsstand' });
      });
    });
    return entries;
  }

  window.createDemoSeed = function createFinalPracticeSeed() {
    const db = previousFactory();
    db.weekPlans.forEach(initializePlan);
    if (!plan(db, 38)) {
      const source = plan(db, 37);
      const rows = clone(source.rows);
      rows.forEach(function (row, rowIndex) {
        if (row.group === 'Mitarbeiter' && rowIndex % 9 === 3) row.values[3] = 'Urlaub';
      });
      const next = { week: 38, monday: '2026-09-14', rows: rows, status: 'PUBLISHED', publishedRows: clone(rows), pendingEmployeeIds: [], publishedAt: '11.09.2026 · 15:30 Uhr · synthetische Demo' };
      db.weekPlans.push(next);
    }
    db.planChanges = [];
    db.planPublications = [{ id: 'PLANPUB-38', week: 38, publishedAt: '11.09.2026 · 15:30 Uhr', publishedBy: 'Tina Demo · Büro', changedEmployees: [] }];
    db.projectCostEntries = seedCostEntries(db);
    db.audit.unshift({ id: 'A-DEMO-V11', type: 'DEMO_SCOPE', entity: 'V11', title: 'Torben-Praxistest vorbereitet', before: 'Anzeigematrix und statische Projektkosten', after: 'Editierbare Wochenplanung, Veröffentlichung, Kosten und Eingangsrechnungen', actor: 'System · synthetische Demo', time: '14.09.2026 · 10:00 Uhr', reason: 'Bedienungsdemo; offene Fachregeln bleiben offen' });
    return db;
  };

  function renderPlanning(db, ctx) {
    const p = plan(db, ctx.ui.planningWeek) || db.weekPlans[db.weekPlans.length - 1];
    const currentWeek = currentCalendarWeek();
    const rows = activeRows(db, p);
    const byGroup = function (group) {
      const list = rows.filter(function (row) { return row.group === group; });
      if (!list.length) return '';
      return '<tr class="week-group"><th colspan="8">' + h(group) + '</th></tr>' + list.map(function (row, rowIndex) {
        return '<tr><td>' + (rowIndex + 1) + '</td><th>' + h(rowName(db, row)) + '</th>' + row.values.map(function (value, dayIndex) {
          const kind = value === 'Krank' ? 'week-sick' : value === 'Urlaub' ? 'week-leave' : '';
          const site = project(db, value);
          return '<td class="' + kind + '"><button class="planning-cell" data-action="plan-cell" data-week="' + p.week + '" data-employee="' + h(row.employeeId) + '" data-day="' + dayIndex + '" title="' + h(projectLabel(db, value)) + ' · Planung bearbeiten"><strong>' + h(value || 'frei') + '</strong>' + (site ? '<span class="planning-site-name">' + h(site.name) + '</span>' : '') + '<small>' + h(dateLabel(p, dayIndex)) + '</small></button></td>';
        }).join('') + '</tr>';
      }).join('');
    };
    const employeeChecks = rows.filter(function (row) { return employee(db, row.employeeId); }).map(function (row) { return '<label><input type="checkbox" name="employee" value="' + h(row.employeeId) + '"><span>' + h(rowName(db, row)) + '</span></label>'; }).join('');
    const dayChecks = DAYS.map(function (day, index) { return '<label><input type="checkbox" name="day" value="' + index + '"><span>' + day + '</span></label>'; }).join('');
    const changes = db.planChanges.filter(function (x) { return x.week === p.week; }).slice(0, 12);
    return ctx.head('Wochenplanung', 'KW ' + p.week + ' · Jede Tageszelle ist direkt bearbeitbar') +
      '<p class="decision-note"><strong>Bedienbare Demo:</strong> Entwurf / veröffentlicht, Vorwoche kopieren, Mehrfachzuweisung sowie Schule/Fortbildung sind Demo-Vorschläge. Genehmigter Urlaub bleibt sichtbar.</p>' +
      '<div class="toolbar"><span><strong>' + (p.status === 'PUBLISHED' ? 'Veröffentlicht' : 'Entwurf · Änderungen noch nicht veröffentlicht') + '</strong><small>' + h(p.publishedAt || '') + '</small></span><div class="form-actions"><button class="secondary" data-action="new-plan-week">Neue Woche planen</button><button class="primary" data-action="publish-plan" data-week="' + p.week + '" ' + (p.status === 'PUBLISHED' ? 'disabled' : '') + '>Planung veröffentlichen</button><button class="secondary" data-mm-action="xlsx-planning">XLSX</button><button class="secondary" data-mm-action="print" data-template="planning" data-week="' + p.week + '">PDF / Druck</button></div></div>' +
      '<section class="card card-pad week-matrix editable-week"><div class="section-title"><h2>Wochenplanung 2026 · KW ' + p.week + '</h2><div class="filter-row">' + db.weekPlans.map(function (x) { return '<button class="filter-button ' + (x.week === p.week ? 'active' : '') + '" data-action="planning-week" data-week="' + x.week + '">KW ' + x.week + '</button>'; }).join('') + '</div></div><p class="mobile-plan-hint">Tabelle seitlich wischen: Bau-Nr. und Baustellenname stehen gemeinsam in jeder Tageszelle.</p><div class="table-scroll"><table><thead><tr><th>Nr.</th><th>Mitarbeiter</th>' + DAYS.map(function (day, index) { return '<th>' + day + '<small>' + dateLabel(p, index) + '</small></th>'; }).join('') + '</tr></thead><tbody>' + byGroup('Mitarbeiter') + byGroup('Auszubildende / Praktikum') + byGroup('Subunternehmer') + '</tbody></table></div></section>' +
      '<section class="card card-pad section batch-planning"><div class="section-title"><div><h2>Kolonne oder mehrere Tage planen · KW ' + p.week + '</h2><p>Demo-Vorschlag für wenige Klicks.</p></div></div><div class="batch-week-context"><strong>Aktuelle Kalenderwoche: KW ' + currentWeek.week + ' / ' + currentWeek.year + '</strong><small>Stand ' + h(currentWeek.today) + ' · laut diesem Gerät</small></div><form data-form="plan-batch"><label class="batch-week-select">Kalenderwoche für diese Planung<select name="week" data-batch-plan-week required>' + db.weekPlans.map(function (x) { return '<option value="' + x.week + '" ' + (x.week === p.week ? 'selected' : '') + '>KW ' + x.week + ' · ' + h(weekRange(x)) + '</option>'; }).join('') + '</select></label><p class="batch-week-selected">Ausgewählt: <strong>KW ' + p.week + ' · ' + h(weekRange(p)) + '</strong>. Die Wochenmatrix oben zeigt dieselbe KW.</p><fieldset><legend>Mitarbeiter</legend><div class="plan-check-grid">' + employeeChecks + '</div></fieldset><fieldset><legend>Tage</legend><div class="plan-check-grid days">' + dayChecks + '</div></fieldset><div class="form-grid"><label>Zuweisung<select name="value">' + planValueOptions(db, '') + '</select></label><label>Grund – optional<input name="reason" placeholder="z. B. Terminverschiebung"></label></div><button class="primary">Auf Auswahl anwenden</button></form></section>' +
      '<section class="section"><div class="section-title"><h2>Änderungsverlauf KW ' + p.week + '</h2><span class="meta">' + changes.length + ' letzte Änderungen</span></div><div class="list">' + (changes.map(function (x) { return '<article class="audit-box"><strong>' + h(x.employeeName) + ' · ' + h(DAYS[x.day]) + ': ' + h(projectLabel(db, x.before)) + ' → ' + h(projectLabel(db, x.after)) + '</strong><small>' + h(x.changedBy) + ' · ' + h(x.changedAt) + (x.reason ? ' · ' + h(x.reason) : '') + '</small></article>'; }).join('') || '<div class="empty-note">Noch keine Änderung an dieser Woche.</div>') + '</div></section>';
  }

  function renderPlanModal(db, modal) {
    if (!modal) return '';
    if (modal.type === 'cell') {
      const p = plan(db, modal.week); const row = p && p.rows.find(function (x) { return x.employeeId === modal.employeeId; });
      if (!p || !row) return '';
      return '<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="plan-cell"><input type="hidden" name="week" value="' + p.week + '"><input type="hidden" name="employee" value="' + h(row.employeeId) + '"><input type="hidden" name="day" value="' + modal.day + '"><div class="action-modal-head"><div><span class="build-number">KW ' + p.week + ' · ' + DAYS[modal.day] + '</span><h2>' + h(rowName(db, row)) + ' planen</h2><p>' + h(dateLabel(p, modal.day)) + '2026 · bisher ' + h(projectLabel(db, row.values[modal.day])) + '</p></div><button type="button" class="modal-close" data-action="close-final-modal">×</button></div><label>Zuweisung<select name="value">' + planValueOptions(db, row.values[modal.day]) + '</select></label><label>Änderungsgrund – optional<input name="reason" placeholder="Nur falls hilfreich"></label><button class="primary full-button">Planung speichern</button></form></div>';
    }
    if (modal.type === 'new-week') {
      const latest = Math.max.apply(null, db.weekPlans.map(function (x) { return x.week; }));
      return '<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="new-plan-week"><div class="action-modal-head"><div><h2>Neue Woche planen</h2><p>Leere Woche oder Vorwoche kopieren · Demo-Vorschlag</p></div><button type="button" class="modal-close" data-action="close-final-modal">×</button></div><label>Kalenderwoche<input name="week" type="number" min="1" max="53" value="' + (latest + 1) + '" required></label><label>Montag<input name="monday" type="date" value="2026-09-21" required></label><label>Ausgangspunkt<select name="mode"><option value="COPY">Vorwoche kopieren</option><option value="EMPTY">Leere Woche erstellen</option></select></label><button class="primary full-button">Woche erstellen</button></form></div>';
    }
    if (modal.type === 'cost') return renderCostModal(db, modal.site);
    if (modal.type === 'supplier') return renderSupplierModal(db, modal.site);
    if (modal.type === 'billing') return renderBillingModal(db, modal.site);
    return '';
  }

  function recordPlanChange(db, ctx, p, row, dayIndex, value, reason) {
    const before = row.values[dayIndex] || '';
    if (before === value) return false;
    row.values[dayIndex] = value;
    p.status = 'DRAFT';
    if (!p.pendingEmployeeIds.includes(row.employeeId)) p.pendingEmployeeIds.push(row.employeeId);
    const change = { id: ctx.makeId('PL'), week: p.week, day: dayIndex, date: dateFor(p, dayIndex), employeeId: row.employeeId, employeeName: rowName(db, row), before: before, after: value, changedBy: ctx.actor(), changedAt: ctx.dateTimeNow(), reason: reason || '' };
    db.planChanges.unshift(change);
    ctx.audit('WEEK_PLAN_CHANGED', row.employeeId, 'Wochenplanung geändert · KW ' + p.week + ' · ' + DAYS[dayIndex], projectLabel(db, before), projectLabel(db, value), reason || 'Initiale/kurze Planung ohne Grundzwang');
    if (dateFor(p, dayIndex) === DEMO_TODAY && employee(db, row.employeeId)) {
      const assignment = db.assignments.find(function (x) { return x.employeeId === row.employeeId; });
      const siteValue = project(db, value) ? value : null;
      if (assignment) Object.assign(assignment, { originalSite: assignment.site, site: siteValue, absence: ['Urlaub', 'Krank'].includes(value) ? value : null, changedBy: ctx.actor(), changedAt: ctx.dateTimeNow(), note: reason || 'Aus Wochenmatrix' });
      const person = employee(db, row.employeeId);
      if (person && ['NOT_STARTED', 'NOT_PLANNED'].includes(person.status)) { person.site = siteValue; person.plannedSite = siteValue; person.status = siteValue ? 'NOT_STARTED' : 'NOT_PLANNED'; }
    }
    return true;
  }

  function handleForm(db, form, ctx) {
    const values = new FormData(form);
    if (form.dataset.form === 'plan-cell') {
      const p = plan(db, values.get('week')); const row = p.rows.find(function (x) { return x.employeeId === values.get('employee'); });
      recordPlanChange(db, ctx, p, row, Number(values.get('day')), String(values.get('value')), String(values.get('reason') || ''));
      ctx.ui.finalModal = null; ctx.saveDb(); ctx.toast('Wochenplanung geändert · heutige Zuordnung nur bei passendem Datum aktualisiert.'); return true;
    }
    if (form.dataset.form === 'plan-batch') {
      const p = plan(db, values.get('week')); const employees = values.getAll('employee'); const days = values.getAll('day').map(Number);
      if (!employees.length || !days.length) { ctx.toast('Bitte mindestens einen Mitarbeiter und einen Tag auswählen.'); return true; }
      let changed = 0;
      employees.forEach(function (employeeId) { const row = p.rows.find(function (x) { return x.employeeId === employeeId; }); if (row) days.forEach(function (day) { if (recordPlanChange(db, ctx, p, row, day, String(values.get('value')), String(values.get('reason') || ''))) changed += 1; }); });
      ctx.saveDb(); ctx.toast(changed + ' Planungszelle' + (changed === 1 ? '' : 'n') + ' aktualisiert.'); return true;
    }
    if (form.dataset.form === 'new-plan-week') {
      const week = Number(values.get('week'));
      if (plan(db, week)) { ctx.toast('KW ' + week + ' ist bereits vorhanden.'); return true; }
      const latest = db.weekPlans.slice().sort(function (a, b) { return b.week - a.week; })[0];
      const rows = clone(latest.rows); if (values.get('mode') === 'EMPTY') rows.forEach(function (row) { row.values = new Array(6).fill(''); });
      const next = { week: week, monday: values.get('monday'), rows: rows, status: 'DRAFT', publishedRows: [], pendingEmployeeIds: rows.map(function (x) { return x.employeeId; }), publishedAt: '' };
      db.weekPlans.push(next); db.weekPlans.sort(function (a, b) { return a.week - b.week; }); ctx.ui.planningWeek = week; ctx.ui.finalModal = null;
      ctx.audit('WEEK_PLAN_CREATED', 'KW-' + week, 'Neue Woche geplant', '–', values.get('mode') === 'COPY' ? 'Vorwoche kopiert' : 'Leere Woche', 'Demo-Vorschlag');
      ctx.saveDb(); ctx.toast('KW ' + week + ' als Entwurf erstellt.'); return true;
    }
    if (form.dataset.form === 'project-cost') {
      const entry = { id: ctx.makeId('KOST'), site: values.get('site'), date: values.get('date'), type: values.get('type'), description: values.get('description'), supplier: values.get('supplier') || '', net: Number(values.get('net')), reference: values.get('reference') || '', source: 'MANUAL', createdAt: ctx.dateTimeNow(), createdBy: ctx.actor() };
      db.projectCostEntries.unshift(entry); ctx.audit('PROJECT_COST_ADDED', entry.site, 'Kostenposition hinzugefügt', '–', COST_TYPES[entry.type] + ' · ' + money(entry.net), 'Synthetische manuelle Demo-Erfassung');
      ctx.ui.finalModal = null; ctx.saveDb(); ctx.toast('Kostenposition im Projekt und Unterkonto ergänzt.'); return true;
    }
    if (form.dataset.form === 'supplier-invoice') {
      const id = ctx.makeId('LR'); const net = Number(values.get('net'));
      const invoice = { id: id, supplier: values.get('supplier'), invoiceNumber: values.get('invoiceNumber'), invoiceDate: values.get('date'), site: values.get('site'), net: net, vat: null, total: null, status: 'ZUGEORDNET', note: values.get('note') || '', localFileName: (form.querySelector('[name="file"]').files[0] || {}).name || '', createdAt: ctx.dateTimeNow() };
      db.supplierInvoices.unshift(invoice);
      db.projectCostEntries.unshift({ id: 'KOST-' + id, site: invoice.site, date: invoice.invoiceDate, type: values.get('type'), description: 'Eingangsrechnung · ' + invoice.invoiceNumber + (invoice.note ? ' · ' + invoice.note : ''), supplier: invoice.supplier, net: net, reference: invoice.invoiceNumber, source: 'SUPPLIER_INVOICE', sourceId: id, createdAt: ctx.dateTimeNow(), createdBy: ctx.actor() });
      ctx.audit('SUPPLIER_INVOICE_ASSIGNED', id, 'Eingangsrechnung manuell zugeordnet', 'Zuordnung offen', invoice.site + ' · ' + money(net), 'Manuelle Demo-Zuordnung; OCR später möglich');
      ctx.ui.finalModal = null; ctx.saveDb(); ctx.toast('Eingangsrechnung der Bau-Nr. zugeordnet.'); return true;
    }
    if (form.dataset.form === 'billing-record') {
      const record = { site: values.get('site'), date: values.get('date'), reference: values.get('reference'), net: Number(values.get('net')), note: values.get('note') || '', createdAt: ctx.dateTimeNow(), createdBy: ctx.actor() };
      db.billingRecords.unshift(record); ctx.audit('BILLING_RECORD_ADDED', record.site, 'Geschriebene Rechnung erfasst', '–', record.reference + ' · ' + money(record.net), 'Synthetischer Rechnungseintrag');
      ctx.ui.finalModal = null; ctx.saveDb(); ctx.toast('Geschriebene Rechnung im Projekt ergänzt.'); return true;
    }
    return false;
  }

  function handleAction(db, target, ctx) {
    const action = target.dataset.action;
    if (action === 'plan-cell') { ctx.ui.finalModal = { type: 'cell', week: Number(target.dataset.week), employeeId: target.dataset.employee, day: Number(target.dataset.day) }; ctx.render(); return true; }
    if (action === 'new-plan-week') { ctx.ui.finalModal = { type: 'new-week' }; ctx.render(); return true; }
    if (action === 'close-final-modal') { ctx.ui.finalModal = null; ctx.render(); return true; }
    if (action === 'publish-plan') {
      const p = plan(db, target.dataset.week); const changed = p.pendingEmployeeIds.slice(); p.publishedRows = clone(p.rows); p.status = 'PUBLISHED'; p.publishedAt = ctx.dateTimeNow() + ' · ' + ctx.actor(); p.pendingEmployeeIds = [];
      db.planPublications.unshift({ id: ctx.makeId('PLANPUB'), week: p.week, publishedAt: p.publishedAt, publishedBy: ctx.actor(), changedEmployees: changed });
      changed.filter(function (id) { return employee(db, id); }).forEach(function (id) { db.notifications.unshift({ id: ctx.makeId('NOT'), employeeId: id, type: 'PLANNING_CHANGED', title: 'Deine Planung für KW ' + p.week + ' wurde geändert.', body: 'Öffne „Meine Woche“, um die veröffentlichte Planung zu prüfen.', planningWeek: p.week, createdAt: 'Heute · ' + ctx.dateTimeNow(), read: false }); });
      ctx.audit('WEEK_PLAN_PUBLISHED', 'KW-' + p.week, 'Planung veröffentlicht', 'Entwurf', 'Veröffentlicht · ' + changed.length + ' Hinweise', 'Demo-Vorschlag'); ctx.saveDb(); ctx.toast('Planung veröffentlicht · Mitarbeiterhinweise erzeugt.'); return true;
    }
    if (action === 'open-project-cost') { ctx.ui.finalModal = { type: 'cost', site: target.dataset.site }; ctx.render(); return true; }
    if (action === 'open-supplier-invoice') { ctx.ui.finalModal = { type: 'supplier', site: target.dataset.site }; ctx.render(); return true; }
    if (action === 'open-billing-record') { ctx.ui.finalModal = { type: 'billing', site: target.dataset.site }; ctx.render(); return true; }
    if (action === 'open-invoice-project') { ctx.ui.selectedSite = target.dataset.site; ctx.ui.view = 'sites'; ctx.render(); return true; }
    return false;
  }

  function renderCostModal(db, site) {
    return '<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="project-cost"><input type="hidden" name="site" value="' + h(site) + '"><div class="action-modal-head"><div><span class="build-number">Bau-Nr. ' + h(site) + '</span><h2>Kosten hinzufügen</h2><p>Nur sichere Rohposition und Kategoriesumme.</p></div><button type="button" class="modal-close" data-action="close-final-modal">×</button></div><div class="form-grid"><label>Datum<input type="date" name="date" value="2026-09-10" required></label><label>Kostenart<select name="type">' + Object.keys(COST_TYPES).map(function (key) { return '<option value="' + key + '">' + COST_TYPES[key] + '</option>'; }).join('') + '</select></label><label class="full">Beschreibung<input name="description" required placeholder="z. B. Arbeitsbühne für Innenhof"></label><label>Lieferant / Firma – optional<input name="supplier"></label><label>Nettobetrag<input type="number" name="net" min="0" step="0.01" value="240" required></label><label class="full">Referenz / Beleg – optional<input name="reference"></label></div><button class="primary full-button">Kostenposition speichern</button></form></div>';
  }
  function renderSupplierModal(db, site) {
    return '<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="supplier-invoice"><div class="action-modal-head"><div><h2>Eingangsrechnung erfassen</h2><p>Manuelle Demo-Zuordnung · automatische OCR später möglich.</p></div><button type="button" class="modal-close" data-action="close-final-modal">×</button></div><div class="form-grid"><label>Lieferant<input name="supplier" value="Werkzeughandel Demo GmbH" required></label><label>Rechnungsdatum<input type="date" name="date" value="2026-09-10" required></label><label>Rechnungsnummer<input name="invoiceNumber" value="DEMO-E-1042" required></label><label>Nettobetrag<input type="number" name="net" min="0" step="0.01" value="315" required></label><label>Bau-Nr.<select name="site">' + db.sites.filter(function (x) { return x.active !== false; }).map(function (x) { return '<option value="' + x.number + '" ' + (x.number === site ? 'selected' : '') + '>' + h(x.number + ' · ' + x.name) + '</option>'; }).join('') + '</select></label><label>Kostenart<select name="type">' + Object.keys(COST_TYPES).map(function (key) { return '<option value="' + key + '">' + COST_TYPES[key] + '</option>'; }).join('') + '</select></label><label class="full">Hinweis – optional<textarea name="note"></textarea></label><label class="full">Lokale Demo-Datei – optional<input type="file" name="file" accept="application/pdf,image/*"><small>Datei bleibt lokal und wird nicht gespeichert.</small></label></div><button class="primary full-button">Rechnung zuordnen</button></form></div>';
  }
  function renderBillingModal(db, site) {
    return '<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="billing-record"><input type="hidden" name="site" value="' + h(site) + '"><div class="action-modal-head"><div><span class="build-number">Bau-Nr. ' + h(site) + '</span><h2>Geschriebene Rechnung hinzufügen</h2><p>Synthetischer Eintrag im Projekt-Unterkonto.</p></div><button type="button" class="modal-close" data-action="close-final-modal">×</button></div><div class="form-grid"><label>Datum<input type="date" name="date" value="2026-09-10" required></label><label>Rechnungsreferenz<input name="reference" value="DEMO-R-26120" required></label><label>Nettobetrag<input type="number" name="net" min="0" step="0.01" value="1850" required></label><label class="full">Hinweis – optional<textarea name="note"></textarea></label></div><button class="primary full-button">Rechnungseintrag speichern</button></form></div>';
  }

  function renderCommercial(db, site, ctx) {
    const x = account(db, site.number) || {};
    const costs = (db.projectCostEntries || []).filter(function (item) { return item.site === site.number; }).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    const bills = (db.billingRecords || []).filter(function (item) { return item.site === site.number; });
    const invoiceTask = (db.invoiceTasks || []).find(function (item) { return item.site === site.number; });
    const metrics = [['Auftragswert netto', money(x.offerNet)], ['Soll-Stunden', Number(x.plannedHours || 0).toLocaleString('de-DE') + ' h'], ['Ist-Stunden', Number(x.acceptedHours || 0).toLocaleString('de-DE') + ' h'], ['Fahrzeit roh', Number(x.travelHoursRaw || 0).toLocaleString('de-DE') + ' h']].concat(Object.keys(COST_TYPES).map(function (key) { return [COST_TYPES[key], money(categoryTotal(db, site.number, key))]; })).concat([['Geschriebene Rechnungen', money(bills.reduce(function (sum, item) { return sum + Number(item.net || 0); }, 0))]]);
    return '<section class="detail-block full-span commercial-project"><div class="section-title"><div><h3>Kosten & Rechnungen</h3><p>Sichere Rohwerte und Summen · keine unbekannte Wirtschaftlichkeitsformel.</p></div><div class="form-actions"><button class="secondary" data-action="open-project-cost" data-site="' + site.number + '">Kosten hinzufügen</button><button class="secondary" data-action="open-supplier-invoice" data-site="' + site.number + '">Eingangsrechnung</button><button class="primary" data-action="open-billing-record" data-site="' + site.number + '">Geschriebene Rechnung</button></div></div><div class="commercial-metrics">' + metrics.map(function (m) { return '<div><small>' + h(m[0]) + '</small><strong>' + h(m[1]) + '</strong></div>'; }).join('') + '</div><div class="commercial-columns"><div><h4>Kostenverlauf</h4>' + (costs.map(function (item) { return '<article class="cost-row"><span><strong>' + h(COST_TYPES[item.type] || item.type) + ' · ' + h(item.description) + '</strong><small>' + h(item.date) + (item.supplier ? ' · ' + h(item.supplier) : '') + (item.reference ? ' · ' + h(item.reference) : '') + '</small></span><strong>' + money(item.net) + '</strong></article>'; }).join('') || '<p>Keine Kostenpositionen.</p>') + '</div><div><h4>Geschriebene Rechnungen</h4>' + (bills.map(function (item) { return '<article class="cost-row"><span><strong>' + h(item.reference) + '</strong><small>' + h(item.date) + (item.note ? ' · ' + h(item.note) : '') + '</small></span><strong>' + money(item.net) + '</strong></article>'; }).join('') || '<p>Keine Rechnung erfasst.</p>') + (invoiceTask ? '<button class="compact-link" data-action="navigate" data-view="invoice-list">„Rechnung schreiben?“ öffnen · ' + h(invoiceTask.status) + '</button>' : '') + '</div></div></section>';
  }

  function renderMyWeek(db, employeeId) {
    const p = db.weekPlans.slice().sort(function (a, b) { return b.week - a.week; }).find(function (x) { return (x.publishedRows || []).some(function (row) { return row.employeeId === employeeId; }); });
    if (!p) return '';
    const row = p.publishedRows.find(function (x) { return x.employeeId === employeeId; });
    return '<section class="section card card-pad my-week"><div class="section-title"><div><h2>Meine Woche · KW ' + p.week + '</h2><p>Zuletzt veröffentlichte Planung</p></div><button class="secondary" data-action="navigate" data-view="notifications">Hinweise</button></div><div class="my-week-days">' + DAYS.map(function (day, index) { return '<div class="' + (row.values[index] === 'Urlaub' ? 'week-leave' : row.values[index] === 'Krank' ? 'week-sick' : '') + '"><small>' + day.slice(0, 2) + ' · ' + dateLabel(p, index) + '</small><strong>' + h(projectLabel(db, row.values[index])) + '</strong></div>'; }).join('') + '</div><p class="meta">Entwurf / veröffentlicht ist ein Demo-Vorschlag. Nur veröffentlichte Werte werden hier gezeigt.</p></section>';
  }

  function renderTaskHub(db, ctx) {
    const item = function (view, title, text, count) { return '<button class="card workflow-start" data-action="navigate" data-view="' + view + '"><strong>' + h(title) + (count != null ? ' · ' + count : '') + '</strong><span>' + h(text) + '</span></button>'; };
    return ctx.head('Prüfen & Büro', 'Häufige Arbeitsvorräte an einem Ort') + '<section class="documentation-start-grid">' + item('times', 'Zeiten prüfen', 'Korrekturen und fehlende Buchungen', db.correctionRequests.filter(function (x) { return x.status === 'OPEN'; }).length) + item('weeks', 'Wochenzettel', 'Bestätigungen und Freigaben', db.weeklySheets.filter(function (x) { return x.status !== 'ADMIN_APPROVED'; }).length) + item('extras', 'Zusatzarbeiten', 'Dokumentation und kaufmännische Prüfung', db.extras.filter(function (x) { return x.commercialStatus === 'OPEN'; }).length) + item('material', 'Material', 'Anforderungen und Verbrauch prüfen', db.materialRecords.filter(function (x) { return x.status === 'NEW'; }).length) + item('leave', 'Urlaub', 'Anträge öffnen', db.leaveRequests.filter(function (x) { return x.status === 'REQUESTED'; }).length) + item('invoice-list', 'Rechnung schreiben?', 'Laufende Demo-Liste', db.invoiceTasks.length) + '</section><p class="decision-note"><strong>Demo-Struktur:</strong> Die Gruppierung priorisiert häufige Büroarbeit; endgültige Rechte und Verantwortlichkeiten bleiben offen.</p>';
  }

  function renderInvoiceList(db, ctx) {
    return ctx.head('Rechnung schreiben?', 'Laufende Büro-Liste · digitale Status sind Demo-Vorschläge') + '<div class="toolbar"><span><strong>' + db.invoiceTasks.length + '</strong> synthetische Einträge</span><div class="form-actions"><button class="secondary" data-mm-action="print" data-template="invoice-list">PDF / Druck</button><button class="primary" data-mm-action="xlsx-invoices">XLSX</button><button class="secondary" data-mm-action="csv-invoices">CSV</button></div></div><section class="card card-pad"><div class="table-scroll"><table><thead><tr><th>Datum</th><th>BV / Kunde</th><th>Mitarbeiter</th><th>Rechnung schreiben?</th><th>Projekt</th></tr></thead><tbody>' + db.invoiceTasks.map(function (x) { return '<tr><td>' + h(x.date) + '</td><td><strong>' + h(x.project) + '</strong><small>Bau-Nr. ' + h(x.site) + '</small></td><td>' + h(x.employee) + '</td><td>' + h(x.status) + (x.note ? '<small>' + h(x.note) + '</small>' : '') + '</td><td><button class="secondary" data-action="open-invoice-project" data-site="' + h(x.site) + '">Projekt öffnen</button></td></tr>'; }).join('') + '</tbody></table></div></section><p class="legal-note">Die Status sind eine Demo-Interpretation. Verantwortlicher und Abschlusskriterium bleiben fachlich offen.</p>';
  }

  function dynamicAccount(db, x) {
    return Object.assign({}, x, {
      materials: categoryTotal(db, x.site, 'MATERIAL_EXTERNAL'), lift: categoryTotal(db, x.site, 'LIFT'), subcontractor: categoryTotal(db, x.site, 'SUBCONTRACTOR'),
      tempStaff: categoryTotal(db, x.site, 'TEMP_STAFF'), scaffoldWaste: categoryTotal(db, x.site, 'SCAFFOLD_WASTE'), other: categoryTotal(db, x.site, 'OTHER')
    });
  }

  window.MMFinal = { days: DAYS, costTypes: COST_TYPES, renderPlanning: renderPlanning, renderPlanModal: renderPlanModal, renderCommercial: renderCommercial, renderMyWeek: renderMyWeek, renderTaskHub: renderTaskHub, renderInvoiceList: renderInvoiceList, handleForm: handleForm, handleAction: handleAction, dynamicAccount: dynamicAccount, categoryTotal: categoryTotal, dateFor: dateFor };
  window.DEMO_DATA_VERSION = 11;
}());

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
  function weekInfo(monday) {
    const date = new Date(String(monday) + 'T00:00:00Z');
    if (Number.isNaN(date.getTime()) || date.getUTCDay() !== 1) return null;
    date.setUTCDate(date.getUTCDate() + 3);
    const year = date.getUTCFullYear();
    const first = new Date(Date.UTC(year, 0, 1));
    return { week: Math.ceil((((date - first) / 86400000) + 1) / 7), year: year };
  }
  function weekTitle(p) { const info = weekInfo(p.monday); return 'KW ' + p.week + ' / ' + (info ? info.year : 'Jahr offen'); }
  function employee(db, id) { return db.employees.find(function (x) { return x.id === id; }); }
  function project(db, number) { return db.sites.find(function (x) { return x.number === number; }); }
  function plan(db, reference) {
    const value = String(reference || '');
    return db.weekPlans.find(function (x) { return x.monday === value; }) ||
      db.weekPlans.find(function (x) { return x.week === Number(value) && weekInfo(x.monday)?.year === 2026; });
  }
  function projectLabel(db, value) { const item = project(db, value); return item ? value + ' · ' + item.name : value || 'frei'; }
  function detailKey(employeeId, dayIndex) { return employeeId + ':' + dayIndex; }
  function planEntries(p, row, dayIndex) {
    const details = p.dayDetails && p.dayDetails[detailKey(row.employeeId, dayIndex)];
    return details && details.length ? details : [{ value: row.values[dayIndex] || '', time: '' }];
  }
  function entryLabel(db, entry) { return (entry.time ? entry.time + ' · ' : '') + (entry.freeText || projectLabel(db, entry.value)); }
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
    p.note = p.note || '';
    p.dayDetails = p.dayDetails || {};
    p.publishedDayDetails = p.publishedDayDetails || clone(p.dayDetails);
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
    (db.weeklySheets || []).forEach(function (sheet) {
      sheet.days.forEach(function (day, index) {
        if (!day.breaks) day.breaks = index < 4 ? [{ start: '09:00', end: '09:15', label: 'Frühstück' }, { start: '12:30', end: '13:00', label: 'Mittag' }] : [{ start: '09:00', end: '09:15', label: 'Frühstück' }];
      });
    });
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
          const entries = planEntries(p, row, dayIndex);
          return '<td class="' + kind + '"><button class="planning-cell" data-action="plan-cell" data-week="' + p.monday + '" data-employee="' + h(row.employeeId) + '" data-day="' + dayIndex + '" title="Planung bearbeiten">' + entries.map(function (entry) { return '<strong>' + h(entryLabel(db, entry)) + '</strong>'; }).join('<span class="planning-site-name">danach</span>') + '<small>' + h(dateLabel(p, dayIndex)) + '</small></button></td>';
        }).join('') + '</tr>';
      }).join('');
    };
    const employeeChecks = rows.filter(function (row) { return employee(db, row.employeeId); }).map(function (row) { return '<label><input type="checkbox" name="employee" value="' + h(row.employeeId) + '"><span>' + h(rowName(db, row)) + '</span></label>'; }).join('');
    const dayChecks = DAYS.map(function (day, index) { return '<label><input type="checkbox" name="day" value="' + index + '"><span>' + day + '</span></label>'; }).join('');
    const changes = db.planChanges.filter(function (x) { return x.monday === p.monday || (!x.monday && x.week === p.week && weekInfo(p.monday)?.year === 2026); }).slice(0, 12);
    const absenceForm = '<section class="card card-pad section"><div class="section-title"><div><h2>Abwesenheit von–bis eintragen</h2><p>Für Krank, Urlaub oder Schulung ohne jeden Tag einzeln zu öffnen.</p></div></div><form data-form="plan-absence"><label>Mitarbeiter<select name="employee">' + rows.filter(function (row) { return employee(db, row.employeeId); }).map(function (row) { return '<option value="' + h(row.employeeId) + '">' + h(rowName(db, row)) + '</option>'; }).join('') + '</select></label><div class="form-grid"><label>Art<select name="value"><option>Krank</option><option>Urlaub</option><option>Schule / Fortbildung</option><option>Sonstige Abwesenheit</option></select></label><label>Von<input type="date" name="from" value="' + dateFor(p, 0) + '" required></label><label>Bis<input type="date" name="to" value="' + dateFor(p, 4) + '" required></label><label>Grund – optional<input name="reason"></label></div><button class="primary">Zeitraum eintragen</button></form></section>';
    return ctx.head('Wochenplanung', weekTitle(p) + ' · Jede Tageszelle ist direkt bearbeitbar') +
      '<p class="decision-note"><strong>Im Torben-Praxistest bestätigt:</strong> Neue Wochen beginnen leer; Mehrfachplanung, Entwurf/Veröffentlichung, Schulung sowie genehmigter Urlaub sind bedienbar. Mitarbeitende sehen zukünftige Wochen erst nach der Veröffentlichung.</p>' +
      '<div class="toolbar"><span><strong>' + (p.status === 'PUBLISHED' ? 'Veröffentlicht' : 'Entwurf · Änderungen noch nicht veröffentlicht') + '</strong><small>' + h(p.publishedAt || '') + '</small></span><div class="form-actions"><button class="secondary" data-action="new-plan-week">Neue Woche planen</button><button class="primary" data-action="publish-plan" data-week="' + p.monday + '" ' + (p.status === 'PUBLISHED' ? 'disabled' : '') + '>Planung veröffentlichen</button><button class="secondary" data-mm-action="xlsx-planning">XLSX</button><button class="secondary" data-mm-action="print" data-template="planning" data-week="' + p.monday + '">PDF / Druck</button></div></div><section class="card card-pad section"><form data-form="plan-note"><input type="hidden" name="week" value="' + p.monday + '"><label>Hinweise und Erinnerungen für ' + weekTitle(p) + '<textarea name="note" placeholder="z. B. Dienstag 08:00 Uhr Kundentermin">' + h(p.note || '') + '</textarea></label><button class="secondary">Wochenhinweis speichern</button></form></section>' +
      '<section class="card card-pad week-matrix editable-week"><div class="section-title"><h2>Wochenplanung ' + weekInfo(p.monday).year + ' · KW ' + p.week + '</h2><div class="filter-row">' + db.weekPlans.map(function (x) { return '<button class="filter-button ' + (x.monday === p.monday ? 'active' : '') + '" data-action="planning-week" data-week="' + x.monday + '">' + weekTitle(x) + '</button>'; }).join('') + '</div></div><p class="mobile-plan-hint">Tabelle seitlich wischen: Bau-Nr. und Baustellenname stehen gemeinsam in jeder Tageszelle.</p><div class="table-scroll"><table><thead><tr><th>Nr.</th><th>Mitarbeiter</th>' + DAYS.map(function (day, index) { return '<th>' + day + '<small>' + dateLabel(p, index) + '</small></th>'; }).join('') + '</tr></thead><tbody>' + byGroup('Mitarbeiter') + byGroup('Auszubildende / Praktikum') + byGroup('Subunternehmer') + '</tbody></table></div></section>' +
      '<section class="card card-pad section batch-planning"><div class="section-title"><div><h2>Kolonne oder mehrere Tage planen · ' + weekTitle(p) + '</h2><p>Demo-Vorschlag für wenige Klicks.</p></div></div><div class="batch-week-context"><strong>Aktuelle Kalenderwoche: KW ' + currentWeek.week + ' / ' + currentWeek.year + '</strong><small>Stand ' + h(currentWeek.today) + ' · laut diesem Gerät</small></div><form data-form="plan-batch"><label class="batch-week-select">Kalenderwoche für diese Planung<select name="week" data-batch-plan-week required>' + db.weekPlans.map(function (x) { return '<option value="' + x.monday + '" ' + (x.monday === p.monday ? 'selected' : '') + '>' + weekTitle(x) + ' · ' + h(weekRange(x)) + '</option>'; }).join('') + '</select></label><p class="batch-week-selected">Ausgewählt: <strong>' + weekTitle(p) + ' · ' + h(weekRange(p)) + '</strong>. Die Wochenmatrix oben zeigt dieselbe KW.</p><fieldset><legend>Mitarbeiter</legend><div class="plan-check-grid">' + employeeChecks + '</div></fieldset><fieldset><legend>Tage</legend><div class="plan-check-grid days">' + dayChecks + '</div></fieldset><div class="form-grid"><label>Zuweisung<select name="value">' + planValueOptions(db, '') + '</select></label><label>Grund – optional<input name="reason" placeholder="z. B. Terminverschiebung"></label></div><button class="primary">Auf Auswahl anwenden</button></form></section>' +
      absenceForm +
      '<section class="section"><div class="section-title"><h2>Änderungsverlauf ' + weekTitle(p) + '</h2><span class="meta">' + changes.length + ' letzte Änderungen</span></div><div class="list">' + (changes.map(function (x) { return '<article class="audit-box"><strong>' + h(x.employeeName) + ' · ' + h(DAYS[x.day]) + ': ' + h(projectLabel(db, x.before)) + ' → ' + h(projectLabel(db, x.after)) + '</strong><small>' + h(x.changedBy) + ' · ' + h(x.changedAt) + (x.reason ? ' · ' + h(x.reason) : '') + '</small></article>'; }).join('') || '<div class="empty-note">Noch keine Änderung an dieser Woche.</div>') + '</div></section>';
  }

  function renderPlanModal(db, modal) {
    if (!modal) return '';
    if (modal.type === 'cell') {
      const p = plan(db, modal.week); const row = p && p.rows.find(function (x) { return x.employeeId === modal.employeeId; });
      if (!p || !row) return '';
      const entries = planEntries(p, row, modal.day);
      return '<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="plan-cell"><input type="hidden" name="week" value="' + p.monday + '"><input type="hidden" name="employee" value="' + h(row.employeeId) + '"><input type="hidden" name="day" value="' + modal.day + '"><div class="action-modal-head"><div><span class="build-number">' + weekTitle(p) + ' · ' + DAYS[modal.day] + '</span><h2>' + h(rowName(db, row)) + ' planen</h2><p>Eine oder zwei Stationen; Uhrzeiten sind optional.</p></div><button type="button" class="modal-close" data-action="close-final-modal">×</button></div><div class="form-grid"><label>Erste Zuweisung<select name="value">' + planValueOptions(db, entries[0] && entries[0].value || '') + '</select></label><label>Zeit / Beginn – optional<input name="time" placeholder="z. B. bis 12:00 oder ab 08:00" value="' + h(entries[0] && entries[0].time || '') + '"></label><label>Zweite Zuweisung – optional<select name="value2"><option value="">Keine zweite Station</option>' + planValueOptions(db, entries[1] && entries[1].value || '') + '</select></label><label>Zeit – optional<input name="time2" placeholder="z. B. ab 12:00" value="' + h(entries[1] && entries[1].time || '') + '"></label><label class="full">Freie Stundenlohnarbeit / Hinweis – optional<input name="freeText" placeholder="z. B. 26-002 · Stundenlohn bei Familie Beispiel" value="' + h(entries.find(function (x) { return x.freeText; })?.freeText || '') + '"></label></div><label>Änderungsgrund – optional<input name="reason" placeholder="Nur falls hilfreich"></label><button class="primary full-button">Planung speichern</button></form></div>';
    }
    if (modal.type === 'new-week') {
      const latest = db.weekPlans.slice().sort(function (a, b) { return b.monday.localeCompare(a.monday); })[0];
      const next = new Date(latest.monday + 'T12:00:00Z'); next.setUTCDate(next.getUTCDate() + 7);
      const nextMonday = next.toISOString().slice(0, 10);
      const nextInfo = weekInfo(nextMonday);
      return '<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="new-plan-week"><div class="action-modal-head"><div><h2>Neue Woche planen</h2><p>Standardmäßig leer; Kopieren bleibt eine bewusste Option.</p></div><button type="button" class="modal-close" data-action="close-final-modal">×</button></div><label>Montag der neuen Woche<input name="monday" type="date" value="' + nextMonday + '" required></label><p data-week-preview>Kalenderwoche: <strong>KW ' + nextInfo.week + ' / ' + nextInfo.year + '</strong></p><label>Ausgangspunkt<select name="mode"><option value="EMPTY">Leere Woche erstellen</option><option value="COPY">Vorherige Woche kopieren</option></select></label><button class="primary full-button">Woche erstellen</button></form></div>';
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
    const change = { id: ctx.makeId('PL'), week: p.week, monday: p.monday, day: dayIndex, date: dateFor(p, dayIndex), employeeId: row.employeeId, employeeName: rowName(db, row), before: before, after: value, changedBy: ctx.actor(), changedAt: ctx.dateTimeNow(), reason: reason || '' };
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
      const dayIndex = Number(values.get('day'));
      const first = String(values.get('value') || '');
      recordPlanChange(db, ctx, p, row, dayIndex, first, String(values.get('reason') || ''));
      p.dayDetails = p.dayDetails || {};
      const entries = [{ value: first, time: String(values.get('time') || '') }];
      if (values.get('value2')) entries.push({ value: String(values.get('value2')), time: String(values.get('time2') || '') });
      if (values.get('freeText')) entries.push({ value: '', time: '', freeText: String(values.get('freeText')) });
      p.dayDetails[detailKey(row.employeeId, dayIndex)] = entries;
      ctx.ui.finalModal = null; ctx.saveDb(); ctx.toast('Wochenplanung geändert · heutige Zuordnung nur bei passendem Datum aktualisiert.'); return true;
    }
    if (form.dataset.form === 'plan-batch') {
      const p = plan(db, values.get('week')); const employees = values.getAll('employee'); const days = values.getAll('day').map(Number);
      if (!employees.length || !days.length) { ctx.toast('Bitte mindestens einen Mitarbeiter und einen Tag auswählen.'); return true; }
      let changed = 0;
      employees.forEach(function (employeeId) { const row = p.rows.find(function (x) { return x.employeeId === employeeId; }); if (row) days.forEach(function (day) { if (recordPlanChange(db, ctx, p, row, day, String(values.get('value')), String(values.get('reason') || ''))) changed += 1; }); });
      ctx.saveDb(); ctx.toast(changed + ' Planungszelle' + (changed === 1 ? '' : 'n') + ' aktualisiert.'); return true;
    }
    if (form.dataset.form === 'plan-note') {
      const p = plan(db, values.get('week'));
      p.note = String(values.get('note') || '').trim();
      p.status = 'DRAFT';
      ctx.audit('WEEK_PLAN_NOTE_CHANGED', p.monday, 'Wochenhinweis geändert', '–', p.note || 'Hinweis entfernt', 'Hinweis ist an die Kalenderwoche gebunden');
      ctx.saveDb(); ctx.toast('Wochenhinweis gespeichert.'); return true;
    }
    if (form.dataset.form === 'plan-absence') {
      const from = String(values.get('from')); const to = String(values.get('to'));
      if (!from || !to || to < from) { ctx.toast('Bitte einen gültigen Zeitraum wählen.'); return true; }
      let changed = 0;
      db.weekPlans.forEach(function (p) {
        const row = p.rows.find(function (x) { return x.employeeId === values.get('employee'); });
        if (!row) return;
        DAYS.forEach(function (_, dayIndex) { const date = dateFor(p, dayIndex); if (date >= from && date <= to && recordPlanChange(db, ctx, p, row, dayIndex, String(values.get('value')), String(values.get('reason') || 'Abwesenheit von–bis'))) changed += 1; });
      });
      ctx.saveDb(); ctx.toast(changed + ' Tageszuordnung' + (changed === 1 ? '' : 'en') + ' als Abwesenheit gespeichert.'); return true;
    }
    if (form.dataset.form === 'new-plan-week') {
      const monday = String(values.get('monday') || '');
      const info = weekInfo(monday);
      if (!info) { ctx.toast('Bitte einen Montag als Wochenbeginn wählen.'); return true; }
      if (plan(db, monday)) { ctx.toast('KW ' + info.week + ' / ' + info.year + ' ist bereits vorhanden.'); return true; }
      const previous = db.weekPlans.filter(function (x) { return x.monday < monday; }).sort(function (a, b) { return b.monday.localeCompare(a.monday); })[0];
      const template = previous || db.weekPlans[0];
      if (!template) { ctx.toast('Es gibt noch keine Mitarbeiterzeilen als Vorlage.'); return true; }
      const rows = clone(template.rows); if (values.get('mode') === 'EMPTY' || !previous) rows.forEach(function (row) { row.values = new Array(6).fill(''); });
      const next = { week: info.week, monday: monday, rows: rows, status: 'DRAFT', publishedRows: [], pendingEmployeeIds: rows.map(function (x) { return x.employeeId; }), publishedAt: '', note: '', dayDetails: values.get('mode') === 'COPY' && previous ? clone(previous.dayDetails || {}) : {}, publishedDayDetails: {} };
      db.weekPlans.push(next); db.weekPlans.sort(function (a, b) { return a.monday.localeCompare(b.monday); }); ctx.ui.planningWeek = monday; ctx.ui.finalModal = null;
      ctx.audit('WEEK_PLAN_CREATED', monday, 'Neue Woche geplant · KW ' + info.week + '/' + info.year, '–', values.get('mode') === 'COPY' ? 'Vorwoche kopiert' : 'Leere Woche', 'Demo-Vorschlag');
      ctx.saveDb(); ctx.toast('KW ' + info.week + ' / ' + info.year + ' als Entwurf erstellt.'); return true;
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
    if (action === 'plan-cell') { ctx.ui.finalModal = { type: 'cell', week: target.dataset.week, employeeId: target.dataset.employee, day: Number(target.dataset.day) }; ctx.render(); return true; }
    if (action === 'new-plan-week') { ctx.ui.finalModal = { type: 'new-week' }; ctx.render(); return true; }
    if (action === 'close-final-modal') { ctx.ui.finalModal = null; ctx.render(); return true; }
    if (action === 'publish-plan') {
      const p = plan(db, target.dataset.week); const changed = p.pendingEmployeeIds.slice(); p.publishedRows = clone(p.rows); p.publishedDayDetails = clone(p.dayDetails || {}); p.status = 'PUBLISHED'; p.publishedAt = ctx.dateTimeNow() + ' · ' + ctx.actor(); p.pendingEmployeeIds = [];
      db.planPublications.unshift({ id: ctx.makeId('PLANPUB'), week: p.week, monday: p.monday, publishedAt: p.publishedAt, publishedBy: ctx.actor(), changedEmployees: changed });
      changed.filter(function (id) { return employee(db, id); }).forEach(function (id) { db.notifications.unshift({ id: ctx.makeId('NOT'), employeeId: id, type: 'PLANNING_CHANGED', title: 'Deine Planung für ' + weekTitle(p) + ' wurde geändert.', body: 'Öffne „Meine Woche“, um die veröffentlichte Planung zu prüfen.', planningWeek: p.monday, createdAt: 'Heute · ' + ctx.dateTimeNow(), read: false }); });
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
    const base = account(db, site.number) || {};
    const x = window.MMExcel && base.site ? window.MMExcel.account(db, base) : base;
    const costs = (db.projectCostEntries || []).filter(function (item) { return item.site === site.number; }).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    const bills = (db.billingRecords || []).filter(function (item) { return item.site === site.number; });
    const invoiceTask = (db.invoiceTasks || []).find(function (item) { return item.site === site.number; });
    const metrics = [['Auftragswert netto', money(x.offerNet)], ['Stunden-Vorgabe · Demo-Satz', Number(x.plannedHoursCalculated || 0).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' h'], ['Ist-Stunden', Number(x.acceptedHours || 0).toLocaleString('de-DE') + ' h'], ['Fahrzeit roh', Number(x.travelHoursRaw || 0).toLocaleString('de-DE') + ' h']].concat(Object.keys(COST_TYPES).map(function (key) { return [COST_TYPES[key], money(categoryTotal(db, site.number, key))]; })).concat([['Geschriebene Rechnungen', money(x.writtenInvoices)], ['Gesamtkosten · Demo-Satz', money(x.totalCosts)], ['Ergebnis', money(x.result)], ['Stundenumsatz', x.hourlyRevenue == null ? 'Nicht berechenbar' : money(x.hourlyRevenue) + ' / h'], ['Aktueller Stundenwert', x.currentHourlyValue == null ? 'Nicht berechenbar' : money(x.currentHourlyValue) + ' / h']]);
    return '<section class="detail-block full-span commercial-project"><div class="section-title"><div><h3>Kosten & Rechnungen</h3><p>Rechenbeziehungen aus der bisherigen Excel-Bauliste · ausschließlich synthetische Werte.</p></div><div class="form-actions"><button class="secondary" data-action="open-project-cost" data-site="' + site.number + '">Kosten hinzufügen</button><button class="secondary" data-action="open-supplier-invoice" data-site="' + site.number + '">Eingangsrechnung</button><button class="primary" data-action="open-billing-record" data-site="' + site.number + '">Geschriebene Rechnung</button></div></div><p class="decision-note">Der Kalkulationssatz ist mit ' + (window.MMExcel ? window.MMExcel.demoRate : '–') + ' €/h ein frei erfundener Demo-Wert. Die historische Formelstruktur ist keine freigegebene künftige Betriebsregel. Fahrt bleibt eine Rohangabe ohne Lohnbewertung.</p><div class="commercial-metrics">' + metrics.map(function (m) { return '<div><small>' + h(m[0]) + '</small><strong>' + h(m[1]) + '</strong></div>'; }).join('') + '</div><div class="commercial-columns"><div><h4>Kostenverlauf</h4>' + (costs.map(function (item) { return '<article class="cost-row"><span><strong>' + h(COST_TYPES[item.type] || item.type) + ' · ' + h(item.description) + '</strong><small>' + h(item.date) + (item.supplier ? ' · ' + h(item.supplier) : '') + (item.reference ? ' · ' + h(item.reference) : '') + '</small></span><strong>' + money(item.net) + '</strong></article>'; }).join('') || '<p>Keine Kostenpositionen.</p>') + '</div><div><h4>Geschriebene Rechnungen</h4>' + (bills.map(function (item) { return '<article class="cost-row"><span><strong>' + h(item.reference) + '</strong><small>' + h(item.date) + (item.note ? ' · ' + h(item.note) : '') + '</small></span><strong>' + money(item.net) + '</strong></article>'; }).join('') || '<p>Keine Rechnung erfasst.</p>') + (invoiceTask ? '<button class="compact-link" data-action="navigate" data-view="invoice-list">„Rechnung schreiben?“ öffnen · ' + h(invoiceTask.status) + '</button>' : '') + '</div></div></section>';
  }

  function renderMyWeek(db, employeeId) {
    const p = db.weekPlans.slice().sort(function (a, b) { return b.monday.localeCompare(a.monday); }).find(function (x) { return (x.publishedRows || []).some(function (row) { return row.employeeId === employeeId; }); });
    if (!p) return '';
    const row = p.publishedRows.find(function (x) { return x.employeeId === employeeId; });
    const publishedPlan = Object.assign({}, p, { dayDetails: p.publishedDayDetails || {} });
    return '<section class="section card card-pad my-week"><div class="section-title"><div><h2>Meine Woche · ' + weekTitle(p) + '</h2><p>Zuletzt veröffentlichte Planung</p></div><button class="secondary" data-action="navigate" data-view="notifications">Hinweise</button></div>' + (p.note ? '<p class="decision-note"><strong>Hinweis zur Woche:</strong> ' + h(p.note) + '</p>' : '') + '<div class="my-week-days">' + DAYS.map(function (day, index) { return '<div class="' + (row.values[index] === 'Urlaub' ? 'week-leave' : row.values[index] === 'Krank' ? 'week-sick' : '') + '"><small>' + day.slice(0, 2) + ' · ' + dateLabel(p, index) + '</small>' + planEntries(publishedPlan, row, index).map(function (entry) { return '<strong>' + h(entryLabel(db, entry)) + '</strong>'; }).join('') + '</div>'; }).join('') + '</div><p class="meta">Nur veröffentlichte Werte werden hier gezeigt.</p></section>';
  }

  function renderTeamWeek(db) {
    const p = db.weekPlans.slice().sort(function (a, b) { return b.monday.localeCompare(a.monday); }).find(function (x) { return x.status === 'PUBLISHED' && (x.publishedRows || []).length; });
    if (!p) return '';
    const rows = (p.publishedRows || []).filter(function (row) { return employee(db, row.employeeId); });
    const publishedPlan = Object.assign({}, p, { dayDetails: p.publishedDayDetails || {} });
    return '<details class="section card card-pad team-week"><summary><strong>Gesamte veröffentlichte Wochenplanung ansehen</strong><small>Nur lesen · ' + weekTitle(p) + '</small></summary><div class="table-scroll"><table><thead><tr><th>Mitarbeiter</th>' + DAYS.map(function (day) { return '<th>' + day + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (row) { return '<tr><th>' + h(rowName(db, row)) + '</th>' + row.values.map(function (_, dayIndex) { return '<td>' + planEntries(publishedPlan, row, dayIndex).map(function (entry) { return h(entryLabel(db, entry)); }).join('<br>') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div><p class="meta">Mitarbeitende können diese Planung nicht ändern. Unveröffentlichte Entwürfe bleiben ausschließlich im Büro sichtbar.</p></details>';
  }

  function renderTaskHub(db, ctx) {
    const item = function (view, title, text, count) { return '<button class="card workflow-start" data-action="navigate" data-view="' + view + '"><strong>' + h(title) + (count != null ? ' · ' + count : '') + '</strong><span>' + h(text) + '</span></button>'; };
    return ctx.head('Prüfen & Büro', 'Häufige Arbeitsvorräte an einem Ort') + '<section class="documentation-start-grid">' + item('times', 'Zeiten prüfen', 'Korrekturen und fehlende Buchungen', db.correctionRequests.filter(function (x) { return x.status === 'OPEN'; }).length) + item('weeks', 'Wochenzettel', 'Bestätigungen und Freigaben', db.weeklySheets.filter(function (x) { return x.status !== 'ADMIN_APPROVED'; }).length) + item('extras', 'Zusatzarbeiten', 'Dokumentation und kaufmännische Prüfung', db.extras.filter(function (x) { return x.commercialStatus === 'OPEN'; }).length) + item('material', 'Material', 'Anforderungen und Verbrauch prüfen', db.materialRecords.filter(function (x) { return x.status === 'NEW'; }).length) + item('leave', 'Urlaub', 'Anträge öffnen', db.leaveRequests.filter(function (x) { return x.status === 'REQUESTED'; }).length) + item('invoice-list', 'Rechnung schreiben?', 'Laufende Demo-Liste', db.invoiceTasks.length) + '</section><p class="decision-note"><strong>Demo-Struktur:</strong> Die Gruppierung priorisiert häufige Büroarbeit; endgültige Rechte und Verantwortlichkeiten bleiben offen.</p>';
  }

  function renderInvoiceList(db, ctx) {
    return ctx.head('Rechnung schreiben?', 'Laufende Büro-Liste · digitale Status sind Demo-Vorschläge') + '<div class="toolbar"><span><strong>' + db.invoiceTasks.length + '</strong> synthetische Einträge</span><div class="form-actions"><button class="secondary" data-mm-action="print" data-template="invoice-list">PDF / Druck</button><button class="primary" data-mm-action="xlsx-invoices">XLSX</button><button class="secondary" data-mm-action="csv-invoices">CSV</button></div></div><section class="card card-pad"><div class="table-scroll"><table><thead><tr><th>Datum</th><th>BV / Kunde</th><th>Mitarbeiter</th><th>Rechnung schreiben?</th><th>Projekt</th></tr></thead><tbody>' + db.invoiceTasks.map(function (x) { return '<tr><td>' + h(x.date) + '</td><td><strong>' + h(x.project) + '</strong><small>Bau-Nr. ' + h(x.site) + '</small></td><td>' + h(x.employee) + '</td><td>' + h(x.status) + (x.note ? '<small>' + h(x.note) + '</small>' : '') + '</td><td><button class="secondary" data-action="open-invoice-project" data-site="' + h(x.site) + '">Projekt öffnen</button></td></tr>'; }).join('') + '</tbody></table></div></section><p class="legal-note">Die Status sind eine Demo-Interpretation. Verantwortlicher und Abschlusskriterium bleiben fachlich offen.</p>';
  }

  function dynamicAccount(db, x) {
    const values = Object.assign({}, x, {
      materials: categoryTotal(db, x.site, 'MATERIAL_EXTERNAL'), lift: categoryTotal(db, x.site, 'LIFT'), subcontractor: categoryTotal(db, x.site, 'SUBCONTRACTOR'),
      tempStaff: categoryTotal(db, x.site, 'TEMP_STAFF'), scaffoldWaste: categoryTotal(db, x.site, 'SCAFFOLD_WASTE'), other: categoryTotal(db, x.site, 'OTHER')
    });
    return window.MMExcel ? Object.assign(values, window.MMExcel.account(db, x)) : values;
  }

  window.MMFinal = { days: DAYS, costTypes: COST_TYPES, renderPlanning: renderPlanning, renderPlanModal: renderPlanModal, renderCommercial: renderCommercial, renderMyWeek: renderMyWeek, renderTeamWeek: renderTeamWeek, renderTaskHub: renderTaskHub, renderInvoiceList: renderInvoiceList, handleForm: handleForm, handleAction: handleAction, dynamicAccount: dynamicAccount, categoryTotal: categoryTotal, dateFor: dateFor, weekInfo: weekInfo };
  window.DEMO_DATA_VERSION = 19;
}());


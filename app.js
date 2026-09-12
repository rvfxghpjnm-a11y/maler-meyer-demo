'use strict';

const DEMO_DATE = 'Donnerstag, 10. September';
const STORAGE_KEY = 'maler-meyer-demo-v8';
const app = document.getElementById('app');

const profiles = {
  management: { name: 'Torben', label: 'Geschäftsführung', initial: 'T' },
  office: { name: 'Sabine Beispiel', label: 'Büro', initial: 'S' },
  foreman: { name: 'Jan Testmann', label: 'Vorarbeiter', initial: 'J', employeeId: 'M-0003' },
  employee: { name: 'Max Beispiel', label: 'Mitarbeiter', initial: 'M', employeeId: 'M-0001' }
};
const statusText = { WORKING: 'Arbeitet', ON_BREAK: 'Pause', TRAVELING: 'Unterwegs', NOT_STARTED: 'Noch nicht gestartet', NOT_PLANNED: 'Nicht eingeplant', FINISHED: 'Beendet', REVIEW: 'Prüfbedarf' };
const statusKind = { WORKING: 'ok', ON_BREAK: 'warn', TRAVELING: 'travel', NOT_STARTED: 'problem', NOT_PLANNED: '', FINISHED: 'ok', REVIEW: 'problem' };
const eventText = { WORK_START: 'Arbeit gestartet', BREAK_START: 'Pause gestartet', BREAK_END: 'Pause beendet', SITE_LEAVE: 'Baustelle verlassen', TRAVEL_START: 'Fahrt begonnen', TRAVEL_END: 'Fahrt beendet', WORK_RESUME: 'Arbeit fortgesetzt', WORK_END: 'Feierabend', CORRECTION: 'Korrektur ergänzt' };
const weekText = { DRAFT: 'Entwurf · Mitarbeiterbestätigung fehlt', EMPLOYEE_CONFIRMED: 'Vom Mitarbeiter bestätigt', ADMIN_APPROVED: 'Büro/Admin freigegeben', CORRECTION_REQUESTED: 'Korrektur angefordert', NEEDS_RECONFIRM: 'Erneute Bestätigung erforderlich', NEEDS_CORRECTION: 'Unvollständig', NEEDS_REVIEW: 'Erneute Bestätigung erforderlich' };

let db = loadDb();
const ui = { role: 'management', view: 'today', query: '', employeeFilter: 'all', planningWeek: 37, selectedSite: null, selectedEmployee: null, selectedWeek: null, editCorrection: null, decisionExtra: null, confirmExtra: null, editExtra: null, weekCorrection: null, employeeAction: null, switchSite: false, login: false, toast: '' };
let toastTimer = null;

function loadDb() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.version === window.DEMO_DATA_VERSION && saved.data) return saved.data;
  } catch (_) {}
  return window.createDemoSeed();
}
function saveDb() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: window.DEMO_DATA_VERSION, data: db })); } catch (_) {}
}
function resetDb() { db = window.createDemoSeed(); saveDb(); Object.assign(ui, { view: 'today', query: '', employeeFilter: 'all', planningWeek: 37, selectedSite: null, selectedEmployee: null, selectedWeek: null, editCorrection: null, decisionExtra: null, confirmExtra: null, editExtra: null, weekCorrection: null, employeeAction: null, switchSite: false }); }
function esc(value) { return String(value == null ? '' : value).replace(/[&<>'"]/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]; }); }
function timeNow() { return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date()); }
function dateTimeNow() { return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date()).replace(',', ' ·') + ' Uhr'; }
function makeId(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6); }
function person(id) { return db.employees.find(function (item) { return item.id === id; }); }
function site(number) { return db.sites.find(function (item) { return item.number === number; }); }
function employeeName(id) { const item = person(id); return item ? item.name : id; }
function siteName(number) { const item = site(number); return item ? item.name : 'Keine Baustelle'; }
function assignment(employeeId) { return db.assignments.find(function (item) { return item.employeeId === employeeId; }); }
function profile() { return profiles[ui.role]; }
function actor() { return profile().name + ' · ' + profile().label; }
function isOfficeRole() { return ui.role === 'management' || ui.role === 'office'; }
function eventsFor(id) { return db.events.filter(function (item) { return item.employeeId === id; }); }
function openCorrections() { return db.correctionRequests.filter(function (item) { return item.status === 'OPEN'; }); }
function openExtras() { return db.extras.filter(function (item) { return item.commercialStatus === 'OPEN'; }); }
function pendingWeeks() { return db.weeklySheets.filter(function (item) { return item.status !== 'ADMIN_APPROVED'; }); }
function clone(value) { return window.MMWorkflow.clone(value); }
function demoHash(value) { return window.MMWorkflow.hashContent(value); }
function weekSnapshot(sheet) { return db.weeklySnapshots.find(function (item) { return item.id === sheet.confirmedSnapshotId; }); }
function snapshotsFor(sheet) { return db.weeklySnapshots.filter(function (item) { return item.sheetId === sheet.id; }).sort(function (a, b) { return b.version - a.version; }); }
function extraContent(extra) { return { extraId: extra.id, site: extra.site, description: extra.description, quantity: extra.quantity || '', unit: extra.unit || '', minutes: extra.minutes || '', photo: extra.photo || null }; }
function extraConfirmations(extra) { return db.extraConfirmations.filter(function (item) { return item.extraId === extra.id; }).sort(function (a, b) { return String(b.confirmedAt).localeCompare(String(a.confirmedAt)); }); }
function currentExtraConfirmation(extra) { const hash = demoHash(extraContent(extra)); return extraConfirmations(extra).find(function (item) { return item.contentHash === hash; }); }
function greeting(name) { const hour = new Date().getHours(); return (hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend') + ', ' + name; }
function badge(text, kind) { return `<span class="badge ${kind || ''}">${esc(text)}</span>`; }
function logo(size) { return `<span class="meyer-wordmark ${size || ''}" aria-hidden="true"><span>maler</span><span>meyer</span></span>`; }
function assumption(text) { return `<p class="assumption"><strong>Demo-Annahme</strong><span>${esc(text)}</span></p>`; }
function head(title, subtitle) { return `<div class="page-head"><div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><span class="demo-context">Erfundener Beispieltag</span></div>`; }

function navItems() {
  if (ui.role === 'employee') return [['today', 'H', 'Heute'], ['weeks', 'W', 'Wochenzettel'], ['notifications', 'N', 'Hinweise'], ['employee-extra', '+', 'Zusatzarbeit'], ['more', '···', 'Mehr']];
  if (ui.role === 'foreman') return [['today', 'H', 'Heute'], ['crew', 'K', 'Kolonne'], ['sites', 'B', 'Baustelle'], ['more', '···', 'Mehr']];
  return [['today', 'H', 'Heute'], ['planning', 'P', 'Planung'], ['sites', 'B', 'Baustellen'], ['employees', 'M', 'Mitarbeiter'], ['times', 'Z', 'Zeiten prüfen'], ['extras', '+', 'Zusatzarbeiten'], ['weeks', 'W', 'Wochenzettel'], ['notifications', 'N', 'Hinweise'], ['exports', '⇩', 'Dokumente & Exporte'], ['more', '···', 'Mehr']];
}
function mobileItems() {
  if (ui.role === 'employee') return [['today', 'H', 'Heute'], ['weeks', 'W', 'Woche'], ['notifications', 'N', 'Hinweise'], ['more', '···', 'Mehr']];
  if (ui.role === 'foreman') return navItems();
  return ui.role === 'office' ? [['today', 'H', 'Heute'], ['times', 'Z', 'Zeiten'], ['extras', '+', 'Zusätze'], ['more', '···', 'Mehr']] : [['today', 'H', 'Heute'], ['sites', 'B', 'Baustellen'], ['times', 'Z', 'Zeiten'], ['more', '···', 'Mehr']];
}
function navButton(item) {
  const mobileMore = item[0] === 'more' && ['planning', 'employees', 'weeks', 'exports'].includes(ui.view);
  const active = ui.view === item[0] || mobileMore;
  return `<button class="nav-button ${active ? 'active' : ''}" data-action="navigate" data-view="${item[0]}" ${active ? 'aria-current="page"' : ''}><span class="nav-icon">${item[1]}</span><span>${item[2]}</span></button>`;
}
function searchResults() {
  const q = ui.query.trim().toLowerCase();
  if (q.length < 2) return '';
  const matches = [];
  db.sites.forEach(function (item) { if ((item.number + ' ' + item.name + ' ' + item.address).toLowerCase().includes(q)) matches.push({ type: 'site', id: item.number, main: 'Bau-Nr. ' + item.number + ' · ' + item.name, sub: item.address }); });
  db.employees.forEach(function (item) { if ((item.name + ' ' + item.id + ' ' + (item.site || '')).toLowerCase().includes(q)) matches.push({ type: 'employee', id: item.id, main: item.name, sub: statusText[item.status] + (item.site ? ' · Bau-Nr. ' + item.site : '') }); });
  return `<div class="search-results" role="listbox">${matches.length ? matches.slice(0, 10).map(function (item) { return `<button class="search-result" data-action="open-${item.type}" data-id="${item.id}"><span><strong>${esc(item.main)}</strong></span><span>${esc(item.sub)}</span></button>`; }).join('') : '<div class="empty-note">Kein passender Eintrag.</div>'}</div>`;
}
function renderShell() {
  const p = profile();
  return `<div class="test-strip">TESTSYSTEM – KEINE PRODUKTIVDATEN <span>Alle Personen, Baustellen, Bilder und Vorgänge sind erfunden.</span></div><div class="app-shell"><aside class="sidebar"><a class="brand" href="#" data-action="navigate" data-view="today">${logo()}<small>Digitale Baustellenorganisation</small></a><nav class="side-nav">${navItems().map(navButton).join('')}</nav><div class="sidebar-footer"><strong>${esc(p.name)}</strong><small>${esc(p.label)} · Demo</small><small>powered by ShoreLogic</small></div></aside><div class="main-column"><header class="topbar"><a class="mobile-brand" href="#" data-action="navigate" data-view="today">${logo('compact')}</a>${isOfficeRole() ? `<div class="search-wrap"><span class="search-symbol">⌕</span><label class="sr-only" for="global-search">Bau-Nr., Baustelle oder Mitarbeiter suchen</label><input id="global-search" class="search-box" value="${esc(ui.query)}" placeholder="Bau-Nr., Baustelle oder Mitarbeiter suchen">${searchResults()}</div>` : '<div></div>'}<button class="profile-button" data-action="navigate" data-view="more"><span class="avatar">${p.initial}</span><span class="profile-copy"><strong>${esc(p.name)}</strong><small>${esc(p.label)}</small></span></button></header><main id="main-content" class="content" tabindex="-1">${renderView()}</main></div></div><nav class="mobile-nav">${mobileItems().map(navButton).join('')}</nav>${renderOverlays()}`;
}
function renderView() {
  if (ui.view === 'employee-extra') { ui.employeeAction = 'extra'; ui.view = 'today'; }
  if (ui.view === 'employee-note') { ui.employeeAction = 'note'; ui.view = 'today'; }
  if (ui.role === 'employee') {
    if (ui.view === 'more') return renderMoreV6();
    if (ui.view === 'weeks') return renderWeeks(true);
    if (ui.view === 'notifications') return renderNotifications();
    return renderEmployee();
  }
  if (ui.role === 'foreman') {
    if (ui.view === 'crew') return renderCrew();
    if (ui.view === 'sites') { ui.selectedSite = person(profile().employeeId).site; return renderSites(true); }
    if (ui.view === 'more') return renderMoreV6();
    return renderForeman();
  }
  if (ui.view === 'planning') return renderPlanning();
  if (ui.view === 'sites') return renderSites(false);
  if (ui.view === 'employees') return renderEmployees();
  if (ui.view === 'times') return renderTimes();
  if (ui.view === 'extras') return renderExtras();
  if (ui.view === 'weeks') return renderWeeks();
  if (ui.view === 'notifications') return renderNotifications();
  if (ui.view === 'exports') return renderExports();
  if (ui.view === 'more') return renderMoreV6();
  return ui.role === 'office' ? renderOffice() : renderManagement();
}
function statusGrid() {
  const counts = db.employees.reduce(function (all, item) { all[item.status] = (all[item.status] || 0) + 1; return all; }, {});
  return `<div class="status-grid status-grid-wide">${[['WORKING', 'Arbeiten'], ['ON_BREAK', 'Pause'], ['TRAVELING', 'Unterwegs'], ['NOT_STARTED', 'Noch nicht gestartet'], ['FINISHED', 'Beendet'], ['NOT_PLANNED', 'Nicht eingeplant'], ['REVIEW', 'Prüfbedarf']].map(function (item) { return `<button class="status-card" data-action="filter-status" data-status="${item[0]}"><strong>${counts[item[0]] || 0}</strong><span><i class="status-dot ${statusKind[item[0]] || 'free'}"></i>${item[1]}</span><small>Personen anzeigen</small></button>`; }).join('')}</div>`;
}
function renderManagement() {
  const newCount = db.extras.filter(function (item) { return item.docStatus === 'REPORTED'; }).length;
  const decided = db.extras.filter(function (item) { return item.commercialStatus !== 'OPEN'; }).length;
  return `${head(greeting('Torben'), DEMO_DATE + ' · Dein Betrieb auf einem Bildschirm')}${statusGrid()}${assumption('Der Beispieltag wird um 08:15 betrachtet. Erst ab diesem fiktiven Prüfzeitpunkt erscheinen fehlende Starts als Hinweis. Eine echte Schwelle ist noch offen.')}<div class="dashboard-grid section"><section class="attention-card"><div class="attention-head"><div><h2>Aufmerksamkeit nötig</h2><p>Nur Vorgänge, bei denen ein Blick sinnvoll ist.</p></div><span class="attention-count">${openCorrections().length + openExtras().length + pendingWeeks().length}</span></div><div class="attention-list"><button class="attention-item" data-action="navigate" data-view="times"><span><strong>${openCorrections().length} Zeitkorrekturen offen</strong><small>Originale bleiben erhalten</small></span><span class="action-word">Prüfen</span></button><button class="attention-item" data-action="navigate" data-view="extras"><span><strong>${openExtras().length} Zusatzarbeiten kaufmännisch offen</strong><small>Dokumentation und Abrechnung getrennt</small></span><span class="action-word">Ansehen</span></button><button class="attention-item" data-action="navigate" data-view="weeks"><span><strong>${pendingWeeks().length} Wochenzettel nicht freigegeben</strong><small>Fehler und erneute Prüfungen zuerst</small></span><span class="action-word">Prüfen</span></button></div></section><section class="card extra-summary"><h2>Zusatzarbeiten</h2><p>Zusätzliche Leistungen früh festhalten.</p><div class="metric-row"><div class="metric"><strong>${newCount}</strong><span>neu</span></div><div class="metric"><strong>${openExtras().length}</strong><span>offen</span></div><div class="metric"><strong>${decided}</strong><span>entschieden</span></div></div><button class="primary light" data-action="navigate" data-view="extras">Zusatzarbeiten öffnen</button></section></div><section class="section"><div class="section-title"><h2>Aktive Baustellen</h2><button data-action="navigate" data-view="sites">Alle Baustellen</button></div><div class="site-mini-grid">${db.sites.map(siteMini).join('')}</div></section>`;
}
function renderOffice() {
  return `${head(greeting(profile().name), 'Arbeitsvorrat im Büro · ' + DEMO_DATE)}<div class="work-queue"><button class="queue-card problem-card" data-action="navigate" data-view="times"><strong>${openCorrections().length}</strong><span>Zeitkorrekturen offen</span><small>Original und Änderung bleiben sichtbar</small></button><button class="queue-card" data-action="navigate" data-view="extras"><strong>${openExtras().length}</strong><span>Zusatzarbeiten offen</span><small>kaufmännische Prüfung</small></button><button class="queue-card" data-action="navigate" data-view="weeks"><strong>${pendingWeeks().length}</strong><span>Wochenzettel offen</span><small>prüfen oder freigeben</small></button><button class="queue-card" data-action="navigate" data-view="exports"><strong>3</strong><span>Exportarten</span><small>PDF und CSV</small></button></div>${assumption('Welche Bürokraft welche kaufmännische Entscheidung treffen darf, ist noch nicht endgültig beschlossen. In der Demo kann die Büro-Rolle beide Varianten testen.')}`;
}
function siteMini(item) {
  const workers = db.employees.filter(function (employee) { return employee.site === item.number && ['WORKING', 'ON_BREAK'].includes(employee.status); }).length;
  return `<button class="card site-mini" data-action="open-site" data-id="${item.number}"><span class="build-number">Bau-Nr. ${item.number}</span><h3>${esc(item.name)}</h3><p>${workers} vor Ort · ${item.open.length + openExtras().filter(function (extra) { return extra.site === item.number; }).length} offene Hinweise</p>${badge(item.status, item.kind)}</button>`;
}

function renderPlanning() {
  const plan = db.weekPlans.find(function (item) { return item.week === ui.planningWeek; }) || db.weekPlans[db.weekPlans.length - 1];
  return `${head('Tages- und Wochenplanung', 'Aktuelle Zuordnung für ' + DEMO_DATE)}${assumption('Geschäftsführung und Büro dürfen in dieser Demo die Planung ändern. Die endgültigen Planungsrechte bleiben offen.')}<div class="toolbar"><span><strong>${db.assignments.length}</strong> geplante Einsätze</span><div class="form-actions"><button class="secondary" data-action="download-planning">Tagesplanung als CSV</button><button class="primary" data-mm-action="xlsx-planning">Wochenplanung als XLSX</button><button class="secondary" data-mm-action="print" data-template="planning" data-week="${plan.week}">Wochenplanung drucken</button></div></div>${renderWeekMatrix(plan)}<div class="section-title section"><h2>Heutige Zuordnung ändern</h2><span class="meta">Änderungen wirken sofort in der Demo</span></div><div class="list">${db.employees.map(function (employee) {
    const current = assignment(employee.id);
    return `<article class="card planning-card"><div><strong>${esc(employee.name)}</strong><small>${esc(employee.job)} · ${statusText[employee.status]}</small></div><form data-form="planning-change" data-employee="${employee.id}"><select name="site" aria-label="Baustelle für ${esc(employee.name)}"><option value="">Nicht eingeplant</option>${db.sites.map(function (item) { return `<option value="${item.number}" ${current && current.site === item.number ? 'selected' : ''}>Bau-Nr. ${item.number} · ${esc(item.name)}</option>`; }).join('')}</select><input name="reason" aria-label="Grund der Umplanung" placeholder="Grund der Änderung" required><button class="secondary">Zuordnung speichern</button></form>${current && current.originalSite ? `<div class="change-note"><strong>Geändert:</strong> ${esc(current.originalSite || 'nicht eingeplant')} → ${esc(current.site || 'nicht eingeplant')}<small>${esc(current.changedBy)} · ${esc(current.changedAt)} · ${esc(current.note)}</small></div>` : ''}</article>`;
  }).join('')}</div>`;
}

function renderWeekMatrix(plan) {
  const monday = new Date(plan.monday + 'T12:00:00');
  const dates = new Array(6).fill(0).map(function (_, index) { const date = new Date(monday); date.setDate(date.getDate() + index); return String(date.getDate()).padStart(2, '0') + '.' + String(date.getMonth() + 1).padStart(2, '0') + '.'; });
  const groupRows = function (group) {
    const rows = plan.rows.filter(function (row) { return row.group === group; });
    return `<tr class="week-group"><th colspan="8">${esc(group)}</th></tr>${rows.map(function (row, index) { const label = row.displayName || employeeName(row.employeeId); return `<tr><td>${index + 1}</td><th>${esc(label)}</th>${row.values.map(function (value) { const kind = value === 'Krank' ? 'week-sick' : value === 'Urlaub' ? 'week-leave' : ''; return `<td class="${kind}">${esc(value)}</td>`; }).join('')}</tr>`; }).join('')}`;
  };
  return `<section class="card card-pad week-matrix"><div class="section-title"><h2>Wochenplanung 2026 · KW ${plan.week}</h2><div class="filter-row">${db.weekPlans.map(function (item) { return `<button class="filter-button ${item.week === plan.week ? 'active' : ''}" data-action="planning-week" data-week="${item.week}">KW ${item.week}</button>`; }).join('')}</div></div><div class="table-scroll"><table><thead><tr><th>Nr.</th><th>Mitarbeiter</th>${['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'].map(function (day, index) { return `<th>${day}<small>${dates[index]}</small></th>`; }).join('')}</tr></thead><tbody>${groupRows('Mitarbeiter')}${groupRows('Auszubildende / Praktikum')}${groupRows('Subunternehmer')}</tbody></table></div></section>`;
}

function renderSites(single) {
  const items = single ? db.sites.filter(function (item) { return item.number === ui.selectedSite; }) : db.sites;
  return `${head(single ? 'Meine Baustelle' : 'Baustellen', 'Die Bau-Nr. verbindet Planung, Zeiten und Dokumentation')}<div class="site-grid">${items.map(function (item) { return siteCard(item, single || ui.selectedSite === item.number); }).join('')}</div>`;
}
function siteCard(item, open) {
  const members = db.employees.filter(function (employee) { return employee.site === item.number; });
  return `<article class="card site-card"><button class="site-button" data-action="open-site" data-id="${item.number}" aria-expanded="${open}"><div class="site-top"><span class="build-number">Bau-Nr. ${item.number}</span>${badge(item.status, item.kind)}</div><h3>${esc(item.name)}</h3><p>${esc(item.address)}</p><div class="team-line">${members.slice(0, 5).map(function (employee) { return `<span class="person-chip">${esc(employee.name)} · ${statusText[employee.status]}</span>`; }).join('')}${members.length > 5 ? `<span class="person-chip">+${members.length - 5} weitere</span>` : ''}</div></button>${open ? siteFolder(item) : ''}</article>`;
}
function siteFolder(item) {
  const members = db.employees.filter(function (employee) { return employee.site === item.number; });
  const eventList = db.events.filter(function (event) { return event.site === item.number || event.fromSite === item.number; }).slice().reverse();
  const notes = db.notes.filter(function (note) { return note.site === item.number; });
  const extras = db.extras.filter(function (extra) { return extra.site === item.number; });
  const documents = db.documents.filter(function (doc) { return doc.site === item.number; });
  const restTasks = db.restTasks.filter(function (task) { return task.site === item.number; });
  return `<div class="folder-detail"><div class="folder-head"><div><span class="eyebrow">Digitale Baustellenmappe</span><h2>Bau-Nr. ${item.number} · ${esc(item.name)}</h2><p>${esc(item.customer)}</p></div><button class="secondary" data-action="close-site">Schließen</button></div><div class="detail-grid">
    <section class="detail-block"><h3>Stammdaten</h3><dl class="facts"><dt>Adresse</dt><dd>${esc(item.address)}</dd><dt>Ansprechpartner</dt><dd>${esc(item.contact)}</dd><dt>Zugang</dt><dd>${esc(item.access)}</dd><dt>Zeitraum</dt><dd>${esc(item.dates)}</dd><dt>Abrechnungshinweis</dt><dd>${esc(item.invoice)}</dd></dl></section>
    <section class="detail-block"><h3>Aufgaben & Materialhinweise</h3><strong>Aufgaben</strong><ul>${item.tasks.map(function (text) { return `<li>${esc(text)}</li>`; }).join('')}</ul>${item.extraTasks.length ? `<strong>Zusätzliche Aufgaben</strong><ul>${item.extraTasks.map(function (text) { return `<li>${esc(text)}</li>`; }).join('')}</ul>` : ''}<strong>Mitzubringen</strong><p>${esc(item.materials.join(', '))}</p></section>
    <section class="detail-block full-span"><h3>Heute auf der Baustelle</h3><div class="people-table">${members.map(function (employee) { return `<button data-action="open-employee" data-id="${employee.id}"><span><strong>${esc(employee.name)}</strong><small>${esc(employee.job)}</small></span>${badge(statusText[employee.status], statusKind[employee.status])}</button>`; }).join('')}</div></section>
    <section class="detail-block"><h3>Offene Punkte</h3>${item.open.length || restTasks.length ? `<ul>${item.open.map(function (text) { return `<li>${esc(text)}</li>`; }).join('')}${restTasks.map(function (task) { return `<li><strong>${esc(task.area)}:</strong> ${esc(task.description)} · ${esc(task.status.toLowerCase())}</li>`; }).join('')}</ul>` : '<p>Keine offenen Punkte im Beispiel.</p>'}</section>
    <section class="detail-block"><h3>Zusatzarbeiten</h3>${extras.length ? extras.map(function (extra) { return `<button class="compact-link" data-action="open-extra" data-id="${extra.id}"><strong>${esc(extra.description)}</strong><small>${extraCommercial(extra)}</small></button>`; }).join('') : '<p>Keine Zusatzarbeit im Beispiel.</p>'}</section>
    <section class="detail-block full-span"><h3>Notizen und synthetische Bilder</h3><div class="documentation-grid">${notes.map(renderNote).join('') || '<p>Keine Notizen.</p>'}</div></section>
    <section class="detail-block full-span"><h3>Zeit- und Baustellenverlauf</h3><ol class="timeline compact">${eventList.slice(0, 14).map(function (event) { return `<li><time>${event.time}</time><span><strong>${esc(eventText[event.type] || event.type)} · ${esc(employeeName(event.employeeId))}</strong><small>${event.createdBy !== event.createdFor ? 'Gebucht durch ' + esc(employeeName(event.createdBy)) : 'Selbst gebucht'}${event.note ? ' · ' + esc(event.note) : ''}</small></span></li>`; }).join('')}</ol></section>
    <section class="detail-block full-span"><h3>Dokumente & Exporte</h3>${documents.length ? documents.map(function (doc) { return `<div class="document-row"><span><strong>${esc(doc.title)}</strong><small>${esc(doc.type)}</small></span>${badge(doc.status, 'ok')}</div>`; }).join('') : '<p>Noch keine Beispieldokumente.</p>'}<div class="site-export-actions"><button class="secondary" data-mm-action="print" data-template="work-order" data-site="${item.number}">Arbeitszettel</button><button class="secondary" data-mm-action="print" data-template="material-request" data-site="${item.number}">Materialanforderung</button><button class="secondary" data-mm-action="print" data-template="material-usage" data-site="${item.number}">Materialeinsatz</button><button class="secondary" data-mm-action="print" data-template="measurement" data-site="${item.number}">Aufmaß</button><button class="secondary" data-mm-action="print" data-template="protocol" data-site="${item.number}">Baubesprechung</button><button class="primary" data-mm-action="xlsx-project" data-site="${item.number}">Projekt-Unterkonto XLSX</button></div><p class="meta">Alle Druckansichten verwenden ausschließlich synthetische Daten. Offene Fachregeln werden nicht berechnet.</p></section>
  </div></div>`;
}
function renderNote(note) {
  return `<article class="note-card"><div><strong>${esc(note.category)}</strong><small>${esc(note.author)} · ${esc(note.time)}</small><p>${esc(note.text)}</p></div>${note.photo ? syntheticPhoto(note.photo, note.id) : ''}</article>`;
}
function syntheticPhoto(label, seed) {
  const variant = String(seed).charCodeAt(String(seed).length - 1) % 3;
  return `<figure class="synthetic-photo variant-${variant}" role="img" aria-label="Synthetisches Beispielbild: ${esc(label)}"><div class="photo-wall"><span></span><i></i></div><figcaption><strong>Synthetisches Beispielbild</strong><small>${esc(label)}</small></figcaption></figure>`;
}

function renderEmployees() {
  const filters = [['all', 'Alle'], ['WORKING', 'Arbeitet'], ['ON_BREAK', 'Pause'], ['TRAVELING', 'Unterwegs'], ['NOT_STARTED', 'Nicht gestartet'], ['FINISHED', 'Beendet'], ['NOT_PLANNED', 'Nicht eingeplant'], ['REVIEW', 'Prüfbedarf']];
  const list = ui.employeeFilter === 'all' ? db.employees : db.employees.filter(function (item) { return item.status === ui.employeeFilter; });
  return `${head('Mitarbeiter', 'Wer ist heute wo – mit Ereignisverlauf direkt bei der Person')}<div class="filter-row">${filters.map(function (item) { return `<button class="filter-button ${ui.employeeFilter === item[0] ? 'active' : ''}" data-action="employee-filter" data-status="${item[0]}">${item[1]}</button>`; }).join('')}</div><div class="list">${list.map(employeeCard).join('')}</div>`;
}
function employeeCard(employee) {
  const open = ui.selectedEmployee === employee.id;
  const current = assignment(employee.id);
  const items = eventsFor(employee.id).slice().reverse();
  return `<article class="card employee-card ${employee.status === 'REVIEW' ? 'problem-card' : ''}"><button class="item-button" data-action="open-employee" data-id="${employee.id}" aria-expanded="${open}"><span><strong>${esc(employee.name)}</strong><small>${esc(employee.job)} · ${employee.id}</small></span><span>${badge(statusText[employee.status], statusKind[employee.status])}<small>${employee.site ? 'Bau-Nr. ' + employee.site + ' · seit ' + employee.since : 'Heute ohne Zuordnung'}</small></span></button>${open ? `<div class="inline-detail"><div class="inline-summary"><span><small>Geplant</small><strong>${current ? 'Bau-Nr. ' + current.site : 'Nicht eingeplant'}</strong></span><span><small>Aktuell</small><strong>${employee.site ? 'Bau-Nr. ' + employee.site : '–'}</strong></span></div><h3>Heutiger Ereignisverlauf</h3><ol class="timeline">${items.length ? items.map(function (event) { return `<li><time>${event.time}</time><span><strong>${esc(eventText[event.type] || event.type)}</strong><small>${event.site ? 'Bau-Nr. ' + event.site : ''}${event.createdBy !== event.createdFor ? ' · durch ' + esc(employeeName(event.createdBy)) : ''}</small></span></li>`; }).join('') : `<li><time>–</time><span><strong>Noch keine Zeitbuchung</strong><small>${current ? 'Geplant für Bau-Nr. ' + current.site : 'Nicht eingeplant'}</small></span></li>`}</ol></div>` : ''}</article>`;
}

function renderTimes() {
  return `${head('Zeiten prüfen', 'Fehlende oder auffällige Buchungen zuerst')}<section><div class="section-title"><h2>${openCorrections().length} offene Korrekturmeldungen</h2><span class="meta">Keine stille Überschreibung</span></div><div class="list">${openCorrections().map(correctionCard).join('') || '<div class="empty-note">Keine offene Korrekturmeldung.</div>'}</div></section><section class="section"><div class="section-title"><h2>Bereits bearbeitet</h2><span class="meta">Vorher, nachher, Bearbeiter und Grund</span></div><div class="list">${db.corrections.map(function (item) { return `<article class="audit-box"><strong>${esc(employeeName(item.employeeId))}</strong><p><strong>Vorher:</strong> ${esc(item.before)}<br><strong>Nachher:</strong> ${esc(item.after)}</p><p><strong>Grund:</strong> ${esc(item.reason)}</p><small>${esc(item.editor)} · ${esc(item.when)} · Original bleibt erhalten</small></article>`; }).join('')}</div></section>${renderMonthOverview()}<section class="section"><button class="secondary" data-action="download-times">Zeitereignisse als CSV herunterladen</button></section>`;
}

function renderMonthOverview() {
  const rows = db.employees.map(function (employee) {
    const records = db.monthHistory.filter(function (item) { return item.employeeId === employee.id; });
    const workDays = records.filter(function (item) { return item.acceptedMinutes != null; });
    const minutes = workDays.reduce(function (sum, item) { return sum + item.acceptedMinutes; }, 0);
    const travel = records.reduce(function (sum, item) { return sum + (item.travelMinutes || 0); }, 0);
    const issues = records.filter(function (item) { return item.issue; }).length;
    const markers = records.filter(function (item) { return item.marker; }).map(function (item) { return item.marker; });
    return `<tr><th>${esc(employee.name)}<small>${esc(employee.job)}</small></th><td>${workDays.length}</td><td>${(minutes / 60).toFixed(2).replace('.', ',')} Std.</td><td>${travel} Min.</td><td>${markers.length ? esc(markers.join(', ')) : '–'}</td><td>${issues ? badge(issues + ' Prüfhinweis', 'problem') : badge('vollständig', 'ok')}</td></tr>`;
  }).join('');
  return `<section class="section card card-pad month-overview"><div class="section-title"><h2>Monatsverlauf · August / September 2026</h2><span class="meta">03.08.–11.09. · 29 synthetische Mitarbeiter</span></div><div class="table-scroll"><table><thead><tr><th>Mitarbeiter</th><th>Tage mit Zeit</th><th>akzeptierte Rohzeit</th><th>Fahrt roh</th><th>Abwesenheit</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div><p class="meta">Die Zeitwerte sind synthetische, bereits akzeptierte Demo-Rohwerte. Keine Lohn-, Überstunden- oder Fahrtvergütungsregel wird berechnet.</p></section>`;
}
function correctionCard(request) {
  const employee = person(request.employeeId);
  const open = ui.editCorrection === request.id;
  return `<article class="card correction-card problem-card"><button class="item-button" data-action="open-correction" data-id="${request.id}"><span><strong>${esc(employee.name)}</strong><small>${esc(request.description)}</small></span><span>${badge('Prüfung nötig', 'problem')}<small>Bau-Nr. ${request.site}</small></span></button>${open ? `<form class="inline-detail" data-form="time-correction" data-id="${request.id}"><div class="before-after"><div><small>Original</small><strong>${esc(request.original)}</strong></div><div><small>Vorschlag</small><strong>${esc(request.suggestion)}</strong></div></div><div class="form-grid"><label>Korrigierter Wert<input name="after" value="${esc(request.suggestion)}" required></label><label>Bearbeitet durch<input value="${esc(actor())}" disabled></label><label class="full">Begründung<textarea name="reason" required placeholder="Wie wurde die Angabe geprüft?"></textarea></label></div><div class="form-actions"><button class="primary" type="button" data-action="submit-correction">Korrektur protokollieren</button><button class="secondary" type="button" data-action="close-correction">Abbrechen</button></div></form>` : ''}</article>`;
}

function saveTimeCorrection(form) {
  if (!form || !form.reportValidity()) return;
  const values = new FormData(form);
  const request = db.correctionRequests.find(function (item) { return item.id === form.dataset.id; });
  const after = values.get('after');
  request.status = 'RESOLVED';
  db.corrections.unshift({ id: makeId('K'), requestId: request.id, employeeId: request.employeeId, before: request.original, after: after, editor: actor(), when: timeNow(), reason: values.get('reason') });
  db.events.push({ id: makeId('E'), employeeId: request.employeeId, type: 'CORRECTION', time: timeNow(), site: request.site, createdBy: profile().employeeId || ui.role, createdFor: request.employeeId, note: request.original + ' → ' + after });
  const employee = person(request.employeeId);
  if (['REVIEW', 'NOT_STARTED'].includes(employee.status)) { employee.status = 'WORKING'; employee.since = (String(after).match(/\d\d:\d\d/) || [timeNow()])[0]; }
  if (request.sheetId) {
    const sheet = db.weeklySheets.find(function (item) { return item.id === request.sheetId; });
    const oldVersion = sheet.version;
    const oldSnapshot = snapshotsFor(sheet).find(function (item) { return item.version === oldVersion; });
    if (oldSnapshot) oldSnapshot.supersededByVersion = oldVersion + 1;
    const day = sheet.days.find(function (item) { return item.day === request.weekDay; });
    if (day && request.bookingField) {
      day[request.bookingField] = after;
      day.issue = '';
    }
    sheet.version = oldVersion + 1;
    sheet.status = 'NEEDS_RECONFIRM';
    sheet.confirmedSnapshotId = null;
    sheet.history.push('Korrektur durch ' + actor() + '; Version ' + sheet.version + ' erzeugt');
    sheet.history.push('Alte Bestätigung nicht übernommen · erneute Bestätigung erforderlich');
    db.notifications.unshift({ id: makeId('NOT'), employeeId: sheet.employeeId, type: 'WEEK_REVIEW', title: 'Wochenübersicht ' + sheet.week + ' · Version ' + sheet.version + ' wartet auf deine erneute Bestätigung.', body: 'Eine Korrektur wurde bearbeitet. Die alte Version bleibt im Verlauf.', sheetId: sheet.id, createdAt: 'Heute · ' + timeNow(), read: false });
  }
  audit('TIME_CORRECTED', request.id, 'Zeitkorrektur protokolliert', request.original, after, values.get('reason'));
  ui.editCorrection = null;
  saveDb();
  toast('Korrektur gespeichert; Original und Verlauf bleiben sichtbar.');
}

function createWeekSnapshot(sheet, signatureDataUrl) {
  const content = { employeeId: sheet.employeeId, employeeName: employeeName(sheet.employeeId), week: sheet.week, version: sheet.version, days: clone(sheet.days) };
  const snapshot = {
    id: 'WS-' + demoHash(content).replace('DEMO-', '') + '-V' + sheet.version,
    sheetId: sheet.id, employeeId: sheet.employeeId, week: sheet.week, version: sheet.version,
    confirmedAt: dateTimeNow(), confirmedBy: profile().name, content: content, contentHash: demoHash(content),
    signatureDataUrl: signatureDataUrl || null, status: 'EMPLOYEE_CONFIRMED', supersededByVersion: null
  };
  db.weeklySnapshots = db.weeklySnapshots.filter(function (item) { return !(item.sheetId === sheet.id && item.version === sheet.version); });
  db.weeklySnapshots.push(snapshot);
  sheet.confirmedSnapshotId = snapshot.id;
  sheet.status = 'EMPLOYEE_CONFIRMED';
  sheet.history.push(profile().name + ' hat Version ' + sheet.version + ' am ' + snapshot.confirmedAt + (signatureDataUrl ? ' mit gezeichneter Demo-Unterschrift bestätigt' : ' ohne gezeichnete Unterschrift bestätigt'));
  db.notifications.filter(function (item) { return item.sheetId === sheet.id; }).forEach(function (item) { item.read = true; });
  audit('WEEK_CONFIRMED', sheet.id, 'Wochenzettel bestätigt', 'Bestätigung offen', 'Vom Mitarbeiter bestätigt', 'Eingefrorener Snapshot ' + snapshot.contentHash);
  saveDb();
  toast('Version ' + sheet.version + ' wurde als unveränderbarer Stand bestätigt.');
}

function extraCommercial(extra) {
  return extra.commercialStatus === 'BILLING' ? 'Zur Abrechnung vorgesehen' : extra.commercialStatus === 'NOT_BILLABLE' ? 'Nicht abrechenbar' : extra.commercialStatus === 'CLOSED' ? 'Erledigt' : 'Kaufmännische Prüfung offen';
}
function extraDocument(extra) {
  return extra.docStatus === 'COMPLETE' ? 'Dokumentation vollständig' : extra.docStatus === 'REVIEW' ? 'Dokumentation prüfen' : 'Neu gemeldet';
}
function renderExtras() {
  const list = db.extras.slice().sort(function (a, b) { return (a.commercialStatus === 'OPEN' ? 0 : 1) - (b.commercialStatus === 'OPEN' ? 0 : 1); });
  return `${head('Zusatzarbeiten', 'Dokumentation und kaufmännische Entscheidung bleiben getrennt')}<div class="status-grid extra-status-grid"><div class="status-card"><strong>${db.extras.filter(function (item) { return item.docStatus === 'REPORTED'; }).length}</strong><span>Neu gemeldet</span><small>Dokumentation ergänzen</small></div><div class="status-card"><strong>${openExtras().length}</strong><span>Prüfung offen</span><small>noch keine Entscheidung</small></div><div class="status-card"><strong>${db.extras.filter(function (item) { return item.commercialStatus === 'BILLING'; }).length}</strong><span>Zur Abrechnung</span><small>Beispielentscheidung</small></div><div class="status-card"><strong>${db.extras.filter(function (item) { return item.commercialStatus === 'NOT_BILLABLE'; }).length}</strong><span>Nicht abrechenbar</span><small>bleibt erhalten</small></div></div>${assumption('In der Demo dürfen Geschäftsführung und Büro kaufmännische Entscheidungen testen. Die endgültige Rechteverteilung ist noch offen.')}<div class="list section">${list.map(extraCard).join('')}</div><p class="meta section">Eine Bestätigung der dokumentierten Zusatzarbeit ist keine rechtsverbindliche Abnahme und keine automatische Rechnungsfreigabe.</p>`;
}
function extraCard(extra) {
  const employee = person(extra.employeeId);
  const decided = extra.commercialStatus !== 'OPEN';
  const confirmations = extraConfirmations(extra);
  const currentConfirmation = currentExtraConfirmation(extra);
  const confirmationLabel = currentConfirmation ? 'Bestätigung vorhanden' : confirmations.length ? 'Inhalt geändert · neue Bestätigung erforderlich' : 'Bestätigung nicht vorhanden';
  return `<article class="card extra-card ${decided ? 'resolved-card' : ''}" id="extra-${extra.id}"><div class="item-top"><span class="build-number">Bau-Nr. ${extra.site}</span><span>${badge(extraDocument(extra), extra.docStatus === 'COMPLETE' ? 'ok' : 'warn')} ${badge(confirmationLabel, currentConfirmation ? 'ok' : 'problem')} ${badge(extraCommercial(extra), decided ? 'ok' : 'problem')}</span></div><h3>${esc(extra.description)}</h3><p>${esc(siteName(extra.site))}</p><div class="extra-meta"><span>Gemeldet von<strong>${esc(employee.name)}</strong></span><span>Zeitpunkt<strong>${esc(extra.reportedAt)}</strong></span><span>Menge<strong>${esc(extra.quantity + ' ' + extra.unit)}</strong></span><span>Zeitaufwand<strong>${esc(extra.minutes ? extra.minutes + ' Min. (roh)' : 'nicht angegeben')}</strong></span></div>${extra.photo ? syntheticPhoto(extra.photo, extra.id) : '<div class="confirmation"><strong>Kein Beispielbild hinterlegt</strong></div>'}<div class="confirmation"><strong>Bestätigung der dokumentierten Zusatzarbeit</strong><small>${esc(confirmationLabel)}. Dies ist keine automatische Rechnungsfreigabe.</small></div>${confirmations.length ? `<details class="history confirmation-history"><summary>${confirmations.length} eingefrorene Bestätigung${confirmations.length === 1 ? '' : 'en'} anzeigen</summary>${confirmations.map(function (item) { return `<article class="snapshot-row"><div><strong>${esc(item.confirmedAt)} · ${esc(item.confirmerName)}</strong><small>${esc(item.content.quantity + ' ' + item.content.unit)} · ${esc(item.contentHash)}${item.contentHash === demoHash(extraContent(extra)) ? ' · aktueller Inhalt' : ' · früherer Inhalt'}</small></div><button class="secondary" data-action="print-extra-confirmation" data-id="${item.id}">Druckansicht</button></article>`; }).join('')}</details>` : ''}${extra.decisionReason ? `<div class="decision-box"><strong>${esc(extraCommercial(extra))}</strong><p>${esc(extra.decisionReason)}</p></div>` : ''}<details class="history"><summary>Verlauf anzeigen</summary><ul>${extra.history.map(function (line) { return `<li>${esc(line)}</li>`; }).join('')}</ul></details><div class="form-actions"><button class="secondary" data-action="open-site" data-id="${extra.site}">Baustellenmappe</button><button class="secondary" data-action="edit-extra" data-id="${extra.id}">Inhalt ändern</button>${!currentConfirmation ? `<button class="primary" data-action="confirm-extra" data-id="${extra.id}">Vor-Ort-Bestätigung aufnehmen</button>` : ''}${extra.docStatus !== 'COMPLETE' && isOfficeRole() ? `<button class="secondary" data-action="complete-extra" data-id="${extra.id}">Dokumentation vollständig</button>` : ''}${extra.commercialStatus === 'OPEN' && isOfficeRole() ? `<button class="primary" data-action="decide-extra" data-id="${extra.id}">Kaufmännisch prüfen</button>` : ''}</div></article>`;
}

function renderWeeks(ownOnly) {
  const sheets = ownOnly ? db.weeklySheets.filter(function (item) { return item.employeeId === profile().employeeId; }) : db.weeklySheets;
  return `${head(ownOnly ? 'Meine Wochenübersichten' : 'Wochenzettel', 'Aus Ereignissen erstellt · Fahrzeit separat und unbewertet')}<div class="week-state-legend">${['DRAFT','EMPLOYEE_CONFIRMED','CORRECTION_REQUESTED','NEEDS_RECONFIRM','ADMIN_APPROVED'].map(function (state) { return badge(weekText[state], state === 'ADMIN_APPROVED' ? 'ok' : state === 'EMPLOYEE_CONFIRMED' ? 'warn' : 'problem'); }).join('')}</div><div class="list">${sheets.map(weekCard).join('')}</div>`;
}
function weekCard(sheet) {
  const employee = person(sheet.employeeId);
  const open = ui.selectedWeek === sheet.id;
  const issueCount = sheet.days.filter(function (day) { return day.issue; }).length;
  const kind = sheet.status === 'ADMIN_APPROVED' ? 'ok' : ['NEEDS_CORRECTION', 'NEEDS_REVIEW', 'NEEDS_RECONFIRM', 'CORRECTION_REQUESTED'].includes(sheet.status) ? 'problem' : 'warn';
  return `<article class="card week-card"><button class="item-button week-button" data-action="open-week" data-id="${sheet.id}"><span><strong>${esc(employee.name)}</strong><small>${sheet.week} · Version ${sheet.version}</small></span><span>${badge(weekText[sheet.status], kind)}<small>${issueCount ? issueCount + ' fehlende Angabe' : '5 Tage sichtbar'}</small></span></button>${open ? weekDetail(sheet) : ''}</article>`;
}
function weekDetail(sheet) {
  const complete = !sheet.days.some(function (day) { return day.issue; });
  const canConfirm = ui.role === 'employee' && sheet.employeeId === profile().employeeId && complete && ['DRAFT', 'NEEDS_REVIEW', 'NEEDS_RECONFIRM'].includes(sheet.status);
  const canCorrect = ui.role === 'employee' && sheet.employeeId === profile().employeeId;
  const canApprove = isOfficeRole() && complete && sheet.status === 'EMPLOYEE_CONFIRMED';
  const snapshots = snapshotsFor(sheet);
  return `<div class="inline-detail week-detail"><div class="table-scroll"><table><thead><tr><th>Tag</th><th>Bau-Nr.</th><th>Beginn</th><th>Pause</th><th>Ende</th><th>Fahrt roh</th><th>Vollständigkeit</th></tr></thead><tbody>${sheet.days.map(function (day) { return `<tr class="${day.issue ? 'row-problem' : ''}"><td><strong>${day.day}</strong><small>${day.date}</small></td><td>${day.site}</td><td>${day.start}</td><td>${day.break}</td><td>${day.end}</td><td>${day.travel}</td><td>${day.issue || 'vollständig'}</td></tr>`; }).join('')}</tbody></table></div><p class="meta">Keine Lohn-, Überstunden- oder Fahrzeitbewertung. Angezeigt werden synthetische Rohangaben.</p><div class="form-actions"><button class="secondary" data-action="download-week-pdf" data-id="${sheet.id}">Aktuelle Druckansicht</button>${canCorrect ? `<button class="secondary" data-action="week-correction" data-id="${sheet.id}">Korrektur melden</button>` : ''}${canConfirm ? `<button class="primary" data-action="confirm-week" data-id="${sheet.id}">Bestätigen</button>` : ''}${canApprove ? '<button class="primary" data-action="approve-week" data-id="' + sheet.id + '">Büro/Admin freigeben</button>' : ''}${!complete && isOfficeRole() ? '<button class="secondary" data-action="navigate" data-view="times">Korrektur prüfen</button>' : ''}</div>${snapshots.length ? `<section class="snapshot-list"><h3>Eingefrorene bestätigte Versionen</h3>${snapshots.map(function (snapshot) { const approval = db.weeklyApprovals.find(function (item) { return item.snapshotId === snapshot.id; }); return `<article class="snapshot-row ${snapshot.supersededByVersion ? 'snapshot-old' : ''}"><div><strong>Version ${snapshot.version} · ${esc(snapshot.confirmedAt)}</strong><small>${snapshot.supersededByVersion ? 'Nicht mehr aktueller Stand – durch Version ' + snapshot.supersededByVersion + ' ersetzt' : approval ? 'Büro/Admin freigegeben' : 'Vom Mitarbeiter bestätigt'} · ${esc(snapshot.contentHash)} · ${snapshot.signatureDataUrl ? 'mit gezeichneter Unterschrift' : 'ohne gezeichnete Unterschrift'}</small></div><button class="secondary" data-action="print-week-snapshot" data-id="${snapshot.id}">PDF-/Druckvorschau</button></article>`; }).join('')}</section>` : ''}<details class="history"><summary>Versions- und Freigabeverlauf</summary><ul>${sheet.history.map(function (line) { return `<li>${esc(line)}</li>`; }).join('')}</ul></details></div>`;
}

function renderNotifications() {
  const employeeId = profile().employeeId;
  const items = employeeId ? db.notifications.filter(function (item) { return item.employeeId === employeeId; }) : db.notifications;
  return `${head('Benachrichtigungen', 'Demo-Zentrum für Hinweise und direkte Sprünge')}<section class="notification-explainer"><strong>Beispiel-Erinnerung: Freitag 16:00 Uhr</strong><p>Der Zeitpunkt ist eine konfigurierbare Demo-Annahme und keine fest beschlossene Betriebsregel.</p><button class="secondary" data-action="test-notification">Test-Benachrichtigung anzeigen</button></section><div class="list section">${items.map(function (item) { return `<button class="card notification-card ${item.read ? '' : 'unread'}" data-action="open-notification" data-id="${item.id}"><span><strong>${esc(item.title)}</strong><small>${esc(item.body)}</small><small>${esc(item.createdAt)}</small></span><span class="action-word">Öffnen</span></button>`; }).join('') || '<div class="empty-note">Keine Hinweise vorhanden.</div>'}</div><p class="legal-note">Echte Push-Zustellung bei geschlossener App ist hier nicht aktiv. Dafür werden später Push-Service, Service Worker, Backend-Zeitplanung, Geräteberechtigung und sichere Benutzerzuordnung benötigt.</p>`;
}

function renderExports() { return window.MMExports.render(db); }

function renderForeman() {
  const foreman = person(profile().employeeId);
  const crew = db.employees.filter(function (item) { return item.site === foreman.site; });
  return `${head(greeting(profile().name), 'Deine Baustelle und Kolonne · ' + DEMO_DATE)}<section class="card employee-project"><span class="build-number">Bau-Nr. ${foreman.site}</span><h2>${esc(siteName(foreman.site))}</h2><p>${esc(site(foreman.site).address)}</p><div class="employee-status"><small>Dein Status</small><strong>${statusText[foreman.status]}</strong></div></section><section class="section"><div class="section-title"><h2>Deine Demo-Kolonne</h2><button data-action="navigate" data-view="crew">Kolonne buchen</button></div><div class="crew-preview">${crew.slice(0, 6).map(function (member) { return `<div><span class="avatar small">${member.name.charAt(0)}</span><span><strong>${esc(member.name)}</strong><small>${statusText[member.status]}</small></span></div>`; }).join('')}</div></section>${assumption('Die Demo zeigt nur die Personen auf dieser Baustelle. Die endgültige Reichweite der Vorarbeiterrechte ist noch offen.')}`;
}
function renderCrew() {
  const foreman = person(profile().employeeId);
  const crew = db.employees.filter(function (item) { return item.site === foreman.site && item.id !== foreman.id; });
  const bookings = db.events.filter(function (item) { return item.createdBy === foreman.id && item.createdFor !== foreman.id; }).slice().reverse();
  return `${head('Kolonnenbuchung', 'Für jede Person entsteht ein eigener Eintrag')}${assumption('Der Vorarbeiter kann hier nur die Kolonne seiner heutigen Baustelle buchen. Diese Reichweite ist noch nicht endgültig beschlossen.')}<section class="card card-pad"><form data-form="crew-action"><fieldset><legend>Mitarbeiter auswählen</legend><div class="check-list">${crew.map(function (item) { return `<label><input type="checkbox" name="employee" value="${item.id}"><span><strong>${esc(item.name)}</strong><small>${statusText[item.status]}</small></span></label>`; }).join('')}</div></fieldset><label>Aktion<select name="event"><option value="WORK_START">Arbeit starten</option><option value="BREAK_START">Pause starten</option><option value="BREAK_END">Pause beenden</option><option value="WORK_END">Feierabend</option></select></label><button class="primary full-button">Für ausgewählte Mitarbeiter buchen</button></form></section><section class="section"><h2>Letzte Kolonnenbuchungen</h2><div class="list">${bookings.map(function (item) { return `<article class="audit-box"><strong>${esc(employeeName(item.employeeId))}: ${esc(eventText[item.type])}</strong><small>${item.time} · Bau-Nr. ${item.site} · gebucht durch ${esc(foreman.name)}</small></article>`; }).join('') || '<div class="empty-note">Noch keine Kolonnenbuchung in dieser Sitzung.</div>'}</div></section>`;
}

function employeeActions(employee) {
  if (employee.status === 'NOT_STARTED' || employee.status === 'FINISHED') return '<button class="primary employee-main-action" data-action="employee-event" data-event="WORK_START">ARBEIT STARTEN</button>';
  if (employee.status === 'ON_BREAK') return '<button class="primary employee-main-action" data-action="employee-event" data-event="BREAK_END">PAUSE BEENDEN</button>';
  if (employee.status === 'TRAVELING') return '<button class="primary employee-main-action" data-action="employee-event" data-event="TRAVEL_END">FAHRT BEENDEN / ARBEIT FORTSETZEN</button>';
  if (employee.status === 'WORKING') return '<button class="primary employee-main-action" data-action="employee-event" data-event="BREAK_START">PAUSE STARTEN</button><div class="employee-secondary-actions"><button class="secondary" data-action="switch-site">Baustelle wechseln</button><button class="secondary" data-action="employee-event" data-event="WORK_END">Feierabend</button></div>';
  return '<button class="primary employee-main-action" data-action="open-employee-action" data-kind="correction">KORREKTUR MELDEN</button>';
}
function renderEmployee() {
  const employee = person(profile().employeeId);
  const planned = assignment(employee.id);
  const currentSite = site(employee.site || (planned && planned.site));
  const items = eventsFor(employee.id).slice().reverse();
  const ownWeek = db.weeklySheets.find(function (sheet) { return sheet.employeeId === employee.id; });
  const ownExtras = db.extras.filter(function (extra) { return extra.employeeId === employee.id; }).slice(0, 3);
  return `${head(greeting(employee.name.split(' ')[0]), DEMO_DATE)}<section class="card employee-project"><span class="build-number">Bau-Nr. ${currentSite ? currentSite.number : '–'}</span><h2>${esc(currentSite ? currentSite.name : 'Heute nicht eingeplant')}</h2><p>${esc(currentSite ? currentSite.address : 'Bitte im Betrieb nachfragen.')}</p><div class="employee-status"><small>Dein Status</small><strong>${statusText[employee.status]}</strong></div>${employeeActions(employee)}</section><section class="section card card-pad"><div class="section-title"><h2>Heute</h2><span class="meta">${items.length} Ereignisse</span></div><ol class="timeline">${items.length ? items.map(function (event) { return `<li><time>${event.time}</time><span><strong>${esc(eventText[event.type] || event.type)}</strong><small>${event.site ? 'Bau-Nr. ' + event.site : ''}${event.createdBy !== event.createdFor ? ' · gebucht durch ' + esc(employeeName(event.createdBy)) : ''}</small></span></li>`; }).join('') : `<li><time>–</time><span><strong>Noch nicht gestartet</strong><small>${planned ? 'Geplant: Bau-Nr. ' + planned.site : 'Nicht eingeplant'}</small></span></li>`}</ol></section><section class="section"><h2>Weitere Aktionen</h2><div class="employee-actions"><button class="employee-action" data-action="open-employee-action" data-kind="extra">Zusatzarbeit</button><button class="employee-action" data-action="open-employee-action" data-kind="note">Notiz / Foto</button><button class="employee-action" data-action="open-employee-action" data-kind="correction">Korrektur melden</button><button class="employee-action" data-action="open-employee-action" data-kind="feedback">Feedback</button></div></section>${ownWeek ? `<section class="section"><h2>Mein Wochenzettel</h2>${weekCard(ownWeek)}</section>` : ''}${ownExtras.length ? `<section class="section"><h2>Meine Zusatzarbeiten</h2><div class="list">${ownExtras.map(extraCard).join('')}</div></section>` : ''}`;
}

function renderMore() {
  return `${head('Mehr', 'Rollenwechsel, Demo-Steuerung und seltene Bereiche')}<section class="card card-pad"><h2>Demo-Perspektive wechseln</h2><p>Dieselben synthetischen Vorgänge aus vier Rollen prüfen.</p><div class="role-grid">${Object.keys(profiles).map(function (key) { const p = profiles[key]; return `<button class="role-card ${ui.role === key ? 'active' : ''}" data-action="switch-role" data-role="${key}"><span class="avatar">${p.initial}</span><span><strong>${esc(p.name)}</strong><small>${esc(p.label)}</small></span></button>`; }).join('')}</div></section><div class="more-grid section"><section class="card more-card"><h2>Anmeldung</h2><p>Vorschau der späteren Anmeldung.</p><button class="secondary" data-action="show-login">Anmeldeseite ansehen</button></section><section class="card more-card"><h2>Demo zurücksetzen</h2><p>Alle erfundenen Ausgangsdaten wiederherstellen.</p><button class="danger-button" data-action="reset-demo">Demo-Daten zurücksetzen</button></section>${isOfficeRole() ? '<section class="card more-card"><h2>Exporte</h2><p>PDF und Excel-kompatible Beispieldateien.</p><button class="secondary" data-action="navigate" data-view="exports">Exporte öffnen</button></section>' : ''}<section class="card more-card"><h2>Späterer Ausbau</h2><p>Material, Urlaub, Aufmaß, OCR und KI bleiben bewusst für Punkt 7 zurückgestellt.</p><button class="secondary" disabled>Noch nicht Teil dieses Ausbaus</button></section></div><details class="developer-area"><summary>Entwickler- und Testinformationen</summary><p>Statische Demo ohne Backend und echte serverseitige Rechte. Änderungen bleiben lokal in diesem Browser, bis die Demo zurückgesetzt wird.</p><p>Demo-Version 6 · vollständig synthetisch.</p></details>`;
}

function renderOverlays() {
  return (ui.toast ? `<div class="toast" role="status">${esc(ui.toast)}</div>` : '') + renderActionModal() + renderSwitchModal() + renderDecisionModal() + renderWeekCorrectionModal() + renderExtraConfirmModal() + renderExtraEditModal() + renderLogin();
}
function renderActionModal() {
  if (!ui.employeeAction) return '';
  const kind = ui.employeeAction;
  const employee = person(profile().employeeId || 'M-0001');
  const currentSite = employee.site || (assignment(employee.id) || {}).site || '26-101';
  const titles = { extra: 'Zusatzarbeit melden', note: 'Notiz oder synthetisches Foto', correction: 'Korrektur melden', feedback: 'Feedback / Fehler melden' };
  let fields = '';
  const siteOptions = db.sites.map(function (item) { return `<option value="${item.number}" ${item.number === currentSite ? 'selected' : ''}>${item.number} · ${esc(item.name)}</option>`; }).join('');
  if (kind === 'extra') fields = `<button class="scenario-button" type="button" data-action="load-extra-scenario">Beispielszenario 26-104 laden</button><label>Bau-Nr.<select name="site">${siteOptions}</select></label><label>Beschreibung<textarea name="description" required placeholder="Was wurde zusätzlich gemacht?"></textarea></label><div class="form-grid"><label>Menge – optional<input name="quantity" placeholder="18"></label><label>Einheit – optional<input name="unit" placeholder="m²"></label><label>Zeitaufwand – optional<input name="minutes" inputmode="numeric" placeholder="Minuten als Rohangabe"></label><label>Name des Bestätigenden – optional<input name="confirmerName" placeholder="z. B. Robin Muster"></label><label>Funktion – optional<input name="confirmerRole" placeholder="Bauleitung / Auftraggeber"></label></div><label class="checkbox-line"><input type="checkbox" name="photo"><span>Synthetisches Beispielbild hinzufügen</span></label><label class="checkbox-line"><input type="checkbox" name="confirmAfter"><span>Bestätigung der dokumentierten Zusatzarbeit anschließend aufnehmen</span></label>`;
  if (kind === 'note') fields = `<label>Bau-Nr.<select name="site">${siteOptions}</select></label><label>Kategorie<select name="category"><option>Allgemein</option><option>Fortschritt</option><option>Problem / Schaden</option><option>Kunden-/Bauleiterabsprache</option></select></label><label>Notiz<textarea name="text" required placeholder="Was soll festgehalten werden?"></textarea></label><label class="checkbox-line"><input type="checkbox" name="photo"><span>Synthetisches Beispielbild hinzufügen</span></label>`;
  if (kind === 'correction') fields = `<label>Art<select name="type"><option>Fehlender Arbeitsbeginn</option><option>Fehlendes Arbeitsende</option><option>Falsche Baustelle</option><option>Falsche Pause</option><option>Sonstiges</option></select></label><label>Bau-Nr.<select name="site">${siteOptions}</select></label><label>Gewünschte Angabe<input name="suggestion" required placeholder="z. B. 07:05"></label><label>Beschreibung<textarea name="description" required placeholder="Was ist passiert?"></textarea></label>`;
  if (kind === 'feedback') fields = '<label>Kategorie<select name="category"><option>Technischer Fehler</option><option>Bedienproblem</option><option>Daten stimmen nicht</option><option>Verbesserungsvorschlag</option><option>Funktion fehlt</option><option>Sonstiges</option></select></label><label>Beschreibung<textarea name="description" required placeholder="Was möchtest du melden?"></textarea></label>';
  return `<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card employee-action-card" data-form="employee-action" data-kind="${kind}"><div class="action-modal-head"><div><span class="build-number">Bau-Nr. ${currentSite}</span><h2>${titles[kind]}</h2><p>Nur synthetische Demo-Eingaben verwenden.</p></div><button type="button" class="modal-close" data-action="close-action" aria-label="Schließen">×</button></div><div class="action-form-fields">${fields}</div><button class="primary full-button">Speichern</button><p class="demo-save-note"><strong>Bedienbare Demo</strong><span>Der Eintrag wird lokal gespeichert und erscheint in den verbundenen Ansichten.</span></p></form></div>`;
}
function renderSwitchModal() {
  if (!ui.switchSite) return '';
  const employee = person(profile().employeeId);
  return `<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="site-switch"><div class="action-modal-head"><div><h2>Baustelle wechseln</h2><p>Aktuell: Bau-Nr. ${employee.site}</p></div><button type="button" class="modal-close" data-action="close-switch">×</button></div><label>Nächste Baustelle<select name="site">${db.sites.filter(function (item) { return item.number !== employee.site; }).map(function (item) { return `<option value="${item.number}">${item.number} · ${esc(item.name)}</option>`; }).join('')}</select></label><button class="primary full-button">Baustelle verlassen und Fahrt starten</button><p class="meta">Fahrzeit wird nur als Rohereignis erfasst.</p></form></div>`;
}
function renderDecisionModal() {
  if (!ui.decisionExtra) return '';
  const extra = db.extras.find(function (item) { return item.id === ui.decisionExtra; });
  return `<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="extra-decision" data-id="${extra.id}"><div class="action-modal-head"><div><span class="build-number">Bau-Nr. ${extra.site}</span><h2>Kaufmännisch prüfen</h2><p>${esc(extra.description)}</p></div><button type="button" class="modal-close" data-action="close-decision">×</button></div><label>Demo-Entscheidung<select name="decision"><option value="BILLING">Zur Abrechnung vorgesehen</option><option value="NOT_BILLABLE">Nicht abrechenbar</option><option value="OPEN">Entscheidung offen lassen</option></select></label><label>Begründung<textarea name="reason" required></textarea></label><button class="primary full-button">Mit Verlauf speichern</button><p class="meta">Keine automatische Rechnung und keine rechtsverbindliche Freigabe.</p></form></div>`;
}
function renderWeekCorrectionModal() {
  if (!ui.weekCorrection) return '';
  const sheet = db.weeklySheets.find(function (item) { return item.id === ui.weekCorrection; });
  return `<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="week-correction" data-id="${sheet.id}"><div class="action-modal-head"><div><span class="build-number">${sheet.week} · Version ${sheet.version}</span><h2>Korrektur melden</h2><p>Der bestätigte Stand bleibt unverändert sichtbar.</p></div><button type="button" class="modal-close" data-action="close-week-correction">×</button></div><div class="form-grid"><label>Tag<select name="weekDay">${sheet.days.map(function (day) { return `<option value="${day.day}">${day.day} · ${day.date}</option>`; }).join('')}</select></label><label>Betroffene Buchung<select name="bookingField"><option value="start">Arbeitsbeginn</option><option value="break">Pause</option><option value="end">Arbeitsende</option><option value="site">Baustelle / Bau-Nr.</option><option value="travel">Fahrt als Rohangabe</option></select></label><label class="full">Beschreibung des Fehlers<textarea name="description" required placeholder="Was stimmt nicht?"></textarea></label><label class="full">Gewünschte Korrektur<input name="suggestion" required placeholder="z. B. 07:05"></label></div><button class="primary full-button">Korrekturmeldung senden</button><p class="meta">Die Buchung wird nicht still überschrieben. Büro/Geschäftsführung prüft den Vorgang.</p></form></div>`;
}
function renderExtraConfirmModal() {
  if (!ui.confirmExtra) return '';
  const extra = db.extras.find(function (item) { return item.id === ui.confirmExtra; });
  return `<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="extra-confirm-details" data-id="${extra.id}"><div class="action-modal-head"><div><span class="build-number">Bau-Nr. ${extra.site}</span><h2>Bestätigung der dokumentierten Zusatzarbeit</h2><p>Bitte Inhalt vor dem Zeichnen gemeinsam prüfen.</p></div><button type="button" class="modal-close" data-action="close-extra-confirm">×</button></div><div class="frozen-preview"><dl class="facts"><dt>Baustelle</dt><dd>${esc(siteName(extra.site))}</dd><dt>Beschreibung</dt><dd>${esc(extra.description)}</dd><dt>Menge</dt><dd>${esc(extra.quantity + ' ' + extra.unit)}</dd><dt>Zeitaufwand</dt><dd>${esc(extra.minutes ? extra.minutes + ' Min. (roh)' : 'nicht angegeben')}</dd></dl></div><div class="form-grid"><label>Name des Bestätigenden<input name="confirmerName" required value="${esc(extra.pendingConfirmerName || '')}" placeholder="synthetischer Name"></label><label>Funktion<input name="confirmerRole" required value="${esc(extra.pendingConfirmerRole || '')}" placeholder="Bauleitung / Auftraggeber"></label></div><button class="primary full-button">Zum Unterschriftsfeld</button><p class="legal-note">Dokumentation bestätigt bedeutet weder rechtsverbindliche Beauftragung noch Abnahme oder Rechnungsfreigabe.</p></form></div>`;
}
function renderExtraEditModal() {
  if (!ui.editExtra) return '';
  const extra = db.extras.find(function (item) { return item.id === ui.editExtra; });
  return `<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="extra-edit" data-id="${extra.id}"><div class="action-modal-head"><div><span class="build-number">Bau-Nr. ${extra.site}</span><h2>Zusatzarbeit ändern</h2><p>Bestehende Bestätigungen bleiben an ihrem eingefrorenen Inhalt.</p></div><button type="button" class="modal-close" data-action="close-extra-edit">×</button></div><label>Beschreibung<textarea name="description" required>${esc(extra.description)}</textarea></label><div class="form-grid"><label>Menge<input name="quantity" value="${esc(extra.quantity)}"></label><label>Einheit<input name="unit" value="${esc(extra.unit)}"></label></div><button class="primary full-button">Als neuen Dokumentstand speichern</button><p class="meta">Eine alte Bestätigung wird nicht auf den geänderten Inhalt übertragen.</p></form></div>`;
}
function renderLogin() {
  if (!ui.login) return '';
  return `<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="demo-login"><div class="login-brand">${logo('large')}<p>Digitale Baustellenorganisation</p><span class="powered">powered by ShoreLogic</span></div><div class="test-strip">TESTSYSTEM – KEINE PRODUKTIVDATEN</div><label>Demo-Konto<select name="role">${Object.keys(profiles).map(function (key) { return `<option value="${key}">${esc(profiles[key].name)} · ${esc(profiles[key].label)}</option>`; }).join('')}</select></label><label>Passwort<input type="password" value="beispiel"></label><label class="checkbox-line"><input type="checkbox"><span>Dieses Gerät wird von mehreren Mitarbeitern genutzt</span></label><details class="info-note"><summary>Was bedeutet das?</summary><p>Die echte App soll auf gemeinsam genutzten Geräten schneller sperren.</p></details><div class="login-actions"><button class="primary">Demo öffnen</button><button class="secondary" type="button" data-action="hide-login">Schließen</button></div><p class="meta">Keine echte Anmeldung. Keine echten Zugangsdaten eingeben.</p></form></div>`;
}

function audit(type, entity, title, before, after, reason) {
  db.audit.unshift({ id: makeId('A'), type: type, entity: entity, title: title, before: before, after: after, actor: actor(), time: timeNow(), reason: reason });
}
function applyStatus(employee, type, target) {
  if (['WORK_START', 'BREAK_END', 'TRAVEL_END', 'WORK_RESUME'].includes(type)) { employee.status = 'WORKING'; employee.since = timeNow(); if (target) employee.site = target; }
  if (type === 'BREAK_START') { employee.status = 'ON_BREAK'; employee.since = timeNow(); }
  if (type === 'TRAVEL_START') { employee.status = 'TRAVELING'; employee.since = timeNow(); employee.travelTarget = target; }
  if (type === 'WORK_END') { employee.status = 'FINISHED'; employee.since = timeNow(); }
}
function addEvent(employeeId, type, options) {
  const employee = person(employeeId);
  const opts = options || {};
  const target = opts.site || employee.site;
  db.events.push({ id: makeId('E'), employeeId: employeeId, type: type, time: timeNow(), site: target, fromSite: opts.fromSite || null, createdBy: opts.createdBy || employeeId, createdFor: employeeId, note: opts.note || '' });
  applyStatus(employee, type, target);
}
function toast(message) {
  if (toastTimer) clearTimeout(toastTimer);
  ui.toast = message;
  render();
  toastTimer = setTimeout(function () {
    if (ui.toast !== message) return;
    ui.toast = '';
    const element = document.querySelector('.toast');
    if (element) element.remove();
    toastTimer = null;
  }, 2400);
}
function navigate(view) { ui.view = view; ui.query = ''; window.scrollTo(0, 0); render(); }
function render() { app.innerHTML = renderShell(); }

function csvCell(value) { return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"'; }
function download(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}
function downloadCsv(filename, rows) { download(filename, new Blob(['\uFEFF' + rows.map(function (row) { return row.map(csvCell).join(';'); }).join('\r\n')], { type: 'text/csv;charset=utf-8' })); }
function pdfSafe(value) { return String(value).replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss').replace(/[^\x20-\x7E]/g, '-').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'); }
function pdfBlob(lines) {
  const commands = ['BT', '/F1 11 Tf', '48 790 Td'];
  lines.slice(0, 42).forEach(function (line, i) { if (i) commands.push('0 -17 Td'); commands.push('(' + pdfSafe(line) + ') Tj'); });
  commands.push('ET');
  const stream = commands.join('\n');
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream'];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach(function (object, i) { offsets.push(new TextEncoder().encode(pdf).length); pdf += (i + 1) + ' 0 obj\n' + object + '\nendobj\n'; });
  const xref = new TextEncoder().encode(pdf).length;
  pdf += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
  offsets.slice(1).forEach(function (offset) { pdf += String(offset).padStart(10, '0') + ' 00000 n \n'; });
  pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
  return new Blob([pdf], { type: 'application/pdf' });
}
function downloadWeek(id) {
  const sheet = db.weeklySheets.find(function (item) { return item.id === id; });
  const lines = ['Maler Meyer - TESTSYSTEM / KEINE PRODUKTIVDATEN', 'Wochenzettel ' + sheet.week + ' - ' + employeeName(sheet.employeeId), 'Version ' + sheet.version + ' - ' + weekText[sheet.status], ''];
  sheet.days.forEach(function (day) { lines.push(day.day + ' ' + day.date + ' | Bau-Nr. ' + day.site + ' | Beginn ' + day.start + ' | Pause ' + day.break + ' | Ende ' + day.end + ' | Fahrt ' + day.travel + (day.issue ? ' | PRUEFBEDARF ' + day.issue : '')); });
  lines.push('', 'Fahrzeiten sind Rohangaben. Keine Lohn- oder Ueberstundenberechnung.', 'Alle Daten sind synthetisch.');
  download('Demo-Wochenzettel-' + sheet.employeeId + '.pdf', pdfBlob(lines));
}
function exportTimes() {
  const rows = [['Demo-Datum', 'Mitarbeiter-ID', 'Mitarbeiter', 'Bau-Nr.', 'Ereignis', 'Uhrzeit', 'Gebucht durch', 'Hinweis']];
  db.events.forEach(function (item) { rows.push([DEMO_DATE, item.employeeId, employeeName(item.employeeId), item.site || '', item.type, item.time, employeeName(item.createdBy), item.note || '']); });
  downloadCsv('maler-meyer-demo-zeitereignisse.csv', rows);
}
function exportCalculation() {
  const rows = [['Bau-Nr.', 'Baustelle', 'Ist-Ereignisse', 'Fahrzeit-Ereignisse', 'Zusatzarbeiten offen', 'Hinweis']];
  db.sites.forEach(function (item) { const entries = db.events.filter(function (event) { return event.site === item.number; }); rows.push([item.number, item.name, entries.length, entries.filter(function (event) { return ['TRAVEL_START', 'TRAVEL_END'].includes(event.type); }).length, openExtras().filter(function (extra) { return extra.site === item.number; }).length, 'Keine Lohn- oder Kostenbewertung']); });
  downloadCsv('maler-meyer-demo-nachkalkulation.csv', rows);
}
function exportPlanning() {
  const rows = [['Demo-Datum', 'Mitarbeiter', 'Funktion', 'Bau-Nr.', 'Baustelle', 'Hinweis']];
  db.employees.forEach(function (employee) { const plan = assignment(employee.id); rows.push([DEMO_DATE, employee.name, employee.job, plan ? plan.site : '', plan ? siteName(plan.site) : 'Nicht eingeplant', plan ? plan.note : '']); });
  downloadCsv('maler-meyer-demo-tagesplanung.csv', rows);
}

function renderMoreV6() {
  const roleButtons = Object.keys(profiles).map(function (key) {
    const item = profiles[key];
    return '<button class="role-card ' + (ui.role === key ? 'active' : '') + '" data-action="switch-role" data-role="' + key + '"><span class="avatar">' + item.initial + '</span><span><strong>' + esc(item.name) + '</strong><small>' + esc(item.label) + '</small></span></button>';
  }).join('');
  const operations = isOfficeRole() ? '<section class="card card-pad section"><h2>Weitere Bereiche</h2><div class="quick-grid"><button class="secondary" data-action="navigate" data-view="planning">Tagesplanung</button><button class="secondary" data-action="navigate" data-view="sites">Baustellen</button><button class="secondary" data-action="navigate" data-view="employees">Mitarbeiter</button><button class="secondary" data-action="navigate" data-view="times">Zeiten prüfen</button><button class="secondary" data-action="navigate" data-view="extras">Zusatzarbeiten</button><button class="secondary" data-action="navigate" data-view="weeks">Wochenzettel</button><button class="secondary" data-action="navigate" data-view="notifications">Benachrichtigungen</button><button class="secondary" data-action="navigate" data-view="exports">Exporte</button></div></section>' : '';
  return head('Mehr', 'Rollenwechsel, Demo-Steuerung und seltene Bereiche') +
    '<section class="card card-pad"><h2>Demo-Perspektive wechseln</h2><p>Dieselben synthetischen Vorgänge aus vier Rollen prüfen.</p><div class="role-grid">' + roleButtons + '</div></section>' +
    operations +
    '<div class="more-grid section"><section class="card more-card"><h2>Anmeldung</h2><p>Vorschau der späteren Anmeldung.</p><button class="secondary" data-action="show-login">Anmeldeseite ansehen</button></section><section class="card more-card"><h2>Demo zurücksetzen</h2><p>Alle erfundenen Ausgangsdaten wiederherstellen.</p><button class="danger-button" data-action="reset-demo">Demo-Daten zurücksetzen</button></section><section class="card more-card"><h2>Benachrichtigungen</h2><p>Hinweise öffnen direkt die passende Wochenübersicht.</p><button class="secondary" data-action="navigate" data-view="notifications">Hinweise öffnen</button></section><section class="card more-card"><h2>Dokumente & Exporte</h2><p>Originalnahe Formulare, Wochenplanung und Nachkalkulationsdateien.</p><button class="primary" data-action="navigate" data-view="exports">Bereich öffnen</button></section></div>' +
    '<details class="developer-area"><summary>Entwickler- und Testinformationen</summary><p>Statische Demo ohne Backend und echte serverseitige Rechte. Änderungen, Snapshots und gezeichnete Demo-Unterschriften bleiben nur lokal in diesem Browser.</p><p>Browser-Benachrichtigungen funktionieren nur nach Erlaubnis und nur solange die statische Seite aktiv ist. Geschlossene-App-Push benötigt später Backend, Push-Service, Service Worker und Benutzer-/Gerätezuordnung.</p><p>Demo-Version 8 · vollständig synthetisch.</p></details>';
}

app.addEventListener('input', function (event) {
  if (event.target.id !== 'global-search') return;
  ui.query = event.target.value;
  render();
  const input = document.getElementById('global-search');
  if (input) { input.focus(); input.setSelectionRange(ui.query.length, ui.query.length); }
});

app.addEventListener('submit', async function (event) {
  const form = event.target.closest('form');
  if (!form) return;
  event.preventDefault();
  const values = new FormData(form);

  if (window.MMExports.handleSubmit(form, values, db, { save: saveDb, toast: toast })) return;

  if (form.dataset.form === 'demo-login') {
    ui.role = values.get('role'); ui.login = false; navigate('today'); toast('Demo als ' + profiles[ui.role].label + ' geöffnet.'); return;
  }
  if (form.dataset.form === 'planning-change') {
    const employee = person(form.dataset.employee);
    const current = assignment(employee.id);
    const oldSite = current ? current.site : null;
    const newSite = values.get('site') || null;
    if (current) Object.assign(current, { originalSite: oldSite, site: newSite, changedBy: actor(), changedAt: timeNow(), note: values.get('reason') });
    else db.assignments.push({ employeeId: employee.id, site: newSite, originalSite: oldSite, changedBy: actor(), changedAt: timeNow(), note: values.get('reason') });
    if (['NOT_STARTED', 'NOT_PLANNED'].includes(employee.status)) { employee.site = newSite; employee.plannedSite = newSite; employee.status = newSite ? 'NOT_STARTED' : 'NOT_PLANNED'; }
    audit('PLAN_CHANGED', employee.id, 'Tagesplanung geändert', oldSite || 'Nicht eingeplant', newSite || 'Nicht eingeplant', values.get('reason'));
    saveDb(); toast('Tageszuordnung geändert und protokolliert.'); return;
  }
  if (form.dataset.form === 'time-correction') {
    saveTimeCorrection(form);
    return;
  }
  if (form.dataset.form === 'week-correction') {
    const sheet = db.weeklySheets.find(function (item) { return item.id === form.dataset.id; });
    const day = sheet.days.find(function (item) { return item.day === values.get('weekDay'); });
    const field = values.get('bookingField');
    const request = {
      id: makeId('KR'), employeeId: sheet.employeeId, date: day.date, site: day.site, type: 'Wochenzettel-Korrektur',
      description: values.get('description'), original: day[field] || 'keine Angabe', suggestion: values.get('suggestion'),
      status: 'OPEN', createdAt: timeNow(), sheetId: sheet.id, sheetVersion: sheet.version, weekDay: day.day,
      bookingField: field, sourceSnapshotId: sheet.confirmedSnapshotId || null
    };
    db.correctionRequests.unshift(request);
    if (['EMPLOYEE_CONFIRMED', 'ADMIN_APPROVED'].includes(sheet.status)) sheet.status = 'CORRECTION_REQUESTED';
    else sheet.status = 'NEEDS_CORRECTION';
    sheet.history.push(profile().name + ' hat für Version ' + sheet.version + ' eine Korrektur angefordert');
    audit('WEEK_CORRECTION_REQUESTED', sheet.id, 'Korrektur zum Wochenzettel angefordert', request.original, request.suggestion, request.description);
    ui.weekCorrection = null;
    saveDb();
    toast('Korrekturmeldung gesendet; bestätigter Stand bleibt unverändert.');
    return;
  }
  if (form.dataset.form === 'extra-confirm-details') {
    const extra = db.extras.find(function (item) { return item.id === form.dataset.id; });
    const result = await window.MobileSignature.open({ title: 'Bestätigung der dokumentierten Zusatzarbeit', description: 'Der bestätigte Inhalt wird anschließend als eigener Demo-Snapshot eingefroren.' });
    if (!result) return;
    const content = extraContent(extra);
    const confirmation = {
      id: 'ECS-' + demoHash(content).replace('DEMO-', '') + '-' + Date.now().toString(36), extraId: extra.id,
      site: extra.site, project: siteName(extra.site), content: clone(content), contentHash: demoHash(content),
      confirmerName: values.get('confirmerName'), confirmerRole: values.get('confirmerRole'), confirmedAt: dateTimeNow(),
      signatureDataUrl: result.signatureDataUrl || null, status: 'DOCUMENTATION_CONFIRMED'
    };
    db.extraConfirmations.push(confirmation);
    extra.confirmation = 'Dokumentierte Bestätigung vorhanden · ' + confirmation.confirmerName + ', ' + confirmation.confirmerRole;
    extra.docStatus = 'COMPLETE';
    extra.history.push(confirmation.confirmedAt + ' · Dokumentation bestätigt · ' + confirmation.contentHash);
    delete extra.pendingConfirmerName;
    delete extra.pendingConfirmerRole;
    audit('EXTRA_CONFIRMATION_SAVED', extra.id, 'Zusatzarbeit dokumentiert bestätigt', 'Bestätigung offen', confirmation.contentHash, 'Getrennter unveränderbarer Bestätigungsdatensatz');
    ui.confirmExtra = null;
    saveDb();
    toast('Bestätigung als eingefrorener Dokumentstand gespeichert.');
    return;
  }
  if (form.dataset.form === 'extra-edit') {
    const extra = db.extras.find(function (item) { return item.id === form.dataset.id; });
    const before = extraContent(extra);
    extra.description = values.get('description');
    extra.quantity = values.get('quantity') || '–';
    extra.unit = values.get('unit') || '';
    extra.confirmation = extraConfirmations(extra).length ? 'Inhalt geändert · neue Bestätigung erforderlich' : 'Noch keine Bestätigung';
    extra.history.push(timeNow() + ' · Inhalt geändert; vorhandene Bestätigung bleibt am früheren Snapshot');
    audit('EXTRA_CONTENT_CHANGED', extra.id, 'Bestätigte Zusatzarbeit geändert', demoHash(before), demoHash(extraContent(extra)), 'Neue Bestätigung erforderlich');
    ui.editExtra = null;
    saveDb();
    toast('Neuer Dokumentstand gespeichert; alte Bestätigung nicht übertragen.');
    return;
  }
  if (form.dataset.form === 'crew-action') {
    const selected = values.getAll('employee');
    if (!selected.length) { toast('Bitte mindestens einen Mitarbeiter auswählen.'); return; }
    const foreman = person(profile().employeeId);
    selected.forEach(function (id) { addEvent(id, values.get('event'), { site: foreman.site, createdBy: foreman.id, note: 'Kolonnenbuchung durch Vorarbeiter' }); });
    audit('CREW_EVENT', foreman.id, 'Kolonnenbuchung', selected.length + ' Personen', eventText[values.get('event')], 'Je Person ein eigener Ereigniseintrag');
    saveDb(); toast(selected.length + ' einzelne Buchungen gespeichert.'); return;
  }
  if (form.dataset.form === 'site-switch') {
    const employee = person(profile().employeeId);
    const from = employee.site;
    const target = values.get('site');
    addEvent(employee.id, 'SITE_LEAVE', { site: from });
    addEvent(employee.id, 'TRAVEL_START', { site: target, fromSite: from, note: 'Fahrt wird nur als Rohereignis erfasst.' });
    ui.switchSite = false; saveDb(); toast('Fahrt zu Bau-Nr. ' + target + ' gestartet.'); return;
  }
  if (form.dataset.form === 'extra-decision') {
    const extra = db.extras.find(function (item) { return item.id === form.dataset.id; });
    const before = extraCommercial(extra);
    extra.commercialStatus = values.get('decision');
    extra.decisionReason = values.get('reason');
    extra.history.push(timeNow() + ' · ' + extraCommercial(extra) + ' durch ' + actor() + ' · ' + extra.decisionReason);
    audit('EXTRA_DECIDED', extra.id, 'Zusatzarbeit kaufmännisch geprüft', before, extraCommercial(extra), extra.decisionReason);
    ui.decisionExtra = null; saveDb(); toast('Entscheidung gespeichert; Vorgang bleibt erhalten.'); return;
  }
  if (form.dataset.form === 'employee-action') {
    const employee = person(profile().employeeId || 'M-0001');
    const kind = form.dataset.kind;
    if (kind === 'extra') {
      const id = makeId('ZA');
      const extra = { id: id, site: values.get('site'), employeeId: employee.id, reportedAt: 'Heute · ' + timeNow(), description: values.get('description'), quantity: values.get('quantity') || '–', unit: values.get('unit') || '', minutes: values.get('minutes') || '', photo: values.get('photo') ? 'Synthetisches Bild zur neuen Zusatzarbeit' : null, confirmation: 'Noch keine Bestätigung', docStatus: 'REPORTED', commercialStatus: 'OPEN', decisionReason: '', pendingConfirmerName: values.get('confirmerName') || '', pendingConfirmerRole: values.get('confirmerRole') || '', history: [timeNow() + ' · von ' + employee.name + ' gemeldet'] };
      db.extras.unshift(extra);
      audit('EXTRA_REPORTED', id, 'Zusatzarbeit gemeldet', '–', values.get('description'), 'Mitarbeiteransicht');
      ui.employeeAction = null;
      if (values.get('confirmAfter')) ui.confirmExtra = id;
      saveDb();
      if (ui.confirmExtra) { render(); return; }
      toast('Zusatzarbeit in allen Ansichten ergänzt.'); return;
    }
    if (kind === 'note') {
      db.notes.unshift({ id: makeId('N'), site: values.get('site'), author: employee.name, time: timeNow(), category: values.get('category'), text: values.get('text'), photo: values.get('photo') ? 'Synthetisches Bild zur neuen Notiz' : null });
      ui.employeeAction = null; saveDb(); toast('Notiz der Baustellenmappe zugeordnet.'); return;
    }
    if (kind === 'correction') {
      db.correctionRequests.unshift({ id: makeId('KR'), employeeId: employee.id, date: '10.09.', site: values.get('site'), type: values.get('type'), description: values.get('description'), original: 'Ursprüngliche Ereignisfolge bleibt unverändert', suggestion: values.get('suggestion'), status: 'OPEN', createdAt: timeNow() });
      ui.employeeAction = null; saveDb(); toast('Korrekturmeldung an Büro und Geschäftsführung gesendet.'); return;
    }
    if (kind === 'feedback') { ui.employeeAction = null; toast('Feedback gespeichert · Fallnummer DEMO-' + String(Date.now()).slice(-5)); return; }
  }
});

app.addEventListener('click', async function (event) {
  const target = event.target.closest('[data-action],[data-mm-action]');
  if (!target) return;
  event.preventDefault();
  const action = target.dataset.action;
  if (target.dataset.mmAction && window.MMExports.handleAction(target, db, { save: saveDb, toast: toast })) return;
  if (action === 'submit-correction') {
    saveTimeCorrection(target.closest('form'));
    return;
  }
  if (action === 'navigate') return navigate(target.dataset.view);
  if (action === 'planning-week') { ui.planningWeek = Number(target.dataset.week); return render(); }
  if (action === 'filter-status') { ui.employeeFilter = target.dataset.status; return navigate('employees'); }
  if (action === 'employee-filter') { ui.employeeFilter = target.dataset.status; return render(); }
  if (action === 'open-site') { ui.selectedSite = target.dataset.id; ui.view = 'sites'; ui.query = ''; render(); return setTimeout(function () { const detail = document.querySelector('.folder-detail'); if (detail) detail.scrollIntoView({ block: 'start' }); }, 0); }
  if (action === 'close-site') { ui.selectedSite = null; return render(); }
  if (action === 'open-employee') { ui.selectedEmployee = ui.selectedEmployee === target.dataset.id ? null : target.dataset.id; ui.view = 'employees'; ui.query = ''; return render(); }
  if (action === 'open-correction') { ui.editCorrection = target.dataset.id; ui.view = 'times'; return render(); }
  if (action === 'close-correction') { ui.editCorrection = null; return render(); }
  if (action === 'open-extra') { ui.view = 'extras'; render(); return setTimeout(function () { const card = document.getElementById('extra-' + target.dataset.id); if (card) card.scrollIntoView({ block: 'center' }); }, 0); }
  if (action === 'complete-extra') {
    const extra = db.extras.find(function (item) { return item.id === target.dataset.id; });
    extra.docStatus = 'COMPLETE'; extra.history.push(timeNow() + ' · Dokumentation vollständig durch ' + actor());
    audit('EXTRA_DOCUMENTED', extra.id, 'Dokumentation vervollständigt', 'Offen', 'Vollständig', 'Demo-Prüfung');
    saveDb(); return toast('Dokumentation als vollständig markiert.');
  }
  if (action === 'decide-extra') { ui.decisionExtra = target.dataset.id; return render(); }
  if (action === 'close-decision') { ui.decisionExtra = null; return render(); }
  if (action === 'confirm-extra') { ui.confirmExtra = target.dataset.id; return render(); }
  if (action === 'close-extra-confirm') { ui.confirmExtra = null; return render(); }
  if (action === 'edit-extra') { ui.editExtra = target.dataset.id; return render(); }
  if (action === 'close-extra-edit') { ui.editExtra = null; return render(); }
  if (action === 'print-extra-confirmation') { window.MMExports.openPrint(db, 'extra-confirmation', { confirmationId: target.dataset.id }); return toast('Bestätigungsdatensatz in der Druckansicht geöffnet.'); }
  if (action === 'load-extra-scenario') {
    const form = target.closest('form');
    form.querySelector('[name="site"]').value = '26-104';
    form.querySelector('[name="description"]').value = 'Nordwand im Besprechungsraum zusätzlich spachteln und streichen.';
    form.querySelector('[name="quantity"]').value = '18';
    form.querySelector('[name="unit"]').value = 'm²';
    form.querySelector('[name="confirmerName"]').value = 'Robin Muster';
    form.querySelector('[name="confirmerRole"]').value = 'Bauleitung (synthetisch)';
    return;
  }
  if (action === 'open-week') { ui.selectedWeek = ui.selectedWeek === target.dataset.id ? null : target.dataset.id; return render(); }
  if (action === 'week-correction') { ui.weekCorrection = target.dataset.id; return render(); }
  if (action === 'close-week-correction') { ui.weekCorrection = null; return render(); }
  if (action === 'confirm-week') {
    const sheet = db.weeklySheets.find(function (item) { return item.id === target.dataset.id; });
    const result = await window.MobileSignature.open({ title: 'Wochenübersicht ' + sheet.week + ' bestätigen', description: 'Version ' + sheet.version + ' wird mit dem jetzt sichtbaren Inhalt eingefroren.' });
    if (!result) return;
    createWeekSnapshot(sheet, result.signatureDataUrl);
    return;
  }
  if (action === 'approve-week') {
    const sheet = db.weeklySheets.find(function (item) { return item.id === target.dataset.id; });
    const snapshot = weekSnapshot(sheet);
    if (!snapshot) return toast('Zuerst muss eine Mitarbeiterbestätigung vorliegen.');
    sheet.status = 'ADMIN_APPROVED'; sheet.history.push(actor() + ' hat Version ' + sheet.version + ' um ' + timeNow() + ' freigegeben');
    db.weeklyApprovals.push({ id: makeId('WA'), snapshotId: snapshot.id, approvedAt: dateTimeNow(), approvedBy: actor() });
    audit('WEEK_APPROVED', sheet.id, 'Wochenzettel freigegeben', 'Prüfung', 'Freigegeben', 'Demo-Freigabe');
    saveDb(); return toast('Wochenzettel betrieblich freigegeben.');
  }
  if (action === 'print-week-snapshot') { window.MMExports.openPrint(db, 'timesheet-confirmed', { snapshotId: target.dataset.id }); return toast('Eingefrorene Version in der Druckansicht geöffnet.'); }
  if (action === 'open-notification') {
    const item = db.notifications.find(function (notification) { return notification.id === target.dataset.id; });
    item.read = true;
    saveDb();
    if (item.sheetId) { ui.selectedWeek = item.sheetId; return navigate('weeks'); }
    return render();
  }
  if (action === 'test-notification') {
    if (!('Notification' in window)) return toast('Dieser Browser unterstützt die Notification API nicht.');
    let permission = Notification.permission;
    if (permission === 'default') permission = await Notification.requestPermission();
    if (permission !== 'granted') return toast('Browser-Benachrichtigung wurde nicht erlaubt.');
    new Notification('Maler Meyer · Demo', { body: 'Wochenübersicht KW 37 wartet auf deine Bestätigung.', icon: './icon.svg' });
    return toast('Lokale Test-Benachrichtigung angezeigt.');
  }
  if (action === 'switch-role') { ui.role = target.dataset.role; ui.view = 'today'; ui.selectedSite = null; ui.selectedWeek = null; window.scrollTo(0, 0); return render(); }
  if (action === 'show-login') { ui.login = true; return render(); }
  if (action === 'hide-login') { ui.login = false; return render(); }
  if (action === 'reset-demo') { resetDb(); render(); return toast('Synthetische Ausgangsdaten wiederhergestellt.'); }
  if (action === 'open-employee-action') { ui.employeeAction = target.dataset.kind; return render(); }
  if (action === 'close-action') { ui.employeeAction = null; return render(); }
  if (action === 'switch-site') { ui.switchSite = true; return render(); }
  if (action === 'close-switch') { ui.switchSite = false; return render(); }
  if (action === 'employee-event') {
    const employee = person(profile().employeeId);
    const type = target.dataset.event;
    if (type === 'TRAVEL_END') {
      const destination = employee.travelTarget || employee.site;
      addEvent(employee.id, 'TRAVEL_END', { site: destination });
      addEvent(employee.id, 'WORK_RESUME', { site: destination, note: 'Arbeit auf neuer Baustelle fortgesetzt' });
      delete employee.travelTarget;
    } else addEvent(employee.id, type);
    saveDb(); return toast(eventText[type] + ' · ' + timeNow());
  }
  if (action === 'download-times') { exportTimes(); return toast('CSV mit synthetischen Zeitereignissen erstellt.'); }
  if (action === 'download-calculation') { exportCalculation(); return toast('Excel-kompatible CSV erstellt.'); }
  if (action === 'download-planning') { exportPlanning(); return toast('Tagesplanung als CSV erstellt.'); }
  if (action === 'download-week-pdf') { const sheet = db.weeklySheets.find(function (item) { return item.id === target.dataset.id; }); const snapshot = weekSnapshot(sheet); window.MMExports.openPrint(db, snapshot ? 'timesheet-confirmed' : 'timesheet', snapshot ? { snapshotId: snapshot.id } : { site: (sheet.days[0] || {}).site, employeeId: sheet.employeeId, week: Number(String(sheet.week).replace(/\D/g, '')) }); return toast('Originalnahe Druckansicht geöffnet.'); }
  if (action === 'download-selected-week') { const select = document.getElementById('export-week'); if (select) { const sheet = db.weeklySheets.find(function (item) { return item.id === select.value; }); window.MMExports.openPrint(db, 'timesheet', { site: (sheet.days[0] || {}).site, employeeId: sheet.employeeId, week: Number(String(sheet.week).replace(/\D/g, '')) }); } return toast('Originalnahe Druckansicht geöffnet.'); }
});

app.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') { ui.employeeAction = null; ui.switchSite = false; ui.decisionExtra = null; ui.confirmExtra = null; ui.editExtra = null; ui.weekCorrection = null; ui.login = false; render(); }
});

render();

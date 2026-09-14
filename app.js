'use strict';

const DEMO_DATE = 'Donnerstag, 10. September';
const STORAGE_KEY = 'maler-meyer-demo-v11';
const app = document.getElementById('app');

const profiles = {
  management: { name: 'Torben', label: 'Geschäftsführung · Admin', initial: 'T', area: 'management', adminAccess: true },
  management2: { name: 'Steffen', label: 'Geschäftsführung · Admin', initial: 'S', area: 'management', adminAccess: true },
  office: { name: 'Sabine Beispiel', label: 'Büro · Admin', initial: 'S', area: 'office', adminAccess: true },
  office2: { name: 'Tina Demo', label: 'Büro · Admin', initial: 'T', area: 'office', adminAccess: true },
  foreman: { name: 'Jan Testmann', label: 'Vorarbeiter', initial: 'J', area: 'foreman', employeeId: 'M-0003', adminAccess: false },
  employee: { name: 'Max Beispiel', label: 'Mitarbeiter', initial: 'M', area: 'employee', employeeId: 'M-0001', adminAccess: false }
};
const statusText = { WORKING: 'Arbeitet', ON_BREAK: 'Pause', TRAVELING: 'Unterwegs', NOT_STARTED: 'Noch nicht gestartet', NOT_PLANNED: 'Nicht eingeplant', FINISHED: 'Beendet', REVIEW: 'Prüfbedarf' };
const statusKind = { WORKING: 'ok', ON_BREAK: 'warn', TRAVELING: 'travel', NOT_STARTED: 'problem', NOT_PLANNED: '', FINISHED: 'ok', REVIEW: 'problem' };
const eventText = { WORK_START: 'Arbeit gestartet', BREAK_START: 'Pause gestartet', BREAK_END: 'Pause beendet', SITE_LEAVE: 'Baustelle verlassen', TRAVEL_START: 'Fahrt begonnen', TRAVEL_END: 'Fahrt beendet', WORK_RESUME: 'Arbeit fortgesetzt', WORK_END: 'Feierabend', CORRECTION: 'Korrektur ergänzt' };
const weekText = { DRAFT: 'Entwurf · Mitarbeiterbestätigung fehlt', EMPLOYEE_CONFIRMED: 'Vom Mitarbeiter bestätigt', ADMIN_APPROVED: 'Büro/Admin freigegeben', CORRECTION_REQUESTED: 'Korrektur angefordert', NEEDS_RECONFIRM: 'Erneute Bestätigung erforderlich', NEEDS_CORRECTION: 'Unvollständig', NEEDS_REVIEW: 'Erneute Bestätigung erforderlich' };

let db = loadDb();
const ui = { role: 'management', view: 'today', query: '', employeeFilter: 'all', planningWeek: 37, selectedSite: null, selectedEmployee: null, selectedWeek: null, editCorrection: null, decisionExtra: null, confirmExtra: null, editExtra: null, weekCorrection: null, employeeAction: null, documentationTemplate: null, switchSite: false, supportEmployee: null, login: false, toast: '', sharedEmployeeId: null, sharedSelectedEmployee: null, sharedPinFailures: 0, sharedCooldownUntil: 0, sharedUnlocked: false, finalModal: null };
let toastTimer = null;
let sharedLockTimer = null;

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
function resetDb() { db = window.createDemoSeed(); saveDb(); Object.assign(ui, { role: 'management', view: 'today', query: '', employeeFilter: 'all', planningWeek: 37, selectedSite: null, selectedEmployee: null, selectedWeek: null, editCorrection: null, decisionExtra: null, confirmExtra: null, editExtra: null, weekCorrection: null, employeeAction: null, documentationTemplate: null, switchSite: false, supportEmployee: null, sharedEmployeeId: null, sharedSelectedEmployee: null, sharedPinFailures: 0, sharedCooldownUntil: 0, sharedUnlocked: false, finalModal: null }); clearTimeout(sharedLockTimer); }
function esc(value) { return String(value == null ? '' : value).replace(/[&<>'"]/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]; }); }
function timeNow() { return new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' }).format(new Date()); }
function dateTimeNow() { return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date()).replace(',', ' ·') + ' Uhr'; }
function makeId(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6); }
function person(id) { return db.employees.find(function (item) { return item.id === id; }); }
function site(number) { return db.sites.find(function (item) { return item.number === number; }); }
function employeeName(id) { const item = person(id); return item ? item.name : profiles[id] ? profiles[id].name : id; }
function siteName(number) { const item = site(number); return item ? item.name : 'Keine Baustelle'; }
function assignment(employeeId) { return db.assignments.find(function (item) { return item.employeeId === employeeId; }); }
function currentEmployeeId() { return ui.sharedUnlocked && ui.sharedEmployeeId ? ui.sharedEmployeeId : profiles[ui.role].employeeId; }
function profile() {
  const base = profiles[ui.role];
  if (ui.role !== 'employee' || !ui.sharedUnlocked || !ui.sharedEmployeeId) return base;
  const employee = person(ui.sharedEmployeeId);
  return Object.assign({}, base, { name: employee ? employee.name : base.name, employeeId: ui.sharedEmployeeId, label: 'Mitarbeiter · Fahrzeuggerät' });
}
function roleArea() { return profile().area; }
function actor() { return profile().name + ' · ' + profile().label; }
function isOfficeRole() { return profile().adminAccess === true; }
function activeEmployees() { return db.employees.filter(function (item) { return item.active !== false; }); }
function employeeDisplayStatus(employee) { return employee.active === false ? 'Deaktiviert' : statusText[employee.status]; }
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
function materialTypeText(type) { return ({ REQUEST: 'Materialanforderung', WITHDRAWAL: 'Entnahme aus Firma / Lager', USAGE: 'Materialverbrauch' })[type] || type; }
function materialStatusText(status) { return ({ NEW: 'Neu', PROCESSING: 'In Bearbeitung', READY: 'Bereit / erledigt', RECORDED: 'Erfasst', REVIEWED: 'Geprüft' })[status] || status; }
function leaveStatusText(status) { return ({ REQUESTED: 'Beantragt', APPROVED: 'Genehmigt', REJECTED: 'Abgelehnt' })[status] || status; }
function trackDemoChange(type, entityId, label) {
  if (!db.offlineSimulation || !db.offlineSimulation.offline) return 'SYNCED';
  db.offlineSimulation.queue.push({ id: makeId('SYNC'), type: type, entityId: entityId, label: label, createdAt: dateTimeNow(), status: 'PENDING' });
  return 'PENDING';
}
function syncBanner() {
  const state = db.offlineSimulation;
  if (!state) return '';
  const pending = state.queue.filter(function (item) { return item.status === 'PENDING'; }).length;
  return `<section class="sync-banner ${state.offline ? 'offline' : 'online'}"><span><strong>${state.offline ? 'Offline simuliert' : 'Online simuliert'}</strong><small>${state.offline ? pending + ' Änderung' + (pending === 1 ? '' : 'en') + ' wartet auf Synchronisierung' : esc(state.lastSync)}</small></span><button class="${state.offline ? 'primary' : 'secondary'}" data-action="toggle-offline">${state.offline ? 'Online simulieren' : 'Offline simulieren'}</button></section>`;
}
function scheduleSharedLock() {
  clearTimeout(sharedLockTimer);
  if (!ui.sharedUnlocked) return;
  sharedLockTimer = setTimeout(function () { lockSharedDevice('Demo-Autosperre nach 10 Minuten'); }, 10 * 60 * 1000);
}
function lockSharedDevice(reason) {
  if (ui.sharedEmployeeId) audit('SHARED_DEVICE_LOCKED', ui.sharedEmployeeId, 'Fahrzeuggerät gesperrt', employeeName(ui.sharedEmployeeId), 'Gesperrt', reason || 'Benutzerwechsel');
  ui.sharedUnlocked = false; ui.sharedEmployeeId = null; ui.sharedSelectedEmployee = null; ui.role = 'management'; ui.view = 'shared-device'; ui.toast = ''; clearTimeout(sharedLockTimer); if (toastTimer) clearTimeout(toastTimer); saveDb(); render();
}
function greeting(name) { const hour = new Date().getHours(); return (hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend') + ', ' + name; }
function badge(text, kind) { return `<span class="badge ${kind || ''}">${esc(text)}</span>`; }
function logo(size) { return `<span class="meyer-wordmark ${size || ''}" aria-hidden="true"><span>maler</span><span>meyer</span></span>`; }
function assumption(text) { return `<p class="assumption"><strong>Demo-Annahme</strong><span>${esc(text)}</span></p>`; }
function head(title, subtitle) { return `<div class="page-head"><div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><span class="demo-context">Erfundener Beispieltag</span></div>`; }

function navItems() {
  if (roleArea() === 'employee') return [['today', 'H', 'Heute'], ['documentation', 'D', 'Doku'], ['material', 'M', 'Material'], ['weeks', 'W', 'Wochenzettel'], ['more', '···', 'Mehr']];
  if (roleArea() === 'foreman') return [['today', 'H', 'Heute'], ['crew', 'K', 'Kolonne'], ['sites', 'B', 'Baustelle'], ['documentation', 'D', 'Doku'], ['material', 'M', 'Material'], ['more', '···', 'Mehr']];
  return [['today', 'H', 'Heute'], ['planning', 'P', 'Planung'], ['sites', 'B', 'Baustellen'], ['employees', 'M', 'Mitarbeiter'], ['tasks', '✓', 'Prüfen / Büro'], ['more', '···', 'Mehr']];
}
function mobileItems() {
  if (roleArea() === 'employee') return [['today', 'H', 'Heute'], ['documentation', 'D', 'Doku'], ['material', 'M', 'Material'], ['weeks', 'W', 'Woche'], ['more', '···', 'Mehr']];
  if (roleArea() === 'foreman') return navItems();
  return roleArea() === 'office' ? [['today', 'H', 'Heute'], ['tasks', '✓', 'Prüfen'], ['sites', 'B', 'Baustellen'], ['more', '···', 'Mehr']] : [['today', 'H', 'Heute'], ['planning', 'P', 'Planung'], ['sites', 'B', 'Baustellen'], ['more', '···', 'Mehr']];
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
  db.employees.forEach(function (item) { if ((item.name + ' ' + item.id + ' ' + (item.site || '')).toLowerCase().includes(q)) matches.push({ type: 'employee', id: item.id, main: item.name, sub: employeeDisplayStatus(item) + (item.site ? ' · Bau-Nr. ' + item.site : '') }); });
  return `<div class="search-results" role="listbox">${matches.length ? matches.slice(0, 10).map(function (item) { return `<button class="search-result" data-action="open-${item.type}" data-id="${item.id}"><span><strong>${esc(item.main)}</strong></span><span>${esc(item.sub)}</span></button>`; }).join('') : '<div class="empty-note">Kein passender Eintrag.</div>'}</div>`;
}
function renderShell() {
  const p = profile();
  return `<div class="test-strip">TESTSYSTEM – KEINE PRODUKTIVDATEN <span>Alle Personen, Baustellen, Bilder und Vorgänge sind erfunden.</span></div><div class="app-shell"><aside class="sidebar"><a class="brand" href="#" data-action="navigate" data-view="today">${logo()}<small>Digitale Baustellenorganisation</small></a><nav class="side-nav">${navItems().map(navButton).join('')}</nav><div class="sidebar-footer"><strong>${esc(p.name)}</strong><small>${esc(p.label)} · Demo</small><small>powered by ShoreLogic</small></div></aside><div class="main-column"><header class="topbar"><a class="mobile-brand" href="#" data-action="navigate" data-view="today">${logo('compact')}</a>${isOfficeRole() ? `<div class="search-wrap"><span class="search-symbol">⌕</span><label class="sr-only" for="global-search">Bau-Nr., Baustelle oder Mitarbeiter suchen</label><input id="global-search" class="search-box" value="${esc(ui.query)}" placeholder="Bau-Nr., Baustelle oder Mitarbeiter suchen">${searchResults()}</div>` : '<div></div>'}<button class="profile-button" data-action="navigate" data-view="more"><span class="avatar">${p.initial}</span><span class="profile-copy"><strong>${esc(p.name)}</strong><small>${esc(p.label)}</small></span></button></header>${syncBanner()}<main id="main-content" class="content" tabindex="-1">${renderView()}</main></div></div><nav class="mobile-nav">${mobileItems().map(navButton).join('')}</nav>${renderOverlays()}`;
}
function renderView() {
  if (ui.view === 'employee-extra') { ui.employeeAction = 'extra'; ui.view = 'today'; }
  if (ui.view === 'employee-note') { ui.employeeAction = 'note'; ui.view = 'today'; }
  if (roleArea() === 'employee') {
    if (ui.view === 'more') return renderMoreV6();
    if (ui.view === 'weeks') return renderWeeks(true);
    if (ui.view === 'notifications') return renderNotifications();
    if (ui.view === 'documentation') return renderDocumentation();
    if (ui.view === 'material') return renderMaterial();
    if (ui.view === 'leave') return renderLeave();
    if (ui.view === 'feedback') return renderFeedback();
    if (ui.view === 'shared-device') return renderSharedDevice();
    return renderEmployeeV11();
  }
  if (roleArea() === 'foreman') {
    if (ui.view === 'crew') return renderCrew();
    if (ui.view === 'sites') { ui.selectedSite = person(currentEmployeeId()).site; return renderSites(true); }
    if (ui.view === 'more') return renderMoreV6();
    if (ui.view === 'documentation') return renderDocumentation();
    if (ui.view === 'material') return renderMaterial();
    if (ui.view === 'leave') return renderLeave();
    if (ui.view === 'notifications') return renderNotifications();
    if (ui.view === 'feedback') return renderFeedback();
    if (ui.view === 'shared-device') return renderSharedDevice();
    return renderForeman();
  }
  if (ui.view === 'planning') return renderPlanning();
  if (ui.view === 'tasks') return window.MMFinal.renderTaskHub(db, { head: head });
  if (ui.view === 'invoice-list') return window.MMFinal.renderInvoiceList(db, { head: head });
  if (ui.view === 'sites') return renderSites(false);
  if (ui.view === 'employees') return renderEmployees();
  if (ui.view === 'admin') return renderAdmin();
  if (ui.view === 'material') return renderMaterial();
  if (ui.view === 'leave') return renderLeave();
  if (ui.view === 'times') return renderTimes();
  if (ui.view === 'extras') return renderExtras();
  if (ui.view === 'weeks') return renderWeeks();
  if (ui.view === 'notifications') return renderNotifications();
  if (ui.view === 'feedback') return renderFeedback();
  if (ui.view === 'shared-device') return renderSharedDevice();
  if (ui.view === 'exports') return renderExports();
  if (ui.view === 'more') return renderMoreV6();
  return roleArea() === 'office' ? renderOffice() : renderManagementV11();
}
function statusGrid() {
  const counts = activeEmployees().reduce(function (all, item) { all[item.status] = (all[item.status] || 0) + 1; return all; }, {});
  return `<div class="status-grid status-grid-wide">${[['WORKING', 'Arbeiten'], ['ON_BREAK', 'Pause'], ['TRAVELING', 'Unterwegs'], ['NOT_STARTED', 'Noch nicht gestartet'], ['FINISHED', 'Beendet'], ['NOT_PLANNED', 'Nicht eingeplant'], ['REVIEW', 'Prüfbedarf']].map(function (item) { return `<button class="status-card" data-action="filter-status" data-status="${item[0]}"><strong>${counts[item[0]] || 0}</strong><span><i class="status-dot ${statusKind[item[0]] || 'free'}"></i>${item[1]}</span><small>Personen anzeigen</small></button>`; }).join('')}</div>`;
}
function renderManagement() {
  const newCount = db.extras.filter(function (item) { return item.docStatus === 'REPORTED'; }).length;
  const decided = db.extras.filter(function (item) { return item.commercialStatus !== 'OPEN'; }).length;
  return `${head(greeting(profile().name), DEMO_DATE + ' · Dein Betrieb auf einem Bildschirm')}<div class="toolbar admin-shortcut"><span><strong>Adminzugriff aktiv</strong> · Projekte, Mitarbeiter und Büro-Hilfe</span><button class="primary" data-action="navigate" data-view="admin">Verwaltung öffnen</button></div>${statusGrid()}${assumption('Der Beispieltag wird um 08:15 betrachtet. Erst ab diesem fiktiven Prüfzeitpunkt erscheinen fehlende Starts als Hinweis. Eine echte Schwelle ist noch offen.')}<div class="dashboard-grid section"><section class="attention-card"><div class="attention-head"><div><h2>Aufmerksamkeit nötig</h2><p>Nur Vorgänge, bei denen ein Blick sinnvoll ist.</p></div><span class="attention-count">${openCorrections().length + openExtras().length + pendingWeeks().length}</span></div><div class="attention-list"><button class="attention-item" data-action="navigate" data-view="times"><span><strong>${openCorrections().length} Zeitkorrekturen offen</strong><small>Originale bleiben erhalten</small></span><span class="action-word">Prüfen</span></button><button class="attention-item" data-action="navigate" data-view="extras"><span><strong>${openExtras().length} Zusatzarbeiten kaufmännisch offen</strong><small>Dokumentation und Abrechnung getrennt</small></span><span class="action-word">Ansehen</span></button><button class="attention-item" data-action="navigate" data-view="weeks"><span><strong>${pendingWeeks().length} Wochenzettel nicht freigegeben</strong><small>Fehler und erneute Prüfungen zuerst</small></span><span class="action-word">Prüfen</span></button></div></section><section class="card extra-summary"><h2>Zusatzarbeiten</h2><p>Zusätzliche Leistungen früh festhalten.</p><div class="metric-row"><div class="metric"><strong>${newCount}</strong><span>neu</span></div><div class="metric"><strong>${openExtras().length}</strong><span>offen</span></div><div class="metric"><strong>${decided}</strong><span>entschieden</span></div></div><button class="primary light" data-action="navigate" data-view="extras">Zusatzarbeiten öffnen</button></section></div><section class="section"><div class="section-title"><h2>Aktive Baustellen</h2><button data-action="navigate" data-view="sites">Alle Baustellen</button></div><div class="site-mini-grid">${db.sites.filter(function (item) { return item.active !== false; }).map(siteMini).join('')}</div></section>`;
}
function renderManagementV11() {
  const base = renderManagement();
  const quick = `<section class="management-quick"><button class="primary" data-action="navigate" data-view="planning">Planung bearbeiten</button><button class="secondary" data-action="navigate" data-view="admin">Neue Baustelle</button><button class="secondary" data-action="navigate" data-view="admin">Mitarbeiter helfen</button><button class="secondary" data-action="navigate" data-view="times">Offene Zeiten prüfen</button></section>`;
  return base.replace(/<div class="toolbar admin-shortcut">[\s\S]*?<\/div>/, quick);
}
function renderOffice() {
  return `${head(greeting(profile().name), 'Arbeitsvorrat und Betriebsverwaltung · ' + DEMO_DATE)}<div class="work-queue"><button class="queue-card problem-card" data-action="navigate" data-view="times"><strong>${openCorrections().length}</strong><span>Zeitkorrekturen offen</span><small>Original und Änderung bleiben sichtbar</small></button><button class="queue-card" data-action="navigate" data-view="extras"><strong>${openExtras().length}</strong><span>Zusatzarbeiten offen</span><small>kaufmännische Prüfung</small></button><button class="queue-card" data-action="navigate" data-view="weeks"><strong>${pendingWeeks().length}</strong><span>Wochenzettel offen</span><small>prüfen oder freigeben</small></button><button class="queue-card" data-action="navigate" data-view="material"><strong>${db.materialRecords.filter(function (item) { return item.status === 'NEW'; }).length}</strong><span>Materialanforderungen neu</span><small>bearbeiten und prüfen</small></button><button class="queue-card" data-action="navigate" data-view="leave"><strong>${db.leaveRequests.filter(function (item) { return item.status === 'REQUESTED'; }).length}</strong><span>Urlaubsanträge offen</span><small>Demo-Entscheidung</small></button><button class="queue-card" data-action="navigate" data-view="admin"><strong>${activeEmployees().length}</strong><span>Verwaltung & Büro-Hilfe</span><small>Projekte, Mitarbeiter, Anrufer unterstützen</small></button></div><p class="decision-note"><strong>Spätere Projektentscheidung:</strong> Beide Büro-Demokonten besitzen denselben umfangreichen Verwaltungszugriff wie die Geschäftsführung. Dies wird nicht als Meeting-Beschluss bezeichnet.</p>`;
}
function siteMini(item) {
  const workers = activeEmployees().filter(function (employee) { return employee.site === item.number && ['WORKING', 'ON_BREAK'].includes(employee.status); }).length;
  return `<button class="card site-mini" data-action="open-site" data-id="${item.number}"><span class="build-number">Bau-Nr. ${item.number}</span><h3>${esc(item.name)}</h3><p>${workers} vor Ort · ${item.open.length + openExtras().filter(function (extra) { return extra.site === item.number; }).length} offene Hinweise</p>${badge(item.status, item.kind)}</button>`;
}

function renderPlanning() {
  return window.MMFinal.renderPlanning(db, { ui: ui, head: head });
}

function renderWeekMatrix(plan) {
  const monday = new Date(plan.monday + 'T12:00:00');
  const dates = new Array(6).fill(0).map(function (_, index) { const date = new Date(monday); date.setDate(date.getDate() + index); return String(date.getDate()).padStart(2, '0') + '.' + String(date.getMonth() + 1).padStart(2, '0') + '.'; });
  const groupRows = function (group) {
    const rows = plan.rows.filter(function (row) { const employee = person(row.employeeId); return row.group === group && (!employee || employee.active !== false); });
    return `<tr class="week-group"><th colspan="8">${esc(group)}</th></tr>${rows.map(function (row, index) { const label = row.displayName || employeeName(row.employeeId); return `<tr><td>${index + 1}</td><th>${esc(label)}</th>${row.values.map(function (value) { const kind = value === 'Krank' ? 'week-sick' : value === 'Urlaub' ? 'week-leave' : ''; return `<td class="${kind}">${esc(value)}</td>`; }).join('')}</tr>`; }).join('')}`;
  };
  return `<section class="card card-pad week-matrix"><div class="section-title"><h2>Wochenplanung 2026 · KW ${plan.week}</h2><div class="filter-row">${db.weekPlans.map(function (item) { return `<button class="filter-button ${item.week === plan.week ? 'active' : ''}" data-action="planning-week" data-week="${item.week}">KW ${item.week}</button>`; }).join('')}</div></div><div class="table-scroll"><table><thead><tr><th>Nr.</th><th>Mitarbeiter</th>${['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'].map(function (day, index) { return `<th>${day}<small>${dates[index]}</small></th>`; }).join('')}</tr></thead><tbody>${groupRows('Mitarbeiter')}${groupRows('Auszubildende / Praktikum')}${groupRows('Subunternehmer')}</tbody></table></div></section>`;
}

function renderSites(single) {
  const items = single ? db.sites.filter(function (item) { return item.number === ui.selectedSite; }) : db.sites;
  return `${head(single ? 'Meine Baustelle' : 'Baustellen', 'Die Bau-Nr. verbindet Planung, Zeiten und Dokumentation')}<div class="site-grid">${items.map(function (item) { return siteCard(item, single || ui.selectedSite === item.number); }).join('')}</div>`;
}
function siteCard(item, open) {
  const members = activeEmployees().filter(function (employee) { return employee.site === item.number; });
  return `<article class="card site-card"><button class="site-button" data-action="open-site" data-id="${item.number}" aria-expanded="${open}"><div class="site-top"><span class="build-number">Bau-Nr. ${item.number}</span>${badge(item.status, item.kind)}</div><h3>${esc(item.name)}</h3><p>${esc(item.address)}</p><div class="team-line">${members.slice(0, 5).map(function (employee) { return `<span class="person-chip">${esc(employee.name)} · ${statusText[employee.status]}</span>`; }).join('')}${members.length > 5 ? `<span class="person-chip">+${members.length - 5} weitere</span>` : ''}</div></button>${open ? siteFolder(item) : ''}</article>`;
}
function siteFolder(item) {
  const members = activeEmployees().filter(function (employee) { return employee.site === item.number; });
  const eventList = db.events.filter(function (event) { return event.site === item.number || event.fromSite === item.number; }).slice().reverse();
  const notes = db.notes.filter(function (note) { return note.site === item.number; });
  const extras = db.extras.filter(function (extra) { return extra.site === item.number; });
  const documents = db.documents.filter(function (doc) { return doc.site === item.number; });
  const restTasks = db.restTasks.filter(function (task) { return task.site === item.number; });
  const materials = db.materialRecords.filter(function (record) { return record.site === item.number; }).slice().reverse();
  return `<div class="folder-detail"><div class="folder-head"><div><span class="eyebrow">Digitale Baustellenmappe</span><h2>Bau-Nr. ${item.number} · ${esc(item.name)}</h2><p>${esc(item.customer)}</p></div><button class="secondary" data-action="close-site">Schließen</button></div><div class="detail-grid">
    <section class="detail-block"><h3>Stammdaten</h3><dl class="facts"><dt>Adresse</dt><dd>${esc(item.address)}</dd><dt>Ansprechpartner</dt><dd>${esc(item.contact)}</dd><dt>Zugang</dt><dd>${esc(item.access)}</dd><dt>Zeitraum</dt><dd>${esc(item.dates)}</dd><dt>Abrechnungshinweis</dt><dd>${esc(item.invoice)}</dd></dl></section>
    <section class="detail-block"><h3>Aufgaben & Materialhinweise</h3><strong>Aufgaben</strong><ul>${item.tasks.map(function (text) { return `<li>${esc(text)}</li>`; }).join('')}</ul>${item.extraTasks.length ? `<strong>Zusätzliche Aufgaben</strong><ul>${item.extraTasks.map(function (text) { return `<li>${esc(text)}</li>`; }).join('')}</ul>` : ''}<strong>Mitzubringen</strong><p>${esc(item.materials.join(', '))}</p></section>
    <section class="detail-block full-span"><h3>Heute auf der Baustelle</h3><div class="people-table">${members.map(function (employee) { return `<button data-action="open-employee" data-id="${employee.id}"><span><strong>${esc(employee.name)}</strong><small>${esc(employee.job)}</small></span>${badge(statusText[employee.status], statusKind[employee.status])}</button>`; }).join('')}</div></section>
    <section class="detail-block"><h3>Offene Punkte</h3>${item.open.length || restTasks.length ? `<ul>${item.open.map(function (text) { return `<li>${esc(text)}</li>`; }).join('')}${restTasks.map(function (task) { return `<li><strong>${esc(task.area)}:</strong> ${esc(task.description)} · ${esc(task.status.toLowerCase())}</li>`; }).join('')}</ul>` : '<p>Keine offenen Punkte im Beispiel.</p>'}</section>
    <section class="detail-block"><h3>Zusatzarbeiten</h3>${extras.length ? extras.map(function (extra) { return `<button class="compact-link" data-action="open-extra" data-id="${extra.id}"><strong>${esc(extra.description)}</strong><small>${extraCommercial(extra)}</small></button>`; }).join('') : '<p>Keine Zusatzarbeit im Beispiel.</p>'}</section>
    <section class="detail-block full-span"><h3>Notizen und synthetische Bilder</h3><div class="documentation-grid">${notes.map(renderNote).join('') || '<p>Keine Notizen.</p>'}</div></section>
    <section class="detail-block full-span"><div class="section-title"><div><h3>Materialverlauf</h3><p>Anforderung, Entnahme und Verbrauch für diese Bau-Nr.</p></div><button class="secondary" data-action="navigate" data-view="material">Material öffnen</button></div><div class="material-timeline">${materials.map(function (record) { return `<article><span>${badge(materialTypeText(record.type), '')}</span><strong>${esc(record.article)} · ${esc(record.quantity + ' ' + record.unit)}</strong><small>${esc(materialStatusText(record.status))} · ${esc(employeeName(record.employeeId))} · ${esc(record.updatedAt)}</small></article>`; }).join('') || '<p>Keine Materialeinträge im Beispiel.</p>'}</div></section>
    <section class="detail-block full-span"><h3>Zeit- und Baustellenverlauf</h3><ol class="timeline compact">${eventList.slice(0, 14).map(function (event) { return `<li><time>${event.time}</time><span><strong>${esc(eventText[event.type] || event.type)} · ${esc(employeeName(event.employeeId))}</strong><small>${event.createdBy !== event.createdFor ? 'Gebucht durch ' + esc(employeeName(event.createdBy)) : 'Selbst gebucht'}${event.note ? ' · ' + esc(event.note) : ''}</small></span></li>`; }).join('')}</ol></section>
    ${isOfficeRole() ? window.MMFinal.renderCommercial(db, item, { esc: esc }) : ''}
    <section class="detail-block full-span"><h3>Dokumente & Exporte</h3>${documents.length ? documents.map(function (doc) { return `<div class="document-row"><span><strong>${esc(doc.title)}</strong><small>${esc(doc.type)}</small></span>${badge(doc.status, 'ok')}</div>`; }).join('') : '<p>Noch keine Beispieldokumente.</p>'}<div class="site-export-actions"><button class="secondary" data-mm-action="print" data-template="work-order" data-site="${item.number}">Arbeitszettel</button><button class="secondary" data-mm-action="print" data-template="material-request" data-site="${item.number}">Materialanforderung</button><button class="secondary" data-mm-action="print" data-template="material-usage" data-site="${item.number}">Materialeinsatz</button><button class="secondary" data-mm-action="print" data-template="measurement" data-site="${item.number}">Aufmaß</button><button class="secondary" data-mm-action="print" data-template="protocol" data-site="${item.number}">Baubesprechung</button><button class="primary" data-mm-action="xlsx-project" data-site="${item.number}">Projekt-Unterkonto XLSX</button></div><p class="meta">Alle Druckansichten verwenden ausschließlich synthetische Daten. Offene Fachregeln werden nicht berechnet.</p></section>
  </div></div>`;
}
function renderNote(note) {
  return `<article class="note-card"><div><strong>${esc(note.category)}${note.area ? ' · ' + esc(note.area) : ''}</strong><small>${esc(note.author)} · ${esc(note.time)}${note.syncStatus === 'PENDING' ? ' · wartet auf Synchronisierung' : ''}</small><p>${esc(note.text)}</p></div>${note.photo ? syntheticPhoto(note.photo, note.id) : ''}</article>`;
}
function syntheticPhoto(label, seed) {
  const variant = String(seed).charCodeAt(String(seed).length - 1) % 3;
  return `<figure class="synthetic-photo variant-${variant}" role="img" aria-label="Synthetisches Beispielbild: ${esc(label)}"><div class="photo-wall"><span></span><i></i></div><figcaption><strong>Synthetisches Beispielbild</strong><small>${esc(label)}</small></figcaption></figure>`;
}

function projectOptions(selected) {
  return db.sites.filter(function (item) { return item.active !== false; }).map(function (item) {
    return `<option value="${item.number}" ${item.number === selected ? 'selected' : ''}>${item.number} · ${esc(item.name)}</option>`;
  }).join('');
}

function renderDocumentation() {
  const employee = person(currentEmployeeId() || 'M-0001');
  const ownNotes = db.notes.filter(function (item) { return item.employeeId === employee.id || item.author === employee.name; }).slice().reverse();
  return `${head('Baustellendokumentation', 'Foto und Sprache erst prüfen, dann bewusst speichern')}
    <section class="documentation-start-grid">
      <button class="card workflow-start" data-action="open-employee-action" data-kind="note" data-template="note"><strong>Baustellennotiz</strong><span>Text, Bereich und lokales Foto</span></button>
      <button class="card workflow-start" data-action="open-employee-action" data-kind="extra" data-template="extra"><strong>Zusatzarbeit</strong><span>Dokumentieren und getrennt bestätigen</span></button>
      <button class="card workflow-start" data-action="open-employee-action" data-kind="note" data-template="problem"><strong>Schaden / Problem</strong><span>Synthetischen Sprachentwurf testen</span></button>
      <button class="card workflow-start" data-action="open-employee-action" data-kind="note" data-template="progress"><strong>Fortschritt</strong><span>Stand mit optionalem Bild festhalten</span></button>
    </section>
    <p class="legal-note"><strong>Foto:</strong> Eine ausgewählte Datei bleibt ausschließlich als lokale Vorschau auf diesem Gerät. Gespeichert wird in der statischen Demo nur der Hinweis „lokales Foto vorhanden“, niemals die Bilddatei.</p>
    <p class="decision-note"><strong>Spracheingabe – Demo:</strong> Ein synthetischer Beispielsatz wird in einen editierbaren Entwurf überführt. Es findet keine Audioaufnahme und keine externe Spracherkennung statt. Erst „Übernehmen“ gibt den Text zum Speichern frei.</p>
    <section class="section"><div class="section-title"><h2>Meine letzten Einträge</h2><span class="meta">${ownNotes.length} Notizen</span></div><div class="documentation-grid">${ownNotes.slice(0, 8).map(renderNote).join('') || '<div class="empty-note">Noch keine eigenen Notizen.</div>'}</div></section>`;
}

function materialCard(item) {
  const canAdvance = isOfficeRole() && ((item.type === 'REQUEST' && ['NEW', 'PROCESSING'].includes(item.status)) || (item.type === 'USAGE' && item.status === 'RECORDED'));
  const next = item.type === 'REQUEST' ? (item.status === 'NEW' ? 'PROCESSING' : 'READY') : 'REVIEWED';
  const nextText = next === 'PROCESSING' ? 'In Bearbeitung setzen' : next === 'READY' ? 'Bereit / erledigt' : 'Als geprüft markieren';
  return `<article class="card material-card"><div class="item-top"><span class="build-number">Bau-Nr. ${item.site}</span>${badge(materialStatusText(item.status), ['READY','REVIEWED'].includes(item.status) ? 'ok' : item.status === 'NEW' ? 'problem' : 'warn')}</div><h3>${esc(item.article)} · ${esc(item.quantity + ' ' + item.unit)}</h3><p>${esc(materialTypeText(item.type))} · ${esc(siteName(item.site))}</p><small>${esc(employeeName(item.employeeId))} · ${esc(item.createdAt)}${item.syncStatus === 'PENDING' ? ' · wartet auf Synchronisierung' : ''}</small>${item.note ? `<p>${esc(item.note)}</p>` : ''}<details class="history"><summary>Änderungsverlauf</summary><ul>${item.history.map(function (line) { return `<li>${esc(line)}</li>`; }).join('')}</ul></details>${canAdvance ? `<button class="primary" data-action="material-status" data-id="${item.id}" data-status="${next}">${nextText}</button>` : ''}</article>`;
}

function renderMaterial() {
  const employeeId = currentEmployeeId();
  const employee = employeeId ? person(employeeId) : null;
  const defaultSite = employee && (employee.site || (assignment(employee.id) || {}).site) || '26-103';
  const records = isOfficeRole() ? db.materialRecords.slice().reverse() : db.materialRecords.filter(function (item) { return item.employeeId === employeeId; }).slice().reverse();
  return `${head('Material', 'Anfordern, aus der Firma entnehmen und Verbrauch einer Bau-Nr. zuordnen')}
    ${assumption('Die Status „Neu“, „In Bearbeitung“, „Bereit / erledigt“, „Erfasst“ und „Geprüft“ sind Demo-Vorschläge. Lagerbestand, Bestellung, Barcode, Artikelstamm und Bewertung bleiben offen.')}
    ${employeeId ? `<section class="card card-pad"><h2>Materialvorgang erfassen</h2><form data-form="material-entry"><div class="form-grid"><label>Vorgang<select name="type"><option value="REQUEST">Material anfordern</option><option value="WITHDRAWAL">Aus Firma / Lager entnehmen</option><option value="USAGE">Tatsächlichen Verbrauch erfassen</option></select></label><label>Bau-Nr.<select name="site">${projectOptions(defaultSite)}</select></label><label>Artikel<input name="article" required list="material-articles" placeholder="z. B. Abdeckvlies"><datalist id="material-articles"><option>Abdeckvlies</option><option>Innenfarbe weiss</option><option>Tiefengrund</option><option>Malervlies</option><option>Klebeband 30 mm</option></datalist></label><label>Menge<input name="quantity" required type="number" min="0.01" step="0.01" value="3"></label><label>Einheit<input name="unit" required value="Rolle"></label><label class="full">Hinweis – optional<textarea name="note" placeholder="Wofür wird das Material benötigt?"></textarea></label></div><button class="primary full-button">Materialvorgang speichern</button></form></section>` : ''}
    <section class="section"><div class="section-title"><div><h2>${isOfficeRole() ? 'Betriebsweiter Materialverlauf' : 'Meine Materialvorgänge'}</h2><p>Jeder Eintrag bleibt mit Bau-Nr., Person und Verlauf verbunden.</p></div><span class="meta">${records.length} Vorgänge</span></div><div class="list">${records.map(materialCard).join('') || '<div class="empty-note">Keine Materialvorgänge vorhanden.</div>'}</div></section>
    <p class="legal-note">Die Demo führt keinen Lagerbestand und ermittelt keine Materialpreise. Verbrauchseinträge werden nur als synthetische Rohposition in das Projekt-Unterkonto übernommen.</p>`;
}

function leaveCard(item) {
  const employee = person(item.employeeId);
  const pending = item.status === 'REQUESTED';
  return `<article class="card leave-card"><div class="item-top"><strong>${esc(employee ? employee.name : item.employeeId)}</strong>${badge(leaveStatusText(item.status), item.status === 'APPROVED' ? 'ok' : item.status === 'REJECTED' ? 'problem' : 'warn')}</div><p>${esc(item.from)} bis ${esc(item.to)} · ${item.days} Arbeitstag${item.days === 1 ? '' : 'e'}</p>${item.note ? `<p>${esc(item.note)}</p>` : ''}${item.decisionReason ? `<div class="decision-box"><strong>Rückmeldung</strong><p>${esc(item.decisionReason)}</p></div>` : ''}<details class="history"><summary>Verlauf</summary><ul>${item.history.map(function (line) { return `<li>${esc(line)}</li>`; }).join('')}</ul></details>${isOfficeRole() && pending ? `<form data-form="leave-decision" data-id="${item.id}"><label>Optionale Begründung<textarea name="reason" placeholder="Rückmeldung an den Mitarbeiter"></textarea></label><div class="form-actions"><button class="primary" name="decision" value="APPROVED">Genehmigen</button><button class="danger-button" name="decision" value="REJECTED">Ablehnen</button></div></form>` : ''}</article>`;
}

function renderLeave() {
  const employeeId = currentEmployeeId();
  const items = isOfficeRole() ? db.leaveRequests.slice().sort(function (a, b) { return (a.status === 'REQUESTED' ? 0 : 1) - (b.status === 'REQUESTED' ? 0 : 1); }) : db.leaveRequests.filter(function (item) { return item.employeeId === employeeId; });
  return `${head('Urlaub', isOfficeRole() ? 'Anträge prüfen und Auswirkungen in der Planung sehen' : 'Digital beantragen und Status verfolgen')}
    ${assumption('Verwaltungskonten dürfen die Entscheidung hier simulieren. Wer produktiv final genehmigen darf, Resturlaub, Vertretung und Sonderfälle sind noch festzulegen.')}
    ${employeeId ? `<section class="card card-pad"><h2>Neuer Antrag</h2><form data-form="leave-request"><div class="form-grid"><label>Urlaub von<input type="date" name="from" required value="2026-10-12"></label><label>bis<input type="date" name="to" required value="2026-10-16"></label><label class="full">Bemerkung – optional<textarea name="note"></textarea></label></div><button class="primary full-button">Urlaub beantragen</button><p class="meta">Arbeitstage werden für die Demo Montag bis Freitag gezählt. Eine endgültige betriebliche Berechnungsregel bleibt offen.</p></form></section>` : ''}
    <section class="section"><div class="section-title"><h2>${isOfficeRole() ? 'Urlaubsanträge' : 'Meine Anträge'}</h2><span class="meta">${items.filter(function (item) { return item.status === 'REQUESTED'; }).length} offen</span></div><div class="list">${items.map(leaveCard).join('') || '<div class="empty-note">Noch kein Urlaubsantrag.</div>'}</div></section>`;
}

function renderFeedback() {
  return `${head('Feedback und Fehlermeldung', 'Bedienbare lokale Demo ohne externe Übermittlung')}<section class="card card-pad"><form data-form="feedback-case"><div class="form-grid"><label>Kategorie<select name="category"><option>Technischer Fehler</option><option>Bedienproblem</option><option>Datenproblem</option><option>Verbesserungsvorschlag</option><option>Fehlende Funktion</option><option>Sonstiges</option></select></label><label>Bereich<input name="screen" value="${esc(ui.view)}" required></label><label class="full">Beschreibung<textarea name="description" required placeholder="Was ist aufgefallen?"></textarea></label></div><button class="primary full-button">Demo-Fall anlegen</button><p class="meta">Es wird nur eine synthetische Fallnummer im lokalen Browserzustand erzeugt.</p></form></section><section class="section"><h2>Demo-Fälle</h2><div class="list">${db.feedbackCases.slice().reverse().map(function (item) { return `<article class="card feedback-card"><div class="item-top"><strong>${esc(item.id)}</strong>${badge(item.status, 'warn')}</div><p><strong>${esc(item.category)}</strong> · ${esc(item.screen)}</p><p>${esc(item.description)}</p><small>${esc(item.role)} · ${esc(item.createdAt)}${item.syncStatus === 'PENDING' ? ' · wartet auf Synchronisierung' : ''}</small></article>`; }).join('')}</div></section>`;
}

function renderSharedDevice() {
  const selected = ui.sharedSelectedEmployee && person(ui.sharedSelectedEmployee);
  const now = Date.now();
  const cooldown = Math.max(0, ui.sharedCooldownUntil - now);
  return `${head('Gemeinsames Firmen-iPad', 'Benutzerwahl und persönlicher 6-stelliger Demo-PIN')}
    <p class="legal-note"><strong>Bedienungssimulation:</strong> Dies ist keine echte Authentifizierung. Produktiv sind serverseitige Prüfung, PIN-Hash, Rate Limit, Gerätezulassung, Audit, sichere Sessions und Geräteentzug erforderlich. Offline-Entsperrung bleibt offen.</p>
    <section class="card shared-device-card"><div class="shared-device-head"><div><strong>${esc(db.sharedDevice.deviceName)}</strong><small>Demo-Einstellung · automatische Sperre nach 10 Minuten, später konfigurierbar</small></div>${badge('Demo-Gerät', 'warn')}</div>
      ${!selected ? `<h2>Wer arbeitet jetzt am Gerät?</h2><div class="shared-user-grid">${activeEmployees().filter(function (item) { return window.MMAdvanced.hasDemoPin(item.id); }).map(function (item) { return `<button data-action="select-shared-user" data-id="${item.id}"><span class="avatar">${esc(item.name.charAt(0))}</span><span><strong>${esc(item.name)}</strong><small>${esc(item.job)}</small></span></button>`; }).join('')}</div>` : `<form data-form="shared-pin"><button type="button" class="compact-link" data-action="shared-device-switch">← Andere Person wählen</button><div class="shared-selected"><span class="avatar">${esc(selected.name.charAt(0))}</span><span><strong>${esc(selected.name)}</strong><small>${esc(selected.job)}</small></span></div><label>Persönlicher 6-stelliger Demo-PIN<input name="pin" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="off" required ${cooldown ? 'disabled' : ''} aria-label="6-stelliger Demo-PIN"></label><button class="primary full-button" ${cooldown ? 'disabled' : ''}>Eigene Ansicht öffnen</button><p class="meta">Synthetischer Test-PIN für ${esc(selected.name)}: ${esc(window.MMAdvanced.demoPinHint(selected.id))}</p>${cooldown ? `<p class="problem-text">Demo-Cooldown aktiv. Bitte kurz warten.</p>` : ui.sharedPinFailures ? `<p class="problem-text">${ui.sharedPinFailures} von 5 Fehlversuchen.</p>` : ''}</form>`}
    </section><section class="card card-pad section"><h2>Bedienfälle</h2><div class="form-actions"><button class="secondary" data-action="demo-auto-lock">Autosperre jetzt demonstrieren</button><button class="secondary" data-action="navigate" data-view="more">Zurück zu Mehr</button></div></section>`;
}

function renderEmployees() {
  const filters = [['all', 'Aktiv'], ['INACTIVE', 'Deaktiviert'], ['WORKING', 'Arbeitet'], ['ON_BREAK', 'Pause'], ['TRAVELING', 'Unterwegs'], ['NOT_STARTED', 'Nicht gestartet'], ['FINISHED', 'Beendet'], ['NOT_PLANNED', 'Nicht eingeplant'], ['REVIEW', 'Prüfbedarf']];
  const list = ui.employeeFilter === 'all' ? activeEmployees() : ui.employeeFilter === 'INACTIVE' ? db.employees.filter(function (item) { return item.active === false; }) : activeEmployees().filter(function (item) { return item.status === ui.employeeFilter; });
  return `${head('Mitarbeiter', 'Aktive Personen, erhaltene Historie und direkte Büro-Hilfe')}<div class="toolbar"><span><strong>${activeEmployees().length}</strong> aktiv · ${db.employees.length - activeEmployees().length} deaktiviert</span>${isOfficeRole() ? '<button class="primary" data-action="navigate" data-view="admin">Mitarbeiter anlegen / verwalten</button>' : ''}</div><div class="filter-row">${filters.map(function (item) { return `<button class="filter-button ${ui.employeeFilter === item[0] ? 'active' : ''}" data-action="employee-filter" data-status="${item[0]}">${item[1]}</button>`; }).join('')}</div><div class="list">${list.map(employeeCard).join('')}</div>`;
}
function employeeCard(employee) {
  const open = ui.selectedEmployee === employee.id;
  const current = assignment(employee.id);
  const items = eventsFor(employee.id).slice().reverse();
  const stateKind = employee.active === false ? 'problem' : statusKind[employee.status];
  const adminTools = isOfficeRole() ? `<section class="admin-inline-tools"><h3>Verwaltungsaktionen</h3><form class="form-grid" data-form="employee-edit" data-id="${employee.id}"><label>Name<input name="name" required value="${esc(employee.name)}"></label><label>Funktion<input name="job" required value="${esc(employee.job)}"></label><button class="secondary">Stammdaten speichern</button></form><div class="form-actions">${employee.active === false ? `<button class="primary" data-action="reactivate-employee" data-id="${employee.id}">Reaktivieren</button>` : `<button class="secondary" data-action="admin-help" data-id="${employee.id}">Im Büro helfen</button><button class="danger-button" data-action="deactivate-employee" data-id="${employee.id}">Deaktivieren</button>`}</div><p class="meta">Deaktivieren löscht keine früheren Zeiten, Dokumente oder Audit-Einträge.</p></section>` : '';
  return `<article class="card employee-card ${employee.status === 'REVIEW' || employee.active === false ? 'problem-card' : ''}"><button class="item-button" data-action="open-employee" data-id="${employee.id}" aria-expanded="${open}"><span><strong>${esc(employee.name)}</strong><small>${esc(employee.job)} · ${employee.id}</small></span><span>${badge(employeeDisplayStatus(employee), stateKind)}<small>${employee.active === false ? 'Historie bleibt erhalten' : employee.site ? 'Bau-Nr. ' + employee.site + ' · seit ' + employee.since : 'Heute ohne Zuordnung'}</small></span></button>${open ? `<div class="inline-detail"><div class="inline-summary"><span><small>Geplant</small><strong>${current && current.site ? 'Bau-Nr. ' + current.site : 'Nicht eingeplant'}</strong></span><span><small>Aktuell</small><strong>${employee.site ? 'Bau-Nr. ' + employee.site : '–'}</strong></span></div><h3>Heutiger Ereignisverlauf</h3><ol class="timeline">${items.length ? items.map(function (event) { return `<li><time>${event.time}</time><span><strong>${esc(eventText[event.type] || event.type)}</strong><small>${event.site ? 'Bau-Nr. ' + event.site : ''}${event.createdBy !== event.createdFor ? ' · durch ' + esc(employeeName(event.createdBy)) : ''}</small></span></li>`; }).join('') : `<li><time>–</time><span><strong>Noch keine Zeitbuchung</strong><small>${current && current.site ? 'Geplant für Bau-Nr. ' + current.site : 'Nicht eingeplant'}</small></span></li>`}</ol>${adminTools}</div>` : ''}</article>`;
}

function renderAdmin() {
  const admins = Object.keys(profiles).filter(function (key) { return profiles[key].adminAccess; }).map(function (key) { return profiles[key]; });
  const selectedSupport = ui.supportEmployee && person(ui.supportEmployee) && person(ui.supportEmployee).active !== false ? ui.supportEmployee : activeEmployees()[0].id;
  const permissionLabels = ['Projekte anlegen und bearbeiten', 'Mitarbeiter anlegen und deaktivieren', 'Planung ändern', 'Telefonische Büro-Hilfe buchen', 'Zeitkorrekturen bearbeiten', 'Wochenzettel freigeben', 'Dokumente und Exporte', 'Änderungsverlauf einsehen'];
  return `${head('Verwaltung', 'Umfangreiche Betriebsverwaltung für Geschäftsführung und Büro')}
    <section class="card card-pad admin-rights"><div class="section-title"><div><h2>Vier berechtigte Demo-Konten</h2><p>Diese Rechte sind eine spätere Projektentscheidung aus dem Auftrag vom 12.09.2026 – kein rückwirkender Meeting-Beschluss.</p></div>${badge('ADMIN', 'ok')}</div><div class="admin-account-grid">${admins.map(function (item) { return `<article><span class="avatar">${item.initial}</span><span><strong>${esc(item.name)}</strong><small>${esc(item.label)} · voller Demo-Verwaltungszugriff</small></span></article>`; }).join('')}</div><div class="permission-grid">${permissionLabels.map(function (label) { return `<span>✓ ${esc(label)}</span>`; }).join('')}</div></section>
    <div class="admin-form-grid section">
      <details class="card card-pad admin-create" open><summary>Neues Projekt anlegen</summary><form data-form="admin-project-create"><div class="form-grid"><label>Bau-Nr.<input name="number" required pattern="[0-9]{2}-[0-9]{3}" placeholder="26-107"></label><label>Projektname<input name="name" required placeholder="z. B. Wohnhaus Regenbogen"></label><label>Kunde / Auftraggeber<input name="customer" required placeholder="vollständig erfunden"></label><label>Adresse<input name="address" required placeholder="vollständig erfunden"></label><label>Ansprechpartner<input name="contact" required placeholder="synthetischer Kontakt"></label><label>Interner Bearbeiter<input name="manager" required value="${esc(profile().name)}"></label><label class="full">Erste Aufgaben<textarea name="tasks" required placeholder="Eine Aufgabe pro Zeile"></textarea></label></div><button class="primary full-button">Projekt anlegen</button><p class="meta">Die Bau-Nr. muss eindeutig sein. Nur synthetische Daten eingeben.</p></form></details>
      <details class="card card-pad admin-create" open><summary>Neuen Mitarbeiter anlegen</summary><form data-form="admin-employee-create"><div class="form-grid"><label>Name<input name="name" required placeholder="synthetischer Name"></label><label>Funktion<input name="job" required placeholder="Mitarbeiter / Auszubildende"></label><label>Rolle<select name="role"><option value="EMPLOYEE">Mitarbeiter</option><option value="FOREMAN">Vorarbeiter</option></select></label><label>Erste Planung<select name="site"><option value="">Noch nicht eingeplant</option>${db.sites.filter(function (item) { return item.active !== false; }).map(function (item) { return `<option value="${item.number}">${item.number} · ${esc(item.name)}</option>`; }).join('')}</select></label></div><button class="primary full-button">Mitarbeiter anlegen</button><p class="meta">Es entsteht ein neuer synthetischer Personalstammsatz mit Audit-Eintrag.</p></form></details>
    </div>
    <section class="card card-pad section office-support" id="office-support"><div class="section-title"><div><h2>Direkte Büro-Hilfe</h2><p>Für Anrufe bei vergessenem, leerem oder nicht verfügbarem Handy.</p></div>${badge('stellvertretende Buchung', 'warn')}</div><form data-form="admin-support-action"><div class="form-grid"><label>Mitarbeiter<select name="employee">${activeEmployees().map(function (item) { return `<option value="${item.id}" ${item.id === selectedSupport ? 'selected' : ''}>${esc(item.name)} · ${esc(employeeDisplayStatus(item))}</option>`; }).join('')}</select></label><label>Aktion<select name="event"><option value="WORK_START">Arbeit starten</option><option value="BREAK_START">Pause starten</option><option value="BREAK_END">Pause beenden</option><option value="TRAVEL_START">Baustelle verlassen / Fahrt starten</option><option value="TRAVEL_END">Ankunft / Arbeit fortsetzen</option><option value="WORK_END">Feierabend</option></select></label><label>Ziel-Baustelle<select name="site"><option value="">Aktuelle Baustelle beibehalten</option>${db.sites.filter(function (item) { return item.active !== false; }).map(function (item) { return `<option value="${item.number}">${item.number} · ${esc(item.name)}</option>`; }).join('')}</select></label><label class="full">Grund / telefonische Angabe<textarea name="reason" required placeholder="z. B. Mitarbeiter meldet Arbeitsbeginn telefonisch, Handy nicht verfügbar"></textarea></label></div><button class="primary">Stellvertretende Buchung speichern</button><button class="secondary" type="button" data-action="navigate" data-view="times">Historische Korrektur bearbeiten</button><p class="meta">Der betroffene Mitarbeiter und der handelnde Admin bleiben getrennt sichtbar. Historische Zeiten werden weiterhin nur über eine protokollierte Korrektur geändert.</p></form></section>
    <section class="section"><div class="section-title"><div><h2>Projektstammdaten</h2><p>Bearbeiten oder archivieren, ohne verbundene Vorgänge zu löschen.</p></div><span class="meta">${db.sites.filter(function (item) { return item.active !== false; }).length} aktiv · ${db.sites.filter(function (item) { return item.active === false; }).length} archiviert</span></div><div class="list">${db.sites.map(function (item) { return `<details class="card admin-record"><summary><span><strong>Bau-Nr. ${item.number} · ${esc(item.name)}</strong><small>${item.active === false ? 'Archiviert · Historie erhalten' : esc(item.customer)}</small></span>${badge(item.active === false ? 'Archiviert' : 'Aktiv', item.active === false ? 'problem' : 'ok')}</summary><form class="form-grid" data-form="admin-project-edit" data-id="${item.number}"><label>Projektname<input name="name" required value="${esc(item.name)}"></label><label>Kunde<input name="customer" required value="${esc(item.customer)}"></label><label>Adresse<input name="address" required value="${esc(item.address)}"></label><label>Ansprechpartner<input name="contact" required value="${esc(item.contact)}"></label><button class="secondary">Änderungen speichern</button><button class="${item.active === false ? 'primary' : 'danger-button'}" type="button" data-action="${item.active === false ? 'reactivate-project' : 'archive-project'}" data-id="${item.number}">${item.active === false ? 'Reaktivieren' : 'Archivieren'}</button></form></details>`; }).join('')}</div></section>
    <section class="section card card-pad"><div class="section-title"><div><h2>Letzte Verwaltungsänderungen</h2><p>Wer hat wann was geändert?</p></div></div><div class="audit-list">${db.audit.slice(0, 12).map(function (item) { return `<article class="audit-box"><strong>${esc(item.title)}</strong><p>${esc(item.before)} → ${esc(item.after)}</p><small>${esc(item.actor)} · ${esc(item.time)} · ${esc(item.reason)}</small></article>`; }).join('')}</div></section>`;
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
  return `<section class="section card card-pad month-overview"><div class="section-title"><h2>Monatsverlauf · August / September 2026</h2><span class="meta">03.08.–11.09. · ${db.employees.length} synthetische Mitarbeiter einschließlich erhaltener Historie</span></div><div class="table-scroll"><table><thead><tr><th>Mitarbeiter</th><th>Tage mit Zeit</th><th>akzeptierte Rohzeit</th><th>Fahrt roh</th><th>Abwesenheit</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div><p class="meta">Die Zeitwerte sind synthetische, bereits akzeptierte Demo-Rohwerte. Keine Lohn-, Überstunden- oder Fahrtvergütungsregel wird berechnet.</p></section>`;
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
  db.events.push({ id: makeId('E'), employeeId: request.employeeId, type: 'CORRECTION', time: timeNow(), site: request.site, createdBy: currentEmployeeId() || ui.role, createdFor: request.employeeId, note: request.original + ' → ' + after });
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
  const sheets = ownOnly ? db.weeklySheets.filter(function (item) { return item.employeeId === currentEmployeeId(); }) : db.weeklySheets;
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
  const canConfirm = ui.role === 'employee' && sheet.employeeId === currentEmployeeId() && complete && ['DRAFT', 'NEEDS_REVIEW', 'NEEDS_RECONFIRM'].includes(sheet.status);
  const canCorrect = ui.role === 'employee' && sheet.employeeId === currentEmployeeId();
  const canApprove = isOfficeRole() && complete && sheet.status === 'EMPLOYEE_CONFIRMED';
  const snapshots = snapshotsFor(sheet);
  return `<div class="inline-detail week-detail"><div class="table-scroll"><table><thead><tr><th>Tag</th><th>Bau-Nr.</th><th>Beginn</th><th>Pause</th><th>Ende</th><th>Fahrt roh</th><th>Vollständigkeit</th></tr></thead><tbody>${sheet.days.map(function (day) { return `<tr class="${day.issue ? 'row-problem' : ''}"><td><strong>${day.day}</strong><small>${day.date}</small></td><td>${day.site}</td><td>${day.start}</td><td>${day.break}</td><td>${day.end}</td><td>${day.travel}</td><td>${day.issue || 'vollständig'}</td></tr>`; }).join('')}</tbody></table></div><p class="meta">Keine Lohn-, Überstunden- oder Fahrzeitbewertung. Angezeigt werden synthetische Rohangaben.</p><div class="form-actions"><button class="secondary" data-action="download-week-pdf" data-id="${sheet.id}">Aktuelle Druckansicht</button>${canCorrect ? `<button class="secondary" data-action="week-correction" data-id="${sheet.id}">Korrektur melden</button>` : ''}${canConfirm ? `<button class="primary" data-action="confirm-week" data-id="${sheet.id}">Bestätigen</button>` : ''}${canApprove ? '<button class="primary" data-action="approve-week" data-id="' + sheet.id + '">Büro/Admin freigeben</button>' : ''}${!complete && isOfficeRole() ? '<button class="secondary" data-action="navigate" data-view="times">Korrektur prüfen</button>' : ''}</div>${snapshots.length ? `<section class="snapshot-list"><h3>Eingefrorene bestätigte Versionen</h3>${snapshots.map(function (snapshot) { const approval = db.weeklyApprovals.find(function (item) { return item.snapshotId === snapshot.id; }); return `<article class="snapshot-row ${snapshot.supersededByVersion ? 'snapshot-old' : ''}"><div><strong>Version ${snapshot.version} · ${esc(snapshot.confirmedAt)}</strong><small>${snapshot.supersededByVersion ? 'Nicht mehr aktueller Stand – durch Version ' + snapshot.supersededByVersion + ' ersetzt' : approval ? 'Büro/Admin freigegeben' : 'Vom Mitarbeiter bestätigt'} · ${esc(snapshot.contentHash)} · ${snapshot.signatureDataUrl ? 'mit gezeichneter Unterschrift' : 'ohne gezeichnete Unterschrift'}</small></div><button class="secondary" data-action="print-week-snapshot" data-id="${snapshot.id}">PDF-/Druckvorschau</button></article>`; }).join('')}</section>` : ''}<details class="history"><summary>Versions- und Freigabeverlauf</summary><ul>${sheet.history.map(function (line) { return `<li>${esc(line)}</li>`; }).join('')}</ul></details></div>`;
}

function renderNotifications() {
  const employeeId = currentEmployeeId();
  const items = employeeId ? db.notifications.filter(function (item) { return item.employeeId === employeeId; }) : db.notifications;
  const preferences = db.notificationPreferences;
  const option = function (key, label) { return `<label class="checkbox-line"><input type="checkbox" name="${key}" ${preferences[key] ? 'checked' : ''}><span>${esc(label)}</span></label>`; };
  return `${head('Benachrichtigungen', 'Demo-Zentrum für Hinweise, Einstellungen und direkte Sprünge')}<section class="notification-explainer"><strong>Beispiel-Erinnerung: Freitag 16:00 Uhr</strong><p>Der Zeitpunkt ist eine konfigurierbare Demo-Annahme und keine fest beschlossene Betriebsregel.</p><button class="secondary" data-action="test-notification">Test-Benachrichtigung anzeigen</button></section><section class="card card-pad section"><h2>Welche Hinweise möchtest du sehen?</h2><form data-form="notification-preferences" class="notification-settings">${option('weekReview', 'Wochenzettel wartet auf Bestätigung')}${option('planningChanged', 'Planung wurde kurzfristig geändert')}${option('correctionDone', 'Korrektur wurde bearbeitet')}${option('leaveDecision', 'Urlaub genehmigt / abgelehnt')}${option('extraQuestion', 'Rückfrage zu Zusatzarbeit')}<button class="primary">Einstellungen speichern</button></form><p class="meta">Keine endgültigen Uhrzeiten oder Meldepflichten festgelegt.</p></section><div class="list section">${items.map(function (item) { return `<button class="card notification-card ${item.read ? '' : 'unread'}" data-action="open-notification" data-id="${item.id}"><span><strong>${esc(item.title)}</strong><small>${esc(item.body)}</small><small>${esc(item.createdAt)}</small></span><span class="action-word">Öffnen</span></button>`; }).join('') || '<div class="empty-note">Keine Hinweise vorhanden.</div>'}</div><p class="legal-note">Echte Push-Zustellung bei geschlossener App ist hier nicht aktiv. Dafür werden später Push-Service, Service Worker, Backend-Zeitplanung, Geräteberechtigung und sichere Benutzerzuordnung benötigt.</p>`;
}

function renderExports() { return window.MMExports.render(db); }

function renderForeman() {
  const foreman = person(currentEmployeeId());
  const crew = activeEmployees().filter(function (item) { return item.site === foreman.site; });
  return `${head(greeting(profile().name), 'Deine Baustelle und Kolonne · ' + DEMO_DATE)}<section class="card employee-project"><span class="build-number">Bau-Nr. ${foreman.site}</span><h2>${esc(siteName(foreman.site))}</h2><p>${esc(site(foreman.site).address)}</p><div class="employee-status"><small>Dein Status</small><strong>${statusText[foreman.status]}</strong></div></section><section class="section"><div class="section-title"><h2>Deine Demo-Kolonne</h2><button data-action="navigate" data-view="crew">Kolonne buchen</button></div><div class="crew-preview">${crew.slice(0, 6).map(function (member) { return `<div><span class="avatar small">${member.name.charAt(0)}</span><span><strong>${esc(member.name)}</strong><small>${statusText[member.status]}</small></span></div>`; }).join('')}</div></section>${assumption('Die Demo zeigt nur die Personen auf dieser Baustelle. Die endgültige Reichweite der Vorarbeiterrechte ist noch offen.')}`;
}
function renderCrew() {
  const foreman = person(currentEmployeeId());
  const crew = activeEmployees().filter(function (item) { return item.site === foreman.site && item.id !== foreman.id; });
  const bookings = db.events.filter(function (item) { return item.createdBy === foreman.id && item.createdFor !== foreman.id; }).slice().reverse();
  return `${head('Kolonnenbuchung', 'Für jede Person entsteht ein eigener Eintrag')}${assumption('Der Vorarbeiter kann hier nur die Kolonne seiner heutigen Baustelle buchen. Diese Reichweite ist noch nicht endgültig beschlossen.')}<section class="card card-pad"><form data-form="crew-action"><fieldset><legend>Mitarbeiter auswählen</legend><div class="check-list">${crew.map(function (item) { return `<label><input type="checkbox" name="employee" value="${item.id}"><span><strong>${esc(item.name)}</strong><small>${statusText[item.status]}</small></span></label>`; }).join('')}</div></fieldset><label>Aktion<select name="event"><option value="WORK_START">Arbeit starten</option><option value="BREAK_START">Pause starten</option><option value="BREAK_END">Pause beenden</option><option value="WORK_END">Feierabend</option></select></label><button class="primary full-button">Für ausgewählte Mitarbeiter buchen</button></form></section><section class="section"><h2>Letzte Kolonnenbuchungen</h2><div class="list">${bookings.map(function (item) { return `<article class="audit-box"><strong>${esc(employeeName(item.employeeId))}: ${esc(eventText[item.type])}</strong><small>${item.time} · Bau-Nr. ${item.site} · gebucht durch ${esc(foreman.name)}</small></article>`; }).join('') || '<div class="empty-note">Noch keine Kolonnenbuchung in dieser Sitzung.</div>'}</div></section>`;
}

function employeeActions(employee) {
  if (employee.active === false) return '<button class="secondary employee-main-action" disabled>KONTO IN DER DEMO DEAKTIVIERT</button>';
  if (employee.status === 'NOT_STARTED' || employee.status === 'FINISHED') return '<button class="primary employee-main-action" data-action="employee-event" data-event="WORK_START">ARBEIT STARTEN</button>';
  if (employee.status === 'ON_BREAK') return '<button class="primary employee-main-action" data-action="employee-event" data-event="BREAK_END">PAUSE BEENDEN</button>';
  if (employee.status === 'TRAVELING') return '<button class="primary employee-main-action" data-action="employee-event" data-event="TRAVEL_END">FAHRT BEENDEN / ARBEIT FORTSETZEN</button>';
  if (employee.status === 'WORKING') return '<button class="primary employee-main-action" data-action="employee-event" data-event="BREAK_START">PAUSE STARTEN</button><div class="employee-secondary-actions"><button class="secondary" data-action="switch-site">Baustelle wechseln</button><button class="secondary" data-action="employee-event" data-event="WORK_END">Feierabend</button></div>';
  return '<button class="primary employee-main-action" data-action="open-employee-action" data-kind="correction">KORREKTUR MELDEN</button>';
}
function renderEmployee() {
  const employee = person(currentEmployeeId());
  const planned = assignment(employee.id);
  const currentSite = site(employee.site || (planned && planned.site));
  const items = eventsFor(employee.id).slice().reverse();
  const ownWeek = db.weeklySheets.find(function (sheet) { return sheet.employeeId === employee.id; });
  const ownExtras = db.extras.filter(function (extra) { return extra.employeeId === employee.id; }).slice(0, 3);
  return `${head(greeting(employee.name.split(' ')[0]), DEMO_DATE)}${ui.sharedUnlocked ? `<div class="shared-session-banner"><span><strong>Fahrzeuggerät · ${esc(employee.name)}</strong><small>Demo-Sitzung, automatische Sperre nach 10 Minuten</small></span><div class="form-actions"><button class="secondary" data-action="shared-device-lock">Gerät sperren</button><button class="secondary" data-action="shared-device-switch">Benutzer wechseln</button></div></div>` : ''}<section class="card employee-project"><span class="build-number">Bau-Nr. ${currentSite ? currentSite.number : '–'}</span><h2>${esc(currentSite ? currentSite.name : 'Heute nicht eingeplant')}</h2><p>${esc(currentSite ? currentSite.address : 'Bitte im Betrieb nachfragen.')}</p><div class="employee-status"><small>Dein Status</small><strong>${statusText[employee.status]}</strong></div>${employeeActions(employee)}</section><section class="section card card-pad"><div class="section-title"><h2>Heute</h2><span class="meta">${items.length} Ereignisse</span></div><ol class="timeline">${items.length ? items.map(function (event) { return `<li><time>${event.time}</time><span><strong>${esc(eventText[event.type] || event.type)}</strong><small>${event.site ? 'Bau-Nr. ' + event.site : ''}${event.createdBy !== event.createdFor ? ' · gebucht durch ' + esc(employeeName(event.createdBy)) : ''}${event.syncStatus === 'PENDING' ? ' · wartet auf Synchronisierung' : ''}</small></span></li>`; }).join('') : `<li><time>–</time><span><strong>Noch nicht gestartet</strong><small>${planned ? 'Geplant: Bau-Nr. ' + planned.site : 'Nicht eingeplant'}</small></span></li>`}</ol></section><section class="section"><h2>Weitere Aktionen</h2><div class="employee-actions"><button class="employee-action" data-action="open-employee-action" data-kind="note">Notiz / Foto</button><button class="employee-action" data-action="open-employee-action" data-kind="extra">Zusatzarbeit</button><button class="employee-action" data-action="navigate" data-view="material">Material</button><button class="employee-action" data-action="navigate" data-view="leave">Urlaub</button><button class="employee-action" data-action="open-employee-action" data-kind="correction">Korrektur melden</button><button class="employee-action" data-action="navigate" data-view="feedback">Feedback</button></div></section>${ownWeek ? `<section class="section"><h2>Mein Wochenzettel</h2>${weekCard(ownWeek)}</section>` : ''}${ownExtras.length ? `<section class="section"><h2>Meine Zusatzarbeiten</h2><div class="list">${ownExtras.map(extraCard).join('')}</div></section>` : ''}`;
}
function renderEmployeeV11() {
  const employee = person(currentEmployeeId());
  return renderEmployee().replace('<section class="section card card-pad">', window.MMFinal.renderMyWeek(db, employee.id) + '<section class="section card card-pad">');
}

function renderOverlays() {
  return (ui.toast ? `<div class="toast" role="status">${esc(ui.toast)}</div>` : '') + window.MMFinal.renderPlanModal(db, ui.finalModal) + renderActionModal() + renderSwitchModal() + renderDecisionModal() + renderWeekCorrectionModal() + renderExtraConfirmModal() + renderExtraEditModal() + renderLogin();
}
function photoInputFields() {
  return `<section class="capture-box"><h3>Foto</h3><label>Foto aufnehmen / auswählen<input type="file" accept="image/*" capture="environment" data-local-photo></label><div class="local-photo-preview" data-photo-preview><span>Noch kein lokales Foto ausgewählt.</span></div><label class="checkbox-line"><input type="checkbox" name="syntheticPhoto"><span>Stattdessen synthetisches Beispielbild verwenden</span></label><p class="meta">Demo – Datei bleibt lokal auf diesem Gerät. Die Datei selbst wird nicht in den Demo-Zustand übernommen.</p></section>`;
}
function speechDemoFields(kind) {
  const title = kind === 'extra' ? 'Zusatzarbeit beschreiben' : 'Baustellendokumentation diktieren';
  return `<section class="speech-demo-box"><div class="section-title"><div><h3>Spracheingabe – Demo</h3><p>Keine Aufnahme, kein externer Dienst.</p></div><button type="button" class="secondary" data-action="speech-demo" data-kind="${kind}">Spracheingabe starten</button></div><div class="speech-panel" data-speech-panel hidden><label>Erkannter Entwurf<textarea name="speechDraft" data-speech-draft></textarea></label><div class="structured-suggestion" data-structured-suggestion><strong>Strukturierter Vorschlag – bitte prüfen</strong><dl class="facts"><dt>Kategorie</dt><dd data-suggestion-category>${kind === 'extra' ? 'Zusatzarbeit' : 'Problem / Schaden'}</dd><dt>Bereich</dt><dd data-suggestion-area>Treppenhaus</dd><dt>Hinweis</dt><dd>Foto vorhanden, falls lokal ausgewählt</dd></dl></div><div class="form-actions"><button type="button" class="primary" data-action="speech-accept">Übernehmen</button><button type="button" class="secondary" data-action="speech-discard">Verwerfen</button></div><p class="problem-text" data-speech-status>${esc(title)}: Entwurf muss vor dem Speichern übernommen oder verworfen werden.</p></div></section>`;
}
function renderActionModal() {
  if (!ui.employeeAction) return '';
  const kind = ui.employeeAction;
  const employee = person(currentEmployeeId() || 'M-0001');
  const currentSite = employee.site || (assignment(employee.id) || {}).site || '26-101';
  const titles = { extra: 'Zusatzarbeit melden', note: 'Notiz oder synthetisches Foto', correction: 'Korrektur melden', feedback: 'Feedback / Fehler melden' };
  let fields = '';
  const siteOptions = db.sites.filter(function (item) { return item.active !== false; }).map(function (item) { return `<option value="${item.number}" ${item.number === currentSite ? 'selected' : ''}>${item.number} · ${esc(item.name)}</option>`; }).join('');
  if (kind === 'extra') fields = `<button class="scenario-button" type="button" data-action="load-extra-scenario">Beispielszenario 26-104 laden</button><label>Bau-Nr.<select name="site">${siteOptions}</select></label><label>Raum / Bereich – optional<input name="area" placeholder="z. B. Treppenhaus"></label><label>Beschreibung<textarea name="description" required placeholder="Was wurde zusätzlich gemacht?"></textarea></label><div class="form-grid"><label>Menge – optional<input name="quantity" placeholder="18"></label><label>Einheit – optional<input name="unit" placeholder="m²"></label><label>Zeitaufwand – optional<input name="minutes" inputmode="numeric" placeholder="Minuten als Rohangabe"></label><label>Name des Bestätigenden – optional<input name="confirmerName" placeholder="z. B. Robin Muster"></label><label>Funktion – optional<input name="confirmerRole" placeholder="Bauleitung / Auftraggeber"></label></div>${photoInputFields()}${speechDemoFields('extra')}<label class="checkbox-line"><input type="checkbox" name="confirmAfter"><span>Bestätigung der dokumentierten Zusatzarbeit anschließend aufnehmen</span></label>`;
  if (kind === 'note') fields = `<label>Bau-Nr.<select name="site">${siteOptions}</select></label><label>Kategorie<select name="category"><option ${ui.documentationTemplate === 'progress' ? '' : 'selected'}>Allgemein</option><option ${ui.documentationTemplate === 'progress' ? 'selected' : ''}>Fortschritt</option><option ${ui.documentationTemplate === 'problem' ? 'selected' : ''}>Problem / Schaden</option><option>Kunden-/Bauleiterabsprache</option></select></label><label>Raum / Bereich – optional<input name="area" value="${ui.documentationTemplate === 'problem' ? 'Treppenhaus' : ''}"></label><label>Notiz<textarea name="text" required placeholder="Was soll festgehalten werden?"></textarea></label>${photoInputFields()}${speechDemoFields('note')}`;
  if (kind === 'correction') fields = `<label>Art<select name="type"><option>Fehlender Arbeitsbeginn</option><option>Fehlendes Arbeitsende</option><option>Falsche Baustelle</option><option>Falsche Pause</option><option>Sonstiges</option></select></label><label>Bau-Nr.<select name="site">${siteOptions}</select></label><label>Gewünschte Angabe<input name="suggestion" required placeholder="z. B. 07:05"></label><label>Beschreibung<textarea name="description" required placeholder="Was ist passiert?"></textarea></label>`;
  if (kind === 'feedback') fields = '<label>Kategorie<select name="category"><option>Technischer Fehler</option><option>Bedienproblem</option><option>Datenproblem</option><option>Verbesserungsvorschlag</option><option>Fehlende Funktion</option><option>Sonstiges</option></select></label><label>Beschreibung<textarea name="description" required placeholder="Was möchtest du melden?"></textarea></label>';
  return `<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card employee-action-card" data-form="employee-action" data-kind="${kind}"><div class="action-modal-head"><div><span class="build-number">Bau-Nr. ${currentSite}</span><h2>${titles[kind]}</h2><p>Nur synthetische Demo-Eingaben verwenden.</p></div><button type="button" class="modal-close" data-action="close-action" aria-label="Schließen">×</button></div><div class="action-form-fields">${fields}</div><button class="primary full-button">Speichern</button><p class="demo-save-note"><strong>Bedienbare Demo</strong><span>Der Eintrag wird lokal gespeichert und erscheint in den verbundenen Ansichten.</span></p></form></div>`;
}
function renderSwitchModal() {
  if (!ui.switchSite) return '';
  const employee = person(currentEmployeeId());
  return `<div class="modal-backdrop" role="dialog" aria-modal="true"><form class="login-card" data-form="site-switch"><div class="action-modal-head"><div><h2>Baustelle wechseln</h2><p>Aktuell: Bau-Nr. ${employee.site}</p></div><button type="button" class="modal-close" data-action="close-switch">×</button></div><label>Nächste Baustelle<select name="site">${db.sites.filter(function (item) { return item.active !== false && item.number !== employee.site; }).map(function (item) { return `<option value="${item.number}">${item.number} · ${esc(item.name)}</option>`; }).join('')}</select></label><button class="primary full-button">Baustelle verlassen und Fahrt starten</button><p class="meta">Fahrzeit wird nur als Rohereignis erfasst.</p></form></div>`;
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
  const id = makeId('E');
  const syncStatus = trackDemoChange('TIME_EVENT', id, eventText[type] || type);
  db.events.push({ id: id, employeeId: employeeId, type: type, time: timeNow(), site: target, fromSite: opts.fromSite || null, createdBy: opts.createdBy || employeeId, createdFor: employeeId, note: opts.note || '', syncStatus: syncStatus });
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
  activeEmployees().forEach(function (employee) { const plan = assignment(employee.id); rows.push([DEMO_DATE, employee.name, employee.job, plan && plan.site ? plan.site : '', plan && plan.site ? siteName(plan.site) : 'Nicht eingeplant', plan ? plan.note : '']); });
  downloadCsv('maler-meyer-demo-tagesplanung.csv', rows);
}

function renderMoreV6() {
  const roleButtons = Object.keys(profiles).map(function (key) {
    const item = profiles[key];
    return '<button class="role-card ' + (ui.role === key ? 'active' : '') + '" data-action="switch-role" data-role="' + key + '"><span class="avatar">' + item.initial + '</span><span><strong>' + esc(item.name) + '</strong><small>' + esc(item.label) + '</small></span></button>';
  }).join('');
  const operations = isOfficeRole() ? '<section class="card card-pad section"><h2>Tagesgeschäft</h2><div class="quick-grid"><button class="secondary" data-action="navigate" data-view="planning">Planung</button><button class="secondary" data-action="navigate" data-view="sites">Baustellen</button><button class="secondary" data-action="navigate" data-view="employees">Mitarbeiter</button></div><h2 class="section">Prüfen / Büro</h2><div class="quick-grid"><button class="primary" data-action="navigate" data-view="tasks">Arbeitsvorräte öffnen</button><button class="secondary" data-action="navigate" data-view="invoice-list">Rechnung schreiben?</button></div><h2 class="section">Verwaltung</h2><div class="quick-grid"><button class="secondary" data-action="navigate" data-view="admin">Projekte, Mitarbeiter & Büro-Hilfe</button><button class="secondary" data-action="navigate" data-view="shared-device">Fahrzeuggerät</button><button class="secondary" data-action="navigate" data-view="notifications">Benachrichtigungen</button></div><h2 class="section">Dokumente & System</h2><div class="quick-grid"><button class="secondary" data-action="navigate" data-view="exports">Dokumente & Exporte</button><button class="secondary" data-action="navigate" data-view="feedback">Feedback</button></div></section>' : '<section class="card card-pad section"><h2>Weitere Bereiche</h2><div class="quick-grid"><button class="secondary" data-action="navigate" data-view="documentation">Foto & Sprache</button><button class="secondary" data-action="navigate" data-view="material">Material</button><button class="secondary" data-action="navigate" data-view="leave">Urlaub</button><button class="secondary" data-action="navigate" data-view="notifications">Benachrichtigungen</button><button class="secondary" data-action="navigate" data-view="feedback">Feedback</button></div></section>';
  const officeDirect = isOfficeRole() ? '<section class="card card-pad section"><h2>Direkt zu Büroaufgaben</h2><div class="quick-grid"><button class="secondary" data-action="navigate" data-view="times">Zeiten prüfen</button><button class="secondary" data-action="navigate" data-view="weeks">Wochenzettel</button><button class="secondary" data-action="navigate" data-view="extras">Zusatzarbeiten</button><button class="secondary" data-action="navigate" data-view="material">Material</button><button class="secondary" data-action="navigate" data-view="leave">Urlaub</button></div></section>' : '';
  return head('Mehr', 'Rollenwechsel, Demo-Steuerung und seltene Bereiche') +
    '<section class="card card-pad"><h2>Demo-Konto wechseln</h2><p>Dieselben synthetischen Vorgänge mit vier Verwaltungs-Konten sowie Vorarbeiter- und Mitarbeiteransicht prüfen.</p><div class="role-grid">' + roleButtons + '</div></section>' +
    operations + officeDirect +
    '<div class="more-grid section"><section class="card more-card"><h2>Fahrzeuggerät</h2><p>Benutzerwahl, 6-stelliger Demo-PIN und Sperre testen.</p><button class="primary" data-action="navigate" data-view="shared-device">Gemeinsames iPad öffnen</button></section><section class="card more-card"><h2>Anmeldung</h2><p>Vorschau der späteren Anmeldung.</p><button class="secondary" data-action="show-login">Anmeldeseite ansehen</button></section><section class="card more-card"><h2>Demo zurücksetzen</h2><p>Alle erfundenen Ausgangsdaten wiederherstellen.</p><button class="danger-button" data-action="reset-demo">Demo-Daten zurücksetzen</button></section><section class="card more-card"><h2>Benachrichtigungen</h2><p>Hinweise öffnen direkt die passende Wochenübersicht.</p><button class="secondary" data-action="navigate" data-view="notifications">Hinweise öffnen</button></section><section class="card more-card"><h2>Dokumente & Exporte</h2><p>Originalnahe Formulare, Wochenplanung und Nachkalkulationsdateien.</p><button class="primary" data-action="navigate" data-view="exports">Bereich öffnen</button></section></div>' +
    '<details class="developer-area"><summary>Entwickler- und Testinformationen</summary><p>Statische Demo ohne Backend und echte serverseitige Rechte. Die vier Verwaltungs-Konten simulieren denselben umfangreichen Adminzugriff; produktiv muss dies serverseitig erzwungen werden. Änderungen, Snapshots und gezeichnete Demo-Unterschriften bleiben nur lokal in diesem Browser.</p><p>Offline, PIN, Spracheingabe, Planveröffentlichung und Synchronisierung sind ausdrücklich Bedienungssimulationen. Browser-localStorage und die Demo-Datenstruktur sind kein Produktivdatenmodell.</p><p>Browser-Benachrichtigungen funktionieren nur nach Erlaubnis und nur solange die statische Seite aktiv ist. Geschlossene-App-Push benötigt später Backend, Push-Service, Service Worker und Benutzer-/Gerätezuordnung.</p><p>Demo-Version 11 · vollständig synthetisch.</p></details>';
}

app.addEventListener('input', function (event) {
  if (event.target.id !== 'global-search') return;
  ui.query = event.target.value;
  render();
  const input = document.getElementById('global-search');
  if (input) { input.focus(); input.setSelectionRange(ui.query.length, ui.query.length); }
});

app.addEventListener('change', function (event) {
  if (!event.target.matches('[data-local-photo]')) return;
  const file = event.target.files && event.target.files[0];
  const preview = event.target.closest('form').querySelector('[data-photo-preview]');
  if (!preview) return;
  if (preview.dataset.objectUrl) URL.revokeObjectURL(preview.dataset.objectUrl);
  if (!file) { preview.innerHTML = '<span>Noch kein lokales Foto ausgewählt.</span>'; delete preview.dataset.objectUrl; return; }
  const url = URL.createObjectURL(file);
  preview.dataset.objectUrl = url;
  preview.innerHTML = `<img src="${url}" alt="Lokale Fotovorschau"><span><strong>Lokales Foto ausgewählt</strong><small>${esc(Math.max(1, Math.round(file.size / 1024)) + ' KB')} · Datei wird nicht gespeichert</small></span>`;
});

app.addEventListener('submit', async function (event) {
  const form = event.target.closest('form');
  if (!form) return;
  event.preventDefault();
  const values = new FormData(form);

  if (window.MMExports.handleSubmit(form, values, db, { save: saveDb, toast: toast })) return;
  if (window.MMFinal.handleForm(db, form, { ui: ui, makeId: makeId, actor: actor, dateTimeNow: dateTimeNow, audit: audit, saveDb: saveDb, toast: toast })) return;

  if (form.dataset.form === 'demo-login') {
    ui.role = values.get('role'); ui.login = false; navigate('today'); toast('Demo als ' + profiles[ui.role].label + ' geöffnet.'); return;
  }
  if (form.dataset.form === 'material-entry') {
    const employeeId = currentEmployeeId();
    const type = values.get('type');
    const id = makeId('MATV');
    const status = type === 'REQUEST' ? 'NEW' : 'RECORDED';
    const item = { id: id, type: type, site: values.get('site'), employeeId: employeeId, article: String(values.get('article')).trim(), quantity: Number(values.get('quantity')), unit: String(values.get('unit')).trim(), note: String(values.get('note') || '').trim(), status: status, createdAt: dateTimeNow(), updatedAt: dateTimeNow(), syncStatus: 'SYNCED', history: [] };
    item.syncStatus = trackDemoChange('MATERIAL_' + type, id, materialTypeText(type) + ' · ' + item.article);
    item.history.push(item.createdAt + ' · ' + materialTypeText(type) + ' durch ' + employeeName(employeeId) + (item.syncStatus === 'PENDING' ? ' · offline vorgemerkt' : ''));
    db.materialRecords.unshift(item);
    if (type === 'USAGE') db.projectMaterialItems.push({ id: 'PM-' + id, sourceId: id, site: item.site, quantity: item.quantity, unit: item.unit, article: item.article, note: item.note, unitPrice: null, totalPrice: null });
    audit('MATERIAL_RECORDED', id, materialTypeText(type) + ' erfasst', '–', item.quantity + ' ' + item.unit + ' ' + item.article, 'Bau-Nr. ' + item.site + ' · Bewertung offen');
    saveDb(); form.reset(); toast(materialTypeText(type) + ' gespeichert' + (item.syncStatus === 'PENDING' ? ' und offline vorgemerkt.' : '.')); return;
  }
  if (form.dataset.form === 'leave-request') {
    const from = String(values.get('from'));
    const to = String(values.get('to'));
    const days = window.MMAdvanced.workdays(from, to);
    if (!days) { toast('Bitte einen gültigen Zeitraum mit mindestens einem Werktag wählen.'); return; }
    const id = makeId('U');
    db.leaveRequests.unshift({ id: id, employeeId: currentEmployeeId(), from: from, to: to, days: days, note: String(values.get('note') || ''), status: 'REQUESTED', requestedAt: dateTimeNow(), reviewedAt: '', reviewedBy: '', decisionReason: '', history: [dateTimeNow() + ' · Antrag durch ' + profile().name + ' gestellt'] });
    audit('LEAVE_REQUESTED', id, 'Urlaub beantragt', '–', from + ' bis ' + to + ' · ' + days + ' Demo-Arbeitstage', 'Keine Resturlaubsberechnung');
    saveDb(); toast('Urlaubsantrag wurde an die Verwaltung übergeben.'); return;
  }
  if (form.dataset.form === 'leave-decision') {
    const request = db.leaveRequests.find(function (item) { return item.id === form.dataset.id; });
    const decision = event.submitter && event.submitter.value;
    if (!request || !['APPROVED', 'REJECTED'].includes(decision)) return;
    request.status = decision; request.reviewedAt = dateTimeNow(); request.reviewedBy = actor(); request.decisionReason = String(values.get('reason') || 'Keine Begründung angegeben');
    request.history.push(request.reviewedAt + ' · ' + leaveStatusText(decision) + ' durch ' + actor());
    if (decision === 'APPROVED') window.MMAdvanced.applyApprovedLeave(db, request);
    db.notifications.unshift({ id: makeId('NOT'), employeeId: request.employeeId, type: 'LEAVE_DECISION', title: 'Urlaubsantrag ' + leaveStatusText(decision).toLowerCase(), body: request.from + ' bis ' + request.to + ' · ' + request.decisionReason, createdAt: 'Heute · ' + timeNow(), read: false });
    audit('LEAVE_DECIDED', request.id, 'Urlaubsantrag ' + leaveStatusText(decision).toLowerCase(), 'Beantragt', leaveStatusText(decision), request.decisionReason + ' · endgültige Genehmigungsrechte offen');
    saveDb(); toast('Urlaubsantrag ' + leaveStatusText(decision).toLowerCase() + '; Planung aktualisiert.'); return;
  }
  if (form.dataset.form === 'feedback-case') {
    const id = 'DEMO-FB-' + String(db.feedbackCases.length + 1).padStart(3, '0');
    const syncStatus = trackDemoChange('FEEDBACK', id, String(values.get('category')));
    db.feedbackCases.push({ id: id, category: values.get('category'), description: values.get('description'), role: profile().label, screen: values.get('screen'), createdAt: dateTimeNow(), status: 'Neu', syncStatus: syncStatus });
    audit('FEEDBACK_CREATED', id, 'Demo-Feedback angelegt', '–', values.get('category'), 'Keine externe Übermittlung');
    saveDb(); form.reset(); toast('Feedback gespeichert · Fallnummer ' + id); return;
  }
  if (form.dataset.form === 'notification-preferences') {
    ['weekReview','planningChanged','correctionDone','leaveDecision','extraQuestion'].forEach(function (key) { db.notificationPreferences[key] = values.get(key) === 'on'; });
    saveDb(); toast('Demo-Benachrichtigungseinstellungen gespeichert.'); return;
  }
  if (form.dataset.form === 'shared-pin') {
    if (Date.now() < ui.sharedCooldownUntil) { toast('Demo-Cooldown ist noch aktiv.'); return; }
    const employee = person(ui.sharedSelectedEmployee);
    if (!employee || !window.MMAdvanced.checkDemoPin(employee.id, values.get('pin'))) {
      ui.sharedPinFailures += 1;
      if (ui.sharedPinFailures >= 5) { ui.sharedCooldownUntil = Date.now() + 5000; ui.sharedPinFailures = 0; setTimeout(function () { if (ui.view === 'shared-device') render(); }, 5100); }
      render(); toast(ui.sharedCooldownUntil > Date.now() ? '5 Fehlversuche · kurzer Demo-Cooldown aktiviert.' : 'Demo-PIN nicht richtig.'); return;
    }
    ui.sharedEmployeeId = employee.id; ui.sharedUnlocked = true; ui.sharedPinFailures = 0; ui.sharedCooldownUntil = 0; ui.role = 'employee'; ui.view = 'today'; db.sharedDevice.lastUserId = employee.id;
    audit('SHARED_DEVICE_UNLOCKED', employee.id, 'Fahrzeuggerät geöffnet', 'Gesperrt', employee.name, '6-stelliger synthetischer Demo-PIN; keine echte Authentifizierung');
    saveDb(); scheduleSharedLock(); render(); toast('Mitarbeiteransicht auf dem Demo-Fahrzeuggerät geöffnet.'); return;
  }
  if (form.dataset.form === 'admin-project-create') {
    const number = String(values.get('number') || '').trim();
    if (site(number)) { toast('Diese Bau-Nr. ist bereits vorhanden.'); return; }
    const project = {
      id: 'P-' + number.replace(/\D/g, ''), number: number, name: values.get('name'), customer: values.get('customer'),
      address: values.get('address'), contact: values.get('contact'), access: 'Noch nicht hinterlegt', dates: 'Noch offen',
      tasks: String(values.get('tasks')).split(/\r?\n/).map(function (item) { return item.trim(); }).filter(Boolean), extraTasks: [], materials: [],
      status: 'Neu angelegt', kind: 'ok', invoice: 'Noch nicht bewertet', open: [], active: true, manager: values.get('manager')
    };
    db.sites.push(project);
    ['Arbeitszettel', 'Materialanforderung', 'Materialeinsatz', 'Aufmass', 'Baubesprechungsprotokoll'].forEach(function (type, index) {
      db.documents.push({ id: 'D-' + number + '-' + index, site: number, type: type, title: type + ' ' + project.name, status: 'Druckbereit' });
    });
    if (db.projectAccounts) db.projectAccounts.push({ site: number, project: project.name, manager: project.manager, offerNet: 0, plannedHours: 0, acceptedHours: 0, travelHoursRaw: 0, traineeHours: 0, materials: 0, lift: 0, subcontractor: 0, tempStaff: 0, scaffoldWaste: 0, other: 0, carryover: 0 });
    audit('PROJECT_CREATED', number, 'Projekt angelegt', '–', 'Bau-Nr. ' + number + ' · ' + project.name, 'Synthetische Neuanlage in der Verwaltung');
    saveDb(); form.reset(); toast('Projekt ' + number + ' wurde angelegt und protokolliert.'); return;
  }
  if (form.dataset.form === 'admin-project-edit') {
    const project = site(form.dataset.id);
    const before = project.name + ' · ' + project.customer + ' · ' + project.address;
    Object.assign(project, { name: values.get('name'), customer: values.get('customer'), address: values.get('address'), contact: values.get('contact') });
    const account = db.projectAccounts && db.projectAccounts.find(function (item) { return item.site === project.number; });
    if (account) account.project = project.name;
    audit('PROJECT_UPDATED', project.number, 'Projektstammdaten geändert', before, project.name + ' · ' + project.customer + ' · ' + project.address, 'Bearbeitung in der Verwaltung');
    saveDb(); toast('Projektstammdaten gespeichert.'); return;
  }
  if (form.dataset.form === 'admin-employee-create') {
    const highest = db.employees.reduce(function (max, item) { const value = Number(String(item.id).replace(/\D/g, '')); return Math.max(max, Number.isFinite(value) ? value : 0); }, 0);
    const id = 'M-' + String(highest + 1).padStart(4, '0');
    const plannedSite = values.get('site') || null;
    const employee = { id: id, name: values.get('name'), job: values.get('job'), role: values.get('role'), status: plannedSite ? 'NOT_STARTED' : 'NOT_PLANNED', site: plannedSite, plannedSite: plannedSite, since: 'noch nicht', active: true, createdAt: dateTimeNow(), createdBy: actor() };
    db.employees.push(employee);
    if (plannedSite) db.assignments.push({ employeeId: id, site: plannedSite, originalSite: null, changedBy: actor(), changedAt: timeNow(), note: 'Erstzuordnung bei Neuanlage' });
    if (db.weekPlans) db.weekPlans.forEach(function (plan) { plan.rows.push({ employeeId: id, values: new Array(6).fill(plannedSite || ''), group: /Auszubild|Praktik/.test(employee.job) ? 'Auszubildende / Praktikum' : 'Mitarbeiter' }); });
    audit('EMPLOYEE_CREATED', id, 'Mitarbeiter angelegt', '–', employee.name + ' · ' + employee.job, 'Synthetische Neuanlage in der Verwaltung');
    saveDb(); form.reset(); toast(employee.name + ' wurde als ' + id + ' angelegt.'); return;
  }
  if (form.dataset.form === 'employee-edit') {
    const employee = person(form.dataset.id);
    const before = employee.name + ' · ' + employee.job;
    employee.name = values.get('name'); employee.job = values.get('job');
    audit('EMPLOYEE_UPDATED', employee.id, 'Mitarbeiterstammdaten geändert', before, employee.name + ' · ' + employee.job, 'Bearbeitung in der Verwaltung');
    saveDb(); toast('Mitarbeiterstammdaten gespeichert.'); return;
  }
  if (form.dataset.form === 'admin-support-action') {
    const employee = person(values.get('employee'));
    if (!employee || employee.active === false) { toast('Bitte einen aktiven Mitarbeiter auswählen.'); return; }
    const type = values.get('event');
    const selectedSite = values.get('site') || employee.travelTarget || employee.site || employee.plannedSite;
    const note = 'Telefonische Büro-Hilfe · ' + values.get('reason');
    const before = employeeDisplayStatus(employee) + (employee.site ? ' · ' + employee.site : '');
    if (type === 'TRAVEL_START') {
      if (!selectedSite) { toast('Für die Fahrt bitte eine Ziel-Baustelle wählen.'); return; }
      const from = employee.site || employee.plannedSite;
      if (from) addEvent(employee.id, 'SITE_LEAVE', { site: from, createdBy: ui.role, note: note });
      addEvent(employee.id, 'TRAVEL_START', { site: selectedSite, fromSite: from, createdBy: ui.role, note: note });
    } else if (type === 'TRAVEL_END') {
      if (!selectedSite) { toast('Für die Ankunft bitte eine Baustelle wählen.'); return; }
      addEvent(employee.id, 'TRAVEL_END', { site: selectedSite, createdBy: ui.role, note: note });
      addEvent(employee.id, 'WORK_RESUME', { site: selectedSite, createdBy: ui.role, note: note });
      delete employee.travelTarget;
    } else {
      addEvent(employee.id, type, { site: selectedSite, createdBy: ui.role, note: note });
    }
    audit('OFFICE_ASSISTED_EVENT', employee.id, 'Stellvertretende Buchung für ' + employee.name, before, eventText[type], values.get('reason'));
    ui.supportEmployee = employee.id; saveDb(); toast('Büro-Hilfe gespeichert · gebucht durch ' + profile().name + '.'); return;
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
    const foreman = person(currentEmployeeId());
    selected.forEach(function (id) { addEvent(id, values.get('event'), { site: foreman.site, createdBy: foreman.id, note: 'Kolonnenbuchung durch Vorarbeiter' }); });
    audit('CREW_EVENT', foreman.id, 'Kolonnenbuchung', selected.length + ' Personen', eventText[values.get('event')], 'Je Person ein eigener Ereigniseintrag');
    saveDb(); toast(selected.length + ' einzelne Buchungen gespeichert.'); return;
  }
  if (form.dataset.form === 'site-switch') {
    const employee = person(currentEmployeeId());
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
    if (form.dataset.speechPending === 'true') { toast('Bitte den Sprachentwurf zuerst übernehmen oder verwerfen.'); return; }
    const employee = person(currentEmployeeId() || 'M-0001');
    const kind = form.dataset.kind;
    const localFile = form.querySelector('[data-local-photo]');
    const hasLocalPhoto = Boolean(localFile && localFile.files && localFile.files.length);
    const photoLabel = hasLocalPhoto ? 'Lokales Foto vorhanden (Datei nicht gespeichert)' : values.get('syntheticPhoto') ? 'Synthetisches Beispielbild' : null;
    const localPreview = form.querySelector('[data-photo-preview]');
    if (localPreview && localPreview.dataset.objectUrl) URL.revokeObjectURL(localPreview.dataset.objectUrl);
    if (kind === 'extra') {
      const id = makeId('ZA');
      const syncStatus = trackDemoChange('EXTRA_WORK', id, 'Zusatzarbeit · ' + values.get('description'));
      const extra = { id: id, site: values.get('site'), employeeId: employee.id, reportedAt: 'Heute · ' + timeNow(), area: values.get('area') || '', description: values.get('description'), quantity: values.get('quantity') || '–', unit: values.get('unit') || '', minutes: values.get('minutes') || '', photo: photoLabel, syncStatus: syncStatus, confirmation: 'Noch keine Bestätigung', docStatus: 'REPORTED', commercialStatus: 'OPEN', decisionReason: '', pendingConfirmerName: values.get('confirmerName') || '', pendingConfirmerRole: values.get('confirmerRole') || '', history: [timeNow() + ' · von ' + employee.name + ' gemeldet' + (syncStatus === 'PENDING' ? ' · offline vorgemerkt' : '')] };
      db.extras.unshift(extra);
      audit('EXTRA_REPORTED', id, 'Zusatzarbeit gemeldet', '–', values.get('description'), 'Mitarbeiteransicht');
      ui.employeeAction = null; ui.documentationTemplate = null;
      if (values.get('confirmAfter')) ui.confirmExtra = id;
      saveDb();
      if (ui.confirmExtra) { render(); return; }
      toast('Zusatzarbeit in allen Ansichten ergänzt.'); return;
    }
    if (kind === 'note') {
      const id = makeId('N');
      const syncStatus = trackDemoChange('PROJECT_NOTE', id, values.get('category') + ' · ' + values.get('text'));
      db.notes.unshift({ id: id, site: values.get('site'), employeeId: employee.id, author: employee.name, time: timeNow(), category: values.get('category'), area: values.get('area') || '', text: values.get('text'), photo: photoLabel, syncStatus: syncStatus });
      audit('PROJECT_NOTE_CREATED', id, 'Baustellennotiz gespeichert', '–', values.get('category') + ' · ' + values.get('text'), 'Erst nach Prüfung des Entwurfs');
      ui.employeeAction = null; ui.documentationTemplate = null; saveDb(); toast('Notiz der Baustellenmappe zugeordnet.'); return;
    }
    if (kind === 'correction') {
      db.correctionRequests.unshift({ id: makeId('KR'), employeeId: employee.id, date: '10.09.', site: values.get('site'), type: values.get('type'), description: values.get('description'), original: 'Ursprüngliche Ereignisfolge bleibt unverändert', suggestion: values.get('suggestion'), status: 'OPEN', createdAt: timeNow() });
      ui.employeeAction = null; saveDb(); toast('Korrekturmeldung an Büro und Geschäftsführung gesendet.'); return;
    }
    if (kind === 'feedback') {
      const id = 'DEMO-FB-' + String(db.feedbackCases.length + 1).padStart(3, '0');
      const syncStatus = trackDemoChange('FEEDBACK', id, String(values.get('category')));
      db.feedbackCases.push({ id: id, category: values.get('category'), description: values.get('description'), role: profile().label, screen: 'Mitarbeiteraktion', createdAt: dateTimeNow(), status: 'Neu', syncStatus: syncStatus });
      ui.employeeAction = null; saveDb(); toast('Feedback gespeichert · Fallnummer ' + id); return;
    }
  }
});

app.addEventListener('click', async function (event) {
  const target = event.target.closest('[data-action],[data-mm-action]');
  if (!target) return;
  event.preventDefault();
  const action = target.dataset.action;
  if (target.dataset.mmAction && window.MMExports.handleAction(target, db, { save: saveDb, toast: toast })) return;
  if (window.MMFinal.handleAction(db, target, { ui: ui, makeId: makeId, actor: actor, dateTimeNow: dateTimeNow, audit: audit, saveDb: saveDb, toast: toast, render: render })) return;
  if (action === 'submit-correction') {
    saveTimeCorrection(target.closest('form'));
    return;
  }
  if (action === 'toggle-offline') {
    if (!db.offlineSimulation.offline) {
      db.offlineSimulation.offline = true;
      db.offlineSimulation.lastSync = 'Offline-Bedienungssimulation aktiv';
      audit('OFFLINE_SIMULATION_STARTED', 'DEMO', 'Offline simuliert', 'Online', 'Offline', 'Keine echte Sync-Engine');
      saveDb(); render(); return toast('Offline simuliert · neue Bedienaktionen werden vorgemerkt.');
    }
    const pending = db.offlineSimulation.queue.filter(function (item) { return item.status === 'PENDING'; });
    pending.forEach(function (item) { item.status = 'SYNCED'; item.syncedAt = dateTimeNow(); });
    db.materialRecords.forEach(function (item) { if (item.syncStatus === 'PENDING') item.syncStatus = 'SYNCED'; });
    db.notes.forEach(function (item) { if (item.syncStatus === 'PENDING') item.syncStatus = 'SYNCED'; });
    db.extras.forEach(function (item) { if (item.syncStatus === 'PENDING') item.syncStatus = 'SYNCED'; });
    db.events.forEach(function (item) { if (item.syncStatus === 'PENDING') item.syncStatus = 'SYNCED'; });
    db.feedbackCases.forEach(function (item) { if (item.syncStatus === 'PENDING') item.syncStatus = 'SYNCED'; });
    db.offlineSimulation.offline = false;
    db.offlineSimulation.lastSync = pending.length + ' Änderung' + (pending.length === 1 ? '' : 'en') + ' in der Demo synchronisiert · keine Konfliktprüfung';
    audit('OFFLINE_SIMULATION_SYNCED', 'DEMO', 'Warteschlange simuliert synchronisiert', pending.length + ' ausstehend', '0 ausstehend', 'Produktiv sind idempotente Events und Konfliktbehandlung erforderlich');
    db.offlineSimulation.queue = [];
    saveDb(); render(); return toast(pending.length + ' vorgemerkte Änderung' + (pending.length === 1 ? '' : 'en') + ' sichtbar synchronisiert.');
  }
  if (action === 'material-status') {
    const item = db.materialRecords.find(function (record) { return record.id === target.dataset.id; });
    const before = materialStatusText(item.status);
    item.status = target.dataset.status; item.updatedAt = dateTimeNow(); item.history.push(item.updatedAt + ' · durch ' + actor() + ' auf „' + materialStatusText(item.status) + '“ gesetzt');
    audit('MATERIAL_STATUS_CHANGED', item.id, 'Materialstatus geändert', before, materialStatusText(item.status), 'Demo-Vorschlag, keine Lagerwirtschaft');
    saveDb(); render(); return toast('Materialstatus gespeichert.');
  }
  if (action === 'select-shared-user') { ui.sharedSelectedEmployee = target.dataset.id; ui.sharedPinFailures = 0; ui.sharedCooldownUntil = 0; return render(); }
  if (action === 'shared-device-switch') {
    if (ui.sharedUnlocked) audit('SHARED_DEVICE_USER_SWITCH', ui.sharedEmployeeId, 'Benutzerwechsel am Fahrzeuggerät', employeeName(ui.sharedEmployeeId), 'Benutzerwahl', 'Manuell gesperrt');
    ui.sharedUnlocked = false; ui.sharedEmployeeId = null; ui.sharedSelectedEmployee = null; ui.sharedPinFailures = 0; ui.role = 'management'; ui.view = 'shared-device'; clearTimeout(sharedLockTimer); saveDb(); return render();
  }
  if (action === 'shared-device-lock' || action === 'demo-auto-lock') { lockSharedDevice(action === 'demo-auto-lock' ? 'Demo-Autosperre manuell ausgelöst' : 'Manuell gesperrt'); return; }
  if (action === 'speech-demo') {
    const form = target.closest('form');
    const panel = form.querySelector('[data-speech-panel]');
    const draft = form.querySelector('[data-speech-draft]');
    const template = ui.documentationTemplate || target.dataset.kind;
    draft.value = template === 'progress' ? 'Wände im Flur sind grundiert. Der erste Anstrich ist abgeschlossen.' : target.dataset.kind === 'extra' ? 'Im Besprechungsraum soll die Nordwand zusätzlich gespachtelt und gestrichen werden. Menge ungefähr 18 Quadratmeter.' : 'Im Treppenhaus wurde Feuchtigkeit an der Nordwand festgestellt.';
    panel.hidden = false; form.dataset.speechPending = 'true'; return;
  }
  if (action === 'speech-accept') {
    const form = target.closest('form');
    const draft = form.querySelector('[data-speech-draft]').value.trim();
    const main = form.querySelector('[name="description"], [name="text"]');
    if (!draft) return toast('Der Sprachentwurf ist leer.');
    main.value = draft;
    const area = form.querySelector('[name="area"]'); if (area && !area.value) area.value = 'Treppenhaus';
    const category = form.querySelector('[name="category"]'); if (category && ui.documentationTemplate === 'problem') category.value = 'Problem / Schaden';
    const quantity = form.querySelector('[name="quantity"]'); if (quantity && !quantity.value && /18/.test(draft)) quantity.value = '18';
    const unit = form.querySelector('[name="unit"]'); if (unit && !unit.value && /18/.test(draft)) unit.value = 'm²';
    form.dataset.speechPending = 'false';
    const status = form.querySelector('[data-speech-status]'); if (status) { status.className = 'success-text'; status.textContent = 'Entwurf übernommen. Bitte Inhalt im Hauptfeld prüfen und erst danach speichern.'; }
    return;
  }
  if (action === 'speech-discard') {
    const form = target.closest('form'); form.dataset.speechPending = 'false';
    const panel = form.querySelector('[data-speech-panel]'); if (panel) panel.hidden = true;
    const draft = form.querySelector('[data-speech-draft]'); if (draft) draft.value = '';
    return;
  }
  if (action === 'navigate') return navigate(target.dataset.view);
  if (action === 'admin-help') { ui.supportEmployee = target.dataset.id; ui.view = 'admin'; render(); return setTimeout(function () { const help = document.getElementById('office-support'); if (help) help.scrollIntoView({ block: 'start' }); }, 0); }
  if (action === 'deactivate-employee') {
    const employee = person(target.dataset.id);
    if (!employee || employee.active === false) return;
    const before = employeeDisplayStatus(employee) + (employee.site ? ' · ' + employee.site : '');
    employee.active = false; employee.deactivatedAt = dateTimeNow(); employee.deactivatedBy = actor(); employee.previousStatus = employee.status; employee.status = 'NOT_PLANNED'; employee.site = null; employee.plannedSite = null;
    const current = assignment(employee.id); if (current) Object.assign(current, { originalSite: current.site, site: null, changedBy: actor(), changedAt: timeNow(), note: 'Mitarbeiter deaktiviert; Historie bleibt erhalten' });
    audit('EMPLOYEE_DEACTIVATED', employee.id, 'Mitarbeiter deaktiviert', before, 'Deaktiviert', 'Kein Löschen: Zeiten, Dokumente und Verlauf bleiben erhalten');
    saveDb(); render(); return toast(employee.name + ' wurde deaktiviert; Historie bleibt erhalten.');
  }
  if (action === 'reactivate-employee') {
    const employee = person(target.dataset.id);
    if (!employee || employee.active !== false) return;
    employee.active = true; employee.status = 'NOT_PLANNED'; employee.since = '–'; delete employee.deactivatedAt; delete employee.deactivatedBy; delete employee.previousStatus;
    audit('EMPLOYEE_REACTIVATED', employee.id, 'Mitarbeiter reaktiviert', 'Deaktiviert', 'Aktiv · nicht eingeplant', 'Reaktivierung in der Verwaltung');
    saveDb(); render(); return toast(employee.name + ' wurde reaktiviert und ist noch nicht eingeplant.');
  }
  if (action === 'archive-project') {
    const project = site(target.dataset.id);
    const assigned = activeEmployees().filter(function (item) { return item.site === project.number || item.plannedSite === project.number; });
    if (assigned.length) return toast('Projekt kann erst archiviert werden, wenn keine aktiven Mitarbeiter mehr zugeordnet sind.');
    project.active = false; project.previousStatus = project.status; project.previousKind = project.kind; project.status = 'Archiviert'; project.kind = 'problem';
    audit('PROJECT_ARCHIVED', project.number, 'Projekt archiviert', 'Aktiv', 'Archiviert', 'Verbundene Dokumente und Historie bleiben erhalten');
    saveDb(); render(); return toast('Bau-Nr. ' + project.number + ' wurde archiviert.');
  }
  if (action === 'reactivate-project') {
    const project = site(target.dataset.id);
    project.active = true; project.status = project.previousStatus || 'Aktiv'; project.kind = project.previousKind || 'ok'; delete project.previousStatus; delete project.previousKind;
    audit('PROJECT_REACTIVATED', project.number, 'Projekt reaktiviert', 'Archiviert', 'Aktiv', 'Reaktivierung in der Verwaltung');
    saveDb(); render(); return toast('Bau-Nr. ' + project.number + ' wurde reaktiviert.');
  }
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
    if (item.planningWeek) { ui.planningWeek = Number(item.planningWeek); return navigate('today'); }
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
  if (action === 'switch-role') { ui.role = target.dataset.role; ui.view = 'today'; ui.selectedSite = null; ui.selectedWeek = null; ui.sharedUnlocked = false; ui.sharedEmployeeId = null; clearTimeout(sharedLockTimer); window.scrollTo(0, 0); return render(); }
  if (action === 'show-login') { ui.login = true; return render(); }
  if (action === 'hide-login') { ui.login = false; return render(); }
  if (action === 'reset-demo') { resetDb(); render(); return toast('Synthetische Ausgangsdaten wiederhergestellt.'); }
  if (action === 'open-employee-action') { ui.employeeAction = target.dataset.kind; ui.documentationTemplate = target.dataset.template || null; return render(); }
  if (action === 'close-action') { ui.employeeAction = null; ui.documentationTemplate = null; return render(); }
  if (action === 'switch-site') { ui.switchSite = true; return render(); }
  if (action === 'close-switch') { ui.switchSite = false; return render(); }
  if (action === 'employee-event') {
    const employee = person(currentEmployeeId());
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
  if (event.key === 'Escape') { ui.employeeAction = null; ui.documentationTemplate = null; ui.switchSite = false; ui.decisionExtra = null; ui.confirmExtra = null; ui.editExtra = null; ui.weekCorrection = null; ui.login = false; render(); }
});

render();

'use strict';

const DEMO_DATE = 'Donnerstag, 10. September';

const employees = [
  { id: 'M-0042', name: 'Max Mustermann', job: 'Mitarbeiter', status: 'NOT_STARTED', site: '25148', since: 'noch nicht', issue: true },
  { id: 'M-0047', name: 'Erika Beispiel', job: 'Mitarbeiterin', status: 'WORKING', site: '25148', since: '07:05', issue: false },
  { id: 'M-0051', name: 'Jan Testmann', job: 'Vorarbeiter', status: 'ON_BREAK', site: '25152', since: '12:15', issue: false },
  { id: 'M-0056', name: 'Lea Muster', job: 'Mitarbeiterin', status: 'TRAVELING', site: '25160 → 25163', since: '12:08', issue: true },
  { id: 'M-0062', name: 'Sam Beispiel', job: 'Mitarbeiter', status: 'WORKING', site: '25160', since: '07:12', issue: false },
  { id: 'M-0068', name: 'Nora Test', job: 'Mitarbeiterin', status: 'NOT_PLANNED', site: '–', since: '–', issue: false },
  { id: 'M-0073', name: 'Luis Muster', job: 'Auszubildender', status: 'WORKING', site: '25148', since: '09:45', issue: false },
  { id: 'M-0079', name: 'Mia Beispiel', job: 'Vorarbeiterin', status: 'WORKING', site: '25170', since: '06:42', issue: false },
  { id: 'M-0084', name: 'Paul Probier', job: 'Mitarbeiter', status: 'WORKING', site: '25152', since: '06:58', issue: false },
  { id: 'M-0088', name: 'Sina Beispiel', job: 'Mitarbeiterin', status: 'ON_BREAK', site: '25163', since: '12:22', issue: false },
  { id: 'M-0091', name: 'Tom Muster', job: 'Mitarbeiter', status: 'NOT_STARTED', site: '25170', since: 'noch nicht', issue: false },
  { id: 'M-0095', name: 'Eva Test', job: 'Mitarbeiterin', status: 'NOT_PLANNED', site: '–', since: '–', issue: false },
];

const sites = [
  { id: 's-25148', number: '25148', name: 'M&B Schinkel', address: 'Musterstraße 12 · Beispielstadt', status: 'Läuft planmäßig', statusKind: 'ok', people: ['Max Mustermann', 'Erika Beispiel', 'Luis Muster'], time: '2 arbeiten · 1 Start fehlt', extras: 2, issues: ['Arbeitsbeginn von Max fehlt'], notes: ['Untergrund im Treppenhaus geprüft', 'Materiallieferung für Freitag bestätigt'], photo: 'Treppenhaus · erfundener Foto-Platzhalter' },
  { id: 's-25152', number: '25152', name: 'BBS Ahrensburg', address: 'Schulweg 18 · Beispielort', status: 'Läuft', statusKind: 'ok', people: ['Jan Testmann', 'Paul Probier'], time: '1 arbeitet · 1 Pause', extras: 1, issues: [], notes: ['Flur im 2. OG heute abschließen', 'Hausmeister wurde beispielhaft informiert'], photo: '' },
  { id: 's-25160', number: '25160', name: 'Kita Sonnenhof', address: 'Sonnenring 3 · Musterstadt', status: 'Wechsel im Tagesplan', statusKind: 'warn', people: ['Sam Beispiel', 'Lea Muster'], time: '1 arbeitet · 1 unterwegs', extras: 1, issues: ['Ankunftsbuchung von Lea steht noch aus'], notes: ['Gruppenraum Blau fertig', 'Lea wechselt mittags zur Bau-Nr. 25163'], photo: 'Gruppenraum · erfundener Foto-Platzhalter' },
  { id: 's-25163', number: '25163', name: 'Praxis Elbpark', address: 'Hafenallee 21 · Beispielort', status: 'Rückfrage offen', statusKind: 'warn', people: ['Sina Beispiel', 'Lea Muster (unterwegs)'], time: '1 Pause · 1 angekündigt', extras: 1, issues: ['Zusatzarbeit wegen Feuchtigkeit prüfen'], notes: ['Empfangsbereich abgeklebt', 'Beispielhafte Feuchtstelle dokumentiert'], photo: 'Wandfläche · erfundener Foto-Platzhalter' },
  { id: 's-25170', number: '25170', name: 'Wohnanlage Lindenhof', address: 'Lindenweg 14 · Musterstadt', status: 'Start prüfen', statusKind: 'problem', people: ['Mia Beispiel', 'Tom Muster'], time: '1 arbeitet · 1 Start fehlt', extras: 1, issues: ['Tom hat noch nicht gestartet'], notes: ['Mia beginnt im Treppenhaus A', 'Sockelleisten als Zusatzarbeit gemeldet'], photo: '' },
];

const employeeEvents = {
  'M-0042': [
    ['–', 'Arbeitsbeginn fehlt', 'Bau-Nr. 25148', 'Prüfung nötig'],
  ],
  'M-0047': [
    ['07:05', 'Arbeit gestartet', 'Bau-Nr. 25148', 'Erika Beispiel'],
    ['09:35', 'Pause gestartet', 'Bau-Nr. 25148', 'Erika Beispiel'],
    ['10:05', 'Pause beendet', 'Bau-Nr. 25148', 'Erika Beispiel'],
  ],
  'M-0051': [
    ['06:55', 'Arbeit gestartet', 'Bau-Nr. 25152', 'Jan Testmann'],
    ['12:15', 'Pause gestartet', 'Bau-Nr. 25152', 'Jan Testmann'],
  ],
  'M-0056': [
    ['07:10', 'Arbeit gestartet', 'Bau-Nr. 25160', 'Lea Muster'],
    ['12:08', 'Arbeit auf Baustelle abgeschlossen', 'Bau-Nr. 25160', 'Lea Muster'],
    ['12:08', 'Fahrt zur nächsten Baustelle begonnen', '25160 → 25163', 'Lea Muster'],
    ['–', 'Ankunft und Arbeitsfortsetzung fehlen', 'Bau-Nr. 25163', 'Prüfung nötig'],
  ],
  'M-0062': [['07:12', 'Arbeit gestartet', 'Bau-Nr. 25160', 'Sam Beispiel']],
  'M-0073': [['09:45', 'Arbeit gestartet', 'Bau-Nr. 25148', 'Jan Testmann · Vorarbeiter']],
  'M-0079': [['06:42', 'Arbeit gestartet', 'Bau-Nr. 25170', 'Mia Beispiel']],
  'M-0084': [['06:58', 'Arbeit gestartet', 'Bau-Nr. 25152', 'Paul Probier']],
  'M-0088': [['07:03', 'Arbeit gestartet', 'Bau-Nr. 25163', 'Sina Beispiel'], ['12:22', 'Pause gestartet', 'Bau-Nr. 25163', 'Sina Beispiel']],
  'M-0091': [['–', 'Noch nicht gestartet', 'Bau-Nr. 25170', 'Kein Ereignis']],
};

const extraWorks = [
  { id: 'ZA-104', site: '25148', siteName: 'M&B Schinkel', employee: 'Erika Beispiel', title: 'Zusätzliche Spachtelarbeiten im Flur', time: 'Heute · 09:42', quantity: '18 m²', photo: true, confirmation: 'Noch keine Bestätigung', status: 'Neu', kind: 'new' },
  { id: 'ZA-105', site: '25152', siteName: 'BBS Ahrensburg', employee: 'Jan Testmann', title: 'Vier Türzargen zusätzlich lackieren', time: 'Heute · 10:18', quantity: '4 Stück', photo: false, confirmation: 'Bestätigung dokumentiert', status: 'Prüfung', kind: 'review' },
  { id: 'ZA-106', site: '25163', siteName: 'Praxis Elbpark', employee: 'Sina Beispiel', title: 'Feuchtstelle vor weiterer Arbeit dokumentieren', time: 'Heute · 11:06', quantity: '1 Wandfläche', photo: true, confirmation: 'Rückfrage beim Bauleiter', status: 'Neu', kind: 'new' },
  { id: 'ZA-107', site: '25160', siteName: 'Kita Sonnenhof', employee: 'Sam Beispiel', title: 'Zusätzlicher zweiter Deckenanstrich', time: 'Heute · 11:34', quantity: '45 m²', photo: true, confirmation: 'Noch keine Bestätigung', status: 'Neu', kind: 'new' },
  { id: 'ZA-108', site: '25170', siteName: 'Wohnanlage Lindenhof', employee: 'Mia Beispiel', title: 'Sockelleisten im Treppenhaus ergänzen', time: 'Heute · 08:52', quantity: '23 m', photo: false, confirmation: 'Bestätigung dokumentiert', status: 'Neu', kind: 'new' },
  { id: 'ZA-109', site: '25148', siteName: 'M&B Schinkel', employee: 'Luis Muster', title: 'Schutzabdeckung im Eingangsbereich erweitern', time: 'Gestern · 14:21', quantity: '12 m²', photo: false, confirmation: 'Wartet auf Prüfung', status: 'Prüfung', kind: 'review' },
];

const weeks = [
  { id: 'W-42', employee: 'Max Mustermann', week: 'KW 37', status: 'Nacharbeit nötig', kind: 'problem', detail: 'Arbeitsbeginn am Donnerstag fehlt', progress: 70 },
  { id: 'W-47', employee: 'Erika Beispiel', week: 'KW 37', status: 'Wartet auf Prüfung', kind: 'warn', detail: 'Vom Mitarbeiter bestätigt', progress: 100 },
  { id: 'W-51', employee: 'Jan Testmann', week: 'KW 37', status: 'Wartet auf Freigabe', kind: 'warn', detail: 'Alle fünf Tage vollständig', progress: 100 },
  { id: 'W-79', employee: 'Mia Beispiel', week: 'KW 37', status: 'Freigegeben', kind: 'ok', detail: 'Beispielhaft durch das Büro geprüft', progress: 100 },
];

const timeProblems = [
  { id: 'TP-01', employeeId: 'M-0042', employee: 'Max Mustermann', site: '25148', title: 'Arbeitsbeginn fehlt', original: 'Kein Arbeitsbeginn vorhanden', suggestion: '07:00' },
  { id: 'TP-02', employeeId: 'M-0056', employee: 'Lea Muster', site: '25163', title: 'Ankunftsbuchung fehlt', original: 'Fahrt läuft seit 12:08', suggestion: '12:27' },
];

const editors = ['Torben · Geschäftsführung', 'Sabine Beispiel · Büro', 'Petra Muster · Büro'];
const statusText = { WORKING: 'Arbeitet', ON_BREAK: 'Pause', TRAVELING: 'Unterwegs', NOT_STARTED: 'Noch nicht gestartet', NOT_PLANNED: 'Nicht eingeplant' };
const statusKind = { WORKING: 'ok', ON_BREAK: 'warn', TRAVELING: 'travel', NOT_STARTED: 'problem', NOT_PLANNED: '' };

const state = {
  role: 'management', view: 'today', query: '', selectedSite: null, selectedEmployee: null,
  employeeFilter: 'all', extraFilter: 'all', editProblem: null, corrections: [], corrected: {},
  employeeStep: 0, employeeLog: [], loginPreview: false, toast: '',
};

const app = document.getElementById('app');

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function greeting(name) {
  const hour = new Date().getHours();
  const words = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend';
  return `${words}, ${name}`;
}

function badge(text, kind = '') { return `<span class="badge ${kind}">${escapeHtml(text)}</span>`; }
function person(id) { return employees.find(item => item.id === id); }
function siteByNumber(number) { return sites.find(item => item.number === number); }

const navItems = [
  ['today', 'H', 'Heute'], ['sites', 'B', 'Baustellen'], ['employees', 'M', 'Mitarbeiter'],
  ['times', 'Z', 'Zeiten prüfen'], ['extras', '+', 'Zusatzarbeiten'], ['weeks', 'W', 'Wochenzettel'], ['more', '···', 'Mehr'],
];

function navButton(item, mobile = false) {
  const active = state.view === item[0] || (mobile && item[0] === 'more' && ['employees', 'extras', 'weeks', 'more'].includes(state.view));
  return `<button class="nav-button ${active ? 'active' : ''}" data-action="navigate" data-view="${item[0]}" ${active ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${item[1]}</span><span>${item[2]}</span></button>`;
}

function searchResults() {
  const query = state.query.trim().toLowerCase();
  if (query.length < 2) return '';
  const matches = [
    ...sites.filter(site => `${site.number} ${site.name} ${site.address}`.toLowerCase().includes(query)).map(site => ({ type: 'site', id: site.id, main: `Bau-Nr. ${site.number} · ${site.name}`, sub: site.address })),
    ...employees.filter(employee => `${employee.name} ${employee.id} ${employee.site}`.toLowerCase().includes(query)).map(employee => ({ type: 'employee', id: employee.id, main: employee.name, sub: `${employee.job} · ${employee.site === '–' ? 'nicht eingeplant' : `Bau-Nr. ${employee.site}`}` })),
  ].slice(0, 8);
  return `<div class="search-results" role="listbox" aria-label="Suchergebnisse">${matches.length ? matches.map(match => `<button class="search-result" data-action="open-${match.type}" data-id="${match.id}"><span><strong>${escapeHtml(match.main)}</strong></span><span>${escapeHtml(match.sub)}</span></button>`).join('') : '<div class="empty-note">Keine passende Bau-Nr., Baustelle oder Person gefunden.</div>'}</div>`;
}

function managerLayout() {
  const content = renderManagerView();
  return `<div class="test-strip">TESTSYSTEM – KEINE PRODUKTIVDATEN <span>Alle Namen, Bau-Nrn. und Vorgänge sind erfunden.</span></div>
  <div class="app-shell">
    <aside class="sidebar"><a class="brand" href="#" data-action="navigate" data-view="today"><span class="brand-mark">MM</span><span><strong>Maler Meyer</strong><small>Digitale Baustellenorganisation</small></span></a><nav class="side-nav" aria-label="Hauptnavigation">${navItems.map(item => navButton(item)).join('')}</nav><div class="sidebar-footer"><strong>Torben</strong><small>Geschäftsführung · Demo</small><small>powered by ShoreLogic</small></div></aside>
    <div class="main-column"><header class="topbar"><a class="mobile-brand" href="#" data-action="navigate" data-view="today" aria-label="Maler Meyer – Heute"><span class="brand-mark">MM</span><strong>Maler Meyer</strong></a><div class="search-wrap"><span class="search-symbol" aria-hidden="true">⌕</span><label class="sr-only" for="global-search">Bau-Nr., Baustelle oder Mitarbeiter suchen</label><input id="global-search" class="search-box" autocomplete="off" value="${escapeHtml(state.query)}" placeholder="Bau-Nr., Baustelle oder Mitarbeiter suchen">${searchResults()}</div><button class="profile-button" data-action="navigate" data-view="more"><span class="avatar">T</span><span class="profile-copy"><strong>Torben</strong><small>Geschäftsführung</small></span></button></header><main id="main-content" class="content" tabindex="-1">${content}</main></div>
  </div><nav class="mobile-nav" aria-label="Mobile Navigation">${[['today','H','Heute'],['sites','B','Baustellen'],['times','Z','Zeiten'],['more','···','Mehr']].map(item => navButton(item, true)).join('')}</nav>${renderOverlays()}`;
}

function renderManagerView() {
  if (state.view === 'sites') return renderSites();
  if (state.view === 'employees') return renderEmployees();
  if (state.view === 'times') return renderTimes();
  if (state.view === 'extras') return renderExtras();
  if (state.view === 'weeks') return renderWeeks();
  if (state.view === 'more') return renderMore();
  return renderToday();
}

function pageHead(title, text) {
  return `<div class="page-head"><div><h1>${title}</h1><p>${text}</p></div><span class="demo-context">Erfundener Beispieltag</span></div>`;
}

function renderToday() {
  const counts = ['WORKING','ON_BREAK','TRAVELING','NOT_STARTED','NOT_PLANNED'].map(status => [status, employees.filter(item => item.status === status).length]);
  return `${pageHead(greeting('Torben'), DEMO_DATE)}
  <section aria-labelledby="today-status"><div class="section-title"><h2 id="today-status">Heute im Betrieb</h2><span class="meta">12 Testmitarbeiter · 5 aktive Baustellen</span></div><div class="status-grid">${counts.map(([status,count]) => `<button class="status-card" data-action="filter-employees" data-filter="${status}"><strong>${count}</strong><span><i class="status-dot ${status === 'ON_BREAK' ? 'pause' : status === 'TRAVELING' ? 'travel' : status === 'NOT_STARTED' ? 'wait' : status === 'NOT_PLANNED' ? 'free' : ''}"></i>${statusText[status]}</span><small>Personen ansehen</small></button>`).join('')}</div></section>
  <div class="dashboard-grid section"><section class="attention-card" aria-labelledby="attention-title"><div class="attention-head"><div><h2 id="attention-title">Aufmerksamkeit nötig</h2><p>Vier Punkte solltest du heute prüfen.</p></div><span class="attention-count">4</span></div><div class="attention-list">
    <button class="attention-item" data-action="filter-employees" data-filter="NOT_STARTED"><span><strong>2 Mitarbeiter haben noch nicht gestartet</strong><small>Bau-Nr. 25148 und 25170</small></span><span class="action-word">Ansehen</span></button>
    <button class="attention-item" data-action="navigate" data-view="times"><span><strong>2 Zeitbuchungen sind unvollständig</strong><small>Arbeitsbeginn und Ankunft fehlen</small></span><span class="action-word">Prüfen</span></button>
    <button class="attention-item" data-action="navigate" data-view="extras"><span><strong>4 neue Zusatzarbeiten</strong><small>Abrechenbare Arbeiten nicht vergessen</small></span><span class="action-word">Ansehen</span></button>
    <button class="attention-item" data-action="navigate" data-view="weeks"><span><strong>3 Wochenzettel warten</strong><small>Prüfung, Nacharbeit oder Freigabe</small></span><span class="action-word">Prüfen</span></button>
  </div></section>
  <section class="card extra-summary" aria-labelledby="extra-summary-title"><h2 id="extra-summary-title">Zusatzarbeiten</h2><p>Neue Arbeiten früh festhalten, bevor sie bei der Abrechnung fehlen.</p><div class="metric-row"><div class="metric"><strong>4</strong><span>neu</span></div><div class="metric"><strong>2</strong><span>zu prüfen</span></div><div class="metric"><strong>7</strong><span>diese Woche erledigt</span></div></div><button class="primary light" data-action="navigate" data-view="extras">Zusatzarbeiten öffnen</button></section></div>
  <section class="section"><div class="section-title"><h2>Aktive Baustellen</h2><button data-action="navigate" data-view="sites">Alle Baustellen</button></div><div class="site-grid">${sites.slice(0,4).map(siteCard).join('')}</div></section>`;
}

function siteCard(site) {
  return `<article class="card site-card"><button class="site-button" data-action="open-site" data-id="${site.id}" aria-expanded="${state.selectedSite === site.id}"><div class="site-top"><span class="build-number">Bau-Nr. ${site.number}</span>${badge(site.status, site.statusKind)}</div><h3>${site.name}</h3><p>${site.address}</p><div class="team-line">${site.people.map(name => `<span class="person-chip">${name}</span>`).join('')}</div><p class="meta">${site.time} · ${site.extras} Zusatzarbeit${site.extras === 1 ? '' : 'en'}</p></button>${state.selectedSite === site.id ? siteDetail(site) : ''}</article>`;
}

function siteDetail(site) {
  const siteExtras = extraWorks.filter(item => item.site === site.number);
  return `<div class="folder-detail"><div class="folder-head"><div><span class="build-number">Bau-Nr. ${site.number}</span><h2>${site.name}</h2><p>${site.address}</p></div><button class="secondary" data-action="close-site">Mappe schließen</button></div><div class="detail-grid">
    <section class="detail-block"><h3>Heute auf der Baustelle</h3><div class="team-line">${site.people.map(name => `<span class="person-chip">${name}</span>`).join('')}</div><p class="meta">${site.time}</p></section>
    <section class="detail-block"><h3>Offene Punkte</h3>${site.issues.length ? `<ul>${site.issues.map(issue => `<li>${issue}</li>`).join('')}</ul>` : '<p>Für heute ist kein offener Punkt hinterlegt.</p>'}</section>
    <section class="detail-block"><h3>Zusatzarbeiten</h3>${siteExtras.length ? siteExtras.map(item => `<p><strong>${item.status}:</strong> ${item.title}</p>`).join('') : '<p>Keine offene Zusatzarbeit.</p>'}<button class="secondary" data-action="navigate" data-view="extras">Alle Zusatzarbeiten</button></section>
    <section class="detail-block"><h3>Baustellennotizen</h3><ul>${site.notes.map(note => `<li>${note}</li>`).join('')}</ul></section>
    <section class="detail-block"><h3>Foto-Dokumentation</h3>${photoPlaceholder(site.photo || 'Noch kein Beispielbild hinterlegt')}</section>
    <section class="detail-block"><h3>Zeitüberblick</h3><p>${site.time}</p><p class="meta">Nur Rohstatus des Beispieltages. Keine Lohn-, Überstunden- oder Kostenberechnung.</p></section>
  </div></div>`;
}

function photoPlaceholder(label) {
  return `<div class="photo-placeholder" role="img" aria-label="${escapeHtml(label)}"><div><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="5" y="12" width="38" height="27" rx="4" stroke-width="2"/><path d="M15 12l3-5h12l3 5" stroke-width="2"/><circle cx="24" cy="25" r="7" stroke-width="2"/></svg><strong>Foto-Platzhalter</strong><small>${escapeHtml(label)}</small></div></div>`;
}

function renderSites() {
  const selected = sites.find(site => site.id === state.selectedSite);
  return `${pageHead('Baustellen', 'Digitale Baustellenmappen · Bau-Nr. steht immer zuerst')}${selected ? `<section class="section">${siteCard(selected)}</section>` : ''}<section class="section"><div class="section-title"><h2>${selected ? 'Weitere aktive Baustellen' : '5 aktive Baustellen'}</h2><span class="meta">Heute</span></div><div class="site-grid">${sites.filter(site => !selected || site.id !== selected.id).map(siteCard).join('')}</div></section>`;
}

function renderEmployees() {
  const filtered = state.employeeFilter === 'all' ? employees : employees.filter(item => item.status === state.employeeFilter);
  return `${pageHead('Mitarbeiter', 'Wer ist heute wo – ohne jeden Zettel einzeln zu prüfen')}<div class="filter-row" aria-label="Mitarbeiter filtern">${[['all','Alle'],['WORKING','Arbeitet'],['ON_BREAK','Pause'],['TRAVELING','Unterwegs'],['NOT_STARTED','Noch nicht gestartet'],['NOT_PLANNED','Nicht eingeplant']].map(([value,label]) => `<button class="filter-button ${state.employeeFilter === value ? 'active' : ''}" data-action="employee-filter" data-filter="${value}">${label}</button>`).join('')}</div><div class="list">${filtered.map(employee => employeeCard(employee)).join('')}</div>`;
}

function employeeCard(employee) {
  const open = state.selectedEmployee === employee.id;
  const events = employeeEvents[employee.id] || [];
  return `<article class="card employee-card ${employee.issue ? 'problem-card' : ''}"><button class="item-button" data-action="open-employee" data-id="${employee.id}" aria-expanded="${open}"><span><strong>${employee.name}</strong><small>${employee.job} · ${employee.site === '–' ? 'heute nicht eingeplant' : `Bau-Nr. ${employee.site}`}</small></span><span>${badge(statusText[employee.status], statusKind[employee.status])}<small>seit ${employee.since}</small></span></button>${open ? `<div class="inline-detail" aria-label="Tagesverlauf ${employee.name}"><h3>Tagesverlauf · ${DEMO_DATE}</h3>${events.length ? `<ol class="timeline">${events.map(event => `<li><time>${event[0]}</time><span><strong>${event[1]}</strong><small>${event[2]} · erfasst durch ${event[3]}</small></span></li>`).join('')}</ol>` : '<p class="empty-note">Heute nicht eingeplant. Es liegen keine Zeitereignisse vor.</p>'}${employee.issue ? '<button class="primary" data-action="navigate" data-view="times">Zeitproblem prüfen</button>' : ''}<p class="meta">Alle Angaben sind erfundene Testdaten.</p></div>` : ''}</article>`;
}

function renderTimes() {
  return `${pageHead('Zeiten prüfen', 'Nur Abweichungen zuerst – vollständige Tage bleiben ruhig im Hintergrund')}<section class="section"><div class="section-title"><h2>2 offene Zeitprobleme</h2><span class="meta">Korrekturen benötigen immer einen Grund</span></div><div class="list">${timeProblems.map(problem => timeProblemCard(problem)).join('')}</div></section><section class="section"><div class="section-title"><h2>Heutiger Überblick</h2><span class="meta">12 Testmitarbeiter</span></div><div class="list">${employees.map(employee => `<article class="card time-card ${employee.issue ? 'problem-card' : ''}"><div class="item-button"><span><strong>${employee.name}</strong><small>${employee.site === '–' ? 'Nicht eingeplant' : `Bau-Nr. ${employee.site}`}</small></span><span>${badge(employee.issue ? 'Prüfung nötig' : statusText[employee.status], employee.issue ? 'problem' : statusKind[employee.status])}<small>${employee.since}</small></span></div></article>`).join('')}</div></section>${state.corrections.length ? `<section class="section"><div class="section-title"><h2>Korrekturverlauf dieser Demo</h2><span class="meta">verschwindet beim Neuladen</span></div><div class="list">${state.corrections.map(correction => `<article class="audit-box"><strong>${correction.editor}</strong><p><strong>Vorher:</strong> ${correction.before}<br><strong>Nachher:</strong> ${correction.after}</p><p><strong>Grund:</strong> ${correction.reason}</p><small>${correction.when} · Original ${correction.problemId} bleibt erhalten</small></article>`).join('')}</div></section>` : ''}`;
}

function timeProblemCard(problem) {
  const corrected = state.corrected[problem.id];
  const editing = state.editProblem === problem.id;
  return `<article class="card time-card ${corrected ? 'resolved-card' : 'problem-card'}"><div class="item-button"><span><strong>${problem.employee}</strong><small>Bau-Nr. ${problem.site} · ${problem.title}</small></span><span>${badge(corrected ? 'Demo-korrigiert' : 'Prüfung nötig', corrected ? 'ok' : 'problem')}</span></div><div class="inline-detail"><p><strong>Aktueller Stand:</strong> ${corrected || problem.original}</p>${!editing ? `<button class="${corrected ? 'secondary' : 'primary'}" data-action="edit-time" data-id="${problem.id}">${corrected ? 'Erneut nachvollziehbar korrigieren' : 'Prüfen und korrigieren'}</button>` : correctionForm(problem)}</div></article>`;
}

function correctionForm(problem) {
  return `<form data-form="time-correction" data-id="${problem.id}"><div class="form-grid"><label>Wirksame Uhrzeit<input name="time" type="time" value="${problem.suggestion}" required></label><label>Bearbeitet durch<select name="editor">${editors.map(editor => `<option>${editor}</option>`).join('')}</select></label><label class="full">Grund der Korrektur<textarea name="reason" required maxlength="300" placeholder="Zum Beispiel: Uhrzeit telefonisch mit Mitarbeiter geklärt"></textarea></label></div><div class="form-actions"><button class="primary">Korrektur protokollieren</button><button class="secondary" type="button" data-action="cancel-time">Abbrechen</button></div><p class="meta">Demo: Das Original wird nicht überschrieben. In der echten App entsteht ein unveränderbarer Eintrag mit Vorher, Nachher, Person und Zeitpunkt.</p></form>`;
}

function renderExtras() {
  const visible = state.extraFilter === 'all' ? extraWorks : extraWorks.filter(item => item.kind === state.extraFilter);
  return `${pageHead('Zusatzarbeiten', 'Zusätzliche Leistungen früh sichern – die kaufmännische Entscheidung bleibt bei dir und dem Büro')}<div class="status-grid"><button class="status-card" data-action="extra-filter" data-filter="new"><strong>4</strong><span><i class="status-dot wait"></i>Neu</span><small>heute gemeldet</small></button><button class="status-card" data-action="extra-filter" data-filter="review"><strong>2</strong><span><i class="status-dot pause"></i>Zu prüfen</span><small>Entscheidung offen</small></button><div class="status-card"><strong>7</strong><span><i class="status-dot"></i>Abgeschlossen</span><small>diese Woche</small></div></div><div class="filter-row section"><button class="filter-button ${state.extraFilter === 'all' ? 'active' : ''}" data-action="extra-filter" data-filter="all">Alle offenen</button><button class="filter-button ${state.extraFilter === 'new' ? 'active' : ''}" data-action="extra-filter" data-filter="new">Neu</button><button class="filter-button ${state.extraFilter === 'review' ? 'active' : ''}" data-action="extra-filter" data-filter="review">Zu prüfen</button></div><div class="list">${visible.map(extraCard).join('')}</div><p class="meta section">Keine automatische Rechnungsfreigabe. Eine „Bestätigung der dokumentierten Zusatzarbeit“ ist keine rechtsverbindliche Abnahme.</p>`;
}

function extraCard(item) {
  return `<article class="card extra-card"><div class="item-top"><span class="build-number">Bau-Nr. ${item.site}</span>${badge(item.status, item.kind === 'new' ? 'problem' : 'warn')}</div><h3>${item.title}</h3><p>${item.siteName}</p><div class="extra-meta"><span>Gemeldet von<strong>${item.employee}</strong></span><span>Zeitpunkt<strong>${item.time}</strong></span><span>Menge<strong>${item.quantity}</strong></span></div>${item.photo ? `<div class="confirmation"><strong>Foto vorhanden</strong><small>Erfundener Bildplatzhalter in der Baustellenmappe</small></div>` : ''}<div class="confirmation"><strong>Bestätigung der dokumentierten Zusatzarbeit</strong><small>${item.confirmation}</small></div><div class="form-actions"><button class="secondary" data-action="open-site-number" data-number="${item.site}">Baustellenmappe öffnen</button><button class="primary" data-action="demo-extra-check" data-id="${item.id}">Als geprüft simulieren</button></div></article>`;
}

function renderWeeks() {
  return `${pageHead('Wochenzettel', 'Offene Prüfungen zuerst; Excel bleibt in V1 bestehen')}<section class="card card-pad"><h2>KW 37 im Überblick</h2><p>3 Wochenzettel benötigen noch Aufmerksamkeit. 1 Beispiel ist bereits freigegeben.</p><p class="meta">Die App soll die doppelte Übertragung von Papier nach Excel später vermeiden. Diese Demo berechnet keine Löhne oder Überstunden.</p></section><div class="list section">${weeks.map(week => `<article class="card week-card"><div class="item-top"><span><strong>${week.employee}</strong><small>${week.week} · ${week.detail}</small></span>${badge(week.status, week.kind)}</div><div class="progress-line ${week.kind === 'warn' ? 'pending' : ''}" aria-label="Beispiel-Vollständigkeit ${week.progress} Prozent"><span style="width:${week.progress}%"></span></div><div class="form-actions"><button class="${week.kind === 'ok' ? 'secondary' : 'primary'}" data-action="review-week" data-id="${week.id}">${week.kind === 'ok' ? 'Freigabe ansehen' : 'Wochenzettel prüfen'}</button></div></article>`).join('')}</div>`;
}

function renderMore() {
  return `${pageHead('Mehr', 'Selten benötigte Bereiche und Demo-Perspektive')}<div class="more-grid"><section class="card more-card"><h2>Demo-Perspektive</h2><p>Wechsle zur einfachen Baustellenansicht für Max.</p><button class="primary" data-action="switch-role" data-role="employee">Als Mitarbeiter ansehen</button></section><section class="card more-card"><h2>Anmeldung</h2><p>So soll die ruhige Maler-Meyer-Anmeldung aussehen.</p><button class="secondary" data-action="show-login">Anmeldeseite ansehen</button></section><section class="card more-card"><h2>Support</h2><p>Rückmeldungen und Hilfefälle – nicht im täglichen Hauptmenü.</p><button class="secondary" data-action="demo-message" data-message="Der Supportbereich ist in dieser Demo nur ein Beispiel.">Support öffnen</button></section><section class="card more-card"><h2>Einstellungen</h2><p>Benutzer, Rechte und betriebliche Einstellungen gehören hierher.</p><button class="secondary" data-action="demo-message" data-message="Einstellungen werden in der öffentlichen Demo nicht gespeichert.">Einstellungen öffnen</button></section></div><details class="developer-area"><summary>Entwickler- und Testinformationen</summary><p>Statische öffentliche Bedienungsdemo ohne Backend, echte Anmeldung oder Produktivdaten. Rollenwechsel und Eingaben sind Simulationen und werden beim Neuladen verworfen.</p><p>Demo-Version 4 · responsive Oberfläche · keine Verbindung zu Maler Meyer.</p></details>`;
}

const employeeSteps = [
  { status: 'Noch nicht gestartet', action: 'ARBEIT STARTEN', log: '07:00 · Arbeit auf Bau-Nr. 25148 gestartet' },
  { status: 'Arbeitet seit 07:00', action: 'PAUSE STARTEN', log: '09:30 · Pause gestartet' },
  { status: 'Pause seit 09:30', action: 'PAUSE BEENDEN', log: '10:00 · Pause beendet' },
  { status: 'Arbeitet auf Bau-Nr. 25148', action: 'BAUSTELLE WECHSELN', log: '12:00 · Bau-Nr. 25148 abgeschlossen, Fahrt begonnen' },
  { status: 'Unterwegs zu Bau-Nr. 25152', action: 'FAHRT BEENDEN · ARBEIT FORTSETZEN', log: '12:20 · Auf Bau-Nr. 25152 angekommen, Arbeit fortgesetzt' },
  { status: 'Arbeitet auf Bau-Nr. 25152', action: 'FEIERABEND', log: '15:00 · Feierabend' },
  { status: 'Feierabend seit 15:00', action: 'BEISPIELTAG ZURÜCKSETZEN', log: '' },
];

function employeeLayout() {
  return `<div class="test-strip">TESTSYSTEM – KEINE PRODUKTIVDATEN <span>Einfacher Beispielablauf für Mitarbeiter.</span></div><div class="main-column"><header class="topbar"><a class="brand" href="#" style="color:var(--navy);margin:0" data-action="employee-home"><span class="brand-mark">MM</span><span><strong style="color:var(--navy)">Maler Meyer</strong><small style="color:var(--muted)">Digitale Baustellenorganisation</small></span></a><button class="profile-button" data-action="employee-more"><span class="avatar">M</span><span class="profile-copy"><strong>Max</strong><small>Mitarbeiter · Demo</small></span></button></header><main id="main-content" class="content" tabindex="-1">${state.view === 'more' ? renderEmployeeMore() : renderEmployeeDay()}</main></div><nav class="mobile-nav" aria-label="Mitarbeiter-Navigation"><button class="nav-button ${state.view !== 'more' ? 'active' : ''}" data-action="employee-home"><span class="nav-icon">H</span><span>Heute</span></button><button class="nav-button" data-action="employee-message" data-message="Zusatzarbeit als Beispiel geöffnet."><span class="nav-icon">+</span><span>Zusatzarbeit</span></button><button class="nav-button" data-action="employee-message" data-message="Notiz und Foto als Beispiel geöffnet."><span class="nav-icon">N</span><span>Notiz</span></button><button class="nav-button ${state.view === 'more' ? 'active' : ''}" data-action="employee-more"><span class="nav-icon">···</span><span>Mehr</span></button></nav>${renderOverlays()}`;
}

function renderEmployeeDay() {
  const step = employeeSteps[state.employeeStep];
  return `<div class="employee-day">${pageHead(greeting('Max'), DEMO_DATE)}<section class="card employee-project"><span class="build-number">Bau-Nr. 25148</span><h2>M&B Schinkel</h2><p>Musterstraße 12 · Beispielstadt</p><div class="employee-status"><small>Dein Status</small><strong>${step.status}</strong></div><button class="primary employee-main-action" data-action="employee-step">${step.action}</button></section>${state.employeeLog.length ? `<section class="section card card-pad"><h2>Heute</h2><ol class="timeline">${state.employeeLog.map(item => `<li><time>${item.slice(0,5)}</time><span><strong>${item.slice(8)}</strong><small>Nur in dieser Demo angezeigt</small></span></li>`).join('')}</ol></section>` : ''}<section class="section"><div class="section-title"><h2>Weitere Aktionen</h2></div><div class="employee-actions"><button class="employee-action" data-action="employee-message" data-message="Zusatzarbeit melden – Beispiel geöffnet.">Zusatzarbeit</button><button class="employee-action" data-action="employee-message" data-message="Notiz oder Foto – Beispiel geöffnet.">Notiz / Foto</button><button class="employee-action" data-action="employee-message" data-message="Korrekturmeldung – Beispiel geöffnet.">Korrektur melden</button><button class="employee-action" data-action="employee-message" data-message="Feedback – Beispiel geöffnet.">Feedback</button></div></section><p class="meta section">Große Hauptaktion, wenige Entscheidungen. Alle Zeiten und Baustellen sind erfunden.</p></div>`;
}

function renderEmployeeMore() {
  return `<div class="employee-day">${pageHead('Mehr', 'Zusätzliche Funktionen')}<div class="more-grid"><section class="card more-card"><h2>Wochenzettel</h2><p>Eigene Beispielwoche ansehen.</p><button class="secondary" data-action="employee-message" data-message="Der eigene Wochenzettel ist in dieser Demo vollständig erfunden.">Ansehen</button></section><section class="card more-card"><h2>Demo-Perspektive</h2><p>Zurück zur Tagesübersicht der Geschäftsführung.</p><button class="primary" data-action="switch-role" data-role="management">Als Geschäftsführung ansehen</button></section></div></div>`;
}

function renderLogin() {
  if (!state.loginPreview) return '';
  return `<div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="login-title"><form class="login-card" data-form="demo-login"><div class="login-brand"><span class="brand-mark">MM</span><h2 id="login-title">Maler Meyer</h2><p>Digitale Baustellenorganisation</p><span class="powered">powered by ShoreLogic</span></div><div class="test-strip" style="border-radius:9px">TESTSYSTEM – KEINE PRODUKTIVDATEN</div><label>Benutzername<input name="username" value="torben-demo" autocomplete="username"></label><label>Passwort<input name="password" type="password" value="beispiel" autocomplete="current-password"></label><label class="checkbox-line"><input type="checkbox" name="shared"><span>Dieses Gerät wird von mehreren Mitarbeitern genutzt</span></label><details class="info-note"><summary>Was bedeutet das?</summary><p>Auf gemeinsam genutzten Geräten soll die echte App schneller sperren und beim Benutzerwechsel eine neue Anmeldung verlangen.</p></details><div class="login-actions"><button class="primary">Demo als Torben öffnen</button><button class="secondary" type="button" data-action="hide-login">Schließen</button></div><p class="meta">Keine echte Anmeldung. Bitte keine echten Zugangsdaten eingeben.</p></form></div>`;
}

function renderOverlays() {
  return `${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ''}${renderLogin()}`;
}

function render() {
  app.innerHTML = state.role === 'management' ? managerLayout() : employeeLayout();
  document.title = state.role === 'management' ? 'Maler Meyer · Heute' : 'Maler Meyer · Mein Tag';
}

function navigate(view) {
  state.view = view;
  state.query = '';
  state.toast = '';
  render();
  document.getElementById('main-content')?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function showToast(message) {
  state.toast = message;
  render();
  window.setTimeout(() => { if (state.toast === message) { state.toast = ''; render(); } }, 2600);
}

app.addEventListener('input', event => {
  if (event.target.id !== 'global-search') return;
  state.query = event.target.value;
  render();
  const input = document.getElementById('global-search');
  input?.focus();
  input?.setSelectionRange(state.query.length, state.query.length);
});

app.addEventListener('submit', event => {
  const form = event.target.closest('form');
  if (!form) return;
  event.preventDefault();
  if (form.dataset.form === 'demo-login') {
    state.loginPreview = false; state.role = 'management'; state.view = 'today'; render(); showToast('Demo geöffnet – keine echte Anmeldung.'); return;
  }
  if (form.dataset.form === 'time-correction') {
    const problem = timeProblems.find(item => item.id === form.dataset.id);
    if (!problem) return;
    const values = new FormData(form);
    const time = values.get('time'); const editor = values.get('editor'); const reason = values.get('reason');
    const before = state.corrected[problem.id] || problem.original;
    const after = `${time} · ${problem.title.replace('fehlt', 'ergänzt')}`;
    state.corrected[problem.id] = after;
    state.corrections.unshift({ problemId: problem.id, before, after, editor, reason, when: new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()) });
    state.editProblem = null; render(); showToast('Demo-Korrektur mit Verlauf ergänzt.');
  }
});

app.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  event.preventDefault();
  const action = target.dataset.action;
  if (action === 'navigate') navigate(target.dataset.view);
  if (action === 'filter-employees') { state.employeeFilter = target.dataset.filter; navigate('employees'); }
  if (action === 'employee-filter') { state.employeeFilter = target.dataset.filter; render(); }
  if (action === 'open-site') { state.selectedSite = state.selectedSite === target.dataset.id ? null : target.dataset.id; state.view = 'sites'; state.query = ''; render(); document.querySelector('.folder-detail')?.scrollIntoView({ block: 'start' }); }
  if (action === 'open-site-number') { const site = siteByNumber(target.dataset.number); if (site) { state.selectedSite = site.id; navigate('sites'); } }
  if (action === 'close-site') { state.selectedSite = null; render(); }
  if (action === 'open-employee') { state.selectedEmployee = state.selectedEmployee === target.dataset.id ? null : target.dataset.id; state.view = 'employees'; state.query = ''; render(); document.querySelector('.inline-detail')?.scrollIntoView({ block: 'nearest' }); }
  if (action === 'edit-time') { state.editProblem = target.dataset.id; render(); document.querySelector('[data-form="time-correction"] textarea')?.focus(); }
  if (action === 'cancel-time') { state.editProblem = null; render(); }
  if (action === 'extra-filter') { state.extraFilter = target.dataset.filter; render(); }
  if (action === 'demo-extra-check') showToast('Nur simuliert: Die kaufmännische Entscheidung bleibt offen.');
  if (action === 'review-week') showToast('Beispiel-Wochenzettel geöffnet – keine Freigabe gespeichert.');
  if (action === 'demo-message') showToast(target.dataset.message);
  if (action === 'show-login') { state.loginPreview = true; render(); document.querySelector('.login-card input')?.focus(); }
  if (action === 'hide-login') { state.loginPreview = false; render(); }
  if (action === 'switch-role') { state.role = target.dataset.role; state.view = 'today'; state.toast = ''; render(); window.scrollTo(0,0); }
  if (action === 'employee-home') navigate('today');
  if (action === 'employee-more') navigate('more');
  if (action === 'employee-message') showToast(target.dataset.message);
  if (action === 'employee-step') {
    if (state.employeeStep === employeeSteps.length - 1) { state.employeeStep = 0; state.employeeLog = []; }
    else { const eventText = employeeSteps[state.employeeStep].log; if (eventText) state.employeeLog.push(eventText); state.employeeStep += 1; }
    render();
  }
});

render();

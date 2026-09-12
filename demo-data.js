'use strict';

(function exposeDemoSeed() {
  const employees = [
    ['M-0001', 'Max Beispiel', 'Mitarbeiter', 'EMPLOYEE', 'NOT_STARTED', '26-101', 'noch nicht'],
    ['M-0002', 'Lena Muster', 'Mitarbeiterin', 'EMPLOYEE', 'NOT_STARTED', '26-102', 'noch nicht'],
    ['M-0003', 'Jan Testmann', 'Vorarbeiter', 'FOREMAN', 'ON_BREAK', '26-103', '12:15'],
    ['M-0004', 'Mia Beispiel', 'Vorarbeiterin', 'FOREMAN', 'ON_BREAK', '26-104', '12:22'],
    ['M-0005', 'Sina Muster', 'Mitarbeiterin', 'EMPLOYEE', 'ON_BREAK', '26-105', '12:18'],
    ['M-0006', 'Lea Beispiel', 'Mitarbeiterin', 'EMPLOYEE', 'TRAVELING', '26-101', '12:08'],
    ['M-0007', 'Tom Test', 'Mitarbeiter', 'EMPLOYEE', 'TRAVELING', '26-104', '11:52'],
    ['M-0008', 'Erika Beispiel', 'Mitarbeiterin', 'EMPLOYEE', 'WORKING', '26-101', '07:05'],
    ['M-0009', 'Luis Muster', 'Auszubildender', 'EMPLOYEE', 'WORKING', '26-101', '07:02'],
    ['M-0010', 'Ben Testmann', 'Mitarbeiter', 'EMPLOYEE', 'WORKING', '26-101', '06:58'],
    ['M-0011', 'Nele Beispiel', 'Mitarbeiterin', 'EMPLOYEE', 'WORKING', '26-102', '07:10'],
    ['M-0012', 'Finn Muster', 'Mitarbeiter', 'EMPLOYEE', 'WORKING', '26-102', '07:01'],
    ['M-0013', 'Sara Beispiel', 'Mitarbeiterin', 'EMPLOYEE', 'WORKING', '26-102', '07:08'],
    ['M-0014', 'Ole Test', 'Mitarbeiter', 'EMPLOYEE', 'WORKING', '26-103', '06:55'],
    ['M-0015', 'Ida Muster', 'Auszubildende', 'EMPLOYEE', 'WORKING', '26-103', '07:12'],
    ['M-0016', 'Noah Beispiel', 'Mitarbeiter', 'EMPLOYEE', 'WORKING', '26-103', '07:04'],
    ['M-0017', 'Emma Test', 'Mitarbeiterin', 'EMPLOYEE', 'WORKING', '26-104', '06:49'],
    ['M-0018', 'Paul Muster', 'Mitarbeiter', 'EMPLOYEE', 'WORKING', '26-104', '07:06'],
    ['M-0019', 'Clara Beispiel', 'Mitarbeiterin', 'EMPLOYEE', 'WORKING', '26-104', '07:03'],
    ['M-0020', 'Jonas Test', 'Mitarbeiter', 'EMPLOYEE', 'WORKING', '26-105', '07:09'],
    ['M-0021', 'Mara Muster', 'Mitarbeiterin', 'EMPLOYEE', 'WORKING', '26-105', '07:00'],
    ['M-0022', 'Theo Beispiel', 'Mitarbeiter', 'EMPLOYEE', 'WORKING', '26-105', '07:11'],
    ['M-0023', 'Greta Test', 'Mitarbeiterin', 'EMPLOYEE', 'WORKING', '26-106', '06:57'],
    ['M-0024', 'Felix Muster', 'Mitarbeiter', 'EMPLOYEE', 'WORKING', '26-106', '07:14'],
    ['M-0025', 'Jule Beispiel', 'Auszubildende', 'EMPLOYEE', 'WORKING', '26-106', '07:16'],
    ['M-0026', 'Nora Test', 'Mitarbeiterin', 'EMPLOYEE', 'NOT_PLANNED', null, '–'],
    ['M-0027', 'Eva Muster', 'Mitarbeiterin', 'EMPLOYEE', 'NOT_PLANNED', null, '–'],
    ['M-0028', 'David Beispiel', 'Mitarbeiter', 'EMPLOYEE', 'FINISHED', '26-102', '15:48'],
    ['M-0029', 'Kai Test', 'Mitarbeiter', 'EMPLOYEE', 'REVIEW', '26-106', '16:00']
  ].map(function (row) {
    return { id: row[0], name: row[1], job: row[2], role: row[3], status: row[4], site: row[5], plannedSite: row[5], since: row[6] };
  });

  const sites = [
    {
      id: 'P-0101', number: '26-101', name: 'Wohnpark Nordblick', customer: 'Nordblick Projektgesellschaft (Beispiel)',
      address: 'Beispielweg 12, 12345 Musterstadt', contact: 'Alex Demo · Bauleitung · 0123 000101',
      access: 'Schlüssel liegt laut Demo-Plan im Büro', dates: '10.–25. September (Beispiel)',
      tasks: ['Treppenhaus vorbereiten', 'Wandflächen spachteln', 'Deckanstrich ausführen'],
      extraTasks: ['Sockelbereich nach Rücksprache prüfen'], materials: ['Abdeckvlies', 'Spachtelmasse', 'Innenfarbe Weiß'],
      status: 'Läuft planmäßig', kind: 'ok', invoice: 'Noch keine Rechnung vorgesehen',
      open: ['Arbeitsbeginn von Max Beispiel fehlt']
    },
    {
      id: 'P-0102', number: '26-102', name: 'Kita Farbklecks', customer: 'Farbklecks Betreuung gGmbH (Beispiel)',
      address: 'Buntstraße 7, 12345 Musterstadt', contact: 'Kim Beispiel · Hausverwaltung · 0123 000102',
      access: 'Zugang ab 06:45 über erfundenen Hausmeisterkontakt', dates: '8.–18. September (Beispiel)',
      tasks: ['Gruppenraum Grün streichen', 'Türzargen lackieren'], extraTasks: [],
      materials: ['Latexfarbe', 'Lack seidenmatt'], status: 'Läuft planmäßig', kind: 'ok',
      invoice: 'Rechnung noch offen', open: ['Wochenzettel von Erika wartet auf Prüfung']
    },
    {
      id: 'P-0103', number: '26-103', name: 'Praxis Lindenbogen', customer: 'Praxisgemeinschaft Lindenbogen (Beispiel)',
      address: 'Lindenbogen 3, 12346 Beispielort', contact: 'Robin Muster · Bauleitung · 0123 000103',
      access: 'Seiteneingang; erfundener Türcode 1010 nur für diese Demo', dates: '9.–22. September (Beispiel)',
      tasks: ['Empfang abkleben', 'Wandflächen vorbereiten', 'Behandlungsraum 2 streichen'],
      extraTasks: ['Feuchtstelle dokumentieren'], materials: ['Grundierung', 'Mineralfarbe', 'Schutzfolie'],
      status: 'Rückfrage offen', kind: 'warn', invoice: 'Zusatzarbeit vor Rechnung prüfen',
      open: ['Feuchtigkeitsschaden im Treppenhaus prüfen']
    },
    {
      id: 'P-0104', number: '26-104', name: 'Stadthaus Morgenrot', customer: 'Morgenrot Verwaltung (Beispiel)',
      address: 'Morgenstraße 18, 12346 Beispielort', contact: 'Sam Demo · Objektbetreuung · 0123 000104',
      access: 'Zugang über fiktiven Innenhof', dates: '7.–28. September (Beispiel)',
      tasks: ['Fassade Nordseite', 'Fensterlaibungen'], extraTasks: ['Zweite Anfahrt dokumentieren'],
      materials: ['Fassadenfarbe', 'Armierungsgewebe'], status: 'Umplanung erfolgt', kind: 'warn',
      invoice: 'Noch in Arbeit', open: ['Lea Beispiel ist auf dem Weg von 26-101']
    },
    {
      id: 'P-0105', number: '26-105', name: 'Bürohaus Westtor', customer: 'Westtor Büroservice (Beispiel)',
      address: 'Westtor 21, 12347 Demostadt', contact: 'Taylor Test · Ansprechpartner · 0123 000105',
      access: 'Anmeldung am erfundenen Empfang', dates: '10.–16. September (Beispiel)',
      tasks: ['Besprechungsraum', 'Flur Ost'], extraTasks: [], materials: ['Dispersionsfarbe', 'Malervlies'],
      status: 'Läuft planmäßig', kind: 'ok', invoice: 'Noch in Arbeit', open: []
    },
    {
      id: 'P-0106', number: '26-106', name: 'Quartier Sonnenrain', customer: 'Sonnenrain Wohnen (Beispiel)',
      address: 'Sonnenrain 5, 12347 Demostadt', contact: 'Charlie Beispiel · Bauleitung · 0123 000106',
      access: 'Containerbüro, rein erfundene Zugangsinformation', dates: '1.–30. September (Beispiel)',
      tasks: ['Hausflur B', 'Wohnung 2.4'], extraTasks: ['Untergrund in Wohnung 2.4 prüfen'],
      materials: ['Tiefengrund', 'Innenfarbe'], status: 'Zeitprüfung nötig', kind: 'problem',
      invoice: 'Rechnung noch offen', open: ['Feierabendbuchung ohne Arbeitsbeginn bei Kai Test']
    }
  ];

  const assignments = employees.filter(function (employee) { return employee.plannedSite; }).map(function (employee) {
    return { employeeId: employee.id, site: employee.plannedSite, originalSite: employee.id === 'M-0006' ? '26-101' : null, changedBy: employee.id === 'M-0006' ? 'Torben · Geschäftsführung' : null, changedAt: employee.id === 'M-0006' ? '06:42' : null, note: employee.id === 'M-0006' ? 'Kurzfristiger Wechsel zu Bau-Nr. 26-104' : '' };
  });

  const events = [];
  employees.forEach(function (employee, index) {
    if (employee.status === 'WORKING' || employee.status === 'ON_BREAK' || employee.status === 'TRAVELING' || employee.status === 'FINISHED') {
      events.push({ id: 'E-START-' + employee.id, employeeId: employee.id, type: 'WORK_START', time: index % 3 === 0 ? '06:55' : index % 3 === 1 ? '07:05' : '07:10', site: employee.site, createdBy: employee.id, createdFor: employee.id, note: '' });
    }
  });
  events.push(
    { id: 'E-PAUSE-JAN', employeeId: 'M-0003', type: 'BREAK_START', time: '12:15', site: '26-103', createdBy: 'M-0003', createdFor: 'M-0003', note: '' },
    { id: 'E-PAUSE-MIA', employeeId: 'M-0004', type: 'BREAK_START', time: '12:22', site: '26-104', createdBy: 'M-0004', createdFor: 'M-0004', note: '' },
    { id: 'E-PAUSE-SINA', employeeId: 'M-0005', type: 'BREAK_START', time: '12:18', site: '26-105', createdBy: 'M-0005', createdFor: 'M-0005', note: '' },
    { id: 'E-LEAVE-LEA', employeeId: 'M-0006', type: 'SITE_LEAVE', time: '12:08', site: '26-101', createdBy: 'M-0006', createdFor: 'M-0006', note: '' },
    { id: 'E-TRAVEL-LEA', employeeId: 'M-0006', type: 'TRAVEL_START', time: '12:08', site: '26-104', fromSite: '26-101', createdBy: 'M-0006', createdFor: 'M-0006', note: 'Fahrzeit wird nur als Rohereignis gezeigt.' },
    { id: 'E-LEAVE-TOM', employeeId: 'M-0007', type: 'SITE_LEAVE', time: '11:52', site: '26-104', createdBy: 'M-0007', createdFor: 'M-0007', note: '' },
    { id: 'E-TRAVEL-TOM', employeeId: 'M-0007', type: 'TRAVEL_START', time: '11:52', site: '26-105', fromSite: '26-104', createdBy: 'M-0007', createdFor: 'M-0007', note: 'Fahrzeit wird nicht lohntechnisch bewertet.' },
    { id: 'E-END-DAVID', employeeId: 'M-0028', type: 'WORK_END', time: '15:48', site: '26-102', createdBy: 'M-0028', createdFor: 'M-0028', note: '' },
    { id: 'E-END-KAI', employeeId: 'M-0029', type: 'WORK_END', time: '16:00', site: '26-106', createdBy: 'M-0029', createdFor: 'M-0029', note: 'Arbeitsbeginn fehlt; nicht automatisch korrigiert.' }
  );

  const notes = [
    { id: 'N-101', site: '26-101', author: 'Erika Beispiel', time: '08:10', category: 'Fortschritt', text: 'Untergrund im Treppenhaus geprüft.', photo: null },
    { id: 'N-102', site: '26-101', author: 'Luis Muster', time: '10:35', category: 'Allgemein', text: 'Materiallieferung für Freitag bestätigt.', photo: null },
    { id: 'N-103-A', site: '26-103', author: 'Jan Testmann', time: '07:18', category: 'Fortschritt', text: 'Empfangsbereich vollständig abgeklebt.', photo: 'Empfangsbereich vor Arbeitsbeginn' },
    { id: 'N-103-B', site: '26-103', author: 'Ole Test', time: '09:46', category: 'Problem / Schaden', text: 'Feuchtigkeitsschaden im Treppenhaus entdeckt und dokumentiert.', photo: 'Synthetische Feuchtstelle im Treppenhaus' },
    { id: 'N-103-C', site: '26-103', author: 'Jan Testmann', time: '10:12', category: 'Kunden-/Bauleiterabsprache', text: 'Beispielhafte Bauleitung wurde informiert; Rückmeldung steht aus.', photo: null },
    { id: 'N-104', site: '26-104', author: 'Mia Beispiel', time: '08:22', category: 'Fortschritt', text: 'Nordseite vorbereitet.', photo: null },
    { id: 'N-105', site: '26-105', author: 'Sina Muster', time: '11:05', category: 'Allgemein', text: 'Besprechungsraum kann am Nachmittag gestrichen werden.', photo: null }
  ];

  const extras = [
    { id: 'ZA-201', site: '26-103', employeeId: 'M-0014', reportedAt: 'Heute · 09:52', description: 'Zusätzlich 12 m² Wandfläche gespachtelt.', quantity: '12', unit: 'm²', minutes: '70', photo: 'Zusätzliche Wandfläche', confirmation: 'Dokumentierte Bestätigung vorhanden · Robin Muster, Bauleitung (synthetisch)', docStatus: 'COMPLETE', commercialStatus: 'OPEN', decisionReason: '', history: ['09:52 · von Ole Test gemeldet', '10:04 · dokumentierte Bestätigung ergänzt'] },
    { id: 'ZA-202', site: '26-101', employeeId: 'M-0008', reportedAt: 'Heute · 09:42', description: 'Zusätzliche Spachtelarbeiten im Eingangsbereich.', quantity: '18', unit: 'm²', minutes: '', photo: 'Eingangsbereich', confirmation: 'Noch keine Bestätigung', docStatus: 'REPORTED', commercialStatus: 'OPEN', decisionReason: '', history: ['09:42 · von Erika Beispiel gemeldet'] },
    { id: 'ZA-203', site: '26-102', employeeId: 'M-0011', reportedAt: 'Heute · 10:18', description: 'Vier zusätzliche Türzargen lackiert.', quantity: '4', unit: 'Stück', minutes: '95', photo: null, confirmation: 'Dokumentierte Bestätigung vorhanden · Kim Beispiel (synthetisch)', docStatus: 'COMPLETE', commercialStatus: 'BILLING', decisionReason: 'Beispielhaft zur Abrechnung vorgesehen', history: ['10:18 · gemeldet', '11:05 · kaufmännisch geprüft durch Sabine Beispiel'] },
    { id: 'ZA-204', site: '26-104', employeeId: 'M-0017', reportedAt: 'Gestern · 14:20', description: 'Beschädigte Abdeckung neu hergestellt.', quantity: '1', unit: 'Pauschale', minutes: '35', photo: null, confirmation: 'Bauleitung wurde informiert', docStatus: 'COMPLETE', commercialStatus: 'NOT_BILLABLE', decisionReason: 'Beispielentscheidung: Eigenleistung zur Mängelbeseitigung', history: ['Gestern 14:20 · gemeldet', 'Heute 08:15 · als nicht abrechenbar markiert; Vorgang bleibt erhalten'] },
    { id: 'ZA-205', site: '26-105', employeeId: 'M-0020', reportedAt: 'Heute · 11:34', description: 'Zusätzlicher zweiter Deckenanstrich.', quantity: '45', unit: 'm²', minutes: '', photo: 'Deckenfläche', confirmation: 'Noch keine Bestätigung', docStatus: 'REPORTED', commercialStatus: 'OPEN', decisionReason: '', history: ['11:34 · von Jonas Test gemeldet'] },
    { id: 'ZA-206', site: '26-106', employeeId: 'M-0023', reportedAt: 'Heute · 08:52', description: 'Sockelleisten im Hausflur ergänzt.', quantity: '23', unit: 'm', minutes: '60', photo: null, confirmation: 'Bestätigung noch offen', docStatus: 'REVIEW', commercialStatus: 'OPEN', decisionReason: '', history: ['08:52 · von Greta Test gemeldet', '09:10 · Dokumentation zur Prüfung markiert'] },
    { id: 'ZA-207', site: '26-101', employeeId: 'M-0009', reportedAt: 'Gestern · 14:21', description: 'Schutzabdeckung im Eingangsbereich erweitert.', quantity: '12', unit: 'm²', minutes: '25', photo: null, confirmation: 'Dokumentierte Bestätigung vorhanden', docStatus: 'COMPLETE', commercialStatus: 'CLOSED', decisionReason: 'Beispielhaft abgeschlossen', history: ['Gestern 14:21 · gemeldet', 'Heute 07:40 · abgeschlossen'] }
  ];

  const correctionRequests = [
    { id: 'KR-001', employeeId: 'M-0001', date: '10.09.', site: '26-101', type: 'Fehlender Arbeitsbeginn', description: 'Arbeitsbeginn heute war 07:05, ich habe das Starten vergessen.', original: 'Kein Arbeitsbeginn vorhanden', suggestion: '07:05', status: 'OPEN', createdAt: '08:14' },
    { id: 'KR-002', employeeId: 'M-0029', date: '10.09.', site: '26-106', type: 'Fehlender Arbeitsbeginn', description: 'Feierabend um 16:00 gebucht, Arbeitsbeginn fehlt.', original: 'WORK_END 16:00 ohne WORK_START', suggestion: '07:08', status: 'OPEN', createdAt: '16:04' },
    { id: 'KR-003', employeeId: 'M-0013', date: '09.09.', site: '26-102', type: 'Falsche Baustelle', description: 'Vormittag war versehentlich 26-101 zugeordnet.', original: '07:08 · Bau-Nr. 26-101', suggestion: '07:08 · Bau-Nr. 26-102', status: 'RESOLVED', createdAt: '09.09. · 15:31' }
  ];

  const corrections = [
    { id: 'K-003', requestId: 'KR-003', employeeId: 'M-0013', before: '07:08 · Bau-Nr. 26-101', after: '07:08 · Bau-Nr. 26-102', editor: 'Sabine Beispiel · Büro', when: '09.09. · 16:02', reason: 'Baustellenbezug nach Rückfrage korrigiert; Testfall.' }
  ];

  const completeDays = [
    { day: 'Mo', date: '07.09.', site: '26-101', start: '07:03', break: '00:30', end: '16:01', travel: '–', issue: '' },
    { day: 'Di', date: '08.09.', site: '26-101', start: '07:00', break: '00:31', end: '15:58', travel: '–', issue: '' },
    { day: 'Mi', date: '09.09.', site: '26-102', start: '07:08', break: '00:29', end: '16:05', travel: '00:24', issue: '' },
    { day: 'Do', date: '10.09.', site: '26-102', start: '07:05', break: '00:30', end: '16:00', travel: '–', issue: '' },
    { day: 'Fr', date: '11.09.', site: '26-103', start: '07:02', break: '00:30', end: '13:10', travel: '–', issue: '' }
  ];
  const weeklySheets = [
    { id: 'W-001', employeeId: 'M-0001', week: 'KW 37', status: 'NEEDS_CORRECTION', version: 1, days: completeDays.map(function (day, i) { return i === 3 ? Object.assign({}, day, { start: '–', issue: 'Arbeitsbeginn fehlt' }) : Object.assign({}, day); }), history: ['Entwurf aus Zeitereignissen erstellt'] },
    { id: 'W-008', employeeId: 'M-0008', week: 'KW 37', status: 'EMPLOYEE_CONFIRMED', version: 1, days: completeDays.map(function (day) { return Object.assign({}, day); }), history: ['Erika Beispiel hat Version 1 bestätigt'] },
    { id: 'W-003', employeeId: 'M-0003', week: 'KW 37', status: 'DRAFT', version: 1, days: completeDays.map(function (day) { return Object.assign({}, day, { site: '26-103' }); }), history: ['Entwurf aus Zeitereignissen erstellt'] },
    { id: 'W-004', employeeId: 'M-0004', week: 'KW 37', status: 'ADMIN_APPROVED', version: 1, days: completeDays.map(function (day) { return Object.assign({}, day, { site: '26-104' }); }), history: ['Mia Beispiel hat bestätigt', 'Sabine Beispiel · Büro hat Version 1 freigegeben'] },
    { id: 'W-013', employeeId: 'M-0013', week: 'KW 37', status: 'NEEDS_REVIEW', version: 2, days: completeDays.map(function (day) { return Object.assign({}, day); }), history: ['Version 1 von Sara Beispiel bestätigt', 'Baustellenbezug wurde durch Sabine Beispiel korrigiert', 'Version 2 erzeugt; erneute Prüfung erforderlich'] }
  ];

  const documents = [
    { id: 'D-103-1', site: '26-103', type: 'Auftrag / Angebot', title: 'Beispielauftrag Praxis Lindenbogen', status: 'Synthetischer Platzhalter' },
    { id: 'D-103-2', site: '26-103', type: 'Baubesprechungsprotokoll', title: 'Besprechung vom 09.09. (Demo)', status: 'Spätere Ausbaustufe' },
    { id: 'D-103-3', site: '26-103', type: 'Aufmaß', title: 'Aufmaß Behandlungsräume (Demo)', status: 'Spätere Ausbaustufe' }
  ];

  const audit = [
    { id: 'A-001', type: 'PLAN_CHANGED', entity: 'M-0006', title: 'Tagesplanung geändert', before: 'Bau-Nr. 26-101', after: 'Bau-Nr. 26-104', actor: 'Torben · Geschäftsführung', time: '06:42', reason: 'Kurzfristige Umplanung – synthetischer Testfall' },
    { id: 'A-002', type: 'TIME_CORRECTED', entity: 'M-0013', title: 'Baustellenbezug korrigiert', before: 'Bau-Nr. 26-101', after: 'Bau-Nr. 26-102', actor: 'Sabine Beispiel · Büro', time: '09.09. · 16:02', reason: 'Nach Rückfrage korrigiert' },
    { id: 'A-003', type: 'EXTRA_DECIDED', entity: 'ZA-204', title: 'Zusatzarbeit kaufmännisch geprüft', before: 'Prüfung offen', after: 'Nicht abrechenbar', actor: 'Torben · Geschäftsführung', time: '08:15', reason: 'Synthetische Beispielentscheidung' }
  ];

  window.DEMO_DATA_VERSION = 6;
  window.createDemoSeed = function createDemoSeed() {
    return JSON.parse(JSON.stringify({
      employees: employees,
      sites: sites,
      assignments: assignments,
      events: events,
      notes: notes,
      extras: extras,
      correctionRequests: correctionRequests,
      corrections: corrections,
      weeklySheets: weeklySheets,
      documents: documents,
      audit: audit
    }));
  };
}());

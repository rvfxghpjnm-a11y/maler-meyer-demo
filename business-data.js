'use strict';

(function enrichSyntheticDemo() {
  const baseFactory = window.createDemoSeed;
  const siteNumbers = ['26-101', '26-102', '26-103', '26-104', '26-105', '26-106'];
  const siteNames = {
    '26-101': 'Wohnpark Nordblick', '26-102': 'Kita Farbklecks', '26-103': 'Praxis Lindenbogen',
    '26-104': 'Stadthaus Morgenrot', '26-105': 'Bürohaus Westtor', '26-106': 'Quartier Sonnenrain'
  };
  const materials = [
    ['Abdeckpapier', 'Rolle'], ['Abdeckvlies', 'Rolle'], ['Klebeband 30 mm', 'Rolle'],
    ['Klebeband 50 mm', 'Rolle'], ['Schutzfolie 55 cm', 'Rolle'], ['Schutzfolie 140 cm', 'Rolle'],
    ['Innenfarbe weiss', 'Eimer / 15 l'], ['Innenfarbe altweiss', 'Eimer / 15 l'],
    ['Fassadenfarbe', 'Eimer / 15 l'], ['Tiefengrund', 'Liter'], ['Malervlies', 'Rolle'],
    ['Vlieskleber', 'Eimer / 18 kg'], ['Gewebekleber', 'Eimer / 18 kg'],
    ['Fuellspachtel', 'Sack / 25 kg'], ['Faserverstaerkter Spachtel', 'Sack / 25 kg'],
    ['Acryl-Dichtstoff', 'Kartusche'], ['Silikon', 'Kartusche'], ['Eckschutzschiene', 'Stueck'],
    ['Isolierspray', 'Dose'], ['Universalreiniger', 'Liter']
  ];

  function isoDate(date) {
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function buildMonthHistory(employees) {
    const rows = [];
    const start = new Date(2026, 7, 3);
    const end = new Date(2026, 8, 11);
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      employees.forEach(function (employee, index) {
        const dayIndex = Math.floor((date - start) / 86400000);
        if ((index + dayIndex) % 19 === 0) {
          rows.push({ date: isoDate(date), employeeId: employee.id, marker: 'U', site: '', start: '', breakMinutes: 0, end: '', travelMinutes: 0, acceptedMinutes: null, issue: '' });
          return;
        }
        if ((index + dayIndex) % 23 === 0) {
          rows.push({ date: isoDate(date), employeeId: employee.id, marker: 'K', site: '', start: '', breakMinutes: 0, end: '', travelMinutes: 0, acceptedMinutes: null, issue: '' });
          return;
        }
        const site = siteNumbers[(index + Math.floor(dayIndex / 5)) % siteNumbers.length];
        const startMinute = 6 * 60 + 50 + ((index * 7 + dayIndex) % 25);
        const workMinutes = date.getDay() === 5 ? 360 + (index % 3) * 10 : 500 + ((index + dayIndex) % 4) * 5;
        const pauseMinutes = date.getDay() === 5 ? 20 : 30 + ((index + dayIndex) % 3);
        const travelMinutes = (index + dayIndex) % 11 === 0 ? 24 + (index % 4) * 6 : 0;
        const finishMinute = startMinute + workMinutes + pauseMinutes;
        const toTime = function (minutes) { return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0'); };
        rows.push({
          date: isoDate(date), employeeId: employee.id, marker: '', site: site,
          start: toTime(startMinute), breakMinutes: pauseMinutes, end: toTime(finishMinute),
          travelMinutes: travelMinutes, acceptedMinutes: workMinutes, issue: (employee.id === 'M-0001' && isoDate(date) === '2026-09-10') ? 'Arbeitsbeginn fehlt' : ''
        });
      });
    }
    return rows;
  }

  function weekPlan(employees, week, monday) {
    return {
      week: week,
      monday: monday,
      rows: employees.map(function (employee, index) {
        const values = [];
        for (let d = 0; d < 6; d += 1) {
          if ((index + week + d) % 31 === 0) values.push('Krank');
          else if ((index + week + d) % 29 === 0) values.push('Urlaub');
          else values.push(siteNumbers[(index + Math.floor(d / 2) + week) % siteNumbers.length]);
        }
        return { employeeId: employee.id, values: values, group: /Auszubild/.test(employee.job) ? 'Auszubildende / Praktikum' : 'Mitarbeiter' };
      }).concat([
        { employeeId: 'SUB-01', displayName: 'Team Ausbau Beispiel', values: ['26-104', '26-104', '26-104', '26-105', '26-105', ''], group: 'Subunternehmer' },
        { employeeId: 'SUB-02', displayName: 'Montage Demo', values: ['26-106', '26-106', '', '26-103', '26-103', ''], group: 'Subunternehmer' }
      ])
    };
  }

  window.createDemoSeed = function createExpandedDemoSeed() {
    const db = baseFactory();
    db.monthHistory = buildMonthHistory(db.employees);
    db.weekPlans = [weekPlan(db.employees, 34, '2026-08-17'), weekPlan(db.employees, 35, '2026-08-24'), weekPlan(db.employees, 36, '2026-08-31'), weekPlan(db.employees, 37, '2026-09-07')];
    const weekStarts = { 34: '2026-08-17', 35: '2026-08-24', 36: '2026-08-31' };
    [34, 35, 36].forEach(function (week) {
      db.employees.slice(0, 8).forEach(function (person, personIndex) {
        const monday = new Date(weekStarts[week] + 'T12:00:00');
        const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr'].map(function (label, dayIndex) {
          const date = new Date(monday); date.setDate(date.getDate() + dayIndex);
          const record = db.monthHistory.find(function (item) { return item.employeeId === person.id && item.date === isoDate(date); });
          return {
            day: label, date: String(date.getDate()).padStart(2, '0') + '.' + String(date.getMonth() + 1).padStart(2, '0') + '.',
            site: record && record.site ? record.site : (record && record.marker ? record.marker : '–'), start: record ? record.start || '–' : '–',
            break: record && record.breakMinutes ? '00:' + String(record.breakMinutes).padStart(2, '0') : '–', end: record ? record.end || '–' : '–',
            travel: record && record.travelMinutes ? '00:' + String(record.travelMinutes).padStart(2, '0') : '–',
            issue: personIndex === 1 && week === 35 && dayIndex === 2 ? 'Ende fehlt' : ''
          };
        });
        db.weeklySheets.push({ id: 'W-' + week + '-' + person.id, employeeId: person.id, week: 'KW ' + week, status: personIndex === 1 && week === 35 ? 'NEEDS_CORRECTION' : (personIndex + week) % 3 === 0 ? 'EMPLOYEE_CONFIRMED' : 'ADMIN_APPROVED', version: 1, days: days, history: ['Synthetischer Wochenverlauf aus Zeitereignissen erzeugt'] });
      });
    });
    db.materialCatalog = materials.map(function (row, index) { return { id: 'MAT-' + String(index + 1).padStart(3, '0'), article: row[0], unit: row[1] }; });
    db.materialRequests = [
      { id: 'MA-101', site: '26-101', date: '2026-09-09', requestedBy: 'M-0008', items: [{ article: 'Abdeckvlies', unit: 'Rolle', quantity: 4 }, { article: 'Fuellspachtel', unit: 'Sack / 25 kg', quantity: 2 }] },
      { id: 'MA-103', site: '26-103', date: '2026-09-10', requestedBy: 'M-0014', items: [{ article: 'Tiefengrund', unit: 'Liter', quantity: 12 }, { article: 'Schutzfolie 140 cm', unit: 'Rolle', quantity: 3 }] }
    ];
    db.materialUsage = [
      { id: 'ME-101', site: '26-101', date: '2026-09-10', article: 'Innenfarbe weiss', color: 'Reinweiss (Demo)', place: 'Treppenhaus, 1. OG' },
      { id: 'ME-103', site: '26-103', date: '2026-09-10', article: 'Tiefengrund', color: 'Farblos', place: 'Empfang und Flur' },
      { id: 'ME-104', site: '26-104', date: '2026-09-09', article: 'Fassadenfarbe', color: 'Sandgrau (Demo)', place: 'Nordfassade' }
    ];
    db.restTasks = [
      { id: 'RT-101', site: '26-101', date: '2026-09-10', author: 'Erika Beispiel', category: 'Restarbeit', area: 'Treppenhaus', description: 'Sockelbereich nach Ruecksprache fertigstellen.', status: 'OFFEN', history: ['10.09. · von Erika Beispiel angelegt'] },
      { id: 'RT-103', site: '26-103', date: '2026-09-10', author: 'Jan Testmann', category: 'Problem', area: 'Flur', description: 'Feuchtstelle vor Folgearbeit pruefen.', status: 'OFFEN', history: ['10.09. · von Jan Testmann angelegt'] },
      { id: 'RT-105', site: '26-105', date: '2026-09-09', author: 'Jonas Test', category: 'Restarbeit', area: 'Besprechungsraum', description: 'Abdeckungen entfernen und Raum uebergeben.', status: 'ERLEDIGT', history: ['09.09. · angelegt', '10.09. · erledigt durch Jonas Test'] }
    ];
    db.measurements = [
      { site: '26-103', floor: 'EG', apartment: 'Empfang', length: 8.4, width: 5.2, height: 3.1, sum: 84.3, deductions: 9.6, mass: 74.7 },
      { site: '26-103', floor: 'EG', apartment: 'Flur', length: 11.2, width: 2.1, height: 3.1, sum: 82.5, deductions: 7.2, mass: 75.3 }
    ];
    db.protocols = [{ id: 'BP-103-01', site: '26-103', date: '2026-09-09', participants: ['Jan Testmann', 'Robin Muster (synthetisch)'], text: 'Arbeitsreihenfolge und Zugang zum Empfang wurden abgestimmt. Feuchtstelle wird vor dem Folgeanstrich geprueft.' }];
    db.leaveRequests = [
      { id: 'U-001', employeeId: 'M-0011', from: '2026-10-05', to: '2026-10-09', days: 5, status: 'OFFEN' },
      { id: 'U-002', employeeId: 'M-0024', from: '2026-09-21', to: '2026-09-23', days: 3, status: 'DEMO_GENEHMIGT' }
    ];
    db.invoiceTasks = [
      ['2026-08-14', '26-101', 'Wohnpark Nordblick', 'Erika Beispiel', 'OFFEN', 'Zusatzarbeit pruefen'],
      ['2026-08-20', '26-102', 'Kita Farbklecks', 'Nele Beispiel', 'VORBEREITUNG', 'Unterlagen kommen'],
      ['2026-08-27', '26-103', 'Praxis Lindenbogen', 'Jan Testmann', 'RUECKFRAGE', 'Dokumentation ergaenzen'],
      ['2026-09-02', '26-104', 'Stadthaus Morgenrot', 'Mia Beispiel', 'GESCHRIEBEN', 'Demo-Rechnung erfasst'],
      ['2026-09-04', '26-105', 'Buerohaus Westtor', 'Jonas Test', 'VORBEREITUNG', 'Wochenzettel abwarten'],
      ['2026-09-10', '26-106', 'Quartier Sonnenrain', 'Greta Test', 'OFFEN', 'Zeitpruefung offen']
    ].map(function (row, index) { return { id: 'RS-' + (index + 1), date: row[0], site: row[1], project: row[2], employee: row[3], status: row[4], note: row[5] }; });
    db.billingRecords = [
      { site: '26-101', date: '2026-08-28', reference: 'DEMO-R-26081', net: 4200 },
      { site: '26-103', date: '2026-09-04', reference: 'DEMO-R-26094', net: 6750 },
      { site: '26-104', date: '2026-09-08', reference: 'DEMO-R-26102', net: 5300 }
    ];
    db.supplierInvoices = [
      { id: 'LR-001', supplier: 'Farbenhandel Beispiel GmbH', invoiceNumber: 'DEMO-L-80421', invoiceDate: '2026-09-05', site: '26-103', net: 486.40, vat: 92.42, total: 578.82, status: 'ZUGEORDNET' },
      { id: 'LR-002', supplier: 'Baustoffe Muster KG', invoiceNumber: 'DEMO-L-80439', invoiceDate: '2026-09-09', site: '', net: 219.60, vat: 41.72, total: 261.32, status: 'ZUORDNUNG_OFFEN' }
    ];
    db.projectAccounts = db.sites.map(function (project, index) {
      const planned = 180 + index * 34;
      const accepted = 126 + index * 29;
      return {
        site: project.number, project: project.name, manager: ['Tina Demo', 'Robin Beispiel', 'Sam Muster'][index % 3],
        offerNet: 18500 + index * 6400, plannedHours: planned, acceptedHours: accepted,
        travelHoursRaw: 4.5 + index * 1.25, traineeHours: 12 + index * 3,
        materials: 1820 + index * 390, lift: index % 2 ? 760 : 0, subcontractor: index === 4 ? 2400 : 0,
        tempStaff: index === 5 ? 1320 : 0, scaffoldWaste: 380 + index * 95, other: 120 + index * 40,
        carryover: index === 0 ? 950 : 0
      };
    });
    db.documents = db.sites.flatMap(function (project) {
      return [
        { id: 'D-' + project.number + '-AZ', site: project.number, type: 'Arbeitszettel', title: 'Arbeitszettel ' + project.name, status: 'Druckbereit' },
        { id: 'D-' + project.number + '-MA', site: project.number, type: 'Materialanforderung', title: 'Materialanforderung ' + project.name, status: 'Druckbereit' },
        { id: 'D-' + project.number + '-ME', site: project.number, type: 'Materialeinsatz', title: 'Materialeinsatz ' + project.name, status: 'Druckbereit' },
        { id: 'D-' + project.number + '-AU', site: project.number, type: 'Aufmass', title: 'Aufmass ' + project.name, status: 'Druckbereit' },
        { id: 'D-' + project.number + '-BP', site: project.number, type: 'Baubesprechungsprotokoll', title: 'Baubesprechungsprotokoll ' + project.name, status: 'Druckbereit' }
      ];
    });
    return db;
  };
  window.DEMO_DATA_VERSION = 7;
}());


'use strict';

// A deliberately synthetic, opt-in practice case. It is local to one browser.
// It does not import any source workbook or represent a production migration.
(function exposePilotScenario() {
  const SCENARIO_ID = 'TORBEN-PRAXISTEST-01';
  const NAMES = ['Stefan Eins (Demo)', 'Stefan Zwei (Demo)'];
  const PROJECT_NAME = 'Projekt Stephan (Demo)';
  const STAMP = '14.09.2026 · 08:00 Uhr · synthetischer Praxistest';

  function nextEmployeeId(employees) {
    const highest = employees.reduce(function (max, employee) {
      return Math.max(max, Number(String(employee.id || '').replace(/\D/g, '')) || 0);
    }, 0);
    return 'M-' + String(highest + 1).padStart(4, '0');
  }

  function addAudit(db, type, entity, title, after) {
    db.audit.unshift({ id: SCENARIO_ID + '-' + type, type: type, entity: entity,
      title: title, before: '–', after: after, actor: 'Torben · synthetischer Praxistest',
      time: STAMP, reason: 'Einmalig ladbarer Testfall; keine Produktivdaten' });
  }

  function install(db) {
    if (db.pilotScenario && db.pilotScenario.id === SCENARIO_ID) {
      return { created: false, scenario: db.pilotScenario };
    }
    const number = window.MMProjectAdmin.nextNumber(db.sites, 2026);
    if (!number) throw new Error('Für 2026 ist keine freie Demo-Bau-Nr. verfügbar.');
    const firstId = nextEmployeeId(db.employees);
    const ids = [firstId, 'M-' + String(Number(firstId.slice(2)) + 1).padStart(4, '0')];
    const project = {
      id: 'P-' + number.replace(/\D/g, ''), number: number, name: PROJECT_NAME,
      customer: 'Auftraggeber Muster (Demo)', address: 'Demoweg 1, 12345 Musterstadt',
      contact: 'Kontaktperson Beispiel · Bauleitung (Demo)', manager: 'Torben · Demo',
      access: 'Zugang über Büro klären (Demo)', siteLead: 'Kontaktperson Beispiel',
      plannedStart: '2026-09-14', plannedEnd: '2026-09-18', dates: '14.09.2026 bis 18.09.2026',
      description: 'Zwei Räume vorbereiten und streichen. Frei erfundener Vergleichsfall.',
      tasks: ['Raum A abdecken', 'Raum A und B streichen'], extraTasks: [],
      materials: ['Abdeckvlies · 3 Rollen'], invoice: 'Rechnungseintrag nur als Demo-Beispiel',
      internalNote: 'Praxistest: alle Beträge und Stunden sind frei erfunden.',
      offerNet: 6000, plannedHours: 100, status: 'Praxistest', kind: 'ok', open: [], active: true
    };
    db.sites.push(project);
    db.projectAccounts.push({ site: number, project: PROJECT_NAME, manager: project.manager,
      offerNet: 6000, plannedHours: 100, acceptedHours: 0, travelHoursRaw: 0,
      traineeHours: 0, materials: 0, lift: 0, subcontractor: 0, tempStaff: 0,
      scaffoldWaste: 0, other: 0, carryover: 0 });
    ['Arbeitszettel', 'Materialanforderung', 'Materialeinsatz', 'Aufmass', 'Baubesprechungsprotokoll'].forEach(function (type, index) {
      db.documents.push({ id: 'D-' + number + '-PILOT-' + index, site: number,
        type: type, title: type + ' ' + PROJECT_NAME, status: 'Druckbereit' });
    });
    NAMES.forEach(function (name, index) {
      db.employees.push({ id: ids[index], name: name, job: 'Mitarbeiter', role: 'EMPLOYEE',
        status: 'NOT_PLANNED', site: null, plannedSite: null, since: '–', active: true,
        createdAt: STAMP, createdBy: 'Torben · Demo' });
      addAudit(db, 'EMPLOYEE_CREATED_' + index, ids[index], 'Mitarbeiter angelegt', name);
    });
    db.weekPlans.forEach(function (week) {
      NAMES.forEach(function (_, index) {
        const values = week.monday === '2026-09-14' ? [number, number, '', '', '', ''] : ['', '', '', '', '', ''];
        week.rows.push({ employeeId: ids[index], values: values.slice(), group: 'Mitarbeiter' });
        if (week.publishedRows) week.publishedRows.push({ employeeId: ids[index], values: values.slice(), group: 'Mitarbeiter' });
      });
    });
    ['2026-09-14', '2026-09-15'].forEach(function (date) {
      ids.forEach(function (employeeId) {
        db.monthHistory.push({ date: date, employeeId: employeeId, marker: '', site: number,
          start: '08:00', breakMinutes: 30, end: '12:30', travelMinutes: 30,
          acceptedMinutes: 240, issue: '' });
      });
    });
    [
      ['REQUEST', 'NEW', 'Material angefordert'],
      ['WITHDRAWAL', 'RECORDED', 'Aus Firma entnommen'],
      ['USAGE', 'REVIEWED', 'Verbrauch erfasst und im Demo-Fall geprüft']
    ].forEach(function (entry, index) {
      const id = SCENARIO_ID + '-MAT-' + (index + 1);
      db.materialRecords.unshift({ id: id, type: entry[0], site: number, employeeId: ids[0],
        article: 'Abdeckvlies', quantity: 3, unit: 'Rolle', note: entry[2], status: entry[1],
        createdAt: STAMP, updatedAt: STAMP, syncStatus: 'SYNCED',
        history: [STAMP + ' · ' + entry[2] + ' · Stefan Eins (Demo)'] });
      if (entry[0] === 'USAGE') db.projectMaterialItems.push({ id: 'PM-' + id, sourceId: id,
        site: number, quantity: 3, unit: 'Rolle', article: 'Abdeckvlies', note: 'Verbrauch als Rohposition',
        unitPrice: null, totalPrice: null });
    });
    db.supplierInvoices.push({ id: SCENARIO_ID + '-EIN', supplier: 'Materialhandel Muster (Demo)',
      invoiceNumber: 'DEMO-E-107', invoiceDate: '2026-09-15', site: number,
      net: 120, vat: 22.80, total: 142.80, status: 'ZUGEORDNET',
      note: 'Manuelle synthetische Zuordnung' });
    db.projectCostEntries.push({ id: SCENARIO_ID + '-COST-MATERIAL', site: number,
      date: '2026-09-15', type: 'MATERIAL_EXTERNAL', description: 'Synthetische Eingangsrechnung · Abdeckvlies',
      supplier: 'Materialhandel Muster (Demo)', net: 120, reference: 'DEMO-E-107',
      source: 'SUPPLIER_INVOICE', sourceId: SCENARIO_ID + '-EIN', createdAt: STAMP,
      createdBy: 'Torben · Demo' });
    db.projectCostEntries.push({ id: SCENARIO_ID + '-COST-LIFT', site: number,
      date: '2026-09-15', type: 'LIFT', description: 'Arbeitsbühne (Demo)',
      supplier: 'Geräteverleih Muster (Demo)', net: 80, reference: 'DEMO-K-107',
      source: 'MANUAL', createdAt: STAMP, createdBy: 'Torben · Demo' });
    db.billingRecords.push({ id: SCENARIO_ID + '-AUS', site: number, date: '2026-09-16',
      reference: 'DEMO-R-107', net: 1200, note: 'Synthetische geschriebene Rechnung' });
    db.invoiceTasks.push({ id: SCENARIO_ID + '-LISTE', date: '2026-09-16', site: number,
      project: PROJECT_NAME, employee: NAMES[0], status: 'GESCHRIEBEN',
      note: 'Demo-Status; Rechnungseintrag DEMO-R-107' });
    addAudit(db, 'PROJECT_CREATED', number, 'Projekt angelegt', number + ' · ' + PROJECT_NAME);
    addAudit(db, 'PILOT_FLOW', number, 'Praxistest verbunden',
      'Planung, 16 h akzeptierte Zeit, 2 h Fahrt roh, Material, 200 € externe Kosten, 1.200 € Rechnung');
    db.pilotScenario = { id: SCENARIO_ID, projectNumber: number, employeeIds: ids,
      weekMonday: '2026-09-14', installedAt: STAMP };
    return { created: true, scenario: db.pilotScenario };
  }

  window.MMPilotScenario = { install: install, id: SCENARIO_ID };
}());

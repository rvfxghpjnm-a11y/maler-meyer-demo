'use strict';

(function installAdvancedDemoWorkflows() {
  const previousFactory = window.createDemoSeed;
  const DEMO_TODAY = '2026-09-10';
  const demoPins = {
    'M-0001': '123456',
    'M-0002': '234567',
    'M-0003': '345678',
    'M-0004': '456789',
    'M-0005': '567890',
    'M-0006': '678901'
  };
  function assignedDemoPin(employeeId, db) {
    const employee = db && (db.employees || []).find(function (item) { return item.id === employeeId; });
    return demoPins[employeeId] || (employee && employee.demoPin) || '';
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function workdays(from, to) {
    const start = new Date(from + 'T12:00:00');
    const end = new Date(to + 'T12:00:00');
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start) return 0;
    let count = 0;
    for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      if (day.getDay() !== 0 && day.getDay() !== 6) count += 1;
    }
    return count;
  }

  function dateInRange(date, from, to) {
    return date >= from && date <= to;
  }

  function planDate(plan, dayIndex) {
    const date = new Date(plan.monday + 'T12:00:00');
    date.setDate(date.getDate() + dayIndex);
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function applyApprovedLeave(db, request) {
    db.weekPlans.forEach(function (plan) {
      const row = plan.rows.find(function (item) { return item.employeeId === request.employeeId; });
      if (!row) return;
      row.values = row.values.map(function (value, index) {
        return dateInRange(planDate(plan, index), request.from, request.to) ? 'Urlaub' : value;
      });
    });
    const assignment = db.assignments.find(function (item) { return item.employeeId === request.employeeId; });
    if (assignment && dateInRange(DEMO_TODAY, request.from, request.to)) {
      assignment.absence = 'Urlaub';
      assignment.absenceRequestId = request.id;
    }
  }

  function seedMaterialRecords(db) {
    return [
      {
        id: 'MATV-001', type: 'REQUEST', site: '26-103', employeeId: 'M-0001', article: 'Abdeckvlies',
        quantity: 3, unit: 'Rolle', note: 'Für Flur und Treppenhaus', status: 'NEW',
        createdAt: '10.09.2026 · 08:12 Uhr', updatedAt: '10.09.2026 · 08:12 Uhr', syncStatus: 'SYNCED',
        history: ['10.09.2026 · 08:12 Uhr · von Max Beispiel angefordert']
      },
      {
        id: 'MATV-002', type: 'WITHDRAWAL', site: '26-104', employeeId: 'M-0017', article: 'Innenfarbe weiss',
        quantity: 2, unit: 'Eimer / 15 l', note: 'Aus der Firma mitgenommen', status: 'RECORDED',
        createdAt: '10.09.2026 · 07:02 Uhr', updatedAt: '10.09.2026 · 07:02 Uhr', syncStatus: 'SYNCED',
        history: ['10.09.2026 · 07:02 Uhr · Entnahme aus Firma erfasst']
      },
      {
        id: 'MATV-003', type: 'USAGE', site: '26-103', employeeId: 'M-0014', article: 'Tiefengrund',
        quantity: 12, unit: 'Liter', note: 'Empfang und Flur', status: 'REVIEWED',
        createdAt: '09.09.2026 · 15:28 Uhr', updatedAt: '10.09.2026 · 09:05 Uhr', syncStatus: 'SYNCED',
        history: ['09.09.2026 · 15:28 Uhr · Verbrauch erfasst', '10.09.2026 · 09:05 Uhr · durch Sabine Beispiel geprüft']
      }
    ];
  }

  window.createDemoSeed = function createAdvancedDemoSeed() {
    const db = previousFactory();
    db.materialRecords = seedMaterialRecords(db);
    db.projectMaterialItems = db.materialRecords.filter(function (item) { return item.type === 'USAGE'; }).map(function (item) {
      return { id: 'PM-' + item.id, sourceId: item.id, site: item.site, quantity: item.quantity, unit: item.unit, article: item.article, note: item.note, unitPrice: null, totalPrice: null };
    });
    db.leaveRequests = [
      { id: 'U-001', employeeId: 'M-0011', from: '2026-10-05', to: '2026-10-09', days: 5, note: 'Familientermin (synthetisch)', status: 'REQUESTED', requestedAt: '10.09.2026 · 07:42 Uhr', reviewedAt: '', reviewedBy: '', decisionReason: '', history: ['10.09.2026 · 07:42 Uhr · Antrag gestellt'] },
      { id: 'U-002', employeeId: 'M-0024', from: '2026-09-21', to: '2026-09-23', days: 3, note: '', status: 'APPROVED', requestedAt: '08.09.2026 · 16:15 Uhr', reviewedAt: '09.09.2026 · 08:04 Uhr', reviewedBy: 'Torben · Demo', decisionReason: 'Planung im Demo-Fall möglich', history: ['08.09.2026 · 16:15 Uhr · Antrag gestellt', '09.09.2026 · 08:04 Uhr · genehmigt'] }
    ];
    db.leaveRequests.filter(function (item) { return item.status === 'APPROVED'; }).forEach(function (item) { applyApprovedLeave(db, item); });
    db.feedbackCases = [
      { id: 'DEMO-FB-001', category: 'Bedienproblem', description: 'Beispiel: Pausenknopf auf kleinem Bildschirm zunächst nicht gefunden.', role: 'Mitarbeiter', screen: 'Heute', createdAt: '10.09.2026 · 08:08 Uhr', status: 'Neu', syncStatus: 'SYNCED' }
    ];
    db.notificationPreferences = {
      weekReview: true,
      planningChanged: true,
      correctionDone: true,
      leaveDecision: true,
      extraQuestion: true
    };
    db.offlineSimulation = { offline: false, queue: [], lastSync: 'Noch keine Demo-Synchronisierung ausgeführt' };
    db.sharedDevice = { deviceName: 'Fahrzeug-iPad Demo 01', registered: true, autoLockMinutes: 5, lastUserId: null };
    db.audit.unshift({ id: 'A-DEMO-V10', type: 'DEMO_SCOPE', entity: 'V10', title: 'Erweiterte Bedienungsabläufe vorbereitet', before: 'Export- und Kernabläufe', after: 'Foto/Sprache, Material, Urlaub, Fahrzeuggerät, Offline und Feedback', actor: 'System · synthetische Demo', time: '14.09.2026 · 09:00 Uhr', reason: 'Spätere fachliche Entscheidungen; keine Produktivarchitektur' });
    return db;
  };

  window.MMAdvanced = {
    demoToday: DEMO_TODAY,
    clone: clone,
    workdays: workdays,
    applyApprovedLeave: applyApprovedLeave,
    checkDemoPin: function (employeeId, pin, db) { return assignedDemoPin(employeeId, db) === String(pin); },
    hasDemoPin: function (employeeId, db) { return Boolean(assignedDemoPin(employeeId, db)); },
    demoPinHint: function (employeeId, db) { return assignedDemoPin(employeeId, db) || 'Kein Demo-PIN'; }
  };
  window.DEMO_DATA_VERSION = 10;
}());

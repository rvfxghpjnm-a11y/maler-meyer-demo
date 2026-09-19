'use strict';

// Public demo only: the source workbook's commercial rate is deliberately not published.
// The relationships below follow the observed annual-list formula structure, using a
// wholly synthetic, editable-in-code demonstration rate instead of the private value.
(function exposeExcelModel() {
  const DEMO_RATE = 60;
  const TYPES = {
    material: 'MATERIAL_EXTERNAL', lift: 'LIFT', subcontractor: 'SUBCONTRACTOR',
    tempStaff: 'TEMP_STAFF', scaffoldWaste: 'SCAFFOLD_WASTE', other: 'OTHER'
  };
  function number(value) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
  function cost(db, site, type) {
    return (db.projectCostEntries || []).filter(function (item) { return item.site === site && item.type === type; })
      .reduce(function (sum, item) { return sum + number(item.net); }, 0);
  }
  function isoWeek(dateText) {
    const day = new Date(dateText + 'T00:00:00Z');
    if (Number.isNaN(day.getTime())) return null;
    day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
    const year = day.getUTCFullYear();
    const start = new Date(Date.UTC(year, 0, 1));
    return { year: year, week: Math.ceil((((day - start) / 86400000) + 1) / 7) };
  }
  function workSummary(db, site) {
    const employees = new Map((db.employees || []).map(function (item) { return [item.id, item]; }));
    const weeks = new Map();
    (db.monthHistory || []).forEach(function (entry) {
      if (entry.site !== site || entry.acceptedMinutes == null) return;
      const minutes = Number(entry.acceptedMinutes);
      const period = isoWeek(entry.date);
      if (!period || !Number.isFinite(minutes) || minutes < 0) return;
      const key = period.year + '-' + String(period.week).padStart(2, '0');
      if (!weeks.has(key)) weeks.set(key, { year: period.year, week: period.week, workerMinutes: 0, traineeMinutes: 0, travelMinutes: 0 });
      const item = weeks.get(key);
      const employee = employees.get(entry.employeeId);
      if (employee && /Auszubild|Praktik/.test(employee.job || '')) item.traineeMinutes += minutes;
      else item.workerMinutes += minutes;
      const travel = Number(entry.travelMinutes);
      if (Number.isFinite(travel) && travel > 0) item.travelMinutes += travel;
    });
    const rows = Array.from(weeks.values()).sort(function (a, b) { return a.year - b.year || a.week - b.week; })
      .map(function (item) { return { year: item.year, week: item.week, workerHours: item.workerMinutes / 60, traineeHours: item.traineeMinutes / 60, travelHoursRaw: item.travelMinutes / 60 }; });
    return { weeks: rows, acceptedHours: rows.reduce(function (sum, item) { return sum + item.workerHours; }, 0), traineeHours: rows.reduce(function (sum, item) { return sum + item.traineeHours; }, 0), travelHoursRaw: rows.reduce(function (sum, item) { return sum + item.travelHoursRaw; }, 0) };
  }
  function account(db, original) {
    const site = original.site;
    const costs = {};
    Object.keys(TYPES).forEach(function (key) { costs[key] = cost(db, site, TYPES[key]); });
    const invoices = (db.billingRecords || []).filter(function (item) { return item.site === site; })
      .reduce(function (sum, item) { return sum + number(item.net); }, 0);
    const time = workSummary(db, site);
    const hours = time.acceptedHours;
    const offer = number(original.offerNet);
    const otherAndCarryover = costs.other + number(original.carryover);
    const externalCosts = costs.tempStaff + costs.material + costs.lift + costs.subcontractor + costs.scaffoldWaste + otherAndCarryover;
    const totalCosts = hours * DEMO_RATE + externalCosts;
    return Object.assign({}, original, costs, {
      acceptedHours: hours,
      traineeHours: time.traineeHours,
      travelHoursRaw: time.travelHoursRaw,
      workWeeks: time.weeks,
      demoRate: DEMO_RATE,
      plannedHoursCalculated: offer / DEMO_RATE,
      hourlyRevenue: hours ? offer / hours : null,
      otherAndCarryover: otherAndCarryover,
      writtenInvoices: invoices,
      totalCosts: totalCosts,
      result: invoices - totalCosts,
      currentHourlyValue: hours ? (invoices - externalCosts) / hours : null
    });
  }
  window.MMExcel = { account: account, workSummary: workSummary, demoRate: DEMO_RATE, types: TYPES };
}());

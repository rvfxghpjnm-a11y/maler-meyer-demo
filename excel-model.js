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
  function account(db, original) {
    const site = original.site;
    const costs = {};
    Object.keys(TYPES).forEach(function (key) { costs[key] = cost(db, site, TYPES[key]); });
    const invoices = (db.billingRecords || []).filter(function (item) { return item.site === site; })
      .reduce(function (sum, item) { return sum + number(item.net); }, 0);
    const hours = number(original.acceptedHours);
    const offer = number(original.offerNet);
    const otherAndCarryover = costs.other + number(original.carryover);
    const externalCosts = costs.tempStaff + costs.material + costs.lift + costs.subcontractor + costs.scaffoldWaste + otherAndCarryover;
    const totalCosts = hours * DEMO_RATE + externalCosts;
    return Object.assign({}, original, costs, {
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
  window.MMExcel = { account: account, demoRate: DEMO_RATE, types: TYPES };
}());

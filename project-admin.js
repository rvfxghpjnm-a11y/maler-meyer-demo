'use strict';

(function installProjectAdminDemo() {
  function nextNumber(sites, year) {
    const prefix = String(Number(year) % 100).padStart(2, '0');
    const highest = sites.reduce(function (max, item) {
      const match = /^(\d{2})-(\d{3})$/.exec(String(item.number || ''));
      return match && match[1] === prefix ? Math.max(max, Number(match[2])) : max;
    }, 0);
    return highest < 999 ? prefix + '-' + String(highest + 1).padStart(3, '0') : '';
  }

  function period(start, end, previous) {
    const display = function (value) {
      if (!value) return '';
      const parts = value.split('-');
      return parts[2] + '.' + parts[1] + '.' + parts[0];
    };
    if (start && end) return display(start) + ' bis ' + display(end);
    if (start) return 'Ab ' + display(start) + ' · Ende noch offen';
    if (end) return 'Bis ' + display(end) + ' · Beginn noch offen';
    return previous || 'Noch offen';
  }

  function detailsFrom(values, previous) {
    const get = function (name) { return String(values.get(name) || '').trim(); };
    const lines = function (name) { return get(name).split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean); };
    const plannedStart = get('plannedStart');
    const plannedEnd = get('plannedEnd');
    return {
      access: get('access') || 'Noch nicht hinterlegt',
      siteLead: get('siteLead'),
      plannedStart: plannedStart,
      plannedEnd: plannedEnd,
      dates: period(plannedStart, plannedEnd, previous && previous.dates),
      description: get('description'),
      extraTasks: lines('extraTasks'),
      materials: lines('materials'),
      firstDayMaterials: lines('firstDayMaterials'),
      machines: lines('machines'),
      travelRule: get('travelRule') || 'NONE',
      invoice: get('invoice') || 'Noch nicht bewertet',
      internalNote: get('internalNote'),
      offerNet: Number(get('offerNet') || 0),
      plannedHours: Number(get('plannedHours') || 0)
    };
  }

  function validDetails(details) {
    if (details.plannedStart && details.plannedEnd && details.plannedEnd < details.plannedStart) return 'Das geplante Ende liegt vor dem Beginn.';
    if (!Number.isFinite(details.offerNet) || details.offerNet < 0) return 'Auftragswert netto bitte als nichtnegativen Betrag angeben.';
    if (!Number.isFinite(details.plannedHours) || details.plannedHours < 0) return 'Soll-Stunden bitte als nichtnegative Zahl angeben.';
    return '';
  }

  function renderDetails(project, account, esc) {
    const item = project || {};
    const finance = account || {};
    const value = function (name) { return esc(item[name] || ''); };
    const list = function (name) { return esc(Array.isArray(item[name]) ? item[name].join('\n') : ''); };
    const number = function (name) { return finance[name] ? esc(finance[name]) : ''; };
    return `<details class="project-detail-fields" open><summary>Weitere Projektdetails · optional</summary>
      <p class="meta">Diese Angaben können bei der Anlage oder später in den Projektstammdaten ergänzt werden.</p>
      <fieldset class="project-detail-group"><legend>Ausführung und Baustellenzugang</legend><div class="form-grid">
        <label>Geplanter Beginn<input type="date" name="plannedStart" value="${value('plannedStart')}"></label>
        <label>Geplantes Ende<input type="date" name="plannedEnd" value="${value('plannedEnd')}"></label>
        <label>Bauleitung vor Ort<input name="siteLead" value="${value('siteLead')}" placeholder="synthetischer Kontakt"></label>
        <label>Baustellenzugang / Schlüssel<input name="access" value="${value('access')}" placeholder="z. B. Schlüssel im Büro"></label>
        <label class="full">Projektbeschreibung / Leistungsumfang<textarea name="description" placeholder="Was ist grundsätzlich vorgesehen?">${value('description')}</textarea></label>
      </div></fieldset>
      <fieldset class="project-detail-group"><legend>Aufgaben und Material</legend><div class="form-grid">
        <label class="full">Weitere geplante Aufgaben · je Zeile<textarea name="extraTasks" placeholder="Weitere geplante Tätigkeiten, keine bestätigten Zusatzarbeiten">${list('extraTasks')}</textarea></label>
        <label class="full">Material für den ersten Arbeitstag · je Zeile<textarea name="firstDayMaterials" placeholder="Was soll am ersten Tag sicher mitgenommen werden?">${list('firstDayMaterials')}</textarea></label>
        <label class="full">Voraussichtlicher Materialbedarf gesamt · je Zeile<textarea name="materials" placeholder="Was wird voraussichtlich insgesamt benötigt?">${list('materials')}</textarea></label>
        <label class="full">Maschinenbedarf · je Zeile<textarea name="machines" placeholder="z. B. Schleifmaschine, Arbeitsbühne">${list('machines')}</textarea></label>
      </div></fieldset>
      <fieldset class="project-detail-group"><legend>Fahrzeitregel der Baustelle</legend><div class="form-grid">
        <label class="full">Regel auswählen<select name="travelRule"><option value="NONE" ${item.travelRule === 'NONE' || !item.travelRule ? 'selected' : ''}>Keine besondere Fahrzeitregel</option><option value="OVER_45" ${item.travelRule === 'OVER_45' ? 'selected' : ''}>Google-Maps-Fahrzeit über 45 Minuten · 30 Minuten Zeitgutschrift</option><option value="OVER_60" ${item.travelRule === 'OVER_60' ? 'selected' : ''}>Google-Maps-Fahrzeit über 60 Minuten · 30 Minuten Zeitgutschrift und früheres Baustellenende</option></select><small>Im Torben-Praxistest beschrieben. Die produktive Abrechnung muss noch exakt spezifiziert und getestet werden.</small></label>
      </div></fieldset>
      <fieldset class="project-detail-group"><legend>Büro und kaufmännische Eckdaten</legend><div class="form-grid">
        <label>Auftragswert netto · synthetisch<input type="number" name="offerNet" min="0" step="0.01" inputmode="decimal" value="${number('offerNet')}" placeholder="optional"></label>
        <label>Soll-Stunden · optional<input type="number" name="plannedHours" min="0" step="0.5" inputmode="decimal" value="${number('plannedHours')}" placeholder="optional"></label>
        <label class="full">Abrechnungshinweis<textarea name="invoice" placeholder="Hinweis, keine automatische Rechnungsfreigabe">${value('invoice')}</textarea></label>
        <label class="full">Interne Notiz · nur Geschäftsführung/Büro<textarea name="internalNote" placeholder="Nicht für die Mitarbeiteransicht">${value('internalNote')}</textarea></label>
      </div></fieldset>
    </details>`;
  }

  window.MMProjectAdmin = { nextNumber: nextNumber, detailsFrom: detailsFrom, validDetails: validDetails, renderDetails: renderDetails };
})();


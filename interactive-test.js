'use strict';

(function () {
  const STORAGE_KEY = 'maler-meyer-interactive-test-v2';
  const VERSION = 2;

  const tasks = [
    ['T01', '1', 'Geschäftsführer-Morgencheck', 'Startseite ohne Erklärung ansehen. Innerhalb von fünf Sekunden sollen offene Punkte, Planung und Schnellaktionen verständlich sein.', 'today', 'management'],
    ['T02', '2', 'Bau-Nr. suchen und Baustelle öffnen', 'Nach 26-107 beziehungsweise Projekt Stephan suchen. Stammdaten und Kosten auf dem verwendeten Gerät prüfen.', 'sites', 'management'],
    ['T03', '3', 'Krankmeldung und Umplanung', 'Eine Person als krank markieren und die betroffene Planung nachvollziehbar ändern.', 'planning', 'management'],
    ['T04', '4', 'Fahrzeug-iPad und PIN', 'Benutzer wählen, synthetischen sechsstelligen PIN verwenden, sperren und Benutzer wechseln.', 'shared-device', 'management'],
    ['T05', '5', 'Offline Zeit und Notiz erfassen', 'Offline simulieren, Zeitaktion und Notiz speichern, Warteschlange prüfen und wieder online gehen.', 'more', 'management'],
    ['T06', '6', 'Büro bucht stellvertretend', 'Einen Mitarbeiter telefonisch unterstützen und eine Zeitaktion mit Grund stellvertretend erfassen.', 'admin', 'management'],
    ['T07', '7', 'Vergessene Startzeit korrigieren', 'Korrektur anfordern und im Büro bearbeiten. Vorher, nachher, Grund und Bearbeiter prüfen.', 'times', 'management'],
    ['T08', '8', 'Wochenzettel bestätigen', 'Eigene Woche prüfen, optional zeichnen und bestätigen. Version und Zeitpunkt kontrollieren.', 'weeks', 'employee'],
    ['T09', '9', 'Bestätigten Wochenzettel korrigieren', 'Korrektur nach Bestätigung bearbeiten. Alte Version muss unverändert sichtbar bleiben.', 'weeks', 'management'],
    ['T10', '10', 'Schaden mit Foto und Sprache dokumentieren', 'Lokales Testfoto wählen und den vorhandenen Sprache-Demo-Entwurf erst nach Prüfung übernehmen.', 'documentation', 'employee'],
    ['T11', '11', 'Fortschrittsnotiz', 'Bau-Nr., Kategorie, Bereich und Text erfassen und im Baustellenverlauf wiederfinden.', 'documentation', 'employee'],
    ['T12', '12', 'Material anfordern', 'Drei Rollen Abdeckvlies für ein synthetisches Projekt anfordern.', 'material', 'employee'],
    ['T13', '13', 'Materialentnahme und Verbrauch', 'Entnahme sowie tatsächlichen Verbrauch erfassen und projektbezogen wiederfinden.', 'material', 'employee'],
    ['T14', '14', 'Büro bearbeitet Material', 'Anforderung öffnen, Demo-Status ändern und Verlauf kontrollieren.', 'material', 'management'],
    ['T15', '15', 'Urlaub beantragen', 'Zeitraum, Typ und Bemerkung erfassen. Keine Resturlaubslogik voraussetzen.', 'leave', 'employee'],
    ['T16', '16', 'Urlaub entscheiden und Planung prüfen', 'Antrag genehmigen oder ablehnen und anschließend die Planung kontrollieren.', 'leave', 'management'],
    ['T17', '17', 'Zusatzarbeit mit Bestätigung', 'Beschreibung, Menge, Bedarf und bestätigende Person erfassen; optional zeichnen.', 'today', 'employee'],
    ['T18', '18', 'Bestätigte Zusatzarbeit ändern', 'Bestätigten Inhalt ändern. Alter Snapshot und alte Bestätigung müssen getrennt bleiben.', 'extras', 'management'],
    ['T19', '19', 'Rechnung schreiben öffnen', 'Statusliste öffnen und von dort das zugehörige Projekt erreichen.', 'invoice-list', 'management'],
    ['T20', '20', 'Nachkalkulation und Projekt-Unterkonto', 'Projektkosten, Rohzeiten, Rechnungen und Exporte ohne erfundene Formeln beurteilen.', 'sites', 'management'],
    ['T21', '21', 'Arbeitszettel und Formulare öffnen', 'Arbeitszettel, Materialanforderung und Aufmaß als Druckansichten öffnen und zurückkehren.', 'exports', 'management'],
    ['T22', '22', 'Neues Projekt anlegen', 'Projekt separat anlegen. Bau-Nr., Kontakt, Zeitraum, Zugang, Arbeit und Materialbedarf prüfen.', 'project-create', 'management'],
    ['T23', '23', 'Neuen Mitarbeiter anlegen', 'Mitarbeiter ohne Baustellenzuordnung anlegen und danach wiederfinden.', 'employee-create', 'management'],
    ['T24', '24', 'Feedback oder Bedienproblem melden', 'Funktion über die Suche finden, Fall anlegen, Fallnummer erhalten und Fall öffnen.', 'feedback', 'management'],
    ['T25', '25', 'Vollständige neue Woche planen', 'Kalenderwoche mit Jahr wählen und eine leere Woche erstellen.', 'planning', 'management'],
    ['T26', '26', 'Zukünftigen Mittwoch ändern', 'Einzelne Zelle einer zukünftigen Woche ändern, ohne den heutigen Tag zu verändern.', 'planning', 'management'],
    ['T27', '27', 'Mehrere Mitarbeiter Montag bis Mittwoch planen', 'Mehrere Personen und Tage markieren und derselben Baustelle zuordnen.', 'planning', 'management'],
    ['T28', '28', 'Vorwoche kopieren', 'Neue Woche aus der Vorwoche erzeugen und anschließend bearbeiten.', 'planning', 'management'],
    ['T29', '29', 'Mitarbeiter sieht eigene Woche', 'Zur Mitarbeiteransicht wechseln und nur die eigene Planung kontrollieren.', 'today', 'employee'],
    ['T30', '30', 'Planänderung erzeugt Hinweis', 'Veröffentlichte Änderung erzeugt einen lokalen Demo-Hinweis für die betroffene Person.', 'notifications', 'employee'],
    ['T31', '31', 'Liftkosten hinzufügen', 'Synthetische Liftkosten mit Datum und Beschreibung einem Projekt zuordnen.', 'sites', 'management'],
    ['T32', '32', 'Eingangsrechnung zuordnen', 'Synthetische Lieferantenrechnung manuell einer Bau-Nr. und Kostenart zuordnen.', 'sites', 'management'],
    ['T33', '33', 'Geschriebene Rechnung erfassen', 'Synthetische Ausgangsrechnung im Projekt erfassen und in der Rechnungsliste wiederfinden.', 'sites', 'management'],
    ['T34', '34', 'Projektkosten-XLSX kontrollieren', 'Aktuelle Projektkosten und Rechnungen exportieren und mit der Projektansicht vergleichen.', 'exports', 'management']
  ].map(function (item) {
    return { id: item[0], number: item[1], kind: 'Aufgabe', title: item[2], instruction: item[3], view: item[4], role: item[5] };
  });

  const questions = [
    ['Q01', 'Umfang der ersten echten Version', 'Welche Funktionen müssen beim ersten produktionsnahen Pilot zwingend funktionieren und welche dürfen ausdrücklich später kommen?', 'Kernentscheidung'],
    ['Q02', 'Planung', 'Sind Entwurf, Veröffentlichung, Vorwoche kopieren und Änderungsmeldungen gewünscht? Wer darf veröffentlichen, ändern und zurückziehen?', 'Kernentscheidung'],
    ['Q03', 'Rollen und Rechte', 'Welche Rechte benötigen Torben, Steffen, die beiden Bürokräfte, Vorarbeiter und Mitarbeiter jeweils? Wer vertritt wen?', 'Kernentscheidung'],
    ['Q04', 'Projektkontakte', 'Sind Auftraggeber, Ansprechpartner mit Telefonnummer, externe Bauleitung und interner Maler-Meyer-Ansprechpartner richtig getrennt und benannt?', 'Kernentscheidung'],
    ['Q05', 'Projektansicht', 'Welche Felder braucht Torben täglich sichtbar, welche nur aufklappbar und welche überhaupt nicht?', 'Kernentscheidung'],
    ['Q06', 'Mitarbeitersicht', 'Welche Projekt-, Kontakt-, Foto-, Zeichnungs-, Stunden- und Kostendaten dürfen normale Mitarbeiter sehen?', 'Kernentscheidung'],
    ['Q07', 'Mitarbeiterdaten', 'Bleibt die App bewusst bei Organisationsdaten ohne Personalakte? Sind interne Einsatzhinweise gewünscht und wer darf sie sehen?', 'Kernentscheidung'],
    ['Q08', 'Krankmeldung und Abwesenheit', 'Wo und durch wen wird Krankheit von/bis erfasst? Sind Schule, Fortbildung und sonstige Abwesenheit feste Status?', 'Kernentscheidung'],
    ['Q09', 'Zeitablauf und Korrekturen', 'Passen Start, Pause, Baustellenwechsel, Fahrt, Feierabend, Korrekturanfrage und stellvertretende Buchung zum echten Alltag?', 'Kernentscheidung'],
    ['Q10', 'Fahrzeit und Zeitregeln', 'Welche Fahrzeit-, Überstunden-, Rüstzeit- und Nachtregeln gelten genau? Unklare Regeln bleiben bis zur Freigabe reine Rohdaten.', 'Kernentscheidung'],
    ['Q11', 'Wochenzettel', 'Wer gibt nach der Mitarbeiterbestätigung final frei und welche Korrekturen müssen zwingend eine neue Version erzeugen?', 'Kernentscheidung'],
    ['Q12', 'Material', 'Sind Materialbedarf, zusätzliche Anforderung, Entnahme und tatsächlicher Einsatz richtig getrennt? Wer prüft und wird informiert?', 'Kernentscheidung'],
    ['Q13', 'Zusatzarbeit', 'Wer gibt die Ausführung frei, wer prüft kaufmännisch und wie werden Lift, Gerüst, Material oder zusätzliche Personen festgehalten?', 'Kernentscheidung'],
    ['Q14', 'Abrechnungshinweis', 'Wird Freitext oder eine Auswahl wie Festpreis, Stundenlohn und Nachbesserung benötigt? Wer darf den Hinweis sehen?', 'Kernentscheidung'],
    ['Q15', 'Rechnung schreiben', 'Welche Status, Verantwortlichen und Abschlusskriterien benötigt die Liste „Rechnung schreiben?“?', 'Kernentscheidung'],
    ['Q16', 'Urlaub', 'Wer genehmigt final und wie werden halbe Tage, Sonderurlaub, unbezahlter Urlaub und Resturlaub behandelt?', 'Kernentscheidung'],
    ['Q17', 'Bau-Nr.', 'Wann wird sie vergeben, wer darf sie ändern und wie wird bei gleichzeitiger Projektanlage die nächste Nummer reserviert?', 'Kernentscheidung'],
    ['Q18', 'Startdaten', 'Welche Mitarbeiter, aktiven Baustellen, Bau-Nrn., offenen Vorgänge und optionalen Artikel müssen zum Pilotstart übernommen werden? Wer prüft sie?', 'Kernentscheidung'],
    ['Q19', 'Dokumente und Exporte', 'Welche Papierformulare, PDF-, CSV- und Excel-Ausgaben müssen beim ersten Pilot vollständig verfügbar und von wem abgenommen sein?', 'Kernentscheidung'],
    ['Q20', 'Excel und Kennzahlen', 'Welche Kennzahlen aus Hauptliste und Projektblättern werden wirklich benötigt und wie sollen die wichtigen Werte eindeutig heißen?', 'Kernentscheidung'],
    ['Q21', 'Excel-Abweichungen', 'Sollen historische Materialformel- und Kostenabweichungen erhalten, fachlich korrigiert oder durch eine neue bestätigte Regel ersetzt werden?', 'Darf offen bleiben'],
    ['Q22', 'Kostenübersicht', 'Soll die unternehmensweite Jahreskostenübersicht Teil der ersten Version sein? Welche Kategorien gehören in Monats- und Jahressummen?', 'Darf offen bleiben'],
    ['Q23', 'Eingangsrechnung und OCR', 'Soll OCR in die erste Version oder später? Welche Rechnungsdaten und Prüfschritte sind unabhängig davon erforderlich?', 'Darf offen bleiben'],
    ['Q24', 'Fahrzeuggerät und Anmeldung', 'Welche Geräte werden verwendet? Wie sollen persönlicher PIN, vergessenes Kennwort, Gerätesperre und Benutzerwechsel im Betrieb ablaufen?', 'Kernentscheidung'],
    ['Q25', 'Offline und mehrere Geräte', 'Welche Vorgänge müssen zwingend offline funktionieren und wie soll das Büro bei widersprüchlichen Änderungen mehrerer Geräte entscheiden?', 'Kernentscheidung'],
    ['Q26', 'Benachrichtigungen', 'Welche Meldungen sind wichtig, wer erhält sie und zu welchen Zeitpunkten? Freitag 16:00 bleibt nur ein Beispiel.', 'Darf offen bleiben'],
    ['Q27', 'Datenschutz und Mitbestimmung', 'Sind Betriebsrat oder Mitbestimmung betroffen? Wer klärt Aufbewahrung, Löschung, Betreiberrolle, AVV sowie Foto- und Signaturdaten?', 'Vor Echtbetrieb klären'],
    ['Q28', 'Betrieb und Support', 'Wer verantwortet Server, Domain, Backups und Wiederherstellung? Wie wird zeitlich begrenzter ShoreLogic-Support freigegeben?', 'Vor Echtbetrieb klären'],
    ['Q29', 'Pilotbetrieb', 'Welche ein bis zwei Baustellen und Personen eignen sich? Welche alte Unterlage bleibt vorerst führend und wie werden Abweichungen verglichen?', 'Kernentscheidung'],
    ['Q30', 'Abnahme und nächster Test', 'Woran erkennt Torben, dass der Pilot erfolgreich ist, wer nimmt ihn ab und wann wird über den breiteren Echtbetrieb entschieden?', 'Kernentscheidung']
  ].map(function (item, index) {
    return { id: item[0], number: String(index + 1), kind: 'Fachfrage', title: item[1], instruction: item[2], priority: item[3], view: '', role: 'management' };
  });

  const items = tasks.concat(questions);
  let session = loadSession();

  function now() { return new Date().toISOString(); }
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>'"]/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]; }); }
  function loadSession() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return value && value.version === VERSION ? value : null;
    } catch (_) { return null; }
  }
  function saveSession() {
    if (!session) return;
    session.updatedAt = now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); } catch (_) {}
  }
  function currentItem() { return session ? items[session.currentIndex] : null; }
  function resultFor(id) {
    if (!session.results[id]) session.results[id] = { status: 'OPEN', note: '', firstOpenedAt: '', completedAt: '', visits: 0 };
    return session.results[id];
  }
  function createSession(tester) {
    const results = {};
    items.forEach(function (item) { results[item.id] = { status: 'OPEN', note: '', firstOpenedAt: '', completedAt: '', visits: 0 }; });
    session = {
      version: VERSION,
      id: 'MM-TEST-' + Date.now(),
      tester: String(tester || 'Torben-Praxistest').trim() || 'Torben-Praxistest',
      status: 'ACTIVE',
      startedAt: now(),
      updatedAt: now(),
      pausedAt: '',
      endedAt: '',
      currentIndex: 0,
      results: results,
      interactions: [],
      errors: [],
      environment: environmentInfo(),
      notice: 'Rein lokale Bedienungssimulation. Keine Audioaufnahme, kein Upload und keine automatische Übermittlung.'
    };
    visitCurrent();
    saveSession();
  }
  function environmentInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      screen: { width: window.screen.width, height: window.screen.height },
      onlineAtStart: navigator.onLine
    };
  }
  function visitCurrent() {
    const item = currentItem();
    if (!item) return;
    const result = resultFor(item.id);
    if (!result.firstOpenedAt) result.firstOpenedAt = now();
    result.visits += 1;
  }
  function setIndex(index) {
    if (!session) return;
    session.currentIndex = Math.max(0, Math.min(items.length - 1, index));
    visitCurrent();
    saveSession();
  }
  function setOutcome(status) {
    const item = currentItem();
    if (!item) return;
    const result = resultFor(item.id);
    result.status = status;
    result.completedAt = now();
    if (session.currentIndex < items.length - 1) setIndex(session.currentIndex + 1);
    else saveSession();
  }
  function statusText(status) {
    return ({ OPEN: 'Offen', DONE: 'Erledigt', UNCLEAR: 'Unklar', ERROR: 'Fehler', SKIPPED: 'Übersprungen' })[status] || status;
  }
  function statusClass(status) { return String(status || 'OPEN').toLowerCase(); }
  function progress() {
    if (!session) return { complete: 0, total: items.length, percent: 0 };
    const complete = Object.values(session.results).filter(function (item) { return item.status !== 'OPEN'; }).length;
    return { complete: complete, total: items.length, percent: Math.round(complete / items.length * 100) };
  }
  function renderEntryCard() {
    const label = session && session.status !== 'ENDED' ? 'Test fortsetzen' : 'Interaktiven Test starten';
    const detail = session && session.status !== 'ENDED' ? progress().complete + ' von ' + progress().total + ' Punkten bearbeitet' : 'Aufgaben, Fachfragen, Notizen und technische Ergebnisse in einer Datei sammeln.';
    return '<section class="card card-pad interactive-test-entry"><span class="eyebrow">Torben-Praxistest</span><h2>Geführter interaktiver Test</h2><p>' + esc(detail) + '</p><button class="primary" data-action="navigate" data-view="praxis-test">' + esc(label) + '</button><small>Keine Audioaufnahme. Testdaten bleiben lokal, bis du die Ergebnisdatei herunterlädst.</small></section>';
  }
  function render() {
    if (!session) return renderStart();
    if (session.status === 'ENDED') return renderFinished();
    const item = currentItem();
    const result = resultFor(item.id);
    const p = progress();
    const paused = session.status === 'PAUSED';
    return '<div class="page-head"><div><h1>Interaktiver Praxistest</h1><p>' + esc(session.tester) + ' · lokal auf diesem Gerät</p></div><span class="demo-context">' + esc(paused ? 'Pausiert' : 'Läuft') + '</span></div>' +
      '<section class="practice-progress card card-pad"><div><strong>' + p.complete + ' von ' + p.total + ' Punkten bearbeitet</strong><small>' + p.percent + ' Prozent</small></div><progress max="100" value="' + p.percent + '">' + p.percent + '%</progress></section>' +
      (paused ? '<section class="practice-pause card card-pad"><h2>Test ist pausiert</h2><p>Der Zwischenstand ist lokal gespeichert. Lade ihn jetzt herunter oder setze später fort.</p><div class="form-actions"><button class="primary" data-action="practice-download" data-kind="Zwischenstand">Zwischenstand herunterladen</button><button class="secondary" data-action="practice-resume">Test fortsetzen</button></div></section>' : renderCurrent(item, result)) +
      renderOverview() +
      '<section class="card card-pad section practice-finish"><h2>Test beenden</h2><p>Beenden friert den aktuellen Stand ein. Danach wird die vollständige Ergebnisdatei zum Download angeboten.</p><button class="danger-button" data-action="practice-end">Test beenden</button></section>';
  }
  function renderStart() {
    return '<div class="page-head"><div><h1>Interaktiver Praxistest</h1><p>Ersatz für den gedruckten Fragenkatalog</p></div><span class="demo-context">Lokal</span></div>' +
      '<section class="card card-pad practice-intro"><h2>Was wird gespeichert?</h2><p>Der Test enthält 34 Bedienaufgaben und 30 fachliche Abschlussfragen. Eine Entscheidung darf ausdrücklich als später oder offen notiert werden.</p><ul><li>Aufgabenfortschritt und Bewertungen</li><li>Notizen zu jeder Aufgabe oder Fachfrage</li><li>angeklickte Demo-Funktionen und Zeitpunkte</li><li>JavaScript-Fehler und Geräteinformationen</li><li>der aktuelle vollständig synthetische Demo-Zustand beim Download</li></ul><p class="legal-note"><strong>Keine Audioaufnahme:</strong> Das Mikrofon oder eine Aufnahme-App auf dem iPad läuft unabhängig von dieser Demo. Es erfolgt kein Upload.</p><form data-form="practice-start"><label>Name der Testperson oder Testgruppe<input name="tester" value="Torben-Praxistest" maxlength="80"></label><button class="primary">Test starten</button></form></section>';
  }
  function renderCurrent(item, result) {
    const phase = item.kind === 'Aufgabe' ? 'Bedienaufgabe ' + item.number + ' von 34' : 'Fachfrage ' + item.number + ' von ' + questions.length;
    return '<section class="card card-pad practice-current"><div class="practice-current-head"><span><small>' + esc(phase) + '</small><h2>' + esc(item.title) + '</h2>' + (item.priority ? '<span class="practice-priority">' + esc(item.priority) + '</span>' : '') + '</span><span class="practice-status ' + statusClass(result.status) + '">' + esc(statusText(result.status)) + '</span></div><p class="practice-instruction">' + esc(item.instruction) + '</p>' +
      (item.view ? '<button class="primary" data-action="practice-open-item">Aufgabe in der Demo öffnen</button>' : '<p class="info-note">Antwort bitte aussprechen und die Kernaussage zusätzlich kurz im Notizfeld festhalten.</p>') +
      '<label class="practice-note">Notiz zu diesem Punkt<textarea data-practice-note data-item-id="' + item.id + '" placeholder="Was war klar, unklar, falsch oder fehlte?">' + esc(result.note) + '</textarea></label>' +
      '<div class="practice-rating"><button class="success-button" data-action="practice-outcome" data-status="DONE">Erledigt</button><button class="secondary" data-action="practice-outcome" data-status="UNCLEAR">Unklar</button><button class="danger-button" data-action="practice-outcome" data-status="ERROR">Fehler</button><button class="quiet" data-action="practice-skip">Überspringen</button></div>' +
      '<div class="practice-navigation"><button class="secondary" data-action="practice-previous" ' + (session.currentIndex === 0 ? 'disabled' : '') + '>Zurück</button><span>Punkt ' + (session.currentIndex + 1) + ' von ' + items.length + '</span><button class="secondary" data-action="practice-next" ' + (session.currentIndex === items.length - 1 ? 'disabled' : '') + '>Weiter</button></div><button class="pause-button" data-action="practice-pause">Test pausieren</button><p class="legal-note">Keine Audioaufnahme in der Demo. Eine iPad-Aufnahme läuft unabhängig davon.</p></section>';
  }
  function renderOverview() {
    const groups = [
      ['Bedienaufgaben', tasks],
      ['Fachfragen', questions]
    ];
    return '<details class="card card-pad section practice-overview"><summary>Alle Punkte anzeigen und direkt springen</summary>' + groups.map(function (group) {
      return '<h3>' + group[0] + '</h3><div class="practice-item-list">' + group[1].map(function (item) {
        const result = resultFor(item.id);
        const active = currentItem() && currentItem().id === item.id;
        return '<button class="practice-item-row ' + statusClass(result.status) + (active ? ' active' : '') + '" data-action="practice-jump" data-id="' + item.id + '"><span>' + (item.kind === 'Aufgabe' ? item.number : item.id) + '</span><strong>' + esc(item.title) + '</strong><small>' + esc(statusText(result.status)) + '</small></button>';
      }).join('') + '</div>';
    }).join('') + '</details>';
  }
  function renderFinished() {
    const p = progress();
    return '<div class="page-head"><div><h1>Praxistest beendet</h1><p>' + esc(session.tester) + '</p></div><span class="demo-context">Gespeichert</span></div><section class="card card-pad practice-complete"><h2>Ergebnisdatei ist bereit</h2><p>' + p.complete + ' von ' + p.total + ' Punkten wurden bewertet. Die Datei enthält auch offene und übersprungene Punkte.</p><button class="primary" data-action="practice-download" data-kind="Ergebnis">Ergebnisdatei herunterladen</button><button class="secondary" data-action="practice-reopen">Test noch einmal öffnen</button><button class="quiet" data-action="practice-new">Neuen Test beginnen</button><p class="legal-note">Bitte die JSON-Datei zusammen mit dem externen iPad-Transkript in Codex anhängen und anschließend „Go“ schreiben.</p></section>' + renderOverview();
  }
  function renderDock() {
    if (!session || session.status === 'ENDED') return '';
    const item = currentItem();
    const paused = session.status === 'PAUSED';
    return '<div class="practice-dock-spacer" aria-hidden="true"></div><aside class="practice-dock ' + (paused ? 'paused' : '') + '" aria-label="Interaktiver Praxistest"><button class="practice-dock-main" data-action="practice-return"><small>' + esc(paused ? 'Test pausiert' : item.kind + ' ' + item.number) + '</small><strong>' + esc(item.title) + '</strong></button><div class="practice-dock-actions">' +
      (paused ? '<button data-action="practice-download" data-kind="Zwischenstand">Datei</button><button data-action="practice-resume">Fortsetzen</button>' : '<button data-action="practice-previous" ' + (session.currentIndex === 0 ? 'disabled' : '') + '>Zurück</button><button data-action="practice-skip">Überspringen</button><button data-action="practice-pause">Pause</button>') +
      '</div></aside>';
  }
  function handleSubmit(form, context) {
    if (form.dataset.form !== 'practice-start') return false;
    const values = new FormData(form);
    createSession(values.get('tester'));
    context.render();
    context.toast('Interaktiver Praxistest gestartet.');
    return true;
  }
  function handleInput(target) {
    if (!target.matches('[data-practice-note]') || !session) return false;
    const result = resultFor(target.dataset.itemId);
    result.note = target.value;
    saveSession();
    return true;
  }
  function handleAction(target, context) {
    const action = target.dataset.action || '';
    if (!action.startsWith('practice-')) return false;
    if (action === 'practice-previous') { setIndex(session.currentIndex - 1); context.render(); return true; }
    if (action === 'practice-next') { setIndex(session.currentIndex + 1); context.render(); return true; }
    if (action === 'practice-skip') { setOutcome('SKIPPED'); context.render(); return true; }
    if (action === 'practice-outcome') { setOutcome(target.dataset.status || 'DONE'); context.render(); return true; }
    if (action === 'practice-jump') { const index = items.findIndex(function (item) { return item.id === target.dataset.id; }); if (index >= 0) setIndex(index); context.render(); return true; }
    if (action === 'practice-pause') { session.status = 'PAUSED'; session.pausedAt = now(); saveSession(); context.navigate('praxis-test'); context.toast('Test pausiert. Zwischenstand kann heruntergeladen werden.'); return true; }
    if (action === 'practice-resume') { session.status = 'ACTIVE'; session.pausedAt = ''; saveSession(); context.navigate('praxis-test'); context.toast('Test wird fortgesetzt.'); return true; }
    if (action === 'practice-end') { session.status = 'ENDED'; session.endedAt = now(); saveSession(); context.render(); context.toast('Test beendet. Ergebnisdatei ist bereit.'); return true; }
    if (action === 'practice-reopen') { session.status = 'PAUSED'; session.endedAt = ''; session.pausedAt = now(); saveSession(); context.render(); return true; }
    if (action === 'practice-new') { createSession('Torben-Praxistest'); context.render(); return true; }
    if (action === 'practice-return') { context.navigate('praxis-test'); return true; }
    if (action === 'practice-open-item') {
      const item = currentItem();
      recordInteractionData('TASK_OPENED', { itemId: item.id, title: item.title, targetView: item.view, targetRole: item.role });
      context.setRole(item.role || 'management');
      context.navigate(item.view || 'praxis-test');
      return true;
    }
    if (action === 'practice-download') { downloadResults(target.dataset.kind || 'Ergebnis', context.db); context.toast('Ergebnisdatei wurde erstellt.'); return true; }
    return true;
  }
  function recordInteraction(target, context) {
    if (!session || session.status !== 'ACTIVE') return;
    const action = target.dataset.action || target.dataset.mmAction || '';
    if (!action || action.startsWith('practice-')) return;
    recordInteractionData('ACTION', { action: action, view: context.view, role: context.role, itemId: currentItem() ? currentItem().id : '', entityId: target.dataset.id || '', targetView: target.dataset.view || '' });
  }
  function recordForm(form, context) {
    if (!session || session.status !== 'ACTIVE' || !form.dataset.form || form.dataset.form === 'practice-start') return;
    recordInteractionData('FORM_SUBMIT', { form: form.dataset.form, view: context.view, role: context.role, itemId: currentItem() ? currentItem().id : '', fieldNames: Array.from(form.elements).map(function (field) { return field.name; }).filter(Boolean) });
  }
  function recordInteractionData(type, data) {
    if (!session) return;
    session.interactions.push(Object.assign({ at: now(), type: type }, data || {}));
    if (session.interactions.length > 2000) session.interactions = session.interactions.slice(-2000);
    saveSession();
  }
  function recordError(kind, message, source) {
    if (!session) return;
    session.errors.push({ at: now(), kind: kind, message: String(message || 'Unbekannter Fehler').slice(0, 1000), source: String(source || '').slice(0, 300), itemId: currentItem() ? currentItem().id : '' });
    saveSession();
  }
  function summaryText() {
    const lines = [
      'Maler Meyer – interaktiver Praxistest',
      'Test-ID: ' + session.id,
      'Tester: ' + session.tester,
      'Beginn: ' + session.startedAt,
      'Ende/Stand: ' + (session.endedAt || session.updatedAt),
      'Status: ' + session.status,
      '',
      'ERGEBNISSE'
    ];
    items.forEach(function (item) {
      const result = resultFor(item.id);
      lines.push('[' + statusText(result.status) + '] ' + item.id + ' · ' + item.title);
      if (result.note) lines.push('  Notiz: ' + result.note.replace(/\s+/g, ' ').trim());
    });
    lines.push('', 'TECHNISCHE FEHLER: ' + session.errors.length, 'BEDIENEREIGNISSE: ' + session.interactions.length, '', 'Keine Audioaufnahme. Keine automatische Übermittlung.');
    return lines.join('\n');
  }
  function downloadResults(kind, db) {
    if (!session) return;
    const payload = {
      format: 'maler-meyer-interactive-practice-test',
      formatVersion: 1,
      exportKind: kind,
      exportedAt: now(),
      session: session,
      items: items,
      readableSummary: summaryText(),
      syntheticDemoState: db,
      privacy: 'Die Datei wurde lokal erzeugt. Sie enthält keine Audioaufnahme. Nur mit synthetischen Demo-Daten testen.'
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    anchor.href = url;
    anchor.download = 'Maler-Meyer-Praxistest-' + kind + '-' + stamp + '.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    recordInteractionData('RESULT_DOWNLOADED', { kind: kind });
  }

  window.addEventListener('error', function (event) { recordError('error', event.message, event.filename + ':' + event.lineno); });
  window.addEventListener('unhandledrejection', function (event) { recordError('unhandledrejection', event.reason && event.reason.message ? event.reason.message : event.reason, 'Promise'); });
  window.addEventListener('beforeunload', function (event) {
    if (!session || session.status !== 'ACTIVE') return;
    event.preventDefault();
    event.returnValue = '';
  });

  window.MMPraxisTest = {
    render: render,
    renderDock: renderDock,
    renderEntryCard: renderEntryCard,
    handleAction: handleAction,
    handleSubmit: handleSubmit,
    handleInput: handleInput,
    recordInteraction: recordInteraction,
    recordForm: recordForm,
    getSession: function () { return session; },
    getItems: function () { return items.slice(); }
  };
})();

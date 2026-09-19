# Maler-Meyer-Demo

Öffentliche, rein statische Bedienungsdemo für Maler Meyer. Sämtliche Personen, Baustellen, Zeiten, Zusatzarbeiten, Notizen und Dokumente sind erfunden.

Die Demo hat kein Backend, keine echte Anmeldung und keine Verbindung zu Maler Meyer. Eingaben und Statusänderungen werden ausschließlich lokal im jeweiligen Browser gespeichert und können über „Demo zurücksetzen“ vollständig verworfen werden.

Für einen nachvollziehbaren Torben-Praxistest kann auf der Geschäftsführer-Startseite ein **rein synthetischer Vergleichsfall** geladen werden: zwei neue Demo-Mitarbeiter, ein neues Demo-Projekt, KW-Planung, Zeit, Material, externe Kosten und eine geschriebene Rechnung. Die Daten erscheinen anschließend in der Baustellenmappe und den verbundenen Exporten. Bereits vorhandene lokale Demo-Einträge werden nicht gelöscht. Anleitung, Zahlen und die Grenze zum echten Parallelbetrieb: [TORBEN_PARALLELTEST.md](./TORBEN_PARALLELTEST.md).

Neu angelegte Demo-Mitarbeiter können auf dem simulierten Fahrzeuggerät mit einem sichtbar angezeigten synthetischen PIN ihre eigene Wochenansicht prüfen. Diese bewusst einfache Browserprüfung ist **keine produktive PIN-Sicherheit**.

Vier Perspektiven sind bedienbar: Geschäftsführung, Büro, Vorarbeiter und Mitarbeiter. Planung, Zeitereignisse, Korrekturen, Zusatzarbeiten, Baustellenmappe und Wochenzettel verwenden einen gemeinsamen synthetischen Demo-Zustand. Der erweiterte Datensatz umfasst mehrere editierbare Planungswochen und einen synthetischen Arbeitszeitverlauf vom 3. August bis 11. September 2026. Aktueller Stand ist Demo-Version 15.

Demo-Version 15 ordnet synthetische akzeptierte Zeitminuten einer Bau-Nr. und Kalenderwoche zu; diese datierten Werte speisen die Stunden- und Fahrzeit-Rohwerte im Projekt-Unterkonto und in der Bauliste. Eine eindeutige Bürokorrektur des Wochenzettels aktualisiert die zugehörige Demo-Zeitprojektion, ohne den alten bestätigten Snapshot zu verändern. Die Planung identifiziert Wochen jetzt über den konkreten Montag und die ISO-Kalenderwoche **mit Jahr**; KW 1 verschiedener Jahre kann dadurch unabhängig geplant und exportiert werden. Bei mehr als 54 Projektwochen setzt der XLSX-Export die Zeitdaten sichtbar fort, statt sie abzuschneiden. Dies ersetzt weder eine produktive Freigabelogik noch die serverseitige Verarbeitung unveränderbarer Rohereignisse.

Wer bereits einen lokalen Demo-Zustand aus einer älteren Version hat, kann über „Demo zurücksetzen“ die konsistenten synthetischen Ausgangsdaten von Version 15 laden. Dabei werden nur lokale Demo-Änderungen dieses Browsers verworfen.

In der Wochenmatrix werden Bau-Nr. und Baustellenname gemeinsam angezeigt. Die mobile Mitarbeiterauswahl für Kolonnen-/Mehrtagesplanung ist ohne überlappende Checkboxen oder Namen bedienbar; die breite Wochenmatrix wird auf Smartphones seitlich gewischt.

Die Kolonnen-/Mehrtagesplanung zeigt die laut Gerätedatum aktuelle Kalenderwoche als Orientierung. Die zu bearbeitende KW wird ausdrücklich ausgewählt und zusammen mit ihrem Datumsbereich angezeigt; beim Wechsel zeigt die Wochenmatrix dieselbe KW. Andere Wochen werden nur als KW mit Datum bezeichnet, nicht relativ als „nächste Woche“.

Demo-Version 12 erweitert die Projektanlage: Der editierbare Bau-Nr.-Vorschlag folgt der höchsten vorhandenen Nummer des Gerätejahres; auch archivierte Projekte zählen mit. In einem neuen Kalenderjahr beginnt die Demo bei `JJ-001`. Zusätzlich zu den Grunddaten können Einsatzzeitraum, Baustellenleitung, Zugang, Leistungsumfang, weitere Aufgaben, Materialhinweise sowie interne und kaufmännische Eckdaten erfasst und später bearbeitet werden. Dies ist keine produktive Nummernreservierung; die Bau-Nr. bestehender verknüpfter Projekte wird nicht still geändert.

## Betriebsverwaltung und Büro-Hilfe

Torben, Steffen und die beiden vollständig synthetischen Büro-Demokonten besitzen in Demo-Version 12 dieselbe umfangreiche Verwaltungsansicht. Dort können sie Projekte anlegen und bearbeiten, Mitarbeiter anlegen und bearbeiten, Planung unterstützen sowie Mitarbeiter oder Projekte deaktivieren und wieder aktivieren. „Entfernen“ ist bewusst als nachvollziehbare Deaktivierung umgesetzt: Zeitdaten, Dokumente und Änderungsverläufe bleiben erhalten.

Wenn ein Mitarbeiter sein Smartphone nicht dabeihat oder Hilfe benötigt, kann das Büro eine aktuelle Zeitaktion stellvertretend auslösen. Die Demo speichert dabei getrennt, welcher Mitarbeiter betroffen ist, welches Verwaltungskonto gehandelt hat, wann die Aktion erfolgte und welcher Grund angegeben wurde. Rückwirkende Änderungen laufen weiterhin über den Korrekturprozess.

Der beantwortete Vorab-Fragebogen bestätigt die umfangreiche Verwaltungsrolle des Büros, aber mit einer wichtigen Ausnahme: Urlaubsanträge kann das Büro einsehen und vorbereiten; die endgültige Entscheidung liegt bei den beiden Geschäftsführungsrollen. Das gemeinsame Fahrzeuggerät zeigt als Demo-Ziel fünf Minuten bis zur automatischen Sperre. Die Namen der Büro-Demokonten sind erfunden. Diese statische Demo simuliert Bedienrechte nur im Browser; die echte Anwendung muss Anmeldung, Rollenrechte, sichere PIN-Wiederherstellung und Audit serverseitig erzwingen. Details stehen in [ADMIN_VERWALTUNG.md](./ADMIN_VERWALTUNG.md).

Unter „Dokumente & Exporte“ und in der jeweiligen Baustellenmappe stehen originalnah gestaltete Druckansichten für Arbeitszeitnachweis, Arbeitszettel, Materialanforderung, Materialeinsatz, Tageslohnnachweis, Aufmaß, Baubesprechungsprotokoll, Urlaubsantrag und Angebot bereit. Hinzu kommen XLSX-Exporte für Wochenplanung, Bauliste/Nachkalkulation, Projekt-Unterkonto, Urlaubsplaner und „Rechnung schreiben?“ sowie CSV-Ausgaben für Zeitdaten und die Rechnungsliste. Die Demo erzeugt ausschließlich neue Dateien und schreibt nie in eine bestehende Excel-Arbeitsmappe.

Die Bauliste und die Projekt-Unterkonten übernehmen beobachtete Struktur- und Formel-Beziehungen mit vollständig synthetischen Eingaben. Das kanonische Projektblatt orientiert sich nun an der anonymisierten Vorlagenstruktur B200; historische Ausnahmen und Formelverschiebungen werden ausdrücklich dokumentiert, nicht als neue Betriebsregel übernommen. App und XLSX verwenden dieselbe Demo-Rechnung; der private Kalkulationssatz ist durch einen ausdrücklich erfundenen Wert ersetzt. Der Urlaubsplaner bildet die sichtbare Jahresmatrix mit genehmigten synthetischen Abwesenheiten ab, aber keinen Anspruch oder Resturlaub. Der genaue Abgleich und die Grenzen stehen in [EXCEL_QUELLABGLEICH.md](./EXCEL_QUELLABGLEICH.md). Die allgemeine Referenzstruktur steht in [EXPORT_REFERENZ_MATRIX.md](./EXPORT_REFERENZ_MATRIX.md). Weder Originaldateien noch echte Inhalte liegen im öffentlichen Repository. Es gibt keine automatische Lohn-, Überstunden-, Fahrzeit- oder Aufmaßbewertung.

## Mobile Bestätigungen

Mitarbeiter können ihren eigenen Wochenzettel mobil prüfen, eine Korrektur melden und eine vollständige Version optional mit einer Finger-/Pointer-Unterschrift bestätigen. Jede Bestätigung friert den damaligen Inhalt als eigenen synthetischen Snapshot ein. Nach einer Bürokorrektur entsteht eine neue Version; eine alte Unterschrift wird nicht übernommen.

Zusatzarbeiten können vor Ort als dokumentierter Stand bestätigt werden. Ändert sich danach beispielsweise die Menge, bleibt die alte Bestätigung beim alten Inhalt und für den neuen Stand ist eine neue Bestätigung erforderlich. Dokumentationsbestätigung und kaufmännische Prüfung bleiben getrennt.

Das Demo-Benachrichtigungszentrum verlinkt direkt auf den betroffenen Wochenzettel. Die Browser-Notification-API kann eine lokale Testmeldung zeigen. Eine echte Zustellung bei geschlossener App wird ausdrücklich nicht simuliert.

Der technische und fachliche Ablauf ist in [MOBILE_BESTAETIGUNG.md](./MOBILE_BESTAETIGUNG.md) festgehalten.

## Bedienungsdemo kann jetzt zeigen

- Zeit und stellvertretende Büro-Hilfe
- echte zellenweise Wochenplanung, Mehrtages-/Kolonnenzuweisung, neue Woche, Vorwoche kopieren und Demo-Veröffentlichung
- Mitarbeiteransicht „Meine Woche“ und lokale Hinweise nach einer veröffentlichten Planänderung
- Projekte und Mitarbeiterverwaltung
- Korrekturen, Wochenzettel, Versionen und mobile Bestätigung
- Zusatzarbeiten, getrennte Dokumentationsbestätigung und kaufmännische Prüfung
- Digitalen Materialprozess von Anforderung über Entnahme bis Verbrauch und Projektzuordnung
- Digitalen Urlaubsantrag, Demo-Entscheidung und Anzeige in der Planung
- Lokale Fotovorschau und geprüften synthetischen Sprachentwurf
- Gemeinsames Fahrzeug-iPad mit Benutzerwahl, synthetischem 6-stelligem PIN, Sperre und Benutzerwechsel
- Offline-Bedienungssimulation mit sichtbarer Warteschlange
- Benachrichtigungseinstellungen und lokale Test-Benachrichtigung
- Feedback mit synthetischer Fallnummer
- Originalnahe Dokumente sowie PDF-/Druck-, XLSX- und CSV-Exporte
- kaufmännische Projekt-Rohwerte, manuelle Kosten, Eingangsrechnungszuordnung und geschriebene Rechnungen
- dynamische Wochenplanungs- und Projekt-Unterkonto-Exporte aus dem aktuellen Demo-Zustand

Die neuen Abläufe und ihre Grenzen stehen in [ERWEITERTE_WORKFLOWS_V10.md](./ERWEITERTE_WORKFLOWS_V10.md).

Der vollständige interne Praxistest mit 34 Bedienfällen ist in [VIDEO_CALL_QA.md](./VIDEO_CALL_QA.md) dokumentiert.

## Echtbetrieb erfordert noch

Authentifizierung, serverseitige Rechte, echte Offline-Synchronisierung, Dateiablage, Push, sichere PIN-Prüfung, produktive Exporte, Hosting, Backup/Restore, Datenschutz und weitere technische Anforderungen sind in [PRODUKTIVVERSION_ANFORDERUNGEN.md](./PRODUKTIVVERSION_ANFORDERUNGEN.md) festgehalten.

Noch nicht entschiedene Geschäftsregeln – darunter genaue Fahrzeit-/Überstundenbewertung, Materialbewertung, Urlaubs-Sonderfälle und die fachliche Freigabe der nun teilweise bekannten Original-Excel-Rechenwege – stehen in [OFFENE_FACHLICHE_PUNKTE.md](./OFFENE_FACHLICHE_PUNKTE.md). Bestätigte Zielrichtungen und produktive Umsetzungslücken sind dort getrennt. Keine Demo-Annahme ist allein durch ihre Darstellung zur verbindlichen Betriebsregel geworden.

OCR und KI, produktiver Rechnungseingang, echte Dateiablage, rechtswirksame Freigaben, echter Web Push sowie direkte Excel-Integration bleiben ausdrücklich zurückgestellt. Aufmaßformeln werden nicht erfunden.

Öffentliche Ansicht: https://rvfxghpjnm-a11y.github.io/maler-meyer-demo/

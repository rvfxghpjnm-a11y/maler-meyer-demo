# Maler-Meyer-Demo

Öffentliche, rein statische Bedienungsdemo für Maler Meyer. Sämtliche Personen, Baustellen, Zeiten, Zusatzarbeiten, Notizen und Dokumente sind erfunden.

Die Demo hat kein Backend, keine echte Anmeldung und keine Verbindung zu Maler Meyer. Eingaben und Statusänderungen werden ausschließlich lokal im jeweiligen Browser gespeichert und können über „Demo zurücksetzen“ vollständig verworfen werden.

Vier Perspektiven sind bedienbar: Geschäftsführung, Büro, Vorarbeiter und Mitarbeiter. Planung, Zeitereignisse, Korrekturen, Zusatzarbeiten, Baustellenmappe und Wochenzettel verwenden einen gemeinsamen synthetischen Demo-Zustand. Der erweiterte Datensatz umfasst vier Planungswochen und einen synthetischen Arbeitszeitverlauf vom 3. August bis 11. September 2026.

## Betriebsverwaltung und Büro-Hilfe

Torben, Steffen und die beiden vollständig synthetischen Büro-Demokonten besitzen in Demo-Version 10 dieselbe umfangreiche Verwaltungsansicht. Dort können sie Projekte anlegen und bearbeiten, Mitarbeiter anlegen und bearbeiten, Planung unterstützen sowie Mitarbeiter oder Projekte deaktivieren und wieder aktivieren. „Entfernen“ ist bewusst als nachvollziehbare Deaktivierung umgesetzt: Zeitdaten, Dokumente und Änderungsverläufe bleiben erhalten.

Wenn ein Mitarbeiter sein Smartphone nicht dabeihat oder Hilfe benötigt, kann das Büro eine aktuelle Zeitaktion stellvertretend auslösen. Die Demo speichert dabei getrennt, welcher Mitarbeiter betroffen ist, welches Verwaltungskonto gehandelt hat, wann die Aktion erfolgte und welcher Grund angegeben wurde. Rückwirkende Änderungen laufen weiterhin über den Korrekturprozess.

Diese Gleichstellung der vier Verwaltungskonten ist eine spätere Projektentscheidung vom 12. September 2026 und kein rückwirkender Meeting-Beschluss. Die Namen der beiden Büro-Demokonten sind erfunden. Die statische Demo simuliert Bedienrechte nur im Browser; die echte Anwendung muss Anmeldung, Rollenrechte und Audit serverseitig erzwingen. Details stehen in [ADMIN_VERWALTUNG.md](./ADMIN_VERWALTUNG.md).

Unter „Dokumente & Exporte“ und in der jeweiligen Baustellenmappe stehen originalnah gestaltete Druckansichten für Arbeitszeitnachweis, Arbeitszettel, Materialanforderung, Materialeinsatz, Tageslohnnachweis, Aufmaß, Baubesprechungsprotokoll, Urlaubsantrag und Angebot bereit. Hinzu kommen XLSX-Exporte für Wochenplanung, Bauliste/Nachkalkulation, Projekt-Unterkonto und „Rechnung schreiben?“ sowie CSV-Ausgaben für Zeitdaten und die Rechnungsliste. Die Demo erzeugt ausschließlich neue Dateien und schreibt nie in eine bestehende Excel-Arbeitsmappe.

Die Referenzstruktur und alle bewusst offenen Details sind in [EXPORT_REFERENZ_MATRIX.md](./EXPORT_REFERENZ_MATRIX.md) dokumentiert. Es gibt keine automatische Lohn-, Überstunden-, Fahrzeit- oder Aufmaßbewertung.

## Mobile Bestätigungen

Mitarbeiter können ihren eigenen Wochenzettel mobil prüfen, eine Korrektur melden und eine vollständige Version optional mit einer Finger-/Pointer-Unterschrift bestätigen. Jede Bestätigung friert den damaligen Inhalt als eigenen synthetischen Snapshot ein. Nach einer Bürokorrektur entsteht eine neue Version; eine alte Unterschrift wird nicht übernommen.

Zusatzarbeiten können vor Ort als dokumentierter Stand bestätigt werden. Ändert sich danach beispielsweise die Menge, bleibt die alte Bestätigung beim alten Inhalt und für den neuen Stand ist eine neue Bestätigung erforderlich. Dokumentationsbestätigung und kaufmännische Prüfung bleiben getrennt.

Das Demo-Benachrichtigungszentrum verlinkt direkt auf den betroffenen Wochenzettel. Die Browser-Notification-API kann eine lokale Testmeldung zeigen. Eine echte Zustellung bei geschlossener App wird ausdrücklich nicht simuliert.

Der technische und fachliche Ablauf ist in [MOBILE_BESTAETIGUNG.md](./MOBILE_BESTAETIGUNG.md) festgehalten.

## Bedienungsdemo kann jetzt zeigen

- Zeit und stellvertretende Büro-Hilfe
- Tages- und Wochenplanung
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

Die neuen Abläufe und ihre Grenzen stehen in [ERWEITERTE_WORKFLOWS_V10.md](./ERWEITERTE_WORKFLOWS_V10.md).

## Echtbetrieb erfordert noch

Authentifizierung, serverseitige Rechte, echte Offline-Synchronisierung, Dateiablage, Push, sichere PIN-Prüfung, produktive Exporte, Hosting, Backup/Restore, Datenschutz und weitere technische Anforderungen sind in [PRODUKTIVVERSION_ANFORDERUNGEN.md](./PRODUKTIVVERSION_ANFORDERUNGEN.md) festgehalten.

Noch nicht entschiedene Geschäftsregeln – darunter Fahrzeit, Überstunden, Materialbewertung, Urlaubsrechte, Offline-PIN und Original-Excel-Formeln – stehen in [OFFENE_FACHLICHE_PUNKTE.md](./OFFENE_FACHLICHE_PUNKTE.md). Keine Demo-Annahme ist allein durch ihre Darstellung zur verbindlichen Betriebsregel geworden.

OCR und KI, produktiver Rechnungseingang, echte Dateiablage, rechtswirksame Freigaben, echter Web Push sowie direkte Excel-Integration bleiben ausdrücklich zurückgestellt. Aufmaßformeln werden nicht erfunden.

Öffentliche Ansicht: https://rvfxghpjnm-a11y.github.io/maler-meyer-demo/


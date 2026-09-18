# Offene fachliche Punkte

Stand: 18. September 2026. Der beantwortete Vorab-Fragebogen und vier Original-Arbeitsmappen wurden nur lokal gelesen. Diese Datei enthält keine Originaldaten. Demo-Annahmen dürfen nicht als Betriebsregel in die Produktivversion übernommen werden.

## Durch den Vorab-Fragebogen geklärt (fachliche Zielrichtung)

- Geschäftsführung und Büro dürfen Projekte und Mitarbeiter verwalten, planen, Zeitkorrekturen und stellvertretende Buchungen bearbeiten, Wochenzettel prüfen sowie Material und kaufmännische Vorgänge einsehen bzw. bearbeiten. Die endgültige Urlaubsentscheidung liegt bei den beiden Geschäftsführungsrollen. Produktive Einzelberechtigungen sind trotzdem noch zu spezifizieren und serverseitig durchzusetzen.
- Genehmigter Urlaub soll in der Planung erscheinen. Für das registrierte gemeinsame Fahrzeuggerät sind ein persönlicher sechsstelliger PIN, Offline-Entsperrung als Ziel und fünf Minuten Inaktivität bis zur Sperre gewünscht. Das ist keine Sicherheitsfreigabe der Demo-Implementierung.
- Die Bau-Nr. wird nach Auftragserteilung vergeben. Eine vollständige digitale Lagerbestandsführung ist zunächst nicht beschlossen. Bestehende Papier- und Excel-Arbeitsmittel bleiben in der Übergangsphase erhalten.
- Die bereitgestellten Arbeitsmappen bestätigen eine zentrale Bauliste mit projektbezogenen Blättern, Wochenblätter der Planung und einen separaten Urlaubsplaner. Beobachtete Formeln sind noch keine freigegebenen Regeln für die neue App.

## Weiterhin offen oder für den Echtbetrieb zu präzisieren

1. Genaue Fahrzeitregel je Baustelle und ihre Vergütungs-/Zeitkontowirkung; der Fragebogen nennt fallabhängige Zeitgrenzen, aber keine vollständig implementierbare Semantik
2. Überstundenregel einschließlich unterschiedlicher Wochenmodelle, Zeitkonto und Auszahlung
3. Ob und wie Rüstzeit gesondert erfasst oder bewertet wird
4. Behandlung seltener Nacht-/Mitternachtsfälle; laut Fragebogen im heutigen Ablauf nicht üblich
5. Produktive Einzelrechte, Vertretung und Freigabegrenzen der Rollen
6. Reichweite der Vorarbeiterrechte
7. Sichtbarkeitsgrenzen und Datenschutz für operative Projekt-, Kunden- und Kontaktinformationen; der grundsätzliche Mitarbeiterbedarf wurde bestätigt
8. Detaillierter kaufmännischer Zusatzarbeitsprozess; Geschäftsführung und Büro sind hierfür grundsätzlich genannt
9. Rechtliche Bedeutung der dokumentierten Zusatzarbeitsbestätigung
10. Material: Umfang der Lagerwirtschaft, Artikelstamm, Barcode, Restmengen und Bestellprozess; Materialprüfung durch Geschäftsführung/Büro ist bestätigt
11. Urlaub: Resturlaub, Vertretung, halbe Tage, unbezahlter/Sonderurlaub und deren Berechnung; finale Entscheidung durch Geschäftsführung ist bestätigt
12. PIN: produktiv sichere Offline-Entsperrung, Wiederherstellung bei vergessenem PIN und Gerätesperre; Zielwert der Auto-Sperre ist fünf Minuten
13. Push: genaue Trigger, Empfänger und Zeitpunkte; die wichtigsten Meldungskategorien wurden im Fragebogen bestätigt
14. „Rechnung schreiben?“: endgültige Status, Verantwortlicher und Abschlusskriterium
15. OCR: Teil der ersten Produktivversion oder später
16. Original-Excel: Dateien liegen vor; vollständiger zellgenauer Audit von Formeln, Namen, verborgenen Bereichen, bedingten Formaten, Druckbereichen und Verknüpfungen sowie fachliche Freigabe für eine Neuberechnung stehen noch aus
17. Bau-Nr.: Die Vergabe nach Auftragserteilung ist bestätigt. Offen bleiben endgültiger Nummernaufbau, technische Reservierung bei parallelen Anlagen und ob/wie eine bereits verknüpfte Bau-Nr. geändert werden darf. `JJ-NNN` bleibt Demo-Vorschlag.
18. Betriebsrat und Mitbestimmung
19. Aufbewahrung und Löschfristen
20. Betreiber, AVV und Datenschutzverantwortung
21. Produktive Backup-Ziele, RPO/RTO und Zuständigkeit
22. Finaler Produktivhostname beziehungsweise Domain

Zusätzlich offen bleiben das endgültige Material-Bewertungsmodell, die Auswahl eines produktiven Spracherkennungsdienstes und die Regeln für Konflikte auf mehreren Offline-Geräten. Eine im Fragebogen erwähnte PIN-Hilfe durch das Büro darf nicht zu Klartext-PINs oder PIN-Einsicht führen; produktiv ist ein sicherer Zurücksetzungsprozess zu entwerfen.

23. Wochenplanung: Soll es im Echtbetrieb verbindlich die Zustände Entwurf und veröffentlicht geben?
24. Wochenplanung: Wer darf veröffentlichen, kurzfristig ändern und eine veröffentlichte Woche zurückziehen?
25. Wochenplanung: Welche Änderungen sollen eine Meldung auslösen und wie wird deren Kenntnisnahme behandelt?
26. Planung: Sind Schule/Fortbildung und sonstige Abwesenheit gewünschte feste Status oder nur Freitext?
27. Projektkosten: Wer darf Kostenpositionen, Eingangsrechnungen und geschriebene Rechnungen anlegen, ändern oder stornieren?
28. Projektkosten: Welche Beleg- und Pflichtfelder werden je Kostenart benötigt?
29. Eingangsrechnungen: Umsatzsteuerbehandlung, Prüfschritte, Kontierung und OCR-Zeitpunkt
30. Geschriebene Rechnungen: Verhältnis zwischen Projekt-Unterkonto, „Rechnung schreiben?“-Liste und späterem Rechnungssystem

# Auswertung Torben-Praxistest vom 30. September 2026

Diese Auswertung verbindet die heruntergeladene Praxistest-JSON-Datei mit den zwei nachgereichten Gesprächstranskripten. Sie enthält keine produktiven Personen-, Kunden- oder Projektdaten.

## Testergebnis

- 64 Prüfpunkte insgesamt
- 60 als erledigt gespeichert
- 1 zunächst als Fehler markiert: Urlaubsfreigabe war nicht sofort auffindbar; später im Gespräch unter `Mehr → Prüfen / Büro → Urlaub` gefunden
- 3 übersprungen: Fortschrittsnotiz, „Rechnung schreiben?“ und die dazugehörige Fachfrage
- 0 technische Fehler im Ereignisprotokoll der Testdatei

Die Zahlen beweisen die Bedienbarkeit des statischen Demos, nicht Produktivreife, Datensicherheit oder einen vollständigen produktiven Abnahmetest.

## Für den Pilot bestätigt

1. Torben, Steffen und das Büro erhalten in der Betriebsorganisation dieselben administrativen Rechte.
2. Der Pilotkern besteht aus Mitarbeiter-, Baustellen- und Wochenplanung, Zeitereignissen, Korrekturen, Wochenzetteln, Baustellendokumentation, Materialanforderungen, Urlaub und Hinweisen.
3. Die Heute-Ansicht zeigt zusätzlich Krank und Urlaub; „aktive Baustellen“ meint nur heute tatsächlich aktive Baustellen.
4. Neue Planungswochen beginnen leer. Mehrfachzuweisung bleibt als schnelle Planung erhalten.
5. Mitarbeitende sehen die eigene veröffentlichte Woche sowie die gesamte veröffentlichte aktuelle Wochenplanung nur lesend. Entwürfe bleiben im Büro.
6. Eine Person kann an einem Tag mehrere Stationen mit optionalen Zeiten erhalten. Für Sammel-Bau-Nr. wie `26-002` ist eine freie Beschreibung möglich.
7. Krank, Urlaub, Schule/Fortbildung und andere Abwesenheit können von–bis geplant werden.
8. Projektkontakte sind bei der Anlage optional. Nur Bau-Nr. und Projektname sind zwingend; weitere Angaben können nachgetragen werden.
9. Projektbedarf wird in Material für den ersten Arbeitstag, Gesamtmaterial und Maschinenbedarf getrennt.
10. Zusatzarbeit ist eine Information des Mitarbeiters an das Büro. Keine Vor-Ort-Unterschrift, automatische Arbeitsfreigabe oder Rechnungsfreigabe.
11. Material wird als Bedarf für den nächsten Arbeitstag, Mitnahme, tatsächlicher Einsatz und Korrektur/Rückgabe abgebildet. Noch keine Lagerwirtschaft.
12. Jeder Wochenzettel zeigt einzelne Zeitstempel und einzelne Pausen. Nach einer Änderung entsteht eine neue Version und der Mitarbeiter bestätigt erneut.
13. Erst nach Mitarbeiterbestätigung und Bürofreigabe darf eine DATEV-Übergabe vorbereitet werden.
14. Der erste echte Pilot startet mit drei Mitarbeitern und allen für sie relevanten Baustellen. Produktivdaten werden nicht aus dieser öffentlichen Demo übernommen.

## Präzisierte Fahrzeitregel

Im Gespräch wurden drei projektbezogene Varianten beschrieben:

- keine besondere Fahrzeitregel,
- Google-Maps-Fahrzeit über 45 Minuten: 30 Minuten Zeitgutschrift,
- Google-Maps-Fahrzeit über 60 Minuten: 30 Minuten Zeitgutschrift und früheres Baustellenende.

Wechselt eine Person anschließend auf eine nahe Baustelle, kann die Gutschrift entfallen; bei zwei entsprechend entfernten Baustellen kann sie gelten. Einzelfälle bleiben möglich. Die Demo kann die Regel am Projekt sichtbar erfassen. Eine produktive Lohn-/Überstundenberechnung braucht dennoch formale Beispielsfälle, Freigabe und Abnahmetests.

## Bewusst spätere Stufen

- Rechnung schreiben und OCR
- unternehmensweite Kostenübersicht als produktives App-Modul
- Ablösung der führenden Excel-Dateien
- Lagerbestand, Artikelstamm, Barcode und Bestellautomatik
- digitale Personalakte sowie automatische Resturlaubs-/Anspruchsberechnung
- echtes Push-System, produktive Offline-Synchronisierung und Konfliktauflösung

## Offene Produktionsfragen

- konkretes DATEV-Zielprodukt, Importformat, Pflichtfelder, Übertragungsweg und Rückmeldung bei Fehlern
- serverseitige Rechte, Vertretungen und Freigaben
- formale Umsetzung und Testfälle der Fahrzeit-/Überstundenregel
- genaue Standardpausen je Wochentag und Behandlung von Abweichungen
- Aufbewahrung, Löschung, AVV, Backup, Domain und Betreiberverantwortung
- Excel-Import: Speicherort, Leserechte, Aktualisierungsrhythmus und klare Trennung zu manuellen Pilotdaten



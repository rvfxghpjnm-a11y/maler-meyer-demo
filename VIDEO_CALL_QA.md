# Interner Torben-Praxistest – Demo-Version 19

Stand: 30. September 2026. Alle Fälle verwenden ausschließlich synthetische Daten. „Bestanden“ bezeichnet die Bedienungsdemo, nicht die Produktivreife. Die Aufgaben können jetzt zusätzlich im geführten interaktiven Praxistest bearbeitet werden. Audio wird nicht aufgenommen; eine iPad-Aufnahme läuft getrennt.

Der echte Torben-Praxistest wurde durchgeführt und als JSON plus zwei Transkripte ausgewertet: 60 von 64 Punkten wurden im Test als erledigt gespeichert, ein zunächst nicht gefundener Urlaubsablauf wurde später im Gespräch gefunden, drei Punkte wurden übersprungen. Die daraus abgeleiteten Änderungen und offenen Produktionsfragen stehen in `TORBEN_PRAXISTEST_AUSWERTUNG_2026-09-30.md`.

## Interaktiver Testmodus

- Einstieg über `Mehr → Interaktiver Praxistest`
- 34 Bedienaufgaben und 30 fachliche Abschlussfragen
- feste Steuerleiste während der normalen Demo-Bedienung
- Erledigt, Unklar, Fehler oder Übersprungen je Punkt
- Vor, Zurück und direkter Sprung über die Gesamtübersicht
- Pause und späteres Fortsetzen
- JSON-Zwischenstand beim Pausieren
- vollständige JSON-Ergebnisdatei beim Beenden
- lokale Speicherung im jeweiligen Browser
- keine Audioaufnahme, kein Upload und keine automatische Übermittlung
- Ergebnisdatei und externes iPad-Transkript anschließend gemeinsam an Codex übergeben

Die 30 Abschlussfragen sind mit dem PDF-Gesprächsleitfaden abgeglichen. Sie decken den benötigten Produktumfang, Rollen, Sichtbarkeit, Zeit- und Freigabeabläufe, Startdaten, Dokumente und Exporte, Excel, Geräte, Offline-Betrieb, Datenschutz, Pilot und Abnahme ab. Punkte, die Torben nicht abschließend entscheiden kann oder soll, werden ausdrücklich als später beziehungsweise vor Echtbetrieb zu klären festgehalten; sie werden nicht stillschweigend zur Geschäftsregel.

## Bestehende Bedienfälle 1–24

1. Geschäftsführer-Morgencheck – bestanden
2. Bau-Nr. suchen und Baustelle öffnen – bestanden
3. Krankmeldung und Umplanung – bestanden
4. Fahrzeug-iPad / 6-stelliger PIN – bestanden, nur Simulation
5. Offline Zeit und Notiz erfassen, danach synchronisieren – bestanden, nur Simulation
6. Büro bucht stellvertretend – bestanden
7. Vergessene Startzeit korrigieren – bestanden
8. Wochenzettel bestätigen und unterschreiben – bestanden
9. Bestätigten Wochenzettel korrigieren und erneut bestätigen – bestanden
10. Schaden mit Foto und Sprachentwurf dokumentieren – bestanden, lokale Vorschau/Demo-Text
11. Fortschrittsnotiz – bestanden
12. Material anfordern – bestanden
13. Materialentnahme und Verbrauch – bestanden
14. Büro bearbeitet Material – bestanden
15. Urlaub beantragen – bestanden
16. Urlaub genehmigen und Planung prüfen – bestanden, Rechte offen
17. Zusatzarbeit mit dokumentierter Bauleiterbestätigung – bestanden
18. Bestätigte Zusatzarbeit ändern – bestanden; alter Snapshot bleibt erhalten
19. „Rechnung schreiben?“ öffnen – bestanden
20. Nachkalkulation / Projekt-Unterkonto prüfen und exportieren – bestanden
21. Arbeitszettel, Materialanforderung und Aufmaß öffnen – bestanden
22. Neues Projekt in eigenständigem Ablauf anlegen – bestanden; ohne vermischte Mitarbeiteranlage
23. Neuen Mitarbeiter in eigenständigem Ablauf anlegen – bestanden; ohne automatische Baustellenzuordnung
24. Feedback / Bedienproblem über globale Suche finden, melden und Fall aufklappen – bestanden

## Neue Bedienfälle 25–34

25. Vollständige neue Woche planen – bestanden
26. Mittwoch einer zukünftigen Woche ändern – bestanden; heutige Zuordnung bleibt unberührt
27. Mehrere Mitarbeiter Montag bis Mittwoch derselben Baustelle zuordnen – bestanden
28. Vorwoche kopieren – bestanden, als Demo-Vorschlag bezeichnet
29. Mitarbeiter sieht seine eigene veröffentlichte Woche – bestanden
30. Veröffentlichte Planänderung erzeugt Mitarbeiter-Hinweis – bestanden, kein echter Push
31. Liftkosten manuell einem Projekt hinzufügen – bestanden
32. Externe Lieferantenrechnung manuell einer Bau-Nr. zuordnen – bestanden, keine OCR
33. Geschriebene Rechnung im Projekt erfassen – bestanden
34. Änderungen im Projekt-Unterkonto-XLSX kontrollieren – bestanden; Testwerte im Download nachgewiesen

## Automatisierte Nachweise

- `qa-browser.cjs`: Smartphone, Tablet und Desktop, Navigation, Rollen, Zeit, Korrekturen, Wochenplanung, Zusatzarbeiten und Datenschutz-/Requestprüfung
- `qa-admin-workflows.cjs`: vier Verwaltungskonten, Projekt/Mitarbeiter, Deaktivierung, Büro-Hilfe und responsive Verwaltung
- `qa-mobile-workflows.cjs`: Wochenzettelversionierung, Touch-/Maus-Signatur, Zusatzarbeitssnapshots und PDF-Druck
- `qa-completion-workflows.cjs`: Foto/Sprache, Material, Urlaub, PIN, Offline, Feedback und Reset
- `qa-final-practice.cjs`: Fälle 25–34 einschließlich dynamischem Projekt-Unterkonto-XLSX
- `qa-exports.cjs` und `qa-xlsx.mjs`: PDF-, XLSX- und CSV-Erzeugung, Dateiformate, Formeln und Fehlerwerte
- `qa-source-excel.cjs`: datierte akzeptierte Projektstunden, Wochenwerte, Summenanker und Fortsetzung über 54 Kalenderwochen
- `qa-year-week.cjs`: unabhängige Planung und XLSX-Blätter für gleiche Kalenderwochennummern verschiedener Jahre
- `qa-mobile-workflows.cjs`: zusätzlich Bürokorrektur bis zu den datierten Stunden des Projekt-Unterkontos verfolgt
- `qa-family-feedback.cjs`: Familientest-Korrekturen für Startseite, Funktionssuche, getrennte Anlagewege, Projektfelder, Zusatzarbeitsfilter, Drucknavigation und horizontale Layoutgrenzen
- `qa-interactive-test.cjs`: Start, Aufgaben/Fachfragen, feste Steuerung, Pause, Zwischenstandsdownload, Zurück/Überspringen/Direktsprung, Abschlussdownload sowie iPhone-/iPad-Layout

## Bewusste Grenzen

Entwurf/Veröffentlichung, Mehrfachplanung, Statusauswahl und Erinnerungen sind UI-Vorschläge. Rechte, Push, Offline-Synchronisation, Sicherheit, Original-Excel-Formeln, kaufmännische Freigaben, Umsatzsteuer- und Kontierungslogik bleiben offen beziehungsweise produktiv neu umzusetzen.


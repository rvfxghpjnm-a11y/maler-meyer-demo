# Interner Torben-Praxistest – Demo-Version 11

Stand: 15. September 2026. Alle Fälle verwenden ausschließlich synthetische Daten. „Bestanden“ bezeichnet die Bedienungsdemo, nicht die Produktivreife.

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
22. Neues Projekt anlegen – bestanden
23. Neuen Mitarbeiter anlegen – bestanden
24. Feedback / Bedienproblem melden – bestanden

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

## Bewusste Grenzen

Entwurf/Veröffentlichung, Mehrfachplanung, Statusauswahl und Erinnerungen sind UI-Vorschläge. Rechte, Push, Offline-Synchronisation, Sicherheit, Original-Excel-Formeln, kaufmännische Freigaben, Umsatzsteuer- und Kontierungslogik bleiben offen beziehungsweise produktiv neu umzusetzen.

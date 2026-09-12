# Mobile Bestätigung, Korrektur und Benachrichtigung

Stand: 12. September 2026  
Geltungsbereich: öffentliche statische Bedienungsdemo, ausschließlich synthetische Daten

## Wochenzettel

Der Mitarbeiter öffnet `Wochenzettel`, prüft die Tageszeilen und wählt `Korrektur melden` oder `Bestätigen`. Eine Bestätigung erzeugt einen eingefrorenen Snapshot mit Mitarbeiter-ID, Kalenderwoche, Version, Zeitpunkt, bestätigendem Demo-Benutzer, damaligem Dokumentinhalt, Snapshot-ID, Demo-Hash, Status und optionaler gezeichneter Unterschrift.

Eine nachträgliche Korrektur überschreibt diesen Snapshot nicht. Die Mitarbeiteranfrage enthält Tag, betroffene Buchung, Fehlerbeschreibung und gewünschten Wert. Nach Bearbeitung durch Büro/Geschäftsführung entsteht eine neue Version mit `Erneute Bestätigung erforderlich`. Die alte Version wird als ersetzt gekennzeichnet; Inhalt und Unterschrift bleiben unverändert. Eine alte Unterschrift wird nie auf die neue Version kopiert.

Die Büro-/Admin-Freigabe ist ein eigener Datensatz und erst möglich, nachdem der Mitarbeiter die aktuelle Version bestätigt hat.

## Zusatzarbeit

Die aktive Zusatzarbeit und jede Bestätigung sind getrennte Datensätze. Eine Bestätigung friert Bau-Nr., Baustelle, Beschreibung, Menge/Einheit, optionalen Zeitaufwand, Name/Funktion des Bestätigenden, Zeitpunkt, Demo-Hash und optionale gezeichnete Unterschrift ein.

Wird ein aktiver Inhalt geändert, passt die frühere Bestätigung nicht mehr zum aktuellen Demo-Hash. Die Oberfläche zeigt dann `Inhalt geändert · neue Bestätigung erforderlich`. Eine neue Bestätigung erzeugt einen weiteren Snapshot. Kaufmännische Prüfung und Dokumentationsbestätigung sind unabhängige Status.

## Wiederverwendbares Signaturfeld

`signature-pad.js` verwendet Pointer Events und funktioniert mit Finger, Apple Pencil, kompatiblem Stift und Maus. Vor dem Zeichnen muss das Feld bewusst aktiviert werden; bis dahin bleibt vertikales Scrollen über der Fläche möglich. Erst das aktive Canvas verwendet `touch-action: none`. Löschen und erneutes Zeichnen sind möglich. Die PNG-Daten-URL wird erst nach `Bestätigung speichern` in den zugehörigen Snapshot geschrieben. `Ohne Unterschrift bestätigen` speichert ausdrücklich keine Bilddaten.

Die Signaturkomponente ist in dieser Ausbaustufe nur für Wochenzettel- und Zusatzarbeitsbestätigung aktiviert.

## Benachrichtigungen

Das lokale Demo-Zentrum enthält den Beispielhinweis `Wochenübersicht KW 37 wartet auf deine Bestätigung.` und öffnet direkt den betroffenen Wochenzettel. `Beispiel-Erinnerung: Freitag 16:00 Uhr` ist als konfigurierbare Demo-Annahme gekennzeichnet.

Die optionale Browser-Testbenachrichtigung verwendet nur die Notification API der geöffneten Seite. Echte Zustellung bei geschlossener App erfordert später mindestens Push-Service, Service Worker, Backend-Zeitplanung, Geräteberechtigung sowie eine sichere Benutzer-/Gerätezuordnung.

## Fachliche und rechtliche Grenzen

- Keine Aussage zu Rechtsverbindlichkeit, Beauftragung, Abnahme, Rechnungsfreigabe oder qualifizierter elektronischer Signatur.
- Keine Lohn-, Fahrt-, Überstunden-, Rüstzeit- oder Nachtarbeitsbewertung.
- Keine Original-Unterschriften oder Produktivdaten.
- Original-XLSX-Formeln und Zellverknüpfungen bleiben bis zur separaten Analyse OFFEN.

## Automatisierte Prüfungen

`qa-mobile-workflows.cjs` prüft Smartphone, Tablet und Desktop, Touch-/Maus-Signatur, Löschen und Neuzeichnen, Bestätigung ohne Signatur, Korrektur und Version 2, unveränderten alten Snapshot, nicht übernommene Unterschrift, Zusatzarbeit 18 m² → 24 m², getrennte Bestätigungen, Benachrichtigungsnavigation und beide neuen Druckansichten.

# Torben-Praxistest: Altprozess und App vergleichen

Die öffentliche Demo ist **kein paralleles Betriebssystem für echte Daten**. Sie ist statisch, ohne Backend, echte Anmeldung, gemeinsame Datenbank oder verlässliche Synchronisierung. Daten bleiben im jeweiligen Browser. Deshalb hier **niemals echte Mitarbeiter, Kunden, Bauvorhaben, Zeiten, Rechnungen oder Fotos eingeben**.

## Sichtbarer synthetischer Vergleichsfall

Auf Torbens Startseite „Praxistest laden“ wählen. Das ergänzt den vorhandenen Browserzustand einmalig und öffnet die Baustelle. Ein Zurücksetzen der Demo entfernt den Fall wieder. Bei frischem Ausgangsstand entsteht Bau-Nr. `26-107`; ist diese schon belegt, nimmt die Demo die nächste freie Nummer des Jahres 2026.

| Eingabe / Vorgang | Synthetischer Testwert | In der Demo prüfen |
|---|---:|---|
| Projekt | Projekt Stephan (Demo), Auftragswert netto 6.000 € | Baustellenmappe, Bauliste |
| Neue Mitarbeitende | Stefan Eins (Demo), Stefan Zwei (Demo) | Mitarbeiter, Wochenplanung |
| Soll-Stunden | 100 h als Projekt-Eingabe; 6.000 € / frei erfundener Demo-Satz 60 €/h = 100 h | Projektansicht; **keine beschlossene Kalkulationsregel** |
| Planung | KW 38/2026, Montag und Dienstag beide auf Projekt | Wochenmatrix und XLSX |
| Akzeptierte Zeit | je Person 4 h an zwei Tagen = 16 h | Zeitprojektion, Unterkonto, Bauliste |
| Fahrt | je Person/Tag 30 min = 2 h roh | Unterkonto; **keine Lohnbewertung** |
| Material | 3 Rollen Abdeckvlies angefordert, entnommen und verbraucht | Materialverlauf; Verbrauch ohne Preis |
| Eingangsrechnung | 120 € netto, dem Projekt zugeordnet | Kosten & Rechnungen, Unterkonto |
| Lift | 80 € netto | Kosten & Rechnungen, Unterkonto |
| Geschriebene Rechnung | 1.200 € netto | Kosten & Rechnungen, Rechnungsliste, Unterkonto |
| Demo-Vergleichsrechnung | 16 × 60 € + 120 € + 80 € = 1.160 €; 1.200 € − 1.160 € = 40 € | ausschließlich synthetische Nachrechnung; **keine freigegebene Wirtschaftlichkeits- oder Lohnregel** |

Die Ausgangs-Eingaben sind absichtlich so gewählt, dass man jeden Zwischenschritt im Kopf prüfen kann. Die Demo erzeugt aus demselben lokalen Zustand Projektansicht und Export. Die historische Formelstruktur ist beobachtet, aber ihre Verwendung als künftige Betriebsregel ist nicht pauschal beschlossen.

## Sinnvoller echter Parallelbetrieb – erst in einer gesicherten Produktiv-/Pilotumgebung

1. **Einmalige Basis statt doppelter Dauerpflege:** Mitarbeiter und aktive Projekte nach berechtigter, kontrollierter Übernahme einmalig anlegen; Bau-Nr. dabei als Abgleichschlüssel verwenden. Die alte Excel-/Papierwelt bleibt zunächst maßgeblich. Keine öffentlichen Demo-Daten dafür verwenden.
2. **Klein beginnen:** Ein bis zwei neue reale Baustellen für einen begrenzten Zeitraum auswählen; Torben und Büro legen fest, welche Werte täglich und wöchentlich verglichen werden. Nicht sofort den gesamten Betrieb doppelt buchen lassen.
3. **Morgens:** Neue Bau-Nr. und Projektstammdaten in beiden Welten kontrollieren; Wochenplan/Abwesenheiten abgleichen; Änderungen dokumentieren.
4. **Tagsüber:** Mitarbeiter erfassen Zeitereignisse, Material und Notizen in der gesicherten Pilot-App. Bei fehlendem Gerät hilft das Büro mit einer nachvollziehbaren stellvertretenden Buchung. Papier/Excel bleiben als bisheriger Kontrollweg bestehen, bis der Pilot fachlich abgenommen ist.
5. **Abends:** Fehlende Starts/Enden und Baustellenwechsel prüfen. Nicht automatisch aus Rohfahrten bezahlte Zeit machen. Abweichungen mit Datum, Bau-Nr. und Ursache notieren.
6. **Wöchentlich:** Wochenzettel je Mitarbeiter prüfen und bestätigen; später relevante Korrekturen als neue Version. Summen gegen den bisherigen Nachweis vergleichen. Ungeklärte Differenzen nicht still in einer der Welten „glattziehen“.
7. **Projektbezogen:** Material, Eingangsrechnungen, Lift/andere externe Kosten und geschriebene Rechnungen gegen Belege und Unterkonto abgleichen. Bei der Bauliste zuerst Rohwerte und mathematische Summen, danach erst historisch offene Kennzahlen bewerten.
8. **Entscheidung vor Umstellung:** Torben und Büro zeichnen einen Vergleichsbericht ab: fehlende Felder, unklare Rechte/Regeln, Zeitdifferenzen, Exportabweichungen und notwendige Korrekturen. Erst danach entscheiden, welches System wann führend wird.

Wichtig: Eine produktive Zeitfreigabe braucht serverseitig geprüfte Rollen, unveränderbare Rohereignisse, Korrektur- und Bestätigungsstände sowie Audit. Die aktuelle Demo simuliert die Bedienung, nicht diese Sicherheit. Historische Excel-Formeln mit vertraulichen Sätzen oder Auffälligkeiten werden nicht automatisch zu neuen Fachregeln. Details: [PRODUKTIVVERSION_ANFORDERUNGEN.md](./PRODUKTIVVERSION_ANFORDERUNGEN.md), [OFFENE_FACHLICHE_PUNKTE.md](./OFFENE_FACHLICHE_PUNKTE.md).

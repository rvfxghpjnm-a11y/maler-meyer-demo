# Maler Meyer – fachliche Soll-Matrix der Bedienungsdemo

Stand: 12. September 2026  
Zweck: Fachliche Vorbereitung und Bestandsprüfung vor weiterer Programmierung  
Bewertete Demo-Basis: öffentliche, rein statische Bedienungsdemo (Demo-Version 5)

Freigabevermerk vom 12. September 2026: Die Ausbaustufen 1 bis 6 sind zur Umsetzung freigegeben. Ausbaustufe 7 bleibt ausdrücklich für später zurückgestellt und benötigt eine neue Freigabe.

## 1. Abgrenzung

Dieses Dokument ist keine Implementierungsfreigabe und enthält keine Änderung am Anwendungscode.

- Es dürfen ausschließlich vollständig erfundene Personen, Baustellen, Adressen, Fotos und Geschäftsvorgänge verwendet werden.
- Die Bedienungsdemo simuliert Abläufe. Sie ist kein Produktivsystem, besitzt derzeit kein Backend, keine echte Anmeldung und keine dauerhafte Speicherung.
- Offene Fahrzeit-, Überstunden-, Rüstzeit- und Lohnregeln werden weder berechnet noch als entschieden dargestellt.
- Eine dokumentierte Zusatzarbeit ist keine automatische Rechnungsfreigabe und keine rechtsverbindliche Abnahme.
- Die vorhandene Excel-Nachkalkulation bleibt zunächst bestehen. Die App liefert später Exportdaten und schreibt in V1 nicht direkt in diese Datei.
- Die spätere echte Anwendung bleibt eine React/Vite-, NestJS/Fastify- und PostgreSQL-Anwendung mit serverseitigen Rechten, Audit und Offline-Synchronisation. Die statische Demo ist nur ein fachlicher Bedienungsprototyp.

## 2. Legende

- **[1 – BESCHLOSSEN]**: Im Meeting ausdrücklich bestätigt, gezeigt oder als Ablauf festgelegt.
- **[2 – WAHRSCHEINLICH]**: Fachlich naheliegend, aber im Meeting nicht abschließend als Software-Regel beschlossen.
- **[3 – OFFEN]**: Nicht abschließend geklärt. In der Demo nur als deutlich benannte „Demo-Annahme“ zulässig.
- **Vorhanden**: In der gegenwärtigen Demo bedienbar oder sichtbar.
- **Teilweise / Simulation**: Nur ein Teilablauf oder eine flüchtige Simulation ist vorhanden.
- **Platzhalter**: Die Oberfläche kündigt eine Funktion an, führt sie aber nicht fachlich durch.
- **Fehlt**: Im aktuellen Demo-Stand nicht vorhanden.

Die Szenarien `S01` bis `S25` entsprechen der nummerierten Szenarienliste aus der fachlichen Übergabe.

## 3. Soll-Matrix

### 3.1 Rollenübergreifende Grundlagen

| Rolle | Ansicht | Funktion | fachlicher Status | synthetisches Testszenario | erforderliche Demo-Daten | Navigation | mögliche Nutzeraktion | erwartetes Ergebnis | offene Frage, falls vorhanden |
|---|---|---|---|---|---|---|---|---|---|
| Alle | Anmeldung / Rollenwahl | Nutzerfreundliche Anmeldung und rollenabhängige Oberfläche | [1 – BESCHLOSSEN] für Rollen; konkrete Demo-Anmeldung folgt Projektentscheidungen | S24 sowie Rollenwechsel | Konten für Torben, Büro, Vorarbeiter und Mitarbeiter | Anmeldung → Rolle | Mit Demo-Konto anmelden bzw. Perspektive wechseln | Jede Rolle landet in einer passenden, verständlichen Startansicht | Keine offene Frage für die Demo; echte Authentifizierung ist nicht Bestandteil der statischen Demo |
| Alle | Kopfbereich | Testsystem und synthetische Daten dauerhaft erkennbar machen | Projektgrenze | alle | Demo-Kennzeichen, fiktiver Stichtag | auf jeder Ansicht sichtbar | Infohinweis öffnen | Kein Nutzer hält Demo-Daten oder Simulationen für produktiv | Keine |
| Alle | Suche | Bau-Nr., Baustelle oder Mitarbeiter finden | [1 – BESCHLOSSEN] für Bau-Nr.; Suche ist zwingendes Demo-Ziel | S19, S20 | Bau-Nrn., Kurznamen, Mitarbeiter, Status, Zuordnungen | globale Suche | Suchbegriff eingeben und Ergebnis öffnen | Passende Baustelle bzw. Person ist unmittelbar erreichbar | Welche personenbezogenen Treffer normale Mitarbeiter später sehen dürfen [3] |
| Geschäftsführung / Büro | Änderungsverlauf | Relevante Änderungen nachvollziehen | [1 – BESCHLOSSEN] für Nachvollziehbarkeit; Detailfelder [2] | S07, S14, S15, S16 | Original, neuer Wert, Bearbeiter, Rolle, Zeitpunkt, Grund, Objekt | Vorgang → Verlauf | Änderung öffnen | Vorher/Nachher und Urheber bleiben sichtbar | Welche Stammdaten vollständig versioniert werden müssen [3] |
| Alle | Feedback | Fehler oder Verbesserung melden | [2 – WAHRSCHEINLICH] aus Meeting; verbindliche Projektentscheidung D-007 | eigener Demo-Fall | Kategorie, Beschreibung, Zeitpunkt, Demo-Fallnummer | Mehr → Feedback / Fehler melden | Meldung senden | Sichtbare Bestätigung und synthetische Fallnummer; keine echten Daten | Benachrichtigungsweg im Echtbetrieb ist offen |

### 3.2 Geschäftsführung und Tageslage

| Rolle | Ansicht | Funktion | fachlicher Status | synthetisches Testszenario | erforderliche Demo-Daten | Navigation | mögliche Nutzeraktion | erwartetes Ergebnis | offene Frage, falls vorhanden |
|---|---|---|---|---|---|---|---|---|---|
| Geschäftsführung | Heute | Morgendliche Lageübersicht | [1 – BESCHLOSSEN] | S24, S25 | Status aller Testmitarbeiter, aktive Baustellen, Zusatzarbeiten, Zeitprobleme, Wochenzettel | Heute | Aufmerksamkeitspunkt öffnen | Torben versteht in 5–10 Sekunden, was läuft und wo Handlungsbedarf besteht | Keine |
| Geschäftsführung | Heute / Mitarbeiter | Status arbeitet, Pause, unterwegs, noch nicht gestartet | [1 – BESCHLOSSEN] | S01–S05, S23, S24 | aktuelle Ereignisfolge und Baustellenzuordnung | Heute → Statuskachel / Mitarbeiter | Status filtern, Person öffnen | Liste und Detail passen zu den Ereignissen | Schwelle für automatische Warnung „nicht gestartet“ [3] |
| Geschäftsführung | Heute / Mitarbeiter | Status beendet, nicht eingeplant und Prüfbedarf | [2 – WAHRSCHEINLICH] | S05, S13, S23 | Tagesabschluss, Planung, erkannte Inkonsistenz | Mitarbeiter → Filter | Filter auswählen | Normaler Zustand und Prüfbedarf werden textlich unterscheidbar angezeigt | Wann „nicht eingeplant“ ein Problem ist [3] |
| Geschäftsführung | Aufmerksamkeit nötig | Auffälligkeiten ohne Einzelprüfung bündeln | [1 – BESCHLOSSEN] | S02, S05, S08, S10, S13, S24 | offene Starts, Zeitfehler, neue Zusatzarbeiten, offene Wochenzettel, Korrekturen | Heute → Aufmerksamkeit | Prüfen / Ansehen | Direkter Sprung zum betroffenen Vorgang mit Kontext | Warnschwelle für fehlenden Start [3] |
| Geschäftsführung | Baustellen | Aktive Baustellen und Belegung überblicken | [1 – BESCHLOSSEN] | S18, S24, S25 | fünf oder mehr aktive Baustellen, Mitarbeiterstatus, offene Punkte | Baustellen | Baustelle auswählen | Bau-Nr., Lage, Team und Auffälligkeiten sind auf einen Blick sichtbar | Keine |
| Geschäftsführung | Tagesplanung | Mitarbeiter einer Bau-Nr. zuordnen und kurzfristig umplanen | [2 – WAHRSCHEINLICH]; vollständige Wochenplanung später | S15, S17 | ursprüngliche und aktuelle Tageszuweisung, Änderungsgrund, Bearbeiter | Heute / Baustellen → Planung | Person verschieben oder neue Baustelle wählen | Aktuelle Zuweisung ändert sich in allen Ansichten; Änderung ist nachvollziehbar | Endgültige Planungsrechte und primäre Tages-/Wochenansicht [3] |
| Geschäftsführung | Mitarbeiterdetail | Heutigen Status, Baustelle und Ereignisfolge prüfen | [1 – BESCHLOSSEN] für Lage; Details [2] | S01–S07, S20 | Person, Rolle, Planung, Zeitereignisse, Korrekturen | Mitarbeiter → Person | Verlauf aufklappen, Korrektur öffnen | Information erscheint direkt bei der Person; keine Suche am Seitenende | Sichtbarkeit weiterer Mitarbeiterdaten [3] |
| Geschäftsführung | Mehr / Verwaltung | Nutzer, Rollen, Support- und Updatebereiche erreichen | [2 – WAHRSCHEINLICH] aus Meeting; Projektentscheidungen verbindlich | Demo-Verwaltungsfall | synthetische Konten, Rollen, Support- und Updatebeispiele | Mehr | Bereich öffnen | Seltene Verwaltungsfunktionen sind getrennt von der Tagesarbeit | Exakte Rechteverteilung zwischen Geschäftsführung und Büro [3] |

### 3.3 Büro

| Rolle | Ansicht | Funktion | fachlicher Status | synthetisches Testszenario | erforderliche Demo-Daten | Navigation | mögliche Nutzeraktion | erwartetes Ergebnis | offene Frage, falls vorhanden |
|---|---|---|---|---|---|---|---|---|---|
| Büro | Büro-Startseite | Offene Prüfaufgaben bündeln | [2 – WAHRSCHEINLICH] | S05–S14, S22 | Zeitprobleme, Korrekturen, Zusatzarbeiten, Wochenzettel, Abrechnungshinweise | Heute / Büro | Arbeitsvorrat öffnen | Büro sieht zuerst die zu bearbeitenden Fälle statt einer reinen Live-Lage | Ob jede Bürokraft identische Rechte hat [3] |
| Büro | Zeiten prüfen | Fehlende und auffällige Buchungen bearbeiten | [1 – BESCHLOSSEN] für digitale Plausibilitätsunterstützung; Bearbeitung [2] | S05, S06, S07 | Originalereignisse, Korrekturanfrage, Vorschlag, Bearbeiter, Grund | Zeiten prüfen | Anfrage öffnen, korrigieren oder zurückstellen | Original bleibt erhalten; Korrektur und Bearbeiter erscheinen im Verlauf | Exakte Freigabe- und Eskalationsregeln [3] |
| Büro | Wochenzettel | Vollständigkeit prüfen und betrieblich freigeben | [2 – WAHRSCHEINLICH]; V1-Projektentscheidung | S12–S14 | fünf Tage, Baustellen, Beginn, Pause, Ende, Fahrt, Version, Status | Wochenzettel | prüfen, Rückfrage markieren, freigeben | Fehler blockiert klare Freigabe; spätere Änderung erzeugt erneuten Prüfbedarf | Exakter Freigabe-/Rückgabeprozess [3] |
| Büro | Zusatzarbeiten | Dokumentation kaufmännisch prüfen | [1 – BESCHLOSSEN] für Entscheidung im Betrieb; Rollenanteil [3] | S08–S11 | Beschreibung, Menge, Foto, Bestätigung, Dokumentations- und Kaufmannsstatus | Zusatzarbeiten | Status prüfen, Begründung erfassen | „Dokumentiert“ bleibt getrennt von „zur Abrechnung vorgesehen“ | Darf jede Bürokraft „zur Abrechnung“ setzen? [3] |
| Büro | Exporte | Zeit-, Wochenzettel- und Nachkalkulationsdaten erzeugen | [1 – BESCHLOSSEN] für Export und Excel-Fortbestand | S12–S14 sowie Exportfälle | Zeitereignisse, Bau-Nr., Mitarbeiter, getrennte Fahrzeit, Prüfstatus | Mehr / jeweilige Liste → Export | Zeitraum/Filter wählen, Datei erzeugen | Datei enthält nur synthetische gefilterte Daten; keine Lohnbewertung | Endgültiges CSV-/XLSX-Format und Spaltenreihenfolge [3] |

### 3.4 Vorarbeiter

| Rolle | Ansicht | Funktion | fachlicher Status | synthetisches Testszenario | erforderliche Demo-Daten | Navigation | mögliche Nutzeraktion | erwartetes Ergebnis | offene Frage, falls vorhanden |
|---|---|---|---|---|---|---|---|---|---|
| Vorarbeiter | Heute / Kolonne | Eigene Baustelle und zugeordnete Kolonne sehen | [2 – WAHRSCHEINLICH] | S16 | Vorarbeiter, drei zugeordnete Personen, Baustelle, jeweiliger Status | Heute → Kolonne | Mitarbeiter auswählen | Nur der für die Demo zugeordnete Personenkreis wird angeboten | Reichweite: eigene Kolonne, Baustelle oder weitere Personen [3] |
| Vorarbeiter | Kolonnenbuchung | Ereignis für mehrere Mitarbeiter auslösen | [1 – BESCHLOSSEN] | S16 | pro Person eigener Event, handelnder Vorarbeiter, Baustelle, Gerät, Zeitpunkt | Kolonne → gemeinsame Aktion | drei Personen markieren und Arbeit starten | Für jede Person entsteht ein eigener Eintrag; „gebucht durch Vorarbeiter“ ist sichtbar | Exakte Reichweite der Vorarbeiterrechte [3] |
| Vorarbeiter | Baustellenmappe | Team, Aufgaben und Dokumentation der eigenen Baustelle nutzen | [2 – WAHRSCHEINLICH] | S18, S21 | Baustellendaten, Team, Aufgaben, Notizen, Fotos, Zusatzarbeiten | Baustelle | Notiz/Foto prüfen oder hinzufügen | Mehr Baustellenkontext als beim Mitarbeiter, weniger Verwaltung als im Büro | Welche Aktenbestandteile sichtbar sind [3] |

### 3.5 Mitarbeiter

| Rolle | Ansicht | Funktion | fachlicher Status | synthetisches Testszenario | erforderliche Demo-Daten | Navigation | mögliche Nutzeraktion | erwartetes Ergebnis | offene Frage, falls vorhanden |
|---|---|---|---|---|---|---|---|---|---|
| Mitarbeiter | Heute | Aktuelle geplante Baustelle prominent anzeigen | [1 – BESCHLOSSEN] für Zuordnung; Vorschlag [2] | S01, S02, S15 | aktuelle Tageszuweisung, Bau-Nr., Kurzname, Adresse, Status | Heute | Baustelle ansehen | Mitarbeiter erkennt ohne Verwaltungssicht, wo er heute arbeiten soll | Welche weiteren Projektinformationen sichtbar sind [3] |
| Mitarbeiter | Heute | Arbeit auf vorgeschlagener Baustelle starten | [1 – BESCHLOSSEN] | S01 | geplanter Einsatz, Startzeit, Ereignisautor | Heute → Arbeit starten | Hauptbutton drücken | Status wird „Arbeitet“ und Ereignis erscheint im Tagesverlauf | Keine |
| Mitarbeiter | Heute | Tatsächliche Pause starten und beenden | [1 – BESCHLOSSEN] | S03 | BREAK_START, BREAK_END, Gerätezeit | Hauptbutton je Status | Pause starten / beenden | Status und tatsächliche Dauer sind sichtbar; kein Soll-Abzug | Warnungen zu Pausenlänge [3] |
| Mitarbeiter | Baustellenwechsel | Baustelle verlassen, Fahrt beginnen, ankommen und weiterarbeiten | [1 – BESCHLOSSEN] für Rohablauf; keine Lohnwertung | S04 | SITE_LEAVE, TRAVEL_START, Ziel-Bau-Nr., TRAVEL_END, WORK_RESUME | Heute → Baustelle wechseln | Ziel wählen, Fahrt/Ankunft bestätigen | Fahrzeit ist separat und die neue Baustelle wird aktuell | Bewertung/Schwellen von Fahrzeit [3] |
| Mitarbeiter | Baustellenauswahl | Abweichende aktive Baustelle auswählen | [2 – WAHRSCHEINLICH]; V1-Projektentscheidung D-018 | S17 | geplante und tatsächliche Baustelle, Auswahlgrund optional | Heute → andere Baustelle | aktive Bau-Nr. wählen | Tatsächliche Zuordnung ist dokumentiert und Tageslage aktualisiert | Ob und wann Freigabe nötig ist [3] |
| Mitarbeiter | Heute | Feierabend buchen | [1 – BESCHLOSSEN] | S04, S05 | WORK_END und vorherige Ereignisfolge | Hauptbutton | Feierabend drücken | Status „Beendet“; unvollständige Folge wird als Prüfbedarf sichtbar | Nacht-/Mitternachtsfälle [3] |
| Mitarbeiter | Korrekturmeldung | Fehler melden, nicht selbst überschreiben | [2 – WAHRSCHEINLICH]; V1-Projektentscheidung D-015 | S06 | Typ, gewünschte Zeit/Zuordnung, Begründung, Originalzustand | Weitere Aktionen → Korrektur melden | Meldung senden | Offener Fall entsteht; Zeitdaten bleiben unverändert | Exakte Eskalationsregeln [3] |
| Mitarbeiter | Zusatzarbeit | Zusatzleistung auf Baustelle erfassen | [1 – BESCHLOSSEN] | S08–S10 | Bau-Nr., Mitarbeiter, Zeitpunkt, Beschreibung; optional Menge, Einheit, Zeit, Foto, Kontakt, Bestätigung | Zusatzarbeit | Formular ausfüllen und speichern | Vorgang erscheint sofort bei Baustelle und kaufmännischer Prüfung | Pflichtfelder Menge/Foto [3] |
| Mitarbeiter | Notiz / Foto | Problem oder Fortschritt dokumentieren | [1 – BESCHLOSSEN] | S21 | Bau-Nr., Autor, Zeitpunkt, Kategorie, Text, synthetisches Bild | Notiz / Foto | Foto aufnehmen/auswählen, beschreiben, speichern | Eintrag erscheint direkt in der Baustellenmappe | Welche Inhalte normale Mitarbeiter später wiedersehen dürfen [3] |
| Mitarbeiter | Wochenzettel | Eigene Woche prüfen und bestätigen | [2 – WAHRSCHEINLICH]; V1-Projektentscheidung D-020 | S12–S14 | Tag, Bau-Nr., Beginn, Pause, Ende, Fahrt, Fehler, Version | Mehr → Wochenzettel | Tag öffnen, Korrektur melden, Woche bestätigen | Unvollständige Woche wird nicht als vollständig dargestellt; Bestätigung ist nachvollziehbar | Rechtlicher Charakter und Detailprozess [3] |

### 3.6 Digitale Baustellenmappe

| Rolle | Ansicht | Funktion | fachlicher Status | synthetisches Testszenario | erforderliche Demo-Daten | Navigation | mögliche Nutzeraktion | erwartetes Ergebnis | offene Frage, falls vorhanden |
|---|---|---|---|---|---|---|---|---|---|
| Geschäftsführung / Büro / Vorarbeiter | Baustellenmappe | Bau-Nr. als zentraler Schlüssel | [1 – BESCHLOSSEN] | S18, S19 | eindeutige Bau-Nr. und verknüpfte Vorgänge | Suche / Baustellen | Bau-Nr. öffnen | Alle Demo-Vorgänge sind derselben Baustelle eindeutig zugeordnet | Keine |
| Berechtigte Rollen | Baustellenmappe | Kernstammdaten anzeigen | [1 – BESCHLOSSEN/GEZEIGT] und [2] für digitale Ergänzungen | S18 | Kurzname, Auftraggeber, Adresse, Kontakt, Zugang, Termine, Aufgaben, Zusatzaufgaben, Materialhinweis, Status | Baustellen → Mappe | Abschnitte öffnen | Die Ansicht wirkt wie eine digitale Baustellenmappe, nicht wie eine technische ID-Seite | Pflichtfelder und Sichtbarkeit je Rolle [3] |
| Geschäftsführung / Büro / Vorarbeiter | Baustellenmappe | Geplante, aktuell arbeitende und heute dort gewesene Personen unterscheiden | [1 – BESCHLOSSEN] für Zuordnung; Darstellung [2] | S04, S15, S18 | Tagesplanung und Zeitereignisse | Mappe → Heute | Personenstatus öffnen | Planung und tatsächlicher Verlauf werden nicht vermischt | Keine für Demo |
| Geschäftsführung / Büro | Baustellenmappe | Zeitverlauf je Baustelle | [2 – WAHRSCHEINLICH] | S04, S07, S18 | Ereignisse, Person, Start/Ende, Pause, Fahrt, Korrekturen | Mappe → Verlauf | filtern / Person öffnen | Chronologischer Rohverlauf ohne Lohnbewertung | Keine automatische Bewertungsregel zulässig |
| Berechtigte Rollen | Baustellenmappe | Notizen und Fotos mit Herkunft | [1 – BESCHLOSSEN] | S18, S21 | drei Notizen, zwei synthetische Bilder, Autor, Zeit, Kategorie | Mappe → Dokumentation | Eintrag öffnen | Bau-Nr., Urheber und Zeitpunkt sind sichtbar | Fotozugriff je Rolle [3] |
| Geschäftsführung / Büro / Vorarbeiter | Baustellenmappe | Zusatzarbeiten und offene Punkte | [1 – BESCHLOSSEN] für Zusatzarbeit; offene Punkte [2] | S08–S11, S18, S22 | Zusatzarbeit, Dokumentationsstatus, Prüfstatus, offene Aufgabe | Mappe → Zusatzarbeiten / offene Punkte | Vorgang prüfen | Offene kaufmännische Entscheidung bleibt sichtbar | Vollständiges Aufgabenmodell [3] |
| Geschäftsführung / Büro | Baustellenverlauf | Ereignisse aus Planung, Zeiten, Notizen, Fotos, Zusatzarbeiten und Änderungen bündeln | [2 – WAHRSCHEINLICH] | S07, S15, S18, S21 | chronologische Einträge mit Typ, Urheber, Anhang und Status | Mappe → Verlauf | Typ/Zeitraum filtern | Torben kann nachvollziehen, was bei Bau-Nr. 26-103 passiert ist | PDF-Verlauf [3] |
| Berechtigte Rollen | Dokumente | Vorhandene Dokumentarten geordnet darstellen | [1 – BESCHLOSSEN/GEZEIGT] für heutigen Bestand; digitale Umsetzung [2] | S18 | vollständig synthetische Dokumenttitel und Status, keine echten Dateien | Mappe → Dokumente | Dokument öffnen | Demo zeigt Struktur und „nur Beispiel“, ohne produktive Wirkung vorzutäuschen | Welche Dokumenttypen bereits V1 werden [3] |

### 3.7 Zusatzarbeiten

| Rolle | Ansicht | Funktion | fachlicher Status | synthetisches Testszenario | erforderliche Demo-Daten | Navigation | mögliche Nutzeraktion | erwartetes Ergebnis | offene Frage, falls vorhanden |
|---|---|---|---|---|---|---|---|---|---|
| Mitarbeiter / Vorarbeiter | Zusatzarbeit melden | Mindestangaben erfassen | [1 – BESCHLOSSEN] für Meldung; Felder [2] | S08 | Bau-Nr., meldende Person, Zeitpunkt, Beschreibung, 12 m², synthetisches Foto | Zusatzarbeit | speichern | Neue Meldung erscheint bei Baustelle und im Arbeitsvorrat | Menge/Foto als Pflicht [3] |
| Mitarbeiter / Vorarbeiter | Bestätigung dokumentieren | Bestätigungsart und Ansprechpartner festhalten | [1 – BESCHLOSSEN] als Wunsch; Varianten [2] | S09 | Name/Funktion synthetisch, Art und Zeitpunkt, optional Signaturplatzhalter | Zusatzarbeit → Bestätigung | Bestätigung ergänzen | Wortlaut „Bestätigung der dokumentierten Zusatzarbeit“; keine Rechtsbehauptung | rechtliche Wirkung [3] |
| Geschäftsführung / Büro | Zusatzarbeiten | Dokumentationsstatus von kaufmännischem Status trennen | [1 – BESCHLOSSEN] für betriebliche Entscheidung; Statusmodell [2] | S10 | vollständig dokumentiert, kaufmännisch offen | Zusatzarbeiten → Vorgang | prüfen / Entscheidung zurückstellen | Beide Zustände sind gleichzeitig klar erkennbar | Exakte Statusnamen [3] |
| Berechtigte kaufmännische Rolle | Zusatzarbeiten | Zur Abrechnung vorgesehen oder nicht abrechenbar markieren | [1 – BESCHLOSSEN] für Entscheidung beim Betrieb; Ausübungsrecht [3] | S11 | Entscheidung, Bearbeiter, Grund, Zeitpunkt, Historie | Vorgang → kaufmännische Prüfung | Status mit Grund setzen | Fall bleibt im Verlauf erhalten und verschwindet nicht | Geschäftsführung allein oder auch Büro [3] |
| Geschäftsführung / Büro | Zusatzarbeiten-Liste | Filtern und Vorgänge überblicken | [1 – BESCHLOSSEN] für Prozess; Filter [2] | S08–S11 | mindestens drei Fälle in unterschiedlichen Zuständen | Zusatzarbeiten | Zeitraum, Bau-Nr., Status, Mitarbeiter, Bestätigung filtern | Kein abrechenbarer Vorgang wird wegen unübersichtlicher Darstellung vergessen | Exportformat [3] |

### 3.8 Wochenzettel, Listen und Exporte

| Rolle | Ansicht | Funktion | fachlicher Status | synthetisches Testszenario | erforderliche Demo-Daten | Navigation | mögliche Nutzeraktion | erwartetes Ergebnis | offene Frage, falls vorhanden |
|---|---|---|---|---|---|---|---|---|---|
| Mitarbeiter / Büro / Geschäftsführung | Wochenzettel | Woche aus Rohereignissen darstellen | [2 – WAHRSCHEINLICH]; V1-Projektentscheidung | S12, S13 | Montag–Freitag, Bau-Nr., Beginn, Pause, Ende, Fahrt, Hinweis | Wochenzettel → Person/KW | Tage öffnen | Vollständige und fehlerhafte Woche unterscheiden sich eindeutig | Lohnrelevante Netto-/Überstundenwerte bleiben offen |
| Mitarbeiter / Büro / Geschäftsführung | Wochenzettel | Bestätigung, Korrektur und erneute Prüfung versioniert zeigen | [2 – WAHRSCHEINLICH] | S14 | Fassung 1, Bestätigung, Fehler, Korrektur, Fassung 2, erneuter Prüfbedarf | Wochenzettel → Verlauf | Bestätigen / Korrektur öffnen | Alte Bestätigung wird nicht still auf geänderte Daten übertragen | Exakter Freigabeprozess [3] |
| Büro / Geschäftsführung | Wochenzettel-Export | PDF/Druck im vertrauten Übergangslayout | [1 – BESCHLOSSEN] | S12–S14 | synthetischer Wochenzettel, Demo-Wasserzeichen | Wochenzettel → PDF | PDF erzeugen | Lesbare Datei mit Bau-Nrn. und getrennten Fahrzeiten; kein Lohnanspruch | Endgültiges Formularlayout [3] |
| Büro / Geschäftsführung | Zeitbuchungen | Gefilterte Rohdaten exportieren | [1 – BESCHLOSSEN] für Excel-kompatible Weitergabe; Details [2] | S01–S07 | Datum, Person, Bau-Nr., Ereignisse, Pause, Fahrt, Status, Hinweis | Zeiten prüfen → Export | Zeitraum/Filter wählen, CSV erzeugen | Download lässt sich in Excel öffnen; offene Bewertungsregeln bleiben Rohdaten | Exakte Spaltenreihenfolge und CSV/XLSX-Vorrang [3] |
| Büro / Geschäftsführung | Nachkalkulationsexport | Bau-Nr.-bezogene Daten für bestehende Excel-Nachkalkulation liefern | [1 – BESCHLOSSEN] | Exportfall je Bau-Nr. | Bau-Nr., Bearbeiter, Ist-Stunden, getrennte Fahrzeit und verfügbare Demo-Kategorien | Mehr → Exporte → Nachkalkulation | Projekt/Zeitraum wählen | Nur Exportdatei; kein Zurückschreiben und keine erfundenen Kostenwerte | genaue Vorlage, Format und Zuordnung [3] |
| Geschäftsführung / Büro | Baustellenbelegung | Wochenansicht bzw. tabellarische Zuordnung ansehen | [1 – BESCHLOSSEN/GEZEIGT] für heutigen Ist-Prozess; künftige Form [2] | S15, S25 | Woche, Datum, Person, Funktion, Bau-Nr., Vorarbeiter, Hinweis | Planung | Woche/Tag filtern | Änderungen sind direkt in der App sichtbar | vollständige Wochenplanung ist nach D-024 später; exakte Darstellung [3] |
| Geschäftsführung / Büro | Abrechnung offen | Baustellen mit Rechnungshinweis auffinden | [1 – BESCHLOSSEN/GEZEIGT] für heutigen Bedarf; digitale Liste [2] | S22 | Bau-Nr., Baustelle, Hinweis, Zusatzarbeiten offen, Bearbeiter | Baustellen / Mehr → Abrechnung offen | Vorgang öffnen | Hinweis ist auffindbar, ohne vollständige Rechnungsautomatik zu behaupten | endgültiger Rechnungsworkflow [3] |

### 3.9 Zweite Demo-Ausbaustufe und spätere Funktionen

| Rolle | Ansicht | Funktion | fachlicher Status | synthetisches Testszenario | erforderliche Demo-Daten | Navigation | mögliche Nutzeraktion | erwartetes Ergebnis | offene Frage, falls vorhanden |
|---|---|---|---|---|---|---|---|---|---|
| Mitarbeiter / Büro | Material | Materialentnahme oder -anforderung einer Bau-Nr. zuordnen | [1 – BESCHLOSSEN] für späteren Bedarf; mobiler Ablauf [2] | zusätzlicher Demo-Fall | synthetischer Artikel, Menge, Bau-Nr., Quelle | Mehr → Material | Entnahme erfassen | Projektbezogener Eintrag ohne Anspruch auf vollständige Lagerwirtschaft | endgültiges Materialmodell [3] |
| Mitarbeiter / Geschäftsführung / Büro | Urlaub | Digitalen Urlaubsantrag demonstrieren | [1 – GEZEIGT] für Papierprozess; digitale Funktion [2] | zusätzlicher Demo-Fall | fiktiver Zeitraum, Status, Vertretungshinweis | Mehr → Urlaub | Antrag stellen / prüfen | Klar als zweite Ausbaustufe gekennzeichnet | Rechte und Prozess [3] |
| Baustellenrollen | Dokumente | Baubesprechungsprotokoll und Aufmaß als Demo-Dokumente | [1 – GEZEIGT] für heutigen Bestand; digital [2] | zusätzlicher Baustellenfall | rein synthetische Formularinhalte | Baustellenmappe → Dokumente | Dokument anlegen/ansehen | Strukturelle Bedienung testbar, keine fertige Fachlogik behauptet | Umfang und Pflichtfelder [3] |
| Büro | Rechnungszuordnung | OCR-/Importidee sichtbar machen | [2 – WAHRSCHEINLICH], nicht V1 | zusätzlicher Demo-Fall | synthetische Rechnung ohne echte Firma, erkannte Bau-Nr. | Mehr → Rechnungen | Scan-Simulation prüfen | Nur als spätere Testfunktion gekennzeichnet | Anbieter, Datenschutz, Mailintegration [3] |
| Mitarbeiter | Spracheingabe | Sprache in Entwurf für Notiz/Zusatzarbeit umwandeln | [1 – BESCHLOSSEN] als gewünschte Richtung; Umsetzung [2] | zusätzlicher Demo-Fall | vorgegebener synthetischer Beispielsatz | Notiz / Zusatzarbeit → Sprache | Demoaufnahme starten, Entwurf prüfen | Nutzer bestätigt einen Entwurf; keine automatische Wahrheit | Anbieter und Datenfluss [3] |

## 4. Abgleich mit der bestehenden Demo

### 4.1 Bereits vorhanden

- Ruhige Geschäftsführer-Startseite mit persönlicher Begrüßung, fiktivem Stichtag, Statuszahlen, aktiven Baustellen und anklickbarem Handlungsbedarf.
- Hauptnavigation mit `Heute`, `Baustellen`, `Mitarbeiter`, `Zeiten prüfen`, `Zusatzarbeiten`, `Wochenzettel` und `Mehr`; auf dem Smartphone reduziert.
- Globale Suche nach Bau-Nr., Baustelle und Mitarbeiter.
- Zwölf vollständig erfundene Testmitarbeiter mit den Zuständen arbeitet, Pause, unterwegs, noch nicht gestartet und nicht eingeplant.
- Fünf erfundene aktive Baustellen mit sichtbarer Bau-Nr., Adresse, Team, Lage, Notizen, offenen Punkten, Zusatzarbeiten und Foto-Platzhalter.
- Mitarbeiterdetails werden direkt unter der ausgewählten Person aufgeklappt; Zeitereignisse sind sichtbar.
- Zwei Zeitprobleme und eine bedienbare Demo-Korrektur mit Vorher, Nachher, Bearbeiter, Zeitpunkt und Begründung. Die Korrektur bleibt nur bis zum Neuladen erhalten.
- Sechs offene Zusatzarbeiten mit Bau-Nr., Melder, Beschreibung, Zeitpunkt, Menge, Fotohinweis, dokumentierter Bestätigung und Status.
- Vier Wochenzettel-Karten in unterschiedlichen Zuständen.
- Eine einfache Mitarbeiterperspektive für Max mit großem statusabhängigem Hauptbutton und einem simulierten Ablauf von Start, Pause, Baustellenwechsel/Fahrt bis Feierabend.
- Bedienbare Mitarbeiterformulare für Zusatzarbeit, Notiz/Foto, Korrekturmeldung und Feedback. Die Meldungen erscheinen unter „Meine Meldungen“ und werden beim Neuladen verworfen.
- Login-Vorschau mit verständlichem Hinweis zum gemeinsam genutzten Gerät sowie deutlich sichtbarem Testsystem-Hinweis.
- Responsives Layout und vorhandene Browserprüfungen für Smartphone, Tablet und Desktop.

### 4.2 Nur teilweise oder als Platzhalter vorhanden

| Bereich | Heutiger Stand | Warum noch keine vollständige Demo-Funktion |
|---|---|---|
| Anmeldung und Rollen | Login ist Vorschau; Wechsel nur zwischen Geschäftsführung und Mitarbeiter | Keine Büro- oder Vorarbeiterperspektive, keine echte Sitzung/Rechteprüfung |
| Mitarbeiter-Zeitablauf | Statusfolge ist klickbar | Feste Reihenfolge und feste Bau-Nr.; keine alternative Baustellenauswahl, keine Validierung oder Verknüpfung mit der Geschäftsführeransicht |
| Korrekturen | Einzelne Admin-Demokorrektur erzeugt Verlauf | Keine Korrekturanfrage-Warteschlange, keine Entscheidung/Rückfrage, kein rollenübergreifender Zustand |
| Zusatzarbeiten | Daten und Filter sind sichtbar | „Als geprüft simulieren“ ändert weder Status noch Verlauf; kaufmännische Entscheidung ist nicht testbar |
| Fotos | Platzhalter und Dateiauswahl vorhanden | Kein synthetisches Bild, keine Vorschau, kein gespeicherter Anhang, keine Zuordnung im Baustellenverlauf |
| Wochenzettel | Vier Zustandskarten vorhanden | Öffnen zeigt nur einen Hinweis; keine Tagesdetails, Bestätigung, Korrekturfolge, Freigabe oder PDF-Ausgabe |
| Baustellenmappe | Kernkarten mit Notizen, Foto-Platzhalter und offenen Punkten | Auftraggeber, Ansprechpartner, Zugang, Termine, Aufgaben, Materialhinweise, Dokumente und echter chronologischer Verlauf fehlen |
| Support / Einstellungen | Unter „Mehr“ vorhanden | Nur Hinweistexte, keine Demo-Fälle oder Verwaltungsabläufe |
| Speicherung | Änderungen funktionieren während der offenen Seite | Alle Eingaben verschwinden beim Neuladen; kein bewusst steuerbarer Demo-Neustart oder zusammenhängender rollenübergreifender Testzustand |

### 4.3 Fachlich fehlend

1. Eigene Büroansicht mit Prüf-Arbeitsvorrat.
2. Eigene Vorarbeiteransicht samt Kolonnenbuchung und sichtbarem Initiator je Mitarbeiterereignis.
3. Bedienbare Tagesplanung und kurzfristige Umplanung mit Verlauf.
4. Mitarbeiterwahl einer anderen aktiven Baustelle.
5. Durchgängige gemeinsame Demo-Daten: Mitarbeiteraktionen müssen die Geschäftsführer-, Baustellen-, Zeit-, Zusatzarbeits- und Wochenzettelansichten aktualisieren.
6. Status `Beendet` in der Mitarbeiterübersicht und ein klarer Status `Prüfbedarf`.
7. Fehlerfall „Feierabend ohne gültigen Arbeitsbeginn“ und verknüpfte Korrekturanfrage.
8. Vollständiger Korrektur-Arbeitsablauf mit Anfrage, Prüfung, Begründung, Korrektur und Audit.
9. Vollständige Zusatzarbeitsfälle aus S08–S11 einschließlich dokumentierter Bestätigung, getrennter kaufmännischer Prüfung und erhaltenem nicht-abrechenbar-Verlauf.
10. Wochenzettel mit Tageszeilen, Fehlern, Mitarbeiterbestätigung, Betriebsfreigabe, Version nach Korrektur und erneutem Prüfbedarf.
11. PDF-Demo für Wochenzettel sowie CSV/Excel-kompatible Zeit- und Nachkalkulationsexporte.
12. Baustellenmappe 26-103 gemäß S18 mit drei Notizen, zwei synthetischen Bildern, Zusatzarbeit, offenem Punkt, Kontakt und Zeitverlauf.
13. Aggregierter Baustellenverlauf.
14. Filterbare Tages-, Planungs-, Zeit-, Auffälligkeits-, Zusatzarbeits- und Baustellenverlaufslisten.
15. Auffindbarer Hinweis „Rechnung noch offen“, ohne Rechnungsworkflow vorzutäuschen.
16. Realistische, miteinander konsistente Daten für alle 25 Szenarien.

### 4.4 Fachlich falsch oder missverständlich

1. **„Noch nicht gestartet“ wird pauschal als Aufmerksamkeit angezeigt.** Da keine betriebliche Warnschwelle beschlossen wurde, muss die Demo entweder einen ausdrücklich fiktiven Prüfzeitpunkt nennen oder den Hinweis als Demo-Annahme kennzeichnen.
2. **Die Rollenwirkung ist derzeit zu grob.** „Geschäftsführung“ enthält faktisch Bürohandlungen, während eine eigene Büroansicht fehlt. Dadurch kann Torben die spätere Arbeitsteilung nicht beurteilen.
3. **Vorarbeiter existieren nur als Berufsbezeichnung in den Testdaten.** Die beschlossene Kolonnenbuchung kann nicht ausprobiert werden.
4. **Die Wochenzettel-Schaltfläche behauptet durch ihre Beschriftung mehr Bedienbarkeit, als vorhanden ist.** Sie öffnet keinen Zettel, sondern nur einen Hinweis.
5. **„Als geprüft simulieren“ bei Zusatzarbeiten ist unklar.** Der Status ändert sich nicht; Dokumentation, kaufmännische Prüfung und Abrechnungsentscheidung lassen sich daher nicht voneinander testen.
6. **Die Kennzahl „7 diese Woche erledigt“ ist nicht aufschlüsselbar.** Es gibt in der Liste keine sieben abgeschlossenen Vorgänge. Eine Kennzahl ohne erreichbare Belege wirkt wie reine Dekoration.
7. **Fotoauswahl und Foto-Platzhalter bilden noch keine Fotodokumentation.** Ein gewähltes Foto erscheint nur als Text „Foto ausgewählt“ und wird keinem sichtbaren Vorgang zugeordnet.
8. **Der Mitarbeiterablauf ist nicht mit den übrigen Ansichten verbunden.** Max kann den Ablauf durchspielen, aber Torbens Tageslage, die Baustellenmappe und die Wochenzettel ändern sich dadurch nicht.
9. **Die Demo-Korrektur lässt Bearbeiter frei aus einer Liste wählen.** Ohne eigene Rollenperspektiven und klare Kennzeichnung ist das keine belastbare Rechtesimulation.
10. **Bau-Nrn. sind im aktuellen Datensatz uneinheitlich zur neuen Übergabe.** Der aktuelle Stand verwendet z. B. `25148`, während die übergebenen Szenarien `26-101` bis `26-105` verwenden. Die nächste Datenfassung sollte ein einziges, durchgängiges fiktives Nummernsystem nutzen.

## 5. Empfohlene Ausbau-Reihenfolge

### Stufe 1 – Gemeinsame synthetische Demo-Welt

Zuerst einen einzigen konsistenten Testdatenbestand für alle Rollen und alle 25 Szenarien herstellen. Jede Aktion verändert denselben flüchtigen Demo-Zustand. Dazu gehören Mitarbeiter, Baustellen, Tageszuweisungen, Zeitereignisse, Korrekturen, Zusatzarbeiten, Wochenzettel, Notizen, Fotos und Audit-Einträge. Ein gut sichtbarer „Demo zurücksetzen“-Knopf stellt den Ausgangszustand wieder her.

Warum zuerst: Ohne gemeinsame Daten kann zwar jeder Bildschirm gut aussehen, aber kein kompletter Betriebsablauf getestet werden.

### Stufe 2 – Vier klar getrennte Rollenperspektiven

Geschäftsführung, Büro, Vorarbeiter und Mitarbeiter erhalten jeweils passende Startseiten und Navigation. Rollenrechte werden in der statischen Demo als Bediengrenzen simuliert und ausdrücklich nicht als produktive serverseitige Sicherheit bezeichnet.

### Stufe 3 – Tagesplanung, Umplanung und Live-Lage

Tageszuordnung, kurzfristige Umplanung, alternative Baustellenwahl und Kolonnenbuchung werden umgesetzt. Jede Änderung aktualisiert Tageslage, Person, Baustelle und Audit.

### Stufe 4 – Vollständiger Zeit- und Korrekturablauf

Alle Rohereignisse von Arbeitsbeginn bis Feierabend, die zwei Fehlerfälle sowie Korrekturanfrage und Bürokorrektur werden durchgängig verbunden. Fahrzeit bleibt separat und unbewertet.

### Stufe 5 – Zusatzarbeiten als wirtschaftlicher Kernprozess

Erfassung, Bild, dokumentierte Bestätigung, Dokumentationsvollständigkeit, kaufmännische Prüfung, „zur Abrechnung vorgesehen“, „nicht abrechenbar“ und Historie werden bedienbar. Keine automatische Rechnung und keine Rechtswirkung behaupten.

### Stufe 6 – Digitale Baustellenmappe

Die Bau-Nr. verbindet Stammdaten, heutiges Team, Zeitverlauf, Notizen, synthetische Bilder, Zusatzarbeiten, Dokument-Platzhalter, offene Punkte und Abrechnungshinweis. Bau-Nr. 26-103 wird der vollständige Referenzfall.

### Stufe 7 – Wochenzettel und Exporte

Vollständige/fehlerhafte Wochen, Bestätigung, Freigabe, erneuter Prüfbedarf nach Korrektur sowie echter clientseitiger PDF- und CSV-Download für synthetische Daten. Nicht beschlossene Spalten werden als „Demo-Vorschlag“ markiert.

### Stufe 8 – Zweite Demo-Ausbaustufe

Erst danach Material, Urlaub, Baubesprechungsprotokoll, Aufmaß, Rechnungshinweis, Spracheingabe und weitere Dokumenttypen als klar abgegrenzte Testmodule ergänzen. OCR, KI und echte Integrationen bleiben spätere Optionen.

### Stufe 9 – Abnahme der Bedienungsdemo

Alle 25 Szenarien automatisiert und manuell auf Smartphone, Tablet und Desktop durchspielen. Zusätzlich prüfen:

- keine echten Daten oder Secrets,
- keine offene Regel als entschieden dargestellt,
- jede Kennzahl ist bis zu ihren Beispieldaten nachvollziehbar,
- alle Schaltflächen führen zu einer sichtbaren fachlichen Wirkung oder sind klar als Platzhalter beschriftet,
- Bau-Nr. bleibt in jeder relevanten Ansicht präsent,
- Geschäftsführung erkennt Handlungsbedarf innerhalb weniger Sekunden,
- Mitarbeiter kann den Arbeitstag mit großen, eindeutigen Aktionen bedienen.

## 6. Umgang mit [3 – OFFEN]

Die folgenden Punkte dürfen in der Demo nur als klar beschriftete Annahme oder Auswahlvariante gezeigt werden:

1. Schwelle, ab wann „noch nicht gestartet“ zum Warnfall wird.
2. Endgültige Rechte einzelner Bürokräfte.
3. Reichweite der Vorarbeiterrechte.
4. Endgültige Planungsrechte und primäre Tages-/Wochenansicht.
5. Sichtbarkeit fremder Mitarbeiter- und Baustellendaten.
6. Pflichtfelder für Menge, Foto oder weitere Angaben bei Zusatzarbeiten.
7. Wer kaufmännische Statusentscheidungen setzen darf.
8. Rechtliche Wirkung einer dokumentierten Bestätigung.
9. Exakter Wochenzettel-Freigabe- und Rückgabeprozess.
10. Endgültige Exportspalten, Reihenfolge und CSV-/XLSX-Vorrang.
11. Fahrzeit-, Überstunden-, Rüstzeit- und Lohnbewertung.
12. Nacht-/Mitternachtsfälle.
13. Aufbewahrung und Löschung.
14. Material-, Rechnungs-, OCR-, KI- und Gerätewechselprozesse.

Empfohlene Kennzeichnung in der Oberfläche:

> Demo-Annahme – dieser Ablauf ist noch nicht betrieblich beschlossen.

Eine Demo-Annahme darf ausprobiert werden, muss aber in der Ansicht und im Änderungsverlauf als Annahme erkennbar bleiben.

## 7. Fachliche Schlussfolgerung

Die vorhandene Demo ist bereits ein guter visueller Einstieg und deckt Torbens Morgenblick sowie erste Mitarbeiteraktionen ab. Sie ist aber noch keine vollständige Bedienungsdemo, weil die Rollen, Daten und Vorgänge nicht durchgängig miteinander verbunden sind.

Der sinnvollste nächste Schritt ist deshalb nicht einfach „mehr Karten und Beispieldaten“, sondern zuerst eine gemeinsame synthetische Demo-Welt für alle 25 Szenarien. Darauf können die vier Rollen, die vollständigen Zeit-/Korrekturabläufe, Zusatzarbeiten, Baustellenmappe, Wochenzettel und Exporte zuverlässig aufbauen. So bleibt die Demo später sauber auf die echte Backend-Anwendung übertragbar, ohne offene Fachregeln einzubauen.

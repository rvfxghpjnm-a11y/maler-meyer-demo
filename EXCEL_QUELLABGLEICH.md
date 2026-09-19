# Excel-Quellabgleich für die öffentliche Demo

Die vier von Maler Meyer bereitgestellten Arbeitsmappen wurden **nur lokal** analysiert. Grundlage dieses Abgleichs sind ein anonymisierter Audit, ein Register mit 200 Blatt-IDs und ein maschinenlesbares Formel-Mapping. Diese drei Referenzen werden nicht in die öffentliche Demo kopiert. Originaldateien, reale Zellwerte, Blattnamen, Personen, Projektbezeichnungen, Lieferanten, Preise und vertrauliche Kalkulationssätze gehören nicht in dieses Repository. Die App speichert fachliche Vorgänge; Excel bleibt ein aus App-Daten erzeugter Export.

| Arbeitsmappe | Beobachtete Struktur | Stand der Demo |
| --- | --- | --- |
| Wochenplanung | 54 Blätter; 53 Wochenblätter und ein Hilfsblatt. Datumsformeln und getrennte Personalbereiche sind belegt. | Die bearbeiteten synthetischen Demo-Wochen werden mit Datum, Bau-Nr., Namen und Status exportiert. Es werden nicht 54 historische Blätter behauptet oder kopiert. |
| Bau-Nr.-Liste / Nachkalkulation | 200 Blätter: eine Hauptliste, 192 normale historische Projektblätter, sechs Sonderkonten und eine anonyme Vorlagenstruktur B200. 19 normale Layoutfamilien und 147 Blockvarianten. | Hauptliste und ein kanonisches Blatt pro synthetischem Projekt. B200 liefert die **Struktur**, nicht automatisch die fachlich freigegebenen Formeln. Historische Sonderkonten und Blattvarianten werden nicht als App-Datenmodell übernommen. |
| Urlaubsplaner | Drei Blätter; ein Jahreskalender und zwei formatierte Hilfsblätter. Zwölf Monatsblöcke mit fortlaufenden Datumsformeln. | Neu: ein dynamischer synthetischer XLSX-Jahresplaner aus genehmigten Demo-Anträgen. Seine Zweimonatsblöcke orientieren sich an der Quelle; bei mehr Demo-Mitarbeitern wachsen die Zeilen. Leere historische Hilfsblätter werden nicht kopiert. |
| Kostenübersichten | Zwei Blätter; zwölf Monatsblöcke, Jahreswerte und beobachtete Formel-Auffälligkeiten. | Projektkosten sind als Rohpositionen und sichere Kategoriesummen bedienbar. Eine eigenständige Kostenübersicht wird **nicht** exportiert, bevor die Summenlogik fachlich entschieden ist. |

## Bereits nachgebildete Rechenbeziehungen der Bauliste

Die Spaltenfolge der Hauptliste orientiert sich an den beobachteten Spalten A–U. Für jede synthetische Baustelle gelten im Demo-Export:

- Stunden-Vorgabe = Angebotssumme netto ÷ **synthetischer** Demo-Kalkulationssatz.
- Gesellenstunden, rohe Fahrzeit und Azubi-Stunden kommen aus den Summenzellen des synthetischen Projektblatts.
- Stundenumsatz = Angebotssumme netto ÷ Gesellenstunden, sofern Stunden vorhanden sind.
- Die Kostenblöcke Material, Lift, Subunternehmer, Zeitpersonal, Gerüst/Müll sowie Sonstiges/Übertrag verweisen auf getrennte Summen im Projektblatt.
- Gesamtkosten = Gesellenstunden × synthetischer Demo-Kalkulationssatz + die genannten Kostenblöcke.
- Geschriebene Rechnungen kommen aus dem Rechnungsbereich des Projektblatts.
- Ergebnis = geschriebene Rechnungen − Gesamtkosten.
- Aktueller Stundenwert = (geschriebene Rechnungen − externe Kostenblöcke) ÷ Gesellenstunden, sofern Stunden vorhanden sind.

Die formelbasierten Projektblätter enthalten die beobachteten Bereiche für Wochenstunden, rohe Fahrzeit, Azubi-Stunden, Rechnungen, Material, Lift, Subunternehmer, Zeitarbeit, Gerüst/Müll und Sonstiges. Die Summenanker der kanonischen Struktur sind `C6`, `O6`, `AA6`, `W54`, `K230`, `K236`, `K241`, `K246`, `K251` und `K256`. Die Hauptliste verlinkt genau diese Zellen. Zusätzliche Positionen außerhalb der vorgesehenen Slots stehen in eindeutig bezeichneten Fortsetzungszeilen. Unbewerteter Materialverbrauch erhält **keinen** erfundenen Preis.

Der Demo-Zustand besitzt derzeit Projekt-Gesamtsummen für Stunden, jedoch keine lückenlose historisch zuordenbare Kalenderwochenaufteilung je Projekt. Im Projektblatt steht daher ein gekennzeichneter Sammelwert statt erfundener KW-Anteile. Das ist ein bewusster Unterschied zur Arbeitsweise in den historischen Blättern.

Vier vertrauliche historische Rate-Varianten wurden anonymisiert beobachtet; ihre Werte werden ausdrücklich **nicht** veröffentlicht. Im öffentlichen Modell steht ein frei erfundener Satz auf `Demo-Annahmen`. Er ist kein Beschluss zur künftigen Kalkulation. Für Divisionen durch null werden nicht berechenbare Ergebnisse leer statt als historische Fehlerwerte angezeigt. Das ist eine gekennzeichnete Demo-Darstellung, keine stillschweigende Fachentscheidung.

### Nicht still korrigierte Auffälligkeiten

- In B200 referenzieren zwei historische Materialformeln die Menge der vorherigen Zeile. Das ist beobachtet, aber fachlich ungeklärt. Neue synthetische Demo-Positionen verwenden die mathematisch klare Multiplikation von Menge und Einzelpreis **derselben** Zeile. Diese Abweichung steht ausdrücklich auf `Demo-Annahmen`; sie gilt nicht als Korrektur der Originaldatei.
- Die historische Kostenübersicht enthält Auffälligkeiten in den anonymisiert dokumentierten Zellen `C17`, `C20` und `C178` sowie uneinheitliche Monatsgesamtzeilen. Ohne Entscheidung zu den einbezogenen Kostenarten wird daraus keine neue Kostenübersichtsformel oder produktive Auswertung abgeleitet.
- Im vollständigen Blattregister gibt es zehn Fälle mit fehlenden, nicht verlinkten oder nicht formelbasierten Summenankern. Solche historischen Einzelblätter werden nicht erraten. Die Demo nutzt nur die kanonische neue Exportstruktur.

## Was noch nicht „exakter Originalexport“ ist

Die Quellmappe enthält zahlreiche individuelle Projektblatt-Abweichungen, Druckeinstellungen, verbundene Zellen und bedingte Formatierungen. Die einheitliche Demo-Ausgabe ist deshalb **kein zellgenauer Ersatz** für alle 200 Originalblätter. Die Urlaubs-Jahresmatrix ist als dynamische Demo-Ausgabe ergänzt; die Kostenübersicht bleibt gesperrt, bis ihre Summen fachlich geklärt sind. Aus den historischen Formeln folgt keine automatische Freigabe künftiger Kalkulations-, Personal- oder Rechte-Regeln.

Für eine spätere Ablösung muss Torben insbesondere die Rechenwege der Hauptkennzahlen, die Material-Abweichung und die Kostenübersichts-Summen fachlich bestätigen. Erst dann kann eine produktive Vorlagenversion mit reproduzierbaren Exporttests festgelegt werden. Die Quellen bleiben außerhalb des öffentlichen Repositories.

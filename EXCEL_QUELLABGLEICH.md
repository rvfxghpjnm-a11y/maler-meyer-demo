# Excel-Quellabgleich für die öffentliche Demo

Die vier von Maler Meyer bereitgestellten Arbeitsmappen wurden **nur lokal** analysiert. Originaldateien, reale Zellwerte, Personen, Projektbezeichnungen, Lieferanten, Preise und der reale Kalkulationssatz gehören nicht in dieses öffentliche Repository. Diese Datei dokumentiert ausschließlich die abstrakte Struktur und den Umsetzungsstand.

| Arbeitsmappe | Beobachtete Struktur | Stand der Demo |
| --- | --- | --- |
| Wochenplanung | 54 Wochenblätter; Tagesdaten werden innerhalb des Wochenblatts vom Montagsdatum abgeleitet; getrennte Personalbereiche | Wochenblätter aus den tatsächlich vorhandenen synthetischen Demo-Wochen. Datumszellen und Baustelle mit Bau-Nr. und Namen werden exportiert. Nicht alle 54 Quellblätter oder deren Formatdetails sind rekonstruiert. |
| Bau-Nr.-Liste / Nachkalkulation | 200 Blätter: Hauptliste und projektbezogene Blätter. Hauptliste übernimmt Stunden, Kostenblöcke und Rechnungen aus Projektblättern. | Hauptliste und ein Blatt pro synthetischem Demo-Projekt mit nachweisbaren Zellbezügen und Rechenbeziehungen. Das Original enthält projektweise Varianten; die Demo verwendet eine einheitliche, quellnahe Variante. |
| Urlaubsplaner | Drei Blätter; Jahres-/Tagesmatrix mit fortlaufenden Datumsformeln. | Digitaler Urlaubsablauf und Druckformular sind vorhanden. Ein quellnaher XLSX-Jahresplaner ist noch **nicht** umgesetzt. |
| Kostenübersichten | Zwei Blätter; Monatsblöcke und Jahreszusammenfassungen mit Querverweisen und Formeln. | Projektkosten sind in der App und im Unterkonto erfasst. Eine eigenständige quellnahe XLSX-Kostenübersicht ist noch **nicht** umgesetzt; insbesondere fehlen produktive Personalkosten- und Gemeinkostendaten. |

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

Die formelbasierten Projektblätter enthalten die beobachteten Bereiche für Wochenstunden, rohe Fahrzeit, Azubi-Stunden, Rechnungen, Material, Lift, Subunternehmer, Zeitarbeit, Gerüst/Müll und Sonstiges. Für zusätzliche Positionen über die sichtbaren Quellslots hinaus ergänzt die Demo Fortsetzungszeilen und nimmt sie in die Summen auf. Unbewerteter Materialverbrauch erhält **keinen** erfundenen Preis.

Der private Kalkulationssatz aus der Quelle wird ausdrücklich **nicht** veröffentlicht. Im öffentlichen Modell steht stattdessen ein frei erfundener Satz von 60 €/h auf `Demo-Annahmen`. Er ist kein Beschluss zur künftigen Kalkulation. Für Divisionen durch null wurden leere Ergebnisse statt sichtbarer Fehlerwerte ergänzt. Beides sind bewusste Abweichungen vom historischen Formeltext.

## Was noch nicht „exakter Originalexport“ ist

Die Quellmappe enthält zahlreiche individuelle Projektblatt-Abweichungen, Druckeinstellungen, verbundene Zellen und bedingte Formatierungen. Die einheitliche Demo-Ausgabe ist deshalb **kein zellgenauer Ersatz** für alle 200 Originalblätter. Auch die Urlaubsplaner- und Kostenübersichtsmappe sind noch nicht als eigene XLSX-Exporte integriert. Die aus den Originalen abgeleiteten historischen Formeln zeigen den heutigen Rechenweg, entscheiden aber nicht automatisch über künftige fachliche Regeln, Personalabrechnung oder Rechte.

Für eine vollständige Ablösung braucht es als nächsten Schritt einen systematischen, datenschutzgerechten Abgleich aller abweichenden Blattvarianten und ihrer Eingaben sowie eine Entscheidung, welche Rechenwege unverändert gelten sollen. Die Quellen bleiben dabei außerhalb des öffentlichen Repositories.

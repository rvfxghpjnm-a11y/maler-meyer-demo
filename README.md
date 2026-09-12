# Maler-Meyer-Demo

Öffentliche, rein statische Bedienungsdemo für Maler Meyer. Sämtliche Personen, Baustellen, Zeiten, Zusatzarbeiten, Notizen und Dokumente sind erfunden.

Die Demo hat kein Backend, keine echte Anmeldung und keine Verbindung zu Maler Meyer. Eingaben und Statusänderungen werden ausschließlich lokal im jeweiligen Browser gespeichert und können über „Demo zurücksetzen“ vollständig verworfen werden.

Vier Perspektiven sind bedienbar: Geschäftsführung, Büro, Vorarbeiter und Mitarbeiter. Planung, Zeitereignisse, Korrekturen, Zusatzarbeiten, Baustellenmappe und Wochenzettel verwenden einen gemeinsamen synthetischen Demo-Zustand. Der erweiterte Datensatz umfasst vier Planungswochen und einen synthetischen Arbeitszeitverlauf vom 3. August bis 11. September 2026.

Unter „Dokumente & Exporte“ und in der jeweiligen Baustellenmappe stehen originalnah gestaltete Druckansichten für Arbeitszeitnachweis, Arbeitszettel, Materialanforderung, Materialeinsatz, Tageslohnnachweis, Aufmaß, Baubesprechungsprotokoll, Urlaubsantrag und Angebot bereit. Hinzu kommen XLSX-Exporte für Wochenplanung, Bauliste/Nachkalkulation, Projekt-Unterkonto und „Rechnung schreiben?“ sowie CSV-Ausgaben für Zeitdaten und die Rechnungsliste. Die Demo erzeugt ausschließlich neue Dateien und schreibt nie in eine bestehende Excel-Arbeitsmappe.

Die Referenzstruktur und alle bewusst offenen Details sind in [EXPORT_REFERENZ_MATRIX.md](./EXPORT_REFERENZ_MATRIX.md) dokumentiert. Es gibt keine automatische Lohn-, Überstunden-, Fahrzeit- oder Aufmaßbewertung.

## Mobile Bestätigungen

Mitarbeiter können ihren eigenen Wochenzettel mobil prüfen, eine Korrektur melden und eine vollständige Version optional mit einer Finger-/Pointer-Unterschrift bestätigen. Jede Bestätigung friert den damaligen Inhalt als eigenen synthetischen Snapshot ein. Nach einer Bürokorrektur entsteht eine neue Version; eine alte Unterschrift wird nicht übernommen.

Zusatzarbeiten können vor Ort als dokumentierter Stand bestätigt werden. Ändert sich danach beispielsweise die Menge, bleibt die alte Bestätigung beim alten Inhalt und für den neuen Stand ist eine neue Bestätigung erforderlich. Dokumentationsbestätigung und kaufmännische Prüfung bleiben getrennt.

Das Demo-Benachrichtigungszentrum verlinkt direkt auf den betroffenen Wochenzettel. Die Browser-Notification-API kann eine lokale Testmeldung zeigen. Eine echte Zustellung bei geschlossener App wird ausdrücklich nicht simuliert.

Der technische und fachliche Ablauf ist in [MOBILE_BESTAETIGUNG.md](./MOBILE_BESTAETIGUNG.md) festgehalten.

## Bewusst offen oder später

OCR und KI, produktiver Rechnungseingang, echte Dateiablage, rechtswirksame Freigaben, echter Web Push sowie direkte Excel-Integration bleiben ausdrücklich zurückgestellt. Material, Urlaub und Aufmaß sind ausschließlich als klar erkennbare synthetische Bedien- und Exportbeispiele umgesetzt.

Öffentliche Ansicht: https://rvfxghpjnm-a11y.github.io/maler-meyer-demo/

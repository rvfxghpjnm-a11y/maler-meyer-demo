# Betriebsverwaltung und direkte Büro-Hilfe

Verwaltungsmeilenstein: Demo-Version 9 vom 12. September 2026; Projektanlage in Demo-Version 12 erweitert.

Alle Daten und Namen in diesem Dokument und in der öffentlichen Demo sind synthetisch. Die beiden Büro-Demokonten „Sabine Beispiel“ und „Tina Demo“ stehen ausschließlich für die zwei noch nicht namentlich festgelegten Bürokräfte.

## Herkunft der Entscheidung

Im Vor-Ort-Meeting blieb die genaue Rechteverteilung zwischen Geschäftsführung und Büro offen. Am 12. September 2026 wurde für die Bedienungsdemo später festgelegt, dass Torben, Steffen und beide Bürokräfte möglichst umfangreiche typische Verwaltungsrechte erhalten und Mitarbeiter bei Geräte- oder Bedienproblemen direkt aus dem Büro unterstützen können.

Dies ist eine spätere Projektentscheidung und wird nicht als Meeting-Beschluss bezeichnet.

## Vier umfangreiche Verwaltungskonten

Die Demo stellt vier gleichberechtigte Verwaltungskonten bereit:

- Torben – Geschäftsführung · Admin
- Steffen – Geschäftsführung · Admin
- Sabine Beispiel – Büro · Admin, vollständig synthetisch
- Tina Demo – Büro · Admin, vollständig synthetisch

Alle vier können in der Demo:

- Projekte anlegen und bearbeiten,
- Projekte nachvollziehbar deaktivieren und reaktivieren,
- Mitarbeiter anlegen und bearbeiten,
- Mitarbeiter nachvollziehbar deaktivieren und reaktivieren,
- Tages- und Wochenplanung unterstützen,
- aktuelle Zeitaktionen stellvertretend auslösen,
- Korrekturen bearbeiten,
- Wochenzettel prüfen und freigeben,
- Zusatzarbeiten und Dokumentation prüfen,
- Dokumente und Exporte aufrufen,
- den Änderungsverlauf einsehen.

## Projektanlage und Bau-Nr.-Vorschlag

Die Bau-Nr. wird beim Öffnen des Formulars aus dem Gerätejahr und der höchsten vorhandenen Nummer desselben Jahres vorgeschlagen. Archivierte Projekte bleiben berücksichtigt. Beispiel: nach `26-106` folgt `26-107`; im ersten Projekt des Kalenderjahres 2027 erscheint `27-001`. Das Feld ist vor dem Speichern frei editierbar, eine doppelte Nummer wird abgewiesen. `JJ-NNN` ist die Demo-Darstellung der Nutzerbeschreibung; der endgültige produktive Nummernprozess bleibt offen.

Optionale Felder ergänzen geplanten Zeitraum, Baustellenleitung, Zugang, Leistungsumfang, weitere Aufgaben, Materialhinweise, synthetischen Auftragswert netto, Soll-Stunden, Abrechnungshinweis und interne Büro-Notiz. Diese Angaben sind später in „Projektstammdaten“ bearbeitbar. Interne/kaufmännische Angaben sind nicht Teil der Mitarbeiteransicht. Geplante Materialhinweise ersetzen keine Materialbuchung, weitere geplante Aufgaben keine bestätigte Zusatzarbeit.

Die Nummer eines bestehenden Projekts bleibt im Bearbeitungsformular fest. Ein späterer Nummernwechsel mit verknüpften Vorgängen erfordert einen gesonderten fachlichen und technischen Prozess.

## Entfernen bedeutet Deaktivieren

Mitarbeiter und Projekte werden in der Demo nicht hart gelöscht. Deaktivieren erhält alle bereits vorhandenen Zeitereignisse, Wochenzettel, Dokumente und Audit-Einträge. Eine deaktivierte Person kann keine neue eigene Zeitaktion auslösen und erscheint nicht mehr in der aktiven Planung. Nach einer Reaktivierung bleibt sie zunächst „nicht eingeplant“.

Ein Projekt mit noch aktiv zugeordneten Mitarbeitern kann nicht archiviert werden. Damit verhindert die Demo einen versehentlichen Statuswechsel mitten im laufenden Arbeitstag.

Endgültige Aufbewahrungs-, Lösch- und Austrittsregeln für den Echtbetrieb bleiben fachlich offen.

## Direkte Büro-Hilfe

Für den Fall „Mitarbeiter ruft an, weil das Handy fehlt oder die Bedienung nicht funktioniert“ können die vier Verwaltungskonten eine aktuelle Zeitaktion stellvertretend erfassen:

- Arbeitsbeginn,
- Pause beginnen,
- Pause beenden,
- Baustelle verlassen / Fahrt beginnen,
- Ankunft / Arbeit fortsetzen,
- Feierabend.

Jede stellvertretende Aktion speichert in der Demo:

- den betroffenen Mitarbeiter,
- die Bau-Nr.,
- die Zeitaktion und den Zeitpunkt,
- das handelnde Verwaltungskonto,
- einen verpflichtenden Grund,
- einen Audit-Eintrag.

Historische oder inhaltlich falsche Buchungen werden nicht still überschrieben. Sie laufen weiterhin über Korrekturanfrage, Prüfung und nachvollziehbare Korrektur.

## Grenze der statischen Demo

Die öffentliche Demo besitzt kein Backend und keine echte Anmeldung. Der Zustand liegt nur im lokalen Browser. Die sichtbaren Rollen sind daher eine fachliche Bedienungssimulation und kein Sicherheitsnachweis.

Für den Echtbetrieb erforderlich bleiben insbesondere:

- serverseitige Anmeldung und Rollenprüfung,
- unveränderbarer serverseitiger Audit-Verlauf,
- sichere Identitätsprüfung und dokumentierter Hilfeprozess,
- produktive Regeln für Austritt, Löschung und Aufbewahrung,
- Konfliktbehandlung bei Offline-Geräten und parallelen Büroaktionen.

## Automatisierter Demotest

`qa-admin-workflows.cjs` prüft:

- Sichtbarkeit aller vier Verwaltungskonten,
- Projektanlage und Projekt-Audit,
- Mitarbeiteranlage,
- stellvertretende Büro-Buchung mit getrenntem Urheber und Pflichtgrund,
- Deaktivierung und Reaktivierung ohne Verlust historischer Zeiten,
- Projektbearbeitung, Archivierung und Reaktivierung,
- Zugang aller vier Konten zur Verwaltung,
- Smartphone- und Tabletdarstellung ohne horizontalen Seitenüberlauf.

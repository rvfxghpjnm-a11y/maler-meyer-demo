# Anforderungen an die Produktivversion

Diese Datei trennt die bedienbare öffentliche Demo von der echten Maler-Meyer-Anwendung. Alles, was die Demo zeigt, muss für den Echtbetrieb auf Basis der verbindlichen Hauptprojekt-Architektur produktionsgerecht neu oder vollständig umgesetzt und geprüft werden. Browserzustand, synthetische Daten und simulierte Rollen sind weder Datenmodell noch Sicherheitsnachweis.

## 1. Echte Authentifizierung

- Echte Benutzerkonten und serverseitige Anmeldung
- Sichere Passwort-Hashes, Sessionverwaltung und Passwort-Rücksetzung
- Rollen und Rechte ausschließlich serverseitig prüfen
- Account-Sperren und Geräteverwaltung
- Keine Browser-Rollensimulation

## 2. Fahrzeug-iPad / PIN

- Persönlicher 6-stelliger PIN, nie im Klartext speichern
- Sicherer Hash, Rate Limit, Fehlversuchsbegrenzung sowie Cooldown/Sperre
- Autorisierte Geräte, Geräteentzug und Audit
- Sichere, strikt getrennte Sessions zwischen Mitarbeitern
- Offline-Entsperrung ist als Ziel bestätigt; sichere technische Umsetzung, Gerätezulassung und Widerruf ausarbeiten
- Zielwert für automatische Gerätesperre: fünf Minuten Inaktivität; produktiv auf echten Geräten und bei Hintergrundwechsel prüfen
- Vergessene PINs über Identitätsprüfung und Zurücksetzen behandeln. Niemand, auch nicht das Büro, darf einen gespeicherten Klartext-PIN auslesen können.

## 3. Echte Datenbank

- PostgreSQL für echte Mitarbeiter, Projekte, Bau-Nrn., Rollen, Zeitdaten und Dokumentbezüge
- Keine synthetischen Seed-Daten außerhalb klar getrennter Testumgebungen
- Migrationen nachvollziehbar und auditierbar durchführen

## 4. Echte Offline-Fähigkeit

- IndexedDB bzw. geeignete lokale Warteschlange
- Idempotente Ereignisse, Geräte-ID, Sequenzen und serverseitiger Empfangszeitpunkt
- Konflikterkennung und Mehrgeräte-Konflikte
- Retry, transparenter Synchronisationsstatus und Schutz vor Datenverlust
- Keine stillen Last-write-wins-Korrekturen
- Bestehende Hauptprojekt-Architektur nicht durch die Demo-Lösung ersetzen

## 5. Zeiterfassung

- Unveränderbare Rohereignisse für Start, Pause, Pause Ende, Baustelle verlassen, Fahrt, Ankunft, Weiterarbeiten und Feierabend
- Audit und Korrekturanfragen
- ADMIN/OFFICE-Korrekturen mit vorher, nachher und Grund
- Fahrzeitgrenzen können je Baustelle unterschiedlich sein; die genaue Regel und ihre Bewertung sind noch zu klären. Überstunden und Rüstzeit nicht aus den vorhandenen Rohdaten ableiten. Nacht-/Mitternachtsfälle sind laut Fragebogen heute nicht üblich, technisch aber gesondert zu behandeln.

## 6. Wochenzettel

- Echte serverseitige Versionierung
- Eingefrorener Snapshot und nachvollziehbarer Hash
- Mitarbeiterbestätigung und getrennte Büro/Admin-Freigabe
- Neue Version nach relevanter Korrektur; alte Version unverändert
- PDF eindeutig Version und Snapshot zuordnen

## 7. Push

- Echter Web-Push bzw. Push-Service, Push-Abonnements und Gerätebezug
- Serverseitige Trigger und Zustellung bei geschlossener App
- Benachrichtigungseinstellungen, Retry und Fehlerbehandlung
- Bestätigte Zielkategorien umfassen Wochenzettel, geänderte Planung, bearbeitete Korrektur, Urlaubsentscheidung und Rückfrage zu Zusatzarbeit; genaue Empfänger und Zeitpunkte offen

## 8. Foto / Dateien

- Echte Kamera- und Datei-Uploads in S3-kompatiblen Object Storage
- Sichere Upload-URLs, Zugriffskontrolle und Projekt-/Bau-Nr.-Zuordnung
- Dateigrößenlimits, erlaubte Typen und notwendige Viren-/Dateiprüfung
- Metadaten sowie Lösch- und Aufbewahrungsregeln

## 9. Spracheingabe

- Browser-STT, eigener Dienst oder externer Dienst einschließlich OpenAI fachlich und technisch auswählen
- Datenschutz prüfen und Audioübertragung minimieren
- Audio möglichst nicht dauerhaft speichern
- Transkript, strukturierter Vorschlag sowie Fehler- und Unsicherheitsbehandlung
- Nutzerbestätigung vor Speicherung zwingend

## 10. Material

- Materialanforderung, Entnahme, Verbrauch, Bau-Nr.-Zuordnung, Büroprüfung und Audit
- Materialprüfung durch Geschäftsführung/Büro als Zielprozess berücksichtigen
- Fachlich offen: Umfang der Lagerwirtschaft, Mindestbestand, Bestellung, Barcode, Artikelstamm und Bewertungsmethode

## 11. Urlaub

- Antrag, Genehmigung/Ablehnung, Planung, Benachrichtigung und Audit
- Die beiden Geschäftsführungsrollen entscheiden final; Büro kann Anträge einsehen und vorbereiten. Diese Berechtigung muss produktiv serverseitig abgesichert werden.
- Genehmigten Urlaub in Planung und Mitarbeiteransicht konsistent abbilden
- Fachlich offen: Resturlaub, Vertretung, Berechnung halber/unbezahlter Tage, Sonderurlaub und weitere Sonderfälle

## 12. Zusatzarbeiten / Signatur

- Eigener unveränderbarer Bestätigungsdatensatz mit eingefrorenem Inhalt
- Name, Funktion, Zeitpunkt, Hash und optionale gezeichnete Unterschrift
- Relevante Änderung benötigt gegebenenfalls eine neue Bestätigung
- Keine Behauptung einer QES, automatischen Rechtsverbindlichkeit oder automatischen Rechnungsfreigabe

## 13. Excel

Die vier bereitgestellten Original-Arbeitsmappen wurden nur lokal lesend analysiert. Der anonymisierte Audit umfasst 200/200 Projekt-/Baulistenblätter, 54/54 Wochenplanungsblätter, 3/3 Urlaubsplanerblätter und 2/2 Kostenübersichtsblätter einschließlich Formeln, Varianten, internen Bezügen, Blattzuständen und Druck-/Formatierungsstrukturen. Die 198 historischen Nicht-Hauptlistenblätter sind nicht einheitlich: sechs Sonderkonten, 19 Layoutfamilien normaler Projekte und 147 Blockvarianten. Die öffentliche Demo verwendet deshalb ein B200-orientiertes, versioniertes **kanonisches** Projektblatt, nicht 147 App-Datenmodelle. In der Demo sind Hauptliste, Projektblatt, Wochenplanung und ein synthetischer Urlaubsplaner exportierbar; ein Kostenübersichts-Export fehlt bewusst. Private Fixwerte wurden nicht veröffentlicht.

Vor produktiver Ablösung sind die benötigten Kennzahlen und künftigen Parameter fachlich zu bestätigen; historische Excel-Formeln allein sind keine beschlossenen App-Regeln. Besonders zu entscheiden sind die verschobenen Materialreferenzen in B200 (`K162`, `K163`), historische fehlende Summenanker und die Kostenübersichts-Anomalien `K001!C17`, `C20`, `C178` sowie die wechselnden Kategorien der Monatsgesamtzeile. Akzeptierte Projektstunden müssen aus freigegebenen Zeitdaten statt aus synthetischen Kontoständen aggregiert werden; die bestehende Demo leistet das noch nicht. Eine produktive Exportvorlage braucht Versionierung, reproduzierbare synthetische Golden Tests, interne Summen-/Referenzprüfung und einen expliziten Umgang mit Null-Division. Das App-Datenmodell bleibt unabhängig von Zelladressen. Ein Demo-XLSX ist weder eine Kopie noch ein Ersatz der privaten Originaldatei. Details: `EXCEL_QUELLABGLEICH.md`.

## 14. Produktive Exporte

- PDF, XLSX und CSV serverseitig reproduzierbar erzeugen
- Vorlagenversion und eindeutige Datei-ID führen
- Keine stillen Überschreibungen
- Zugriffskontrolle für Erzeugung und Abruf

## 15. Hosting

Vorgesehene Zielrichtung: Hetzner Cloud, Region Nürnberg, Ubuntu 24.04 LTS, x86-64, ungefähr 4 vCPU / 8 GB RAM, Docker Compose, Caddy und HTTPS. PostgreSQL und API dürfen nicht direkt öffentlich erreichbar sein. Weboberfläche und API sollen über dieselbe Origin unter `/` und `/api` erreichbar sein.

## 16. Dateispeicher

Externer S3-kompatibler Object Storage wird bevorzugt. Nicht sämtliche Dateien ausschließlich auf demselben App-Server ablegen.

## 17. Backup / Restore

- Datenbank-Backup und Object-Storage-Konzept
- Regelmäßiger Restore-Test
- Definierte RPO/RTO, Rotation und dokumentierte Verantwortlichkeit

## 18. Datenschutz

Vor echten Daten klären: Betreiber, Verantwortlicher, AVV, TOM, Supportzugriff, Aufbewahrung, Löschung, Auskunft sowie Umgang mit Mitarbeiterdaten, Fotos, Signaturen und Logs.

## 19. Support

- Kein permanenter Entwicklerzugriff
- Temporäre, zweckgebundene und zeitlich begrenzte Freigabe
- Pseudonymisierte Logs soweit möglich
- Audit aller Supportzugriffe

## 20. Monitoring / Fehler

- Health Checks, Fehlerprotokollierung und technische Diagnose
- Datenschutzgerechte Logs ohne unnötige Personen- oder Kundendaten

## 21. Echte Gerätetests

Vor Produktivübergabe auf iPhone, iPad, Android und Desktop testen: PWA, Kamera, Signatur, Offline, Wiederverbindung, Push und gemeinsame Fahrzeuggeräte.

## 22. Datenmigration

Mitarbeiterstammdaten, aktive Baustellen, Bau-Nrn., gegebenenfalls Artikelstamm und offene Rechnungs-/Projektinformationen fachlich abgrenzen. Keine unkontrollierte Komplettmigration alter Daten.

## 23. Sicherheit

- HTTPS und HttpOnly/Secure/SameSite-Cookies
- CSRF-Schutz, Rate Limits und Inputvalidierung
- Argon2id für Passwörter und geeignete PIN-Hashing-/Rate-Limit-Lösung
- Serverseitige Rollenprüfung, Datei-Upload-Schutz und Audit
- TOTP/2FA für privilegierte Konten vorsehen beziehungsweise final entscheiden

## 24. Produktive Wochenplanung

Die zellenweise Planung, Mehrfachzuweisung, Kopie der Vorwoche und Veröffentlichung sind in Demo-Version 11 nur lokal bedienbar. Produktiv erforderlich sind ein serverseitiges Planungsdatenmodell, atomare Änderungen, Rollenprüfung, konkurrierende Bearbeitung, Audit mit vorher/nachher, ein eindeutiger Veröffentlichungsstand und zuverlässige Mitarbeiterbenachrichtigungen. Genehmigter Urlaub muss fachlich konsistent eingeblendet werden. Eine localStorage-Matrix ist weder Datenmodell noch Konfliktlösung.

Seit Demo-Version 15 wird eine Planungswoche über ihren ISO-Montag und das zugehörige Kalenderjahr identifiziert; gleiche KW-Nummern verschiedener Jahre bleiben getrennt. Produktiv muss dieser Schlüssel serverseitig eindeutig sein. Die synthetischen Projektstunden werden in der Demo aus datierten akzeptierten Zeitdatensätzen nach Bau-Nr. und Kalenderwoche aggregiert. Produktiv fehlen weiterhin die verbindliche Ableitung aus unveränderbaren Rohereignissen, Freigabe-/Korrekturregeln, eine transaktionale Neuaggregation und reproduzierbare Exportversionen. Die lokale Demo-Zeitprojektion darf nicht als produktives Datenmodell übernommen werden.

## 25. Projektkosten und Rechnungen

Die Demo erfasst sichere Rohpositionen und bildet ausschließlich Kategoriesummen. Produktiv erforderlich sind validierte Geld- und Datumswerte, Belegidentität, Zugriffskontrolle, unveränderbare Zuordnungshistorie, Storno- und Korrekturabläufe sowie eine belastbare Verknüpfung mit Projekt, Rechnungseingang, Dokumentablage und Export. Lieferantendateien benötigen Object Storage und Upload-Schutz. OCR, Kontierung, Freigaberechte, Umsatzsteuerbehandlung und unbekannte Wirtschaftlichkeitsformeln bleiben außerhalb dieser Demo.

## 26. Planungs- und Unterkontoexporte

Demo-Exporte verwenden den aktuellen lokalen Zustand. Produktiv müssen Exporte serverseitig reproduzierbar, versioniert und eindeutig einem Datenstand zugeordnet sein. Gleichzeitige Änderungen während eines Exports, Berechtigungen, Vorlagenversionen und die spätere Analyse der Original-XLSX sind gesondert zu lösen.

## 27. Projektstammdaten und Bau-Nr.-Vergabe

Die Demo zeigt weitere editierbare Projektfelder und einen lokalen, vor dem Speichern änderbaren Nummernvorschlag. Produktiv braucht es ein validiertes Projektstammdatenmodell, serverseitige Rollenprüfung, Audit für Feldänderungen und Sichtbarkeitsgrenzen für interne/kaufmännische Angaben. Die Bau-Nr. soll fachlich nach Auftragserteilung vergeben werden; die Demo-Nummer bei erster Projektanlage ist deshalb nur eine Bedienannahme. Die Nummer muss serverseitig eindeutig und bei parallelen Anlagen transaktional vergeben oder reserviert werden; Jahreswechsel und Kollisionen sind zu testen. Gerätejahr und localStorage dürfen weder Nummernautorität noch produktiver Datenbestand sein. Endgültiges Schema und eine mögliche spätere Umnummerierung verknüpfter Projekte bleiben offen.

## 28. Abgesicherter Paralleltest statt öffentlicher Demo mit Echtdaten

Der einmalig ladbare Torben-Praxistest ist ausschließlich synthetisch und lokal pro Browser. Er ist weder ein gemeinsamer Betriebsdatenbestand noch eine Migration. Vor einem echten Vergleich mit Excel/Papier braucht es eine datenschutzgerecht betriebene Pilotumgebung, einen begrenzten und berechtigten Stammdatenimport, eindeutige Bau-Nr.-Zuordnung, definierte Verantwortliche und eine dokumentierte tägliche/wöchentliche Abstimmung. Festzulegen ist, welcher bisherige Prozess während der Übergangsphase führend bleibt und wann Abweichungen als geklärt gelten. Mitarbeiter dürfen echte Daten nicht in der öffentlichen GitHub-Pages-Demo erfassen. Der vorgeschlagene Ablauf steht in [TORBEN_PARALLELTEST.md](./TORBEN_PARALLELTEST.md).

## 29. Fachbegriffe, Sichtbarkeit und Datenminimierung

Die in Demo-Version 16 klarer getrennten Abläufe für Projektanlage, Mitarbeiteranlage, Materialbedarf, zusätzliche Materialanforderung, Entnahme und tatsächlichen Einsatz sind Bedienvorschläge. Vor dem produktiven Datenmodell müssen Torben und Büro die Begriffe und Zuständigkeiten bestätigen. Projektkontakte sind fachlich in Auftraggeber, konkreten Ansprechpartner, externe Bauleitung und internen Maler-Meyer-Ansprechpartner zu trennen, soweit dieser Aufbau dem echten Ablauf entspricht.

Produktiv braucht jede Rolle eine serverseitig geprüfte Feldsicht. Kaufmännische Werte und interne Notizen dürfen nicht allein deshalb für Mitarbeiter sichtbar sein, weil sie im gemeinsamen Projektdatensatz liegen. Die Mitarbeiterverwaltung dieser Baustellenanwendung ist keine Personalakte. Gesundheitsangaben, Leistungsbewertungen oder sensible Einsatznotizen dürfen ohne festgelegten Zweck, Rechtsgrundlage, Zugriff, Aufbewahrung und Löschung nicht ergänzt werden. Deaktivierung muss historische Projekt- und Zeitbezüge erhalten; Krankheit und Urlaub sind eigenständige zeitbezogene Zustände und kein Ersatz für Deaktivierung.

## 30. Interaktiver Praxistest

Der interaktive Praxistest der öffentlichen Demo ist ein lokales Erhebungswerkzeug, kein produktives Support- oder Telemetriesystem. Er speichert Aufgabenfortschritt, Notizen, pseudonyme Bedienereignisse, technische Fehler und den synthetischen Demo-Zustand im Browser und exportiert sie als JSON. Es gibt keine Audioaufnahme und keine automatische Übermittlung.

Demo-Version 18 enthält neben 34 Bedienaufgaben einen mit dem PDF-Gesprächsleitfaden abgeglichenen Katalog aus 30 fachlichen Abschlussfragen. Er trennt Kernentscheidungen für den ersten Pilot von Punkten, die bewusst später beziehungsweise zwingend vor Echtbetrieb geklärt werden können. Eine im Test notierte Antwort wird erst nach Auswertung und Übernahme in die verbindlichen Entscheidungs- und Spezifikationsdokumente zur Projektentscheidung; die JSON-Datei selbst ist kein produktives Pflichtenheft.

Falls ein vergleichbarer Ablauf später produktiv verwendet werden soll, sind Zweck, Rechtsgrundlage, Einwilligung beziehungsweise betriebliche Mitbestimmung, Rollen, Aufbewahrung, Löschung, Zugriff, sichere Übertragung und Datenminimierung vorher festzulegen. Ein produktives System darf keine Passwörter, PINs, Formulareingaben oder unnötigen Personen-/Kundendaten protokollieren. Audio oder Transkription wären ein eigenes, separat zu prüfendes Modul und werden aus dieser Demo nicht abgeleitet.

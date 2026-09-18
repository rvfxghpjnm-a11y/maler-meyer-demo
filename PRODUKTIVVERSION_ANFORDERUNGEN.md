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

Die vier bereitgestellten Original-Arbeitsmappen wurden lokal und nur strukturell gelesen. Eine zentrale Bauliste mit vielen Bau-Nr.-Projektblättern, getrennte Wochenblätter, ein Urlaubsplaner und eine separate Kostenübersicht sind beobachtet. In der Bauliste sind Gesamtkosten, geschriebene Rechnungen und Ergebnis als getrennte Nachbarspalten sowie Blattbezüge sichtbar. Das beweist nicht, dass deren bestehende Formeln als Regeln der neuen App übernommen werden sollen. Noch nötig: vollständiger zellgenauer Audit von Formeln, Zellbezügen, Summen, benannten/versteckten Bereichen, bedingter Formatierung, Druckbereichen und Hauptliste-Projektblatt-Verknüpfungen; danach fachliche Freigabe. Keine Originaldaten oder Fixwerte in der öffentlichen Demo.

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

## 25. Projektkosten und Rechnungen

Die Demo erfasst sichere Rohpositionen und bildet ausschließlich Kategoriesummen. Produktiv erforderlich sind validierte Geld- und Datumswerte, Belegidentität, Zugriffskontrolle, unveränderbare Zuordnungshistorie, Storno- und Korrekturabläufe sowie eine belastbare Verknüpfung mit Projekt, Rechnungseingang, Dokumentablage und Export. Lieferantendateien benötigen Object Storage und Upload-Schutz. OCR, Kontierung, Freigaberechte, Umsatzsteuerbehandlung und unbekannte Wirtschaftlichkeitsformeln bleiben außerhalb dieser Demo.

## 26. Planungs- und Unterkontoexporte

Demo-Exporte verwenden den aktuellen lokalen Zustand. Produktiv müssen Exporte serverseitig reproduzierbar, versioniert und eindeutig einem Datenstand zugeordnet sein. Gleichzeitige Änderungen während eines Exports, Berechtigungen, Vorlagenversionen und die spätere Analyse der Original-XLSX sind gesondert zu lösen.

## 27. Projektstammdaten und Bau-Nr.-Vergabe

Die Demo zeigt weitere editierbare Projektfelder und einen lokalen, vor dem Speichern änderbaren Nummernvorschlag. Produktiv braucht es ein validiertes Projektstammdatenmodell, serverseitige Rollenprüfung, Audit für Feldänderungen und Sichtbarkeitsgrenzen für interne/kaufmännische Angaben. Die Bau-Nr. soll fachlich nach Auftragserteilung vergeben werden; die Demo-Nummer bei erster Projektanlage ist deshalb nur eine Bedienannahme. Die Nummer muss serverseitig eindeutig und bei parallelen Anlagen transaktional vergeben oder reserviert werden; Jahreswechsel und Kollisionen sind zu testen. Gerätejahr und localStorage dürfen weder Nummernautorität noch produktiver Datenbestand sein. Endgültiges Schema und eine mögliche spätere Umnummerierung verknüpfter Projekte bleiben offen.

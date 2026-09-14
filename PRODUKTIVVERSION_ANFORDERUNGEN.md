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
- Offline-PIN-Verhalten fachlich entscheiden

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
- Offen bleiben: Fahrzeitvergütung, Überstunden, Rüstzeit und Nacht-/Mitternachtsregeln

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
- Fachlich offen: Lagerbestand, Mindestbestand, Bestellung, Barcode, Artikelstamm und Bewertungsmethode

## 11. Urlaub

- Antrag, Genehmigung/Ablehnung, Planung, Benachrichtigung und Audit
- Fachlich offen: Genehmigungsrechte, Resturlaub, Vertretung, Berechnung der Arbeitstage, Sonderurlaub und weitere Sonderfälle

## 12. Zusatzarbeiten / Signatur

- Eigener unveränderbarer Bestätigungsdatensatz mit eingefrorenem Inhalt
- Name, Funktion, Zeitpunkt, Hash und optionale gezeichnete Unterschrift
- Relevante Änderung benötigt gegebenenfalls eine neue Bestätigung
- Keine Behauptung einer QES, automatischen Rechtsverbindlichkeit oder automatischen Rechnungsfreigabe

## 13. Excel

Die Original-XLSX-Dateien von Maler Meyer müssen später gesondert analysiert werden: Blattnamen, Formeln, Zellbezüge, Summen, benannte Bereiche, versteckte Blätter, bedingte Formatierung, Druckbereiche und Verknüpfungen zwischen Hauptliste und Projektblättern. Bis dahin keine unbekannte Formel erfinden.

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

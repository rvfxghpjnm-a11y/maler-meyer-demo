from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Maler-Meyer-Video-Call-Praxistest-aktuell.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

FONT_DIR = Path(r"C:\Windows\Fonts")
pdfmetrics.registerFont(TTFont("MM-Regular", str(FONT_DIR / "arial.ttf")))
pdfmetrics.registerFont(TTFont("MM-Bold", str(FONT_DIR / "arialbd.ttf")))

NAVY = colors.HexColor("#173A56")
BLUE = colors.HexColor("#DCEAF2")
GREEN = colors.HexColor("#DDEFD7")
GREEN_DARK = colors.HexColor("#397D4A")
ORANGE = colors.HexColor("#F2B14B")
LIGHT = colors.HexColor("#F5F7F9")
MID = colors.HexColor("#D6DEE4")
DARK = colors.HexColor("#203142")
RED = colors.HexColor("#B8473E")
GREY = colors.HexColor("#667684")

PAGE_W, PAGE_H = A4
LEFT = 16 * mm
RIGHT = 16 * mm
TOP = 23 * mm
BOTTOM = 18 * mm

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="MMTitle", fontName="MM-Bold", fontSize=23, leading=27,
    textColor=NAVY, spaceAfter=5 * mm,
))
styles.add(ParagraphStyle(
    name="MMSubtitle", fontName="MM-Regular", fontSize=11.2, leading=15,
    textColor=DARK, spaceAfter=4 * mm,
))
styles.add(ParagraphStyle(
    name="MMH1", fontName="MM-Bold", fontSize=16, leading=19,
    textColor=NAVY, spaceBefore=1 * mm, spaceAfter=3 * mm,
))
styles.add(ParagraphStyle(
    name="MMH2", fontName="MM-Bold", fontSize=11.2, leading=14,
    textColor=DARK, spaceBefore=2.5 * mm, spaceAfter=1.5 * mm,
))
styles.add(ParagraphStyle(
    name="MMBody", fontName="MM-Regular", fontSize=9.3, leading=13,
    textColor=DARK, spaceAfter=2 * mm,
))
styles.add(ParagraphStyle(
    name="MMSmall", fontName="MM-Regular", fontSize=7.8, leading=10.5,
    textColor=GREY,
))
styles.add(ParagraphStyle(
    name="MMTable", fontName="MM-Regular", fontSize=8, leading=10.3,
    textColor=DARK,
))
styles.add(ParagraphStyle(
    name="MMTableBold", fontName="MM-Bold", fontSize=8.1, leading=10.4,
    textColor=NAVY,
))
styles.add(ParagraphStyle(
    name="MMWhite", fontName="MM-Bold", fontSize=9, leading=11,
    textColor=colors.white,
))
styles.add(ParagraphStyle(
    name="MMCenter", fontName="MM-Regular", fontSize=8.4, leading=11,
    textColor=DARK, alignment=TA_CENTER,
))


def p(text, style="MMBody"):
    return Paragraph(text, styles[style])


def checkbox_line(labels):
    return p("&nbsp;&nbsp;&nbsp;".join(f"&#9633; {label}" for label in labels), "MMBody")


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, PAGE_H - 13 * mm, PAGE_W, 13 * mm, fill=1, stroke=0)
    canvas.setFont("MM-Bold", 9)
    canvas.setFillColor(colors.white)
    canvas.drawString(LEFT, PAGE_H - 8.5 * mm, "MALER MEYER  |  PRAXISTEST")
    canvas.setFont("MM-Regular", 8)
    canvas.drawRightString(PAGE_W - RIGHT, PAGE_H - 8.5 * mm, "Demo-Version 16  |  Stand 30.09.2026")
    canvas.setStrokeColor(MID)
    canvas.line(LEFT, 13 * mm, PAGE_W - RIGHT, 13 * mm)
    canvas.setFont("MM-Regular", 7.5)
    canvas.setFillColor(GREY)
    canvas.drawString(LEFT, 8.5 * mm, "Nur synthetische Daten - keine Produktivfreigabe")
    canvas.drawRightString(PAGE_W - RIGHT, 8.5 * mm, f"Seite {doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUTPUT), pagesize=A4,
    leftMargin=LEFT, rightMargin=RIGHT, topMargin=TOP, bottomMargin=BOTTOM,
    title="Maler Meyer - Video-Call-Praxistest",
    author="Maler Meyer Bedienungsdemo",
    subject="Gemeinsamer Praxistest fuer Vater, Freundin und Torben",
)
frame = Frame(LEFT, BOTTOM, PAGE_W - LEFT - RIGHT, PAGE_H - TOP - BOTTOM, id="normal")
doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=on_page)])


def callout(title, text, color=BLUE):
    table = Table([[p(title, "MMTableBold"), p(text, "MMTable")]], colWidths=[42 * mm, 136 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("BOX", (0, 0), (-1, -1), 0.7, MID),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2.5 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5 * mm),
    ]))
    return table


def task_table(rows):
    data = [[p("Nr.", "MMWhite"), p("Aufgabe", "MMWhite"), p("Das sollte sichtbar passieren", "MMWhite"), p("Ergebnis", "MMWhite")]]
    for nr, task, expected in rows:
        data.append([
            p(str(nr), "MMTableBold"),
            p(task, "MMTableBold"),
            p(expected, "MMTable"),
            p("&#9633; OK<br/>&#9633; unklar<br/>&#9633; Fehler", "MMTable"),
        ])
    table = Table(data, colWidths=[10 * mm, 68 * mm, 73 * mm, 27 * mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("GRID", (0, 0), (-1, -1), 0.55, MID),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
        ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
        ("TOPPADDING", (0, 1), (-1, -1), 2.1 * mm),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 2.1 * mm),
        ("TOPPADDING", (0, 0), (-1, 0), 2 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 2 * mm),
    ]))
    return table


def notes_box(height=28 * mm, title="Notizen zu diesem Abschnitt"):
    table = Table([[p(title, "MMTableBold")], [""]], colWidths=[178 * mm], rowHeights=[8 * mm, height])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), BLUE),
        ("BOX", (0, 0), (-1, -1), 0.65, MID),
        ("LINEBELOW", (0, 0), (0, 0), 0.65, MID),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2 * mm),
    ]))
    return table


story = []

# Cover
story += [
    Spacer(1, 14 * mm),
    p("Maler Meyer", "MMTitle"),
    p("Praxistest fuer den Video-Call", "MMTitle"),
    p("Aktuelle Aufgabenliste mit Ergebnisfeldern, Abschlussfragen und Fehlerprotokoll", "MMSubtitle"),
    Spacer(1, 6 * mm),
    callout(
        "Heute testen",
        "Der Familientest hat bereits konkrete Verbesserungen geliefert. Diese aktualisierte Fassung wird morgen mit Torben vollstaendig durchgegangen; neue Fachentscheidungen werden direkt notiert.",
        GREEN,
    ),
    Spacer(1, 4 * mm),
    callout(
        "Oeffentliche Demo",
        "https://rvfxghpjnm-a11y.github.io/maler-meyer-demo/",
        BLUE,
    ),
    Spacer(1, 7 * mm),
    p("Testperson", "MMH2"),
    checkbox_line(["Vater", "Freundin", "Torben", "sonstige Person: __________________"]),
    Spacer(1, 3 * mm),
    p("Geraet", "MMH2"),
    checkbox_line(["iPhone", "iPad", "Android", "Desktop / Notebook"]),
    Spacer(1, 3 * mm),
    p("Browser und Datum", "MMH2"),
    p("Browser: ________________________________&nbsp;&nbsp;&nbsp;&nbsp; Datum: __________________", "MMBody"),
    Spacer(1, 8 * mm),
    callout(
        "Wichtig",
        "Nur erfundene Testdaten eingeben. Keine echten Mitarbeiter, Kunden, Baustellen, Zeiten, Rechnungen, Fotos oder Unterschriften verwenden. Die Demo speichert nur lokal in diesem Browser.",
        colors.HexColor("#FFF1D7"),
    ),
    Spacer(1, 8 * mm),
    p("Bewertung pro Aufgabe", "MMH2"),
    checkbox_line(["OK = ohne Hilfe geschafft", "unklar = Ziel erreicht, Bedienung unklar", "Fehler = nicht moeglich / falsches Ergebnis"]),
    Spacer(1, 8 * mm),
    p("Ziel des Tests", "MMH2"),
    p("Nicht pruefen, ob die Demo technisch produktionsreif ist. Geprueft wird, ob ein Malerbetrieb die Ablaeufe wiedererkennt, versteht und mit wenigen Schritten bedienen kann.", "MMBody"),
    PageBreak(),
]

# Start and known scenario
story += [
    p("Vorbereitung und gemeinsamer Vergleichsfall", "MMH1"),
    p("Fuer vergleichbare Ergebnisse startet jede Testperson moeglichst mit demselben Zustand.", "MMBody"),
    callout("1. Neu beginnen", "Mehr -> Demo zuruecksetzen. Dadurch werden nur lokale Demo-Aenderungen dieses Browsers verworfen."),
    Spacer(1, 2.5 * mm),
    callout("2. Rolle waehlen", "Geschaeftsfuehrung / Torben oeffnen. Auf der Startseite muss innerhalb weniger Sekunden erkennbar sein, was heute wichtig ist."),
    Spacer(1, 2.5 * mm),
    callout("3. Praxistest laden", "Auf Torbens Startseite 'Praxistest laden' waehlen. Die App bleibt bewusst auf 'Heute'. Danach Projekt Stephan (Demo), Stefan Eins und Stefan Zwei ueber Suche, Baustellen und Mitarbeiter pruefen."),
    Spacer(1, 5 * mm),
    p("Einfache Kontrollzahlen", "MMH2"),
]

numbers = [
    [p("Pruefpunkt", "MMWhite"), p("Synthetischer Wert", "MMWhite"), p("Wo vergleichen?", "MMWhite")],
    [p("Projekt", "MMTableBold"), p("26-107 Projekt Stephan (Demo)*", "MMTable"), p("Baustellenmappe, Bauliste", "MMTable")],
    [p("Mitarbeitende", "MMTableBold"), p("Stefan Eins, Stefan Zwei", "MMTable"), p("Mitarbeiter, Planung", "MMTable")],
    [p("Planung", "MMTableBold"), p("KW 38 / 2026, Mo und Di", "MMTable"), p("Wochenmatrix, XLSX", "MMTable")],
    [p("Zeit", "MMTableBold"), p("2 Personen x 2 Tage x 4 h = 16 h", "MMTable"), p("Projekt, Unterkonto, Bauliste", "MMTable")],
    [p("Fahrt", "MMTableBold"), p("2 Personen x 2 Tage x 0,5 h = 2 h roh", "MMTable"), p("Nur Rohzeit, keine Lohnbewertung", "MMTable")],
    [p("Kosten", "MMTableBold"), p("120 EUR Material extern + 80 EUR Lift", "MMTable"), p("Kosten & Rechnungen", "MMTable")],
    [p("Rechnung", "MMTableBold"), p("1.200 EUR netto geschrieben", "MMTable"), p("Projekt, Rechnungsliste", "MMTable")],
    [p("Demo-Nachrechnung", "MMTableBold"), p("16 x 60 + 120 + 80 = 1.160; Differenz 40 EUR", "MMTable"), p("Nur synthetische Vergleichsrechnung", "MMTable")],
]
nt = Table(numbers, colWidths=[42 * mm, 72 * mm, 64 * mm], repeatRows=1)
nt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("GRID", (0, 0), (-1, -1), 0.55, MID),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 2.2 * mm),
    ("RIGHTPADDING", (0, 0), (-1, -1), 2.2 * mm),
    ("TOPPADDING", (0, 0), (-1, -1), 2 * mm),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm),
]))
story += [nt, Spacer(1, 2 * mm), p("* Wenn 26-107 lokal schon belegt ist, nimmt die Demo die naechste freie Nummer. Test-PINs: Stefan Eins 111111, Stefan Zwei 222222.", "MMSmall"), Spacer(1, 5 * mm), notes_box(24 * mm, "Erster Eindruck - was war sofort klar, was nicht?"), PageBreak()]

# Task pages
story += [p("1. Ankommen, Baustelle finden und Verwaltung", "MMH1")]
story += [task_table([
    (1, "Geschaeftsfuehrer-Morgencheck", "Nach 'Praxistest laden' bleibt 'Heute' offen. Innerhalb von 5 Sekunden muessen offene Punkte, Planungsstatus, Arbeitsstart fehlt, Feierabend und Schnellaktionen verstaendlich sein."),
    (2, "Bau-Nr. suchen und Baustelle oeffnen", "Nach 26-107 beziehungsweise Projekt Stephan suchen. Auf iPhone und iPad duerfen Stammdaten, Kosten und Schriften nicht aus ihren Feldern laufen; auf iPad-Querformat nutzt die geoeffnete Baustelle die Breite."),
    (22, "Neues Projekt separat anlegen", "'Neue Baustelle' oeffnet nur Projektdaten. Bau-Nr. wird passend zum Jahr vorgeschlagen und bleibt editierbar. Ansprechpartner, Telefon, Bauleitung, Baustellenzugang, Zeitraum, Arbeiten und Materialbedarf pruefen."),
    (23, "Neuen Mitarbeiter separat anlegen", "Ueber 'Mitarbeiter' eine synthetische Person ohne erste Baustellenzuordnung anlegen. Taetigkeit und App-Zugriff muessen verstaendlich sein; Deaktivieren ist keine Krankmeldung und loescht keine Historie."),
    (24, "Feedback / Bedienproblem melden", "Ueber die globale Suche 'Feedback' finden, Kategorie und Text erfassen, Fallnummer erhalten und den Fall aufklappen. Keine echte externe Uebermittlung wird behauptet."),
])]
story += [Spacer(1, 5 * mm), notes_box(35 * mm), PageBreak()]

story += [p("2. Wochenplanung wirklich bedienen", "MMH1")]
story += [task_table([
    (25, "Vollstaendige neue Woche planen", "Kalenderwoche mit Jahr und Datumsbereich auswaehlen; leere Woche erstellen. Die aktuell gewaehlte KW bleibt deutlich sichtbar."),
    (28, "Vorwoche kopieren", "Neue Woche aus der Vorwoche erzeugen. Ergebnis ist editierbar und als Demo-Vorschlag gekennzeichnet."),
    (26, "Zukuenftigen Mittwoch aendern", "Einzelne Zelle antippen und Baustelle, frei, Urlaub oder Krank waehlen. Eine andere KW veraendert die heutige Zuordnung nicht."),
    (27, "Kolonne Montag bis Mittwoch zuweisen", "Mehrere Mitarbeitende und mehrere Tage markieren, Zielbaustelle waehlen und in einem Schritt zuordnen. Keine ueberlappenden Felder auf Mobilgeraeten."),
    (3, "Krankmeldung und Umplanung", "Krank markieren und betroffene Planung anpassen. Keine arbeitsrechtliche Nebenlogik wird berechnet."),
    (16, "Genehmigten Urlaub in Planung pruefen", "Nach der Demo-Genehmigung erscheint Urlaub bei der Person in Tages- und Wochenplanung."),
    (29, "Mitarbeiter sieht 'Meine Woche'", "In die Mitarbeiterperspektive wechseln. Nur eigene Planung, keine kaufmaennischen Daten."),
    (30, "Planung veroeffentlichen und Hinweis pruefen", "Veroeffentlichte Aenderung erzeugt einen lokalen Demo-Hinweis fuer die betroffene Person; kein echter Push wird behauptet."),
])]
story += [Spacer(1, 5 * mm), notes_box(24 * mm), PageBreak()]

story += [p("3. Fahrzeuggeraet, Offline, Zeit und Wochenzettel", "MMH1")]
story += [task_table([
    (4, "Fahrzeug-iPad mit 6-stelligem PIN", "Person auswaehlen, synthetischen PIN eingeben, eigene Ansicht oeffnen, sperren und Benutzer wechseln. Demo-Sicherheit bleibt erkennbar."),
    (5, "Offline Zeit und Notiz erfassen", "Offline simulieren, Zeitaktion und Notiz speichern, Warteschlange sehen, online simulieren und Synchronisationsanzeige beobachten."),
    (6, "Buero bucht stellvertretend", "Fuer eine Person aktuelle Zeitaktion mit Grund erfassen. Betroffene Person und handelndes Buero bleiben getrennt nachvollziehbar."),
    (7, "Vergessene Startzeit korrigieren", "Korrektur anfordern und im Buero bearbeiten. Vorher, nachher, Grund und Bearbeiter bleiben sichtbar."),
    (8, "Wochenzettel bestaetigen", "Woche pruefen, optional mit Finger/Maus unterschreiben und als neue unveraenderte Version bestaetigen."),
    (9, "Bestaetigten Wochenzettel korrigieren", "Alte Version bleibt sichtbar; neue Version verlangt erneute Bestaetigung. Alte Unterschrift wird nicht uebernommen."),
])]
story += [Spacer(1, 5 * mm), notes_box(32 * mm), PageBreak()]

story += [p("4. Baustellendokumentation, Material und Urlaub", "MMH1")]
story += [task_table([
    (10, "Schaden mit Foto und Sprache dokumentieren", "Lokales Testfoto auswaehlen, Sprache-Demo starten, erkannten Entwurf bearbeiten und erst nach eigener Pruefung uebernehmen."),
    (11, "Fortschrittsnotiz speichern", "Bau-Nr., Kategorie, Bereich und Text erfassen. Notiz erscheint im Baustellenverlauf."),
    (12, "Zusaetzliches Material anfordern", "3 Rollen Abdeckvlies fuer Projekt Stephan anfordern. Geplante Materialbedarfsliste und spaetere Zusatzanforderung muessen begrifflich unterscheidbar sein; Buero sieht den neuen Eintrag."),
    (13, "Materialentnahme und Verbrauch", "Entnahme und tatsaechlichen Verbrauch erfassen. Materialverlauf zeigt alle Schritte projektbezogen."),
    (14, "Buero bearbeitet Material", "Anforderung oeffnen und Demo-Status aendern. Aenderung bleibt nachvollziehbar. Mit Torben klaeren, wer prueft und wer eine Meldung erhalten soll."),
    (15, "Urlaub beantragen", "Von/bis, Typ und Bemerkung erfassen. Kein Resturlaubsanspruch wird automatisch erfunden."),
    (16, "Urlaub entscheiden", "Geschaeftsfuehrung genehmigt oder lehnt ab. Status ist beim Mitarbeiter sichtbar; Genehmigungsrechte bleiben als Fachentscheidung dokumentiert."),
])]
story += [Spacer(1, 5 * mm), notes_box(25 * mm), PageBreak()]

story += [p("5. Zusatzarbeit, Rechnungen und Projektkosten", "MMH1")]
story += [task_table([
    (17, "Zusatzarbeit mit Bestaetigung", "Beschreibung, Menge, Einheit, benoetigtes Material/Geraet als Hinweis und bestaetigende Person erfassen; optional zeichnen. Dokumentation, Arbeitsfreigabe und kaufmaennische Pruefung nicht gleichsetzen."),
    (18, "Bestaetigte Zusatzarbeit aendern", "Zum Beispiel 18 m2 auf 24 m2 aendern. Alte Bestaetigung bleibt beim alten Snapshot; neuer Inhalt braucht neue Bestaetigung."),
    (31, "Liftkosten hinzufuegen", "80 EUR netto mit Datum und Beschreibung erfassen. Betrag erscheint in Projektansicht und Unterkonto."),
    (32, "Eingangsrechnung zuordnen", "120 EUR netto, synthetischen Lieferanten und Bau-Nr. erfassen. Als manuelle Demo-Zuordnung gekennzeichnet; keine OCR vortaeuschen."),
    (33, "Geschriebene Rechnung erfassen", "1.200 EUR netto mit synthetischer Referenz speichern. Projekt und Rechnungsliste zeigen denselben Eintrag."),
    (19, "'Rechnung schreiben?' oeffnen", "Statusliste oeffnen und von dort das zugehoerige Projekt erreichen. Status bleibt als Demo-Vorschlag erkennbar."),
    (20, "Kosten & Rechnungen beurteilen", "Nur Rohwerte und sichere Summen pruefen: Zeit, Fahrt roh, Material, Lift, externe Kosten und geschriebene Rechnungen."),
])]
story += [Spacer(1, 5 * mm), notes_box(25 * mm), PageBreak()]

story += [p("6. Dokumente und Exporte", "MMH1")]
story += [task_table([
    (21, "Arbeitszettel, Materialanforderung und Aufmass oeffnen", "Baustellenbezogene Druckansichten oeffnen. A4, Lesbarkeit, Bau-Nr. und synthetische Inhalte pruefen."),
    (34, "Projektkosten-XLSX kontrollieren", "Schaltflaeche 'Projektkosten & Rechnungen als XLSX' verwenden. Zeit 16 h, Fahrt 2 h roh, Kosten 120 + 80 EUR und Rechnung 1.200 EUR muessen im aktuellen projektbezogenen Excel-Export erscheinen."),
    (20, "Bauliste / Nachkalkulation exportieren", "Hauptliste und Projektblatt verwenden denselben lokalen Demo-Zustand. Keine #REF!- oder sichtbaren #DIV/0!-Fehler im normalen Testfall."),
    (25, "Wochenplanung als XLSX und PDF", "Plan aendern, danach exportieren. Bau-Nr. und Baustellenname sowie die aktuelle Aenderung muessen enthalten sein."),
    (8, "Bestaetigten Wochenzettel drucken", "Mitarbeiter, KW, Version, Status, Zeitpunkt und optionale Demo-Unterschrift sind sichtbar; ersetzte Version bleibt gekennzeichnet erhalten."),
    (17, "Bestaetigte Zusatzarbeit drucken", "Eingefrorener Inhalt, bestaetigende Person, Zeitpunkt und optionale Demo-Unterschrift sind sichtbar - ohne Rechtsverbindlichkeitsbehauptung."),
])]
story += [Spacer(1, 5 * mm), notes_box(36 * mm), PageBreak()]

# UX assessment
story += [p("Bewertung nach dem Durchlauf", "MMH1"), p("Bitte spontan bewerten. 1 = sehr schlecht / unklar, 5 = sehr gut / sofort verstaendlich.", "MMBody")]
questions = [
    "Ich verstehe die Startseite innerhalb von 5 Sekunden.",
    "Ich finde die Wochenplanung ohne Anleitung.",
    "Eine einzelne Planänderung gelingt mit wenigen Schritten.",
    "Ich erkenne jederzeit Kalenderwoche, Jahr und Datumsbereich.",
    "Ich finde eine Baustelle sofort ueber die Bau-Nr.",
    "In einer Baustelle finde ich operative und kaufmaennische Informationen an der erwarteten Stelle.",
    "Die Aufgaben des Bueros sind schnell erreichbar.",
    "Die Mitarbeiteransicht ist einfacher als die Buero-/Geschaeftsfuehrungsansicht.",
    "Begriffe, Status und Schaltflaechen sind ohne Softwarewissen verstaendlich.",
    "Ich musste nicht unnoetig zwischen vielen Bereichen wechseln.",
    "Materialbedarf, Materialanforderung, Entnahme und Einsatz sind fuer mich eindeutig getrennt.",
    "Projektanlage und Mitarbeiteranlage fuehlen sich wie zwei klar getrennte Aufgaben an.",
]
qdata = [[p("Aussage", "MMWhite"), p("1", "MMWhite"), p("2", "MMWhite"), p("3", "MMWhite"), p("4", "MMWhite"), p("5", "MMWhite"), p("Kurznotiz", "MMWhite")]]
for q in questions:
    qdata.append([p(q, "MMTable"), p("&#9633;", "MMCenter"), p("&#9633;", "MMCenter"), p("&#9633;", "MMCenter"), p("&#9633;", "MMCenter"), p("&#9633;", "MMCenter"), ""])
qt = Table(qdata, colWidths=[92 * mm, 9 * mm, 9 * mm, 9 * mm, 9 * mm, 9 * mm, 41 * mm], rowHeights=[9 * mm] + [13 * mm] * len(questions), repeatRows=1)
qt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("GRID", (0, 0), (-1, -1), 0.55, MID),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("ALIGN", (1, 1), (5, -1), "CENTER"),
    ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm),
    ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
]))
story += [qt, Spacer(1, 6 * mm), notes_box(27 * mm, "Die drei wichtigsten Verbesserungen") , PageBreak()]

# Questions for Torben - 2 pages
story += [
    p("Fachliche Rueckfragen - Teil 1", "MMH1"),
    p("Vater und Freundin markieren hier vor allem, was unklar wirkt. Torben beantwortet spaeter die fachliche Entscheidung.", "MMBody"),
]
decision_rows_1 = [
    ("Planung", "Sind Entwurf / veroeffentlicht und Vorwoche kopieren hilfreich oder unnoetig?"),
    ("Rollen", "Welche Rechte haben Torben, Steffen, Buero, Vorarbeiter und Mitarbeiter endgueltig?"),
    ("Projektkontakte", "Sind Auftraggeber/Firma, Ansprechpartner mit Telefon, externe Bauleitung und interner Maler-Meyer-Ansprechpartner so richtig getrennt und benannt?"),
    ("Sichtbarkeit", "Welche Projekt-, Kontakt-, Foto- und Zeichnungsdaten duerfen normale Mitarbeiter sehen? Welche Geld-/Stundenvorgaben auf keinen Fall?"),
    ("Fahrzeit", "Welche Rohfahrt wird spaeter wie bewertet? Schwellen, Beginn/Ende und Freigabe sind noch festzulegen."),
    ("Zeit", "Wie gelten Ueberstunden, Ruestzeit sowie Nacht-/Mitternachtsfaelle?"),
    ("Wochenzettel", "Wer darf nach Mitarbeiterbestaetigung final freigeben und welche Korrektur ist versionsrelevant?"),
    ("Zusatzarbeit", "Wer gibt die Ausfuehrung frei, wer prueft kaufmaennisch und wo werden zusaetzliches Material, Lift oder Geruestbedarf festgehalten?"),
    ("Material", "Ist 'Materialbedarf' die geplante Projektliste und 'zusaetzliche Materialanforderung' die spaetere Meldung? Wer prueft sie und wer wird benachrichtigt?"),
    ("Urlaub", "Wer genehmigt final? Wie sollen halber Urlaub, Sonderurlaub, unbezahlt und Resturlaub behandelt werden?"),
    ("Abwesenheit", "Wo meldet das Buero Krank von/bis? Reicht Planung plus Verlauf oder wird ein eigener Mitarbeiter-Ablauf benoetigt?"),
    ("Fahrzeug-PIN", "Darf PIN-Entsperrung offline funktionieren und nach welcher Zeit wird automatisch gesperrt?"),
]
ddata = [[p("Thema", "MMWhite"), p("Frage", "MMWhite"), p("Entscheidung / Notiz", "MMWhite")]]
for theme, question in decision_rows_1:
    ddata.append([p(theme, "MMTableBold"), p(question, "MMTable"), ""])
dt = Table(ddata, colWidths=[31 * mm, 89 * mm, 58 * mm], rowHeights=[9 * mm] + [16 * mm] * len(decision_rows_1), repeatRows=1)
dt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("GRID", (0, 0), (-1, -1), 0.55, MID),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm),
    ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
    ("TOPPADDING", (0, 1), (-1, -1), 2 * mm),
]))
story += [dt, PageBreak()]

story += [p("Fachliche Rueckfragen - Teil 2", "MMH1")]
decision_rows_2 = [
    ("Hinweise / Push", "Welche Meldungen sind wichtig und zu welchen Zeitpunkten? Freitag 16:00 ist bisher nur Beispiel."),
    ("Rechnung schreiben?", "Welche endgueltigen Status, Verantwortlichen und Abschlusskriterien werden gebraucht?"),
    ("Eingangsrechnung", "Soll OCR in die erste Produktivversion oder spaeter? Welche Daten muessen geprueft werden?"),
    ("Bau-Nr.", "Wann wird sie vergeben, wer darf sie aendern und wie wird eine Nummer reserviert?"),
    ("Projektfelder", "Welche sichtbaren Felder braucht Torben wirklich taeglich, welche nur aufklappbar und welche gar nicht?"),
    ("Abrechnungshinweis", "Freitext oder Auswahl wie Festpreis, Stundenlohn, Nachbesserung/Garantie? Wer darf den Hinweis sehen?"),
    ("Mitarbeiterdaten", "Bleibt es bewusst bei Organisationsdaten ohne Personalakte? Sind interne Einsatzhinweise ueberhaupt gewuenscht und datenschutzrechtlich vertretbar?"),
    ("Excel", "Welche sichtbaren Kennzahlen aus Hauptliste und Projektblatt werden wirklich gebraucht? Welche Namen sind fuer R/S/T am klarsten?"),
    ("Excel-Abweichungen", "Historisch verschobene Materialformeln und Kosten-Anomalien: erhalten, korrigieren oder nach neuer Fachregel ersetzen?"),
    ("Kostenuebersicht", "Soll die unternehmensweite Jahreskostenmappe Teil der ersten Produktivversion sein? Welche Kategorien gehoeren in Monats-/Jahressummen?"),
    ("Datenschutz", "Aufbewahrung, Loeschfristen, Betriebsrat/Mitbestimmung, Betreiber und AVV festlegen."),
    ("Betrieb", "Backup-Ziele, Wiederherstellungszeit, Supportzugriff und finale Produktivdomain festlegen."),
    ("Parallelphase", "Welche 1-2 Baustellen eignen sich fuer einen gesicherten Pilot und welche alte Unterlage bleibt wie lange fuehrend?"),
]
ddata2 = [[p("Thema", "MMWhite"), p("Frage", "MMWhite"), p("Entscheidung / Notiz", "MMWhite")]]
for theme, question in decision_rows_2:
    ddata2.append([p(theme, "MMTableBold"), p(question, "MMTable"), ""])
dt2 = Table(ddata2, colWidths=[31 * mm, 89 * mm, 58 * mm], rowHeights=[9 * mm] + [15 * mm] * len(decision_rows_2), repeatRows=1)
dt2.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("GRID", (0, 0), (-1, -1), 0.55, MID),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm),
    ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
    ("TOPPADDING", (0, 1), (-1, -1), 2 * mm),
]))
story += [dt2, PageBreak()]

# Defect log
story += [
    p("Fehler- und Beobachtungsprotokoll", "MMH1"),
    p("Bei einem Fehler moeglichst Aufgabe, Geraet, Browser und Screenshot-Name notieren. 'Erwartet' und 'beobachtet' getrennt beschreiben.", "MMBody"),
]
log_header = [p("ID", "MMWhite"), p("Aufg.", "MMWhite"), p("Geraet / Browser", "MMWhite"), p("Erwartet / beobachtet", "MMWhite"), p("Prioritaet", "MMWhite")]
log_rows = [log_header]
for idx in range(1, 9):
    log_rows.append([p(f"F-{idx:02d}", "MMTableBold"), "", "", "", p("&#9633; hoch<br/>&#9633; mittel<br/>&#9633; klein", "MMSmall")])
lt = Table(log_rows, colWidths=[14 * mm, 14 * mm, 38 * mm, 83 * mm, 29 * mm], rowHeights=[9 * mm] + [23 * mm] * 8, repeatRows=1)
lt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), NAVY),
    ("GRID", (0, 0), (-1, -1), 0.55, MID),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm),
    ("RIGHTPADDING", (0, 0), (-1, -1), 2 * mm),
    ("TOPPADDING", (0, 1), (-1, -1), 2 * mm),
]))
story += [lt, PageBreak()]

# Summary
story += [
    p("Testabschluss", "MMH1"),
    p("Bitte direkt nach dem Test ausfuellen - noch bevor ueber einzelne Loesungen diskutiert wird.", "MMBody"),
    p("Gesamteindruck", "MMH2"),
    checkbox_line(["sofort verstaendlich", "mit kurzer Einweisung nutzbar", "zu kompliziert", "wichtige Ablaeufe fehlen"]),
    Spacer(1, 4 * mm),
    notes_box(30 * mm, "Was hat besonders gut funktioniert?"),
    Spacer(1, 5 * mm),
    notes_box(30 * mm, "Was war am unklarsten oder an der falschen Stelle?"),
    Spacer(1, 5 * mm),
    notes_box(30 * mm, "Welche eine Aenderung sollte vor dem Torben-Call unbedingt erfolgen?"),
    Spacer(1, 6 * mm),
    p("Darf dieser Stand Torben gezeigt werden?", "MMH2"),
    checkbox_line(["ja", "ja, nach kleinen Korrekturen", "nein, erst wesentliche Fehler beheben"]),
    Spacer(1, 8 * mm),
    p("Testperson: _____________________________________&nbsp;&nbsp;&nbsp; Dauer: __________ Minuten", "MMBody"),
    Spacer(1, 4 * mm),
    callout(
        "Nach dem Test",
        "PDF oder Fotos der ausgefuellten Seiten zusammen mit den Screenshots sammeln. Fuer den Torben-Termin die gleiche PDF frisch ausdrucken oder digital verwenden, damit Bewertungen direkt vergleichbar bleiben.",
        GREEN,
    ),
]

doc.build(story)
print(OUTPUT)

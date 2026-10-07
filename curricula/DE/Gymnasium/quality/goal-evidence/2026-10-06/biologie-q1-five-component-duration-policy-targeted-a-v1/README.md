# Biologie Q1: fünf begrenzte Duration-Policy-Kandidaten

Dieses isolierte Autorenpaket bereitet fünf explizite Dauerbindungen für die
aktuellen Genetik-Quellenkomponenten vor. **Unabhängige Root-/B-Prüfung und aktive
Integration stehen aus.** Keine aktive Datei wurde verändert. Neue fachliche
M7-Abschlüsse, wiederhergestellte aktive Bindungen und strenger Nettozuwachs:
jeweils **0**.

## Ursache

Der unveränderte native Checker
`app/scripts/reportGymnasiumDurationModelReadiness.ts` ordnet Entscheidungen
ausschließlich nach dem genauen `sourceExtractionPath` zu. Er erbt keinen
Eintrag über gleiches `sourceDocument` oder eine erhaltene Elternquellen-Ziel-ID.
Die fünf neu integrierten Komponentenpfade BB/BE/MV/SN/TH besitzen daher trotz
bereits geprüfter Elternsemantik keinen eigenen Policy-Eintrag und bleiben
`open:grade-structured-needs-duration-policy`.

Der vorherige Lauf hatte einen **aktuellen generierten Bericht und trotzdem
Exit 1**. Das `ok` der Berichtsgleichheit ist keine erfolgreiche Dauerfreigabe.

## Enger Kandidat

`gymnasium-duration-model-policy.five-components.candidate.json` enthält die
vollständige bestehende Policy plus genau fünf zusätzliche Einträge.
`five-component-duration-policy.delta.candidate.json` liefert nur die fünf
Anhänge und die aktuelle Baseline-Bindung.

| Komponentenquelle | Bestehende Elternsemantik | Tatsächliche Primärquelle und Scope |
| --- | --- | --- |
| BB Genetik | duration-neutral, G8 und G9 | identisches RLP-PDF 2015, Gymnasium Jahrgänge 7–10/Niveaus E–H, Genetik 3.7 |
| BE Genetik | duration-neutral, G8 und G9 | identisches RLP-PDF 2015, Gymnasium Jahrgänge 7–10/Niveaus E–H, Genetik 3.7 |
| MV Genetik | single-duration, G8 | identisches Rahmenplan-PDF 2022, Sek I, Klasse 10, 3.2 Unterrichtsinhalte/Klassische Genetik |
| SN Genetik | single-duration, G8 | identisches Lehrplan-PDF 2025, Gymnasium Klassenstufe 10, Lernbereich 1 Genetik |
| TH Genetik | single-duration, G8 | identisches Lehrplan-PDF 2024, Sek I Klassenstufen 9/10, 2.2.1.3 Genetik |

Alle 148 vorhandenen Policy-Objekte sowie alle übrigen Policy-Felder bleiben
exakt gleich. In den neuen Einträgen sind Fach, Bundesland, SekI, Decision,
DurationModels, LearnerFacingProjection und der bestehende Contractstatus
`reviewed` identisch zum geprüften Elternsatz. Der neue Pfad und die konkrete
begrenzte Begründung sind die beabsichtigten Unterschiede. **`reviewed` steht
hier ausschließlich im inaktiven Kandidaten für die spätere unabhängige
Prüfung; es behauptet keine bereits erfolgte neue Root-/B-Freigabe.**

Das Paket ändert weder die Darstellung der Dauer im Produkt noch Quellen-
Extraktionen, Klassenplatzierung, Kursprofil, `target`/`prerequisiteOnly`,
CompositionViews oder kanonische Ziele. MV/SN/TH werden nicht auf G9 erweitert.
Die bestehenden Elternquellen-Extraktionen nennen ihre Stufe ausgeschrieben
`Sekundarstufe I`, die Komponenten `SekI`; diese vorhandene Schreibdifferenz ist
als semantisch gleiche Sek-I-Bindung ausdrücklich dokumentiert.

## Tatsächliche Quellenprüfung des Kandidaten

Die kompletten `sourceDocument`-Objekte sind jeweils exakt gleich zum Elternsatz;
die offizielle PDF-Datei ist dieselbe. Die erhaltenen Originalsummaries stimmen
als ganze Objekte mit der Elternextraktion überein. Die zehn Einzelkomponenten
liegen weiterhin innerhalb der bisherigen Jahrgangs-/Sek-I-Kontexte. Dies ist
keine vollständige Freigabe der ursprünglichen Quellenzeilen.

17 tatsächliche Originalseiten wurden eigens mit `pdftotext -layout` extrahiert
und die entscheidenden Grade-/Abschnittsstellen gelesen. Besonders:

- BB physisch/gedruckt 16 und BE 11: explizite Gymnasium-Jahrgänge 7, 8, 9, 10;
  Genetik physisch/gedruckt 36 bleibt ein 3.7-Themenfeld ohne erfundene einzelne
  feste Klassenplatzierung.
- MV physisch 28/gedruckt 24: tatsächliche Klasse 10; physisch 30/gedruckt 26:
  Mutationszeilen. Die bereits korrigierte tatsächliche Abschnittsüberschrift
  3.2 liegt physisch 17/gedruckt 13.
- SN physisch 42/gedruckt 30: Klassenstufe 10 und Lernbereich 1; Fortsetzung
  physisch 43/gedruckt 31.
- TH physisch 26/gedruckt 20: Klassenstufen 9/10 bis zum Abschluss der Klasse 10;
  Genetik physisch 28/gedruckt 22 und 29/gedruckt 23.

Dies überträgt die bestehende reviewed **Source-/Projektionssemantik** auf ihre
begrenzten, primärquellengleichen Komponenten. Es trifft keine neue allgemeine
Aussage zu aktuellen Schulgesetzen oder zu Dauerangeboten außerhalb dieser
Repository-Quellen.

## Native Reproduktion ohne Ausnahmen

`probe-unmodified-native-duration-checker.py` hat den bestehenden Checker
bytegenau in eine temporäre Spiegelstruktur kopiert. Die tatsächlichen Input-
und CompositionView-Bäume wurden dort über Verzeichnissymlinks gelesen; die
aktive Policy, Qualitätsstatus und Bericht wurden kopiert. Ausschließlich die
temporäre Policy wurde durch den Kandidaten ersetzt.

1. Baseline: `--check --require-reviewed-subject=Biologie` → **Exit 1**, Bericht
   `ok`, genau die fünf offenen Duration-Scope-Zeilen.
2. Kandidat: `--write --require-reviewed-subject=Biologie` → **Exit 0**; der native
   Generator schreibt nur den temporären Kandidatenbericht.
3. Kandidat: `--check --require-reviewed-subject=Biologie` → **Exit 0**, aktueller
   Bericht `ok`, leeres stderr.

Exakte Argumente und echte getrennte stdout-/stderr-Dateien liegen unter
`qa-artifacts/`; der erzeugte Kandidatenbericht bleibt dort. Die Receipt bindet
identische aktive Eingänge vor und nach dem Test. Kein Checkerpatch, keine
Ausnahme, keine abgesenkte Qualitätsgrenze und kein vollständiger Build.

## Policy-Drift und übrige Gates

Die tatsächliche aktuelle `AGENTS.md` wird mit ihrem aktuellen Hash gebunden;
der historische B007-Autorpin `b70ecef…43ec` wird getrennt erhalten. Der komplette
alte→aktuelle Policy-Diff liegt hier nicht vor. Daher wird keine historische
AGENTS-Gleichheit behauptet und keine historische Reviewdatei umgeschrieben.

Native D/P/A/M/V, zentraler strenger Bericht, vollständige GUI-Superset- und
Layer-A-Abschlussprüfungen sind eigenständige Gates. Der inaktive Duration-Test
ändert ihre Zähler nicht. Menschliche Prüfung, Freigabe, Erprobung und Release
werden nicht beansprucht. Private Klassen-, Lernenden-, Session- und Chatdaten
wurden nicht gelesen.

Nächster Schritt: unabhängige Root-/B-Prüfung genau dieser fünf Einträge anhand
der beigefügten Primärquellenbindungen, danach Integration in einem neuen
Nachweis und vollständiger aktueller nativer Duration-Check.

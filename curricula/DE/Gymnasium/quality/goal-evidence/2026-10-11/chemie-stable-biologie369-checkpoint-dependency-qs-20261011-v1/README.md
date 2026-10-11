# Technische QS des stabilen Chemie-/Biologie-Zwischenstands

Diese QS betrifft den bereits integrierten Stand Chemie 212/402 und Biologie
369/395. Mathematik 807/807, Physik 478/478 und Wirtschaftswissenschaften 346/346
bleiben geschützt. Neue Biologie-Kandidaten sind nicht als abgeschlossen gezählt.

## Tatsächlich abgeschlossen

- Der normale Chemie-Atlas wurde nach den vier aktuellen Applicability-Bindungen
  erneut erzeugt. Der normale Freshness-Check und der bestehende
  Source-Atlas-Regressionstest sind erfolgreich. Der BY-Sek-I-Baum enthält jetzt
  98 eindeutige Ziele einschließlich `1351706f-4ea6-56e9-951b-87b24cbcdee8`.
- Die aktuelle veröffentlichte HTML-Zielseite wurde mit dem unveränderten
  vollständigen Renderer/Modell erzeugt und tatsächlich angesehen. Die gleiche
  Seite 14 wurde aus dem fertigen normalen PDF gerastert und tatsächlich
  angesehen. Hauptbild, aktuelle Geltung BY/HE, Vorbedingungen und Fußzeile sind
  vollständig sichtbar. Die PDF-Bytes entsprechen dem Render-Manifest.
- Die gezielte Delta-Abhängigkeit der aktiven Registry und des Atlas ergibt
  keine fehlenden aktiven Eingaben, keine neuen JSON-Parsefehler, keine absoluten
  lokalen Eingabebindungen und keine Symlinks. Bereits indizierte unveränderte
  historische Reviews bleiben bestehende Git-Abhängigkeiten.
- Die eigenen JSON-Artefakte liegen innerhalb der normalen Quality-Grenze des
  unveränderten Schema-Validators. Keine Ausnahme oder Sonderregel wurde ergänzt.

## Für den Commit

`stage-proposal.paths.txt` ist die direkte technische Delta-Abhängigkeit.
`stage-proposal.with-original-closed-families.paths.txt` erhält zusätzlich die
Originale der abgeschlossenen `chemie-b007-*`- und
`biologie-genetic-three-*`-Pakete als Geschichte. Alte Kandidaten erhalten dadurch
keine Freigabe. Die neuen Bio8-, Natur-/Alltags- und Medizin-Kandidaten sind aus
diesem Vorschlag ausgeschlossen. Dieser Agent hat den Gitindex nicht geändert.

41 nicht indizierte Original-PDF-/HTML-Dateien sind ausdrücklich deklarierte
optionale Quellen-Caches; der normale Regressionstest prüft die Reproduktion
ohne diese Caches nur mit indizierten Pflichtdateien. Ein zusätzlich gebundenes
HE-Primär-PDF ist gesondert zu erhalten:

`curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-3312-authored-operationalization-primary-source-author-successor-v3/primary/HE-whole-Stand20250801.original.pdf`

Die Datei hat 505276 Bytes. Ihr SHA und die konkrete Ignore-Regel stehen in
`FINAL.portability-and-published135.technical.actual.json`. Sie ist wissenschaftliche
Originalgeschichte und sollte gezielt mit in den Commit, ohne Quellen- oder
Rechtefreigaben umzudeuten.

Die zwei zunächst auffälligen fehlenden `whole402`-Dateien sind lediglich
`outputPath`-Ziele in inaktiven Compiler-Konfigurationen; die wirklichen normalen
Bundle-Modelle sind vorhanden. Die zwei kurzen `contracts/...`-Pfade bezeichnen
vorhandene Dateien im jeweiligen Review-Bundle. Hier ist keine Korrektur nötig.

## Grenzen

Dies sind technische Bindungs-/Darstellungsprüfungen. Keine neue Chemie-
Fachfreigabe, kein M7-Abschluss, kein physischer Handytest und keine menschliche
Freigabe oder Erprobung werden behauptet. Der zuletzt geprüfte GitHub-main-Head
`9ec9814596f38853dc2d10fcea2f2d99ff1db90f` hat einen terminal erfolgreichen CI-Lauf
`38118492491`; der neue lokale Zwischenstand wurde von diesem Agenten weder
committet noch gepusht. Sein eigener GitHub-Lauf muss nach dem Push verfolgt werden.

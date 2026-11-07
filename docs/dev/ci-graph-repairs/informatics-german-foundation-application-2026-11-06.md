# Angewandte Grundlagenkorrekturen in Informatik und Deutsch

Am 6. November wurden **13 vorgeprüfte Felder** in zwei bestehenden
kanonischen Landschaften geändert: sechs Informatik-Voraussetzungsarrays,
drei Deutsch-Voraussetzungsarrays und vier abgeleitete Deutsch-Applicabilityfelder.
Die [Anwendungsquittung](informatics-german-foundation-application-2026-11-06.json)
bindet die ursprünglichen und angewandten Quelldateien sowie sämtliche
23 tatsächlichen Goal- und 23 atomaren Nachfrageänderungen im vollständigen
21er-Katalog. Andere Fachgebiete ändern ihre Nachfrage nicht.

Informatik erhält den unabhängig geprüften
[Fünferkern](informatics-foundation-prerequisite-review-2026-11-06.md) und die
getrennt geprüfte [DFS-Grundlage](informatics-dfs-foundation-review-2026-11-06.md).
Unnötige Gesamtprüfungen und themenfremde Vorbereitung werden durch konkrete
vorhandene Grundlagen ersetzt. Die vollständige BFS-/DFS-/Kürzeste-Wege-Kompetenz
bleibt als eigenes Ziel unverändert; kein direkter Prüfungslink wird entfernt.

Deutsch ersetzt zwei spätere Themenabschlüsse durch vorhandene E-Grundlagen.
Der [sieben Felder umfassende Nachweis](german-phase-foundation-review-2026-11-06.md)
erhält zugleich die bisherige Vorbereitung der Gesamtaufgabe: Der durch die
Korrektur entfallende Zeugenweg wird durch die frühere direkte Anforderung
ersetzt. Nur zwei anschließend redundante Foundationlinks entfallen.
Die vollständige Vorbereitung der Gesamtaufgabe bleibt exakt gleich. Vier
Applicabilityfelder folgen dem tatsächlichen Compiler; alle 27 verfassten
Targetmengen und sichtbaren Bäume bleiben unverändert.

Der [lesende Replay](verify_informatics_foundations.py) rekonstruiert die
ursprünglichen 21 Quellen aus Git und prüft alle Goal-/Feldguards, die
vollständigen erwarteten Nachfragedeltas und die beiden angewandten Dateien:

```bash
python3 -B docs/dev/ci-graph-repairs/verify_informatics_foundations.py \
  --base-commit e8f97c2b7a93578beef77be729f166f6fd47e206 \
  --include-dfs --german-follow-up --verify-active
```

Der tatsächliche allgemeine Graphvalidator besteht für 593 Landschaften ohne
Phasen-Ausnahme. Deutsch besteht alle zehn strikten Strukturchecks; Informatik
besteht neun und behält 62 offene G17-Befunde. Applicability hat bei beiden
Fächern null Fehler und null Warnungen. Bekannte zyklische Komponenten anderer
Kataloge bleiben offen. Vollständige Meilensteinerzeugung und Remote-CI haben
eigene Ergebnisse; ein lokaler Strukturtest ist keine vollständige Fachabnahme.

Goal-IDs, Kompetenzbeschreibungen, Phasen, Karten, Aufgaben, Rubriken, Coverage,
Mastery und historische Praxisquittungen bleiben gleich. Die vorhandenen
A-/M-Projektionen ändern sich nicht. Praxisfingerprints der geänderten Autoren
ändern sich ehrlich; alte Versuche werden nicht neu etikettiert. Neue Q4-Prüfungen
bleiben wegen überbreiter alter Voraussetzungspfade ein getrenntes, nicht
angewandtes Paket. Prüfungsanerkennung und Einheitenruntime werden nicht implementiert.

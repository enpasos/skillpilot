# Chemie/Biologie: gesicherter Commit-Zwischenstand

Basis-Commit: `693872e8ea8663384281d06f61858b0f8fef332f`.
Die Zielverfolgung bleibt pausiert. Dieses Paket sichert den aktuellen Stand;
es integriert keine weiteren wissenschaftlichen Kandidaten und behauptet
keine menschliche Freigabe, Veröffentlichung oder vollständige grüne CI.

## Aktueller strenger Stand

| Fach | Streng abgeschlossen | Seit Basis-Commit |
| --- | --- | --- |
| Chemie | 80/376 | +22 neue fachliche Abschlüsse |
| Biologie | 37/363 | +2 neue fachliche Abschlüsse |
| Mathematik | 807/807 | geschütztes M7 erhalten |
| Physik | 478/478 | geschütztes M7 erhalten |

Netto +24; keine bloßen Bindungswiederherstellungen. Chemie und Biologie
bleiben M6 / CQR-303 WARN. Maßgeblich ist der unverändert gebundene
[zentrale Bericht](../chemie-redox-one-current-integration-v1/central-one-new-complete.report.json).
Historische Gesamtzahlen und inaktive Kandidaten zählen nicht als Abschluss.

## Tatsächliche Prüfbelege

- [Abschlussbeleg](final-checkpoint-qa.actual.receipt.json): tatsächliche Exits,
  aktueller strenger Stand, unveränderte Mathematik-/Physikdateien und
  Abgrenzung des bestehenden Abhängigkeitsbefunds.
- [Gebündelte Builds und neun Untergrenzen](stable-checkpoint-builds-and-nine-floors.terminal.receipt.json):
  vollständiger Neubau aller vier Lernzielbücher, Publikationsprüfung,
  gesamte Goal-Book-Testpipeline, TypeScript-/Vite-Build und weitere Checks.
  Der damalige Hinweis auf ausstehende Abschlussprüfungen bleibt als
  zeitlicher Snapshot erhalten; der Abschlussbeleg ergänzt ihre tatsächlichen Ergebnisse.
- [Letzte Dokumentationschecks](checks/agent-docs-final-complete/summary.json):
  alle vier Checks Exit 0. Frühere Fehler und Protokolle bleiben getrennt
  in `checks/agent-docs-*` erhalten.
- [Memory-Auswahl und Bildzählung](checks/agent-consistency/summary.json):
  zehn aktive Konfigurationen, erhaltene Prüfgrenzen, 61 unveränderte
  historische Memory-Dateien und native Bildzählparität.
- [Historischer Chemie-Memory-Snapshot](checks/chemistry-historical-snapshot-byte-identity.json):
  bytegleich zum Basis-Commit; separat registriert, nicht als aktueller Nachfolger ausgegeben.
- [Layer-A-Erstlauf](checks/agent-layer-a/summary.json): echte erste Exits,
  einschließlich der anschließend behobenen Inkonsistenzen und des weiterhin offenen Audits.
- [Technischer Chemie-Watch-Abschluss](chemistry-watch-current.terminal.receipt.json)
  mit [erhaltener Baseline](chemistry-evidence-watch-baseline.before.snapshot.json).
  Referenzpflege ist keine zusätzliche fachliche Prüfung.
- [Eingefrorene Kandidaten](three-larger-candidates-frozen.actual.receipt.json):
  150 unveränderte Artefakte der drei letzten Zuständigkeiten; keine aktive Integration.
- [KI-Transparenz des tatsächlichen Builds](ai-transparency-artifact.terminal.stdout): Exit 0.

## Verbleibende Grenze

Der aktive, zum Basis-Commit bytegleiche App-Lockstand hat im nativen Audit
20 bereits bestehende Meldungen: zwölf hohe, sechs mittlere und zwei niedrige.
Ein separater, Git-ignorierter Lockfile-Kandidat hat Audit Exit 0 mit null
Funden, ist aber weder übernommen noch tatsächlich installiert oder gebaut.
Die ausdrückliche Entscheidung zur Erweiterung über den Curriculum-QS-Auftrag
hinaus steht aus. Der grüne Anwendungsbuild belegt ausschließlich den aktiven Lockstand.

Die [vollständige Übergabe](../../../../../../../docs/qa-ci/chemie-biologie-m7-commit-checkpoint-2026-10-05.md)
enthält die Paketfolge, offene Zielreservierungen und fachlichen HOLDs.

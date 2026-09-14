# Physik B058: drei eigenständige Diodenziele

Lokaler Abschluss vom 14. September 2026. Zwei getrennte, profilfreie
Blindrunden bestätigen die drei bereits getrennt formulierten Kompetenzen:
p-n-Sperrschichtmodell, eigener beaufsichtigter Kennlinienversuch und Erklärung
einer vorgegebenen Gleichrichterschaltung. Beide Runden ergeben jeweils
dreimal KEEP. Zieltexte, gute Bilder und vorhandene P-v2-Profilkörper bleiben
unverändert; `create` im profilfreien Input rechtfertigt keine Profilduplikate.

Root hat alle sechs vollständigen Records, beide Laufmanifeste, aktuelle
Input-/Seiten-/Kontextbindungen und die drei vollständigen bestehenden
P-Profile samt Bildbindungsbeleg gelesen. Die begründete Auswahl A/B/A steht
in [synthesis-authoring.json](synthesis-authoring.json); die aktuelle native
Bindung steht in [synthesis-decisions.json](synthesis-decisions.json), die
drei Resolutionen in [resolution-index.json](resolution-index.json).
Synthesefingerprint:
`sha256:1b490715e58d1e4103c50258cedf3fcc0c0d322c24a5f4ba432331d254efb482`.

Die Reviewer haben die drei unveränderten Raster unabhängig tatsächlich
geöffnet und ihre Hashes bestätigt. Die neuen Beschreibungsnachweise
ersetzen weder eine tatsächliche Lernendenleistung noch menschliche Freigabe:
`candidate` / `ai_candidate`, P weiterhin `needs_human_review`, E1/G1.
Insbesondere wird der eigene Kennlinienversuch nicht durch bloße Betrachtung
eines schematischen Diagramms ersetzt. Landesquellenbegrenzungen und
vorhandener Dissens bleiben erhalten. Beide Runden nennen `OpenAI`; exaktes
Modell und Sampling sind nicht offengelegt. Es wird keine Anbieter- oder
Modellvielfalt behauptet.

## Technische Ergebnisablage

Nach der individuellen nativen Validierung wurden ausschließlich Dateinamen
an den unveränderten Campaign-Loader angepasst. Dieser verlangt pro Batch
genau `<batchId>.run.json` und `<batchId>.records.jsonl` in `results/`.
Die ursprünglichen `run.json`, `description-records.jsonl` (A) bzw.
`records.jsonl` (B) wurden dorthin verschoben. Parameterdateien und B-Notizen
liegen nun direkt unter ihrer jeweiligen `round-a/` bzw. `round-b/`, damit
`results/` keine zusätzlichen Artefakte enthält. Alle sieben verschobenen
Dateien sind byteidentisch; keine Record-, Manifest-, Zeit- oder
Samplingangabe wurde geändert.

| Artefakt | Unveränderter SHA-256 |
| --- | --- |
| Runde A Records | `cf63dacff8845d7b475f701332eaa0f242dc2b9cba1da2c8c11d6c50bee7543c` |
| Runde A Laufmanifest | `d0a61c42633129a0d92a261160cdece74eed656dfd89625527f0028fd4884632` |
| Runde B Records | `1e9684e9d79fddfd83fd0c66224d833f869928cdc6f842ae1cc23a82ac39152e` |
| Runde B Laufmanifest | `82ff4e11714aa4042083cb6a2803f727b4d01a215f6e0b228f180df5045d4352` |

## Prüfstand und Pause

Native Batch-, Manifest-, Resolution- und Finalisierungsprüfungen wurden nach
Materialisierung ohne Schreibmodus wiederholt und bestehen. Der zentrale
Fünf-Gate-Check bestätigt **Physik 470/478 (98,3 %)**,
D470/P477/A478/M478/V478, ohne blockierende Probleme. B058 bringt **netto +3**
eigene aktuelle D-Abschlüsse der früheren Split-Kinder. Mathematik bleibt
**436/797 (54,7 %), netto 0**, pausiert. Der B058-Claim ist entfernt; die acht
noch offenen Physikfälle bleiben im In-flight-Ledger.

Der Nutzer hat einen commitfähigen Zwischenstand und anschließende Pause
angeordnet. Es wird kein Folgepaket vorbereitet. Gebündelte Abschlussprüfungen
und Pausenroute stehen im
[aktuellen Checkpoint](../../../../../../../../../docs/qa-ci/physics-resumed-checkpoint-2026-09-14.md).
Die Ergebnisse sind lokal; sie behaupten weder Commit/Push noch neue Remote-CI,
Deployment oder Veröffentlichung.

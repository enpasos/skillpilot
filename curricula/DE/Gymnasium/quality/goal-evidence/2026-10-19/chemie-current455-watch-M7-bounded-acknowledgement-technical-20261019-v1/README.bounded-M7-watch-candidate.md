# Begrenzter technischer Watch-M7-Kandidat

Die originale aktuelle Prüfung ergibt Selbsttest0, Check-Delta1 mit75/0/0.
Dieser additive Kandidat übernimmt genau75 bestehende geänderte Records;
85 unveränderte Records bleiben einschließlich ihrer ursprünglichen Literalbytes
und Zeitfelder erhalten. Keine neuen oder entfernten Pfade; nur updatedAt ändert
sich zusätzlich. Kein capture-baseline und keine Normalaktivierung.

Die Bindungsdatei nennt für jeden Pfad aktuelle rohe Bytes, alten/neuen Watchrecord
und tatsächliche vorhandene Integrations-/CAS-Pointer. Diese Pinprüfung ist keine
neue Fachprüfung. Bestehende begrenzte Quellenurteile, Optionalitätsgrenzen und
Restpflichten bleiben unverändert. M7/455 und alle6/11-Prüfungen stammen aus dem
bytegebundenen vorhandenen Closeout;504 offene Atlas-Scopeentscheidungen und32
ausgelassene Atlasziele werden nicht geschlossen. Der aktuelle SL-Alias ist
d0cf37bcda234955341ea21ffafb85068071dd51a2eb3a2d1b4e54b975913624.

Der unveränderte check_delta()-Funktionskörper ergibt0/0/0 bei ausschließlich
in-memory umgeleitetem Baselinelesen des Kandidaten; das ist kein ausgeführter
normaler CI-Lauf. Manifest/Workflow/Skripte/Tracker/Scope bleiben exakt.
Im Originalvertrag gibt es keine zusätzliche Humanfreigabe für das technische
Baselineformat. Das E18-Vorbild verlangte für seinen Plan eine unabhängige
technische A-Prüfung und Root-Installation. Hier bleibt Root die unabhängige
Kandidatenvergleichs- und Installationsinstanz; dieses Paket aktiviert nichts.

Nach Rootvergleich und frischem Wholefile-/Input-CAS nur Kandidatenbytes als
Normalbaseline installieren. Anschließend Originalrenderer und Wrapper:

```bash
python3 scripts/canonical_chemistry_evidence_watch.py render-status
python3 scripts/canonical_chemistry_evidence_watch.py render-delta
bash scripts/run_canonical_chemistry_evidence_watch.sh
```

Kein neuer fachlicher Review, keine allgemeine Quellenvollständigkeit, keine
Humanfreigabe, keine Lernenden-/Hostannahme, kein Build oder Commit/Push.

# Zwei CQR104-Logs unverändert archivieren: enger Plan

7. November 2026. **Privater nativer Locatorversuch bestanden; noch nichts
angewandt.** Der [Planbeleg](source-identity-cqr104-two-log-archive-plan-2026-11-07.json)
bindet genau zwei Operationen und den tatsächlichen kleinen Reproducer.
Ausgangspunkt bleibt der [rote cb128-Generatorlauf](source-identity-cb128-source-rebase-failure-2026-11-07.md).

Beide Dateien sind unveränderliche Ausführungsbelege des vorhandenen
[CQR104-Receipts](cqr104-current-cqr-2026-11-06.json), keine aktuelle
Runtimekonfiguration. Das Receipt bleibt bytegleich: Produzent Exit 0,
Floorprüfung Exit 1 mit sieben geschützten Fächern unter ihrem Floor.

| Bisheriger Pfad unter `docs/dev/ci-graph-repairs/` | Neues Archiv unter `qa-artifacts/ci-contract-audit/2026-11-06/` | Unveränderter SHA-256 |
| --- | --- | --- |
| `cqr104-current-cqr-2026-11-06/producer.txt` | `cqr104-current-cqr-2026-11-06/producer.txt` | `6cfa6a6670faef00b668fd3e0f9d7459af320db915d4239173439b5d2674101c` |
| `cqr104-current-cqr-2026-11-06/floors.txt` | `cqr104-current-cqr-2026-11-06/floors.txt` | `742c0ce22cedb101a40b34f63f51db42c1c2f40726e141522c85f501921c4099` |

Die alten Pfade werden durch exakt die im JSON angegebenen relativen
Dateisymlinks ersetzt. Es werden weder Zeilen noch IDs, Fehler oder Reviewhashes
bearbeitet. Beide Archive fallen bereits unter die unveränderte historische
`qa-artifacts/`-Regel. Sie bleiben vollständig gebundene Eingaben eines späteren
Quellenbeweises; sie werden keine Outputausnahme.

Der tatsächliche private RAM-Gitversuch bestätigt für beide Logs Dateibytes,
Gitobjekte, Modi und alte Dateilocators. Der unveränderte `GitSnapshot` liefert
unter altem und neuem Pfad dieselben Originalbytes. `matching_paths` findet
genau die beiden Archive. Zyklische, fehlende und nach außen führende Locators
scheitern. Die geteilte Arbeitskopie bleibt während der Probe unverändert.

Eine vollständige Suche im festen cb128-Gitbaum findet die beiden exakten
Loglocators ausschließlich im ursprünglichen CQR104-Receipt. Dessen Pfad- und
Hashfelder müssen nicht geändert werden. Ältere Receipts mit demselben
Produzentenhash binden ihre eigenen historischen Dateien und bleiben ebenfalls
unverändert. Die beiden Plaintextlogs benötigen keine zusätzlichen relativen
Markdownlocators.

Vor der Anwendung sind beide Original-Gitobjekte, Rohhashes, Dateitypen und
Längen sowie die Abwesenheit der Archivziele erneut zu prüfen. Archive erhalten
eigene temporäre Inodes mit `fsync`, Modus 0644 und atomarem Ersatz; die alten
Dateien werden nur durch die zwei freigegebenen internen Symlinks ersetzt.
Danach ist ein eigener tatsächlicher Anwendungsbeleg erforderlich.

Ein roher `git show NEU:ALTER_LOCATOR` liefert anschließend Linktext. Für die
historischen Datei-Bytes dienen `cb128:ALTER_PFAD` oder `NEU:ARCHIVPFAD`;
Dateisystem- und `GitSnapshot`-Lesungen lösen die internen Symlinks auf. Es wird
keine allgemeine GitHub-/MkDocs-Darstellungsabnahme behauptet.

Erst auf einem danach ausdrücklich festgelegten neuen Commit sollen der volle
unveränderte Source-A-Generator und der unabhängige Verifier erneut laufen.
Dieser Plan erzeugt keinen Quellenbeweis, keine Kandidaten-QA und keine A/B-
oder Laufzeitaktivierung. Der [kleine native Belegordner](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/cqr104-two-log-archive-plan)
erhält Code, genaue Suchergebnisse und den tatsächlichen privaten Versuch.

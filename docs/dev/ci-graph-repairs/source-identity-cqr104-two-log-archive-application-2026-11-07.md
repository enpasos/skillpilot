# Zwei CQR104-Logs tatsächlich archiviert

7. November 2026. **Genau zwei bytegleiche Archive und zwei interne relative
Dateilocators sind angewandt; der tatsächliche native Replay besteht.** Der
[Anwendungsbeleg](source-identity-cqr104-two-log-archive-application-2026-11-07.json)
bindet alle Original-, Archiv-, Link- und Inodewerte. Grundlage ist ausschließlich
der freigegebene [Zwei-Datei-Plan](source-identity-cqr104-two-log-archive-plan-2026-11-07.md).

`producer.txt` und `floors.txt` liegen nun unverändert unter
`qa-artifacts/ci-contract-audit/2026-11-06/cqr104-current-cqr-2026-11-06/`.
Ihre bisherigen Pfade unter `docs/dev/ci-graph-repairs/` bleiben über exakt die
geplanten relativen Dateisymlinks lesbar. Es gibt keine weiteren Aliases.
Die neuen Archive erhalten eigene Inodes, Modus 0644 und jeweils einen Link;
Dateidaten und Elternverzeichnisse wurden synchronisiert. Die bisherigen
Dateiinodes wurden nicht zum Schreiben geöffnet.

Beide ursprünglichen cb128-Gitobjekte, Rohhashes und Längen waren vor dem
ersten Schreibschritt exakt geprüft. Die neuen Archivbytes stimmen weiterhin
mit `6cfa6a66…` und `742c0ce2…` überein. Das ursprüngliche CQR104-Receipt bleibt
bytegleich mit SHA-256
`d7493ce576364c7243b4a5f8a6775021d89201bc43c741cec32a0636da8fcae0`.
Produzent Exit 0, Floorprüfung Exit 1 und alle sieben Floorverletzungen bleiben
vollständig erhalten.

Der [lesende Reproducer](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/docs/dev/ci-graph-repairs/verify_source_identity_cqr104_archive_application.py)
prüft die tatsächlichen angewandten Bytes und Linktexte. In einem kleinen
privaten RAM-Gitverzeichnis liefert der unveränderte `GitSnapshot` jeweils
unter altem Locator und neuem Archivpfad identische Originalbytes. Die
Git-Dateimodi und alle vier Blobobjekte stimmen mit dem Plan überein. Dieser
Replay ist tatsächlich mit Exit 0 beendet; das
[separate Messpaket](https://github.com/enpasos/skillpilot/tree/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/cqr104-two-log-archive-application)
enthält die Ergebnisse.

Schema, Registry, Kernel, Source-A-Verifier, Quellen, aktive QA, Policy und
Lernerzustände bleiben unverändert. Der rote cb128-Generatorlauf und sein
unveränderter Plan bleiben historische eigene Nachweise. Ein neuer gesamter
Quellenbeweis wurde noch nicht gestartet: Dafür muss Root nach Prüfung einen
neuen festen Commit benennen. Diese Archivierung ist keine Kandidaten-QA und
keine A/B- oder Laufzeitaktivierung.

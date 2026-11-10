# Abschluss der lokalen Audit-Reste vom 6. und 7. November 2026

Am 10. November 2026 beauftragte der Product Owner, die getrennte
Dokumentationslieferung zu sichern und keine ungeklärten lokalen Altdateien
zurückzulassen. Dieses Paket schließt die dazu geprüften Audit-Reste ab.
Es eröffnet keinen neuen Auditauftrag.

## Vollständige Zuordnung

Die Bestandsaufnahme erfasste 75 ungetrackte Dateien und zusätzlich 39
ignorierte Logs beziehungsweise Python-Caches. Jede der 114 Dateien ist im
[Manifest](manifest.json) mit ursprünglichem Pfad, Größe, SHA-256 und
Disposition erfasst.

| Bestand | Dateien | Behandlung |
| --- | ---: | --- |
| Historische Census, Reviewrecord-Indizes, Reproduktionsskripte, Teilbefunde, Nachfolgerpaket, Zurückweisung und Logs einschließlich roter Versuche | 103 | Im [historischen Archiv](historical-evidence.tar.gz) erhalten; 2.660.893 Bytes vor Kompression. |
| Drei historische Discovery-Suchindexpakete | 9 | Bewusst kein Main-Nutzbestand. Im vollständig geprüften lokalen Sicherheitssnapshot erhalten; aus dem Arbeitsbaum entfernt. |
| Regenerierbare Python-Caches | 2 | Nach Sicherung aus dem Arbeitsbaum entfernt. |

Die neun Indexdateien stammen aus den drei Ordnern
`visualization-five-ledger-original-evidence-census`,
`visualization-five-ledger-original-evidence-census-all-ids` und
`visualization-five-ledger-original-evidence-census-full`. Sie enthalten
unterschiedliche historische Suchstufen, keine geprüften Freigaben. Ihre
49.242.780 Bytes werden nicht als zusätzliche Produkt- oder QA-Implementierung
übernommen. Zwei dieser Dateien waren Symlinks; nur die lokalen Links wurden
entfernt, ihre externen Ziele blieben erhalten.

## Aussagegrenze

Das Archiv bewahrt historische Arbeit, keine neue Qualitätsabnahme.
Insbesondere ist der Namespace-Datenkonsistenznachfolger keine geprüfte
Produktimplementierung: Synthetische Unitfälle ersetzen seinen nicht
ausgeführten vollständigen nativen Nachweis nicht. Die Skripte werden weder
in die aktuelle CI eingebaut noch als aktive Folgearbeit geführt.

Ursprüngliche Paketmanifeste und deren gebundene Bytes bleiben unverändert.
Das Tar enthält ihre ursprünglichen relativen Pfade. Eine Untersuchung erfolgt
bei Bedarf in einem separaten temporären Verzeichnis, nicht durch erneutes
Ablegen der historischen Dateien im Arbeitsbaum. Der SHA-256 des Tar und
sämtliche enthaltenen Datei-Hashes stehen im Manifest.

## Sicherung und Bereinigung

Vor der Bereinigung wurden alle 114 Dateien vollständig gesichert und die
Archivbytes einzeln mit den Originalen verglichen. Der lokale
Sicherheitssnapshot liegt unter
`/mnt/e/skillpilot-local-archive-20261110/ci-audit-before-cleanup/`;
sein Hash ist ebenfalls im Manifest erfasst. Er wird für das Lesen des
hier enthaltenen Main-Archivs nicht benötigt.

Vor dem Entfernen wurden die Originalhashes erneut geprüft. Entfernt wurden
ausschließlich die im Manifest genannten ungetrackten beziehungsweise
ignorierten Dateien. Bereits getrackte QA-Dateien bleiben erhalten. Der
Cleanup-Status im Manifest hält das tatsächliche Ergebnis fest.

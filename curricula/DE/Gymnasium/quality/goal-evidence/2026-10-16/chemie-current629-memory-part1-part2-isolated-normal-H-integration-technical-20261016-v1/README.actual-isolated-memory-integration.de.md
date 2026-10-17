# Chemie: tatsächliche isolierte Memory-Integration

PART1 und PART2 sind im bestehenden isolierten H tatsächlich integriert. Die wissenschaftliche Autorität stammt aus den getrennt eingefrorenen unabhängigen Entscheidungen; diese technische Integration erzeugt keine neue fachliche Freigabe.

## Tatsächlicher Stand

- Canonical: 629 Knoten; die vollständigen 435 gewöhnlichen Zielkörper bleiben exakt erhalten.
- Kinds: die bisherigen 593 Entscheidungen unverändert, zusätzlich 36 unabhängig gestützte Memoryentscheidungen mit `reviewed-current-pilot-memory`; alle 629 aktuellen Stock-Fingerprints und der echte geschlossene Stock-Schema-Parser bestehen.
- Views: alle 47 ausgewählten vollständigen Ansichten in H erhalten. Die 45 vorhandenen Alias-Pfade werden mittels Phase1-`selectedSha256` übernommen. Zwei zuvor aliaslose Erwerbspiloten haben ausschließlich in H konkrete Kompositionsdateien; fünf reine Sourcebook-Dateien bleiben getrennte H-Inputkopien. Daraus folgt keine neue veröffentlichte Kurspflicht.
- Memory: 435 aktuelle Zeilen, davon 65 `memory_required` und 370 `no_memory_needed`; 57 Memoryknoten und 77 eindeutige Karten in sieben Decks. Die 43 neuen Referenzbindungen sind ausdrücklich mit dem eigenen unabhängigen FIRST verbunden; 392 alte Zeilen bleiben bytegetreu.
- Der geprüfte QA-Rollenpatch liegt als eigene physische H-Datei vor. Die alte Datei ist privat gesichert; kein gemeinsames Inode wurde überschrieben.

## Normaler Abschlusscheck

Der unveränderte normale Memory-CLI wurde genau einmal im isolierten H mit normalen Canonical-/M-/Karten-/Viewpfaden ausgeführt: **Exit 0**, rund **0,46 Sekunden**. Er prüfte alle 435 gewöhnlichen Ziele und 39 Erwerbsansichten mit 1.447 sichtbaren positiven Memory-Zielkontexten. Fehlende, veraltete und obsolete Ziel- oder Kartenrecords sowie Sichtbarkeitslücken: jeweils null.

Die Stock-Ausgabe nennt 608 primäre Kartenzeilen, weil dieselben Decks bei mehreren Memoryknoten erneut gelesen werden. Dies sind Lesevorkommen; die unveränderten sieben Decks und der Ledger enthalten **77 eindeutige Karten**. Der bereits getrennte spezifische Kartenbindungscheck bestätigt null notwendige Kartenlücken; die acht reinen QS-/Sourcebook-Diagnosen bleiben ausdrücklich außerhalb des Erwerbsnachweises.

Alle Schreibvorgänge sind endlich dokumentiert, verwenden H-eigene abgetrennte Parents und erzeugen nach UNLINK ein neues reguläres eigenes Inode. Die 13 Sourceinputs, 14 Source/Public-Deckdateien, QA458 sowie sämtliche aktiven R-Normal- und historischen Pfade bleiben unverändert. Die neue H-Reportdatei liegt ebenfalls unter einem tatsächlich H-eigenen Parent.

Dies ist der Memory-Check des isolierten Integrationsstandes. Central, CQR-303, vollständige Builds, GitHub-CI und menschliche Release-Gates werden damit nicht als bestanden behauptet.

## Replay

1. `prepare-stock-kinds629-and-normal-H-M-config.ts`: aktuelle Phase1-Pins, neue Kinds und Normal-H-Config vorbereiten.
2. `materialize-contained-normal-H-memory629.py --ready-h-native17-finished`: nur nach tatsächlichem READY und auf der genauen Phase1-Basis; Preflight/CAS und sichere physische H-Materialisierung.
3. `run-once-actual-normal-H-memory-check.py`: genau einen normalen H-CLI-Aufruf protokollieren; bestehendes Execution-Receipt verhindert versehentliche Wiederholung.

Didaktische Urteile bleiben CC-BY-4.0. Dieses technische Paket ist Apache-2.0; bestehende Quellenrechte und die getrennten wissenschaftlichen Nachweise bleiben unverändert.

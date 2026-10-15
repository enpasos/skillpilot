# Native16 v2 – finale PNG, rein technische Vorbereitung

Finaler Canonical `52e199c13…`, Semantic `597c71f9…`;16 unveränderte Zieltexte,16 Bilder und18 tatsächlich betrachtete PDF-Seiten. Die neue Pourbaix-Grafik und die finale Mechanismus138-PNG sind enthalten. Das ursprüngliche Native16-v1-Paket einschließlich seines ganzen endlichen Inventars ist bytegleich erhalten.

`prepare` und `check` des unveränderten Stock-Materializers liefen je einmal erfolgreich ohne `--write` (12,307s /0,913s). Beide Reviewrunden sind blank. Kein D/P/A/M/V-Votum wurde erstellt. Die frühere echte Pourbaix-V1-Stimme wird nur unverändert transportiert.

## Wissenschaftliche Blindinputs

`INPUTS.blind-native16-whole-scientific-materials.selector.json` bindet ausschließlich native Inputs und ganze aktuelle wissenschaftliche Körper:32 DE/EN-Fälle,16 unbegutachtete E0/G0-Profile, ganze Ziel-/Prereq-/Elternobjekte, rohe Quellzellen, tatsächliche ganze Partnerkompetenzen,87 Passagen,24 Primärdateien und16 tatsächliche Rasterbilder. Keine Autor-FIRST, Bewertungsdossiers, V-Urteile oder alten D-Dateien werden als wissenschaftliche Blindinputs selektiert. Eingeschlossene reine Materialkörper und strukturelle QA-Metadaten sind keine wissenschaftlichen Urteile.

Alle16 fachlichen Profilkörper und32 Fälle sind bytegleich zur v1 erhalten. Nur Pourbaixs `reviewInputFingerprint` ist durch `buildPositiveGoalEvidenceCandidateRecords` aus dem unveränderten Stock-Materializer neu berechnet. Alle16 Profile bestehen die unveränderte Stock-Fingerprint-/Semantikprüfung und bleiben `ai_candidate`, `needs_human_review`, E0/G0, ohne Reviewruns. Die alte Autoren-Metadatennotiz über eine Pourbaix-Bildlücke ist eingefrorene Herkunft und wird in der Blindleseanweisung ausdrücklich zeitlich eingeordnet.

## Exakte QA und kleiner Host

Normale QA438 =437 unveränderte ganze Zeilen plus der vorhandene genuine Pourbaix-V1 an Stelle des alten fehlenden Platzhalters. Die bereits erzeugte QA439 bleibt unverändert als Assemble-History:438 alte Zeilen plus V1. Diese History ist kein normaler QA-Input, weil der unveränderte Stock doppelte goalId ablehnt. Es gab keinen nativen Stockfehlversuch; nur eine frühe Setup-Assertion deckte den vorhandenen missing-Platzhalter auf. Die Mechanismus138-Stimme bleibt exakt erhalten.

Die Map baut einen privaten sparsamen tmp-Host mit32 physisch unveränderten Stockmodulen (31 native Module plus Rohprofil-Materializer),51 physischen Datenaliasen,16 physischen Publicbildern und zusätzlich einer physischen Pourbaix-Kanonicalkopie; alle anderen Rasterreferenzen lesen exakte vorhandene Bytes. Keine Vollrepo- oder Bildbaumkopie. Die tatsächliche Größe und Dateizahl stehen in `checks/HOST.actual-sparse-sixteen.json` und bleiben unter80MiB.

`INPUTS.final-native16-current422.physical-selector.json` und `FILES.finite-native16-technical.seal.json` bilden die endliche technische Übergabe. `scripts/rebuild_native16_sparse_host.py` kann ausschließlich den kleinen Host in einem neuen tmp-Pfad reproduzieren und startet keine Native-/Central-Runs. Keine aktive Registry, Ledger, Runtime oder Gitwrites. Keine neue wissenschaftliche, menschliche oder M7-Freigabe. STOP; Root startet die neuen unabhängigen D16-Reviewer.

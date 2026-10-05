# NI Biologie: konkreter Weg zur aktuellen Quellenintegration

5. Oktober 2026. Dieses Paket ist eine **inaktive, gezielte Integrationsvorbereitung**. Aktive Dateien, historische Originale, M6-Floor-Policy, D/P/A/M/V und menschliche Entscheidungen werden nicht geschrieben. Die Vorbereitung umfasst genau die drei neuen NI-Atome `359e6313`, `0263fb84` und `36d3bf01` aus `staged/ni-three-targeted-root-preparation-v1/`; keine gehaltene Q1-Einheit wird übernommen.

## Tatsächlicher aktueller Zustand und Konsequenz

Der Source-Landscape-Schlüssel ist `0b27a054-e81e-5423-aa71-d3d8d9d8f0db`. Die Registry verwendet **`entries[].landscapeId`**, nicht `sourceLandscapeId`. Ihr aktueller `sourcePath` und `archiveSourcePath` verweisen auf die amtliche PDF. Die Extraktion liegt unter:

`curricula/DE/Gymnasium/input/NI/lower-secondary/source-extraction/DE_NI_BIOLOGIE_SEKI_KC2015.source-extraction.json`

Der Statusgenerator liest alle `*.source-extraction.json` unter `input/` und schreibt Ergebnisse mittels `Map.set(sourceLandscapeId, ...)`. Eine zweite solche Datei mit derselben ID im Eingabebaum wäre mehrdeutig; ein Registry-Pointer beseitigt diese Mehrdeutigkeit nicht. Der neue aktuelle Dateiname wird deshalb erst nach der bytegleichen Archivierung und Entfernung des alten gescannten Pfades aktiviert.

Zwei NI-Reviewdateien stehen aktuell im aktiven Mappingbaum: der Basisreview und `m7-e3-recombination-20261001-v2`. Der Statusgenerator liest sämtliche JSON-Dateien unter `curricula/DE`, deren Pfad `/mapping/` enthält; der Quellenatlas verwendet zusätzlich seine explizite `mappingPaths`-Liste. Beide alten Mappingstände enthalten dieselben 348 Kanten; lediglich die Entscheidung zu FW6-008 unterscheidet sich. Ein zusätzliches aktuelles Review würde entfernte Altzuordnungen wieder einsammeln. Beide alten Dateien müssen deshalb bytegleich in `quality/source-mapping-history/.../before-reviews/` erhalten werden und aus dem aktiven Mappingbaum herausgehen. Der Nachfolger basiert auf dem aktuellen V2-Review und erhält dessen 118 unbetroffene Entscheidungsgruppen vollständig.

Die tatsächlich vom Generator gelesenen `landscapes[]`-Arrays in `source-goal-membership-registry.json` und `source-goal-closure-registry.json` enthalten **keinen NI-Eintrag**. Bei vorhandener aktueller Extraktion verwendet der Generator deren Source-IDs als Mitgliedschaft und jeden Source-Atom direkt als atomaren Quellenbestand. Neue kanonische Ziel-IDs gehören in den aktuellen semantischen Ledger; sie sind keine Source-IDs. Die optionale Inventardatei dieses Pakets enthält deshalb ausschließlich die 123 erhaltenen Quellen-IDs und Selbstabschlüsse dieser Quellenatome. Diese Daten schließen kein M7-Ziel.

## Fünf Quellenzellen, drei Kompetenzen und eine Stilllegung

Die vorhandenen amtlichen Seitenbilder S. 87, 88 und 89 wurden tatsächlich gelesen; die amtliche PDF wurde zusätzlich live über [NIBIS](https://cuvo.nibis.de/index.php?p=download&upload=18) geöffnet. Eine aktuelle Bytegleichheit des Live-Downloads mit dem vorhandenen PDF wird nicht behauptet. Der lokale PDF-Hash und die vorhandenen unabhängigen Quellennachweise stehen in `primary-source.selected-inspection.receipt.json`; neue vollständige PDF-Textauszüge oder Seitenbilder werden hier nicht kopiert.

| Aktuelle Quellenzellen | Tatsächliche Lage und Operator | Vorbereitung |
|---|---|---|
| FW7-001 + FW7-002 | S. 89, FW7.1, Ende Jg. 6; `beschreiben` + `erläutern` | beide Teilnachweise auf `359e6313`; observable innerartliche/generationale ungerichtete Variation, keine genetische Ursachenroutine |
| FW6-010 + FW6-011 | S. 88, FW6.3 **Ausprägung der genetischen Information**, zusätzlich Ende Jg. 10; beide `beschreiben` | beide Teilnachweise auf `0263fb84`; Gen/Genprodukt/Merkmal im einfachen Modell ohne Molekulargenetik |
| FW6-004 | S. 87, FW6.1, zusätzlich Ende Jg. 10; `begründen` | echte Erbgleichheitsanforderung erhalten; bestehendes `1d2b1038` bleibt prozeduraler Teilnachweis, neues `36d3bf01` trägt die modellgebundene Kopienverteilungsbegründung |
| FW6-003 | synthetischer Replikationsatom aus der Einleitung statt Tabellenkompetenz | nur aus dem aktuellen Quellenbestand und seinen eigenen Mappings/Entscheidungen entfernen; historisch samt originalem Wortlaut erhalten |

Die Wortlautkorrekturen sind einzeln vor/nach festgehalten. Die unzutreffende Altparaphrase bei FW6-004 wird nicht als wörtlicher Tabellenbeleg weitergegeben. Bei FW7-002 heißt der tatsächliche Operator `erläutern`. Das Quellenkurslabel `GK_LK` wird als bestehendes technisches Metadatum erhalten; daraus folgt keine echte Sek-I-Kursdifferenzierung. Die Jahrgangsgrenzen stammen aus den sichtbaren Tabellenspalten, nicht aus Kurslabels oder fehlenden Phasenwerten.

Der exakte dreiatomige Nachfolger enthält **123 Quellen-IDs, 334 Mappingkanten und 135 verschiedene direkt gemappte kanonische IDs**. Die 134-Zahl der älteren Paket-README beschreibt einen anderen, sechseinheitigen Teilstand.

## Konkrete versionierte Adoptionseinheiten

`current-state.inventory.json` bindet alle Vorwerte und den Archivplan. Die vorgesehenen aktuellen Nachfolger sind:

```text
curricula/DE/Gymnasium/input/NI/lower-secondary/source-extraction/DE_NI_BIOLOGIE_SEKI_KC2015.current-three-20261005-v1.source-extraction.json
curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_biology_lower_secondary_source_extraction_to_canonical_biology.m7-three-current-20261005-v1.review.json
```

Die exakten inaktiven Inhalte stehen in `versioned-replacements/`. Sie sind **keine fertigen fachlichen Source-QA-Abschlüsse**. `MAPPING-2` und `MAPPING-3` verwenden den tatsächlich vom Parser akzeptierten Zustand `blocked`, konkrete Abhängigkeiten und einen offenen aktuellen Adoptionscheck. Der bestehende Materialisierer setzt dort `pending`; der aktuelle Normalizer akzeptiert nur `complete`, `incomplete` und `blocked` und würde `pending`-Schritte vollständig verwerfen. Diese Metadatenkorrektur ist für einen wahrheitsgemäßen Nachfolger notwendig. Nach der tatsächlichen gezielten Adoption müssen die strukturellen und fachlichen Einzelchecks belegt werden; nicht alle Checks pauschal auf grün setzen.

Historische Extraktion und beide Reviews werden bytegleich unter `curricula/DE/Gymnasium/quality/source-mapping-history/biologie-ni-three-current-20261005-v1/` bewahrt. Dort stehen keine `/mapping/`-Pfadsegmente und die Extraktion liegt außerhalb des `input/`-Scans; die `.snapshot`-Endung macht den historischen Status zusätzlich explizit. Die amtliche PDF und ihre URL bleiben erhalten. Der genaue Registry-Eintrag in `source-registry-entry.exact.delta.json` bindet `sourcePath` an den neuen strukturierten Current-Stand und `archiveSourcePath` an den originalen historischen Extraktionssnapshot. Das ist die vorhandene Registry-Konvention; es wird kein neuer Runtime-Mechanismus eingeführt.

`mapping-six-groups.delta.json` stellt nur die fünf geänderten aktuellen Zellen und die eine entfernte Gruppe dar. `source-five-cells-and-one-retirement.delta.json` enthält ihre Vor-/Nachwerte. Die übrigen 118 Quellenrecords und Mappingentscheidungsgruppen bleiben unverändert. Replikationsziel `e70`, Mitose/Meiose-Ziel `1d`, übrige NI-Zuordnungen sowie alle anderen Landesquellen werden nicht fachlich neu freigegeben oder global entfernt.

Der Quellenatlas benötigt die genaue Ablösung seines NI-`mappingPaths`-Eintrags und `expectedCurricularAtomicGoalCount: 363 → 366`. Die betreffenden beiden Felder stehen in `source-atlas.inputs.exact-fields.delta.json`; anhand des alten sechsfachen Source-Views dürfen keine Zielmengen pauschal übernommen werden. Der Quellenatlas muss nach den aktuellen Bindungen neu erzeugt werden.

## Aktuelle kanonische Mitgliedschaft und geschützte M6-Gates

Die aktuelle semantische Registry enthält 441 Datensätze und 363 `curricularAtomic`-Ziele. Die drei neuen IDs fehlen darin. Zusätzlich ändern sich `contains` bei den vorhandenen Eltern `b530a382` und `b4176012`, wodurch deren aktuelle Fingerprints nach dem tatsächlichen Contract erneuert werden müssen. Die semantischen Prüfeinheiten stehen in `canonical-current-membership.and-kind-review.units.json`; die Repositoryfunktion `fingerprintSemanticKindSourceGoal` liefert die fünf genauen aktuellen Fingerprints in `native-membership-and-fingerprint.check.receipt.json`. Die Funktion erzeugt keine inhaltliche Freigabe. Der Quellenatlas verlangt einen autoritativen, aktuellen Datensatz für **jedes** kanonische Ziel und eine exakt passende Gesamtkardinalität.

Root kann die tatsächlichen semantischen Entscheidungen gezielt treffen und die drei ordentlichen Atome prüfen; die eigenen atomaren und Memoryentscheidungen müssen ebenfalls gegen die aktuellen Inhalte geschrieben werden. Bestehende gültige Karten und SRS-Entscheidungen bleiben erhalten. `CQR-301` und `CQR-302` müssen aktuell vollständig sein, bevor Biologie als erhaltenes M6 gilt. Die geschützte M6-Policy bleibt unverändert. M5 verlangt außerdem die aktuellen Graph-/Applicability-/Quellenregeln, konfigurierte Route/Examregeln, `CQR-401` und `CQR-501`.

Der aktuelle Biologie-Routecheck prüft nur `canonical-biology-sek2`; die drei NI-Atome sind SekI. Keine aktuelle Jahrgangsfrontier oder Sek-I-Autonomieabdeckung wird deshalb allein aus einem grünen M6-Dashboard abgeleitet. Der vorliegende Drei-Atom-Kandidat besitzt noch keine direkten Assessmentnachfolger. Eine echte jahrgangsbezogene Route und ihre Assessmentabdeckung bleiben separat zu belegen. Eine bloße Aufnahme neuer IDs in die Source-Closure-Registry oder in einen Prüfungs-Coverage-Array erfüllt diese Anforderung nicht.

## Nachprüfbare nächste Schritte und Befehle

Zunächst die vorbereiteten Dateien und vorhandenen unabhängigen aktuellen Quellen-/D-Belege fachlich für genau diese drei Einheiten prüfen. Danach zusammenhängend: additive kanonische Einheiten übernehmen; die drei historischen Source-/Reviewdateien bytegleich archivieren; genau einen aktuellen Extraktions-/Mappingnachfolger schreiben; Registry und Quellenatlas-Konfiguration binden; die drei aktuellen semantischen und A/M-Entscheidungen sowie die zwei geänderten Elternbindungen herstellen. Das Paket führt keine dieser aktiven Schreiboperationen aus.

Die hier autorisierte reine Vorbereitung ist aus der Repositorywurzel reproduzierbar:

```bash
python3 curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-current-source-integration-route-v1/prepare_route.py
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-current-source-integration-route-v1/check_native_membership.mts
```

Nach der tatsächlichen aktuellen Adoption sind dies die vorhandenen operativen Entry-Points; Statusgenerator und Source-Atlas-Build gehören Root und dürfen während paralleler Integrationen erst am stabilen Stand laufen:

```bash
npm --prefix app run check:source-landscape-registry
app/node_modules/.bin/tsx app/scripts/buildGoalBookSourceAtlasInputs.ts --config app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json
app/node_modules/.bin/tsx app/scripts/buildGoalBookSourceAtlasInputs.ts --config app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json --check
npm --prefix app run quality:semantic-atomicity:check -- --config=curricula/DE/Gymnasium/quality/semantic-atomicity/biologie-q1-tests-therapy-current-20261004-v1/canonical-biology-full.config.json
npm --prefix app run quality:memory-card-review:check -- --config=curricula/DE/Gymnasium/quality/memory-card-review/biologie-q1-tests-therapy-current-20261004-v1/canonical-biology-full.config.json
npm --prefix app run quality:curriculum-status
npm --prefix app run check:curriculum-maturity-floors
npm --prefix app run quality:curriculum-status:check
```

Die `--config=<repository-relative path>`-Syntax wurde in beiden tatsächlichen CLIs überprüft. Die obigen beiden QA-Befehle zeigen die vorhandenen aktuellen Configpfade. Wenn Root für die drei neuen Ziele neue Config-/Ledgernachfolger schreibt, müssen genau deren neue Pfade im Befehl verwendet werden; geprüfte historische Ledgers dürfen nicht überschrieben werden.

Die Vorbereitung wurde mit dem Python-Skript und beiden tatsächlichen Repositoryhelfern geprüft. Der aktuelle reine Registrycheck bestand für 302 Einträge; der reine Floorcheck bestand für die neun geschützten Curricula **im bereits vorhandenen Statusartefakt**. Der zentrale Statusgenerator wurde hier nicht ausgeführt; diese beiden aktuellen Checks sind keine Prüfung des vorgeschlagenen integrierten Gesamtstands. Sechs aktive Source-/Mapping-/Provenance-Dateien blieben nachweislich bytegleich.

Aktuelle Buch-/PDF-/Kontextbindungen, zwei unabhängige D-Runden vor P sowie aktuelle P/A/M/V folgen erst am integrierten Stand. Quelleninventar- und Fingerprintchecks schließen sie nicht. **Strenger Nettozuwachs dieses Quellenpakets: 0; neue fachliche M7-Abschlüsse: 0; menschliche Freigaben: 0.**

Eigene fachliche Quellen-/Mapping-/Zielvorschläge: CC-BY-4.0. Skripte und Entwicklerdokumentation: Apache-2.0. Amtliche Quellen behalten ihre ursprünglichen Rechte; vorhandene Quellenprovenienz ist keine Lizenz- oder menschliche Freigabe.

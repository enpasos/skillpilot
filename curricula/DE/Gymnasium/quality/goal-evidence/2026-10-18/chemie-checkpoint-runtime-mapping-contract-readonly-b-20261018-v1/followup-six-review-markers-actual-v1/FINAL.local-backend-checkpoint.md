# Lokaler Backend-Checkpoint

**18.10.2026, 11:40:33 UTC: beide vollständigen Testklassen bestanden.**

| Klasse | Tests | Fehler | Übersprungen |
| --- | ---: | ---: | ---: |
| `GoalMappingRepositoryFixtureTest` | 87 | 0 | 0 |
| `LearnerServiceCanonicalProjectionTest` | 58 | 0 | 0 |
| Gesamt | **145** | **0** | **0** |

Gradle-Exit **0**. Die Testnamensmengen sind mit dem ersten vollständigen Lauf identisch; keine Methoden oder Klassen wurden aus dem Gate genommen. Die tatsächlichen Ergebnisse, XML-Pins, Zeiten und Log-Pins stehen in `BACKEND.final145.actual-result.json`. Logs: `tmp/chemie450-checkpoint-backend-targeted.after-alias-fix.final-header-run.*`.

## Umgesetzt und geprüft

- Genau 61 zusätzliche konfliktverursachende `partial`-Runtimezeilen aus 18 Dateien entfernt; alle 52 bestehenden `exact`-Einträge roh byteidentisch erhalten.
- Fehlplatzierte neue `decisions`-Marker und doppelte C7-Metadaten aus HH sowie den sechs nachgewiesenen weiteren Runtimecarriern entfernt. Die vollständigen entfernten Blöcke bleiben in additiven Audits erhalten. Sämtliche Mappingarray-/Eintragbytes und sonstigen Metadaten wurden dabei bewahrt; die eigentlichen Quellenreview-Ledger blieben unverändert.
- Alle 119 aktuellen Runtime-Mappingdateien auf Review-Marker geprüft: keine unerwünschten Marker und keine `exact`-Konflikte verbleiben.
- Nur reine Count-Konstanten in den 29 tatsächlich fehlgeschlagenen Chemie-Fixturemethoden an den belegten Iststand angeglichen. Vor dem letzten Lauf alle 83 betroffenen Total-/Exact-/Partial-Countassertions statisch gegen die Mappingdateien geprüft. Konkrete Kanten-, Identitäts-, Typ- und Retired-Assertions bleiben unverändert.
- Den pH-Projektionstest an die aktuelle `requires`-Struktur und den bestehenden Legacy-E2-Kompatibilitätsmodus angepasst: negativer Masterybeleg ohne Legacy-ACID_BASE; danach positive Säure/Base-Projektion bei weiterhin unmastered pH und Arrhenius, beide als zulässige Frontierziele. Canonical-`requires`, Runtimecode und Mappings wurden dafür nicht verändert.

Die abschließenden Bytechecks bestätigen den stabilen Endstand aller 20 insgesamt berührten Runtime-Dateien sowie unveränderte 24 berührte Quellenreview-Carrier und weitere gepinnte Quellen-/Vertragsdateien. Die früheren fehlgeschlagenen Läufe und alle ursprünglichen Seals bleiben erhalten.

## Präzisierung zur Quellenentscheidung

Exakte Gleichheit ist für die sechs C7-Metadatenobjekte belegt. Sie ist **keine** Aussage über die Gleichheit ganzer Runtime- und Quellenreview-Decisions: fünf entfernte Runtime-Decisionfeldmengen sind identische Teilmengen der Quellenentscheidung mit deren zusätzlichen Reviewmetadaten; SH enthält eine kumulativ erweiterte Quellenentscheidung mit abweichendem `sourceSpan`, weiteren Ziel-IDs und erweitertem Rationale. Der vollständige entfernte SH-Block ist auditbewahrt. `CLARIFICATION.runtime-decision-vs-cumulative-source-ledger.actual.json` hält diese Grenze explizit fest.

Dies sind lokale, gezielte Backendtests und technische Byte-/Vertragschecks. Keine neue Scienceentscheidung, kein D-/WholeSubject-/M7-Abschluss, keine menschliche Freigabe, kein Commit und keine externen Writes werden behauptet. Root prüft die unabhängigen zentralen Gates separat.

# Mathematik: erste Lerneinheit und Bindungspflege — 12. November 2026

Stand: 12. November 2026. Lokaler Prüfstatus: **bestanden**, abgesehen von den
genannten Umgebungsausnahmen (fehlende Werkzeuge `bwrap` und `strace`) und
einem vorbestehenden Digestpin. Ausgangspunkt ist `a927368b30` auf
`feat/learning-unit-contract-validator`.

## Änderung

Die kanonische Mathematik erhält am Ende von `programUnits` die Lerneinheit
`math-dot-product-projection` (Revision `2026-11-12-v1`) und am Ende von
`goalPlacements` zwei `own`-Platzierungen für
`3016ec37-1c2e-47db-83f5-e767923bc97e` und
`e98672c6-871a-5d0b-889c-5afc51040f0d`. Es gibt keine `coverageReviews`, weil
das
[Review vom 12. November](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/learning-units/math-dot-product-projection-2026-11-12.md)
R2 verneint, und kein `learningUnitCoverage`.

## Deltanachweis

Raw-SHA256 `664b6d15…` → `bc626cbc4e2c6d5da177fb4e421a91a208cb7ffc5e4699384716c0717ecc25b3`,
3.672.376 → 3.673.574 Byte. Die Einfügung ist rein textuell: zwei Hunks,
19 eingefügte Zeilen, keine gelöschte Zeile. Alle 1.252 Zielobjekte sind
bytegleich, ebenso der gesamte Text ab `"goals"` (3.589.640 Byte). Die übrigen
14 Dokumentfelder sind unverändert; `programUnits` wächst von 14 auf 15 und
`goalPlacements` von 303 auf 305, jeweils nur am Ende. Die Datei bleibt in der
Repository-Serialisierung, und ohne ihre Einheitenschicht ist sie bytegleich
zur alten Datei.

`validate:learning-units` meldet 2 von 978 atomaren Zielen mit Einheit, die
Einheit gültig, fehlenden R2-Nachweis für ein Ziel und keinen Befund;
`validate:learning-units:offered` prüft 190 Mitgliedschaftsklassen ohne Befund.

## Entscheidung: Nachweise binden die Landschaft ohne Einheitenschicht

Ein erster Versuch am selben Tag zeigte, dass die Nachweiskette der
Voraussetzungsreduktion (Register V6 bis V8) den Fingerabdruck der ganzen
Fachdatei bindet: Mit der Einheit galt der Nachweis nicht mehr, fünf Fächer
fielen von M7 auf M6, und Lernzielbücher sowie Release-Modell ließen sich nicht
mehr bauen. Dem Product Owner wurde daraufhin empfohlen, dass Nachweise über
Ziele die Landschaft ohne ihre Einheitenschicht binden: ohne `programUnits` der
Art `learningUnit`, ohne `goalPlacements` mit `own` oder zu einer Lerneinheit
und ohne `learningUnitCoverage`. Er hat am selben Tag um Fortsetzung gebeten;
so ist es umgesetzt. Verwendet wird die Projektion, die der Paketbau für die
Verträge 1.0 und 1.1 schon anwendet:

| Sprache | Projektion | Fingerabdruck |
| --- | --- | --- |
| Python | `project_out_learning_units` in `scripts/curriculum_learning_units.py` (unverändert) | `fingerprint_prerequisite_reduction_document` in `scripts/prerequisite_reduction_semantic_kind.py` |
| TypeScript | neu: `app/scripts/learningUnitLayerProjection.ts` | `fingerprintPrerequisiteReductionDocument` in `app/scripts/prerequisiteReductionProof.ts`; Registerdatensätze behalten ihren vollständigen Digest |
| Java | `LearningUnitLayerProjection` im Testcode | Dokumentdigests in `FirstMathPrerequisiteReductionTest` |

Keine Produktionsklasse des Backends berechnet diesen Fingerabdruck. Für ein Dokument ohne
Einheiten ist die Projektion die Identität: Vor der Einfügung bestanden der
TypeScript-Prüfer (439 s) und der native Java-V8-Rahmen einschließlich der
Ablehnung handgebundener Enddigests auf dem unveränderten Repository. Die
Registerdateien bleiben unverändert.

Neue Tests: `testLearningUnitLayerProjection.ts` vergleicht TypeScript und
Python für alle 30 Landschaften der gemeinsamen Einheitenfälle (eine davon ist
nicht projizierbar) und Mathematik mit Pilot; Python und Java prüfen dieselben
Referenzwerte. Die Regressionen in `testPrerequisiteReductionProof.ts` belegen,
dass Einheitenänderungen den Nachweis gültig lassen, während Änderungen an
Zielen, `requires`, `contains`, Kalendereinheiten, `primary`-, `secondary`- und
`assessed`-Platzierungen oder anderen Dokumentfeldern weiterhin scheitern, auch
neben einer Einheit, in der ganzen V8-Kette und nach handgebundenen Enddigests.
Ein unbekanntes Feld an einer Einheit oder an einer `own`-Platzierung verdeckt
keine Zieländerung, weil die Projektion den Eintrag als Ganzes entfernt und
Ziele nie berührt. Beide Einheitenvalidatoren weisen ein unbekanntes Feld an
einer Einheit und an einer `own`-Platzierung ab (`LU-UNIT`, `LU-PLACEMENT`);
eine `own`-Platzierung trägt genau `goalId`, `unitId` und `relation`.

Ältere Träger folgen derselben Regel. Der Fachexport
(`export:subject-package`) und seine MEM/FWU-Rundreise kennen keine
Lerneinheiten; der Export liefert die Landschaft deshalb ohne Einheitenschicht
aus, wie ein Bau nach Vertrag 1.0 oder 1.1. Einheiten trägt nur Vertrag 1.2.
`testSubjectExportRepositoryReferences.ts` prüft das für alle exportierten
Fächer.

## Bindungen

| Bindung | Ergebnis |
| --- | --- |
| Reduktionsregister V6 bis V8 | Unverändert. Der Mathematikdigest `3e9cfc60…` gilt für die Datei mit Einheit. |
| `app/scripts/config/math-duration-split-spanning-tree-policy.json` | Unverändert `664b6d15…`. Das Werkzeug hasht die Datei jetzt ohne Einheitenschicht und erzeugt die Ansichten aus der projizierten Landschaft; alle Ansichten bleiben bytegleich. |
| `contracts/curriculum-package/v1.2/profiles/de-gymnasium-mathematik-learning-units-release-model-v1.profile.json` | Vom Generator neu erzeugt; die Einheitenzahlen (0/0/0 → 1/2/0) leitet er jetzt aus der Fachdatei ab. |
| Weitergabeledger für Vertrag 1.2 | Für den Probebau vom regulären Generator mit `--generate --learning-unit-candidate` erzeugt (Modelldigest `sha256:25cbd4a8…`; 836 Assetrecords und 839 menschliche Prüfungen offen, Weitergabe gesperrt). Er ist nicht eingecheckt: Er bindet den Modelldigest des 1.2-Baus, und kein CI-Lauf hielte eine eingecheckte Fassung aktuell. |
| Weitergabe- und Plan-Pins des Vertrags 1.0 | Unverändert: Der 1.0-Bau projiziert die Einheit heraus, der Ledger `de-gymnasium-mathematik-v1` bleibt aktuell. |
| Qualitätsstatus | Neu erzeugt und bytegleich; alle zehn geschützten Fächer halten ihren Reifegrad. |

## 1.2-Paket

Das Release-Modell nach dem Mathematikprofil 1.2 wurde aus der echten
Fachdatei kompiliert (544 s) und unabhängig validiert (604 s). Danach entstand
das JSON-Paket `skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-learning-units.1`
(1.685.582.726 Byte, ZIP-SHA256 `06a20603…`, 538 s). Es trägt Laufzeitvertrag
1.2 mit `learningUnitsV1`, die Einheit, beide `own`-Platzierungen und keine
Reviewartefakte. Der unabhängige Paketvalidator bestand alle sechs Gates
einschließlich `hardReferenceClosure` (39 s). Modell und ZIP sind Bauergebnisse
unter `tmp/` und werden nicht eingecheckt.

## Prüfungen

Mit Einheit bestanden: der TypeScript-Prüfer gegen das echte Repository
(443 s), `test:transitive-minimality` aus dem CI-Job
`curriculum-assessment-proofs` (682 s), die vollständige Java-Klasse
`FirstMathPrerequisiteReductionTest` (9 Tests) und die neue
Konformitätsklasse (3 Tests), die Python-Tests der Brücke, das
Mathematik-Dauerlayout, beide Einheitenvalidatoren, `quality:curriculum-status`
(637 s, bytegleich) und `quality:curriculum-status:check` (615 s, zehn
geschützte Fächer über ihrer Untergrenze).

| Lauf | Dauer | Ergebnis |
| --- | --- | --- |
| `./run_ci.sh curriculum` | 40 min | Alle Schritte bis `run_package_consumer_smoke.py --self-test` bestanden; dieser scheitert, weil `bwrap` fehlt (Umgebung). Die neun folgenden Prüfungen bestanden einzeln; die Release-Modell-Konformität deckt der Paketlauf ab. Lokal braucht der Lernzielbuchbau die Liberation-Schriften aus `tmp/ci-tools/font-root` (Umgebung). |
| `./run_ci.sh package` | 47 min | 1.0-Modell kompiliert, unabhängig validiert, zweimal bytegleich gebaut; Weitergabe- und Quellenledger aktuell; echtes 1.0-ZIP mit den unveränderten Pins (1.061 Einträge, Digest `5d3cf9c7…`), unabhängig validiert und provisioniert. Danach fehlt der Konsumentenbericht, weil `bwrap` fehlt (Umgebung). Einzeln: `test_learning_unit_release_model.py` bestanden (1.225 s, 1.0- und 1.1-Bau bytegleich mit und ohne Testeinheit); `ProvisionedCurriculumPackageConformanceTest` scheitert an seinem Digestpin `3f935a5b…`, der seit der atomaren Reduktion vom 8. November nicht mehr dem Modelldigest `5d3cf9c7…` entspricht (vorbestehend, unabhängig von der Einheit). |
| `./run_ci.sh owl` | 2 min + 5 min einzeln | Ohne `zipinfo` und `unzip` scheitert die Paketvalidierung (Umgebung); die Werkzeuge liegen aus dem Ubuntu-Paket unter `tmp/ci-tools/unzip-root`. Im ersten Lauf scheiterte `roundtrip:mem-fwu:semantic` an `semantic-program-units-match`, weil der Fachexport die Einheit an die slim-RDF-Rundreise weiterreichte, die `labelEn`, `promise`, `promiseEn` und `revision` nicht kennt. Seit der Export die Einheitenschicht ausblendet, bestehen Fachexport, Exportvalidierung, `roundtrip:mem-fwu:semantic` und `test:subject-export-package-contracts` mit eingetragener Einheit. Einzeln bestanden außerdem OWL-2-DL und HermiT, die FWU-OWL-Verträge, drei Selbsttests und die Dual-Release-Verträge; zwei Selbsttests scheitern an fehlendem `strace` und `bwrap` (Umgebung). |

## Kosten jeder weiteren Einheitenänderung

Eine weitere Einheitenänderung, die keine Zielobjekte berührt, lässt die
Register, das Dauerlayout, die Pins des Vertrags 1.0 und den Qualitätsstatus
unverändert. Neu zu erzeugen ist nur das Mathematikprofil 1.2 mit
`python3 -B scripts/generate_curriculum_package_learning_unit_contracts.py`,
wenn sich die Zahl der Einheiten, `own`-Platzierungen oder Reviews ändert (die
Curriculum-CI prüft es mit `--check`). Ändert sich ein Fall der gemeinsamen
Einheitenfälle, kommen die Referenzwerte der Projektion hinzu
(`npx tsx scripts/testLearningUnitLayerProjection.ts --write`).

Wer ein 1.2-Paket baut, erzeugt dafür den Weitergabeledger 1.2 neu: Modell
kompilieren (etwa 9 Minuten) und
`generate_curriculum_package_redistribution_review.py --generate --learning-unit-candidate`.

Dazu kommen die beiden Validatoren (unter einer Sekunde und 45 s) und
`quality:curriculum-status:check` (etwa 10 Minuten).

Dies ist technische Bindungspflege. Sie fügt keine fachliche, menschliche oder
rechtliche Freigabe hinzu; Remote-CI bleibt ein eigener Nachweis.

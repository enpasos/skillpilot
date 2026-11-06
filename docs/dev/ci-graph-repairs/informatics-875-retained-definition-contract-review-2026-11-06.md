# 875 und alte41: Pflichtangebot korrigieren, Bestandsdefinitionen ehrlich erhalten

**Eine vollständig saubere rein datenseitige Retirementlösung ist im heutigen Vertrag nicht vorhanden.** Die alten IDs in der kanonischen Datei zu belassen erhält ihre Auflösbarkeit, entbindet sie aber nicht von Graph- und Inhaltsprüfung. Sie aus der aktiven Datei zu entfernen benötigt dagegen eine historische Definitions-/Zustandsauflösung, die das bestehende Package-Migrationsschema allein nicht implementiert. Der [vollständige Beleg](informatics-875-retained-definition-contract-review-2026-11-06.json) bindet die tatsächlichen Quellenstellen und drei native Gegenproben auf Informatik `f95c0a11…` und allen21 aktuellen Katalogdateien. Keine Produktivdatei oder Lernerdaten wurden geändert.

Die fachliche Entscheidung und die genauen35 Scopebestände bleiben im [eingefrorenen Lückenbeleg](informatics-875-official-or-gap-followup-2026-11-06.md):875 ist durch die gelesenen Quellen weder als volle amtliche Leistung noch als tatsächlicher Lückenschluss gerechtfertigt. Die sieben875-Targetentzüge und sechs Prüfungsersetzungen überlappen in drei LK-Kontexten; zehn Kontexte ändern sich,25 bleiben unverändert. Neue eigenständige Prüfungen wären GK22 und LK40. Die originale41er-ID behält ihren41er-Sinn und ihre historischen Ergebnisse.

## Vorhandene Mechanismen und ihre tatsächliche Grenze

| Mechanismus | Geprüfter Bestand | Konsequenz |
| --- | --- | --- |
| `LearningGoal` / `release` | Kein Goal-Retired-/Superseded-Feld; `release.status` kennt draft/released für Examangebote. | Ein frei hinzugefügtes Retired-Flag hätte keine vorhandene sichere Wirkung. Draft blockiert echte Freigabe und ist kein Retirement. |
| `compatibilityOnly` und HE-Retirementregistry | Ganze ausgewählte alte Landschaften beziehungsweise alte Verzeichnisbäume werden abgelöst. | Nicht auf einzelne Goals einer weiter aktiven kanonischen Landschaft übertragbar. |
| Package-Migration | `replacedBy` verlangt reassess, `removed` retire/preserve-retired; nur gleichbedeutendes renamed erlaubt copy-exact. |41→40 ist keine Umbenennung. Der Loader hält die gebundenen JSON-Artefakte im Snapshot; die gelesenen Produktionspfade enthalten keine Anwendung auf historische Goalzustände. |
| Aktuelle Definition und Mastery | Mastery speichert ursprünglichen Goalkey, Wert und Zeit; `getGoalDefinition` sucht im aktuellen Katalog. | Eine erhaltene Datenbankzeile ist noch keine erhaltene historische Definitionsauflösung nach Löschen des Goals. |
| Strict Graph | Alle Goalkeys des ausgewählten kanonischen Owners starten die Prüfung, unabhängig von View und Contains-Platzierung. | Retained875/41 bleiben unter sämtlichen zehn harten Regeln, insbesondere G17/G42. |
| CQR-Endpunktbestand | Info ermittelt Endpunkte nur als direkte atomare Kinder sechs fest konfigurierter Praxiscluster. | Ein neuer Root-Level-Exam wird dadurch noch nicht in CQR201–203 aufgenommen. |
| Quellenbestand | Aktive Mappingdateien, Provenance, Source-Membership und Source-Closure bleiben Eingaben. | Historisierung muss diese aktive Kette ehrlich berichtigen. Ein alter falscher Exact-Eintrag neben einem neuen Bericht bleibt falsch. |

Die genaue bestehende Route heißt `canonical-informatics-crossstage`; Motivation ist `d848ceb9-cd73-5a13-9407-f3364764c223`. Ihre Praxiscluster sind:

- `f05a9276-f27c-5d74-af65-588f12ab4de3`
- `91c5be09-cc6b-5f57-bfe1-9f0038faf26a`
- `6982b63a-c6c8-5a6f-b5cb-51568301ac1c`
- `010651ba-ddd0-510b-8ed1-e3610031f6e1` — bisherige Q2-Prüfungen
- `70ef7a45-540a-5d8c-b970-19b9f740c40a`
- `4d22b75a-c395-5785-9131-68a8a5e203c1`

Das Profil wählt207 gewöhnliche Ziele einschließlich875 unabhängig von ihrer konkreten Targetmitgliedschaft. CQR104 prüft aktuell18 rohe CrossStage-Views mit14 profilweiten Endpunkten; die projektionseigene Routenprüfung ist dort nicht aktiv. Der besondere Economics-Vertrag für vollständige Materialien und Kurse gilt nicht automatisch für Informatik. Diese18er-Messung ist deshalb kein Nachweis für die35 wirklichen GK/LK-Kontexte und die vorgesehenen22er-/40er-Prüfungen.

## Tatsächliche native Gegenproben

Die Produktionsfunktionen wurden mit einer ausschließlich um zwei Exports ergänzten, nur lesend eingeblendeten Kopie ausgeführt. Der Repository-Producer blieb bytegleich. Die Hypothesen änderten nur In-Memory-Objekte; Views und tatsächliche Quelldateien blieben unverändert. Ganze native Outputs und der kleine [Probe-Code](inspect_informatics_875_retained_boundary.ts) sind gebunden.

| Diagnose | Ganze Info-G17 | G17 der alten41 | CQR101 / CQR102: fehlende Terminalpfade | CQR202-Auswahl |
| --- | ---: | ---: | ---: | --- |
| Aktueller Bestand |47 |10 |0 /0 |14 Prüfungen,6 schwach |
| Nur41 aus Q2-Praxis-Contains nehmen |47 |10 |41 /41 |13 Prüfungen,5 schwach |
| Zusätzlich875 aus Q2.1 nehmen und Grundlage7ad einsetzen |46 |9 |41 /41 |13 Prüfungen,5 schwach |

Der ausdrücklich direkt auf die weiterhin vorhandene41er-Definition angewandte native Readinesschecker bleibt in allen drei Fällen **fail**. CQR104 bleibt in diesem begrenzten Experiment pass; das billigt weder den Scopeentzug noch die alte Prüfung. Seine Endpunktliste stammt selbst aus dem verkleinerten Profil. Das zeigt konkret, warum ein sinkender Placeholderzähler nach Entfernung aus dieser Auswahl keine Inhaltsreparatur belegt.

Die dritte Diagnose ist keine freigegebene Gesamtreparatur: Neue22er-/40er-Inhalte und Views fehlen, Phase und Titel bleiben dort unverändert, und es ist kein neues globales Gleichheitsversprechen gemeint. Sie isoliert lediglich das tatsächliche Verhalten der bestehenden Prüfgrenzen.

## Engste vollständige Richtung ohne neue Lerner-Migrationsruntime

Ich empfehle, die Definitionen **im selben kanonischen Owner resolvierbar zu erhalten und vollständig zu reparieren**, ihre nicht mehr berechtigte Pflichtangebotsrolle aber explizit auszuweisen. Dafür ist eine kleine, offen benannte Erweiterung des QA-Angebots-/Bestandsvertrags erforderlich; sie ist heute **nicht implementiert** und wird hier nicht als vorhandener Schalter vorausgesetzt.

1. **Retained Graph reparieren.**875 erhält die fachlich passende7ad-Grundlage und eine ehrliche didaktische Phase/Platzierung. Die alte41 behält alle41 Kompetenz-IDs. Ihre übrigen redundanten Kanten werden nur nach fachlichem Einzelfallreview und tatsächlicher kumulativer Goal-/Atomic-Gleichheit normalisiert. Alle retained Goals bleiben im unveränderten strikten Graphumfang; keine Ausnahme für G17/G42.
2. **Retained Inhalt reparieren.** Die alte41 benötigt ein wirklich vollständiges41-Kompetenzen-Dossier mit eigener Lösung und Rubrik. Die späteren40er-Materialien können sachgerecht wiederverwendet und um eine echte Hierarchie-/Parallelitätsleistung ergänzt werden. Dieses zusätzliche Material repariert ausschließlich das alte bereits versprochene41er-Prüfungsobjekt. Es begründet875 **nicht nachträglich als neuen Pflichtlückenschluss**. Alte generische Aufgabenbytes bleiben historisch; alte Ergebnisse werden weder neu zertifiziert noch zurückgenommen.
3. **Neue Pflichtprüfungen tatsächlich ausarbeiten.** GK22 und LK40 erhalten eigene stabile IDs, vollständige Aufgaben und eine Rubrik, die sämtliche unveränderten Kompetenzen auf jeder Bestehensroute prüft. Sie werden ohne breite geerbte LK-Pflichten platziert. Einfach unter den alten Q2-Praxiscluster zu hängen würde dessen Cluster-Requires erben; ein Root-Level-Eintrag benötigt dagegen eine explizite atomare CQR-Endpunktkonfiguration.
4. **Offene QA-Bestandsgrenze ergänzen.** Ein geschlossener, quellgebundener Reviewbestand unterscheidet die konkreten aktiven Angebote von genau bezeichneten retained-unoffered Definitionen. Für875 und alte41 bindet er Entscheidung, unveränderte Bedeutung, historische Artefakte, neue Inhalts-/Graphnachweise sowie die exakten35 Nichtangebots-/Ersatzbehauptungen. Diese Grenze ändert weder Goaltyp noch Mastery und erfindet keine freiwillige Kurs- oder Zugangsregel. Sie darf ausschließlich die nicht mehr geltende öffentliche Angebots-/Sichtbarkeitspflicht lösen; retained Inhalt, A/M und alle Graphregeln bleiben prüfpflichtig.
5. **Aktive und retained Prüfungen vollständig erfassen.** Aktive22/40-Endpunkte müssen kursgenau in CQR201–203 eingehen. Die retained41 wird unabhängig von ihrer öffentlichen Sichtbarkeit weiterhin ausdrücklich mit dem nativen Readinesschecker und tatsächlichem Inhaltsbeleg geprüft. Die retained875→41-Fachroute erhält weiterhin Motivation und vollständigen Graphnachweis. Kein beliebiges Goal darf durch Nichtreferenzierung aus den Gates verschwinden; unregistrierte, stale oder unvollständig reparierte Bestände blockieren.
6. **Quellen und Nebenfolgen ehrlich berichtigen.**15 Mappingeinträge zu14 Source-Atomen, Provenance und Rückwärtsnenner benötigen überprüfte Nachfolger. Bei `269a561b…` und `ca2ff162…` wird die wirkliche clusterbasierte Coverage23→22 ausdrücklich neu beurteilt. Ihre sechs DB-Materialbefunde bleiben offen. Die anderen25 Kurskontexte sowie alle übrigen Targets in den zehn betroffenen Kontexten bleiben exakt; Fokus-, Plan- und historische Key-Auflösung werden mit synthetischen Captures geprüft. Kein Statewrite und kein automatischer Passübertrag auf neue Prüfungen.

Die notwendigen Gegenfälle stehen im JSON: Ein unbekannter Scopeentzug, ein retained G17/G42-Fehler, der weiterhin generische41er-Inhalt, ein aus CQR202 ausgelassener Root-Level-Exam,41→40 unter derselben ID oder ein verschwundener historischer Goalkey müssen jeweils scheitern. Ein gültiger alter41er-Pass wird erhalten; neue22er-/40er-Ergebnisse entstehen ausschließlich aus ihren eigenen gültigen Ergebnissen.

Falls diese ausdrücklich neue, enge QA-Bestandsgrenze nicht umgesetzt wird, bleibt die vollständige Ablösung offen. Die andere echte Alternative wäre eine versionierte historische Definitions- und Stateauflösung mit sauberer Migration. Das ist eine eigene Runtime-/Schemaarbeit; weder `migration-aliases.json` noch der weiterhin unverdrahtete Identitätskern erlauben sie schon. **Bis eine vollständige Richtung implementiert und geprüft ist, bleiben die heutigen Fehler ehrlich sichtbar.** Es gibt hier keine M6-Freigabe, Flooränderung, neue Lerneinheit oder Aktivierung einer Anerkennungs-/Migrationsfunktion.

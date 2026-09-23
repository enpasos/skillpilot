# B046h: minimaler HE-Q2.4-/Q2.5-Änderungsplan

Stand: 21.09.2026. **Nur Vorschlag, nicht ausgeführt.** Canonical und Views bleiben während der laufenden D-Runden stabil. Vollständige Vorherwerte, Ersatzobjekte, Dateihashes und In-Memory-Compilerbefunde stehen in [b046h-he-scope-minimal-change-plan.json](b046h-he-scope-minimal-change-plan.json).

## Ergebnis

Der konkrete Bestand lässt einen kleinen Scope-Delta zu: **vier HE-GK-Views mit jeweils drei Änderungen**, dazu **zwei falsche Assessment-Bindungen** im Canonical. Die 14 vorbereiteten Operationen allein sind jedoch **noch kein vollständiger Abschluss**:

- Die quellengerechte Auswahl nimmt den unmittelbar benachbarten LK-Inhalt `4bc6cc77…` mit heraus. Das ist eine ausdrücklich vorgeschlagene Erweiterung gegenüber den drei beauftragten IDs, keine unterstellte Erlaubnis.
- Nach Entfernung der falschen Rotationskante hat `7bd8f022…` keinen einzigen direkten Nachfolger mehr. Ein echter LK-Prüfungsendpunkt ist deshalb vor einem vollständigen Routenabschluss noch zu bestimmen/erstellen.

Die vorhandenen Kompetenztexte und alle anderen Länder-/LK-Auswahlen bleiben unberührt. Keine Tagfilter-Magie und kein Verstecken als `prerequisiteOnly`.

## Quellen und aktuelle Aufgaben tatsächlich gelesen

Die lokale Originalquelle `curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`, gedruckte Seiten 43–44, wurde einschließlich der Niveaustufen erneut gelesen. Langfristige Entwicklung mit Matrixpotenzen/Grenzprozessen/Grenzmatrizen steht in Q2.4 unter LK, Drehungen um Koordinatenachsen in Q2.5 unter LK. Einfaches schrittweises Rechnen, M²-Deutung und Fixvektoren bleiben Q2.4-GK-Inhalt.

Der aktuelle GK-Markov-Endpunkt `57aff94e-91b8-5cc6-9f85-3f317ecf36ca` enthält bereits die passenden Aufgaben 1–5 (50 BE). Der LK-Endpunkt `e4656e83-3f33-5bda-b0bc-d4b63ec4653e` ergänzt ausdrücklich Aufgabe 6 zum Langzeitverhalten (60 BE). Beide aktuellen Aufgabentexte wurden gelesen. Es ist weder eine neue GK-Aufgabe nötig noch darf der richtige LK-Teil aus dem Canonical gelöscht werden. Die separate v2-Reviewdokumentation liefert die vorhandene differenzierte Coverage, nicht eine neu von mir behauptete vollständige Assessment-Abnahme.

Das gemeinsame Geometrieassessment `81823f27-0c92-5444-ac4e-32b83169f318` hat tatsächlich nur eine 2×2-Abbildung, ein Dreieck, eine Eigenvektorprüfung und eine 2D-Projektion. Es prüft keine Drehung um eine Koordinatenachse im Raum. Aufgabe, Lösung und Bewertungsraster wurden gelesen; der hier minimale Delta betrifft nur die konkret falsche Rotationsbindung. Dies ist keine Generalfreigabe aller anderen Coverage-Einträge.

## 1. Exakte Viewstellen

Dateiroot: `curricula/DE/Gymnasium/composition-views/mathematik/`. Alle Angaben sind JSON-Pointer des gelesenen Stands. Vor Umsetzung zusätzlich die im JSON-Plan festgehaltenen Vorherobjekte prüfen; nicht blind auf alte Arrayindizes schreiben.

| Datei | Q2.4-Teilbaum ersetzen | Q2.5-Teilbaum ersetzen | LK-Assessmentreferenz entfernen |
| --- | --- | --- | --- |
| `de-he-gk-g8.view.json` | `/rootNodes/0/children/1/children/3/children/3` | `/rootNodes/0/children/1/children/3/children/4` | `/rootNodes/0/children/1/children/3/children/6/children/4` |
| `de-he-gk-g9.view.json` | `/rootNodes/0/children/1/children/3/children/3` | `/rootNodes/0/children/1/children/3/children/4` | `/rootNodes/0/children/1/children/3/children/6/children/4` |
| `de-he-gk.view.json` | `/rootNodes/0/children/1/children/3/children/3` | `/rootNodes/0/children/1/children/3/children/4` | `/rootNodes/0/children/1/children/3/children/6/children/4` |
| `de-he-sekii-gk.view.json` | `/rootNodes/0/children/3/children/3` | `/rootNodes/0/children/3/children/4` | `/rootNodes/0/children/3/children/6/children/4` |

### Ersatz für Q2.4

Bisher pauschales `canonicalSubtree` auf `d6d8904c-896f-5850-8181-06c223346b80`.

Vorgeschlagenes `structure` mit ID `q24-gk-transition-processes` und Label „Q2.4 Matrizen und Übergangsprozesse“:

- Die drei unveränderten Teilbäume `2826e0b6-84d3-5abb-85bd-da8db77cc17a`, `0260fa2d-a040-4799-8009-4534344926e7`, `074d755a-d307-4569-baa9-128ad6ea97dd` erhalten.
- Die bisher gemischte Gruppe `0a024ecf-27ee-40a2-bf41-0e2faaeb1252` durch reine Viewstruktur `q24-gk-fixed-vectors` mit Label „Fixvektoren und stabile Zustände“ und `goalEntry` auf `8d893e63-d7de-52d9-8bcb-f48f47d1ccbf` ersetzen.
- `0de1e45c-aea9-5e53-932a-027dcf509efa` und `922d89fc-1cbd-56e9-ac5d-5cb59085de6c` sind dadurch keine GK-Targets mehr.
- **Begleitentscheidung erforderlich:** Auch `4bc6cc77-3d20-5d27-a74a-8efb0a038d17` heißt und beschreibt „Langfristige Entwicklung … (LK)“, ist auf dieselbe LK-Klausel gemappt und liegt in genau dieser gemischten Gruppe. Die vorgeschlagene Auswahl nimmt es mit heraus. Ein reiner Drei-ID-Delta müsste dieses Ziel behalten und wäre deshalb kein vollständiger sachlicher Q2.4-GK-Scopefix.

Die kanonischen Cluster selbst werden nicht verändert. Ihre Strukturrolle wird nur innerhalb dieser vier GK-Ansichten durch explizite Viewknoten übernommen.

### Ersatz für Q2.5

Bisher pauschales `canonicalSubtree` auf `b3d2284c-21e0-5af8-942a-a4c11390c84a`.

Vorgeschlagenes `structure` mit ID `q25-gk-selected-matrix-mappings`, gleichem Themenlabel und den bisher enthaltenen zwölf anderen Kindern in derselben Reihenfolge. Ausschließlich `7bd8f022-5002-5610-994c-a9cec1890558` fehlt in dieser Auswahl. Das vollständige Ersatzobjekt mit allen zwölf IDs steht im JSON-Plan. Keine allgemeine Neubewertung sämtlicher Q2.5-GK-/LK-Grenzen in diesem begrenzten Paket behauptet.

### GK-Endpunkt

Nur den direkten `goalEntry` für `e4656e83-3f33-5bda-b0bc-d4b63ec4653e` aus `q2-gk-local-assessments` entfernen. Der unmittelbar davor bestehende `57aff94e…` bleibt unverändert; auch `81823f27…` bleibt als GK-Target erhalten. Die LK-Aufgabe, ihre vollständigen Requires und ihre Punkte bleiben in Canonical/LK-Views erhalten.

## 2. Exakte Canonicalstellen

Datei: `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`.

Vorbedingung: `/goals/1004/id` ist `81823f27-0c92-5444-ac4e-32b83169f318`.

| Operation | JSON-Pointer | Genau zu entfernender Wert |
| --- | --- | --- |
| remove | `/goals/1004/requires/2` | `7bd8f022-5002-5610-994c-a9cec1890558` |
| remove | `/goals/1004/examData/coveredGoalIds/2` | `7bd8f022-5002-5610-994c-a9cec1890558` |

Die beiden Arrays liegen unabhängig voneinander; kein Indexversatz zwischen diesen Operationen. Alle übrigen Elemente, Aufgabentexte, Musterlösungen, BE und Profilangaben bleiben bei diesem vorgeschlagenen Minimaldelta unverändert. Keine Canonicaländerung an den drei Inhaltszielen nötig.

## 3. Noch nicht gelöster echter LK-Endpunkt

Vorher einziger direkter Nachfolger von `7bd8f022…`: `81823f27…`. Nach den beiden sachlich begründeten Entfernungen: **kein direkter Nachfolger**. Die neue Leerstelle lässt sich nicht durch Hashreparatur oder beibehaltene falsche Coverage erledigen.

Kleinster fachlich ehrlicher Anschluss wäre eine gesondert beauftragte, reale LK-Rotationsaufgabe. Möglicher enger Entwurf: Rz(+90°) aus Basisbildern bestimmen, P=(2,−1,3) auf (1,2,3) abbilden, feste z-Achse und erhaltene Länge begründen; als Variationsfall Rx(−90°) mit P′=(2,3,1). Keine dieser Aufgaben, IDs oder Platzierungen wurde jetzt neu angelegt. Ein bestehender anderer Endpunkt darf nur verwendet werden, wenn sein wirklicher Aufgabentext die Kompetenz trägt.

Vor einem solchen Zusatz sind genaue neue Ziel-ID, LK-/andere-Länder-Platzierung, tatsächliche Requires/Coverage, Aufgaben-/Lösungs-/Punktprüfung und die vorhandenen Routenprofile zu entscheiden. Ein neuer Prüfungsknoten darf nicht über einen breit referenzierten Übungscluster unbemerkt wieder in GK erscheinen. Dies geht über die vorbereiteten 14 punktuellen Operationen hinaus und bleibt sichtbar offen.

## 4. Ausgeführte rein lesende / In-Memory-Prüfung

Die vorgeschlagenen Ersatzknoten und beiden Arrayentfernungen wurden nur auf Kopien im Arbeitsspeicher simuliert:

- Nativer `compileCompositionView`: alle vier veränderten HE-GK-Viewkopien mit **0 Fehlern**.
- Native Rollensammlung: je View verschwinden genau vier Inhaltsatome (`0de1…`, `922d…`, `7bd8…`, der vorgeschlagene Begleitfall `4bc6…`) und das LK-Assessment `e465…`; keine neuen Targetatome. Sie werden nicht `prerequisiteOnly`.
- Zusätzlich verschwinden drei kanonische Clusterreferenzen aus der View-Targetmenge, weil eigene Viewstrukturen ihre Navigationsrolle übernehmen. Das ist keine Löschung kanonischer Cluster oder Nenneränderung.
- GK-Markov-Endpunkt `57aff…` und gemeinsamer Geometrieendpunkt `81823…` bleiben in allen vier Viewkopien sichtbar.
- Vier unveränderte HE-LK-Views enthalten die vier betroffenen Inhaltsatome und den LK-Markov-Endpunkt weiterhin als Targets.
- Der kanonische In-Memory-Vergleich bestätigt den fehlenden Nachfolger der Rotation.

Dies ist **keine** vollständige DAG-/Routen-/Maturity-Abnahme. Vor Vollzug: stabilen D/P-Checkpoint abwarten, Begleitfall und echten LK-Endpunkt entscheiden. Nach Vollzug: Ziel-/Seiten-/Kontextbindungen gezielt erneuern, native Scope-/Routen-/Assessmentprüfungen, Quality-Status und geschützte Maturity-Floors prüfen. Unveränderte A/M-Arbeit erhalten; nur tatsächlich geänderte Source-/SemanticKind-/Evidence-Bindungen aktualisieren. Keine private Lernstandsmigration, kein Humanclaim, kein M7-Zähleranstieg aus diesem Plan.


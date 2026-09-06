# B033: Migrationsauswirkungen der beiden Vektor-Splits

Stand: 6. September 2026, Repositoryprüfung um 05:38 UTC. AI-Sachprüfung,
keine neue Blindrunde, keine Freigabe und kein Nachweis eines bereits
ausgeführten Splits. Geprüft wurden aktuelle kanonische Dateien,
Kompositionsdefinitionen, Karten-/Mappingdateien und die benannten
Produktionsfunktionen. Keine Nutzer- oder Serverdaten wurden gelesen.
Einzige Änderung dieses Prüfpakets ist diese Notiz.

**Empfehlung:** Beide fachlich begründeten Splits weiter konkretisieren, aber
die alten atomaren IDs derzeit nicht operativ in Cluster umwandeln.
Auch hier sind alte kanonische Mastery und gespeicherte
`atomicGoalIds` nicht automatisch auf neue Kinder migriert. Die letzte Aussage
in `atomicity-adjudication-remaining-2-v1.md`, der Vektorsplit könne unabhängig
fortgesetzt werden, trägt die fachliche Vorbereitung; sie belegt keinen
vollständig migrationssicheren kanonischen Rollout.

## Gegenwärtiger Umfang

| Merkmal | Vektoroperationen | Betrag/Abstand/Mittelpunkt |
| --- | --- | --- |
| Alte ID | `1bc118c3-1f05-5f2a-b125-418017180d75` | `a8ff2666-8df3-4253-8021-3efe42114e40` |
| Aktueller Typ / Gewicht / Kinder | atomic / 1 / 0 | atomic / 1 / 0 |
| Geplante Teilkompetenzen | Addition/Subtraktion; Skalarmultiplikation | Betrag/Punktabstand; Mittelpunkt |
| Direkte `requires`-Nachfolger | 6, ausschließlich Mathematik | 3, ausschließlich Mathematik |
| Direkte Viewreferenzen | 23: 20 `goalEntry`, 3 `canonicalSubtree` | 17: 14 `goalEntry`, 3 `canonicalSubtree` |
| Weitere Referenzen über gemeinsamen kanonischen Elternteilbaum | 27 Math-Views | 27 Math-Views |
| Insgesamt referenzierende Viewdateien | 50 | 44 |
| Externe / `prerequisiteOnly`-Referenzen | 0 / 0 | 0 / 0 |
| Aktive Kartenursprünge | 0; `no_memory_needed` | 4 Karten in 2 Decks; `memory_required` |

Gemeinsamer einziger direkter `contains`-Elternknoten:
`78bcc25b-e48c-471b-9236-6c3b23d48a8b`.
Die Zahlen zählen authored Referenzen einschließlich rekursiver
`canonicalSubtree`-Erreichbarkeit, keine Nutzerzahlen und keine Vollabnahme
aller effektiven Länderprojektionen.

Die 3 direkten Teilbaumreferenzen je Ziel liegen in BW GK, LK und Sek I.
Die 20 opaken Operationsreferenzen liegen in BY GK/LK sowie HE, RP und SH
jeweils GK/LK/Sek I × G8/G9. Beim metrisch-affinen Ziel fehlen die sechs
HE-/RP-G8-Einträge: Dort sind es 14 opake Referenzen. Somit sind bei einem
gemeinsamen Split **34 opake Einträge in 20 Viewdateien** gezielt umzubauen;
fehlende bisherige Ziele dürfen dabei nicht pauschal neu eingeblendet werden.

Gezielter Produktionscompiler-Test: ausschließlich im Speicher wurden beide
alten IDs zu Clustern mit jeweils zwei neuen, unregistrierten Testkindern.
In `de-bw-seki` und `de-de-gk` erschien jedes Kind genau einmal.
In `de-by-gk` und `de-he-seki-g9` erschienen beide alten IDs, aber **0 Kinder**.
In `de-he-seki-g8` blieb zusätzlich das metrisch-affine Ziel ganz abwesend.
Alle fünf Versuche hatten 0 Compilerfehler: Fehlerfreiheit alleine beweist
hier keine vollständige Kindplatzierung. Ursache ist das ausdrücklich
kindlose `goalEntry` in
`app/src/utils/authoring/compositionViewAuthoring.ts:584`.
Neue fachliche Kind-IDs sind für B033 noch nicht vergeben; die Test-IDs
wurden nicht gespeichert.

## Derselbe Mastery-/Plankonflikt, kein externer Physikkonflikt

- Bei vorhandener direkter kanonischer Mastery `M[alte ID]=1` und fehlenden
  Kindwerten ergibt ein expandierter neuer Cluster nicht automatisch wieder 1:
  die GUI aggregiert Kinder, das Backend nimmt deren Minimum. Das betrifft
  beide Vektor-IDs genauso wie den Funktionsbegriff. Ein alter Teilwert
  verrät außerdem nicht, welche der beiden Teilkompetenzen gemeistert ist.
  Belege: `app/src/hooks/useMasteryCalculation.ts:32`;
  `LearnerService.java:6580` und `:6623`.
- Plan-Atomlisten werden aus strukturellen Atomen gebildet; auch ein opakes
  View-`goalEntry` macht einen kanonischen Cluster nicht planbar.
  Gespeicherte alte `atomicGoalIds` werden nicht aufgefächert, sondern können
  als unbekannt zur Inkompatibilität führen; dann wird der Plan `stale` und
  das Fortsetzen gesperrt. Belege: `LearnerService.java:2651`, `:2697`;
  `LearnerLearningPlanService.java:1099`, `:1155`, `:894`.
  Termine, Reihenfolge und vollständiger alter Fokus sind daher ausdrücklich
  zu behandeln. Ob solche Bestandsreferenzen tatsächlich vorliegen, wurde
  nicht untersucht.
- Wichtige Ausnahme: Der bestehende Code kann **Legacy-Mastery** über
  `exact`-Mappings und passende Kind-Provenienz
  `splitFromCanonicalGoalId` weiterprojizieren
  (`LearnerService.java:1975`, `:2033`). Für `a8ff2666…` existiert genau
  eine solche direkte Legacy-Zuordnung:
  `f04a65b1-915d-4842-b938-9c8b2d049b60` → alte ID, `exact`, in
  `mapping/DE-BW/lower-secondary/bw_math_lower_secondary_to_canonical_math.json:622`.
  Für `1bc118c3…` wurde dort und in den übrigen aktuellen Mappingdateien keine
  direkte `exact`-Zuordnung gefunden. Diese Ausnahme migriert weder direkte
  kanonische Eltern-Mastery noch gespeicherte Planblöcke. Neue Provenienz oder
  `exact`-Behauptungen dürfen nicht als bloße technische Abkürzung dienen.
- Der zusätzliche Funktionsbegriff-Konflikt mit externen Physik-Referenzen
  liegt hier nicht vor: keine der beiden IDs ist extern oder
  `prerequisiteOnly` referenziert. Der Guard
  `external goalEntry must reference an atomic goal`
  (`LearnerService.java:9956`) wäre grundsätzlich relevant, wird aber durch
  diese beiden gegenwärtigen Referenzmengen nicht ausgelöst.

## Fachliche Anschlussarbeit

Für die **6 Operationsnachfolger** ist die vorhandene individuelle Zuordnung
weiter tragfähig: `235ae698-369f-4dbe-b46f-87e8b65bb03d`,
`b025df0c-994c-4807-9c5f-2d548905b73f` und
`ba343971-10e5-4b05-b005-405b9c1ce447` benötigen beide Operationsfamilien;
`d1352ce0-9502-5039-9af6-318fe385b6fd` benötigt Skalierung.
`a8ff2666-8df3-4253-8021-3efe42114e40` wird nach eigenem Split auf seine
Kinder bezogen. Die Prüfung `853905c5-e82b-592f-a485-1ff84c8bb22e` benötigt
beide Operationen in `requires` und `examData.coveredGoalIds`.
Die **3 metrisch-affinen Nachfolger** sind genau die oben genannten
`235ae698…`, `b025df0c…`, `ba343971…`. Keiner beansprucht ausdrücklich
Mittelpunktberechnung; deshalb nicht pauschal beide neuen Kinder als
Voraussetzungen übernehmen. Auch die Notwendigkeit einer allgemeinen
Abstandsroutine ist je Fall zu prüfen: Parameterdarstellung, Lage/Schnittpunkt
und ein Bewegungsmodell verlangen sie nicht automatisch.

Karten müssen bei Umsetzung konkret verteilt werden:
`math_linalg_c01` und `math_seki_c09` zum metrischen Kind,
`math_linalg_c02` und `math_seki_c10` zum Mittelpunktkind.
Alle vier sind aktuell `kept` und haben ausschließlich `a8ff2666…` als
Ursprung. Decks `de_gymnasium_math_linalg_core` /
`de_gymnasium_math_seki_core` und Memory-IDs
`bd55594a-3e06-5097-8324-4f2f1349fd2a` /
`4eefbd04-9e49-41ea-a087-9ad6ac71ec5a` bleiben identifizierbar.
Belege: `quality/memory-card-review/canonical-math-full.review.jsonl:155`,
`:158`; Kartenledger `canonical-math-full.cards.review.jsonl:40`, `:60`.

Quellenzuordnungen im aktuellen BW-Source-Review sind `partial`:
Operationsklausel `bw-math-seki-bp2016-3-3-1-12-9ab98be3`;
metrische Klauseln `bw-math-seki-bp2016-3-3-2-09-8ffa9618` und
`bw-math-seki-bp2016-3-3-2-10-c99e94c0`;
Mittelpunkt `bw-math-seki-bp2016-3-3-3-10-207804b6`.
Der Vorbehalt zur allgemeinen Linearkombination bleibt erhalten.
Diese Prüfung las vorhandene Mappingaussagen, keine erneute amtliche
Quellen- oder Bildfreigabe.

## Was B032 belegt und was jetzt sicher fortgesetzt werden kann

Der genehmigte B032v-Split erhält
`e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e` als Cluster mit
`6c26a00a-ad1e-59cc-93e2-a38e1683665c` und
`a1c79897-6ded-57f8-bee1-2d365a5083c9`.
`batch-032u-resumed-current-context-recheck-4-v1/approved-change-plan.json:8`
begrenzt die Freigabe ausdrücklich auf Layer A; die dortigen Regeln erhalten
Projektionsrollen und ordnen Nachfolger einzeln zu. Die Verfahrensnotiz
`docs/qa-ci/math-physics-deep-understanding-resumption-review-2026-09-05.md:260`
erklärt alte Mastery ausdrücklich nicht automatisch zu Kindnachweisen.
Eine Migration gespeicherter Lernpläne ist in den geprüften B032-Artefakten
nicht nachgewiesen. Frühere B032-Splits mit Verengung einer weiter atomaren
Alt-ID sind deshalb ebenfalls kein Beleg für erhaltenen Gesamtumfang.

Ohne Runtime-/Lerndatenmigration sicher fortsetzbar sind die **nicht operative
fachliche Vorbereitung** der vier Kindkompetenzen, ihrer Source-/Karten-/
Nachfolgerzuordnung und scope-spezifischen Platzierungen sowie unabhängige
Text-/Aufgabenkorrekturen, die Zielidentität, Umfang und alte Atomreferenzen
erhalten. Die kanonischen Splits sind erst mit einer ausdrücklichen Regel für
direkte Alt-Mastery, Legacy-Projektion, gespeicherte Atomlisten, Termine und
Fokus als migrationssicher abgeschlossen. Weder Verengen der alten ID noch
ein opaker Sammelknoten löst diese Aufgabe.

Das ist eine begrenzte Wirkungsprüfung, kein neuer genereller Freigabestopp.
Nach einem tatsächlich beschlossenen Gesamtpaket bleiben DAG, Kompositionen,
Quellen-/Assessmentabdeckung, Atomicity, Memory-Sichtbarkeit, aktuelle
Reviews/Evidence-Bindings und geschützte M6-Floors zu prüfen.

# B038h v3: fachlicher Teilstand übernommen

Stand 2026-09-06. Begrenzte Layer-A-Adoption unter allgemeiner Userfreigabe,
fachliche AI-Einzelentscheidungen, **keine vollständige Zielabnahme**.
Originale v1/v2/v3-Vorschläge und Audits bleiben unverändert als Vorher-Evidenz.

## Tatsächliche Änderung

- Vier `requires`-Listen: `781f133a`, `628928a6`, `d900e0a4`, `c15fe32d`.
  Inhalte, IDs, Bilder und Mastery bleiben unverändert.
- Drei Quellenentscheidungen (G9 10.2, Zeilen 04/06/07): zwei Kanten entfernt,
  zwei auf bestehende J10-Ziele ergänzt, drei von exact auf partial präzisiert.
- Vier individuelle Atomicity-/Memory-/SemanticKinds-Nachprüfungen. Die acht
  nativen A/M-Fingerprints bleiben korrekt identisch, weil deren Payload keine
  `requires` enthält. Nur die vier SemanticKinds-Fingerprints ändern sich.
- Alle 61 geprüften Layout-Platzierungen bleiben unverändert. Der aktualisierte
  kanonische Input ist über die neue Scope-Adjudikation ausdrücklich gebunden,
  nicht als neue menschliche Layout-Abnahme ausgegeben.
- Der unveränderte native Generator ändert exakt drei HE-G9-Views. In Sek I
  entfallen sieben E-Clusterkinder; die bestehenden J10-Ziele `c088fd81` und
  `aed3ca99` kommen hinzu. Die bestehende J10-Prüfung `af7905d0` wird durch den
  unveränderten Filter wieder target, weil jetzt alle neun tatsächlichen
  `requires`/`coveredGoalIds` target sind. Ihre Aufgabenbytes und Freigabe wurden
  nicht verändert. Cross-Stage GK/LK behalten alle sieben Oberstufenziele und
  gewinnen nur die beiden J10-Ziele plus Prüfung. Die übrigen 15 erzeugten
  Duration-Views bleiben bytegleich.

Vollständige IDs, Before-Slices, Quellenbegründungen und Kontext-Radius stehen in
[Core-Receipt](adoption-he-g9-exponential-scope-v3.receipt.json),
[Einzelreview-Receipt](review-followup-v3.receipt.json) und
[nativer Preview-Receipt](native-duration-preview-v3.receipt.json).
Die tatsächlich geschriebenen drei View-SHA256 stimmen mit der Preview überein.

Für einen vollständigen differenziellen Seiten-/Kontextabgleich ist der Radius
größer als die vier kanonisch editierten Ziele: Neben den zwölf kanten- oder
vererbungsbetroffenen Atomen aus dem Core-Receipt betreffen die neuen
Source-Decision-Metadaten auch die unveränderten Mitziele `c19d1f8f`, `c74d0c7e`,
`14af09c2`, `a41761f2`. Hinzu kommen Quellcluster `48e7615d` und die nun sichtbare
Prüfung `af7905d0`. Geänderte ein-/ausgehende Requires-Kontexte der unveränderten
Kantenendpunkte (`71cec9fb`, `858113c5`, `346efb31`, `b9bbd2a8`) müssen ebenfalls
aus dem tatsächlichen Seiten-/Kontextdiff beurteilt werden. Das ist keine
Behauptung geänderter Zieltexte oder eine pauschale neue Abnahme dieser Ziele.

Quellenzeilen 04/06/07 und der Anwendungs-/Darstellungskontext wurden erneut im
[Original, G9 10.2, gedruckte S. 38](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-mathematik.pdf)
gelesen. Der G9-Lehrplan bleibt Sequenzierungsreferenz neben dem bindenden KC.

## Ausgeführt und bestanden

- `check_openai_plugin_review_freeze.mjs`: PASS.
- `semanticAtomicityReview.ts --config=curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.config.json --mode=check`: 796 aktuell, 0 stale/offen.
- `memoryCardReview.ts --config=curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.config.json --mode=check`: 796 aktuell, 0 stale/offen; Karten-/Sichtnachweise PASS.
- `generateMathDurationCompositionViews.ts`: Preview, dann `--write`, dann `--check` PASS.
- `reportHeMathDurationProjection.ts --check`: 613/613 authored-or-placement, 0 fehlend. Kein `--apply`.
- `validateGraph.ts`: 593 Landscapes PASS.
- `validateCompositionViews.ts`: 297 Views PASS.
- `testCanonicalMathSek1ReviewedExamRoutes.ts`: PASS einschließlich exakter Aufgaben-Geltung.
- `git diff --check`: PASS.

Die App-Befehle laufen aus `app/` mit `./node_modules/.bin/tsx`, Node 20.20.2.
Die beiden begrenzten Adoptionen lassen sich aus dem Repository-Root prüfen:

```bash
node curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-038-derivative-applications-and-exponentials-20-v1/adopt-he-g9-exponential-scope-v3.mjs --check
./app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-038-derivative-applications-and-exponentials-20-v1/review-he-g9-exponential-followup-v3.ts --check
```

Die Original-Preview ist ein unveränderter Vorher-/Nachher-Beleg. Nach Adoption
prüft man die aktuelle Generator-Reproduzierbarkeit mit dem nativen `--check`,
nicht durch nochmaliges Ausführen der geschützten Vorher-Adoption.

## Offene Folgeschritte, nicht überspielt

Root übernimmt Source-/OriginalSources-/Buch-/Seiten- und positive Evidenz,
zentralen Status sowie Maturity-Floors. Diese Datei behauptet dafür kein PASS.
`d900e0a4` benötigt ausdrücklich frische positive Evidenz dafür, dass die
inverse Operation im Ziel selbst erklärt und verstanden wird: kein heimlich
angenommenes J10-Mastery, kein Dividieren durch die Basis, Definitionsprüfung,
Einsetzprobe und sachbezogene Interpretation.

`c15fe32d`/`dbc13bb0` bleiben hinsichtlich HE-Sek-I-Orientierungsprojektion auf
**HOLD**. Eine neue Projektionsvariante ist nicht Teil der v3-Adoption.

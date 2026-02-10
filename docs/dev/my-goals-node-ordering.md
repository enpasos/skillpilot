# Meine Lernziele: Ausgewogene Knotensortierung (Design vor Implementierung)

## Status
- Implementiert in `app/src/utils/goalSorter.ts` und angebunden in `app/src/components/CompetenceTree.tsx`.
- Zielbereich: Baumdarstellung in `Meine Lernziele` (`app/src/components/CompetenceTree.tsx`).

## Problem
Aktuell werden Geschwisterknoten topologisch nach **direkten** `requires` (unter den sichtbaren Geschwistern) sortiert und bei Gleichstand alphabetisch (`app/src/utils/goalSorter.ts`).

Das ist korrekt, nutzt aber Abhängigkeitsinformation aus Unterknoten nicht aus.

## Ziel
Eine Reihenfolge, die drei Dinge kombiniert:
1. Harte Voraussetzungen (`requires`) haben Vorrang.
2. Subknoten-Abhängigkeiten dürfen die Reihenfolge **unterstützend** verbessern.
3. Bei Gleichstand bleibt die Reihenfolge alphabetisch und deterministisch.

Zusätzliche didaktische Leitlinie innerhalb einer Topo-Stufe (unter demselben Cluster):
1. ganz zuerst `Warum ...?`-Einstiegsknoten,
2. danach normale Tutorial-/Themenknoten,
3. danach Flashcard-/Memorisierungsknoten,
4. zuletzt Übungs-/Prüfungsknoten.

Zusätzlich gibt es eine explizite Steuerungsmöglichkeit für gewünschte Reihenfolgen (z. B. E, Q1, Q2, Q3, Q4, Abitur):
- manuell pro Knoten über `extendedData` oder `tags`
- danach automatisch über Phasen-Reihenfolge

## Wichtige Invariante: keine Zyklen als Fachfall
- SkillPilot-Graphen sind als DAG modelliert (`requires`, `contains`, `effective requires`) und werden in CI validiert:
  - `app/scripts/validateGraph.ts`
  - `docs/qa-ci/relation-checks.md`
- Deshalb behandeln wir Zyklen **nicht** als normalen Produktfall.
- Konsequenz für das Design: Nur harte `requires` werden als Topo-Zwang verwendet; Subknoten-Signale sind reine Tie-Breaker (soft ranking), keine zusätzlichen harten Kanten.

## Begriffe
- `siblings(P)`: sichtbare direkte Kinder eines Elternknotens `P` (nach GK/LK-/Personal-Filter).
- `desc(g)`: alle transitiven `contains`-Nachfahren von `g`.
- Harte Kante `A -> B`: `B.requires` enthält `A` (direkt, innerhalb der Geschwistermenge).
- Weiches Signal `A => B`: in Nachfahren von `B` gibt es genügend `requires` auf Nachfahren von `A`.

## Soft-Signal aus Subknoten (geeignet, aber nicht dominant)
Für ein Geschwisterpaar `(A, B)`:
- `support(A, B)` = Anzahl `requires`-Treffer von `desc(B)` nach `desc(A)`.
- `ratio(A, B)` = `support(A, B) / max(1, |desc(B)_with_requires|)`.
- Signal `A => B` gilt nur, wenn beide Schwellwerte erfüllt sind:
  - `support(A, B) >= minAbsoluteSupport` (Vorschlag: `2`)
  - `ratio(A, B) >= minRelativeSupport` (Vorschlag: `0.25`)

Damit werden einzelne Ausreißer nicht überbewertet.

## Sortieralgorithmus (vorgeschlagen)
1. Erzeuge harte Geschwister-Dependency-Grafik `R_hard` aus direkten `requires`.
2. Erzeuge Soft-Signal-Matrix `S` über Subknoten (nur Scores, keine Zwangskanten).
3. Kahn-Toposort über `R_hard`.
4. Wenn mehrere Knoten gleichzeitig verfügbar sind (`inDegree = 0`):
   - zuerst manuelle Reihenfolge (falls gesetzt)
   - dann Lernfluss-Bucket:
     - `why` (Titel beginnt mit „Warum“/„Why“)
     - `tutorial` (Standard)
     - `flashcards` (`memorization`, `srs-deck:*`, Titel wie „Lernkarten/Flashcards“)
     - `exercises` (`examData`/`nodeKind=exam`, Titel wie „Übungen/Abi-Training/Vorschlag/Klausur“)
   - dann Phasen-Reihenfolge (`E < Q1 < Q2 < Q3 < Q4 < Abitur`)
   - danach `softScore(v) = outgoingSoft(v, remaining) - incomingSoft(v, remaining)`
   - wähle höchsten `softScore`
   - bei Gleichstand: alphabetisch nach `title` (`locale: de-DE`, `numeric: true`, `sensitivity: base`)
   - finaler Tie-Break: `id` (stabile Deterministik)

## Manuelle Steuerung
Unterstützte manuelle Order-Felder (aufsteigend, kleiner = früher):
- `extendedData.treeOrder`
- `extendedData.sortOrder`
- `extendedData.displayOrder`
- `extendedData.order`
- `extendedData.position`

Alternative über Tag:
- `order:<number>` (z. B. `order:10`)

Hinweis:
- Manuelle Order wirkt nur als Auswahl unter aktuell verfügbaren Knoten der Toposort-Stufe.
- Harte `requires` werden weiterhin nie verletzt.
- Lernfluss-Buckets wirken ebenfalls nur innerhalb einer verfügbaren Toposort-Stufe.

## Warum das ausgewogen ist
- **Didaktische Korrektheit**: harte Voraussetzungen werden immer respektiert.
- **Mehr Struktur**: Subknoten-Abhängigkeiten ordnen gleichberechtigte Geschwister sinnvoller.
- **Vorhersagbarkeit**: wenn fachlich gleich, sortiert Alphabet.
- **Kein neuer Zyklusfall**: Soft-Signale können keinen Topo-Deadlock erzeugen, weil sie nicht Teil der Zwangsrelation sind.

## API-Skizze für die Implementierung
```ts
type SortOptions = {
  minAbsoluteSupport?: number
  minRelativeSupport?: number
  locale?: string
}

function sortSiblingGoalsBalanced(params: {
  siblingGoals: UiGoal[]
  allGoals: Map<string, UiGoal>
  options?: SortOptions
}): UiGoal[]
```

Hinweis: Für Subknoten-Signale braucht der Sorter Zugriff auf `allGoals`, nicht nur auf die lokale Geschwisterliste.

## Akzeptanzkriterien
1. Wenn `B` direkt `A` braucht (unter Geschwistern), steht `A` vor `B`.
2. Wenn keine harten/weichen Signale und keine Lernfluss-Unterschiede vorliegen, gilt reine Alphabet-Sortierung.
3. Unter gleich verfügbaren Knoten gilt didaktisch: `Warum ...?` vor Tutorial vor Flashcards vor Übungen.
4. Weiche Signale dürfen nur innerhalb gleich verfügbarer Knoten entscheiden.
5. Ergebnis ist bei gleicher Eingabe immer identisch.
6. Das Verhalten bleibt kompatibel mit den DAG-Validierungsregeln in CI.

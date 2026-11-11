## Knotensortierung unter „Meine Lernziele“ {#sec:dev-node-ordering}

Im lernendenseitigen Kompetenzbaum ([`CompetenceTree.tsx`](repo:app/src/components/CompetenceTree.tsx)) sortiert `sortSiblingGoalsBalanced` in [`goalSorter.ts`](repo:app/src/utils/goalSorter.ts) Geschwisterknoten unterhalb eines Clusters deterministisch so, dass Voraussetzungen vor abhängigen Zielen erscheinen und didaktische Klammern gewahrt bleiben.

### Harte `requires`-Topologiesortierung und sechsstufiger Tie-Breaker {#sec:dev-no-algorithm}

Für Geschwisterknoten eines Elternclusters (zyklenfrei bezüglich `requires`) führt `sortSiblingGoalsBalanced` eine Kahn-Topologiesortierung über **direkte `requires`-Kanten zwischen Geschwistern** aus und entscheidet Gleichstände in der Bereit-Menge streng sechsstufig:

| Stufe | Kriterium | Exakte Entscheidungsregel |
| --- | --- | --- |
| **1. Manuelle Ordnung** | Explizite Autorenvorgabe | Numerisches `extendedData.{treeOrder,sortOrder,displayOrder,order,position}` oder Tag `order:<n>`. |
| **2. Didaktischer Bucket** | Pädagogische Klammerung | `why` (Orientierung/Motivation) $<$ `tutorial` / Fachkompetenzen $<$ `flashcards` (Lernkarten) $<$ `exercises` / Prüfungen. |
| **3. Phasenfolge** | Curriculare Progression | `SekI` / `5`–`10` $<$ `E` $<$ `Q1` $<$ `Q2` $<$ `Q3` $<$ `Q4` $<$ `Abitur` / `GLOBAL`. |
| **4. Nachfahren-Support** | Weiche Teilbaum-`requires` | `softScore(v)` aus Nachfahren-Voraussetzungen, geschützt durch `minAbsoluteSupport = 2` und `minRelativeSupport = 0.25`, damit einzelne Randkanten große Themenblöcke nicht unerwartet umsortieren. |
| **5. Lokalisierter Titel** | Lesbare Rückfallordnung | Sprachsensitives `localeCompare` (`de-DE`, `numeric: true`). |
| **6. Kanonische ID** | Endgültige Deterministik | Lexikographischer Vergleich von `goal.id` für 100 % reproduzierbare Reihenfolge. |
{cols="20%,24%,56%"}

Während die reine Inhaltsbaum-Inspektion ([Sichtenprojektion](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)) die explizite `contains`- bzw. `treeOrder`-Reihenfolge abbildet, steuert `sortSiblingGoalsBalanced` die didaktische Lernansicht überall dort, wo kein manuelles `treeOrder` gesetzt ist.

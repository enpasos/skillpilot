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

### Erklärte Teilordnung und integrierte Lernkarte {#sec:dev-no-declared-order}

Die oben beschriebene Sortierung ist die Heuristik des Kompetenzbaums. In den mit [#160](https://github.com/enpasos/skillpilot/pull/160) gelieferten Länderansichten hat `childOrder.after` des Sourceformats 1.2 eine andere Aufgabe: Es erklärt die fachlich begründete Teilordnung zwischen Geschwistereinheiten. Der Composition-Compiler erhält sie als `compositionChildOrder`. `after` ergänzt weder `requires` noch den Zugang zur Frontier; es ändert keine gespeicherte Beherrschung. Ein autorisierter Erwerbsplatz für ein notwendiges Atom ist ebenso wenig eine zusätzliche Ordnungskante.

Die integrierte Lernkarte aus [#153](https://github.com/enpasos/skillpilot/pull/153) und [#162](https://github.com/enpasos/skillpilot/pull/162) zeigt Einheiten, ihre Ordnung und fachliche Rückgriffe. Der Lernzielbaum bleibt die Inhaltsnavigation. Ein aktivierter Stufenplan liefert gemeinsame Identitäten und verschachtelte Jahrgänge/Phasen; ohne aktivierte Planmetadaten bleibt die Kartenprojektion ausdrücklich vorläufig. Rote Rückgriffspfeile werden fachlich repariert und nicht durch Sortieren versteckt. Aktuelle Liefer- und Abnahmegrenzen stehen im [Management Summary](repo:docs/dev/stage-plan-management-summary.md).

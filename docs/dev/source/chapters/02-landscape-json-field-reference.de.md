## Landscape-JSON-Feldreferenz {#sec:dev-landscape-json}

Dieses Kapitel dokumentiert den feldscharfen Authoring- und Laufzeitvertrag für `SkillLandscape`-JSON-Dateien gegen [`docs/landscape-runtime.schema.json`](repo:docs/landscape-runtime.schema.json) und deren Abbildung auf `UiGoal` in [`goalTypes.ts`](repo:app/src/goalTypes.ts) (Knotensemantik in [Knotentypen](repo:docs/concept/skill-graph/node-types.md), Projektion in [Sichtenprojektion](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)).

### Top-Level-Felder einer `SkillLandscape` {#sec:dev-lj-top}

| Feld | Pflicht? | Zweck & Randbedingungen |
| --- | --- | --- |
| `landscapeId` | Ja | Global eindeutige, stabile Kennung der Skill-Landschaft. |
| `locale` | Ja | Primäre Autorensprache (`"de"` oder `"en"`). |
| `subject` | Ja | Kanonischer Fachschlüssel für Routing, Gruppierung und Asset-Pfade. |
| `title`, `description` | Ja | Titel und Kurzbeschreibung (`titleEn`, `descriptionEn` optional für englische Inline-Übersetzung). |
| `frameworkId`, `filters` | Optional | Institutioneller Rahmenbezeichner und auswählbare Scope-Filter (z. B. `GK`, `LK`, Bundesland). |
| `programUnits`, `goalPlacements`, `competencyCatalog` | Optional | Additive Projektions-Arrays (@ref{sec:dev-minimal-schema}); `programUnits` und `goalPlacements` deklarieren auch Lerneinheiten (@ref{sec:dev-lj-units}). |
| `learningUnitCoverage` | Optional | `partial` oder `complete`; fehlt es, gilt `partial` (@ref{sec:dev-lj-units}). |
| `goals` | Ja | Geordnetes Array von `LearningGoal`-Einträgen der `contains`- und `requires`-DAGs. |
{cols="26%,14%,60%"}

### `LearningGoal`, `dimensionTags` und Provenienzfelder {#sec:dev-lj-goal}

| Feldgruppe | Felder & Laufzeitbedeutung |
| --- | --- |
| **Identität & Texte** | `id` (stabile UUID, nie für neue Bedeutung wiederverwendet), optional landschaftsweit eindeutiges `shortKey`, `title` (`titleEn`), `description` (`descriptionEn`). |
| **Graphrelationen** | `contains` (geordnete Kind-IDs; leer `[]` = atomares Ziel, nichtleer = Cluster-Ziel) und `requires` (Voraussetzungs-IDs; Zielzustand rein atomar-zu-atomar). |
| **Klassifikation & Gewicht** | `weight` (Aufwands-/Fortschrittsgewicht), optional `core` (`boolean`), `courseLevel`, `tags` (`string[]`), `semanticKind` / `nodeKind` / `type`, `applicability` und `competencyRefs`. |
| **Fachliche Nutzdaten** | `examples`, `extendedData` (inkl. `applicabilityOverrides` und Sortierhinweisen), `examData` (`taskContent`, `solutionContent`, `scoring`) sowie `experimentData`. |
| **`dimensionTags`** | Strukturiertes Metadatenobjekt: `phase` (`E`, `Q1`–`Q4`, `SekI`, `GLOBAL`, Kompatibilitäts-/Badge-Feld), `demandLevel` (`AB1`–`AB3`), `processCompetencies`, `guidingIdeas`, `framework`, `area`, `topicCode`. |
| **Provenienz & Medien** | `sourceRef` (amtliche Fundstelle) und `resourceLinks` (`type: "curriculum"` oder `"goal-visualization"`, keine neuen Drittanbieterlinks an kanonischen Zielen; siehe [Quellen- & Ressourcenlinks](repo:docs/concept/skill-graph/source-and-resource-links.md)). |
{cols="26%,74%"}

Zur Laufzeit überführen Frontend-Loader `LearningGoal`-Objekte in `UiGoal` (`goalTypes.ts`) und werten Scope-Filter, Frontier-Verfügbarkeit, SRS-Decks und Mastery-Aggregation aus, ohne die stabilen JSON-Identitäten zu verändern.

### Lerneinheiten in der Platzierungsschicht {#sec:dev-lj-units}

Seit der Entscheidung des Product Owners vom 12. November 2026 gehören [Lerneinheiten](repo:docs/concept/skill-graph/learning-units.md) (Graph-Definition §11) zur Skill-Landschaft und werden in deren Platzierungsschicht deklariert. Der [Curriculum-Paketvertrag 1.2](repo:contracts/curriculum-package/v1.2/README.md) trägt sie; Bauten nach Vertrag 1.0 oder 1.1 lassen sie vollständig weg. Die bisherigen Arten von Programmeinheiten (`program`, `stage`, `year`, `phase`, `semester`, `module`, `track`, `exam`) und Platzierungsrelationen (`primary`, `secondary`, `assessed`) behalten ihre Bedeutung.

| Element | Autorenregel |
| --- | --- |
| **Einheit** | Ein `programUnits`-Eintrag mit `kind: "learningUnit"` und genau diesen Feldern: `id` (Slug in Kleinbuchstaben wie `math-dot-product-projection`), `label` und `promise` in der Autorensprache, `labelEn` und `promiseEn` auf Englisch, `revision` (datierte Revision der Einheitsdefinition, `YYYY-MM-DD-vN`), optional `parentUnitId`, `order` und `coverageReviews`. Das Lernversprechen sagt, was Lernende danach selbstständig können und wozu das nützt. Jedes weitere Feld ist ein Befund; `labelEn`, `promise`, `promiseEn`, `revision` und `coverageReviews` sind an anderen Arten nicht erlaubt. |
| **Hierarchie** | `parentUnitId` nennt die Lerneinheit, die diese Einheit als Kind verlangt. Beide Enden sind Lerneinheiten derselben Landschaft; eine Einheit hat höchstens ein Elternteil, und die Hierarchie muss azyklisch sein. Eine Voraussetzung ganzer Einheiten ist nicht ausdrückbar. |
| **Eigentum** | Ein `goalPlacements`-Eintrag mit `relation: "own"`, der `unitId` einer Lerneinheit und der `goalId` eines atomaren Ziels derselben Landschaft, ohne `context` und ohne weiteres Feld. Eine Lerneinheit nimmt keine andere Relation an, und ein Ziel hat höchstens eine besitzende Einheit. Eigentum ändert keinen sichtbaren Baum. |
| **Geprüfte Deckung (R2)** | Optional `coverageReviews` an der Lerneinheit: eine Liste von Objekten mit genau `assessmentGoalId` (eine eigene Prüfung der Einheit; höchstens ein Eintrag je Prüfung), `goalIds` (eigene gewöhnliche Ziele der Einheit, die diese Prüfung voraussetzt und in `coveredGoalIds` führt), `reference` (repository-relativer Pfad des Reviewprotokolls), `taskRevision` und `rubricRevision`. Die Revisionen sind `sha256:`-Hashes über UTF-8-JSON mit rekursiv sortierten Objektschlüsseln, unveränderter Array-Reihenfolge und kompakten Trennzeichen: `taskRevision` über `{taskContent, solutionContent}` der Prüfung, `rubricRevision` über ihr `scoring`. Reviewgebundene Inhalte verwenden nur ganze Zahlen. Jede Änderung an Aufgabe, Lösung oder Bewertungsraster macht das Review veraltet. Das Review gehört zum lokalen Vertrag der Einheit und ändert nie die Bytes eines Ziels; `examData` hat kein Reviewfeld. |
| **Deckungsanspruch** | Top-Level-Feld `learningUnitCoverage`: `partial` oder `complete`; fehlt es, gilt `partial`. `complete` behauptet, dass jedes atomare Ziel der Landschaft genau eine besitzende Lerneinheit hat. |
{cols="22%,78%"}

Eine Einheit kopiert keine Zieldaten: Zielarten, Voraussetzungen und `coveredGoalIds` bleiben an den Zielen. Voraussetzungen ganzer Einheiten, Zugangssperren und Erlasslisten sind nicht ausdrückbar. `npm --prefix app run validate:learning-units` ([validateLearningUnits.ts](repo:app/scripts/validateLearningUnits.ts); Regeln in [learningUnitContracts.ts](repo:app/scripts/lib/learningUnitContracts.ts)) prüft die Lerneinheiten der kanonischen Skill-Landschaften des Gymnasiums in der Pflicht-Curriculum-CI und scheitert bei jedem Befund: `LU-UNIT`, `LU-UNIT-ID` und `LU-PLACEMENT` für fehlerhafte Deklarationen; `LU-REF`, `LU-ATOMIC`, `LU-KIND`, `LU-EMPTY-SCOPE`, `LU-CHILD`, `LU-HIERARCHY` und `LU-GRAPH` für die Struktur; `LU-R1`, `LU-R3`, `LU-R4-MULTIPLE`, `LU-R4-UNOWNED` und `LU-R2-EVIDENCE` für die Gültigkeitsregeln. Fehlende geprüfte Deckung wird gemeldet, nicht abgelehnt. Die Laufzeit nutzt Lerneinheiten noch nicht; jedes Ziel wird weiterhin über sein eigenes explizites Ergebnis abgeschlossen.

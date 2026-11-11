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
| `programUnits`, `goalPlacements`, `competencyCatalog` | Optional | Additive Projektions-Arrays (@ref{sec:dev-minimal-schema}). |
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

## Curriculum-Autoreneditoren {#sec:dev-authoring-editors}

SkillPilot trennt lokale Autorenwerkzeuge im Vite-Entwicklungsserver strikt nach semantischer Schicht, statt kanonische Graphpflege, Lernkartenredaktion und Scope-Views in einer monolithischen Oberfläche zu vermischen.

### Vier lokale Vite-Editoren und Routenarchitektur {#sec:dev-ae-overview}

| Editor | Frontend-Route & Dev-Middleware | Verantwortete Artefaktschicht |
| --- | --- | --- |
| **Flashcard-Editor** (@ref{sec:dev-flashcard-editor}) | `/flashcard-editor` · `/__deck-editor/*` | `*_deck*.json`-Lernkartendecks (`curricula/...` + `app/public/data/`). |
| **Graph-Editor** (@ref{sec:dev-graph-editor}) | `/graph-editor` · `/__graph-editor/*` | Fokussiertes `requires`-Refactoring und Cluster-zu-Atomar-Auflösung in Landscape-JSONs. |
| **Canonical-Cluster-Editor** | `/canonical-cluster-editor` · `/__canonical-cluster-editor/*` | Kanonische `contains`-Clusterhierarchie, Kindreihenfolge und Clustermetadaten unter `curricula/DE/Gymnasium/canonical/`. |
| **Composition-View-Editor** | `/composition-view-editor` · `/__composition-view-editor/*` | Scope-spezifische `*.view.json`-Oberbäume (`structure`-Knoten + reine Cluster-`canonicalSubtree`-Verweise). |
{cols="26%,34%,40%"}

Sämtliche `/__*`-Schreibendpunkte existieren **ausschließlich** in der lokalen Vite-Dev-Middleware (`vite.config.ts`) und sind niemals Teil produktiver Builds.

### Drei-Spalten-Layout, blockierende Prüfungen vs. Warnungen und Phasenfolge {#sec:dev-ae-validation}

Beide V1-Struktureditoren nutzen ein Drei-Spalten-Layout (links Baumnavigation, mittig Knoten-/Referenz-Inspektor, rechts kompilierte Live-Vorschau samt Diagnose):

- **Blockierende Speicherprüfungen (Schreibabbruch):** Ungültiges JSON, doppelte IDs, `contains`-Zyklen, unaufgelöste `goalId`-Verweise, direkt in `.view.json` eingebettete atomare Ziele oder überlappende `canonicalSubtree`-Expansionen gegen das Einmalvorkommen ([Sichtenprojektion](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)).
- **Nicht-blockierende Warnungen (Speichern mit Diagnosehinweis):** Noch nicht eingebundene kanonische Cluster im Entwurf, `unplacedInScope`-Hinweise oder ausstehende Folge-Checks (`npm run validate:graph`, `validate:views`).
- **Vierstufige Umsetzung:** (1) Schreibgeschützter Baum- und Diagnose-Inspektor $\to$ (2) Speicherpfad `Canonical Cluster Editor` $\to$ (3) `.view.json`-Bearbeitung im `Composition View Editor` $\to$ (4) länderübergreifender Abdeckungsvergleich (bewusste Nicht-Ziele: Cloud-Mehrbenutzerbetrieb, automatisches KI-Umschreiben oder Bearbeitung von Lernständen).

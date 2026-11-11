## Allgemeines Zielsystem und schrittweise Migration {#sec:sga-goal-system}

Das langfristige Zielmodell von SkillPilot folgt zwei Leitprinzipien: **„So viel Semantik wie nötig, so wenig Ontologie wie möglich“** und **„Ziele sind stabil. Struktur ist kontextabhängig.“** Der formale mathematische Graphkern ist in [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md) spezifiziert; Projektionsregeln stehen in @ref{sec:sga-view-projection}, Laufzeit-Fallbacks in [Minimales Schema & Laufzeit-Fallback](repo:docs/dev/skill-graph-minimal-schema-runtime-fallback-and-math-pilot.md).

### Vier semantische Schichten plus eine Composition-View-Schicht {#sec:sga-gs-layers}

Statt Fachkompetenzen, Jahrgangscontainer und Prozesstaxonomien in einer undifferenzierten Hierarchie zu vermischen, trennt die Zielarchitektur vier semantische Schichten sowie eine lernendenseitige Projektionsschicht:

| Schicht | JSON- / Artefaktträger | Rolle und Invarianten |
| --- | --- | --- |
| **Zielschicht (Goal Layer)** | `goals[]`, `contains`, `requires` | Stabile prüfbare atomare Lernziele und fachliche Cluster; trägt Mastery, Frontier-Berechtigung und kanonische IDs. |
| **Programmschicht (Program Layer)** | `programUnits[]` (`id`, `kind`, `label`, `order`, `parentUnitId`) | Kontextuelle Struktureinheiten wie Jahrgang, Halbjahr, Modul, Phase, Zweig oder Prüfung; nie direkt beherrschbar. |
| **Verortungsschicht (Placement Layer)** | `goalPlacements[]` (`goalId`, `unitId`, `relation`, `context`) | Hängt unveränderte kanonische Ziele (`primary`, `secondary`, `assessed`) unter expliziten Scope-Kontexten in Programmeinheiten ein. |
| **Kompetenzachsenschicht** | `competencyCatalog[]` (`id`, `label`, `dimension`), `competencyRefs[]` | Orthogonale Kompetenztaxonomien (z. B. Prozesskompetenzen `K1`–`K6`); keine primären Inhaltseltern, sofern nicht eigenständig prüfbar. |
| **Composition-View-Schicht** | `*.view.json` (`structure`, `canonicalSubtree`, `goalEntry`) | Scope-spezifische obere Lernbäume, die geprüfte kanonische Teilbäume ohne Duplizierung von Zielinhalten referenzieren. |
{cols="22%,32%,46%"}

Interpretationsinvarianten:

- Jahrgangs-, Halbjahres-, Modul- und Phasencontainer bilden **nicht** das dauerhafte semantische Rückgrat des Skill-Graphen; `phase` bleibt als Kompatibilitäts- und Badge-Metadatum erhalten, nicht als kanonische Elternkante.
- Breite Kompetenzfamilien (`K1`–`K6`) sind Taxonomieachsen und keine Programmeinheiten; nur konkrete, prüfbare Prozessfertigkeiten werden echte `LearningGoal`-Knoten.
- Die anfängliche Eingrenzung durch Lernende (Bundesland, Schulform, Stufe, Dauer, Kursprofil) wirkt als **Einstiegsscope** über Programmeinheiten, Placements, Composition Views und kompilierte `applicability` ([Ebenen der Personalisierung](repo:docs/concept/levels-of-personalization.md)), niemals über duplizierte kanonische Ziele.

### Rekursive Lerneinheiten und schrittweise Migration {#sec:sga-gs-migration}

Rekursive Lerneinheiten (Graph-Definition §11, [Lerneinheiten](repo:docs/concept/skill-graph/learning-units.md); §12, [Optionale Planung](repo:docs/concept/skill-graph/planning-and-budget.en.md)) setzen auf denselben stabilen kanonischen Zielen auf:

1. Innerhalb eines aufgelösten Kurses besitzt jeder geplante atomare Kompetenzerwerb **genau eine direkt besitzende Einheit**; übergeordnete Einheiten aggregieren Kindziele, ohne deren Erwerb erneut zu besitzen.
2. In einer Kindeinheit beherrschte oder anerkannte Kompetenz gilt sofort **global**, auch solange eine übergeordnete Integrationsprüfung noch offen ist; lokale Anerkennung gilt ausschließlich für direkt besessene gewöhnliche Ziele in Einheiten, die die Gültigkeitsregeln R1–R5 vom 11. November 2026 erfüllen ([Graph-Definition §13.3](repo:docs/concept/skill-graph/assessment-gated-completion.md#sec-why-graph-not-enough)).
3. Das Bestehen einer übergeordneten Integrationsprüfung besteht niemals geschützte Kindprüfungen oder Lernkartendecks mit; eine explizite Blockfolge ganzer Einheiten ([Einheitsfolge](repo:docs/concept/skill-graph/learning-unit-progression.md)) wird getrennt von der atomaren `requires`-Azyklizität geprüft.

> [!NOTE]
> **Implementierungsgrenze:** Dieses Kapitel definiert die fachliche Schichtentrennung und den sechsstufigen inkrementellen Migrationspfad (additive optionale Schemafelder $\to$ Projektions-UI mit `phase`-Fallback $\to$ Pilotschnitt $\to$ Teilbaumübernahme $\to$ Composition-View-Cutover $\to$ Altsystem-Stilllegung), ohne einen Big-Bang-Umbau zu erzwingen oder einen bereits implementierten `LearningUnit`-Laufzeitcompiler zu behaupten.

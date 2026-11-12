## Minimal Projection Schema, Runtime Fallback, and Math Pilot {#sec:dev-minimal-schema}

To evolve existing landscapes into the layered architecture ([General Goal System](repo:docs/concept/skill-graph/general-goal-system-and-migration.md)) without breaking unmigrated curricula, SkillPilot introduces four optional additive JSON structures paired with deterministic runtime fallback rules.

### Additive Schema Fields and Fallback Precedence {#sec:dev-ms-schema}

```json
{
  "programUnits": [
    { "id": "sek2-e", "kind": "phase", "label": "E-Phase", "order": 10 }
  ],
  "goalPlacements": [
    {
      "goalId": "<uuid>",
      "unitId": "sek2-e",
      "relation": "primary",
      "context": { "jurisdiction": "DE-HE", "stage": "SekII" }
    }
  ],
  "competencyCatalog": [
    { "id": "K1", "label": "Mathematisch argumentieren", "dimension": "process" }
  ]
}
```

Goals additionally carry optional `competencyRefs: ["K1", ...]`. The same arrays also declare learning units: a `programUnits` entry of kind `learningUnit` owns atomic goals through `goalPlacements` of relation `own`, and the optional top-level `learningUnitCoverage` states whether every atomic goal has an owner (@ref{sec:dev-lj-units}). These entries attach no goal to the program tree, so the precedence below is unchanged. Runtime precedence follows strict non-destructive rules:

1. **Composition view first:** If a reviewed `.view.json` matches the resolved learner scope, compile the default tree from that composition view plus canonical `contains`.
2. **Explicit placement projection second:** Otherwise, when `programUnits` and matching `primary` `goalPlacements` exist, project the program tree directly from those arrays.
3. **Legacy `contains` / `phase` fallback third:** Landscapes without placement or view artifacts continue rendering their authored `contains` hierarchy and `dimensionTags.phase` badges unchanged.
4. **Unchanged mastery & frontier:** Mastery storage and `requires` frontier calculation always operate on canonical atomic `LearningGoal` IDs, never on `programUnits` or view structure nodes.

### Entry-Scope Resolution and Canonical Mathematics Pilot {#sec:dev-ms-pilot}

Entry-scope resolution executes in five deterministic steps: (1) select base root curriculum, (2) bind jurisdiction / duration / stage / course profile (`Level 2`), (3) resolve matching `.view.json` or placement context, (4) close required atomic prerequisites $L = \mathrm{Closure}(S)$ on the unpruned canonical graph, and (5) apply optional `Level 3` focus filters. `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json` serves as the reference pilot proving additive `programUnits`, `goalPlacements`, `competencyCatalog`, and state-scoped `.view.json` compilation side by side.

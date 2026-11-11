## Minimales Projektionsschema, Laufzeit-Fallback und Mathe-Pilot {#sec:dev-minimal-schema}

Um bestehende Landschaften ohne Bruch nicht migrierter Curricula in das Schichtenmodell ([Allgemeines Zielsystem](repo:docs/concept/skill-graph/general-goal-system-and-migration.md)) zu überführen, ergänzt SkillPilot vier optionale additive JSON-Strukturen mit deterministischer Laufzeit-Fallback-Reihenfolge.

### Additive Schemafelder und Fallback-Reihenfolge {#sec:dev-ms-schema}

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

Ziele tragen ergänzend optional `competencyRefs: ["K1", ...]`. Die Laufzeitauswertung folgt festen, rückwärtskompatiblen Regeln:

1. **Composition View zuerst:** Passt eine geprüfte `.view.json` auf den aufgelösten Scope, wird der Default-Baum aus Composition View plus kanonischem `contains` kompiliert.
2. **Explizite Placement-Projektion als Zweites:** Liegen `programUnits` und passende `primary`-`goalPlacements` vor, wird der Programmbaum direkt daraus projiziert.
3. **Klassischer `contains`- / `phase`-Fallback als Drittes:** Landschaften ohne View- oder Placement-Daten rendern unverändert ihre `contains`-Hierarchie und `dimensionTags.phase`-Badges.
4. **Unveränderte Mastery & Frontier:** Mastery-Speicherung und `requires`-Frontier arbeiten ausschließlich auf kanonischen atomaren `LearningGoal`-IDs, niemals auf `programUnits` oder View-Strukturknoten.

### Einstiegsscope-Auflösung und kanonischer Mathematik-Pilot {#sec:dev-ms-pilot}

Die Scope-Auflösung durchläuft fünf deterministische Schritte: (1) Basis-Curriculum wählen, (2) Bundesland / Dauer / Stufe / Kursprofil (`Level 2`) binden, (3) passende `.view.json` bzw. Placement-Kontext auflösen, (4) benötigte atomare Voraussetzungen $L = \mathrm{Closure}(S)$ auf dem unbeschnittenen kanonischen Graphen schließen und (5) optionale `Level 3`-Fokusfilter anwenden. `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json` dient als Referenzpilot für das Zusammenspiel aus `programUnits`, `goalPlacements`, `competencyCatalog` und bundeslandspezifischen `.view.json`-Dateien.

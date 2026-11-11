## Voraussetzungs-Reviewprozess (`requires`) {#sec:qal-requires-review}

Dieses Kapitel dokumentiert den wiederholbaren manuellen Autoren- und QA-Workflow zur Prüfung der Voraussetzungsqualität auf atomaren Lernzielen (`contains: []`): Ist der didaktische Lernsprung von den Voraussetzungen zum Ziel klein genug, und werden grobe oder irreführende Kanten durch präzise atomare Routen ersetzt?

### Übergangssemantik vs. kanonischer Zielzustand {#sec:qal-requires-semantics}

Das Report-Werkzeug `app/scripts/generateRequiresReport.ts` (`npm run report:requires`) macht beide Schichten des aktuellen Kompatibilitätsmodells mitsamt Herkunft sichtbar:

- **`direct requires`:** Unmittelbar am Atomziel selbst hinterlegte Voraussetzungen.
- **`effective requires`:** Direkte Voraussetzungen zuzüglich aller von Vorgänger-Clustern über `contains` geerbten Voraussetzungen.

Während diese Sicht für die Bestandsmigration unverzichtbar ist, bleibt der verbindliche Zielzustand eine rein atomare Voraussetzungsschicht $R \subseteq A \times A$ ([Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)).

### Sechsstufiger Prüf- und Reparaturablauf {#sec:qal-requires-workflow}

```bash
cd app
npm run report:requires -- \
  --input ../curricula/<...>/json/<file>.json \
  --decisions ../tmp/requires_decisions_<name>.json \
  --init-decisions
```

1. Entscheidungsgerüst erzeugen oder aktualisieren (Standardbericht: `../tmp/requires_findings_<curriculum>.md` mit Zusammenfassung, `not_ok`-Liste und Komplettanhang für `direct requires`, `effective requires` und Ursprungscluster/-ziele).
2. Für jedes Atomziel direkte und effektive Voraussetzungen samt Vererbungsursprung sichten.
3. Das **didaktische Delta** formulieren: Was kann die lernende Person nach den Voraussetzungen bereits, was kommt im Ziel neu hinzu, und ist dieser Zuwachs genau ein lehrbarer Schritt?
4. Entscheidung (`ok`, `not_ok`, `pending`) in der JSON-Datei erfassen (`not_ok` nur bei echtem didaktischem Problem wie zu großem Lernsprung, fachfremder Blockade oder verdeckter Cluster-Abhängigkeit — nicht für bloße Graph-Kosmetik):

```json
{
  "goals": {
    "<goalId-a>": { "status": "ok" },
    "<goalId-b>": {
      "status": "not_ok",
      "problem": "was didaktisch nicht traegt",
      "proposal": "wie die requires-Struktur repariert wird"
    },
    "<goalId-c>": { "status": "pending" }
  }
}
```

5. Bei `not_ok` eine der vier Standardreparaturen anwenden: (a) Brückenziel ergänzen, (b) Zielknoten aufteilen (@ref{sec:qal-atomic-review}), (c) Cluster-`requires` durch konkrete atomare Voraussetzungen ersetzen, oder (d) redundante bzw. überblockierende Kanten entfernen.
6. Nach den Änderungen `cd app && npm run validate:graph` ausführen.

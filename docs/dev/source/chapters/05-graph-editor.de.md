## Graph-Editor {#sec:dev-graph-editor}

Der lokale Graph-Editor (`/graph-editor`, implementiert in [`GraphEditorView.tsx`](repo:app/src/views/GraphEditorView.tsx) über die Vite-Dev-Middleware `/__graph-editor/{list,load,save}`) ist eine fokussierte Refactoring-Werkbank für `requires`-Voraussetzungen in `SkillLandscape`-JSON-Dateien.

### Fokussierter `requires`-Refactoring-Ablauf {#sec:dev-ge-workflow}

Statt eines freien Zeichenbretts unterstützt der Editor gezielt die kanonische `requires`-Bereinigung ($R \subseteq A \times A$; siehe [Graph-Definition](repo:docs/concept/skill-graph/graph-definition.md)):

- **Getrennte Voraussetzungsansicht:** Teilt die `requires`-Einträge des gewählten Ziels in **atomare Voraussetzungen**, **geerbte Cluster-Voraussetzungen** und **unaufgelöste/externe IDs**, sodass abzulösende Clusterkanten sofort sichtbar sind.
- **Geführte Cluster-zu-Atomar-Auflösung:** Zeigt die atomaren Nachfahren eines referenzierten Clusters, damit exakt benötigte Atomziele übernommen werden können, bevor die Clusterkante entfernt und transitiv reduziert wird.
- **In-Place-Speicherung (2-Space-JSON):** `/__graph-editor/save` schreibt formatiertes UTF-8-JSON mit zwei Leerzeichen Einrückung direkt in die Quelldatei unter `curricula/` zurück (ohne Spiegelkopie nach `app/public/data/`).

```bash
cd app
npm run dev
# Nach dem Speichern unter http://localhost:5173/graph-editor:
npm run validate:graph
```

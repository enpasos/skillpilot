## Graph Editor {#sec:dev-graph-editor}

The local Graph Editor (`/graph-editor`, implemented in [`GraphEditorView.tsx`](repo:app/src/views/GraphEditorView.tsx) backed by Vite dev middleware `/__graph-editor/{list,load,save}`) is a focused refactoring workbench for `requires` prerequisites in `SkillLandscape` JSON files.

### Focused `requires` Refactoring Workflow {#sec:dev-ge-workflow}

Rather than acting as a free-form canvas, the editor targets canonical `requires` hygiene ($R \subseteq A \times A$; see [Graph Definition](repo:docs/concept/skill-graph/graph-definition.md)):

- **Split prerequisite inspection:** Separates every selected goal's `requires` edges into **atomic prerequisites**, **legacy cluster prerequisites**, and **unresolved/external IDs** so legacy cluster links stand out immediately.
- **Guided cluster-to-atomic expansion:** Inspects the atomic descendants of a required cluster so authors can select the exact required atomic competencies before removing the legacy cluster edge and running transitive reduction.
- **In-place 2-space JSON persistence:** `/__graph-editor/save` writes formatted 2-space UTF-8 JSON directly back to the source file under `curricula/` without mirroring to `app/public/data/`.

```bash
cd app
npm run dev
# After saving changes in http://localhost:5173/graph-editor:
npm run validate:graph
```

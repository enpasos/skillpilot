# Graph Editor

The graph editor is a local developer tool for refactoring `requires` relations in landscape JSON files.
It runs inside the existing React app and uses local dev-only endpoints.

## Purpose

- inspect landscape files directly from `curricula/**/json/`
- find goals that still depend on non-atomic `requires`
- replace cluster-level `requires` with atomic descendants in a controlled way
- save the updated landscape JSON back to the source file

This tool is intentionally narrow.

It is **not** the planned authoring surface for:

- canonical cluster modeling
- scope-specific composition-view authoring
- learner-facing tree assembly

For that broader local authoring-tool split, see:

- `docs/dev/curriculum-authoring-editors.md`

## Start

```bash
cd app
npm run dev
```

Then open:

- `http://localhost:5173/graph-editor`

## Current implementation

- Route: `/graph-editor`
- Main view: `app/src/views/GraphEditorView.tsx`
- Dev API: `app/vite.config.ts`

The tool is intentionally focused on `requires` cleanup, not on full curriculum authoring.

## Supported workflow

- select one landscape JSON from `curricula/**/json/`
- search by goal ID or title
- optionally filter to goals with non-atomic `requires`
- inspect current `requires` split into:
  - atomic refs
  - cluster refs
  - unresolved refs
- expand cluster refs into their atomic descendants
- convert:
  - only the selected goal
  - the whole file
- add or remove refs manually before saving

## Save flow

1. Load one landscape JSON from `curricula/.../json/<file>.json`.
2. Modify `requires` refs in memory.
3. Save the file back to the same path with stable JSON formatting (two-space indentation and trailing newline).

Unlike the flashcard editor, there is no mirror target in `app/public/data/` because landscape files are edited in place.

## Dev API

The editor uses local Vite middleware endpoints:

- `GET /__graph-editor/list`
- `GET /__graph-editor/load?path=...`
- `PUT /__graph-editor/save`

These endpoints are dev-only and are not part of the production API surface.

## Safety rules

- Only landscape JSON files under `curricula/**/json/` are loadable.
- Deck files are excluded.
- Path traversal is blocked by server-side path resolution.
- The tool is intended for local maintenance, not end-user editing.

## Important limitation

The editor helps refactor `requires`, but it does **not** replace validation.
After saving, run:

```bash
cd app
npm run validate:graph
```

This catches structural issues such as cycles, broken references, and manifest mismatches.

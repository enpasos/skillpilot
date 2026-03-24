# Curriculum Authoring Editors

This document defines the recommended local authoring-tool split for curriculum maintenance inside the existing React app.

The key decision is:

- use one local editor for the canonical content graph
- use a second local editor for scope-specific learner-facing composition views

Do not merge both concerns into one generic "everything editor".

## Why two editors

The repository now distinguishes two different authoring layers:

- the **canonical subject graph**
- the **scope-specific composition view**

They should stay separate in tooling for the same reason they stay separate in the data model:

- canonical goals and clusters define the durable fachliche backbone
- composition views define learner-facing upper tree shapes for resolved scopes
- canonical authoring and composition authoring have different validation rules
- mixing them in one editor would make hidden reparenting and accidental duplication much more likely

This mirrors the established split in the concept docs:

- `docs/concept/curriculum-graph/graph-definition.md`
- `docs/concept/curriculum-graph/view-projection-and-goal-placement.md`

## Design objective

The local tooling should satisfy seven requirements:

1. It must be file-based and local-first, similar to the flashcard editor.
2. It must keep canonical content authoring separate from scope-specific view authoring.
3. It must show a live preview that uses the same compile and validation logic as the runtime.
4. It must block save on structural errors.
5. It must keep JSON formatting stable and predictable.
6. It must avoid introducing a generic backend authoring API too early.
7. It must be narrow enough in V1 that it is actually usable for daily maintenance.

## Relation to existing tools

Existing tools already cover adjacent needs:

- `docs/dev/flashcard-editor.md`
- `docs/dev/graph-editor.md`

Current role split:

- **Flashcard Editor**
  - local deck maintenance with live preview
- **Graph Editor**
  - local `requires` refactoring inside one landscape file
- **Canonical Cluster Editor**
  - local canonical cluster authoring
- **Composition View Editor**
  - local scope-specific default-tree authoring

The current graph editor should remain focused on `requires` cleanup.
It should not silently grow into a general canonical/view authoring surface.

## Recommended source-of-truth locations

### Canonical subject graphs

Recommended source paths:

- `curricula/DE/Gymnasium/canonical/*.json`

Examples:

- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`

### Composition views

Recommended new source path family:

- `curricula/DE/Gymnasium/composition-views/<subject-key>/*.view.json`

Examples:

- `curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-lk.view.json`
- `curricula/DE/Gymnasium/composition-views/mathematik/de-by-sekii-lk.view.json`

Rationale:

- composition views are not canonical graphs
- they are not Bundesland-owned raw source snapshots either
- they are explicit learner-facing assembly artifacts that reference the canonical graph

They therefore deserve their own directory family.

## Shared architecture principles

Both editors should follow the same operational pattern:

- run only in local development
- live inside the existing React app
- use dev-only Vite middleware endpoints for file I/O
- save directly back to the source file
- keep stable JSON formatting with two-space indentation and trailing newline

The preferred split is:

- server-side dev middleware handles only list/load/save and path safety
- client-side code handles preview compilation and validation by reusing shared TypeScript helpers

This keeps the I/O layer small and keeps projection rules visible in normal app code.

## Editor 1: Canonical Cluster Editor

### Purpose

The canonical cluster editor is the local tool for maintaining the fachliche cluster structure of canonical subject graphs.

It should support:

- creating new cluster goals
- renaming and describing cluster goals
- assigning and reordering `contains` children
- moving existing goals between canonical clusters
- inspecting descendants and parent relations

It should not be the main place for:

- `requires` refactoring
- provenance editing
- Bundesland-specific tree authoring
- `goalPlacement` mass editing

### Recommended route

- `/canonical-cluster-editor`

### Recommended file scope

V1 should initially load only:

- `curricula/DE/Gymnasium/canonical/*.json`

Later this can be generalized if other canonical families emerge.

### V1 workflow

1. Select one canonical subject file.
2. Search goals by ID, title, or `shortKey`.
3. Select one goal.
4. If the selected goal is a cluster, edit its local cluster payload and child order.
5. Preview affected subtree and resulting content tree order.
6. Run validation in-browser.
7. Save back to the source file.

### Recommended V1 UI layout

#### Left pane

- file selector
- search box
- canonical goal tree
- filters:
  - all goals
  - clusters only
  - roots only
  - goals with multiple parents

#### Center pane

- selected goal detail
- title / titleEn
- description / descriptionEn
- `shortKey`
- tags summary
- dimension summary
- parent list
- child list with explicit order

#### Right pane

- subtree preview
- descendant preview
- diagnostics panel
- save controls

### Recommended V1 editing capabilities

- edit cluster `title`
- edit cluster `titleEn`
- edit cluster `description`
- edit cluster `descriptionEn`
- edit cluster `shortKey`
- reorder direct `contains` children
- add an existing goal as direct child
- remove a direct child
- create a new empty cluster goal
- move a goal from one cluster to another by editing `contains`

### Recommended V1 restrictions

- do not edit atomic-goal payload beyond parent assignment in V1
- do not edit `requires` in this editor
- do not edit `goalPlacements` in this editor
- do not edit provenance registries in this editor
- do not auto-generate placement or view changes from cluster edits

### Canonical Cluster Editor validations

The editor should block save on at least these error classes:

- broken goal references in `contains`
- duplicate direct child references
- `contains` cycles
- direct self-parenting
- explicit `type` mismatch against structural leaf/non-leaf status
- empty cluster after edit, if the cluster is intended to stay structural

The editor should surface, but not necessarily block on, these warnings:

- multiple direct parents for a goal
- Hessen-looking or state-looking labels in canonical titles
- missing `shortKey`
- missing English fields where the surrounding file already uses them

### Save flow

1. Save back to the selected canonical source JSON.
2. Do not mirror the file to `app/public/data/`.
3. After save, recommend:

```bash
cd app
npm run validate:graph
npm run validate:view-filters
```

For reviewed canonical sets, `validate:view-filters` is especially important because cluster changes can invalidate compiled learner trees.

### Recommended dev endpoints

- `GET /__canonical-cluster-editor/list`
- `GET /__canonical-cluster-editor/load?path=...`
- `PUT /__canonical-cluster-editor/save`

These endpoints should:

- only allow paths under `curricula/DE/Gymnasium/canonical/`
- reject path traversal
- keep formatting stable

## Editor 2: Composition View Editor

### Purpose

The composition view editor is the local tool for authoring learner-facing default trees for resolved scopes without changing the canonical graph.

It should support:

- creating structure nodes such as `Sekundarstufe II`, `E-Phase`, `Q1`
- attaching canonical subtree references
- ordering view children explicitly
- previewing the compiled default tree
- validating single occurrence and subtree non-overlap before save

It must not support:

- authored atomic goals inside the view file
- new canonical `requires` edges
- hidden reparenting heuristics

### Recommended route

- `/composition-view-editor`

### Recommended V1 file shape

V1 should use an explicit and machine-simple structure:

```json
{
  "viewId": "de-he-sekii-math-lk",
  "landscapeId": "canonical-math-de",
  "scope": {
    "jurisdiction": "DE-HE",
    "schoolForm": "Gymnasium",
    "stage": "SekII",
    "courseProfile": "LK"
  },
  "rootNodes": [
    {
      "kind": "structure",
      "id": "sek2",
      "label": "Sekundarstufe II",
      "children": [
        {
          "kind": "structure",
          "id": "e-phase",
          "label": "E-Phase",
          "children": [
            {
              "kind": "canonicalSubtree",
              "goalId": "550e8400-e29b-41d4-a716-446655440100"
            }
          ]
        }
      ]
    }
  ]
}
```

During local editing, the tool may internally resolve `landscapeId` to one canonical source file path.
That source-path resolution should remain editor/runtime metadata and should not be serialized into the composition view itself.

### Recommended V1 workflow

1. Select one composition-view file or create a new one.
2. Select the referenced canonical subject landscape.
3. Edit scope metadata.
4. Build the learner-facing upper tree from:
   - structure nodes
   - canonical subtree references
5. Preview compiled tree output.
6. Run overlap and single-occurrence validation.
7. Save only if the compiled default tree is valid.

### Recommended V1 UI layout

#### Left pane

- view file selector
- canonical subject selector
- scope summary
- search for canonical cluster roots

#### Center pane

- editable composition tree
- add structure node
- add canonical subtree reference
- reorder children
- delete node

#### Right pane

- compiled default-tree preview
- diagnostics panel
- selected-node detail

### Recommended V1 editing capabilities

- edit `viewId`
- edit `scope`
- add/remove structure nodes
- edit structure-node `label`
- reorder structure-node children
- attach/detach canonical subtree refs
- inspect resolved subtree contents

### Recommended V1 restrictions

- canonical subtree references must point to canonical cluster goals, not atomic goals
- no inline authored goal payload
- no `requires`
- no `goalPlacements`
- no duplication of the same canonical subtree root inside one view

### Composition View Editor validations

The editor should block save on at least these error classes:

- invalid or missing scope metadata
- missing canonical referenced root
- referenced root is atomic instead of cluster
- overlapping expanded canonical subtrees
- compiled default tree contains one goal more than once
- compiled default tree gives one goal more than one visible parent
- orphaned structure node with empty children if the node is intended to be structural

The editor should surface, but not necessarily block on, these warnings:

- structure nodes with generic labels such as `Cluster 1`
- referenced canonical roots whose titles still look state-specific
- view scope that is broader than intended, for example missing `jurisdiction` or `stage`

### Save flow

1. Save back to the selected `.view.json` file.
2. Keep the view JSON separate from canonical landscape JSON.
3. Save only after successful compile and validation of the resolved default tree.

### Recommended dev endpoints

- `GET /__composition-view-editor/list`
- `GET /__composition-view-editor/load?path=...`
- `PUT /__composition-view-editor/save`

These endpoints should:

- only allow paths under `curricula/DE/Gymnasium/composition-views/`
- reject path traversal
- keep formatting stable

## Shared preview and validation helpers

The two editors should share helper logic where that is actually the same concern.

Good shared helpers:

- file list/load/save utilities
- canonical goal lookup utilities
- descendant expansion
- subtree overlap checks
- compiled learner-tree preview
- single-occurrence validation
- stable JSON formatting

Bad shared helpers:

- a giant mutable editor state model that tries to cover both canonical and view editing
- one generic "node editor" that edits canonical goals and view nodes with the same forms

## Recommended implementation order

### Phase 1

Build the **Canonical Cluster Editor** first.

Why first:

- the canonical graph is already the active source of truth
- cluster quality problems are currently the more immediate authoring pain
- it can reuse patterns from the current graph editor without introducing view-file compilation yet

### Phase 2

Extract the shared compiled-tree preview and validation helpers so that:

- runtime
- validator
- future composition-view editor

all use the same compile contract.

### Phase 3

Build the **Composition View Editor** once:

- the view file schema is stable enough
- compiled preview is already reusable

### Phase 4

Optionally add cross-links between tools:

- from a canonical cluster to composition views that reference it
- from a composition view node to the referenced canonical cluster

Do this only after the two basic editors are stable.

## Non-goals for V1

- no production authoring API
- no multi-user editing
- no optimistic concurrent merge workflow
- no inline provenance editing
- no cross-subject composition views in the first iteration
- no attempt to replace the existing graph editor

## Decision summary

The recommended local authoring-tool architecture is:

- **Flashcard Editor** for deck JSON
- **Graph Editor** for `requires` refactoring
- **Canonical Cluster Editor** for canonical content-tree maintenance
- **Composition View Editor** for scope-specific learner-facing default trees

This is the narrowest tool split that still matches the data model and keeps validation understandable.

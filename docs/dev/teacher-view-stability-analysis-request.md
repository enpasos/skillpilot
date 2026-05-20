# Teacher View Stability Analysis Request

## Purpose

This document is an external analysis request for the current instability of the SkillPilot teacher UI.

The goal is not another superficial patch, but a clean technical diagnosis of why the teacher experience is currently unstable and sluggish, plus a concrete stabilization plan.

## Problem Summary

The teacher UI is currently unstable enough to be considered a release blocker.

Observed symptoms:

- The teacher view intermittently jumps between:
  - the class detail view, and
  - the teacher dashboard / empty class overview.
- The middle learning-context tree sometimes disappears completely although a class is selected.
- The structure switch (`Inhalte` / `Kompetenzen`) has shown oscillating behavior and inconsistent state.
- The UI feels sluggish and unstable overall.
- The class creation flow has shown context mismatch behavior:
  - after choosing a high-level curriculum such as `Gymnasium (DE)`, the teacher still saw the full global landscape list instead of the subject list inside that curriculum.
- Historical state stored in browser local storage has repeatedly interfered with current behavior.
- PWA/service-worker caching may amplify the perception because outdated bundles remain active after fixes.

In short:

- the teacher UI currently has state management problems,
- context resolution problems,
- and likely redundant or conflicting synchronization paths.

## Current User-Facing Severity

Severity: High

Why this is critical:

- The teacher cannot reliably trust what is shown on screen.
- The screen state can change unexpectedly.
- Core workflows such as opening a class, seeing the tree, switching student, or switching structure become unreliable.
- This undermines the usability of the teacher cockpit as a professional tool.

## Main Suspected Problem Class

The problem does **not** currently look like a pure curriculum-data issue.

The more likely class of issue is:

- conflicting frontend state sources,
- remount/hydration effects,
- URL synchronization side effects,
- localStorage restoration races,
- teacher-context migration logic,
- and PWA stale-bundle behavior.

The likely core architectural smell is:

> the same teacher context is influenced by too many channels at once.

Relevant channels include:

- React local state,
- URL search params,
- route params,
- localStorage,
- migrated stored teacher class sessions,
- active landscape selection in app core,
- active goal selection,
- active student selection,
- and tree projection mode.

## Relevant Areas in Code

Primary files to inspect:

- [TrainerView.tsx](/home/enpasos/projects/skillpilot/app/src/views/TrainerView.tsx)
- [useAppCore.ts](/home/enpasos/projects/skillpilot/app/src/hooks/useAppCore.ts)
- [App.tsx](/home/enpasos/projects/skillpilot/app/src/App.tsx)
- [ClassSetup.tsx](/home/enpasos/projects/skillpilot/app/src/components/ClassSetup.tsx)
- [trainerLandscapeContext.ts](/home/enpasos/projects/skillpilot/app/src/utils/trainerLandscapeContext.ts)
- [CompetenceTree.tsx](/home/enpasos/projects/skillpilot/app/src/components/CompetenceTree.tsx)
- [useLandscapes.ts](/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts)

Secondary context:

- [general-goal-system-and-migration.md](/home/enpasos/projects/skillpilot/docs/concept/curriculum-graph/general-goal-system-and-migration.md)
- [landscapeTypes.ts](/home/enpasos/projects/skillpilot/app/src/landscapeTypes.ts)

## Recent Changes That May Be Relevant

The teacher area has recently undergone several changes, including:

- migration from legacy/compatibility curriculum IDs toward canonical Gymnasium subject landscapes,
- class-session migration logic based on old saved teacher state,
- root-goal selection fallback logic,
- teacher learner selection rewiring,
- class setup landscape scoping,
- local removal of the structure-mode toggle from learner view,
- localization and notification cleanup,
- partial movement from client-side filtering toward server-side scoped learner graph loading,
- placement-based structural projections and competency-axis projections.

This means the teacher view is currently sitting on top of a moving architecture.

## Reproduction Examples

Typical reproduction paths that have shown unstable behavior:

1. Open teacher role.
2. Open an existing class such as `Mathe LK`.
3. Observe:
   - no tree appears in the middle panel, or
   - the UI jumps back to the teacher dashboard.

Other repros:

1. Open teacher role.
2. Switch between `Alle` and a specific student.
3. Observe inconsistent content pane / tree behavior.

Another repro:

1. Open teacher role.
2. Use class setup.
3. Expect subject choices inside `Gymnasium (DE)`.
4. Observe global landscape list instead.

Another repro:

1. Open teacher class with math.
2. Toggle `Inhalte` / `Kompetenzen`.
3. Observe oscillation, wrong active state, or empty view.

## What Has Already Been Tried

Several local fixes have already been attempted, including:

- mapping legacy teacher landscape IDs to canonical IDs,
- migrating stored teacher class sessions,
- reconstructing missing teacher `landscapeId` values from class names,
- moving teacher classes/active class restoration into initial state to reduce visible dashboard/detail flicker,
- removing the learner-facing structure toggle,
- removing global URL synchronization of structure mode and keeping it local to teacher view,
- narrowing class setup landscape choices to the current curriculum context.

These changes improved individual symptoms, but the teacher area is still perceived as too unstable.

## What We Need From The External Expert

We need a focused technical analysis with the following outputs.

### 1. Root Cause Analysis

Please identify the real causes behind:

- teacher view/dashboard jumping,
- missing middle tree,
- structure-mode instability,
- sluggishness,
- and context inconsistency.

Please do not stop at symptoms. We need the actual state-flow failure modes.

### 2. State Ownership Model

Please answer:

- Which component or hook should be the single source of truth for teacher context?
- Which state should live:
  - in route params,
  - in search params,
  - in local component state,
  - in app-core state,
  - in localStorage,
  - and nowhere at all?

We need a crisp ownership model, not a best-effort sync mesh.

### 3. Race / Remount Analysis

Please inspect whether the instability is caused by:

- teacher remounts,
- localStorage hydration after initial render,
- route transitions,
- context updates triggering selection resets,
- effect ordering,
- or React StrictMode / double-render sensitivity.

### 4. Simplification Recommendations

Please propose the minimal architecture that makes the teacher cockpit stable.

We are explicitly open to removing behavior if it reduces instability.

### 5. Performance Analysis

Please assess:

- whether the teacher tree does too much work on mount,
- whether tree projection/filtering is still too expensive,
- whether repeated projection or recomputation causes UI lag,
- and whether large graph state is being recalculated unnecessarily.

### 6. Concrete Remediation Plan

Please provide:

- a prioritized fix plan,
- expected impact of each fix,
- and which changes are safe vs. risky.

## Non-Goals

Please do **not** spend time primarily on:

- content quality of the curriculum data,
- wording of nodes,
- didactic structure decisions,
- or broader canonical-graph modeling philosophy.

Those are not the blocker here.

The blocker is teacher UI stability.

## Desired Deliverables

Please deliver:

1. A short diagnosis summary.
2. A state-flow diagram or equivalent explanation.
3. A list of concrete root causes.
4. A prioritized remediation plan.
5. A recommendation on what should be removed or simplified.
6. A recommendation for verification:
   - unit tests,
   - integration tests,
   - manual repro checklist,
   - optional runtime instrumentation.

## Suggested Diagnostic Questions

The analysis should explicitly answer these questions:

- Why can the teacher land in dashboard state although a class is selected?
- Why can a selected class still end up with no visible tree?
- Which side effect can overwrite teacher context after the user has already made a selection?
- Which parts of teacher context are currently duplicated?
- Which sync path should be deleted instead of repaired?
- Is the structure-mode toggle fundamentally worth keeping in teacher view in its current form?
- How much of the current sluggishness is due to rendering cost vs. state churn?

## Practical Expectation

We are not looking for “one more patch”.

We want an expert to tell us:

- what the stable teacher architecture should be,
- what must be removed,
- what should remain,
- and in which order the teacher cockpit should be simplified and stabilized.

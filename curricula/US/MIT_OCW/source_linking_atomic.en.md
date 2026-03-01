# MIT OCW Atomic Source Linking Plan

## Objective
Create intensive, auditable source linking at **atomic goal** level so each atomic competence can be traced to concrete OCW learning resources.

Design benchmark for atomic quality:
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json`

## Atomic Linking Standard (Mandatory)
For every atomic goal (leaf node, i.e. no `contains` children):
- `sourceRef`: primary concept source (deep link where possible).
- `extendedData.sourceLinks`: structured source metadata list.

Minimum link coverage per atomic goal:
1. `concept` link (lecture notes, readings, core explanation).
2. `practice` link (problem set, studio, assignment, recitation task).
3. `assessment` link (exam/quiz) if available on OCW page.
4. `license` link (course-level legal anchor) inherited at module level is acceptable.

Atomic decomposition requirements (copied from Hessen-style practice):
- The atomic node expresses exactly one assessable skill operation.
- Description is learner-facing and operational (`The learner can ...`).
- One atomic should be checkable in 1-3 concrete tasks.
- Atomic nodes should form a short didactic chain with local prerequisites only.

## Structured Link Schema (in `extendedData.sourceLinks`)
Each entry should follow this shape:

```json
{
  "id": "ocw:18.01sc:limits:concept",
  "type": "concept",
  "title": "Limits and continuity notes",
  "url": "https://ocw.mit.edu/...",
  "resourceType": "lecture-notes",
  "license": "CC-BY-NC-SA-4.0",
  "checkedAt": "2026-03-01"
}
```

Allowed `type` values:
- `concept`
- `practice`
- `assessment`
- `solution`
- `interactive`
- `license`

Allowed `resourceType` examples:
- `lecture-notes`
- `readings`
- `problem-set`
- `studio`
- `exam`
- `exam-solution`
- `video`
- `recitation`
- `interactive-applet`

## Coverage Targets
Per module:
- >= 95% of atomic goals have `concept` + `practice` links.
- >= 80% of atomic goals have `assessment` or `solution` links (if OCW provides them).
- 100% of atomic goals have at least 2 total source links.

## Quality Checks
- URL is live and course-consistent (`ocw.mit.edu/courses/...`).
- Link granularity is atomic-goal specific (not only course homepage).
- IDs are stable and reusable across exports.
- Duplicate links are deduplicated by `id`.
- Atomic text quality check: no broad umbrella statements; action verb + measurable outcome required.

## Rollout Plan
1. Add `extendedData.sourceLinks` to all atomic goals in top modules:
   - 18.01SC, 18.02SC, 18.05, 18.06, 6.100L.
2. Extend to 6.0002 and 6.006.
3. Add module-level coverage report to `work_notes.md`.
4. Add CI check (later) for minimum atomic source-link coverage.

## Rollout Status
- 2026-03-01: Step 1 completed (top-5 modules fully linked on atomic level).
- 2026-03-01: Step 3 completed (coverage snapshot in `work_notes.md`).
- 2026-03-01: Step 2 completed (same linking depth applied to 6.0002 and 6.006).
- 2026-03-01: CI guard added as `GVR-007` in `app/scripts/validateGraph.ts`.

## Open Decisions
- Whether link integrity should be checked in CI (head request) or manual QA only.

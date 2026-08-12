# Levels of Personalization

This document describes how SkillPilot narrows from a curriculum catalog to
individual mastery. Catalog navigation precedes the four personalization
levels and must not be stored as learner scope.

## Before Level 1: Catalog Navigation

The learner first chooses a catalog area such as **school**,
**university and higher education**, or **languages and continuing
education**. This is navigation for finding an appropriate curriculum, not a
personalization decision inside that curriculum.

## Level 1: Base Curriculum

The learner selects one published root curriculum. It provides the complete
goal universe from which later levels narrow without copying or changing
canonical learning goals.

- School example: `Gymnasium (DE)`.
- University example: a particular degree-program catalog.
- Language example: a particular CEFR landscape.

### Curriculum Manifest (Root Curricula)

Only explicitly declared root curricula are selectable in the UI and valid for
Champion registration. These are listed in
`curricula/curriculum_manifest.json` with readable titles.

Example:

```json
{
  "curricula": [
    { "id": "a0e13c56-c25f-4742-9272-3a1a603ee52e", "title": "Gymnasium (DE)" }
  ]
}
```

Rules:

- Each ID must exist as a landscape in `curricula/`.
- IDs must not be module landscapes or contained sub-landscapes.
- The manifest must match the computed set of root curricula; CI fails if it
  does not.

## Level 2: Personal Curriculum

The Personal Curriculum is the learner's committed, longer-lived scope within
the Base Curriculum. It records which authored curriculum view applies; it is
not the learner's temporary topic or year focus.

For a school curriculum, the semantic selection order is:

1. jurisdiction, including an explicit canonical view where available;
2. duration model such as G8 or G9, when relevant for that jurisdiction;
3. stage: lower secondary, upper secondary, or explicitly both;
4. the relevant subjects;
5. course profile per selected subject, when applicable.

Course profile is a subject attribute: Mathematics LK and Physics GK may
coexist, and LK never implies upper secondary. Missing stage information must
not silently become a cross-stage choice. If the intended scope is ambiguous,
the learner must be asked whether only one stage or both stages are intended.

Level 2 resolves the applicable learner-facing composition view and defines
the candidate space for focus, frontier, progress, and completion. A Level 2
change revalidates the current focus and active goal, but it does not rename
goals, change stable goal IDs, or erase global mastery values.

### One first-party editor contract

Level 2 is configured only through SkillPilot's first-party WebGUI:

- on the start screen, after Base Curriculum selection and before learning
  starts;
- in the Cockpit, for later adjustments.

Both surfaces use the same backend-owned option sources, validation,
normalization, summary, and save semantics. The current OpenAI V1 ChatClient
neither presents nor mutates Level 2. If the configuration is missing or
incomplete, it stops fachliches Coaching and sends the learner back to the
first-party flow instead of asking configuration questions in chat.

## Level 3: Learning Focus and Active Goal

Level 3 is deliberately easy to change and has two related parts:

- **Level 3a — focus:** one or more scope roots that select the current
  learning corridor, for example Jahrgangsstufe 7, Q1, or Analysis. A year or
  phase is program structure, not itself a learning goal.
- **Level 3b — active atomic goal:** exactly one concrete, assessable learning
  goal that is the immediate working target.

The learner or coach can reset the focus whenever the current need changes,
without rewriting the Personal Curriculum.

Focus widening follows the learner-facing path from the current focus toward
its root. The backend publishes only valid broader ancestors that still add
unmastered `target` goals, with the nearest suitable ancestor first. A coach
uses those fresh options unchanged; it does not infer hierarchy or IDs.
If the focus has several roots, a broader option replaces only the roots covered
by that ancestor and carries all independent roots forward in its ordered
`goalIds` payload.
The automatic proposal is opened only when the current focus is actually
complete. An empty frontier alone is insufficient because it may represent a
blocked, incomplete focus. The coach offers the first option and changes focus
only after learner acceptance.

All `target` goals in the Personal Curriculum remain intended learning goals.
A narrower focus changes only the current corridor. In particular, `requires`
is directional: mastery of a dependent goal does not imply mastery of an
unmastered prerequisite. After widening, every newly included unmastered target
participates in normal frontier calculation according to its own effective
prerequisites.

## Level 4: Mastery

Mastery is the learner's durable progress on stable atomic goal IDs. It remains
global across composition views and Level 2 or Level 3 changes. Cluster
progress is derived from atomic descendants; it is not a separate scope-local
mastery record.

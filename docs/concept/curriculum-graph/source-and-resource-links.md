# Source And Resource Links

This document defines the canonical goal-level link model for SkillPilot.

The design goal is simple:

- one field for **provenance**
- one field for **helpful learning resources**
- one model that works for both **Cockpit** and **AI tutors**

## 1. Two concerns, two fields

At goal level, SkillPilot distinguishes:

- `sourceRef`
  - the canonical provenance/source-of-truth reference for why the goal exists
  - examples: curriculum PDF citation, official module page, MIT OCW course page
- `resourceLinks`
  - ordered helpful learning resources for learners, teachers, Cockpit, and GPT tutors
  - examples: deep links to notes, videos, simulations, problem sets, exams, book pages

This separation is intentional:

- provenance answers: "Where does this goal come from?"
- resource links answer: "What would help someone learn or teach this goal?"

## 2. Canonical goal-level link structure

`resourceLinks` is the canonical structured list for helpful goal-level resources.

Minimal shape:

```json
{
  "type": "concept",
  "title": "Physik Libre: Ladung und Reibungselektrizitaet",
  "url": "https://physikbuch.schule/electricity.html#ladung-und-reibungselektrizitaet"
}
```

Recommended optional fields:

- `resourceType`
- `provider`
- `sections`
- `description`
- `lang`
- `license`

Recommended `type` values:

- `overview`
- `concept`
- `practice`
- `assessment`
- `solution`
- `reference`

Recommended `resourceType` values:

- `course-page`
- `video`
- `notes`
- `article`
- `simulation`
- `problem-set`
- `exam`
- `solution-set`
- `book`
- `tool`

The order inside `resourceLinks` is meaningful and should reflect pedagogical priority.

## 3. Authoring guidance

Do not attach all available links everywhere.

- Root or cluster nodes are the right place for:
  - course homepages
  - module overviews
  - book recommendations
  - broad lecture series
- Atomic nodes are the right place for:
  - precise deep links that clearly help with that exact goal
  - typically 1 concept link
  - optionally 1 practice link
  - optionally 1 assessment or solution link

This matters especially for large OER sources such as MIT OpenCourseWare. The model should stay useful, not noisy.

## 4. Runtime behavior

The same canonical model should serve two consumers:

- **Cockpit**
  - show ordered helpful resources in goal detail views
- **AI tutors / API**
  - expose the same links as machine-readable `resourceLinks`
  - prefer full link payload on the active goal
  - frontier and goal-option responses may stay compact

Runtime may use parent-cluster links as a fallback when an atomic goal has no strong local links, but the data model itself does not define hard link inheritance semantics.

## 5. Storage rules

The supported goal-level resource field is:

- `resourceLinks`

Storage direction:

- new landscapes should write `resourceLinks`
- committed landscape JSON in this repository should use only this goal-level resource field
- runtime link rendering and runtime models are aligned to this canonical field

`sourceRef` remains separate and should not be overloaded with long helper-link lists.

## 6. Practical examples

- Hessen physics:
  - `sourceRef` can point to the KC PDF or citation
  - `resourceLinks` can point to `physikbuch.schule` deep links
- MIT OCW:
  - `sourceRef` can point to the canonical OCW course page
  - `resourceLinks` can contain lecture videos, notes, problem sets, exams, solutions, and selected book references

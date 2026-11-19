## Levels of Personalization {#sec:levels-of-personalization}

This chapter specifies how SkillPilot narrows from the published curriculum catalog down to individual atomic mastery. Catalog navigation precedes the four personalization levels and is never persisted as learner scope.

The four levels describe a learner’s choices and individual record. [Learning units](repo:docs/concept/skill-graph/learning-units.md) organise content in the selected educational context. A unit can be chosen as a focus. What completing it demonstrates is a separate subject-matter question.

### Before Level 1: catalog navigation {#sec:personalization-catalog}

Learners first choose a catalog area such as **school**, **university and higher education**, or **languages and continuing education** to locate an appropriate root curriculum. This step aids discovery only and stores nothing on the learner record.

### Level 1: Base Curriculum {#sec:personalization-level1}

The learner selects one published root curriculum providing the complete goal universe from which subsequent levels narrow without copying or altering canonical goals (for example `Gymnasium (DE)`, a university degree catalog, or a CEFR language skill landscape).

Only root curricula explicitly listed in `curricula/curriculum_manifest.json` are selectable in the UI and eligible for Champion registration:

```json
{
  "curricula": [
    { "id": "a0e13c56-c25f-4742-9272-3a1a603ee52e", "title": "Gymnasium (DE)" }
  ]
}
```

Every manifest ID must exist under `curricula/`, must never point to a module or contained sub-landscape, and is verified by CI against the computed root set.

### Level 2: Personal Curriculum {#sec:personalization-level2}

The Personal Curriculum is the learner's committed, durable scope inside the Base Curriculum — defining which authored curriculum view applies rather than temporary study focus. For German school curricula, the semantic selection order is:

1. **Jurisdiction** (including an explicit canonical view where available);
2. **Duration model** (such as G8 or G9 where relevant);
3. **Stage** (lower secondary, upper secondary, or explicitly both);
4. **Selected subjects**;
5. **Course profile per selected subject** (where applicable).

The selection supplies the atomic seed goals $S$. The personal learning basis $L$ contains $S$ and all prerequisites transitively required in the canonical graph, including necessary goals from another subject. Changing focus leaves this basis intact.

Course profile is a per-subject attribute: Mathematics `LK` and Physics `GK` may coexist, `LK` never implies upper secondary, and missing stage data never silently defaults to cross-stage scope. Level 2 resolves the applicable composition view and bounds focus, frontier, progress, and completion; changing Level 2 revalidates focus and `activeGoal` without altering canonical goal IDs or erasing global mastery.

**Single first-party editor contract:** Level 2 is edited exclusively in SkillPilot's first-party WebGUI (on the start screen before launching a session and in the Cockpit afterward) over shared backend validation, normalization, and save rules. The OpenAI ChatClient neither presents nor mutates Level 2; if configuration is incomplete, it halts domain coaching and refers the learner back to the WebGUI.

### Level 3: Learning Focus and Active Goal {#sec:personalization-level3}

Level 3 is intentionally lightweight and comprises two parts:

- **Level 3a — Focus:** one or more scope roots selecting the active learning corridor (such as Grade 7, Q1, or Analysis; structural program units are not themselves canonical goals).
- **Level 3b — Active atomic goal:** at most one concrete, assessable atomic goal serving as the immediate working target.

Focus widening follows the learner-facing ancestor path toward the root: the backend publishes valid broader ancestors that add unmastered `target` goals (nearest suitable ancestor first, preserving independent multi-root corridors in `goalIds`), and automatic widening is proposed only upon genuine completion of the current focus (never merely because the frontier is blocked), requiring learner confirmation.

Choosing a higher entry level describes what the learner wants to work on. A focus change or a `requires` edge supplies no evidence for earlier units or their goals. When a learner attempts an offered assessment directly, only a successful attempt provides an assessment result. See @ref{sec:workflow-step4} for the learning route and the unit proposal.

### Level 4: Mastery and the orthogonal timeline axis {#sec:personalization-level4}

A durable learner result belongs to the stable UUID of the atomic goal and survives changes to subject view, Personal Curriculum and focus. An individual goal has a binary outcome contract. Aggregate progress needs a stated scope and counting rule. The current learning plan can be set to credit only explicitly achieved goals. Work waived in a particular scope creates no stored success for the atom. [Learning-plan status](repo:docs/concept/didactic/unified-learning-plan-status.md)

**Contract in force, 4/11 November.** Effective mastery $M_{\mathrm{eff}}=M\cup I$ combines stored results $M$ with derived recognition $I$. Recognition originates in the owning unit and continues to apply after a focus change. Step 4 describes implementation status and the proposal of 19 November. See @ref{sec:workflow-step4}.

**Orthogonal curriculum timeline:** A dated course or exam schedule is an execution-plan overlay answering **when** targets inside Level 2 should be addressed (see [Unified Learning-Plan Status](repo:docs/concept/didactic/unified-learning-plan-status.md) and [Curriculum Time Axis and Pacing](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md)), not a fifth personalization level.

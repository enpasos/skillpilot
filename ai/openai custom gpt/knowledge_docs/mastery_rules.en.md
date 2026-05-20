# SkillPilot Mastery Rules

This document defines the subject-specific logic for mastery in learning-coach operation.
It complements the system instruction for sequencing and persistence.

---

## 1. Core principle

- **Mastery is evidence-based**: a goal is considered achieved when there is sufficient demonstrable work.
- Self-confidence does not replace checking.

## 2. Allowed goals

- Only **atomic** goals are marked as directly mastered.
- Cluster goals are assessed through their child goals.
- Goals with `srs-deck:` or `memorization` tags are not set by manual `setMastery`; those are handled by SRS state.

## 3. Evidence

A goal is typically considered achieved when at least one of these patterns is present:

- two coherent checks (explain + apply, or solve example + solve a new example), or
- one substantial transfer task in a new context.

Valid nonstandard solutions count as evidence even when they do not follow the template method. Reconstruct the strategy first; wrong or unjustified steps do not count as evidence and must be rejected clearly.

For frequently named identities, verify the identity step first before accepting the broader result.

The following do **not** count as solid evidence:

- merely repeating wording that the learning coach just provided,
- solving the exact same example that the learning coach just demonstrated,
- a single mirrored sub-aspect when the learning goal clearly contains multiple named aspects.
- incomplete evidence when only part of the clearly named aspects of the learning goal was checked.

## 4. Work in current dialog

Mastery is saved only if the active goal was clearly worked on in the current dialog.
Pure navigation/status turns are not sufficient.
A single correctly echoed sample case without transfer or a second independent check is not enough.
Before `setMastery`, all clearly named aspects of the active learning goal must have been checked in the dialog.

## 5. Timing

- If evidence is sufficient, call `setMastery`.
- After successful persistence, adopt the returned next state and continue from there.
- While persistence is pending, stay on the current outcome and do not jump to unrelated content.

## 6. Transparency

- Do not claim progress if it cannot be secured.
- Follow-up questions or focused exercises are the appropriate next step.

## 7. Recommendation

A short progress note is helpful, but optional.

## 8. Not allowed

- Mastery without dialog evidence,
- Mastery for cluster goals,
- confirming mastery without persistence.

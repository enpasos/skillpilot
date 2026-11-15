# SkillPilot informed current-input description confirmation

You are one reviewer independently confirming the exact CURRENT input after bounded curriculum repairs. This is an informed current confirmation, not a claim of a new blind first pass. You may retain your own earlier observations if you actually made them, but must reassess every assigned current page, complete current prerequisite meaning and current positive profile. Historical findings do not decide current outcomes.

Remain blind to every OTHER reviewer's prior or current output. Do not inspect or infer their results, outcome summaries, synthesis decisions or attributed proposals. Use only your own actual history plus the supplied neutral current material and criteria. If you have read another reviewer's output, report that fact before claiming blindToOtherRuns; never invent independence. Disclose informed own-history status in your run-generation provenance or rationale, rather than pretending that this is your first exposure. Current A/B reviewers must not inspect each other's current records.

Review every assigned goal exactly once, using the bound output schema. For all goals, independently judge the whole current competence, not just whether a requested wording was copied. For a changed prerequisite, inspect what the current prerequisite actually promises and whether that prepares this goal. For supplied experimental tasks, distinguish actual personal construction and observations from interpretation of somebody else's data; a prior interpretation result does not certify the separate actual-execution identity. Current tasks and figures are supplied evidence for content review, never evidence of an actual learner's performance.

The purpose is to keep each canonical description concise and learner-facing
while making the competence clear enough for a learning coach to teach toward
genuine understanding and to seek independent evidence of it. A description
alone does not guarantee Coach or Mastery behavior; detailed assessment
expectations remain in a separate `positive-understanding-evidence-v2` profile.

For every goal, formulate a content-specific chain of positive understanding
evidence:

- `essentialUnderstandingDe` and `essentialUnderstandingEn` name the central
  concepts, relationships, distinctions, structures, models, meanings, or
  conditions the learner is expected to understand;
- `observablePerformanceDe` and `observablePerformanceEn` state what the
  learner independently explains, predicts, constructs, compares, interprets,
  justifies, derives, investigates, analyzes, or applies so that this
  understanding becomes observable; and
- `transferExpectationDe` and `transferExpectationEn` state how the learner
  applies the same understanding to a structurally related but meaningfully
  changed case presented independently as a fresh task.

All six fields must be specific to the exact goal. Repeating generic phrases
about understanding, independence, transfer, or deep learning is insufficient.
A number swap or a surface rewording of the same exercise is not a meaningful
changed case.

Keep the two authoring layers separate:

- `description` is short, bilingual, learner-facing, and limited to the
  competence itself. It may name an essential distinction, reason, model
  condition, interpretation, or application already claimed by this goal.
- `understandingEvidence` records the three bilingual expectations for this
  review. Detailed coverage rules, variation axes, application cases, scoring,
  assistance history, and repeated demonstrations belong in the separate V2
  profile.

Use the supplied page context deliberately:

- when present, `canonicalContext` binds the current canonical core/weight,
  tags, competency dimensions, applicability, structural relations, atomicity,
  and selected applicability semantics; treat these fields as scope constraints,
  not as permission to invent a broader competence;
- direct prerequisites and containing context delimit assumed prior knowledge
  and the goal's curricular role;
- direct successors help detect accidental duplication or scope expansion;
- a visualization is teaching support, never evidence that the learner can
  perform independently; and
- any supplied current V2 profile is review context, not authority and not a
  reason to leave an ambiguous description unchanged.

Raw canonical applicability and a `sourceRef` are not proof of the effective
learner-facing projection or complete source mapping. Unless separate bound
mapping, composition-view, or source-manifest evidence is supplied, do not
claim that those external relationships were verified.

For each assigned goal:

1. Determine what the current title, bilingual descriptions, relations,
   applicability context, and supplied source evidence actually claim. Preserve
   the stable goal identity, curricular scope, demand level, method neutrality,
   and semantic atomicity.
2. Apply every subject-specific criterion independently. Do not import a useful
   but unclaimed competence or a sibling source clause.
3. Write the six bilingual understanding-evidence fields as one coherent chain
   from essential understanding through independently observable performance to
   meaningful transfer.
4. Decide exactly one of:
   - `keep`: the current description is already clear, accurate, bilingual, and
     sufficiently informative for this goal;
   - `revise`: one concise local wording change can remove a concrete ambiguity
     or make an already claimed aspect of understanding observable without
     widening the goal;
   - `split_review`: the goal appears to combine independently assessable
     competencies, so a wording-only change would conceal an atomicity issue;
   - `block`: factual correctness, source fidelity, identity, applicability,
     model convention, missing evidence, or another issue prevents a
     responsible wording proposal.
5. For `revise`, provide exactly one complete German and one semantically
   equivalent English replacement. Both must be usable verbatim. For every
   other decision, omit both replacement fields.
6. Set `evidenceProfileContract` to
   `positive-understanding-evidence-v2`. Use `none` only when a supplied current
   profile already expresses the complete goal-specific understanding,
   performance, and transfer contract; use `create` when none exists; and use
   `revise` when the supplied current profile needs alignment. This
   recommendation does not create or mutate a profile.
7. Copy every run, campaign, bundle, book, goal, page, and current-text binding
   exactly from the supplied batch. Never reconstruct a fingerprint.

Return newline-delimited JSON with exactly one record per assigned goal, in the
assigned order. Every line must validate against the bound
`goal-description-review-record.schema.json`. Set `recordStatus` to `candidate`
and `reviewAuthority` to `ai_candidate`. Return no prose, Markdown, code fence,
summary, or unrecognized key.

Do not include learner data, conversation data, personal learner identifiers,
credentials, private provider traces, invented source evidence, or an inferred
claim about an actual learner. A canonical `goalId` identifies public curriculum
content, not a person.

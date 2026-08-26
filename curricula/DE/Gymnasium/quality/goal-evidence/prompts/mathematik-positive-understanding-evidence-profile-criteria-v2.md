# Mathematics criteria for positive understanding-evidence profiles v2

Apply every criterion independently to every assigned ordinary atomic
mathematics goal. These criteria govern the content of a
`positive-understanding-evidence-v2` profile. They do not authorize a canonical
description edit, a learner-state decision, or a Coach/Mastery runtime change.

## Exact mathematical scope

- Bind the profile to the current atomic goal, its bilingual wording, demand
  level, direct relations, applicability, and supplied source evidence. A
  prerequisite may be assumed but must not be reassessed as if it were part of
  the active goal. A sibling or containing cluster cannot donate an additional
  competence.
- Name the mathematical objects, relations, conditions, representations, and
  meanings that distinguish this goal. Generic claims such as “understands the
  concept”, “can apply the method”, or “transfers the knowledge” are not
  sufficient.
- Preserve the stated level of generality. Do not turn work on a bounded class
  of examples into a theorem for all cases, and do not reduce a general claim
  to one numerical example.
- Remain method-neutral when several mathematically equivalent approaches are
  valid. Require a named construction, representation, proof form, algorithm,
  or tool only when it is itself part of the current competence or is directly
  source-bound.

## Positive evidence of deep understanding

- Every expectation pairs one content-specific `essentialUnderstanding` with
  an `observablePerformance` that makes that exact understanding independently
  visible. A correct final answer without the reasoning, interpretation,
  construction, comparison, or validity check claimed by the goal is not enough.
- State successful mathematical performance positively. The V2 profile is not
  a misconception list, deficit taxonomy, catalogue of non-evidence, scoring
  rubric, or remediation script. A learner can positively identify a
  limitation, reject an inadmissible case, or produce a counterexample when
  that is part of the competence; describe the successful act rather than a
  presumed failure pattern.
- Require mathematical coherence appropriate to the goal: relevant
  assumptions and domains, valid transformations, consistent notation,
  plausible magnitudes, units or probabilities where applicable, and a check
  or interpretation when the goal claims one. Do not add all of these to every
  profile mechanically.
- A visualization is teaching support, not proof of understanding. The
  observable performance must be possible in a fresh task without copying a
  highlighted construction, answer, explanation, or Coach-provided reasoning.

## Mathematics archetypes

- Choose exactly one primary archetype from the schema according to the
  competence actually assessed. Encode secondary characteristics in the
  expectations instead of inventing a hybrid enum value.
- `concept`: emphasize meanings, invariants, relationships, conditions, and
  distinctions, then require the learner to explain, connect, predict, or
  classify using them.
- `procedure`: require accurate execution together with the selection,
  applicability, interpretation, or checking already claimed by the goal.
  Merely reproducing steps is not deep-understanding evidence when the goal
  also claims reasoning or meaning.
- `representation`: require reading, constructing, translating, comparing, or
  choosing representations in relation to the mathematical information and
  purpose. Visual similarity alone is insufficient.
- `modeling`: require the learner to connect context and mathematics through
  the assumptions, variables, parameters, results, validation, or limits that
  the goal actually claims. Decorative real-world wording is not a modeling
  case.
- `proof`: require a logically valid chain with the relevant assumptions and
  direction of implication. A checked example is not a general proof; a
  counterexample is positive evidence when disproving or testing a universal
  claim is in scope.
- `data`: require conclusions to be grounded in the supplied data,
  distribution, statistic, representation, and context as claimed by the goal.
  Calculation alone is insufficient when comparison or interpretation is in
  scope.
- Use `experiment` only for a genuinely experimental mathematical competence
  claimed by the goal. Do not relabel numerical exploration, dynamic-geometry
  observation, or tool use as experiment merely to fill an archetype quota.

## Coverage and fresh transfer

- `requiredExpectationIds` contains every independently indispensable
  expectation and only declared IDs. Use an alternative group only for genuine
  equivalent ways of demonstrating the same required facet, never to make a
  difficult part optional.
- Set `minimumIndependentDemonstrations` to at least two and no higher than the
  number of genuinely independent demonstrations supported by the application
  cases. Repeated attempts, coached continuations, or cosmetic rewrites of one
  task count once.
- Provide at least two application cases. Together they cover all required
  expectations: at least one establishes the competence directly and at least
  one requires independent transfer to a structurally related, meaningfully
  changed case.
- Variation axes change a mathematically consequential feature, for example
  representation, information given, unknown quantity, direction of reasoning,
  admissible parameter range, data structure, model condition, proof demand,
  or contextual interpretation. Changing only names, wording, or numerical
  values is not a sufficient transfer axis.
- A fresh case stays inside the atomic goal. It may recombine prerequisites but
  must not require an unclaimed successor competence, a sibling topic, or a
  higher course profile.

## Case-specific mathematical checks

- For constructions, state what is constructed and the mathematical property
  that establishes correctness; measuring an apparently accurate drawing is
  not a substitute for a valid construction when exact construction is in
  scope.
- For functions, calculus, and numerical procedures, distinguish object,
  representation, local or global statement, approximation, and exact result
  as the goal requires.
- For probability, statistics, and Markov processes, preserve the event,
  conditioning, distribution, normalization, dependence, and temporal
  direction relevant to the goal. Do not accept an algebraically computed but
  inadmissible state as understanding evidence.
- For logic, argumentation, and proof, keep premise, conclusion, converse,
  contrapositive, equivalence, necessary condition, and sufficient condition
  distinct. Require justification or a valid counterexample at the level
  claimed by the goal.
- For strategy or representation choice, the observable performance names the
  criterion used, applies it to the given mathematical situation, and compares
  a plausible alternative when comparison is part of the goal.

## Language, authority, and review discipline

- German and English fields are semantically equivalent in mathematical
  objects, conditions, independence, and transfer demand. Keep formulas,
  quantifiers, implication direction, units, and terminology aligned.
- Initial AI-authored records use `status: needs_human_review`,
  `reviewAuthority: ai_candidate`, `evidenceLevel: E1`, and
  `maximumClaimScope: G1`. Model agreement does not approve a profile.
- Record substantive ambiguity or disagreement in `dissent`; do not hide it in
  a vague expectation or broaden the profile to cover every interpretation.
- Never include learner data, conversations, identity, credentials, private
  provider traces, or a claim that an actual learner has demonstrated mastery.

Reject generic template output even when it satisfies the JSON schema. Passing
the profile requires content-specific mathematical expectations, coherent
coverage, and fresh cases that could distinguish independent understanding from
surface reproduction for this exact goal.

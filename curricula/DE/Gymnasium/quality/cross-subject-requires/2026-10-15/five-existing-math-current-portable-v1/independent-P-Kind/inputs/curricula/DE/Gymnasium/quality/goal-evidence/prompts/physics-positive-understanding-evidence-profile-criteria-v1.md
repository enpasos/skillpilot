# Physics positive-understanding-evidence profile criteria v1

Apply these criteria when authoring or reviewing a physics profile under the
closed `positive-understanding-evidence-v2` contract. The profile is a
fingerprint-bound review artifact. It guides later teaching and assessment but
does not itself establish mastery or alter runtime behavior.

## Closed contract

- Emit only fields admitted by
  `contracts/goal-evidence/v2/goal-evidence-profile.schema.json` and use
  `profileRuleVersion: "positive-understanding-evidence-v2"`.
- Choose exactly one primary archetype from `concept`, `procedure`,
  `representation`, `modeling`, `proof`, `experiment`, or `data`. Encode
  secondary characteristics in the expectations; never invent another enum.
  For an evaluation competence, choose the closest physical work form—usually
  `modeling` or `data`—and express the evaluation structure explicitly.
- Provide one to eight content-specific expectations. Every expectation pairs
  an `essentialUnderstanding*` statement with the corresponding independently
  observable `observablePerformance*` statement.
- Every ID in `requiredExpectationIds` or an alternative group must name a
  declared expectation. Alternatives must be genuinely equivalent ways to
  expose the same understanding, not easier substitutes.
- Set `minimumIndependentDemonstrations` between two and eight and set both
  `freshVariationRequired` and `independentTransferRequired` to `true`. Repeated
  coaching of one case is one demonstration, not several.
- Supply one to eight meaningful `variationAxes` and two to eight fresh
  `applicationCaseBriefs`. Every brief states the task demand, independent
  learner performance, and understanding focus in semantically equivalent
  German and English.

## Physics evidence quality

- Expectations name the relevant system, quantities, interactions,
  relationships, conditions, and model limits. They distinguish observation,
  measurement, inferred quantity, representation, model, explanation,
  prediction, and judgment where the goal requires it.
- Observable performance is learner-generated: explanation, prediction,
  construction, derivation, model choice, experiment design or execution, fresh
  data analysis, or evidence-based judgment. Recognition, coach repetition,
  copying a supplied visual, self-report, and formula substitution alone do not
  meet the positive requirements.
- Mathematical work retains physical meaning through units, signs, vectors,
  coordinate choices, graphs, uncertainty, system boundaries, limiting cases,
  and plausibility checks as relevant.
- A variation axis changes a content-bearing condition such as direction, sign,
  geometry, medium, reference frame, system boundary, damping, material,
  measurement quality, available representation, or model regime. New numbers
  or surface wording may accompany such a change but cannot be the only change.
- Application briefs stay within the exact source and effective projection
  scope. A source bullet shared by several canonical siblings contributes only
  the clause bound to the reviewed goal. Effective stage, jurisdiction,
  duration, and course-profile evidence comes from compiled composition views,
  the nationwide source manifest, and the applicable duration policy—not raw
  canonical applicability alone.
- For cross-stage goals, expectations express a common stage-neutral competence
  core. The two or more cases may use age-appropriate contexts and formalisms,
  but they must test the same understanding. Escalate rather than inventing
  uncontracted stage-specific profile variants.
- Visuals and simulations may create useful cases, but highlighting, answer
  leakage, or reproduction of a supplied representation is not independent
  evidence. At least one fresh case must work without dependence on the reviewed
  visualization's exact layout.
- Keep German and English fields semantically equivalent and method-neutral.
  Require a named method only when it is the competence itself or is explicitly
  source-bound.

## Archetype-specific minimums

- **Concept:** expose the defining physical relationship or distinction, then
  require prediction and explanation in a changed case that could reveal a
  shallow verbal rule.
- **Procedure:** require selection and justification of the applicable law or
  procedure, physically meaningful execution, and checks of units, signs,
  limits, or plausibility. A memorized recipe is insufficient.
- **Representation:** require construction or translation as well as
  interpretation. The learner explains the conventions, correspondence to the
  physical system, and what the representation does not claim.
- **Modeling:** require system boundary, assumptions or idealizations, justified
  model choice, a prediction or explanation, comparison with the case or data,
  and a statement of validity or limitation.
- **Proof:** require explicit physical and mathematical premises, a coherent
  derivation, interpretation of the result, and validity conditions. Algebra
  copied from a known derivation is insufficient.
- **Experiment:** require a testable question, variables and controls, suitable
  setup or measurement principle, observations or data, uncertainty-aware
  conclusion, measured-versus-inferred distinction, and proportionate safety.
- **Data:** require independent work on fresh data: processing or graphing,
  appropriate fit or relationship, units and uncertainty, defensible inference,
  and a check against the relevant model or alternative explanation.

## Special physics safeguards

- Conservation expectations state the system and relevant transfers. Entropy
  claims include system plus surroundings where required by the second law.
- Field lines, rays, particle models, wave functions, and similar
  representations are not treated as directly observed material objects.
- Quantum cases distinguish stochastic individual events from ensemble
  distributions and do not imply classical hidden paths without source support.
- Relativity cases state the frame and operational measurement procedure and
  preserve invariant rest mass unless a historical source-bound convention is
  explicitly under review.
- Evaluation cases distinguish empirical findings and uncertainty from
  criteria, consequences, and value judgments.
- Unsafe radiation, electrical, optical, pressure, thermal, or mechanical work
  is replaced by supervised conditions, supplied data, or simulation as
  appropriate. The profile must not instruct unsupervised hazardous activity.

Set an AI-authored record to `status: "needs_human_review"` and
`reviewAuthority: "ai_candidate"`. Use initial candidate claim bounds `E1` and
`G1` unless stronger bound evidence is explicitly supplied. Record substantive
source or correctness uncertainty in `dissent`; do not manufacture consensus or
source excerpts. Include curriculum data only—never learner data, conversations,
credentials, or private provider traces.

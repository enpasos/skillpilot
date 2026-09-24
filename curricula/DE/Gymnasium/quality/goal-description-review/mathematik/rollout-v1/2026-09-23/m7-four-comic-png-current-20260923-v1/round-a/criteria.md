# Mathematik: Kriterien für den Lernzielbeschreibungs-Review v2

Apply every criterion independently to every assigned mathematics goal.

- **Exact curricular scope:** Preserve the competence claimed by the current
  title, bilingual descriptions, relations, applicability context, and supplied
  source evidence. Do not import a sibling operation or raise the demand level.
- **Mathematical essential understanding:** Name the content-specific
  relationships, distinctions, structures, meanings, invariants, conditions,
  or reasons that organize the competence. A topic label, formula name, or
  procedural instruction alone is insufficient.
- **Independently observable performance:** State what the learner independently
  explains, derives, constructs, compares, represents, interprets, justifies,
  checks, models, or solves. Name the mathematical objects and relationships;
  do not use a generic phrase such as “shows understanding”.
- **Structure before substitution:** A calculation goal must keep quantities,
  operations, representations, signs, units where relevant, and result meaning
  connected. Copying a worked template or substituting values into a supplied
  formula is not by itself evidence of understanding.
- **Representation coordination:** Where relevant, require construction,
  interpretation, or translation among verbal descriptions, tables, graphs,
  terms, equations, diagrams, geometric figures, symbolic statements, or data.
  Copying the supplied visualization is insufficient.
- **Reasoned choice:** When alternatives, representations, models, solution
  paths, approximations, or strategies are part of the competence, make the
  decisive mathematical criteria, trade-offs, assumptions, or limits explicit.
- **Justification and proof discipline:** Distinguish an example from a general
  argument, an implication from an equivalence, plausibility from proof, and a
  numerical check from a derivation. Accept valid age- and stage-appropriate
  forms of reasoning within the claimed scope.
- **Modeling discipline:** Connect assumptions, mathematical model, solution,
  interpretation, and model limits. Preserve the difference between a
  mathematical result and a claim about the original situation.
- **Data and uncertainty:** For statistics or numerical procedures, preserve
  the relationship between data, chosen measure or method, variability,
  approximation, error, convergence, and the strength of the conclusion.
- **Meaningful changed-case transfer:** Change a structurally relevant feature,
  such as representation, parameter regime, constraint, direction of
  inference, data shape, geometric configuration, or modeling assumption. A
  number swap in an otherwise identical template is not enough.
- **Method neutrality:** Accept mathematically equivalent approaches. Require a
  particular method only when that method is itself the stated competence or is
  normatively source-bound.
- **Semantic atomicity remains reviewable:** An existing atomicity decision does
  not prohibit `split_review`. Use it when separate performances could be
  mastered independently. Keep coherent calculate-and-interpret or
  construct-and-justify chains together when they are genuinely one competence.
- **Age and stage fit:** Keep the description understandable at its effective
  Gymnasium stage while retaining the current mathematical precision and demand.
- **DE/EN parity:** German and English express the same objects, operations,
  conditions, reasoning, independence, and transfer demand. Neither language
  may add or omit a facet.
- **Description/profile boundary:** Keep a replacement short and
  learner-facing. Detailed cases, variation sequences, coverage, repeated
  demonstrations, and assessment conditions belong in the separate
  `positive-understanding-evidence-v2` profile.
- **Conservative revision:** Use `keep` when the current text is already
  adequate. Use `revise` only for a concrete local improvement that preserves
  identity and scope. Use `block` for unresolved source, identity, factual, or
  applicability ambiguity.
- **No automatic authority:** Every AI record remains
  `candidate`/`ai_candidate`. Agreement between models is not an approval and
  cannot mutate curriculum or runtime behavior.

At the start of a new current-state campaign, recommend `create` when no current
V2 profile is supplied. A visualization remains teaching support; evidence must
be learner-generated in an independently presented task.

## Four current image and P-v2 bindings

Read each current canonical goal, exact source and prerequisite context,
rendered page, and the *original pixels* of its current PNG. Images are
teaching illustrations, never evidence that a learner can perform the goal.
In particular:

- `e495fa38…`: distinguish a single Bernoulli trial from a chain; two outcomes,
  constant success probability and independence are conditions. The fair-coin
  image is only an example, not the full concept or a binomial-formula proof.
- `5a2371fd…`: a Laplace claim needs equally likely elementary outcomes.
  Relative frequencies may fluctuate; more trials do not guarantee a monotone
  or exact match. The displayed comparisons are one correct sample.
- `f17935b0…`: reversal on division by a negative number and open boundary
  at −3 must agree with the resulting solution set. The goal permits number
  line *or* interval notation, not necessarily both.
- `740ab443…`: converse Q⇒P and contrapositive ¬Q⇒¬P are distinct; only the
  contrapositive is generally equivalent to P⇒Q. Do not infer the converse.

The inspected originals are PNG SHA-256 `165fb00a213aa4f21401a2e4a121c1121cce7dc27ed28ab047c932520e01152b`,
`aa578a6d6fddbd68fdb3a91ba4e535a481880cbc69092bbab7e2c6dc8c894fec`,
`4d800383ced84863c26e5d832e95b0a451c98434d46c41c6c6e387ab97008ca2`,
and `75f3b4f6f85a9ab593641eebeca408c486ff16510c0ff18a62927a50856bf522`
in goal order above. A previously rejected Laplace candidate's number line is
not current.

The four current, image-bound P-v2 candidate records are in
`curricula/DE/Gymnasium/quality/goal-evidence/m7-four-comic-png-current-20260923-v1.review.jsonl`
(`sha256:5672d454f4c3ebfc98b0a1b06c2e2769f2efa302ec0868f0b1fe166f46b65ac1`).
Each profile specifies goal-specific new cases and transfer, but remains
`needs_human_review` / `ai_candidate`; it is neither human approval nor a
learner achievement. For `f17935b0…` either number-line or interval
representation is sufficient, as in the canonical description. Review the
short descriptions independently from the P profiles and do not treat the
illustrations as positive-understanding evidence.

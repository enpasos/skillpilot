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

## Two current image and P-v2 bindings

Read each current canonical goal, the shared elementary-derivative prerequisite,
the Q2 LK/AB3 and source context, the rendered current page, and the *original
pixels* of its current PNG. The images are teaching illustrations only and do
not prove independent learner performance.

- `cf48c918…`: Product rule means both changing factors contribute
  `g′h + gh′`. The current PNG shows `g=x²`, `h=x+1`,
  `f′=2x(x+1)+x²` and an independently expanded control
  `f=x³+x²`, `f′=3x²+2x`. The short goal explicitly requires a
  suitable verification; keep that obligation without making polynomial
  expansion the only acceptable method.
- `ae5010cc…`: Chain rule requires separating the independent outer
  function from the inner function and multiplying by the inner derivative.
  The current corrected PNG says `g(t)=t³`, `u(x)=x²+1`, and
  `f′(x)=3(x²+1)²·2x`. Its rejected first draft mislabeled
  `[u(x)]³` as the outer function and remains HOLD, not current.

Current PNG SHA-256 are
`e902392ddbcc558b904f9a54d9fb74feaec49d92cdf03989d72f8f8fb12efd12`
and `6c71876d3782952b2e7293092a44f10d536b341f14c46a1b9108079ea8526f8f`
in goal order above. A before/after calculation is not independent transfer.

The two current, image-bound P-v2 candidate records are in
`curricula/DE/Gymnasium/quality/goal-evidence/m7-q2-product-chain-png-current-20260923-v1.review.jsonl`
(`sha256:12221c265a59af01e2c1132db162195f16833e629a641f35612ebbaeeaa0f40a`).
They preserve the previously reviewed substantive profiles, now bound to
current images; status remains `needs_human_review` / `ai_candidate`.
Do not mistake this status for missing P-v2 evidence or for human approval.
Review descriptions independently from the profiles.

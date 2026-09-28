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


# Supplied current source and course context for this six-goal batch

This is input evidence, not another reviewer's output or a preselected decision.
Apply the mathematical criteria above independently; source mapping labels alone
do not prove an exact competence match. Inspect the current raster files whose
URLs and digests are bound in each input page.

## Authored Bavarian course convention

The active AGENTS.md explicitly assigns technical SkillPilot profile GK to the
complete compulsory four-hour Bavarian Mathematics curriculum at elevated
level. Technical LK includes that curriculum plus all five modules of the
separate Vertiefungskurs. These technical labels are not official Bavarian
course names and do not assert that Mathematics is an elective Leistungsfach.
The source extraction's historical courseLevel: LK is not a separate normative
claim overriding this rule. The later three-module selection UX is out of scope.
The reviewed subject matter, source fidelity and evidence demands remain unchanged.

Current implementation uses the authored Bavarian composition views for both
the Atlas and backend learner projection, so shared canonical LK tags must not
remove a compulsory BY-GK target. Other jurisdictions retain their own course
filters and mappings. No general course-marker policy or nationwide release
is activated by this review.

## Official subject sources, checked on 28 September 2026

- M13.4, regular elevated-level Mathematics:
  https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/mathematik
  The clause covers flexible, reflective application of differential and integral
  calculus in contexts, and interpretation and validation of results. It is the
  source of dc12f281, 0b162cb0 and 71fe4a39; the current goals and applicability
  restrict this source-specific group to Bavaria. Differential/integral method
  selection and model validation are separate atomic children of ead1f5ce.
  Integral application has a partial direct mapping from the application aspect
  9371884f-3c08-5f6f-b963-163f2ccc9cb3. Model validation has a partial direct mapping
  from the actual validation aspect by-math-m13-4-9371884f-s02-bf45d4d2b4. Partial
  remains partial: a parent mapping is not automatically proof of every facet
  of a child. The validation goal includes checking assumptions and model limits;
  assess whether this is an appropriate operationalization of contextual validation.
- M12.1.2, regular elevated-level Mathematics:
  https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/regulaer
  The source asks for a plausibility argument comparing exponential and power
  growth for the limits x^n/e^x → 0 as x → +∞ and x^n e^x → 0 as x → −∞.
  Its formulas are embedded images on the official page; the historical plain-text
  source extraction omits them. Goal 49f9059a keeps a general asymptotic comparison
  and plausibility claim. Its illustrative n=2 positive-direction graph does not
  itself establish all cases and does not prescribe an integral or formal proof.
- M13.2 at the M13 URL above motivates normal distributions through measured
  data that often yield bell-shaped histograms. This clause maps to b431148b.
  The current image compares two binomial situations as schematic examples of
  a suitable and unsuitable approximate normal shape; it is not a complete
  account of continuous normal distributions and does not replace independent
  judgment of newly given situations.
- M12.1 of the separate Vertiefungskurs:
  https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/mathematik/vertieft
  The clause asks learners to investigate boundedness of complex sequences
  associated with the Mandelbrot set and visualize the set using appropriate
  software. Goal 9b339361 has Bavaria-only applicability and is a technical
  LK target, outside technical GK. Finite nonescape in a software experiment
  alone must not be presented as a proof of boundedness.

## Bound local provenance

Canonical landscape:
`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`

Source extraction:
`curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_MATHEMATIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json`

Reviewed source mapping:
`curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_source_extraction_to_canonical_math.review.json`

The source-specific criteria text itself is fingerprint-bound into both review
campaigns. The adjacent source-scope audit lists exact local file digests and
the freshly compiled current page scopes. It supplies evidence only and grants
no description/profile/image approval, human authority, or M7 completion.

# Chemistry goal-description understanding-evidence review criteria v1

Apply the general v2 review prompt independently to each canonical German
Gymnasium chemistry goal. These criteria guide an AI candidate review; they do
not authorize a curriculum change or a human approval claim.

- **Exact scope and sources:** Preserve the goal's own competence, prerequisite
  level, and effective stage/course/jurisdiction projection. Canonical
  applicability alone does not establish a source mapping. A broad source
  bullet shared with sibling goals contributes only this goal's clause.
- **Chemical correctness:** Distinguish substances, particles, bonds,
  reactions, observations, and explanatory models. Preserve atoms and charge
  in balanced reaction descriptions. Do not treat a symbolic equation as a
  direct observation or assume that every change of appearance is a reaction.
- **Energy and reaction path:** Distinguish reaction energy change from the
  activation barrier. A catalyst changes the route and barrier, not the
  initial and final energy difference or the reaction's stoichiometry.
  Thermochemical comparisons need an explicit common basis and system boundary.
- **Independent performance:** The learner must explain, predict, classify,
  construct, analyze, investigate, or judge in a way that exposes the stated
  chemical relationship. Repeating terms, copying the image, or merely
  balancing a supplied equation does not establish deep understanding.
- **Representations:** Relate macroscopic evidence, particle-level explanation,
  formula or equation, and graph only where those are within the goal. State
  what a particle or energy diagram represents and what it leaves out.
- **Experiments and safety:** Experimental goals require a suitable question,
  observations or data, control of relevant conditions, an inference, and
  proportionate safety. Hazardous combustion, reactive chemicals, and fumes
  require supervised settings or provided data, not unsupervised execution.
- **Meaningful transfer:** Change a chemically relevant factor such as the
  substance, available oxygen, containment, reaction pathway, data quality,
  or represented system. New numbers or a new story alone are insufficient.
- **Evaluation:** Separate chemical data and uncertainties from criteria and
  value judgments. Avoid unsupported blanket environmental or health claims.
- **Atomicity and language:** Use `split_review` for genuinely separable
  competencies. Keep German and English descriptions equivalent, concise, and
  suitable for the youngest effective stage. Case briefs belong in the V2
  profile, not in the description.
- **Conservative decision:** Use `keep` only when the current text is accurate
  and clear; `revise` for a bounded correction; `block` for unresolved scope,
  source, safety, or correctness. Set AI results to `candidate` with
  `ai_candidate` authority. No image or generated text is an approval.

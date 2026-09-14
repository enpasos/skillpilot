# Author review: two transition profiles, 13 September 2026

Checked at `2026-09-13T20:37:42.591Z` by
`codex-math-transitions-informed-profile-author-20260913`.
Provider/tool: OpenAI / Codex. Exact deployed model identifier and model version
were not available and are not claimed. This is informed P authorship and an
AI author self-check, not blind D review, independent review, human approval,
runtime acceptance, or evidence about any actual learner. No external review
run was invoked; both generated records have empty `reviewRunIds`.

## Current scope and inputs read

Exactly these current ordinary atomic goals were authored:

- `03685f87-7570-5bb3-b1c7-134124abb317`: represent supplied transition processes
  using state vectors and transition matrices; interpret their entries.
- `6aa593a3-6690-581d-9b7d-37cac78187a1`: model transition processes as Markov
  chains; justify transition probabilities and interpret the matrix.

Both goals are Q2/AB2, GK/LK, with all sixteen German jurisdictions in current
applicability. The full German and English canonical bodies, direct
prerequisites, containing transition cluster, direct assessment dependents,
separate forward/backward state-calculation goals and adjacent long-term matrix
goals were read. The exact supplied source extraction and mapping distinguish
the two competencies from calculation and long-term development.

The normative authoring criteria were read in full at
`prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md`.
Applicable root `AGENTS.md` guidance was read, particularly the canonical
goal/graph, atomicity, visualization and evidence-authority boundaries.
The sibling `20260913-matrices-3-v1` files supplied structural schema examples;
their mathematical cases were not reused. No historical B045 profile body was
read or copied for this authorship.

Source evidence read:

- `curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json`,
  Q2.4, HMKB KC2024 page 43: source aspect
  `he-math-sekii-q2-4-b01-a02-07549f80` for state vectors and transition
  matrices, including population development; and
  `he-math-sekii-q2-4-b03-a01-7acfc6d2` for Markov modeling with stochastic
  matrices. The neighboring source aspects separately cover state
  calculations, fixed vectors and long-term matrix development.
- `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json`,
  exact mappings of those source aspects to the two goal IDs. Existing mapped
  source evidence was used; no fresh external PDF verification is claimed.

## Actual images inspected

Both active public PNGs were opened and visually inspected with their current
canonical resource metadata and alt text. These images are teaching support;
their worked values are not reused as the new application cases.

| Goal | PNG SHA-256 | Visible check |
| --- | --- | --- |
| `03685f87-7570-5bb3-b1c7-134124abb317` | `519433df50c5b69f6ee211cf5b94524323a0ea584f5329cad5e886daa17a36a0` | Three-state source-column matrix gives `(72,55,43)` from `(100,50,20)`, preserving 170; directions and zero C→B agree with the matrix. |
| `6aa593a3-6690-581d-9b7d-37cac78187a1` | `f34042afdc514ce3c7195579a89409352a54e21cd480c2b624d9e255cee759df` | Two source columns sum to 1; multiplying by `(0.9,0.1)` gives `(0.75,0.25)`, matching the displayed interpretation. |

The files inspected are under
`app/public/assets/goal-visualizations/mathematik/<goalId>/<goalId>.png`.
Their recorded canonical provider is `OpenAI / ChatGPT-Codex image_gen`.
This author did not generate, import, alter or approve the images.

## Body review and scope decisions

Every German and English expectation, task, expected performance, variation
axis and understanding focus was read and checked for matching mathematical
meaning. Each profile has two indispensable expectations, two application
cases and `minimumIndependentDemonstrations: 2`, with fresh independent transfer
required. Cases must be presented independently, with their expected answers
withheld and without carrying over a coached solution; merely repeating a
picture's answer or correcting a coached attempt does not count twice.

The representation profile fixes state order, observation time, units and
source/destination convention. Its direct case represents given customer
fractions. Its transfer starts from a source-row population contribution table
and changes both table convention and the meaning of a coefficient: 1.50
offspring per adult is a reproduction coefficient, not an individual-state
transition probability. This retains the source's general transition-process
scope, including population development. Every population parameter is supplied;
the learner is not asked to choose a Markov model, estimate parameters or compute
a subsequent state.

The modeling profile first estimates probabilities from source groups of
different sizes. It distinguishes empirical estimates from the assumptions
that justify using a Markov model and reusing one matrix over time. The second
case derives probabilities from an explicit repair policy, then tests a changed
policy in which two histories with the same current state R imply different
next-state probabilities. This is a concrete test of the chosen model's
conditions. It does not require constructing an expanded-state matrix. The
stochastic checks validate the learner's own constructed model and do not add a
separate prerequisite examination.

No forward-state calculation, backward inference of a state, matrix power,
stationary distribution, convergence analysis or statistical significance test
is required. Row and column conventions are both legitimate: the task-specific
request to translate to source columns assesses representation equivalence,
not a universal preference for one convention. The arithmetic below supports
the content review and does not replace it.

## Concrete computation checks

An inline Node assertion run passed all of these checks:

- Customer representation: `[[0.60,0.25],[0.40,0.75]]`; both source columns
  sum to 1; initial count `160+40=200`.
- Population translation: source rows `[[0,0.50],[1.50,0.80]]` become source
  columns `[[0,1.50],[0.50,0.80]]`. Every position and directed meaning was
  checked. Source sums are `0.50` and `2.30`; `1.50>1` is consistent with
  mean offspring per adult.
- Customer model: `84/100=0.84`, `16/100=0.16`, `15/50=0.30`,
  `35/50=0.70`; raw source counts sum to 100 and 50, and probability columns
  sum to 1.
- Repair model U: `1−0.05=0.95`, `1−0.40=0.60`, giving
  `[[0.95,0.40],[0.05,0.60]]`; both columns sum to 1. Under D, the explicitly
  stipulated values `0.40` and `0.10` differ for histories sharing current R.
  The Markov conclusion was assessed semantically as well as checking those
  unequal numbers.
- Both inspected PNG matrix-vector products were independently recalculated:
  `(72,55,43)` and `(0.75,0.25)` respectively.

The native candidate materializer was run with `--write` and then without it:
both passed, reporting **2 current AI candidate profiles**. The second run
verified exact materialized bytes against the current candidates and inputs.
Additional record assertions confirmed exactly two records, four cases,
`needs_human_review`, `ai_candidate`, E1/G1, two minimum independent
demonstrations and no invented review-run IDs.

Reproduction command, from the repository root:

```bash
npm --prefix app run quality:positive-goal-evidence-candidates -- \
  --config curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-20260913-transitions-2-v1.config.json \
  --candidates curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-20260913-transitions-2-v1.candidates.json
```

## Bound output

| File suffix on this document's stem | SHA-256 |
| --- | --- |
| `.config.json` | `f9404e36abd78fc82a123401eba491970a157571973f4eae51543dd044703389` |
| `.candidates.json` | `4db1b6a1e5f3ea52b28f962b5cd0fd09e7315c49f3f4d77a09d4547e73956bf0` |
| `.review.jsonl` | `00b8f80308ffd039bfb1a53e644af1ddcff3fd93f9b65af115c0144b467e2a03` |

The materializer owns the current goal, review-input and profile fingerprints
inside `.review.jsonl`; no fingerprint was hand-authored. Scope here is exactly
the four new files on this stem. Canonical content, source mappings, QA ledgers,
registry, progress records and historical artifacts were not modified by this
author. Independent root body review and any later registration remain separate
actions. These records do not constitute human approval or a maturity promotion.

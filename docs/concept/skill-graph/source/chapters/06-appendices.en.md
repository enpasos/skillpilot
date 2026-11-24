## Rules and Milestones {#sec:rule-milestones appendix=true}

::include{block="rule-milestones-appendix"}

## Implementation Status and Boundaries of Claims {#sec:implementation appendix=true}

::include{block="implementation-appendix"}

## Verification Strategy for Completion Semantics {#sec:test-strategy appendix=true}

The script [check-assessment-model.py](repo:docs/concept/skill-graph/latex/check-assessment-model.py) checks two distinct models ([GD-D04](@rule{GD-D04})). For the E.1 draft of 20 November ([scope fixture](repo:docs/concept/skill-graph/examples/hessen-physik-e1/umfang.json)) it evaluates all 16 subsets of the four required passes against the expected child and parent completions; the cut of 24 November is not modelled there. A second case checks an explicit evidence-bound planning release, a prerequisite that was merely sampled and a change of assessment version. Task quality and learning effects require separate review and learner trials.

**Reference cases for the contract in force since 4/11 November.** The following tests check the calculation in Section~@ref{sec:assessment}.

- **Finite model checking.** Every topologically ordered DAG of up to four vertices under every assignment of explicit mastery and protected sets where local content goals have complete local assessment coverage: $5\,222$ valid cases. Graph traversal and static transitive closure yield the identical implicit set $I_U$.
- **Minimality.** Transitive reduction is minimal and preserves closure. Redundant edges of the normalized relation do not alter recognition. The older inheritance counterexample diagnoses transitional data; this bounded model test does not replace complete `G17` validation of the current catalog ([GD-D05](@rule{GD-D05})).
- **Global monotonicity.** Under fixed valid contracts, additional explicit mastery never reopens effectively mastered work. Assessment and memory goals are never implicitly passed ([GD-D06](@rule{GD-D06})).
- **Recursive units.** $128$ state assignments of the Mechanics example verify completion $\Complete(U)$, own recognition $I_U$, and explicit child obligations. A pure aggregate requires no own assessment; a pure parent synthesis requires no new content goals.
- **Unit block grouping.** $948$ grouping cases compare the unit-block DAG against a complete block sequence. One counterexample exhibits an acyclic atomic DAG whose coarse block summary forms a cycle; no technical entry-lock policy is derived from it.
- **Concrete counterexamples.** No stopping barrier at mastered intermediate goals; local recognition preserved despite an open later assessment; durable union across contracts, future prerequisites, intersection with planned target sets, and external support outside $\Own(U)$.
- **Invalid inputs.** Cycles, unknown references, and uncovered local content goals fail closed as errors rather than defaulting to automatic mastery.

Diagram generation in [generate-completion-diagrams.py](repo:docs/concept/skill-graph/latex/generate-completion-diagrams.py) verifies the concrete sets displayed in each figure and compares freshly rendered PNG bytes in `--check` mode ([GD-D07](@rule{GD-D07})). These model and diagram checks verify neither real task quality, grading reliability, identity verification, nor pedagogical effectiveness. Required independent subject-matter content review remains a separate step; runtime integration and its security, concurrency, and UI tests remain separate engineering work.

:::sources
[check-assessment-model.py](repo:docs/concept/skill-graph/latex/check-assessment-model.py); [generate-completion-diagrams.py](repo:docs/concept/skill-graph/latex/generate-completion-diagrams.py).
:::

### Where to find the recognition contract in force {#sec:unit-assessment-history anchors="eq-needed,eq-implicit,tab-unit-validity,fig-unit-entry-paths,fig-recursive-unit,fig-waivers,fig-orientation-outcome,fig-local-recognition,fig-protected,fig-shared-assessments,fig-period"}

Table~@ref{tab:unit-validity} gives the validity rules R1–R5 confirmed on 4 and 11 November. Equations~@eqref{eq:needed} and~@eqref{eq:implicit} give the open demand and the unit’s implicitly recognized own goals. These rules remain in force pending a new product decision. Section~@ref{sec:proposal-unit-assessment} describes the proposal for expert review. The separate reference cases above support comparison.

Figures~@ref{fig:unit-entry-paths} and~@ref{fig:recursive-unit} illustrate entry and recursive completion. Section~@ref{sec:assessment} contains the examples of recognition, outstanding obligations and period counts.

## Glossary and Symbols {#sec:glossary appendix=true}

::include{block="glossary-appendix"}

## Normative Source Mapping and Illustrations {#sec:sources appendix=true}

::include{block="sources-appendix"}

## Building and Verifying the Specification {#sec:build appendix=true}

All bilingual web pages and PDF editions are compiled from the sole authored source under `docs/concept/skill-graph/source/` ([source/README.md](repo:docs/concept/skill-graph/source/README.md), [spec-manifest.json](repo:docs/concept/skill-graph/source/spec-manifest.json)). The compiler `docs/concept/skill-graph/build_spec.py` verifies 1:1 structural parity between German (`DE`) and English (`EN`), translates chapters and structured JSON datasets into MkDocs Markdown and LuaLaTeX sources, and embeds both the static original illustrations (`01`--`07`) and the deterministically generated bilingual bitmap PNGs (`00`, `08`--`18`) from `docs/concept/skill-graph/assets/graph-definition/`. From the repository root:

- `python3 docs/concept/skill-graph/build_spec.py --web-and-tex` -- uses only the Python standard library to verify `DE`/`EN` AST parity and generate all bilingual MkDocs web pages plus intermediate LaTeX files under `tmp/skill-graph-document/`.
- `python3 docs/concept/skill-graph/latex/check-assessment-model.py` -- runs separate reference cases for the contract in force from 4/11 November and the E.1 draft of 20 November.
- `python3 docs/concept/skill-graph/latex/generate-completion-diagrams.py --check` -- verifies deterministic bilingual PNG diagram rendering without modifying files.
- `python3 docs/concept/skill-graph/build_spec.py --all` -- runs the parity check, formula model verification, bilingual PNG rendering, Web Markdown emission, and multi-pass LuaLaTeX builds for both the German (`skillpilot-graph-definition.pdf`, `skillpilot-graph-definition.de.pdf`) and English (`skillpilot-graph-definition.en.pdf`) PDFs together with `.build.json` manifests ([GD-D11](@rule{GD-D11})).

Python 3 alone suffices for `--web-and-tex` and the formula verifier; full `--all` runs additionally require Matplotlib and LuaLaTeX with German (`ngerman`) and English (`english`) Babel support plus preamble packages. Multi-pass LaTeX compilation resolves cross-references, and generated `.build.json` manifests bind input files, `SOURCE_DATE_EPOCH`, tool versions, and output PDF digests via SHA-256. Byte-for-byte PDF identity across different TeX Live versions is not guaranteed. All generated Web Markdown pages, generated diagram PNGs (`00`, `08`--`18`), intermediate `.tex` files, PDFs, and build manifests are `.gitignore`d build artifacts and must never be edited by hand or committed to Git.

Complete document verification requires an error-free build, resolved cross-references, inspection for overfull or underfull boxes, and visual inspection of both generated PDFs ([GD-D12](@rule{GD-D12})). Technical specification prose, schemas, and build scripts are licensed under `Apache-2.0` ([LICENSE](repo:LICENSE)); own didactic illustrations are licensed under `CC-BY-4.0` ([LICENSES/CC-BY-4.0.txt](repo:LICENSES/CC-BY-4.0.txt), [LICENSING.md](repo:LICENSING.md)). Build and formula checks complement document QA and replace neither runtime tests nor independent subject-matter and empirical validation.

:::sources
[source/README.md](repo:docs/concept/skill-graph/source/README.md); [spec-manifest.json](repo:docs/concept/skill-graph/source/spec-manifest.json); [check-assessment-model.py](repo:docs/concept/skill-graph/latex/check-assessment-model.py); [LICENSING.md](repo:LICENSING.md).
:::

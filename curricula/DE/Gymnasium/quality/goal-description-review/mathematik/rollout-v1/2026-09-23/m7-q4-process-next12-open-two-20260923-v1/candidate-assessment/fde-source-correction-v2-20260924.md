# fde351a8 source and scope correction candidate v2

Status: `candidate_only_not_integrated`
Reviewed: 2026-09-24
Target: `fde351a8-98b1-5d75-b4df-813beb2bbe3c`
Authority: machine curriculum/source audit; no human approval or release claim.

This version preserves all old source-mapping and review records. It proposes a
small correction to the active interpretation of those records and identifies
the dependent bindings that would need refresh before any central integration.
It does not change the canonical goal, mapping registries, composition views,
publication files, or central rollout config.

## Current goal and competency mismatch

Canonical source: `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json:29849-29875`.

Current description:

> Die lernende Person kann Beziehungen zwischen Größen als Gleichungen,
> Ungleichungen oder Funktionen formulieren und die Bedeutung der Terme im
> Kontext deuten.

It is an AB2 goal in Q4, tagged GK/LK, but names `K2.3` (AB3: develop and apply
a strategy for a complex problem). The described performance is mathematical
modeling and interpretation, so `K3.4` and `K3.5` are the matching AB2 process
competencies.

## Current official evidence

All page numbers below distinguish printed page numbers from PDF page indices.
The local PDF hashes bind the text used in this audit.

| Route | Current evidence | What it supports | Limit |
| --- | --- | --- | --- |
| HE upper secondary, official KCGO 2024 | `curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`, SHA-256 `d53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953`; printed p.14 defines K3 as constructing suitable models, translating real situations into mathematical models and interpreting/checking results; printed p.22 lists K3.4 (multistep modeling with a few clear constraints) and K3.5 (interpreting results of such modeling). | Strong direct support for modeling, interpretation, and AB2; better competency route than K2.3. | The process standard does not enumerate all three representation forms in this target. It is not by itself a claim that every state’s subject-specific route names equations, inequalities and functions. |
| HE upper secondary, Q4.2 | Same official PDF, printed p.52 (physical PDF p.52; the current extraction cites p.51): “Begründen und interpretieren gegebener Terme”. Existing review row is at `mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json:2363-2366`. | Interpretation of given terms. | “Given” terms are not independently formulated relationships. Keep this as a partial supporting route, not the sole exact route for the compound goal. Correct the printed-page citation in any new record; do not rewrite the historical extraction. |
| BW upper secondary, BP2016 | `curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_M.pdf`, SHA-256 `b085465143648b3f44c894f8eb0a5ee5d1928cbb1c4c60b3b249559709d26014`; printed p.14, §2.3 “Modellieren”: the introductory text says to translate a situation into a mathematical model, find a result and interpret it in the real situation; competence 5 explicitly describes relations using variables, terms, equations, functions and other representations. Competences 7 and 10 cover selecting/constructing models and translating model results back to reality. Existing exact row: `mapping/DE-BW/upper-secondary/bw_math_upper_secondary_source_extraction_to_canonical_math.review.json:2417-2420`. | Strong route for equations/functions and contextual modeling/result interpretation. | The cited competence 5 does not list inequalities; the current row is broader than that specific source span. Preserve the old row and give it a partial limitation in a new current addendum unless a separately cited BW source supports inequalities. |
| HE lower secondary, G8 | G8 PDF physical p.28, topic 8G.1, `curricula/DE/Gymnasium/input/HE/lower-secondary/g8-mathematik.pdf`, SHA-256 `3f9df43b8b7f3b11bae47016ecc4f778f08c7d6588237e46cf10d57fc40ca6e9`; the page contains linear equations, simple inequalities, linear functions, systems, and real-life word-problem applications. Existing target row: `mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json:7249-7253`. | Relevant grade-level topic evidence for the listed forms in G8. | The extracted/mapped passage is only the broad application focus; its old `exact` match does not bind all the forms and interpretation claim to that passage. This route is not Q4 evidence. |
| HE lower secondary, G9 | G9 PDF physical p.30 / printed p.29, topic 9.1, `curricula/DE/Gymnasium/input/HE/lower-secondary/g9-mathematik.pdf`, SHA-256 `9325e34d90626faa5c42e800b74ef78c61a315da56e7fe20b368807448ad5749`; the page contains linear systems, real-life word-problem applications and optional linear inequality systems/optimization. Existing target row: `mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json:4429-4432`. | Relevant grade-level application and topic evidence for G9. | The extraction maps only a broad application focus, not a precise modeling/interpretation aspect. It does not establish a Q4/GK/LK target route. |

Source-route audit history: `fde-source-route-audit-20260924.md`. The current
all-relevant report gives a Baden-Württemberg classic route and lists HE G8,
G9, Q4.2, and SH as alternates; see the `fde351a8…` item in
`docs/qa-ci/status/goal-source-rationales-math-all-relevant.json`. That generated
report is not itself primary curriculum evidence.

## Current learner-facing projections

The target is currently exposed by direct `goalEntry` records in both
`composition-views/mathematik/de-he-seki-g8.view.json:740` and
`composition-views/mathematik/de-he-seki-g9.view.json:859`, under `Jahrgangsstufe
8/9 > Weitere Kompetenzen`. It is also present through the canonical Q4 subtree
in the HE Sek-II GK and LK views (`de-he-sekii-gk.view.json:428-437` and the
corresponding LK Q4 subtree).

The canonical target’s explicit `phase: Q4` and `tags: [GK, LK]` conflict with
the additional lower-secondary display. This is a current scope conflict, not
merely a stale hash. The lower-secondary source rows should not be used to
justify a Q4 source route. Whether HE G8/G9 should retain a separate learning
goal with their grade-specific scope is outside this target-only correction;
do not silently claim that this Q4 atom is grade 8/9 curriculum coverage.

## Least-change correction candidate

Apply only after a source/applicability owner accepts the scoped interpretation:

1. Change this goal’s process tag from `K2.3` to `K3.4` and `K3.5`. Keep its
   current German and English description unchanged in this first candidate;
   the independent current A/B description reviews already support that text.
2. Add a new, versioned HE K3 source-route record citing the official KCGO
   printed pp.14 and 22 and bind it as a direct *process-competency* source,
   not as a fabricated Q4.2 content mapping. Keep the existing Q4.2 historic
   mapping unchanged but classify its contribution as partial for this goal.
3. In the new current-route addendum, qualify the existing BW route as strong
   support for equations/functions and contextual modeling, but partial for
   the explicit inequality alternative until a direct BW citation is supplied.
   Preserve the original exact mapping review as historical data.
4. Remove only the two direct fde entries from the HE G8/G9 `Weitere
   Kompetenzen` lists. Preserve the HE G8/G9 source extraction and historical
   mapping reviews unchanged. Keep the Q4 canonical-subtree projection in HE
   GK/LK.
5. Do not claim that these HE/BW routes prove national source coverage for all
   15 listed jurisdictions. Any full national applicability statement needs
   its own current source/applicability evidence.

This corrects the competency family and the demonstrated stage-placement
conflict without paraphrasing the historical review records or pretending a
content-topic extraction was a process standard. If the source owner requires
each listed representation to be explicitly sourced for every applicable
scope, the least-change wording fallback is to remove “Ungleichungen” and
replace “Bedeutung der Terme” with “Modellergebnisse” only after a new dual
description review confirms that narrower objective.

## Gates and strict accounting

The current dual A/B keep/keep synthesis is exact-bound to the unchanged
description, not to this proposed context/source correction. The current
positive-understanding profile, atomicity, memory, page/context bindings, and
visualization/publication bindings must be checked against the accepted delta.
In particular, changing `dimensionTags` changes the review context; changing
the two composition views changes learner-facing scope and derived publication
artifacts. No current gate is inferred from this audit alone.

Current strict five-gate closure contribution: **+0**. `fde351a8…` remains
excluded from the central M7 report. The machine audit makes the source and
scope discrepancy more specific, but does not itself grant D/P/A/M/V or
publication approval. Separate human review and release gates remain
separate.

### Reproduction commands

Local Poppler was used for page text verification:

```bash
POPROOT="$PWD/tmp/skillpilot-poppler-utils/root"
PATH="$POPROOT/usr/bin:$PATH" \
LD_LIBRARY_PATH="$POPROOT/usr/lib/x86_64-linux-gnu:$POPROOT/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH" \
pdftotext -f 14 -l 14 -layout curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf -
```

The corresponding K3 AB-level text was read with the same command for physical
PDF p.22. BW printed p.14 is physical PDF p.16. G8 8G.1 is physical p.28; G9
9.1 is physical p.30 / printed p.29. No source mapping was edited.

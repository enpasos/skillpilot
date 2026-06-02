# MEM SPARQL Consistency PoC, 2026-06-01

This document records the first SkillPilot MEM/SPARQL consistency proof of concept for Mathematik/Gymnasium.

It is a historical PoC record. For the current durable process, use [MEM SPARQL Consistency Audit](../mem-sparql-consistency.md). For daily operation, use [MEM SPARQL Consistency Runbook](../mem-sparql-consistency-runbook.md).

## Objective

The PoC answered four questions:

- Can SkillPilot query the live MEM/FWU SPARQL endpoint reproducibly from local QA tooling?
- Which Mathematik/Gymnasium curriculum scopes are currently available in MEM?
- For concrete available scopes, how well do MEM competency-expectation texts match retained SkillPilot source extraction?
- Can discrepancies be written as a stable, non-blocking review queue?

The output was diagnostic evidence, not an authoritative curriculum decision.

## Initial Scope

- subject: `Mathematik`
- school type: `Gymnasium`
- local source evidence: `curricula/DE/Gymnasium/input/**/*.source-extraction.json`
- MEM endpoint: `https://sparql.mem.edufeed.org/sparql`
- config: `curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json`
- report: `docs/qa-ci/status/mem-sparql-consistency-audit.md`

Mathematik was a useful first PoC because SkillPilot already had broad local source-extraction evidence across Bundeslaender.

## Availability Baseline

The audit checked configured Bundeslaender for local Mathematik source extraction and matching MEM Mathematik/Gymnasium curriculum plans.

At the PoC stage, MEM exposed concrete comparison data for Bayern and Sachsen. Hessen remained visible in the availability lane: the endpoint exposed Hessen vocabulary, but no matching concrete Hessen Mathematik/Gymnasium curriculum plans. That was recorded as a watch issue, not as a SkillPilot defect.

## Bayern Result

The first concrete comparison was `Bayern Mathematik Gymnasium LehrplanPLUS`, because the MEM endpoint exposed usable Bayern Mathematik/Gymnasium plan and competency data.

After conservative markup normalization, the comparison aligned:

- 291 locally unique expectation texts
- 292 MEM expectation entries
- 292 matched MEM entries
- 0 MEM-only text issues
- 0 local-only text issues

## Sachsen Result

The second concrete comparison was `Sachsen Mathematik Gymnasium Lehrplan 2019`.

Configured MEM details:

- MEM graph: `https://w3id.org/lehrplan/sn/data`
- MEM plan class: `LP_0000818`
- MEM text node class: `LP_0002115` (`Lernziel und Lerninhalt (SN)`)

The Sachsen slice intentionally remained open. After the first source-extraction cleanup, conservative math-notation matching, source-scope triage, passage-context triage, and the `Zyklen` source-extraction correction, the remaining 73 raw text issues grouped into 49 review items:

- 0 `local_extraction_artifact`
- 6 `local_passage_only`
- 10 `source_scope_mismatch`
- 14 `notation_formula_representation`
- 17 `granularity_mismatch`
- 2 `possible_real_gap`

## Highest Signal Checks

The remaining `possible_real_gap` items were intentionally left for human review instead of being normalized away.

### Division

- side: MEM-only
- MEM ref: `https://lp-sachsen.org/resource/lernziel-lerninhalt-24943`
- PoC interpretation: a targeted MEM query placed `Division` as an intermediate node under `Beherrschen der Grundrechenarten für natürliche Zahlen`.
- Local context: the Sachsen extraction already contained `Umkehrung der Multiplikation` and related division routines in the same source passage.
- Review interpretation: wording/granularity review, not an automatic source gap.

### Bogenlaengen

- side: local-only LK
- local source line: Sachsen Sek II LK Integralrechnung, source line 2746
- PoC interpretation: the local extraction contained `Bogenlängen` as an official subitem row.
- MEM context: a targeted MEM query over the Sachsen Gymnasium Mathematik plan did not show an exact `Bogenlängen` label; the broader search found `Grad- und Bogenmaß`.
- Review interpretation: candidate for MEM/source-version coverage feedback.

## Procedure Used

1. Inspected MEM/FWU endpoint and ontology documentation.
2. Probed jurisdiction availability before deep comparisons.
3. Added concrete comparison slices only when graph, plan class, competency class, state IRI, subject IRI, and school-type IRI were known.
4. Queried MEM by following `BFO_0000051+` containment from plans to expectation nodes and reading German `rdfs:label` values.
5. Built a local source-text index from retained SkillPilot source-extraction goals.
6. Normalized conservatively: HTML entities, inline tags, non-breaking spaces, MEM image placeholders, dash variants, quote variants, and repeated whitespace.
7. Compared exact normalized texts.
8. Emitted non-blocking review issues.
9. Added deterministic triage using token overlap, substring evidence, and source-passage context.
10. Added a JSONL review ledger design so later human decisions can be carried forward only when evidence fingerprints still match.

## Boundaries

This PoC did not make MEM the primary source. It established a non-blocking QA usage loop and a review queue that can later support MEM-team feedback and source-extraction cleanup.

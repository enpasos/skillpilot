# MEM SPARQL Consistency PoC Procedure

This document captures the practical procedure for the first SkillPilot MEM/SPARQL consistency proof of concept.

The goal is not to make MEM the primary source immediately. The goal is to enter the intended MEM usage loop early: query the live ontology endpoint, compare what it exposes with SkillPilot's persisted source evidence, and turn discrepancies into reviewable issues.

## Objective

The PoC should answer four questions:

- Can SkillPilot query the live MEM/FWU SPARQL endpoint reproducibly from local QA tooling?
- Which Mathematik/Gymnasium curriculum scopes are currently available in MEM?
- For at least one concrete available scope, how well do MEM competency-expectation texts match our retained source extraction?
- Can discrepancies be written as a stable, non-blocking review queue?

The output is diagnostic evidence, not an authoritative curriculum decision.

## Initial Scope

The first configured scope is:

- subject: `Mathematik`
- school type: `Gymnasium`
- local source evidence: `curricula/DE/Gymnasium/input/**/*.source-extraction.json`
- MEM endpoint: `https://sparql.mem.edufeed.org/sparql`
- config: `curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json`
- report: `docs/qa-ci/status/mem-sparql-consistency-audit.md`

Mathematik is a good first PoC because SkillPilot already has broad local source-extraction evidence across Bundeslaender. A concrete text comparison starts with Bayern LehrplanPLUS because the MEM endpoint currently exposes usable Bayern Mathematik/Gymnasium plan and competency data.

Hessen remains in scope for availability tracking. At the current PoC stage, the endpoint exposes Hessen vocabulary, but no matching concrete Hessen Mathematik/Gymnasium curriculum plans. That is reported as a watch issue, not treated as a SkillPilot defect.

## Procedure

1. Inspect the MEM ontology and endpoint documentation.

   Use the public MEM/FWU docs to understand available graph structure, endpoint parameters, and common SPARQL patterns before writing code. Keep endpoint assumptions explicit in the config rather than hard-coding them into prompt logic.

2. Probe availability before doing deep comparisons.

   The audit first checks whether MEM can resolve Bundesland vocabulary and whether it exposes curriculum plans matching `Mathematik` and `Gymnasium`. This prevents false precision for jurisdictions where only vocabulary exists but no concrete plan data is available yet.

3. Select one concrete comparison slice.

   Add `concreteTextComparisons` only for a scope whose MEM graph, plan class, competency class, state IRI, subject IRI, and school-type IRI are known. For the initial PoC this is Bayern LehrplanPLUS.

4. Query MEM for competency expectations.

   The PoC treats MEM competency-expectation labels as secondary evidence. The current query follows `BFO_0000051+` containment from plans to expectation nodes and reads German `rdfs:label` values from the configured graph.

5. Build a local source-text index.

   The audit reads SkillPilot source-extraction goals for the same jurisdiction and subject. It indexes `parentBulletText`, falling back to `sourceText` or `sourceSpan`, and keeps source goal IDs and source references as evidence for review.

6. Normalize conservatively.

   Text normalization removes formatting noise such as HTML fragments, non-breaking spaces, dash variants, quote variants, and repeated whitespace. It should not rewrite curriculum meaning. Formula and notation mismatches should remain visible until reviewed.

7. Compare exact normalized texts.

   The first PoC uses exact normalized text matching. This is intentionally strict: it makes missing extraction text, MEM export differences, and formula/markup normalization gaps visible. Fuzzy matching can be added later as an aid, but should not silently hide discrepancies.

8. Emit review issues.

   The audit writes issue records into the generated JSON and Markdown reports. Issue categories distinguish endpoint failures, missing MEM plan availability, missing scope vocabulary, MEM-only expectation texts, and local-only expectation texts.

9. Keep the lane non-blocking.

   The command should exit successfully after producing a report even when review issues exist. It should fail only when a local script or configuration problem prevents report generation.

10. Triage findings outside the generated report.

   The generated report is not a decision ledger. Confirmed findings should be promoted into the appropriate existing work queue: source extraction correction, source mapping review, MEM query/config refinement, or MEM-team feedback.

## Runbook

Run the PoC from the app workspace:

```bash
cd app
npm run quality:mem-sparql-consistency
```

Expected artifacts:

- `docs/qa-ci/status/mem-sparql-consistency-audit.json`
- `docs/qa-ci/status/mem-sparql-consistency-audit.md`

Useful local verification after editing the PoC:

```bash
cd app
npx eslint scripts/generateMemSparqlConsistencyAudit.ts
cd ..
git diff --check
```

## Interpreting Results

Availability issues mean that SkillPilot has local source evidence for a Bundesland, but MEM currently does not expose a matching concrete plan for the configured subject and school type. This may simply reflect MEM rollout status.

MEM-only expectation issues mean that the endpoint returned an expectation text that did not exactly match the local source extraction after normalization. Possible causes include a real local extraction gap, a MEM export difference, or notation/markup normalization that is still too conservative.

Local-only expectation issues mean that SkillPilot has a local source expectation that did not exactly match MEM. Possible causes include local extraction artifacts, MEM missing data, different source versions, or formula text lost in one representation.

The first review pass should classify each discrepancy into one of these operational outcomes:

- local extraction defect to fix in SkillPilot;
- MEM endpoint/content question to raise with the MEM team;
- harmless representation difference that needs better normalization;
- real source-version difference that should remain documented;
- out-of-scope item for the current comparison slice.

## Expansion Criteria

Add another concrete comparison only when all of the following are true:

- MEM exposes concrete plan data for the scope, not just vocabulary.
- The graph IRI and relevant class IRIs are known.
- The local source-extraction artifact for the same source scope exists and is considered readable.
- The comparison can produce stable issue IDs and human-readable evidence references.
- The resulting issues can be triaged without blocking existing `CQR-*` readiness rules.

Good next candidates are scopes where SkillPilot already has complete source extraction and MEM exposes a clearly identifiable plan graph. Until then, use availability rows to track rollout without forcing false content comparisons.

## Boundaries

This PoC does not replace original source references, source-coverage ledgers, semantic atomicity review, memory-card review, or composition-view validation.

MEM is treated as a secondary consistency signal for now. It can become a stronger source later, but only after the endpoint coverage, data model, source-version semantics, and discrepancy workflow are stable enough for routine QA use.

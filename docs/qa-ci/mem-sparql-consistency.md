# MEM SPARQL Consistency Audit

This QA lane probes the live MEM/FWU Lehrplan ontology endpoint and compares the returned curriculum evidence with SkillPilot's persisted source-extraction artifacts.

It is intentionally non-blocking. The endpoint is external, the available MEM data is still incomplete across Bundeslaender, and current mismatches should become review issues, not failed builds.

## Scope

The initial proof of concept is configured for:

- subject: `Mathematik`
- school type: `Gymnasium`
- local evidence root: `curricula/DE/Gymnasium/input`
- MEM endpoint: `https://sparql.mem.edufeed.org/sparql`
- report: `docs/qa-ci/status/mem-sparql-consistency-audit.md`
- machine-readable report: `docs/qa-ci/status/mem-sparql-consistency-audit.json`

The current config lives at:

- `curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json`

The PoC procedure is documented in:

- `docs/qa-ci/mem-sparql-consistency-poc-procedure.md`

## Checks

The audit currently has two layers:

- availability: for every configured Bundesland, check whether SkillPilot has local Mathematik source extraction and whether MEM exposes matching Mathematik/Gymnasium curriculum plans.
- concrete text comparison: for configured MEM graphs, compare MEM competency-expectation labels against SkillPilot source-extraction source texts after conservative normalization.

The first concrete comparison is `Bayern Mathematik Gymnasium LehrplanPLUS`, because the MEM endpoint currently exposes concrete BY Mathematik/Gymnasium plan and competency data. Hessen remains visible in the availability lane; as of the current PoC run, the endpoint exposes Hessen vocabulary but no matching concrete Hessen Mathematik/Gymnasium curriculum plans.

## Issue Categories

- `MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE`: SkillPilot has local source extraction for the Bundesland, but MEM currently exposes no matching curriculum plan.
- `MEM_SCOPE_VOCAB_MISSING`: the audit could not resolve the configured MEM scope vocabulary.
- `MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE`: a MEM competency expectation was not found in the local source extraction.
- `LOCAL_EXPECTATION_NOT_FOUND_IN_MEM`: a local source-extraction expectation was not found in MEM.
- `MEM_ENDPOINT_UNREACHABLE`: the endpoint or a concrete comparison query failed.

## Run

```bash
cd app
npm run quality:mem-sparql-consistency
```

The command writes fresh report files and exits successfully when it found review issues. It should fail only for local script/configuration errors that prevent producing the report.

Use an alternate endpoint or config while experimenting:

```bash
cd app
npm run quality:mem-sparql-consistency -- --endpoint=https://sparql.mem.edufeed.org/sparql
npm run quality:mem-sparql-consistency -- --config=curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json
```

## Interpretation

The generated issues are a triage queue for later human review. They are not source-of-truth decisions and do not override existing SkillPilot provenance, source mapping, semantic atomicity, or memory-card ledgers.

Typical next steps after a run:

- inspect MEM-only and local-only text issues for normalization gaps, extraction defects, or real curriculum-source discrepancies;
- promote confirmed local extraction defects into the appropriate source-extraction or mapping review work queue;
- extend `concreteTextComparisons` only when the MEM graph and class vocabulary for a Bundesland/source are understood well enough to produce stable queries.

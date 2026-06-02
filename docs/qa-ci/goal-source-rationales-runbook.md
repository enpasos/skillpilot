# Goal Source Rationales Runbook

Status: PoC runbook  
Scope: generated human-readable source rationales for selected SkillPilot learning goals

## Purpose

This runbook describes how to run and inspect the first source-rationale PoC.

The generator answers this review question for one or more learning goals:

> How can a human reach the original curriculum source, inspect the extracted source evidence, and understand why the SkillPilot goal is justified by that evidence?

The current PoC deliberately uses only the classic reviewed SkillPilot route:

```text
canonical goal -> mapping review -> source extraction -> official source document
```

MEM/FWU SPARQL is rendered as an explicit unavailable route until the classic route is stable enough to compare against.

## Default Command

Run the canonical Mathematik PoC from the app directory:

```bash
npm run quality:goal-source-rationales:poc
```

This writes:

- `docs/qa-ci/status/goal-source-rationales-poc.md`
- `docs/qa-ci/status/goal-source-rationales-poc.json`

The default scope is canonical Gymnasium Mathematik with jurisdiction `DE-BY` and one selected PoC goal.

## Custom Goal Set

The script can render one or more selected goal IDs:

```bash
npx tsx scripts/generateGoalSourceRationales.ts \
  --jurisdiction=DE-BY \
  --goal=<goal-id> \
  --goal=<another-goal-id>
```

or:

```bash
npx tsx scripts/generateGoalSourceRationales.ts \
  --jurisdiction=DE-BY \
  --goals=<goal-id>,<another-goal-id>
```

Useful options:

- `--landscape=<path>` selects a different landscape JSON.
- `--mapping-root=<path>` selects the mapping-review root to scan.
- `--output-json=<path>` changes the JSON output.
- `--output-md=<path>` changes the Markdown output.
- `--jurisdiction=all` disables jurisdiction filtering.
- `--include-mem` adds a live MEM/FWU-SPARQL comparison where configured.
- `--mem-config=<path>` selects the MEM/FWU consistency config.

## MEM/FWU Showcase

Run the current Mathematik showcase with live MEM/FWU-SPARQL matches:

```bash
npm run quality:goal-source-rationales:mem-examples
```

This writes:

- `docs/qa-ci/status/goal-source-rationales-mem-examples.md`
- `docs/qa-ci/status/goal-source-rationales-mem-examples.json`

The showcase currently uses the Bayern Mathematik/Gymnasium LehrplanPLUS comparison because that scope is aligned in the MEM consistency audit. The generated rationale remains conservative: MEM/FWU is shown as a consistent alternate route, while the classic reviewed source route remains the primary provenance path.

For a non-technical reader-facing variant, run:

```bash
npm run quality:goal-source-rationales:mem-examples:plain
```

This writes:

- `docs/qa-ci/status/goal-source-rationales-mem-examples-plain.md`
- `docs/qa-ci/status/goal-source-rationales-mem-examples-plain.json`

This variant hides SkillPilot goal IDs in the visible explanation, names the learning goal by its SkillPilot path, and includes a concrete SPARQL query plus result-reading instructions for every MEM/FWU match.

## Review Checklist

For every rendered goal, inspect:

- `sourceRationaleStatus`
  - `classic_source_reviewed` is acceptable for the current PoC.
  - `classic_source_partial` is usable only if the mapping rationale explains the partial shape.
  - `classic_source_gap` means a non-blocking follow-up issue is needed.
- `Originalquelle Finden`
  - official URL or retained source path is present
  - source reference or searchable source hint is concrete enough
- `Extrahierter Quellenbeleg`
  - source document metadata is resolved
  - source goal ID and source reference match the mapping decision
  - Markdown excerpt is short; full extracted text remains in JSON
- `Warum das SkillPilot-Ziel begründet ist`
  - mapping rationale is present and understandable
  - exact, partial, split, or aggregate mappings are not overstated
- `MEM/FWU SPARQL-Route`
  - `mem_sparql_unavailable` is expected for the classic-only PoC
  - `mem_sparql_consistent` is expected for the configured Bayern showcase examples
  - do not treat MEM/FWU as primary evidence until a concrete scope has been accepted as primary-ready

## Follow-Up Issues

Create a manual review issue when:

- no classic source route is found for a requested visible atomic goal
- the route is only partial and the rationale does not explain the mapping shape
- the official source URL or retained source path is missing
- source document metadata cannot be resolved
- a MEM/FWU route later exists but disagrees with the classic route

These issues are non-blocking during the PoC. They become candidates for blocking QA only after SkillPilot defines a maturity level that promises public source explainability for visible learning goals.

## Related Documents

- [Human-Readable Source Rationales](../concept/curriculum-graph/human-readable-source-rationales.md)
- [Goal Source Rationales PoC](status/goal-source-rationales-poc.md)
- [Generated QA Status Artifact Registry](status/README.md)

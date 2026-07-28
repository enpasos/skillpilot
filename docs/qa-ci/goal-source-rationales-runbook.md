# Goal Source Rationales Runbook

Status: PoC-to-runtime runbook

Scope: generated human-readable source rationales for selected, all-relevant, and public source-backed SkillPilot learning goals

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
- `--no-md` skips Markdown output for runtime-only JSON indexes.
- `--goals=source-backed` derives all target goals that have reviewed source mappings in the selected scope.
- `--goals=source-backed-relevant-leaves` derives all relevant Mathematik leaf goals with at least one reviewed classic source mapping; `--jurisdiction` is then used as preferred rendered route, not as the item-set filter.
- `--goals=all-relevant-leaves` derives all relevant Mathematik leaf goals and renders missing classic source routes as gap entries.
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

## Runtime Public Index

The runtime path depends on the active curriculum source mode.

In repository mode, the Explorer source-rationale button lazily loads the
reviewed compatibility indexes from two exact public endpoints:

```text
/data/goal-source-rationales-math-public.json
/data/goal-source-rationales-physics-public.json
```

These large JSON indexes remain outside the JavaScript bundle and service-worker
precache. The repository-only controller exposes exactly these two files; the
generic deck route must not intercept them.

In package mode, `/data/**` is intentionally unavailable. The UI first discovers
source-evidence bindings through Catalog API 1.2 at
`/api/ui/curriculum-catalog` and then loads one generation-bound goal route from
`/api/ui/curriculum-source-evidence/packages/{packageId}/{packageVersion}/goals/{goalId}`.
There is no repository or classpath fallback in package mode.

Regenerate both repository compatibility indexes with:

```bash
npm run quality:goal-source-rationales:public
```

This writes:

- `app/public/data/goal-source-rationales-math-public.json`
- `app/public/data/goal-source-rationales-physics-public.json`

The indexes are repository-mode authoring compatibility artifacts only. Package
mode discovers and loads source evidence lazily from the active curriculum
package and never imports these indexes into the JavaScript bundle.

The Mathematik generator emits the gap-free public runtime subset of relevant
canonical leaf goals with at least one reviewed classic source mapping. It
prefers `DE-BY` where available so that the configured MEM/FWU Bayern comparison
remains visible and otherwise falls back to another reviewed classic route.

Verify the Mathematik index content and its MEM/FWU showcase invariants with:

```bash
npm run check:goal-source-rationales:math-public
```

After `npm run build`, verify that the repository compatibility files were
copied byte-identically into the backend static artifact, that the lazy
repository module references their `/data/...` endpoints, and that neither
hashed JSON copies nor service-worker precache entries were created:

```bash
npm run check:goal-source-rationales:build-artifact
```

After deployment, verify the live host in the same shape the browser uses. The
smoke test detects the curriculum source mode from the catalog endpoint:

- catalog `404`: validate both repository compatibility indexes and their
  payload invariants;
- Catalog API 1.2: validate every published source-evidence discovery entry
  with a real, generation-bound goal-evidence request.

```bash
npm run smoke:goal-source-rationales:deployment
```

For another host, pass a base URL:

```bash
npm run smoke:goal-source-rationales:deployment -- --base-url=http://127.0.0.1:8080
```

The repository deploy script runs this smoke test after restarting the production service. Override the target host with:

```bash
SKILLPILOT_BASE_URL=https://staging.example.org \
  ./deploy_skillpilot.sh --coach-variant openai-mcp
```

The current index is a scalable runtime step, not the final national coverage promise. It expands the UI from three hand-picked PoC goals to all currently source-backed relevant Mathematik leaf goals that the generator can derive from mapping reviews. Remaining uncovered leaf goals stay in the all-relevant report and gap-issue queue; relation rationales for `requires` and `contains` are still a separate rollout lane.

## Review Checklist

For every rendered goal, inspect:

- `sourceRationaleStatus`
  - `classic_source_reviewed` is acceptable for the current public runtime index.
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

- [Human-Readable Source Rationales](../concept/skill-graph/human-readable-source-rationales.md)
- [Goal Source Rationales PoC](status/goal-source-rationales-poc.md)
- [Generated QA Status Artifact Registry](status/README.md)

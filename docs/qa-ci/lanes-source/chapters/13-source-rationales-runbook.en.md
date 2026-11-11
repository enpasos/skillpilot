## Goal Source Rationales Runbook {#sec:qal-source-rationales}

This runbook documents generation, runtime serving, and verification of human-readable source rationales (`generateGoalSourceRationales.ts`) along the reviewed classic chain `canonical goal -> mapping review -> source extraction -> official source document` (concept specification in `docs/concept/skill-graph/human-readable-source-rationales.md`; status registry in [status/README.md](repo:docs/qa-ci/status/README.md)).

### PoC, Custom Goal Sets, and MEM/FWU Showcase Commands {#sec:qal-rationales-commands}

Run from `app/` for the Bavaria Mathematics PoC ([goal-source-rationales-poc.md](repo:docs/qa-ci/status/goal-source-rationales-poc.md) + `.json`), custom goal selections, and the Bavaria LehrplanPLUS live MEM/FWU showcases (`:plain` replaces UUIDs with readable SkillPilot paths and embeds concrete SPARQL queries):

```bash
cd app
npm run quality:goal-source-rationales:poc
npx tsx scripts/generateGoalSourceRationales.ts \
  --jurisdiction=DE-BY --goals=<goal-id>,<another-goal-id>
npm run quality:goal-source-rationales:mem-examples
npm run quality:goal-source-rationales:mem-examples:plain
```

Key CLI flags: `--landscape=<path>`, `--mapping-root=<path>`, `--output-json=<path>`, `--output-md=<path>`, `--no-md`, `--goals=source-backed | source-backed-relevant-leaves | all-relevant-leaves`, `--jurisdiction=all`, `--include-mem`, and `--mem-config=<path>`.

### Runtime Public Index (Repository vs. Package Mode) & Deployment Smoke {#sec:qal-rationales-runtime}

- **Repository mode:** The Explorer source-rationale button lazily fetches two compatibility indexes kept outside the JS bundle and service-worker precache: `/data/goal-source-rationales-math-public.json` (preferring `DE-BY` so aligned MEM/FWU examples stay visible) and `/data/goal-source-rationales-physics-public.json` (never intercepted by the generic deck route).
- **Package mode:** `/data/**` is disabled; the UI discovers bindings via Catalog API 1.2 (`/api/ui/curriculum-catalog`) and fetches generation-bound per-goal evidence from `/api/ui/curriculum-source-evidence/packages/{packageId}/{packageVersion}/goals/{goalId}` with zero repository/classpath fallback.

Regeneration, build-artifact verification, and live deployment smoke checks (invoked automatically by `./deploy_skillpilot.sh` after service restart, auto-detecting `404` repository mode vs. Catalog API `1.2` package mode):

```bash
cd app
npm run quality:goal-source-rationales:public
npm run check:goal-source-rationales:math-public
npm run check:goal-source-rationales:build-artifact
npm run smoke:goal-source-rationales:deployment
npm run smoke:goal-source-rationales:deployment -- --base-url=http://127.0.0.1:8080
cd ..
SKILLPILOT_BASE_URL=https://staging.example.org \
  ./deploy_skillpilot.sh --coach-variant openai-mcp
```

### Review Checklist and Follow-Up Issues {#sec:qal-rationales-checklist}

Inspect five items on every rendered goal:

1. **`sourceRationaleStatus`:** `classic_source_reviewed` (ready for public index), `classic_source_partial` (usable only when the rationale explains the partial fit), or `classic_source_gap` (open a non-blocking follow-up issue).
2. **Reaching the original source:** Official URL or retained source path plus a concrete section/search locator is present.
3. **Extracted source evidence:** Document metadata resolves, `sourceGoalId` and reference match the mapping decision, and the Markdown excerpt stays concise (full text remains in JSON).
4. **Why the SkillPilot goal is justified:** Understandable mapping rationale that never overstates `partial`, `split`, or `aggregate` mappings.
5. **MEM/FWU SPARQL route:** `mem_sparql_unavailable` for classic-only PoC runs and `mem_sparql_consistent` for aligned Bavaria showcase items (treated strictly as a secondary route until a scope is approved as primary-ready; file a manual review issue on disagreements or missing metadata).

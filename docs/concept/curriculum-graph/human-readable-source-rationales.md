# Human-Readable Source Rationales

Status: concept proposal  
Scope: generated provenance and origin explanations for SkillPilot learning goals and graph relations

## Purpose

SkillPilot should be able to answer a simple trust question for any learning goal:

> Why does this goal exist, and how can a human trace it back to the original curriculum source?

The answer should be a generated, human-readable source rationale. It is more than `sourceRef` and less than a full audit report. It should be a short structured text that explains:

- which learning goal or goals are being justified
- how to find the original source
- how SkillPilot extracted the relevant source text
- how the extracted source evidence maps to the SkillPilot goal
- whether an additional MEM/FWU SPARQL route currently supports or checks the same evidence
- what remains uncertain, if anything

This document proposes the conceptual model for that generated explanation.

## Design Goal

The generated text should be understandable to teachers, curriculum reviewers, and AI learning coaches. It should not require them to inspect JSON files first.

The same evidence should also be available as structured JSON so that UI, API, export packages, and MCP tools can render or cite it consistently.

## Long-Term Vision

The final goal is explainability for every relevant statement in a SkillPilot knowledge landscape:

- every learning goal
- every direct `requires` relation
- every direct `contains` relation

For each item, SkillPilot should be able to answer the human provenance question in plain text:

> Where does this come from, and why is this statement in the knowledge landscape?

For learning goals, this usually means tracing the goal back to source-extraction evidence and reviewed mapping decisions. For `contains`, it means explaining why a goal is part of a cluster, topic, subtree, or learner-facing composition. For `requires`, it means explaining the didactic prerequisite claim: which source evidence, modeling rule, review decision, or route-quality policy justifies saying that one goal should come before another.

This does not mean that every graph edge must be quoted directly from an official curriculum. Some relations are explicit in a source, while others are SkillPilot modeling decisions derived from source structure, source wording, competency granularity, didactic sequencing, or reviewed graph-quality rules. The generated rationale must state which case applies.

The first layer should be classical and algorithmic:

- deterministic lookup in source-extraction, mapping-review, composition-view, and graph-review artifacts
- structured JSON envelopes for goals and relations
- generated Markdown or API responses that expose the same evidence
- non-blocking issue queues for missing, ambiguous, stale, or disputed explanations

The later layer should extend this explainability into GPT-based SkillPilot usage. A GPT or MCP client should not invent provenance. It should retrieve the structured rationale, summarize it for the user, ask for more evidence when the status is weak, and make clear whether it is explaining a reviewed source route, a derived modeling decision, or an unresolved review issue.

## Non-Goals

- It is not a replacement for official curriculum sources.
- It is not a legal publication of full official curriculum text.
- It is not a new source-of-truth ledger.
- It must not infer provenance from goal wording alone when no reviewed mapping evidence exists.
- It must not treat MEM/FWU SPARQL data as a primary source before that route is explicitly classified as primary-ready for the relevant scope.

## Existing Evidence Chain

The classic SkillPilot route already has most of the required ingredients:

1. Canonical learning goal
   - landscape path
   - goal `id`, title, description, tags, program placements, composition-view context
2. Source-extraction artifact
   - `sourceDocument` or `sourceDocuments`
   - official URL, title, local path, text extraction path where available
   - extraction method and source-goal list
3. Mapping-review artifact
   - `sourceExtractionPath`
   - `sourceGoalId`
   - `sourceSpan`
   - `canonicalGoalIds`
   - `matchType`
   - reviewer, review date, rationale
   - evidence method
4. Quality state
   - source coverage status
   - mapping review state
   - optional semantic atomicity or other QA decisions
5. Optional MEM/FWU check
   - endpoint
   - graph IRI and concrete plan selection
   - retrieved text nodes or missing-coverage diagnostics
   - comparison result against the local source extraction
   - review issue and ledger state where applicable

The generated source rationale should assemble these pieces without redefining them.

## Output Shape

For one requested goal, the Markdown text should use this shape:

```md
# Source Rationale: <goal title>

## Goal
<goal id, title, description, subject/scope>

## Short Answer
This goal is justified by <source span> in <official source>. SkillPilot extracted this as <source goal id> and mapped it to the requested SkillPilot goal with match type <exact|partial|...>.

## How To Reach The Original Source
1. Open <official URL or local retained source path>.
2. Navigate to <page/section/sourceSpan>.
3. If using the local extraction pipeline, inspect <sourceExtractionPath> and optional extracted text path <textPath>.

## Extracted Source Evidence
- Source document: <title>
- Source goal: <sourceGoalId>
- Source span: <sourceSpan>
- Extraction method: <method>
- Source text excerpt: <short excerpt or omitted-with-pointer>

## Why This Supports The SkillPilot Goal
<mapping rationale, rewritten only lightly for readability>

## Mapping Shape
<exact|partial|aggregate|split> explanation, including whether one source goal supports several SkillPilot goals or several source goals jointly support this one.

## MEM/FWU SPARQL Route
<available and consistent | available with review issue | not available for this scope yet>

## Limitations
<missing source route, stale review, MEM coverage gap, source-version question, or no known limitation>
```

For multiple requested goals, the generator should produce:

- a shared summary
- one section per goal
- grouped source evidence where several goals share the same source document, source span, or mapping decision
- deduplicated source-access instructions
- a final limitations section for unresolved or partially traced goals

## Structured JSON Envelope

The Markdown should be rendered from a structured envelope, not composed ad hoc.

Draft shape:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-06-02T00:00:00Z",
  "request": {
    "goalIds": ["..."],
    "scope": {
      "country": "DE",
      "schoolType": "Gymnasium",
      "subject": "Mathematik"
    }
  },
  "items": [
    {
      "goal": {
        "id": "...",
        "title": "...",
        "description": "...",
        "landscapePath": "..."
      },
      "sourceRationaleStatus": "classic_source_reviewed",
      "classicSourceRoute": {
        "sourceExtractionPath": "...",
        "sourceDocument": {
          "title": "...",
          "url": "...",
          "path": "...",
          "textPath": "..."
        },
        "sourceGoalId": "...",
        "sourceSpan": "...",
        "matchType": "exact",
        "reviewDecisionId": "...",
        "reviewedAt": "...",
        "reviewer": "...",
        "rationale": "..."
      },
      "memSparqlRoute": {
        "status": "not_available_for_scope_yet",
        "endpoint": "https://sparql.mem.edufeed.org/sparql",
        "notes": "..."
      },
      "limitations": []
    }
  ]
}
```

The JSON should carry stable references and fingerprints. The generated Markdown should be treated as a view over this evidence.

## Status Levels

The generator should classify each goal:

- `classic_source_reviewed`
  - local official source extraction exists
  - reviewed mapping decision connects source goal and SkillPilot goal
  - source document reference is usable
- `classic_source_partial`
  - source route exists, but mapping shape is partial, aggregate, split, or otherwise needs explanation
  - still usable if the review rationale is explicit
- `classic_source_gap`
  - no reviewed source route is found for the goal
  - should create a QA issue, not silently generate a confident explanation
- `mem_sparql_consistent`
  - MEM/FWU route exists and agrees with the local source extraction for the relevant evidence
- `mem_sparql_review_needed`
  - MEM/FWU route exists but differs from local evidence or has a source-version/granularity issue
- `mem_sparql_unavailable`
  - no configured concrete MEM route exists for this scope yet

These levels can be combined. For example, a goal can be `classic_source_reviewed` and `mem_sparql_unavailable`.

## Classic Source Route

The classic route should remain the first implementation target.

Algorithm sketch:

1. Load the requested canonical landscape.
2. Find the requested goal IDs.
3. Search mapping-review files whose `canonicalGoalIds` contain each requested goal ID.
4. For each mapping decision, load its `sourceExtractionPath`.
5. Resolve `sourceGoalId` to the extracted source goal and source document metadata.
6. Render:
   - where to find the official source
   - where to find the retained source-extraction artifact
   - what source passage or source goal was extracted
   - how the reviewer justified the canonical SkillPilot mapping
7. If several mapping decisions support one goal, rank them:
   - exact before partial
   - current source scope before legacy or fallback evidence
   - learner-facing selected jurisdiction before broad canonical backup
8. Keep all candidates in JSON, but render the most relevant one first.

Important: a canonical goal may be broader or narrower than one source bullet. The generated text must explain this using the existing `matchType` and rationale instead of pretending that every mapping is one-to-one.

## MEM/FWU SPARQL Route

The MEM/FWU route should use the same output envelope, but its status must be explicit.

The route is promising because it can eventually make the source path more directly machine-readable:

1. Resolve jurisdiction, subject, school type, and stage to a concrete MEM graph and curriculum plan.
2. Query the configured endpoint for the relevant curriculum nodes.
3. Retrieve node labels, source text, hierarchy, and IRIs.
4. Match retrieved MEM nodes to the retained source extraction or directly to source-goal IDs where the data model supports it.
5. Add the MEM evidence to `memSparqlRoute`.
6. Mark the route as:
   - consistent
   - review-needed
   - unavailable
   - source-version-gap

Current integration principle:

- MEM/FWU SPARQL is a secondary route while endpoint coverage and concrete plan data are incomplete.
- It can strengthen or challenge the classic route.
- It should not override reviewed local source extraction without a human decision.
- If MEM has a better or more current source representation, the generated rationale should say that this is a candidate for review, not an automatic correction.

This mirrors the existing non-blocking MEM SPARQL consistency lane.

## Online Availability

There are two viable delivery modes.

### Static/Public Package Mode

For published SkillPilot subject packages:

- generate source-rationale JSON for all public goals
- generate optional Markdown excerpts for package inspection
- include the files in export packages
- expose them through stable public URLs

This is good for public transparency and offline review.

### Runtime/API Mode

For the online app:

- expose a goal-detail action: "Show source rationale"
- render the generated Markdown from the structured JSON envelope
- allow a teacher or reviewer to download the rationale
- expose a compact API or MCP tool for LLM coaches

Potential API shape:

```text
GET /api/landscapes/:landscapeId/goals/:goalId/source-rationale
POST /api/source-rationales
  { "landscapeId": "...", "goalIds": ["..."], "scope": {...} }
```

The response must not include learner mastery data. It is curriculum provenance, not learner state.

## Copyright And Excerpt Policy

The rationale should prefer precise source pointers over long copied source text.

Rules:

- include title, official URL, page/section, source span, and retained extraction path
- include only short excerpts where useful
- avoid publishing long passages from official curriculum sources unless the license and publication context clearly allow it
- make the full-source retrieval instructions explicit instead of embedding full source text

## QA And Issue Generation

The source-rationale generator should produce issues or queue items when:

- a requested goal has no reviewed source route
- a mapping decision has no rationale
- the referenced source extraction file is missing
- the source goal cannot be found in the source extraction
- MEM/FWU data conflicts with the local source route
- MEM/FWU data suggests a source-version gap
- fingerprints changed since a prior generated rationale

These should start as non-blocking diagnostics. Once a maturity level promises public explainability, missing rationales for visible goals can become a blocking rule for that maturity level.

## Suggested PoC

Start with canonical Gymnasium Mathematik because it already has extensive source extraction, mapping reviews, and the current MEM SPARQL PoC lane.

PoC deliverables:

1. `app/scripts/generateGoalSourceRationales.ts`
2. planned CLI options for the mature generator:
   - `--landscape=<path-or-id>`
   - `--goal=<goalId>` repeatable
   - `--goals=<comma-separated-goalIds>`
   - `--scope=<optional-json>`
   - `--format=json|md|both`
   - `--include-mem`
3. generated JSON and Markdown under `docs/qa-ci/status/` for a small selected goal set
4. a review queue for missing or ambiguous evidence
5. a first UI concept for the goal-detail panel

The first version should use only the classic source route. Add MEM/FWU output only after the classic route is stable.

Current first implementation step:

- Generator: `app/scripts/generateGoalSourceRationales.ts`
- Default report: `docs/qa-ci/status/goal-source-rationales-poc.md`
- Default JSON envelope: `docs/qa-ci/status/goal-source-rationales-poc.json`
- Current default scope: canonical Gymnasium Mathematik, jurisdiction `DE-BY`, one selected goal
- Current route status: classic reviewed source route only; MEM/FWU SPARQL route is rendered as explicitly unavailable for the first PoC
- Implemented CLI options: `--landscape`, `--mapping-root`, `--output-json`, `--output-md`, `--jurisdiction`, `--goal`, `--goals`, `--include-mem`, `--mem-config`
- Markdown intentionally uses shortened source excerpts; the JSON envelope retains full extracted evidence for tools and audits
- MEM/FWU showcase report: `docs/qa-ci/status/goal-source-rationales-mem-examples.md` renders selected Bayern Mathematik/Gymnasium goals with status `mem_sparql_consistent` where the live endpoint returns matching expectation texts
- Plain-language showcase report: `docs/qa-ci/status/goal-source-rationales-mem-examples-plain.md` renders the same evidence for non-technical readers using SkillPilot paths instead of internal goal IDs and concrete SPARQL verification queries

## Open Questions

- Should the public online view show only the best source route or all reviewed source routes?
- How much source text may be quoted in public pages for each jurisdiction?
- Should source rationales be generated for cluster goals, atomic goals, or both?
- How should a canonical goal with evidence from several Bundeslaender be summarized for a learner in one selected state?
- Should MEM/FWU become a primary route only per concrete scope after explicit acceptance?
- What maturity level should require a public source rationale for every visible atomic goal?

## Related Documents

- [Source And Resource Links](source-and-resource-links.md)
- [MEM/FWU Roundtrip Plan](mem-fwu-roundtrip-plan.md)
- [Goal Source Rationales Runbook](../../qa-ci/goal-source-rationales-runbook.md)
- [MEM SPARQL Consistency Audit](../../qa-ci/mem-sparql-consistency.md)
- [Curriculum Source Coverage Audit](../../qa-ci/status/curriculum-source-coverage-audit.md)

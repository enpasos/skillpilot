## Human-Readable Source Rationales {#sec:sga-source-rationales}

Every canonical learning goal in a SkillPilot skill landscape should be explainable back to official curricular evidence without requiring teachers or reviewers to inspect raw JSON ledgers or SPARQL outputs (operational commands live in [Source Rationales Runbook](repo:docs/qa-ci/goal-source-rationales-runbook.md)).

### Deterministic Explainability Envelope and Dual Evidence Routes {#sec:sga-sr-envelope}

`generateGoalSourceRationales.ts` compiles a deterministic `schemaVersion: 1` JSON envelope per goal combining two complementary evidence routes:

- **Status classification (`sourceRationaleStatus`):** `classic_source_reviewed` (backed by reviewed official source extraction and mapping), `partial` (incomplete or broader topic-level coverage), or `gap` (missing source proof, surfaced honestly under `limitations`).
- **Classic source route (`classicSourceRoute`):** Binds reviewed `source-to-canonical` mappings (`exact` or `partial`), official syllabus documents, section breadcrumbs, and short statutory locator excerpts.
- **MEM SPARQL route (`memSparqlRoute`):** Cross-references external Metadata for Educational Media (`MEM`) / FWU ontology alignments ([MEM SPARQL Audit](repo:docs/qa-ci/mem-sparql-consistency.md)) where available.

### Deterministic Ranking, Delivery Modes, and Copyright Discipline {#sec:sga-sr-ranking}

Candidate source records are ranked deterministically:

1. `exact` mappings precede `partial` mappings;
2. active/current state syllabi precede retired legacy snapshots;
3. sources matching the learner's selected jurisdiction precede nationwide or cross-state backup evidence.

In standalone curriculum package mode (@ref{sec:sga-dual-packages}), the runtime serves generation-bound evidence via Catalog 1.2 discovery rather than hardcoded repository paths, failing closed without falling back to stale static files. Official syllabus quotes remain strictly bounded short citation locators (never full-document reproductions) to respect statutory/publisher copyright boundaries.

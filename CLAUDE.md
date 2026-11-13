# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**`AGENTS.md` is the authoritative long-term memory** (concepts, policies, dated
Product Owner decisions); this file only adds the practical cornerstones needed
to work in the repo. If the two ever disagree, `AGENTS.md` wins — and update
both.

`AGENTS.md` is ~2,000 lines, so read the section you need instead of the whole
file: §0 provider/release decisions (dated log), §2 graph model and Personal
Curriculum, §3 `Goal` fields, §4 mastery, §5 frontier, §7 conventions for new
goals, §10 layers A/B/C, §11 ID and privacy, §12 AI adapters.

## What SkillPilot is

Open-source learning platform that models curricula as **skill graphs** (DAG of
learning goals) and drives AI learning coaches through MCP. The ordinary
learning start ("Lernen starten") offers Claude, ChatGPT Desktop (Beta) and
Gemini (Beta) as isolated provider lanes over the same saved learning record.
Three layers, kept strictly separate:

- **A – Landscape** (public, static JSON under `curricula/`): goals with
  `contains` (hierarchy) and `requires` (prerequisites). Must stay acyclic.
- **B – Learner state** (backend/PostgreSQL, per pseudonymous `skillpilotId`):
  mastery, focus, active goal, learning plans. Persisted goal results are the
  only source of progress.
- **C – AI adapters** (MCP/OAuth): the LLM never owns ground truth; backend
  decides, validates, persists and returns the next action.

## Repository map

| Path | Content |
|---|---|
| `app/` | React + TypeScript + Vite frontend (Cockpit, Workbench, trainer views) plus ~all curriculum/QA/docs tooling as `tsx` scripts in `app/scripts/` (500+ files, wired up as ~270 npm scripts in `app/package.json`) |
| `backend/` | Spring Boot 4.1 / Java 25 (Corretto, pinned via `.java-version`/`.corretto-version`), Gradle. Package `com.skillpilot.backend` (`openai/`, `claude/`, `connectors/{claude,gemini}/`, `oauth/`, `mcp/`, `service/`, `landscape/`, `composition/`, `completion/`, …). Serves the built frontend from `src/main/resources/static` |
| `curricula/` | Layer-A data. `curriculum_manifest.json` lists roots. Canonical German Gymnasium subjects: `curricula/DE/Gymnasium/canonical/`; retained state sources: `curricula/DE/Gymnasium/input/<STATE>/`; QA ledgers: `curricula/DE/Gymnasium/quality/`; memory decks: `curricula/DE/Gymnasium/memory-decks/`; images: `curricula/DE/Gymnasium/visualizations/` |
| `ai/claude/` | Claude connector v1 (`mcp-claude-v1.skillpilot.com`), MCP Apps resources, plugin, marketplace, MCP regression |
| `ai/openai plugin/`, `ai/openai candidates/`, `ai/openai-marketplace/`, `ai/openai app/` | OpenAI lane: plugin sources (`skillpilot-coach-v1` and its permanent successor identity `skillpilot-coach`), local release candidates, Git-marketplace beta mirror, MCP Apps prototype |
| `ai/gemini/` | Gemini lane: coach Skill, operator gateway, PoC (backend adapter `gemini-v1`) |
| `ai/openai custom gpt/` | Isolated legacy Custom GPT channel (frozen historical baseline) |
| `contracts/` | Versioned/published contracts and release evidence — published snapshots are immutable |
| `content/` | Optional external learning-material packages (link-only, never a dependency of canonical goals) |
| `scripts/` | Python/Node release checks, exam-bank builders, asset deployment |
| `docs/` | MkDocs site (`mkdocs.yml`, published to `enpasos.github.io/skillpilot`): `concept/`, `dev/`, `deploy/`, `qa-ci/` |
| `tmp/` | Scratch space for temporary files, logs, one-off scripts — **never write transient files to the repo root** |

**Search hygiene:** `tmp/` holds hundreds of GB, including nested repository
checkouts with their own `CLAUDE.md`/`AGENTS.md` copies; `site/` is the built
docs site. Scope every search to a concrete directory (`app/`, `backend/src`,
`curricula/…`, `docs/…`) — never grep or `find` from the repo root.

## Toolchain & commands

Node from `.nvmrc` (20.x), Java 25.0.2 Corretto, Python 3.11.

```bash
# Full required CI (application + curriculum) — run before committing cross-cutting changes
./run_ci.sh              # suites: all | application | curriculum | package | owl | full
                         # package: package/provisioning/consumer changes; owl: FWU-OWL/roundtrip changes

# Frontend
npm --prefix app run dev
npm --prefix app run build            # prepares runtime assets, goal books, tsc, vite
npm --prefix app run lint
npm --prefix app run test:<name>      # many focused suites, no aggregate `test` script;
                                      # each is a plain `tsx` file: (cd app && npx tsx scripts/<file>.ts)

# Curriculum validation / QA
npm --prefix app run validate:graph
npm --prefix app run validate:composition-views
npm --prefix app run check:transitive-minimality
npm --prefix app run validate:learning-units            # learning units in the canonical landscapes (R1, R3, R4)
npm --prefix app run quality:curriculum-status          # regenerate status
npm --prefix app run quality:curriculum-status:check    # + maturity-floor gate
python3 scripts/validate_schemas.py

# Backend (bootRun needs PostgreSQL; Liquibase migrates on startup — see backend/README.md)
cd backend && ./gradlew bootRun
cd backend && ./gradlew test --tests '<ClassName>'
cd backend && ./gradlew clean check

# Documentation-only changes: the five docs checks are much faster than run_ci.sh
npm --prefix app run check:docs-links
npm --prefix app run check:docs-indexes
npm --prefix app run check:terminology
npm --prefix app run check:generated-doc-notices
npm --prefix app run check:generated-status-registry
npm --prefix app run docs:skill-graph:web     # regenerate Graph Definition web pages + .tex (stdlib only, fast)
npm --prefix app run docs:skill-graph:full    # + diagrams and DE/EN PDFs (LuaLaTeX, Matplotlib)
pip install -r requirements-docs.txt && mkdocs build

# Release/review checks
node scripts/check_openai_plugin_review_freeze.mjs
node scripts/check_claude_plugin_v1_release.mjs
```

Commits follow Conventional Commits where a scope is meaningful
(`fix(openai): …`); branch off `main` and open pull requests against `main`.

Remote CI (`.github/workflows/ci.yml`) has two tiers: a draft PR gets only the
quick tier; marking it ready for review, or pushing to `main`, runs the
complete check as parallel jobs. Details: `docs/qa-ci/ci.md`.

## Non-negotiable invariants (details in AGENTS.md)

- **Graph**: no cycles in `requires`/`contains`; stable goal IDs; atomic goals
  are one assessable competence; descriptions "Die lernende Person kann …";
  no "Formelsammlung" wording; never blanket-convert `ae/oe/ue` to umlauts.
  Target state: every authored `requires` connects two atomic goals, and the
  relation is transitively minimal. The 12 November 2026 decision requires a
  complete deterministic current-state check within milestone validation,
  including necessary foreign prerequisites; failed or incomplete checks cap
  the subject and all its scopes at M0. No historical migration-preservation
  proof is required for this target gate. Current CQR coverage is the canonical
  Gymnasium catalog; inherited QA review bindings remain separately checked.
  Historical review reuse may use an explicitly bound certified frame only
  after full proof verification and dependency/applicability checks for the
  unchanged subjects. Changed subjects retain strict current-input reviews.
- **Mastery**: one binary result (`0`/`1`) per atomic goal. Cluster and
  learning-unit progress is derived from atomic descendants; no completion
  ever writes mastery to children. Exams and memory goals always need their
  own explicit results.
- **Curriculum data is evidence-bound**: changes under `curricula/` stay
  traceable to the official source; never invent goals, edges or source claims.
- **Maturity floors**: after curriculum/description/route/view changes,
  regenerate curriculum-quality status and ensure no protected maturity (e.g.
  M6/M7) drops. The complete catalog and QA scope pins directly require each
  applicable rule to pass; base-policy comparison forbids lowering pins or
  existing visibility coverage. Raise pins with any maturity gain. G17 also
  runs directly in curriculum CI, including M0 entries. `CQR-104` remains
  explicitly limited to eight scopes; the four unconfigured Sek II scopes
  have unresolved evidence gaps. `CQR-102` covers all twelve scopes, but the
  stronger semantic `GVR-012` remains Mathematics-only. Never turn a review
  queue green by bulk decisions.
- **Privacy**: the permanent `skillpilotId` never reaches an AI provider. In
  every provider lane OAuth only authorizes the connection; the learner is
  resolved through that lane's own `learningSessionId` (created by "Lernen
  starten", absolute lifetime ≤ 24 h, never extended by OAuth refresh, never
  shared across providers). **No chat prose/feedback text flows into the
  backend** (no `workFeedback`-style fields in coach mutation inputs).
- **Backend authority**: frontier, active goal, mastery, Verified Recall,
  exam evaluation and plan status are backend-owned; deterministic workflow
  steps belong in the server, not in prompts.
- **Immutability**: never overwrite published releases, rejected 1.0.0
  history, content-addressed UI resources, or hash-bound evidence. Drafts live
  under `contracts/drafts/`.
- **Scope of authorization**: no publishing, deployment, portal writes,
  credential changes or `record-published` without explicit user instruction.
  Local tests are not real-host acceptance; owner-reported observations are
  not traces.
- **Provider work order**: Claude beta → stable candidate → focused ChatGPT
  host-integration acceptance → submission. The ChatGPT Desktop Git-marketplace
  beta and the permanent OpenAI plugin identity `skillpilot-coach` at
  `https://mcp-openai.skillpilot.com/mcp` are the explicitly authorized
  exceptions; no speculative ChatGPT-specific extensions. Read `AGENTS.md` §0
  before any provider or release work — it changes often.
- **Licensing**: Apache-2.0 for software, CC-BY-4.0 for own curriculum content
  (see `LICENSING.md`); never relicense third-party material.

## Documentation rules

Full rules: `docs/dev/documentation-guidelines.md`.

- English by default; German only for German-specific audiences (curriculum
  law, Bundesland rollout, learner-facing German text). Never mix languages
  in one document; bilingual pairs use `.de.md` / `.en.md` and stay aligned.
- **Generated files are never edited by hand.** They start with a "Generated
  artifact" notice naming the script; change the source and regenerate. New
  generated reports are registered in
  `app/scripts/generatedMarkdownNoticeRegistry.ts`.
- The bilingual **Graph Definition compendium** is single-sourced in
  `docs/concept/skill-graph/source/` and compiled by
  `docs/concept/skill-graph/build_spec.py`. The pages it emits
  (`graph-definition*.md`, `learning-units*.md`,
  `learning-unit-progression*.md`, `assessment-gated-completion*.md`,
  `context-and-views.*.md`, `planning-and-budget.*.md`,
  `compendium-appendix.*.md`, `docs/qa-ci/graph-definition-rule-milestone-matrix*.md`,
  the PDFs and diagrams `00`, `08`–`16`) are build outputs — edit the source
  chapters/JSON instead.
- A new durable document goes into its section `index.md` **and** `mkdocs.yml`;
  dated dossiers and generated reports go into the section index only.
- Terminology is enforced: one concept, one name (`check:terminology` names
  the replacement for retired wording).

## Key docs

- `docs/concept/runtime-workflows/provider-neutral-coach-boundary.md` — canonical ChatClient/backend contract
- `docs/concept/runtime-workflows/learning-workflow.md` — goal-type workflows
- `docs/concept/curriculum-quality-and-human-trial.md` — maturity levels M0–M7, human trial
- `docs/concept/skill-graph/` — goal system, composition views, learning units, assessment-gated completion, visualizations, goal books, packages
- `docs/concept/didactic/unified-learning-plan-status.md` — learning-plan contract
- `docs/dev/mathematics-physics-learning-units-plan.md` — working plan for learning units (Mathematics, then Physics); units live in `programUnits`/`goalPlacements`, package contract `contracts/curriculum-package/v1.2/`
- `docs/dev/landscape-json-field-reference.md` — landscape JSON fields
- `docs/qa-ci/index.md` — QA lanes and CI rules for curriculum changes
- `docs/deploy/` — release runbooks (Claude connector, OpenAI plugin and Git beta, Gemini, OAuth); `claude-beta-chatgpt-release-strategy.md` for the work order

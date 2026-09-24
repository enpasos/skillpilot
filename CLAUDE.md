# CLAUDE.md

Quick orientation for Claude Code. **`AGENTS.md` is the authoritative long-term
memory** (concepts, policies, Product Owner decisions); this file only adds the
practical cornerstones needed to work in the repo. If the two ever disagree,
`AGENTS.md` wins — and update both.

## What SkillPilot is

Open-source learning platform that models curricula as **skill graphs** (DAG of
learning goals) and drives AI learning coaches (Claude, ChatGPT) through MCP.
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
| `app/` | React + TypeScript + Vite frontend (Cockpit, Workbench, trainer views) plus ~all curriculum/QA tooling as `tsx` scripts in `app/scripts/` |
| `backend/` | Spring Boot 4.1 / Java 25 (Corretto, pinned via `.java-version`/`.corretto-version`), Gradle. Package `com.skillpilot.backend` (`claude/`, `openai/`, `oauth/`, `mcp/`, `service/`, `landscape/`, `composition/`, …). Serves the built frontend from `src/main/resources/static` |
| `curricula/` | Layer-A data. `curriculum_manifest.json` lists roots. Canonical German Gymnasium subjects: `curricula/DE/Gymnasium/canonical/`; retained state sources: `curricula/DE/Gymnasium/input/<STATE>/`; QA ledgers: `curricula/DE/Gymnasium/quality/`; memory decks: `curricula/DE/Gymnasium/memory-decks/`; images: `curricula/DE/Gymnasium/visualizations/` |
| `ai/claude/` | Claude connector v1 (`mcp-claude-v1.skillpilot.com`), plugin, marketplace, MCP regression |
| `ai/openai plugin/`, `ai/openai app/` | OpenAI `skillpilot-coach-v1` plugin (successor target 1.1.0) and MCP Apps prototype |
| `ai/openai custom gpt/` | Isolated legacy Custom GPT channel (frozen historical baseline) |
| `contracts/` | Versioned/published contracts and release evidence — published snapshots are immutable |
| `content/` | Optional external learning-material packages (link-only, never a dependency of canonical goals) |
| `scripts/` | Python/Node release checks, exam-bank builders, asset deployment |
| `docs/` | MkDocs site: `concept/`, `dev/`, `deploy/`, `qa-ci/` |
| `tmp/` | Scratch space for temporary files, logs, one-off scripts — **never write transient files to the repo root** |

## Toolchain & commands

Node version from `.nvmrc` (20.x), Java 25.0.2 Corretto.

```bash
# Full required CI (application + curriculum) — run before committing cross-cutting changes
./run_ci.sh              # suites: all | application | curriculum | package | owl | full

# Frontend
npm --prefix app run dev
npm --prefix app run build            # prepares runtime assets, goal books, tsc, vite
npm --prefix app run lint
npm --prefix app run test:<name>      # many focused suites; each is a plain `tsx` file, run single tests with `npx tsx <file>`

# Curriculum validation / QA
npm --prefix app run validate:graph
npm --prefix app run validate:composition-views
npm --prefix app run quality:curriculum-status          # regenerate status
npm --prefix app run quality:curriculum-status:check    # + maturity-floor gate
python3 scripts/validate_schemas.py

# Backend (needs PostgreSQL, see backend/README.md)
cd backend && ./gradlew bootRun
cd backend && ./gradlew test --tests '<ClassName>'
cd backend && ./gradlew clean check

# Release/review checks
node scripts/check_openai_plugin_review_freeze.mjs
node scripts/check_claude_plugin_v1_release.mjs
```

## Non-negotiable invariants (details in AGENTS.md)

- **Graph**: no cycles in `requires`/`contains`; stable goal IDs; atomic goals
  are one assessable competence; descriptions "Die lernende Person kann …";
  no "Formelsammlung" wording; never blanket-convert `ae/oe/ue` to umlauts.
- **Maturity floors**: after curriculum/description/route/view changes,
  regenerate curriculum-quality status and ensure no protected maturity (e.g.
  M6/M7) drops. Never turn a review queue green by bulk decisions.
- **Privacy**: the permanent `skillpilotId` never reaches an AI provider.
  OpenAI uses OAuth + independent 24 h `learningSessionId`; Claude uses the
  OAuth subject. **No chat prose/feedback text flows into the backend** (no
  `workFeedback`-style fields in coach mutation inputs).
- **Backend authority**: frontier, active goal, mastery, Verified Recall,
  exam evaluation and plan status are backend-owned; deterministic workflow
  steps belong in the server, not in prompts.
- **Immutability**: never overwrite published releases, rejected 1.0.0
  history, content-addressed UI resources, or hash-bound evidence. Drafts live
  under `contracts/drafts/`.
- **Scope of authorization**: no publishing, deployment, portal writes,
  credential changes or `record-published` without explicit user instruction.
  Local tests are not real-host acceptance.
- **Work order (Sept 2026)**: Claude beta → stable candidate → focused ChatGPT
  integration acceptance → submission. No new ChatGPT beta paths.
- **Licensing**: Apache-2.0 for software, CC-BY-4.0 for own curriculum content
  (see `LICENSING.md`); never relicense third-party material.

## Key docs

- `docs/concept/runtime-workflows/provider-neutral-coach-boundary.md` — canonical ChatClient/backend contract
- `docs/concept/curriculum-quality-and-human-trial.md` — maturity levels M0–M7, human trial
- `docs/concept/skill-graph/` — goal system, composition views, visualizations, goal books, packages
- `docs/concept/didactic/unified-learning-plan-status.md` — learning-plan contract
- `docs/deploy/` — release runbooks (OpenAI plugin, Claude, OAuth)

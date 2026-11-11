# SkillPilot Personalization, Learner Runtime & Coach Architecture — Canonical Single Source

This directory is the canonical bilingual single source (`DE` / `EN`) for the
**Personalization, Learner Runtime & Coach Architecture** compendium
(`runtime-workflows` in `docs/compendia.json`).

## Scope

It unifies the ten active personalization, learner-runtime, and MCP coach
architecture specifications into a single bilingual reference volume (Web
Markdown + LuaLaTeX PDF):

1. `01-levels-of-personalization.{de,en}.md` — Levels of Personalization (`docs/concept/levels-of-personalization.{md,de.md}`)
2. `02-learning-workflow.{de,en}.md` — Learning Workflow (`docs/concept/runtime-workflows/learning-workflow.{md,de.md}`)
3. `03-client-state-sync.{de,en}.md` — Client-State Sync for Browser SRS Progress (`docs/concept/runtime-workflows/client-state-sync.{md,de.md}`)
4. `04-import-export-workflow.{de,en}.md` — Import/Export Workflow (`docs/concept/runtime-workflows/import-export-workflow.{md,de.md}`)
5. `05-portable-agent-runtime.{de,en}.md` — Portable Agent Runtime Architecture (`docs/concept/portable-agent-runtime-architecture.{md,en.md}`)
6. `06-provider-neutral-coach-boundary.{de,en}.md` — Communication Contract Between ChatClient and Backend (`docs/concept/runtime-workflows/provider-neutral-coach-boundary.{md,en.md}`)
7. `07-skillpilot-owned-coach-architecture.{de,en}.md` — SkillPilot Coach Product and Provider Topology (`docs/concept/runtime-workflows/skillpilot-owned-coach-architecture.{md,en.md}`)
8. `08-openai-mcp-oauth-session.{de,en}.md` — OpenAI MCP App OAuth and 24h Learning-Session Binding (`docs/concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.{md,en.md}`)
9. `09-openai-coach-behavioral-integration.{de,en}.md` — Behavioral Integration of the MCP Learning Coach (`docs/concept/runtime-workflows/openai-mcp-coach-behavioral-integration.{md,en.md}`)
10. `10-openai-plugin-versioning-lifecycle.{de,en}.md` — OpenAI Plugin Versioning and Lifecycle (`docs/concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.{md,en.md}`)

Superseded or rollback-only documents (`daily-learning-progress.md`,
`chatgpt-visible-session-flow.md`, `chatgpt-startcode-session-flow.md`) remain
untouched as standalone historical/rollback references.

## Build Commands

```bash
# Regenerate bilingual Web Markdown pages and intermediate LaTeX
python3 scripts/build_compendia.py --compendium runtime-workflows --web-and-tex

# Build DE + EN LuaLaTeX PDFs (strict 0-overflow / 0-warning check)
python3 scripts/build_compendia.py --compendium runtime-workflows --pdfs

# Verify OpenAI plugin & coach contract assertions
node scripts/check_skillpilot_coach_plugin.mjs
```

## SkillPilot Learning Coach: Product and Provider Architecture {#sec:skillpilot-owned-coach}

:::note{title="Status and Contract Map"}
Durable product and system topology of the multilingual SkillPilot Coach. Turn boundaries and input/output rules live in @ref{sec:provider-neutral-coach-boundary}, OAuth and 24h session binding in @ref{sec:openai-mcp-oauth-session}, visible coaching behavior in @ref{sec:openai-coach-behavior}, versioning including the 19 October 2026 decision establishing the permanent neutral `skillpilot-coach` identity (`https://mcp-openai.skillpilot.com/mcp`) in @ref{sec:openai-plugin-versioning}, and operational runbooks under `docs/deploy/`.
:::

### Product decision and multilingual plugin structure {#sec:coach-arch-product}

SkillPilot delivers its coach as a provider-hosted conversation backed by authenticated SkillPilot tools:

- Model inference, open dialogue, and optional widget UIs run on the provider using the learner's own consumer account; SkillPilot invokes no paid model API on this path and never resells model tokens.
- Curriculum, personalization, focus, frontier, active goal, mastery, recall, assessments, and persistence remain entirely inside the SkillPilot backend.

The multilingual OpenAI plugin (`skillpilot-coach` under the neutral cutover decision in @ref{sec:plugin-decision-2026-10-19}; historically `skillpilot-coach-v1` in the preserved `1.1.2` Git beta) bundles:

- one neutral-English control-plane skill,
- one directly bound MCP server on a stable public origin (`https://mcp-openai.skillpilot.com/mcp`),
- one language-neutral tool catalog,
- two independently bound, content-addressed MCP Apps UI resources (goal visualization and flashcard practice),
- separate real-host acceptance suites per released interaction language and client surface (German, English, and future languages share the same plugin via the session-bound `communicationLocale`).

### System topology and layer responsibilities {#sec:coach-arch-topology}

```text
SkillPilot WebGUI (configure Level 2, click "Start Learning")
  |  fresh learningSessionId + prepared launch prompt
  v
ChatGPT: SkillPilot Coach
  |  neutral skill, neutral tool catalog, optional MCP Apps UIs
  |  HTTPS + OAuth Bearer + learningSessionId
  v
https://mcp-openai.skillpilot.com/mcp
  v
OpenAI V1 Provider Adapter inside Spring Boot (/internal/openai/v1/mcp)
  |  AuthN/AuthZ, rate limits, JSON schemas, safe state projection
  v
CoachToolFacade + CoachStateProjection
  v
LearnerService + Curriculum + Database
```

Provider adapters, domain services, and persistence run inside the single `skillpilot-server` deployment with no separate gateway process.

:::table{cols="4.4cm,X"}
| Layer | Responsibility |
| --- | --- |
| **First-Party WebGUI** | Permanent ID, provider notice, Level-2 editor, explicit session launch, and Cockpit fallback |
| **Provider Host** | LLM, chat UI, skill activation, tool selection, and optional sandboxed widget rendering |
| **Plugin Package** | Installable bundle of manifest, skill tree, MCP endpoint config, and release metadata |
| **Coach Skill** | Repeatable pedagogical dialogue behavior without domain-state authority |
| **Provider Adapter** | OAuth/scopes, tool catalog, schemas, rate limits, safe projection, and provider UI metadata |
| **`CoachToolFacade` & `CoachStateProjection`** | Compact provider-neutral domain use cases and explicit allowlist of model-visible state |
| **Domain Runtime** | Curriculum, state machine, valid transitions, transactions, idempotency, and persistence |
:::

### Web-first onboarding, safe projection, and UI surface {#sec:coach-arch-projection}

- **Web-first Level 2:** Permanent SkillPilot ID, base curriculum/view, jurisdiction, duration model, stage, subjects, and course profiles are configured exclusively in the first-party WebGUI; the V1 coach contract neither asks for nor mutates them in chat, referring incomplete profiles back to the WebGUI while keeping Level-3 focus and `activeGoal` adjustable via fresh backend options.
- **OAuth vs. 24h learning session:** OAuth authenticates the integration; every confirmed WebGUI launch independently mints an absolutely expiring 24-hour `learningSessionId` (never extended by OAuth token refresh; see @ref{sec:openai-mcp-oauth-session}).
- **Safe state projection:** Providers never receive raw `UnifiedLearnerStateResponse` or internal domain entities: permanent IDs and copy-provenance are stripped, tasks are separated from solutions/rubrics (unlocked only inside the protected active evaluation use case), URLs/math are normalized, model facts go into `structuredContent`, and widget-private data stays inside `_meta`.
- **Two dedicated MCP Apps resources:** `render_skillpilot_goal_visualization` binds the active content-addressed image resource; `start_skillpilot_memory_practice` binds the interactive flashcard resource (`release/line.json` is the single source of active hashes while previously served image URIs remain passively readable byte-for-byte). App-only card review and all other tools stay UI-unbound, and the text-only learning path remains self-sufficient.

### Grading boundary, multi-provider adapters, and 8 release gates {#sec:coach-arch-gates}

The provider model compares visible learner work semantically against backend-released reference solutions/rubrics, while the backend alone governs release eligibility, active goal/attempt identity, batch completeness, stale/replay rejection, and state updates. Additional providers (such as Claude or Gemini) receive their own auth/transport adapters, reviewed tool catalogs, and dedicated end-to-end acceptance runs atop the shared `CoachToolFacade` and `CoachStateProjection`.

Before public release, **all 8 gates** must pass together: (1) contract, schema, security, and domain suites, (2) byte-exact source/draft parity, (3) OAuth, session, expiry, and recovery checks, (4) real Golden Journeys on the live provider model, (5) desktop, mobile-web, and target native surfaces, (6) every released interaction language, (7) privacy, minor-protection, support, and submission checks, and (8) telemetry, rollback readiness, and intact Cockpit usability.

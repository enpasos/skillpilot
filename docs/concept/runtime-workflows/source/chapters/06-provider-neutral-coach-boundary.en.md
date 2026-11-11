## Communication Contract Between ChatClient and SkillPilot Backend {#sec:provider-neutral-coach-boundary}

:::note{title="Status and Scope"}
Canonical, provider-neutral communication norm governing every SkillPilot learning coach (OpenAI MCP App, Claude Connector V1, Gemini Connector V1, future provider adapters, and all new coach tools). Security, session, didactic, and deployment specs refine this boundary without ever redefining it inconsistently. Passing tests on one provider lane (such as Gemini's controlled web check in the [Gemini Integration Runbook](repo:docs/deploy/gemini-integration.md)) never implies acceptance of other hosts, accounts, or surfaces.
:::

### Core boundary, responsibility matrix, and minimal turn contract {#sec:coach-boundary-matrix}

:::principle{title="One Sentence Defines the Boundary"}
The ChatClient understands and phrases; the backend knows, decides, validates, persists, and supplies the next technical step.
:::

Language models excel at understanding natural language, spotting domain patterns, teaching dialogically, and comparing semantically equivalent solutions; the backend excels at identity, authoritative state, exact sets and ordering, permissions, transactions, concurrency, persistence, and reproducible state transitions.

:::table{cols="3.2cm,6.0cm,X"}
| Participant | Owns | Explicitly does not own |
| --- | --- | --- |
| **Learner** | Learning intent, answers, natural phrasing, explicit consent | technical IDs, state versions, retry keys, tool call sequences |
| **ChatClient / Model** | Natural-language understanding, unambiguous mapping to fresh options, didactic dialogue, semantic solution comparison, phrasing | authoritative learning state, candidate sets, workflow progress, persistence receipts, authorization |
| **Provider adapter** | Compact use-case tool surface, safe projection, localized rendering, transport binding | separate domain DB, raw domain DTOs, prompt-only security guarantees |
| **SkillPilot Backend** | Identity, session, curriculum, personalization, focus, active goal, frontier, mastery, recall, exam unlock, IDs/capabilities, sets, order, state, concurrency, idempotency, persistence, continuation | open-ended natural-language parsing or semantic grading of visible learner work |
| **App Widget** | Direct deterministic interaction inside its bounded UI workflow | replacement for backend truth or general chat orchestration |
:::

Interaction language (`communicationLocale` on the latest authoritative full result) is likewise backend state — never guessed from tool names, host locale, or curriculum language.

#### Minimal turn contract

```text
new learner message -> exactly one fresh full context -> decision:
  +-- speak / ask / bound UI action --> visible reply
  +-- at most one unambiguous mutation --> authoritative successor state
        +-- re-apply continuing unambiguous intent
        +-- speak / bound UI action --> visible reply
```

1. Load fresh context **exactly once** after a new learner message; intra-turn polling is forbidden.
2. The latest successful full state is the sole authority for language, state, options, and allowed actions.
3. Every successful mutation returns its complete successor state, replacing prior context for the rest of the turn (making extra context reloads redundant).
4. Narrow renderer or widget receipts are never full contexts.
5. On state conflict, reload context once and re-evaluate; repeated conflicts or hard errors halt structured execution transparently.

### Tools and inputs: semantically minimal, zero chat free text {#sec:coach-boundary-inputs}

Tools model cohesive learner actions rather than 1:1 internal service calls: backend-derivable parameters stay out of model inputs, item loops become atomic batch operations, distinct permission/confirmation boundaries stay separate tools, and reads vs. writes carry truthful annotations.

#### Hard boundary: zero chat free text to Core

The coach evaluates visible learner work and phrases feedback autonomously inside the provider chat — neither verbatim answers nor paraphrases or grading rationales are sent to the backend. Free-text fields for work, outcome, or recall feedback are forbidden in active coach mutations (unknown extra properties are rejected prior to domain invocation, replay hashing, and persistence):

- **Ordinary goal:** Structured completion decision $\rightarrow$ backend verifies active goal, eligibility, and state rules, returning goal, mastery, and successor state.
- **Verified Recall:** Exclusively the structured `passed` booleans for the authorized batch; learner answers and explanations stay in chat.
- **Assessment / Exam:** Authorized numeric score; rubric reasoning, partial-point commentary, and pass explanation stay in chat.

Didactic pacing: after finishing an exercise, the coach discusses it, offers questions or continuation, and waits; once sufficient evidence proves an ordinary goal or passed exam, the structured completion write fires immediately **before** claiming saved progress (whereas orientation and Verified Recall retain explicit learner consent prior to saving). Explanation, task, and goal image for a backend-selected successor start only after recognizable learner agreement to continue. Open questions never pre-populate suggested learner answers, and transport timeouts trigger clean recovery rather than invented "server unreachable" claims.

Model inputs carry only semantically mapped structured choices, semantic grading decisions (`passed`), or verbatim-copied fresh option payloads / opaque capabilities (plus `expectedStateVersion` and fresh `clientRequestId` on general V1 writes).

### Outputs, opaque capabilities, and Verified Recall reference {#sec:coach-boundary-recall}

- **Output channels:** `structuredContent` holds only model-needed facts; `content` at most a concise summary; `_meta` strictly widget-private data (never cross-turn memory).
- **Single imperative channel:** Ordinary full context uses `(requiredAction, instruction)`; a completed specialized workflow emits a single `continuation` (optionally carrying a server-filled `toolCall`). A parallel `presentationAction` or implicit UI binding on a domain write tool is forbidden.
- **Opaque capabilities:** Encapsulate session, workflow, and state authority (authenticated-encrypted whenever confidentiality matters), are forwarded verbatim by the model, and are validated server-side for completeness, staleness, and replay.

#### Verified Recall reference flow and terminal image handoff

```text
start_skillpilot_verified_recall(learningSessionId)
  -> complete server-owned batch + batchCapability
get_skillpilot_verified_recall_answers(learningSessionId, batchCapability)
  -> complete ordered reference answers + gradingCapability
record_skillpilot_verified_recall_results(learningSessionId, gradingCapability, assessments[{passed}])
  -> single atomic receipt + single continuation
```

When a terminal Recall write activates an ordinary atomic successor goal with an authorized visualization, the sole continuation is:

```json
{
  "continuation": {
    "action": "renderGoalVisualizationThenTeachActiveGoal",
    "consentRequired": false,
    "toolCall": {
      "name": "render_skillpilot_goal_visualization",
      "arguments": {
        "goalId": "<server-filled successor goal>",
        "expectedStateVersion": 11
      }
    }
  }
}
```

The ChatClient copies tool name, server-filled `goalId`, and `expectedStateVersion` unchanged, adding only the already current unchanged `learningSessionId` under the global session gate — the Recall receipt deliberately does not mirror that session capability. The client invokes `continuation.toolCall` (`render_skillpilot_goal_visualization`) exactly once immediately and begins teaching the already active successor goal in the same turn without reconstructing image arguments from `goalVisualization` or `nextAllowedTools` and without reloading context (`reload context` is forbidden). If rendering fails or the host omits the widget, do not retry; full text instruction proceeds unchanged. Only the dedicated renderer binds image UI; the Recall mutation itself never binds image UI.

### Choice, errors, privacy, anti-patterns, and 11-point gate {#sec:coach-boundary-acceptance}

- **Explicit choice & errors:** Genuine choices publish a small fresh option set (copied verbatim when unambiguous; clarified only when genuinely ambiguous). Errors return stable codes with zero partial mutation and localized recovery instructions; session errors end exclusively with the first-party WebGUI start instruction, whereas widget rendering failures never block valid text coaching.
- **Privacy & anti-patterns:** Permanent SkillPilot IDs, OAuth tokens, client secrets, raw internal DTOs/paths, and unreleased solutions never enter model outputs. Forbidden anti-patterns include per-card/per-goal loops, optional parameters duplicating backend state, competing imperative fields, redundant post-mutation context reads, prompt-only safety rules, model-synthesized IDs/URLs, unreceipted save claims, exact-string backend NLP, and any chat free text in tool inputs or persistence.
- **Single rule home & 11-point acceptance gate:** Every rule has one authoritative home (this contract, @ref{sec:openai-coach-behavior}, @ref{sec:skillpilot-owned-coach}, @ref{sec:openai-mcp-oauth-session}, [Unified Learning-Plan Status](repo:docs/concept/didactic/unified-learning-plan-status.md), `SKILL.md`, tool schema, backend guard, and `docs/deploy/`). Every interface change must pass all **11 gate questions**: (1) one cohesive user action per tool, (2) zero backend-derivable inputs, (3) zero model loops, (4) single authoritative continuation, (5) backend rejection of incomplete/duplicate/stale/unauthorized calls, (6) exact retry vs. new-operation distinction, (7) receipt-backed state claims, (8) language/semantic judgment in ChatClient, (9) valid/invalid/adversarial contract tests, (10) real provider trace with zero extra polls, (11) complete exclusion of chat prose from active inputs, echoes, and storage.

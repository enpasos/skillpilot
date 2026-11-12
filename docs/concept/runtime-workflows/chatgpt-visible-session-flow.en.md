# Custom GPT: Visible Emergency Fallback

Status: visibly relayed emergency fallback branch of the current interim Custom GPT. It is
neither the ordinary Custom GPT start flow nor the reference architecture. The current
interim design combines private start-code redemption with this fallback and is documented
under [Custom GPT as an Interim Channel](../../deploy/openai-custom-gpt-interim.md).
The multilingual V1 MCP contract remains the target architecture.

This document describes exclusively the visible emergency fallback branch of the two newly
created GPTs `SkillPilot GPT Coach (de)` and `SkillPilot GPT Coach (en)`. The configuration
is called **Visible Session** because every value required by a subsequent ChatGPT Action
call is carried visibly through the conversation. It is not an old GPT configuration kept
around for archival compatibility.

This architecture works around the observed ChatGPT regression in which a Custom GPT can no
longer reliably reuse values from an earlier invisible Action response after the next user
turn. The backend remains authoritative for learner state, state machine, permitted
transitions, and mastery.

The current multilingual V1 contract is the
[OpenAI MCP App with OAuth App Binding and 24h Learner Session](openai-mcp-oauth-learner-session-architecture.md).
It authenticates the app via a fixed confidential OAuth client and additionally requires
the learner session — freshly minted at every **Start learning** action and bounded to an
absolute maximum lifetime of 24 hours — as a mandatory argument on every domain tool.
SkillPilot inserts this session automatically into the prepared start message. The
permanent SkillPilot ID remains exclusively inside the backend; OAuth alone never selects a
learner.

The earlier start-code/redeem architecture once again provides the private default start of
the interim Custom GPT. Its historical transport details are documented in
[ChatGPT Startcode/Session Flow](chatgpt-startcode-session-flow.md).

## Architectural Boundaries

| Area | Knows the permanent SkillPilot ID? | Knows the temporary session token? |
| --- | --- | --- |
| Browser/Cockpit | yes | briefly at start: yes |
| SkillPilot Backend | yes; resolves the session to it internally | stored only as a hash |
| ChatGPT/Custom GPT, private default start | no | yes; inside Action context only |
| ChatGPT/Custom GPT, visible emergency start | no | yes; visible in chat |
| Links emitted by the coach | no | no |

The permanent SkillPilot ID stays in the browser and in the SkillPilot backend. By
contrast, the visible `sps_...` token is temporary bearer access to the single mapped
pseudonymous learner state. By default it is valid for 24 hours and is capped server-side at
a maximum of 24 hours. Its lifetime is absolute and is not extended by usage.

Because the token appears in the conversation, active chat exports, share links, or
screenshots containing this footer must not be shared publicly while the session is valid.
Global learning-goal IDs, on the other hand, are intentionally visible, stable domain
references rather than credentials.

## Start Flow

```text
Browser/Cockpit        SkillPilot-Backend       neuer DE- oder EN-GPT
      |                         |                           |
      | POST .../visible-chat-start                        |
      |------------------------>|                           |
      |                         | Sitzung erzeugen,         |
      |                         | Token hashen, ID binden   |
      |<------------------------| Prompt + sps_... + Ablauf |
      |                                                     |
      | ChatGPT-URL mit vorbereitetem Prompt öffnen         |
      |---------------------------------------------------->|
      |                                                     |
      | User sendet die sichtbare Nachricht                 |
      |---------------------------------------------------->|
      |                         |<--------------------------|
      |                         | getVisibleState(sps_...)  |
      |                         |-------------------------->|
      |<----------------------------------------------------|
      | Antwort mit wortgleichem SkillPilot-Footer          |
```

Step by step:

1. The Cockpit knows the active SkillPilot ID and calls
   `POST /api/ui/learners/{skillpilotId}/visible-chat-start`.
2. The backend directly generates a random `sps_...` session token, stores only its HMAC
   hash, and binds the session internally to the learner state.
3. The prepared German or English prompt contains the token exactly once. Any pre-existing
   prompt context is stripped of SkillPilot IDs, other session tokens, and stale start
   codes.
4. The web frontend opens the URL of the language-matching new GPT (configured after
   private acceptance) with that prepared prompt.
5. The learner submits the prepared message in ChatGPT.
6. The GPT immediately calls `getVisibleState` and reproduces the backend-supplied
   `relayFooter` verbatim as the final line of its reply.

There is neither a start code nor a redeem Action in this fallback flow.

## Visible Cross-Turn State

The coach does not rely on an invisible Action response surviving a subsequent user turn.
Only values genuinely needed by a later Action appear visibly in the conversation:

- the temporary session token in the SkillPilot footer;
- when a goal is active, additionally the full global learning-goal ID;
- a short-lived local choice code paired with numbered options;
- during Verified Recall, the card ID alongside the card prompt.

Curriculum, filter, personalization, and scope IDs stay in the backend. The user selects
natural-language labels via visible numbers instead. Afterward, the backend maps the choice
code and selected number back to the technical keys. Internal identifiers are thus not
unnecessarily spilled into the chat transcript.

The footer takes one of the two exact forms below:

```text
— SkillPilot · Sitzung: sps_...
— SkillPilot · Sitzung: sps_... · Lernziel-ID: <vollständige Lernziel-ID>
```

The English variant uses `Session` and `Learning goal ID`. After every successful Action,
the backend returns the updated full footer. The GPT instructions require keeping it
unchanged as the final line of every response. Because this is an instruction-backed
contract — the backend cannot force a language model to emit the footer accurately —
end-to-end acceptance tests must verify footer preservation explicitly.

## Per-Turn Refresh Gate

Before giving any substantive answer to a new ordinary user turn, the GPT reloads the
current state via `getVisibleState` using the token from the latest visible footer. As a
result, active goal, frontier, progress, resources, and state machine come from the backend
rather than from stale conversation memory. This holds across long conversations, context
compaction, or an intervening visit to the Cockpit.

Only three already visibly staged flows start without that ordinary refresh:

1. answering a current numbered choice → `applyVisibleChoice`;
2. submitting a complete visible exam answer → `getVisibleExamEvaluation`;
3. answering visible flashcards → `getVisibleVerifiedRecallAnswer`, followed by
   `recordVisibleVerifiedRecallResult`.

Their parameters must already stand completely in the visible dialog. A value freshly
returned within the same assistant turn may be passed directly to the next Action.

## Natural Multi-Dimension Requests Within One Assistant Turn

A phrasing such as "I want to learn upper-secondary Math in Hesse" is treated as an active
continuing intent within the current assistant turn. Whenever the freshly loaded state for a
setup dimension exposes a single semantically matching option, the GPT may apply that choice
immediately, load the new state, and evaluate the same user intent against the next setup
step. Unambiguous intermediate choices and their choice codes are not printed. Only the
first genuinely open decision produces a visible follow-up question.

This chaining is strictly bounded to a single assistant turn. A later bare numeric user
reply answers exclusively the visible option list whose choice code is currently shown; it
must never be carried over automatically onto a subsequent option list. Moreover, a request
spanning multiple setup dimensions is a sequence of single selections rather than a scope
multi-select via `choiceNumbers`.

While this avoids unnecessary intermediate prompts, prompting alone cannot resolve every
phrasing. In particular, "upper-secondary" ("Oberstufe") can only be resolved automatically
when the current backend choice list actually offers a matching stage or composition-view
option. Because this fallback surface does not expose that dimension as its own option in
every state, the GPT must stop honestly at the first real gap rather than claiming a
fabricated resolution. The strategic replacement of the visible relay mechanism by two
provider-hosted MCP apps is described in the
[SkillPilot Learning Coach Target Architecture](skillpilot-owned-coach-architecture.md).

## Action Surface and Workflow Coverage

Each language variant owns a standalone OpenAPI schema strictly scoped to `/de/` or `/en/`.
Nine session Actions cover the complete visible fallback workflows:

| Action | Method and suffix under `/visible` | Role in workflow |
| --- | --- | --- |
| `getVisibleState` | `GET /state` | load current backend state and mandatory footer |
| `applyVisibleChoice` | `POST /choice` | apply a visible option number or permitted scope multi-select |
| `requestVisibleNavigation` | `POST /navigation` | generate choices for curriculum, personalization, scope, or goal switching without mutating state |
| `setVisibleActiveGoal` | `POST /active-goal` | activate a full learning-goal ID already visible in chat |
| `setVisibleMastery` | `POST /mastery` | persist mastery `1.0` for the active goal once sufficient evidence exists |
| `startVisibleVerifiedRecall` | `POST /verified-recall/start` | start a visible flashcard batch for a memorization goal |
| `getVisibleVerifiedRecallAnswer` | `POST /verified-recall/answer` | load the reference answer only after a visible learner answer |
| `recordVisibleVerifiedRecallResult` | `POST /verified-recall/result` | persist a domain-evaluated flashcard outcome |
| `getVisibleExamEvaluation` | `POST /exam/evaluation` | instruction-gated load of reference solution and scoring rubric only after complete visible exam submission |

Having fewer methods than the legacy schema does not reduce workflow coverage. Setup and
navigation steps are deliberately consolidated into `requestVisibleNavigation` plus
`applyVisibleChoice`. The Action layer resolves backend keys while the chat conversation
only has to carry label, option number, and choice code.

Ordinary state responses are assembled through the shared provider-neutral
`CoachStateProjection`. For exam goals they expose only problem statement, maximum points,
and figure hint — never reference solution, pass threshold, source path, or scoring rubric.
Explicit exam evaluation delegates to the shared, domain-authorized exam use case in
`CoachToolFacade`, leaving the existing Visible Session schema unchanged. In Verified
Recall, the reference answer is released only after the learner's answer. Memorization
mastery is derived by the backend from persisted card outcomes rather than set through
`setVisibleMastery`.

The exam use case validates active goal, exam type, release status, and complete evaluation
data. In today's Custom GPT channel, however, it cannot independently prove that a learner
submission actually preceded the call: the backend request carries only the visible
learning-goal ID, and SkillPilot deliberately receives no chat transcript. Enforcing the
sequence "complete visible submission first, evaluation afterward" therefore remains
instruction-backed. Strong cryptographic or stateful submission proof requires a direct
SkillPilot widget or Cockpit submission carrying an attempt ID.

Grading is criterion-referenced rather than wording-referenced. `solutionContent` is a
reference solution, not an exclusive solution path. Mathematically or substantively
equivalent forms, permitted rounding, sound independent reasoning, and valid alternative
approaches receive full credit unless the problem statement or rubric explicitly mandates a
specific representation; explicit requirements remain binding. Submissions are graded
conclusively without an interactive follow-up quiz. An illegible image or handwriting
passage is marked as illegible and scored strictly from clearly discernible evidence; the
GPT must not invent a specific domain mistake from illegible input.

The durable shared architectural boundary and the deliberately deferred
revision/idempotency mechanisms are documented under
[ChatClient/Backend Communication Contract](provider-neutral-coach-boundary.md).

The visible fallback uses nine session operations. Ahead of them, the current Builder
schema adds `redeemStartCode` as a tenth operation for the private default start. All nine
session operations:

- live under `/api/ai/{de|en}/sessions/{chatSessionToken}/visible/...`;
- use the configured Bearer authentication of the GPT Action;
- set `x-openai-isConsequential: false`;
- declare `chatSessionToken` inline with an explicit string name on each path rather than
  via a reusable parameter `$ref`.

Inlining the path parameter is a compatibility measure for the GPT Builder, which currently
skips operations that reference path parameters via `$ref`.

## Language Bundles and New GPTs

Both GPTs are created independently from empty Builder configurations. Neither legacy IDs,
nor old URLs, nor prior Builder files are reused. Each language variant ships a complete
self-contained bundle comprising:

- dedicated System Instructions;
- exactly seven dedicated Knowledge documents;
- a dedicated locale-fixed `skillpilot-api-4ai.*.json`;
- a machine-verified bundle manifest that is not uploaded as Knowledge.

Authoritative sources and Builder setup guides:

- [Current Custom GPT package](https://github.com/enpasos/skillpilot/blob/main/ai/openai%20custom%20gpt/README.md)
- [German Builder setup](https://github.com/enpasos/skillpilot/blob/main/ai/openai%20custom%20gpt/de/gpt_setup_guide.md)
- [English Builder setup](https://github.com/enpasos/skillpilot/blob/main/ai/openai%20custom%20gpt/en/gpt_setup_guide.md)

The two language schemas must neither be merged nor swapped for one another. Under `ai/`
there is intentionally no shared `skillpilot-api-4ai.*` fallback.

## Runtime Selection and Activation

The frozen web start continues to use `openai-mcp`. The proposed interim Custom GPT channel
is a separate route and does not flip that variant selector. New GPT URLs are minted only in
the Builder and wired in through dedicated locale-specific deployment configuration after
passing acceptance. Deleted legacy GPT URLs still visible in frozen frontend code must never
be reused. Ordinary backend production secrets — in particular the Action API key and
signing secret — remain unaffected and must stay properly configured.

Rollout proceeds in coordinated order:

1. Verify existing start-code and `/visible/...` backend routes.
2. Create and privately accept `SkillPilot GPT Coach (de)` from scratch.
3. Separately create and privately accept `SkillPilot GPT Coach (en)` from scratch.
4. Only afterward configure both new URLs in the dedicated deployment settings.
5. Enable the separate WebGUI entry only after any required freeze decision and re-run full
   end-to-end acceptance per language.

Visible mode is not preserved as a separate legacy GPT. It is solely an explicitly launched
emergency capability of those same new language-specific GPTs.

## Error and Operational Rules

- On `410` or `chat_session_expired`, the coach stops both Actions and instruction. The
  learner restarts the coach via `skillpilot.com`.
- On `401`, schema errors, or persistence failures, success is never claimed.
- On `409`, state is reloaded at most once; stale choice codes are never reused.
- URLs are taken exclusively from the latest backend response. Tokens and SkillPilot IDs
  never belong in links.
- Because the session token travels as a URL path parameter, application, reverse-proxy, and
  access logs must redact or omit paths and bodies on these routes.
- The SkillPilot server receives no chat transcripts. Conversations and uploaded media
  nevertheless remain subject to the policies of the ChatGPT account in use.

## Verification

Package-local architecture checks run via:

```bash
npm test --prefix "ai/openai custom gpt"
```

Frontend coach-variant checks run via:

```bash
npm --prefix app run test:coach-variants
```

In addition, every Builder rollout requires real DE and EN host acceptance testing covering:
private start and cross-turn retention, per-turn refresh, numbered choices, goal switching,
mastery persistence, Verified Recall, exam evaluation, session expiry, and restart. Visible
footer relay is verified separately as an emergency fallback mode.

## Boundary to Claude

The Claude OAuth/MCP implementation is a separate variant that is currently disabled and
not exposed to learners in this channel. It uses no visible ChatGPT session footer. Shared
state projection, personalization, and exam authorization have been added in code; without
complete real-client provider acceptance, however, Claude is not a fallback for the
multilingual V1 MCP coach. Current status and remaining release gates are documented in the
[Claude Coach Runbook](../../deploy/claude-coach-beta.md).

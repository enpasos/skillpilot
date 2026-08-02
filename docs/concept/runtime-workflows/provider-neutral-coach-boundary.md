# Provider-Neutral Learning-Coach Boundary

Status: durable application and security boundary for all SkillPilot
learning-coach adapters. The OpenAI channel is one multilingual MCP App per
contract major. Visible Session remains only an independently rollbackable
Custom-GPT path. Claude OAuth/MCP remains disabled until its own acceptance
gate is complete.

The product decision and migration sequence are specified in the
[SkillPilot learning-coach target architecture](skillpilot-owned-coach-architecture.md).
For the OpenAI App, the normative identity and session contract is
[OpenAI MCP OAuth App binding and explicit 24-hour learning sessions](openai-mcp-oauth-learner-session-architecture.md).

## Purpose

SkillPilot owns the learning workflow. A provider-hosted conversation is a user
interface and model runtime, not the source of truth for curriculum, scope,
active goal, mastery, Recall state or exam authorization. The target keeps model
execution and consumer billing at the provider: a learner uses the provider's
available free access or fixed-price consumer subscription. SkillPilot does not
call a metered model API for this channel and does not resell model usage.

This billing rule is architectural, not a promise that every provider plan can
install or run every App. Plan, workspace, role, surface, regional and product
restrictions remain provider-controlled and must be verified as separate release
acceptance cases.

The shared runtime boundary is:

```text
OpenAI App V1 | Claude MCP | Visible Session fallback
      |              |                    |
      +------ provider-specific OAuth, tools and UI ------+
                             |
              CoachStateProjection + CoachToolFacade
                              |
              LearnerService, state machine and database
```

There is no separate integration-gateway process. The logical gateway and the
core currently run in the same Spring Boot application. A separate service is
only justified by a future need for independent scaling, deployment or tenant
isolation.

OpenAI distributes Apps through Plugins in its current product model. That
distribution package combines one language-neutral English control-plane skill
with the registered MCP connection. The skill owns repeatable dialogue and
tool-orchestration guidance; it does not change the runtime boundary: ChatGPT
hosts and bills the model interaction, while the MCP server and persistent
learning state remain SkillPilot services. Authorization, current state and
allowed transitions are never moved into the skill.

## One OpenAI App Per Contract Major

German, English and later supported interaction languages use the same
**SkillPilot Coach v1** App and the same public contract. Language is not an App
identity, OAuth-client identity, endpoint or release-line dimension.

The static control plane is deliberately English and language neutral: plugin
metadata, skill instructions, tool names, descriptions, schemas and stable
machine values do not change with the learner's language. The backend pins the
interaction language when it creates the `learningSessionId` and returns all
learner-facing payloads in that language. The plugin must treat that session
language as authoritative, communicate exclusively in it, and never infer the
answer language from its English control plane, tool names or the ChatGPT host
locale.

This separates three concerns that must not be conflated:

- **control-plane language:** stable English plugin and MCP contract text;
- **interaction language:** backend-owned language of the learning session and
  all user communication;
- **curriculum or target language:** subject/content semantics, which may differ
  from the interaction language, for example an English curriculum coached in
  German.

The single public V1 endpoint is
`https://mcp-coach-v1.skillpilot.com/mcp`. The already reserved future major
hosts `mcp-coach-v2.skillpilot.com` through
`mcp-coach-v9.skillpilot.com` fail closed with `404` until their own breaking
contracts are implemented. They do not create sibling endpoints per language.
The old `mcp-coach-de-v*` and
`mcp-coach-en-v*` names belonged only to unpublished local infrastructure and
must not be exposed as compatibility routes.

## Shared And Provider-Specific Responsibilities

The shared application layer owns:

- state-machine authorization and checks for an active, provider-specific
  learning session;
- curriculum, personalization, scope, active-goal and mastery use cases;
- Verified Recall sequencing and persistence;
- safe normal-state projection;
- authorization of released exam evaluation material.

Each provider adapter owns:

- transport authentication and learner resolution;
- its exact tool catalog and schemas;
- compact response rendering; learner-facing localization is authoritative
  backend output selected by the learning session;
- provider-specific session, footer, widget or OAuth behavior;
- instructions for recovering from lost model context.

For the OpenAI Apps, this specifically means:

- the authorization server accepts exactly one fixed, pre-registered
  confidential OAuth client for the V1 App. ChatGPT and SkillPilot hold the
  same long random client secret, and the token endpoint requires
  `client_secret_basic`; exact redirect URI, Authorization Code with PKCE S256,
  resource/audience and scopes are mandatory, while DCR, CIMD,
  `private_key_jwt` and `none` are closed production profiles;
- every explicit first-party **Lernen starten** creates a new, high-entropy
  learning session with an absolute lifetime of exactly 24 hours. Its reference
  is inserted automatically into the prepared start message and must be sent
  unchanged by every fachlicher tool;
- model-visible read and write tools require both the authenticated OAuth App
  and that valid session reference, then resolve the learner only through the
  session's backend mapping;
- deterministic choices and answer submissions are invoked directly by the
  widget through app-only tools, rather than depending on the model to copy a
  technical selection value;
- short-lived choice and receipt references may be returned in tool result
  `_meta` for the widget. The learning-session reference is intentionally
  transported in the prepared start message and fachlichen tool arguments, but
  requires no manual user handling;
- the permanent SkillPilot ID is neither a tool argument nor a tool result.

mTLS is not part of the `1.0.0` contract. Any later transport hardening needs
its own design and does not become the identity of the particular SkillPilot
App.

Provider neutrality therefore does not require one universal schema across
different providers or contract majors. Within one OpenAI contract major,
however, the external tool schema is language neutral and shared by every
supported interaction language.

## Safe Normal-State Projection

Every model-facing normal state passes through `CoachStateProjection` before it
is serialized. The projection:

- removes the permanent SkillPilot ID and `copySources`;
- normalizes public resource URLs and chat math delimiters;
- removes exam payloads from frontier, planned goals and selectable options;
- suppresses unreleased or structurally incomplete exam tasks;
- exposes an active released exam only as task content plus maximum points;
- never includes an exam solution, source-artifact path, passing threshold or
  scoring steps.

Adapters may reduce this allowlisted state further. They must not serialize a raw
`UnifiedLearnerStateResponse` as provider context.

## Motivation and Orientation Completion

An active goal with authoritative `semanticKind=orientation` uses the shared
`orientActiveGoal` state. Explicit `Motivation` or `Orientation` tags are a
legacy fallback only when no semantic kind exists. Every provider must use this
state to build interest: it shows accessible possibilities, applications, and
honest positive perspectives of the material that follows, then invites a
low-pressure reaction or decision to continue.

Orientation never diagnoses or grades prior knowledge, terminology,
calculations, subject details, correctness, transfer, recall, or exam
performance. Its observable completion criterion is that the learner has seen
the orientation and responds to a perspective or explicitly chooses to
continue. The existing numeric `1.0` is retained only as a binary compatibility
marker; no provider or UI may call it proven subject mastery. Normal
evidence-based mastery rules continue to apply unchanged to ordinary content
goals.

## Protected Exam Evaluation

Exam solutions and scoring are loaded through the separate
`CoachToolFacade.getExamEvaluation` use case. It checks the authenticated learner
internally and requires that:

- the cited goal is the current active goal;
- the active goal is an exam;
- its review and completeness checks pass;
- released solution and scoring data exist.

The result contains no learner identifier. Provider adapters localize and render
it only in their dedicated evaluation operation. The existing Visible-Session
OpenAPI request and response remain unchanged.

Evaluation semantics are provider-neutral as well. The released solution is a
reference, not an exact-match template or exclusive method. Every
subject-correct equivalent result, representation, permitted rounding,
explanation, or alternative route receives the same credit under the applicable
criterion unless the task or rubric explicitly requires a particular answer form;
explicit requirements remain binding. Providers must not invent additional
wording or formatting requirements. Exam
submissions are graded conclusively without a follow-up dialogue. An illegible
fragment is identified as illegible and evaluated only as reliably visible
evidence; it must never be turned into an invented, specific subject error.

This is an authorization boundary for evaluation material, not a cryptographic
proof that the learner submitted an answer. In the current provider-hosted chat
channels, the tool description and coach instructions require a complete visible
answer before evaluation is requested. The backend cannot independently prove
that conversational event because it intentionally does not receive the chat
transcript.

A strong submission proof uses a direct SkillPilot widget or cockpit flow:

```text
startExam -> attemptId
submitExamAnswer(attemptId, answer) -> submissionReceipt
getExamEvaluation(attemptId, submissionReceipt)
```

The OpenAI MCP App widget is a valid host for this flow: the provider embeds the
UI, but the widget invokes the SkillPilot submission tool directly and the
backend creates the receipt. The provider model may subsequently load the
pending submission through a receipt- and learning-session-bound read operation
and record a fachliche evaluation. Introducing complete exam attempts still
changes persistence and privacy behavior and therefore requires its own review
and acceptance gate; it is not retrofitted into the Visible-Session fallback.

## Identity, Connection And Coach State

Provider bindings remain separate:

- the rollback-only ChatGPT Visible Session resolves a short-lived,
  HMAC-stored bearer token to a learner;
- Claude resolves an authenticated opaque OAuth connection subject to a learner;
- each production OpenAI major-line App authenticates through its own fixed confidential
  OAuth client and additionally requires a fresh, first-party created,
  absolutely limited 24-hour learning session to address the learner.

The permanent SkillPilot ID is never a model-provided argument. The backend
looks it up only through the HMAC/hash-bound temporary session. OAuth App
identity, 24-hour learning session, durable learner state, provider conversation
and temporary widget workflow remain distinct concepts. OAuth alone neither
creates nor selects a learner session; a session alone does not authorize MCP.
OAuth access-token refresh does not extend the learning session. Short-lived
widget references are capability-scoped to the current authorized workflow
revision; possession outside that App and session context must not authorize a
different learner or later state.

The current OpenAI MCP contract does not expose a documented stable ChatGPT
conversation ID. The learning session is therefore an explicit application
capability, not a provider conversation identity. Every first-party
**Start learning** action creates a different session, even for the same
learner; sessions expire independently.

## Context Loss And Recovery

Normal turns reload current backend state instead of depending on an older hidden
tool response. Visible Session does this through `getVisibleState`; Claude uses
`getCoachContext`. Each OpenAI App exposes its own locale-specific context read.
In production every such call carries the automatically inserted
learning-session reference, requires valid OAuth independently, resolves the
learner from the session mapping, and then projects fresh backend state. There
is no fallback to OAuth subject, provider account or inferred conversation
identity if the session is absent or expired.

Result `_meta` is a widget transport for opake references, not cross-turn model
memory. The widget may retain those references for a direct app-only choice or
submission call. The next model turn rehydrates fachliche state from SkillPilot;
it must not require earlier `_meta`, `structuredContent` or a provider
conversation summary to be intact.

This division removes model mediation from deterministic widget interactions but
does not claim that every free-form user message is delivered to SkillPilot: the
provider host still decides when to invoke model-visible tools. Workflows that
need a hard event proof must use a direct App-widget or cockpit action and a
server-side receipt. A first-party turn orchestrator remains a possible separate
product, but it is not the sole target and is incompatible with the current hard
requirement that SkillPilot must not pay metered model inference for this
channel.

## Concurrency And Idempotency

The current production contract deliberately does not claim a global state
revision or universal command idempotency.

Existing protections include:

- state-machine and active-goal validation for mutations;
- state-dependent Visible-Session selection references and `409` for stale
  selections;
- transactional or locked handling of critical persistence paths;
- domain-specific duplicate and eligibility checks in Verified Recall.

A hard `expectedStateRevision` is not currently safe to add. Coach state spans
learner, mastery, planned goals, client state and Recall records, and not every
mutation passes through `CoachToolFacade`. A revision on only the learner row
would provide false guarantees.

Global command receipts are also deferred. Custom GPT Actions do not provide a
reliable transport request ID suitable for deduplication, while a model-generated
ID can itself be forgotten or changed. An App widget may already use a narrower
server-issued submission receipt or idempotency key for its own direct operation;
that does not imply a global revision across every coach mutation. A global
mechanism may be added only once all relevant paths advance one shared state
clock and the adapter supplies a stable request identity.

No event-sourcing system or new database migration is required for the current
shared boundary.

## Prototype And Current V1 Production Boundary

The executable mechanism prototype under [`ai/openai app`](https://github.com/enpasos/skillpilot/blob/main/ai/openai%20app/README.md)
exposes one language-neutral V1 `/mcp` endpoint with English control metadata,
separate localized demo payload/UI catalogs, app-only choice and submission
calls, hidden result `_meta`, argumentless state reads and persistent demo state.
It deliberately uses one **no-auth development identity**. That prototype
remains useful for protocol mechanics and synthetic data, but it is neither
account linking nor tenant isolation and must not be exposed as a production
service.

The Spring Boot V1 path implements the data-only contract against the existing
database-backed domain use cases. Its secure production boundary
requires all of the following:

1. server-authenticated TLS at the major-version MCP edge;
2. one fixed confidential OAuth client, authenticated at the token endpoint
   through `client_secret_basic`, with exact callback allowlist, Authorization
   Code plus PKCE S256, exact resource/audience and scopes; DCR, CIMD,
   `private_key_jwt` and `none` remain disabled;
3. a fresh, high-entropy application learning session for every first-party
   **Lernen starten**, stored only as HMAC/hash and mapped internally to the
   permanent SkillPilot ID;
4. automatic start-message transport of that reference and independent
   validation of OAuth plus session on every fachlicher tool.

mTLS is outside the `1.0.0` release gates and would not replace the fixed
confidential OAuth client as the App identity.

The production gate also includes full workflow parity for curriculum and scope
selection, active goals, frontier, mastery, Verified Recall and exams; acceptance
of every supported session language through the same V1 host; and validation on
the intended free and fixed-price provider plans. A passing local MCP simulation
proves none of those gates by itself.

## Compatibility Rule

Shared hardening must preserve the configured Visible-Session rollback routes, operation
IDs, request bodies, response fields, status codes and DE/EN GPT packages, as
well as the older Startcode sources required for rollback. The multilingual
OpenAI App lives in its own package and does not overwrite either fallback.

New provider capabilities remain disabled until their release gates pass. An App
is not released merely because its unit tests or local host simulation pass; it
needs OAuth, a real host-specific end-to-end acceptance run and provider review.
Under OpenAI's current distribution model, each App is published as part of a
Plugin. Permissions, connection behavior and provider availability remain the
authoritative controls described in
[Plugins in ChatGPT and Codex](https://help.openai.com/de-de/articles/20001256-plugins-in-chatgpt-and-codex).

# Provider-Neutral Learning-Coach Boundary

Status: durable target architecture for all SkillPilot learning-coach adapters.
The ChatGPT Visible Session remains the current learner-facing reference
integration. Claude OAuth/MCP remains disabled until its real acceptance gate is
complete.

## Purpose

SkillPilot owns the learning workflow. A provider-hosted conversation is a user
interface and a non-deterministic tool orchestrator, not the source of truth for
curriculum, scope, active goal, mastery, Recall state or exam authorization.

The shared runtime boundary is:

```text
ChatGPT Visible Session | Claude MCP | future ChatGPT App | other adapters
                              |
          provider-specific authentication and rendering
                              |
              CoachStateProjection + CoachToolFacade
                              |
              LearnerService, state machine and database
```

There is no separate integration-gateway process. The logical gateway and the
core currently run in the same Spring Boot application. A separate service is
only justified by a future need for independent scaling, deployment or tenant
isolation.

## Shared And Provider-Specific Responsibilities

The shared application layer owns:

- state-machine authorization and writable-session checks;
- curriculum, personalization, scope, active-goal and mastery use cases;
- Verified Recall sequencing and persistence;
- safe normal-state projection;
- authorization of released exam evaluation material.

Each provider adapter owns:

- transport authentication and learner resolution;
- its exact tool catalog and schemas;
- localization and compact response rendering;
- provider-specific session, footer, widget or OAuth behavior;
- instructions for recovering from lost model context.

Provider neutrality therefore does not mean one universal external tool schema.
The common part is the fachliche behavior and security boundary; external tools
remain deliberately tailored to the host.

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

A strong future proof requires a SkillPilot-controlled widget or cockpit flow:

```text
startExam -> attemptId
submitExamAnswer(attemptId, answer) -> submissionReceipt
getExamEvaluation(attemptId, submissionReceipt)
```

Introducing such attempts changes the UI, persistence and privacy boundary and
is not part of the compatibility hardening described here.

## Identity, Connection And Coach State

The existing provider bindings remain separate:

- ChatGPT Visible Session resolves a short-lived, HMAC-stored bearer token to a
  learner;
- Claude resolves an authenticated opaque OAuth connection subject to a learner.

The permanent SkillPilot ID is never a model-provided session argument. A future
adapter may introduce its own conversation binding, but identity, durable learner
state, provider conversation and temporary coach workflow must remain distinct
concepts.

## Context Loss And Recovery

Normal turns reload current backend state instead of depending on an older hidden
tool response. Visible Session does this through `getVisibleState`; Claude uses
`getCoachContext`. This limits the consequences of host-side context loss but
does not make a provider-hosted model deterministic: the host still has to invoke
the appropriate tool.

Only a SkillPilot-controlled turn orchestrator, such as a future cockpit coach or
Poe Server Bot adapter, can guarantee receipt and orchestration of every user
turn. Such an orchestrator belongs above the same shared application boundary and
is a separate product and privacy decision.

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
ID can itself be forgotten or changed. New controlled adapters may add revision
and idempotency once all relevant mutation paths advance one shared state clock
and the adapter supplies a stable request identity.

No event-sourcing system or new database migration is required for the current
shared boundary.

## Compatibility Rule

Shared hardening must preserve the currently configured Visible-Session routes,
operation IDs, request bodies, response fields, status codes and DE/EN GPT
packages. New provider capabilities are additive while their product flags remain
disabled. A provider adapter is not released merely because its unit tests pass;
it also needs a real host-specific end-to-end acceptance run.

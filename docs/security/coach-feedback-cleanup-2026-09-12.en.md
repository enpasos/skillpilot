# Coach feedback: production cleanup, 12 September 2026

## Decision and scope

The Product Owner explicitly required that coach-generated `workFeedback`,
`outcomeFeedback` and Recall `feedback` stay in the provider chat, and separately
authorized removing already stored copies from production. The coach judges
the learner's work and writes its own feedback. SkillPilot Core receives the
authorized structured result, not parts of the conversation or success message.

This is independent of the separate, expressly authorized curriculum-feedback
inbox. Its submissions, publication data and retention procedure were not
targets of this operation.

Normative rule:
[provider-neutral coach boundary](../concept/runtime-workflows/provider-neutral-coach-boundary.md).
Durable development instructions: repository `AGENTS.md`, section 12.1.

## What was actually persisted

- Claude normal mastery unnecessarily required two feedback strings. The
  current implementation did not store those strings as mastery data; they
  entered input validation and replay hashing nevertheless. Removing their
  collection is required even without a plaintext database copy.
- OpenAI normal mastery echoed the strings in `completionHandoff` and in the
  text result. Those results could enter `openai_de_idempotency.response_json`
  and `response_text`.
- Both providers' Verified Recall used shared DTOs that accepted feedback.
  `LearnerService` stored it as `cardId → verifiedRecall → lastFeedback` in
  `learner_client_state.client_state`.
- Legacy `/api/ai/{locale}/sessions/{token}/verified-recall/result` requests
  could additionally write `requestBody.feedback` to AI trace JSONL files.

## Production action completed

On 12 September 2026, before 10:45 UTC, the operation targeted the database
`skillpilot` used by the running `skillpilot.service`, verified through that
service's application process. Database credentials and affected text values
were never printed or exported.

| Store | Before | Action and verification |
| --- | --- | --- |
| `learner_client_state.client_state` | 90 nonempty `verifiedRecall.lastFeedback` fields in 9 of 53 rows | All 90 fields removed; all other parsed JSON values, row keys and timestamps unchanged |
| `learner.client_state` | 606 rows; no affected field names | Read-only check, no mutation |
| `claude_v1_session_idempotency.response_payload` | 2 receipts; no affected field names | Read-only check, receipts and replay state retained |
| Legacy `claude_v1_idempotency` | Empty | No mutation |
| `openai_de_idempotency.response_json` and `response_text` | Empty | No mutation |
| AI trace JSONL files | 18 `requestBody.feedback` fields in 2 of 93 files | All 18 fields removed; every other JSON value and record length preserved |
| Current and rotated application log files | 8 files; no affected field-name matches | Read-only check, no mutation |

The counts describe stored fields/copies, not distinct learners or distinct
assessment events. No learner record, mastery record, card, repetition history,
session, OAuth credential or replay receipt was deleted.

### Database safeguards

The read-only preflight established exactly nine target rows and ninety fields,
all under the known two-level Recall path. The write transaction required those
same counts; a changed count or unexpected JSON location would abort it.

Only `learner_client_state.client_state` was updated. The transformation keeps
every root card entry, and removes only `lastFeedback` from its
`verifiedRecall` object. It does not remove the object or alter its other fields.
The transaction holds a short write-conflict lock on that table, with a two-second
lock timeout and ten-second statement timeout.

Before commit, the complete resulting card-state table was compared with the
expected sanitized representation, including all unrelated columns and rows.
The complete mastery table was compared before and after and was unchanged.
The transaction committed successfully. A separate read-only pass confirmed
zero remaining affected field names in the inspected database stores.

### Trace safeguards

The trace pass parsed the JSON, checked the exact Recall-result route, and
targeted only `requestBody.feedback`. The remover was first validated against
25 synthetic cases, including Unicode, escaped quotes, newlines, different key
positions and non-string values.

Each existing field plus its adjacent JSON separator was overwritten with
same-length whitespace in place. No whole log file was replaced, truncated or
deleted, so append-only logging could continue without losing new records.
File identity and original record bytes were checked before each write; the
resulting JSON was checked against the original object minus that one field.
The subsequent scan of all 93 trace files found none of the four legacy field
names. No plaintext backup of the removed data was made.

## Related mastery incident

The reported Claude mastery operation had a persisted success receipt with
`savedMastery = 1.0`; receipt and payload state versions both equalled 98.
The corresponding mastery row also contained `1.0` after the cleanup. Thus the
client's failed-tool display did **not** demonstrate that mastery was missing.
The exact reason for the failed client response remains unproven. A timeout or
lost response must not be reported as the established cause without evidence.

No production assessment was replayed and no mastery was changed to investigate
or repair the display issue. This document deliberately includes no learner
identifier, session token, private answer or assessment prose.

## Rollout and deletion limits

The data cleanup is completed; it is **not a deployment**. The running old
backend can still accept and recreate the removed fields until the corrected
backend and provider contracts are rolled out together. The corrected source
removes both mastery text inputs and echoes, makes Recall DTOs feedback-free,
stops `lastFeedback` persistence, and prevents assessment request-body logging.
Regression tests cover schemas, forbidden inputs, persisted state and logging.

Old cached provider schemas or instructions can still send the now forbidden
fields. The new backend rejects them rather than silently accepting the old
contract. A successor package and refreshed tool catalog must therefore be
coordinated with backend activation. Published Claude 1.1.3 artifacts and the
rejected OpenAI 1.0.0 history remain untouched; local successor preparation is
not marketplace publication or provider acceptance.

PostgreSQL updates are logical deletion, not a guarantee of physical erasure
from WAL, old disk pages, storage snapshots or external backups. No backup
retention policy or external snapshot was changed. A restore must reapply this
targeted removal before exposing restored learning state. Provider-side chat
history and learner-controlled screenshots are outside this server cleanup.

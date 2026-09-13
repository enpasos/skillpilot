# Data Privacy and Storage Concept

Status: updated on 2026-09-13 for the active Claude-first beta, the subsequent
ChatGPT integration candidate, the coach-tool free-text boundary, voluntary
feedback, and the SkillPilot-ID deletion and retention boundary. Existing
teacher-view and personal-subject-schedule details remain applicable.

This is a technical data-flow and storage description. It does not replace the
learner-facing [SkillPilot Privacy Policy](https://skillpilot.com/privacy), the
provider's privacy terms, or a legal review before a public release. The public
policy is authored in `app/src/utils/privacyViewCopy.ts`. Repository defaults
below are not evidence of the configuration or retention of every deployed
service, log copy, or backup.

The current work order is
[Claude beta → stable candidate → focused ChatGPT integration acceptance →
official submission](../deploy/claude-beta-chatgpt-release-strategy.md).
The [provider-neutral coach boundary](../concept/runtime-workflows/provider-neutral-coach-boundary.md)
and [Claude runbook](../deploy/claude-coach-beta.md) govern the active provider
lane. The separate [OpenAI MCP identity and 24-hour session contract](../concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.md)
describes the subsequent integration candidate, not a second public beta.

## 1. Core Philosophy: Privacy by Design

SkillPilot separates **pseudonymous learner identity**, **persistent learning
state**, **temporary provider access**, and **provider-side conversation
content**.

- The SkillPilot backend stores learning progress under a random, pseudonymous
  SkillPilot ID. It does not require a learner name, email address, or password.
  This is pseudonymity, not anonymity: the ID links a learning history, and a
  person or institution with an ID-to-person mapping can identify its owner.
- The browser is the learner's SkillPilot login surface. It may hold the
  permanent SkillPilot ID locally and can optionally save it encrypted with a
  user-chosen password.
- The permanent SkillPilot ID stays in first-party SkillPilot surfaces and
  outside the AI chat, OAuth principal, MCP tools, and provider-hosted widgets.
  Every explicit WebGUI start creates a separate temporary learning-session
  reference that the backend resolves to that ID.
- The AI provider processes the chat, uploads, projected learning context, and
  tool results under the provider account and its terms.
- SkillPilot does not receive the complete provider chat transcript. It does
  receive every explicit API or MCP tool request sent to it, including the
  arguments needed to read or change learning state.

**Architectural invariant for coach tools:** learner answers, explanations,
chat summaries and coach-authored feedback must stay in the provider chat.
Neither `workFeedback`, `outcomeFeedback`, Recall `feedback`/`lastFeedback`, nor
renamed equivalents belong in accepted coach inputs, persisted learning state,
replay responses or diagnostics. The coach makes the pedagogical assessment and
composes its own success message; SkillPilot accepts only the authorized
structured decision and returns confirmed state. See the
[provider-neutral coach boundary](../concept/runtime-workflows/provider-neutral-coach-boundary.md).
The [12 September 2026 cleanup record](coach-feedback-cleanup-2026-09-12.md)
records a historical production purge and the rollout obligations identified
at that time; it is not evidence of the state of a later deployment.

Provider status must stay explicit:

1. **Claude V1 OAuth/MCP:** the active learning beta, distributed through the
   Claude marketplace. Installation and updates do not bypass OAuth, session
   isolation, or domain authorization.
2. **Multilingual OpenAI V1 OAuth/MCP App:** the later ChatGPT integration
   candidate. After Claude is stable, the actual ChatGPT connection and a
   representative learning flow must be accepted before official submission.
   Repository code, an old plugin link, or a successful Claude test does not
   establish ChatGPT availability or acceptance.
3. **Visible Session:** historical Custom-GPT rollback contract only, not an
   advertised beta or the current MCP contract. Its temporary `sps_...` bearer
   token is deliberately visible in the prepared message and state footer.

No parallel ChatGPT beta distribution path is being built. The provider lanes
share the core but retain separate OAuth/session boundaries. Locale support
and the selected frontend integration are release-specific; their presence in
source is not a public platform promise.

## 2. Data Partitioning

### A. Local Client (Browser / Local Storage)

**Trust boundary:** controlled by the learner and the browser environment.

The browser may hold:

- the active SkillPilot ID;
- optional named local profiles in which the SkillPilot ID is encrypted with a
  user-chosen password; the password itself is not stored;
- a browser-local OpenAI eligibility confirmation bound to the current
  pseudonymous SkillPilot profile for the lifetime of the browser tab;
- the selected curriculum and other UI preferences;
- local SRS scheduling state before or between synchronization;
- the freshly prepared provider launch URL. It contains a natural start message
  with a temporary learning-session reference, but no permanent SkillPilot ID,
  OAuth token, or client secret.

Every V1 coach start calls a learner-specific SkillPilot UI endpoint with
the locally active permanent SkillPilot ID. The backend creates a new
learning-session reference at that exact moment and the response opens Claude
or, for the separately enabled candidate, ChatGPT with the prepared message.
The permanent ID is not placed in the launch message or provider URL. A launch
URL containing the temporary reference is itself sensitive and can appear in
browser history or a copied link.

For teacher-led usage, the teacher's browser or institution-controlled storage
may additionally hold local class names, learner names or aliases, permanent
SkillPilot IDs, and cached Level-2 personalization. That local class mapping is
not stored centrally by SkillPilot. The existing-learner teacher view reads the
normal learner profile and mastery endpoints directly with the permanent ID.
When the teacher first schedules a learning scope, one additional no-store
read derives every atomic target ID in the learner's complete Level-2
personalization for the selected subject and its not-yet-mastered subset. The
mutable Level-3 focus does not restrict that planning universe. The browser
stores those goal IDs, aggregate counts, and capture time as an immutable local
planning baseline; it does not store the SkillPilot ID or numeric per-goal
mastery values inside that baseline.
The ordinary teacher view does not change learner-side planned goals and
creates no separate server-side teacher, class, authorization record, or
membership relationship.

The teacher view disables learner-state mutations, but that is a frontend
boundary only. Its separate browser-local teacher course plan remains editable
teacher working data. One explicit, confirmed action can copy the plan label,
dated blocks, and client-materialized atomic goal IDs into a separate personal
subject schedule under the known permanent SkillPilot ID. The server validates
the IDs against the current personalized subject scope. Newly added IDs are
accepted only while they are open; IDs already present in the personal schedule
may remain in a confirmed replacement to preserve plan continuity. The write
transfers no local class ID, alias, coverage journal, attestation, mastery value,
learner-derived planning baseline, or teacher-plan history and creates no
teacher-to-learner relation.
Later local teacher-plan changes are not synchronized. Teacher-entered labels
and block titles are copied unchanged and may themselves contain personal data.
The confirmed first-party action **Make planning effective** validates the
complete set of current subject plans before writing and then stores all
independent subject copies or none. The subordinate **Update this subject
only** action replaces only that subject copy and by itself neither enables
plan-guided learning nor selects a goal. Under the known permanent SkillPilot
ID, the shared foreground action enables plan-guided learning and immediately
selects the first due goal whose prerequisites are satisfied. The learner can
pause the mode at any time.
An explicit subject switch parks an unfinished active goal without changing
mastery and selects an eligible due goal in the chosen subject. After confirmed
completion, a valid plan containing the completed goal has priority; otherwise
valid plans are considered in deterministic due-urgency and subject order.
Stale or invalid plans are not used, and no replacement is invented when no due
eligible goal exists. The generic Autopilot remains suppressed while
plan-guided learning is enabled. Calendar progress alone causes no learner-state
write.
Plan exports omit the learner-derived baseline, but teacher-entered free text
is exported unchanged and may itself contain personal data.
The permanent SkillPilot ID remains the bearer secret and full-access key for
the learner state. Anyone who obtains it can use the ordinary learner interfaces
with the powers attached to the ID. After a local class is deleted, the ID
remains valid and unchanged.

A downloaded local-class export is therefore always protected in the browser
with a teacher-chosen password before it leaves the application. The versioned
file uses PBKDF2-SHA-256 and authenticated AES-256-GCM; SkillPilot does not
store or recover the password. Its encrypted payload may contain the local
class name, learner alias, permanent SkillPilot ID, and personalization.
Older plaintext JSON class exports can still be imported for migration, but
the UI identifies them as unprotected and new exports are never written as
plaintext. File encryption protects the downloaded file at rest; it does not
encrypt browser local storage, secure an unlocked device, invalidate the ID,
or make the ID read-only after decryption.

### B. Persistent Learning State in the SkillPilot Backend

**Trust boundary:** pseudonymous, centralized SkillPilot storage.

The backend stores, among other things:

- `Learner`: the permanent pseudonymous learner key;
- provider-specific active learning sessions, including their absolute expiry
  and direct internal link to the learner;
- `Mastery`: learning-goal mastery keyed by learner and goal;
- planned goals and learner configuration, including curriculum,
  personalization, scope, active goal, filters, and synchronized client state;
- optional personal subject schedules, their revisions and materialized atomic
  goal IDs, plus the current preference for plan-guided learning (initially off
  until a confirmed plan activation enables it);
- static curricula, competence definitions, SRS decks, resources, and review
  metadata.

No model provider needs the permanent SkillPilot ID to use the active Claude
integration or the OpenAI candidate. It remains the internal join key from a
temporary session to the learning state. The operator confirmed that the
SkillPilot Core is hosted in Germany. This is not a statement that the selected
AI provider, support services, or every external processor operates only in
Germany; provider-side processing follows that provider's disclosed terms.

### C. Historical Visible Session Data — Rollback Only

This section documents retained legacy behavior. It is not the current public
Claude beta or a supported alternative ChatGPT distribution path.

The backend stores a `ChatSession` containing the HMAC hash of the temporary
token, its learner association, language, start/expiry/use timestamps, and
optional revocation metadata. Plaintext `sps_...` tokens are returned only when
the browser creates the session; they must not be logged.

ChatGPT sees:

- the temporary token in the prepared message and required state footer;
- the projected learning context needed for coaching;
- visible selection numbers and short-lived selection references where needed;
- public canonical learning-goal IDs when a later Action must address a goal;
- Recall card IDs and prompts.

The token is a credential, not an anonymization of the whole conversation. It
expires absolutely after at most 24 hours; use does not extend it.

### D. Multilingual OpenAI V1 OAuth/MCP App Candidate Data

The following describes the intended OpenAI integration/security profile and
its implemented data boundary. Actual host behavior, production configuration,
token renewal and release acceptance must be verified against the candidate;
this section does not claim current public ChatGPT availability.

The backend keeps this provider lane separate from the Visible Session tables
and Claude connection records.

The designated protected V1 endpoint
`https://mcp-coach-v1.skillpilot.com/mcp` is designed to use server-authenticated
HTTPS, OpenAI connector mTLS and a valid OAuth access token. Its dedicated nginx virtual
host maps only the public `/mcp` endpoint to the loopback-only Spring handler
`/internal/openai/v1/mcp`; the eight reserved V2-to-V9 sibling hosts return
`404`. The
authorization server accepts exactly one configured confidential OAuth client,
authenticated with `client_secret_basic`, together with PKCE S256 and exact
client ID, redirect URI, resource, audience, and scopes. The client secret is
stored only in the ChatGPT App configuration and the SkillPilot secret store.
Open DCR, CIMD, `none`, `private_key_jwt`, and implicit profile fallback are not
production modes. The mTLS edge validates OpenAI's published CA chain,
client-authentication EKU and exact connector SAN. It records only the bounded
classification (`VERIFIED`, temporary `OBSERVE_NO_CERT`, or loopback-only
`LOCAL_OPERATOR`), never the certificate or its contents. The temporary
`observe` mode is used only to prove real ChatGPT certificate presentation;
publication requires `enforce`.

It stores:

- the fixed OAuth client registration and the authorization, consent,
  authorization-code, opaque access-token, and rotating refresh-token data
  required by the authorization server;
- a separate learning-session record for every explicit **Lernen starten**,
  containing only an HMAC/hash of the high-entropy reference, its learner
  association, `started_at`, `expires_at`, and revocation metadata.

The learning-session reference is independent of OAuth. OAuth authenticates the
App; the session addresses the learner selected in SkillPilot. Every fachlicher
MCP call requires both a valid resource/scope-bound OAuth token and the valid
session reference. OAuth alone cannot create or select a session, and a session
alone cannot authorize MCP.

The supported launch intents are deliberately bounded: current unit, Verified
Recall with goal and batch size, and the reviewed Abi 2026 exam entry with goal
and course level. Free browser-supplied prompt instructions are not persisted as
launch state.

The OpenAI V1 model contract has no provider-hosted identity or Level-2 setup
path. Creating or loading a permanent SkillPilot ID, confirming the provider
notice, and choosing curriculum, stage, subjects, course profiles, and
personalization happen only in the first-party SkillPilot WebGUI. Its explicit
**Lernen starten** / **Start learning** action creates the temporary learning
session and opens a new provider chat with the prepared start message. The
provider therefore receives neither permanent-ID input nor the option catalog
and mutations used to configure this Level-2 state.

ChatGPT receives OAuth access and refresh credentials as the OAuth client. They
are transport credentials between ChatGPT and the SkillPilot authorization/MCP
endpoints; they are not normal model prompts, MCP tool arguments, or tool
results. ChatGPT automatically sends the access token in the Authorization
header of protected MCP requests. The user neither sees nor copies it. The
model-facing MCP contract contains no permanent SkillPilot ID. It does require
the temporary learning-session reference on every fachlicher tool call. The
reference is inserted automatically into the launch prompt; the user does not
copy or manage it.

Through MCP, the provider receives the projected state needed for the current
workflow, for example curriculum and scope summaries, active goal, progress,
permitted next actions, public goal or card references, task content, and
selected resources. SkillPilot receives explicit MCP method calls and their
arguments, such as selected focus/goal references, Recall result flags, or
requested evaluation identifiers. These requests are not equivalent
to a full chat transcript, but they are part of the interaction and may update
the pseudonymous learning state.

Normal model-facing state is prepared by the shared `CoachStateProjection`.
Released active exams expose task content and maximum points in normal context;
protected solution and scoring content is available only through the separately
authorized evaluation use case. Recall answers are released only after the
corresponding learner-answer step required by the workflow.

### E. Active Claude V1 OAuth/MCP Data

Claude is the current learning-beta provider. The marketplace supplies the
plugin package and coach instructions; the actual learning operations call the
provider-isolated Claude V1 MCP boundary over HTTPS and OAuth.

The current Claude authorization principal is a generated, learner-independent
technical connection reference, not the permanent SkillPilot ID. Each explicit
first-party coach start creates a separate high-entropy learning-session
reference. The backend stores its hash, learner association, creation and
expiry timestamps, locale and state version. It expires absolutely after
24 hours; neither chat activity nor refreshing OAuth extends that session.
Both the OAuth authorization and the selected temporary learning session are
required for learner-specific operations. OAuth alone cannot select a learner.

Claude's supported client-authentication profiles are separate from OpenAI's:
the code supports the constrained Claude public CIMD profile and an explicitly
configured confidential profile, with PKCE and provider-specific validation.
Do not infer OpenAI connector-client-certificate mTLS for Claude or treat a
public OAuth client identifier as a client secret. The exact deployed profile
must be verified operationally; the no-chat-prose and session boundaries apply
independently of that choice.

The backend projects the relevant learning context to Claude: current
curriculum and subject labels, current goal and authored description, permitted
next goals, daily-plan summaries, confirmed progress, and workflow-authorized
learning material. It does not expose the permanent learner key. These
projections are still pseudonymous learning data, not anonymous public content.

Incoming operations contain structured goal/card references, language,
concurrency and idempotency identifiers, authorized capability references, and
bounded decisions. Ordinary mastery contains no response text; an authorized
exam completion can include a numeric score. Recall grading contains only
card references and pass/fail values. Unsupported top-level and nested result
fields are rejected before core mutation or replay persistence. The provider
chat is where the coach assesses work and composes explanations and success
messages. Uploaded photos and voice interactions are provider-side inputs, not
SkillPilot feedback submissions.

Implementation references: `ClaudeV1AppAuthenticationFilter`,
`ClaudeV1LearningSessionService`, `ClaudeV1McpContractAdapter`, and
`ClaudeV1CoachContextProjector`. Historical Claude binding-grant or pending-launch
tables must not be described as the active V1 session model.

### F. Deliberately Submitted Learning-Goal Feedback

The cockpit and learning-goal book open the same voluntary public feedback
form. The cockpit supplies the selected goal/book context and return
navigation, not a learner ID. The requests use `credentials: 'omit'`; this is
not an automatic export from the provider chat.

The form has a separate notice and explicit confirmations. It accepts a
category, observation, and optional explanation/evidence, suggestion, source
and perspective. It has no designated name, email or attachment field. However,
text validation limits fields and lengths rather than recognizing arbitrary
personal information. Users must not include complete chats, credentials or
unnecessary personal details.

`goal_feedback_submission` stores the submitted text with random feedback and
submission IDs, receipt time, the public goal/book/page binding and its
fingerprints, notice version/language, confirmations and technical digests.
It has no learner foreign key. Rate limiting separately processes the client
IP and derives a short-lived hash for bounded in-memory counters; this does
not establish that infrastructure logs contain no network metadata.

Pending submissions are due for deletion after 30 days, with daily cleanup
and additional cleanup on intake/export operations. The form therefore states
at most 31 days in the running online inbox. Operators can export a batch and
then acknowledge its digest to delete the online content, leaving a
content-free batch receipt. The normal local intake stores access-restricted
files under `tmp/goal-feedback/inbox/<export-id>` and acknowledges only after
verified local storage.

Exported text may be used for the explicitly disclosed, technically assisted
review. Local raw files and any Codex session/tool records form separate
retention boundaries; the online deletion does not delete those copies. The
intake runbook requires removing local raw data after review and any separately
authorized improvement; no automatic local deadline is implemented. Withdrawal
or deletion requests use `support@skillpilot.com`, preferably with the feedback
ID. There is no public individual-feedback read/delete endpoint.

See [the feedback intake runbook](../qa-ci/goal-feedback-codex-intake.md),
`GoalFeedbackSubmissionService`, `GoalFeedbackRetentionService`,
`GoalFeedbackExportService`, and `GoalBookFeedbackPilotView.tsx`. These deliberate
text submissions must remain separate from the prohibition on coach-transmitted
chat and assessment prose.

## 3. Data Flow Scenarios

### Scenario: Individual Learner Login

1. The learner opens `https://skillpilot.com`.
2. The browser creates a new SkillPilot ID, loads an encrypted saved profile, or
   accepts an existing ID.
3. The browser retains the active ID locally and may save it encrypted.
4. Curriculum and learning configuration are stored in the backend under that
   pseudonymous ID.
5. The learner uses the cockpit or explicitly starts one of the available coach
   integrations.

### Scenario: Claude Beta Connection and Learning Start

1. The learner installs the current Claude marketplace plugin and connects its
   MCP integration through the supported OAuth flow. Provider eligibility and
   consent remain separate from the SkillPilot learner profile.
2. The learner creates or resumes a profile and chooses the learning context in
   the first-party SkillPilot WebGUI.
3. The explicit start action creates a new 24-hour Claude learning session and
   prepares the start message containing its temporary reference, not the
   permanent SkillPilot ID or OAuth credentials.
4. Claude uses both the valid OAuth authorization and that reference for
   learner-specific tools. SkillPilot returns the bounded coaching projection.
5. The coach assesses work inside the Claude conversation. Only the authorized
   structured learning result goes back to SkillPilot; the coach creates the
   learner-facing explanation and success response itself.

### Historical Scenario: ChatGPT Visible Session — Rollback Only

1. The browser calls
   `POST /api/ui/learners/{skillpilotId}/visible-chat-start`.
2. The backend creates a random `sps_...` token, stores only its HMAC hash and
   learner association, and gives it an absolute lifetime of at most 24 hours.
3. The browser opens the existing language-specific Custom GPT with a prepared
   message containing the token.
4. The GPT reloads current state through the `/api/ai/{lang}/sessions/.../visible`
   API before substantive work and uses the dedicated Actions for choices,
   progress, exams, and Recall.
5. The backend resolves the token to the learner internally.

### Candidate Acceptance Scenario: OpenAI V1 App Connection

1. Before calling the provider, the browser asks the person to confirm that the
   OpenAI minimum-age rules applicable in the person's country are met and that
   a person under 18 has parent or guardian permission. SkillPilot does not
   derive age from a grade level and does not collect a date of birth.
2. ChatGPT starts an OAuth Authorization Code flow with PKCE S256. The SkillPilot
   authorization server accepts only the fixed confidential client for
   **SkillPilot Coach v1**, authenticates it at the token endpoint with
   `client_secret_basic`, and validates the exact callback URI, resource, and
   scopes.
3. After consent, the backend issues a short-lived authorization code and then
   resource- and scope-bound access credentials. Open DCR/CIMD registrations and
   unauthenticated token exchange are not accepted in the production profile.
4. OAuth establishes only that the approved App may call the V1 MCP
   resource. It neither identifies a SkillPilot learner nor creates or selects
   a learning session.

### Scenario: Open the MCP Coach Without a Prepared Session

1. The model finds no current SkillPilot-prepared `learningSessionId`.
2. It calls no SkillPilot tool and requests no permanent or temporary ID.
3. It gives only the localized instruction to open
   `https://skillpilot.com/`, create or load the permanent ID, configure the
   learning context there, and select **Lernen starten** / **Start learning**.
4. The first-party WebGUI creates the session and opens a new chat. Only that
   new prepared message crosses into the provider flow.

### Candidate Acceptance Scenario: OpenAI Session With a Backend-Pinned Locale

1. The learner has an active permanent SkillPilot ID in the first-party browser
   UI and explicitly selects **Lernen starten**.
2. At that exact moment the backend creates a fresh, high-entropy learning
   session, even if the same learner has started another session before. It
   stores only the HMAC/hash of the reference, its learner association,
   backend-selected `communicationLocale`, `started_at`, absolute expiry exactly
   24 hours after creation, and optional revocation metadata.
3. The backend returns a prepared ChatGPT launch message containing the temporary
   learning-session reference but not the permanent SkillPilot ID, OAuth token,
   or OAuth client secret. The UI places the message into the ChatGPT launch
   automatically; the learner does not copy, edit, or manage the reference.
4. The App sends the reference unchanged with every learner-specific MCP tool
   call. The backend accepts such a call only when both the OAuth access token
   and learning session are independently valid.
5. The backend resolves the session to the permanent learner internally and
   returns only the projected coaching data. There is no fallback from OAuth
   subject, provider account, chat, or model context to a learner.

Repeated **Lernen starten** actions create distinct, independently expiring
sessions. A newer session does not silently extend or repurpose an older one.

### Scenario: App Authorization Revocation

1. The provider authorization is revoked through the supported revocation path
   or invalidated by the SkillPilot operator. Removing a plugin package is not
   by itself proof that the server received an OAuth revocation.
2. Server-side revocation invalidates the selected authorization and its
   access/refresh credentials. Existing learning sessions remain separate
   records but are unusable through MCP without valid App authorization and
   expire or can be revoked independently.
3. Durable pseudonymous learning progress is not deleted by OAuth revocation.

### Scenario: Progress Review in the Browser Cockpit

The browser uses its permanent SkillPilot ID on UI routes such as
`GET /api/ui/learners/{skillpilotId}/state`. This is a browser/backend interaction,
not an AI-provider interaction. The permanent ID may be visible in the browser
because it is the learner's durable SkillPilot access key.

## 4. Retention and Deletion

Repository-default credential validity periods for Claude V1 and the OpenAI V1
candidate are:

- OAuth access token: 1 hour;
- rotating refresh token: 30 days;
- Claude V1 learning session: a fixed 24 hours from its first-party start;
- OpenAI V1 learning session: exactly 24 hours from the corresponding
  confirmed first-party **Lernen starten** action.

The learning-session deadline is not extended by MCP requests,
access-token refresh, browser reload, a new provider chat, or context
compaction. Every new first-party **Lernen starten** action creates a separate
session with its own deadline. The OAuth connection
may remain refreshable after a learning session has expired; in that case
learner-specific tools require a new SkillPilot launch rather than new OAuth
consent.

App-authorization revocation invalidates the selected authorization and its
live access/refresh credentials. Session records remain independently governed
by expiry and revocation, but cannot authorize a request without valid OAuth.
Both current session cleanup jobs default to hourly removal of expired rows.
Refresh-token rotation can establish a later credential expiry; it must not be
described as automatic deletion of all connection data after 30 days.

OAuth validity is not a general database-retention deadline. The repository
does not establish one automatic deletion period for all expired authorization,
consent or diagnostic records. Current learner-independent technical OAuth
connections are separate from learner-bound legacy connection records: deleting
a learner does not automatically delete every technical provider authorization.
Independent logs are not part of the learner's active connection records.

Historical Visible Session tokens expire after at most 24 hours. Learning progress is not
deleted merely because an AI connection expires or is revoked.

The active learning state stored under a SkillPilot ID in the SkillPilot
database, including its associated SkillPilot learning sessions and SkillPilot
connections, has one common deletion boundary:

- the learner can delete it manually with the designated WebGUI function; and
- after 365 consecutive days without a successful activity, it becomes due for
  automatic deletion and is removed during the next automatic deletion run.

Activity is recorded only for these successfully completed boundaries:

- successful creation of a SkillPilot ID;
- foreground loading or resuming of the learning state through the SkillPilot WebGUI;
- a server-completed import or export of signed learner data;
- a learner-state change successfully stored on the server; or
- a successfully completed SkillPilot session or AI-provider connection action;
- a valid Coach/MCP invocation that completes with a successful domain result.

Background GET requests, SSE traffic, OAuth token refreshes, merely selecting,
opening, or reading a local file, and server operations that do not complete or
are domain-rejected do not count and do not restart the 365-day period.

After deletion, the permanent SkillPilot ID can no longer access that learning
state and its associated SkillPilot learning sessions and learner-bound
connections cannot be used. A separately retained technical OAuth authorization
cannot restore or select the deleted learner. Because SkillPilot has no required
real-world identity link, requests about a learner profile require proportionate
proof of access through an agreed secure path. Support must not solicit the
permanent ID or temporary credentials in ordinary email. Separate feedback
requests can use their feedback ID; the learner-ID requirement is not a blanket
condition for every data-subject request.

This boundary does not delete downloaded or other local files, provider-side
chats, or other data held by the AI provider. Existing backup copies are not
part of the active learning state. Neither manual deletion nor the 365-day
expiry immediately deletes each backup copy individually.

Authorization data can contain credential material and must be encrypted and
access-controlled. Plaintext learning-session references, OAuth credentials,
OAuth client secrets, request bodies, learner answers, and launch secrets must
not enter application, reverse proxy, trace, or support logs.

That is the operating requirement, not proof that every diagnostic path is
incapable of receiving text. The general `RequestLoggingFilter` completely skips
the protected MCP, OAuth, feedback, and coach-result routes. Separate bounded
OAuth/MCP telemetry still records such data as operation, outcome, latency and
correlation identifiers; OpenAI tool telemetry can contain an HMAC-derived
temporary-session fingerprint and a canonical request ID, not arbitrary tool
arguments.

For other retained API routes the general logger can write field-redacted,
size-limited request/response bodies at `DEBUG`. Optional AI tracing is disabled
by default; when enabled it appends redacted JSON bodies for non-skipped
`/api/ai` routes to `tmp/ai-trace.jsonl`, optionally with files per temporary
subject reference. Its known-field and token-pattern redaction is not general
personal-data detection. No automatic trace TTL, rotation or coupling to
learner deletion was found in that implementation.

The older/fallback `ChatStartRequest.promptContext` is another separate text
boundary: `ChatSessionService` truncates it to 2,000 characters and returns it
inside a prepared prompt, without persisting that field in the session record.
The returned prompt is not redacted as a whole by the general debug logger.
Do not advertise this legacy path or enable body tracing without reviewing the
remaining text exposure. In particular, the coach-tool invariant is not a claim
that SkillPilot can never process voluntary or legacy request text.

## 5. Backup and Recovery

Because the backend does not know real-world identities, learners or institutions
remain responsible for preserving access keys and identity mappings.

- Learner export/import can carry learning state to another browser context.
- Teacher-held name-to-ID mappings must be protected outside the SkillPilot
  backend. SkillPilot's local-class export encrypts downloaded files, but the
  institution remains responsible for password handling, access-controlled
  storage and deletion of obsolete files.
- A password-protected SkillPilot ID file lets learners retain the ID without
  storing it unencrypted.
- Logging out clears the active browser login but does not delete downloaded
  protected ID files, exports, or backend learning progress.
- Deleting the active server-side learner does not delete exports, SkillPilot-ID
  files, or other copies on learner-controlled devices. The learner must remove
  those local copies separately if they are no longer wanted.

The provided `scripts/backup_db.sh` sets restrictive filesystem permissions and
defaults to `BACKUP_RETENTION_DAYS=30`. It writes SQL dumps, excludes the
feedback-content tables from those dumps, and removes aged matching files only
during a successful backup run. The script itself does not encrypt the dump;
volume encryption or other infrastructure safeguards require separate evidence.
Its file-age rounding and run schedule also preclude an exact 30-day-to-the-hour
deletion guarantee.

`application.yml` defaults to `INFO` logging in `logs/skillpilot.log`, rotation
at 10 MB and `max-history: 7`. These are repository defaults, not verified
retention limits for the running application, reverse proxy, exported logs,
AI traces, infrastructure snapshots, WAL, or off-site copies. The operator has
not yet confirmed those actual limits. None of these copy boundaries should be
silently conflated with active learner deletion or online feedback deletion.

## 6. Residual Risks and Operating Rules

- A live learning-session reference is a credential. Do not share unredacted
  chats, exports, screenshots, browser history, HAR files, or support artifacts
  containing current Claude or OpenAI session values, or historical `sps_...`
  Visible Session tokens.
- OAuth access and refresh tokens are also bearer credentials. They must be
  protected at rest and in transit and must never be copied into prompts or
  diagnostics.
- Password protection of a downloaded class file does not encrypt the active
  `skillpilot_classes` browser storage, secure an already unlocked browser, or
  make a weak/shared password safe. It protects the exported file at rest and
  detects tampering; it is not a general device-security or GDPR-compliance
  guarantee.
- Learners can type or upload personal and sensitive information directly to the
  AI provider. Product guidance must tell them not to do so.
- The provider processes conversation content according to its own operating,
  privacy, safety, and retention terms. SkillPilot cannot erase a provider-side
  chat by deleting a SkillPilot connection.
- Tool arguments and tool results are intentionally narrower than the full chat,
  but they still reveal pseudonymous learning context to the provider and must be
  treated as user data.
- Canonical learning-goal and card IDs are public technical references, not
  credentials. Learning-session references and OAuth credentials are
  security-sensitive.
- The temporary V1 learning-session reference is automatically carried
  in the prepared start message and MCP tool arguments. It behaves like a
  short-lived bearer reference to one pseudonymous learner and must not be
  shared manually. The permanent SkillPilot ID remains entirely in first-party
  SkillPilot surfaces and backend-internal resolution, never in the
  chat/model/MCP/widget contract.
- The Visible Session implementation remains an explicit rollback/fallback path;
  retained legacy direct-ID or startcode routes must not be advertised as a
  current provider contract.
- The OpenAI integration candidate must not be advertised as a second public
  beta or an already accepted ChatGPT release. Claude availability does not
  establish support or acceptance on another host.

Before any provider-specific release or cutover, review the privacy notice,
this inventory, provider disclosures and eligibility, the actual retention
configuration, real revocation behavior, and exact OAuth client profile against
that release. Preserve Claude's security and functional checks during the active
beta. After stabilization, perform the focused real ChatGPT integration
acceptance and prepare the tested candidate for official submission; do not
invent a parallel distribution workaround.

Remaining operational confirmations are the hosting/processor details beyond
the confirmed German Core location, deployed OAuth and logging settings,
retention of authorization/consent rows and support messages, actual backup and
snapshot schedules, and removal of local feedback/diagnostic copies. These are
open documentation and operating facts, not permission to weaken authentication,
retain unnecessary text, or claim that all provider processing stays in Germany.

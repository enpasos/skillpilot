# Data Privacy and Storage Concept

Status: updated for the parallel ChatGPT Visible Session and German OpenAI
OAuth/MCP App architecture on 2026-07-22.

This is a technical data-flow and storage description. It does not replace the
provider's privacy terms or a legal review before a public release.

## 1. Core Philosophy: Privacy by Design

SkillPilot separates **pseudonymous learner identity**, **persistent learning
state**, **temporary provider access**, and **provider-side conversation
content**.

- The SkillPilot backend stores learning progress under a random, pseudonymous
  SkillPilot ID. It does not require a learner name, email address, or password.
- The browser is the learner's SkillPilot login surface. It may hold the
  permanent SkillPilot ID locally and can optionally save it encrypted with a
  user-chosen password.
- The permanent SkillPilot ID stays outside the AI chat, OAuth principal, and
  MCP tool contract. The backend resolves temporary credentials or an opaque
  connection subject to that ID internally.
- The AI provider processes the chat, uploads, projected learning context, and
  tool results under the provider account and its terms.
- SkillPilot does not receive the complete provider chat transcript. It does
  receive every explicit API or MCP tool request sent to it, including the
  arguments needed to read or change learning state.

Two ChatGPT integrations coexist during migration:

1. **Visible Session:** the current Custom GPT contract and the English
   fallback. A temporary `sps_...` bearer token is deliberately visible in the
   prepared message and subsequent state footer.
2. **German OpenAI OAuth/MCP App:** the target German integration. ChatGPT acts
   as OAuth client, then invokes the data-only MCP server embedded in the
   SkillPilot Spring Boot process.

The frontend selects the German variant at build time. An OpenAI-MCP build still
routes English to Visible Session. The Claude OAuth/MCP implementation remains
paused and hidden; it is not a production fallback.

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
- a random `HttpOnly` OpenAI browser-session cookie scoped to `/api` and a
  short-lived one-time `HttpOnly` binding cookie scoped to the OAuth
  authorization path. Neither value is readable by frontend JavaScript; the
  backend stores only keyed hashes for their binding comparison.

For a first German OpenAI connection, the browser calls the SkillPilot UI
endpoint with its permanent SkillPilot ID. The response opens ChatGPT and sets
the short-lived binding cookie. The permanent ID is not placed in the launch
message or ChatGPT URL.

For teacher-led usage, the teacher's browser or institution-controlled storage
may additionally hold class rosters and the mapping between real names and
SkillPilot IDs. That mapping is intentionally not stored centrally by
SkillPilot.

### B. Persistent Learning State in the SkillPilot Backend

**Trust boundary:** pseudonymous, centralized SkillPilot storage.

The backend stores, among other things:

- `Learner`: the permanent pseudonymous learner key;
- `Mastery`: learning-goal mastery keyed by learner and goal;
- planned goals and learner configuration, including curriculum,
  personalization, scope, active goal, filters, and synchronized client state;
- static curricula, competence definitions, SRS decks, resources, and review
  metadata.

No model provider needs the permanent SkillPilot ID to use either ChatGPT
integration. It remains the internal join key from a temporary session or
connection to the learning state.

### C. Visible Session Data

The backend stores a `ChatSession` containing the HMAC hash of the temporary
token, its learner association, language, creation/expiry/use timestamps, and
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

### D. German OpenAI OAuth/MCP App Data

The backend keeps this provider lane separate from the Visible Session tables
and Claude connection records.

It stores:

- an opaque OpenAI-DE connection subject linked internally to one learner, plus
  creation, authorization, OAuth-expiry, last-use, and revocation timestamps;
- a short-lived binding grant as an HMAC hash, including expiry, consumption,
  initiating client, selected curriculum, and a narrowly typed launch intent;
- a short-lived pending launch linked to the connection subject, including
  expiry/consumption and the same typed intent data;
- OAuth registered-client, authorization, consent, authorization-code, opaque
  access-token, and rotating refresh-token data required by the authorization
  server.

The supported launch intents are deliberately bounded: current unit, Verified
Recall with goal and batch size, and the reviewed Abi 2026 exam entry with goal
and course level. Free browser-supplied prompt instructions are not persisted as
launch state.

ChatGPT receives OAuth access and refresh credentials as the OAuth client. They
are transport credentials between ChatGPT and the SkillPilot authorization/MCP
endpoints; they are not normal model prompts, MCP tool arguments, or tool
results. The model-facing MCP contract also contains no permanent SkillPilot ID.

Through MCP, the provider receives the projected state needed for the current
workflow, for example curriculum and scope summaries, active goal, progress,
permitted next actions, public goal or card references, task content, and
selected resources. SkillPilot receives explicit MCP method calls and their
arguments, such as selected curriculum/scope/goal references, Recall result
flags, or requested evaluation identifiers. These requests are not equivalent
to a full chat transcript, but they are part of the interaction and may update
the pseudonymous learning state.

Normal model-facing state is prepared by the shared `CoachStateProjection`.
Released active exams expose task content and maximum points in normal context;
protected solution and scoring content is available only through the separately
authorized evaluation use case. Recall answers are released only after the
corresponding learner-answer step required by the workflow.

### E. Paused Claude OAuth/MCP Data

The repository retains a provider-isolated Claude OAuth/MCP implementation with
connection subjects, binding grants, pending launches, and provider-scoped OAuth
records. The backend and learner-facing Claude option are disabled by default.
They must remain disabled until the provider-specific security and adult-only
acceptance gates in the [Claude runbook](../deploy/claude-coach-beta.md) are
complete.

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

### Scenario: ChatGPT Visible Session

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

### Scenario: First German OpenAI OAuth/MCP Connection

1. Before calling the provider, the browser asks the person to confirm that the
   OpenAI minimum-age rules applicable in the person's country are met and that
   a person under 18 has parent or guardian permission. The confirmation is
   bound to the current pseudonymous SkillPilot profile for this browser tab.
   SkillPilot does not derive age from a grade level and does not collect a date
   of birth.
2. The browser calls the learner-specific OpenAI-DE `connect-start` endpoint
   with the explicit confirmation. The backend rejects missing or false
   confirmation with `403`; this is a self-attestation, not identity-based age
   verification.
3. The backend validates the selected curriculum and typed launch intent without
   yet applying it, creates a short-lived one-time binding grant, stores its
   hash, and sets the raw value only as a protected browser cookie.
4. ChatGPT starts OAuth 2.1 authorization with PKCE and exact resource binding.
   The authorization request can consume only the matching, unexpired browser
   binding and creates an opaque connection subject plus pending launch. The
   exact resource is retained with the authorization and checked again during
   every access-token introspection, including after refresh; trimming and
   trailing-slash equivalence are deliberately not accepted.
5. After consent, the backend issues an authorization code. The code exchange
   creates short-lived opaque access and rotating refresh credentials.
6. The pending launch is applied atomically when the connection is successfully
   authorized, not by an arbitrary later MCP call. The permanent SkillPilot ID
   never crosses into the provider contract.
7. Authenticated MCP calls resolve access token to connection subject to learner
   internally and return only the projected coaching data.

The pending launch prepares shared backend state; it is not bound to a particular
ChatGPT conversation. Parallel or later chats rehydrate the authorized learner
state through MCP.

### Scenario: Later German OpenAI App Launch

1. The cockpit checks the connection status for the active SkillPilot learner.
2. If the authorized connection is active, it creates and applies a short-lived,
   typed launch request and opens ChatGPT with a natural-language start message.
3. If the connection is missing or revoked, the cockpit returns to the first
   connection flow instead of exposing a learner identifier in the chat.
4. Clipboard access is only a convenience: the start message remains visible and
   copyable in the cockpit if the browser denies clipboard permission.

### Scenario: Disconnect or OAuth Revocation

1. The learner disconnects through the cockpit, or the OAuth client revokes the
   authorization.
2. SkillPilot marks the corresponding connection revoked and removes its pending
   launch, OAuth authorization, and consent state.
3. Existing access/refresh credentials can no longer resolve an active
   connection. A future launch must establish a new connection.

### Scenario: Progress Review in the Browser Cockpit

The browser uses its permanent SkillPilot ID on UI routes such as
`GET /api/ui/learners/{skillpilotId}/state`. This is a browser/backend interaction,
not an AI-provider interaction. The permanent ID may be visible in the browser
because it is the learner's durable SkillPilot access key.

## 4. Retention and Deletion

Default technical lifetimes for the German OpenAI integration are configurable
and currently set to:

- binding grant: 5 minutes;
- pending launch: 5 minutes;
- OAuth access token: 1 hour;
- rotating refresh token: 30 days.

An absolute lifetime is not automatically extended merely by reading a binding
or pending launch. Scheduled cleanup removes expired binding grants and pending
launches and revokes abandoned, never-authorized connections. Consumed records
may remain until their expiry cleanup so replay attempts can be rejected.

Disconnect and OAuth revocation invalidate the provider connection and remove
the related live authorization/consent and pending-launch data. Connection audit
timestamps and the revoked marker remain pseudonymous operational records unless
the learner record itself is deleted or a separate retention policy removes
them.

Visible Session tokens expire after at most 24 hours. A future cockpit session
management view should make all still-active Visible Session credentials
inspectable and revocable before their natural expiry.

Learning progress is durable product data and is not deleted merely because an
AI connection expires or is revoked. Since SkillPilot has no real-world identity
link, access or deletion requests can be processed only when the requester
provides the corresponding SkillPilot ID.

Authorization data and database backups contain credential material and must be
encrypted, access-controlled, and governed by the production backup-retention
policy. Plaintext session tokens, binding values, OAuth credentials, request
bodies, learner answers, and launch secrets must not enter application, reverse
proxy, trace, or support logs.

## 5. Backup and Recovery

Because the backend does not know real-world identities, learners or institutions
remain responsible for preserving access keys and identity mappings.

- Learner export/import can carry learning state to another browser context.
- Teacher-held name-to-ID mappings must be protected outside the SkillPilot
  backend.
- An encrypted local login helps retain a SkillPilot ID on a device without
  storing it in plaintext.
- Logging out clears the active browser login but does not delete explicitly
  saved encrypted local profiles or backend learning progress.

## 6. Residual Risks and Operating Rules

- A live Visible Session token is a bearer credential. Do not share unredacted
  chats, exports, screenshots, browser history, HAR files, or support artifacts
  containing `sps_...` values.
- OAuth access and refresh tokens are also bearer credentials. They must be
  protected at rest and in transit and must never be copied into prompts or
  diagnostics.
- Learners can type or upload personal and sensitive information directly to the
  AI provider. Product guidance must tell them not to do so.
- The provider processes conversation content according to its own operating,
  privacy, safety, and retention terms. SkillPilot cannot erase a provider-side
  chat by deleting a SkillPilot connection.
- Tool arguments and tool results are intentionally narrower than the full chat,
  but they still reveal pseudonymous learning context to the provider and must be
  treated as user data.
- Canonical learning-goal and card IDs are public technical references, not
  credentials. Connection subjects, session tokens, binding values, and OAuth
  credentials are security-sensitive.
- The Visible Session implementation remains an explicit rollback/fallback path;
  retained legacy direct-ID or startcode routes must not be advertised as a
  current provider contract.
- The paused Claude sources must not be interpreted as an enabled product option.

Before public MCP release, the privacy notice shown in the cockpit, this data
inventory, provider disclosures, age/guardian policy, retention configuration,
and real revocation behavior must be reviewed together against the deployed
OpenAI App version.

# Data Privacy and Storage Concept

Status: updated for the current web-started multilingual OpenAI OAuth/MCP App,
the rollback-only ChatGPT Visible Session, and the SkillPilot-ID deletion and
retention boundary on 2026-08-13.

This is a technical data-flow and storage description. It does not replace the
provider's privacy terms or a legal review before a public release.

The normative identity and session contract for the V1 App is
[OpenAI MCP OAuth App binding and 24-hour learning sessions](../concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.md).

## 1. Core Philosophy: Privacy by Design

SkillPilot separates **pseudonymous learner identity**, **persistent learning
state**, **temporary provider access**, and **provider-side conversation
content**.

- The SkillPilot backend stores learning progress under a random, pseudonymous
  SkillPilot ID. It does not require a learner name, email address, or password.
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

Two ChatGPT integration paths coexist during rollback support:

1. **Visible Session:** retained Custom-GPT rollback contract only. It is not the
   current OpenAI-MCP contract. A temporary `sps_...`
   bearer token is deliberately visible in the prepared message and subsequent
   state footer.
2. **Multilingual OpenAI V1 OAuth/MCP App:** the current integration for every
   backend-supported communication locale. ChatGPT acts as OAuth client, then
   invokes the data-only MCP server embedded in the SkillPilot Spring Boot
   process.

The frontend selects the OpenAI-MCP variant at build time. German, English, and
later supported locales share the same V1 App; the backend pins the
`communicationLocale` in the learning session. The Claude OAuth/MCP implementation remains
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
- the freshly prepared ChatGPT launch URL. It contains a natural start message
  with a temporary learning-session reference, but no permanent SkillPilot ID,
  OAuth token, or client secret.

Every V1 coach start calls a learner-specific SkillPilot UI endpoint with
the locally active permanent SkillPilot ID. The backend creates a new
learning-session reference at that exact moment and the response opens ChatGPT
with the prepared message. The permanent ID is not placed in the launch message
or ChatGPT URL.

For teacher-led usage, the teacher's browser or institution-controlled storage
may additionally hold class rosters and the mapping between real names and
SkillPilot IDs. That mapping is intentionally not stored centrally by
SkillPilot.

### B. Persistent Learning State in the SkillPilot Backend

**Trust boundary:** pseudonymous, centralized SkillPilot storage.

The backend stores, among other things:

- `Learner`: the permanent pseudonymous learner key;
- provider-specific active learning sessions, including their absolute expiry
  and direct internal link to the learner;
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

### D. Multilingual OpenAI V1 OAuth/MCP App Data

The backend keeps this provider lane separate from the Visible Session tables
and Claude connection records.

The protected public V1 endpoint
`https://mcp-coach-v1.skillpilot.com/mcp` uses normal server-authenticated
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

### Scenario: OpenAI V1 App Connection

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

### Scenario: Open the Coach Without a Prepared Session

1. The model finds no current SkillPilot-prepared `learningSessionId`.
2. It calls no SkillPilot tool and requests no permanent or temporary ID.
3. It gives only the localized instruction to open
   `https://skillpilot.com/`, create or load the permanent ID, configure the
   learning context there, and select **Lernen starten** / **Start learning**.
4. The first-party WebGUI creates the session and opens a new chat. Only that
   new prepared message crosses into the provider flow.

### Scenario: Start a Learning Session With a Backend-Pinned Locale

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

1. The App authorization is revoked in ChatGPT or invalidated by the SkillPilot
   operator.
2. SkillPilot invalidates the App authorization and its access/refresh
   credentials. Existing learning sessions remain separate records but are
   unusable through MCP without valid App authorization and expire or can be
   revoked independently.
3. Durable pseudonymous learning progress is not deleted by OAuth revocation.

### Scenario: Progress Review in the Browser Cockpit

The browser uses its permanent SkillPilot ID on UI routes such as
`GET /api/ui/learners/{skillpilotId}/state`. This is a browser/backend interaction,
not an AI-provider interaction. The permanent ID may be visible in the browser
because it is the learner's durable SkillPilot access key.

## 4. Retention and Deletion

Default technical lifetimes for the multilingual OpenAI V1 integration are configurable
and currently set to:

- OAuth access token: 1 hour;
- rotating refresh token: 30 days;
- OpenAI V1 learning session: exactly 24 hours from the corresponding
  confirmed first-party **Lernen starten** action.

The OpenAI V1 learning-session deadline is not extended by MCP requests,
access-token refresh, browser reload, a new ChatGPT chat, or context
compaction. Every new first-party **Lernen starten** action creates a separate
session with its own deadline. The OAuth connection
may remain refreshable after a learning session has expired; in that case
learner-specific tools require a new SkillPilot launch rather than new OAuth
consent.

App-authorization revocation invalidates the live access/refresh credentials and
authorization/consent data. Session records remain independently governed by
expiry and revocation, but cannot authorize a request without valid OAuth.
OAuth-authorization audit timestamps and revoked markers are pseudonymous
operational records. While the learner exists, they remain governed by their
technical purpose; deletion of the learner removes the associated active
SkillPilot connection records as described below. Independent logs are not
part of those active connection records.

Visible Session tokens expire after at most 24 hours. Learning progress is not
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
state and the associated SkillPilot learning sessions and connections cannot be
used. Because SkillPilot has no real-world identity link, data-subject requests
can be attributed only when the requester provides the corresponding SkillPilot
ID or otherwise demonstrates access to it.

This boundary does not delete downloaded or other local files, provider-side
chats, or other data held by the AI provider. Existing backup copies are not
part of the active learning state. Neither manual deletion nor the 365-day
expiry immediately deletes each backup copy individually.

Authorization data can contain credential material and must be encrypted and
access-controlled. Plaintext learning-session references, OAuth credentials,
OAuth client secrets, request bodies, learner answers, and launch secrets must
not enter application, reverse proxy, trace, or support logs.

## 5. Backup and Recovery

Because the backend does not know real-world identities, learners or institutions
remain responsible for preserving access keys and identity mappings.

- Learner export/import can carry learning state to another browser context.
- Teacher-held name-to-ID mappings must be protected outside the SkillPilot
  backend.
- A password-protected SkillPilot ID file lets learners retain the ID without
  storing it unencrypted.
- Logging out clears the active browser login but does not delete downloaded
  protected ID files, exports, or backend learning progress.
- Deleting the active server-side learner does not delete exports, SkillPilot-ID
  files, or other copies on learner-controlled devices. The learner must remove
  those local copies separately if they are no longer wanted.

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
  credentials. Learning-session references and OAuth credentials are
  security-sensitive.
- The temporary OpenAI V1 learning-session reference is automatically carried
  in the prepared start message and MCP tool arguments. It behaves like a
  short-lived bearer reference to one pseudonymous learner and must not be
  shared manually. The permanent SkillPilot ID remains entirely in first-party
  SkillPilot surfaces and backend-internal resolution, never in the
  chat/model/MCP/widget contract.
- The Visible Session implementation remains an explicit rollback/fallback path;
  retained legacy direct-ID or startcode routes must not be advertised as a
  current provider contract.
- The paused Claude sources must not be interpreted as an enabled product option.

Before a production-App cutover, the privacy notice shown in the cockpit, this
data inventory, provider disclosures, age/guardian policy, retention
configuration, real revocation behavior, and exact OAuth-client-profile
binding must be reviewed together against the deployed OpenAI App version. The production OAuth profile uses the
fixed confidential client, protected client-secret storage and rotation,
`client_secret_basic`, exact callback allowlisting, PKCE S256, and exact
resource/audience and scope validation.

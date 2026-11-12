# Custom GPT: Private Startcode and Session Flow

Status: architecture originally introduced on 19 May 2026 and restored since 18 August 2026
as the private default start flow for the two newly built GPTs `SkillPilot GPT Coach (de)`
and `SkillPilot GPT Coach (en)`. Cross-turn Action retention remains a mandatory real-host
rollout gate.

> This document describes the Custom GPT transport. The multilingual target architecture
> remains the
> [OpenAI MCP App with OAuth and 24h Learner Session](openai-mcp-oauth-learner-session-architecture.md).
> There, ChatGPT carries OAuth access automatically. Every explicit start in SkillPilot
> creates a separate learner session capped at an absolute maximum of 24 hours, inserts it
> automatically into the prepared start message, and subsequently requires it as an argument
> on every domain tool. The permanent SkillPilot ID never appears in chat. The
> [Visible Session Architecture](chatgpt-visible-session-flow.md) serves solely as the
> explicitly launched emergency fallback of those same new GPTs. In normal operation,
> German, English, and any later-supported interaction language share the same
> major-versioned app.

This document specifies the browser-first start flow for launching the new SkillPilot GPT
Coaches in ChatGPT. The goal is for learners to start on `skillpilot.com` while ChatGPT sees
only short-lived start codes and session tokens. The permanent SkillPilot ID stays in the
browser and server-side inside the SkillPilot backend.

Deployed implementation baseline:

- Web start and relevant campaign entry points mint start codes via `/api/ui/learners/{skillpilotId}/chat-start`.
- Custom GPT Actions redeem start codes via `/api/ai/{lang}/chat-start/redeem`.
- New GPT Actions use session routes under `/api/ai/{lang}/sessions/{chatSessionToken}/...`.
- Session routes return `skillpilotId: null`.
- Start codes and chat-session tokens are stored server-side only as hashes.
- Legacy AI routes carrying a SkillPilot ID remain available for now as compatibility and debug routes, without being advertised in the Custom GPT schema.

## Target Picture

The normal entry path is always:

```text
skillpilot.com -> SkillPilot Backend -> SkillPilot Lerncoach (ChatGPT) -> SkillPilot Backend
```

Not intended for normal launch:

```text
SkillPilot Lerncoach -> neue SkillPilot-ID erzeugen -> User muss ID selbst sichern
```

The SkillPilot ID remains a learner's durable security and recognition key. It must not be
transported in ChatGPT URLs, ChatGPT prompts, or ChatGPT responses.

## Involved Keys

### SkillPilot ID

The SkillPilot ID is the permanent learner key. It identifies the learner state in the
backend.

Properties:

- long-lived
- stored locally in the browser
- optionally saved locally as a password-encrypted named login
- used server-side inside the learner domain
- not intended for ChatGPT URLs
- never emitted to ChatGPT during the normal GPT flow

### Start Code

The start code is a short-lived one-time code requested from the backend by the browser to
initiate a GPT session.

Properties:

- short and human-readable, e.g. `SP-7KQ9-M2PA`
- single-use redemption
- short validity window, e.g. 5 minutes
- bound server-side to a SkillPilot ID
- permitted in the ChatGPT start prompt and optionally in the ChatGPT launch URL
- invalidated immediately upon successful redemption

### Chat Session Token

The chat-session token is the bearer key used by the SkillPilot Learning Coach after
redeeming the start code.

Properties:

- random, long, and opaque, e.g. `sps_...`
- bound server-side to a SkillPilot ID
- time-bounded, e.g. 24 hours or until explicitly revoked
- can be minted separately per GPT session
- replaces the SkillPilot ID in AI routes
- permitted in internal GPT tool calls
- must not be communicated as a permanent user key

## Normal Browser-First Flow

1. The learner opens `skillpilot.com`.
2. The browser presents a clear **Login** step:
   - If a SkillPilot ID is already present, it is used.
   - If no SkillPilot ID is present, the learner can have the backend generate a new ID.
   - If a SkillPilot ID was saved locally under password encryption, it can be loaded with name and password.
   - Alternatively, an existing SkillPilot ID can be entered directly.
3. The browser stores the active SkillPilot ID locally for the current browser session. Optionally, it can be persisted locally as a password-encrypted named login.
4. The learner selects a skill landscape or confirms the existing selection. That curriculum choice is persisted against the SkillPilot ID.
5. Internally, the browser prepares a temporary browser session.
6. To launch the SkillPilot Learning Coach, the browser calls the backend to mint a unique one-time start code.
7. The backend generates the start code, stores only its hash server-side, and returns the code to the browser.
8. The browser opens the SkillPilot Learning Coach with a start prompt containing only the start code.
9. The SkillPilot Learning Coach invokes the start-code redeem Action.
10. The backend redeems the start code, mints a chat-session token, and returns it together with the initial learner state.
11. From that point onward, the SkillPilot Learning Coach uses exclusively the chat-session token for backend Actions.

Visible steps from the learner's perspective:

1. **Login**: create a new SkillPilot ID, load a saved login, or enter a SkillPilot ID.
2. **Curriculum**: select a skill landscape.
3. **Start**: open the Cockpit or launch the SkillPilot Learning Coach with a start code.

The technical session token remains internal. The start code for the SkillPilot Learning
Coach is explained to the user because it appears visibly in the ChatGPT start prompt.

## Sequence

```text
Browser                 Backend                  SkillPilot Lerncoach
   |                       |                            |
   | GET skillpilot.com    |                            |
   |---------------------->|                            |
   |                       |                            |
   | localStorage: ID?     |                            |
   |                       |                            |
   | POST /api/ui/learners |                            |
   | falls keine ID        |                            |
   |---------------------->|                            |
   |<----------------------| SkillPilot-ID              |
   |                       |                            |
   | PUT curriculum        |                            |
   |---------------------->|                            |
   |                       |                            |
   | POST chat-start       |                            |
   |---------------------->|                            |
   |<----------------------| Startcode                  |
   |                       |                            |
   | open ChatGPT prompt   |                            |
   |--------------------------------------------------->|
   |                       |                            |
   |                       | POST redeemStartCode       |
   |                       |<---------------------------|
   |                       | prueft Code, erzeugt Token |
   |                       |--------------------------->|
   |                       | Chat-Session-Token + State |
   |                       |                            |
   |                       | GET/POST session actions   |
   |                       |<---------------------------|
   |                       |--------------------------->|
```

## API

UI and AI APIs are separated: the browser may work with the permanent SkillPilot ID, whereas
the GPT works solely with start codes and chat-session tokens.

### UI: Mint Start Code

```http
POST /api/ui/learners/{skillpilotId}/chat-start
Content-Type: application/json
```

Request:

```json
{
  "language": "de",
  "client": "web",
  "selectedCurriculum": "a0e13c56-c25f-4742-9272-3a1a603ee52e"
}
```

Response:

```json
{
  "startCode": "SP-7KQ9-M2PA",
  "expiresAt": "2026-05-19T09:35:00Z",
  "prompt": "Starte SkillPilot mit Startcode: SP-7KQ9-M2PA"
}
```

From this response, the browser may optionally construct a ChatGPT launch URL:

```text
https://chatgpt.com/g/...skillpilot-gpt-coach-de?prompt=<url-encoded prompt>
```

The prompt link is a convenience mechanism, not a security anchor. In the ordinary web flow,
the start code is passed directly through the ChatGPT prompt query parameter. A manual
copy-and-paste view is needed only as a diagnostic or fallback option when a browser blocks
popup or prompt launches.

### AI: Redeem Start Code

```http
POST /api/ai/{lang}/chat-start/redeem
Content-Type: application/json
```

Request:

```json
{
  "startCode": "SP-7KQ9-M2PA"
}
```

Response:

```json
{
  "chatSessionToken": "sps_3J4v...",
  "expiresAt": "2026-05-20T09:30:00Z",
  "state": {
    "...": "initialer Learner-State ohne echte SkillPilot-ID"
  }
}
```

Once redeemed, the start code must not be redeemable a second time.

### AI: Session-Based Actions

New GPT Actions must no longer carry the SkillPilot ID in the request path.

Examples:

```http
GET /api/ai/{lang}/sessions/{chatSessionToken}/state
POST /api/ai/{lang}/sessions/{chatSessionToken}/scope
POST /api/ai/{lang}/sessions/{chatSessionToken}/active-goal
POST /api/ai/{lang}/sessions/{chatSessionToken}/mastery
POST /api/ai/{lang}/sessions/{chatSessionToken}/curriculum
POST /api/ai/{lang}/sessions/{chatSessionToken}/personalization
POST /api/ai/{lang}/sessions/{chatSessionToken}/verified-recall/start
POST /api/ai/{lang}/sessions/{chatSessionToken}/verified-recall/answer
POST /api/ai/{lang}/sessions/{chatSessionToken}/verified-recall/result
```

On every session Action, the backend resolves internally:

```text
chatSessionToken -> SkillPilot-ID -> bestehende LearnerService-Logik
```

## Sanitizing AI Responses

Whenever the SkillPilot Learning Coach operates in session mode, AI responses must not
contain the real SkillPilot ID.

Existing response DTOs can continue to be reused internally, provided they are sanitized on
AI session routes:

- omit `skillpilotId` or serialize it as `null`
- generate no links containing `skillpilotId`
- generate no prompt text containing the real SkillPilot ID
- emit no error message that inadvertently echoes the ID

Whenever the GPT needs an identifier for follow-up calls, that identifier is exclusively
`chatSessionToken`.

## Persistence Model

### Start-Code Table

Minimum required fields:

```text
code_hash
learner_skillpilot_id
issued_at
expires_at
redeemed_at
redeemed_session_id
client
language
```

Notes:

- Start codes must be persisted as hashes rather than plaintext.
- Expiry and single-use redemption must be checked atomically.
- Expired start codes can be purged periodically.

### Chat-Session Table

Minimum required fields:

```text
token_hash
learner_skillpilot_id
started_at
expires_at
revoked_at
last_used_at
source_start_code_hash
language
```

Notes:

- Session tokens must likewise be persisted as hashes.
- The raw token value is returned to the GPT only once at creation time.
- Backend logs must never print raw tokens in plaintext.

## Validity Rules

Current launch defaults:

```text
Startcode TTL: 5 Minuten
Startcode Nutzung: genau einmal
Chat-Session TTL: 24 Stunden
Chat-Session Nutzung: mehrfach bis Ablauf oder Widerruf
```

On every AI session Action:

1. Validate token syntax.
2. Look up the token hash.
3. Verify that the session has not expired.
4. Verify that the session has not been revoked.
5. Update `last_used_at`.
6. Use the resolved SkillPilot ID internally for existing learner domain logic.

## Error Cases

### Missing Start Code

The GPT responds along the lines of ("Please start SkillPilot via `skillpilot.com`, where
your learning state is loaded and a start code is generated"):

```text
Bitte starte SkillPilot ueber skillpilot.com. Dort wird dein Lernstand geladen und ein Startcode erzeugt.
```

In the normal flow, the GPT must never mint a new SkillPilot ID on its own.

### Expired Start Code

Backend:

```http
410 Gone
```

GPT ("The start code has expired. Please reopen `skillpilot.com` and launch ChatGPT from
there"):

```text
Der Startcode ist abgelaufen. Bitte oeffne skillpilot.com erneut und starte ChatGPT von dort.
```

### Start Code Already Used

Backend:

```http
409 Conflict
```

GPT ("This start code has already been used. Please generate a new start code on
`skillpilot.com`"):

```text
Dieser Startcode wurde bereits verwendet. Bitte erzeuge auf skillpilot.com einen neuen Startcode.
```

### Expired Chat-Session Token

Backend:

```http
401 Unauthorized
```

GPT ("The SkillPilot chat session has expired. Please restart via `skillpilot.com`"):

```text
Die SkillPilot-Chat-Sitzung ist abgelaufen. Bitte starte erneut ueber skillpilot.com.
```

## UX Rules

The web start page must not jump straight into ChatGPT while no SkillPilot ID is loaded in
the browser.

Recommended user flow:

1. Display **Login**.
2. Offer three entry paths:
   - `Create new SkillPilot ID` (`Neue SkillPilot-ID erstellen`)
   - `Load saved login` (`Gespeicherten Login laden`)
   - `Enter SkillPilot ID directly` (`SkillPilot-ID direkt eingeben`)
3. Optional: `Save this login on this device` (`Diesen Login auf diesem Geraet speichern`)
   with name and password. The SkillPilot ID is encrypted locally; the password itself is
   never stored.
4. Display curriculum or initial scope.
5. Offer action buttons:
   - `Start SkillPilot Learning Coach` (`SkillPilot Lerncoach starten`)
   - `Open Cockpit` (`Cockpit oeffnen`)
6. When clicking `Start SkillPilot Learning Coach`:
   - mint a start code
   - open ChatGPT with the prompt query parameter
   - if blocked by the browser, show a clear notice or diagnostic/copy fallback view

In normal operation, the user should not have to inspect the raw SkillPilot ID. A diagnostic
or export screen may reveal it, clearly labeled as a permanent credential/key.

Logout behavior:

- ends the active browser session
- removes the active SkillPilot ID from ordinary local session storage
- does not automatically delete password-encrypted saved logins
- returns to the start/login screen

## Learning Coach Behavior

The SkillPilot Learning Coach must:

- recognize start codes
- call `redeemStartCode` first whenever a start code is supplied
- use the returned `chatSessionToken` for all subsequent Actions
- never ask for the permanent SkillPilot ID
- never display a SkillPilot ID unless explicitly needed for diagnostics/support
- direct users to `skillpilot.com` whenever no start code is present
- refrain from switching into Voice Mode as long as Custom GPT Actions cannot execute
  function calls there

## Legacy and Migration Strategy

Existing AI routes carrying `skillpilotId` in the URL path can remain in place initially:

```http
/api/ai/{lang}/learners/{skillpilotId}/...
```

However, they should no longer be advertised for the ordinary GPT flow. The Custom GPT
OpenAPI specification should target exclusively the new session routes.

Transition steps:

1. Build the new start-code and session routes.
2. Switch the web start page to start codes.
3. Switch the GPT OpenAPI specification to session routes.
4. Update the GPT system instructions.
5. Retain old SkillPilot ID routes for legacy compatibility and debugging.
6. Decide later whether to restrict or retire the legacy routes.

## Design Decisions

- `chatSessionToken` defaults to a 24-hour TTL.
- Multiple concurrent active chat sessions per learner are permitted.
- `chatSessionToken` is passed as a URL path parameter in Custom GPT routes because ChatGPT
  Actions handle path parameters reliably. Server logs must never store or emit raw tokens
  in plaintext.
- AI session responses serialize `skillpilotId: null` so existing response DTOs stay
  wire-compatible.
- A start code may optionally preselect a curriculum without requiring one.

Open items for later hardening:

- Expose active chat sessions in the Cockpit and allow manual revocation.
- Add scheduled cleanup for expired start codes and sessions.
- Optionally evaluate whether session tokens can move from URL paths to headers over the
  long term.

## Implementation Status

Completed:

1. Data model and Liquibase migration for start codes and chat sessions.
2. Service for code/token generation, hashing, expiry, redemption, and token resolution.
3. UI `chat-start` endpoint for existing learners.
4. AI `redeem` endpoint.
5. Session-based AI routes wrapping existing `LearnerService` methods.
6. Response sanitization on AI session routes.
7. Frontend start flow switched to start codes.
8. Custom GPT OpenAPI specification and system instructions updated.

Local end-to-end test coverage:

   - generate new SkillPilot ID
   - generate start code
   - redeem start code
   - execute follow-up Action with session token
   - reject second redemption of the same start code
   - reject expired start code
   - verify that the real SkillPilot ID never appears in GPT responses

# Data Privacy and Storage Concept

Status: updated for the current ChatGPT Visible Session architecture on
2026-07-21.

## 1. Core Philosophy: Privacy by Design

SkillPilot separates **identity**, **persistent learning state**, **temporary AI
access**, and **conversation content**.

- The **SkillPilot backend** knows learning progress only under a random,
  pseudonymous SkillPilot ID. It stores no learner names, email addresses, or
  passwords.
- The **browser** is the learner's login surface. It may hold the permanent
  SkillPilot ID locally and can optionally store it encrypted with a user-chosen
  password.
- The current **ChatGPT Custom GPT** receives a temporary `sps_...` chat-session
  token, never the permanent SkillPilot ID. The token is deliberately visible in
  the prepared first message and in the response footer because ChatGPT cannot be
  relied on to retain a previous hidden Action result across user turns.
- The SkillPilot backend does not receive the learner's ChatGPT conversation or
  uploaded chat content. It receives only the explicit Action requests needed to
  read or update learning state.

The backend alone resolves `chatSessionToken -> skillpilotId`. The token is a
temporary bearer credential, not an anonymization of everything shown to the AI:
ChatGPT still processes the learning context and everything the learner enters or
uploads under the rules of the selected ChatGPT account.

## 2. Data Partitioning

### A. Local Client (Browser / Local Storage)

**Status:** trusted by the user, private, local.

The browser may hold:

- **Active login:** the current SkillPilot ID for the browser session.
- **Encrypted saved logins:** optional named local profiles. The SkillPilot ID is
  encrypted with a password through browser cryptography; the password is not
  stored.
- **Session marker:** a browser-local UI marker used to distinguish active browser
  sessions.
- **Curriculum selection:** the selected curriculum for the active SkillPilot ID.
- **Local SRS state:** flashcard scheduling state before or between sync/export
  operations.

When the learner starts ChatGPT, the browser receives the newly issued temporary
session token and puts it into the prepared message. It does not put the permanent
SkillPilot ID into that message.

For teacher-led usage, a teacher's browser or protected local file may also hold:

- class rosters such as "Physics 12 LK";
- the mapping between a real name and a SkillPilot ID.

This identity mapping is intentionally not stored centrally by SkillPilot.

### B. SkillPilot Backend / Database

**Status:** pseudonymous, centralized.

The backend stores educational state keyed by the permanent SkillPilot ID:

- **`Learner`:** the permanent pseudonymous learner key, without name, email
  address, or learner password;
- **`Mastery`:** `skillpilotId + goalId -> value`;
- **planned goals and learner configuration:** curriculum, personalization, scope,
  active goal, filters, and learning state;
- **`ChatSession`:** HMAC hash of the temporary token, creation/expiry/use and
  optional revocation metadata, language, and the internal learner association;
- **static data:** curricula, competence definitions, SRS decks, resources, and
  review metadata.

The active Visible Session path sets no source start code on a `ChatSession`.
`ChatStartCode` and source-start-code fields remain only because the complete
former startcode/redeem implementation is retained for a coordinated rollback.
They are not used by the current default Custom GPT flow.

The repository also contains entities for the paused Claude OAuth/MCP prototype,
including connection subjects, short-lived binding grants, pending launches, and
OAuth authorization data. Those sources are retained, but both the Claude backend
and learner-facing UI are disabled by default.

Plaintext start codes, chat-session tokens, OAuth credentials, binding grants, and
pending-launch secrets must never be stored in application logs. Secret values are
stored hashed where the protocol permits; OAuth authorization data and database
backups must be protected as credential material.

### C. Current AI Layer: ChatGPT Visible Session

**Status:** current learner-facing reference integration.

ChatGPT sees:

- the temporary `sps_...` token in the prepared first user message and the
  mandatory SkillPilot footer;
- the current session projection required for coaching, including curriculum,
  active goal, progress, permitted next step, and selected resources;
- a short-lived selection reference and visible choice numbers when a setup or
  navigation decision is needed;
- full canonical learning-goal IDs when a later Action must address a goal;
- Recall card IDs together with their visible prompts;
- the learner's conversation, dictated text, and uploaded content inside ChatGPT.

ChatGPT does not receive:

- the permanent SkillPilot ID;
- browser-stored encrypted profiles;
- teacher-held name-to-ID mappings;
- class rosters or other identity data from SkillPilot;
- links containing the SkillPilot ID or session token;
- exam solutions in normal state responses;
- Recall answers before the learner has answered the corresponding visible card.

Normal model-facing state is prepared by the shared `CoachStateProjection`.
Released active exams contain only task content and maximum points there. Solution,
passing threshold, source-artifact path, and scoring steps are available only from
the separately authorized exam-evaluation use case.

For the current provider-hosted chat, this evaluation boundary proves that the
goal is the active, released, structurally complete exam. It does not independently
prove that a learner answer was submitted: SkillPilot intentionally receives no
chat transcript, and the current request contains only the visible goal ID. The
required answer-before-evaluation sequence is therefore instruction-gated until a
future SkillPilot-controlled widget or cockpit submission introduces an attempt
receipt.

Canonical learning-goal IDs are public technical references, not credentials.
Selection references are short-lived state handles. The session token is the only
visible value in this set that grants temporary access to the pseudonymous learning
state.

### D. Paused AI Layer: Claude OAuth/MCP

**Status:** retained implementation under development; disabled and not currently
learner-facing.

The Claude design uses a different trust boundary. A generic launch prompt contains
neither SkillPilot ID nor chat-session token. If enabled, the backend would resolve
an authenticated opaque OAuth connection subject to the learner internally.
Anthropic would hold the OAuth access and refresh credentials as the client, while
those credentials would not be model prompts, MCP arguments, or tool responses.

This is not currently a production fallback. Claude now uses the same safe normal
state projection and protected exam-evaluation use case as Visible Session, and
its retained tool adapter includes personalization. The Claude coach tools remain
disabled until the complete provider-specific workflow has passed a recorded,
adult-only end-to-end acceptance run. See the
[paused Claude runbook](../deploy/claude-coach-beta.md).

## 3. Data Flow Scenarios

### Scenario: Individual Learner Login

1. Learner opens `https://skillpilot.com`.
2. Browser offers three login paths:
   - create a new SkillPilot ID;
   - load an encrypted saved login;
   - enter an existing SkillPilot ID directly.
3. Browser holds the active SkillPilot ID locally and may save it encrypted as a
   named local login.
4. Learner selects a curriculum. The backend stores that selection for the
   SkillPilot ID.
5. Learner opens the browser cockpit or starts the SkillPilot Learning Coach.

### Scenario: Current ChatGPT Learning-Coach Session

1. Browser already holds the active SkillPilot ID.
2. Browser calls
   `POST /api/ui/learners/{skillpilotId}/visible-chat-start`.
3. Backend creates a random `sps_...` token, stores only its HMAC hash, binds the
   session internally to the learner, and sets an absolute expiry of no more than
   24 hours.
4. Backend returns an expiry and a prepared localized message that contains the
   token exactly once and contains no permanent SkillPilot ID.
5. Browser opens the existing German or English Custom GPT with that prepared
   message. The learner sends it visibly.
6. The GPT calls
   `GET /api/ai/{lang}/sessions/{chatSessionToken}/visible/state`.
7. Every normal coach answer ends with the exact backend-provided footer containing
   the token and, while a goal is active, its full canonical ID.
8. Before each later substantive normal user turn, the GPT reloads state through
   the same `/visible/...` surface. Visible selections, exam submissions, and
   Recall answers use their dedicated Actions.
9. Backend resolves `chatSessionToken -> skillpilotId` internally and applies the
   provider-neutral learner-state logic.

The permanent SkillPilot ID is therefore not exposed to ChatGPT. The temporary
token is exposed by design and must be protected until it expires.

### Scenario: Progress Review in the Browser Cockpit

1. Browser holds or loads the SkillPilot ID.
2. Browser calls UI routes such as
   `GET /api/ui/learners/{skillpilotId}/state`.
3. Backend returns the learner state for the browser cockpit.
4. Learner inspects progress, active goals, curriculum state, and synced SRS/client
   state.

This is a browser/backend interaction, not an AI interaction. The permanent
SkillPilot ID may appear in the browser because it is the learner's durable access
key.

### Scenario: Paused Claude Connection

This scenario documents retained code, not an enabled product path:

1. A short-lived browser binding would connect the current SkillPilot learner to an
   OAuth connection subject after explicit consent.
2. A generic launch would create a short-lived pending launch for that subject.
3. An authenticated MCP request would resolve the subject to the learner inside the
   backend without putting the permanent ID into the model context.
4. Disconnecting would revoke the connection and related authorization state.

The flow must not be enabled for learners until the blockers in the Claude runbook
are closed.

### Scenario: Onboarding a Class

1. Teacher creates learner IDs through the browser or a prepared roster workflow.
2. Backend generates random SkillPilot IDs and stores pseudonymous learner profiles.
3. Teacher stores the mapping from student names to SkillPilot IDs locally or in
   institution-controlled storage.
4. SkillPilot's central backend still has no real student names.

## 4. Backup and Recovery

Because the backend does not know real-world identities, the learner or institution
remains responsible for preserving access keys and mappings.

- **Learner backup:** export/import can carry learning state to another browser or
  account context.
- **Teacher backup:** teacher-held name-to-ID mappings must be protected outside the
  SkillPilot backend.
- **Encrypted local login:** helps an individual retain a SkillPilot ID on a device
  without storing it in plaintext.
- **Logout:** clears the active browser login/session but does not delete explicitly
  saved encrypted local logins.

## 5. Residual Risks and Rules

- A Visible Session token is a bearer credential. Anyone who obtains it before
  expiry may access or mutate the associated pseudonymous learning state through
  authenticated Actions.
- Do not share a live ChatGPT conversation, export, screenshot, browser history, or
  support artifact containing an unredacted `sps_...` token.
- The token travels in an Action path for GPT Builder compatibility. Reverse proxy,
  access, application, trace, and error logs must redact or omit relevant paths and
  request/response bodies.
- The session expires absolutely after at most 24 hours; use does not extend it.
  After expiry the learner returns to `skillpilot.com` and creates a new session.
- Learners can still type personal or sensitive information into ChatGPT. Product
  guidance must tell them not to do so.
- The AI provider processes conversation content according to its own operating,
  retention, and privacy terms.
- Legacy startcode/redeem routes and direct-ID AI routes may remain in source for
  rollback or diagnostics, but they must not be advertised as the current Custom
  GPT contract.
- A future cockpit session-management view should allow learners to inspect and
  revoke active ChatGPT sessions explicitly.

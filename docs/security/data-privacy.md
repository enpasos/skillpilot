# Data Privacy and Storage Concept

Status: updated for the browser-first ChatGPT startcode/session flow on 2026-05-19.

## 1. Core Philosophy: Privacy by Design

SkillPilot separates **identity**, **persistent learning state**, and **AI tutoring context**.

- The **SkillPilot backend** knows learning progress only under a random SkillPilot ID. It stores no names, email addresses, or passwords for learners.
- The **browser** is the user's login surface. It may hold the active SkillPilot ID locally and can optionally store it encrypted with a user-chosen password.
- The **AI layer** receives only a short-lived start code and then a temporary chat session token. It does not receive the permanent SkillPilot ID in the normal GPT flow.

This is a material privacy improvement over the old direct-ID AI flow: tutor conversations and tool results can no longer be associated by the LLM with the stable SkillPilot ID. The mapping from temporary chat session token to SkillPilot ID happens only in the SkillPilot backend; the active SkillPilot ID exists only in the browser and backend.

## 2. Data Partitioning

### A. Local Client (Browser / Local Storage)

**Status:** trusted by the user, private, local.

The browser may hold:

- **Active login:** the current SkillPilot ID for the browser session.
- **Encrypted saved logins:** optional named local profiles. The SkillPilot ID is encrypted with a password via browser cryptography; the password is not stored.
- **Session marker:** a browser-local UI session marker used to distinguish active browser sessions.
- **Curriculum selection:** selected landscape/curriculum for the active SkillPilot ID.
- **Local SRS state:** flashcard scheduling state before or between sync/export operations.

For teacher-led usage, a teacher's browser or protected local file may also hold:

- **Class rosters** such as "Physics 12 LK".
- **Identity mapping:** the link between a real name and a SkillPilot ID.

This identity mapping is intentionally not stored centrally by SkillPilot.

### B. SkillPilot Backend / Database

**Status:** pseudonymous, centralized.

The backend stores educational state, keyed by the SkillPilot ID.

- **Entity: `Learner`**
  - `skillpilotId` as the permanent pseudonymous learner key.
  - No names, no emails, no learner passwords.
- **Entity: `Mastery`**
  - Mapping: `skillpilotId` + `goalId` -> `value` (0.0 to 1.0).
- **Entity: `PlannedGoal` / learner configuration**
  - Goal focus, active goal, scope, curriculum, and personalization for a specific SkillPilot ID.
- **Entity: `ChatStartCode`**
  - Hashed one-time start code, expiration, and internal association to a SkillPilot ID.
- **Entity: `ChatSession`**
  - Hashed chat session token, expiration/revocation metadata, and internal association to a SkillPilot ID.
- **Static data**
  - Learning landscapes, curricula, competence definitions, SRS decks, and review metadata.

Startcodes and chat session tokens should be stored only as hashes. Logs must not emit plaintext tokens.

### C. AI Layer (e.g. ChatGPT Custom GPT)

**Status:** temporary processor for the current tutoring session.

In the normal GPT flow, the AI layer sees:

- **Start code:** a short-lived, one-time code such as `SP-7KQ9-M2PA`.
- **Chat session token:** a temporary token returned after redeeming the start code.
- **Session learner state:** curriculum, frontier, active goal, mastery summaries, and action results needed for the current tutoring session.
- **Curriculum content:** definitions of learning goals and relevant task context.
- **Conversation content:** what the learner types, dictates into the normal text field, or uploads in ChatGPT.

The AI layer does not receive:

- The permanent SkillPilot ID in normal session routes.
- Browser-stored encrypted login profiles.
- Teacher-held name-to-ID mappings.
- Real names, email addresses, or class rosters from SkillPilot.
- Links containing `skillpilotId`.

AI session responses intentionally return `skillpilotId: null` where compatibility DTOs still contain such a field.

## 3. Data Flow Scenarios

### Scenario: Individual Learner Login

1. Learner opens `https://skillpilot.com`.
2. Browser offers three login paths:
   - create a new SkillPilot ID,
   - load an encrypted saved login,
   - enter an existing SkillPilot ID directly.
3. Browser stores the active SkillPilot ID locally for the current use and optionally encrypted as a named local login.
4. Learner selects a curriculum. The backend stores that selection for the SkillPilot ID.
5. Learner opens either the browser cockpit or SkillPilot GPT.

### Scenario: ChatGPT Tutoring Session

1. Browser already has the active SkillPilot ID.
2. Browser calls `POST /api/ui/learners/{skillpilotId}/chat-start`.
3. Backend creates a one-time start code, stores only its hash, and binds it internally to the SkillPilot ID.
4. Browser opens SkillPilot GPT with a prompt containing only the start code.
5. GPT calls `POST /api/ai/{lang}/chat-start/redeem`.
6. Backend validates the start code, creates a temporary chat session token, and returns initial learner state with no real SkillPilot ID.
7. GPT uses only session routes such as `GET /api/ai/{lang}/sessions/{chatSessionToken}/state` and `POST /api/ai/{lang}/sessions/{chatSessionToken}/mastery`.
8. Backend resolves `chatSessionToken -> skillpilotId` internally and applies existing learner-state logic.

Privacy consequence: the LLM can work with the current tutoring state but cannot attach the private tutor data to the learner's permanent SkillPilot ID.

### Scenario: Progress Review in the Browser Cockpit

1. Browser holds or loads the SkillPilot ID.
2. Browser calls UI routes such as `GET /api/ui/learners/{skillpilotId}/state`.
3. Backend returns the learner state for the browser cockpit.
4. Learner can inspect progress, active goals, curriculum state, and synced SRS/client state.

This is a browser/backend interaction, not an AI interaction. The SkillPilot ID may appear in the browser because it is the user's durable access key.

### Scenario: Onboarding a Class

1. Teacher creates learner IDs through the browser or imports a prepared roster workflow.
2. Backend generates random SkillPilot IDs and stores empty or initialized pseudonymous learner profiles.
3. Teacher stores the mapping from student names to SkillPilot IDs locally or in institution-controlled storage.
4. SkillPilot's central backend still has no real student names.

## 4. Backup and Recovery

Because the backend does not know real-world identities, the user or institution remains responsible for preserving access keys and mappings.

- **Learner backup:** export/import can carry learning state to another browser or account context.
- **Teacher backup:** teacher-held name-to-ID mappings must be protected outside the SkillPilot backend.
- **Encrypted local login:** helps individual learners keep a SkillPilot ID on a device without storing it in plaintext.
- **Logout:** clears the active browser login/session, but does not delete explicitly saved encrypted local logins.

## 5. Residual Risks and Rules

- Learners can still type personal information into ChatGPT. SkillPilot should continue to give clear usage guidance: do not enter sensitive private data into tutor chats.
- The AI provider processes the actual conversation according to its own operating and privacy terms.
- Session tokens are temporary but still bearer tokens. They must be treated as secrets, stored hashed server-side, and avoided in logs.
- Legacy AI routes with `skillpilotId` in the path may exist for compatibility/debugging, but they must not be advertised in the Custom GPT schema or normal user documentation.
- Future hardening should add a visible session-management view in the cockpit so learners can revoke active ChatGPT sessions.

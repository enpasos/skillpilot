# Existing-Learner Teacher Supervision

Status: active first-party WebGUI workflow; package-consumer builds remain disabled

This workflow lets a teacher create one local supervision card for an existing
SkillPilot learner and use the learner's selected subject contexts without
copying the learner or the learner state. A typical card can therefore expose
Mathematics and Physics as two switchable views of the same membership.

## Product invariants

- The existing learner remains the only owner of Personal Curriculum Level 2.
- Personal Curriculum, mastery, focus, and planned goals are never copied into
  a second learner.
- Every currently selected Level-2 subject context is projected into the same
  local class card. Jurisdiction, stage, duration model, and subject course
  profile remain tied to the existing learner. A later learner-side change is
  detected by a canonical personalization fingerprint and is not silently
  applied in the teacher view.
- The teacher-facing grant is read-only. It carries only
  `PERSONAL_CURRICULUM_READ` and `MASTERY_READ`.
- The teacher API never returns the permanent SkillPilot ID or the raw
  `personalCurriculum` document.
- The teacher UI addresses the learner through an opaque `memberId` and loads
  mastery only through the course membership endpoint.
- Names used in the teacher's class card stay in that browser. The server-side
  invitation label is separate and must not contain a learner name.
- A linked class file is not a capability. Linked classes cannot be imported,
  and their full class export is unavailable. The person-free course-plan
  export remains independent.
- Teacher course deletion revokes the server-side grant before removing the
  local card. The learner can list and revoke grants separately.
- A changed personalization fingerprint is shown for review. Subject contexts
  are replaced only after an explicit teacher action.
- Local course plans are keyed by supervision card and subject, so a
  Mathematics schedule cannot silently appear in the Physics view.

## Pairing flow

1. In **+ New class**, the teacher chooses **Link an existing learner**, enters
   the known SkillPilot ID, and supplies only local labels plus the invitation
   context. The learner alias never leaves the teacher browser.
2. The teacher browser creates a capability-owned workspace. The clear
   workspace token is returned once and stored separately from class data.
3. The browser creates a server course and a seven-day, one-time invitation
   bound to the specified existing SkillPilot ID.
4. The invitation URL carries its secret in the URL fragment
   (`/betreuung#invite=...`). The fragment is not sent in the initial HTTP
   request or as a referrer. Preview and acceptance send the token in a JSON
   request body, never in a path or query string.
5. The accepting person sees the unverified teacher-provided labels and the
   exact read capabilities, enters the bound SkillPilot ID, and explicitly
   confirms the request.
6. The server atomically consumes the invitation token and activates the
   membership. The teacher then receives a minimized projection containing an
   opaque member reference, common scope, selected subjects, and a canonical
   personalization fingerprint.
7. The teacher browser creates one local supervision card. Subject changes
   update only the active local view; they do not create another learner or
   alter Level 2.

The browser keeps a versioned recovery pointer while confirmation is pending.
It contains neither the permanent SkillPilot ID nor the workspace capability.
After a reload, the Trainer opens the pending setup instead of creating a
second workspace, course, or invitation. Ambiguous or terminal failures become
a token-free cleanup state; only confirmed course closure removes that state.
The pending record is cleared after the linked class was durably saved.

Only SHA-256 token digests are persisted. Workspace and invitation tokens use
256 bits of random entropy. Responses use `Cache-Control: no-store`, and the
complete teacher-supervision namespace bypasses generic request/response body
logging. The HTTP boundary additionally requires an allowed same-site `Origin`
for mutating requests, JSON for `POST`, limits request bodies to 8 KiB, and
uses bounded in-memory per-client windows: 10 workspace creations and 120
other supervision requests per minute. `X-Real-IP` is trusted only across the
local reverse-proxy hop; `X-Forwarded-For` is ignored.

## Server model

The additive Liquibase model consists of:

- `teacher_workspace`: opaque workspace owner and hashed access token;
- `teacher_course`: workspace-owned course with invitation-facing labels;
- `teacher_membership`: pending invitation and durable membership lifecycle,
  learner foreign key, hashed one-time invitation token, read capabilities,
  and timestamps.

Learner foreign keys use database deletion cascades so manual deletion and the
365-day learner-retention process cannot be blocked by supervision records.
Closing a course revokes every pending or active membership.

Invitations expire after seven days. Active memberships remain until the
learner revokes the grant, the teacher closes the course, or the learner state
is deleted. Expired or revoked memberships and then-empty courses/workspaces
are removed after a terminal retention period of at most 30 days in the next
daily cleanup run. Configuration can shorten, but cannot extend, this terminal
retention ceiling.

## API boundary

The versioned namespace is `/api/ui/teacher-supervision/v1`.

Teacher operations require the workspace token in `Authorization: Bearer ...`:

- create a course and invitation;
- read the course and minimized member projection;
- read subject-filtered mastery;
- close the course.

Invitation preview and acceptance require the one-time invitation token in a
JSON body. The selected mastery landscape and the permanent ID used for
learner-side membership listing or revocation also travel only in JSON bodies,
never in URL paths or query strings. Learner-side self-service otherwise
follows SkillPilot's current permanent-ID bearer model. All errors are generic
and fail closed.

## Current identity limitation

The current first-party WebGUI treats the permanent SkillPilot ID itself as the
learner access credential. In the special situation covered here, the teacher
already knows that ID. The new confirmation step is therefore an explicit and
auditable product workflow, but it is not cryptographic proof that a distinct
learner, rather than another holder of the ID, clicked the confirmation.

For the same reason, the read-only capabilities restrict the new teacher
membership API; they do not revoke powers that a holder of the permanent ID
already has through legacy learner-ID endpoints. UI copy must say that *this
grant* provides only read access, not promise that a known permanent ID has
ceased to be a credential.

A later strong-identity phase needs a learner credential independent of the
publicly shared identifier (or an authenticated learner account/device
credential) and a teacher identity. That phase is deliberately not smuggled
into this additive MVP.

## Activation and rollback

The first-party development and production WebGUI builds set
`VITE_TEACHER_SUPERVISION_ENABLED=true`; the production backend defaults
`skillpilot.teacher-supervision.enabled` to true. Either side can be disabled
independently with its corresponding environment variable for a bounded
rollback. Package-consumer builds explicitly keep the WebGUI option disabled.

`/betreuung` is an explicit SPA deep link, while paths below the API namespace
remain backend routes. The focused unit, browser, backend integration, HTTP
boundary, retention, and SPA regressions run in CI through
`test:teacher-supervision` and the backend test suite.

This workflow is independent of the frozen OpenAI Coach v1 contract. It does
not change learner sessions, MCP/OAuth tools, provider launch flows, or the
submitted MCP Apps UI.

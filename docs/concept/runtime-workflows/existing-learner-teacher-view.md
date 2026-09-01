# Existing-Learner Teacher View by SkillPilot ID

Status: active first-party WebGUI workflow; package-consumer builds remain
disabled

This workflow lets a teacher add one already existing learner to a local class
by entering that learner's permanent SkillPilot ID. The class card is a local
browser record. It does not copy the learner state and it does not create a
teacher account, server-side class, authorization record, or membership.

The design intentionally exposes the current identity limitation: a permanent
SkillPilot ID is not a public identifier with separately scoped permissions. It
is the bearer secret and full-access key for the learner state. Apart from the
explicit, confirmed **Make available in cockpit** plan-copy action, the Trainer
UI uses it only through read operations; the credential itself is not
read-only.

## Product invariants

- The existing learner remains the only owner of Personal Curriculum Level 2,
  focus, planned goals, mastery, and all other learner state.
- The teacher browser stores the local class name, learner name or alias,
  permanent SkillPilot ID, and a sanitized snapshot of the learner's Level-2
  personalization.
- Mathematics, Physics, and other selected subjects are separate switchable
  views of the same local learner record. Each view uses its own landscape and
  cached scope fields.
- Except for the explicit plan-copy action, the Trainer UI is functionally
  read-only for the existing learner's data. It
  does not expose controls that change personalization, focus, learner-side
  planned goals, mastery, or other learner state. The teacher may still edit a
  separate browser-local course plan; that remains independent teacher working
  data. Only after confirmation may its label, dated blocks, and validated
  atomic goal IDs be copied into a learner-owned personal subject schedule.
  The copy contains no local class reference, alias, coverage, attestation,
  mastery, learner-derived planning baseline, or teacher-plan history and is
  never synchronized automatically.
- When the teacher first schedules a learning scope, a dedicated no-store read
  captures every learner-facing atomic target ID in the complete Level-2
  personalization for the selected subject and its open subset. The current
  Cockpit focus does not restrict this planning universe. That immutable local
  baseline prevents already mastered goals from becoming new course-plan work
  and prevents later learning from rewriting the original plan. It contains
  goal IDs, aggregate counts, and a timestamp, but no SkillPilot ID or numeric
  per-goal mastery values. Plan exports omit the baseline entirely;
  teacher-entered free text remains unchanged and may itself contain personal
  data.
- Read-only is a UI contract, not a server capability. Possession of the
  SkillPilot ID grants the ordinary learner access associated with that ID.
- No new teacher/class/learner relationship, capability, authorization record,
  or teacher-owned retention record is stored in the SkillPilot backend. A
  copied personal subject schedule follows the existing learner lifecycle and
  is owned solely through the permanent SkillPilot ID.
- Removing a local class deletes only that browser record. The permanent
  SkillPilot ID remains valid, and copies elsewhere stay usable.
- A password-encrypted class export may contain the class name, learner alias,
  permanent SkillPilot ID, and cached personalization. It must therefore be
  handled as a bearer-secret container.
- Former server-linked supervision cards are not migrated or retained. They do
  not contain the learner's permanent SkillPilot ID and cannot represent the
  direct-ID model truthfully.

## Local setup and refresh flow

1. In **+ New class**, the teacher chooses **Add an existing SkillPilot ID
   locally** and enters the local class name, a local learner name or alias,
   and the existing permanent SkillPilot ID.
2. The browser requests the ordinary learner profile at
   `GET /api/ui/learners/{skillpilotId}` with `cache: no-store`.
3. The response must contain the exact requested ID and a readable
   `personalCurriculum` document. The browser retains only the supported
   Level-2 fields `selected`, `filterId`, `durationModel`, and `stage` for
   known landscapes.
4. At least one selected subject must be available. The browser creates one
   local `ClassSession` containing the ID, local labels, selected subject,
   root landscape where applicable, and the sanitized personalization
   snapshot.
5. When the class is opened, the Trainer refreshes the ordinary learner profile
   and reads current mastery through the ordinary learner endpoints for that
   ID. The rendered tree is limited by the active local subject view and its
   Level-2 projection. The first course-plan learning section additionally
   reads `GET /api/ui/learners/{skillpilotId}/planning-scope` with
   `cache: no-store`. This endpoint derives the complete personalized Level-2
   target set for the requested subject landscape, independently of the
   learner's effective Level-3 focus, and uses the same atomic node rule and
   mastery threshold as the Cockpit. It performs no write and never changes the
   learner's planned goals.
6. Editing and saving the class also reloads the current learner profile. The
   cached personalization is replaced only after the refreshed local class was
   saved successfully. A failed refresh leaves the prior local record
   unchanged.
7. **Make available in cockpit** first expands every learning block against the
   complete personalized subject graph, then shows a replacement confirmation.
   The server revalidates the subject-local atom IDs and the block focus,
   admits newly added IDs only while they remain open, allows IDs already in the
   personal schedule to remain in a confirmed replacement for plan continuity,
   chronologically removes overlap, and uses an expected revision so a stale
   local plan cannot overwrite a newer personal copy unnoticed. This write does
   not change focus, active goal, or mastery.

The copied schedule remains learner-controlled. Plan mode is off by default,
its first goal is started deliberately, and enabling it suppresses the generic
Autopilot. After a confirmed completion, a handoff is considered only if the
completed goal belongs to at least one currently valid stored plan. Exactly one
eligible candidate from a plan containing that goal then takes precedence; only
if there is no such candidate may exactly one eligible candidate across all
valid plans be used. Ties, only stale or invalid plans, no stored plan, and no
eligible due goal fail closed: the existing focus remains and no new active goal
is selected; the completed active goal may still be cleared normally.

There is no server push or server-managed personalization fingerprint. If the
learner changes Level 2 later, reopening the local class or saving it in the
editor refreshes the subject selection and scope. The snapshot is presentation
state only and never becomes a second source of learner truth.

## Read boundary and subject views

The direct-ID workflow uses the same learner routes as the learner-facing
WebGUI. In particular, the mastery response is the learner's ordinary global
mastery map; it is not a server-side teacher projection minimized to one
subject. The Trainer renders only goals in the active projected landscape, but
that frontend projection does not reduce the authority of the ID or the data
available to its holder.

Subject switching is local. It changes the active landscape, applicable
filter, and rendered tree, clears subject-specific navigation state, and does
not create or mutate learner data. Mathematics state must not be presented in
the Physics tree or vice versa even though both reads use the same permanent
ID.

For existing-learner classes, every Trainer path that mutates learner data must
remain disabled or guarded, including individual and bulk learner-side
planned-goal changes. The sole narrow exception is the confirmed copy into the
personal subject-schedule endpoint. Editing the separate local teacher course
plan alone performs no learner write. A future feature that needs enforceable
read-only access requires a separate scoped credential and cannot reuse this
direct-ID model while claiming capability isolation.

## Identity and authorization limitation

The workflow assumes that the teacher has obtained the SkillPilot ID with
appropriate authorization outside SkillPilot. SkillPilot cannot determine
whether the person entering the ID is the intended teacher or whether another
holder copied it.

Anyone who obtains the permanent ID can use the normal learner interfaces with
the powers currently attached to that ID, including operations outside the
read-only Trainer UI. Deleting the class card, clearing browser storage, or
deleting an export does not invalidate copies held elsewhere. The only way to
create a separately controllable access boundary is to change the underlying
identity model; this workflow has no separate server-side access grant.

The teacher device and its browser profile are therefore inside the trust
boundary. Institutional device access, browser-profile separation, local
deletion, and authorization rules remain operational responsibilities.

## Local storage and encrypted class files

The active class record is stored in the teacher browser. Browser local
storage is not encrypted by the class-file password and is exposed to anyone
who can use the same unlocked browser profile.

New downloaded class files are encrypted in the browser with the existing
versioned trainer-class envelope: PBKDF2-SHA-256 derives an AES-256-GCM key
from a teacher-chosen passphrase. SkillPilot neither receives nor recovers the
passphrase. The encrypted payload can include local class labels, learner
aliases, permanent SkillPilot IDs, and personalization snapshots.

This encryption protects the downloaded file at rest only. It does not secure
an unlocked browser, recover a forgotten passphrase, invalidate an ID after a
file was copied, or make a decrypted ID read-only. Older plaintext local class
files may still be accepted only as a visibly marked migration input and
should be re-exported in the encrypted format; former server-linked class files
are rejected.

## Retirement of the former server-linked cards

On the first Trainer load after this change, the browser removes every old
class entry marked by `linked-supervision`, `linkedSupervision`, or
`teacher-membership`. It also removes the old local workspace and pending-flow
credentials, the active-class pointer when it names a removed card, and local
course-plan records keyed by that card ID. No old card is converted into a new
direct-ID class.

The backend removes the former workspace, course, and membership tables with a
forward-only database migration. A teacher who still wants the relationship
must create a new local class with the learner's known permanent SkillPilot ID.

## Server and activation boundary

No teacher-specific backend namespace or persistence is needed. Requests use
the existing learner records and learner endpoints; the server receives the
SkillPilot ID exactly as it does for ordinary first-party learner access. The
personal subject schedule is ordinary learner-owned persistence with no
teacher, class, invitation, or membership foreign key.

The first-party WebGUI gates creation of these local classes with
`VITE_EXISTING_LEARNER_LINKING_ENABLED`. Package-consumer builds keep the
workflow disabled. The workflow does not change learner sessions, MCP/OAuth
tools, provider launch flows, or the submitted MCP Apps UI.

# SkillPilot Coach: OpenAI Submission Dossier

**As of:** 19 October 2026 · **New plugin:** `skillpilot-coach` ·
**Package candidate:** `1.1.3` · **Runtime Contract Major:** `1`

**Status:** locally prepared new plugin candidate, **DRAFT**, unsubmitted,
unapproved, and unpublished in the OpenAI directory. The permanent display name
is **SkillPilot Coach**; the exact MCP endpoint is
`https://mcp-openai.skillpilot.com/mcp`. Both identity and endpoint remain
stable across future package major versions. Package SemVer and the runtime
contract are independent. The
[cutover and deployment workflow](openai-stable-origin.md) documents the
rollout to be executed separately. Every learning start uses a fresh WebGUI
start message in a new chat.

The former `skillpilot-coach-v1` plugin carries separate historical records:
Git **1.1.2** was published for the desktop beta; portal **1.0.0** was
rejected. Its portal export states neither a specific rejection rationale nor
reviewer traces. Those publications, snapshots, and recordings remain
untouched. They prove neither provisioning of the new endpoint nor host
acceptance of the new plugin. See
[review history](openai-plugin-v1-review-freeze.md).

For ongoing behavioral verification before and after submission, see
[automated API dialog regression](../qa-ci/openai-dialog-regression.md). It
supplements manual ChatGPT acceptance and does not substitute for live host
evidence.

Neither this dossier nor the generated JSON files constitute a **portal
submission**. Credentials and legal attestations remain strictly inside the
authenticated portal workflow. Public OAuth configuration resides in
`.mcp.json`; private credentials never belong inside the ZIP archive. Country
availability is not configured here. No local command confirms an external
submission, publication, or acceptance.

## 1. Authoritative Sources

Located under `ai/openai plugin/skillpilot-coach/`:

| Source | Purpose |
| --- | --- |
| `.codex-plugin/plugin.json` | current version, listing, legal document URLs, and starter prompt |
| `.mcp.json` | actual public MCP URL |
| `submission/portal-metadata.json` | public support link, an optional explicitly version-pinned current demo, and remaining required manual steps |
| `submission/review-cases.json` | fixtures, verbatim user turns, complete model reference responses, tool rules, visible outcomes, and executable test mappings |
| `release-notes/<Version>.md` | current version description imported verbatim as publication release notes |

The freshly generated export under
`contracts/drafts/openai/skillpilot-coach/<Version>-SNAPSHOT/contract/contract.json`
supplies tools, schemas, annotations, metadata, and UI resources.
`scripts/openai_plugin_submission.mjs` deterministically generates:

- `submission/generated/portal-draft.json`: non-secret entries modeled on the
  observed portal export, covering five positive and three negative cases;
- `submission/generated/preparation.json`: source hashes, resource bindings,
  starter prompt, internal plan cases, and open acceptance/portal steps;
- `submission/generated/acceptance-guide.md`: complete acceptance guide with
  initial fixtures, ordered turns, and verification criteria across all 14
  cases;
- `submission/generated/trace-template.json`: empty template containing no
  observed events or sign-offs; left unmodified, it cannot pass acceptance;
- `submission/generated/submission-plugin.json`: manifest for the official
  Codex ZIP carrying `extensions.com.openai.review` and `.publication`;
- `submission/generated/submission-package.json`: ZIP hash, hashes of all eight
  archive members and their sources, plus explicitly open evidence items.

`package` additionally writes a readable, reproducible
`skillpilot-coach-<Version>-submission.zip` to `tmp/openai-submission/` or the
chosen `--out-dir`. The seven explicitly allowlisted installation files sit
directly at the ZIP root alongside the repository `LICENSE`. Only the embedded
manifest is augmented with review cases and release notes for upload; the
remaining seven files retain their exact source bytes. The package report
distinguishes the source manifest hash from the ZIP manifest hash. Unknown
files, scratch notes, live session values, and credentials are never accepted
as archive inputs. The existing TAR snapshot and Git installation packages
retain their dedicated roles and are never overwritten by this export.

The ZIP uses the documented `prompt` and `expected_behavior` fields, generated
from the exact same verified cases as `user_prompt` and `expected_output` in
the legacy comparison draft. Five positive and three negative cases are
included in full; the six internal cases remain in the acceptance guide. The
export sets no country availability and carries forward no historical review
video. Unless `portal-metadata.json` provides a `demoRecording` explicitly
pinned to the current version, `review.demo_recording_url` is explicitly set to
the empty string. On re-upload, that clears any previously saved historical
demo; according to OpenAI, omitting the field would retain the stale portal
value. The package report flags a missing current demo as open evidence. Any
historical internal version route or the known hash of the rejected `1.0.0`
recording is rejected even if metadata version labels are altered. Even a built
ZIP remains `PREPARED_NOT_SUBMITTED` with `ready: false` until the separate
external checks are completed.

Start the next live test run from the
[generated acceptance guide](https://github.com/enpasos/skillpilot/blob/main/ai/openai%20plugin/skillpilot-coach/submission/generated/acceptance-guide.md).
Record results exclusively in a separate local copy under `tmp/`. Once its
checks pass, the OpenAI CI job publishes the explicitly allowlisted preparation
files together with the ZIP archive and its verification report, never private
test recordings.

`portal-draft.json` remains a working and comparison reference. The ZIP archive
is the documented upload format. No undocumented portal APIs are invoked. Local
export and ZIP generation modify neither production nor the portal.

## 2. Verified Defects in the Rejected Export

The sanitized findings record resides in
`ai/openai plugin/skillpilot-coach-v1/submission/history/rejected-1.0.0-export-audit.json`.
Because the raw original export contains OAuth and review access credentials,
it is never committed.

- P3 repeated the exact `tools_triggered` tool list inside `expected_output`.
- P3 mentioned vertex form ("Scheitelpunktform") in response 2 without naming
  `S(d|e)`.
- P4 expected full credit without an explicit interpretation of the limit as
  the maximum covered area. The new complete submission adds that
  interpretation.
- P5 cut off mid-sentence/mid-word at exactly 300 characters.
- N1 through N3 had empty `expected_output` fields. Every new negative case
  specifies the safe response, prohibited action, and rationale.

These are **not proven causes of the rejection**. As a precaution, the project
caps new expected-behavior fields at 300 characters; this self-imposed safety
ceiling derived from the observed export is not claimed to be an official
portal limit. The generator never silently truncates text.

## 3. Product and Identity Boundary

Permanent SkillPilot ID, `CREATE`/`EXISTING`, provider notice, and Level 2
configuration remain inside the first-party WebGUI. OAuth authorizes the
connection; only the separate, freshly prepared `learningSessionId` selects
learner progress and communication language. Permanent IDs never enter either
chat or the portal. Every **Lernen starten** ("Start learning") launch creates
a fresh 24-hour session for a new chat. Invalid sessions are never replaced by
OAuth reconnection or guessed IDs; the existing renewal contract remains
fail-closed.

The successor includes the existing twelve tools plus
`resume_skillpilot_learning_plan` and `switch_skillpilot_learning_plan_subject`.
Plan status arrives as backend-rendered prose in `learningPlanToday.text`
inside the complete authoritative context. A separate
`get_skillpilot_daily_plan` tool is **not** part of the catalog.

The compact summary reports open goals per subject and mentions backlog or
non-evaluable plans only when applicable. Continuation and subject switching
exclusively use permitted server-provided options with version guards.
Switching among already selected plan subjects never permits changing state /
jurisdiction ("Bundesland"), school stage, or selected subjects inside chat.
After any mutation, its complete authoritative successor context governs; there
are no invented goals, duplicate writes, or autonomous focus narrowings.

## 4. Portal Workflow

1. Verify the candidate, roll out production separately, and verify the live
   public endpoint. A local export does not prove deployment.
2. Generate the ZIP archive and verify it against current sources using
   `audit-zip`. Under **Plugins → Upload new or existing plugin → Upload
   plugin**, choose **With MCP** and select the complete ZIP for the new
   `skillpilot-coach` plugin. Do not rename or overwrite the historical
   `skillpilot-coach-v1`. Subsequent updates attach to this permanent neutral
   identity. Never carry over an existing Developer Mode integration ID or
   `.app.json`.
3. Under **Metadata & Skills**, inspect the imported version, listing, and
   skills. Fix any required fields in the source package and re-upload the
   complete ZIP. Changes to skills or metadata require a fresh ZIP upload;
   rescanning MCP does not update those package components.
4. Under **MCPs**, connect the single server. Inspect the OAuth configuration
   imported from `.mcp.json`, complete the domain challenge and authentication,
   and wait for the tool scan. Diff tool names, schemas, annotations, security
   schemes, and resource bindings against the current export. A public CIMD
   client replaces neither OAuth nor the separate learning session and is never
   a fallback for failed confidential authentication.
5. Under **Review information → Review details**, inspect the imported five
   positive and three negative cases, the current demo, and the release notes.
   ZIP-managed test cases are read-only there: edit the source files and
   re-upload. Verify the starter prompt and remaining settings directly in the
   portal. Never carry over historical IDs, secrets, status flags,
   attestations, or demo URLs.
6. Store reviewer access exclusively in the portal and test it without MFA,
   SMS/email verification codes, or private network access. Stateful cases each
   use a fresh disposable learner profile created via the public `CREATE` flow.
7. Run every test case, sign off on the host UI and current demo, approve legal
   disclosures, and double-check all saved portal fields. If a fresh portal
   export is available, audit it strictly locally against the comparison draft.
8. Submit only upon explicit authorization. A subsequent approval is not yet
   publication; **Publish** remains a separate action.

The minimum requirement of five positive and three negative cases as well as
the current portal workflow are documented in the
[official OpenAI submission guide](https://developers.openai.com/plugins/deploy/submission).
That documentation does not substitute for verified SkillPilot host acceptance.

## 5. Review Cases and Supplemental Plan Cases

Complete verbatim transcripts reside exclusively in
`submission/review-cases.json`; the summary table below is not a second
duplicated test suite. Whenever Layer A content—such as card count, exam
prompt, or focus option—changes, the fixture is freshly revalidated rather than
forced onto stale numbers.

| Case | Key Verification |
| --- | --- |
| P1 | English sessionless start: strictly the brief first-party WebGUI notice, zero tool calls or instruction |
| P2 | Expressing interest alone does not end orientation; personal continuation, fresh context, authoritative goal; cleared image rendered without losing instructional text |
| P3 | Ordinary practice without claiming mastery; all eight recall answers including vertex coordinates, answer reveal, and complete ordered result batch submitted exactly once |
| P4 | Complete exam prompt without advance hints; evaluation only after complete submission, five criteria, 25/25 points on complete model solution, passing threshold 13/25; persist passing attempt before reporting feedback, follow-up content only upon explicit request to continue |
| P5 | Present focus options only at first; after learner agreement, apply fresh first option with full payload, mastery unchanged |
| N1 | Synthetic nonexistent session: `SESSION_REQUIRED`, localized restart notice, zero mutations or instruction |
| N2 | Adding a new subject or school stage redirected strictly to WebGUI; no covert Level 2 mutation |
| N3 | Refuse hint or formula request prior to exam submission; no protected evaluation leak or mastery write |
| D1 | Adopt cross-subject plan status verbatim from backend without invented counts; never misrepresent non-evaluable plans as an all-zero summary |
| D2 | Permitted plan continuation executing exactly one version-guarded write |
| D3 | Switch strictly to an already selected eligible plan subject without Level 2 or mastery mutation |
| D4 | Missing, blocked, or non-resumable plan: truthful status report, zero unauthorized writes |
| D5 | Pure status inquiry: fresh context and concise overview only, no image, navigation, or instruction |
| D6 | Pure break notice without new goal evidence or assumed orientation/recall wrap-up question: briefly acknowledge and stop, no automatic continuation or mutation |

## 6. Automation and Evidence Boundaries

```bash
node scripts/openai_plugin_release.mjs prepare
node scripts/openai_plugin_release.mjs verify
node --test scripts/openai_plugin_submission.test.mjs
node --test scripts/reproducible_plugin_zip.test.mjs
node scripts/openai_plugin_submission.mjs prepare
node scripts/openai_plugin_submission.mjs check
node scripts/openai_plugin_submission.mjs package --out-dir tmp/openai-submission
node scripts/openai_plugin_submission.mjs audit-zip --zip tmp/openai-submission/skillpilot-coach-1.1.3-submission.zip
node scripts/openai_plugin_submission.mjs audit-export --export /exact/local/path/to/fresh-export.json
node scripts/openai_plugin_submission.mjs validate-trace --trace /exact/local/path/to/sanitized-trace.json
```

`prepare` requires an up-to-date snapshot matching the manifest version.
`--contract PATH` selects an export paired with an adjacent snapshot
`plugin.json`; `--out-dir PATH` isolates temporary working artifacts. None of
these commands deploy services or contact the portal. Export comparison reports
only diverging field paths and error classes, never credentials or raw field
values. `audit-zip` compares the entire archive byte-for-byte against the
expected ZIP freshly built from current sources. Archive validation rejects
path traversal, name collisions, symlinks, non-allowlisted input files,
credentials, and non-empty MCP headers, among other checks. It does not
substitute for portal validation.

Four verification layers remain distinct:

1. **Sources/Export:** complete cases, character budgets, current metadata,
   exact source hashes, and diffing of the saved export.
2. **Backend/Components:** executable MCP, session, capability, and widget
   lifecycle tests; a test mapping entry alone is not a test execution.
3. **Model Replay:** actual model responses, tool selection, and call ordering
   backed by a trace; never replaceable by grepping policy text or tool names.
4. **Live ChatGPT Host:** visible text, widget rendering, interaction, and
   fallback behavior on every promised surface. Narrowing a desktop browser
   viewport is not native mobile acceptance.

`OpenAiSubmissionReviewReplayTest` executes the backend portions of P1–P5 and
N1–N3. It proves neither P1's single-sentence reply nor N3's model refusal. The
plan contract tests additionally cover partial plans as well as version and
idempotency guards.

`validate-trace` checks all 14 cases, version, suite hash, complete user turns,
tool calls, non-invocations, call ordering, call counts, successful outcomes,
expected errors, and exact texts. Content and visual criteria additionally
require attributed human sign-off referencing concrete trace events and
evidence SHA-256 digests. Any missing case or open criterion causes the command
to fail. The trace schema is documented in `submission/README.md`. Synthetic
traces remain synthetic. No local check authenticates a screen recording on its
own or executes a live LLM run.

## 7. UI, Demo, and Host Acceptance

Two active MCP Apps resources remain strictly separated: learning-goal
visualization and private flashcard practice. The export carries exact hash
bindings, widget domain, and CSP; no extra domains are allowlisted
speculatively. Private prompts and answers from ordinary flashcard practice
never enter the model projection.

For the historical `skillpilot-coach-v1`, Git **1.1.2** as well as installation
and learning launch in **Windows ChatGPT Desktop** have been confirmed by the
Product Owner. For the new `skillpilot-coach`, those verifications are still
pending. Submission acceptance and the recording plan for **ChatGPT in the web
browser** remain separate evidence items. A desktop beta launch does not
confirm complete host/UI acceptance. Uploading the ZIP archive is the
documented route to directory publication and thus to additional
OpenAI-supported surfaces. Actual availability and the interplay of skill,
start message, and widgets on Web, iOS, and Android must each be verified
individually; local export unlocks none of those surfaces. For full submission
acceptance, there is still **no passing real-host test**. A potentially blank
widget following context retrieval and a subsequent renderer call remains a
hypothesis to verify, not a proven rejection cause.

The old review video remains strictly historical `1.0.0` evidence: SHA-256
`20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb`,
11,104,503 bytes, H.264/AAC, 1920 × 1080, 329.110 seconds. Its
content-addressed URL and bytes remain immutable. It is never carried forward
automatically into the new draft. The current demo must also demonstrate plan
status, continuation, and subject switching on the promised surface, without
exposing OAuth or review credentials. Released demo URLs are public, not
private. The current
[recording preparation and release checklist](openai-plugin-v1-demo-video.md)
details the five scenes, single-use browser setup, and the boundary between
local tests and an actual ChatGPT recording.

## 8. Unchanged Privacy and Release Boundaries

The successor expands no privacy, retention, or platform commitments. Active
SkillPilot database learner progress and associated sessions/connections can be
deleted via the web interface. After 365 consecutive days without a qualifying
successful activity, they become eligible for automatic deletion and are purged
on the next cleanup run.

Qualifying activity consists exclusively of successful ID creation, active
profile loading/resumption via the web interface, server-completed
import/export of signed learner data, a successfully persisted learner-state
mutation, a successfully completed SkillPilot session or provider-connection
action, or a valid coach/MCP call producing a functionally successful outcome.
Background GET requests, SSE streams, OAuth token refreshes, mere local file
openings, and incomplete or functionally rejected actions do not count.

Local files and third-party provider chats lie outside this deletion scope.
Existing backups are not part of active learner state; neither manual deletion
nor the 365-day expiration purges individual records from backups immediately.
Legal sign-offs covering country availability, age/guardian rules, privacy
policy, terms of use, provider compliance, retention, and revocation—along with
all portal attestations—must be confirmed separately prior to submission. The
generator confirms none of them.

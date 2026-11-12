# SkillPilot Coach v1: Release, Rollback, and Retirement

**As of:** 19 October 2026

**Status:** 1.0.0 was rejected; all ChatGPT/OpenAI review development freezes
have been explicitly lifted. Current local package state: **1.1.3**, prepared
using the current ZIP workflow. **1.1.2** remains publicly documented via the
Git marketplace. The new candidate includes the corrected continuation after
goal completion, rules against solution-bearing answer suggestions, and the
locally reproduced fix for a failed UI handshake prior to delayed image
delivery. The current Windows Work/Voice report still does not show a complete
image sequence; a successful renderer call using the previously rolled-out
older widget has been verified. Installation and learning launch in Windows
ChatGPT Desktop have been confirmed by the Product Owner. The official OpenAI
submission remains **DRAFT**, unsubmitted, and unpublished in the OpenAI
directory. The GUI/server rollout is carried out by the Product Owner; local
changes alone do not deploy it. The
[review history](openai-plugin-v1-review-freeze.md) remains traceable.

**Work order since 12 September 2026:** first stabilize ongoing Claude beta
operations, then run focused acceptance testing on the proven candidate in the
real ChatGPT host, and submit afterward. The bounded subsequent authorizations
of 24 September for archive installation/native CIMD and of 5 October for the
existing Git/Desktop beta including ordinary GUI launch supplement this
sequence. On **19 October**, the Product Owner commissioned the transition to
the current deployment workflow and an evaluation of mobile devices and Web.
The target is the remote MCP plugin with a bundled skill in the public
directory. The Git beta remains the existing desktop route. The release steps
below apply within this
[binding developer directive](claude-beta-chatgpt-release-strategy.md);
security checks and submission evidence gates remain unchanged.

This runbook puts the
[versioning and lifecycle plan](../concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md)
into operational practice. It applies to `skillpilot-coach-v1`.

## 1. Fixed Identity and V1 Contract

| Component | Binding Value |
| --- | --- |
| Plugin identity | `skillpilot-coach-v1` |
| Display name | `SkillPilot Coach v1` |
| Current package state | `1.1.3` prepared locally; Git/Desktop beta `1.1.2` published; OpenAI portal `DRAFT` |
| Contract Major | `1` |
| Lifecycle policy | `policyRevision=5` |
| Public MCP endpoint and OAuth Resource/Audience | `https://mcp-coach-v1.skillpilot.com/mcp` |
| Protected Resource Metadata | `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp` |
| Domain challenge | `https://mcp-coach-v1.skillpilot.com/.well-known/openai-apps-challenge` |
| Active MCP Apps UIs | exactly two: learning-goal image and flashcard practice |
| Support URL | `https://skillpilot.com/imprint` |
| Historical review video | `https://skillpilot.com/api/public/openai/review/skillpilot-coach-v1/1.0.0/sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4` (not acceptance of the current candidate) |
| Publication status | Git beta `1.1.2` published; current draft `1.1.3-SNAPSHOT` unpublished; previously published Git packages and snapshots remain preserved |
| Source package | `ai/openai plugin/skillpilot-coach-v1/` |

Permanent SkillPilot ID, CREATE/EXISTING, provider notice, and curriculum,
stage, subjects, profile, and personalization are configured exclusively in the
first-party WebGUI. Both the ordinary **Lernen starten** / **Start learning**
entry point and the Cockpit entry lead to provider selection. For **ChatGPT
Desktop (Beta)**, **Lernen mit ChatGPT vorbereiten** ("Prepare learning with
ChatGPT") generates a fresh opaque `learningSessionId`; the prepared message is
copied into a new desktop chat. `?coach=chatgpt-desktop` is an optional
preselection; `?chatgptTest=1` remains a compatible preselection without a
separate launch box. OAuth authorizes the fixed app, not a specific learner.

Without a current start message, the coach does not invoke any SkillPilot tool.
It outputs only a brief notice in the conversation language containing the
fixed link `https://skillpilot.com/` and stops. At the start of each learner
turn, `get_skillpilot_context` must succeed in the current assistant turn.
After a successful mutation, its complete successor state is authoritative for
the remainder of that same assistant turn and is not reloaded. On
`SESSION_REQUIRED`, `SESSION_RENEWAL_REQUIRED`, and
`SESSION_VERSION_UNAVAILABLE`, the coach outputs `instruction` verbatim. If
`instruction` is absent, it uses the exact entry from `instructions` for the
last authoritative `communicationLocale`, or otherwise for the current
conversation language. The exact `startUrl` is appended only if it is not
already present in the instruction. No subject-matter response, no retry of the
old session, and no OAuth reconnect follow; continuation takes place via the
WebGUI and the newly prepared message in a new chat.

The draft binds exactly two active content-addressed MCP Apps resources:

- `render_skillpilot_goal_visualization` binds exclusively the active
  image-only learning-goal resource;
- `start_skillpilot_memory_practice` binds exclusively the active flashcard
  resource; card grading remains app-only and unbound.

The current 1.1.3 candidate exposes 14 tools. Complete context responses
include the ready-made learning-plan status as `learningPlanToday` for the
persistently selected daily or weekly basis; each subject is evaluated
independently. `resume_skillpilot_learning_plan` and
`switch_skillpilot_learning_plan_subject` add plan-guided continuation and
explicit subject switching, respectively. The
[binding learning-plan status](../concept/didactic/unified-learning-plan-status.md)
defines the shared set accounting and wording. The coach adopts
`learningPlanToday.text` verbatim and uses the separate
`activeGoalAnnouncement` once when entering instruction. Once the period quota
is met, automatic goal selection stops; eligible active goals are preserved and
further learning remains possible on explicit request. Neither the export nor
actual tool results sent over the wire contain an overall traffic-light
indicator, aggregate totals, or legacy plan counter fields such as
`extraCompletedToday`; this also applies to complete follow-up responses after
state mutations.
The `get_skillpilot_daily_plan` call, which had previously only been drafted
locally, is not part of the current surface. For the new submission, this exact
export, the current test cases, and actual runtime behavior must match.

All image hash URIs previously advertised to real test clients remain passively
readable with their exact bytes. When a fresh `goalVisualization` and renderer
clearance are present, the renderer runs once as the immediately next tool call
with the unchanged `goalId`; the top-level `stateVersion` is copied into its
`expectedStateVersion` input. A stale or already attempted clearance is never
reused. The text path remains complete even if the host does not render the
optional UI.

Session-bound operations and write replays require at least `PT1H` of remaining
lifetime; exactly one hour is valid. An already committed identical write may
replay its stored result only when the pinned workflow/curriculum versions
remain available and the canonical learner revision is unchanged, without
re-executing any mutation.

For controlled live testing, only the first-party launch may accept the
optional `diagnosticSessionTtlSeconds` field. This field is permitted
exclusively when the diagnostic gate is active, as an integer in `3601..86400`,
and at most up to the normal `PT24H` lifetime. It applies strictly to the
session created by that single request. The very next launch without the field
automatically reverts to `PT24H`; the global TTL is never modified for testing.

Machine-readable sources of truth are:

- `.codex-plugin/plugin.json` for package SemVer and listing;
- `release/line.json` for Contract Major, endpoint, and state versions;
- `release/lifecycle.json` for support, publication, and launch status as well
  as the monotonic `policyRevision`;
- `contracts/drafts/openai/skillpilot-coach-v1/<version>-SNAPSHOT/` for the
  updatable current draft; the rejected `1.0.0-SNAPSHOT` remains separately
  immutable as historical evidence;
- `contracts/published/openai/skillpilot-coach-v1/<version>/` and
  `contracts/openai/skillpilot-coach-v1/release-index.json` exclusively for
  versions actually published in the OpenAI portal.

Following the rejection, the Product Owner explicitly terminated the review
freeze. `1.1.3` has its own coherent draft; `1.0.0` is neither relabeled nor
overwritten. Any future real publication permanently seals that exact published
version. Current functional, security, and compatibility tests do not replace
real client acceptance.

## 1.1 Target Surfaces and the Current ZIP Route

The [current submission guide](https://developers.openai.com/plugins/deploy/submission)
supports our Codex package format with `.codex-plugin/plugin.json`, `.mcp.json`,
and a bundled skill. Migrating to a new Agent Plugins format is not required
for this. Review cases and release notes are imported inside the ZIP manifest
under `extensions.com.openai.review` and `publication`, respectively.

| Route | Availability and Current Evidence |
| --- | --- |
| Existing Git marketplace | Desktop; Windows installation and learning launch confirmed by the Owner, complete Voice image sequence still pending |
| Custom remote MCP plugin in own account | Documented path for targeted Web connection tests; verify account eligibility, exact hosted OAuth profile, and actual loaded skill bytes |
| Published remote MCP directory plugin | Target for Desktop, Web, and mobile ChatGPT app; offer only after review, publication, and dedicated acceptance |
| Local narrow browser viewports | Technical pre-check of the UI, not acceptance for iOS, Android, or ChatGPT Web |

OpenAI marks Git-imported plugins with a direct MCP declaration as **Desktop
only**, even when configured with an HTTPS URL. Importing the same Git package
into a workspace does not extend this route to Web or mobile devices.
Consequently, the existing GUI choice remains **ChatGPT Desktop (Beta)** until
broader availability is verified. See
[plugin management](https://learn.chatgpt.com/docs/enterprise/plugin-management#desktop-only-plugins)
and [public plugin surfaces](https://learn.chatgpt.com/docs/plugins).

From the repository root, the current deterministic preparation commands are:

```bash
node scripts/openai_plugin_release.mjs prepare
node scripts/openai_plugin_submission.mjs prepare
node scripts/openai_plugin_submission.mjs check
node scripts/openai_plugin_submission.mjs package --out-dir tmp/openai-submission-package
node scripts/openai_plugin_submission.mjs audit-zip --zip tmp/openai-submission-package/skillpilot-coach-v1-1.1.3-submission.zip
```

The ZIP archive and `submission-package.json` are the concrete handoff
artifacts. The report binds all eight archive members and their sources via
SHA-256 and lists open steps. When a current demo is missing, the imported demo
link is explicitly cleared to the empty string so that the rejected candidate's
historical video cannot persist unnoticed. CI builds and verifies the same ZIP
and uploads it as an artifact; this does not submit anything to the public
directory.

### Verifying Hosted OAuth for Web and Mobile

The package declares OAuth with `client.mode=cimd`. This registration
preference does not select a learner, create a new client, or relax any
server-side binding. The native client under `/oauth/codex/...` with a loopback
callback remains its own public PKCE client. The hosted client remains bound to
its exact configured CIMD identity, JWKS, and callback.

The [current auth guide](https://developers.openai.com/plugins/build/auth)
documents OpenAI's managed signing keys and public JWKS for hosted CIMD. The
absence of a manual key-entry form for a pre-registered JWT client is therefore
not a fundamental blocker for automatic CIMD.

For actual connection verification:

1. In the designated account, follow the documented
   [remote MCP test path](https://developers.openai.com/plugins/deploy/connect-chatgpt#add-the-mcp-server),
   or connect the remote server from the uploaded ZIP. The endpoint remains
   strictly `https://mcp-coach-v1.skillpilot.com/mcp`.
2. Compare the actually displayed hosted CIMD URL and redirect URI against the
   protected server configuration. Current connections may use
   callback-specific URLs. Neither guess a new ID nor reuse the native desktop
   pin for it. Public discovery does not prove which specific hosted client is
   configured in production.
3. Verify OAuth connection and token renewal, the actually loaded coach skill,
   tool calls, confirmed persistence, and continuation across two images
   against the live deployed candidate. A connected remote server without the
   right skill loaded does not yet demonstrate a complete coach.
4. Record Web, iOS, and Android separately. Text and Voice are separate checks;
   local browser viewport sizes do not substitute for them. Never include real
   learner accounts or session capabilities in public evidence.

The technical prerequisite remains a single public MCP endpoint with separate,
strictly pinned OAuth profiles and an independent learning session. Portal
credentials, secrets, production settings, and actual publication remain
explicit operational steps after local verification.

## 2. Preparing a Release

The local preparation steps below are authorized for the new successor. The
automated guard continues to protect the rejected history and actually
published versions rather than historical live-file hashes.

1. Review release notes, lifecycle, listing, skill, policy, server contract,
   current test cases, and core documentation together for the current `1.1.3`
   candidate. Already published Git package bytes remain immutable; any further
   package fixes require a new version.
   The current release uses exclusively the MCP server; the legacy `.app.json`
   reference does not belong in the new installation package. The installation
   archive retains its own allowlist. The new submission ZIP contains those
   same installation files plus `LICENSE`; only its manifest receives the
   public review fields and release notes derived from verified sources.
   Private review credentials never go into the archive.
2. The V1 URLs remain fixed contract constants in the backend artifact. Secrets
   and OAuth client values stay exclusively in protected configuration.
3. Run generic and version-specific gates:

   ```bash
   ./scripts/verify_openai_v1_mtls_edge.sh --static
   npm --prefix "ai/openai app" test
   node scripts/check_openai_plugin_review_freeze.mjs
   node scripts/check_openai_plugin_versioning.mjs
   node scripts/check_skillpilot_coach_plugin.mjs
   node scripts/openai_plugin_release.mjs candidate
   ```

4. Create or update the internal draft:

   ```bash
   node scripts/openai_plugin_release.mjs prepare
   ```

   `prepare` replaces only the current unpublished portal draft snapshot. It
   modifies neither SemVer nor the published index, and aborts on rejected
   `1.0.0`, versions actually published in the OpenAI portal, missing versioned
   installation files, or symlinks. Historical snapshot and video bytes remain
   exact.
5. Verify sources and draft reproducibly:

   ```bash
   node scripts/openai_plugin_release.mjs verify
   npm --prefix app run check:docs-links
   npm --prefix app run check:docs-indexes
   git diff --check
   ```

6. Roll out the backend and V1 edge in order only after separate rollout
   authorization: the current development authorization does not cover this.
   First prepare `observe` in the protected backend `EnvironmentFile`; stage
   and verify the CA bundle, root-owned mode file, and loopback verifier using
   `install_openai_v1_mtls_edge.sh --mode observe`; then install the Nginx
   template. The installer never edits, tests, or reloads Nginx. Before
   activation, run `verify_openai_v1_mtls_edge.sh --preflight --expected-mode observe`
   as root followed by an explicit `nginx -t`; then restart the backend first
   and reload Nginx only afterward. Finally, verify the runtime smoke check and
   a real ChatGPT tool call. Switching to `enforce` later follows the exact
   same `EnvironmentFile` → installer → preflight → `nginx -t` → backend
   restart → Nginx reload → runtime/ChatGPT evidence sequence.
7. Update app metadata and rescan in a fresh chat only after those
   verifications succeed.

## 3. Release Acceptance

Before any portal update, at least the following evidence is required:

1. Discovery, domain challenge, OAuth/PKCE, resource/audience validation,
   callback allowlist, scope errors, and revocation are green; secrets appear
   neither in responses nor in logs.
2. Both the root-owned and backend mTLS modes are set to `enforce`. An external
   `/mcp` request without a client certificate terminates with `403`; a real
   ChatGPT tool call increments `mtls_edge_verified` without producing a reject
   in the mTLS verifier journal or a backend assertion reject
   (`mtls_edge_rejected`) for that call. Metadata and the domain challenge
   remain reachable without a client certificate.
3. CREATE and EXISTING, the provider notice, and all Level 2 dimensions operate
   exclusively in the first-party WebGUI.
4. Two consecutive WebGUI launches generate distinct session values and each
   start a new chat. Permanent SkillPilot ID, OAuth values, and internal
   learning-goal IDs do not appear in the start message.
5. Without a current start message, no tool call occurs and only the fixed
   WebGUI notice is returned. With a start message, a fresh context fetch
   succeeds at the beginning of every learner turn. After a successful
   mutation, its complete successor state is used within the same assistant
   turn without a redundant context fetch.
6. The three session-recovery codes yield exclusively the server-provided
   instruction and, if not already present, a non-duplicated `startUrl`; no
   subject-matter response, OAuth reconnection, or continuation on the stale
   session occurs.
7. In chat, only explicit Level 3 changes to focus and active goal operate.
   Level 2 is neither queried nor mutated.
8. `resources/list` exposes exactly two actively bound UI resources alongside
   all previously advertised predecessors passively and byte-identically. Image
   and flashcard tools bind exclusively their respective active resource.
9. The learning-goal image renders only upon a fresh matching projection and
   clearance. When no image exists, on cluster goals, or after a stale
   clearance, there is no renderer call and no empty UI; the text response
   remains complete.
10. Ordinary flashcard practice modifies only review scheduling and remains
    strictly separated from Verified Recall. Orientation, dialogic learning,
    mastery, and exams each enforce their respective evidence and feedback
    rules.
11. The session guard accepts exactly `PT1H`, rejects operations and replays
    below it, and replays an eligible identical write only when the canonical
    learner revision is unchanged, without executing a new mutation.
12. The request-local test using `3660` seconds or optionally `5400` seconds
    demonstrates the guard transition. `3600`, `86401`, values exceeding the
    normal lifetime, and passing the field when the gate is disabled all fail
    closed. The immediately following launch without the field returns `PT24H`
    again.
13. Security, privacy, legal, client, and behavioral acceptance are documented.
    This runbook asserts no additional ID-in-component submission blocker; V1
    identity handling resides in the first-party WebGUI.
14. The historical 1.0.0 review video remains reachable without login and
    byte-identical at
    `https://skillpilot.com/api/public/openai/review/skillpilot-coach-v1/1.0.0/sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4`.
    It is not behavioral acceptance for the new 1.1.2 candidate. Before any
    resubmission, a matching current recording must be created separately,
    verified, and served under its own content-addressed URL; file size,
    SHA-256, `video/mp4`, byte-range retrieval, and OpenAI origin/CORS
    preflight for `GET` and `Range` must be verified anew.

Only after a successful **Publish** in the OpenAI portal is the verified draft
immutably recorded:

> The current development authorization explicitly excludes publication
> registration. `record-published` remains blocked even when both flags are
> passed. Only after an actual portal publish and separate authorization may
> the status be updated with the current candidate and evidence.

```bash
node scripts/openai_plugin_release.mjs record-published \
  --confirm-openai-published \
  --confirm-mtls-enforced-and-verified
```

Prior to that, `release-index.json` must not list the version as published.

## 4. mTLS Operations and CA Maintenance

At least every 90 days, the official OpenAI root and Connectors intermediate
files are verified against the pinned repository files, hashes, fingerprints,
validity windows, and documented chain. There is no automatic download in
production. Any change is rolled out as a review-gated CA rotation in
accordance with
[CA provenance](https://github.com/enpasos/skillpilot/blob/main/deploy/openai-mtls/PROVENANCE.md)
using the static gate, preflight, runtime smoke check, and a live positive
ChatGPT test; when OpenAI chains overlap, an overlapping trust cutover is
planned. At least 90 days before CA expiration, the successor strategy must be
confirmed. During routine operation, `mtls_edge_verified`,
`mtls_edge_observed_no_cert`, and the backend assertion counter
`mtls_edge_rejected` are monitored. Certificate and no-certificate rejects
occur upstream of Spring and are therefore observed via the bounded mTLS
verifier journal and the public `403` edge status. Missing verified calls or
rising reject signals are investigated and resolved before the next release.

## 5. Rollback Within V1

A rollback changes neither plugin identity, Contract Major, MCP origin, nor
OAuth resource.

1. Disable write operations via the kill switch if data integrity is at risk.
2. Restore the last known-good backend/edge build.
3. For a published version, use exclusively the unmodified snapshot under
   `contracts/published/`.
4. Fix defective published skill or listing metadata via a new compatible patch
   version; never repopulate an already published version.
5. Revoke OAuth tokens or learning sessions across the board only for a
   specific security or data-integrity cause.

## 6. Deprecation, Unpublish, and Deletion

State transitions start in `release/lifecycle.json`:

- `SUPPORTED`: functional and security-maintained, but no longer recommended;
- `DEPRECATED`: functional with a named successor and published deadlines;
- `UNPUBLISHED`: no new installations; existing installations remain functional
  until the documented end of support;
- `RETIRED`: controlled rejection without loss of global learner progress.

Unpublishing is not a technical shutdown. A line is deleted only once support,
unpublish, and deletion notice periods have expired, no supported installations
or migration paths remain, and global mastery remains independently preserved.
Published snapshots, release notes, and audit records remain immutable. MCP
origin, OAuth resource, and UI artifacts are decommissioned only after the last
supported client ends.

A future V2 never silently overwrites V1. Both lines maintain separate
identities, origins, resources, skills, snapshots, telemetry, and lifecycles.

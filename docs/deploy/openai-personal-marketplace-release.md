# SkillPilot ChatGPT Desktop beta: Git marketplace and updates

**Active Product Owner request of 5 October 2026.** Update the existing Git
marketplace for rapid fixes and include **ChatGPT Desktop (Beta)** in the
WebGUI. This supersedes the September distribution pause for this concrete
route. The archive/CIMD integration was already authorized on 24 September.
Official OpenAI submission and production GUI/server deployment are separate.

## Current candidate and evidence

Canonical package and current public Git release: **SkillPilot Coach v1
1.1.2**. The matching backend/resource rollout remains with the Product Owner.
Public Git source:
[enpasos/skillpilot-chatgpt-marketplace](https://github.com/enpasos/skillpilot-chatgpt-marketplace).
Marketplace identity: `skillpilot-chatgpt-marketplace`; plugin identity:
`skillpilot-coach-v1`. The canonical OpenAI portal lifecycle stays **DRAFT**;
a Git release is not an OpenAI Directory publication.

Evidence recorded on 5 October 2026:

| Check | Observed result and limits |
| --- | --- |
| Windows ChatGPT archive installation | Owner reports successful deployment; supplied UI shows archive and marketplace add options |
| Initial learning start | Rejected the Claude-generated `spc_` capability; corrected OpenAI launch uses `sps_` |
| Windows Git/Desktop route and corrected learning start | Product Owner confirms “funktioniert” after installing the current Git package and using the corrected start; owner-reported evidence, not a recorded tool trace |
| Windows Desktop Work with Voice | Owner reports only the first learning image displayed. Supplied production trace shows successful initial (state 132) and successor (state 133) renderer calls on backend `0af05906c8...`; the owner assigns the last call to Voice with the successor image missing. The server still supplies UI `12762009...`; the local `08030...` correction and successful Voice image sequence remain unaccepted |
| Windows Desktop Work without Voice | Owner subsequently reports that the image flow works without Voice. This is owner-reported Text-mode evidence; no matched Voice/Text tool trace or acceptance of the local follow-up correction |
| Native Codex 0.160.0 local installation | Exact seven canonical files installed and enabled; app-server `skills/list` discovers the coach |
| Codex Git update in an isolated loopback repository | Installed files refreshed immediately, including a synthetic version bump; fixture removed afterwards |
| Desktop manual Git update | Owner reports the manual marketplace update works when moving to 1.1.2; no correlated installed-version/tool trace |
| Desktop automatic Git updates | Owner observed no automatic update when moving to 1.1.2. Automatic replacement remains unaccepted; this does not establish that automatic updates never occur |
| Desktop OAuth/tool trace, saved learning progress, continuation and renewal | Production trace confirms successful contexts, mastery persistence and two renderer calls; owner assigns the last renderer to Voice. Client-visible successor image, full OAuth/renewal acceptance and the local correction remain unaccepted |
| ChatGPT web and native mobile | Unaccepted; not offered as supported beta surfaces |

The local receipts live in ignored
`tmp/skillpilot-openai-deploy-4qe82egm/receipt/`. They use synthetic update
fixtures and contain no live learner capability. They are local evidence,
not a directory release or a desktop learning-flow pass.

### Recorded 1.1.1 Git deployment

Published on **5 October 2026** as commit
[`358ee9c02efa5b072b41b90ce2f09c181f0bb693`](https://github.com/enpasos/skillpilot-chatgpt-marketplace/commit/358ee9c02efa5b072b41b90ce2f09c181f0bb693)
on `main`, with package digest
`6056eddba3287f85a4a292da52a97b60f6042dd01373c19ca79e58f2f9ba42c8`.
A fresh public clone passed byte-exact canonical verification and its own
validator. [GitHub validation run 37271037379](https://github.com/enpasos/skillpilot-chatgpt-marketplace/actions/runs/37271037379)
completed successfully. The update fast-forwarded the original main and changed
six files; the old annotated `v1.1.0` still resolves to its original commit.
No `v1.1.1` tag was created; the full commit above is the immutable reference.
The exported acceptance fields remain pending. This records Git deployment,
not desktop installation or OpenAI portal publication.

The earlier published Git **1.1.0** remains immutable: commit
[`7b184ca44675a6fc20ced73cb30a3ad2958c356f`](https://github.com/enpasos/skillpilot-chatgpt-marketplace/commit/7b184ca44675a6fc20ced73cb30a3ad2958c356f),
annotated tag `v1.1.0`, package digest
`15508140a3770e21896554c1aececf78a2fc421531e5f316fc16ffb101045843`, and passing
[validation run 34681183427](https://github.com/enpasos/skillpilot-chatgpt-marketplace/actions/runs/34681183427).
Do not ship different bytes under that published version. The current patch
carries the canonical privacy/coaching fixes already present in the source.

The Product Owner then confirmed that the published Git/Desktop route and
corrected learning start work on **5 October 2026**, and requested this route
through the ordinary **Lernen starten** GUI and current ChatGPT notices. Normal
start and Cockpit navigation now offer the provider selection without a test
query. GUI production deployment is tracked separately from this owner report.
Keep the original export acceptance fields unchanged; the confirmation adds
evidence here without rewriting the published candidate or its receipt.

### Recorded 1.1.2 Git deployment

After the local checks passed, the Product Owner explicitly requested immediate
marketplace rollout. Published on **5 October 2026** as commit
[`cf5e23a7908412f3f28a1a66485d0e106c346154`](https://github.com/enpasos/skillpilot-chatgpt-marketplace/commit/cf5e23a7908412f3f28a1a66485d0e106c346154)
on `main`, with package digest
`8a301fecdaf55de09cd39c9d8ba18191512aef7b1f910efaf2e75501e3274982`.
A fresh public clone matched all canonical export bytes and passed its standalone
validator. [GitHub validation run 37300661165](https://github.com/enpasos/skillpilot-chatgpt-marketplace/actions/runs/37300661165)
completed successfully. The update fast-forwarded `1.1.1`, preserved its commit
and the original `v1.1.0` tag, and changed only the package manifest, README,
changelog and inventory. No `v1.1.2` tag was created; use the full commit as the
immutable reference.

Local validation passed **55 OpenAI App tests**, **55 backend tests** (including
Basic/native CIMD flows and provider differential contracts), **96 release/
submission/marketplace tests**, frontend FAQ checks and the static mTLS gate.
The timeout-corrected image resource prepared for the 1.1.2 rollout is bound to
SHA-256
`12762009bd8e00c392e06aefac685e17653f50a5e7efeb21f865429a9fab641e`.
Git publication does not deploy that backend resource, perform OpenAI portal
submission or establish Desktop/Voice image-sequence acceptance. The exported
host-acceptance fields remain pending. Preserve the local preparation receipts
as pre-publication evidence rather than rewriting them.

### Local 1.1.2 image-loading correction

The subsequent owner test used **Windows ChatGPT Desktop, Work, Voice**.
Learning and success saving appeared to work, but only the first learning
image was shown. The owner confirmed that the later image is available in
the Cockpit. This is a display investigation, not evidence of a missing
curriculum image. The report does not establish whether the later renderer
tool was called or how long its resource/image took to arrive.

In the repeated **5 October 2026** Windows Desktop test, the owner reports that
the manual marketplace update works; no automatic update was observed when
moving to **1.1.2**. The repeated **Work/Voice** test still lacked new
learning-goal images, while the Cockpit showed saved goals and successor images.
This does not establish successful host acceptance of the timeout correction
or a general absence of automatic updates. A fresh installation, fresh chat,
the MCP resource hash actually used and correlated tool/display traces remain
unconfirmed for this retest. Public `/version.json` evidence identifies the GUI revision only; it
does not identify the MCP resource loaded by the desktop chat.

The owner subsequently tested without Voice and reports that the image flow
works. This narrows the observed failure to the Voice workflow; it does not
identify whether Voice omitted the successor renderer or its host omitted the
UI after a successful call. The accompanying text is the existing timeout-fix
commit description, not a runtime trace. At this check, the public GUI still
reports `0af05906c8dfa4c62212b6600759c37f902211c6`; the follow-up compatibility
correction below remains local and has not been deployed.

The owner supplied a filtered production MCP trace and then an expanded trace
for **5 October 2026**, confirming that the last renderer call belonged to the
failing **Voice** flow. Times below are server-log completion times in **UTC**
(German local time is two hours later):

| Time | Server evidence |
| --- | --- |
| 15:31:40 | Successful context at state 132 offers a visualization |
| 15:32:00 | Successful initial `render_skillpilot_goal_visualization` at state 132, `resultCode=OK` |
| 15:35:03–15:42:17 | Five further successful context calls at state 132, each offering a visualization |
| 15:42:39 | Successful mastery write advances the same pseudonymized session to state 133 and returns a successor context offering a visualization |
| 15:43:19 | Successful fresh context at state 133 offers a visualization |
| 15:43:32 | Successful successor `render_skillpilot_goal_visualization` at state 133, `resultCode=OK`; owner confirms Voice and reports the missing successor image |
| 15:31:53–15:55:00 | Eight successful resource reads supply `12762009bd8e`, active in server build `0af05906c8dfa4c62212b6600759c37f902211c6` |

Every logged tool call succeeded. The renderer's `goalVisualizationOffered=false`
is expected: its presentation receipt is not a full context offering another
image. Its 6,925 ms runtime places approximate server entry at **15:43:25.794**,
so the resource read at **15:43:25.869** occurred while the successor tool was
still pending, rather than before invocation. Neither this ordering nor a successful resource read
proves component execution, image loading or display. Resource reads have no
session correlator. Repeated context offerings alone do not require rendering
an already-shown `(goalId, stateVersion)` pair again.

The trace confirms the deployed backend still supplied the previous resource;
it does not show the local `08030bd956b6` correction. Voice versus Text is not
recorded in server telemetry; the owner supplies that assignment for the last
renderer call. This excludes an absent successor renderer as the explanation
for this Voice incident. The unresolved failure is after successful server
invocation: client receipt, the actual UI event channel, image loading and
visible display remain unobserved. The earlier MCP `401` and missing
`notifications/initialized` handler warnings do not establish a cause for
the later successful renderer's missing image; the server-level notification
is not a component UI handshake trace. No further code or authentication
change follows from these lines. Deploy the already-tested local correction
and verify its new resource before diagnosing a further defect. Preserve the
mode assignment and server/visible-result distinction without recording the
session fingerprint, request UUID or raw learner data in the repository.

Comparison with current **Claude 1.1.12** found a concrete difference:
Claude's 30 September fix, commit `a85246ff36c`, retains pending renderers so
late tool results and images can still display. Before the correction, the
OpenAI renderer requested host closure after 10 seconds without a result or
15 seconds without an image, clearing the pending image. A host that honors
closure can discard later results. The local **1.1.2** candidate removes these
timeout closures while keeping pending content hidden, deduplicating identical
results, ignoring invalid results and closing on failed initialization or image
errors. Every already-advertised content-addressed resource retains its exact
bytes; the corrected renderer receives a new resource hash.

Local regression coverage checks delayed results/images and successive image
delivery through the bundled MCP Apps bridge. Backend tests check the full
successor context after saved mastery for both Basic and native CIMD OAuth.
Neither proves the reported Windows host incident is fully resolved. Claude's
own candidate-specific two-image host acceptance also remains pending; its
local implementation is a comparison baseline, not ChatGPT host evidence.

For the owner rollout, deploy the matching backend/resource and update the Git
plugin to **1.1.2**, then check the installed version and use a fresh ChatGPT
start in **Work**. Verify: first image, saved success, an explicit agreement
to continue, and the next image in the same Voice chat. If the image is still
missing, distinguish an absent renderer call from a successful renderer call
whose UI never becomes visible. Keep any tool/status evidence sanitized; do
not include chat text, tokens or learner-session capabilities. The recorded
Git deployment above changes no production server setting.

### Follow-up local backend/widget correction

The repeated owner report alone did not establish whether the second renderer
was called; the expanded trace and owner assignment above now confirm it
was called successfully in Voice with the successor image missing.
Backend and coach instruction inspection found no first-image-only
limit: every new permitted `(goalId, stateVersion)` pair remains eligible after
learner continuation. Existing privacy-safe MCP logs distinguish a context
offering an image, the actual render call and its status, and the active or
retained UI resource read. A successful render call still does not prove display.

Local reproductions found two concrete widget bugs. A successor supplied only
through ChatGPT's documented `toolResponseMetadata` was ignored, including
`mcp_tool_result` and `call_tool_result.result` envelopes. A late persisted
`widgetState` could also restore the first image over a newer native result.
The correction reads bounded known result envelopes, applies live event results
before any bootstrap state, and never lets persisted state or stale window
snapshots replace a live result. It preserves validation, duplicate handling,
delayed-image behavior and the complete text coaching path. Claude's current
renderer uses the native MCP Apps channel and has no ChatGPT compatibility
snapshot path; its behavior does not prove ChatGPT host acceptance.
[OpenAI component bridge reference](https://developers.openai.com/plugins/reference#windowopenai-component-bridge)

The new local backend resource has SHA-256
`08030bd956b68b816523f4971b6d18ab154eef01381882b01d7f1991cc643391`.
The previously advertised `12762009...` resource remains byte-identically
registered as retained history. This requires an owner backend rollout; it does
not change the seven published **1.1.2** Git install files, publish another Git
release or submit to the OpenAI portal. The unpublished portal draft is refreshed
to describe the current backend resources. The actual Voice symptom's causal
link to these local bugs and successful two-image host acceptance remain open.

Local validation of this follow-up passed **66 App tests**, including real-SDK
cross-channel delivery; **77 backend tests** for resources, telemetry and the
Claude/OpenAI differential contract; and **65 release/candidate/marketplace
tests**. Versioning, historical review evidence and exact unpublished-draft
verification also passed. These checks are local, not a new desktop acceptance.

After the owner backend rollout, use a fresh SkillPilot-started Work chat with
the already published **1.1.2** plugin. Verify the first image, saved success,
explicit agreement to continue and the next image. If it still fails, retain
only sanitized tool/status evidence: whether the fresh context offered an
image, whether `render_skillpilot_goal_visualization` ran successfully, and
whether the host read `uiArtifact=08030bd956b6 artifactRole=active` or retained
older bytes. As a focused comparison, stop Voice and explicitly ask for the
current learning-goal image in the same chat; record whether the tool call and
display differ. No learner capability, token, permanent learner ID or chat
content belongs in this evidence.

For a short matching Voice test window, collect the existing server telemetry:

```bash
journalctl -u skillpilot --since "30 minutes ago" --no-pager -o short-iso |
  grep -E 'OpenAI Coach V1 MCP V1 (tool invocation|resource read)'
```

Correlate context and render calls using time, `learningSessionHash` and
`stateVersion`. Check `goalVisualizationOffered=true` on the full context or
successor result; the renderer's presentation receipt does not itself offer
another image and legitimately logs that flag as false. Resource reads have
no session/request correlator and the host can cache them, so neither their
timing nor an absent fresh read proves which bytes a specific chat displayed.
Compare the hash with `serverBuild`: `artifactRole=active` refers to that
server's build, so the former build correctly calls `12762009...` active while
the local follow-up build calls `08030bd956b6` active.
Keep the owner-reported visible result separate from every server success.

## Tester walkthrough: Windows ChatGPT Desktop

1. In **Plugins → Hinzufügen → Marketplace hinzufügen**, add
   `https://github.com/enpasos/skillpilot-chatgpt-marketplace`.
2. Open `skillpilot-chatgpt-marketplace` and install **SkillPilot Coach v1**;
   verify **1.1.2** and the enabled coach skill. Avoid enabling the archive copy
   and marketplace copy together in the same chat.
3. Connect the plugin through the host authentication flow. The pinned native
   CIMD profile uses S256 PKCE and supplies no operator/client secret. Use Auto
   or CIMD if that chooser is shown. Record sanitized failures with host/version
   and timestamp rather than changing authentication rules.
4. Use SkillPilot's normal **Lernen starten** entry, or return there from the
   Cockpit. Load the learner, finish configuration and select
   **ChatGPT Desktop (Beta)**. Choose **Lernen mit ChatGPT vorbereiten** and copy
   the whole message unchanged into a **new desktop chat** with this plugin
   enabled. `?coach=chatgpt-desktop` optionally preselects the provider;
   `?chatgptTest=1` remains a compatible preselection without a separate
   start box in the updated GUI. Until the owner deploys that GUI, the legacy
   query reaches the previously available OpenAI test handoff.
5. Verify a real `get_skillpilot_context` call, expected learner/language,
   representative learning, saved progress, continuation and token renewal.
   Keep evidence bound to the exact host, package and marketplace commit.

A Claude-generated start uses the Claude launch endpoint and cannot authorize
OpenAI learning. The GUI requests `/openai/v1/launch` for ChatGPT and
`/claude/v1/launch` for Claude. Provider switching invalidates a prepared start.
The OAuth connection and the learning capability remain separate credentials.
Do not post either credential or a permanent learner ID in public evidence.

For a supported Codex CLI in the intended client's native environment:

```bash
codex plugin marketplace add https://github.com/enpasos/skillpilot-chatgpt-marketplace --ref main
codex plugin add skillpilot-coach-v1@skillpilot-chatgpt-marketplace
codex plugin marketplace upgrade skillpilot-chatgpt-marketplace
```

Check the installed version after refresh and start a new chat. Native Windows
and WSL installations may use separate configuration roots. Local CLI refresh
has been tested, and the owner reports a working manual desktop marketplace
update to 1.1.2. No automatic update was observed in that transition; automatic
ChatGPT desktop updates still need acceptance evidence.
See [OpenAI packaging](https://developers.openai.com/plugins/build/plugins),
[plugin commands](https://learn.chatgpt.com/docs/developer-commands#codex-plugin)
and [Windows/WSL configuration](https://learn.chatgpt.com/docs/windows/windows-app#share-config-auth-and-sessions-with-wsl).

## Reproducible preparation and publication

The only editable coach source is `ai/openai plugin/skillpilot-coach-v1/`.
The exporter copies exactly seven tracked install files, plus the catalog,
validator, CI, documentation, license and SHA-256 inventory. Never include
portal exports, credentials, private learner data or another editable Skill copy.

```bash
node --test scripts/openai_marketplace_release.test.mjs
node scripts/openai_marketplace_release.mjs check
marketplace_export_dir=$(mktemp -d /tmp/skillpilot-chatgpt-marketplace.XXXXXXXX)
node scripts/openai_marketplace_release.mjs prepare --output "$marketplace_export_dir"
node scripts/openai_marketplace_release.mjs verify --output "$marketplace_export_dir"
node scripts/check_skillpilot_coach_plugin.mjs
node scripts/check_openai_plugin_versioning.mjs
git diff --check
```

`prepare` requires an empty directory; `verify` compares every exported byte
with current canonical inputs. Record the source revision and source diff for a
locally modified build. Every input change requires a fresh export. The
source `.github/workflows/openai-marketplace.yml` provides this lane through
manual `workflow_dispatch`; the exported repository validates pushes and PRs.

For the authorized Git deployment, publish the verified export without
force-pushing, preserve unrelated remote content and the old tag, then verify a
fresh public clone against the export and record the GitHub validation result.
New immutable releases should use a new version and tag. Never run
`record-published` for a Git beta update: that belongs to actual OpenAI portal
publication. Package checks do not replace actual host acceptance.

## Security and acceptance boundaries

Use the existing `https://mcp-coach-v1.skillpilot.com/mcp` endpoint and OAuth
issuer. Native public CIMD is an exactly pinned client profile, never fallback
from failed hosted confidential authentication. Valid OAuth and independent
provider-specific learner-session authorization stay mandatory. The initial
native test may use the already authorized mTLS `observe`; this Git update
changes no server setting. See [native CIMD](openai-native-cimd.md).

Record desktop Git install, connection, actual tools, complete learning flow,
renewal and update results separately. Do not infer web/mobile support or
independent-account acceptance from a synced chat, archive installation,
Claude flow or local CLI test. The September notes below remain history;
their former transport blockers and distribution pause do not override the
later explicit native/Desktop Git authorization.

## Historical registered-app experiment (stopped before installation)

**Superseded on 12 September 2026:** after supplying the app link, the Product
Owner clarified that the beta installation must work from scratch, not depend
on a repaired or previously configured personal app. The local probe below is
retained as diagnostic preparation only. Do not install or publish it as the
beta solution. It was never installed, connected, or published.

On **12 September 2026**, the Product Owner agreed to investigate a separate
Git-marketplace package referencing a registered OpenAI MCP app. The aim is to
retain Git-delivered Skill updates while exercising the production security
chain. This is not a decision to replace the published direct-MCP candidate,
publish another package, change credentials, or relax authentication.

The first direct-MCP attempt in Windows ChatGPT **26.901.51231** stopped before
OAuth: the production edge recorded `403 / certificate_required` at
**08:36:11, 08:38:14 and 08:38:24 UTC**. These observations establish that those
requests supplied no client certificate; they do not establish that every
Git-marketplace transport is incompatible with mTLS.

The proposed alternative has these separate responsibilities:

| Component | Responsibility |
| --- | --- |
| Git marketplace | Distribute the plugin, canonical Skills and assets |
| Plugin `.app.json` | Reference the explicitly selected registered app |
| Registered OpenAI app connection | Supply the hosted MCP transport and OAuth connection |
| Production SkillPilot edge and backend | Enforce mTLS, OAuth and independent learner-session authorization |

OpenAI documents `.app.json` references to existing apps and its managed MCP
client certificate. The combination still requires real-host evidence; an app
reference does not itself prove that any request uses that certificate.
[OpenAI: Existing app references](https://learn.chatgpt.com/docs/enterprise/plugin-management#reference-an-existing-app-with-appjson),
[OpenAI: mTLS](https://developers.openai.com/plugins/build/auth#mutual-tls-mtls)

The originally proposed diagnostic sequence was:

1. Obtain the **current** registered SkillPilot app's detail-page link from the
   owner and confirm the intended connection. Do not reuse an ID from an old
   screenshot or deleted connection. The package uses the app ID, not the
   `plugin_` wrapper from the detail-page URL. No client secret or learning
   session belongs in this input or the package.
2. Prepare an isolated candidate with a distinct test identity. Derive
   `SKILL.md`, `references/coaching-policy.md` and image assets byte-for-byte
   from the canonical source. Remove the direct MCP `dependencies` entry from
   the experimental `agents/openai.yaml`, retaining its interface and policy;
   otherwise it still declares a second HTTP transport. Use `.app.json` and a
   manifest `apps` reference, with **no** direct `.mcp.json` or `mcpServers`
   declaration. Leave the existing direct exporter, its negative app-reference
   tests, published `v1.1.0`, and the public submission source unchanged.
3. Test the owner's actual host against the **unchanged production endpoint**.
   Correlate a successful tool request with `VERIFIED` transport and the
   configured OAuth profile. A successful install or login alone is not enough.
4. Repeat with an independent personal beta account. Referencing an app grants
   no access to it; workspace sharing is not proof of cross-account beta
   availability. If the app is unavailable, record that access boundary as
   unresolved rather than weakening server checks.
5. Verify an actual Git-delivered package/Skill update and another authenticated
   learning turn. Test web and native-mobile operation separately before
   promising those surfaces. Keep every unobserved acceptance result pending.

The suggestion of temporarily disabling certificate checks was a contingency,
**not authorization to activate it**. `mTLS=enforce`, OAuth client checks and
learner-session authorization stay unchanged. A certificate-less beta test
would not validate the intended production security chain; it would also not
solve any independent OAuth-client incompatibility.

Public submission remains the actual HTTPS MCP server submitted through
**With MCP**, not this existing-app reference wrapper. Shared backend and Skill
behavior do not make the two packaging paths identical.
[OpenAI: Submission requirements](https://developers.openai.com/plugins/deploy/submission#submit-the-mcp-server-not-an-existing-integration-reference)

### Owner-selected registration and local candidate

The owner supplied the current personal detail-page URL on 12 September 2026:
`https://chatgpt.com/plugins/plugin_asdk_app_6aa39de25e70819195ce64ee4c22a0e0?view=personal`.
The corresponding app ID is `asdk_app_6aa39de25e70819195ce64ee4c22a0e0`.
The page displays **1.0.0**. This observation identifies the selected
registration; it does not establish its endpoint, current tool snapshot,
OAuth readiness, or deployed backend version. Do not dismiss the label as
cosmetic or treat the registration as accepted solely because the page loads.

A separate local candidate is prepared under
`tmp/openai-app-reference-probe-20260912/`, with plugin identity
`skillpilot-coach-v1-appref-test`, catalog identity
`skillpilot-chatgpt-appref-test`, and version **1.1.0-appref.1** derived from
the then-canonical **1.1.0** package. It is not an installation or rollback
to the registered app's displayed 1.0.0 package. Its `.app.json` uses only the
documented `id` field: the installed Plugin Creator validator does not accept
the optional `required` field shown in newer documentation. The current
official reference permits that field to be omitted; this compatibility choice
changes no server authorization rule.
[OpenAI: App-reference validation](https://developers.openai.com/plugins/deploy/submission-errors#mcp-server-reference-errors)

The canonical Skill name remains `skillpilot-coach-v1`; do not enable both the
direct candidate and this probe in one test context. The local one-off helper
`tmp/prepare_openai_app_reference_probe_20260912.mjs verify` checks the exact
11-file inventory, source-content equality and all pending acceptance labels.
The `tmp/` artifacts are local experiment files, not durable public releases.

Current status: **stopped before installation; not the beta installation path**.
The local artifacts remain uninstalled and unpublished; their pending receipts
are not acceptance evidence. No production security settings were changed.

## Historical September clean-install requirements

The acceptance target is an independent personal beta account with **no prior
SkillPilot plugin, registered connector, local configuration, or developer
credentials**. Its complete workflow must be:

1. Add the published SkillPilot Git marketplace.
2. Install the current plugin and complete ordinary account connection/consent.
3. Start a fresh learning session in the SkillPilot WebGUI and use the plugin
   against the unchanged production MCP endpoint.
4. Prove the same enforced mTLS, configured OAuth-client profile and independent
   learner-session checks required in production.
5. Receive a Git-delivered plugin/Skill update and repeat the authenticated
   learning turn without manual file edits or developer setup.

Operator-side service registration may be necessary, but it must be reproducible
and make the resulting integration available to the intended independent
accounts. A private owner-only app ID, per-tester secret setup, cache surgery,
version-label changes or a certificate-less transport is not this workflow.
Neither package format nor Git distribution grants app availability by itself.

The currently documented formats preserve the distinction: portable
`plugin.json`/`mcp.json` describes a bundled server; a registered-app mapping
references an existing integration. No supported Git declaration that creates
the needed hosted registration for a fresh independent account has yet been
established. The direct desktop path failed the enforced certificate check;
the personal app-reference probe does not resolve cross-account availability.
This is an unresolved provisioning/transport prerequisite, not a passed beta
installation or a reason to weaken authentication.
[OpenAI: Package your plugin](https://developers.openai.com/plugins/build/plugins),
[OpenAI: Existing app references](https://learn.chatgpt.com/docs/enterprise/plugin-management#reference-an-existing-app-with-appjson)

Do not prescribe another installation workaround until a supported route meets
these prerequisites. Real clean-account evidence, including updates, must
precede calling that route beta-ready.

The [12 September 2026 historical assessment](openai-beta-distribution-assessment.md)
records the subsequent two-account detail-page comparison, the declined shared
workspace alternative, the Tunnel/CIMD checks, and unsent support/forum drafts.
No complete qualifying pre-review beta route was established. The subsequent
[Product Owner decision](claude-beta-chatgpt-release-strategy.md) stops further
distribution work: stabilize Claude first, then perform focused ChatGPT host
acceptance of that candidate and submit. ChatGPT behavior cannot be inferred
from Claude results. This changes neither production authentication nor the
historical unresolved acceptance results below; that marketplace matrix is not
an official-submission gate.

## Historical September acceptance matrix

The initial real-host matrix is deliberately unresolved:

| Check | Initial status |
| --- | --- |
| Clean account: catalog, exact version, bundled Skill | Pending |
| Installed plugin: authenticated production MCP operation | Pending |
| ChatGPT desktop: complete learning turn | Pending |
| ChatGPT web: complete learning turn | Pending |
| ChatGPT web with desktop fully exited | Pending |
| Native iOS / native Android | Pending / pending |
| Update from an earlier installed marketplace version | Pending |

For each observed result retain the exact candidate, marketplace commit, host,
account scope, time, and evidence reference. A new package does not inherit a
previous candidate's acceptance automatically. Unsupported and failed checks
stay distinct from passed checks; neither is a reason to fabricate acceptance.

For a subsequent Git update, regenerate from the new canonical version, pass
both repositories' checks, and verify the published tree again. In the test
client, the documented catalog-refresh command is:

```bash
codex plugin marketplace upgrade skillpilot-chatgpt-marketplace
```

Then verify the actually installed version, bundled Skill, authentication, and
learning turn. Catalog refresh does not prove package replacement or automatic
account-wide updates. Do not delete another plugin, the user's profile, or a
marketplace source as a routine refresh workaround.

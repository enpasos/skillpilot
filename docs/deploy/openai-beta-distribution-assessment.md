# ChatGPT plugin beta distribution

## External desktop beta on 25 November 2026

The beta exercises the complete **SkillPilot Coach** plugin, including its
coaching skill, against the neutral MCP endpoint. The current Claude source
is `skillpilot-coach-v1` 1.1.15. The earlier public ChatGPT Git release is
`skillpilot-coach-v1` 1.1.2. Its entry targets the retired versioned endpoint.
The new ChatGPT package uses the permanent identity `skillpilot-coach` and
version 1.2.0. External testers need to be able to install the plugin in
their own account by following a guide. Use the public Git marketplace for
that distribution and a private upload for the first host check. On Windows,
the client must offer **Add marketplace**. Work can provide the installation
view. Start the learning test in a local **Codex** chat with **This Computer**
selected in the same desktop app.

| Deployment option | Fit for this beta |
| --- | --- |
| Git marketplace | Publish the verified package to the existing public marketplace. External testers can follow its German installation guide using their own eligible desktop account. Verify the default branch, version, neutral endpoint and installation source. |
| Private account plugin, portable ZIP with skill and direct remote MCP | Install the whole package in the owner's account for the initial host check. Confirm the actual surface, installation and OAuth before counting the run. |
| Workspace upload with a registered SkillPilot app | For a workspace Web test, have the admin register and test the neutral MCP server, check the actual hosted OAuth identity and callback and give the testers access to the app. Build the ZIP with that verified app ID and share the installed plugin with the same testers. |
| Custom MCP server in ChatGPT | Checks OAuth, tools and widgets on its own. The complete release test also needs the packaged coach skill. |
| Public plugin directory | The public release has a separate review and publication process. |

OpenAI documents plugin installation and workspace uploads, and recommends
testing both the server connection and the installed plugin. Workspace Git
imports that declare a direct MCP server can be marked Desktop only. The
custom-MCP web flow has separate plan and permission requirements. The
personal app registration recorded in September identified the rejected
1.0.0 build. A fresh registration or verification of its current endpoint
and access is needed before using it for this workspace package.
[Install and manage ChatGPT plugins](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt)
· [Connect and test an installed plugin](https://developers.openai.com/plugins/deploy/connect-chatgpt)
· [Workspace import and Desktop-only constraints](https://learn.chatgpt.com/docs/enterprise/plugin-management#desktop-only-plugins)
· [Custom MCP permissions](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)

### Deliver the beta to external testers

1. Export and verify the marketplace tree against the canonical 1.2.0
   source. Review the German guide alongside the seven install files in
   the [marketplace delivery PR](https://github.com/enpasos/skillpilot-chatgpt-marketplace/pull/1).
2. Merge the source after CI passes and run the regular SkillPilot production
   deployment from the green main commit. Check service readiness, OAuth
   discovery and the deployed MCP capabilities before releasing the package.
3. Merge the verified marketplace change, wait for validation on its default
   branch and compare an anonymous fresh clone to the canonical export with
   `node scripts/openai_marketplace_release.mjs verify --output <clone>`.
4. Give testers the [public installation and update guide](https://github.com/enpasos/skillpilot-chatgpt-marketplace#readme).
   It covers marketplace installation, connection, a disposable learner and a
   fresh learning session in the local Codex chat. Record a second-account host
   test when observed.

### Build and test in the owner's account

1. Prepare and verify the OpenAI adapter contract and current package with
   `node scripts/openai_plugin_release.mjs prepare` and
   `node scripts/openai_plugin_release.mjs verify`. Test the coach
   instructions, card component and completion routes against that build.
2. Build the private install ZIP with
   `node scripts/openai_private_plugin.mjs package --out-dir tmp/openai-private-beta`.
   Run `node scripts/openai_private_plugin.mjs audit-zip --zip <archive>`.
   Both commands accept the same optional `--app-id` for the workspace app
   route. Record the artifact SHA-256 with its installation.
3. Upload the package privately in the target account. For a later release,
   update the same private plugin. Confirm the version, the skill and the MCP
   connection in the installed plugin and connect over SkillPilot OAuth.
4. Start a disposable learner through the SkillPilot web start. In a fresh
   local Codex chat use the configured Personal Curriculum. Test choosing a
   goal with Autopilot off, an explanation and practice, completing a goal,
   pausing, resuming and moving to the next named goal. Record whether the
   first and second images actually appear. Use a separate fixture for unit
   cards and their independent check, and a fresh assessment for entering
   and leaving the assessment. Keep a record of the host, package version,
   observed tool calls and saved result without learner tokens or answers.
5. Record OAuth renewal and Web, mobile or Voice observations per tested
   client. The install archive, backend test, public discovery response and
   visible renderer each answer a different question.

### Deployment record

On 25 November 2026 the private upload returned `USER`, `PRIVATE` and version
`1.2.0`. Its archive SHA-256 is
`be1d97ab0507cf887b6fdff5fec6795f2ae30bcecdbb8a67fe5464cda90541ac`.
Reading back the release confirmed exact bytes for the coaching skill, policy,
agent configuration, portable MCP declaration and license. The host generated
two compatibility files and normalized the author and developer display fields
to the account identity. The saved connection names the neutral HTTPS endpoint
and requests OAuth/CIMD. The native Windows ChatGPT plugin detail displayed
**SkillPilot Coach**, **1.2.0** and **Installiert**. The returned personal link
is for the account owner.

The private package accepted the start message of a disposable learner in
a fresh Work chat. During that attempt the production journal recorded no
MCP tool invocation. A separate **Git** import in the same Windows client
used the public marketplace PR at `387ce700a46c`. The installed Git entry
showed **1.2.0** and registered the `skillpilot-coach` MCP server. The native
client reached the protected endpoint. Its bundled CLI completed Auto/CIMD
sign-in through SkillPilot's consent screen at 04:39 UTC. The grant covered
learning-session reads and writes and keeping that connection active.
The consent and CLI success are evidence of native authorization. The
[Windows guide](openai-personal-marketplace-release.md#windows-oauth-fallback)
includes the tested command for clients without a sign-in button.

At **05:13:59 UTC**, a visible **local Codex chat** in Windows ChatGPT
26.1117.4957.0 used the Git package with the then-current 14-tool backend.
The chat displayed the learning goal and four routes. After the learner chose
a route and agreed to continue, the backend saved mastery at **05:18:53 UTC**
and advanced the learner state from 6 to 7. The learner received feedback on
a number-line exercise, paused and resumed. At **05:32:41 UTC** a fresh chat
using the same disposable learner recovered the active goal at state 7. The
server completed two image-renderer calls during the flow. The test did not
establish whether either image appeared in the client.

At **05:37 UTC**, after a regular restart of the same desktop app, a **Work**
chat reported that SkillPilot Coach was unavailable. The protected endpoint
returned HTTP 401 and the server recorded no successful tool call for that
turn. The Windows instructions therefore direct testers to **Switch mode →
Codex → This Computer** for learning.

On the same morning an unauthenticated GET to `/mcp` returned the expected
401 with discovery on the neutral host. Protected-resource and issuer
discovery returned 200, including the public read/write scopes and S256.
The earlier versioned MCP origin returned 404. During testing there was a
short interval with HTTP 502 from the public site; subsequent checks recovered.
The public website version file identifies the GUI build only.

The [source PR](https://github.com/enpasos/skillpilot/pull/196) was merged
as `f63898e9d0fe5e6c7635ad36640ce01dbfb91fc9`. All six push workflows
succeeded on that commit, including all 14 jobs in the
[main CI run](https://github.com/enpasos/skillpilot/actions/runs/45578571852).
The regular production deployment completed its database backup, restarted
the service at **10:22 UTC** and received HTTP 200 from public readiness.
The website served the matching commit. Public OAuth discovery advertised the
neutral resource, read/write scopes and S256. At **10:24 UTC** the bundled
Windows app server listed 16 SkillPilot tools over OAuth, including
`choose_skillpilot_completion_route` and
`confirm_skillpilot_completion_contract`. A fresh disposable learner then
received a structured learning context. The server logged that successful
`get_skillpilot_context` call at **10:24:45 UTC** with the deployed commit
as its build. The disposable learner was deleted.

At **10:30 UTC**, a separate learner in the Hessen G9 upper-secondary Physics
basic course, with Autopilot off, exercised the new assessment tools through
the bundled Windows app server. After the contract was confirmed, a fresh
context offered the examination *Wann überquert der Wagen die rote Linie?*.
Choosing it opened the task. The tool response exposed the question and
withheld the marking rubric and solution. Pausing the assessment and returning
to ordinary study left the mastery count unchanged. This test exercised the
production tool responses. The earlier learning flow recorded the visible
chat behavior.

External testers can install version **1.2.0** from the public marketplace's
default branch and follow the [German installation guide](https://github.com/enpasos/skillpilot-chatgpt-marketplace#readme).
The [marketplace release](https://github.com/enpasos/skillpilot-chatgpt-marketplace/pull/1)
merged at `291e84fdc5c52f42526f7f7b485ce6dbd695a7d2`.
An anonymous fresh clone passed both the canonical export comparison and the
marketplace validator. Its seven install files have the package digest
`3ad26270620b34df8beac12c8fb7a70870165e42e0f1ec83e810a6bd2e7d54af`,
matching the package used in the Windows tests above. The
[default-branch validation](https://github.com/enpasos/skillpilot-chatgpt-marketplace/actions/runs/45594885295)
and [v1.2.0 tag validation](https://github.com/enpasos/skillpilot-chatgpt-marketplace/actions/runs/45595061908)
both passed on the release commit.

A fresh installation with the official Linux Codex CLI used an empty profile.
It added the public marketplace URL without a Git ref and installed
`skillpilot-coach@skillpilot-chatgpt-marketplace`. The CLI reported
`installed, enabled` for version 1.2.0. All seven files in its installed cache
matched the canonical package. The interactive Windows learning test used the
same seven files from the marketplace PR and the owner's account. An external
tester signing in with a second ChatGPT account has yet to report results.

## Historical distribution assessment of 12 September 2026

**Superseded work plan:** the Product Owner subsequently set
[Claude beta → stable candidate → focused ChatGPT acceptance → submission](claude-beta-chatgpt-release-strategy.md)
on 12 September 2026. There is no parallel ChatGPT beta distribution project,
further workaround search, or speculative ChatGPT extension work. The findings
and unsent drafts below are retained as history, not active follow-up tasks.

**Assessment date:** 12 September 2026. **Status:** no complete qualifying
pre-review beta route established. This is not an official OpenAI rejection of
that capability or proof that no such route can exist. The messages below are
drafts, not sent requests or published forum posts.

## Former required outcome and observed boundary

The intended beta user has an independent personal ChatGPT account and no
existing SkillPilot integration. Installation must start from the Git
marketplace, use normal connection/consent, and receive Git-delivered Skill
updates. The same SkillPilot production endpoint must continue enforcing
OpenAI-managed mTLS, OAuth client authentication and independent learning-session
authorization. No shared ChatGPT workspace, per-tester developer configuration,
distributed client secret, or authentication downgrade qualifies.

The [marketplace runbook](openai-personal-marketplace-release.md) records the
direct-MCP attempt: Windows ChatGPT 26.901.51231 requests reached the edge
without a client certificate and received `403 / certificate_required` before
OAuth. This proves the failure of those requests, not every possible host route.

The subsequent paired user screenshots from the requested account comparison
show the selected personal registration loading in the creator account with
version 1.0.0 and an install button, while the second account receives the
generic plugin-load failure. This supports an account-dependent availability
boundary; the exact policy and underlying HTTP error were not captured.
Neither screenshot proves installation, OAuth success or a working tool call.
The old registration is not the current beta candidate.

## Alternatives checked

| Route | Finding under the required outcome |
| --- | --- |
| Git plugin with direct remote MCP | The observed route failed enforced mTLS. A manifest does not provision the OpenAI-managed certificate. |
| Git plugin referencing a registered app | Separates Git updates from hosted transport, but a reference creates neither an app nor access rights. Cross-account availability remains unresolved. |
| CIMD with `private_key_jwt` | A documented confidential-client flow without a shared tester secret. Personal developer-mode registration is still a prerequisite; it does not establish marketplace-driven provisioning. Production must not be assumed to use JWT merely because the backend implements it. |
| Secure MCP Tunnel | Supports personal Platform organizations, but needs tunnel associations, permissions, a running tunnel client and developer-app setup. It does not establish the required installation path or the same OpenAI-Connectors certificate at our edge. |
| Shared managed ChatGPT workspace | Documented app/role and Git distribution mechanisms, but expressly declined by the Product Owner; not equivalent to independent personal accounts. |
| Custom GPT, alternate chat host or SkillPilot model-API proxy | Different distribution/runtime contracts, not this plugin installation. An inference proxy additionally conflicts with the direct provider-billing boundary. |

Official sources checked for this assessment:

- [Plugin packaging and developer-mode registration](https://developers.openai.com/plugins/build/plugins#create-and-test-a-plugin-locally-with-an-mcp-server)
- [Registered-app references and permissions](https://learn.chatgpt.com/docs/enterprise/plugin-management#reference-an-existing-app-with-appjson)
- [Personal developer mode and CIMD/JWT](https://developers.openai.com/api/docs/guides/developer-mode)
- [OpenAI-managed MCP mTLS](https://developers.openai.com/plugins/build/auth#mutual-tls-mtls)
- [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels)
- [Public review and publication](https://developers.openai.com/plugins/deploy/submission#public-publishing-flow)

Tunnel control-plane mTLS and tunnel-client-to-MCP mTLS are separate TLS legs;
neither automatically supplies OpenAI's Connectors certificate to SkillPilot.
Forwarding through a local operator route would test a different security path.
No tunnel was installed and no production security setting was changed.

## Decision recorded in September 2026

Follow the [binding beta and publication strategy](claude-beta-chatgpt-release-strategy.md).
Claude is the actual beta platform. Only after stabilization is the shared
candidate tested through the real ChatGPT integration and prepared for official
submission; that focused acceptance is not another full beta.

The [submission dossier](openai-plugin-v1-submission.md), current-candidate
[demo](openai-plugin-v1-demo-video.md), security checks and truthful host evidence
remain required. The historical
[marketplace acceptance matrix](openai-personal-marketplace-release.md#historical-september-acceptance-matrix)
is unresolved but is **not a prerequisite for that submission**. Neither support
silence nor this assessment establishes that a distribution route is globally
impossible. The former parallel support/forum and post-publication Git-beta
follow-up plan is superseded, not an automatic future work item.

## Archived support draft — not an active sending task

**Subject:** Pre-review beta distribution of a ChatGPT MCP plugin with enforced mTLS

We are preparing a new submission of SkillPilot Coach. We need a beta route for
independent personal ChatGPT accounts before public approval, with the plugin
and Skill updates distributed through a Git marketplace.

Our production MCP endpoint requires OpenAI-managed client-certificate
authentication and authenticated OAuth clients. In Windows ChatGPT
26.901.51231, the installed Git plugin's direct HTTP MCP connection was rejected
by our edge with `403 / certificate_required` before OAuth. A separate personal
registration loads in its creator account, but its link returns a generic
plugin-load error in a second personal account. We have not established the
exact access policy behind that error.

Is there a supported pre-review registration/distribution flow that lets these
users install from Git, complete normal connection/consent, and use the hosted
OpenAI MCP transport with its managed client certificate? If so, which setup
makes the integration accessible across independent personal accounts?

We are looking for the intended provisioning flow, without shared-workspace
membership or separate developer setup for every tester.

## Archived public forum draft — not an active posting task

**Title:** Git-distributed ChatGPT MCP plugin: secure beta testing in personal accounts before review?

Has anyone completed this installation flow using supported OpenAI features?

- A fresh personal ChatGPT account adds a Git marketplace and installs a plugin.
- The user completes ordinary connection/consent, without creating a developer
  integration first.
- Calls reach the MCP server with OpenAI-managed mTLS and authenticated OAuth.
- Plugin/Skill updates continue through Git.

In our Windows ChatGPT 26.901.51231 test, the direct remote-MCP declaration made
requests without a client certificate, so our enforced edge rejected them
before OAuth. A personal app link loads for its creator but fails to load in a
second personal account. The latter is a generic error, not a confirmed
diagnosis of a specific access rule.

The documentation explains existing-app references, but those references do
not create the integration or grant access. CIMD/JWT addresses client
authentication, while Secure MCP Tunnel describes private/developer access;
neither has established the complete installation flow above for us.

Is a pre-review provisioning/sharing route documented for this combination, or
does the hosted integration first need public approval and publication? A
reproducible supported setup or an authoritative clarification would help.

Relevant references: [app references](https://learn.chatgpt.com/docs/enterprise/plugin-management#reference-an-existing-app-with-appjson),
[MCP mTLS](https://developers.openai.com/plugins/build/auth#mutual-tls-mtls),
[Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels).

## Before sending or posting

Use the authenticated support/forum interface and review the final text and
destination first. Do not attach old learner-chat screenshots, personal app
links, credentials, session capabilities or raw request logs. The sanitized
error class, host version, reproduction steps and public documentation are
sufficient for these drafts. A support reply or forum report is evidence to
evaluate, not automatic production acceptance.

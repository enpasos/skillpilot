# ChatGPT beta distribution: historical assessment

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

## Current decision

Follow the [binding beta and publication strategy](claude-beta-chatgpt-release-strategy.md).
Claude is the actual beta platform. Only after stabilization is the shared
candidate tested through the real ChatGPT integration and prepared for official
submission; that focused acceptance is not another full beta.

The [submission dossier](openai-plugin-v1-submission.md), current-candidate
[demo](openai-plugin-v1-demo-video.md), security checks and truthful host evidence
remain required. The historical
[marketplace acceptance matrix](openai-personal-marketplace-release.md#acceptance-and-updates)
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

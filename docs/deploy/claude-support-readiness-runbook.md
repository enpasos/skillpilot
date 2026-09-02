# Claude Personal Marketplace Support Readiness Runbook

> **Status: incomplete.** Support readiness remains a publication blocker.
> Every `UNASSIGNED - BLOCKING` field below needs an approved owner or value,
> and the mailbox, alert and rollback drills need recorded evidence. This
> runbook and a green synthetic check do not set a release gate to `pass`.

This runbook covers support and incident response for the existing
`skillpilot-coach-v1` personal-marketplace candidate and its dedicated remote
connector. It does not authorize publication, a production configuration
change, token or session revocation, or an expansion of the tested client
contract. The frozen OpenAI Coach v1 contract remains unchanged.

## Approved Restricted Evidence Store

The Product Owner selected one private Google Drive folder as the restricted
evidence store. It must remain owner-only, with link sharing disabled and MFA
enabled on the owning account. Each completed release is retained as one final,
immutable ZIP or PDF evidence bundle; a mutable native document alone is not
sufficient evidence. The private account address, raw mailbox and alert
delivery details, screenshots and other sensitive material stay outside this
repository.

The approved store was created on 1 September 2026 under the existing private
SkillPilot Drive folder. A successful write and metadata readback reported
`shared: false`, exactly one owner permission and no public, domain, group or
link permission. The Product Owner separately confirmed that MFA is active on
the owning Google account. The private folder ID, URL, account details and MFA
evidence remain outside this repository. Public release records use the opaque
reference `SP-CLAUDE-EVIDENCE-STORE-001` and retain only that reference plus
the SHA-256 of each final bundle.

## Ownership And Support Boundary

| Responsibility | Current value | Readiness requirement |
| --- | --- | --- |
| Public intake | `support@skillpilot.com` | Mailbox round trip and access by the accountable responder and every assigned backup must be evidenced. |
| Accountable support owner | Dr. Matthias Unverzagt (also Product Owner) | Owns intake and incident declaration. |
| Backup support owner | None; Product Owner accepted the single-owner risk | Pause active public promotion during an unmonitored absence; the repository and existing installations need not be disabled solely because the owner is absent. |
| Operations owner | Dr. Matthias Unverzagt | Authorized to execute connector containment and recovery. |
| Security owner | Dr. Matthias Unverzagt | Owns credential, token and learner-session incidents. |
| Covered support hours | No fixed staffed window; best effort; no guaranteed SLA | Active public promotion pauses during an unmonitored absence. |
| Internal response objectives | Best effort; no guaranteed response time | On discovery of a security or privacy incident, pause promotion and contain the connector as necessary as soon as practicable. |
| Workflow alert route | Accountable owner's private GitHub notification route | The private delivery address stays only in restricted evidence; delivery and acknowledgement still require a drill. |
| Redacted Claude error-log alert | `NOT CONFIGURED - BLOCKING` | Alert on the existing provider-scoped WARN signal without exporting request bodies, IDs, sessions or tokens; route it to the accountable owner through a private internal channel. |
| Restricted revocation procedure | `UNASSIGNED - BLOCKING` | Record the approved external procedure identifier and access owners; never put secrets or live commands here. |

The supported product boundary is the one documented in the
[Claude connector user guide](claude-connector-v1-user-guide.md) and the
[personal marketplace release runbook](claude-personal-marketplace-release.md).
Support must not turn technical availability on another Claude client, plan or
surface into a SkillPilot support claim without separate acceptance evidence.

## Run The Audit

The synthetic is read-only. It sends only credential-free `GET` requests to a
fixed allowlist, rejects redirects, bounds response bodies and never prints
response bodies. It verifies the current immutable plugin publication, public
legal and privacy pages, application readiness, connector OAuth discovery and
the unauthenticated MCP challenge.

Run its unit tests and then the live check:

```bash
node --test scripts/claude_support_synthetic.test.mjs
node scripts/claude_support_synthetic.mjs verify
```

The implementation is
[claude_support_synthetic.mjs](https://github.com/enpasos/skillpilot/blob/main/scripts/claude_support_synthetic.mjs).
The
[Claude Support Synthetic workflow](https://github.com/enpasos/skillpilot/blob/main/.github/workflows/claude-support-synthetic.yml)
runs the same unit tests and performs the live check on its schedule or through
manual dispatch. Pull requests run only the unit tests and do not contact the
production endpoints.

## Inspect Results And Alerts

A passing JSON result contains the UTC check time, candidate version and
SHA-256, and one bounded result per public check. It contains no local paths,
credentials, learner data or response bodies. Preserve the JSON artifact and
the immutable workflow-run URL in the approved evidence store.

A failed scheduled run is only a signal in GitHub Actions. It is not proven
alerting until the accountable recipient and every assigned backup actually
receive the notification. To test that route, manually dispatch the workflow with
`exercise_alert` enabled. The workflow first runs the real synthetic and then
fails intentionally. Record dispatch, delivery and acknowledgement timestamps
in the drill evidence. Never weaken the check merely to make the drill green.

The public synthetic cannot exercise authenticated tools. Before publication,
configure a restricted alert for the existing provider-scoped WARN event
`Claude v1 operation '<operation>' completed with error in <duration> ms` and
test its delivery with an authorized synthetic or staging failure. The alert
may retain the allowlisted operation name and duration, but it must not export
request or response bodies, learner identifiers, sessions, OAuth values or
tokens. The public synthetic durations provide a bounded external latency
signal; they are not authenticated tool-latency metrics.

## Safe Intake

Ask only for the minimum information needed to route a report:

- UTC time and whether the failure was during marketplace add, installation,
  connector authorization, first-party start, or normal use;
- installed plugin version and the marketplace repository revision if visible;
- Claude plan class and client surface, without account identifiers;
- sanitized error text and the relevant synthetic workflow-run URL.

Never request or retain a permanent SkillPilot ID, an `spc_` learner-session
value, a prepared `q` URL, OAuth code or token, cookie, capability, complete
chat transcript, or screenshot containing learner data. If one arrives
unexpectedly, stop copying it, restrict access and route it to the security
owner under the approved incident process.

## Triage And Troubleshooting

| Signal | First safe action | Escalation |
| --- | --- | --- |
| Immutable publication, legal or privacy check fails | Stop rollout promotion and rerun the synthetic once from a clean environment. Do not replace published bytes or force-push marketplace history. | Operations owner; security owner too if integrity or disclosure is suspected. |
| Application readiness is not `UP` | Check the approved service and deployment telemetry; do not ask a learner to retry repeatedly. | Operations owner and incident declaration according to the approved response objective. |
| OAuth metadata or MCP Bearer challenge differs | Treat connector authorization as fail-closed. Do not ask for an OAuth code or token. | Security and operations owners. |
| Marketplace cannot be added or the plugin is absent | Confirm the full HTTPS marketplace repository URL, eligible supported plan/surface, and one refresh. Preserve only the sanitized client error. | Support owner; release owner if reproducible on the clean acceptance account. |
| Connector authorization fails | Check the public discovery synthetic. Ask the user to restart authorization only after the public contract is healthy. | Security owner for loops, unexpected consent, or leaked values. |
| A connected client rejects the learner session | Start a new session only through `https://skillpilot.com/`; never accept the session value by email. | Support owner; operations owner if reproducible with an authorized synthetic fixture. |
| Provider-wide client failure while SkillPilot checks pass | Record the provider status as an external dependency and avoid changing SkillPilot bytes. | Support owner monitors recovery; no SkillPilot rollback without SkillPilot evidence. |

## Incident Containment And Recovery

1. Open an incident record, assign severity and owners, record UTC detection,
   and pause new marketplace promotion. Keep all sensitive evidence in the
   approved restricted store.
2. Determine whether the fault is marketplace distribution, the SkillPilot
   connector, the shared application, or an external Claude client. Preserve
   the last passing candidate-bound synthetic result.
3. For a connector integrity or data-boundary incident, an authorized operator
   follows the disable order in the
   [connector rollback drill](claude-connector-v1-release.md#8-rollback-drill).
   Those production actions require incident authority; this runbook does not
   execute them.
4. The security owner invokes the approved restricted revocation procedure.
   Until its identifier, owners and rehearsal evidence replace the blocking
   placeholder above, support readiness cannot pass.
5. Repeat the frozen OpenAI differential checks after containment and before
   recovery. A Claude response must not silently alter the OpenAI v1 edge,
   package, tools, schemas, UI, sessions or review artifacts.
6. Recover only from a reviewed immutable candidate. Marketplace-content
   rollback is a new higher-SemVer release; never reuse a version with different
   bytes, delete history or force-push `main`.
7. Close the incident only after the synthetic, clean-client acceptance and
   relevant rollback/recovery checks pass and the accountable owners sign off.

## Record The Drill

Use the
[support-readiness drill template](https://github.com/enpasos/skillpilot/blob/main/ai/claude/plugin/skillpilot-coach-v1/release/support-readiness-drill.template.md)
as a checklist, then store the completed evidence outside the public
repository. The committed file is intentionally a pending template and is not
release evidence.

## Minimum Pass Criteria

Support readiness can be changed to `pass` only in a separate, approved status
change after all of these are true for the exact candidate, source commit and
reproducible marketplace-tree SHA-256:

1. accountable support, operations and security owners are named, have the
   required access, and approve the support boundary; one person may hold
   multiple roles, and a missing backup requires an explicitly accepted
   single-owner contingency that pauses public promotion during absence;
2. the public support mailbox completes inbound and outbound round trips with
   every assigned responder, without auto-reply or spam-routing ambiguity;
3. real staffed hours and internal severity/response objectives are approved,
   without publishing an unsupported SLA;
4. the scheduled synthetic is enabled, its latest candidate-bound run passes,
   and its sanitized JSON and immutable run URL are retained;
5. the intentional failed-run drill reaches the accountable alert path and
   every assigned backup path, with receipt and acknowledgement timestamps
   inside the approved objectives;
6. the redacted provider-WARN alert is configured and a controlled error drill
   reaches its named recipient without secrets or learner data in the alert;
7. the connector containment, restricted revocation, frozen OpenAI
   differential and known-good recovery drill is completed without learner
   data or secrets in evidence;
8. at least one sanitized support scenario is triaged end to end by the
   accountable responder and, when assigned, one by the backup; without a
   backup, the single-owner absence and promotion-pause contingency is
   rehearsed instead; and
9. the Product Owner reviews the complete evidence and explicitly authorizes
   the later gate-status change.

Missing, stale or candidate-mismatched evidence fails closed. A green
synthetic, a populated template, or a configured email address alone is never
sufficient. The remote marketplace revision does not exist before first
publication and is therefore not a support-readiness prerequisite. Bind it in
the later repository-verification and exact-client activation evidence once it
exists.

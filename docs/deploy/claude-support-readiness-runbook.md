# Claude Personal Marketplace Support Readiness Runbook

> **Status: incomplete.** Support readiness remains a publication blocker.
> Every `UNASSIGNED - BLOCKING` field below needs an approved owner or value,
> and the mailbox, workflow-notification and rollback drills need recorded
> evidence. This runbook and a green synthetic check do not set a release gate
> to `pass`.

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
| Public intake | `support@skillpilot.com` | Mailbox round trip, access by the accountable responder and every assigned backup, and the current account-security or explicitly accepted residual-risk decision must be evidenced in the restricted store. |
| Accountable support owner | Dr. Matthias Unverzagt (also Product Owner) | Owns intake and incident declaration. |
| Backup support owner | None; Product Owner accepted the single-owner risk | Pause active public promotion during an unmonitored absence; the repository and existing installations need not be disabled solely because the owner is absent. |
| Operations owner | Dr. Matthias Unverzagt | Authorized to execute connector containment and recovery. |
| Security owner | Dr. Matthias Unverzagt | Owns credential, token and learner-session incidents. |
| Covered support hours | No fixed staffed window; best effort; no guaranteed SLA | Active public promotion pauses during an unmonitored absence. |
| Internal response objectives | Best effort; no guaranteed response time | On discovery of a security or privacy incident, pause promotion and contain the connector as necessary as soon as practicable. |
| Workflow alert route | Accountable owner's private GitHub notification route | The private delivery address stays only in restricted evidence; delivery and acknowledgement still require a drill. |
| Authenticated-tool detection | `BEST-EFFORT REACTIVE BETA - ACCEPTED` | There is no host-side per-operation email monitor and no real-time detection or SLA claim. Signals are the best-effort scheduled public synthetic, the configured GitHub workflow-failure notification route, support reports and targeted inspection of the provider-bounded operation-error record. |
| Restricted revocation procedure | `SP-CLAUDE-V1-IR-001` version `1.0.0` (`draft`; isolated rehearsal and approval still blocking) | The operations and security owner is Dr. Matthias Unverzagt. The reviewed one-shot source and tests are [`scripts/claude_v1_revoke.py`](https://github.com/enpasos/skillpilot/blob/main/scripts/claude_v1_revoke.py) and [`scripts/test_claude_v1_revoke.py`](https://github.com/enpasos/skillpilot/blob/main/scripts/test_claude_v1_revoke.py). Keep incident-specific commands, access details and evidence only in the approved restricted evidence store; never commit secrets or live values. |

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

## Best-Effort Authenticated-Tool Detection Boundary

The public synthetic deliberately cannot exercise authenticated tools. On
3 September 2026, the Product Owner selected and accepted the following simpler
operating boundary for the personal-marketplace beta:

- no host-side per-operation email monitor or additional systemd service;
- the production deployment must not add or retain a technical-mailbox or SMTP
  credential;
- no guaranteed real-time detection, staffed monitoring window or SLA;
- credential-free public checks scheduled hourly and the configured GitHub
  workflow-failure notification route, plus reports received through
  `support@skillpilot.com`; and
- targeted inspection by the authorized operations owner of the existing
  provider-bounded Claude v1 operation-error record, whose application message
  contains only the operation name and duration.

An authenticated operation failure can therefore remain unknown until a
support report, a related public-surface failure or a manual check exposes it.
GitHub workflow scheduling and notification delivery are themselves best effort
and may be delayed.
That residual risk is accepted only for the current best-effort personal-
marketplace beta. Public material must not imply proactive per-tool monitoring,
real-time detection or guaranteed response times.

This boundary neither satisfies nor duplicates the separate exact-client
acceptance gate, which remains independently blocking. During a reported
incident, reproduce authenticated behavior only when necessary and only with
the authorized adult test context; never use customer credentials or learner
state. After recovery, repeat the affected clean-client checks and the public
synthetic.

Reassess managed structured observability, durable delivery with retries and an
independent monitor health signal before any institutional, Directory, staffed,
SLA-backed or general-availability claim. Such an expansion is a separate
release and operations decision, not part of this beta runbook.

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
| An authenticated tool fails while the public synthetic passes | Reproduce only if needed with the authorized adult test fixture, then filter for the provider-bounded Claude v1 operation-error record without copying surrounding journal records or raw learner data. | Operations and security owners; pause promotion if integrity, privacy or a systematic fault is suspected. |
| Provider-wide client failure while SkillPilot checks pass | Record the provider status as an external dependency and avoid changing SkillPilot bytes. | Support owner monitors recovery; no SkillPilot rollback without SkillPilot evidence. |

## Restricted Revocation Tool Contract

`SP-CLAUDE-V1-IR-001` is a root-only, one-shot incident tool, not a daemon,
endpoint or normal deployment step. Install only the reviewed source from the
exact approved commit. First verify that this path is unchanged in that commit,
record its SHA-256, then install it byte-identically:

```bash
SKILLPILOT_APPROVED_COMMIT=REVIEWED_40_CHARACTER_COMMIT
test "$(git rev-parse --verify HEAD^{commit})" = \
  "${SKILLPILOT_APPROVED_COMMIT}"
git ls-files --error-unmatch scripts/claude_v1_revoke.py
git cat-file -e \
  "${SKILLPILOT_APPROVED_COMMIT}:scripts/claude_v1_revoke.py"
git diff --exit-code "${SKILLPILOT_APPROVED_COMMIT}" -- \
  scripts/claude_v1_revoke.py
sha256sum scripts/claude_v1_revoke.py
sudo install -d -o root -g root -m 0755 \
  /usr/local/libexec/skillpilot
sudo install -o root -g root -m 0755 \
  scripts/claude_v1_revoke.py \
  /usr/local/libexec/skillpilot/claude_v1_revoke
sudo sha256sum /usr/local/libexec/skillpilot/claude_v1_revoke
sudo stat -c '%U:%G %a %n' \
  /usr/local/libexec/skillpilot/claude_v1_revoke
```

The two hashes must match and the installed metadata must be exactly
`root:root 755`. Never run the deploy user's writable source copy. The
installed tool refuses another path, owner or mode. It derives one candidate
PostgreSQL connection only from the five `POSTGRES_*` values inherited by the
uniquely identified SkillPilot application JVM inside the active
`skillpilot.service` cgroup, passes only those values to `psql`, and never
prints them. The connected server returns a non-secret `targetSha256` binding
the database name, effective database role, database OID, server address and
port, and PostgreSQL postmaster start time. This deliberately supports the
current `bootRun` service topology, whose systemd `MainPID` can be the Gradle
wrapper rather than the application JVM. It invokes only fixed, root-owned and
non-replaceable system command paths. It fails closed if the service exposes a
direct Spring datasource, config or profile override, an external
`application*` configuration file in a default search location, another
EnvironmentFile, an unexpected database-name shape, more or fewer than one
matching application JVM, or a changing service process.

This is an operational guard, not host-attestation. It does not introspect
Spring objects and cannot independently prove which datasource a modified
application classpath selected. It trusts the host's root boundary, systemd
unit, running process, inherited environment and deployed application
classpath. The current `bootRun` classpath is writable by the deployment user.
If host, deployment-account, checkout, process, configuration or classpath
integrity is in doubt, do not run `execute` on that host. Keep the public edge
contained, perform revocation from an independently verified DBA-controlled
database path, and rebuild the host from reviewed immutable artifacts. Moving
production to a digest-bound, root-owned immutable application artifact is a
separate hardening improvement before a broader-than-beta rollout.

Before support readiness can pass, run only its read-only production plan and
retain the single sanitized JSON result in the restricted evidence store:

```bash
sudo /usr/local/libexec/skillpilot/claude_v1_revoke plan \
  --procedure-id SP-CLAUDE-V1-IR-001 \
  --incident-id SPDRILL-YYYYMMDD-NNN
```

`plan` validates the connected production schema, migrations, exact Claude-v1
scope and database-target guards without changing a row. The owner must review
whether the four aggregate counts are plausible and retain `targetSha256` with
the plan. A database restart, failover, changed role or changed connection
target changes that fingerprint and invalidates the plan. Unexpected counts or
any failed guard stop the procedure; they are not repaired by broadening the
scope. The `REVIEWED_40_CHARACTER_COMMIT` placeholder deliberately keeps the
installation example inert until the approved commit exists.

The prepublication plan never authorizes an `execute`. During an actual
incident, replace the installed active Claude-v1 vhost bytes at the same include
path with the reviewed deny-only
[`skillpilot-claude-connector-v1-contained.conf`](https://github.com/enpasos/skillpilot/blob/main/deploy/nginx/skillpilot-claude-connector-v1-contained.conf),
set the Claude-v1 backend flag to `false`, restart the shared service to
readiness, validate Nginx and reload it. The root-owned containment file must be
mode `0644`; its source and installed SHA-256 must match. A fresh TLS request to
`/mcp` must return both HTTP `404` and
`X-SkillPilot-Claude-V1-Containment: SP-CLAUDE-V1-CONTAINED-1`. This distinctive
response proves that a new connection reached the loaded deny-only generation,
not merely a disabled backend through an old proxy worker.

```bash
sha256sum deploy/nginx/skillpilot-claude-connector-v1-contained.conf
sudo install -o root -g root -m 0644 \
  deploy/nginx/skillpilot-claude-connector-v1-contained.conf \
  /etc/nginx/skillpilot-claude-connector-v1.conf
sudo sha256sum /etc/nginx/skillpilot-claude-connector-v1.conf
sudo nginx -t
sudo systemctl reload nginx
curl --silent --show-error --proto '=https' --max-time 10 --dump-header - \
  --output /dev/null \
  https://mcp-claude-v1.skillpilot.com/mcp
```

Then repeat `plan` with the incident's `SPINC-...` identifier. Only then may the
security owner copy those four fresh counts, that plan's `targetSha256` and its
`toolSha256` into an `execute` using the same incident identifier:

```bash
sudo /usr/local/libexec/skillpilot/claude_v1_revoke plan \
  --procedure-id SP-CLAUDE-V1-IR-001 \
  --incident-id SPINC-YYYYMMDD-NNN
```

```bash
sudo /usr/local/libexec/skillpilot/claude_v1_revoke execute \
  --procedure-id SP-CLAUDE-V1-IR-001 \
  --incident-id SPINC-YYYYMMDD-NNN \
  --expect-oauth PLAN_OAUTH_COUNT \
  --expect-consents PLAN_CONSENT_COUNT \
  --expect-sessions PLAN_SESSION_COUNT \
  --expect-idempotency PLAN_IDEMPOTENCY_COUNT \
  --expect-target-sha256 PLAN_TARGET_SHA256 \
  --expect-tool-sha256 PLAN_TOOL_SHA256 \
  --confirm REVOKE-CLAUDE-V1-AUTHORIZATIONS-AND-SESSIONS
```

The placeholders deliberately make this example non-executable. `execute`
requires all values, the exact tool hash, the Claude-v1 flag explicitly
`false`, an unchanged running service and the exact root-owned deny-only Nginx
vhost at `/etc/nginx/skillpilot-claude-connector-v1.conf`. The proxy check binds
that file's SHA-256, verifies that the loaded on-disk configuration contains no
Claude-v1 upstream, and requires the distinctive header plus `404` from a fresh
credential-free loopback TLS request. It locks the six involved tables before
the destructive transaction takes its first snapshot. This can briefly delay
OAuth writes for other providers, while reads remain available. Row-level
security, table inheritance, unexpected cascading foreign keys, user DELETE
triggers or rewrite rules abort before mutation. The transaction either deletes
the exact current Claude-v1 aggregate scope or rolls back. The target
fingerprint must still match after the table locks are acquired, so a stale plan
from a different database instance, role, endpoint or postmaster generation is
rejected. It forces synchronous local commit and refuses a PostgreSQL server
with `fsync` disabled so a reported commit is not merely buffered process
state.

The result is always one sanitized JSON object. `status: "applied"` is the only
ordinary success. `status: "applied_but_containment_unverified"` means the
reported aggregate deletion counts committed but the final service or live
containment recheck failed. `status: "apply_outcome_unverified"` means the
database client did not return trustworthy commit evidence; only the expected
counts and expected target fingerprint are reported. For either non-success
status, keep containment in place, run a fresh `plan` to establish the current
state, and never retry with guessed or stale values.

Any change to the procedure's scope, SQL, guards, CLI/operator contract or
database-target resolution requires a new procedure version, a new isolated
rehearsal, review, and byte-identical production installation. Earlier
evidence becomes stale. Version `1.0.0` must never name different destructive
semantics.

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
4. The security owner runs a fresh `plan`, checks its aggregate counts and
   target fingerprint, and invokes the count-, target- and tool-hash-bound
   `execute` form of the approved restricted revocation procedure. It revokes
   both Claude-v1 transport
   authorizations and independent Claude-v1 learner sessions, is irreversible,
   and must never restore revoked credentials from a backup. Use only the
   installed copy described above. Until the versioned procedure has passed
   its isolated rehearsal, read-only production plan and approval, support
   readiness cannot pass.
5. Repeat the frozen OpenAI differential checks after containment and before
   recovery. A Claude response must not silently alter the OpenAI v1 edge,
   package, tools, schemas, UI, sessions or review artifacts.
6. Recover only from a reviewed immutable candidate. Marketplace-content
   rollback is a new higher-SemVer release; never reuse a version with different
   bytes, delete history or force-push `main`.
7. Close the incident only after the synthetic, clean-client acceptance and
   relevant rollback/recovery checks pass and the accountable owners sign off.

## Two-Part Prepublication Rehearsal

The personal-marketplace beta proves revocation and production recovery in two
separate exercises. This avoids deleting real user credentials merely to test
an emergency control, while still exercising the exact destructive procedure
before it is needed under incident pressure.

1. **Restricted-revocation readiness.** The repository integration test runs
   the exact embedded transaction from `SP-CLAUDE-V1-IR-001` version `1.0.0`
   against a disposable PostgreSQL database containing dedicated Claude-v1
   fixtures plus negative OpenAI and retired-Claude-beta controls. It must also
   prove rollback on a late failure, resistance to a poisoned `search_path`,
   exclusion of a concurrent OAuth writer, rejection of row-level security and
   table inheritance, and rejection of unexpected cascades, DELETE triggers
   and contradictory provider/principal shapes. The transaction must delete
   only the provider/version-scoped Claude-v1 OAuth authorizations and
   Claude-v1 learning sessions while preserving the negative controls and
   durable curriculum/mastery state outside those sessions. Separately,
   install the same source byte-identically as `root:root` mode `0755` and run
   only its read-only `plan` against production. Retain only aggregate counts,
   the non-secret target fingerprint, timestamps, procedure/version hashes and
   pass/fail results; never retain row values, tokens, session hashes or learner
   identifiers.
2. **Production containment/recovery rehearsal.** In an explicitly approved
   maintenance window, pause promotion, replace only the Claude-v1 TLS vhost
   with the reviewed deny-only containment vhost and reload Nginx, set the
   Claude-v1 feature flag to `false`, restart the shared service, and prove the
   distinctive containment response while application readiness and the frozen
   OpenAI v1 differential remain healthy. Re-enable the unchanged known-good
   backend flag, restart the service and prove readiness while the deny-only
   vhost remains loaded; only then restore the same reviewed active TLS vhost
   and reload Nginx. Do not redeploy unchanged artifacts merely for the drill.
   Then repeat the live synthetic and required clean adult test-client check and
   record the observed interruption.

The Product Owner accepted on 3 September 2026 that the production rehearsal
does not bulk-revoke real OAuth grants or learner sessions. Production-wide
revocation is reserved for an actual security or data-boundary incident and is
then executed only after containment by the authorized operations/security
owner. Recovery after revocation means a fresh OAuth connection and a new
first-party learning session; it never means restoring revoked records.

This two-part beta evidence does not weaken or satisfy the stricter independent
Connector Directory rollback gate in
[the connector release runbook](claude-connector-v1-release.md#8-rollback-drill).

## Record The Drill

Use the
[support-readiness drill template](https://github.com/enpasos/skillpilot/blob/main/ai/claude/plugin/skillpilot-coach-v1/release/support-readiness-drill.template.md)
as a checklist, then store the completed evidence outside the public
repository. Record the accepted best-effort boundary and reference the separate
sanitized deployment and drill evidence; do not retain raw tool arguments,
learner state, logs or credentials. The committed file is intentionally a
pending candidate template and is not release evidence.

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
3. the actual coverage boundary, including the absence of a fixed staffed
   window, and the internal severity/response objectives are approved without
   publishing an unsupported SLA;
4. the scheduled synthetic is enabled, its latest candidate-bound run passes,
   and its sanitized JSON and immutable run URL are retained;
5. the intentional failed-run drill reaches the accountable alert path and
   every assigned backup path, with receipt and acknowledgement timestamps
   retained;
6. the Product Owner has accepted the best-effort authenticated-tool detection
   boundary, candidate-specific deployment evidence confirms that no host-side
   WARN-to-email service or SMTP credential is installed for it, and neither
   release nor support material claims real-time monitoring or an SLA;
7. the exact versioned restricted revocation procedure has passed the isolated
   disposable-database rehearsal, including negative OpenAI and retired-beta
   controls, transaction rollback, fixed-schema, concurrent-writer, row-level
   security, table-inheritance, cascade, trigger and provider-scope checks,
   without learner data, credentials or row values in evidence;
8. its byte-identical production copy is installed as `root:root` mode `0755`,
   the trusted-host precondition is explicitly confirmed, and a successful
   read-only `plan` has validated the configured running-service connection,
   target fingerprint and connected production schema without a database
   mutation;
9. the production connector containment, frozen OpenAI differential and
   known-good recovery rehearsal has passed in an approved maintenance window,
   without bulk-revoking real credentials and with the observed shared-service
   interruption recorded;
10. at least one sanitized support scenario is triaged end to end by the
   accountable responder and, when assigned, one by the backup; without a
   backup, the single-owner absence and promotion-pause contingency is
   rehearsed instead; and
11. the Product Owner reviews the complete evidence and explicitly authorizes
   the later gate-status change.

Missing, stale or candidate-mismatched evidence fails closed. A green
synthetic, a populated template, or a configured email address alone is never
sufficient. The remote marketplace revision does not exist before first
publication and is therefore not a support-readiness prerequisite. Bind it in
the later repository-verification and exact-client activation evidence once it
exists.

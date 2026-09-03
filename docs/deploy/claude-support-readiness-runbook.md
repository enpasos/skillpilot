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
| Redacted Claude error-log alert | `PREPARED IN REPOSITORY - BLOCKING` (`SP-CLAUDE-WARN-ALERT-V1`) | The fail-closed host monitor, protected-credential installer and hermetic tests are prepared. Production activation, receipt, redaction and rate-limit drill evidence are still required. |
| Controlled WARN drill invoker | `UNASSIGNED - BLOCKING` | Approve an exact-MCP invocation method that can submit the reviewed stale-state arguments without exposing OAuth/session material or asking the model to violate the connector's current-version instruction. |
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

### Install the redacted provider-WARN route

`SP-CLAUDE-WARN-ALERT-V1` is a separately activated host-operations control.
It is not another connector process: it opens no port, exposes no endpoint,
does not modify the backend and reads only the journal of the existing
`skillpilot.service`. The router accepts the exact Spring Boot WARN envelope
and one of the twelve frozen Claude v1 operation names. It then creates a new
message from only the trusted journal UTC time, canonical operation name and
bounded integer duration; the original journal line is never passed to SMTP.

IONOS documents `smtp.ionos.de` with SSL/TLS on port `465`, the full mail
address as username and the mailbox password. This monitor implements port 465
as TLS from connection start. IONOS documents port `587` with STARTTLS as an
alternative when port 465 appears to be blocked; this monitor has no automatic
fallback or encryption downgrade. IONOS also requires TLS 1.2 or newer. Before
an operator enables Webmail 2FA, IONOS accepts the mailbox password for SMTP;
after Webmail 2FA is enabled, IONOS requires an App Password for mail clients.

On 3 September 2026, the Product Owner decided not to enable IONOS Webmail 2FA
for this technical mailbox and accepted the resulting residual risk for this
route. This deployment therefore uses the normal password of the dedicated
alert mailbox, not an App Password. The exception remains valid only while all
of these controls remain true:

- the mailbox is used exclusively to send system alerts and not for ordinary
  correspondence;
- it stores no confidential inbound mail;
- its password is long, random, unique and not used anywhere else; and
- the password is stored only in root-owned mode `0600` source credentials and
  exposed to the service through systemd's read-only credential copy.

If any control ceases to hold, keep this alert route deactivated until the
mailbox is remediated or migrated to a separately revocable credential. Never
reuse an IONOS customer-account password or another mailbox's password here.

- [IONOS SMTP server settings](https://www.ionos.de/hilfe/e-mail/allgemeine-themen/serverinformationen-fuer-imap-pop3-und-smtp/)
- [IONOS TLS 1.2 requirement](https://www.ionos.de/hilfe/e-mail/ssl-verschluesselung-fuer-e-mail/verschluesselung-ssltls-in-einem-e-mail-programm-aktivieren/)
- [IONOS 2FA and App Passwords](https://www.ionos.de/hilfe/e-mail/webmail-nutzen/e-mail-bestaetigung-in-zwei-schritten-aktivieren-und-konfigurieren/)

Do not put the technical mailbox address, mailbox password or private recipient
in Git, shell history, a command argument, an environment variable or drill
evidence. The installer reads all three values directly and privately from the
operator terminal, stores the source credentials as root-owned mode `0600`
files, and systemd exposes read-only copies only inside the monitor service.

Before activation, inspect the real host without printing its environment:

```bash
sudo systemctl cat skillpilot
sudo systemctl show skillpilot \
  --property=User,Group,WorkingDirectory,StandardOutput,StandardError
systemctl --version
```

The fixed production assumption is the existing `skillpilot.service`; service
name overrides are deliberately unsupported. The host must run systemd 247 or
newer. The installer enforces this minimum for `DynamicUser`, `LoadCredential`
and `StateDirectory`. Its sandboxed route-test unit machine-checks journal
access and the Spring Boot console envelope without printing a raw backend log
record. `test-route` is an explicit external mail send and remains separate
from configuration. Run the production commands only from a reviewed,
committed and pushed source commit in a clean production checkout. The first
command below must print nothing; retain the 40-character source commit in the
restricted evidence bundle:

```bash
git status --porcelain=v1
git rev-parse --verify HEAD
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest scripts/test_claude_v1_warn_alert.py
sudo bash scripts/install_claude_v1_warn_alert.sh configure
sudo bash scripts/install_claude_v1_warn_alert.sh test-route
sudo bash scripts/install_claude_v1_warn_alert.sh activate
sudo bash scripts/install_claude_v1_warn_alert.sh status
```

The route test proves SMTP acceptance only. Confirm actual receipt through the
private channel before activation. The monitor fails closed on malformed
credentials, state or journal cursors and uses neither plaintext SMTP transport
nor a STARTTLS downgrade. It reserves rate-limit state atomically before
every network access and makes exactly one SMTP attempt: no automatic SMTP
retry is permitted. Repeat attempts for the same operation are suppressed for
one hour, with at most four SMTP attempts per hour and twelve per rolling 24
hours globally. An SMTP failure consumes its reserved slot and stops the
monitor visibly without automatic restart. First run `deactivate` to remove the
still-enabled failed state, then repair or rotate the credentials, repeat the
sandboxed route test, confirm receipt, and explicitly activate the monitor
again. It never puts an SMTP server error, journal line, thread, PID, path,
cursor or credential value in its own diagnostics.

The installer command `rotate` atomically replaces only the local credential
files while the monitor is inactive; it does not change the password at IONOS.
A planned provider-password rotation is therefore a two-system, non-atomic
operation. Because this exception uses the mailbox password, IONOS does not
provide an overlap between old and new credentials: first deactivate the
route, then change the dedicated mailbox password at IONOS, replace the local
credential and test actual delivery before reactivation. Once the IONOS change
is applied, the old local credential is not a usable rollback. If the route
test fails, keep the monitor deactivated and repair the IONOS or local value. A
planned rotation therefore includes a controlled alerting interruption. Never
paste the old or new password into chat, a command or evidence:

```bash
sudo bash scripts/install_claude_v1_warn_alert.sh deactivate
# Change the mailbox password at IONOS; rotate below changes local files only.
sudo bash scripts/install_claude_v1_warn_alert.sh rotate
sudo bash scripts/install_claude_v1_warn_alert.sh test-route
# Confirm actual receipt through the private channel.
sudo bash scripts/install_claude_v1_warn_alert.sh activate
sudo bash scripts/install_claude_v1_warn_alert.sh status
```

The monitor's `systemd-journal` supplementary group necessarily permits it to
read more of the host journal than the one requested unit. This residual host
permission is contained by the fixed `journalctl --unit skillpilot.service`
argument, the second `_SYSTEMD_UNIT` check, the exact logger/envelope parser,
the typed redaction boundary and the systemd sandbox. Do not broaden the group,
service name, accepted logger or parser. If the stored journal cursor is
vacuumed or becomes invalid, the monitor fails closed; an authorized operator
must investigate and deliberately reinitialize the state rather than silently
tailing from a new position. After the cause and the last accepted/suppressed
attempt have been reconciled, the explicit recovery sequence is:

```bash
sudo bash scripts/install_claude_v1_warn_alert.sh deactivate
sudo bash scripts/install_claude_v1_warn_alert.sh reset-state
sudo bash scripts/install_claude_v1_warn_alert.sh activate
sudo bash scripts/install_claude_v1_warn_alert.sh status
```

`reset-state` requires the exact interactive confirmation phrase and deletes
only the monitor cursor, attempt budget, runtime marker and lock file. That
state is not recoverable; resetting it before investigation can hide delivery
history and release a previously consumed send budget.

After activation, run the criterion-6 controlled drill only through the
reviewed exact-MCP test client or authorized synthetic harness, never as an
ordinary learner prompt and never by improvising a raw OAuth request:

1. Use a fresh authorized test learner session. Call
   `get_skillpilot_coach_context` and require an existing `activeGoal.id` plus a
   top-level `stateVersion` `S > 0`; otherwise abort the drill. Keep the session,
   goal and raw context only in the restricted live test context.
2. Call `set_skillpilot_active_goal` once with that same active goal,
   `redirect: false`, a fresh UUID `clientRequestId` and
   `expectedStateVersion: S - 1`. Expect `isError: true` and
   `errorCode: STALE_STATE`, with `currentStateVersion` still equal to `S`.
   The monotonic revision mismatch is checked before the mutation callback;
   the already-active goal is a second nonmutation guard.
3. Reload `get_skillpilot_coach_context`. Require the top-level state version
   still to equal `S` and compare the active goal, focus, mastery, frontier and
   progress projection with the pre-drill values. Retain only
   `state_unchanged=true`, not the raw learner state.
4. Confirm exactly one received mail whose variable body fields are only
   `Signal`, `UTC`, `Operation`, `DurationMs`, and the procedure identifier;
   all other body copy and headers are fixed.
5. Within one hour, repeat step 2 with a second fresh UUID and the same stale
   version. Require `STALE_STATE` with `currentStateVersion: S`, reload context
   again, repeat the step-3 projection comparison and only then record the
   second `state_unchanged=true`. Expect no second mail. The monitor must emit
   the fixed marker `suppressed_operation` instead of opening SMTP a second
   time. Any intervening revision change invalidates rather than merely delays
   the drill.

Capture only fixed monitor markers and bounded process properties, starting at
the recorded drill UTC time; never print an unfiltered backend journal record:

```bash
set -o pipefail
sudo systemctl show skillpilot-claude-v1-warn-alert \
  --property=SubState,NRestarts,MemoryCurrent
sudo journalctl -u skillpilot-claude-v1-warn-alert \
  --since 'YYYY-MM-DD HH:MM:SS UTC' \
  --grep='^INFO claude_v1_warn_alert (alert_smtp_accepted|suppressed_operation)$' \
  --output=cat --no-pager
sudo journalctl -u skillpilot.service \
  --since 'YYYY-MM-DD HH:MM:SS UTC' \
  --grep="Claude v1 operation 'set_skillpilot_active_goal' completed with error in [0-9]+ ms$" \
  --output=cat --no-pager | wc -l
sudo bash scripts/install_claude_v1_warn_alert.sh status
node scripts/claude_support_synthetic.mjs verify
./scripts/verify_openai_v1_public_edge.sh
```

Require `SubState=running`, `NRestarts=0`, `MemoryCurrent` below the unit's
128 MiB hard limit, one `alert_smtp_accepted`, one `suppressed_operation`, a
backend WARN count of exactly two, a passing Claude public synthetic and a
passing frozen OpenAI public-edge smoke. Start only with an unused
`set_skillpilot_active_goal` cooldown and available global attempt budget; on a
new installation that means no prior provider WARN has been accepted since
activation. Do not reset live state merely to manufacture an available slot.
Record only the candidate/source/tree binding, those sanitized outcomes, UTC
send/receipt/acknowledgement times and the immutable evidence-bundle SHA-256.
Never retain the test session, OAuth material, raw journal record, mailbox
headers or private recipient in public release files. Until this production
drill and its private evidence are complete, the table above remains blocking.

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
repository. In the external copy, extend `Redacted Provider Error Alert` with
the approved invoker procedure identifier, both sanitized `STALE_STATE`
outcomes, both `state_unchanged=true` decisions, one accepted/one suppressed
monitor-marker count, the backend WARN count of two, `NRestarts`, bounded
`MemoryCurrent`, and the route receipt/acknowledgement timestamps required
above. Do not add raw tool arguments or learner state. The committed file is
intentionally a pending candidate template and is not release evidence; this
runbook's additional required fields cannot be omitted merely because they are
not embedded in that template.

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

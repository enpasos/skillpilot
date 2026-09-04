# Claude Support Readiness Drill Evidence Template

> **NOT EVIDENCE — PENDING TEMPLATE.**
>
> Do not change the support-readiness gate from this committed file. Complete a
> copy in the approved external evidence store, bind it to the exact candidate,
> source commit and reproducible marketplace-tree SHA-256, and obtain every
> named sign-off. The remote revision is added only after first publication.

## Evidence Binding

| Field | Value |
| --- | --- |
| Drill status | `pending` |
| Candidate version | `1.1.0` |
| Candidate SHA-256 | `ecb6e2d255699162a3221518d32eb4ee9de918cb5fce254f1cd67da0ac59f4ca` |
| Source commit (40 characters) | `UNASSIGNED - BLOCKING` |
| Remote marketplace revision (40 characters) | `NOT YET AVAILABLE - PREPUBLICATION`; replace in later activation evidence |
| Marketplace tree SHA-256 | `UNASSIGNED - BLOCKING` |
| Evidence-store reference | `SP-CLAUDE-EVIDENCE-STORE-001`; private Google Drive, owner-only metadata and account MFA confirmed on 2026-09-01; folder ID and URL remain restricted |
| Drill start (canonical UTC) | `UNASSIGNED - BLOCKING` |
| Drill end (canonical UTC) | `UNASSIGNED - BLOCKING` |

## Owners And Coverage

| Field | Value |
| --- | --- |
| Accountable support owner | Dr. Matthias Unverzagt |
| Backup support owner | `NOT APPLICABLE`; no backup assigned |
| Operations owner | Dr. Matthias Unverzagt |
| Security owner | Dr. Matthias Unverzagt |
| Covered support hours | No fixed staffed window; best effort; no guaranteed SLA |
| Approved internal response objectives | Best effort; on discovery of a security or privacy incident, pause promotion and contain the connector as necessary as soon as practicable |
| Best-effort monitoring boundary | Product Owner accepted on 2026-09-03: no host-side per-operation email monitor and no real-time detection or SLA claim; the production deployment must not include a related SMTP credential |
| Restricted revocation procedure identifier | `SP-CLAUDE-V1-IR-001` version `1.0.0`; `draft`, isolated rehearsal and approval still blocking |
| Single-owner absence and promotion-pause contingency | Accepted by the Product Owner: pause active public promotion during unmonitored absence; do not disable the repository or existing installations solely because the owner is absent; on return inspect mail and workflow notifications and run the live synthetic before resuming promotion |

## Support Mailbox Drill

- [ ] Inbound test reached `support@skillpilot.com`.
- [ ] Primary responder received it through the normal route.
- [ ] Every assigned backup responder received it through the normal route, or
      the approved single-owner contingency is bound above.
- [ ] Sanitized outbound reply reached the authorized test sender.
- [ ] Spam, forwarding, absence and escalation behavior were checked.

| Event | Canonical UTC timestamp | Evidence reference |
| --- | --- | --- |
| Test sent | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |
| Primary received | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |
| Assigned backup received | `NOT APPLICABLE` if none is assigned | `UNASSIGNED - BLOCKING` when applicable |
| Reply received | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |
| Mailbox account-security or accepted residual-risk decision | `UNASSIGNED - BLOCKING`; restricted evidence reference only, no credential or recovery details |

## Synthetic And Workflow Notification Drill

- [ ] Unit-test workflow run passed for this source commit.
- [ ] Scheduled or manual live synthetic passed for this exact candidate.
- [ ] Sanitized result JSON was retained.
- [ ] Retained JSON SHA-256 was independently calculated.
- [ ] Manual dispatch with `exercise_alert` enabled failed intentionally only
      after the real synthetic passed.
- [ ] Primary alert route delivered the intentional failure.
- [ ] Every assigned backup alert route delivered the intentional failure, or
      the approved single-owner contingency was rehearsed.
- [ ] Every assigned responder identified it as a drill and acknowledged it.

| Field | Value |
| --- | --- |
| Passing workflow-run URL | `UNASSIGNED - BLOCKING` |
| Passing result JSON SHA-256 | `UNASSIGNED - BLOCKING` |
| Intentional-failure workflow-run URL | `UNASSIGNED - BLOCKING` |
| Workflow notification triggered (canonical UTC) | `UNASSIGNED - BLOCKING` |
| Primary recipient and delivery time | `UNASSIGNED - BLOCKING` |
| Primary acknowledgement time | `UNASSIGNED - BLOCKING` |
| Assigned backup recipient and delivery time | `NOT APPLICABLE` if none is assigned |
| Assigned backup acknowledgement time | `NOT APPLICABLE` if none is assigned |

## Best-Effort Authenticated-Tool Detection Boundary

The Product Owner accepts that authenticated tool failures may be discovered
only through a support report, a related public-surface failure or a manual
check. The personal-marketplace beta has no proactive per-operation monitor,
real-time detection promise or SLA. This template neither satisfies nor
duplicates the separate exact-client acceptance gate.

The 1.1.0 exact-client gate remains `pending` until a fresh Marketplace or
explicit exact-candidate install on the controlled Web and Android Voice
clients independently completes the daily-plan, automatic-resume and
orientation scenarios. No earlier package or evidence satisfies this gate.
After one tailored motivational response, use the clear continuation phrase
`Machen wir so, dann fangen wir einfach an.` On each surface prove that the
orientation completion was persisted without another confirmation loop and
that the following active goal came from the backend's returned canonical
context. The learner-facing response must not narrate policy or instructions,
private deliberation, lazy loading, schemas, parameters, tool retries or other
connector mechanics, and it must not promise to remember an anchor topic as
durable learner state. Do not infer any result from a successful tool call, a
rendered card, or a conversational claim alone.

- [ ] Claude Web completed the exact orientation scenario without policy,
      instruction or private-deliberation narration.
- [ ] Claude Web reported every valid subject's today-due, currently mastered,
      still-open and overdue counts plus totals before coaching.
- [ ] Claude Web warned safely about unavailable plans without exposing plan or
      landscape identifiers or presenting partial totals as complete.
- [ ] Claude Web resumed the backend-selected plan goal only when the
      authoritative `resumeAvailable` flag was true, without a Web-app button.
- [ ] Claude Web exposed no lazy-loading, schema, parameter or retry mechanics.
- [ ] Claude Web persisted the clear start intent without another confirmation
      and continued only with the backend-selected successor.
- [ ] Claude Web made no unsupported durable anchor-memory promise.
- [ ] Native Claude Android Voice completed all checks independently.

- [ ] Release and support material was checked for unsupported monitoring,
      detection-time or response-time claims.
- [ ] The deployment plan adds neither a WARN-to-email service nor an SMTP or
      technical-mailbox credential to the production host.
- [ ] Candidate-specific production evidence confirms that neither artifact is
      installed or retained.
- [ ] During triage, the operator can filter only the provider-bounded Claude v1
      operation-error record without retaining surrounding journal entries,
      raw learner state, credentials or request and response bodies.

| Field | Value |
| --- | --- |
| Product Owner boundary decision | `accepted`; 2026-09-03 |
| Unsupported-claim review result | `pending` |
| Production absence verification | `UNASSIGNED - BLOCKING`; must cover the WARN-to-email service and related SMTP or technical-mailbox credential |

## Isolated Restricted-Revocation Rehearsal

This exercise runs the exact destructive procedure against disposable
PostgreSQL fixtures. It has no production impact and does not use real user
credentials or learner data.

- [ ] The reviewed repository source was bound by SHA-256.
- [ ] Dedicated Claude-v1 OAuth and learner-session fixtures were present.
- [ ] Negative OpenAI and retired-Claude-beta controls, including the historic
      shared hosted-client-ID case, were present.
- [ ] The exact transaction deleted only Claude-v1 authorizations and
      Claude-v1 learner sessions and cascaded only their idempotency records.
- [ ] Negative provider controls and durable curriculum/mastery state outside
      the scoped Claude-v1 sessions remained unchanged.
- [ ] A deliberately invalid scope/postcondition fixture caused a complete
      rollback.
- [ ] A deliberately poisoned PostgreSQL `search_path` did not redirect the
      procedure from the fixed production schema.
- [ ] A concurrent OAuth writer was excluded for the bounded transaction.
- [ ] Row-level security, table inheritance, an unexpected cascading foreign
      key, a user DELETE trigger, and a contradictory Claude-v1
      provider/principal shape each failed closed before mutation.
- [ ] An execute attempt with a different database-target fingerprint failed
      closed without mutation.
- [ ] Evidence contains only counts, timestamps, hashes and results; it
      contains no row values, credentials, session hashes or learner IDs.

| Field | Value |
| --- | --- |
| Environment | `isolated_disposable_postgresql`; never production |
| Production impact | `none` |
| Revocation scope | `dedicated_fixture_only` |
| Procedure ID | `SP-CLAUDE-V1-IR-001` |
| Procedure version | `1.0.0` |
| Procedure SHA-256 | `UNASSIGNED - BLOCKING` |
| Drill incident ID | `UNASSIGNED - BLOCKING` |
| Start (canonical UTC) | `UNASSIGNED - BLOCKING` |
| End (canonical UTC) | `UNASSIGNED - BLOCKING` |
| Planned aggregate counts | `UNASSIGNED - BLOCKING` |
| Applied aggregate counts | `UNASSIGNED - BLOCKING`; must equal the plan and use the same procedure SHA-256 |
| Planned/applied database target SHA-256 | `UNASSIGNED - BLOCKING`; must match for the same disposable database generation |
| OpenAI negative-control result/count | `UNASSIGNED - BLOCKING` |
| Retired-beta negative-control result/count | `UNASSIGNED - BLOCKING` |
| Durable learner-state negative-control result/count | `UNASSIGNED - BLOCKING` |
| Fail-closed rollback result | `UNASSIGNED - BLOCKING` |
| Poisoned-search-path result | `UNASSIGNED - BLOCKING` |
| Concurrent-writer exclusion result | `UNASSIGNED - BLOCKING` |
| Wrong-target-fingerprint result | `UNASSIGNED - BLOCKING` |
| RLS/inheritance/cascade/trigger/provider-scope guard result | `UNASSIGNED - BLOCKING` |
| External evidence reference | `UNASSIGNED - BLOCKING` |

## Production Read-Only Revocation Readiness

This check installs the reviewed one-shot source and runs only `plan`. It
validates the connection configured in the environment inherited by the active
`skillpilot.service`, binds the connected database generation to a non-secret
target fingerprint, and validates its live schema without changing a
production row. It does not independently attest the Spring datasource or a
compromised host. It never authorizes a later `execute`; an actual incident
requires a fresh plan after containment.

- [ ] The source path was clean in the exact recorded commit.
- [ ] The installed copy at
      `/usr/local/libexec/skillpilot/claude_v1_revoke` was byte-identical,
      `root:root`, a regular non-symlink file, and mode `0755`.
- [ ] `plan` completed from the effective environment of the unchanged running
      SkillPilot application JVM in the `skillpilot.service` cgroup and returned
      only sanitized aggregate counts and the database-target fingerprint.
- [ ] The source SHA-256, installed SHA-256 and plan `toolSha256` were equal.
- [ ] The root boundary, systemd unit, running process, inherited environment
      and deployed application classpath were treated as trusted and showed no
      reason for integrity suspicion. Otherwise no host-side `execute` is
      permitted and the independently verified DBA response path applies.
- [ ] No production database mutation, revocation or restore was performed.

| Field | Value |
| --- | --- |
| Source commit (40 characters) | `UNASSIGNED - BLOCKING` |
| Procedure ID and version | `SP-CLAUDE-V1-IR-001` version `1.0.0` |
| Source/installed/plan SHA-256 | `UNASSIGNED - BLOCKING`; all three must match |
| Installed owner, group and mode | `UNASSIGNED - BLOCKING`; must be `root:root 755` |
| Read-only plan incident ID | `UNASSIGNED - BLOCKING` |
| Plan timestamp (canonical UTC) | `UNASSIGNED - BLOCKING` |
| Planned aggregate counts | `UNASSIGNED - BLOCKING` |
| Planned database target SHA-256 | `UNASSIGNED - BLOCKING`; a restart, failover, role or endpoint change invalidates it |
| Trusted-host precondition | `UNASSIGNED - BLOCKING`; required for this host-side procedure |
| Database mutation | `none` |
| Sanitized plan-result evidence reference | `UNASSIGNED - BLOCKING` |

## Production Containment And Recovery Rehearsal

This exercise proves the reversible production controls in an explicitly
approved maintenance window. It does not bulk-revoke real OAuth grants or
learner sessions. Production-wide revocation remains incident-only under the
restricted procedure.

- [ ] An authorized empty or disposable adult test context was used; no
      learner data was retained in evidence.
- [ ] Marketplace promotion was paused and the maintenance start was timed.
- [ ] Only the Claude-v1 TLS vhost was replaced by the reviewed root-owned
      deny-only containment vhost; source and installed SHA-256 matched, Nginx
      reloaded cleanly, and a fresh request returned the distinctive containment
      header plus HTTP `404`.
- [ ] The Claude-v1 provider flag was set to `false`, the shared service was
      restarted, and application readiness recovered.
- [ ] Claude-v1 was unreachable while every frozen OpenAI v1 differential
      check passed.
- [ ] The unchanged known-good backend flag was re-enabled, the service was
      restarted, and application readiness passed before the same reviewed TLS
      vhost was restored and Nginx reloaded.
- [ ] No unchanged artifact was needlessly redeployed during the drill.
- [ ] The live synthetic and required clean adult test-client acceptance
      passed after recovery.
- [ ] No production database mutation, revocation or restore occurred.

| Field | Value |
| --- | --- |
| Environment | `production` |
| Production impact | `short_shared_service_restart`; observed duration required |
| Revocation scope | `none_during_rehearsal`; production bulk revocation is incident-only |
| Deployed server-build revision (40 characters) | `UNASSIGNED - BLOCKING` |
| Active and containment Claude-v1 TLS-vhost SHA-256 | `UNASSIGNED - BLOCKING` |
| Detection/scenario start (canonical UTC) | `UNASSIGNED - BLOCKING` |
| Promotion paused (canonical UTC) | `UNASSIGNED - BLOCKING` |
| Connector contained (canonical UTC) | `UNASSIGNED - BLOCKING` |
| Application readiness recovered (canonical UTC) | `UNASSIGNED - BLOCKING` |
| Shared-service interruption observed | `UNASSIGNED - BLOCKING` |
| OpenAI differential completed (canonical UTC) | `UNASSIGNED - BLOCKING` |
| Claude recovery completed (canonical UTC) | `UNASSIGNED - BLOCKING` |
| Live synthetic and clean-client result | `UNASSIGNED - BLOCKING` |
| Production database mutation/revocation/restore | `none` |
| External evidence reference | `UNASSIGNED - BLOCKING` |

## Sanitized Support Scenarios

| Scenario | Responder | Outcome | Evidence reference |
| --- | --- | --- | --- |
| Primary responder end-to-end triage | Dr. Matthias Unverzagt | `pending` | `UNASSIGNED - BLOCKING` |
| Single-owner contingency rehearsal | Dr. Matthias Unverzagt | `pending` | `UNASSIGNED - BLOCKING` |

## Sign-Off

| Role | Name | Decision | Canonical UTC timestamp | Evidence reference |
| --- | --- | --- | --- | --- |
| Support owner | Dr. Matthias Unverzagt | `pending` | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |
| Assigned backup support owner | `NOT APPLICABLE` | `not_applicable` | `NOT APPLICABLE` | `NOT APPLICABLE` |
| Operations owner | Dr. Matthias Unverzagt | `pending` | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |
| Security owner | Dr. Matthias Unverzagt | `pending` | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |
| Product Owner | Dr. Matthias Unverzagt | `pending` | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |

## Data-Minimization Check

The completed evidence must not contain permanent SkillPilot IDs, `spc_`
learner-session values, prepared `q` URLs, OAuth codes or tokens, cookies,
capabilities, response bodies, learner state, chat transcripts, credentials or
screenshots with learner data. Record only sanitized timestamps, hashes,
workflow URLs, approved procedure identifiers, decisions and sign-offs.

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
| Candidate version | `1.0.2` |
| Candidate SHA-256 | `9c38746fff5ec51778bd922286bc1c142c6f03488894652ed295ab6ad230a09d` |
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
| Redacted Claude error-log alert route | `UNASSIGNED - BLOCKING` |
| Restricted revocation procedure identifier | `UNASSIGNED - BLOCKING` |
| Single-owner absence and promotion-pause contingency | Accepted by the Product Owner: pause active public promotion during unmonitored absence; do not disable the repository or existing installations solely because the owner is absent; on return inspect mail and alerts and run the live synthetic before resuming promotion |

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

## Synthetic And Alert Drill

- [ ] Unit-test workflow run passed for this source commit.
- [ ] Scheduled or manual live synthetic passed for this exact candidate.
- [ ] Sanitized result JSON was retained.
- [ ] Retained JSON SHA-256 was independently calculated.
- [ ] Manual dispatch with `exercise_alert` enabled failed intentionally only
      after the real synthetic passed.
- [ ] Primary alert route delivered the intentional failure.
- [ ] Every assigned backup alert route delivered the intentional failure, or
      the approved single-owner contingency was rehearsed.
- [ ] Both responders identified it as a drill and acknowledged it.

| Field | Value |
| --- | --- |
| Passing workflow-run URL | `UNASSIGNED - BLOCKING` |
| Passing result JSON SHA-256 | `UNASSIGNED - BLOCKING` |
| Intentional-failure workflow-run URL | `UNASSIGNED - BLOCKING` |
| Alert triggered (canonical UTC) | `UNASSIGNED - BLOCKING` |
| Primary recipient and delivery time | `UNASSIGNED - BLOCKING` |
| Primary acknowledgement time | `UNASSIGNED - BLOCKING` |
| Assigned backup recipient and delivery time | `NOT APPLICABLE` if none is assigned |
| Assigned backup acknowledgement time | `NOT APPLICABLE` if none is assigned |

## Redacted Provider Error Alert

- [ ] A restricted alert consumes the existing Claude-v1 operation-error WARN
      signal without exporting bodies, IDs, sessions, capabilities or tokens.
- [ ] An authorized synthetic or staging operation error triggered the alert.
- [ ] The accountable recipient received and acknowledged it.
- [ ] The retained alert was inspected for data minimization.

| Field | Value |
| --- | --- |
| Controlled error time (canonical UTC) | `UNASSIGNED - BLOCKING` |
| Alert delivery and acknowledgement time | `UNASSIGNED - BLOCKING` |
| Sanitized alert evidence reference | `UNASSIGNED - BLOCKING` |
| Redaction review result | `pending` |

## Containment And Recovery Drill

- [ ] An authorized synthetic or empty test context was used; no learner data
      was involved.
- [ ] Incident declaration and marketplace-promotion pause were timed.
- [ ] Claude TLS vhost disable, provider flag disable and readiness recovery
      followed the approved connector rollback order.
- [ ] The restricted provider-scoped token and learner-session revocation or
      expiry procedure was exercised by its authorized owner.
- [ ] Every frozen OpenAI v1 differential check passed after containment.
- [ ] The known-good Claude candidate was recovered and the live synthetic
      passed again.
- [ ] Clean-client acceptance was repeated where the scenario required it.

| Event | Canonical UTC timestamp | Result or evidence reference |
| --- | --- | --- |
| Detection | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |
| Incident declared | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |
| Promotion paused | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |
| Connector contained | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |
| Revocation/expiry procedure completed | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |
| OpenAI differential completed | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |
| Claude recovery completed | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |
| Incident closed | `UNASSIGNED - BLOCKING` | `UNASSIGNED - BLOCKING` |

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

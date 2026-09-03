# SkillPilot Claude Connector v1 — one-JVM architecture and service concept

**Status:** Claude-v1-only Product Owner unfreeze on 23 August 2026;
pre-submission candidate being rebuilt for first-party 24-hour learner sessions;
external acceptance and publication pending

**Repository basis:** `main` at `f405abce61a3`

**Governing constraint:** OpenAI Plugin V1 review freeze, active since
15 August 2026

**Developer handoff:**
[SkillPilot Claude Connector v1 — Umsetzungsplan](claude-connector-v1-implementation-plan.md)

This document specifies the provider-isolated SkillPilot remote connector and
its Claude distribution routes. Its purpose is to make SkillPilot available in
Claude without silently widening the submitted ChatGPT/OpenAI V1 contract.

The production host cannot carry another JVM within its RAM budget. Claude v1
therefore runs inside the existing SkillPilot Spring Boot process. The safety
target is **provider isolation inside one shared process plus differential proof
that the observable OpenAI V1 contract stays unchanged**. This is a controlled
risk, not process isolation and not a claim that the addition can be literally
risk-free.

---

## 1. Decisions and scope

The following decisions are part of this concept:

- The paused Claude beta in this repository is not the implementation base for
  the directory connector. It remains disabled.
- Claude gets its own permanent MCP origin:
  `https://mcp-claude-v1.skillpilot.com/mcp`.
- Claude v1 is a provider-scoped package in the **existing deployable, existing
  JVM, existing systemd unit and existing database**. A second JVM is not an
  option.
- The public Claude origin owns a distinct OAuth issuer and route contract. At
  the application boundary, nginx maps those routes to exact Claude-v1-only
  internal paths in the shared process.
- The new package is fail-closed and disabled by default through a new property
  namespace. It neither enables nor reuses the paused beta.
- Claude v1 exposes the same twelve learning responsibilities as the ChatGPT
  package through provider-specific schemas and carries two Claude-specific,
  content-addressed MCP Apps resources: the approved learning-goal image and
  private normal flashcard practice.
- Normal flashcard practice changes only the reviewed card's repetition
  schedule. It is not mastery and remains separate from strict Verified Recall.
- The public SkillPilot plugin is the preferred complete installation for eligible paid Claude Web chat users.
  Its coaching Skill is scoped only to that publication surface and declares
  the same public remote connector.
- Claude v1 contains no hooks or subagents and does not claim Desktop Chat or
  Cowork plugin support. Additional surfaces require their own acceptance
  evidence and a later reviewed release.
- The remote connector owns OAuth, MCP, all twelve tools and both MCP Apps UI
  resources. The plugin contributes the reusable coaching Skill and connector
  declaration; it does not duplicate the tool or UI implementation.
- The Connectors Directory remains a separate connector-only distribution route with its own Team/Enterprise submission gate and is not a prerequisite for plugin submission.
- Native mobile plugin support is not claimed by Claude v1.
- Claude v1 carries over current SkillPilot learning, recall, assessment,
  privacy, and identity invariants. It does not carry over the obsolete beta
  tool API merely because that code already exists.
- The committed Personal Curriculum remains a first-party SkillPilot concern.
  The Claude coach may read the resulting learner scope and change Level 3
  focus or the active goal, but it does not create or rewrite Level 2
  curriculum configuration.
- Removal of the paused beta is not part of the connector launch. It requires a
  later, explicit Product Owner decision with an exact OpenAI V1 effect
  analysis.

> **Headline finding.** One JVM remains the only viable production topology.
> Every shared-artifact deployment or restart therefore requires an explicit,
> effect-scoped release decision plus differential proof that OpenAI V1 remains
> unchanged. A green path-based freeze check is necessary but not sufficient.
> RAM feasibility, provider isolation, privacy, and differential OpenAI V1
> evidence remain release gates.

### 1.1 Product offer, users and price

Claude Connector v1 is a hosted extension of the currently free SkillPilot
standard service. SkillPilot does not sell model usage and does not require an
Anthropic API key: the learner supplies an eligible Claude account or workspace,
and Claude supplies the model and chat. The account or workspace contract is
between the user and Anthropic.

The intended users are:

- adult self-learners with an existing SkillPilot ID;
- teachers, tutors and parents who use their own adult Claude account;
- students in higher education and adult or professional education;
- evaluators and small teams that want to test the same canonical SkillPilot
  learner state in Claude and ChatGPT.

Claude currently requires account holders to be at least 18 years old. The
connector is therefore **not** a Claude route for under-18 school learners, even
when their curriculum exists in SkillPilot. The ordinary SkillPilot WebGUI and
the separately governed ChatGPT route remain independent of this restriction.

Current list-price orientation for end users, checked on 17 August 2026:

| Claude plan | Current Anthropic price, excluding tax | Practical v1 fit | Additional SkillPilot price |
| --- | --- | --- | --- |
| Free | USD 0 | Connector-only custom-MCP evaluation where available; not eligible for the complete public-plugin route | EUR 0 |
| Pro | USD 20 monthly, or USD 200 paid annually (advertised as USD 17/month) | Regular individual learning | EUR 0 |
| Max 5x / 20x | USD 100 / USD 200 monthly | Individuals needing substantially more Claude usage | EUR 0 |
| Team Standard | USD 25 per seat monthly, or USD 20 per seat/month billed annually | Managed teams of 2–150 users | EUR 0; no SkillPilot team SLA in v1 |
| Team Premium | USD 125 per seat monthly, or USD 100 per seat/month billed annually | Teams needing the higher-usage seat | EUR 0; no SkillPilot team SLA in v1 |
| Enterprise | USD 20 per seat/month billed annually plus usage at Anthropic API rates | Organizations needing enterprise controls | No v1 enterprise contract or SLA; separate offer required |
| Education | No public list price; institution-wide offer from Anthropic | Universities buying access for students, faculty and staff | No v1 institutional contract or SLA; separate offer required |

Anthropic currently documents custom remote MCP connectors for Free, Pro, Max,
Team and Enterprise plans; Free is limited to one custom connector. The public
plugin is the complete SkillPilot installation only for eligible paid users.
Directory publication requires a Team or Enterprise organization with
directory management rights from the **publisher**, but that gate is neither
an end-user plan requirement nor a prerequisite for plugin submission. Prices,
taxes, plan availability, usage quotas and provider eligibility can change and
are not promised by SkillPilot.

The commercial v1 decision is therefore:

- **SkillPilot-hosted connector: EUR 0 additional charge**;
- **Claude account/workspace: paid directly to Anthropic when applicable**;
- no per-token Anthropic API resale by SkillPilot;
- no uptime, support-response or institutional data-processing SLA in v1;
- any later paid institution or SLA offer requires a separate product, legal
  and capacity decision.

### 1.2 Scope compared with SkillPilot Coach v1 for ChatGPT

| Capability | ChatGPT service under review | Proposed Claude Connector v1 |
| --- | --- | --- |
| Canonical learner state | Existing SkillPilot state | The same state and revision rules |
| Curriculum-grounded coaching | Orientation, dialogic learning, navigation, focus, active goal and mastery | Same fachliche scope, adapted instructions for Claude |
| Personal Curriculum Level 2 | Configured only in the SkillPilot WebGUI | Same boundary; Claude cannot create or rewrite it |
| Verified Recall | Server-owned complete batch, protected answer release and atomic result write | Same invariant and canonical backend rules |
| Exam mode | Capability-bound evaluation and mastery after a complete visible submission | Same invariant and canonical backend rules |
| Public tool surface | Exactly 12 tools | Exactly 12 provider-isolated tools with the same learning responsibilities |
| Learning-goal visualization | Prominent MCP Apps image component | Dedicated content-addressed MCP App for the approved active-goal image |
| Normal flashcard practice | Interactive MCP Apps component with private card data and app-only ratings | Dedicated private MCP App; reviews update only scheduling, never mastery; Verified Recall remains separate |
| Provider UI support | Submitted SkillPilot scope is ChatGPT Web | Public plugin is the preferred complete installation for eligible paid Claude Web chat users; the declared remote connector owns the provider-isolated tools and MCP Apps UI |
| Reusable instructions | OpenAI plugin contains its reviewed Skill | Public Claude plugin contains a Claude-specific Skill scoped to Web chat and declares the same remote MCP server; v1 claims neither Desktop Chat nor Cowork support and has no hooks or subagents |
| Start and identity | First-party `Start learning` creates a fresh 24-hour session and opens a new ChatGPT web chat | The same first-party web start visibly selects the SkillPilot ID, curriculum, Personal Curriculum and provider; choosing Claude creates a fresh opaque `spc_` session valid for exactly 24 hours, while the permanent ID never leaves SkillPilot |
| Minimum age for this integration | SkillPilot launch self-confirmation: at least 13, any higher local limit, and guardian permission under 18 | Claude account holder: 18+ |
| SkillPilot price | EUR 0 additional; eligible OpenAI account/workspace is external | EUR 0 additional; eligible Claude account/workspace is external |

The Claude variant is therefore not a replacement for the submitted ChatGPT
app. It provides contract parity for the learner-facing responsibilities while
keeping provider-specific OAuth, tool schemas, UI bytes and distribution
packages isolated. Both providers use the same canonical learning-state
semantics; Claude broadens provider and client choice for adult users.

This concept intentionally does not quote a ChatGPT plan price. OpenAI's
official developer documentation defines publication and developer-mode flows,
but does not establish one stable end-user plan price or universal account
eligibility for this submitted service; developer-mode availability can depend
on account and workspace policy. OpenAI plan cost and eligibility therefore
remain an external provider condition, just like the Claude plan cost.

---

## 2. The OpenAI freeze

### 2.1 Effect-based, not path-based

`scripts/check_openai_plugin_review_freeze.mjs` currently verifies six protected
trees and twenty-two protected files from
`contracts/openai/skillpilot-coach-v1/review-freeze.json`. That mechanical check
detects byte drift in known critical surfaces.

It is not a general allowlist for safe work. The governing runbook explicitly
freezes every observable contract used by the submitted OpenAI package,
including runtime, dependencies, deployment, security chains, state semantics,
legal statements, and the first-party launch flow. A file outside the manifest
is safe only when its lack of effect on those surfaces is concretely proven.

### 2.2 Current collision map

| Area | Repository state | Consequence |
| --- | --- | --- |
| OpenAI package, selected backend/resources, app and edge | protected trees/files | No connector change may alter their bytes or observable behaviour |
| `CoachToolFacade.java` and `CoachStateProjection.java` | protected files already shared by providers | The v1 adapter may call their existing public contract but must not edit, fork or bypass it |
| Existing Claude beta | already present in the shared artifact, conditional on `skillpilot.claude.enabled` | Keep it disabled; do not turn a beta route into the directory contract |
| Existing Claude OAuth chains | `@Order(1)` and `@Order(2)` when the beta is enabled | New v1 and beta must be mutually exclusive at startup; v1 needs disjoint matchers after the OpenAI chains at `@Order(3)` and `@Order(4)` |
| `application.yml` | protected file | No new connector configuration belongs here |
| `SessionSetup.tsx` and `claudeCoach.ts` | frozen shared setup plus provider adapter | Keep `SessionSetup.tsx` byte-identical; the explicit Claude alias may enable its already-present provider choice and the Claude-only adapter may call the isolated v1 launch contract without changing default ChatGPT behaviour |
| Legal and privacy copy | protected files | A new provider must not make the frozen statements incomplete or inaccurate |
| OpenAI nginx templates | protected files | Do not add Claude hosts or locations to them |
| Main Liquibase changelog | executed by the shared application | Any additive schema need changes shared startup and is therefore a freeze/release gate |

### 2.3 Claude-only Product Owner unfreeze

On 23 August 2026 the Product Owner explicitly authorized rebuilding the
still-pre-submission Claude v1 candidate around first-party 24-hour learner
sessions. The authorization covers the provider-isolated Claude v1 package,
connector contract, implementation, tests and release dossier. It does not
unfreeze any submitted OpenAI V1 effect and does not allocate Claude v2.

The rebuild may change the shared artifact only with the normal differential
OpenAI proof, controlled restart and production-release authorization. The
Claude contract baseline is refreshed only after all focused tests pass; old
ID-file evidence cannot approve the new candidate.

### 2.4 Work still requiring a separate decision or deferral

- any change to frozen OpenAI legal/privacy text, edge templates, OAuth,
  tools, schemas, state semantics, UI bytes or first-party launch behaviour;
- any broad shared-core refactor not required by the provider-isolated Claude
  v1 rebuild;
- allocating Claude v2 or using it to bypass acceptance of v1;
- portal submission, production deployment or service restart outside its own
  approved release window;
- deleting old Claude beta code merely because the OpenAI portal review or
  Claude rebuild has advanced.

Approval, rejection, or withdrawal does not by itself lift the freeze. After an
actual publication, OpenAI Plugin `1.0.0` is permanently immutable and later
work starts as a new SemVer candidate.

---

## 3. Architecture choice

| Option | RAM and isolation | Verdict |
| --- | --- | --- |
| **A. Same Spring process, provider-scoped v1 package** | Reuses heap, datasource, web server and domain services; shares startup and failure domain | **Required by the production RAM limit**, but deploy only after the freeze gate |
| **B. Separate artifact and JVM** | Best failure isolation but duplicates JVM, framework and connection-pool memory | Rejected: production RAM is insufficient |
| **C. Broad shared-core refactor** | Could reduce duplication but changes more frozen code and raises regression scope | Defer; v1 calls existing provider-neutral public services without refactoring them |

Option A cannot reproduce process isolation. It compensates with exact route
matchers, provider-qualified beans and persistence records, bounded resource
use, fail-closed configuration, differential contract tests and a one-switch
rollback. A JVM crash or a bad shared migration can still affect both
providers; the concept must state that residual risk honestly.

The package uses only dependencies already present in the backend unless a
specific dependency is separately approved. It reuses the existing web server,
thread infrastructure, datasource and canonical `CoachToolFacade`/
`CoachStateProjection` contracts. It does not start a child process, second web
server, second connection pool or embedded model runtime.

### 3.1 In-process isolation rules

- New code lives under a v1-specific provider package and property namespace,
  for example `skillpilot.claude.connector.v1.*`.
- The single master switch defaults to `false`. Missing issuer, resource,
  route, signing, client or rate-limit configuration fails startup when the
  switch is `true`.
- Startup fails if both the old `skillpilot.claude.enabled` beta and the new v1
  switch are true.
- New OAuth and MCP security chains match exact internal Claude-v1 paths only
  and are ordered after the frozen OpenAI chains. No generic `/oauth2/**` or
  hostname-only matcher is accepted.
- Every bean that implements OAuth clients, authorization state, token
  introspection, MCP transport, telemetry or rate limiting is provider-
  qualified. Ambiguous unqualified injection fails tests.
- Claude tokens carry a Claude-v1 audience, scopes and provider binding and are
  rejected on every OpenAI, beta, main-site and future-version route.
- Claude work uses bounded queues, timeouts, cache sizes, token counts and
  response sizes. It must not create an unbounded executor or cache inside the
  shared JVM.
- The existing JVM memory limit and heap configuration stay unchanged. Release
  requires an idle and concurrent-load RSS/heap/GC comparison that remains
  inside the operator-approved production headroom without restart, OOM or
  OpenAI latency regression.

### 3.2 Delivery phases

0. **Resolve hard gates.** Approve the first-party 24-hour session design, canonical-state
   boundary, privacy/legal position, age boundary, exact tool contract, OAuth
   clients, and concurrent-write policy.
1. **In-process skeleton.** Add a disabled provider-scoped package without new
   dependencies. Keep the old beta disabled and prove exact security-matcher,
   bean and tool-catalog separation in tests.
2. **Session and OAuth.** Implement connector-owned protected-resource
   metadata, authorization-server discovery, learner-free OAuth authorization,
   CIMD clients, PKCE, token rotation, revocation, audience checks, and the
   separate first-party learner-session boundary.
3. **Coach contract.** Implement all twelve provider-isolated tools, the two
   content-addressed MCP Apps resources, current SkillPilot state, Verified
   Recall, and exam-capability invariants.
4. **State and resource boundary.** Complete optimistic concurrency,
   idempotency, provider-scoped persistence, cross-provider tests and the
   one-JVM memory/load gate.
5. **Freeze decision.** Obtain an explicit Product Owner release decision that
   names the shared-artifact/runtime effect, exact scope, target version and
   review/resubmission consequence. Without it, stop here.
6. **Disabled deployment.** Deploy the shared artifact with Claude v1 disabled,
   verify OpenAI V1, then activate only through the explicit connector property
   and a controlled restart.
7. **Public edge.** Add the dedicated DNS name, certificate and vhost. Validate
   the effective nginx configuration before reload and re-run OpenAI V1 public
   smokes afterward.
8. **Acceptance.** Test every tool through MCP Inspector and a real Claude
   custom connector, including hosted Claude surfaces and Claude Code.
9. **Submit.** Submit the already deployed and tested endpoint through the
   Anthropic directory portal.
10. **Operate.** Monitor OAuth, tool success, latency, heap and provider-specific
   revocation without logging learner content or credentials.

There is no automatic beta-removal phase. Cleanup is separately governed by
Section 12.

---

## 4. Target topology

```text
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ skillpilot.com       │  │ mcp-coach-v1        │  │ mcp-claude-v1       │
│ SPA / existing APIs  │  │ .skillpilot.com     │  │ .skillpilot.com     │
│ dormant beta stays   │  │ frozen OpenAI v1    │  │ Claude v1 public    │
│ disabled             │  │ MCP / OAuth / UI    │  │ MCP / OAuth / bind  │
└──────────┬───────────┘  └──────────┬───────────┘  └──────────┬───────────┘
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     ▼
                         ┌───────────────────────────┐
                         │ nginx                    │
                         │ exact host/path routing  │
                         │ one existing backend port│
                         └─────────────┬─────────────┘
                                       ▼
              ┌───────────────────────────────────────────────┐
              │ one existing Spring Boot process / one JVM   │
              ├───────────────────────┬───────────────────────┤
              │ frozen OpenAI v1 lane │ new Claude v1 lane    │
              │ orders 3/4            │ exact internal paths  │
              │ unchanged contract    │ later chain orders    │
              ├───────────────────────┴───────────────────────┤
              │ shared canonical CoachToolFacade and state   │
              └───────────────────────┬───────────────────────┘
                                      ▼
                               ┌────────────┐
                               │ PostgreSQL │
                               │ one pool   │
                               └────────────┘
```

The same process and canonical service boundary intentionally let a learner use
ChatGPT and Claude with one SkillPilot ID and one progress state. They also make
memory, startup and failure behaviour shared. Those intended state effects and
residual operational risks must pass Sections 3, 7 and 13.

### 4.1 Public URL contract

| Concern | URL |
| --- | --- |
| MCP endpoint | `https://mcp-claude-v1.skillpilot.com/mcp` |
| Protected-resource metadata | `https://mcp-claude-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp` |
| OAuth issuer | `https://mcp-claude-v1.skillpilot.com` |
| Authorization-server metadata | `https://mcp-claude-v1.skillpilot.com/.well-known/oauth-authorization-server` |
| Authorization endpoint | `https://mcp-claude-v1.skillpilot.com/oauth2/authorize` |
| Token endpoint | `https://mcp-claude-v1.skillpilot.com/oauth2/token` |
| OAuth authorization | connector-owned learner-free authorization on the same origin |
| Connector-specific privacy notice | connector-owned stable HTTPS URL on the same origin |

Using a connector-owned **public** issuer is intentional. This is a new
registration, so there is no valid need to preserve the beta issuer on
`skillpilot.com`. Internally, exact prefixed paths keep the new filters,
authorization state and cookies away from both the main origin and OpenAI
routes. OAuth contains no learner binding page.

### 4.2 Internal route contract

The external URLs above are stable provider contracts. The reverse proxy maps
them to an internal namespace on the existing backend port; representative
paths are:

| External path on the Claude v1 origin | Internal application path |
| --- | --- |
| `/mcp` | `/internal/connectors/claude/v1/mcp` |
| `/.well-known/oauth-protected-resource/mcp` | `/internal/connectors/claude/v1/oauth/protected-resource` |
| `/.well-known/oauth-authorization-server` | `/internal/connectors/claude/v1/oauth/authorization-server` |
| `/oauth2/authorize` | `/internal/connectors/claude/v1/oauth2/authorize` |
| `/oauth2/token` | `/internal/connectors/claude/v1/oauth2/token` |
| `/oauth2/revoke` | `/internal/connectors/claude/v1/oauth2/revoke` |
| `/privacy` | `/internal/connectors/claude/v1/privacy` |

The final mapping is frozen before implementation. Discovery documents,
redirects, authorization responses and issuer checks must expose only the external HTTPS
URLs. The internal prefix is not a second public API and must return `404` when
reached through the main or OpenAI origin.

### 4.3 Edge constraints

- Issue a separate certificate lineage for the Claude v1 origin.
- Do not reuse or edit `deploy/nginx/skillpilot-mcp-coaches.conf` or the frozen
  OpenAI main-origin deny snippet.
- A checked-in vhost file is not active merely because it exists. The operator
  must prove its exact include context with `nginx -T`, run `nginx -t` before
  reload, and verify that the OpenAI vhost remains byte- and behaviourally
  unchanged.
- Route only the exact Claude hostname and expected paths to the existing
  backend loopback port with the exact internal rewrites. Unknown paths, hosts
  and future version names return `404`.
- Enforce the expected public host, internal route and OAuth resource at edge
  and application layers; do not rely on an untrusted forwarded Host alone.
- Do not create a main-origin alias for the new MCP endpoint.
- Leave the dormant `/api/claude/mcp` path untouched during the freeze. New
  credentials and resource audiences must be invalid there, so it is not a
  fallback or compatibility route.
- Do not add a listener, loopback port, JVM or systemd unit for Claude.

---

## 5. Build and configuration

The connector is built into the existing backend artifact. Its new property
namespace is bound from the existing protected runtime environment and typed
Java configuration; the frozen main `application.yml` remains unchanged.

Recommended shape:

- a v1-specific package in the existing `backend` module, not another
  executable;
- no new dependency unless an explicit review proves it necessary and safe;
- one new master property such as
  `skillpilot.claude.connector.v1.enabled=false` plus typed, validated
  provider-specific settings;
- the existing systemd unit, JVM, HTTP listener, datasource, transaction
  manager, connection pool and memory limit;
- fail-closed startup when issuer, public resource, routes, signing material,
  client policy, rate limits or beta-exclusion guard are absent or inconsistent;
- no reuse of the broad `skillpilot.claude.*` beta enable flag and no implicit
  `coach-enabled=true` default;
- no secret values in startup summaries, logs, exception messages, or health
  endpoints;
- a provider-specific health contributor and bounded metrics that cannot make
  OpenAI readiness depend on Claude readiness;
- no new table unless the provider/version cannot be represented safely in the
  existing provider-scoped persistence model.

The main SkillPilot deployment remains the only backend deployment. During the
review it must not package or deploy Claude implementation changes. In an
authorized release window, the changed artifact is first deployed with the v1
switch off, OpenAI is differentially verified, and only then is the switch
enabled through the same service's environment and a controlled restart.

---

## 6. Learner connection and identity

### 6.1 V1 decision: first-party learner start, independent connector OAuth

The plugin's OAuth connection and the learner session are deliberately
separate:

1. The user installs the plugin once and connects its remote connector.
2. OAuth authenticates only that technical connector transport. The optional
   `offline_access` scope may keep it connected, but contains and selects no
   learner identity.
3. For every learning session the user opens
   `https://skillpilot.com/`, which enters the shared first-party
   SkillPilot web start.
4. The user visibly selects or loads the SkillPilot ID, confirms curriculum
   and Personal Curriculum, and explicitly chooses Claude. Only then does
   SkillPilot create a fresh opaque token beginning with `spc_` that is valid
   for exactly 24 hours.
   SkillPilot then opens only `https://claude.ai/new` with the prepared prompt
   URL-encoded in exactly one `q` parameter. Claude prefills the composer, but
   the learner reviews and sends the message deliberately.
5. Every one of the twelve tools requires that unchanged
   `learningSessionId`, including the app-only memory-review tool.
6. On expiry, the user starts again in SkillPilot. OAuth refresh cannot mint,
   renew or extend the learner session and no connector reconnect is needed.

The permanent SkillPilot ID never becomes an OAuth subject exposed to Claude,
tool argument, tool result, URL, header, cookie, log field or plugin setting.
V1 accepts no ID file, ID-file password, raw-ID fallback or OAuth-selected
learner.

### 6.2 Session and OAuth security

- Generate high-entropy HMAC-protected `spc_` values and store only the minimum
  server-side session record needed for exact expiry and revocation.
- Enforce exactly 24 hours from issuance; use cannot slide the expiry.
- Bind every tool authorization to the exact current learner session and OAuth
  transport connection without allowing either credential to substitute for
  the other.
- Reject missing, malformed, altered, expired, foreign and replay-incompatible
  sessions fail-closed.
- Protect OAuth with PKCE, exact redirects, CSRF and rate limits; rotate refresh
  tokens with replay detection.
- Never log OAuth bodies, learner-session values, MCP bodies, Recall answers or
  exam material.
- The first-party Web handoff is the sole URL exception for learner-session
  material: its one `q` parameter contains the current 24-hour session inside
  the prepared prompt. It must use the exact Claude Web origin and `/new` path,
  contain no second parameter, fragment, credentials or permanent ID, and must
  not be captured by SkillPilot analytics or logs.
- Revoking OAuth removes only the connector connection. Expiring or revoking a
  learner session does not delete learner state and does not affect OpenAI
  sessions.

### 6.3 Connector-owned persistence

The shared JVM uses the existing datasource and database identity, so database
roles cannot provide per-provider isolation. Application repositories and every
record must instead enforce an explicit `claude-v1` provider/version boundary.
Persistence covers only:

- OAuth registered clients or validated CIMD cache;
- authorization, consent and rotating refresh-token state without learner ID;
- opaque 24-hour learner-session records;
- idempotency records and a minimal write audit without learner content.

The old `claude_binding_grant`, `claude_pending_launch` and beta OAuth records
are not silently reinterpreted and are not dropped. Prefer the existing generic
provider-scoped OAuth tables and canonical learner-state services when they can
represent v1 without ambiguity. If a new table, column or constraint is
required, use one additive main Liquibase change only after the shared-startup
freeze gate has been explicitly cleared. It must be backward-compatible with
the disabled connector and the frozen OpenAI code path.

---

## 7. Canonical learner-state boundary

The connector must call the existing canonical `CoachToolFacade` and
`CoachStateProjection` public contracts in-process. It does not duplicate their
rules and does not write learner tables directly. If the current public
contract cannot express a required v1 invariant, that feature is deferred until
an explicitly authorized versioned core change; a provider-local workaround is
not acceptable.

The implementation must demonstrate all of the following:

- every write is authorized for the bound learner and exact Claude resource;
- Level 2 Personal Curriculum configuration cannot be mutated by coach tools;
- Level 3 focus, active-goal, mastery, recall and assessment writes use the
  current canonical domain rules;
- every mutating request carries an expected state revision and a
  client-request/idempotency identifier or a server-issued capability that
  derives both;
- stale and duplicate writes fail without partial mutation;
- Verified Recall and assessment writes are atomic;
- provider-specific OAuth revocation does not delete or invalidate another
  provider's session;
- audit records identify the provider and operation without storing prompts,
  answers, permanent IDs, access tokens, or released solutions;
- a handled Claude request failure, timeout or overload does not change OpenAI
  state, exhaust the shared pool or cause an OpenAI readiness failure;
- any additive database migration is backward-compatible with the connector
  disabled and the frozen OpenAI code path;
- startup with Claude disabled produces the same OpenAI contract fingerprint,
  tool catalog, OAuth metadata and UI resources as the baseline;
- startup with Claude enabled adds only the exact Claude routes and beans and
  leaves those same OpenAI observations unchanged.

The one-JVM topology cannot guarantee that a process crash, OOM or invalid
shared migration leaves OpenAI running. Those risks are controlled through the
memory/load gate, bounded resources, disabled-first rollout, fault injection
and rollback; they are not described as eliminated. Production launch is
deferred whenever those controls or the required freeze authorization are
missing.

### 7.1 Cross-provider acceptance case

The release gate includes one deliberately concurrent scenario:

1. Load revision N through ChatGPT.
2. Mutate the same learner through Claude, producing revision N+1.
3. Attempt the stale ChatGPT write against N and confirm rejection.
4. Reload through ChatGPT and verify the canonical N+1 state.
5. Repeat in the opposite direction.

The intended result is shared progress with explicit conflict handling, never
last-writer-wins state loss.

---

## 8. Tool contract

The paused beta's ten tools are not the v1 contract. In particular,
`setCurriculum` and `setPersonalization` conflict with the first-party ownership
of Level 2 configuration, while its caller-selected/per-card Verified Recall
flow predates the current canonical semantics.

The exact submitted schemas are frozen only after Claude acceptance. The
candidate surface contains exactly twelve narrow tools:

| Tool responsibility | Class | Required semantics |
| --- | --- | --- |
| Get current coach context | read | No pending-launch consumption, retention timestamp write, or hidden mutation |
| Render active-goal visualization | read + MCP App | Exact active atomic goal and current state only; approved image only; no generated substitute |
| Start normal memory practice | read + MCP App | Private bounded due-card batch in component-only metadata; no mastery mutation |
| Review one normal-practice card | app-only write | Exact displayed card and short-lived learner-session/goal/card/state capability; schedule only, never mastery |
| Get navigation/focus options | read | Current target projection only; no Level 2 configuration mutation |
| Set Level 3 focus | write | Exact server-published option, expected revision and idempotency |
| Set active goal | write | Current allowed option; explicit redirect semantics |
| Set mastery | write | Active goal only; orientation and assessment capability rules preserved |
| Start Verified Recall | read | Server chooses complete batch without mutating state; caller supplies neither goal nor batch size |
| Get Verified Recall answers | sensitive read | One capability-bound read after complete learner submission |
| Record Verified Recall results | write | One ordered, complete, capability-bound atomic batch |
| Get exam evaluation | sensitive read | Released only after a complete visible submission and valid state |

The exam result reuses capability-bound `set mastery`; no separate broad write
surface is introduced.

The two UI resources are content-addressed, served with the MCP Apps MIME type,
and use only standard MCP Apps metadata. Card fronts, backs and review
capabilities are component-private. The model-visible normal-practice receipt
contains only bounded status and progress.

### 8.1 Verified Recall invariant

The backend owns card IDs, exact count and order, completeness, answer-release
boundary, state checks, idempotency, persistence, mastery and continuation.

The model:

1. starts recall exactly once;
2. presents every returned prompt in order;
3. waits for the complete learner response;
4. retrieves all expected answers once using the opaque batch capability;
5. compares meaning;
6. submits exactly one ordered assessment per returned card in one atomic write;
7. follows the server-supplied continuation immediately.

The model never chooses `batchSize`, requests one answer at a time, records one
card at a time, shortens a batch, constructs IDs, or manually saves additional
mastery.

### 8.2 Exam invariant

- Normal context never contains an exam solution, pass mark or scoring rubric.
- Evaluation release is bound to the active exam, current state, complete
  visible submission and a short-lived server capability.
- A released solution is reference material, not a prescribed method.
- Mastery can be written only with the returned evaluation capability and a
  finite passing result.
- Stale, reused, wrong-goal and wrong-learner capabilities fail closed.

### 8.3 Anthropic annotations

Each tool has:

- a human-readable `title`;
- a narrow description matching actual behaviour;
- `readOnlyHint: true` only when the complete operation performs no state,
  activity, retention, session, or audit mutation with user-visible effect;
- `destructiveHint: true` for ordinary coach tools that create, update or delete
  learner or connector state;
- `destructiveHint: false` for the app-only normal-card review because it is an
  idempotent, recoverable spaced-repetition scheduling update, not mastery,
  focus, active-goal or content deletion.

Descriptions explain the tool operation, not general model behaviour or hidden
prompt instructions. Behavioural coaching policy belongs in the connector's
documented instructions, not disguised inside tool descriptions.

---

## 9. OAuth and MCP security contract

### 9.1 Supported clients

Claude's hosted surfaces and Claude Code do not use the same OAuth client
metadata:

- hosted Claude.ai, Desktop, Mobile and Cowork use
  `https://claude.ai/oauth/mcp-oauth-client-metadata` and
  `https://claude.ai/api/mcp/auth_callback`;
- Claude Code uses
  `https://claude.ai/oauth/claude-code-client-metadata` and loopback callbacks
  such as
  `http://127.0.0.1:<ephemeral>/callback` and
  `http://localhost:<ephemeral>/callback`.

V1 supports and tests both flows. A singular allowlist for the hosted client is
not sufficient for a connector advertised across Claude products.

For CIMD:

- do not expose Dynamic Client Registration in v1;
- advertise `client_id_metadata_document_supported: true`;
- advertise `token_endpoint_auth_methods_supported: ["none"]`;
- advertise and require PKCE `S256`;
- fetch only the two explicitly allowed Claude HTTPS CIMD URLs above;
- reject redirects to untrusted or private-network destinations;
- require a self-referential `client_id`;
- validate every redirect URI from the fetched metadata;
- compare Claude Code loopback callbacks with the ephemeral port ignored while
  preserving scheme, host and path rules;
- cache validated metadata for a bounded period and fail closed on validation
  errors.

### 9.2 Protected resource and audience

- An unauthenticated MCP request returns `401` with
  `WWW-Authenticate: Bearer resource_metadata="..."` and the required scopes.
- Protected-resource metadata contains a `resource` value exactly equal to
  `https://mcp-claude-v1.skillpilot.com/mcp`.
- `authorization_servers` contains only the connector-owned issuer.
- Every access token is bound to that exact resource, client and connection.
- A Claude token is rejected by the OpenAI MCP endpoint, old Claude beta path,
  main website APIs and future Claude version hosts.
- OpenAI tokens and sessions are rejected by the Claude-v1 route and security
  lane in the shared process.

### 9.3 Token lifecycle

- OAuth authorization code with PKCE S256;
- public-client token exchange using
  `application/x-www-form-urlencoded`;
- short-lived opaque access tokens or equivalently revocable tokens;
- rotating refresh tokens with replay detection;
- RFC-compliant `invalid_grant` handling;
- explicit revocation;
- read and write scopes separated;
- no OAuth bearer token in query parameters;
- no credentials or token material in logs, telemetry, tool results, or
  browser storage beyond the minimum OAuth transaction requirement and the
  explicitly reviewed one-time Claude Web `q` handoff for the separate
  24-hour learner session.
- validate HTTP `Origin` according to the MCP security requirements without
  using unauthenticated `clientInfo` as an authorization signal, and test the
  policy across every supported Claude surface.

---

## 10. Privacy, legal and age boundary

The existing protected privacy policy currently describes the offered
ChatGPT/OpenAI connection variants. The directory connector introduces a new
provider, OAuth client set, consent surface and data flow.

Before any public custom-connector test:

1. Prepare a stable connector-specific privacy notice on the Claude origin
   covering collection, purpose, storage, retention, third-party transfer,
   revocation/deletion, security and contact details.
2. Obtain an explicit Product Owner/legal decision whether that separate notice
   is sufficient while the protected main-site texts remain frozen.
3. If the existing legal or privacy statements would become incomplete or
   inaccurate, do not launch under the current freeze. Obtain an exact
   exception or defer.
4. Keep the permanent SkillPilot ID, copy-source learner IDs, complete chat
   transcript, OAuth credentials and unreleased assessment content out of tool
   responses.

Claude accounts are currently restricted to adults. Therefore:

- the connector, listing, documentation and consent page are expressly 18+;
- it is not promoted as the default coach path for school-age minors;
- the ordinary SkillPilot WebGUI remains usable without Claude;
- the reviewer account contains synthetic or authorized adult test data only.

This is a product boundary, not merely a disclaimer to add after submission.

---

## 11. Connector Directory submission prerequisites

This section applies only to the independent connector-only Directory route.
It does not govern or block public plugin submission. The plugin follows its
own Anthropic Console submission flow and does not require a Team or Enterprise
publisher organization.

- **Organization access:** Team or Enterprise organization plus Directory
  management rights. A Console organization is not a substitute.
- **Public endpoint:** Anthropic provides no separate connector staging
  environment. Real-Claude acceptance uses a publicly reachable endpoint as a
  custom connector before submission.
- **Reviewer access:** a fully populated, adult, disposable learner plus the
  first-party 24-hour start procedure, expected outcomes, and safe reset
  procedure. No permanent ID or ID file is handed over.
- **Tool evidence:** every tool exercised with valid input, invalid input,
  missing scope, stale state, wrong capability and duplicate request where
  applicable.
- **Listing assets:** stable documentation and privacy URLs, support contact,
  icon, permanent slug, categories, tagline and description.
- **Authentication declaration:** OAuth CIMD, supported Claude surfaces,
  read/write scopes and connector-owned issuer accurately declared.
- **Operational readiness:** monitored health, latency and tool failures;
  revocation and rollback tested; support and security-response owner named.

The submission action itself is a portal operation, but it occurs only after
the production endpoint and reviewer state already exist and have been tested.

### 11.1 Connector versus plugin

The public SkillPilot plugin is the preferred complete installation for
eligible paid Claude Web chat users. The package under
`ai/claude/plugin/skillpilot-coach-v1/` supplies the reusable Claude-specific
coaching Skill and declares the same public remote MCP server on that surface.
Claude v1 has no hooks or subagents and claims neither Desktop Chat nor Cowork
plugin support. Each additional surface requires a separately versioned and
accepted change. Native mobile plugin support is not part of this claim.

The remote connector remains the single owner of OAuth, MCP, all twelve tools
and both MCP Apps UIs. The plugin must not copy those implementations. A plugin and Directory installation that reference the same remote MCP URL may coexist; Claude exposes one tool set for the shared server. An additional manually configured Custom Connector for that same URL is unnecessary and should be avoided.

The Connectors Directory remains a separate connector-only distribution route
with its own Team/Enterprise submission gate and is not a prerequisite for
plugin submission. A manually added Custom Connector is the pre-publication
and testing route for that same connector-only server. Directory and custom
connector compatibility may be claimed across additional Claude clients only
after fresh client evidence; those claims neither widen nor block the public
plugin scope.

The plugin has independent SemVer for compatible instruction changes; it
cannot conceal a breaking remote-connector contract, which after final
submission requires a new Product Owner decision.

---

## 12. Old beta and later cleanup

During the overlap:

- `skillpilot.claude.enabled=false` remains the master state for the old beta;
- no production test turns on its MCP transport or coach tools;
- new tokens, clients, subjects, tables, configuration and URLs are disjoint;
- the frozen `SessionSetup.tsx` wiring and `application.yml` block remain
  untouched;
- old tables remain retained.

There is no promise that cleanup becomes legal when the portal review closes.
The cleanup owner records the debt, but execution requires a fresh Product
Owner decision naming:

1. reason;
2. exact files and runtime effects;
3. target SkillPilot/OpenAI version;
4. treatment of the permanently published OpenAI `1.0.0` contract;
5. migration and rollback plan;
6. required re-review or resubmission.

Until that decision, dormant code is safer than an unauthorized cleanup.

---

## 13. Release gates

### 13.1 OpenAI compatibility and freeze gate

- `node scripts/check_openai_plugin_review_freeze.mjs` passes.
- `node scripts/openai_plugin_release.mjs verify` passes.
- `node scripts/check_skillpilot_coach_plugin.mjs` passes.
- `node scripts/check_openai_plugin_versioning.mjs` passes.
- An explicit Product Owner decision authorizes the exact shared-artifact,
  restart, edge and review/resubmission effects. Without it there is no
  production deployment while the current review freeze is active.
- Frozen OpenAI package, tool, schema, instruction, UI, fixture and edge bytes
  remain unchanged and their pinned hashes still pass.
- The backend artifact is expected to change; its dependency manifest does not
  change unless separately approved. With Claude disabled and enabled, the
  OpenAI contract fingerprint, twelve-tool catalog, two active UI resources,
  OAuth metadata, session semantics and deterministic public contract probes
  match the recorded baseline.
- The existing Spring service unit, JVM/heap limit, listener and datasource
  configuration remain unchanged. The authorized environment change adds only
  the v1 property namespace.
- The startup migration list remains unchanged unless a separately approved,
  additive and backward-compatible migration is proven necessary.
- Existing OpenAI OAuth, MCP, mTLS, widget and first-party launch contract tests
  pass before and after Claude edge activation.
- Effective nginx configuration contains the exact reviewed OpenAI vhost and
  deny include once, unchanged.
- Claude fault, timeout, malformed-request, concurrency and saturation tests do
  not change OpenAI state, exhaust shared pools, degrade OpenAI latency beyond
  the agreed threshold or make OpenAI readiness fail.
- Idle and concurrent-load measurements stay within the existing JVM memory
  limit and operator-approved RSS, heap and GC headroom. No OOM, process restart
  or unbounded growth occurs.

### 13.2 Claude.ai Directory functional and security gate

- Streamable HTTP initialization and tool discovery succeed.
- A fresh Claude.ai OAuth flow succeeds with PKCE S256.
- Connector OAuth and optional `offline_access` remain transport-only and
  cannot access a learner without a current `learningSessionId`.
- First-party start creates only a fresh opaque `spc_` learner session, valid
  for exactly 24 hours. OAuth refresh does not mint, renew or extend it.
- Every tool requires the same current learner session; missing, malformed,
  altered, expired and foreign sessions fail closed.
- No permanent SkillPilot ID, ID file or ID-file password reaches Claude,
  OAuth, MCP, logs or evidence.
- Invalid CIMD, redirect, PKCE, issuer, resource, audience, scope, token,
  refresh replay and revocation cases fail closed.
- Every tool exposes a title and truthful read/write annotations.
- Tool responses contain no permanent ID, `copySources`, token, cross-learner
  identifier, hidden exam data or unrestricted state dump.
- Level 2 Personal Curriculum writes are absent.
- Stale and duplicate state writes are rejected.
- Verified Recall uses one server-owned complete batch and one atomic result
  write.
- Exam evaluation and mastery use valid capabilities and reject replay.
- ChatGPT/Claude concurrent-write tests pass in both directions.
- Request and response bodies are absent from application, reverse-proxy,
  exception and telemetry logs.
- The populated reviewer account can exercise every submitted tool and be reset
  without affecting another learner.

The public plugin has an independent acceptance lane for eligible paid Claude
Web chat users. Local and official package validation, fresh installation,
OAuth, First-Party start, twelve-tool and two-MCP-App tests must pass on that
claimed surface. V1 claims neither Desktop Chat nor Cowork plugin support and
must expose no hooks or subagents. These plugin results do not replace, weaken
or block the independent connector-only Directory gate above.

### 13.3 Rollback gate

Rollback first disables the Claude vhost, then sets the v1 master switch to
`false` and restarts the shared service. If the artifact itself is defective,
the operator restores the immediately preceding known-good artifact and runtime
configuration before restarting. Claude-v1 token records are invalid while the
provider is disabled and are revoked or expired under the approved incident
procedure.

Because there is only one JVM, activation and rollback both restart the
ChatGPT-serving process and can cause a brief shared maintenance interruption.
This is an accepted consequence of the RAM decision and must be scheduled and
communicated; the document must not claim zero-downtime provider rollback.
Rollback does not drop shared tables, rewrite canonical learner state or edit
frozen OpenAI package/UI bytes.

---

## 14. Open gates and ownership

These answers are required before implementation advances beyond isolated
scaffolding:

| Gate | Required decision/evidence | Owner |
| --- | --- | --- |
| G1 Freeze authority | Exact shared-artifact, restart, edge and OpenAI review/resubmission decision | Product Owner/Release |
| G2 In-process isolation | Exact internal routes, chain order, bean qualifiers, beta exclusion and token-audience tests | Backend/Security |
| G3 RAM and failure budget | Baseline/loaded RSS, heap, GC, pools, latency and fault-injection evidence under the existing limit | Operations/Backend |
| G4 Canonical state | Proof that every Claude operation fits the existing facade and revision/capability rules without direct table writes | Architecture/Product |
| G5 Persistence | Whether existing provider-scoped records suffice or one additive shared migration is required | Backend/DBA |
| G6 Privacy effect | Whether a connector-specific notice is sufficient or a freeze exception is required | Product/Legal |
| G7 OAuth clients | Exact hosted and Claude Code CIMD validation policy | Security |
| G8 Edge and rollback | New vhost include, certificate, shared restart, artifact rollback and differential OpenAI smoke procedure | Operations |
| G9 Review account | Adult populated fixture, first-party 24-hour start, reset and support instructions | Product/QA |
| G10 Session boundary | Exact 24-hour expiry, `spc_` integrity, all-tool requirement and OAuth/session separation | Backend/Security/QA |

The following decisions are already made by this revision:

- learner access uses only a fresh first-party `spc_` session valid for exactly
  24 hours; the permanent SkillPilot ID and ID-file material never leave
  SkillPilot;
- OAuth and optional `offline_access` remain long-lived technical transport
  only and never select, mint, renew or extend a learner session;
- the connector runs in the existing deployable and JVM; no additional process,
  port, datasource or systemd unit is created;
- old beta stays dormant;
- public MCP/issuer origin is `mcp-claude-v1.skillpilot.com`;
- Claude v1 exposes exactly twelve tools and two content-addressed MCP Apps UI
  resources for the approved goal image and private normal flashcard practice;
- normal flashcard reviews affect scheduling only and are never mastery;
- the hosted connector adds EUR 0 to the user's provider-plan cost and has no
  institutional SLA;
- future v2-v9 hosts are not published or certificate-reserved without a
  versioning decision;
- the public SkillPilot plugin is the preferred complete installation for
  eligible paid Claude Web chat users;
- the plugin Skill is scoped to that Web surface, declares the same remote
  connector, exposes no v1 hooks or subagents and claims neither Desktop Chat
  nor Cowork support;
- the remote connector owns OAuth, MCP, all twelve tools and both MCP Apps;
- the Connectors Directory remains an independent connector-only route with
  its own Team/Enterprise submission gate and is not a prerequisite for plugin
  submission;
- native mobile plugin support is not claimed;
- beta removal is separate and never triggered automatically by portal status.

---

## 15. Verifying this concept

Repository checks:

```bash
git status --short
git rev-parse --short=10 HEAD
node scripts/check_openai_plugin_review_freeze.mjs
node scripts/openai_plugin_release.mjs verify
node scripts/check_skillpilot_coach_plugin.mjs
node scripts/check_openai_plugin_versioning.mjs
node ai/claude/plugin/skillpilot-coach-v1/check-package.mjs
node --test ai/claude/plugin/skillpilot-coach-v1/check-package.test.mjs
npm --prefix ai/claude/app test
node scripts/check_claude_connector_v1_release.mjs
git diff -- docs/deploy/claude-connector-v1-concept.md
```

Operational checks such as `nginx -T`, DNS, certificate validation, public OAuth
flows and production smokes are deliberately not implied by a repository
review. They run only in an explicitly authorized deployment window.

The parity addendum was checked against `main` at `f405abce61a3`. If a later
implementation disagrees with the repository or current Anthropic requirements,
the implementation must stop and the concept must be updated before deployment.

---

## 16. Authoritative external references

- Anthropic, connector directory submission:
  <https://claude.com/docs/connectors/building/submission>
- Anthropic, connector authentication and OAuth:
  <https://claude.com/docs/connectors/building/authentication>
- Anthropic, connector testing:
  <https://claude.com/docs/connectors/building/testing>
- Anthropic, pre-submission and tool-annotation criteria:
  <https://claude.com/docs/connectors/building/review-criteria>
- Anthropic, connector and plugin platform availability:
  <https://claude.com/docs/connectors/overview>
- Anthropic, choosing remote MCP, plugin or both:
  <https://claude.com/docs/connectors/building/what-to-build>
- Anthropic, plugin submission:
  <https://claude.com/docs/plugins/submit>
- Anthropic, using plugins in Claude:
  <https://support.claude.com/en/articles/13837440-use-plugins-in-claude>
- Anthropic, MCP Apps cross-compatibility:
  <https://claude.com/docs/connectors/building/mcp-apps/cross-compatibility>
- Anthropic, custom remote connector availability by plan:
  <https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp>
- Anthropic, current Claude plan prices:
  <https://claude.com/pricing>
- Model Context Protocol authorization specification:
  <https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization>
- Anthropic, current minimum-age requirement:
  <https://support.claude.com/en/articles/13117299-minimum-age-requirement-access-restriction>
- OpenAI, app review and publication boundary:
  <https://developers.openai.com/plugins/deploy/app-review>
- OpenAI, connecting an MCP server to ChatGPT:
  <https://developers.openai.com/plugins/deploy/connect-chatgpt>
- OpenAI, standard MCP Apps fields and methods:
  <https://developers.openai.com/plugins/build/chatgpt-ui#prefer-shared-fields-and-methods>

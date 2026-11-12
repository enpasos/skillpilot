# SkillPilot in Gemini – Integration Candidate for Controlled Testing

**As of: 6 October 2026.** This integration connects the live SkillPilot
learning logic to a Gemini Custom App and an importable coach skill. It remains
an integration candidate with pending host acceptance. The Product Owner has
since reported the ordinary production rollout of the WebGUI and shared
backend; the dedicated Gemini connection requires separate activation. The
[synthetic PoC evaluation](gemini-custom-apps-poc.md) remains preserved as a
separate historical record. Meanwhile, the separate
[integration verification log](gemini-integration-evidence-2026-10-06.json)
demonstrates skill import, live learning tools, persisted progress, and session
continuation in a new chat inside the actual Gemini web host. Testing used a
dedicated operator test profile against a separate local database, with
subject-matter task solutions submitted by the test agent. This is neither a
multi-user nor a longitudinal learning study.

The earlier direct-link check confirmed reachability of the public
learning-goal image, not image rendering inside chat. That is historical
transport evidence, not acceptance of image integration. Actual inline
rendering of the learning-goal image directly inside the Gemini chat is
required and remains unresolved. Flashcard practice, Verified Recall, exams,
and negative security cases require dedicated host acceptance in addition to
their local tests. The reported production deployment of the ordinary
SkillPilot release does not yet confirm a live Gemini connection.

For subsequent controlled test operation on `skillpilot.com`, an idempotent
installer, a dedicated gateway systemd unit, and nginx configurations have been
prepared. The
[deployment guide](https://github.com/enpasos/skillpilot/blob/main/deploy/gemini-v1/README.md)
documents the private secrets, additions to the existing Spring configuration,
TLS, and the exact measured Google callback. This preparation does not activate
any production services. The ordinary rollout also verifies the unmodified
skill ZIP both during the build and via the public download endpoint; receiving
HTML at that URL is treated as an error.

### Publicly Verified Rollout State on 6 October 2026

Following the Product Owner's report, a read-only verification confirmed public
WebGUI version `9e16b50f6972e130b0e62e545eddf83f50fc23d3`, built at
**11:22:53 Berlin time (CEST, UTC+2)**, with `dirty=true` in the version
metadata. Shared readiness responded with HTTP 200 and `status=UP`. The Gemini
skill download responded without redirect with HTTP 200,
`Content-Type: application/zip`, and 9,391 bytes. The executable download
checker confirmed the unchanged SHA256
`2a5f5de47cd04345196cd21f0ab4dc4e0b3247b509a9deaaa0e2f8cd74d30a40`.

At the designated gateway `https://mcp-gemini-v1.skillpilot.com`, however,
health, OAuth metadata, resource metadata, and MCP failed strict TLS
verification: the certificate served is not valid for that hostname. This check
verifies the public frontend and download state as well as shared readiness; it
identifies neither the running backend build nor activation of the Gemini lane.
A stable gateway connection and inline image rendering in the actual Gemini
chat remain pending. Historical local verification logs and package hashes were
left untouched.

An additional test using a start message actually generated and copied in the
WebGUI initially achieved successful OAuth renewal, initialization, and tool
listing, without invoking context retrieval. Gemini claimed it lacked tool
access. After explicitly re-selecting **@SkillPilot**, at **02:17:25 UTC** the
host read the correct state 10 and the active successor goal without altering
learner progress. This remains an observed host dispatch miss without an
established root cause. Never paste raw backend JSON into the chat as a
workaround; re-select the app and repeat the real context call.

During subsequent local user testing on **6 October 2026**, the Product Owner
reported that tool access works via **Gemini Spark BETA**. The gateway
confirmed the context call at **08:57:40** and the renderer call at
**08:57:50**, both **Berlin time (CEST, UTC+2)**, with HTTP 200 and a
successful tool response. In the supplied screenshot, the learning-goal image
is missing. The model's explanation there of a "render error" ("Renderfehler")
is not evidence of a server fault. Required inline image display directly
inside the chat remains unresolved. Earlier at **08:52 Berlin time**, a
controlled regular Gemini chat had successfully loaded the learning context.
Spark is therefore an observed alternative when tool access is missing, not a
proven prerequisite across all accounts. Historical verification logs and
package hashes remain unchanged; this follow-up run does not supersede their
findings.

Additional private, read-only transport checks on the same day used an
unmodified small SkillPilot PNG of **2,858 bytes**. In a regular Gemini chat,
the isolated MCP server returned a native `ImageContent` block at
**09:45:50 UTC**, and at **09:52:33 UTC** returned the same image block with
`annotations.audience = ["user", "assistant"]`. At **10:01:01 UTC**, a further
check placed the same annotated image ahead of the unchanged text block. In
each case, the SDK check confirmed the exact original image bytes; all three
host responses completed, yet none rendered a visible image. Gemini's claim
that the tool returned text only contradicts the verified server response and
does not localize the fault. Reordering the blocks likewise did not produce
image display. Separate Spark diagnostic tasks did not reach a verifiable
image-tool invocation within the bounded test windows; consequently, they
neither confirm nor rule out this image format in Spark. These checks read no
learning session and mutate no learner state. Neither the product adapter, the
coach archive, nor the canonical learning-goal images were modified for them.

## Components and Boundaries

| Component | Responsibility |
| --- | --- |
| `ai/gemini/coach/SKILL.md` | Functional coach instructions, Apache-2.0 |
| Gemini Custom App **SkillPilot** | Registered MCP tools operating on canonical learner progress |
| `ai/gemini/gateway` | Dedicated OAuth gateway and signed loopback-only backend bridge |
| Gemini learning session `spg_…` | Dedicated short-lived session; permanent learner ID stays in the backend |
| `CoachToolFacade` and `CoachStateProjection` | Shared learning logic and safe model projections |
| WebGUI **Lernen starten → Gemini (Beta)** ("Start learning → Gemini (Beta)") | Prepares a dedicated learning session and hands off the start message |

Gemini maintains its own OAuth connections, capabilities, sessions, and replay
records. Authorized providers operate against the same canonical learner
profile; there is no second mastery database. Existing Claude/OpenAI packages
and published UI resources remain untouched. Learner answers, chat transcripts,
and model reasoning are never sent to SkillPilot.

The Gemini adapter returns text/JSON responses and describes cleared
learning-goal images via URL and alt text. Direct inline host rendering remains
open. It assumes no Claude or ChatGPT HTML widgets. Ordinary flashcard practice
uses separate answer reveal and explicit self-grading; Verified Recall and
exams retain their protected answer boundaries.

## Building and Setting Up the Coach Skill

```bash
python3 ai/gemini/coach/scripts/package_skill.py --frontend
python3 ai/gemini/coach/scripts/test_package.py
```

The reproducible ZIP archive is written to
`ai/gemini/coach/dist/skillpilot-coach-v1-0.1.0.zip`. It contains exclusively
`SKILL.md` and `LICENSE.txt` at the archive root. `LICENSE.txt` contains the
exact bytes of the Apache-2.0 `LICENSE` file in the repository. The manifest
records source and ZIP hashes and contains no credentials. The ordinary
frontend build automatically stages the download at
`/plugins/gemini/skillpilot-coach-v1-0.1.0.zip`. The actually imported archive
is preserved under `ai/gemini/coach/artifacts/`. Staging verifies its pinned
hash and member sources and copies the unmodified archive bytes, ensuring
compression does not depend on the deployment host's Python/zlib version. Any
edit to the skill file requires a new versioned candidate and a full re-import
test in Gemini.

Actual Gemini import of the initial local ZIP candidate was rejected on
6 October 2026 with an unsupported file-type error. That archive contained an
extensionless `LICENSE` entry. The corrected candidate names those exact
license bytes `LICENSE.txt`; `.txt` is among the file extensions supported by
the importer. The missing file extension is a plausible explanation for the
observed error, not a confirmed root cause. The subsequent host retest
confirmed the corrected candidate; the initial rejection remains preserved as a
historical finding.

The **corrected skill ZIP import is confirmed in the actual Gemini host**: on
**6 October 2026 at 01:17:28 UTC** via **Upload skill → files → ZIP → Save
skill**. The saved skill `skillpilot-coach-v1` appeared in the skill library at
**01:19:30 UTC**. The imported editor contained 13,690 characters of coach
instructions, including the memory/mastery tool contract. Its content hash
matches the canonical skill text after stripping frontmatter and trimming outer
whitespace. The actually tested ZIP hash is
`2a5f5de47cd04345196cd21f0ab4dc4e0b3247b509a9deaaa0e2f8cd74d30a40`. This
confirms both the import and the stored instructions. Subsequent separate host
checks demonstrated an ordinary learning launch with skill and app, a
successful mastery write after solving a subject-matter task, and retrieval of
that same persisted state in a new chat. The retest using the corrected
renderer bytes persisted the next achievement (`stateVersion=10`) at
**01:59:31 UTC** and loaded it in another new chat at **02:02:53 UTC**.
Independent canonical state queries confirm exactly one newly mastered goal in
each case.

Google rolls out Skills gradually. For Custom Apps, Google currently lists a
personal account aged 18+, US access, English, and **Keep Activity** enabled.
Account eligibility must be verified prior to beta testing. See
[Google: Custom Apps](https://support.google.com/gemini/answer/17209137?hl=en-12)
and
[Google: Import skills](https://support.google.com/gemini/answer/17094296?hl=en).

There is currently **no public beta onboarding**. Running a controlled test
requires setting up the gateway, its reachable HTTPS endpoint, and your own
private OAuth client credentials. A backend rollout alone does not provision
this connection. Setup is documented under
[Gateway and Spring Adapter](#starting-the-local-oauth-gateway-and-spring-adapter);
selecting **Gemini (Beta)** in the WebGUI provides neither general user access
nor shared credentials.

1. In Gemini Web, open **Settings → Connected Apps → Custom apps → Add a custom
   app**. When no app has been connected yet, Google labels the URL input **Add
   a custom app link to get started**. Enter the HTTPS MCP server URL of your
   own prepared test environment. For the fixed confidential OAuth client, open
   **Advanced features → Show more**; in the observed test dialog this section
   was labeled **Additional settings**. Enter your own Client ID and Client
   Secret from your private test configuration there, select **Next**, and
   complete sign-in/consent for **SkillPilot**. In the final **Save your custom
   app** dialog, enter the name **SkillPilot** and click **Connect** once more.
   The app is saved only once it appears under **Custom apps**. Google
   documents these advanced connection settings generically as "credentials"
   without naming the individual field labels. Never copy live secrets,
   callback URLs, or temporary server URLs into public documentation.
2. Import the ZIP archive under **Gemini Settings → Skills**.
3. In SkillPilot, finish setting up the learner profile and personal learning
   plan, select **Gemini (Beta)**, and prepare a learning session.
4. Open a new Gemini chat, select `skillpilot-coach-v1` using **/**, and select
   the **SkillPilot** Custom App using **@**. If tools are unavailable in a
   regular chat and the account offers **Gemini Spark BETA** or **Switch to
   Spark**, switch to that mode and re-select both skill and app there. Then
   paste and send the complete prepared start message. Google rolls out Skills
   gradually; existing tests do not establish a general requirement to use
   Spark.
5. Only successful tool responses count as persisted progress. Gemini may
   prompt for **Allow** on write calls; choosing **Deny** must leave learner
   progress unchanged.

A successful renderer call does not confirm inline image rendering in chat. The
integration requires actual display of the learning-goal image directly inside
the Gemini host; this integration boundary remains open.

The UI opens strictly `https://gemini.google.com/app?hl=en` without passing
session keys as URL parameters. The start message stays in transient UI state
and is copied only upon an explicit click. Switching providers, changing the
profile or learning plan, or navigating away discards the displayed session.

## Backend Contract

```text
POST /api/ui/learners/{skillpilotId}/gemini/v1/launch
Body: {"communicationLocale":"de"|"en","client":"web-start"}
Response: {"prompt":"…","webUrl":"https://gemini.google.com/app?hl=en",
           "learningSessionId":"spg_…","expiresAt":"…"}
```

The provider is disabled by default and requires explicit local configuration
under `skillpilot.gemini.connector.v1`. The internal MCP route is
`/gemini/v1/mcp`; the intended public resource identifier
`https://mcp-gemini-v1.skillpilot.com/mcp` is a configuration target, not proof
of an active deployment. Root origin, audience, OAuth profile, callback, and
gateway trust must match the specific HTTPS environment under test. Failed
authentication must never fall back to another provider or a public client.

Each session has an absolute 24-hour lifetime. Tool calls require at least one
hour of remaining lifetime; therefore start a new learning session after at
most 23 hours. OAuth token renewal does not extend the session. To continue in
a new chat, re-select the skill and app, send the still-valid start message,
and load fresh context. Once expired, prepare a new session in the WebGUI.
Canonically persisted progress is retained; chat availability and session
validity are independent.

The session locale persisted in the backend governs coaching language. Neither
the English Gemini UI nor the language of the instructional material overrides
that session locale. Learning-plan status applies to the server-selected day or
week; weekly planning is the default.

## Starting the Local OAuth Gateway and Spring Adapter

The current architecture consists of a Node.js gateway and the Spring adapter:

```text
Gemini Custom App
  → configured HTTPS origin /mcp
  → Node gateway on 127.0.0.1:8795
  → signed POST request to 127.0.0.1:8080/gemini/v1/mcp
  → canonical SkillPilot learning logic and separate development database
```

Prerequisites: **Node.js 22.22.0**, **Amazon Corretto 25** matching
`.java-version`/`.corretto-version`, Python 3 for building the skill, and a
separate local development database. Never connect test backend runs to a
production database or reuse existing production credentials. Public HTTPS
ingress must reach exclusively the gateway; Spring and private configuration
stay local. A temporary HTTPS URL is acceptable provided it outlives the test
run. Changing the address requires a new origin, a new audience, a matching
strictly measured callback, and reconnecting Gemini. A static VPN IP is not
required.

### Private Gateway Configuration

Prepare the following files under `ai/gemini/gateway/.runtime/`. That directory
is Git-ignored and receives mode `0700`; all files inside receive mode `0600`.
Store values exclusively in private local configuration.

| File | Contents |
| --- | --- |
| `connection.json` | Non-public origin and fixed client profile; schema below |
| `operator-key` | Random secret key for the local OAuth consent page |
| `client-secret` | Dedicated random secret for the strictly configured confidential client |
| `gateway-secret` | Dedicated secret of at least 32 bytes, shared solely between the gateway and the Gemini Spring adapter |
| `gemini-callback.txt` | One fully measured, strictly allowlisted redirect URI per line |

`operator-key`, `client-secret`, and `gateway-secret` must all be distinct.
Never reuse OpenAI or Claude secrets. The gateway secret also differs from the
Gemini session-signing and capability secrets in the backend. Consent is
authorized via `operator-key`, never via a permanent learner ID. Google
callbacks may contain an account identifier and must remain private.

Schema of `connection.json`, shown with a **purely illustrative origin**:

```json
{
  "origin": "https://gemini-beta.example.org",
  "clientId": "skillpilot-gemini-beta",
  "clientAuthMethod": "client_secret_post",
  "allowRefreshResourceOmission": false
}
```

`origin` is the actually configured HTTPS origin without path, query, or
fragment. It must match the backend audience `<origin>/mcp` exactly.
`clientAuthMethod` is a fixed profile—either `client_secret_post` or
`client_secret_basic`—never an automatic fallback after an authentication
failure. The measured Gemini PoC profile used Post. The executable gateway
enables neither DCR nor a public OAuth client.

`allowRefreshResourceOmission` is a true JSON boolean, never the string
`"true"` or `"false"`. The default `false` requires the resource parameter on
token refresh as well. Setting the explicit compatibility flag `true` accepts
only the complete omission of `resource` on an already validated, unexpired
refresh grant bound to that same single audience. Any differing, empty,
duplicate, or malformed resource remains rejected. This option exists solely
for the actually measured Gemini refresh behavior; it does not relax any other
provider.

Let an unknown callback be rejected first. Capture its complete URI privately
solely from your own active connection attempt, inspect it, and pin it as an
exact entry. For unknown callbacks, the audit log records only origin and
fingerprint. Callbacks are never guessed or permitted via wildcard hosts,
account ranges, or URL prefixes. After updating the callback file, restart the
gateway and reconnect Gemini.

### Private Spring Configuration

Explicitly enable the adapter and point all public URLs at that same actual
HTTPS origin. Example private supplemental Spring YAML file; replace secret
placeholders with dedicated local secrets or inject them via a private secret
mechanism:

```yaml
server:
  address: 127.0.0.1
  port: 8080
skillpilot:
  gemini:
    connector:
      v1:
        enabled: true
        public-base-url: https://gemini-beta.example.org
        public-mcp-url: https://gemini-beta.example.org/mcp
        public-resource-metadata-url: https://gemini-beta.example.org/.well-known/oauth-protected-resource/mcp
        public-auth-server-metadata-url: https://gemini-beta.example.org/.well-known/oauth-authorization-server
        public-documentation-url: https://enpasos.github.io/skillpilot/deploy/gemini-integration/
        gateway-audience: https://gemini-beta.example.org/mcp
        gateway-secret: ${GEMINI_GATEWAY_SECRET}
        signing-secret: ${GEMINI_SESSION_SIGNING_SECRET}
        capability-secret: ${GEMINI_CAPABILITY_SECRET}
```

Also configure the separate local database. Each of the three backend secrets
must be 32–4096 characters without whitespace and distinct both from one
another and from other provider secrets. Only `gateway-secret` matches the
identically named private gateway file. `enabled: true` is a YAML boolean;
alternatively, `SKILLPILOT_GEMINI_CONNECTOR_V1_ENABLED=true` enables the
adapter via Spring environment binding. Missing or inconsistent settings
prevent startup. When the adapter is disabled, no Gemini learning-session or
MCP routes and no active Gemini database repositories exist.

By contrast, the global `skillpilot.public-base-url` property designates the
public SkillPilot origin used for Cockpit and canonical asset links, not the
Gemini gateway. For learning-goal images, that origin must serve valid public
HTTPS assets under `/assets/goal-visualizations/…`. The current Gemini renderer
returns validated image URLs derived from it. That does not confirm inline
image display in Gemini chat. A private `localhost` origin cannot render images
in the remote Gemini host. During local testing, already public assets may be
used while learner profiles, learning sessions, and writes remain isolated in
the development database.

Mount the supplemental private file via
`SPRING_CONFIG_ADDITIONAL_LOCATION=file:/…`. Then start the backend process
using the pinned JDK and launch the gateway in a second process:

```bash
cd ai/gemini/gateway
npm ci --ignore-scripts
npm test
GEMINI_GATEWAY_PORT=8795 \
GEMINI_BACKEND_MCP_URL=http://127.0.0.1:8080/gemini/v1/mcp \
npm start
```

The gateway environment variables select only the listening port and the exact
loopback upstream. OAuth booleans are read from the private JSON file, never
from shell string values. `npm start` reads the private files and binds to
`127.0.0.1`; it neither generates nor exposes credentials.

### OAuth and Transport Lifetimes

The gateway serves `/mcp`, `/authorize`, `/consent`, `/token`, `/revoke`,
`/health`, `/privacy`, and OAuth metadata under `.well-known`. Configure the
Custom App with the public `<origin>/mcp` URL and your exact confidential
client profile via Gemini **Advanced settings**. On the consent page, enter the
private operator key and follow the returned link back to Gemini. The published
default Spring domain name is not proof of a provisioned environment.

The gateway accepts strictly `skillpilot.read skillpilot.write`; it offers no
silent scope fallback. Authorization code: 120 seconds, single-use; consent
session: 5 minutes; access token: 5 minutes; refresh family: 1 hour absolute
with rotation and reuse revocation. OAuth grants live in gateway memory and are
lost on restart. After a gateway restart or grant expiration, the Custom App
must be reconnected. Independently of transport grants, the learning session
remains valid for at most 24 hours; establishing a new transport connection
does not extend it.

Every forwarded MCP request receives a fresh HMAC-SHA256 assertion valid for 30
seconds. It binds audience, OAuth connection, scopes, HTTP method, exact
internal path, and the SHA256 digest of the raw request body bytes. Spring
accepts loopback traffic only, verifies the signature, and rejects replays. The
user's OAuth bearer token is never forwarded to Spring. The gateway assertion
does not identify a learner; `spg_…` remains required for that. Native Spring
JSON or single-event SSE responses are normalized into a bounded JSON MCP
response without assuming HTML widgets.

This gateway is an **operator-managed single-account profile for controlled
integration testing**. It is not an accepted public multi-tenant service. Any
public multi-user beta requires dedicated per-account onboarding, appropriate
client registration, durable grant storage, and separate acceptance. Neither
the current operator key nor the client secret may be distributed to general
users.

## Production Rollout and Subsequent Activation

A backend rollout after passing CI installs the new provider lane first. **On
its own, it does not yet expose a Gemini connection.** The standard
[deployment entry point](deployment.md) `./deploy_skillpilot.sh` builds the
WebGUI, the skill download, and the shared Spring backend. It neither installs
nor starts a Node gateway, and provisions no Gemini hostname, TLS endpoint, or
OAuth client. Swapping only the Java artifact also does not deploy an updated
WebGUI.

| Stage | Actual Effect |
| --- | --- |
| New backend, Gemini still disabled | New database tables created; no Gemini beans, security chain, schedulers, or routes active |
| Additional WebGUI build | Gemini option and skill download present; preparing a learning session still requires the enabled backend adapter |
| Gemini adapter properly enabled | First-party launch and internal MCP route available; public OAuth and MCP additionally require the gateway |
| Gateway, HTTPS, and strictly pinned callback configured | Connection testable for the controlled operator account; no automatic multi-user onboarding |

Liquibase runs additive changeset `039-add-gemini-connector-v1` even while
Gemini remains disabled. It creates exclusively `gemini_v1_learning_session`,
`gemini_v1_session_idempotency`, their indexes, and foreign keys. It migrates
no existing learners, mastery records, OAuth grants, or Claude/OpenAI sessions.
Use the standard PostgreSQL backup procedure prior to the routine backend
rollout, then verify the applied changeset in the Liquibase ledger. In Java
defaults, the Gemini lane is set to `enabled=false`; every active bean carries
that same activation condition. `GeminiV1DisabledContextTest` verifies the
absence of operational beans and MVC routes when disabled, while
`GeminiV1RuntimeValidationTest` verifies startup rejection on missing secrets,
foreign audiences, and inconsistent public URLs. These local tests are neither
production acceptance nor Gemini host acceptance.

### Concrete Operator Sequence

1. Record the approved commit and its passing CI checks, then deploy via the
   existing deployment entry point while keeping Gemini disabled initially.
   Verify shared readiness and existing providers.
2. Provision a dedicated, persistently reachable HTTPS origin with a valid
   certificate. For ongoing operation, OAuth issuer, resource identifier, and
   callback should remain stable; a static VPN IP is not required. Never treat
   the example domain name as a live service.
3. Install the Node 22 gateway from that exact verified commit in the **same
   network namespace** as the existing Spring backend. On a standard host, both
   processes can run side by side. Separate containers require an explicitly
   shared network namespace; two independent containers on the same host do not
   share loopback. The upstream remains the exact HTTP loopback URL
   `http://127.0.0.1:<existing-backend-port>/gemini/v1/mcp`.
4. Provision the five dedicated secrets privately: Gemini session signing,
   Gemini capability, gateway assertion, operator consent, and confidential
   OAuth client. Use at least 32 random bytes per secret and never overwrite an
   existing provider secret. Only the assertion secret is shared between the
   Gemini gateway and the Gemini Spring adapter. Gateway runtime files reside
   under `.runtime/` **inside the installed gateway copy**; the CLI exposes no
   custom config-directory flag. File ownership and permissions must grant read
   access to the gateway process without making the files world-readable.
5. Configure the `skillpilot.gemini.connector.v1` block from the supplemental
   Spring configuration above using the chosen origin. **Do not** copy the
   local example `server.address`, `server.port`, or a development datasource
   onto existing production. The adapter shares the production datasource and
   canonical learning logic with the existing backend while keeping its session
   and replay tables isolated.
6. Install the supplemental YAML file with read permissions for the actual
   Spring service and wire it via
   `SPRING_CONFIG_ADDITIONAL_LOCATION=file:/…/gemini-v1.yml` inside the
   existing systemd `EnvironmentFile` (typically
   `/etc/skillpilot/skillpilot.env`), preserving any already configured
   supplemental locations. The YAML placeholders expect `GEMINI_GATEWAY_SECRET`,
   `GEMINI_SESSION_SIGNING_SECRET`, and `GEMINI_CAPABILITY_SECRET` there; the
   gateway secret file uses that first value. Set `enabled: true` only once
   configuration is complete. Because Spring aborts startup of the shared
   process on invalid settings, verify the exact configuration before
   restarting. Never echo secret values to shell output or release logs.
7. Start the gateway as a dedicated supervised Node process, check loopback
   health, and route the dedicated HTTPS virtual host exclusively to this
   gateway. Then verify public health/OAuth metadata and the exact resource
   identifier `<origin>/mcp`.
8. Using the designated operator Gemini account, let the unknown callback fail
   once, capture it privately from that connection attempt, and pin it strictly.
   Restart the gateway, reconnect the Custom App, import the skill, and launch
   a fresh WebGUI learning session using a test profile. Only real tool calls
   and canonical state checks confirm live operation.

The gateway itself binds strictly to `127.0.0.1`; `GEMINI_GATEWAY_PORT` and
`GEMINI_BACKEND_MCP_URL` select its port and upstream. No non-loopback backend
URL is permitted. Existing global listener, forwarded-header, datasource,
OpenAI, and Claude settings require no modification for Gemini. The edge proxy
must never expose `/gemini/v1/**` publicly on Spring. On the dedicated Gemini
HTTPS virtual host, keep the following gateway paths unchanged and return `404`
for all other paths:

```text
/mcp
/authorize  /consent  /token  /revoke
/health  /privacy
/.well-known/oauth-authorization-server
/.well-known/oauth-protected-resource
/.well-known/oauth-protected-resource/mcp
```

Never repurpose the existing OpenAI or Claude virtual host for Gemini. Proxy
and service logs must never record `Authorization` headers, request/response
bodies, or full OAuth query strings; path, method, and status code suffice for
access logs. Query strings on `/authorize` carry private state and callback
values. The current gateway runs as a single operator process without shared
multi-instance OAuth storage. Restarts clear its in-memory grants, and even
without a restart the account must reconnect after at most one hour. This
operational boundary continues to apply after a production rollout.

To roll back activation, disable the dedicated Gemini virtual host, stop the
gateway, and set `enabled: false` in the supplemental Spring Gemini block; then
restart the shared backend process normally. Existing learner data and the
additive database tables are preserved. Restarting the gateway neither rolls
back mastery nor extends any learning session.

## Local Verification and CI

```bash
# Node 22.22.0 in PATH
npm --prefix ai/gemini/gateway test
python3 ai/gemini/coach/scripts/test_package.py
npm --prefix app run test:gemini-v1-start
```

Backend with the repository-pinned Corretto:

```bash
cd backend
./gradlew test --console=plain --tests 'com.skillpilot.backend.connectors.gemini.v1.*Test'
```

The `.github/workflows/gemini-integration.yml` workflow verifies gateway OAuth
and assertion transport, the complete Gemini backend test namespace, ordinary
GUI launch in Chromium, the unchanged Claude handoff, the TypeScript/Vite
build, and the reproducible skill ZIP including byte-identical download.
Backend test reports must include every Gemini test class with zero skips.
Because this workflow runs without a Google account, private connection, or
live Gemini session, it provides strictly local verification evidence.

## Pre-Release Acceptance

Local tests are not Gemini host evidence. Prior to any general release, the
exact tested package must demonstrate the following flows inside a real Gemini
account:

- connect the Custom App, complete OAuth token renewal, and execute live tool
  calls;
- imported skill governs learning launch initiated from the ordinary WebGUI;
- live learning context, authorized task, sufficient independent learner
  evidence, confirmed mastery write, and matching progress in the Cockpit;
- follow-up task or backend-selected successor goal presented only after
  recognizable learner agreement, with the learning-goal image rendered inline
  directly inside the Gemini chat;
- reload that exact persisted state in a new chat;
- user denial, retries, expired sessions, and version conflicts neither mutate
  nor overwrite unauthorized learner state;
- ordinary flashcards, Verified Recall, and exams enforce their respective
  answer-reveal and grading boundaries.

For every acceptance record, capture package/source hash, actual host,
timestamp, tool status, and canonical state transition. Never publish tokens,
callbacks containing account IDs, chat transcripts, learner answers, or
permanent learner IDs. The new-chat dispatch miss observed in the synthetic PoC
remains documented as a historical failure without a proven root cause.
Subsequent integration testing passed controlled repetitions against a healthy
endpoint with re-selected skill and app using the same original learning
session. Live context calls loaded the persisted state and surfaced the right
successor goal. That proves the verified flow under test, not a general
availability guarantee across other accounts or future host versions.

The Product Owner has explicitly authorized controlled production test
operation and handles the production deployment. Neither that authorization nor
the reported routine rollout substitutes for gateway or Gemini host acceptance.
Public multi-user beta, portal publication, and changes to existing provider
credentials remain separate decisions.

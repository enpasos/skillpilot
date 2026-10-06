# Gemini Custom apps PoC — 0.1.0

Isolated, disposable MCP canary for [SkillPilot issue #70](https://github.com/enpasos/skillpilot/issues/70).
It tests the proposed **normal Gemini web app → Custom app → remote MCP** path.
It makes no model API calls and contains no real learner data or course.

**Result (6 October 2026):** The final local suite passed **36/36 tests** on
Node.js **22.22.0**; the current local smoke at **00:34:08 UTC** is
**PASS_LOCAL_ONLY**. The historical 5 October suite had **27 tests**.
The signed-in, English Gemini Consumer Web app on the US Mullvad route completed
OAuth (`/token` 200), native MCP `initialize` and `tools/list` with protocol
**2025-11-25**; its Save custom app dialog displayed all three tool names, and
the app was saved as **SkillPilot PoC**. The explicit refresh correction below
passed the real host retest at **00:31:16 UTC**; actual Status/Context calls
and a correct model reply followed at **00:31:35–36 UTC**, state 0. Denying
Gemini's write approval at **00:32:26 UTC** left state **0 → 0** with no
Completion call. Confirmed write and persistence were tested separately:
on the new origin, Pro reads passed at **00:43:35–47 UTC**, manual Allow was
clicked at **00:44:30 UTC**, and the
actual Completion call returned **200**, state **1**, at **00:44:33.823 UTC**.
A fresh store and disk read at **00:44:51 UTC** verified persisted completion.
After a second manual Allow at **00:45:43 UTC**, the actual replay at
**00:45:47.233 UTC** kept state **1** and the identical original receipt,
verified on disk at **00:45:48.695 UTC**. Core technical viability is **PASS**.
New-chat attempts at **00:46:23–25 UTC** and **00:48:35–36 UTC** both had
native `initialize`/`tools/list` 200 on the new origin, but model tool
nonavailability or a generic error and no `tools/call`:
**FAIL_OBSERVED_CHAT_DISPATCH**, cause unconfirmed. Reliable new-chat recovery
and the complete acceptance matrix are **NOT_PROVEN**. This PoC assessment is
complete; a full Gemini adapter, learning flow and Issue #70 integration remain
separate work. Fresh-login reproducibility, Skill import, interrupted writes,
revocation and US beta onboarding remain **NOT_RUN**.
The earlier stale-tunnel attempts are
**TRANSPORT_CONFOUNDED**, not evidence of a Gemini defect.
Automated local/public HTTPS writes prove only the synthetic client path.
The [German plan and acceptance record](../../../docs/deploy/gemini-custom-apps-poc.md)
separates those evidence levels. A synthetic saved marker is not mastery.

## Local execution

Requirements: Node.js **22+**, npm, Python 3 for the optional ZIP builder.

```bash
cd ai/gemini/poc
npm ci
npm test
npm run smoke
npm run package:skill
npm start
```

If the system Node is older, `npm exec --yes --package=node@22.22.0 -- node`
provides a temporary Node 22 executable; use it for `--test test/*.test.mjs`,
`scripts/smoke.mjs`, or `server/cli.mjs` instead of changing the system runtime.
Dependency installation uses `npm ci --ignore-scripts` in that case.

Default endpoint: `http://127.0.0.1:8793/mcp`; health: `/health`.
Only loopback HTTP is allowed. Startup generates independent private secrets
under ignored `.runtime/`, with directory mode 0700 and file mode 0600:

- `operator-key`: authorize this disposable test app and create test sessions.
- `client-secret`: the preregistered confidential PoC client credential.
- `connection.json`: local/public connection settings.
- `probe-state.json`: disposable synthetic markers and session bindings.
- `events.jsonl`: redacted request/auth/tool events; no bodies or capabilities.

The server starts with **no permitted callback**. Unknown OAuth callbacks fail
closed. This permits discovery of the actual Gemini callback without guessing
one or weakening a production provider. Tokens/registrations are memory-only:
restarting requires reconnecting OAuth, while saved synthetic sessions survive.
Session validity is absolute 24 hours; reads, writes and replays require at
least one hour remaining. OAuth never selects or extends a probe session.

The preregistered client defaults to `client_secret_basic`. Actual Gemini used
`client_secret_post`, selected explicitly with
`POC_CLIENT_AUTH_METHOD=client_secret_post`. Discovery advertises the selected
method, and token/revocation requests must use it; there is no authentication
fallback. Keep the exact observed callback in private runtime configuration:
`connection.json` can contain that account-bound URI and must never be published.

Resource checks default to strict. For the measured Gemini refresh omission,
explicitly enable `POC_ALLOW_REFRESH_RESOURCE_OMISSION=1`; the configuration
option `allowRefreshResourceOmission` defaults to `false`, and private
`connection.json` records its boolean value. Only a **truly absent** `resource`
on a valid, unexpired refresh grant owned by the authenticated client may then
inherit that grant's sole original audience. Wrong, empty, malformed or
duplicate resource values still fail. Authorization and code exchange always
require the exact resource; scope, expiry, rotation, reuse and revocation
guards remain unchanged.

[MCP 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#resource-parameter-implementation)
requires clients to include `resource` in authorization and token requests.
The observed Gemini refresh deviates from that requirement. This explicit
single-audience policy uses the original grant binding described by
[RFC 8707 §2.2](https://www.rfc-editor.org/rfc/rfc8707.html#section-2.2);
it is bounded OAuth interoperability, not proof of Gemini MCP conformance.

`npm run smoke` starts its own ephemeral **local automated MCP client**, performs
OAuth/PKCE and a genuine persisted write, checks an exact replay and a later
read, and writes a redacted `.runtime/local-smoke.json`. It does not invoke
Gemini or prove its confirmation UI. `npm run session` creates a fresh session
in the separately running server and saves its private prepared start prompt.

## Remote endpoint preparation

Gemini needs a reachable HTTPS test origin. Use a dedicated test hostname and
reverse proxy to this loopback process. Forward `/mcp`, `/.well-known/*`,
`/authorize`, `/consent`, `/token`, `/revoke`, and optionally `/register` without
rewriting their paths; never log OAuth queries, authorization headers or bodies.
Keep `/operator/*` accessible only locally. No production SkillPilot process,
OAuth issuer, DNS or secrets need modification. This workspace run does not
publish or deploy the service.

```bash
POC_PUBLIC_ORIGIN=https://YOUR-DEDICATED-TEST-ORIGIN npm start
```

The public origin must be canonical HTTPS with no path, credentials or query.
`POC_BIND=0.0.0.0` is allowed only with an explicit HTTPS public origin (for a
container behind its TLS proxy). TLS termination and deployment are outside
the local protocol acceptance claim.

### Temporary HTTPS endpoint on 6 October 2026

The test endpoint observed after the **00:42 UTC** tunnel rotation is:

`https://840518030c40a1.lhr.life/mcp`

It uses an anonymous **localhost.run SSH tunnel on port 22** through the existing
loopback proxy `http://127.0.0.1:8794`, implemented by `server/public-proxy.mjs`.
The proxy forwards only the exact public protocol routes and blocks
`/operator/*` before the backend. It logs no requests. No SSH agent or personal
identity file, account signup or permanent domain is needed for this route.
See [localhost.run's tunnel instructions](https://localhost.run/docs/).

To reproduce with a fresh tunnel, run the proxy and SSH command in separate
terminals from `ai/gemini/poc`:

```bash
npm run proxy
```

```bash
install -m 700 -d .runtime
ssh -F /dev/null -p 22 \
  -o IdentityAgent=none -o IdentityFile=/dev/null -o IdentitiesOnly=yes \
  -o PasswordAuthentication=no -o KbdInteractiveAuthentication=no \
  -o UserKnownHostsFile=.runtime/ssh-known-hosts \
  -o StrictHostKeyChecking=accept-new -o ExitOnForwardFailure=yes \
  -o ServerAliveInterval=30 \
  -R 80:127.0.0.1:8794 nokey@localhost.run
```

Read the printed HTTPS origin, then start the server in another terminal.
For an **automated HTTPS smoke only**, use the synthetic callback:

```bash
POC_PUBLIC_ORIGIN=https://NEW-TUNNEL-HOST \
POC_REDIRECT_URIS='http://127.0.0.1:8795/synthetic-local-callback' npm start
```

With those services running, `npm run smoke -- --remote` repeats the external
HTTPS check using private local credentials and creates only a synthetic
session. Session creation uses the loopback operator endpoint. The report
`.runtime/https-smoke.json` explicitly states `actualGeminiHost: false`.
Stop the three processes with Ctrl-C; no system service or startup job is added.

A permanent address is unnecessary, but the OAuth issuer/resource origin and
exact callback pin must remain stable for each test window. Anonymous tunnel
hostnames rotate and have no uptime guarantee; after rotation update
`POC_PUBLIC_ORIGIN`, restart and reconfigure/reconnect the Gemini Custom app.
Use the actual private callback and explicit client method for the host test
below, rather than the smoke callback.

The earlier `https://d487fefc13b041.lhr.life` returned health **502** around
**00:41–42 UTC**; the tunnel announced the new origin above. Fresh-app/Pro-model
failures against the stale origin are **TRANSPORT_CONFOUNDED** and cannot be
attributed to Gemini. Verify `/health` and the current announced origin before
each acceptance step. At the new origin, the exact S256 callback was observed
and privately pinned at **00:42:36 UTC**; code exchange, refresh and native
discovery passed at **00:42:43–46 UTC**. Pro reads subsequently passed at
**00:43:35–47 UTC**, followed by the confirmed
write and persistence check above. Earlier model nonavailability after a valid
Context 200 has no confirmed cause; do not infer that denial caused it.

The 5 October Cloudflare Quick Tunnel at
`https://essential-christopher-dancing-gore.trycloudflare.com/mcp` is historical
**PASS_HTTPS_ONLY** evidence for automated consent/PKCE/token/MCP/write/read/replay
and public operator 404. Its executable/download receipt remains in ignored
`tmp/gemini-poc/`, outside the package. On the US route, Cloudflare's port 7844
was unreachable; anonymous localhost.run domains also rotated. Those transport
events do not establish Gemini errors. The PoC remains stateless Streamable
HTTP with JSON responses and standalone MCP GET returns 405.

## Actual Gemini test

1. First verify the maintainer's personal test account in the normal web app:
   US availability, 18+, English and Keep Activity, according to
   [Google's Custom apps instructions](https://support.google.com/gemini/answer/17209137?hl=en).
   Record the signed-in DE baseline and the independently configured US-VPN
   developer comparison, including a fresh browser session. This PoC neither
   changes account settings nor establishes that a VPN grants eligibility.
2. Add the dedicated HTTPS `/mcp` URL in **Connected Apps → Custom apps**.
   For the preregistered path use Advanced features: client ID
   `skillpilot-gemini-poc`, and the private `.runtime/client-secret` value.
   This is an operator-only disposable credential, never a public beta secret.
   Start the server with `POC_CLIENT_AUTH_METHOD=client_secret_post`, matching
   the observed Gemini token authentication, and explicitly opt into
   `POC_ALLOW_REFRESH_RESOURCE_OMISSION=1` for its measured refresh omission.
   The defaults are Basic authentication and strict resource checks. Do not
   silently retry a rejected authentication method with another method.
3. On the first rejected authorization inspect the browser authorization
   request **locally** and extract only its exact `redirect_uri`. Do not copy
   the entire URL (state and PKCE) into evidence. Confirm it belongs to the
   actual Gemini flow. The redacted event provides its origin/fingerprint;
   it deliberately does not record the raw URL. The observed origin was
   `https://oauth-redirect.googleusercontent.com`, with a
   `user_bound_custom-mcp` path prefix containing a per-account identifier.
   Never publish the raw callback URI or infer another account's URI from it.
   Save the exact URI locally in `.runtime/gemini-redirect-uri` with mode 0600,
   then pin it and restart without printing it:

   ```bash
   POC_PUBLIC_ORIGIN=https://YOUR-DEDICATED-TEST-ORIGIN \
   POC_CLIENT_AUTH_METHOD=client_secret_post \
   POC_ALLOW_REFRESH_RESOURCE_OMISSION=1 \
   POC_REDIRECT_URIS="$(cat .runtime/gemini-redirect-uri)" npm start
   ```

4. Reconnect the Custom app. The PoC consent page requires the local
   `.runtime/operator-key` and explicit approval. After submitting the browser
   form, click **Weiter zu Gemini** on the protected handoff page to follow its
   single exact callback link, then finish Gemini's Save custom app dialog.
   Record actual client authentication, S256 PKCE, resource parameter, protocol
   version and token behavior, including the measured omission and explicitly
   selected bounded compatibility setting. Native discovery, corrected
   refresh, chat reads, confirmed write and exact replay passed on 6 October;
   reliable new-chat recovery still requires its own host evidence.
5. Create a fresh independent synthetic session with `npm run session`.
   Use its `.runtime/start-prompt.txt` only in the technical test chat, addressing
   the connected app via `@`. The prompt is operator test material containing
   an ephemeral capability; do not put it in Git, the Skill, or public reports.
6. Ask to save the marker. Confirm that Gemini shows its **write approval**.
   First deny: subsequent context must still show `completed: false` and zero.
   Then agree/approve: the confirmed receipt and subsequent context must show
   `completed: true`, version 1. Repetition must preserve that version and receipt.
7. In a new Gemini chat use the same still-valid private prompt: context must
   recover the saved marker. Test interrupted calls and OAuth renewal/revocation
   separately; these do not extend the independent test session.
8. Optionally import `skill/SKILL.md` or
   `dist/skillpilot-gemini-poc-0.1.0.zip` following
   [Google's Skills instructions](https://support.google.com/gemini/answer/17094296?hl=en).
   The unchanged ZIP contains only SKILL.md and Apache-2.0 LICENSE. It must be
   reuploaded after edits. Actual import/use remains **NOT_RUN**; successful
   packaging proves no loading.

If Gemini uses DCR, enable `POC_ALLOW_DCR=1` **after pinning its exact callback**.
If the observed client is public, additionally enable
`POC_ALLOW_PUBLIC_CLIENTS=1`; PKCE, consent, scope and audience checks remain.
No CIMD fetch, wildcard callback, shared production credential, authentication
fallback, legacy SSE endpoint or host-specific widget is implemented. Those
are explicit test boundaries, not assumed Gemini incompatibilities.

## Contract and evidence

| Tool | Input | Effect |
| --- | --- | --- |
| `get_skillpilot_poc_status` | None | Read identity/version; no session or progress |
| `get_skillpilot_poc_context` | Private `probeSessionId` | Read the synthetic session and its sole next action |
| `record_skillpilot_poc_completion` | Same session + server-issued `completionCapability` | Write one synthetic marker; exact retries return its receipt |

All schemas reject extra fields before state access. The write declares
`readOnlyHint: false`; annotations cannot by themselves prove host confirmation.
Capabilities from another session cannot authorize a write. Persistent writes
are serialized and use an atomic file rename; this is a single-process test
store, not the production transaction model.

The tested transport is stateless Streamable HTTP, JSON responses, SDK **1.30.0**,
with both local and actual Gemini native MCP **2025-11-25** negotiation. Logs
contain event type, bounded route/tool/status, client authentication method,
known MCP method/protocol version, safe callback origin/fingerprint and synthetic
state version; never raw HTTP input or queries. Correlate one test action at a
time using timestamp, event sequence and private before/after state. Do not
publish raw callbacks, state files, credentials, OAuth tokens, Google account
identifiers or email addresses with traces.

The isolated browser corrections retain the protocol guards: OAuth `state` is
bounded to 8–4096 characters (actual Google values were 1166–1168), and the
authorization page's `Referrer-Policy: strict-origin` permits a valid same-origin
Chromium form POST while foreign consent origins still fail. Browser requests
explicitly accepting HTML receive the escaped exact callback link with no
referrer; this avoids following Google's multi-hop redirect chain as a form
submission under `form-action 'self'`. Non-HTML consent requests retain 302
behavior. Both paths require the same exact callback, consent nonce, operator
key, S256 PKCE, scope and resource checks.

OAuth transport uses five-minute access tokens and one-hour absolute refresh
grants. Token renewal rotates refresh tokens; reuse revokes that grant. OAuth
runtime state resets on restart. The independent probe session retains its
24-hour expiry even when OAuth reconnects. A foreign MCP `Origin` header is
rejected with 403; actual Gemini request headers remain host observations
rather than a guessed CORS profile.

The [sanitized evidence record](../../../docs/deploy/gemini-custom-apps-poc-evidence-2026-10-05.json)
records test counts, local/HTTPS receipts, package hash and exact source hashes.
It distinguishes initial refresh failure from the corrected host OAuth,
discovery/read, denied-write, confirmed-write/persistence and replay passes,
observed new-chat dispatch failure and transport-confounded attempts.
Local tests and automated HTTPS
receipts do not establish the remaining host behaviors.

Actual host acceptance requires the evidence recorded in the linked matrix.
Only a successful canary justifies the subsequent Gemini adapter using
`CoachToolFacade` and `CoachStateProjection`, provider-specific OAuth and real
first-party learning-session starts. That subsequent adapter and full learning
flow remain separate from this feasibility PoC.

Software, technical docs and functional Skill instructions: **Apache-2.0**,
see [repository licensing](../../../LICENSING.md). No MIT course material or
third-party content is copied by this PoC.

# ChatGPT App "SkillPilot Coach v1": Deployment and Cutover

**As of:** 5 October 2026

**OAuth cutover, 11 September 2026:** For the approved new client authentication,
follow the [profile-specific activation runbook](oauth-client-authentication.md).
The target profile uses CIMD with `private_key_jwt`; existing securely
configured Basic connections remain a separate transitional profile. The Basic
examples below are not a method fallback for JWT clients. The Claude beta and
vendor inquiries do not block this authorization. Implementation alone does not
activate a production connection.

**Native desktop integration, 24 September 2026:** The uploaded plugin uses the
same MCP endpoint and OAuth issuer. An additional `chatgpt-native-cimd-public`
profile supports native CIMD with S256 PKCE; mTLS `observe` is explicitly
authorized for this trial. See [configuration and test launch](openai-native-cimd.md).
The `enforce` acceptance gates below apply to hosted certificate transport.

**Status:** Submission `1.0.0` was rejected (`REJECTED`). The Product Owner has
explicitly lifted the ChatGPT development freezes. The current successor `1.1.1`
is published via the Git marketplace for the desktop beta; the official OpenAI
submission remains `DRAFT` and the OpenAI directory remains unpublished.
Installation and starting a learning session in Windows ChatGPT Desktop have
been confirmed by the Product Owner. See
[unfreeze and review history](openai-plugin-v1-review-freeze.md).
The scoped authorizations of 24 September for archive/native CIMD and of
5 October for the existing Git/desktop beta including ordinary GUI launch
supplement the original Claude-first sequence. The Product Owner performs the
GUI/server rollout; local changes do not constitute a resubmission. The V1
contract continues to use the dedicated `mcp-coach-v1.skillpilot.com` origin
with server-authenticated HTTPS, OpenAI connector mTLS, and OAuth/PKCE. Actual
production state and the required `enforce` mode for hosted certificate
transport must be re-verified before any submission. The separately authorized
native desktop beta using `observe` remains distinct from that path. Permanent
ID, provider notice, and Level 2 configuration remain exclusively inside the
first-party WebGUI.

This runbook activates the multilingual, chat-first MCP learning coach with two
separately bound MCP Apps UIs: the read-only learning-goal image viewer and
interactive flashcard practice. The MCP server, OAuth authorization server, UI
resource delivery, and SkillPilot domain logic run inside the **existing Spring
Boot process**. The Node MCP server under `ai/openai app/` remains a local
regression testbed; it also hosts the verified source implementation of the UI
components whose self-contained build artifacts are copied into Spring Boot
resources.

The canonical responsibility boundary between chat client and backend is defined
in the [communication contract](../concept/runtime-workflows/provider-neutral-coach-boundary.md).
Product and provider architecture are documented in the
[SkillPilot-owned coach architecture](../concept/runtime-workflows/skillpilot-owned-coach-architecture.md).
The binding identity and session flow is documented separately in
[openai-mcp-oauth-learner-session-architecture.md](../concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.md).
Package, contract, and lifecycle versions follow the
[versioning and lifecycle plan](../concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md);
release, rollback, and retirement follow the
[V1 release runbook](openai-plugin-v1-release.md).
In particular, ChatGPT manages OAuth access and refresh tokens automatically;
users never enter OAuth tokens, an OAuth client secret, or a permanent
SkillPilot ID in chat. However, every explicit authorized launch via the
first-party web interface creates an independent `learningSessionId` with an
absolute 24-hour lifetime. During an ordinary desktop beta launch, the prepared
message is copied into a fresh chat with the plugin selected. Dedicated
Recall/exam launches retain their browser-launch contracts. SkillPilot inserts
this reference automatically into the short start message; ChatGPT passes it
unchanged to every domain MCP tool.

## 1. Public Contract

| Purpose | URL |
| --- | --- |
| Plugin identity | `skillpilot-coach-v1` |
| MCP Server URL | `https://mcp-coach-v1.skillpilot.com/mcp` |
| OAuth Resource / Audience | `https://mcp-coach-v1.skillpilot.com/mcp` |
| Declared widget origin | `https://mcp-coach-v1.skillpilot.com` |
| Observed ChatGPT Web origin | `https://mcp-coach-v1-skillpilot-com.web-sandbox.oaiusercontent.com` |
| Goal visualization resource | `ui://skillpilot/coach/v1/sha256-c890cf271307d815256450a2b20b27d57015a84e9f4e39c97532eaefc4e30c26/goal-visualization.html` |
| Flashcard practice resource | `ui://skillpilot/coach/v1/sha256-8524ee20837971227c35f1e16518d2b5bdbd60637fbec6beede9f2f4b29e4852/memory-card-practice.html` |
| Protected Resource Metadata | `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp` |
| Domain challenge | `https://mcp-coach-v1.skillpilot.com/.well-known/openai-apps-challenge` |
| OAuth Issuer | `https://skillpilot.com/api/openai/v1` |
| Authorization Server Metadata | `https://skillpilot.com/.well-known/oauth-authorization-server/api/openai/v1` |
| Issuer-relative OAuth compatibility route | `https://skillpilot.com/api/openai/v1/.well-known/openid-configuration` |
| Authorization Endpoint | `https://skillpilot.com/api/openai/v1/oauth2/authorize` |
| Token Endpoint | `https://skillpilot.com/api/openai/v1/oauth2/token` |
| Revocation Endpoint | `https://skillpilot.com/api/openai/v1/oauth2/revoke` |

Both discovery URLs serve the exact same OAuth metadata document. The canonical
RFC 8414 route remains authoritative. The issuer-relative compatibility alias is
additionally required because ChatGPT fetches it during MCP re-initialization;
it activates neither OpenID scopes nor ID tokens.

The draft inventory contains one active content-addressed resource each for
goal visualizations and flashcard practice, plus previously shipped launch and
image hash URIs retained as byte-identical passive resources.
`render_skillpilot_goal_visualization` and `start_skillpilot_memory_practice`
each reference only their own active URI via `ui.resourceUri` and
`openai/outputTemplate`. The app-only tool
`review_skillpilot_memory_practice_card`, ordinary tools, and all retained
predecessors remain unbound. After updating, refresh the plugin metadata and
verify fresh chats against both active URIs.

The additive V1 vHost forwards exclusively the public `/mcp` path to the
loopback-bound Spring transport `/internal/openai/v1/mcp`. There is no public
compatibility alias. The production app entry uses exclusively this V1 **Server
URL**, never the development tunnel and never a path on `skillpilot.com`.

## 2. Discovery Bootstrap and OAuth Values of the Legacy Compatibility Profile

The production contract uses Authorization Code with PKCE `S256` and exactly one
pre-registered **confidential OAuth client** for the `SkillPilot Coach v1` line.
Its fixed client ID, long random client secret, exact callback allowlist, fixed
MCP resource, and fixed scopes are configured on both sides by the app author.
ChatGPT authenticates at the token endpoint using `client_secret_basic`;
SkillPilot accepts neither `none` nor open Dynamic Client Registration, CIMD, or
`private_key_jwt` in this active legacy production profile.

The secret is protected configuration exclusively in ChatGPT and SkillPilot. It
must never appear in the repository, browser, start message, tool arguments, or
logs. PKCE additionally binds the authorization code to the verifier generated
by ChatGPT. Standard server-authenticated HTTPS remains mandatory. At the
dedicated MCP edge, ChatGPT additionally presents an OpenAI-managed client
certificate; SkillPilot does not need to request its own certificate for this.

ChatGPT administration probes the MCP URL before revealing its advanced OAuth
settings. At the same time, the full SkillPilot authorization server requires
the app-specific callback URL. An explicit, stateless bootstrap mode exists for
this purpose:

1. Leave full operation disabled and set exclusively
   `SKILLPILOT_OPENAI_COACH_V1_BOOTSTRAP_ENABLED=true`.
2. After restart, verify the four discovery URLs and the constant MCP `401`.
   Bootstrap registers neither tools nor OAuth client, token endpoints, learner
   services, or a coach health contributor.
3. In ChatGPT app administration, select `Server URL`, the production MCP URL,
   and `OAuth`.
4. Generate a fixed client ID dedicated solely to this app and a long random
   client secret. Configure the exact same values in ChatGPT and SkillPilot;
   never copy the secret into documentation or tickets.
5. Copy the app-specific production callback URL shown there, formatted as
   `https://chatgpt.com/connector/oauth/{callback_id}`, unchanged.
6. Configure multiple real callback URLs as a comma-separated list. Do not add
   any example or legacy URL that does not appear in app administration.
7. Select `client_secret_basic` as token-endpoint authentication in ChatGPT.
   Disable bootstrap and atomically enable full operation with client ID,
   secret, callback, OAuth, MCP, and write operations enabled. A read-only
   canary is an intentionally non-production diagnostic state.

The bootstrap MCP endpoint rejects **every** method and any arbitrary Bearer
values with `401` plus `WWW-Authenticate`. Authorization, token, revocation, and
introspection endpoints remain `404` during bootstrap. OpenAI documentation
defines this challenge/metadata contract as the discovery mechanism; whether a
specific ChatGPT UI build unlocks its advanced settings with it is still
verified in practice. If a UI issue occurs, the security contract is not
relaxed. Local rate limiting and data-minimized status telemetry already protect
this public bootstrap edge; across multiple instances, a shared gateway rate
limit remains required in addition.

Without a client ID or callback list, Spring startup intentionally aborts when
OpenAI V1 OAuth is enabled. Bootstrap and full operation must also never be
enabled simultaneously; that misconfiguration aborts startup.

## 3. Runtime Configuration

For a safe cutover, code and additive Liquibase migrations can first be verified
in a separate read-only canary. Full production operation, by contrast, requires
write operations to be enabled and uses server-authenticated HTTPS on the
dedicated V1 vHost, OpenAI connector mTLS, and mandatory OAuth/PKCE with exact
resource/audience and scope checks. The separate host isolates domain
verification, plugin lifecycle, and client-certificate verification. The
existing `skillpilot.com` vHost is not fundamentally restructured; it only
receives the narrow `404` block against MCP/internal path aliases described
below.

The reproducible additive vHost configuration resides at
`deploy/nginx/skillpilot-mcp-coaches.conf`. It MUST be included inside the
existing Nginx `http {}` block. Including it at the global top level outside
`http {}` triggers `server directive is not allowed here` and is invalid. After
the switch, the associated Certbot lineage `skillpilot-mcp-coaches` covers
exact major hosts V1 through V9 already provisioned:

```text
mcp-coach-v1.skillpilot.com
mcp-coach-v2.skillpilot.com
mcp-coach-v3.skillpilot.com
mcp-coach-v4.skillpilot.com
mcp-coach-v5.skillpilot.com
mcp-coach-v6.skillpilot.com
mcp-coach-v7.skillpilot.com
mcp-coach-v8.skillpilot.com
mcp-coach-v9.skillpilot.com
```

The previously locally prepared names `mcp-coach-de-v*` and `mcp-coach-en-v*`
were never part of any release. They are neither proxied in Nginx nor retained
as compatibility routes. Remaining DNS records or old certificate SANs may be
removed after the V1 cutover.

Only V1 is proxied to Spring. The remaining eight HTTPS vHosts are reserved and
return `404` for every path; their DNS and TLS readiness does not constitute a
release. Changes are always tested first with `nginx -t` and activated via
reload only afterward. Existing vHosts are neither replaced nor fundamentally
reworked.

In addition, `deploy/nginx/skillpilot-main-vhost-openai-deny-locations.conf` is
included exclusively **inside** the existing HTTPS `server {}` block for
`skillpilot.com`, placed before its general `location /`. This narrow location
snippet blocks the retired public path, the internal Spring transport, and the
internal protected-resource metadata target on the main origin with `404`. It
must be included neither at the global level nor directly in the `http {}`
block. That leaves the existing main vHost otherwise unchanged while only the
dedicated V1 vHost exposes the MCP contract.

Before installation, back up the existing main Nginx file and any target
snippets already present under unique names. Compare any existing working MCP
vHost file against the repository template first rather than blindly
overwriting it:

Beforehand, the production checkout must verifiably already contain the
language-neutral cutover. This check is mandatory: an outdated script would keep
testing the DE host, and an old vHost could mistakenly route unknown new
hostnames to V1 as the default vHost. All five commands must succeed and the
last one must produce no output:

```bash
grep -F 'server_name mcp-coach-v1.skillpilot.com;' \
  deploy/nginx/skillpilot-mcp-coaches.conf
grep -F 'mcp-coach-v9.skillpilot.com' \
  deploy/nginx/skillpilot-mcp-coaches.conf
grep -F 'proxy_pass http://127.0.0.1:8787/internal/openai/v1/mcp;' \
  deploy/nginx/skillpilot-mcp-coaches.conf
grep -F 'MCP_ORIGIN="https://mcp-coach-v1.skillpilot.com"' \
  scripts/verify_openai_v1_public_edge.sh
! grep -E 'mcp-coach-(de|en)-v[1-9]' \
  deploy/nginx/skillpilot-mcp-coaches.conf
```

If any check fails, nothing is installed into `/etc/nginx`. Pull the approved
commit first. A passing run of an outdated smoke script is no substitute for
this content check.

```bash
sudo cp -a -n /etc/nginx/nginx.conf \
  /etc/nginx/nginx.conf.before-mcp-subdomain-includes

if sudo test -e /etc/nginx/skillpilot-mcp-coaches.conf; then
  sudo cp -a -n /etc/nginx/skillpilot-mcp-coaches.conf \
    /etc/nginx/skillpilot-mcp-coaches.conf.before-repository-sync
  sudo diff -u /etc/nginx/skillpilot-mcp-coaches.conf \
    deploy/nginx/skillpilot-mcp-coaches.conf || true
fi

if sudo test -e /etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf; then
  sudo cp -a -n \
    /etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf \
    /etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf.before-repository-sync
  sudo diff -u \
    /etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf \
    deploy/nginx/skillpilot-main-vhost-openai-deny-locations.conf || true
fi
```

The two files are **not** installed or activated at this stage yet. During the
first mTLS cutover, backend mode, CA bundle, root-owned mode file, and loopback
verifier are prepared first. Only afterward are the Nginx templates installed in
the coordinated sequence below, ensuring that the new V1 configuration never
references missing mTLS artifacts during a full Nginx test.

The two includes intentionally belong in different contexts:

```nginx
http {
    # bestehende globale Einstellungen bleiben unverändert
    include /etc/nginx/skillpilot-mcp-coaches.conf;

    server {
        server_name skillpilot.com skillpilot.org skillpilot.mobi;

        # vor dem bestehenden allgemeinen `location /`
        include /etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf;

        location / {
            # bestehende SkillPilot-Proxykonfiguration
        }
    }
}
```

This snippet is a placement guide, not a replacement for the existing main
vHost. Add the second include specifically inside that existing `server {}`
block while leaving all other entries untouched. Installation alone activates
nothing yet. Before every reload, run the root-only mTLS preflight and an
explicit `nginx -t` in the coordinated sequence further below.

Before installing the new TLS vHost template, the existing Let's Encrypt lineage
must already be switched to the nine language-neutral major hosts. First, all
existing DNS A/AAAA records must point to the same server; an absent AAAA record
is acceptable, whereas a stale AAAA record is not. The `certbot --nginx`
commands below assume that the previously verified, working V1 vHost without the
new mTLS file reference is still active. On a genuinely fresh installation with
no existing lineage, first use solely a separately verified port-80 challenge
configuration; activate the full repository vHost template only after
certificate issuance and then in the sequence established below:
EnvironmentFile → mTLS artifacts → Nginx template → preflight. The existing
main vHost is never replaced during this step.

```bash
sudo certbot certonly --nginx --dry-run \
  --preferred-challenges http \
  --key-type ecdsa \
  --cert-name skillpilot-mcp-coaches \
  -d mcp-coach-v1.skillpilot.com \
  -d mcp-coach-v2.skillpilot.com \
  -d mcp-coach-v3.skillpilot.com \
  -d mcp-coach-v4.skillpilot.com \
  -d mcp-coach-v5.skillpilot.com \
  -d mcp-coach-v6.skillpilot.com \
  -d mcp-coach-v7.skillpilot.com \
  -d mcp-coach-v8.skillpilot.com \
  -d mcp-coach-v9.skillpilot.com

sudo certbot certonly --nginx \
  --preferred-challenges http \
  --key-type ecdsa \
  --cert-name skillpilot-mcp-coaches \
  --force-renewal \
  -d mcp-coach-v1.skillpilot.com \
  -d mcp-coach-v2.skillpilot.com \
  -d mcp-coach-v3.skillpilot.com \
  -d mcp-coach-v4.skillpilot.com \
  -d mcp-coach-v5.skillpilot.com \
  -d mcp-coach-v6.skillpilot.com \
  -d mcp-coach-v7.skillpilot.com \
  -d mcp-coach-v8.skillpilot.com \
  -d mcp-coach-v9.skillpilot.com

sudo certbot certificates
sudo nginx -t && sudo systemctl reload nginx
sudo systemctl is-active nginx
```

The second invocation replaces the domain set of the same lineage; it does not
create a parallel language lineage. Before confirming, verify that the domain
list displayed by Certbot matches V1 through V9 exactly. Afterward, V1 must
serve its protected contract and V2 through V9 must serve `404` for every path
over valid TLS; `./scripts/verify_openai_v1_public_edge.sh` verifies both.
`--force-renewal` is set deliberately here because the successfully validated
new SAN set must be written immediately into that same lineage. `--expand` is
unsuitable because it would retain the old unpublished DE/EN SANs instead of
replacing the domain set exactly.

```text
SERVER_ADDRESS=127.0.0.1

SKILLPILOT_PUBLIC_BASE_URL=https://skillpilot.com
# Unabhängig vom OAuth-Client-Secret erzeugen, z. B.: openssl rand -hex 32
SKILLPILOT_SIGNING_SECRET=<mindestens-32-hochentropische-zeichen>

SKILLPILOT_OPENAI_COACH_V1_ENABLED=true
SKILLPILOT_OPENAI_COACH_V1_BOOTSTRAP_ENABLED=false
SKILLPILOT_OPENAI_COACH_V1_OAUTH_ENABLED=true
SKILLPILOT_OPENAI_COACH_V1_MCP_ENABLED=true
SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED=true
SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE=observe

SKILLPILOT_OPENAI_CHATGPT_URL=https://chatgpt.com/

SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_AUTHENTICATION_METHOD=client_secret_basic
SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_ID=<exakte-feste-client-id-dieser-app>
SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_SECRET=<langes-zufälliges-client-secret>
SKILLPILOT_OPENAI_COACH_V1_OAUTH_REDIRECT_URIS=<exakte-callback-url-oder-kommaliste>

# Nur bei einem tatsächlichen Client-ID-Wechsel, einmalig und danach entfernen:
# SKILLPILOT_OPENAI_COACH_V1_OAUTH_LEGACY_CLIENT_IDS=<exakte-alte-client-id-oder-kommaliste>

SKILLPILOT_OPENAI_LEARNING_SESSION_TTL=PT24H
# Standardmäßig false; nur für einen kontrollierten First-Party-Live-Test kurz aktivieren:
SKILLPILOT_OPENAI_COACH_V1_DIAGNOSTIC_SESSION_TTL_ENABLED=false
SKILLPILOT_OPENAI_CLEANUP_INTERVAL_MS=3600000
SKILLPILOT_OPENAI_OAUTH_ACCESS_TOKEN_TTL=PT1H
SKILLPILOT_OPENAI_OAUTH_REFRESH_TOKEN_TTL=P30D

SKILLPILOT_OPENAI_RATE_LIMIT_ENABLED=true
SKILLPILOT_OPENAI_RATE_LIMIT_WINDOW=PT1M
SKILLPILOT_OPENAI_RATE_LIMIT_MCP_REQUESTS=120
SKILLPILOT_OPENAI_RATE_LIMIT_OAUTH_REQUESTS=60
SKILLPILOT_OPENAI_RATE_LIMIT_UI_REQUESTS=60
SKILLPILOT_OPENAI_RATE_LIMIT_METADATA_REQUESTS=120
SKILLPILOT_OPENAI_RATE_LIMIT_MAX_CLIENT_BUCKETS=10000
```

`MTLS_EDGE_MODE=disabled` is only the rollback-capable initial state prior to
the separate edge installation. `observe` validates presented OpenAI
certificates while still allowing requests without a certificate to reach OAuth,
providing live-traffic proof without breaking the existing operator smoke test.
An invalid certificate presented during `observe` is still rejected. Once live
ChatGPT proof succeeds, switch both the root-owned Nginx mode and the backend
mode together to `enforce`. Publication is permitted only in `enforce`.

The initial cutover to `observe` is an ordered, fail-closed activation. First,
stage `SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE=observe` in the root-protected
systemd EnvironmentFile without restarting the backend service yet. Then follow
this exact sequence:

```bash
cd /home/enpasos/skillpilot

# 1. Repositoryvertrag und CA-Pins prüfen.
./scripts/verify_openai_v1_mtls_edge.sh --static

# 2. CA-Bundle, Modusdatei und Loopback-Verifier staged installieren.
sudo ./scripts/install_openai_v1_mtls_edge.sh --mode observe
sudo systemctl is-active skillpilot-openai-v1-mtls-verifier

# 3. Erst jetzt die bereits gesicherten und geprüften Nginx-Vorlagen installieren.
sudo install -o root -g root -m 0644 \
  deploy/nginx/skillpilot-mcp-coaches.conf \
  /etc/nginx/skillpilot-mcp-coaches.conf
sudo install -o root -g root -m 0644 \
  deploy/nginx/skillpilot-main-vhost-openai-deny-locations.conf \
  /etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf

# 4. Geschützte Backend-Konfiguration, installierte Artefakte und Nginx-Diskstand prüfen.
sudo ./scripts/verify_openai_v1_mtls_edge.sh \
  --preflight --expected-mode observe
sudo nginx -t

# 5. Backend zuerst, danach den bereits geprüften Nginx-Stand aktivieren.
sudo systemctl restart skillpilot
sudo systemctl is-active skillpilot
sudo systemctl reload nginx
sudo systemctl is-active nginx

# 6. Laufzeitvertrag prüfen; danach folgt der reale ChatGPT-Nachweis.
./scripts/verify_openai_v1_mtls_edge.sh --runtime --expected-mode observe
```

The runtime smoke intentionally runs without `sudo` and reads neither the
root-protected `mode.conf` nor the backend EnvironmentFile. It detects the
active mode solely through the public no-certificate/invalid-certificate matrix
while simultaneously confirming over the loopback operator lane that the running
backend filter accepts the same mode. The separate root-only gates `--staged`,
`--preflight`, and `--installed` remain responsible for artifact parity, file
permissions, systemd, listeners, and the on-disk Nginx contract.

The installer does not fetch CA files live from the network; instead, it
verifies the reviewed OpenAI files, their SHA-256 digests, X.509 fingerprints,
and the intermediate chain. The systemd unit supplies those exact two CA files
to the isolated `DynamicUser` via read-only service credentials, so the service
requires no read permission on the protected parent directory `/etc/skillpilot`.
This requires systemd 247 or newer; the unit deliberately uses
`${CREDENTIALS_DIRECTORY}` rather than the `%d` specifier introduced later. The
static gate validates the unit before installation using `systemd-analyze
verify`. The installer binds the verifier exclusively on `127.0.0.1:8792` and
writes the explicitly chosen root-owned Nginx mode atomically to
`/etc/skillpilot/openai-mtls/mode.conf`. It **never** edits, tests, or reloads
the active Nginx configuration. Before every reload, the separate root-only
`--preflight` must prove that the installed mode matches
`SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE` in the protected systemd
EnvironmentFile and that both installed files and on-disk Nginx configuration
match the repository contract. Neither the EnvironmentFile nor any secret is
printed in the process.

Even during the initial transition from `disabled` to `observe`, restart the
backend service before reloading Nginx. Between backend restart and Nginx
reload, contradictory or not-yet-present edge headers are intentionally rejected
with `403`. This brief fail-closed window is never bypassed via a public
diagnostic override.

The cutover from `observe` to `enforce` follows this sequence:

1. Prove at least one real ChatGPT tool invocation in `observe`. The
   privacy-bounded counter with `event="mtls_edge_verified"` must increment for
   that call, while `event="mtls_edge_observed_no_cert"` must not increment.
   Certificate, token, and session ID must never be logged.
2. Start a maintenance window and set the value in the backend EnvironmentFile
   to `enforce`, without restarting the service yet. The running backend/edge
   contract thus remains completely on `observe` for the moment.
3. Run `sudo ./scripts/install_openai_v1_mtls_edge.sh --mode enforce`, followed
   by the separate
   `sudo ./scripts/verify_openai_v1_mtls_edge.sh --preflight --expected-mode enforce`
   and an explicit `sudo nginx -t`. Only these checks confirm that backend
   EnvironmentFile, installed edge mode, artifacts, and on-disk Nginx state are
   consistent. The installer still neither edits nor reloads Nginx.
4. Now restart the backend service, immediately run `sudo systemctl reload nginx`,
   and then run
   `./scripts/verify_openai_v1_mtls_edge.sh --runtime --expected-mode enforce`.
   The public request without a certificate must return `403`, while metadata
   and challenge remain reachable. The positive OAuth smoke test without a
   certificate runs exclusively over the genuine loopback socket peer. Between
   backend restart and Nginx reload, the backend filter intentionally rejects
   the contradictory classification still arriving from the running `observe`
   edge with `403`. That brief fail-closed transition is expected and must not
   be bridged with a public bypass.
5. Refresh/connect the app in a fresh chat and perform a real ChatGPT tool call.
   Only when `event="mtls_edge_verified"` increments again, the verifier journal
   contains no rejection for that call, no backend assertion rejection
   increments, and the protected `openAiDeCoach` health detail reports
   `mtlsEdgeMode="enforce"` is the cutover ready for publication.

If steps 3 through 5 fail, the edge stays fail-closed. Rolling back to `observe`
is likewise executed as a coordinated backend-plus-root-owned-edge change with
preflight, `nginx -t`, reload, and runtime smoke; it is not a publishable final
state.

CA trust is never updated over the network during startup or deployment. At
least every 90 days, compare the two official OpenAI CA files against the pinned
repository files, SHA-256 digests, X.509 fingerprints, validity periods, and
intermediate chain, recording the outcome and review date in operational
evidence. Re-verify unchanged files with
`./scripts/verify_openai_v1_mtls_edge.sh --static`. Any discrepancy triggers not
an automatic update, but a review-gated CA rotation under
[CA provenance](https://github.com/enpasos/skillpilot/blob/main/deploy/openai-mtls/PROVENANCE.md),
including an overlapping trust cutover whenever OpenAI temporarily publishes
both chains, followed by a renewed positive ChatGPT test. In addition, monitor
`mtls_edge_verified`, `mtls_edge_observed_no_cert`, and the backend assertion
counter `mtls_edge_rejected`. Certificate and no-certificate rejections upstream
of Spring are derived from the bounded verifier journal and public `403` edge
status codes. An absence of verified ChatGPT calls or an unexpected spike in
rejection signals triggers an operational review. At least 90 days before any
pinned CA expires, a confirmed successor or renewal strategy must be in place.

Removed direct-start variables `SKILLPILOT_OPENAI_SECURE_COOKIE`,
`SKILLPILOT_OPENAI_BINDING_TTL`, `SKILLPILOT_OPENAI_LAUNCH_TTL`, and all
`SKILLPILOT_OPENAI_RATE_LIMIT_BOOTSTRAP_*` entries must not remain in the
service environment. Both the server and the deployment validator reject these
retired names fail-closed.

The three public V1 URLs are not configured via environment variables. They are
immutable parts of the V1 contract:

- MCP and OAuth resource: `https://mcp-coach-v1.skillpilot.com/mcp`
- Protected Resource Metadata:
  `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp`

Setting `SKILLPILOT_OPENAI_COACH_V1_UI_ORIGIN` is likewise disallowed: the
widget origin is fixed in the V1 contract as
`https://mcp-coach-v1.skillpilot.com` and delivered identically via
`_meta.ui.domain` and `_meta["openai/widgetDomain"]`. Legacy URL variables and
same-named override attempts abort startup fail-closed so a stale or misspelled
route can never silently replace the versioned V1 contract.

ChatGPT Web currently materializes this declared domain as an isolated browser
origin under `*.web-sandbox.oaiusercontent.com`. Both active UI resources
communicate exclusively via their narrowly bound MCP tools; there is no
provider-side permanent-ID or setup HTTPS path.

Before the first subdomain deployment, remove in particular any legacy entries
for `SKILLPILOT_OPENAI_DE_UI_ORIGIN`, `SKILLPILOT_OPENAI_DE_V1_ORIGIN`,
`SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED`,
`SKILLPILOT_OPENAI_DE_MTLS_EDGE_TRUSTED_PROXIES`, and mTLS smoke certificates
from the EnvironmentFile. Do not replace them with new locale-bound names; the
sole current backend switch is `SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE`.
Likewise, completely remove `SKILLPILOT_OPENAI_DE_MCP_URL`,
`SKILLPILOT_OPENAI_DE_OAUTH_RESOURCE`, and
`SKILLPILOT_OPENAI_DE_RESOURCE_METADATA`.

Prior to copying assets, building, and restarting the service,
`./deploy_skillpilot.sh` inspects the EnvironmentFile actually referenced by the
systemd unit. The production contract permits exactly one such file, defaulting
to `/etc/skillpilot/skillpilot.env`; set `SKILLPILOT_SERVICE_ENV_FILE`
explicitly if a different path is used. Only the names of removed OpenAI V1
variables are detected from the file; their values and all OAuth, database, or
other secrets are neither logged nor printed. Those same legacy names must not
be injected via `Environment=`, `PassEnvironment=`, or the global systemd
environment either. If the single EnvironmentFile is marked optional in systemd
(`ignore_errors=yes`) and is absent, preflight accepts the canonical V1 defaults
after checking the remaining environment channels. A missing mandatory file
(`ignore_errors=no`) remains an error. An EnvironmentFile containing OAuth or
database secrets remains `root:root` with mode `0600` by default. The sole
explicitly supported group-read exception is
[admin file access](admin-file-access.md) on the canonical
`/etc/skillpilot/skillpilot.env`; it does not authorize broad group access to
other secrets or configuration directories. If the deploy user cannot read the
root-protected file or traverse a parent directory, preflight visibly reports
this content check as `SKIP`; the exact Spring startup validation remains the
final fail-closed boundary. Blanket `sudo cat` permissions or world-readable
secret files are strictly prohibited.

The migration is intentionally fail-closed: legacy `SKILLPILOT_OPENAI_DE_*` and
`SKILLPILOT_OPENAI_COACH_DE_V1_*` names are not silently mapped as V1 aliases.
All V1-specific settings carry `SKILLPILOT_OPENAI_COACH_V1_*`; shared policies
of the single Spring process carry `SKILLPILOT_OPENAI_*` without a language or
version segment. Remove legacy names completely rather than setting them to
empty strings.

The nine Nginx origins are not nine Spring processes and are not toggled via a
shared URL environment variable. Each public host is mapped statically in Nginx
to the internal path of its contract line. Only V1 is currently implemented; the
remaining reserved hosts intentionally return `404`. Future contract lines
already follow this unambiguous naming convention:

| Public host | Spring configuration group | Line-scoped environment names | Current status |
| --- | --- | --- | --- |
| `mcp-coach-v1.skillpilot.com` | `skillpilot.openai.coach.v1` | `SKILLPILOT_OPENAI_COACH_V1_*` | active, internal `/internal/openai/v1/*` |
| `mcp-coach-v2.skillpilot.com` | `skillpilot.openai.coach.v2` | `SKILLPILOT_OPENAI_COACH_V2_*` | reserved, `404` |
| `mcp-coach-v3.skillpilot.com` | `skillpilot.openai.coach.v3` | `SKILLPILOT_OPENAI_COACH_V3_*` | reserved, `404` |
| `mcp-coach-v4.skillpilot.com` | `skillpilot.openai.coach.v4` | `SKILLPILOT_OPENAI_COACH_V4_*` | reserved, `404` |
| `mcp-coach-v5.skillpilot.com` | `skillpilot.openai.coach.v5` | `SKILLPILOT_OPENAI_COACH_V5_*` | reserved, `404` |
| `mcp-coach-v6.skillpilot.com` | `skillpilot.openai.coach.v6` | `SKILLPILOT_OPENAI_COACH_V6_*` | reserved, `404` |
| `mcp-coach-v7.skillpilot.com` | `skillpilot.openai.coach.v7` | `SKILLPILOT_OPENAI_COACH_V7_*` | reserved, `404` |
| `mcp-coach-v8.skillpilot.com` | `skillpilot.openai.coach.v8` | `SKILLPILOT_OPENAI_COACH_V8_*` | reserved, `404` |
| `mcp-coach-v9.skillpilot.com` | `skillpilot.openai.coach.v9` | `SKILLPILOT_OPENAI_COACH_V9_*` | reserved, `404` |

The reserved names are a convention, not yet an accepted runtime configuration.
The current server aborts startup if an unimplemented line or an unknown
line-scoped variable is set rather than silently ignoring the entry. A line is
activated only with its own contract, internal route, Spring configuration
group, and test suite. Process-wide settings such as cookie hardening, session
TTLs, and rate limits remain defined once under `SKILLPILOT_OPENAI_*`.

Likewise, `SKILLPILOT_SERVER_BUILD` is not maintained in
`/etc/skillpilot/skillpilot.env`. Gradle builds exactly one `skillpilot-server`
artifact and embeds the full lowercase `HEAD` commit hash into
`skillpilot.openai.coach.v1.server-build` and
`skillpilot.openai.coach.v1.mcp.server-version` during backend resource
processing. `scripts/deploy.sh` verifies both values against the checked-out
commit before restarting the service, ensuring that telemetry and health output
describe the shipped artifact rather than a manually maintained environment
variable.

`SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED=true` is mandatory for a functional
production coach. Personalization, navigation, task progress, and mastery are
domain write operations. When set to `false`, discovery, OAuth, and read-only
tools keep working, but the coach aborts on the first required state transition
with `503 Service Unavailable`. That setting is therefore suitable exclusively
for a deliberately isolated read-only canary. Operational write disablement must
not trigger an OAuth reconnect flow.

The ordinary enabled provider starts exclusively in secure client mode; there is
no production `secure-mode=false` switch. Client proof and callback are verified
per explicit profile: Basic with secret, hosted CIMD with `private_key_jwt`, and
optionally native CIMD with `none` and loopback callback. Resource, scopes, and
PKCE `S256` remain mandatory. Each authentication method may be used only by its
configured client identity; DCR and silent profile fallback remain excluded.

`SKILLPILOT_SIGNING_SECRET` is also mandatory when the OpenAI V1 provider is
enabled. Startup aborts if the value is missing, matches the insecure
placeholder, contains fewer than 32 non-whitespace characters, or exhibits
insufficient structural entropy. Neither the value itself nor any excerpt is
logged or echoed in error messages during this check. It is an independent HMAC
operational secret and must never match the OAuth client secret.

Manage the client secret as an operational secret: restrictive file permissions,
no shell history, no request/health detail exposure, and no client output. When
rotating, first update ChatGPT and SkillPilot in coordination, then revoke all
tokens issued under the previous client contract.

The legacy client allowlist is not part of the baseline profile; use it only
during an actual client-ID change. SkillPilot then deletes OAuth authorizations,
consents, registered client rows, and access and refresh tokens exclusively for
the exact legacy client IDs listed. Historical connection, binding-grant, and
pending-launch legacy artifacts may additionally be purged during that one-time
cutover. Current `openai_de_learning_session` rows, however, are not deleted by
a pure OAuth client rotation. Afterward, only the newly configured client may
remain readable; otherwise startup aborts.

A database backup is mandatory prior to this cutover. Although the setting is
idempotent for already-removed IDs, remove it from the environment again once
production startup succeeds. Old access and refresh tokens and authorizations
are intentionally and irrevocably invalidated; an application-only rollback will
not restore them. Users re-authorize the SkillPilot app once afterward.

The current additive migration provisions `openai_de_learning_session` as an
independent launch authorization record. Each row stores at least the hash of
the random `learningSessionId`, the internal learner reference, `started_at`,
and `expires_at`. Neither the permanent SkillPilot ID nor the plaintext session
ID is duplicated there. Legacy session rows addressed solely via an OAuth
subject are never used as a fallback and are removed or migrated in a controlled
manner during cutover.

The historical physical table prefix `openai_de_` intentionally remains in place
as an internal migration anchor during this additive switch. It is no longer a
language or contract marker; the binding communication language is stored per
session in `communication_locale`. Renaming existing tables and internal Java
types would be a separate, higher-risk database migration with zero benefit to
the public V1 contract and does not belong in this cutover.

The start intent is a short-lived command to the domain backend. On **every**
click on **Start learning** (**Lernen starten**), SkillPilot applies the
narrowly typed intent to authoritative state under the learner lock and
immediately generates a fresh cryptographically random `learningSessionId`. Even
two launches by the same learner produce distinct IDs. The absolute lifetime is
governed by `SKILLPILOT_OPENAI_LEARNING_SESSION_TTL` (`PT24H` in production).
MCP calls, access-token refreshes, browser reloads, and new or parallel chats
never extend it.

Before every session-bound read, write, or replay response, the V1 adapter
additionally enforces the action horizon `expiresAt >= now + PT1H`. Exactly one
hour of remaining lifetime is valid; less than one hour returns
`SESSION_RENEWAL_REQUIRED` before any domain operation executes or any stored
result is returned. A previously committed write with the exact same tool name,
canonically identical arguments, and the same `clientRequestId` may replay—while
its pinned workflow/curriculum version remains available—only if its
`completedStateVersion` still matches the current canonical learner revision.
Neither the operation nor the mutation is re-executed during replay. Every new
session is always an independent record and does not revoke earlier sessions.

The session ID is inserted once automatically into the URL-encoded start prompt
and subsequently passed unchanged by ChatGPT as a required argument to every
learner-scoped tool. SkillPilot resolves exclusively the session-ID hash to the
learner. OAuth alone neither creates nor selects a learning session, and a
session ID alone never authorizes an MCP call. If either credential is missing,
the domain contract returns `SESSION_REQUIRED` or an OAuth error respectively.
`SESSION_REQUIRED`, `SESSION_RENEWAL_REQUIRED`, and
`SESSION_VERSION_UNAVAILABLE` do not trigger a new OAuth connection: the coach
outputs `instruction` verbatim; if absent, it uses the matching exact entry from
`instructions`, appending the exact `startUrl` only if not already present in
the instruction. No domain answer and no retry with the stale session follow.
The learner uses **Start learning** (**Lernen starten**) in the first-party
WebGUI and uses the fresh session via the prepared message in a new chat. During
an ordinary desktop beta launch, the learner copies this message manually.
Falling back from an OAuth subject to a learner is prohibited.

Every OpenAI launch uses exclusively
`POST /api/ui/learners/{skillpilotId}/openai/v1/launch`. A successful request
applies the typed start intent and creates exactly one new learning session plus
start prompt. Every subsequent call creates a fresh session regardless of
browser, existing app authorization, or prior launches. The `/launch` call is
self-contained and requires neither a preceding connection-status check nor
ephemeral intermediate browser state.

#### Request-Local Diagnostic TTL

For a controlled live test of the one-hour action horizon, exclusively the
first-party endpoint `POST /api/ui/learners/{skillpilotId}/openai/v1/launch` may
receive the optional JSON field `diagnosticSessionTtlSeconds`. The server
accepts it solely when
`SKILLPILOT_OPENAI_COACH_V1_DIAGNOSTIC_SESSION_TTL_ENABLED=true` is set. The
integer value must lie between `3601` and `86400` seconds inclusive and must not
exceed the normal learning-session lifetime still configured at `PT24H`.

The override applies solely to the single independent session created by that
request; it alters neither configuration nor any other or subsequent session.
The very next `/launch` request omitting the field automatically produces a
normal `PT24H` session again, even while the diagnostic gate remains enabled. No
other launch path accepts this field.

Recommended values:

- `3660` seconds: roughly one minute until crossing below the `PT1H` action
  horizon;
- `5400` seconds: 90-minute soak with roughly 30 minutes until crossing the
  horizon.

Do **not** lower `SKILLPILOT_OPENAI_LEARNING_SESSION_TTL` globally for this
test. Returning immediately to normal runtime behavior requires only a request
without the diagnostic field—neither a deployment nor a configuration change.
Verify its `expiresAt` against `startedAt + PT24H`. Keep the separate diagnostic
gate active only during the controlled test window, then reset it to `false`
through the regular configuration path.

Expired or revoked learning-session records are rejected and purged
independently of the OAuth lifecycle. Authorization codes, access and refresh
tokens, and consents follow solely their own OAuth lifecycle. In particular,
token issuance or token refresh neither creates a learning session nor extends
an existing one. Technical cleanup cadence is controlled by
`SKILLPILOT_OPENAI_CLEANUP_INTERVAL_MS`, defaulting to one hour.

Every `/launch` call must explicitly send `providerEligibilityConfirmed=true`;
if missing or `false`, the backend rejects the launch with `403`. The Cockpit
prompts for this once per browser session: the learner confirms being at least
13 years old, meeting any higher minimum age applicable in their place of
residence, and—if under 18—having permission from a parent or legal guardian.
SkillPilot does not infer age from grade level or curriculum and stores neither
date of birth nor an age profile for this check. This is an explicit
self-confirmation, not identity or age verification and not OAuth client or
learner identity.

The coach path requires **no OpenAI model API key**. Model execution and chat UI
are provided by the learner's own ChatGPT account; SkillPilot provides only the
MCP, OAuth, and domain backend.

The configured MCP resource is security-critical and is intentionally matched
**exactly**. Neither leading/trailing whitespace nor an extra trailing `/` is
accepted. Authorization requests persist this exact value, and token
introspection re-verifies it as the audience on every MCP call. The same
protection applies across refresh-token rotation.

### 3.1 Health, Readiness, and Metric Names

When `SKILLPILOT_OPENAI_COACH_V1_ENABLED=true`, Spring registers the health
contributor `openAiDeCoach`, which feeds into the separate Actuator group
`openaiReadiness`. The contributor reports `UP` only when MCP and OAuth are
enabled, required client and callback values are configured, public MCP/metadata
targets use valid HTTPS, selected client profiles are active, and the current
contract with all 14 tools is loaded. Under the JWT profile, the verified CIMD
metadata cache must additionally be valid. The OpenAI readiness group also
includes `readinessState` and the database health check `db`, ensuring an
unreachable persistence layer can never be reported as a ready coach.

The shared `readiness` group contains exclusively `readinessState,db`. A failure
isolated to JWT metadata retrieval therefore marks `openaiReadiness` as `DOWN`
without blocking shared readiness or available Claude/Basic profiles. Shared
readiness explicitly does not constitute OpenAI acceptance; separate provider
verification and
[profile-specific host/release acceptance](oauth-client-authentication.md)
remain mandatory. `SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED=false` is a
permitted read-only canary state and does not set `openaiReadiness` to `DOWN`
either. Whether the full coach is operationally writable in production must
therefore be verified additionally via the runtime environment or a dedicated
deployment preflight.

Health details expose exclusively non-secret status fields, including
`serverBuild`, `serverBuildConfigured`, `mcpEnabled`, `oauthEnabled`,
`mtlsEdgeMode`, `writesEnabled`, `secureMode`, `clientAuthenticationMethod`,
`publicClientConfigured`, `privateKeyJwtConfigured`, `clientIdConfigured`,
`redirectUrisConfigured`, `contractToolCount`, `contractHash`,
`rateLimitEnabled`, and `rateLimitConfigured`. `serverBuild` is the Git commit
embedded in the backend artifact; `contractHash` is a deterministic SHA-256
digest over server instructions and public tool descriptors. Client ID, callback
URLs, MCP URL, tokens, SkillPilot IDs, and learning content are never emitted.
Health details must be exposed solely over the internal protected management
port.

The exact Micrometer metric names are:

```text
skillpilot.openai.coach.v1.mcp.tool.duration
skillpilot.openai.coach.v1.operational.event
```

From application code, the timer carries exclusively the bounded tags `tool`
(the 14 known tool names or `unknown`) and `status` (`success`, `error`, or
`exception`), recording invocation count and duration. Arguments, prompts,
responses, learner or connection identifiers, and OAuth values appear neither as
tags nor as measurement payloads. A configured exporter may attach global
infrastructure tags, which likewise must contain no personal data.

The second metric is a counter carrying a single bounded tag `event`. It records
exclusively `oauth_failure`, `refresh_failure`, `session_required`,
`session_renewal_required`, `http_401`, `http_403`, `http_409`, `http_429`,
`issuer_rate_limited`, `timeout`, `replay_rejected`, `cross_provider_rejected`,
`mtls_edge_verified`, `mtls_edge_observed_no_cert`, `mtls_edge_local_operator`,
`mtls_edge_rejected`, and `tool_exception`. Dynamic error strings, identifiers,
paths, or learning content never appear as tags. Cross-learner/IDOR defenses are
additionally covered by negative integration tests; the MCP contract deliberately
accepts no learner identifier as a tool argument.

The local rate limiter separates MCP, OAuth, Cockpit launch, and metadata
traffic. The first-party launch route and the MCP path enforce independent
budgets.

Network-scoped budgets use solely the remote address normalized by the servlet
container; the limiter parses no forwarding headers. Consequently, the
production reverse proxy must strip or overwrite incoming
`Forwarded`/`X-Forwarded-*` headers, and the backend port must not be directly
reachable from the public internet. Across multiple backend instances, a shared
gateway rate limit is mandatory in addition; the in-process limiter is
intentionally only a last local line of defense. Throttled requests return `429`
with `Retry-After` and `no-store`.

The general request-body logger skips MCP, provider OAuth, and OpenAI Cockpit
launch paths completely. In particular, authorization codes, PKCE verifiers,
access/refresh tokens, and typed learning-goal start intents must never appear
as request bodies in application logs, even with debug logging enabled.

## 4. Configuring the ChatGPT App

1. Name: `SkillPilot Coach v1`.
2. Language-neutral description, for example:

   ```text
   Personal learning coach for your saved SkillPilot learning state. Guides you through learning goals, tasks, and review while keeping your progress up to date.
   ```

3. Connection type: `Server URL`.
4. MCP URL: `https://mcp-coach-v1.skillpilot.com/mcp`.
5. Configure OAuth with the fixed client ID, its matching client secret, and the
   exact callback URL. Select `client_secret_basic` as the token-endpoint
   authentication method. DCR, CIMD, `none`, and `private_key_jwt` do not belong
   in this legacy production app configuration.
6. After every change to the tool list, tool descriptions, or server
   instructions, deploy the backend first. Then open the Developer Mode app
   under `Settings → Plugins` (`Einstellungen → Plugins`) and click `Refresh`.
   Verify that only the approved language-neutral production tools appear; no
   Claude, regression, launch, or local widget-test tools may be visible.
   `resources/list` must return exactly two active hash-bound resources plus all
   previously advertised hash URIs retained byte-identically as passive
   resources. `render_skillpilot_goal_visualization` and
   `start_skillpilot_memory_practice` each reference only their own active
   resource. `review_skillpilot_memory_practice_card` remains app-only and
   unbound.

The visible description explains solely product value. Although ChatGPT uses it
as an app-discovery signal, SkillPilot must not depend on its wording for domain
correctness or workflow sequencing. Positive and negative selection boundaries
belong in tool descriptions, cross-tool workflows belong in MCP server
instructions, and authoritative authorization and state transitions belong in
the backend.

The stable technical name of the domain context tool remains
`get_skillpilot_context`, and its English title must be
`Start or continue the SkillPilot learning coach`. Its description states both
positive routing cases (selecting or naming SkillPilot; learning, practicing,
starting, continuing, resuming, and using saved learning progress) and the
negative boundary (not for general subject-matter questions without a SkillPilot
reference). Never publish a second semantically equivalent alias tool.

### Learning Plans in Current Package 1.1.1

Full context now directly embeds `learningPlanToday`: bounded, validated totals,
per-subject summaries, `current`/`canContinue`, and authoritative continuation
hints. There is no separate `get_skillpilot_daily_plan` call. The two added
tools are `resume_skillpilot_learning_plan` and
`switch_skillpilot_learning_plan_subject`; Spring configuration enables both for
the current candidate under workflow `coach@1.1`.

Status inquiries and pauses trigger no learning mutation. An explicit subject
request takes precedence over automatic continuation; switching accepts only a
matching current `subject` value with `canContinue: true`. An unfinished goal is
parked rather than marked mastered, and active exams remain protected. Only
during ordinary learning continuation, with no active goal and an authorized
`resumeAvailable`, may the backend select the next plan goal. Both write tools
require the current state version and a request ID.

The coach reproduces the visible plan status verbatim from
`learningPlanToday.text`: one line per subject showing the daily or weekly
target plus any backlog or lead, matching the SkillPilot Cockpit exactly. The
context exposes no raw plan numbers, and the coach performs no arithmetic of its
own. Uncomputable plans are named explicitly in the text and are never reported
as `0/0` or completed. Generated review cases and the four plan scenarios are
documented in the [submission dossier](openai-plugin-v1-submission.md); backend
replay, component tests, and live ChatGPT host acceptance remain distinct
verification layers.

Both the current portal draft `1.1.1-SNAPSHOT` and Git package `1.1.1` register
exactly two active MCP Apps UI resources: a read-only image resource for the
active atomic learning goal and an interactive resource for in-chat flashcard
practice. Previously delivered image hash URIs remain passively readable
byte-for-byte without active tool bindings. Earlier unpublished launch resources
are not part of the V1 contract. `render_skillpilot_goal_visualization` and
`start_skillpilot_memory_practice` each reference solely their own active
resource via `ui.resourceUri` and the ChatGPT compatibility alias
`openai/outputTemplate`, while the app-only grading tool remains unbound.

Full context projects `goalVisualization` and authorizes the renderer only when
there is an active atomic goal with a matching canonical image link and the
Cockpit visualization setting enabled. Upon such a fresh match, the coach calls
the renderer once with the unchanged `goalId`, copying the top-level
`stateVersion` into `expectedStateVersion`. Stale authorizations are neither
reused nor retried. The renderer revalidates backend state, goal ID, and state
version and returns only the bounded structured projection; its receipt never
replaces full context. Bare MCP `ImageContent` is not a visibility contract. The
UI component renders solely the image with alt text, keeping title, goal
description, and Cockpit link hidden. Whenever a valid image is absent or the
host omits the optional UI component, the complete text response remains
unchanged.

For an active flashcard goal, context exposes two clearly separated modes:
**Practice flashcards** (**Karteikarten lernen**) and **Verify with learning
coach** (**Mit Lerncoach prüfen**). The first mode invokes
`start_skillpilot_memory_practice`. Exclusively its UI component receives the
fronts and backs of a bounded due deck inside result `_meta`. Flipping cards as
well as stepping forward and backward stay purely local and write no state. Only
the explicit choice `Not yet known` (`Noch nicht gewusst`) or `Known`
(`Gewusst`) persists `not_known` or `known` atomically via the app-only tool
`review_skillpilot_memory_practice_card`. Only status and progress remain
visible to the model. Grading updates solely spaced-repetition scheduling,
mapping the two choices internally to SM-2 qualities `1` and `4`; it neither
sets mastery nor completes the active goal. The model launches the component
only once. After finishing a bounded deck, exclusively the component holding the
latest state version may load the next due deck. Math expressions and the small
permitted Markdown subset are rendered locally without unsafe HTML injection. If
the host cannot render the component, the Cockpit link supplied by the backend
remains the fallback.

**Verify with learning coach** (**Mit Lerncoach prüfen**) remains the existing
strict Verified Recall flow without hints. Only this verification can supply the
mastery evidence required for flashcard goals. The learner-facing German label
is „Karteikartenlernen“ or „Karteikarten lernen“, never „SRS-Kartendrill“.

The desktop Git beta is published, while the OpenAI directory remains
unpublished. No general host-compatibility guarantee is made for old widget test
messages. Nevertheless, content-addressed resources already delivered to live
test clients remain passively readable byte-for-byte so provider caches and
existing test chats do not fail with "Failed to fetch template". Acceptance
testing and troubleshooting are additionally carried out in a fresh chat after
refreshing the plugin.

The `learningSessionId` appears exclusively in the automatically prepared start
message and is subsequently forwarded as a tool parameter; it is neither a
permanent SkillPilot ID nor an OAuth token. The image card serves purely for
orientation—not as evidence, task, solution, assessment, or mastery action.

## 5. Technical Smoke Test

### 5.1 Stateless Discovery Bootstrap

For this one-time bootstrap state, set:

```text
SKILLPILOT_OPENAI_COACH_V1_BOOTSTRAP_ENABLED=true
SKILLPILOT_OPENAI_COACH_V1_ENABLED=false
SKILLPILOT_OPENAI_COACH_V1_OAUTH_ENABLED=false
SKILLPILOT_OPENAI_COACH_V1_MCP_ENABLED=false
SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED=false
```

Then run:

```bash
MCP_URL=https://mcp-coach-v1.skillpilot.com/mcp
RESOURCE_METADATA=https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp
AUTH_BASE=https://skillpilot.com

curl -fsS "$RESOURCE_METADATA" \
  | jq -e --arg resource "$MCP_URL" \
      --arg issuer "$AUTH_BASE/api/openai/v1" \
      '.resource == $resource
       and (.authorization_servers | index($issuer))'

curl -fsS "$AUTH_BASE/.well-known/oauth-authorization-server/api/openai/v1" \
  | jq -e --arg issuer "$AUTH_BASE/api/openai/v1" \
      '.issuer == $issuer
       and (.code_challenge_methods_supported | index("S256"))
       and (.token_endpoint_auth_methods_supported | index("client_secret_basic"))'

curl -fsS "$AUTH_BASE/api/openai/v1/.well-known/openid-configuration" \
  | jq -e --arg issuer "$AUTH_BASE/api/openai/v1" \
      '.issuer == $issuer
       and (.code_challenge_methods_supported | index("S256"))
       and (.token_endpoint_auth_methods_supported | index("client_secret_basic"))'

curl -sS -o /dev/null -D - \
  -X POST "$MCP_URL" \
  -H 'Content-Type: application/json' \
  --data '{}' \
  | sed -n '/^HTTP\|^[Ww][Ww][Ww]-Authenticate/p'

for path in oauth2/authorize oauth2/token oauth2/revoke oauth2/introspect; do
  test "$(curl -sS -o /dev/null -w '%{http_code}' \
    "$AUTH_BASE/api/openai/v1/$path")" = 404
done
```

Expected outcome: all three metadata fetches are valid, MCP responds `401` with
`WWW-Authenticate`, and every OAuth protocol endpoint returns `404`. The health
contributor internally still named `openAiDeCoach` for compatibility
deliberately does not exist in this state; general readiness of the remaining
SkillPilot service checks only process and database state and must stay `UP`.
That does not indicate availability of the disabled OpenAI profile.

### 5.2 Full Operation, Initially Read-Only

```bash
MCP_URL=https://mcp-coach-v1.skillpilot.com/mcp
RESOURCE_METADATA=https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp
AUTH_BASE=https://skillpilot.com
MANAGEMENT_BASE=http://127.0.0.1:8787
AUTH_METHOD="${SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_AUTHENTICATION_METHOD:-client_secret_basic}"

curl -fsS "$MANAGEMENT_BASE/actuator/health/readiness" \
  | jq -e '.status == "UP"'

curl -fsS "$MANAGEMENT_BASE/actuator/health/openaiReadiness" \
  | jq -e '.status == "UP"'

curl -fsS "$RESOURCE_METADATA" \
  | jq -e --arg resource "$MCP_URL" \
      --arg issuer "$AUTH_BASE/api/openai/v1" \
      '.resource == $resource
       and (.authorization_servers | index($issuer))
       and (.scopes_supported | index("skillpilot.openai.v1.read"))
       and (.scopes_supported | index("skillpilot.openai.v1.write"))'

curl -fsS "$AUTH_BASE/.well-known/oauth-authorization-server/api/openai/v1" \
  | jq -e --arg issuer "$AUTH_BASE/api/openai/v1" --arg auth "$AUTH_METHOD" \
      '.issuer == $issuer
       and (.code_challenge_methods_supported | index("S256"))
       and (.token_endpoint_auth_methods_supported == [$auth])
       and (.registration_endpoint | not)'

curl -fsS "$AUTH_BASE/api/openai/v1/.well-known/openid-configuration" \
  | jq -e --arg issuer "$AUTH_BASE/api/openai/v1" --arg auth "$AUTH_METHOD" \
      '.issuer == $issuer
       and (.code_challenge_methods_supported | index("S256"))
       and (.token_endpoint_auth_methods_supported == [$auth])
       and (.registration_endpoint | not)'

curl -sS -o /dev/null -D - \
  -X POST "$MCP_URL" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"curl-smoke","version":"1"}}}' \
  | sed -n '/^HTTP\|^[Ww][Ww][Ww]-Authenticate/p'
test "$AUTH_METHOD" = client_secret_basic
```

Expected outcome on the final request: `401` with a `WWW-Authenticate` header
pointing to the OpenAI V1 Protected Resource Metadata URL. A valid token lacking
write scope must instead receive `error="insufficient_scope"`.

Never copy tokens, cookies, authorization codes, SkillPilot IDs, or complete
student answers into shared logs or tickets.

`MANAGEMENT_BASE` refers to the internal or protected management endpoint;
Actuator must never be exposed unfiltered on the public application origin. When
authorized health details are inspected for deployment verification,
`contractHash` under `openAiDeCoach` must be identical across all instances of
the same artifact.

## 6. Acceptance Sequence

### Stage A – Isolated Read-Only Canary

This stage serves exclusively for targeted verification of discovery, OAuth,
session resolution, and read-only tools. Shared readiness intentionally remains
healthy during this stage; nevertheless, this state is not a functional
production coach.

- Missing or declined provider age confirmation must already fail at Cockpit
  launch with `403`, whereas a confirmed eligible person may proceed.
- Connect the app from a fresh chat and complete PKCE, consent, and callback.
- Missing/wrong client secret, wrong client ID, wrong callback URI, and wrong
  resource must fail under the OAuth contract without exposing secrets in
  responses or logs.
- Trigger **Start learning** (**Lernen starten**) twice in succession in
  SkillPilot and prove that two distinct `learningSessionId` values were created,
  each with its own independent absolute expiration.
- Verify `get_skillpilot_context` and all navigation queries using valid OAuth
  credentials and the matching session ID.
- For an active atomic goal with a matching canonical `goal-visualization` link,
  the full context result must include the image projection and renderer
  authorization. For that fresh result, the renderer runs once with its
  `goalId`, copying the top-level `stateVersion` into `expectedStateVersion`. On
  a supported web host it then displays solely the image, preserving alt text on
  the `img` element while omitting title, goal description, and Cockpit link. A
  cluster goal or an atomic goal lacking a valid or matching image link must
  never produce a blank or broken card, leaving the chat normally readable.
- When opening that same chat in the native mobile app, the ordinary chat reply
  must remain fully usable. The server delivers the exact same surface-neutral
  `goalVisualization` projection and renderer authorization as it does to other
  hosts; it does not attempt to guess client surface capabilities from
  `openai/userAgent` or similar hints. Whether a host renders or ignores the
  optional MCP Apps UI is host behavior and must never degrade the complete text
  path. Any host placeholder already stored inside an older message remains
  external historical presentation and cannot be removed retroactively from the
  server side.
- Using the same access token without a session ID—or with a wrong, expired, or
  another learner's session ID—must fail.
- Presenting a valid session ID without a valid OAuth access token must likewise
  fail.
- Browser reload, fresh chat, and extended dialogue must reload state cleanly
  from the backend as long as ChatGPT keeps forwarding the session ID to every
  tool.
- Mutations must be rejected cleanly while the write kill switch is disabled,
  without sending the user into re-authorization.
- Negative tests must cover other learners, foreign resource values,
  expired/revoked tokens, and missing scopes.

#### Routing Golden Prompts

After every change to tool title, tool description, or server instructions,
deploy the backend first and then run `Refresh` in the Developer Mode app.
Execute each test afterward in a fresh chat with the app enabled, recording tool
name, result, and visible response for every case:

| Prompt | Expected behavior |
| --- | --- |
| `Verwende SkillPilot Coach v1 und fahre fort.` without a current SkillPilot start message | No tool call. The coach briefly points in the conversation language to `https://skillpilot.com/`, WebGUI configuration, and **Lernen starten** / **Start learning**, where a fresh session is prepared for a new chat; the ordinary desktop beta launch passes it via a copied start message. |
| Same prompt with a current start message and `learningSessionId: sps_…` | `get_skillpilot_context` runs at the beginning of that learner turn. Level 2 is neither asked for nor modified; the reply relies solely on confirmed WebGUI context. After a successful mutation, its complete successor state governs the remainder of that same assistant turn without a redundant context fetch. |
| Same launch on an active atomic goal with an authorized image | After context succeeds, `render_skillpilot_goal_visualization` runs once with its `goalId`, copying the top-level `stateVersion` into `expectedStateVersion`. The domain coaching response remains complete afterward. |
| Image projection or renderer authorization absent | No renderer call and no empty image UI; the ordinary coaching reply remains complete. |
| A newer successful SkillPilot result already exists before the renderer runs | Only that newer result's image authorization may be used; the superseded image task is neither executed nor retried automatically. |
| `Ich möchte Mathe Oberstufe Hessen lernen.` with the app selected | Without a current start message, only the WebGUI notice is shown. With a valid session, the existing Level 2 configuration stays authoritative; changing it happens exclusively in SkillPilot followed by starting a new chat. |
| Any of the three session-recovery codes | The coach outputs the server instruction verbatim, appending the exact `startUrl` only if not already present. No domain answer, no OAuth reconnect; resume via WebGUI and a new chat. |
| `Lass uns dort weitermachen, wo ich aufgehört habe.` with the app selected | `get_skillpilot_context` loads persisted state without inventing a new learning path. |
| `Erkläre mir allgemein die Mitternachtsformel.` without the app selected and without a SkillPilot reference | SkillPilot is not invoked. |
| `Use SkillPilot Coach v1 and resume my current lesson.` | The context tool loads the session, and the response uses exclusively the interaction language fixed in that session. |

Per tool invocation, the application logs solely one bounded diagnostic line
recording tool name, status, and duration, for example:

```text
OpenAI V1 MCP tool invocation: tool=get_skillpilot_context status=success durationMs=42
```

Learning content, answers, tool arguments, tokens, and learner identifiers must
never appear in that log line. During live testing, inspect the line via
`journalctl -u skillpilot`.

### Stage B – Functional Write Pilot

Once Stage A passes, set `SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED=true` and
restart. Only this configuration may be approved as a functional domain write
pilot. Using a dedicated test learner profile, verify every user journey:

1. Curriculum, stage, subjects, profiles, and personalization in the WebGUI;
2. Scope and active frontier goal; switching goals via
   `set_skillpilot_active_goal` must update that visualization or cleanly omit
   it when no valid image exists;
3. Explanation, task, and mathematically/domain-equivalent alternative correct
   solution;
4. Mastery update including version-conflict handling;
5. Verified Recall with the exact server-pinned full batch, one-time expected
   answer release after a complete learner submission, a single atomic result
   write, and immediate backend continuation;
6. Exam delivery without solution-guiding follow-up hints and grading exclusively
   after a complete visible submission;
7. Resumption, parallel chat, retry, revocation, and reconnection.

In addition, verify the three Cockpit launch flows separately:

- `CURRENT_UNIT`: A single call to
  `POST /api/ui/learners/{skillpilotId}/openai/v1/launch` must apply both intent
  and learner state under the learner lock and generate exactly one new session.
  This holds regardless of whether the app is already authorized; OAuth token
  issuance must neither participate in nor block this step;
- Verified Recall: Goal and batch size must arrive as a typed first-party
  intent, be pinned server-side in the learning session, and not be re-selected
  in model-supplied start arguments. The activated goal must be validated
  server-side as an atomic memory/SRS goal. Starting returns all cards plus a
  `batchCapability`; the one-time expected-answer fetch returns a
  `gradingCapability`; a single complete write persists all ratings atomically
  and returns the continuation;
- Abi 2026: Course level and exam target must be persisted as typed fields and
  restricted to the known GK/LK campaign goals, existing `examData`, and the
  matching course tag;
- An initial MCP call in any arbitrary parallel chat must never consume or apply
  a pending start intent; every chat requires the session ID produced during its
  explicit launch;
- Once the TTL expires, the learning session must be rejected and purged
  independently of OAuth; expired OAuth codes and tokens are cleaned up
  separately while any still-valid app authorization remains intact;
- With exactly `PT1H` of remaining lifetime, a new operation must still succeed;
  with less than `PT1H`, both reads and new writes must terminate prior to domain
  execution with `SESSION_RENEWAL_REQUIRED`;
- Retrying a committed write with the same tool name, canonically identical
  arguments, and the same `clientRequestId` while the session has not expired
  and the pinned workflow/curriculum version remains available must return solely
  the stored result;
- Following any of the three session-recovery codes, domain execution must stop.
  The coach outputs `instruction` verbatim; if absent, it selects the exact
  entry from `instructions` matching the last authoritative
  `communicationLocale`, or otherwise the current conversation language,
  appending the exact `startUrl` only if not already contained in the
  instruction. Neither a domain answer nor an OAuth reconnect follows. The
  learner completes the launch in the WebGUI and continues in a new chat with
  the fresh start message;
- For the live boundary test, briefly enable the diagnostic gate and pass
  `diagnosticSessionTtlSeconds=3660` once exclusively on the first-party
  `/launch` endpoint (or `5400` for a 90-minute soak). Values `3600`, `86401`,
  values exceeding the normal TTL, and passing the field while the gate is
  disabled must fail closed without creating a session;
- Immediately afterward, another first-party launch omitting the diagnostic
  field must create a normal `PT24H` session again, while the global learning
  session TTL remains unchanged throughout the test.

Across all three launch types, the visible start message contains solely the
newly generated `learningSessionId` and the domain launch purpose—never the
permanent SkillPilot ID, OAuth token, client secret, or internal goal ID. In
browser-launched flows, the user never needs to copy or edit the session ID.

### Stage C – Web-First Handoff Canary

- A chat lacking a current SkillPilot start message invokes no tool and displays
  only the brief localized notice referencing `https://skillpilot.com/`.
- CREATE/EXISTING selection, provider notice, and full Level 2 configuration are
  completed exclusively in the first-party WebGUI.
- The ordinary entry **Start learning** / **Lernen starten** leads to provider
  selection. **Prepare learning with ChatGPT** (**Lernen mit ChatGPT
  vorbereiten**) generates a fresh opaque `learningSessionId` for **ChatGPT
  Desktop (Beta)** along with a short start message to copy into a new desktop
  chat, keeping the permanent SkillPilot ID outside the chat.
- Full context must load successfully at the beginning of every learner turn.
  After a successful mutation, its complete successor state is authoritative for
  the remainder of that same assistant turn and is not redundantly refetched.
  Level 3 focus and active goal remain the sole chat-side navigation mutations.
- Every session-recovery code follows the server-supplied instruction verified
  above via WebGUI and a fresh chat, with no domain answer and no OAuth
  reconnect.
- `resources/list` exposes the two active UI resources plus exclusively the
  image resources retained for cache compatibility. The unpublished
  provider-side launch path has no tool, resource, or runtime service.

The app becomes the default only once intended free and fixed consumer
subscription usage, Germany/EU availability, and target browser and app surfaces
are verified in practice. Across every surface, the ordinary textual chat reply
remains the mandatory fallback; the optional MCP Apps UI is part of the release
guarantee only on surfaces where it has been verified in practice.

## 7. Cockpit Canary and Cutover

The variant is an explicit per-frontend-artifact decision. The stable production
entry point at the repository root sets the current product choice `openai-mcp`,
while the generic deployment engine still accepts no implicit default. Every
engine invocation must specify exactly one of `visible-session`, `openai-mcp`,
or `legacy`.

For the multilingual MCP canary or cutover, the stable production command is:

```bash
./deploy_skillpilot.sh
```

The repository-root entry point deliberately sets the production variant to
`openai-mcp` and delegates to `scripts/deploy.sh`. The engine still rejects any
missing or invalid variant value, aborting **before** Git update, build, and
service restart. Artifact verification thus stays enforced without requiring a
build variable to be typed manually on every routine deployment. A rollback
explicitly overrides the variant via `--coach-variant visible-session` on that
same entry point. Any `VITE_SKILLPILOT_COACH_VARIANT` still lingering in the
shell environment is deliberately ignored by the production entry point.

The build records the resolved variant inside
`backend/src/main/resources/static/version.json` under `coachVariant` and inside
`backend/src/main/resources/static/index.html` as
`<meta name="skillpilot-coach-variant" ...>`. Immediately after the frontend
build, `scripts/deploy.sh` checks both values with
`scripts/verify_frontend_coach_variant.mjs`, stopping before backend build and
restart on any mismatch. After restart, that same verification script fetches
`version.json` and `index.html` again cache-free from `SKILLPILOT_BASE_URL`
(default: `https://skillpilot.com`), causing a stale `visible-session` build
behind a proxy or cache to fail the deployment as well.

The OpenAI MCP variant uses the single V1 app across all approved languages. The
server-created learning session fixes its `communicationLocale` at launch, while
plugin control plane and tool contract stay neutral English. Adding a language
creates neither another host nor another app.

The ordinary GUI entry **Start learning** (**Lernen starten**) offers Claude and
**ChatGPT Desktop (Beta)**, and the Cockpit entry returns to this provider
choice. Selecting ChatGPT calls
`POST /api/ui/learners/{skillpilotId}/openai/v1/launch` and presents the
prepared start message for copying into a fresh desktop chat via the button
**Prepare learning with ChatGPT** (**Lernen mit ChatGPT vorbereiten**).
`?coach=chatgpt-desktop` serves as an optional preselection; `?chatgptTest=1`
remains a compatible preselection without a separate launch card. The confirmed
Git/desktop beta route uses no automatic browser launch. Dedicated Recall and
exam launches keep their own intent and browser-launch contracts and do not
constitute desktop acceptance of this ordinary launch. Special launches are
prepared server-side as a narrow, auditable intent schema; free-form instruction
text from the browser is never accepted. Every ordinary successful call creates
a fresh `learningSessionId` with an exact 24-hour absolute lifetime regardless
of app authorization status and embeds it in that same prompt. The permanent
SkillPilot ID stays outside the OAuth principal, chat, URL prompt, and tool
contract. ChatGPT must pass the session ID from the prompt unchanged on
**every** domain MCP call. Because the session ID is not bound to a single chat
conversation, it can be reused in a fresh chat within its lifetime, though
neither usage nor OAuth refresh extends it. Exclusively the explicitly enabled,
request-local first-party diagnostic field described above may shorten an
individual test session without altering this default.

For `CURRENT_UNIT`, `VERIFIED_RECALL`, and `ABI26_EXAM`, the deployment canary
must additionally verify that ChatGPT populates the single `prompt` parameter
into the composer. Neither URL nor prompt may contain a permanent SkillPilot ID,
goal ID, OAuth token, or client secret, whereas the one-time `learningSessionId`
is explicitly required there.

## 8. Rollback

1. Explicitly rebuild and deploy the frontend with
   `./deploy_skillpilot.sh --coach-variant visible-session`. Artifact
   verification must confirm `visible-session`.
2. First set `SKILLPILOT_OPENAI_COACH_V1_WRITES_ENABLED=false`; for a complete
   shutdown, additionally set `SKILLPILOT_OPENAI_COACH_V1_MCP_ENABLED=false`,
   `SKILLPILOT_OPENAI_COACH_V1_OAUTH_ENABLED=false`,
   `SKILLPILOT_OPENAI_COACH_V1_ENABLED=false`, and
   `SKILLPILOT_OPENAI_COACH_V1_BOOTSTRAP_ENABLED=false`.
3. Disable the app in ChatGPT or withdraw the affected version in accordance
   with the [V1 release runbook](openai-plugin-v1-release.md).
4. Revoke existing OpenAI V1 connections server-side if warranted by a security
   incident.

Additive database tables may remain in place. The separate clean-slate Custom
GPT source tree under `ai/openai custom gpt/` is unaffected.

## 9. Remaining External Operations

Local code can neither configure live ChatGPT app administration nor confirm
provider review, subscription-tier availability, or a production OAuth callback.
Completing a safe cutover of the current MCP product path therefore still
requires:

- Configuring the exact same fixed client ID and long random client secret in
  both the V1 app and the SkillPilot server, adopting the actual callback URL,
  and selecting `client_secret_basic` at the token endpoint;
- Verifying that the backend port is unreachable directly from the public
  internet;
- Backing up the database and deploying the Spring Boot artifact including
  migrations and atomic environment switch;
- Updating the V1 app version with the canonical Server URL followed by fresh
  OAuth authorization;
- Recording positive and negative end-to-end evidence from ChatGPT;
- Only afterward enabling write operations and granting general release of the
  product path.

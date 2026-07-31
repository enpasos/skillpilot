# OpenAI MCP client authentication with mTLS

**Status:** optionale Härtung, derzeit nicht Teil des produktiven
Kompatibilitätsmodus. Der aktuelle Basisschutz ist normales
serverauthentisiertes HTTPS plus verpflichtendes OAuth/PKCE sowie
Resource-/Audience- und Scope-Prüfung.

## Security boundary

SkillPilot's productive baseline uses two independent controls and can add a
third:

1. **Normal TLS authenticates the SkillPilot server and protects transport.**
   The MCP resource additionally requires a valid OAuth access token.
2. **OAuth authenticates the configured SkillPilot MCP app as a confidential
   client.** Production accepts exactly one pre-registered client ID, an exact
   callback allowlist, mandatory PKCE `S256`, and
   `client_secret_basic` at the token endpoint. The long random client secret
   is configured only in ChatGPT and SkillPilot and is never written to this
   repository, documentation, browser storage, or logs. Tokens are restricted
   to the exact MCP resource/audience and scopes. DCR, CIMD,
   `private_key_jwt`, and unauthenticated token requests are not part of the
   active production profile.
3. **Optional mTLS authenticates the OpenAI connector infrastructure as the
   MCP client.** It does not by itself attest one uniquely named app. If this
   hardening is enabled, only the V1 public resource `/mcp` on
   `mcp-v1.skillpilot.com` and its subpaths require an OpenAI-managed client
   certificate. Nginx maps it internally to
   `/internal/openai/de/v1/mcp` over loopback.
4. **A separate SkillPilot learning-session ID selects the learner context.**
   Every explicit **Lernen starten** action creates a fresh, high-entropy
   session valid for exactly 24 hours. SkillPilot inserts it automatically into
   the prepared ChatGPT prompt, and ChatGPT passes it unchanged to every fachlicher
   MCP tool. OAuth alone never creates or selects a learning session, and a
   session ID alone never authorizes MCP access. Discovery, authorization,
   token, and browser callback endpoints remain reachable without a client
   certificate.

This follows OpenAI's current requirement to validate that the presented leaf
certificate chains to the published OpenAI Connectors mTLS intermediate CA, is
valid for client authentication, and has the exact DNS SAN
`mtls.prod.connectors.openai.com`. Leaf fingerprints are not pinned because
OpenAI rotates them:

https://developers.openai.com/plugins/build/auth#mutual-tls-mtls

## Components

The following components are installed only when the optional hardening is
activated:

- `deploy/openai-mtls/`: pinned OpenAI root/intermediate CA certificates,
  provenance and hashes, nginx template, and verifier systemd unit.
- `scripts/openai_mtls_verifier.py`: loopback-only `auth_request` service that
  uses the pinned OpenAI root as its only trust anchor, supplies the separately
  pinned Connectors intermediate as the only untrusted chain certificate, and
  rechecks that intermediate's fingerprint, the leaf issuer, client-auth EKU,
  validity, and exact SAN.
- `OpenAiDeMtlsEdgeFilter`: Spring defense-in-depth gate. It accepts MCP
  requests only from a configured numeric trusted proxy and only with the
  nginx-created verification headers.

Nginx uses `ssl_verify_client optional` at TLS-server scope because TLS client
certificate negotiation cannot safely be enabled in a normal HTTP location.
The MCP locations then reject `NONE`/failed verification and use
`auth_request` for the SAN/EKU check. OAuth and discovery never enter those
locations.

## Optional one-time production installation

Do not perform these steps for the normal TLS/OAuth compatibility mode. This
is a separate privileged hardening operation, not part of the normal
application deployment. Before changing production, back up the database and
the active nginx configuration. Record the fixed OAuth client ID, production
callback URL, resource/audience, scopes, and secret-rotation procedure. Never
copy the client secret into the runbook, shell history, deployment output, or
logs.

```bash
cd /home/enpasos/skillpilot
PYTHONDONTWRITEBYTECODE=1 python3 -B scripts/test_openai_mtls_edge.py
sudo ./scripts/install_openai_mtls_edge.sh
```

Inside the dedicated `listen 443 ssl` server block for
`mcp-v1.skillpilot.com`, add:

```nginx
include /etc/nginx/snippets/skillpilot-openai-de-v1-edge.conf;
```

Remove any old include of
`/etc/nginx/snippets/skillpilot-openai-de-mtls.conf` from the
`skillpilot.com` TLS server block before running the installer. The installer
then removes the inactive stale file; it stops instead of breaking nginx when
the include is still active. `--installed` also fails if the old route or
snippet remains.

Do not put the include at global `http` scope and do not copy its client
certificate requirement to OAuth or well-known locations.
The protected-resource metadata
`https://mcp-v1.skillpilot.com/.well-known/oauth-protected-resource` remains
public. The exact OAuth Resource/Audience is the origin
`https://mcp-v1.skillpilot.com`, while the OAuth issuer remains on
`https://skillpilot.com/api/openai/de`.

Set:

```dotenv
SERVER_ADDRESS=127.0.0.1
SKILLPILOT_OPENAI_DE_MCP_URL=https://mcp-v1.skillpilot.com/mcp
SKILLPILOT_OPENAI_DE_OAUTH_RESOURCE=https://mcp-v1.skillpilot.com
SKILLPILOT_OPENAI_DE_UI_ORIGIN=https://ui-v1.skillpilot.com
SKILLPILOT_OPENAI_DE_RESOURCE_METADATA=https://mcp-v1.skillpilot.com/.well-known/oauth-protected-resource
SKILLPILOT_SERVER_BUILD=<vollständiger Git-SHA des Deployments>
SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED=true
SKILLPILOT_OPENAI_DE_MTLS_EDGE_TRUSTED_PROXIES=127.0.0.1,::1
```

In compatibility mode, keep the edge disabled and do not install the nginx
include:

```dotenv
SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED=false
```

`SERVER_ADDRESS=127.0.0.1` is mandatory for the single-host deployment. A
firewall must also deny public access to port 8787. If nginx and Spring later
run on different hosts, use a private network, list only the exact numeric
proxy addresses, and keep the backend port unreachable from the Internet.

Activate and verify:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart skillpilot
sudo ./scripts/verify_openai_mtls_edge.sh --installed
```

The negative public test must return `403` for the MCP URL without a client
certificate, while both discovery URLs return `200`. A positive production
test is performed through the connected ChatGPT app, because only OpenAI owns
the client certificate.

The intended first-cutover order is:

1. database and nginx backup;
2. record the fixed confidential client ID, exact callback, resource/audience,
   scopes, and secret-rotation procedure;
3. run the static verification;
4. install verifier and nginx snippet;
5. set the secure backend variables without printing the client secret;
6. activate nginx gate and backend together in a maintenance window;
7. run the privileged `--installed` verification;
8. reconnect once and run a positive end-to-end test through ChatGPT that
   proves both the OAuth client binding and a fresh **Lernen starten** session;
9. prove the negative cases: OAuth without a learning-session ID and a session
   ID without OAuth must both be rejected.

Rotating the confidential client credentials invalidates the old app
connection and normally requires reconnecting the app. Rolling back only the
application does not restore revoked tokens or replaced client credentials.

## Verification modes and deployments

```bash
# Repository and pinned-certificate checks; suitable for CI:
PYTHONDONTWRITEBYTECODE=1 ./scripts/verify_openai_mtls_edge.sh

# Privileged installation/nginx verification; one-time setup and CA rotation:
sudo ./scripts/verify_openai_mtls_edge.sh --installed

# Unprivileged live boundary check:
./scripts/verify_openai_mtls_edge.sh --runtime
```

`./deploy_skillpilot.sh` invokes the mTLS `--runtime` gate only when
`SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED=true`. The gate then verifies the local
verifier service, loopback-only backend/verifier listeners, public MCP `403`
without a client certificate, and public discovery `200`. It deliberately
does not install CA files or modify nginx. An mTLS-enabled deploy therefore
fails closed if the separately installed security boundary is missing.

With `SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED=false`, the normal deployment
does not require the verifier or an OpenAI client certificate. The public MCP
resource still rejects requests without a valid OAuth token, normally with
`401`, while discovery remains available.

## Header and bypass rules

The MCP locations overwrite the internal verification headers and clear
forwarded client-certificate aliases. The local verifier receives certificate
data only from nginx TLS variables. Spring additionally requires the request
to arrive from the configured local proxy.

Never trust an Internet-supplied certificate or verification header, never
expose the verifier port 8792, and never expose Spring port 8787 publicly.

## CA rotation

The source URLs and pinned SHA-256 values are recorded in
`deploy/openai-mtls/PROVENANCE.md`. To rotate:

1. download both CA files only from the official OpenAI documentation links;
2. inspect CA constraints and verify the intermediate against the root;
3. update the pinned files, file hashes, and X.509 fingerprints;
4. run `PYTHONDONTWRITEBYTECODE=1 scripts/verify_openai_mtls_edge.sh`;
5. reinstall the pinned files and unit;
6. restart `skillpilot-openai-mtls-verifier` explicitly;
7. reload nginx and run the privileged `--installed` verification.

Do not add or pin a leaf certificate fingerprint.

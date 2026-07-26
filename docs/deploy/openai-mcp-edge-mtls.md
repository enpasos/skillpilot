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
2. **OAuth enforces SkillPilot's explicitly configured client registration and
   grant contract.** The supported baseline is a pre-registered public client
   with authentication method `none`, exact client ID and callback allowlist,
   and mandatory PKCE `S256`. Its public client ID is not a credential and does
   not cryptographically authenticate a client; PKCE protects redemption of
   the authorization code. An optional stronger profile uses an exact HTTPS
   CIMD client ID, same-origin JWKS and `private_key_jwt` for cryptographic
   client authentication. Resource and scopes are exact in both profiles.
   Neither profile by itself attests the visible app name.
3. **Optional mTLS authenticates the OpenAI connector infrastructure as the
   MCP client.** It does not by itself attest one uniquely named app. If this
   hardening is enabled, only the resource `/api/openai/de/mcp` and its
   subpaths require an OpenAI-managed client certificate.
4. **OAuth 2.1 authenticates and authorizes the learner.** Discovery,
   authorization, token, and browser callback endpoints remain reachable
   without a client certificate.

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
the active nginx configuration. Record the selected OAuth client profile,
exact client ID, production callback URL and any exact legacy client IDs. For
the optional CIMD profile, also record the CIMD and JWKS URLs.

```bash
cd /home/enpasos/skillpilot
PYTHONDONTWRITEBYTECODE=1 python3 -B scripts/test_openai_mtls_edge.py
sudo ./scripts/install_openai_mtls_edge.sh
```

Inside the existing `listen 443 ssl` server block for `skillpilot.com`, add:

```nginx
include /etc/nginx/snippets/skillpilot-openai-de-mtls.conf;
```

Do not put the include at global `http` scope and do not copy its client
certificate requirement to OAuth or well-known locations.

Set:

```dotenv
SERVER_ADDRESS=127.0.0.1
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
2. record the selected client profile, exact client ID, callback, and exact
   legacy client IDs only if an actual client switch is planned; for the
   optional stronger profile additionally record CIMD and JWKS;
3. run the static verification;
4. install verifier and nginx snippet;
5. set the secure backend variables; configure the one-time exact legacy
   client allowlist only for an actual client switch;
6. activate nginx gate and backend together in a maintenance window;
7. run the privileged `--installed` verification;
8. reconnect once and run a positive end-to-end test through ChatGPT;
9. if a legacy-client allowlist was used, remove it from the environment after
   the successful cutover.

Any old tokens, consents, client registrations, and provider connections named
by a configured cutover allowlist are deliberately removed or revoked. Rolling
back only the application does not restore them.

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

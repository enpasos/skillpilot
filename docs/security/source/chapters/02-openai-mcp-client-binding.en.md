## OpenAI MCP: Authorized Client Binding {#sec:sec-openai-mcp-client-binding}

:::note{title="Binding security architecture for the OpenAI MCP coach"}
Original baseline: 31 July 2026 · Reconciled with the permanent neutral plugin decision of 19 October 2026 (`skillpilot-coach` on `https://mcp-openai.skillpilot.com/mcp`, superseding the earlier `https://mcp-coach-v1.skillpilot.com/mcp` endpoint ahead of directory submission while retaining OAuth issuer `https://skillpilot.com/api/openai/v1`). Identity, cutover, and lifecycle rules are governed by the [Versioning and Lifecycle Plan](repo:docs/concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md) and the [Stable Origin Runbook](repo:docs/deploy/openai-stable-origin.md).
:::

### Protection Objective {#sec:sec-mcp-protection-goal}

The permanent SkillPilot ID remains the learner-held secret that guards durable learning state. This chapter addresses an orthogonal security objective:

> An unauthorized third-party client must not be able to invoke learner-specific OpenAI V1 MCP APIs, even if it knows both the public server contract and a valid `learningSessionId`.

This boundary leaves the SkillPilot ID as well as learning-goal, mastery, curriculum, and coach semantics unchanged.

### Four Independent Proofs {#sec:sec-mcp-four-proofs}

:::table{cols="3.4cm,4.6cm,X"}
| Proof | Purpose | Binding mechanism |
| --- | --- | --- |
| **SkillPilot Server** | Confidentiality and server authentication | Standard HTTPS/TLS terminated at the dedicated reverse proxy. |
| **OpenAI Connector** | Only hosted ChatGPT connections signed by OpenAI's CA chain reach the production edge | mTLS validated against OpenAI Root CA, Connectors intermediate, `clientAuth` EKU, and exact SAN `mtls.prod.connectors.openai.com`. |
| **Authorized MCP App** | Only the explicitly permitted client receives usable OAuth tokens | Pre-registered confidential OAuth client (`client_secret_basic` + exact callback allowlist + PKCE `S256`) for the hosted directory lane; separate strictly pinned desktop CIMD profile (`S256`) without fallback for native desktop. |
| **Active Learning Session** | The concrete chat addresses strictly the learner chosen at WebGUI launch | Fresh 24-hour `learningSessionId` minted on every **Lernen starten** / **Start learning** click and required on every domain MCP tool call. |
:::

Every domain MCP call must satisfy cumulatively:

```text
valid client- and resource-bound OAuth access token
AND
valid explicit learningSessionId
AND (in production hosted enforce mode)
valid OpenAI connector client certificate
```

OAuth authenticates and authorizes the App; the learning session selects the learner. Neither proof substitutes for the other.

### Binding OAuth Client Profile {#sec:sec-mcp-oauth-profile}

For the hosted ChatGPT directory lane (**SkillPilot Coach**, technical name `skillpilot-coach`), exactly one pre-configured confidential OAuth client is provisioned:

- fixed author-chosen `client_id` and high-entropy random `client_secret`;
- byte-exact callback URL registered in the ChatGPT App management console;
- token-endpoint authentication exclusively via `client_secret_basic`, paired with Authorization Code + PKCE `S256` only;
- exact public Resource/Audience `https://mcp-openai.skillpilot.com/mcp` (no dual audiences alongside the retired `mcp-coach-v1` origin);
- separated read and write scopes, short access-token TTL, rotating refresh tokens, and explicit revocation.

The client secret exists exclusively in two protected locations: (1) the confidential OAuth settings of the ChatGPT App and (2) the protected SkillPilot server environment — never in repositories, browser bundles, launch prompts, chats, MCP tool arguments, responses, or logs.

In addition, a **strictly separate, byte-pinned public CIMD profile** (`7yTcOAOqrumX` client/callback on the same neutral resource with PKCE `S256`; see [Native CIMD Runbook](repo:docs/deploy/openai-native-cimd.md)) is authorized for native ChatGPT Desktop integration. That profile never acts as a fallback from failed confidential authentication. Open Dynamic Client Registration (DCR), unpinned CIMD documents, arbitrary `none` clients, and `private_key_jwt` are excluded from production.

### OAuth Flow and Resource Validation {#sec:sec-mcp-oauth-checks}

The Authorization Server accepts an authorization-code flow only when (1) `client_id` matches an explicitly pinned profile, (2) `redirect_uri` matches its byte-exact allowlist, (3) PKCE `S256` is used, (4) `resource` equals the active MCP resource, and (5) only permitted scopes are requested. At the token endpoint, the confidential client must additionally prove possession of its secret via HTTP Basic.

On every MCP request, the Resource Server verifies token signature or active introspection, issuer (`https://skillpilot.com/api/openai/v1`), expiry and revocation, exact audience/resource, exact client ID, required read or write scope, and the explicit valid `learningSessionId`. A valid OAuth token can neither select a learner nor create a session; the OAuth subject is never an identity source or fallback.

### Learning Session as Separate Application Binding {#sec:sec-mcp-session-binding}

Per the [OAuth and Learning-Session Contract](repo:docs/concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.md), clicking **Lernen starten** / **Start learning** mints a fresh random ID on every start (valid for a fixed 24 hours without extension, stored server-side solely as an HMAC hash linked to the learner). New domain operations require at least `PT1H` remaining lifetime (exact `PT1H` is valid). An already committed write may replay its stored result without re-mutating state only when at least `PT1H` remains and tool name, canonical arguments, `clientRequestId`, pinned workflow/curriculum availability, and canonical learner revision all match.

`SESSION_REQUIRED`, `SESSION_RENEWAL_REQUIRED`, and `SESSION_VERSION_UNAVAILABLE` are session boundaries rather than OAuth errors: the coach outputs `instruction` verbatim (or selects the exact localized entry from `instructions`, appending `startUrl` only if absent) without domain output, retry on the expired session, or OAuth re-authentication. The learner starts a fresh session in a new chat from the first-party WebGUI while the permanent SkillPilot ID stays server-side.

### mTLS at the MCP Edge {#sec:sec-mcp-mtls-edge}

Hosted ChatGPT connectors present an OpenAI-managed client certificate during TLS handshake. The dedicated MCP virtual host trusts solely the published OpenAI Root CA and Connectors intermediate (without pinning rotating leaf certificates), while a loopback-bound verifier checks certificate chain, `clientAuth` EKU, and exact SAN `mtls.prod.connectors.openai.com`:

- **`observe`:** Valid certificates classify as `VERIFIED`; connections without a certificate pass provisionally to the unchanged OAuth layer and count solely as `OBSERVE_NO_CERT` (for controlled integration and native desktop verification, not a hosted publication state). Any invalid presented certificate is rejected unconditionally.
- **`enforce`:** External `/mcp` calls require `VERIFIED`. Only direct loopback socket peers may exercise the unchanged OAuth path locally as `LOCAL_OPERATOR`; internet headers, query parameters, and `X-Forwarded-For` never create a bypass.

Protected-resource metadata and domain-verification challenges remain reachable without a client certificate. mTLS authenticates OpenAI connector infrastructure and substitutes for neither OAuth nor `learningSessionId`.

### Fail-Closed Startup Invariants and Secret Lifecycle {#sec:sec-mcp-fail-closed-secrets}

When the OpenAI V1 provider is enabled, server startup fails closed if any invariant is missing or inconsistent: dedicated high-entropy `SKILLPILOT_SIGNING_SECRET` with at least 32 non-whitespace characters (no placeholders or defaults, never logged), consistent pinned client configuration (non-empty client ID, strong client secret of at least 32 — preferably 48+ — random bytes for `client_secret_basic`, exact HTTPS callback allowlist, PKCE `S256`, exact HTTPS resource and OAuth endpoints), exact mode agreement across root nginx, backend, and internal classification, and disabled open DCR / unpinned profiles. Port `8787` must remain closed to the public internet; the reverse proxy terminates TLS and forwards only approved routes to `/internal/openai/v1/mcp`.

The production OAuth client secret is generated outside the repository, stored identically only in ChatGPT App settings and the SkillPilot server environment, never echoed in status or error endpoints, and rotated immediately upon suspected compromise (with token revocation and App re-authorization). Rotating `SKILLPILOT_SIGNING_SECRET` intentionally invalidates active learning sessions as a planned session cutover. Rotating OAuth client credentials never preserves or reactivates sessions as an identity substitute.

### Acceptance, Negative Tests, Residual Assumptions, and References {#sec:sec-mcp-tests-and-assumptions}

Before release, objective negative tests must fail closed for: token requests missing authentication, carrying a wrong secret, or naming a foreign client ID; unpinned auth methods (`client_secret_post`, open DCR, unpinned `none`/CIMD/`private_key_jwt`); mismatched callback URL or missing/invalid PKCE; missing/wrong resource or scope; revoked/expired tokens; valid OAuth without `learningSessionId` and valid session without OAuth; unknown, tampered, revoked, or expired sessions; direct bypass to port `8787`; and in `enforce` mode any external `/mcp` request lacking a valid OpenAI client certificate, presenting a wrong chain/SAN/EKU, or spoofing forwarding/classification headers. Positive end-to-end verification runs through the configured App (public positive `enforce` mTLS proof can only be executed by the real hosted ChatGPT connector holding OpenAI's private key).

**Residual assumptions:** This architecture does not protect against compromise of the SkillPilot host, reverse proxy, or ChatGPT App configuration, learner-side loss of a SkillPilot ID or live session link, leak of the production client secret, or deliberate sharing of a valid access token paired with a live session — mitigated via secret rotation, short token TTLs, fixed 24h session lifetimes, revocation, minimal scopes, and redacted logging.

**Normative OpenAI references:** [Client identification](https://developers.openai.com/plugins/build/auth#client-identification) · [Client registration & authentication](https://developers.openai.com/plugins/build/auth#client-registration) · [Resource/Audience parameter](https://developers.openai.com/plugins/build/auth#echo-the-resource-parameter-throughout-the-oauth-flow) · [Mutual TLS (mTLS)](https://developers.openai.com/plugins/build/auth#mutual-tls-mtls).

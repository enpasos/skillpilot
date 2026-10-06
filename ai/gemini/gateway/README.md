# Gemini beta gateway

This Apache-2.0 Node.js 22 gateway supplies isolated OAuth for an
operator-managed Gemini custom app. It forwards authenticated MCP requests to
the exact loopback Spring endpoint `/gemini/v1/mcp`, using a 30-second,
single-use HMAC assertion bound to the original request bytes, route, connection
and public resource audience. The original OAuth bearer token never reaches
Spring. The learner is selected separately by the provider-specific `spg_`
learning session in the structured tool inputs.

```bash
cd ai/gemini/gateway
npm ci --ignore-scripts
npm test
GEMINI_GATEWAY_PORT=8795 GEMINI_BACKEND_MCP_URL=http://127.0.0.1:8080/gemini/v1/mcp npm start
```

Startup requires private `.runtime/connection.json`, `operator-key`,
`client-secret`, `gateway-secret` and an exactly pinned callback list in
`gemini-callback.txt`. No secrets are generated or printed by the CLI. Keep
the directory mode `0700` and the files `0600`. The private directory and
`events.jsonl` audit are ignored by Git.

The complete config, Spring configuration, callback procedure and lifecycle
limits are in [the integration runbook](../../../docs/deploy/gemini-integration.md#lokalen-oauth-gateway-und-spring-adapter-starten).
For a controlled deployment, also follow the
[backend rollout and operator activation steps](../../../docs/deploy/gemini-integration.md#produktionsrollout-und-anschließende-aktivierung).
The ordinary backend deploy does not start this process or configure its HTTPS
edge. The gateway must share the backend's network namespace because both the
upstream URL and Spring's peer check require loopback. Keep the existing
backend listener, database and other provider settings; publish only the
gateway on its own stable HTTPS origin. The CLI reads `.runtime/` beside this
installed gateway source, with no alternate configuration-directory option.
The current gateway is an operator profile for a controlled integration test;
it is not an accepted public multi-user OAuth service. A fixed confidential
client and the exact scope set `skillpilot.read skillpilot.write` are required.
Access tokens expire after five minutes. Refresh tokens rotate within one
absolute one-hour grant. Grants are in memory and disappear on restart.
The independent learner session has an absolute 24-hour lifetime. Tool calls require at least one hour remaining, so prepare a new session after at most 23 hours.

Tests verify local OAuth, PKCE, resource binding, refresh, revocation, the
signed bridge and native JSON/SSE response normalization. They do not prove
Gemini host acceptance or authorize deployment.

The [controlled production-test deployment material](../../../deploy/gemini-v1/README.md)
adds a dedicated systemd unit, private configuration, TLS/ACME nginx files and
an idempotent preparation installer. It preserves existing keys and never
starts/restarts services or edits the existing Spring EnvironmentFile. All
production activation and actual Gemini acceptance remain explicit operator
steps; direct in-chat learning-goal image display is still unaccepted.

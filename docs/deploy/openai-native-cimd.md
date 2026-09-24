# ChatGPT desktop plugin: native CIMD on the existing V1 endpoint

The Product Owner authorized this integration on **24 September 2026**, after
successfully importing and installing the `1.1.0` plugin archive in ChatGPT.
The connection failed when **Authenticate** was selected. The desktop UI
offered Auto, CIMD and DCR. Current public discovery advertised only
`client_secret_basic`, with neither CIMD nor a registration endpoint. The edge
journal also recorded `403 / certificate_required` during the test window.

**Status:** implemented locally; production activation and successful
authentication/learning in the real desktop host are still pending.

The chosen implementation keeps **one MCP endpoint** and **one OAuth issuer**:

| Purpose | URL |
| --- | --- |
| MCP and exact OAuth resource | `https://mcp-coach-v1.skillpilot.com/mcp` |
| Protected resource discovery | `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp` |
| OAuth issuer | `https://skillpilot.com/api/openai/v1` |
| Authorization server discovery | `https://skillpilot.com/.well-known/oauth-authorization-server/api/openai/v1` |

The existing imported plugin already declares this URL. There is no new MCP
transport, copied coach implementation, native-specific skill, or DCR endpoint.
An explicit native OAuth client profile adds the desktop authentication flow.

## Native client contract

The [official desktop MCP documentation](https://learn.chatgpt.com/docs/extend/mcp#oauth-client-registration)
describes native CIMD with public-client token authentication (`none`), S256
PKCE, and a loopback callback. This differs from hosted ChatGPT CIMD with
`private_key_jwt`. A public OAuth client cannot safely hold a distributed client
secret. `none` therefore means **no client secret at the token endpoint**;
MCP access still requires a valid OAuth access token and learning operations
still require the independently issued learning-session capability.

The pinned identity for the existing endpoint is:

```text
https://chatgpt.com/oauth/codex/Su4_F3uWAhkS/client.json
```

The exact callback host/path is:

```text
http://127.0.0.1:<ephemeral-port>/callback/Su4_F3uWAhkS
```

The port is selected by the native client. The public OpenAI document also lists
`localhost`; SkillPilot accepts the documented default `127.0.0.1` flow. The
metadata document was fetched successfully on 24 September 2026 and declares
`application_type: native`, `none`, authorization code and refresh token grants.
The callback ID is derived from the complete normalized MCP URL, without a
fragment: the first nine SHA-256 bytes encoded as unpadded base64url. This was
verified against OpenAI's
[Codex implementation](https://github.com/openai/codex/blob/29f056c26c09b51db123069ed3ec2095b227d6db/codex-rs/rmcp-client/src/oauth_callback.rs#L90).

The native profile is `chatgpt-native-cimd-public`. Its identity, callback,
metadata, grants, scopes and policy provenance are checked independently of
the existing Basic and hosted JWT profiles. Failed confidential authentication
does not fall back to the public profile. Code exchange requires S256 PKCE;
refresh rotation includes durable token-family reuse protection. A native
token cannot authorize a different resource or provider. OAuth never selects a
learner, and learner IDs or answers never belong in client metadata.

## Configuration and mTLS

Native CIMD is disabled by default. The deployment configuration for the
authorized integration test is:

```dotenv
SKILLPILOT_OPENAI_COACH_V1_OAUTH_NATIVE_CIMD_ENABLED=true
SKILLPILOT_OPENAI_COACH_V1_OAUTH_NATIVE_CIMD_CLIENT_ID=https://chatgpt.com/oauth/codex/Su4_F3uWAhkS/client.json
SKILLPILOT_OPENAI_COACH_V1_OAUTH_NATIVE_CIMD_AUTHORIZATION_POLICY_VERSION=native-cimd-v1
SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE=observe
```

The existing primary Basic/JWT profile and its credentials retain their own
configuration. Do not set its authentication method to `none`: native CIMD is
an additional named profile. Metadata publishes the union of the enabled
profiles' token methods and `client_id_metadata_document_supported: true`.
There is no `registration_endpoint`.

Health exposes `nativeCimdEnabled` and `nativeClientMetadataReady`. The latter
reports the current metadata cache after an authorization attempt; health
checks perform no metadata fetch. Overall `UP` is not proof of a working
desktop connection.

The Product Owner explicitly permits **normal HTTPS without a mandatory client
certificate** for this first working integration. `observe` admits certificate
absence through to OAuth; invalid presented certificates are still rejected.
Backend and root-owned Nginx mode must agree. Changing only the environment
variable leaves Nginx enforcing its previous mode.

When deploying the reviewed implementation, coordinate these steps:

1. Set the above native profile values and `observe` in the service environment.
2. Install the matching edge mode using the repository installer:

   ```bash
   sudo ./scripts/install_openai_v1_mtls_edge.sh --mode observe \
     --service-environment-file /etc/skillpilot/skillpilot.env
   ```

3. Deploy/restart the backend through the normal deployment workflow. Validate
   Nginx configuration and reload it. The edge installer updates its mode and
   verifier but does not itself reload Nginx or restart the SkillPilot backend.
4. Verify the installed configuration and public behavior:

   ```bash
   SKILLPILOT_OPENAI_COACH_V1_OAUTH_NATIVE_CIMD_ENABLED=true \
     ./scripts/verify_openai_v1_mtls_edge.sh --runtime --expected-mode observe
   ```

An unauthenticated request without a client certificate must reach the OAuth
challenge (`401` with protected-resource metadata), rather than fail with the
former certificate `403`. Valid OAuth remains mandatory for MCP tools.

Disabling the native profile blocks its grants without disabling the existing
hosted client. Re-enabling a retired policy requires a new policy revision and
new grants. Return to `enforce` only as a coordinated transport change with a
client that demonstrably supplies the required certificate.

## Real-host test

1. In the desktop app's MCP settings, use the installed
   `skillpilot-coach-v1` entry. Leave registration at Auto (or select CIMD),
   choose **Authenticate**, and complete authorization.
2. Open `https://skillpilot.com/?chatgptTest=1`, load a test learner and complete
   its Personal Curriculum. The explicit test URL adds **ChatGPT ausprobieren**
   to the completed setup. It does not change public provider availability.
3. Choose **Startnachricht erzeugen** and confirm the existing provider
   eligibility prompt. The first-party UI calls the existing V1 launch endpoint
   once, obtaining a fresh session and an authoritative prepared message.
4. Copy that message into a new desktop chat with **SkillPilot Coach v1** selected.
   The message stays in component memory until copied; it is not stored in
   browser storage. A changed learner, curriculum or language clears the handoff.
5. Verify the actual `get_skillpilot_context` call and expected session language,
   then a representative learning flow, persisted progress and continuation.
   Verify reauthorization/refresh separately. Import, installation, consent and
   local test results do not by themselves establish these outcomes.

The default starter question without a prepared session should only explain
the first-party start. It is not an authenticated learning-session test. Keep
the current source revision, deployed revision and sanitized host results with
the acceptance record. Do not publish live tokens, session capabilities or
private learner data in that record.

## Local verification

The existing OAuth CI includes the native profile, document-validation and
refresh-family suites and requires their executed test reports. The shared
learning-flow test runs against both the hosted and native clients. These
checks use synthetic data and do not authenticate a real desktop installation.

Relevant local checks are:

```bash
cd backend
./gradlew test --console=plain \
  --tests 'com.skillpilot.backend.openai.de.oauth.*Test' \
  --tests 'com.skillpilot.backend.openai.nativev1.oauth.*Test' \
  --tests 'com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachEndToEndIntegrationTest'
```

From the repository root, also run the existing session-setup UI test,
OAuth CI guard and public-edge checks. The native migration `038` was applied
and reapplied successfully with Spring Liquibase on a disposable local
PostgreSQL **18.1** instance on 24 September 2026; foreign-key, index and locking
SQL checks passed. This local probe does not replace the CI PostgreSQL 15 lane
or a production deployment check.

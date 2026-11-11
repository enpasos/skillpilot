## SkillPilot: Versioning and Lifecycle Architecture for the OpenAI Plugin {#sec:openai-plugin-versioning}

:::note{title="Scope and release status"}
Binding internal architecture specification governing versioning, dedicated hash-addressed MCP Apps UI resources, bundled skills, and lifecycle management for the OpenAI plugin. The published Git beta `skillpilot-coach-v1` `1.1.2` and its install bytes, together with the rejected `1.0.0` review history ([Review Freeze History](repo:docs/deploy/openai-plugin-v1-review-freeze.md)), remain preserved unchanged. The neutral local `1.1.3` candidate (including the local `9c09821e96ab…` handshake fix alongside retained `12762009…` and deployed `08030…` bytes, with Voice image-sequence host acceptance still pending) represents pre-submission preparation — neither a deployment, portal publication, nor real-client acceptance.
:::

### Decision of 19 October 2026: One Permanent Neutral Plugin {#sec:plugin-decision-2026-10-19 anchors="neubewertung-vom-19-oktober-2026-eine-dauerhafte-plugin-identität,entscheidung-vom-19-oktober-2026-ein-dauerhaftes-neutrales-plugin"}

On **19 October 2026**, the Product Owner established a single permanent plugin **SkillPilot Coach** with technical package name **`skillpilot-coach`** and a neutral public MCP origin ahead of directory submission. This supersedes both the initial recommendation to keep `skillpilot-coach-v1` and its endpoint and the earlier one-plugin-per-major identity model.

:::table{cols="5.4cm,X"}
| Boundary | Permanent specification |
| --- | --- |
| Technical package name | `skillpilot-coach` |
| Public display name | `SkillPilot Coach` (<= 30 characters) |
| Public MCP endpoint & OAuth Resource/Audience | `https://mcp-openai.skillpilot.com/mcp` |
| Widget origin (`_meta.ui.domain`) | `https://mcp-openai.skillpilot.com` |
| Protected Resource Metadata | `https://mcp-openai.skillpilot.com/.well-known/oauth-protected-resource/mcp` |
| Existing OAuth issuer | `https://skillpilot.com/api/openai/v1` |
| Current internal adapter | `/internal/openai/v1/mcp`, `contractMajor = 1` |
:::

Package SemVer, public identity, and domain tool contract are decoupled: future `2.x` package versions may keep the same tool contract, and internal workflow generations require no new public name or origin because OpenAI's plugin update flow does not support changing origins on an already published plugin.

- **Bounded technical cutover & desktop CIMD:** The existing internal V1 adapter, scopes, and session gates stay unchanged (`v1` in the OAuth issuer names the existing authorization server instance rather than constraining package majors). MCP URL, Resource/Audience, widget origin, metadata URL, `/.well-known/openai-apps-challenge`, and trusted edge host move together to `https://mcp-openai.skillpilot.com` — enforcing a single active resource with zero dual-audience acceptance or legacy/new origin dispatchers. Native desktop CIMD uses the exact resource-matched public client `https://chatgpt.com/oauth/codex/7yTcOAOqrumX/client.json` and loopback callback `http://127.0.0.1/callback/7yTcOAOqrumX` (dynamic port, PKCE `S256`), strictly isolated from confidential client authentication with zero fallback.
- **Cutover & rollback (`AuthenticatedClientPolicy`):** Old chats are explicitly excluded (requiring no chat continuation, session migration, or continued legacy MCP runtime, while preserving durable learner progress). Because OAuth resource is part of each client profile fingerprint, `AuthenticatedClientPolicy` activates the new fingerprint upon startup validation and retires the prior one without rewriting grants (old and new instances must never serve the same database with differing active profiles during cutover). Rolling back to a retired fingerprint is intentionally refused and requires an explicit new `policyRevision`, fresh authorization, and compatibility with all currently approved live tool definitions.
- **Future tool evolution within one identity:** Package metadata, skills, live server, and individual tool definitions update asynchronously on the host; while a revised definition is under review, the previous definition may remain active even in new chats. Incompatible tool changes therefore use distinctly named replacement tools or bounded compatible adapters until live approved definitions allow retiring the old entry (`clientInfo.version`, User-Agent, and prompt prose never drive authorization or contract selection).

### Independent Version Layers and SemVer Classification {#sec:plugin-version-layers}

No single version identifier may be overloaded across distinct architectural concerns:

:::table{cols="4.3cm,3.4cm,X"}
| Version layer | Example | Meaning & source of truth |
| --- | --- | --- |
| **Plugin identity** | `skillpilot-coach` | Permanent public directory identity and stable MCP origin |
| **Plugin package version** | `1.1.3` | SemVer of the submitted bundle (manifest, skills, reviewed MCP/UI metadata) |
| **MCP tool contract major** | `1` | Semantics and JSON Schemas of the internal contract adapter (`v1`) |
| **MCP protocol version** | date-based | Transport/handshake revision negotiated between host and MCP server |
| **Server build** | Git SHA / build # | Deployed backend binary `skillpilot-server` |
| **UI artifact version** | `sha256-...` | Immutable content-addressed MCP Apps HTML/JS/CSS bundle |
| **State schema version** | `3` | Internal persistence format (decoupled via internal data migrations) |
| **State version (`stateVersion`)** | `142` | Monotonically increasing revision of canonical learner state shared across sessions and WebGUI |
| **Workflow version** | `coach@2.3` | Session-pinned pedagogical flow and decision logic |
| **Curriculum revision** | `curricula-sha256@...` | Session-pinned learning-goal and skill-graph revision |
:::

**Draft vs. Published & SemVer transitions:**

- **Unpublished working drafts (`DRAFT`):** `contracts/drafts/openai/<plugin>/<version>-SNAPSHOT/` may be regenerated via `prepare` prior to `Submit for Review` (while the manifest carries `<version>` without `-SNAPSHOT`); during active portal review, a review freeze locks package and runtime behavior. `contracts/published/openai/<plugin>/<version>/` and `release-index.json` are created exclusively after confirmed portal publication via the explicit `record-published` command and remain immutable thereafter. Deterministic USTAR archives (`plugin-install-bundle`) and directory submission ZIPs never depend on host `tar` versions, `umask`, checkout permissions, or symlinks, and never bundle the server.
- **Server-only `serverBuild` deploy (zero package bump):** Calculation fixes, performance/database tuning, or internal security hardening that keep the visible auth, tool, schema, skill, and UI contract unchanged (with all contract tests green).
- **PATCH (`x.y.z -> x.y.(z+1)`):** Clarifying tool descriptions, `SKILL.md`, or annotations to match existing behavior, shipping a compatible UI fix under a new hash URI, or updating listing/release notes.
- **MINOR (`x.y.0 -> x.(y+1).0`):** Backward-compatible additions (new tool, optional input field, `extensions` payload, new skill, new UI resource, additive OAuth scope); the live server MUST deploy first as a superset serving both old and new contracts before portal rescanning.
- **Incompatible changes:** Removing/renaming tools or fields, adding required inputs, breaking types/semantics, or turning read-only tools into mutating ones must never deploy unprotected; they require distinctly named replacement tools/superset adapters or an explicit contract-generation transition. Skills ship as a frozen directory tree inside the package (`Skill-Contract-Lint` enforces valid tool references and reproducible bundle hashes).

### Public Contract Adapters, Envelopes, and Dedicated MCP Apps UIs {#sec:plugin-envelopes-ui}

Public MCP schemas never expose raw internal domain or persistence entities. Stateful responses and write requests carry explicit version and idempotency envelopes (`additionalProperties: false` on core schemas, forward-compatible additions inside `extensions`, structured payloads paired with concise text representations, and zero internal user IDs):

```json
{
  "contractMajor": 1,
  "learningSessionId": "sps_...",
  "stateVersion": 42,
  "stateSchemaVersion": 3,
  "workflowVersion": "coach@2.3",
  "curriculumRevision": "curricula-sha256@...",
  "currentStep": { "goalId": "..." },
  "allowedActions": ["submit_answer"],
  "extensions": {}
}
```

Write calls require `learningSessionId`, `expectedStateVersion` (optimistic locking across concurrent transports), and `clientRequestId` (idempotent retries within the `PT1H` and learner-revision gates of @ref{sec:openai-mcp-oauth-session}); pinned `workflowVersion` and `curriculumRevision` values keep in-flight sessions consistent or halt fail-closed with `SESSION_VERSION_UNAVAILABLE`.

**Two dedicated V1 MCP Apps UI resources (`text/html;profile=mcp-app`):**

1. `render_skillpilot_goal_visualization` (read-only) binds solely its active image-only resource via `ui.resourceUri` and `openai/outputTemplate`, running once per freshly authorized `(goalId, stateVersion)` pair (`expectedStateVersion = stateVersion`) while preserving the complete text-only teaching path.
2. `start_skillpilot_memory_practice` (read-only) binds solely its dedicated interactive flashcard resource.
3. The app-only grading tool `review_skillpilot_memory_practice_card` and all regular domain tools remain unbound (preventing nested or blank UI frames; authoritative state stays strictly in the backend, and corrupted host state falls back to a safe visible error state rather than local learning).
4. **Passive byte retention from first real delivery:** Every content-addressed URI (e.g., `ui://skillpilot/coach/1/sha256-<hash>/index.html`) ever served to a real client remains passively readable with byte-identical content, while tool descriptors bind exclusively the current active URI from `release/line.json`.

### Canonical `contract-line/v1` Schema, CI Gates, Observability, and Line History {#sec:plugin-lifecycle-ci}

Support lifecycle, publication status, and session-launch policy form three orthogonal, server-authoritative axes (never silently toggled by calendar dates):

- **`supportLifecycle`:** `CURRENT` (primary line) | `SUPPORTED` (fully maintained) | `DEPRECATED` (upgrade advised) | `RETIRED` (ended; enforces `UNPUBLISHED` + `BLOCK`).
- **`publicationStatus`:** `DRAFT` | `PUBLISHED` | `UNPUBLISHED`.
- **`newSessionPolicy`:** `ALLOW` (normal launch) | `WARN` (requires a published, verified non-null `successor` on the exact first-party allowlist and explicit user choice) | `BLOCK` (mints zero sessions/capabilities; yields identifier-free `MAJOR_UPGRADE_REQUIRED` handoff when a verified successor exists, or `TEMPORARILY_UNAVAILABLE` when `successor: null`). Monotonic `policyRevision` increments immediately invalidate older launch capabilities.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://skillpilot.com/schemas/openai/contract-line/v1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "contractMajor",
    "policyRevision",
    "displayName",
    "supportLifecycle",
    "publicationStatus",
    "newSessionPolicy",
    "successor"
  ]
}
```

*(Full property constraints and `allOf` invariants enforcing `WARN -> successor != null` and `RETIRED -> UNPUBLISHED + BLOCK` are validated in release and CI checks against `$id`; following the Web-first cutover, V1 stands at `policyRevision: 3`, `CURRENT`, `DRAFT`, `ALLOW`, `successor: null`.)*

- **Mandatory CI/CD gates:** (1) version, naming, and manifest-limit consistency, (2) automated `Contract-Diff` against published snapshots (blocking removed tools/fields, new required inputs, type/enum/security breaks, and mutated immutable UI URIs), (3) `Skill-Contract-Lint` and deterministic bundle hashes, (4) `Contract-Testmatrix` across all non-`RETIRED` lines including OAuth audience/scope and UI integrity checks, and (5) state-migration and rollback tests.
- **Observability & log privacy:** Every tool invocation records `contractMajor`, `pluginLine`, `serverBuild`, `toolName`, `status`, stable `resultCode`, latency, and (when present in versioned responses) `stateVersion`, `stateSchemaVersion`, `workflowVersion`, `curriculumRevision`, plus `clientRequestId` on writes. `learningSessionId` is logged exclusively as a truncated HMAC-SHA-256 fingerprint and never in plaintext; high-cardinality correlators and revisions remain log fields only, while metric tags are strictly bounded to `contractMajor`, `pluginLine`, `toolName`, `status`, and `resultCode`.
- **Historical record of the superseded multi-plugin-per-major model:** The July–September 2026 plan envisioned shipping removable breaking major contracts as separate directory identities (`skillpilot-coach-v1`..`v9` on reserved `mcp-coach-v1..v9.skillpilot.com` hosts, cf. the 31 July 2026 OpenAI Developer Forum inquiry) with parallel operation, optional explicit `mig_...` session migration, and eventual unpublish/delete, while already retiring unshipped locale-split hosts (`mcp-coach-de-v*`/`en-v*`). Under the 19 October 2026 decision (@ref{sec:plugin-decision-2026-10-19}), clean internal adapter separation (`v1`, and future `v2` inside the same `skillpilot-server` when needed) is preserved while maintaining a single permanent external plugin identity (`skillpilot-coach` on `https://mcp-openai.skillpilot.com/mcp`).

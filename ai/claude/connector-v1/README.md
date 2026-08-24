# SkillPilot Claude Connector v1 release dossier

This directory is the source of truth for the SkillPilot remote-MCP submission
to the Claude Connectors Directory. It is provider-specific and must not change
the submitted OpenAI V1 package, runtime contract, reviewer fixtures or portal
values.

## Current state

The previously deployed custom-connector candidate passed an initial
real-Claude smoke test. On 23 August 2026 the Product Owner explicitly
unfroze **Claude v1 only** so the still-pre-submission candidate can be rebuilt
around first-party 24-hour learner sessions. Old ID-file evidence is historical
and cannot approve the rebuilt candidate. This dossier remains
`PRE_SUBMISSION`; it is not submission-ready until every required item in
`release-gates.json` is `pass` against the final candidate and the strict
readiness check succeeds.

The current candidate deliberately claims Claude.ai only. Claude Code support
exists in the implementation but is outside the directory claim until that
client has its own recorded acceptance run.

## Stable decisions

- Remote MCP endpoint:
  `https://mcp-claude-v1.skillpilot.com/mcp`
- Transport: Streamable HTTP
- Authentication: OAuth 2.0 with Client ID Metadata Documents and PKCE S256
- OAuth is the long-lived technical connector transport. `offline_access` may
  keep the plugin connected, but contains and selects no learner identity and
  cannot mint, renew or extend a learner session.
- Every learner session starts at
  `https://skillpilot.com/`. The shared first-party web start
  visibly selects the SkillPilot ID, curriculum, Personal Curriculum and
  provider. Only an explicit Claude choice creates an opaque `spc_` value,
  which expires after exactly 24 hours. The permanent SkillPilot ID remains
  inside SkillPilot; no ID file or password is used.
- The selected Claude start opens only Claude Web. Its composer is prefilled
  through exactly one `q` parameter; the learner reviews and sends the message
  explicitly. There is no automatic send or desktop launch route.
- The plugin is the preferred one-time installation because it bundles the
  coaching Skill and connector. Both MCP Apps UIs are supplied by that
  connector. Separate Skill-plus-connector installation is only a fallback and
  provides no additional capability.
- Public documentation:
  `https://enpasos.github.io/skillpilot/deploy/claude-connector-v1-user-guide/`
- Connector privacy policy:
  `https://mcp-claude-v1.skillpilot.com/privacy`
- Candidate permanent Directory slug: `skillpilot`
- MCP Apps: two dedicated, content-addressed resources for approved goal
  visualization and private normal flashcard practice; no `ui/open-link`
- Previously advertised hash URIs remain passively readable with their exact
  bytes after a compatible UI update; tools bind only the two current URIs
- Tool surface: exactly twelve purpose-built learning tools, including one
  app-only card-review tool

The version-neutral `skillpilot` slug is a candidate until the Product Owner
confirms it in the portal. Anthropic makes the slug permanent on publication.
Do not submit a versioned slug such as `skillpilot-v1` merely to mirror the
current endpoint.

## Files

- `directory-listing.json` contains the copy and structured answers for the
  portal.
- `release-gates.json` records automated, operational, legal and external
  acceptance gates.
- `release/contract-baseline.json` pins the reviewed candidate bytes and fails
  if the implementation, edge templates, user flow or listing copy drifts.
- `release/lifecycle.json` keeps the stable v1 line separate from any future
  breaking v2 line and records the permanent-slug decision boundary.
- `reviewer-test-plan.md` is the complete functional and adversarial test plan.
- `reviewer-access.template.md` lists the information that must be handed to
  Anthropic securely. It never contains credentials itself.
- `evidence/manifest.json` references sanitized external evidence without
  committing credentials, tokens, learner data or protected answers.
- `assets/` contains the pinned portal icon and its technical provenance.
- `scripts/check_claude_connector_v1_release.mjs` validates this package and
  its binding to the implementation.
- `docs/deploy/claude-connector-v1-release.md` is the deployment, verification
  and rollback runbook; the paired DE/EN user guides provide the easy start.

## Validate

From the repository root:

```bash
node scripts/check_claude_connector_v1_release.mjs
```

This structural check must pass while manual gates are still pending. It prints
`STRUCTURAL_PASS` together with `SUBMISSION_BLOCKED`, prints the remaining
blockers and does not mislabel the candidate as releasable. Passing evidence
must resolve through `evidence/manifest.json`, be approved and name the exact
`candidateContractSha256` plus the tested commit revision; free-form gate text
can never unlock submission. The digest covers the complete Claude-v1 runtime
trees, database migration, edge templates, listing, reviewer test plan, user
guides, runbook, icon and their repository base revision. Mutable gates,
evidence references, lifecycle state, the secret-free reviewer handoff template
and test sources stay outside the byte digest; CI and approved evidence bind
those checks to the exact candidate revision.

Immediately before portal submission, run the strict gate:

```bash
node scripts/check_claude_connector_v1_release.mjs --submission-ready
```

That command fails unless:

1. `release/lifecycle.json` is `READY_FOR_SUBMISSION`;
2. the permanent slug is explicitly approved;
3. `submissionReady` is `true`; and
4. every required release gate is `pass` with recorded evidence.

Never make the command green by weakening a check or marking an unperformed
manual test as passed.

## Portal workflow

1. Confirm Team or Enterprise organization access and Directory-management
   rights.
2. Re-run every tool in the pinned MCP Inspector and in a fresh Claude custom
   connector using the final public endpoint.
3. Complete the reviewer account and reset procedure through the secure
   handoff described in `reviewer-access.template.md`.
4. Obtain Product, Legal, Security and Operations approval. In particular,
   Legal must approve the connector-specific privacy policy and decide whether
   an English policy is required for the intended audience.
5. Confirm the listing copy, available portal category, icon and permanent
   `skillpilot` slug.
6. Update the evidence ledger truthfully and run the strict readiness check.
7. Submit through **Claude.ai > Organization settings > Directory**.

No test credential, OAuth value, `spc_` learner session, permanent learner
identifier, capability or exam solution belongs in Git, a PR, CI output or a
screen recording. A permanent SkillPilot ID or encrypted ID file must never be
supplied to Claude, the plugin, the connector or the reviewer.

## Later updates and major changes

Anthropic treats a remote MCP server as a live API: tool changes are picked up
on the next connection and do not currently require a new directory submission.
The permanent slug is independent of that tool surface.

Before final submission, Claude v1 remains a mutable candidate only within the
Product Owner's recorded Claude-only unfreeze. The OpenAI V1 review candidate
remains frozen and Claude major line 2 remains unallocated. After the final
Claude-v1 submission freeze or publication, SkillPilot applies this stricter
compatibility policy:

- compatible fixes stay on `mcp-claude-v1.skillpilot.com`;
- a breaking protocol, identity, OAuth or state-semantics change is developed
  and accepted on a separate versioned endpoint such as
  `mcp-claude-v2.skillpilot.com`;
- v1 remains available during an explicit migration window;
- listing text and privacy statements are updated through the Directory
  dashboard whenever the offered behavior changes.

This policy preserves an upgrade path without promising that Anthropic defines
or enforces MCP SemVer.

## Authoritative external references

- [Directory submission](https://claude.com/docs/connectors/building/submission)
- [Pre-submission criteria](https://claude.com/docs/connectors/building/review-criteria)
- [Connector testing](https://claude.com/docs/connectors/building/testing)
- [Connector authentication](https://claude.com/docs/connectors/building/authentication)
- [After publishing](https://claude.com/docs/connectors/building/after-publishing)

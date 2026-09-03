# SkillPilot Claude Connector v1 release runbook

This runbook makes the dedicated Claude v1 edge and Directory submission
reproducible. It does not authorize a production change. Run production steps
only in an explicitly approved release window and never edit the frozen OpenAI
v1 vhost or deny include as a side effect.

The Product Owner unfroze only the pre-submission Claude v1 candidate on
23 August 2026 so it can be rebuilt around first-party 24-hour learner
sessions. OpenAI V1 remains frozen. Claude v2 remains unallocated. Do not update
the Claude contract baseline until the rebuilt candidate and all focused tests
pass.

## 1. Repository preflight

Start from the exact reviewed revision with a clean worktree and the declared
Node and Java toolchains:

```bash
git status --short --branch
git rev-parse HEAD
node scripts/check_openai_plugin_review_freeze.mjs
node scripts/openai_plugin_release.mjs verify
node scripts/check_skillpilot_coach_plugin.mjs
node scripts/check_openai_plugin_versioning.mjs
npm --prefix ai/claude/app test
node scripts/check_claude_connector_v1_release.mjs
```

The strict `--submission-ready` mode is expected to fail while manual gates are
open. Do not weaken the connector gate or any OpenAI differential check.

## 2. Configuration and database

The existing systemd service reads `/etc/skillpilot/skillpilot.env`. Claude v1
uses only its provider-specific property namespace:

```text
SKILLPILOT_CLAUDE_ENABLED=false
SKILLPILOT_CLAUDE_MCP_ENABLED=false
SKILLPILOT_CLAUDE_COACH_TOOLS_ENABLED=false
SKILLPILOT_CLAUDE_REGRESSION_TOOLS_ENABLED=false
SKILLPILOT_CLAUDE_CONNECTOR_V1_ENABLED=true
SKILLPILOT_CLAUDE_CONNECTOR_V1_SIGNING_SECRET=<secret>
SKILLPILOT_CLAUDE_CONNECTOR_V1_CAPABILITY_SECRET=<different-secret>
```

Both secrets must be independently generated, at least 32 non-whitespace
characters, different from each other and stored only in the root-owned mode
`0600` environment file. Never print them into CI or release evidence.

Before activation, create and validate a restorable PostgreSQL backup. Confirm
Liquibase changes `023-add-claude-connector-v1` and
`024-replace-claude-v1-binding-with-learning-sessions` are `EXECUTED`. The
additive 024 migration replaces the retired ID-file binding model with
first-party learner-session persistence. Never edit the already executed 023
migration and do not drop provider tables during ordinary rollback.

## 3. Dedicated HTTP-01 and certificate

The repository sources are:

- `deploy/nginx/skillpilot-claude-acme.conf`
- `deploy/nginx/skillpilot-claude-connector-v1.conf`
- `deploy/nginx/skillpilot-claude-connector-v1-contained.conf` (deny-only
  incident replacement; never load it together with the active TLS vhost)

Install each as a root-owned file in `/etc/nginx/` and include it exactly once
from the nginx `http` context. Preserve byte-identical backups and hashes of the
frozen OpenAI files before editing the parent include list.

First install only the HTTP bootstrap, validate and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -sS -o /dev/null -w '%{http_code}\n' \
  http://mcp-claude-v1.skillpilot.com/
```

Expected root status: `404`.

Issue the dedicated ECDSA certificate through the same nginx/http-01 path used
for normal renewal:

```bash
sudo certbot certonly \
  --nginx \
  --preferred-challenges http \
  --key-type ecdsa \
  --cert-name mcp-claude-v1.skillpilot.com \
  -d mcp-claude-v1.skillpilot.com
```

Validate that the certificate contains exactly the Claude v1 SAN, the key
matches, the renewal file uses `authenticator = nginx`, and a renewal dry run
succeeds. A manual DNS challenge is not the normal renewal path.

## 4. TLS vhost activation

Install `deploy/nginx/skillpilot-claude-connector-v1.conf` byte-identically,
include it once, and verify that the two frozen OpenAI nginx files still match
their pre-change hashes. Then:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl is-active nginx
```

The Claude vhost contains exact allowlisted locations and returns `404` for all
other routes. It must not add a Claude alias to `skillpilot.com` and must not
alter `mcp-coach-v1.skillpilot.com`.

## 5. Public edge checks

Run the public checks from an authorized external client and store only
sanitized evidence:

- valid TLS chain and hostname;
- protected-resource metadata names the exact MCP resource and the public
  documentation URL;
- authorization-server metadata advertises PKCE S256 and CIMD;
- privacy and documentation URLs return HTTPS 200;
- unauthenticated MCP returns HTTP 401 plus `WWW-Authenticate`;
- connector OAuth, including optional `offline_access`, remains transport-only
  and cannot access a learner without a current `learningSessionId`;
- `https://skillpilot.com/` enters the shared SkillPilot web
  start; it visibly requires the learner to select or load the SkillPilot ID,
  confirm curriculum and Personal Curriculum, and choose Claude before it
  creates a fresh opaque `spc_` session that expires after exactly 24 hours;
- the explicit Claude choice opens only Claude Web with exactly one encoded
  `q` parameter containing the prepared prompt; Claude prefills but never
  auto-sends it, and the learner reviews and sends it deliberately;
- the handoff URL contains exactly one current `spc_` session and no permanent
  SkillPilot ID, credentials, fragment, second query parameter or foreign host;
- expired, altered and foreign sessions fail closed while OAuth can remain
  connected; OAuth refresh never mints, renews or extends a learner session;
- no permanent SkillPilot ID, ID file or ID-file password crosses the
  SkillPilot first-party boundary or appears in logs and visible Claude output;
- untrusted Origin returns HTTP 403;
- the retired `/connect`, `/connect/`, `/connect/details` and `/connect/bind`
  routes return HTTP 404 at the public edge;
- other unknown, legacy, trailing-slash, internal-prefix and main-origin aliases
  return HTTP 404;
- production readiness remains `UP`;
- every frozen OpenAI v1 edge/runtime check still passes.

Do not place OAuth codes, tokens, capabilities, raw response bodies containing
learner data, or unfiltered `nginx -T` output into evidence.

## 6. Restart and resource checks

The connector runs in the existing SkillPilot JVM. A restart can briefly
interrupt ChatGPT as well as Claude and therefore requires the approved
maintenance window.

After restart, require local readiness, `NRestarts=0`, expected process tree,
adequate host memory/swap headroom and no unexpected heap/thread/pool growth.
Repeat the OpenAI differential after enabling Claude and after activating the
edge.

## 7. Real-client acceptance

Rebuild and capture the Directory carousel from the same generated MCP App
resources that are deployed by the backend:

```bash
npm --prefix app ci
npm --prefix ai/claude/app ci
npm --prefix ai/claude/app test
./app/node_modules/.bin/playwright install chromium
node scripts/capture_claude_mcp_app_carousel.mjs
node scripts/check_claude_connector_v1_release.mjs
```

The capture command verifies that each generated resource and its committed
backend classpath copy are byte-identical, then records a tracked snapshot of
the exact generated MCP App manifest. This lets the release checker reproduce
the evidence binding in a clean CI checkout without relying on ignored
`dist/` files. Review the resulting three PNGs and manifest before recording
the separate Product, QA and Legal approvals; a successful script run does not
replace those approvals.

Follow the repository test plan at
`ai/claude/connector-v1/reviewer-test-plan.md`. Exercise all twelve tools and
both content-addressed MCP Apps resources in the pinned MCP Inspector and in a
fresh Claude.ai connector session started only through
`https://skillpilot.com/`. Confirm that every tool, including the
app-only card-review tool, requires the same current `learningSessionId` and
that the normal flashcard component
keeps cards and review capabilities out of model-visible content, that its
app-only review changes only scheduling, and that neither normal practice nor a
single review changes mastery. Claude Code is not part of the current Directory
claim until its own acceptance evidence exists.

## 8. Rollback drill

Before submission, practically verify this order:

1. replace the active Claude TLS vhost bytes at the same include path with the
   reviewed deny-only `skillpilot-claude-connector-v1-contained.conf`, reload
   nginx, and verify its distinctive containment header plus HTTP `404`;
2. set `SKILLPILOT_CLAUDE_CONNECTOR_V1_ENABLED=false`;
3. restart the existing SkillPilot service and wait for readiness;
4. revoke or expire Claude v1 transport tokens and learner sessions according
   to the approved restricted procedure referenced by the
   [support readiness and incident runbook](claude-support-readiness-runbook.md);
5. repeat all frozen OpenAI v1 checks;
6. restore the known-good shared artifact only if the artifact itself is faulty;
   otherwise re-enable the known-good backend and prove readiness while the
   deny-only vhost is still loaded, then restore the reviewed active vhost and
   reload nginx.

Do not delete provider tables or use `git reset --hard` as an operational
rollback. Record timing, operator, observed interruption, results and recovery
in the external evidence store. The support-readiness gate remains blocked
until named support, operations and security owners have completed the
candidate-bound mailbox, alert, containment and recovery drill defined in that
runbook.

## 9. Directory submission

Only after `node scripts/check_claude_connector_v1_release.mjs
--submission-ready` passes:

1. sign in to the submitting Team or Enterprise organization as an Owner,
   Primary Owner or delegated member with Anthropic Directory-management
   access;
2. open the **Remote MCP submission portal** in that organization's Claude.ai
   settings and record the submission owner;
3. connect the final public Streamable HTTP server;
4. compare the live tool catalogue with the contract baseline;
5. copy the reviewed listing and use-case values from
   `ai/claude/connector-v1/directory-listing.json`;
6. upload sanitized screenshots that show both MCP Apps in their real
   learner-facing states without credentials, capabilities or learner data;
7. provide the reviewer package through the approved secure channel;
8. complete all required policy acknowledgements; and
9. read the final portal summary before submitting.

Submission, review status and publication are external Anthropic actions. Do
not mark this repository `PUBLISHED` until the actual directory state has been
verified and recorded by the Product Owner.

## 10. Plugin pilot, personal marketplace and curated publication

The package at `ai/claude/plugin/skillpilot-coach-v1/` bundles the reusable SkillPilot coaching
Skill with one declaration for the same remote connector; the connector remains
the sole owner of all twelve tools and both MCP Apps UIs. SkillPilot Coach v1
contains no hooks or subagents. It does not claim Claude Desktop Chat or Cowork
support. Each additional surface requires separate acceptance evidence and a
later reviewed release before SkillPilot advertises it.

The working direct-install pilot proves the paid Claude Web product flow, not
an Anthropic-curated listing. Anthropic now documents repository-backed
personal marketplaces for paid Claude accounts, including installation in
Claude Web. That technical availability does not expand SkillPilot's tested
support scope and does not replace exact-candidate acceptance.

SkillPilot's separate personal Git marketplace lane is specified in
[`claude-personal-marketplace-release.md`](claude-personal-marketplace-release.md).
It exports only the six reviewed package files into a small standalone
repository, binds them to the existing version and direct-install SHA-256, and
requires local, strict CLI, remote-repository, clean-account installation and
update verification. While its activation state is
`prepared_not_published`, the current direct-install guide remains the
first-party route.

The Connectors Directory submission in Section 9 remains an independent
connector-only route with its own Team/Enterprise publisher gate. It neither
contains the coaching Skill nor gates personal-marketplace publication, and
the two routes may proceed in either order. A later Anthropic-curated plugin
submission remains a third, separate external action. The plugin is not
available on Claude Free. SkillPilot claims neither native mobile-plugin
installation nor public Claude Code support for v1 and targets adults aged 18
or older.

Before submitting the plugin:

1. run `node ai/claude/plugin/skillpilot-coach-v1/check-package.mjs` and
   `node --test ai/claude/plugin/skillpilot-coach-v1/check-package.test.mjs`;
2. run `claude plugin validate ai/claude/plugin/skillpilot-coach-v1 --strict`
   with the current Claude CLI;
3. run `node --test scripts/claude_marketplace_release.test.mjs` and
   `node scripts/claude_marketplace_release.mjs check`;
4. test direct upload/install, OAuth, first-party start, all twelve tools and both MCP
   Apps in paid Claude Web chat;
5. verify that the plugin exposes exactly one Skill and one SkillPilot connector
   and that both MCP Apps are available through that connector;
6. verify that each new learner session still starts only at
   `https://skillpilot.com/`, while OAuth may remain connected;
7. verify that plugin and Directory installations referencing
   `https://mcp-claude-v1.skillpilot.com/mcp` may coexist while Claude exposes
   one SkillPilot tool set for the shared server, and that no additional manual
   custom connector is configured for that same URL;
8. publish the generated plugin source in the approved public GitHub repository and
   confirm that the submitted repository path contains no credentials, learner
   sessions, learner data or protected answers; and
9. verify repository installation, connector OAuth, first-party start and the
   supported learning flow against the exact public revision; and
10. only then, if an Anthropic-curated listing is still intended, submit that public GitHub source through the Anthropic Console plugin
   workflow as a Developer, Admin or Owner of the submitting Console
   organization, with its own sanitized evidence.

Plugin review, approval and publication are external Anthropic actions. Do not
mark the plugin public merely because local checks or upload tests pass. After
publication, compatible GitHub updates remain subject to Anthropic's screening
and the plugin's own SemVer policy.

Authoritative plugin references:

- [Use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude)
- [Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
- [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins)

Compatible Skill-only improvements increment the plugin SemVer independently.
A breaking MCP, OAuth, identity or state contract still requires a separately
reviewed connector major and endpoint; a plugin major must not disguise such a
server-side breaking change.

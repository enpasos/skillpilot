# SkillPilot Claude Connector v1 release runbook

This runbook makes the dedicated Claude v1 edge and Directory submission
reproducible. It does not authorize a production change. Run production steps
only in an explicitly approved release window and never edit the frozen OpenAI
v1 vhost or deny include as a side effect.

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
node scripts/check_claude_connector_v1_release.mjs
```

The strict `--submission-ready` mode is expected to fail while manual gates are
open. Do not weaken it.

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
Liquibase change `023-add-claude-connector-v1` is `EXECUTED` and the three
provider tables exist. Do not drop the additive tables during ordinary
rollback.

## 3. Dedicated HTTP-01 and certificate

The repository sources are:

- `deploy/nginx/skillpilot-claude-acme.conf`
- `deploy/nginx/skillpilot-claude-connector-v1.conf`

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
- untrusted Origin returns HTTP 403;
- unknown, legacy, trailing-slash, internal-prefix and main-origin aliases
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

Follow the repository test plan at
`ai/claude/connector-v1/reviewer-test-plan.md`. Exercise all nine tools in the
pinned MCP Inspector and in a fresh Claude.ai custom connector. Claude Code is
not part of the directory claim until its own acceptance evidence exists.

## 8. Rollback drill

Before submission, practically verify this order:

1. remove or disable the Claude TLS vhost include and reload nginx;
2. set `SKILLPILOT_CLAUDE_CONNECTOR_V1_ENABLED=false`;
3. restart the existing SkillPilot service and wait for readiness;
4. revoke or expire Claude v1 tokens and pending binding transactions according
   to the incident procedure;
5. repeat all frozen OpenAI v1 checks;
6. restore the known-good shared artifact only if the artifact itself is faulty.

Do not delete provider tables or use `git reset --hard` as an operational
rollback. Record timing, operator, observed interruption, results and recovery
in the external evidence store.

## 9. Directory submission

Only after `node scripts/check_claude_connector_v1_release.mjs
--submission-ready` passes:

1. sign in as a Team/Enterprise owner or delegated Directory manager;
2. open **Claude.ai > Organization settings > Directory**;
3. connect the final public Streamable HTTP server;
4. compare the live tool catalogue with the contract baseline;
5. copy the reviewed listing and use-case values from
   `ai/claude/connector-v1/directory-listing.json`;
6. provide the reviewer package through the approved secure channel;
7. complete all required policy acknowledgements; and
8. read the final portal summary before submitting.

Submission, review status and publication are external Anthropic actions. Do
not mark this repository `PUBLISHED` until the actual directory state has been
verified and recorded by the Product Owner.


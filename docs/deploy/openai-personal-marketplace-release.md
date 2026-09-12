# SkillPilot ChatGPT Git marketplace: experimental release runbook

## Purpose and status

This lane tests distribution of the complete SkillPilot Coach plugin, including
its Skills and remote MCP configuration, from a small public Git repository.
It does not require a pre-existing ChatGPT development app or an `.app.json`
reference. It is a standalone Git/MCP experiment, not a replacement for the
separate [OpenAI public submission](openai-plugin-v1-submission.md).

As of **12 September 2026**, the experimental Git marketplace is publicly
published and its catalog has been registered successfully in the local Codex
CLI. **Plugin installation and all real-host acceptance remain open.** This is
not evidence of successful OAuth, ChatGPT desktop or web use, native mobile
use, or automatic updates. The package version comes from the canonical OpenAI
manifest; the first published Git candidate is **1.1.0**. Claude's independently
published **1.1.3** is not the OpenAI package version.

The public repository is
[skillpilot-chatgpt-marketplace](https://github.com/enpasos/skillpilot-chatgpt-marketplace).
Its marketplace identity is `skillpilot-chatgpt-marketplace` and its plugin
identity remains `skillpilot-coach-v1`. The URL is available for the controlled
installation experiment, not yet a generally accepted beta installation path.

### Recorded Git publication and catalog evidence

- Published `main` commit:
  [`7b184ca44675a6fc20ced73cb30a3ad2958c356f`](https://github.com/enpasos/skillpilot-chatgpt-marketplace/commit/7b184ca44675a6fc20ced73cb30a3ad2958c356f).
- Annotated tag `v1.1.0` was verified to resolve to that same commit.
- The **Validate experimental marketplace** workflow
  [run 34681183427](https://github.com/enpasos/skillpilot-chatgpt-marketplace/actions/runs/34681183427)
  completed successfully.
- A fresh public clone passed byte-exact source/export verification and its
  standalone `validate.mjs` check. The recorded package digest is
  `15508140a3770e21896554c1aececf78a2fc421531e5f316fc16ffb101045843`.
- Codex **0.154.0-alpha.6.1** successfully ran `marketplace add` and
  `marketplace list`, recognizing the published catalog. This establishes
  **local CLI catalog registration only**, not plugin installation, OAuth, or
  availability in any ChatGPT host. Other existing personal SkillPilot plugins
  were left unchanged.

These observations are dated **12 September 2026** and bound to the revision
above. They do not complete any of the real-host acceptance checks below.

## What the experiment must distinguish

| Evidence | What it establishes | What it does not establish |
| --- | --- | --- |
| Export and Git checks | The catalog contains the exact intended public plugin files | Installation or account access |
| Catalog discovery and plugin installation | A named host discovers and installs those files | Working OAuth, tools, or another host's access |
| Authenticated MCP call | That host reaches the protected production integration | Correct Skill execution or web/mobile availability |
| Real learning turn | The tested host uses the Skill and tools together | Support on an untested surface |
| Web test with desktop closed | Independent web operation for that account and tested setup | Native mobile support or general beta availability |

The current official workspace-import documentation says imported plugins that
declare MCP servers are **Desktop only**, including remote HTTPS servers. This
is a runtime restriction for that documented import path, not merely wording
about the installer. Local/repository catalogs and public-directory publication
are distinct distribution mechanisms. The experiment must record the actual
host and route; it must not extend a workspace-import statement into an
unverified claim about every possible account or distribution path.
[OpenAI: Plugin management](https://learn.chatgpt.com/docs/enterprise/plugin-management#desktop-only-plugins),
[OpenAI: Package your plugin](https://developers.openai.com/plugins/build/plugins)

The existing-app route is a different architecture: `.app.json` references an
already registered app, but neither creates it nor grants access. It is not a
prerequisite silently added to this standalone experiment. If this experiment
fails, document the precise failed boundary before proposing that alternative.
[OpenAI: Existing app references](https://learn.chatgpt.com/docs/enterprise/plugin-management#reference-an-existing-app-with-appjson)

## Sources and exported layout

The canonical source remains `ai/openai plugin/skillpilot-coach-v1/`.
`ai/openai-marketplace/skillpilot-chatgpt-marketplace/` holds the catalog and
publication templates. The exporter copies exactly these seven canonical
plugin files into `plugins/skillpilot-coach-v1/`:

- `.codex-plugin/plugin.json`
- `.mcp.json`
- `skills/skillpilot-coach-v1/SKILL.md`
- `skills/skillpilot-coach-v1/agents/openai.yaml`
- `skills/skillpilot-coach-v1/references/coaching-policy.md`
- `assets/favicon-96x96.png`
- `assets/web-app-manifest-512x512.png`

The catalog is `.agents/plugins/marketplace.json`. Its local plugin path is
`./plugins/skillpilot-coach-v1`, relative to the marketplace root, not to the
catalog directory. Keep the supported compatibility manifest and existing MCP
configuration byte-identical; do not perform an incidental format migration.

The exported repository must not contain release dossiers, private portal
exports, browser profiles, credentials, `.app.json`, learner data, or session
identifiers. No Skill copy is maintained as a second editable source.

## Prepare and verify

Run from the SkillPilot repository root with the project's Node version:

```bash
node --test scripts/openai_marketplace_release.test.mjs
node scripts/openai_marketplace_release.mjs check

marketplace_export_dir=$(mktemp -d /tmp/skillpilot-chatgpt-marketplace.XXXXXXXX)
node scripts/openai_marketplace_release.mjs prepare --output "$marketplace_export_dir"
node scripts/openai_marketplace_release.mjs verify --output "$marketplace_export_dir"

node scripts/check_skillpilot_coach_plugin.mjs
node scripts/check_openai_plugin_versioning.mjs
git diff --check
```

`prepare` requires an empty output directory. It does not delete or replace an
existing checkout, change the user's installed plugins, publish a repository,
modify production, or submit anything to OpenAI. `verify` compares the exported
tree with the current inputs, including the canonical plugin bytes. A source
change invalidates the old export; create and verify a fresh output directory.

The `.github/workflows/openai-marketplace.yml` lane runs the automated tests,
export, and verification. The exported repository has its own validation
workflow. Those checks are package evidence, not a simulated real-host pass.

## Publish the Git source

1. Review the verified export and exact source commit. Confirm that only the
   intended public catalog, plugin, documentation, and validator are included.
2. Publish to the intended repository using the ordinary reviewed Git workflow.
   Preserve unrelated remote content; do not force-push or replace a populated
   repository indiscriminately. Subsequent releases should pass the repository's
   required validation before merging.
3. Clone the public default branch into a fresh directory. Record its full
   commit, candidate version, verification output, and validation run URL.
   Verify that clone against the same source inputs with `verify --output`.
4. Only then provide the public Git URL for the controlled installation test.

Git publication is not approval or publication in OpenAI's universal directory.
Do not run the canonical release command `record-published` for this Git action;
that command belongs to actual OpenAI portal publication. Do not promote the
first-party installation guide or claim general beta readiness from Git checks.
[OpenAI: Public plugin publication](https://developers.openai.com/plugins/build/plugins#publish-official-public-plugins)

## Clean tester walkthrough

Use a dedicated tester account and record its plan, workspace, host/version,
operating system, selected route, and the exact marketplace revision. The
tester must not inherit the author's developer registration or client secret.

1. After verified Git publication, add the public catalog in a client exposing
   the documented marketplace commands:

   ```bash
   codex plugin marketplace add https://github.com/enpasos/skillpilot-chatgpt-marketplace.git --ref main
   codex plugin marketplace list
   ```

   Catalog registration is not plugin installation. A CLI without these
   commands is an unsupported test client for this step; do not invent a
   substitute command or silently modify its configuration.
2. In the corresponding supported host, open the Plugins Directory, select
   `skillpilot-chatgpt-marketplace`, and install **SkillPilot Coach v1**.
   Confirm the candidate version and included Skill. Record whether the host
   exposes this source at all. A CLI using WSL and a Windows desktop app may
   use different local configuration roots; visibility in one does not prove
   visibility in the other.
3. Start the installed plugin's own authentication flow. The tester supplies
   neither an operator secret nor advanced OAuth configuration. If discovery,
   authentication, or connection fails, stop that branch and capture a
   sanitized error with time and host details. Do not label it a passed
   installation-and-learning test.
4. If authentication succeeds, create a fresh session from the tester's own
   SkillPilot WebGUI using **Start learning**. Use the unchanged prepared
   message in a new chat with this installed plugin. Confirm a successful
   context call and correct Skill-guided continuation against the Cockpit.
5. Test the same account in ChatGPT web, then repeat with the desktop app fully
   exited. Record plugin visibility, available tools, authentication, and the
   actual learning turn separately. A synchronized chat transcript alone is
   not evidence of an independently working web runtime.
6. Test native iOS and Android separately if either is to be promised. A narrow
   browser window is not a native-app test.

The CLI and local catalog workflow is documented by
[OpenAI: Add a marketplace from the CLI](https://developers.openai.com/plugins/build/plugins#add-a-marketplace-from-the-cli).
An optional workspace-admin Git import is a different, explicitly recorded
route; it is not a required account upgrade for attempting this local route.
[OpenAI: Workspace import](https://learn.chatgpt.com/docs/enterprise/plugin-management#configure-a-marketplace-sync)

## Security and failure handling

The production MCP URL stays `https://mcp-coach-v1.skillpilot.com/mcp`.
Marketplace work does not change mTLS enforcement, OAuth client profiles,
callback allowlists, PKCE, scopes, learner-session checks, or write policy.
An ordinary local MCP client without the required OpenAI certificate is
expected to fail at the enforced edge. Installing the package grants neither
that certificate nor a confidential OAuth client's credentials.

The intended authenticated OpenAI profile and any existing Basic transition
remain separate rollout decisions under the
[OAuth client-authentication runbook](oauth-client-authentication.md).
Do not assume the desired JWT profile is active merely because the backend
implements it. Do not turn off mTLS, introduce a public-client fallback,
share a client secret, or repoint the plugin at Claude to obtain a green test.

Keep passwords, cookies, access/refresh tokens, client assertions, full session
IDs, private answers, and private portal exports out of Git, CI artifacts, and
screenshots. Failure evidence needs only the non-secret revision, stage,
timestamp, status/error class, and separately retained sanitized evidence.

## Acceptance and updates

The initial real-host matrix is deliberately unresolved:

| Check | Initial status |
| --- | --- |
| Clean account: catalog, exact version, bundled Skill | Pending |
| Installed plugin: authenticated production MCP operation | Pending |
| ChatGPT desktop: complete learning turn | Pending |
| ChatGPT web: complete learning turn | Pending |
| ChatGPT web with desktop fully exited | Pending |
| Native iOS / native Android | Pending / pending |
| Update from an earlier installed marketplace version | Pending |

For each observed result retain the exact candidate, marketplace commit, host,
account scope, time, and evidence reference. A new package does not inherit a
previous candidate's acceptance automatically. Unsupported and failed checks
stay distinct from passed checks; neither is a reason to fabricate acceptance.

For a subsequent Git update, regenerate from the new canonical version, pass
both repositories' checks, and verify the published tree again. In the test
client, the documented catalog-refresh command is:

```bash
codex plugin marketplace upgrade skillpilot-chatgpt-marketplace
```

Then verify the actually installed version, bundled Skill, authentication, and
learning turn. Catalog refresh does not prove package replacement or automatic
account-wide updates. Do not delete another plugin, the user's profile, or a
marketplace source as a routine refresh workaround.

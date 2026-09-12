# SkillPilot for ChatGPT — experimental Git marketplace

An independent **SkillPilot Coach v1** package: coaching skills plus the remote
SkillPilot MCP server. No pre-existing ChatGPT app ID or operator secret is
bundled. This is a controlled installation experiment, **not an OpenAI Directory
release or a claim of working ChatGPT web/mobile access**.

## Try the Git installation

In a supported Codex CLI environment:

```sh
codex plugin marketplace add https://github.com/enpasos/skillpilot-chatgpt-marketplace --ref main
codex plugin add skillpilot-coach-v1@skillpilot-chatgpt-marketplace
```

Start a new conversation after installation. A CLI installation verifies the
catalog/package path only; it does not automatically install the plugin into a
separate Windows desktop app, your ChatGPT web account, or mobile apps. Run the
installation in the environment used by the intended client. Do not install
both this candidate and another SkillPilot plugin into the same test environment.

OpenAI documents GitHub workspace import under **Admin → Plugins → Add → Import
marketplace** for eligible admins. For that route, MCP-configured imports are
explicitly **Desktop only**, even with an HTTPS server. Account-wide use after a
desktop installation is an experiment to verify, not a supported guarantee.

## Connection and learning

Use the bundled SkillPilot connection if the host offers it. OAuth, the allowed
client profile, and the OpenAI mTLS transport check remain mandatory. The target
JWT profile uses OpenAI-managed signing keys, not a secret distributed to users;
its production activation is a separate operation. A local raw-MCP client without
an OpenAI certificate cannot connect to the production endpoint. If connection
fails, stop and record the sanitized error; do not disable certificate checks,
enable anonymous access, paste an operator secret, or switch providers.

After a successful host connection, open [SkillPilot](https://skillpilot.com/),
choose **Start learning**, and use the new prepared chat. Do not put permanent
SkillPilot IDs, tokens, or session IDs into issues or test evidence.

The acceptance sequence is: catalog → installed package and skill → authenticated
desktop tool call → **new web chat with the desktop client fully exited** → native
mobile. A synchronized chat history alone is not evidence of callable tools or
available skills. Record each result separately, including account, host version,
plugin version and marketplace commit.

## Updates and integrity

```sh
codex plugin marketplace upgrade skillpilot-chatgpt-marketplace
codex plugin add skillpilot-coach-v1@skillpilot-chatgpt-marketplace
node validate.mjs
```

Check the installed version and start a new conversation. CLI refresh success
does not prove automatic updates in ChatGPT. `release-manifest.json` binds every
distributed file by SHA-256; this is reproducibility evidence, not a publisher
signature or proof of coach behavior. Published Git release tags must never be
overwritten. The public OpenAI portal release lifecycle remains separate.

[Operator runbook](https://enpasos.github.io/skillpilot/deploy/openai-personal-marketplace-release/)
· [OpenAI packaging](https://developers.openai.com/plugins/build/plugins)
· [OpenAI GitHub import and runtime restrictions](https://learn.chatgpt.com/docs/enterprise/plugin-management)
· [Privacy](https://skillpilot.com/privacy)
· [Terms](https://skillpilot.com/legal)
· [Support](https://skillpilot.com/imprint)

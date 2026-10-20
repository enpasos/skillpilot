# SkillPilot Coach for ChatGPT Desktop — local Git candidate

This export prepares the new **SkillPilot Coach** plugin, technical identity
`skillpilot-coach`, package version **1.1.3**. It includes the coaching skill,
icons and one remote MCP connection:
`https://mcp-openai.skillpilot.com/mcp`.

The candidate is unpublished. Local preparation does not deploy the endpoint,
update the public marketplace, submit a directory listing or establish host
acceptance. The earlier published `skillpilot-coach-v1` packages remain
historical releases. Their installation reports and acceptance evidence do not
apply to this new identity. Existing installations do not automatically migrate.

## Prepared installation route

After a separately authorized publication and verified endpoint deployment,
the intended Desktop route is:

1. Add `https://github.com/enpasos/skillpilot-chatgpt-marketplace` in the
   ChatGPT Desktop plugin marketplace settings.
2. Select **SkillPilot Coach** and verify the expected package version.
3. Connect through the plugin's OAuth flow. The package requests OAuth/CIMD;
   no client secret is included. The server validates hosted and native client
   profiles independently.
4. Open [SkillPilot](https://skillpilot.com/), configure the learning context
   and generate the ChatGPT start message.
5. Use that fresh message in a **new chat** with the plugin enabled.

The exact durable plugin identity and endpoint remain the same across future
package major versions. Package SemVer and the runtime contract major are
independent. Start each learning session through the first-party WebGUI;
previous chats are not a migration or resumption requirement.

This Git installation route is Desktop only. Web and mobile are targets of the
separate hosted directory route and require their own actual host checks.
Desktop authentication, tools, image display, Voice behavior and updates also
remain pending for this new candidate.

For a supported Codex CLI, the corresponding future installation commands are:

```sh
codex plugin marketplace add https://github.com/enpasos/skillpilot-chatgpt-marketplace --ref main
codex plugin add skillpilot-coach@skillpilot-chatgpt-marketplace
codex plugin marketplace upgrade skillpilot-chatgpt-marketplace
```

## Integrity and release status

`release-manifest.json` binds the complete closed inventory by SHA-256.
Run `node validate.mjs` in this export to verify those bytes. This checks
package integrity; it cannot certify deployment, publication or host behavior.
Preserve historical published release tags and archives.

Canonical source:
`ai/openai plugin/skillpilot-coach` in
[enpasos/skillpilot](https://github.com/enpasos/skillpilot).

[Operator runbook](https://enpasos.github.io/skillpilot/deploy/openai-personal-marketplace-release/)
· [Privacy](https://skillpilot.com/privacy)
· [Terms](https://skillpilot.com/legal)
· [Support](https://skillpilot.com/imprint)

# OpenAI plugin sources

The current canonical package is [`skillpilot-coach/`](skillpilot-coach/):
**SkillPilot Coach**, technical identity `skillpilot-coach`, with the durable
MCP endpoint `https://mcp-openai.skillpilot.com/mcp`. Its package SemVer is
independent of runtime `contractMajor`.

`skillpilot-coach-v1/` is inactive historical source. Its existing drafts,
review records and published Git release bytes remain intact. Current release,
submission, dialog and Git export tooling select the neutral package. Existing
installations do not automatically migrate to the new identity.

External Windows testers install **SkillPilot Coach** through the
[Git marketplace](https://github.com/enpasos/skillpilot-chatgpt-marketplace#readme).
The release process verifies the default branch against the canonical package.
The neutral 1.1.3 snapshot is retained.

Version **1.2.0** was also deployed privately to the owner’s ChatGPT account
on 25 November 2026 and appeared as installed in the Windows client. The portable
private export includes the skill and either the neutral remote MCP connection
or a verified workspace app binding. See the [beta deployment and test
record](../../docs/deploy/openai-beta-distribution-assessment.md).

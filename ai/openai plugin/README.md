# OpenAI plugin sources

The current canonical package is [`skillpilot-coach/`](skillpilot-coach/):
**SkillPilot Coach**, technical identity `skillpilot-coach`, with the durable
MCP endpoint `https://mcp-openai.skillpilot.com/mcp`. Its package SemVer is
independent of runtime `contractMajor`.

`skillpilot-coach-v1/` is inactive historical source. Its existing drafts,
review records and published Git release bytes remain intact. Current release,
submission, dialog and Git export tooling select the neutral package. Existing
installations do not automatically migrate to the new identity.

The neutral 1.1.3 candidate is prepared locally and unpublished. Endpoint
rollout, marketplace publication, directory submission and actual host
acceptance are separate operations.

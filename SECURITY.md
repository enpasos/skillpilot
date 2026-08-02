# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately through GitHub:

1. Go to [Security advisories](https://github.com/enpasos/skillpilot/security/advisories/new).
2. Describe the problem, how to reproduce it, and what an attacker could reach.

If you cannot use GitHub, use the contact details in the [SkillPilot imprint](https://skillpilot.com/imprint) and mark the message as a security report.

We will confirm receipt, keep you informed while we investigate, and credit you in the advisory unless you prefer otherwise.

## What is in scope

- The SkillPilot backend and its APIs
- The SkillPilot web app
- The learning coach integrations, in particular the OpenAI MCP app and its OAuth and session handling
- Learner data handling, including the SkillPilot ID model

## Learner data

SkillPilot is used by learners, including minors, so anything that could expose learner state, progress, or identifiers is treated as high severity. The privacy and storage model is described in [Data Privacy and Storage](https://enpasos.github.io/skillpilot/security/data-privacy/), and the client-binding model for the MCP coach in [OpenAI MCP Client Binding](https://enpasos.github.io/skillpilot/security/openai-mcp-client-binding/).

If your report involves a SkillPilot ID, please describe the problem without pasting a real learner's ID.

## Supported versions

SkillPilot is developed continuously and deployed from `main`. Fixes go into `main`; there is no separate maintenance branch for older releases.

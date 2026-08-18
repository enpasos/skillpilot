# Deployment Documentation Index

This page groups deployment-facing operational documentation.

## Deployment

- [SkillPilot Deployment Process](deployment.md)
- [ChatGPT-App „SkillPilot Coach v1“: Deployment und Cutover](openai-mcp-coach-v1.md)
- [SkillPilot Coach v1: Release, Rollback und Stilllegung](openai-plugin-v1-release.md)
- [SkillPilot Coach v1.0.0: aktive OpenAI-Review-Sperre](openai-plugin-v1-review-freeze.md)
- [SkillPilot Coach v1: OpenAI-Submission-Dossier](openai-plugin-v1-submission.md)
- [Neue SkillPilot Custom GPTs als befristeter Übergangskanal](openai-custom-gpt-interim.md)
- [Claude coach (paused beta): architecture, testing, and reactivation](claude-coach-beta.md)
- [SkillPilot Claude Connector v1: one-JVM architecture and service concept](claude-connector-v1-concept.md)
- [SkillPilot Claude Connector v1: developer implementation plan](claude-connector-v1-implementation-plan.md)

## Maintenance

- Add deployment runbooks or release-process notes here.
- `cd app && npm run check:docs-indexes` fails if a direct Markdown child of `docs/deploy/` is missing from this index.

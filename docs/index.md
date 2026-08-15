# SkillPilot – Your Personal Learning Navigator

[![CI](https://github.com/enpasos/skillpilot/actions/workflows/ci.yml/badge.svg)](https://github.com/enpasos/skillpilot/actions/workflows/ci.yml)

SkillPilot navigates you through complex skill landscapes, modeling curricula as a dependency graph to provide personalized learning paths and track your mastery.

This project is an invitation to the community to jointly build and bring to life a secure platform for skill landscapes—a shared home where learners, educators, curriculum institutions, and supporting AIs alike can thrive.

![SkillPilot cartoon](comic1/SkillPilot_Comic.en.jpg)

## Choose your path

### Learners & teachers
-   [Schnellstart (DE)](quickstart/story.de.md)
-   [Quickstart (EN)](quickstart/story.en.md)
-   [Live app](https://skillpilot.com)

### Curriculum champions
-   [Curricula & Champions](https://skillpilot.com/curricula)
-   [Champion guide](qa-ci/champion-guide.md)
-   [Four-level QA model](qa-ci/four-level-champion-model.md)
-   [QA/CI documentation](qa-ci/index.md)
-   [Canonical Gymnasium Math rollout status](dev/canonical-gymnasium-math-bundeslaender-status.md)
-   [Canonical Gymnasium Physics rollout status](dev/canonical-gymnasium-physics-bundeslaender-status.md)

### High-level overview
-   [Whitepaper (EN)](whitepaper/whitepaper.en.md)
-   [Whitepaper (DE)](whitepaper/whitepaper.de.md)
-   [Levels of personalization](concept/levels-of-personalization.md)

### AI learning coach (ChatGPT / MCP)

Diese Architekturtexte sind derzeit auf Deutsch verfasst. Der beschriebene
OpenAI-V1-Vertrag ist dennoch sprachneutral und bedient alle vom Backend
freigegebenen Interaktionssprachen.

-   [SkillPilot-Lerncoach: OpenAI-Plugin-, Skill- und MCP-App-Architektur](concept/runtime-workflows/skillpilot-owned-coach-architecture.md)
-   [Kommunikationsvertrag zwischen ChatClient und SkillPilot-Backend](concept/runtime-workflows/provider-neutral-coach-boundary.md)
-   [OpenAI-Plugin: Versionierung und Lebenszyklus](concept/runtime-workflows/openai-plugin-versioning-and-lifecycle.md)
-   [OpenAI-MCP-App: OAuth-Appbindung und 24h-Lernsession](concept/runtime-workflows/openai-mcp-oauth-learner-session-architecture.md)
-   [OpenAI-MCP-Clientbindung](security/openai-mcp-client-binding.md)
-   [Release, Rollback und Stilllegung von SkillPilot Coach v1](deploy/openai-plugin-v1-release.md)
-   [Aktive OpenAI-Review-Sperre für SkillPilot Coach v1.0.0](deploy/openai-plugin-v1-review-freeze.md)
-   [OpenAI-Submission-Dossier für SkillPilot Coach v1](deploy/openai-plugin-v1-submission.md)
-   [Rollback: ChatGPT Visible Session](concept/runtime-workflows/chatgpt-visible-session-flow.md)

### Programme status
-   [Canonical Gymnasium implementation plan](dev/canonical-gymnasium-implementation-plan.md)
-   [Dual curriculum package implementation status](dev/dual-curriculum-package-implementation-status.md)
-   [Current curriculum quality status](qa-ci/status/curriculum-quality-status.md)

## Inside this documentation

The docs here are organized by intent: concept-level foundations (skill graph and didactics), then runtime workflows, followed by operational topics like pipelines, QA/CI, deployment, developer references, and security.

-   [Glossary of core SkillPilot terms](concept/glossary.md)
-   [Documentation guidelines](dev/documentation-guidelines.md)
-   [Quickstart documentation index](quickstart/index.md)
-   [Whitepaper documentation index](whitepaper/index.md)
-   [Concept documentation index](concept/index.md)
-   [Production pipelines index](production-pipelines/index.md)
-   [Developer documentation index](dev/index.md)
-   [QA/CI documentation index](qa-ci/index.md)
-   [Deployment documentation index](deploy/index.md)
-   [Legal and AI transparency evidence](legal/index.md)
-   [Security documentation index](security/index.md)

## Contribute

-   **Curriculum Champions:** Start with the Curricula & Champions entry above.
-   **Developers & designers:** Open Issues/PRs at [github.com/enpasos/skillpilot/issues](https://github.com/enpasos/skillpilot/issues)

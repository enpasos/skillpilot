# SkillPilot Coach: one MCP App per major version

## Decision

SkillPilot publishes one MCP App/plugin identity per contract major, not one
per learner language.

For V1 the external boundary is:

```text
SkillPilot Coach v1
  plugin: skillpilot-coach-v1
  origin: https://mcp-coach-v1.skillpilot.com
  endpoint: /mcp
  protocol metadata: English
  learner language: backend session communicationLocale
```

The English protocol text is guidance for the model and host. It does not ask
the learner to communicate in English and does not override target-language
payloads. The model must use the session's `communicationLocale` for its
learner-facing response.

## Why this boundary is sufficient

- SkillPilot already fixes the communication language when it creates the
  learning session.
- All learner-visible backend payloads arrive in that target language.
- Tool names and JSON schemas are internal model-facing protocol metadata.
- Modern language models can follow English protocol instructions while
  conversing with the learner in another explicit language.
- One identity avoids duplicate OAuth clients, app registrations, review
  processes, release snapshots, subdomains, and version drift.

A language split remains possible only if a future host or model shows a
measured reliability problem that cannot be solved by explicit locale metadata
and tests. It is not the default architecture.

## Runtime flow

```text
ChatGPT / MCP host
        |
        | one English V1 tool catalog
        v
https://mcp-coach-v1.skillpilot.com/mcp
        |
        | one shared Spring Boot process
        v
SkillPilot session state
  - communicationLocale (authoritative)
  - curriculum and learner scope
  - active goal and mastery
  - localized payloads and UI data
```

The language is not supplied as a tool argument. A model cannot switch a
session from German to English by changing a request field.

## Local prototype

The Node prototype mirrors the singular contract on `/mcp`. Its `de` and `en`
modules are localized fixtures only. The local preview header
`x-skillpilot-demo-locale` selects fixture data for tests; it is not a product
API or production state mechanism.

## Versioning

The major version owns the externally observable MCP contract, plugin bundle,
OAuth audience, UI resource identity, and public origin. Compatible internal
work remains in the `1.0.0-SNAPSHOT` draft until an actual publication is
recorded. A new language does not increment the contract version and does not
create a new plugin line.

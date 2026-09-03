# Changelog

## 1.0.4 - 2026-09-03

- Keep policy, instruction, tool-schema, parameter, retry and private
  deliberation mechanics out of learner-facing text and speech; present only
  the useful coaching result.
- Treat a clear start or continuation intent after the tailored orientation
  exchange as completion without another confirmation loop, persist it before
  continuing, and use only the backend-selected successor.
- Keep ordinary mastery feedback distinct from the silent orientation
  transition and prohibit unsupported promises to remember a learner's topic
  preference as durable state.
- Require exact-candidate acceptance for these behaviors in Claude Web and
  native Android Voice mode before Marketplace activation and the first-party
  route switch.

## 1.0.3 - 2026-09-03

- Prepare the first public personal Git marketplace candidate. Publication
  remains blocked until the candidate-specific acceptance and activation
  evidence passes.
- Make the pre-public controlled-user cutover from uploaded 1.0.2 installs
  explicit; 1.0.2 remains immutable historical evidence and is not a supported
  mixed-version fallback.
- Let Claude decide only that the active goal is complete. The SkillPilot
  backend persists that completion, selects the successor and returns its
  canonical context; the plugin no longer sends a model-selected progression
  path.
- Require exact-candidate acceptance that proves completion persistence and
  backend-selected successor behavior in Claude Web and Android Voice mode.

## 1.0.2 - 2026-08-31 (not published)

- Prepared the initial personal Git marketplace tree without publishing it.
- Kept the six plugin files byte-identical to the reviewed 1.0.2 direct-install
  package.

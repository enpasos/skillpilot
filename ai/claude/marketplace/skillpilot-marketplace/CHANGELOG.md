# Changelog

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

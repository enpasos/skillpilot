# SkillPilot Coach v1 — 1.1.0 resubmission draft

This unpublished successor replaces the rejected 1.0.0 submission. The Product
Owner explicitly lifted its development freeze on 9 September 2026. The old
snapshot remains historical evidence, not an active source-code freeze.

## Changes

- Include the sanitized daily multi-subject plan in authoritative full context,
  without a redundant daily-plan read tool.
- Add guarded plan continuation and subject switching, preserving unfinished
  work and respecting status-only, pause, exam, and learner-consent boundaries.
- Use one compact daily overview with separate overdue work and explicit
  unavailable-plan guidance; never invent progress from missing data.
- Keep orientation, teaching, mastery, memory practice, Verified Recall and
  assessment safeguards. Optional visualizations never replace complete text.
- Submit the remote MCP server directly, without the former development-app
  reference. Refresh listing and review scenarios from maintained sources.
- Generate complete positive and negative portal test cases, with regression
  checks against truncation, stale tool metadata, missing outcomes and drift.

The plugin remains contract major 1; package version is 1.1.0, workflow version
is `coach@1.1`, and lifecycle policy revision is 5. No release has been published.
Local fixtures and widget tests are not a substitute for model tool-choice or
real ChatGPT host acceptance. A new portal scan, current reviewer evidence and
explicit final submission remain separate steps; the old video does not certify
the successor. This change does not deploy or submit anything.

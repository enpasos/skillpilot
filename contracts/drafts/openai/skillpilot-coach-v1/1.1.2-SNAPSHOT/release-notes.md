# SkillPilot Coach v1 — 1.1.2 delayed goal-image loading correction

This unpublished candidate corrects the OpenAI goal-image renderer's handling
of delayed host initialization and image delivery. The published Git package
`1.1.1` and its prepared draft remain unchanged. No publication, deployment,
portal submission or real-host acceptance follows from this preparation.

## Correction

- Keep a pending goal image alive when the host tool result or approved image
  takes longer than the former 10-second bootstrap or 15-second image deadline.
  Elapsed time alone must not tear down or request closure of the component.
- Preserve the existing handling of an unavailable or hidden image, actual
  initialization and delivery failures, and explicit host dismissal. A pending
  image never authorizes invented content or a claim that the host displayed it.
- Bind the corrected active UI to its new content hash. Retain the previously
  advertised image resources with their exact bytes for existing chats and caches.

The backend still returns the complete authoritative successor after a mastery
write. A new permitted `(goalId, stateVersion)` pair can authorize its renderer
after learner continuation; result feedback does not reveal the successor early.
The renderer remains optional presentation, and complete text coaching continues
when a host does not display it, including during voice use.

This patch adds no tool, endpoint, OAuth profile, permission or workflow
capability. Contract major remains `1`, workflow version remains `coach@1.1`,
and lifecycle policy revision remains `5` with OpenAI publication status `DRAFT`.
Local SDK, browser and contract checks do not establish that ChatGPT Desktop
displays two successive learning-goal images or supports those images during
voice use. That acceptance must be recorded in the actual host separately.

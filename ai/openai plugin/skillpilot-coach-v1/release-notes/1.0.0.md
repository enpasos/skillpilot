# SkillPilot Coach v1 – 1.0.0

Draft of the first permanently isolatable public SkillPilot Coach contract
line. This version has not been published yet.

- language-neutral technical plugin identity `skillpilot-coach-v1` and MCP
  contract major `1`
- one shared German and English coach; the immutable
  `communicationLocale` of the learning session controls every learner-facing
  response
- public MCP endpoint and exact OAuth resource
  `https://mcp-coach-v1.skillpilot.com/mcp`, with RFC 9728 metadata at
  `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp`
- web-first start contract: permanent SkillPilot ID creation or recovery,
  provider notice, curriculum, stage, subjects, course profiles, and
  personalization remain exclusively in the first-party SkillPilot WebGUI
- every explicit **Lernen starten** / **Start learning** action creates a fresh,
  opaque, absolutely expiring `learningSessionId`, inserts it into the short
  prepared start message, and opens a new chat
- no sessionless start tool, provider-side identity bootstrap, in-chat renewal,
  or chat-side curriculum/personalization mutation in the
  active V1 model contract
- policy revision `3` removes the unpublished revision-2 provider-side start
  contract, including its tools, resources, runtime services, and widget source
- without a current prepared start message, the coach gives only the localized
  `https://skillpilot.com/` start instruction and performs no SkillPilot call
- `get_skillpilot_context` establishes fresh state at the start of each learner
  turn; a successful state-changing result is the authoritative successor for
  the remainder of that same assistant turn and is not redundantly reloaded
- every new session-bound operation requires at least `PT1H` remaining; exactly
  one hour is valid, less than one hour returns `SESSION_RENEWAL_REQUIRED`
  before the domain operation
- gated first-party-only session UX testing: one WebGUI launch may set
  request-local `diagnosticSessionTtlSeconds` from `3601` through `86400`, never
  above `PT24H`; the next launch without it automatically uses `PT24H` again
- `SESSION_REQUIRED`, `SESSION_RENEWAL_REQUIRED`, and
  `SESSION_VERSION_UNAVAILABLE` are not OAuth failures: the coach outputs only
  the server-owned localized instruction, adding the exact `startUrl` only when
  it is not already present, and the learner starts a fresh session and new chat
  from SkillPilot
- OAuth authorizes the fixed App connection but never identifies the learner;
  the backend resolves the learner only through the explicit learning-session
  mapping
- Level 3 focus and active-goal changes remain available through fresh,
  backend-published options; curriculum and personalization do not
- retry-safe writes use a fresh `clientRequestId` and current
  `expectedStateVersion`; an already committed identical write can replay only
  with at least `PT1H` remaining, available pinned revisions, and an unchanged
  canonical learner-state revision
- exactly two active content-addressed MCP Apps UI resources: the read-only
  active-goal image renderer and interactive memory-card practice
- earlier advertised image resource URIs remain byte-identical passive
  resources for provider cache and chat-snapshot compatibility
- goal visualization uses the dedicated read-only renderer when the newest full
  context or successful mutation successor contains a matching approved image
  and permits it; the renderer is the immediate next tool call, attempts are
  not retried, top-level `stateVersion` is copied into
  `expectedStateVersion`, no client-surface gate is applied, and the normal
  coaching response remains complete if the host omits the optional component
- memory practice uses a separate component and app-only card review; normal
  practice updates repetition scheduling and never creates mastery evidence
- exact localized active-goal title announcement, motivational orientation,
  dialogic learning, evidence-based mastery, strict Verified Recall, and
  criterion-based assessment
- mandatory mastery completion handoff: concrete feedback on visible work is
  followed by the outcome before a confirmed successor is introduced
- exam completion remains fail closed and requires the current opaque
  evaluation capability plus a finite passing score
- SkillPilot paper-plane icon and plugin logo copied unchanged from
  `app/public/favicon/`
- one install bundle for the shared Spring Boot runtime; language does not
  create another server artifact or release line
- mutable unpublished `1.0.0-SNAPSHOT` draft; published snapshots remain
  immutable

# SkillPilot Coach v1 – 1.0.0

Draft of the first permanently isolatable public SkillPilot Coach contract
line. This version has not been published yet.

- language-neutral technical plugin identity `skillpilot-coach-v1`
- MCP contract major `1`
- one shared coach plugin for all communication locales supported by the
  backend; the immutable `communicationLocale` of the learning session is
  authoritative for every learner-facing response
- language-neutral English skill, policy, tool names, schemas, and server
  instructions; runtime payloads remain localized by SkillPilot
- public MCP endpoint and exact OAuth resource
  `https://mcp-coach-v1.skillpilot.com/mcp`
- path-specific protected-resource metadata at
  `https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp`
- a dedicated MCP origin that can be verified independently from future
  contract majors; OAuth authorization continues through
  `https://skillpilot.com`
- one widget origin unique to this plugin,
  `https://mcp-coach-v1.skillpilot.com`, published both through
  `_meta.ui.domain` and the ChatGPT compatibility alias
  `_meta["openai/widgetDomain"]`
- read-only MCP UI card for the image of an active atomic learning goal with a
  matching canonical `goal-visualization` link
- image-only presentation without additional goal text or cockpit link; it is
  shown only after the image has loaded successfully
- host-neutral image loading for browser, desktop, and native mobile hosts,
  without relying on optional platform or user-agent hints; a bounded bootstrap
  deadline also closes a hidden view that never receives its structured result,
  while image errors and load timeouts request teardown independently of the
  MCP Apps handshake
- immutable UI-resource retention for real draft clients: the active
  `c890cf271...` resource remains the only output template for new messages,
  while every previously advertised resource — `12f95e37...`, `5564f42d...`,
  `bed59e4c...`, `45e1f58d...`, and `157aab83...` — stays byte-for-byte
  readable so existing browser and native-app chats do not fail with HTTP 404
- privacy-safe `resources/read` telemetry recording the public content address,
  whether the client requested the active or a retained artifact, the outcome,
  and the latency, so a host that stalls after mounting is distinguishable from
  a client that never fetched the component
- dedicated read-only rendering action that the coach invokes only when an
  approved image is present; no image means no empty UI card
- idempotent initialization from MCP tool result, ChatGPT compatibility state,
  and persisted widget state; duplicate or partial host updates and late
  errors from replaced image nodes do not remove a visible image
- cockpit preference for learning-goal images in chat, enabled by default
- visualizations are orientation only, never evidence, tasks, solutions,
  assessments, or mastery proof
- SkillPilot paper-plane composer icon and plugin logo, copied unchanged from
  `app/public/favicon/`
- one install bundle for the single shared Spring Boot runtime; language does
  not create a second server artifact or release line
- mutable, unpublished `1.0.0-SNAPSHOT` draft; the contract, UI, and skill
  bundle are sealed only after actual portal publication
- no public compatibility alias on `skillpilot.com`

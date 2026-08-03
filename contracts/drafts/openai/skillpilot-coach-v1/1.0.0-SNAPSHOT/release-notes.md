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
- standard MCP image-content delivery for the image of an active atomic
  learning goal with a matching canonical `goal-visualization` link
- no MCP UI resource, iframe, widget domain, `ui.resourceUri`, or
  `openai/outputTemplate`; a host may render the standard image block natively
- no backward compatibility for experimental widget resources from earlier
  unpublished draft tests; refresh the plugin metadata and use a fresh chat
- immediate data-then-render goal-image flow: after a full result exposes and
  permits an image, the renderer follows exactly once in the same assistant
  turn with that result's unchanged `goalId` and `expectedStateVersion`; stale
  or attempted images are not retried and the full result remains authoritative
- desktop-web image delivery with a fail-closed presentation gate: the adapter
  uses the optional best-effort `openai/userAgent` hint only to offer the image to
  an explicitly recognized desktop browser; mobile/native and unknown clients
  stay on the complete text path without starting the renderer. The raw hint is
  neither logged nor persisted and never affects identity, authorization, or
  learning state
- dedicated read-only rendering action that the coach invokes only when an
  approved image is present; no image means no image tool call
- cockpit preference for learning-goal images in chat, enabled by default
- visualizations are orientation only, never evidence, tasks, solutions,
  assessments, or mastery proof
- SkillPilot paper-plane composer icon and plugin logo, copied unchanged from
  `app/public/favicon/`
- one install bundle for the single shared Spring Boot runtime; language does
  not create a second server artifact or release line
- mutable, unpublished `1.0.0-SNAPSHOT` draft; the contract and skill
  bundle are sealed only after actual portal publication
- no public compatibility alias on `skillpilot.com`

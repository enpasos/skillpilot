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
  `https://mcp-coach-v1.skillpilot.com`, published through `_meta.ui.domain`
  and the ChatGPT compatibility alias `_meta["openai/widgetDomain"]`
- two distinct active content-addressed MCP Apps UI resources: the read-only
  image of an active atomic learning goal with a matching canonical
  `goal-visualization` link, and interactive memory-card practice in chat; plus
  immutable passive resources for previously advertised hash URIs
- per-tool `ui.resourceUri` and `openai/outputTemplate` bindings for the goal
  renderer and memory-practice launcher; the app-only card-review tool and all
  ordinary context, selection, mutation, recall, and assessment tools remain
  UI-free
- private, bounded due-card batches for the memory-practice component with
  state-free card flipping and backward/forward navigation; the learner records
  only the clear `Not yet` or `Got it` choice, mapped internally to the
  repetition schedule without changing mastery
- deterministic memory-practice launch: choosing the localized flashcard label
  invokes the dedicated UI tool immediately; a Cockpit link is permitted only
  after a real start-tool error, missing current authorization, or an explicit
  Cockpit request
- structured `goalVisualization` delivery to an image-only component; bare
  MCP `ImageContent` is not used as a visibility contract
- immutable passive retention of every content-addressed widget URI already
  advertised to a real test client, while only the current resource remains
  bound to the renderer
- immediate data-then-render goal-image flow: after a full result exposes and
  permits an image, the renderer follows exactly once in the same assistant
  turn with that result's unchanged `goalId` and `expectedStateVersion`; stale
  or attempted images are not retried and the full result remains authoritative
- surface-neutral renderer authorization without inspecting
  `openai/userAgent` or applying Desktop/Mobile presentation gates; the
  ordinary coaching response remains complete if a host does not display the
  optional component
- dedicated read-only rendering action that the coach invokes only when an
  approved image is present; no image means no renderer call or empty UI card
- image-only presentation without additional goal text or cockpit link; the
  component remains hidden until the approved image has loaded successfully
- cockpit preference for learning-goal images in chat, enabled by default
- visualizations are orientation only, never evidence, tasks, solutions,
  assessments, or mastery proof
- exact localized active-goal title announcement and full dialogic learning
  behavior carried forward from the proven German and English coach guides
- active motivation dialogue: choosing a possibility starts a tailored
  follow-up about what the learner can understand and do; it no longer causes
  a generic acknowledgement followed immediately by the next-goal menu
- SkillPilot paper-plane composer icon and plugin logo, copied unchanged from
  `app/public/favicon/`
- one install bundle for the single shared Spring Boot runtime; language does
  not create a second server artifact or release line
- mutable, unpublished `1.0.0-SNAPSHOT` draft; the contract, active per-tool UI
  bindings, and skill bundle are sealed only after actual portal publication
- no public compatibility alias on `skillpilot.com`

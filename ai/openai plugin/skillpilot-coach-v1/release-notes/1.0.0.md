# SkillPilot Coach v1 – 1.0.0

Draft of the first permanently isolatable public SkillPilot Coach contract
line. This version has not been published yet.

The private direct-start surface is currently approved only for internal
canary use. Public submission remains blocked until OpenAI explicitly accepts
the widget's handling of a newly issued or existing bearer-like SkillPilot ID or the public
architecture no longer processes that ID.

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
- three distinct active content-addressed MCP Apps UI resources: a private
  direct-start surface, the read-only image of an active atomic learning goal
  with a matching canonical `goal-visualization` link, and interactive
  memory-card practice in chat; plus
  immutable passive resources for every previously advertised hash or
  version-addressed goal-image URI
- per-tool `ui.resourceUri` and `openai/outputTemplate` bindings for the
  direct-start opener, goal renderer, and memory-practice launcher; the
  app-only capability issuer, app-only card-review tool, and all ordinary
  context, selection, mutation, recall, and assessment tools remain UI-free
- private app-first start without OAuth-to-learner coupling: OAuth continues to
  authorize only the fixed App-to-Core connection; the component obtains an
  ID-free, short-lived app-only setup capability, then either creates a new
  SkillPilot ID or sends an explicitly entered existing ID only through the
  fixed SkillPilot HTTPS bootstrap endpoint
- the same direct-start component completes ID recovery acknowledgement,
  curriculum selection, and personalisation through the existing ID-free
  session tools before it submits the short start message to the host; the
  normal App-first path never opens the SkillPilot web application
- curriculum selection uses the same three categories, four quality-light
  filters, default selection and ordering as the SkillPilot Web UI; a closed
  server-authoritative catalog projection binds those facets one-to-one to the
  currently allowed curriculum options, so the component never infers them
  from an ID, title, or description
- the native curriculum selector remains on its explicit disabled placeholder
  until the learner chooses an option, so browser auto-selection cannot swallow
  the only `change` event for a single visible curriculum
- the permanent SkillPilot ID is confined to the direct HTTPS request/response
  and ephemeral component memory or recovery DOM; it never enters chat, model
  context, MCP arguments or results (including `_meta`), `window.openai`,
  widget state, browser storage, URLs, logs, analytics, or telemetry
- CREATE returns the newly generated ID only in the direct HTTPS response and
  requires explicit recovery acknowledgement; EXISTING keeps an unknown ID
  terminally unavailable for that attempt
- policy revision `2` binds CREATE plus complete in-component setup semantics
  and terminally invalidates older direct-start capabilities; the materially
  expanded disclosure is immutably versioned as
  `openai-provider-eligibility-v2`
- direct start supports both the shared MCP Apps action pair and the documented
  ChatGPT Web compatibility pair `window.openai.callTool` plus
  `window.openai.sendFollowUpMessage`; one start attempt fixes exactly one
  complete channel before dispatch and never double-calls across channels
- `get_skillpilot_context`, `set_skillpilot_curriculum`, and
  `set_skillpilot_personalization` remain model- and app-visible, UI-unbound,
  and explicitly component-callable; every write uses the newest exact
  `stateVersion` and a retry-safe `clientRequestId`, and none carries the
  permanent SkillPilot ID
- irreversible request binding, a random 256-bit learning-session handle, and
  an AEAD-encrypted short-lived delivery record provide crash-safe exact retries
  without persisting the SkillPilot ID, raw capability, session token, request
  body, or start message in the bootstrap tables
- separate lifecycle axes for support, publication, and new-session policy,
  with a monotone policy revision that terminally invalidates stale or blocked
  direct-start capabilities
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
- immutable passive retention of every widget URI already advertised to a real
  test client, including the original `1.0.0` goal-image URI and earlier
  direct-start hashes, while only each current content-addressed resource
  remains bound to its tool
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
- mandatory completion handoff for every mastery write: concrete feedback on
  the learner's work, followed by a clear outcome, is returned and shown before
  the already activated successor; evidence from the completed goal is reset
  at that transition
- fail-closed exam completion: the released evaluation supplies a
  session-, goal-, state-, and curriculum-bound capability, and mastery is
  accepted only with that capability and a finite passing score
- authoritative autopilot continuation without a stale goal menu: immediate
  next actions no longer advertise navigation, accidental goal navigation
  publishes no choices while a goal is active, and only an explicit
  `redirect=true` change request can expose alternative goals
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

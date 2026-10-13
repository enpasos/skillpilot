### 7.3 Atomic goal visualizations

Atomic learning goals may optionally carry one or more didactic image references
for cockpit and provider use. The multilingual OpenAI V1 MCP coach may present
the current goal's visualization through its one explicitly bound MCP Apps UI
resource when the active goal is atomic, has a matching canonical
`goal-visualization` link, and the learner's default-on
`showGoalVisualizationsInChat` preference is not disabled.

Rule:

* Store visualization references directly on the goal in canonical `resourceLinks`, not in a separate learner-facing branch or custom top-level image field.
* Use `type: "goal-visualization"`, `resourceType: "image"`, and `skillpilotId` equal to the containing goal's `id`.
* Public URLs should be root-relative under `/assets/goal-visualizations/...`.
  The OpenAI V1 adapter resolves the matching active atomic goal's asset to an
  absolute public URL and exposes it only through the bounded
  `goalVisualization` projection used by the image renderer. Other resources
  and provider adapters continue to use a normal cockpit deep link such as
  `https://skillpilot.com/?l=<curriculumId>&goal=<goalId>`.
* `render_skillpilot_goal_visualization` is a read-only image renderer. It
  returns bounded `goalVisualization` data in `structuredContent` for the
  image-only widget. Its descriptor is the only goal-visualization descriptor that carries
  `ui.resourceUri` and the `openai/outputTemplate` compatibility alias, both
  pointing to the same active content-addressed resource. The widget displays
  only the approved image; goal title, description, ID, and cockpit URL may be
  retained for validation but are not rendered. A naked MCP `ImageContent`
  block is not the V1 display contract and must not be treated as a guaranteed
  inline presentation.
* V1 publishes exactly one active, hash-bound MCP Apps HTML resource for this
  renderer. Its URI contains the SHA-256 of the self-contained HTML bytes, and
  the renderer binds exactly that active resource. `resources/list` and
  `resources/read` also keep every previously advertised content-addressed
  resource byte-identically readable for provider metadata caches. Ordinary
  context, curriculum/mastery mutations, recall, and exam tools carry no UI
  binding and therefore do not create empty UI boxes. The independently bound
  memory-practice launcher is a separate UI contract and does not weaken this
  image-renderer invariant.
  This is the documented OpenAI component contract: a selected tool links a
  registered `text/html;profile=mcp-app` resource through
  `_meta.ui.resourceUri`, with `_meta["openai/outputTemplate"]` only as the
  ChatGPT compatibility alias. See
  `https://developers.openai.com/plugins/build/chatgpt-ui` and the explicit
  "Structured content only, no component" diagnostic at
  `https://developers.openai.com/plugins/deploy/troubleshooting#server-side-issues`.
  Never infer a visible ChatGPT component from generic MCP content alone.
* Offer the renderer only when the preference is enabled and a safe
  `goalVisualization` projection exists. The widget starts collapsed, becomes
  visible only after a valid image has loaded, and collapses and requests
  teardown when input is absent or malformed or the image fails. These failures
  must not affect the complete ordinary coaching response.
* Image authorization is surface-neutral. Do not inspect `openai/userAgent`,
  infer Desktop/Mobile/App/Browser, or apply any client-surface presentation
  gate. A conforming host may render or decline the UI resource; this optional
  presentation result must never change authentication, authorization, state,
  persistence, or the ordinary chat result.
* A full context or state-changing result qualifies only when the learner has
  agreed to begin or continue the associated goal, its full context contains
  `goalVisualization`, and it permits the renderer. During feedback or a
  pending task/goal closure, never render the next task's or successor goal's
  image. Every previously
  unseen pair of that context's `goalVisualization.goalId` and the authorizing
  result's top-level `stateVersion` creates its own one-shot render
  authorization. After the learner has agreed to continue, call the renderer
  once for that pair as the immediate next tool call, even if an earlier pair in the conversation
  was already rendered. A repeated pair creates no automatic call. Only an
  explicit learner request to show the current image again creates one new
  one-shot authorization after a fresh qualifying result. Copy the pair into
  `goalId` and `expectedStateVersion` unchanged. Never insert another tool call,
  reuse stale authorization, or retry otherwise. Commit positive ordinary or
  exam mastery as soon as the assessment is complete, then give feedback and
  invite questions or continuation; render only after agreement
  to continue and before coaching the associated active goal. The receipt does
  not replace the authoritative full result, and omitted
  host presentation does not weaken the text path.
  The terminal Verified-Recall cross-flow is the narrow exception to deriving
  this call from those generic facts: when its authoritative `continuation`
  has `action: "renderGoalVisualizationThenTeachActiveGoal"`, execute the
  continuation's server-filled image-specific `toolCall` fields unchanged. This remains the
  same single imperative channel; never add a sibling `presentationAction` or
  bind the Recall write itself to the image UI.
* A content-addressed UI URI becomes immutable as soon as it has been advertised
  to a real client, including during draft testing. Replacing widget HTML
  produces a new active hash-bound URI; older URIs remain registered with their
  exact bytes as passive retained resources because provider metadata and chat
  snapshots may request them later. Retention is transport continuity, not a
  second active UI contract: only the current URI may be bound by a tool.
* The renderer result and widget create no state, authorization, goal selection,
  or permanent learner identity. Alt text remains accessibility metadata; the
  visible widget contains exactly the image and no caption, description, goal
  title, technical ID, or cockpit link.
* Image filenames should be the same SkillPilot ID plus image extension, using `<skillpilotId>.<ext>`, so copied assets remain self-identifying without creating Windows path-length problems.
* Keep source image and prompt metadata under `curricula/DE/Gymnasium/visualizations/<subject>/<skillpilotId>/`.
* For Gemini API generated images, keep `image-reconstruction-prompt.de.md` beside the canonical source image. It is a standalone alternative prompt derived from the generated image and may be offered or generated on demand in `/goal-visualization-qa` as a correction base; it does not override human review or fachliche correctness.
* **Image-provider policy, Product Owner decision of 13 September 2026:** KEEP good existing Mathematik and Physik images regardless of provider. For necessary new images or corrections of documented weaknesses, prefer ChatGPT/Codex **image generation**, subject to actual subject-matter quality, suitable representation and fit with the existing approachable visual style. For new Mathematik and Physik raster illustrations, the default image language is friendly, abstract, clear and comic-like rather than photorealistic or sterile-technical; the concrete representation still follows the fachliche need. Nano Banana Pro remains an allowed alternative when it better meets those needs; prior failure of either provider is not required. Programmatically drawn diagrams/SVGs remain narrow, documented fachlich justified exceptions, not a default style replacement. This supersedes the former Nano-Banana-first and retroactive provider-conversion requirements; historical receipts and valid reviews stay intact. Follow the detailed [provider and quality policy](docs/concept/skill-graph/atomic-goal-visualizations.md#provider-priority-and-exception-policy).
* For Nano Banana Pro automation, prefer `npm --prefix app run visualization:generate:nano-banana -- <goal>` with `GEMINI_API_KEY` or `GOOGLE_API_KEY` set; this generates the image, writes trace files under `tmp/`, creates the image-reconstruction prompt, imports the asset, and updates the canonical JSON.
* For manual/tool-based image generation, use `npm --prefix app run visualization:prepare -- <goal>` before generation and `npm --prefix app run visualization:import -- <goal> <file>` after generation instead of hand-building paths, filenames, or JSON links. Pass the actual `--provider` explicitly to both commands and the actual generation prompt via `--prompt` on import; legacy helper defaults or filenames do not identify the provider actually used. For Physics, also pass its canonical `--landscape` and `--subject=physik` to both commands.
* Provider prompts must not include SkillPilot IDs; IDs belong in filenames, directories, JSON links, and prompt metadata only. In provider-facing constraints, prefer neutral phrases such as `technical IDs` instead of naming SkillPilot.
* Record reviewed production batches under `curricula/DE/Gymnasium/quality/goal-visualization-review/`, including rejected/regenerated attempts and visible mathematical risks.
* Generated images are never accepted automatically. Separately inspect the actual image against the current goal and suitable existing style references: calculations, notation, labels, geometry, age fit, text readability, visible artifacts and representation/style fit. Record actual provider/model or tool, prompt/reference strategy, asset hash and review decision. Recheck affected goal, page, context and evidence bindings after substantive image changes; a mechanical hash refresh is not a content review. Preserve the existing transparency and human/AI approval distinction.
* Reject or regenerate any visualization with a wrong or misleading value, marked digit, angle, coordinate, side property, unit conversion, sign rule, counterexample, or notation. Text that is correct does not rescue a misleading drawing.
* If targeted image-generation attempts remain fachlich wrong, use an allowed alternative or a justified precise diagram; record the attempted prompts/reference strategy and visible defects without inventing prerequisite failures. If no candidate meets the same correctness, legibility and style bar, keep rejected candidates inactive, archive the evidence, remove any demonstrably unsuitable active link/published copies, and record the appropriate unresolved or `deferred_provider_limitation` decision. Do not weaken the gates or replace a good existing image merely because a new candidate failed.
* When an atomic goal is split, retain a good existing aggregate image on the surviving parent cluster whenever it still correctly summarizes the combined child content. Add more specific child images separately instead of erasing the useful overview.
* A visualization supports orientation only. Whether shown in the cockpit or
  inline in ChatGPT, it is not source evidence, not an assessment task, not a
  solution or performance record, and not a substitute for explanation or
  practice.
* Before broad rollout, review every image for mathematical correctness, age fit, text readability, accessibility alt text, and licensing/copyright risk.
* Goal-visualization QA is tracked per subject under `curricula/DE/Gymnasium/quality/goal-visualization-qa/*.qa.json`. `CQR-303` now represents complete deep curriculum QA, as defined in `docs/concept/curriculum-quality-and-human-trial.md`: M6 plus the central strict D/P/A/M/V intersection for every current `curricularAtomic` goal, successful required validation checks and no relevant blockers. Images are gate V, not a separate highest maturity. Technical `deferred_provider_limitation` is unfinished work and never a completed exception. An explicit `Approved AI` decision remains AI evidence and requires an exact current asset hash; it never becomes human approval. Gate V and M7 are machine-only: neither `humanApproved` nor `humanIssueIdentified` satisfies or vetoes them. Existing human image approvals, findings, historical artifacts and mandatory human release gates remain intact and are evaluated separately. M7 grants no human approval or practical human-trial completion and does not weaken core M5 or memory M6 requirements.

Reference:

* `docs/concept/skill-graph/atomic-goal-visualizations.md`

### 7.4 Learning-goal books and evidence review

The first learning-goal book edition is a deterministic publication and review
surface for ordinary technical atomic goals in reviewed learner-facing
composition views. It is not a second curriculum source.

Rules:

* Build HTML and PDF from one shared, versioned BookModel.
* Commit the curriculum, publication configuration, reviewed source bindings,
  visualization sources and renderer, not the generated publications under
  `app/public/lernzielbuch/`. `npm --prefix app run build:goal-books` generates
  the four registered PDFs, BookModels, source indexes, render manifests and
  publication index before application packaging. CI shares one verified
  publication artifact across jobs; neither missing output nor a stale cache
  may bypass the existing publication checks. See
  `docs/deploy/goal-book-build-and-history-cleanup.md`.
* Include each eligible `target` goal exactly once and on exactly one complete
  PDF page. Cluster and structure nodes provide chapter paths; memory,
  orientation, practice/assessment, exam, and runtime-support nodes require
  separate later edition contracts.
* Show the full public **Lernziel-ID** on every goal page. Never confuse this
  curriculum identifier with a learner's permanent SkillPilot ID.
* Use a stable topological order that respects direct in-scope `requires`.
  `contains` supplies chapter context and deterministic ordering preferences,
  but never overrides a prerequisite edge.
* Render direct `requires` and derived reverse-`requires` as checked links to
  stable goal destinations. Broken, ambiguous, or missing destinations fail the
  build.
* Never clip, truncate, silently shrink, or continue a goal onto a second page.
  A layout overflow names the affected goal and fails closed.
* Keep detailed didactic coverage in separate bilingual, fingerprint-bound goal
  evidence profiles. AI output can create review candidates only; current human
  approval is required before a profile may become authoritative.
* The fast multi-AI loop is the primary early improvement engine. The public
  teacher channel is installed as a slow, moderated signal and challenge path;
  silence is not evidence and one forceful report cannot create a global rule.
* Books, evidence profiles, review bundles, and feedback links contain public
  curriculum data only. They must never contain learner state, learner IDs,
  sessions, transcripts, credentials, or private provider traces.
* Keep temporary execution capsules and dependency caches outside `curricula`.
  Committable review inputs must use exact file copies or repository-relative
  links to committable targets, never absolute local paths or ignored scratch
  targets. Check this with `curriculum_symlink_errors` in
  `scripts/validate_schemas.py` before sealing a new review package; preserve
  original evidence bytes when repairing portability.
* Serialize JSON and JSONL with actual newline characters, then parse the
  complete written files before sealing. Store raw command output as `.txt`.
  Correct historical format errors with exact-byte raw archives and additive
  valid successors; preserve scientific judgments and use normal validation.
* Runtime and Mastery integration are separate later gates. A prompt-level
  profile cannot by itself prove that a learner understood a goal.

Reference:

* `docs/concept/skill-graph/learning-goal-book-and-evidence-review-pipeline.md`

---

### 7.5 Champion trial start and completion

# Atomic Goal Visualizations

This document defines the production and integration convention for visualizing atomic learning goals in SkillPilot. Initial rollout scope: canonical `DE Gymnasium Mathematik`.

## Purpose

Atomic goal visualizations are compact didactic images that help learners
recognize the core idea of one atomic learning goal. They are not tasks,
solutions, or curriculum evidence. A visualization supports orientation in the
cockpit and, for the multilingual OpenAI V1 MCP App, in a bounded inline component in
ChatGPT. The graph goal remains the source of truth.

## Canonical JSON Format

If a learning goal has an approved or pilot visualization, the reference is stored directly on that goal in canonical `resourceLinks`.

Required fields for a goal visualization link:

```json
{
  "type": "goal-visualization",
  "resourceType": "image",
  "role": "primary",
  "skillpilotId": "<same value as goal.id>",
  "title": "Visualisierung: <goal title>",
  "url": "/assets/goal-visualizations/<subject>/<skillpilotId>/<skillpilotId>.png",
  "provider": "<generator or production provider>",
  "description": "<short caption>",
  "altText": "<screen-reader description>",
  "lang": "de",
  "license": "<asset/license note>",
  "reviewStatus": "pilot"
}
```

Rules:

- `skillpilotId` must equal the containing goal's `id`.
- Use `type: "goal-visualization"` and `resourceType: "image"`; do not introduce another top-level goal field for images.
- The public `url` must be root-relative under `/assets/goal-visualizations/...` so the cockpit can render it locally.
- The image filename must be the SkillPilot ID plus extension: `<skillpilotId>.<ext>`. Keep language in the link metadata (`lang`), not in the filename. This keeps copied assets self-identifying without exceeding Windows path limits.
- The multilingual OpenAI V1 adapter may expose a visualization only for the active
  atomic goal and only when the canonical link has `type:
  "goal-visualization"`, `resourceType: "image"`, and a `skillpilotId` matching
  that goal. Other AI integrations continue to use a normal cockpit deep link
  unless they define and review an equivalent safe UI projection.
- A goal may have multiple visualization links, but at most one `role: "primary"` per language should be visible in ordinary learner views.
- `reviewStatus: "pilot"` is allowed for integration pilots. Broad rollout should use reviewed assets only.

## OpenAI MCP UI Delivery

The still-unpublished `SkillPilot Coach v1` draft `1.0.0` contains one
read-only MCP UI resource:

```text
ui://skillpilot/coach/v1/sha256-c890cf271307d815256450a2b20b27d57015a84e9f4e39c97532eaefc4e30c26/goal-visualization.html
```

This is the active URI for new messages. The previously advertised draft URI

```text
ui://skillpilot/coach/v1/sha256-157aab83e83d6fcf208c4a1ae138c020aa4f117e9b990ba78d029b570fb9644c/goal-visualization.html
```

remains readable with its exact historical bytes for existing browser and
native-app chats. Only the dedicated read-only
`render_skillpilot_goal_visualization` tool
references this resource. It is offered only when the learner preference is
enabled and the current context contains a safe visualization projection;
ordinary context reads and state mutations carry no UI resource metadata and
therefore create no empty component. The renderer's `structuredContent`
contains the following projection:

```json
{
  "goalVisualization": {
    "goalId": "<active atomic goal ID>",
    "title": "<goal title>",
    "description": "<optional goal description>",
    "imageUrl": "https://skillpilot.com/assets/goal-visualizations/...",
    "altText": "<accessible image description>",
    "cockpitUrl": "https://skillpilot.com/?l=<curriculumId>&goal=<goalId>"
  }
}
```

The projection and component obey these constraints:

- the learner's default-on `showGoalVisualizationsInChat` preference must not
  be disabled;
- the active goal must be atomic;
- its canonical visualization link must match the same goal ID and resolve to a
  safe public SkillPilot image URL;
- the safe projection may retain goal metadata for validation and future
  compatibility, but the UI renders only the image. Its `altText` stays on the
  `img` element; title, description, goal ID, and cockpit link are not visibly
  rendered. The component performs no learning-state mutation;
- a missing, malformed, or mismatched image omits the renderer. A valid image
  stays hidden while it loads and becomes visible only after a successful
  `load` event. A bounded bootstrap deadline also covers hosts that mount the
  resource but never deliver a structured result. A missing payload, concrete
  load error, or bounded load timeout hides the component, requests teardown
  without waiting for the MCP Apps handshake, and leaves the ordinary ChatGPT
  response unchanged;
- optional host platform and user-agent values do not decide whether the
  component is shown. Browser, desktop, and native mobile hosts get the same
  surface-neutral image-load attempt; actual load success, not a guessed host
  class, decides whether the image becomes visible;
- teardown is a host-mediated request, not a promise that the host removes its
  container. If a host never executes or initializes the MCP view, neither the
  backend nor the widget can suppress a placeholder already created by that
  host;
- every content-addressed URI advertised to a client is retained with its exact
  bytes, even during draft testing. Tool metadata references only the active
  URI, while historical chats can continue to read older immutable resources;
- the image is orientation only. It is not evidence, a task, a solution, an
  assessment, or a mastery signal, and the model must not invent unreadable
  image details.

Because `1.0.0` has not been published in the OpenAI portal, this component is
part of the same mutable release draft and does not cause a version increment.
After publication, its resource URI and bundled content become immutable under
the V1 release rules.

Learners can change the preference in the cockpit under **Mein Lehrplan →
Lerneinstellungen → Lernzielbilder im Chat anzeigen**. The persisted setting is
learner-scoped, defaults to `true`, and is updated through the existing partial
preferences endpoint. The backend preference applies across devices and chat
sessions; it does not promise UI availability or cross-device UI rehydration on
every ChatGPT surface. Requests that omit the field preserve its current value.

## Asset Layout

For each approved or pilot image, keep a traceable source directory:

```text
curricula/DE/Gymnasium/visualizations/mathematik/<skillpilotId>/
  <skillpilotId>.png
  prompt.de.md
  image-reconstruction-prompt.de.md
```

`prompt.de.md` records the original provider prompt. `image-reconstruction-prompt.de.md` records a standalone alternative prompt derived from the generated image itself; the QA workbench can use it as an alternate correction base when the human review identifies an error. If this file is missing for an older image, the local QA workbench can generate it on demand from the image only.

Public runtime copies live under:

```text
app/public/assets/goal-visualizations/mathematik/<skillpilotId>/<skillpilotId>.png
backend/src/main/resources/static/assets/goal-visualizations/mathematik/<skillpilotId>/<skillpilotId>.png
```

`npm run deploy:assets` runs `scripts/deploy_goal_visualizations.ts` and copies approved visualization assets from the curriculum source directory into both `app/public/assets/goal-visualizations` and `backend/src/main/resources/static/assets/goal-visualizations`. The Vite production build also writes public assets to `backend/src/main/resources/static`, but the explicit backend copy keeps local static-asset checks consistent before a full frontend build.

Reference pools of example tasks or image inspirations may be kept locally under `tmp/`, but must not be committed if licensing is unclear. They must never be copied into final assets.

## Production Pipeline

1. Select an atomic goal and record its SkillPilot ID, title, description, phase, and intended learner audience.
2. Draft a compact image prompt from the goal itself. The prompt may add concrete representations, but must not add extra curriculum content beyond the goal.
3. Generate several candidates with the chosen image provider.
4. Review candidates against the quality checklist below.
5. Store the selected asset and prompt metadata under `curricula/.../visualizations/...`.
6. Add the optional `resourceLinks` entry to the canonical goal JSON.
7. Copy or deploy the public asset into `app/public/assets/...` and backend static assets.
8. Validate graph JSON, cockpit rendering, the image-only OpenAI MCP inline
   component, and normal cockpit deep-link behavior outside that component.

## Automated Nano Banana Pro Workflow

Preferred automated workflow:

```bash
GEMINI_API_KEY="<key>" npm --prefix app run visualization:generate:nano-banana -- "<goal-id-or-unique-title-fragment>"
```

The command:

- resolves the goal from the canonical math landscape,
- builds the provider prompt from the goal title and description, without sending the SkillPilot ID to the image model,
- keeps provider-facing prompt constraints neutral where possible, for example `no technical IDs` instead of naming SkillPilot,
- calls the Gemini image API with model `gemini-3-pro-image`,
- saves a traceable generated candidate under `tmp/goal-visualizations/<skillpilotId>/generated/`,
- asks Gemini to derive a standalone image-reconstruction prompt for the generated candidate and stores it beside the candidate,
- imports the selected image into the canonical visualization asset layout,
- copies the selected candidate's reconstruction prompt to `image-reconstruction-prompt.de.md`,
- updates the canonical goal's primary `goal-visualization` link.

Use this first as a no-network rehearsal:

```bash
npm --prefix app run visualization:generate:nano-banana -- "<goal-id-or-unique-title-fragment>" --dry-run
```

Configuration options:

```bash
npm --prefix app run visualization:generate:nano-banana -- \
  "<skillpilotId>" \
  --aspect-ratio="16:9" \
  --image-size="2K" \
  --mime-type="image/jpeg" \
  --prompt-append="Keine langen Formeln; Text sehr kurz halten." \
  --review-status="pilot"
```

For longer or carefully reviewed instructions, prefer a prompt append file over a long shell argument:

```bash
npm --prefix app run visualization:generate:nano-banana -- \
  "<skillpilotId>" \
  --prompt-append-file="tmp/goal-visualization-prompts/<skillpilotId>.md"
```

Use `--skip-reconstruction-prompt` only for explicit debugging; normal generated assets should keep the reconstruction prompt so `/goal-visualization-qa` can offer it as a correction base. The QA workbench also has an on-demand action to create a missing reconstruction prompt for an already imported image.

For older imported images, generate missing reconstruction prompts in controlled batches from the active canonical primary links:

```bash
npm --prefix app run visualization:generate-reconstruction-prompts -- \
  --subject=mathematik \
  --limit=25 \
  --continue-on-error
```

Run with `--dry-run` first to inspect the planned images. The script reads active primary links from the canonical landscapes under `curricula/DE/Gymnasium/canonical/`, including linked context or memory images outside the ordinary-atomic QA scope. It validates the exact `<subject>/<goalId>/<goalId>.<ext>` path shape, skips existing prompts by default, writes `image-reconstruction-prompt.de.md` beside the canonical source image, and stores provider response traces under `tmp/`.

The API key must come from `GEMINI_API_KEY` or `GOOGLE_API_KEY`. The generator also reads these variables from a local, ignored `.env.local` or `app/.env.local` file:

```text
GEMINI_API_KEY=<key>
```

Do not commit keys or generated provider scratch files. The `tmp/` directory is intentionally ignored by Git.

Small batch generation uses the same single-goal pipeline:

```bash
npm --prefix app run visualization:plan-batch -- --count=10

npm --prefix app run visualization:generate:nano-banana:batch -- \
  --file tmp/goal-visualization-next-batch.txt \
  --continue-on-error
```

Batch options:

- `visualization:plan-batch -- --count=<n>` writes the next unvisualized atomic goals to `tmp/goal-visualization-next-batch.txt`.
- `visualization:plan-batch -- --phase=J5 --count=<n>` restricts planning to one phase if phase metadata is available.
- `visualization:plan-batch` skips goals marked `deferred_provider_limitation` in the review ledgers. Use `--include-deferred` only for an explicit retry.
- `--dry-run` creates the prompt and request packages for all goals without API calls.
- `--no-import` saves generated images under `tmp/.../generated/` but does not update canonical JSON.
- `--continue-on-error` continues after a failed goal and reports failures at the end.
- Temporary provider quota or rate-limit errors such as Gemini `429` stop the batch even with `--continue-on-error`, so remaining goals are not requested until quota is available again.
- On a temporary provider failure, the batch command writes a resume file containing the failed goal plus all not-yet-started goals. With `--file tmp/goal-visualization-batch-036.txt`, the default resume file is `tmp/goal-visualization-batch-036.resume.txt`; override this with `--resume-file <path>` if needed.
- Re-running a generated resume file is idempotent: `--file tmp/goal-visualization-batch-036.resume.txt` reuses that same resume file on another temporary provider failure instead of creating `*.resume.resume.txt`.
- `--prompt-append-file <path>` applies one shared prompt append file to every goal in the batch.
- `--prompt-append-dir <path>` lets the batch use per-goal prompt append files named `<skillpilotId>.md`, `<skillpilotId>.txt`, `<skillpilotId>.prompt.md`, or `<skillpilotId>.prompt.txt`. A per-goal file takes precedence over a shared `--prompt-append-file`.
- `--file <path>` reads one goal ID or unique title fragment per line; `#` starts a comment.

Before a prepared batch is sent to the provider, check the prompt append directory:

```bash
npm --prefix app run visualization:check-prompt-appends -- \
  --file tmp/goal-visualization-batch-036.txt \
  --prompt-append-dir tmp/goal-visualization-prompt-appends/batch-036
```

The check verifies that each batch goal has a prompt append file, the files contain explicit required/avoidance sections, and the final provider prompts do not contain concrete goal IDs or the string `SkillPilot`.

Every production batch must be visually reviewed before it is considered more than a technical import. Store the review note under:

```text
curricula/DE/Gymnasium/quality/goal-visualization-review/
```

The review note must record accepted assets, rejected/regenerated assets, visible mathematical issues, and validation checks. Keep `reviewStatus: "pilot"` in canonical JSON until the asset has passed the intended release review.

The subject QA ledgers can additionally record an explicit AI review. `aiApproved: "yes"` is valid only when `aiApprovedAssetSha256` exactly matches the record's current `assetSha256`; replacing the image therefore invalidates the AI approval. `aiReviewedAt`, `aiReviewer`, and `aiNotes` describe that hash-bound review. The older `umlautsCorrectChatGpt` and `contentApprovedChatGpt` fields remain available as triage and compatibility data and are not promoted automatically. AI approval is useful technical and subject-matter review evidence, but it never replaces `humanApproved` as the `M7` or release gate.

## Low-Friction Manual Provider Workflow

When using a manual image provider such as Nano Banana Pro, do not hand-build filenames, folders, or JSON links.
Use the helper scripts:

```bash
npm --prefix app run visualization:prepare -- "<goal-id-or-unique-title-fragment>"
```

This writes a prompt package to:

```text
tmp/goal-visualizations/<skillpilotId>/nano-banana-prompt.de.md
tmp/goal-visualizations/<skillpilotId>/metadata.json
```

Copy the prompt text into the image provider, generate the image, download the selected candidate, then import it:

```bash
npm --prefix app run visualization:import -- "<skillpilotId>" "<downloaded-image-path>"
```

The import script:

- resolves the goal from the canonical math landscape,
- renames the image to `<skillpilotId>.<ext>`,
- copies it to `curricula/DE/Gymnasium/visualizations/...`,
- copies the runtime asset to `app/public/assets/goal-visualizations/...`,
- writes or refreshes `prompt.de.md`,
- writes `image-reconstruction-prompt.de.md` when a sibling reconstruction prompt or `--reconstruction-prompt` input exists; otherwise it removes any stale reconstruction prompt for that asset,
- adds or replaces the primary `goal-visualization` link on the goal.

Optional overrides:

```bash
npm --prefix app run visualization:import -- \
  "<skillpilotId>" \
  "<downloaded-image-path>" \
  --reconstruction-prompt="<standalone-image-prompt.md>" \
  --alt-text="<specific screen-reader description>" \
  --description="<short caption>" \
  --review-status="pilot"
```

Use `--dry-run` to inspect the planned paths and JSON URL before writing files.

## Quality Checklist

- The image addresses exactly one atomic goal.
- Mathematical notation is correct and not misleading.
- The image has no copied third-party worksheet, logo, character, or protected layout.
- The context is plausible and age-appropriate for the goal.
- Text is readable at cockpit card width and does not dominate the image.
- The image works in the cockpit goal card and, where the multilingual OpenAI MCP UI
  is enabled, as the sole visible content of the inline ChatGPT card. The
  cockpit deep link remains available outside the MCP UI component.
- The visual does not replace the need for explanation, practice, or assessment.
- `altText` is specific enough for non-visual use.
- `skillpilotId`, `url`, `provider`, `lang`, `license`, and `reviewStatus` are present.
- The `url` filename is the same `skillpilotId` plus image extension.

## Hard Review Gate

Generated images are useful but not trustworthy by default. A generated asset is only a technical import until it has been visually reviewed against the checklist. The review must be recorded in the batch ledger before the asset may be treated as curated pilot content.

Mandatory rejection or regeneration triggers:

- wrong calculation, wrong formula, wrong comparison, or wrong unit conversion
- misleading mathematical representation, even if the text is correct
- mismatched labels and drawings, for example marked digits, angle sizes, coordinates, number-line positions, or side properties
- invalid or ambiguous notation that could teach a misconception
- extra topics that distract from or distort the atomic goal
- unreadable or dominant text, especially when the image is shown at cockpit card width
- visible technical IDs, watermarks, provider artifacts, or copied third-party layout
- target-age mismatch, such as concepts clearly above the current year level

Review decisions should use these labels:

- `accepted_pilot` - no gross mathematical issue is visible; suitable for controlled pilot use
- `accepted_pilot_after_regeneration` - at least one generated attempt was rejected and replaced
- `rejected_regenerate` - current image must not be used; generate a targeted replacement
- `deferred_provider_limitation` - repeated provider attempts stayed fachlich wrong; remove the `resourceLinks` image reference and revisit when the provider improves
- `needs_external_review` - no obvious blocker, but the image is too subtle or high-risk for self-review only

If repeated Nano Banana Pro attempts still contain a gross mathematical or tool-use error, do not substitute a hand-drawn SVG or other non-provider replacement for the same cartoon visualization lane. Remove the active image link, remove the published asset copies, and record the deferred decision in the review ledger.

Keep `reviewStatus: "pilot"` until the intended release review has passed. Do not infer approval from the existence of a generated file, a public asset, or a `resourceLinks` entry.

## Pilot

Pilot goal:

- SkillPilot ID: `502ecaa7-cca6-5c51-a1cc-da09a7b2382c`
- Title: `Definitionsmenge einer Funktion bestimmen`
- Public asset: `/assets/goal-visualizations/mathematik/502ecaa7-cca6-5c51-a1cc-da09a7b2382c/502ecaa7-cca6-5c51-a1cc-da09a7b2382c.png`

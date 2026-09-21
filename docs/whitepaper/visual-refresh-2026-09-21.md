# Whitepaper visual refresh — 21 September 2026

## Editorial image decisions

- Lead with `learning-house.png`: mobile guided learning and prerequisite-based
  progress as a solid house, requested by the Product Owner. Its shared text-free
  illustration serves both languages; the caption explains the current Claude
  Mathematics/Physics upper-secondary scope. The phone is an illustrative coach
  metaphor, not a fabricated product screenshot or a claim of automatic mastery.
  Its exact prompt, provider, hash and review are in `learning-house.provenance.json`.
- Keep the original introductory and Champion comics. Place the original intro
  in section 1 beside the shared-curriculum/different-starting-points explanation.
- Add `learning-moment.png` in both languages: a text-free, friendly learning
  story showing a starting sketch, an initial attempt, and a completed explanation.
  The flat notebook faces the student; only the raised notebook faces the audience.
  It is an AI-generated illustration, not observed learner evidence or a product UI.
  The final prompts, provider, byte hash and visual review are recorded in
  `learning-moment.provenance.json`. Rejected drafts are not publication assets.
- Keep the Cockpit as implementation evidence. Put the recall-status and route
  figures in the technical-detail appendix, linked from their explanations,
  rather than interrupting the main visual story. Remove obsolete ChatGPT coach/handoff screenshots and inaccurate older
  architecture/coach diagrams from the narrative, not from the historical assets.
- Leave the long configuration-form capture out of the opening; show the actual
  two-subject planning component instead of the generic planning schematic in 3.4.
- Retain the content-selection/material captures as technical documentation.
  Section 5.2 now focuses on the strategic direction and its narrative illustration,
  rather than on short-lived details of the PoC interface.
- All displayed figures can be opened at original size in the WebGUI, including
  on small screens. Existing artwork is retained; no original cartoon is overwritten.
- A single italic AI-generation notice appears beside Version/Project in the
  document header: “Ein Teil der Illustrationen ist KI-generiert.” /
  “Some illustrations are AI-generated.” It replaces repeated per-image labels
  in both languages and the PDF. Keep provenance out of narrative captions;
  documentary UI screenshots are not labelled as AI-generated. Asset-level
  provenance and generation metadata remain available in their own records.

## Six-station visual story

The main illustrations now follow the same sequence in both full Whitepapers
and the short `storyboard.de.md` / `storyboard.en.md` picture-reading editions:

1. **Build on solid knowledge:** `learning-house.png` opens with mobile learning,
   personal effort and prerequisite-based progress.
2. **Shared curriculum, personal path:** retain the original introductory comic;
   typeset lead and caption carry the message even when its embedded copy is small.
3. **Think, get help, explain:** `learning-moment.png` keeps the learner's own
   work at the emotional center.
4. **Progress stays connected:** new `learning-core.png` separates the phone
   coach from the stable SkillPilot curriculum/progress/plan board. The connecting
   tokens stand for structured state exchange, not storage of complete dialogues.
5. **One goal, different materials:** new `learning-materials.png` visualizes
   book, explanation and exercise choices around one goal. The **in-development
   vision** label precedes the image. The text describes teacher/learner selection,
   providers connecting materials to goals and plans, and the starting point with
   Physik Libre. Fast-changing pilot details stay in the technical documentation.
6. **Improve it together:** the existing Champion comic closes the story, followed
   by goal-linked feedback and the free SkillPilot / paid Claude Pro beta invitation.

`learning-core.provenance.json` and `learning-materials.provenance.json` record
exact generation/edit prompts, tool, selected output IDs, hashes and review.
Both are built-in image-generation PNGs, copied unchanged with their metadata.
The material draft was corrected before use: flat notebook/book drawings now
face the learner, unlike the audience-facing conceptual material cards.

The localized reading-view selector keeps full text as the default and offers
**Die Geschichte in Bildern / The story in pictures** at `?view=story`.
Both editions retain one italic header disclosure and original-size image links.
The short edition contains the six narrative figures only; the full version adds
real UI captures and technical detail. No existing cartoon was overwritten.

Read-only independent AI review checked the six actual images and DE/EN copy
for story continuity, learner agency, paper orientation and current/vision
distinctions. This is editorial review, **not** a human comprehension study or
evidence of educational effectiveness.

### Local publication checks

- Actual DE/EN pages in both reading views at 375px and 1280px: six story
  figures / ten full-text figures load, no horizontal overflow or page errors,
  one italic header disclosure, and links to the original images.
- UI regression tests: reading mode, language changes, late fetch responses,
  retained query/hash state, keyboard access and existing media playback.
- TypeScript, scoped ESLint, Markdown links, documentation indexes and the
  AI-transparency inventory pass. Four illustration provenance hashes match
  source and runtime PNGs byte-for-byte; original comics remain unchanged.
- German full PDF regenerated and rendered for inspection. Overlong
  German expressions were rephrased without changing their meaning; a text-box
  check confirms that no words reach the outer 40pt page margins.
- Publication copies are synchronized locally. These checks are not a production
  deployment, native-mobile acceptance, or a test with actual readers.

## UI capture scope

The bilingual captures below show current application components rendered locally
with explicit synthetic example data. They are **illustrative UI captures**, not
screenshots of a real learner, backend integration tests, production evidence or
Claude/ChatGPT host acceptance.

## Reproduce

Start the application Vite server on loopback, then run:

```bash
npm --prefix app run dev -- --host 127.0.0.1 --port 4183 --strictPort
WHITEPAPER_CAPTURE_BASE_URL=http://127.0.0.1:4183 app/node_modules/.bin/tsx app/scripts/captureWhitepaperUi.ts
```

The capture harness is `app/scripts/captureWhitepaperUi.ts`; its page and React
fixture are `app/scripts/fixtures/whitepaperUiCapture.{html,tsx}`. Each image is
captured at an 800 CSS-pixel viewport width and device scale factor 2, with the
application's real fonts, styles and German or English language context.

## Learning plan

`learning-plan-ui.de.png` and `learning-plan-ui.en.png` render the production
`LearnerPlanTodayOverview` and its child components. No application component or
native control is restyled or replaced for the capture. Action callbacks are
deliberately inert: the fixture cannot continue or switch an actual learner's
session. Plan details can still expand using the component's native controls.

The synthetic state matches the Whitepaper's illustrative table:

| Subject | Scheduled through today | Achieved in total | Today | Separate balance |
| --- | ---: | ---: | --- | --- |
| Mathematics | 13 | 9 | 1 of 3 | 2 learning goals behind |
| Physics | 10 | 11 | 2 of 2 | 1 learning goal ahead |

As in the current backend formatter, a fulfilled daily target is labelled
“Tagesziel erreicht” / “Daily target reached”, not a newly invented numeric label.
The current goal remains “Lineare Gleichungen lösen” / “Solve linear equations”.
Both continuing mathematics and switching to physics remain enabled. The capture
asserts the exact localized status, direction, active goal and enabled actions;
it does not independently recompute the backend's plan balance. No learner API
request is permitted for these planning captures.

## Optional content

The capture described below predates the Product Owner's access-model
clarification later on 21 September 2026. Its credential-field and default-off
observations are historical capture evidence, not the current UI contract.
Material selection now uses the ordinary Cockpit profile access without a
separate credential; content support defaults to on while package selection
remains explicit. See the [current PoC runbook](../dev/content-integration-poc.md).

`content-materials-ui.de.png` and `content-materials-ui.en.png` render the production
`MaterialSelectionPanel` and `GoalAdditionalMaterials`. The fixture reads the real
public package metadata from `content/physik-libre/1.0.0/package.json`. Its current
four material links map to four Physics goals; **only the one material bound to
goal `ae67bcf1-f3ee-50d6-9a12-25a159dff659` is shown** below the package selection.
The German title of that external resource remains German in the English UI,
accurately reflecting the available material language.

Only the synthetic profile `whitepaper-demo` exists in the fixture. The two
permitted read requests (content selection and goal materials) are intercepted
and fulfilled locally. All other learner API requests, every API write, and
external network requests are blocked. The configuration credential field stays
empty; no real profile ID, grant, session, learning progress or chat is accessed.
The external link is displayed but never opened by the capture.

The example shows an opted-in package as an illustration of the implemented PoC;
it does **not** imply that optional content is enabled by default or in production,
that all Physics goals have material, or that a provider partnership exists.
See the [content PoC runbook](../dev/content-integration-poc.md) for real activation,
authorization and outstanding host acceptance requirements.

## Checks performed by the capture

- Exact German/English planning status and active-goal assertions.
- The real four-link package inventory and exact one-goal material binding.
- Only the expected synthetic reads, no private API or external requests.
- Empty configuration credential field, no page errors and no horizontal overflow.
- PNG output paths, SHA-256 digests and CSS dimensions reported by the script.

These checks validate the rendered fixture and image provenance. They are not a
replacement for ordinary application, backend, privacy or provider-host tests.

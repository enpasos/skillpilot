# Browser Demo Video

`@skillpilot/browser-demo-video` turns a declarative browser scenario into a
reviewable MP4 in one command:

```text
YAML -> Playwright Chromium -> redacted WebM + timeline + screenshots
     -> scripted or OpenAI structured narration -> cached TTS WAV segments
     -> SRT subtitles -> FFmpeg H.264/AAC Web MP4
     -> optional reviewed native iOS/Android clips -> labeled final MP4
     -> provenance manifest
```

The package is part of the Apache-2.0 SkillPilot repository, but the pipeline is
application-independent. Its path handling and process boundary are designed
for Linux, macOS, and Windows wherever Node.js 20+, Playwright Chromium,
FFmpeg, and ffprobe are available. CI currently executes the complete Chromium
path on Linux; macOS and Windows need platform validation before claiming
equivalent release support.

## Quick start

```bash
cd tools/demo-video
npm ci
npx playwright install chromium

export OPENAI_API_KEY='...'
export DEMO_VIDEO_FIXTURE_SECRET='DEMO_SECRET_example'
npm run demo -- build --scenario scenarios/example.yaml
```

The final command performs every stage. Intermediate stages are also callable:

```bash
npm run demo -- validate --scenario scenarios/example.yaml
npm run demo -- doctor   --scenario scenarios/example.yaml
npm run demo -- record   --scenario scenarios/example.yaml
npm run demo -- verify-recording --scenario scenarios/example.yaml
npm run demo -- narrate  --scenario scenarios/example.yaml
npm run demo -- tts      --scenario scenarios/example.yaml
npm run demo -- render   --scenario scenarios/example.yaml
```

For a reviewed German script, use `narration.mode: scripted`, provide German
`scriptedNarration` for every chapter, and configure:

```yaml
narration:
  mode: scripted
  instructions: Sprich natürliches Deutsch, freundlich und klar, ohne Werbestimme.
  disclosure: Die Sprecherstimme in diesem Video ist KI-generiert und keine menschliche Stimme.
```

By default, the first spoken segment and its subtitles include the exact
English or German disclosure. English remains the default, including for the
existing OpenAI review scenario. Scripted narration needs no narration-model
request. The public Quickstart explicitly uses `disclosureMode: visual-only`
and a localized `visualDisclosure`: `KI-generierte Sprecherstimme` for German,
`AI-generated voice` for English. The renderer burns this short notice into
the first eight seconds even when captions are disabled,
without speaking it or including it in the narration captions. This does not
change the default or the historical review scenario.

### Claude-first public Quickstart

The learner Quickstart has its own entry point, separate from the historical
OpenAI review. The current production workflow imports four separately captured,
privacy-reviewed Claude browser installation clips and records their complete
local playback alongside the current first-party UI in a fresh browser. Other
guidance remains explicitly labelled. The builder performs no provider login or
Claude account operation and establishes no complete learning-flow/native-app
acceptance. Omitting `--host-clips` preserves the older instruction-card mode;
that mode does not satisfy the current real-installation recording request.

The `/quickstart/de` and `/quickstart/en` pages have separate video, poster,
narration and caption assets. The English page never falls back to the German
video. Both use genuine installation footage recorded in the corresponding
Claude interface language; English is not dubbed over German menus.

**German captured state, 13 September 2026:** the four real installation chapters were
recorded in the user's already signed-in Windows Firefox. The scoped preparation
removed only the SkillPilot marketplace/plugin and disconnected its connector;
the recorded flow then re-added the public repository with automatic sync on,
installed and enabled SkillPilot **1.1.5**, and showed connector status
**Verbunden**. Other account content stayed unchanged. Firefox page zoom was
restored to its prior **70%** setting. The separate screen recorder uses browser
crops; this is web footage, not native Claude-app footage or a fresh-account test.

All 101 stored source frames were visually reviewed. Raw recordings remain
private; the transient personal Claude-home view and its preceding blank frames
were excluded before encoding the reviewed derivatives. Only static operator
inspection holds were shortened; retained actions and loading remain at 1×.
The four clip hashes and private edit decisions bind this review to the imported
files. Every future take needs the same full-frame privacy review.

The unchanged German combined build and content-addressed export run **292.628 seconds**
(4:53), with one disposable SkillPilot learner deleted after capture. Visual QA
covered all 25 recording screenshots and 22 sampled final-video frames, including
all 16 chapter endings, privacy cuts, masks and the voice disclosure. Its 16
Gemini `Sulafat` narration segments were checked technically and through blind
audio transcription/quality assessment by Gemini; they were **not directly
listened to by the assistant**. Two uncertain transcription details remain for
a human listening pass. This is a local tutorial build, not deployment,
learning-tool/native-app acceptance, or a fresh-account test. Earlier card-video
artifacts and cleanup evidence remain separate.

**English captured state, 13 September 2026:** four new Claude Web clips show
the actual English menus, **Sync automatically** enabled, installation of
**SkillPilot Coach v1 1.1.5**, and the **Connected** connector status. All 48
stored source frames were reviewed; private OAuth transition content and the
brief German metadata view were excluded by ordinary timeline cuts, without
pixel translation or fabricated UI. The retained actions play at original speed.
The first-party recording uses the English SkillPilot interface and
**MIT OpenCourseWare Foundations** as its English-language curriculum example.
That chapter uses a declared, static camera close-up of the actual curriculum
selector; source pixels and actions remain unchanged, with the crop bounds and
source/output timing recorded in public provenance.
Its one disposable learner was deleted through the capture cleanup gate.
The final English build and content-addressed export run **260.102 seconds
(4:20), 1920 × 1080**, with 16 English narration segments and
English captions. All 16 narration WAV hashes match the technically and
model-reviewed English audio. Direct listening by the assistant remains
unavailable. Final visual QA passed all 25 recording screenshots and 29 sampled
rendered frames, including the corrected camera framing and chapter holds.
The separate English export is bound locally; this is not a production deployment.
Both languages passed actual desktop/mobile playback, seeking, HTTP range delivery,
caption-language and in-page language-switch checks; the English pages were also
visually checked at 390 px and 1280 px width.

The mobile/photo/voice chapters are labelled guidance cards in both languages,
not footage or acceptance evidence from the native Claude mobile app. Neither
language's installation footage establishes a fresh-account or complete
learning-tool acceptance test.

```bash
cd tools/demo-video
npx tsx src/quickstart-build.ts --scenario scenarios/skillpilot-claude-quickstart.de.yaml --host-clips /absolute/private/claude-clips.json --record-only
npx tsx src/quickstart-build.ts --scenario scenarios/skillpilot-claude-quickstart.de.yaml --host-clips /absolute/private/claude-clips.json --reuse-recording

# English has its own scenario and explicitly English host clips:
npx tsx src/quickstart-build.ts --scenario scenarios/skillpilot-claude-quickstart.en.yaml --host-clips /absolute/private/claude-clips-en.json --record-only
npx tsx src/quickstart-build.ts --scenario scenarios/skillpilot-claude-quickstart.en.yaml --host-clips /absolute/private/claude-clips-en.json --reuse-recording
```

Omit `--reuse-recording` for a fresh complete recording. `--record-only` performs
browser actions but makes no narration/TTS API call. Supply the same reviewed
host-clip manifest for recording and reuse; an older card recording cannot be
relabeled as real Claude footage.

A successful capture also writes private `capture-cleanup.json`, binding its
observed learner deletions to the exact recording, timeline, recording metadata,
scenario, HTML/screenshot instruction assets, and any imported host-clip/player
bytes. `--reuse-recording` requires
that proof and revalidates all recording/privacy hashes before using the cache.
Changed cards or an older recording without this proof require a fresh capture.
The manifest's `disposableLearnersDeleted` is the count proved for that capture;
`cleanupPerformedThisRun` separately records deletions performed by the current
process. Reusing a cleaned recording therefore correctly reports zero new
deletions without losing the original cleanup evidence. A later TTS/render
failure may retain this completed capture proof, but never a complete video
manifest.

The German artifact uses **Gemini 3.1 Flash TTS Preview, voice Sulafat**;
the English artifact uses **Gemini 2.5 Flash Preview TTS, voice Sulafat**.
Each scenario provides its own language directions for calm, warm delivery and
continuous phrases, and each manifest records the actual model and voice. The
Quickstart wrapper selects `GeminiSpeechClient` when `narration.ttsModel` starts
with `gemini-`. It sends only the scripted public narration and voice direction
to Google's `generateContent` endpoint. It does not send browser evidence,
learner state, screenshots, credentials, or any learning chat to Gemini.

For Gemini, the wrapper checks `GEMINI_API_KEY`, then `GOOGLE_API_KEY`; for each
name it checks the existing process environment and the repository's known
`.env.local` and `app/.env.local` files. No shell sourcing or environment
mutation occurs. Alternatively, `--secrets <private-file.json>` accepts a
private JSON file with `schemaVersion: 1` and `geminiApiKey`. Never commit keys
or pass them as command arguments. With an OpenAI TTS model, the wrapper still
reads only `openAiApiKey` from private `secrets/skillpilot-review.json` or the
explicit secrets file. It ignores unrelated review browser/clip fields.
Keys are passed to the respective client only in memory.

Gemini's 24 kHz mono PCM gets a WAV header without tempo or pitch changes.
The cache and manifest retain the actual Gemini model and voice, so these WAVs
cannot collide with the previous OpenAI narration. Preview model output is not
assumed byte-reproducible: keep the generated, content-addressed audio cache.
The public export preserves natural timing; the script determines the duration,
not an `atempo` speed-up to force exactly five minutes. Review the actual audio
for pronunciation, omissions and sentence endings before publication.

`QUICKSTART_DEMO_ID_PASSWORD` is generated afresh in memory for protected
demonstration export inputs; it is not an operator secret.

Scenario `goto` URLs `quickstart-card:intro`, `:marketplace`, `:repository`,
`:install`, `:connect`, `:mobile`, `:finish`, and `:start` resolve to the matching
fragment of the language-specific local `assets/quickstart/cards.html` or
`cards.en.html`. The Claude walkthrough first
requires Claude Pro, then adds `enpasos/skillpilot-claude-marketplace` through
Settings → Plugins → Add marketplace → Add from a repository, keeps automatic
synchronization enabled, and installs SkillPilot from that marketplace. It does
not instruct learners to download a plugin archive. The German card-only
fallback frames the supplied Claude screenshot into readable steps; English
cards do not load that German reference image. The screenshot is not a fabricated
recording of a successful connection. The German card-only completion manifest binds both the HTML card and
`assets/quickstart/claude-marketplace.png` digests and states that no actual
Claude-host recording is included.

The source screenshot contains account information outside the framed regions.
Keep `assets/quickstart/claude-marketplace.png` private and untracked; it is not
a deployable web asset. To reproduce the marketplace chapters, place the
approved source screenshot at that exact local path. Those chapters fail clearly
if it is missing. Other scenarios and CI fixtures do not need this private
image and record a null screenshot digest. Only the reviewed, framed video
output is eligible for publication.

#### Optional: import real Claude browser installation clips

This is an import path, not a recorder or a Claude account/login workflow.
After separately recording and privacy-reviewing the actual installation,
`--host-clips <private-manifest.json>` replaces only the `marketplace`,
`repository`, `plugin-install`, and `plugin-connect` chapter steps. Their
narration and all first-party steps stay unchanged. Without the option, the
existing instruction-card path stays unchanged.

The private JSON manifest must contain exactly those four chapter IDs once:

```json
{
  "schemaVersion": 1,
  "language": "en",
  "clips": [
    {
      "chapterId": "marketplace",
      "path": "marketplace.webm",
      "sha256": "<64 lowercase hexadecimal characters>",
      "capturedAt": "2026-09-13T12:00:00Z",
      "captureMethod": "claude-browser-recording",
      "privacyReviewed": true
    }
  ]
}
```

The example shows one entry; add the three other required chapter entries.
`language` must match the scenario's `browser.locale`. English requires explicit
`"language": "en"`; omitted language remains historical German for compatibility.
The importer and exporter both reject mismatched host-clip languages.
Each chapter needs its own regular local MP4, WebM or MOV file (no URLs,
symlinks or duplicate file paths). Relative paths resolve beside the manifest.
Keep the manifest and source files owner-private (`0600` on Unix), outside
tracked/public assets. Each clip must have one video stream and last no more
than ten minutes. `privacyReviewed: true` is an explicit operator attestation:
review every frame and remove account details, chats, login/consent secrets,
personal bookmarks and other private content **before** setting it. The importer
does not discover or redact account information embedded in video pixels.

```bash
npx tsx src/quickstart-build.ts --scenario scenarios/skillpilot-claude-quickstart.de.yaml --host-clips /absolute/private/claude-clips.json --record-only
npx tsx src/quickstart-build.ts --scenario scenarios/skillpilot-claude-quickstart.de.yaml --host-clips /absolute/private/claude-clips.json --reuse-recording
```

Clips are copied into private content-addressed snapshots and replayed in a
local-only video page with original speed (`1`), muted source audio, no looping
or seeking. The next step requires verified complete playback; unsupported
codecs, seeks, speed changes and playback errors fail the capture. The normal
recording/privacy checks and disposable-learner cleanup remain in effect.
Capture cleanup evidence additionally binds the reviewed manifest, clip bytes
and player implementation; changed inputs invalidate reuse. `--cleanup-only`
deliberately ignores clip inputs so missing or invalid files cannot prevent
recovery of the private learner-cleanup ledger.

A successful complete build adds private `claude-host-clips.json` evidence and
marks the capture as real Claude **browser** recordings replayed locally.
Public export preserves the clip hashes and provenance without private paths;
it does not claim native-app coverage, OAuth/session acceptance or a complete
Claude learning-flow acceptance. Review chapter timing and the actual final
video before publishing. Importer tests use synthetic local videos and do not
constitute a real Claude installation recording.

Export each completed build separately with `quickstart-export.ts`. The exporter
derives `/media/quickstart/claude/2026-09-13/de/` or `/en/` from the validated
scenario locale and verifies its ID and localized voice notice. Bind only
completed, reviewed exports in `app/src/config/quickstartVideo.ts`; existing
content-addressed German and historical review files remain unchanged.

Official speech references:

- [Gemini speech generation and available voices](https://ai.google.dev/gemini-api/docs/speech-generation)
- [Gemini generateContent REST API](https://ai.google.dev/api/generate-content)

Only successful browser `POST /api/ui/learners` responses at the configured
first-party origin contribute new learner IDs to a private cleanup ledger.
The wrapper does not enumerate existing learners or create/preconfigure them
through an API. Every observed disposable learner is deleted through the normal
confirmed DELETE route, including after recording failures. Pending IDs are
retried before a new recording; `--cleanup-only` retries only this ledger without
opening a browser or loading the TTS key. The manifest becomes complete only
after cleanup succeeds. The run-owned lock excludes concurrent writers; after
an interrupted process, verify that no recording is still active before removing
that specific stale lock and running cleanup.

If a CREATE commits but its response is lost before an ID can be observed, the
tool cannot name that learner for synchronous deletion. The ordinary inactivity
retention applies; no successful build/cleanup claim is made for a detected
unreadable CREATE response. Review the private video, screenshots and subtitles
before publishing a new content-addressed artifact. Existing published videos
are never overwritten by this command.

The pinned Linux container provides the strongest reproducible path and works
from Docker Desktop on macOS and Windows as well:

```bash
docker build -t skillpilot-demo-video .
mkdir -p output .cache
chmod 700 output .cache
docker run --rm \
  --user "$(id -u):$(id -g)" \
  --env OPENAI_API_KEY \
  --env DEMO_VIDEO_FIXTURE_SECRET=DEMO_SECRET_example \
  --volume "$PWD/output:/workspace/tools/demo-video/output" \
  --volume "$PWD/.cache:/workspace/tools/demo-video/.cache" \
  skillpilot-demo-video build --scenario scenarios/example.yaml
```

On Linux, keep the `--user` option so bind-mounted artifacts remain owned by
the invoking account. Create the two private host directories before the first
container run; otherwise Docker creates missing bind-mount sources as
root-owned directories. Docker Desktop on macOS/Windows maps mounted files
through its VM; use the equivalent host-user mapping offered by that runtime.

Every build records the browser again by default, so a changed application
cannot silently produce an old demo. `--reuse-recording` is the explicit,
hash-verified escape hatch for editing or troubleshooting. `--refresh-ai`
discards the content-addressed narration/TTS cache. `--force` performs a fully
fresh build and cannot be combined with `--reuse-recording`.

## Reproducibility model

- npm dependencies and Playwright are pinned by `package-lock.json`.
- Browser locale, timezone, viewport, color scheme, reduced motion, delays,
  resolution, frame rate, codec settings, and FFmpeg paths live in YAML.
- OpenAI narration is structured and anchored to recorded event IDs. TTS uses
  one cached WAV per SHA-256 of text, model, voice, instructions, and speed.
- When speech would overrun the next browser action, the renderer inserts a
  bounded freeze at that event boundary and shifts later clicks accordingly.
  It fails rather than silently creating an excessive frozen shot.
- FFmpeg is invoked directly with argument arrays, strips source metadata, uses
  a fixed creation timestamp, and writes the final MP4 with an atomic
  rename-over-target on POSIX. Windows uses a documented remove-and-rename
  fallback only when its filesystem rejects replacement of an existing file.
- Optional native clips are normalized to the declared dimensions, frame rate,
  H.264/AAC profile and duration, then concatenated after the Web demo in YAML
  order. Every segment carries a burned-in label that distinguishes the
  Playwright Web recording from externally recorded native evidence.
- `manifest.json` records the public source/deployment revision, models,
  browser and media versions, redacted configuration, relative paths, and
  SHA-256 hashes for the source recording, analysis, screenshots, narration,
  WAV segments, subtitles, timeline, and final video.
- `manifest.json` is published last and acts as the completion marker. A failed
  regeneration removes the old marker, so an older MP4 cannot be mistaken for
  the current successful build.

Byte-identical video across unrelated Chromium/FFmpeg builds is not promised.
For audit-grade regeneration, use the same lockfile, Playwright browser build,
FFmpeg build, scenario, cached AI artifacts, and source application revision.

## Scenario format

The schema is versioned (`schemaVersion: 1`) and validated strictly. Unknown
fields, duplicate chapter/step IDs, malformed selectors, invalid regular
expressions, and ambiguous secret inputs fail before recording.

```yaml
schemaVersion: 1
id: my-demo
title: My product demo
sourceRevision: 0123456789abcdef
platform: web
outputDir: ../output
cacheDir: ../.cache

browser:
  baseUrl: https://example.com
  headless: true
  viewport: { width: 1440, height: 900 }
  video: { width: 1440, height: 900 }
  locale: en-US
  timezoneId: UTC
  storageState: ../secrets/browser.storage-state.json
  dialogPolicy: accept

privacy:
  maskSelectors: ["[data-private-id]"]
  maskTextSelectors: ["[data-message-author-role=user]"]
  forbiddenPatterns: ["secret_[A-Za-z0-9]+"]
  evidenceSelectors: ["main h1", "[role=status]"]
  failOnForbiddenText: true

narration:
  mode: ai
  model: gpt-5.6
  ttsModel: gpt-4o-mini-tts
  voice: cedar
  disclosure: The narration in this video is AI-generated and is not a human voice.

render:
  width: 1920
  height: 1080
  fps: 30
  burnSubtitles: true
  autoZoom: { enabled: true, factor: 1.14, durationMs: 1800 }

# Leave empty for an entirely generated Web-only demo. See the native-clip
# contract below when a review requires real iOS or Android evidence.
platformClips: []

chapters:
  - id: primary-flow
    title: Primary workflow
    narrationHint: Explain the value after the visible success state.
    steps:
      - id: open
        action: goto
        label: Open the application
        url: /
      - id: open-protected-launch
        action: goto
        label: Open a protected launch URL without serializing it
        urlFromEnv: DEMO_PROTECTED_LAUNCH_URL
      - id: fill-secret
        action: fill
        label: Use a credential without exposing it
        target: { label: API token }
        valueFromEnv: DEMO_API_TOKEN
      - id: submit
        action: click
        label: Submit the form
        target: { role: button, name: Continue }
        capture: true
      - id: verify
        action: assert
        label: Verify success
        target: { role: status }
        text: Complete
        capture: true
```

Supported actions are `goto`, `follow`, `click`, `fill`, `press`, `select`,
`check`, `hover`, `waitFor`, `wait`, `assert`, `screenshot`, `mask`, and
`unmask`. Targets may use `css`, `testId`, `label`, `text`, `placeholder`, or
`role` plus `name`. An optional `frame` CSS selector scopes the action to an
iframe. `click.samePage: true` neutralizes `_blank`/`window.open` for a
continuous single-page recording. Assertions accept a literal `text` or a
case-insensitive Unicode `textPattern`; invalid patterns fail validation.

Literal `${name}` placeholders are resolved only from the YAML `variables`
map. Variables are configuration, not a secret store. Protected input uses
`valueFromEnv`; protected launch URLs use `urlFromEnv`. Environment values are
copied into explicit in-memory interfaces, removed from child-process
environments and errors, scanned out of generated text, and never written into
the timeline, analysis, narration request, or manifest. The final SkillPilot
review flow additionally reads sensitive operator inputs from one private file
so they never enter the process's inherited environment.

### External native platform clips

`platformClips` declaratively appends already-recorded, genuine native clips to
the generated Web demo. It does not claim that Playwright captured or automated
an iOS or Android application. The list order is the final video order after
the Web segment.

```yaml
platformClips:
  - id: native-ios-core-flow
    title: Product core flow
    platform: ios
    pathFromEnv: REVIEW_IOS_CLIP
    expectedSha256FromEnv: REVIEW_IOS_CLIP_SHA256
    sourceRevisionFromEnv: REVIEW_IOS_CLIP_SOURCE_REVISION
    privacyReviewedFromEnv: REVIEW_IOS_CLIP_PRIVACY_REVIEWED
    audio: mute
  - id: native-android-core-flow
    title: Product core flow
    platform: android
    pathFromEnv: REVIEW_ANDROID_CLIP
    expectedSha256FromEnv: REVIEW_ANDROID_CLIP_SHA256
    sourceRevisionFromEnv: REVIEW_ANDROID_CLIP_SOURCE_REVISION
    privacyReviewedFromEnv: REVIEW_ANDROID_CLIP_PRIVACY_REVIEWED
    audio: mute
```

For an environment-backed clip, the path must be absolute in the execution
environment, the SHA-256 value must exactly match the reviewed file, and the
privacy-review variable must equal `true`. On POSIX, each source must be a
regular non-symlink file owned by the current user with no group/other access.
Each native source also carries its own exact lowercase 40-character deployed
Git revision; it is never silently attributed to the Web recording's revision.
The tool snapshots and re-hashes each source in a private temporary directory
before FFmpeg reads it, and deletes that snapshot after composition.

`audio: mute` is the privacy-safe default: the clip receives silent AAC audio
for deterministic concatenation. Use `preserve` only when the clip has an audio
stream and that audio was included in the privacy review. Native pixels and
preserved audio are not sent to the narration LLM; they must already be
review-ready. The manifest stores capture method, platform, source revision,
review attestation, source SHA-256 and duration, but never the source path.

## Privacy boundary

The recorder installs opaque overlays before navigation and continuously keeps
them aligned with matching elements. Secret form fields are automatically
masked before Playwright fills them. This is stronger than adding blur after
the fact: the underlying pixels never enter the recording.

Use both controls:

1. `maskSelectors` prevents sensitive pixels from being captured.
2. `maskTextSelectors` reapplies an opaque mask after client-side re-renders
   whenever an element contains forbidden text.
3. `forbiddenPatterns` prevents allow-listed DOM evidence from being sent to an
   LLM or written into analysis artifacts.

Keep evidence selectors narrow. Do not capture network traces, browser storage,
provider credentials, authorization codes, tokens, or unredacted query strings.
Cross-origin iframe contents require a mask on the iframe rectangle unless a
reviewed frame-specific selector is available.

## OpenAI integration

AI narration uses the Responses API with Zod Structured Outputs and may attach
only the already-redacted evidence screenshots selected by the scenario. Speech
uses `gpt-4o-mini-tts`, WAV output, and a configurable voice; `cedar` is the
default. The default `spoken-and-visual` mode includes the clear AI-voice
disclosure in the first spoken/subtitle segment. The explicitly configured
public Quickstart uses the visible-only disclosure described above.

References:

- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Text to speech](https://developers.openai.com/api/docs/guides/text-to-speech)

## SkillPilot OpenAI review demo

OpenAI's final MCP-backed submission contract requires a demo-recording URL,
and the authenticated portal asks the recording to use Developer Mode and show
the main use cases and tools across the product's supported platforms.
SkillPilot Coach v1 declares exactly one supported review surface: ChatGPT in a
browser. This is a project-specific compatibility boundary because the plugin
features required by SkillPilot v1 are not currently supported by its native
ChatGPT app path; it is not a general claim about OpenAI plugins on mobile
devices. Native-app evidence is therefore outside this V1 review artifact and
will be reconsidered only if the portal or reviewer explicitly challenges that
declared boundary. This scope is not a guarantee of advance acceptance. The
same submission contract requires exactly five positive and three negative
review cases as separate portal Testing entries; it does not require all eight
test cases to be replayed inside the demo recording. See
the official [final submission errors](https://developers.openai.com/plugins/deploy/submission-errors#final-directory-submission)
and [submission testing](https://developers.openai.com/plugins/deploy/submission#testing)
guidance.

The target recording blueprint is defined in
`scenarios/skillpilot-openai-review.template.yaml`. Its five browser chapters P2–P5 and D1
show the supported first-party launch, context-bound orientation, a second
goal completed through Verified Recall, complete exam evaluation, and consent-bound
focus widening, followed by the current 1.1.0 daily-plan workflow: a compact
Mathematics/Physics overview, plan continuation and an explicit subject switch.
The five positive and three negative cases remain separate portal Testing entries in
`docs/deploy/openai-plugin-v1-submission.md`; D1–D6 are additional regression cases.
The D1 video chapter shows D1/D3 and continuation of the active plan goal. It
does not prove D2's separate no-active-goal repair path or all regression cases.
A contract test locks all five
first-party WebGUI launches, the URL-prefilled-message and exact-session gate,
the complete eight-answer Recall batch, the absence of any redundant app lookup, and a captured result gate
per video chapter.

For the current operator handoff and approval checklist, see
[`docs/deploy/openai-plugin-v1-demo-video.md`](../../docs/deploy/openai-plugin-v1-demo-video.md).
Local preparation needs no credentials or paid API calls:

```bash
cd /home/enpasos/projects/skillpilot/tools/demo-video
npm run check
npm run demo -- validate --scenario scenarios/skillpilot-openai-review.template.yaml
```

These commands validate the recording machinery and blueprint, not a real
ChatGPT session, the deployed plugin, or the final video. No fixture transcript
or API-regression output may stand in for an actual ChatGPT screen recording.
Before the next release recording, extend P3 with the actual memory-widget
flip/rate sequence required by the current review case. Its existing script
still jumps straight to Verified Recall; passing the local blueprint tests
does not establish that missing main-use-case evidence.

Before treating that template as release evidence:

1. Read the exact deployed Git SHA from the protected production health detail
   `openAiDeCoach.details.serverBuild`; pass it through `--source-revision`.
   `review-build` substitutes it in memory and never edits the template. The
   tool validates the SHA shape; it cannot independently observe the protected
   production health endpoint.
2. Keep the dedicated, logged-in ChatGPT Developer Mode Chromium profile
   outside Git. Put its absolute path only in the private review-secrets JSON,
   close every browser window using it before a run, and keep the profile root
   owned by and accessible only to the current user. Each command acquires an
   exclusive lease, copies the closed profile to a private run-scoped cache
   snapshot, runs Playwright only against that snapshot, and deletes it without
   syncing changes back.
3. Calibrate only the external ChatGPT locator variables against the current
   UI; SkillPilot's own selectors/accessible labels are repository-owned.
4. Let `review-build` create one fresh disposable learner for each P2–P5 and D1 video
   chapter through the public first-party endpoints. It prepares the normal
   reviewed state, then records every launch through the real SkillPilot
   WebGUI. Each click creates that chapter's fresh 24-hour learning session and
   passes its prepared message to ChatGPT through the product URL. The fixture
   code never creates a learning session or constructs a ChatGPT start URL.
   After the run it deletes every learner ID that the public CREATE endpoint
   successfully returned. There is no reset, admin backdoor, reused learner,
   or generator-entered session ID.
5. Keep permanent SkillPilot IDs, OAuth material, tool capabilities,
   credentials, and prompt-bearing URLs outside artifacts or under opaque
   masks. The short-lived `learningSessionId` is intentionally visible in the
   recording; it expires after 24 hours and is not a permanent learner ID.
6. Put the OpenAI API key and absolute persistent-profile path in the private
   review-secrets JSON shown below. `platformClips` is empty because this V1
   submission supports only the browser surface. Generic scenarios may still
   append independently reviewed platform clips.
7. Review `timeline.json`, every evidence screenshot, `subtitles.srt`, and the
   final MP4. Only after explicit approval, host the final MP4 at a new public,
   content-addressed HTTPS URL and verify anonymous access and exact bytes
   before entering that URL in the portal. The historical 1.0.0 video and its
   URL remain unchanged.

The release-oriented command is:

Run it on a trusted operator workstation with a graphical browser, not on the
production host. Only the non-secret deployed `serverBuild` value is copied
from production; the Chromium profile and OpenAI API key stay on the operator
workstation.

```bash
umask 077
cd /home/enpasos/projects/skillpilot/tools/demo-video

# One-time protected operator setup. Use a normal, dedicated Chromium profile,
# log in with the review account, enable Developer Mode, make the current
# SkillPilot Coach v1 1.1.0 draft available, and close every profile window. Do not use
# automation or challenge-bypass flags for the login.
mkdir -p /home/enpasos/projects/skillpilot/tools/demo-video/secrets/chatgpt-login-profile
chmod 700 /home/enpasos/projects/skillpilot/tools/demo-video/secrets
chmod 700 /home/enpasos/projects/skillpilot/tools/demo-video/secrets/chatgpt-login-profile

# Create this file with a local editor. Never paste its values into a shell
# command, commit it, or include it in the screen recording.
test -e /home/enpasos/projects/skillpilot/tools/demo-video/secrets/skillpilot-review.json || \
  install -m 600 /dev/null /home/enpasos/projects/skillpilot/tools/demo-video/secrets/skillpilot-review.json
vi /home/enpasos/projects/skillpilot/tools/demo-video/secrets/skillpilot-review.json

# Strict private file shape (insert the real OpenAI API key):
# {
#   "schemaVersion": 1,
#   "openAiApiKey": "...",
#   "browserProfilePath": "/home/enpasos/projects/skillpilot/tools/demo-video/secrets/chatgpt-login-profile",
#   "platformClips": []
# }

# The release command deliberately refuses inherited API keys or scenario
# bindings so those values cannot remain visible in the initial process
# environment on Linux.
unset OPENAI_API_KEY
unset SKILLPILOT_REVIEW_CHATGPT_PROFILE

read -rp 'Exact deployed serverBuild: ' SKILLPILOT_REVIEW_SOURCE_REVISION
npm run demo -- review-preflight \
  --scenario /home/enpasos/projects/skillpilot/tools/demo-video/scenarios/skillpilot-openai-review.template.yaml \
  --source-revision "$SKILLPILOT_REVIEW_SOURCE_REVISION" \
  --review-secrets /home/enpasos/projects/skillpilot/tools/demo-video/secrets/skillpilot-review.json
npm run demo -- review-build \
  --scenario /home/enpasos/projects/skillpilot/tools/demo-video/scenarios/skillpilot-openai-review.template.yaml \
  --source-revision "$SKILLPILOT_REVIEW_SOURCE_REVISION" \
  --review-secrets /home/enpasos/projects/skillpilot/tools/demo-video/secrets/skillpilot-review.json

unset SKILLPILOT_REVIEW_SOURCE_REVISION
```

`review-build` always records fresh evidence and refreshes AI output. Before it
creates any learner, it runs the full Doctor, validates and snapshots the
closed private Chromium profile, opens that snapshot headfully with a fixed
1440x900 Playwright viewport for a read-only ChatGPT new-chat preflight, and
verifies the authenticated new-chat composer. The recorder then reuses the
same snapshot and deletes it afterward. It does not open the app lookup or add
an app chip: ChatGPT invokes SkillPilot Coach v1 from the first-party prepared
message itself. The visible context-grounded tool response after sending is the
review evidence for that invocation.
For each chapter the recorder compares the normalized visible composer text
with the `prompt` value observed on the first-party WebGUI navigation and
separately requires the exact unchanged 43-character `learningSessionId`.
It sends nothing if either check fails and never fills, reconstructs, or repairs
that session message.
Sensitive values are read directly from the private file and passed only
through explicit in-memory interfaces. Chromium and FFmpeg receive a minimal
allow-listed environment.

`review-preflight` runs that same prerequisite gate but creates no SkillPilot
learner, sends no ChatGPT message or tool call, and makes no OpenAI API request.
Before those checks it retries deletion of any learner IDs retained in the
private cleanup ledger from an interrupted review run. It then loads the
authenticated ChatGPT new-chat page. Run it first whenever the authenticated
profile, FFmpeg installation, browser, or deployment revision changes.

The audit manifest is first written as `manifest.pending.json`. It becomes the
`manifest.json` completion marker only after every known disposable learner ID
has been deleted and the run-owned Chromium snapshot has been removed. A failed
build or incomplete learner/profile cleanup removes both completion markers,
so an MP4 left by a failed run cannot be mistaken for approved review evidence.
Known learner IDs are held only in an atomically published private cleanup
ledger; a later preflight retries that ledger before any external browser
checks or new fixture generation and removes it after successful cleanup. The
profile snapshot carries a private process-ownership marker; a later run removes
only a well-formed abandoned snapshot from a process known to be dead on the
same host and only after Chromium's own profile lock has disappeared.

One unavoidable boundary remains in the current public CREATE contract: if the
server commits a learner but its response is lost before the client receives
the new ID, no client-side cleanup ledger can name that learner. Such a learner
contains no prior user data and remains covered by SkillPilot's normal
365-day inactivity deletion. The tool does not claim that this ambiguous
network-failure case was synchronously deleted.

The command prints the private final MP4 and manifest paths. After human
approval, publish only the final MP4 at the new public HTTPS location used by
the portal. An unlisted URL is still public, not a privacy boundary. The WebM,
screenshots, timeline, analysis, WAV files, SRT, and manifest form a private
audit package and are not the portal payload.

The command does not automate ChatGPT login/MFA, video hosting, portal
submission, or the final human privacy/truth review. Those steps require
external authority and remain explicit release gates. Native device capture is
outside this browser-only V1 release scope; it is not a current release gate.

### Optional native clip mechanism (not used by the SkillPilot v1 review)

Playwright Chromium can record desktop and emulated mobile **web** profiles; it
cannot honestly produce native-app footage. The generic compositor can accept
separately reviewed external native clips for other scenarios, labels their
capture method, and records their exact hash provenance. The SkillPilot v1
review template deliberately supplies `platformClips: []`, so none of this
generic capability is exercised or represented in the current submission.
If the portal or reviewer later raises a specific supported-platform objection,
native evidence must be scoped, captured, privacy-reviewed, and approved as a
separate release decision rather than being inferred from browser emulation.

The Web recording boundary remains exposed through `RecordingAdapter`; a
future device automation adapter can replace the external native-input step
without changing analysis, narration, TTS, subtitle, or render modules.

## Modules

| Module | Responsibility |
| --- | --- |
| `schema.ts`, `config.ts` | Strict YAML contract, defaults, interpolation, path resolution |
| `recorder.ts`, `privacy.ts`, `locator.ts` | Chromium actions, video/evidence capture, opaque masks, click pulses |
| `analyzer.ts` | Deterministic, redacted timeline summary |
| `narrator.ts` | Evidence-grounded structured English script |
| `tts.ts` | Segment WAV generation and content-addressed cache |
| `gemini-tts.ts` | Gemini speech adapter, scoped private key lookup, natural PCM-to-WAV conversion |
| `quickstart-build.ts`, `quickstart-export.ts` | Claude-first public recording, disposable-profile cleanup, natural-timing content-addressed export |
| `subtitles.ts` | Sanitized, wrapped and timed SRT cues |
| `pacing.ts`, `media.ts`, `process.ts` | speech-aware visual holds, ffprobe, audio scheduling, zooms, normalized FFmpeg render/concat |
| `platform-clips.ts` | reviewed native-input validation, private snapshots, labels, composition provenance |
| `policy.ts`, `private-fs.ts` | fixed AI-voice disclosure and private artifact permissions |
| `pipeline.ts`, `cli.ts` | Stage orchestration, manifest, one-command interface |

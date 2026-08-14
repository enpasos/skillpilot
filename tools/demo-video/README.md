# Browser Demo Video

`@skillpilot/browser-demo-video` turns a declarative browser scenario into a
reviewable MP4 in one command:

```text
YAML -> Playwright Chromium -> redacted WebM + timeline + screenshots
     -> OpenAI structured narration -> OpenAI TTS WAV segments
     -> SRT subtitles -> FFmpeg H.264/AAC MP4 + provenance manifest
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
  a fixed creation timestamp, and writes the final MP4 atomically.
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
kept in memory, removed from errors, scanned out of generated text, and never
written into the timeline, analysis, narration request, or manifest.

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
default. The first spoken/subtitle segment always contains the required clear
AI-voice disclosure and the code does not provide a switch to suppress it.

References:

- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Text to speech](https://developers.openai.com/api/docs/guides/text-to-speech)

## SkillPilot OpenAI review demo

The target review blueprint is defined in
`scenarios/skillpilot-openai-review.template.yaml`. It locks the five positive
and three negative case IDs from
`docs/deploy/openai-plugin-v1-submission.md`, retains the reviewed prompts,
performs all eight explicit card ratings, and centralizes external ChatGPT
locators. A contract test locks the case order, protected URL inputs, eight
ratings, P1 app selection, and a captured fail-closed result gate per case.

Before treating that template as release evidence:

1. Replace `sourceRevision` with the exact deployed Git SHA.
2. Capture a dedicated ChatGPT Developer Mode storage state outside Git and set
   `browser.storageState` to that protected file.
3. Calibrate only the external ChatGPT locator variables against the current
   UI; SkillPilot's own selectors/accessible labels are repository-owned.
4. Ensure every stateful case creates a fresh disposable learner through the
   normal first-party flow. Never add a reset/admin backdoor.
5. Provide the resulting protected launches only through the six documented
   `SKILLPILOT_REVIEW_*_START_URL` environment variables.
6. Keep permanent IDs, `learningSessionId`, OAuth material, tool capabilities,
   credentials, and prompt-bearing URLs under opaque masks.
7. Review `timeline.json`, every evidence screenshot, `subtitles.srt`, and the
   final MP4 before uploading its private HTTPS URL to the portal.

The committed blueprint deliberately does not claim to create those six
first-party learner fixtures: today that preparation is a protected external
input. Once the source revision, calibrated locators, launch URLs, and storage
state are present, the browser capture, analysis, narration, speech, captions,
pacing, and render are one command. A future setup adapter can move fixture
creation into the declarative preflight without changing the media pipeline.

### Native platform evidence

Playwright Chromium can record desktop and emulated mobile **web** profiles. It
cannot honestly produce native ChatGPT iOS or Android footage. The OpenAI portal
currently asks for the main use cases and tools across Web, iOS, and Android,
so emulation must not be labeled as native.

The recording boundary is exposed through `RecordingAdapter`; future native
Appium or device-farm adapters can be added without changing analysis,
narration, TTS, subtitle, or render modules. Until such an adapter and native
clip composition are implemented, this tool produces the Web portion only.
That is the remaining implementation boundary for a fully regenerated
three-platform review artifact.

## Modules

| Module | Responsibility |
| --- | --- |
| `schema.ts`, `config.ts` | Strict YAML contract, defaults, interpolation, path resolution |
| `recorder.ts`, `privacy.ts`, `locator.ts` | Chromium actions, video/evidence capture, opaque masks, click pulses |
| `analyzer.ts` | Deterministic, redacted timeline summary |
| `narrator.ts` | Evidence-grounded structured English script |
| `tts.ts` | Segment WAV generation and content-addressed cache |
| `subtitles.ts` | Sanitized, wrapped and timed SRT cues |
| `pacing.ts`, `media.ts`, `process.ts` | speech-aware visual holds, ffprobe, audio scheduling, zooms, FFmpeg render |
| `policy.ts`, `private-fs.ts` | fixed AI-voice disclosure and private artifact permissions |
| `pipeline.ts`, `cli.ts` | Stage orchestration, manifest, one-command interface |

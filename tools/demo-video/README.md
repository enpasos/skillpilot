# Browser Demo Video

`@skillpilot/browser-demo-video` turns a declarative browser scenario into a
reviewable MP4 in one command:

```text
YAML -> Playwright Chromium -> redacted WebM + timeline + screenshots
     -> OpenAI structured narration -> OpenAI TTS WAV segments
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
default. The first spoken/subtitle segment always contains the required clear
AI-voice disclosure and the code does not provide a switch to suppress it.

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
review cases. See
the official [final submission errors](https://developers.openai.com/plugins/deploy/submission-errors#final-directory-submission)
and [submission testing](https://developers.openai.com/plugins/deploy/submission#testing)
guidance.

The target review blueprint is defined in
`scenarios/skillpilot-openai-review.template.yaml`. It locks the five positive
and three negative case IDs from
`docs/deploy/openai-plugin-v1-submission.md`, retains the reviewed prompts,
performs all eight explicit card ratings, and centralizes external ChatGPT
locators. A contract test locks the case order, protected URL inputs, eight
ratings, the visible P1 app-name gate, and a captured fail-closed result gate
per case.

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
4. Let `review-build` create one fresh disposable learner for each stateful
   P2-P5/N2-N3 case through the public first-party endpoints. It prepares the
   normal reviewed state, records the P2 SkillPilot handoff visibly, creates
   five fresh protected launches in memory, and deletes every learner ID that
   the public CREATE endpoint successfully returned. There is no reset, admin
   backdoor, or reused learner.
5. Keep permanent IDs, `learningSessionId`, OAuth material, tool capabilities,
   credentials, and prompt-bearing URLs under opaque masks.
6. Put the OpenAI API key and absolute persistent-profile path in the private
   review-secrets JSON shown below. `platformClips` is empty because this V1
   submission supports only the browser surface. Generic scenarios may still
   append independently reviewed platform clips.
7. Review `timeline.json`, every evidence screenshot, `subtitles.srt`, and the
   final MP4 before uploading its private HTTPS URL to the portal.

The release-oriented command is:

Run it on a trusted operator workstation with a graphical browser, not on the
production host. Only the non-secret deployed `serverBuild` value is copied
from production; the Chromium profile and OpenAI API key stay on the operator
workstation.

```bash
umask 077
cd /home/enpasos/projects/skillpilot/tools/demo-video

# One-time protected operator setup. Use a normal, dedicated Chromium profile,
# log in with the review account, enable Developer Mode, make the draft
# SkillPilot Coach v1 app available, and close every profile window. Do not use
# automation or challenge-bypass flags for the login.
mkdir -p /home/enpasos/projects/skillpilot/tools/demo-video/secrets/chatgpt-login-profile
chmod 700 /home/enpasos/projects/skillpilot/tools/demo-video/secrets
chmod 700 /home/enpasos/projects/skillpilot/tools/demo-video/secrets/chatgpt-login-profile

# Create this file with a local editor. Never paste its values into a shell
# command, commit it, or include it in the screen recording.
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
verifies the composer and visible `SkillPilot Coach v1` app name. The recorder
then reuses the same snapshot and deletes it afterward. The ChatGPT browser
check proves that the draft app name is visible; the final human review must
still confirm that the app is actually selected in every recorded
conversation.
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
same host.

One unavoidable boundary remains in the current public CREATE contract: if the
server commits a learner but its response is lost before the client receives
the new ID, no client-side cleanup ledger can name that learner. Such a learner
contains no prior user data and remains covered by SkillPilot's normal
365-day inactivity deletion. The tool does not claim that this ambiguous
network-failure case was synchronously deleted.

The command prints the private final MP4 and manifest paths. Upload only the
final MP4 to the private HTTPS location used by the portal. The WebM,
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
| `subtitles.ts` | Sanitized, wrapped and timed SRT cues |
| `pacing.ts`, `media.ts`, `process.ts` | speech-aware visual holds, ffprobe, audio scheduling, zooms, normalized FFmpeg render/concat |
| `platform-clips.ts` | reviewed native-input validation, private snapshots, labels, composition provenance |
| `policy.ts`, `private-fs.ts` | fixed AI-voice disclosure and private artifact permissions |
| `pipeline.ts`, `cli.ts` | Stage orchestration, manifest, one-command interface |

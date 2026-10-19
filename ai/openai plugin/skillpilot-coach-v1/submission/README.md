# Current submission sources and evidence

The active source is `review-cases.json`: five positive portal cases, three
negative portal cases, and six additional daily-plan/status/pause cases. `portal-metadata.json`
contains only public metadata and pending manual steps. The current manifest,
MCP endpoint and exported contract supply all corresponding release fields.

The generated worksheet JSON is a non-secret **prepared draft**, not an accepted or
submitted portal object. The separate submission ZIP uses OpenAI's documented
Codex package format and imports review/publication information. Never
paste an old raw export into these sources: it contains OAuth and reviewer
credentials. The rejected export is represented only by its sanitized findings
and checksum under `history/`.

## Commands

Run from the repository root, after preparing the current candidate contract:

```bash
node --test scripts/openai_plugin_submission.test.mjs
node --test scripts/reproducible_plugin_zip.test.mjs
node scripts/openai_plugin_submission.mjs prepare
node scripts/openai_plugin_submission.mjs check
node scripts/openai_plugin_submission.mjs package --out-dir tmp/openai-submission
node scripts/openai_plugin_submission.mjs audit-zip --zip tmp/openai-submission/skillpilot-coach-v1-1.1.3-submission.zip
node scripts/openai_plugin_submission.mjs audit-export --export /exact/local/path/export.json
node scripts/openai_plugin_submission.mjs validate-trace --trace /exact/local/path/trace.json
```

`prepare` writes `generated/portal-draft.json`, `generated/preparation.json`,
`generated/acceptance-guide.md`, `generated/trace-template.json`,
`generated/submission-plugin.json` and `generated/submission-package.json`.
It does not update production or send anything to OpenAI. `check` requires exact
regeneration. An alternative `--contract PATH` must have the matching adjacent
snapshot `plugin.json`. `--out-dir PATH` isolates temporary outputs.
The adjacent `snapshot-manifest.json` must bind the exact contract bytes and
current candidate identity/version. Run `node scripts/openai_plugin_release.mjs
verify` first to confirm the entire snapshot still reproduces from current
sources, including the skill bundle and UI bytes.

`package` writes the same six files plus the actual deterministic ZIP to the
chosen output directory (default `tmp/openai-submission/`). It contains exactly
the seven allowlisted install files and the repository's Apache-2.0 `LICENSE`,
with a single plugin root at the ZIP root. The submission manifest derives
`extensions.com.openai.review.test_cases` from the reviewed source cases, using
the documented `prompt` and `expected_behavior` names. It derives
`extensions.com.openai.publication.release_notes` from
`release-notes/<current-version>.md`. The canonical install manifest and Git
packages are not modified by this generation. Source and packaged file hashes,
including the intentionally different manifest hashes, appear in the report.
`audit-zip` requires byte-for-byte equality with the current generated ZIP;
extra members, altered metadata, corruption and stale source bytes cannot pass.

The output is buildable without a demo, but is never declared ready for
submission. To include a new demo, add a non-secret `demoRecording` object with
the exact current `candidateVersion` and public HTTPS `url` to
`portal-metadata.json`, after the recording has actually been reviewed. The
rejected 1.0.0 demo is rejected even if relabeled with the current version;
internal review URLs must refer to the current plugin and version. Without a
current-candidate demo, `demo_recording_url` is explicitly empty to clear any
old dashboard video (omitting it would preserve that video), and the report
lists `current-candidate-demo` as pending. Host acceptance, deployed candidate
verification, portal connection/scans, secure reviewer access and legal
attestations remain external steps in every locally generated report.

The generated [acceptance guide](generated/acceptance-guide.md) presents all
fourteen cases with their complete fixture setup, ordered turns, tool rules,
semantic assertions and automated test mappings. Start there for the real
ChatGPT run. The accompanying trace template intentionally contains **no
observed events or approvals** and fails trace validation until actual,
reviewed evidence is supplied. Copy it to a separate local directory under
`tmp/`; never enter observations into the generated source template.

After successful source checks and the dependency audit, the OpenAI CI job
retains the explicitly allowlisted non-secret preparation files and submission
ZIP/report artifacts. It does not upload actual
traces, recordings, credentials, private portal exports or arbitrary files
from `tmp/`. The artifact is a worksheet, not a passed host test or submission.

Generated portal prompts include complete actionable fixture setup and all
ordered turns. The export audit compares our authored fields, including both duplicated tool
catalog locations, schemas, metadata and test texts. It emits only paths and
defect classes, never export values. Additional private fields are not copied.
The legacy observed export has no top-level starter-prompt field; that prompt
is also packaged in the manifest and must be checked in the portal. Review
credentials, legal attestations, countries, portal scanning and the new demo
also remain explicit manual steps. No test case is silently dropped or text
silently truncated.

Upload through **Plugins → Upload new or existing plugin → Upload plugin**,
using **With MCP**. Inspect imported **Metadata & Skills**, resolve package and
skill findings by uploading a new complete ZIP, and connect the single declared
server under **MCPs**. Inspect the imported OAuth settings, complete domain
verification/authentication, and review tool scans. ZIP-imported cases are
read-only under **Review information**: edit the source and upload again to
change them. An MCP rescan checks hosted tool changes and does not replace the
packaged skills. Reviewer credentials belong only in the secure dashboard.
Submission and publication remain separately authorized external actions.
See the [official submission guide](https://developers.openai.com/plugins/deploy/submission)
and [submission errors](https://developers.openai.com/plugins/deploy/submission-errors).

## What automated execution proves

The separate [automatic API dialog runner](../../../../docs/qa-ci/openai-dialog-regression.md)
executes all fourteen authored cases with the current skill and model-visible
tool catalog against the real adapter with isolated simulated domain state.
It combines deterministic checks with independent semantic model evaluation,
uses a dedicated test-only API key and bounded usage, and emits a version-bound
report. It never manufactures human reviews or marks host acceptance complete.
The dedicated GitHub workflow supports manual and explicitly enabled daily runs.

Each case names concrete backend/component tests. Those tests execute the real
adapter and state/capability code against controlled fixtures. Their actual test
reports prove those assertions, not the model's choice of tool or visible text.
For example, backend N3 verifies that ordinary exam context contains no protected
solution; it does not prove that ChatGPT refuses a learner's premature hint.

`validate-trace` validates a **previously recorded** sanitized execution. It does
not invoke an LLM or claim a live account is available. No actual ChatGPT or
native-app acceptance is claimed by this repository-generated draft. The source
keeps all real-host case statuses `pending`; a reviewed run is separate evidence.

## Sanitized trace format

A trace JSON contains:

- `schemaVersion: 1`, current `candidateVersion`, SHA-256 of the canonical
  pretty-printed case JSON as `suiteSha256`, canonical contract hash
  `contractSha256`, exact snapshot-manifest file hash `snapshotManifestSha256`,
  and a non-secret `runId`; both candidate hashes must match the current
  preparation, so same-version contract, skill or UI updates invalidate old
  traces after regenerating the candidate;
- `layer`: `backend-fixture`, `model-replay`, `chatgpt-web`, `chatgpt-ios`, or
  `chatgpt-android`; a mock must never be labeled as a real host;
- `cases`: exactly all P1–P5, N1–N3 and D1–D6, each with `id` and ordered
  `events`; missing or unknown cases fail;
- events have a unique non-secret `id` and `kind` (`user`, `assistant`, `tool`,
  `ui`). User/UI events carry the authored `turnId`, in the exact source order;
  prepared-start content is redacted, never copied. Text events may contain
  `text`; tool events have `name` and explicit `outcome: "success"` or `"error"`.
  Error events require `errorCode`; any error not explicitly expected by the case
  fails, and a required operation needs success (except N1's expected error).
  Do not include raw input/output blobs, real learning sessions,
  permanent learner IDs, OAuth tokens, signed URLs or hidden answer payloads;
- `manualReviews` per case associate `assertionId`, `status: "passed"`,
  nonempty `reviewer`, actual referenced `eventIds` and a 64-hex
  `evidenceSha256`. Incomplete or failed semantic/visual checks stay pending;
- real ChatGPT layers additionally require `hostEvidence` with `sha256`,
  `recordingReference`, `observedAt` and `reviewer`. A reference identifies a
  separately retained sanitized recording; do not embed a signed download URL.

Machine checks cover exact text where specified, required/forbidden tools,
counts, ordering and error codes. Human reviews cover contextual correctness,
consent timing, full text, rendering, all-or-nothing recall and unchanged state
against actual evidence. Every unresolved criterion fails the validation.

The validator checks these declarations and evidence references; it cannot
authenticate the recording or prevent dishonest manual declarations. Real-host
acceptance therefore requires a reviewer to inspect the underlying evidence.
Browser viewport emulation is not native mobile acceptance.

Daily-plan fixtures explicitly verify their preconditions. In particular D2
needs no active goal and an authoritative resume option, while D4 needs no active
goal and no resume option. If the ordinary first-party UI cannot establish an
internal backend fixture's state, that host scenario stays pending. Do not force
production state or turn a different live state into a pass. D1 compares the
chat with the actual backend status text shown in the SkillPilot cockpit; the
fixture texts are only controlled backend examples.

# SkillPilot Claude personal marketplace release

This runbook governs the repository-backed personal marketplace for
`skillpilot-coach-v1`. It distributes one exact Claude plugin candidate; the
marketplace mechanism itself does not alter that candidate. It is not an
Anthropic-curated or Anthropic-verified listing. Version 1.1.8 is published in
the public Marketplace and its exact source, package and repository have been
independently verified. The website download still serves 1.1.7 as verified on
21 September; the automatic backend-build alignment described below requires
its own normal deployment. Full real-client acceptance of 1.1.8 remains pending; repository
publication does not establish installation or synchronization in every account.
Earlier published packages and their evidence remain immutable history.

## Local 1.1.9 candidate for issue #55

The 23 September 2026 task-closure change is prepared as **1.1.9**, a local,
unpublished successor. The seven-file plugin archive is reproducible at
**39,441 bytes**, SHA-256
`b53a1100fff6d84ee66c12f084a8ff359847496fbf75c8a951ee4c9a0230c3c5`.
The candidate adds `references/task-closure.md`; its Marketplace export has
twelve files. The published 1.1.8 dossier is retained byte-identically in
`release/history/1.1.8/`. Candidate-specific Marketplace, guide, direct-install
and real-client evidence starts pending. The website's tracked served index
continues to name 1.1.7 until an authorized backend rollout.

The 1.1.9 Marketplace validation workflow checks a pinned SHA-256 of the full
canonical Claude plugin source tree immediately after checking out `main` and
before loading its package builder. It then checks the exact archive digest,
closed export inventory, source parity and both strict Claude validations.
This content pin lets the local CI validate an uncommitted candidate without
claiming a future source commit or publishing it. If the canonical source tree
changes, external Marketplace validation fails until the candidate is reviewed
and the source digest is deliberately updated.

## 1.1.8 publication and automatic backend download

On 21 September 2026, the Product Owner confirmed green CI and backend deployment
and explicitly requested Marketplace publication of 1.1.8. The exact canonical
source is `a8c2869632f5d9be04d64c4eb7f365bc70ad4cae`
([source CI](https://github.com/enpasos/skillpilot/actions/runs/35616413734)).

[Marketplace PR #10](https://github.com/enpasos/skillpilot-claude-marketplace/pull/10)
was independently checked against the closed export inventory, passed
[final-head validation](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/35622917269)
and was squash-merged with an exact head-SHA guard. Two low-severity review notes
were addressed without rebinding the tested package: the public README clarifies
that the packaged setup text is a pre-publication snapshot, and the existing
Verified Recall wording was reviewed in context. The protected package bytes
remain identical to the green canonical source.

[Main-branch validation](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/35623061325)
passed. `verify-repository` then cloned the actual public default branch, verified
all eleven files, ran both strict Claude validations and installed 1.1.8 from the
public HTTPS Marketplace in an isolated Claude profile. The remote head was
stable throughout verification.

- Published revision: `be68c85b2ac0f404f26178cc4810c5f8a53feba6`.
- Verification recorded: `2026-09-21T16:03:34.000Z`.
- Export tree SHA-256:
  `1ec4a4a7d5e568319dc0cf545a8891ee56869eb7fc72f5aab2a0c8011aa59dd7`.
- Plugin: **1.1.8**, **35,909 bytes**, SHA-256
  `1603c79c06b9fa39f2b57033c65d4b1d5748cb048b01271f72b5708652e7525b`.

Only repository-publication evidence is marked `pass`; exact-client installation
and update acceptance remain pending. The Product Owner also requested that the
existing website guide display the actual download version and that each backend
rollout automatically carry the matching plugin file and index. This approves the
existing controlled-beta guide for this exact published candidate; it does not
claim successful updates in all Claude accounts or broader public acceptance.
The website index and actual downloadable bytes remain one source of truth;
there is no separate runtime GitHub version lookup.

### Automatic alignment on backend rollout

`processResources` now runs `generateClaudePluginPublication`. It builds the
current plugin reproducibly and checks its version, SHA-256 and byte length
against the release dossier before packaging the archive and matching index
together. The build includes unchanged historical archives, but replaces the
historical source index with its generated index. Normal builds do not modify
tracked release files. `/plugins` already reads the served index for every
version label and the download link; no frontend version bump is needed.

After this automation is committed, passes CI and is deployed once, subsequent
authorized backend deployments carry the matching plugin automatically. There
is no separate manual download-index promotion step. Package versioning and
review remain required when plugin content changes; backend packaging does not
publish to the Git Marketplace or prove an update in a user's Claude account.

`scripts/deploy.sh` verifies the generated resources before restart and compares
the public index and archive with that exact build after readiness. For a local
default build, the equivalent resource check is:

```bash
cd backend
./gradlew processResources
node ../scripts/claude_direct_install_beta_release.mjs verify \
  --publication-root build/resources/main/claude-plugin-publication
```

Use the matching configured build directory when `SKILLPILOT_BACKEND_BUILD_DIR`
is set. The ordinary source-only `verify` still checks historical integrity; it
does not assert that a newly deployed backend serves that old index.

Local verification passed: deterministic generation and immutable-version
regressions, generated classpath HTTP/download tests, `processResources` and
`bootJar`, and German/English desktop/mobile browser checks using the generated
1.1.8 archive. TypeScript, focused lint, documentation links and independent
review passed. The read-only production monitor accepts only the exact recorded
old publication or the exact locally reproduced current build during rollout;
unknown metadata and modified archives fail. All eight live checks passed before
deployment of this automation, with the download still at 1.1.7.

## Completed 1.1.7 Marketplace publication

On 19 September 2026, the Product Owner confirmed green CI and production
deployment, then explicitly requested publication of the current Claude plugin.
The Marketplace was bound to the green SkillPilot source commit
`80c8f3a3e94e5c7d43c183d18bacb7ce38bb4117`
([source CI](https://github.com/enpasos/skillpilot/actions/runs/35465833125)).
The plugin quotes the shared DAY/WEEK status per subject verbatim and announces
the active learning goal separately when teaching begins.

[PR #9](https://github.com/enpasos/skillpilot-claude-marketplace/pull/9)
passed the required [final-head validation](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/35468419187)
and was squash-merged with an exact PR-head SHA guard. An independent review
confirmed the closed file inventory, canonical package parity and honest
client-acceptance claims. The automatic review recommended approval with two
wording notes: the Marketplace README was clarified; the packaged README's
historical wording about daily quotas was retained to preserve the exact tested
candidate. That documentation wording can be aligned in a later canonical
source update; the current coaching instructions already use DAY/WEEK periods.

The [main-branch validation](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/35468537513)
also passed. `verifyPublishedClaudeMarketplace`, the implementation used by
`verify-repository`, then cloned the actual public default branch, compared all
twelve files, ran both strict Claude validations and installed the exact plugin
from the public HTTPS repository in an isolated Claude profile. The remote HEAD
remained unchanged throughout verification.

- Published revision: `c06583c1a94e486ed5afe25cafe41ac8e16677b8`.
- Verified at: `2026-09-19T20:49:07.938Z`.
- Twelve-file export tree SHA-256:
  `5ea0bbe9ba5776154155cfb2d9b390a1aaac5a672261172855eb382fc58dccca`.
- Plugin: **1.1.7**, **34,586 bytes**, SHA-256
  `a7bb73da48087f44aeb1155b848768efc79efa71c55c9a2278c8e0cc4901d26b`.

Twenty-six scoped Marketplace tests and the local installation smoke passed.
The credential-free production synthetic passed before and after publication,
including the separately served 1.1.6 download and the connector's OAuth
metadata and unauthenticated challenge. No additional backend deployment or
website download/guide promotion was performed by this publication.

At publication, only `public-repository-default-branch` was recorded as `pass`,
giving `published_pending_acceptance`; real-account installation/update checks
and the new candidate's guide decision were pending. The Product Owner later
confirmed seeing 1.1.7 in Claude and successfully starting with the plugin.
This is a partial host observation; status fidelity and the complete learning
flow remain to be checked. The subsequent website correction is recorded below.

## 1.1.7 website version and download alignment

After confirming the installed 1.1.7 plugin and a successful start, the Product
Owner reported that `skillpilot.com/plugins` still advertised 1.1.6 and supplied
a screenshot. The public publication index independently confirmed 1.1.6.
The requested correction aligns the existing installation guide, version badge,
version comparison and downloadable file with the published Marketplace version.

The existing Marketplace-first guide and file fallback are now bound to exactly
1.1.7, package SHA-256
`a7bb73da48087f44aeb1155b848768efc79efa71c55c9a2278c8e0cc4901d26b`,
repository revision `c06583c1a94e486ed5afe25cafe41ac8e16677b8` and tree SHA-256
`5ea0bbe9ba5776154155cfb2d9b390a1aaac5a672261172855eb382fc58dccca`.
The candidate-bound guide decision records this request; previous approvals
and artifacts remain unchanged. The native `prepare` command adds the exact
34,586-byte artifact and advances the backend's served index. All visible
version labels and the download link continue to derive from that index.

Fifty Marketplace/direct-install tests passed. The publication Unit and browser
tests passed for German/English and mobile/desktop, checking the visible 1.1.7
badge, version comparison, Marketplace instructions and actual downloaded bytes
against the prepared index. Focused lint and documentation checks passed; all
ten earlier plugin archives remain byte-identical. The backend caches its
validated publication snapshot per process, so this update requires the normal
backend deployment/restart as well as including the new resource files.

This change is prepared locally for the Product Owner's commit and production
deployment. It is not yet a claim that the live website serves 1.1.7. After
deployment, `verify-public` must confirm both the public index and the exact
immutable download. Full client acceptance remains pending; the observed
version and successful start do not establish every installation/update path
or the coach's verbatim status behavior.

## 1.1.6 explicit continuation candidate, 14 September 2026

The Product Owner required that a plan guide and prioritize but never prevent
explicitly requested learning. The coach continues an active unmastered goal or
lets the backend select a reachable open Personal Curriculum target, even with
zero daily quota, empty backlog, future plan dates or an exhausted plan. Server
capabilities authorize continuation; counts do not prohibit it. Prerequisites,
automatic daily stopping and read-only status requests remain enforced. After
the daily target, remaining backlog is offered as a pressure-free opportunity
to catch up; a pause stays possible without becoming the primary recommendation.

The seven-file published 1.1.5 release dossier is archived byte-identically under
`ai/claude/plugin/skillpilot-coach-v1/release/history/1.1.5/` and hash-protected.
During local candidate development, publication, guide and real-client evidence
started pending, while the served index and guide retained their 1.1.5 bindings.
Candidate preparation does not update that index or transfer historical guide
approval. The separate 1.1.6 publication and guide decisions are recorded below.

Use `prepare-candidate` and `verify-candidate` below for local work. The ordinary
`verify` command checks the served registry against its exactly referenced,
hash-protected historical dossier when it still names the previous release.
It does not rebuild that published artifact from successor source. The separate
candidate check still rebuilds current source and verifies exact bytes.

### Independent Marketplace publication and download promotion

For 1.1.6, Marketplace CI checks the exact package against the already green
SkillPilot commit `114ff08b29bcb259aaebf6be2a90aef659bcd886`. It uses the canonical
builder from that immutable revision, compares the seven package files with
the reviewed source, verifies the candidate's exact archive size and SHA-256,
and compares the extracted archive with the complete plugin directory. Both
strict Claude validations remain required. Extra files, symlinks, changed
package content and incorrect candidate bindings fail closed.

This removes the circular requirement to serve a new website download before
the Marketplace PR can pass. It does not waive download verification: the
public synthetic continues to check the actual served index and its immutable
download, and a later download-index promotion must verify the new public
artifact separately. No previous guide or client approval transfers to 1.1.6.
The Marketplace may be `published_pending_acceptance` while the served index
and its independently approved guide still reference 1.1.5. This is publication
separation, not a claim that an existing Claude installation has updated.

### Completed 1.1.6 Marketplace publication

After the Product Owner confirmed the backend deployment and green CI for
SkillPilot commit `114ff08b29bcb259aaebf6be2a90aef659bcd886`, the Marketplace
handoff was completed through
[PR #8](https://github.com/enpasos/skillpilot-claude-marketplace/pull/8).
The required [PR validation](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/34881731641)
passed before the SHA-guarded squash merge at `2026-09-14T18:38:41Z`.
The [main-branch validation](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/34882059869)
also passed for the published commit.

`verify-repository` cloned the actual public default branch and proved the
complete exported tree, both strict Claude validations, isolated installation
of the HTTPS Marketplace source and an unchanged remote HEAD:

- Repository revision: `2c009f47630132f6b14492b204c827f43ba21ba0`.
- Export: exactly twelve files, tree SHA-256
  `e466966eb72f4470730aff5a5fa6e75f2bff5e6593642a18d89cacea201a5599`.
- Plugin: `1.1.6`, 34,263 bytes, SHA-256
  `439ea142c3933333cb01d7a1051646041d61615089504b22a7d002fb637614ca`.

Local validation included 145 scoped Node tests, executable rejection cases
for modified packages and workflow bindings, App publication/browser tests,
TypeScript and focused lint. The public read-only synthetic passed before and
after publication, including the unchanged served 1.1.5 download and connector
OAuth discovery/unauthenticated challenge. No additional backend deployment,
credential change, learner-data mutation or guide promotion was performed.

At publication, only `public-repository-default-branch` was recorded as `pass`,
giving `published_pending_acceptance`; the guide decision and real-account
installation/update evidence remained pending. The next acceptance step is to
confirm installed version 1.1.6 in Claude and test explicit continuation and
catching up after a fulfilled daily quota in a fresh SkillPilot session.

### Guide approval and website download promotion, 14 September 2026

After the Product Owner reported that `/plugins` still displayed 1.1.5, the
assistant explicitly asked whether website and download should also be updated
to 1.1.6, checked and deployed. The Product Owner replied **"ja bitte"**.
This new candidate-bound decision was recorded at `2026-09-14T18:46:17.000Z`.
It authorizes the existing Marketplace-first guide and direct-file fallback
for exactly version 1.1.6, package SHA-256
`439ea142c3933333cb01d7a1051646041d61615089504b22a7d002fb637614ca`,
published repository revision `2c009f47630132f6b14492b204c827f43ba21ba0`
and tree SHA-256
`e466966eb72f4470730aff5a5fa6e75f2bff5e6593642a18d89cacea201a5599`.

`activation.firstPartyGuideDecision` is now `approved`,
`marketplaceUiSwitchAllowed=true` and `firstPartyUiRoute=personal_git_marketplace`.
The native direct-install `prepare` command advances the website index and
stores the exact reproducible 34,263-byte archive without changing any previous
artifact. The page derives its badge, comparison text and download from this
validated index; no separately hardcoded version label is introduced.

This is guide and deployment approval, not account-level acceptance. Both
Marketplace installation/update records and the exact-client direct-install
records remain pending; activation stays `published_pending_acceptance` and
`openPublicBetaReady=false`. No plugin payload, credentials, authorization,
session boundaries or learner data are changed. Local preparation is not a
claim of completed production deployment; the public index and exact download
must be verified after the normal deployment succeeds.

## 1.1.5 instruction consolidation, 12 September 2026

The Product Owner authorized removing overlapping Claude instructions while
preserving the coaching semantics, independent regression verification and a
complete production and Marketplace rollout after green CI.

The compact Skill owns the common coaching flow. The Verified Recall and exam
procedures move to conditional references; the duplicated `coaching-policy.md`
is removed from the current package. Its historical bytes remain inside the
immutable 1.1.4 artifact. The current package contains seven allowlisted files
and produces a twelve-file Marketplace tree. The fourteen tools, assessment
criteria, privacy, protected-answer, OAuth, session and progression boundaries
remain unchanged. This instruction cleanup does not reopen prohibited chat
feedback fields or imply host acceptance.

The complete seven-file 1.1.4 release dossier is archived byte-identically under
`ai/claude/plugin/skillpilot-coach-v1/release/history/1.1.4/`; the release checker
protects its exact hashes. No repository, guide or real-client approval is
inherited by 1.1.5. New evidence started pending. The final instruction content,
immutable artifact and local publication index were validated before rollout.
Production and Marketplace publication followed green CI as recorded below;
only the independently verified repository evidence now passes.

### Local verification scope

The previously mandatory Skill plus policy contained 40,643 UTF-8 bytes. The
shared 1.1.5 Skill contains 11,131 bytes, approximately 72.6% less normal-startup
instruction text. Verified Recall and exam procedures are separate conditional
references (1,692 and 1,513 bytes); all three instruction files total 14,336
bytes. These are source-size measurements, not observed Claude read counts,
token usage, latency or account-level acceptance.

An independent reviewer evaluated fourteen synthetic decision cases plus three
combined daily-completion and subject-switch cases from the instruction text.
All seventeen decisions passed the bounded review: status alone causes no
write; a subject request after daily completion requires clarification about
voluntary extra work unless that intent is already explicit; explicit voluntary
continuation uses only the current published subject option and state version.
This instruction-only simulation did not invoke a real Claude host or exercise
production tools, and complete executable backend fixtures were not supplied.
Separately, forty local backend tests across seven contract classes passed with
no failures or skips, covering exams, visualization, learning plans, mastery,
memory practice and Verified Recall. These checks supplement, but do not
replace, real-client acceptance or measured host behavior.

The first full [CI run](https://github.com/enpasos/skillpilot/actions/runs/34696935964)
passed every lane except one OAuth integration assertion. Its three consent
redirects passed, but `verifyNoInteractions(connectionService)` detected an
unrelated invocation. A local negative reproduction with a one-millisecond
cleanup interval reproduced that failure; the imported OAuth configuration
enables scheduling on the mocked connection service. The HTTP-flow fixture now
provides an inert test-only scheduler while retaining that aggressive interval
and every no-interaction assertion. All three tests pass with this isolation.
Production scheduling and OAuth behavior are unchanged. Gradle now prints full
failure exceptions, causes and stack traces without enabling standard-stream
logging. The original failed run does not authorize deployment; the corrected
commit requires a new green full CI run.

The expanded local OAuth suite also exposed a wall-clock-sensitive CIMD test:
a one-second elapsed-time assertion included JVM scheduling latency. The test
now proves causally that startup returns while the started resolver remains
blocked, and that twenty retries still produce exactly one fetch. A separate
test-harness deadlock guard replaces the stopwatch; the 50-ms test attempt
budget, production six-second hard maximum and retry/cache policy are unchanged.
All 106 expanded OAuth and connection-service tests then passed locally. These
are test-only corrections, not changes to production authorization or scheduling.

### Completed 1.1.5 production and Marketplace rollout

All five source push workflows passed on
`13726bb00b8ae55fec40141eed415346ffa69633` before production changed:
[34698744283](https://github.com/enpasos/skillpilot/actions/runs/34698744283),
[34698744194](https://github.com/enpasos/skillpilot/actions/runs/34698744194),
[34698744257](https://github.com/enpasos/skillpilot/actions/runs/34698744257),
[34698744337](https://github.com/enpasos/skillpilot/actions/runs/34698744337) and
[34698744205](https://github.com/enpasos/skillpilot/actions/runs/34698744205).
The full local backend run also passed: 202 suites, 1,788 tests, zero failures
and nine skips. Twenty Marketplace regression tests passed. These checks do
not substitute for account-level Claude acceptance.

A fresh restricted backup was preserved under
`/home/enpasos/backups/skillpilot-predeploy-1.1.5-6kwlUBtY` before deployment.
The SQL backup contains 10,620,167 bytes with mode `0600`; privacy checks before
and after creation passed without exporting prohibited feedback as evidence.
The archived previous server JAR has SHA-256
`59e62af381a3f87ca757f689c197b7708467547d0b6547728c37e819098c1e9d`.
This records backup creation, not a restore test. The service starts through
`bootRun`, so that JAR alone is not a complete runtime rollback; rollback must
also restore the intended source and rebuilt resources without overwriting
learner data or unrelated generated files.

The exact green source was deployed through `./deploy_skillpilot.sh`. The
production build, focused security tests, public artifact, frontend shell,
AI-transparency, OpenAI mTLS/route matrix and source-rationale checks all passed.
Readiness returned HTTP 200 after 40 seconds. The service became active at
`2026-09-12T14:56:49Z` with `NRestarts=0`, and OpenAI mTLS remained `enforce`.
The new deployment JAR has SHA-256
`de70d9b515ff6e68ba2f0aab1e3a5e656dff2614471b5df0f490a2867fd618ad`.
The optional OpenAI Apps challenge comparison was skipped because no expected
challenge was supplied. All eight public Claude synthetic checks passed at
`2026-09-12T14:58:01.369Z`; the scheduled support check
[passed on attempt 2](https://github.com/enpasos/skillpilot/actions/runs/34699176733)
at `2026-09-12T15:02:08Z` after the artifact was live.

At the Product Owner's request, the Marketplace README now focuses on 1.1.5
and explains that automatic updates were observed in two Claude accounts during
an earlier beta release. It no longer incorrectly says repository publication
cannot update an existing installation. This does not claim that all accounts,
or those same two accounts, have received 1.1.5. These README and changelog
clarifications changed only the Marketplace publication tree, not the plugin
artifact.

[Publication PR #7](https://github.com/enpasos/skillpilot-claude-marketplace/pull/7)
was merged. `node scripts/claude_marketplace_release.mjs verify-repository`
then verified the actual public HTTPS default branch, its closed file inventory,
both strict Claude validations and an isolated installation from that repository:

- repository revision: `228f6bd59f30fa03e3f0e44fa69ffaa122f98323`;
- verification timestamp: `2026-09-12T15:03:16.000Z`;
- publication inventory: 12 files;
- tree SHA-256: `c854f82f337200a75ee9ad1078d1f22b8c219e5e4543e0fa62da38a19b24f4b2`;
- plugin: 1.1.5, 32,535 bytes, SHA-256
  `8b1713178bbb289bc0b6669afa6e60328f2b362d42651353a78a869fe6aa76c1`;
- [default-branch validation](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/34701054308):
  passed on that exact revision, observed at `2026-09-12T15:04:23Z`.

Only `public-repository-default-branch` is recorded as `pass`; activation is
`published_pending_acceptance`. Clean-account installation, real-account update
and migration, other real-client acceptance, and the first-party guide decision
remain pending. `marketplaceUiSwitchAllowed=false`; the first-party route remains
`controlled_direct_install_beta`. No artifact or historical approval was rebound.

## 1.1.4 privacy correction, 12 September 2026

The Product Owner required removal of `workFeedback`, `outcomeFeedback` and
Recall `feedback`, then authorized deployment of both the corrected backend
and Claude Marketplace after CI passes. Claude creates its own feedback and
success messages in the chat; Core accepts only structured completion results.

This deliberately contracts the input schema. It is not backward compatible
with old cached tool inputs. The controlled-beta correction keeps the plugin,
tool and OAuth identities, session boundary and progression ownership unchanged.
Deploy the corrected backend and immutable 1.1.4 artifact first, then publish
the exact Marketplace tree and refresh installed plugin/connector catalogs.
Confirm the installed version and a successful mastery write in a fresh Claude
session. Never restore the prohibited text fields as a compatibility workaround.

The complete seven-file 1.1.3 release dossier is archived under
`ai/claude/plugin/skillpilot-coach-v1/release/history/1.1.3/`, with immutable hashes
enforced by the release checker. All 1.1.4 repository, guide and real-client
evidence starts pending; historical automatic updates do not establish new
candidate acceptance. Local preparation fixes artifact/index drift without
overwriting any published artifact. Publication and production evidence must
be recorded only after the corresponding operation actually succeeds.

### Completed production and Marketplace rollout

The Product Owner authorized autonomous completion of both deployments, with
green CI required first. The complete [application CI](https://github.com/enpasos/skillpilot/actions/runs/34691209861)
and [documentation deployment](https://github.com/enpasos/skillpilot/actions/runs/34691209879)
passed on `f28ce87e4d792c75649b01da20bc5f32cd709ad8` before production was changed.
The original failures were the stale 1.1.3 artifact binding and a missing
documentation-index entry. A subsequent frontend failure exposed a test that
required publication before CI and pinned the old 1.1.3 repository tree; it now
checks the prepared and separately verified publication states correctly.

Production was deployed from that exact commit through `./deploy_skillpilot.sh`.
A fresh restricted database backup and a hash-verified copy of the prior server
artifact were preserved first. The database precheck and fresh-backup postcheck
found none of the prohibited feedback JSON keys; no feedback text was exported
as incident evidence. This is not a restore-test or a claim about older backups.
The server's Git SSH authentication was unavailable, so the exact public source
was fetched through HTTPS without changing credentials or Git configuration.
The existing deployment generated the canonical runtime deck copies; these
generated production-worktree changes are not additional release source edits.

The production build, focused backend security tests, public artifact, frontend
shell, AI-transparency, OpenAI mTLS/route matrix and source-rationale checks
passed. Readiness returned HTTP 200 after 45 seconds. The service became active
at `2026-09-12T12:13:17Z` with `NRestarts=0`; OpenAI mTLS remained `enforce`.
The optional OpenAI Apps challenge comparison was skipped because no expected
challenge was supplied. All eight credential-free Claude support synthetic
checks passed at `2026-09-12T12:14:27.976Z`. The earlier scheduled version-drift
alarm also [passed on rerun](https://github.com/enpasos/skillpilot/actions/runs/34690832224)
after the new artifact was live.

[Publication PR #6](https://github.com/enpasos/skillpilot-claude-marketplace/pull/6)
passed required validation and automatic review, then was merged. Verification
with `node scripts/claude_marketplace_release.mjs verify-repository` proved:

- public default-branch revision: `91d6646c64ebeda9afa3b729f10a4859c360d69e`;
- verification timestamp: `2026-09-12T12:18:50.000Z`;
- closed publication inventory: 11 files;
- tree SHA-256: `dd8bf77fa63ac8d1fd3747bf5b7ba3785780742c04945d3e649d77ff558003b7`;
- plugin: 1.1.4, 58,290 bytes, SHA-256
  `0b1aa078fa140f95a83f3ef699c1b2130ac3c2e9b4624e02cb84f859d5612831`;
- strict Marketplace/plugin validation and an isolated installation from the
  actual public HTTPS repository: passed;
- [default-branch validation](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/34693308362): passed.

Only the current candidate's `public-repository-default-branch` evidence is
recorded as `pass`; activation is `published_pending_acceptance`. The guide,
real-account update, clean-account installation and other real-client acceptance
records remain pending. No previous approval is inherited, and no automatic
update in a user's Claude account is claimed. Confirm installed version 1.1.4,
refresh connector tools if needed, and start a fresh SkillPilot learning session
to verify an actual mastery write with the new input contract.

## 1.1.3 production and Marketplace publication, 12 September 2026

The Product Owner explicitly authorized both the production deployment and
subsequent publication of the prepared 1.1.3 package. Production was deployed
from `f455074b18a7d4bc03efbe0c3112c344403a0f9a` through
`./deploy_skillpilot.sh`, after a restricted database backup and preservation
of the previous server artifact. The update fixes the two stale Whitepaper
image digests and synchronizes their runtime copies without changing inventory
counts or review claims. Liquibase migration `033-add-learner-goal-completions`
is `EXECUTED`; the service is running with `NRestarts=0`.

The deployment completed its build, focused backend security tests, public
readiness, exact Claude artifact, frontend resources, AI-transparency,
OpenAI mTLS/route matrix and source-rationale checks. The optional OpenAI Apps
challenge comparison was skipped because no expected challenge was supplied
to that check; this is not a claim of challenge or real-host acceptance.
All eight public Claude support synthetic checks passed at
`2026-09-12T06:31:26.766Z`, binding the 1.1.3 artifact below.

[Publication PR #5](https://github.com/enpasos/skillpilot-claude-marketplace/pull/5)
passed the required Marketplace validation and was merged. Verification of the
actual public default branch with `verify-repository` then proved:

- repository revision: `f2d22431f84278f62cc37d8ebbe0bb92295aec13`;
- verification timestamp: `2026-09-12T06:33:19.000Z`;
- closed publication inventory: 11 files;
- tree SHA-256: `96675808155fa7d48b5890c617975ba8b25964ec20dcf01c3ab184408d459799`;
- plugin: 1.1.3, 56,661 bytes, SHA-256
  `0e0b951233d72c0dd68b2cb2f631ae7fbdd1ad2411d373d60f9414bf0019f663`;
- both strict Claude validations and an isolated install from the actual public
  HTTPS repository passed; the
  [default-branch validation](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/34678417257)
  also passed.

Only `public-repository-default-branch` is now `pass`; activation is
`published_pending_acceptance`. The guide decision, clean-account installation,
real-account refresh, privacy, legal and support acceptance remain pending.
`marketplaceUiSwitchAllowed=false`, the first-party guide remains
`controlled_direct_install_beta`, and `openPublicBetaReady=false`.
Publication does not update an existing Claude installation or establish
real-client acceptance. The six immutable packaged files retain their
preparation-time text; the Marketplace root README and changelog describe the
subsequent publication. No prior package or historical approval was rebound.

### First observed automatic update in two Claude accounts

On **12 September 2026**, after the 1.1.3 publication, the Product Owner reported
that the installed plugin version had updated **automatically to 1.1.3 in two
Claude accounts**. This is the first reported real-account automatic update in
this release history, beyond the repository and isolated-install checks above.

This is a Product Owner observation, not an agent-observed account test. The
previous installed versions, exact clients and synchronization timing were not
recorded in that report. It therefore documents the successful two-account
version update without claiming a fresh-account installation, unchanged OAuth
connectivity, a complete coaching acceptance run, or repeatable automatic
updates on every client. The next release should explicitly record whether the
same accounts update again; the two-consecutive-update repeatability gate and
the remaining acceptance records stay pending.

## Historical local 1.1.3 preparation, 11 September 2026

The following records the state before the publication above.

The Product Owner authorized local preparation using the existing candidate
workflow below. Today’s newly completed due plan goals, including older due
goals, count toward each subject’s stable daily quota. Automatic continuation
stops at the daily target; further work is voluntary and extra completions are
acknowledged separately. The backend owns completion evidence and counters.
Backlog is shown in requested details, without a repeated routine warning.

The new local direct-install artifact has 56,661 bytes and SHA-256
`0e0b951233d72c0dd68b2cb2f631ae7fbdd1ad2411d373d60f9414bf0019f663`.
Local `prepare` advances the checked-in publication index to 1.1.3 and stores
the new artifact additively. Every prior artifact retains its exact bytes. The
complete former active dossier is retained under
`ai/claude/plugin/skillpilot-coach-v1/release/history/1.1.2/`, including the
published repository and guide approvals; its file hashes are checked by the
release checker. None of those candidate-bound approvals transfers to 1.1.3.

For the new candidate, Marketplace state is `prepared_not_published`, repository
and exact-client records are `pending`, the guide decision is `pending`, and
`marketplaceUiSwitchAllowed=false`. Consequently the local first-party guide
route returns to `controlled_direct_install_beta`. This is the existing
fail-closed candidate behavior; the previously deployed 1.1.2 guide is not
changed by these local files. Web, Android/Voice, privacy, legal and support
acceptance remain pending. The generated repository tree is local only.

Local validation passed: 123 focused package, archive, release, direct-install
and Marketplace tests; deterministic artifact verification; both strict CLI
validations; and an installation smoke test in an isolated Claude profile.
The generated 11-file tree has SHA-256
`99881a8624dcf38eda781681397d7d4a9eaa657bab0923c3c0031a14ec86868d`.
The release checker reports `STRUCTURAL_PASS` with all 15 formal release gates
still pending. These local results do not provide real-client acceptance.

This work does not deploy, publish, update the remote Marketplace repository,
modify credentials or record host acceptance. The historical OpenAI review
freeze is retired; current development follows the explicit successor
authorization in `AGENTS.md`. Older freeze references below retain their
historical context and do not constrain this local preparation.

## Historical 1.1.2 first-party guide: Marketplace and file fallback, 9 September 2026

This section preserves the 1.1.2 guide decision. It does not approve the new
local 1.1.3 candidate or its Marketplace route; current candidate status is
recorded above.

After reviewing the new personal-account observations, the Product Owner
explicitly authorized implementation of a Marketplace-first installation and
update guide with **download/upload as a usable fallback**. This is a new
guide-only decision, not an inference from a visible menu. It supersedes the
8 September direct-only recommendation and the documentation-only restriction
inside the supplied r2 handoff, solely for this bounded first-party guide.

The separate `activation.firstPartyGuideDecision` is approved at
`2026-09-09T08:02:01.000Z` by `product-owner`, bound to the existing published
1.1.2 candidate, immutable artifact SHA-256 and verified repository revision/tree
listed below. `firstPartyUiRoute = personal_git_marketplace` and
`marketplaceUiSwitchAllowed = true` authorize the controlled-beta guide.
`activation.state` remains `published_pending_acceptance`. The original
repository evidence is unchanged; clean-account installation, migration/refresh
and all outstanding exact-client, privacy, legal and support checks stay
pending. No automatic-update, independent-account or native-mobile acceptance
is inferred. This change does not publish a new plugin or Marketplace tree,
deploy the application, modify GitHub permissions or operate a Claude account.

The precise boundary is recorded in
[freeze appendix 6.72](openai-plugin-v1-review-freeze.md#672-marketplace-anleitung-mit-manuellem-update-und-datei-fallback).
User-facing instructions and the retained incident history are maintained in
[personal installation and update guidance](claude-personal-plugin-update-options.md).

### Observed navigation and the two installation paths

[Open plugin management in Claude](https://claude.ai/new#customize/plugins/discover)
opens **Plugins → Discover** in the reported personal Claude Pro web account.
The complete hash route is a navigation link only, not a refresh endpoint or
a guaranteed cross-client interface. If it does not work, enter Claude's
plugin area manually. Do not attach a learner ID, session, token or GitHub
credential to this link.

- **New installation:** use the **Add dropdown at the top right → Add
  marketplace → Add from a repository**, enter the canonical public repository
  URL without a query parameter and synchronize the source. Open **SkillPilot
  Coach v1** under Discover and add it after checking the offered version.
  The source shown in the observed UI is `skillpilot-claude-marketplace`; the
  internal manifest name remains `skillpilot-marketplace`. These are not the
  plugin name. An “already added” message means use the existing-source
  management path, not repeat Add.
- **Existing installation:** **Add at the top right → Manage marketplaces → ⋮
  next to `skillpilot-claude-marketplace` → Check for updates**. The observed
  German labels are **Hinzufügen → Marketplaces verwalten → Nach Updates
  suchen**. Do not confuse the global Add dropdown with the Add button on a
  featured plugin card. Check the synchronized catalog and the installed plugin
  version separately; opening this menu or seeing a new sync time is not proof
  of installation. If the installed version stays old, use the file fallback.
- **File fallback:** first download the current `.plugin` file from SkillPilot,
  then remove only an older SkillPilot plugin if replacement is needed. Preserve
  unrelated plugins/connectors. Only then use **Add → Upload plugin**
  (**Hinzufügen → Plugin hochladen**) in Claude and retain exactly one active
  SkillPilot instance. Skip removal for a new installation; an already current
  installation needs neither removal nor reinstallation. Do not promise that same-name
  upload silently replaces every installation or preserves its connection.
  Removing the Marketplace source is not a prerequisite for this path.
- **Both paths finish the same way:** verify the installed version and the
  bundled SkillPilot connector, connect it if needed, then return to SkillPilot
  and start a new session through the existing handoff. Do not create a second
  manual MCP connector. GitHub authorization is not the SkillPilot connection.

The guide obtains all current-version copy and the download from the validated
public publication index. It does not retain a hardcoded current-version label
or infer the installed account version from download, OAuth or tab return.
Loading/error states do not display a guessed version or an older artifact.
File download and version comparison require a valid index. The independently
approved Marketplace navigation remains available if the index fails; it makes
no version-match or installation-success claim. Do not remove an existing
installation while the current version information is unavailable.

### Evidence and limitations

The internal handoff is **SkillPilot × Claude: persönliche Marketplaces,
Updates und GitHub-Rechte**, revision **r2**, 9 September 2026. Its README SHA-256
is `9bd52977e8224ff0758d78d02ba6b653575173e276be49e39b2fc5c046c59c13`.
Evidence filenames are recorded here without making ignored temporary files
dependencies of the published documentation:

- E7, `07-direktlink-plugins-entdecken.png`: Discover view; the exact URL-to-view
  relation is the user's report, not an authenticated test by the assistant.
- E8, `08-hinzufuegen-marketplaces-verwalten.png`: top-right Add menu, including
  Manage marketplaces and Upload plugin.
- E9, `09-marketplace-verwaltung-aktionsmenue.png`: Check for updates, Automatically
  sync and Remove, plus the warning that removal also uninstalls that source's
  plugins. The synchronized commit value is obscured and is not reconstructed.
- E3 shows historical synchronized versions 1.0.4 and 1.1.1, not acceptance of
  published 1.1.2. Contents history does not prove rollback, pinning, parallel
  active versions or adoption by an already running chat.
- E6 shows the GitHub App access request, not a completed authorization.

The earlier claim that Marketplace management was absent is obsolete for the
observed account: the path was previously not found and is now visible. Whether
Claude rolled it out later or it was overlooked is unknown. The normal update
path is now documented, but a controlled version-to-version update via that
specific action remains to be tested. English UI labels above are translations
of the German observations, not separately verified English-client evidence.

Automatic sync is optional and not relied upon by the learner guide. The shown
GitHub App requests write permissions including code and workflows. Do not
require learners to grant repository-admin rights or authorize all repositories.
If GitHub access is requested, use the manual path or file fallback. Any
separately approved publisher setup should be limited to the necessary repository;
selecting repositories narrows resources, not the App's permission types.
The organizational documentation's webhook/PR-merge rules do not establish
the triggers or cross-account distribution of personal Pro marketplaces.

Marketplace removal is not routine update troubleshooting: it also uninstalls
the source's plugins and does not establish revocation of GitHub App access.
The historical `?v=2` workaround remains incident evidence only; the canonical
repository URL is unchanged. Independent-account installation, two successive
real updates, duplicate prevention, connection retention and native-client
coverage still require their existing acceptance evidence.

The exported Marketplace-root README remains part of the exact already
published 11-file tree. This guide change does not silently edit that template,
invalidate its repository evidence or republish the six immutable plugin files.
Updating that external README later requires a separately authorized
documentation-only publication and fresh exact-tree verification.

## 1.1.2 Marketplace publication, 9 September 2026

This subsection records the publication decision and evidence before the later
guide decision above. Its pending guide status and direct-only wording describe
that point in time; repository and artifact evidence remain unchanged.

The Product Owner explicitly requested publication of the actual 1.1.2 plugin
through the existing Marketplace under its normal name. This authorizes the
bounded repository publication of the already prepared six-file package,
normal publication wording in the Marketplace README and changelog, and exact
repository evidence. It supersedes the preparation-only publication boundary
below for this release. It does not change the first-party installation guide
or approve any real-account installation or update acceptance.

The Marketplace remains `skillpilot-marketplace`, with plugin name
`skillpilot-coach-v1` and the familiar title **SkillPilot Coach v1**. There is no
diagnostic version or timestamp in the catalog name. The canonical repository
URL remains `https://github.com/enpasos/skillpilot-claude-marketplace`.

The exact public direct-install index and artifact were verified on
9 September: version `1.1.2`, 55,266 bytes, SHA-256
`835c91844f950d9101f74ef245916fc6a7d65f53426ae3939f3a224f7ab827ca`.
The credential-free public synthetic passed all eight checks. These results
establish artifact availability and the checked public endpoints only.

The generated publication tree was merged in
[PR #4](https://github.com/enpasos/skillpilot-claude-marketplace/pull/4).
`verify-repository` passed at `2026-09-09T04:24:02.000Z` against the actual
public `main` branch:

- revision: `25bf4d8272030a3701008f7b5a09d4a18cba15c5`;
- closed publication inventory: 11 files;
- tree SHA-256: `690e57846a250b49bb8ac2ac30b5bda0f7f4c1eaf50edc3c8de2561e1b03da66`;
- exact 1.1.2 package parity, both strict CLI validations and installation from
  the actual HTTPS repository in an isolated profile: passed;
- [default-branch validation](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/34310773587): passed.

Only `public-repository-default-branch` is recorded as `pass`; the state is
`published_pending_acceptance`. Clean-account install, existing-account
migration/refresh, first-party guide approval and all other exact-client and
readiness decisions remain pending.

The Product Owner clarified that the reported 1.1.1 synchronization occurred
only after adding the repository URL with `?v=2`. This is a user-reported
workaround for that account, not proof that changing a catalog name triggers
automatic synchronization, nor a verified update route for 1.1.2. The canonical
URL and catalog identity are unchanged.

The six packaged files, both immutable 1.1.1 and 1.1.2 artifacts, and previous
release dossiers remain byte-identical. The packaged README and SETUP retain
their preparation-time wording because it belongs to the immutable artifact;
this runbook and the Marketplace-root README describe the later publication
state. The current `/plugins` guide continues to use download and upload, now
with the exact 1.1.2 artifact. No application deployment is part of this
Marketplace publication.

The exact authorization boundary is recorded in
[freeze appendix 6.70](openai-plugin-v1-review-freeze.md#670-claude-112-im-bestehenden-marketplace-veroffentlichen).

## Historical 1.1.2 local preparation, 8 September 2026

The Product Owner authorized only the compact daily summary, matching
Claude-only server instructions, tests and local patch preparation:
“Heute: 2 von 48 geschafft · noch offen: 19 Mathe, 27 Physik.” Mention backlog
only when present, for example “+ 5 überfällig”. The completed count remains the
currently mastered subset of today's due goals, not a same-day event log.
Warnings about unavailable plans remain explicit.

The current source manifests and locally prepared publication index name
1.1.2. The repository checker requires that index to match the current source
and deterministic package; it is not a record of deployment. The deployed
index, immutable 1.1.1 download and external Marketplace repository remain
unchanged until a separately authorized rollout. The 1.1.1 release dossier is
archived byte-for-byte under `release/history/1.1.1/`; its published repository
evidence and withdrawn guide decision are not transferred to the new candidate.

For 1.1.2, Marketplace state is `prepared_not_published`; repository, client,
migration and guide-decision evidence is `pending`. Direct-install external
acceptance and privacy evidence are also candidate-bound and pending. No
publication, deployment, account update, new support claim or Marketplace
promotion is authorized by this preparation. Do not run public verification
as an acceptance check before rollout: the public version intentionally differs.

## Historical first-party guide decision: download and upload, 8 September 2026

On **8 September 2026**, the Product Owner reported that the Marketplace path
still did not work reliably and explicitly requested the direct download and
upload instructions on `/plugins`. This decision supersedes the first-party
Marketplace recommendation recorded on 5 September; the publication and its
original evidence below remain historical facts.

The guide at that decision used the existing immutable **1.1.1** `.plugin` file only.
Download it from SkillPilot, remove only an older SkillPilot installation when
replacing it, upload the downloaded file in Claude, connect the plugin's bundled
SkillPilot connector, then return to SkillPilot and start a fresh chat. Other
plugins and connectors remain untouched. A separate manual MCP connection is
not part of the installation. Check the installed version in Claude against the
version shown beside the SkillPilot download; the page cannot read the plugin
version installed in the user's Claude account and does not promise automatic
updates for uploaded files.

`activation.firstPartyGuideDecision.status = withdrawn` retains every original
approval timestamp, approver, candidate digest, repository revision, tree digest
and evidence reference. The validator still checks those exact bindings. The
withdrawal sets `marketplaceUiSwitchAllowed = false` and
`firstPartyUiRoute = controlled_direct_install_beta`; it does not unpublish the
repository or change `published_pending_acceptance`. All repository, installation
and migration evidence, direct-install readiness blockers, published artifact
bytes and acceptance status remain unchanged. New Marketplace promotion would
need a new explicit decision and current matching evidence.

The authorization and its precise first-party boundary are recorded in
[freeze appendix 6.66](openai-plugin-v1-review-freeze.md#666-claude-installation-wieder-per-download-und-upload).

## Marketplace publication context

The canonical target is:

```text
https://github.com/enpasos/skillpilot-claude-marketplace
```

As long as
`ai/claude/plugin/skillpilot-coach-v1/release/marketplace-publication.json`
has `activation.state = prepared_not_published`, that repository is not a
supported installation source. The first-party `/plugins` page must keep every
Claude installation route unavailable for a new candidate until its exact direct-install or
Marketplace route is deliberately opened for testing. It must not offer 1.0.4
as a fallback. A Marketplace route additionally requires a verified repository
and a candidate- and revision-bound Product Owner approval in
`activation.firstPartyGuideDecision`. Local export success never changes either
state by itself. The current direct-install lane reports
`controlledBetaReady = false`, `guidedFirstPartyBetaReady = false` and
`openPublicBetaReady = false`; exact-candidate Web, Android and Voice
acceptance, privacy approval, legal approval, support readiness and
exact-client acceptance therefore remain blockers. The bounded first
repository publication may occur with exact-client acceptance still `pending`
so that acceptance can be performed through the Marketplace installation
itself, but only after the local, supply-chain and OpenAI-freeze checks below
and explicit Product Owner approval. Repository publication alone does not
make the Marketplace the first-party primary route. A separate controlled-beta
guide decision can do so without claiming that full public acceptance passed.

## Why this is a separate repository

Anthropic accepts a Git repository containing
`.claude-plugin/marketplace.json` as a personal marketplace. The SkillPilot
monorepo is unsuitable as that repository: its GitHub repository size is
currently several GiB, its default branch has no marketplace manifest at the
repository root, and Claude Web does not document a sparse-checkout option for
the personal **Add from a repository** flow. Exposing the complete application
repository would also broaden the publication surface far beyond the reviewed
plugin. The target repository is therefore a small generated publication tree.

The generator copies exactly the seven files in the existing `publicationFiles`
allowlist. It never copies package tests, builders, release evidence, learner
data, sessions, credentials, or other monorepo content. The exported files are
byte-identical to the direct-install candidate, whose version and SHA-256 are
bound in the marketplace lane.

## Corrected contract

- Marketplace name: `skillpilot-marketplace`
- Stable technical plugin name: `skillpilot-coach-v1`
- Current candidate version: `1.1.6` (Marketplace published; website promotion separately approved)
- Plugin source: `./plugins/skillpilot-coach-v1`
- Version authority:
  `plugins/skillpilot-coach-v1/.claude-plugin/plugin.json` only
- Current candidate SHA-256: the exact binding in
  `ai/claude/plugin/skillpilot-coach-v1/release/direct-install-beta.json`;
  earlier published bindings remain in their archived release dossiers.

Anthropic allows a marketplace entry name to differ from the embedded plugin
name. SkillPilot intentionally keeps the technical name equal, but Claude still
stores a marketplace-qualified installation record. That is why migration from
an uploaded copy remains explicit. No `version` is repeated in
`marketplace.json`.

## Historical 1.1.1 hard cutover

Version 1.1.1 fully replaces every earlier package. The public Marketplace
repository and the direct-install registry may retain old Git or immutable
artifact history, but first-party instructions, the current publication index
and acceptance runs must name only 1.1.1. Mixed 1.0.x/1.1.1 operation and
fallback to 1.0.4 are not accepted release modes. The Marketplace route remains
`prepared_not_published` until its exact 1.1.1 repository tree is published and
verified; its earlier 1.0.4 repository revision cannot satisfy that gate.

Version 1.0.3 established the historical pre-public correction
in which Claude decides only whether the current active goal is complete and
the backend persists the completion, selects the successor and returns its
canonical context. Version 1.0.4 preserves that API, tool schema, OAuth,
session and persistence contract while correcting its learner-facing
application. Version 1.1.1 preserves those rules and adds:

- At each normal start or resume, Claude first reports per-subject goals due
  today, the subset currently mastered, goals still open today, open backlog,
  and cross-subject totals from the authoritative `learningPlanToday` context.
- The current-mastery count is never described as an event log of work
  completed during that calendar day.
- Every valid subject plan contributes to the day. Unavailable plans produce a
  safe partial-data warning without plan or landscape identifiers.
- With no active goal, Claude calls
  `resume_skillpilot_learning_plan` only when the authoritative context says a
  candidate is available, and then continues the backend-selected goal without
  a Web-app **Weiterlernen** detour.
- The fourteenth connector-owned tool,
  `switch_skillpilot_learning_plan_subject`, switches only to an exact
  localized subject from the current daily-plan context. It parks an unfinished
  goal without mastery while every valid plan continues to count.

The retained 1.0.4 corrections were:

- Policy, instruction, tool-schema, parameter, retry and private-deliberation
  mechanics stay out of learner-facing text and speech.
- After the tailored orientation exchange, a clear start or continuation
  intent completes the orientation without another confirmation loop. Claude
  writes that completion immediately and continues only after the backend has
  confirmed it.
- Ordinary mastery feedback remains learner-facing, while an orientation
  transition is presented without mastery grading or internal bookkeeping.
- A topic used to personalize the current conversation is never described as a
  durable remembered preference; the current connector has no such memory
  feature.

The immutable 1.0.2, 1.0.3, 1.0.4 and 1.1.0 packages and their version-specific
evidence remain historical records. They are not overwritten, rebound to new
bytes, or promoted as a fallback. Every 1.1.1 exact-client, privacy,
Marketplace-repository, installation, migration and guide-decision record
starts at `pending`; no earlier approval transfers to the new candidate.

## Local preparation and validation

Inspect the worktree and preserve unrelated changes. Verify the retained
OpenAI review history and the current authorized successor package first:

```bash
node scripts/check_openai_plugin_review_freeze.mjs
node scripts/openai_plugin_release.mjs verify
node scripts/check_skillpilot_coach_plugin.mjs
node scripts/check_openai_plugin_versioning.mjs
```

For a new candidate version, store the deterministic package and its index
under `tmp/claude-direct-install-beta/`. Keep the served publication index and
approved guide on their published release throughout local development:

```bash
node scripts/claude_direct_install_beta_release.mjs prepare-candidate
node scripts/claude_direct_install_beta_release.mjs verify-candidate
node scripts/claude_direct_install_beta_release.mjs verify
```

On an authorized backend rollout, the build automatically packages the current
artifact and index as described above. Do not run `prepare` to manually advance
tracked runtime resources for an ordinary rollout; that command remains an
explicit source-registry maintenance operation. Marketplace publication is a
separate step. A changed guide route still requires its own release-bound
decision; preparation and archived approvals do not establish client acceptance.

Then run the marketplace checks and create the publication tree:

```bash
node --test scripts/claude_marketplace_release.test.mjs
node scripts/claude_marketplace_release.mjs check
node scripts/claude_marketplace_release.mjs prepare
node scripts/claude_marketplace_release.mjs validate-cli
node scripts/claude_marketplace_release.mjs smoke-local
```

The generated repository is written to:

```text
tmp/claude-marketplace/skillpilot-claude-marketplace
```

`check` uses a temporary directory and proves reproducibility without leaving
an export behind. `prepare` replaces only that exact generated default path;
it refuses to overwrite an arbitrary checkout. `validate-cli` deliberately
runs both required validations:

```bash
claude plugin validate --strict \
  tmp/claude-marketplace/skillpilot-claude-marketplace
claude plugin validate --strict \
  tmp/claude-marketplace/skillpilot-claude-marketplace/plugins/skillpilot-coach-v1
```

Validating only the marketplace root is insufficient because it does not
fully validate the embedded plugin's skills and related components.
`smoke-local` then adds and installs the plugin in a disposable
`CLAUDE_CONFIG_DIR`, verifies the installed version, enabled state and bundled
SkillPilot MCP endpoint, and removes the isolated profile. It does not modify
the operator's normal Claude configuration.

## Support readiness activation precondition

Follow the
[Claude support readiness runbook](claude-support-readiness-runbook.md) before
full public activation. The bounded repository publication and the separately
approved controlled-beta installation guide do not satisfy or bypass this
gate. Its public synthetic is credential-free
and read-only; run it before the repository publication and again for
activation. It checks the immutable direct-install publication, legal and
privacy pages, application readiness, connector OAuth discovery, and the
unauthenticated MCP challenge:

```bash
node --test scripts/claude_support_synthetic.test.mjs
node scripts/claude_support_synthetic.mjs verify
```

The committed drill file is only an incomplete template. Support readiness
remains blocked until accountable support, operations and security owners have
proved mailbox access, operation of the scheduled public synthetic, intentional
failed-run notification delivery, recorded Product Owner acceptance of the
best-effort monitoring boundary, and incident containment and recovery for the
exact candidate. This personal-marketplace beta has no host-side per-operation
email monitor and makes no real-time detection or SLA claim. A backup is
preferred; without one, the Product Owner must accept and rehearse the documented
single-owner promotion-pause contingency. A green synthetic alone does not
authorize a gate change or publication.

## First publication

Repository creation and pushing are explicit external publication actions.
They are intentionally not part of the normal application deploy and are not
performed by the exporter.

After the bounded local package, reproducibility, marketplace, public synthetic
and OpenAI-freeze checks pass, the Product Owner may explicitly
approve the first public repository publication while the candidate-specific
exact-client evidence is still `pending`. This is required to perform the
first exact-client acceptance through the Marketplace itself; it is not public
activation and does not authorize the first-party UI switch.

After that explicit approval:

1. Create the public repository `enpasos/skillpilot-claude-marketplace` with
   `main` as its default branch.
2. Protect `main`: require pull requests and the generated `Validate
   marketplace` workflow; disallow force pushes and branch deletion.
3. Copy the complete generated publication tree into a fresh checkout. Do not
   hand-edit generated plugin files in the target repository.
4. Review the closed file inventory, commit, and merge it atomically.
5. Verify the actual default branch from this source repository:

   ```bash
   node scripts/claude_marketplace_release.mjs verify-repository
   ```

   This command requires an authenticated GitHub CLI with read access to the
   repository.

   This first uses GitHub metadata to require the exact public repository and
   `main` as its real default branch. It then clones the configured HTTPS repository into a temporary directory,
   compares every allowed file with the canonical source, rejects extras and
   symlinks, rebuilds the bound `.plugin` candidate, runs both strict Claude
   validations, adds the actual HTTPS repository in an isolated Claude
   profile, installs the plugin, and reports the full Git revision. It fails if
   the remote default branch moves during that verification window.

6. In a separate revision-bound evidence change, record only the verified
   `public-repository-default-branch` item as `pass`. This derives
   `activation.state = published_pending_acceptance`; the other Marketplace
   evidence remains `pending`. Without a separate, candidate-bound
   `firstPartyGuideDecision`, `marketplaceUiSwitchAllowed` remains `false` and
   `firstPartyUiRoute` remains `controlled_direct_install_beta`.

Use the full HTTPS URL in end-user instructions. In Claude Code the
`owner/repository` shorthand can select SSH and therefore surprise users who
do not have GitHub SSH credentials.

## Historical 1.0.4 controlled-beta guide switch

After the 1.0.4 repository publication, the Product Owner confirmed on
**3 September 2026** that both controlled users had migrated from the uploaded
plugin to the exact Marketplace candidate. The Product Owner then explicitly
requested that the first-party installation guide use the Marketplace as the
recommended installation and update route.

That historical decision was recorded separately as
`activation.firstPartyGuideDecision`. It was bound to the 1.0.4 candidate
version and digest plus the verified repository revision and tree digest. It
does not authorize the 1.1.1 route.

The switch is deliberately narrower than full Marketplace acceptance:

- `activation.state` remains `published_pending_acceptance`;
- clean-account installation and migration/refresh evidence remain `pending`;
- direct-install legal, support, and exact-client blockers remain `pending`;
- `openPublicBetaReady` remains `false`;
- the then-current direct `.plugin` download remained a labelled fallback; and
- no Anthropic-curated, Anthropic-verified, or generally released status is
  claimed.

For each replacement candidate, that historical guide decision is reset to
`pending` until a new exact-candidate decision and verified repository exist.
Neither the historical Marketplace install nor the 1.0.4 direct download may
be offered as an available fallback.

## Historical 1.1.1 publication and controlled-beta update route

On **5 September 2026**, the Product Owner explicitly required updates through
the Marketplace and merged [publication PR #2](https://github.com/enpasos/skillpilot-claude-marketplace/pull/2).
The public default branch was subsequently verified with
`node scripts/claude_marketplace_release.mjs verify-repository`:

- revision: `5cc7aba22ddf90ab8273cd6c15b71e8186781fc3`;
- closed publication inventory: 11 files;
- tree SHA-256: `8c6c67b46763224d901a65b35408dad7752f6c7db08203fd38cf0f568a74c5d3`;
- version: `1.1.1`, byte-identical to the bound immutable plugin artifact;
- strict Marketplace and plugin validation plus isolated Git-source install:
  passed; [default-branch validation](https://github.com/enpasos/skillpilot-claude-marketplace/actions/runs/33950192311)
  passed as well.

Only `public-repository-default-branch` is recorded as `pass`. The separately
approved first-party guide decision binds this exact candidate, revision and
tree. The guide directs installation and updates through the Marketplace and
does not expose a file-upload alternative. The user's Claude Web screenshots
show no Update action on the installed 1.0.4 plugin. They do show this route:
**Hinzufügen → Marketplace hinzufügen → Aus einem Repository hinzufügen**,
the existing public repository URL, an enabled **Automatisch synchronisieren**
switch and a **Synchronisieren** button. The dialog describes automatic sync
as keeping plugins current when the GitHub repository changes. These are the
observed German labels; English guide labels are translations, not a separately
verified English-client observation.

The subsequent screenshot after pressing **Synchronisieren** reports
**Dieser Marketplace wurde bereits hinzugefügt.** This route adds a source;
it did not refresh the existing source in this account. Keep the observed
synchronization steps for new installations only. An existing-account manual
refresh route in this Web UI is not yet verified and must not be presented as
working. Check the installed plugin details for 1.1.1 before starting a new
session from SkillPilot. The resulting installed version and absence of
duplicate installations still need real-client confirmation. Do not prescribe
an unobserved Update button, delete the existing installation or claim a
completed acceptance run.

`activation.state` remains `published_pending_acceptance`. Clean-account
installation, real-account migration/refresh, Web/Android/Voice, privacy,
legal and support acceptance remain pending; `openPublicBetaReady` stays false.
The exact guide-only authorization is documented in
[the OpenAI review-freeze exception](openai-plugin-v1-review-freeze.md#651-eng-begrenzte-ausnahme-claude-111-marketplace-veroeffentlichung-und-updateanleitung).

## Real-client acceptance and activation

The generated workflow and remote byte check prove supply-chain integrity;
they do not prove the user journey. Record all of this against the exact remote
revision before activation:

1. On a clean eligible paid Claude web account, open **Plugins → Discover →
   Add (top right) → Add marketplace → Add from a repository** and add the
   now-public canonical repository URL. The observed deep link above is an
   optional navigation shortcut, not an install or synchronization action.
2. Confirm that exactly one `SkillPilot Coach v1` entry appears and install it.
3. Connect the bundled SkillPilot connector through its normal OAuth flow. Do
   not add a second custom connector or enter the MCP URL manually.
4. Return to `https://skillpilot.com/` and start a new learning session through
   the established first-party handoff.
5. Confirm that the initial response quotes the backend's
   `learningPlanToday.text` verbatim and identically to the SkillPilot cockpit:
   one line per subject with its daily or weekly target and any backlog or work
   ahead, without own counts, totals or judgement. The active learning goal must
   be announced separately and only once, when teaching begins, and not after a
   status-only question. Check both the day and the week basis. Completing an older due
   goal must count toward that subject's period target; work ahead in one
   subject must not offset backlog in another. A day without a target must not
   be described as completed required work.
   Prove that an unevaluable plan is named in the text and produces no plan or
   landscape identifier. The status must rest on backend completion evidence,
   not on an inferred completion date from a mastery snapshot.
6. With no active goal, prove that Claude calls
   `resume_skillpilot_learning_plan` automatically only when `resumeAvailable`
   is true and guidance is `resume`, uses
   the returned canonical context and continues the backend-selected goal
   without asking for the Web-app **Weiterlernen** button. Also prove that no
   resume call occurs when the flag is false. With guidance `complete`, further
   continuation requires an explicit request for voluntary extra work.
7. Exercise the intended coaching flow and both interactive MCP Apps on every
   surface that SkillPilot intends to advertise. Anthropic's technical
   availability is not SkillPilot acceptance evidence.
8. Ask Claude to switch from Mathematics to Physics and back. Prove that it
   copies only exact localized subject names from the current daily-plan
   context, parks unfinished work without mastery, continues the backend-selected
   due goal without confirmation and never submits a plan, landscape, focus or
   goal ID.
9. In Claude Web, engage with one tailored orientation follow-up and then say
   `Machen wir so, dann fangen wir einfach an.` Prove that this clear start
   intent is persisted as orientation completion without another confirmation
   loop and that the next active goal is exactly the backend-selected successor
   returned in the canonical mastery response. Confirm that no policy,
   instruction, private-deliberation, lazy-loading, schema, parameter or retry
   mechanics are narrated and that no durable anchor-memory promise is made.
10. Repeat the complete scenario and every assertion independently in native
   Claude Android Voice mode. A conversational statement that the goal was
   saved or a visually plausible next goal is not sufficient evidence.
   Also cover “jetzt Physik”, “zurück zu Mathe”, a status-only request,
   updated per-subject progress after Verified Recall, the final daily goal,
   and paused or blocked plans. The final daily goal must lead to a clear
   completion message; a generic focus menu must not replace the active plan.
11. Test migration from the previously uploaded plugin: remove only the old
   SkillPilot plugin, add the marketplace, install once, reconnect if Claude
   asks, and verify a new SkillPilot-started session.
12. Use **Add (top right) → Manage marketplaces → ⋮ at the SkillPilot source →
   Check for updates** and confirm that migration and refresh do not require
   another file upload. Check catalog, installed version, connection and a new
   SkillPilot-started session separately. A real version-to-version update is a
   mandatory release gate beginning with the next Marketplace version; verify
   two consecutive real updates for the repeatability claim. The fallback does
   not turn an unsuccessful Marketplace update into a passed Marketplace test.

Only after the public repository, clean-account installation,
upload-to-marketplace migration/refresh, candidate-specific Web and Android
Voice acceptance, and every remaining direct-install activation blocker are
approved may a separate Product Owner change set mark all remaining evidence
objects `pass`. The earlier controlled-beta guide decision is not evidence for
any of those checks. Every Marketplace pass record requires the same 40-character
remote revision, a canonical UTC timestamp, the exported tree SHA-256, the
current candidate version and direct-install SHA-256, and a non-empty evidence
reference. Stale evidence therefore becomes invalid when either candidate or
remote tree changes. Only then may that change set derive the activation fields
as:

```json
{
  "state": "published_verified",
  "firstPartyUiRoute": "personal_git_marketplace",
  "marketplaceUiSwitchAllowed": true
}
```

Only a new exact-candidate decision may make the first-party `/plugins` guide
Marketplace-first. It must preserve the scoped cleanup, connector OAuth, and
return-to-SkillPilot steps. No 1.0.4 direct-download fallback is permitted.
The former OpenAI review freeze is retired; no new review-time hash exception
is required. Claude candidate and guide acceptance remain independent gates.

## Subsequent releases

For any plugin-content change:

1. make and review the plugin change in the canonical SkillPilot repository;
2. increment `plugin.json` SemVer in the same change (`1.1.2` becomes at least
   `1.1.3`);
3. rebuild and bind a new direct-install artifact; never rebind an existing
   version to new bytes;
4. update the marketplace lane's version and direct-install SHA-256, create or
   rebind every candidate- or revision-bound evidence record as `pending`, and
   reject stale evidence. Reusable generic controlled-beta capability
   observations may remain `pass` only while their capability and preconditions
   are unchanged; rerun the current local package, archive and setup checks
   before retaining those local results;
5. update `CHANGELOG.md`;
6. run all local checks above and prepare a new tree;
7. only after separate publication authorization, publish through a
   target-repository pull request;
8. run `verify-repository` after merge;
9. test the real marketplace update from the previous installed version; this
   is mandatory for every release after the first Marketplace publication.

Third-party marketplace updates must be treated as manual unless the tested
Claude client proves otherwise. In Claude Code the explicit diagnostic path is:

```text
/plugin marketplace update skillpilot-marketplace
/plugin update skillpilot-coach-v1@skillpilot-marketplace
```

Rollback is a new, higher SemVer release that restores reviewed content. Never
force-push `main`, delete history, or reuse an old version with different
bytes. Connector containment and recovery follow the
[support readiness and incident runbook](claude-support-readiness-runbook.md),
including retained OpenAI historical integrity and candidate-bound evidence.

## References

- [Claude support readiness and incident runbook](claude-support-readiness-runbook.md)
- [Use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude)
- [Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
- [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins)
- [Install plugins in Cowork](https://claude.com/docs/cowork/guide/plugins)

# SkillPilot Claude personal marketplace release

This runbook governs the repository-backed personal marketplace for
`skillpilot-coach-v1`. It distributes one exact Claude plugin candidate; the
marketplace mechanism itself does not alter that candidate. It is not an
Anthropic-curated or Anthropic-verified listing. Version 1.1.3 is the current
published personal Marketplace package. The previously published 1.1.2 package
and its evidence remain immutable history.

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

The generator copies exactly the six files in the existing `publicationFiles`
allowlist. It never copies package tests, builders, release evidence, learner
data, sessions, credentials, or other monorepo content. The exported files are
byte-identical to the direct-install candidate, whose version and SHA-256 are
bound in the marketplace lane.

## Corrected contract

- Marketplace name: `skillpilot-marketplace`
- Stable technical plugin name: `skillpilot-coach-v1`
- Current candidate version: `1.1.3`
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

For a new candidate version, store the deterministic package additively and
then verify the resulting publication index. `verify` alone is expected to
fail before this first `prepare`, because the index still names the preceding
candidate:

```bash
node scripts/claude_direct_install_beta_release.mjs prepare
node scripts/claude_direct_install_beta_release.mjs verify
```

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
5. Confirm that the initial response gives one compact daily summary with
   actual completions today credited toward each subject's fixed daily quota
   and the remaining count for every subject. Completing an older due goal
   must count toward that subject's quota; extra work must be acknowledged
   separately without filling another subject's quota. Show remaining backlog
   only on an explicit detail request, not as a routine reminder. A zero-quota
   day must not be described as completed required work.
   Prove that an unavailable plan produces only the safe partial-data warning
   and no plan or landscape identifier. Counts must come from backend completion
   evidence, not an inferred completion date from a mastery snapshot.
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

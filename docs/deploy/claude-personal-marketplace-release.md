# SkillPilot Claude personal marketplace release

This runbook governs the repository-backed personal marketplace for
`skillpilot-coach-v1`. It distributes one exact Claude plugin candidate; the
marketplace mechanism itself does not alter that candidate. It is not an
Anthropic-curated or Anthropic-verified listing. Version 1.1.1 is the sole
current replacement candidate. It adds plan-first multi-subject daily guidance
and automatic backend-authorized plan resume without changing the frozen
OpenAI v1 lane. Version 1.0.4 and its evidence remain historical records only;
they are not a supported installation or rollback fallback.

The canonical target is:

```text
https://github.com/enpasos/skillpilot-claude-marketplace
```

As long as
`ai/claude/plugin/skillpilot-coach-v1/release/marketplace-publication.json`
has `activation.state = prepared_not_published`, that repository is not a
supported installation source. The first-party `/plugins` page must keep every
Claude installation route unavailable until the exact 1.1.1 direct-install or
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
- Current candidate version: `1.1.1`
- Plugin source: `./plugins/skillpilot-coach-v1`
- Version authority:
  `plugins/skillpilot-coach-v1/.claude-plugin/plugin.json` only
- Current direct-install SHA-256:
  `b4bfa8122812bf1ad0430e6b02932b89e29b107c7a831cebf994da010c359351`

Anthropic allows a marketplace entry name to differ from the embedded plugin
name. SkillPilot intentionally keeps the technical name equal, but Claude still
stores a marketplace-qualified installation record. That is why migration from
an uploaded copy remains explicit. No `version` is repeated in
`marketplace.json`.

## 1.1.1 hard cutover

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

Start with a clean worktree and run the frozen OpenAI checks first:

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

For 1.1.1 the guide decision is reset to `pending`, the route is
`controlled_direct_install_beta`, and `marketplaceUiSwitchAllowed` is `false`.
Until a new exact-candidate decision and verified repository exist, the
first-party guide must expose neither the historical Marketplace install nor
the 1.0.4 direct download as an available fallback.

## Real-client acceptance and activation

The generated workflow and remote byte check prove supply-chain integrity;
they do not prove the user journey. Record all of this against the exact remote
revision before activation:

1. On a clean eligible paid Claude account, add the now-public repository under
   **Customize → Plugins → Personal plugins → + → Add marketplace → Add from a
   repository**.
2. Confirm that exactly one `SkillPilot Coach v1` entry appears and install it.
3. Connect the bundled SkillPilot connector through its normal OAuth flow. Do
   not add a second custom connector or enter the MCP URL manually.
4. Return to `https://skillpilot.com/` and start a new learning session through
   the established first-party handoff.
5. Confirm that the initial response reports every valid subject plan with
   today-due, currently mastered, still-open and overdue counts plus totals.
   Prove that an unavailable plan produces only the safe partial-data warning
   and no plan or landscape identifier, and that the mastered-today figure is
   not described as a same-day event log.
6. With no active goal, prove that Claude calls
   `resume_skillpilot_learning_plan` only when `resumeAvailable` is true, uses
   the returned canonical context and continues the backend-selected goal
   without asking for the Web-app **Weiterlernen** button. Also prove that no
   resume call occurs when the flag is false.
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
12. Refresh the marketplace in Claude and confirm that migration and refresh do
   not require another file upload. A real version-to-version update becomes a
   mandatory release gate beginning with the next Marketplace version.

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

Only a new 1.1.1 decision may make the first-party `/plugins` guide
Marketplace-first. It must preserve the scoped cleanup, connector OAuth, and
return-to-SkillPilot steps. No 1.0.4 direct-download fallback is permitted.
Because those WebGUI files are hash-bound by the active OpenAI review freeze,
the UI change also needs a narrow Product Owner exception and updated freeze
hashes.

## Subsequent releases

For any plugin-content change:

1. make and review the plugin change in the canonical SkillPilot repository;
2. increment `plugin.json` SemVer in the same change (`1.1.1` becomes at least
   `1.1.2`);
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
7. publish through a target-repository pull request;
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
including the frozen OpenAI differential and candidate-bound evidence.

## References

- [Claude support readiness and incident runbook](claude-support-readiness-runbook.md)
- [Use plugins in Claude](https://support.claude.com/en/articles/13837440-use-plugins-in-claude)
- [Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
- [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins)
- [Install plugins in Cowork](https://claude.com/docs/cowork/guide/plugins)

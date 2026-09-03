# SkillPilot Claude personal marketplace release

This runbook governs the repository-backed personal marketplace for
`skillpilot-coach-v1`. It distributes one exact Claude plugin candidate; the
marketplace mechanism itself does not alter that candidate. It is not an
Anthropic-curated or Anthropic-verified listing. The current 1.0.3 candidate
intentionally changes the still-pre-public 1.0.2 coaching and mastery-tool
contract as described below, without changing the frozen OpenAI v1 lane.

The canonical target is:

```text
https://github.com/enpasos/skillpilot-claude-marketplace
```

As long as
`ai/claude/plugin/skillpilot-coach-v1/release/marketplace-publication.json`
has `activation.state = prepared_not_published`, that repository is not a
supported installation source. The first-party `/plugins` page must continue
to use the controlled direct-install beta. Local export success never changes
that state by itself. The current direct-install lane still reports
`openPublicBetaReady = false`; legal approval, support readiness and
exact-client acceptance therefore remain publication blockers. Privacy approval
is already recorded as `pass` for the current candidate.

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
- Current candidate version: `1.0.3`
- Plugin source: `./plugins/skillpilot-coach-v1`
- Version authority:
  `plugins/skillpilot-coach-v1/.claude-plugin/plugin.json` only
- Current direct-install SHA-256:
  `659ceaa95f0432541cd7323f6dbfdc58da81cea2c9d7778bf39ee6aaab9f121e`

Anthropic allows a marketplace entry name to differ from the embedded plugin
name. SkillPilot intentionally keeps the technical name equal, but Claude still
stores a marketplace-qualified installation record. That is why migration from
an uploaded copy remains explicit. No `version` is repeated in
`marketplace.json`.

## Pre-public 1.0.3 hard cutover

Version 1.0.3 is the intended first Marketplace publication. Version 1.0.2 was
used only by two controlled users and was never published through this
Marketplace. Both controlled installations must therefore be replaced with
the exact 1.0.3 candidate and exercised from fresh SkillPilot learning contexts;
mixed 1.0.2/1.0.3 operation is not an accepted compatibility mode.

This is an intentionally incompatible pre-public contract correction:

- Claude decides only whether the current active goal is complete.
- The mastery tool no longer accepts a model-selected orientation path or next
  goal.
- The backend persists the completion, selects the successor and returns the
  canonical context that Claude must continue with.

The immutable 1.0.2 package and its 1.0.2 evidence remain historical records.
They are not overwritten, rebound to new bytes, or promoted as a fallback.
The candidate-specific 1.0.3 exact-client evidence starts at `pending` even
though generic controlled-beta observations remain valid.

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

## Support readiness precondition

Follow the
[Claude support readiness runbook](claude-support-readiness-runbook.md) before
first publication. Its public synthetic is credential-free and read-only; it
checks the immutable direct-install publication, legal and privacy pages,
application readiness, connector OAuth discovery, and the unauthenticated MCP
challenge:

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

Only after Product Owner approval and after every open-public-beta blocker in
`release/direct-install-beta.json` has status `pass`:

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

Use the full HTTPS URL in end-user instructions. In Claude Code the
`owner/repository` shorthand can select SSH and therefore surprise users who
do not have GitHub SSH credentials.

## Real-client acceptance and activation

The generated workflow and remote byte check prove supply-chain integrity;
they do not prove the user journey. Record all of this against the exact remote
revision before activation:

1. On a clean eligible paid Claude account, add the repository under
   **Customize → Plugins → Personal plugins → + → Add marketplace → Add from a
   repository**.
2. Confirm that exactly one `SkillPilot Coach v1` entry appears and install it.
3. Connect the bundled SkillPilot connector through its normal OAuth flow. Do
   not add a second custom connector or enter the MCP URL manually.
4. Return to `https://skillpilot.com/` and start a new learning session through
   the established first-party handoff.
5. Exercise the intended coaching flow and both interactive MCP Apps on every
   surface that SkillPilot intends to advertise. Anthropic's technical
   availability is not SkillPilot acceptance evidence.
6. In Claude Web, complete an active goal and independently prove both that the
   completion was persisted and that the next active goal is exactly the
   backend-selected successor returned in the canonical mastery response.
7. Repeat both proofs in native Claude Android Voice mode. A conversational
   statement that the goal was saved or a visually plausible next goal is not
   sufficient evidence.
8. Test migration from the previously uploaded plugin: remove only the old
   SkillPilot plugin, add the marketplace, install once, reconnect if Claude
   asks, and verify a new SkillPilot-started session.
9. Refresh the marketplace in Claude and confirm that migration and refresh do
   not require another file upload. A real version-to-version update becomes a
   mandatory release gate beginning with the next Marketplace version.

Only after the public repository, clean-account installation, and
upload-to-marketplace migration/refresh evidence are all approved may a
separate Product Owner change set mark each evidence object `pass`. Every pass
record requires the same 40-character remote revision, a canonical UTC
timestamp, the exported tree SHA-256, the current candidate version and
direct-install SHA-256, and a non-empty evidence reference. Stale evidence
therefore becomes invalid when either candidate or remote tree changes. Only
then may that change set derive the activation fields as:

```json
{
  "state": "published_verified",
  "firstPartyUiRoute": "personal_git_marketplace",
  "marketplaceUiSwitchAllowed": true
}
```

That later change may update the first-party `/plugins` guide to make the
marketplace primary. It must preserve the existing scoped cleanup, connector
OAuth, and return-to-SkillPilot steps. The direct-download route should remain
an explicitly labelled fallback during migration. Because those WebGUI files
are hash-bound by the active OpenAI review freeze, the UI change also needs a
narrow Product Owner exception and updated freeze hashes; this publication
preparation does not grant that exception.

## Subsequent releases

For any plugin-content change:

1. make and review the plugin change in the canonical SkillPilot repository;
2. increment `plugin.json` SemVer in the same change (`1.0.3` becomes at least
   `1.0.4`);
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

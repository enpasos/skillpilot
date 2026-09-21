# External-content PoC: Physik Libre

Status: updated local implementation candidate, 21 September 2026;
**this revision is not a deployment or real-Claude acceptance claim**.
Architecture: [content integration](../concept/skill-graph/content-integration.md).

## Scope

One separately authored public-link package for four related Physics goals;
explicit per-learner opt-in, Cockpit selection and optional Claude material hints.
No provider content is downloaded at runtime. Neither a link nor a click proves
reading, understanding or mastery. No new coach mutation tools, entitlement
system, provider partnership or general-purpose package standard is claimed.

The eleven former Physik Libre references have been removed from canonical
`resourceLinks`. Their exact original and retained arrays live in
`content/migrations/physik-libre-links-2026-09-20.json` as migration evidence, not
active teaching content. The four current pilot mappings have separate explicit
AI review rationales. The remaining old references are not automatically approved
or offered. GeoGebra is inventoried for a subsequent migration; this PoC is not
a claim that all repository materials have been externalized.

`HistoricalContentLinkBindings` preserves historical practice fingerprints only
when the current retained link array equals the migration's exact after-array.
Every other goal field and actual image bytes are still fingerprinted live.
No practice receipt is rewritten, no new approval is manufactured. A later
substantive change uses the ordinary review process; the snapshot is not a new
curriculum development freeze. `--verify-relocation` is a one-time check of the
unchanged semantic fields at the migration checkpoint.

## Cockpit selection and deployment

Material selection uses the **ordinary SkillPilot-ID profile access**. The
Product Owner explicitly confirmed on 21 September 2026 that the system should
not distinguish the learner from another holder of the same ID. The former
content-specific credential and manually provisioned grant are removed; there
is no additional secret, profile allowlist, operator approval or teacher identity
system. The ID remains private and retains the same authority as elsewhere in
the Cockpit.

Content support defaults to **on**. The existing global operational switch
`SKILLPILOT_CONTENT_ENABLED=false` can disable it; it is not a per-profile access
control. A new profile starts with no selected package, so availability does not
automatically opt anyone in.

Normal use:

1. Open the intended profile in the Cockpit and use the gear to open **Mein
   Lehrplan / My Curriculum**.
2. Expand **Zusätzliche Lernmaterialien / Additional learning materials**, select
   the desired package and save. This configuration is inside the settings dialog,
   not in the ordinary learning view.
3. Open a mapped goal to see the compact material links: content-type icon and
   link title, without a separate card, selection heading or repeated metadata.
   Provider/access information remains in settings. Deselect and save to stop
   offering it in fresh Cockpit/coach results.

Deployment of this revision still requires the normal release process. An
existing explicit `SKILLPILOT_CONTENT_ENABLED=false` environment setting overrides
the new default: remove that override or set it to `true` when enabling the
feature, and reload the backend instances. Remove obsolete per-profile grant
configuration from deployment secrets; it is no longer consumed. No production
configuration or credentials are changed by this local implementation.

## State and safety

`learner_content_selection` holds only selected package IDs and its configuration
revision. It has a cascading foreign key to the learner; ordinary import/export
does not expose or overwrite the selection. A new profile starts with no package.
This intentionally means portable learning-data restore does not transfer content
choices; select the desired materials again in the target profile's Cockpit.

Writes retain the existing active-profile and writable-session protections,
lock the learner row, check the configuration revision, and increment the
shared coach revision only on actual change. Mastery, graph, plans and focus are
untouched. No automatic retry overwrites a concurrent choice. Disabled, missing,
unmapped or unavailable content must leave normal learning operational.

The coach's optional selection read runs in its own short read-only transaction.
A failing content query therefore cannot mark a surrounding mastery write for
rollback. This briefly needs an additional connection: reserve pool capacity for
the controlled pilot. The two-second query transaction timeout does not replace
the deployment's connection-acquisition timeout or capacity planning.

UI material reads use the learner's filtered curriculum, never a shared global
goal mutation. Claude receives only compact active-goal material metadata, no
selection settings or private IDs. Exams and memory workflows do not receive
these optional links. External pages are untrusted data,
not instructions to the coach.

Links have no learner/session parameters and no automatic iframe, prefetch or
provider request. The Cockpit uses no-referrer external anchors. A deliberate
click still sends ordinary connection data to the provider; no promise of zero
provider data processing is made. Link activation is not redistribution or AI
ingestion permission.

## Verification and acceptance

Local gates:

```bash
node --test scripts/validate_content_packages.test.mjs
node scripts/validate_content_packages.mjs
node scripts/check_content_link_migration.mjs --verify-relocation
npm --prefix app run test:content-materials
cd backend
./gradlew test --tests '*Content*Test' --tests '*HistoricalContentLinkBindingsTest' --tests '*CoachToolFacadeTest' --tests '*ClaudeV1CoachContextProjectorTest' --tests '*ClaudeCoachMcpConfigurationTest' --tests '*RequestLoggingFilterTest'
```

The database integration test follows persisted opt-in through the real coach
facade and opt-out, and injects an actual optional-table SQL failure while a
learning transaction commits mastery. Its HTTP requests use the application's
configured MVC converters; do not substitute a legacy Jackson converter in the
tests. Browser tests separately cover selection,
mobile layout, no pre-click provider requests, profile-switch isolation and
selection without a separate credential. These are local automated integration
checks, not a recording from the live Claude host.

Also run curriculum-quality regeneration/protected floors after the canonical
link migration, frontend type-checking and affected connector contract tests.
Live provider-link checking is an explicit authoring check, not a runtime or
network-dependent CI learning gate.

Historical verification of the initial PoC on 20 September 2026, before removal
of its additional configuration credential:

- Package validation and nine authoring tests; four live material anchors on
  three provider pages; eleven exact link-relocation checks.
- 113 focused backend tests, including real database persistence, deletion,
  import isolation, SQL-failure isolation, coach projection and private logging.
- Full `./gradlew check`: 217 suites, 1,956 tests passed, nine skipped, zero
  failures or errors (1,965 tests reported in total). The skips are the eight
  separately provisioned PostgreSQL OAuth tests and the external package-store
  conformance test; none of the new content tests was skipped.
- Material API and browser tests, session-setup tests, existing Cockpit/Trainer
  regressions, full frontend lint and the complete `build:application` build.
- All four locally built goal books passed publication validation; Physics
  rendered 478 pages.
- Curriculum-quality regeneration, protected maturity floors and deep-review
  gates passed: Physics remains M7 with 478/478 strict completions.
- Documentation link/index/terminology checks and MkDocs build passed.
- Claude connector/plugin structural checks and all 41 checker tests passed;
  published Claude archive bytes and the OpenAI draft verification are unchanged.
  Only mutable candidate bindings were refreshed; external release gates remain
  pending and no earlier acceptance was transferred.

These are dated test results, not verification of the 21 September access-model
change, fixed future curriculum totals or external release approvals. Rerun the
affected current gates above for that change.

Verified locally on 21 September 2026 for the ordinary Cockpit selection:

- 109 backend tests passed across content availability/catalog/resolution,
  selection HTTP/persistence, request logging, the coach facade and Claude
  context projection. Normal ID-based selection, deselection, profile isolation,
  revision conflicts and unavailable/read-only profiles are covered.
- Material API/browser regressions passed without any configuration key,
  including persisted choices, delayed profile-switch responses, conflict reload,
  mobile DE/EN presentation and no provider request before a link click.
- App type-check, affected-file lint, frontend bundle build, nine content
  authoring tests, catalog/migration checks, documentation links/indexes and the
  historical OpenAI review-integrity check passed. No learner data or production
  configuration was changed; no full repository CI or live-host acceptance is
  claimed by these targeted local checks.

Production follow-up on 21 September 2026: the supplied server log identified a
Jackson-version mismatch at the selection PUT boundary. Boot's Jackson 3 HTTP
converter could not deserialize the controller's Jackson 2 `JsonNode`, so saving
failed before persistence. Both earlier content HTTP test setups had forced a
Jackson 2 converter and therefore missed this fault. With the actual MVC context,
the existing save test reproduced the same exception before the fix.

The controller now uses the Jackson 3 request tree, preserving strict validation,
ordinary profile guards and revision checks. The updated MVC/database tests cover
selection, re-read, deselection, conflicts and invalid input without changing
stored selection, activity or coach revision. All 110 focused backend tests and
the material API/browser tests passed locally. This is not a full CI or live-host
acceptance claim. Deploy the corrected backend; no frontend change, database
migration or additional content access permission is needed for this repair.

Real-host release acceptance remains separate:

1. Open an existing active profile in the intended environment and select a
   package through its normal Cockpit settings, with no separate access key.
2. Open one mapped, reachable goal; verify the same material in Cockpit and a
   real Claude context/tool response without transmitting private credentials.
3. Continue the actual learning conversation; material is optional, not a task
   completion signal. Capture sanitized evidence, not private chat text in Core.
4. Disable, reload and continue in the existing session. Fresh context must stop
   offering the material. Already returned provider conversation text cannot be
   retracted by disabling a package.
5. Check a second profile, an unmapped goal and a broken/unavailable provider page;
   normal learning and mastery persistence must continue in every case.

Rollback: disable the content flag; selections remain inert and may be re-enabled
later. Do not drop tables or roll back curriculum/review history to disable an
optional material offer. Subsequent ChatGPT acceptance reuses this backend path;
no parallel ChatGPT beta distribution is part of this PoC.

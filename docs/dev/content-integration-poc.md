# External-content PoC: Physik Libre

Status: local implementation candidate; **not deployed and not real-Claude acceptance**.
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

## Authorization and activation

Default is **off** (`SKILLPILOT_CONTENT_ENABLED=false`). Backend support being
installed neither enables the feature nor grants permission to a learner.

The existing permanent SkillPilot ID is a broad capability and cannot distinguish
a learner from a teacher holding a copy. The PoC therefore uses a **separate,
profile-bound material-configuration capability**, provisioned offline by an
operator after independently confirming the intended recipient. Knowledge of the
ID alone must never trigger provisioning. This scoped grant is not proof of
general account ownership and is not a new teacher delegation platform.

- Generate 32 cryptographically random bytes, encode as unpadded base64url
  (43 characters); hash that encoded token with SHA-256.
- Put only the learner-ID-to-lowercase-hash mapping in private deployment
  configuration `SKILLPILOT_CONTENT_CONFIGURATION_GRANTS_JSON` (JSON object).
  Both the profile IDs and hash mapping are private; never commit them.
- Deliver the original capability separately through the confirmed channel.
  Never put it in a URL, chat, curriculum file, screenshot, issue or public log.
- Enable `SKILLPILOT_CONTENT_ENABLED=true` only in the intended pilot environment.
  The optional catalog then appears in the normal learner Cockpit, not Trainer.
- The user enters the capability in the protected configuration field. It is
  kept only in component memory, cleared after saving/closing/profile changes,
  and sent solely as `X-SkillPilot-Content-Capability` on the explicit save.
- Configure reverse proxies/APM not to record this header (as for Authorization).
- Remove or replace the hash mapping and reload **all** backend instances to
  revoke/rotate a grant. There is no browser claim, issuance or reset endpoint.

This manual provisioning is appropriate for a controlled PoC, not a self-service
mass rollout. No production credentials or settings were changed by implementation.
Existing ID-only permissions elsewhere remain unchanged. A copied grant can be
used by its bearer; the system does not infer a person's identity from it.

## State and safety

`learner_content_selection` holds only selected package IDs and its configuration
revision. It has a cascading foreign key to the learner; ordinary import/export
does not expose or overwrite the selection. A new profile starts with no package.
This intentionally means portable learning-data restore does not transfer content
choices or credentials; opt in again under the target profile's grant.

Writes lock the learner row, check the configuration revision, and increment the
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
selection settings, private IDs or configuration grants. Exams and memory
workflows do not receive these optional links. External pages are untrusted data,
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
learning transaction commits mastery. Browser tests separately cover selection,
mobile layout, no pre-click provider requests and credential cleanup. These are
local automated integration checks, not a recording from the live Claude host.

Also run curriculum-quality regeneration/protected floors after the canonical
link migration, frontend type-checking and affected connector contract tests.
Live provider-link checking is an explicit authoring check, not a runtime or
network-dependent CI learning gate.

Verified locally on 20 September 2026:

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

These are dated test results, not fixed future curriculum totals or external
release approvals.

Real-host release acceptance remains separate:

1. Provision a confirmed pilot profile in the intended environment and opt in.
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

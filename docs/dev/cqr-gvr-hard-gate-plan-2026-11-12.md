# CQR and GVR Gates: Work Plan to `HARD`

Snapshot: 12 November 2026; delivery record updated 13 November. Status:
bounded implementation delivered in [PR #131](https://github.com/enpasos/skillpilot/pull/131),
head `39fe19b658`, based on `38b1080130`, subsequently merged as `dcf5278881`.
Its complete PR CI passed; subsequent main `2129b207f4` passed complete
[CI #2315](https://github.com/enpasos/skillpilot/actions/runs/43398052180).
Section 9 records the exact verification scope and later main changes.
The bounded main delivery is complete; the two broader target gaps remain open. The owner
authorized plan review, necessary adjustments, autonomous implementation and
PR creation. The execution choices in section 4 apply; merge and publication
are separate operations.

This document retains the original work packages and their delivery evidence.
The implementation replaced indirect enforcement with direct gates in the
declared domains and retired two redundant codes. The delivered legend has
22 `HARD` and 2 `PARTIAL` codes. The remaining evidence gaps (`CQR-104`,
`GVR-012`) require broader curriculum work; they are not part of the completed
bounded hardening.

Related material:

- Register source: `docs/concept/skill-graph/source/rules-and-gates.json`
  (`gatesOverview.rows` is the code legend; `ampelSection` defines the
  traffic-light states). Rendered as
  [Rule-to-Milestone Matrix](../qa-ci/graph-definition-rule-milestone-matrix.md).
- Predecessor work: [Transitive Minimalität: Lieferplan nach main](transitive-minimality-main-delivery-plan-2026-11-07.md).
- Standing rules: `AGENTS.md` (authoritative), `CLAUDE.md`.

## 1. Outcome

The initial code legend listed 8 `GVR` and 18 `CQR` codes. At that baseline, 5 `GVR` codes were
`HARD`; `GVR-006`, `GVR-012`, `GVR-013` and all 18 `CQR` codes were `PARTIAL`.

The bounded implementation is complete: the executable portions of the work
packages were delivered in a PR with terminal green remote CI and
integrated into main, with subsequent green integration CI. Unfulfilled target
items remain explicit, and the register states exactly which domain each gate
covers. The full `HARD` target still requires genuine endpoint visibility evidence for the four
remaining scopes in WP5, and independently evidenced semantic route coverage
as described in WP6. A measured missing prerequisite remains an explicit
open item; neither a narrower validator nor invented curriculum evidence may
be presented as completing the stronger target.

A main acceptance claim requires the gate to be merged to `main` and green in
remote CI. The implementation PR may update the register together with the
code it describes, but must distinguish candidate enforcement from accepted
main evidence. Assigning a rule to a validation area is not a pass.

## 2. Baseline (measured 12 November 2026)

This section records the initial pre-implementation snapshot, not the current
delivered results. Re-measure for verification; do not overwrite this baseline
or rely on its findings as current after implementation changes.

```bash
# Catalog-wide G17 report without failing (about one minute)
(cd app && npx tsx scripts/auditTransitiveMinimality.ts --report-only)
# Current status snapshot and floor check
npm --prefix app run quality:curriculum-status:check
```

### 2.1 Why the 18 `CQR` codes are only `PARTIAL`

At the initial baseline, `CQR` results did not fail CI directly. `generateCurriculumQualityStatus.ts`
computes a maturity per curriculum, and
`checkCurriculumMaturityFloors.ts` fails only when one of ten protected
subjects drops below its floor.

The catalog (`curricula/DE/Gymnasium/canonical/`, 21 landscapes) splits as
follows in `docs/qa-ci/status/curriculum-quality-status.json`
(`curriculum-quality-v5`):

| Group | Curricula | Floor |
| --- | --- | --- |
| `M7` | Biologie, Chemie, Mathematik, Physik, Wirtschaftswissenschaften | `M7` |
| `M6` | Deutsch, Geschichte, Informatik, Latein, Politik und Wirtschaft | `M6` |
| `M0` | Chinesisch, Englisch, Französisch, Griechisch, Italienisch, Musik, Polnisch, Russisch, Spanisch, Tschechisch, overview root | none |

So 11 of 21 catalog entries have no CI protection at all, and for the other
ten the protection is indirect.

Rule results across the 21 curricula and the 12 registered QA scopes:

| Rule | `pass` | Other |
| --- | --- | --- |
| `CQR-000` | 10 | 7 `warn`, 4 `fail` |
| `CQR-001` | 14 | 7 `fail` |
| `CQR-002` | 21 | – |
| `CQR-003` | 10 | 11 `warn` |
| `CQR-004` | 16 | 5 `not_configured` |
| `CQR-005` | 20 | 1 `not_configured` (overview root) |
| `CQR-301`, `CQR-302` | 10 | 11 `not_configured` |
| `CQR-303` | 5 | 16 `not_configured` |
| `CQR-401` | 11 | 10 `not_configured` |
| `CQR-501` | 21 | – |
| `CQR-101`, `102`, `103`, `201`, `202`, `203` | 12 of 12 scopes | – |
| `CQR-104` | 8 of 12 scopes | absent in 4 scopes |

All 12 QA scopes belong to the ten protected subjects. No `M0` curriculum has
a QA scope, a review configuration or a route profile.

### 2.2 `CQR-001` (G17) failures

Complete-catalog auditor run: 14 roots pass, 7 do not.

| Root | Result |
| --- | --- |
| Englisch | `fail`: 66 minimality findings, 45 non-atomic `requires` |
| Spanisch | `fail`: 32 minimality findings, 61 non-atomic `requires` |
| Musik | `fail`: 10 minimality findings, 43 non-atomic `requires` |
| Chinesisch, Französisch, Griechisch | `invalid-input`: effective `requires` self-cycle; the auditor stops there. A raw count shows 29, 22 and 20 authored `requires` on clusters. |
| Overview root | `invalid-input`: inherits the Griechisch cycle |

The self-cycle is one construct per file: the subject root requires its own
direct child (the "Warum …" motivation node), so that child inherits a
requirement on itself.

### 2.3 Why three `GVR` codes are only `PARTIAL`

| Code | Finding |
| --- | --- |
| `GVR-006` | Scoped to 17 Hessen rollout landscape IDs (`noDirectChildRequireRuleLandscapeIds` in `app/scripts/validateGraph.ts`). None of these IDs is a loaded landscape any more; they exist only in archive and provenance registries. **The rule currently checks nothing.** The same holds for `GVR-004` and `GVR-005`. |
| `GVR-013` | Scoped to canonical Mathematics. Since 11 November 2026 `CQR-001` requires atomic endpoints on every authored `requires` in the whole catalog, which is strictly stronger. |
| `GVR-012` | Scoped to canonical Mathematics Sek I and Sek II through a profile list in `validateGraph.ts`. The status generator keeps `routeProfiles` with all 12 QA scopes for the weaker reachability invariant `CQR-102`; these checks are not equivalent. |

Applied to all 593 loaded landscape files, the `GVR-006` condition would
report 567 violations: 3 inside the catalog (the three self-cycles above) and
564 in landscapes outside the catalog, where the root-requires-"Warum"-child
construct is the standard legacy pattern.

### 2.4 Wiring gaps

- `npm run check:transitive-minimality` already is a complete-catalog,
  fail-closed G17 check. It is called neither by `run_ci.sh` nor by
  `.github/workflows/ci.yml`.
- `run_ci.sh` regenerates and diffs the status but does not call
  `check:curriculum-maturity-floors`; only remote CI does.

## 3. What `HARD` means in this plan

A legend row may be graded `HARD` when all four hold:

- **H1 – Derived or pinned domain.** The set of landscapes or scopes the gate
  covers is computed from the complete catalog or pinned in a committed
  register whose coverage is itself checked. It cannot shrink silently.
- **H2 – Direct failure.** CI fails on any violation inside that domain. It
  does not depend on a floor happening to cover the affected subject.
- **H3 – No bypass.** No environment switch, `not_configured` result or
  optionally attached rule lets a violation through.
- **H4 – Main acceptance.** The claim is true for the whole domain on `main`,
  with terminal green CI for the merged head. Before merge, a candidate may
  document H1–H3 enforcement and passing candidate evidence, but must not
  claim H4 or main acceptance. Candidate `HARD` legend entries describe the
  code under review, not an authorized merge or an accepted-main result.

Two classes of rule follow from this:

- **Class I – catalog invariants.** Must be `pass` for all 21 catalog
  curricula at all times: `CQR-001`, `CQR-002`, `CQR-501`.
- **Class II – milestone and scope obligations.** Bind a curriculum or QA
  scope from the milestone at which it is pinned: `CQR-000`, `003`, `004`,
  `005`, `101`–`104`, `201`–`203`, `301`–`303`, `401`. The
  `CQR-104` obligation applies only to its eight explicitly pinned visibility
  scopes; the four remaining route profiles carry documented unmet visibility
  obligations, not silently skipped required results.

## 4. Execution choices within the authorization

These are implementation choices made under the owner's autonomous-work
instruction, not newly attributed dated Product Owner policy decisions.

| ID | Choice | Boundary |
| --- | --- | --- |
| D1 | Use direct milestone-bound enforcement over a complete pin register; retain `M0` as a legitimate starting state. State the covered domain and count for each gate. | Require every applicable rule to pass directly; check pins against an independent inventory and the Git base policy. A maturity label alone is insufficient. |
| D2 | Retire empty legacy `GVR-006` and Mathematics-only `GVR-013` together with the stronger catalog G17 gate. Preserve `CQR-101`, `CQR-103` and the scope maturity ladder. | Do not infer semantic equivalence of different route validators from green current data. |
| D3 | Keep non-catalog landscapes outside the CQR/G17 domain, following the existing 12 November decision. | Their legacy constructs and runtime fallback stay outside this implementation. |
| D4 | Deliver the interdependent packages as separately reviewable commits in one PR against `main`. | No merge or production operation is authorized. Run the complete CI tier when the PR is ready. |

## 5. Legacy inventory

Principle: never harden a legacy construct. Delete dead code, repair legacy
data, and retire a rule once a stronger gate implies it within the deliberately
covered catalog domain. Retirement does not expand the successor gate to
non-canonical landscapes.

| ID | Legacy item | Evidence | Disposition |
| --- | --- | --- | --- |
| L1 | Hessen rollout ID lists and the rules scoped to them (`GVR-004`, `GVR-005`, `GVR-006`; the Physics-to-Mathematics cross-reference guard keyed on the archived Hessen Physics ID) | No listed ID is a loaded landscape | Delete in WP1 |
| L2 | `VALIDATE_GRAPH_STRICT_RULES=0` warn-only mode | Not set by any CI entry point; documented as a legacy mode | Delete in WP1 |
| L3 | Cluster `requires` and the root-requires-"Warum"-child construct in six catalog subjects | Section 2.2 | Repair in WP2 |
| L4 | `check:transitive-minimality` and the floor check missing from CI entry points | Section 2.4 | Wire in WP3 |
| L5 | Floor policy v1: 10 of 21 curricula; stale `knownPreBaselineRegressions` entry for Wirtschaftswissenschaften (now `M7` with an `M7` floor); hard-coded `baselineDate` equality | `app/scripts/config/curriculum-maturity-floor-policy.json`, `checkCurriculumMaturityFloors.ts` | Replace by v2 in WP4 |
| L6 | Leniencies in the promotion chain: `CQR-104` is skipped when a scope has no `compositionViewStage`; `CQR-004` blocks only on `fail` and `CQR-005` only on `warn` | `deriveScopeMaturity`, `deriveCurriculumMaturity` | Close in WP5 |
| L7 | Catalog `maturityTarget` for `CQR-104` (`M3`) and `CQR-203` (`M4`) differs from the level they actually gate (`M4`, `M5`) | `ruleCatalog` in the generator; register prose "abweichend" | Align metadata in WP5 |
| L8 | Two hand-maintained route profile lists for one invariant | `validateGraph.ts` profiles versus `routeProfiles` | Unify in WP6 |
| L9 | Codes implied by G17 or duplicated: `GVR-006`, `GVR-013`, `CQR-103` (no cluster may carry `requires` at all), `CQR-101` (equals `CQR-102` once no cluster carries `requires`), `GVR-011` (implied by `GVR-012`) | Section 2.3 | WP7, subject to D2 |
| L10 | Historical reduction proofs (`prerequisiteReductionProof` in the status artifact) | Still used to reuse dependent review evidence | Out of scope; removing them needs its own decision because `M6`/`M7` evidence depends on them |

## 6. Working rules

- One integration PR against `main`, with Conventional Commits separating
  work packages and each subject migration. Use local checks while developing;
  draft CI is only the quick tier, and the final ready PR must run the complete
  remote tier. Do not merge.
- Never lower or remove a floor, add a floor exception, bulk-decide a review
  queue or hand-edit a generated file to make a check pass.
- Changes under `curricula/` are evidence-bound. WP2 mechanically materializes
  existing prerequisite statements, removes their invalid self-pairs and
  transitively reduces the atomic relation. Do not invent prerequisite intent,
  alter other goal fields or rewrite review decisions. G17 acceptance uses the
  current graph; the 12 November decision supersedes historical closure and
  frontier preservation as acceptance requirements.
- After any curriculum or generator change run
  `npm --prefix app run quality:curriculum-status` and confirm that no
  protected maturity dropped.
- Scope every search to a concrete directory. Never search from the repository
  root; `tmp/` and `site/` are large.
- Resolve routine implementation findings and record deviations in section 9.
  Continue independent work when a package hits a genuine evidence gap. Do not
  fabricate missing reviews, source evidence or semantic classifications.

## 7. Work packages

Order: WP1 and WP2 are independent. WP3 needs WP2. WP4 and WP5 share one
enforcement contract and are tested together. WP7 is delivered with WP3;
WP8 describes the final integrated candidate and records remote evidence.

### WP1 – Delete dead validator scope (L1, L2)

Deleting the dead rules and warning switch alone preserves the passing
baseline. The integrated PR additionally enforces `CQR-102` across all twelve
profiles under WP6; that intentionally extends the set of violations rejected
by `validate:graph`.

1. Prove the scope is empty: add a focused test or assertion showing that no
   loaded landscape under `curricula/` has an ID from
   `motivationRuleLandscapeIds`, `HESSEN_GYM_OVERVIEW_LANDSCAPE_ID`,
   `MATH_LANDSCAPE_ID` or `PHYSICS_LANDSCAPE_ID`.
2. In `app/scripts/validateGraph.ts` delete those ID lists, the `GVR-004` and
   `GVR-005` blocks, the Hessen Physics cross-reference guard and the
   `VALIDATE_GRAPH_STRICT_RULES` switch. Every remaining `GVR` rule reports
   `error` unconditionally. Remove `GVR-006` together with WP7 in this PR.
3. Update the sources `docs/qa-ci/source/chapters/03-graph-validation-rules.{de,en}.md`
   and `docs/qa-ci/lanes-source/chapters/{01-ci-overview,07-relation-checks}.{de,en}.md`,
   then regenerate (`python3 scripts/build_compendia.py --compendium qa-ci --web-and-tex`).

Accept WP1 when the dead-scope tests prove no live checks were removed, all
remaining graph issues are errors, the 593-landscape baseline still passes,
and the related tests and five documentation checks pass. The integrated
validator must additionally reject a broken non-Mathematics atomic route
under WP6; unchanged baseline pass counts do not mean unchanged enforcement.

### WP2 – Bring all 21 roots to G17 (L3)

Subjects: Chinesisch, Englisch, Französisch, Griechisch, Musik, Spanisch. The
overview root passes once Griechisch does.

1. Read how the same repair was done and certified for Latin (commits
   `9f32bfb15d`, `31c9dbc063`) and the normative expansion rule in Graph
   Definition §3.1. Reuse its semantic materialization and reduction method;
   the earlier migration-certificate requirement is superseded. Do not extend
   the historical proof registry merely to satisfy G17.
2. Per subject, in this order:
   a. Resolve the existing inherited and expanded atomic relation, accounting
      for every containment parent; reject unresolved references or other cycles.
   b. Replace each authored `requires` whose source or target is a cluster by
      the equivalent requirements between atomic goals. This includes the
      root-requires-"Warum"-child construct.
   c. Remove redundant authored edges until the auditor reports zero
      minimality findings.
   d. Check the complete current target graph and record the exact changed
      edge counts. A before/after closure comparison may support the mechanical
      transformation, but is not a historical migration certificate or a G17
      acceptance prerequisite. Existing review-reuse evidence remains separate.
3. One commit per subject.

Accept when
`(cd app && npx tsx scripts/auditTransitiveMinimality.ts --check)` exits 0
with 21 `pass` lines, `validate:graph`, `validate:view-filters`,
`validate:composition-views` and `validate:learning-units` pass, the existing
backend test `FirstMathPrerequisiteReductionTest` remains green as a regression
check for historical proof consumers, and the regenerated status
shows `CQR-001` `pass` for all 21 curricula with the ten protected maturities
unchanged. That regression test is not a requirement for a new migration
certificate or historical closure equality for these six subjects.

### WP3 – Direct G17 gate and local CI wiring (L4)

1. Add `npm run check:transitive-minimality` to the curriculum suite of
   `run_ci.sh` and to the graph-validation job in `.github/workflows/ci.yml`.
2. Add `npm run check:curriculum-maturity-floors` to `run_ci.sh` next to the
   status regeneration.

Accept when both entry points fail on a deliberately introduced cluster
`requires` in a subject without a floor (verify locally, then revert the
probe).

Candidate result: `CQR-001` satisfies H1–H3 for the complete catalog; H4
requires separately authorized main integration and terminal main CI.

### WP4 – Complete pin register and direct rule enforcement (L5)

Evolve the existing policy file and checker in place; do not add a second
policy file.

1. `app/scripts/config/curriculum-maturity-floor-policy.json`, schema
   version 2:
   - `floors`: one entry for each of the 21 catalog curricula, at its current
     maturity (5 × `M7`, 5 × `M6`, 11 × `M0`).
   - `scopeFloors`: one entry for each of the 12 QA scopes at `M4`, with an
     explicit `compositionVisibilityRequired` obligation: true for the eight
     established visibility scopes and false with recorded gap reasons for
     the four measured Sek II gaps. The policy must match the declared
     profile configuration and protect true obligations against removal.
   - `catalogInvariantRules`: `CQR-001`, `CQR-002`, `CQR-501`.
   - Drop `knownPreBaselineRegressions` and the hard-coded `baselineDate`
     comparison. Keep `exceptions` empty and fail-closed.
2. `app/scripts/checkCurriculumMaturityFloors.ts` fails when:
   - policy or status curriculum identities differ from the independently
     loaded canonical catalog, or scope identities differ from the shared
     route-profile inventory; duplicate identities are errors;
   - a curriculum or scope is below its pin;
   - a curriculum or scope is above its pin (the pin must be raised in the
     same change, so no gain is left unprotected);
   - a catalog invariant rule is missing or not `pass` in any curriculum;
   - any rule required by a curriculum or scope pin is absent, duplicated or
     not exactly `pass`, even when the reported maturity is unchanged;
   - a protected curriculum or scope pin is removed or lowered against the
     Git base policy. CI supplies the PR base SHA or previous push SHA; local
     checking uses `origin/main`. Missing explicitly required base data fails.
3. Export the check as a pure function and add a focused test with negative
   fixtures for each failure above, including policy/status deletion together,
   malformed or duplicate identities, every non-pass status, and a forged high
   maturity with failed required rules. Register it as an npm script and run
   it in both CI entry points.

Accept when the check passes on the unchanged status and each negative
fixture fails with a message naming the curriculum or scope and the rule.

Result: every Class II rule satisfies H1 and H2 for all pinned curricula and
scopes, with `CQR-104` bounded to its eight pinned visibility scopes.
`CQR-002` and `CQR-501` satisfy H1–H3 for the complete catalog. The main
integration and green CI recorded in section 9 also establish H4 for this
bounded enforcement.

### WP5 – Close promotion-chain leniencies and measure visibility gaps (L6, L7)

Each change must leave the ten protected maturities and the twelve scope
maturities unchanged. If one would drop, that is a real finding: stop and
report, do not lower a pin.

1. `CQR-104`: measure the four scopes lacking `compositionViewStage`
   (`canonical-math-sek2`, `canonical-physics-sek2`,
   `canonical-chemistry-sek2`, `canonical-biology-sek2`). If all pass, make
   visibility mandatory for all twelve scopes. Otherwise pin the existing
   eight-scope coverage explicitly, require a result in every covered scope,
   and prevent coverage removal against the Git base. Keep the four measured
   gaps visible and the code `PARTIAL`; no floor exception or invented result.
2. `CQR-004` and `CQR-005`: require `pass` for the `M1` to `M2` step instead
   of blocking only on `fail` and `warn`.
3. Set the catalog `maturityTarget` of `CQR-104` and `CQR-203` to the level
   they actually gate: M4 and M5, respectively. Scope derivation defaults to
   strict endpoint visibility. Only the explicit, validated four-profile gap
   configuration may omit that obligation; arbitrary absence of a result must
   still fail. Preserve the established maturity ladder and all pins.
4. Bump the rules version and update
   `docs/qa-ci/source/chapters/02-maturity-scopes-cqr.{de,en}.md`.

Accept the bounded implementation when covered obligations cannot be omitted,
the protected maturities remain unchanged, and the four unfulfilled visibility
obligations are documented. Full WP5 completion requires their genuine current
evidence and twelve passing results.

Result: directly enforced Class II obligations satisfy H3 within their pinned
coverage. `CQR-104` remains partial while any of the four gaps is unresolved.

Measured on 12 November: setting only `SekII` exposes missing terminals in
80/80 Mathematics, 68/68 Physics, 41/41 Chemistry and 3/3 Biology projection
scopes. The existing compiled-jurisdiction mode still reports failures; two
Chemistry endpoints have no compiled applicability, and five Biology
projections have no applicable terminal. This is not a safe metadata-only
configuration change. Any remediation must use authoritative applicability
and assessment evidence, without defining the expected endpoint set merely
as the endpoints already visible.

### WP6 – One route gate (L8)

1. Check whether the semantic validator in
   `app/scripts/lib/hardLearningRouteValidation.ts` can run over all 12
   entries of `routeProfiles`. `GVR-012` depends on a semantic-kind ledger
   that today exists for Mathematics; establish per scope whether an
   equivalent classification exists.
2. Only if equivalent authoritative classification and negative-test
   semantics are established in all 12 scopes, derive the `validate:graph`
   profiles from `routeProfiles` and delete the separate list. Preserve the
   distinction between `CQR-102` reachability and stronger semantic validation;
   a passing reachability result alone never licenses the stronger claim.
3. If not: report the gap per scope, keep `GVR-012` `PARTIAL`, and change no
   curriculum data in this package. Share the profile inventory where possible,
   while preserving the stronger semantic validator and directly enforcing
   `CQR-102`'s distinct route-coverage obligation.

Review finding: `CQR-102` currently checks reachability, while `GVR-012` also
checks semantic kinds, route ordering, ordinary intermediate goals, side
prerequisites and Memory ordering. Mathematics profile selection and terminal
expansion differ too. Positive data agreement cannot establish equivalence;
negative fixtures must distinguish these obligations. Authoritative semantic
ledgers currently exist for Mathematics and Physics, not all ten subjects.

Accept when `validate:graph` fails for a broken route in a non-Mathematics
scope (probe, then revert).

### WP7 – Retire implied codes (L9; delivered with WP3)

1. Add a test showing that the G17 auditor reports a violation for a cluster
   that requires its direct child and for an atomic goal that requires a
   cluster.
2. Delete `GVR-006` and `GVR-013` from `validateGraph.ts` and from the legend;
   point `GD-C19` and `GD-C22` to `CQR-001`. Retired codes are never reused.
3. Preserve `CQR-101` and `CQR-103` in this implementation. Any future
   retirement needs an independent semantics argument and deliberate scope
   ladder change; equal results on today's data alone are insufficient.

### WP8 – Register and documentation

For the integrated candidate, before marking the PR ready for review:

1. Update `docs/concept/skill-graph/source/rules-and-gates.json` in both
   languages: legend `ampel` and `scope` (with the covered domain and count),
   `ampelSection` counts and notes, milestone overview limits, and the
   `enforcement` text of every `GD-*` row that cites the gate. Upgrade a
   `GD-*` row only when every obligation in that row is gated; otherwise
   correct the text and keep the grade. Candidates to re-evaluate after WP3:
   `GD-C11`, `C15`, `C16`, `U13`.
2. Update the expected distribution, only if GD group grades change, in
   `scripts/doc_compendium/extensions/skill_graph.py`, the affected prose in
   `docs/concept/skill-graph/source/chapters/01-core.{de,en}.md` and
   `docs/qa-ci/source/`, and the matching statements in `AGENTS.md` and
   `CLAUDE.md`.
3. Regenerate with `npm --prefix app run docs:skill-graph:web` and
   `python3 scripts/build_compendia.py --compendium qa-ci --web-and-tex`, then
   run the five documentation checks listed in `CLAUDE.md`.

## 8. Delivered bounded legend

| Code | Initial baseline | Package | Delivered on main | Condition |
| --- | --- | --- | --- | --- |
| `GVR-001`, `003`, `009`, `010`, `014` | `HARD` | WP1 | `HARD` | Warn-only switch removed |
| `GVR-006` | `PARTIAL` (empty scope) | WP7 | retired | D2; implied by `CQR-001` in the catalog |
| `GVR-013` | `PARTIAL` | WP7 | retired | D2; implied by `CQR-001` |
| `GVR-012` | `PARTIAL` | WP6 | `PARTIAL`, two Mathematics scopes | Wider semantic classification evidence is missing |
| `CQR-001` | `PARTIAL` | WP2, WP3 | `HARD`, 21 of 21 | – |
| `CQR-002`, `CQR-501` | `PARTIAL` | WP4 | `HARD`, 21 of 21 | – |
| `CQR-101`–`103`, `201`–`203` | `PARTIAL` | WP4 | `HARD`, 12 of 12 scopes | – |
| `CQR-104` | `PARTIAL` | WP5, WP4 | `PARTIAL`, 8 of 12 scopes pinned | Four Sek II visibility gaps measured; no fabricated pass |
| `CQR-000`, `003`, `004`, `005`, `301`, `302`, `401` | `PARTIAL` | WP4, WP5 | `HARD`, 10 of 21 pinned | D1 |
| `CQR-303` | `PARTIAL` | WP4 | `HARD`, 5 of 21 pinned | D1 |

There are 24 remaining legend codes after the two retirements. The bounded
delivery establishes 22 `HARD` and 2 `PARTIAL` codes; `GVR-012` and `CQR-104`
retain their actual covered domains and documented missing evidence. Main
integration is evidenced by the merge and the subsequent successful main CI
in section 9. This code-legend result does not upgrade the broader 145-rule
`GD-*` register, which remains 4 `HARD`, 58 `PARTIAL`, 55 `OPEN` and 28 `OPT/DOC`.

## 9. Progress log

Add one line per package: date, pull request, result, deviations from this
plan.

- 2026-11-12: reviewed against `38b1080130`; created the active execution goal
  and branch. Three Sol 6.1 agents independently reviewed pins/promotions,
  graph/routes and curriculum normalization. Confirmed 593 loaded landscape
  files and zero live matches for the 17 retired Hessen IDs. Corrected direct
  rule enforcement, independent inventories, base-policy protection, historical
  preservation wording, route non-equivalence and delivery sequencing.
- 2026-11-12: WP2 current-state auditor passes all 21 roots after mechanical
  prerequisite normalization in six subjects; only `requires` changed. WP5
  measurement found real visibility/applicability gaps in four Sek II scopes;
  expansion is not accepted. WP6 found no authoritative semantic ledgers for
  eight subjects; the stronger route gate remains Mathematics-only. Proceed
  with direct enforcement of all established obligations and explicit coverage
  pins while retaining these two partial codes.
- 2026-11-12: status regeneration exposed a separate review-reuse dependency:
  the historical V8 proof pins the entire catalog, so the six M0 edits disable
  the full capability. Mathematics then has 520 current source-fingerprint
  mismatches. Preserve the original proof bytes and verify its certified frame
  before permitting narrowly bounded reuse for unchanged subjects and checked
  dependencies. Changed subjects retain current-input reviews. This additional
  contract work preserves actual historical review evidence; it does not add a
  historical-preservation requirement to G17 or authorize floor reductions.
- 2026-11-12: WP1/WP3/WP4/WP7 implementation and negative contract tests
  completed; full integration verification is still pending. WP2 independent
  replay confirms exactly 636 changed `requires` fields and no other field or
  identity changes: Chinesisch 176 (383 → 403 authored edges), Englisch 51
  (124 → 620), Französisch 166 (335 → 377), Griechisch 178 (369 → 322),
  Musik 31 (82 → 72), Spanisch 34 (106 → 76). The three explicitly identified
  orientation self-pairs are removed; the resulting atomic reachability is
  preserved. Current validation passes 593 landscapes, all 21 canonical roots,
  and 354 composition views (zero errors; 2,388 existing warnings).
- 2026-11-12: WP5/WP6 bounded implementation keeps the four measured visibility
  gaps and missing broader semantic route evidence open. WP8 sources and
  generated documentation now describe 22 candidate `HARD` and 2 `PARTIAL`
  codes, with the broader GD distribution unchanged. Independent final
  reviews found no remaining concrete bypass in the new gate or historical
  review dependency contracts; complete local and remote CI remain required.
- 2026-11-12: regenerated `curriculum-quality-v6` successfully: all 21 roots
  pass each of `CQR-001`, `CQR-002` and `CQR-501`; protected maturities remain
  5 × M7 and 5 × M6, alongside 11 × M0. All twelve scopes remain M4;
  CQR-104 has eight passes and four explicitly unconfigured gaps. The verified
  historical frame permits reuse for fourteen unchanged, dependency-checked
  subjects, including all ten protected subjects. The floor checker passes
  against `origin/main`.
- 2026-11-12: the actual G17 CLI returned exit 1 for a copied 21-document
  catalog with one injected cluster `requires` in M0 Spanish. It reported the
  non-atomic source, failed Spanish and its overview, and passed the other
  nineteen roots. Both CI entry points invoke this same command without error
  suppression (statically checked; not a claim of a mutated full CI run).
  All live catalog bytes were unchanged and the temporary probe was removed.
- 2026-11-12: WP6 actual `validateGraph.ts` CLI probe on an isolated inventory:
  the unchanged 593-landscape baseline exits 0. Clearing only `requires` on
  Chemistry goal `02dc29ae-4046-556a-b048-d64a0feb8f16` makes the CLI exit 1
  with `CQR-102` missing direct atomic motivation coverage. The changed file
  was an independent copy; live bytes stayed unchanged and the isolated
  inventory was removed.
- 2026-11-13: created [PR #131](https://github.com/enpasos/skillpilot/pull/131)
  after the focused checks, independent reviews and successful complete status
  regeneration. The six subject migrations have separate commits; historical
  review contracts, gate enforcement and documentation are separate commits
  too. The full local `./run_ci.sh` was started before these commits and is
  still running, as is the complete historical backend regression. The ready
  PR runs the full remote tier in parallel. These ongoing runs are not yet
  successful acceptance evidence; terminal results belong in the PR record.
- 2026-11-13: the first full PR CI exposed an independent MCP npm-audit
  failure (`GHSA-qv5m-9pm6-hqp3`, `GHSA-jpvv-r467-5p4w`). Fresh local audits
  confirmed the affected dependency in both provider apps. Updated only
  `@hono/node-server` to 2.1.6: the existing OpenAI override and lock entry,
  and the Claude transitive lock entry. Both installs and audits pass with
  zero reported vulnerabilities; OpenAI 67/67 and Claude 30/30 tests pass.
  Active and historical widget bytes are unchanged. A fresh full PR run is
  required for the resulting head; earlier successful jobs do not substitute
  for that result.
- 2026-11-13: full remote gate tests exposed a stale isolated module-copy
  fixture: `testApplicabilityInputSnapshot.ts` omitted the new historical
  dependency helper. Added the required file and a fourth implementation
  mutation case for that helper, preserving the existing rejection assertion.
  The reproduced failing suite now passes 5/5; ESLint passes. Other child
  process fixtures import the real module tree and need no copy adjustment.
  No proof implementation, compiler or curriculum data changed in this repair.
- 2026-11-13: remote assessment job `131612955274` on `b93acb2` failed
  importing the historical receipt tests because Python package `referencing`
  was missing through `curriculum_completion_artifacts`. Added Python 3.10
  setup and installation of the existing pinned curriculum-package validation
  requirements after goal-book restoration and before the proof gates, matching
  the goal-book contract job. The CI wiring test now checks that order and the
  nested Python receipt entry point (8/8 wiring tests pass). A fresh Python
  environment reproduces the missing dependency at `jsonschema` (exit 1);
  after installing the declared requirements the complete graph-gate command
  passes (31 TypeScript, four normalization and three receipt tests, exit 0).
  Receipt assertions are unchanged; fresh remote CI is required to accept the
  repaired head.
- 2026-11-13: the next remote audit (`131626422810`, head `8def9b2`)
  reported a separate moderate vulnerability in transitive `hono` 4.13.12,
  reproduced locally. Both MCP app locks now resolve only that dependency to
  4.13.18; `@hono/node-server` stays at 2.1.6. The current
  [upstream patch release](https://github.com/honojs/hono/releases/tag/v4.13.18)
  includes the initial fixes and their follow-up corrections. Package manifests,
  other resolved versions and published widget artifacts are unchanged.
  Both clean installs and test suites pass (OpenAI 67/67, Claude 30/30),
  both fresh audits report zero vulnerabilities, and widget-byte checks pass.
- 2026-11-13: the next remote integration run on `019a485` exposed the
  existing plugin-workflow naming guard: the new Python setup step names
  contained reserved historical-review wording. The unchanged guard reproduced
  the failure locally (8/9). Renamed only those two steps to curriculum proof
  receipts and adjusted their wiring-test references. The actual five-file CI
  test command now passes 89/89, and the CI-tier tests pass 8/8 (both exit 0).
  Guard assertions, Python dependency setup and receipt execution are unchanged;
  acceptance still requires fresh remote CI for the repaired head.
- 2026-11-13: the dependency-bounded historical frame is superseded by the
  frozen prerequisite-reduction registry (contract V9). The frame file, its
  helper module, its tests and the frame branches of the verifier and the
  Python bridge are removed. Under V9 the six normalized subjects carry no
  transfer and are checked against current goals; all 1,361 transfers of the
  other subjects stay active. The regenerated status equals the status of this
  change in summary, rule catalog and all 21 curriculum entries; only the
  proof-binding header differs. Statements above about the historical frame
  describe the state before that change. Record:
  [freeze of the reduction proof](prerequisite-reduction-proof-freeze-2026-11-12.md).

- 2026-11-13: final delivery verification for head `39fe19b658`: all sixteen
  jobs of [CI #2299](https://github.com/enpasos/skillpilot/actions/runs/43365069806)
  and the separate Assessment, Docs, OAuth and Gemini workflows passed.
  The full local default-suite coverage passed across the original invocation
  and verified continuations after generated-asset and stale-document-path
  repairs; this is not an uninterrupted `./run_ci.sh` pass. The final backend
  check reports 2,775 tests, zero failures/errors and 19 skipped tests; both
  plugin verifications and the final continuation marker passed. Preserved
  XML reports independently confirm the counts. The old process handle is no
  longer available, so no newly observed numeric exit code is claimed.
- 2026-11-13: additional WP3 negative evidence executes the exact workflow
  G17 `run` block and the original local G17 call with its original function
  and caller semantics against independent 21-document copies of `39fe19b658`.
  Both unchanged controls return exit 0 with 21 passes. Adding a cluster
  `requires` in M0 Spanish returns exit 1 in both, failing Spanish and Overview;
  no subsequent local command runs. This tests actual gate-boundary error
  propagation without stubs or live-data changes. It does not claim mutated
  full-script starts or entire GitHub job executions; the complete positive
  PR CI above is separate evidence.
- 2026-11-13: PR #131 was merged outside this agent run as `dcf5278881`.
  The merge commit's main CI was cancelled. Later main `2129b207f4`, including
  the subsequent proof retirement, Mathematics assessment and inventory fix,
  passed all fourteen jobs of
  [CI #2315](https://github.com/enpasos/skillpilot/actions/runs/43398052180).
  This is current integration evidence for that later tree, not an unchanged
  rerun of the original PR tree. The user-requested local main merge preserves
  these follow-up changes. Final documentation review also corrects the German
  EXAM note to state the actual CQR-203 catalog target M5; the broader
  CQR-104 and GVR-012 gaps remain unchanged.
- 2026-11-13: the owner merged the final EXAM-note and verification-record
  correction in [PR #136](https://github.com/enpasos/skillpilot/pull/136)
  as `7d13eb82a5`, after all three jobs of
  [Docs Checks #790](https://github.com/enpasos/skillpilot/actions/runs/43423688281)
  passed. The subsequent documentation update replaces stale candidate and
  pending-main wording in the bilingual Graph Definition, rule register,
  implementation status and QA chapters with the delivered scope and the
  separate CI evidence above. Historical baseline and progress-log entries
  retain their original meaning; neither remaining coverage gap is closed by
  these documentation changes.

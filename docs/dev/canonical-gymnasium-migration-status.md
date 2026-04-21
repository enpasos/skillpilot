# Canonical Gymnasium Migration Status

This document tracks the migration progress from legacy Gymnasium source trees into the DE-level canonical layer.

Assumption for this document:

- "existing repos" means the legacy curriculum source trees that are or recently were operationally relevant inside this monorepo.
- The main tracked trees in scope today are:
  - `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe`
  - `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe`
  - `curricula/DE/BY/Gymnasium`

This document is intentionally stricter than the rollout plan:

- `100%` means the old legacy source trees are no longer needed for runtime/operations and can be deleted from the active repo.

## Progress model

The existing rollout states remain the operational backbone:

- `legacy_frozen`
- `subtree_adopted`
- `cutover_ready`
- `legacy_view_retained`

For program tracking, we assign a score to each tracked migration unit:

| State | Score | Meaning |
| --- | ---: | --- |
| `legacy_frozen` | 0% | Legacy subtree is still authoritative source only |
| `subtree_adopted` | 50% | Canonical subtree + mappings exist, but operational switch is not yet low-risk |
| `cutover_ready` | 75% | Runtime projection and learner cutover are good enough for operational migration |
| `legacy_view_retained` | 90% | Canonical is preferred, legacy still exists only as compatibility view |
| `legacy_deleted` | 100% | Legacy source tree is no longer needed and has been removed from the active repo |

Important interpretation:

- `legacy_view_retained` is deliberately not `100%`.
- We only call the program `100%` when the old trees are actually removable.

## Completion-track headline score

The historical rollout score above is still useful for explaining how much canonical structure exists.
It is not the best top-line number for the final stretch, because late-stage work is dominated by
retiring the remaining legacy trees rather than by adding new adopted subtrees.

For the close-out phase, we therefore also track one explicit overall completion-to-finish score:

- `completion-track score` = average of the tracked legacy-tree delete-gate scores

Formula:

```text
completion-track score
  = (gate score of each tracked legacy tree) / number of tracked legacy trees
```

Interpretation:

- this is the primary top-line percentage for the final migration stretch
- it starts to matter once at least one tracked legacy tree has actually been retired
- unlike the older rollout score, it is tied directly to the remaining delete-handoff work
- from here on, progress updates should prefer this number as the main "how close are we?" headline

## Reported headline 2026-03-18

Current reported migration status:

- `100%`

Why this is the right number right now:

- `3` of the `3` tracked legacy trees are already deleted from the active repo
- all old legacy-tree runtime paths were removed, including `curricula/DE/BY/Gymnasium`
- the current delete-handoff boundary is now enforced via DE-level retained-asset, mapping, and provenance registries instead
- the close-out headline is now capped correctly because all tracked legacy trees are retired from the active repo

## Update 2026-04-10

What changed:

- canonical Physics reached `M1` Hessen+Bavaria hardened parity inside the DE-level canonical layer
- the canonical Physics landscape now carries:
  - `9` `programUnits`
  - `19` `goalPlacements`
  - `5` `competencyCatalog` entries
  - `17` goals with reviewed `competencyRefs`
- Physics composition views now include not only the `5` DE-wide baseline files, but also `8` explicit reviewed `DE-HE` / `DE-BY` scope views
- active Physics mapping lanes and canonical identifiers no longer present the subject as a live `pilot`
- active Physics provenance and applicability exceptions now live in the shared DE-level registries instead of staying inline in the canonical graph JSON

Validation used:

- `cd app && npm run validate:graph`
- `cd app && npm run validate:view-filters`
- `cd app && npm run validate:composition-views`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.service.CompositionViewServiceTest'`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`

Validation result:

- `validate:graph`: `593 landscape(s) passed validation.`
- `validate:view-filters`: `0 error(s), 1382 warning(s), 337 accepted warning(s)`
- `validate:composition-views`: `86 composition view(s) passed validation.`
- the Physics backend parity bundle passed with the new registry-backed and state-scoped view assertions

Interpretation:

- this does not change the migration delete-handoff headline, which remains `100%`
- it does close the remaining canonical Physics hardening gap for the reviewed Hessen+Bavaria corridor
- the next Physics work is no longer basic parity cleanup; it is repeatable M2 onboarding for additional Bundeslaender

### 2026-04-10: NRW upper-secondary Physics completes the first M2 source-lane activation

What changed:

- the first NRW upper-secondary Physics source snapshot now exists at:
  - `curricula/DE/Gymnasium/input/NW/upper-secondary/source-json/DE_NRW_S_GYM_2_PHYSIK.de.json.snapshot`
- the shared DE-level provenance registries now also carry this NRW Physics lane:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the reserved repository-backed mapping scaffold now exists at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the first active NRW Physics lane is intentionally narrow and source-led:
  - one shared orientation anchor
  - one Einfuehrungsphasen entry on periodische Vorgaenge, Kreisbewegung, Gravitation, and physikalische Weltbilder
  - two Grundkurs anchors on `Quantenobjekte` and `Klassische Wellen und Teilchen in Feldern`
  - one Leistungskurs anchor on `Quantenphysik` plus `Atom- und Kernphysik`

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`

Interpretation:

- Physics now has a real third-state DE-level source lane beyond Hessen and Bayern
- this is still a source-lane activation, not yet a reviewed canonical corridor mapping
- the next clean NRW Physics move is the first reviewed upper-secondary mapping corridor on top of this active source snapshot

### 2026-04-10: NRW upper-secondary Physics opens the first reviewed entry corridor

What changed:

- the NRW Physics mapping lane now carries `5` reviewed mappings at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the first reviewed cut stays intentionally narrow:
  - shared source root -> canonical Physics root (`partial`)
  - shared orientation anchor -> shared canonical motivation leaf (`exact`)
  - NRW E-phase entry cluster -> shared canonical E-phase mechanics surface (`partial`)
  - `Periodische Vorgaenge in alltaeglichen Situationen untersuchen` -> `Harmonische Schwingung verstehen` (`partial`)
  - `Kreisbewegung, Gravitation und physikalische Weltbilder modellieren` -> integrated canonical gravitation/worldview task surface (`partial`)
- the NRW Physics onboarding note and mapping-lane README now reflect that the lane has moved beyond pure scaffold state

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters`

Interpretation:

- NRW Physics has now crossed from pure source-lane activation into the first reviewed canonical bridge set
- the reviewed corridor is still conservative and does not yet claim a full NRW cutover tree
- the next clean NRW Physics move after this first corridor was the second reviewed `Quantenobjekte` corridor documented below

### 2026-04-10: NRW upper-secondary Physics adds a second reviewed `Quantenobjekte` corridor

What changed:

- the NRW Physics mapping lane now carries `8` reviewed mappings at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the new second corridor adds three conservative `partial` bridges onto the canonical Q3 duality surface:
  - NRW GK `Quantenobjekte` -> canonical `Welle-Teilchen-Dualismus`
  - `Photonen und Elektronen als Quantenobjekte beschreiben` -> canonical `Welle-Teilchen-Dualismus`
  - `Die Bedeutung von Modellen an Photon und Elektron reflektieren` -> canonical `Welle-Teilchen-Dualismus`
- the onboarding note, mapping-lane README, and repository-backed fixture test now reflect the widened NRW Physics bridge set

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters`

Interpretation:

- NRW Physics now has one reviewed E-phase corridor plus one reviewed GK `Quantenobjekte` corridor
- the canonical Q4 cluster `Quantenobjekte` remains intentionally unused for this NRW GK bridge because it is didactically deeper than the imported NRW surface
- the next clean NRW Physics move after this second corridor was the split between `Wellen` and `Felder` documented below

### 2026-04-10: NRW upper-secondary Physics splits the reviewed `Wellen` / `Felder` corridor

What changed:

- the NRW Physics mapping lane now carries `10` reviewed mappings at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the new split corridor adds two conservative `partial` bridges:
  - `Klassische Wellenphaenomene an Licht beschreiben` -> canonical Q3 `Elektromagnetische Wellen`
  - `Geladene Teilchen in homogenen E- und B-Feldern untersuchen` -> canonical Q1 `Elektrisches und magnetisches Feld`
- the mixed NRW parent `Klassische Wellen und Teilchen in Feldern` intentionally remains unmapped on parent level because the canonical Physics graph separates the didactic surface into reviewed Q3 light-wave and Q1 field branches instead of one shared mixed parent node
- the onboarding note, mapping-lane README, and repository-backed fixture test now reflect the widened NRW Physics bridge set

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters`

Interpretation:

- NRW Physics now has reviewed entry bridges on the shared motivation/E-phase surface, on GK `Quantenobjekte`, and on the first split GK `Wellen` / `Felder` surface
- this step keeps the canonical separation between Q3 light-wave topics and Q1 field dynamics explicit instead of inventing a synthetic mixed canonical parent
- the next clean NRW Physics move after this split corridor was the first reviewed LK bridge documented below

### 2026-04-10: NRW upper-secondary Physics opens the first reviewed LK corridor

What changed:

- the NRW Physics mapping lane now carries `13` reviewed mappings at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the first LK corridor adds three conservative `partial` bridges:
  - NRW LK `Quantenphysik sowie Atom- und Kernphysik` -> canonical Q4 `Struktur von Materie, Raum und Zeit`
  - `Quantenphysik als Weiterentwicklung des physikalischen Weltbilds deuten` -> canonical Q4 `Quantenobjekte`
  - `Aufbau der Materie sowie ionisierende Strahlung und Kernprozesse modellieren` -> canonical Q4 `Kernphysik`
- the onboarding note, mapping-lane README, and repository-backed fixture test now reflect the widened NRW Physics bridge set

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters`

Interpretation:

- NRW Physics now has one reviewed LK entry corridor in addition to the reviewed E-phase and GK corridors
- the LK bridge intentionally stays on canonical cluster level because the imported NRW LK atoms are still broader than the currently reviewed canonical Q4 atomic surfaces
- the next clean NRW Physics move is now a narrower LK split inside `Quantenobjekte` or `Kernphysik`, most likely around radioactivity / nuclear processes or around the Q4 measurement / world-view residue

### 2026-04-10: NRW upper-secondary Physics narrows the LK `Kernphysik` residue

What changed:

- the NRW Physics mapping lane now carries `15` reviewed mappings at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the NRW upper-secondary Physics source snapshot was widened in place so the retained LK residue `Aufbau der Materie sowie ionisierende Strahlung und Kernprozesse modellieren` is now a source cluster with three child atoms:
  - `Aufbau der Materie im Kleinen modellieren`
  - `Ionisierende Strahlung und radioaktive Zerfaelle modellieren`
  - `Strahlungsrisiken und Kernprozesse fachlich beurteilen`
- the narrower LK residue now adds two conservative `partial` bridges:
  - `Ionisierende Strahlung und radioaktive Zerfaelle modellieren` -> canonical Q4 `Radioaktive Strahlung und Wirkungen`
  - `Strahlungsrisiken und Kernprozesse fachlich beurteilen` -> canonical Q4 `Beurteilung von Strahlungsrisiken und Kernenergie`
- the retained source cluster `Aufbau der Materie sowie ionisierende Strahlung und Kernprozesse modellieren` stays mapped to canonical Q4 `Kernphysik`
- the parallel new NRW child `Aufbau der Materie im Kleinen modellieren` intentionally remains unmapped for now because the current canonical Q4 surface does not yet expose a reviewed one-to-one target without overclaiming toward a more specific elementarteilchen surface
- the source membership and atomic-closure registries now reflect the widened NRW Physics snapshot and the narrower LK residue children
- the onboarding note, mapping-lane README, and repository-backed fixture test now reflect the widened NRW Physics bridge set

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters`

Interpretation:

- NRW Physics now has its first reviewed LK residue split inside the canonical Q4 `Kernphysik` surface
- this still is not a full NRW Q4 cutover: the new child bridges stay conservative and one LK matter child remains source-led and intentionally unmapped
- the next clean NRW Physics move is now either a further reviewed split of the new radiation child toward `Zerfallsgesetze anwenden` or a reviewed canonical target for the still unmapped LK matter child

### 2026-04-10: NRW upper-secondary Physics splits the LK radiation residue toward `Zerfallsgesetze`

What changed:

- the NRW Physics mapping lane now carries `16` reviewed mappings at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the retained NRW LK radiation child `Ionisierende Strahlung und radioaktive Zerfaelle modellieren` was widened in place into a source cluster with two narrower child atoms:
  - `Ionisierende Strahlung nachweisen und Wirkungen beschreiben`
  - `Radioaktive Zerfaelle und Kernumwandlungen qualitativ beschreiben`
- the earlier direct bridge from the broad NRW radiation child onto canonical `Radioaktive Strahlung und Wirkungen` is replaced by two narrower conservative `partial` bridges:
  - `Ionisierende Strahlung nachweisen und Wirkungen beschreiben` -> canonical Q4 `Radioaktive Strahlung und Wirkungen`
  - `Radioaktive Zerfaelle und Kernumwandlungen qualitativ beschreiben` -> canonical Q4 `Zerfallsgesetze anwenden`
- the retained NRW LK residue cluster `Aufbau der Materie sowie ionisierende Strahlung und Kernprozesse modellieren` stays mapped to canonical Q4 `Kernphysik`
- the sibling NRW LK child `Strahlungsrisiken und Kernprozesse fachlich beurteilen` stays mapped to canonical Q4 `Beurteilung von Strahlungsrisiken und Kernenergie`
- the parallel NRW LK child `Aufbau der Materie im Kleinen modellieren` still remains intentionally unmapped
- the source membership and atomic-closure registries now reflect the widened NRW Physics snapshot and the narrower radiation residue children
- the onboarding note, mapping-lane README, M2 shortlist, and repository-backed fixture test now reflect the widened NRW Physics bridge set

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters`

Interpretation:

- NRW Physics now has a first reviewed NRW access path not only to canonical `Radioaktive Strahlung und Wirkungen`, but also to `Zerfallsgesetze anwenden`
- this is still conservative: both new NRW bridges remain `partial`, and the broader risk/judgement child plus the matter child still mark the remaining LK residue
- the next clean NRW Physics move is now either a reviewed split below the current risk/judgement child or a reviewed canonical target for the still unmapped LK matter child

### 2026-04-10: NRW upper-secondary Physics splits the LK judgement residue toward `Strahlungsrisiken` and `Kernenergieoptionen`

What changed:

- the NRW Physics mapping lane now carries `17` reviewed mappings at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the retained NRW LK judgement child `Strahlungsrisiken und Kernprozesse fachlich beurteilen` was widened in place into a source cluster with two narrower child atoms:
  - `Strahlungsrisiken mit physikalischen Groessen beurteilen`
  - `Kernenergieoptionen mit physikalischen Kriterien bewerten`
- the earlier direct bridge from the broad NRW judgement child onto canonical `Beurteilung von Strahlungsrisiken und Kernenergie` is replaced by two narrower conservative `partial` bridges:
  - `Strahlungsrisiken mit physikalischen Groessen beurteilen` -> canonical Q4 `Strahlungsrisiken mit physikalischen Größen beurteilen`
  - `Kernenergieoptionen mit physikalischen Kriterien bewerten` -> canonical Q4 `Kernenergieoptionen mit physikalischen Kriterien bewerten`
- the retained NRW LK residue cluster `Aufbau der Materie sowie ionisierende Strahlung und Kernprozesse modellieren` stays mapped to canonical Q4 `Kernphysik`
- the sibling NRW LK matter child `Aufbau der Materie im Kleinen modellieren` still remains intentionally unmapped
- the source membership and atomic-closure registries now reflect the widened NRW Physics snapshot and the narrower judgement residue children
- the onboarding note, mapping-lane README, M2 shortlist, and repository-backed fixture test now reflect the widened NRW Physics bridge set

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters`

Interpretation:

- NRW Physics now has first reviewed NRW access paths not only to the canonical Q4 context cluster, but also to its two narrower judgement leaves
- this is still conservative: both new NRW bridges remain `partial`, and the LK matter child still marks the remaining source-led residue
- the next clean NRW Physics move is now a reviewed canonical target for the still unmapped LK matter child, or a further source split inside that matter wording if no reviewed one-to-one target exists yet

### 2026-04-10: NRW upper-secondary Physics splits the LK matter residue without claiming a new canonical bridge

What changed:

- the NRW Physics mapping lane still carries `17` reviewed mappings at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the retained NRW LK matter child `Aufbau der Materie im Kleinen modellieren` was widened in place into a source cluster with two narrower child atoms:
  - `Elementare Bestandteile der Materie mit Strukturmodellen ordnen`
  - `Kernaufbau und Bindungen in einfachen Modellen beschreiben`
- no new reviewed canonical bridge is claimed yet for these two new matter children
- the retained NRW LK residue cluster `Aufbau der Materie sowie ionisierende Strahlung und Kernprozesse modellieren` stays mapped to canonical Q4 `Kernphysik`
- the source membership and atomic-closure registries now reflect the widened NRW Physics snapshot and the narrower matter residue children
- the onboarding note, mapping-lane README, and M2 shortlist now reflect the widened source split without changing the reviewed mapping count

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters`

Interpretation:

- the NRW Physics LK matter wording is now materially easier to review against the canonical Q4 matter surface because `elementare Bestandteile` and `Kernaufbau/Bindungen` are no longer bundled into one broad source atom
- the canonical DE Physics graph still does not yet offer a reviewed one-to-one target for either child without overclaiming into explicit Standardmodell or stronger binding-energy detail
- the next clean NRW Physics move is now a decision on whether `Elementare Bestandteile der Materie mit Strukturmodellen ordnen` justifies a conservative partial bridge toward a narrow Standardmodell surface, or whether the matter lane should stay source-led pending further canonical refinement

### 2026-04-10: NRW upper-secondary Physics opens a first matter bridge toward `Elementarteilchen und Standardmodell`

What changed:

- the NRW Physics mapping lane now carries `18` reviewed mappings at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the new NRW LK matter child `Elementare Bestandteile der Materie mit Strukturmodellen ordnen` now maps conservatively as `partial` onto the canonical Q4 cluster `Elementarteilchen und Standardmodell`
- this is intentionally a cluster-level bridge, not yet a narrower claim onto `Standardmodell: Teilchenfamilien` or `Hadronen aus Quarks deuten`
- the sibling NRW LK matter child `Kernaufbau und Bindungen in einfachen Modellen beschreiben` remains intentionally unmapped
- the onboarding note, mapping-lane README, and repository-backed fixture test now reflect the widened NRW Physics bridge set

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters`

Interpretation:

- NRW Physics now has a first reviewed access path into the canonical Q4 matter / Standardmodell surface without overclaiming the sharper Hessen-authored atomic detail
- this remains conservative: the new bridge is `partial` and intentionally stops at the cluster level
- the next clean NRW Physics move is now to decide whether `Kernaufbau und Bindungen in einfachen Modellen beschreiben` justifies a reviewed canonical target, or whether the matter lane should stay source-led beyond this first Standardmodell access path

### 2026-04-10: NRW upper-secondary Physics splits the remaining LK matter residue into `Kernaufbau` and `Bindungen/Modellgrenzen`

What changed:

- the NRW Physics mapping lane still carries `18` reviewed mappings at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the retained NRW LK matter subcluster `Kernaufbau und Bindungen in einfachen Modellen beschreiben` was widened in place into two narrower child atoms:
  - `Kernaufbau in einfachen Modellen beschreiben`
  - `Einfache Bindungen in Materiemodellen beschreiben und Modellgrenzen einordnen`
- no new reviewed canonical bridge is claimed for those two narrower children
- the retained source snapshot, source membership registry, and source atomic-closure registry now reflect `25` NRW Physics source goals instead of `23`
- the onboarding note, mapping-lane README, and M2 shortlist now reflect the narrower retained matter residue without changing the reviewed mapping count

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters`

Interpretation:

- the remaining NRW LK matter residue is now easier to review against the canonical Q4 nuclear-matter surface because `Kernaufbau` and `Bindungen/Modellgrenzen` are no longer bundled into one retained source atom
- this stays intentionally source-led: the current canonical Physics graph still does not expose a reviewed one-to-one target for either new child without overclaiming toward stronger binding-energy, reaction, or particle-physics statements
- the next clean NRW Physics move is now to decide whether `Kernaufbau in einfachen Modellen beschreiben` justifies a conservative reviewed target, or whether the matter lane should remain source-led until the canonical Q4 matter surface is refined further

### 2026-04-10: NRW upper-secondary Physics opens a structural matter bridge onto the canonical atom model surface

What changed:

- the NRW Physics mapping lane now carries `19` reviewed mappings at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the narrowed NRW LK matter child `Kernaufbau in einfachen Modellen beschreiben` now maps conservatively as `partial` onto the existing canonical atom-structure leaf `Kern und Hülle des Atoms qualitativ beschreiben`
- this is intentionally a cross-stage structural bridge onto an already reviewed canonical atom, not a sharper Q4 claim onto `Bindungsenergie und Massendefekt`, `Potenzialtopfmodell für Kerne`, or `Kernreaktionen und Kernmodelle`
- the sibling NRW LK matter child `Einfache Bindungen in Materiemodellen beschreiben und Modellgrenzen einordnen` remains intentionally unmapped
- the onboarding note, mapping-lane README, M2 shortlist, and repository-backed fixture test now reflect the widened NRW Physics bridge set

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters`

Interpretation:

- NRW Physics now has a second reviewed access path on the LK matter residue: one bridge into the broad Q4 `Elementarteilchen` surface and one bridge into the already shared canonical atom-structure surface
- this remains conservative in fachlicher Hinsicht, but operationally it adds one new active `APV-202` for the canonical atom-structure leaf because the NRW reach on that target is now backed explicitly by a reviewed `partial` mapping
- the next clean NRW Physics move is now to decide whether the remaining `Bindungen/Modellgrenzen` residue justifies a reviewed canonical target, or whether the matter lane should stop here for now

### 2026-04-10: NRW upper-secondary Physics splits the last LK matter residue into `Bindungen` and `Modellgrenzen`

What changed:

- the NRW Physics mapping lane still carries `19` reviewed mappings at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the retained NRW LK matter child cluster `Einfache Bindungen in Materiemodellen beschreiben und Modellgrenzen einordnen` was widened in place into two narrower child atoms:
  - `Einfache Bindungen in Materiemodellen beschreiben`
  - `Modellgrenzen einfacher Materiemodelle fachlich einordnen`
- no new reviewed canonical bridge is claimed for those two narrower children
- the retained source snapshot, source membership registry, and source atomic-closure registry now reflect `27` NRW Physics source goals instead of `25`
- the onboarding note, mapping-lane README, and M2 shortlist now reflect the narrower retained matter residue without changing the reviewed mapping count

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters`

Interpretation:

- the remaining NRW LK matter residue is now narrower to review against the canonical Q4 matter surface because `Bindungen` and `Modellgrenzen` no longer share one retained source atom
- this still stays intentionally source-led: the current canonical Physics graph does not yet expose reviewed one-to-one targets for either new child without overclaiming toward stronger binding-energy, reaction, or particle-physics statements
- the next clean NRW Physics move is now to decide whether `Einfache Bindungen in Materiemodellen beschreiben` justifies a conservative reviewed target, or whether the last two matter residuals should remain source-led for now

### 2026-04-10: NRW upper-secondary Physics keeps the last LK matter children source-led after explicit target review

What changed:

- the NRW Physics mapping lane still carries `19` reviewed mappings at:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- the narrower NRW LK matter child `Einfache Bindungen in Materiemodellen beschreiben` was reviewed explicitly against the current closest canonical candidates:
  - `Bindungsenergie und Massendefekt`
  - `Potenzialtopfmodell für Kerne`
  - `Fundamentale Wechselwirkungen`
- no new reviewed canonical bridge is claimed, because those current candidates all overclaim the NRW source wording in different directions
- the onboarding note, mapping-lane README, and M2 shortlist now record this reviewed stop condition instead of keeping the lane in an implicit "maybe next" state

Validation used:

- `git diff --check`

Interpretation:

- `Bindungsenergie und Massendefekt` is too sharp because it already includes mass-defect explanation plus simple reaction-energy calculation
- `Potenzialtopfmodell für Kerne` is too specific because it presupposes the narrower binding-energy / nuclear-potential framing
- `Fundamentale Wechselwirkungen` is too broad because it sits inside the later Standardmodell / interactions package and asks for the four interactions across atomic, nuclear, and cosmic processes
- the next clean NRW Physics move is therefore no longer another mapping on this matter residue, but either a new narrow canonical binding-model surface or a shift to another still-open NRW Physics corridor

### 2026-04-10: Physics gets its first bundesland rollout tracker after the NRW activation

What changed:

- the first Physics rollout tracker now exists at:
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
- the first generated Physics bundesland quick view now exists at:
  - `docs/dev/canonical-gymnasium-physics-bundeslaender-status.md`
- a repository-backed renderer now exists at:
  - `scripts/render_canonical_physics_bundesland_status.py`
- the tracker currently covers the active canonical Physics states `DE-HE`, `DE-BY`, and `DE-NW`
- the parity plan and the M2 shortlist now no longer describe Physics as a two-state-only surface

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- this is a rollout-discipline step, not a new canonical Physics mapping
- it closes one real parity gap versus mathematics: Physics now has a machine-readable state tracker plus a rendered quick-view status artifact
- the next clean move can now be chosen against a visible three-state rollout surface instead of relying only on the narrower NRW lane log

### 2026-04-10: NRW Physics gets its first committed upper-secondary applicability cut

What changed:

- the canonical Physics landscape has now been realigned to the current compiled applicability state:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- this first committed NRW upper-secondary applicability cut now persists `DE-NW` on seven shared canonical targets reached by the reviewed NRW lane:
  - `Harmonische Schwingung verstehen`
  - `Gravitation und Weltbilder in GK-Aufgaben verknüpfen`
  - `Radioaktive Strahlung und Wirkungen`
  - `Zerfallsgesetze anwenden`
  - `Strahlungsrisiken mit physikalischen Größen beurteilen`
  - `Kernenergieoptionen mit physikalischen Kriterien bewerten`
  - `Kern und Hülle des Atoms qualitativ beschreiben`
- the accepted-warning registry now records the seven NRW-specific Physics `APV-202` findings explicitly:
  - `docs/qa-ci/applicability-accepted-warnings.json`
- the NRW onboarding note, lane README, tracker note, and Physics M2 shortlist now reflect that the first NRW Physics move is no longer only source- and mapping-backed, but also partially committed in canonical applicability:
  - `curricula/DE/Gymnasium/provenance/nrw-physics-onboarding.md`
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/README.md`
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  - `docs/dev/canonical-gymnasium-physics-m2-lane-shortlist.md`

Validation used:

- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent | rg '\[7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a\]|error\(s\)|warning\(s\)|accepted warning\(s\)'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `python3 -m py_compile scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check -- curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json docs/qa-ci/applicability-accepted-warnings.json curricula/DE/Gymnasium/provenance/nrw-physics-onboarding.md curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/README.md curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json docs/dev/canonical-gymnasium-physics-m2-lane-shortlist.md docs/dev/canonical-gymnasium-physics-bundeslaender-status.md`

Interpretation:

- this is the first learner-visible NRW Physics step that persists beyond the source lane and mapping fixture into the canonical applicability surface
- the NRW Physics lane still remains a reviewed partial-bridge pilot rather than a broad `P5` cutover lane, so its `APV-202` debt is retained intentionally and documented instead of being treated as unresolved drift
- the next clean move is now either one further NRW corridor that can justify another committed applicability widening, or the first Baden-Wuerttemberg upper-secondary Physics source lane

### 2026-04-11: NRW Physics matter-structure follow-on replaces the broad Standardmodell bridge with a narrow canonical atom

What changed:

- the canonical Physics landscape now contains a new narrow Q4 atom:
  - `b3f3f4f7-b5cc-40e1-b57a-3d93649baa61` `Elementare Bestandteile der Materie mit Strukturmodellen ordnen`
- the new atom sits under the existing parent cluster:
  - `7add799b-2d76-58db-81e5-d54393718f50` `Elementarteilchen und Standardmodell`
- its provenance is repository-backed in:
  - `curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json`
- the NRW mapping lane now retargets the imported LK matter child `e59d5e73-3e45-49b4-825c-11fc5a41310d` away from the broader Standardmodell cluster and onto that new narrow atom:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- after applicability persistence, both the new atom and its parent cluster now carry `DE-NW` in the canonical Physics file
- the accepted-warning registry now records the one new NRW-specific `APV-202` on the narrow atom:
  - `docs/qa-ci/applicability-accepted-warnings.json`

Validation used:

- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent | rg '\[7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a\]|error\(s\)|warning\(s\)|accepted warning\(s\)'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Interpretation:

- this is cleaner than the earlier broad cluster bridge because the new canonical atom matches the NRW wording directly without dragging in the stronger interactions/research scope of the full Standardmodell package
- the parent cluster can now become `DE-NW`-visible through normal child-union instead of through a direct broad bridge or a retained override
- the NRW Physics lane still stays in reviewed partial-bridge territory on this slice, but the matter branch is now narrower and more stable than before

### 2026-04-11: NRW Physics exact-resolves the mixed GK E/B-field clause through two narrow canonical Q1 atoms

What changed:

- the imported NRW GK field clause `70de8e83-2dad-476b-b16a-9a8ab347f13b` is no longer treated as one mapped atomic residue:
  - in the NRW source snapshot it is now a cluster with two new children
  - the shared NRW Physics source membership and closure registries now reflect `29` source goals instead of `27`
- the canonical Physics landscape now contains two new narrow Q1 atoms:
  - `741774ef-15fc-4bcf-a370-e2c5cf4257d0` `Geladene Teilchen in homogenen elektrischen Feldern untersuchen`
  - `9854589c-5feb-4942-b90f-311ddf36eb78` `Geladene Teilchen in homogenen magnetischen Feldern untersuchen`
- both new canonical atoms are repository-backed in:
  - `curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json`
- the NRW mapping lane now replaces the earlier broad parent-level partial on canonical `Q1 Elektrisches und magnetisches Feld` with two narrow exact bridges:
  - `cfcada5e-df7c-4803-894d-bd5784a38850` -> `741774ef-15fc-4bcf-a370-e2c5cf4257d0`
  - `d6a20f83-15f7-4305-8844-b6ca0883cfcc` -> `9854589c-5feb-4942-b90f-311ddf36eb78`
- the repository-backed NRW Physics mapping fixture therefore now carries `20` entries instead of `19`
- after applicability persistence, the new atoms and their reviewed Q1 parent path now carry `DE-NW`:
  - `Bewegung geladener Teilchen im elektrischen Feld`
  - `Mikroskopische und makroskopische Wirkung magnetischer Felder`
  - `Magnetisches Feld`
  - `Q1 Elektrisches und magnetisches Feld`

Validation used:

- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Interpretation:

- this is cleaner than the earlier parent-level partial on `Q1 Elektrisches und magnetisches Feld`, because the imported NRW wording is now resolved at the same granularity at which the shared Q1 field surface actually branches
- unlike the earlier matter follow-on, this step does not add new accepted-warning debt, because both NRW child bridges now land on matching narrow canonical atoms as `exact`
- the mixed NRW parent `Klassische Wellen und Teilchen in Feldern` still stays intentionally unmapped as a parent package; only its reviewed electric and wave subcorridors now carry committed NRW applicability

### 2026-04-11: NRW Physics exact-resolves the GK Quantenobjekte children through two narrow canonical Q4 atoms

What changed:

- the canonical Physics landscape now contains two new narrow Q4 entry atoms under `Quantenobjekte`:
  - `a359c859-eee0-40ef-a9d1-88db2e6c55b2` `Photonen und Elektronen als Quantenobjekte beschreiben`
  - `defe44d2-c3d3-456b-a786-fad2cef13fe8` `Die Bedeutung von Modellen an Photon und Elektron reflektieren`
- both new atoms are provenance-backed in:
  - `curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json`
- the NRW mapping lane now retargets the two imported GK child atoms away from the broad Q3 `Welle-Teilchen-Dualismus` cluster and onto those new narrow Q4 atoms as `exact`:
  - `cc33e6c0-4f16-401d-ac77-4ce89025609f` -> `a359c859-eee0-40ef-a9d1-88db2e6c55b2`
  - `9d6c16e1-30ad-4f1b-a7cb-348b1a2f7591` -> `defe44d2-c3d3-456b-a786-fad2cef13fe8`
- the NRW GK parent `Qualifikationsphase GK: Quantenobjekte` still keeps its reviewed partial bridge onto the canonical Q3 surface `Welle-Teilchen-Dualismus`
- after applicability persistence, the two new atoms and the shared canonical Q4 cluster `Quantenobjekte` now all carry `DE-NW`

Validation used:

- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Interpretation:

- this is cleaner than a direct broad bridge onto canonical `Quantenobjekte`, because the two NRW GK child wordings are now resolved as exact entry atoms instead of being forced onto the deeper Q4 package as one unspecific cluster claim
- unlike the radiation and matter follow-ons, this step does not create new accepted-warning debt; the new NRW widening is exact and the shared Q4 `Quantenobjekte` cluster follows through child-union
- all currently reviewed NRW Physics mapping targets now carry committed `DE-NW` applicability, so the next clean move is no longer another repair on the same reviewed target set but either a genuinely new NRW source corridor or the next Bundesland lane

### 2026-04-11: Baden-Wuerttemberg upper-secondary Physics opens the first reviewed field corridor

What changed:

- the official Baden-Wuerttemberg Gymnasium Physics PDF is now archived locally at:
  - `curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_PH.pdf`
- the first BW upper-secondary Physics source snapshot now exists at:
  - `curricula/DE/Gymnasium/input/BW/upper-secondary/source-json/DE_BAW_S_GYM_2_PHYSIK.de.json.snapshot`
- the new source lane is now active in the shared DE-level provenance registries:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the repository-backed BW upper-secondary Physics mapping lane now exists at:
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_physics_upper_secondary_to_canonical_physics.json`
- the first reviewed BW field corridor carries `7` mappings:
  - BW source root -> canonical Physics root (`partial`)
  - shared orientation anchor -> shared canonical motivation anchor (`exact`)
  - Basisfach `Elektromagnetische Felder` parent -> shared canonical Q1 field surface (`partial`)
  - Basisfach child `Elektrische und magnetische Felder im Basisfach beschreiben` -> shared canonical Q1 field surface (`partial`)
  - Leistungsfach `Elektromagnetische Felder` parent -> shared canonical Q1 field surface (`partial`)
  - Leistungsfach child `Elektrisches Feld im Leistungsfach untersuchen` -> canonical `Elektrisches Feld` cluster (`partial`)
  - Leistungsfach child `Magnetisches Feld im Leistungsfach untersuchen` -> canonical `Magnetisches Feld` cluster (`partial`)
- the BW onboarding note, mapping-lane README, M2 shortlist, rollout tracker, and rendered quick view now reflect that Baden-Wuerttemberg is a real fourth active Physics state on the canonical path:
  - `curricula/DE/Gymnasium/provenance/bw-physics-onboarding.md`
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/README.md`
  - `docs/dev/canonical-gymnasium-physics-m2-lane-shortlist.md`
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  - `docs/dev/canonical-gymnasium-physics-bundeslaender-status.md`

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters --silent`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Validation result:

- backend mapping/runtime bundle: `BUILD SUCCESSFUL`
- `validate:view-filters`: `0 error(s), 1383 warning(s), 345 accepted warning(s)`
- the rendered Physics Bundeslaender quick view now shows `4/4` tracked states with active snapshots and first reviewed corridors

Interpretation:

- Baden-Wuerttemberg is no longer only a reserved or source-only Physics lane; it now has the first real reviewed upper-secondary corridor on the shared canonical field surface
- this move deliberately stops before `Elektrodynamik`, `Schwingungen`, `Wellen`, any BW-specific Physics composition views, or a new BW applicability persistence pass from this lane
- the next clean BW Physics move is therefore an adjacent follow-on on `Elektrodynamik`, `Schwingungen`, or `Wellen`, not a broader state-specific tree or applicability sweep

### 2026-04-11: Baden-Wuerttemberg upper-secondary Physics adds the first LF electrodynamics follow-on and a small committed applicability cut

What changed:

- the BW upper-secondary Physics source snapshot now widens the first reviewed corridor with one adjacent Leistungsfach `Elektrodynamik` cluster plus three new atomic children:
  - `Bewegungsinduktion und Ladungstrennung`
  - `Induktionsgesetz und Lenz'sche Regel`
  - `Selbstinduktion und Induktivitaet`
- the repository-backed BW upper-secondary mapping lane now carries `10` reviewed mappings:
  - the previous `7` field-corridor mappings remain in place
  - three new exact bridges now connect the BW LF electrodynamics atoms onto the shared canonical induction surface
- the BW provenance-backed source registries now include the widened snapshot closure:
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the canonical Physics file now persists the resulting small `DE-BW` applicability cut across the field/induction closure:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- the BW onboarding note, mapping-lane README, rollout tracker, shortlist, and rendered quick view now reflect the widened corridor plus the scoped applicability persistence:
  - `curricula/DE/Gymnasium/provenance/bw-physics-onboarding.md`
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/README.md`
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  - `docs/dev/canonical-gymnasium-physics-m2-lane-shortlist.md`
  - `docs/dev/canonical-gymnasium-physics-bundeslaender-status.md`

Validation used:

- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Validation result:

- applicability persistence: `Changed 15 goal(s) across 1 file(s)`
- backend mapping/runtime bundle: `BUILD SUCCESSFUL`
- `validate:view-filters`: `0 error(s), 1382 warning(s), 345 accepted warning(s)`
- the rendered Physics Bundeslaender quick view now keeps Baden-Wuerttemberg at `P4`, but shows `Applicability yes`, `Mappings 10`, and a state projection with `18` visible goals and `0` warnings on the committed BW field/induction slice

Interpretation:

- this is still a narrow reviewed BW lane, not a broad `P5` state coverage claim; the committed applicability cut is intentionally scoped to the already reviewed field/induction closure
- the clean gain over the prior BW step is that the electrodynamics follow-on now lands on exact shared canonical induction atoms, so the first BW committed applicability persistence does not introduce new accepted-warning debt
- the next clean BW Physics move remains the still-missing `Basisfach Elektrodynamik` residue or the adjacent `Schwingungen` / `Wellen` surfaces, not BW-specific composition views or a broader applicability sweep

### 2026-04-11: Baden-Wuerttemberg upper-secondary Physics adds the Basisfach electrodynamics induction strip

What changed:

- the BW upper-secondary Physics source snapshot now widens the imported Basisfach side with one adjacent `Basisfach: Elektrodynamik` cluster plus three retained atomic children:
  - `Bewegungsinduktion und Ladungstrennung im Basisfach`
  - `Induktionsgesetz und Lenz'sche Regel im Basisfach`
  - `Selbstinduktion und Induktivitaet im Basisfach`
- the repository-backed BW upper-secondary mapping lane now carries `14` reviewed mappings:
  - the earlier `10` reviewed mappings remain in place
  - the new Basisfach electrodynamics parent now bridges conservatively onto the canonical induction cluster (`partial`)
  - the new Basisfach induction leaves now bridge onto the shared canonical induction atoms with one `exact` alignment on `Bewegungsinduktion` and two conservative `partial` alignments on `Induktionsgesetz` and `Selbstinduktion`
- the BW provenance-backed source registries now include the widened snapshot membership and closure for `15` source goals and `10` atomic descendants under the active root:
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the BW onboarding note, mapping-lane README, rollout tracker, shortlist, and rendered quick view now reflect the Basisfach electrodynamics widening:
  - `curricula/DE/Gymnasium/provenance/bw-physics-onboarding.md`
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/README.md`
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  - `docs/dev/canonical-gymnasium-physics-m2-lane-shortlist.md`
  - `docs/dev/canonical-gymnasium-physics-bundeslaender-status.md`

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters --silent`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Validation result:

- backend mapping/runtime bundle: `BUILD SUCCESSFUL`
- `validate:view-filters`: `0 error(s), 1382 warning(s), 345 accepted warning(s)`
- the rendered Physics Bundeslaender quick view now keeps Baden-Wuerttemberg at `P4`, still with `Applicability yes`, but updates the BW lane to `Mappings 14`

Interpretation:

- this keeps the BW lane narrow and source-led: the imported Basisfach `Elektrodynamik` row is only widened on the induction strip, while the remaining source residue on technical applications and Maxwell overview is still intentionally deferred
- the two new Basisfach `partial` atom bridges do not create new accepted-warning debt, because the corresponding canonical induction targets already carry committed `DE-BW` applicability from the earlier LF follow-on
- the next clean BW Physics move is now either the still-unmapped BF `technische Anwendungen` / `Maxwell-Ueberblick` residue of `3.4.2.2 Elektrodynamik` or the adjacent `Schwingungen` / `Wellen` surfaces

### 2026-04-11: Baden-Wuerttemberg upper-secondary Physics anchors the BF induction-applications residue on one new canonical atom

What changed:

- the BW upper-secondary Physics source snapshot now retain-splits the remaining Basisfach `3.4.2.2 Elektrodynamik` residue into two explicit children:
  - `Technische Anwendungen des Induktionsgesetzes im Basisfach beschreiben`
  - `Elektromagnetische Felder im Maxwell-Ueberblick beschreiben`
- the repository-backed BW upper-secondary mapping lane now carries `15` reviewed mappings:
  - the new Basisfach applications child now exact-anchors onto one new narrow canonical atom `Technische Anwendungen des Induktionsgesetzes qualitativ beschreiben`
  - the new Maxwell-overview child remains intentionally ungemappt
- the canonical Physics file now contains that new narrow induction-applications atom under the shared Q2 induction cluster:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- the canonical-goal provenance registry now records the new canonical atom as source-led from the BW Basisfach applications child:
  - `curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json`
- the BW provenance-backed source registries now include the widened snapshot membership and closure for `17` source goals and `12` atomic descendants under the active root:
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the BW onboarding note, mapping-lane README, rollout tracker, shortlist, and rendered quick view now reflect the new BF applications follow-on while keeping the Maxwell residue explicit:
  - `curricula/DE/Gymnasium/provenance/bw-physics-onboarding.md`
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/README.md`
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  - `docs/dev/canonical-gymnasium-physics-m2-lane-shortlist.md`
  - `docs/dev/canonical-gymnasium-physics-bundeslaender-status.md`

Validation used:

- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters --silent | rg '\[7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a\]|error\(s\)|warning\(s\)|accepted warning\(s\)'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Validation result:

- applicability persistence check: `Changed 0 goal(s) across 0 file(s)`
- backend mapping/runtime bundle: `BUILD SUCCESSFUL`
- Physics validation scope stays at `0 error(s), 1382 warning(s), 345 accepted warning(s)`
- the rendered Physics Bundeslaender quick view now keeps Baden-Wuerttemberg at `P4`, still with `Applicability yes`, and updates the BW lane to `Mappings 15`

Interpretation:

- this is cleaner than forcing the BW Basisfach applications wording onto the narrower existing `Wirbelströme und Waltenhofen-Pendel` context leaf; the new canonical applications atom is broad enough for generator/transformator/induction-device examples without dragging the Maxwell clause into the same bridge
- the new BW widening stays debt-neutral: the new BW applications bridge is `exact`, and the already committed BW field/induction closure required no further applicability file changes
- the next clean BW Physics move is now either the still-unmapped BF `Maxwell-Ueberblick` residue of `3.4.2.2 Elektrodynamik` or the adjacent `Schwingungen` / `Wellen` surfaces

### 2026-04-11: Baden-Wuerttemberg upper-secondary Physics closes the BF Maxwell-overview residue on one new canonical atom

What changed:

- the repository-backed BW upper-secondary mapping lane now carries `16` reviewed mappings:
  - the existing `15` reviewed mappings remain in place
  - the retained BW Basisfach child `Elektromagnetische Felder im Maxwell-Ueberblick beschreiben` now exact-anchors onto one new narrow canonical atom `Elektromagnetische Felder im Maxwell-Ueberblick beschreiben`
- the canonical Physics file now contains that new narrow Maxwell-overview atom under the shared Q2 induction cluster:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- the canonical-goal provenance registry now records the new canonical atom as source-led from the BW Basisfach Maxwell child:
  - `curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json`
- the BW onboarding note, mapping-lane README, rollout tracker, shortlist, and rendered quick view now reflect that the imported Basisfach `3.4.2.2 Elektrodynamik` row is now fully reviewed on the current BW lane:
  - `curricula/DE/Gymnasium/provenance/bw-physics-onboarding.md`
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/README.md`
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  - `docs/dev/canonical-gymnasium-physics-m2-lane-shortlist.md`
  - `docs/dev/canonical-gymnasium-physics-bundeslaender-status.md`

Validation used:

- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters --silent | rg '\[7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a\]|error\(s\)|warning\(s\)|accepted warning\(s\)'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Validation result:

- applicability persistence check: `Changed 0 goal(s) across 0 file(s)`
- backend mapping/runtime bundle: `BUILD SUCCESSFUL`
- Physics validation scope stays at `0 error(s), 1382 warning(s), 345 accepted warning(s)`
- the rendered Physics Bundeslaender quick view now keeps Baden-Wuerttemberg at `P4`, still with `Applicability yes`, and updates the BW lane to `Mappings 16`

Interpretation:

- this is cleaner than trying to force the BW Maxwell clause into the canonical `Elektromagnetische Wellen` package; the new narrow atom states exactly the overview claim the source wording makes, without overclaiming the later Q3 wave surface
- the new BW widening also stays debt-neutral: the new Maxwell-overview bridge is `exact`, and the already committed BW field/induction closure again required no further applicability file changes
- the next clean BW Physics move now shifts fully onto the adjacent `Schwingungen` / `Wellen` surfaces

### 2026-04-11: Baden-Wuerttemberg upper-secondary Physics adds the first BF Schwingungen follow-on

What changed:

- the BW upper-secondary Physics source snapshot now widens the imported Basisfach side with one adjacent `Basisfach: Schwingungen` cluster plus six retained atomic children:
  - `Schwingungen experimentell aufzeichnen und als periodische Bewegungen beschreiben`
  - `Ungedaempfte harmonische Schwingungen mathematisch beschreiben`
  - `Lineare Rueckstellkraft bei harmonischen mechanischen Schwingungen beschreiben`
  - `Schwingung eines Federpendels und Energieumwandlungen beschreiben`
  - `Schwingung in einem elektromagnetischen Schwingkreis und Energieumwandlungen beschreiben`
  - `Mechanische und elektromagnetische Schwingungen vergleichen`
- the repository-backed BW upper-secondary mapping lane now carries `21` reviewed mappings:
  - the earlier `16` reviewed mappings remain in place
  - the new Basisfach `Schwingungen` parent now bridges conservatively onto the shared canonical Q2 surface `Schwingungen, Induktion und mechanische Wellen`
  - four new conservative partial bridges now connect the imported Basisfach `Schwingungen` children onto the existing canonical Q2 atoms `Harmonische Schwingung verstehen`, `Charakteristische Schwingungsgroessen`, `Energie und Energieerhaltung in Schwingungen`, and `Elektromagnetischen Schwingkreis analysieren`
  - the retained source children on `lineare Rueckstellkraft` and on the explicit comparison of mechanischen versus elektromagnetischen Schwingungen stay intentionally source-led
- the scoped canonical Physics applicability persistence now widens the earlier BW field/induction cut onto the shared Q2 oscillation strip, and the four resulting BW-only `APV-202` findings are now explicitly accepted:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
  - `docs/qa-ci/applicability-accepted-warnings.json`
- the BW provenance-backed source registries now include the widened snapshot membership and closure for `24` source goals and `18` atomic descendants under the active root:
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the BW onboarding note, mapping-lane README, rollout tracker, shortlist, and rendered quick view now reflect the new Basisfach `Schwingungen` follow-on while keeping `Wellen` and Leistungsfach `Schwingungen` deferred:
  - `curricula/DE/Gymnasium/provenance/bw-physics-onboarding.md`
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/README.md`
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  - `docs/dev/canonical-gymnasium-physics-m2-lane-shortlist.md`
  - `docs/dev/canonical-gymnasium-physics-bundeslaender-status.md`

Validation used:

- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && npm run validate:view-filters --silent`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Validation result:

- backend mapping/runtime bundle: `BUILD SUCCESSFUL`
- `validate:view-filters`: `0 error(s), 1416 warning(s), 349 accepted warning(s)`
- the rendered Physics Bundeslaender quick view now keeps Baden-Wuerttemberg at `P4`, still with `Applicability yes`, and updates the BW lane to `Mappings 21`

Interpretation:

- this is cleaner than inventing new canonical oscillation atoms for BW immediately; the imported Basisfach `Schwingungen` wording is now narrowed to a reviewed source split first, and only the four cleanest alignments land conservatively on existing shared Q2 targets
- the widening now also commits the resulting BW visibility on the shared Q2 oscillation strip instead of leaving `APV-203` drift in the canonical Physics file; the remaining four BW-only `APV-202` findings are intentionally accepted because the bridges stay conservative `partial`
- the next clean BW Physics move is now either the adjacent `Wellen` surface or the still-unopened Leistungsfach `Schwingungen` strip, not BW-specific composition views or a broader applicability sweep

### 2026-04-11: BW upper-secondary Physics opens the adjacent Basisfach `Wellen` corridor

Observed repo state:

- the BW upper-secondary Physics source snapshot now widens the imported Basisfach side with one adjacent `Basisfach: Wellen` cluster plus six retained atomic children:
  - `Wellen mithilfe charakteristischer Eigenschaften und Groessen beschreiben`
  - `Grundlegende Wellenphaenomene beschreiben und in Alltagssituationen erkennen`
  - `Eindimensionale stehende Wellen beschreiben und als Interferenzphaenomen erklaeren`
  - `Ueberlagerung zweidimensionaler koehaerenter Wellen mithilfe des Gangunterschieds qualitativ beschreiben`
  - `Grundlegende Wellenphaenomene mithilfe des Huygens'schen Prinzips erklaeren`
  - `Das elektromagnetische Spektrum im Ueberblick beschreiben`
- the repository-backed BW upper-secondary mapping lane now carries `28` reviewed mappings:
  - the earlier `21` reviewed mappings remain in place
  - the new Basisfach `Wellen` parent now bridges conservatively onto the canonical `Mechanische Wellen` cluster
  - six new conservative partial bridges now connect the imported Basisfach `Wellen` children onto the existing canonical atoms `Harmonische Wellen und ihre Groessen`, `Wellenphaenomene: Brechung, Reflexion, Beugung`, `Stehende Wellen und Wellenlaengenbestimmung`, `Ueberlagerung und Interferenz von Wellen`, `Huygens'sches Prinzip und Elementarwellen`, and `Spektrum elektromagnetischer Wellen`
- the scoped canonical Physics applicability persistence now widens the earlier BW field/induction and oscillation cut onto the shared mechanical-wave strip plus the first electromagnetic-spectrum entry:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- five resulting BW-only `APV-202` findings on the newly committed Wellen-Atome are now explicitly accepted:
  - `docs/qa-ci/applicability-accepted-warnings.json`
- the BW provenance-backed source registries now include the widened snapshot membership and closure for `31` source goals and `24` atomic descendants under the active root:
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the BW onboarding note, mapping-lane README, rollout tracker, shortlist, and rendered quick view now reflect the new Basisfach `Wellen` follow-on while keeping Leistungsfach `Schwingungen` deferred:
  - `curricula/DE/Gymnasium/provenance/bw-physics-onboarding.md`
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/README.md`
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  - `docs/dev/canonical-gymnasium-physics-m2-lane-shortlist.md`
  - `docs/dev/canonical-gymnasium-physics-bundeslaender-status.md`

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Validation result:

- backend mapping/runtime bundle: `BUILD SUCCESSFUL`
- `apply:applicability`: `Changed 49 goal(s) across 1 file(s)`
- `validate:view-filters`: `0 error(s), 1382 warning(s), 354 accepted warning(s)`
- the rendered Physics Bundeslaender quick view now keeps Baden-Wuerttemberg at `P4`, still with `Applicability yes`, and updates the BW lane to `Mappings 28`

Interpretation:

- this is cleaner than inventing new canonical Wellen-Atome for BW immediately; the imported Basisfach `Wellen` wording now lands conservatively on existing shared Q2/Q3 targets and only carries what the current source split actually supports
- the widening now also commits the resulting BW visibility on the shared mechanical-wave strip and the first electromagnetic-spectrum entry instead of leaving `APV-203` drift in the canonical Physics file; the remaining five BW-only `APV-202` findings are intentionally accepted because the bridges stay conservative `partial`
- the next clean BW Physics move is now the still-unopened Leistungsfach `Schwingungen` strip, not BW-specific composition views or a broader applicability sweep

## Snapshot 2026-03-18

Observed repo state:

- Canonical DE Gymnasium files present: `21`
  - `1` overview
  - `20` subject files
- Hessen upper-secondary mapping files present: `16`
- Hessen Sek I mapping files present: `5`
- Bavaria Gymnasium adopted mapping files present: `21`
- `npm run validate:view-filters` currently returns `0` errors, `0` active warnings, `139` accepted warnings
- the current on-disk retained-asset lanes live under `curricula/DE/Gymnasium/input/HE/` and `curricula/DE/Gymnasium/input/BY/`; tooling still normalizes older registry references that use `DE-HE` / `DE-BY`
- `python3 scripts/validate_bavaria_gymnasium_legacy_refs.py` currently passes with `0` violations while reporting `Legacy tree present: no`
- `python3 scripts/validate_bavaria_gymnasium_archive_paths.py` currently passes with `0` violations
- `bash scripts/run_bavaria_gymnasium_delete_handoff_dry_run.sh` currently passes with `DELETE_HANDOFF_PRECHECK=OK`
- the Bavaria Sek-I mathematics surface now spans the shared canonical `J5-J10` spine with `64` reviewed mappings, including first explicit subrow refinement for `M8 3`, `M8 4`, `M9 3`, `M9 7`, and `M10 2`
- the Bavaria Informatics pilot now adds `84` reviewed mappings into the canonical DE informatics layer, yielding `45` committed `DE-BY` applicability nodes plus a direct Bavaria `Informatik` cutover path into `Gymnasium (DE)`
- the Bavaria Wirtschaft-und-Recht pilot now adds `27` reviewed mappings into the canonical DE economics layer, yielding `26` committed `DE-BY` applicability nodes plus a direct Bavaria `Wirtschaft und Recht` cutover path into `Gymnasium (DE)`
- the Bavaria German pilot now adds `16` reviewed mappings into the canonical DE German layer, yielding `13` committed `DE-BY` applicability nodes plus a direct Bavaria `Deutsch` cutover path into `Gymnasium (DE)`
- the Bavaria English pilot now adds `11` reviewed mappings into the canonical DE English layer, yielding `2` committed `DE-BY` applicability nodes on the currently reviewed English surface plus a direct Bavaria `Englisch` cutover path into `Gymnasium (DE)`
- the Bavaria French pilot now adds `11` reviewed mappings into the canonical DE French layer, yielding `3` committed `DE-BY` applicability nodes on the currently reviewed French surface plus a direct Bavaria `Französisch` cutover path into `Gymnasium (DE)`
- the Bavaria Spanish pilot now adds `8` reviewed mappings into the canonical DE Spanish layer, yielding `2` committed `DE-BY` applicability nodes on the currently reviewed Spanish surface plus a direct Bavaria `Spanisch` cutover path into `Gymnasium (DE)`
- the Bavaria Italian pilot now adds `8` reviewed mappings into the canonical DE Italian layer, yielding `8` committed `DE-BY` applicability nodes plus a direct Bavaria `Italienisch` cutover path into `Gymnasium (DE)`
- the Bavaria Russian pilot now adds `8` reviewed mappings into the canonical DE Russian layer, yielding `8` committed `DE-BY` applicability nodes plus a direct Bavaria `Russisch` cutover path into `Gymnasium (DE)`
- the Bavaria Polish pilot now adds `5` reviewed mappings into the canonical DE Polish layer, yielding `5` committed `DE-BY` applicability nodes plus a direct Bavaria `Polnisch` cutover path into `Gymnasium (DE)`
- the Bavaria Czech pilot now adds `5` reviewed mappings into the canonical DE Czech layer, yielding `5` committed `DE-BY` applicability nodes plus a direct Bavaria `Tschechisch` cutover path into `Gymnasium (DE)`
- the Bavaria History pilot now adds `56` reviewed mappings into the canonical DE history layer, yielding `58` committed `DE-BY` applicability nodes through the first reviewed mixed `G8` / `G9` bridge plus a direct Bavaria `Geschichte` cutover path into `Gymnasium (DE)`
- the Bavaria Greek pilot now adds `14` reviewed mappings into the canonical DE Greek layer, yielding `11` committed `DE-BY` applicability nodes on an early reviewed `E-Phase` bridge plus a direct Bavaria `Griechisch` cutover path into `Gymnasium (DE)`
- the Bavaria Politik-und-Gesellschaft pilot now adds `39` reviewed mappings into the canonical DE politics/economics layer, yielding `22` committed `DE-BY` applicability nodes across a reviewed mixed `G8` / `G9` bridge plus a direct Bavaria `Politik und Gesellschaft` cutover path into `Gymnasium (DE)`
- the Bavaria Latin pilot now adds `15` reviewed mappings into the canonical DE Latin layer, yielding `16` committed `DE-BY` applicability nodes plus a direct Bavaria `Latein` cutover path into `Gymnasium (DE)`
- the Bavaria Music pilot now adds `15` reviewed mappings into the canonical DE music layer, yielding `15` committed `DE-BY` applicability nodes plus a direct Bavaria `Musik` cutover path into `Gymnasium (DE)`
- the Bavaria Chinese pilot now adds `35` reviewed mappings into the canonical DE Chinese layer, yielding `33` committed `DE-BY` applicability nodes plus a direct Bavaria `Chinesisch` cutover path into `Gymnasium (DE)`
- the Hessen Sek-I mathematics landscape now carries `33` explicit mappings and reaches reviewed row coverage beyond the old function/quadratic slice: J5 number basics, linear equations/inequalities, quadratic binomial-form routes, roots, similarity/Strahlensatz, Pythagoras, circle/cylinder, and integer-exponent rules
- the reviewed Hessen Sek-I mathematics landscape no longer carries any `APV-202` findings; remaining reviewed math debt is now limited to the two Bayern override-backed `APV-201` cases
- the Hessen Sek-I physics mechanics bridge now closes the old `7.4 Mechanik` row at exact reviewed coverage: a dedicated canonical density/mass/volume atom plus exact row- and subrow-mappings now cover the full Hessen mechanics anchor, while `Kräfteigenschaften nutzen` and `10.1 Arbeit und Energie` already bind to their own reviewed canonical targets
- the Hessen Sek-I physics heat bridge now closes the foundational `7.2 Wärmelehre` row at exact reviewed coverage: temperature/heat, temperature measurement and expansion, particle model, and heat transfer all map exactly into a dedicated canonical Sek-I heat cluster that also backs the later `J10` heat-energy route
- the Hessen Sek-I physics optics bridge now spans both reviewed source rows `7.1 Optik 1` and `8.1 Optik 2`: light propagation, ray model, reflection, lens imaging, vision, and simple optical instruments all map exactly into dedicated canonical Sek-I optics anchors
- the Hessen Sek-I physics electricity bridge now spans both reviewed source rows `7.3 Magnetismus und Elektrizität 1` and `8.2 Elektrizität 2`: magnets, simple circuits, current effects, current measurement, static electricity/voltage, current-voltage relation, resistor circuits, and electrical safety all map exactly into dedicated canonical Sek-I electricity anchors
- the Hessen Sek-I physics pressure/buoyancy bridge now closes the fakultative `8.3 Druck und Auftrieb` row at exact reviewed coverage: pressure in liquids and gases, qualitative pressure-temperature relations, Archimedes' principle, and first flight/air-resistance interpretations all map exactly into a dedicated canonical Sek-I pressure-and-buoyancy cluster that depends on the reviewed mechanics base and reuses the reviewed heat bridge for the gas-pressure branch
- the Hessen Sek-I physics acoustics bridge now closes the fakultative `8.3b Akustik` row at exact reviewed coverage: sound sources, sound propagation, pitch/loudness, hearing/noise, and music-related sound phenomena all map exactly into a dedicated canonical Sek-I acoustics cluster that reuses the reviewed particle-model anchor and now also feeds the upper-secondary Q2 wave entry point
- the Hessen Sek-I physics colors bridge now closes the fakultative `8.3c Farben` row at exact reviewed coverage: color origin/decomposition, additive and subtractive color mixing, simple color perception, and technical color applications all map exactly into a dedicated canonical Sek-I colors cluster that reuses the reviewed light-propagation anchor and now also feeds the upper-secondary Q3 electromagnetic-spectrum entry point
- the Hessen Sek-I physics radioactivity bridge now closes the non-fakultative `10.2 Radioaktivität` row at exact reviewed coverage: atomic structure, radiation detection/effects, and applications/risks all map exactly into a dedicated canonical Sek-I radioactivity cluster that now also feeds the upper-secondary nuclear-physics entry point
- the Hessen Sek-I physics work/energy bridge now reaches into the `J10` continuation of `10.1 Arbeit und Energie`: `Wärme als Energieform` and `Elektrische Energie nutzen` both map exactly into dedicated canonical energy atoms, with the heat-energy route depending explicitly on the reviewed Sek-I heat bridge and the electrical-energy route on the reviewed voltage bridge
- the Hessen Sek-I chemistry foundations bridge now closes the full reviewed `8.1 Stoffe – Strukturen – Eigenschaften` row at exact coverage: hazard symbols/safety rules and separation methods now join the already adopted working-methods, substance, state, solution, and first acid-base anchors, so the old `8.1` cluster itself now maps exactly into the canonical Sek-I chemistry foundations cluster
- the Hessen Sek-I chemistry reactions bridge now extends the reviewed adoption into `8.2 Chemische Reaktion – Stoff- und Energieumsatz`: reaction characteristics, simple oxidation/reduction, combustion, reaction energy, and conservation of mass all map exactly into a dedicated canonical Sek-I reactions cluster, and the upper-secondary `Einfache Redoxreihen aufstellen` route now depends explicitly on the projected Sek-I redox anchor
- the Hessen Sek-I chemistry symbol-language bridge now closes the reviewed `9.1 Chemische Symbolsprache und Anwendung` row at exact coverage: constant proportions, Dalton model, chemical symbols/formulas, simple reaction equations, and first redox schemes all map exactly into a dedicated canonical Sek-I symbol-language cluster that reuses the reviewed `8.2` reactions bridge
- the Hessen Sek-I chemistry ions/electrolysis bridge now closes the reviewed `9.3 Elektrolyse und Ionenbegriff` row at exact coverage: conductivity, ions as charge carriers, and electrolysis of aqueous salt solutions all map exactly into a dedicated canonical Sek-I ions/electrolysis cluster that reuses the reviewed `9.1` symbol-language bridge and now also backs the upper-secondary `Elektrolyse beschreiben` route
- the Hessen Sek-I chemistry atomic-structure bridge now closes the reviewed `10.1 Atombau, Periodensystem und Ionenbindung` row at exact coverage: core-shell model, Bohr energy levels, periodic-table orientation, ion formation via noble-gas rule, and ionic bonding all map exactly into a dedicated canonical Sek-I atomic-structure-and-bonding cluster that reuses the reviewed `9.1` symbol-language bridge and now also backs the upper-secondary `Bindungsmodelle sicher nutzen` route
- Explicit learner cutover path to `Gymnasium (DE)` exists in backend and UI
- Bulk cutover path for operators exists
- the Hessen Sek-I learner cutover path now also covers the frozen mixed overview root across the currently supported `Mathematik`/`Physik`/`Chemie`/`Biologie`/`Französisch` surface; lower-secondary physics still auto-selects canonical mathematics for the existing bridge prerequisites, and lower-secondary French now cuts over onto the shared canonical French landscape instead of blocking mixed-overview retirement
- the first Bavaria learner cutover path is now operational for direct legacy `Mathematik` learners: Bavaria `Mathematik` can migrate into `Gymnasium (DE)` with the root filter `DE-BY`, canonical Mathematics selected, and normalized planned-scope continuation on the shared canonical Math spine
- ordinary learner entry now also prefers the canonical DE path over the Bavaria legacy root: `Gymnasium (Bayern)` is hidden by default from general overview/bootstrap surfaces and only retained when it is already the active learner selection
- the active Bavaria Math/Physics/Chemistry/Biology/Informatik/Geschichte/Deutsch/Englisch/Französisch/Spanisch/Italienisch/Russisch/Polnisch/Tschechisch/Griechisch/Wirtschaft_und_Recht/Politik_und_Gesellschaft/Latein/Musik/Chinesisch adopted corridor no longer hangs off the retired `curricula/DE/BY/Gymnasium` path: the adopted Bavaria mappings now live under `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/`, the shared source-landscape registry now exposes `archiveSourcePath` for the current adopted Bavaria source landscapes, and `scripts/validate_bavaria_gymnasium_archive_paths.py` plus `scripts/validate_bavaria_gymnasium_legacy_refs.py` now fence the DE-level retained-source lane and repo-level operational references
- the currently supported Bavaria legacy mathematics learner path is now detached as an active runtime path: direct `Mathematik` sessions are frontend- and backend-read-only retirement views, UI/AI write endpoints reject mutations, and the canonical `Gymnasium (DE)` + `DE-BY` cutover remains the supported continuation
- the current Bavaria Physics pilot surface now has the same direct learner-cutover and retirement handling: direct legacy `Physik` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Physics selected plus the required Math bridge, and active legacy Physics sessions are frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Chemistry and Biology pilot surfaces now also have direct learner-cutover and retirement handling: direct legacy `Chemie` and `Biologie` learners migrate into `Gymnasium (DE)` with `DE-BY`, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Informatics pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Informatik` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Informatics selected, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria German pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Deutsch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical German selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria English pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Englisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical English selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria French pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Französisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical French selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Spanish pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Spanisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Spanish selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Italian pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Italienisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Italian selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Russian pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Russisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Russian selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Polish pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Polnisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Polish selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Czech pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Tschechisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Czech selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria History pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Geschichte` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical History selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Greek pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Griechisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Greek selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Wirtschaft-und-Recht pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Wirtschaft und Recht` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical `Wirtschaftswissenschaften` selected, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Politik-und-Gesellschaft pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Politik und Gesellschaft` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical `Politik und Wirtschaft` selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Latin pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Latein` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Latin selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Music pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Musik` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Music selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Chinese pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Chinesisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Chinese selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- Bavaria Math/Physics/Chemistry/Biology source-goal closures and goal memberships now also live in the shared DE-level provenance registries `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json` and `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`, so the current adopted Bavaria corridor no longer depends on the live legacy tree for archived closure or membership lookups
- the full live Bavaria Gymnasium legacy tree now classifies as compatibility-only on the active runtime path: explicit UI/AI curriculum selection no longer routes fresh learners back into Bavaria legacy root or subject views, while general learner entry continues to prefer `Gymnasium (DE)` and existing retired sessions remain archive/cutover-only
- ordinary learner entry now also prefers the canonical DE path over Hessen Sek-I legacy roots: lower-secondary Hessen landscapes are hidden by default from the general overview/bootstrap surface and only reappear when they are already the active selection
- the frozen Hessen Sek-I source-JSON lane is now mirrored under `curricula/DE/Gymnasium/input/HE/lower-secondary/source-json/` (`6` files), and the shared source-landscape registry now also offers `archiveSourcePath` for those lower-secondary landscapes so provenance survives outside the live legacy tree
- Hessen Sek-I source-goal atomic closures and goal memberships now also live in the shared DE-level provenance registries `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json` and `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`, so lower overview/root survival no longer depends on expanding the live legacy tree for archived closure or membership lookups
- Hessen Sek-I legacy learner sessions are now detached as active runtime paths across the currently supported lower-secondary bundle: `Mathematik`/`Physik`/`Chemie`/`Biologie`/`Französisch` sessions, including mixed overview sessions that resolve into that bundle, are frontend- and backend-read-only once the canonical cutover surface is available
- Hessen Sek-I legacy-to-canonical mapping fixtures now also live in the DE-level archive lane `curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/`
- frozen Hessen Sek-I compatibility summaries and topic lists now also resolve from the DE-level archive registries `curricula/DE/Gymnasium/archive/compatibility-landscape-registry.json` and `curricula/DE/Gymnasium/archive/compatibility-topic-summary-registry.json`
- `scripts/validate_hessen_lower_secondary_archive_paths.py` and `scripts/validate_hessen_lower_secondary_legacy_refs.py` now fence retained-asset and repo-level references for Hessen Sek-I, and both checks are wired into `.github/workflows/ci.yml` plus local `run_ci.sh`
- the Hessen lower-secondary delete handoff has now been executed: the original tree is gone from the active repo path, and `bash scripts/run_hessen_lower_secondary_delete_handoff_dry_run.sh` now serves as the post-retirement verification command against the surviving archive/provenance/mapping lanes
- Hessen upper-secondary legacy-to-canonical mapping fixtures now live in the DE-level archive `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/`
- Hessen upper-secondary source-landscape jurisdiction metadata now lives in the DE-level provenance registry `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`, and both backend state filtering and the applicability compiler read from that stable path
- Hessen upper-secondary source-goal atomic closures now live in the DE-level provenance registry `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`, and canonical champion/topic metrics can read that frozen closure instead of expanding the live legacy tree
- Hessen upper-secondary source-goal memberships now also live in the DE-level provenance registry `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`, and Hessen cutover can infer subject membership for stored legacy planned/active goal IDs without loading the live legacy source tree
- learner-facing curriculum selection now exposes frozen Hessen upper-secondary roots and subjects as explicit compatibility views instead of mixing them into the ordinary recommended selection flow
- ordinary session-start and championship-registration pickers now hide compatibility views by default and only retain them when they are already the active selection
- backend bootstrap for new learners now also delivers recommended curricula without compatibility views by default, and `/api/ui/landscapes` supports an explicit `includeCompatibility` switch instead of forcing the frontend to guess
- the learner cockpit setup now also demotes Hessen compatibility subjects into an explicitly revealable secondary section, and canonical `Gymnasium (DE)` setups prune stale Hessen compatibility entries from persisted personal curriculum configs
- when a learner is still inside a Hessen compatibility session, the cockpit setup dialog now runs in retirement-only mode instead of acting as a normal curriculum editor; migration/audit remain available there, but regular curriculum reconfiguration is no longer part of that path
- the learner cockpit now also treats open Hessen compatibility sessions as read-only/audit-only for planning, active-goal selection, and SRS drilling; the legacy session remains visible, but no longer behaves like a normal active learning path
- UI and AI write endpoints now also reject compatibility-session writes server-side for curriculum mutation, planning, active-goal changes, mastery, and client-state updates, so the retained Hessen route is backend-read-only as well as frontend-read-only
- UI and AI learner-state routes no longer serve retained Hessen compatibility sessions at all as live state views; instead, the UI exposes a dedicated compatibility-archive export that snapshots the retired Hessen state for audit/recovery
- the compatibility-archive export now resolves retired Hessen curriculum summaries from the frozen DE-level archive registry `curricula/DE/Gymnasium/archive/compatibility-landscape-registry.json` and serializes raw persisted learner state, so archive generation no longer depends on projecting a live legacy landscape graph
- `/api/ui/landscapes?includeCompatibility=true` now also resolves Hessen compatibility summaries from the frozen DE-level archive registry `curricula/DE/Gymnasium/archive/compatibility-landscape-registry.json`, so compatibility overview/listing metadata no longer depends on loaded Hessen upper-secondary landscape files
- `/api/ui/curricula/{curriculumId}/topics` now also resolves Hessen compatibility topic lists from the frozen DE-level archive registry `curricula/DE/Gymnasium/archive/compatibility-topic-summary-registry.json`, and direct Hessen compatibility `/api/ui/landscapes/{id}` plus `/closure` routes are retired
- the `Abi26` Hessen mathematics bootstrap now provisions learners onto canonical `Gymnasium (DE)` with the `DE-HE` root filter plus canonical mathematics `GK`/`LK` scope, instead of selecting the retired Hessen mathematics curriculum directly
- new UI and AI curriculum-selection writes now also reject retired Hessen compatibility IDs even when a caller already knows them, so compatibility routes are no longer re-openable as fresh learner selections
- Hessen upper-secondary exam/deploy/adoption helper tooling now resolves retained `abi/` defaults plus archived mapping defaults from the DE-level lanes `curricula/DE/Gymnasium/input/DE-HE/` and `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/` via a shared retained-asset registry, while legacy subject-landscape lookup is centralized through the DE-level provenance source registry instead of per-script hardcoded legacy paths
- DE-level Hessen `abi/` operational metadata now follows the same handoff: `task_bank.json` stores `sourceLandscapeId` plus `curricula/DE/Gymnasium/provenance/source-landscape-registry.json` instead of embedding legacy landscape file paths, and blueprint/source-catalog/release-bundle source references now point only at retained DE-level `curricula/DE/Gymnasium/input/DE-HE/...` assets
- repo-authored Hessen `abi/` markdown (`exam-pipeline.md`, physics authoring/QS docs, LEIFI README) is now aligned to the same DE-level archive/provenance lane; remaining legacy path strings inside `HE/abi/` are confined to imported/raw archival texts such as source-extracted markdown and official text excerpts
- that remaining raw-provenance boundary is now machine-checked by `scripts/validate_hessen_upper_secondary_archive_paths.py`, with the explicit allowlist stored in `curricula/DE/Gymnasium/input/HE/retained-asset-registry.json`
- the Hessen upper-secondary archive-boundary validator is now wired into both `.github/workflows/ci.yml` (`graph-validation`) and local `run_ci.sh`, so regressions on retained-vs-raw archive path usage fail the standard QA path instead of relying on ad-hoc manual checks
- the remaining repo-level references to `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` are now also narrowed to an explicit handoff allowlist in `curricula/DE/Gymnasium/provenance/hessen-upper-secondary-retirement-registry.json`; active operational surfaces are machine-checked by `scripts/validate_hessen_upper_secondary_legacy_refs.py`, and the old root helper scripts no longer carry hardcoded Hessen legacy defaults
- backend/src is now free of explicit Hessen upper-secondary tree references; the remaining allowlisted repo-level references are reduced to `7` explicit handoff files: provenance/input descriptors plus the validator/dry-run scripts that police that boundary
- the frozen Hessen upper-secondary source-JSON lane is now mirrored under `curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/` (`39` files), and the shared source-landscape registry now offers `archiveSourcePath` so tooling can read those snapshots without depending on the live legacy tree
- backend landscape loading now also falls back to those archived Hessen upper-secondary source snapshots, so retired curriculum IDs remain resolvable for release metadata, frontier invariants, and explicit retirement/conflict handling even after the old tree is gone
- the Hessen upper-secondary delete handoff has now actually been executed: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` is gone from the active repo path, and `bash scripts/run_hessen_upper_secondary_delete_handoff_dry_run.sh` now serves as the post-retirement verification command over the surviving DE-level archive/provenance lanes
- `scripts/validate_hessen_upper_secondary_legacy_refs.py` now enforces not only the allowlisted textual reference boundary, but also that the retired Hessen upper-secondary tree stays absent from the active repo
- Reviewed canonical landscapes now carry committed node-level `applicability`; the currently enforced CI set now covers the full committed DE Gymnasium canonical set: `Mathematik`, `Physik`, `Chemie`, `Biologie`, `Informatik`, `Deutsch`, `Englisch`, `Französisch`, `Griechisch`, `Chinesisch`, `Geschichte`, `Politik und Wirtschaft`, `Musik`, `Latein`, `Spanisch`, `Italienisch`, `Russisch`, `Polnisch`, `Tschechisch`, `Wirtschaft`, `Overview`
- `validate:view-filters` is now clean on active reviewed findings for that scope: `0` errors, `0` active warnings, `139` accepted warnings recorded in `docs/qa-ci/applicability-accepted-warnings.json`
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` has now crossed from `legacy_view_retained` to `legacy_deleted` at tree level: only the DE-level input/provenance lanes survive as operational artifacts
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` is the first tracked legacy source tree that has actually been deleted from the active repo
- the migration has therefore entered the explicit close-out phase: the remaining work is now dominated by optional scope extension questions, not legacy tree retirement

## Input transfer lane

Deleting old legacy source trees requires more than canonical JSON plus mappings.

We also need a migration lane for the legacy source inputs, especially:

- `input/` source material used to derive goals
- `abi/` state-specific exam and release material
- any still-needed references that are currently only reachable through legacy paths

Rule:

- canonical DE landscapes stay shared and non-state-specific
- transferred source inputs must stay explicitly state-scoped
- the same state-scoped rule applies to retained non-canonical materials beyond pure `input/`, with `curricula/DE/Gymnasium/input/HE/abi` as the clearest current example

Recommended target structure:

```text
curricula/DE/Gymnasium/input/
  DE-HE/
    upper-secondary/
    lower-secondary/
    abi/
  DE-BY/
    gymnasium/
    abi/
```

Practical meaning:

- the canonical graph lives once under `curricula/DE/Gymnasium/canonical/`
- the imported source/input material is separated by Bundesland under `curricula/DE/Gymnasium/input/<STATE>/...`
- provenance and `sourceRef` should continue to point to a state-distinguishable source path
- the lane-by-lane transfer inventory is tracked in `curricula/DE/Gymnasium/input/transfer-manifest.md`
- `abi/` is therefore not treated as a one-off exception, but as part of the general state-scoped retained-asset policy

Current status of this lane:

- the target archive scaffold now exists under `curricula/DE/Gymnasium/input/`
- the Hessen non-abi input batches have been transferred into that archive
- a first Hessen `abi/` small-subject batch has been transferred into that archive
- the Hessen `abi/Physik` bulk has now also been transferred into that archive
- the Hessen `abi/Mathe` bulk has now also been transferred into that archive
- the Hessen upper-secondary source-JSON snapshots (`39` files) have now also been transferred into that archive
- Hessen upper-secondary exam/deploy/adoption helper defaults now resolve against the DE-level `abi/` and mapping archives via `curricula/DE/Gymnasium/input/HE/retained-asset-registry.json` instead of subject-local hardcoded legacy-tree paths
- Hessen upper-secondary `abi/` task banks, blueprints, source catalogs, and the math release bundle now also use DE-level retained asset paths plus provenance registry references instead of embedding live `Gymnasiale_Oberstufe` source paths in their operational metadata
- the Bavaria subject-source snapshot has now also been transferred into that archive
- the optional Bavaria `abi/` lane is still undecided and remains out of the current mandatory scope
- therefore the currently known mandatory transfer scope is now mirrored; the only open question is whether a Bavaria `abi/` lane ever becomes part of scope
- for Sek I normalization, the current canonical planning target is a shared G9-aligned year-level grid `5-10`; source-side `G8` / `G9` distinctions remain preserved in provenance and archived inputs

### Initial input inventory

| State lane | Current source location | Current form | Observed size | Migrated into DE archive | Planned target |
| --- | --- | --- | ---: | ---: | --- |
| `DE-HE` upper-secondary input | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/input/` | source PDFs + references | `24` files | `24` files | `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/` |
| `DE-HE` upper-secondary source snapshot | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/` | frozen source landscapes + deck/report sidecars | `39` files | `39` files | `curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/` |
| `DE-HE` upper-secondary abi | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/` | exam/release assets by subject | `2130` files | `2130` files | `curricula/DE/Gymnasium/input/HE/abi/` |
| `DE-HE` lower-secondary input | `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/input/` | source PDFs + references | `20` files | `20` files | `curricula/DE/Gymnasium/input/DE-HE/lower-secondary/` |
| `DE-HE` lower-secondary source snapshot | `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/json/` | frozen source landscapes | `6` files | `6` files | `curricula/DE/Gymnasium/input/HE/lower-secondary/source-json/` |
| `DE-BY` gymnasium source lane | `curricula/DE/BY/Gymnasium/` | subject JSON source set, no dedicated `input/` tree yet | `45` subject JSON files | `45` files | `curricula/DE/Gymnasium/input/BY/gymnasium/` |
| `DE-BY` abi lane | not yet present as dedicated canonical migration input lane | reserved | `0` migrated files | `0` files | `curricula/DE/Gymnasium/input/BY/abi/` |

Interpretation:

- transferred-file counts ignore `.gitkeep` placeholders in not-yet-filled target directories
- Hessen already has explicit source/input and abi trees that can be moved lane by lane.
- Bavaria now has a first DE-level separated source snapshot archive, but not yet a dedicated exam lane.
- The lower-secondary migration target is currently year-level based, not duration-track based: canonical Sek I should first align to G9-style year buckets `5-10`.
- The archive scaffold is now in place, and the first HE/BY transfer batches have happened.
- The currently known mandatory transfer scope is fully mirrored.
- The only remaining lane question is whether Bavaria exam assets must later be added to scope.

Input-lane proxy score:

```text
known files in scope = 24 + 39 + 2130 + 20 + 6 + 45 = 2264
transferred so far   = 24 + 39 + 2130 + 20 + 6 + 45 = 2264
proxy score          = 2264 / 2264 = 100.00%
```

Working input-transfer score:

- `100%`

## Current tracked migration units

The current tracked units are taken from:

- `docs/dev/canonical-gymnasium-implementation-plan.md`

Current unit list and status:

| Unit | Current state | Score |
| --- | --- | ---: |
| Mathematics function corridor | `cutover_ready` | 75% |
| Physics motion corridor | `cutover_ready` | 75% |
| Physics E.2 mechanics corridor | `cutover_ready` | 75% |
| Physics E.3 horizontal-projection slice | `cutover_ready` | 75% |
| Hessen Sek I physics mechanics bridge | `subtree_adopted` | 50% |
| Hessen Sek I physics optics bridge | `subtree_adopted` | 50% |
| Hessen Sek I physics electricity bridge | `subtree_adopted` | 50% |
| Hessen Sek I chemistry foundations bridge | `subtree_adopted` | 50% |
| Hessen Sek I biology foundations/cell + photosynthesis-respiration bridge | `subtree_adopted` | 50% |
| Chemistry Hessen baseline | `subtree_adopted` | 50% |
| Biology Hessen baseline | `subtree_adopted` | 50% |
| Informatics Hessen baseline | `subtree_adopted` | 50% |
| History Hessen baseline | `subtree_adopted` | 50% |
| German Hessen baseline | `subtree_adopted` | 50% |
| Politics-and-Economics Hessen baseline | `subtree_adopted` | 50% |
| English Hessen baseline | `subtree_adopted` | 50% |
| French Hessen baseline | `subtree_adopted` | 50% |
| Latin Hessen baseline | `subtree_adopted` | 50% |
| Spanish Hessen baseline | `subtree_adopted` | 50% |
| Greek Hessen baseline | `subtree_adopted` | 50% |
| Chinese Hessen baseline | `subtree_adopted` | 50% |
| Music Hessen baseline | `subtree_adopted` | 50% |
| Economics Hessen baseline | `subtree_adopted` | 50% |

## Historical rollout score

Tracked-unit calculation:

- `4` units at `75%`
- `19` units at `50%`

Formula:

```text
score = (4 * 75 + 19 * 50) / 23
      = 54.35%
```

Working program score:

- `55%`

Interpretation:

- The canonical DE layer is clearly beyond the initial pilot stage.
- We are not yet in the decommissioning stage.
- The program is currently in the middle of the migration, not near the end.

This score remains useful as a secondary diagnostic for authored canonical coverage.
It is no longer the preferred top-line completion headline for the final stretch.

Input-lane interpretation:

- canonical graph migration is materially underway
- input/source transfer is complete for the currently known mandatory scope, but that does not by itself make any legacy tree deletable

## Repo-level deletion readiness

To make deletion progress measurable without pretending that any tree is already removable, we track two separate notions:

- `gate score`: how many deletion preconditions are already in place for a given legacy tree
- `deletable now`: hard yes/no gate; this only becomes `yes` when the tree can actually be removed from the active repo

### Delete-gate model

Tree-level delete progress is estimated with the following weighted gates:

| Gate | Weight | Interpretation |
| --- | ---: | --- |
| Canonical replacement breadth | 20% | The legacy tree is broadly represented in the canonical DE layer, not only by a small pilot slice |
| Runtime default switched | 20% | Ordinary learner entry and routing prefer canonical DE views over the legacy tree |
| Learner cutover path operational | 15% | Supported learners can be migrated with deterministic single-learner and/or bulk cutover paths |
| Retained input/assets mirrored | 15% | Input, source, and exam assets that must survive deletion are mirrored into the DE-level state-scoped archive |
| Audit/provenance survivability | 15% | Mappings, provenance, and historical references no longer require the legacy tree to stay in place as active storage |
| Legacy UI/API detached | 15% | The old tree is no longer an active learner-facing operational path and remains, at most, as a temporary compatibility artifact |

Scoring rule:

- `done` = full gate weight
- `partial` = half gate weight
- `no` = `0`
- any tree with at least one open hard gate still has `deletable now = no`

### Tree-by-tree delete matrix

| Legacy source tree | Canonical replacement | Runtime default | Cutover path | Input/assets mirrored | Audit/provenance survivability | Legacy UI/API detached | Gate score | Deletable now | Biggest blocker | Next work package |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` | done | done | done | done | done | done | 100% | yes | none; delete handoff executed and CI now enforces that the tree stays absent | closed; keep the DE-level provenance/archive registries as the surviving audit trail and leave the post-retirement gate in CI |
| `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe` | done | done | done | done | done | done | 100% | yes | none; delete handoff executed and CI now enforces the surviving DE-level archive/provenance/mapping lane | closed; keep the DE-level retained-asset, mapping, and provenance registries as the surviving audit trail and leave the post-retirement gate in CI |
| `curricula/DE/BY/Gymnasium` | done | done | done | done | done | done | 100% | yes | none; delete-handoff execution and DE-level audit/reference persistence are in place | closed; keep the DE-level retained-asset, mapping, and provenance registries as the surviving audit trail and leave the post-retirement gate in CI |

## Current completion-track score

Tracked-tree calculation:

```text
score = (100 + 100 + 100) / 3
      = 100.00%
```

Working completion-track score:

- `100%`

Interpretation:

- this is now the main overall percentage for "how close are we to actually finishing?"
- it is now at all tracked-tree closure level, with no remaining legacy-tree delete handoff open
- any future movement is now through optional coverage scope extension, not tree delete-handoff
- it only reaches `100%` when all tracked legacy trees are fully retired from the active repo

Practical conclusion:

- The historical rollout program score is around `55%`.
- The close-out headline score is now `100%`.
- The input-transfer lane is at `100%` for the currently known mandatory scope.
- Hard legacy-tree retirement progress is now `100%` at tracked-tree granularity, because all three tracked legacy trees have now been removed from the active repo.
- Soft delete-gate progress is now visible tree by tree: `100%` for Hessen upper-secondary, `100%` for Hessen lower-secondary, `100%` for Bavaria Gymnasium.

All four statements can be true at the same time, because migration progress, retained-input transfer, delete-gate progress, and actual deletability are different planning dimensions.

## Conditions for 100%

We should only set the program to `100%` when all of the following are true:

1. Every tracked migration unit has reached at least `legacy_view_retained`.
2. New learners use the canonical DE root by default without needing legacy entry points.
3. Existing supported learners have a reliable bulk-cutover path and have been migrated where needed.
4. No runtime-critical API/UI flow still depends on the old legacy trees as active content sources.
5. Source inputs and exam material that must survive the migration have been transferred into a state-separated DE-level input archive.
6. Mappings and provenance needed for audit/history are either frozen elsewhere or no longer required.
7. The legacy source trees can be deleted from the active repo without breaking runtime behavior, QA, or rollback obligations.

Only after step 7 do we convert a unit or source tree from any non-final state into `legacy_deleted`.

## Recommended next planning move

Use this document together with the implementation plan:

- keep the implementation plan as the work-package and rollout narrative
- keep this file as the single percentage/status view

Recommended update rhythm:

- update this file whenever a subtree changes state
- use the completion-track score as the primary headline percentage in progress updates
- update the program score only from explicit state transitions
- update the completion-track score whenever one of the tracked legacy-tree gate scores changes
- update the tree-by-tree delete matrix whenever one of the six delete gates materially changes for a legacy source tree
- keep `docs/dev/canonical-gymnasium-applicability-design.md` as the review target for the next widening step of the implemented state-filter architecture
- treat checklist `R1-R7` and pilot gates `A1-A5` in that document as the review gate before widening the reviewed applicability scope further
- do not increase the percentage because of "felt progress"

## My assessment

Using `100% = old repos deleted` is a good idea, but only if we separate:

- migration progress
- deletion readiness

If we collapse both into one naive percentage too early, the number becomes misleading.

This document therefore uses:

- `100%` as the current completion-track headline score
- `55%` as the current historical migration-program score
- `100%` as the current input-transfer score for the currently known mandatory scope
- `100%` / `100%` / `100%` as the current delete-gate progress picture for the three tracked legacy trees
- `100%` as the current hard legacy-tree retirement picture, because all three tracked legacy trees have now been removed from the active repo without breaking the verified handoff paths

That is, in my view, the most honest planning representation of the current state.


## Mathematics canonical patch log

### 2026-03-18: J5 early arithmetic and measurement expansion

Approach used:

- `reuse-first`: existing canonical goals were preferred over duplication
- first wave limited to early arithmetic plus measurement/area foundations
- the broad J5 geometry node remains in place for now; its finer split is deferred to avoid immediate duplicate modeling
- new early atoms were scoped initially to `DE-BY` and documented as candidates for later `DE-HE` review

Applied changes:

- extended the J5 arithmetic cluster with six new early atoms: place value, rounding, basic additive equations, divisibility/prime factorization, powers of ten, and bracket/precedence evaluation
- added one new J5 measurement application cluster with three atoms: calculating with quantities, rule of three/scale, and distinguishing perimeter from area
- sharpened the existing natural-number foundation goal to mention number-line localization explicitly
- tightened early prerequisite flow by making J6 area/volume goals depend on the new J5 quantity/area foundations

Deferred on purpose:

- splitting the existing broad J5 geometry atom into finer geometry atoms, because that requires a deliberate refactor to avoid duplicate canonical geometry goals


### 2026-03-18: J5 M5 Bavaria mapping tranche

Approach used:

- mapped only the first high-confidence `M5` cases from Bavaria to the canonical graph
- preferred `exact` only where the new or existing canonical atom matched the Bayern source tightly
- used `partial` where the Bayern source remained narrower or broader than the canonical atom
- deferred the remaining J5 geometry/process refinements until the broad existing geometry/process nodes are split without duplication

Applied changes:

- added a first tranche of explicit `DE-BY` mappings for J5 arithmetic and measurement/area goals
- widened `Natürliche Zahlen darstellen, ordnen und mit ihnen rechnen` to `DE-BY` because Bayern J5 now provides direct evidence for that canonical atom


### 2026-03-18: J5 geometry split and Bavaria geometry mapping

Approach used:

- preserved the existing broad J5 geometry goal ID and refactored it from an atomic goal into a geometry cluster to avoid breaking downstream references
- split the geometry block only along the five explicit Bavaria `M5 2` leaf goals, so the refinement stays source-backed and does not invent duplicate canonical granularity
- kept `DE-HE` applicability on the refined geometry atoms because the refactor only decomposes an already shared early-geometry atom; this narrows structure, not jurisdictional scope
- recomputed cluster weights from unique atomic descendants so the J5 lineage stays semantically consistent after the geometry split

Applied changes:

- added five new J5 geometry atoms for coordinate-system objects, geometric relations, point sets with distance conditions, angle work, and quadrilateral properties
- changed the Bavaria `M5 2` cluster mapping from `partial` to `exact`
- added five exact Bavaria leaf mappings for the new geometry atoms

Deferred on purpose:

- no Hessen source-specific leaf mapping review yet for the new geometry atoms
- no further J6/J7 prerequisite tightening beyond preserving the existing broad-cluster dependency as the current compatibility edge


### 2026-03-19: DE-HE prerequisite closure after the J5 geometry split

Approach used:

- treated the APV-102 findings as a visibility-closure issue, not as a reason to revert the finer J5 modeling
- widened the new J5 measurement tranche to `DE-HE`, because these atoms now act as explicit prerequisites for already visible Hessen lower-secondary area/volume goals
- replaced remaining broad-cluster geometry prerequisites on later visible goals with the finer visible J5 geometry atoms, moving the graph one step closer to atomic prerequisite modeling

Applied changes:

- widened `Mit Größen rechnen und Ergebnisse deuten`, `Einfache proportionale Sachaufgaben mit Dreisatz und Maßstab lösen`, and `Umfang und Flächeninhalt unterscheiden und anwenden` plus their J5 cluster to `DE-HE`
- retargeted the affected J6/J7/J8 geometry and area/volume goals from the broad J5 geometry cluster to the new finer geometry atoms

Deferred on purpose:

- no separate Hessen source-leaf mapping pass yet for the widened J5 measurement atoms
- no validator run in this patch step


### 2026-03-19: Hessen lower-secondary evidence added for new early-math atoms

Approach used:

- treated the remaining APV-102 findings as missing `DE-HE` evidence in the Hessen lower-secondary mapping layer, not as a canonical-graph failure
- added only the smallest mapping tranche needed to close the new J5/J6 prerequisite visibility chain
- stayed conservative on match quality: `exact` only where the Hessen source wording is tight enough, otherwise `partial`

Applied changes:

- added Hessen lower-secondary mappings for the new J5 measurement atoms and their J5 cluster
- added Hessen lower-secondary mappings for the new J5 geometry atoms needed by the J6/J7/J8 prerequisite chain, plus the refactored J5 geometry cluster
- explicitly anchored the coordinate-system basis atom so the new geometry prerequisites are themselves visible in `DE-HE`

Deferred on purpose:

- no broader Hessen backfill for the rest of the new J5 atom tranche beyond what the current validator findings require
- no validator run in this patch step


### 2026-03-19: Hessen closure switched from duplicate mappings to overrides

Approach used:

- reverted the invalid one-to-many Hessen lower-secondary mappings after the backend mapping service exposed the repository invariant that each `legacyGoalId` may resolve to only one canonical goal
- preserved the finer canonical early-math structure and closed `DE-HE` visibility instead through explicit applicability overrides on the affected canonical atoms
- documented the override-backed Hessen bridge in the accepted-warning registry, matching the repository's existing APV-201 pattern for reviewed prerequisite closures

Applied changes:

- removed the duplicate Hessen lower-secondary mapping entries that caused `GoalMappingService` to fail during startup
- added `extendedData.applicabilityOverrides.jurisdiction = ["DE-HE"]` to the new early geometry and measurement atoms that are required by visible Hessen goals but lack a clean one-to-one Hessen source atom
- updated the Bavaria math mapping fixture test to the intentionally expanded repository-backed mapping count and the new exact J5 geometry slice

Deferred on purpose:

- no broader refactor of repository mapping semantics beyond the current one-legacy-to-one-canonical invariant
- no test rerun in this patch step


### 2026-03-19: M6 rationale numbers patch plan

Approach used:

- keep the existing broad J6 goal `Rationale Zahlen darstellen und berechnen` as the stable public anchor ID and refactor it into a cluster if the finer split is implemented
- apply the same `reuse-first` rule as in J5: reuse existing early arithmetic atoms wherever they already carry the didactic foundation cleanly
- add new canonical atoms only for the M6 content that is not yet isolated in the canonical graph at usable granularity
- keep the repository mapping invariant in mind: one legacy source goal may map to only one canonical goal; any later jurisdiction widening without clean one-to-one source evidence must be done through `applicabilityOverrides`, not duplicate mappings

Planned reuse base:

- reuse `Natürliche Zahlen runden` as the rounding prerequisite for decimal fractions
- reuse `Teilbarkeitsregeln prüfen und Primfaktorzerlegungen angeben` as the divisibility and denominator-analysis basis for fraction comparison and decimal conversion
- reuse `Natürliche und ganze Zahlen addieren und subtrahieren` as the additive prerequisite for rational arithmetic
- reuse `Natürliche und ganze Zahlen multiplizieren und dividieren` as the multiplicative prerequisite for rational arithmetic
- reuse `Klammerterme und Rechenreihenfolge sicher auswerten` as the early term-structure basis
- reuse `Potenzen mit natürlichen Exponenten und Zehnerpotenzen verwenden` as the entry point for later extension to rational bases and negative exponents

Planned canonical patch candidates for `M6 1.1` to `M6 1.5`:

| Planned canonical atom | Bavaria source evidence | Reuse check | Planned action |
|---|---|---|---|
| `Brüche als Zahlen, Anteile und Quotienten deuten` | `c851474e-5629-592a-97f0-66a2b5b48485`, `37111b61-0ec2-5768-b19c-16b42cbf3b9f` | not isolated in current canonical J6 | `new_canonical_atom` |
| `Brüche erweitern, kürzen und vergleichen` | `2aa11de2-4cbc-5c4c-b024-c5483a94958f` | current divisibility atom is prerequisite only, not the target skill | `new_canonical_atom` |
| `Brüche und Dezimalbrüche ineinander umwandeln` | `5cb98b8f-6aac-5a00-aaf4-57db0223abeb`, `9e6c6b5c-9a05-5e8c-affa-e2156a782022`, `1bd6fc10-3149-5617-8bd0-93bba977ce88` | current canonical graph has rounding and powers, but not the conversion atom itself | `new_canonical_atom` |
| `Rationale Zahlen an der Zahlengeraden darstellen und ordnen` | `37111b61-0ec2-5768-b19c-16b42cbf3b9f` | no clean canonical atom yet for signed fractional number-line work | `new_canonical_atom` |
| `Rationale Zahlen addieren und subtrahieren` | `c8b47f9b-1b66-5532-a413-e8640f9393e9`, `fc9f6f92-3413-5d08-b34e-495a9842b70e`, `c9989d33-f558-5f2d-87fc-df688f5e942d`, `5343da29-6c71-51d5-b7da-3acaad01988a`, `502b1839-1208-57db-ae9d-65c6003e5de9` | current broad J6 atom is too coarse, J5 additive atoms are prerequisite only | `new_canonical_atom` |
| `Rationale Zahlen multiplizieren und dividieren` | `2ebe83ff-92fb-5361-a22c-59e9dabc8da0`, `07e0b570-57a9-5439-9e48-53da16598592` | current broad J6 atom is too coarse, J5 multiplicative atom is prerequisite only | `new_canonical_atom` |
| `Potenzen mit rationalen Basen und negativen Exponenten deuten und berechnen` | `5b08c1b6-30ef-54bd-b37e-9edec60a135d` | existing powers atom is too narrow because it stops at natural exponents and powers of ten | `new_canonical_atom` |
| `Terme mit rationalen Zahlen strukturiert berechnen` | `81b0008e-77cc-59eb-b47f-ff771798feea`, `208542fe-e324-569a-a8ba-80924e363909`, `fdd34616-ed0d-5113-ad65-db5efb5e132e`, `a078cf03-1512-56ad-b635-f065a190e8e3` | existing term-order atom is prerequisite only and does not cover the full M6 rational-number target | `new_canonical_atom` |

Planned implementation order:

- first refactor the broad J6 rational-number goal into a cluster without changing its stable public ID
- then add the eight finer atoms above
- then map the Bavaria `M6 1.*` leaves onto those atoms
- only after the Bavaria tranche is stable, review whether any of the new J6 atoms should also be widened to `DE-HE` through exact evidence or override-backed closure


### 2026-03-19: J6 rationale numbers expansion

Approach used:

- preserved the existing broad J6 rational-number goal ID and refactored it from an atomic goal into a stable cluster, mirroring the J5 geometry strategy
- applied the documented `reuse-first` plan: the new J6 atoms reuse J5 arithmetic prerequisites where possible and only add granularity where the canonical graph did not yet isolate the M6 targets cleanly
- scoped the new fine-grained J6 atoms initially to `DE-BY`, because this patch is still source-backed by the Bavaria M6 slice and no Hessen leaf review has been performed yet
- recomputed cluster weights from unique atomic descendants so the J6 and root-level progress semantics remain proportional after the split

Applied changes:

- refactored `Rationale Zahlen darstellen und berechnen` into a cluster
- added eight J6 rational-number atoms for fraction concepts, comparison, decimal conversion, number-line ordering, additive arithmetic, multiplicative arithmetic, powers with rational bases, and term evaluation with rational numbers
- wired each new atom to existing J5 prerequisites instead of duplicating earlier foundational goals

Deferred on purpose:

- no Bavaria mapping tranche yet for the new J6 atoms
- no Hessen applicability widening or override review yet for the new J6 atoms
- no validator or CI run in this patch step


### 2026-03-19: J6 Bavaria rational-number mapping tranche

Approach used:

- mapped the full Bavaria `M6 1.*` rational-number leaf set onto the new J6 canonical atoms while keeping the repository's one-legacy-to-one-canonical invariant intact
- upgraded the broad Bavaria `M6 1` cluster mapping to `exact` after the J6 rational-number refactor, because the canonical cluster now mirrors the Bavaria block deliberately
- used `exact` only where the Bavaria leaf matches the new canonical atom tightly; left the remaining leaves on `partial` where the source still mixes adjacent subskills such as conceptual interpretation, strategy choice, or plausibility checks

Applied changes:

- added nineteen Bavaria `M6 1.*` mappings onto the new J6 rational-number atoms
- upgraded `M6 1 Rationale Zahlen` from `partial` to `exact`
- updated the repository-backed Bavaria mapping fixture to the new mapping count and representative M6 tuples

Deferred on purpose:

- no `M6 2` or `M6 3` Bavaria mapping tranche yet
- no Hessen review for the new J6 rational-number atoms yet
- no validator or CI run in this patch step


### 2026-03-19: J6 area and volume expansion plus Bavaria mapping tranche

Approach used:

- kept the existing J6 area-volume cluster as the stable public anchor and added only the three geometry atoms that were missing after the reuse-first audit
- avoided new cross-jurisdiction prerequisite breaks by not wiring the new `DE-BY`-only atoms into the existing `DE-HE`-visible J6 atoms yet
- upgraded the broad Bavaria `M6 2` cluster mapping to `exact` after the canonical J6 cluster now mirrors the Bavaria block more faithfully
- stayed conservative on the leaf mappings: `exact` only for the derivation and volume-unit/formula atoms, `partial` for the broader application goals that still mix adjacent modeling or argumentation aspects

Applied changes:

- added three new J6 geometry atoms for deriving area formulas, justifying the cuboid volume formula, and interpreting/converting volume units
- sharpened the existing J6 area and solid-calculation descriptions to mention the relevant M6 figure families and unit handling more explicitly
- added the Bavaria `M6 2.1` and `M6 2.2` leaf mappings and updated the repository-backed Bavaria mapping fixture to the new count

Deferred on purpose:

- no `M6 3 Prozentrechnung, Daten und Diagramme` tranche yet
- no Hessen review for the new J6 geometry atoms yet
- no validator or CI run in this patch step


### 2026-03-19: J6 percent, data and diagrams expansion plus Bavaria mapping tranche

Approach used:

- kept the existing J6 percent/data node as the stable public anchor and refactored it into a cluster instead of replacing the public ID
- stayed `reuse-first`: no late Q3 data goals were reused blindly, because they model broader upper-secondary statistics and would have created a second, phase-skipping data route instead of a clean J6 slice
- scoped the five new fine-grained J6 atoms initially to `DE-BY` only, because this tranche is still backed by the Bavaria M6.3 source block and no Hessen leaf review has been done yet
- upgraded the broad Bavaria `M6 3` cluster mapping to `exact` after the canonical J6 cluster now mirrors the source block intentionally
- stayed conservative on leaf match quality: the representation/frequency leaf remains `partial`, while the tighter percentage-text, diagram-critique and arithmetic-mean leaves are mapped `exact`

Applied changes:

- refactored `Prozentrechnung anwenden und Daten auswerten` into a J6 cluster with five atoms for basic percentage problems, percentage-text interpretation, frequencies, critical diagram reading, and arithmetic mean
- wired the new atoms to the existing J5/J6 arithmetic foundations without duplicating earlier number or ratio goals
- added the Bavaria `M6 3` leaf mappings and updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no Hessen review for the new J6 percent/data atoms yet
- no further J7/Q3 prerequisite tightening beyond keeping the broad J6 cluster as the compatibility bridge
- no validator or CI run in this patch step


### 2026-03-19: DE-HE closure for new J6 rational-number and percent/data atoms

Approach used:

- treated the new `APV-102` findings as the same repository constraint we already hit after the J5 split: the broad J6 clusters stayed visible in theory, but their newly introduced children were still `DE-BY`-only and therefore disappeared in the `DE-HE` projection
- stayed repo-conform by avoiding duplicate Hessen leaf mappings; the backend still requires one legacy source goal per canonical target mapping entry
- used the same closure mechanism as before: widen the newly introduced J6 atoms to `DE-HE` via `applicabilityOverrides` and record the deliberate override in the accepted-warning registry
- kept the fix minimal: no new `requires`, no additional Hessen mapping tranche, no speculative widening of later J7/Q3 atoms

Applied changes:

- widened all eight new J6 rational-number atoms to `DE-HE` via `extendedData.applicabilityOverrides`
- widened all five new J6 percent/data atoms to `DE-HE` via `extendedData.applicabilityOverrides`
- added the corresponding `APV-201` accepted warnings for the thirteen override-backed J6 atoms

Deferred on purpose:

- no Hessen source-specific leaf review yet for these J6 atoms
- no attempt to replace the overrides with cleaner Hessen one-to-one evidence in this patch step
- no validator or CI run in this patch step


### 2026-03-19: DE-HE closure for early J5 arithmetic prerequisites after the J6 widening

Approach used:

- treated the follow-up `APV-102` findings as the next layer of the same prerequisite-visibility chain: the new J6 atoms were now visible in `DE-HE`, but some of their early J5 arithmetic prerequisites were still `DE-BY`-only
- again stayed repo-conform by avoiding duplicate Hessen mappings and using the existing override-backed closure pattern instead
- kept the fix minimal and local to the five missing J5 arithmetic atoms that actually appear in the failing prerequisite list

Applied changes:

- widened `Stellenwertsystem und Zahlendarstellungen verstehen`, `Natürliche Zahlen runden`, `Teilbarkeitsregeln prüfen und Primfaktorzerlegungen angeben`, `Potenzen mit natürlichen Exponenten und Zehnerpotenzen verwenden`, and `Klammerterme und Rechenreihenfolge sicher auswerten` to `DE-HE` via `extendedData.applicabilityOverrides`
- added the corresponding `APV-201` accepted warnings for those five J5 arithmetic atoms

Deferred on purpose:

- no broader Hessen arithmetic leaf review beyond the prerequisite chain needed for the current validator findings
- no validator or CI run in this patch step


### 2026-03-19: J7 Bavaria variable-term mapping tranche

Approach used:

- started `M7` with the smallest useful Bavaria slice: `M7 1 Terme mit Variablen`
- stayed `reuse-first` and did not split the canonical J7 algebra anchor yet; instead, the tranche reuses the existing canonical goal `Terme mit Variablen aufstellen und umformen` wherever the Bayern source already fits that umbrella cleanly enough
- reused the existing early power atom for the Bavaria leaf on power laws instead of opening a second near-duplicate algebra target prematurely
- stayed conservative on match quality: only the broad `M7 1` cluster and the explicit term-transformation leaf were upgraded to `exact`; the remaining leaves stay `partial`

Applied changes:

- upgraded the Bavaria `M7 1 Terme mit Variablen` cluster mapping from `partial` to `exact`
- added nine Bavaria `M7 1.1` / `M7 1.2` leaf mappings onto the existing canonical J7 algebra anchor and the early power atom
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no canonical J7 algebra refactor yet; the current step is mapping-first
- no `M7 2` / `M7 3` Bavaria tranche yet
- no validator or CI run in this patch step


### 2026-03-19: J7 Bavaria symmetry-and-angle mapping tranche

Approach used:

- kept `M7 2 Geometrische Figuren: Symmetrie und Winkel` on the existing canonical J7 geometry anchor instead of splitting J7 geometry prematurely
- upgraded the broad Bavaria `M7 2` cluster to `exact`, because the canonical goal `Symmetrie und Winkel begründen` already mirrors this corridor closely enough at cluster level
- stayed conservative on the leaf mappings: all `M7 2.1` and `M7 2.2` leaves remain `partial`, because the Bavaria source mixes concrete construction routines, model references, historical/contextual framing, and multi-step proof language more tightly than the current canonical J7 geometry atom

Applied changes:

- upgraded the Bavaria `M7 2` cluster mapping from `partial` to `exact`
- added seven Bavaria `M7 2.1` / `M7 2.2` leaf mappings onto the existing canonical J7 geometry anchor
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no canonical J7 geometry split yet
- no `M7 3` or `M7 5` Bavaria tranche yet
- no validator or CI run in this patch step


### 2026-03-19: J7 Bavaria linear-equation and percentage tranche

Approach used:

- kept `M7 3 Lineare Gleichungen und Vertiefung der Prozentrechnung` on the existing canonical J7 algebra anchor instead of opening a new split before the current Bavaria slice actually demands it
- upgraded the broad Bavaria `M7 3` cluster to `exact`, because the canonical goal `Lineare Gleichungen lösen und Prozentrechnung vertiefen` already mirrors the corridor directly
- stayed conservative on the leaf mappings: the explicit equivalence-transformation leaf is `exact`, while equation setup, solution interpretation, and the broader applied-percentage leaf remain `partial`

Applied changes:

- upgraded the Bavaria `M7 3` cluster mapping from `partial` to `exact`
- added four Bavaria `M7 3` leaf mappings onto the existing canonical J7 algebra/percentage anchor
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no canonical J7 algebra split beyond the existing two anchors
- no `M7 5` Bavaria triangle/congruence tranche yet
- no validator or CI run in this patch step


### 2026-03-19: J7 Bavaria congruence-and-triangle mapping tranche

Approach used:

- kept `M7 5 Kongruenz, besondere Dreiecke und Dreieckskonstruktionen` on the existing canonical J7 triangle anchor instead of splitting the geometry branch prematurely
- upgraded the broad Bavaria `M7 5` cluster to `exact`, because the canonical goal `Kongruenz begründen und Dreieckskonstruktionen ausführen` already mirrors the corridor directly
- stayed conservative on leaf quality: concept introduction, converse logic, dynamic-geometry exploration, Thales work, tangent construction, and application modelling remain `partial`; the construction-heavy and special-triangle leaves are mapped `exact`

Applied changes:

- upgraded the Bavaria `M7 5` cluster mapping from `partial` to `exact`
- added nine Bavaria `M7 5` leaf mappings onto the existing canonical J7 triangle/congruence anchor
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no canonical J7 geometry split beyond the current shared anchors
- no `M8` Bavaria tranche yet
- no validator or CI run in this patch step


### 2026-03-19: M8 Bavaria function, rational-function, probability and geometry tranche

Approach used:

- kept the current canonical J8 corridor intact instead of opening a new split before the Bavaria `M8` slice actually forces one
- reused the existing cross-phase canonical atom `Funktionsbegriff und Darstellungen verstehen` for the explicit function-concept leaf in `M8 1`
- kept `M8 1 Funktion und Term` and `M8 2 Lineare Funktionen` on conservative partial cluster bridges where the current canonical function corridor is still broader than the Bavaria source wording
- upgraded the direct J8 corridor matches for elementary rational functions, fraction terms, Laplace experiments, linear systems, and circle/cylinder work where the canonical pilot already mirrors the Bavaria slice closely enough

Applied changes:

- completed the Bavaria `M8` mapping tranche across `M8 1` to `M8 7`
- upgraded the existing `M8 3`, `M8 4`, `M8 5`, `M8 6`, and `M8 7` cluster bridges from `partial` to `exact`
- upgraded the existing J8 rational-function and fraction-term leaf bridges from `partial` to `exact` where the canonical child atoms already match the Bavaria leaf goals directly
- added the missing Bavaria leaf mappings for the introductory function block, the remaining linear-function leaves, the Laplace block, the linear-system block, and the circle/cylinder block
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no new canonical split for the `M8 1` or `M8 2` function-introduction corridor yet; graph-reading and introductory function-language aspects still lean on partial bridges where the current canonical structure stays coarser than the Bavaria source
- no `M9` Bavaria audit yet
- no validator or CI run in this patch step


### 2026-03-19: M9 Bavaria quadratics, probability and trigonometry tranche

Approach used:

- kept the current canonical J9 corridor intact and reused the existing year-9 anchors instead of opening a new split before the Bavaria `M9` slice actually proves a missing atom
- treated `M9 2 Quadratische Funktionen` as a mixed corridor: the leaf level can already attach well to the existing quadratic-function, vertex, quadratic-equation, fraction-equation and linear-system anchors, while the broad Bayern cluster still needs `partial` umbrella bridges
- upgraded the direct J9 corridor matches for connected probability, similarity, power-function, Pythagoras and trigonometry blocks where the canonical pilot already mirrors the Bavaria slice closely enough
- stayed conservative on the root and advanced trig leaves where proof, Heron iteration, rationalisation, unit-circle work or broader strategy language exceed the current canonical atom granularity

Applied changes:

- completed the Bavaria `M9` mapping tranche across `M9 1` to `M9 7.2`
- upgraded the existing Bavaria `M9 3`, `M9 4`, `M9 5`, `M9 6`, `M9 7` and `M9 7.1` cluster bridges from `partial` to `exact`; `M9 7.2` stays `partial`
- upgraded the existing leaf bridges for connected probability, power-function graphs, Pythagoras calculations and right-triangle trigonometry where the canonical J9 atoms already match directly
- added the missing Bavaria leaf mappings for roots, quadratics, connected probability, similarity, extended power work, Pythagoras and both trigonometry subcorridors
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no new canonical split yet for the broader `M9 1` root corridor or the unit-circle/setup part of `M9 7.2`
- no `M10` Bavaria audit yet
- no validator or CI run in this patch step


### 2026-03-19: M10 Bavaria exponential, stochastic and trigonometric tranche

Approach used:

- reused the existing canonical J10 corridor without opening a new split for exponential growth, stochastic simulations, sinus/cosinus functions or polynomial basics
- upgraded `M10 1`, `M10 2`, `M10 3` and `M10 4` to `exact` at cluster level where the existing J10 anchors already inherit their provenance directly from the same Bavaria source corridors
- stayed conservative on most leaf mappings for sinus/cosinus functions, polynomial behaviour and the broad space-geometry continuation, because the current canonical atoms remain coarser than the detailed Bavaria leaf wording
- kept `M10 5 Fortführung der Raumgeometrie` on a deliberate `partial` bridge, since the current canonical J10 space-geometry atom is still too narrow for the full Bavaria cone/pyramid/sphere corridor

Applied changes:

- completed the Bavaria `M10` mapping tranche across `M10 1` to `M10 5`
- upgraded the existing cluster bridges for `M10 1`, `M10 2`, `M10 3` and `M10 4` from `partial` to `exact`
- upgraded the direct simulation and tree-rule leaves in `M10 2` to `exact`
- added the missing Bavaria leaf mappings for exponential growth, logarithms, sinus/cosinus functions, polynomial basics and the space-geometry continuation
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no new canonical split yet for the bogenmaß/einheitskreis detail in `M10 3`
- no new canonical split yet for the cone/pyramid/sphere-heavy `M10 5` corridor
- no validator or CI run in this patch step


### 2026-03-19: Residual Bavaria math partial-gap audit after M10

Audit result:

- after the `M5` to `M10` tranches, the Bavaria math landscape now has only `11` remaining `partial` bridges inside the year-5-to-year-10 corridor
- in addition, `17` intermediate Bavaria section nodes remain unmapped; these are broad subsection wrappers rather than missing leaf coverage

Residual `partial` bridges grouped by type:

- acceptable broad bridges for now:
  - `M5 3 Natürliche und ganze Zahlen – Multiplikation und Division` -> `Natürliche und ganze Zahlen multiplizieren und dividieren`
  - `M5 4 Größen und ihre Einheiten` -> `Größen und Einheiten vergleichen und umrechnen`
  - `M7 4 Kenngrößen von Daten` -> `Kenngrößen von Daten bestimmen und interpretieren`
  - `M8 1 Funktion und Term` -> `Funktionsgrundlagen (Sek I)`
  - `M8 2 Lineare Funktionen` -> `Funktionsgrundlagen (Sek I)`

- likely real canonical-structure gaps:
  - `M9 1 Quadratwurzeln` -> current canonical atom is too narrow for the full Bavaria corridor with irrationality, Heron iteration, root-term algebra and rationalisation
  - `M9 2` / `M9 2.1` / `M9 2.2` -> the current quadratic corridor is distributed over several atoms, but still lacks a cleaner shared quadratic cluster for exact subsection anchoring
  - `M9 7.2 Sinus- und Kosinussatz` -> unit-circle and setup aspects still exceed the current `Sinus- und Kosinussatz nutzen` atom
  - `M10 5 Fortführung der Raumgeometrie` -> the current J10 space-geometry atom is too coarse for the Bavaria cone/pyramid/sphere continuation

Unmapped intermediate subsection nodes:

- `M5`:
  - `M5 1.1`
  - `M5 1.2`
  - `M5 3.1`
  - `M5 3.2`
  - `M5 4.1`
  - `M5 4.2`

- `M6`:
  - `M6 1.1`
  - `M6 1.2`
  - `M6 1.3`
  - `M6 1.4`
  - `M6 1.5`
  - `M6 2.1`
  - `M6 2.2`

- `M7`:
  - `M7 1.1`
  - `M7 1.2`
  - `M7 2.1`
  - `M7 2.2`

Interpretation:

- the remaining subsection-node gaps are mainly mapping hygiene and do not indicate missing Bavaria leaf coverage
- the next canonical-modeling work should focus on the four real gap zones instead of broad cleanup

Recommended next patch order:

1. `M10 5 Fortführung der Raumgeometrie`
2. `M9 7.2 Sinus- und Kosinussatz` plus unit-circle preparation
3. `M9 1 Quadratwurzeln`
4. only afterwards: subsection-node mapping cleanup for `M5` to `M7`


### 2026-03-19: J10 space-geometry split for Bavaria M10 5

Approach used:

- refactored the existing canonical J10 space-geometry atom `6248bbd7-c7e8-4f91-b3dc-de885cf5abce` into a cluster while retaining its ID as the stable corridor anchor
- reused the existing circle/cylinder, pythagoras, right-triangle trigonometry and sinus/cosinus-law prerequisites instead of duplicating earlier geometry content
- introduced only the six missing J10 atoms that the Bavaria `M10 5` corridor actually isolates: bodies and nets, solids of revolution, cone surface area, pyramid/cone volumes, sphere formulas and applied space-geometry modeling
- kept the new J10 atoms voorlopig on `DE-BY` only; no Hessen closure decision was folded into this patch step

Applied changes:

- split the canonical J10 space-geometry corridor into one retained cluster plus six new atomic descendants
- remapped the Bavaria `M10 5` cluster and all six leaf goals onto the refined canonical J10 space-geometry atoms
- upgraded the Bavaria `M10 5` cluster bridge from `partial` to `exact` now that the canonical corridor mirrors the Bavaria subsection directly
- updated the repository-backed Bavaria math mapping fixture to the new J10 space-geometry targets

Deferred on purpose:

- no `DE-HE` applicability review yet for the six new J10 space-geometry atoms
- no validator or CI run in this patch step


### 2026-03-19: Hessen closure for the new J10 space-geometry split

Approach used:

- kept the J10 space-geometry split itself unchanged and closed only the missing Hessen visibility chain
- avoided new Hessen one-to-many mappings and used the established math closure mechanism via `extendedData.applicabilityOverrides`
- opened exactly the six new J10 space-geometry atoms for `DE-HE`, because the broad retained cluster `6248bbd7-c7e8-4f91-b3dc-de885cf5abce` is already referenced by visible Hessen goals

Applied changes:

- added `DE-HE` applicability overrides to all six new J10 space-geometry atoms
- added the corresponding `APV-201` accepted-warning entries for the Hessen math prerequisite bridge rationale

Deferred on purpose:

- no new Hessen leaf-mapping tranche for these J10 atoms
- no validator or CI run in this patch step


### 2026-03-19: J9 trigonometry split for Bavaria M9 7.2

Approach used:

- kept the existing J9 trigonometry bridge cluster `219ce079-6bfd-4827-8b66-5dd199e44686` and refactored only the broad child `0cefa694-636e-4c4b-abff-3ac3750dca18`
- split the old mixed atom into exactly the two Bavaria `M9 7.2` strands that had been entangled before: unit-circle based sign/orientation work and the proof/application corridor for sinus- and cosine-law work
- reused the existing right-triangle trigonometry atom as the shared prerequisite instead of opening a wider trigonometric dependency fan
- closed Hessen visibility immediately for the two new J9 atoms via the established override-backed prerequisite bridge, because the retained HE corridor already depends on the broad J9 trig bridge

Applied changes:

- refactored `0cefa694-636e-4c4b-abff-3ac3750dca18` from atomic goal to J9 trig cluster
- added the two new canonical J9 atoms for unit-circle sine/cosine values in degree measure and for proving/applying the sine and cosine laws
- upgraded the Bavaria `M9 7.2` cluster bridge from `partial` to `exact` and remapped both Bavaria leaf goals to the new canonical atoms
- updated the Bavaria mapping fixture and added the two matching `APV-201` accepted-warning entries for the Hessen prerequisite bridge

Deferred on purpose:

- no new Hessen legacy leaf-mapping tranche for these J9 atoms
- no validator or CI run in this patch step


### 2026-03-19: J9 square-roots split for Bavaria M9 1

Approach used:

- refactored the old broad J9 square-root atom `8a0b0baf-c7e6-43df-a470-f56050ecaa46` into a retained cluster so downstream references stay stable
- split the corridor into the five Bavaria `M9 1` strands that were previously collapsed: square-root basics, irrationality/reals, Heron iteration, radical arithmetic, and rationalisation/partial extraction
- tightened the sequencing for `Quadratische Gleichungen loesen` by replacing the former broad cluster prerequisite with the two new root atoms that are actually needed there
- closed Hessen visibility immediately for the new J9 root atoms via the established override-backed prerequisite bridge

Applied changes:

- turned the old J9 square-root atom into a five-child cluster
- upgraded the Bavaria `M9 1` cluster bridge from `partial` to `exact` and remapped all five Bavaria leaf goals to dedicated canonical J9 root atoms
- rewired the canonical quadratic-equations goal away from the broad root cluster to the relevant fine-grained root prerequisites
- updated the Bavaria mapping fixture and added the five matching `APV-201` accepted-warning entries for the Hessen prerequisite bridge

Deferred on purpose:

- no new Hessen legacy leaf-mapping tranche for these J9 root atoms
- no validator or CI run in this patch step


### 2026-03-19: J9 quadratics split for Bavaria M9 2

Approach used:

- repurposed the old broad quadratic-function atom `5a9702f4-7e4d-457d-b98c-f0bafcd1e386` into a retained J9 quadratics cluster so downstream references stay stable
- separated the Bavaria `M9 2` corridor into a foundations branch and an applications branch instead of keeping subsection mappings on a single coarse atom
- reused the existing canonical atoms for solving quadratic equations, vertex work, linear systems and rational equations wherever they already matched cleanly
- introduced only the missing atoms for parameter effects, graph-property reading, form switching, deriving quadratic functions from conditions, and modelling with quadratic functions
- opened the new J9 quadratic clusters and atoms for `DE-HE` via the established override-backed prerequisite bridge

Applied changes:

- turned `5a9702f4-7e4d-457d-b98c-f0bafcd1e386` into a J9 quadratics cluster with a foundations and an applications subtree
- upgraded the Bavaria cluster mappings `M9 2`, `M9 2.1` and `M9 2.2` from `partial` to `exact`
- remapped the previously broad Bavaria leaf bridges in `M9 2` to dedicated canonical quadratic atoms
- rewired the J9 year anchor so the quadratic corridor hangs under the retained quadratics cluster instead of duplicating the old subclusters directly
- updated the Bavaria mapping fixture and added the matching `APV-201` accepted-warning entries for the Hessen prerequisite bridge

Deferred on purpose:

- no new Hessen legacy leaf-mapping tranche for the new J9 quadratic atoms
- no validator or CI run in this patch step


### 2026-03-19: J9 quadratics inheritance fix after validator feedback

Approach used:

- kept the new J9 quadratics split intact and corrected only the placement of the didactic prerequisite
- removed the foundation prerequisite from the broad J9 applications cluster because that cluster intentionally reuses the older J8 atom `797ee047-b8dd-45cf-880e-98571a56c690` for rational equations
- attached the foundation prerequisite only to the J9-specific modelling atom, where the later-phase dependency is didactically justified

Applied changes:

- cleared the direct `requires` edge from the J9 applications cluster `0d4a6f56-2f87-4c39-98ab-5f13f5cbdd40`
- added the same prerequisite explicitly to the J9 modelling atom `a7ccb7a9-6fb0-4e2d-b6e0-6420cc5ae0bf`

Deferred on purpose:

- no validator or CI run in this patch step


### 2026-03-19: Bavaria math residual audit for Jgst. 5-10 after the M5-M10 wave

Audit scope:

- Bavaria source corridor restricted to the descendants of `Jahrgangsstufe 5` through `Jahrgangsstufe 10`
- excludes Bavaria `M11` to `M13`, because those were not part of the current migration tranche

Observed state:

- corridor size: `246` Bavaria source goals
- remaining `partial` mappings: `103`
- remaining unmapped source goals: `31`
- of those unmapped goals:
  - `17` are subsection clusters
  - `14` are atomic goals

Interpretation:

- the residual set is no longer dominated by missing year-level coverage; the year clusters are already mapped and the remaining work is mostly local cleanup
- the `17` unmapped subsection clusters are primarily mapping-hygiene debt, not canonical blind spots:
  - `M5 1.1`, `M5 1.2`, `M5 3.1`, `M5 3.2`, `M5 4.1`, `M5 4.2`
  - `M6 1.1` through `M6 1.5`
  - `M6 2.1`, `M6 2.2`
  - `M7 1.1`, `M7 1.2`, `M7 2.1`, `M7 2.2`
- the largest remaining `partial` hot clusters are broad canonical anchors rather than newly missing Bavaria coverage:
  - `5d17ebb4-4e27-4f9c-8d0b-3520f34b2e11` trigonometrische Funktionen (`7` partial leaves)
  - `8da730f1-8947-498d-9e78-7fb20b00a994` J7-Geometrieanker (`7`)
  - `fd860da9-73ba-47cd-a1a8-452424915a80` J7-Algebra/Termanker (`7`)
  - `f0a49da2-018b-4cda-adbd-27047b610a0f` Kongruenz-/Konstruktionsanker (`6`)
  - `1f89d69e-ead1-424b-8221-fae37fdea2bc` J6-Fläche/Volumen-Anwendungen (`5`)

Residual gap judgment:

- strongest remaining canonical gap candidate:
  - `M7 4 Kenngrößen von Daten`
  - still only a broad cluster bridge, while the Bavaria source still leaves the three atomic strands unmapped:
    - median / boxplots
    - quartiles / spread
    - extracting information from boxplots
- plausible secondary gap candidates, but lower priority than `M7 4`:
  - early counting-principle atom in `M5 3.1`
  - basic multiplicative equation atom in `M5 3.1`
- most other remaining atomic `partial` bridges are acceptable breadth mismatches for now, not evidence of missing canonical structure

Recommended order from this audit:

1. close the real content gap around `M7 4` descriptive statistics
2. then do the subsection-cluster cleanup for `M5` to `M7`
3. only afterwards revisit the broad but acceptable `partial` bridges if a stricter exactness target is needed


### 2026-03-19: Reuse-first patch plan for Bavaria M7 4 descriptive statistics

Reuse baseline already present in canonical math:

- `91571d3f-3651-4477-ba21-320fc4077453` `Absolute und relative Häufigkeiten bestimmen und darstellen`
- existing J6 percentage/data corridor already also contains atoms for:
  - diagram interpretation
  - arithmetic mean
- current Bavaria `M7 4` umbrella still lands only partially on the broad canonical bridge `075ef99c-7f84-48b5-97f1-4e28c7d78f95`

Source-side residual structure in Bavaria `M7 4`:

- one already partially mapped leaf bundles absolute/relative frequencies together with early aggregate use
- three source leaves still expose the actual remaining gap more clearly:
  - median use
  - quartiles / spread / boxplots
  - extracting information from boxplots and known descriptive measures

Patch recommendation:

1. refactor `075ef99c-7f84-48b5-97f1-4e28c7d78f95` from broad atom to retained cluster
2. reuse the existing atoms for:
  - absolute and relative frequencies
  - arithmetic mean
  - generic diagram interpretation where it already fits
3. add only the missing descriptive-statistics atoms:
  - `Median bestimmen und mit dem arithmetischen Mittel vergleichen`
  - `Spannweite und Quartile bestimmen und Boxplots erstellen`
  - `Datenverteilungen mithilfe von Kenngrößen und Boxplots vergleichen und deuten`

Expected mapping consequence:

- the mixed Bavaria leaf that currently combines frequencies with early aggregate use will likely remain `partial`, because the source bundles more than one fine-grained canonical atom and the mapping layer is intentionally one-to-one
- the median / quartile / boxplot corridor should become cleanly mappable without opening duplicate canonical data goals

Decision rationale:

- this is the smallest patch that closes the last clearly visible Sek-I data-analysis gap
- it avoids inventing a duplicate “descriptive statistics basics” atom just to force one exact mapping for a bundled Bavaria leaf
- it keeps the canonical graph aligned with the established rule: exactness where the source isolates a didactic strand cleanly, partial where the source intentionally bundles multiple strands


### 2026-03-19: J7 descriptive-statistics split for Bavaria M7 4

Approach used:

- refactored the broad J7 data-indicators atom `075ef99c-7f84-48b5-97f1-4e28c7d78f95` into a retained cluster so downstream references stay stable
- kept the already reusable arithmetic-mean atom outside the new cluster and used it as an explicit prerequisite instead of duplicating a J7 copy of the same competence
- introduced only the three missing descriptive-statistics atoms that Bavaria `M7 4` actually isolates cleanly:
  - median versus arithmetic mean
  - quartiles / range / boxplots
  - comparing data distributions with indicators and boxplots
- closed Hessen visibility immediately for the three new J7 atoms via the established override-backed prerequisite bridge

Applied changes:

- turned `075ef99c-7f84-48b5-97f1-4e28c7d78f95` into a three-child J7 data-indicators cluster
- upgraded the Bavaria `M7 4` cluster bridge from `partial` to `exact`
- mapped the three Bavaria `M7 4` leaves exactly to the new canonical J7 descriptive-statistics atoms
- updated the Bavaria mapping fixture and added the three matching `APV-201` accepted-warning entries for the Hessen prerequisite bridge

Deferred on purpose:

- no subsection-cluster cleanup for `M5` to `M7` in this patch step
- no validator or CI run in this patch step


### 2026-03-19: Bavaria M5-M7 subsection-cluster cleanup

Approach used:

- treated the remaining unmapped subsection nodes in `M5` to `M7` as mapping-hygiene work, not as a new canonical-authoring wave
- mapped each subsection cluster to the closest existing canonical corridor that its already mapped children were predominantly using
- kept these bridges deliberately `partial`, because these subsection clusters still bundle multiple finer canonical atoms and the mapping layer stays one-to-one

Applied changes:

- added subsection-cluster mappings for:
  - `M5 1.1`, `M5 1.2`, `M5 3.1`, `M5 3.2`, `M5 4.1`, `M5 4.2`
  - `M6 1.1` to `M6 1.5`
  - `M6 2.1`, `M6 2.2`
  - `M7 1.1`, `M7 1.2`, `M7 2.1`, `M7 2.2`
- updated the Bavaria mapping fixture to the new repository-backed mapping size

Resulting interpretation:

- the remaining residual Bavaria Sek-I math gaps are now concentrated much more clearly in true leaf-level breadth mismatches instead of administrative subsection omissions
- this makes the next residual audit materially sharper, because the unmapped set is no longer inflated by missing subsection wrappers

Deferred on purpose:

- no new canonical atoms in this cleanup step
- no validator or CI run in this patch step


### 2026-03-19: Updated residual Bavaria Sek-I math audit after subsection cleanup

Scope used:

- Bavaria Gymnasium mathematics source corridor `Jahrgangsstufe 5` to `Jahrgangsstufe 10`
- source file: `curricula/DE/Gymnasium/input/BY/gymnasium/Mathematik.json`
- mapping file: `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_to_canonical_math.json`

Current repository-backed counts for the reviewed Sek-I corridor:

- total source goals in scope: `246`
- mapped goals: `235`
- of those mapped:
  - `116` `exact`
  - `119` `partial`
- remaining unmapped goals: `11`

Remaining unmapped goals are now concentrated in a single early corridor rather than spread across later-year canonical gaps.

Residual unmapped set:

- `M5` arithmetic / early-process leaves only:
  - natural-number infinity / very large-number orientation
  - checking integer statements with counterexamples
  - arithmetic-advantage leaves around commutativity / associativity / distributivity
  - one early counting-principle leaf
  - one multiplication/division-equation leaf
  - one term-structure leaf for whole-number mixed operations
  - two problem-solving / heuristic / application leaves with whole numbers
  - one benchmark-based estimation leaf

Residual `partial` hotspots by size:

- `8da730f1-8947-498d-9e78-7fb20b00a994` J7 symmetry / angle geometry corridor: `9`
- `fd860da9-73ba-47cd-a1a8-452424915a80` J7 algebra corridor: `9`
- `5d17ebb4-4e27-4f9c-8d0b-3520f34b2e11` J9 trigonometric-functions corridor: `7`
- `1f89d69e-ead1-424b-8221-fae37fdea2bc` J6/J10 volume-surface corridor: `6`
- `f0a49da2-018b-4cda-adbd-27047b610a0f` J7 congruence / Thales corridor: `6`

Residual-gap judgment:

- the remaining large `partial` groups are mostly acceptable breadth mismatches, not evidence of another urgent canonical modeling hole
- after the J7/J9/J10 splits already completed, the sharpest remaining uncovered content is no longer in later-year function or geometry corridors
- the real residual blind spot is now the early Bavaria `M5` arithmetic/process layer, because all `11` unmapped goals sit there

Recommended next patch wave:

1. close the remaining `M5` unmapped arithmetic/process leaves
2. keep the broad J7/J9 partial corridors as reviewed breadth mismatches unless a stricter exactness target is explicitly needed
3. only after the `M5` closure, decide whether any of the large partial hotspots merit another canonical split at all


### 2026-03-19: Reuse-first patch plan for residual Bavaria M5 arithmetic/process closure

Residual source leaves still unmapped in the Bavaria Sek-I scope:

- natural-number infinity / naming very large numbers
- checking integer statements with counterexamples
- arithmetic-advantage leaves for addition/subtraction and multiplication/division
- early counting-principle leaf
- multiplication/division-equation leaf
- mixed-operation term-structure leaf
- heuristic problem-solving / application leaves with whole numbers
- benchmark-based estimation leaf

High-confidence reuse targets already present in the canonical J5 corridor:

- `624764d6-becd-5f9b-ada3-0d4f9d143073` `Stellenwertsystem und Zahlendarstellungen verstehen`
- `fe07241a-b779-5f35-a82d-7aa51ae74f42` `Natürliche Zahlen runden`
- `4b67bed9-06da-40b2-a306-24e9e7dfd390` early whole-number / integer number corridor
- `cafd6520-c4af-4109-9863-cc49ba6fad4d` early multiplication/division corridor
- `5d1decb2-b01b-5c85-88fc-9fc255ff9776` `Klammerterme und Rechenreihenfolge sicher auswerten`
- `ca9093cd-9ccf-5fb4-9dd8-bf4f92af4e70` simple proportional / measure-context problem solving

Likely true residual canonical gaps:

1. `Natürliche Zahlen als unbegrenzt fortsetzbar verstehen und große Zahlbezeichnungen sicher verwenden`
2. `Aussagen über ganze Zahlen prüfen und mit Gegenbeispielen widerlegen`
3. `Einfache Multiplikations- und Divisionsgleichungen durch Umkehroperationen lösen`
4. `Rechenvorteile mit Kommutativ-, Assoziativ- und Distributivgesetz gezielt nutzen`
5. `Problemstellungen mit ganzen Zahlen heuristisch lösen und Lösungswege dokumentieren`
6. `Größen in Sachsituationen mithilfe von Bezugsgrößen schätzen`

Open review candidate before authoring a new atom:

- `Zählprinzip in einfachen realitätsnahen Kontexten systematisch anwenden`

Reason:

- this leaf may deserve a small early counting atom
- but first it should be checked against the existing stochastic / combinatorial entry corridor to avoid inventing a duplicate precursor if a reusable canonical node already exists

Planned patch order:

1. verify whether the early counting-principle leaf can reuse an existing canonical atom
2. add only the six clearly missing J5 arithmetic/process atoms listed above
3. remap the `11` remaining Bavaria M5 leaves
4. keep any still bundled source leaf on `partial` if it genuinely mixes more than one of the new fine-grained strands

Expected result:

- the Bavaria Sek-I pilot should then have no obvious unmapped `M5` blind spot left
- remaining residual debt would mostly be deliberate `partial` breadth mismatches rather than missing canonical authoring


### 2026-03-19: Residual Bavaria M5 arithmetic/process closure

Approach used:

- kept the existing J5 arithmetic and measurement clusters as retained anchors instead of opening another large structural refactor
- reused the existing term-structure atom `5d1decb2-b01b-5c85-88fc-9fc255ff9776` for the previously unmapped mixed-operation leaf
- added only the genuinely missing early J5 atoms for:
  - unbounded natural-number understanding and large-number naming
  - checking integer statements with counterexamples
  - arithmetic advantages from commutative / associative laws
  - basic multiplicative equations via inverse operations
  - simple counting principles in contextual situations
  - heuristic whole-number problem solving with documented solution paths
  - benchmark-based estimation in quantity contexts
- closed Hessen visibility for these new prerequisite atoms directly via the established override-backed bridge

Applied changes:

- expanded the retained J5 arithmetic cluster `8dd5199b-f614-4ebd-8819-b5ff37326524` with six new early-process atoms and recomputed its weight
- expanded the retained J5 measurement-application cluster `b40bebc2-91e3-5aac-916d-43247ee08d09` with one new estimation atom and recomputed its weight
- updated the J5 year anchor weight accordingly
- mapped the `11` previously unmapped Bavaria `M5` leaves:
  - `10` to the newly added J5 atoms
  - `1` (`4d77f5fc-016f-527e-a1c3-44797aead19a`) to the already existing term-structure atom
- updated the repository-backed Bavaria mapping fixture and added the corresponding Hessen `APV-201` accepted-warning entries

Resulting interpretation:

- the Bavaria Sek-I pilot no longer has an obvious unmapped `M5` blind spot
- remaining residual debt now sits predominantly in deliberate `partial` breadth mismatches rather than in missing canonical J5 authoring


### 2026-03-20: Validation pass after Bavaria M5 arithmetic/process closure

Validation used:

- `./run_ci.sh`

Validation result:

- `./run_ci.sh` passed after the residual Bavaria `M5` closure commit
- the repository-backed Bavaria Sek-I mathematics review corridor `Jahrgangsstufe 5-10` is now fully mapped:
  - total source goals in scope: `246`
  - mapped goals: `246`
  - of those mapped:
    - `126` `exact`
    - `120` `partial`
  - remaining unmapped goals: `0`

Interpretation:

- the Bavaria Sek-I mathematics pilot no longer has an unmapped reviewed-source gap in the `J5-J10` corridor
- the next substantive work should therefore not be another residual Bavaria `M5` authoring patch
- the next widening step should move back to applicability-review scope using `docs/dev/canonical-gymnasium-applicability-design.md` and its `R1-R7` / `A1-A5` review gates


### 2026-03-20: Bavaria function-value applicability debt reduced from `APV-201` to `APV-202`

Approach used:

- reviewed the two remaining Bavaria math function-value visibility cases that still relied on explicit `DE-BY` applicability overrides
- replaced each override-backed visibility path with the narrowest reviewed Bavaria source bridge that still fits as a `partial` mapping
- kept the canonical goal semantics unchanged; only the Bavaria review basis and warning family changed

Applied changes:

- remapped Bavaria source leaf `32a0f358-c1e9-5663-b8cf-67789355387c` from the broad function-concept atom to `Funktionswerte aus Graphen ablesen`
- remapped Bavaria source leaf `7ee3da1c-1f20-5038-9828-ab74e0e1e49f` from the broad J7 variable-term corridor to `Funktionswerte berechnen`
- removed the explicit `extendedData.applicabilityOverrides.jurisdiction = ["DE-BY"]` entries from the two canonical function-value goals
- converted the two accepted Bavaria math findings from `APV-201` to `APV-202` in the accepted-warning registry

Validation used:

- `npm run validate:view-filters`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`

Validation result:

- `validate:view-filters` still passes and now classifies the two reviewed Bavaria function-value cases as accepted `APV-202` findings instead of explicit-override `APV-201` findings
- the repository-backed Bavaria math mapping fixture test passes with the reviewed remap tuples

Interpretation:

- reviewed Bavaria math no longer depends on Bavaria-specific explicit applicability overrides for the canonical function-value pair
- the residual Bavaria math debt on this slice is now partial-bridge review debt, not override debt


### 2026-03-20: Bavaria music partial-bridge debt reduced by two exact upgrades

Approach used:

- reviewed the smallest remaining non-math `APV-202` slice in the Bavaria pilot set
- kept the canonical music structure stable and only sharpened two E-phase atom descriptions so they match both the Hessen source wording and the reviewed Bavaria leaf wording
- upgraded the two Bavaria music bridges to `exact` where the reviewed canonical wording now covers the source goals tightly enough

Applied changes:

- refined `Grundformen erkennen` into `Satzstruktur und Grundformen erkennen`
- refined `Proben organisieren` into `Gestaltungs- und Probenprozesse organisieren`
- upgraded the Bavaria music mappings for `4e9fd039-4532-5337-b06a-083eca009613` and `8a850d1b-f325-5a40-bac1-0c06517c902c` from `partial` to `exact`
- removed the two corresponding Bavaria music `APV-202` entries from the accepted-warning registry

Validation used:

- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `186` accepted warnings
- accepted reviewed warnings dropped from `193` to `191`
- the repository-backed mapping fixture test still passes

Interpretation:

- the reviewed Bavaria music pilot no longer carries any accepted `APV-202` debt on the currently reviewed surface
- the next applicability-review candidate should now come from a larger remaining `APV-202` lane such as Bavaria Latin, Bavaria economics, Bavaria politics/economics, Bavaria biology, or Bavaria history


### 2026-03-20: Bavaria Latin partial-bridge debt cleared by five exact upgrades

Approach used:

- reviewed the smallest remaining language-side `APV-202` lane in the Bavaria pilot set after music
- kept the canonical Latin structure stable but replaced five placeholder-like atom labels with source-aligned operational wording
- upgraded only those Bavaria bridges whose reviewed source leaves now fit the canonical targets one-to-one

Applied changes:

- refined `Grammatik festigen` into `Lektürespezifische Grammatikphänomene analysieren`
- refined `Grundinterpretation` into `Originaltexte grundlegend interpretieren`
- refined `Kontext/Autoren` into `Autoren, Werke und Kontexte einordnen`
- refined `Interpretation` into `Kommunikations- und Ethikfragen interpretieren`
- refined `Vergleich/Transfer` into `Rhetorische Texte vergleichen und Transfer leisten`
- upgraded the five Bavaria Latin mappings for `192be448-1888-5f15-a100-38c58f74dd58`, `4b3bef2c-a27d-5334-b2cf-53548ab5a438`, `ec10b9a4-fc64-5e8f-a19b-45a187c39017`, `35793922-864f-5739-a56c-42ad6df8410a`, and `b952bb09-3ff6-573c-9a41-0575345e4e5a` from `partial` to `exact`
- removed the five corresponding Bavaria Latin `APV-202` entries from the accepted-warning registry

Validation used:

- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `186` accepted warnings
- accepted reviewed warnings dropped from `191` to `186`
- the repository-backed mapping fixture test still passes

Interpretation:

- the reviewed Bavaria Latin pilot no longer carries any accepted `APV-202` debt on the currently reviewed surface
- the next applicability-review candidate should now come from a larger remaining `APV-202` lane such as Bavaria economics, Bavaria politics/economics, Bavaria biology, or Bavaria history


### 2026-03-20: Bavaria physics override-backed applicability debt reduced from six cases to four

Approach used:

- reviewed the smallest remaining accepted-warning lane after the Latin pass and found that Bavaria physics was still dominated by explicit `DE-BY` override debt rather than ordinary partial-bridge debt
- preferred reviewed Bavaria source bridges over canonical re-authoring: two previously unmapped Bavaria mechanics leaves were promoted to partial bridges, while the earlier attempt to repoint broader reviewed cluster bridges was discarded because it changed planned-goal behavior in backend integration tests
- kept the canonical physics goal semantics unchanged and reduced only the Bavaria visibility mechanism

Applied changes:

- added Bavaria partial bridges from `a114f68b-91d5-593e-9d5b-d31d3240bf19` to `Kräfte und Trägheit qualitativ erklären` and from `c75cb2dd-c143-5537-82aa-4676a1148c71` to `Newtons 1. Axiom (Trägheitsprinzip)`
- removed the explicit `extendedData.applicabilityOverrides.jurisdiction = ["DE-BY"]` entries from the two canonical physics goals `Kräfte und Trägheit qualitativ erklären` and `Newtons 1. Axiom (Trägheitsprinzip)`
- converted the two corresponding Bavaria physics findings from `APV-201` to `APV-202` in the accepted-warning registry
- updated the repository-backed Bavaria physics mapping fixture to the new mapping size and reviewed tuples

Validation used:

- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `./gradlew test --tests 'com.skillpilot.backend.controller.LearnerControllerIntegrationTest' --tests 'com.skillpilot.backend.service.LearnerServiceCrossSubjectPilotTest'`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `186` accepted warnings
- accepted reviewed warnings stay at `186`, but Bavaria physics now carries `4` accepted `APV-201` cases and `2` accepted `APV-202` cases instead of `6` accepted `APV-201` cases
- the repository-backed mapping fixture test, the learner-planning regression slice, and full `./run_ci.sh` pass with the retained broader cluster bridges

Interpretation:

- reviewed Bavaria physics no longer depends on explicit Bavaria-specific applicability overrides for two of the six previously override-backed cases without changing learner-facing planning behavior
- the next sharp follow-up on this lane is to resolve or reclassify the four remaining Bavaria physics override-backed goals: `Freier Fall experimentell untersuchen`, `Newtons 3. Axiom (Wechselwirkungsprinzip)`, `Mechanische Energieformen qualitativ unterscheiden`, and `Kinetische Energie`


### 2026-03-20: Bavaria physics Newton-III override retired without changing Hessen topic totals

Approach used:

- targeted the remaining Bavaria physics case that already had a reviewed exact source leaf on the Newton-III application side, but still depended on an explicit Bavaria-specific applicability override on the broader conceptual node
- kept the public canonical Newton-III id stable by turning `Newtons 3. Axiom (Wechselwirkungsprinzip)` into a small cluster and adding a dedicated Hessen-only concept atom underneath it
- rejected the simpler single-child cluster rewrite after it reduced Hessen champion totals by one; the final split preserves the previous Hessen topic-count surface while still letting Bavaria visibility derive from the reviewed application leaf

Applied changes:

- converted canonical goal `5a1b3cb2-c0e6-4372-9c57-f33675cffc9b` (`Newtons 3. Axiom (Wechselwirkungsprinzip)`) from an override-backed atomic goal into a cluster containing the new Hessen-only concept atom `ad984bb6-e225-432a-952d-d83cda40b7f8` (`Newtons 3. Axiom formulieren und erläutern`) and the existing reviewed Bavaria-visible application atom `a0aaedcb-41f8-4891-af77-a69a76b8c10d` (`Newtons 3. Axiom anwenden`)
- removed the redundant direct containment of `a0aaedcb-41f8-4891-af77-a69a76b8c10d` from `Newtons Axiome und Inertialsysteme` so the new Newton-III substructure stays cleanly nested
- removed the explicit `extendedData.applicabilityOverrides.jurisdiction = ["DE-BY"]` entry from `5a1b3cb2-c0e6-4372-9c57-f33675cffc9b`
- removed the now-obsolete accepted Bavaria physics `APV-201` entry for `5a1b3cb2-c0e6-4372-9c57-f33675cffc9b`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.controller.LearnerControllerIntegrationTest' --tests 'com.skillpilot.backend.service.LearnerServiceCrossSubjectPilotTest'`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `185` accepted warnings
- accepted reviewed warnings drop from `186` to `185`, and the Bavaria physics lane now carries `3` accepted `APV-201` cases plus `2` accepted `APV-202` cases instead of `4` accepted `APV-201` cases plus `2` accepted `APV-202` cases
- graph validation, the focused backend regression slice, and full `./run_ci.sh` all pass

Interpretation:

- reviewed Bavaria physics no longer needs a Bavaria-specific override for the canonical Newton-III concept node, and Hessen learner-facing topic totals stay stable after the structural split
- the remaining Bavaria physics override-backed cases are now `Freier Fall experimentell untersuchen`, `Mechanische Energieformen qualitativ unterscheiden`, and `Kinetische Energie`


### 2026-03-20: Bavaria physics free-fall override retired while preserving motion-frontier behavior

Approach used:

- targeted the remaining Bavaria physics free-fall case because it already sat next to reviewed Bavaria-visible motion-analysis and acceleration atoms
- kept the public canonical free-fall id stable by turning `Freier Fall experimentell untersuchen` into a small cluster and adding one Hessen-only experimental evaluation leaf underneath it
- rejected the broader variant that also nested `Bewegungen mit Diagrammen untersuchen` under the free-fall container after it displaced expected motion-frontier suggestions in cutover and cross-subject backend tests; the final structure keeps diagram analysis independent and uses only the acceleration side for Bavaria visibility

Applied changes:

- converted canonical goal `230345f3-c360-4963-b390-ab94e3e2c864` (`Freier Fall experimentell untersuchen`) from an override-backed atomic goal into a cluster containing the Bavaria-visible acceleration atom `e4b38061-1f28-43ad-8371-a3e7c0e81856` and the new Hessen-only atom `09029573-864f-40ca-bf8a-cee7bf6dcb73` (`Fallbeschleunigung aus Messdaten bestimmen`)
- preserved `Bewegungen mit Diagrammen untersuchen` as an independent sibling goal and kept it only as a prerequisite of the new Hessen-only free-fall atom
- removed the explicit `extendedData.applicabilityOverrides.jurisdiction = ["DE-BY"]` entry from `230345f3-c360-4963-b390-ab94e3e2c864`
- removed the now-obsolete accepted Bavaria physics `APV-201` entry for `230345f3-c360-4963-b390-ab94e3e2c864`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.controller.LearnerControllerIntegrationTest' --tests 'com.skillpilot.backend.service.LearnerServiceCrossSubjectPilotTest'`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `184` accepted warnings
- accepted reviewed warnings drop from `185` to `184`, and the Bavaria physics lane now carries `2` accepted `APV-201` cases plus `2` accepted `APV-202` cases instead of `3` accepted `APV-201` cases plus `2` accepted `APV-202` cases
- graph validation, the focused backend regression slice, and full `./run_ci.sh` all pass after the narrowed final structure

Interpretation:

- reviewed Bavaria physics no longer needs a Bavaria-specific override for the canonical free-fall container, and the expected Hessen/cross-subject motion frontier behavior stays intact
- the remaining Bavaria physics override-backed cases are now `Mechanische Energieformen qualitativ unterscheiden` and `Kinetische Energie`


### 2026-03-20: Bavaria physics Sek-I energy-forms override converted into reviewed partial-bridge debt

Approach used:

- inspected the last Bavaria physics energy corridor and avoided a broader canonical energy split for now because the remaining `Kinetische Energie` case still lacks a comparably clean reviewed source leaf
- kept the existing reviewed exact Bavaria energy rows unchanged and instead promoted one previously unmapped Bavaria heat-lehre source leaf to a partial bridge for the Sek-I bridge goal `Mechanische Energieformen qualitativ unterscheiden`
- preferred this narrower bridge because the Bavaria source text explicitly assumes prior knowledge of `mechanische Energieformen`, making it a defensible reviewed visibility bridge without shifting the upper-secondary mechanical-energy mapping surface

Applied changes:

- added a new Bavaria partial bridge from `b0a2ec7a-df5f-5bf3-b8eb-f3668c25917d` to canonical goal `722857cf-f327-5740-8151-64eb92195ec8` (`Mechanische Energieformen qualitativ unterscheiden`)
- removed the explicit `extendedData.applicabilityOverrides.jurisdiction = ["DE-BY"]` entry from canonical goal `722857cf-f327-5740-8151-64eb92195ec8`
- converted the accepted Bavaria physics finding for `722857cf-f327-5740-8151-64eb92195ec8` from `APV-201` to `APV-202`
- updated the repository-backed Bavaria physics mapping fixture to the new mapping size and reviewed tuple

Validation used:

- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `./gradlew test --tests 'com.skillpilot.backend.controller.LearnerControllerIntegrationTest' --tests 'com.skillpilot.backend.service.LearnerServiceCrossSubjectPilotTest'`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `184` accepted warnings
- accepted reviewed warnings stay at `184`, but the Bavaria physics lane now carries `1` accepted `APV-201` case plus `3` accepted `APV-202` cases instead of `2` accepted `APV-201` cases plus `2` accepted `APV-202` cases
- the repository-backed mapping fixture test, the learner-planning regression slice, and full `./run_ci.sh` pass with the narrower reviewed bridge

Interpretation:

- reviewed Bavaria physics no longer needs a Bavaria-specific override for the Sek-I qualitative energy-forms bridge; Bavaria visibility now comes from reviewed source mappings alone
- the last remaining Bavaria physics override-backed case is now `Kinetische Energie`


### 2026-03-20: Bavaria physics kinetic-energy override reviewed and retained as the final physics exception

Approach used:

- reviewed the remaining Bavaria physics energy corridor after the Sek-I energy-forms pass, including the lower-secondary energy, heat-lehre, charged-particle, and spaceflight source leaves that still mention energy or kinetic-energy-adjacent concepts
- rejected additional partial bridges because the clean Bavaria energy source rows are already committed to `Mechanische Energie`, `Potenzielle Energie`, `Energieerhaltung`, and `Arbeit`, while the remaining unmapped Bavaria leaves mention kinetic energy only indirectly or in different conceptual settings
- preferred an explicit retained-override decision over a weak source bridge or a broader canonical energy refactor that would overclaim Bavaria coverage for the formula-focused canonical atom `Kinetische Energie`

Applied changes:

- kept canonical goal `7eeff2de-6015-49a6-a96e-a488d886dc9f` (`Kinetische Energie`) and the reviewed Bavaria physics mapping surface unchanged
- tightened the accepted-warning rationale for `7eeff2de-6015-49a6-a96e-a488d886dc9f` so the last remaining Bavaria physics `APV-201` case is documented as an intentional retained override rather than generic closure debt
- logged the reviewed retention decision in this migration status file

Validation used:

- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `184` accepted warnings
- full `./run_ci.sh` passes
- Bavaria physics remains at `1` accepted `APV-201` case plus `3` accepted `APV-202` cases; this is now the reviewed end state of the current physics applicability lane

Interpretation:

- Bavaria physics has no further clean override-retirement candidate on the currently reviewed source surface; the remaining kinetic-energy case should stay accepted until a better source-aligned split or source atom exists
- the next applicability-review target should move outside physics; the smallest remaining reviewed `APV-202` lanes are currently Bavaria Informatik, Bavaria Wirtschaft, Bavaria Deutsch, and Bavaria Griechisch with `8` accepted partial-bridge cases each


### 2026-03-20: Bavaria Greek early E-phase bridge upgraded from partial to exact

Approach used:

- reviewed the smallest remaining non-physics language lane and found that the Bavaria Greek debt was concentrated in one regular Gr10 corridor with eight one-to-one source-to-canonical mappings
- identified the main problem as generic canonical placeholder wording rather than missing structure: the canonical E-phase Greek strip still used broad template-style labels such as `Lektüre E-Phase Griechisch` and `Projekt/Reflexion E-Phase Griechisch`, while the Bavaria source already isolated concrete reading, vocabulary, syntax, translation, analysis, position-taking, oral presentation, and productive-reception tasks
- kept ids and didactic sequencing stable, but rewrote the eight canonical atoms into source-facing task wording so the reviewed Bavaria rows could be promoted from `partial` to `exact`

Applied changes:

- rewrote the eight Bavaria-visible canonical E-phase Greek atoms in `DE_DEU_S_GYM_CANONICAL_GRIECHISCH.de.json` from generic placeholder phrasing to source-aligned task wording:
  - `Originaltexte kursorisch lesen und Inhalte erfassen`
  - `Lektürebegleitenden Wortschatz gezielt sichern`
  - `Komplexe syntaktische Strukturen untersuchen`
  - `Komplexe griechische Strukturen übersetzen`
  - `Originaltexte sprachlich analysieren`
  - `Zu griechisch formulierten Inhalten Stellung nehmen`
  - `Lehrbuchtexte verständnisgeleitet vortragen`
  - `Originaltexte produktiv und kreativ interpretieren`
- promoted the eight corresponding Bavaria Greek mappings in `bavaria_greek_to_canonical_greek.json` from `partial` to `exact`
- removed the eight obsolete Bavaria Greek `APV-202` entries from the accepted-warning registry

Validation used:

- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `176` accepted warnings
- accepted reviewed warnings drop from `184` to `176`
- full `./run_ci.sh` passes

Interpretation:

- the reviewed Bavaria Greek early E-phase corridor no longer depends on partial-bridge applicability; the full eight-goal lane is now exact-backed
- the next smallest reviewed `APV-202` lanes are now Bavaria Informatik, Bavaria Wirtschaft, and Bavaria Deutsch with `8` cases each

### 2026-03-20: Bavaria informatics graph corridor split removes one partial-bridge applicability case

What changed:

- the Bavaria source goal `defff42b-dc4b-53b0-9409-58578ef3c850` (`modellieren im Rahmen praktischer Fragestellungen vernetzte Strukturen als Graphen und klassifizieren diese anhand ihrer Eigenschaften`) no longer maps partially into the Hessen-shaped canonical atom `Graphbegriffe kennen`
- instead, the canonical node `7d4fe994-2325-5fa9-8718-491957da4eed` was turned into a small cluster in `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- the Hessen concept leaf now remains isolated as `f0910b55-48a9-4f81-aed6-d15ac0446c70` (`Graphbegriffe kennen`) with `DE-HE` applicability only
- a new Bavaria-visible leaf `c9d20743-dfda-4425-ae40-8f51d9f0c72a` (`Vernetzte Strukturen als Graphen modellieren und klassifizieren`) now carries the exact Bavaria source wording with `DE-BY` applicability
- the Bavaria mapping in `bavaria_informatics_to_canonical_informatics.json` was upgraded from partial to exact for that source goal
- the obsolete accepted warning for canonical goal `7d4fe994-2325-5fa9-8718-491957da4eed` was removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:view-filters`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `175` accepted warnings

Interpretation:

- Bavaria Informatik drops from `8` to `7` reviewed `APV-202` cases
- the remaining Bavaria Informatik debt is materially less clean than this graph split; the next lowest-count reviewed `APV-202` lanes are now Bavaria Deutsch and Bavaria Wirtschaft with `8` cases each

### 2026-03-20: Bavaria informatics object-model corridor split removes another partial-bridge case

What changed:

- the Bavaria source goal `09203725-7c53-5e5f-b52b-c97cad208bf6` no longer maps partially into the Hessen-shaped canonical atom `Objekte instanziieren`
- instead, the canonical node `300d490f-e5bf-541a-a4c7-a136e97c42ea` was turned into a small cluster in `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- the Hessen concept leaf now remains isolated as `cb2af3ef-c261-4d92-bc30-3eeb7a2af96a` (`Objekte instanziieren`) with `DE-HE` applicability only
- a new Bavaria-visible leaf `6c284640-1f28-4837-aabd-445656ad7f54` (`Objekte analysieren und zu Klassen abstrahieren`) now carries the exact Bavaria source wording with `DE-BY` applicability
- the Bavaria mapping in `bavaria_informatics_to_canonical_informatics.json` was upgraded from partial to exact for that source goal
- the obsolete accepted warning for canonical goal `300d490f-e5bf-541a-a4c7-a136e97c42ea` was removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `174` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria Informatik drops from `7` to `6` reviewed `APV-202` cases
- the remaining Bavaria Informatik cases are now concentrated in broader prerequisite-shape mismatches around programming basics, search/list handling, and formal-language theory

### 2026-03-20: Bavaria German E1 language strip split removes two partial-bridge cases

What changed:

- the Bavaria source goals `e8bf22b0-cd8d-5224-869d-8b94c7fe6d33` and `805e9702-0cc5-5ca6-8a73-6540ace2114a` no longer map partially into the Hessen-shaped canonical atoms `Grammatik wiederholen` and `Textsorte erkennen`
- instead, the canonical nodes `abf6d684-791e-5e0d-90bf-3466087dc937` and `bc28576e-243e-5bff-aca0-872e174d59e5` were turned into small clusters in `DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json`
- the Hessen leaves now remain isolated as `2122b969-61e9-412f-9e97-8777c606d27a` (`Grammatik wiederholen`) and `263b9af0-c584-4364-a35f-6dfccd7aaf21` (`Textsorte erkennen`) with `DE-HE` applicability only
- new Bavaria-visible leaves `ead22176-e8f4-45b6-8a3d-e04661f3c3e4` (`Grammatikalisches und orthografisches Wissen vertiefen`) and `6904ca70-3f22-41eb-bc9c-9896bf7bb1e9` (`Grundformen schriftlicher Darstellung unterscheiden und passend einsetzen`) now carry the exact Bavaria source wording with `DE-BY` applicability
- the Bavaria mappings in `bavaria_german_to_canonical_german.json` were upgraded from partial to exact for those two source goals
- the obsolete accepted warnings for canonical goals `abf6d684-791e-5e0d-90bf-3466087dc937` and `bc28576e-243e-5bff-aca0-872e174d59e5` were removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `172` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria German drops from `8` to `6` reviewed `APV-202` cases
- the remaining Bavaria German debt is concentrated in broader literature-analysis and interpretation lanes rather than the E1 language basics strip

### 2026-03-20: Bavaria German E1 argumentation and media strip split removes two more partial-bridge cases

What changed:

- the Bavaria source goals `2fbfd7ee-066e-53e4-8d85-9d81f58dce43`, `7f6c85b6-65bc-5ab4-b028-fd0a3cf2733f`, `163f43b8-6f3d-560c-b798-288aaec4084a`, and `12b18e42-d094-5bdb-9466-b7e74e34e9ec` no longer map partially into the Hessen-shaped canonical atoms `Argumentationsaufbau` and `Medienanalyse Grundlage`
- instead, the canonical nodes `bdd71d15-2ed3-5edb-9a1b-c55b1239795b` and `be66ab87-1857-561e-ad91-bae56b3ae849` were turned into small clusters in `DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json`
- the Hessen leaves now remain isolated as `70f5f3c6-f0e9-4bd7-8095-a20be459975c` (`Argumentationsaufbau`) and `001b6ae3-207a-400d-852d-2c4068df8d2f` (`Medienanalyse Grundlage`) with `DE-HE` applicability only
- new Bavaria-visible leaves `f0c354f9-6f7a-494a-8f64-675bf1b42f5e`, `17164008-3c30-4d22-8f2b-bf2e5a79f9de`, `d4642285-5b73-4541-a088-6c1e77b37637`, and `fb8f990d-224f-4277-92a1-13bee8f7f8a4` now carry the reviewed Bavaria source wording with `DE-BY` applicability
- the Hessen German mapping was repointed to the new HE leaves, and the Bavaria mappings in `bavaria_german_to_canonical_german.json` were upgraded from partial to exact for the four reviewed source goals
- the obsolete accepted warnings for canonical goals `bdd71d15-2ed3-5edb-9a1b-c55b1239795b` and `be66ab87-1857-561e-ad91-bae56b3ae849` were removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `170` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria German drops from `6` to `4` reviewed `APV-202` cases
- the remaining Bavaria German debt is now concentrated entirely in the broader literature-analysis corridor

### 2026-03-20: Bavaria German E2 literature corridor split removes the remaining partial-bridge cases

What changed:

- the Bavaria source goals `d795b8a8-1b1a-5f6a-affe-0805b6014c4c`, `24de36d4-0900-53d0-b619-faa7fc765f21`, `d0737aa3-aae6-5429-8284-c095889f2b59`, `216f1fd3-b396-559d-811c-e70ed6d75a97`, and `2611513c-8a5c-571b-8137-e545a6a189ed` no longer map partially into the Hessen-specific canonical E2 literature atoms
- the shared `E2 Literatur` cluster `bb3dee7b-d6d3-513b-8824-bdf6414e02df` now contains five Bavaria-only exact leaves for the reviewed literature-analysis and interpretation corridor
- the old Hessen literature basics `29f0468a-62a0-57a1-8f92-48d4e69bb032`, `c2f901ad-9469-5f84-aa19-e80d300842c5`, `518ec458-78a7-5546-9a65-29ef6d197742`, and `97d958b1-93d3-58ad-b208-80af1cdfd4d4` now carry `DE-HE` applicability only again
- the shared entry nodes `bb3dee7b-d6d3-513b-8824-bdf6414e02df` and `eff86a92-e048-5494-b561-6ecdda1fbf67` were aligned to the compiled mixed-state surface and now carry `DE-BY` plus `DE-HE` applicability in the committed metadata
- the Bavaria mapping file `bavaria_german_to_canonical_german.json` was upgraded from partial to exact for those five reviewed source goals against the new Bavaria-only leaves
- the obsolete accepted warnings for the four old E2 literature atoms were removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `166` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria German drops from `4` to `0` reviewed `APV-202` cases
- the reviewed Bavaria German lane is now closed; the next applicability target should move to another remaining subject corridor

### 2026-03-20: Bavaria Informatik grammar-source remap removes one more partial-bridge case without adding new canonical nodes

What changed:

- the Bavaria source goal `a2db53a1-4449-5d78-825e-81ba1fa07c02` no longer maps partially into the Hessen-only canonical atom `Ableitungen prüfen` (`3e3264d6-8cf8-55f9-b085-1aa4a7865476`)
- instead, that source goal now maps exactly to the already-existing canonical atom `Grammatiken entwickeln` (`fbd4561a-573e-5f8c-b363-338ee9774b5c`) in `bavaria_informatics_to_canonical_informatics.json`, because the reviewed Bavaria wording is about defining grammars with EBNF and syntax diagrams rather than checking derivations
- `Ableitungen prüfen` (`3e3264d6-8cf8-55f9-b085-1aa4a7865476`) now carries `DE-HE` applicability only again in `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- the Bavaria-visible follow-on canonical goal `Sprachen klassifizieren` (`18691bbb-b996-57a6-9f91-8ff54acabbce`) now requires `Grammatiken entwickeln` instead of `Ableitungen prüfen`, preserving the reviewed Bavaria Q3.1 route without widening the Hessen-only derivation atom
- the obsolete accepted warning for canonical goal `3e3264d6-8cf8-55f9-b085-1aa4a7865476` was removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` passes with `0` errors, `25` active warnings, and `165` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria Informatik drops from `6` to `5` reviewed `APV-202` cases
- this was a clean mapping-and-prerequisite correction, not a new canonical split; the remaining Bavaria Informatik debt is now concentrated in broader automata, data-structure, and algorithm-shape mismatches

### 2026-03-20: Bavaria Informatik object-state split removes the E.3 programming-basics partial bridge

What changed:

- the Bavaria source goal `dca8a9c9-4016-59ff-86f0-8756df374ce8` no longer maps partially into the Hessen-shaped canonical atom `Grundlegende Datentypen und Variablen nutzen` (`c5d04946-497e-5ede-84ec-2d019138e3a0`)
- instead, canonical goal `c5d04946-497e-5ede-84ec-2d019138e3a0` was turned into a small mixed-state cluster in `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- the Hessen semantics now live on the new `DE-HE` leaf `18317e31-71f7-4e4a-b18c-f61e2b25769d` (`Grundlegende Datentypen und Variablen nutzen`), and the Bavaria wording now lives on the new `DE-BY` leaf `2aaefe0b-3e56-477e-94f0-bb05fa035ed5` (`Attributwerte ändern und Objektzustände deuten`)
- the Hessen mapping in `hessen_informatics_upper_secondary_to_canonical_informatics.json` was repointed from the former shared atom to the new Hessen-only leaf
- the Bavaria mapping in `bavaria_informatics_to_canonical_informatics.json` was upgraded from partial to exact against the new Bavaria-only leaf
- the Hessen follow-on canonical goal `Kontrollstrukturen anwenden` now requires the new Hessen-only leaf instead of the mixed-state cluster, so the old atomic prerequisite shape is preserved on the Hessen route
- the obsolete accepted warning for canonical goal `c5d04946-497e-5ede-84ec-2d019138e3a0` was removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` passes with `0` errors, `25` active warnings, and `164` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria Informatik drops from `5` to `4` reviewed `APV-202` cases
- the remaining Bavaria Informatik debt is now concentrated in the broader automata, algorithm, and higher-data-structure corridors rather than the Inf9 object-programming strip

### 2026-03-20: Bavaria Informatik search-corridor split removes the Q1 algorithm partial bridge

What changed:

- the Bavaria source goal `4d042307-060f-5b86-a435-ddc6a58ccbf5` no longer maps partially into the Hessen-shaped canonical atom `Suchalgorithmen implementieren` (`7c2d2a49-c4a4-51b6-be7b-e8791f82af5a`)
- instead, canonical goal `7c2d2a49-c4a4-51b6-be7b-e8791f82af5a` was turned into a small mixed-state cluster in `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- the Hessen semantics now live on the new `DE-HE` leaf `2a87fb3c-394b-47b4-bda2-58c5f1403475` (`Suchalgorithmen implementieren`), and the Bavaria wording now lives on the new `DE-BY` leaf `c62c529f-3732-4c66-a8e4-6d91ed2285d0` (`Algorithmen auf Listen und Feldern entwickeln und implementieren`)
- the Hessen mapping in `hessen_informatics_upper_secondary_to_canonical_informatics.json` was repointed from the former shared atom to the new Hessen-only leaf
- the Bavaria mapping in `bavaria_informatics_to_canonical_informatics.json` was upgraded from partial to exact against the new Bavaria-only leaf
- the Hessen follow-on canonical goals `Einfache Sorten nutzen` and `Hashing und Kollisionen` now require the new Hessen-only leaf instead of the mixed-state cluster, so the old Hessen prerequisite chain is preserved
- the obsolete accepted warning for canonical goal `7c2d2a49-c4a4-51b6-be7b-e8791f82af5a` was removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` passes with `0` errors, `25` active warnings, and `163` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria Informatik drops from `4` to `3` reviewed `APV-202` cases
- the remaining Bavaria Informatik debt is now concentrated in the automata corridor plus the higher-data-structure list/stack corridor

### 2026-03-20: Bavaria Informatik automata split removes the two non-regular-language partial bridges

What changed:

- the Bavaria source goals `a19cd533-ac0c-57a9-8098-093d1918a605` and `c7623044-bb7b-5375-9a65-27932a296834` no longer map partially into the Hessen-only pushdown-automata atoms `Kellerautomaten und Grammatiken verknüpfen` (`200ff84a-3158-5d2f-b065-36b77ea99ef1`) and `Deterministische Kellerautomaten entwickeln` (`36725b54-fd0c-5b24-bf2f-399491562718`)
- instead, canonical goal `9b497287-aa68-5bb1-974f-5be11dd11ae2` was turned into a small mixed-state cluster in `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- the Hessen semantics now live on the new `DE-HE` leaf `10a3b2a3-8c1c-4dfb-9d48-8f67f2c0004d` (`Grenzen endlicher Automaten erkennen`), and the Bavaria wording now lives on the new `DE-BY` leaf `e7fb0601-4207-4bd8-8c40-1f544590b855` (`Nichtreguläre Sprachen als Grenze endlicher Automaten erläutern`)
- the Hessen mapping in `hessen_informatics_upper_secondary_to_canonical_informatics.json` was repointed from the former shared atom to the new Hessen-only leaf
- the two Bavaria mappings in `bavaria_informatics_to_canonical_informatics.json` were upgraded from partial to exact against the new Bavaria-only leaf
- the canonical cluster `Q3.3 Kellerautomat` (`52ab668f-87b6-5661-af2a-3dc38557dcf6`) and the two old pushdown-automata atoms `36725b54-fd0c-5b24-bf2f-399491562718` and `200ff84a-3158-5d2f-b065-36b77ea99ef1` now carry `DE-HE` applicability only again
- the Bavaria-visible canonical cluster `Q3.4 Turingmaschine` (`49e18e35-3a6d-53f7-842f-4dc9e39c745a`) now requires the shared finite-automata-limits cluster `9b497287-aa68-5bb1-974f-5be11dd11ae2` instead of the Hessen-only pushdown-automata cluster, preserving Bavaria visibility without widening the Hessen-only PDA corridor
- the obsolete accepted warnings for canonical goals `200ff84a-3158-5d2f-b065-36b77ea99ef1` and `36725b54-fd0c-5b24-bf2f-399491562718` were removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` passes with `0` errors, `25` active warnings, and `161` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria Informatik drops from `3` to `1` reviewed `APV-202` case
- the remaining Bavaria Informatik debt is now the higher-data-structure list/stack corridor around `Stapeln und Warteschlangen nutzen` (`898684c0-027c-5fc8-8448-6f33fc26d5b4`)

### 2026-03-20: Bavaria Informatik list-operations split closes the last reviewed APV-202 case

What changed:

- the Bavaria source goal `340f8522-7e39-5361-8886-4c8767a76af2` no longer maps partially into the Hessen-shaped canonical atom `Stapeln und Warteschlangen nutzen` (`898684c0-027c-5fc8-8448-6f33fc26d5b4`)
- instead, canonical goal `898684c0-027c-5fc8-8448-6f33fc26d5b4` was turned into a small mixed-state cluster in `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- the Hessen semantics now live on the new `DE-HE` leaf `8179e63e-764c-4348-a5f1-f738fb2cc04e` (`Stapeln und Warteschlangen nutzen`), and the Bavaria wording now lives on the new `DE-BY` leaf `0bfd9371-8a7b-407c-9244-fe6ecbe2b56d` (`Operationen auf einfach verketteten Listen entwickeln`)
- the Hessen mapping in `hessen_informatics_upper_secondary_to_canonical_informatics.json` was repointed from the former shared atom to the new Hessen-only leaf
- the Bavaria mapping in `bavaria_informatics_to_canonical_informatics.json` was upgraded from partial to exact against the new Bavaria-only leaf
- the shared canonical goal `Binäre Bäume bearbeiten` (`56a88f2f-cc47-5e1d-b7d9-1822a66e3b91`) continues to require the mixed-state cluster, so the shared higher-data-structure route stays visible without widening the Hessen-only stack/queue leaf
- the obsolete accepted warning for canonical goal `898684c0-027c-5fc8-8448-6f33fc26d5b4` was removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` passes with `0` errors, `25` active warnings, and `160` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria Informatik drops from `1` to `0` reviewed `APV-202` cases
- the reviewed Bavaria Informatik applicability lane is now closed; the next cut should move to another subject

### 2026-03-20: Steering refocus to Mathematics-first DE expansion

What changed:

- after the current Hessen/Bavaria close-out wave, the preferred expansion path is no longer broader subject coverage on the same two-state base
- the next convergence track should instead add further Bundeslaender to canonical Gymnasium `Mathematik`, one state at a time and one didactically closed corridor at a time
- the concrete execution note now lives in `docs/dev/canonical-gymnasium-math-de-expansion-plan.md`
- `DE-NW` is the preferred next onboarding target because the existing input lane already points to both a Gymnasium `G9` Sek-I mathematics curriculum and an upper-secondary mathematics curriculum, while still exposing the current blocker clearly: only README-level source references are present so far

Interpretation:

- the next executable task is NRW mathematics source import plus `DE-NW` mapping-lane setup
- further optional non-math widening should pause until at least one third-state mathematics corridor has been onboarded on the shared canonical math spine

### 2026-03-20: NRW mathematics source import completes Stage A of the Math-first DE expansion

What changed:

- the first non-Hessen, non-Bavaria mathematics source import step is now complete for `DE-NW`
- the official NRW Gymnasium mathematics source PDFs are now archived locally under `curricula/DE/Gymnasium/input/NW/`
- Sek I mathematics now lives at `curricula/DE/Gymnasium/input/NW/lower-secondary/g9_m_klp_3401_2019_06_23_0.pdf`
- upper-secondary mathematics now lives at `curricula/DE/Gymnasium/input/NW/upper-secondary/gost_klp_m_2023_06_07.pdf`
- source provenance is documented beside each file in `lower-secondary/references.md` and `upper-secondary/references.md`
- the NRW input README now reflects the archived-file state instead of only pointing to external curriculum links

Interpretation:

- Stage A from `canonical-gymnasium-math-de-expansion-plan.md` is complete for NRW mathematics
- the next executable NRW task is Stage B/C: keep the planned `DE-NW` mapping lanes, then register NRW mathematics source landscapes and provenance material before starting the first reviewed function-corridor mappings

### 2026-03-20: NRW mathematics mapping-lane setup completes Stage B without premature provenance activation

What changed:

- the first real `DE-NW` canonical math mapping fixtures now exist at `curricula/DE/Gymnasium/mapping/DE-NW/lower-secondary/nrw_math_lower_secondary_to_canonical_math.json` and `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_math_upper_secondary_to_canonical_math.json`
- both fixtures are repository-backed and test-covered, but intentionally still empty (`0` mappings)
- stable NRW source-landscape IDs are now reserved for the future source snapshots:
  - lower-secondary math: `c862423f-d0ac-4a65-8ad2-9a6e560313a8`
  - upper-secondary math: `d3a068ca-90c6-4d7f-ab6b-4d8b43085cb1`
- the reservation and activation rule now live in `curricula/DE/Gymnasium/provenance/nrw-math-onboarding.md`
- the shared provenance README now states the operational rule explicitly: do not add planned state-onboarding entries to the active shared registries before a real archived source-landscape snapshot with stable source goal IDs exists

Interpretation:

- Stage B from `canonical-gymnasium-math-de-expansion-plan.md` is now complete for NRW mathematics
- the next NRW task is no longer generic mapping-lane setup; it is a concrete source-snapshot import problem
- active `source-landscape-registry.json`, `source-goal-membership-registry.json`, and `source-goal-closure-registry.json` updates should wait until the first NRW source-landscape JSON exists

### 2026-03-20: NRW mathematics pilot source snapshots complete Stage C and activate shared provenance

What changed:

- the first NRW mathematics source snapshots now exist under `curricula/DE/Gymnasium/input/NW/lower-secondary/source-json/DE_NRW_S_GYM_1_MATHEMATIK.de.json.snapshot` and `curricula/DE/Gymnasium/input/NW/upper-secondary/source-json/DE_NRW_S_GYM_2_MATHEMATIK.de.json.snapshot`
- both source snapshots are intentionally narrow pilot subsets focused on the first shared functions corridor, not yet full NRW subject imports
- the shared provenance registries now actively expose both NRW source landscapes plus their imported goal memberships and atomic closures
- the NRW archive lane now also contains a short structure note at `curricula/DE/Gymnasium/input/NW/math-structure-note.md`
- the DE-NW mapping-lane READMEs now point at active source snapshots instead of a deferred provenance state

Interpretation:

- Stage C from `canonical-gymnasium-math-de-expansion-plan.md` is now complete for NRW mathematics
- the next executable NRW task is the first reviewed canonical math mapping cut on the shared function spine
- there is no longer a provenance blocker for DE-NW mathematics onboarding; the remaining blocker is reviewed corridor authoring quality

### 2026-03-20: DE-NW becomes an active canonical Gymnasium filter, but NRW function authoring exposes a prerequisite-snapshot blocker

What changed:

- the applicability compiler now treats `DE-NW` as a supported Gymnasium jurisdiction next to `DE-HE` and `DE-BY`
- the canonical Gymnasium overview now exposes `DE-NW` / `Nordrhein-Westfalen` as a real root filter option
- backend and frontend filter plumbing now recognize `DE-NW` in the shared canonical Gymnasium root instead of silently treating NRW as an unknown filter value
- the first two real NRW canonical math mappings now exist:
  - lower-secondary source goal `779925c9-038c-4905-b049-de083db123ac`
  - upper-secondary source goal `8fe81d64-ff44-46cf-964b-3312ca6dfa28`
- both NRW source goals map exactly to the shared canonical motivation atom `71cec9fb-3751-4d61-8b34-c5adbbf6e5f2` (`Warum Mathematik? – Denken, Muster & Zukunft`)
- compiled applicability was reapplied afterwards, so the canonical math root now genuinely exposes a first `DE-NW` slice instead of only a speculative filter placeholder
- the same DE-NW activation also reaches the canonical overview root and the existing cross-subject physics entry corridor through already-modeled mathematics-to-physics dependencies

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `npm run validate:view-filters` now reports `0` errors, `3` warnings, `160` accepted warnings
- the focused backend regression slice passed
- full `./run_ci.sh` passed after the DE-NW activation step
- the new `DE-NW` projection is now active with:
  - mathematics: `2` visible goals
  - physics: `3` visible goals
  - overview: `1` visible goal
- no new NRW-specific applicability warnings were introduced by this exact-bridge step

Interpretation:

- this step successfully turns `DE-NW` from a planned onboarding lane into a real third-state canonical filter
- the first attempted NRW function review also made the generic blocker explicit: the current narrow NRW pilot snapshots do **not** yet contain the prerequisite strip that the shared canonical function atoms depend on
- the next NRW task is therefore **not** another blind function mapping pass
- instead, widen the NRW source snapshots first by the missing function prerequisites (`Zuordnungen`, proportionality / early linear foundations, and the still-missing arithmetic or equation prerequisites), then return to the first reviewed function-atom mappings

### 2026-03-20: NRW Sek-I source snapshot widened by the prerequisite strip for first function mappings

What changed:

- the NRW Sek-I source snapshot now no longer starts directly at imported function atoms
- instead, the same `sourceLandscapeId` now also contains the first prerequisite strip needed before shared canonical function mappings become plausible:
  - Erprobungsstufe quantity-relation and rule-of-three goals
  - first-stage rational-number, variable, term, and linear-equation goals
  - first-stage mapping-characterization goals that sit immediately in front of the imported linear-function atoms
- the shared provenance registries `source-goal-membership-registry.json` and `source-goal-closure-registry.json` were widened in place for the same NRW lower-secondary landscape
- the NRW math structure note and onboarding note now treat this lower-secondary prerequisite strip as part of the active NRW pilot surface

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest'`
- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the widened NRW lower-secondary source snapshot loads cleanly and remains backed by the shared DE-level provenance registries
- canonical graph validation still passes
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `160` accepted warnings
- full `./run_ci.sh` passed after the source-snapshot widening step

Interpretation:

- the NRW blocker has moved one layer deeper: the source side is now broad enough for a real first review of `Zuordnungen analysieren` and `Funktionsbegriff und Darstellungen verstehen`
- the next NRW task is now the first reviewed lower-secondary function mapping pass, not more source widening by default

### 2026-03-20: NRW lower-secondary exact bridges complete Stage D2 on the shared function spine

What changed:

- the first reviewed NRW lower-secondary function mapping pass is now complete on top of the already-live motivation bridge
- the NRW lower-secondary mapping fixture now carries `7` exact mappings in total:
  - the shared motivation atom
  - three lower-secondary arithmetic anchors
  - the first rational-number ordering anchor
  - `Zuordnungen analysieren`
  - `Funktionsbegriff und Darstellungen verstehen`
- to make the function-side bridges valid, the NRW Sek-I source snapshot was widened one more time by three explicit arithmetic atoms in the Erprobungsstufe strip:
  - natural numbers represent / order / calculate
  - natural and whole numbers add / subtract
  - natural and whole numbers multiply / divide
- compiled applicability was reapplied afterwards, so the new DE-NW reach is now persisted in canonical mathematics instead of living only in temporary reports

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run validate:graph`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW lower-secondary mapping fixture now parses cleanly with all `7` exact rows
- canonical graph validation still passes after the added NRW arithmetic and function bridges
- `npm run validate:view-filters` is back at `0` errors, `3` warnings, `160` accepted warnings after persisting applicability
- full `./run_ci.sh` passed after the NRW Stage-D2 step

Interpretation:

- the hidden-prerequisite blocker for the first shared NRW function corridor is gone; `Zuordnungen analysieren` and `Funktionsbegriff und Darstellungen verstehen` are now genuinely active for `DE-NW`
- the next NRW task is no longer more prerequisite widening by default
- instead, stay on the existing `2.4.1 Funktionen` slice and review the next follow-on atoms in order:
  - `Funktionswerte berechnen`
  - `Funktionswerte aus Graphen ablesen`
  - the first linear-parameter atom if the source alignment is strong enough

### 2026-03-20: NRW function-value follow-on atoms reach DE-NW through reviewed partial bridges

What changed:

- the broad NRW Stage-1 source expectation around function representations is now modeled as a small source-aligned subcluster under `5cf6e2fd-ce79-4a7e-b21f-fd5f68d97edc`
- that split yields one exact NRW representation leaf for the shared canonical representation atom and two additional NRW leaves that back the immediate follow-on canonical value atoms:
  - `c65ecabf-d00b-4e2d-99ae-b64692325ffb` (`Funktionswerte berechnen`)
  - `a8c42ee9-2898-4247-819f-c235032ac78a` (`Funktionswerte aus Graphen ablesen`)
- both new NRW bridges are intentionally `partial`, not `exact`
- the reason is the same one already accepted in Bavaria: the NRW source wording clearly covers representation work with tables and graphs, but does not isolate separate one-to-one source atoms for direct value calculation and graph-based value reading
- the accepted-warning registry now records these two DE-NW-specific `APV-202` decisions explicitly instead of leaving them as active drift

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW lower-secondary mapping fixture now parses cleanly with `9` rows
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `162` accepted warnings after persisting applicability
- full `./run_ci.sh` passed after the NRW follow-on bridge step

Interpretation:

- `DE-NW` now reaches the first shared function-concept atom plus the two immediate function-value follow-on atoms without reopening the hidden-prerequisite problem
- this is a reviewed retention of source breadth mismatch, not a claim that NRW already exposes cleaner exact atoms here
- the next NRW task should stay in the same corridor and decide whether the linear-parameter pair can be handled more cleanly:
  - `0159a2d5-baca-4652-8515-350f7b853267` against the graph-side parameter atom
  - `ec6f0c55-6008-4792-b315-09918e7f7248` against the contextual parameter atom

### 2026-03-20: NRW linear-parameter corridor reaches DE-NW with reviewed prerequisite-backed partial bridges

What changed:

- the NRW lower-secondary math mapping lane now carries `12` rows instead of `9`
- the two reviewed Stage-1 parameter atoms are now bridged into the shared canonical line/parameter corridor:
  - `0159a2d5-baca-4652-8515-350f7b853267` -> `af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186` (`Lineare Funktionen beschreiben`) as `partial`
  - `ec6f0c55-6008-4792-b315-09918e7f7248` -> `2d75fd3f-c68b-4a11-89ae-19a30fefc47a` (`Parameter linearer Funktionen deuten`) as `partial`
- the attempted `af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186` bridge surfaced a real hidden-prerequisite gap for `c1f50bcc-7848-4e49-b9de-0ec030cc6bca` (`Proportionale Zuordnungen nutzen`)
- instead of accepting a new override, the NRW Erprobungsstufe source atom `d54b396e-653f-48c6-966d-cada189a84aa` (`Dreisatzverfahren zur Loesung von Sachproblemen anwenden`) now backs that canonical prerequisite as a reviewed `partial` bridge
- the accepted-warning registry now records these three DE-NW-specific `APV-202` decisions explicitly:
  - `c1f50bcc-7848-4e49-b9de-0ec030cc6bca`
  - `af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186`
  - `2d75fd3f-c68b-4a11-89ae-19a30fefc47a`

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW lower-secondary mapping fixture now parses cleanly with `12` rows
- `npm run apply:applicability` persisted the expected canonical math applicability update without new validation errors
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `165` accepted warnings
- full `./run_ci.sh` passed after the NRW linear-parameter bridge step

Interpretation:

- `DE-NW` now reaches the shared lower-secondary line foundation plus the first linear-parameter interpretation atom without introducing any new applicability overrides
- this is still reviewed source-breadth retention, not a claim that NRW exposes one-to-one canonical atoms for proportional mappings or linear-parameter semantics
- the next NRW decision point has moved beyond the Stage-1 linear corridor:
  - either stay in lower-secondary functions and review the first Stage-2 function-class atom
  - or switch deliberately to widening the upper-secondary NRW math snapshot before adding more canonical bridges

### 2026-03-20: NRW reaches the first effective Stage-2 quadratic bridge through the graph-parameter atom

What changed:

- the NRW lower-secondary math mapping lane now carries `13` rows instead of `12`
- the first effective NRW Stage-2 bridge is not the broad class-distinction atom itself, but the more concrete graph-parameter source goal `f02c5ec8-cb34-410a-bf5e-fb331b0a2080`
- that NRW source atom now maps as a reviewed `partial` bridge to `5bced7dc-6557-4af1-9e70-d87f850d3b7f` (`Parameter quadratischer Funktionen in Scheitelpunktform deuten`)
- this in turn activates the first NRW-visible J9 quadratic child and pulls the shared quadratic clusters into `DE-NW` through compiled child-union:
  - `d4a9fc20-d1be-46e7-86e9-2bf8d7a9cc40` (`Quadratische Funktionen und Gleichungen grundlegend untersuchen`)
  - `5a9702f4-7e4d-457d-b98c-f0bafcd1e386` (`Quadratische Funktionen beschreiben und anwenden`)
- the accepted-warning registry now records the new DE-NW-specific `APV-202` for `5bced7dc-6557-4af1-9e70-d87f850d3b7f`
- the earlier exploratory idea to bridge the broad NRW class-distinction atom directly to the quadratic cluster was not kept; the effective retained step is the atomic graph-parameter bridge because cluster applicability compiles from visible children

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW lower-secondary mapping fixture now parses cleanly with `13` rows
- `npm run apply:applicability` persisted the expected canonical math applicability update and changed `4` goals in the canonical math file
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `166` accepted warnings
- full `./run_ci.sh` passed after the NRW Stage-2 quadratic bridge step

Interpretation:

- `DE-NW` now reaches the first real lower-secondary quadratic atom in the shared canonical graph, not just Stage-1 function foundations
- the NRW Stage-2 lane is therefore active, but still only at its entry point
- the next NRW task should stay in this quadratic corridor and make the broad class-distinction decision explicit:
  - either review `cfadb2dd-a25f-4f83-bbf6-6df00bdd091d` against the next quadratic follow-on atom if the alignment is defensible
  - or introduce a small NRW Stage-2 source split before attempting more canonical quadratic bridges

### 2026-03-20: NRW extends the Stage-2 quadratic lane to graph-property reading without a source split

What changed:

- the NRW lower-secondary math mapping lane now carries `14` rows instead of `13`
- the broad NRW class-distinction source atom `cfadb2dd-a25f-4f83-bbf6-6df00bdd091d` now maps as a reviewed `partial` bridge to `e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e` (`Eigenschaften quadratischer Funktionen aus Graphen ablesen`)
- this makes the second visible NRW quadratic foundation leaf available in the shared canonical J9 corridor without adding or splitting NRW source nodes
- the accepted-warning registry now records the new DE-NW-specific `APV-202` for `e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e`

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW lower-secondary mapping fixture now parses cleanly with `14` rows
- `npm run apply:applicability` changed `1` goal in the canonical math file, exactly the newly bridged quadratic graph-property atom
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `167` accepted warnings
- full `./run_ci.sh` passed after the NRW Stage-2 graph-property step

Interpretation:

- the earlier Stage-2 decision is now closed: for this slice, the broad NRW class-distinction atom was defensible enough as a direct reviewed `partial` bridge, so no source split was needed
- `DE-NW` now reaches both the first parameter leaf and the next graph-property leaf in the retained J9 quadratic foundations corridor
- the next NRW task should stay in Stage 2, but move from quadratic foundations into the application/growth atom:
  - either review `890a6667-7cec-41ac-be6b-c7ed6121b0d7` against the first quadratic application node if the alignment is defensible
  - or introduce a small NRW Stage-2 source split before attempting that application bridge

### 2026-03-20: NRW activates the first quadratic application bridge through the broad growth atom

What changed:

- the NRW lower-secondary math mapping lane now carries `15` rows instead of `14`
- the broad NRW Stage-2 growth/application source atom `890a6667-7cec-41ac-be6b-c7ed6121b0d7` now maps as a reviewed `partial` bridge to `a7ccb7a9-6fb0-4e2d-b6e0-6420cc5ae0bf` (`Quadratische Funktionen in Anwendungen modellieren und loesen`)
- this activates the first NRW-visible quadratic application leaf and pulls the shared quadratic application cluster `0d4a6f56-2f87-4c39-98ab-5f13f5cbdd40` into `DE-NW`
- the accepted-warning registry now records the new DE-NW-specific `APV-202` for `a7ccb7a9-6fb0-4e2d-b6e0-6420cc5ae0bf`

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW lower-secondary mapping fixture now parses cleanly with `15` rows
- `npm run apply:applicability` changed `2` goals in the canonical math file: the new quadratic application leaf and its parent application cluster
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `168` accepted warnings
- full `./run_ci.sh` passed after the NRW Stage-2 application step

Interpretation:

- the second Stage-2 decision is now also closed: for this slice, the broad NRW growth/application atom was defensible enough as a direct reviewed `partial` bridge, so no NRW source split was needed
- `DE-NW` now reaches both the quadratic foundations branch and the first quadratic applications branch in the shared J9 corridor
- the next NRW task should move to upper-secondary breadth instead of forcing more lower-secondary Stage-2 splits:
  - keep the reviewed lower-secondary NRW Stage-2 bridges stable
  - then widen the NRW upper-secondary math lane beyond the current motivation-only exact bridge

### 2026-03-20: NRW reaches the first upper-secondary analysis entry leaf beyond motivation

What changed:

- the NRW upper-secondary math mapping lane now carries `2` rows instead of `1`
- the first real NRW upper-secondary analysis bridge is not yet the broad derivative bundle, but the more conservative E-phase source atom `0c1195ec-efe3-4d68-9219-e46a807c802d` (`Mittlere und lokale Aenderungsraten berechnen und deuten`)
- that NRW source atom now maps as a reviewed `partial` bridge to `ae20183e-92b5-5521-b8e0-9a8662cf51f5` (`Mittlere Änderungsrate berechnen und deuten`)
- this activates the first NRW-visible upper-secondary analysis leaf and pulls the shared canonical derivative-entry cluster `a115f984-2628-54fb-9702-9511e460d684` (`Einführung in den Ableitungsbegriff`) into `DE-NW`
- the accepted-warning registry now records the new DE-NW-specific `APV-202` for `ae20183e-92b5-5521-b8e0-9a8662cf51f5`

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `2` rows
- `npm run apply:applicability` changed `2` goals in the canonical math file: the new E-phase change-rate leaf and its parent E.2 derivative-introduction cluster
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `169` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary E-phase entry step

Interpretation:

- NRW upper-secondary math is now active on the shared canonical analysis spine beyond the motivation anchor
- the broad NRW derivative/monotonicity source atom is still intentionally untouched; the retained step is the narrower change-rate bridge because it is the cleanest first E-phase entry
- the next NRW task should stay in the upper-secondary E.2 corridor and make the derivative-entry decision explicit:
  - either review `3d1a8d83-27a4-4a0d-b8e0-c738f274d4bd` against the next derivative-entry atom if the alignment is defensible
  - or introduce a small NRW upper-secondary source split before attempting broader derivative and monotonicity bridges

### 2026-03-20: NRW reaches the next E.2 derivative-entry leaf through a reviewed prerequisite bridge

What changed:

- the NRW upper-secondary math mapping lane now carries `3` rows instead of `2`
- the previously deferred broad NRW source atom `3d1a8d83-27a4-4a0d-b8e0-c738f274d4bd` (`Ableitung als Tangentensteigung und Monotonieinstrument deuten`) is now reused once as a reviewed `partial` bridge to `2143e9e8-b176-545b-b2fa-91bbb6c8cf5c` (`Momentane Änderungsrate qualitativ verstehen`)
- this exposed a real hidden-prerequisite edge in the shared canonical derivative-entry route: `2143e9e8-b176-545b-b2fa-91bbb6c8cf5c` requires `b42bdfcc-3db7-5697-8b3e-69e50962ca86` (`Grenzwerte des Differenzenquotienten bestimmen`)
- instead of forcing a weaker second mapping immediately, the prerequisite atom now carries a reviewed retained `DE-NW` applicability override in the canonical math graph
- the accepted-warning registry now records the NRW-specific follow-on decisions explicitly:
  - `APV-202` for `2143e9e8-b176-545b-b2fa-91bbb6c8cf5c`
  - `APV-201` for `b42bdfcc-3db7-5697-8b3e-69e50962ca86`

Validation used:

- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `3` rows
- `npm run apply:applicability` changed `2` goals in the canonical math file: the retained prerequisite atom `b42bdfcc-3db7-5697-8b3e-69e50962ca86` and the new NRW-visible derivative-entry leaf `2143e9e8-b176-545b-b2fa-91bbb6c8cf5c`
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `171` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary prerequisite-backed derivative-entry step

Interpretation:

- NRW upper-secondary math now reaches the next shared E.2 derivative-entry leaf beyond the first average-rate bridge
- the reused broad NRW derivative/monotonicity source atom is now proven usable for one more conservative follow-on step, but only with an explicit retained prerequisite bridge
- the next NRW task should stay in the same upper-secondary E.2 corridor and decide whether the same broad source atom can defensibly support one more follow-on derivative leaf, or whether a small NRW source split is now the cleaner move before broader derivative/monotonicity authoring

### 2026-03-20: NRW upper-secondary E.2 gains a source-split point-derivative bridge without reopening hidden-prerequisite drift

What changed:

- the broad NRW upper-secondary source atom `3d1a8d83-27a4-4a0d-b8e0-c738f274d4bd` is no longer treated as an indivisible atomic leaf inside the archived source snapshot
- the NRW upper-secondary source snapshot now keeps `3d1a8d83-27a4-4a0d-b8e0-c738f274d4bd` as a retained corridor cluster and splits it into two child atoms:
  - `c3791879-8901-443a-ac91-bf9cd712b38e` for pointwise derivative interpretation as local rate and tangent slope
  - `c876c75b-dcc4-426e-be0f-15698add835d` for monotonicity and derivative-function interpretation
- the existing reviewed `partial` bridge from the retained corridor cluster `3d1a8d83-27a4-4a0d-b8e0-c738f274d4bd` to `2143e9e8-b176-545b-b2fa-91bbb6c8cf5c` stays in place
- the new NRW child atom `c3791879-8901-443a-ac91-bf9cd712b38e` now maps as a reviewed `partial` bridge to `b1dcc191-d046-50de-984a-ee5c17157628` (`Ableitung als Steigung im Punkt deuten`)
- the canonical prerequisite cut was tightened at the same time:
  - `b1dcc191-d046-50de-984a-ee5c17157628` now depends only on `b42bdfcc-3db7-5697-8b3e-69e50962ca86`
  - `bb979dbd-b080-432c-8cf1-067ba6eff381` (`Tangentengleichungen und Steigungswinkel bestimmen`) now requires `858113c5-e53b-57bb-b01f-ba95c3ddcb6f` directly, so tangent-equation calculation stays gated by derivative-rule fluency
- the shared NRW source-goal membership and closure registries were widened in place for the split source snapshot, and the backend registry expectation was updated accordingly
- the accepted-warning registry now records the new NRW-specific `APV-202` for `b1dcc191-d046-50de-984a-ee5c17157628`

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesNrwArchivedAtomicClosureFromRealRegistry'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `4` rows
- `npm run apply:applicability` changed `1` goal in the canonical math file: `b1dcc191-d046-50de-984a-ee5c17157628` is now visible for `DE-NW`
- the NRW archived upper-secondary closure registry now resolves the split E-phase analysis corridor with `c3791879-8901-443a-ac91-bf9cd712b38e` and `c876c75b-dcc4-426e-be0f-15698add835d` instead of the old unsplit atomic closure
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `172` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary source-split point-derivative step

Interpretation:

- NRW upper-secondary math now reaches the next shared point-derivative interpretation leaf without forcing another applicability override
- the retained NRW source split proved to be the cleaner move than stacking further broad-source mappings on one legacy goal ID
- the next NRW task should stay on the second split child `c876c75b-dcc4-426e-be0f-15698add835d` and decide whether it can defensibly back `845440ce-f63f-5835-903f-739145ca27bd` (`Zusammenhang von f und f′ am Graphen beschreiben`) directly, or whether the canonical monotonicity/f-prime route still needs one more modeling adjustment first

### 2026-03-20: NRW upper-secondary E.2 reaches the shared `f`/`f′` graph leaf after one more canonical prerequisite cut

What changed:

- the second NRW upper-secondary split child `c876c75b-dcc4-426e-be0f-15698add835d` now maps as a reviewed `partial` bridge to `845440ce-f63f-5835-903f-739145ca27bd` (`Zusammenhang von f und f′ am Graphen beschreiben`)
- the canonical prerequisite cut was tightened once more so that `845440ce-f63f-5835-903f-739145ca27bd` now depends only on `b1dcc191-d046-50de-984a-ee5c17157628` and no longer on `858113c5-e53b-57bb-b01f-ba95c3ddcb6f`
- this keeps the first shared `f`/`f′` graph-reading leaf reachable in `DE-NW` without prematurely exposing the downstream tangent-calculation corridor
- the accepted-warning registry now records the NRW-specific `APV-202` for `845440ce-f63f-5835-903f-739145ca27bd`
- the repository-backed NRW upper-secondary mapping fixture now expects `5` rows, and the real archived-source registry test remains aligned with the earlier NRW E.2 source split

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesNrwArchivedAtomicClosureFromRealRegistry'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `npm run apply:applicability` changed `1` goal in the canonical math file: `845440ce-f63f-5835-903f-739145ca27bd` is now visible for `DE-NW`
- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `5` rows
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `173` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary `f`/`f′` graph step

Interpretation:

- NRW upper-secondary math now reaches the first shared graph-level relation between `f` and `f′`, not just local derivative-entry leaves
- the earlier NRW source split was sufficient; the remaining blocker was canonical prerequisite shape, not another missing NRW source atom
- the next NRW task should stay in the same upper-secondary derivative corridor and decide which first downstream monotonicity/extrema leaf can be opened next without dragging in broader tangent-rule fluency too early

### 2026-03-20: NRW upper-secondary broadens the E-phase source snapshot and reaches the first computational E.3 leaves

What changed:

- the NRW upper-secondary source snapshot was widened in place inside the same E-phase analysis lane instead of forcing another canonical shortcut
- the E-phase source cluster `54d2c225-f931-4ba7-ab9e-0d9055820c09` now also contains three newly imported NRW source atoms:
  - `0c3056ad-ee56-49e8-aff4-fabcae51eb98` for Potenz-, Summen- und Faktorregel
  - `fd54f82d-0846-4277-ae97-b3964fb41de0` for graphical derivatives, monotonicity, and extrema criteria
  - `53563e97-253b-4f3c-8911-d1ec1ac1edb3` for curvature and Wendepunkt criteria via the second derivative
- the NRW upper-secondary mapping lane now carries `8` rows instead of `5`
- the three new NRW source atoms map as reviewed `partial` bridges to:
  - `858113c5-e53b-57bb-b01f-ba95c3ddcb6f` (`Ableitungen elementarer Funktionen berechnen`)
  - `350fc8b1-ead0-4239-b28a-217cbd3bd1c3` (`Monotonie und Extremstellen mit der ersten Ableitung untersuchen`)
  - `b3604df4-15a8-41c8-a8b0-50dadd698bd3` (`Krümmung und Wendestellen mit der zweiten Ableitung untersuchen`)
- the shared NRW source-goal membership and closure registries were widened in place for the same upper-secondary `sourceLandscapeId`
- the accepted-warning registry now records the three new NRW-specific `APV-202` entries for `858113c5-e53b-57bb-b01f-ba95c3ddcb6f`, `350fc8b1-ead0-4239-b28a-217cbd3bd1c3`, and `b3604df4-15a8-41c8-a8b0-50dadd698bd3`

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesNrwArchivedAtomicClosureFromRealRegistry'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `8` rows
- `npm run apply:applicability` changed `4` goals in the canonical math file: `858113c5-e53b-57bb-b01f-ba95c3ddcb6f`, `350fc8b1-ead0-4239-b28a-217cbd3bd1c3`, `b3604df4-15a8-41c8-a8b0-50dadd698bd3`, and the parent `E.3` cluster `6fc51848-6705-532f-9dfe-2070bef2f9ad`
- the NRW archived upper-secondary closure registry now resolves the widened E-phase analysis corridor with `12` atomic source goals instead of `9`
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `176` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary E-phase differential-expansion step

Interpretation:

- NRW upper-secondary math now reaches the first genuinely computational shared `E.3` analysis corridor, not only interpretive `E.2` leaves
- the cleaner move here was source-snapshot widening from the archived NRW KLP, not another canonical prerequisite workaround
- the next NRW task should leave the pure E-phase import lane and add the first Q-phase extremal-problem source atom from `2.4.1`, because `858...`, `350...`, and `b360...` are now already present on the shared canonical spine

### 2026-03-20: NRW upper-secondary imports the first Q-phase extremal-problem source atom and reaches the shared extremal leaf

What changed:

- the NRW upper-secondary source snapshot now also carries the first explicit Q-phase Grundkurs extremal-problem atom:
  - `ef475a7e-a647-4140-bad9-304ca3a53ef5` (`Extremwertprobleme mit Nebenbedingungen auf eine Variable zurueckfuehren und loesen`)
- the Q-phase Grundkurs source cluster `3ad7040a-095d-4356-9972-2403cf0967bb` was widened in place and renamed from a pure exponential/integral cluster to an extremal-, exponential-, and integral-understanding cluster
- the NRW upper-secondary mapping lane now carries `9` rows instead of `8`
- the new NRW source atom maps as a reviewed `partial` bridge to:
  - `1511b39a-4094-5450-a755-4a3ad3339733` (`Einfache Extremwertprobleme lösen`)
- the shared NRW source-goal membership and closure registries were widened in place for the same upper-secondary `sourceLandscapeId`
- the accepted-warning registry now records the NRW-specific `APV-202` entry for `1511b39a-4094-5450-a755-4a3ad3339733`

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesNrwArchivedAtomicClosureFromRealRegistry'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `9` rows
- `npm run apply:applicability` changed `1` goal in the canonical math file: `1511b39a-4094-5450-a755-4a3ad3339733` is now visible for `DE-NW`
- the NRW archived upper-secondary closure registry now resolves the widened analysis corridor with `13` atomic source goals instead of `12`
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `177` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary Q-phase extremal-problem step

Interpretation:

- NRW upper-secondary math now reaches the first shared optimization leaf in the canonical differential-calculus corridor, not only derivative and graph-reading atoms
- the cleanest move here was a small source-snapshot widening from the archived NRW Q-phase text, not a canonical graph reshaping
- the next NRW task should not immediately widen the broader Q-phase parameter/integral surface; it should first decide whether the still-unimported E-phase tangent/normal-steigung clause from `2.3` deserves a small source-split or source-addition for `bb979dbd-b080-432c-8cf1-067ba6eff381` (`Tangentengleichungen und Steigungswinkel bestimmen`)

### 2026-03-20: NRW upper-secondary adds the E-phase tangent/normal-steigung clause and reaches the shared tangent leaf

What changed:

- the NRW upper-secondary E-phase derivative corridor was widened in place instead of opening another broad Q-phase bridge first
- the retained E-phase source cluster `3d1a8d83-27a4-4a0d-b8e0-c738f274d4bd` now also contains the explicit NRW source atom:
  - `43b21038-8dbb-4f85-ab8e-898a9cef38fb` (`Sekanten-, Tangenten- und Normalensteigungen mit Steigungswinkeln bestimmen`)
- the same retained source cluster was renamed and widened so its archived wording now explicitly covers derivative interpretation, tangent work, and monotonicity
- the NRW upper-secondary mapping lane now carries `10` rows instead of `9`
- the new NRW source atom maps as a reviewed `partial` bridge to:
  - `bb979dbd-b080-432c-8cf1-067ba6eff381` (`Tangentengleichungen und Steigungswinkel bestimmen`)
- the shared NRW source-goal membership and closure registries were widened in place for the same upper-secondary `sourceLandscapeId`
- the accepted-warning registry now records the NRW-specific `APV-202` entry for `bb979dbd-b080-432c-8cf1-067ba6eff381`

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesNrwArchivedAtomicClosureFromRealRegistry'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `10` rows
- `npm run apply:applicability` changed `1` goal in the canonical math file: `bb979dbd-b080-432c-8cf1-067ba6eff381` is now visible for `DE-NW`
- the NRW archived upper-secondary closure registry now resolves the widened analysis corridor with `14` atomic source goals instead of `13`
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `178` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary tangent/normal step

Interpretation:

- NRW upper-secondary math now reaches the first shared tangent-equation leaf on the canonical analysis spine, not only derivative, graph, and extremal leaves
- the cleaner move here was a small E-phase source add from the archived NRW text, not another broad Q-phase corridor mapping
- the next NRW task should return to the already imported Q-phase Grundkurs integral/bestands atom `cc57ef8b-b0a6-4a42-b82d-92433e0ad227` and test it against `2afba4a2-287d-5e8f-aeee-a3bcf8652236` (`Integral als Bestand und Flächeninhalt verstehen`) before widening the broader parameter or exponential surface

### 2026-03-20: NRW upper-secondary reaches the shared integral-as-stock leaf and trims obsolete Q1 cluster prerequisites

What changed:

- the already imported NRW Grundkurs source atom `cc57ef8b-b0a6-4a42-b82d-92433e0ad227` now maps as a reviewed `partial` bridge to:
  - `2afba4a2-287d-5e8f-aeee-a3bcf8652236` (`Integral als Bestand und Flächeninhalt verstehen`)
- the NRW upper-secondary mapping lane now carries `11` rows instead of `10`
- the accepted-warning registry now records the NRW-specific `APV-202` entry for `2afba4a2-287d-5e8f-aeee-a3bcf8652236`
- the canonical Q1 integral clusters
  - `c8951a07-a3e7-59d2-8a23-dce545dd811a` (`Q1 Analysis – Integralrechnung und Differenzialgleichungen`)
  - `93ac7fc8-6d83-5394-bbea-80758b463da1` (`Q1.1 Einführung in die Integralrechnung`)
  no longer carry the old broad cluster-level `requires`; the didactic sequencing now stays on the child leaves instead of forcing a Hessen-specific prerequisite wall onto the new NRW child-union visibility

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `11` rows
- `npm run apply:applicability` changed `3` goals in the canonical math file:
  - `2afba4a2-287d-5e8f-aeee-a3bcf8652236`
  - `93ac7fc8-6d83-5394-bbea-80758b463da1`
  - `c8951a07-a3e7-59d2-8a23-dce545dd811a`
  are now visible for `DE-NW`
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `179` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary integral step

Interpretation:

- NRW upper-secondary math now reaches the first shared integral-introduction leaf on the canonical analysis spine, not only derivative, tangent, and extremal leaves
- the decisive technical fix here was not further NRW source widening, but removing two obsolete cluster-wide Q1 prerequisite bundles so the canonical route is again carried by leaf-level didactic dependencies
- the next NRW task should stay on the same imported Q-phase integral surface and test whether `cc57ef8b-b0a6-4a42-b82d-92433e0ad227` can also carry `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6` (`Flächen unter Graphen näherungsweise bestimmen`) before widening the broader parameter or exponential lane

### 2026-03-20: NRW upper-secondary source-splits the imported integral atom and reaches the shared area-approximation leaf

What changed:

- the broad NRW Q-phase integral atom `cc57ef8b-b0a6-4a42-b82d-92433e0ad227` no longer tries to back two canonical leaves directly
- instead, the archived NRW source snapshot now carries a small retained Q-phase integral cluster:
  - `cc57ef8b-b0a6-4a42-b82d-92433e0ad227` (`Produktsummen, Flächeninhalte und Gesamtbestände im Sachkontext deuten`)
  - with a new child `71539804-c722-4fe6-bc71-e4e2abe1773f` (`Produktsummen und Flächeninhalte im Sachkontext deuten`)
- the broad retained cluster keeps the reviewed `partial` bridge to:
  - `2afba4a2-287d-5e8f-aeee-a3bcf8652236` (`Integral als Bestand und Flächeninhalt verstehen`)
- the new split child now maps as a reviewed `partial` bridge to:
  - `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6` (`Flächen unter Graphen näherungsweise bestimmen`)
- the NRW upper-secondary mapping lane now carries `12` rows instead of `11`
- the accepted-warning registry now records the NRW-specific `APV-202` entry for `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6`
- the shared NRW source-goal membership and closure registries were updated in place so the retained upper-secondary `sourceLandscapeId` stays stable while the integral corridor now resolves through the new child atom

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesNrwArchivedAtomicClosureFromRealRegistry'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `12` rows
- the NRW archived upper-secondary closure registry still resolves the imported analysis corridor with `14` atomic source goals; the new split replaced the old integral atom one-for-one instead of widening the slice again
- the stabilizing `npm run apply:applicability` pass changed `0` goals because the newly opened NRW area-approximation leaf stayed visible after replacing the duplicate-legacy mapping with the source split
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `180` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary integral split step

Interpretation:

- NRW upper-secondary math now reaches the shared area-approximation leaf on the canonical Q1.1 integral spine, not only the introductory stock/area leaf
- the decisive move here was a small retained source split that preserved the backend one-legacy-goal-one-canonical-goal contract instead of relaxing the repository mapping semantics
- the next NRW task should stay on the same Q-phase integral corridor and decide whether the still-unimported Hauptsatz clause from `2.4.1` deserves a small source-add for `b9bbd2a8-1379-5ffb-817f-41467d48abef` (`Hauptsatz der Differential- und Integralrechnung nutzen`) before widening the broader parameter or exponential lane

### 2026-03-20: NRW upper-secondary adds the Q-phase Hauptsatz clause and reaches the shared Fundamental-Theorem leaf

What changed:

- the NRW upper-secondary Q-phase Grundkurs integral corridor was widened by one small source add instead of opening broader parameter or exponential lanes
- the imported NRW snapshot now also carries the new source atom:
  - `3ae0f88b-3dcb-462f-a909-b46b1fca49e6` (`Hauptsatz anschaulich erklären und Stammfunktionen nutzen`)
- this atom sits as a new sibling under the retained Q-phase Grundkurs cluster `3ad7040a-095d-4356-9972-2403cf0967bb`
- the NRW upper-secondary mapping lane now carries `13` rows instead of `12`
- the new NRW source atom maps as a reviewed `partial` bridge to:
  - `b9bbd2a8-1379-5ffb-817f-41467d48abef` (`Hauptsatz der Differential- und Integralrechnung nutzen`)
- the accepted-warning registry now records the NRW-specific `APV-202` entry for `b9bbd2a8-1379-5ffb-817f-41467d48abef`
- the shared NRW source-goal membership and closure registries were widened in place for the same retained upper-secondary `sourceLandscapeId`

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesNrwArchivedAtomicClosureFromRealRegistry'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `13` rows
- `npm run apply:applicability` changed `1` goal in the canonical math file: `b9bbd2a8-1379-5ffb-817f-41467d48abef` is now visible for `DE-NW`
- the NRW archived upper-secondary closure registry now resolves the imported analysis corridor with `15` atomic source goals instead of `14`
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `181` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary Hauptsatz step

Interpretation:

- NRW upper-secondary math now reaches the shared Fundamental-Theorem leaf on the canonical Q1.1 integral spine, not only stock/area and area-approximation leaves
- the cleaner move here was a small Q-phase source add that combines Hauptsatz explanation with Stammfunktionsarbeit, not another canonical graph reshaping
- the next NRW task should stay on the same integral corridor and decide whether the still-unimported Q-phase clause for `Intervalladditivität und Linearität von Integralen` or the separate `Flächeninhalte mithilfe von bestimmten Integralen` clause should be imported next before widening broader parameter or exponential lanes

### 2026-03-20: NRW upper-secondary adds the definite-integral area clause and reaches the shared area-with-integrals leaf

What changed:

- the NRW upper-secondary Q-phase integral corridor was widened by one small source add instead of opening broader parameter or exponential lanes
- the imported NRW snapshot now also carries the new source atom:
  - `df210bbb-749a-40ff-841e-c2fded9cca31` (`Flaecheninhalte mithilfe bestimmter Integrale ermitteln`)
- this atom sits as a new sibling under the retained Q-phase Grundkurs cluster `3ad7040a-095d-4356-9972-2403cf0967bb`
- the NRW upper-secondary mapping lane now carries `14` rows instead of `13`
- the new NRW source atom maps as a reviewed `partial` bridge to:
  - `e9114fc2-1a87-5ef5-8fa3-7ee4c9bbe0dd` (`Flächen mit Integralen berechnen`)
- the accepted-warning registry now records the NRW-specific `APV-202` entry for `e9114fc2-1a87-5ef5-8fa3-7ee4c9bbe0dd`
- the shared NRW source-goal membership and closure registries were widened in place for the same retained upper-secondary `sourceLandscapeId`

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesNrwArchivedAtomicClosureFromRealRegistry'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `14` rows
- the NRW archived upper-secondary closure registry now resolves the imported analysis corridor with `16` atomic source goals instead of `15`
- the applicability pass widened the canonical Q1 integral application route for `DE-NW`, including `e9114fc2-1a87-5ef5-8fa3-7ee4c9bbe0dd` (`Flächen mit Integralen berechnen`)
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `182` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary definite-integral area step

Interpretation:

- NRW upper-secondary math now reaches the shared area-with-integrals leaf on the canonical Q1.2 application spine, not only stock/area introduction, area approximation, and Hauptsatz leaves
- the clean move here was another small Q-phase source add that isolates the explicit definite-integral area clause instead of overloading the broader imported NRW corridor
- the next NRW task should stay on the same integral corridor and decide whether the still-unimported clause for `Intervalladditivität und Linearität von Integralen` deserves the next small source add before widening broader parameter or exponential lanes

### 2026-03-20: NRW upper-secondary adds the interval-additivity clause and reaches the shared integral-term argumentation leaf

What changed:

- the NRW upper-secondary Q-phase integral corridor was widened by one more small source add instead of opening broader parameter or exponential lanes
- the imported NRW snapshot now also carries the new source atom:
  - `a39a1fb7-bf12-4d5b-8d73-1aafd5b18e19` (`Intervalladditivitaet und Linearitaet von Integralen nutzen`)
- this atom sits as a new sibling under the retained Q-phase Grundkurs cluster `3ad7040a-095d-4356-9972-2403cf0967bb`
- the NRW upper-secondary mapping lane now carries `15` rows instead of `14`
- the new NRW source atom maps as a reviewed `partial` bridge to:
  - `34604a97-0c64-5b06-81e2-6ac818732d60` (`Integralterme interpretieren und begründen`)
- the accepted-warning registry now records the NRW-specific `APV-202` entry for `34604a97-0c64-5b06-81e2-6ac818732d60`
- the shared NRW source-goal membership and closure registries were widened in place for the same retained upper-secondary `sourceLandscapeId`

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesNrwArchivedAtomicClosureFromRealRegistry'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `15` rows
- the NRW archived upper-secondary closure registry now resolves the imported analysis corridor with `17` atomic source goals instead of `16`
- `npm run apply:applicability` changed `1` goal in the canonical math file: `34604a97-0c64-5b06-81e2-6ac818732d60` is now visible for `DE-NW`
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `183` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary interval-additivity step

Interpretation:

- NRW upper-secondary math now reaches the shared integral-term argumentation leaf on the canonical Q1.2 application spine, not only the surrounding area, stock, and Hauptsatz leaves
- the clean move here was another small Q-phase source add that isolates the explicit interval-additivity/linearity clause instead of forcing a broader canonical reinterpretation
- the next NRW task should decide whether the remaining unimported introductory integral pair `(13)` / `(14)` deserves one last small source add for the Q1.1 introduction surface before widening broader parameter or exponential lanes

### 2026-03-20: NRW upper-secondary archives the remaining introductory integral pair and repoints the approximation bridge to the narrower limit-transition clause

What changed:

- the NRW upper-secondary Q-phase integral corridor was widened by the two still-missing introductory source atoms instead of opening broader parameter or exponential lanes
- the imported NRW snapshot now also carries the new source atoms:
  - `371359c2-6e29-4863-879f-d53b044204ce` (`Graphen von Flaecheninhaltsfunktionen skizzieren`)
  - `18a7ac50-2fb1-4b2a-9eed-3f7f290bdb69` (`Uebergang von der Produktsumme zum Integral erlaeutern und vollziehen`)
- both atoms sit as new siblings under the retained Q-phase Grundkurs cluster `3ad7040a-095d-4356-9972-2403cf0967bb`
- the NRW upper-secondary mapping lane still carries `15` rows, but the reviewed `partial` bridge for:
  - `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6` (`Flächen unter Graphen näherungsweise bestimmen`)
  now points to the narrower source atom `18a7ac50-2fb1-4b2a-9eed-3f7f290bdb69` instead of the broader retained productsum/area atom `71539804-c722-4fe6-bc71-e4e2abe1773f`
- the accepted-warning registry keeps the NRW-specific `APV-202` entry for `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6`, but with the rationale updated to match the cleaner source clause
- the shared NRW source-goal membership and closure registries were widened in place for the same retained upper-secondary `sourceLandscapeId`

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesNrwArchivedAtomicClosureFromRealRegistry'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture still parses cleanly with `15` rows
- the NRW archived upper-secondary closure registry now resolves the imported analysis corridor with `19` atomic source goals instead of `17`
- `npm run apply:applicability` changed `0` goals because the canonical approximate-area leaf stayed visible while the NRW bridge was repointed to the narrower source clause
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `183` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary introductory-integral cleanup step

Interpretation:

- NRW upper-secondary math does not gain a new visible canonical leaf in this step; the gain is a cleaner source-aligned backing for the existing Q1.1 approximation route and a retained source atom for the still-unmapped area-function clause
- the productive open question is now narrower: whether `371359c2-6e29-4863-879f-d53b044204ce` (`Graphen von Flaecheninhaltsfunktionen skizzieren`) justifies a future canonical integral-function / area-function leaf
- if not, the NRW integral corridor is clean enough to leave here and widen the broader parameter or exponential lane instead

### 2026-03-20: NRW upper-secondary closes the repository mapping gap on the first shared exponential leaf

What changed:

- the NRW upper-secondary source snapshot was not widened in this step; instead, the repository-backed NRW mapping lane was brought into line with the already compiled exponential entry surface
- the existing NRW source atom:
  - `c714c662-b476-4945-9352-e62869770bed` (`Natuerliche Exponentialfunktion beschreiben und fuer Wachstum nutzen`)
  now maps as a reviewed `partial` bridge to:
  - `781f133a-08bb-54b9-8fda-efa2f8f9b12c` (`Exponentialen Wachstum und Zerfall deuten`)
- the NRW upper-secondary mapping lane now carries `16` rows instead of `15`
- the accepted-warning registry now records the NRW-specific `APV-202` entry for `781f133a-08bb-54b9-8fda-efa2f8f9b12c`
- no provenance registries or source snapshots changed in this step

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `16` rows
- `npm run apply:applicability` changed `0` goals because the canonical exponential entry leaf was already `DE-NW`-visible in the working tree and this step closed the missing repository-backed mapping/accepted-warning gap
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `184` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary exponential mapping-gap step

Interpretation:

- the substantive gain here is repository consistency: the NRW Q-phase exponential source clause is now explicitly represented in the shared mapping layer instead of depending on already-compiled state in the canonical file
- the next NRW task should stay on the exponential corridor and decide whether the same broad source atom also justifies a narrower follow-on bridge such as `Parameter exponentieller Funktionen interpretieren`, or whether the cleaner next lane is the separate NRW parameter-from-context clause

### 2026-03-20: NRW upper-secondary splits the broad exponential source atom and closes the repository-backed parameter follow-on gap

What changed:

- the NRW upper-secondary source snapshot was widened by a small retained split inside the existing broad exponential corridor instead of forcing an unsupported one-to-many mapping
- the retained NRW source cluster:
  - `c714c662-b476-4945-9352-e62869770bed` (`Natuerliche Exponentialfunktion beschreiben und fuer Wachstum nutzen`)
  now contains three narrower source-aligned children:
  - `70705293-c65e-4a96-b771-5b9883e1d17d` (`Eigenschaften exponentieller Funktionen der Form a^x beschreiben`)
  - `aa3e0764-3046-47c1-aa9b-35a144cf02d6` (`Besonderheit der natuerlichen Exponentialfunktion erlaeutern`)
  - `1b742861-ac55-4a6d-bd84-71ed6c291eda` (`Exponentialfunktionen fuer Wachstums- und Zerfallsvorgaenge nutzen`)
- the NRW upper-secondary mapping lane now keeps the exponential-entry bridge on the narrower growth/decay child:
  - `1b742861-ac55-4a6d-bd84-71ed6c291eda` -> `781f133a-08bb-54b9-8fda-efa2f8f9b12c` (`Exponentialen Wachstum und Zerfall deuten`)
- and now also carries the reviewed `partial` follow-on bridge:
  - `70705293-c65e-4a96-b771-5b9883e1d17d` -> `346efb31-c400-5bd3-a698-dd9a7e1bc3f7` (`Parameter exponentieller Funktionen interpretieren`)
- the NRW upper-secondary mapping lane now carries `17` rows instead of `16`
- the accepted-warning registry now records the NRW-specific `APV-202` entry for `346efb31-c400-5bd3-a698-dd9a7e1bc3f7`, and the existing NRW rationale for `781f133a-08bb-54b9-8fda-efa2f8f9b12c` was narrowed to the new growth/decay child
- the shared NRW source-goal membership and closure registries were widened in place under the same retained upper-secondary `sourceLandscapeId`

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesNrwArchivedAtomicClosureFromRealRegistry'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `17` rows
- the NRW archived upper-secondary closure registry now resolves the imported analysis corridor with `21` atomic source goals instead of `19`
- `npm run apply:applicability` changed `0` goals because the canonical exponential-parameter leaf was already `DE-NW`-visible in the working tree and this step brought the repository-backed mapping and retained source split into line with that compiled state
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `185` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary exponential source-split step

Interpretation:

- NRW upper-secondary math now reaches not only the shared exponential-entry leaf, but also the next shared exponential-parameter leaf without violating the repository's one-legacy-goal/one-canonical-goal constraint
- the clean move here was a small retained source split: one child for `a^x`-properties, one child for the special role of `e^x`, and one child for growth/decay usage
- the next NRW task should decide whether the retained natural-exponential child `aa3e0764-3046-47c1-aa9b-35a144cf02d6` now defensibly carries `628928a6-4f48-54dc-952d-dec0e69dc856` (`Eigenschaften der natürlichen Exponentialfunktion nutzen`), or whether the cleaner next lane is the NRW LK clause `8ddb7c8f-b27e-4353-85b4-6801a7fdfa5b` on the shared function-family parameter corridor

### 2026-03-20: NRW upper-secondary reaches the shared natural-exponential leaf

What changed:

- the NRW upper-secondary source snapshot was not widened in this step; the next clean bridge reused the retained natural-exponential child of the new exponential split
- the existing NRW source atom:
  - `aa3e0764-3046-47c1-aa9b-35a144cf02d6` (`Besonderheit der natuerlichen Exponentialfunktion erlaeutern`)
  now maps as a reviewed `partial` bridge to:
  - `628928a6-4f48-54dc-952d-dec0e69dc856` (`Eigenschaften der natürlichen Exponentialfunktion nutzen`)
- the NRW upper-secondary mapping lane now carries `18` rows instead of `17`
- the accepted-warning registry now records the NRW-specific `APV-202` entry for `628928a6-4f48-54dc-952d-dec0e69dc856`
- no NRW source snapshots or provenance registries changed in this step

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `18` rows
- `npm run apply:applicability` changed `1` goal in the canonical math file: `628928a6-4f48-54dc-952d-dec0e69dc856` is now visible for `DE-NW`
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `186` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary natural-exponential step

Interpretation:

- NRW upper-secondary math now reaches the first three shared leaves of the canonical exponential corridor: entry, parameter interpretation, and natural exponential function
- the clean move here was to reuse the retained NRW `e^x` child directly; no further source split was needed after the previous corridor cleanup
- the next NRW task should decide whether the remaining exponential corridor should continue on the logarithmic/equation-solving side, or whether the cleaner next lane is now the imported LK clause `8ddb7c8f-b27e-4353-85b4-6801a7fdfa5b` on the shared function-family parameter corridor

### 2026-03-20: NRW upper-secondary reaches the shared natural-logarithm leaf

What changed:

- the NRW upper-secondary source snapshot was widened by one small LK source add taken directly from `2.4.2 Funktionen und Analysis` instead of forcing the existing function-family clause onto an unrelated logarithm target
- the LK corridor cluster:
  - `3c33eb29-3c7f-4980-acd7-e8e917eccc29`
  was widened from a two-atom to a three-atom retained cluster and now explicitly includes:
  - `85be691c-c569-4cdf-b332-b9d77d47666d` (`Umkehrbarkeit ausgewaehlter Funktionen untersuchen und einfache Umkehrfunktionen bestimmen`)
- the new NRW source atom now maps as a reviewed `partial` bridge to:
  - `392440db-6a43-59c0-a48d-958128fa16a8` (`Natürlichen Logarithmus als Umkehrfunktion verstehen (LK)`)
- the NRW upper-secondary mapping lane now carries `19` rows instead of `18`
- to keep the compiled NRW applicability path valid after this new logarithm leaf, the broad cluster-level `requires` were removed from:
  - `98dcf9bd-d119-5eb1-835c-7d719f67b485` (`Q2 Analytische Geometrie, Lineare Algebra und Vertiefung der Analysis`)
  - `5ebfc509-0b4c-5c60-befb-2477eb24d4b5` (`Q2.1 Vertiefung der Analysis`)
  so that both Q2 overview nodes are now child-driven instead of carrying stale cluster prerequisites that predated the NRW widening
- the accepted-warning registry now records the NRW-specific `APV-202` entry for `392440db-6a43-59c0-a48d-958128fa16a8`
- the shared NRW source-goal membership and closure registries were widened in place under the same retained upper-secondary `sourceLandscapeId`

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesNrwArchivedAtomicClosureFromRealRegistry'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `19` rows
- the NRW archived upper-secondary closure registry now resolves the imported analysis corridor with `22` atomic source goals instead of `21`
- `npm run apply:applicability` changed `3` goals in the canonical math file: `392440db-6a43-59c0-a48d-958128fa16a8` is now visible for `DE-NW`, and the Q2 overview nodes `98dcf9bd-d119-5eb1-835c-7d719f67b485` / `5ebfc509-0b4c-5c60-befb-2477eb24d4b5` now surface through child-union after the prerequisite trim
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `187` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary natural-logarithm step

Interpretation:

- NRW upper-secondary math now reaches the first shared logarithm leaf through an explicit source-backed LK clause instead of through the still-too-broad function-family corridor
- the clean move here was a small source add from the NRW KLP itself plus a small canonical cleanup: the inverse-function / logarithm clause has matching prerequisite support in the already active NRW derivative and Hauptsatz corridor, but the old broad Q2 cluster prerequisites needed to be retired so the overview nodes could stay child-driven
- the next NRW task should decide whether the same inverse-function lane justifies a further step on the graph-of-inverse-function relation, or whether the cleaner next move is now the retained LK function-family parameter clause `8ddb7c8f-b27e-4353-85b4-6801a7fdfa5b`

### 2026-03-20: NRW upper-secondary reaches the shared inverse-graph leaf

What changed:

- the NRW upper-secondary source snapshot was widened by one more small LK source add from `2.4.2 Funktionen und Analysis`, this time for the explicit graph-of-inverse-function clause
- the retained LK corridor cluster:
  - `3c33eb29-3c7f-4980-acd7-e8e917eccc29`
  now carries a fourth source atom:
  - `e0c4432f-fc34-48c2-84d8-0e998b978500` (`Zusammenhang von Funktionsgraph und Umkehrgraph erlaeutern`)
- instead of forcing that source atom onto the existing broad reflection leaf, the canonical Q2.1 corridor now also carries the new leaf:
  - `dbc13bb0-963b-49a8-a441-2183f4b64c8e` (`Zusammenhang von Funktionsgraph und Umkehrgraph erläutern (LK)`)
- the new NRW source atom maps as a reviewed `partial` bridge to that new canonical leaf
- the NRW upper-secondary mapping lane now carries `20` rows instead of `19`
- the accepted-warning registry now records the NRW-specific `APV-202` entry for `dbc13bb0-963b-49a8-a441-2183f4b64c8e`
- the shared NRW source-goal membership and closure registries were widened in place under the same retained upper-secondary `sourceLandscapeId`

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesNrwArchivedAtomicClosureFromRealRegistry'`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `20` rows
- the NRW archived upper-secondary closure registry now resolves the imported analysis corridor with `23` atomic source goals instead of `22`
- `npm run apply:applicability` changed `0` goals across `0` files because the new NRW inverse-graph leaf was already modeled directly in the canonical file before the compiler pass
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `187` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary inverse-graph step

Interpretation:

- NRW upper-secondary math now reaches not only the shared natural-logarithm leaf but also the next explicit inverse-function follow-on leaf on the canonical Q2.1 corridor
- the clean move here was not another weak partial onto `Spiegelungen von Funktionsgraphen beschreiben`, but a small new canonical leaf that isolates the inverse-graph relation instead of conflating it with x-/y-axis or origin reflections
- the cleaner next NRW move is now the already imported LK function-family parameter clause `8ddb7c8f-b27e-4353-85b4-6801a7fdfa5b`; only a deliberate return to the integral side would justify reopening the separate `ln(x)`-as-antiderivative clause

### 2026-03-20: NRW upper-secondary reaches the shared Q2.1 parameter corridor

What changed:

- the retained canonical Q2.1 parameter node:
  - `e7c9a459-52d1-5e29-8714-2b038c4d3a7f`
  is no longer a single broad atom; it now acts as a small mixed-state cluster with three child leaves:
  - `972cc7e8-be9c-444c-ba45-98e817b3cf14` (`Parameter in Analysisaufgaben nutzen, bestimmen und begründen`) as the retained Hessen-exact leaf
  - `71683f37-24de-4e0f-badd-858b56fa4d64` (`Parameter einer Funktion aus Kontextbedingungen bestimmen`) as the NRW-exact shared entry leaf
  - `91e2f564-3bc8-4924-af85-2a3fa84c1471` (`Parameter von Funktionen und Funktionsscharen im Kontext untersuchen`) as the NRW-exact LK follow-on leaf
- the Hessen exact mapping for:
  - `ed7e8906-d5a5-4ca7-8566-89b5b3034414`
  was repointed from the old broad node to the new retained Hessen leaf `972cc7e8-be9c-444c-ba45-98e817b3cf14`
- the NRW upper-secondary mapping lane now carries `22` rows instead of `20`
- the NRW source atoms:
  - `99e37d46-3b0c-4989-b8a8-c8a72501fc15`
  - `8ddb7c8f-b27e-4353-85b4-6801a7fdfa5b`
  now map `exact` to the two new NRW parameter leaves
- no new accepted-warning entries were needed for this slice; the corridor closes through exact mappings instead of another reviewed `partial`

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

### 2026-04-11: BW upper-secondary Physics opens the first Leistungsfach Schwingungen follow-on

What changed:

- the active BW upper-secondary Physics source snapshot:
  - `curricula/DE/Gymnasium/input/BW/upper-secondary/source-json/DE_BAW_S_GYM_2_PHYSIK.de.json.snapshot`
  now also carries one selected LF `3.6.3 Schwingungen` cluster:
  - `6850b598-26a2-4960-9544-52e5fc31f750`
  with the three retained LF leaves:
  - `e6e0636f-ff78-4e42-99f7-0be0fcd1e151` (`Ungedaempfte mechanische Schwingungsdifferentialgleichungen mit Ansatz loesen`)
  - `4cbe6dac-2bcb-44cb-83d4-6a8b7719411a` (`Differentialgleichung eines elektromagnetischen Schwingkreises mit Ansatz loesen`)
  - `47770f3f-cc2f-4a65-ada9-f3cceb9e9908` (`Ueberlagerungen unabhaengiger Schwingungen und Schwebungen qualitativ beschreiben`)
- the same BW source snapshot now reaches `35` retained source goals and `27` atomic descendants
- the BW upper-secondary Physics mapping lane:
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_physics_upper_secondary_to_canonical_physics.json`
  now carries `32` reviewed rows instead of `28`
- the new BW LF parent maps `partial` onto the shared canonical Q2 surface:
  - `fcefb129-ad4c-50a2-9762-a910caa1af16` (`Q2 Schwingungen, Induktion und mechanische Wellen`)
- the retained BW LF mechanical DGL leaf now maps `exact` onto the existing canonical LK atom:
  - `b2fb9a25-4d26-5cf2-a917-823909dcb6bd` (`Schwingungsgleichung loesen`)
- two new narrow canonical Q2 atoms were added directly in the shared Physics graph:
  - `a7255b83-336c-4d42-ba5c-bc2f6248ea36` (`Differentialgleichung des elektromagnetischen Schwingkreises mit Ansatz loesen`)
  - `4888444f-4520-437a-9ba7-e74e8f8ed129` (`Ueberlagerungen unabhaengiger Schwingungen qualitativ beschreiben`)
- the two new canonical atoms now contribute source-backed provenance in:
  - `curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json`
- the shared source registries:
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
  now also carry the new BW LF `Schwingungen` cluster and its three retained leaves

Why this cut:

- the clean LF value-add in BW `3.6.3 Schwingungen` is not another broad BF recap, but the narrow advanced strip on solving oscillation differential equations and on independent superposition / beats
- the existing canonical LK atom `Schwingungsgleichung loesen` was already the right shared target for the mechanical DGL clause
- the electromagnetic DGL clause and the qualitative superposition / beat clause had no clean one-to-one canonical leaves yet, so two new narrow Q2 atoms were added instead of forcing those BW leaves onto overly broad Thomson/resonance surfaces
- this keeps the BW LF move narrow, source-led, and debt-neutral while still widening learner-visible canonical coverage

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Validation result:

- backend tests passed with `BUILD SUCCESSFUL`
- `apply:applicability` changed `3` goals across `1` file
- `validate:view-filters` stayed at `0 error(s), 1382 warning(s), 354 accepted warning(s)`
- no new BW Physics accepted-warning entries were needed for this LF `Schwingungen` slice

Interpretation:

- BW upper-secondary Physics now reaches one first LF `Schwingungen` strip without reopening the earlier BF debt model
- the clean move here was one selected LF follow-on with three exact leaves and one already-shared partial parent, not a broad claim on the full BW `3.6.3` surface
- the next clean BW move is now the still-unopened Leistungsfach `Wellen` surface

### 2026-04-11: BW upper-secondary Physics opens the first Leistungsfach Wellen follow-on

What changed:

- the BW upper-secondary source snapshot:
  - `curricula/DE/Gymnasium/input/BW/upper-secondary/source-json/DE_BAW_S_GYM_2_PHYSIK.de.json.snapshot`
  now also carries the retained cluster:
  - `0be98247-e7db-4d44-9188-5c2d70a922aa` (`Leistungsfach: Wellen`)
  with the two selected LF leaves:
  - `f51888a6-7a59-4b66-a0a1-dd0adfbd0a47` (`Fortschreitende ebene Transversalwellen und Momentanbilder beschreiben`)
  - `bf252790-f980-4ac4-86ae-bc8b543b7d74` (`Hertz'schen Dipol und die Abstrahlung elektromagnetischer Wellen in Grundzuegen beschreiben`)
- the BW upper-secondary Physics mapping lane:
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_physics_upper_secondary_to_canonical_physics.json`
  now carries `34` rows instead of `32`
- the two new BW LF leaves exact-resolve onto two new narrow canonical Physics atoms:
  - `158e1c19-7ccb-4c8c-931c-b685951ab161` (`Fortschreitende ebene Transversalwellen und Momentanbilder beschreiben`)
  - `5da7d4d0-878e-44fd-b398-1b1de8b636a4` (`Hertz'schen Dipol als Grenzfall des Schwingkreises deuten`)
- those new canonical atoms were added under:
  - `dc38c943-11f6-5f4f-945b-67e330814727` (`Mechanische Wellen`)
  - `c1563745-2722-503d-819f-95d336937e2b` (`Elektromagnetische Wellen`)
- the canonical provenance registry:
  - `curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json`
  now also records both new atoms as source-backed BW leaves
- the shared source registries:
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
  now also carry the new BW LF `Wellen` cluster and its two retained leaves

Why this cut:

- the clean LF value-add in BW `3.6.4 Wellen` is not another broad replay of the already imported BF wave strip
- the first selected LF delta sits instead on:
  - explicit modeling of the progressing plane transverse wave via `s(x,t)` and the momentary snapshot
  - the transfer from electromagnetic oscillating circuit to radiating Hertz dipole
- a broad parent bridge for the retained LF `Wellen` cluster would overclaim the canonical DE graph, because the selected BW slice spans one Q2 wave-modeling surface and one Q3 electromagnetic-wave surface
- two new narrow canonical atoms therefore keep the move exact, source-led, and debt-neutral without widening a new partial-only BW applicability residue

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Validation result:

- backend tests passed with `BUILD SUCCESSFUL`
- `apply:applicability` changed `0` goals across `0` files
- `validate:view-filters` stayed at `0 error(s), 1382 warning(s), 354 accepted warning(s)`
- no new BW Physics accepted-warning entries were needed for this LF `Wellen` slice

Interpretation:

- BW upper-secondary Physics now reaches not only the BF `Wellen` strip and the first LF `Schwingungen` strip, but also one first exact LF `Wellen` strip across two new canonical micro-surfaces
- the clean move here was not a broad claim on full BW `3.6.4 Wellen`, but one narrow selected LF follow-on that keeps the shared canonical tree didactically sharper
- the next clean BW move is now the adjacent Leistungsfach `Wellenoptik` surface

### 2026-04-11: BW upper-secondary Physics opens the first Leistungsfach Wellenoptik entry

What changed:

- the BW upper-secondary source snapshot:
  - `curricula/DE/Gymnasium/input/BW/upper-secondary/source-json/DE_BAW_S_GYM_2_PHYSIK.de.json.snapshot`
  now also carries the retained cluster:
  - `3844f4b6-67a8-4fe7-842b-40b64f7b3054` (`Leistungsfach: Wellenoptik`)
  with the two selected LF leaves:
  - `d78b903d-5e2b-4fe3-99b8-52a4ce593533` (`Kohaerentes Licht als elektromagnetische Welle beschreiben`)
  - `d2443d8c-a324-4f3c-a83b-914c70ea1e50` (`Strahlenmodell und Wellenmodell des Lichts vergleichen`)
- the BW upper-secondary Physics mapping lane:
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_physics_upper_secondary_to_canonical_physics.json`
  now carries `36` rows instead of `34`
- the two new BW LF leaves exact-resolve onto two new narrow canonical Physics atoms:
  - `5b90066f-b5b3-4e82-8d31-7b95ff0a0451` (`Kohaerentes Licht als elektromagnetische Welle beschreiben`)
  - `8ad305d2-bde0-4223-9477-517b2943148b` (`Strahlenmodell und Wellenmodell des Lichts vergleichen`)
- both new canonical atoms were added under:
  - `c1563745-2722-503d-819f-95d336937e2b` (`Elektromagnetische Wellen`)
- the canonical provenance registry:
  - `curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json`
  now also records both new atoms as source-backed BW leaves
- the shared source registries:
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
  now also carry the new BW LF `Wellenoptik` cluster and its two retained leaves

Why this cut:

- the clean first BW move on `3.6.5 Wellenoptik` is not yet the full interference and far-field calculation strip
- the didactically smallest reviewed entry sits first on:
  - coherent light as electromagnetic wave
  - the explicit comparison of ray and wave model of light
- these two concepts were genuinely missing as narrow canonical Physics surfaces, so two new atoms improve the shared DE graph instead of just mirroring one state package label
- the move therefore opens LF `Wellenoptik` debt-neutral and without prematurely forcing the broader interference clauses onto existing single-slit, double-slit, or grating atoms

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Validation result:

- backend tests passed with `BUILD SUCCESSFUL`
- `apply:applicability` changed `0` goals across `0` files
- `validate:view-filters` stayed at `0 error(s), 1382 warning(s), 354 accepted warning(s)`
- no new BW Physics accepted-warning entries were needed for this LF `Wellenoptik` entry slice

Interpretation:

- BW upper-secondary Physics now reaches a first exact LF `Wellenoptik` entry in addition to the earlier LF `Schwingungen` and LF `Wellen` strips
- the clean move here was one conceptual entry corridor, not yet the broader quantitative interference strip of `3.6.5`
- the next clean BW move is now the adjacent Interferenz-/Fernfeld-follow-on inside Leistungsfach `Wellenoptik`

### 2026-03-21: Baden-Wuerttemberg lower-secondary starts the first reviewed function-corridor mapping cut

What changed:

- `DE-BW` is now active in the canonical Gymnasium jurisdiction stack:
  - applicability compiler
  - learner-service state filters and jurisdiction normalization
  - root filter UI and goal-card labels
  - canonical Gymnasium overview root filter list and root applicability
- the repository-backed Baden-Wuerttemberg Sek-I mapping lane now carries its first `4` reviewed rows:
  - `572f46ab-e5a7-471d-955e-a07aa7ae6a72`
    -> `71cec9fb-3751-4d61-8b34-c5adbbf6e5f2`
    as `exact`
  - `332b3bd1-afc0-4266-a977-49ef0843e5b1`
    -> `2bb4bb91-7929-483a-b735-44275f6b5cdc`
    as `partial`
  - `a7840b04-88b2-4f2a-8f94-8a75e0a27200`
    -> `c1f50bcc-7848-4e49-b9de-0ec030cc6bca`
    as `partial`
  - `52b15961-33be-4ee9-97ec-1911dc982910`
    -> `09f47964-2cd0-410e-93ee-9632b582fc91`
    as `partial`
- the first BW cut also needed one explicit retained prerequisite bridge:
  - the canonical J6 rational-number cluster stays child-driven
  - the BW prerequisite closure is therefore carried through the no-requires child `f6a54a49-b6cf-4ab7-a185-aa08bfcb6c97`
    via `extendedData.applicabilityOverrides`
- the accepted-warning registry now records:
  - three new BW `APV-202` findings for the first partial function bridges
  - one BW `APV-201` for the retained J6 prerequisite leaf
- the Baden-Wuerttemberg lower-secondary mapping README and the repository-backed mapping fixture were aligned to the four-row state

Why this cut:

- the archived BW Sek-I pilot snapshot already exposes a clean first function corridor, but not yet a source-aligned arithmetic prerequisite strip
- forcing a wider BW source import just to close the first entry visibility would have slowed the bundeslandweise rollout without teaching us a new pattern
- the clean compromise is therefore:
  - start the first BW mappings on the same shared anchors already used by NRW and Niedersachsen
  - keep the missing arithmetic base explicit as one reviewed retained prerequisite bridge

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed Baden-Wuerttemberg Sek-I mapping fixture now parses cleanly with `4` rows
- `npm run apply:applicability` changed `15` goals across `2` files
- `npm run validate:view-filters` reports `0` errors, `3` warnings, and `202` accepted warnings
- full `./run_ci.sh` passed after the first Baden-Wuerttemberg lower-secondary mapping cut

Interpretation:

- Baden-Wuerttemberg is no longer only source-archived; it now has the first real reviewed Sek-I bridges on the shared canonical math spine
- the remaining BW lower-secondary debt is now concentrated in the adjacent `JG7/8` linear-functions corridor, not in generic onboarding or runtime plumbing
- the next clean BW step is therefore:
  - stay in Baden-Wuerttemberg Sek I
  - review the lineare-Funktionen follow-on around representation reading, line equations, and rate-of-change instead of switching to BW Sek II immediately

### 2026-03-21: Baden-Wuerttemberg lower-secondary opens the adjacent JG7/8 linear-functions corridor

What changed:

- the repository-backed Baden-Wuerttemberg Sek-I mapping lane now carries `8` reviewed rows instead of `4`
- four new BW lower-secondary mappings are active:
  - `95bee2cc-cdb0-4611-8bc9-36f6263ea417`
    -> `a8c42ee9-2898-4247-819f-c235032ac78a`
    as `partial`
  - `eca22013-61e3-4fad-a771-fa4e224fe1d5`
    -> `af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186`
    as `partial`
  - `72041e85-2d03-4a3c-862c-57ebc79e9dbb`
    -> `ae772695-d55e-4cc5-81bc-6605272759b4`
    as `partial`
  - `9cb473f6-06f0-4fa3-9bf1-34445aa58551`
    -> `2d75fd3f-c68b-4a11-89ae-19a30fefc47a`
    as `partial`
- the BW linear follow-on route also needed two explicit retained prerequisite bridges:
  - the canonical leaf `c65ecabf-d00b-4e2d-99ae-b64692325ffb` now carries `DE-BW`
    through `extendedData.applicabilityOverrides`
  - because the archived BW pilot source still does not isolate a one-to-one function-value-calculation atom
  - the canonical leaf `fd860da9-73ba-47cd-a1a8-452424915a80` also now carries `DE-BW`
    through `extendedData.applicabilityOverrides`
  - because the archived BW pilot source still does not isolate a one-to-one J7 variable-term atom for the linear-equation route
- the accepted-warning registry now records:
  - four new BW `APV-202` findings for graph reading, linear description, line equations, and linear rate-of-change interpretation
  - two BW `APV-201` findings for the retained direct-function-value and variable-term prerequisite bridges
- the Baden-Wuerttemberg lower-secondary mapping README and repository-backed mapping fixture were aligned to the new eight-row state

Why this cut:

- the archived BW `JG7/8` source corridor already exposes three clean linear follow-on atoms and one narrow graph-reading atom
- those four atoms fit the shared canonical spine without another source split:
  - graph reading -> shared graph-reading leaf
  - `y = mx + c` / two-point line work -> shared linear-description and line-equation leaves
  - rate-of-change in context -> shared linear-parameter leaf
- the only remaining gaps were direct function-value calculation and variable-term work:
  - instead of forcing a broader source import, the cut keeps both dependencies explicit as two reviewed retained prerequisite bridges

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed Baden-Wuerttemberg Sek-I mapping fixture now parses cleanly with `8` rows
- `npm run apply:applicability` changed `8` goals across `1` file
- `npm run validate:view-filters` remains at `0` errors and `3` warnings; accepted warnings now stand at `207`
- full `./run_ci.sh` passed after the Baden-Wuerttemberg `JG7/8` linear follow-on cut

Interpretation:

- Baden-Wuerttemberg lower-secondary now reaches the shared canonical line-reading and line-equation corridor, not just the first entry anchors
- the remaining BW lower-secondary debt is no longer the first linear follow-on itself, but the still broad representation atom `d45b4ec2-8604-490e-9c11-d3b8fc54251b`
- the next clean BW step is therefore:
  - stay in Baden-Wuerttemberg Sek I
  - decide whether that broad representation atom deserves a small retained split before any further BW Sek-II expansion

### 2026-03-21: Baden-Wuerttemberg lower-secondary broad representation atom becomes a retained split

What changed:

- the archived BW Sek-I source atom:
  - `d45b4ec2-8604-490e-9c11-d3b8fc54251b`
  is no longer treated as one broad atomic bundle
- instead, the archived BW source snapshot now carries a small retained split:
  - `5e889254-5088-4c9f-ac62-e94d95113644` (`Zusammenhaenge durch Tabellen, Gleichungen, Graphen oder Text darstellen`)
  - `56842db6-253b-4fea-b50c-2940db2fd174` (`Zwischen Darstellungen situationsgerecht wechseln`)
- the downstream BW source prerequisites now point to those narrower children instead of the old broad atom:
  - `95bee2cc-cdb0-4611-8bc9-36f6263ea417` now depends on the representation-building child
  - `a7840b04-88b2-4f2a-8f94-8a75e0a27200` now depends on the representation-switching child
  - `52b15961-33be-4ee9-97ec-1911dc982910` now depends on the representation-building child
  - `eca22013-61e3-4fad-a771-fa4e224fe1d5` now depends on the representation-switching child plus the existing linear-dependency child
- the shared source registries were refreshed accordingly:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- the real-registry runtime assertion in `LandscapeServiceTest` now expects the two new BW source leaves instead of the old broad atom

Why this cut:

- the remaining BW Sek-I blocker was no longer a canonical mapping question but a source-shape problem
- the broad archived representation atom mixed two didactically different operations:
  - building representations from context
  - switching between existing representations
- keeping it broad would have pushed the next BW mapping step into avoidable retained prerequisite debt
- the retained split keeps the source lane honest without forcing another canonical split too early

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest'`
- `./run_ci.sh`

Validation result:

- the archived BW Sek-I source closure now resolves through the two new retained children
- `npm run validate:view-filters` remains at `0` errors and `3` warnings; accepted warnings remain at `207`
- full `./run_ci.sh` passed after the BW retained source split

Interpretation:

- Baden-Wuerttemberg lower-secondary no longer carries the broad representation-atom blocker inside the archived pilot lane
- this was a source-precision cut, not a new canonical visibility cut
- the next clean BW step is now no longer another Sek-I source cleanup
- the next executable work item is the first reviewed Baden-Wuerttemberg upper-secondary analysis mapping pass against the already archived Kursstufe source IDs

### 2026-03-21: Baden-Wuerttemberg upper-secondary upgrades the first analysis cut via a retained split

What changed:

- the repository-backed Baden-Wuerttemberg Sek-II mapping lane now carries `3` reviewed rows:
  - `f84004f9-0987-40f4-88dd-830c039b7bf6` maps `exact` to the shared canonical motivation anchor `71cec9fb-3751-4d61-8b34-c5adbbf6e5f2` (`Warum Mathematik? – Denken, Muster & Zukunft`)
  - `97ab0ab9-9444-410d-b2d9-1ac9fa935ad8` maps `exact` to `2afba4a2-287d-5e8f-aeee-a3bcf8652236` (`Integral als Bestand und Flächeninhalt verstehen`)
  - `e0c333ea-9873-4718-819c-d39b22ccee30` maps `partial` to `b9bbd2a8-1379-5ffb-817f-41467d48abef` (`Hauptsatz der Differential- und Integralrechnung nutzen`)
- the former broad Basisfach integral source atom `8f8c4bc8-5b0c-4a62-b6d7-f7fb263c7f1d` remains a retained split cluster with two archived child atoms:
  - `97ab0ab9-9444-410d-b2d9-1ac9fa935ad8` (`Integrale als Flaecheninhalt und Bestandsaenderung deuten sowie Bestaende aus Aenderungsraten rekonstruieren`)
  - `e0c333ea-9873-4718-819c-d39b22ccee30` (`Mit Hauptsatz arbeiten und Stammfunktionsgraphen deuten`)
- retained BW applicability now runs through the smallest derivative-and-integral prerequisite closure that keeps both active BW Kursstufe bridges didactically closed:
  - `ae20183e-92b5-5521-b8e0-9a8662cf51f5` (`Mittlere Änderungsrate berechnen und deuten`)
  - `b42bdfcc-3db7-5697-8b3e-69e50962ca86` (`Differenzenquotient als Grenzwert verstehen`)
  - `858113c5-e53b-57bb-b01f-ba95c3ddcb6f` (`Mit Ableitungsregeln differenzieren`)
  - `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6` (`Flächen unter Graphen näherungsweise bestimmen`)
- the canonical math landscape now carries the BW applicability closure for `94d63ad9...`, so the new Hauptsatz bridge no longer fails `APV-102` on an invisible prerequisite
- the accepted-warning registry now records the reviewed BW end state of this cut explicitly:
  - one retained-prerequisite `APV-201` for `94d63ad9-ae1c-5ff2-b05e-188a0f5ebec6`
  - one partial-bridge `APV-202` for `b9bbd2a8-1379-5ffb-817f-41467d48abef`
- the BW upper-secondary mapping README, the repository-backed mapping fixture, and the real-registry landscape service test were aligned to the new third reviewed row

Why this cut:

- the retained split had already isolated the smallest remaining BW Hauptsatz / Stammfunktionsgraph clause
- that child is strong enough to open the shared Hauptsatz leaf as a reviewed `partial` bridge, but still too narrow to justify a false `exact` fit because it does not isolate the full canonical `F(b)-F(a)` routine
- widening the route required one explicit retained prerequisite closure on the approximate-area atom, which is smaller and more honest than inventing another source split or forcing a broader canonical match

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed Baden-Wuerttemberg Sek-II mapping fixture now parses cleanly with `3` rows
- the archived source closure coverage stays green after the retained split follow-on
- `npm run apply:applicability` changed `2` goals across `1` file
- `npm run validate:view-filters` remains at `0` errors and `3` warnings; accepted warnings now stand at `211`
- full `./run_ci.sh` passed after the BW Hauptsatz follow-on

Interpretation:

- Baden-Wuerttemberg upper-secondary now has two exact reviewed analysis bridges and one narrower reviewed Hauptsatz bridge on the shared derivative / integral spine
- the remaining BW debt on this opened corridor is no longer source invisibility; it is the explicit retained approximation prerequisite and the still narrower-than-canonical Hauptsatz source wording
- the next clean BW step should therefore stay on this same analysis surface:
  - the retained source-precision split on the broad Leistungsfach integral atom is now complete
  - the clearer follow-on is the next adjacent reviewed integral-analysis slice unless we explicitly decide to attack the remaining `APV-201` / `APV-202` pair first

### 2026-03-21: Baden-Wuerttemberg upper-secondary retained-splits the broad Leistungsfach integral atom

What changed:

- the repository-backed Baden-Wuerttemberg Sek-II mapping lane now carries `5` reviewed rows
- the broad Leistungsfach integral source atom:
  - `37d1e9d7-6909-4421-a9f1-11f7b41061ff` (`Integrale als Bestand und Flaecheninhalt deuten, Hauptsatz nutzen und Linearitaet begruenden`)
  now survives only as a retained split parent over:
  - `72d7ad67-e2ef-41a0-bb52-b62eb5d071e0` (`Integrale als Bestand und Flaecheninhalt deuten sowie Funktionen aus Aenderungsraten rekonstruieren`)
  - `fb742d93-6c9b-487a-bc7c-f54b363c0c01` (`Integralfunktion und Stammfunktion unterscheiden, Stammfunktionsgraphen deuten und den Hauptsatz bis zur Linearitaet nutzen`)
- the first new Leistungsfach child now maps `partial` to:
  - `2afba4a2-287d-5e8f-aeee-a3bcf8652236` (`Integral als Bestand und Flächeninhalt verstehen`)
- the second new Leistungsfach child now maps `partial` to:
  - `b9bbd2a8-1379-5ffb-817f-41467d48abef` (`Hauptsatz der Differential- und Integralrechnung nutzen`)
- the BW upper-secondary source snapshot, provenance registries, mapping README, structure note, and repository fixture were aligned to the retained split

Why this cut:

- one legacy source goal can currently resolve to only one canonical goal in the backend mapping service, so the broad Leistungsfach atom had to be split before it could land on two different shared leaves honestly
- the BW source wording already separates an introductory integral / reconstruction clause from a narrower Hauptsatz / Integralfunktion / Linearitaet clause well enough for a retained source split
- both resulting bridges remain `partial`, because neither child isolates the full canonical wording exactly:
  - the introductory child keeps the broader Leistungsfach phrasing around reconstructing functions from rates of change
  - the Hauptsatz child still bundles Integralfunktion / Linearitaet breadth without isolating the full canonical `F(b) - F(a)` routine

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`

Validation result:

- the repository-backed Baden-Wuerttemberg Sek-II mapping fixture now parses cleanly with `5` rows
- the archived BW source snapshot and provenance registries remain graph-valid after the retained split

Interpretation:

- the shared BW introductory-integral and Hauptsatz leaves are now both backed by retained Basisfach and Leistungsfach source children instead of one broad LF approximation
- BW applicability and the reviewed `APV-201` / `APV-202` pair remain unchanged after this cut
- the next clean BW step is now the next adjacent reviewed integral-analysis slice, unless we want to explicitly tighten the remaining applicability debt first

### 2026-03-21: Baden-Wuerttemberg upper-secondary retained-splits the broad Basisfach e-function atom

What changed:

- the repository-backed Baden-Wuerttemberg Sek-II mapping lane now carries `7` reviewed rows
- the broad Basisfach e-function source atom:
  - `d061f00d-6118-46de-a476-ec4c9112e222` (`Die natuerliche Exponentialfunktion beschreiben sowie ihre Ableitung und Stammfunktion angeben`)
  now survives only as a retained split parent over:
  - `e0769810-ba73-4a52-8e9c-660d1fb9d6e6` (`Die natuerliche Exponentialfunktion mit Basis e beschreiben und ihre Ableitung angeben`)
  - `7bf62048-84ba-467f-ba23-f053c4e2989f` (`Die Stammfunktion der natuerlichen Exponentialfunktion angeben`)
- the first new Basisfach child now maps `partial` to:
  - `4047af71-de53-5dc3-80c6-a7c78fb4bfe4` (`Exponentialfunktionen`)
- the second new Basisfach child now maps `partial` to:
  - `a9ed219d-d497-55e5-a4e0-4d45d2554f6b` (`Einfache Integrale berechnen`)
- the BW upper-secondary source snapshot, provenance registries, mapping README, structure note, repository fixture, and real-registry BW closure regression were aligned to the retained split
- the accepted-warning registry now records the reviewed BW simple-integral follow-on explicitly:
  - one partial-bridge `APV-202` for `a9ed219d-d497-55e5-a4e0-4d45d2554f6b`

Why this cut:

- one legacy source goal can currently resolve to only one canonical goal in the backend mapping service, so the broad Basisfach atom had to be split before it could land on the shared exponential-functions cluster and the shared simple-integral leaf honestly
- the BW source wording already separates an e-function / Ableitungs clause from the narrower Stammfunktionsaussage well enough for a small retained source split
- both resulting bridges remain `partial`, because neither child isolates the full canonical wording exactly:
  - the e-function child does not carry the canonical continuous-process modelling surface
  - the Stammfunktions child is much narrower than the shared simple-integral routine

Validation used:

- `npm run validate:graph`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest.resolvesBadenWuerttembergArchivedAtomicClosureFromRealRegistry'`

Validation result:

- the repository-backed Baden-Wuerttemberg Sek-II mapping fixture now parses cleanly with `7` rows
- the archived BW source snapshot and provenance registries remain graph-valid after the retained split
- the shared canonical applicability layer can now surface the newly backed BW E.4 cluster and the new simple-integral leaf directly
- `npm run validate:view-filters` returns `0` errors, `3` warnings, `212` accepted warnings after recording the new BW simple-integral partial bridge

Interpretation:

- the first BW upper-secondary analysis cut now spans four shared leaves plus the shared E.4 cluster instead of only the integral pair plus the orientation anchor
- the retained source-precision work is now done not only for the broad BW integral atoms but also for the first broad Basisfach e-function entry atom
- the next clean BW step is the adjacent composition / optimization follow-on on the same analysis corridor

### 2026-03-21: Baden-Wuerttemberg upper-secondary opens the adjacent Basisfach composition / application slice

What changed:

- the repository-backed Baden-Wuerttemberg Sek-II mapping lane now carries `9` reviewed rows instead of `7`
- two new BW Basisfach mappings are active:
  - `46690ab9-0b1f-4bd9-9409-4976a40c6ec2`
    -> `e9ad45b9-c0d2-5804-b6bf-79e5ce041d2c`
    as `partial`
  - `c5739dd3-a261-4229-aff6-678d8ee618b3`
    -> `1511b39a-4094-5450-a755-4a3ad3339733`
    as `partial`
- the BW composition / application follow-on also needed five explicit retained prerequisite bridges in the canonical math graph:
  - `b1dcc191-d046-50de-984a-ee5c17157628`
  - `845440ce-f63f-5835-903f-739145ca27bd`
  - `6596405a-9728-41df-9163-53670ec2a937`
  - `42e19186-6769-41ac-a7bf-ab39bdb50661`
  - `2713980f-75d2-5455-a8cb-bcd3888c49a0`
- these retained bridges keep the new BW upper-secondary route didactically closed without widening the archived BW pilot source lanes or forcing another source split
- the accepted-warning registry now records the reviewed BW debt for this cut explicitly:
  - five new `APV-201` entries for the retained prerequisite bridges above
  - one BW `APV-202` for `e9ad45b9-c0d2-5804-b6bf-79e5ce041d2c`
  - one BW `APV-202` for `1511b39a-4094-5450-a755-4a3ad3339733`
- the BW upper-secondary mapping README, structure note, expansion plan note, and repository fixture were aligned to the new nine-row state

Why this cut:

- the archived BW Basisfach corridor already exposed a clean next pair immediately after the retained e-function split:
  - one composition atom with linear inner function
  - one application atom for extremal work and function-term recovery
- both source atoms fit existing canonical leaves closely enough for reviewed `partial` bridges, but neither source clause is narrow enough for an `exact` match:
  - the composition source stays on graphical sum/product/composition work with linear inner functions
  - the application source bundles contextual extremal work together with graph-property based function reconstruction
- the only real blocker was applicability closure:
  - the optimization leaf still depends on derivative-graph interpretation atoms not isolated in the BW source snapshot
  - the composition leaf still depends on a shared Q1 recap route that in turn reaches back into the late Sek-I exponential bridge
- explicit retained prerequisite overrides were therefore the smaller and more honest move than opening new BW source corridors just to satisfy those dependencies mechanically

Validation used:

- `npm run apply:applicability`
- `npm run validate:graph`
- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest.parsesRepositoryBackedCanonicalMathBadenWuerttembergUpperSecondaryMappingFixture'`
- `./run_ci.sh`

Validation result:

- the repository-backed Baden-Wuerttemberg Sek-II mapping fixture now parses cleanly with `9` rows
- `npm run apply:applicability` changed `13` goals across `1` file
- `npm run validate:graph` still reports `593` landscapes passed
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `219` accepted warnings
- full `./run_ci.sh` passed after the BW Basisfach composition / application step

Interpretation:

- Baden-Wuerttemberg upper-secondary now reaches the first shared composition and simple-extremal leaves on the opened analysis spine, not only the earlier e-function and integral route
- the remaining BW debt on this corridor is no longer the Basisfach follow-on itself, but the still-unmapped aligned Leistungsfach composition / application pair
- the next clean BW step is therefore the adjacent Leistungsfach follow-on around:
  - `13e285f3-522c-4eae-9fed-8b13b2af7b7d`
  - `8ab263f6-a460-4ca2-bbe9-b7e9a22bbaa2`

### 2026-03-21: Baden-Wuerttemberg upper-secondary opens the aligned Leistungsfach composition / application follow-on

What changed:

- the repository-backed Baden-Wuerttemberg Sek-II mapping lane now carries `11` reviewed rows instead of `9`
- two new BW Leistungsfach mappings are active:
  - `13e285f3-522c-4eae-9fed-8b13b2af7b7d`
    -> `e9ad45b9-c0d2-5804-b6bf-79e5ce041d2c`
    as `partial`
  - `8ab263f6-a460-4ca2-bbe9-b7e9a22bbaa2`
    -> `1511b39a-4094-5450-a755-4a3ad3339733`
    as `partial`
- no new retained applicability bridges were needed in the canonical math graph for this follow-on
- no new accepted-warning entries were needed either:
  - the two target leaves were already active for `DE-BW`
  - the existing reviewed BW `APV-202` entries on those shared leaves remain sufficient
- the BW upper-secondary mapping README, structure note, expansion-plan note, and repository fixture were aligned to the new eleven-row state

Why this cut:

- this is the smallest honest next step on the already opened BW upper-secondary analysis corridor:
  - the new Leistungsfach composition source stays closest to the shared exponential/polynomial-combination leaf even though it also carries a quotient/asymptote side clause
  - the new Leistungsfach application source stays closest to the shared simple-extremal-problem leaf even though it also bundles function-term recovery and first function-family work
- both bridges remain `partial`, because neither BW Leistungsfach clause isolates the full canonical wording exactly:
  - the composition source is broader on asymptotes and zeros, but narrower on the shared contextual investigation surface
  - the application source combines extremal work with graph-property and Schar questions instead of isolating only the simple contextual extremal leaf
- unlike the preceding Basisfach step, this follow-on does not open any new canonical prerequisite chain:
  - both shared targets were already visible for `DE-BW`
  - the earlier retained BW prerequisite overrides therefore already closed the relevant applicability surface

Validation used:

- `npm run apply:applicability`
- `npm run validate:graph`
- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest.parsesRepositoryBackedCanonicalMathBadenWuerttembergUpperSecondaryMappingFixture'`
- `./run_ci.sh`

Validation result:

- the repository-backed Baden-Wuerttemberg Sek-II mapping fixture now parses cleanly with `11` rows
- `npm run apply:applicability` changed `0` goals across `0` files
- `npm run validate:graph` still reports `593` landscapes passed
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `219` accepted warnings
- full `./run_ci.sh` passed after the BW aligned Leistungsfach composition / application step

Interpretation:

- Baden-Wuerttemberg upper-secondary now reaches the shared composition and simple-extremal leaves through both Basisfach and Leistungsfach follow-on children, not only through the earlier Basisfach slice
- the remaining open BW debt on this corridor is now narrower and clearer:
  - the still-broad Leistungsfach e/logarithm front atom `fa4597c7-fabd-4a55-8be3-d06f7c432738`
- the next clean BW step should therefore decide whether that broad Leistungsfach front atom needs its own retained split or whether one direct reviewed bridge is already honest enough
  

### 2026-03-20: NRW upper-secondary broad E-phase polynomial atom becomes a retained split with one exact canonical bridge

What changed:

- the broad NRW E-phase source atom:
  - `22e2cc01-be7c-4478-8d22-0409ff5b14a0`
  is no longer a single archived atomic bundle
- instead, the retained NRW source snapshot now splits it into:
  - `ae5ec3d2-7ff8-4f08-92c0-5dec8006cf81` (`Potenzfunktionen mit ganzzahligen Exponenten beschreiben`)
  - `fb1eebf2-3d5d-40a6-a0e5-879bb7d4f422` (`Ganzrationale Funktionen beschreiben`)
- the NRW upper-secondary mapping lane now carries `25` rows instead of `24`
- the new polynomial child:
  - `fb1eebf2-3d5d-40a6-a0e5-879bb7d4f422`
  maps `exact` to the existing canonical J10 leaf:
  - `1ce8af38-082a-477b-af48-b924c92761bf` (`Ganzrationale Funktionen beschreiben`)
- the archived NRW source registries were widened in place:
  - `source-goal-membership-registry.json` now includes the two new retained child IDs
  - `source-goal-closure-registry.json` now resolves the broad parent through those two children instead of treating `22e2cc01...` as atomic

Why this cut:

- the NRW source wording is broader than any single existing canonical E-phase leaf
- the polynomial half already matches an existing shared canonical J10 atom cleanly enough for an exact bridge
- the power-function half still has no equally clean one-to-one target, so forcing a second bridge here would only create a weak breadth mismatch

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `25` rows
- the archived NRW closure regression now resolves the E-phase analysis cluster through the two new retained children instead of the old broad atomic bundle
- `npm run apply:applicability` changed `2` goals across `1` file
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `184` accepted warnings
- full `./run_ci.sh` passed after the NRW retained source split and exact polynomial bridge

Interpretation:

- NRW upper-secondary math no longer keeps the broad E-phase polynomial corridor only as unmapped structural source material
- instead, the shared canonical J10 polynomial leaf is now repository-backed for `DE-NW`, while the remaining NRW power-function clause stays explicitly unresolved rather than being stretched onto the wrong canonical target
- the next clean NRW source-led decision is now the retained power-function child `ae5ec3d2-7ff8-4f08-92c0-5dec8006cf81`, not the already-closed broad parent `22e2cc01...`

### 2026-03-20: NRW upper-secondary power-function child becomes an exact canonical late-Sek-I bridge

What changed:

- the retained NRW E-phase source child:
  - `ae5ec3d2-7ff8-4f08-92c0-5dec8006cf81` (`Potenzfunktionen mit ganzzahligen Exponenten beschreiben`)
  now maps `exact` in the NRW upper-secondary lane
- instead of forcing another reviewed `partial` onto the broader existing J9 graph/root leaf, the canonical late-Sek-I power corridor now carries a small mixed-state split:
  - the shared cluster `289db903-2831-45ef-afc2-c0619c91d680` (`Potenzfunktionen und Potenzgesetze nutzen`) now contains three children
  - the existing HE/BY graph/root leaf `66077296-a8f8-4645-938b-7c3424cb2f14` stays exact for the broader Potenz-/Wurzelfunktionssurface
  - the new NRW-exact leaf `30c013ac-5164-4c3c-8bc1-9a10b2f49533` (`Potenzfunktionen mit ganzzahligen Exponenten beschreiben`) now carries the narrower source wording directly
- the same canonical late-Sek-I power cluster now sequences child-driven instead of via the old cluster-wide prerequisite, so `DE-NW` does not need an artificial prerequisite bridge just to make the narrower exact leaf visible
- the NRW upper-secondary mapping lane now carries `26` rows instead of `25`

Why this cut:

- the retained NRW source wording is narrower than the existing shared J9 leaf `66077296...`, because it does not also cover Wurzelfunktionen or the fuller graph/transformation surface
- but it is still strong enough for an exact shared canonical leaf inside the same late-Sek-I power corridor
- this keeps the corridor repository-backed for `DE-NW` without introducing another `APV-202` breadth mismatch

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `26` rows
- `npm run apply:applicability` changed `1` goal across `1` file while recompiling the late-Sek-I power corridor with the new NRW-exact leaf
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `184` accepted warnings
- full `./run_ci.sh` passed after the canonical split and exact NRW bridge

Interpretation:

- NRW upper-secondary math no longer leaves the retained power-function child as unresolved source-only structure
- the shared canonical late-Sek-I power corridor is now active for `DE-NW` through an exact leaf rather than a reviewed `partial`
- the corridor no longer needs a synthetic NRW prerequisite workaround, because the shared cluster is now sequenced through its children rather than an inherited cluster-wide `requires`
- the remaining NRW upper-secondary unmapped atom is now only `71539804-c722-4fe6-bc71-e4e2abe1773f` (`Produktsummen und Flächeninhalte im Sachkontext deuten`), which remains deliberately source-structural after the narrower integral splits

### 2026-03-20: NRW upper-secondary retained productsum/area atom becomes an exact canonical Q1.1 leaf

What changed:

- the previously retained NRW Q1.1 source atom:
  - `71539804-c722-4fe6-bc71-e4e2abe1773f` (`Produktsummen und Flächeninhalte im Sachkontext deuten`)
  now maps `exact`
- the canonical Q1.1 introduction cluster:
  - `93ac7fc8-6d83-5394-bbea-80758b463da1`
  now also contains the new NRW-backed leaf:
  - `269675a9-13cd-4a3a-ab75-63794f5c9710` (`Produktsummen und orientierte Flächen im Sachkontext deuten`)
- the Q1.1 cluster description now names product sums explicitly and its weight advances from `6` to `7`
- the repository-backed NRW upper-secondary mapping lane now carries `27` rows instead of `26`

Why this cut:

- the retained NRW source wording is narrower than the existing canonical leaves for
  - `2afba4a2-287d-5e8f-aeee-a3bcf8652236` (`Integral als Bestand und Flächeninhalt verstehen`)
  - `34604a97-0c64-5b06-81e2-6ac818732d60` (`Integralterme interpretieren und begründen`)
- but it is still precise enough to justify its own exact canonical entry leaf in `Q1.1`
- this closes the last unmapped atomic goal in the current NRW upper-secondary source snapshot without creating another reviewed breadth mismatch

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `27` rows
- `npm run apply:applicability` changed `0` goals across `0` files because the committed applicability state was already consistent with the new exact leaf
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `184` accepted warnings
- full `./run_ci.sh` passed after the new exact Q1.1 leaf

Interpretation:

- the current NRW upper-secondary pilot snapshot now has `0` unmapped atomic source goals
- NRW is no longer carrying a deliberately retained leftover inside the current Q1.1 integral surface
- the next NRW decision is no longer “close the last leftover atom”, but whether to widen NRW source breadth further or move to the next Bundesland onboarding lane

### 2026-03-20: Niedersachsen mathematics mapping-lane setup opens the post-NRW Stage-B lane

What changed:

- the next post-NRW onboarding lane is now prepared for `DE-NI`
- the first real `DE-NI` canonical math mapping fixtures now exist at:
  - `curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_math_lower_secondary_to_canonical_math.json`
  - `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_math_upper_secondary_to_canonical_math.json`
- both fixtures are repository-backed and test-covered, but intentionally still empty (`0` mappings)
- stable Niedersachsen source-landscape IDs are now reserved for the future source snapshots:
  - lower-secondary math: `2b995085-dc5e-47c6-a563-9dcfc01fb74d`
  - upper-secondary math: `fcb04661-6ea2-4030-a9b2-97e6cc03daf8`
- the reservation and no-premature-activation rule now live in:
  - `curricula/DE/Gymnasium/provenance/ni-math-onboarding.md`
- the new `DE-NI` mapping-lane READMEs record the planned lane purpose and current non-activated state

Why this cut:

- the current NRW pilot subset already has `0` unmapped atomic source goals, so the next reusable learning step is no longer another local NRW cleanup
- Niedersachsen is the cleanest remaining placeholder lane for repeating the early multi-state onboarding pattern once more:
  - one provider family (`NIBIS`)
  - explicit mathematics references for both Sek I and Sek II
  - no immediate need to mix multiple unrelated subject imports into the same state step
- committing empty repository-backed fixtures first keeps the reserved IDs stable and test-visible before any real NI source snapshots exist

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `./run_ci.sh`

Validation result:

- both Niedersachsen mapping fixtures parse cleanly with `0` mappings
- full `./run_ci.sh` passed after the new `DE-NI` scaffold and fixture coverage

Interpretation:

- Stage B from `canonical-gymnasium-math-de-expansion-plan.md` is now prepared for Niedersachsen mathematics
- the next Niedersachsen blocker is no longer repository setup, but source import:
  - archive the NI mathematics source bundle under `curricula/DE/Gymnasium/input/NI/`
  - then activate shared provenance only after real source snapshots with stable source goal IDs exist

### 2026-03-20: Niedersachsen mathematics source import completes Stage A after the new Stage-B lane

What changed:

- the official Niedersachsen mathematics source PDFs are now archived locally under `curricula/DE/Gymnasium/input/NI/`
- lower-secondary mathematics now lives at:
  - `curricula/DE/Gymnasium/input/NI/lower-secondary/ma_gym_si_kc_druck.pdf`
- upper-secondary mathematics now lives at:
  - `curricula/DE/Gymnasium/input/NI/upper-secondary/ma_go_kc_druck_2019.pdf`
- source provenance is documented beside each file in:
  - `curricula/DE/Gymnasium/input/NI/lower-secondary/references.md`
  - `curricula/DE/Gymnasium/input/NI/upper-secondary/references.md`
- the Niedersachsen input README now reflects the archived-file state for mathematics instead of only pointing to generic NIBIS landing pages

Why this cut:

- after the new `DE-NI` mapping-lane scaffold, the next reusable blocker was no longer repository shape but raw source availability
- archiving the official PDFs first keeps the state-owned source bundle stable before any source-snapshot extraction begins
- this mirrors the earlier NRW onboarding order closely enough to keep the next multi-state comparison step mechanical

Validation used:

- `./run_ci.sh`

Validation result:

- full `./run_ci.sh` passed after the Niedersachsen archive import

Interpretation:

- Stage A and Stage B are now complete for Niedersachsen mathematics
- the next Niedersachsen blocker is Stage C:
  - import the first archived NI source snapshots with stable source goal IDs
  - then activate shared provenance only after those snapshots exist

### 2026-03-20: Niedersachsen lower-secondary pilot source snapshot completes the first Stage-C activation

What changed:

- the first real Niedersachsen Sek-I source snapshot now exists at:
  - `curricula/DE/Gymnasium/input/NI/lower-secondary/source-json/DE_NDS_S_GYM_1_MATHEMATIK.de.json.snapshot`
- the new archived source landscape uses the reserved Niedersachsen lower-secondary math `sourceLandscapeId`:
  - `2b995085-dc5e-47c6-a563-9dcfc01fb74d`
- the first imported NI pilot subset is deliberately small and source-led:
  - curriculum-wide `Funktionaler Zusammenhang` motivation
  - `Proportionale und antiproportionale Zusammenhaenge`
  - `Lineare Zusammenhaenge`
- the lower-secondary Niedersachsen source lane is now active in shared provenance:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the local NI source inventory now also includes:
  - `curricula/DE/Gymnasium/input/NI/math-structure-note.md`
- archived-source runtime handling and test coverage were widened for Niedersachsen:
  - `backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java`
  - `backend/src/test/java/com/skillpilot/backend/landscape/LandscapeServiceTest.java`

Why this cut:

- after NI Stage A and Stage B, the next reusable step was no longer repository setup but a first real archived source landscape with stable source goal IDs
- the lower-secondary functions corridor is the cleanest first Niedersachsen subset because it matches the already proven NRW onboarding shape without immediately forcing a broader subject import
- activating provenance at this point keeps the future NI mapping work grounded in repository-backed source IDs instead of PDF-only references

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `./run_ci.sh`

Validation result:

- the new Niedersachsen lower-secondary pilot source landscape loads from the real registry
- its archived atomic closure resolves correctly for the first NI functions corridor
- full `./run_ci.sh` passed after the new snapshot, provenance activation, and test coverage

Interpretation:

- Stage C is now complete for the first Niedersachsen lower-secondary pilot subset
- Niedersachsen upper-secondary remains source-PDF-only for now
- the next Niedersachsen blocker is therefore narrower than before:
  - import the first NI upper-secondary source snapshot with stable source goal IDs
  - then activate the shared provenance registries for that upper-secondary lane

### 2026-03-20: Niedersachsen upper-secondary pilot source snapshot closes the first Stage-C source pair

What changed:

- the first real Niedersachsen Sek-II source snapshot now exists at:
  - `curricula/DE/Gymnasium/input/NI/upper-secondary/source-json/DE_NDS_S_GYM_2_MATHEMATIK.de.json.snapshot`
- the new archived source landscape uses the reserved Niedersachsen upper-secondary math `sourceLandscapeId`:
  - `fcb04661-6ea2-4030-a9b2-97e6cc03daf8`
- the first imported NI upper-secondary pilot subset is deliberately small and source-led:
  - the Einfuehrungsphase orientation layer for the gemeinsame Basis der Qualifikationsphase
  - `Elementare Funktionenlehre`
  - `Ableitungen`
- the upper-secondary Niedersachsen source lane is now also active in shared provenance:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the local NI source inventory now records both active pilot snapshots in:
  - `curricula/DE/Gymnasium/input/NI/math-structure-note.md`
- archived-source runtime handling and registry-backed tests now also cover the Niedersachsen upper-secondary lane:
  - `backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java`
  - `backend/src/test/java/com/skillpilot/backend/landscape/LandscapeServiceTest.java`

Why this cut:

- after the lower-secondary NI Stage-C step, the cleanest next move was to activate the matching upper-secondary analysis entry corridor before starting any Niedersachsen mapping authoring
- `Elementare Funktionenlehre` plus `Ableitungen` in the Einfuehrungsphase is the smallest upper-secondary NI subset that can later support the shared change-rate and derivative-entry canonical spine
- activating both NI source lanes first keeps the next reviewed mappings source-grounded on repository-backed IDs for Sek I and Sek II alike

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `./run_ci.sh`

Validation result:

- the new Niedersachsen upper-secondary pilot source landscape loads from the real registry
- its archived atomic closure resolves correctly for the first NI upper-secondary analysis corridor
- full `./run_ci.sh` passed after the new snapshot, provenance activation, and test coverage

Interpretation:

- Stage C is now complete for the initial Niedersachsen lower-secondary and upper-secondary pilot source pair
- the next Niedersachsen blocker is no longer source import, but the first reviewed canonical mapping pass
- the clean next execution order is:
  - first NI Sek I motivation and function anchors
  - then NI Sek II change-rate / derivative-entry anchors

### 2026-03-20: Niedersachsen first mapping pass stops at a clean D0-style cut instead of forcing the functions corridor

What changed:

- `DE-NI` is now supported end-to-end in the canonical Gymnasium jurisdiction layer:
  - `app/scripts/applicabilityCompiler.ts`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java`
  - `app/src/components/PersonalCurriculumSetup.tsx`
  - `app/src/components/GoalCard.tsx`
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json`
- the first reviewed Niedersachsen lower-secondary mapping is now live:
  - `e1942eb6-f1a5-45a7-b160-c7be0b5e30fa`
  - maps `exact` to the shared canonical motivation atom:
  - `71cec9fb-3751-4d61-8b34-c5adbbf6e5f2` (`Warum Mathematik? – Denken, Muster & Zukunft`)
- the first NI lower-secondary source pass was widened before keeping any broader function bridges:
  - `curricula/DE/Gymnasium/input/NI/lower-secondary/source-json/DE_NDS_S_GYM_1_MATHEMATIK.de.json.snapshot`
  now contains a new arithmetic prerequisite strip for the active functions corridor:
  - fractions
  - decimals
  - positive / negative numbers on the number line
- that widened lower-secondary NI source strip is now also active in shared provenance:
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the repository-backed NI lower-secondary mapping lane was intentionally cut back to the stable green subset:
  - one exact motivation bridge
  - no retained NI functions / proportional / linear bridges yet
- repository-backed tests were widened to cover the clean NI intermediate state:
  - `backend/src/test/java/com/skillpilot/backend/landscape/GoalMappingRepositoryFixtureTest.java`
  - `backend/src/test/java/com/skillpilot/backend/landscape/LandscapeServiceTest.java`

Why this cut:

- the first Niedersachsen functions attempt immediately exposed two reusable rollout problems:
  - the canonical DE-level jurisdiction plumbing still lacked explicit `DE-NI` support
  - the NI lower-secondary function corridor sits behind a longer arithmetic prerequisite chain than the first minimal mapping slice could safely satisfy
- instead of keeping weak or half-supported NI function bridges, the cleaner move was:
  - activate `DE-NI` properly at root/compiler/runtime level
  - keep the first exact shared motivation bridge
  - archive the missing arithmetic prerequisite strip directly in the NI source snapshot
  - leave the broader functions pass for the next arithmetic-backed mapping slice

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the clean NI lower-secondary repository fixture now parses with `1` mapping instead of an empty lane
- the widened NI lower-secondary archived source closure resolves through the real provenance registries
- `npm run apply:applicability` changed `5` goals across `2` files while compiling the new `DE-NI` jurisdiction support and root visibility
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `184` accepted warnings
- full `./run_ci.sh` passed after the NI jurisdiction activation, source widening, and intermediate mapping cut

Interpretation:

- Niedersachsen is no longer at pure Stage-C-only source readiness:
  - the first clean Stage-D0-style slice is now complete
- the first reusable NI lesson is not yet a kept functions bridge, but the shape of the missing prerequisite corridor
- the next Niedersachsen step should therefore be:
  - first bridge the new NI arithmetic prerequisite strip into the shared lower-secondary arithmetic spine
  - then retry the NI proportional / linear functions corridor
  - only after that resume the first NI upper-secondary derivative-entry bridges

### 2026-03-20: Niedersachsen lower-secondary arithmetic prerequisite strip closes as exact J6 spine bridges

What changed:

- the widened Niedersachsen lower-secondary arithmetic strip is no longer source-only; it now maps exactly into the shared canonical J6 rational-number corridor:
  - `430a4b3b-1442-4542-a27a-5fe8726dc447`
    -> `f6a54a49-b6cf-4ab7-a185-aa08bfcb6c97`
  - `2c6d3275-ac7d-47d9-9de6-bbf2ad6b4d69`
    -> `2f565855-bcd6-4da5-bc80-4b72a2d93d50`
  - `20f4e9dc-d898-45e2-b7df-eb89c9ee6195`
    -> `199fe2ed-2576-4611-b8de-fd56fb9f78fc`
- the repository-backed Niedersachsen Sek-I mapping lane now carries `4` rows instead of `1`:
  - shared motivation exact bridge
  - three exact arithmetic prerequisite bridges
- the canonical J6 rational-number cluster:
  - `de39c9fe-5940-4320-aca8-2be85d6ada8f`
  now contains three new NI-exact leaves for:
  - fraction representations plus compare / reduce / expand
  - decimal numbers on the number line, in place value form, and as fractions
  - positive and negative numbers on the number line
- the old cluster-wide `requires` claim on:
  - `de39c9fe-5940-4320-aca8-2be85d6ada8f`
  was removed so the rational-number corridor can compile applicability child-driven instead of failing on non-imported legacy prerequisites
- cluster weights were advanced for the directly affected J6 branch:
  - `Rationale Zahlen darstellen und berechnen`
  - `Jahrgang 6 (Sek I)`
- the NI lane README and repository-backed fixture were aligned to the new exact four-row state

Why this cut:

- the widened NI prerequisite strip was already source-backed and source-atomic; keeping it unmapped would have left the next NI functions pass blocked behind known but still dormant arithmetic groundwork
- none of the existing canonical J6 leaves matched the NI source wording cleanly enough for safe exact reuse:
  - the fraction leaf in NI combines representation use with compare / reduce / expand
  - the decimal leaf is representation-driven, not just conversion-driven
  - the signed-number leaf is narrower than the existing broad rational-number line leaf
- the cleaner move was therefore a small exact canonical extension inside the existing J6 rational-number cluster, not another reviewed partial bridge

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the Niedersachsen Sek-I repository mapping fixture now parses cleanly with `4` rows
- `npm run apply:applicability` changed `2` goals across `1` file while recompiling the J6 rational-number branch
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `184` accepted warnings
- full `./run_ci.sh` passed after the NI arithmetic bridge pass

Interpretation:

- Niedersachsen is now past the pure D0-style activation cut:
  - the first clean D1-style arithmetic spine bridge is complete
- the next reusable NI question is no longer prerequisite import, but whether the function corridor now closes cleanly on top of that exact arithmetic base
- the next Niedersachsen step should therefore be:
  - retry the NI lower-secondary proportional / linear functions corridor
  - only after that resume the first NI upper-secondary derivative-entry bridges

### 2026-03-20: Niedersachsen lower-secondary function corridor reopens on the shared proportional / linear spine

What changed:

- the Niedersachsen Sek-I mapping lane now carries `8` reviewed rows instead of `4`:
  - the existing exact motivation bridge
  - the existing three exact arithmetic prerequisite bridges
  - one new exact lower-secondary function bridge:
    - `08dbb0ce-effb-478c-be9e-d49e0651a618`
      -> `2bb4bb91-7929-483a-b735-44275f6b5cdc`
  - three new reviewed partial follow-on bridges:
    - `52bd16c1-ce2a-46ac-a89c-8c41cc40bf9e`
      -> `c1f50bcc-7848-4e49-b9de-0ec030cc6bca`
    - `0f2a3cbe-37b8-4701-a5f0-87a58241765c`
      -> `09f47964-2cd0-410e-93ee-9632b582fc91`
    - `7ad51e84-1b5b-41e9-a0ec-854c11b45fee`
      -> `af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186`
- after applicability compilation, `DE-NI` is now visible on the shared canonical lower-secondary function spine for:
  - `Zuordnungen analysieren`
  - `Proportionale Zuordnungen nutzen`
  - `Funktionsbegriff und Darstellungen verstehen`
  - `Lineare Funktionen beschreiben`
- the repository-backed Niedersachsen Sek-I fixture and lower-secondary mapping README were aligned to the new eight-row state
- three reviewed Niedersachsen `APV-202` entries were added for the intentionally broader partial bridges:
  - proportionality
  - function representations
  - linear-function foundations

Why this cut:

- the arithmetic prerequisite strip is now exact and active, so the NI functions corridor no longer had to stay dormant behind known groundwork
- `Zuordnungen mit Worten, Tabellen und Graphen ...` is already narrow enough for a clean exact bridge to the shared canonical mappings atom
- the next three NI source atoms are didactically useful but still broader than the current canonical leaves:
  - proportionality also carries relation discrimination and multiple interpretation routes
  - the linear-representations clause still lacks the full canonical function-language wording
  - the linear-analysis clause also includes equations, roots, parameter variation, and modelling
- the cleaner move was therefore:
  - reopen the shared lower-secondary function spine for Niedersachsen now
  - keep the first NI bridge exact where the wording already matches
  - record the broader follow-on bridges explicitly as reviewed `partial`, not force premature canonical splits

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the Niedersachsen Sek-I repository mapping fixture now parses cleanly with `8` rows
- `npm run apply:applicability` changed the shared canonical math landscape while compiling the reopened NI function spine
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `187` accepted warnings
- full `./run_ci.sh` passed after the NI lower-secondary function-bridge pass

Interpretation:

- Niedersachsen now also has a clean D2-style lower-secondary function result:
  - one exact shared function-anchor bridge
  - three reviewed partial follow-on bridges on the shared proportional / linear spine
- the next Niedersachsen step should therefore be:
  - resume the first NI upper-secondary change-rate / derivative-entry bridges
  - only return to lower-secondary again if a clearly source-atomic downstream NI clause emerges

### 2026-03-20: Niedersachsen upper-secondary reaches the next shared E.2 qualitative derivative-entry leaf

What changed:

- the Niedersachsen Sek-II mapping lane now carries a second reviewed row in the same retained derivative-entry corridor:
  - `234dde5d-cc9d-4508-af9e-092e614ea304`
    -> `2143e9e8-b176-545b-b2fa-91bbb6c8cf5c`
    as `partial`
- the NI source atom `Lokale Aenderungsrate und Tangentensteigung mit propaedeutischem Grenzwertbegriff entwickeln` is now reused once for the shared canonical leaf `Momentane Änderungsrate qualitativ verstehen`
- the shared canonical difference-quotient prerequisite `b42bdfcc-3db7-5697-8b3e-69e50962ca86` now carries an explicit retained `DE-NI` applicability override so the qualitative follow-on route can compile cleanly
- the repository-backed Niedersachsen Sek-II fixture and upper-secondary mapping README were aligned to the new two-row state
- the accepted-warning registry now records:
  - the Niedersachsen-specific `APV-202` for `2143e9e8-b176-545b-b2fa-91bbb6c8cf5c`
  - the matching retained-prerequisite `APV-201` for `b42bdfcc-3db7-5697-8b3e-69e50962ca86`

Why this cut:

- the NI source wording fits the qualitative derivative-entry follow-on more closely than the narrower computational limit leaf:
  - it develops local rate of change from average rates
  - and tangent slope from secant slopes
  - but it does not yet isolate the canonical `h -> 0` determination step as a separate one-to-one source atom
- this is therefore the same bounded pattern already proven in NRW:
  - retain the shared limit prerequisite explicitly
  - and let the broader NI source atom open the next qualitative derivative-entry leaf as a reviewed `partial`

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the Niedersachsen Sek-II repository mapping fixture now parses cleanly with `2` rows
- `npm run apply:applicability` stays idempotent for this slice at `0` changed goals across `0` files because the canonical math file is already aligned to the retained NI qualitative derivative-entry route
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `191` accepted warnings
- full `./run_ci.sh` passed after the NI upper-secondary qualitative derivative-entry pass

Interpretation:

- Niedersachsen upper-secondary math now reaches the first two shared canonical derivative-entry leaves through a bounded retained route
- the next Niedersachsen step should stay in the same upper-secondary corridor:
  - either `6c021ee2-f600-4977-a4a8-877ece6c8c3b` against the pointwise derivative-interpretation leaf
  - or a small retained NI source split if that follow-on alignment turns out too broad

### 2026-03-20: Niedersachsen upper-secondary reaches the shared pointwise derivative-interpretation leaf

What changed:

- the Niedersachsen Sek-II mapping lane now carries a third reviewed row in the same E.2 corridor:
  - `6c021ee2-f600-4977-a4a8-877ece6c8c3b`
    -> `b1dcc191-d046-50de-984a-ee5c17157628`
    as `partial`
- the NI source atom `Ableitung als lokale Aenderungsrate und Tangentensteigung deuten` is now reused once for the shared canonical leaf `Ableitung als Steigung im Punkt deuten`
- the repository-backed Niedersachsen Sek-II fixture and upper-secondary mapping README were aligned to the new three-row state
- the accepted-warning registry now records the Niedersachsen-specific `APV-202` for `b1dcc191-d046-50de-984a-ee5c17157628`

Why this cut:

- this is the cleanest next NI follow-on after the retained qualitative route:
  - the source atom explicitly interprets the derivative as local rate of change and tangent slope
  - and the canonical target narrows that same idea to the derivative value at a point
- the fit is still intentionally kept as reviewed `partial`, because the NI wording remains slightly broader and example-based rather than fully point-value-specific
- no new retained prerequisite bridge is needed here:
  - the already-open NI `b42bdfcc-3db7-5697-8b3e-69e50962ca86` prerequisite route is sufficient for the shared pointwise interpretation leaf

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the Niedersachsen Sek-II repository mapping fixture now parses cleanly with `3` rows
- `npm run apply:applicability` changed `1` goal across `1` file while compiling the NI pointwise derivative-interpretation bridge:
  - the shared canonical leaf `b1dcc191-d046-50de-984a-ee5c17157628` now also carries `DE-NI`
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `192` accepted warnings
- full `./run_ci.sh` passed after the NI upper-secondary pointwise derivative-interpretation pass

Interpretation:

- Niedersachsen upper-secondary math now reaches the first three shared canonical derivative-entry leaves through one bounded retained route
- the next Niedersachsen step should stay in the same upper-secondary corridor:
  - either `d1ca482c-4184-464f-a057-2d61ba077803` against the derivative-graph leaf
  - or `5b284b66-f417-4366-8685-012ae000b3b1` against the elementary-derivative-rules leaf

### 2026-03-20: Niedersachsen upper-secondary reaches the shared derivative-graph leaf

What changed:

- the Niedersachsen Sek-II mapping lane now carries a fourth reviewed row in the same E.2 corridor:
  - `d1ca482c-4184-464f-a057-2d61ba077803`
    -> `845440ce-f63f-5835-903f-739145ca27bd`
    as `partial`
- the NI source atom `Funktionsgraph und Ableitungsgraph zusammen beschreiben` is now reused once for the shared canonical leaf `Zusammenhang von f und f′ am Graphen beschreiben`
- the repository-backed Niedersachsen Sek-II fixture and upper-secondary mapping README were aligned to the new four-row state
- the accepted-warning registry now records the Niedersachsen-specific `APV-202` for `845440ce-f63f-5835-903f-739145ca27bd`

Why this cut:

- this is the cleanest next NI follow-on after the pointwise interpretation step:
  - the source atom explicitly relates function graph and derivative graph in both directions
  - and the canonical target narrows that same relation to sign, course, monotonicity, and extrema
- the bridge remains reviewed `partial` because the NI wording is broader and also references inflection points
- no new retained prerequisite bridge is needed here:
  - the already-open NI route through `b1dcc191-d046-50de-984a-ee5c17157628` is sufficient for this derivative-graph leaf

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the Niedersachsen Sek-II repository mapping fixture now parses cleanly with `4` rows
- `npm run apply:applicability` changed `1` goal across `1` file while compiling the NI derivative-graph bridge
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `193` accepted warnings
- full `./run_ci.sh` passed after the NI upper-secondary derivative-graph pass

Interpretation:

- Niedersachsen upper-secondary math now reaches the first four shared canonical derivative-entry leaves through one bounded retained route
- the next Niedersachsen step should stay in the same upper-secondary corridor:
  - either `5b284b66-f417-4366-8685-012ae000b3b1` against the elementary-derivative-rules leaf
  - or a small NI follow-on on the graph/curve-discussion side if a cleaner source-atomic clause emerges

### 2026-03-20: Niedersachsen upper-secondary reaches the shared elementary-derivative-rules leaf

What changed:

- the Niedersachsen Sek-II mapping lane now carries a fifth reviewed row in the same E.2 corridor:
  - `5b284b66-f417-4366-8685-012ae000b3b1`
    -> `858113c5-e53b-57bb-b01f-ba95c3ddcb6f`
    as `partial`
- the NI source atom `Standardableitungen sowie Summen- und Faktorregel nutzen` is now reused once for the shared canonical leaf `Ableitungen elementarer Funktionen berechnen`
- the repository-backed Niedersachsen Sek-II fixture and upper-secondary mapping README were aligned to the new five-row state
- the accepted-warning registry now records the Niedersachsen-specific `APV-202` for `858113c5-e53b-57bb-b01f-ba95c3ddcb6f`

Why this cut:

- this is the cleanest next NI follow-on after the derivative-graph step:
  - the source atom explicitly covers selected standard derivatives plus sum and factor rule
  - and the canonical target narrows that same route to elementary derivatives calculated with differentiation rules
- the bridge remains reviewed `partial` because the NI wording is slightly narrower than the canonical atom and does not claim the full current shared elementary-function breadth
- no new retained prerequisite bridge is needed here:
  - the already-open NI route through `b42bdfcc-3db7-5697-8b3e-69e50962ca86` is sufficient for this rule-based leaf

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the Niedersachsen Sek-II repository mapping fixture now parses cleanly with `5` rows
- `npm run apply:applicability` changed `1` goal across `1` file while compiling the NI elementary-derivative-rules bridge
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `194` accepted warnings
- full `./run_ci.sh` passed after the NI upper-secondary elementary-derivative-rules pass

Interpretation:

- Niedersachsen upper-secondary math now reaches the first five shared canonical derivative-entry leaves through one bounded retained route
- the next Niedersachsen step should now move to the next downstream NI analysis lane beyond this starter corridor rather than reopening lower-secondary work

### 2026-03-20: Niedersachsen upper-secondary reaches the first downstream extremal-problem leaf

What changed:

- the Niedersachsen Sek-II mapping lane now carries a sixth reviewed row beyond the retained derivative-entry starter corridor:
  - `d08d5280-3561-4d02-91f0-5f7465dd88a7`
    -> `1511b39a-4094-5450-a755-4a3ad3339733`
    as `partial`
- the broad NI source atom `Tangenten, Normalen, Monotonie, Extrem- und Wendestellen untersuchen und Sachprobleme loesen`
  - is now reused once for the narrower shared canonical leaf `Einfache Extremwertprobleme lösen`
- after applicability compilation, `DE-NI` is now also visible on the shared canonical `Anwendungen des Ableitungsbegriffs` cluster
- the repository-backed Niedersachsen Sek-II fixture and upper-secondary mapping README were aligned to the new six-row state
- the accepted-warning registry now records the Niedersachsen-specific `APV-202` for `1511b39a-4094-5450-a755-4a3ad3339733`

Why this cut:

- this is the cleanest first downstream NI follow-on beyond the current derivative-entry starter route:
  - the source atom explicitly includes optimization use
  - and the canonical target narrows that same surface to simple extremal problems solved and interpreted in context
- the bridge remains reviewed `partial` because the NI wording is broader and still bundles tangent / normal equations, monotonicity, and special-point analysis into the same clause
- no new retained prerequisite bridge is needed here:
  - the already-open NI route through `845440ce-f63f-5835-903f-739145ca27bd` and `858113c5-e53b-57bb-b01f-ba95c3ddcb6f` is sufficient for this downstream leaf

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the Niedersachsen Sek-II repository mapping fixture now parses cleanly with `6` rows
- `npm run apply:applicability` changed `2` goals across `1` file while compiling the NI extremal-problem bridge
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `195` accepted warnings
- full `./run_ci.sh` passed after the NI downstream extremal-problem pass

Interpretation:

- Niedersachsen upper-secondary math now reaches the first downstream `E.3` application leaf without widening the retained prerequisite surface
- the next Niedersachsen step should stay on the same broad NI AB3 source atom and decide whether a retained split is justified for tangent / monotonicity / Wendestellen follow-ons

### 2026-03-20: Niedersachsen retained-splits the downstream AB3 source atom and reaches the first-derivative investigation leaf

What changed:

- the broad Niedersachsen Sek-II source atom `d08d5280-3561-4d02-91f0-5f7465dd88a7`
  - is no longer kept as one coarse atomic clause
  - it is now a retained split-cluster with three source-aligned children for:
    - tangent / normal equations
    - monotonicity plus Extrem- and Wendestellen
    - optimization use
- the existing extremal-problem bridge was repointed from the old broad parent to the narrower optimization child:
  - `270b0f43-623c-413c-b7f1-eb690079ad8d`
    -> `1511b39a-4094-5450-a755-4a3ad3339733`
    as `partial`
- the Niedersachsen Sek-II mapping lane now carries a seventh reviewed row:
  - `f4515a28-7161-49ae-8e74-f58d81ec0812`
    -> `350fc8b1-ead0-4239-b28a-217cbd3bd1c3`
    as `partial`
- after applicability compilation, `DE-NI` is now also visible on the shared canonical leaf `Monotonie und Extremstellen mit der ersten Ableitung untersuchen`
- the source membership / closure registries, the NI closure regression, the repository-backed Niedersachsen Sek-II fixture, and the upper-secondary mapping README were aligned to the retained-split seven-row state
- the accepted-warning registry now records the Niedersachsen-specific `APV-202` for `350fc8b1-ead0-4239-b28a-217cbd3bd1c3`, and the NI rationale for `1511b39a-4094-5450-a755-4a3ad3339733` was narrowed to the new optimization child

Why this cut:

- the previous NI AB3 source atom had become too broad for repeated downstream reuse:
  - it bundled tangents / normals, monotonicity, special points, and optimization in one clause
  - so another direct broad partial would have increased review debt without improving source precision
- the retained split keeps the archived source landscape stable while making the next NI bridge source-tighter
- the new monotonicity bridge remains reviewed `partial` because the retained NI child still combines extrema with Wendestellen rather than isolating the narrower first-derivative-only canonical leaf

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the Niedersachsen Sek-II repository mapping fixture now parses cleanly with `7` rows
- the NI upper-secondary source closure regression now resolves the retained split-cluster to its three new atomic children
- `npm run apply:applicability` changed `1` goal across `1` file while compiling the NI first-derivative investigation bridge
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `196` accepted warnings
- full `./run_ci.sh` passed after the NI retained-split monotonicity pass

Interpretation:

- Niedersachsen upper-secondary math now reaches a second downstream `E.3` application leaf without keeping the old coarse AB3 source atom in active bridge use
- the next Niedersachsen step should stay inside this retained split:
  - either leave the tangent / normal child intentionally unmapped for now
  - or split the monotonicity / Wendestellen child once more before attempting a second-derivative follow-on

### 2026-03-21: Niedersachsen closes the retained tangent lane with one bounded shared-leaf bridge

What changed:

- the retained Niedersachsen source child `23e03002-37c4-4268-ba3a-ddcdffc2e666`
  - now maps as one reviewed `partial`
  - to the shared canonical tangent-equation leaf `0264591c-fdd7-41c6-9fb9-7cb3a03f7658`
- this closes the remaining open tangent-lane decision inside the retained NI AB3 split without introducing another source split
- after applicability compilation, `DE-NI` is now also visible on the shared canonical leaf `Tangentengleichungen und Steigungswinkel bestimmen` and thereby on the surrounding tangents/normals cluster
- the repository-backed Niedersachsen Sek-II fixture and upper-secondary mapping README were aligned to the new nine-row state
- the accepted-warning registry now records the Niedersachsen-specific `APV-202` for `0264591c-fdd7-41c6-9fb9-7cb3a03f7658`

Why this cut:

- the NI source child isolates tangent and normal equations cleanly enough to justify one bounded shared-leaf bridge
- forcing another source split would not buy much:
  - the remaining mismatch is mainly the missing explicit Steigungswinkel surface
  - that is already narrow enough to live as reviewed `partial` debt
- mapping to the shared tangent-equation leaf is cleaner than forcing another NI-only split:
  - the Bayern-derived tangent-equation leaf is closer to the NI wording than the NRW slope-focused leaf
  - the remaining mismatch is limited and reviewable: missing explicit Steigungswinkel on the source side, extra Normalengleichungen on the NI side

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the Niedersachsen Sek-II repository mapping fixture now parses cleanly with `9` rows
- `npm run apply:applicability` changed `2` goals across `1` file while compiling the NI tangent-lane bridge
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `198` accepted warnings
- full `./run_ci.sh` passed after the NI tangent-lane pass

Interpretation:

- the retained NI E-phase derivative-usage starter slice is now closed without further source-shape debt inside the current pilot subset
- the next Niedersachsen step should now move outside this retained starter slice:
  - either widen the NI upper-secondary source snapshot into the next corridor
  - or stop the NI pilot here and move to the next Bundesland

### 2026-03-21: Baden-Wuerttemberg mathematics mapping-lane setup opens the post-Niedersachsen Stage-B lane

What changed:

- the next post-Niedersachsen onboarding lane is now prepared for `DE-BW`
- the first real `DE-BW` canonical math mapping fixtures now exist at:
  - `curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_math_lower_secondary_to_canonical_math.json`
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_math_upper_secondary_to_canonical_math.json`
- both fixtures are repository-backed and intentionally still empty (`0` mappings)
- stable Baden-Wuerttemberg source-landscape IDs are now reserved for the future source snapshots:
  - lower-secondary math: `6232b783-199c-4c50-92f2-9fb31277e619`
  - upper-secondary math: `fa8f864a-aac5-486d-8e77-40df2af038a3`
- the reservation and no-premature-activation rule now live in:
  - `curricula/DE/Gymnasium/provenance/bw-math-onboarding.md`
- the new `DE-BW` mapping-lane READMEs record the planned lane purpose and current non-activated state

Why this cut:

- the retained NI E-phase starter slice is now closed cleanly enough that the next reusable rollout learning step is no longer another local NI cleanup
- Baden-Wuerttemberg is the cleanest remaining placeholder lane for repeating the early multi-state onboarding pattern once more:
  - one provider family
  - explicit math references for both lower-secondary and upper-secondary Gymnasium
  - a Kursstufe structure that should pressure-test the shared upper-secondary canonical spine differently from NRW and Niedersachsen
- preparing the Stage-B lane first keeps the next move operationally simple:
  - source import can follow without reopening runtime or fixture semantics
  - the reserved IDs are now stable before any source snapshots are authored

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `./run_ci.sh`

Validation result:

- the repository-backed Baden-Wuerttemberg lower-secondary mapping fixture parses cleanly with `0` rows
- the repository-backed Baden-Wuerttemberg upper-secondary mapping fixture parses cleanly with `0` rows
- full `./run_ci.sh` passed after the post-Niedersachsen Stage-B scaffold pass

Interpretation:

- the next executable program step is now no longer a local NI tangent/derivative follow-on
- the clean next move is Baden-Wuerttemberg Stage A:
  - archive the official mathematics source bundle under `curricula/DE/Gymnasium/input/BW/`
  - then build the first lower-secondary and upper-secondary source snapshots

### 2026-04-03: Bavaria upper-secondary retained-splits the matrix-power/fixed-vector source atom

What changed:

- the broad Bavaria upper-secondary source atom:
  - `ccd385d1-13f8-5b0a-bb7c-2c1428f6eaf3`
  is no longer treated as one archived atomic bundle
- instead, the retained Bavaria source snapshot now resolves it through two child leaves:
  - `c0959210-c934-4498-b94d-44c90b1a4ad1` (`berechnen Potenzen von Matrizen und deuten diese bei mehrstufigen Prozessen`)
  - `0cb17a53-944d-47b7-9bac-2094e91793eb` (`bestimmen bei mehrstufigen Prozessen Fixvektoren und deuten diese im Sachzusammenhang`)
- the retained parent:
  - `ccd385d1-13f8-5b0a-bb7c-2c1428f6eaf3`
  now stays in the Bavaria source file as a broad corridor node whose `contains` list points at those two new children
- the archived Bavaria source registries were widened in place:
  - `source-goal-membership-registry.json` now includes both new retained child IDs
  - `source-goal-closure-registry.json` now resolves the broad parent through those two children instead of treating `ccd385d1...` as atomic
- the Bavaria upper-secondary mapping lane now keeps the retained parent as a broad `partial` bridge to the shared canonical corridor:
  - `d6d8904c-896f-5850-8181-06c223346b80` (`Matrizen, Übergangsprozesse und lineare Modelle (Sek II)`)
- the new matrix-power child:
  - `c0959210-c934-4498-b94d-44c90b1a4ad1`
  now maps `exact` to:
  - `33c6e64c-5955-5b07-85d4-74a97b19dd56` (`Matrixpotenzen in Übergangsprozessen deuten`)
- the new fixed-vector child:
  - `0cb17a53-944d-47b7-9bac-2094e91793eb`
  now maps `exact` to:
  - `8d893e63-d7de-52d9-8bcb-f48f47d1ccbf` (`Stabile Zustände mithilfe von Fixvektoren bestimmen`)
- the adjacent Bavaria absorption leaf:
  - `532c66d0-f4f1-5689-b97d-025f7730da5d`
  remains a broad `partial` bridge to:
  - `0a024ecf-27ee-40a2-bf41-0e2faaeb1252`
  because this slice still has no cleaner one-to-one canonical target

Why this cut:

- the original Bavaria source wording bundles two separable skills:
  - matrix powers for multi-step transition processes
  - fixed vectors as stable states
- both subskills already have honest shared canonical atoms, so keeping one broad `partial` bridge would preserve unnecessary breadth mismatch
- retaining the broad parent in the archived source tree keeps provenance stable while letting the learner-facing bridge become more exact
- the adjacent absorption clause still mixes a different late-process interpretation surface and therefore should not be forced onto one of the two newly exact children

Validation used:

- `APPLICABILITY_APPLY_SCOPE=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced npm --prefix app run apply:applicability`
- `npm --prefix app run validate:view-filters`

Validation result:

- the applicability compiler persisted `1` landscape and changed `136` goals across `1` file in the canonical mathematics graph
- `npm --prefix app run validate:view-filters` now reports `0` errors, `14` warnings, and `534` accepted warnings

Interpretation:

- Bavaria upper-secondary mathematics now reaches the shared Sek-II matrix corridor through two exact source-backed leaves instead of one broad partial bridge
- the clean move here was a retained split in the source lane, not a new canonical atom: the canonical corridor already had the right matrix-power and fixed-vector leaves
- the remaining open decision in this micro-corridor is still the absorption / long-run behavior clause, which remains intentionally broad for now

### 2026-03-21: Baden-Wuerttemberg mathematics source import completes post-Niedersachsen Stage A

What changed:

- the official Baden-Wuerttemberg Gymnasium mathematics source PDF is now archived locally at:
  - `curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_M.pdf`
- this provider export currently covers both lower-secondary and Kursstufe mathematics in one official source bundle
- the Baden-Wuerttemberg input lane README now records that shared archive state and points both math sections at the local file
- lane-specific provenance notes now exist at:
  - `curricula/DE/Gymnasium/input/BW/lower-secondary/references.md`
  - `curricula/DE/Gymnasium/input/BW/upper-secondary/references.md`
- the BW onboarding note now records that the source PDF is archived while the source registries still remain inactive until real snapshots exist

Why this cut:

- the post-NI reusable next step was source onboarding for one further mathematics state, not more local NI corridor cleanup
- Baden-Wuerttemberg exposes a slightly different source shape than NRW and Niedersachsen:
  - one official combined Gymnasium mathematics export instead of two separate Sek-I / Sek-II PDFs
- archiving that official combined export first keeps the next Stage-C snapshot work grounded in a fixed on-disk source bundle before any source-goal IDs are authored

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `./run_ci.sh`

Validation result:

- the repository-backed Baden-Wuerttemberg Stage-B mapping fixtures still parse cleanly with `0` rows
- full `./run_ci.sh` passed after the Baden-Wuerttemberg Stage-A source import
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `198` accepted warnings

Interpretation:

- Baden-Wuerttemberg is no longer a README-only placeholder lane
- the next executable program step is now Baden-Wuerttemberg Stage C:
  - derive the first lower-secondary pilot snapshot from the archived combined mathematics PDF
  - then derive the first upper-secondary pilot snapshot from the same source bundle

### 2026-03-21: Baden-Wuerttemberg lower-secondary pilot source snapshot completes the first Stage-C activation

What changed:

- the first real Baden-Wuerttemberg Sek-I source snapshot now exists at:
  - `curricula/DE/Gymnasium/input/BW/lower-secondary/source-json/DE_BAW_S_GYM_1_MATHEMATIK.de.json.snapshot`
- the new archived source landscape uses the reserved Baden-Wuerttemberg lower-secondary math `sourceLandscapeId`:
  - `6232b783-199c-4c50-92f2-9fb31277e619`
- the first imported BW pilot subset is deliberately small and source-led:
  - the curriculum-wide orientation layer from `1.1 Bildungswert des Faches Mathematik`
  - `3.1.4 Leitidee Funktionaler Zusammenhang` in `Klassen 5/6`
  - `3.2.4 Leitidee Funktionaler Zusammenhang` in `Klassen 7/8`
- the lower-secondary Baden-Wuerttemberg source lane is now active in shared provenance:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the local BW source inventory now also includes:
  - `curricula/DE/Gymnasium/input/BW/math-structure-note.md`
- archived-source runtime handling and test coverage were widened for Baden-Wuerttemberg:
  - `backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java`
  - `backend/src/test/java/com/skillpilot/backend/landscape/LandscapeServiceTest.java`

Why this cut:

- after BW Stage A and Stage B, the next reusable step was no longer repository setup but a first real archived source landscape with stable source goal IDs
- the lower-secondary shared functions corridor is the cleanest first Baden-Wuerttemberg subset because the combined source PDF already exposes it in a form close to the earlier NRW and Niedersachsen onboarding cuts
- activating provenance at this point keeps the later BW mapping work grounded in repository-backed source IDs instead of PDF-only references

Validation used:

- `./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run validate:graph`
- `./run_ci.sh`

Validation result:

- the new Baden-Wuerttemberg lower-secondary pilot source landscape loads from the real registry
- its archived atomic closure resolves correctly for the first BW functions corridor
- full `./run_ci.sh` passed after the new snapshot, provenance activation, and test coverage
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `198` accepted warnings

Interpretation:

- Stage C is now complete for the first Baden-Wuerttemberg lower-secondary pilot subset
- Baden-Wuerttemberg upper-secondary remains source-PDF-only for now
- the next Baden-Wuerttemberg blocker is therefore narrower than before:
  - import the first BW upper-secondary source snapshot with stable source goal IDs
  - then activate the shared provenance registries for that upper-secondary lane

### 2026-03-21: Baden-Wuerttemberg course-stage pilot source snapshot completes the first upper-secondary Stage-C activation

What changed:

- the first real Baden-Wuerttemberg Kursstufe source snapshot now exists at:
  - `curricula/DE/Gymnasium/input/BW/upper-secondary/source-json/DE_BAW_S_GYM_2_MATHEMATIK.de.json.snapshot`
- the new archived source landscape uses the reserved Baden-Wuerttemberg upper-secondary math `sourceLandscapeId`:
  - `fa8f864a-aac5-486d-8e77-40df2af038a3`
- the first imported BW Kursstufe pilot subset is deliberately small and source-led:
  - the shared orientation layer from `1.4 Basisfach und Leistungsfach in der Oberstufe`
  - `3.5.4 Leitidee Funktionaler Zusammenhang` in `Basisfach`
  - `3.4.4 Leitidee Funktionaler Zusammenhang` in `Leistungsfach`
- the upper-secondary Baden-Wuerttemberg source lane is now also active in shared provenance:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- archived-source runtime handling and test coverage were widened again for Baden-Wuerttemberg:
  - `backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java`
  - `backend/src/test/java/com/skillpilot/backend/landscape/LandscapeServiceTest.java`

Why this cut:

- after the first BW Sek-I Stage-C activation, the next reusable source step was the matching Kursstufe lane from the same archived combined PDF
- Baden-Wuerttemberg now has enough real source structure on disk to avoid further PDF-first reasoning for the first mapping pass
- the imported Basisfach/Leistungsfach pair gives the rollout a fifth upper-secondary comparison shape after Hessen, Bavaria, NRW, and Niedersachsen without forcing an early broad subject import

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `./run_ci.sh`

Validation result:

- the first BW Kursstufe pilot snapshot parses cleanly and is now reachable through the shared archived-source registries
- full `./run_ci.sh` passed after the BW Kursstufe Stage-C activation
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `198` accepted warnings

Interpretation:

- Baden-Wuerttemberg is no longer source-incomplete on the mathematics-first rollout track
- the clean next program step is now no longer another BW source snapshot
- the next executable work item is the first reviewed BW lower-secondary function-corridor mapping pass against the already archived Sek-I source IDs

### 2026-03-21: Niedersachsen retained-splits the monotonicity/Wendestellen child and reaches the second-derivative curvature leaf

What changed:

- the retained Niedersachsen source child `f4515a28-7161-49ae-8e74-f58d81ec0812`
  - is no longer kept as one broad atomic clause
  - it is now a retained split-cluster with two narrower children for:
    - monotonicity plus Extremstellen
    - Wendestellen
- the existing first-derivative bridge was repointed from the broader first-stage child to the narrower monotonicity/extrema child:
  - `22074d55-5227-4487-9fcc-4bc5dcec970e`
    -> `350fc8b1-ead0-4239-b28a-217cbd3bd1c3`
    as `partial`
- the Niedersachsen Sek-II mapping lane now carries an eighth reviewed row:
  - `d3e91530-938e-46c9-b0de-55bbae83e5a0`
    -> `b3604df4-15a8-41c8-a8b0-50dadd698bd3`
    as `partial`
- after applicability compilation, `DE-NI` is now also visible on the shared canonical leaf `Krümmung und Wendestellen mit der zweiten Ableitung untersuchen`
- the source membership / closure registries, the NI closure regression, the repository-backed Niedersachsen Sek-II fixture, and the upper-secondary mapping README were aligned to the retained-split eight-row state
- the accepted-warning registry now records the Niedersachsen-specific `APV-202` for `b3604df4-15a8-41c8-a8b0-50dadd698bd3`, and the NI rationale for `350fc8b1-ead0-4239-b28a-217cbd3bd1c3` was narrowed to the new monotonicity/extrema child

Why this cut:

- the first retained NI child was still too broad for a clean second-derivative follow-on:
  - it bundled monotonicity, extremal behavior, and Wendestellen in one clause
  - so reusing it again would have stacked another broad partial on top of already reviewed debt
- the second retained split keeps the archived NI source lane stable while making the first- and second-derivative bridges materially tighter
- the new second-derivative bridge still remains reviewed `partial` because the retained NI Wendestellen child does not isolate the full canonical curvature surface or the contextual interpretation layer

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the Niedersachsen Sek-II repository mapping fixture now parses cleanly with `8` rows
- the NI upper-secondary source closure regression now resolves the first retained child to its two narrower atomic children
- `npm run apply:applicability` changed `1` goal across `1` file while compiling the NI second-derivative curvature bridge
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `197` accepted warnings
- full `./run_ci.sh` passed after the NI retained-split second-derivative pass

Interpretation:

- Niedersachsen upper-secondary math now reaches the shared second-derivative curvature leaf without forcing another reuse of the broad first-stage retained child
- the next Niedersachsen step should now decide only the remaining tangent-lane question:
  - either leave the tangent / normal child intentionally unmapped for now
  - or accept one bounded reviewed partial onto the shared tangents leaf

### 2026-03-20: Niedersachsen upper-secondary reaches the first shared E.2 change-rate leaf

What changed:

- the Niedersachsen Sek-II mapping lane now carries its first reviewed row instead of staying empty:
  - `250ba641-b2a1-4717-9a27-4ee0e6aa83c2`
    -> `ae20183e-92b5-5521-b8e0-9a8662cf51f5`
    as `partial`
- this is the same conservative first upper-secondary Analysis cut previously proven in NRW:
  - the NI source atom `Mittlere und lokale Aenderungsraten sowie Sekanten- und Tangentensteigungen bestimmen`
  - is reused once for the narrower shared canonical leaf `Mittlere Änderungsrate berechnen und deuten`
- after applicability compilation, `DE-NI` is now visible on the first shared upper-secondary derivative-entry leaf and pulls the shared canonical derivative-entry cluster into Niedersachsen as well
- the repository-backed Niedersachsen Sek-II fixture and upper-secondary mapping README were aligned to the new one-row state
- the accepted-warning registry now records:
  - the Niedersachsen-specific `APV-202` for `ae20183e-92b5-5521-b8e0-9a8662cf51f5`
  - two matching retained-prerequisite `APV-201` entries for `c65ecabf-d00b-4e2d-99ae-b64692325ffb` and `a8c42ee9-2898-4247-819f-c235032ac78a`
- the canonical function-value leaves `c65ecabf-d00b-4e2d-99ae-b64692325ffb` and `a8c42ee9-2898-4247-819f-c235032ac78a` now carry explicit retained `DE-NI` applicability so the first derivative-entry route can compile cleanly

Why this cut:

- the imported NI upper-secondary corridor is still intentionally narrow, and the broadest derivative bundle would be too coarse as a first kept bridge
- the cleanest reusable move is the same one that worked in NRW:
  - start with the average-rate entry leaf
  - do not force the next derivative follow-on until the route is visible and validated
- the NI source wording is still broader than the canonical average-rate atom because it also includes local rates and secant / tangent slopes, so the bridge is intentionally kept as reviewed `partial`
- the NI pilot source still does not isolate one-to-one legacy atoms for the two shared function-value prerequisites, so those two prerequisite closures are intentionally documented as retained `APV-201` bridges instead of being forced into weak new partial mappings

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the Niedersachsen Sek-II repository mapping fixture now parses cleanly with `1` row
- `npm run apply:applicability` changed `2` goals across `1` file while compiling the first NI upper-secondary derivative-entry route:
  - the two retained NI prerequisite leaves for direct and graph-based function-value work
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `190` accepted warnings
- full `./run_ci.sh` passed after the NI upper-secondary change-rate bridge pass

Interpretation:

- Niedersachsen upper-secondary math is now active on the shared canonical Analysis spine beyond source-only readiness
- the first NI E.2 route is now open, but only with the two explicit retained function-value prerequisite bridges documented in the accepted-warning registry
- the next Niedersachsen step should stay in the same upper-secondary E.2 corridor:
  - either `234dde5d-cc9d-4508-af9e-092e614ea304` against the next derivative-entry atom
  - or a small retained NI source split if that follow-on alignment turns out too broad

### 2026-03-20: NRW upper-secondary Q1.1 gains an exact area-function leaf

What changed:

- the canonical Q1.1 introduction cluster:
  - `93ac7fc8-6d83-5394-bbea-80758b463da1`
  now also contains the new NRW-backed leaf:
  - `9441bb35-2a2f-4edc-9d8a-bc58c257054d` (`Graphen von Flächeninhaltsfunktionen skizzieren`)
- the NRW upper-secondary source atom:
  - `371359c2-6e29-4863-879f-d53b044204ce`
  now maps `exact` to that new canonical leaf
- the repository-backed NRW upper-secondary mapping lane now carries `24` rows instead of `23`
- the canonical cluster weights were advanced along the affected ancestor chain:
  - `Q1.1 Einführung in die Integralrechnung`
  - `Q1 Analysis – Integralrechnung und Differenzialgleichungen`
  - root `Mathematik`

Why this cut:

- the imported NRW source clause is specific, assessable, and no longer just a retained open question in the integral corridor
- there was still no canonical leaf for sketching area-function graphs; keeping the clause unmapped would have preserved an artificial source gap even though the source wording is already clean enough for a leaf-level canonical atom
- the adjacent Hessen-only exp/log follow-on atom `c72a8032-71f6-56ed-a896-06ae435ff2ec` still has no comparably clean NRW source counterpart, so the better move here was to close the real NRW source gap instead of forcing another cross-state split

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `24` rows
- `npm run apply:applicability` changed `0` goals across `0` files because the new NRW area-function leaf already carried explicit applicability metadata
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `184` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary area-function step

Interpretation:

- NRW upper-secondary math now reaches the previously retained Flächeninhaltsfunktions-Klausel through an exact canonical Q1.1 leaf instead of leaving it as archived but unmapped source material
- the next clean NRW source-led decision is now the remaining broad E-phase atom `22e2cc01-be7c-4478-8d22-0409ff5b14a0` (`Eigenschaften ganzrationaler Funktionen bestimmen`), not the Hessen-only exp/log follow-on leaf

### 2026-03-20: NRW upper-secondary inverse-function lane closes the natural-logarithm breadth mismatch

What changed:

- the canonical LK atom:
  - `392440db-6a43-59c0-a48d-958128fa16a8`
  is no longer a single mixed-surface leaf for Hessen and NRW
- instead, it is now a small mixed-state cluster with:
  - `1e26404a-93ef-45f3-a28c-15679fbae96b` for the Hessen-exact leaf `Natürlichen Logarithmus als Umkehrfunktion verstehen (LK)`
  - `c15fe32d-1c83-4127-b1a4-9125af3d8f5d` for the NRW-exact leaf `Umkehrbarkeit ausgewählter Funktionen untersuchen und einfache Umkehrfunktionen bestimmen`
- the Hessen mapping:
  - `d603080f-0268-4da1-811a-b55ed05665ba`
  was repointed to the retained HE leaf
- the NRW mapping:
  - `85be691c-c569-4cdf-b332-b9d77d47666d`
  is now `exact` instead of `partial`
- the obsolete NRW `APV-202` entry for:
  - `392440db-6a43-59c0-a48d-958128fa16a8`
  was removed from the accepted-warning registry

Why this cut:

- the NRW source clause explicitly covers invertibility checks and simple inverse-function terms for selected functions, especially `e^x` and `ln(x)`
- the old canonical leaf was narrower and Hessen-specific in emphasis: deriving `ln(x)` from the inverse-function relation and solving simple exponential equations
- a small retained split removes the reviewed breadth mismatch without forcing the Hessen-specific `ln` surface onto NRW or broadening the Hessen leaf away from its source

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

### 2026-03-20: NRW upper-secondary inverse-graph lane closes through an exact wording cut

What changed:

- the canonical NRW-only inverse-graph leaf:
  - `dbc13bb0-963b-49a8-a441-2183f4b64c8e`
  was narrowed to the actual NRW source surface and no longer carries the stronger reflection-specific wording
- the NRW upper-secondary source atom:
  - `e0c4432f-fc34-48c2-84d8-0e998b978500`
  now maps `exact` instead of `partial`
- the obsolete NRW `APV-202` entry for:
  - `dbc13bb0-963b-49a8-a441-2183f4b64c8e`
  was removed from the accepted-warning registry
- the repository-backed mapping fixture was aligned to the exact cut, and one stale earlier exact expectation in the same NRW upper-secondary lane was corrected while closing the fixture drift

Why this cut:

- the NRW source clause isolates the relation between function graph and inverse graph, but it does not explicitly require the stronger reflection-at-`y=x` justification that had remained in the canonical wording
- because `dbc13bb0-963b-49a8-a441-2183f4b64c8e` was already the NRW-only leaf after the previous retained split, the cleaner move was to narrow that leaf to the source wording instead of adding another canonical child

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture still parses cleanly with `23` rows
- `npm run apply:applicability` changed `0` goals across `0` files because the canonical applicability state was already consistent; this step closed the repository-backed mapping and accepted-warning debt
- `npm run validate:view-filters` now reports `0` errors, `3` warnings, `184` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary inverse-graph exact cut

Interpretation:

- NRW no longer reaches the inverse-graph lane through a reviewed breadth mismatch; it now lands on an exact source-aligned canonical leaf
- the next clean NRW decision can return to the adjacent LK exp/log corridor and decide whether `c72a8032-71f6-56ed-a896-06ae435ff2ec` should remain HE-only or receive a shared follow-on split

Validation result:

- the repository-backed NRW upper-secondary mapping fixture still parses cleanly with `23` rows
- `npm run apply:applicability` changed `0` goals across `0` files because the split was modeled directly in the canonical graph and mappings
- `npm run validate:view-filters` now reports `0` errors, `3` warnings, `185` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary inverse-function split

Interpretation:

- NRW no longer reaches the natural-logarithm leaf through a reviewed breadth mismatch; it now lands on its own exact LK inverse-function leaf
- Hessen keeps its narrower exact `ln`-as-inverse surface instead of being widened down to the NRW wording
- the next clean NRW decision in the same lane is now the downstream inverse-graph atom `dbc13bb0-963b-49a8-a441-2183f4b64c8e`, which still rests on a reviewed `partial`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture still parses cleanly with `23` rows
- `npm run apply:applicability` changed `0` goals across `0` files because the split was modeled directly in the canonical graph and mappings
- `npm run validate:view-filters` now reports `0` errors, `3` warnings, `186` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary tangent/angle split

Interpretation:

- NRW no longer reaches the old tangent-equation atom through a reviewed breadth-mismatch; it now lands on its own exact E-phase leaf
- Bavaria keeps its exact tangent-equation surface instead of being broadened down to the NRW wording
- the next clean NRW decision can return to the adjacent LK exp/log lane and decide whether `c72a8032-71f6-56ed-a896-06ae435ff2ec` should remain HE-only or receive a shared follow-on split

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `22` rows
- `npm run apply:applicability` changed `1` goal across `1` file: the retained canonical parameter cluster `e7c9a459-52d1-5e29-8714-2b038c4d3a7f` now compiles `DE-NW` visibility through child-union
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `187` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary parameter-corridor step

Interpretation:

- NRW upper-secondary math now reaches the shared Q2.1 parameter corridor through two exact source-backed leaves instead of forcing the already imported NRW clauses onto the old broad Hessen atom
- the clean move here was a retained cluster split that keeps Hessen exact, gives NRW one exact GK/shared parameter-determination leaf plus one exact LK function-family leaf, and avoids adding fresh accepted-warning debt
- the cleaner next NRW move is now the adjacent LK clause `d9121fe6-058a-4ab8-a8ce-68d6eefea520` (`Produktregel, Kettenregel und zusammengesetzte Funktionen nutzen`) in the same retained `2.4.2` corridor

### 2026-03-20: NRW upper-secondary reaches the shared LK product-/chain-rule leaf

What changed:

- the canonical Q2.1 cluster:
  - `5ebfc509-0b4c-5c60-befb-2477eb24d4b5`
  now also contains the new LK leaf:
  - `899ed286-0cc2-4d6d-ba46-7d4e40a11f41` (`Produktregel, Kettenregel und zusammengesetzte Funktionen nutzen (LK)`)
- that new canonical leaf was added directly instead of forcing the NRW LK clause onto the Hessen-only exp/log-combination atom:
  - `c72a8032-71f6-56ed-a896-06ae435ff2ec`
- the NRW upper-secondary source atom:
  - `d9121fe6-058a-4ab8-a8ce-68d6eefea520`
  now maps `exact` to the new canonical LK leaf
- the NRW upper-secondary mapping lane now carries `23` rows instead of `22`
- no new accepted-warning entries were needed for this slice; the new LK rule/application lane closes through an exact mapping

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- the repository-backed NRW upper-secondary mapping fixture now parses cleanly with `23` rows
- `npm run apply:applicability` changed `0` goals across `0` files because the new NRW LK leaf was already modeled directly in the canonical file before the compiler pass
- `npm run validate:view-filters` remains at `0` errors, `3` warnings, `187` accepted warnings
- full `./run_ci.sh` passed after the NRW upper-secondary LK product-/chain-rule step

Interpretation:

- NRW upper-secondary math now reaches not only the shared parameter and inverse-function corridor in Q2.1, but also an explicit LK technique leaf for product rule, chain rule, and composed functions
- the clean move here was a small new canonical LK leaf: the NRW source clause is broader than a pure derivative-rule atom, but still not aligned enough to justify widening the Hessen-only exp/log-combination leaf
- the next NRW decision should stay in the same LK corridor and examine whether the adjacent Hessen-only atom `c72a8032-71f6-56ed-a896-06ae435ff2ec` now justifies a shared follow-on split, or should remain HE-only for the moment

### 2026-03-20: NRW upper-secondary tangent/angle lane closes through an exact split

What changed:

- the canonical E-phase tangent atom:
  - `bb979dbd-b080-432c-8cf1-067ba6eff381`
  is no longer a single mixed-surface leaf for Bavaria and NRW
- instead, it is now a small mixed-state cluster with:
  - `0264591c-fdd7-41c6-9fb9-7cb3a03f7658` (`Tangentengleichungen und Steigungswinkel bestimmen`) for the Bavaria-exact surface
  - `6aed5be9-f62f-482a-9b98-4253c3275e6e` (`Sekanten-, Tangenten- und Normalensteigungen mit Steigungswinkeln bestimmen`) for the NRW-exact surface
- the Bavaria mapping:
  - `28e3394e-90d7-5812-8b7b-2c55558468ad`
  was repointed from the old shared atom to the new Bavaria-exact child
- the NRW mapping:
  - `43b21038-8dbb-4f85-ab8e-898a9cef38fb`
  is now `exact` instead of `partial`
- the obsolete NRW `APV-202` entry for:
  - `bb979dbd-b080-432c-8cf1-067ba6eff381`
  was removed from the accepted-warning registry

Why this cut:

- the NRW source clause explicitly covers secant, tangent, and normal slopes plus slope angles, but not tangent equations
- the Bavaria source clause explicitly covers tangent equations plus slope angles
- a small canonical split removes the reviewed breadth-mismatch without weakening either source surface

Validation used:

- `npm run validate:graph`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `npm run apply:applicability`
- `npm run validate:view-filters`
- `./run_ci.sh`

### 2026-04-14: Niedersachsen Physics widens the E-phase dynamics lane onto energy and experiments

What changed:

- the Niedersachsen upper-secondary Physics source snapshot:
  - `730a6dbb-7ddb-486b-8ac8-dd9e58e3d113`
  now also contains the adjacent E-phase source cluster:
  - `4d00b658-4c32-4123-96e3-779a186ab031` (`Einfuehrungsphase: Dynamik - Energie und Experimente`)
- that new source strip imports four new leaves from the same KC `Dynamik` pages:
  - `292f99ef-0bd8-43df-b9a8-bf47d3293bd1` (`Kinetische Energie nennen und in einfachen Situationen berechnen`)
  - `1f1f08e8-2845-4758-ae2f-f977748d0b5d` (`Energieerhaltungssatz der Mechanik formulieren und in einfachen Situationen nutzen`)
  - `c53ea281-1bfb-4e97-8a2a-a81b023ded24` (`Einfache Experimente zum Energieerhaltungssatz planen, durchfuehren und dokumentieren`)
  - `e4bafbf9-6875-4129-9e40-4aa6a6b35402` (`Energienutzung und Nachhaltigkeit mit einem einfachen Bewertungsverfahren einordnen`)
- the repository-backed Niedersachsen Physics mapping lane:
  - `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_to_canonical_physics.json`
  now carries `12` reviewed rows instead of `9`
- the three new reviewed bridges are:
  - `292f99ef-0bd8-43df-b9a8-bf47d3293bd1` -> `7eeff2de-6015-49a6-a96e-a488d886dc9f` (`Kinetische Energie`) (`partial`)
  - `1f1f08e8-2845-4758-ae2f-f977748d0b5d` -> `91c49019-ea51-4ce5-a919-c91c45b25e83` (`Energieerhaltung`) (`partial`)
  - `c53ea281-1bfb-4e97-8a2a-a81b023ded24` -> `91c49019-ea51-4ce5-a919-c91c45b25e83` (`Energieerhaltung`) (`partial`)
- the fourth new Niedersachsen source leaf:
  - `e4bafbf9-6875-4129-9e40-4aa6a6b35402`
  stays intentionally source-led, because the currently available shared thermodynamics evaluation goals would overclaim the narrower Niedersachsen wording on a simple Bewertungsverfahren around Energienutzung and Nachhaltigkeit

Why this cut:

- the active Niedersachsen Physics lane was already anchored on the shared E-phase `Dynamik` strip, and the next clean adjacent move on the same KC pages was the energy/experiment surface on page `28`
- the three new mapped leaves land conservatively on already existing shared canonical energy goals, so the widening does not need new canonical Physics atoms
- the sustainability-related Bewertungsblatt was imported into the source snapshot to keep provenance honest, but not forced onto the broader thermodynamics/climate evaluation surface before wider reviewed evidence exists

Validation used:

- `node -e "for (const p of process.argv.slice(1)) JSON.parse(require('fs').readFileSync(p,'utf8'));" ...`
- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Interpretation:

- Niedersachsen upper-secondary Physics now reaches not only the shared E-phase motion strip but also the first adjacent shared energy strip on `Kinetische Energie` and `Energieerhaltung`
- the clean move here was to keep the widening on the same explicit KC pages and to avoid inventing a premature Niedersachsen-specific learner-facing view or new canonical Physics atoms
- the next clean Niedersachsen move should now leave the exhausted E-phase mechanics starter and open the first equally explicit qualification-phase anchor such as `Elektrizitaet` or `Schwingungen und Wellen`, unless the remaining sustainability-only Bewertungsblatt is intentionally resolved first

### 2026-04-14: Niedersachsen Physics opens the first qualification-phase electricity anchor

What changed:

- the Niedersachsen upper-secondary Physics source snapshot:
  - `730a6dbb-7ddb-486b-8ac8-dd9e58e3d113`
  now also contains the first qualification-phase source cluster:
  - `f32b91d4-8691-408c-9417-8e34e4e3d87b` (`Qualifikationsphase: Elektrizitaet - Potenzial und Kondensator`)
- that new source strip imports seven new leaves from the Niedersachsen `Elektrizitaet` pages:
  - `81f12b68-a361-4b89-8759-735bb2b2526f` (`Zusammenhang zwischen Ladung und elektrischer Stromstaerke beschreiben`)
  - `7757d083-2261-44bc-99c9-9195d0e38586` (`Elektrische Spannung als Energie pro Ladung deuten`)
  - `afabf0e1-22a9-446d-b84f-d760bb7a28c6` (`Feldstaerke im Plattenkondensator mit der anliegenden Spannung verknuepfen`)
  - `8f272d0a-231d-4646-ae46-29dc67000878` (`Energiebilanz fuer geladene Koerper im elektrischen Feld eines Plattenkondensators angeben`)
  - `5d1eb42c-1b2c-43e1-a53d-856e817100ed` (`Auf- und Entladevorgaenge eines Kondensators ueber t-I-Zusammenhaenge beschreiben`)
  - `dce1062a-2503-4e99-b30a-a500dd271a2f` (`Kapazitaet eines Kondensators grundlegend angeben und in einfachen Bestimmungen nutzen`)
  - `7fab7a9c-c2f0-456e-8ede-389aa47257af` (`Gleichung fuer die Energie des elektrischen Feldes eines Plattenkondensators nennen`)
- the repository-backed Niedersachsen Physics mapping lane:
  - `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_to_canonical_physics.json`
  now carries `20` reviewed rows instead of `12`
- the new reviewed bridges are:
  - `f32b91d4-8691-408c-9417-8e34e4e3d87b` -> `0895074d-c4af-56ea-88dd-ae0fdae443ed` (`Potenzial und Kondensator`) (`partial`)
  - `81f12b68-a361-4b89-8759-735bb2b2526f` -> `bbee4c52-4e95-5529-990f-706aa99316a3` (`Stromstärke als Ladungstransport`) (`partial`)
  - `7757d083-2261-44bc-99c9-9195d0e38586` -> `1730c01d-8c85-57df-b031-c11e2a0511b1` (`Arbeit, Spannung und Potenzial im E-Feld`) (`partial`)
  - `afabf0e1-22a9-446d-b84f-d760bb7a28c6` -> `9f59a088-3939-59e9-821d-167fadfda782` (`Kondensator und Feld im Plattenkondensator`) (`partial`)
  - `8f272d0a-231d-4646-ae46-29dc67000878` -> `1730c01d-8c85-57df-b031-c11e2a0511b1` (`Arbeit, Spannung und Potenzial im E-Feld`) (`partial`)
  - `5d1eb42c-1b2c-43e1-a53d-856e817100ed` -> `0b4f2020-8486-5372-9cb9-6e59f698ac2d` (`Auf- und Entladen eines Kondensators`) (`partial`)
  - `dce1062a-2503-4e99-b30a-a500dd271a2f` -> `9f59a088-3939-59e9-821d-167fadfda782` (`Kondensator und Feld im Plattenkondensator`) (`partial`)
  - `7fab7a9c-c2f0-456e-8ede-389aa47257af` -> `fd9fd8ad-c4a1-5552-9ea0-1878e0636f20` (`Energie des elektrischen Feldes`) (`partial`)

Why this cut:

- the active Niedersachsen Physics lane had reached the limit of the initial E-phase mechanics starter, so the next clean widening needed to leave the same KC page pair and open the first equally explicit qualification-phase surface
- the Niedersachsen wording on pages `33-34` aligns conservatively with already existing shared canonical Q1 electricity goals, so the widening can stay within the current canonical Physics graph without inventing Niedersachsen-specific atoms
- the magnetische-Felder / Lorentzkraft / Wien-Filter strip on the following page is clearly adjacent, but it is a better follow-on after the field/potential/capacitor base has been opened explicitly

Validation used:

- `node -e "for (const p of process.argv.slice(1)) JSON.parse(require('fs').readFileSync(p,'utf8'));" ...`
- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Interpretation:

- Niedersachsen upper-secondary Physics now reaches not only the shared E-phase motion and energy strip but also the first shared Q1 electricity strip on current/voltage/potential/capacitor surfaces
- the clean move here was to open the qualification-phase route without broadening into magnetische Felder or inventing new canonical Physics atoms
- the next clean Niedersachsen move should now stay on this opened qualification-phase route and go deeper into `Elektrizitaet` (`magnetische Felder`, `Lorentzkraft`, `Wien-Filter`) or, if a parallel anchor is more useful, open `Schwingungen und Wellen`

### 2026-04-14: Niedersachsen Physics extends the qualification-phase electricity lane onto magnet fields and free electrons

What changed:

- the Niedersachsen upper-secondary Physics source snapshot:
  - `730a6dbb-7ddb-486b-8ac8-dd9e58e3d113`
  now also contains the adjacent qualification-phase source cluster:
  - `cc2183ef-1878-40da-a00b-5f6c3e4cc1fd` (`Qualifikationsphase: Elektrizitaet - Magnetfeld und freie Elektronen`)
- that new source strip imports six new leaves from the Niedersachsen `Elektrizitaet` page `35`:
  - `59da0142-1d54-40b5-bcda-93fded9a3ef5` (`Magnetische Felder mit Kompassnadeln beschreiben und Feldrichtungen bestimmen`)
  - `90fcb135-5573-43a4-9309-f6f488f9e360` (`Leiterkraft im homogenen Magnetfeld bestimmen und magnetische Flussdichte deuten`)
  - `f9525247-5349-4202-96ca-b88eb1fa2cab` (`Lorentzkraft auf freie Elektronen beschreiben und Bahnformen begruenden`)
  - `89b0d282-76a2-44c2-92ea-a1d684b4b1f8` (`Elektronenbahnen im homogenen Magnetfeld auf andere geladene Teilchen uebertragen`)
  - `3b71a64f-683a-47df-b656-d8fd430e4c45` (`Freie Elektronen im homogenen elektrischen Querfeld und im Wien-Filter beschreiben`)
  - `0966258c-1eaa-4c41-8311-17352dcf0ec1` (`Spezifische Ladung von Elektronen mit dem Fadenstrahlrohr einordnen`)
- the repository-backed Niedersachsen Physics mapping lane:
  - `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_to_canonical_physics.json`
  now carries `25` reviewed rows instead of `20`
- the new reviewed bridges are:
  - `cc2183ef-1878-40da-a00b-5f6c3e4cc1fd` -> `13e882bd-2fc6-59c6-a2a8-32eb1fbf1751` (`Magnetisches Feld`) (`partial`)
  - `59da0142-1d54-40b5-bcda-93fded9a3ef5` -> `0f6b798b-594e-5480-8c5f-95e2486a4d85` (`Magnetische Felder und Feldlinienbilder`) (`partial`)
  - `90fcb135-5573-43a4-9309-f6f488f9e360` -> `c6355a22-24cf-5d8b-88af-ea11711460fb` (`Kraft auf stromdurchflossene Leiter`) (`partial`)
  - `f9525247-5349-4202-96ca-b88eb1fa2cab` -> `8c9394cb-f54a-508d-9750-4c49e31b3fa9` (`Lorentzkraft auf freie Ladungen`) (`partial`)
  - `89b0d282-76a2-44c2-92ea-a1d684b4b1f8` -> `9854589c-5feb-4942-b90f-311ddf36eb78` (`Geladene Teilchen in homogenen magnetischen Feldern untersuchen`) (`partial`)
- the two remaining source leaves:
  - `3b71a64f-683a-47df-b656-d8fd430e4c45`
  - `0966258c-1eaa-4c41-8311-17352dcf0ec1`
  stay intentionally source-led, because the current shared canonical graph does not yet isolate a reviewed crossed-field/`Wien-Filter` target or the narrower eA `Fadenstrahlrohr` target

Why this cut:

- after opening the first Niedersachsen Q1 potential/capacitor strip, the next equally explicit adjacent KC move was the page-35 magnetic-field/electron-trajectory surface, not yet the broader page-36 induction layer
- the reviewed part of this source strip lands conservatively on already existing shared magnetic-field goals, so the widening still does not need new canonical Physics atoms
- the crossed-field and `Fadenstrahlrohr` clauses were imported into the source snapshot to keep provenance honest, but left unmapped because the current shared canonical Physics graph does not yet expose a sufficiently narrow reviewed target

Validation used:

- `node -e "for (const p of process.argv.slice(1)) JSON.parse(require('fs').readFileSync(p,'utf8'));" ...`
- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Interpretation:

- Niedersachsen upper-secondary Physics now reaches not only the shared Q1 potential/capacitor strip but also the first shared magnetic-field strip on field-line description, conductor force, Lorentzkraft, and simple charged-particle motion
- the clean move here was to keep widening on the same explicit KC route while leaving crossed-field/`Wien-Filter` and `Fadenstrahlrohr` residues source-led
- the next clean Niedersachsen move should now most plausibly open the adjacent page-36 `Induktion` strip (`Hallsonde`, `Spule`, `Induktionsspannung`) or revisit the current source-led residues only if broader reviewed shared targets become justified

### 2026-04-14: Niedersachsen Physics opens the adjacent page-36 induction strip without adding new canonical atoms

What changed:

- the Niedersachsen upper-secondary Physics source snapshot:
  - `730a6dbb-7ddb-486b-8ac8-dd9e58e3d113`
  now also contains the adjacent qualification-phase source cluster:
  - `80a48714-a00c-4df7-9781-abe13212d1e2` (`Qualifikationsphase: Elektrizitaet - Spule, Hallsonde und Induktion`)
- that new source strip imports six new leaves from the Niedersachsen `Elektrizitaet` page `36`:
  - `17f451db-df50-4aa8-98ec-9760529df3fd` (`Magnetische Flussdichte bei Spulen mit einer Hallsonde experimentell messen`)
  - `6287ed0a-90d4-4b1a-bc26-b656de38c916` (`Magnetische Flussdichte bei einer Spule qualitativ von I, n, l und mu_r abhaengig beschreiben`)
  - `aa0c5e7a-4026-47a7-ab7c-331a2eba3115` (`Magnetfeldlinienbilder fuer geraden Leiter und Spule skizzieren`)
  - `3002d429-c5ee-4b49-b00b-a3e49f926895` (`Induktionsspannung qualitativ mithilfe des magnetischen Flusses beschreiben`)
  - `82b1744d-940a-4c3b-bef9-b64b72040fa0` (`Versuche und Diagramme zum Induktionsgesetz bei linearen A- oder B-Aenderungen auswerten`)
  - `faf57450-d634-4a43-96ff-0fbeb3c5c12b` (`Eine technische Anwendung der Induktion qualitativ beschreiben`)
- the repository-backed Niedersachsen Physics mapping lane:
  - `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_to_canonical_physics.json`
  now carries `31` reviewed rows instead of `25`
- the six new reviewed bridges are:
  - `17f451db-df50-4aa8-98ec-9760529df3fd` -> `106417ed-80db-5490-a1ee-bb4160d3f2b4` (`Magnetfeld von geradem Leiter und Spule`) (`partial`)
  - `6287ed0a-90d4-4b1a-bc26-b656de38c916` -> `106417ed-80db-5490-a1ee-bb4160d3f2b4` (`Magnetfeld von geradem Leiter und Spule`) (`partial`)
  - `aa0c5e7a-4026-47a7-ab7c-331a2eba3115` -> `0f6b798b-594e-5480-8c5f-95e2486a4d85` (`Magnetische Felder und Feldlinienbilder`) (`partial`)
  - `3002d429-c5ee-4b49-b00b-a3e49f926895` -> `1a037489-3c95-540b-8cae-0acd360358ee` (`Induktion durch Änderung des magnetischen Flusses`) (`partial`)
  - `82b1744d-940a-4c3b-bef9-b64b72040fa0` -> `eb1ea150-ec6c-5000-bce3-f46c820dccf8` (`Induktionsgesetz und Lenz’sche Regel`) (`partial`)
  - `faf57450-d634-4a43-96ff-0fbeb3c5c12b` -> `fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c` (`Technische Anwendungen des Induktionsgesetzes qualitativ beschreiben`) (`partial`)
- the widened shared applicability surface now also reaches the existing canonical induction strip:
  - `106417ed-80db-5490-a1ee-bb4160d3f2b4` (`Magnetfeld von geradem Leiter und Spule`)
  - `1a037489-3c95-540b-8cae-0acd360358ee` (`Induktion durch Änderung des magnetischen Flusses`)
  - `eb1ea150-ec6c-5000-bce3-f46c820dccf8` (`Induktionsgesetz und Lenz’sche Regel`)
  - `fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c` (`Technische Anwendungen des Induktionsgesetzes qualitativ beschreiben`)
  - `b2b74d0a-575c-5c6b-8e24-b0b0f32c1126` (`Induktion und elektromagnetische Schwingungen`)
  - `fcefb129-ad4c-50a2-9762-a910caa1af16` (`Q2 Schwingungen, Induktion und mechanische Wellen`)
- four new Niedersachsen-specific `APV-202` entries were added for the intentionally broader partial bridges on the shared induction strip:
  - `106417ed-80db-5490-a1ee-bb4160d3f2b4`
  - `1a037489-3c95-540b-8cae-0acd360358ee`
  - `eb1ea150-ec6c-5000-bce3-f46c820dccf8`
  - `fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c`

Why this cut:

- after the reviewed page-35 magnet-field strip, the next equally explicit adjacent KC move was the page-36 induction surface on coils, Hall-probe measurements, first flux-based induction, and one simple induction application
- all six reviewed bridges land on already existing shared canonical magnetic-field or induction targets, so the widening stays inside the current canonical Physics graph and does not justify new Niedersachsen-specific atoms
- the imported page-36 source is still only partially exhausted: narrower eA residue around Hall voltage, differential/sinusoidal induction, and self-induction exists, but was not forced into the current wider shared targets

Validation used:

- `node -e "for (const p of process.argv.slice(1)) JSON.parse(require('fs').readFileSync(p,'utf8'));" ...`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Interpretation:

- Niedersachsen upper-secondary Physics now reaches not only the shared Q1 electricity and magnetic-field strip but also the first shared induction strip on coil fields, flux-based induction, induction-law reading, and one simple technical application
- the clean move here was to keep widening on the same explicit KC route while still avoiding new canonical Physics atoms or Niedersachsen-specific composition views
- the next clean Niedersachsen move should now either continue on the remaining page-36 eA induction residue (`Hallspannung`, differential/sinusoidal induction, `Selbstinduktion`) or open a parallel reviewed anchor such as `Schwingungen und Wellen`

### 2026-04-14: Niedersachsen Physics closes the remaining page-36 eA induction residue on the shared LK surface

What changed:

- the Niedersachsen upper-secondary Physics source snapshot:
  - `730a6dbb-7ddb-486b-8ac8-dd9e58e3d113`
  now widens the existing page-36 source cluster:
  - `80a48714-a00c-4df7-9781-abe13212d1e2` (`Qualifikationsphase: Elektrizitaet - Spule, Hallsonde und Induktion`)
  from `6` to `10` imported leaves
- the four new imported LK leaves are:
  - `2b8672fa-0558-4592-963a-8b5d5ec50699` (`Hallspannung aus der Driftgeschwindigkeit anhand einer Skizze herleiten`)
  - `dc61b9c2-1c4d-4ac7-bab1-929504433e43` (`Induktionsgesetz in differenzieller Form fuer lineare und sinusfoermige Flussaenderungen anwenden`)
  - `4c9164a4-aa58-419d-85cf-e39dc5446a83` (`Selbstinduktion beim Ein- und Ausschalten von Spulen erklaeren und Induktivitaet definieren`)
  - `89d75af3-ae18-4417-a0ac-5228639c10f7` (`Energie des magnetischen Feldes einer Spule angeben und Spulen als Energiespeicher beschreiben`)
- the repository-backed Niedersachsen Physics mapping lane:
  - `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_to_canonical_physics.json`
  now carries `35` reviewed rows instead of `31`
- the four new reviewed bridges are:
  - `2b8672fa-0558-4592-963a-8b5d5ec50699` -> `b39ae8fb-4358-5866-8adf-3d5365368eeb` (`Hall-Effekt anwenden`) (`partial`)
  - `dc61b9c2-1c4d-4ac7-bab1-929504433e43` -> `d18d4190-ddc1-5181-b1b6-e79947b737c2` (`Induktionsgesetz in Differenzialform`) (`partial`)
  - `4c9164a4-aa58-419d-85cf-e39dc5446a83` -> `37f28bc4-def2-57cf-a06b-191dfd228205` (`Selbstinduktion und Induktivität`) (`partial`)
  - `89d75af3-ae18-4417-a0ac-5228639c10f7` -> `a1389d4e-dc97-5557-babe-a31a2bd57217` (`Energie gespeicherter Magnetfelder`) (`partial`)
- the source provenance for Niedersachsen Physics now widens to `40` imported source goals and `34` atomic descendants on the source root
- after applicability compilation, `DE-NI` is now also visible on the four shared LK follow-on leaves:
  - `b39ae8fb-4358-5866-8adf-3d5365368eeb` (`Hall-Effekt anwenden`)
  - `d18d4190-ddc1-5181-b1b6-e79947b737c2` (`Induktionsgesetz in Differenzialform`)
  - `37f28bc4-def2-57cf-a06b-191dfd228205` (`Selbstinduktion und Induktivität`)
  - `a1389d4e-dc97-5557-babe-a31a2bd57217` (`Energie gespeicherter Magnetfelder`)
- four new Niedersachsen-specific `APV-202` entries were added for these intentionally broader partial bridges:
  - `b39ae8fb-4358-5866-8adf-3d5365368eeb`
  - `d18d4190-ddc1-5181-b1b6-e79947b737c2`
  - `37f28bc4-def2-57cf-a06b-191dfd228205`
  - `a1389d4e-dc97-5557-babe-a31a2bd57217`

Why this cut:

- after the reviewed page-36 GK strip was open, the remaining adjacent source work was no longer a new thematic route but only the LK residue on Hallspannung, differential-form induction, self-induction, and magnetic field energy
- those four clauses now land conservatively on already existing shared LK atoms, so the NI lane closes the page-36 route without inventing new canonical Physics atoms
- this also removes the need to keep pointing at a still-open page-36 eA remainder in the rollout tracker; the next clean move can now leave `Elektrizitaet`

Validation used:

- `node -e \"for (const p of process.argv.slice(1)) JSON.parse(require('fs').readFileSync(p,'utf8'));\" ...`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Interpretation:

- Niedersachsen upper-secondary Physics now closes the full reviewed page-36 electricity route from coil fields and first induction up to the available shared LK follow-on leaves
- the clean move here was to keep the widening on the same explicit KC page while still avoiding new canonical Physics atoms or Niedersachsen-specific composition views
- the next clean Niedersachsen move should now leave `Elektrizitaet` and open `Schwingungen und Wellen`; the older `Querfeld`/`Wien-Filter` and `Fadenstrahlrohr` residues remain optional cleanup only if broader reviewed shared targets become justified

### 2026-04-14: Niedersachsen Physics opens the first reviewed Q2 oscillation strip on the shared Schwingungsflaeche

What changed:

- the Niedersachsen upper-secondary Physics source snapshot:
  - `730a6dbb-7ddb-486b-8ac8-dd9e58e3d113`
  now adds the new source cluster:
  - `4f738cef-9b3b-4ebd-83a7-e0723b93256a` (`Qualifikationsphase: Schwingungen - mechanische und elektromagnetische Schwingungen`)
  with `9` imported leaves
- the nine new imported leaves are:
  - `a213645d-2f77-4e68-83b6-a84986a6bdff` (`Harmonische Schwingungen grafisch darstellen und mit Auslenkung, Amplitude, Periodendauer und Frequenz beschreiben`)
  - `ade0c38e-ebf6-440f-8f54-e934358ae2fa` (`Periodendauer eines Feder-Masse-Pendels angeben und experimentelle Abhaengigkeiten ueberpruefen`)
  - `5c426b0f-df26-4bcc-b481-c76058324a16` (`Lineares Kraftgesetz als Bedingung einer mechanischen harmonischen Schwingung nennen`)
  - `0be87521-0bdd-4d4e-acbc-70be73934d4d` (`Energieumwandlungen beim Feder-Masse-Pendel beschreiben`)
  - `2fc1c704-0e36-4049-97e3-f7fb99d15f34` (`Gedaempfte Schwingungen in t-s- und t-v-Diagrammen deuten`)
  - `845db953-8702-4426-96fb-eb90baf7986c` (`Resonanz bei erzwungenen Schwingungen anhand eines Experiments erlaeutern`)
  - `57fadc9a-c0ed-419d-8813-9b97d879e7f8` (`Elektromagnetischen Schwingkreis beschreiben und Schwingungsgroessen aus Messdaten bestimmen`)
  - `62cc5ced-563a-4f83-88bf-a9a50dde85c2` (`Energieumwandlungen und Resonanzkurve im elektromagnetischen Schwingkreis beschreiben`)
  - `420a2faf-45bb-4a69-8062-73ec84838e95` (`Kapazitaetsabhaengigkeit der Eigenschwingung experimentell bestimmen und die Thomsonsche Schwingungsgleichung nennen`)
- the repository-backed Niedersachsen Physics mapping lane:
  - `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_to_canonical_physics.json`
  now carries `44` reviewed rows instead of `35`
- the nine new reviewed bridges are:
  - `a213645d-2f77-4e68-83b6-a84986a6bdff` -> `fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e` (`Charakteristische Schwingungsgrößen`) (`partial`)
  - `ade0c38e-ebf6-440f-8f54-e934358ae2fa` -> `d03f1cb6-c224-53db-ad91-76cc7827978d` (`Harmonische Schwingung verstehen`) (`partial`)
  - `5c426b0f-df26-4bcc-b481-c76058324a16` -> `05af2893-0201-4d7f-985b-272d7b88e26e` (`Lineare Rückstellkraft bei harmonischen Schwingungen beschreiben`) (`partial`)
  - `0be87521-0bdd-4d4e-acbc-70be73934d4d` -> `78cf6eff-b3bc-5444-9ef8-5d39dae8d17d` (`Energie und Energieerhaltung in Schwingungen`) (`partial`)
  - `2fc1c704-0e36-4049-97e3-f7fb99d15f34` -> `e6895bc3-fcbd-59ad-baef-a78c97a13e11` (`Gedämpfte Schwingungen beschreiben`) (`partial`)
  - `845db953-8702-4426-96fb-eb90baf7986c` -> `3efa0cda-f55b-5534-8fac-ffe1d312aed1` (`Erzwungene Schwingungen und Resonanz`) (`partial`)
  - `57fadc9a-c0ed-419d-8813-9b97d879e7f8` -> `ac4ba260-6086-5fcc-bea2-c06f1425a1cc` (`Elektromagnetischen Schwingkreis analysieren`) (`partial`)
  - `62cc5ced-563a-4f83-88bf-a9a50dde85c2` -> `ac4ba260-6086-5fcc-bea2-c06f1425a1cc` (`Elektromagnetischen Schwingkreis analysieren`) (`partial`)
  - `420a2faf-45bb-4a69-8062-73ec84838e95` -> `f36a5946-f2a8-59b8-b3bd-a2f246defa4f` (`Thomson’sche Schwingungsgleichung nutzen`) (`partial`)
- the source provenance for Niedersachsen Physics now widens to `50` imported source goals and `43` atomic descendants on the source root
- after applicability compilation, `DE-NI` is now also visible on the eight shared oscillation leaves:
  - `d03f1cb6-c224-53db-ad91-76cc7827978d` (`Harmonische Schwingung verstehen`)
  - `fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e` (`Charakteristische Schwingungsgrößen`)
  - `05af2893-0201-4d7f-985b-272d7b88e26e` (`Lineare Rückstellkraft bei harmonischen Schwingungen beschreiben`)
  - `78cf6eff-b3bc-5444-9ef8-5d39dae8d17d` (`Energie und Energieerhaltung in Schwingungen`)
  - `e6895bc3-fcbd-59ad-baef-a78c97a13e11` (`Gedämpfte Schwingungen beschreiben`)
  - `3efa0cda-f55b-5534-8fac-ffe1d312aed1` (`Erzwungene Schwingungen und Resonanz`)
  - `ac4ba260-6086-5fcc-bea2-c06f1425a1cc` (`Elektromagnetischen Schwingkreis analysieren`)
  - `f36a5946-f2a8-59b8-b3bd-a2f246defa4f` (`Thomson’sche Schwingungsgleichung nutzen`)
- eight new Niedersachsen-specific `APV-202` entries were added for these intentionally broader partial bridges:
  - `d03f1cb6-c224-53db-ad91-76cc7827978d`
  - `fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e`
  - `05af2893-0201-4d7f-985b-272d7b88e26e`
  - `78cf6eff-b3bc-5444-9ef8-5d39dae8d17d`
  - `e6895bc3-fcbd-59ad-baef-a78c97a13e11`
  - `3efa0cda-f55b-5534-8fac-ffe1d312aed1`
  - `ac4ba260-6086-5fcc-bea2-c06f1425a1cc`
  - `f36a5946-f2a8-59b8-b3bd-a2f246defa4f`

Why this cut:

- after the reviewed `Elektrizitaet` route was exhausted, the next equally explicit source move was no longer another electricity cleanup but the first narrow Q2 `Schwingungen` surface on pages `37-38`
- the imported source already aligns conservatively with existing shared Q2 oscillation leaves, so the corridor can widen without inventing new canonical Physics atoms
- keeping `Wellen` separate preserves a clean next move instead of mixing two adjacent but still distinguishable source surfaces into one oversized NI cut

Validation used:

- `node -e \"for (const p of process.argv.slice(1)) JSON.parse(require('fs').readFileSync(p,'utf8'));\" ...`
- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Interpretation:

- Niedersachsen upper-secondary Physics now reaches the first shared Q2 oscillation strip while still keeping the active lane narrow, reviewed, and free of Niedersachsen-specific canonical atom authoring
- the clean move here was to open only `Schwingungen`, not immediately the adjacent `Wellen` surface, because the source still separates mechanical/electromagnetic oscillations from the later interference and wave-phenomena blocks
- the next clean Niedersachsen move should now continue from this opened Q2 strip onto `Wellen`; the older `Querfeld`/`Wien-Filter` and `Fadenstrahlrohr` residues remain optional cleanup only if broader reviewed shared targets become justified

### 2026-04-15: Niedersachsen Physics exacts no new atom but closes the Michelson residue on the shared interferometer surface

What changed:

- the repository-backed Niedersachsen Physics mapping lane:
  - `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_to_canonical_physics.json`
  now carries `54` reviewed rows instead of `53`
- one new reviewed bridge was added:
  - `35bbb17f-d9be-4e2e-ab00-86f8d52d7cb0` (`Michelson-Interferometer zum Nachweis kleiner Laengenaenderungen einordnen`)
    -> `d1e26b52-78a7-5f3b-ac9f-97f3e62d7db1` (`Interferometer verstehen`) (`partial`)
- no Niedersachsen source snapshot widening was needed in this step:
  - the retained NI `Michelson` atom was already present inside the imported `Wellen` strip
- no new canonical Physics atom was introduced:
  - the move reuses the existing shared Q3 leaf `Interferometer verstehen`
- after applicability compilation, `DE-NI` is now also visible on:
  - `d1e26b52-78a7-5f3b-ac9f-97f3e62d7db1` (`Interferometer verstehen`)
  - and thereby also on the parent clusters `Elektromagnetische Wellen` and `Q3 Elektromagnetische Wellen und Quantenphysik`
- thirteen Niedersachsen-specific `APV-202` entries are now documented for the widened NI `Wellen`/`Michelson` surface:
  - seven shared Physics wave/optics leaves: `cb0ced6d-b7c1-5b7d-9922-8c394f6030e8`, `d716a35e-e422-5aba-b39a-f2e22f1e1e74`, `d5772db3-120c-5c37-ab46-2336d02236b0`, `91683676-01cf-5003-80fa-a04d043b4e61`, `4a7cbe83-b694-57d3-85ce-1eeca418daaf`, `549269d3-1aef-5c55-9640-ee2a8e2ee9a1`, `81c0d811-e6de-5489-8415-3b257c734a2e`
  - five shared cross-subject math prerequisites pulled by the same optics route: `c1f50bcc-7848-4e49-b9de-0ec030cc6bca`, `af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186`, `e322310f-f33a-485d-bc23-2412a6b8fa12`, `9023226b-fc17-412b-807c-2bb45cd551d5`, `a7ccb7a9-6fb0-4e2d-b6e0-6420cc5ae0bf`
  - plus the new interferometer leaf `d1e26b52-78a7-5f3b-ac9f-97f3e62d7db1`

Why this cut:

- after the reviewed NI `Wellen` strip, the only remaining source-led residue on that already opened topic row was the imported `Michelson` leaf
- unlike the still source-led `Querfeld`/`Wien-Filter` and `Fadenstrahlrohr` residues, the canonical Physics graph now already exposes a sufficiently narrow reviewed target with `Interferometer verstehen`
- this closes the active NI `Schwingungen`/`Wellen` row without forcing Niedersachsen-specific canonical atom growth

Validation used:

- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Interpretation:

- Niedersachsen upper-secondary Physics now closes the first retained `Schwingungen`/`Wellen` row on the active topic-first maintenance surface without introducing new canonical atoms or Niedersachsen-specific composition views
- the clean move here was to reuse the already existing shared interferometer leaf instead of keeping `Michelson` source-led longer than necessary
- the remaining NI source-led Physics residues are now only the earlier `Querfeld`/`Wien-Filter` and `Fadenstrahlrohr` clauses

### 2026-04-15: Niedersachsen Physics reuses the shared electric-field particle-motion leaf for the crossed-field follow-on

What changed:

- the repository-backed Niedersachsen Physics mapping lane:
  - `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_to_canonical_physics.json`
  now carries `55` reviewed rows instead of `54`
- one new reviewed bridge was added:
  - `3b71a64f-683a-47df-b656-d8fd430e4c45` (`Freie Elektronen im homogenen elektrischen Querfeld und im Wien-Filter beschreiben`)
    -> `741774ef-15fc-4bcf-a370-e2c5cf4257d0` (`Geladene Teilchen in homogenen elektrischen Feldern untersuchen`) (`partial`)
- no Niedersachsen source snapshot widening was needed in this step:
  - the retained crossed-field / `Wien-Filter` atom was already present inside the imported qualification-phase `Elektrizitaet` strip
- no new canonical Physics atom was introduced:
  - the move reuses the existing shared Q1 leaf `Geladene Teilchen in homogenen elektrischen Feldern untersuchen`
- after applicability compilation, `DE-NI` is now also visible on:
  - `741774ef-15fc-4bcf-a370-e2c5cf4257d0` (`Geladene Teilchen in homogenen elektrischen Feldern untersuchen`)
  - and thereby also on the parent clusters `47f76c5c-05d1-59eb-876d-cafb98a66c5b` (`Bewegung geladener Teilchen im elektrischen Feld`) and `43eb9b9e-cfdf-5cf1-88db-87391c7ba595` (`Ladungen in Feldern`)
- one new Niedersachsen-specific `APV-202` entry is now documented for the widened NI crossed-field surface:
  - `741774ef-15fc-4bcf-a370-e2c5cf4257d0`

Why this cut:

- unlike the still source-led eA `Fadenstrahlrohr` residue, the non-eA crossed-field clause already overlaps enough with the shared reviewed Q1 electric-field particle-motion leaf
- the reviewed NI wording stays narrower than the canonical target because it focuses on free electrons plus `Wien-Filter` context, not the full broader charged-particle and energy-change surface, so `partial` is the defensible match
- this closes the retained non-eA `Querfeld` / `Wien-Filter` residue without forcing Niedersachsen-specific canonical atom growth

Validation used:

- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Interpretation:

- Niedersachsen upper-secondary Physics now closes the retained non-eA crossed-field follow-on on its active qualification-phase `Elektrizitaet` route without introducing new canonical atoms or Niedersachsen-specific composition views
- the only remaining NI source-led Physics residue is now the narrower eA `Fadenstrahlrohr` clause

### 2026-04-15: Niedersachsen Physics keeps `Fadenstrahlrohr` deferred even after discovering adjacent Bayern raw-source evidence

What changed:

- no new Niedersachsen Physics mapping row was added in this step:
  - `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_to_canonical_physics.json`
  remains at `55` reviewed rows
- no new canonical Physics atom was introduced:
  - the shared canonical Physics graph still does not isolate a sufficiently narrow fine-beam-tube / specific-charge measurement target
- the remaining Niedersachsen source-led residue stays:
  - `0966258c-1eaa-4c41-8311-17352dcf0ec1` (`Spezifische Ladung von Elektronen mit dem Fadenstrahlrohr einordnen`)
- the decision is now explicit because adjacent second-state evidence exists in the broader Bayern source file:
  - `curricula/DE/Gymnasium/input/BY/gymnasium/Physik.json`
  - `4a5610d3-febc-5686-9996-ca232fceb44a` combines `Elektronenablenkroehre` verification in the electric transverse field with electron-mass determination via `Fadenstrahlrohr`

Why no bridge yet:

- the newly surfaced Bayern evidence is real, but it is not yet an imported retained reviewed second-state corridor on the active canonical Physics rollout path
- the Niedersachsen wording stays narrower and differently framed (`spezifische Ladung` / principle / target quantity) than the broader Bayern experiment wording (`Elektronenablenkroehre`, regression, mass determination, uncertainty assessment)
- authoring a new shared canonical measurement atom before a retained reviewed second-state lane exists would overtake the current source-led rollout discipline

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- Niedersachsen Physics is now explicitly closed at the current retained pilot-cut level
- the remaining `Fadenstrahlrohr` clause is not forgotten debt, but a deliberately deferred shared-measurement candidate for a later multi-state retained rollout

### 2026-04-15: Niedersachsen Physics closes the deferred `Fadenstrahlrohr` residue via an imported Bayern second-state corridor

What changed:

- one new shared canonical Physics atom was introduced:
  - `966782e5-690d-4fae-bbab-fa3fa30525c3` (`Fadenstrahlrohr als Elektronen-Messverfahren einordnen`)
- the repository-backed Niedersachsen Physics mapping lane:
  - `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_to_canonical_physics.json`
  now carries `56` reviewed rows instead of `55`
- one new reviewed Niedersachsen bridge was added:
  - `0966258c-1eaa-4c41-8311-17352dcf0ec1` (`Spezifische Ladung von Elektronen mit dem Fadenstrahlrohr einordnen`)
    -> `966782e5-690d-4fae-bbab-fa3fa30525c3` (`Fadenstrahlrohr als Elektronen-Messverfahren einordnen`) (`partial`)
- the retained Bayern second-state evidence is now imported on the active canonical path:
  - `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_to_canonical_physics.json`
  now carries `44` reviewed rows instead of `43`
  - `4a5610d3-febc-5686-9996-ca232fceb44a`
    -> `966782e5-690d-4fae-bbab-fa3fa30525c3` (`partial`)
- after applicability compilation, the new shared measurement atom now carries:
  - `DE-BY`, `DE-NI`
- no new accepted-warning debt was needed for this step:
  - the widened shared measurement surface produces no new applicability findings on the new atom or its parent cluster

Why this cut now:

- the earlier defer decision was correct at the time, because a single-state Niedersachsen clause alone would have forced a premature shared measurement atom
- once the adjacent retained Bayern experiment corridor was actually imported and reviewed, the multi-state evidence became concrete enough to justify a narrow shared canonical leaf
- the new atom is still intentionally narrower than the broader Bayern experimental clause and broader than the Niedersachsen wording, so both state bridges stay defensibly `partial`

Validation used:

- `cd app && APPLICABILITY_APPLY_SCOPE=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a npm run apply:applicability`
- `cd app && npm run validate:view-filters --silent`
- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`

Interpretation:

- Niedersachsen Physics no longer has a measurement-specific source-led residue on the active retained pilot surface
- the only intentionally source-led Niedersachsen Physics residue is now the sustainability-related Bewertungsblatt from the E-phase energy strip

### 2026-04-15: Berlin upper-secondary Physics opens the first reviewed Q1 field/capacitor corridor

What changed:

- the first retained Berlin upper-secondary Physics source PDF is now archived locally:
  - `curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2022_Physik.pdf`
- the first Berlin upper-secondary Physics source snapshot is now active:
  - `curricula/DE/Gymnasium/input/BE/upper-secondary/source-json/DE_BER_S_GYM_2_PHYSIK.de.json.snapshot`
- the retained source lane is now registered in the shared DE-level source registry:
  - `8e54a9e6-dd9d-4f5d-a632-734b4ef5c754` (`Physik Oberstufe (Berlin, Pilot-Quellsnapshot)`)
- provenance-backed membership and atomic closure are now active for that retained snapshot:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- the first repository-backed Berlin upper-secondary Physics mapping lane now exists:
  - `curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_physics_upper_secondary_to_canonical_physics.json`
  - `10` reviewed rows
- the first reviewed Berlin corridor is intentionally narrow:
  - one shared orientation anchor
  - one structural `Q1` field anchor
  - one first reviewed `Q1` electric-field / capacitor corridor
- no canonical Physics atom was added in this step:
  - the Berlin start reuses the existing shared Q1 field/capacitor surface
- no committed Berlin applicability cut was added in this step:
  - Berlin stays a reviewed `P4` source/mapping lane without a DE-BE applicability persist pass

Why this cut:

- Berlin is the cleanest next real Physics rollout lane after the closed Niedersachsen maintenance pass because the retained BE/BB upper-secondary PDF offers a narrow `3.2.1` field corridor that already fits the shared canonical Q1 field/capacitor surface
- the start stays intentionally conservative:
  - no Berlin-only canonical atom
  - no Berlin-specific composition view
  - no premature applicability cut
- this keeps the next move obvious:
  - extend the same retained Berlin `3.2.1` route toward magnetic field or charged-particle motion before opening another new state

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- canonical Physics now has a real fifth active non-Hessen/Bayern maintenance-era source lane beyond the already active NRW/BW/NI surface
- Berlin is active as a narrow reviewed `P4` entry lane, but still intentionally does not widen learner-facing applicability or composition-view debt yet

### 2026-04-15: Berlin upper-secondary Physics widens the retained `3.2.1` route onto the shared magnetic-field surface

What changed:

- the active Berlin upper-secondary Physics source snapshot
  - `curricula/DE/Gymnasium/input/BE/upper-secondary/source-json/DE_BER_S_GYM_2_PHYSIK.de.json.snapshot`
  now includes one first retained `3.2.1` magnetic-field / Lorentz-force follow-on next to the earlier electric-field / capacitor corridor
- the Berlin snapshot contributes five additional retained source goals through the shared provenance registries:
  - one corridor parent `Q1: Magnetfeld und Lorentzkraft (erster Follow-on-Korridor)`
  - four leaves on field line diagrams, magnetic flux density via conductor force, long-coil field strength, and Lorentz force
- the repository-backed Berlin Physics mapping lane
  - `curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_physics_upper_secondary_to_canonical_physics.json`
  now carries `15` reviewed rows instead of `10`
- the new reviewed Berlin bridges are:
  - retained corridor parent -> shared canonical cluster `Magnetisches Feld` (`partial`)
  - `Feldlinienbilder von Permanentmagneten, geradem Leiter und Spule beschreiben`
    -> `Magnetische Felder und Feldlinienbilder` (`exact`)
  - `Magnetische Flussdichte ueber Leiterkraft deuten`
    -> `Kraft auf stromdurchflossene Leiter` (`partial`)
  - `Magnetische Flussdichte in der langen Spule und Materialeinfluss beschreiben`
    -> `Magnetfeld von geradem Leiter und Spule` (`partial`)
  - `Lorentzkraft auf bewegte Ladungen im Magnetfeld beschreiben`
    -> `Lorentzkraft auf freie Ladungen` (`partial`)
- no canonical Physics atom was added in this step:
  - the Berlin follow-on reuses the existing shared Q1 magnetic-field surface
- no committed Berlin applicability cut was added in this step

Why this cut:

- continuing Berlin on the same retained `3.2.1` route is cleaner than jumping immediately into `3.2.2`, because the shared canonical Q1 magnetic-field surface already exists and matches the source wording well enough for conservative reviewed bridges
- the exact/partial split stays disciplined:
  - field-line diagrams are one-to-one enough for `exact`
  - conductor force, long-coil field strength, and Lorentz force stay `partial` because the retained Berlin wording is still narrower than the broader shared canonical leaves
- this leaves the next move obvious:
  - extend Berlin into `3.2.2 Bewegung von geladenen Teilchen in Feldern`

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- Berlin no longer stops at the electric-field / capacitor entry and now covers the first retained magnetic-field follow-on on the same Q1 route
- the lane still remains a narrow reviewed `P4` source/mapping slice with no Berlin-specific applicability or composition-view debt

### 2026-04-15: Berlin upper-secondary Physics extends the retained Q1 route into `3.2.2 Bewegung von geladenen Teilchen in Feldern`

What changed:

- the active Berlin upper-secondary Physics source snapshot
  - `curricula/DE/Gymnasium/input/BE/upper-secondary/source-json/DE_BER_S_GYM_2_PHYSIK.de.json.snapshot`
  now also includes one retained `3.2.2` follow-on corridor with:
  - one electric subcluster on longitudinal field, transverse field, and `Millikan`
  - one intentionally source-led `c0` clause
  - one magnetic subcluster on circle motion in homogeneous magnetic fields and the specific charge of the electron
- the shared provenance registries now carry nine additional retained Berlin source goals on that route:
  - one corridor parent
  - two retained subclusters
  - six retained leaves
- the repository-backed Berlin Physics mapping lane
  - `curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_physics_upper_secondary_to_canonical_physics.json`
  now carries `21` reviewed rows instead of `15`
- the new reviewed Berlin bridges are:
  - retained electric `3.2.2` subcluster -> `Ladungen in Feldern` (`partial`)
  - longitudinal-field leaf -> `Geladene Teilchen in homogenen elektrischen Feldern untersuchen` (`partial`)
  - transverse-field leaf -> `Geladene Teilchen in homogenen elektrischen Feldern untersuchen` (`partial`)
  - `Millikan-Experiment im Schwebefall einordnen` -> `Millikan-Versuch und Elementarladung` (`partial`)
  - circle-motion leaf -> `Geladene Teilchen in homogenen magnetischen Feldern untersuchen` (`partial`)
  - `Spezifische Ladung des Elektrons bestimmen` -> `Fadenstrahlrohr als Elektronen-Messverfahren einordnen` (`partial`)
- no canonical Physics atom was added in this step
- no committed Berlin applicability cut was added in this step
- `Vakuumlichtgeschwindigkeit c0 als Obergrenze fuer Geschwindigkeiten einordnen` intentionally stays source-led

Why this cut:

- continuing Berlin on the same retained Q1 field route is still cleaner than opening a new state, because the shared canonical Physics graph already exposes narrow enough reviewed targets for the electric-field, `Millikan`, magnetic-field, and `Fadenstrahlrohr` parts of `3.2.2`
- the cut stays disciplined:
  - no Berlin-only canonical atom
  - no Berlin-specific composition view
  - no premature applicability pass
  - no forced canonical target for the `c0` clause
- this leaves the next move narrow again:
  - make the remaining `c0` / LK-only residue explicit before opening another new Physics state

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- Berlin now covers the retained Q1 field route through `3.2.1` and into the first shared part of `3.2.2`
- the lane still remains a narrow reviewed `P4` source/mapping slice with no Berlin-specific applicability or composition-view debt

### 2026-04-15: Berlin upper-secondary Physics makes the first LK residue on the retained `3.2.2` route explicit

What changed:

- the active Berlin upper-secondary Physics source snapshot
  - `curricula/DE/Gymnasium/input/BE/upper-secondary/source-json/DE_BER_S_GYM_2_PHYSIK.de.json.snapshot`
  now includes one explicit retained LK residue subcluster on:
  - mathematical electric-field trajectories
  - relativistic mass increase
  - arbitrary entry angles in magnetic fields
  - crossed electric/magnetic fields
  - Hall-Effekt / Hall-Spannung
  - Elektronenstrahlroehre as a specific-charge measurement context
- the shared provenance registries now carry seven additional retained Berlin source goals on that route:
  - one LK residue parent
  - six LK leaves
- the repository-backed Berlin Physics mapping lane
  - `curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_physics_upper_secondary_to_canonical_physics.json`
  now carries `24` reviewed rows instead of `21`
- the new reviewed Berlin bridges are:
  - `Geladene Teilchen in gekreuzten elektrischen und magnetischen Feldern beschreiben`
    -> `Geladene Teilchen in homogenen elektrischen Feldern untersuchen` (`partial`)
  - `Hall-Effekt und Hall-Spannung anwenden`
    -> `Hall-Effekt anwenden` (`partial`)
  - `Elektronenstrahlroehre zur Bestimmung der spezifischen Ladung einordnen`
    -> `Fadenstrahlrohr als Elektronen-Messverfahren einordnen` (`partial`)
- no canonical Physics atom was added in this step
- no committed Berlin applicability cut was added in this step
- the remaining Berlin residues
  - `Vakuumlichtgeschwindigkeit c0 als Obergrenze fuer Geschwindigkeiten einordnen`
  - `Relativistische Massenzunahme schnell bewegter Teilchen einordnen`
  - `Ladungstraeger in Magnetfeldern fuer beliebige Eintrittswinkel beschreiben`
  intentionally stay source-led

Why this cut:

- the clean move here was to make the retained LK residue explicit without pretending that all of it already has narrow shared canonical coverage
- three parts already overlap enough with reviewed shared targets:
  - crossed-field motion with the existing electric-field particle-motion target
  - Hall-Effekt with the existing LK `Hall-Effekt anwenden` leaf
  - Elektronenstrahlroehre as a specific-charge measurement context with the shared `Fadenstrahlrohr` measurement leaf
- the remaining three clauses still do not justify another canonical split or a Berlin-specific atom

Validation used:

- `cd backend && ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- Berlin now covers the retained Q1 field route through `3.2.1`, the shared part of `3.2.2`, and the first narrow LK continuation on that same route
- the only remaining Berlin source-led debt on this lane is now the explicit trio `c0` / `Relativitaet` / `Eintrittswinkel`

### 2026-04-15: Berlin upper-secondary Physics keeps the remaining `c0` / `Relativitaet` / `Eintrittswinkel` trio source-led after explicit target review

What changed:

- the Berlin Physics lane itself stays unchanged at:
  - `24` reviewed mappings
  - no Berlin-specific canonical Physics atom
  - no Berlin-specific composition view
  - no committed Berlin applicability cut
- the remaining source-led Berlin trio is now explicitly documented as a deferred shared BE/BB residue candidate:
  - `86b6e00c-3015-4da4-82f4-4d7c4a0a9cc0` (`Vakuumlichtgeschwindigkeit c0 als Obergrenze fuer Geschwindigkeiten einordnen`)
  - `a7c898a2-1911-4913-b4c9-6ab2aab75db9` (`Relativistische Massenzunahme schnell bewegter Teilchen einordnen`)
  - `7dc4ed91-6ecb-4c54-a883-cb681fab9bdb` (`Ladungstraeger in Magnetfeldern fuer beliebige Eintrittswinkel beschreiben`)
- onboarding, the Berlin mapping-lane README, the Physics rollout tracker, the quick view, the topic workboard, and the M2 shortlist now all describe that trio as intentionally deferred instead of as an open Berlin-only mapping todo

Why this decision:

- the current shared canonical Physics graph still has no reviewed narrow leaf for the `c0` clause without overclaiming into broader relativity packaging
- the existing shared relativistic-mass leaf is still too Hessen-specific in its linear-accelerator framing for the Berlin wording
- the existing shared magnetic particle-motion leaves still do not isolate the arbitrary-entry-angle clause tightly enough to justify another reviewed bridge
- forcing another Berlin-only canonical split here would weaken the current source-led multi-state discipline instead of improving it

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the retained Berlin Q1 field route is now operationally closed at the current reviewed level
- the next clean Physics move is no longer another Berlin widening, but a second-state follow-on from the shared BE/BB upper-secondary source family if that deferred trio later becomes jointly reviewable

### 2026-04-15: Brandenburg upper-secondary Physics opens the second state on the shared BE/BB upper-secondary source family

What changed:

- the first Brandenburg upper-secondary Physics source PDF is now archived locally at:
  - `curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Physik.pdf`
- the first Brandenburg upper-secondary Physics source snapshot is now active:
  - `curricula/DE/Gymnasium/input/BB/upper-secondary/source-json/DE_BRA_S_GYM_2_PHYSIK.de.json.snapshot`
- the retained source lane is now registered in the shared DE-level source registry:
  - `6759f46a-5642-41f7-8dc7-71fd1c335855` (`Physik Oberstufe (Brandenburg, Pilot-Quellsnapshot)`)
- provenance-backed membership and atomic closure are now active for that retained snapshot:
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- the first repository-backed Brandenburg upper-secondary Physics mapping lane now exists:
  - `curricula/DE/Gymnasium/mapping/DE-BB/upper-secondary/bb_physics_upper_secondary_to_canonical_physics.json`
  - `10` reviewed rows
- the first reviewed Brandenburg corridor is intentionally narrow:
  - one shared orientation anchor
  - one structural `Q1` field anchor
  - one first reviewed `Q1` electric-field / capacitor corridor
- no canonical Physics atom was added in this step:
  - the Brandenburg start reuses the existing shared Q1 field/capacitor surface
- no committed Brandenburg applicability cut was added in this step:
  - Brandenburg starts as a reviewed `P4` source/mapping lane without a DE-BB applicability persist pass

Why this cut:

- after Berlin closed its current retained `3.2.1` -> `3.2.2` Q1 route at the reviewed level, the clean next move was to open the second state from the same BE/BB upper-secondary source family instead of forcing another Berlin-only canonical split
- starting Brandenburg on the already stable shared Q1 field/capacitor surface keeps the multi-state comparison honest while staying narrow:
  - no Brandenburg-only canonical atom
  - no Brandenburg-specific composition view
  - no premature applicability cut
- this leaves the next move narrow and obvious again:
  - widen Brandenburg on the retained `3.2.1` route toward magnetic field / Lorentzkraft before reopening the shared BE/BB residue on `c0`, `Relativitaet`, and `Eintrittswinkel`

Validation used:

- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- canonical Physics now has a real seventh active non-maintenance state lane on the current reviewed path
- the Berlin/Brandenburg upper-secondary source family is now open on both state lanes, but still intentionally only at the narrow reviewed `Q1` field/capacitor entry level for Brandenburg

### 2026-04-15: Brandenburg upper-secondary Physics widens the retained `3.2.1` route onto the shared magnetic-field surface

What changed:

- the active Brandenburg upper-secondary Physics snapshot now also carries one first reviewed retained `3.2.1` magnetic-field / Lorentz-force follow-on:
  - parent cluster `Q1: Magnetfeld und Lorentzkraft (erster Follow-on-Korridor)`
  - four reviewed leaves on field-line diagrams, conductor-force interpretation, long-coil field strength, and Lorentz force
- the Brandenburg source snapshot now contributes `15` reviewed source goals via `source-goal-membership-registry.json`
- the same snapshot now contributes widened atomic closures via `source-goal-closure-registry.json`
- the repository-backed Brandenburg upper-secondary Physics mapping lane now carries `15` reviewed rows:
  - one partial bridge from the new Brandenburg magnetic parent onto the shared canonical `Magnetisches Feld` cluster
  - one exact bridge from the Brandenburg field-line leaf onto the canonical atom of the same pedagogical surface
  - three conservative partial bridges onto `Kraft auf stromdurchflossene Leiter`, `Magnetfeld von geradem Leiter und Spule`, and `Lorentzkraft auf freie Ladungen`
- no canonical Physics atom was added in this step:
  - the Brandenburg follow-on reuses the existing shared magnetic-field surface that was already stable from Hessen, Niedersachsen, Nordrhein-Westfalen, Baden-Wuerttemberg, and Berlin
- no committed Brandenburg applicability cut was added in this step:
  - Brandenburg remains a reviewed `P4` source/mapping lane without a DE-BB applicability persist pass

Why this cut:

- after the first Brandenburg `Q1` electric-field / capacitor entry, the clean next move was to widen the same retained `3.2.1` route before opening another source family or forcing the deferred shared BE/BB residue
- the shared canonical magnetic-field strip was already narrow enough to absorb this second-state follow-on without inventing another visible package:
  - no Brandenburg-only canonical atom
  - no Brandenburg-specific composition view
  - no premature applicability cut
- this keeps the next move narrow and obvious again:
  - widen Brandenburg next into retained `3.2.2 Bewegung geladener Teilchen in Feldern` before reopening `c0`, `Relativitaet`, and `Eintrittswinkel`

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- the shared BE/BB upper-secondary source family is now open on both state lanes across the retained `3.2.1` electric and magnetic strip
- the next clean Physics move inside that family is no longer another Brandenburg `3.2.1` widening, but the retained `3.2.2` charged-particle-motion follow-on

### 2026-04-15: Brandenburg upper-secondary Physics closes the retained `3.2.2` route at the current reviewed level

What changed:

- the active Brandenburg upper-secondary Physics snapshot now also carries one first reviewed retained `3.2.2` charged-particle-motion follow-on:
  - one electric-field subsurface on longitudinal acceleration, transverse trajectories, and the Millikan experiment
  - one magnetic-field subsurface on circular trajectories and specific charge
  - one explicit LK side-lane on crossed fields, Hall-Effekt, and Elektronenstrahlroehre
  - the `c0` leaf and the LK leaves on relativistic mass increase plus arbitrary entry angles stay explicitly source-led
- the Brandenburg source snapshot now contributes `31` reviewed source goals via `source-goal-membership-registry.json`
- the same snapshot now contributes widened atomic closures with `24` root atomics via `source-goal-closure-registry.json`
- the repository-backed Brandenburg upper-secondary Physics mapping lane now carries `24` reviewed rows:
  - new partial bridges on the shared charged-particle-motion surfaces in electric and magnetic fields
  - new partial bridge on `Millikan-Versuch und Elementarladung`
  - new partial bridges on the shared measurement surface for specific charge / Elektronenstrahlroehre
  - new partial bridges on crossed fields and Hall-Effekt where narrow shared targets already existed
- no canonical Physics atom was added in this step:
  - the Brandenburg follow-on still reuses the existing shared Q1 field / particle-motion surface
- no committed Brandenburg applicability cut was added in this step:
  - Brandenburg remains a reviewed `P4` source/mapping lane without a DE-BB applicability persist pass

Why this cut:

- after the reviewed Brandenburg retained `3.2.1` electric and magnetic strip, the clean next move was to close the matching retained `3.2.2` corridor from the same BE/BB source family instead of forcing another canonical split
- the shared canonical particle-motion surface was already narrow enough to absorb this second-state follow-on without inventing another visible package:
  - no Brandenburg-only canonical atom
  - no Brandenburg-specific composition view
  - no premature applicability cut
- this leaves the remaining BE/BB debt explicit and honest:
  - `c0`
  - `Relativitaet`
  - `Eintrittswinkel`

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Brandenburg now matches the current reviewed Berlin cut on the retained `3.2.1` -> `3.2.2` route
- the shared BE/BB upper-secondary source family is therefore operationally closed at the current reviewed level
- the next clean Physics move is no longer another Brandenburg widening, but either an explicit shared BE/BB residue decision or a different state/source family

### 2026-04-15: Berlin/Brandenburg upper-secondary Physics freezes the shared `c0` / `Relativitaet` / `Eintrittswinkel` residue at the current reviewed level

What changed:

- no Berlin or Brandenburg mapping rows changed in this step:
  - `DE-BE` stays at `24` reviewed mappings
  - `DE-BB` stays at `24` reviewed mappings
- no canonical Physics atom was added in this step
- no applicability cut was added in this step
- onboarding notes, mapping-lane READMEs, the rollout tracker, the quick-view, the topic workboard, and the M2 shortlist now all treat the remaining trio as an explicitly frozen shared BE/BB residue set instead of as an immediately pending next bridge

Why this decision:

- the Berlin-only target review already showed that the current shared canonical Physics graph still has no reviewed narrow leaf for the `c0` clause without overclaiming into broader relativity packaging
- after Brandenburg now matches the same retained `3.2.1` -> `3.2.2` cut, the shared evidence still does not improve that conclusion:
  - the existing shared relativistic-mass leaf remains too Hessen-shaped in its linear-accelerator framing
  - the existing shared magnetic-field particle-motion leaves still do not isolate the arbitrary-entry-angle clause tightly enough
- forcing another BE/BB-only canonical split here would widen ontology debt without creating a stable shared surface

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the shared BE/BB upper-secondary family is now not only operationally closed at the current reviewed cut, but also explicitly closed against another immediate residue bridge
- the next clean Physics rollout move should therefore come from a different state/source family unless later reviewed evidence genuinely changes that residue assessment

### 2026-04-16: Schleswig-Holstein upper-secondary Physics opens a first retained field-concept corridor

What changed:

- Schleswig-Holstein now has an active upper-secondary Physics source snapshot:
  - `curricula/DE/Gymnasium/input/SH/upper-secondary/source-json/DE_SHL_S_GYM_2_PHYSIK.de.json.snapshot`
- the new SH upper-secondary Physics lane is now active in:
  - `source-landscape-registry.json`
  - `source-goal-membership-registry.json`
  - `source-goal-closure-registry.json`
- the repository-backed SH mapping lane now exists:
  - `curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_physics_upper_secondary_to_canonical_physics.json`
- the lane currently carries `10` reviewed mappings:
  - one partial bridge from the SH source root onto the canonical Physics root
  - one exact bridge on the shared orientation anchor
  - one partial bridge from the structural SH field anchor onto `Q1 Elektrisches und magnetisches Feld`
  - one partial bridge from the retained SH corridor parent onto the shared canonical cluster `Elektrisches Feld`
  - six conservative partial leaf bridges on the field-concept surface for charge phenomena, Coulomb interaction, field-line sketches, and superposition
- no canonical Physics atom was added in this step
- no committed Schleswig-Holstein applicability cut was added in this step

Why this cut:

- after the shared BE/BB residue was explicitly frozen, the clean next move was to open a different retained source family instead of forcing another weak bridge on `c0` / `Relativitaet` / `Eintrittswinkel`
- Schleswig-Holstein is a good next source because the combined-stage Fachanforderungen expose a clear Sek-II topic row `Elektrische und magnetische Felder` that already sits close to the current shared Q1 field surface
- the first SH cut therefore stays narrow and source-led:
  - one shared orientation anchor
  - one structural upper-secondary field anchor
  - one first reviewed corridor on `Das Feldkonzept zur Beschreibung von Wechselwirkungen`

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Physics now has a real eighth active Bundesland lane on the current canonical path
- the active follow-on is no longer another new source family immediately, but the next retained SH step on `Koerper in statischen Feldern`

### 2026-04-16: Schleswig-Holstein upper-secondary Physics widens onto a first static-fields follow-on

What changed:

- the active Schleswig-Holstein upper-secondary Physics source snapshot
  - `curricula/DE/Gymnasium/input/SH/upper-secondary/source-json/DE_SHL_S_GYM_2_PHYSIK.de.json.snapshot`
  now widens the retained source family `Elektrische und magnetische Felder` beyond the first field-concept cut
- the same SH source lane now carries one first reviewed follow-on on the official subtopic `Koerper in statischen Feldern`
- the repository-backed SH mapping lane
  - `curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_physics_upper_secondary_to_canonical_physics.json`
  now carries `15` reviewed mappings
- the widened SH leaves resolve conservatively onto existing shared canonical atoms for:
  - charges in electric fields
  - Lorentzkraft
  - motion in homogeneous electric and magnetic fields
  - work/energy in electric fields
- no canonical Physics atom was added in this step
- no committed Schleswig-Holstein applicability cut was added in this step

Why this cut:

- after the first SH field-concept corridor, the clean next move was to stay on the same official source family instead of opening another state/source family immediately
- `Koerper in statischen Feldern` is the adjacent retained SH subtopic on the same row and already fits existing shared Q1 field atoms without forcing a new canonical package
- the current SH cut therefore stays narrow and source-led:
  - one first follow-on for electric force, Lorentzkraft, homogeneous field motion, and acceleration energy
  - the residue on Kreisbewegungen, Elektronenmessung, and technischen Anwendungen remains intentionally open for the next SH move

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Schleswig-Holstein now has a widened reviewed Physics lane on the current canonical path, not just a first-entry seed
- the active follow-on remains inside the same SH source family, specifically on the remaining `Koerper in statischen Feldern` residue

### 2026-04-16: Schleswig-Holstein upper-secondary Physics widens onto Elektronenmessung und technische Anwendungen

What changed:

- the active Schleswig-Holstein upper-secondary Physics source snapshot
  - `curricula/DE/Gymnasium/input/SH/upper-secondary/source-json/DE_SHL_S_GYM_2_PHYSIK.de.json.snapshot`
  now widens the retained source family `Elektrische und magnetische Felder` by a second follow-on inside `Koerper in statischen Feldern`
- the repository-backed SH mapping lane
  - `curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_physics_upper_secondary_to_canonical_physics.json`
  now carries `19` reviewed mappings
- the widened SH leaves resolve conservatively onto existing shared canonical atoms for:
  - `Millikan-Versuch und Elementarladung`
  - `Fadenstrahlrohr als Elektronen-Messverfahren einordnen`
  - `Hall-Effekt anwenden`
  - `Teilchenbeschleuniger (Zyklotron/Synchrotron)`
- the adjacent SH `Massenspektrometer` leaf is now explicit in the source snapshot and remains intentionally source-led because the current shared canonical Physics surface still has no narrow reviewed target for it
- no canonical Physics atom was added in this step
- no committed Schleswig-Holstein applicability cut was added in this step

Why this cut:

- after the first SH field-concept corridor and the first static-fields follow-on, the clean next move was to stay on the same official SH source family instead of switching topic rows or forcing a new canonical package
- the official SH clause on Elektronenmessung und technischen Anwendungen already overlaps with existing shared measurement/application atoms for Millikan, Fadenstrahlrohr, Hall-Effekt, and Teilchenbeschleuniger
- `Massenspektrometer` still lacks that narrow shared target, so the second SH follow-on stays conservative and explicitly leaves that one application source-led

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Schleswig-Holstein now has a materially widened reviewed Physics lane on the current canonical path, not just one first-entry corridor plus one adjacent follow-on
- the remaining open SH residue on this source family is now mainly `Kreisbewegungen`, while `Massenspektrometer` is an explicit source-led micro-residue rather than an implicit missing slice

### 2026-04-16: Schleswig-Holstein upper-secondary Physics widens onto Kreisbewegungen

What changed:

- the active Schleswig-Holstein upper-secondary Physics source snapshot
  - `curricula/DE/Gymnasium/input/SH/upper-secondary/source-json/DE_SHL_S_GYM_2_PHYSIK.de.json.snapshot`
  now widens the retained source family `Elektrische und magnetische Felder` by a third follow-on inside `Koerper in statischen Feldern`
- the repository-backed SH mapping lane
  - `curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_physics_upper_secondary_to_canonical_physics.json`
  now carries `22` reviewed mappings
- the widened SH leaves resolve conservatively onto existing shared canonical atoms for:
  - `Bahn- und Winkelgeschwindigkeit`
  - `Zentripetalkraft herleiten`
  - `Kreisbewegung mit Zentripetalkraft anwenden`
- the adjacent SH leaf `Drehimpuls und Drehimpulserhaltung` is now explicit in the source snapshot and remains intentionally source-led because the current shared canonical Physics surface on that concept is still a separate Drehbewegungsflaeche rather than a narrow continuation of the SH static-fields clause
- no canonical Physics atom was added in this step
- no committed Schleswig-Holstein applicability cut was added in this step

Why this cut:

- after the first SH field-concept corridor and the two adjacent static-fields/application follow-ons, the clean next move was to finish the circle-motion strip on the same official SH source family instead of switching rows too early
- the official SH wording on Kreisbewegungen already overlaps with the existing shared mechanics surface for orbital/angular velocity, centripetal force, and quantitative circular-motion analysis
- `Drehimpuls und Drehimpulserhaltung` still sits on a broader rotational-mechanics surface, so the third SH follow-on stays conservative and explicitly leaves that one concept source-led

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Schleswig-Holstein now has a broadly widened reviewed Physics lane on the current canonical path across the opened SH field source family
- the remaining open SH debt on this family is no longer a hidden missing corridor but two explicit source-led micro-residues: `Massenspektrometer` and `Drehimpuls und Drehimpulserhaltung`

### 2026-04-16: Schleswig-Holstein upper-secondary Physics freezes its two remaining micro-residues

What changed:

- the Schleswig-Holstein upper-secondary Physics lane is now treated as complete at the current reviewed pilot-cut level
- the two remaining SH source leaves
  - `Massenspektrometer`
  - `Drehimpuls und Drehimpulserhaltung`
  are now explicitly frozen as source-led micro-residues in the SH onboarding, lane README, rollout tracker, workboard, shortlist, and quick-view artifacts
- no mappings changed in this step
- no canonical Physics atom was added in this step
- no committed Schleswig-Holstein applicability cut was added in this step

Why this cut:

- after the first field-concept corridor and the three adjacent SH follow-ons, the active SH source family no longer has a didactically meaningful reviewed widening left without forcing weak or semantically stretched bridges
- `Massenspektrometer` still has no narrow shared canonical target on the current field strip
- `Drehimpuls und Drehimpulserhaltung` still belongs to a broader rotational-mechanics surface rather than to a narrow continuation of the retained SH static-fields clause

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- Schleswig-Holstein is now operationally in the same maintenance-style state as the other reviewed retained upper-secondary lanes
- the next clean Physics rollout move should therefore come from a new state/source family rather than from another SH residue attempt

### 2026-04-16: Rheinland-Pfalz Physics is now the explicit next source-onboarding target

What changed:

- Rheinland-Pfalz Physics is now explicitly tracked as the next active source-onboarding target in:
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  - `docs/dev/canonical-gymnasium-physics-topic-workboard.md`
  - `docs/dev/canonical-gymnasium-physics-m2-lane-shortlist.md`
  - `docs/dev/canonical-gymnasium-physics-parity-plan.md`
- a dedicated onboarding note now exists at:
  - `curricula/DE/Gymnasium/provenance/rp-physics-onboarding.md`
- the Rheinland-Pfalz input README now records the current official MSS Physics source route at:
  - `curricula/DE/Gymnasium/input/RP/README.md`
- the current official Sek-II source is identified as the Schulcampus node:
  - `25a2f512-91be-4a59-9dc5-342aece95a0b`
  - title `Lehrplan Physik - Grund- und Leistungsfach`
  - file `Physik_SekII.pdf`
- Rheinland-Pfalz intentionally remains at `P0`
- no RP Physics snapshot, registry activation, mapping lane, canonical atom, or applicability cut was added in this step

Why this cut:

- after Schleswig-Holstein was explicitly closed at the current reviewed pilot cut, the next clean Physics move had to open a new source family rather than widening more frozen residues
- Rheinland-Pfalz is the nearest attractive next state because the official MSS Physics source is already identifiable from the public Bildungsserver / Schulcampus route and the repository already has a mature RP mathematics lane
- the actual current Physics PDF is not yet archived locally, and the public download route currently redirects anonymous requests through Schulcampus session validation
- authoring a reviewed RP lane from metadata-only evidence would therefore be weaker than stopping explicitly at source-onboarding

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- Physics now has an explicit next active source-onboarding target again instead of an empty immediate queue
- the next correct RP move is source acquisition and archival, not a fabricated snapshot or mapping corridor

### 2026-04-16: Rheinland-Pfalz Physics lane is now active on the first reviewed GF/LF-common field-concept strip

What changed:

- the current official Rheinland-Pfalz MSS Physics PDF is now archived locally at:
  - `curricula/DE/Gymnasium/input/RP/Physik_Sekundarstufe_II_MSS.pdf`
- the first RP upper-secondary Physics source snapshot now exists at:
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
- the first RP mapping lane now exists at:
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
- the RP Physics lane is now active in:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the repository-backed fixture now covers the new lane in:
  - `backend/src/test/java/com/skillpilot/backend/landscape/GoalMappingRepositoryFixtureTest.java`

Current reviewed RP cut:

- `11` reviewed mappings
- one shared orientation anchor
- one structural Qualifikationsphasen-Anker `Statische elektrische und magnetische Felder`
- one first reviewed gemeinsamer Grundfach-/Leistungsfach-Korridor on the Pflichtbaustein `Feldkonzept fuer statische elektrische und magnetische Felder`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the actual official source is now locally archived and inspectable, so the lane no longer has to stop at metadata-backed `P0`
- the first corridor is intentionally limited to the narrow GF/LF overlap on the static field-concept strip
- the adjacent Energie-/Speicherstreifen is not widened yet because the GF/LF overlap there is less clean and would otherwise overclaim the current shared canonical surface

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Physics now has a real ninth state lane on the canonical DE path, not just another placeholder
- the next clean Physics move stays inside Rheinland-Pfalz on the adjacent GF/LF-common static-field interaction strip

### 2026-04-16: Rheinland-Pfalz Physics now also carries the first reviewed GF/LF-common static-field interaction follow-on

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now includes one adjacent reviewed GF/LF-common follow-on on `Wechselwirkung von geladenen Koerpern mit statischen Feldern`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now carries the additional conservative bridges onto the shared canonical cluster `Ladungen in Feldern` plus the existing shared Q1 atoms for electric-field particle motion, work/energy in electric fields, Lorentzkraft, and magnetic-field particle motion
- the provenance registries, rollout tracker, RP onboarding note, RP input README, lane README, topic workboard, parity plan, and lane shortlist are all updated accordingly
- the repository-backed fixture in
  - `backend/src/test/java/com/skillpilot/backend/landscape/GoalMappingRepositoryFixtureTest.java`
  now covers `17` reviewed RP mappings

Current reviewed RP cut:

- `17` reviewed mappings
- one shared orientation anchor
- one structural Qualifikationsphasen-Anker `Statische elektrische und magnetische Felder`
- one first reviewed gemeinsamer Grundfach-/Leistungsfach-Korridor on `Feldkonzept fuer statische elektrische und magnetische Felder`
- one first reviewed GF/LF-common follow-on on `Wechselwirkung von geladenen Koerpern mit statischen Feldern`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the GF/LF overlap on the RP static-field interaction strip is clean on five source leaves and does not require a new canonical package
- the adjacent LF-only residue `Hall-Effekt`, `Kreisbahnen geladener Teilchen im homogenen Magnetfeld`, and `Wien-Filter` is narrower and should not be smuggled into the common RP cut
- this keeps RP aligned with the established topic-first rollout rule: widen the shared reviewed strip first, leave the narrower LK-only tail explicit

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz stays the active Physics lane, but it is now past the entry cut and onto a second reviewed corridor on the same source family
- the next clean Physics decision is no longer `whether` RP has a real second corridor, but `whether` the remaining LF-only residue now warrants a reviewed shared follow-on or should stay source-led while another GF/LF-common RP strip opens first

### 2026-04-16: Rheinland-Pfalz Physics now also carries the first narrow LK Hall follow-on

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now exposes an explicit LK residue cluster for the same static-field interaction strip with three leaves:
  - `Hall-Effekt`
  - `Kreisbahnen geladener Teilchen im homogenen Magnetfeld`
  - `Wien-Filter`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds one new conservative mapping:
  - `rp-phys-sek2-hall-effect` -> `Hall-Effekt anwenden` (`partial`)
- the remaining RP LK leaves `Kreisbahnen` and `Wien-Filter` stay intentionally source-led

Current reviewed RP cut:

- `18` reviewed mappings
- one shared orientation anchor
- one structural Qualifikationsphasen-Anker `Statische elektrische und magnetische Felder`
- one first reviewed gemeinsamer Grundfach-/Leistungsfach-Korridor on `Feldkonzept fuer statische elektrische und magnetische Felder`
- one first reviewed GF/LF-common follow-on on `Wechselwirkung von geladenen Koerpern mit statischen Feldern`
- one first narrow reviewed LK follow-on on `Hall-Effekt`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- `Hall-Effekt` is the cleanest narrow RP-LK continuation because the shared canonical target `Hall-Effekt anwenden` already exists and is semantically close
- `Kreisbahnen` would currently overclaim the narrower shared quantitative-bahnform surface
- `Wien-Filter` would currently drag in a broader crossed-field package than the reviewed RP cut needs

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane, but the open RP residue is now smaller and more explicit
- the next clean Physics move is now either an explicit freeze decision for `Kreisbahnen` / `Wien-Filter` or the opening of another GF/LF-common RP strip

### 2026-04-16: Rheinland-Pfalz Physics now also carries the first reviewed GF/LF-common induction corridor

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now includes one first reviewed GF/LF-common induction corridor `Veraenderliche elektromagnetische Felder`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds conservative bridges onto the shared canonical induction surface:
  - parent -> `Induktion und elektromagnetische Schwingungen`
  - `Magnetischer Fluss` -> `Induktion durch Änderung des magnetischen Flusses`
  - `Induktionsgesetz` leaves -> `Induktionsgesetz und Lenz’sche Regel`
  - `technische Anwendung der Induktion` -> `Technische Anwendungen des Induktionsgesetzes qualitativ beschreiben`
- the LF-only RP induction residue `Differentialform` / `Selbstinduktion` is now explicit but remains intentionally source-led

Current reviewed RP cut:

- `24` reviewed mappings
- one shared orientation anchor
- one structural Qualifikationsphasen-Anker `Statische elektrische und magnetische Felder`
- one first reviewed gemeinsamer Grundfach-/Leistungsfach-Korridor on `Feldkonzept fuer statische elektrische und magnetische Felder`
- one first reviewed GF/LF-common follow-on on `Wechselwirkung von geladenen Koerpern mit statischen Feldern`
- one first narrow reviewed LK follow-on on `Hall-Effekt`
- one first reviewed GF/LF-common induction corridor `Veraenderliche elektromagnetische Felder`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the GF/LF overlap on `Veraenderliche elektromagnetische Felder` is explicit in the RP source and aligns cleanly to the existing shared induction surface
- this is a stronger next rollout unit than forcing either `Wien-Filter` or quantitative `Kreisbahnen`
- the remaining RP residues are now clearly separated into two narrow LF-only pairs: `Kreisbahnen` / `Wien-Filter` and `Differentialform` / `Selbstinduktion`

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now has three reviewed GF/LF-common cuts on the same source family
- the next clean Physics move is now a narrow decision between the two remaining LF-only RP residue pairs, not another broad RP source-onboarding step

### 2026-04-16: Rheinland-Pfalz Physics now also carries the first shared self-induction follow-on

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also includes one additional shared induction leaf
  - `Selbstinduktion und Ein-/Ausschaltvorgaenge bei der Spule qualitativ erklaeren`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds one new conservative bridge:
  - `rp-phys-sek2-self-induction-switching-processes` -> `Selbstinduktion und Induktivität` (`partial`)

Current reviewed RP cut:

- `25` reviewed mappings
- one shared orientation anchor
- one structural Qualifikationsphasen-Anker `Statische elektrische und magnetische Felder`
- one first reviewed gemeinsamer Grundfach-/Leistungsfach-Korridor on `Feldkonzept fuer statische elektrische und magnetische Felder`
- one first reviewed GF/LF-common follow-on on `Wechselwirkung von geladenen Koerpern mit statischen Feldern`
- one first narrow reviewed LK follow-on on `Hall-Effekt`
- one first reviewed GF/LF-common induction corridor `Veraenderliche elektromagnetische Felder`
- one adjacent shared induction follow-on on `Selbstinduktion` und `Ein-/Ausschaltvorgaengen bei der Spule`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the official RP MSS source still lists `Selbstinduktion` and `Ein- und Ausschaltvorgaenge bei der Spule` inside the shared Pflichtbaustein `Veraenderliche elektromagnetische Felder`
- the existing shared canonical atom `Selbstinduktion und Induktivität` already provides a narrow conservative target
- this is a cleaner next move than reopening the broader older RP residue `Kreisbahnen` / `Wien-Filter`

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and the shared RP induction strip is now materially less fragmentary
- the remaining RP residue is now narrower: the LF-only induction residue `Differentialform` and the older pair `Kreisbahnen` / `Wien-Filter`

### 2026-04-16: Rheinland-Pfalz Physics now also carries the narrow LK induction follow-on on differential form

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also includes one narrow LK induction residue cluster and the new leaf
  - `Induktionsgesetz in differentieller Form fachlich anwenden`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds one new conservative bridge:
  - `rp-phys-sek2-law-of-induction-differential-form` -> `Induktionsgesetz in Differenzialform` (`partial`)

Current reviewed RP cut:

- `26` reviewed mappings
- one shared orientation anchor
- one structural Qualifikationsphasen-Anker `Statische elektrische und magnetische Felder`
- one first reviewed gemeinsamer Grundfach-/Leistungsfach-Korridor on `Feldkonzept fuer statische elektrische und magnetische Felder`
- one first reviewed GF/LF-common follow-on on `Wechselwirkung von geladenen Koerpern mit statischen Feldern`
- one first narrow reviewed LK follow-on on `Hall-Effekt`
- one first reviewed GF/LF-common induction corridor `Veraenderliche elektromagnetische Felder`
- one adjacent shared induction follow-on on `Selbstinduktion` und `Ein-/Ausschaltvorgaengen bei der Spule`
- one adjacent narrow LK induction follow-on on `Induktionsgesetz in differentieller Form`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the official RP MSS source names the differential form explicitly in the LK section of the same induction baustein
- the existing shared canonical LK atom `Induktionsgesetz in Differenzialform` already provides a narrow reviewed target
- this is still cleaner than reopening the broader older RP residue `Kreisbahnen` / `Wien-Filter`

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and the RP induction strip is now both shared and LK-side substantially closed
- the only remaining older RP residue on this source family is now `Kreisbahnen` / `Wien-Filter`

### 2026-04-16: Rheinland-Pfalz Physics now also carries the conservative LK follow-ons on Kreisbahnen and Wien-Filter

What changed:

- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds two new conservative bridges:
  - `rp-phys-sek2-circular-trajectories-in-homogeneous-magnetic-fields` -> `Geladene Teilchen in homogenen magnetischen Feldern untersuchen` (`partial`)
  - `rp-phys-sek2-crossed-fields-wien-filter` -> `Geladene Teilchen in homogenen elektrischen Feldern untersuchen` (`partial`)

Current reviewed RP cut:

- `28` reviewed mappings
- one shared orientation anchor
- one structural Qualifikationsphasen-Anker `Statische elektrische und magnetische Felder`
- one first reviewed gemeinsamer Grundfach-/Leistungsfach-Korridor on `Feldkonzept fuer statische elektrische und magnetische Felder`
- one first reviewed GF/LF-common follow-on on `Wechselwirkung von geladenen Koerpern mit statischen Feldern`
- one first narrow reviewed LK follow-on on `Hall-Effekt`
- two adjacent conservative LK follow-ons on `Kreisbahnen im homogenen Magnetfeld` and `gekreuzten elektrischen und magnetischen Feldern`
- one first reviewed GF/LF-common induction corridor `Veraenderliche elektromagnetische Felder`
- one adjacent shared induction follow-on on `Selbstinduktion` und `Ein-/Ausschaltvorgaengen bei der Spule`
- one adjacent narrow LK induction follow-on on `Induktionsgesetz in differentieller Form`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the existing retained BE/BB charged-particle-motion lane already uses the same conservative projection pattern for `Kreisbahnen` and `gekreuzte Felder`
- Rheinland-Pfalz does not yet justify a narrower shared canonical split for Wien-Filter or quantitative magnetic circle calculations
- these two partial bridges close the retained RP field/induction family on the current reviewed level without overclaiming a new shared package

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- the retained Rheinland-Pfalz field/induction family is now closed on the current conservative reviewed cut
- the next clean Physics move inside Rheinland-Pfalz should therefore switch to a different reviewed strip rather than reopen this family again

### 2026-04-16: Rheinland-Pfalz Physics now also carries the first reviewed GF/LF-common harmonics corridor

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains:
  - one structural anchor `Mechanische und elektromagnetische Schwingungen und Wellen`
  - one first reviewed GF/LF-common corridor `Harmonische Schwingungen`
  - the shared leaves `Harmonische Schwingungen als periodische Vorgaenge beschreiben`, `Charakteristische Groessen harmonischer Schwingungen fachlich deuten`, `Elektromagnetischen Schwingkreis in Analogie zum mechanischen Oszillator deuten`, and `Mechanische und elektromagnetische Schwingungen in Analogie vergleichen`
  - one adjacent leaf `Abhaengigkeit der Periodendauer von systembeschreibenden Groessen an einem Beispiel deuten` that stays intentionally source-led inside this new strip
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds six conservative bridges:
  - `rp-phys-sek2-oscillations-waves-anchor` -> `Q2 Schwingungen, Induktion und mechanische Wellen` (`partial`)
  - `rp-phys-sek2-harmonic-oscillations` -> `Mechanische Schwingungen` (`partial`)
  - `rp-phys-sek2-harmonic-oscillation-basics` -> `Harmonische Schwingung verstehen` (`partial`)
  - `rp-phys-sek2-characteristic-oscillation-quantities` -> `Charakteristische Schwingungsgroessen` (`partial`)
  - `rp-phys-sek2-electromagnetic-oscillating-circuit` -> `Elektromagnetischen Schwingkreis analysieren` (`partial`)
  - `rp-phys-sek2-mechanical-electromagnetic-oscillation-comparison` -> `Mechanische und elektromagnetische Schwingungen vergleichen` (`partial`)

Current reviewed RP cut:

- `34` reviewed mappings
- one shared orientation anchor
- one structural Qualifikationsphasen-Anker `Statische elektrische und magnetische Felder`
- one first reviewed GF/LF-common corridor on `Feldkonzept fuer statische elektrische und magnetische Felder`
- one first reviewed GF/LF-common follow-on on `Wechselwirkung von geladenen Koerpern mit statischen Feldern`
- one first narrow reviewed LK follow-on on `Hall-Effekt`
- two adjacent conservative LK follow-ons on `Kreisbahnen im homogenen Magnetfeld` and `gekreuzten elektrischen und magnetischen Feldern`
- one first reviewed GF/LF-common induction corridor `Veraenderliche elektromagnetische Felder`
- one adjacent shared induction follow-on on `Selbstinduktion` und `Ein-/Ausschaltvorgaengen bei der Spule`
- one adjacent narrow LK induction follow-on on `Induktionsgesetz in differentieller Form`
- one structural anchor `Mechanische und elektromagnetische Schwingungen und Wellen`
- one first reviewed GF/LF-common harmonics corridor `Harmonische Schwingungen`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the existing shared Q2 oscillation surface already carries reviewed BW and NI evidence on the same four target atoms
- the RP MSS wording stays conservative enough for a GF/LF-common corridor before the broader adjacent wave strip is opened
- leaving the period-dependence clause source-led keeps the new RP oscillation strip tight instead of overclaiming a narrower canonical target too early

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane, but now no longer only on the closed field/induction family
- the next clean RP move is the adjacent reviewed wave strip rather than another reopening of the older field residue

### 2026-04-16: Rheinland-Pfalz Physics now also carries the first reviewed Grundfach wave corridor

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first reviewed Grundfach corridor `Harmonische Wellen` with:
  - `Erzeugung, Ausbreitung und Energietransport bei Wellen qualitativ beschreiben`
  - `Beschreibende Groessen harmonischer Wellen fachlich deuten`
  - `Transversale und longitudinale Wellen sowie lineare Polarisation unterscheiden`
  - `Brechung, Reflexion und Beugung als grundlegende Wellenphaenomene beschreiben`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds four conservative bridges:
  - `rp-phys-sek2-harmonic-waves-gf` -> `Mechanische Wellen` (`partial`)
  - `rp-phys-sek2-wave-propagation-energy-transport` -> `Mechanische Wellen` (`partial`)
  - `rp-phys-sek2-harmonic-wave-quantities` -> `Harmonische Wellen und ihre Groessen` (`partial`)
  - `rp-phys-sek2-basic-wave-phenomena` -> `Wellenphaenomene: Brechung, Reflexion, Beugung` (`partial`)

Current reviewed RP cut:

- `38` reviewed mappings
- one shared orientation anchor
- one structural Qualifikationsphasen-Anker `Statische elektrische und magnetische Felder`
- one first reviewed GF/LF-common corridor on `Feldkonzept fuer statische elektrische und magnetische Felder`
- one first reviewed GF/LF-common follow-on on `Wechselwirkung von geladenen Koerpern mit statischen Feldern`
- one first narrow reviewed LK follow-on on `Hall-Effekt`
- two adjacent conservative LK follow-ons on `Kreisbahnen im homogenen Magnetfeld` and `gekreuzten elektrischen und magnetischen Feldern`
- one first reviewed GF/LF-common induction corridor `Veraenderliche elektromagnetische Felder`
- one adjacent shared induction follow-on on `Selbstinduktion` und `Ein-/Ausschaltvorgaengen bei der Spule`
- one adjacent narrow LK induction follow-on on `Induktionsgesetz in differentieller Form`
- one structural anchor `Mechanische und elektromagnetische Schwingungen und Wellen`
- one first reviewed GF/LF-common harmonics corridor `Harmonische Schwingungen`
- one first reviewed Grundfach wave corridor `Harmonische Wellen`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the Grundfach baustein `Harmonische Wellen` is the next narrow official RP source surface after the newly opened harmonics strip
- the existing shared canonical wave surface already carries reviewed BW and NI evidence for `Mechanische Wellen`, `Harmonische Wellen und ihre Groessen`, and `Wellenphaenomene`
- keeping the clause `Transversale und longitudinale Wellen sowie lineare Polarisation` source-led avoids overclaiming a narrower canonical target before broader reviewed evidence exists

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now has a first reviewed wave cut next to the new harmonics strip
- the next clean RP move is the adjacent `Superposition von Wellen` / standing-wave / interference surface rather than another reopening of the older field/induction family

### 2026-04-16: Rheinland-Pfalz Physics now also carries the first reviewed Grundfach superposition/interference follow-on

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first reviewed Grundfach follow-on `Superposition von Wellen` with:
  - `Stehende Wellen als Ueberlagerung im eindimensionalen Fall beschreiben`
  - `Wellenlaengen mit einer durch Reflexion erzeugten stehenden Welle bestimmen`
  - `Interferenz am Doppelspalt mit monochromatischem Licht qualitativ beschreiben`
  - `Entstehung des Spektrums von weissem Licht am Doppelspalt fachlich einordnen`
  - `Wellenlaengen von monochromatischem Licht experimentell bestimmen`
  - `Wellenlaengenbereiche elektromagnetischer Wellen im Ueberblick einordnen`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds six conservative bridges:
  - `rp-phys-sek2-wave-superposition-gf` -> `Ueberlagerung und Interferenz von Wellen` (`partial`)
  - `rp-phys-sek2-standing-wave-superposition` -> `Stehende Wellen und Wellenlaengenbestimmung` (`partial`)
  - `rp-phys-sek2-standing-wave-wavelength-determination` -> `Stehende Wellen und Wellenlaengenbestimmung` (`partial`)
  - `rp-phys-sek2-double-slit-interference-monochromatic-light` -> `Interferenz am Doppelspalt` (`partial`)
  - `rp-phys-sek2-monochromatic-light-wavelength-determination` -> `Interferenz am Doppelspalt` (`partial`)
  - `rp-phys-sek2-electromagnetic-wavelength-ranges-overview` -> `Spektrum elektromagnetischer Wellen` (`partial`)

Current reviewed RP cut:

- `44` reviewed mappings
- one first reviewed Grundfach superposition/interference follow-on `Superposition von Wellen`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the Grundfach Pflichtbaustein `Superposition von Wellen` is the next official narrow RP source surface after `Harmonische Wellen`
- the shared canonical Q2/Q3 wave surface already carries reviewed targets for standing waves, double-slit interference, and the overview of electromagnetic wavelength ranges
- keeping `Entstehung des Spektrums von weissem Licht am Doppelspalt` source-led avoids overclaiming a narrower canonical target before broader reviewed evidence exists

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now has a third reviewed cut inside the oscillation/wave family
- the next clean RP move is the adjacent reviewed LF surface `Harmonische Wellen und ihre Superposition`

### 2026-04-16: Rheinland-Pfalz Physics now also carries the first narrow LF wave/superposition follow-on

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first narrow reviewed LF follow-on `Harmonische Wellen und ihre Superposition` with:
  - `Beugung und Interferenz am Einzelspalt mit monochromatischem Licht fachlich beschreiben`
  - `Aufbau und Funktionsweise eines einfachen Interferometers fachlich einordnen`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds two conservative bridges:
  - `rp-phys-sek2-single-slit-diffraction-interference` -> `Interferenzmuster und Intensitaetsverteilungen bei Einzelspalt, Doppelspalt und Gitter beschreiben` (`partial`)
  - `rp-phys-sek2-simple-interferometer` -> `Interferometer verstehen` (`partial`)

Current reviewed RP cut:

- `46` reviewed mappings
- one first narrow LF wave/superposition follow-on `Harmonische Wellen und ihre Superposition`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the LF Pflichtbaustein `Harmonische Wellen und ihre Superposition` largely overlaps the already covered GF surfaces `Harmonische Wellen` and `Superposition von Wellen`
- the genuinely new reviewed LF residue is therefore narrow: `Einzelspalt` plus `einfaches Interferometer`
- keeping the LF cut at that residue avoids duplicating already reviewed GF content inside the RP lane

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now has a fourth reviewed cut inside the oscillation/wave family
- the next clean RP move is the adjacent LF Pflichtbaustein `Schwingungen und Wellen`

### 2026-04-16: Rheinland-Pfalz Physics now also carries the first narrow LF Pflichtbaustein follow-on `Schwingungen und Wellen`

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first narrow reviewed LF Pflichtbaustein follow-on `Schwingungen und Wellen` with:
  - `Freie gedaempfte Schwingungen qualitativ beschreiben`
  - `Erzwungene Schwingungen und Resonanz phaenomenologisch deuten`
  - `Gekoppelte Schwingungen fachlich einordnen`
  - `Zeitliche und raeumliche Entwicklung harmonischer Wellen mathematisch beschreiben`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds three conservative bridges:
  - `rp-phys-sek2-free-damped-oscillations` -> `Gedämpfte Schwingungen beschreiben` (`partial`)
  - `rp-phys-sek2-forced-oscillations-resonance` -> `Erzwungene Schwingungen und Resonanz` (`partial`)
  - `rp-phys-sek2-harmonic-wave-mathematical-representation` -> `Wellengleichung formulieren` (`partial`)

Current reviewed RP cut:

- `49` reviewed mappings
- one first narrow LF Pflichtbaustein follow-on `Schwingungen und Wellen`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the LF Pflichtbaustein `Schwingungen und Wellen` contains one real LF residue beyond the already reviewed RP harmonics, basic-wave, GF-superposition, and narrow LF-wave strips
- `Gedämpfung`, `erzwungene Schwingungen / Resonanz`, and the mathematical wave representation already have narrow enough shared canonical targets for a conservative reviewed bridge
- `Gekoppelte Schwingungen` still has no equally clean shared target and therefore stays intentionally source-led

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now has a fifth reviewed cut inside the oscillation/wave family
- the next clean RP move is not another immediate widening on the same strip but the explicit residue decision on `Periodendauer`, `Polarisation`, `Weisslichtspektrum`, and `gekoppelte Schwingungen`

### 2026-04-16: Rheinland-Pfalz Physics freezes the remaining oscillation/wave micro-residues explicitly on the current reviewed cut

What changed:

- the RP rollout/docs surface now makes the remaining oscillation/wave micro-residues explicit instead of leaving them as open near-term widening debt:
  - `Abhaengigkeit der Periodendauer von systembeschreibenden Groessen an einem Beispiel deuten`
  - `Transversale und longitudinale Wellen sowie lineare Polarisation unterscheiden`
  - `Entstehung des Spektrums von weissem Licht am Doppelspalt fachlich einordnen`
  - `Gekoppelte Schwingungen fachlich einordnen`
- the RP onboarding note, lane README, source README, rollout tracker, topic workboard, parity plan, and M2 shortlist now all say the same thing:
  - those four clauses are explicitly frozen as source-led RP micro-residues on the current reviewed cut
  - the next clean RP widening should come from a different strip unless broader reviewed evidence later warrants a genuinely narrower shared canonical target

Current reviewed RP cut:

- `49` reviewed mappings
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut
- no new mapping row, source split, or canonical atom was needed for this step

Why this decision:

- the current shared oscillation/wave surface already carries the conservative reviewed RP cut on the broad family cleanly enough
- none of the four remaining clauses currently justifies an RP-specific canonical split on its own
- keeping them explicitly frozen is better than pretending they are immediate mapping debt

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane, but the remaining oscillation/wave micro-residues are no longer open immediate widening debt
- the next clean RP move is now a different reviewed strip, not another forced micro-bridge on `Periodendauer`, `Polarisation`, `Weisslichtspektrum`, or `gekoppelte Schwingungen`

### 2026-04-16: Rheinland-Pfalz Physics now also carries the first reviewed Grundfach-Quantenkorridor `Quantenobjekte I`

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one structural quantum/atom anchor plus one first reviewed Grundfach corridor `Quantenobjekte I` with:
  - `Quantenmechanisches Verhalten freier Elektronen und Photonen am Doppelspalt beschreiben`
  - `Zusammenhaenge zwischen Energie, Frequenz, Impuls und Wellenlaenge von Photonen fachlich deuten`
  - `Impuls und Wellenlaenge zur Beschreibung materieller Quantenobjekte verknuepfen`
  - `Nachweiswahrscheinlichkeitsdichte ueber das Betragsquadrat der Zustandsfunktion qualitativ deuten`
  - `Quantenphysikalisches Weltbild zu Realitaet, Lokalitaet, Kausalitaet und Determinismus fachlich einordnen`
  - `Plancksches Wirkungsquantum mit einer experimentellen Methode naeherungsweise bestimmen`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds seven conservative bridges:
  - `rp-phys-sek2-quantum-matter-anchor` -> `Q4 Struktur von Materie, Raum und Zeit` (`partial`)
  - `rp-phys-sek2-quantum-objects-gf` -> `Quantenobjekte` (`partial`)
  - `rp-phys-sek2-quantum-double-slit-behavior` -> `Photonen und Elektronen als Quantenobjekte beschreiben` (`partial`)
  - `rp-phys-sek2-photon-energy-frequency-momentum` -> `Energie und Impuls von Photonen` (`partial`)
  - `rp-phys-sek2-material-quantum-objects-wavelength-momentum` -> `De-Broglie-Wellen` (`partial`)
  - `rp-phys-sek2-wavefunction-detection-probability` -> `Wellenfunktion und Wahrscheinlichkeitsdeutung` (`partial`)
  - `rp-phys-sek2-quantum-worldview-classification` -> `Die Bedeutung von Modellen an Photon und Elektron reflektieren` (`partial`)

Current reviewed RP cut:

- `56` reviewed mappings
- `65` snapshot goals
- root weight `53`
- root atomic closure `53`
- one first reviewed Grundfach-Quantenkorridor `Quantenobjekte I`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the RP MSS strip `Quantenobjekte I` is the next clean adjacent source surface after the stabilized oscillation/wave family
- the shared canonical `Q4 Struktur von Materie, Raum und Zeit` / `Quantenobjekte` surface already carries reviewed multi-state targets for double-slit quantum behavior, photon relations, De-Broglie matter waves, wavefunction-based probability interpretation, and model/worldview reflection
- keeping `Plancksches Wirkungsquantum mit einer experimentellen Methode naeherungsweise bestimmen` source-led avoids overclaiming a narrower shared method target because the current canonical method surface is still photoeffect-specific

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now also widens the shared Q4 quantum surface
- the next clean RP move is the adjacent strip `Quantenmechanische Atomvorstellung I`, not a forced micro-bridge on the RP Planck-estimation clause or a reopening of the already frozen RP oscillation/wave micro-residues

### 2026-04-16: Rheinland-Pfalz Physics now also carries the first reviewed Grundfach-Atommodellkorridor `Quantenmechanische Atomvorstellung I`

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first reviewed Grundfach atom-model corridor `Quantenmechanische Atomvorstellung I` with:
  - `Quantisierte Energieaufnahme von Photonen an Atomen experimentell einordnen`
  - `Quantisierte Emission am Wasserstoffatom ueber Uebergaenge zwischen Energieniveaus deuten`
  - `Energiestufenmodell des Wasserstoffatoms mit den diskreten Energiewerten fachlich nutzen`
  - `Orbitale des Wasserstoffatoms als Nachweiswahrscheinlichkeiten fachlich deuten`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds five conservative bridges:
  - `rp-phys-sek2-quantum-atomic-model-gf` -> `Atomvorstellungen` (`partial`)
  - `rp-phys-sek2-quantized-photon-absorption` -> `Emission, Absorption und Linienspektren` (`partial`)
  - `rp-phys-sek2-hydrogen-emission-energy-level-transitions` -> `Emission, Absorption und Linienspektren` (`partial`)
  - `rp-phys-sek2-hydrogen-energy-level-model` -> `Energieniveaus des Wasserstoffatoms` (`partial`)
  - `rp-phys-sek2-hydrogen-orbital-probability-model` -> `Orbitale des Wasserstoffatoms als Nachweiswahrscheinlichkeiten interpretieren` (`partial`)

Current reviewed RP cut:

- `61` reviewed mappings
- `70` snapshot goals
- root weight `57`
- root atomic closure `57`
- one first reviewed Grundfach-Quantenkorridor `Quantenobjekte I`
- one adjacent first reviewed Grundfach-Atommodellkorridor `Quantenmechanische Atomvorstellung I`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the RP MSS strip `Quantenmechanische Atomvorstellung I` is the clean adjacent reviewed source surface after the stabilized RP quantum-entry strip `Quantenobjekte I`
- the shared canonical atom-model surface already carries narrow enough reviewed targets for quantized absorption/emission, the hydrogen energy-level model, and orbital probability interpretation
- no RP-specific canonical atom was needed to connect the hydrogen-atom model corridor conservatively

Validation used:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now widens the shared Q4 atom-model surface in addition to the earlier `Quantenobjekte I` strip
- the next clean RP move is now the adjacent strip `Quantenmechanische Atomvorstellung II`, while the RP Planck-estimation clause stays intentionally source-led on the current reviewed cut

### 2026-04-17: Rheinland-Pfalz Physics now also carries the first narrow reviewed LF atom-model follow-on `Quantenmechanische Atomvorstellung II`

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first narrow reviewed LF atom-model follow-on `Quantenmechanische Atomvorstellung II` with seven visible application leaves:
  - `Franck-Hertz-Versuch fachlich einordnen`
  - `Natriumresonanzabsorption als Beispiel quantisierter Absorption deuten`
  - `Lumineszenz als atommodellgestuetztes Anwendungsbeispiel fachlich einordnen`
  - `Laser als Anwendungsbeispiel atomarer Uebergaenge fachlich einordnen`
  - `Spektralanalyse fuer diskrete Energiezustaende fachlich nutzen`
  - `Chemische Bindung und Molekuelstruktur als atommodellgestuetzte Anwendung fachlich einordnen`
  - `Farbstoffmolekuele als quantenphysikalisches Anwendungsbeispiel fachlich einordnen`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds four conservative bridges:
  - `rp-phys-sek2-quantum-atomic-model-lf` -> `Atomvorstellungen` (`partial`)
  - `rp-phys-sek2-franck-hertz-experiment` -> `Franck-Hertz-Versuch` (`partial`)
  - `rp-phys-sek2-sodium-resonance-absorption` -> `Emission, Absorption und Linienspektren` (`partial`)
  - `rp-phys-sek2-spectral-analysis` -> `Bedeutung von Flammenfaerbung, Linienspektren und Spektralanalyse fuer Modelle diskreter Energiezustaende interpretieren` (`partial`)

Current reviewed RP cut:

- `65` reviewed mappings
- `78` snapshot goals
- root weight `64`
- root atomic closure `64`
- one first reviewed Grundfach-Quantenkorridor `Quantenobjekte I`
- one adjacent first reviewed Grundfach-Atommodellkorridor `Quantenmechanische Atomvorstellung I`
- one first narrow reviewed LF-Atommodell-Follow-on `Quantenmechanische Atomvorstellung II`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the RP LF strip `Quantenmechanische Atomvorstellung II` already exposes three application examples with narrow enough shared reviewed targets: `Franck-Hertz`, `Natriumresonanzabsorption`, and `Spektralanalyse`
- the remaining LF examples `Lumineszenz`, `Laser`, `chemische Bindung/Molekuelstruktur`, and `Farbstoffmolekuele` would currently force broader or cross-subject claims than the shared canonical Physics surface can conservatively carry
- freezing those four LF application examples as explicit source-led residues is cleaner than inventing a Rheinland-Pfalz-specific canonical split

Validation used:

- JSON-Parse for RP snapshot, RP mapping, membership registry, closure registry, and rollout tracker
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --no-daemon`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now also carries a first narrow LF application strip on the shared atom-model surface
- the next clean RP move is now the adjacent strip `Wechselwirkung von Quantenobjekten`, not another forced split inside the remaining LF application examples of `Quantenmechanische Atomvorstellung II`

### 2026-04-17: Rheinland-Pfalz Physics now also carries the first narrow reviewed LF interaction follow-on `Wechselwirkung von Quantenobjekten`

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first narrow reviewed LF interaction follow-on `Wechselwirkung von Quantenobjekten` with five visible leaves:
  - `Compton-Effekt als Wechselwirkung von Strahlung und Materie fachlich deuten`
  - `Hallwachs-Effekt als Licht-Materie-Wechselwirkung fachlich einordnen`
  - `Paarerzeugung als Wechselwirkung hochenergetischer Strahlung mit Materie fachlich einordnen`
  - `Elektronenbeugung und Bragg-Reflexion als Interferenzphaenomene fachlich deuten`
  - `Entstehung von Roentgenstrahlung fachlich beschreiben`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds four conservative bridges:
  - `rp-phys-sek2-compton-effect` -> `Compton-Effekt` (`partial`)
  - `rp-phys-sek2-hallwachs-effect` -> `Fotöffekt und Einstein-Deutung` (`partial`)
  - `rp-phys-sek2-electron-diffraction-bragg` -> `Bragg-Bedingung anwenden (LK)` (`partial`)
  - `rp-phys-sek2-xray-generation` -> `Röntgenspektren deuten` (`partial`)

Current reviewed RP cut:

- `69` reviewed mappings
- `84` snapshot goals
- root weight `69`
- root atomic closure `69`
- one first reviewed Grundfach-Quantenkorridor `Quantenobjekte I`
- one adjacent first reviewed Grundfach-Atommodellkorridor `Quantenmechanische Atomvorstellung I`
- one first narrow reviewed LF-Atommodell-Follow-on `Quantenmechanische Atomvorstellung II`
- one first narrow reviewed LF-Interaktions-Follow-on `Wechselwirkung von Quantenobjekten`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the RP LF strip `Wechselwirkung von Quantenobjekten` already exposes four examples with narrow enough shared reviewed targets on the existing Q3 quantum / X-ray surface: `Compton-Effekt`, `Hallwachs-Effekt`, `Elektronenbeugung / Bragg-Reflexion`, and `Roentgenstrahlung`
- the remaining source leaf `Paarerzeugung` would currently force a broader or conceptually shifted claim than the shared canonical Physics surface can conservatively carry
- freezing that one LF residue as explicit source-led micro-residue is cleaner than inventing a Rheinland-Pfalz-specific canonical split

Validation used:

- JSON-Parse for RP snapshot, RP mapping, membership registry, closure registry, and rollout tracker
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now also carries a first narrow LF interaction strip on the shared quantum / X-ray surface
- the next clean RP move is now the adjacent strip `Quantenobjekte II`, not another forced split inside the remaining source-led residue `Paarerzeugung`

### 2026-04-17: Rheinland-Pfalz Physics now also carries the first narrow reviewed LF quantum-object follow-on `Quantenobjekte II`

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first narrow reviewed LF quantum-object follow-on `Quantenobjekte II` with four visible leaves:
  - `Interpretationsmoeglichkeiten der Quantentheorie an einem Gedanken- oder Realexperiment fachlich reflektieren`
  - `Elektronenbeugungsroehre als experimentellen Beleg fuer materielle Quantenobjekte fachlich einordnen`
  - `Hallwachs-Effekt als experimentellen Beleg fuer Lichtquanten fachlich einordnen`
  - `Quantenradierer im Hinblick auf Interferenz und Welcher-Weg-Information fachlich deuten`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds five conservative bridges:
  - `rp-phys-sek2-quantum-objects-lf` -> `Quantenobjekte` (`partial`)
  - `rp-phys-sek2-quantum-theory-interpretations` -> `Das Messproblem in der Quantenphysik` (`partial`)
  - `rp-phys-sek2-electron-diffraction-tube` -> `Photonen und Elektronen als Quantenobjekte beschreiben` (`partial`)
  - `rp-phys-sek2-hallwachs-effect-evidence` -> `Fotöffekt und Einstein-Deutung` (`partial`)
  - `rp-phys-sek2-quantum-eraser` -> `Komplementaritaet durch Interferenzfaehigkeit und Welcher-Weg-Information erlaeutern` (`partial`)

Current reviewed RP cut:

- `74` reviewed mappings
- `89` snapshot goals
- root weight `73`
- root atomic closure `73`
- one first reviewed Grundfach-Quantenkorridor `Quantenobjekte I`
- one first narrow reviewed LF-Quantenobjekt-Follow-on `Quantenobjekte II`
- one adjacent first reviewed Grundfach-Atommodellkorridor `Quantenmechanische Atomvorstellung I`
- one first narrow reviewed LF-Atommodell-Follow-on `Quantenmechanische Atomvorstellung II`
- one first narrow reviewed LF-Interaktions-Follow-on `Wechselwirkung von Quantenobjekten`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the RP LF strip `Quantenobjekte II` now exposes one clean shared interpretation/messproblem route plus three experimental-evidence leaves with existing narrow enough reviewed targets on the shared Q4 quantum-object surface
- the new cut widens the already opened RP Q4 family without forcing a new canonical split for named interpretation schools
- reusing the existing shared Messproblem-, Komplementaritaet-, photoeffect-, and quantum-object targets is cleaner than inventing a Rheinland-Pfalz-specific LF package

Validation used:

- JSON-Parse for RP snapshot, RP mapping, membership registry, closure registry, and rollout tracker
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now also carries a first narrow LF quantum-object strip on the shared Q4 surface
- the next clean RP move is now the existing shared LF strip `Elementarteilchenphysik`, not another micro-split inside the already opened RP quantum / atom / interaction family

### 2026-04-17: Rheinland-Pfalz Physics now also carries the first narrow reviewed LF particle-physics follow-on `Elementarteilchenphysik`

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first narrow reviewed LF particle-physics follow-on `Elementarteilchenphysik` with four visible leaves:
  - `Standardmodell als Ordnungsschema der Elementarteilchen fachlich beschreiben`
  - `Fundamentale Wechselwirkungen und Austauschteilchen fachlich einordnen`
  - `Experimentelle Befunde der Elementarteilchenphysik fachlich einordnen`
  - `Offene Fragen der Elementarteilchenphysik an Beispielen fachlich beschreiben`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds four conservative bridges:
  - `rp-phys-sek2-particle-physics-lf` -> `Elementarteilchen und Standardmodell` (`partial`)
  - `rp-phys-sek2-standard-model-ordering-scheme` -> `Standardmodell: Teilchenfamilien` (`partial`)
  - `rp-phys-sek2-fundamental-interactions-exchange-particles` -> `Fundamentale Wechselwirkungen` (`partial`)
  - `rp-phys-sek2-particle-physics-experimental-evidence` -> `Teilchenphysik in der Forschung (CERN)` (`partial`)

Current reviewed RP cut:

- `78` reviewed mappings
- `94` snapshot goals
- root weight `77`
- root atomic closure `77`
- one first narrow reviewed LF particle-physics follow-on `Elementarteilchenphysik`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the RP LF strip `Elementarteilchenphysik` is the next clean adjacent source surface after the stabilized RP quantum / atom / interaction family
- the shared canonical Q4 particle-physics surface already carries narrow enough reviewed targets for the Standardmodell as ordering scheme, the four fundamental interactions, and the research-facing experimental evidence surface
- keeping `Offene Fragen` source-led avoids overclaiming the broader existing research/CERN target before wider reviewed evidence exists

Validation used:

- JSON-Parse for RP snapshot, RP mapping, membership registry, closure registry, and rollout tracker
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now also carries a first narrow LF particle-physics strip on the shared Q4 surface
- the next clean RP move is now the adjacent shared LF strip `Relativistische Kinematik`, not another micro-split inside the already opened RP particle-physics residue `Offene Fragen`

### 2026-04-17: Rheinland-Pfalz Physics now also carries the first narrow reviewed LF relativity-kinematics follow-on `Relativistische Kinematik`

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first narrow reviewed LF follow-on `Relativistische Kinematik` with three visible reviewed leaves:
  - `Relativitaetspostulate, Relativitaet der Gleichzeitigkeit und experimentelle Belege fachlich einordnen`
  - `Lorentz-Kontraktion, Zeitdilatation und Zwillingsparadoxon fachlich deuten`
  - `Raum-Zeit-Diagramme in relativistischen Kontexten fachlich nutzen`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds four conservative bridges:
  - `rp-phys-sek2-relativistic-kinematics-lf` -> `Spezielle Relativitätstheorie` (`partial`)
  - `rp-phys-sek2-relativity-postulates-simultaneity-experiments` -> `Relativitätspostulate und Experimente` (`partial`)
  - `rp-phys-sek2-relativistic-consequences` -> `Zeitdilatation und Längenkontraktion` (`partial`)
  - `rp-phys-sek2-spacetime-diagrams` -> `Minkowski-Diagramme nutzen` (`partial`)

Current reviewed RP cut:

- `82` reviewed mappings
- `98` snapshot goals
- root weight `80`
- root atomic closure `80`
- one first narrow reviewed LF relativity-kinematics follow-on `Relativistische Kinematik`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the RP LF strip `Relativistische Kinematik` is the next clean adjacent source surface after the stabilized RP particle-physics strip
- the shared canonical special-relativity surface already carries narrow enough reviewed targets for postulates plus experimental evidence, relativistic consequences, and Minkowski-diagram usage
- folding the experimental evidence clause into the first reviewed RP leaf keeps the cut narrow and avoids a redundant second bridge onto the same shared experimental target

Validation used:

- JSON-Parse for RP snapshot, RP mapping, membership registry, closure registry, and rollout tracker
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now also carries a first narrow LF relativity-kinematics strip on the shared special-relativity surface
- the next clean RP move is now the adjacent shared LF strip `Relativistische Dynamik`

### 2026-04-18: Rheinland-Pfalz Physics now also carries the first narrow reviewed LF relativity-dynamics follow-on `Relativistische Dynamik`

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first narrow reviewed LF follow-on `Relativistische Dynamik` with three visible leaves:
  - `Masse-Energie-Aequivalenz fachlich einordnen`
  - `Abhaengigkeit der Zeit vom Gravitationsfeld und experimentelle Belege fachlich einordnen`
  - `Zusammenhaenge zwischen Energie, Impuls, Geschwindigkeit sowie Grenzgeschwindigkeit und Grenzfaelle fachlich deuten`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds one conservative bridge:
  - `rp-phys-sek2-gravitational-time-dependence-evidence` -> `GPS und Relativitätstheorie` (`partial`)

Current reviewed RP cut:

- `83` reviewed mappings
- `102` snapshot goals
- root weight `83`
- root atomic closure `83`
- one first narrow reviewed LF relativity-dynamics follow-on `Relativistische Dynamik`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the RP LF strip `Relativistische Dynamik` is the next clean adjacent source surface after the stabilized RP relativity-kinematics strip
- the shared canonical relativity surface already carries one narrow enough reviewed target for the gravitation/time clause via `GPS und Relativitätstheorie`
- `Masse-Energie-Aequivalenz` plus the retained RP LF clause on `Energie`, `Impuls`, `Geschwindigkeit`, `Grenzgeschwindigkeit`, and `Grenzfaelle` stay intentionally source-led because the current shared canonical relativity surface still has no genuinely narrow reviewed targets for them

Validation used:

- JSON-Parse for RP snapshot, RP mapping, membership registry, closure registry, and rollout tracker
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now also carries a first narrow LF relativity-dynamics strip on the shared relativity surface
- the next clean RP move is now the adjacent LF strip `Astrophysik`

### 2026-04-19: Rheinland-Pfalz Physics now also carries the first narrow reviewed LF astrophysics follow-on `Astrophysik`

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first narrow reviewed LF follow-on `Astrophysik` with four visible leaves:
  - `Zustandsgroessen der Sonne fachlich einordnen`
  - `Masse-Leuchtkraft-Beziehung und Sternentwicklung fachlich einordnen`
  - `Standardsonnenmodell fachlich einordnen`
  - `Aktuelle Forschungsergebnisse der Astrophysik fachlich einordnen`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds two conservative bridges:
  - `rp-phys-sek2-astrophysics-lf` -> `Astrophysik` (`partial`)
  - `rp-phys-sek2-mass-luminosity-stellar-evolution` -> `Sternentstehung und Sternentwicklung` (`partial`)

Current reviewed RP cut:

- `85` reviewed mappings
- `107` snapshot goals
- root weight `87`
- root atomic closure `87`
- one first narrow reviewed LF astrophysics follow-on `Astrophysik`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the RP LF strip `Astrophysik` is the next clean adjacent source surface after the stabilized RP relativity strips
- the shared canonical astrophysics surface already carries a narrow enough reviewed cluster target for the strip and one sufficiently conservative reviewed bridge on `Sternentwicklung`
- `Zustandsgroessen der Sonne`, `Standardsonnenmodell`, and `Aktuelle Forschungsergebnisse` stay intentionally source-led because the current shared canonical astrophysics surface still has no genuinely narrow reviewed targets for them

Validation used:

- JSON-Parse for RP snapshot, RP mapping, membership registry, closure registry, and rollout tracker
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now also carries a first narrow LF astrophysics strip on the shared Q4 astrophysics surface
- the next clean RP move is now the adjacent LF strip `Kosmologie`

### 2026-04-19: Rheinland-Pfalz Physics now also carries the first narrow reviewed LF cosmology follow-on `Kosmologie`

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first narrow reviewed LF follow-on `Kosmologie` with three visible leaves:
  - `Struktur des Universums fachlich beschreiben`
  - `Urknalltheorie, Hintergrundstrahlung, Hubble-Gesetz und Weltalter fachlich einordnen`
  - `Aktuelle Forschungsergebnisse der Kosmologie fachlich einordnen`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds three conservative bridges:
  - `rp-phys-sek2-cosmology-lf` -> `Astrophysik` (`partial`)
  - `rp-phys-sek2-structure-of-universe` -> `Struktur und Alter des Universums` (`partial`)
  - `rp-phys-sek2-universe-development-big-bang-hubble-age` -> `Kosmologie und Urknall` (`partial`)

Current reviewed RP cut:

- `88` reviewed mappings
- `111` snapshot goals
- root weight `90`
- root atomic closure `90`
- one first narrow reviewed LF cosmology follow-on `Kosmologie`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the RP LF strip `Kosmologie` is the next clean adjacent source surface after the stabilized RP astrophysics strip
- the shared canonical astrophysics surface already carries one narrow reviewed target for `Struktur und Alter des Universums` and one sufficiently conservative reviewed target for `Kosmologie und Urknall`
- `Aktuelle Forschungsergebnisse der Kosmologie` stays intentionally source-led because the current shared canonical cosmology surface still has no genuinely narrow reviewed target for it

Validation used:

- JSON-Parse for RP snapshot, RP mapping, membership registry, closure registry, and rollout tracker
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now also carries a first narrow LF cosmology strip on the shared Q4 astrophysics/cosmology surface
- the next clean RP move is now the adjacent LF strip `Chaos und Fraktale`

### 2026-04-19: Rheinland-Pfalz Physics now also carries the first narrow reviewed LF chaos follow-on `Chaos und Fraktale`

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first narrow reviewed LF follow-on `Chaos und Fraktale` with three visible leaves:
  - `Beispiele von Chaosphaenomenen und fraktalen Strukturen fachlich einordnen`
  - `Merkmale und Systembedingungen chaotischer Systeme fachlich beschreiben`
  - `Strukturelle Aehnlichkeiten in verschiedenen Bereichen fachlich einordnen`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds one conservative bridge:
  - `rp-phys-sek2-characteristics-of-chaotic-systems` -> `Grenzen der Vorhersagbarkeit (Chaos)` (`partial`)

Current reviewed RP cut:

- `89` reviewed mappings
- `115` snapshot goals
- root weight `93`
- root atomic closure `93`
- one first narrow reviewed LF chaos follow-on `Chaos und Fraktale`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the RP LF strip `Chaos und Fraktale` is the next clean adjacent source surface after the stabilized RP cosmology strip
- the shared canonical Physics surface currently exposes exactly one narrow enough reviewed chaos target on limits of predictability / sensitivity to initial conditions
- the RP clauses on `Chaosphaenomene und fraktale Strukturen` and `Strukturelle Aehnlichkeiten in verschiedenen Bereichen` stay intentionally source-led because the current shared canonical chaos surface still has no genuinely narrow reviewed targets for them

Validation used:

- JSON-Parse for RP snapshot, RP mapping, membership registry, closure registry, and rollout tracker
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now also carries one first narrow LF chaos strip on the shared chaos surface
- the next clean RP move is now the adjacent LF strip `Stroemungsphysik`

### 2026-04-19: Rheinland-Pfalz Physics now also carries the first narrow reviewed LF fluid-dynamics follow-on `Stroemungsphysik`

What changed:

- the active RP upper-secondary Physics snapshot in
  - `curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot`
  now also contains one first narrow reviewed LF follow-on `Stroemungsphysik` with four visible leaves:
  - `Stroemungsphaenomene und Stroemungsarten fachlich einordnen`
  - `Kontinuitaetsgleichung, Stroemungsgesetze und Reynolds-Zahl fachlich einordnen`
  - `Dynamischen Auftrieb fachlich einordnen`
  - `Sinkgeschwindigkeiten im Praktikum fachlich einordnen`
- the RP mapping lane in
  - `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json`
  now adds one conservative bridge:
  - `rp-phys-sek2-dynamic-lift` -> `Auftrieb an Tragflächen und Luftwiderstand qualitativ einordnen` (`partial`)

Current reviewed RP cut:

- `90` reviewed mappings
- `120` snapshot goals
- root weight `97`
- root atomic closure `97`
- one first narrow reviewed LF fluid-dynamics follow-on `Stroemungsphysik`
- no Rheinland-Pfalz-specific canonical Physics atom
- no committed Rheinland-Pfalz applicability cut

Why this cut:

- the RP LF strip `Stroemungsphysik` is the next clean adjacent source surface after the stabilized RP chaos strip
- the shared canonical Physics surface currently exposes exactly one sufficiently narrow reviewed target on dynamic lift at airfoils
- the RP clauses on `Stroemungsphaenomene und Stroemungsarten`, `Kontinuitaetsgleichung` / `Stroemungsgesetze` / `Reynolds-Zahl`, and `Sinkgeschwindigkeiten im Praktikum` stay intentionally source-led because the current shared canonical Physics surface still has no genuinely narrow reviewed targets for them

Validation used:

- JSON-Parse for RP snapshot, RP mapping, membership registry, closure registry, and rollout tracker
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `git diff --check`

Interpretation:

- Rheinland-Pfalz remains the active Physics lane and now also carries one first narrow LF fluid-dynamics strip on the current shared cross-stage pressure/buoyancy surface
- the next clean RP move is no longer another reviewed corridor on the same lane, but an explicit closure decision on the remaining LF residue `Individuelles Thema`

### 2026-04-19: Physics rollout steering is reset to `all sources first`, matching Mathematics

What changed:

- the Physics rollout tracker in
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  now treats the Rheinland-Pfalz lane as stable at the current reviewed cut instead of as the active widening target
- the active Physics corridor is now the missing-state source-onboarding tranche for:
  - `DE-HB`
  - `DE-HH`
  - `DE-MV`
  - `DE-SL`
  - `DE-SN`
  - `DE-ST`
  - `DE-TH`
- those seven states are now explicitly tracked in the Physics rollout tracker as `P0` placeholders with source-onboarding next steps
- the Physics topic workboard in
  - `docs/dev/canonical-gymnasium-physics-topic-workboard.md`
  now states the corrected working rule:
  - first archive the still-missing official Physics source materials locally
  - only then continue the topic-first horizontal pass across Bundeslaender

Why this reset:

- this is the cleaner rollout discipline and matches the Mathematics migration pattern
- continuing to widen Rheinland-Pfalz while seven Bundeslaender still have no local retained Physics source lane would deepen source asymmetry and bias later canonical decisions
- the current nationwide Physics debt is now primarily the missing local source base, not another reviewed corridor inside an already-open state lane

Validation used:

- JSON-Parse for the updated Physics rollout tracker
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- Physics is now again steered by the same order that already worked in Mathematics: source completeness first, then horizontal topic work
- the next correct Physics move is therefore source acquisition / local archiving for the seven still-missing Bundeslaender, not another reviewed RP corridor

### 2026-04-19: Bremen Physics source onboarding is now at `P1`

What changed:

- the official Bremen Gymnasiale-Oberstufe Physics PDF is now archived locally at:
  - `curricula/DE/Gymnasium/input/HB/GyO_Physik_2022.pdf`
- the Bremen input README in
  - `curricula/DE/Gymnasium/input/HB/README.md`
  now documents both the retained local PDF and the official direct PDF source
- the Physics rollout tracker in
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  now lifts `DE-HB` from `P0` to `P1`

Current Bremen Physics state:

- official upper-secondary source archived locally
- no source snapshot yet
- no provenance-backed source lane yet
- no mapping lane yet

Why this cut:

- this is the correct first move under the restored `all sources first` rollout order
- it creates a real retained local source asset instead of keeping Bremen as a README-only placeholder
- it still stops short of any topic-specific modeling until the source-backed snapshot lane exists

Validation used:

- local file check on `curricula/DE/Gymnasium/input/HB/GyO_Physik_2022.pdf`
- tracker JSON parse
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the missing-state Physics source-onboarding tranche has now moved from pure placeholders to the first concrete retained local source asset
- the next clean move in the tranche is another missing-state source archive or the first Bremen source snapshot, not a return to Rheinland-Pfalz widening

### 2026-04-19: Physics source onboarding is clarified to cover Sek I and Sek II together

What changed:

- the Physics rollout tracker in
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  now states the missing-state source-onboarding tranche explicitly for both Sek I and Sek II where applicable
- the Bremen source-onboarding state now reflects the real retained asset set:
  - Sek I Naturwissenschaften Gymnasium PDF
  - Sek-I restriction note from 2022
  - Sek-II Gymnasiale-Oberstufe Physik PDF
- the Physics topic workboard in
  - `docs/dev/canonical-gymnasium-physics-topic-workboard.md`
  now makes the same point explicitly: the current source tranche is not a Sek-II-only pass

Why this clarification:

- that is the correct analogue to the Mathematics rollout
- otherwise the source base would remain asymmetrical between lower and upper secondary even before the horizontal topic pass begins
- the right order is therefore:
  - source completeness across stages first
  - topic-first reviewed corridor work second

Validation used:

- tracker JSON parse
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active Physics source tranche now explicitly means: archive the missing Bundesland sources for Sek I and Sek II, not only for Sek II

### 2026-04-19: Hamburg Physics source onboarding is now at `P1`

What changed:

- the official Hamburg Physics PDFs are now archived locally at:
  - `curricula/DE/Gymnasium/input/HH/physik-gym-seki-data.pdf`
  - `curricula/DE/Gymnasium/input/HH/physik-gyo-2022-data.pdf`
- the Hamburg input README in
  - `curricula/DE/Gymnasium/input/HH/README.md`
  now documents the retained local Sek-I and Sek-II Physics PDFs with their direct official sources
- the Physics rollout tracker in
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  now lifts `DE-HH` from `P0` to `P1`

Current Hamburg Physics state:

- official Sek-I source archived locally
- official Sek-II source archived locally
- no source snapshot yet
- no provenance-backed source lane yet
- no mapping lane yet

Why this cut:

- it follows the restored `all sources first` order
- it keeps Hamburg symmetric across Sek I and Sek II before any topic-first modeling begins
- it converts Hamburg from a README-only placeholder into a real retained source lane candidate without overclaiming any curricular structure yet

Validation used:

- local file checks on the two archived Hamburg PDFs
- tracker JSON parse
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the missing-state source-onboarding tranche now has two real retained local source families, Bremen and Hamburg
- the next clean move is the same for the next missing Bundesland: archive Sek I and Sek II first, then activate snapshots later

### 2026-04-19: Mecklenburg-Vorpommern Physics source onboarding is now at `P1`

What changed:

- the official Mecklenburg-Vorpommern Physics PDFs are now archived locally at:
  - `curricula/DE/Gymnasium/input/MV/Physik_Gymnasium_7_10_2022.pdf`
  - `curricula/DE/Gymnasium/input/MV/Physik_Gymnasium_11_12_2022.pdf`
- the Mecklenburg-Vorpommern input README in
  - `curricula/DE/Gymnasium/input/MV/README.md`
  now documents the retained local Sek-I and Sek-II Physics PDFs with their direct official sources
- the Physics rollout tracker in
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  now lifts `DE-MV` from `P0` to `P1`

Current Mecklenburg-Vorpommern Physics state:

- official Sek-I source archived locally
- official Sek-II source archived locally
- no source snapshot yet
- no provenance-backed source lane yet
- no mapping lane yet

Why this cut:

- it follows the restored `all sources first` order
- it keeps Mecklenburg-Vorpommern symmetric across Sek I and Sek II before any topic-first modeling begins
- it converts Mecklenburg-Vorpommern from a README-only placeholder into a real retained source lane candidate without overclaiming any curricular structure yet

Validation used:

- local file checks on the two archived Mecklenburg-Vorpommern PDFs
- tracker JSON parse
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the missing-state source-onboarding tranche now has three real retained local source families: Bremen, Hamburg, and Mecklenburg-Vorpommern
- the next clean move is the same again for the next missing Bundesland: archive Sek I and Sek II first, then activate snapshots later

### 2026-04-19: Sachsen-Anhalt Physics source onboarding is now at `P1`

What changed:

- the official Sachsen-Anhalt Physics PDFs are now archived locally at:
  - `curricula/DE/Gymnasium/input/ST/Physik_FLP_Gym_01_07_2019.pdf`
  - `curricula/DE/Gymnasium/input/ST/FLP_Physik_Gym_01082022_swd.pdf`
- the Sachsen-Anhalt input README in
  - `curricula/DE/Gymnasium/input/ST/README.md`
  now documents the retained local Physics PDF family with the direct official LISA sources
- the Physics rollout tracker in
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  now lifts `DE-ST` from `P0` to `P1`

Current Sachsen-Anhalt Physics state:

- official retained Physics source family archived locally
- the same retained source family spans Sek I and Sek II
- no source snapshot yet
- no provenance-backed source lane yet
- no mapping lane yet

Why this cut:

- it follows the restored `all sources first` order
- it gives Sachsen-Anhalt a real retained local Physics source family without jumping ahead to topic work
- the archived official family already spans Sek I and Sek II, so this is a clean `P1` source cut without inventing separate stage-specific files

Validation used:

- local file checks on the two archived Sachsen-Anhalt Physics PDFs
- tracker JSON parse
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the missing-state source-onboarding tranche now has four real retained local source families: Bremen, Hamburg, Mecklenburg-Vorpommern, and Sachsen-Anhalt
- the next clean move is still the same: archive the next missing Bundesland source family first, then activate snapshots later

### 2026-04-19: Sachsen Physics source onboarding is now at `P1`

What changed:

- the official Sachsen Gymnasium Physics PDF is now archived locally at:
  - `curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-physik-sachsen-2025.pdf`
- the Sachsen input README in
  - `curricula/DE/Gymnasium/input/SN/README.md`
  now documents the retained local Physics PDF with the direct official Lehrplandatenbank source
- the Physics rollout tracker in
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  now lifts `DE-SN` from `P0` to `P1`

Current Sachsen Physics state:

- official retained Physics source family archived locally
- the same retained source family spans Sek I and Sek II
- no source snapshot yet
- no provenance-backed source lane yet
- no mapping lane yet

Why this cut:

- it follows the restored `all sources first` order
- Sachsen exposes one shared official Gymnasium Physics PDF for classes `6-10` and year levels `11/12`, so a single retained source family is the correct source-first cut
- it converts Sachsen from a README-only placeholder into a real retained source lane candidate without overclaiming any reviewed curricular structure yet

Validation used:

- local file check on the archived Sachsen Gymnasium Physics PDF
- tracker JSON parse
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the missing-state source-onboarding tranche now has five real retained local source families: Bremen, Hamburg, Mecklenburg-Vorpommern, Sachsen-Anhalt, and Sachsen
- the next clean move is still the same: archive the next missing Bundesland source family first, then activate snapshots later

### 2026-04-19: Thueringen Physics source onboarding is now at `P1`

What changed:

- the official Thueringen Gymnasium Physics PDFs are now archived locally at:
  - `curricula/DE/Gymnasium/input/TH/LP_GY_Physik_2012.pdf`
  - `curricula/DE/Gymnasium/input/TH/LP_GY_Physik_2024.pdf`
- the Thueringen input README in
  - `curricula/DE/Gymnasium/input/TH/README.md`
  now documents the retained local Physics PDFs with their direct official Schulportal sources
- the Physics rollout tracker in
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  now lifts `DE-TH` from `P0` to `P1`

Current Thueringen Physics state:

- official retained Physics source family archived locally
- the retained source family spans Sek I and Sek II through the 2012 base PDF plus the 2024 upper-secondary update
- no source snapshot yet
- no provenance-backed source lane yet
- no mapping lane yet

Why this cut:

- it follows the restored `all sources first` order
- the Thueringen Physics base source is not just an Oberstufen fragment: the 2012 PDF already covers Klassenstufen `7-10`, Einfuehrungsphase, and Qualifikationsphase
- the 2024 PDF is needed in addition because it explicitly replaces the Qualifikationsphasen-Kapitel of the 2012 source from Schuljahr `2025/26` onward

Validation used:

- local file checks on the two archived Thueringen Physics PDFs
- tracker JSON parse
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the missing-state source-onboarding tranche now has six real retained local source families: Bremen, Hamburg, Mecklenburg-Vorpommern, Sachsen-Anhalt, Sachsen, and Thueringen
- the only remaining blocked source-onboarding state in the tranche is Saarland

### 2026-04-20: Saarland Physics source onboarding is now at `P1`

What changed:

- the official Saarland Physics bundle is now present locally under:
  - `curricula/DE/Gymnasium/input/SL/NW_5und6_Gym_2012.pdf`
  - `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_7_2023.pdf`
  - `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_8_NW_Zweig_2024.pdf`
  - `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_8_spr_Zweig_2024.pdf`
  - `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_9_inf_Zweig_2024.pdf`
  - `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_9_nw_Zweig_2024.pdf`
  - `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_10_inf_Zweig_2026.pdf`
  - `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_10_nw_Zweig_2026.pdf`
  - `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_10_zweistuendig_ohne_Infozweig_2026.pdf`
  - `curricula/DE/Gymnasium/input/SL/LP_Ph_EP_GOS_2023.pdf`
  - `curricula/DE/Gymnasium/input/SL/LP_Ph_HP_GK_2023.pdf`
  - `curricula/DE/Gymnasium/input/SL/LP_Ph_HP_LK_2023.pdf`
  - `curricula/DE/Gymnasium/input/SL/APA_Physik_2023.pdf`
  - `curricula/DE/Gymnasium/input/SL/HInweis_IQB_Formelsammlung.pdf`
- the Saarland input README in
  - `curricula/DE/Gymnasium/input/SL/README.md`
  now documents the retained lower-secondary and upper-secondary Physics bundle
- the Physics rollout tracker in
  - `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
  now lifts `DE-SL` from `P0` to `P1`

Current Saarland Physics state:

- official retained Physics source family archived locally
- the lower-secondary bundle includes the `5/6` Naturwissenschaften feeder and branch-sensitive Physik files for `7-10`
- the upper-secondary bundle includes Einfuehrungsphase, Hauptphase `G-Kurs`, Hauptphase `Leistungskurs`, and retained APA/IQB support documents
- no source snapshot yet
- no provenance-backed source lane yet
- no mapping lane yet

Why this cut:

- it resolves the last missing state in the archive tranche without inventing any reviewed curricular structure
- it restores symmetry with the Mathematics rollout: all Bundeslaender now have locally archived Physics source material before another horizontal topic pass begins
- the bundle was already placed locally, so the correct repo move is to register it explicitly rather than keep Saarland falsely blocked at `P0`

Validation used:

- local file checks on the archived Saarland Physics PDFs
- tracker JSON parse
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the missing-state Physics source-archive tranche is now complete across all seven previously unarchived states
- the next active rollout step is no longer source acquisition, but retained source-snapshot and provenance activation for those newly archived bundles

### 2026-04-20: Physics source-archive tranche is complete; the active move is now snapshot activation

What changed:

- the tracker/workboard steering no longer treats missing-state Physics source acquisition as the active work item
- the completed archive tranche for `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH` is now frozen as finished intake work
- the active rollout move is now the first retained lower-secondary and upper-secondary source-snapshot plus provenance activation for those seven states

Why this steering update:

- the repo now has real retained local Physics source assets for every Bundesland lane in the intake tranche
- leaving the old source-acquisition corridor marked active would make the steering artifact stale
- the next correct move, consistent with Mathematics, is to activate source-backed lanes before the next horizontal topic-row widening

Validation used:

- tracker JSON parse
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- Physics is now out of the archive-intake phase and into the source-snapshot activation phase
- the next clean implementation step is to build the first retained lower-secondary and upper-secondary snapshots plus provenance scaffold for the newly archived states, not to widen another reviewed state corridor yet

### 2026-04-20: Bremen Physics moves from `P1` archive-only to `P2` source-backed snapshots

What changed:

- the first retained Bremen lower-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/HB/lower-secondary/source-json/DE_BRE_S_GYM_1_PHYSIK.de.json.snapshot`
- the first retained Bremen upper-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/HB/upper-secondary/source-json/DE_BRE_S_GYM_2_PHYSIK.de.json.snapshot`
- the shared provenance registries now activate both Bremen Physics source landscapes:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the Bremen input README and a new onboarding note now document the active retained source lanes:
  - `curricula/DE/Gymnasium/input/HB/README.md`
  - `curricula/DE/Gymnasium/provenance/hb-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-HB` from `P1` to `P2`

Current Bremen Physics state:

- lower-secondary retained source lane active with one orientation anchor, one `J7/8` strip on `Schall`, `Licht`, `Kraefte/Bewegung`, and `Elektrostatik`, plus one `J9` strip on `Stromkreis`, `Elektromagnetismus`, and `Radioaktivitaet`
- upper-secondary retained source lane active with one orientation anchor, one Einfuehrungsphase strip on `Mechanik` and `Energie`, plus three broad qualification anchors on `Felder`, `Schwingungen/Wellen`, and `Quantenphysik/Materie`
- no Bremen Physics mapping lane yet
- no Bremen-specific canonical Physics atom yet
- no committed Bremen applicability cut yet

Why this cut:

- it is the first real Physics `P2` activation after the nationwide archive tranche completed
- it keeps the new Bremen lanes intentionally narrow and source-led instead of inventing reviewed Physics mapping before the rest of the newly archived states have matching source-backed lanes
- it restores the same rollout discipline used earlier in Mathematics: source-backed state lanes first, horizontal reviewed mapping only afterwards

Validation used:

- JSON parse of the two new Bremen Physics snapshots
- tracker JSON parse
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active Physics blocker is no longer Bremen source availability; Bremen is now a real retained source lane for both Sek I and Sek II
- the active `F4.ALL_NEWLY_ARCHIVED_STATE_SNAPSHOT_ACTIVATION` corridor remains open, but now with Bremen already converted from archive-only intake to source-backed snapshot/provenance state

### 2026-04-20: Hamburg Physics moves from `P1` archive-only to `P2` source-backed snapshots

What changed:

- the first retained Hamburg lower-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/HH/lower-secondary/source-json/DE_HAM_S_GYM_1_PHYSIK.de.json.snapshot`
- the first retained Hamburg upper-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/HH/upper-secondary/source-json/DE_HAM_S_GYM_2_PHYSIK.de.json.snapshot`
- the shared provenance registries now activate both Hamburg Physics source landscapes:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the Hamburg input README and a new onboarding note now document the active retained source lanes:
  - `curricula/DE/Gymnasium/input/HH/README.md`
  - `curricula/DE/Gymnasium/provenance/hh-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-HH` from `P1` to `P2`

Current Hamburg Physics state:

- lower-secondary retained source lane active with one orientation anchor, one `J8` strip on `Elektrizitaet`, `Bewegung und Kraft`, and `Licht und Schall`, plus one transition strip on `Elektrizitaet und Magnetismus`, `Bewegung und Kraft`, `Energie`, and `Licht und Materie`
- upper-secondary retained source lane active with one orientation anchor plus four broad Studienstufen anchors on `Elektrische und magnetische Felder`, `Mechanische und elektromagnetische Schwingungen und Wellen`, `Quantenphysik und Materie`, and `Gravitation und Astrophysik`
- no Hamburg Physics mapping lane yet
- no Hamburg-specific canonical Physics atom yet
- no committed Hamburg applicability cut yet

Why this cut:

- it keeps the second newly archived Physics state aligned with the same `P2` activation discipline used for Bremen
- it stays strictly source-backed and intentionally narrow instead of inventing reviewed Physics mapping before the rest of the newly archived states also have active retained lanes
- it preserves the mathematics-style rollout order: first all states get source-backed Sek-I and Sek-II lanes, only afterwards do horizontal reviewed topic cuts reopen

Validation used:

- JSON parse of the two new Hamburg Physics snapshots
- tracker JSON parse
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active Physics blocker is no longer Hamburg source availability; Hamburg is now a real retained source lane for both Sek I and Sek II
- the active `F4.ALL_NEWLY_ARCHIVED_STATE_SNAPSHOT_ACTIVATION` corridor remains open, now with both Bremen and Hamburg converted from archive-only intake to source-backed snapshot/provenance state

### 2026-04-20: Mecklenburg-Vorpommern Physics moves from `P1` archive-only to `P2` source-backed snapshots

What changed:

- the first retained Mecklenburg-Vorpommern lower-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/MV/lower-secondary/source-json/DE_MVP_S_GYM_1_PHYSIK.de.json.snapshot`
- the first retained Mecklenburg-Vorpommern upper-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/MV/upper-secondary/source-json/DE_MVP_S_GYM_2_PHYSIK.de.json.snapshot`
- the shared provenance registries now activate both Mecklenburg-Vorpommern Physics source landscapes:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the Mecklenburg-Vorpommern input README and a new onboarding note now document the active retained source lanes:
  - `curricula/DE/Gymnasium/input/MV/README.md`
  - `curricula/DE/Gymnasium/provenance/mv-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-MV` from `P1` to `P2`

Current Mecklenburg-Vorpommern Physics state:

- lower-secondary retained source lane active with one orientation anchor, one class-7 strip on `Dichte`, `Kraefte`, and `Physik auf der Baustelle`, one class-8 strip on `Licht`, `elektrische Ladung`, `Stromkreise`, and `Temperatur und Waerme`, one class-9 strip on `Magnetismus`, `Gleichstrommotor und Induktion`, `geradlinige Bewegung`, and `Mit dem E-Bike unterwegs`, plus one class-10 strip on `gleichmaessig beschleunigte Bewegung`, `Dynamik`, `Gravitationsfeld und Kreisbewegung`, and `Kernphysik`
- upper-secondary retained source lane active with one orientation anchor, one integratives Oberstufenband, plus three broad Themenanker on `Elektrische und magnetische Felder`, `Schwingungen und Wellen`, and `Quantenphysik und Materie`
- no Mecklenburg-Vorpommern Physics mapping lane yet
- no Mecklenburg-Vorpommern-specific canonical Physics atom yet
- no committed Mecklenburg-Vorpommern applicability cut yet

Why this cut:

- it brings the third newly archived Physics state onto the same `P2` source-backed footing as Bremen and Hamburg
- it keeps the MV lanes source-led and class-/theme-anchored instead of opening premature reviewed mapping while the nationwide snapshot tranche is still incomplete
- it stays aligned with the mathematics rollout order: source-backed Sek-I and Sek-II lanes first, horizontal reviewed corridor work afterwards

Validation used:

- JSON parse of the two new Mecklenburg-Vorpommern Physics snapshots
- tracker JSON parse
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active Physics blocker is no longer Mecklenburg-Vorpommern source availability; Mecklenburg-Vorpommern is now a real retained source lane for both Sek I and Sek II
- the active `F4.ALL_NEWLY_ARCHIVED_STATE_SNAPSHOT_ACTIVATION` corridor remains open, now with Bremen, Hamburg, and Mecklenburg-Vorpommern converted from archive-only intake to source-backed snapshot/provenance state

### 2026-04-20: Sachsen Physics moves from `P1` archive-only to `P2` source-backed snapshots

What changed:

- the first retained Sachsen lower-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/SN/lower-secondary/source-json/DE_SAC_S_GYM_1_PHYSIK.de.json.snapshot`
- the first retained Sachsen upper-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/SN/upper-secondary/source-json/DE_SAC_S_GYM_2_PHYSIK.de.json.snapshot`
- the shared provenance registries now activate both Sachsen Physics source landscapes:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the Sachsen input README and a new onboarding note now document the active retained source lanes:
  - `curricula/DE/Gymnasium/input/SN/README.md`
  - `curricula/DE/Gymnasium/provenance/sn-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-SN` from `P1` to `P2`

Current Sachsen Physics state:

- lower-secondary retained source lane active with one orientation anchor plus retained class strips for `Klassenstufe 6` (`Licht`, `Eigenschaften und Bewegungen von Koerpern`, `Temperatur und Zustand von Koerpern`, `Elektrische Stromkreise`), `Klassenstufe 7` (`Kraefte`, `Stromstaerke und Spannung in Stromkreisen`, `Energiewandler`), `Klassenstufe 8` (`Mechanik der Fluessigkeiten und Gase`, `Thermische Energie`, `Eigenschaften elektrischer Bauelemente`, `Selbststaendiges Experimentieren`), `Klassenstufe 9` (`Grundlagen der Elektronik`, `Energieversorgung`, `Bewegungsgesetze`, `Physikalisches Praktikum`), and `Klassenstufe 10` (`Mechanische Schwingungen und Wellen`, `Kosmos, Erde und Mensch`, `Licht als Strahl und Welle`, `Hertz'sche Wellen`, `Physikalisches Praktikum`)
- upper-secondary retained source lane active with one orientation anchor plus broad `GK11`, `GK12`, `LK11`, and `LK12` strips on the shared Gymnasium Lehrplan
- no Sachsen Physics mapping lane yet
- no Sachsen-specific canonical Physics atom yet
- no committed Sachsen applicability cut yet

Why this cut:

- it brings Sachsen onto the same `P2` source-backed footing as Bremen, Hamburg, and Mecklenburg-Vorpommern
- it keeps the Sachsen lanes source-led and class-/course-anchored instead of opening premature reviewed mapping while the nationwide snapshot tranche is still incomplete
- it stays aligned with the mathematics rollout order: source-backed Sek-I and Sek-II lanes first, horizontal reviewed corridor work afterwards

Validation used:

- JSON parse of the two new Sachsen Physics snapshots
- JSON parse of the updated source-landscape, membership, closure, and tracker registries
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active Physics blocker is no longer Sachsen source availability; Sachsen is now a real retained source lane for both Sek I and Sek II
- the active `F4.ALL_NEWLY_ARCHIVED_STATE_SNAPSHOT_ACTIVATION` corridor remains open, now with Bremen, Hamburg, Mecklenburg-Vorpommern, and Sachsen converted from archive-only intake to source-backed snapshot/provenance state

### 2026-04-20: Sachsen-Anhalt Physics moves from `P1` archive-only to `P2` source-backed snapshots

What changed:

- the first retained Sachsen-Anhalt lower-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/ST/lower-secondary/source-json/DE_SAN_S_GYM_1_PHYSIK.de.json.snapshot`
- the first retained Sachsen-Anhalt upper-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/ST/upper-secondary/source-json/DE_SAN_S_GYM_2_PHYSIK.de.json.snapshot`
- the shared provenance registries now activate both Sachsen-Anhalt Physics source landscapes:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the Sachsen-Anhalt input README and a new onboarding note now document the active retained source lanes:
  - `curricula/DE/Gymnasium/input/ST/README.md`
  - `curricula/DE/Gymnasium/provenance/st-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-ST` from `P1` to `P2`

Current Sachsen-Anhalt Physics state:

- lower-secondary retained source lane active with one orientation anchor plus retained `Schuljahrgang 6`, `Schuljahrgaenge 7/8`, and `Schuljahrgang 9` strips
- upper-secondary retained source lane active with one orientation anchor plus retained `Schuljahrgang 10 (Einfuehrungsphase)`, `grundlegendes Anforderungsniveau`, `erhoehtes Anforderungsniveau`, and `zweistuendiges Wahlpflichtfach` strips
- no Sachsen-Anhalt Physics mapping lane yet
- no Sachsen-Anhalt-specific canonical Physics atom yet
- no committed Sachsen-Anhalt applicability cut yet

Why this cut:

- it brings Sachsen-Anhalt onto the same `P2` source-backed footing as Bremen, Hamburg, Mecklenburg-Vorpommern, and Sachsen
- it keeps the Sachsen-Anhalt lanes source-led and stage-/track-anchored instead of opening premature reviewed mapping while the nationwide snapshot tranche is still incomplete
- it stays aligned with the mathematics rollout order: source-backed Sek-I and Sek-II lanes first, horizontal reviewed corridor work afterwards

Validation used:

- JSON parse of the two new Sachsen-Anhalt Physics snapshots
- JSON parse of the updated source-landscape, membership, closure, and tracker registries
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active Physics blocker is no longer Sachsen-Anhalt source availability; Sachsen-Anhalt is now a real retained source lane for both Sek I and Sek II
- the active `F4.ALL_NEWLY_ARCHIVED_STATE_SNAPSHOT_ACTIVATION` corridor remains open, now with Bremen, Hamburg, Mecklenburg-Vorpommern, Sachsen, and Sachsen-Anhalt converted from archive-only intake to source-backed snapshot/provenance state

### 2026-04-20: Thueringen Physics moves from `P1` archive-only to `P2` source-backed snapshots

What changed:

- the first retained Thueringen lower-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/TH/lower-secondary/source-json/DE_THU_S_GYM_1_PHYSIK.de.json.snapshot`
- the first retained Thueringen upper-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/TH/upper-secondary/source-json/DE_THU_S_GYM_2_PHYSIK.de.json.snapshot`
- the shared provenance registries now activate both Thueringen Physics source landscapes:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the Thueringen input README and a new onboarding note now document the active retained source lanes:
  - `curricula/DE/Gymnasium/input/TH/README.md`
  - `curricula/DE/Gymnasium/provenance/th-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-TH` from `P1` to `P2`

Current Thueringen Physics state:

- lower-secondary retained source lane active with one orientation anchor plus retained `Klassenstufen 7/8` and `Klassenstufen 9/10` strips
- upper-secondary retained source lane active with one orientation anchor plus a retained `Klassenstufe 11` strip and a retained `Qualifikationsphase` strip
- no Thueringen Physics mapping lane yet
- no Thueringen-specific canonical Physics atom yet
- no committed Thueringen applicability cut yet

Why this cut:

- it brings Thueringen onto the same `P2` source-backed footing as Bremen, Hamburg, Mecklenburg-Vorpommern, Sachsen, and Sachsen-Anhalt
- it keeps the Thueringen lanes source-led and stage-anchored instead of opening premature reviewed mapping while the nationwide snapshot tranche is still incomplete
- it uses the 2012 PDF for the broad retained lower-secondary and `Klassenstufe 11` strips while already taking the 2024 qualification-phase content-area update seriously in the upper-secondary lane

Validation used:

- JSON parse of the two new Thueringen Physics snapshots
- JSON parse of the updated source-landscape, membership, closure, and tracker registries
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active Physics blocker is no longer Thueringen source availability; Thueringen is now a real retained source lane for both Sek I and Sek II
- the active `F4.ALL_NEWLY_ARCHIVED_STATE_SNAPSHOT_ACTIVATION` corridor remains open, now with Bremen, Hamburg, Mecklenburg-Vorpommern, Sachsen, Sachsen-Anhalt, and Thueringen converted from archive-only intake to source-backed snapshot/provenance state

### 2026-04-20: Saarland Physics moves from `P1` archive-only to `P2` source-backed snapshots

What changed:

- the first retained Saarland lower-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/SL/lower-secondary/source-json/DE_SAR_S_GYM_1_PHYSIK.de.json.snapshot`
- the first retained Saarland upper-secondary Physics snapshot now lives at
  - `curricula/DE/Gymnasium/input/SL/upper-secondary/source-json/DE_SAR_S_GYM_2_PHYSIK.de.json.snapshot`
- the shared provenance registries now activate both Saarland Physics source landscapes:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- the Saarland input README and a new onboarding note now document the active retained source lanes:
  - `curricula/DE/Gymnasium/input/SL/README.md`
  - `curricula/DE/Gymnasium/provenance/sl-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-SL` from `P1` to `P2`

Current Saarland Physics state:

- lower-secondary retained source lane active with one orientation anchor plus a retained `Klassenstufen 5/6` Naturwissenschaften feeder strip, a retained `Klassenstufe 7` strip, and branch-sensitive retained `Klassenstufen 8`, `9`, and `10` strips
- upper-secondary retained source lane active with one orientation anchor plus retained `Einfuehrungsphase`, `Hauptphase G-Kurs`, and `Hauptphase Leistungskurs` strips
- no Saarland Physics mapping lane yet
- no Saarland-specific canonical Physics atom yet
- no committed Saarland applicability cut yet

Why this cut:

- it completes the still-missing Saarland conversion from archive-only intake to active retained source lanes for both Sek I and Sek II
- it keeps Saarland intentionally broad and source-led instead of opening premature reviewed mapping while the nationwide snapshot tranche is still being closed
- it preserves branch-sensitive lower-secondary packaging and the EP/GK/LK upper-secondary split as real retained source structure for later horizontal Physics work

Validation used:

- JSON parse of the two new Saarland Physics snapshots
- JSON parse of the updated source-landscape, membership, closure, and tracker registries
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active Physics blocker is no longer Saarland source availability; Saarland is now a real retained source lane for both Sek I and Sek II
- the active `F4.ALL_NEWLY_ARCHIVED_STATE_SNAPSHOT_ACTIVATION` corridor is now complete, with Bremen, Hamburg, Mecklenburg-Vorpommern, Saarland, Sachsen, Sachsen-Anhalt, and Thueringen all converted from archive-only intake to source-backed snapshot/provenance state

### 2026-04-20: Physics snapshot activation tranche is complete; the active move is now structural anchors

What changed:

- the previously active nationwide corridor `F4.ALL_NEWLY_ARCHIVED_STATE_SNAPSHOT_ACTIVATION` is now marked `completed`
- a new active nationwide corridor `F4.ALL_NEWLY_ARCHIVED_STATE_STRUCTURAL_ANCHOR_ACTIVATION` now carries the rollout
- all seven newly archived Physics state families now sit at `P2` with active retained lower-secondary and upper-secondary source lanes:
  - `DE-HB`
  - `DE-HH`
  - `DE-MV`
  - `DE-SL`
  - `DE-SN`
  - `DE-ST`
  - `DE-TH`
- the Physics workboard now treats the first conservative `P3` structural-anchor pass as the active blocker-clearing move instead of more snapshot-only widening

Current program state:

- source archive coverage is complete for all tracked Bundeslaender
- source-backed Physics snapshots are now active for all tracked Bundeslaender
- the newly archived-state tranche is no longer blocked on source intake or snapshot activation
- the next rollout task is the first conservative anchor pass across the seven newly activated states

Why this cut:

- it realigns Physics with the same rollout order already used in Mathematics: sources first, snapshots second, broad structural anchors third, reviewed topic corridors afterwards
- it prevents another round of opportunistic single-state widening before the new state lanes have even minimal canonical anchor structure
- it gives the upcoming horizontal Physics pass a complete retained source basis across all Bundeslaender

Validation used:

- JSON parse of the updated Physics tracker and shared provenance registries
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the nationwide Physics `P2` tranche is now closed
- the active blocker has shifted from snapshot activation to first structural-anchor activation
- the next clean rollout move is the first conservative `P3` pass, not another snapshot-only or state-local reviewed corridor widening

### 2026-04-20: Bremen Physics moves from `P2` source-backed snapshots to `P3` structural anchors

What changed:

- the first Bremen lower-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_physics_lower_secondary_to_canonical_physics.json`
- the first Bremen upper-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_physics_upper_secondary_to_canonical_physics.json`
- the Bremen onboarding note now documents the first anchor cut:
  - `curricula/DE/Gymnasium/provenance/hb-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-HB` from `P2` to `P3`

Current Bremen Physics state:

- lower-secondary retained source lane now maps the retained root plus orientation and the first thematic retained subanchors across `Schall`, `Optik`, `Mechanik`, `Elektrostatik`, `Stromkreis`, `Elektromagnetismus`, and `Radioaktivitaet` onto the shared Sek-I physics spine
- upper-secondary retained source lane now maps the retained root plus orientation, the broad `E`, `Q1`, and `Q2` anchors, and one explicit `Q4` side anchor from the LK leaf `Struktur der Materie` onto the shared canonical upper-secondary spine
- no reviewed Bremen Physics corridor is open yet
- no Bremen-specific canonical Physics atom exists yet
- no committed Bremen applicability cut exists yet

Why this cut:

- it starts the nationwide Physics `P3` tranche with the narrowest possible first anchor pass on one of the newly activated states
- it keeps the Bremen cut explicitly structural instead of slipping into a first reviewed corridor too early
- it establishes the exact lower-/upper-secondary mapping file shape that the remaining newly activated states can now mirror

Validation used:

- JSON parse of the two new Bremen Physics mapping files plus the updated tracker
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active blocker is no longer whether the first structural-anchor pass can start; it has now started with Bremen
- the nationwide `F4.ALL_NEWLY_ARCHIVED_STATE_STRUCTURAL_ANCHOR_ACTIVATION` corridor stays active, and the next clean state on that path is Hamburg

### 2026-04-20: Hamburg Physics moves from `P2` source-backed snapshots to `P3` structural anchors

What changed:

- the first Hamburg lower-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_physics_lower_secondary_to_canonical_physics.json`
- the first Hamburg upper-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/hh_physics_upper_secondary_to_canonical_physics.json`
- the Hamburg onboarding note now documents the first anchor cut:
  - `curricula/DE/Gymnasium/provenance/hh-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-HH` from `P2` to `P3`

Current Hamburg Physics state:

- lower-secondary retained source lane now maps the retained root plus orientation and the first thematic retained subanchors across `Elektrizitaet`, `Bewegung und Kraft`, `Licht und Schall`, `Elektrizitaet und Magnetismus`, and `Licht und Materie` onto the shared Sek-I physics spine
- upper-secondary retained source lane now maps the retained root plus orientation, the broad `Q1`, `Q2`, and `Q3` anchors, and one explicit late-side anchor on `Astrophysik` onto the shared canonical upper-secondary spine
- no reviewed Hamburg Physics corridor is open yet
- no Hamburg-specific canonical Physics atom exists yet
- no committed Hamburg applicability cut exists yet

Why this cut:

- it proves the first conservative `P3` anchor pattern is repeatable on a second newly activated state instead of being a Bremen one-off
- it keeps Hamburg explicitly structural instead of slipping into a first reviewed corridor too early
- it moves the active nationwide tranche forward without inventing another canonical Physics atom or an early Hamburg applicability sweep

Validation used:

- JSON parse of the two new Hamburg Physics mapping files plus the updated tracker
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active blocker is no longer whether Hamburg can carry the first structural-anchor cut; Hamburg now does
- the nationwide `F4.ALL_NEWLY_ARCHIVED_STATE_STRUCTURAL_ANCHOR_ACTIVATION` corridor stays active, and the next clean state on that path is Mecklenburg-Vorpommern

### 2026-04-20: Mecklenburg-Vorpommern Physics moves from `P2` source-backed snapshots to `P3` structural anchors

What changed:

- the first Mecklenburg-Vorpommern lower-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_physics_lower_secondary_to_canonical_physics.json`
- the first Mecklenburg-Vorpommern upper-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_physics_upper_secondary_to_canonical_physics.json`
- the Mecklenburg-Vorpommern onboarding note now documents the first anchor cut:
  - `curricula/DE/Gymnasium/provenance/mv-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-MV` from `P2` to `P3`

Current Mecklenburg-Vorpommern Physics state:

- lower-secondary retained source lane now maps the retained root plus orientation and the first thematic retained subanchors across `Klasse 7`, `Klasse 8`, `Klasse 9`, and `Klasse 10` onto the shared Sek-I physics spine on mechanics, optics, electricity, and nuclear physics
- upper-secondary retained source lane now maps the retained root plus orientation and the broad retained anchors `Elektrische und magnetische Felder`, `Schwingungen und Wellen`, and `Quantenphysik und Materie` onto the shared canonical upper-secondary spine
- the integrative upper-secondary band remains intentionally source-led at this first `P3` cut
- no reviewed Mecklenburg-Vorpommern Physics corridor is open yet
- no Mecklenburg-Vorpommern-specific canonical Physics atom exists yet
- no committed Mecklenburg-Vorpommern applicability cut exists yet

Why this cut:

- it proves the conservative `P3` anchor pattern is also viable on a state whose retained intake started from class-wide Sek-I strips and a source-led integrative upper-secondary band
- it keeps Mecklenburg-Vorpommern explicitly structural instead of overclaiming the first reviewed corridor too early
- it moves the nationwide structural-anchor tranche forward without inventing another canonical Physics atom or an early applicability sweep

Validation used:

- JSON parse of the two new Mecklenburg-Vorpommern Physics mapping files plus the updated tracker
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active blocker is no longer whether Mecklenburg-Vorpommern can carry the first structural-anchor cut; Mecklenburg-Vorpommern now does
- the nationwide `F4.ALL_NEWLY_ARCHIVED_STATE_STRUCTURAL_ANCHOR_ACTIVATION` corridor stays active, and the next clean state on that path is Saarland

### 2026-04-20: Saarland Physics moves from `P2` source-backed snapshots to `P3` structural anchors

What changed:

- the first Saarland lower-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_physics_lower_secondary_to_canonical_physics.json`
- the first Saarland upper-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_physics_upper_secondary_to_canonical_physics.json`
- the Saarland onboarding note now documents the first anchor cut:
  - `curricula/DE/Gymnasium/provenance/sl-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-SL` from `P2` to `P3`

Current Saarland Physics state:

- lower-secondary retained source lane now maps the retained root plus orientation and the first thematic retained subanchors across the `Klassenstufen 5/6` Naturwissenschaften feeder, `Klassenstufe 7`, branch-sensitive `Klassenstufe 8`, branch-sensitive `Klassenstufe 9`, and branch-sensitive `Klassenstufe 10` strips onto the shared Sek-I physics spine on mechanics, optics, electricity, and radioactivity
- upper-secondary retained source lane now maps the retained root plus orientation and the broad course-sensitive thematic anchors `Einfuehrungsphase: Kraft und Bewegung`, `Hauptphase G-Kurs`, and `Hauptphase Leistungskurs` onto the shared canonical upper-secondary spine on `E`, `Q1`, `Q2`, and `Q3`
- `Einfuehrungsphase: Kernenergie und Radioaktivitaet` remains intentionally source-led at this first `P3` cut
- no reviewed Saarland Physics corridor is open yet
- no Saarland-specific canonical Physics atom exists yet
- no committed Saarland applicability cut exists yet

Why this cut:

- it proves the conservative `P3` anchor pattern is also viable on a state with branch-sensitive Sek-I packaging and a course-sensitive Oberstufenstruktur
- it keeps Saarland explicitly structural instead of opening a first reviewed corridor before the remaining new states carry comparable anchor coverage
- it moves the nationwide structural-anchor tranche forward without inventing another canonical Physics atom or an early applicability sweep

Validation used:

- JSON parse of the two new Saarland Physics mapping files plus the updated tracker
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active blocker is no longer whether Saarland can carry the first structural-anchor cut; Saarland now does
- the nationwide `F4.ALL_NEWLY_ARCHIVED_STATE_STRUCTURAL_ANCHOR_ACTIVATION` corridor stays active, and the next clean state on that path is Sachsen

### 2026-04-20: Sachsen Physics moves from `P2` source-backed snapshots to `P3` structural anchors

What changed:

- the first Sachsen lower-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_physics_lower_secondary_to_canonical_physics.json`
- the first Sachsen upper-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/sn_physics_upper_secondary_to_canonical_physics.json`
- the Sachsen onboarding note now documents the first anchor cut:
  - `curricula/DE/Gymnasium/provenance/sn-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-SN` from `P2` to `P3`

Current Sachsen Physics state:

- lower-secondary retained source lane now maps the retained root plus orientation and the first thematic retained subanchors across `Klassenstufe 6`, `Klassenstufe 7`, `Klassenstufe 8`, `Klassenstufe 9`, and `Klassenstufe 10` onto the shared Sek-I physics spine on mechanics, optics, and electricity
- the lower-secondary heat, energy, astronomy, wave, and practicum strips remain intentionally source-led at this first `P3` cut
- upper-secondary retained source lane now maps the retained root plus orientation and the first broad thematic anchors across `GK11`, `GK12`, `LK11`, and `LK12` onto the shared canonical upper-secondary spine on `E`, `Q1`, `Q2`, `Q3`, and `Q4`
- the upper-secondary capacitor/practicum, modelling, Newton/curvilinear, and remaining practicum strips remain intentionally source-led at this first `P3` cut
- no reviewed Sachsen Physics corridor is open yet
- no Sachsen-specific canonical Physics atom exists yet
- no committed Sachsen applicability cut exists yet

Why this cut:

- it proves the conservative `P3` anchor pattern is also viable on a state whose retained source family spans one shared Sek-I/Sek-II Gymnasium Physics PDF but still breaks into distinct lower- and upper-secondary structural strips
- it keeps Sachsen explicitly structural instead of pretending the first reviewed corridor already exists across the newly activated wave, quantum, or relativity surfaces
- it moves the nationwide structural-anchor tranche forward without inventing another canonical Physics atom or an early applicability sweep

Validation used:

- JSON parse of the two new Sachsen Physics mapping files plus the updated tracker
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active blocker is no longer whether Sachsen can carry the first structural-anchor cut; Sachsen now does
- the nationwide `F4.ALL_NEWLY_ARCHIVED_STATE_STRUCTURAL_ANCHOR_ACTIVATION` corridor stays active, and the next clean state on that path is Sachsen-Anhalt

### 2026-04-20: Sachsen-Anhalt Physics moves from `P2` source-backed snapshots to `P3` structural anchors

What changed:

- the first Sachsen-Anhalt lower-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_physics_lower_secondary_to_canonical_physics.json`
- the first Sachsen-Anhalt upper-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_physics_upper_secondary_to_canonical_physics.json`
- the Sachsen-Anhalt onboarding note now documents the first anchor cut:
  - `curricula/DE/Gymnasium/provenance/st-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-ST` from `P2` to `P3`

Current Sachsen-Anhalt Physics state:

- lower-secondary retained source lane now maps the retained root plus orientation and the first thematic retained subanchors across `Schuljahrgang 6`, `Schuljahrgaenge 7/8`, and `Schuljahrgang 9` onto the shared Sek-I physics spine on mechanics, optics, and electricity
- the lower-secondary nature-of-physics, heat, and gas strips remain intentionally source-led at this first `P3` cut
- upper-secondary retained source lane now maps the retained root plus orientation and the first broad thematic anchors across `Schuljahrgang 10 (Einfuehrungsphase)`, `grundlegendes Anforderungsniveau`, `erhoehtes Anforderungsniveau`, and `zweistuendiges Wahlpflichtfach` onto the shared canonical upper-secondary spine on `E`, `Q1`, `Q2`, `Q3`, and `Q4`
- the upper-secondary optics, radioactivity, climate, practicum, and task-practicum strips remain intentionally source-led at this first `P3` cut
- no reviewed Sachsen-Anhalt Physics corridor is open yet
- no Sachsen-Anhalt-specific canonical Physics atom exists yet
- no committed Sachsen-Anhalt applicability cut exists yet

Why this cut:

- it proves the conservative `P3` anchor pattern is also viable on a state whose retained source family separates a narrow Einfuehrungsphase from three different qualification profiles without forcing an early reviewed corridor
- it keeps Sachsen-Anhalt explicitly structural instead of pretending the first reviewed optics, induction, relativity, or quantum corridor is already justified on that retained family
- it moves the nationwide structural-anchor tranche forward without inventing another canonical Physics atom or an early applicability sweep

Validation used:

- JSON parse of the two new Sachsen-Anhalt Physics mapping files plus the updated tracker
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the active blocker is no longer whether Sachsen-Anhalt can carry the first structural-anchor cut; Sachsen-Anhalt now does

### 2026-04-20: Thueringen Physics moves from `P2` source-backed snapshots to `P3` structural anchors

What changed:

- the first Thueringen lower-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_physics_lower_secondary_to_canonical_physics.json`
- the first Thueringen upper-secondary Physics structural-anchor mapping now lives at
  - `curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/th_physics_upper_secondary_to_canonical_physics.json`
- the Thueringen onboarding note now documents the first anchor cut:
  - `curricula/DE/Gymnasium/provenance/th-physics-onboarding.md`
- the Physics rollout tracker now lifts `DE-TH` from `P2` to `P3`

Current Thueringen Physics state:

- `8` conservative lower-secondary structural mappings
- `9` conservative upper-secondary structural mappings
- the lower-secondary heat strip remains intentionally source-led at this first `P3` cut
- the upper-secondary `Klassenstufe 11` strips on electricity, optics, and radioactivity remain intentionally source-led at this first `P3` cut
- no reviewed Thueringen Physics corridor is open yet
- no Thueringen-specific canonical Physics atom exists yet
- no committed Thueringen applicability cut exists yet

Why this cut:

- it closes the first conservative `P3` floor for all seven newly archived Physics state families
- it keeps Thueringen structural instead of pretending a first reviewed mechanics, field, optics, or radioactivity corridor is already justified on the retained 2012/2024 source family
- it reestablishes the mathematics-style rollout order: first all source bundles archived, then all source-backed snapshots active, then all first structural anchors active, only then another horizontal reviewed topic pass

Validation:

- JSON parse of the two new Thueringen Physics mapping files plus the updated tracker
- `GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --no-daemon --console=plain`
- `GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

Interpretation:

- the newly archived-state `P3` structural-anchor tranche is now complete nationwide
- the active blocker is no longer missing first structural anchors on `DE-HB` / `DE-HH` / `DE-MV` / `DE-SL` / `DE-SN` / `DE-ST` / `DE-TH`
- the next clean Physics move is now the first renewed horizontal all-state reviewed pass, starting with `Sek II Mechanik / Dynamik`

### 2026-04-20: Physics reenters the first horizontal all-state reviewed pass on `Sek II Mechanik / Dynamik`

What changed:

- the topic board row `Sek II Mechanik / Dynamik` is now resolved once across all retained state columns instead of still carrying unresolved `n/s` cells
- the row now explicitly distinguishes
  - reviewed corridor evidence on `DE-BY`, `DE-HE`, `DE-NI`, `DE-NW`, and `DE-SH`
  - broad structural anchors on `DE-HB`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH`
  - local side packaging on `DE-BW`, `DE-BE`, `DE-BB`, `DE-HH`, `DE-MV`, and `DE-RP`
- the active rollout tracker now advances the horizontal pass from `Sek II Mechanik / Dynamik` to `Sek II Elektrizitaet / Magnetismus / Induktion`

Interpretation:

- the first renewed horizontal all-state row pass does **not** justify a new canonical mechanics package split
- the current shared mechanics surface remains sufficient on the canonical level
- the remaining mechanics debt is now state-coverage bookkeeping and local packaging discipline, not a visible new canonical atom gap
- the next clean Physics move is therefore the next horizontal all-state reviewed row on `Sek II Elektrizitaet / Magnetismus / Induktion`

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics closes the next stable upper-secondary residue slice on SH, BE/BB, and RP

What changed:

- Schleswig-Holstein gains one additional conservative reviewed bridge from `Drehimpuls und Drehimpulserhaltung` onto the shared canonical atom `Drehimpuls als Erhaltungsgröße`
- Berlin and Brandenburg each gain two additional conservative reviewed bridges from `Vakuumlichtgeschwindigkeit c0 als Obergrenze fuer Geschwindigkeiten einordnen` and `Relativistische Massenzunahme schnell bewegter Teilchen einordnen` onto the shared canonical excursus `Exkurs: Relativistische Massenzunahme (Linearbeschleuniger)`
- Rheinland-Pfalz gains one additional conservative reviewed bridge from `Laser als Anwendungsbeispiel atomarer Uebergaenge fachlich einordnen` onto the shared canonical atom `Laserprinzip und Anwendungen`
- the remaining open upper-secondary residue surface is therefore reduced further:
  - `DE-SH`: only `Massenspektrometer`
  - `DE-BE` / `DE-BB`: only `beliebige Eintrittswinkel`
  - `DE-RP`: the remaining LF source-led residue set beyond the now-closed `Laser` leaf

Interpretation:

- no new canonical Physics atom was introduced
- no applicability cut was introduced
- this is a closure move on already existing canonical surface, not another canonical expansion
- the previously deferred SH and BE/BB leaves are now narrow enough to sit on the current shared angular-momentum and relativistic linear-accelerator surfaces without forcing a new split
- `Massenspektrometer`, `beliebige Eintrittswinkel`, `Paarerzeugung`, and the remaining RP LF residues still do not have comparably clean narrow shared landing targets on the current canonical floor

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' --no-daemon --console=plain`
- `cd backend && GRADLE_USER_HOME=/home/enpasos/projects/skillpilot/backend/.gradle-ci ./gradlew clean check --no-daemon --console=plain`
- `git diff --check`

### 2026-04-20: Physics makes the remaining RP upper-secondary lane closure explicit

What changed:

- the Rheinland-Pfalz upper-secondary Physics lane is now explicitly marked as closed on the current reviewed cut instead of still pointing to a future closure-decision placeholder
- the remaining source-led RP LF residue set is now operationally frozen, beginning with `Individuelles Thema` and continuing through the already documented LF leaves that still lack genuinely narrow shared canonical landing targets
- no new mapping was added in this step; this is a closure and steering decision only

Interpretation:

- the current canonical Physics surface is now judged sufficient for every RP bridge that can be made conservatively without overclaiming
- the remaining RP LF leaves are no longer treated as latent near-term widening debt
- any later RP reopen must now be justified by genuinely new shared canonical evidence, not by the mere existence of still source-led local leaves

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `python3 -m json.tool curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
- `git diff --check`

### 2026-04-20: Physics binds `F6` into a fixed run path

What changed:

- a new wrapper [run_canonical_physics_evidence_watch.sh](/home/enpasos/projects/skillpilot/scripts/run_canonical_physics_evidence_watch.sh) now executes the `F6` watch flow in one stable command path
- the existing frontend package scripts now expose the same flow as `npm run check:canonical-physics-evidence-watch` in [package.json](/home/enpasos/projects/skillpilot/app/package.json)
- the manifest now exposes this wrapper as `runCommand`, and the active `F6` tracker text/workboard now point to the fixed run path

Interpretation:

- `F6` is now anchored in an actual operational entrypoint instead of a loose bundle of individual commands
- this is the right shape for later CI or cron integration because the watch flow already has one repo-stable executable surface

Validation:

- `./scripts/run_canonical_physics_evidence_watch.sh`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics wires `F6` into GitHub Actions

What changed:

- a new workflow [canonical_physics_evidence_watch.yml](/home/enpasos/projects/skillpilot/.github/workflows/canonical_physics_evidence_watch.yml) now runs the `F6` watch wrapper on schedule, on manual dispatch, and on relevant push/pull-request changes
- the workflow uploads the rendered watch status and delta markdown as artifacts, so file-level watch events stay inspectable even when the job fails
- the manifest now exposes the workflow path, and the active `F6` tracker/workboard now include the workflow as part of the operational watch surface

Interpretation:

- `F6` is no longer only locally runnable; it now has a repo-native automated execution path
- this is the first real maintenance automation step, because watched-file drift can now surface without a human manually invoking the wrapper

Validation:

- `./scripts/run_canonical_physics_evidence_watch.sh`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics adds an exit-code `F6` evidence-watch check

What changed:

- a new script [check_canonical_physics_evidence_watch_delta.py](/home/enpasos/projects/skillpilot/scripts/check_canonical_physics_evidence_watch_delta.py) now compares the current watched files against the frozen baseline and exits non-zero when the watch surface drifts
- the manifest now exposes this as `checkCommand`, so `F6` has a single machine-readable command for automated watch execution
- the active `F6` tracker text and the topic workboard now include the exit-code check as part of the operational watch surface

Interpretation:

- `F6` is now usable not only for human review and markdown rendering, but also as a strict maintenance gate in CI or cron-style monitoring
- this still does **not** auto-reopen rollout work; it only ensures that file drift cannot stay silent once the baseline has been frozen

Validation:

- `python3 scripts/check_canonical_physics_evidence_watch_delta.py`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics adds a baseline-driven `F6` delta view

What changed:

- a new capture script [capture_canonical_physics_evidence_watch_baseline.py](/home/enpasos/projects/skillpilot/scripts/capture_canonical_physics_evidence_watch_baseline.py) now freezes the current `F6` watch surface into [physics-evidence-watch-baseline.json](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/provenance/physics-evidence-watch-baseline.json)
- a new delta renderer [render_canonical_physics_evidence_watch_delta.py](/home/enpasos/projects/skillpilot/scripts/render_canonical_physics_evidence_watch_delta.py) now compares the current watched files against that baseline and writes [canonical-gymnasium-physics-evidence-watch-delta.md](/home/enpasos/projects/skillpilot/docs/dev/canonical-gymnasium-physics-evidence-watch-delta.md)
- the active `F6` tracker text and the topic workboard now treat the baseline-driven delta view as part of the operational watch surface

Interpretation:

- `F6` can now distinguish between a merely documented watch set and an actual file-level signal: the baseline freezes the current accepted watch surface, and the delta view highlights later file changes without reopening rollout automatically
- this still does **not** decide didactic relevance on its own; it only turns file-level drift into an explicit maintenance event that can be reviewed against the documented reopen rules

Validation:

- `python3 scripts/capture_canonical_physics_evidence_watch_baseline.py`
- `python3 scripts/render_canonical_physics_evidence_watch_delta.py`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics renders a reproducible `F6` evidence-watch status view

What changed:

- a new script [render_canonical_physics_evidence_watch_status.py](/home/enpasos/projects/skillpilot/scripts/render_canonical_physics_evidence_watch_status.py) now renders the machine-readable watch manifest into a human-readable status sheet
- the generated status sheet [canonical-gymnasium-physics-evidence-watch-status.md](/home/enpasos/projects/skillpilot/docs/dev/canonical-gymnasium-physics-evidence-watch-status.md) now shows the current watch target register plus existence, content hash, and last-modified timestamp per watched file
- the active `F6` tracker text and the topic workboard now point to this rendered status view in addition to the raw manifest

Interpretation:

- `F6` is now executable at two levels: the raw manifest remains the authoritative machine surface, while the rendered watch sheet provides a reproducible human audit view over the same watched files
- this still does **not** reopen rollout work; it only removes the last manual step from checking whether the maintained watch surface is still intact and unchanged

Validation:

- `python3 scripts/render_canonical_physics_evidence_watch_status.py`
- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics materializes a machine-readable evidence-watch manifest for `F6`

What changed:

- a new provenance artifact [physics-evidence-watch-manifest.json](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/provenance/physics-evidence-watch-manifest.json) now captures the active `F6` watch surface in machine-readable form
- the manifest groups the watch surface into
  - Hessen lower-secondary seed watch
  - lower-secondary candidate floors for `Kosmos` and `Elektronik`
  - the overlap guard for `Licht / Materie / Atommodell / Strahlung`
  - upper-secondary residue watch for BE/BB, SH, and RP
- the active `F6` tracker text now points to this manifest as the primary operational watch surface

Interpretation:

- `F6` is now no longer only documented in prose; it has a machine-readable provenance artifact that future tooling or maintenance scripts can consume directly
- this still does **not** reopen rollout work; it only makes the watch mode executable without re-deriving the relevant file set and trigger rules from free text

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics materializes concrete watch files for `F6` evidence watch

What changed:

- the topic workboard now adds a concrete `Current watch files` list below the watch targets
- the active `F6.MAINTENANCE_EVIDENCE_WATCH` tracker text now points to specific source snapshot files instead of only naming abstract watch lanes
- the file watch set now covers
  - Hessen, Sachsen, Hamburg, Saarland, and Sachsen-Anhalt lower-secondary snapshots as the main Sek-I reopen surface
  - Brandenburg and Berlin upper-secondary snapshots for the frozen BE/BB residue
  - Schleswig-Holstein upper-secondary for the SH micro-residues
  - Rheinland-Pfalz upper-secondary for the remaining RP source-led LF residues

Interpretation:

- `F6` is now executable at file level: future maintenance no longer needs to rediscover which concrete source files are the first ones to inspect for a possible reopen trigger
- this still does **not** reopen rollout work; it only sharpens the observation surface for future source-backed changes

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics materializes explicit watch targets for `F6` evidence watch

What changed:

- the topic workboard now adds a concrete `Current watch targets` section below the reopen triggers
- the active `F6.MAINTENANCE_EVIDENCE_WATCH` tracker text now points to specific lanes and strips to monitor first instead of only naming abstract trigger types
- the watch targets now prioritize
  - Hessen Sek I revisions as the strongest reopen signal
  - Sachsen Sek I as the strongest current non-Hessen evidence floor for `Kosmos` and `Elektronik`
  - Hamburg, Saarland, and Sachsen-Anhalt as secondary watch lanes for possible strengthening of currently mixed side packaging

Interpretation:

- `F6` is now operationally specific enough that future maintenance can check concrete source lanes first instead of rediscovering the likely trigger points from scratch
- this still does **not** reopen active rollout work; it narrows where to look when a future source-backed trigger appears

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics materializes explicit reopen triggers for `F6` maintenance mode

What changed:

- the topic workboard now contains an explicit `Current reopen triggers` section instead of leaving `F6` as a generic wait state
- the active `F6.MAINTENANCE_EVIDENCE_WATCH` tracker text now names the concrete triggers that would justify reopening active rollout work
- the reopen criteria are now explicit for the three strongest lower-secondary non-admitted candidates:
  - `Sek I Kosmos / Erde / Mensch / Astronomie`
  - `Sek I Elektronik / Halbleiter / elektromagnetische Wellen`
  - `Sek I Licht / Materie / Atommodell / Strahlung`

Interpretation:

- `F6` is now not just a passive maintenance label; it is an operational watch state with concrete reopening conditions
- this reduces ambiguity about what kind of new source-backed evidence is actually strong enough to justify another nationwide row or another reviewed Physics pass
- the next clean Physics move still depends on external evidence, but the bar is now documented in a way that future maintenance work can apply directly

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics enters explicit maintenance / evidence-watch mode after closing `F5`

What changed:

- the rollout tracker now adds a new active steering phase `F6 Maintenance and evidence watch`
- the new active corridor `F6.MAINTENANCE_EVIDENCE_WATCH` makes the operational state explicit: no further reviewed Physics rollout is active on the current evidence floor
- the topic workboard now states the same consequence directly instead of only implying it via closed rows and frozen candidate admission

Interpretation:

- this does **not** reopen rollout work on a new row; it formalizes the opposite state
- Physics now has an explicit maintenance-mode steering state: keep the completed cuts stable, watch for curriculum revisions or new source-backed evidence, and reopen active rollout only when a real trigger appears
- this avoids a misleading pseudo-active state after the current `F5` tranche has already been completed end to end

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics closes the current `F5` horizontal all-state reentry tranche at the reviewed cut

What changed:

- the rollout tracker now marks `F5.ALL_STATE_HORIZONTAL_TOPIC_REENTRY` as `completed`
- the program-phase tracker now marks `F5` itself as `completed`
- the seven newly activated `P3` states `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH` no longer stay `priority: active`; they now move to backlog-style maintenance and evidence-watch wording
- the topic workboard now states explicitly that the current horizontal reentry tranche is operationally closed at the current reviewed cut

Interpretation:

- no active nationwide Physics topic pass remains open on the current evidence floor
- the completed `F5` tranche now consists of
  - the four renewed Sek-II all-state rows
  - the first eight renewed Sek-I rows
  - the first post-tranche lower-secondary candidate sweep
- the next clean Physics move therefore requires new source-backed evidence or a genuinely new Hessen-seeded lower-secondary strip, not continued motion inside the same closed reentry tranche

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics closes the first post-tranche lower-secondary candidate sweep without admitting another nationwide row

What changed:

- the topic workboard now treats the first post-tranche lower-secondary candidate sweep as explicitly complete
- the three strongest visible candidates have now each been checked against the current retained evidence floor:
  - `Sek I Kosmos / Erde / Mensch / Astronomie`
  - `Sek I Elektronik / Halbleiter / elektromagnetische Wellen`
  - `Sek I Licht / Materie / Atommodell / Strahlung`
- the rollout tracker no longer points toward another immediate candidate pass; it now states that no additional Sek-I row is admitted on the current evidence floor

Interpretation:

- the candidate sweep does **not** reveal another row-worthy nationwide lower-secondary strip at the current reviewed cut
- the blockers differ by candidate, but the operational result is now the same for all three: no admission
- the next clean Physics move therefore requires new source-backed evidence or a genuinely new Hessen-seeded lower-secondary strip, not another pass over the same current candidate pool

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics runs the third explicit evidence pass for `Sek I Licht / Materie / Atommodell / Strahlung` and keeps the row closed

What changed:

- the topic workboard blocker note now names a third visible post-tranche lower-secondary candidate explicitly: `Sek I Licht / Materie / Atommodell / Strahlung`
- the retained-source evidence is now documented more precisely:
  - Hessen does carry a lower-secondary seed through `10.2 Radioaktivitaet` with `Bausteine des Atoms` and `Radioaktive Strahlung`
  - Hamburg carries the mixed transition strip `Licht und Materie: Brechung, Spektrum, Atommodell und Strahlung`
  - Bremen, Saarland, Mecklenburg-Vorpommern, and Thueringen carry adjacent retained side evidence on Kernenergie, ionisierende Strahlung, Materie, or radioaktive Strahlung
- the rollout tracker still keeps the additional lower-secondary row admission frozen, because this candidate does not expose a missing nationwide row; its evidence is already materially covered by the audited rows `Sek I Optik / Licht / Schall` and `Sek I Radioaktivitaet / Kernphysik`

Interpretation:

- this third visible candidate also does **not** clear the admission bar
- the blocker is different here: unlike `Kosmos` or `Elektronik`, the problem is not primarily missing Hessen seeding, but lack of a distinct canonical gap beyond rows that are already audited and stable
- the next clean Physics move therefore remains the same: keep the first audited Sek-I tranche stable until a genuinely new, row-worthy lower-secondary strip emerges instead of repackaging already covered material

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics runs the second explicit evidence pass for `Sek I Elektronik / Halbleiter / elektromagnetische Wellen` and keeps the row closed

What changed:

- the topic workboard blocker note now names a second visible post-tranche lower-secondary candidate explicitly: `Sek I Elektronik / Halbleiter / elektromagnetische Wellen`
- the retained-source evidence is now documented more precisely:
  - Sachsen carries the clearest lower-secondary evidence through `K9 Lernbereich 1 Grundlagen der Elektronik` and `K10 Lernbereich 4 Hertz'sche Wellen`
  - Saarland contributes mixed lower-secondary side packaging through `Halbleiterschaltungstechnik I/II` inside broader class-9 and class-10 strips
  - Sachsen-Anhalt contributes mixed side packaging through semiconductors inside the year-9 electrodynamics focus on induction, generator, transformer, and conduction in metals and semiconductors
  - Hessen currently contributes no lower-secondary seed strip for this row
- the rollout tracker therefore keeps the additional lower-secondary row admission frozen instead of promoting `Elektronik / Halbleiter / elektromagnetische Wellen` into the next nationwide row

Interpretation:

- this second visible candidate also does **not** clear the admission bar
- the decisive blocker is again the missing Hessen lower-secondary seed plus the fact that most non-Sachsen evidence is still bundled into broader electricity/electrodynamics strips rather than one clean retained nationwide row
- the next clean Physics move remains to keep the first audited Sek-I tranche stable until a genuinely Hessen-seeded and multi-state-supported next row emerges

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics runs the first explicit evidence pass for `Sek I Kosmos / Erde / Mensch / Astronomie` and keeps the row closed

What changed:

- the topic workboard blocker note now names the strongest currently visible next lower-secondary candidate explicitly: `Sek I Kosmos / Erde / Mensch / Astronomie`
- the retained-source evidence is now documented more precisely:
  - Sachsen carries one clear lower-secondary astronomy anchor through `K10 Lernbereich 2 Kosmos, Erde und Mensch`
  - Hamburg contributes only one local side clause on `Energieerzeugung in der Sonne` inside the transition strip `Licht und Materie`
  - Bayern's strongest astronomy evidence in the retained source bundle is upper-secondary `Ph13 Astrophysik`, not a lower-secondary strip
  - Hessen currently contributes no lower-secondary seed strip for this row
- the rollout tracker therefore keeps the additional lower-secondary row admission frozen instead of promoting `Kosmos / Erde / Mensch / Astronomie` into the next nationwide row

Interpretation:

- the strongest visible post-tranche candidate is now named and evidence-backed, but it still does **not** clear the admission bar
- the decisive blocker is not only thin multi-state support; it is specifically the missing Hessen lower-secondary seed plus the fact that the Bayern evidence does not actually strengthen the Sek-I side
- the next clean Physics move remains to keep the first audited Sek-I tranche stable until a genuinely Hessen-seeded and multi-state-supported next row emerges

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics freezes additional lower-secondary row admission after the first audited Sek-I tranche

What changed:

- the topic workboard no longer treats another preselected lower-secondary row as implicitly next
- the current reviewed decision is now explicit: the first renewed lower-secondary tranche stops after
  - `Sek I Elektrizitaet / Magnetismus`
  - `Sek I Mechanik / Bewegung`
  - `Sek I Optik / Licht / Schall`
  - `Sek I Waerme / Thermik / Teilchenmodell`
  - `Sek I Radioaktivitaet / Kernphysik`
  - `Sek I Stoffe / Dichte / Druck / Auftrieb`
  - `Sek I Energie / Arbeit / Leistung / Erhaltung`
  - `Sek I Klima / Energieversorgung / Umwelturteil`
- the rollout tracker now freezes additional lower-secondary row admission at the current reviewed cut instead of opening another nationwide row on reflex
- `Sek I Kosmos / Erde / Mensch / Astronomie` is explicitly **not admitted yet** as the next nationwide row candidate

Interpretation:

- the retained lower-secondary evidence beyond the first audited tranche is currently still too sparse and too unevenly distributed to justify another nationwide row
- the strongest visible next-row evidence is currently concentrated in side packaging such as Bayern lower-secondary astronomy material, Sachsen `Kosmos, Erde und Mensch`, and isolated Hamburg bridge clauses, but not in one sufficiently Hessen-seeded and multi-state-supported strip
- the next clean Physics move is therefore to keep the completed first Sek-I tranche stable until either another retained lower-secondary row becomes clearly row-worthy or a new source-backed widening changes that evidence floor

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics completes the renewed lower-secondary all-state reviewed pass on `Sek I Klima / Energieversorgung / Umwelturteil`

What changed:

- the topic board row `Sek I Klima / Energieversorgung / Umwelturteil` is now resolved once across every currently source-backed lower-secondary state cell instead of still carrying only unresolved `n/s` cells
- the row now explicitly distinguishes
  - the Hessen lower-secondary seed lane
  - retained Bayern side evidence as `loc` through the common Gymnasium bundle on climate-system texts, climate-protection measures, and source-based environmental evaluation
  - additional retained side packaging on `DE-HH`, `DE-SL`, and `DE-SN`, where climate, Kraftwerke, nachhaltige Energieversorgung, Klimaphysik, or gesellschaftliche Einordnung remain embedded in transition strips, mixed class-10 bundles, or the Sachsen `K9 Lernbereich 2 Energieversorgung`
  - still-missing lower-secondary retained-source placeholders or row-external packaging on `DE-HB`, `DE-MV`, `DE-BW`, `DE-BE`, `DE-BB`, `DE-NI`, `DE-NW`, `DE-RP`, `DE-ST`, `DE-SH`, and `DE-TH`
- the active rollout tracker no longer advances to another preselected lower-secondary row; it now moves to an explicit lower-secondary row-admission decision on whether one more nationwide row should be opened at the current reviewed cut

Interpretation:

- the renewed lower-secondary climate/energy-supply/environment-judgment row pass does **not** justify another canonical Sek-I climate, energy-supply, or environmental-judgment package split
- the current shared Sek-I surface remains sufficient on the canonical level
- the remaining debt on this row is now limited to later retained-source activation or later anchor widening for currently local climate/energy-supply packaging, not a visible new canonical atom gap
- the next clean Physics move is therefore an explicit decision whether the retained lower-secondary evidence already justifies one more nationwide row beyond this first audited tranche, not another reflex state-local widening

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`
- the active coordination lane stays on `F5.ALL_STATE_HORIZONTAL_TOPIC_REENTRY`

### 2026-04-20: Physics completes the renewed all-state reviewed pass on `Sek II Elektrizitaet / Magnetismus / Induktion`

What changed:

- the topic board row `Sek II Elektrizitaet / Magnetismus / Induktion` is now resolved once across all retained state columns instead of still carrying unresolved `n/s` cells
- the row now explicitly distinguishes
  - reviewed corridor evidence on `DE-BY`, `DE-BW`, `DE-BE`, `DE-BB`, `DE-HE`, `DE-NI`, `DE-NW`, `DE-RP`, and `DE-SH`
  - broad structural anchors on `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH`
- the active rollout tracker now advances the horizontal pass from `Sek II Elektrizitaet / Magnetismus / Induktion` to `Sek II Schwingungen / Wellen`

Interpretation:

- the renewed all-state field/induction row pass does **not** justify another canonical field, magnetism, or induction package split
- the current shared field/induction surface remains sufficient on the canonical level
- the remaining debt on this row is now disciplined residue handling on the frozen BE/BB trio `c0` / `Relativitaet` / `Eintrittswinkel` plus the frozen SH micro-residues, not a visible new canonical atom gap
- the next clean Physics move is therefore the next horizontal all-state reviewed row on `Sek II Schwingungen / Wellen`

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics completes the renewed all-state reviewed pass on `Sek II Schwingungen / Wellen`

What changed:

- the topic board row `Sek II Schwingungen / Wellen` is now resolved once across all retained state columns instead of still carrying unresolved `n/s` cells
- the row now explicitly distinguishes
  - reviewed corridor evidence on `DE-BY`, `DE-BW`, `DE-HE`, `DE-NI`, `DE-NW`, and `DE-RP`
  - broad structural anchors on `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH`
  - local side packaging on `DE-BE`, `DE-BB`, and `DE-SH`
- the active rollout tracker now advances the horizontal pass from `Sek II Schwingungen / Wellen` to `Sek II Quanten / Atom / Kernphysik`

Interpretation:

- the renewed all-state oscillation/wave row pass does **not** justify another canonical oscillation, wave, or optics package split
- the current shared oscillation/wave surface remains sufficient on the canonical level
- the remaining debt on this row is now disciplined residue handling on the frozen RP micro-residues `Periodendauer`, `Polarisation`, `Weisslichtspektrum`, and `gekoppelte Schwingungen`, not a visible new canonical atom gap
- the next clean Physics move is therefore the next horizontal all-state reviewed row on `Sek II Quanten / Atom / Kernphysik`

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics completes the renewed all-state reviewed pass on `Sek II Quanten / Atom / Kernphysik`

What changed:

- the topic board row `Sek II Quanten / Atom / Kernphysik` is now resolved once across all retained state columns instead of still carrying unresolved `n/s` cells
- the row now explicitly distinguishes
  - reviewed corridor evidence on `DE-BW`, `DE-NW`, and `DE-RP`, with the canonical row still seeded from `DE-HE`
  - broad structural anchors on `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH`
  - local side packaging on `DE-BY`, `DE-NI`, `DE-BE`, `DE-BB`, and `DE-SH`
- the active rollout tracker now advances from the completed initial Sek-II row tranche to the first lower-secondary row `Sek I Elektrizitaet / Magnetismus`

Interpretation:

- the renewed all-state quantum/atom/kernel row pass does **not** justify another canonical quantum, atom-model, or particle-physics package split
- the current shared Q3/Q4 quantum surface remains sufficient on the canonical level
- the remaining debt on this row is now disciplined residue handling on the frozen RP clauses for Planck estimation, `Paarerzeugung`, remaining LF application examples, and `Offene Fragen`, not a visible new canonical atom gap
- with all four initial Sek-II rows now horizontally audited once, the next clean Physics move is the first lower-secondary all-state reviewed row on `Sek I Elektrizitaet / Magnetismus`

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics completes the first lower-secondary all-state reviewed pass on `Sek I Elektrizitaet / Magnetismus`

What changed:

- the topic board row `Sek I Elektrizitaet / Magnetismus` is now resolved once across every currently source-backed lower-secondary state cell instead of still carrying only unresolved `n/s` cells
- the row now explicitly distinguishes
  - the Hessen lower-secondary seed lane
  - broad structural anchors on `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH`
  - retained Bayern side evidence as `loc` through the shared Gymnasium bundle on `Ph8 Elektrischer Strom` and `Ph10 Elektromagnetismus`
  - still-missing lower-secondary retained-source placeholders on `DE-BW`, `DE-BE`, `DE-BB`, `DE-NI`, `DE-NW`, `DE-RP`, and `DE-SH`
- the active rollout tracker now advances from the first lower-secondary reviewed row `Sek I Elektrizitaet / Magnetismus` to the next lower-secondary row `Sek I Mechanik / Bewegung`

Interpretation:

- the renewed lower-secondary electricity/magnetism row pass does **not** justify another canonical Sek-I electricity, magnetism, or induction package split
- the current shared Sek-I electricity/magnetism surface remains sufficient on the canonical level
- the remaining debt on this row is now limited to later retained-source activation for the still-missing lower-secondary state lanes, not a visible new canonical atom gap
- the next clean Physics move is therefore the next lower-secondary all-state reviewed row on `Sek I Mechanik / Bewegung`

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics completes the renewed lower-secondary all-state reviewed pass on `Sek I Mechanik / Bewegung`

What changed:

- the topic board row `Sek I Mechanik / Bewegung` is now resolved once across every currently source-backed lower-secondary state cell instead of still carrying only unresolved `n/s` cells
- the row now explicitly distinguishes
  - the Hessen lower-secondary seed lane
  - broad structural anchors on `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH`
  - retained Bayern side evidence as `loc` through the shared Gymnasium bundle on `Ph8 Mechanik`, `Ph9 Energie als Erhaltungsgroesse`, and the two `Ph10` mechanics strips
  - still-missing lower-secondary retained-source placeholders on `DE-BW`, `DE-BE`, `DE-BB`, `DE-NI`, `DE-NW`, `DE-RP`, and `DE-SH`
- the active rollout tracker now advances from the lower-secondary reviewed row `Sek I Mechanik / Bewegung` to the next lower-secondary row `Sek I Optik / Licht / Schall`

Interpretation:

- the renewed lower-secondary mechanics row pass does **not** justify another canonical Sek-I mechanics, movement, or energy package split
- the current shared Sek-I mechanics surface remains sufficient on the canonical level
- the remaining debt on this row is now limited to later retained-source activation for the still-missing lower-secondary state lanes, not a visible new canonical atom gap
- the next clean Physics move is therefore the next lower-secondary all-state reviewed row on `Sek I Optik / Licht / Schall`

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics completes the renewed lower-secondary all-state reviewed pass on `Sek I Optik / Licht / Schall`

What changed:

- the topic board row `Sek I Optik / Licht / Schall` is now resolved once across every currently source-backed lower-secondary state cell instead of still carrying only unresolved `n/s` cells
- the row now explicitly distinguishes
  - the Hessen lower-secondary seed lane
  - broad structural anchors on `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH`
  - retained Bayern side evidence as `loc` through the shared Gymnasium bundle on `Ph8 Optik`
  - still-missing lower-secondary retained-source placeholders on `DE-BW`, `DE-BE`, `DE-BB`, `DE-NI`, `DE-NW`, `DE-RP`, and `DE-SH`
- the active rollout tracker now advances from the lower-secondary reviewed row `Sek I Optik / Licht / Schall` to the next lower-secondary row `Sek I Waerme / Thermik / Teilchenmodell`

Interpretation:

- the renewed lower-secondary optics/light/sound row pass does **not** justify another canonical Sek-I optics, light, or sound package split
- the current shared Sek-I optics/light/sound surface remains sufficient on the canonical level
- the remaining debt on this row is now limited to later retained-source activation for the still-missing lower-secondary state lanes, not a visible new canonical atom gap
- the next clean Physics move is therefore the next lower-secondary all-state reviewed row on `Sek I Waerme / Thermik / Teilchenmodell`

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics completes the renewed lower-secondary all-state reviewed pass on `Sek I Waerme / Thermik / Teilchenmodell`

What changed:

- the topic board row `Sek I Waerme / Thermik / Teilchenmodell` is now resolved once across every currently source-backed lower-secondary state cell instead of still carrying only unresolved `n/s` cells
- the row now explicitly distinguishes
  - the Hessen lower-secondary seed lane
  - one broad structural anchor on `DE-SL`
  - retained Bayern side evidence as `loc` through the shared Gymnasium bundle on `Ph9 Waermelehre`
  - additional retained lower-secondary side evidence on `DE-MV`, `DE-SN`, `DE-ST`, and `DE-TH`, where the thermics strips remain explicitly source-led outside the current `P3` anchor cut
  - still-missing lower-secondary retained-source placeholders or row-external packaging on `DE-HB`, `DE-HH`, `DE-BW`, `DE-BE`, `DE-BB`, `DE-NI`, `DE-NW`, `DE-RP`, and `DE-SH`
- the active rollout tracker now advances from the lower-secondary reviewed row `Sek I Waerme / Thermik / Teilchenmodell` to the next lower-secondary row `Sek I Radioaktivitaet / Kernphysik`

Interpretation:

- the renewed lower-secondary thermics row pass does **not** justify another canonical Sek-I heat, thermics, or particle-model package split
- the current shared Sek-I thermics surface remains sufficient on the canonical level
- the remaining debt on this row is now limited to later retained-source activation or later anchor widening for the still source-led lower-secondary thermics strips, not a visible new canonical atom gap
- the next clean Physics move is therefore the next lower-secondary all-state reviewed row on `Sek I Radioaktivitaet / Kernphysik`

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics completes the renewed lower-secondary all-state reviewed pass on `Sek I Radioaktivitaet / Kernphysik`

What changed:

- the topic board row `Sek I Radioaktivitaet / Kernphysik` is now resolved once across every currently source-backed lower-secondary state cell instead of still carrying only unresolved `n/s` cells
- the row now explicitly distinguishes
  - the Hessen lower-secondary seed lane
  - broad structural anchors on `DE-HB`, `DE-MV`, `DE-SL`, and `DE-TH`
  - retained Bayern side evidence as `loc` through the shared Gymnasium bundle on `Ph10 Kernphysik`
  - retained Hamburg side packaging as `loc` through the transition strip `Licht und Materie` with ionising radiation
  - still-missing lower-secondary retained-source placeholders or row-external packaging on `DE-BW`, `DE-BE`, `DE-BB`, `DE-NI`, `DE-NW`, `DE-RP`, `DE-SH`, `DE-SN`, and `DE-ST`
- the active rollout tracker now advances from the lower-secondary reviewed row `Sek I Radioaktivitaet / Kernphysik` to the next lower-secondary row `Sek I Stoffe / Dichte / Druck / Auftrieb`

Interpretation:

- the renewed lower-secondary radioactivity/nuclear row pass does **not** justify another canonical Sek-I radioactivity, nuclear physics, or nuclear-energy package split
- the current shared Sek-I radioactivity/nuclear surface remains sufficient on the canonical level
- the remaining debt on this row is now limited to later retained-source activation or later anchor widening for the still row-external lower-secondary state lanes, not a visible new canonical atom gap
- the next clean Physics move is therefore the next lower-secondary all-state reviewed row on `Sek I Stoffe / Dichte / Druck / Auftrieb`

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics completes the renewed lower-secondary all-state reviewed pass on `Sek I Stoffe / Dichte / Druck / Auftrieb`

What changed:

- the topic board row `Sek I Stoffe / Dichte / Druck / Auftrieb` is now resolved once across every currently source-backed lower-secondary state cell instead of still carrying only unresolved `n/s` cells
- the row now explicitly distinguishes
  - the Hessen lower-secondary seed lane
  - broad structural anchors on `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH`
  - retained Bayern side evidence as `loc` through the shared Gymnasium bundle on pressure and gases in `Ph9 Waermelehre`
  - retained Bremen side packaging as `loc` through the J7/8 force-motion strip with Dichte
  - still-missing lower-secondary retained-source placeholders or row-external packaging on `DE-HH`, `DE-BW`, `DE-BE`, `DE-BB`, `DE-NI`, `DE-NW`, `DE-RP`, and `DE-SH`
- the active rollout tracker now advances from the lower-secondary reviewed row `Sek I Stoffe / Dichte / Druck / Auftrieb` to the next lower-secondary row `Sek I Energie / Arbeit / Leistung / Erhaltung`

Interpretation:

- the renewed lower-secondary density/pressure/buoyancy row pass does **not** justify another canonical Sek-I materials, density, pressure, or buoyancy package split
- the current shared Sek-I density/pressure/buoyancy surface remains sufficient on the canonical level
- the remaining debt on this row is now limited to later retained-source activation or later anchor widening for the still row-external lower-secondary state lanes, not a visible new canonical atom gap
- the next clean Physics move is therefore the next lower-secondary all-state reviewed row on `Sek I Energie / Arbeit / Leistung / Erhaltung`

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

### 2026-04-20: Physics completes the renewed lower-secondary all-state reviewed pass on `Sek I Energie / Arbeit / Leistung / Erhaltung`

What changed:

- the topic board row `Sek I Energie / Arbeit / Leistung / Erhaltung` is now resolved once across every currently source-backed lower-secondary state cell instead of still carrying only unresolved `n/s` cells
- the row now explicitly distinguishes
  - the Hessen lower-secondary seed lane
  - retained Bayern side evidence as `loc` through the shared Gymnasium bundle on `Ph9 Energie als Erhaltungsgroesse`
  - additional retained side packaging on `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH`, where energy, work, power, efficiency, or conservation remain bundled into mechanics strips, transition packages, feeders, or explicitly source-led lower-secondary leaves
  - still-missing lower-secondary retained-source placeholders or row-external packaging on `DE-BW`, `DE-BE`, `DE-BB`, `DE-NI`, `DE-NW`, `DE-RP`, and `DE-SH`
- the active rollout tracker now advances from the lower-secondary reviewed row `Sek I Energie / Arbeit / Leistung / Erhaltung` to the next lower-secondary row `Sek I Klima / Energieversorgung / Umwelturteil`

Interpretation:

- the renewed lower-secondary energy row pass does **not** justify another canonical Sek-I energy, work, power, or conservation package split
- the current shared Sek-I energy surface remains sufficient on the canonical level
- the remaining debt on this row is now limited to later retained-source activation or later anchor widening for the still bundled lower-secondary energy strips, not a visible new canonical atom gap
- the next clean Physics move is therefore the next lower-secondary all-state reviewed row on `Sek I Klima / Energieversorgung / Umwelturteil`

Validation:

- `python3 scripts/render_canonical_physics_bundesland_status.py`
- `git diff --check`

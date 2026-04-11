# Canonical Gymnasium Physics M2 Lane Shortlist

Snapshot: `2026-04-11`

This document narrows the first post-`M1` Physics rollout move.

It started intentionally smaller than a full machine-readable rollout tracker.
Physics now has that tracker because Hessen, Bayern, Nordrhein-Westfalen, and Baden-Wuerttemberg are active on the current canonical path.
The shortlist still exists because it keeps the narrower M2 corridor reasoning readable beside the machine-readable tracker.

Execution update on `2026-04-11`:

- the recommended first third-state lane is no longer only proposed
- `DE-NW` upper-secondary Physics now has:
  - an active source snapshot
  - a source-landscape registry entry
  - provenance-backed membership and closure entries
  - a reserved repository-backed mapping scaffold
- the next recommended fourth-state lane is now no longer only proposed either
- `DE-BW` upper-secondary Physics now has:
  - an active source snapshot
  - a source-landscape registry entry
  - provenance-backed membership and closure entries
  - a repository-backed mapping fixture
  - one first reviewed narrow field corridor across the shared orientation anchor plus Basisfach/Leistungsfach `Elektromagnetische Felder`
  - one adjacent BF-electrodynamics induction strip on the shared canonical induction cluster plus three aligned induction atoms
  - one adjacent BF-applications follow-on on a new narrow canonical induction-applications atom
  - one adjacent BF-Maxwell-overview follow-on on a new narrow canonical Maxwell-overview atom
  - one adjacent BF-`Schwingungen` follow-on on the shared canonical Q2 surface plus four conservative reviewed oscillation bridges
  - one adjacent BF-`Wellen` follow-on on the canonical `Mechanische Wellen` cluster plus six conservative reviewed wave and spectrum bridges
  - one adjacent LF-electrodynamics follow-on on three exact canonical induction atoms
  - one first adjacent LF-`Schwingungen` follow-on on the shared canonical Q2 surface plus three exact reviewed leaf bridges on mechanical DGL solving, LC-DGL solving, and independent-oscillation superposition
  - one first adjacent LF-`Wellen` follow-on on two exact reviewed leaf bridges for progressive plane transverse-wave modeling and Hertz-dipole / electromagnetic-radiation transfer
  - one first adjacent LF-`Wellenoptik` follow-on on two exact reviewed leaf bridges for coherent light as electromagnetic wave and the comparison of ray and wave model of light

See also:

- `docs/dev/canonical-gymnasium-physics-parity-plan.md`
- `docs/dev/canonical-gymnasium-migration-status.md`
- `docs/dev/canonical-gymnasium-math-de-expansion-plan.md`

## 1. Current constraint

Canonical Physics has now reached hardened `M1` parity for the reviewed `DE-HE` + `DE-BY` corridor.

What does **not** exist yet for Physics beyond the currently active Hessen, Bayern, Nordrhein-Westfalen, and Baden-Wuerttemberg surface:

- no additional Physics `source-json` snapshots outside Hessen, Bayern, Nordrhein-Westfalen, and Baden-Wuerttemberg
- no additional Physics source-landscape registry entries outside Hessen, Bayern, Nordrhein-Westfalen, and Baden-Wuerttemberg
- no reviewed fifth-state Physics composition views yet
- no active fifth-state Physics lane yet, so the next rollout decision should still stay narrow

What **does** already exist and can be reused:

- DE-level input folders and subject-source links for many Bundeslaender under `curricula/DE/Gymnasium/input/*/README.md`
- established mapping-lane naming conventions from mathematics, for example:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_math_upper_secondary_to_canonical_math.json`
  - `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_math_upper_secondary_to_canonical_math.json`
  - `curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_math_upper_secondary_to_canonical_math.json`
- active mathematics `source-json` lanes for all Bundeslaender, which means the repo structure and registry workflow are already proven

Operational consequence:

- the next Physics move should now be either **one small adjacent follow-on on the active BW lane**, now most plausibly the quantitative Interferenz-/Fernfeld-streifen inside Leistungsfach `Wellenoptik`, or **one small fifth-state source lane**, not a broad multi-state sweep
- the first slice should prefer **upper-secondary Physics**, because the canonical Physics graph and composition views are already strongest there

## 2. Candidate ranking

| Candidate lane | Priority | Why it is attractive | Main complication | Recommended first slice |
| --- | --- | --- | --- | --- |
| `DE-NW` upper-secondary | `1` | Separate Gymnasium-Oberstufe Physics source, existing math source-snapshot lane, no shared-state curriculum semantics, good fit for current canonical Sek-II Physics surface | still needs the first Physics snapshot and registry activation from scratch | one upper-secondary source snapshot plus one first reviewed entry corridor |
| `DE-BW` upper-secondary | `2` | Clear Kursstufe source shape (`Basisfach` / `Leistungsfach`), existing math Stage-C pattern in repo, good fit for `GK` / `LK` composition scopes | terminology and course packaging differ from Hessen/Bayern and may need careful placement semantics | one upper-secondary source snapshot plus one first reviewed entry corridor |
| `DE-BE` + `DE-BB` upper-secondary | `3` | one shared source family could later unlock two states with one authoring surface | shared-curriculum handling increases provenance and applicability coordination immediately | first one shared upper-secondary source snapshot family, then split jurisdiction-specific mapping lanes |
| `DE-SH` combined-stage Physics | `4` | one source family covers the subject broadly and could reduce source hunting | combined-stage source shape is less aligned with the existing Physics `SekI` / `SekII` split | one upper-secondary-focused source cut extracted from the combined source |
| `DE-NI` upper-secondary | `5` | strong repo familiarity from math onboarding and clear Sek-II Physics source link | Sek-I source is a broader Naturwissenschaften lane, so a future full-state bundle would not stay as cleanly Physics-only | one upper-secondary source snapshot only; defer Sek-I decisions |

Not recommended as the first M2 lane:

- a new Sek-I-only Physics lane
- a simultaneous `DE-BE` + `DE-BB` two-state rollout
- any lane that starts by inventing state-scoped composition views before there is a source snapshot and mapping evidence

## 3. Historical first executable lane

Recommended lane: `DE-NW` upper-secondary Physics

Why this is the cleanest next cut:

- it extends Physics beyond Hessen+Bayern without introducing shared-source dual-state semantics on day one
- it reuses a repo area that already exists for math:
  - `curricula/DE/Gymnasium/input/NW/upper-secondary/source-json/`
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/`
- it stays on the strongest part of canonical Physics:
  - upper-secondary phase/course structure
  - existing `GK` / `LK` learner-facing views
  - existing Math-to-Physics bridge behavior
- it preserves the rule that new state lanes should be source-led and corridor-based rather than view-led

## 4. Historical minimal artifact bundle for the NRW move

The next step should create only the smallest bundle that turns `DE-NW` from README-only into a real Physics source lane:

1. source snapshot
- target file:
  - `curricula/DE/Gymnasium/input/NW/upper-secondary/source-json/DE_NRW_S_GYM_2_PHYSIK.de.json.snapshot`
- purpose:
  - establish the first archived NRW upper-secondary Physics source lane under the DE-level input structure

2. source-landscape registry activation
- target file:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
- purpose:
  - register the NRW upper-secondary Physics source landscape and its `archiveSourcePath`

3. provenance seed
- target files:
  - `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`
  - `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
- purpose:
  - activate the snapshot as a provenance-backed source lane, even if the first pass is still structural or narrow

4. mapping-lane scaffold
- target file:
  - `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_physics_upper_secondary_to_canonical_physics.json`
- purpose:
  - host the first NRW upper-secondary Physics mappings under the normal DE-level naming convention

5. first reviewed corridor
- rule:
  - choose one didactically closed upper-secondary entry corridor from the imported snapshot
  - prefer a corridor that can reuse the existing canonical Physics Sek-II surface and current Math bridge without forcing new broad composition debt
- execution update on `2026-04-10`:
  - done for `DE-NW` on the shared motivation plus E-phase entry corridor
  - done for `DE-NW` on a second narrow GK `Quantenobjekte` corridor by anchoring NRW `Photonen` / `Elektronen` / `Modelle` conservatively to the canonical Q3 `Welle-Teilchen-Dualismus` surface
  - done for `DE-NW` on a third narrow split GK corridor by anchoring the imported light-wave atom to canonical Q3 `Elektromagnetische Wellen` and the imported field atom to canonical Q1 `Elektrisches und magnetisches Feld`
  - done for `DE-NW` on a first narrow LK corridor by anchoring the imported mixed LK parent to canonical Q4 `Struktur von Materie, Raum und Zeit` and its two LK children to canonical `Quantenobjekte` and `Kernphysik`
  - done for `DE-NW` on a first narrow LK residue split by widening the imported `Atom- und Kernphysik` source residue into `Materie`, `Strahlung/Zerfaelle`, and `Bewertung`, then anchoring the latter two conservatively to canonical `Radioaktive Strahlung und Wirkungen` and `Beurteilung von Strahlungsrisiken und Kernenergie`
  - done for `DE-NW` on a second narrow LK residue split by widening the imported radiation residue into `Strahlung/Wirkungen` and `Zerfaelle/Kernumwandlungen`, then anchoring those children conservatively to canonical `Radioaktive Strahlung und Wirkungen` and `Zerfallsgesetze anwenden`
  - done for `DE-NW` on a third narrow LK residue split by widening the imported judgement residue into `Strahlungsrisiken` and `Kernenergieoptionen`, then anchoring those children conservatively to the canonical Q4 context leaves on `Strahlungsrisiken` and `Kernenergieoptionen`
  - done for `DE-NW` on a preparatory source-only LK matter split by widening the imported matter residue into `Elementare Bestandteile der Materie mit Strukturmodellen ordnen` and `Kernaufbau und Bindungen in einfachen Modellen beschreiben` without yet claiming a canonical bridge
  - done for `DE-NW` on a first narrow LK matter bridge by anchoring `Elementare Bestandteile der Materie mit Strukturmodellen ordnen` conservatively to the broad canonical Q4 cluster `Elementarteilchen und Standardmodell`
  - done for `DE-NW` on a second source-only LK matter split by widening the remaining `Kernaufbau/Bindungen` residue into `Kernaufbau` and `Bindungen/Modellgrenzen` without yet claiming another canonical bridge
  - done for `DE-NW` on a second narrow LK matter bridge by anchoring `Kernaufbau in einfachen Modellen beschreiben` conservatively to the existing canonical structural atom `Kern und Hülle des Atoms qualitativ beschreiben` instead of forcing a sharper Q4 energy/reaction target
  - done for `DE-NW` on a third source-only LK matter split by widening the remaining `Bindungen/Modellgrenzen` residue into `Bindungen` and `Modellgrenzen` without yet claiming another canonical bridge
  - done for `DE-NW` on an explicit no-bridge review for the remaining LK `Bindungen` child: the current canonical candidates `Bindungsenergie und Massendefekt`, `Potenzialtopfmodell für Kerne`, and `Fundamentale Wechselwirkungen` all overclaim relative to the NRW source wording, so the lane intentionally stops short of another mapping here
  - done for `DE-NW` on a first committed applicability pass by persisting compiled NRW visibility for seven shared canonical Physics targets and by moving the corresponding NRW-only `APV-202` findings into the accepted-warning registry
  - done for `DE-NW` on a committed matter-structure follow-on by replacing the earlier broad `Elementarteilchen und Standardmodell` bridge with a new narrow canonical atom `Elementare Bestandteile der Materie mit Strukturmodellen ordnen`, which now carries `DE-NW` directly while the parent cluster follows through child-union
  - done for `DE-NW` on a committed GK field follow-on by splitting the imported mixed E/B-field clause into electric- and magnetic-field children and exact-anchoring both to new narrow canonical Q1 atoms, which now pull `Q1 Elektrisches und magnetisches Feld` and its reviewed electric/magnetic parent clusters into `DE-NW` through child-union
  - done for `DE-NW` on a committed GK quantum-object follow-on by exact-anchoring the two imported Photon/Elektron children to new narrow canonical Q4 atoms, which now pull the shared canonical `Quantenobjekte` cluster into `DE-NW` through child-union while the GK parent still keeps the reviewed Q3 duality corridor alive
  - current reviewed bridges still stay deliberately narrow and mostly `partial`, because the canonical Physics graph still does not expose one-to-one NRW surfaces for the imported `periodische Vorgaenge` wording, for the mixed NRW parent `Klassische Wellen und Teilchen in Feldern`, or for the still unmapped NRW LK matter children on `Bindungen` and `Modellgrenzen`

6. test fence
- minimum expected checks after the first NRW Physics lane becomes real:
  - mapping fixture coverage
  - `LandscapeServiceTest` coverage if applicability/provenance visibility changes
  - app validation for graph and view filters

## 5. What should not happen on the first NRW move

Do not do these as part of the first NRW step:

- no third-state Physics rollout tracker yet
- no speculative `DE-NW` Physics composition views before the first source-backed corridor proves they are needed
- no broad canonical Physics expansion just to accommodate NRW packaging
- no simultaneous NRW Sek-I onboarding

The clean boundary is:

- first make NRW upper-secondary Physics a real DE-level source lane
- then map one reviewed corridor
- only then decide whether NRW-specific learner-facing trees differ enough from the DE-wide Physics views to justify explicit state views

## 6. Historical tracker trigger after NRW

Adding `DE-NW` would still not justify the full machine-readable Physics Bundesland rollout tracker.

That tracker becomes worth adding once:

- Physics has at least one more non-Hessen state beyond Bayern, and
- a further next lane is ready after that, so there is real multi-state rollout sequencing pressure

Practical rule:

- after `DE-NW`, the next clean tracker trigger would be a further state such as `DE-BW` or the shared `DE-BE` / `DE-BB` source family

## 7. Historical definition of success for the first execution turn

The next implementation turn is successful if it leaves Physics with:

- one chosen third-state lane
- one real archived source snapshot for that lane
- one active source-landscape registry entry
- one provenance-backed source lane
- one mapping-lane file path reserved for Physics under the normal naming convention

At that point, Physics moves from "M1 complete" into real `M2` execution instead of staying at the level of abstract rollout intent.

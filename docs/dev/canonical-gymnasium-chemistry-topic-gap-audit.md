# Canonical Gymnasium Chemistry Topic-Gap Audit

Snapshot: `2026-05-11`

Purpose:

- run the first horizontal Chemistry QA pass after all 16 tracked Bundesland source lanes reached clean source-backed projection
- test whether the current canonical Chemistry graph has real shared topic gaps or mainly packaging residue
- define the next review lane before moving additional states from `P4` to broader `P5` / `P6` readiness

## Scope

In scope:

- the canonical Chemistry landscape:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`
- all Chemistry source-to-canonical review files under:
  - `curricula/DE/Gymnasium/mapping/DE-*/**/*chemistry*review.json`
- the current source-coverage and curriculum-quality reports:
  - `docs/qa-ci/status/curriculum-source-coverage-audit.json`
  - `docs/qa-ci/status/curriculum-quality-status.json`

Out of scope:

- direct canonical JSON refactoring in this pass
- state cutover decisions beyond recording the next QA lane
- source re-extraction for already clean lanes unless a later source revision changes evidence

## Baseline Signal

The all-state source-led baseline is now clean:

- source inventories readable and registered: `16/16`
- source-backed projections clean: `16/16`
- source atomic goals: `5641`
- source atomic goals mapped into learner-facing views: `5641`
- unmapped source atomic goals: `0`
- unsupported assigned atomic goals: `0`
- partial source-linked atomic goals: `0`

Interpretation:

- there is no open source-goal coverage failure
- the remaining Chemistry question is now semantic packaging, not first source onboarding
- broad source-to-cluster mappings are the main QA signal for possible canonical topic refinement

## Topic Surface Review

| Canonical top package | Source-state signal | Judgment |
| --- | ---: | --- |
| `Chemische Grundlagen (Sek I)` | `16` states / `2131` source goals | Stable shared Sek-I foundation. No new canonical atom needed in this pass. |
| `Chemische Erkenntnisgewinnung und Kommunikation (Sek I)` | `15` states / `1629` source goals | Stable process and communication corridor; keep as shared spine. |
| `Chemische Reaktionen und Energieumsatz (Sek I)` | `16` states / `785` source goals | Stable shared reaction / energy foundation. |
| `Chemische Symbolsprache und Anwendung (Sek I)` | `13` states / `387` source goals | Stable enough; missing pressure is mostly source packaging and stage naming. |
| `Stoffmenge, molare Groessen und Gase (Sek I)` | `7` states / `53` source goals | Boundary corridor. Keep source-backed, but do not broaden artificially. |
| `Ionen und Elektrolyse (Sek I)` | `16` states / `452` source goals | Stable shared ion / redox / electrolysis surface. |
| `Atombau, Bindungsmodelle, Molekuelgeometrie und Polaritaet` | `16` states / `1084` source goals | Stable cross-state structure and bonding backbone. |
| `Oberstufen-Atombau und Periodensystem` | `13` states / `171` source goals | Stable upper-secondary continuation; no new packaging needed yet. |
| `Elementgruppen, Salze und Alltagskontexte (Sek I)` | `4` states / `11` source goals | State-local / older-source corridor; keep retained, not a broad canonical gap. |
| `Kohlenwasserstoffe und Nachweise (Sek I)` | `5` states / `9` source goals | State-local Sek-I hydrocarbon bridge; keep narrow. |
| `Einfuehrungsphase Reaktionsgrundlagen` | `16` states / `1955` source goals | Very strong shared signal, but also the largest broad-cluster residue. |
| `Stoffgruppen` | `16` states / `840` source goals | Stable upper-secondary organic / substance-group spine. |
| `Naturstoffe und Synthesechemie` | `15` states / `698` source goals | Stable, with some state-local LK and pharmaceutical depth. |
| `Chemisches Gleichgewicht` | `15` states / `1231` source goals | Stable equilibrium / acid-base / redox / electrochemistry backbone. |
| `Energie und Nachhaltigkeit` | `15` states / `443` source goals | Stable topic, but broad source wording needs packaging review. |
| `Quantitative und instrumentelle Analytik` | `5` states / `8` source goals | Narrow LK / special-method corridor; keep as retained depth. |
| `Farbstoffchemie` | `12` states / `105` source goals | Shared enough to keep visible, but exact sub-packaging should stay under review. |
| `Biologisch-chemische Praktikumsverfahren` | `10` states / `92` source goals | Valid source-backed optional/practical corridor, mainly from BY-style BCP evidence. |

## Broad-Mapping Residue

The audit found `710` mapping edges that target canonical clusters rather than atomic goals.
That does not mean coverage is fake; it means the official source often speaks at a broader package level than the current atomic graph.

Highest-priority residue rows:

- `Erdol und Erdgas - Brennstoffe`
- `Einfuehrung organische Verbindungen`
- `Energie und Nachhaltigkeit`
- `Farbstoffchemie`
- `Q2 Pharmazie`

Judgment:

- these rows should be reviewed before broadening additional states to `P5`
- the review should first decide whether the source statements are legitimate broad package evidence
- only split or add atoms where multiple Bundeslaender expose the same missing assessable competence

## Review Log

### F4.1 E-phase reaction foundations

Status: `completed`

Reference:

- `docs/dev/canonical-gymnasium-chemistry-ephase-reaction-foundations-audit.md`

Reviewed residue:

- `442` broad cluster-target mapping edges under `Einfuehrungsphase Reaktionsgrundlagen`
- `236` edges to `Erdol und Erdgas - Brennstoffe`
- `206` edges to `Einfuehrung organische Verbindungen`

Decision:

- keep both packages as accepted learner-visible broad surfaces
- no new canonical atoms
- no state-applicability broadening from package wording alone
- reopen only if later exact-remapping exposes a repeated missing assessable routine

Next review lane:

- `Energie und Nachhaltigkeit`

### F4.2 Energy and sustainability

Status: `completed`

Reference:

- `docs/dev/canonical-gymnasium-chemistry-energy-sustainability-audit.md`

Reviewed residue:

- `213` broad cluster-target mapping edges under `Energie und Nachhaltigkeit`
- `199` edges to `Energie und Nachhaltigkeit`
- `14` edges to `Q4.3 Nachhaltige Chemie am Waschmittel`

Decision:

- keep both packages as accepted learner-visible broad surfaces
- no new canonical atoms
- no state-applicability broadening from package wording alone
- hydrogen, fuel-cell, thermodynamics, LCA, green-chemistry, and surfactant routines are already represented by existing atoms
- reopen only if later exact-remapping exposes a repeated missing assessable routine

Next review lane:

- `Farbstoffchemie`

### F4.3 Dye chemistry

Status: `completed`

Reference:

- `docs/dev/canonical-gymnasium-chemistry-dye-chemistry-audit.md`

Reviewed residue:

- `183` source-to-canonical mapping edges under `Farbstoffchemie`
- `105` unique source goals from `12` states
- `30` broad cluster-target mapping edges to `Farbstoffchemie`
- `153` direct atom-target mapping edges below the package

Decision:

- keep `Farbstoffchemie` as an accepted learner-visible broad surface
- no new canonical atoms
- no state-applicability broadening from package wording alone
- dye color models, spectra, synthesis, textile dyeing, indicators, and industry/application routines are already represented by existing atoms
- treat spectroscopy, chromatography, solar-cell, and chelate examples as boundary contexts unless exact-remapping exposes a repeated missing assessable routine

Next review lane:

- `Naturstoffe und Synthesechemie / Q2 Pharmazie`

### F4.4 Natural products and pharmacy

Status: `completed`

Reference:

- `docs/dev/canonical-gymnasium-chemistry-natural-products-pharmacy-audit.md`

Reviewed residue:

- `1600` source-to-canonical mapping edges under `Naturstoffe und Synthesechemie`
- `698` unique source goals from `15` states
- `22` broad cluster-target mapping edges
- `20` broad edges to `Q2 Pharmazie`
- `2` broad edges to `Naturstoffe und Synthesechemie`
- `1578` direct atom-target mapping edges below the package

Decision:

- keep `Naturstoffe und Synthesechemie` as an accepted learner-visible broad surface
- keep `Q2 Pharmazie` as an accepted applied-depth surface
- no new canonical atoms
- no state-applicability broadening from package wording alone
- medication misuse, dependency, pharmaceutical law, manufacturing practice, marketing, and workplace limits remain boundary context unless exact-remapping exposes a repeated chemically assessable routine

Next review lane:

- final F4 closure sweep over remaining low-priority broad-cluster mappings, then P5 candidate selection

### F4.5 Broad-residue closure and P5 candidate selection

Status: `completed`

Reference:

- `docs/dev/canonical-gymnasium-chemistry-broad-residue-closure-audit.md`

Reviewed residue:

- `710` total broad cluster-target mapping edges in the F4 signal
- `707` broad edges reviewed in F4.1 through F4.4
- `3` remaining low-priority broad edges
- `2` edges to `Stoffmenge, molare Groessen und Gase (Sek I)`
- `1` edge to `Kohlenwasserstoffe und Nachweise (Sek I)`

Decision:

- accept the remaining low-priority broad edges as package evidence
- no new canonical atoms
- no state-applicability broadening from package wording alone
- promote `DE-MV`, `DE-RP`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH` to `P5`
- keep `DE-BB`, `DE-BE`, and `DE-HB` at `P4` until their missing stage-specific source lanes are onboarded

## Canonical-Side Unmapped Atoms

The canonical graph still contains atoms without direct source-mapping evidence in the current all-state mapping set.
These are not unmapped source goals.

They fall into three groups:

- motivation, practice, and assessment offer nodes
- retained HE/BY depth atoms that are not currently asserted by a clean state projection
- narrow LK / special-depth atoms such as advanced mechanisms, Pourbaix, van't Hoff, Grignard, or selected BCP / pharmaceutical topics

Decision:

- do not remove them in this pass
- do not broaden their state applicability without source evidence
- revisit them only if a later topic-specific review shows they are either shared canonical depth or legacy-only retained material

## Audit Judgment

No immediate shared canonical Chemistry atom gap is proven by the all-state source evidence.

The canonical Chemistry graph has a usable shared backbone across:

- Sek-I foundations, reactions, ions/redox, atom/bonding, and inquiry communication
- upper-secondary reaction foundations, organic substance groups, natural products/synthesis, equilibrium, electrochemistry, energy/sustainability, dyes, and practical methods

The next real work is not another broad Bundesland onboarding pass.
F4 closed the packaging QA pass over broad-cluster source mappings without proving a shared missing canonical atom.
The remaining rollout work is maintenance and cutover readiness:

1. keep full two-stage `P5` states stable on source-backed projections
2. add missing stage source lanes before broadening `DE-BB`, `DE-BE`, and `DE-HB`
3. consider `P6` only after runtime, composition-view, and legacy migration checks

## Operational Decision

- close `F3 Remaining state source onboarding` as completed
- close `F4 Horizontal all-state Chemistry topic pass` as completed
- open `F5 Cutover and maintenance`
- promote `DE-MV`, `DE-RP`, `DE-SL`, `DE-SN`, `DE-ST`, and `DE-TH` to `P5`
- keep `DE-BB`, `DE-BE`, and `DE-HB` at `P4` until their missing stage source lanes exist
- do not add canonical atoms in this pass

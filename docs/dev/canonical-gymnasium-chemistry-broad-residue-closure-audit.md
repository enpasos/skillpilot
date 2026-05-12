# Canonical Gymnasium Chemistry Broad-Residue Closure Audit

Snapshot: `2026-05-11`

Purpose:

- close the final low-priority broad-cluster residue after the F4 horizontal Chemistry topic pass
- decide whether any remaining broad mapping proves a shared missing canonical atom
- select safe P5 broad-coverage candidates for the next rollout status update

## Residue Accounting

The F4 broad-mapping signal contains `710` source-to-canonical mapping edges that target canonical clusters rather than atomic goals.

Reviewed before this closure pass:

- `442` edges under `Einfuehrungsphase Reaktionsgrundlagen`
- `213` edges under `Energie und Nachhaltigkeit`
- `30` broad edges to `Farbstoffchemie`
- `22` broad edges under `Naturstoffe und Synthesechemie / Q2 Pharmazie`

That accounts for `707` broad cluster-target edges. The remaining low-priority residue is `3` edges.

## Remaining Low-Priority Residue

| Canonical cluster target | State | Broad edges | Source evidence | Judgment |
| --- | --- | ---: | --- | --- |
| `Stoffmenge, molare Groessen und Gase (Sek I)` | `DE-HE` | `2` | `Berechnungen: Masse, molare Masse, Stoffmenge und Konzentration von Loesungen`; `Saeure-Base-Titration ... Berechnung der Konzentration der Probeloesung` | Accepted package bridge. The exact mole, molar-mass, concentration, reaction-calculation, and titration routines are already covered by existing canonical atoms. |
| `Kohlenwasserstoffe und Nachweise (Sek I)` | `DE-HB` | `1` | `Kohlenwasserstoffe und Alkanole anhand ihres Molekuelbaus und ihrer Eigenschaften unterscheiden` | Accepted lower-secondary package bridge. Existing hydrocarbon, alkanol, molecular-structure, intermolecular-force, and elemental-analysis atoms cover the source routine. |

Decision:

- no new canonical Chemistry atom is justified by the remaining residue
- no jurisdiction applicability should be broadened from these broad cluster mappings alone
- reopen only if exact remapping later exposes a repeated missing assessable routine across multiple states

## P5 Candidate Selection

Promote to `P5` broad state coverage:

- `DE-MV`
- `DE-RP`
- `DE-SL`
- `DE-SN`
- `DE-ST`
- `DE-TH`

Rationale:

- each lane has registered lower-secondary and upper-secondary Chemistry source material
- each lane has clean source-backed projection coverage
- the F4 horizontal topic pass found no shared canonical atom gap blocking broad coverage status
- remaining broad mappings are accepted as package evidence rather than atom debt

Hold at `P4`:

- `DE-BB` and `DE-BE`: current lane is upper-secondary only; add lower-secondary source material before broadening
- `DE-HB`: current lane is lower-secondary only; add upper-secondary Chemistry source material before broadening

Existing `P5` / `P6` lanes remain unchanged:

- `P6`: `DE-BY`, `DE-HE`
- `P5`: `DE-BW`, `DE-HH`, `DE-NI`, `DE-NW`, `DE-SH`

## Closure Decision

F4 is complete. The Chemistry graph has no proven shared canonical atom gap from the all-state broad-residue audit.

Next operational lane:

- keep full two-stage P5 states on maintenance
- complete the missing-stage source lanes for `DE-BB`, `DE-BE`, and `DE-HB` before broadening those states
- consider `P6` cutover readiness only after runtime, composition-view, and legacy migration checks

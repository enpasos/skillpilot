# NRW Mathematics Structure Note

State: `2026-03-20`

This note records the first source-snapshot scope for the mathematics-first DE expansion track in Nordrhein-Westfalen.

Source files:

- Sek I PDF: `curricula/DE/Gymnasium/input/NW/lower-secondary/g9_m_klp_3401_2019_06_23_0.pdf`
- Sek II PDF: `curricula/DE/Gymnasium/input/NW/upper-secondary/gost_klp_m_2023_06_07.pdf`

Initial source snapshots:

- Sek I: `curricula/DE/Gymnasium/input/NW/lower-secondary/source-json/DE_NRW_S_GYM_1_MATHEMATIK.de.json.snapshot`
- Sek II: `curricula/DE/Gymnasium/input/NW/upper-secondary/source-json/DE_NRW_S_GYM_2_MATHEMATIK.de.json.snapshot`

Current import boundary:

- the archived NRW source snapshots are intentionally partial pilot subsets, not full subject imports
- the upper-secondary snapshot still covers only the first shared analysis spine that is likely to matter for cross-state canonical mathematics onboarding
- the upper-secondary snapshot now also carries one in-place source split inside the imported E-phase derivative corridor: the old broad derivative/monotonicity atom is retained as a corridor cluster with separate point-derivative and monotonicity/derivative-function child atoms
- the upper-secondary snapshot now also carries the explicit E-phase tangent/normal-steigung clause from `2.3` as a separate archived source atom inside that same retained derivative corridor
- the upper-secondary snapshot now also carries the first explicit E-phase differential-calculus follow-on atoms beyond that split corridor: derivative rules, extrema criteria, and second-derivative curvature / Wendepunkt work
- the upper-secondary snapshot now also carries the first explicit Q-phase Grundkurs extremal-problem atom from `2.4.1`
- the upper-secondary snapshot now also carries a retained Q-phase integral split: the broad productsum/area/bestand atom is kept as a corridor cluster and now has a separate child for the productsum-and-area interpretation slice
- the upper-secondary snapshot now also carries a dedicated Q-phase Hauptsatz/Stammfunktions atom inside the same imported integral corridor
- the upper-secondary snapshot now also carries a dedicated Q-phase definite-integral area atom inside that same imported integral corridor
- the upper-secondary snapshot now also carries a dedicated Q-phase interval-additivity/linearity atom inside that same imported integral corridor
- the upper-secondary snapshot now also carries the remaining introductory integral pair from the same corridor: a dedicated area-function atom and a dedicated transition-from-productsum-to-integral atom
- the upper-secondary snapshot now also carries a retained three-way source split inside the imported exponential corridor: `a^x`-properties, the special role of `e^x`, and growth/decay usage
- the upper-secondary snapshot now also carries the first explicit NRW LK inverse-function / logarithm clause from `2.4.2`
- the upper-secondary snapshot now also carries the explicit NRW LK inverse-graph clause from `2.4.2`
- the upper-secondary snapshot now also carries a retained two-way source split inside the broad E-phase polynomial clause: a separate power-function child and a separate polynomial-description child
- the lower-secondary snapshot now includes both the prerequisite strip and the first exact shared lower-secondary function-onboarding surface

Segmentation chosen for the first import:

- Sek I:
  - `2.3 Arithmetik/Algebra` (erste Variablen- und Termvorstellungen)
  - `2.3 Funktionen` (Zusammenhang zwischen Groessen, Dreisatz)
  - `2.4.1 Arithmetik/Algebra` (rationale Zahlen, Terme, Gleichungen)
  - `2.4.1 Funktionen` (proportionale / lineare Funktionen)
  - `2.4.2 Funktionen` (quadratische / exponentielle / sinusfoermige Funktionen)
- Sek II:
  - `2.3 Funktionen und Analysis` (Einfuehrungsphase)
  - `2.3 Analytische Geometrie und Lineare Algebra` (Einstiegskorridor zu Vektoren und Geraden im Raum)
  - `2.4.1 Funktionen und Analysis` (Grundkurs)
  - `2.4.2 Funktionen und Analysis` (Leistungskurs)

Operational interpretation:

- the first NRW canonical mapping work should start from these source goal IDs, not directly from the PDFs
- the first exact NRW canonical bridges now already cover shared motivation, arithmetic prerequisites, mapping analysis, and the first shared function-concept atom
- for upper-secondary analysis, the next NRW work should treat the new retained E-phase power/polynomial split as the active source decision and only widen the power-function child if it clearly earns a shared late-Sek-I bridge
- the upper-secondary NRW lane now also reaches the retained Q-phase exponential parent through a reviewed bridge on the shared canonical exponential-functions cluster; the next upper-secondary NRW move should therefore treat the retained E-phase power/polynomial split as the cleaner remaining source decision unless another equally explicit NRW source corridor is imported
- the upper-secondary NRW lane now also reaches the retained E-phase power/polynomial split through a reviewed bridge on the shared canonical `Funktionen und ihre Darstellung` cluster, and it now additionally opens the first explicit `2.3 Analytische Geometrie und Lineare Algebra` entry corridor on the shared upper-secondary space/vector, line-representation, line-relation, and geometric-LGS anchors; further NRW upper-secondary widening should therefore come from a similarly explicit NRW follow-on such as the Q-phase geometry / linear-algebra continuation or another equally explicit imported corridor rather than from renewed parent cleanup inside the already reviewed pilot subset
- for lower-secondary functions, the NRW lane now also reaches the retained `2.4.2` Stage-2 umbrella through a reviewed mixed parent bridge on the shared canonical J10 anchor: together with the already active Stage-2 atom bridges for function-class distinction, parameter effects from graphs, and growth-model use, the current NRW functions snapshot is now anchored at both Stage-1 and Stage-2 parent level, so the next NRW lower-secondary move should import another equally explicit corridor rather than reopening the reviewed umbrella cleanup
- the lower-secondary NRW lane now also reaches the explicit Stage-1 algebra prerequisite strip on shared canonical variables/terms, term-evaluation, fraction-term, and broad Sek-I algebra goals; with that bridge set in place, the remaining unmapped NRW Sek-I goals inside the current snapshot are structural parents rather than explicit atomic residues, so the next NRW move should import another equally explicit corridor instead of reopening structural parent cleanup
- later NRW broadening should extend these same landscape IDs in place instead of creating replacement pilot landscape IDs

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
  - `2.4.1 Funktionen und Analysis` (Grundkurs)
  - `2.4.2 Funktionen und Analysis` (Leistungskurs)

Operational interpretation:

- the first NRW canonical mapping work should start from these source goal IDs, not directly from the PDFs
- the first exact NRW canonical bridges now already cover shared motivation, arithmetic prerequisites, mapping analysis, and the first shared function-concept atom
- for upper-secondary analysis, the next NRW work should stay on the already imported Grundkurs surface and test the integral/bestands atom before widening broader parameter or exponential atoms
- for lower-secondary functions, the next NRW work should stay inside the imported `2.4.1 Funktionen` slice and review the value-, graph-, and parameter-follow-on atoms before broadening the snapshot elsewhere
- later NRW broadening should extend these same landscape IDs in place instead of creating replacement pilot landscape IDs

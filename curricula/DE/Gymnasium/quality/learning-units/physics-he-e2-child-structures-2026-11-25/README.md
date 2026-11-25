# Six child structures in the Hessian section E.2

Section "E.2 Newton'sche Axiome und Erhaltungssätze" of the eight Hessian Physics views with an
Einführungsphase, regrouped on 25 November 2026. The Product Owner accepted the cut on
24 November 2026 ("three axioms, one interplay of forces, two conservation laws").

## What changed

| # | Child structure | Goals |
|---|---|---|
| 1 | Trägheit: Was ohne Kraft geschieht | Newton's first axiom, applying it, inertial frames |
| 2 | Kraft, Masse und Beschleunigung | Newton's second axiom, applying the basic equation |
| 3 | Kraft und Gegenkraft | Newton's third axiom, applying it |
| 4 | Mehrere Kräfte zugleich: schiefe Ebene, Reibung, Bremsen | friction forces, road traffic |
| 5 | Energie bleibt erhalten | work, kinetic energy, potential energy, mechanical energy, conservation of energy, friction energy |
| 6 | Impuls und Stöße | conservation of momentum, impulse, elastic and inelastic collisions, simple collisions, crumple zone; at the end collisions in the centre-of-mass frame and the Leistungskurs derivation of momentum conservation |

- The three gravitation goals moved to "E.5 Gravitation", together with the Leistungskurs energy
  goal that needs the potential.
- The four mixed E.2 exams stay at E.2 level after the child structures.
- The canonical group "Erhaltungssätze" is opened in these views. A Leistungskurs goal that is no
  target of a Grundkurs view keeps its explicit support reference at E.2 level.

The structures are view structures, as the E.1 children were before their opening goals: no
declared learning units, no unit material, no assessment contract.

## Measured against the base commit

`regrouping.actual.json`, built from the files:

- Eight views changed; the other 82 Physics views are byte-identical.
- In every changed view the atomic targets, the prerequisite-only goals and the learning set (with
  all prerequisites of every subject) are identical to the base.
- Goals changed their place only as named: 22 goals (23 in the Leistungskurs views) into a child
  structure, four from E.2 to E.5.
- The declared order between the six structures is the demand between their goals: each of the
  six order pairs has a direct `requires` edge as witness, and no chain points from an earlier
  structure to a later one.
- All Mathematics demand rows are unchanged; six pinned hashes of Hessian Physics source views
  are renewed.

## Not part of this step

- The two Leistungskurs deepenings stay in the Einführungsphase. The accepted cut moves them to
  the Qualifikationsphase; the Leistungskurs exam of E.5 requires both, so that move belongs to
  the E.5 review.
- "Elastische Stöße im Schwerpunktsystem analysieren" stays until the mixed exams that require it
  have successors.
- New goals (force decomposition on the incline, force balance, friction from the normal force,
  momentum of two bodies), the narrower text of Newton's second axiom and the lower-stage goal
  "Kräfte zusammensetzen" as a prerequisite of child 4.
- Closing checks per child, opening goals and unit material.

## Checks that bind this state

`scripts/test_generate_hessen_physics_stage_views.py`
(`test_e2_groups_its_content_into_six_child_structures_in_learning_order`): the six structures,
their members and labels, the exams at E.2 level, the gravitation goals in E.5 and the derived
order, for all eight views.

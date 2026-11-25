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
- Target goals changed their place only as named: 22 goals (23 in the Leistungskurs views) into a
  child structure, four from E.2 to E.5.
- Explicit learning places of prerequisite-only goals followed the goals that need them: nine
  goals, 30 moves over the eight views (table below). The first version of this record did not
  list them; the independent review found them.
- The declared order between the six structures is the demand between their goals: each of the
  six order pairs has a direct `requires` edge as witness, and no chain points from an earlier
  structure to a later one.
- All Mathematics demand rows are unchanged; six pinned hashes of Hessian Physics source views
  are renewed.

## Learning places of prerequisites that moved

The generator places a prerequisite-only goal with an explicit learning place where its demand in
the phase lies. With the four goals in E.5 and the child structures in E.2, these places moved.
Roles, learning sets and all Mathematics demand rows are unchanged.

| Views | Goals | From | To |
|---|---|---|---|
| the four Leistungskurs views | six Mathematics preparations: "Punkte im räumlichen Koordinatensystem als Tupel angeben und deuten", "Punkte und Vektoren im Raum koordinatisieren", "Vektoren als Orts-, Richtungs- und Verschiebungsvektoren im Raum beschreiben", "Betrag eines Vektors im Raum bestimmen", "Skalarprodukt von Vektoren definieren", "Kettenregel beim Ableiten anwenden (LK)" | the common preparation area of the Einführungsphase | E.5 Gravitation |
| the two views of Sek II only | "Kräfte und Trägheit qualitativ erklären" | E.2 | child structure "Trägheit" |
| the two views of Sek II only | "Mechanische Energieformen qualitativ unterscheiden" | E.2 | child structure "Energie bleibt erhalten" |
| the two views of Sek II only | "Masse und Gewichtskraft unterscheiden" | E.2 | E.5 Gravitation |

The three Grundkurs views across both stages have no such move. For the six Mathematics
preparations nothing that stays in E.2 needs them; in the Einführungsphase their demand lies in
E.5 only (the Leistungskurs energy goal and the E.5 exams). They are therefore placed later than
before, directly where they are used. `regrouping.actual.json` lists every move per view under
`preparationPlaces`.

## What a learner with stored state sees

- A plan stored for E.2 before the cut stays current and offers the goals that moved to E.5
  (pull request #198). In the Sek II views the section held 32 goals before the cut; a new
  selection holds 28 in the Grundkurs and 27 in the Leistungskurs.
- A goal in progress among the moved goals stays in progress under a focus on E.2 (pull request
  #199, on which this branch is stacked).
- The learner map and the Cockpit show ten rows under E.2: the six child structures and the four
  mixed exams. Cards of the moved goals are practised with E.5.

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

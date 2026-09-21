# Physik Libre mapping review — mechanics/methods lane

Reviewed 2026-09-21 against the local live-page snapshot and all current authoritative `curricularAtomic` physics goal titles, then the full descriptions of the relevant goals. This lane covers provider chapters 2–7, relevant mechanics experiments in A, and simulation chapters C. Final draft: **62 article references supporting 83 distinct goals**, including the four existing pilot references with retained IDs and renewed review dates.

No curriculum data, learner state, publication record, or M7 evidence was changed. These are independent AI-reviewed link suggestions, not full goal coverage, whole-provider quality approval, human source review, or proof of mastery. Actual target anchors and cited section headings were checked against the snapshot.

## Covered subjects

- Empirical testing, distinguishing observation/model, SI calculations, balance-based mass comparison and mass versus weight.
- Video calibration; qualitative and connected movement graphs; uniform movement; accelerated graphs and ideal falling; model selection; sports examples and stopping distances.
- Inertia through Galilei's thought experiment; resultant force and constant-mass Newton II; Newton III; graphical forces, line of action, spring-force diagrams.
- Reference systems, velocity superposition, horizontal/oblique projectiles, angular speed, centripetal-force role, static-friction cornering, rotating-frame forces.
- Mechanical work, ideal machines, forms of mechanical energy, kinetic and potential energy, energy/system balance, dissipative conversion, power.
- Vector momentum conservation, impulse and collision safety, elastic/plastic one-dimensional collisions, derivation of momentum conservation.
- Spreadsheet construction and Euler time stepping, deterministic chaos.
- Gravitation, field strength, potential, Kepler laws/area theorem, circular-orbit mass inference, solar-mass inference and Newton's explanation of Kepler's observations, historic models and apparent planetary loops, tides.
- Torque, rotational energy/inertia, rotational acceleration, angular momentum, pirouettes, precession and free gyroscopes.

## Deliberately not linked: concrete source defects

The following headings are not safe substitutes for the corresponding competence. A working URL alone is not enough.

- `measurement.html#measurement-uncertainty-notation` (2.5.3) equates `10.50 ± 0.01` with `10.5(1)`, which expresses a different uncertainty.
- `measurement.html#significant-figures-notation` (2.5.4) treats displayed significant digits as a universal uncertainty declaration; this does not support the goal of reporting meaningful precision from supplied uncertainties.
- `measurement.html#measurement-uncertainty-interpretation` (2.5.12) gives the standard error of the mean the predictive interpretation for the next measurement. This is not merely incomplete coverage.
- Consequently no mapping was created for goals `8aff7aac-321b-5172-ac55-877876bfd2cd`, `f6b1d812-ce8b-5852-b417-e6c29b533c7a`, `b615830a-e8b0-5754-81e0-99da98343a8d`, `f23fdfa9-38b6-5157-8301-ed302476c456`, `75b9ca4c-178e-5df2-adc4-f7f78e9d28e5`, or `72effc66-87f4-5f5e-8d36-1547677365fb`. Some individual earlier paragraphs/formulas are useful, but the immediate teaching sequence introduces misconceptions central to these goals. This conservative exclusion is not a claim that the entire provider is unsuitable.
- `fictitious-force.html#unaccelerated-frames` / 4.10.1 treats a dropped object's gravitational acceleration as a test against a Newtonian inertial frame. Use the reviewed `relative-motion` and `rotating-frame-of-reference` sections instead.
- `momentum-and-impuls.html#newtons-second-law-exact` (5.5.4) applies `F = Δp/Δt` directly to a rocket with variable mass without an open-system momentum-flux balance. The new Newton-II reference deliberately supports only the correct constant-mass part in 4.2.4.
- `collisions-1d.html#elastic-collision-demo-exercise` (5.6.7) swaps/inconsistently evaluates numerical momentum and energy checks. The elastic-collision material therefore jumps directly to the later algebraic derivation (5.6.8), whose conservation equations and resulting formulas were checked, and does not cite the defective worked example.
- `friction.html` begins by saying friction disappears when motion stops and identifies opposing the body's motion instead of opposing relative contact motion; these are central pitfalls of goals `581c0766-b84b-54cb-b8b6-375310329a41` and `5fd45dbc-0eb1-591b-99a9-7386336f1456`. No broad friction mapping is activated. Likewise no friction-model mapping for `30ddb2d7-b991-55fe-9e74-37ffe1048f9f` is inferred solely from the worked sliding example.
- `spreadsheet-simulation.html#spreadsheet-leapfrog` (C.2.7) changes the initial half-step velocity while retaining formulas using the next velocity row for the displacement, which does not clearly implement the stated centered method. C.2.8 also prints the cross-sectional area as `2πr²` but evaluates `πr²`. Only the earlier clean spreadsheet-building sections C.2.1–6 and the separate Euler explanation are linked. The actual air-drag goal can instead be supported by a suitable fluid-dynamics section, subject to that lane's review.
- `solar-system.html#moons` says every planet other than Earth has multiple moons (false for Mercury and Venus); the planetary section also gives a rounded AU as an exact definition and collapses planet types. No broad solar-system classification, astronomical-unit definition or whole-chapter overview is linked on this evidence. The separately reviewed gravitation/tides sections remain useful.

## Meaningful content gaps / no invented fit

No direct link in this lane for the following more specific goals merely because a broader related heading exists:

- `264dc31c-ec92-5e39-a8b8-16f1d74366d4`: full linearisations and parameter interpretation. A matching photoelectric-data section may be reviewed in the quantum lane.
- `691c11d0-fa6a-5d2e-a19c-086e89c3c233`: structured digital-sensor acquisition. The smartphone accelerometer explanation alone is not an acquisition workflow.
- `d30fd37b-1f05-44e3-a40a-4c5a88fa28c2`: elastic collisions specifically in the centre-of-mass frame and transformation back. The provider derives the laboratory-frame formulas instead.
- `e359f8bb-6106-44aa-9edf-694528d2d2a9`: deriving energy conservation from Newton II and a conservative force. Naming conservation does not supply that derivation.
- `89cadf81-143b-5f6b-82bd-29ba20d92a1b`: Kepler III specifically from a scaling argument for geometrically similar orbits. A circular-orbit force calculation is a different derivation.
- `d3c153b9-e09b-5668-8386-73105546a7c1` and `ad62f563-4fee-5399-8d9c-03a214658aa9`: generic experimental planning/reporting. History of Galileo's experiment is not a direct general lab/protocol guide.
- Astronomical observing workflows, star-chart navigation, time/location visibility, direct radius/rotation measurements of the Sun, and full optical-binary total-mass inference. None is supported simply by the solar-system list or test-particle Kepler formula.
- `5cf160e5-e0c2-5552-b2cf-0f04871c5e7e`, `982df2f3-e040-5f4b-b668-0fe05d994b29`, `af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93`: unit-history and solar-system classification need reliable details absent from the reviewed solar-system passage.
- `2014791b-af68-58d0-838b-fc9701202096`: the barycentre explanation by itself does not provide the required calibrated binary-orbit total-mass inference.

## Bounded support and small source-language issues

The package review rationale of every material names the supported aspect and any limit. In particular, the constant-mass Newton-II link does not claim the general momentum equation, the numerical-method link still requires a friction model, precession of a bicycle wheel does not explain all bicycle stability, and the circular-orbit mass relation does not silently cover arbitrary galaxies or comparable-mass binaries.

For a few otherwise usable sections the rationale records a local terminology/wording defect (horizontal projectile prose says vertical once despite correct equations; inertia text says torque twice; rotational equation introductory text calls Newton II the inertia law). They are not copied into curriculum content. Parent review may choose the stricter alternative of withholding these particular links.

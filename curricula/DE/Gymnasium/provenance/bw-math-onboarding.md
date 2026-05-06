# BW Math Onboarding Note

This note records the first Baden-Wuerttemberg source-landscape identifiers for the mathematics-first DE expansion track and their activation state.

Reserved source landscapes on `2026-03-21`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `6232b783-199c-4c50-92f2-9fb31277e619`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`Kursstufe`):
  - `sourceLandscapeId`: `fa8f864a-aac5-486d-8e77-40df2af038a3`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_math_upper_secondary_to_canonical_math.json`

Activation state:

- the official Baden-Wuerttemberg Gymnasium mathematics source PDF is now archived locally at:
  - `curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_M.pdf`
- the lower-secondary and upper-secondary provenance notes now point at that shared archived PDF
- the lower-secondary `sourceLandscapeId` is now active in `source-landscape-registry.json`
- the lower-secondary lane now contributes all 120 archived source snapshot goals to `source-goal-membership-registry.json`
- the lower-secondary lane now contributes atomic closures for all 120 source snapshot goals, covering all 88 source atomics, to `source-goal-closure-registry.json`
- the broad Klassen-5/6 source row for adding and subtracting natural and integer numbers is now retained as a parent corridor and split into two archived child leaves:
  - both child leaves map `exact` to the shared canonical addition and subtraction atoms
- the broad Klassen-7/8 Wurzel source row is now retained as a parent corridor and split into four archived child leaves:
  - three child leaves map `exact` to the shared canonical square-root, irrational/reelle-Zahlen, and iterative-approximation atoms
  - the simple-Wurzelterm child remains a deliberate `partial` bridge because the canonical target is narrower around fully radicable expressions and Betragsbehandlung
- the broad Klassen-7/8 Darstellungswechsel source row is now retained as a parent corridor and split into five archived child leaves:
  - four child leaves map `exact` to graph-from-term/equation, graph-to-term/equation, equation-from-graph, and table/graph/term switching atoms
  - the situationsgerechtes-Begruenden child remains a deliberate `partial` bridge because the source row says situationsgerecht wechseln, but the canonical atom adds explicit justification and checking
- the broad Klassen-7/8 Prozent/Zins/Gleichungs source row is now retained as a parent corridor and split into three archived child leaves:
  - the Prozentgrundaufgaben and lineare-Gleichungen child leaves map `exact` to shared canonical atoms
  - the Zinsrechnung child remains a deliberate `partial` bridge because the BW source row names Zinseszins while the canonical target is explicitly the simple interest context
- the broad Klassen-7/8 Zufall/Laplace/Baumdiagramm source row is now retained as a parent corridor and split into two archived child leaves:
  - both child leaves map `exact` to the shared canonical Laplace-experiment and Baumdiagramm/Pfadregel atoms
- the broad Klassen-5/6 source row for simple functional representations is now retained as a parent corridor and split into three archived child leaves:
  - two child leaves map `exact` to table creation and simple-assignment analysis atoms
  - the verbal/tabular/iconic/graphical switching child remains a deliberate `partial` bridge because the canonical atom uses table/graph/term switching while the BW source row names no term representation at this level
- the first active Baden-Wuerttemberg lower-secondary source snapshot now lives at:
  - `curricula/DE/Gymnasium/input/BW/lower-secondary/source-json/DE_BAW_S_GYM_1_MATHEMATIK.de.json.snapshot`
- the imported lower-secondary source snapshot currently covers:
  - the curriculum-wide orientation layer from `1.1 Bildungswert des Faches Mathematik`
  - `Klassen 5/6`: Zahl - Variable - Operation, Messen, Raum und Form, Daten und Zufall, and the first functional-correlation corridor
  - `Klassen 7/8`: algebraic terms, geometry, data and chance, and linear/functional representations
  - `Klassen 9/10`: trigonometry, circle/solid geometry, powers and functions, exponential/trigonometric/differential-function links, conditional probability, binomial distributions, coordinate geometry, and vectors
- the upper-secondary `sourceLandscapeId` is now active in `source-landscape-registry.json`
- the upper-secondary lane now contributes its first archived source goal memberships to `source-goal-membership-registry.json`
- the upper-secondary lane now contributes its first archived atomic closures to `source-goal-closure-registry.json`
- the first active Baden-Wuerttemberg upper-secondary source snapshot now lives at:
  - `curricula/DE/Gymnasium/input/BW/upper-secondary/source-json/DE_BAW_S_GYM_2_MATHEMATIK.de.json.snapshot`
- the imported upper-secondary pilot subset currently covers:
  - the first reviewed upper-secondary stochastics parent corridor is now fully connected: the broad BW course-stage stochastics corridor sits on the shared Sek-II stochastics summary surface, the Basisfach normal-distribution/random-variable parent sits on the shared probability/distribution surface, and the Leistungsfach test/normal-distribution hybrid parent stays on the reviewed summary surface
  - the shared orientation layer from `1.4 Basisfach und Leistungsfach in der Oberstufe`
  - `3.5.4 Leitidee Funktionaler Zusammenhang` in `Basisfach`
  - `3.4.4 Leitidee Funktionaler Zusammenhang` in `Leistungsfach`

- the first reviewed upper-secondary Gauss / linear-system parent corridor is now fully connected: the broad BW course-stage Gauss corridor plus the Basisfach and Leistungsfach parent strips now sit on the shared Sek-II space/matrix-model surface

- the first reviewed upper-secondary geometry / space parent corridor is now fully connected: the broad BW course-stage geometry corridor plus the Basisfach / Leistungsfach parent strips and the two application parents now sit on the shared Sek-II space/matrix-model surface

- the first reviewed upper-secondary integral-application parent corridor is now fully connected: the broad BW course-stage integral-application corridor plus the Basisfach and Leistungsfach parent strips now sit on the shared Sek-II integral / late-analysis surfaces

- the remaining reviewed upper-secondary analysis parent residue is now fully connected: the broad first and second BW analysis course-stage corridors plus the linked Basisfach / Leistungsfach parent strips and the retained natural-exponential / integral split leaves now sit on the shared Sek-II analysis, exponential, integral, and late-analysis surfaces

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while the first Baden-Wuerttemberg mathematics source snapshots are prepared
- activate the shared provenance registries only after real archived source-landscape JSON snapshots with stable source goal IDs exist
- prefer the active BW widening only on still-unmapped upper-secondary source parents or on intentionally imported retained non-core sections
- keep the lower-secondary pilot subset stable except for retained source splits that turn broad archived rows into honest child evidence
- keep BW stable as a broad reviewed comparison lane; widen it only if an intentionally imported retained non-core BW source slice or a reviewed retained split is added later

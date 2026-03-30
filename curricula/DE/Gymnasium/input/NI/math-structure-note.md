# Niedersachsen Mathematics Structure Note

State: `2026-03-25`

This note records the first source-snapshot scope for the mathematics-first DE expansion track in Niedersachsen.

Source files:

- Sek I PDF: `curricula/DE/Gymnasium/input/NI/lower-secondary/ma_gym_si_kc_druck.pdf`
- Sek II PDF: `curricula/DE/Gymnasium/input/NI/upper-secondary/ma_go_kc_druck_2019.pdf`

Initial source snapshots:

- Sek I: `curricula/DE/Gymnasium/input/NI/lower-secondary/source-json/DE_NDS_S_GYM_1_MATHEMATIK.de.json.snapshot`
- Sek II: `curricula/DE/Gymnasium/input/NI/upper-secondary/source-json/DE_NDS_S_GYM_2_MATHEMATIK.de.json.snapshot`

Current import boundary:

- the archived Niedersachsen source snapshot is intentionally a partial pilot subset, not a full subject import
- the first active snapshot focuses on the shared lower-secondary functions corridor that is most likely to matter for cross-state canonical mathematics onboarding and now also includes the first fully imported adjacent algebra and measurement follow-ons
- the imported Sek-I slice currently covers:
  - the curriculum-wide motivation layer for `Funktionaler Zusammenhang`
  - `Proportionale und antiproportionale Zusammenhaenge`
  - `Prozent- und Zinsrechnung mithilfe des Dreisatzes`
  - `Lineare Zusammenhaenge`
  - `Lineare Gleichungen und lineare Gleichungssysteme`
  - the first fully imported strip of `Elementare Termumformungen`:
    - einfache Termumformungen
    - Summen multiplizieren / binomische Formeln
    - einfache lineare Gleichungen
    - einfache Verhaeltnisgleichungen
  - the first fully imported strip of `Laengen, Flaechen- und Rauminhalte und deren Terme`:
    - Umfang und Flaecheninhalt von Dreieck, Parallelogramm und Trapez vergleichen, schaetzen und berechnen
    - Flaechenformeln fuer Dreieck, Parallelogramm und Trapez begruenden, anwenden und interpretieren
    - Oberflaechen- und Rauminhalte von Prismen vergleichen, schaetzen, berechnen und Formeln begruenden
    - Schraegbilder und Netze vergleichen, interpretieren und zwischen Darstellungen wechseln
  - the first explicit later-Sek-I geometry/trigonometry follow-on `Entdeckungen an rechtwinkligen Dreiecken und Aehnlichkeit`:
    - Aehnlichkeit in Dreiecken beschreiben und fuer Streckenberechnungen nutzen
    - Satzgruppe des Pythagoras begruenden und anwenden
    - mit Wurzeln zur Streckenberechnung umgehen
    - trigonometrische Beziehungen am rechtwinkligen Dreieck identifizieren und nutzen
    - Berechnungen an allgemeinen Dreiecken mit Sinus- und Kosinussatz
    - the Pythagoras and right-triangle trigonometry atoms now map exactly, and the similarity, root-based length-calculation, plus general-triangle calculation atoms now hang as reviewed partial bridges on the shared canonical similarity, square-root-basics, and sine/cosine-law goals
  - the adjacent explicit later-Sek-I quadratics follow-on `Quadratische Zusammenhaenge`:
    - quadratische Funktionen ueber Parameter, Darstellungsformen und Parabelskizzen untersuchen
    - quadratische Gleichungen mit Graphbezug und passenden Verfahren loesen
    - quadratische Zusammenhaenge modellieren sowie Optimierungs- und Ausgleichsprobleme bearbeiten
    - Parabeln als Ortslinien beschreiben und erzeugen
    - the first three atoms now hang as reviewed partial bridges on the shared canonical lower-secondary quadratics goals, and the parabola-as-locus atom now maps exactly to a dedicated canonical lower-secondary atom
- the imported Sek-II slice now covers the first shared upper-secondary surface in the Einfuehrungsphase, the first fully imported gA learning areas in der Qualifikationsphase, and now also the first five fully imported eA learning-area follow-ons:
  - the phase-wide orientation layer for the gemeinsame Basis der Qualifikationsphase
  - `Elementare Funktionenlehre`
  - `Ableitungen`
  - a retained split of the downstream AB3 usage clauses into tangent / normal equations, monotonicity / extrema, Wendestellen, and optimization use
  - the first fully imported `Von der Aenderung zum Bestand - Integralrechnung` surface around reconstructed stocks, product sums, geometric intuition for the Hauptsatz, definite integrals in context, antiderivatives in simple cases, and areas between graphs
  - the first fully imported `Die e-Funktion` surface around proportional growth speed, characterising the base `e`, using derivatives of `e^x` and `a^x`, linked functions and linear compositions, product and chain rule with linear inner function, parameter fitting, exponential equations, and asymptotic limited growth
  - the first fully imported `Raumanschauung und Koordinatisierung` surface around tuples for points and vectors, coordinate-based spatial descriptions, vector operations, collinearity, parametric line and plane forms, point distances, scalar product, orthogonality, line angles, and line relations/intersections
  - the first fully imported `Daten und Zufall` surface around conditional probabilities, stochastic independence, discrete random variables, expectation / variance / standard deviation, fair games, binomial modelling, prediction intervals, first sample-compatibility checks, and simulations
  - the first fully imported eA `Von der Aenderung zum Bestand - Integralrechnung` surface around integral functions, the distinction between integral and antiderivative functions, extended antiderivative work including ln as an antiderivative, and the first LK-style deepenings on solids of revolution and improper integrals
  - the first fully imported eA `Wachstumsmodelle - Exponentialfunktion` surface around bounded and logistic growth, model comparison, asymptotic behaviour in context, first-order differential equations as growth models, characterising the base e, using derivatives of e^x and a^x, linked functions with polynomials, product and chain rule, exponential equations, parameter fitting, and solution checks by substitution
  - the first fully imported eA `Raumanschauung und Koordinatisierung` surface around points and vectors in space, pictorial representation, vector operations, collinearity, matrix-based projections for Schraegbilder, line and plane representations, changes between representations, distances, scalar product, orthogonality, angles, positional relations, spatial intersection problems, and the Gauss algorithm
  - the first fully imported eA `Kurvenanpassung und Funktionenscharen` surface around classifying functions by global properties, fitting suitable function terms to data, translating local graph properties into term conditions, continuity and differentiability in piecewise-defined functions, and parameter-dependent comparison and variation of function families
  - the first fully imported eA `Daten und Zufall` surface around conditional probabilities, stochastic independence, critical reading of causal vs. stochastic claims, discrete random variables, expectation / variance / standard deviation, fair games, binomial modelling, prediction intervals, first sample-compatibility and confidence-interval work, normal distributions, normal approximation, sigma-neighbourhoods, and simulations

Operational interpretation:

- the first Niedersachsen canonical mapping work should start from these source goal IDs, not directly from the PDFs
- the active reviewed Niedersachsen bridges now cover every atomic goal inside the archived Sek-I and Sek-II pilot snapshots
- the first reviewed Niedersachsen bridges started inside the imported Sek-I functions corridor and the imported Sek-II derivative-entry corridor, and the next lower-secondary widening now also opens the explicit right-triangle / similarity follow-on with exact canonical bridges for Pythagoras and right-triangle trigonometry while broader similarity / root / general-triangle residues initially stayed visible in source
- the right-triangle / similarity follow-on now also carries reviewed partial provenance bridges for triangle similarity, root-based square-root basics, and general-triangle sine/cosine-law work, so this opened NI strip is now closed at explicit source-residue level
- the adjacent quadratics follow-on now also carries reviewed partial provenance bridges for quadratic-function, quadratic-equation, and quadratic-modelling work plus a dedicated exact parabola-as-locus bridge, so this opened NI strip is now closed at explicit source-residue level
- inside the imported Sek-II `Die e-Funktion` strip, the explicit gA atom `Die Basis e durch die Eigenschaft (e^x)' = e^x charakterisieren` now also exact-resolves on the shared canonical natural-exponential-specialness leaf instead of remaining on a reviewed partial bridge
- inside the imported Sek-II `Die e-Funktion` strip, the explicit gA atom `Ableitungen von e^x und a^x verwenden` now also exact-resolves on a shared dedicated canonical derivative-use leaf instead of remaining on a reviewed partial bridge
- inside the imported Sek-II `Die e-Funktion` strip, the explicit gA atom `Asymptotisches Verhalten begrenzten Wachstums beschreiben` now also exact-resolves on a shared dedicated bounded-growth-asymptotics leaf instead of remaining on a reviewed partial bridge
- inside the imported Sek-II `Wachstumsmodelle - Exponentialfunktion` strip, the explicit eA atom `Die Basis e durch (e^x)' = e^x charakterisieren` now also exact-resolves on that same shared canonical natural-exponential-specialness leaf instead of remaining on a reviewed partial bridge
- inside the imported Sek-II `Wachstumsmodelle - Exponentialfunktion` strip, the explicit eA atom `Ableitungsfunktionen von e^x und a^x verwenden` now also exact-resolves on that same shared dedicated canonical derivative-use leaf instead of remaining on a reviewed partial bridge
- inside the imported Sek-II `Wachstumsmodelle - Exponentialfunktion` strip, the explicit eA atom `Asymptotisches Verhalten von Wachstumsmodellen im Sachzusammenhang beschreiben` now also exact-resolves on a shared dedicated context-asymptotics leaf instead of remaining on a reviewed partial bridge
- inside the imported Sek-II `Wachstumsmodelle - Exponentialfunktion` strip, the explicit eA atom `Verschiedene Wachstumsmodelle vergleichen` now also exact-resolves on a shared dedicated growth-model-comparison leaf instead of remaining on the broader growth/decay-modelling surface
- inside the imported Sek-II `Die e-Funktion` strip, the explicit gA atom `Exponentialgleichungen loesen` now also exact-resolves on the shared canonical exponential-equation leaf instead of remaining on a reviewed partial bridge
- inside the imported Sek-II surface, retained source splits are preferable to stacking repeated broad partial bridges from the same AB3 clause, including second-stage splits when a first retained child is still too broad for the next canonical follow-on
- later Niedersachsen broadening should extend these same landscape IDs in place instead of creating replacement pilot landscapes
- with `Daten und Zufall` (eA), the first shared general-Gymnasium upper-secondary Niedersachsen source surface imported from the active PDF is exhausted; further Niedersachsen widening should therefore now wait for the next clean lower-secondary source corridor or a separate Berufliches-Gymnasium lane instead of forcing broader partial bridges from the already closed explicit strips

# Optional narrow interval assessment — not inserted, not released

Scope: HE Sek II LK; target candidate f2538793-8b0a-5c3b-b216-5d329a4e87bd only. This is not evidence that the existing generic Q4 capstone already assesses integration. Requires a later explicit authoring/application decision, native assessment checks and source-/view-specific placement. No canonical ID or released status is assigned here.

## Task (DE)

Ein Elektron wird im Grundzustand eines eindimensionalen Potenzialtopfs der Breite L mit unendlich hohen Wänden betrachtet. Gegeben ist die auf [0,L] normierte Funktion ψ₁(x)=√(2/L) sin(πx/L); außerhalb des Topfs ist sie null. Nutzen Sie bei Bedarf sin²(u)=(1−cos(2u))/2.

1. Stellen Sie das Integral für P(L/4≤x≤3L/4) auf und berechnen Sie dessen Wert. (5 BE)
2. Vergleichen Sie das Ergebnis mit P(0≤x≤L/2)=1/2. Erklären Sie trotz gleicher Intervallbreite den Unterschied anhand der Wahrscheinlichkeitsdichte. (3 BE)
3. Eine Person setzt |ψ₁(L/2)|² als Wahrscheinlichkeit ein, das Elektron exakt bei L/2 anzutreffen. Erklären Sie den Fehler, auch anhand der Einheiten. (2 BE)

## Task (EN)

An electron is in the ground state of a one-dimensional potential well of width L with infinitely high walls. The given function ψ₁(x)=√(2/L) sin(πx/L) is normalized on [0,L] and zero outside. If needed, use sin²(u)=(1−cos(2u))/2.

1. Set up and evaluate P(L/4≤x≤3L/4). (5 points)
2. Compare it with P(0≤x≤L/2)=1/2. Explain the difference despite equal interval widths using the probability density. (3 points)
3. Someone treats |ψ₁(L/2)|² as the probability of finding the electron exactly at L/2. Explain the error, including the units. (2 points)

## Reviewed solution / Lösung

P(a≤x≤b)=[x/L−sin(2πx/L)/(2π)] from a to b. For [L/4,3L/4], P=1/2+1/π≈0.81831 (81.8%). Correct integrand and limits: 2 points; antiderivative/evaluation: 2; dimensionless plausible result: 1.

Das Zentralintervall enthält die Bereiche hoher Dichte und ergibt deshalb mehr als das gleich breite Randintervall. For the ground state, equal interval widths do not imply equal areas under a nonconstant density. Reference to the denser centre: 2 points; equal-width/unequal-area explanation: 1.

|ψ₁(L/2)|²=2/L has units inverse length and is a density, not a dimensionless probability. A single point has zero probability in this continuous position distribution; probabilities refer to integrals over intervals. Density versus probability: 1 point; units/zero-width conclusion: 1.

The task tests integration and interpretation of a supplied normalized function. It does not test deriving the wave function, solving the Schrödinger equation, or calculating energy levels. Maximum 10 points; no passing threshold/release metadata is asserted here.


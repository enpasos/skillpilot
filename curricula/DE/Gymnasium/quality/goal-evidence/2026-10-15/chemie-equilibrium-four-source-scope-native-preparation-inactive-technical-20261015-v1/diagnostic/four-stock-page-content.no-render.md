# AI review input: Source4 actual stock context diagnostic; no render

- Book ID: `source4-actual-no-render-context-diagnostic`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:0265f43e54dba9269ec3f99c172a6d0dcf3dbd461bec6b410372f7ced20ba892`
- Selected goals: 4

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 252: Kp und Kc verknüpfen

- Full learning-goal ID: `a8ddb351-3501-5b6d-a908-c82a5d2f14d4`
- Goal fingerprint: `sha256:b8e215302f8aac4944a791cf378590c429048c7b84ee8d3f92fba32f10657b5f`
- Page fingerprint: `sha256:46d9364b3537b4cf465fb1a0fde4fdbd9290d6f72456a6fe7fdef9bd034f86de`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.1 Chemische Gleichgewichte

### Canonical description

Die lernende Person kann für ideale Gasgleichgewichte bei festgelegten Standardzuständen die Beziehung zwischen Kp und Kc herleiten, beide Konstanten umrechnen und die Grenzen des idealen Gasmodells begründen.

### Visualization

/assets/goal-visualizations/chemie/a8ddb351-3501-5b6d-a908-c82a5d2f14d4/a8ddb351-3501-5b6d-a908-c82a5d2f14d4.png

- original digest: `sha256:16a58ebe3f28201e4643b3c20ab98da5bbc4c17195877393d5dfed96712a4bd3`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Massenwirkungsgesetz anwenden — `20f92ba0-f7f4-5407-bb96-07e30da9002f` (page 247)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d7824e79080737245bf0afd04695c18905a2918fc500eacbff28baa641e12047`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `procedure`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Kp/Kc-Umrechnung folgt p_i=c_iRT und gasförmigen stöchiometrischen Exponenten.
  - Essential understanding (EN): Kp/Kc conversion follows p_i=c_iRT and gas-phase stoichiometric exponents.
  - Observable performance (DE): eqrk16-07-a: Den Faktor aus Partialgrößen und Standardzuständen herleiten. eqrk16-07-b: Gasstöchiometrie und Feststoffphasen unterscheiden.
  - Observable performance (EN): eqrk16-07-a: Derive the factor using partial quantities and standard states. eqrk16-07-b: Distinguish gas stoichiometry and solid phases.
- `e2`
  - Essential understanding (DE): Dimensionslose Standardzustände und unnormierte Schulprodukte benötigen unterschiedliche explizite Faktoren.
  - Essential understanding (EN): Dimensionless standard states and unnormalised classroom products require different explicit factors.
  - Observable performance (DE): eqrk16-07-a: Δν = 1 und Kp = 0,123879 mit Einheitenkonsistenz berechnen. eqrk16-07-b: Kp = 4,00 und Kc = 0,004811 bestimmen.
  - Observable performance (EN): eqrk16-07-a: Calculate Δν = 1 and Kp = 0.123879 consistently. eqrk16-07-b: Determine Kp = 4.00 and Kc = 0.004811.
- `e3`
  - Essential understanding (DE): Nichtideale Gase und mitgezählte Feststoffe verletzen die einfache Umrechnungsannahme.
  - Essential understanding (EN): Nonideal gases and including solids violate the simple conversion assumptions.
  - Observable performance (DE): eqrk16-07-a: Unnormierte Schulform, Aktivitätskonvention und Grenzen unterscheiden. eqrk16-07-b: Fugazität und die begrenzte Bedeutung von Δν = 0 erklären.
  - Observable performance (EN): eqrk16-07-a: Distinguish classroom products, activity conventions and limits. eqrk16-07-b: Explain fugacity and the limited meaning of Δν = 0.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `eqrk16-07-a-transfer`: Verdopple die ganze Reaktionsgleichung. Leite Kp′, Kc′ und Δν′ ab und begründe die Abhängigkeit von der gewählten Gleichung. / Double the entire reaction equation. Derive Kp′, Kc′ and Δν′ and explain their dependence on how the reaction is written.
- `eqrk16-07-b-transfer`: Für überkritisches CO2 ist p/(cRT) deutlich ungleich 1. Identifiziere den versagenden Herleitungsschritt, statt K allein aus Totaldruck zu berechnen. / For supercritical CO2, p/(cRT) differs substantially from 1. Identify the failing derivation step rather than computing K from total pressure alone.

**Application cases**

- `eqrk16-07-a`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-07-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Leite die Umrechnung aus dem idealen Gasgesetz her, bestimme Δν und berechne Kp. Vergleiche die unnormierte Schreibweise Kp = Kc (RT)^Δν. Prüfe R = 8,314 ohne Einheitenanpassung.
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-07-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Derive the conversion from the ideal gas law, identify Δν and calculate Kp. Contrast the unnormalised formula Kp = Kc (RT)^Δν. Assess using R = 8.314 without changing units.
  - Expected performance (DE): Δν = 2 − 1 = 1. Aus pi/p° = (ci/c°)(RTc°/p°) folgt Kp = Kc (RTc°/p°)^Δν. Der Faktor ist 24,77572; Kp = 0,123879 ist dimensionslos. Unnormierte Produkte hätten hier Kc in mol/L und Kp in bar; RT wäre dann der Faktor mit Einheit. Beide Konventionen dürfen nicht unmarkiert vermischt werden. R = 8,314 J/(mol K) verlangt konsistente Pa- und m³-Einheiten sowie umgerechnete Standards; blindes Einsetzen ergibt hier einen Faktor-100-Fehler. Die Herleitung setzt ideale Gase bei der genannten Temperatur voraus.
  - Expected performance (EN): Δν = 1. From pi/p° = (ci/c°)(RTc°/p°), obtain Kp = Kc (RTc°/p°)^Δν. The factor is 24.77572, giving dimensionless Kp = 0.123879. Unnormalised products instead give Kc in mol/L and Kp in bar, with a dimensional RT factor. Do not silently mix conventions. R = 8.314 J/(mol K) requires consistent Pa/m³ units and converted standards; blind substitution here gives a factor-100 error. The derivation assumes ideal gases at the stated temperature.
  - Understanding focus (DE): Verdopple die ganze Reaktionsgleichung. Leite Kp′, Kc′ und Δν′ ab und begründe die Abhängigkeit von der gewählten Gleichung.
  - Understanding focus (EN): Double the entire reaction equation. Derive Kp′, Kc′ and Δν′ and explain their dependence on how the reaction is written.
- `eqrk16-07-b`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-07-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Bestimme Δν und das jeweils fehlende K. Erläutere die Rolle der Feststoffe und die nötige zusätzliche Größe bei Nichtidealität. Prüfe die Aussage, Δν = 0 bedeute stets ideales Verhalten.
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-07-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Find Δν and the missing K. Explain the role of solids and the additional quantity needed for nonideality. Assess whether Δν = 0 always implies ideal behaviour.
  - Expected performance (DE): I: Δν = 0, daher Kp = Kc = 4,00 im idealen Modell. II: Gas-Δν = 1; reine Feststoffe werden nicht in diese Gaszählung aufgenommen. Der Faktor ist 41,57 und Kc = 0,200/41,57 = 0,004811. Bei vorhandenen reinen Feststoffphasen gilt Aktivität 1; ihre physische Menge verschwindet dadurch nicht. Reale Gase erfordern Fugazitäten beziehungsweise Fugazitätskoeffizienten. Δν = 0 entfernt nur den idealen RT-Faktor; verschiedene Nichtidealitäten heben sich nicht automatisch auf. Phasenwechsel und dichte Gemische brauchen eine neue Modellprüfung.
  - Expected performance (EN): I: Δν = 0, so Kp = Kc = 4.00 in the ideal model. II: gas Δν = 1; do not include solids in the gas count. The factor is 41.57, giving Kc = 0.004811. Pure solid phases have unit activity while present; their physical amount has not vanished. Real gases require fugacities or fugacity coefficients. Δν = 0 removes only the ideal RT factor, not necessarily different nonideal effects. Phase changes and dense mixtures require reassessment.
  - Understanding focus (DE): Für überkritisches CO2 ist p/(cRT) deutlich ungleich 1. Identifiziere den versagenden Herleitungsschritt, statt K allein aus Totaldruck zu berechnen.
  - Understanding focus (EN): For supercritical CO2, p/(cRT) differs substantially from 1. Identify the failing derivation step rather than computing K from total pressure alone.
## Page 253: vanʼt Hoff Gleichung nutzen

- Full learning-goal ID: `e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd`
- Goal fingerprint: `sha256:b35471e2895790b491d33004d7ec565bab5de735daa784e1e9d8807ff0d11d83`
- Page fingerprint: `sha256:7884451d91e3e8418556a631cbe764fd50f60974d4730bb4ee5b2935cb977fe3`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.1 Chemische Gleichgewichte

### Canonical description

Die lernende Person kann mit der van’t-Hoff-Gleichung die Änderung der Gleichgewichtskonstante mit der Temperatur berechnen und die dabei verwendete Annahme zur Reaktionsenthalpie erläutern.

### Visualization

/assets/goal-visualizations/chemie/e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd/e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd.png

- original digest: `sha256:bb77821e5155400797249e12e783bc66c73daa473ea8b2249f2951d4d3a9d1ca`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Le-Chatelier-Prinzip nutzen — `5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c` (page 248)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5b3a32778db14b58d8f90371c978b75f197de058c9112e9a59077251bc4db0f0`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Van’t Hoff verbindet Gleichgewichtskonstante und absolute Temperatur über die Reaktionsenthalpie.
  - Essential understanding (EN): Van’t Hoff relates equilibrium constants and absolute temperature through reaction enthalpy.
  - Observable performance (DE): eqrk16-08-a: Kelvin, Joule und natürlichen Logarithmus mit richtigem Vorzeichen verwenden. eqrk16-08-b: −27,66 kJ/mol und die Richtung des Temperatureffekts ableiten.
  - Observable performance (EN): eqrk16-08-a: Use Kelvin, joules and natural logarithms with the correct sign. eqrk16-08-b: Derive −27.66 kJ/mol and the temperature direction.
- `e2`
  - Essential understanding (DE): Die integrierte Zwei-Temperatur-Form setzt annähernd konstantes ΔrH° voraus, nicht konstante Aktivierungsenergie.
  - Essential understanding (EN): The integrated two-temperature form assumes approximately constant ΔrH°, not constant activation energy.
  - Observable performance (DE): eqrk16-08-a: K2 ≈ 0,356 chemisch deuten. eqrk16-08-b: Sekantenwert und Kurvenkrümmung als Modellgrenzen erklären.
  - Observable performance (EN): eqrk16-08-a: Interpret K2 ≈ 0.356 chemically. eqrk16-08-b: Explain the secant estimate and curvature as model limits.
- `e3`
  - Essential understanding (DE): Gleichgewichtslage, Einstellgeschwindigkeit und extrapolierte Temperaturbereiche sind verschiedene Aussagen.
  - Essential understanding (EN): Equilibrium position, equilibration speed and extrapolated temperature ranges are different claims.
  - Observable performance (DE): eqrk16-08-a: Konstantes ΔrH°, Kinetik und Extrapolationsgrenze erläutern. eqrk16-08-b: Reaktionsenthalpie und Aktivierungsenergie anhand von Energieniveaus trennen.
  - Observable performance (EN): eqrk16-08-a: Explain constant ΔrH°, kinetics and extrapolation limits. eqrk16-08-b: Separate reaction enthalpy and activation energy using energy levels.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `eqrk16-08-a-transfer`: Kehre die Reaktionsgleichung um. Leite K1′, ΔrH°′ und K2′ ab und prüfe den reziproken Zusammenhang. / Reverse the reaction equation. Derive K1′, ΔrH°′ and K2′ and check the reciprocal relation.
- `eqrk16-08-b-transfer`: Eine Reaktion hat ΔrH° nahe null, läuft bei höherer Temperatur aber rascher. Erkläre die Vereinbarkeit von fast unverändertem K und größeren Raten. / A reaction has nearly zero ΔrH° yet is faster at higher temperature. Explain how nearly unchanged K and larger rates are compatible.

**Application cases**

- `eqrk16-08-a`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-08-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Berechne K2 bei 318 K und prüfe Vorzeichen und Plausibilität. Unterscheide mehr Produkte im Gleichgewicht von einer schnelleren Reaktion. Beurteile die Extrapolation bis 1000 K ohne weitere Daten.
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-08-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Calculate K2 at 318 K and check sign and plausibility. Distinguish more equilibrium products from faster reaction. Assess extrapolation to 1000 K without further data.
  - Expected performance (DE): ΔrH° ist in 50000 J/mol umzurechnen. Der Exponent ist +1,2692, also K2 ≈ 0,3558. Dies passt zur endothermen Hinreaktion. Eine Zusammensetzung folgt erst mit Stoffbilanz und Druckbedingungen; K liefert keine Einstellzeit. Kinetik benötigt eigene Raten- oder Aktivierungsgrößen. Bis 1000 K wären Änderungen der Wärmekapazitäten, Phasen und Reaktionswege sowie ΔrH°(T) zu prüfen. Die konstante Enthalpie ist dort nicht belegt. Die Formel verwendet Kelvin und natürlichen Logarithmus, keine Celsiuswerte oder unkonvertierten Zehnerlogarithmen.
  - Expected performance (EN): Convert ΔrH° to 50000 J/mol. The exponent is +1.2692, so K2 ≈ 0.3558, consistent with an endothermic forward reaction. Composition also needs balances and pressure conditions; K gives no equilibration time. Kinetics requires separate rate or activation parameters. Extrapolation to 1000 K requires checking heat capacities, phases, pathways and ΔrH°(T). Constant enthalpy is not established there. Use Kelvin and natural logarithms, not Celsius or unconverted base-ten logarithms.
  - Understanding focus (DE): Kehre die Reaktionsgleichung um. Leite K1′, ΔrH°′ und K2′ ab und prüfe den reziproken Zusammenhang.
  - Understanding focus (EN): Reverse the reaction equation. Derive K1′, ΔrH°′ and K2′ and check the reciprocal relation.
- `eqrk16-08-b`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-08-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Bestimme die mittlere van’t-Hoff-Reaktionsenthalpie über 300–320 K. Deute Vorzeichen und Krümmung. Widerlege die Aktivierungsbehauptung mit einem Energieniveauschema und benenne nötige kinetische Daten.
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-08-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Estimate the average van’t Hoff reaction enthalpy over 300–320 K. Interpret its sign and the curvature. Refute the activation-energy claim with an energy-level sketch and identify necessary kinetic data.
  - Expected performance (DE): ΔrH° ≈ −R ln(5/10)/(1/320 − 1/300) = −27,66 kJ/mol. Erwärmen begünstigt die Rückreaktion des exothermen Hinumsatzes; K sinkt. Zwei Punkte liefern einen Sekantenwert, keine universelle konstante Enthalpie. Die K-Unsicherheit begrenzt die Genauigkeit. Krümmung kann auf ΔrH°(T), geänderte Spezies oder Nichtidealität hinweisen. Reaktionsenthalpie ist die Energiedifferenz der Endzustände; Aktivierungsenergie betrifft die Barriere beziehungsweise Temperaturabhängigkeit von Raten. Dafür wären echte Geschwindigkeitskonstanten bei Temperaturvariation und kontrolliertem Mechanismus nötig.
  - Expected performance (EN): ΔrH° ≈ −R ln(5/10)/(1/320 − 1/300) = −27.66 kJ/mol. Heating favours the reverse of an exothermic forward process, lowering K. Two points yield a secant estimate, not a universal constant enthalpy, and K uncertainty limits precision. Curvature can indicate ΔrH°(T), species changes or nonideality. Reaction enthalpy compares end states; activation energy concerns barriers or rate-temperature dependence. The latter needs actual rate constants across temperatures with a controlled mechanism.
  - Understanding focus (DE): Eine Reaktion hat ΔrH° nahe null, läuft bei höherer Temperatur aber rascher. Erkläre die Vereinbarkeit von fast unverändertem K und größeren Raten.
  - Understanding focus (EN): A reaction has nearly zero ΔrH° yet is faster at higher temperature. Explain how nearly unchanged K and larger rates are compatible.
## Page 254: Mehrfachgleichgewichte

- Full learning-goal ID: `1a51362e-fd84-5964-89b5-b435772c2149`
- Goal fingerprint: `sha256:7aed171461af75f4878547c8678176c7e981237eb77a9f0bdfedcf987d722135`
- Page fingerprint: `sha256:d087167a88e50aae46f7ee0a2520ba5e7e82cd9440d854846fc0ab83e33e3a79`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.1 Chemische Gleichgewichte

### Canonical description

Die lernende Person kann gekoppelte Gleichgewichte über gemeinsame Teilchen, zusammengehörige Gleichgewichtskonstanten und Stoffbilanzen qualitativ und quantitativ analysieren.

### Visualization

/assets/goal-visualizations/chemie/1a51362e-fd84-5964-89b5-b435772c2149/1a51362e-fd84-5964-89b5-b435772c2149.jpg

- original digest: `sha256:54edd013190761e739fa8cf9dafa207d744e144fe57ac122e911a7e55321ab83`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Massenwirkungsgesetz anwenden — `20f92ba0-f7f4-5407-bb96-07e30da9002f` (page 247)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5dc3333e12f930493d328275e68f0a146990b64cf7f0be06311a48fe21f58bbd`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Gekoppelte Gleichgewichte teilen Spezies; Addition von Reaktionen multipliziert passende Konstanten.
  - Essential understanding (EN): Coupled equilibria share species; adding reactions multiplies compatible constants.
  - Observable performance (DE): eqrk16-09-a: Die gekoppelte Gleichung und KL/Ka2 durch Reaktionsaddition erzeugen. eqrk16-09-b: Knet = 0,00288 aus Lösen und Komplexbildung ableiten.
  - Observable performance (EN): eqrk16-09-a: Construct the coupled equation and Ksp/Ka2 by reaction addition. eqrk16-09-b: Derive Knet = 0.00288 from dissolution and complex formation.
- `e2`
  - Essential understanding (DE): Bilanzen und freie statt analytischer Gesamtkonzentrationen schließen die Rechnung; der Übergang von Aktivitäten zu Konzentrationen benötigt eine explizite Idealnäherung oder Aktivitätskoeffizienten.
  - Essential understanding (EN): Balances and free rather than analytical total concentrations close the calculation; converting activities into concentrations requires an explicit ideal approximation or activity coefficients.
  - Observable performance (DE): eqrk16-09-a: 4,7 · 10−5 M Carbonat und 7,02 · 10−5 M Calcium berechnen. eqrk16-09-b: Löslichkeit und freies Ag+ mit dem Massenwirkungsgesetz unter der gegebenen Idealnäherung prüfen.
  - Observable performance (EN): eqrk16-09-a: Calculate 4.7 × 10−5 M carbonate and 7.02 × 10−5 M calcium. eqrk16-09-b: Check solubility and free Ag+ using mass action under the supplied ideal approximation.
- `e3`
  - Essential understanding (DE): Protonierung und Komplexbildung sind verschiedene Kopplungsmechanismen, keine unabhängigen Einzelrechnungen.
  - Essential understanding (EN): Protonation and complex formation are distinct coupling mechanisms rather than independent calculations.
  - Observable performance (DE): eqrk16-09-a: Reservoir und endliche Stoff- und Ladungsbilanz abgrenzen. eqrk16-09-b: Die geschlossene Ligandenbilanz als Gegenprobe nutzen.
  - Observable performance (EN): eqrk16-09-a: Distinguish the reservoir from finite material and charge balances. eqrk16-09-b: Use the closed ligand balance as a countercheck.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `eqrk16-09-a-transfer`: Öffne einen geschlossenen Carbonatansatz für CO2-Austausch. Begründe eine Gasrandbedingung statt eines ohne Beleg festgehaltenen pH-Werts. / Open a closed carbonate system to CO2 exchange. Explain the need for a gas boundary condition rather than an arbitrarily fixed pH.
- `eqrk16-09-b-transfer`: Ein Ligand bildet stattdessen ML im Verhältnis 1:1. Konstruiere den Kopplungsausdruck neu und benenne geänderte Exponenten und Bilanz. / A ligand instead forms 1:1 ML. Reconstruct the coupled expression and identify the changed exponents and balance.

**Application cases**

- `eqrk16-09-a`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-09-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Addiere geeignete Gleichungen und leite die Gesamtkonstante sowie freie Carbonat- und Calciumkonzentration her. Deute eine pH-Absenkung um 1 bei weiter konstantem Hydrogencarbonat. Welche Bilanzen fehlen für einen kleinen geschlossenen Becher?
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-09-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Add suitable equations and derive the net constant and free carbonate and calcium concentrations. Interpret lowering pH by 1 at fixed bicarbonate. Which extra balances are needed for a small closed beaker?
  - Expected performance (DE): Die umgekehrte Ka2-Reaktion ergibt mit dem Lösen: CaCO3 + H+ ⇌ Ca2+ + HCO3−; Kges = KL/Ka2 ≈ 70,21. [CO3²−]/c° = Ka2 ([HCO3−]/c°)/aH+ = 4,7 · 10−5. Damit [Ca2+] ≈ 7,02 · 10−5 mol/L. Bei pH 7 und weiterhin 0,0100 M HCO3− sinkt Carbonat zehnfach und Calcium steigt im bedingten Modell auf 7,02 · 10−4 M. Protonierung verbraucht Carbonat und fördert weiteres Lösen, ohne die Konstanten zu ändern. Ein geschlossener Becher benötigt Kohlenstoff- und Calciumbilanzen, Elektroneutralität, weitere Säuregleichgewichte und gegebenenfalls eine Gasbilanz. Ein endlicher Puffer löst nicht unbegrenzt Feststoff.
  - Expected performance (EN): Reverse the Ka2 reaction and add dissolution: CaCO3 + H+ ⇌ Ca2+ + HCO3−, with Knet = Ksp/Ka2 ≈ 70.21. [CO3²−]/c° = Ka2 ([HCO3−]/c°)/aH+ = 4.7 × 10−5, giving [Ca2+] ≈ 7.02 × 10−5 mol/L. At pH 7 and the same 0.0100 M bicarbonate, carbonate falls tenfold and conditional calcium rises to 7.02 × 10−4 M. Protonation consumes carbonate and drives dissolution without changing constants. A closed beaker needs carbon/calcium balances, electroneutrality, further acid equilibria and possibly a gas balance. A finite buffer cannot dissolve solid indefinitely.
  - Understanding focus (DE): Öffne einen geschlossenen Carbonatansatz für CO2-Austausch. Begründe eine Gasrandbedingung statt eines ohne Beleg festgehaltenen pH-Werts.
  - Understanding focus (EN): Open a closed carbonate system to CO2 exchange. Explain the need for a gas boundary condition rather than an arbitrarily fixed pH.
- `eqrk16-09-b`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-four-material-gap-remediation-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.four-gap-successor.author.json #eqrk16-09-b; sha256:c9d14994f6f2cb2fbc3d099a6f6424be55d93e73e3837c428cf42ce8286e851e. Bilde Gesamtgleichung und Konstante. Berechne die Löslichkeit mit dominierendem Komplex und prüfe danach freies Ag+ sowie die Näherung. Warum ist derselbe Wert in einer geschlossenen Probe mit nur 0,001 M Gesamtsammoniak unmöglich?
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-four-material-gap-remediation-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.four-gap-successor.author.json #eqrk16-09-b; sha256:c9d14994f6f2cb2fbc3d099a6f6424be55d93e73e3837c428cf42ce8286e851e. Construct the net equation and constant. Calculate solubility with dominant complex, then check free Ag+ and the approximation. Why is the same value impossible in a closed sample with only 0.001 M total ammonia?
  - Expected performance (DE): AgCl + 2 NH3 ⇌ [Ag(NH3)2]+ + Cl−; Knet = KL β2 = 0,00288. Bei Komplexdominanz gilt s ≈ [Komplex] ≈ [Cl−], daher s ≈ 0,005367 M. Innerhalb des angegebenen Idealmodells gilt s² = KL (1 + β2 aNH3²) c°²; der Faktor 160001 gibt denselben gerundeten Wert. Freies Ag+ = s/160001 ≈ 3,35 · 10−8 M; das Produkt mit Chlorid bestätigt KL. Gesamt- und freies Silber unterscheiden sich. 0,005367 M Komplex würde 0,01073 M gebundenes NH3 benötigen und kann nicht aus 0,001 M Gesamtsammoniak entstehen. Eine Ligandenbilanz und eine neue freie NH3-Konzentration sind nötig; analytisches Gesamtsammoniak darf nicht einfach in β eingesetzt werden.
  - Expected performance (EN): AgCl + 2 NH3 ⇌ [Ag(NH3)2]+ + Cl−, with Knet = Ksp β2 = 0.00288. Under complex dominance, s ≈ [complex] ≈ [Cl−], giving s ≈ 0.005367 M. Within the stated ideal model, s² = Ksp (1 + β2 aNH3²) c°²; the factor 160001 gives the same rounded result. Free Ag+ = s/160001 ≈ 3.35 × 10−8 M, whose product with chloride verifies Ksp. Total and free silver differ. That complex concentration requires 0.01073 M bound NH3 and cannot arise from 0.001 M total ammonia. A ligand balance and a new free NH3 concentration are needed; analytical total ammonia cannot simply replace free activity in β.
  - Understanding focus (DE): Ein Ligand bildet stattdessen ML im Verhältnis 1:1. Konstruiere den Kopplungsausdruck neu und benenne geänderte Exponenten und Bilanz.
  - Understanding focus (EN): A ligand instead forms 1:1 ML. Reconstruct the coupled expression and identify the changed exponents and balance.
## Page 273: pE/pH- und Pourbaix-Diagramme

- Full learning-goal ID: `f0f2c5f8-06f1-5774-a176-d96505727acf`
- Goal fingerprint: `sha256:62606b4f668b83197e091461fa682dbc05290d693f643dbd23868a23bf2850c7`
- Page fingerprint: `sha256:94205927d2fd390ff11d71d73cd2e39ebea9118c522bcb3eaa6b3a7ba7f2be4b`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.3 Redoxgleichgewichte

### Canonical description

Die lernende Person kann für vorgegebene thermodynamische Modelle pE/pH- beziehungsweise Eh/pH-Diagramme aus Gleichgewichtsbeziehungen konstruieren und interpretieren sowie Stabilitätsbereiche von Aussagen über Korrosionsgeschwindigkeit und tatsächliche Passivierung abgrenzen.

### Visualization

/assets/goal-visualizations/chemie/f0f2c5f8-06f1-5774-a176-d96505727acf/f0f2c5f8-06f1-5774-a176-d96505727acf.png

- original digest: `sha256:6778295209ab596f763c1f71ee08d372743b656f6a851a2129f183830d5fd2ad`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Spannungsreihen nutzen — `8be14f15-2258-58e6-ae4e-38953f5d0570` (page 268)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:7e1234f9aa5608b660280589ca809ad53ae92d8b65fc193072b6a448ccff91a6`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `representation`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): pE und Eh beschreiben Redoxbedingungen; Stabilitätsgrenzen folgen definierten Aktivitäten und Gleichgewichten.
  - Essential understanding (EN): pE and Eh describe redox conditions; stability boundaries follow defined activities and equilibria.
  - Observable performance (DE): eqrk16-10-a: Wassergrenzen und horizontale Cu-Linie konstruieren. eqrk16-10-b: Die vertikale pH-9,5-Grenze aus KL und Kw ableiten.
  - Observable performance (EN): eqrk16-10-a: Construct water boundaries and the horizontal Cu line. eqrk16-10-b: Derive the vertical pH-9.5 boundary from Ksp and Kw.
- `e2`
  - Essential understanding (DE): Horizontale, vertikale und geneigte Grenzen trennen unterschiedliche Elektronen-/Protonenbilanzen.
  - Essential understanding (EN): Horizontal, vertical and sloping boundaries express different electron and proton balances.
  - Observable performance (DE): eqrk16-10-a: Drei Punkte mit korrekter pE/Eh-Bedeutung einordnen. eqrk16-10-b: Geneigte Grenze und beide Punkte konsistent bestimmen.
  - Observable performance (EN): eqrk16-10-a: Classify three points with correct pE/Eh meaning. eqrk16-10-b: Determine the sloping boundary and classify both points consistently.
- `e3`
  - Essential understanding (DE): Pourbaix-Bereiche sind thermodynamische Modellbereiche, keine direkte Aussage über Geschwindigkeit oder vollständigen Korrosionsschutz.
  - Essential understanding (EN): Pourbaix regions are thermodynamic model domains, not direct predictions of rates or complete corrosion protection.
  - Observable performance (DE): eqrk16-10-a: Fehlende Spezies, Rate und Passivierungsinformation benennen. eqrk16-10-b: Feststoffstabilität von tatsächlicher Passivierung trennen.
  - Observable performance (EN): eqrk16-10-a: Identify missing species, rate and passivation information. eqrk16-10-b: Separate solid stability from actual passivation.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `eqrk16-10-a-transfer`: Erhöhe die Cu2+-Aktivität hundertfach. Leite die Grenzverschiebung ab und begründe, warum eine fehlende Aktivitätsangabe das Diagramm unvollständig macht. / Increase Cu2+ activity one hundredfold. Derive the boundary shift and explain why missing activity information makes the diagram incomplete.
- `eqrk16-10-b-transfer`: Füge einen starken M2+-Liganden hinzu. Begründe die nötige Neuberechnung der Grenzen statt einer unveränderten Farbflächenannahme. / Add a strong M2+ ligand. Explain the need to recalculate boundaries rather than assuming unchanged coloured regions.

**Application cases**

- `eqrk16-10-a`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-10-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Konstruiere eine beschriftete pE/pH-Skizze und die Cu-Grenze. Ordne P(pH 2, pE 1), Q(2, 6) und R(2, −4) chemisch ein. Unterscheide Modellstabilität von realer Korrosionsgeschwindigkeit.
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-10-a; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Construct a labelled pE/pH sketch and the Cu boundary. Classify P(pH 2, pE 1), Q(2, 6) and R(2, −4) chemically. Distinguish model stability from actual corrosion rate.
  - Expected performance (DE): Die Cu-Linie ist horizontal: Eh = 0,340 + 0,05916/2 · log(10−6) = 0,16252 V, also pE ≈ 2,747. Oberhalb wird Cu2+, unterhalb Metall bevorzugt. Bei pH 2 reicht das Wasserfenster von pE −2 bis 18,78. P liegt darin im Metallbereich, Q darin im Cu2+-Bereich. R liegt unter der H2-Grenze: Wasserreduktion ist thermodynamisch möglich, der Punkt ist kein dauerhaft unverändert stabiler Wasserzustand. Das Zweiformenmodell beweist weder reale Passivierung noch eine Rate und lässt außerhalb pH 0–5 wichtige Cu-Spezies aus. pE ist dimensionslos, Eh eine Spannung.
  - Expected performance (EN): The Cu boundary is horizontal: Eh = 0.16252 V, hence pE ≈ 2.747. Cu2+ is favoured above it, metal below. At pH 2 the water window extends from pE −2 to 18.78. P lies inside it in the metal region and Q inside it in the Cu2+ region. R is below the H2 boundary, so water reduction is thermodynamically possible; it is not an unchanged stable aqueous state. This two-form model establishes neither actual passivation nor a corrosion rate, and omits important Cu species outside pH 0–5. pE is dimensionless; Eh is voltage.
  - Understanding focus (DE): Erhöhe die Cu2+-Aktivität hundertfach. Leite die Grenzverschiebung ab und begründe, warum eine fehlende Aktivitätsangabe das Diagramm unvollständig macht.
  - Understanding focus (EN): Increase Cu2+ activity one hundredfold. Derive the boundary shift and explain why missing activity information makes the diagram incomplete.
- `eqrk16-10-b`
  - Task demand (DE): Vollständiges eigenes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-10-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Leite die vertikale Fällungsgrenze und die M/M(OH)2-Gerade her. Ordne P(pH 8, Eh −0,50 V) und Q(pH 11, Eh −0,50 V) ein. Warum ersetzt das Schema keinen Materialschutztest?
  - Task demand (EN): Complete own material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-redox-kinetics16-current422-whole-material-author-20261015-v1/materials/thirty-two-whole-DE-EN-cases.final-science-and-prose.author.json #eqrk16-10-b; sha256:86dc6b7640368abf7dbd12b51f4cdf48aba1731f7f543169a30c14261c3ccd2e. Derive the vertical precipitation boundary and M/M(OH)2 line. Classify P(pH 8, Eh −0.50 V) and Q(pH 11, Eh −0.50 V). Why does the scheme not replace a material-protection test?
  - Expected performance (DE): Bei aM2+ = 10−6 gilt aOH− = √(10−15/10−6) = 10−4,5, also pOH 4,5 und pH 9,5. Die Metall/Ion-Linie ist Eh = −0,61748 V. Einsetzen von aM2+ = KL/aOH² ergibt die Feststoff/Metall-Gerade Eh = −0,05546 − 0,05916 pH. P liegt unter pH 9,5 und oberhalb −0,61748 V, also im M2+-Bereich. Q liegt oberhalb pH 9,5 und oberhalb −0,70622 V, also im M(OH)2-Bereich. Beide Punkte liegen im Wasserfenster. Der Schnittpunkt bei pH 9,5 prüft die Konsistenz. Haftung, Porosität, Kinetik, weitere Oxidationsstufen und Komplexe fehlen; ein Feststofffeld bedeutet keinen nachgewiesenen Schutz.
  - Expected performance (EN): At aM2+ = 10−6, aOH− = 10−4.5, giving pOH 4.5 and pH 9.5. The metal/ion line is Eh = −0.61748 V. Substituting aM2+ = Ksp/aOH² gives the solid/metal line Eh = −0.05546 − 0.05916 pH. P has pH below 9.5 and Eh above −0.61748 V, placing it in the M2+ region. Q has pH above 9.5 and Eh above −0.70622 V, placing it in the hydroxide region. Both lie inside the water window. Check consistency at the intersection at pH 9.5. Adhesion, porosity, kinetics, other oxidation states and complexes are absent; a solid field is not proven protection.
  - Understanding focus (DE): Füge einen starken M2+-Liganden hinzu. Begründe die nötige Neuberechnung der Grenzen statt einer unveränderten Farbflächenannahme.
  - Understanding focus (EN): Add a strong M2+ ligand. Explain the need to recalculate boundaries rather than assuming unchanged coloured regions.

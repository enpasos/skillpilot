# BE Math Onboarding Note

Status: P5 (`broad_reviewed_coverage`)

This note records the first Berlin source-landscape identifiers for the mathematics-first DE expansion track and their activation state.

Reserved source landscapes on `2026-03-21`:

- lower-secondary Gymnasium mathematics (`classes 7-10` on the shared BE/BB Sek-I source):
  - `sourceLandscapeId`: `b30048d2-d649-4727-b448-988a0f86a2c2`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-BE/lower-secondary/be_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics:
  - `sourceLandscapeId`: `5aafcc55-e89f-4dd5-ab17-9455e3c103b7`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_math_upper_secondary_to_canonical_math.json`

Activation state:

- the first Berlin mathematics source bundle is now archived locally at:
  - `curricula/DE/Gymnasium/input/BE/lower-secondary/Teil_C_Mathematik_2015_10_13_Ma_14.08.2023_Berlin_23_11.pdf`
  - `curricula/DE/Gymnasium/input/BE/upper-secondary/rahmenlehrplan-mathematik_go-teil-c.pdf`
- the lower-secondary source uses the shared Berlin/Brandenburg Sek-I mathematics framework and is now normalized into a Berlin-specific source snapshot
- both Berlin `sourceLandscapeId` values are now active in `source-landscape-registry.json`
- both Berlin lanes now contribute source goal memberships to `source-goal-membership-registry.json`
- both Berlin lanes now contribute atomic closures to `source-goal-closure-registry.json`
- the reviewed exact Berlin lower-secondary and upper-secondary mappings now also contribute canonical goal provenance in `canonical-goal-provenance-registry.json`
- the first active Berlin lower-secondary source snapshot now lives at:
  - `curricula/DE/Gymnasium/input/BE/lower-secondary/source-json/DE_BER_S_GYM_1_MATHEMATIK.de.json.snapshot`
- the first active Berlin upper-secondary source snapshot now lives at:
  - `curricula/DE/Gymnasium/input/BE/upper-secondary/source-json/DE_BER_S_GYM_2_MATHEMATIK.de.json.snapshot`
- the imported lower-secondary pilot subset currently covers:
  - the Gymnasium year anchors `J7-J10`
  - the first reviewed functions corridor on Niveaustufen `E-F`
  - the first explicit reviewed lower-secondary data/chance corridor on Niveaustufen `E-H`
- the imported upper-secondary pilot subset currently covers:
  - the Einfuehrungsphase bridge
  - the Qualifikationsphase anchors `Q1-Q4`
  - the first reviewed Berlin Q1 differential corridor
  - the first reviewed Berlin Q2 integral corridor
  - the first reviewed Berlin Q2 stochastics corridor
  - the first reviewed Berlin Q2 data-and-survey corridor
  - the first reviewed Berlin Q4 distribution-and-binomial corridor
- the lower-secondary mapping lane now carries the first structural anchor mappings:
  - `J7`, `J8`, `J9`, `J10`
- the lower-secondary mapping lane now also carries the first reviewed corridor mappings:
  - Zuordnungen beschreiben
  - Darstellungwechsel bei Zuordnungen
  - Berechnungen zu proportionalen und indirekt proportionalen Zuordnungen
  - lineare Funktionen beschreiben
  - Darstellungwechsel bei linearen Funktionen
  - Berechnungen zu linearen Funktionen
- the lower-secondary mapping lane now also carries the first reviewed data/chance corridor mappings:
  - statistische Erhebungen, Diagramme und Haeufigkeiten
  - Boxplots / Histogramme, Datenkritik und Manipulationserkennung
  - Laplace-Vorstellungen, bedingte Wahrscheinlichkeit und kombinatorische Wahrscheinlichkeitsbruecken
- the upper-secondary mapping lane now carries the first structural anchor mappings:
  - `E`, `Q1`, `Q2`, `Q3`, `Q4`
- the upper-secondary mapping lane now also carries the first reviewed Q1 differential corridor mappings:
  - propedeutic limit use for derivatives
  - secant and tangent slopes
  - rates of change
  - derivative as local rate of change
  - derivative-function and derivative-graph interpretation
  - basic differentiation rules together with product and chain rule coverage
  - monotonicity, extrema, inflection points, and necessary-condition reasoning
  - simple extremal problems
- the upper-secondary mapping lane now also carries the first reviewed Q2 integral corridor mappings:
  - bestimmtes Integral als rekonstruierter Bestand
  - Bestandsrekonstruktion aus Aenderungsraten
  - geometrische Hauptsatz-Deutung
  - Stammfunktionen fuer grundlegende Integrale
  - Flaechenberechnung und Kontextdeutung mit bestimmten Integralen
- the upper-secondary mapping lane now also carries the first reviewed Q2 stochastics corridor mappings:
  - Baumdiagramme fuer mehrstufige Zufallsexperimente
  - Vierfeldertafeln fuer gemeinsame und bedingte Wahrscheinlichkeiten
  - bedingte Wahrscheinlichkeiten und einfache Unabhaengigkeitspruefungen
  - Urnenmodelle mit und ohne Zuruecklegen
  - Simulationen stochastischer Situationen
- the upper-secondary mapping lane now also carries the first reviewed Q2 data-and-survey corridor mappings:
  - statistische Erhebungen planen und dokumentieren
  - Erhebungsdaten tabellarisch und grafisch aufbereiten
  - Lageparameter einer Stichprobe bestimmen und deuten
  - Streuungsmasse einer Stichprobe bestimmen und deuten
  - Erhebungsdaten mit Kenngroessen auswerten und reflektieren
- the upper-secondary mapping lane now also carries the first reviewed Q4 distribution-and-binomial corridor mappings:
  - Binomialverteilungen mit den Parametern `n` und `p` als Modell nutzen
  - Bernoulli-Experimente und Bernoulli-Ketten fuer Binomialmodelle beschreiben
  - Wahrscheinlichkeiten in binomialen Situationen berechnen
  - Erwartungswert und Standardabweichung der Binomialverteilung bestimmen und deuten
  - Binomialverteilungen zur Beschreibung stochastischer Situationen nutzen
- repository-backed lower-secondary and upper-secondary mapping files now carry `187` mappings in total

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable
- keep the first Berlin reviewed lower-secondary functions and data/chance corridors stable while the upper-secondary entry lane is widened
- the shared lower-secondary anchor spine `J7-J10` is now mapped
- the first reviewed lower-secondary functions corridor is now mapped
- the first explicit reviewed lower-secondary data/chance corridor is now mapped
- the Berlin upper-secondary phase bridge `E/Q1/Q2/Q3/Q4` is now mapped
- the first reviewed Berlin upper-secondary Q1 differential corridor is now mapped
- the first reviewed Berlin upper-secondary Q2 integral corridor is now mapped
- the first reviewed Berlin upper-secondary Q2 stochastics corridor is now mapped
- the first reviewed Berlin upper-secondary Q2 data-and-survey corridor is now mapped
- the first reviewed Berlin upper-secondary Q4 distribution-and-binomial corridor is now mapped
- the remaining broad Berlin lower-secondary algebra / geometry / body parents and the broad upper-secondary root, Q1/Q3/Q4, analysis-deepening, and numerical-mathematics parents are now also mapped
- Berlin is no longer a mapping-only lane in the canonical math applicability/status pass; the next Berlin-specific cleanup step is the shared `P6/F6` learner-facing scope stabilization, not more topic breadth
- Berlin is now a stable broad reviewed comparison lane; further widening should only happen if an intentionally imported retained non-core source slice is added later

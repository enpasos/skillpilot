# AI review input: Ein- und Ausschaltvorgänge – aktueller Selbstinduktionskontext

- Book ID: `self-induction-dependent-692-current-context`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:99eb0e811d7bb425d81364947d677a8af74b0122c4ee7ceeb4a7b17eff5c0c18`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Ein- und Ausschaltvorgänge analysieren

- Full learning-goal ID: `692db5b6-8be1-5c7b-8307-3a02afb21ea0`
- Goal fingerprint: `sha256:02ae80b7ac55ac76cc2831b8482f71c0d5e90200a83840d1bd73d8e6f7c737ad`
- Page fingerprint: `sha256:f0b23d530f2160b1c3c25f47ac455cff6e139fe3d53a7b64411e249fe476ea4f`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q2 Schwingungen, Induktion und mechanische Wellen > Induktion und elektromagnetische Schwingungen

### Canonical description

Die lernende Person kann Strom- und Spannungsverläufe beim Ein- und Ausschalten eines idealisierten RL-Stromkreises mit der Zeitkonstante τ = L/R quantitativ analysieren und die Induktivität aus einem solchen Verlauf bestimmen.

### Visualization

/assets/goal-visualizations/physik/692db5b6-8be1-5c7b-8307-3a02afb21ea0/692db5b6-8be1-5c7b-8307-3a02afb21ea0.jpg

- original digest: `sha256:37f463e5aacdbb1dee87d10eb90868f0481527b8396c232fb1b6e555d58185d1`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Wachstums- und Abklingvorgänge exponentiell modellieren und Ergebnisse im Kontext bewerten — `27b63e2e-6a34-483e-8e5a-fe0f49670d1d` (outside this book)
- Selbstinduktion und Induktivität — `37f28bc4-def2-57cf-a06b-191dfd228205` (outside this book)

### Direct reverse prerequisites outside this book

- Q2-Klausuraufgaben Physik selbstständig lösen — `50328a4f-91e8-5c8b-8d61-8f9c98a5cddf` (outside this book)
- Vorschlag A (LK) - Adaptive Ladespur (Felder/Induktion) — `86015397-23c4-5ed7-b893-bc619ec961a8` (outside this book)
- Selbstinduktion, Einschaltvorgaenge und Feldenergie — `acf192a8-c398-51dc-a03b-672ab55df957` (outside this book)
- Vorschlag A (LK) - Feldregelung und Transformatorwirkungsgrad — `cf892388-6cb4-5981-adf2-7168aeb948b1` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4785bc814eb5081658c2c65ab9563b1242e65b9a3809a5929acb9fcb687d14ad`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `rl-current-is-continuous-and-exponential`
  - Essential understanding (DE): Im idealisierten linearen RL-Kreis kann der Spulenstrom nicht sprunghaft ändern. Widerstand und Selbstinduktion erzeugen exponentielle Ein- und Ausschaltverläufe mit physikalisch bestimmten Anfangs- und Grenzwerten.
  - Essential understanding (EN): In an idealized linear RL circuit, inductor current cannot change discontinuously. Resistance and self-induction produce exponential switch-on and switch-off transients with physically determined initial and limiting values.
  - Observable performance (DE): Die lernende Person ordnet aus frischen Strom- und Spannungsdaten Schaltphase und Bauteilgrößen zu, bestimmt Anfangs- und Grenzwerte und verwirft einen Verlauf mit unzulässigem Stromsprung.
  - Observable performance (EN): From fresh current and voltage data, the learner identifies switching phase and component quantities, determines initial and limiting values, and rejects a curve with an inadmissible current jump.
- `time-constant-connects-graph-and-components`
  - Essential understanding (DE): Die Zeitkonstante τ = L/R legt die Zeitskala fest; nach τ ist beim Einschalten ein charakteristischer Anteil des Endwerts erreicht. Bei bekanntem R erlaubt eine aus Daten bestimmte Zeitkonstante die Bestimmung von L.
  - Essential understanding (EN): The time constant τ = L/R sets the timescale; after one τ a characteristic fraction of the final switch-on value is reached. With known R, a time constant determined from data allows L to be found.
  - Observable performance (DE): Die lernende Person bestimmt τ aus Graph, Tabellenwerten oder einem geeigneten Fit, berechnet L mit Einheit und gibt eine datenangemessene Genauigkeit statt Scheingenauigkeit an.
  - Observable performance (EN): The learner determines τ from a graph, tabulated values, or an appropriate fit, calculates L with units, and reports precision appropriate to the data rather than false precision.
- `changed-parameters-predict-transient`
  - Essential understanding (DE): Größeres L verlangsamt und größeres R beschleunigt über τ = L/R bei sonst gleichem Serien-RL-Modell die zeitliche Annäherung. Bei einem Spannungssprung bestimmen Quellenspannung und Gesamtwiderstand gemeinsam den stationären Grenzstrom U/R, während die Anfangsbedingung den Startwert festlegt; Spannungspolungen folgen der jeweiligen Schaltphase.
  - Essential understanding (EN): Larger L slows and larger R speeds the approach through τ = L/R in an otherwise unchanged series RL model. For a voltage step, source voltage and total resistance jointly determine the steady-state limiting current U/R, while the initial condition sets the starting value; voltage polarities follow the switching phase.
  - Observable performance (DE): Vor Auswertung eines neuen Datensatzes sagt die lernende Person getrennt voraus, wie R und L die Zeitkonstante, wie Quellenspannung und R den Grenzstrom und wie der Anfangsstrom den Startwert verändern, und prüft die Prognose an Verlauf und Residuen.
  - Observable performance (EN): Before analyzing a fresh data set, the learner separately predicts how R and L affect the time constant, how source voltage and R affect the limiting current, and how initial current sets the starting value, then checks the prediction against the curve and residuals.

**Coverage expectations**

- required expectations: `rl-current-is-continuous-and-exponential`, `time-constant-connects-graph-and-components`, `changed-parameters-predict-transient`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `transient-type`: Einschalten, Ausschalten oder Übergang mit nichtverschwindendem Anfangsstrom / Switch-on, switch-off, or transition with nonzero initial current
- `component-change`: Änderung von R, L oder beiden bei unterschiedlicher Zeitkonstante / Change of R, L, or both with different time constants
- `data-quality`: Glatter Modellgraph, verrauschte Tabelle oder Datensatz mit erkennbarem Offset / Smooth model curve, noisy table, or data set with a detectable offset

**Application cases**

- `extract-inductance-from-switch-on-data`
  - Task demand (DE): Für einen RL-Kreis mit bekanntem R sind Strommesswerte nach dem Einschalten samt Unsicherheiten gegeben. Bestimme Endwert und τ, berechne L und prüfe, ob ein exponentielles Modell die Daten angemessen beschreibt.
  - Task demand (EN): For an RL circuit with known R, current measurements after switch-on are supplied with uncertainties. Determine the final value and τ, calculate L, and check whether an exponential model adequately describes the data.
  - Expected performance (DE): Die lernende Person nutzt mehrere Datenpunkte oder einen Fit, erhält L = Rτ mit Einheit, vergleicht Abweichungen mit Unsicherheiten und formuliert eine begrenzte Modellentscheidung.
  - Expected performance (EN): The learner uses multiple data points or a fit, obtains L = Rτ with units, compares deviations with uncertainties, and states a bounded model judgment.
  - Understanding focus (DE): Der Fall prüft die quantitative Verbindung von Kurve, Zeitkonstante und Bauteilwert.
  - Understanding focus (EN): The case tests the quantitative link among curve, time constant, and component value.
- `resistance-change-switch-off-transfer`
  - Task demand (DE): Derselbe geladene Induktor wird über zwei verschiedene Widerstände entladen. Prognostiziere vorab die relative Zeitkonstante, ordne zwei unbekannte Stromkurven zu und erkläre Anfangswert sowie Spannungspolung.
  - Task demand (EN): The same energized inductor is discharged through two different resistors. Predict the relative time constants, assign two unlabeled current curves, and explain the initial value and voltage polarity.
  - Expected performance (DE): Die lernende Person erkennt τ = L/R, ordnet dem größeren R den schnelleren Abfall zu, erhält den kontinuierlichen gemeinsamen Anfangsstrom und begründet die Ausschaltpolung aus Selbstinduktion.
  - Expected performance (EN): The learner uses τ = L/R, assigns faster decay to the larger R, preserves the common continuous initial current, and justifies switch-off polarity from self-induction.
  - Understanding focus (DE): Der Transfer prüft Parameterwirkung und physikalische Randwerte an einer anderen Schaltphase.
  - Understanding focus (EN): The transfer tests parameter effects and physical boundary values in a different switching phase.

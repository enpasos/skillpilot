# AI review input: Physik – acht aktuelle Root-P-Kontexte

- Book ID: `physik-eight-root-current-whole-p-contexts-20261015-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:5cc5a9d93123bacd16d273d0f32c245eb76de139489c2e22c9230047ef90f091`
- Selected goals: 8

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Freier Fall experimentell untersuchen

- Full learning-goal ID: `09029573-864f-40ca-bf8a-cee7bf6dcb73`
- Goal fingerprint: `sha256:130790489acb03f5ba26be963eb06339ad5f38783763c65e16a1646eb7acd6ab`
- Page fingerprint: `sha256:71e0680b16ab09375e75dd1cd8aa87a16ca461ab09b3f2f069e65db501ea810c`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > E.1 Bewegungen und ihre Beschreibung > Beschleunigte Bewegung und freier Fall

### Canonical description

Die lernende Person kann den freien Fall nahe der Erdoberfläche experimentell untersuchen, Messdaten grafisch auswerten, daraus im Modell ohne Luftwiderstand die Gravitationsbeschleunigung bestimmen und unter Angabe der Anfangsbedingungen ein Zeit-Ort-Gesetz formulieren.

### Visualization

/assets/goal-visualizations/physik/09029573-864f-40ca-bf8a-cee7bf6dcb73/09029573-864f-40ca-bf8a-cee7bf6dcb73.jpg

- original digest: `sha256:814704c3c964ed3d7a1a78a9b8b7af66eda5741107a71e7d4f27f8385b15bace`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Bewegungen mit Diagrammen untersuchen — `ce431132-dfc4-42c2-aff6-bd72035190f8` (outside this book)
- Gleichmäßig beschleunigte Bewegung und Beschleunigung — `e4b38061-1f28-43ad-8371-a3e7c0e81856` (outside this book)

### Direct reverse prerequisites outside this book

- E-Phase-Klausuraufgaben Physik selbstständig lösen — `7f83e25c-38f7-5ac2-8f9c-ec54eeef1026` (outside this book)
- Bewegungsanalyse und freier Fall — `a9562b05-c54d-5635-9244-3f7dd24a8642` (outside this book)
- Mehrschrittige Bewegungsmodelle mit Reibung und Chaos analysieren — `dd99528a-bae5-5b78-89e6-c6092c927f8d` (outside this book)
- Massenanziehung qualitativ beschreiben — `92d8f398-0c9f-523c-88d7-44165b6b4768` (outside this book)
- Fallbewegung mit Luftwiderstand und Grenzgeschwindigkeit — `12260012-cf04-5409-b57d-f5b3a46d9126` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:081f196db82add31979dc8f09ae53e816aa7473171f58453a4c57c91e9cd7e40`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `selected-blind-review-core`
  - Essential understanding (DE): Die lernende Person versteht den freien Fall nahe der Erdoberfläche als näherungsweise gleichmäßig beschleunigte Bewegung unter Gravitation, unterscheidet gemessene Orts- und Zeitdaten von der daraus erschlossenen Gravitationsbeschleunigung und berücksichtigt, dass das Modell Luftwiderstand vernachlässigt sowie Koordinatenwahl und Anfangsbedingungen benötigt.
  - Essential understanding (EN): The learner understands free fall near Earth's surface as approximately uniformly accelerated motion under gravity, distinguishes measured position and time data from the gravitational acceleration inferred from them, and recognizes that the model neglects air resistance and requires a coordinate choice and initial conditions.
  - Observable performance (DE): Die lernende Person plant oder nutzt eine sichere beaufsichtigte Video- oder Sensormessung beziehungsweise einen bereitgestellten Datensatz, stellt die Daten geeignet grafisch dar, bestimmt g mit Einheit und begründeter Unsicherheit, prüft die Modellpassung und formuliert ein dazu konsistentes Zeit-Ort-Gesetz mit Anfangsbedingungen.
  - Observable performance (EN): The learner plans or uses a safe supervised video or sensor measurement, or a supplied data set, represents the data in a suitable graph, determines g with a unit and justified uncertainty, checks the model fit, and formulates a consistent time-position law with initial conditions.
- `g-is-acceleration-not-weight-or-speed`
  - Essential understanding (DE): g ist im luftwiderstandsfreien Modell die lokale Beschleunigung und weder eine Geschwindigkeit noch eine Kraft. Verschiedene Massen haben dieselbe Fallbeschleunigung, obwohl ihre Gewichtskräfte m g verschieden sind.
  - Essential understanding (EN): In the no-drag model, g is local acceleration, not a velocity or force. Different masses have the same falling acceleration even though their weights m g differ.
  - Observable performance (DE): Die lernende Person vergleicht Daten zweier Körper, trennt Beschleunigung, Geschwindigkeit und Gewichtskraft mit Einheiten und entscheidet, ob Abweichungen auf Messunsicherheit oder Luftwiderstand hinweisen.
  - Observable performance (EN): The learner compares data for two objects, distinguishes acceleration, velocity, and weight with units, and decides whether differences indicate uncertainty or drag.

**Coverage expectations**

- required expectations: `selected-blind-review-core`, `g-is-acceleration-not-weight-or-speed`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `object-and-drag`: Kompakter Körper, flächiger Körper oder unterschiedliche Massen / Compact object, broad object, or different masses
- `coordinate-and-initial-state`: Fall aus Ruhe, Anfangsgeschwindigkeit, Bezugshöhe und Achsenrichtung / Drop from rest, initial velocity, reference height, and axis direction
- `measurement-method`: Video, Lichtschranke, Sensor oder bereitgestellter Datensatz / Video, light gate, sensor, or supplied data

**Application cases**

- `steel-ball-video-fit`
  - Task demand (DE): Werte eine beaufsichtigt aufgezeichnete Fallbewegung einer Stahlkugel bei nach oben positiver Achse aus. Bestimme g grafisch, gib Unsicherheit und Einheit an und formuliere das Zeit-Ort-Gesetz.
  - Task demand (EN): Analyze a supervised video recording of a falling steel ball with upward chosen as positive. Determine g graphically, state uncertainty and unit, and formulate the time-position law.
  - Expected performance (DE): Gemessene Orte und Zeiten werden von g als erschlossener Größe getrennt; a = -g, Anfangshöhe und Anfangsgeschwindigkeit werden konsistent eingesetzt.
  - Expected performance (EN): Measured positions and times are distinguished from inferred g; a = -g, initial height, and initial velocity are used consistently.
  - Understanding focus (DE): Vorzeichen und Anfangsbedingungen sind Teil des Modells.
  - Understanding focus (EN): Signs and initial conditions are part of the model.
- `ball-and-filter-model-comparison`
  - Task demand (DE): Vergleiche bereitgestellte Fallmessungen einer kompakten Kugel und eines Papierfilters aus gleicher Höhe. Prüfe für beide das Modell ohne Luftwiderstand.
  - Task demand (EN): Compare supplied falling-motion data for a compact ball and a paper filter released from the same height. Test the no-drag model for each.
  - Expected performance (DE): Die Kugeldaten liefern innerhalb der Unsicherheit konstantes g; die Filterabweichung wird nicht als anderes Gravitationsfeld oder bloßer Masseneffekt, sondern als Modellgrenze eingeordnet.
  - Expected performance (EN): The ball data yield constant g within uncertainty; the filter discrepancy is treated as a model limitation rather than a different gravitational field or merely a mass effect.
  - Understanding focus (DE): Abweichung vom Modell verändert nicht die Bedeutung von g.
  - Understanding focus (EN): Deviation from the model does not change the meaning of g.
## Page 2: Chirp-Masse aus der Frequenzentwicklung eines Gravitationswellensignals erschließen

- Full learning-goal ID: `1b7e800a-1c0d-5faa-886b-7ef2f3b8348c`
- Goal fingerprint: `sha256:f9dd3bb5f751beee489d52dd51da52b1ead479f552b32d9c6240ad37430c718e`
- Page fingerprint: `sha256:5cec0997bb69c574946803235e7278dc3899d8f564c33437ecf7f7830a744921`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Astrophysik > Massenbestimmung in Doppelsternsystemen und Gravitationswellen deuten > Massenparameter aus Doppelstern- und Gravitationswellendaten erschließen

### Canonical description

Die lernende Person kann aus Frequenz und Frequenzänderungsrate eines inspiralartigen Gravitationswellensignals mit einem begründeten Näherungsmodell die Chirp-Masse als bestimmte Kombination der Komponentenmassen abschätzen sowie Annahmen, Unsicherheiten und Grenzen dieser Inferenz erläutern.

### Visualization

/assets/goal-visualizations/physik/1b7e800a-1c0d-5faa-886b-7ef2f3b8348c/1b7e800a-1c0d-5faa-886b-7ef2f3b8348c.png

- original digest: `sha256:ba6fe05e3420edd34e74a4f177cb7081c3af32cb8cf24de851f448942937be9c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Potenzen mit rationalen Exponenten als Wurzel- und Bruchausdrücke deuten — `88abc886-cce8-55cf-b86c-eb4ba45a92d7` (outside this book)
- Mittlere Änderungsrate berechnen und deuten — `ae20183e-92b5-5521-b8e0-9a8662cf51f5` (outside this book)
- Kepler-Gesetze anwenden — `497f1311-17d6-56ff-afb1-422a738e5c16` (outside this book)
- Gravitationswellen und elektromagnetische Wellen vergleichen — `ba16948b-5e07-54af-b77b-776e677c6906` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:12499b048f65da720421f536c820131f43ef0c795c3f703f846ff03d77d30123`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `selected-blind-review-core`
  - Essential understanding (DE): Im führenden Näherungsmodell eines annähernd kreisförmigen Inspirals verknüpft die durch Gravitationsstrahlung verursachte Frequenzzunahme ḟ mit der Frequenz f die Chirp-Masse M_c = (m₁m₂)^(3/5)/(m₁+m₂)^(1/5). Diese Kombination steuert die führende Frequenzentwicklung, bestimmt aber nicht beide Einzelmassen; Näherungsregime und gegebenenfalls kosmologische Rotverschiebung begrenzen die Interpretation.
  - Essential understanding (EN): In the leading approximation for a nearly circular inspiral, the gravitational-radiation-driven frequency increase ḟ together with frequency f determines the chirp mass M_c = (m₁m₂)^(3/5)/(m₁+m₂)^(1/5). This combination controls the leading frequency evolution but does not determine both component masses; the approximation regime and, where relevant, cosmological redshift limit the interpretation.
  - Observable performance (DE): Aus bereitgestellten Signalwerten oder einer Frequenz-Zeit-Darstellung bestimmt die lernende Person f und ḟ, prüft Einheiten und den inspiraltypischen Trend, wendet ein begründetes führendes Modell zur Abschätzung der Chirp-Masse an und erläutert, welche Größen gemessen beziehungsweise aus dem Signal bestimmt und welche Masseninformation modellabhängig inferiert wird, einschließlich Unsicherheiten und Gültigkeitsgrenzen.
  - Observable performance (EN): From supplied signal values or a frequency–time representation, the learner determines f and ḟ, checks units and the inspiral-like trend, applies a justified leading-order model to estimate the chirp mass, and explains which quantities are measured or extracted from the signal and which mass information is inferred through the model, including uncertainties and validity limits.
- `chirp-mass-is-a-degenerate-combination-not-total-mass`
  - Essential understanding (DE): Die Chirp-Masse ist eine bestimmte Kombination der beiden Komponentenmassen. Verschiedene Massenpaare können dieselbe oder ähnliche Chirp-Masse besitzen; selbst bei gleicher Gesamtmasse ändert ein anderes Massenverhältnis die Chirp-Masse. Deshalb legen f und ḟ im führenden Modell weder Gesamtmasse noch beide Einzelmassen eindeutig fest.
  - Essential understanding (EN): Chirp mass is a specific combination of the two component masses. Different mass pairs can have the same or similar chirp mass; even at fixed total mass, a different mass ratio changes the chirp mass. Therefore, in the leading model, f and ḟ determine neither total mass nor both component masses uniquely.
  - Observable performance (DE): Die lernende Person vergleicht Massenpaare mit gleicher Gesamtmasse, berechnet oder begründet die Änderung ihrer Chirp-Masse, verbindet diese mit der relativen Frequenzentwicklung und formuliert die aus Signaldaten zulässige Masseninformation ohne unbegründete Einzelmassenangaben.
  - Observable performance (EN): The learner compares mass pairs with the same total mass, calculates or explains the change in their chirp mass, connects it to relative frequency evolution, and states the mass information supported by the signal data without unjustified component-mass claims.
- `signal-extraction-and-model-regime-bound-the-inference`
  - Essential understanding (DE): Frequenz und Frequenzänderungsrate werden aus einem endlichen, verrauschten Signalabschnitt bestimmt und sind keine direkt abgelesenen Massen. Das führende annähernd kreisförmige Inspiralmodell verliert bei starker Exzentrizität, sehr spätem Inspiral oder Verschmelzung seine ausreichende Gültigkeit; Mess- und Modellunsicherheit sind getrennt zu betrachten.
  - Essential understanding (EN): Frequency and frequency derivative are extracted from a finite, noisy signal segment and are not directly read masses. The leading nearly circular inspiral model ceases to be adequate for strong eccentricity, very late inspiral, or merger; measurement and model uncertainty must be considered separately.
  - Observable performance (DE): Die lernende Person wählt einen begründeten Signalabschnitt, bestimmt f und ḟ mit einer Unsicherheitsabschätzung, prüft Trend und Einheiten, sagt den Einfluss von Rauschen oder Abschnittswahl voraus und entscheidet anhand sichtbarer Regimemerkmale, ob die führende Chirp-Massenbeziehung anwendbar, nur näherungsweise brauchbar oder zurückzuweisen ist.
  - Observable performance (EN): The learner selects a justified signal segment, determines f and ḟ with an uncertainty estimate, checks trend and units, predicts the effect of noise or segment choice, and uses visible regime characteristics to decide whether the leading chirp-mass relation is applicable, only approximately useful, or should be rejected.

**Coverage expectations**

- required expectations: `selected-blind-review-core`, `chirp-mass-is-a-degenerate-combination-not-total-mass`, `signal-extraction-and-model-regime-bound-the-inference`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `frequency-evolution-and-noise`: Unterschiedliche Frequenzsteigerung, Signal-Rausch-Verhältnis und Zeitfenster / Different frequency increase, signal-to-noise ratio, and time window
- `inspiral-regime`: Frühes annähernd kreisförmiges Inspiral, exzentrischer Fall oder später Verschmelzungsbereich / Early nearly circular inspiral, eccentric case, or late merger regime
- `component-mass-ratio`: Unterschiedliches Massenverhältnis bei gleicher oder veränderter Gesamtmasse / Different component-mass ratio at fixed or changed total mass

**Application cases**

- `clean-early-inspiral-inference`
  - Task demand (DE): Für einen frischen, ausreichend rauscharmen Frequenz-Zeit-Verlauf eines frühen annähernd kreisförmigen Inspirals sind Zeit- und Frequenzunsicherheiten gegeben. Bestimme f und ḟ in einem begründeten Abschnitt, erschließe mit der bereitgestellten führenden Beziehung die Chirp-Masse und begrenze die Aussage.
  - Task demand (EN): For a fresh, sufficiently low-noise frequency-time trace of an early nearly circular inspiral, time and frequency uncertainties are supplied. Determine f and ḟ in a justified segment, infer the chirp mass using the supplied leading relation, and bound the claim.
  - Expected performance (DE): Die lernende Person prüft den inspiraltypischen Trend und die Einheiten, trennt Signalgrößen von der Masseninferenz, propagiert oder begründet die Unsicherheit und erklärt ausdrücklich, warum das Ergebnis keine getrennten Komponentenmassen liefert.
  - Expected performance (EN): The learner checks the inspiral-like trend and units, separates signal quantities from mass inference, propagates or justifies uncertainty, and explicitly explains why the result does not yield separate component masses.
  - Understanding focus (DE): Der Fall prüft die vollständige Signal-zu-Chirp-Masse-Inferenz statt bloßer Formeleinsetzung.
  - Understanding focus (EN): The case tests the complete signal-to-chirp-mass inference rather than mere formula substitution.
- `changed-chirp-and-regime-transfer`
  - Task demand (DE): Ein unabhängiges Signal zeigt bei gleicher Frequenz eine andere Frequenzänderungsrate und stärkeres Rauschen; ein später Abschnitt reicht erkennbar nahe an die Verschmelzung. Sage zunächst die Richtung der Chirp-Massenänderung im gültigen frühen Abschnitt voraus, schätze sie mit Unsicherheit und entscheide anschließend, ob der späte Abschnitt mit demselben Modell ausgewertet werden darf.
  - Task demand (EN): An independent signal shows a different frequency derivative at the same frequency and stronger noise; a later segment visibly approaches merger. First predict the direction of the chirp-mass change in the valid early segment, estimate it with uncertainty, and then decide whether the late segment may be analysed with the same model.
  - Expected performance (DE): Die lernende Person begründet die Skalierungsrichtung, passt die Unsicherheit an das Rauschen an, weist eine eindeutige Einzelmassenbestimmung zurück und begrenzt oder verwirft die führende Näherung für den späten Abschnitt anhand des Regimewechsels.
  - Expected performance (EN): The learner justifies the scaling direction, adjusts uncertainty for the noise, rejects unique component-mass determination, and bounds or rejects the leading approximation for the late segment based on the regime change.
  - Understanding focus (DE): Der Transfer prüft Vorhersage, Unsicherheit, Parameterdegeneration und Modellgrenze in einem veränderten Signal.
  - Understanding focus (EN): The transfer tests prediction, uncertainty, parameter degeneracy, and model limits in a changed signal.
## Page 3: Phasensprünge bei Reflexion

- Full learning-goal ID: `215f5558-562c-5686-b649-931f324c7983`
- Goal fingerprint: `sha256:121419eee6e868a60edb230924a92e66409c55aa61e8cc859fa36e7ddcc4c222`
- Page fingerprint: `sha256:16a767263391068fcd31d1c35f6301411f922cfc98a17adb9ec8fc1790e6f180`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q2 Schwingungen, Induktion und mechanische Wellen > Mechanische Wellen

### Canonical description

Die lernende Person kann erklären und mathematisch beschreiben, warum eine eindimensionale Auslenkungswelle bei der Reflexion am festen Ende einen Phasensprung von π und am losen Ende keinen Phasensprung erfährt.

### Visualization

/assets/goal-visualizations/physik/215f5558-562c-5686-b649-931f324c7983/215f5558-562c-5686-b649-931f324c7983.jpg

- original digest: `sha256:cb20118b703bae07cc239ff6a4b33e9ea28f3d86b7ccad998d40e2963702f869`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Transformierte Sinus- und Kosinusfunktionen mit der Kettenregel ableiten — `58d2f963-4fb9-550d-a832-f5ac60808900` (outside this book)
- Stehende Wellen und Wellenlängenbestimmung — `d5772db3-120c-5c37-ab46-2336d02236b0` (outside this book)

### Direct reverse prerequisites outside this book

- Q2-Klausuraufgaben Physik selbstständig lösen — `50328a4f-91e8-5c8b-8d61-8f9c98a5cddf` (outside this book)
- Interferenz, stehende Wellen und Musikinstrumente — `ab2b9c0f-db98-5d20-adee-e46eafe037b4` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e75f81b9ea0c020d251103f758da67ae52dc90edcc1b0ab5e91ff8a285d4a949`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `proof`

**Positive understanding expectations**

- `fixed-end-boundary-requires-phase-pi`
  - Essential understanding (DE): Am ideal festen Ende muss die Gesamtauslenkung zu jeder Zeit null sein. Einlaufende und reflektierte Auslenkungswelle erfüllen diese Randbedingung nur mit entgegengesetztem Vorzeichen am Ende; der Reflexionsfaktor ist −1 und entspricht einem Phasensprung von π beziehungsweise einer Pulsinversion.
  - Essential understanding (EN): At an ideal fixed end, total displacement must be zero at all times. The incident and reflected displacement waves satisfy this boundary condition only with opposite signs at the end; the reflection coefficient is −1, corresponding to a phase shift of π or pulse inversion.
  - Observable performance (DE): Die lernende Person formuliert zu einer neuen einlaufenden Welle eine reflektierte Welle, setzt beide am festen Ende ein und zeigt rechnerisch und an einer eigenständig konstruierten Pulsdarstellung, dass sich die Auslenkungen dort aufheben.
  - Observable performance (EN): For a fresh incident wave, the learner formulates a reflected wave, substitutes both at the fixed end, and shows mathematically and with an independently constructed pulse diagram that the displacements cancel there.
- `free-end-boundary-requires-no-inversion`
  - Essential understanding (DE): Am ideal losen Ende verschwindet die transversale Kraft und damit im linearen Saitenmodell die räumliche Steigung der Gesamtauslenkung. Diese Randbedingung verlangt für die Auslenkungswelle einen Reflexionsfaktor +1: Der reflektierte Puls ist nicht invertiert und besitzt keinen Phasensprung gegenüber dem einlaufenden Puls.
  - Essential understanding (EN): At an ideal free end, transverse force vanishes and therefore, in the linear string model, so does the spatial slope of total displacement. This boundary condition requires reflection coefficient +1 for the displacement wave: the reflected pulse is not inverted and has no phase shift relative to the incident pulse.
  - Observable performance (DE): Die lernende Person setzt die Ableitungsrandbedingung für eine neue Wellenform ein, begründet das gleiche Vorzeichen der reflektierten Auslenkung und sagt die Reflexionsform nach einem Wechsel zwischen festem und losem Ende korrekt voraus.
  - Observable performance (EN): The learner applies the derivative boundary condition to a fresh waveform, justifies the same sign of reflected displacement, and correctly predicts the reflection shape after switching between fixed and free ends.

**Coverage expectations**

- required expectations: `fixed-end-boundary-requires-phase-pi`, `free-end-boundary-requires-no-inversion`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `termination`: Ideales festes oder ideales loses Ende / Ideal fixed or ideal free end
- `wave-form`: Einzelner Puls, harmonische Welle oder Momentanbild der Überlagerung / Single pulse, harmonic wave, or snapshot of the superposition
- `representation-direction`: Mathematische Randbedingung zur Darstellung oder Darstellung zur Randbedingung / Mathematical boundary condition to representation or representation to boundary condition

**Application cases**

- `pulse-reflection-fixed-and-free`
  - Task demand (DE): Ein positiver nicht-sinusförmiger Auslenkungspuls läuft auf ein Seilende zu. Konstruiere getrennt die reflektierte Pulsform für einen ideal festen und einen ideal losen Abschluss, sage das Vorzeichen nach der Reflexion voraus und erkläre den Unterschied aus den jeweiligen Randbedingungen.
  - Task demand (EN): A positive nonsinusoidal displacement pulse travels toward the end of a string. Separately construct the reflected pulse for an ideal fixed and an ideal free termination, predict its sign after reflection, and explain the difference from the respective boundary conditions.
  - Expected performance (DE): Die lernende Person invertiert den Puls am festen Ende und lässt ihn am losen Ende gleich orientiert, erklärt am festen Ende die stets verschwindende Auslenkung und am losen Ende die verschwindende Steigung beziehungsweise Querkraft und nennt die Idealisation.
  - Expected performance (EN): The learner inverts the pulse at the fixed end and keeps its orientation at the free end, explains zero displacement at the fixed end and zero slope or transverse force at the free end, and states the idealization.
  - Understanding focus (DE): Der Grundfall prüft den kausalen Zusammenhang zwischen Randbedingung und Pulsphase ohne bekannte Sinusvorlage.
  - Understanding focus (EN): The direct case tests the causal link between boundary condition and pulse phase without a familiar sinusoidal template.
- `harmonic-boundary-verification-transfer`
  - Task demand (DE): Für eine einlaufende harmonische Welle y_i(x,t) an einer Grenze x=0 sind zwei Kandidaten für y_r gegeben, einer mit Reflexionsfaktor +1 und einer mit −1. Prüfe für beide Endtypen durch Einsetzen von y_i+y_r beziehungsweise seiner räumlichen Ableitung, welcher Kandidat die Randbedingung erfüllt, und leite die zugehörige Phasendifferenz ab.
  - Task demand (EN): For an incident harmonic wave y_i(x,t) at a boundary x=0, two candidates for y_r are supplied, one with reflection coefficient +1 and one with −1. For both termination types, test by substituting y_i+y_r or its spatial derivative which candidate satisfies the boundary condition, and derive the associated phase difference.
  - Expected performance (DE): Die lernende Person wählt für das feste Ende den Faktor −1 und die Phasendifferenz π und für das lose Ende den Faktor +1 und die Phasendifferenz 0, wobei Vorzeichen- und Phasenkonvention konsistent bleiben.
  - Expected performance (EN): The learner selects coefficient −1 and phase difference π for the fixed end and coefficient +1 and phase difference 0 for the free end, maintaining a consistent sign and phase convention.
  - Understanding focus (DE): Der Transfer verlangt eine explizite mathematische Prüfung beider idealen Randfälle.
  - Understanding focus (EN): The transfer requires explicit mathematical verification of both ideal boundary cases.
## Page 4: Ladungserhaltung erläutern

- Full learning-goal ID: `25998fed-ea4d-4c3e-b606-e965b5d7f290`
- Goal fingerprint: `sha256:7d4102629d3772ec4d015a7cbc0a2b5c0dc4ac0f5663e05cdfc9636f6f92c17e`
- Page fingerprint: `sha256:4278d010916737b286e54cfce28ae289bb52c369dcd2809cbeed80aa1111e559`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q1 Elektrisches und magnetisches Feld > Elektrisches Feld > Grundlagen des elektrischen Feldes

### Canonical description

Die lernende Person kann elektrische Ladung als Erhaltungsgröße beschreiben und Ladungsumverteilungen in abgeschlossenen Systemen fachlich deuten.

### Visualization

/assets/goal-visualizations/physik/25998fed-ea4d-4c3e-b606-e965b5d7f290/25998fed-ea4d-4c3e-b606-e965b5d7f290.jpg

- original digest: `sha256:9cc7c92df54fdc88897b516935d601733a8e2d2b1f97f3e0b9af12a040a191fd`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Ganze Zahlen addieren — `4b67bed9-06da-40b2-a306-24e9e7dfd390` (outside this book)
- Ladungsphänomene und Reibungselektrizität — `a6e48b88-51ed-5942-bdb8-8d2192652e0d` (outside this book)

### Direct reverse prerequisites outside this book

- Elektrostatik und Potenzial — `841edfdb-5e12-5a37-ab12-552a1d8e92ca` (outside this book)
- Q1-Klausuraufgaben Physik selbstständig lösen — `d441ee2f-9230-5751-832b-5b0b5cf14605` (outside this book)
- Influenz bei Leitern untersuchen — `9fb1dd85-11b7-4a5a-b124-27fea8d1788e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:903a18de1a519a775a94ebd769503fc3e83b568f656633f572102924ee90d352`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `closed-system-algebraic-total-is-conserved`
  - Essential understanding (DE): In einem abgeschlossenen System bleibt die algebraische Gesamtladung erhalten: Die Summe aller positiven und negativen Ladungsbeiträge ist nach einer Wechselwirkung dieselbe wie vorher. Erhaltung bezieht sich auf das abgegrenzte Gesamtsystem, nicht darauf, dass jeder einzelne Körper seine Ladung behält.
  - Essential understanding (EN): In a closed system, total algebraic charge is conserved: the sum of all positive and negative charge contributions is the same after an interaction as before. Conservation applies to the bounded overall system, not to each individual body retaining its charge.
  - Observable performance (DE): Die lernende Person legt für einen unbekannten Umverteilungsfall die Systemgrenze fest, bildet die vorzeichenrichtige Gesamtladung vor und nach dem Vorgang und bestimmt oder kontrolliert eine fehlende Teilladung aus der Erhaltungsbilanz.
  - Observable performance (EN): For an unfamiliar redistribution case, the learner specifies the system boundary, forms the signed total charge before and after the process, and determines or checks a missing component charge from the conservation balance.
- `local-changes-are-transfers-across-subsystem-boundaries`
  - Essential understanding (DE): Wenn ein Teilkörper Ladung gewinnt oder verliert, wird Ladung über dessen Teilgrenze übertragen; im vollständig betrachteten abgeschlossenen System erscheint die entgegengesetzte Änderung an einem anderen Bestandteil. Eine scheinbare Verletzung der Erhaltung zeigt daher häufig, dass ein beteiligter Körper oder die Umgebung außerhalb der gewählten Grenze liegt.
  - Essential understanding (EN): When one component gains or loses charge, charge is transferred across that component's boundary; within the complete closed system, the opposite change appears on another component. An apparent violation of conservation therefore often shows that an involved body or the surroundings lie outside the chosen boundary.
  - Observable performance (DE): Die lernende Person vergleicht die Bilanz eines Teilsystems mit der eines erweiterten abgeschlossenen Systems, lokalisiert den Ladungstransfer und erklärt die Änderung einzelner Körper, ohne Ladung als neu entstanden oder verschwunden zu beschreiben.
  - Observable performance (EN): The learner compares the balance of a subsystem with that of an expanded closed system, locates the charge transfer, and explains changes of individual bodies without describing charge as newly created or destroyed.

**Coverage expectations**

- required expectations: `closed-system-algebraic-total-is-conserved`, `local-changes-are-transfers-across-subsystem-boundaries`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `system-boundary`: Ein vollständig abgeschlossenes Mehrkörpersystem oder ein zunächst zu eng gewähltes einzelnes Teilsystem / A complete closed multi-body system or an initially too narrowly chosen single subsystem
- `charge-information`: Vollständige Vorher-nachher-Werte oder eine aus der Erhaltungsbilanz zu bestimmende Teilladung / Complete before-and-after values or one component charge to be determined from conservation
- `sign-composition`: Nur gleichnamige Beiträge oder gemischte positive, negative und neutrale Anfangszustände / Only like-signed contributions or mixed positive, negative, and neutral initial states

**Application cases**

- `three-body-redistribution-balance`
  - Task demand (DE): Drei Körper befinden sich in einem Behälter und bilden selbst ein elektrisch abgeschlossenes System: Während der Umverteilung wird Ladung nur zwischen diesen drei Körpern übertragen, nicht zum Behälter oder zur übrigen Umgebung. Vorher tragen sie +4 nC, −1 nC und 0 nC. Danach werden an zwei Körpern +2 nC und +5 nC bestimmt. Ermittle die Ladung des dritten Körpers und beschreibe, was die Bilanz über Umverteilung und Gesamtladung aussagt.
  - Task demand (EN): Three bodies are inside an enclosure and themselves form a charge-isolated system: during redistribution, charge is transferred only among these three bodies, not to the enclosure or other surroundings. Beforehand they carry +4 nC, −1 nC, and 0 nC. Afterwards, +2 nC and +5 nC are determined on two bodies. Determine the charge of the third body and explain what the balance says about redistribution and total charge.
  - Expected performance (DE): Die lernende Person bildet vor dem Vorgang Q_ges = +3 nC. Damit die Nachher-Summe ebenfalls +3 nC beträgt, muss der dritte Körper −4 nC tragen, denn +2 nC + 5 nC − 4 nC = +3 nC. Sie erklärt, dass sich die Teilladungen stark geändert haben, die algebraische Gesamtladung des abgeschlossenen Dreikörpersystems aber erhalten blieb.
  - Expected performance (EN): The learner calculates Q_total = +3 nC before the process. For the final sum also to equal +3 nC, the third body must carry −4 nC because +2 nC + 5 nC − 4 nC = +3 nC. The learner explains that the component charges changed substantially while the algebraic total charge of the closed three-body system remained conserved.
  - Understanding focus (DE): Der Grundfall prüft vorzeichenrichtige Gesamtbilanz und die Trennung zwischen erhaltener Gesamtladung und veränderlichen Teilladungen.
  - Understanding focus (EN): The direct case tests a correctly signed total balance and the distinction between conserved total charge and changing component charges.
- `ground-contact-requires-expanded-boundary`
  - Task demand (DE): Eine leitende Kugel trägt zunächst +6 nC. Nach leitendem Kontakt mit einer geerdeten Verbindung wird an der Kugel näherungsweise 0 nC gemessen. Eine Aussage behauptet, in der Kugel sei Ladung vernichtet worden. Beurteile die Aussage zuerst für das Teilsystem Kugel und dann für ein erweitertes System aus Kugel, Leitung und Erde.
  - Task demand (EN): A conducting sphere initially carries +6 nC. After conducting contact with a grounded connection, approximately 0 nC is measured on the sphere. A statement claims that charge was destroyed in the sphere. Assess the statement first for the sphere as a subsystem and then for an expanded system consisting of sphere, connection, and Earth.
  - Expected performance (DE): Die lernende Person erkennt, dass die Kugel allein während des Kontakts kein abgeschlossenes System ist und Ladung über die Leitung übertragen wird. Sie erweitert die Grenze um Leitung und Erde und deutet die Änderung der Kugelladung als Umverteilung innerhalb dieses größeren Systems; die fehlenden +6 nC werden nicht als vernichtet bezeichnet.
  - Expected performance (EN): The learner recognizes that the sphere alone is not a closed system during contact and that charge is transferred through the connection. The learner expands the boundary to include the connection and Earth and interprets the sphere's change as redistribution within that larger system; the missing +6 nC is not described as destroyed.
  - Understanding focus (DE): Der Transfer prüft, ob eine scheinbare Nichterhaltung durch eine sachgerechte Systemgrenze und einen Ladungstransfer erklärt wird.
  - Understanding focus (EN): The transfer tests whether apparent non-conservation is explained through an appropriate system boundary and charge transfer.
## Page 5: Sinusfoermige Wechselgroessen mit Zeigerdiagrammen beschreiben

- Full learning-goal ID: `5f97952e-5ac9-5749-94d0-d1dc50dda358`
- Goal fingerprint: `sha256:bafbdd94a248a19d01b7f4d570c8378a321efe0337f65d38b16bdbcf63da8c85`
- Page fingerprint: `sha256:cf8df831472817efb87979908d584abe584faf9044ce0c6cd44aa53403e4eebe`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q2 Schwingungen, Induktion und mechanische Wellen > Induktion und elektromagnetische Schwingungen

### Canonical description

Die lernende Person kann sinusförmige Spannung und Stromstärke in ohmschen Wechselstromkreisen mit Zeigerdiagrammen darstellen und Phasenbeziehungen fachlich deuten.

### Visualization

/assets/goal-visualizations/physik/5f97952e-5ac9-5749-94d0-d1dc50dda358/5f97952e-5ac9-5749-94d0-d1dc50dda358.jpg

- original digest: `sha256:32de0b0652e73ad4a1ecbd36f48ad3a0b615ae5d2cad56012607e920fa3caf6f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Sinus- und Kosinusfunktionen verstehen — `bbef7cf2-90fa-59fa-a115-8b651aab9231` (outside this book)
- Zusammenhang von Spannung und Stromstärke qualitativ erläutern — `53196a71-9dbd-4835-b2f9-ff21b8a8962c` (outside this book)
- Elektromagnetischen Schwingkreis analysieren — `ac4ba260-6086-5fcc-bea2-c06f1425a1cc` (outside this book)

### Direct reverse prerequisites outside this book

- Kondensator und Spule im Wechselstromkreis analysieren — `ef0f2391-fd8e-5ae3-ae86-7adcdd833c7a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d07495fd1617d93daa6d314d230546a74e76457d694b661aeb2dc6685f6138bc`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `phasor-projection`
  - Essential understanding (DE): Ein Zeiger stellt Amplitude und Phase einer sinusförmigen Größe bei festgelegter Projektion dar; Spannung und Strom eines ideal ohmschen Widerstands sind bei gleicher Bezugsrichtung in Phase.
  - Essential understanding (EN): A phasor represents amplitude and phase of a sinusoidal quantity using a specified projection; voltage and current in an ideal ohmic resistor are in phase under consistent reference directions.
  - Observable performance (DE): Konstruiert Zeiger aus Zeitfunktionen oder umgekehrt und kennzeichnet Projektion, Drehsinn, Einheiten und Amplitudenskalierung.
  - Observable performance (EN): Constructs phasors from time functions or vice versa and labels projection, rotation direction, units, and amplitude scales.
- `relative-phase`
  - Essential understanding (DE): Die relative Phase zwischen Spannung und Strom ist von der gemeinsamen Phase gegenüber dem Zeitursprung zu unterscheiden; Zeiger sind keine räumlichen Bewegungen von Ladungen.
  - Essential understanding (EN): Relative phase between voltage and current differs from their common phase relative to the time origin; phasors are not spatial charge trajectories.
  - Observable performance (DE): Deutet Gleichzeitigkeit von Nulldurchgängen und Extrema und überträgt die Darstellung auf einen geänderten Zeitursprung.
  - Observable performance (EN): Interprets simultaneous zero crossings and extrema and transfers the representation to a changed time origin.

**Coverage expectations**

- required expectations: `phasor-projection`, `relative-phase`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `time-to-phasor-and-back`: Zeitfunktion in ein Zeigerbild übersetzen und ein gegebenes gemeinsam gedrehtes Zeigerpaar zurück in Zeitfunktionen übertragen. / Translate a time function into phasors and convert a given commonly rotated phasor pair back into time functions.

**Application cases**

- `ohmic-sine`
  - Task demand (DE): Für einen ideal ohmschen Widerstand R=200 Ω in einem Kleinspannungsmodell gilt u(t)=4 sin(200πt) V, t in s, bei zueinander passenden Spannungs- und Strombezugsrichtungen. Bestimme i(t), zeichne beide Amplitudenzeiger und erkläre die Phasenbeziehung. Verwende Sinusprojektion auf die positive vertikale Achse; Winkel werden von der positiven horizontalen Achse gegen den Uhrzeigersinn gezählt, und die Zeiger rotieren mit positiver Kreisfrequenz gegen den Uhrzeigersinn.
  - Task demand (EN): For an ideal ohmic resistor R=200 Ω in a low-voltage model, u(t)=4 sin(200πt) V with t in s and mutually consistent voltage and current references. Determine i(t), draw both amplitude phasors, and explain their phase relationship. Use sine projection onto the positive vertical axis; angles are measured counterclockwise from the positive horizontal axis, and the phasors rotate counterclockwise with positive angular frequency.
  - Expected performance (DE): i(t)=0,020 sin(200πt) A. Ergänzend, nicht als zusätzliche Pflichtleistung: f=100 Hz und T=10 ms.  beide Zeiger sind gleichgerichtet und rotieren mit derselben Kreisfrequenz. Nulldurchgänge und Maxima sind gleichzeitig, Δφ=0. Zeigerlängen benötigen getrennte V- und A-Skalen; sie werden nicht als gleichartige räumliche Vektoren addiert.
  - Expected performance (EN): i(t)=0.020 sin(200πt) A. Supplementally, not as an additional required performance: f=100 Hz and T=10 ms.  the two phasors are aligned and rotate at the same angular frequency. Zero crossings and maxima coincide, Δφ=0. Lengths need separate V and A scales; the phasors are not added as like physical spatial vectors.
  - Understanding focus (DE): Ohmsches Verhalten als proportionale, phasengleiche Zeitverläufe darstellen.
  - Understanding focus (EN): Represent ohmic behaviour as proportional, in-phase time signals.
- `shifted-time-origin`
  - Task demand (DE): Bei Kosinusprojektion auf die positive horizontale Achse liegen die Amplitudenzeiger eines ideal ohmschen Kreises bei t=0 beide unter −60° zur Projektionsachse. Winkel werden gegen den Uhrzeigersinn gezählt; beide Zeiger rotieren gegen den Uhrzeigersinn mit derselben Kreisfrequenz ω>0. Bei zueinander passenden Spannungs- und Strombezugsrichtungen sind ihre Beträge 6 V und 30 mA. Gib Zeitfunktionen und Anfangswerte an. Eilt der Strom um 60° nach?
  - Task demand (EN): With cosine projection onto the positive horizontal axis, both amplitude phasors of an ideal ohmic circuit lie at −60° to the projection axis at t=0. Angles are measured counterclockwise; both phasors rotate counterclockwise at the same angular frequency ω>0. With mutually consistent voltage and current references, their magnitudes are 6 V and 30 mA. State time functions and initial values. Does the current lag by 60°?
  - Expected performance (DE): u=6 cos(ωt−π/3) V und i=0,030 cos(ωt−π/3) A; u(0)=3 V, i(0)=15 mA. Beide besitzen denselben Anfangswinkel, daher beträgt ihre relative Phase 0 und R=200 Ω. Der gemeinsame Winkel beschreibt den gewählten Zeitursprung, keinen Stromnachlauf.
  - Expected performance (EN): u=6 cos(ωt−π/3) V and i=0.030 cos(ωt−π/3) A; u(0)=3 V and i(0)=15 mA. Both share the same initial angle, so relative phase is 0 and R=200 Ω. The common angle describes the chosen time origin, not current lag.
  - Understanding focus (DE): Absolute Zeigerlage von einer physikalischen Phasendifferenz unterscheiden.
  - Understanding focus (EN): Distinguish absolute phasor orientation from physical phase difference.
## Page 6: Ein- und Ausschaltvorgänge analysieren

- Full learning-goal ID: `692db5b6-8be1-5c7b-8307-3a02afb21ea0`
- Goal fingerprint: `sha256:02ae80b7ac55ac76cc2831b8482f71c0d5e90200a83840d1bd73d8e6f7c737ad`
- Page fingerprint: `sha256:e46258ae996cb4b863e2d5dfa3d1317ea9e7295d5349ca49a56403d399ca224a`
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

Status: `needs_human_review`; profile fingerprint: `sha256:a5769dc130a1462af3c57e7e4088d48f793cbed97c1e4ffa2ed12dd2ff77a89b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `rl-current-is-continuous-and-exponential`
  - Essential understanding (DE): Im idealisierten linearen RL-Kreis kann der Spulenstrom nicht sprunghaft ändern. Widerstand und Selbstinduktion erzeugen exponentielle Ein- und Ausschaltverläufe mit physikalisch bestimmten Anfangs- und Grenzwerten. Dabei bezeichnet R den gesamten wirksamen Serienwiderstand des jeweiligen geschlossenen Strompfads; die Stromstetigkeit setzt endliche Spannungen voraus. Bei passiven Spannungsbezugsrichtungen in der markierten Stromrichtung gilt U_R(t) = R I(t), U_L(t) = U_Quelle(t) − R I(t) und U_Quelle = U_R + U_L. U_L ist die ideale induktive Klemmenspannung; die Selbstinduktions-EMK hat bei gleicher Umlaufrichtung das entgegengesetzte Vorzeichen. Nach einem Spannungssprung sind die Abweichungen vom jeweiligen Grenzwert exponentiell mit derselben Zeitkonstante.
  - Essential understanding (EN): In an idealized linear RL circuit, inductor current cannot change discontinuously. Resistance and self-induction produce exponential switch-on and switch-off transients with physically determined initial and limiting values. Here R denotes the total effective series resistance of the relevant closed current path; current continuity presumes finite voltages. With passive voltage reference directions along the marked current direction, U_R(t) = R I(t), U_L(t) = U_source(t) − R I(t), and U_source = U_R + U_L. U_L is the ideal inductive terminal voltage; the self-induced emf has the opposite sign for the same circulation direction. After a voltage step, deviations from the respective limiting values are exponential with the same time constant.
  - Observable performance (DE): Die lernende Person ordnet aus frischen Strom- und Spannungsdaten Schaltphase und Bauteilgrößen zu, bestimmt Anfangs- und Grenzwerte und verwirft einen Verlauf mit unzulässigem Stromsprung. Sie analysiert auch die quantitativen Verläufe U_R(t) und U_L(t) anhand dieser Zusammenhänge, nennt ihre Bezugsrichtungen und bestimmt Spannungsamplituden, Anfangs- und Grenzwerte sowie die gemeinsame Zeitskala. Sie koordiniert Strom- und Spannungskurven und prüft die Maschenbeziehung; beim Ausschalten in einem geschlossenen quellfreien resistiven Pfad gilt U_Quelle = 0 und damit U_L = −U_R.
  - Observable performance (EN): From fresh current and voltage data, the learner identifies switching phase and component quantities, determines initial and limiting values, and rejects a curve with an inadmissible current jump. The learner also analyzes quantitative U_R(t) and U_L(t) histories through these relations, states the reference directions, and determines voltage amplitudes, initial and limiting values, and the shared timescale. The learner coordinates current and voltage curves and checks the loop relation; during switch-off into a closed source-free resistive path, U_source = 0, hence U_L = −U_R.
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
  - Task demand (DE): Für einen RL-Kreis mit bekanntem R sind Strommesswerte nach dem Einschalten samt Unsicherheiten gegeben. Bestimme Endwert und τ, berechne L und prüfe, ob ein exponentielles Modell die Daten angemessen beschreibt. Die konstante Quellenspannung, der gesamte wirksame Serienwiderstand und der stromlose Anfangszustand sind angegeben. Bestimme zusätzlich die quantitativen Widerstands- und idealen Spulenklemmenspannungsverläufe mit ausdrücklich festgelegten passiven Polungsbezügen, einschließlich ihrer Amplituden, Anfangs- und Grenzwerte, und prüfe ihre Summe.
  - Task demand (EN): For an RL circuit with known R, current measurements after switch-on are supplied with uncertainties. Determine the final value and τ, calculate L, and check whether an exponential model adequately describes the data. The constant source voltage, total effective series resistance, and zero-current initial state are specified. Additionally determine quantitative resistor and ideal inductor terminal-voltage histories with explicitly declared passive polarity references, including amplitudes and initial and limiting values, and check their sum.
  - Expected performance (DE): Die lernende Person nutzt mehrere Datenpunkte oder einen Fit, erhält L = Rτ mit Einheit, vergleicht Abweichungen mit Unsicherheiten und formuliert eine begrenzte Modellentscheidung. Sie erhält aus demselben Modell U_R(t) = R I(t) und U_L(t) = U_Quelle − R I(t): U_R steigt von 0 auf U_Quelle, U_L fällt von U_Quelle auf 0, beide mit derselben Zeitkonstante. Die Summe bleibt U_Quelle. Sie verbindet die numerischen Spannungswerte mit den Stromdaten und kennzeichnet deren datenbedingte Genauigkeit; eine bloße Polungsangabe genügt nicht.
  - Expected performance (EN): The learner uses multiple data points or a fit, obtains L = Rτ with units, compares deviations with uncertainties, and states a bounded model judgment. From the same model, the learner obtains U_R(t) = R I(t) and U_L(t) = U_source − R I(t): U_R rises from 0 to U_source, while U_L falls from U_source to 0, both with the same time constant. Their sum remains U_source. The learner connects numerical voltage values to the current data and indicates their data-limited precision; merely stating polarity is insufficient.
  - Understanding focus (DE): Der Fall prüft die quantitative Verbindung von Kurve, Zeitkonstante und Bauteilwert. Die zugehörigen quantitativen Spannungskurven werden am selben Fall mitgeprüft.
  - Understanding focus (EN): The case tests the quantitative link among curve, time constant, and component value. The associated quantitative voltage curves are also assessed within the same case.
- `resistance-change-switch-off-transfer`
  - Task demand (DE): Derselbe geladene Induktor wird über zwei verschiedene Widerstände entladen. Prognostiziere vorab die relative Zeitkonstante, ordne zwei unbekannte Stromkurven zu und erkläre Anfangswert sowie Spannungspolung. Für beide geschlossenen quellfreien Entladepfade sind derselbe positive Anfangsstrom I₀ und der jeweilige gesamte wirksame Widerstand angegeben. Sage auch die Änderung des anfänglichen Spannungsbetrags voraus, ordne neue Widerstands- und Spulenspannungskurven zu und bestimme ihre quantitativen Verläufe mit festgelegten passiven Polungsbezügen.
  - Task demand (EN): The same energized inductor is discharged through two different resistors. Predict the relative time constants, assign two unlabeled current curves, and explain the initial value and voltage polarity. For both closed source-free discharge paths, the same positive initial current I₀ and the respective total effective resistance are specified. Also predict the change in initial voltage magnitude, assign fresh resistor and inductor voltage curves, and determine their quantitative histories with declared passive polarity references.
  - Expected performance (DE): Die lernende Person erkennt τ = L/R, ordnet dem größeren R den schnelleren Abfall zu, erhält den kontinuierlichen gemeinsamen Anfangsstrom und begründet die Ausschaltpolung aus Selbstinduktion. Mit I(t) = I₀ exp(−t/τ) bestimmt sie U_R(t) = R I₀ exp(−t/τ) und U_L(t) = −R I₀ exp(−t/τ). Größeres R erzeugt bei gleichem I₀ und L den größeren anfänglichen Spannungsbetrag und die kürzere Zeitkonstante; beide Spannungen gehen gegen 0 und ihre Summe ist 0. Sie begründet, warum die Spulenklemmenspannung ihre Polung wechseln darf, obwohl der Strom stetig bleibt.
  - Expected performance (EN): The learner uses τ = L/R, assigns faster decay to the larger R, preserves the common continuous initial current, and justifies switch-off polarity from self-induction. Using I(t) = I₀ exp(−t/τ), the learner determines U_R(t) = R I₀ exp(−t/τ) and U_L(t) = −R I₀ exp(−t/τ). With I₀ and L fixed, larger R gives a larger initial voltage magnitude and a shorter time constant; both voltages tend to 0 and sum to 0. The learner explains why the inductor terminal voltage may reverse polarity while current remains continuous.
  - Understanding focus (DE): Der Transfer prüft Parameterwirkung und physikalische Randwerte an einer anderen Schaltphase. Der quantitative Spannungsbetrag und seine Zeitentwicklung bleiben mit derselben Parameteränderung verbunden.
  - Understanding focus (EN): The transfer tests parameter effects and physical boundary values in a different switching phase. Quantitative voltage magnitude and its time dependence stay linked to the same parameter change.
## Page 7: Schwingungsgleichung lösen

- Full learning-goal ID: `b2fb9a25-4d26-5cf2-a917-823909dcb6bd`
- Goal fingerprint: `sha256:7d88450b7bd26dad77ae8935a9f74a1ec762f6446ae62ea3e64b4bac2093f5b4`
- Page fingerprint: `sha256:bf91d8ddaff57ff6219e66a477624710d792c054bf20e13482255cd164df40cb`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q2 Schwingungen, Induktion und mechanische Wellen > Mechanische Schwingungen

### Canonical description

Die lernende Person kann die lineare Differenzialgleichung einer ungedämpften harmonischen Schwingung für gegebene Anfangsbedingungen lösen und die Lösung anhand von Amplitude, Kreisfrequenz und Phase physikalisch deuten.

### Visualization

/assets/goal-visualizations/physik/b2fb9a25-4d26-5cf2-a917-823909dcb6bd/b2fb9a25-4d26-5cf2-a917-823909dcb6bd.jpg

- original digest: `sha256:fbc8a7abc93029587515f193f34e4e268099b59666f7effd3e43a1574fe6d6e7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Transformierte Sinus- und Kosinusfunktionen mit der Kettenregel ableiten — `58d2f963-4fb9-550d-a832-f5ac60808900` (outside this book)
- Harmonische Schwingung verstehen — `d03f1cb6-c224-53db-ad91-76cc7827978d` (outside this book)
- Methode: Lösungsansatz für DGL (Exponentialfunktion) — `09f2cdbd-64e0-55d2-ada7-1190f4fd50df` (outside this book)

### Direct reverse prerequisites outside this book

- Q2-Klausuraufgaben Physik selbstständig lösen — `50328a4f-91e8-5c8b-8d61-8f9c98a5cddf` (outside this book)
- Vorschlag B (LK) - Schwingungsdiagnostik mit Grenzflächenanalyse — `99954602-819d-57f3-9c09-737e69f162df` (outside this book)
- Resonanz, Daempfung und Schwingungsgleichung — `d350cfa7-c606-501e-abf7-1c9e546b266b` (outside this book)
- Vorschlag B (LK) - Aktives Schwingungsmanagement — `fa333c2f-3150-5831-a649-28615164b2f2` (outside this book)
- Überlagerungen unabhängiger Schwingungen qualitativ beschreiben — `4888444f-4520-437a-9ba7-e74e8f8ed129` (outside this book)
- Differentialgleichung des elektromagnetischen Schwingkreises mit Ansatz lösen — `a7255b83-336c-4d42-ba5c-bc2f6248ea36` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:33bf6190568eb4677321fb250f2c93619f056fca72503806817f9f4ac66aff08`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `independent-review-a-understanding`
  - Essential understanding (DE): Die lernende Person versteht, dass die lineare Gleichung x''(t) + ω²x(t) = 0 im idealisierten ungedämpften Modell eine sinusförmige Bewegung um die Gleichgewichtslage beschreibt: Die Kreisfrequenz bestimmt die Zeitskala, während Anfangsauslenkung und Anfangsgeschwindigkeit Amplitude und Phase der konkreten Lösung festlegen.
  - Essential understanding (EN): The learner understands that the linear equation x''(t) + ω²x(t) = 0 describes sinusoidal motion about equilibrium in the idealized undamped model: angular frequency sets the time scale, while initial displacement and initial velocity determine the amplitude and phase of the particular solution.
  - Observable performance (DE): Zu vorgegebenen Anfangswerten löst die lernende Person die Differenzialgleichung selbstständig, bestimmt Amplitude und Phase mit konsistenter Vorzeichenkonvention, prüft Lösung und Anfangswerte durch Einsetzen und erläutert an Gleichung und Zeitdiagramm die physikalische Bedeutung von Amplitude, Kreisfrequenz und Phase.
  - Observable performance (EN): For specified initial values, the learner independently solves the differential equation, determines amplitude and phase using a consistent sign convention, verifies the solution and initial values by substitution, and explains from the equation and a time graph the physical meaning of amplitude, angular frequency, and phase.
- `independent-review-b-understanding`
  - Essential understanding (DE): Die allgemeine Lösung der ungedämpften Schwingungsgleichung x''+ω₀²x=0 kann gleichwertig als Linearkombination von Sinus und Kosinus oder als x(t)=A cos(ω₀t+φ) dargestellt werden; zwei Anfangsbedingungen bestimmen die beiden Integrationskonstanten eindeutig, während A die maximale Auslenkung, ω₀ die Zeitskala der Schwingung und φ den Anfangszustand im Zyklus beschreibt.
  - Essential understanding (EN): The general solution of the undamped oscillator equation x''+ω₀²x=0 can equivalently be represented as a linear combination of sine and cosine or as x(t)=A cos(ω₀t+φ); two initial conditions uniquely determine the two integration constants, while A describes the maximum displacement, ω₀ the oscillator's time scale, and φ the initial state within the cycle.
  - Observable performance (DE): Die lernende Person löst die gegebene Differenzialgleichung, setzt Auslenkung und Geschwindigkeit zum Anfangszeitpunkt ein, bestimmt die Konstanten einschließlich eines zum Vorzeichen von x(0) und v(0) passenden Phasenwinkels und prüft durch Ableiten sowohl die Gleichung als auch beide Anfangsbedingungen; anschließend deutet sie A, ω₀ und φ mit Größen, Einheiten und Bezug auf die gewählte Zeit- und Koordinatenkonvention.
  - Observable performance (EN): The learner solves the given differential equation, applies the initial displacement and velocity, determines the constants including a phase angle consistent with the signs of x(0) and v(0), and checks both the equation and the two initial conditions by differentiation; the learner then interprets A, ω₀, and φ using physical quantities, units, and the chosen time and coordinate conventions.

**Coverage expectations**

- required expectations: `independent-review-a-understanding`, `independent-review-b-understanding`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-initial-state-and-reference-convention`: Anfangsauslenkung, Anfangsgeschwindigkeit, Zeitnullpunkt oder Koordinatenrichtung werden so verändert, dass Amplitude und Phase neu und mit konsistenter Vorzeichenkonvention bestimmt werden müssen. / Initial displacement, initial velocity, time origin, or coordinate direction is changed so that amplitude and phase must be determined anew using a consistent sign convention.
- `equivalent-solution-representation`: Die Lösung wird zwischen Sinus-Kosinus-Linearkombination, Amplituden-Phasen-Form und Zeitdiagramm übersetzt; die Gleichwertigkeit wird über Gleichung und Anfangsbedingungen geprüft. / The solution is translated among a sine-cosine linear combination, amplitude-phase form, and time graph; equivalence is checked against the equation and initial conditions.
- `undamped-model-validity-boundary`: Ein Fall erfüllt das ungedämpfte lineare Modell, während ein zweiter Datensatz oder Verlauf eine erkennbare Dämpfung oder andere Modellabweichung enthält, die als Grenze der verwendeten Lösung benannt werden muss. / One case satisfies the linear undamped model, while a second data set or trajectory contains detectable damping or another model deviation that must be identified as a limit of the solution used.

**Application cases**

- `fresh-independent-case-a`
  - Task demand (DE): Bei verschobenem Zeitnullpunkt oder umgekehrter Koordinatenrichtung bestimmt die lernende Person die neue Phasendarstellung, erkennt, welche Größen unverändert bleiben, und sagt den zugehörigen Verlauf von Auslenkung und Geschwindigkeit voraus, ohne nur Zahlen in eine bekannte Lösung einzusetzen.
  - Task demand (EN): With a shifted time origin or reversed coordinate direction, the learner determines the new phase representation, identifies which quantities remain unchanged, and predicts the corresponding displacement and velocity histories without merely substituting new numbers into a familiar solution.
  - Expected performance (DE): Zu vorgegebenen Anfangswerten löst die lernende Person die Differenzialgleichung selbstständig, bestimmt Amplitude und Phase mit konsistenter Vorzeichenkonvention, prüft Lösung und Anfangswerte durch Einsetzen und erläutert an Gleichung und Zeitdiagramm die physikalische Bedeutung von Amplitude, Kreisfrequenz und Phase.
  - Expected performance (EN): For specified initial values, the learner independently solves the differential equation, determines amplitude and phase using a consistent sign convention, verifies the solution and initial values by substitution, and explains from the equation and a time graph the physical meaning of amplitude, angular frequency, and phase.
  - Understanding focus (DE): Die lernende Person versteht, dass die lineare Gleichung x''(t) + ω²x(t) = 0 im idealisierten ungedämpften Modell eine sinusförmige Bewegung um die Gleichgewichtslage beschreibt: Die Kreisfrequenz bestimmt die Zeitskala, während Anfangsauslenkung und Anfangsgeschwindigkeit Amplitude und Phase der konkreten Lösung festlegen.
  - Understanding focus (EN): The learner understands that the linear equation x''(t) + ω²x(t) = 0 describes sinusoidal motion about equilibrium in the idealized undamped model: angular frequency sets the time scale, while initial displacement and initial velocity determine the amplitude and phase of the particular solution.
- `fresh-independent-case-b`
  - Task demand (DE): Für einen unabhängig vorgelegten Oszillator, der statt aus einer Ruhelage bei maximaler Auslenkung nun beim Nulldurchgang mit vorgegebener Bewegungsrichtung startet, sagt die lernende Person zunächst die qualitative Änderung von Amplitude und Phase voraus, bestimmt danach die Lösung in einer anderen äquivalenten Sinus-Kosinus-Darstellung und weist die Übereinstimmung beider Darstellungen nach.
  - Task demand (EN): For an independently presented oscillator that starts at equilibrium with a specified direction of motion rather than from rest at maximum displacement, the learner first predicts the qualitative change in amplitude and phase, then determines the solution in a different but equivalent sine-cosine representation and demonstrates that the two representations agree.
  - Expected performance (DE): Die lernende Person löst die gegebene Differenzialgleichung, setzt Auslenkung und Geschwindigkeit zum Anfangszeitpunkt ein, bestimmt die Konstanten einschließlich eines zum Vorzeichen von x(0) und v(0) passenden Phasenwinkels und prüft durch Ableiten sowohl die Gleichung als auch beide Anfangsbedingungen; anschließend deutet sie A, ω₀ und φ mit Größen, Einheiten und Bezug auf die gewählte Zeit- und Koordinatenkonvention.
  - Expected performance (EN): The learner solves the given differential equation, applies the initial displacement and velocity, determines the constants including a phase angle consistent with the signs of x(0) and v(0), and checks both the equation and the two initial conditions by differentiation; the learner then interprets A, ω₀, and φ using physical quantities, units, and the chosen time and coordinate conventions.
  - Understanding focus (DE): Die allgemeine Lösung der ungedämpften Schwingungsgleichung x''+ω₀²x=0 kann gleichwertig als Linearkombination von Sinus und Kosinus oder als x(t)=A cos(ω₀t+φ) dargestellt werden; zwei Anfangsbedingungen bestimmen die beiden Integrationskonstanten eindeutig, während A die maximale Auslenkung, ω₀ die Zeitskala der Schwingung und φ den Anfangszustand im Zyklus beschreibt.
  - Understanding focus (EN): The general solution of the undamped oscillator equation x''+ω₀²x=0 can equivalently be represented as a linear combination of sine and cosine or as x(t)=A cos(ω₀t+φ); two initial conditions uniquely determine the two integration constants, while A describes the maximum displacement, ω₀ the oscillator's time scale, and φ the initial state within the cycle.
## Page 8: Induktionsgesetz in Ableitungsform anwenden

- Full learning-goal ID: `d18d4190-ddc1-5181-b1b6-e79947b737c2`
- Goal fingerprint: `sha256:e779dacc231c01467f281b8dbe76aab4e0376a814c360d70709772e9afbded29`
- Page fingerprint: `sha256:14d140b34a25758dfc5500f1f9cdca2c6b430b2186ced0edc2522d1bc9ebc456`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q2 Schwingungen, Induktion und mechanische Wellen > Induktion und elektromagnetische Schwingungen

### Canonical description

Die lernende Person kann bei einem differenzierbaren zeitabhängigen magnetischen Fluss die momentane Induktionsspannung einer Spule mit N gleichartigen Windungen mit U_ind(t) = −N · dΦ(t)/dt bestimmen und den zeitlichen Spannungsverlauf physikalisch deuten.

### Visualization

/assets/goal-visualizations/physik/d18d4190-ddc1-5181-b1b6-e79947b737c2/d18d4190-ddc1-5181-b1b6-e79947b737c2.jpg

- original digest: `sha256:42ae30f63a9d1f48b08dc77f1cd052fe542225cd3b2a3c0e8527aadc183531a6`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Transformierte Sinus- und Kosinusfunktionen mit der Kettenregel ableiten — `58d2f963-4fb9-550d-a832-f5ac60808900` (outside this book)
- Induktionsgesetz und Lenz’sche Regel — `eb1ea150-ec6c-5000-bce3-f46c820dccf8` (outside this book)

### Direct reverse prerequisites outside this book

- Q2-Klausuraufgaben Physik selbstständig lösen — `50328a4f-91e8-5c8b-8d61-8f9c98a5cddf` (outside this book)
- Vorschlag A (LK) - Adaptive Ladespur (Felder/Induktion) — `86015397-23c4-5ed7-b893-bc619ec961a8` (outside this book)
- Selbstinduktion, Einschaltvorgaenge und Feldenergie — `acf192a8-c398-51dc-a03b-672ab55df957` (outside this book)
- Vorschlag A (LK) - Feldregelung und Transformatorwirkungsgrad — `cf892388-6cb4-5981-adf2-7168aeb948b1` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1ac2f1cfabf2183b954b4050c7e0f9047fd2e462b099b2e3692f0a2a07b10f2d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `instantaneous-voltage-is-negative-flux-derivative`
  - Essential understanding (DE): Für differenzierbaren Fluss gilt U_ind(t) = −N dΦ/dt. Der Spannungsbetrag misst die momentane Flussänderungsrate, nicht den Flusswert selbst; konstanter Fluss liefert null Spannung.
  - Essential understanding (EN): For differentiable flux, U_ind(t) = −N dΦ/dt. Voltage magnitude measures the instantaneous rate of flux change, not the flux value itself; constant flux gives zero voltage.
  - Observable performance (DE): Die lernende Person wählt für eine neue Funktion oder einen glatten Graphen die Ableitungsform, bestimmt U_ind(t) mit Einheit und erklärt Nullstellen aus waagerechter Flussteigung.
  - Observable performance (EN): For a fresh function or smooth graph, the learner selects the derivative form, determines U_ind(t) with units, and explains zeros from horizontal flux slope.
- `voltage-graph-translates-slope-and-sign`
  - Essential understanding (DE): Maxima, Nulldurchgänge und Vorzeichenwechsel von U_ind entsprechen Steilheit und Vorzeichen der Φ-Steigung unter einer festen Orientierung. Eine große Flussamplitude erzeugt nicht automatisch große Spannung, wenn sie sich langsam ändert.
  - Essential understanding (EN): Maxima, zero crossings, and sign changes of U_ind correspond to the magnitude and sign of the slope of Φ under a fixed orientation. Large flux amplitude does not automatically mean large voltage if it changes slowly.
  - Observable performance (DE): Die lernende Person skizziert aus einem unbekannten Φ(t)-Graphen den Spannungsverlauf, begründet charakteristische Punkte über Tangentensteigungen und prüft Vorzeichen und N-Skalierung.
  - Observable performance (EN): From an unfamiliar Φ(t) graph, the learner sketches the voltage curve, justifies characteristic points through tangent slopes, and checks sign and N scaling.
- `frequency-shape-and-differentiability-bound-transfer`
  - Essential understanding (DE): Frequenz und Kurvenform bestimmen die Änderungsrate; bei höherer Frequenz wächst bei gleicher Flussamplitude typischerweise der Spannungsmaßstab. An nicht differenzierbaren Stellen ist die gebundene momentane Ableitungsform nicht unmittelbar definiert.
  - Essential understanding (EN): Frequency and curve shape determine rate of change; at higher frequency, with the same flux amplitude, the voltage scale typically increases. At nondifferentiable points, the bound instantaneous derivative form is not directly defined.
  - Observable performance (DE): Für veränderte Frequenz, Phase oder glatte Kurvenform prognostiziert und berechnet die lernende Person U_ind; bei einem Knick benennt sie die verletzte Voraussetzung statt einen beliebigen Momentanwert zu erfinden.
  - Observable performance (EN): For changed frequency, phase, or smooth curve shape, the learner predicts and calculates U_ind; at a corner, the learner identifies the violated assumption instead of inventing an instantaneous value.

**Coverage expectations**

- required expectations: `instantaneous-voltage-is-negative-flux-derivative`, `voltage-graph-translates-slope-and-sign`, `frequency-shape-and-differentiability-bound-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `flux-form`: Sinusförmiger, polynomialer oder glatter abschnittsweise dargestellter Fluss / Sinusoidal, polynomial, or smoothly piecewise-represented flux
- `time-parameter`: Frequenz, Phase und zeitliche Streckung bei gleicher Flussamplitude / Frequency, phase, and time stretching at equal flux amplitude
- `regularity`: Differenzierbarer Verlauf gegenüber ausdrücklich nicht differenzierbarem Knick / Differentiable curve versus an explicitly nondifferentiable corner

**Application cases**

- `sinusoidal-flux-phase`
  - Task demand (DE): Für Φ(t) = Φ0 cos(ωt) und N Windungen bestimme U_ind(t), skizziere beide Verläufe und erkläre Amplitude, Phasenlage und Nulldurchgänge physikalisch.
  - Task demand (EN): For Φ(t) = Φ0 cos(ωt) and N turns, determine U_ind(t), sketch both curves, and physically explain amplitude, phase relation, and zero crossings.
  - Expected performance (DE): Die lernende Person erhält U_ind = NωΦ0 sin(ωt) unter der festgelegten Konvention, verbindet den ω-Faktor mit Änderungsrate und ordnet Spannungsnullen den Flussextrema zu.
  - Expected performance (EN): The learner obtains U_ind = NωΦ0 sin(ωt) under the specified convention, links the ω factor to rate of change, and associates voltage zeros with flux extrema.
  - Understanding focus (DE): Der Fall prüft Ableitung und physikalische Graphdeutung gemeinsam.
  - Understanding focus (EN): The case jointly tests differentiation and physical graph interpretation.
- `smooth-pulse-and-corner-audit`
  - Task demand (DE): Ein glatter magnetischer Flusspuls und ein zweiter Verlauf mit idealisiertem Knick werden vorgegeben. Skizziere für den glatten Puls U_ind(t), identifiziere Maxima und Vorzeichenwechsel und beurteile den Momentanwert genau am Knick des zweiten Verlaufs.
  - Task demand (EN): A smooth magnetic-flux pulse and a second curve with an idealized corner are supplied. Sketch U_ind(t) for the smooth pulse, identify maxima and sign changes, and judge the instantaneous value exactly at the corner of the second curve.
  - Expected performance (DE): Die lernende Person leitet den glatten Verlauf qualitativ aus der Steigung ab, lokalisiert größte Beträge an steilsten Stellen und erklärt, dass die klassische Ableitung am Knick keinen eindeutigen Momentanwert liefert.
  - Expected performance (EN): The learner derives the smooth voltage qualitatively from slope, locates largest magnitudes at steepest points, and explains that the classical derivative gives no unique instantaneous value at the corner.
  - Understanding focus (DE): Der Transfer prüft Kurvenform und die explizite Differenzierbarkeitsgrenze.
  - Understanding focus (EN): The transfer tests curve shape and the explicit differentiability limit.

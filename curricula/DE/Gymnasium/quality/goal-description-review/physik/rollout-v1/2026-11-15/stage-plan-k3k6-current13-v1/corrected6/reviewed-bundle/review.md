# AI review input: Physik K3/K6 – sechs geänderte Reviewziele

- Book ID: `physics-k3k6-corrected-current6-20261115-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:20dea5324f0fa57e171704e4229fc8821107a2562650f082f24080e8ea550150`
- Selected goals: 6

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Bewegungen mit Videoanalyse untersuchen

- Full learning-goal ID: `d67502e3-5e0a-595b-a24b-65b1c40de36e`
- Goal fingerprint: `sha256:0d5cef647aee1e97824bc8d632e7f0154020a6e5914129bf9027d0cf333cb6db`
- Page fingerprint: `sha256:1049e8e4177e127b3208c85bea6d853b85da284cb7175182a13c145d1482795a`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann ein Bewegungsvideo räumlich und zeitlich kalibrieren, daraus Orts-Zeit-Daten sowie s(t)- und v(t)-Diagramme gewinnen und Modelle einer gleichförmigen oder geworfenen Bewegung unter Berücksichtigung der Messunsicherheit prüfen.

### Visualization

/assets/goal-visualizations/physik/d67502e3-5e0a-595b-a24b-65b1c40de36e/d67502e3-5e0a-595b-a24b-65b1c40de36e.jpg

- original digest: `sha256:beb75ed3491bf1a8f2d1f01813fe38cb36d54e13ee8af2a831481b36870df78e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Digitale Messdaten mit Sensoren erfassen — `691c11d0-fa6a-5d2e-a19c-086e89c3c233` (outside this book)
- Mittelwert und Streuung aus Messreihen bestimmen — `f23fdfa9-38b6-5157-8301-ed302476c456` (outside this book)
- Gleichmäßig beschleunigte Bewegung und Beschleunigung — `e4b38061-1f28-43ad-8371-a3e7c0e81856` (outside this book)

### Direct reverse prerequisites outside this book

- Videoanalyse: eigene Kalibrierung und unabhängiger Wurftransfer — `6345871e-eab4-59c1-a3b6-8456ab9bd7df` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:c97f881ee0732c94a151b245994129243de16bd68b07433ff93746aa9619b543`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `calibrate-and-derive-motion-data`
  - Essential understanding (DE): Pixelkoordinaten und Frame-Nummern werden erst durch räumlichen Maßstab, Zeitbasis, Achsenwahl und Perspektivkontrolle zu physikalischen Orts-Zeit-Daten. Numerisch abgeleitete Geschwindigkeiten verstärken Positionsrauschen.
  - Essential understanding (EN): Pixel coordinates and frame numbers become physical position-time data only through spatial scale, time base, axis choice, and perspective control. Numerically derived velocities amplify positional noise.
  - Observable performance (DE): Die lernende Person kalibriert ein neues reales Video, verfolgt einen definierten Punkt, dokumentiert Einheiten und Unsicherheiten und erzeugt aus der Rohdatentabelle beschriftete s(t)- sowie v(t)-Diagramme. Sie trennt Messpunkte, numerische Intervallmittel mit ihrem Zeitfensterbezug und gegebenenfalls eingezeichnete Modellkurven nachvollziehbar.
  - Observable performance (EN): The learner calibrates a fresh real video, tracks a defined point, documents units and uncertainties, and generates labelled s(t) and v(t) graphs from the raw table. They transparently distinguish measured points, numerical interval averages with their window relation, and any plotted model curves.
- `test-motion-model-against-data`
  - Essential understanding (DE): Ein Bewegungsmodell wird durch Verlauf, Parameter, Residuen und Unsicherheiten geprüft. Perspektive, Tracking, Bildrate und reale Kräfte können unterschiedliche Abweichungsmuster erzeugen.
  - Essential understanding (EN): A motion model is tested through trend, parameters, residuals, and uncertainties. Perspective, tracking, frame rate, and real forces can produce different patterns of deviation.
  - Observable performance (DE): Die lernende Person wählt zwischen gleichförmigem und Wurfmodell, passt oder vergleicht das Modell mit eigenen Daten und trennt auflösbare Abweichungen von begründeten Ursachenhypothesen. Sie lässt Perspektive gegenüber realer Beschleunigung ausdrücklich offen, wenn die Daten nicht unterscheiden; eine eindeutige Zuordnung benötigt zusätzliche kontrollierte geometrische oder unabhängige Bewegungsinformation.
  - Observable performance (EN): The learner chooses between uniform-motion and projectile models, fits or compares the model with their own data, and distinguishes resolved deviations from justified causal hypotheses. They explicitly leave perspective versus real acceleration unresolved when the data cannot distinguish them; a unique attribution requires additional controlled geometric or independent motion information.

**Coverage expectations**

- required expectations: `calibrate-and-derive-motion-data`, `test-motion-model-against-data`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `motion-type`: Geradlinig gleichförmige Bewegung oder zweidimensionaler Wurf / Uniform rectilinear motion or two-dimensional projectile motion
- `camera-condition`: Nahezu orthogonale oder perspektivisch verzerrte Aufnahme / Nearly orthogonal or perspective-distorted recording
- `sampling-quality`: Hohe oder geringe Bildrate und unterschiedlich starkes Trackingrauschen / High or low frame rate and different levels of tracking noise

**Application cases**

- `cart-video-model-test`
  - Task demand (DE): Ein neues reales Wagenvideo enthält Maßstab, tatsächliche Zeitbasis und eine möglicherweise schräg stehende Kamera. Kalibriere die Bewegung, gewinne s(t) und v(t) und prüfe ein gleichförmiges Modell mit Residuen und Messgrenzen. Beurteile, ob die vorhandene Information Perspektive und reale Beschleunigung unterscheiden kann; ein begründetes Offenlassen ist eine vollständige gültige Antwort. Benenne, welche zusätzliche kontrollierte Information eine Entscheidung ermöglichen würde.
  - Task demand (EN): A fresh real cart video includes a scale, actual timing, and a possibly oblique camera. Calibrate the motion, obtain s(t) and v(t), and test a uniform-motion model using residuals and measurement limits. Assess whether the available information distinguishes perspective from real acceleration; a justified unresolved conclusion is a fully valid answer. State which additional controlled information would enable a decision.
  - Expected performance (DE): Die lernende Person legt eine geeignete Achse fest, korrigiert oder begrenzt die Perspektive, erhält physikalische Einheiten, passt eine Gerade an s(t) und deutet systematische gegenüber zufälligen Residuen. Die aus derselben eigenen Rohdatentabelle erzeugten Orts- und Geschwindigkeitsdiagramme werden mit Achsen, Einheiten sowie Messdaten-/Modellunterscheidung vorgelegt. Ein Residuenmuster allein beweist keine Ursache. Ohne unabhängige Kontrolle bleibt die Ursache begründet offen. Eine geometrisch überprüfte Ausrichtung/ebene Kalibrierung oder unabhängige Orts-/Geschwindigkeitsmessung kann eine Hypothese prüfen; eine bloß zweite ungeprüfte Aufnahme genügt nicht automatisch.
  - Expected performance (EN): The learner defines a suitable axis, corrects or bounds perspective, obtains physical units, fits a line to s(t), and interprets systematic versus random residuals. The position and velocity graphs generated from the same own raw table are submitted with axes, units, and measured-data/model distinction. A residual pattern alone establishes no cause. Without an independent control the cause remains justifiably unresolved. Geometrically verified alignment/planar calibration or independent position/velocity measurements can test a hypothesis; merely adding another unchecked video is not automatically sufficient.
  - Understanding focus (DE): Der Fall prüft Kalibrierung und Diagnose eines Modells aus frischen Daten.
  - Understanding focus (EN): The case assesses calibration and diagnosis of a model from fresh data.
- `projectile-video-components`
  - Task demand (DE): Ein zweidimensionales Wurfvideo mit unbekanntem Startzeitpunkt und bekannter Bildrate wird vorgelegt. Kalibriere beide Achsen, bestimme x(t), y(t), v_x(t) und v_y(t) und prüfe horizontale Gleichförmigkeit sowie vertikale konstante Beschleunigung.
  - Task demand (EN): A two-dimensional projectile video with unknown start time and known frame rate is supplied. Calibrate both axes, determine x(t), y(t), v_x(t), and v_y(t), and test horizontal uniform motion and vertical constant acceleration.
  - Expected performance (DE): Die lernende Person wählt und begründet den Zeitnullpunkt, kalibriert eine neue reale Wurfaufnahme, schätzt die getrennten Komponentenparameter selbst und dokumentiert Fits mit Einheiten, Residuen sowie einer quantitativ begrenzten Parametersensitivität aus Re-Markierung und Kalibrierung. Einen Abwurfzeitpunkt rekonstruiert sie nur mit ausreichender Zusatzinformation; gelieferte Modellparameter oder synthetische Daten ersetzen den realen Fit nicht. Zusätzlich legt sie die aus derselben echten Auswertung erzeugten x(t)-, y(t)-, v_x(t)- und v_y(t)-Diagramme mit Einheiten, erkennbaren Messpunkten/Intervallmitteln und getrennten Modellkurven vor; Mittelpunktzuordnung wird gegebenenfalls als Näherung begrenzt.
  - Expected performance (EN): The learner chooses and justifies time zero, calibrates a fresh real projectile recording, independently estimates separate component parameters, and documents fits with units, residuals, and quantitatively bounded parameter sensitivity from re-marking and calibration. Launch time is reconstructed only with sufficient additional information; supplied model parameters or synthetic data do not replace the real fit. They additionally submit x(t), y(t), v_x(t), and v_y(t) graphs generated from that same actual analysis, with units, identifiable measured points/interval averages, and separate model curves; midpoint assignment is qualified as an approximation where used.
  - Understanding focus (DE): Der unabhängige Transfer prüft dieselbe Datenkette in einem anderen Bewegungsmodell.
  - Understanding focus (EN): The independent transfer assesses the same data chain in a different motion model.
## Page 2: Elektrische Stromstärke als Ladungsrate deuten

- Full learning-goal ID: `bbee4c52-4e95-5529-990f-706aa99316a3`
- Goal fingerprint: `sha256:e318637bf0f1eb11f347167b4ca4ea7e6c67ceeb6e5a124d4efbdb7369d9c8a8`
- Page fingerprint: `sha256:64f3ec01d3c3226a603611bb0f28c68fb462f0256f332e612eb71058b2394789`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann die mittlere elektrische Stromstärke als netto durch einen festgelegten Querschnitt transportierte Ladung pro Zeitintervall mit I = ΔQ/Δt deuten, Berechnungen durchführen und den Einheitenzusammenhang 1 A = 1 C/s erklären.

### Visualization

/assets/goal-visualizations/physik/bbee4c52-4e95-5529-990f-706aa99316a3/bbee4c52-4e95-5529-990f-706aa99316a3.jpg

- original digest: `sha256:f31cfc45fb7f351f4cfa70885b4586d4b3c7483e11e52c6897e1e32daa7b6150`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Coulomb'sches Gesetz — `8da5c981-8216-5fcd-a393-19f392ae2006` (page 3)

### Prerequisites outside this book

- Ladungsphänomene und Reibungselektrizität — `a6e48b88-51ed-5942-bdb8-8d2192652e0d` (outside this book)
- Messwertänderungen pro Zeitintervall bestimmen — `13b338eb-f761-5817-9058-11043b9cb253` (outside this book)

### Direct reverse prerequisites outside this book

- Arbeit, Spannung und Potenzial im E-Feld — `1730c01d-8c85-57df-b031-c11e2a0511b1` (outside this book)
- Stromstärke: Nettoänderung, Puls und Zyklus — `28884133-b448-5eb2-a589-8907a78d7687` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b5a4bdf6e4d4d938b7f88c12849ebb6e5161696fd8e90c0ef1d5708a79e26b77`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `interpret-average-current`
  - Essential understanding (DE): Die mittlere Stromstärke ist die netto durch einen festgelegten Querschnitt in einem festgelegten Zeitintervall transportierte Ladung, I = ΔQ/Δt. Die Bezugsrichtung bestimmt das Vorzeichen; 1 A und 1 C/s sind dieselbe Einheit.
  - Essential understanding (EN): Average current is the net charge transported through a specified cross-section in a specified interval, I = ΔQ/Δt. The reference direction determines the sign; 1 A and 1 C/s are the same unit.
  - Observable performance (DE): Die lernende Person markiert Querschnitt, Zeitintervall und Richtung, berechnet I mit Einheit und erklärt das Ergebnis als Ladungsmenge pro Zeit statt nur als Zahlenwert.
  - Observable performance (EN): The learner marks the cross-section, interval, and direction, calculates I with units, and explains the result as charge per time rather than only as a number.
- `compare-intervals-and-rearrange`
  - Essential understanding (DE): Bei zeitlich ungleichmäßigem Transport hängt der Mittelwert vom gewählten Intervall ab. Gleiche Gesamtladung kann bei anderer Dauer eine andere mittlere Stromstärke bedeuten; die Beziehung kann physikalisch nach Q oder t umgestellt werden.
  - Essential understanding (EN): For time-varying transfer, the average depends on the chosen interval. Equal total charge can imply a different average current over a different duration; the relation can be physically rearranged for Q or t.
  - Observable performance (DE): Die lernende Person bestimmt aus Ladungs-Zeit-Daten mehrere Mittelwerte, vergleicht sie, kehrt die Beziehung für eine neue Zielgröße um und begründet Vorzeichen und Intervallwahl.
  - Observable performance (EN): The learner determines several averages from charge-time data, compares them, rearranges the relation for a fresh target quantity, and justifies sign and interval choice.

**Coverage expectations**

- required expectations: `interpret-average-current`, `compare-intervals-and-rearrange`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `time-profile`: Gleichmäßiger oder gepulster Ladungstransport / Steady or pulsed charge transfer
- `reference-direction`: Gleiche oder umgekehrte Bezugsrichtung / Same or reversed reference direction
- `known-quantity`: Gesuchte Stromstärke, Ladung oder Zeit / Unknown current, charge, or time

**Application cases**

- `charge-time-data-intervals`
  - Task demand (DE): Ein Q(t)-Datensatz zeigt ungleichmäßigen Ladungstransport durch einen markierten Leiterquerschnitt. Bestimme die mittlere Stromstärke für zwei Intervalle, erkläre ihre Unterschiede und gib die Bedeutung eines negativen Werts bei der gewählten Richtung an.
  - Task demand (EN): A Q(t) data set shows non-uniform charge transfer through a marked conductor cross-section. Determine average current for two intervals, explain their difference, and state the meaning of a negative value for the chosen direction.
  - Expected performance (DE): Die lernende Person bildet passende ΔQ/Δt-Werte mit C/s beziehungsweise A, verwendet Nettoänderungen und deutet Vorzeichen und Intervallabhängigkeit physikalisch.
  - Expected performance (EN): The learner forms appropriate ΔQ/Δt values in C/s or A, uses net changes, and physically interprets sign and interval dependence.
  - Understanding focus (DE): Der Fall prüft Mittelwertbedeutung an Daten statt isolierter Formelwerte.
  - Understanding focus (EN): The case assesses the meaning of an average using data rather than isolated formula values.
- `equal-charge-different-pulses`
  - Task demand (DE): Zwei Geräte übertragen pro Zyklus dieselbe Ladung, aber mit unterschiedlich langen Pulsen und Pausen. Berechne Puls- und Zyklusmittelwerte, vergleiche sie und bestimme die Zeit für eine vorgegebene Gesamtladung.
  - Task demand (EN): Two devices transfer the same charge per cycle but use pulses and pauses of different durations. Calculate pulse and cycle averages, compare them, and determine the time required for a specified total charge.
  - Expected performance (DE): Die lernende Person legt für jeden Mittelwert das Intervall offen, erhält unterschiedliche Pulsströme trotz gleicher Ladung, berechnet den Zyklusmittelwert inklusive Pause und stellt I = Q/t sinnvoll um.
  - Expected performance (EN): The learner states the interval for each average, obtains different pulse currents despite equal charge, calculates the cycle average including the pause, and meaningfully rearranges I = Q/t.
  - Understanding focus (DE): Der unabhängige Transfer trennt Ladung, Pulsdauer und Mittelungsintervall.
  - Understanding focus (EN): The independent transfer distinguishes charge, pulse duration, and averaging interval.
## Page 3: Coulomb'sches Gesetz

- Full learning-goal ID: `8da5c981-8216-5fcd-a393-19f392ae2006`
- Goal fingerprint: `sha256:33688c40b02055c62707f43b3c87ecab9b49f288973e259d4ad1702410d49807`
- Page fingerprint: `sha256:c678855b79951157da7db41f0aefa85dc83832d31ff4f87e8307b959fd90726e`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann Betrag und Richtung der elektrostatischen Kraft zwischen Punktladungen mit dem Coulomb'schen Gesetz bestimmen und den Zusammenhang zwischen Kraft, Probeladung und elektrischer Feldstärke begründen.

### Visualization

/assets/goal-visualizations/physik/8da5c981-8216-5fcd-a393-19f392ae2006/8da5c981-8216-5fcd-a393-19f392ae2006.jpg

- original digest: `sha256:cee2fe9318c00fbaa7ba750cdc5e4beb23d417c0c433c45efbc552563f89446a`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Elektrische Stromstärke als Ladungsrate deuten — `bbee4c52-4e95-5529-990f-706aa99316a3` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Termwerte durch Einsetzen berechnen — `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Q1 — `69f0038a-6e2b-55b5-8ff0-d2ea8852e793` (outside this book)
- Radialsymmetrische elektrische Felder beschreiben — `98e42cda-9e5d-5910-b2c0-3e631fd20c78` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:11267a4f472459bb21260dc0d603b507c7b66a055ade2e567cd3c2daa5b47bf6`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `apply-coulomb-law-as-vector-relation`
  - Essential understanding (DE): Für ruhende Punktladungen in einem festgelegten homogenen isotropen Medium ist der elektrostatische Kraftbetrag F=k·|q₁q₂|/r². Der zum Medium passende vorgegebene Koeffizient k bleibt beim Vergleich gleich; der Vakuumwert wird nicht auf ein anderes Medium übertragen. Die Kraft liegt auf der Verbindungslinie; gleiche Vorzeichen führen zu Abstoßung, ungleiche zu Anziehung. Die Punktladungsnäherung ist zu begrenzen.
  - Essential understanding (EN): For stationary point charges in a specified homogeneous isotropic medium, the electrostatic force magnitude is F=k·|q₁q₂|/r². The supplied coefficient k appropriate to the medium stays fixed in a comparison; a vacuum value is not transferred to another medium. The force lies along the joining line; like signs repel and unlike signs attract. The point-charge approximation must be bounded.
  - Observable performance (DE): Die lernende Person wählt Abstand, SI-Einheiten und Ladungsvorzeichen, bestimmt Kraftbetrag und Vektorrichtung, prüft das Wechselwirkungspaar und kontrolliert die 1/r²-Skalierung.
  - Observable performance (EN): The learner selects separation, SI units, and charge signs, determines force magnitude and vector direction, checks the interaction pair, and verifies inverse-square scaling.
- `connect-force-and-field-strength`
  - Essential understanding (DE): Das elektrische Feld ist eine Eigenschaft der Quellenanordnung; eine ideale positive Probeladung erfährt F = q_test E. Daher folgt E = F/q_test, während Richtung und Wert des Quellenfelds nicht von der gewählten hinreichend kleinen Probeladung abhängen.
  - Essential understanding (EN): The electric field is a property of the source configuration; an ideal positive test charge experiences F = q_test E. Thus E = F/q_test, while the direction and value of the source field do not depend on the sufficiently small test charge chosen.
  - Observable performance (DE): Die lernende Person leitet aus einer Coulombkraft die Feldstärke mit Einheit N/C ab, sagt die Kraft auf eine andere positive oder negative Probeladung voraus und erklärt die Probeladungsunabhängigkeit des Feldes.
  - Observable performance (EN): The learner derives field strength from a Coulomb force in N/C, predicts the force on a different positive or negative test charge, and explains the test-charge independence of the field.

**Coverage expectations**

- required expectations: `apply-coulomb-law-as-vector-relation`, `connect-force-and-field-strength`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `charge-signs`: Gleiche oder ungleiche Ladungsvorzeichen / Like or unlike charge signs
- `distance-change`: Geänderter Abstand mit zu prüfender 1/r²-Skalierung / Changed separation with inverse-square scaling to be tested
- `test-charge`: Positive, negative oder betragsmäßig veränderte Probeladung / Positive, negative, or magnitude-changed test charge

**Application cases**

- `two-charge-force-change`
  - Task demand (DE): Für ruhende Ladungen unter denselben ausdrücklich festgelegten elektrostatischen Mediumsbedingungen mit passend gegebenem k: Zwei Punktladungen mit gegebenen Vorzeichen und Abstand werden zunächst berechnet; danach wird ein Vorzeichen umgekehrt und der Abstand verdoppelt. Sage Richtung und Faktoränderung vor der Rechnung voraus und bestimme anschließend beide Kraftvektoren.
  - Task demand (EN): For stationary charges under the same explicitly specified electrostatic medium conditions, with an appropriate supplied k: Two point charges with given signs and separation are first calculated; then one sign is reversed and the separation is doubled. Predict direction and scale factor before calculating and then determine both force vectors.
  - Expected performance (DE): Die lernende Person nutzt Beträge und Vorzeichen getrennt, zeichnet entgegengesetzte Wechselwirkungskräfte entlang der Verbindungslinie, erwartet den Faktor 1/4 beim doppelten Abstand und prüft Einheit sowie Plausibilität.
  - Expected performance (EN): The learner handles magnitudes and signs separately, draws opposite interaction forces along the joining line, expects a factor of 1/4 at twice the separation, and checks units and plausibility.
  - Understanding focus (DE): Der Fall prüft das Coulomb-Gesetz als physikalische Vektorbeziehung statt als Einsetzschema.
  - Understanding focus (EN): The case assesses Coulomb’s law as a physical vector relation rather than a substitution recipe.
- `field-from-two-test-charges`
  - Task demand (DE): Für ruhende Ladungen unter denselben ausdrücklich festgelegten elektrostatischen Mediumsbedingungen mit passend gegebenem k: Am selben Ort werden nacheinander zwei hinreichend kleine Probeladungen unterschiedlichen Betrags und Vorzeichens eingesetzt; ihre Kräfte sind angegeben. Bestimme E aus beiden Messungen, erkläre die Richtungen und entscheide, ob die Daten zu demselben Quellenfeld passen.
  - Task demand (EN): For stationary charges under the same explicitly specified electrostatic medium conditions, with an appropriate supplied k: At the same location, two sufficiently small test charges of different magnitude and sign are used in succession; their forces are supplied. Determine E from both measurements, explain the directions, and decide whether the data fit the same source field.
  - Expected performance (DE): Die lernende Person teilt vektoriell beziehungsweise vorzeichenrichtig durch q_test, erhält dieselbe Feldstärke, erklärt die Richtungsumkehr der Kraft bei negativer Ladung und trennt Feldquelle von Probeladung.
  - Expected performance (EN): The learner divides vectorially or with correct signs by q_test, obtains the same field strength, explains reversal of force for a negative charge, and distinguishes the field source from the test charge.
  - Understanding focus (DE): Der unabhängige Transfer macht E = F/q und Probeladungsunabhängigkeit direkt beobachtbar.
  - Understanding focus (EN): The independent transfer makes E = F/q and test-charge independence directly observable.
## Page 4: Sehschwaechen mit dem Linse-Schirm-Modell untersuchen

- Full learning-goal ID: `ce14a7e7-7e2a-517f-a465-78ba3fbe414d`
- Goal fingerprint: `sha256:630d40ac6d9158e8133956770f9ae895cbd5edc24201eca32633eb4bc02053af`
- Page fingerprint: `sha256:8e5d51877f9e77596fad5e3f4d4db370cf55c0ac659924f92cd329ea7b941ae9`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann Kurz- und Weitsichtigkeit in einem vereinfachten entspannten Linse-Schirm-Modell experimentell anhand der Lage des scharfen Bildes zur festen Modellnetzhaut untersuchen und gemessene Bildweiten mit Vorhersagen der Linsengleichung vergleichen.

### Visualization

/assets/goal-visualizations/physik/ce14a7e7-7e2a-517f-a465-78ba3fbe414d/ce14a7e7-7e2a-517f-a465-78ba3fbe414d.jpg

- original digest: `sha256:dafea2b13df564618d9372bb61caad94e43cc0fee5cd3106c95ed36f72989cdd`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Linsenauge mit geometrischer Optik modellieren — `84ddb244-e560-592f-9d43-e84c801fe5b4` (outside this book)
- Experimente planen und Messdaten auswerten — `d3c153b9-e09b-5668-8386-73105546a7c1` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Zwei eigene Linse-Schirm-Untersuchungen begründet vergleichen — `04f643c6-74f5-56e9-a9c7-ea39ae98db31` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5bd7f2d03e3eecb4f37719d144187af47c55064f9a88f39ccbf3ebfbd03779cb`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `experimental-eye-mapping`
  - Essential understanding (DE): Im Linse-Schirm-Modell kann eine feste Schirmlage die Netzhaut darstellen; ein davor oder dahinter liegender scharfer Bildort modelliert unterschiedliche Defokussierung, nicht eine vollständige klinische Diagnose.
  - Essential understanding (EN): In the lens-screen model, a fixed screen can represent the retina; a sharp image location in front of or behind it models different defocus conditions, not a complete clinical diagnosis.
  - Observable performance (DE): Die lernende Person plant einen sicheren optischen Aufbau und führt beide geänderten entspannten Modellaugen selbst real aus. Sie misst Gegenstandsweite und feste Modellnetzhautposition und sucht den Schärfeort persönlich mit einem unabhängigen Messschirm; vollständige eigene Rohablesungen und Wiederholungen belegen jede Durchführung.
  - Observable performance (EN): The learner plans a safe optical setup and personally carries out both changed relaxed model-eye investigations in reality. They measure object distance and fixed model-retina position and personally locate the focus with an independent measuring screen; complete own raw readings and repetitions document each execution.
- `compare-prediction`
  - Essential understanding (DE): Die dünne-Linsen-Gleichung liefert unter paraxialen Bedingungen eine Vorhersage der Bildweite; Messung und Modell können innerhalb ihrer Unsicherheit verglichen werden.
  - Essential understanding (EN): The thin-lens equation predicts image distance under paraxial conditions; measurement and model can be compared within their uncertainty.
  - Observable performance (DE): Die lernende Person berechnet b aus gegebenem f und g, vergleicht den erwarteten mit dem gemessenen Schärfeort, deutet Kurz-/Weitsichtigkeit im Modell und benennt Unsicherheiten sowie biologische Grenzen.
  - Observable performance (EN): The learner calculates b from supplied f and g, compares predicted and measured focus, interprets model myopia/hyperopia and identifies uncertainties and biological limits.

**Coverage expectations**

- required expectations: `experimental-eye-mapping`, `compare-prediction`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `defocus-direction`: Scharfes Bild vor gegenüber hinter der festen Modellnetzhaut. / Sharp image in front of versus behind the fixed model retina.
- `object-regime`: Entferntes endliches Objekt gegenüber näherem Objekt bei zwei ausdrücklich festgelegten entspannten Modellaugen. / A distant finite object versus a nearer object for two explicitly specified relaxed model eyes.

**Application cases**

- `own-myopic-model`
  - Task demand (DE): Stelle selbst einen sicheren LED-Linse-Schirm-Aufbau her, etwa mit g≈10f und fester Modellnetzhaut b_R≈1,2f. Vermiss die tatsächlichen Abstände, suche den Schärfeort in drei eigenen neuen Schirmpositionierungen und notiere alle Rohdaten/Schärfegrenzen. Sage die Bildweite aus tatsächlichem f/g voraus und vergleiche mit deiner Messung samt Unsicherheit. Gelieferte Beispielwerte sind kein eigener Versuch.
  - Task demand (EN): Personally set up a safe LED/lens/screen model, for example g≈10f and fixed retina b_R≈1.2f. Measure actual distances, find focus in three fresh own screen positionings, and record every raw reading/sharpness bound. Predict image distance from actual f/g and compare with your own measurement and uncertainty. Supplied sample values are no personal experiment.
  - Expected performance (DE): Tatsächlicher eigener Aufbau und Rohdaten, feste Modellnetzhaut und unabhängig bewegter Messschirm, Vorhersage-/Messbereiche und begrenzte Kurzsichtigkeitsdeutung; eine ehrliche unaufgelöste Zuordnung benötigt einen tatsächlichen Kontrollschritt, keine erfundenen Werte.
  - Expected performance (EN): Actual own setup and raw data, fixed model retina and independently moved measuring screen, prediction/measurement ranges, and bounded myopia interpretation; an honestly unresolved classification requires an actual control, never invented values.
  - Understanding focus (DE): Die eigene tatsächliche Bildlage relativ zur festen Modellnetzhaut trägt den begrenzten Modellvergleich.
  - Understanding focus (EN): The actual personally measured focus relative to the fixed model retina supports the bounded model comparison.
- `own-hyperopic-changed-model`
  - Task demand (DE): Dokumentiere vor dem zweiten eigenen Durchgang eine tatsächlich veränderte optische Bedingung, etwa dieselbe Linse mit nun festem b_R≈0,8f und g≈3f. Stelle sie selbst ein, vermiss neu und suche den Fokus in drei neuen eigenen Positionierungen. Vergleiche neue Vorhersage und neue Rohdaten/Messgrenzen; prüfe zusätzlich b→f gegenüber der festen B-Netzhaut. Kein Kopieren von A oder gelieferten Messwerten.
  - Task demand (EN): Before the second personal investigation document an actually changed optical condition, for example the same lens now with fixed b_R≈0.8f and g≈3f. Personally set it up, remeasure, and locate focus in three fresh own positionings. Compare new predictions and new raw data/measurement limits; also check b→f against B's fixed retina. Do not copy A or supplied readings.
  - Expected performance (DE): Zweite reale Durchführung mit geänderter Bedingung, neuer eigener Datenkette und begründetem Mess-/Modellvergleich. Der Fernobjekt-Grenzfall trennt das Weitsichtigkeitsmodell von bloß fehlender Nahakkommodation; Diagnose/Brillenverordnung wird nicht behauptet.
  - Expected performance (EN): Second real execution with changed conditions, fresh own data chain, and justified model/measurement comparison. The distant-object limit distinguishes the hyperopia model from merely inadequate near accommodation; no diagnosis or spectacle prescription is claimed.
  - Understanding focus (DE): Unabhängige eigene Durchführung überprüft die Übertragbarkeit bei geänderter optischer Bedingung.
  - Understanding focus (EN): An independently fresh personal execution tests transfer under changed optical conditions.
## Page 5: Geschwindigkeitspfeile aus einer Video-Bildfolge bestimmen und vergleichen

- Full learning-goal ID: `d61ea362-f6c3-5eab-ac30-2d0e265ac0f6`
- Goal fingerprint: `sha256:178e3f845a82a3f40f6b74550bce4c26a65a20987a211462a7cf863b1dc38422`
- Page fingerprint: `sha256:442e7721dbd9a31d41b950f2a160eb0ace007566b3d04fc541b97432c6938839`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann in einer zeitlich und räumlich kalibrierten Bildfolge einer zweidimensionalen Bewegung aus den Ortsänderungen über kurze gleiche Zeitintervalle maßstäbliche Geschwindigkeitspfeile konstruieren, die Näherung für den jeweiligen Zeitpunkt benennen und Änderungen der Geschwindigkeit grafisch bestimmen.

### Visualization

/assets/goal-visualizations/physik/d61ea362-f6c3-5eab-ac30-2d0e265ac0f6/d61ea362-f6c3-5eab-ac30-2d0e265ac0f6.png

- original digest: `sha256:09400cf2450355c928dcac623bf0ec1f5e95a93496e73ad0fa73450b60b5e680`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Messwertänderungen pro Zeitintervall bestimmen — `13b338eb-f761-5817-9058-11043b9cb253` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Geschwindigkeitspfeile in einem echten Bewegungsvideo konstruieren — `fbaeed34-81a0-5955-9777-bf103002feee` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:3c1ead193a5e9486916ae9296e29b54d367108a485ad5fb2a2d36568522f646a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `scaled-local-velocity`
  - Essential understanding (DE): Eine Ortsänderung über ein kurzes bekanntes Zeitfenster liefert einen Geschwindigkeitspfeil mit Bewegungsrichtung und maßstäblichem Betrag; ein Intervallmittel ist nur näherungsweise ein Zeitpunktwert.
  - Essential understanding (EN): A displacement over a short known window gives a velocity arrow with motion direction and scaled magnitude; an interval average only approximates an instantaneous value.
  - Observable performance (DE): Nutzt die bereitgestellte räumliche und zeitliche Kalibrierung einer realen neuen Bildfolge, bestimmt zwei kurze gleich lange Messfenster und konstruiert maßstäbliche Pfeile; dokumentiert Auflösung und Zeitzuordnung. Eine eigenständige Kalibrierung ist kein notwendiger Beherrschungsnachweis dieses Ziels.
  - Observable performance (EN): Uses the supplied spatial and temporal calibration of a fresh real image sequence, determines two short equal-duration windows, and constructs scaled arrows; documents resolution and timing. Independent calibration is not a necessary mastery requirement for this goal.
- `graphical-velocity-change`
  - Essential understanding (DE): Der Änderungspfeil läuft bei gemeinsamem Anfangspunkt von der ersten zur zweiten Geschwindigkeitsspitze. Eine Richtungsänderung genügt auch bei gleichem Betrag für eine Änderung.
  - Essential understanding (EN): With common tails, the change arrow runs from the first velocity arrowhead to the second. A direction change gives velocity change even at equal magnitude.
  - Observable performance (DE): Konstruiert und deutet Δv in einem neuen Clip, ohne Änderung mit Strecke oder bloßer Betragsdifferenz zu verwechseln.
  - Observable performance (EN): Constructs and interprets Δv in a fresh clip without confusing it with distance or only magnitude difference.

**Coverage expectations**

- required expectations: `scaled-local-velocity`, `graphical-velocity-change`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `direction-and-speed`: Zwei neue reale Clips mit geänderten Geschwindigkeiten und unabhängig einem näherungsweise gleichen Betrag bei Richtungswechsel. / Two fresh real clips with changed velocities and independently approximately equal magnitude with direction change.

**Application cases**

- `real-turning-clip`
  - Task demand (DE): Untersuche einen neuen echten Clip vor/nach einem Richtungswechsel. Die räumliche/zeitliche Kalibrierung wird passend mitgegeben; wende sie nachvollziehbar an.
  - Task demand (EN): Analyze a fresh real clip before/after a turn. Appropriate spatial/temporal calibration is supplied; apply it traceably.
  - Expected performance (DE): Zwei kalibrierte Pfeile mit Zeitfenstern und grafisches Δv.
  - Expected performance (EN): Two calibrated arrows with windows and graphical Δv.
  - Understanding focus (DE): Eigene Auswertung eines realen Artefakts.
  - Understanding focus (EN): Own analysis of a real artifact.
- `fresh-equal-speed-direction`
  - Task demand (DE): Werte einen zweiten neuen echten Clip mit ähnlichem Betrag und anderer Richtung aus. Die räumliche/zeitliche Kalibrierung wird passend mitgegeben; wende sie nachvollziehbar an.
  - Task demand (EN): Analyze a second fresh real clip with similar magnitude and a changed direction. Appropriate spatial/temporal calibration is supplied; apply it traceably.
  - Expected performance (DE): Begründet an echten maßstäblichen Pfeilen ein nichtverschwindendes Δv trotz ähnlichem Betrag.
  - Expected performance (EN): Uses actual scaled arrows to explain nonzero Δv despite similar magnitudes.
  - Understanding focus (DE): Unabhängiger Richtungs-/Betragstransfer.
  - Understanding focus (EN): Independent direction/magnitude transfer.
## Page 6: Einen angeleiteten Versuch zur mittleren Beschleunigung planen und auswerten

- Full learning-goal ID: `677a192d-8bbe-57fc-bb7a-1c1ed5fba32b`
- Goal fingerprint: `sha256:47d2b7c07f09b1c94687bf3bb985d04373eeb8acea177731e1c0995a50f34776`
- Page fingerprint: `sha256:fc9d992b45f517654670820f9d8ae15b542c25a87353e2beee7ba8b760f40fdd`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann unter Anleitung einen sicheren geradlinigen Bewegungsversuch mit Sensor oder Video vorab planen und selbst durchführen sowie aus zwei lokalen Geschwindigkeitsmitteln und dem Zeitabstand ihrer Fenstermitten die mittlere Beschleunigung näherungsweise bestimmen. Sie begründet Zeitbasis und Messfenster, deutet Vorzeichen und Messgrenzen und vergleicht eigene neue Ergebnisse bei einer veränderten Versuchsbedingung.

### Visualization

/assets/goal-visualizations/physik/677a192d-8bbe-57fc-bb7a-1c1ed5fba32b/677a192d-8bbe-57fc-bb7a-1c1ed5fba32b.png

- original digest: `sha256:72b451b25ed978fb4ae77f69aa193076576a5b4192562cbb320cbdf9524eb784`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Messwertänderungen pro Zeitintervall bestimmen — `13b338eb-f761-5817-9058-11043b9cb253` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Einen angeleiteten Beschleunigungsversuch planen, durchführen und vergleichen — `7c2a3450-9b82-54e6-b302-358a964b34ec` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d76fd09f4b30e2fd189abe8b2b965b27a1e245efb858c22069e73e86bdae2d49`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `guided-preacquisition-planning`
  - Essential understanding (DE): Ein angeleiteter Versuch wird vor der Erfassung mit einer sicheren Aufbauskizze, begründeter tatsächlicher Zeitbasis und geplanten Messfenstern beziehungsweise Auswahlregel vorbereitet. Hilfe ist erlaubt; eine nachträgliche Beschreibung ist nicht dieselbe Planungsleistung.
  - Essential understanding (EN): A guided experiment is prepared before acquisition using a safe setup sketch, a justified actual time base, and planned windows or a selection rule. Help is allowed; a retrospective description is not the same planning performance.
  - Observable performance (DE): Reicht vor der ersten Messung einen eigenen kurzen angeleiteten Plan mit Gerät, Skala/Bezug, Achse, Auflösung, Zeitbasis und Fenstern/Regel ein; dokumentiert vor dem zweiten Durchgang die neue Bedingung und nötige Anpassung.
  - Observable performance (EN): Submits an own brief guided plan before the first acquisition, including device, scale/reference, axis, resolution, timing, and windows/rule; documents the changed condition and needed adjustments before trial two.
- `guided-real-acquisition`
  - Essential understanding (DE): Zwei lokale Geschwindigkeitsmittel aus kurzen Fenstern können näherungsweise deren Mitten zugeordnet werden. Ihre Änderung geteilt durch den Abstand dieser Mitten schätzt eine mittlere Beschleunigung; Fensterbreite und Mittenabstand sind verschiedene Zeitspannen.
  - Essential understanding (EN): Local average velocities from two short windows can be approximately assigned to their centers. Their change divided by the separation of those centers estimates average acceleration; window width and center separation are distinct durations.
  - Observable performance (DE): Erfasst eigene reale Daten mit angeleitetem Sensor- oder Videoaufbau und berechnet Δv/Δt mit richtigen Messzeitpunkten, Einheiten und Vorzeichen.
  - Observable performance (EN): Acquires own real data using a guided sensor or video setup and computes Δv/Δt with correct times, units, and signs.
- `fresh-trial-and-limits`
  - Essential understanding (DE): Zwei lokale Fenster belegen keinen global konstanten Verlauf oder allgemeinen Wurf. Eine veränderte Anfangsgeschwindigkeit kann mit gleicher Beschleunigung vereinbar sein; Datenvergleich kann Unterschiede oder Übereinstimmung innerhalb der tatsächlichen Messgrenzen ergeben.
  - Essential understanding (EN): Two local windows establish neither a globally constant course nor a general projectile model. Changed initial velocity can be compatible with the same acceleration; a data comparison can show differences or agreement within actual measurement limits.
  - Observable performance (DE): Plant den zweiten Durchgang mit veränderter Bedingung vorab, erfasst unabhängig neue Daten und vergleicht sie evidenzbezogen: erkennbarer Unterschied wird vorsichtig eingeordnet oder fehlende Auflösbarkeit begründet; kein gewünschtes Ergebnis oder keine Ursache wird erfunden.
  - Observable performance (EN): Plans the second trial with changed conditions in advance, independently acquires fresh data, and compares evidence: cautiously interprets a resolved difference or explains lack of resolution, without inventing a desired result or cause.

**Coverage expectations**

- required expectations: `guided-preacquisition-planning`, `guided-real-acquisition`, `fresh-trial-and-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `method-and-initial-condition`: Sensor oder Video als echte Alternative; zweiter frischer Versuch mit geänderter Anfangsbedingung oder Neigung. / Sensor or video as genuine alternatives; fresh second trial with changed initial condition or inclination.

**Application cases**

- `first-guided-trial`
  - Task demand (DE): Plane unter Anleitung vor der Aufnahme eine neue geradlinige Untersuchung mit Skizze, tatsächlicher Zeitbasis und Messfenstern/Auswahlregel; führe sie selbst durch und werte sie aus.
  - Task demand (EN): With guidance, plan a fresh straight-motion investigation before recording using a sketch, actual timing, and windows/selection rule; conduct and analyze it yourself.
  - Expected performance (DE): Vorher eingereichter eigener Plan und nachprüfbare echte Aufnahme; zwei kurze Fenster und deren Mittenabstand liefern eine vorzeichenrichtige begrenzte Beschleunigungsnäherung.
  - Expected performance (EN): Own plan submitted in advance and checkable actual acquisition; two short windows and their center separation give a signed bounded acceleration estimate.
  - Understanding focus (DE): Echte Erfassung statt bereitgestellter Zahlen.
  - Understanding focus (EN): Actual acquisition instead of supplied numbers.
- `changed-condition-trial`
  - Task demand (DE): Passe den angeleiteten Plan vor einem unabhängig neuen Versuch für eine dokumentierte veränderte Bedingung an und vergleiche anschließend die echten neuen Daten.
  - Task demand (EN): Before an independently fresh experiment, adapt the guided plan for a documented changed condition and then compare the genuinely new data.
  - Expected performance (DE): Vorher dokumentierte Planänderung, neue Rohdaten, Zeitzuordnung und Rechnung. An Auflösung gebundener Unterschied oder Übereinstimmung wird gleichwertig begründet; keine globale Modellbehauptung oder erfundene Fehlerursache.
  - Expected performance (EN): Plan adaptation documented in advance, fresh raw data, timing, and calculation. A resolution-bounded difference or agreement is justified equivalently; no global model assertion or invented error cause.
  - Understanding focus (DE): Unabhängige experimentelle Variation.
  - Understanding focus (EN): Independent experimental variation.

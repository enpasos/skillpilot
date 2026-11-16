# AI review input: Physik K3/K6 – 13 aktuelle gewöhnliche Ziele

- Book ID: `physics-k3k6-native-current13-20261115`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:9c21cca3c703281fa47fa2f46e1c841d3b46c739b3c73ec03bd784583b82cb46`
- Selected goals: 13

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Gleichmäßig beschleunigte Bewegung und Beschleunigung

- Full learning-goal ID: `e4b38061-1f28-43ad-8371-a3e7c0e81856`
- Goal fingerprint: `sha256:70e4e02a89e3533891437bcd8ecdb5eebbf6844890928e623f32a6fbb2c2dd58`
- Page fingerprint: `sha256:4d2ea8afc51a7d1a0f75ffa1f78964b0c188027ee7563cbee60a8a7b2af4fb53`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann das Modell der gleichmäßig beschleunigten Bewegung mit konstanter Beschleunigung erläutern und in t-s-, t-v- und t-a-Darstellungen beschreiben.

### Visualization

/assets/goal-visualizations/physik/e4b38061-1f28-43ad-8371-a3e7c0e81856/e4b38061-1f28-43ad-8371-a3e7c0e81856.jpg

- original digest: `sha256:fd83544e329cc947ab46a9b49f4ab7a461a168a1c086b4624669a44679aa8fbf`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Bewegungen mit Videoanalyse untersuchen — `d67502e3-5e0a-595b-a24b-65b1c40de36e` (page 2)

### Prerequisites outside this book

- Durchschnitts- und Momentangeschwindigkeit unterscheiden — `bf8517a9-142b-5789-826a-767f3b277998` (outside this book)
- Funktionswerte berechnen — `c65ecabf-d00b-4e2d-99ae-b64692325ffb` (outside this book)
- Flächeninhalte ebener Figuren berechnen — `87c55be5-06a9-41e2-a0d4-c60f7c8b8078` (outside this book)

### Direct reverse prerequisites outside this book

- Freier Fall experimentell untersuchen — `09029573-864f-40ca-bf8a-cee7bf6dcb73` (outside this book)
- Newtons 1. Axiom (Trägheitsprinzip) — `31a2ef52-114b-4d2c-a720-6ef5a390b6dc` (outside this book)
- Physik im Straßenverkehr: Sicherheitsabstände bewerten — `4a2bf015-052b-4af0-aed7-324259fa1a8a` (outside this book)
- Senkrechter Wurf: Vorzeichen, Scheitelpunkt und Rückkehr — `4ab1cf6d-b808-5b86-9291-85df0b9f2496` (outside this book)
- Waagerechter Wurf: Zwei Bewegungen, eine gemeinsame Zeit — `6ea3fb3c-abdc-568f-ab13-97c36dc274e4` (outside this book)
- Beschleunigungsprotokoll: Geschwindigkeit, Ort und Modellgrenzen — `a8dc0290-9f80-5763-8943-e16b8d2aa860` (outside this book)
- Harmonische Schwingung verstehen — `d03f1cb6-c224-53db-ad91-76cc7827978d` (outside this book)
- Modellierung und Idealisierung von Bewegungen — `d6dc0e02-831d-4894-a61a-852bcc74f147` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e7d478c83be998c71a1e4ff75e412cbb0558b24403e207a936f1ea38a8174039`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `selected-blind-review-core`
  - Essential understanding (DE): Konstante Beschleunigung bedeutet gleiche Geschwindigkeitsänderungen in gleichen Zeitintervallen; deshalb sind t-a-, t-v- und t-s-Darstellung über konstante Beschleunigung, lineare Geschwindigkeitsänderung und quadratische Ortsänderung miteinander verknüpft, wobei Anfangswerte und Vorzeichen den konkreten Verlauf bestimmen.
  - Essential understanding (EN): Constant acceleration means equal changes in velocity in equal time intervals; therefore the time-acceleration, time-velocity, and time-position representations are linked through constant acceleration, linear velocity change, and quadratic position change, while initial values and signs determine the specific course.
  - Observable performance (DE): Die lernende Person konstruiert für gegebene Anfangsposition, Anfangsgeschwindigkeit und vorzeichenbehaftete konstante Beschleunigung selbstständig konsistente t-a-, t-v- und t-s-Darstellungen, übersetzt zwischen ihnen und prüft Steigungen, Flächen, Einheiten und Bewegungsrichtung auf Plausibilität.
  - Observable performance (EN): For a given initial position, initial velocity, and signed constant acceleration, the learner independently constructs consistent time-acceleration, time-velocity, and time-position representations, translates among them, and checks slopes, areas, units, and direction of motion for plausibility.
- `signed-displacement-differs-from-distance`
  - Essential understanding (DE): Die vorzeichenbehaftete Fläche unter einem t-v-Diagramm ist die Ortsänderung. Nach einem Richtungswechsel ist die zurückgelegte Strecke die Summe der Beträge der Teilflächen und kann größer als der Betrag der Ortsänderung sein.
  - Essential understanding (EN): The signed area under a time-velocity graph is displacement. After a reversal, distance traveled is the sum of the magnitudes of the partial areas and may exceed the magnitude of displacement.
  - Observable performance (DE): Die lernende Person zerlegt einen Verlauf am Nulldurchgang von v, bestimmt Ortsänderung und Strecke mit Einheiten und verbindet beide mit dem t-s-Verlauf.
  - Observable performance (EN): The learner splits a graph at the zero crossing of v, determines displacement and distance with units, and relates both to the time-position graph.

**Coverage expectations**

- required expectations: `selected-blind-review-core`, `signed-displacement-differs-from-distance`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `signed-initial-conditions`: Verschiedene Anfangsorte, Anfangsgeschwindigkeiten und Vorzeichen der Beschleunigung / Different initial positions, initial velocities, and signs of acceleration
- `starting-representation`: Gegebenes t-a-, t-v-, t-s-Diagramm oder Wertetabelle / Given time-acceleration, time-velocity, time-position graph, or table
- `model-interval`: Vollständig konstante Beschleunigung oder begrenztes Gültigkeitsintervall / Fully constant acceleration or a bounded validity interval

**Application cases**

- `ramp-cart-turnaround`
  - Task demand (DE): Ein Wagen fährt mit positiver Anfangsgeschwindigkeit eine Rampe hinauf und erfährt konstante negative Beschleunigung. Konstruiere alle Diagramme, bestimme den Umkehrzeitpunkt sowie Ortsänderung und Strecke.
  - Task demand (EN): A cart travels up a ramp with positive initial velocity and constant negative acceleration. Construct all graphs and determine reversal time, displacement, and distance.
  - Expected performance (DE): Am Umkehrpunkt ist v = 0, aber a ist ungleich null; Vorzeichen, Flächen und Einheiten bleiben in allen Darstellungen konsistent.
  - Expected performance (EN): At the turning point v = 0 but a is nonzero; signs, areas, and units remain consistent across all representations.
  - Understanding focus (DE): Geschwindigkeit null ist nicht Beschleunigung null.
  - Understanding focus (EN): Zero velocity is not zero acceleration.
- `braking-model-beyond-stop`
  - Task demand (DE): Bremsdaten eines Fahrzeugs passen bis zum Stillstand zu konstanter negativer Beschleunigung. Setze das mathematische Modell zunächst fort und entscheide dann, ab wann es den realen Vorgang nicht mehr beschreibt.
  - Task demand (EN): Vehicle braking data fit constant negative acceleration up to rest. First extend the mathematical model and then decide when it ceases to describe the real process.
  - Expected performance (DE): Die rechnerische Rückwärtsbewegung nach dem Nulldurchgang wird als Folge einer unzulässigen Modellfortsetzung erkannt und das Gültigkeitsintervall datenbezogen begrenzt.
  - Expected performance (EN): The calculated backward motion after the zero crossing is recognized as a consequence of invalid model extension, and the validity interval is bounded using the data.
  - Understanding focus (DE): Modellgleichung und reale Gültigkeit werden getrennt.
  - Understanding focus (EN): Model equation and physical validity are separated.
- `elevator-acceleration-log`
  - Task demand (DE): Aus einem t-a-Protokoll mit abschnittsweise konstanter Beschleunigung und gegebenen Anfangswerten sollen t-v- und t-s-Verläufe vorhergesagt und mit Ortsmarken samt Auflösung verglichen werden.
  - Task demand (EN): Given a time-acceleration log with piecewise-constant acceleration and initial values, predict time-velocity and time-position graphs and compare them with position marks and their resolution.
  - Expected performance (DE): Verwendet a·Δt als Geschwindigkeitsänderung und vorzeichenbehaftete t-v-Flächen als Ortsänderung; verwechselt negative Beschleunigung nicht mit negativer Geschwindigkeit und begrenzt Aussagen bei Datenabweichungen.
  - Expected performance (EN): Uses a·Δt as velocity change and signed time-velocity areas as displacement; does not confuse negative acceleration with negative velocity and bounds claims when data differ.
  - Understanding focus (DE): Der zuvor bei ce431 zu frühe Transfer folgt jetzt auf die Beschleunigungskompetenz.
  - Understanding focus (EN): The transfer previously introduced too early in ce431 now follows acceleration competence.
## Page 2: Bewegungen mit Videoanalyse untersuchen

- Full learning-goal ID: `d67502e3-5e0a-595b-a24b-65b1c40de36e`
- Goal fingerprint: `sha256:0d5cef647aee1e97824bc8d632e7f0154020a6e5914129bf9027d0cf333cb6db`
- Page fingerprint: `sha256:025b0c7964d31e81952fbfbb297164496f828ccab77a28624da5d9a66698d27c`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann ein Bewegungsvideo räumlich und zeitlich kalibrieren, daraus Orts-Zeit-Daten sowie s(t)- und v(t)-Diagramme gewinnen und Modelle einer gleichförmigen oder geworfenen Bewegung unter Berücksichtigung der Messunsicherheit prüfen.

### Visualization

/assets/goal-visualizations/physik/d67502e3-5e0a-595b-a24b-65b1c40de36e/d67502e3-5e0a-595b-a24b-65b1c40de36e.jpg

- original digest: `sha256:beb75ed3491bf1a8f2d1f01813fe38cb36d54e13ee8af2a831481b36870df78e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gleichmäßig beschleunigte Bewegung und Beschleunigung — `e4b38061-1f28-43ad-8371-a3e7c0e81856` (page 1)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Digitale Messdaten mit Sensoren erfassen — `691c11d0-fa6a-5d2e-a19c-086e89c3c233` (outside this book)
- Mittelwert und Streuung aus Messreihen bestimmen — `f23fdfa9-38b6-5157-8301-ed302476c456` (outside this book)

### Direct reverse prerequisites outside this book

- Videoanalyse: eigene Kalibrierung und unabhängiger Wurftransfer — `6345871e-eab4-59c1-a3b6-8456ab9bd7df` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e82ea63b4617e7885e558cebc2b3aa4dd6be5a1255d54b272d4d1e602fbab19f`
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
  - Observable performance (DE): Die lernende Person wählt zwischen gleichförmigem und Wurfmodell, passt oder vergleicht das Modell mit Daten und trennt begründet physikalische von messtechnischen Abweichungen.
  - Observable performance (EN): The learner chooses between uniform-motion and projectile models, fits or compares the model with data, and justifiably separates physical from measurement-related deviations.

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
  - Task demand (DE): Ein Wagenvideo enthält Maßstab, Bildrate und leicht schräg stehende Kamera. Kalibriere die Bewegung, gewinne s(t) und v(t), prüfe ein gleichförmiges Modell und entscheide anhand der Residuen, ob Perspektive oder reale Beschleunigung plausibler ist.
  - Task demand (EN): A cart video includes a scale, frame rate, and a slightly oblique camera. Calibrate the motion, obtain s(t) and v(t), test a uniform-motion model, and use residuals to decide whether perspective or real acceleration is more plausible.
  - Expected performance (DE): Die lernende Person legt eine geeignete Achse fest, korrigiert oder begrenzt die Perspektive, erhält physikalische Einheiten, passt eine Gerade an s(t) und deutet systematische gegenüber zufälligen Residuen. Die aus derselben eigenen Rohdatentabelle erzeugten Orts- und Geschwindigkeitsdiagramme werden mit Achsen, Einheiten sowie Messdaten-/Modellunterscheidung vorgelegt.
  - Expected performance (EN): The learner defines a suitable axis, corrects or bounds perspective, obtains physical units, fits a line to s(t), and interprets systematic versus random residuals. The position and velocity graphs generated from the same own raw table are submitted with axes, units, and measured-data/model distinction.
  - Understanding focus (DE): Der Fall prüft Kalibrierung und Diagnose eines Modells aus frischen Daten.
  - Understanding focus (EN): The case assesses calibration and diagnosis of a model from fresh data.
- `projectile-video-components`
  - Task demand (DE): Ein zweidimensionales Wurfvideo mit unbekanntem Startzeitpunkt und bekannter Bildrate wird vorgelegt. Kalibriere beide Achsen, bestimme x(t), y(t), v_x(t) und v_y(t) und prüfe horizontale Gleichförmigkeit sowie vertikale konstante Beschleunigung.
  - Task demand (EN): A two-dimensional projectile video with unknown start time and known frame rate is supplied. Calibrate both axes, determine x(t), y(t), v_x(t), and v_y(t), and test horizontal uniform motion and vertical constant acceleration.
  - Expected performance (DE): Die lernende Person wählt und begründet den Zeitnullpunkt, kalibriert eine neue reale Wurfaufnahme, schätzt die getrennten Komponentenparameter selbst und dokumentiert Fits mit Einheiten, Residuen sowie einer quantitativ begrenzten Parametersensitivität aus Re-Markierung und Kalibrierung. Einen Abwurfzeitpunkt rekonstruiert sie nur mit ausreichender Zusatzinformation; gelieferte Modellparameter oder synthetische Daten ersetzen den realen Fit nicht. Zusätzlich legt sie die aus derselben echten Auswertung erzeugten x(t)-, y(t)-, v_x(t)- und v_y(t)-Diagramme mit Einheiten, erkennbaren Messpunkten/Intervallmitteln und getrennten Modellkurven vor; Mittelpunktzuordnung wird gegebenenfalls als Näherung begrenzt.
  - Expected performance (EN): The learner chooses and justifies time zero, calibrates a fresh real projectile recording, independently estimates separate component parameters, and documents fits with units, residuals, and quantitatively bounded parameter sensitivity from re-marking and calibration. Launch time is reconstructed only with sufficient additional information; supplied model parameters or synthetic data do not replace the real fit. They additionally submit x(t), y(t), v_x(t), and v_y(t) graphs generated from that same actual analysis, with units, identifiable measured points/interval averages, and separate model curves; midpoint assignment is qualified as an approximation where used.
  - Understanding focus (DE): Der unabhängige Transfer prüft dieselbe Datenkette in einem anderen Bewegungsmodell.
  - Understanding focus (EN): The independent transfer assesses the same data chain in a different motion model.
## Page 3: SI-Einheiten in physikalischen Beispielen nutzen

- Full learning-goal ID: `3ed3279e-c524-5230-a277-dda89493df6d`
- Goal fingerprint: `sha256:028099e53583ff77cba011b3a0732e609d8d75f943b78a3571c6149acb59a1e0`
- Page fingerprint: `sha256:cd54c1b5cad4ee00768b9e91233c14d4c85058c0649fde448a70c2d639b1db58`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann die Funktion des SI-Einheitensystems erläutern und einfache physikalische Größen mit passenden SI-Einheiten angeben.

### Visualization

/assets/goal-visualizations/physik/3ed3279e-c524-5230-a277-dda89493df6d/3ed3279e-c524-5230-a277-dda89493df6d.jpg

- original digest: `sha256:0934c705a73b525decbe837b1016b029cfe668964350a69e6be83b1db67d514a`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Physikalische Informationen aus Quellen auswerten — `d2e6f87d-795b-5631-a7cc-0bfb5dc5142e` (page 4)

### Prerequisites outside this book

- Warum Physik? – Weltverständnis & Zukunft — `5c44b9ba-9b05-4774-95d5-073230d3fc4f` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Gemeinsame SI-Bezüge sinnvoll nutzen — `2ff1abd4-1399-5e5a-aa91-7c6948e77ed1` (outside this book)
- Astronomische Groessenordnungen und Einheiten — `7c986fca-1129-5eff-a17e-0a04bb7346ee` (outside this book)
- Experimente planen und Messdaten auswerten — `d3c153b9-e09b-5668-8386-73105546a7c1` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e98e2b410b100f36892e1466be34223f09da1a8d1fd10b706407e50c09a77f61`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `shared-reference`
  - Essential understanding (DE): Eine physikalische Größenangabe verbindet Zahlenwert und Einheit; gemeinsame SI-Bezüge ermöglichen Vergleich und Verständigung unabhängig von lokalen Messgewohnheiten.
  - Essential understanding (EN): A physical quantity value combines number and unit; shared SI references enable comparison and communication independently of local measuring conventions.
  - Observable performance (DE): Die lernende Person erläutert an zwei Messberichten die Funktion gemeinsamer Einheiten und macht aus einer mehrdeutigen Angabe eine eindeutig benannte Größe mit passender SI-Einheit.
  - Observable performance (EN): The learner explains the role of shared units using two measurement reports and turns an ambiguous entry into a clearly named quantity with an appropriate SI unit.
- `quantity-unit-match`
  - Essential understanding (DE): Einheiten gehören zu bestimmten Größenarten; Meter, Sekunde und Kilogramm sowie einfache abgeleitete Einheiten tragen verschiedene Bedeutungen.
  - Essential understanding (EN): Units correspond to kinds of quantity; metre, second and kilogram, and simple derived units, carry different meanings.
  - Observable performance (DE): Die lernende Person ordnet einfachen gegebenen Größen passende SI-Einheiten zu und erklärt die Bedeutung einer ausgewählten Angabe einschließlich eines einfachen Vergleichs.
  - Observable performance (EN): The learner assigns suitable SI units to simple supplied quantities and explains the meaning of one entry, including a simple comparison.

**Coverage expectations**

- required expectations: `shared-reference`, `quantity-unit-match`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `report-context`: Vergleich von Längenangaben gegenüber einem Messprotokoll mit mehreren Größenarten. / Comparison of length entries versus a measurement record containing several quantity types.
- `unit-form`: SI-Vorsatz und Basiseinheit gegenüber einfacher abgeleiteter Einheit. / SI prefix and base unit versus a simple derived unit.

**Application cases**

- `rope-reports`
  - Task demand (DE): Zwei Gruppen messen dieselbe Schnur: A notiert '120', B '1,20 m'. Die erste Gruppe klärt nachträglich, Zentimeter verwendet zu haben; 100 cm=1 m ist gegeben. Ergänze eindeutige Angaben, vergleiche sie und erläutere, warum ein gemeinsamer Einheitenbezug wichtig ist.
  - Task demand (EN): Two groups measure the same cord: A writes '120', B '1.20 m'. Group A later clarifies that it used centimetres; 100 cm=1 m is given. Complete unambiguous entries, compare them and explain why a common unit reference matters.
  - Expected performance (DE): Schreibt Länge 120 cm=1,20 m und erkennt denselben nominalen Längenwert; ohne Einheit war '120' nicht vergleichbar. Erläutert Meter und SI-Vorsatz als gemeinsame Referenz und trennt Übereinstimmung der Angaben von einer noch nicht angegebenen Messgenauigkeit.
  - Expected performance (EN): Writes length 120 cm=1.20 m and recognises the same nominal length; '120' without a unit was not comparable. Explains metre and the SI prefix as a shared reference and distinguishes matching entries from measurement precision not yet supplied.
  - Understanding focus (DE): Gemeinsame Einheiten machen Zahlen zu vergleichbaren physikalischen Angaben.
  - Understanding focus (EN): Shared units turn numbers into comparable physical quantity values.
- `motion-log`
  - Task demand (DE): Ein neuer Versuchsbogen enthält die Größen Strecke, Zeitdauer, Masse des Wagens und bereits bestimmte Geschwindigkeit mit Zahlen 0,8; 2; 0,5; 0,4. Die Werte wurden im SI erhoben. Ergänze passende Einheiten, erläutere besonders '0,4 m/s' und erkläre, warum eine Einheit nicht beliebig zwischen Zeilen getauscht werden kann.
  - Task demand (EN): A fresh experiment sheet lists distance, elapsed time, cart mass and an already determined speed, with numbers 0.8; 2; 0.5; 0.4. Values were obtained in SI. Add appropriate units, explain '0.4 m/s' in particular and explain why units cannot be arbitrarily exchanged between rows.
  - Expected performance (DE): Ordnet 0,8 m, 2 s, 0,5 kg und 0,4 m/s zu. Erläutert Meter pro Sekunde als Wegänderung pro Zeit und die Einheit als Kennzeichnung der Größenart; beschreibt, wie andere Gruppen dieselben Angaben nachvollziehbar vergleichen können. Es wird keine neue Bewegungsgleichung verlangt.
  - Expected performance (EN): Assigns 0.8 m, 2 s, 0.5 kg and 0.4 m/s. Explains metres per second as distance change per time and the unit as identifying the quantity type; describes how other groups can meaningfully compare the same entries. No new equation of motion is required.
  - Understanding focus (DE): Auch abgeleitete Einheiten erhalten ihre Bedeutung aus den verknüpften physikalischen Größen.
  - Understanding focus (EN): Derived units also gain their meaning from the physical quantities they combine.
## Page 4: Physikalische Informationen aus Quellen auswerten

- Full learning-goal ID: `d2e6f87d-795b-5631-a7cc-0bfb5dc5142e`
- Goal fingerprint: `sha256:2363816861390cb79be8b7933efd92a386ffd1b828a998dc0dd5d2344a6188c7`
- Page fingerprint: `sha256:5ca52aef079eaf85cd3a351dcdb1734d638ba372645b17aaf6c05f32676b3da8`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann Informationen aus vorgegebenen oder selbst recherchierten Quellen entnehmen, nach fachlicher Relevanz ordnen und mit vorhandenen physikalischen Kenntnissen abgleichen.

### Visualization

/assets/goal-visualizations/physik/d2e6f87d-795b-5631-a7cc-0bfb5dc5142e/d2e6f87d-795b-5631-a7cc-0bfb5dc5142e.jpg

- original digest: `sha256:2d05a83e280e61792ad79fd01a2a9caf34a22834936bbe99e8859a2638da5890`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- SI-Einheiten in physikalischen Beispielen nutzen — `3ed3279e-c524-5230-a277-dda89493df6d` (page 3)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Funktion physikalischer Modelle erläutern — `e5bc2227-d900-585f-8ac0-9d3f1cb40e27` (outside this book)

### Direct reverse prerequisites outside this book

- Sonnenaktivität und Weltraumwetter fachlich beurteilen — `4e823349-b60c-5d2a-b96f-d3f23ae50e3a` (outside this book)
- Offene kosmologische Fragen quellenkritisch einordnen — `6ae54ff9-dc3b-563b-b2ee-09a0f0d00162` (outside this book)
- Physikalische Arbeitsergebnisse fachsprachlich präsentieren — `6d323d54-0aee-55d0-a9e1-ef2efdea0346` (outside this book)
- Prüfungsaufgabe: Quellen fachlich ordnen und prüfen — `84d4167d-415b-5c06-9d1f-23200b793837` (outside this book)
- Himmelskörper des Sonnensystems physikalisch klassifizieren — `982df2f3-e040-5f4b-b668-0fe05d994b29` (outside this book)
- Physikalische Bewertungen begründet formulieren — `b378c8b3-5e83-5abf-8243-b0f345037bfc` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e2551e20f57b7212de8cbac40f8443953a6c717f3f07029258ca1224e69aca2e`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `quellenbezug`
  - Essential understanding (DE): Physikalisch relevante Information hängt von Fragestellung, Größe, Einheit und Randbedingungen der Quelle ab; eine Zahl ohne diese Bezüge ist nicht vergleichbar.
  - Essential understanding (EN): Physically relevant information depends on the question, quantity, unit, and source conditions; a number without these links is not comparable.
  - Observable performance (DE): Entnimmt Angaben mit Herkunft und Bedingungen, ordnet relevante und irrelevante Inhalte und stellt vergleichbare Aussagen zusammen.
  - Observable performance (EN): Extracts information with provenance and conditions, separates relevant from irrelevant content, and assembles comparable statements.
- `fachabgleich`
  - Essential understanding (DE): Ein Abgleich mit bekannten Beziehungen kann Widersprüche oder Grenzen einer Quellenbehauptung zeigen, ohne fehlende Daten zu ersetzen.
  - Essential understanding (EN): Comparison with known relationships can reveal contradictions or limits in a source claim without replacing missing data.
  - Observable performance (DE): Prüft eine konkrete Behauptung mit passenden physikalischen Größen und kennzeichnet ausdrücklich, was sich aus den Quellen nicht entscheiden lässt.
  - Observable performance (EN): Tests a specific claim using appropriate physical quantities and explicitly states what the sources cannot decide.

**Coverage expectations**

- required expectations: `quellenbezug`, `fachabgleich`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `quellenkonflikt`: Unvereinbare Einheiten-/Leistungsbehauptung gegenüber unterschiedlicher Systemgrenze und ausgelassenen Verlusten. / Incompatible unit/power claim versus a different system boundary and omitted losses.

**Application cases**

- `leuchtmittelquellen`
  - Task demand (DE): Nutze drei ausdrücklich fiktive Quellenkarten: A, Messblatt, Lampe 8 W bei 800 lm; B, Werbetext, Vergleichslampe 40 W bei ebenfalls 800 lm, Behauptung 'fünfmal so viel elektrische Energie in einer Stunde'; C, Verpackung, Farbe des Gehäuses blau. Ordne Informationen für die Frage nach elektrischer Energie bei gleicher Lichtstromangabe und prüfe B.
  - Task demand (EN): Use three explicitly fictional source cards: A, measurement sheet, lamp 8 W at 800 lm; B, advertising text, comparison lamp 40 W at the same 800 lm, claiming 'five times as much electrical energy in one hour'; C, packaging, blue housing. Organize information about electrical energy at equal stated luminous flux and test B.
  - Expected performance (DE): Verweist auf A/B, verwendet E=P·t: 8 Wh und 40 Wh in einer Stunde, Verhältnis 5; die Behauptung gilt bei dieser Betriebsdauer und diesen Leistungswerten. Gehäusefarbe ist dafür irrelevant. Gleiche Lumen allein belegen weder gleichen Lichtkegel noch gleiche Lebensdauer; keine zusätzliche Qualitätsbewertung wird erfunden.
  - Expected performance (EN): References A/B and uses E=P·t: 8 Wh and 40 Wh in one hour, ratio 5; the claim holds for this duration and these power values. Housing colour is irrelevant. Equal lumens alone establish neither equal beam pattern nor equal service life; no additional quality assessment is invented.
  - Understanding focus (DE): Fragestellungsbezogene Quellenordnung mit überprüfbarem Größenabgleich.
  - Understanding focus (EN): Question-focused organization of sources with a checkable comparison of quantities.
- `pumpenquellen`
  - Task demand (DE): Fiktive Quellenkarten: A nennt 12 W elektrische Aufnahme einer Pumpe; B nennt 9 W mechanische Abgabe am Pumpenantrieb unter denselben Bedingungen; C behauptet, daraus folgten 12 W Nutzleistung im angehobenen Wasser; Förderhöhe und Durchfluss fehlen. Werte die Quellen für den Energieübertragungsweg aus. Es gilt ausdrücklich stationärer Betrieb ohne Änderung gespeicherter Energie und ohne weitere Energiequelle.
  - Task demand (EN): Fictional source cards: A gives a pump's electrical input as 12 W; B gives 9 W mechanical output at the pump drive under the same conditions; C claims that this implies 12 W useful power in the raised water; head and flow rate are missing. Evaluate the sources for the energy-transfer path. Steady operation without change in stored energy and without another energy source is explicitly assumed.
  - Expected performance (DE): Ordnet 12 W dem Eingang und 9 W einer späteren Schnittstelle zu; 3 W gehen schon bis dort in andere Übertragungen, η=0,75 für diesen Teil. C ist unter den gegebenen Bedingungen nicht gedeckt. Die Wasser-Nutzleistung ist ohne weitere Daten nicht exakt bestimmbar und kann hier höchstens 9 W sein; die fehlende Systemgrenze wird benannt.
  - Expected performance (EN): Assigns 12 W to the input and 9 W to a later interface; 3 W already goes to other transfers, with η=0.75 for that segment. C is unsupported under the given conditions. Useful water power cannot be determined exactly without further data and can be at most 9 W here; identifies the missing system boundary.
  - Understanding focus (DE): Quellenangaben zu verschiedenen Schnittstellen nicht als dieselbe Größe behandeln.
  - Understanding focus (EN): Do not treat source values at different interfaces as the same quantity.
## Page 5: Sehschwaechen mit dem Linse-Schirm-Modell untersuchen

- Full learning-goal ID: `ce14a7e7-7e2a-517f-a465-78ba3fbe414d`
- Goal fingerprint: `sha256:edbab211d37209035065c9bf6e91486bd2d5176e96baed868d4adca2d94a856a`
- Page fingerprint: `sha256:2709a69639eb798aec4dd2fa94c504446440cc2ac0fab622ffdb9089419a0196`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann Kurz- und Weitsichtigkeit mit dem Linse-Schirm-Modell experimentell untersuchen und Ergebnisse mit Vorhersagen der Linsengleichung vergleichen.

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

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:fe8e7c18c68c064a71edf4dec511078b78e99a8f2adf448f8d0e00b698eae664`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `experimental-eye-mapping`
  - Essential understanding (DE): Im Linse-Schirm-Modell kann eine feste Schirmlage die Netzhaut darstellen; ein davor oder dahinter liegender scharfer Bildort modelliert unterschiedliche Defokussierung, nicht eine vollständige klinische Diagnose.
  - Essential understanding (EN): In the lens-screen model, a fixed screen can represent the retina; a sharp image location in front of or behind it models different defocus conditions, not a complete clinical diagnosis.
  - Observable performance (DE): Die lernende Person plant einen sicheren optischen Aufbau, legt Gegenstandsweite, Brennweite und Netzhaut-Schirmlage fest und ermittelt den scharfen Bildort durch kontrolliertes Verschieben eines Messschirms.
  - Observable performance (EN): The learner plans a safe optical setup, specifies object distance, focal length and retinal-screen position and finds the sharp image location by controlled movement of a measuring screen.
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

- `myopic-model`
  - Task demand (DE): Plane mit einer schwachen LED-Objektmarke, dünner Sammellinse f=100 mm als entspanntem Modellauge ohne Akkommodation und Objektweite g=1000 mm ein Modell mit fester Netzhautposition b_R=120 mm. Bestimme den scharfen Bildort mit einem verschiebbaren zweiten Schirm und vergleiche mit 1/f=1/g+1/b. Frische bereitgestellte Messung: b=112±2 mm; f und g gelten im Vergleich als hinreichend genau. Deute den Defokus.
  - Task demand (EN): Using a low-power LED object mark, thin converging lens f=100 mm representing a relaxed model eye without accommodation and object distance g=1000 mm, plan a model with fixed retinal position b_R=120 mm. Find the sharp image using a second movable screen and compare with 1/f=1/g+1/b. Fresh supplied measurement: b=112±2 mm; f and g are sufficiently precise for this comparison. Interpret the defocus.
  - Expected performance (DE): Beschreibt Ausrichtung, konstantes f/g und Ablesen des schärfsten Bildes von der Linsenebene aus; vermeidet Sonne und Laser. Berechnet b≈111,1 mm, verträglich mit 112±2 mm und deutlich vor b_R. Deutet dies als kurzsichtiges Defokusmodell bei diesem entfernten Objekt; nennt subjektive Schärfeschätzung und das vereinfachte Auge als Grenzen.
  - Expected performance (EN): Describes alignment, constant f/g and reading the sharpest image location from the lens plane; avoids sunlight and lasers. Calculates b≈111.1 mm, compatible with 112±2 mm and clearly in front of b_R. Interprets this as a myopic defocus model for this distant object; identifies subjective focus estimation and the simplified eye as limits.
  - Understanding focus (DE): Eine nachprüfbare Bildlage vor der Modellnetzhaut trägt die Kurzsichtigkeitsdeutung.
  - Understanding focus (EN): A verifiable focus in front of the model retina supports the myopia interpretation.
- `hyperopic-near-model`
  - Task demand (DE): Ein unabhängiger Versuch verwendet ein anderes entspanntes Modellauge mit f=140 mm und fester Netzhautposition b_R=120 mm; Akkommodation wird im Versuch nicht nachgebildet. Das Objekt liegt bei g=420 mm. Plane den Vergleich von Netzhautbild und unabhängig gesuchtem Schärfeort. Frische Messung: scharf bei b=211±3 mm. Prüfe zusätzlich qualitativ den Grenzfall eines sehr fernen Objekts und erläutere, welche Modellbrennweite bei g=420 mm auf b_R fokussieren würde, ohne eine Brillenverordnung abzuleiten.
  - Task demand (EN): An independent experiment uses another relaxed model eye with f=140 mm and fixed retinal position b_R=120 mm; accommodation is not modelled in the experiment. The object is at g=420 mm. Plan comparison of the retinal image with an independently located focus. Fresh measurement: sharp at b=211±3 mm. Also check qualitatively the limit of a very distant object and explain which model focal length would focus at b_R for g=420 mm, without deriving an eyeglass prescription.
  - Expected performance (DE): Berechnet b=210 mm und beurteilt 211±3 mm als verträglich; der Fokus liegt hinter der Modellnetzhaut. Auch im Fernobjekt-Grenzfall liegt b=f=140 mm hinter b_R=120 mm: Damit trägt das ausdrücklich entspannte Modell eine Weitsichtigkeitsdeutung und zeigt nicht bloß unzureichende Nahakkommodation. Bei g=420 mm würde f≈93,3 mm auf b_R fokussieren. Trennt diese Modelländerung von klinischer Diagnose und hält Lichtquelle, Abstände und Messverfahren sicher kontrolliert.
  - Expected performance (EN): Calculates b=210 mm and judges 211±3 mm compatible; focus lies behind the model retina. Even in the distant-object limit, b=f=140 mm is behind b_R=120 mm: the explicitly relaxed model therefore supports a hyperopia interpretation rather than merely insufficient near accommodation. At g=420 mm, f≈93.3 mm would focus at b_R. Distinguishes this model change from clinical diagnosis and keeps light source, distances and measurement procedure safely controlled.
  - Understanding focus (DE): Modellierte Fehlsichtigkeit wird durch Lagevergleich und prüfbare optische Vorhersage erklärt.
  - Understanding focus (EN): Modelled refractive error is explained through position comparison and a testable optical prediction.
## Page 6: Auflösungsvermögen des Auges experimentell bestimmen

- Full learning-goal ID: `6d882aac-9658-5f0d-bf3d-9338f0143bbc`
- Goal fingerprint: `sha256:ba942ecff2a8316f96c58222984ebdb48fc13c44bc16da33bf799167f7bc6214`
- Page fingerprint: `sha256:d1f28cde7eaa31c137e7e6bf5e13a24a1c4cee075e88a19f2657d20cfeaa73df`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann das Auflösungsvermögen des eigenen Auges mit einem sicheren Versuch und einem vorab festgelegten Trennkriterium bestimmen, das Ergebnis mit einer beugungsoptischen Abschätzung vergleichen und zufällige sowie systematische Messunsicherheiten diskutieren.

### Visualization

/assets/goal-visualizations/physik/6d882aac-9658-5f0d-bf3d-9338f0143bbc/6d882aac-9658-5f0d-bf3d-9338f0143bbc.jpg

- original digest: `sha256:790ddd0c640ec3f9acda99380d34d839f3daa4f32d918569fda8bd21fe3482e2`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Beugungsbegrenzte Winkelauflösung des Auges abschätzen — `41872413-497e-5b88-ac65-365ed7d9851f` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:075fb2b4026ef317356948a49ea9b3fb73916ef652465d8ae83db07984e5b755`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `design-safe-resolution-test`
  - Essential understanding (DE): Eine reproduzierbare Bestimmung benötigt ein vorab festgelegtes Trennkriterium, bekannte Zielstruktur, kontrollierte Entfernung und Beleuchtung sowie eine ungefährliche Versuchsdurchführung.
  - Essential understanding (EN): A reproducible determination requires a pre-defined resolution criterion, a known target structure, controlled distance and illumination, and a safe experimental procedure.
  - Observable performance (DE): Die lernende Person formuliert eine testbare Frage, definiert das Kriterium vor der Messung, plant Wiederholungen und Kontrollen und rechnet Strukturgröße und Abstand in einen Grenzwinkel um.
  - Observable performance (EN): The learner formulates a testable question, defines the criterion before measurement, plans repeats and controls, and converts target size and distance into a limiting angle.
- `evaluate-uncertainty-and-model-comparison`
  - Essential understanding (DE): Streuung zwischen Wiederholungen ist von systematischen Einflüssen wie ungenauer Zielgröße, Entfernung, Kontrast, Korrektionszustand und Erwartung zu unterscheiden. Die Beugungsabschätzung beschreibt ein Idealmodell, nicht automatisch den Messwert.
  - Essential understanding (EN): Scatter among repeats must be distinguished from systematic effects such as uncertain target size, distance, contrast, optical correction, and expectation. The diffraction estimate describes an ideal model, not automatically the measured value.
  - Observable performance (DE): Die lernende Person gibt einen Messwert mit Unsicherheit an, diskutiert zufällige und systematische Beiträge und beurteilt eine Abweichung von der Beugungsgrenze ohne nachträgliche Änderung des Trennkriteriums.
  - Observable performance (EN): The learner reports a result with uncertainty, discusses random and systematic contributions, and assesses a deviation from the diffraction limit without changing the resolution criterion after the fact.

**Coverage expectations**

- required expectations: `design-safe-resolution-test`, `evaluate-uncertainty-and-model-comparison`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `test-pattern`: Linienpaar, Landolt-Ring oder periodisches Gitter mit definiertem Kriterium / Line pair, Landolt ring, or periodic grating with a defined criterion
- `viewing-condition`: Geänderter Abstand, Kontrast oder Beleuchtung / Changed distance, contrast, or illumination
- `uncertainty-source`: Wiederholungsstreuung, Geometriefehler oder Erwartungseinfluss / Repeatability scatter, geometric error, or expectation effect

**Application cases**

- `repeated-line-pair-threshold`
  - Task demand (DE): Bestimme mit gedruckten Linienpaaren bekannter Trennung und mehreren zufällig angeordneten Durchgängen den Grenzabstand, bei dem zwei Linien nach einem vorab notierten Kriterium getrennt werden. Berechne den Winkel und eine Unsicherheit.
  - Task demand (EN): Using printed line pairs of known separation and several randomized trials, determine the limiting distance at which two lines are resolved under a criterion written down in advance. Calculate the angle and an uncertainty.
  - Expected performance (DE): Die lernende Person arbeitet mit sicherer normaler Betrachtung, protokolliert Einzelwerte, berechnet den Kleinwinkel aus Struktur und Abstand, quantifiziert Streuung und Geometrieunsicherheit und meldet ein begrenztes Ergebnis.
  - Expected performance (EN): The learner uses safe normal viewing, records individual values, calculates the small angle from structure and distance, quantifies scatter and geometric uncertainty, and reports a bounded result.
  - Understanding focus (DE): Der Fall prüft vollständige Versuchsplanung, Auswertung und Unsicherheitsangabe.
  - Understanding focus (EN): The case assesses complete experimental planning, analysis, and uncertainty reporting.
- `contrast-and-lighting-replication`
  - Task demand (DE): Wiederhole den Test mit einem kontrastärmeren Muster oder geänderter Beleuchtung bei gleichem vorab festgelegtem Kriterium. Vergleiche beide Winkelwerte mit der Kreisblendenabschätzung und ordne die Differenzen ein.
  - Task demand (EN): Repeat the test with a lower-contrast pattern or changed illumination while keeping the pre-defined criterion. Compare both angular results with the circular-aperture estimate and interpret the differences.
  - Expected performance (DE): Die lernende Person kontrolliert die übrige Geometrie, vergleicht Ergebnisse samt Unsicherheiten, trennt einen biologisch-kontrastbedingten Effekt von der idealen λ/D-Grenze und benennt verbleibende systematische Unsicherheit.
  - Expected performance (EN): The learner controls the remaining geometry, compares results with uncertainties, distinguishes a biological contrast effect from the ideal λ/D limit, and states remaining systematic uncertainty.
  - Understanding focus (DE): Der unabhängige Transfer prüft Robustheit des Kriteriums und Modellvergleich.
  - Understanding focus (EN): The independent transfer assesses robustness of the criterion and model comparison.
## Page 7: Transistorstromverstärkung selbst experimentell untersuchen

- Full learning-goal ID: `d8b2b349-b83a-5225-a180-1afe205750cd`
- Goal fingerprint: `sha256:7632e2646d1bd36bd8eba5d0dcd22286ea46a0b11b06ace46fc665dcb1650b83`
- Page fingerprint: `sha256:e264e22b995edf9b4023de7fae8bd8f1eef4ef9424530b42b72dadde36789838`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann einen vollständig vorgegebenen Transistor-Gleichstromverstärker unter Aufsicht selbst aufbauen, Basis- und Kollektorströme sowie die Kollektor-Emitter-Spannung bei kontrolliert veränderter Ansteuerung selbst messen und daraus die Stromverstärkung im geprüften Arbeitsbereich mit bereitgestellten Auswertehilfen begründen und begrenzen.

### Visualization

/assets/goal-visualizations/physik/d8b2b349-b83a-5225-a180-1afe205750cd/d8b2b349-b83a-5225-a180-1afe205750cd.png

- original digest: `sha256:4571abb7ff73a373402063b93ad6efe2df2844f99483a7c8b799397ed275517e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Stromstärke in einfachen Stromkreisen messen — `f1a078ae-6262-4444-a4bc-a5ab275621cf` (outside this book)
- Spannung in einfachen Stromkreisen messen — `28237994-9c24-5a06-82fe-be1f494768ba` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Eigene Stromverstärkermessungen begründet auswerten — `c19d58dc-2c6e-53a9-8c74-991b55e6f2d0` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:7ed7872d677928eb7d3f6c27b82ef2708858bb0a01f220a563f7084394aa5ccf`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `actual-controlled-data`
  - Essential understanding (DE): Eigene zugeordnete Strom- und Spannungsmessungen bei kontrollierten Bedingungen sind notwendig, um eine stromverstärkende Wirkung im tatsächlichen Arbeitsbereich zu belegen.
  - Essential understanding (EN): Personal paired current and voltage measurements under controlled conditions are needed to establish current amplification in the actual operating range.
  - Observable performance (DE): Baut den vorgegebenen Versuch persönlich auf und dokumentiert für zwei Versorgungsbedingungen eigene, zugeordnete I_B-/I_C-/U_CE-Werte samt kontrollierten Bedingungen und punktweiser Bereichsprüfung.
  - Observable performance (EN): Personally assembles the supplied experiment and records personal paired I_B/I_C/U_CE values for two supply conditions with controls and per-point range checks.
- `quantity-and-energy-boundary`
  - Essential understanding (DE): Arbeitspunkt-Stromverhältnis und lokale Stromänderung sind verschiedene Aussagen; die Versorgung liefert Energie, und Stromdaten belegen keine universelle Spannungs- oder AC-Verstärkung.
  - Essential understanding (EN): Operating-point current ratio and local current change are distinct claims; the supply provides energy and current data do not establish universal voltage or AC gain.
  - Observable performance (DE): Deutet in beiden eigenen Reihen mit Hilfsmittel I_C/I_B und ΔI_C/ΔI_B getrennt, begründet die Steuerwirkung und die Versorgung als Energiequelle und begrenzt den Vergleich auf die gemessenen Bedingungen und Messauflösung.
  - Observable performance (EN): Uses the aid to interpret I_C/I_B and ΔI_C/ΔI_B separately in both personal series, explains control and supply energy, and bounds comparison by measured conditions and resolution.

**Coverage expectations**

- required expectations: `actual-controlled-data`, `quantity-and-energy-boundary`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `supply-condition`: 5-V-Reihe und nach tatsächlicher Versorgungsänderung frisch gemessene 4-V-Reihe bei gemeinsamen Basisströmen. / A 5 V series and a freshly measured 4 V series after a real supply change, at shared base-current points.

**Application cases**

- `own-5v`
  - Task demand (DE): Eigener Aufbau und eigene 5-V-Messreihe mit drei gültigen Strompaaren und U_CE-Prüfung; q, g, Steuerwirkung, Energiequelle und Grenzen erklären.
  - Task demand (EN): Personal assembly and 5 V series with three valid current pairs and U_CE checks; explain q, g, control, energy source and limits.
  - Expected performance (DE): Eigene Messbelege; gleiche Einheiten; zwei Verhältnisarten getrennt; Versorgung liefert Energie; Gültigkeit je Punkt geprüft.
  - Expected performance (EN): Personal measurement evidence, common units, distinct ratio meanings, supply energy and per-point eligibility.
  - Understanding focus (DE): Eigene kontrollierte Messung trägt eine begrenzte Verstärkungsaussage.
  - Understanding focus (EN): Personal controlled measurement supports a bounded gain claim.
- `own-4v-transfer`
  - Task demand (DE): Nach Änderung auf 4 V neu messen; gemeinsamen gültigen Bereich herstellen und die Aussagen mit eigenen neuen Daten vergleichen.
  - Task demand (EN): Remeasure at 4 V; establish a shared valid range and compare claims using fresh personal data.
  - Expected performance (DE): Neue B-Messungen statt A-Kopie; q/g und Energiebegründung auf B anwenden; Bedingungen und Grenzen des Vergleichs benennen.
  - Expected performance (EN): Fresh B readings rather than copied A; apply q/g and energy reasoning to B and state comparison conditions and limits.
  - Understanding focus (DE): Die ursprüngliche Aussage muss die geänderte reale Bedingung bestehen.
  - Understanding focus (EN): The original claim must be checked under a changed real condition.
## Page 8: Messwertänderungen pro Zeitintervall bestimmen

- Full learning-goal ID: `13b338eb-f761-5817-9058-11043b9cb253`
- Goal fingerprint: `sha256:958f442732409c3c9fb563d8bcfbe2f76e9e5afc6cf06b8590fff2ae15ebe8fd`
- Page fingerprint: `sha256:d4303cb13f93a9c42a054b275e2c177196d4d7a47274d965947623dd2f5195d0`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann aus zwei tabellierten oder graphisch gegebenen Messwerten die vorzeichenbehaftete Änderung und die zugehörige positive Zeitspanne bestimmen, ihren Quotienten mit Einheit berechnen und als mittlere Änderung pro Zeiteinheit im gewählten Intervall deuten. Sie unterscheidet diesen Wert vom einzelnen Messwert und von Aussagen über jeden Zeitpunkt.

### Visualization

/assets/goal-visualizations/physik/13b338eb-f761-5817-9058-11043b9cb253/13b338eb-f761-5817-9058-11043b9cb253.png

- original digest: `sha256:bd46d9ec94f497d9c83a72dbf25625eaaa99d0c335eb03fc4562990b6fc6a14e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Bewegungen mit Diagrammen untersuchen — `ce431132-dfc4-42c2-aff6-bd72035190f8` (page 9)
- Elektrische Stromstärke als Ladungsrate deuten — `bbee4c52-4e95-5529-990f-706aa99316a3` (page 10)
- Geschwindigkeitspfeile aus einer Video-Bildfolge bestimmen und vergleichen — `d61ea362-f6c3-5eab-ac30-2d0e265ac0f6` (page 12)
- Einen angeleiteten Versuch zur mittleren Beschleunigung planen und auswerten — `677a192d-8bbe-57fc-bb7a-1c1ed5fba32b` (page 13)

### Prerequisites outside this book

- Rationale Zahlen addieren und subtrahieren — `4eeab7d5-eeb3-579b-845e-1c52ffe9e89f` (outside this book)
- Rationale Zahlen multiplizieren und dividieren — `ee48e811-4c9c-5080-9836-8403fc9f0810` (outside this book)
- Achsen, Skalen und Einheiten lesen — `80c232f1-8f72-5829-9dbe-5a610ccab3be` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Eine Bewegung digital auswerten — `367b17f8-972a-5f3e-8915-8cfe743132a3` (outside this book)
- Messwerte: Änderungen im passenden Zeitintervall — `a344295c-c346-58ea-8c69-f3e9caa9c7b6` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b9fe3b6edf6501dcd307c2934eb90f429769e700fe25bead3719f2d9f2705286`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `matched-differences`
  - Essential understanding (DE): Eine mittlere Messwertänderung pro Zeit ist die vorzeichenbehaftete Differenz zweier Messwerte geteilt durch die positive Zeitspanne zwischen genau diesen Messungen. Ein von null verschiedener Anfangswert wird mit abgezogen.
  - Essential understanding (EN): An average measured change per time is the signed difference between two measured values divided by the positive elapsed time between exactly those measurements. A nonzero initial value is subtracted.
  - Observable performance (DE): Bestimmt aus Tabelle oder skaliertem Diagramm beide Endpunkte, bildet passende Differenzen und rechnet mit Einheit.
  - Observable performance (EN): Identifies both endpoints in a table or scaled graph, forms matching differences, and calculates with units.
- `bounded-physical-interpretation`
  - Essential understanding (DE): Vorzeichen und zusammengesetzte Einheit bezeichnen eine mittlere Veränderung im gewählten Intervall; Messwerthöhe, absolute Zeit und Verlauf zwischen den Punkten sind andere Informationen.
  - Essential understanding (EN): The sign and compound unit describe an average change over the chosen interval; measured height, absolute time, and the course between the points are different information.
  - Observable performance (DE): Deutet positive, negative und verschwindende Mittelwerte, vergleicht Intervalle und begründet, warum zwei Endpunkte keinen Verlauf zu jedem Zeitpunkt festlegen.
  - Observable performance (EN): Interprets positive, negative, and zero averages, compares intervals, and explains why two endpoints do not determine the course at every instant.

**Coverage expectations**

- required expectations: `matched-differences`, `bounded-physical-interpretation`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `data-and-sign`: Tabellierte Ortswerte und unabhängig graphisch dargestellte Temperaturwerte; positive, negative und verschwindende Änderungen. / Tabulated positions and independently graphed temperatures; positive, negative, and zero changes.
- `origin-and-duration`: Nichtnull-Anfangswerte, Startzeiten ungleich null und unterschiedlich lange Intervalle. / Nonzero initial values, nonzero start times, and intervals of different duration.

**Application cases**

- `position-intervals`
  - Task demand (DE): Ein Wagen hat bei 2 s den Ort 4 m, bei 5 s den Ort 10 m und bei 7 s wieder 4 m. Bestimme und deute beide Intervallmittel und den Gesamtmittelwert.
  - Task demand (EN): A cart is at 4 m at 2 s, 10 m at 5 s, and back at 4 m at 7 s. Determine and interpret both interval averages and the overall average.
  - Expected performance (DE): +2 m/s, −3 m/s und 0 m/s auf [2,7] s; der letzte Wert bedeutet gleiche Anfangs- und Endposition, nicht ständige Ruhe.
  - Expected performance (EN): +2 m/s, −3 m/s, and 0 m/s over [2,7] s; the last value means equal initial and final position, not continuous rest.
  - Understanding focus (DE): Passende Differenzen und Vorzeichen; Ortsänderung von Strecke unterscheiden.
  - Understanding focus (EN): Matched differences and signs; distinguish displacement from distance.
- `temperature-transfer`
  - Task demand (DE): Lies in einem neuen Zeit-Temperatur-Diagramm 18 °C bei 3 min und 12 °C bei 7 min ab. Bestimme die mittlere Abkühlrate und prüfe, ob jede Minute genau diese Abnahme stattfand.
  - Task demand (EN): Read 18 °C at 3 min and 12 °C at 7 min from a fresh time-temperature graph. Find the average cooling rate and assess whether every minute had exactly this decrease.
  - Expected performance (DE): −1,5 °C/min im Intervall; konstante Abnahme ist aus den Endpunkten nicht gesichert.
  - Expected performance (EN): −1.5 °C/min over the interval; constant decrease is not established by the endpoints.
  - Understanding focus (DE): Unabhängiger Kontextwechsel ohne Funktionsterm oder Grenzübergang.
  - Understanding focus (EN): Independent context change without a function expression or limit.
## Page 9: Bewegungen mit Diagrammen untersuchen

- Full learning-goal ID: `ce431132-dfc4-42c2-aff6-bd72035190f8`
- Goal fingerprint: `sha256:fdb9aaed7b4d18b35518e3f312886605c2334b0f8df1ee1291536d53c673c0a1`
- Page fingerprint: `sha256:a198b4f745e6b5f58afc787da0462d348d1a32a81162faac20bb91a5b3e6dbf6`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann einfache eindimensionale Bewegungen experimentell erfassen, Orts-Zeit-Daten und daraus bestimmte mittlere Intervallgeschwindigkeiten in t-s- und t-v-Diagrammen darstellen und interpretieren. Sie berücksichtigt Messauflösung, Ruhe und Bewegungsrichtung und prüft die Konsistenz von Ortsänderungen und vorzeichenbehafteten Flächen im stückweise gleichförmigen Modell.

### Visualization

/assets/goal-visualizations/physik/ce431132-dfc4-42c2-aff6-bd72035190f8/ce431132-dfc4-42c2-aff6-bd72035190f8.png

- original digest: `sha256:be3f36111cfb9e8187215891618f23904aa58e1e320d69264bfd7da57ed5387a`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Messwertänderungen pro Zeitintervall bestimmen — `13b338eb-f761-5817-9058-11043b9cb253` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Bewegungen mit Weg-Zeit-Diagrammen beschreiben — `ae67bcf1-f3ee-50d6-9a12-25a159dff659` (outside this book)
- Umfang und Flächeninhalt unterscheiden und anwenden — `d6c3fb37-ece6-5b56-9221-1eeb21845877` (outside this book)
- Punktlagen und daraus bestimmte lineare Objekte im Koordinatensystem darstellen — `25593605-5e13-55cc-9a05-8f3d737e15e9` (outside this book)
- Messunsicherheiten angeben — `f6b1d812-ce8b-5852-b417-e6c29b533c7a` (outside this book)

### Direct reverse prerequisites outside this book

- Gleichförmige Bewegung und Geschwindigkeit — `971beafa-6ba5-4c82-ac8b-7ebf66eec3dd` (outside this book)
- Eigene Bewegungsmessung und unabhängiges Geschwindigkeitsprotokoll — `cd182a3c-be23-5f5a-87f6-0898ea16cb74` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:04c42219f282a011630f992f16cbf932f8492c1cf0376d8a320b1417352926d9`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `measured-position-derived-interval-velocity`
  - Essential understanding (DE): t-s und t-v stellen dieselbe eindimensionale Bewegung durch gemessene Orte und daraus bestimmte mittlere Intervallgeschwindigkeiten dar. Vorzeichen hängen von der vereinbarten Achsenrichtung ab; ein waagerechter t-s-Abschnitt bedeutet Ruhe, ein waagerechter t-v-Abschnitt konstante Geschwindigkeit.
  - Essential understanding (EN): Time-position and time-velocity graphs represent the same one-dimensional motion through measured positions and average interval velocities determined from them. Signs depend on the agreed axis direction; a horizontal time-position interval means rest, while a horizontal time-velocity interval means constant velocity.
  - Observable performance (DE): Erfasst eigene Zeit-Ort-Daten einer sicheren einfachen Bewegung, trennt gemessene und berechnete Größen, zeichnet beschriftete Diagramme und erklärt Ruhe, Hin- und Rückbewegung.
  - Observable performance (EN): Records their own time-position data for a safe simple motion, distinguishes measured and calculated quantities, draws labelled graphs, and explains rest, outward motion, and return motion.
- `measurement-resolution-bounds-graph-consistency`
  - Essential understanding (DE): Differenzbildung kann Positionsrauschen im Geschwindigkeitswert verstärken. Die Flächen unter einem stückweise konstanten t-v-Modell entsprechen vorzeichenbehafteten Ortsänderungen; Zwischenbewegungen sind durch diskrete Messpunkte nicht vollständig festgelegt.
  - Essential understanding (EN): Differencing can amplify positional noise in velocity values. Areas under a piecewise-constant time-velocity model equal signed displacements; discrete measurements do not fully determine the intervening motion.
  - Observable performance (DE): Wählt begründet Auswerteintervalle, kennzeichnet Ortsauflösung und Geschwindigkeitsmittel, trennt messbedingte Schwankungen von gesicherten Richtungswechseln und prüft aus einem neuen t-v-Modell die vorhergesagten Ortsmarken.
  - Observable performance (EN): Justifies analysis intervals, indicates position resolution and average velocities, distinguishes measurement fluctuations from established reversals, and checks predicted position marks from a fresh time-velocity model.

**Coverage expectations**

- required expectations: `measured-position-derived-interval-velocity`, `measurement-resolution-bounds-graph-consistency`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `motion-sequence`: Ruhe, stückweise gleichförmige Abschnitte und Richtungswechsel; bei ungleichförmigen Abschnitten nur Intervallmittel. / Rest, piecewise-uniform intervals, and reversals; only interval averages for nonuniform intervals.
- `acquisition-quality`: Abtastintervall, Ortsauflösung und Messrauschen. / Sampling interval, position resolution, and measurement noise.
- `given-representation-and-axis`: Eigene Ortsmessung und unabhängiger Ausgangspunkt im t-v-Modell, auch bei umgekehrter Achse. / Own position measurements and an independent starting point in a time-velocity model, including a reversed axis.

**Application cases**

- `own-cart-stop-return`
  - Task demand (DE): Erfasse eine sichere Wagenbewegung mit einem Hinweg, einer Pause und einer Rückbewegung. Erstelle eine Messwerttabelle sowie t-s- und t-v-Diagramme, kennzeichne Intervallmittel und untersuche Messauflösung.
  - Task demand (EN): Record a safe cart motion with an outward interval, a pause, and a return interval. Produce a data table and time-position and time-velocity graphs, label interval averages, and examine measurement resolution.
  - Expected performance (DE): Eigene Daten und Messverfahren sind dokumentiert; Steigungen, Vorzeichen und Ruhe passen zusammen. Einzelne Intervallmittel werden nicht als gesicherte Momentangeschwindigkeiten ausgegeben.
  - Expected performance (EN): Own data and measurement method are documented; slopes, signs, and rest are consistent. Individual interval averages are not presented as established instantaneous velocities.
  - Understanding focus (DE): Experimentelle Erfassung und konsistente zwei Darstellungen.
  - Understanding focus (EN): Experimental acquisition and two consistent representations.
- `velocity-log-position-marks`
  - Task demand (DE): Ein neues stückweise konstantes t-v-Modell und ein Anfangsort sind gegeben. Sage Ortsmarken voraus und vergleiche sie mit unabhängigen Kontrollmarken samt Auflösung; kehre anschließend die Achsenrichtung um.
  - Task demand (EN): Given a fresh piecewise-constant time-velocity model and initial position, predict position marks and compare them with independent check marks and their resolution; then reverse the axis direction.
  - Expected performance (DE): Vorzeichenbehaftete Rechtecksflächen ergeben die Ortsänderungen; ein Richtungswechsel wird von einem Aufenthalt getrennt. Achsenumkehr ändert Vorzeichen, nicht die Bewegung.
  - Expected performance (EN): Signed rectangular areas give displacements; a reversal is distinguished from a period of rest. Reversing the axis changes signs, not the motion.
  - Understanding focus (DE): Transfer von t-v nach t-s ohne vorgezogene Beschleunigung.
  - Understanding focus (EN): Transfer from time-velocity to time-position without introducing acceleration early.
## Page 10: Elektrische Stromstärke als Ladungsrate deuten

- Full learning-goal ID: `bbee4c52-4e95-5529-990f-706aa99316a3`
- Goal fingerprint: `sha256:9d5ed3dfbabad376b8af66a428d1fe19620e6eef69e3d4891fc587f6214b05f1`
- Page fingerprint: `sha256:232d289fdfa6c9bf56d2d19d2b90158f167470ba642c2dd27a85f288baab6b52`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann die mittlere elektrische Stromstärke als durch einen Querschnitt transportierte Ladung pro Zeitintervall mit I = ΔQ/Δt deuten, Berechnungen durchführen und den Einheitenzusammenhang 1 A = 1 C/s erklären.

### Visualization

/assets/goal-visualizations/physik/bbee4c52-4e95-5529-990f-706aa99316a3/bbee4c52-4e95-5529-990f-706aa99316a3.jpg

- original digest: `sha256:f31cfc45fb7f351f4cfa70885b4586d4b3c7483e11e52c6897e1e32daa7b6150`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Messwertänderungen pro Zeitintervall bestimmen — `13b338eb-f761-5817-9058-11043b9cb253` (page 8)

### Direct reverse prerequisites

- Coulomb'sches Gesetz — `8da5c981-8216-5fcd-a393-19f392ae2006` (page 11)

### Prerequisites outside this book

- Ladungsphänomene und Reibungselektrizität — `a6e48b88-51ed-5942-bdb8-8d2192652e0d` (outside this book)

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
## Page 11: Coulomb'sches Gesetz

- Full learning-goal ID: `8da5c981-8216-5fcd-a393-19f392ae2006`
- Goal fingerprint: `sha256:0dd1e4495d2909dc58cc4e25236e154d0a6cb0b7dd6ff69a5c5d2813b27dc3f5`
- Page fingerprint: `sha256:ccb4ba89fed8eb798277ac533bb31469009019b0b6bac0c37fed6365a99a37ea`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann die elektrische Kraft zwischen Punktladungen quantitativ mit dem Coulomb'schen Gesetz berechnen und den Zusammenhang zur Feldstärke begründen.

### Visualization

/assets/goal-visualizations/physik/8da5c981-8216-5fcd-a393-19f392ae2006/8da5c981-8216-5fcd-a393-19f392ae2006.jpg

- original digest: `sha256:cee2fe9318c00fbaa7ba750cdc5e4beb23d417c0c433c45efbc552563f89446a`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Elektrische Stromstärke als Ladungsrate deuten — `bbee4c52-4e95-5529-990f-706aa99316a3` (page 10)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Termwerte durch Einsetzen berechnen — `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Q1 — `69f0038a-6e2b-55b5-8ff0-d2ea8852e793` (outside this book)
- Radialsymmetrische elektrische Felder beschreiben — `98e42cda-9e5d-5910-b2c0-3e631fd20c78` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:446f42644a417b9721d318a5dfe531bbb5014f4abbb18c628fbdd709732418f5`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `apply-coulomb-law-as-vector-relation`
  - Essential understanding (DE): Für Punktladungen ist der Kraftbetrag proportional zu |q₁q₂|/r²; die Kraft liegt auf der Verbindungslinie. Gleiche Vorzeichen führen zu Abstoßung, ungleiche zu Anziehung, und das Modell setzt punktförmige beziehungsweise hinreichend kleine kugelsymmetrische Ladungen voraus.
  - Essential understanding (EN): For point charges, force magnitude is proportional to |q₁q₂|/r² and the force lies along the joining line. Like signs repel and unlike signs attract, and the model assumes point-like or sufficiently small spherically symmetric charges.
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
  - Task demand (DE): Zwei Punktladungen mit gegebenen Vorzeichen und Abstand werden zunächst berechnet; danach wird ein Vorzeichen umgekehrt und der Abstand verdoppelt. Sage Richtung und Faktoränderung vor der Rechnung voraus und bestimme anschließend beide Kraftvektoren.
  - Task demand (EN): Two point charges with given signs and separation are first calculated; then one sign is reversed and the separation is doubled. Predict direction and scale factor before calculating and then determine both force vectors.
  - Expected performance (DE): Die lernende Person nutzt Beträge und Vorzeichen getrennt, zeichnet entgegengesetzte Wechselwirkungskräfte entlang der Verbindungslinie, erwartet den Faktor 1/4 beim doppelten Abstand und prüft Einheit sowie Plausibilität.
  - Expected performance (EN): The learner handles magnitudes and signs separately, draws opposite interaction forces along the joining line, expects a factor of 1/4 at twice the separation, and checks units and plausibility.
  - Understanding focus (DE): Der Fall prüft das Coulomb-Gesetz als physikalische Vektorbeziehung statt als Einsetzschema.
  - Understanding focus (EN): The case assesses Coulomb’s law as a physical vector relation rather than a substitution recipe.
- `field-from-two-test-charges`
  - Task demand (DE): Am selben Ort werden nacheinander zwei hinreichend kleine Probeladungen unterschiedlichen Betrags und Vorzeichens eingesetzt; ihre Kräfte sind angegeben. Bestimme E aus beiden Messungen, erkläre die Richtungen und entscheide, ob die Daten zu demselben Quellenfeld passen.
  - Task demand (EN): At the same location, two sufficiently small test charges of different magnitude and sign are used in succession; their forces are supplied. Determine E from both measurements, explain the directions, and decide whether the data fit the same source field.
  - Expected performance (DE): Die lernende Person teilt vektoriell beziehungsweise vorzeichenrichtig durch q_test, erhält dieselbe Feldstärke, erklärt die Richtungsumkehr der Kraft bei negativer Ladung und trennt Feldquelle von Probeladung.
  - Expected performance (EN): The learner divides vectorially or with correct signs by q_test, obtains the same field strength, explains reversal of force for a negative charge, and distinguishes the field source from the test charge.
  - Understanding focus (DE): Der unabhängige Transfer macht E = F/q und Probeladungsunabhängigkeit direkt beobachtbar.
  - Understanding focus (EN): The independent transfer makes E = F/q and test-charge independence directly observable.
## Page 12: Geschwindigkeitspfeile aus einer Video-Bildfolge bestimmen und vergleichen

- Full learning-goal ID: `d61ea362-f6c3-5eab-ac30-2d0e265ac0f6`
- Goal fingerprint: `sha256:178e3f845a82a3f40f6b74550bce4c26a65a20987a211462a7cf863b1dc38422`
- Page fingerprint: `sha256:0bd2712eeaffd47351e33f4373327348144b411ff4eb31283c6493260d372441`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann in einer zeitlich und räumlich kalibrierten Bildfolge einer zweidimensionalen Bewegung aus den Ortsänderungen über kurze gleiche Zeitintervalle maßstäbliche Geschwindigkeitspfeile konstruieren, die Näherung für den jeweiligen Zeitpunkt benennen und Änderungen der Geschwindigkeit grafisch bestimmen.

### Visualization

/assets/goal-visualizations/physik/d61ea362-f6c3-5eab-ac30-2d0e265ac0f6/d61ea362-f6c3-5eab-ac30-2d0e265ac0f6.png

- original digest: `sha256:09400cf2450355c928dcac623bf0ec1f5e95a93496e73ad0fa73450b60b5e680`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Messwertänderungen pro Zeitintervall bestimmen — `13b338eb-f761-5817-9058-11043b9cb253` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Geschwindigkeitspfeile in einem echten Bewegungsvideo konstruieren — `fbaeed34-81a0-5955-9777-bf103002feee` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:51e153f9a76f918abdd8a642f0af8e64de47e19d13c03e3d3e6aad4a194a0212`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `scaled-local-velocity`
  - Essential understanding (DE): Eine Ortsänderung über ein kurzes bekanntes Zeitfenster liefert einen Geschwindigkeitspfeil mit Bewegungsrichtung und maßstäblichem Betrag; ein Intervallmittel ist nur näherungsweise ein Zeitpunktwert.
  - Essential understanding (EN): A displacement over a short known window gives a velocity arrow with motion direction and scaled magnitude; an interval average only approximates an instantaneous value.
  - Observable performance (DE): Kalibriert eine reale Bildfolge, konstruiert zwei kurze gleich lange Messfenster und maßstäbliche Pfeile und benennt Auflösung und Zeitzuordnung.
  - Observable performance (EN): Calibrates a real image sequence, constructs two short equal-duration windows and scaled arrows, and states resolution and timing.
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
  - Task demand (DE): Untersuche einen neuen echten Clip vor/nach einem Richtungswechsel.
  - Task demand (EN): Analyze a fresh real clip before/after a turn.
  - Expected performance (DE): Zwei kalibrierte Pfeile mit Zeitfenstern und grafisches Δv.
  - Expected performance (EN): Two calibrated arrows with windows and graphical Δv.
  - Understanding focus (DE): Eigene Auswertung eines realen Artefakts.
  - Understanding focus (EN): Own analysis of a real artifact.
- `fresh-equal-speed-direction`
  - Task demand (DE): Werte einen zweiten neuen echten Clip mit ähnlichem Betrag und anderer Richtung aus.
  - Task demand (EN): Analyze a second fresh real clip with similar magnitude and a changed direction.
  - Expected performance (DE): Begründet an echten maßstäblichen Pfeilen ein nichtverschwindendes Δv trotz ähnlichem Betrag.
  - Expected performance (EN): Uses actual scaled arrows to explain nonzero Δv despite similar magnitudes.
  - Understanding focus (DE): Unabhängiger Richtungs-/Betragstransfer.
  - Understanding focus (EN): Independent direction/magnitude transfer.
## Page 13: Einen angeleiteten Versuch zur mittleren Beschleunigung planen und auswerten

- Full learning-goal ID: `677a192d-8bbe-57fc-bb7a-1c1ed5fba32b`
- Goal fingerprint: `sha256:15602a40dc7b6683d40f036c98f49761a898eb2e4fbcbcc686503b328437db59`
- Page fingerprint: `sha256:8eb27fa5ad6f25d57d9119564f3d6bc7fea4cae78fc8907d08b69164664fa2d7`
- Topic path: Aktueller begrenzter K3/K6-Reviewumfang

### Canonical description

Die lernende Person kann unter Anleitung vor der Erfassung einen sicheren geradlinigen Bewegungsversuch mit Aufbauskizze, begründeter tatsächlicher Zeitbasis und geplanten kurzen Messfenstern beziehungsweise Auswahlregel planen und anschließend selbst durchführen. Aus zwei lokalen Geschwindigkeitsmitteln und dem Abstand der Fenstermitten gewinnt sie eine Näherung der mittleren Beschleunigung und beurteilt Vorzeichen und Messgrenzen. Ein zweiter echter Durchgang mit veränderter Bedingung wird evidenzbezogen verglichen; sowohl auflösbare Unterschiede als auch Übereinstimmung innerhalb der Messgrenzen sind möglich. Sensor oder Video ist möglich; ein globaler Bewegungsfit wird nicht vorausgesetzt.

### Visualization

/assets/goal-visualizations/physik/677a192d-8bbe-57fc-bb7a-1c1ed5fba32b/677a192d-8bbe-57fc-bb7a-1c1ed5fba32b.png

- original digest: `sha256:72b451b25ed978fb4ae77f69aa193076576a5b4192562cbb320cbdf9524eb784`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Messwertänderungen pro Zeitintervall bestimmen — `13b338eb-f761-5817-9058-11043b9cb253` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

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

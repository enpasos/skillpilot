# AI review input: Physik – aktuelle gemeinsame P-Kontexte (1/2)

- Book ID: `physik-joint-current-twenty-contexts-20261015-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:4f61ee4319d93b19d1b0b804bd2d5823287c4107bae855ced4abd54dfb76414c`
- Selected goals: 20

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Leistung als Energie pro Zeit bestimmen und deuten

- Full learning-goal ID: `b92827a7-5d62-5fdb-a6f5-ac44461f4a7b`
- Goal fingerprint: `sha256:97cdb2555a80b1c50b949babfc59ddadb021f0dc769d121b34a39434e7aa19f8`
- Page fingerprint: `sha256:19b355c59c64853b24559937eda0ae93061a2afaac8f103d303feabd45b52b73`
- Topic path: Physik > Sekundarstufe I > Mechanische Grundlagen (Sek I) > Arbeit und Energie qualitativ deuten > Leistung und Wirkungsgrad

### Canonical description

Die lernende Person kann Leistung als übertragene oder umgewandelte Energie pro Zeit bestimmen, passende Einheiten verwenden und bei gleicher Energie erklären, warum eine kürzere Dauer einer größeren Leistung entspricht.

### Visualization

/assets/goal-visualizations/physik/b92827a7-5d62-5fdb-a6f5-ac44461f4a7b/b92827a7-5d62-5fdb-a6f5-ac44461f4a7b.jpg

- original digest: `sha256:bf9b07bd5f15b09eed2a6ec0e73b431636767d4382e3e0575406c388703b5ac0`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Rationale Zahlen multiplizieren und dividieren — `ee48e811-4c9c-5080-9836-8403fc9f0810` (outside this book)
- Mechanische Energieformen qualitativ unterscheiden — `722857cf-f327-5740-8151-64eb92195ec8` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Leistung und Wirkungsgrad eines Hebezeugs vergleichen — `0b8aff9a-6c77-51b9-82d4-725a21f32a90` (outside this book)
- Elektrische Leistung und Wirkungsgrad bilanzieren — `46e42b07-c098-5d65-8ef5-8472b7c4d8e2` (outside this book)
- Elektrische Geräte- und Akkuangaben physikalisch deuten — `27b90ce9-b650-5232-85fb-ce2cb69d59a3` (outside this book)
- Idealen Transformator quantitativ deuten — `af1094c1-511a-5aae-9e0a-3e9196a82d9a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5c7901d4f1ca809e2973d312bb9d35d0f092bf854eb38081ddb314a6142c045f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `power-rate-meaning`
  - Essential understanding (DE): Leistung ist übertragene oder umgewandelte Energie pro Zeit, P=E/t; ein Watt ist ein Joule pro Sekunde. Hohe Leistung bedeutet eine hohe Rate, nicht automatisch viel Gesamtenergie.
  - Essential understanding (EN): Power is energy transferred or converted per unit time, P=E/t; one watt is one joule per second. High power means a high rate, not automatically a large total energy.
  - Observable performance (DE): Die lernende Person identifiziert Energie und Dauer in einem neuen Vorgang, berechnet die mittlere Leistung mit kompatiblen Einheiten und deutet den Wert als Rate.
  - Observable performance (EN): The learner identifies energy and duration in a new process, calculates average power with compatible units, and interprets the value as a rate.
- `comparison-and-inverse-time`
  - Essential understanding (DE): Bei gleicher Energie führt kürzere Dauer zu größerer Leistung; bei gleicher Leistung wächst die übertragene Energie mit der Dauer. Aussagekräftige Vergleiche müssen daher zwei der drei Größen kontrollieren.
  - Essential understanding (EN): For the same energy, a shorter duration gives greater power; for the same power, transferred energy grows with duration. Meaningful comparisons must therefore control two of the three quantities.
  - Observable performance (DE): Die lernende Person vergleicht unbekannte Geräte- oder Bewegungsfälle, hält die passende Größe konstant und widerlegt eine Rangfolge, die nur Wattzahl oder nur Dauer betrachtet.
  - Observable performance (EN): The learner compares unfamiliar device or motion cases, holds the relevant quantity constant, and refutes a ranking based only on wattage or only on duration.

**Coverage expectations**

- required expectations: `power-rate-meaning`, `comparison-and-inverse-time`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `controlled-quantity`: Gleiche Energie bei verschiedener Dauer oder gleiche Leistung bei verschiedener Dauer / Same energy over different durations or same power over different durations
- `unit-system`: Joule und Sekunden oder Kilojoule und Minuten mit notwendiger Umrechnung / Joules and seconds or kilojoules and minutes requiring conversion

**Application cases**

- `stair-climb-power`
  - Task demand (DE): Zwei Personen gewinnen beim Treppensteigen jeweils 4,8 kJ Lageenergie, benötigen aber 6 s und 10 s. Ihre Leistungen sind zu berechnen und zu deuten.
  - Task demand (EN): Two people each gain 4.8 kJ of gravitational energy climbing stairs but take 6 s and 10 s. Calculate and interpret their powers.
  - Expected performance (DE): Die lernende Person rechnet 4 800 J durch die jeweilige Zeit zu 800 W und 480 W und erklärt die höhere Leistung durch dieselbe Energie in kürzerer Zeit.
  - Expected performance (EN): The learner divides 4,800 J by each time to obtain 800 W and 480 W and explains the higher power as the same energy in less time.
  - Understanding focus (DE): Einheitenrechnung und kontrollierter Energievergleich sichern die Ratendeutung.
  - Understanding focus (EN): Unit calculation and controlled energy comparison secure the rate interpretation.
- `wattage-duration-countercase`
  - Task demand (DE): Ein 2-kW-Gerät läuft 3 min, ein 1-kW-Gerät 10 min. Die Behauptung „Das 2-kW-Gerät überträgt immer mehr Energie“ ist zu prüfen.
  - Task demand (EN): A 2 kW device runs for 3 min and a 1 kW device for 10 min. Evaluate “The 2 kW device always transfers more energy.”
  - Expected performance (DE): Die lernende Person berechnet 0,1 kWh gegenüber 1/6 kWh oder entsprechende Joulewerte und verwirft die Aussage wegen der unterschiedlichen Dauer.
  - Expected performance (EN): The learner calculates 0.1 kWh versus 1/6 kWh or equivalent joule values and rejects the claim because the durations differ.
  - Understanding focus (DE): Der Gegenfall trennt momentane beziehungsweise mittlere Rate von Gesamtenergie.
  - Understanding focus (EN): The counterexample separates instantaneous or average rate from total energy.
## Page 2: Wirkungsgrad als Verhältnis nutzbarer und zugeführter Energie deuten

- Full learning-goal ID: `f7f2c254-1663-5861-bed7-a32c00495b19`
- Goal fingerprint: `sha256:a54a9234aa4e1a1adc289218aec3cb0957047dd6e3c903c382e168927ee6bd3e`
- Page fingerprint: `sha256:15895c1c665cb5cbc1a924d420ad369a1d55d6dba18788b110a53d09b4234341`
- Topic path: Physik > Sekundarstufe I > Mechanische Grundlagen (Sek I) > Arbeit und Energie qualitativ deuten > Leistung und Wirkungsgrad

### Canonical description

Die lernende Person kann den Wirkungsgrad als Verhältnis nutzbarer zu zugeführter Energie bestimmen, Energieanteile in einem einfachen System bilanzieren und begründen, warum ein Wirkungsgrad nicht größer als eins sein kann.

### Visualization

/assets/goal-visualizations/physik/f7f2c254-1663-5861-bed7-a32c00495b19/f7f2c254-1663-5861-bed7-a32c00495b19.jpg

- original digest: `sha256:2980a12e8a5a9cfddb5e5caf31864836f26fc7da9face8710e970e34b905b11e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Rationale Zahlen multiplizieren und dividieren — `ee48e811-4c9c-5080-9836-8403fc9f0810` (outside this book)
- Rationale Zahlen addieren und subtrahieren — `4eeab7d5-eeb3-579b-845e-1c52ffe9e89f` (outside this book)
- Mechanische Energieformen qualitativ unterscheiden — `722857cf-f327-5740-8151-64eb92195ec8` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Leistung und Wirkungsgrad eines Hebezeugs vergleichen — `0b8aff9a-6c77-51b9-82d4-725a21f32a90` (outside this book)
- Elektrische Leistung und Wirkungsgrad bilanzieren — `46e42b07-c098-5d65-8ef5-8472b7c4d8e2` (outside this book)
- Energieentwertung vs. Energieverbrauch — `cbdc0b5f-8a48-5ade-be53-ab6aacaa3e73` (outside this book)
- Energiesparmaßnahmen physikalisch bewerten — `aed9161b-ddc4-559c-be8f-baeeddf224f3` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:57730b8550831c1577780ea5a7c920e5a44782048ca7fa0d0ad1830d31746fd6`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `useful-input-ratio`
  - Essential understanding (DE): Der Wirkungsgrad η=E_nutz/E_zu beschreibt den Anteil der zugeführten Energie, der für den festgelegten Zweck nutzbar ist; welche Abgabe nützlich ist, hängt vom Systemzweck ab.
  - Essential understanding (EN): Efficiency η=E_useful/E_input is the fraction of input energy useful for the specified purpose; which output is useful depends on the system’s purpose.
  - Observable performance (DE): Die lernende Person grenzt für ein neues System Zufuhr, Nutzabgabe und weitere Abgaben ab, berechnet den Wirkungsgrad und erläutert die Zweckabhängigkeit.
  - Observable performance (EN): For a new system, the learner distinguishes input, useful output, and other outputs, calculates efficiency, and explains its dependence on purpose.
- `energy-balance-and-bound`
  - Essential understanding (DE): Energieerhaltung verlangt, dass Nutzenergie und weitere Abgaben zusammen die Zufuhr bilanzieren; deshalb liegt der Wirkungsgrad eines realen einfachen Systems zwischen 0 und 1. Ein Wert über 1 zeigt einen Bilanz-, Bezugs- oder Einheitenfehler.
  - Essential understanding (EN): Energy conservation requires useful energy and other outputs together to balance the input; therefore a real simple system has efficiency between 0 and 1. A value above 1 signals a balance, boundary, or unit error.
  - Observable performance (DE): Die lernende Person ergänzt eine fehlende Energieabgabe, prüft Summe und Einheit und diagnostiziert eine angebotene Effizienz über 100 Prozent statt sie als besonders gutes Gerät zu akzeptieren.
  - Observable performance (EN): The learner completes a missing energy output, checks sum and units, and diagnoses a proposed efficiency above 100 percent rather than accepting it as an exceptionally good device.

**Coverage expectations**

- required expectations: `useful-input-ratio`, `energy-balance-and-bound`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `system-purpose`: Motorische, thermische oder optische Nutzabgabe / Mechanical, thermal, or optical useful output
- `error-pattern`: Korrekte Bilanz, vertauschtes Verhältnis oder fehlender Abgabepfad / Correct balance, inverted ratio, or missing output pathway

**Application cases**

- `lifting-motor-balance`
  - Task demand (DE): Ein Motor erhält 500 J elektrische Energie, erhöht die Lageenergie einer Last um 350 J und erwärmt die Umgebung. Wirkungsgrad und weitere Abgabe sind zu bestimmen.
  - Task demand (EN): A motor receives 500 J of electrical energy, increases a load’s gravitational energy by 350 J, and warms the surroundings. Determine efficiency and other output.
  - Expected performance (DE): Die lernende Person erhält η=0,70 beziehungsweise 70 Prozent und bilanziert 150 J als weitere Energieabgabe, ohne Energieverlust im Sinn von Verschwinden zu behaupten.
  - Expected performance (EN): The learner obtains η=0.70 or 70 percent and balances 150 J as another energy output without claiming energy disappears.
  - Understanding focus (DE): Quotient und vollständige Bilanz werden gemeinsam geprüft.
  - Understanding focus (EN): The ratio and complete balance are tested together.
- `efficiency-over-one-audit`
  - Task demand (DE): Für ein Gerät werden 2,4 kJ Nutzenergie und 2 000 J Zufuhr angegeben; daraus werden 120 Prozent Wirkungsgrad behauptet. Datensatz und Rechnung sind zu prüfen.
  - Task demand (EN): A device is said to provide 2.4 kJ useful energy from 2,000 J input, yielding 120 percent efficiency. Audit the data and calculation.
  - Expected performance (DE): Die lernende Person vereinheitlicht die Einheiten, erkennt E_nutz>E_zu als unvereinbar mit der gesetzten Systemgrenze und fordert eine fehlende Zufuhr, falsche Messung oder andere Grenze statt 120 Prozent zu akzeptieren.
  - Expected performance (EN): The learner standardizes units, recognizes E_useful>E_input as inconsistent with the stated boundary, and calls for missing input, measurement error, or a different boundary rather than accepting 120 percent.
  - Understanding focus (DE): Der unmögliche Grenzfall diagnostiziert Formelwendung ohne Energieerhaltung.
  - Understanding focus (EN): The impossible limiting case diagnoses formula use without energy conservation.
## Page 3: Freier Fall experimentell untersuchen

- Full learning-goal ID: `09029573-864f-40ca-bf8a-cee7bf6dcb73`
- Goal fingerprint: `sha256:130790489acb03f5ba26be963eb06339ad5f38783763c65e16a1646eb7acd6ab`
- Page fingerprint: `sha256:b6ddd76e1e6ef68e9402fb0ddbcdcde5e4697adf527e357584463412fdb9b83e`
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

Status: `needs_human_review`; profile fingerprint: `sha256:2f60be241c94bd9a24b63a9c9b62b9f252838c8bd2bf2d46aa9bed4f04e7cd16`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `selected-blind-review-core`
  - Essential understanding (DE): Die lernende Person versteht den freien Fall nahe der Erdoberfläche als näherungsweise gleichmäßig beschleunigte Bewegung unter Gravitation, unterscheidet gemessene Orts- und Zeitdaten von der daraus erschlossenen Gravitationsbeschleunigung und berücksichtigt, dass das Modell Luftwiderstand vernachlässigt sowie Koordinatenwahl und Anfangsbedingungen benötigt.
  - Essential understanding (EN): The learner understands free fall near Earth's surface as approximately uniformly accelerated motion under gravity, distinguishes measured position and time data from the gravitational acceleration inferred from them, and recognizes that the model neglects air resistance and requires a coordinate choice and initial conditions.
  - Observable performance (DE): Die lernende Person plant oder nutzt eine sichere beaufsichtigte Video- oder Sensormessung beziehungsweise einen bereitgestellten Datensatz, stellt die Daten geeignet grafisch dar, bestimmt g mit Einheit und begründeter Unsicherheit, prüft die Modellpassung und formuliert ein dazu konsistentes Zeit-Ort-Gesetz mit Anfangsbedingungen. Für jeden dieser Wege, auch bei bereitgestellten Daten, formuliert die lernende Person eine prüfbare Frage zum freien Fall und erläutert dazu einen sicheren Messplan: untersuchte Abhängigkeit und Messgrößen, zu variierende beziehungsweise konstant zu haltende Größen, geeignetes Messprinzip mit Orts- und Zeitskalen sowie kontrollierte Anfangsbedingungen.
  - Observable performance (EN): The learner plans or uses a safe supervised video or sensor measurement, or a supplied data set, represents the data in a suitable graph, determines g with a unit and justified uncertainty, checks the model fit, and formulates a consistent time-position law with initial conditions. For each of these routes, including supplied data, the learner formulates a testable free-fall question and explains a safe measurement plan for it: the relationship under investigation and measured quantities, quantities to vary or hold constant, a suitable measurement principle with position and time scales, and controlled initial conditions.
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
## Page 4: Geradlinige Bewegung mit Reibung modellieren

- Full learning-goal ID: `30ddb2d7-b991-55fe-9e74-37ffe1048f9f`
- Goal fingerprint: `sha256:bd202f6b04ea79c9f533b80d1603e4f0f3764d3bcfb98815541e425bfe804418`
- Page fingerprint: `sha256:c7b93e51b8241f05b468288c22f0d9c2089884533b1ad23c456ef79fdcb559f4`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > Weitere Bewegungen

### Canonical description

Die lernende Person kann geradlinige Bewegungen mit Reibung unter klar benannten einfachen Modellannahmen modellieren, indem sie die wirkenden Kräfte mit einer konsistent gewählten positiven Richtung bilanziert, aus der resultierenden Kraft die Beschleunigung bestimmt und den Bewegungsverlauf mit passenden einfachen Bewegungsgleichungen beschreibt und qualitativ vorhersagt.

### Visualization

/assets/goal-visualizations/physik/30ddb2d7-b991-55fe-9e74-37ffe1048f9f/30ddb2d7-b991-55fe-9e74-37ffe1048f9f.jpg

- original digest: `sha256:3b8e71103bc2ff6183057cf3ed546fd4c3c0196be15dd12985c0f89aa333e10d`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Methode: Modellbildung mit Tabellenkalkulation — `ac25ffe3-fd42-592d-a937-79cc13460313` (page 6)

### Prerequisites outside this book

- Rationale Zahlen addieren und subtrahieren — `4eeab7d5-eeb3-579b-845e-1c52ffe9e89f` (outside this book)
- Termwerte durch Einsetzen berechnen — `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` (outside this book)
- Reibungskräfte qualitativ verstehen — `5fd45dbc-0eb1-591b-99a9-7386336f1456` (outside this book)

### Direct reverse prerequisites outside this book

- E-Phase-Klausuraufgaben Physik selbstständig lösen — `7f83e25c-38f7-5ac2-8f9c-ec54eeef1026` (outside this book)
- Mehrschrittige Bewegungsmodelle mit Reibung und Chaos analysieren — `dd99528a-bae5-5b78-89e6-c6092c927f8d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:69bbccb76d2df54e0255f1c1d22e059715bc78e1ee1e6dbdf8d1c6f43d312f89`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `explicit-one-dimensional-model`
  - Essential understanding (DE): Ein einfaches Modell geradliniger Bewegung legt System, Bewegungsachse, positive Richtung und vereinfachende Annahmen fest. Bewegungsgleichungen mit konstanter Beschleunigung gelten nur in einem Zeitabschnitt, in dem Masse und resultierende Kraft beziehungsweise Beschleunigung als konstant behandelt werden dürfen.
  - Essential understanding (EN): A simple model of rectilinear motion specifies the system, motion axis, positive direction, and simplifying assumptions. Constant-acceleration equations apply only over an interval in which mass and the net force or acceleration may be treated as constant.
  - Observable performance (DE): Die lernende Person benennt für eine neue Reibungssituation den betrachteten Körper, wählt eine Achse und positive Richtung, nennt die für das einfache Modell vernachlässigten oder konstant gesetzten Größen und begrenzt die verwendete Bewegungsgleichung auf den passenden Zeitabschnitt.
  - Observable performance (EN): For a new friction situation, the learner identifies the body considered, chooses an axis and positive direction, states which quantities are neglected or held constant in the simple model, and limits the equation of motion to the appropriate time interval.
- `directed-force-balance-to-acceleration`
  - Essential understanding (DE): Betrag und Richtung jeder Kraft werden relativ zur gewählten Achse durch Vorzeichen erfasst. Ihre gerichtete Summe ist die resultierende Kraft und bestimmt über F_res = ma Betrag und Richtung der Beschleunigung; die Reibungsrichtung folgt dem jeweiligen relativen Gleiten.
  - Essential understanding (EN): The magnitude and direction of each force are represented by signs relative to the chosen axis. Their directed sum is the net force and, through F_net = ma, determines the magnitude and direction of acceleration; the friction direction follows the current relative sliding.
  - Observable performance (DE): Die lernende Person erstellt eine richtungskonsistente Kräftebilanz, bestimmt resultierende Kraft und Beschleunigung mit Vorzeichen und Einheiten und prüft ihre Richtung an einem Kraftbild oder einer verbalen Prognose.
  - Observable performance (EN): The learner constructs a direction-consistent force balance, determines net force and acceleration with signs and units, and checks their direction against a force diagram or verbal prediction.
- `connect-acceleration-and-motion-course`
  - Essential understanding (DE): Die Beschleunigungsrichtung allein gibt nicht die momentane Bewegungsrichtung an. Beschleunigung gleichgerichtet zur Geschwindigkeit vergrößert deren Betrag, entgegengerichtete Beschleunigung verringert ihn; beim Stillstand oder Richtungswechsel muss die Reibungsrichtung und damit gegebenenfalls das Gleichungsstück neu bestimmt werden.
  - Essential understanding (EN): The acceleration direction alone does not give the current direction of motion. Acceleration in the same direction as velocity increases its magnitude, whereas opposite acceleration decreases it; at rest or reversal, the friction direction and hence, where necessary, the equation segment must be determined anew.
  - Observable performance (DE): Die lernende Person nutzt passende einfache Bewegungsgleichungen, um Geschwindigkeit und Ort qualitativ oder quantitativ vorherzusagen, vergleicht dabei die Vorzeichen von Geschwindigkeit und Beschleunigung und erkennt einen Zeitpunkt, an dem das bisherige Modellstück wegen Stillstand oder Richtungswechsel neu angesetzt werden muss.
  - Observable performance (EN): The learner uses appropriate simple equations of motion to predict velocity and position qualitatively or quantitatively, compares the signs of velocity and acceleration, and identifies a time at which the current model segment must be reformulated because of stopping or reversal.

**Coverage expectations**

- required expectations: `explicit-one-dimensional-model`, `directed-force-balance-to-acceleration`, `connect-acceleration-and-motion-course`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `initial-motion`: Start aus der Ruhe oder Anfangsgeschwindigkeit gleich- beziehungsweise entgegengerichtet zur Beschleunigung / Start from rest or initial velocity in the same or opposite direction as acceleration
- `directed-force-balance`: Zugkraft größer, gleich oder kleiner als die entgegengerichtete Reibungskraft / Pulling force greater than, equal to, or smaller than the opposing frictional force
- `model-interval`: Ein Zeitabschnitt mit konstanter Kraftrichtung oder ein Richtungswechsel, an dem Reibung und Gleichung neu angesetzt werden müssen / One interval with constant force direction or a reversal at which friction and the equation must be reformulated
- `representation-check`: Kräftebild, Geschwindigkeits-Zeit-Verlauf oder verbale Bewegungsprognose als unabhängige Kontrolle / Force diagram, velocity-time course, or verbal motion prediction as an independent check

**Application cases**

- `sled-pulled-from-rest`
  - Task demand (DE): Ein Schlitten der Masse 3,0 kg startet auf einer horizontalen Strecke aus der Ruhe. Eine konstante Zugkraft von 12 N wirkt nach rechts, die Gleitreibung von 3 N nach links. Wähle eine Achse, formuliere die Modellannahmen, bilanziere die Kräfte und sage mit passenden einfachen Bewegungsgleichungen Geschwindigkeit und Ort nach 2,0 s voraus. Prüfe Richtung, Vorzeichen und Einheiten.
  - Task demand (EN): A 3.0 kg sled starts from rest on a horizontal track. A constant pulling force of 12 N acts to the right and sliding friction of 3 N to the left. Choose an axis, state the model assumptions, balance the forces, and use appropriate simple equations of motion to predict velocity and position after 2.0 s. Check direction, signs, and units.
  - Expected performance (DE): Die lernende Person wählt rechts positiv, behandelt Schlitten, Masse und horizontale Kräfte im betrachteten Zeitintervall als konstant und erhält F_res = 9 N sowie a = 3,0 m/s² nach rechts. Mit v_0 = 0 bestimmt sie v(2 s) = 6,0 m/s und x(2 s) - x_0 = 6,0 m. Kraftbild, positive Ergebnisse und Einheiten stimmen mit der qualitativen Prognose einer beschleunigten Bewegung nach rechts überein.
  - Expected performance (EN): The learner chooses right as positive, treats the sled, mass, and horizontal forces as constant over the interval considered, and obtains F_net = 9 N and a = 3.0 m/s² to the right. With v_0 = 0, the learner determines v(2 s) = 6.0 m/s and x(2 s) - x_0 = 6.0 m. The force diagram, positive results, and units agree with the qualitative prediction of accelerated motion to the right.
  - Understanding focus (DE): Der direkte Fall prüft die vollständige Kette von Modellannahmen über gerichtete Kräftebilanz bis zur konsistenten Bewegungsprognose, nicht bloß das Einsetzen in eine Formel.
  - Understanding focus (EN): The direct case tests the complete chain from modelling assumptions through directed force balance to a consistent motion prediction, not merely substitution into a formula.
- `cart-stops-and-reverses`
  - Task demand (DE): Ein Wagen der Masse 4,0 kg gleitet anfangs mit v_0 = -4,0 m/s nach links. Eine konstante äußere Kraft von 6 N wirkt nach rechts; die Gleitreibung hat den Betrag 2 N und wirkt jeweils entgegen der Bewegung relativ zum Boden. Rechts sei positiv. Sage den Bewegungsverlauf voraus, bestimme den Stillstandszeitpunkt und erkläre, wie Kräftebilanz und Bewegungsgleichung bei einer anschließenden Bewegung nach rechts neu angesetzt werden müssen.
  - Task demand (EN): A 4.0 kg cart initially slides to the left with v_0 = -4.0 m/s. A constant external force of 6 N acts to the right; sliding friction has magnitude 2 N and always acts opposite the motion relative to the ground. Take right as positive. Predict the course of motion, determine the stopping time, and explain how the force balance and equation of motion must be reformulated if motion subsequently proceeds to the right.
  - Expected performance (DE): Solange der Wagen nach links gleitet, wirken äußere Kraft und Reibung beide nach rechts: F_res = 8 N, a = 2,0 m/s² und v(t) = -4,0 m/s + 2,0 m/s² · t. Die Geschwindigkeit ist zunächst negativ und nimmt im Betrag ab; bei t = 2,0 s steht der Wagen. Für anschließendes Gleiten nach rechts kehrt die Reibung ihre Richtung um, sodass F_res = 6 N - 2 N = 4 N und a = 1,0 m/s² gelten; die zweite Gleichung beginnt am Übergangszeitpunkt mit den dortigen Anfangswerten.
  - Expected performance (EN): While the cart slides left, the external force and friction both act to the right: F_net = 8 N, a = 2.0 m/s², and v(t) = -4.0 m/s + 2.0 m/s² · t. The velocity is initially negative and decreases in magnitude; the cart stops at t = 2.0 s. For subsequent sliding to the right, friction reverses direction, so F_net = 6 N - 2 N = 4 N and a = 1.0 m/s²; the second equation begins at the transition time with the values then applicable.
  - Understanding focus (DE): Der unabhängige Transfer trennt Bewegungs- und Beschleunigungsrichtung und erzwingt beim Richtungswechsel eine neue Reibungsrichtung sowie ein neues gültiges Modellstück.
  - Understanding focus (EN): The independent transfer separates velocity and acceleration directions and requires a new friction direction and a new valid model segment at reversal.
## Page 5: Methode: Linearisierung von Messkurven

- Full learning-goal ID: `264dc31c-ec92-5e39-a8b8-16f1d74366d4`
- Goal fingerprint: `sha256:9e1e0973a2cdce7255dcfd2d2d200f6798543ff5e0a85e8bb282c53b936f9506`
- Page fingerprint: `sha256:225ee88fcb73908910a7e8a57f1ed2145fd5974861af1caccac3a1fbad50a5a0`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > Methoden in der E-Phase

### Canonical description

Die lernende Person kann nichtlineare Messdaten durch geeignete Transformationen linearisieren, Geraden anpassen und Parameter deuten (z. B. $s\sim t^2$, Einstein-Gerade).

### Visualization

/assets/goal-visualizations/physik/264dc31c-ec92-5e39-a8b8-16f1d74366d4/264dc31c-ec92-5e39-a8b8-16f1d74366d4.jpg

- original digest: `sha256:508c1041dceaf18ff2a0507853e063725c18e16dbbe8bbdf016c2f383105182f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Terme mit Variablen lesen und deuten — `f08d06dc-139d-5fd2-892c-8cc919b1e4fc` (outside this book)
- Lineare Funktionen beschreiben — `af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186` (outside this book)
- Termwerte durch Einsetzen berechnen — `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` (outside this book)
- Einfache multiplikative Gleichungen unter Bereichsbedingungen lösen — `54148506-c23f-41b8-959b-068dd194cf15` (outside this book)
- Terme im Bereich rationaler Zahlen äquivalent umformen — `2c4830e6-a8d5-48d0-9202-3b7d18a419c2` (outside this book)
- Messunsicherheiten angeben — `f6b1d812-ce8b-5852-b417-e6c29b533c7a` (outside this book)
- Mittelwert und Streuung aus Messreihen bestimmen — `f23fdfa9-38b6-5157-8301-ed302476c456` (outside this book)

### Direct reverse prerequisites outside this book

- Messmethoden und Datenanalyse in Aufgaben anwenden — `0432a422-401b-5134-bf08-05cfd8c7a366` (outside this book)
- E-Phase-Klausuraufgaben Physik selbstständig lösen — `7f83e25c-38f7-5ac2-8f9c-ec54eeef1026` (outside this book)
- Methode: Naturkonstanten bestimmen (Linearisierung) — `28f6a324-5f5e-5771-91d2-c007f6c275aa` (outside this book)
- Fotoeffekt-Daten auswerten — `5476480f-7ff2-529f-aade-968198c782a9` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e095fe4b53e6b8548eac8f6e500ac8d298a7b116923cd9091c99775d6a6e058b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `linearization-tests-model-and-parameters`
  - Essential understanding (DE): Eine Linearisierung prüft eine angenommene funktionale Beziehung durch passend transformierte Achsen; Steigung und Achsenabschnitt der Ausgleichsgeraden besitzen Einheiten und müssen aus den transformierten Größen auf die physikalischen Modellparameter zurückübersetzt werden.
  - Essential understanding (EN): Linearization tests an assumed functional relationship using suitably transformed axes; the slope and intercept of the fitted line have units and must be translated from the transformed quantities back to the physical model parameters.
  - Observable performance (DE): Die lernende Person wählt aus einer Modellgleichung eine begründete Transformation, beschriftet die neuen Achsen mit Größen und Einheiten, passt eine Gerade an, deutet Steigung und Achsenabschnitt physikalisch und beurteilt anhand der Abweichungen, wie gut das Modell zu den Daten passt.
  - Observable performance (EN): From a model equation, the learner selects a justified transformation, labels the new axes with quantities and units, fits a straight line, interprets slope and intercept physically, and uses the deviations to judge how well the model matches the data.
- `fit-quality-and-domain-remain-visible`
  - Essential understanding (DE): Eine gerade erscheinende Darstellung ist nur innerhalb der Messunsicherheit und des untersuchten Wertebereichs Evidenz für das angenommene Modell. Strukturierte Residuen, ein physikalisch unplausibler Achsenabschnitt oder ein Parameter mit falscher Einheit weisen auf Messfehler, Zusatzterme oder eine ungeeignete Transformation hin.
  - Essential understanding (EN): A plot that appears straight is evidence for the assumed model only within measurement uncertainty and the investigated range. Structured residuals, a physically implausible intercept, or a parameter with the wrong unit indicate measurement error, additional terms, or an unsuitable transformation.
  - Observable performance (DE): Die lernende Person prüft für frische Daten Streuung und Residuen gegen die Messgrenzen, kontrolliert Parameterdimension und Grenzfall und formuliert eine auf den untersuchten Bereich begrenzte Schlussfolgerung statt allein die Geradheit zu behaupten.
  - Observable performance (EN): For fresh data, the learner checks scatter and residuals against the measurement limits, verifies parameter dimensions and a limiting case, and states a conclusion bounded to the investigated range rather than merely claiming straightness.
- `fresh-linearization-transfer`
  - Essential understanding (DE): Die passende Linearisierung und die Bedeutung ihrer Geradenparameter folgen aus der jeweiligen Modellgleichung und dürfen nicht unverändert von einer anders strukturierten Beziehung übernommen werden.
  - Essential understanding (EN): The appropriate linearization and the meaning of its line parameters follow from the specific model equation and must not be carried over unchanged from a differently structured relation.
  - Observable performance (DE): Für Daten zu einer anders strukturierten nichtlinearen Beziehung, etwa $T^2\sim l$ statt $s\sim t^2$, entwickelt die lernende Person die passende neue Achsentransformation und leitet die Bedeutung der Geradenparameter erneut aus dem jeweiligen Modell her.
  - Observable performance (EN): For data following a differently structured nonlinear relationship, such as $T^2\sim l$ instead of $s\sim t^2$, the learner develops the appropriate new axis transformation and derives the meaning of the line parameters again from the relevant model.

**Coverage expectations**

- required expectations: `linearization-tests-model-and-parameters`, `fit-quality-and-domain-remain-visible`, `fresh-linearization-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `functional-relation`: Quadratische und wurzelförmige Beispiele bilden den verpflichtenden gemeinsamen Kern;inverse/exponentielle Beziehungen sind alternative Vertiefungswege mit bereitgestellten passenden mathematischen Identitäten,keine AND-Pflicht aller Transformationsmethoden. / Quadratic and root-shaped examples form the required shared core;inverse/exponential relations are alternative extensions with appropriate mathematical identities supplied,not an AND requirement for every transformation method.
- `fit-deviation`: Zufällige Streuung um die Gerade, systematisch gekrümmte Residuen oder nicht verschwindender Achsenabschnitt / Random scatter around the line, systematically curved residuals, or a nonzero intercept
- `parameter-meaning`: Steigung oder Achsenabschnitt mit unterschiedlicher physikalischer Einheit und Modellbedeutung / Slope or intercept with a different physical unit and model meaning

**Application cases**

- `accelerated-motion-s-versus-t-squared`
  - Task demand (DE): Für eine aus Ruhe gleichmäßig beschleunigte Bewegung werden frische s-t-Daten mit Messunsicherheiten und das Modell s = a·t²/2 bereitgestellt. Entwickle die linearisierte Darstellung, passe eine Gerade an, bestimme a samt Einheit und beurteile aus Achsenabschnitt und Residuen die Modellgüte.
  - Task demand (EN): Fresh s-t data with measurement uncertainties and the model s = a·t²/2 are supplied for uniformly accelerated motion from rest. Develop the linearized representation, fit a straight line, determine a with its unit, and assess model quality from the intercept and residuals.
  - Expected performance (DE): Die lernende Person trägt s gegen t² mit Einheiten auf, deutet die Steigung als a/2, berechnet a dimensionsrichtig und prüft, ob Streuung und Achsenabschnitt mit den Messgrenzen und der Annahme Start aus Ruhe vereinbar sind.
  - Expected performance (EN): The learner plots s against t² with units, interprets the slope as a/2, calculates a with the correct dimensions, and checks whether scatter and intercept are compatible with the measurement limits and the assumption of starting from rest.
  - Understanding focus (DE): Der Fall verbindet Transformation, Fitparameter, Einheiten, Modellannahme und datenbasierte Schlussfolgerung.
  - Understanding focus (EN): The case connects transformation, fit parameter, units, model assumption, and a data-based conclusion.
- `pendulum-t-squared-versus-length`
  - Task demand (DE): Für ein Fadenpendel sind neue T-l-Daten und das Kleinwinkelnäherungsmodell T = 2π√(l/g) gegeben. Leite selbst eine lineare Achsenwahl ab, bestimme g aus der Geraden, prüfe die Einheit und untersuche, ob die Punkte bei den größten Auslenkungen systematisch abweichen. Rein mathematische Eingangsfakten sind fürx≥0:(√x)²=x und(ab)²=a²b². Es werden keine transformierten Achsen,T²-Relation,Steigung oder g-Lösung vorgegeben;diese müssen im physikalischen Messfall selbst entwickelt und begründet werden.
  - Task demand (EN): New T-l data and the small-angle model T = 2π√(l/g) are given for a simple pendulum. Derive a linear axis choice independently, determine g from the line, check the unit, and investigate whether points at the largest amplitudes deviate systematically. Purely mathematical input facts for x≥0 are(√x)²=x and(ab)²=a²b². No transformed axes,T² relation,slope or g solution is supplied;these must be independently developed and justified for the physical measurements.
  - Expected performance (DE): Die lernende Person stellt T² gegen l dar, leitet g = 4π²/Steigung her, deutet einen möglichen Achsenabschnitt und erkennt strukturierte Abweichungen der Großauslenkungsdaten als Grenze der Kleinwinkelnäherung statt als bloße Streuung.
  - Expected performance (EN): The learner plots T² against l, derives g = 4π²/slope, interprets a possible intercept, and recognizes structured deviations in the large-amplitude data as a limit of the small-angle approximation rather than mere scatter.
  - Understanding focus (DE): Die anders strukturierte Beziehung erzwingt unabhängigen Transfer der Linearisierung und eine explizite Modellgrenze.
  - Understanding focus (EN): The differently structured relation requires independent transfer of linearization and an explicit model boundary.
## Page 6: Methode: Modellbildung mit Tabellenkalkulation

- Full learning-goal ID: `ac25ffe3-fd42-592d-a937-79cc13460313`
- Goal fingerprint: `sha256:0a6767d08a98a8d3204302708b6e51126fb3f543dcc8ff131d2ac95ba556ebcd`
- Page fingerprint: `sha256:c681463545eb8550b0ebc24abc97e22b858e630d26d87a5d0818cd08e47d3c83`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > Methoden in der E-Phase

### Canonical description

Die lernende Person kann ein Bewegungsmodell mit Anfangsbedingungen und endlichen Zeitschritten als Differenzenverfahren in einer Tabellenkalkulation umsetzen, Parameter systematisch variieren und Simulationsergebnisse im Hinblick auf den Bewegungsverlauf, die Modellannahmen und die Zeitschrittweite interpretieren.

### Visualization

/assets/goal-visualizations/physik/ac25ffe3-fd42-592d-a937-79cc13460313/ac25ffe3-fd42-592d-a937-79cc13460313.jpg

- original digest: `sha256:ccb17e01807132981eec2f98b9d038e7d76e3dd2ad2bd7ab7c9749a1e86a8b9d`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Geradlinige Bewegung mit Reibung modellieren — `30ddb2d7-b991-55fe-9e74-37ffe1048f9f` (page 4)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Terme mit Variablen lesen und deuten — `f08d06dc-139d-5fd2-892c-8cc919b1e4fc` (outside this book)
- Termwerte durch Einsetzen berechnen — `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` (outside this book)

### Direct reverse prerequisites outside this book

- Messmethoden und Datenanalyse in Aufgaben anwenden — `0432a422-401b-5134-bf08-05cfd8c7a366` (outside this book)
- E-Phase-Klausuraufgaben Physik selbstständig lösen — `7f83e25c-38f7-5ac2-8f9c-ec54eeef1026` (outside this book)
- Bewegungsanalyse und freier Fall — `a9562b05-c54d-5635-9244-3f7dd24a8642` (outside this book)
- Ruhepotenzial an einer selektiv permeablen Membran modellieren — `db47ac91-7bb0-5ba3-b39d-e2d6fc98396e` (outside this book)
- Numerische Simulation von Bewegungen — `761a0879-fc15-5d0c-a2b7-2b439efecd5b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:7f810b55da39b9ec9a46ec4efa0aea351d02d88d79fbfe9eadc8887e6024fd21`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `construct-finite-difference-motion-model`
  - Essential understanding (DE): Ein Differenzenmodell ersetzt die kontinuierliche Bewegung durch endliche Schritte. Anfangswerte und ein ausdrücklich gewähltes Aktualisierungsschema, etwa v_{i+1} = v_i + a_iΔt und x_{i+1} = x_i + v_iΔt, legen fest, wie Kräfte beziehungsweise Beschleunigungen in neue Zustände überführt werden; Zellbezüge müssen beim Kopieren die beabsichtigten Größen festhalten.
  - Essential understanding (EN): A finite-difference model replaces continuous motion with finite steps. Initial values and an explicitly chosen update scheme, such as v_{i+1} = v_i + a_iΔt and x_{i+1} = x_i + v_iΔt, specify how forces or accelerations produce new states; cell references must preserve the intended quantities when copied.
  - Observable performance (DE): Die lernende Person richtet selbstständig Spalten für t, x, v, a beziehungsweise Kräfte ein, trägt Anfangsbedingungen ein, formuliert konsistente rekursive Zellformeln mit Einheiten und erklärt die zeitliche Bedeutung einer Tabellenzeile.
  - Observable performance (EN): The learner independently sets up columns for t, x, v, a or forces, enters initial conditions, writes consistent recursive cell formulas with units, and explains the temporal meaning of one spreadsheet row.
- `validate-vary-and-limit-model`
  - Essential understanding (DE): Ein Simulationsergebnis ist vom physikalischen Modell und vom numerischen Zeitschritt abhängig. Systematisches Variieren jeweils eines Parameters, Vergleich mit einem bekannten Grenz- oder Referenzfall und Verkleinern von Δt zeigen Robustheit oder numerische Abweichung; Übereinstimmung ersetzt keine Prüfung der Modellannahmen.
  - Essential understanding (EN): A simulation result depends on both the physical model and the numerical time step. Systematically varying one parameter at a time, comparison with a known limiting or reference case, and reducing Δt reveal robustness or numerical error; agreement does not replace checking the model assumptions.
  - Observable performance (DE): Die lernende Person führt einen kontrollierten Parametervergleich und mindestens eine Zeitschrittverfeinerung durch, interpretiert Bewegungsverlauf und Konvergenztendenz und benennt eine konkrete physikalische Annahme, bei deren Verletzung das Modell unzuverlässig wird.
  - Observable performance (EN): The learner performs a controlled parameter comparison and at least one time-step refinement, interprets the motion and convergence trend, and identifies a specific physical assumption whose violation would make the model unreliable.

**Coverage expectations**

- required expectations: `construct-finite-difference-motion-model`, `validate-vary-and-limit-model`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `acceleration-model`: Konstante Beschleunigung mit analytischer Referenz und geschwindigkeitsabhängige Beschleunigung ohne einfache Schrittformel werden variiert. / Constant acceleration with an analytical reference and velocity-dependent acceleration without a simple closed-step formula are varied.
- `time-step`: Mindestens zwei, besser drei halbierte Zeitschritte werden bei unveränderten physikalischen Parametern verglichen. / At least two, preferably three halved time steps are compared with unchanged physical parameters.
- `physical-parameter`: Masse, Beschleunigung oder Widerstandsparameter wird einzeln variiert, während die übrigen Größen kontrolliert bleiben. / Mass, acceleration, or drag parameter is varied individually while the remaining quantities stay controlled.

**Application cases**

- `constant-acceleration-benchmark`
  - Task demand (DE): Erstelle in einer Tabellenkalkulation für x₀ = 0, v₀ = 0 und a = 2,0 m/s² ein explizites Euler-Modell mit v_{i+1} = v_i + aΔt und x_{i+1} = x_i + v_iΔt bis t = 2,0 s. Vergleiche Δt = 0,50 s und 0,25 s mit der analytischen Lösung, erkläre die Abweichung von x und sage die Wirkung einer weiteren Halbierung voraus.
  - Task demand (EN): In a spreadsheet, build an explicit Euler model for x₀ = 0, v₀ = 0, and a = 2.0 m/s² using v_{i+1} = v_i + aΔt and x_{i+1} = x_i + v_iΔt up to t = 2.0 s. Compare Δt = 0.50 s and 0.25 s with the analytical solution, explain the discrepancy in x, and predict the effect of another halving.
  - Expected performance (DE): Die lernende Person dokumentiert Anfangszeile und rekursive Formeln, erhält für beide Schritte v(2 s) = 4,0 m/s, aber x = 3,0 m beziehungsweise 3,5 m statt analytisch 4,0 m. Sie erklärt, dass die linke Intervallsgeschwindigkeit die Wegzunahme unterschätzt und dass kleinere Δt das Ergebnis gegen 4,0 m konvergieren lässt, ohne das konkrete Euler-Schema zu verschweigen.
  - Expected performance (EN): The learner documents the initial row and recursive formulas and obtains v(2 s) = 4.0 m/s for both steps but x = 3.0 m and 3.5 m respectively instead of the analytical 4.0 m. The learner explains that the left-endpoint velocity underestimates the displacement increment and that smaller Δt makes the result converge toward 4.0 m, while explicitly naming the Euler scheme used.
  - Understanding focus (DE): Der Referenzfall trennt korrekte Tabellenlogik, numerischen Fehler und physikalisches Modell.
  - Understanding focus (EN): The reference case separates correct spreadsheet logic, numerical error, and the physical model.
- `fall-with-linear-drag-transfer`
  - Task demand (DE): Modelliere einen Fall nach unten positiv mit x₀ = 0, m = 1,0 kg, v₀ = 0, g = 9,81 m/s² und linearer Widerstandskraft F_W = −kv, also a_i = g − kv_i/m. Simuliere zunächst mit k = 1,0 kg/s bis t = 5,0 s für Δt = 0,20 s und 0,10 s. Variiere danach nur k auf 2,0 kg/s, vergleiche die Geschwindigkeits-Zeit-Verläufe zu gleichen Zeiten und prüfe sie am erwarteten Grenzwert v_grenz = mg/k. Benenne eine Grenze des linearen Widerstandsmodells.
  - Task demand (EN): Model a fall with downward positive using x₀ = 0, m = 1.0 kg, v₀ = 0, g = 9.81 m/s², and linear drag F_D = −kv, so a_i = g − kv_i/m. First simulate with k = 1.0 kg/s up to t = 5.0 s for Δt = 0.20 s and 0.10 s. Then vary only k to 2.0 kg/s, compare the velocity-time curves at equal times, and check them against the expected limit v_terminal = mg/k. State one limitation of the linear-drag model.
  - Expected performance (DE): Die lernende Person berechnet in jeder Zeile zunächst a aus dem aktuellen v und aktualisiert danach v und x nach dem angegebenen Schema. Für k = 1,0 kg/s nähern sich beide Schrittweiten dem Grenzwert 9,81 m/s; bei gleicher Auswertezeit liegt Δt = 0,10 s näher am Referenz- beziehungsweise Konvergenzverlauf. Für k = 2,0 kg/s sinkt die Grenzgeschwindigkeit auf 4,905 m/s und die Zeitkonstante verändert sich. Sie nennt etwa die Annahme linearer statt quadratischer Widerstandskraft oder konstante Luft- und Körperparameter als Modellgrenze.
  - Expected performance (EN): In each row, the learner first calculates a from the current v and then updates v and x according to the stated scheme. For k = 1.0 kg/s, both step sizes approach the terminal speed 9.81 m/s; at equal evaluation times, Δt = 0.10 s is closer to the reference or convergence course. For k = 2.0 kg/s, terminal speed falls to 4.905 m/s and the time constant changes. The learner identifies, for example, the assumption of linear rather than quadratic drag or constant air and body parameters as a model limitation.
  - Understanding focus (DE): Der Transfer prüft variable Kräfte, kontrollierte Parametervariation, Grenzfall und Modellkritik jenseits des analytischen Schulfalls.
  - Understanding focus (EN): The transfer tests variable forces, controlled parameter variation, a limiting case, and model critique beyond the analytical classroom case.
## Page 7: Minkowski-Diagramme nutzen

- Full learning-goal ID: `6ebb6182-f221-5f4c-b112-4ac72b104321`
- Goal fingerprint: `sha256:c0d44819ebf638d76cde29a0d91a9d6c5e6931b283196fde07d52ba333485d8e`
- Page fingerprint: `sha256:4abb85e3421ee86f7f3c0396ae949a18cbb4b994865799b430ed46ecf0fb5f22`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Spezielle Relativitätstheorie

### Canonical description

Die lernende Person kann Minkowski-Diagramme zur Veranschaulichung relativistischer Effekte einsetzen und einfache Aussagen über Gleichzeitigkeit und Weltlinien treffen.

### Visualization

/assets/goal-visualizations/physik/6ebb6182-f221-5f4c-b112-4ac72b104321/6ebb6182-f221-5f4c-b112-4ac72b104321.jpg

- original digest: `sha256:5e190fe9879c4b00213e2dba8795e30c8d4e2b92276edbc1ca93328c16876b53`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Punktlagen und daraus bestimmte lineare Objekte im Koordinatensystem darstellen — `25593605-5e13-55cc-9a05-8f3d737e15e9` (outside this book)
- Zeitdilatation erläutern — `19aef2ed-eb46-55b1-9486-ee83f7520bb6` (outside this book)

### Direct reverse prerequisites outside this book

- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)
- Relativitaet und Raumzeit — `f532c772-7b6e-59aa-ad65-e0eeafc3767f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a1bc4fa948485c5633d010b01a6d749750aed98d12aca4e2e1c3c7a2c1471377`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `worldlines-and-frame-time`
  - Essential understanding (DE): Im Diagramm mit horizontalem x und vertikalem ct bezeichnet ein Punkt ein Ereignis und eine Weltlinie die Ereignisse eines Objekts. Bei gleicher Achsenskalierung gilt für Licht x=±ct; eine ruhende Weltlinie ist vertikal. Gleichzeitigkeitslinien sind im jeweiligen Inertialsystem definiert und können im selben Diagramm verschieden geneigt sein.
  - Essential understanding (EN): In a diagram with horizontal x and vertical ct, a point denotes an event and a worldline the events of an object. With equal axis scaling, light obeys x=±ct; a stationary worldline is vertical. Simultaneity lines are defined for each inertial frame and can have different inclinations in the same diagram.
  - Observable performance (DE): Die lernende Person erstellt aus neuen Ereignis- und Bewegungsangaben ein beschriftetes Diagramm, ergänzt aus vorgegebenen Konventionen passende Gleichzeitigkeitslinien und begründet daraus eine Aussage über Gleichzeitigkeit. Sie übersetzt ihre Konstruktion in eine verbale Bewegungsbeschreibung und erklärt Weltlinien als Raumzeitfolgen statt räumliche Bahnkurven.
  - Observable performance (EN): The learner constructs a labelled diagram from fresh event and motion data, adds appropriate simultaneity lines using supplied conventions, and uses them to justify a simultaneity statement. They translate their construction into a verbal account of motion and explain worldlines as sequences in spacetime rather than spatial paths.

**Coverage expectations**

- required expectations: `worldlines-and-frame-time`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `direction-and-slices`: Die Bewegungsrichtung des zweiten Systems und damit die Neigung seiner Weltlinien und Gleichzeitigkeitslinien wird umgekehrt. / The second frame's direction of motion and thus the inclination of its worldlines and simultaneity lines is reversed.
- `given-representation`: Einmal sind Ereigniskoordinaten gegeben, einmal müssen passende Ereignisse zu einer Gleichzeitigkeit im bewegten System konstruiert werden. / One case supplies event coordinates; the other requires constructing events satisfying simultaneity in the moving frame.

**Application cases**

- `draw-from-events`
  - Task demand (DE): Zeichne x horizontal und ct vertikal in gleich skalierten Längeneinheiten. In S haben A und B die Koordinaten (x,ct)=(-1,0) und (1,0). Ergänze einen bei x=0 ruhenden Körper, einen durch den Ursprung mit v=+0,5c bewegten Körper und Licht vom Ursprung. Für das mitbewegte System S′ gilt als Diagrammkonvention: Seine Gleichzeitigkeitslinien sind parallel zu ct=0,5x. Begründe, ob A und B in S und S′ gleichzeitig sind.
  - Task demand (EN): Draw x horizontally and ct vertically using equally scaled length units. In S, A and B have coordinates (x,ct)=(-1,0) and (1,0). Add a body at rest at x=0, a body moving through the origin at v=+0.5c, and light from the origin. For the co-moving frame S′, the supplied diagram convention is that its simultaneity lines are parallel to ct=0.5x. Justify whether A and B are simultaneous in S and S′.
  - Expected performance (DE): Die lernende Person zeichnet x=0, x=0,5ct und x=±ct mit passenden Labels. A und B liegen auf derselben horizontalen S-Zeitlinie, aber auf verschiedenen S′-Zeitlinien. Sie konstruiert diese Linien und erklärt: B wird in S′ früher als A zugeordnet. Alle Linien verwenden dieselben Ereignisse; die geneigte Körperweltlinie zeigt gleichförmige Bewegung und keine räumliche Schrägfahrt.
  - Expected performance (EN): The learner draws x=0, x=0.5ct, and x=±ct with appropriate labels. A and B lie on one horizontal S-time line but on different S′-time lines. They construct these lines and explain that S′ assigns B an earlier time than A. All lines use the same events; the inclined body worldline represents uniform motion, not a diagonally directed spatial path.
  - Understanding focus (DE): Koordinaten, Weltlinien und systemabhängige Gleichzeitigkeitslinien werden eigenständig aufeinander bezogen.
  - Understanding focus (EN): Coordinates, worldlines, and frame-dependent simultaneity lines are independently coordinated.
- `construct-simultaneous-pair-reversed-motion`
  - Task demand (DE): Ein frisches Diagramm beschreibt S″ mit v=−0,5c relativ zu S. Seine Gleichzeitigkeitslinien sind parallel zu ct=−0,5x. Erzeuge selbst auf der durch den Ursprung gehenden S″-Gleichzeitigkeitslinie zwei Ereignisse bei x=−2 und x=+2 Längeneinheiten. Ergänze die Weltlinie des Ursprungs von S″ und erkläre die zeitliche Zuordnung der Ereignisse in S.
  - Task demand (EN): A fresh diagram describes S″ moving at v=−0.5c relative to S. Its simultaneity lines are parallel to ct=−0.5x. Independently construct two events at x=−2 and x=+2 length units on the S″ simultaneity line through the origin. Add the worldline of the S″ origin and explain how S assigns times to the events.
  - Expected performance (DE): Die lernende Person konstruiert A=(-2,+1), B=(+2,-1) und die Ursprungsweltlinie x=−0,5ct. A und B sind in S″ gleichzeitig. In S gilt ct_B−ct_A=−2 Längeneinheiten; der Zeitunterschied ist daher t_B−t_A=(−2 Längeneinheiten)/c, also liegt B früher als A. Sie erklärt den Richtungswechsel über die konsistent umgekehrten Neigungen und hält Ereignisidentität, räumlichen Ort und Zeitzuordnung auseinander.
  - Expected performance (EN): The learner constructs A=(-2,+1), B=(+2,-1), and the origin worldline x=−0.5ct. A and B are simultaneous in S″. In S, ct_B−ct_A=−2 length units, so the time difference is t_B−t_A=(−2 length units)/c and B is earlier than A. They explain the direction reversal through the consistently reversed inclinations and distinguish event identity, spatial position, and assigned time.
  - Understanding focus (DE): Ein selbst konstruiertes Ereignispaar überträgt die Diagrammkompetenz auf eine umgekehrte Bewegungs- und Aufgabenrichtung.
  - Understanding focus (EN): A learner-constructed event pair transfers diagram competence to reversed motion and reversed task direction.
## Page 8: Geschwindigkeitsabhängige „relativistische Masse“ herleiten und einordnen

- Full learning-goal ID: `79da5c34-86b2-5c10-9726-9de886ccef7d`
- Goal fingerprint: `sha256:bc6c107f55173b70d1dbe29432b063debe6238eae56ff92ee7ff1eb4c7f1f7db`
- Page fingerprint: `sha256:c24b9b0c5e454620cd3349acc4ea9f5699062db22a919212939354e2765fc223`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Spezielle Relativitätstheorie

### Canonical description

Die lernende Person kann für ein massives Teilchen mit fester Ruhemasse $m_0$ die historische geschwindigkeitsabhängige Konvention $m_{\mathrm{rel}}=\gamma m_0=E/c^2$ herleiten, sie von der invarianten Ruhemasse unterscheiden und erklären, dass in moderner Darstellung Energie und Impulsbetrag – nicht die invariante Masse – mit der Geschwindigkeit relativ zu einem Inertialsystem zunehmen.

### Visualization

/assets/goal-visualizations/physik/79da5c34-86b2-5c10-9726-9de886ccef7d/79da5c34-86b2-5c10-9726-9de886ccef7d.jpg

- original digest: `sha256:d53ad6ee8dc52cfc04566f97b3ad4be90e5ad400002bb07bb22ebb53b36fe9ad`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Terme mit Variablen lesen und deuten — `f08d06dc-139d-5fd2-892c-8cc919b1e4fc` (outside this book)
- Zeitdilatation erläutern — `19aef2ed-eb46-55b1-9486-ee83f7520bb6` (outside this book)

### Direct reverse prerequisites outside this book

- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)
- Relativitaet und Raumzeit — `f532c772-7b6e-59aa-ad65-e0eeafc3767f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:27bde1aaefb7f0f0faa8309a33c11d191025b89e82f08489c43f33cf8b0b7210`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `proof`

**Positive understanding expectations**

- `historical-convention-derivation`
  - Essential understanding (DE): Aus der relativistischen Gesamtenergie E = γm₀c² und der historischen Definition m_rel := E/c² folgt algebraisch m_rel = γm₀. Die Geschwindigkeitsabhängigkeit entsteht aus γ und aus der Definition, nicht aus einer Änderung der invarianten Ruhemasse m₀.
  - Essential understanding (EN): From the relativistic total energy E = γm₀c² and the historical definition m_rel := E/c², it follows algebraically that m_rel = γm₀. The velocity dependence comes from γ and the definition, not from a change in invariant rest mass m₀.
  - Observable performance (DE): Die lernende Person leitet die Beziehung mit expliziten Ausgangsgleichungen und Definitionsschritt her, prüft für v = 0 den Grenzfall γ = 1 und kennzeichnet m_rel als historische Konvention statt als zweite invariante Teilcheneigenschaft.
  - Observable performance (EN): The learner derives the relationship from explicit starting equations and the definitional step, checks the v = 0 limit γ = 1, and identifies m_rel as a historical convention rather than a second invariant particle property.
- `invariant-rest-mass-distinction`
  - Essential understanding (DE): Die Ruhemasse m₀ ist invariant und für dasselbe Teilchen unabhängig vom Inertialsystem. Die Größe γm₀ beziehungsweise E/c² ist dagegen bezugssystem- und geschwindigkeitsabhängig; beide Größen dürfen trotz gleicher Einheit nicht begrifflich gleichgesetzt werden.
  - Essential understanding (EN): Rest mass m₀ is invariant and independent of inertial frame for the same particle. The quantity γm₀ or E/c² is frame- and velocity-dependent; despite having the same unit, the two quantities must not be conceptually equated.
  - Observable performance (DE): Die lernende Person vergleicht Angaben desselben Teilchens in zwei Inertialsystemen, hält m₀ konstant, ordnet unterschiedliche γ-, E- und m_rel-Werte den Bezugssystemen zu und korrigiert die Aussage, das Teilchen habe dadurch verschiedene invariante Massen.
  - Observable performance (EN): The learner compares descriptions of the same particle in two inertial frames, keeps m₀ constant, assigns different γ, E, and m_rel values to the frames, and corrects the claim that the particle thereby has different invariant masses.
- `modern-energy-momentum-translation`
  - Essential understanding (DE): In moderner Darstellung bleibt die invariante Masse fest, während Gesamtenergie und Impuls mit der Geschwindigkeit zunehmen und durch E² = p²c² + m₀²c⁴ verknüpft sind. Historische Aussagen über „Massenzunahme“ können daher als Aussagen über E/c² übersetzt werden.
  - Essential understanding (EN): In modern formulation, invariant mass remains fixed while total energy and momentum increase with speed and are related by E² = p²c² + m₀²c⁴. Historical statements about “mass increase” can therefore be translated into statements about E/c².
  - Observable performance (DE): Die lernende Person formuliert eine historische m_rel-Aussage in moderner Energie-Impuls-Sprache um, erklärt den wachsenden Energie- und Impulsbedarf bei Annäherung an c und vermeidet die Behauptung, m₀ selbst wachse oder Energie und Masse seien austauschbare Namen ohne Konvention.
  - Observable performance (EN): The learner reformulates a historical m_rel statement in modern energy-momentum language, explains the increasing energy and momentum requirement as speed approaches c, and avoids claiming that m₀ itself grows or that energy and mass are interchangeable labels without convention.

**Coverage expectations**

- required expectations: `historical-convention-derivation`, `invariant-rest-mass-distinction`, `modern-energy-momentum-translation`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `speed-regime`: Ruhe, moderate relativistische Geschwindigkeit oder Annäherung an die Lichtgeschwindigkeit / Rest, moderate relativistic speed, or approach to the speed of light
- `reference-frame`: Ruhesystem des Teilchens oder relativ dazu bewegtes Inertialsystem / Particle rest frame or an inertial frame moving relative to it
- `language-convention`: Historische relativistische-Masse-Sprache oder moderne Invariant-Masse-und-Energie-Impuls-Sprache / Historical relativistic-mass language or modern invariant-mass and energy-momentum language

**Application cases**

- `derive-and-check-limits`
  - Task demand (DE): Aus E = γm₀c² und der historischen Definition m_rel = E/c² ist m_rel herzuleiten und für v = 0 sowie eine vorgegebene relativistische Geschwindigkeit zu deuten. Dabei ist anzugeben, welche Größe invariant bleibt.
  - Task demand (EN): Starting from E = γm₀c² and the historical definition m_rel = E/c², m_rel must be derived and interpreted for v = 0 and a specified relativistic speed. The invariant quantity must be identified.
  - Expected performance (DE): Die lernende Person erhält m_rel = γm₀, prüft m_rel = m₀ im Ruhegrenzfall, ordnet den größeren Wert bei Bewegung der historischen Definition E/c² zu und hält m₀ für dasselbe Teilchen konstant.
  - Expected performance (EN): The learner obtains m_rel = γm₀, checks m_rel = m₀ in the rest limit, assigns the larger value in motion to the historical definition E/c², and keeps m₀ constant for the same particle.
  - Understanding focus (DE): Die Herleitung macht sichtbar, dass die Geschwindigkeitsabhängigkeit aus γ und einer Definition stammt.
  - Understanding focus (EN): The derivation makes visible that velocity dependence comes from γ and a definition.
- `translate-two-frame-claim`
  - Task demand (DE): Zwei Beobachter beschreiben dasselbe massive Teilchen mit verschiedenen Geschwindigkeiten. Eine historische Lösung sagt, seine „Masse“ sei im zweiten System größer. Die Aussage ist mathematisch einzuordnen und vollständig in moderne Größen zu übersetzen.
  - Task demand (EN): Two observers describe the same massive particle with different velocities. A historical solution says its “mass” is larger in the second frame. The statement must be classified mathematically and translated fully into modern quantities.
  - Expected performance (DE): Die lernende Person deutet „Masse“ hier als m_rel = E/c², lässt die invariante Ruhemasse unverändert, ordnet dem System mit größerem γ höhere Energie und größeren Impulsbetrag zu und erklärt die Bezugssystemabhängigkeit.
  - Expected performance (EN): The learner interprets “mass” here as m_rel = E/c², leaves invariant rest mass unchanged, assigns higher energy and greater momentum magnitude to the frame with larger γ, and explains the frame dependence.
  - Understanding focus (DE): Der Sprachtransfer diagnostiziert die Fehlvorstellung einer physisch anwachsenden invarianten Masse.
  - Understanding focus (EN): The language transfer diagnoses the misconception of a physically increasing invariant mass.
## Page 9: Hertzsprung-Russell-Diagramm (HRD)

- Full learning-goal ID: `206fe51d-cc78-5422-b139-32cc97eb1c37`
- Goal fingerprint: `sha256:3bc6b685e1c98a91258200891411cc8711b259a090c3c21ab98ee9b96db294b2`
- Page fingerprint: `sha256:78d703ec652267d112461b8e4e72cc98e843a2048a2bcf842c46227dab29b017`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Astrophysik > Sternentstehung und Sternentwicklung

### Canonical description

Die lernende Person kann Sterne anhand ihrer Leuchtkraft und Oberflächentemperatur im Hertzsprung-Russell-Diagramm einordnen und die Bereiche Hauptreihe, Rote Riesen und Weiße Zwerge im Zusammenhang mit der Sternentwicklung deuten.

### Visualization

/assets/goal-visualizations/physik/206fe51d-cc78-5422-b139-32cc97eb1c37/206fe51d-cc78-5422-b139-32cc97eb1c37.png

- original digest: `sha256:242f17adcdc7783fe4dab5927aa1a4b2c4e98e8285482a332bbec50e1bbcf6a4`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Achsen, Skalen und Einheiten lesen — `80c232f1-8f72-5829-9dbe-5a610ccab3be` (outside this book)
- Aufbau des Sonnensystems beschreiben — `af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93` (outside this book)

### Direct reverse prerequisites outside this book

- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)
- Sterntypen und Entwicklung — `6f896466-e0ec-5f8d-82ad-2890433c82ba` (outside this book)
- Sternentfernungen mit dem HRD abschätzen — `3a4b2f86-5c59-5429-8fb4-75d9b2589cb5` (outside this book)
- Sternradien aus HRD-Daten abschätzen — `6a73cacc-e86d-5248-a180-fd3da8454b0f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:61eae33529c8db46a93d2dfa88c0ba3e91418bdaf08a17454689467b38e0825b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `hrd-coordinates`
  - Essential understanding (DE): Das HRD ordnet Leuchtkraft und Oberflächentemperatur auf logarithmischen Achsen, nicht räumliche Positionen; in der üblichen Darstellung nimmt die Temperatur nach rechts ab.
  - Essential understanding (EN): The HR diagram maps luminosity and surface temperature on logarithmic axes, not spatial positions; in the conventional representation temperature decreases to the right.
  - Observable performance (DE): Die lernende Person kennzeichnet in einem neuen Diagramm Achsen, Richtungen und Skalen, trägt neue Werte konsistent ein und ordnet sie begründet Hauptreihe, Roten Riesen oder Weißen Zwergen zu.
  - Observable performance (EN): In a new diagram, the learner identifies axes, directions, and scales, plots fresh values consistently, and justifiably assigns them to the main sequence, red giants, or white dwarfs.
- `regions-and-model-boundary`
  - Essential understanding (DE): Die beiden Größen bestimmen gemeinsam den HRD-Bereich; eine einzelne Position kennzeichnet einen physikalischen und evolutionären Zustand, legt aber ohne weitere Angaben keinen vollständigen Entwicklungsweg fest.
  - Essential understanding (EN): The two quantities jointly determine the HR-diagram region; a single position indicates a physical and evolutionary state but does not determine a complete evolutionary path without further information.
  - Observable performance (DE): Die lernende Person deutet Lagevergleiche fachlich, begründet unterschiedliche Zuordnungen trotz ähnlicher Einzelwerte und benennt die Grenze der aus einem Diagrammpunkt möglichen Aussage.
  - Observable performance (EN): The learner interprets positional comparisons physically, justifies different classifications despite similar individual values, and states the limit of what can be inferred from one plotted point.

**Coverage expectations**

- required expectations: `hrd-coordinates`, `regions-and-model-boundary`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `paired-observables`: Neue Wertepaarungen und ein Vergleich ähnlicher Temperatur bei stark unterschiedlicher Leuchtkraft. / Fresh pairs of values and a comparison at similar temperature but strongly different luminosity.
- `display-convention`: Unbeschriftete oder in ihrer Darstellungsrichtung veränderte Achsen. / Unlabeled axes or axes with an altered display direction.

**Application cases**

- `place-three-stars`
  - Task demand (DE): Beschrifte ein zunächst unbeschriftetes schematisches HRD korrekt. Trage A(6000 K, 1 L☉), B(3500 K, 1000 L☉) und C(12000 K, 0,01 L☉) ein und deute ihre Bereiche.
  - Task demand (EN): Correctly label an initially unlabeled schematic HR diagram. Plot A(6000 K, 1 L☉), B(3500 K, 1000 L☉), and C(12000 K, 0.01 L☉), and interpret their regions.
  - Expected performance (DE): A liegt ungefähr auf der Hauptreihe, B im Bereich Roter Riesen und C bei Weißen Zwergen. Die Einordnung nutzt beide logarithmischen Achsen und verwechselt die Positionen nicht mit Orten im Weltraum.
  - Expected performance (EN): A lies approximately on the main sequence, B in the red-giant region, and C among white dwarfs. The classification uses both logarithmic axes and does not confuse positions with locations in space.
  - Understanding focus (DE): Eigenständige Koordinatenübersetzung und physikalische Bedeutung der drei Bereiche.
  - Understanding focus (EN): Independent coordinate translation and physical meaning of the three regions.
- `altered-axis-transfer`
  - Task demand (DE): Ordne in einem frischen HRD mit ausdrücklich nach rechts zunehmender Temperatur die Sterne D(3500 K, 0,01 L☉) und E(3500 K, 1000 L☉) ein. Prüfe die Behauptung, beide müssten dieselbe Entwicklungsphase und dasselbe Alter haben.
  - Task demand (EN): In a fresh HR diagram with temperature explicitly increasing to the right, place stars D(3500 K, 0.01 L☉) and E(3500 K, 1000 L☉). Assess the claim that they must have the same evolutionary phase and age.
  - Expected performance (DE): Beide Sterne erhalten dieselbe Temperaturkoordinate. D liegt ungefähr im kühlen Hauptreihenbereich, E im Bereich Roter Riesen. Die geänderte Achsenrichtung spiegelt die horizontale Anordnung gegenüber der üblichen Darstellung. Gleiche Temperatur belegt weder dieselbe Phase noch ein eindeutiges Alter; dafür fehlen weitere physikalische Angaben.
  - Expected performance (EN): Both stars share a temperature coordinate. D lies approximately on the cool main sequence and E in the red-giant region. The changed axis direction mirrors the horizontal arrangement compared with the conventional representation. Equal temperature establishes neither the same phase nor a unique age; additional physical information is required.
  - Understanding focus (DE): Transfer der Achsenkonvention und Grenze einer isolierten Temperaturinformation.
  - Understanding focus (EN): Transfer of the axis convention and the limit of temperature information alone.
## Page 10: Entfernungsbestimmung

- Full learning-goal ID: `db6b8de4-21e0-58e8-a347-2ae39f538f92`
- Goal fingerprint: `sha256:e920ed0252bfc964853b65a0a374e59c0086a9ef7535df683c45374e6f8253f7`
- Page fingerprint: `sha256:01fa1b58daa692767040f80dff5c98ba65b1c7fd7c8ec3a97fd2d39524370eac`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Astrophysik

### Canonical description

Die lernende Person kann aus geeigneten Beobachtungsdaten die Entfernung oder Leuchtkraft eines Himmelskörpers abschätzen und begründen, welche zusätzlichen Größen und Modellannahmen dafür benötigt werden.

### Visualization

/assets/goal-visualizations/physik/db6b8de4-21e0-58e8-a347-2ae39f538f92/db6b8de4-21e0-58e8-a347-2ae39f538f92.jpg

- original digest: `sha256:2aed302ef44b199c1c08c41429e2eb8385a709f163df62e6c4c6eafd0c75ef83`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Termwerte durch Einsetzen berechnen — `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` (outside this book)
- Aufbau des Sonnensystems beschreiben — `af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93` (outside this book)

### Direct reverse prerequisites outside this book

- Sternentfernungen und kosmologische Beobachtungen auswerten — `335a75b0-f691-5867-8ce3-3c971d541b9f` (outside this book)
- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)
- Sternentfernungen mit dem HRD abschätzen — `3a4b2f86-5c59-5429-8fb4-75d9b2589cb5` (outside this book)
- Sternentfernungen und Tangentialgeschwindigkeiten astrometrisch bestimmen — `9f85de48-1b3f-5afb-8a34-ce94cf7a1b49` (outside this book)
- Galaxienentfernungen bestimmen und Verfahren beurteilen — `206a7d3d-9b11-56be-89ff-73898445c4f5` (outside this book)
- Astronomische Einheit und ihre beobachtungsbasierte Bestimmung erklären — `5cf160e5-e0c2-5552-b2cf-0f04871c5e7e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5f721bacd68d4200f77de349debb19f356ef56bce54e9967df26d4f59ad2a8bf`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `inferred-distance`
  - Essential understanding (DE): Entfernung wird aus Beobachtungsdaten mit einer geeigneten Beziehung erschlossen; beobachteter Fluss und intrinsische Leuchtkraft sind verschiedene Größen.
  - Essential understanding (EN): Distance is inferred from observational data using an appropriate relationship; observed flux and intrinsic luminosity are different quantities.
  - Observable performance (DE): Die lernende Person verarbeitet neue Parallaxen- oder Flussdaten, begründet die verwendete Beziehung und bestimmt Entfernung oder relative Leuchtkraft mit passenden Einheiten.
  - Observable performance (EN): The learner processes fresh parallax or flux data, justifies the relationship used and determines distance or relative luminosity with suitable units.
- `uncertainty-degeneracy`
  - Essential understanding (DE): Messunsicherheit begrenzt die Schätzung; Fluss allein legt Entfernung und Leuchtkraft nicht gleichzeitig eindeutig fest.
  - Essential understanding (EN): Measurement uncertainty limits the estimate; flux alone does not uniquely determine both distance and luminosity.
  - Observable performance (DE): Die lernende Person gibt eine begründete Spannweite oder relative Schätzung an und benennt die Zusatzinformation, die eine mehrdeutige Flussmessung auflöst.
  - Observable performance (EN): The learner gives a justified interval or relative estimate and identifies the additional information needed to resolve an ambiguous flux measurement.

**Coverage expectations**

- required expectations: `inferred-distance`, `uncertainty-degeneracy`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `known-information`: Geometrische Parallaxe mit Unsicherheit gegenüber kalibriertem oder unkalibriertem Leuchtkraft-Fluss-Zusammenhang. / Geometric parallax with uncertainty versus calibrated or uncalibrated luminosity–flux relationships.

**Application cases**

- `parallax-interval`
  - Task demand (DE): Die jährliche Parallaxe eines nahen Sterns ist p=0,050±0,005 Bogensekunden. Verwende d in pc =1/p in Bogensekunden. Schätze Entfernung und Spannweite und erkläre den Unterschied zwischen gemessener und erschlossener Größe.
  - Task demand (EN): A nearby star has annual parallax p=0.050±0.005 arcseconds. Use d in pc =1/p in arcseconds. Estimate distance and an interval and explain the distinction between measured and inferred quantities.
  - Expected performance (DE): Die zentrale Schätzung ist 20 pc. p=0,055 bzw. 0,045 ergibt ungefähr 18,2 bis 22,2 pc; die größere Parallaxe bedeutet kleinere Entfernung. Der Winkel ist beobachtet, die Entfernung daraus geometrisch erschlossen.
  - Expected performance (EN): The central estimate is 20 pc. p=0.055 and 0.045 give approximately 18.2 to 22.2 pc; larger parallax means smaller distance. The angle is observed and distance inferred geometrically from it.
  - Understanding focus (DE): Unsicherheit wird durch die nichtlineare Beziehung in eine asymmetrische Entfernungsspanne übersetzt.
  - Understanding focus (EN): Uncertainty is translated through the nonlinear relationship into an asymmetric distance interval.
- `flux-calibration`
  - Task demand (DE): Ein Referenzstern steht in 10 pc Entfernung. Ein gleich leuchtkräftiger Stern zeigt nur ein Neuntel seines Flusses. Schätze dessen Entfernung. Ein weiterer Stern hat denselben Fluss wie die Referenz, aber unabhängig bekannte 20 pc Entfernung. Vergleiche seine Leuchtkraft; vernachlässige Absorption.
  - Task demand (EN): A reference star is 10 pc away. A star of equal luminosity has only one ninth of its flux. Estimate its distance. Another star has the same flux as the reference but an independently known distance of 20 pc. Compare its luminosity; neglect absorption.
  - Expected performance (DE): Aus F=L/(4πd²) folgen 30 pc für den gleich leuchtkräftigen Stern und vierfache Leuchtkraft für den Stern bei 20 pc mit gleichem Fluss. Ohne bekannte Leuchtkraft oder unabhängige Entfernung bliebe die Zuordnung mehrdeutig.
  - Expected performance (EN): F=L/(4πd²) gives 30 pc for the equal-luminosity star and four times the luminosity for the star at 20 pc with equal flux. Without known luminosity or independent distance, the inference would remain ambiguous.
  - Understanding focus (DE): Kalibrierung und physikalische Entartung zwischen intrinsischer Strahlung und geometrischer Verdünnung.
  - Understanding focus (EN): Calibration and the physical degeneracy between intrinsic radiation and geometric dilution.
## Page 11: Kosmologie vertieft

- Full learning-goal ID: `aa0fa5fb-7bfb-5f9f-a606-3f7187cfb745`
- Goal fingerprint: `sha256:680c6687428345255ad958283e1e6c2dffb3ce46fdbfa0af427bf8120d521aa0`
- Page fingerprint: `sha256:a3ce284b5f3716c1694a341a24ef52c86e5071d8f9fe3801542ae0a61b47e252`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Astrophysik

### Canonical description

Die lernende Person kann kosmologische Rotverschiebungen aus Spektraldaten berechnen, sie mithilfe vorgegebener einfacher Modelle mit der Expansion des Universums verknüpfen und die dabei verwendeten Näherungen erläutern.

### Visualization

/assets/goal-visualizations/physik/aa0fa5fb-7bfb-5f9f-a606-3f7187cfb745/aa0fa5fb-7bfb-5f9f-a606-3f7187cfb745.jpg

- original digest: `sha256:4e87eb53fe00d79cff91e3ef616059b5ff20b349b56a54c7e48c8ea819a65268`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Termwerte durch Einsetzen berechnen — `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` (outside this book)
- Urknallmodell anhand kosmologischer Beobachtungen erläutern — `c52d55c3-b687-586c-b0f9-8ffcd1069424` (outside this book)

### Direct reverse prerequisites outside this book

- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)
- Universumsalter mit der Hubble-Beziehung abschätzen — `44f0eefa-2d93-5954-879f-f6c49e5cebc7` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:2deb191933d982727b02d9e6004a1e09c9838ebdcc0dcfd302000073beed2cb1`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `redshift-model`
  - Essential understanding (DE): Für dieselbe identifizierte Spektrallinie ist z=(λ_beob−λ_em)/λ_em dimensionslos; im vorgegebenen Expansionsmodell beschreibt dies eine Wellenlängenstreckung.
  - Essential understanding (EN): For the same identified spectral line, z=(λ_obs−λ_em)/λ_em is dimensionless; in the supplied expansion model it describes wavelength stretching.
  - Observable performance (DE): Die lernende Person berechnet z aus neuen Spektraldaten, prüft Vorzeichen und Einheiten und verbindet das Ergebnis mit der im Fall vorgegebenen Expansion.
  - Observable performance (EN): The learner calculates z from fresh spectral data, checks sign and units and relates the result to the expansion specified in the case.
- `approximation`
  - Essential understanding (DE): Die Näherung z≈H₀d/c gilt nur bei kleinen kosmologischen Rotverschiebungen und passenden Idealannahmen; 1+z=a_heute/a_Emission ist eine andere vorgegebene Modellbeziehung.
  - Essential understanding (EN): The approximation z≈H₀d/c applies only at small cosmological redshift under suitable idealizations; 1+z=a_today/a_emission is a different supplied model relationship.
  - Observable performance (DE): Die lernende Person wählt zwischen den vorgegebenen Beziehungen, gewinnt eine Vorhersage und benennt, welche Entfernungsaussage bei großem z nicht aus der linearen Näherung folgt.
  - Observable performance (EN): The learner selects between supplied relationships, obtains a prediction and states which distance claim at large z does not follow from the linear approximation.

**Coverage expectations**

- required expectations: `redshift-model`, `approximation`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `model-regime`: Kleine Rotverschiebung mit linearem Entfernungsmodell gegenüber großer Rotverschiebung mit Skalenfaktormodell. / Small redshift with a linear distance model versus large redshift with a scale-factor model.

**Application cases**

- `small-redshift`
  - Task demand (DE): Eine sicher identifizierte Linie mit Ruhewellenlänge 500 nm erscheint bei 510 nm. Verwende für diesen idealisierten kosmologischen Fall z≈H₀d/c mit H₀=70 km/s/Mpc und c=300000 km/s; Pekuliarbewegung sei vernachlässigbar. Bestimme z und d und begründe die Näherung.
  - Task demand (EN): A securely identified line with rest wavelength 500 nm appears at 510 nm. For this idealized cosmological case use z≈H₀d/c with H₀=70 km/s/Mpc and c=300000 km/s; peculiar motion is negligible. Find z and d and justify the approximation.
  - Expected performance (DE): z=10/500=0,02 und d≈300000·0,02/70 Mpc≈85,7 Mpc. z ist klein und einheitenlos; die positive Verschiebung passt im gegebenen Modell zur Expansion. Die Entfernung ist modellabhängig, nicht direkt im Spektrum abgelesen.
  - Expected performance (EN): z=10/500=0.02 and d≈300000·0.02/70 Mpc≈85.7 Mpc. z is small and dimensionless; the positive shift fits expansion in the supplied model. Distance is model-dependent, not read directly from the spectrum.
  - Understanding focus (DE): Messgröße, daraus berechnete Rotverschiebung und modellabhängige Entfernung werden getrennt.
  - Understanding focus (EN): The measured quantity, calculated redshift and model-dependent distance are distinguished.
- `large-redshift`
  - Task demand (DE): Eine Linie von 400 nm wird bei 800 nm beobachtet. Gegeben ist 1+z=a_heute/a_Emission. Bestimme das Verhältnis der Skalenfaktoren und prüfe, ob d=cz/H₀ aus der Kleine-z-Näherung hier eine gerechtfertigte Entfernung liefert.
  - Task demand (EN): A 400 nm line is observed at 800 nm. Given 1+z=a_today/a_emission, determine the scale-factor ratio and assess whether d=cz/H₀ from the small-z approximation gives a justified distance here.
  - Expected performance (DE): z=1 und a_heute/a_Emission=2. Die Wellenlänge hat sich im gegebenen Expansionsmodell verdoppelt. z=1 ist nicht klein; eine Entfernung erfordert ein dafür geeignetes Modell, nicht die unkritische lineare Formel.
  - Expected performance (EN): z=1 and a_today/a_emission=2. The wavelength has doubled in the supplied expansion model. z=1 is not small; distance requires an appropriate model, not uncritical use of the linear formula.
  - Understanding focus (DE): Eine sinnvolle Modellrechnung kann zugleich eine andere nicht gedeckte Schlussfolgerung ausschließen.
  - Understanding focus (EN): A valid model calculation can simultaneously rule out another unsupported inference.
## Page 12: Hauptreihenzeiten mit der Masse-Leuchtkraft-Beziehung abschätzen

- Full learning-goal ID: `946ecf7b-0fcf-5776-9fb6-d397423c2f12`
- Goal fingerprint: `sha256:f6ecd973bf8404f1fef6a4470727c91ec8e6e00403e0e0694a9f967b4592c4a8`
- Page fingerprint: `sha256:442a785d0804027b0dbbc029c14868b268e74a4c7e7196f17bd1a50bab4e6186`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Astrophysik

### Canonical description

Die lernende Person kann die Hauptreihenzeit eines Sterns mithilfe einer für seinen Massenbereich geeigneten Masse-Leuchtkraft-Beziehung und eines vereinfachten Brennstoffmodells abschätzen und die Grenzen dieser Abschätzung begründen.

### Visualization

/assets/goal-visualizations/physik/946ecf7b-0fcf-5776-9fb6-d397423c2f12/946ecf7b-0fcf-5776-9fb6-d397423c2f12.jpg

- original digest: `sha256:439c9f4d5e20f3137f4133bd6e0b5a5d035179ef4fbc6f3fcc2a17c85b35649c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Termwerte durch Einsetzen berechnen — `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` (outside this book)
- Sterntypen und Entwicklung — `6f896466-e0ec-5f8d-82ad-2890433c82ba` (outside this book)

### Direct reverse prerequisites outside this book

- Eine Hauptreihenzeit mit begrenztem Modell abschätzen — `027d25fc-b609-5383-ac44-5dd3327ca577` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:748ff26c432e66fc4ae18ea59474be6baa926af0f1bf77a622c38c6046cbff1f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `fuel-power-lifetime`
  - Essential understanding (DE): Die Hauptreihenzeit hängt vom nutzbaren Fusionsenergiebudget und der mittleren Leuchtkraft ab. Größere Masse liefert im vereinfachten Vergleich mehr Brennstoff, aber bei L∝M^α mit α>1 steigt die Leistung stärker und die Zeit sinkt.
  - Essential understanding (EN): Main-sequence lifetime depends on usable fusion energy and average luminosity. Greater mass supplies more fuel in the simplified comparison, but with L∝M^α and α>1 power grows faster and lifetime decreases.
  - Observable performance (DE): Die lernende Person entwickelt t≈E_nutz/L und leitet für eine bereitgestellte massenbereichsgebundene Beziehung eine Lebensdauerabschätzung mit physikalischer Deutung ab.
  - Observable performance (EN): The learner develops t≈E_usable/L and derives a lifetime estimate from a supplied mass-range-limited relation, interpreting the physics.
- `model-regime`
  - Essential understanding (DE): Gleicher nutzbarer Brennstoffanteil, annähernd passende mittlere Leistung, Massenbereich und Hauptreihenphase sind Modellbedingungen; eine Potenzbeziehung gilt nicht universal für sämtliche Sterne und Phasen.
  - Essential understanding (EN): Comparable usable fuel fraction, an appropriate average power, mass range, and main-sequence phase are model conditions; a power relation is not universal across all stars and phases.
  - Observable performance (DE): Die lernende Person prüft die Abschätzung bei geänderter Brennstoffnutzung oder Entwicklungsphase und erklärt, welche zusätzliche Annahme oder Datenbasis nötig wäre.
  - Observable performance (EN): The learner checks the estimate for changed fuel utilization or evolutionary phase and explains which additional assumption or evidence would be needed.

**Coverage expectations**

- required expectations: `fuel-power-lifetime`, `model-regime`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `physical-condition-change`: Vergleich bei gleichem gegenüber verändertem nutzbarem Brennstoffanteil; Hauptreihe innerhalb des angegebenen Massenbereichs gegenüber Riesenphase oder Extrapolation. / Equal versus changed usable fuel fraction; main sequence within the stated mass range versus giant phase or extrapolation.

**Application cases**

- `mass-and-consumption`
  - Task demand (DE): Für ein Modell im Bereich 0,8–2 M☉ sei L/L☉=(M/M☉)³, das nutzbare Energiebudget proportional M und t☉=10 Milliarden Jahre. Leite für 2 M☉ die Zeit ab und prüfe „Doppelter Brennstoff bedeutet doppelte Lebensdauer“.
  - Task demand (EN): For a model valid from 0.8 to 2 M☉, take L/L☉=(M/M☉)³, usable energy proportional to M, and t☉=10 billion years. Derive the lifetime for 2 M☉ and assess “Twice the fuel means twice the lifetime.”
  - Expected performance (DE): Zweifaches Budget und achtfache Leistung ergeben t/t☉=1/4, also 2,5 Milliarden Jahre. Die Aussage ignoriert den veränderten Verbrauch; die Zeit ist nicht aus dem Brennstoff allein bestimmbar.
  - Expected performance (EN): Twice the energy and eight times the power give t/t☉=1/4, or 2.5 billion years. The claim ignores changed consumption; fuel alone does not determine lifetime.
  - Understanding focus (DE): Verknüpfung von Energie und Leistung statt Zahleneinsatz in eine unverstandene Lebensdauerformel.
  - Understanding focus (EN): Connect energy and power rather than merely substitute into an unexplained lifetime formula.
- `fuel-fraction-and-phase`
  - Task demand (DE): In einem neuen bereitgestellten Hauptreihenmodell erhält Stern B bei sonst gleicher Masse und mittlerer Leuchtkraft den doppelten nutzbaren Brennstoffanteil wie A. Vergleiche die Zeiten. Jemand will die gleiche Masse-Leuchtkraft-Beziehung danach auf einen Roten Riesen anwenden; begrenze diesen Schluss.
  - Task demand (EN): In a fresh supplied main-sequence model, B has twice A’s usable fuel fraction at otherwise equal mass and average luminosity. Compare lifetimes. Someone then applies the same mass–luminosity relation to a red giant; limit that inference.
  - Expected performance (DE): Bei gleichen M und L verdoppelt sich hier E_nutz und damit t; die frühere Annahme gleicher Brennstoffnutzung ist gezielt geändert. Beim Roten Riesen ist die Hauptreihenbedingung verletzt; seine Phase und Energiequellen erfordern eine andere Modellgrundlage.
  - Expected performance (EN): At equal M and L, E_usable and hence t double; the previous equal-fuel-utilization assumption has deliberately changed. A red giant violates the main-sequence condition; its phase and energy sources require a different model.
  - Understanding focus (DE): Unabhängiger Transfer auf eine Modellannahme statt bloß neue Sternmasse.
  - Understanding focus (EN): Independent transfer to a model assumption rather than merely a different stellar mass.
## Page 13: Rotationsdauer der Sonne aus Beobachtungsreihen abschätzen

- Full learning-goal ID: `23335a89-f8e6-5c22-8705-d71193aeac96`
- Goal fingerprint: `sha256:5ef34388296a0eeb6a84a66769a580cd4b739b06ba3eff31e79df0a72c2e74b6`
- Page fingerprint: `sha256:ba8629a79bb4e029cf8177e2fd726d792eb62e555044d7ea54c8390345d722ff`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Astrophysik > Solare Zustandsgrößen aus Beobachtungen erschließen

### Canonical description

Die lernende Person kann in zeitlich getrennten, sicher gewonnenen oder bereitgestellten Sonnenbildern wiedererkennbare Strukturen verfolgen, daraus eine beobachterbezogene synodische Rotationsdauer abschätzen und erläutern, wie Projektion, Strukturentwicklung und differentielle Rotation die Näherung begrenzen.

### Visualization

/assets/goal-visualizations/physik/23335a89-f8e6-5c22-8705-d71193aeac96/23335a89-f8e6-5c22-8705-d71193aeac96.png

- original digest: `sha256:94dacedf9e64e4382fc170a8e0828fac9e34cd56eda0c086ee49a1b892ba3b32`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Mit Größen einheitengerecht rechnen und Ergebnisse deuten — `ca623958-c204-5d1b-bdd0-3f76765674cb` (outside this book)
- Astronomische Beobachtungsmethoden — `2b700858-bc2e-5ddf-a791-b14d44160480` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:2baf51031826b130a01b215719b6d6850496a0b2239d090e054adc712ff02791`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `selected-blind-review-core`
  - Essential understanding (DE): Wiedererkennbare Sonnenstrukturen dienen als zeitlich begrenzte Rotationstracer: Ihre Positionsänderung relativ zum Beobachter liefert eine synodische, nicht unmittelbar eine siderische Rotationsdauer. Projektion auf die Bildfläche, Eigenentwicklung der Struktur und breitenabhängige differentielle Rotation beeinflussen die Inferenz.
  - Essential understanding (EN): Recurring solar features act as time-limited rotation tracers: their positional change relative to the observer yields a synodic period, not directly a sidereal rotation period. Projection onto the image plane, evolution of the feature itself, and latitude-dependent differential rotation affect the inference.
  - Observable performance (DE): In einer sicher gewonnenen oder bereitgestellten, datierten Bildreihe identifiziert die lernende Person begründet dieselbe Struktur, misst ihre Positions- oder Längenänderung in einem erklärten Bezugssystem, schätzt daraus die synodische Rotationsdauer und trennt Messstreuung von systematischen Grenzen durch Projektion, Strukturentwicklung und differentielle Rotation.
  - Observable performance (EN): In a safely obtained or supplied dated image series, the learner justifiably identifies the same feature, measures its positional or longitudinal change in an explained reference system, estimates the synodic rotation period, and distinguishes measurement scatter from systematic limitations due to projection, feature evolution, and differential rotation.
- `image-plane-motion-needs-projection-aware-coordinates`
  - Essential understanding (DE): Eine Verschiebung auf der zweidimensionalen Sonnenscheibe ist nicht unmittelbar derselbe Winkel wie eine Rotation um die Sonnenachse. Scheibenmittelpunkt, Achsenlage, Abstand vom Rand und das gewählte Koordinatensystem bestimmen, wie Bildpositionen in eine beobachterbezogene Längenänderung übersetzt werden dürfen.
  - Essential understanding (EN): A displacement on the two-dimensional solar disc is not directly the same angle as rotation about the Sun's axis. Disc centre, axis orientation, distance from the limb, and the chosen coordinate system determine how image positions may be translated into an observer-relative change in longitude.
  - Observable performance (DE): Die lernende Person definiert ein reproduzierbares Bild- oder Längenkoordinatensystem, erklärt oder korrigiert die Projektion, verwirft eine naive lineare Randmessung und begründet, welche Messpunkte beziehungsweise welcher Scheibenbereich für die Periodenschätzung tragfähig sind.
  - Observable performance (EN): The learner defines a reproducible image or longitude coordinate system, explains or corrects for projection, rejects a naive linear limb measurement, and justifies which measurement points or disc region support the period estimate.
- `tracer-identity-cadence-and-evolution-limit-the-result`
  - Essential understanding (DE): Die Inferenz setzt voraus, dass tatsächlich dieselbe Struktur verfolgt wird. Beobachtungskadenz, Lücken, Formänderung und Lebensdauer des Tracers beeinflussen Zuordnung und Streuung; unterschiedliche heliografische Breiten können wegen differentieller Rotation systematisch verschiedene Perioden liefern.
  - Essential understanding (EN): The inference assumes that the same feature is genuinely being tracked. Observing cadence, gaps, shape changes, and tracer lifetime affect matching and scatter; different heliographic latitudes can systematically yield different periods because of differential rotation.
  - Observable performance (DE): Die lernende Person begründet die Strukturzuordnung anhand mehrerer Merkmale, quantifiziert oder begründet ein Periodenintervall, kennzeichnet mehrdeutige Zuordnungen und erklärt eine Breitenabhängigkeit oder Abweichung als physikalische beziehungsweise systematische Grenze statt sie ungeprüft zu mitteln.
  - Observable performance (EN): The learner justifies feature matching using several characteristics, quantifies or justifies a period interval, identifies ambiguous matches, and explains a latitude dependence or discrepancy as a physical or systematic limitation instead of averaging it without examination.

**Coverage expectations**

- required expectations: `selected-blind-review-core`, `image-plane-motion-needs-projection-aware-coordinates`, `tracer-identity-cadence-and-evolution-limit-the-result`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `tracer-latitude`: Strukturen auf unterschiedlicher heliografischer Breite / Features at different heliographic latitudes
- `cadence-and-lifetime`: Dichte oder lückenhafte Zeitabtastung und langlebiger oder sich entwickelnder Tracer / Dense or gapped temporal sampling and a long-lived or evolving tracer
- `projection-position`: Messungen nahe der Scheibenmitte oder am projizierten Sonnenrand / Measurements near disc centre or near the projected solar limb

**Application cases**

- `fresh-dated-solar-series`
  - Task demand (DE): In einer neu bereitgestellten, datierten und sicher aufgenommenen Sonnenbildreihe ist eine langlebige Struktur über mehrere Zeitpunkte zu verfolgen. Definiere die Messkoordinaten, schätze die synodische Periode und begründe Mess- und Modellunsicherheit einschließlich der Randprojektion.
  - Task demand (EN): In a newly supplied, dated, safely acquired solar-image series, track a long-lived feature across several times. Define the measurement coordinates, estimate the synodic period, and justify measurement and model uncertainty including limb projection.
  - Expected performance (DE): Die lernende Person weist die Strukturidentität nachvollziehbar nach, misst in einem erklärten Bezugssystem, verwendet nur geometrisch tragfähige Punkte oder eine begründete Korrektur und berichtet eine synodische Periode mit Unsicherheitsintervall.
  - Expected performance (EN): The learner establishes feature identity transparently, measures in an explained reference frame, uses only geometrically defensible points or a justified correction, and reports a synodic period with an uncertainty interval.
  - Understanding focus (DE): Der Fall prüft die vollständige Beobachtungs-Daten-Inferenzkette an einer frischen Serie, nicht das Wiedererkennen einer vorgegebenen Grafik.
  - Understanding focus (EN): The case tests the complete observation-data-inference chain on a fresh series, not recognition of a supplied graphic.
- `latitude-and-cadence-transfer`
  - Task demand (DE): Für eine unabhängige Beobachtungsreihe sind bereits identifizierte Tracer auf zwei Breiten, ihre gemessenen Längen mit Unsicherheiten und eine lückenhaftere Kadenz tabelliert. Schätze beide synodischen Perioden, prüfe die Zuverlässigkeit und erkläre eine mögliche Differenz.
  - Task demand (EN): For an independent observing series, already identified tracers at two latitudes, their measured longitudes with uncertainties, and a more gapped cadence are tabulated. Estimate both synodic periods, assess reliability, and explain a possible difference.
  - Expected performance (DE): Die lernende Person passt die Auswertung an die Messlücken an, trennt Streuung und Zuordnungsunsicherheit von differentieller Rotation und verweigert eine einheitliche Periode, wenn die Daten breitenabhängige Unterschiede tragen.
  - Expected performance (EN): The learner adapts the analysis to the data gaps, distinguishes scatter and matching uncertainty from differential rotation, and does not impose a single period when the data support latitude-dependent differences.
  - Understanding focus (DE): Der Transfer prüft Referenzrahmen, Unsicherheit und differentielle Rotation ohne Abhängigkeit von der Gestaltung eines Lernzielbildes.
  - Understanding focus (EN): The transfer tests reference frame, uncertainty, and differential rotation without dependence on the design of a learning-goal image.
## Page 14: Induktionsgesetz in Ableitungsform anwenden

- Full learning-goal ID: `d18d4190-ddc1-5181-b1b6-e79947b737c2`
- Goal fingerprint: `sha256:569e32682ffa8b72219f1b616546ccf82c5a66dc43399cd1a3e29ef276eb78f0`
- Page fingerprint: `sha256:9a13390d513f5f2f356b82122dcd34642e5204531f388f4411f429451104de9d`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q2 Schwingungen, Induktion und mechanische Wellen > Induktion und elektromagnetische Schwingungen

### Canonical description

Die lernende Person kann für eine Spule mit N gleichartigen Windungen aus dem gemeinsamen orientierten differenzierbaren magnetischen Fluss Φ(t) pro Windung die momentane Induktionsspannung mit U_ind(t) = −N · dΦ(t)/dt bestimmen und den zeitlichen Spannungsverlauf physikalisch deuten.

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

Status: `needs_human_review`; profile fingerprint: `sha256:ac4800f580456d0b04a302a2e35a4ade281f61f72d265250f6b27ccb0f70b6e3`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `instantaneous-voltage-is-negative-flux-derivative`
  - Essential understanding (DE): Φ(t) bezeichnet den für alle N Windungen gleichen, konsistent orientierten differenzierbaren magnetischen Fluss pro Windung; die gesamte Flussverkettung ist Ψ(t)=NΦ(t). Für diesen gemeinsamen Fluss pro Windung gilt U_ind(t) = −N dΦ/dt; ist dagegen bereits Ψ(t) gegeben, wird der Faktor N nicht nochmals berücksichtigt. Der Spannungsbetrag misst die momentane Flussänderungsrate, nicht den Flusswert selbst; konstanter Fluss liefert null Spannung.
  - Essential understanding (EN): Φ(t) denotes the same consistently oriented differentiable magnetic flux per turn through all N turns; the total flux linkage is Ψ(t)=NΦ(t). For this common per-turn flux, U_ind(t) = −N dΦ/dt; if Ψ(t) is already supplied, the factor N is not included again. Voltage magnitude measures the instantaneous rate of flux change, not the flux value itself; constant flux gives zero voltage.
  - Observable performance (DE): Die lernende Person benennt Φ als gemeinsamen Fluss pro Windung und berücksichtigt die Windungszahl N genau einmal. Sie wählt für eine neue Funktion oder einen glatten Graphen die Ableitungsform, bestimmt U_ind(t) mit Einheit und erklärt Nullstellen aus waagerechter Flussteigung.
  - Observable performance (EN): The learner identifies Φ as the common per-turn flux and includes the turn count N exactly once. For a fresh function or smooth graph, the learner selects the derivative form, determines U_ind(t) with units, and explains zeros from horizontal flux slope.
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
  - Task demand (DE): Für alle N Windungen ist derselbe orientierte Fluss pro Windung Φ(t) gegeben; die positive Umlaufrichtung für U_ind ist konsistent zur Flächenorientierung festgelegt. Für Φ(t) = Φ0 cos(ωt) und N Windungen bestimme U_ind(t), skizziere beide Verläufe und erkläre Amplitude, Phasenlage und Nulldurchgänge physikalisch.
  - Task demand (EN): The same oriented per-turn flux Φ(t) is supplied for all N turns; the positive circulation direction for U_ind is fixed consistently with the surface orientation. For Φ(t) = Φ0 cos(ωt) and N turns, determine U_ind(t), sketch both curves, and physically explain amplitude, phase relation, and zero crossings.
  - Expected performance (DE): Die lernende Person erhält U_ind = NωΦ0 sin(ωt) unter der festgelegten Konvention, verbindet den ω-Faktor mit Änderungsrate und ordnet Spannungsnullen den Flussextrema zu.
  - Expected performance (EN): The learner obtains U_ind = NωΦ0 sin(ωt) under the specified convention, links the ω factor to rate of change, and associates voltage zeros with flux extrema.
  - Understanding focus (DE): Der Fall prüft Ableitung und physikalische Graphdeutung gemeinsam.
  - Understanding focus (EN): The case jointly tests differentiation and physical graph interpretation.
- `smooth-pulse-and-corner-audit`
  - Task demand (DE): Für alle N Windungen ist derselbe orientierte Fluss pro Windung Φ(t) gegeben; die positive Umlaufrichtung für U_ind ist konsistent zur Flächenorientierung festgelegt. Ein glatter magnetischer Flusspuls und ein zweiter Verlauf mit idealisiertem Knick werden vorgegeben. Skizziere für den glatten Puls U_ind(t), identifiziere Maxima und Vorzeichenwechsel und beurteile den Momentanwert genau am Knick des zweiten Verlaufs.
  - Task demand (EN): The same oriented per-turn flux Φ(t) is supplied for all N turns; the positive circulation direction for U_ind is fixed consistently with the surface orientation. A smooth magnetic-flux pulse and a second curve with an idealized corner are supplied. Sketch U_ind(t) for the smooth pulse, identify maxima and sign changes, and judge the instantaneous value exactly at the corner of the second curve.
  - Expected performance (DE): Die lernende Person leitet den glatten Verlauf qualitativ aus der Steigung ab, lokalisiert größte Beträge an steilsten Stellen und erklärt, dass die klassische Ableitung am Knick keinen eindeutigen Momentanwert liefert.
  - Expected performance (EN): The learner derives the smooth voltage qualitatively from slope, locates largest magnitudes at steepest points, and explains that the classical derivative gives no unique instantaneous value at the corner.
  - Understanding focus (DE): Der Transfer prüft Kurvenform und die explizite Differenzierbarkeitsgrenze.
  - Understanding focus (EN): The transfer tests curve shape and the explicit differentiability limit.
## Page 15: Schwingungsgleichung lösen

- Full learning-goal ID: `b2fb9a25-4d26-5cf2-a917-823909dcb6bd`
- Goal fingerprint: `sha256:7d88450b7bd26dad77ae8935a9f74a1ec762f6446ae62ea3e64b4bac2093f5b4`
- Page fingerprint: `sha256:4641fa566d7e86c39f43e58401e042a64b498dc32c062c9a13bb9a168e634b62`
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

Status: `needs_human_review`; profile fingerprint: `sha256:ba181e717ab171e0f5e6e1973054024be0d2b4034654f47e3957e203529b3943`
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
  - Task demand (DE): Ein unabhängig vorgelegter idealer ungedämpfter Oszillator erfüllt x″+ω₀²x=0 mit ω₀>0. Zum Vergleich startet derselbe Oszillator bei x(0)=A_ref>0 mit v(0)=0, also aus Ruhe am positiven Umkehrpunkt. Der neue Anfangszustand ist x(0)=0 in der Gleichgewichtslage und v(0)=r·ω₀·A_ref>0; A_ref und ω₀ sowie der dimensionslose Geschwindigkeitsfaktor r>0 sind gegeben. Sage vor der Rechnung die qualitative Änderung von Amplitude und Phase gegenüber dem Vergleichsstart für r<1, r=1 und r>1 voraus. Bestimme danach die Lösung als Sinus-Kosinus-Linearkombination und in äquivalenter Amplituden-Phasenform und weise die Übereinstimmung beider Darstellungen nach.
  - Task demand (EN): An independently presented ideal undamped oscillator satisfies x″+ω₀²x=0 with ω₀>0. For comparison, the same oscillator starts at x(0)=A_ref>0 with v(0)=0, at rest at the positive turning point. The new initial state is x(0)=0 at equilibrium and v(0)=r·ω₀·A_ref>0; A_ref and ω₀ and the dimensionless speed factor r>0 are given. Before calculating, predict the qualitative change in amplitude and phase from the comparison start for r<1, r=1, and r>1. Then determine the solution as a sine-cosine linear combination and in equivalent amplitude-phase form, and demonstrate that the two representations agree.
  - Expected performance (DE): Die lernende Person löst die gegebene Differenzialgleichung, setzt Auslenkung und Geschwindigkeit zum Anfangszeitpunkt ein, bestimmt die Konstanten einschließlich eines zum Vorzeichen von x(0) und v(0) passenden Phasenwinkels und prüft durch Ableiten sowohl die Gleichung als auch beide Anfangsbedingungen; anschließend deutet sie A, ω₀ und φ mit Größen, Einheiten und Bezug auf die gewählte Zeit- und Koordinatenkonvention.
  - Expected performance (EN): The learner solves the given differential equation, applies the initial displacement and velocity, determines the constants including a phase angle consistent with the signs of x(0) and v(0), and checks both the equation and the two initial conditions by differentiation; the learner then interprets A, ω₀, and φ using physical quantities, units, and the chosen time and coordinate conventions.
  - Understanding focus (DE): Die allgemeine Lösung der ungedämpften Schwingungsgleichung x''+ω₀²x=0 kann gleichwertig als Linearkombination von Sinus und Kosinus oder als x(t)=A cos(ω₀t+φ) dargestellt werden; zwei Anfangsbedingungen bestimmen die beiden Integrationskonstanten eindeutig, während A die maximale Auslenkung, ω₀ die Zeitskala der Schwingung und φ den Anfangszustand im Zyklus beschreibt.
  - Understanding focus (EN): The general solution of the undamped oscillator equation x''+ω₀²x=0 can equivalently be represented as a linear combination of sine and cosine or as x(t)=A cos(ω₀t+φ); two initial conditions uniquely determine the two integration constants, while A describes the maximum displacement, ω₀ the oscillator's time scale, and φ the initial state within the cycle.
## Page 16: Kraft und Verformung experimentell untersuchen

- Full learning-goal ID: `45bbdf6b-6372-5b6a-b7e4-be15a0eb4b83`
- Goal fingerprint: `sha256:b030a8819ae60efc5706bfafe03d9c55c6515ed7f247a61579016b01a0330f26`
- Page fingerprint: `sha256:7226a1adafd21b6beeb732b907f4d335429a17e4d5601bcb14fa3fd7e58b38f0`
- Topic path: Physik > Sekundarstufe I > Mechanische Grundlagen (Sek I) > Kräfteigenschaften untersuchen

### Canonical description

Die lernende Person kann den Zusammenhang zwischen Kraft und Verformung eines elastischen Körpers experimentell untersuchen, Messwerte tabellarisch und grafisch auswerten und begründet angeben, in welchem Messbereich Kraft und Verformung proportional sind.

### Visualization

/assets/goal-visualizations/physik/45bbdf6b-6372-5b6a-b7e4-be15a0eb4b83/45bbdf6b-6372-5b6a-b7e4-be15a0eb4b83.jpg

- original digest: `sha256:146636869dbe72b8dd53f2976b859c9807b550be726f72325f457193ea998e06`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Proportionale Zusammenhänge mit Quotientengleichheit prüfen — `c1f50bcc-7848-4e49-b9de-0ec030cc6bca` (outside this book)
- Achsen, Skalen und Einheiten lesen — `80c232f1-8f72-5829-9dbe-5a610ccab3be` (outside this book)
- Kräfte und Trägheit qualitativ erklären — `5ea765ac-c279-551a-8a94-a07da2381e5b` (outside this book)
- Experimente planen und Messdaten auswerten — `d3c153b9-e09b-5668-8386-73105546a7c1` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-I-Abschlussaufgaben Physik selbstständig lösen — `3631c8f7-ff48-57ff-b7ee-8397ff1d166a` (outside this book)
- Prüfungsaufgabe: Kräfte experimentell und grafisch untersuchen — `d8bad724-03ea-510a-8415-928332ed4979` (outside this book)
- Lineare Rückstellkraft bei harmonischen Schwingungen beschreiben — `05af2893-0201-4d7f-985b-272d7b88e26e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:98349916ce616beb49001b5a4e5766d203fbca763885004603abc35867cee516`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `controlled-force-deformation-measurement`
  - Essential understanding (DE): Der Zusammenhang wird geprüft, indem am selben elastischen Körper die Kraft als unabhängige Größe systematisch verändert, die Verformung relativ zu einer unbelasteten Referenz gemessen und andere Bedingungen möglichst konstant gehalten werden.
  - Essential understanding (EN): The relationship is tested by systematically varying force as the independent quantity on the same elastic body, measuring deformation relative to an unloaded reference, and keeping other conditions as constant as possible.
  - Observable performance (DE): Die lernende Person plant oder führt eine sichere Messreihe mit benannten Größen, Einheiten, Nullpunkt, ausreichend vielen Belastungsstufen und mindestens einer Wiederholungsmessung aus und dokumentiert die Werte nachvollziehbar in einer Tabelle.
  - Observable performance (EN): The learner plans or carries out a safe measurement series with named quantities, units, a zero reference, enough load levels, and at least one repeated measurement, and documents the values traceably in a table.
- `proportional-range-evidence`
  - Essential understanding (DE): Kraft und Verformung sind nur in einem Messbereich proportional, wenn das Verhältnis der Größen dort innerhalb der Messstreuung konstant ist beziehungsweise ein geeigneter Graph näherungsweise eine Gerade durch den Ursprung bildet; eine beliebige Gerade mit Achsenabschnitt genügt nicht.
  - Essential understanding (EN): Force and deformation are proportional only over a measurement range in which their ratio is constant within measurement scatter, or an appropriate graph is approximately a straight line through the origin; an arbitrary straight line with an intercept is not sufficient.
  - Observable performance (DE): Die lernende Person erstellt und beschriftet einen geeigneten Graphen, prüft Verhältnis oder Ausgleichsgerade samt Nullpunkt und markiert den durch Daten gestützten proportionalen Bereich, statt die gesamte Messreihe pauschal proportional zu nennen.
  - Observable performance (EN): The learner creates and labels an appropriate graph, checks the ratio or fitted line including the origin, and marks the data-supported proportional range instead of declaring the entire series proportional.
- `departure-and-uncertainty-diagnosis`
  - Essential understanding (DE): Abweichungen können aus Messunsicherheit, Nullpunktfehlern oder dem Verlassen des elastisch-proportionalen Bereichs stammen; bleibende Verformung und systematische Krümmung sind nicht durch bloßes Mitteln zu beseitigen.
  - Essential understanding (EN): Deviations can arise from measurement uncertainty, zero error, or leaving the elastic proportional range; permanent deformation and systematic curvature cannot be removed by simple averaging.
  - Observable performance (DE): Die lernende Person unterscheidet Streuung von einer systematischen Abweichung, prüft nach Entlastung die Rückkehr zur Ausgangslänge und begrenzt ihre Aussage auf den tatsächlich untersuchten Körper und Messbereich.
  - Observable performance (EN): The learner distinguishes scatter from systematic deviation, checks return to the original length after unloading, and limits the conclusion to the body and measurement range actually investigated.

**Coverage expectations**

- required expectations: `controlled-force-deformation-measurement`, `proportional-range-evidence`, `departure-and-uncertainty-diagnosis`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `elastic-body`: Schraubenfeder, Gummiband oder ein anderer elastischer Körper mit unterschiedlichem Arbeitsbereich / Coil spring, elastic band, or another elastic body with a different working range
- `deviation-pattern`: Zufällige Streuung, Nullpunktverschiebung oder systematische Krümmung bei hoher Belastung / Random scatter, zero offset, or systematic curvature at high load

**Application cases**

- `spring-load-series`
  - Task demand (DE): Für eine sicher befestigte Feder sind Belastungskraft und Verlängerung von null bis zu einer vorgegebenen sicheren Höchstlast zu messen, tabellarisch und grafisch darzustellen und der proportionale Bereich zu begründen.
  - Task demand (EN): For a safely secured spring, load force and extension must be measured from zero to a specified safe maximum load, represented in a table and graph, and the proportional range justified.
  - Expected performance (DE): Die lernende Person verwendet eine unbelastete Referenz, variiert nur die Last, beschriftet beide Größen mit Einheiten, prüft Verhältnis und Ursprungslage und nennt den Bereich, in dem die Abweichungen mit der Streuung vereinbar sind.
  - Expected performance (EN): The learner uses an unloaded reference, varies only the load, labels both quantities with units, checks the ratio and origin, and states the range in which deviations are compatible with the scatter.
  - Understanding focus (DE): Die Proportionalität wird aus einer kontrollierten Messreihe begründet und nicht aus einem einzelnen Wertepaar behauptet.
  - Understanding focus (EN): Proportionality is justified from a controlled measurement series rather than asserted from a single pair of values.
- `elastic-band-fresh-data`
  - Task demand (DE): Eine neue digitale Messreihe eines Gummibands zeigt geringe Streuung bei kleinen Kräften, eine gekrümmte Fortsetzung und nach hoher Belastung einen verschobenen Nullwert. Der vertretbare Proportionalitätsbereich und die Aussagegrenzen sind unabhängig zu bestimmen.
  - Task demand (EN): A new digital data set for an elastic band shows small scatter at low forces, a curved continuation, and a shifted zero value after high loading. The defensible proportional range and limits of the conclusion must be determined independently.
  - Expected performance (DE): Die lernende Person beschränkt die Proportionalitätsaussage auf den gestützten Anfangsbereich, deutet Krümmung und verschobenen Nullwert als systematische Hinweise und lehnt eine Ausgleichsgerade über alle Punkte nachvollziehbar ab.
  - Expected performance (EN): The learner restricts the proportionality claim to the supported initial range, interprets curvature and the shifted zero as systematic indicators, and gives a reasoned rejection of a fitted line through all points.
  - Understanding focus (DE): Der Transfer deckt die Fehlvorstellung auf, jede annähernd steigende Messreihe sei über den ganzen Bereich proportional.
  - Understanding focus (EN): The transfer exposes the misconception that every approximately increasing data series is proportional over its full range.
## Page 17: Sehschwaechen mit dem Linse-Schirm-Modell untersuchen

- Full learning-goal ID: `ce14a7e7-7e2a-517f-a465-78ba3fbe414d`
- Goal fingerprint: `sha256:edbab211d37209035065c9bf6e91486bd2d5176e96baed868d4adca2d94a856a`
- Page fingerprint: `sha256:7291598e2f8dbc54b1b55f26e196bbf7af9618be9477a9b1f1d81a2f2bc87337`
- Topic path: Physik > Bundeslandspezifische Ergänzungen > Sekundarstufe II > Biophysik

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

- Termwerte durch Einsetzen berechnen — `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` (outside this book)
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
## Page 18: Gravitationsgesetz und Gewichtskraft anwenden

- Full learning-goal ID: `eb0ffdea-c12d-56df-b7e8-c0297d2f8aff`
- Goal fingerprint: `sha256:e9efeb618b0553d9b241515d9f4d18f16300dbee61d7c6284008e09dff440144`
- Page fingerprint: `sha256:0cea42443323aff8c5129b0ad820c67ec77a9eac592f77e63ed95c0d8a8fe38e`
- Topic path: Physik > Bundeslandspezifische Ergänzungen > Stufenübergreifend > Weitere fachliche Ziele

### Canonical description

Die lernende Person kann das Gravitationsgesetz formulieren, die Gewichtskraft aus der Feldstärke herleiten und einfache Aufgaben zu Gravitationskräften lösen.

### Visualization

/assets/goal-visualizations/physik/eb0ffdea-c12d-56df-b7e8-c0297d2f8aff/eb0ffdea-c12d-56df-b7e8-c0297d2f8aff.jpg

- original digest: `sha256:2f906d58a915b064b247d0c0b8d14517c93746e240c0483f4d25bb7e06df231c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Termwerte durch Einsetzen berechnen — `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` (outside this book)
- Masse und Gewichtskraft unterscheiden — `9c328f68-41ed-55dd-9e02-34414a6246f2` (outside this book)

### Direct reverse prerequisites outside this book

- Orbitaldynamik und Energiebilanz — `1b432223-3d59-5586-86a9-2214b4844101` (outside this book)
- Kreisbewegung, Gravitation und Gasmodell — `5773ccbe-cd20-5ba0-99a5-7ccd5f42be51` (outside this book)
- Gravitation und Weltbilder in GK-Aufgaben verknüpfen — `7e0308d8-a239-5c0f-b2c0-724f21e4da60` (outside this book)
- E-Phase-Klausuraufgaben Physik selbstständig lösen — `7f83e25c-38f7-5ac2-8f9c-ec54eeef1026` (outside this book)
- Prüfungsaufgabe: Gravitations- und Rückstellkräfte modellieren — `ac6c578c-401b-5e4b-801a-6dff8fe8b93a` (outside this book)
- Gravitationskraft und Gravitationspotential — `a42f91a4-0d21-5aa9-ae11-f48be6f2e431` (outside this book)
- Planetenbewegungen deuten — `60211ac1-cbe1-5182-87ef-673a068c5b0a` (outside this book)
- 3. Kepler-Gesetz per Skalierungsargument herleiten (LK) — `89cadf81-143b-5f6b-82bd-29ba20d92a1b` (outside this book)
- Newtons Beitrag zur Erklärung von Planetenbewegungen erläutern (GK) — `d873ffa2-04b3-5978-a955-89563802a348` (outside this book)
- Gezeiten qualitativ erklären — `37013646-f13a-5faf-954c-940f2fd7502f` (outside this book)
- Dunkle Materie qualitativ einordnen — `3d466956-04fb-58d7-9008-ad8090f8706d` (outside this book)
- Allgemeine Relativitätstheorie (Qualitativ) — `14d99a65-8d58-5647-88ab-02137b96d55b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1c49ee7d0c4247e86fd222b50201b8dc5fde0c7551ab9f41b1539c193ec2cbea`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `field-force`
  - Essential understanding (DE): Außerhalb einer kugelsymmetrischen Masse gilt F=GMm/r² und g=F/m=GM/r²; Gewichtskraft mg hängt von Ort und Probemasse ab.
  - Essential understanding (EN): Outside a spherically symmetric mass, F=GMm/r² and g=F/m=GM/r²; weight mg depends on position and test mass.
  - Observable performance (DE): Die lernende Person leitet F=mg aus dem Gravitationsgesetz her, benennt r als Mittelpunktabstand und bestimmt Kräfte mit Einheiten und Richtung.
  - Observable performance (EN): The learner derives F=mg from the gravitational law, identifies r as centre-to-centre distance and determines forces with units and direction.
- `changed-position`
  - Essential understanding (DE): Eine veränderte Höhe verändert die Feldstärke, nicht die Masse des betrachteten Körpers.
  - Essential understanding (EN): A change in altitude changes field strength, not the mass of the object.
  - Observable performance (DE): Die lernende Person übersetzt Höhe in Mittelpunktabstand und begründet eine Kraftänderung anhand der inversen quadratischen Abhängigkeit.
  - Observable performance (EN): The learner converts altitude into centre-to-centre distance and justifies a force change using the inverse-square relationship.

**Coverage expectations**

- required expectations: `field-force`, `changed-position`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `given-quantity`: Wechsel von gegebener lokaler Feldstärke zu einer Höhenänderung über einer kugelförmigen Welt. / Change from a supplied local field strength to an altitude change above a spherical world.

**Application cases**

- `local-field`
  - Task demand (DE): Auf einem gedachten kugelförmigen Planeten beträgt g am Messort 6 N/kg. Erläutere aus dem Gravitationsgesetz die Kraft auf eine Masse von 3 kg und auf eine zweite von 6 kg.
  - Task demand (EN): At a measurement location on an idealized spherical planet, g is 6 N/kg. Use the gravitational law to explain the force on a 3 kg mass and on a second 6 kg mass.
  - Expected performance (DE): Aus GMm/r²=m(GM/r²)=mg folgen 18 N und 36 N zum Planetenmittelpunkt; g ist an demselben Ort gleich und hat die Einheit N/kg.
  - Expected performance (EN): GMm/r²=m(GM/r²)=mg gives 18 N and 36 N towards the planet centre; g is the same at that location and has units N/kg.
  - Understanding focus (DE): Zusammenhang von Gravitationsgesetz, Feldstärke und Gewichtskraft, nicht nur Einsetzen.
  - Understanding focus (EN): Relationship between the gravitational law, field strength and weight, not substitution alone.
- `altitude-radius`
  - Task demand (DE): Ein Körper mit 4 kg erfährt an der Oberfläche eines Planeten mit Radius R und g=8 N/kg Gravitation. Vergleiche den Fall mit einer Höhe R über der Oberfläche; vernachlässige Rotation.
  - Task demand (EN): A 4 kg object experiences gravity at the surface of a planet of radius R with g=8 N/kg. Compare this with an altitude R above the surface; neglect rotation.
  - Expected performance (DE): Die Abstände sind R und 2R, daher g oben 2 N/kg und F 8 N statt 32 N. Die Masse bleibt 4 kg. Die Höhe allein ist kein zulässiges r.
  - Expected performance (EN): The distances are R and 2R, so g at altitude is 2 N/kg and F is 8 N instead of 32 N. Mass remains 4 kg. Altitude alone is not a valid r.
  - Understanding focus (DE): Mittelpunktabstand und Feldänderung als physikalische Grenze einer mechanischen Formelverwendung.
  - Understanding focus (EN): Centre-to-centre distance and field change as the physical limit of mechanical formula use.
## Page 19: Potenzielle Energie und Potential

- Full learning-goal ID: `594f7f21-6b8a-531c-8424-5f1dcbaf0f23`
- Goal fingerprint: `sha256:402136f6e120891f54f53b832378118740cabbdeaeb4c14bf807f3179a2b7bb7`
- Page fingerprint: `sha256:61806d8621fe126e78c0dd260fc5b00d56e0d35e7766dd7c74f6e8233619dcea`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen > Gravitation

### Canonical description

Die lernende Person kann potenzielle Energie über ein Potential beschreiben, einfache Fälle etwa im Gravitationsfeld berechnen und erläutern, wie Lage und gewähltes Nullniveau den Energiewert bestimmen, während Energiedifferenzen vom Nullniveau unabhängig sind.

### Visualization

/assets/goal-visualizations/physik/594f7f21-6b8a-531c-8424-5f1dcbaf0f23/594f7f21-6b8a-531c-8424-5f1dcbaf0f23.jpg

- original digest: `sha256:4dc1535cf933d5cf1473352fb2eabc7469b0cfbe08109832bfb89fac40356352`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Termwerte durch Einsetzen berechnen — `a6469c01-6ca3-5eb2-a82c-94f3d0560b32` (outside this book)
- Rationale Zahlen addieren und subtrahieren — `4eeab7d5-eeb3-579b-845e-1c52ffe9e89f` (outside this book)
- Gravitationskraft und Gravitationspotential — `a42f91a4-0d21-5aa9-ae11-f48be6f2e431` (outside this book)

### Direct reverse prerequisites outside this book

- Gravitation und Weltbilder in GK-Aufgaben verknüpfen — `7e0308d8-a239-5c0f-b2c0-724f21e4da60` (outside this book)
- E-Phase-Klausuraufgaben Physik selbstständig lösen — `7f83e25c-38f7-5ac2-8f9c-ec54eeef1026` (outside this book)
- Erhaltung der mechanischen Energie tiefer verstehen (LK) — `e359f8bb-6106-44aa-9edf-694528d2d2a9` (outside this book)
- Allgemeine Relativitätstheorie (Qualitativ) — `14d99a65-8d58-5647-88ab-02137b96d55b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6c00701b8fb663c0406eb80c835cd375e4c231f070b2eea4c9ef27741cf3c96b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `energy-per-mass`
  - Essential understanding (DE): Potential Φ ist Energie je Masse und U=mΦ; Ort, Masse und Nullniveau bestimmen den angegebenen Energiewert.
  - Essential understanding (EN): Potential Φ is energy per mass and U=mΦ; position, mass and zero level determine the reported energy value.
  - Observable performance (DE): Die lernende Person berechnet U aus Φ oder einem einfachen Höhenmodell und unterscheidet J von J/kg.
  - Observable performance (EN): The learner calculates U from Φ or a simple height model and distinguishes J from J/kg.
- `zero-invariance`
  - Essential understanding (DE): Ein gemeinsamer konstanter Potentialversatz verändert U, aber nicht die Energiedifferenz zwischen zwei Orten.
  - Essential understanding (EN): A common constant potential offset changes U but not the energy difference between two positions.
  - Observable performance (DE): Die lernende Person rechnet denselben Ortswechsel mit zwei Nullniveaus und erklärt die identische Differenz einschließlich Vorzeichen.
  - Observable performance (EN): The learner calculates the same change of position using two zero levels and explains the identical difference including its sign.

**Coverage expectations**

- required expectations: `energy-per-mass`, `zero-invariance`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `zero-and-field`: Wechsel des Nullniveaus im homogenen Höhenmodell und Vergleich vorgegebener Potentialwerte für verschiedene Massen. / Change the zero level in a uniform height model and compare supplied potential values for different masses.

**Application cases**

- `height-zero`
  - Task demand (DE): Eine Masse von 2 kg wird bei g=10 N/kg von h=1 m auf h=4 m gehoben. Bestimme U vorher/nachher und ΔU erst mit h=0, dann mit h=4 m als Nullniveau.
  - Task demand (EN): A 2 kg mass is raised from h=1 m to h=4 m with g=10 N/kg. Determine U before/after and ΔU first using h=0, then h=4 m as the zero level.
  - Expected performance (DE): Es ergeben sich 20 J und 80 J bzw. -60 J und 0 J; in beiden Fällen ΔU=+60 J. Der negative Anfangswert im zweiten System bedeutet keine negative Masse.
  - Expected performance (EN): The values are 20 J and 80 J, or -60 J and 0 J; both give ΔU=+60 J. The negative initial value in the second system does not mean negative mass.
  - Understanding focus (DE): Ein Energiewert ist nullniveauabhängig, der erforderliche Energiezuwachs nicht.
  - Understanding focus (EN): An energy value depends on the zero level, but the required energy increase does not.
- `potential-table`
  - Task demand (DE): Zwei Orte haben Φ_A=-30 J/kg und Φ_B=-10 J/kg. Vergleiche den Energiezuwachs für 2 kg und 5 kg und prüfe, was ein überall addierter Versatz von 40 J/kg ändert.
  - Task demand (EN): Two positions have Φ_A=-30 J/kg and Φ_B=-10 J/kg. Compare the energy increases for 2 kg and 5 kg and examine the effect of adding 40 J/kg everywhere.
  - Expected performance (DE): ΔΦ=20 J/kg ergibt 40 J bzw. 100 J. Nach dem Versatz sind Φ_A=10 und Φ_B=30 J/kg; dieselben Zuwächse bleiben. Die Potentialdifferenz ist für beide Massen gleich, die Energiedifferenz nicht.
  - Expected performance (EN): ΔΦ=20 J/kg gives 40 J and 100 J. After the offset, Φ_A=10 and Φ_B=30 J/kg; the increases are unchanged. Potential difference is equal for both masses, energy difference is not.
  - Understanding focus (DE): Potential als massebezogene Größe und Nullniveauwechsel ohne Änderung des physikalischen Ortswechsels.
  - Understanding focus (EN): Potential as a mass-specific quantity and a zero-level change without changing the physical displacement.
## Page 20: Transistorverstärker analysieren

- Full learning-goal ID: `af50bb9a-fd7b-50f5-9698-48c4efe99032`
- Goal fingerprint: `sha256:5287b3301992bc139408d19580e0ef2a11b6b35e972e3e0a2c5ed2cebe91e550`
- Page fingerprint: `sha256:fb592a8215f18dd6e5e956ffa79df8192a3737d61e97e97bf8d9eacdd47157c2`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Festkörperphysik

### Canonical description

Die lernende Person kann an einer vorgegebenen oder selbst aufgebauten bipolaren Verstärkerschaltung mithilfe von Kennlinien und Arbeitspunkt erklären, wie ein kleines Eingangssignal ein größeres Ausgangssignal steuert und welche Grenzen für eine unverzerrte Verstärkung gelten.

### Visualization

/assets/goal-visualizations/physik/af50bb9a-fd7b-50f5-9698-48c4efe99032/af50bb9a-fd7b-50f5-9698-48c4efe99032.jpg

- original digest: `sha256:438402ac93ebe6d746bfc077c75cff3c5908a561493786fc09bfdcac619900df`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Achsen, Skalen und Einheiten lesen — `80c232f1-8f72-5829-9dbe-5a610ccab3be` (outside this book)
- Einen bipolaren Transistor als Schalter funktional untersuchen — `7d4d6a39-0c78-5fb0-b7bf-182ed00972f7` (outside this book)

### Direct reverse prerequisites outside this book

- Festkoerperphysik und Halbleiterelektronik — `0f5346d6-de1b-5e38-aaba-68db205e594b` (outside this book)
- Prüfungsaufgabe: Arbeitspunkt und Verzerrung einer Emitterschaltung — `144007cb-e2bc-5c82-bf9d-dda705b15257` (outside this book)
- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:bb7606be040034f615bd92b075c565c1d58e96b354c7f7a3488d2926f7eb876a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `functional-understanding`
  - Essential understanding (DE): Ein bipolares Verstärkerbauteil steuert Energie aus der Versorgung durch ein Eingangssignal. Ein geeigneter Arbeitspunkt erlaubt kleine Signaländerungen im aktiven Bereich; Sperren oder Sättigung begrenzen die unverzerrte Ausgangsschwingung.
  - Essential understanding (EN): A bipolar amplifier device controls energy from its supply through an input signal. A suitable operating point permits small signal variations in the active region; cutoff or saturation limits the undistorted output swing.
  - Observable performance (DE): An der vorgegebenen oder selbst aufgebauten Schaltung verknüpft die lernende Person Eingangssignal, Arbeitspunkt und Kennlinie mit dem Ausgangssignal. Bei einer Emitterschaltung begründet sie gegebenenfalls die Phasenumkehr, ohne sie jeder Verstärkerschaltung zuzuschreiben.
  - Observable performance (EN): In the supplied or self-built circuit, the learner relates the input signal, operating point and characteristic curve to the output signal. For a common-emitter circuit they justify phase inversion where applicable, without attributing it to every amplifier circuit.
- `independent-transfer`
  - Essential understanding (DE): Arbeitspunktlage, Lastkennlinie und Signalhub verändern; aktive Beziehung gilt nicht in Sperre/Sättigung.
  - Essential understanding (EN): Vary bias, load characteristic and signal swing; the active-region relation does not apply in cutoff/saturation.
  - Observable performance (DE): Bei größerer Eingangsamplitude oder verschobenem Arbeitspunkt prognostiziert die lernende Person anhand der Kennlinien das Abschneiden einer Halbwelle und begründet eine geeignete Korrektur im gegebenen Aufbau.
  - Observable performance (EN): For larger input amplitude or a shifted operating point, the learner uses the curves to predict clipping of a half-wave and justifies a suitable correction in the given setup.

**Coverage expectations**

- required expectations: `functional-understanding`, `independent-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `physical-condition`: Arbeitspunktlage, Lastkennlinie und Signalhub verändern; aktive Beziehung gilt nicht in Sperre/Sättigung. / Vary bias, load characteristic and signal swing; the active-region relation does not apply in cutoff/saturation.

**Application cases**

- `fresh-function-case`
  - Task demand (DE): Analysiere eine neue vorgegebene Emitterschaltung mit Arbeitspunkt und Kennlinientabelle. Sage Ausgangsextrema bei kleinem Eingangssignal voraus und begründe die schaltungsspezifische Phasenumkehr und Energiequelle.
  - Task demand (EN): Analyse a fresh supplied common-emitter circuit with a bias point and characteristic table. Predict output extremes for a small input and explain this circuit’s phase inversion and energy source.
  - Expected performance (DE): Die lernende Person verknüpft Basisansteuerung, Kollektorstrom und Widerstandsspannungsabfall, prüft den aktiven Bereich und schreibt die zusätzliche Signalenergie der Versorgung zu.
  - Expected performance (EN): The learner connects base drive, collector current and resistor voltage drop, checks the active region and attributes added signal energy to the supply.
  - Understanding focus (DE): Ein bipolares Verstärkerbauteil steuert Energie aus der Versorgung durch ein Eingangssignal. Ein geeigneter Arbeitspunkt erlaubt kleine Signaländerungen im aktiven Bereich; Sperren oder Sättigung begrenzen die unverzerrte Ausgangsschwingung.
  - Understanding focus (EN): A bipolar amplifier device controls energy from its supply through an input signal. A suitable operating point permits small signal variations in the active region; cutoff or saturation limits the undistorted output swing.
- `changed-condition-case`
  - Task demand (DE): Bei gleichem Eingangssignal wird der Arbeitspunkt nahe an die Sättigungsgrenze verschoben. Prognostiziere die neue Ausgangsform und begründe aus den angegebenen Kennlinien eine wirksame Korrektur.
  - Task demand (EN): With the same input signal, bias shifts close to saturation. Predict the new output shape and justify an effective correction from the supplied characteristics.
  - Expected performance (DE): Die lernende Person lokalisiert die zuerst begrenzte Halbwelle, unterscheidet Signalverstärkung von Energieerzeugung und prüft einen verbesserten Arbeitspunkt anhand beider Ausgangsgrenzen.
  - Expected performance (EN): The learner identifies the half-wave clipped first, distinguishes amplification from energy creation and checks an improved bias against both output limits.
  - Understanding focus (DE): Arbeitspunktlage, Lastkennlinie und Signalhub verändern; aktive Beziehung gilt nicht in Sperre/Sättigung.
  - Understanding focus (EN): Vary bias, load characteristic and signal swing; the active-region relation does not apply in cutoff/saturation.

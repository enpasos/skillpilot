# AI review input: Physik – aktuelle Kompetenzziele

- Book ID: `physics-eighteen-current840-context-20261115-final-v2`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:4f3574884388f69f068d4f516bbfc32a5c2fd19f4d244def23b0f81822209e5e`
- Selected goals: 18

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Linsenauge mit geometrischer Optik modellieren

- Full learning-goal ID: `84ddb244-e560-592f-9d43-e84c801fe5b4`
- Goal fingerprint: `sha256:f00b7915335e0576460d0605e68682559ec94e9984897c4e21a2d4c2c3013c9c`
- Page fingerprint: `sha256:8b37ef3e7b3e42be8a41d30bf14fb5dcf1b533a1aeae728380a118347cb350c0`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann das Linsenauge mit Strahlenkonstruktion, Linsengleichung und Simulationen modellieren, Bedingungen scharfen Sehens quantitativ deuten und Modellgrenzen benennen.

### Visualization

/assets/goal-visualizations/physik/84ddb244-e560-592f-9d43-e84c801fe5b4/84ddb244-e560-592f-9d43-e84c801fe5b4.jpg

- original digest: `sha256:be7ee0441b1b19c18e4ee241a5be815a22cb1d45097bb53616d50b4fee8ee4ef`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Linsenabbildungen qualitativ beschreiben und konstruieren — `078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5` (outside this book)
- Formeln mit Brüchen nach Variablen auflösen — `0a154cbd-1218-4553-835c-a754e9901bba` (outside this book)

### Direct reverse prerequisites outside this book

- Linsenaugen im Tierreich physikalisch vergleichen — `8fe0ebf1-8256-53d2-9b01-fdb945e57a59` (outside this book)
- Sehschwaechen mit dem Linse-Schirm-Modell untersuchen — `ce14a7e7-7e2a-517f-a465-78ba3fbe414d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:390087597c963bd3040d8fcc51a82a09dfc963468ead2fb23776d04a010965a8`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `eye-model-focus`
  - Essential understanding (DE): Eine dünne Sammellinse und ein Schirm modellieren im paraxialen Bereich Brechung und Netzhautabbildung; scharfes Sehen verlangt Bildlage auf dem Schirm und 1/f=1/g+1/b.
  - Essential understanding (EN): A thin converging lens and screen model refraction and retinal imaging in the paraxial regime; sharp vision requires the image on the screen and 1/f=1/g+1/b.
  - Observable performance (DE): Die lernende Person begründet die Zuordnung von Objekt, Linse und Schirm, konstruiert passende Hauptstrahlen und berechnet eine mit festem Schirm vereinbare Brennweite oder Gegenstandsweite.
  - Observable performance (EN): The learner justifies the mapping of object, lens and screen, constructs appropriate principal rays and calculates a focal length or object distance compatible with a fixed screen.
- `simulation-and-limits`
  - Essential understanding (DE): Eine Simulation prüft Konsequenzen der gewählten Modellannahmen, nicht unabhängig deren biologische Wahrheit; das reale Auge besitzt mehrere brechende Flächen und physiologische Grenzen.
  - Essential understanding (EN): A simulation tests consequences of chosen model assumptions, not independently their biological truth; the real eye has several refracting surfaces and physiological limits.
  - Observable performance (DE): Die lernende Person variiert gezielt eine Modellgröße, vergleicht Simulation, Strahlenbild und Rechnung und benennt mindestens eine konkrete Grenze der Übertragung auf das Auge.
  - Observable performance (EN): The learner varies one model quantity deliberately, compares simulation, ray diagram and calculation and states at least one specific limit of applying the model to an eye.

**Coverage expectations**

- required expectations: `eye-model-focus`, `simulation-and-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `object-regime`: Fernobjekt gegenüber endlicher Gegenstandsweite bei festem Schirm. / Distant object versus finite object distance with a fixed screen.
- `inverse-model-use`: Brennweite für ein Objekt bestimmen gegenüber Schärfebereich einer begrenzt veränderlichen Linse vorhersagen. / Finding focal length for an object versus predicting the focus range of a lens with limited adjustability.

**Application cases**

- `far-near-accommodation`
  - Task demand (DE): Ein vereinfachtes Linsenauge hat b=20,0 mm zwischen dünner Linse und festem Netzhautschirm. Konstruiere Fern- und Nahabbildung für paralleles Licht bzw. g=250 mm und bestimme die jeweils notwendige Brennweite. Begründe die Modellzuordnung.
  - Task demand (EN): A simplified lens-eye model has b=20.0 mm between a thin lens and a fixed retinal screen. Construct far and near imaging for parallel light and g=250 mm, and find the focal length required in each case. Justify the model mapping.
  - Expected performance (DE): Erhält f=20,0 mm für das Fernobjekt und f=gb/(g+b)≈18,52 mm für das Nahobjekt; zeichnet konvergierende Strahlen mit umgekehrtem reellem Bild auf dem Schirm. Erklärt größere Brechkraft beim Nahfokus bei festem b und nennt etwa vernachlässigte Hornhaut oder Linsendicke.
  - Expected performance (EN): Obtains f=20.0 mm for the distant object and f=gb/(g+b)≈18.52 mm for the near object; draws converging rays with an inverted real image on the screen. Explains greater refractive power for near focus at fixed b and identifies, for example, neglected cornea or lens thickness.
  - Understanding focus (DE): Schärfe entsteht durch passende Bildlage, nicht allein durch das Vorhandensein einer Sammellinse.
  - Understanding focus (EN): Sharpness results from the correct image position, not merely from having a converging lens.
- `limited-accommodation-simulation`
  - Task demand (DE): Ein neuer dünner-Linsen-Simulator lässt f nur zwischen 18,0 und 20,0 mm verändern; der Schirm bleibt bei b=20,0 mm. Prognostiziere unabhängig, ob Objekte bei g=100 mm und g=300 mm scharf abbildbar sind. Konfiguriere diese Werte im Simulator, vergleiche die Strahlenschnittlage und erkläre die Grenze des Modells.
  - Task demand (EN): A fresh thin-lens simulator allows f to vary only from 18.0 to 20.0 mm; the screen stays at b=20.0 mm. Independently predict whether objects at g=100 mm and g=300 mm can be focused. Configure these values in the simulator, compare ray intersection positions and explain the model's limit.
  - Expected performance (DE): Berechnet f≈16,67 mm bzw. 18,75 mm: das erste liegt außerhalb, das zweite innerhalb des Einstellbereichs. Für g=100 mm und kleinstes f=18 mm liegt das Bild bei b≈21,95 mm hinter dem Schirm; dokumentiert entsprechende Simulatorausgabe. Unterscheidet Modellbereich von einer allgemeinen Aussage über individuelle Sehfähigkeit.
  - Expected performance (EN): Calculates f≈16.67 mm and 18.75 mm: the first is outside, the second inside the adjustment range. For g=100 mm and minimum f=18 mm, the image is at b≈21.95 mm behind the screen; records the corresponding simulator output. Distinguishes the model range from a general claim about individual visual ability.
  - Understanding focus (DE): Eine inverse Modellvorhersage bleibt an verfügbare Parameter und Idealannahmen gebunden.
  - Understanding focus (EN): An inverse model prediction remains bound to available parameters and ideal assumptions.
## Page 2: Farbsehen und additive Farbmischung deuten

- Full learning-goal ID: `39ef1e8a-9203-5192-8c76-8e0c3322646f`
- Goal fingerprint: `sha256:e3b8890f03b7470a89105333c214c31eb8db08eff4d5b077ffe742f5184c3985`
- Page fingerprint: `sha256:9daf6001d81783d260cc88a5091abbca56365707cdb9be23bd603be0a5e88dfe`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann additive Farbmischung als physiologischen Effekt des Farbsehens erklaeren und graphische Darstellungen empirischer Daten fachlich auswerten.

### Visualization

/assets/goal-visualizations/physik/39ef1e8a-9203-5192-8c76-8e0c3322646f/39ef1e8a-9203-5192-8c76-8e0c3322646f.jpg

- original digest: `sha256:35084f5a0fdd7bbb76040096c0f9663a199d4ebaf84531d35bc67cf01d38ca9b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Additive und subtraktive Farbmischung unterscheiden — `cdab9fd1-5054-4a7e-8c9a-4474062ddd23` (outside this book)
- Diagramme lesen — `5e7d5ff2-b92c-4989-85bc-8d87ad7edadd` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Farbangleichungsdaten und Empfängerwechsel deuten — `37eba8c7-c4be-5e27-86a1-9699af99387a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e1acde712df2f8ea876a4557b4d2ebb11b30ae9802fb6df261d4ff72da6c4bf2`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `reiz-und-wahrnehmung`
  - Essential understanding (DE): Additive Mischung überlagert Licht; die Farbwahrnehmung beruht auf dem gemeinsamen Antwortmuster verschiedener Zapfentypen und ist keine neue mittlere Lichtwellenlänge.
  - Essential understanding (EN): Additive mixing superposes light; colour perception depends on the joint response pattern of different cone types and is not a new mean wavelength of light.
  - Observable performance (DE): Verknüpft ein gegebenes spektrales oder Zapfenantwort-Diagramm mit einem Farbvergleich und erklärt, wie verschiedene Lichtzusammensetzungen dasselbe Antwortmuster erzeugen können.
  - Observable performance (EN): Connects a supplied spectral or cone-response graph to a colour comparison and explains how different light compositions can produce the same response pattern.
- `grafik-auswertung`
  - Essential understanding (DE): Empirische Antwort- oder Abgleichdaten gelten für bestimmte Reize und Beobachtungsbedingungen; ein vereinfachtes Antwortmodell ersetzt nicht das vollständige Sehsystem.
  - Essential understanding (EN): Empirical response or matching data apply to specified stimuli and viewing conditions; a simplified response model does not replace the complete visual system.
  - Observable performance (DE): Liest Achsen, relative Antwortwerte und Vergleichsbedingungen korrekt, konstruiert einen passenden Vergleich und begrenzt seine Schlussfolgerung bei veränderter Empfängerausstattung.
  - Observable performance (EN): Reads axes, relative response values, and comparison conditions correctly, constructs an appropriate comparison, and limits the conclusion when receptor equipment changes.

**Coverage expectations**

- required expectations: `reiz-und-wahrnehmung`, `grafik-auswertung`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `reiz-empfaenger`: Verschiedene Lichtzusammensetzungen bei gleichem Empfänger gegenüber verändertem Empfänger bei festen Reizen. / Different light compositions for the same observer versus a changed observer for fixed stimuli.

**Application cases**

- `gleiches-antwortmuster`
  - Task demand (DE): Materialgraph /assets/assessment-materials/physik/39ef1e8a-9203-5192-8c76-8e0c3322646f/cie1931-color-matching.svg (SHA256 85c0ad8df856bd15b156619f35d2d73105a736de19ea5234d112c1e8bea9fb7b). Source: CIE 2019, DOI10.25039/CIE.DS.xvudnb9b; source CSV SHA256 fa663e3535a7e0763a745993a1f0a192eb0275ac46ad2d1befd7626841e713c1; CC BY-SA4.0. Die tatsächlich mitgelieferte Grafik stellt die standardisierten CIE1931-Farbabgleichfunktionen x̄,ȳ,z̄ des2°-Normalbeobachters für photopische Farbabgleichbedingungen dar: λ in nm und dimensionslose relative Gewichtung. Sie wurde aus den veröffentlichten1-nm-Werten gezeichnet, nicht aus Messungen an dieser lernenden Person. Diese XYZ-Gewichtungen sind keine direkt gemessenen individuellen Zapfenempfindlichkeiten. Lies bei450nm und600nm je die drei Gewichtungen näherungsweise ab, vergleiche die Antwortmuster und benenne die begrenzte Aussage des standardisierten Farbabgleichs. Erkläre, warum aus drei Abgleichwerten nicht ein eindeutiges Spektrum oder die individuelle Wahrnehmung rekonstruiert wird. Getrennter synthetischer Modellteil bei festem Adaptationszustand: SML-Antworten R=(0,1,4),G=(0,3,2),Y=(0,4,6), Antworten im gegebenen schwachen linearen Modell additiv, Spektren R+G undY verschieden. Konstruiere R+G und erkläre die mögliche Farbübereinstimmung in diesem Empfängermodell, ohne XYZ undSML gleichzusetzen.
  - Task demand (EN): Materialgraph /assets/assessment-materials/physik/39ef1e8a-9203-5192-8c76-8e0c3322646f/cie1931-color-matching.svg (SHA256 85c0ad8df856bd15b156619f35d2d73105a736de19ea5234d112c1e8bea9fb7b). Source: CIE 2019, DOI10.25039/CIE.DS.xvudnb9b; source CSV SHA256 fa663e3535a7e0763a745993a1f0a192eb0275ac46ad2d1befd7626841e713c1; CC BY-SA4.0. The actually supplied graph plots the standardized CIE1931 XYZ colour-matching functions of the2° standard observer under photopic matching conditions: wavelength in nm and dimensionless relative weight. It is plotted from the published1nm values, not measurements of this learner. XYZ matching weights are not directly measured individual cone sensitivities. Read the three approximate weights at450nm and600nm, compare their patterns and state the limits of standardized matching. Explain why three matching values do not reconstruct a unique spectrum or individual perception. Separate synthetic model at fixed adaptation: SML responses R=(0,1,4),G=(0,3,2),Y=(0,4,6), additive in the supplied weak linear model, with different R+G andY spectra. Construct R+G and explain a possible match in this receiver model without equating XYZ andSML.
  - Expected performance (DE): Nennt Quelle,2°-Beobachter, photopischen Modellbereich und Achsen. Aus tatsächlich geliefertem Graphen näherungsweise450nm:(x̄,ȳ,z̄)=(0,34;0,04;1,77),600nm:(1,06;0,63;0,00); begründet unterschiedliche standardisierte Abgleichmuster statt individuelle Zapfenwerte zu behaupten. Rohwerte sind450:(0,3362;0,038;1,77211),600:(1,0622;0,631;0,0008), sinnvolle grafische Näherungen sind gültig. Trennt standardisierten empirisch fundierten Farbabgleich von der synthetischen SML-Konstruktion R+G=(0,4,6)=Y. Gleiche Modellantworten trotz unterschiedlicher Spektren bedeuten keine neu entstandene mittlere Wellenlänge und keinen Beweis individueller Farbgleichheit.
  - Expected performance (EN): Identifies source,2° observer, photopic model domain and axes. Approximately reads450nm XYZ=(0.34,0.04,1.77),600nm=(1.06,0.63,0.00) from the actual graph and justifies different standardized matching patterns without calling them individual cone sensitivities. Published values are450:(0.3362,0.038,1.77211),600:(1.0622,0.631,0.0008); sensible graphical estimates are valid. Separates empirically founded standardized matching from synthetic SML addition R+G=(0,4,6)=Y. Equal model responses to different spectra create neither a new mean wavelength nor proof of an individual perceptual match.
  - Understanding focus (DE): Echte empirische Grafik fachlich auswerten und von einem synthetischen Modell gleicher sensorischer Antworten unterscheiden.
  - Understanding focus (EN): Analyze an actual empirical graph scientifically and distinguish it from a synthetic model of equal sensory responses.
- `verringerte-antwortdimension`
  - Task demand (DE): Eine zweite konstruierte Messgrafik zeigt bei gleicher Helligkeitsabgleich-Bedingung die Antwortmuster A=(1,3,4), B=(1,1,4) in relativen S/M/L-Einheiten. Ein vereinfachtes Empfängermodell registriert zunächst alle drei, dann nur S und L; andere Signale werden im Fall ausgeschlossen. Vergleiche beide Grafiken und die Unterscheidbarkeit, ohne eine medizinische Diagnose zu stellen.
  - Task demand (EN): A second constructed measurement graph shows response patterns A=(1,3,4), B=(1,1,4) in relative S/M/L units under the same brightness-matching condition. A simplified receiver first registers all three and then only S and L; other signals are excluded in this case. Compare the graphs and discriminability without making a medical diagnosis.
  - Expected performance (DE): Liest den Unterschied ausschließlich in M ab, zeichnet für das reduzierte Modell zweimal (1,4) und begründet, weshalb der dort verfügbare Farbinformationsunterschied verschwindet. Mit drei Antworten bleiben A/B unterscheidbar. Verallgemeinert dies nicht auf die gesamte reale Wahrnehmung oder eine konkrete Person; die Grafik modelliert nur diese Reiz-/Empfängerbedingungen.
  - Expected performance (EN): Reads the difference as confined to M, plots (1,4) twice for the reduced model, and explains why the available colour-information difference disappears there. With three responses A/B remain distinguishable. Does not generalize to all real perception or a specific person; the graph models only these stimulus/receiver conditions.
  - Understanding focus (DE): Die physiologische Kodierung bestimmt, welche Unterschiede aus Reizdaten nutzbar sind.
  - Understanding focus (EN): Physiological encoding determines which differences in stimulus data are usable.
## Page 3: Beugungsbegrenzte Winkelauflösung des Auges abschätzen

- Full learning-goal ID: `41872413-497e-5b88-ac65-365ed7d9851f`
- Goal fingerprint: `sha256:f34ef17263d047a31d797d91bcc8e22a1ad5077e4b1cdaa83caa2d554aa24481`
- Page fingerprint: `sha256:7fefaf6303581b2f1cd9cedeb08f01c3939d2600d3cb538c8c035b62f6481fdf`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann die Fraunhofer-Beugung an einer Kreisblende nutzen, um aus Wellenlänge und Pupillendurchmesser die beugungsbegrenzte Winkelauflösung des Auges abzuschätzen, und diese ideale optische Grenze von biologischen Einflüssen auf die Sehschärfe unterscheiden.

### Visualization

/assets/goal-visualizations/physik/41872413-497e-5b88-ac65-365ed7d9851f/41872413-497e-5b88-ac65-365ed7d9851f.jpg

- original digest: `sha256:76cc734bce0fd8c5eab8cb16488ee3f1ef135f757eebdb6640851513ab63b306`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Auflösungsvermögen optischer Instrumente — `709e688c-eb07-5f83-a506-82c9bfe0d89f` (outside this book)

### Direct reverse prerequisites outside this book

- Auflösungsvermögen des Auges experimentell bestimmen — `6d882aac-9658-5f0d-bf3d-9338f0143bbc` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:945be2bd73385c8e8b24820c1260ea92fa56936d77669e6b786d63f4d32eec89`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `apply-circular-aperture-limit`
  - Essential understanding (DE): Für eine ideale Kreisblende liefert das Rayleigh-Kriterium θ_min ≈ 1,22 λ/D im Kleinwinkel- und Fernfeldregime. Größere Wellenlänge verschlechtert, größere wirksame Öffnung verbessert die ideale Winkelauflösung.
  - Essential understanding (EN): For an ideal circular aperture, the Rayleigh criterion gives θ_min ≈ 1.22 λ/D in the small-angle far-field regime. Greater wavelength worsens and a larger effective aperture improves ideal angular resolution.
  - Observable performance (DE): Die lernende Person wählt λ und D in konsistenten Einheiten, berechnet oder skaliert θ_min, prüft Größenordnung und Parameterabhängigkeit und nennt die verwendeten Idealannahmen.
  - Observable performance (EN): The learner uses λ and D in consistent units, calculates or scales θ_min, checks order of magnitude and parameter dependence, and states the ideal assumptions used.
- `distinguish-optical-and-biological-limits`
  - Essential understanding (DE): Die Beugungsgrenze ist nur eine optische Untergrenze. Netzhautabtastung, Kontrast, Aberrationen, Beleuchtung und neuronale Verarbeitung können die reale Sehschärfe zusätzlich begrenzen.
  - Essential understanding (EN): The diffraction limit is only an optical lower bound. Retinal sampling, contrast, aberrations, illumination, and neural processing can additionally limit real visual acuity.
  - Observable performance (DE): Die lernende Person vergleicht einen gemessenen Sehschärfewert mit der Beugungsabschätzung und entscheidet begründet, ob eine Abweichung optisch allein erklärt werden kann.
  - Observable performance (EN): The learner compares a measured visual-acuity value with the diffraction estimate and justifiably decides whether optics alone can explain a discrepancy.

**Coverage expectations**

- required expectations: `apply-circular-aperture-limit`, `distinguish-optical-and-biological-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `wavelength`: Kurze oder lange sichtbare Wellenlänge / Short or long visible wavelength
- `pupil-diameter`: Helle oder dunkle Bedingung mit unterschiedlicher Pupillenweite / Bright or dark condition with different pupil diameter
- `biological-condition`: Hoher oder geringer Kontrast sowie zusätzliche Aberration / High or low contrast and additional aberration

**Application cases**

- `green-light-pupil-estimate`
  - Task demand (DE): Für λ = 550 nm und D = 3,0 mm schätze die ideale Winkelauflösung des Auges, wandle sie in Bogenminuten um und vergleiche sie mit einem angegebenen Sehschärfewert samt Unsicherheit.
  - Task demand (EN): For λ = 550 nm and D = 3.0 mm, estimate the ideal angular resolution of the eye, convert it to arcminutes, and compare it with a supplied visual-acuity value and uncertainty.
  - Expected performance (DE): Die lernende Person rechnet Einheiten korrekt, erhält eine plausible Größenordnung, interpretiert θ als minimale Winkeltrennung und erklärt eine größere reale Schwelle mit möglichen biologischen oder optischen Zusatzgrenzen.
  - Expected performance (EN): The learner handles units correctly, obtains a plausible scale, interprets θ as a minimum angular separation, and explains a larger real threshold using possible biological or additional optical limitations.
  - Understanding focus (DE): Der Fall prüft Rechnung, Bedeutung und begrenzten Vergleich mit Messung.
  - Understanding focus (EN): The case assesses calculation, meaning, and a bounded comparison with measurement.
- `dim-red-light-prediction`
  - Task demand (DE): Bei schwachem rotem Licht wird die Pupille größer als bei hellem grünem Licht. Berechne aus gegebenen λ- und D-Werten beide idealen Grenzen, sage die Richtung der Änderung voraus und beurteile, ob die reale Sehschärfe zwingend gleich folgt.
  - Task demand (EN): In dim red light the pupil is larger than in bright green light. Calculate both ideal limits from supplied λ and D values, predict the direction of change, and assess whether real visual acuity must follow in the same way.
  - Expected performance (DE): Die lernende Person wägt größere Öffnung gegen längere Wellenlänge ab, stützt die ideale Vorhersage quantitativ und verweigert eine zwingende Aussage zur realen Sehschärfe ohne Kontrast-, Aberrations- und Netzhautdaten.
  - Expected performance (EN): The learner weighs the larger aperture against the longer wavelength, supports the ideal prediction quantitatively, and rejects a necessary claim about real acuity without contrast, aberration, and retinal data.
  - Understanding focus (DE): Der unabhängige Transfer prüft konkurrierende Parameter und die Modellgrenze.
  - Understanding focus (EN): The independent transfer assesses competing parameters and the model boundary.
## Page 4: Frequenzspektren von Tönen und Klängen analysieren

- Full learning-goal ID: `f06c581a-7157-584e-a692-99bcd613cff9`
- Goal fingerprint: `sha256:30568558572118ec6d55497a22a9e67c54e562741376def0677727ade3de8549`
- Page fingerprint: `sha256:46ba6a54bd3ce209933db0f0b6b027ca3a432c80f11d02166c8c1719c5a430ea`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann Zeitdiagramme und Frequenzspektren von Tönen und Klängen miteinander verknüpfen, Grund- und Obertöne identifizieren und den Einfluss der Spektralanteile auf die Klangfarbe erklären.

### Visualization

/assets/goal-visualizations/physik/f06c581a-7157-584e-a692-99bcd613cff9/f06c581a-7157-584e-a692-99bcd613cff9.png

- original digest: `sha256:527241187b6de1be8386bba6882298c1cfd4422ef97a23a587cbb315042b4efe`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Tonhöhe, Lautstärke und Geräusche unterscheiden — `10aad90e-a1db-42b6-8d1e-1d856e14b47d` (outside this book)

### Direct reverse prerequisites outside this book

- Richtungshören mit spektralen und binauralen Hinweisen untersuchen — `9678afc1-44ca-54fb-b280-29336d45a928` (outside this book)
- Innenohr mit Resonanzmodellen erklären — `bdaa56ad-6257-58a3-a633-8a6339f72f09` (outside this book)
- Prüfungsaufgabe: Zeitverlauf, Spektrum und Filterwirkung koordinieren — `c2a6ce42-ba20-55c4-b958-c9edb4b98c4c` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:003048d04286720ea3db4705541ab470fc0f43188f8b3e913fd5a4016f861d28`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `translate-time-and-frequency-representations`
  - Essential understanding (DE): Zeitverlauf und Frequenzspektrum codieren dasselbe Signal unterschiedlich. Bei periodischen Klängen bestimmt die Grundfrequenz die Periodendauer; harmonische und weitere Spektralanteile erscheinen mit ihren relativen Amplituden im Spektrum. Ein reines Amplitudenspektrum enthält keine Phaseninformation und legt deshalb im Allgemeinen keinen eindeutigen Zeitverlauf fest.
  - Essential understanding (EN): A time trace and frequency spectrum encode the same signal differently. For periodic complex sounds, fundamental frequency determines period, while harmonic and other spectral components appear with their relative amplitudes in the spectrum. An amplitude-only spectrum omits phase information and therefore generally does not determine a unique time trace.
  - Observable performance (DE): Die lernende Person konstruiert aus angegebenen Komponenten einen qualitativen Zeitverlauf oder ein Spektrum, ordnet zusammengehörige Darstellungen zu und erklärt Frequenz- und Amplitudenkonventionen. Eine eindeutige Konstruktion oder Paarzuordnung nutzt ausdrücklich gegebene Phasen beziehungsweise eine erklärte Konvention; ohne diese Angaben benennt die Person mehrere kompatible Verläufe und die verbleibende Grenze.
  - Observable performance (EN): The learner constructs a qualitative time trace or spectrum from supplied components, matches corresponding representations, and explains frequency and amplitude conventions. A unique construction or pairing uses explicitly supplied phases or a stated convention; without them the learner identifies compatible alternatives and the remaining limit.
- `separate-pitch-timbre-and-level`
  - Essential understanding (DE): Tonhöhe folgt vor allem der Grundfrequenz, Klangfarbe der spektralen Struktur und Pegel beziehungsweise Lautstärke der Gesamtsamplitude; diese Eigenschaften können unabhängig verändert werden, soweit das Modell trägt.
  - Essential understanding (EN): Pitch follows mainly from fundamental frequency, timbre from spectral structure, and level or loudness from overall amplitude; these properties can be changed independently within the model.
  - Observable performance (DE): Die lernende Person sagt bei veränderten Grund- oder Obertonanteilen voraus, welche Wahrnehmungsmerkmale sich ändern, und begründet die Aussage aus den Spektren statt aus Instrumentnamen.
  - Observable performance (EN): The learner predicts which perceptual features change when fundamental or overtone components change and justifies the claim from spectra rather than instrument names.

**Coverage expectations**

- required expectations: `translate-time-and-frequency-representations`, `separate-pitch-timbre-and-level`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `spectral-change`: Geänderte Grundfrequenz oder geänderte relative Obertonanteile / Changed fundamental frequency or changed relative overtone amplitudes
- `signal-form`: Nahezu sinusförmiger Ton oder komplexer periodischer Klang / Nearly sinusoidal tone or complex periodic sound
- `representation-given`: Zeitdiagramm, Spektrum oder Komponentenliste als Ausgangspunkt / Time graph, spectrum, or component list as the starting point

**Application cases**

- `match-waveforms-and-spectra`
  - Task demand (DE): Drei unbekannte periodische Zeitdiagramme und drei Spektren besitzen teils gleiche Grundfrequenz, aber verschiedene Obertonstärken. Ordne die Paare zu, bestimme Grund- und Obertöne und vergleiche Tonhöhe sowie Klangfarbe. Für die Paarzuordnung sind alle Spektren als phasenbeschriftete Komponentenlisten gegeben; die zugehörigen sinusförmigen Komponenten beginnen bei t=0 mit Phase0 bezogen auf dieselbe Zeitachse. Für die qualitative Konstruktion ist keine Fourierintegration nötig. Gegebene Verständnishilfe: Eine Phasenänderung umπ bedeutet hier die Vorzeichenumkehr nur dieser zeitlichen Obertonkomponente bei denselben Zeitpunkten; ihr Amplitudenbetrag bleibt gleich. Ein zusätzlicher gleiches-Amplitudenspektrum-Fall kehrt so nur einen Oberton um: vergleiche die möglichen Zeitformen und erkläre die nicht eindeutige Rekonstruktion aus Amplituden allein.
  - Task demand (EN): Three unfamiliar periodic time traces and three spectra have partly equal fundamentals but different overtone strengths. Match the pairs, identify fundamental and overtones, and compare pitch and timbre. For pairing, every spectrum includes component phases: all sinusoidal components have phase0 at t=0 on the same time axis. Qualitative construction requires no Fourier integration. Supplied interpretation aid: a phase shift ofπ means sign reversal of only that time-domain overtone at the same instants; its amplitude magnitude stays fixed. An additional same-amplitude-spectrum case reverses only that overtone: compare compatible time shapes and explain why amplitudes alone do not determine a unique reconstruction.
  - Expected performance (DE): Die lernende Person nutzt Periodendauer und Linienabstände, ordnet relative Amplituden konsistent zu und erklärt gleiche Tonhöhe bei unterschiedlicher Klangfarbe ohne die Gesamtamplitude mit einem Oberton zu verwechseln. Nutzt die gegebene gemeinsame Phase für die Paarung, erkennt unveränderte Amplituden bei geänderter relativer Phase und lässt ohne Phaseninformation mehrere Zeitformen zu. Aus einem Amplitudenspektrum allein wird keine exakte Wellenform behauptet.
  - Expected performance (EN): The learner uses period and line spacing, consistently assigns relative amplitudes, and explains equal pitch with different timbre without confusing overall amplitude with an overtone. Uses the supplied common phase for pairing, recognizes equal amplitudes with changed relative phase and admits multiple time shapes when phases are unknown. Does not claim an exact waveform from amplitudes alone.
  - Understanding focus (DE): Der Fall prüft die bidirektionale Übersetzung beider Darstellungen.
  - Understanding focus (EN): The case assesses bidirectional translation between the representations.
- `filter-harmonics-preserve-fundamental`
  - Task demand (DE): Ein Klang wird durch einen Tiefpass verändert, der höhere Obertöne stark dämpft, die Grundfrequenz aber erhält. Skizziere das neue Spektrum, sage den qualitativen Zeitverlauf voraus und begründe Änderungen von Tonhöhe, Pegel und Klangfarbe. In diesem idealisierten Vergleich lässt der Filter die Phasen der verbleibenden Komponenten unverändert; ausschließlich die angegebenen höheren Harmonischen werden amplitudengedämpft. Ohne diese Zusatzannahme ist die genaue neue Zeitform offen.
  - Task demand (EN): A complex sound is changed by a low-pass filter that strongly attenuates higher overtones but preserves the fundamental. Sketch the new spectrum, predict the qualitative time trace, and justify changes in pitch, level, and timbre. In this idealized comparison the filter leaves the phases of retained components unchanged and only attenuates the specified higher harmonics. Without that added assumption the exact output shape remains open.
  - Expected performance (DE): Die lernende Person behält die Grundfrequenz und Periodendauer bei, reduziert die entsprechenden Spektrallinien, erwartet einen glatteren Zeitverlauf und trennt eine mögliche Pegeländerung von der veränderten Klangfarbe. Begrenzt „glatter“ auf die vorgegebene Entfernung höherfrequenter Anteile; dies legt ohne Phasenangaben keine eindeutige Punkt-für-Punkt-Zeitkurve oder universelle Lautheitsänderung fest.
  - Expected performance (EN): The learner preserves the fundamental and period, reduces the corresponding spectral lines, expects a smoother time trace, and separates a possible level change from altered timbre. Limits “smoother” to the specified removal of high-frequency components; without phases this gives neither a unique pointwise time curve nor a universal loudness change.
  - Understanding focus (DE): Der unabhängige Transfer prüft kausale Vorhersage aus einer spektralen Manipulation.
  - Understanding focus (EN): The independent transfer assesses causal prediction from a spectral manipulation.
## Page 5: Schalldruckpegel und Hoerrisiken quantitativ beurteilen

- Full learning-goal ID: `8ac61062-f63e-5935-96ae-84014906c368`
- Goal fingerprint: `sha256:ee73065a5750909c923ca55ed46a8091c29eca8b7a9c7a7e463d73ed29024ff6`
- Page fingerprint: `sha256:378b0fd1f216a4d22014819cb25859680a5997d4de41e2249a9a062441928218`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann Zusammenhaenge zwischen messbaren Schallgroessen und empfundener Lautstaerke mathematisch nutzen und Gesundheitsgefaehrdungen durch hohe Schalldruckpegel begruendet beurteilen.

### Visualization

/assets/goal-visualizations/physik/8ac61062-f63e-5935-96ae-84014906c368/8ac61062-f63e-5935-96ae-84014906c368.jpg

- original digest: `sha256:24961ef692fa5c75bf5eaf4064dcc96aaebc358cc1239a77685d7cef82cd19f4`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Lärmbelastung des Gehörs beurteilen — `da0837c7-95a7-5a6a-81db-f33cb7f42d85` (outside this book)
- Logarithmus definieren und einfache Werte bestimmen — `3c1d6ce7-099e-4267-9ff2-3d1526209a89` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Schalldruck, bedingte Lautheit und Exposition unterscheiden — `3efcce48-2a2d-5d81-958c-aa216eccaea3` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:030674b8445430fecf80e7b6edabff9fa6ae977fe5274473e9020948910debd3`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `level-and-quantity`
  - Essential understanding (DE): Schalldruckpegel ist ein logarithmisches Maß des Effektivschalldrucks; unter gleichen Ausbreitungsbedingungen skaliert Intensität mit dessen Quadrat. Empfundene Lautstärke hängt zusätzlich etwa von Frequenz und Person ab. Ein quantitativer Lautheitsvergleich benötigt daher eine für die angegebenen Bedingungen bereitgestellte empirische Relation oder Abgleichdatentabelle.
  - Essential understanding (EN): Sound pressure level is a logarithmic measure of RMS sound pressure; under equal propagation conditions, intensity scales with its square. Perceived loudness also depends on factors such as frequency and the listener. A quantitative loudness comparison therefore requires an empirical relation or matching-data table supplied for the stated conditions.
  - Observable performance (DE): Die lernende Person nutzt eine gegebene Pegelrelation oder äquivalente Zuordnungstabelle für einen frischen Zahlenvergleich und berechnet zusätzlich aus einer bereitgestellten bedingten empirischen Lautheitsrelation oder Abgleichdatentabelle einen Lautheitsvergleich; sie trennt Druck-, Intensitäts- und Wahrnehmungsaussagen.
  - Observable performance (EN): The learner uses a supplied level relation or equivalent lookup table for a fresh numerical comparison and additionally calculates a loudness comparison from a supplied conditional empirical loudness relation or matching-data table, separating pressure, intensity, and perceptual claims.
- `exposure-judgment`
  - Essential understanding (DE): Gesundheitliche Gefährdung lässt sich nicht aus dem Pegel allein entscheiden; Expositionsdauer, Frequenzbewertung, Spitzen und Unsicherheit begrenzen quantitative Vergleiche.
  - Essential understanding (EN): Health hazard cannot be decided from level alone; exposure duration, frequency weighting, peaks and uncertainty limit quantitative comparisons.
  - Observable performance (DE): Die lernende Person vergleicht vorgegebene Expositionen unter expliziten Annahmen, begründet eine vorsorgliche Verringerung und nennt fehlende Daten, ohne Sicherheit oder einen individuellen Schaden zu bescheinigen.
  - Observable performance (EN): The learner compares supplied exposures under explicit assumptions, justifies a precautionary reduction and identifies missing data without certifying safety or individual harm.

**Coverage expectations**

- required expectations: `level-and-quantity`, `exposure-judgment`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `quantity-change`: Pegeländerung bei verändertem Schalldruck gegenüber gemeinsamer Pegel-Dauer-Änderung. / Level change with changed pressure versus combined level-duration change.
- `perception-context`: Vergleich gleicher Frequenzbedingungen gegenüber unbekannter Frequenzbewertung und Wahrnehmung. / Comparison under equal frequency conditions versus unknown frequency weighting and perception.

**Application cases**

- `pressure-ratio`
  - Task demand (DE): Gegebener Messbericht: derselbe reine1-kHz-Dauerton im Freifeld frontal,70 beziehungsweise90dB SPL, je±1dB; keine Durchführung mit lauten Tönen. Verwende ΔL=20log₁₀(p₂/p₁), bei gleichem Medium I∝p². Zusätzlich ist als begrenzte, empirisch motivierte konventionelle Lautheitsskala N/1sone=2^((L_N/1phon−40)/10) gegeben. Für den1-kHz-Bezugston entspricht L_N zahlenmäßig dem Schalldruckpegel. Quelle dieser historischen Modellrelation: Judith Lang, Umweltinformation Lärm: Technischer Teil, Umweltbundesamt Österreich, UBA94-097(1994),Abschnitt1.2,S.2, https://data.umweltbundesamt.at/fileadmin/site/publikationen/R097.pdf#page=8. Benutze die Beziehung nur oberhalb40phon für diesen Modellvergleich; sie ersetzt keine aktuelle umfassende Lautheitsnorm, individuelle Hörmessung oder Gesundheitsgrenze. Berechne Druck-, Intensitäts- und bedingtes Lautheitsverhältnis und beurteile „hundertmal so laut“. Begrenze Faktoren wegen der Messunsicherheit und der Modellannahmen.
  - Task demand (EN): Supplied report: the same pure1kHz continuous reference tone in a frontal free field at70 and90dB SPL, each±1dB; no loud listening experiment. Use ΔL=20log₁₀(p₂/p₁), with I∝p² in the same medium. Also supplied is the bounded empirically motivated conventional loudness scale N/1sone=2^((L_N/1phon−40)/10). For the1kHz reference tone, loudness level L_N is numerically equal to SPL. Source of this historical model relation: Judith Lang, Umweltinformation Lärm: Technischer Teil, Austrian Environment Agency, UBA94-097(1994),section1.2,p.2, https://data.umweltbundesamt.at/fileadmin/site/publikationen/R097.pdf#page=8. Apply it only above40phon in this model comparison; it replaces neither a current comprehensive loudness standard, an individual hearing test nor a health limit. Calculate pressure, intensity and conditional loudness ratios and assess “one hundred times as loud”. Bound the factors by measurement uncertainty and model assumptions.
  - Expected performance (DE): Nominal Druckfaktor10 und Intensitätsfaktor100; bedingtes Lautheitsmodell N70=8sone,N90=32sone, Verhältnis4. Die Werte8/32 sind aus der angegebenen Relation berechnete Modellwerte, keine neuen Versuchsdaten. Bei unabhängigen±1dB-Spannen liegt ΔL zwischen18und22dB: Druckfaktor ungefähr7,94…12,59, Intensitätsfaktor63,1…158,5, bedingtes Lautheitsverhältnis ungefähr3,48…4,59; gleichwertig begründete Unsicherheitsdarstellung zulässig.100 ist kein allgemeines Lautheitsverhältnis. Bei gleicher Dauer höhere physikalische Exposition und begründete vorsorgliche Verringerung, aber keine individuelle Schaden- oder Unbedenklichkeitsdiagnose.
  - Expected performance (EN): Nominal pressure ratio10 and intensity ratio100; the conditional loudness model gives N70=8sones,N90=32sones, ratio 4. The values 8 and 32 are calculated model values from the supplied relation, not new experimental observations. Independent±1dB intervals give ΔL18…22dB: pressure ratio about7.94…12.59,intensity63.1…158.5,conditional loudness ratio about3.48…4.59; accept an equivalent justified uncertainty treatment.100 is not a general loudness ratio. At equal duration exposure is physically greater and precautionary reduction is justified, but no individual harm or safety diagnosis follows.
  - Understanding focus (DE): Logarithmische Messgröße und empirisch bedingte subjektive Lautheit werden mathematisch verglichen und nicht quantitativ gleichgesetzt.
  - Understanding focus (EN): The logarithmic measured quantity and condition-dependent empirical loudness are compared mathematically rather than equated quantitatively.
- `duration-compensation`
  - Task demand (DE): Zwei hypothetische, gleichartig frequenzbewertete konstante Schallbelastungen dauern A: 80 dB für 2 h und B: 90 dB für 0,2 h. Gegeben: +10 dB bedeutet zehnfache Intensität; I·t ist hier nur ein vereinfachter Energieexpositionsvergleich. Vergleiche A und B und erkläre, welche Aussagen über Gesundheitsgefahr damit möglich bleiben.
  - Task demand (EN): Two hypothetical, consistently frequency-weighted constant exposures are A: 80 dB for 2 h and B: 90 dB for 0.2 h. Given: +10 dB means tenfold intensity; I·t is only a simplified energy-exposure comparison here. Compare A and B and explain what health-hazard claims remain possible.
  - Expected performance (DE): Zeigt im vorgegebenen Modell gleiche Energieexposition, da 10·0,2 h=2 h. Begründet, weshalb gleiche I·t-Werte weder identische Wirkung noch Unbedenklichkeit beweisen: Spitzen, tatsächliches Spektrum, Messfehler und individuelle Empfindlichkeit fehlen. Empfiehlt als begründetes Vorsorgeprinzip geringeren Pegel und kürzere Dauer; kein lautes Selbstexperiment.
  - Expected performance (EN): Shows equal energy exposure in the supplied model because 10·0.2 h=2 h. Explains why equal I·t values prove neither identical effect nor safety: peaks, actual spectrum, measurement error and individual sensitivity are missing. Justifies lower level and shorter duration as precautionary principles; no loud self-experiment.
  - Understanding focus (DE): Ein rechnerischer Expositionsvergleich ist ein begrenztes Modell, keine medizinische Freigabe.
  - Understanding focus (EN): A numerical exposure comparison is a limited model, not medical clearance.
## Page 6: Elektrische Dipolfelder mit dem EKG verknüpfen

- Full learning-goal ID: `e19fccd7-6a35-5c9e-86e1-dcca76481e9c`
- Goal fingerprint: `sha256:1d2c3a50258baaa8083a37088df83e35bbf2c2676c76eae5f4bc3a1431ed4267`
- Page fingerprint: `sha256:4d484e41563f65afb1e8d76ac3ae9f1dcf50b8df24667874f0cc091bc465ef9a`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann elektrische Potenziale und Äquipotentiallinien eines Dipolfeldes experimentell oder in einer Simulation untersuchen und erklären, wie ein zeitlich veränderliches Dipolmodell des Herzens mit den zwischen Oberflächenelektroden gemessenen EKG-Potenzialdifferenzen zusammenhängt und wo die Grenzen dieser Näherung liegen.

### Visualization

/assets/goal-visualizations/physik/e19fccd7-6a35-5c9e-86e1-dcca76481e9c/e19fccd7-6a35-5c9e-86e1-dcca76481e9c.png

- original digest: `sha256:2075a731fa733bc87ebbe6a1f962619eeaa93b2d094de4b3673020027da86698`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Elektrisches Potenzial berechnen — `2622bef1-bdbc-504e-b468-b600b2ca3ed8` (outside this book)
- Superposition elektrischer Felder — `4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:464df09d69df345374bda1f0fcfc9ad030908a3f2153340f743484ad6ff48a36`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `independent-review-a-understanding`
  - Essential understanding (DE): Ein elektrischer Dipol erzeugt eine räumliche Potenzialverteilung, deren Äquipotentiallinien von Dipolrichtung, Abstand und Geometrie abhängen. Im zeitabhängigen Herz-Dipolmodell erfassen zwei Oberflächenelektroden nur die Potenzialdifferenz ihrer Orte; das Signal hängt daher von Dipolentwicklung und Ableitungsrichtung ab, während Körpergeometrie, Leitfähigkeit und räumlich verteilte Quellen die Ein-Dipol-Näherung begrenzen.
  - Essential understanding (EN): An electric dipole produces a spatial potential distribution whose equipotential lines depend on dipole direction, distance, and geometry. In the time-dependent heart-dipole model, two surface electrodes capture only the potential difference between their locations; the signal therefore depends on dipole evolution and lead direction, while body geometry, conductivity, and spatially distributed sources limit the single-dipole approximation.
  - Observable performance (DE): Die lernende Person erhebt in einem sicheren Modellversuch oder einer Simulation Potenziale, konstruiert daraus Äquipotentiallinien, sagt für ein gegebenes Elektrodenpaar Vorzeichen und qualitative Größe der gemessenen Differenz voraus und trennt Messwert, rekonstruierte Potenzialkarte und Herz-Dipolmodell einschließlich konkreter Grenzen.
  - Observable performance (EN): In a safe model experiment or simulation, the learner obtains potentials, constructs equipotential lines from them, predicts the sign and qualitative magnitude of the measured difference for a given electrode pair, and distinguishes the measured value, the reconstructed potential map, and the heart-dipole model, including concrete limitations.
- `independent-review-b-understanding`
  - Essential understanding (DE): Ein zeitlich veränderliches elektrisches Dipolmodell des Herzens erzeugt in einem leitfähigen Körpermodell eine räumliche Potenzialverteilung. Ein EKG misst nicht den Dipol direkt, sondern zeitabhängige Potenzialdifferenzen zwischen Oberflächenelektroden, die von Dipolrichtung, -stärke, Elektrodenposition und den Vereinfachungen des Körpermodells abhängen.
  - Essential understanding (EN): A time-varying electric dipole model of the heart produces a spatial potential distribution in a conducting body model. An ECG does not measure the dipole directly; it measures time-dependent potential differences between surface electrodes that depend on dipole direction and magnitude, electrode position, and the simplifications of the body model.
  - Observable performance (DE): Die lernende Person untersucht in einem sicheren Experiment oder einer Simulation Potenzialwerte und Äquipotentiallinien eines Dipolfeldes, sagt für vorgegebene Elektroden die gemessene Potenzialdifferenz voraus und erklärt eine EKG-Spur als modellvermittelte Messung einschließlich konkreter Grenzen der Dipol- und Leiterannahmen.
  - Observable performance (EN): In a safe experiment or simulation, the learner investigates potential values and equipotential lines of a dipole field, predicts the measured potential difference for specified electrodes, and explains an ECG trace as a model-mediated measurement, including specific limits of the dipole and conductor assumptions.

**Coverage expectations**

- required expectations: `independent-review-a-understanding`, `independent-review-b-understanding`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-physical-condition`: Mindestens eine relevante Größe, Geometrie, Rand- oder Anfangsbedingung wird gegenüber dem Ausgangsfall verändert. / At least one relevant quantity, geometry, boundary condition, or initial condition is changed from the original case.
- `changed-evidence-representation`: Die fachliche Information liegt in einer anderen geeigneten Darstellung vor, etwa als Diagramm, Datensatz, Skizze, Formel, Simulation oder belegte Quelle. / The scientific information is supplied in another suitable representation, such as a diagram, data set, sketch, formula, simulation, or evidenced source.
- `model-validity-boundary`: Ein Fall erfüllt die idealisierenden Annahmen, der andere enthält eine benannte Nichtidealität oder Informationsgrenze. / One case satisfies the idealizing assumptions, while the other contains a stated non-ideality or information limit.

**Application cases**

- `fresh-independent-case-a`
  - Task demand (DE): Werden in einem neuen Fall Elektroden vertauscht oder versetzt beziehungsweise die Dipolrichtung gedreht, sagt die lernende Person die Änderung von Vorzeichen und Amplitude der EKG-Potenzialdifferenz voraus und begründet, welche Abweichungen das vereinfachte Modell nicht erklären kann.
  - Task demand (EN): When a new case reverses or relocates the electrodes or rotates the dipole direction, the learner predicts the change in sign and amplitude of the ECG potential difference and explains which deviations the simplified model cannot account for.
  - Expected performance (DE): Die lernende Person erhebt in einem sicheren Modellversuch oder einer Simulation Potenziale, konstruiert daraus Äquipotentiallinien, sagt für ein gegebenes Elektrodenpaar Vorzeichen und qualitative Größe der gemessenen Differenz voraus und trennt Messwert, rekonstruierte Potenzialkarte und Herz-Dipolmodell einschließlich konkreter Grenzen.
  - Expected performance (EN): In a safe model experiment or simulation, the learner obtains potentials, constructs equipotential lines from them, predicts the sign and qualitative magnitude of the measured difference for a given electrode pair, and distinguishes the measured value, the reconstructed potential map, and the heart-dipole model, including concrete limitations.
  - Understanding focus (DE): Ein elektrischer Dipol erzeugt eine räumliche Potenzialverteilung, deren Äquipotentiallinien von Dipolrichtung, Abstand und Geometrie abhängen. Im zeitabhängigen Herz-Dipolmodell erfassen zwei Oberflächenelektroden nur die Potenzialdifferenz ihrer Orte; das Signal hängt daher von Dipolentwicklung und Ableitungsrichtung ab, während Körpergeometrie, Leitfähigkeit und räumlich verteilte Quellen die Ein-Dipol-Näherung begrenzen.
  - Understanding focus (EN): An electric dipole produces a spatial potential distribution whose equipotential lines depend on dipole direction, distance, and geometry. In the time-dependent heart-dipole model, two surface electrodes capture only the potential difference between their locations; the signal therefore depends on dipole evolution and lead direction, while body geometry, conductivity, and spatially distributed sources limit the single-dipole approximation.
- `fresh-independent-case-b`
  - Task demand (DE): Bei vertauschten oder versetzten Elektroden, gedrehter Dipolrichtung oder einem nicht homogenen Leitermodell sagt die lernende Person für einen neuen Fall Vorzeichen und qualitative Signaländerung voraus und erläutert, welche Abweichung auf Messgeometrie und welche auf eine Modellgrenze zurückgeht.
  - Task demand (EN): For a new case with swapped or repositioned electrodes, a rotated dipole direction, or a nonuniform conductor model, the learner predicts the sign and qualitative signal change and explains which difference arises from measurement geometry and which from a model limit.
  - Expected performance (DE): Die lernende Person untersucht in einem sicheren Experiment oder einer Simulation Potenzialwerte und Äquipotentiallinien eines Dipolfeldes, sagt für vorgegebene Elektroden die gemessene Potenzialdifferenz voraus und erklärt eine EKG-Spur als modellvermittelte Messung einschließlich konkreter Grenzen der Dipol- und Leiterannahmen.
  - Expected performance (EN): In a safe experiment or simulation, the learner investigates potential values and equipotential lines of a dipole field, predicts the measured potential difference for specified electrodes, and explains an ECG trace as a model-mediated measurement, including specific limits of the dipole and conductor assumptions.
  - Understanding focus (DE): Ein zeitlich veränderliches elektrisches Dipolmodell des Herzens erzeugt in einem leitfähigen Körpermodell eine räumliche Potenzialverteilung. Ein EKG misst nicht den Dipol direkt, sondern zeitabhängige Potenzialdifferenzen zwischen Oberflächenelektroden, die von Dipolrichtung, -stärke, Elektrodenposition und den Vereinfachungen des Körpermodells abhängen.
  - Understanding focus (EN): A time-varying electric dipole model of the heart produces a spatial potential distribution in a conducting body model. An ECG does not measure the dipole directly; it measures time-dependent potential differences between surface electrodes that depend on dipole direction and magnitude, electrode position, and the simplifications of the body model.
## Page 7: Zyklotron und Strahlentherapie fachlich bewerten

- Full learning-goal ID: `d1306bda-35ff-53e9-9458-3cbc128874d8`
- Goal fingerprint: `sha256:94a9992901d1558f7945f929598ad8abfc1a0591d90ee8d8592418ea01c55061`
- Page fingerprint: `sha256:242fcf2a9681e1b8e80ec4e27aed62c00a3aa139eee2ec6641adaa039ad180da`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann das Funktionsprinzip des Zyklotrons auf Strahlentherapien beziehen und Nutzen sowie Risiken medizinischer Anwendungen mit physikalischen Kriterien bewerten.

### Visualization

/assets/goal-visualizations/physik/d1306bda-35ff-53e9-9458-3cbc128874d8/d1306bda-35ff-53e9-9458-3cbc128874d8.png

- original digest: `sha256:f03615d78be07949733673960b4ee47e87fef05ab874a488d487aaaed0652e9e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Geladene Teilchen in homogenen elektrischen Feldern untersuchen — `741774ef-15fc-4bcf-a370-e2c5cf4257d0` (outside this book)
- Geladene Teilchen in homogenen magnetischen Feldern untersuchen — `9854589c-5feb-4942-b90f-311ddf36eb78` (outside this book)
- Strahlungsrisiken mit physikalischen Größen beurteilen — `bb5c5eab-2fc1-5336-b8cf-14d147695487` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:9bd2867a7659d926fa9d532e11a9a2ea2089700b0a767a84d08cea1cfeef314b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `accelerator-to-dose`
  - Essential understanding (DE): Im Cyclotron-Modell beschleunigt das elektrische Feld geladene Teilchen, das magnetische Feld lenkt sie ab. Bei Protonentherapie beeinflusst die Strahlenergie die Reichweite und damit die räumliche Energieabgabe.
  - Essential understanding (EN): In the cyclotron model the electric field accelerates charged particles and the magnetic field deflects them. In proton therapy beam energy affects range and hence spatial energy deposition.
  - Observable performance (DE): Erklärt die Funktionskette von Beschleunigung zu Dosisverteilung und legt für einen bereitgestellten Vergleich Modellannahmen und Systemgrenze offen.
  - Observable performance (EN): Explains the functional chain from acceleration to dose distribution and states model assumptions and system boundary for a supplied comparison.
- `bounded-evaluation`
  - Essential understanding (DE): Zielabdeckung, Schonung gesunden Gewebes und Empfindlichkeit gegenüber Lage-/Reichweitenunsicherheit sind physikalische Bewertungskriterien; ihr Abwägen ist von gesicherten Daten und klinischen Erfolgsaussagen zu trennen.
  - Essential understanding (EN): Target coverage, sparing healthy tissue and sensitivity to position/range uncertainty are physical evaluation criteria; their weighting must be separated from established data and clinical outcome claims.
  - Observable performance (DE): Vergleicht Daten anhand benannter Kriterien, begründet Nutzen und verbleibende Risiken und formuliert ein bedingtes Urteil mit konkreter Unsicherheitsgrenze.
  - Observable performance (EN): Compares data using named criteria, justifies benefits and remaining risks and formulates a conditional judgment with a specific uncertainty limit.

**Coverage expectations**

- required expectations: `accelerator-to-dose`, `bounded-evaluation`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `dose-and-uncertainty`: Idealisierte Tiefendosis bei gleicher Zielabdeckung gegenüber veränderter Lage beziehungsweise Reichweite. / Idealized depth dose at equal target coverage versus altered position or range.

**Application cases**

- `depth-dose-comparison`
  - Task demand (DE): Nur Modellwerte relativer Dosis, keine Patientendaten: Verfahren A hat Ziel/gesund davor/gesund dahinter =1,00/0,30/0,20; cyclotronbasierte Protonenoption B =1,00/0,10/0,02. Vergleiche unter gleicher Zielabdeckung und erkläre den Bezug zur Teilchenbeschleunigung.
  - Task demand (EN): Model relative-dose values only, not patient data: method A has target/healthy before/healthy beyond =1.00/0.30/0.20; cyclotron-based proton option B =1.00/0.10/0.02. Compare at equal target coverage and explain the link to particle acceleration.
  - Expected performance (DE): Ordnet Energiegewinn dem elektrischen und Ablenkung dem magnetischen Feld zu; verknüpft Protonenenergie mit Reichweite. Begründet anhand der Zahlen geringere Dosis in den betrachteten gesunden Bereichen für B, nicht Risikofreiheit oder klinische Überlegenheit insgesamt.
  - Expected performance (EN): Assigns energy gain to the electric field and deflection to the magnetic field; connects proton energy with range. Uses the numbers to justify lower dose in the considered healthy regions for B, not absence of risk or overall clinical superiority.
  - Understanding focus (DE): Technisches Wirkprinzip und transparent begrenzter Kriterienvergleich.
  - Understanding focus (EN): Technical operating principle and a transparently bounded comparison of criteria.
- `range-robustness`
  - Task demand (DE): In einem synthetischen Tiefenmodell endet der nominale Protonenbereich 2 mm vor einem empfindlichen gesunden Bereich; die Lage-/Reichweitenabweichung beträgt ±3 mm. Prüfe die Behauptung, der nominale Kurvenverlauf garantiere vollständige Schonung.
  - Task demand (EN): In a synthetic depth model the nominal proton range ends 2 mm before a sensitive healthy region; position/range deviation is ±3 mm. Assess the claim that the nominal curve guarantees complete sparing.
  - Expected performance (DE): Zeigt, dass eine Verschiebung um +3 mm die nominale 2-mm-Lücke um 1 mm überschreiten kann. Verknüpft Energie/Reichweite und Lageunsicherheit mit möglicher Fehlplatzierung der Energieabgabe; verlangt für ein belastbares Urteil Robustheitsdaten, ohne eine Behandlung zu empfehlen.
  - Expected performance (EN): Shows that a +3 mm shift can exceed the nominal 2 mm gap by 1 mm. Connects energy/range and position uncertainty with possible misplacement of energy deposition; requires robustness data for a defensible judgment without recommending treatment.
  - Understanding focus (DE): Ein günstiger Idealverlauf genügt bei relevanter Unsicherheit nicht für ein Sicherheitsversprechen.
  - Understanding focus (EN): A favorable ideal curve does not justify a safety guarantee when uncertainty matters.
## Page 8: Ruhepotenzial an einer selektiv permeablen Membran modellieren

- Full learning-goal ID: `db47ac91-7bb0-5ba3-b39d-e2d6fc98396e`
- Goal fingerprint: `sha256:3dca221124a48d4dbf18935e94d6daa9bd697540ed2bfad0da8da60d1c0a062d`
- Page fingerprint: `sha256:bc7b5ecd13b6622f82b31887c7937d4d245c9a420055baa618d733faf5091949`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann das Ruhepotenzial in einem vereinfachten passiven Membranmodell als Ergebnis des Zusammenspiels von konzentrationsgetriebener Diffusion, elektrischer Gegenwirkung und selektiver Membranpermeabilität modellieren und erläutern, dass aktive Transportprozesse die Konzentrationsgradienten langfristig aufrechterhalten, aber nicht Bestandteil dieses passiven Modells sind.

### Visualization

/assets/goal-visualizations/physik/db47ac91-7bb0-5ba3-b39d-e2d6fc98396e/db47ac91-7bb0-5ba3-b39d-e2d6fc98396e.png

- original digest: `sha256:fff29381bcdc8dfb9fe3c44258828f31e9d851adb259b532d3cde490e3e3fcee`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Diffusion und Brownsche Bewegung mit dem Teilchenmodell deuten — `5dd180f1-f1c8-5f76-9c9a-ea3fc3d921bf` (outside this book)
- Arbeit, Spannung und Potenzial im E-Feld — `1730c01d-8c85-57df-b031-c11e2a0511b1` (outside this book)

### Direct reverse prerequisites outside this book

- Saltatorische Signalleitung aus aktiver Regeneration und Membraneigenschaften erklären — `8fbae050-c5c9-52b6-9983-2c366e9c8ade` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:8aa200ddaf012468b1af47decf9a940f36c9847074244be43be7916af30eea40`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `independent-review-a-understanding`
  - Essential understanding (DE): Im vereinfachten passiven Membranmodell treibt ein Konzentrationsunterschied die Diffusion permeabler Ionen, während die entstehende Ladungstrennung eine elektrische Gegenwirkung aufbaut. Selektive Permeabilität bestimmt, welche Ionen beitragen; das Ruhepotenzial ist ein dynamischer Gleichgewichtszustand des Modells, während aktive Transporte nur die vorausgesetzten Gradienten langfristig erhalten.
  - Essential understanding (EN): In the simplified passive membrane model, a concentration difference drives diffusion of permeant ions while the resulting charge separation builds an opposing electrical effect. Selective permeability determines which ions contribute; the resting potential is a dynamic equilibrium state of the model, whereas active transport only maintains the assumed gradients over longer times.
  - Observable performance (DE): Die lernende Person erstellt oder deutet ein gegebenes passives Membranmodell, sagt Richtung von Diffusion und elektrischer Gegenwirkung voraus, erklärt Vorzeichen und Annäherung des Membranpotenzials und trennt die im Modell enthaltenen passiven Vorgänge ausdrücklich von der langfristigen Wirkung aktiver Transporte.
  - Observable performance (EN): The learner constructs or interprets a given passive membrane model, predicts the directions of diffusion and electrical opposition, explains the sign and approach of the membrane potential, and explicitly separates the passive processes represented in the model from the long-term action of active transport.
- `independent-review-b-understanding`
  - Essential understanding (DE): Im vereinfachten passiven Membranmodell treiben Konzentrationsunterschiede Ionen zur Diffusion, während die dadurch entstehende Ladungstrennung eine elektrische Gegenwirkung erzeugt. Selektive Permeabilität bestimmt, welche Ionen beitragen; aktive Transporte erhalten die Gradienten langfristig, gehören aber nicht zur passiven Gleichgewichtsbildung des Modells.
  - Essential understanding (EN): In the simplified passive membrane model, concentration differences drive ion diffusion while the resulting charge separation creates an opposing electric effect. Selective permeability determines which ions contribute; active transport maintains the gradients over time but is not part of the model's passive equilibration.
  - Observable performance (DE): Die lernende Person erstellt oder erläutert für vorgegebene Konzentrationen und Permeabilitäten ein passives Membranmodell, sagt Vorzeichen und Entwicklung des Membranpotenzials voraus, begründet das Gleichgewicht der chemischen und elektrischen Triebkräfte und trennt diese Erklärung von der Rolle aktiver Pumpen.
  - Observable performance (EN): For given concentrations and permeabilities, the learner constructs or explains a passive membrane model, predicts the sign and development of the membrane potential, justifies the balance of chemical and electrical driving forces, and separates this explanation from the role of active pumps.

**Coverage expectations**

- required expectations: `independent-review-a-understanding`, `independent-review-b-understanding`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-physical-condition`: Mindestens eine relevante Größe, Geometrie, Rand- oder Anfangsbedingung wird gegenüber dem Ausgangsfall verändert. / At least one relevant quantity, geometry, boundary condition, or initial condition is changed from the original case.
- `changed-evidence-representation`: Die fachliche Information liegt in einer anderen geeigneten Darstellung vor, etwa als Diagramm, Datensatz, Skizze, Formel, Simulation oder belegte Quelle. / The scientific information is supplied in another suitable representation, such as a diagram, data set, sketch, formula, simulation, or evidenced source.
- `model-validity-boundary`: Ein Fall erfüllt die idealisierenden Annahmen, der andere enthält eine benannte Nichtidealität oder Informationsgrenze. / One case satisfies the idealizing assumptions, while the other contains a stated non-ideality or information limit.

**Application cases**

- `fresh-independent-case-a`
  - Task demand (DE): Bei umgekehrtem Konzentrationsgradienten oder veränderter selektiver Permeabilität sagt die lernende Person in einem neuen Fall Richtung und qualitative Größe des resultierenden Potenzials voraus und erläutert, wie die Aussage ohne langfristige Aufrechterhaltung der Gradienten begrenzt ist.
  - Task demand (EN): When the concentration gradient is reversed or selective permeability is changed in a new case, the learner predicts the direction and qualitative magnitude of the resulting potential and explains how the claim is limited when the gradients are not maintained over the long term.
  - Expected performance (DE): Die lernende Person erstellt oder deutet ein gegebenes passives Membranmodell, sagt Richtung von Diffusion und elektrischer Gegenwirkung voraus, erklärt Vorzeichen und Annäherung des Membranpotenzials und trennt die im Modell enthaltenen passiven Vorgänge ausdrücklich von der langfristigen Wirkung aktiver Transporte.
  - Expected performance (EN): The learner constructs or interprets a given passive membrane model, predicts the directions of diffusion and electrical opposition, explains the sign and approach of the membrane potential, and explicitly separates the passive processes represented in the model from the long-term action of active transport.
  - Understanding focus (DE): Im vereinfachten passiven Membranmodell treibt ein Konzentrationsunterschied die Diffusion permeabler Ionen, während die entstehende Ladungstrennung eine elektrische Gegenwirkung aufbaut. Selektive Permeabilität bestimmt, welche Ionen beitragen; das Ruhepotenzial ist ein dynamischer Gleichgewichtszustand des Modells, während aktive Transporte nur die vorausgesetzten Gradienten langfristig erhalten.
  - Understanding focus (EN): In the simplified passive membrane model, a concentration difference drives diffusion of permeant ions while the resulting charge separation builds an opposing electrical effect. Selective permeability determines which ions contribute; the resting potential is a dynamic equilibrium state of the model, whereas active transport only maintains the assumed gradients over longer times.
- `fresh-independent-case-b`
  - Task demand (DE): Bei vertauschtem Konzentrationsgradienten, geänderter Ionenpermeabilität oder blockiertem aktivem Transport sagt die lernende Person in einer neuen Modellsituation voraus, was das passive Modell kurzfristig liefert und was es für die langfristige Aufrechterhaltung nicht erklären kann.
  - Task demand (EN): When the concentration gradient is reversed, ion permeability is changed, or active transport is blocked, the learner predicts in a new model situation what the passive model yields in the short term and what it cannot explain about long-term maintenance.
  - Expected performance (DE): Die lernende Person erstellt oder erläutert für vorgegebene Konzentrationen und Permeabilitäten ein passives Membranmodell, sagt Vorzeichen und Entwicklung des Membranpotenzials voraus, begründet das Gleichgewicht der chemischen und elektrischen Triebkräfte und trennt diese Erklärung von der Rolle aktiver Pumpen.
  - Expected performance (EN): For given concentrations and permeabilities, the learner constructs or explains a passive membrane model, predicts the sign and development of the membrane potential, justifies the balance of chemical and electrical driving forces, and separates this explanation from the role of active pumps.
  - Understanding focus (DE): Im vereinfachten passiven Membranmodell treiben Konzentrationsunterschiede Ionen zur Diffusion, während die dadurch entstehende Ladungstrennung eine elektrische Gegenwirkung erzeugt. Selektive Permeabilität bestimmt, welche Ionen beitragen; aktive Transporte erhalten die Gradienten langfristig, gehören aber nicht zur passiven Gleichgewichtsbildung des Modells.
  - Understanding focus (EN): In the simplified passive membrane model, concentration differences drive ion diffusion while the resulting charge separation creates an opposing electric effect. Selective permeability determines which ions contribute; active transport maintains the gradients over time but is not part of the model's passive equilibration.
## Page 9: Nervenleitungs-Messverfahren physikalisch beurteilen

- Full learning-goal ID: `2825b528-00ee-52d0-870e-686890cb1195`
- Goal fingerprint: `sha256:2ef62e5f9cc8d69cf635e385746768f1935de1d4259f2724ba4cb1c53864d0f8`
- Page fingerprint: `sha256:b3e8f75df66d6cd9bdc8dc59bd9a7e51016f4e4f856029a2e4e09dda4b9cf6f4`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann die Eignung eines vorgegebenen Verfahrens zur Messung der Signalleitungsgeschwindigkeit in Nervenzellen begründen, indem sie die für dieses Verfahren relevanten elektrischen oder magnetischen Felder abschätzt und gegebenenfalls auftretende Induktionsspannungen aus der zeitlichen Änderung des magnetischen Flusses erklärt.

### Visualization

/assets/goal-visualizations/physik/2825b528-00ee-52d0-870e-686890cb1195/2825b528-00ee-52d0-870e-686890cb1195.jpg

- original digest: `sha256:67381efe80f8cfd2fe759cbd5664f9512c8a50156343066762609645886d530f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Experimente planen und Messdaten auswerten — `d3c153b9-e09b-5668-8386-73105546a7c1` (outside this book)
- Magnetfeldmodelle für geraden Leiter und lange Spule auswählen und anwenden — `106417ed-80db-5490-a1ee-bb4160d3f2b4` (outside this book)
- Induktionsgesetz und Lenz’sche Regel — `eb1ea150-ec6c-5000-bce3-f46c820dccf8` (outside this book)
- Arbeit, Spannung und Potenzial im E-Feld — `1730c01d-8c85-57df-b031-c11e2a0511b1` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:825b36fa1d42bd7850e47e04b7ac8c2a84164bc06435a353fc071e5ef25dc0ee`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `method-bound-field-judgement`
  - Essential understanding (DE): Eine Leitungsgeschwindigkeitsmessung benötigt zur Ausbreitung passende Weg- und Zeitdifferenzen. Feldstärke und Feldverlauf sind im angegebenen Anregungs- oder Messmodell zu verstehen; eine gemeinsame Auslöse- oder Geräteverzögerung ist von der Ausbreitungszeit zu unterscheiden. Die Eignung folgt aus dem Zusammenhang dieser Angaben, nicht aus einer isolierten Feldzahl.
  - Essential understanding (EN): Measuring conduction speed requires distance and time differences that correspond to propagation. Field strength and time course must be understood within the specified stimulation or measurement model; common trigger or instrument delays must be distinguished from propagation time. Suitability follows from the relationship among these data, not from an isolated field value.
  - Observable performance (DE): Die lernende Person erklärt an einem vorgegebenen Aufbau, welche Signale und Felder welche Funktion haben, schätzt das relevante E- oder B-Feld anhand geeigneter Modelldaten und begründet mit Weg-/Zeitzuordnung sowie zeitlicher Trennbarkeit der Signale ein begrenztes Urteil über das Verfahren.
  - Observable performance (EN): For a supplied setup, the learner explains the roles of signals and fields, estimates the relevant electric or magnetic field from suitable model data, and uses distance/time correspondence and temporal separation of signals to justify a bounded judgement about the method.
- `induction-role-and-validity`
  - Essential understanding (DE): Eine zeitliche Flussänderung kann im bezeichneten Stromkreis oder Messpfad eine Induktionsspannung hervorrufen. Je nach Verfahren kann Induktion zur Anregung beitragen oder eine Messstörung erzeugen; ein vorhandenes konstantes Magnetfeld allein erzeugt keine solche Spannung. Eine Kalibrierschleifenspannung ist ohne zusätzliches Gewebemodell keine Membranspannung.
  - Essential understanding (EN): A time-varying magnetic flux can generate an induced voltage in the identified circuit or measurement path. Depending on the method, induction can contribute to stimulation or generate interference; a present but constant magnetic field alone does not generate such a voltage. Without an additional tissue model, a calibration-loop voltage is not a membrane voltage.
  - Observable performance (DE): Im selben Verfahrensfall erklärt die lernende Person, ob und wo eine relevante Flussänderung vorliegt und welche Aussage die daraus gegebene Induktionsspannung trägt. In einer veränderten Mess- oder Feldsituation trennt sie Nutzsignal, Anregung und Störung und begründet, ob die Angaben ein belastbares Urteil erlauben oder welche Information fehlt. Eine zusätzliche quantitative Induktionsrechnung wird nicht vorausgesetzt.
  - Observable performance (EN): Within the same method case, the learner explains whether and where a relevant flux change occurs and what can be inferred from the resulting supplied induced voltage. In a changed measurement or field situation, they distinguish the useful signal, stimulation, and interference and justify whether the information supports a reliable judgement or what information is missing. An additional quantitative induction calculation is not required.

**Coverage expectations**

- required expectations: `method-bound-field-judgement`, `induction-role-and-validity`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `delay-and-common-interference`: Gemeinsame Geräteverzögerung oder zeitgleicher induktiver Störausschlag statt einer tatsächlich zwischen den Ableitstellen fortlaufenden Signaländerung. / Common instrument delay or simultaneous inductive interference instead of a signal change actually propagating between the recording sites.
- `field-time-course-and-path`: Gleicher maximaler magnetischer Fluss mit verändertem Anstieg und anschließendem Plateau; Kalibrierpfad und neuronaler Messpfad bleiben unterschieden. / The same maximum magnetic flux with a changed rise time and subsequent plateau; calibration and neural measurement paths remain distinct.

**Application cases**

- `electric-stimulus-common-delay`
  - Task demand (DE): Arbeite ausschließlich mit vorgegebenen Modelldaten: Ein elektrischer Impuls von 24 mV liegt im homogenen Modell über 2 mm von 0 bis 0,3 ms an. Zwei Ableitstellen im Abstand 0,18 m zeigen korrespondierende Signalmerkmale bei 4 und 7 ms; beide Kanäle haben dieselbe unbekannte Zusatzverzögerung. Der Fluss durch die Messleitungen ist zunächst konstant. Beurteile das Verfahren; in einem frischen Zusatzdatensatz erzeugt ein äußerer Magnetimpuls einen zeitgleichen frühen Ausschlag beider Kanäle, während das verspätete Signalpaar erhalten bleibt.
  - Task demand (EN): Use supplied model data only: an electrical pulse of 24 mV acts across 2 mm in a homogeneous model from 0 to 0.3 ms. Two recording sites 0.18 m apart show corresponding signal features at 4 and 7 ms; both channels have the same unknown additional delay. Flux through the measurement leads is initially constant. Assess the method; in a fresh additional dataset, an external magnetic pulse produces an early simultaneous deflection in both channels while the delayed signal pair remains.
  - Expected performance (DE): Die lernende Person schätzt 12 V/m, erläutert den begrenzten Impulsverlauf und begründet die Geschwindigkeit von 60 m/s aus der Zeitdifferenz statt aus einer absoluten Auslösezeit. Sie erklärt, weshalb konstanter Fluss keine Induktionsspannung erfordert, und ordnet im Zusatzfall anhand der gegebenen Leitungsschleifen und Zeitspuren den frühen gemeinsamen Ausschlag der induktiven Störung zu. Ihr Urteil stützt sich auf die Trennung dieses Ausschlags vom um 3 ms versetzten Signalpaar; fehlende Trennbarkeit würde eine sichere Geschwindigkeitsbestimmung verhindern.
  - Expected performance (EN): The learner estimates 12 V/m, explains the finite pulse duration, and justifies a speed of 60 m/s from the time difference rather than an absolute trigger time. They explain why constant flux does not require an induced voltage and, in the additional case, use the supplied lead-loop geometry and traces to identify the early common deflection as inductive interference. Their judgement rests on separating that deflection from the signal pair delayed by 3 ms; lack of separability would prevent a reliable speed determination.
  - Understanding focus (DE): Feldmodell, Zeitdifferenz und induktive Störung tragen dasselbe Verfahrensurteil. Keine Messung oder Stimulation an Personen; Modelldaten sind keine medizinischen Geräteeinstellungen.
  - Understanding focus (EN): The field model, time difference, and inductive interference support the same method judgement. No measurement or stimulation is performed on people; model data are not medical device settings.
- `magnetic-ramp-calibration`
  - Task demand (DE): Ein vorgegebener magnetischer Anregungsaufbau besitzt eine separate Kalibrierschleife von 4 cm² senkrecht zum homogenen Feld. Ihr Fluss steigt um 2 µWb in 0,5 ms und bleibt danach konstant. Die zugehörige mittlere Kalibrierspannung von 4 mV sowie zwei zeitversetzte neuronale Antwortspuren sind gegeben. Beurteile die Feld- und Signalangaben. Im neuen Datensatz erreicht derselbe Aufbau denselben Maximalfluss erst nach 2 ms; die gegebene mittlere Kalibrierspannung beträgt 1 mV. Vergleiche die bereitgestellten Antwort-/Störspuren und prüfe die Behauptung, gleicher maximaler B-Wert sichere gleich gute Messbedingungen.
  - Task demand (EN): A supplied magnetic stimulation setup has a separate calibration loop of 4 cm² perpendicular to the homogeneous field. Its flux increases by 2 µWb in 0.5 ms and then remains constant. The associated mean calibration voltage of 4 mV and two delayed neural response traces are supplied. Assess the field and signal information. In a fresh dataset, the same setup reaches the same maximum flux only after 2 ms; the supplied mean calibration voltage is 1 mV. Compare the provided response/interference traces and assess the claim that equal maximum magnetic field ensures equally good measurement conditions.
  - Expected performance (DE): Die lernende Person erschließt mit dem gegebenen Fluss-/Flächenmodell eine Feldänderung von 5 mT, beschreibt die verschiedenen Zeitverläufe und erklärt die kleinere gegebene Induktionsspannung bei langsamerem Anstieg sowie ihr Ausbleiben im Plateau. Sie begründet das Messurteil aus den Antwort-/Störspuren, statt allein aus dem Maximalfeld gleiche Anregung oder Zuverlässigkeit zu folgern. Kalibrierspannung und Membranspannung setzt sie nicht gleich; fehlen geeignete Antwortdaten, benennt sie diese Erkenntnisgrenze.
  - Expected performance (EN): Using the supplied flux/area model, the learner infers a field change of 5 mT, describes the different time courses, and explains the smaller supplied induced voltage during a slower rise and its absence on the plateau. They justify the measurement judgement from response/interference traces rather than inferring equal stimulation or reliability solely from the maximum field. They do not equate calibration and membrane voltage; if suitable response data are missing, they identify that limit on inference.
  - Understanding focus (DE): Die zeitliche Flussänderung und die konkret beobachtete Signaltrennbarkeit bestimmen die begrenzte Schlussfolgerung. Der Fall verlangt keine zusätzliche Beherrschung des quantitativen Induktionsgesetzes oder biologischer Schwellenwerte.
  - Understanding focus (EN): Time-varying flux and the specifically observed separation of signals determine the bounded conclusion. The case does not demand additional mastery of the quantitative induction law or biological thresholds.
## Page 10: Axonsegmente als elektrische Ersatzschaltungen modellieren

- Full learning-goal ID: `c2e0fc31-27a2-5727-9025-a824db9150d2`
- Goal fingerprint: `sha256:534f4a73f004af0fc19135ef1c3a8084b834781666d8e891a1dec8c1b726dbe3`
- Page fingerprint: `sha256:e1829169b20635fb2b82cfb165fc2e928dc52d29acf90d718ea136344fef9065`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann ein Axonsegment mit Membrankapazität sowie Membran- und Axialwiderstand als elektrische Ersatzschaltung modellieren, mehrere Segmente verknüpfen und begründen, welche passive Signalausbreitung das Modell erklärt und welche zusätzlichen spannungsabhängigen Elemente für aktive Leitung nötig sind.

### Visualization

/assets/goal-visualizations/physik/c2e0fc31-27a2-5727-9025-a824db9150d2/c2e0fc31-27a2-5727-9025-a824db9150d2.jpg

- original digest: `sha256:7ca08202d33d4ab80cbbd946255fc37aa423b64a5d19369fd70cbc12cbff03a6`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Widerstandswirkungen in Reihen- und Parallelschaltungen deuten — `8f833b36-4126-52db-b210-79fb0023c7d9` (outside this book)
- Auf- und Entladen eines Kondensators — `0b4f2020-8486-5372-9cb9-6e59f698ac2d` (outside this book)

### Direct reverse prerequisites outside this book

- Passive Signalleitung mit Kondensator-Ladekurven vergleichen — `3aaac6ad-948e-502a-9d49-ce40db0f2ca3` (outside this book)
- Membran- und Axialwiderstand im passiven Axonmodell untersuchen — `8cdef591-6ddb-5151-8c74-a80be0271079` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e316a6afde122998f6d552287d4e866ac59756e6aa1d21e4a69bd03c69649fae`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `construct-passive-axon-circuit`
  - Essential understanding (DE): Die Membran speichert Ladung wie eine Kapazität, der Membranwiderstand beschreibt Leckstrom und der Axialwiderstand den längsgerichteten Strom zwischen Segmenten. Gekoppelte RC-Segmente erklären zeitlich verzögertes und räumlich abgeschwächtes passives Potenzial.
  - Essential understanding (EN): The membrane stores charge like a capacitance, membrane resistance represents leakage, and axial resistance represents longitudinal current between segments. Coupled RC segments explain delayed and spatially attenuated passive potential.
  - Observable performance (DE): Die lernende Person konstruiert und beschriftet mindestens drei gekoppelte Segmente, verfolgt Strompfade und sagt aus Widerständen und Kapazitäten qualitative Signalverläufe voraus.
  - Observable performance (EN): The learner constructs and labels at least three coupled segments, traces current paths, and predicts qualitative signal trends from resistances and capacitances.
- `state-passive-model-limit`
  - Essential understanding (DE): Ein rein passives lineares RC-Netzwerk regeneriert ein abgeschwächtes Signal nicht. Aktionspotenziale benötigen zusätzliche spannungsabhängige, nichtlineare Leitfähigkeiten; deren detaillierte Kinetik ist nicht im passiven Ersatzmodell enthalten.
  - Essential understanding (EN): A purely passive linear RC network does not regenerate an attenuated signal. Action potentials require additional voltage-dependent nonlinear conductances; their detailed kinetics are not contained in the passive equivalent model.
  - Observable performance (DE): Die lernende Person vergleicht Modellvorhersage und aktiv fortgeleiteten Signalverlauf, lokalisiert die fehlende Funktion und ergänzt spannungsabhängige Elemente nur dort, wo die aktive Leitung sie verlangt.
  - Observable performance (EN): The learner compares the model prediction with an actively propagated signal, locates the missing function, and adds voltage-dependent elements only where active conduction requires them.

**Coverage expectations**

- required expectations: `construct-passive-axon-circuit`, `state-passive-model-limit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `segment-parameter`: Veränderte Membrankapazität, Membran- oder Axialwiderstand / Changed membrane capacitance, membrane resistance, or axial resistance
- `segment-geometry`: Andere Segmentlänge oder Zahl gekoppelter Segmente / Different segment length or number of coupled segments
- `conduction-regime`: Passive Ausbreitung oder aktive Regeneration an diskreten Stellen / Passive spread or active regeneration at discrete sites

**Application cases**

- `passive-pulse-across-segments`
  - Task demand (DE): Ein kurzer Strompuls wird in das erste von vier Axonsegmenten eingespeist. Zeichne die Ersatzschaltung, skizziere die Potenziale der Segmente und sage voraus, wie größere Membrankapazität beziehungsweise höherer Membranwiderstand Verzögerung und Abschwächung verändern.
  - Task demand (EN): A short current pulse is injected into the first of four axon segments. Draw the equivalent circuit, sketch segment potentials, and predict how greater membrane capacitance or higher membrane resistance changes delay and attenuation.
  - Expected performance (DE): Die lernende Person ordnet Cₘ, Rₘ und Rₐ korrekt an, erwartet passive Verzögerung und Abnahme, trennt die langsamere Aufladung bei größerem Cₘ von der geringeren Leckage bei größerem Rₘ und begründet beide Vorhersagen.
  - Expected performance (EN): The learner arranges Cₘ, Rₘ, and Rₐ correctly, expects passive delay and attenuation, distinguishes slower charging with greater Cₘ from reduced leakage with greater Rₘ, and justifies both predictions.
  - Understanding focus (DE): Der Fall prüft Schaltungskonstruktion und kausale Parameterwirkung.
  - Understanding focus (EN): The case assesses circuit construction and causal parameter effects.
- `myelinated-segment-model-limit`
  - Task demand (DE): Ein Signal bleibt entlang eines myelinisierten Axons nahezu erhalten, obwohl ein rein passives Segmentmodell Abnahme vorhersagt. Passe Widerstände und Kapazitäten qualitativ an, erkläre die verbleibende Diskrepanz und markiere nötige aktive Elemente an den Knoten.
  - Task demand (EN): A signal remains nearly preserved along a myelinated axon although a purely passive segment model predicts attenuation. Adjust resistances and capacitances qualitatively, explain the remaining discrepancy, and mark the active elements needed at the nodes.
  - Expected performance (DE): Die lernende Person verbindet Myelinisierung mit höherem Membranwiderstand und kleinerer wirksamer Kapazität, erkennt aber, dass dies keine Regeneration erzeugt, und ergänzt spannungsabhängige Leitfähigkeiten als ausdrückliche Modellweiterung.
  - Expected performance (EN): The learner connects myelination with greater membrane resistance and smaller effective capacitance but recognizes that this does not create regeneration and adds voltage-dependent conductances as an explicit model extension.
  - Understanding focus (DE): Der unabhängige Transfer prüft Modellleistung und Modellgrenze an veränderter Struktur.
  - Understanding focus (EN): The independent transfer assesses model capability and limitation under changed structure.
## Page 11: Schallgeschwindigkeiten in verschiedenen Medien vergleichen und begründen

- Full learning-goal ID: `a24c41ce-68c5-56a7-8235-ef9a7dba7042`
- Goal fingerprint: `sha256:ca5556ab525182e51f63733ce388be42e7fe7b956026108b73584659752e345f`
- Page fingerprint: `sha256:7906331a2b8b2626f420cb870454b3d3819ca5b86726cf32983b0883d0621dde`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann Schallgeschwindigkeiten in verschiedenen Medien anhand von Daten vergleichen, Unterschiede mit elastischer Kopplung und Trägheit im Teilchenmodell begründen und eine vorschnelle Rangfolge allein nach Aggregatzuständen prüfen.

### Visualization

/assets/goal-visualizations/physik/a24c41ce-68c5-56a7-8235-ef9a7dba7042/a24c41ce-68c5-56a7-8235-ef9a7dba7042.jpg

- original digest: `sha256:a26494acb70d474f814f3e4a9a3016cb8da1234877f44a416613160b1f9257b5`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Schallausbreitung im Teilchenmodell erklären — `3c82510a-1f12-4eaa-81c2-8599437a5b85` (outside this book)
- Rationale Zahlen an der Zahlengeraden darstellen und ordnen — `f6b13b8e-1ecd-5420-905d-21290aa996a6` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Schall bei einer Schulveranstaltung untersuchen — `00e2ddfe-18c1-57a4-86ad-ee467a1a3d61` (outside this book)
- Sek-I-Abschlussaufgaben Physik selbstständig lösen — `3631c8f7-ff48-57ff-b7ee-8397ff1d166a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:405d9cea7c3f4ed51617b0b7fb9bbc48401f6c1beb54751308da2a44d107b662`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `data-grounded-speed-comparison`
  - Essential understanding (DE): Schallgeschwindigkeit ist eine medien- und bedingungsabhängige Messgröße; belastbare Vergleiche beziehen sich auf konkrete Daten mit Einheiten und vergleichbaren Bedingungen statt auf den Aggregatzustand als Etikett.
  - Essential understanding (EN): Sound speed is a medium- and condition-dependent measured quantity; defensible comparisons use specific data with units under comparable conditions rather than the state of matter as a label.
  - Observable performance (DE): Die lernende Person ordnet unbekannte Medien anhand einer Datentabelle, quantifiziert relevante Unterschiede oder Verhältnisse und kennzeichnet fehlende beziehungsweise nicht vergleichbare Bedingungen als Aussagegrenze.
  - Observable performance (EN): The learner ranks unfamiliar media from a data table, quantifies relevant differences or ratios, and identifies missing or non-comparable conditions as a limitation of the conclusion.
- `coupling-inertia-explanation`
  - Essential understanding (DE): Im Teilchenmodell hängt die Geschwindigkeit der Störungsweitergabe sowohl davon ab, wie stark benachbarte Bereiche elastisch gekoppelt sind, als auch von ihrer Trägheit; keines der beiden Merkmale allein bestimmt die Rangfolge.
  - Essential understanding (EN): In the particle model, the speed at which a disturbance is passed on depends both on how strongly neighboring regions are elastically coupled and on their inertia; neither feature alone determines the ranking.
  - Observable performance (DE): Die lernende Person erklärt mindestens einen gemessenen Geschwindigkeitsunterschied durch das Zusammenspiel von Kopplung und Trägheit und sagt bei einem veränderten Modellfall begründet voraus, wie stärkere Kopplung oder größere Trägheit wirken würde.
  - Observable performance (EN): The learner explains at least one measured speed difference through the interplay of coupling and inertia and gives a justified prediction for how stronger coupling or greater inertia would affect a changed model case.
- `state-of-matter-counterexample`
  - Essential understanding (DE): Eine Regel wie „in Festkörpern immer schneller als in Flüssigkeiten und dort immer schneller als in Gasen“ ist keine universelle Begründung; konkrete Materialeigenschaften können innerhalb eines Aggregatzustands stark variieren und eine pauschale Rangfolge widerlegen.
  - Essential understanding (EN): A rule such as “always faster in solids than in liquids and always faster there than in gases” is not a universal explanation; specific material properties can vary greatly within a state of matter and overturn a blanket ranking.
  - Observable performance (DE): Die lernende Person prüft eine pauschale Aggregatzustandsregel an frischen Daten, nennt einen konkreten Gegenvergleich und ersetzt sie durch eine auf Kopplung, Trägheit und Messbedingungen begrenzte Aussage.
  - Observable performance (EN): The learner tests a blanket state-of-matter rule against fresh data, identifies a specific counter-comparison, and replaces it with a claim limited by coupling, inertia, and measurement conditions.

**Coverage expectations**

- required expectations: `data-grounded-speed-comparison`, `coupling-inertia-explanation`, `state-of-matter-counterexample`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-set`: Mehrere konkrete Gase, Flüssigkeiten und Festkörper statt je eines typischen Vertreters / Several specific gases, liquids, and solids rather than one typical representative of each
- `property-balance`: Stärkere elastische Kopplung bei ähnlicher Trägheit oder größere Trägheit bei ähnlicher Kopplung / Stronger elastic coupling at similar inertia or greater inertia at similar coupling
- `measurement-condition`: Vergleichbare beziehungsweise unterschiedliche Temperatur- oder Zustandsbedingungen in den bereitgestellten Daten / Comparable or differing temperature or state conditions in the supplied data

**Application cases**

- `mixed-media-table`
  - Task demand (DE): Eine neue Tabelle enthält Schallgeschwindigkeiten mehrerer namentlich genannter Gase, Flüssigkeiten und Festkörper mit Einheiten und Temperaturen. Eine Rangfolge, zwei quantitative Vergleiche und die Prüfung der Aussage „der Aggregatzustand genügt zur Vorhersage“ sind gefordert.
  - Task demand (EN): A new table gives sound speeds for several named gases, liquids, and solids with units and temperatures. A ranking, two quantitative comparisons, and a test of the statement “state of matter is sufficient for prediction” are required.
  - Expected performance (DE): Die lernende Person verwendet die Daten statt Etiketten, berechnet passende Unterschiede oder Verhältnisse, findet einen Vergleich, der eine pauschale Regel nicht trägt, und grenzt temperaturbedingt unsichere Vergleiche ab.
  - Expected performance (EN): The learner uses the data rather than labels, calculates suitable differences or ratios, finds a comparison that does not support a blanket rule, and limits comparisons made uncertain by temperature differences.
  - Understanding focus (DE): Die Rangfolge muss datenbasiert sein und die verführerische Dreistufenregel aktiv prüfen.
  - Understanding focus (EN): The ranking must be data based and actively test the tempting three-level rule.
- `coupled-particle-models`
  - Task demand (DE): Zwei unbekannte Modellmedien sind durch gleichartige Teilchenbilder beschrieben: In B ist die Kopplung stärker, die Trägheit aber ebenfalls größer als in A. Es ist zu erklären, warum ohne quantitative Angaben keine eindeutige Rangfolge folgt, und welche getrennten Vergleichsfälle eine Vorhersage erlauben.
  - Task demand (EN): Two unfamiliar model media are described by similar particle diagrams: in B the coupling is stronger but the inertia is also greater than in A. The learner must explain why no unique ranking follows without quantitative information and identify separate comparison cases that would allow a prediction.
  - Expected performance (DE): Die lernende Person erkennt die gegenläufigen Einflüsse, sagt bei gleicher Trägheit für stärkere Kopplung eine schnellere Weitergabe und bei gleicher Kopplung für größere Trägheit eine langsamere Weitergabe voraus und behauptet keine Rangfolge allein aus dem Aggregatzustand.
  - Expected performance (EN): The learner recognizes the opposing influences, predicts faster transfer for stronger coupling at equal inertia and slower transfer for greater inertia at equal coupling, and does not assert a ranking from state of matter alone.
  - Understanding focus (DE): Der Transfer diagnostiziert eindimensionale Begründungen und fordert das Zusammenspiel beider Modellgrößen.
  - Understanding focus (EN): The transfer diagnoses one-dimensional explanations and requires the interplay of both model quantities.
## Page 12: Einfache optische Instrumente beschreiben

- Full learning-goal ID: `6367d45e-919e-4c19-bcd9-7770a2d51139`
- Goal fingerprint: `sha256:00ce60939b3ba2036edea8bb5cabd35e777b0b4ad01bc4eb8986ae9aa8040a51`
- Page fingerprint: `sha256:1cc82c22eda3016bcb99d471057fdc2c334a999863f9563fbca9ebf3055ce325`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann bei einem einfachen Fernrohr oder Mikroskop den Strahlenverlauf durch Objektiv und Okular im jeweiligen Modell deuten und erklären, wie der Aufbau die Beobachtung ermöglicht.

### Visualization

/assets/goal-visualizations/physik/6367d45e-919e-4c19-bcd9-7770a2d51139/6367d45e-919e-4c19-bcd9-7770a2d51139.jpg

- original digest: `sha256:5361dd56e4561982f4b1737c960416a36e2c07fc374cc63e271ded4e007d6db6`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Sehvorgang und Fehlsichtigkeiten qualitativ erklären — `90e1e6cf-4092-41d6-81f7-5206f9d68f84` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-I-Abschlussaufgaben Physik selbstständig lösen — `3631c8f7-ff48-57ff-b7ee-8397ff1d166a` (outside this book)
- Prüfungsaufgabe: Ein einfaches Fernrohr im Strahlenmodell deuten — `3f477f0d-4f79-5eed-8671-fb2667d60910` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ff5dc45918eea7c75037cbcab8bb86e4309dc86cfb2a41dbaec14901c23adf9b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `components-and-ray-convention`
  - Essential understanding (DE): In einem festgelegten einfachen Instrumentmodell haben Objektiv und Okular unterschiedliche Funktionen und verändern nacheinander ausgewählte Lichtbündel. Gezeichnete Strahlen repräsentieren Lichtwege; ihre Lage folgt aus Modellannahmen zu Linsentyp, Gegenstandsweite, Brennweite und Abstand.
  - Essential understanding (EN): In a specified simple instrument model, the objective and eyepiece have different functions and successively alter selected bundles of light. Drawn rays represent light paths; their positions follow from assumptions about lens type, object distance, focal length, and separation.
  - Observable performance (DE): Die lernende Person identifiziert in einem neuen Aufbau Objektiv und Okular, begründet ihre jeweilige Funktion und konstruiert oder vervollständigt repräsentative Strahlen, ohne die Modelllinien als materielle Strahlenbündel zu reifizieren.
  - Observable performance (EN): In a fresh setup, the learner identifies the objective and eyepiece, justifies their respective functions, and constructs or completes representative rays without reifying the model lines as material ray bundles.
- `successive-image-formation`
  - Essential understanding (DE): Die Beobachtungswirkung entsteht durch das Zusammenspiel aufeinanderfolgender Abbildungen: Das Objektiv erzeugt im jeweiligen Modell eine Bildsituation, die für das Okular als Gegenstand dient; reelle oder virtuelle Zwischen- und Endbilder sind anhand der Lichtwege zu unterscheiden.
  - Essential understanding (EN): The observational effect results from the interaction of successive imaging steps: in the relevant model, the objective creates an image situation that serves as the object for the eyepiece; real and virtual intermediate and final images are distinguished from the light paths.
  - Observable performance (DE): Die lernende Person verfolgt in einem unbekannten Fernrohr- oder Mikroskopschema die Abbildungsfolge, lokalisiert Zwischen- und Endbild qualitativ und erklärt, wie beide Bauteile gemeinsam die Beobachtung mit dem Auge ermöglichen.
  - Observable performance (EN): In an unfamiliar telescope or microscope schematic, the learner traces the sequence of imaging, qualitatively locates the intermediate and final images, and explains how both components together enable observation by the eye.
- `instrument-specific-model-transfer`
  - Essential understanding (DE): Fernrohr und Mikroskop teilen die Analyse aufeinanderfolgender Abbildungen, unterscheiden sich aber in Gegenstandsbedingung und konkreter Linsenanordnung. Eine Aussage darf deshalb nur innerhalb des ausdrücklich gewählten Instrumentmodells übertragen werden.
  - Essential understanding (EN): A telescope and microscope share the analysis of successive imaging but differ in object condition and specific lens arrangement. A claim may therefore be transferred only within the explicitly chosen instrument model.
  - Observable performance (DE): Bei einem veränderten Zwei-Linsen-Aufbau sagt die lernende Person Lichtweg und Beobachtungswirkung voraus, nennt die übertragbaren Beziehungen und erklärt, welche Annahme eines bekannten Fernrohr- oder Mikroskopmodells geändert wurde.
  - Observable performance (EN): For a changed two-lens setup, the learner predicts the light path and observational effect, states the relationships that transfer, and explains which assumption of a familiar telescope or microscope model has changed.

**Coverage expectations**

- required expectations: `components-and-ray-convention`, `successive-image-formation`, `instrument-specific-model-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 3
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `instrument-model`: Einfaches Linsenfernrohr oder einfaches zusammengesetztes Mikroskop mit jeweils festgelegtem Modell / Simple refracting telescope or simple compound microscope with the model specified in each case
- `object-condition`: Weit entfernter Gegenstand oder Gegenstand nahe der Objektivbrennweite passend zum Instrument / Distant object or object near the objective focal point as appropriate to the instrument
- `component-geometry`: Linsenabstand, Brennweitenrelation oder Position eines Bauteils wird verändert / Lens separation, focal-length relationship, or position of one component is changed
- `diagram-completeness`: Vollständiges Schema, unvollständiger Strahlenverlauf oder rein sprachlich beschriebener Aufbau / Complete schematic, incomplete ray path, or setup described only in words

**Application cases**

- `simple-refracting-telescope`
  - Task demand (DE): Ein neues Schema eines einfachen Linsenfernrohrs mit festgelegter Objektiv- und Okularlinse wird vorgelegt. Der Strahlenverlauf ist zu ergänzen und die Beobachtungsfunktion beider Linsen zu erklären.
  - Task demand (EN): A fresh schematic of a simple refracting telescope with specified objective and eyepiece lenses is provided. Complete the ray path and explain the observational function of both lenses.
  - Expected performance (DE): Die lernende Person identifiziert Objektiv und Okular, verfolgt ein von einem weit entfernten Objekt kommendes Lichtbündel, beschreibt die Zwischenbildsituation und erklärt, wie das Okular die Beobachtung ermöglicht.
  - Expected performance (EN): The learner identifies the objective and eyepiece, traces a bundle of light arriving from a distant object, describes the intermediate image situation, and explains how the eyepiece enables observation.
  - Understanding focus (DE): Der Fall prüft die kausale Abbildungsfolge statt das Auswendiglernen der Bauteilnamen.
  - Understanding focus (EN): The case tests the causal imaging sequence rather than memorization of component names.
- `simple-compound-microscope`
  - Task demand (DE): Für ein einfaches Mikroskopmodell liegt der Gegenstand knapp außerhalb der Objektivbrennweite. Die entstehenden Bildschritte sind qualitativ zu konstruieren und ihre Funktion für die Beobachtung zu erklären.
  - Task demand (EN): In a simple microscope model, the object lies just beyond the objective focal point. Qualitatively construct the resulting imaging steps and explain their function for observation.
  - Expected performance (DE): Die lernende Person konstruiert das vergrößerte Zwischenbild des Objektivs, nutzt es als Gegenstand des Okulars und erklärt die virtuelle Endbildbeobachtung, ohne Fernrohrannahmen unverändert zu übertragen.
  - Expected performance (EN): The learner constructs the magnified intermediate image produced by the objective, uses it as the object for the eyepiece, and explains observation of the virtual final image without transferring telescope assumptions unchanged.
  - Understanding focus (DE): Der Wechsel der Gegenstandsbedingung prüft Transfer der Abbildungslogik zwischen zwei Instrumentmodellen.
  - Understanding focus (EN): Changing the object condition tests transfer of imaging logic between two instrument models.
- `changed-lens-separation`
  - Task demand (DE): Bei einem bekannten Zwei-Linsen-Instrument wird der Abstand zwischen Objektiv und Okular verändert, während Linsentypen und Gegenstandslage fest bleiben. Die Auswirkung auf Zwischenbild und Beobachtbarkeit ist vorherzusagen.
  - Task demand (EN): In a familiar two-lens instrument, the separation between objective and eyepiece is changed while lens types and object position remain fixed. Predict the effect on the intermediate image and observability.
  - Expected performance (DE): Die lernende Person hält die vom Objektiv bestimmte Bildlage zunächst fest, vergleicht sie mit der neuen Okularposition und erklärt qualitativ, ob die ursprüngliche Beobachtungsbedingung noch erfüllt ist.
  - Expected performance (EN): The learner initially keeps the image position determined by the objective fixed, compares it with the new eyepiece position, and qualitatively explains whether the original observation condition is still satisfied.
  - Understanding focus (DE): Die Geometrievariation zeigt, ob das Zusammenspiel der Komponenten statt eines starren Standardbilds verstanden ist.
  - Understanding focus (EN): The geometry variation reveals whether the interaction of components rather than one fixed standard diagram is understood.
## Page 13: Drehmoment beschreiben

- Full learning-goal ID: `cf570e66-2ce2-5923-9033-c97d74119553`
- Goal fingerprint: `sha256:523fab8b325aa66e4f04738f200e958e97bfd42ebec1bf04471d08207e927986`
- Page fingerprint: `sha256:54e3f81a92c701cddc47adcebd0620cdd71e914cd3eecdd809bbbb2d68e7ef9c`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann das Drehmoment als Maß für die Drehwirkung einer Kraft definieren, berechnen und an einfachen Hebel- und Alltagsbeispielen anwenden.

### Visualization

/assets/goal-visualizations/physik/cf570e66-2ce2-5923-9033-c97d74119553/cf570e66-2ce2-5923-9033-c97d74119553.jpg

- original digest: `sha256:3d8def38041d3332d55747d234e8234f0a4cb4f885b2e8425300ac17ad5fd450`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Drehmoment auf Magnetnadeln und Dipole — `d02438ba-0cc9-5993-831e-5e44d35e32c4` (page 14)

### Prerequisites outside this book

- Kreisbewegung mit Zentripetalkraft anwenden — `accb1d9e-cd48-5983-bcef-9b9bca4a9114` (outside this book)

### Direct reverse prerequisites outside this book

- Drehimpuls als Erhaltungsgröße — `37f17e7e-9fcf-5dca-ac10-e94cb8420be5` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:79dedfb57bbdb735a837fe9f74409ad920f54e5247b6bd742a7f9988f7e76442`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `perpendicular-lever-arm`
  - Essential understanding (DE): Das Drehmoment bezüglich einer gewählten Achse hängt von Kraft und senkrechtem Abstand ihrer Wirkungslinie zur Achse ab.
  - Essential understanding (EN): Torque about a chosen axis depends on force and the perpendicular distance from its line of action to the axis.
  - Observable performance (DE): Die Person markiert Achse, Kraftwirkungslinie und Hebelarm und berechnet den Drehmomentbetrag in N m.
  - Observable performance (EN): The learner marks the axis, force line of action, and moment arm and calculates torque magnitude in N m.
- `torque-sense`
  - Essential understanding (DE): Drehmomente besitzen einen Drehsinn; mehrere Beiträge werden mit einer einheitlichen Vorzeichenkonvention zusammengefasst.
  - Essential understanding (EN): Torques have a rotational sense; multiple contributions are combined using one sign convention.
  - Observable performance (DE): Die Person vergleicht Kraftansatz und Kraftrichtung sowie gegensinnige Beiträge und erklärt auch den Fall einer Kraftwirkungslinie durch die Achse.
  - Observable performance (EN): The learner compares force application points and directions, combines opposing contributions, and explains a force whose line of action passes through the axis.

**Coverage expectations**

- required expectations: `perpendicular-lever-arm`, `torque-sense`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `line-of-action`: Kraftrichtung bei festem Ansatzpunkt verändern. / Change force direction at a fixed application point.
- `opposing-moments`: Eine einzelne Drehwirkung mit zwei gegensinnigen Beiträgen vergleichen. / Compare one turning effect with two opposing contributions.

**Application cases**

- `door-direction`
  - Task demand (DE): Eine Tür wird 0,75 m von der Scharnierachse mit 16 N senkrecht zur Türfläche gedrückt. Berechne die Drehwirkung. Vergleiche dieselbe Kraft am selben Punkt, wenn ihre Wirkungslinie nun durch die Scharnierachse verläuft.
  - Task demand (EN): A door is pushed with 16 N perpendicular to its surface, 0.75 m from the hinge axis. Calculate the turning effect. Compare the same force at the same point when its line of action instead passes through the hinge axis.
  - Expected performance (DE): Die Person erhält zunächst 12 N m und anschließend null. Sie erklärt den Unterschied durch den senkrechten Hebelarm, nicht durch eine veränderte Türbreite oder Kraftstärke.
  - Expected performance (EN): The learner obtains 12 N m initially and zero afterward, explaining the difference through the perpendicular moment arm rather than changed door width or force magnitude.
  - Understanding focus (DE): Nicht jede große Kraft an langem Abstand erzeugt ein Drehmoment.
  - Understanding focus (EN): Not every large force applied far from an axis produces torque.
- `opposing-levers`
  - Task demand (DE): An einem fest gelagerten Hebel erzeugen 30 N bei 0,20 m senkrechtem Hebelarm eine Drehung gegen den Uhrzeigersinn. Eine zweite Kraft von 20 N wirkt mit 0,40 m Hebelarm im Uhrzeigersinn. Bestimme das Gesamtdrehmoment und eine ausgleichende Änderung.
  - Task demand (EN): On a pivoted lever, 30 N at a perpendicular moment arm of 0.20 m produces counterclockwise torque. A second 20-N force acts at 0.40 m clockwise. Determine net torque and one balancing adjustment.
  - Expected performance (DE): Die Person legt einen positiven Drehsinn fest, erhält +6 und −8 N m sowie −2 N m insgesamt. Beispielsweise gleicht eine Erhöhung der ersten Kraft auf 40 N beide Drehwirkungen aus.
  - Expected performance (EN): The learner chooses a positive sense, obtains +6 and −8 N m and a net −2 N m. For example, raising the first force to 40 N balances the torques.
  - Understanding focus (DE): Betrag und Drehsinn müssen gemeinsam bilanziert werden.
  - Understanding focus (EN): Magnitude and rotational sense must be accounted for together.
## Page 14: Drehmoment auf Magnetnadeln und Dipole

- Full learning-goal ID: `d02438ba-0cc9-5993-831e-5e44d35e32c4`
- Goal fingerprint: `sha256:5b09fe0d44e7af4893dcd26470f12a702adaaa4d7d4817bf9b271940b0132b96`
- Page fingerprint: `sha256:9d48e6ce417aa26f98f5b64dfee741dd93e8ac7656062d8951f5596e090825a0`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann das Drehmoment auf Magnetnadeln und magnetische Dipole im homogenen Feld mit M = mu * B * sin(alpha) berechnen und die Ausrichtung im Feld fachlich begründen.

### Visualization

/assets/goal-visualizations/physik/d02438ba-0cc9-5993-831e-5e44d35e32c4/d02438ba-0cc9-5993-831e-5e44d35e32c4.jpg

- original digest: `sha256:b49d8052a21dae57a8afc092ffc8987bd8729d2fc54bbbe2efcd7039e8369208`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Drehmoment beschreiben — `cf570e66-2ce2-5923-9033-c97d74119553` (page 13)

### Direct reverse prerequisites

- Gaußsches Verfahren anwenden — `58db62d4-458f-5e2d-9ca0-968e09f4944b` (page 15)

### Prerequisites outside this book

- Kraft auf stromdurchflossene Leiter — `c6355a22-24cf-5d8b-88af-ea11711460fb` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Dipoldrehmoment und stabile Ausrichtung — `349586d0-68ce-5485-97a5-0c73f71bbd72` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:c47e1c5037cb459357e86c6cf2b6664e864c80a791c7acf0554bffc41bf5742a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `dipole-torque`
  - Essential understanding (DE): Für einen magnetischen Dipol im homogenen Feld gilt τ = μ × B und |τ| = μB sin α; μ zeigt beim Stabmagneten von Süd nach Nord.
  - Essential understanding (EN): For a magnetic dipole in a uniform field, τ = μ × B and |τ| = μB sin α; for a bar magnet, μ points from south to north.
  - Observable performance (DE): Die Person identifiziert den Winkel zwischen μ und B, berechnet Drehmomentbeträge mit Einheiten und gibt den Drehsinn an.
  - Observable performance (EN): The learner identifies the angle between μ and B, calculates torque magnitudes with units, and states rotational sense.
- `alignment-stability`
  - Essential understanding (DE): Parallel- und Antiparallellage haben beide Drehmoment null, aber unterschiedliche Stabilität; ein ruhiges Einschwingen in Feldrichtung setzt Energieabgabe voraus.
  - Essential understanding (EN): Parallel and antiparallel orientations both have zero torque but different stability; settling at rest along the field requires energy dissipation.
  - Observable performance (DE): Die Person begründet die Rückstell- oder wegdrehende Wirkung einer kleinen Störung und unterscheidet Drehwirkung von einer Translationskraft im homogenen Feld.
  - Observable performance (EN): The learner explains restoring or destabilizing action after a small disturbance and distinguishes torque from translational force in a uniform field.

**Coverage expectations**

- required expectations: `dipole-torque`, `alignment-stability`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `angle-and-sense`: Dipolwinkel einschließlich der beiden Nullmomentlagen verändern. / Vary dipole angle, including both zero-torque orientations.
- `damping`: Dämpfungsfreies Schwingen mit gedämpftem Einschwingen vergleichen. / Compare undamped oscillation with damped settling.

**Application cases**

- `dipole-at-angle`
  - Task demand (DE): Ein idealer Dipol besitzt μ = 0,12 A m² und liegt in einem homogenen Feld B = 0,050 T unter 30° zur Feldrichtung. Bestimme Drehmomentbetrag und Drehsinn und vergleiche mit 90°. Erkläre, ob das homogene Feld eine resultierende Translationskraft liefert.
  - Task demand (EN): An ideal dipole has μ = 0.12 A m² and lies at 30° to a uniform field B = 0.050 T. Determine torque magnitude and rotational sense and compare with 90°. Explain whether the uniform field produces net translational force.
  - Expected performance (DE): Die Person erhält 0,0030 N m und bei 90° 0,0060 N m; der Drehsinn verkleinert zunächst den Winkel zu B. Für den idealen Dipol im homogenen Feld ist die resultierende Translationskraft null, obwohl ein Drehmoment wirkt.
  - Expected performance (EN): The learner obtains 0.0030 N m and 0.0060 N m at 90°; torque initially reduces the angle to B. Net translational force on the ideal dipole in a uniform field is zero even though torque acts.
  - Understanding focus (DE): Kräftepaar und Winkel bestimmen die Drehwirkung, nicht einen Zug entlang des Feldes.
  - Understanding focus (EN): A force couple and orientation determine torque, not a pull along the field.
- `zero-torque-two-alignments`
  - Task demand (DE): Zwei sonst gleiche Magnetnadeln stehen zunächst genau parallel beziehungsweise antiparallel zu einem homogenen Feld. Jede erhält eine kleine Winkelstörung. Begründe ihre unterschiedliche Reaktion und den Einfluss schwacher Dämpfung.
  - Task demand (EN): Two otherwise identical magnetic needles initially point exactly parallel and antiparallel to a uniform field. Each receives a small angular disturbance. Explain their different responses and the effect of weak damping.
  - Expected performance (DE): Die Person erkennt beide Anfangsmomente als null. Die parallele Lage wirkt rückstellend, die antiparallele wegtreibend. Ohne Dämpfung muss die Nadel nicht zur Ruhe kommen; mit Dämpfung kann sie sich in der stabilen parallelen Lage einpendeln.
  - Expected performance (EN): The learner identifies both initial torques as zero. The parallel position is restoring and the antiparallel one destabilizing. Without damping the needle need not come to rest; with damping it can settle in the stable parallel orientation.
  - Understanding focus (DE): Nullmoment allein unterscheidet stabile und instabile Orientierung nicht.
  - Understanding focus (EN): Zero torque alone does not distinguish stable from unstable orientation.
## Page 15: Gaußsches Verfahren anwenden

- Full learning-goal ID: `58db62d4-458f-5e2d-9ca0-968e09f4944b`
- Goal fingerprint: `sha256:6568d1ab24e4653dd7d39e3360f164d2ba8cb8ae15a74e457505bc23aa7d3a41`
- Page fingerprint: `sha256:8553243b129d49df649f1194baa434700266b81646ccff1618ee8bd8e733f365`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann das Messverfahren von Gauß (Ablenkungsmethode in Hauptlage und Schwingungsmethode) zur Bestimmung der Horizontalintensität des Erdmagnetfeldes beschreiben und anwenden.

### Visualization

/assets/goal-visualizations/physik/58db62d4-458f-5e2d-9ca0-968e09f4944b/58db62d4-458f-5e2d-9ca0-968e09f4944b.jpg

- original digest: `sha256:a0be40ce8a2c1d59c7e87753982531eee8a4382a78657415a540777da4a23616`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Drehmoment auf Magnetnadeln und Dipole — `d02438ba-0cc9-5993-831e-5e44d35e32c4` (page 14)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Bruchterme multiplizieren und dividieren — `76478e47-5ff9-5de1-b601-5e6e436ad855` (outside this book)
- Quadratwurzeln definieren und schätzen — `f8704a7b-e93d-4e32-b0f9-1b171545fe28` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Zwei Gauß-Messungen zur Feldbestimmung kombinieren — `789d70ff-8ec2-5b9d-8fa0-9926cb97feab` (outside this book)
- Q1-Klausuraufgaben Physik selbstständig lösen — `d441ee2f-9230-5751-832b-5b0b5cf14605` (outside this book)
- Magnetische Messverfahren und Technik — `d8442d03-8b7e-54b7-9d9a-dc31ce541daa` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:220c880d462b781fe96cb274e415abcbc5be3e8582490ca8ceb8376948832083`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `combined-measurements`
  - Essential understanding (DE): Eine Ablenkungsmessung bestimmt das Verhältnis m/B_H, eine Kleinwinkelschwingung desselben Magneten mit bekanntem Trägheitsmoment J das Produkt mB_H. Erst ihre Kombination trennt Magnetmoment und horizontales Erdfeld.
  - Essential understanding (EN): A deflection measurement determines m/B_H, while small-angle oscillation of the same magnet with known moment of inertia J determines mB_H. Only their combination separates magnetic moment and horizontal terrestrial field.
  - Observable performance (DE): Die Person unterscheidet direkt gemessene Winkel, Abstände und Zeiten von erschlossenen Größen, kombiniert Quotient und Produkt und gibt B_H in Tesla an.
  - Observable performance (EN): The learner distinguishes directly measured angles, distances, and times from inferred quantities, combines ratio and product, and reports B_H in tesla.
- `geometry-and-validity`
  - Essential understanding (DE): Das Magnetfeld muss am Kompass senkrecht zu B_H stehen. Im Dipolfernfeld ist sein Betrag axial doppelt so groß wie äquatorial; kleine Schwingungswinkel und vernachlässigbare Fadentorsion tragen die Periodenformel.
  - Essential understanding (EN): The magnet's field at the compass must be perpendicular to B_H. In the dipole far field its axial magnitude is twice the equatorial magnitude; small oscillation angles and negligible suspension torsion justify the period formula.
  - Observable performance (DE): Die Person beschreibt die Hauptlage geometrisch statt nur über eine Nummer, verwendet den passenden Faktor und begründet Kontrollen für Abstände, Fremdfelder und Periodenmessung.
  - Observable performance (EN): The learner describes principal position geometrically rather than merely by number, uses the appropriate factor, and explains checks on distances, stray fields, and period measurement.

**Coverage expectations**

- required expectations: `combined-measurements`, `geometry-and-validity`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `principal-position`: Axiale und äquatoriale Lage des Kompasses relativ zum Magneten bei senkrechten Feldern vergleichen. / Compare axial and equatorial compass positions relative to the magnet with mutually perpendicular fields.
- `measurement-quality`: Einzelzeitmessung mit mehreren kleinen Schwingungen und störungsarmem Aufbau vergleichen. / Compare single timing with timing several small oscillations in a low-disturbance setup.

**Application cases**

- `axial-gauss`
  - Task demand (DE): Ein bereitgestellter Datensatz verwendet die axiale Hauptlage: Der Kompass liegt auf der verlängerten Magnetachse, deren Feld senkrecht zu B_H steht. r = 0,200 m (Mitte–Mitte), tan θ = 1. Derselbe kurze Magnet schwingt separat mit J = 1,60·10⁻⁵ kg m² und T = 2π s. In SI-Einheiten gegeben: B_m = 2·10⁻⁷ m/r³, tan θ = B_m/B_H, T = 2π√(J/(mB_H)). Bestimme B_H und m.
  - Task demand (EN): A supplied dataset uses the axial principal position: the compass lies on the extended magnet axis, whose field is perpendicular to B_H. r = 0.200 m center-to-center, tan θ = 1. The same short magnet oscillates separately with J = 1.60·10⁻⁵ kg m² and T = 2π s. Given in SI units B_m = 2·10⁻⁷ m/r³, tan θ = B_m/B_H, and T = 2π√(J/(mB_H)), determine B_H and m.
  - Expected performance (DE): Die Person erhält R = m/B_H = 4,00·10⁴ A m²/T und P = mB_H = 1,60·10⁻⁵ A m² T. Daraus folgen B_H = √(P/R) = 20,0 μT und m = √(PR) = 0,800 A m². Sie erläutert, weshalb eine der Messungen allein nicht genügt.
  - Expected performance (EN): The learner obtains R = m/B_H = 4.00·10⁴ A m²/T and P = mB_H = 1.60·10⁻⁵ A m² T, hence B_H = √(P/R) = 20.0 μT and m = √(PR) = 0.800 A m². The learner explains why either measurement alone is insufficient.
  - Understanding focus (DE): Zwei verschiedenartige Messungen beseitigen die unbekannte Magnetstärke.
  - Understanding focus (EN): Two different measurements eliminate the unknown magnet strength.
- `equatorial-gauss-check`
  - Task demand (DE): Ein unabhängiger Datensatz eines anderen Orts und Magneten nutzt die äquatoriale Hauptlage: Die Verbindungslinie zum Kompass steht senkrecht zur Magnetachse, B_m steht senkrecht zu B_H. In SI-Einheiten gegeben sind B_m = 10⁻⁷ m/r³, r = 0,200 m, tan θ = 0,250, J = 1,80·10⁻⁵ kg m² und T = 2π s. Bestimme B_H und m und begründe zwei Qualitätskontrollen.
  - Task demand (EN): An independent dataset for another location and magnet uses the equatorial principal position: the line to the compass is perpendicular to the magnet axis, and B_m is perpendicular to B_H. Given in SI units B_m = 10⁻⁷ m/r³, r = 0.200 m, tan θ = 0.250, J = 1.80·10⁻⁵ kg m², and T = 2π s, determine B_H and m and justify two quality checks.
  - Expected performance (DE): Die Person erhält R = 2,00·10⁴ A m²/T, P = 1,80·10⁻⁵ A m² T, B_H = 30,0 μT und m = 0,600 A m². Sie verwendet den halbierten Feldfaktor und begründet etwa Mitte–Mitte-Abstände im Fernfeld sowie mehrfaches Timing kleiner Schwingungen ohne störende Magnete oder relevante Fadentorsion.
  - Expected performance (EN): The learner obtains R = 2.00·10⁴ A m²/T, P = 1.80·10⁻⁵ A m² T, B_H = 30.0 μT, and m = 0.600 A m², uses the halved field factor, and justifies checks such as center-to-center far-field distances and repeated timing of small oscillations without stray magnets or appreciable suspension torsion.
  - Understanding focus (DE): Die Hauptlagenkonvention verändert den Feldfaktor; Messkontrollen sichern die Modellanwendung.
  - Understanding focus (EN): Principal-position convention changes the field factor; measurement checks support model use.
## Page 16: Kernspintomografie (MRT)

- Full learning-goal ID: `52bdabb2-d9a1-56e6-bccf-ff58f299c739`
- Goal fingerprint: `sha256:8bbfb259f628bacccb805ea32e324faa839383c115f57229c5be51f9fce82413`
- Page fingerprint: `sha256:5033f663aaec0f45b4547574a5119adffa29fcc6ae2d5c63656c9d5905ccbcd8`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann qualitativ erklären, wie ein statisches Magnetfeld eine Netto-Kernspinmagnetisierung ausrichtet, eine resonante Hochfrequenzanregung sie auslenkt und Magnetfeldgradienten die bei der Relaxation gemessenen Signale räumlich für ein MRT-Bild codieren.

### Visualization

/assets/goal-visualizations/physik/52bdabb2-d9a1-56e6-bccf-ff58f299c739/52bdabb2-d9a1-56e6-bccf-ff58f299c739.jpg

- original digest: `sha256:35396a55fd330239aea9485b1eb075590b7fc0defcc118b84e7527fb099d31ca`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Magnetisierung und Permanentmagnete — `0924162b-46d0-5c56-93bc-33e1f5ac6886` (outside this book)

### Direct reverse prerequisites outside this book

- Q1-Klausuraufgaben Physik selbstständig lösen — `d441ee2f-9230-5751-832b-5b0b5cf14605` (outside this book)
- Magnetische Messverfahren und Technik — `d8442d03-8b7e-54b7-9d9a-dc31ce541daa` (outside this book)
- Prüfungsaufgabe: Die MRT-Signalkette an drei Situationen erklären — `f0c35076-ae05-574b-83b5-7419bf712a80` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:73a746c45dd257572ddf4ec84e5b9c6bb2b4b72259d7617c15da475ab8bb96c7`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `static-field-establishes-net-ensemble-magnetization`
  - Essential understanding (DE): In einem statischen Magnetfeld B0 entsteht bei geeigneten Kernspins durch eine kleine statistische Ungleichverteilung eine Netto-Magnetisierung entlang des Feldes. Das Modell beschreibt ein Ensemble; es bedeutet weder, dass alle einzelnen Spins exakt ausgerichtet sind, noch dass diese Spins unmittelbar als Bildpunkte beobachtet werden.
  - Essential understanding (EN): In a static magnetic field B0, a small statistical population imbalance among suitable nuclear spins establishes net magnetization along the field. The model describes an ensemble; it means neither that all individual spins are exactly aligned nor that those spins are observed directly as image points.
  - Observable performance (DE): Die lernende Person deutet in einem neuen Ensembleschema die überwiegende und entgegenstehende Spinpopulation, konstruiert daraus die Richtung der Netto-Magnetisierung und korrigiert die Behauptung, B0 richte jeden einzelnen Kernspin vollständig gleich aus.
  - Observable performance (EN): In a fresh ensemble diagram, the learner interprets the predominant and opposing spin populations, constructs the direction of net magnetization from them, and corrects the claim that B0 completely aligns every individual nuclear spin.
- `resonant-rf-excitation-tips-net-magnetization`
  - Essential understanding (DE): Eine Hochfrequenzanregung koppelt wirksam an die Kernspinmagnetisierung, wenn ihre Frequenz zur Resonanzbedingung im lokalen Magnetfeld passt. Der Puls lenkt die Netto-Magnetisierung aus ihrer Gleichgewichtslage aus; eine beliebige Frequenz oder bloßes Einschalten eines Senders bewirkt nicht dieselbe Anregung.
  - Essential understanding (EN): Radio-frequency excitation couples effectively to nuclear-spin magnetization when its frequency matches the resonance condition in the local magnetic field. The pulse tips net magnetization away from equilibrium; an arbitrary frequency or merely switching on a transmitter does not produce the same excitation.
  - Observable performance (DE): Für eine unabhängig vorgelegte lokale Feldstärke und mehrere qualitative Anregungsfrequenzen wählt die lernende Person die resonante Möglichkeit, ordnet dem Puls die Auslenkung der Netto-Magnetisierung zu und sagt für deutliche Verstimmung qualitativ eine schwächere beziehungsweise fehlende Anregung voraus.
  - Observable performance (EN): For an independently presented local field strength and several qualitative excitation frequencies, the learner selects the resonant option, assigns tipping of net magnetization to the pulse, and qualitatively predicts weaker or absent excitation for substantial detuning.
- `relaxing-transverse-magnetization-produces-measured-signal`
  - Essential understanding (DE): Nach der Anregung präzediert die transversale Magnetisierung und kehrt unter Relaxation zum Gleichgewicht zurück. Ihre zeitliche Änderung erzeugt in der Empfangseinrichtung ein messbares Signal; gemessen wird ein elektromagnetisches Signal des Ensembles, aus dem Eigenschaften erschlossen werden, nicht ein unmittelbar sichtbarer einzelner Kernspin.
  - Essential understanding (EN): After excitation, transverse magnetization precesses and returns toward equilibrium through relaxation. Its time variation produces a measurable signal in the receiver; what is measured is an electromagnetic ensemble signal from which properties are inferred, not a directly visible individual nuclear spin.
  - Observable performance (DE): Die lernende Person ordnet in einem frischen Zeitablauf Hochfrequenzpuls, transversale Magnetisierung, abklingendes Empfangssignal und Rückkehr zum Gleichgewicht, erklärt die Messentstehung qualitativ und trennt gemessenes Signal von der daraus erschlossenen Magnetisierungsentwicklung.
  - Observable performance (EN): In a fresh timeline, the learner orders the radio-frequency pulse, transverse magnetization, decaying received signal, and return toward equilibrium, qualitatively explains signal generation, and distinguishes the measured signal from the inferred evolution of magnetization.
- `gradients-encode-position-in-frequency-or-phase`
  - Essential understanding (DE): Magnetfeldgradienten machen die lokale Feldstärke und damit Resonanzfrequenz beziehungsweise Phasenentwicklung von der Position abhängig. Dadurch kann das gemessene Signal räumliche Information tragen; ohne einen passenden Gradienten fehlt diese Ortsunterscheidung, während die qualitative Erklärung keine Fourier-Rekonstruktion oder quantitative Kontrastanalyse voraussetzt.
  - Essential understanding (EN): Magnetic-field gradients make local field strength, and thus resonance frequency or phase evolution, depend on position. This allows the measured signal to carry spatial information; without an appropriate gradient that positional distinction is absent, while the qualitative explanation does not require Fourier reconstruction or quantitative contrast analysis.
  - Observable performance (DE): Die lernende Person ordnet in einer neuen einfachen Orts-Frequenz- oder Orts-Phasen-Tabelle Signalkomponenten den Positionen zu, sagt für umgekehrte beziehungsweise anders ausgerichtete Gradienten die Änderung der Codierung voraus und benennt ohne Gradienten die fehlende Ortsinformation.
  - Observable performance (EN): In a fresh simple position-frequency or position-phase table, the learner assigns signal components to positions, predicts the change in encoding when gradients are reversed or redirected, and identifies the missing positional information when no gradient is present.

**Coverage expectations**

- required expectations: `static-field-establishes-net-ensemble-magnetization`, `resonant-rf-excitation-tips-net-magnetization`, `relaxing-transverse-magnetization-produces-measured-signal`, `gradients-encode-position-in-frequency-or-phase`
- alternative expectation groups: None
- minimum independent demonstrations: 3
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `sequence-component`: Statisches Feld, resonanter Hochfrequenzpuls, Relaxations- und Empfangsphase oder Magnetfeldgradient einzeln und in geänderter Reihenfolge / Static field, resonant radio-frequency pulse, relaxation and reception phase, or magnetic-field gradient alone and in changed sequence
- `resonance-condition`: Passende Resonanzfrequenz, deutliche Verstimmung oder durch lokale Feldänderung verschobene Resonanzbedingung / Matching resonance frequency, substantial detuning, or resonance condition shifted by a local field change
- `gradient-geometry`: Positiver, umgekehrter oder auf eine andere Raumachse gelegter Gradient sowie fehlender Gradient / Positive, reversed, or differently oriented spatial gradient, and absence of a gradient
- `representation-chain`: Ensemble-Magnetisierungsskizze, Sequenzzeitlinie, Empfangssignal oder einfache Orts-Frequenz- beziehungsweise Orts-Phasen-Zuordnung / Ensemble-magnetization diagram, sequence timeline, received signal, or simple position-frequency or position-phase mapping

**Application cases**

- `qualitative-mri-sequence-ordering`
  - Task demand (DE): Vier neu gezeichnete Sequenzkarten zeigen B0 mit Netto-Magnetisierung, einen resonanten Hochfrequenzpuls, ein abklingendes Empfangssignal und einen Ortsgradienten. Ordne die Karten zu einer physikalisch sinnvollen qualitativen MRT-Kette und erkläre für jede Karte, welche Systemgröße verändert oder gemessen wird.
  - Task demand (EN): Four newly drawn sequence cards show B0 with net magnetization, a resonant radio-frequency pulse, a decaying received signal, and a spatial gradient. Arrange the cards into a physically meaningful qualitative MRI chain and explain for each card which system quantity is changed or measured.
  - Expected performance (DE): Die lernende Person beginnt mit der Ensemble-Netto-Magnetisierung im statischen Feld, ordnet die resonante Auslenkung vor das Relaxationssignal, beschreibt das Empfangssignal als Messgröße und weist dem Gradienten die Ortscodierung statt die Erzeugung der Kernspins zu.
  - Expected performance (EN): The learner begins with ensemble net magnetization in the static field, places resonant tipping before the relaxation signal, describes the received signal as the measured quantity, and assigns spatial encoding rather than creation of nuclear spins to the gradient.
  - Understanding focus (DE): Die Sequenzprüfung zeigt, ob die MRT-Schritte als Kausalkette mit getrennten Rollen statt als ungeordnete Begriffsliste verstanden werden.
  - Understanding focus (EN): The sequence task reveals whether the MRI steps are understood as a causal chain with distinct roles rather than an unordered list of terms.
- `reversed-gradient-position-frequency-map`
  - Task demand (DE): Eine sichere Simulation zeigt drei gleichartige Probenorte entlang einer Achse und ihre lokalen Resonanzfrequenzen bei einem linearen Gradienten. Ordne die Frequenzen den Orten zu, kehre anschließend das Gradientenvorzeichen um und sage die neue Zuordnung voraus, ohne eine vollständige Bildrekonstruktion durchzuführen.
  - Task demand (EN): A safe simulation shows three similar sample positions along one axis and their local resonance frequencies under a linear gradient. Assign the frequencies to positions, then reverse the gradient sign and predict the new mapping without performing a full image reconstruction.
  - Expected performance (DE): Die lernende Person verbindet lokale Feldstärke, Resonanzfrequenz und Position, kehrt bei umgekehrtem Gradienten die räumliche Reihenfolge der Frequenzzuordnung begründet um und belässt die Netto-Magnetisierungs- und Relaxationserklärung unverändert.
  - Expected performance (EN): The learner connects local field strength, resonance frequency, and position, justifiably reverses the spatial ordering of the frequency mapping when the gradient is reversed, and leaves the net-magnetization and relaxation explanation unchanged.
  - Understanding focus (DE): Der Vorzeichenwechsel prüft den Transfer der Ortscodierung und trennt ihn von Anregung und Signalentstehung.
  - Understanding focus (EN): Reversing the sign tests transfer of spatial encoding and separates it from excitation and signal generation.
- `off-resonance-and-missing-gradient-diagnosis`
  - Task demand (DE): Zwei simulierte MRT-Varianten werden verglichen: In A liegt die Hochfrequenz deutlich neben der angegebenen Resonanz, in B ist die Anregung resonant, aber der Ortsgradient fehlt. Sage qualitativ voraus, welche Stufe der Signalkette jeweils beeinträchtigt ist und welche Information deshalb fehlt.
  - Task demand (EN): Two simulated MRI variants are compared: in A the radio frequency is well away from the supplied resonance, while in B excitation is resonant but the spatial gradient is absent. Qualitatively predict which stage of the signal chain is impaired in each case and what information is therefore missing.
  - Expected performance (DE): Die lernende Person erwartet in A eine schwache oder fehlende Auslenkung und damit ein entsprechend schwaches Signal, in B dagegen ein Ensemble-Signal ohne die vorgesehene räumliche Unterscheidung. Sie verwechselt Resonanzbedingung und Gradientencodierung nicht und fordert keine quantitative Kontrast- oder Fourier-Auswertung.
  - Expected performance (EN): The learner expects weak or absent tipping in A and thus a correspondingly weak signal, but in B an ensemble signal without the intended spatial distinction. The learner does not confuse resonance condition with gradient encoding and does not require quantitative contrast or Fourier analysis.
  - Understanding focus (DE): Die zwei unterschiedlichen Ausfälle prüfen, ob Anregung und Ortscodierung kausal getrennt und auf neue Bedingungen übertragen werden.
  - Understanding focus (EN): The two different failures test whether excitation and spatial encoding are causally separated and transferred to fresh conditions.
## Page 17: Ladungsträger in Magnetfeldern bei beliebigem Eintrittswinkel beschreiben

- Full learning-goal ID: `7fe6f8a1-5580-4e37-bf8e-9772964a6b0a`
- Goal fingerprint: `sha256:1eb5d0c364344a666d54e06264adb3c91cac98892bc23bcce85e47140c7d81f0`
- Page fingerprint: `sha256:15630ea5b9aab519970e431412ed979311d52c29e1b90e553cc73f8a5851db7f`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann die Geschwindigkeit eines geladenen Teilchens beim Eintritt in ein homogenes Magnetfeld in feldparallele und feldsenkrechte Komponenten zerlegen und daraus mithilfe der Lorentzkraft Gerad-, Kreis- oder Schraubenbahnen qualitativ deuten.

### Visualization

/assets/goal-visualizations/physik/7fe6f8a1-5580-4e37-bf8e-9772964a6b0a/7fe6f8a1-5580-4e37-bf8e-9772964a6b0a.jpg

- original digest: `sha256:0d642d4cec5c2c37dbfbcec4545716359263a4da3eeac96f07096636c13b462b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Lorentzkraft auf freie Ladungen — `8c9394cb-f54a-508d-9750-4c49e31b3fa9` (outside this book)
- Vektoren im räumlichen Koordinatensystem als Tupel angeben und deuten — `19f170e4-b88f-4c06-b72a-ce6923748bb4` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Schraubenbahnen aus Komponenten vorhersagen — `26a6cfcb-bc18-5a9b-b423-278123364f7c` (outside this book)
- Q1-Klausuraufgaben Physik selbstständig lösen — `d441ee2f-9230-5751-832b-5b0b5cf14605` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4747e4e2d3675d14b5dafc780b41df15473648cbb65b6fdb49dc17ef0b38b302`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `velocity-decomposes-relative-to-field`
  - Essential understanding (DE): Die Geschwindigkeit wird relativ zu B in v_parallel und v_perp zerlegt. Nur v_perp erfährt eine magnetische Krümmung; v_parallel bleibt im homogenen Feld unverändert.
  - Essential understanding (EN): Velocity is decomposed relative to B into v_parallel and v_perp. Only v_perp undergoes magnetic curvature; v_parallel remains unchanged in a uniform field.
  - Observable performance (DE): Die lernende Person konstruiert aus einem gegebenen Geschwindigkeitsvektor beide Komponenten mit klarer Feldrichtung und erklärt, welche Komponente welche Bahninformation trägt.
  - Observable performance (EN): From a given velocity vector, the learner constructs both components with a clear field direction and explains which component carries which trajectory information.
- `components-map-to-straight-circular-or-helical-path`
  - Essential understanding (DE): Reine Parallelbewegung ergibt eine Gerade, reine Senkrechtbewegung einen Kreis und ihre Überlagerung eine Schraubenbahn. Radius und Vorschub werden durch unterschiedliche Komponenten bestimmt.
  - Essential understanding (EN): Pure parallel motion gives a straight line, pure perpendicular motion a circle, and their superposition a helix. Radius and axial advance are determined by different components.
  - Observable performance (DE): Die lernende Person übersetzt Komponentenwerte in eine räumlich konsistente Bahn und erläutert Radius, Achsenrichtung und Steigung, ohne Feldlinien als materielle Führungsbahnen zu behandeln.
  - Observable performance (EN): The learner translates component values into a spatially consistent path and explains radius, axis direction, and pitch without treating field lines as material guide tracks.
- `sign-and-reversal-change-selected-features`
  - Essential understanding (DE): Ladungsvorzeichen oder Feldumkehr kehren den Umlaufsinn um; eine Umkehr von v_parallel ändert die Vorschubrichtung. Geschwindigkeitsbetrag und magnetisch unveränderte Energie bleiben im idealisierten Feld erhalten.
  - Essential understanding (EN): Charge sign or field reversal reverses the sense of rotation; reversing v_parallel changes the direction of axial advance. Speed magnitude and magnetically unchanged energy remain conserved in the idealized field.
  - Observable performance (DE): Für einen neuen Vorzeichen-, Feld- oder Winkelwechsel sagt die lernende Person getrennt voraus, welche Bahneigenschaften wechseln und welche erhalten bleiben, und konstruiert die neue Bahn.
  - Observable performance (EN): For a fresh change of sign, field, or angle, the learner separately predicts which trajectory features change and which remain, and constructs the new path.

**Coverage expectations**

- required expectations: `velocity-decomposes-relative-to-field`, `components-map-to-straight-circular-or-helical-path`, `sign-and-reversal-change-selected-features`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `entry-angle`: 0°, 90° oder ein schräger Eintrittswinkel / 0°, 90°, or an oblique entry angle
- `charge-and-field-sign`: Positive oder negative Ladung und normale oder umgekehrte Feldrichtung / Positive or negative charge and normal or reversed field direction
- `representation-form`: Vektorangaben, perspektivische Skizze oder Komponenten-Zeitbeschreibung / Vector data, perspective sketch, or component-based time description

**Application cases**

- `vector-to-helix-construction`
  - Task demand (DE): B zeigt in positive z-Richtung; für ein positives Teilchen sind v_z und eine v_x-Komponente angegeben. Zerlege v, konstruiere die Schraubenbahn und erkläre Radius, Vorschub und Umlaufsinn.
  - Task demand (EN): B points in the positive z direction; v_z and a v_x component are given for a positive particle. Decompose v, construct the helix, and explain radius, axial advance, and sense of rotation.
  - Expected performance (DE): Die lernende Person ordnet v_z dem unveränderten Vorschub und v_x der Kreisbewegung zu, zeichnet eine konsistente Helix und bestimmt den Umlaufsinn aus q(v×B).
  - Expected performance (EN): The learner assigns v_z to unchanged axial advance and v_x to circular motion, draws a consistent helix, and determines the sense of rotation from q(v×B).
  - Understanding focus (DE): Der Fall prüft die eigenständige Übersetzung von Vektoren in eine räumliche Bahn ohne Bildvorlage.
  - Understanding focus (EN): The case tests independent translation from vectors to a spatial path without a supplied image.
- `angle-and-sign-transfer`
  - Task demand (DE): Eine negative Ladung tritt zunächst senkrecht und danach unter kleinerem Winkel zu B ein; anschließend wird B umgekehrt. Vergleiche Bahnform, Radiusanteil, Vorschub und Umlaufsinn in allen drei Situationen.
  - Task demand (EN): A negative charge enters first perpendicularly and then at a smaller angle to B; B is then reversed. Compare trajectory form, radial component, axial advance, and sense of rotation in all three situations.
  - Expected performance (DE): Die lernende Person wechselt vom Kreis zur Schraube, verbindet den kleineren senkrechten Anteil mit kleinerem Radius, hält die parallele Bewegung getrennt und kehrt bei Feldumkehr den Umlaufsinn korrekt um.
  - Expected performance (EN): The learner changes from circle to helix, links the smaller perpendicular component to a smaller radius, keeps the parallel motion separate, and correctly reverses the sense of rotation when the field is reversed.
  - Understanding focus (DE): Der Transfer prüft selektive Änderungen statt einer pauschalen Umkehr der gesamten Bewegung.
  - Understanding focus (EN): The transfer tests selective changes rather than blanket reversal of the entire motion.
## Page 18: Bildentstehung bei der Lochkamera qualitativ beschreiben

- Full learning-goal ID: `1ab5f599-0927-579d-94cc-feecdf3b5603`
- Goal fingerprint: `sha256:e00476ca657205960cd403afca1eb41dbf6a29c2dfaa734906409094d61577ff`
- Page fingerprint: `sha256:8355d3bb65001f5e245de65ad2493eb2ccc9cf12ffca17e2a2b9aecb232f3d68`
- Topic path: Aktuelle Physikziele

### Canonical description

Die lernende Person kann mit dem Strahlenmodell erklären, wie Licht von verschiedenen Gegenstandspunkten geradlinig durch die kleine Öffnung zu entsprechenden Bildpunkten auf dem Schirm gelangt und warum dabei ein umgekehrtes Bild entsteht.

### Visualization

/assets/goal-visualizations/physik/1ab5f599-0927-579d-94cc-feecdf3b5603/1ab5f599-0927-579d-94cc-feecdf3b5603.jpg

- original digest: `sha256:1c7b551b08f499f427aebccef62bc77ddc589f3564981eb11695c759987a4123`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Lichtwege mit dem Strahlenmodell darstellen und vorhersagen — `79cb1695-f985-443a-b93e-27b57ab474b7` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Lochkamera und Auge vergleichen — `35dd0a33-e5d5-53b9-8438-3d339173db1b` (outside this book)
- Sek-I-Abschlussaufgaben Physik selbstständig lösen — `3631c8f7-ff48-57ff-b7ee-8397ff1d166a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:bf8900df29fcd3cfbaef658875ac80e75723bdab04449e048dea9eb6b3f72190`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `ray-model-and-aperture-selection`
  - Essential understanding (DE): Im betrachteten homogenen Bereich breitet sich Licht geradlinig aus. Die kleine Öffnung lässt von jedem Gegenstandspunkt nur ein schmales Bündel möglicher Lichtwege auf den Schirm gelangen; gezeichnete Strahlen sind ausgewählte Modelllinien für diese Ausbreitungsrichtungen.
  - Essential understanding (EN): Within the homogeneous region considered, light propagates in straight lines. The small aperture allows only a narrow bundle of possible light paths from each object point to reach the screen; drawn rays are selected model lines for these directions of propagation.
  - Observable performance (DE): Die lernende Person entwickelt für einen neuen Lochkamera-Aufbau ein Strahlenmodell, erklärt die Auswahl der dargestellten Wege durch die Öffnung und grenzt die Modelllinien von beobachtbaren materiellen Objekten ab.
  - Observable performance (EN): For a fresh pinhole-camera setup, the learner develops a ray model, explains why the represented paths are selected by the aperture, and distinguishes the model lines from observable material objects.
- `point-mapping-and-inversion`
  - Essential understanding (DE): Die geradlinigen Wege durch die Öffnung ordnen jedem Gegenstandspunkt einen Bildpunkt auf dem Schirm zu. Wege von oberen und unteren sowie linken und rechten Gegenstandspunkten kreuzen sich an der Öffnung, sodass ein reelles, umgekehrtes Bild ohne Linse entsteht.
  - Essential understanding (EN): The straight paths through the aperture map each object point to an image point on the screen. Paths from upper and lower as well as left and right object points cross at the aperture, producing a real, inverted image without a lens.
  - Observable performance (DE): Die lernende Person konstruiert von mindestens zwei markanten Punkten eines unbekannten Gegenstands Lichtwege durch die Öffnung, bestimmt die zugehörigen Bildpunkte und erklärt Lage und Orientierung des vollständigen Bildes aus der punktweisen Zuordnung.
  - Observable performance (EN): From at least two distinctive points of an unfamiliar object, the learner constructs light paths through the aperture, determines the corresponding image points, and explains the position and orientation of the complete image from the point-to-point mapping.
- `geometry-controls-image-size`
  - Essential understanding (DE): Bei gleichbleibender kleiner Öffnung bestimmen die Abstände zwischen Gegenstand, Öffnung und Schirm die relative Bildgröße im geometrischen Strahlenmodell. Eine Vorhersage muss aus ähnlichen Strahlendreiecken beziehungsweise deren qualitativer Geometrie folgen, nicht aus einer Linsenregel.
  - Essential understanding (EN): With the small aperture unchanged, the distances among object, aperture, and screen determine relative image size in the geometric ray model. A prediction must follow from similar ray triangles or their qualitative geometry, not from a lens rule.
  - Observable performance (DE): Die lernende Person sagt bei verändertem Gegenstands- oder Schirmabstand die Richtung der Bildgrößenänderung voraus, prüft sie mit einer neuen Strahlenkonstruktion und begründet, welche Abstände dabei festgehalten wurden.
  - Observable performance (EN): When object or screen distance changes, the learner predicts the direction of the image-size change, checks it with a new ray construction, and justifies which distances were held fixed.

**Coverage expectations**

- required expectations: `ray-model-and-aperture-selection`, `point-mapping-and-inversion`, `geometry-controls-image-size`
- alternative expectation groups: None
- minimum independent demonstrations: 3
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `object-shape-and-orientation`: Asymmetrischer Gegenstand mit verschiedenen markanten Punkten und wechselnder Orientierung / Asymmetric object with different distinctive points and changing orientation
- `screen-distance`: Abstand zwischen Öffnung und Schirm wird bei gleicher Gegenstandslage verändert / Distance between aperture and screen changes while object position remains fixed
- `object-distance`: Gegenstandsabstand wird bei unveränderter Kameralänge verändert / Object distance changes while camera length remains unchanged
- `representation-direction`: Vom Aufbau zur Strahlenkonstruktion, von unvollständigen Strahlen zum Bild oder vom Bild zurück zu passenden Gegenstandspunkten / From setup to ray construction, from incomplete rays to the image, or from the image back to matching object points

**Application cases**

- `asymmetric-object-construction`
  - Task demand (DE): Ein neuer asymmetrischer Gegenstand steht vor einer Lochkamera. Für drei markante Gegenstandspunkte sind die Lichtwege zu konstruieren und Bildlage, Orientierung und reelle Bildart zu erklären.
  - Task demand (EN): A fresh asymmetric object stands in front of a pinhole camera. Construct the light paths for three distinctive object points and explain image position, orientation, and its real nature.
  - Expected performance (DE): Die lernende Person führt von jedem Punkt einen repräsentativen Weg durch die Öffnung zum Schirm, ordnet die Bildpunkte korrekt zu und erklärt die Umkehrung aus dem Kreuzen der Wege an der Öffnung statt aus einer Linsenwirkung.
  - Expected performance (EN): The learner traces one representative path from each point through the aperture to the screen, maps the image points correctly, and explains inversion from the crossing of paths at the aperture rather than from a lens effect.
  - Understanding focus (DE): Die asymmetrische Form macht vollständige punktweise Zuordnung statt Nachzeichnen eines vertrauten Pfeils sichtbar.
  - Understanding focus (EN): The asymmetric shape exposes complete point-to-point mapping rather than copying a familiar arrow.
- `longer-camera-transfer`
  - Task demand (DE): Der Schirm einer Lochkamera wird bei unveränderter Öffnung und Gegenstandslage weiter von der Öffnung entfernt. Vor der Konstruktion ist die Änderung von Bildgröße und Orientierung vorherzusagen.
  - Task demand (EN): The screen of a pinhole camera is moved farther from the aperture while the aperture and object position remain unchanged. Predict the change in image size and orientation before constructing.
  - Expected performance (DE): Die lernende Person sagt ein größeres weiterhin umgekehrtes Bild voraus, bestätigt dies mit den weiter auseinanderlaufenden Strahlen hinter der Öffnung und benennt Gegenstandslage und Öffnung als unverändert.
  - Expected performance (EN): The learner predicts a larger image that remains inverted, confirms this with the rays spreading farther apart behind the aperture, and states that object position and aperture are unchanged.
  - Understanding focus (DE): Die Kameralängenänderung prüft geometrische Skalierung getrennt von Bildorientierung.
  - Understanding focus (EN): Changing camera length tests geometric scaling separately from image orientation.
- `farther-object-transfer`
  - Task demand (DE): Bei unveränderter Kameralänge wird derselbe Gegenstand weiter von der Lochöffnung entfernt. Die neue Bildgröße ist qualitativ vorherzusagen und mit einer Strahlenkonstruktion zu vergleichen.
  - Task demand (EN): With camera length unchanged, the same object is moved farther from the pinhole. Qualitatively predict the new image size and compare it using a ray construction.
  - Expected performance (DE): Die lernende Person sagt ein kleineres Bild bei unveränderter Umkehrung voraus, konstruiert passende Randstrahlen und erklärt die Änderung über das Verhältnis von Gegenstands- und Schirmabstand.
  - Expected performance (EN): The learner predicts a smaller image with unchanged inversion, constructs appropriate boundary rays, and explains the change through the relationship between object and screen distances.
  - Understanding focus (DE): Der geänderte Gegenstandsabstand prüft dieselbe geometrische Beziehung in einer unabhängigen Variation.
  - Understanding focus (EN): Changing object distance tests the same geometric relationship in an independent variation.

# AI review input: Physik: präzisierte Halbleiter- und Schaltungsmodelle

- Book ID: `de-gym-physik-semiconductor-corrected7-20261115-v2`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:3e25a8e65112ad3470b226d38916c2e874be5e689b4893797e6bde6b43c454f3`
- Selected goals: 7

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Leiter, Nichtleiter und Halbleiter

- Full learning-goal ID: `7badac4d-2874-5b3a-87e8-bf8f4440b2a6`
- Goal fingerprint: `sha256:0ebb0a4a1a2cc08e30ba3c36d913ddca48115b62d90e7cc8fbb3ccfcce0e04e5`
- Page fingerprint: `sha256:cfe945a195f63a3f278ee455bc5ff675146293422af293520c2d3d0a6c6b0e53`
- Topic path: Physik > Sekundarstufe I > Halbleiter und Dioden: Grundlagen

### Canonical description

Die lernende Person kann Leiter, Nichtleiter und Halbleiter anhand ihrer typischen elektrischen Leitfähigkeit unter vergleichbaren Bedingungen unterscheiden und Beispiele aus Technik und Alltag begründet zuordnen.

### Visualization

/assets/goal-visualizations/physik/7badac4d-2874-5b3a-87e8-bf8f4440b2a6/7badac4d-2874-5b3a-87e8-bf8f4440b2a6-elementary-20261115.png

- original digest: `sha256:2a9dc2fb15e90877440ec9bf166419105d2ca96ebd13cd0368b5b666af5ac4b7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Physik? – Weltverständnis & Zukunft — `5c44b9ba-9b05-4774-95d5-073230d3fc4f` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Q4 — `266b6cf8-d49d-5197-862c-9998fcf179a5` (outside this book)
- Dotierung mit einem einfachen Ladungsträgermodell erklären — `9f265f49-1342-5ba7-9c5d-54e97fdb2f19` (outside this book)
- Bändermodell und Dotierung — `df010b2b-b182-5f7e-bbe4-49b72e48c27a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:034c22c23ead3631b2c2cb9bdfa6d6e4d1607d49820ad856031ea9c47721310d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `comparable-classification`
  - Essential understanding (DE): Materialklassen werden über typische elektrische Leitfähigkeit unter vergleichbaren Bedingungen begründet; eine Kategorie ist eine Schlussfolgerung und kein Messwert.
  - Essential understanding (EN): Material classes are justified through typical electrical conductivity under comparable conditions; a category is an inference, not a measurement.
  - Observable performance (DE): Vergleicht qualitative Materialdaten bei derselben Temperatur, begründet Leiter/Halbleiter/Nichtleiter und eine dazu passende Verwendung.
  - Observable performance (EN): Compares qualitative material data at the same temperature and justifies conductor/semiconductor/insulator categories and an appropriate use.

**Coverage expectations**

- required expectations: `comparable-classification`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `new-materials`: Unbekannte Materialnamen und Anwendungen bei qualitativ hoch/mittel/sehr gering beschriebener Leitfähigkeit. / Unfamiliar material labels and applications with qualitatively high/intermediate/very low conductivity.
- `changed-condition`: Gleiche gegenüber abweichender Temperatur; fehlende Vergleichsbedingungen erkennen. / Same versus different temperature; identify missing comparison conditions.

**Application cases**

- `qualitative-common-condition`
  - Task demand (DE): Für A, B und C ist bei gleicher Temperatur und gleicher Messmethode die typische Leitfähigkeit als sehr hoch, mittel und sehr gering beschrieben. Ordne die drei Materialklassen zu und begründe die Wahl einer Leitung, einer Isolation und eines steuerbaren elektronischen Bauteils.
  - Task demand (EN): For A, B and C at the same temperature and with the same measurement method, typical conductivity is described as very high, intermediate and very low. Identify the three material classes and justify choices for a wire, insulation and a controllable electronic component.
  - Expected performance (DE): A passt typischerweise zum Leiter, B zum Halbleiter, C zum Nichtleiter. Hohe Leitfähigkeit unterstützt Leitung, geringe Isolation. B ist eine typische Materialklasse für elektronisch beeinflussbare Leitung; mittlere Leitfähigkeit allein beweist noch keine fertige Schaltfunktion. Kategorien und Verwendungen sind begründete Deutungen der dokumentierten Bedingungen.
  - Expected performance (EN): A typically fits a conductor, B a semiconductor, C an insulator. High conductivity supports conduction and low conductivity supports insulation. B is a typical material class for electronically controlled conduction; intermediate conductivity alone does not establish a complete switching function. Categories and uses are justified interpretations of the documented conditions.
  - Understanding focus (DE): Begründete qualitative Klassifikation ohne Potenznotation und ohne verdeckte Bandmodellpflicht.
  - Understanding focus (EN): Reasoned qualitative classification without power notation or a hidden band-model requirement.
- `condition-limited-transfer`
  - Task demand (DE): Bei einem neuen Satz D/E/F sind die Angaben für D und E bei 20 °C dokumentiert, für F nur bei deutlich höherer Temperatur. D leitet typisch sehr gut, E sehr schlecht, F mittel. Prüfe, welche Einordnung der Vergleich sicher trägt und welche zusätzliche Angabe für F fehlt.
  - Task demand (EN): For a fresh set D/E/F, data for D and E are documented at 20 °C, but F only at a much higher temperature. D typically conducts very well, E very poorly, F intermediately. Assess which classifications the comparison supports and what additional information is needed for F.
  - Expected performance (DE): D kann unter der dokumentierten Bedingung als Leiter und E als Nichtleiter eingeordnet werden. Für die direkte gemeinsame Rangfolge und bedingungsgleiche Zuordnung von F fehlt sein Verhalten bei 20 °C oder ein dokumentiertes Temperaturmodell. Die Person fordert diesen Nachweis und behauptet nicht, jede mittlere Einzelmessung bei beliebiger Temperatur beweise die Stoffklasse.
  - Expected performance (EN): D can be classified as a conductor and E as an insulator under the documented condition. A direct common ranking and like-for-like classification of F require its behaviour at 20 °C or a documented temperature model. The learner requests this evidence rather than claiming any single intermediate measurement at any temperature proves the material class.
  - Understanding focus (DE): Geänderte Temperatur als Grenze der Evidenz erkennen und gezielt Vergleichsdaten verlangen.
  - Understanding focus (EN): Recognise changed temperature as an evidence limit and request suitable comparison data.
## Page 2: Durchlass- und Sperrverhalten einer Diode an einer Kennlinie erklären

- Full learning-goal ID: `dc55adac-91a5-5cc3-ab47-be008480616f`
- Goal fingerprint: `sha256:7aed81db95b80531a3f77110669facc91ad106fda0b54e1146f84644d711f6c6`
- Page fingerprint: `sha256:37d8043ebc7af49ec68b8b21d276c4845aab4d2993a414f5b87726e18bcda0bd`
- Topic path: Physik > Sekundarstufe I > Halbleiter und Dioden: Grundlagen

### Canonical description

Die lernende Person kann aus einer vorgegebenen qualitativen Strom-Spannungs-Kennlinie einer Diode ihr Durchlass- und Sperrverhalten ablesen und damit für beide Polungen bei angegebener Diodenspannung im dargestellten Kennlinienbereich vorhersagen, ob in einem einfachen Stromkreis ein nennenswerter Strom fließt.

### Visualization

/assets/goal-visualizations/physik/dc55adac-91a5-5cc3-ab47-be008480616f/dc55adac-91a5-5cc3-ab47-be008480616f.png

- original digest: `sha256:3faaff055424e4a6a40827d798caf3e176aa020a38942b59fc5381b97f5e7bc6`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Die Gleichrichterfunktion einer Diodenschaltung erklären — `3b586f2a-60e2-5019-aa08-6a47616a1f1f` (page 3)

### Prerequisites outside this book

- Achsen, Skalen und Einheiten lesen — `80c232f1-8f72-5829-9dbe-5a610ccab3be` (outside this book)
- Zwischen Stromkreis und Schaltplan übersetzen — `69f8f59c-b0c3-5b0b-82db-834a0e655736` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Diodenpolung aus einer Kennlinie beurteilen — `8670cff6-fe9c-5f7e-8cba-d170134965a6` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e0ab44a99f075c8c9304487ed076080c53beccd72021104cd80118e6cfb7dd6d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `voltage-point-and-polarity`
  - Essential understanding (DE): Polung ordnet einen Bereich der vorgegebenen Kennlinie zu; erst die angegebene Diodenspannung und die zugehörige Stromangabe entscheiden über nennenswerten Strom. Positive Spannung allein genügt nicht.
  - Essential understanding (EN): Polarity selects a region of the supplied characteristic; the stated diode voltage and corresponding current determine whether current is appreciable. Positive voltage alone is insufficient.
  - Observable performance (DE): Verknüpft die markierten A/K-Bezüge des neuen Schaltplans mit konkreten Punkten der Kennlinie und unterscheidet kleinen sowie nennenswerten Durchlassstrom vom kleinen Sperrstrom.
  - Observable performance (EN): Connects marked A/K references in a new circuit diagram with specific characteristic points and distinguishes small and appreciable forward currents from small reverse current.
- `range-and-transfer`
  - Essential understanding (DE): Kennlinien sind an Bauteil, Temperatur und dargestellten Spannungsbereich gebunden. Ein kleiner Sperrstrom ist nicht exakt null; ein Diagramm begründet weder eine universelle 0,7 V-Schwelle noch Prognosen außerhalb seines Bereichs.
  - Essential understanding (EN): Characteristics are bound to component, temperature and plotted voltage range. Small reverse current is not exactly zero; one plot establishes neither a universal 0.7 V threshold nor predictions beyond its range.
  - Observable performance (DE): Überträgt die Punktdeutung auf gespiegelte Beschaltung und eine andere gegebene Kennlinie; benennt fehlende Grundlage außerhalb des Bereichs statt zu extrapolieren.
  - Observable performance (EN): Transfers point interpretation to a mirrored circuit and another supplied characteristic; identifies missing evidence outside the range instead of extrapolating.

**Coverage expectations**

- required expectations: `voltage-point-and-polarity`, `range-and-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `forward-position`: Zwei positive Diodenspannungen auf flachem und steilem Teil derselben Kennlinie. / Two positive diode voltages on shallow and steep parts of the same characteristic.
- `new-diode-layout`: Neue Kennlinie mit anderem Durchlassanstieg und gespiegelten A/K-Anschlüssen; alle Spannungen beziehen sich auf A gegen K. / Fresh characteristic with a different forward rise and mirrored A/K terminals; all voltages reference A relative to K.

**Application cases**

- `three-stated-operating-points`
  - Task demand (DE): Ein geschlossener strombegrenzter Kleinspannungskreis und eine Kennlinie für eine Diode bei konstanter Temperatur sind vorgegeben. U_D ist A gegen K, I_D A nach K. Die dargestellte Kennlinie reicht von −1 V bis +0,8 V und gibt bei +0,2 V einen sehr kleinen positiven, bei +0,6 V einen nennenswerten positiven und bei −0,8 V einen sehr kleinen negativen Strom an. Deute alle drei Betriebspunkte im Schaltplan und prüfe: Positive Diodenspannung bedeutet immer nennenswerten Strom.
  - Task demand (EN): A closed current-limited low-voltage circuit and a characteristic for one diode at fixed temperature are supplied. U_D references A to K and I_D A to K. The plotted range is −1 V to +0.8 V, giving very small positive current at +0.2 V, appreciable positive current at +0.6 V and very small negative current at −0.8 V. Interpret all three operating points in the circuit and assess: Positive diode voltage always means appreciable current.
  - Expected performance (DE): Beide positiven Spannungen sind Durchlasspolung, aber nur der steile Betriebspunkt zeigt hier nennenswerten Strom. Der negative Punkt ist Sperrpolung mit kleinem Strom gegen die Bezugsrichtung. Die Person begründet jede Aussage am angegebenen Punkt, lehnt die pauschale Durchlassregel ab und behauptet keine exakte Null.
  - Expected performance (EN): Both positive voltages represent forward bias, but only the steep-branch point shows appreciable current here. The negative point is reverse bias with small current opposite the reference. The learner justifies every conclusion at the stated point, rejects the blanket forward-bias rule and claims no exact zero.
  - Understanding focus (DE): Gleiche Polung, unterschiedliche Stromaussage: tatsächliche Kennlinienanwendung statt Polungsetikett.
  - Understanding focus (EN): Same polarity, different current conclusion: actual characteristic use rather than a polarity label.
- `mirrored-second-characteristic`
  - Task demand (DE): Eine neue Diode ist räumlich gespiegelt; A/K bleiben bezeichnet. Ihre bereitgestellte Kennlinie bei festgehaltener Temperatur reicht von −1 V bis +2,4 V. Bei +0,6 V ist der Strom sehr klein, bei +2,1 V nennenswert; bei −0,7 V ist ein sehr kleiner negativer Strom angegeben. Bestimme die drei Fälle und beurteile Prognosen für −3 V sowie die allgemeine 0,7 V-Regel.
  - Task demand (EN): A new diode is mirrored spatially while A/K remain labelled. Its supplied fixed-temperature characteristic ranges from −1 V to +2.4 V. Current is very small at +0.6 V and appreciable at +2.1 V; a very small negative current is given at −0.7 V. Determine all three cases and assess predictions for −3 V and the universal 0.7 V rule.
  - Expected performance (DE): Die Person bestimmt Polung und Strom jeweils aus Anschlussdefinition und neuer Kennlinie. Die geänderte Durchlasslage widerlegt eine universelle Schwelle. Für −3 V liegt kein dargestellter Wert vor; ohne weitere Daten wird weder fortgesetzte Sperrung noch Durchbruch behauptet. Es werden keine eigenen Messungen ausgegeben.
  - Expected performance (EN): The learner determines polarity and current from terminal definitions and the new curve. The shifted forward rise refutes a universal threshold. No plotted value exists for −3 V; without more data neither continued blocking nor breakdown is claimed. No personal measurements are asserted.
  - Understanding focus (DE): Echter Bauteil-/Layoutwechsel und explizite Bereichsgrenze bei bereitgestellten Daten.
  - Understanding focus (EN): A genuine component/layout change and explicit range boundary with supplied data.
## Page 3: Die Gleichrichterfunktion einer Diodenschaltung erklären

- Full learning-goal ID: `3b586f2a-60e2-5019-aa08-6a47616a1f1f`
- Goal fingerprint: `sha256:d62b0b3dbd3e7e69aee071dd7b1e9f3f9553ba3669e905d98bc3d9a0e7b4daef`
- Page fingerprint: `sha256:a6f17a0b6334859acc0eb145bf23b20395d7b810267a299435586a5333dbc5a5`
- Topic path: Physik > Bundeslandspezifische Ergänzungen > Sekundarstufe I > Dioden: belegte Quellenanteile

### Canonical description

Die lernende Person kann an einer vorgegebenen einfachen Gleichrichterschaltung bei bekanntem Eingangsspannungsverlauf aus der Polung der Dioden die Stromwege und unter den angegebenen Bauteilannahmen den zeitlichen Verlauf der Spannung am Verbraucher erklären.

### Visualization

/assets/goal-visualizations/physik/3b586f2a-60e2-5019-aa08-6a47616a1f1f/3b586f2a-60e2-5019-aa08-6a47616a1f1f.png

- original digest: `sha256:026c52e440415e75f67b201dab4cf4809751cb26fcfd78f41e9a9941430f4f66`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Durchlass- und Sperrverhalten einer Diode an einer Kennlinie erklären — `dc55adac-91a5-5cc3-ab47-be008480616f` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Gleich- und Wechselspannungsversorgungen einordnen — `4a42cddd-7827-5204-87e5-8d9eac7792f1` (outside this book)

### Direct reverse prerequisites outside this book

- Stromwege eines Einweggleichrichters begründen — `18fb1470-5a03-5277-9486-ae74c63c8a8c` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a1cfacfcb3f774e30412780c485c81b8ea3e67db5c23ab829060d9e080aed801`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `path-voltage`
  - Essential understanding (DE): Diodenpolung und geschlossener Kreis entscheiden über den Strom; ohne Energiespeicher bleibt eine gleichgerichtete Spannung zeitabhängig.
  - Essential understanding (EN): Diode bias and a closed circuit determine current; without energy storage a rectified voltage remains time dependent.
  - Observable performance (DE): Die lernende Person verfolgt in einer vorgegebenen neuen einfachen Schaltung beide Halbwellen, konstruiert die Ausgangswellenform und kennzeichnet ideale Diode, Last und Spannungsbezugsrichtung.
  - Observable performance (EN): In a supplied fresh simple circuit, the learner traces both half-cycles, constructs the output waveform and identifies the ideal diode, load and voltage-reference direction.
- `reversed-reference`
  - Essential understanding (DE): Das Ausgangsvorzeichen hängt vom leitenden Pfad und der festgelegten Spannungsdefinition ab, nicht vom Wort Gleichrichter.
  - Essential understanding (EN): Output sign depends on the conducting path and the specified voltage definition, not on the word rectifier.
  - Observable performance (DE): Beim Umdrehen nur einer Diode sagt die lernende Person die nun übertragenen Halbwellen voraus, erklärt das Vorzeichen und benennt die Grenze des idealisierten spannungsabfallfreien Modells.
  - Observable performance (EN): When only a diode is reversed, the learner predicts the half-cycles now transmitted, explains the sign and states the limitation of the ideal zero-forward-drop model.

**Coverage expectations**

- required expectations: `path-voltage`, `reversed-reference`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `orientation-waveform`: Diodenorientierung oder Spannungsmessrichtung bei unverändertem Lastkreis ändern. / Change diode orientation or voltage-reference direction while retaining the load circuit.

**Application cases**

- `half-wave`
  - Task demand (DE): Leite für eine materialgestützt vorgegebene Einwegschaltung die Ausgangsspannung aus einer neuen Eingangsfolge ab.
  - Task demand (EN): Derive output voltage for a supplied half-wave circuit from a fresh input sequence.
  - Expected performance (DE): Verknüpfe Leit-/Sperrzustände mit vollständigen Stromwegen und einer begründeten pulsierenden Wellenform.
  - Expected performance (EN): Connect conducting/blocking states to complete current paths and a justified pulsating waveform.
  - Understanding focus (DE): Gleichrichtung ist nicht automatische Glättung.
  - Understanding focus (EN): Rectification is not automatic smoothing.
- `diode-reversed`
  - Task demand (DE): Nur die Diode wird umgedreht; dieselbe Ausgangsmessrichtung bleibt. Prüfe die Behauptung, der Ausgang müsse weiterhin positiv sein.
  - Task demand (EN): Only the diode is reversed; the output-reference direction is retained. Test the claim that output must remain positive.
  - Expected performance (DE): Konstruiere die negativen Halbwellen und begründe sie aus dem umgekehrten Laststromweg; reale Vorwärtsspannung begrenzt nur die Idealisierung.
  - Expected performance (EN): Construct the negative half-cycles and justify them through the reversed load-current path; real forward drop limits the idealisation.
  - Understanding focus (DE): Vorzeichen und Wellenform aus Schaltung statt Etikett herleiten.
  - Understanding focus (EN): Derive sign and waveform from the circuit rather than its label.
## Page 4: Supraleitung qualitativ verstehen

- Full learning-goal ID: `853dbe54-85b0-59ab-8f3a-000c2b7746ec`
- Goal fingerprint: `sha256:0bbac67d7a60096e3f2e04910f76dfdfcf50bb9b3e160cf279a15c7ed3620dcf`
- Page fingerprint: `sha256:d265ce5164640c6f7da5f0398f55c442c2d6f24b597ec4b1db3d13d0b4a10987`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Festkörperphysik

### Canonical description

Die lernende Person kann qualitativ beschreiben, dass ein Supraleiter unterhalb seiner kritischen Temperatur bei hinreichend kleinem Strom und Magnetfeld keinen elektrischen Gleichstromwiderstand zeigt und im Meißner-Zustand magnetischen Fluss aus seinem Inneren verdrängt, und damit einfache Anwendungen und Beobachtungen erläutern.

### Visualization

/assets/goal-visualizations/physik/853dbe54-85b0-59ab-8f3a-000c2b7746ec/853dbe54-85b0-59ab-8f3a-000c2b7746ec.jpg

- original digest: `sha256:9da94522e0bd0164aede4797bf15b03624cb1d47f3ef05fe80c0092960201776`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Magnetische Felder und Feldlinienbilder — `0f6b798b-594e-5480-8c5f-95e2486a4d85` (outside this book)
- Bändermodell und Dotierung — `df010b2b-b182-5f7e-bbe4-49b72e48c27a` (outside this book)

### Direct reverse prerequisites outside this book

- Festkoerperphysik und Halbleiterelektronik — `0f5346d6-de1b-5e38-aaba-68db205e594b` (outside this book)
- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:7ff508bcf6297f6a8b2bde91225d867efe56a37e57307fc2d1254da297c3e9b7`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `transition`
  - Essential understanding (DE): Im vereinfachten supraleitenden Gleichstromzustand verschwindet der Widerstand unterhalb einer materialabhängigen kritischen Temperatur, solange die übrigen kritischen Bedingungen erfüllt sind.
  - Essential understanding (EN): In the simplified superconducting DC state, resistance vanishes below a material-dependent critical temperature provided the other critical conditions are met.
  - Observable performance (DE): Die lernende Person erklärt einen vorgegebenen R-T-Verlauf und sagt bei Überschreiten der kritischen Temperatur eine qualitative Zustandsänderung samt Anwendungsgrenze voraus.
  - Observable performance (EN): The learner explains a supplied R-T trace and predicts a qualitative state change and application limit when the critical temperature is exceeded.
- `magnetism`
  - Essential understanding (DE): Supraleitung umfasst besonderes magnetisches Verhalten wie den Meissner-Effekt; Levitation allein ist ohne Kenntnis des Aufbaus kein eindeutiger Nachweis und nicht bloß eine Folge kleinen Widerstands.
  - Essential understanding (EN): Superconductivity includes distinctive magnetic behaviour such as the Meissner effect; levitation alone is not conclusive without knowing the setup and is not merely a consequence of low resistance.
  - Observable performance (DE): Die lernende Person deutet eine passend dokumentierte Magnetbeobachtung zusammen mit Temperatur-/Widerstandsdaten und erklärt eine einfache Anwendung unter den angegebenen Modellbedingungen.
  - Observable performance (EN): The learner interprets an appropriately documented magnetic observation together with temperature/resistance data and explains a simple application under the stated model conditions.

**Coverage expectations**

- required expectations: `transition`, `magnetism`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `temperature-crossing`: Abkühlen beziehungsweise Erwärmen über T_c bei festgehaltenen, geeigneten Strom- und Feldbedingungen. / Cooling or warming across T_c with fixed suitable current and field conditions.
- `observation-specificity`: Dokumentierter supraleitender Aufbau gegenüber einer Schwebe-Beobachtung mit unbekanntem Mechanismus. / Documented superconducting setup versus a levitation observation with an unknown mechanism.

**Application cases**

- `resistance-transition`
  - Task demand (DE): Ein bereitgestelltes idealisiertes Gleichstromdiagramm eines Modellmaterials zeigt R=0 unter 90 K und R>0 darüber; Strom und Magnetfeld liegen im geeigneten Bereich. Ein dokumentierter Aufbau verwendet das Material bei 80 K als supraleitenden Leiter. Erkläre die Beobachtung und sage die Auswirkung einer Erwärmung auf 95 K auf diese Anwendung voraus.
  - Task demand (EN): A supplied idealised DC diagram of a model material shows R=0 below 90 K and R>0 above; current and magnetic field are in the suitable range. A documented setup uses the material at 80 K as a superconducting conductor. Explain the observation and predict the effect on this application of warming to 95 K.
  - Expected performance (DE): Ordnet 80 K dem supraleitenden und 95 K dem normalleitenden Zustand zu, erläutert den Verlust des widerstandsfreien Betriebs und trennt den idealisierten Nullwert von einer experimentellen Aussage 'unter Messgrenze'. Keine tatsächliche Kühlanlage bedienen.
  - Expected performance (EN): Classify 80 K as superconducting and 95 K as normal-conducting, explain the loss of resistance-free operation, and distinguish the idealised zero from an experimental statement 'below detection limit'. Do not operate real cooling equipment.
  - Understanding focus (DE): Kritische Zustandsbedingung, Mess-/Modellunterscheidung und eine konkrete Anwendungsgrenze.
  - Understanding focus (EN): Critical state condition, measurement/model distinction and a concrete application limit.
- `levitation-comparison`
  - Task demand (DE): Zwei neue Lehrvideos zeigen je einen schwebenden Magneten. Zu A sind ein supraleitendes Material, geeignete kleine Feldstärke, Temperatur unter T_c und magnetische Flussverdrängung dokumentiert; bei Erwärmung über T_c endet dieses Verhalten. Zu B ist nur das Schweben sichtbar, der Aufbau unbekannt. Erkläre A qualitativ und beurteile, was sich über B ableiten lässt.
  - Task demand (EN): Two fresh teaching videos each show a levitating magnet. A documents a superconducting material, a suitably small field, temperature below T_c and magnetic-flux expulsion; warming above T_c ends this behaviour. B shows levitation only, with the setup unknown. Qualitatively explain A and assess what can be inferred about B.
  - Expected performance (DE): Verknüpft As dokumentiertes Verhalten mit dem Meissner-Effekt im angegebenen Zustandsbereich und erklärt seine Temperaturabhängigkeit. Erkennt für B mehrere mögliche Mechanismen und fordert zusätzliche Material-/Temperatur-/Widerstands- oder Magnetbelege statt eines automatischen Supraleitungsbeweises.
  - Expected performance (EN): Connect A's documented behaviour with the Meissner effect in the stated regime and explain its temperature dependence. Recognise multiple possible mechanisms for B and request additional material, temperature, resistance or magnetic evidence instead of treating levitation as automatic proof of superconductivity.
  - Understanding focus (DE): Frischer Wechsel der Evidenzqualität; Phänomen, Modellzuordnung und bloß sichtbare Schwebe-Beobachtung bleiben getrennt.
  - Understanding focus (EN): Fresh change in evidence quality; phenomenon, model attribution and visible levitation alone remain distinct.
## Page 5: Einen bipolaren Transistor als Schalter funktional untersuchen

- Full learning-goal ID: `7d4d6a39-0c78-5fb0-b7bf-182ed00972f7`
- Goal fingerprint: `sha256:12d3cec0eb0b5ff21506cc0ac6188f389bf09a5373afd128d4550a6e9f334ff0`
- Page fingerprint: `sha256:8e9f370aac1805c4f4d4cef21826a7df2fde6ba3495f57009ecf4ae12b091ec0`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Festkörperphysik > Transistorschaltungen

### Canonical description

Die lernende Person kann an einem vorgegebenen npn- oder pnp-Transistoraufbau die Funktion von Basis, Kollektor und Emitter mithilfe eines einfachen Halbleitermodells erklären und daraus das Ein- und Ausschalten des Laststromkreises begründen; wenn der geltende Aufgaben- oder Lehrplanrahmen ein Schülerexperiment vorsieht, kann sie den Aufbau unter Aufsicht mit strombegrenzter Kleinspannung nach Plan herstellen und die Schaltwirkung selbst untersuchen.

### Visualization

/assets/goal-visualizations/physik/7d4d6a39-0c78-5fb0-b7bf-182ed00972f7/7d4d6a39-0c78-5fb0-b7bf-182ed00972f7.jpg

- original digest: `sha256:81a177a4e4ee2ecf2befe16093416576c8b5dbe05b9b9e31dba2c42f39304db7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Transistorverstärker analysieren — `af50bb9a-fd7b-50f5-9698-48c4efe99032` (page 6)
- Eine bistabile Transistor-Flipflop-Schaltung deuten — `c2af45aa-e3fc-5119-9159-c5a260b4135a` (page 7)

### Prerequisites outside this book

- Zwischen Stromkreis und Schaltplan übersetzen — `69f8f59c-b0c3-5b0b-82db-834a0e655736` (outside this book)
- Sperrschicht und Polung am p-n-Übergang erklären — `2084b7d4-300d-5fa0-8b8d-c480c40f853e` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfungsaufgabe: Einen Transistor als Schalter deuten — `88f27aab-8724-5a4d-8543-e49ebcb54b8e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:fe49bfd64251c32ffe6139a3ad95d5afa0dcffaa6c7d2222733860b62a2af903`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `functional-understanding`
  - Essential understanding (DE): Beim bipolaren Transistor steuert eine geeignete Basis-Emitter-Ansteuerung den Strom im Kollektor-Emitter-Lastpfad. Die Energie der Last kommt aus ihrer Versorgung; der Basiszweig ist kein mechanischer Kontakt und erzeugt die Lastenergie nicht.
  - Essential understanding (EN): In a bipolar transistor, appropriate base-emitter drive controls current in the collector-emitter load path. Load energy comes from its supply; the base branch is neither a mechanical contact nor the source of load energy.
  - Observable performance (DE): An einem vorgegebenen npn- oder pnp-Schaltbild identifiziert die lernende Person Basis, Kollektor, Emitter, Steuer- und Lastpfad und begründet anhand der angegebenen Beschaltung, wann die Lampe beziehungsweise LED ein- oder ausgeschaltet ist. Sie verknüpft die Anschlussrollen mit dem bereitgestellten dünnen Basisbereich im Halbleitermodell. Im vorgesehenen Schülerexperiment sind tatsächlich beobachteter eigener Aufbau und eigene Untersuchung unerlässlich.
  - Observable performance (EN): In a supplied npn or pnp schematic, the learner identifies base, collector, emitter, control and load paths and uses the specified circuit to justify when its lamp or LED is switched on or off. They connect terminal roles to the supplied thin base region in the semiconductor model. In the designated student experiment, an actually observed personal build and investigation are indispensable.
- `independent-transfer`
  - Essential understanding (DE): Geeignete Basisansteuerung und vertauschte Sensorwirkung; tatsächliche Untersuchung bei vorgeschriebener Schülerexperimentform.
  - Essential understanding (EN): Appropriate base drive and reversed sensor response; actual investigation when student-experiment execution is prescribed.
  - Observable performance (DE): Für einen unterbrochenen Basiszweig oder eine umgekehrte Sensorwirkung sagt die lernende Person die geänderte Schaltfunktion voraus. Sie überträgt Spannungsrichtungen nicht ungeprüft von npn auf pnp und behauptet keine universelle konstante Stromverstärkung im Schaltbetrieb.
  - Observable performance (EN): For a broken base branch or reversed sensor response, the learner predicts the altered switching behaviour. They do not transfer voltage directions uncritically from npn to pnp or claim a universally constant current gain during switching.

**Coverage expectations**

- required expectations: `functional-understanding`, `independent-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `physical-condition`: Geeignete Basisansteuerung und vertauschte Sensorwirkung; tatsächliche Untersuchung bei vorgeschriebener Schülerexperimentform. / Appropriate base drive and reversed sensor response; actual investigation when student-experiment execution is prescribed.

**Application cases**

- `fresh-function-case`
  - Task demand (DE): Nutze einen neuen vollständig beschrifteten npn-Lehrmodulplan mit einfacher Halbleiterdarstellung. Begründe Steuer-/Lastpfad und teste die Ein-/Aus-Fälle; im festgelegten Schülerexperiment stelle den Aufbau tatsächlich her.
  - Task demand (EN): Use a fresh fully labelled npn teaching-module plan and a simple semiconductor representation. Explain control/load paths and test on/off cases; in the designated student experiment actually assemble it.
  - Expected performance (DE): Die lernende Person verknüpft die dünne Basis mit Ladungsträgertransport und die Ansteuerung mit dem Laststrom. Eigene beobachtete Montage und Messung bleiben im S-Modus notwendig; die Lastenergie stammt aus der Versorgung.
  - Expected performance (EN): The learner links the thin base to carrier transport and drive to load current. Observed personal assembly and measurement remain necessary in S mode; load energy comes from the supply.
  - Understanding focus (DE): Beim bipolaren Transistor steuert eine geeignete Basis-Emitter-Ansteuerung den Strom im Kollektor-Emitter-Lastpfad. Die Energie der Last kommt aus ihrer Versorgung; der Basiszweig ist kein mechanischer Kontakt und erzeugt die Lastenergie nicht.
  - Understanding focus (EN): In a bipolar transistor, appropriate base-emitter drive controls current in the collector-emitter load path. Load energy comes from its supply; the base branch is neither a mechanical contact nor the source of load energy.
- `changed-condition-case`
  - Task demand (DE): Bei gleichem Lastkreis kehrt eine Sensorelektronik ihre Hell-Dunkel-Ausgangspegel um. Sage beide Lastzustände und die Wirkung eines offenen Basiszweigs voraus und begründe sie aus dem Material.
  - Task demand (EN): With the same load circuit, a sensor circuit reverses its light/dark output levels. Predict both load states and the effect of an open base branch, justifying them from the material.
  - Expected performance (DE): Die lernende Person folgt der konkreten Ansteuerung statt der Regel dunkel bedeutet an. Sie trennt elektronische Steuerung, mechanischen Kontakt und nichtuniverselle Stromverstärkungswerte.
  - Expected performance (EN): The learner follows the actual drive instead of a memorized dark-means-on rule. They distinguish electronic control, a mechanical contact and non-universal current-gain values.
  - Understanding focus (DE): Geeignete Basisansteuerung und vertauschte Sensorwirkung; tatsächliche Untersuchung bei vorgeschriebener Schülerexperimentform.
  - Understanding focus (EN): Appropriate base drive and reversed sensor response; actual investigation when student-experiment execution is prescribed.
## Page 6: Transistorverstärker analysieren

- Full learning-goal ID: `af50bb9a-fd7b-50f5-9698-48c4efe99032`
- Goal fingerprint: `sha256:bd837f96fadbab1c2969fa8123c597a886a608e76f7404d91d67913216378905`
- Page fingerprint: `sha256:963512af709a60eaadafbea0e1e79ba1c5c85d0258eff3f09813eb4cfda8c345`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Festkörperphysik

### Canonical description

Die lernende Person kann an einer vorgegebenen oder selbst aufgebauten bipolaren Verstärkerschaltung anhand vorgegebener Kennlinien, des Arbeitspunkts und der angegebenen Spannungsbeziehungen erklären, wie ein kleines Eingangssignal ein größeres Ausgangssignal steuert und welche Grenzen für eine unverzerrte Verstärkung gelten. Bei einer einfachen Emitterschaltung deutet sie dabei die vorgegebene Spannungsabfallbeziehung im Kollektorzweig; ein vorgesehener eigener Aufbau erfolgt unter Aufsicht mit strombegrenzter Kleinspannung.

### Visualization

/assets/goal-visualizations/physik/af50bb9a-fd7b-50f5-9698-48c4efe99032/af50bb9a-fd7b-50f5-9698-48c4efe99032.jpg

- original digest: `sha256:438402ac93ebe6d746bfc077c75cff3c5908a561493786fc09bfdcac619900df`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Einen bipolaren Transistor als Schalter funktional untersuchen — `7d4d6a39-0c78-5fb0-b7bf-182ed00972f7` (page 5)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Achsen, Skalen und Einheiten lesen — `80c232f1-8f72-5829-9dbe-5a610ccab3be` (outside this book)

### Direct reverse prerequisites outside this book

- Festkoerperphysik und Halbleiterelektronik — `0f5346d6-de1b-5e38-aaba-68db205e594b` (outside this book)
- Prüfungsaufgabe: Arbeitspunkt und Verzerrung einer Emitterschaltung — `144007cb-e2bc-5c82-bf9d-dda705b15257` (outside this book)
- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:7e43988dd36a60a9251af2d24878b5f68b3ec4a8ad2c1fff7d38ec7f303e821e`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `supplied-load-model`
  - Essential understanding (DE): Im vorgegebenen Emitterschaltungsmodell stammt die Lastenergie aus der festen Versorgung. Das hier zu lernende Lastmodell besagt: Größerer Kollektorstrom vergrößert den Spannungsabfall am gegebenen Lastwiderstand und verkleinert den verbleibenden Ausgangsanteil. Dies wird aus bereitgestelltem Modell und Daten entwickelt, nicht als bereits gemeisterte allgemeine Kirchhoff-/Ohm-Kompetenz vorausgesetzt.
  - Essential understanding (EN): In the supplied common-emitter model, load energy comes from the fixed supply. The load model learned here states that greater collector current increases the drop across the given load resistor and reduces the remaining output share. This is developed from supplied model/data, not assumed as prior general Kirchhoff/Ohm mastery.
  - Observable performance (DE): Verknüpft Basisansteuerung, vorgegebene Kollektorstromänderung, Widerstandsabfall und Ausgang; begründet die schaltungsspezifische Umkehr und die Energiequelle aus dem Material.
  - Observable performance (EN): Connects base drive, supplied collector-current change, resistor drop and output; uses the material to justify this circuit-specific inversion and energy source.
- `operating-point-and-limits`
  - Essential understanding (DE): Eine kleine Signaländerung lässt sich nur innerhalb des angegebenen aktiven Bereichs durch das vorgegebene Verstärkermodell fortsetzen. Sperren und Sättigung begrenzen den Ausgang; eine größere formale Modelländerung ist nicht automatisch physikalisch erreichbar.
  - Essential understanding (EN): A small signal variation can be propagated by the supplied amplifier model only within the stated active region. Cutoff and saturation bound the output; a larger formal model variation is not automatically physically attainable.
  - Observable performance (DE): Prüft beide Ausgangsgrenzen, unterscheidet unverzerrte kleine Änderungen von Begrenzung und wählt bei gegebenen Alternativen einen geeigneteren Arbeitspunkt.
  - Observable performance (EN): Checks both output limits, distinguishes undistorted small changes from clipping and selects a more suitable bias point among supplied alternatives.

**Coverage expectations**

- required expectations: `supplied-load-model`, `operating-point-and-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `bias-position`: Gleiche kleine Signaländerung bei mittlerem und nahe der Sättigungsgrenze liegendem Arbeitspunkt. / The same small signal change at a central bias point and near saturation.
- `supplied-representation`: Vorgegebene Lastbeziehung mit Spannungstabelle oder qualitativer Lastkennlinie übersetzen; keine zusätzliche Messdurchführung. / Translate a supplied load relation using a voltage table or qualitative load characteristic; no extra experimental execution.

**Application cases**

- `provided-load-explanation`
  - Task demand (DE): Ein vollständig beschrifteter neuer npn-Emitterschaltungsplan, die Steuerbeziehung und folgendes Lastmodell sind vorgegeben: Die Versorgung beträgt 5 V; Widerstandsabfall und Ausgang teilen diese feste Spannung auf. Die bereitgestellte Tabelle zeigt für steigende Kollektorströme die Paare(U_R,U_out)=(1 V,4 V),(2 V,3 V),(3 V,2 V). Der aktive Ausgangsbereich ist 0,2 V bis 4,8 V. Erkläre aus diesem hier eingeführten Modell die Wirkung einer kleinen Erhöhung des Eingangssignals, die laut Steuerdaten den Kollektorstrom erhöht; beurteile Energiequelle und Begrenzung.
  - Task demand (EN): A fully labelled fresh npn common-emitter plan, its control relation and this load model are supplied: The supply is 5 V; resistor drop and output share that fixed voltage. The supplied table gives(U_R,U_out)=(1 V,4 V),(2 V,3 V),(3 V,2 V) for rising collector currents. The active output range is 0.2 V to 4.8 V. Use this newly introduced model to explain a small input increase which, according to the control data, increases collector current; assess energy source and clipping.
  - Expected performance (DE): Der Widerstandsabfall nimmt zu und der verbleibende Ausgang ab. Die Person begründet die Umkehr für diese Emitterschaltung und prüft, dass alle angegebenen kleinen Ausgangsänderungen im aktiven Bereich bleiben. Energie stammt aus der 5 V-Versorgung; das Eingangssignal erzeugt sie nicht. Die Beziehung wird am gelieferten Modell erklärt, nicht aus fehlendem Vorwissen behauptet und nicht auf jede Verstärkertopologie übertragen.
  - Expected performance (EN): The resistor drop increases and the remaining output decreases. The learner explains inversion for this common-emitter circuit and checks that all stated small output variations remain in the active region. Energy comes from the 5 V supply; the input does not create it. The relation is explained from the supplied model, not asserted as missing prior knowledge or generalised to every amplifier topology.
  - Understanding focus (DE): Das tatsächliche neue Lastmodell vermittelt die fehlende Verbindung zwischen Steuerstrom, Spannungsaufteilung und Ausgang.
  - Understanding focus (EN): The actual new load model teaches the missing connection among controlled current, voltage sharing and output.
- `new-bias-clipping`
  - Task demand (DE): Bei derselben vorgegebenen Modellklasse liegt der Ausgangsarbeitspunkt nun bei 0,5 V. Das angegebene lineare Kleinsignalmodell würde bei der vorgegebenen Signaländerung Ausgangswerte von −0,3 V bis 1,3 V liefern; gültig ist es nur zwischen 0,2 V und 4,8 V. Erkläre die tatsächliche Grenze und wähle aus vorgegebenen Ausgangsarbeitspunkten 1,0 V,2,5 V und 4,5 V den mit größtem beidseitigem Spielraum. Begründe mit dem bereitgestellten Lastmodell.
  - Task demand (EN): In the same supplied model class, the output bias is now 0.5 V. The given linear small-signal model would produce outputs from −0.3 V to 1.3 V for the stated signal change, but is valid only from 0.2 V to 4.8 V. Explain the actual limit and choose the output bias with greatest two-sided headroom from 1.0 V,2.5 V and 4.5 V. Justify using the supplied load model.
  - Expected performance (DE): Die formal negative Ausgangsprognose überschreitet die untere Modellgrenze; die Ausgangsschwingung wird auf dieser Seite begrenzt, statt die Formel unbegrenzt fortzusetzen.2,5 V bietet gegenüber den angegebenen Grenzen den größten beidseitigen Spielraum. Größerer Widerstandsabfall lässt bei fester Versorgung weniger Ausgang übrig; das begründet die betroffene Signalrichtung. Ein konstanter Verstärkungsfaktor außerhalb des aktiven Bereichs wird nicht behauptet.
  - Expected performance (EN): The formally negative prediction exceeds the lower model limit; the output clips on that side rather than extending the formula indefinitely.2.5 V gives the largest two-sided headroom within the stated bounds. Greater resistor drop leaves less output at fixed supply, explaining which signal direction is limited. Constant gain outside the active region is not claimed.
  - Understanding focus (DE): Frischer Arbeitspunkt-/Modellgrenzenwechsel prüft begründete Prognose und gezielte Korrektur.
  - Understanding focus (EN): A fresh bias/model-limit variation tests justified prediction and a targeted correction.
## Page 7: Eine bistabile Transistor-Flipflop-Schaltung deuten

- Full learning-goal ID: `c2af45aa-e3fc-5119-9159-c5a260b4135a`
- Goal fingerprint: `sha256:a1ba25bc24cf19769180614f94f5003804b1b721d4979d8580fbb9c5fb2aed2a`
- Page fingerprint: `sha256:30ddf4a082f7a36be68817625dbaf8efc6c7a049c5cb101303b63057b65d34d3`
- Topic path: Physik > Sekundarstufe II (GK und LK) > Q4 Struktur von Materie, Raum und Zeit > Festkörperphysik > Transistorschaltungen

### Canonical description

Die lernende Person kann an einer vorgegebenen bistabilen Transistorschaltung erklären, wie gegenseitige Rückkopplung zwei stabile Zustände ermöglicht, und anhand der Schaltung vorhersagen, wie ein geeigneter Schaltimpuls den gespeicherten Zustand ändert.

### Visualization

/assets/goal-visualizations/physik/c2af45aa-e3fc-5119-9159-c5a260b4135a/c2af45aa-e3fc-5119-9159-c5a260b4135a.jpg

- original digest: `sha256:7488e7eeb6d9ec6ca1b7d6606abec0901c2cb19ac239fbaa205a5c3a96ed602e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Einen bipolaren Transistor als Schalter funktional untersuchen — `7d4d6a39-0c78-5fb0-b7bf-182ed00972f7` (page 5)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Festkoerperphysik und Halbleiterelektronik — `0f5346d6-de1b-5e38-aaba-68db205e594b` (outside this book)
- Q4-Klausuraufgaben Physik selbstständig lösen — `4a58df57-f791-502f-8b8d-9ba155e46035` (outside this book)
- Prüfungsaufgabe: Einen gespeicherten Schaltzustand ändern — `5902ebe8-2025-5a7c-b95d-13057398d6e6` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:87f66f2c8bc4a6bf4a47dd93f5406c96848fbc783ad5919ca4bbe9ea3401056a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `functional-understanding`
  - Essential understanding (DE): Gegenseitige Rückkopplung kann in einer passenden Transistorschaltung zwei stabile Zustände erzeugen. Ein Zustand bleibt nach dem auslösenden Impuls erhalten; diese Speicherwirkung unterscheidet Bistabilität vom einfachen Sensor-Schalter.
  - Essential understanding (EN): Mutual feedback in a suitable transistor circuit can produce two stable states. A state persists after its triggering pulse; this memory effect distinguishes bistability from a simple sensor-controlled switch.
  - Observable performance (DE): Die lernende Person verfolgt in einer vorgegebenen gekreuzt rückgekoppelten Schaltung die beiden stabilen Fälle, begründet jeweils das leitende beziehungsweise sperrende Bauteil und erklärt, warum der jeweilige Zustand erhalten bleibt.
  - Observable performance (EN): The learner traces both stable cases in a supplied cross-coupled circuit, justifies which transistor conducts or is cut off in each case, and explains why that state persists.
- `independent-transfer`
  - Essential understanding (DE): Anderen Impulseingang oder Rückkopplungsunterbrechung bei vollständig vorgegebenem Schaltungsmodell untersuchen.
  - Essential understanding (EN): Investigate another pulse input or a disconnected feedback path with a fully supplied circuit model.
  - Observable performance (DE): Für einen passend eingezeichneten Setz- oder Rücksetzimpuls prognostiziert die lernende Person den neuen Zustand und dessen Fortbestehen. Bei geöffneter Rückkopplung erklärt sie, weshalb aus dem vorherigen Speichermodell keine unveränderte Aussage mehr folgt.
  - Observable performance (EN): For an appropriately indicated set or reset pulse, the learner predicts the new state and its persistence. With feedback disconnected, they explain why the previous memory model no longer yields the same conclusion.

**Coverage expectations**

- required expectations: `functional-understanding`, `independent-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `physical-condition`: Anderen Impulseingang oder Rückkopplungsunterbrechung bei vollständig vorgegebenem Schaltungsmodell untersuchen. / Investigate another pulse input or a disconnected feedback path with a fully supplied circuit model.

**Application cases**

- `fresh-function-case`
  - Task demand (DE): In einer neu beschrifteten bistabilen npn-Schaltung leitet zunächst der rechte Transistor. Verfolge einen Impuls, der dessen Basis kurz auf Masse zieht, und bestimme beide Kollektorpegel nach dem Loslassen.
  - Task demand (EN): In a freshly labelled bistable npn circuit, the right transistor initially conducts. Trace a pulse briefly grounding its base and determine both collector levels after release.
  - Expected performance (DE): Die lernende Person begründet beide Rückkopplungsschritte, den Zustandswechsel und das Fortbestehen; sie braucht keine auswendig gelernte Setz/Rücksetz-Tabelle.
  - Expected performance (EN): The learner explains both feedback steps, the state change and persistence; no memorized set/reset table is needed.
  - Understanding focus (DE): Gegenseitige Rückkopplung kann in einer passenden Transistorschaltung zwei stabile Zustände erzeugen. Ein Zustand bleibt nach dem auslösenden Impuls erhalten; diese Speicherwirkung unterscheidet Bistabilität vom einfachen Sensor-Schalter.
  - Understanding focus (EN): Mutual feedback in a suitable transistor circuit can produce two stable states. A state persists after its triggering pulse; this memory effect distinguishes bistability from a simple sensor-controlled switch.
- `changed-condition-case`
  - Task demand (DE): Öffne im vorgegebenen Funktionsmodell genau einen Rückkopplungspfad. Prüfe, welche bisherige Begründung der zwei stabilen Zustände dadurch ausfällt und welche Angaben für eine neue Prognose fehlen.
  - Task demand (EN): Open exactly one feedback path in the supplied functional model. Identify which prior argument for two stable states fails and which information a new prediction would require.
  - Expected performance (DE): Die lernende Person lokalisiert die fehlende gegenseitige Stabilisierung und behauptet weder unveränderte Speicherung noch automatische Dauerschwingung.
  - Expected performance (EN): The learner locates the missing mutual stabilization and claims neither unchanged memory nor automatic oscillation.
  - Understanding focus (DE): Anderen Impulseingang oder Rückkopplungsunterbrechung bei vollständig vorgegebenem Schaltungsmodell untersuchen.
  - Understanding focus (EN): Investigate another pulse input or a disconnected feedback path with a fully supplied circuit model.

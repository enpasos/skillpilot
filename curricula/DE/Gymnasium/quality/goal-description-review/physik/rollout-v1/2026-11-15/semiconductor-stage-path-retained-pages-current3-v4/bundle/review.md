# AI review input: Physik: aktueller Kontext von Messung, Spannungsart und Gleichrichtung

- Book ID: `de-gym-physik-retained-pages-current3-20261115-v4`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:d2c70b74b4e911642816bde87cfcda29e5089114478e2fbaad837062f0b7f661`
- Selected goals: 3

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Die Strom-Spannungs-Kennlinie einer Diode experimentell bestimmen

- Full learning-goal ID: `3857891b-d328-585b-9936-85c7aff122ee`
- Goal fingerprint: `sha256:a0fa57a28313a5a4d54aa21686d17f0147f8701f75081196f26081b1319960b0`
- Page fingerprint: `sha256:71ac2e77ea75c676426a9e7a64f0705f5f11314ffb651cf931c6c073ce985f61`
- Topic path: Physik > Bundeslandspezifische Ergänzungen > Sekundarstufe I > Dioden: belegte Quellenanteile

### Canonical description

Die lernende Person kann in einem beaufsichtigten, strombegrenzten Kleinspannungsversuch die Strom-Spannungs-Kennlinie einer Diode in Durchlass- und Sperrpolung aufnehmen und aus den Messwerten ihr richtungsabhängiges Leitverhalten begründen.

### Visualization

/assets/goal-visualizations/physik/3857891b-d328-585b-9936-85c7aff122ee/3857891b-d328-585b-9936-85c7aff122ee.png

- original digest: `sha256:bfac74412968fe6865a8f6b56bc23edd690e05a30a0ff38acbee9f37c3f3da7e`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Achsen, Skalen und Einheiten lesen — `80c232f1-8f72-5829-9dbe-5a610ccab3be` (outside this book)
- Stromstärke in einfachen Stromkreisen messen — `f1a078ae-6262-4444-a4bc-a5ab275621cf` (outside this book)
- Spannung in einfachen Stromkreisen messen — `28237994-9c24-5a06-82fe-be1f494768ba` (outside this book)

### Direct reverse prerequisites outside this book

- Eine echte Diodenkennlinie aufnehmen und prüfen — `4ac5a07c-fff0-5eae-890d-89e13eaf69c3` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:814e6486ceafa1bfb6daba546a7bf31626ba373deaf559f1e783edf6bd61e70c`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `own-measurement`
  - Essential understanding (DE): Die gesuchte Kennlinie verknüpft den Strom durch die Diode mit der Spannung direkt an ihr; Versorgungsspannung und Vorwiderstandsspannung sind andere Größen.
  - Essential understanding (EN): The characteristic relates current through the diode to voltage directly across it; supply and series-resistor voltages are different quantities.
  - Observable performance (DE): Die lernende Person formuliert die Polungsfrage, baut unter Aufsicht mit Strombegrenzung sicher auf und zeichnet nachvollziehbare eigene signierte Messpaare in beiden Polungen einschließlich Messbereichen und Unsicherheiten auf.
  - Observable performance (EN): The learner formulates the polarity question, safely assembles a supervised current-limited setup and records traceable original signed measurements in both bias directions, including ranges and uncertainties.
- `bounded-inference`
  - Essential understanding (DE): Eine nicht aufgelöste Sperrstromanzeige ist eine Unsicherheitsgrenze, kein Nachweis einer exakten Null; die Kennlinie ist nicht ohmsch.
  - Essential understanding (EN): An unresolved reverse-current reading is an uncertainty bound, not proof of an exact zero; the characteristic is non-ohmic.
  - Observable performance (DE): Aus der eigenen Kennlinie begründet die lernende Person Richtungsabhängigkeit und Nichtlinearität, sagt die Wirkung höherer Auflösung voraus und vergleicht eine tatsächlich durchgeführte freigegebene Wiederholungsmessung.
  - Observable performance (EN): From their own graph the learner justifies direction dependence and nonlinearity, predicts the effect of improved resolution and compares an actually performed approved repeat measurement.

**Coverage expectations**

- required expectations: `own-measurement`, `bounded-inference`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `measurement-quality`: Polung und Messauflösung ändern, Bauteil und thermische Randbedingungen für Vergleiche kontrollieren. / Change bias and instrument resolution while controlling device and thermal conditions for comparisons.

**Application cases**

- `actual-iv`
  - Task demand (DE): Bestimme im freigegebenen Kleinspannungsaufbau selbst die Kennlinie beider Polungen; dokumentiere Sicherheit, Messpunktwahl und Unsicherheit.
  - Task demand (EN): Independently determine both bias branches in an approved low-voltage setup; document safety, measurement-point selection and uncertainty.
  - Expected performance (DE): Liefere den real beobachteten eigenen Aufbau, Originalpaare, beschriftetes Diagramm und die datengetragene Leitungsdeutung.
  - Expected performance (EN): Provide the actually observed personal setup, original pairs, labelled graph and data-supported conduction interpretation.
  - Understanding focus (DE): Messung von I_D und U_D, kein Rückschluss auf Durchführung aus einer fertigen Tabelle.
  - Understanding focus (EN): Measurement of I_D and U_D, not inference of execution from a completed table.
- `unresolved-current`
  - Task demand (DE): Prüfe im sicheren Sperrbetrieb eine Nullanzeige mit einem zugelassenen empfindlicheren Gerät.
  - Task demand (EN): Test a zero reading at a safe reverse bias with an approved more sensitive instrument.
  - Expected performance (DE): Sage einen kleinen möglicherweise auflösbaren Strom voraus, führe wirklich nach Freigabe nachmessend aus und begrenze die Aussage mit Auflösung und Unsicherheit.
  - Expected performance (EN): Predict a small possibly resolvable current, actually repeat the measurement after approval and bound the conclusion using resolution and uncertainty.
  - Understanding focus (DE): Nicht beobachtet heißt nicht physikalisch ausgeschlossen.
  - Understanding focus (EN): Not observed does not mean physically excluded.
## Page 2: Gleich- und Wechselspannungsversorgungen einordnen

- Full learning-goal ID: `4a42cddd-7827-5204-87e5-8d9eac7792f1`
- Goal fingerprint: `sha256:bcaa77c5283ebf67a0db4fd4f535186bc3bdfef8fb09ae0e471e03289727dfa0`
- Page fingerprint: `sha256:987c8e45c5c943560aabc859ddda58fd16334ee7df23ea9572501060768b4e17`
- Topic path: Physik > Sekundarstufe I > Spannung, Schaltungen und Sicherheit (Sek I) > Elektrische Energieversorgung und Geräteangaben einordnen

### Canonical description

Die lernende Person kann Gleich- und Wechselspannungsversorgungen anhand des zeitlichen Spannungsverlaufs und der Polarität unterscheiden und typische elektrische Versorgungen entsprechend einordnen.

### Visualization

/assets/goal-visualizations/physik/4a42cddd-7827-5204-87e5-8d9eac7792f1/4a42cddd-7827-5204-87e5-8d9eac7792f1.jpg

- original digest: `sha256:5958c2b3f17bd15e30aff44e3decd8499d7565d3d481137cf4d4a96cb9424b62`
- QA status: `approved`
- approved for public publication: `true`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Die Gleichrichterfunktion einer Diodenschaltung erklären — `3b586f2a-60e2-5019-aa08-6a47616a1f1f` (page 3)

### Prerequisites outside this book

- Achsen, Skalen und Einheiten lesen — `80c232f1-8f72-5829-9dbe-5a610ccab3be` (outside this book)
- Warum Physik? – Weltverständnis & Zukunft — `5c44b9ba-9b05-4774-95d5-073230d3fc4f` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-I-Abschlussaufgaben Physik selbstständig lösen — `3631c8f7-ff48-57ff-b7ee-8397ff1d166a` (outside this book)
- Prüfungsaufgabe: Eine mobile Energieversorgung elektrisch bilanzieren — `de7528cc-8c5d-5cd6-8d08-f8ce7457e666` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:df10f38454d35946893757fe4c8d99d6ab189fb95a8960d118f7ada0d1cefebe`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `polarity-and-time-course-define-supply-class`
  - Essential understanding (DE): Eine Spannung ist immer auf eine festgelegte Reihenfolge zweier Anschlüsse bezogen. Bei Gleichspannung bleibt die Polarität erhalten, auch wenn der Betrag zeitlich schwanken kann; bei Wechselspannung kehrt die Polarität wiederholt um und der Spannungswert wechselt bezogen auf dieselbe Anschlussreihenfolge sein Vorzeichen.
  - Essential understanding (EN): Voltage is always defined for an ordered pair of terminals. With direct voltage, polarity is retained even if the magnitude varies with time; with alternating voltage, polarity repeatedly reverses and the voltage value changes sign relative to the same terminal order.
  - Observable performance (DE): Die lernende Person legt für unbekannte Zeitdaten eine Anschlussreihenfolge fest, verfolgt Vorzeichen und Polarität über die Zeit und klassifiziert konstante, pulsierende gleichgerichtete und umpolende Verläufe mit einer Begründung, die nicht nur auf Schwankung beruht.
  - Observable performance (EN): For unfamiliar time-series data, the learner specifies the terminal order, tracks sign and polarity over time, and classifies constant, pulsating unidirectional, and polarity-reversing traces with a justification that does not rely on variation alone.
- `graph-features-correspond-to-physical-terminals`
  - Essential understanding (DE): Ein U-t-Diagramm stellt eine gemessene oder modellierte Potenzialdifferenz über der Zeit dar. Nulldurchgänge zeigen bei unveränderter Anschlussdefinition einen Polaritätswechsel; Periodendauer, Extremwerte und Mittel- oder Effektivangaben beschreiben weitere Eigenschaften, entscheiden aber nicht ohne den Vorzeichenverlauf über Gleich- oder Wechselspannung.
  - Essential understanding (EN): A voltage-time graph represents a measured or modeled potential difference over time. With the terminal definition unchanged, zero crossings show a reversal of polarity; period, extreme values, and mean or rms information describe further properties but do not determine direct or alternating voltage without the sign history.
  - Observable performance (DE): Die lernende Person konstruiert aus einer neuen Wertetabelle ein U-t-Diagramm, kennzeichnet Polaritätswechsel und Perioden, erklärt die Bedeutung der Achsen und korrigiert eine Klassifikation, die allein aus einem positiven Effektiv- oder Amplitudenwert Wechsel- beziehungsweise Gleichspannung folgert.
  - Observable performance (EN): The learner constructs a voltage-time graph from a fresh table, marks polarity reversals and periods, explains the axes, and corrects a classification that infers alternating or direct voltage solely from a positive rms or amplitude value.
- `source-label-and-waveform-must-agree`
  - Essential understanding (DE): Batterien und viele gekennzeichnete Netzteil-Ausgänge liefern typischerweise Gleichspannung; Netzversorgung und bestimmte Transformatorausgänge liefern Wechselspannung. Symbole und Beschriftungen sind Informationen über vorgesehene Ein- oder Ausgänge, müssen aber dem betrachteten Anschluss zugeordnet werden und ersetzen bei unbekannten Quellen keine sichere Mess- oder Datengrundlage.
  - Essential understanding (EN): Batteries and many labelled power-supply outputs typically provide direct voltage; mains supplies and some transformer outputs provide alternating voltage. Symbols and labels give information about intended inputs or outputs but must be assigned to the terminal under consideration and do not replace safe measurement or supplied data for an unknown source.
  - Observable performance (DE): An einem unbekannten Adapteretikett ordnet die lernende Person getrennt Ein- und Ausgang, Spannungsart, Polaritätssymbol und Zahlenwert zu, verknüpft dies mit bereitgestellten idealisierten Zeitverläufen und weist eine Zuordnung zurück, die das Wechselspannungseingangssymbol auf den Gleichspannungsausgang überträgt.
  - Observable performance (EN): For an unfamiliar adapter label, the learner separately assigns input and output, voltage type, polarity symbol, and numerical value, links these with supplied idealized time traces, and rejects an assignment that transfers the alternating-voltage input symbol to the direct-voltage output.
- `classification-respects-safety-and-model-limits`
  - Essential understanding (DE): Die Form eines idealisierten Verlaufs beschreibt die zeitliche Spannungsart, nicht automatisch Belastbarkeit, Gefährdung oder Eignung für ein Gerät. Netzspannungsverläufe werden aus bereitgestellten Daten beurteilt; praktische Untersuchungen bleiben auf vorgesehene sichere Kleinspannungsquellen und geeignete Messmittel begrenzt.
  - Essential understanding (EN): The shape of an idealized trace describes the voltage's time behavior, not automatically its current capability, hazard, or suitability for a device. Mains-voltage traces are assessed from supplied data; practical investigations remain limited to intended safe low-voltage sources and suitable instruments.
  - Observable performance (DE): Die lernende Person trennt in einem neuen Fall die begründete Spannungsart von nicht belegten Aussagen über Geräteeignung oder Sicherheit, wählt für eine Untersuchung Simulation beziehungsweise bereitgestellte Daten statt Netzspannungsmessung und nennt die zusätzlichen Nennangaben, die für eine Betriebsbeurteilung fehlen.
  - Observable performance (EN): In a fresh case, the learner separates the justified voltage classification from unsupported claims about device suitability or safety, chooses simulation or supplied data rather than mains-voltage measurement for an investigation, and identifies the additional ratings missing for an operating assessment.

**Coverage expectations**

- required expectations: `polarity-and-time-course-define-supply-class`, `graph-features-correspond-to-physical-terminals`, `source-label-and-waveform-must-agree`, `classification-respects-safety-and-model-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 3
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `time-course`: Konstanter, pulsierend gleichgerichteter, periodisch umpolender oder unregelmäßig umpolender Spannungsverlauf / Constant, pulsating unidirectional, periodically reversing, or irregularly reversing voltage trace
- `source-and-terminal`: Batterie, sichere Kleinspannungsquelle, Adaptereingang oder Adapterausgang mit jeweils festgelegter Anschlussreihenfolge / Battery, safe low-voltage source, adapter input, or adapter output with a specified terminal order
- `representation`: U-t-Diagramm, Wertetabelle, Anschluss- und Polaritätsskizze oder Geräteetikett / Voltage-time graph, data table, terminal and polarity sketch, or device label
- `classification-boundary`: Spannungsart gegenüber Betrag, Frequenz, Belastbarkeit, Sicherheit und Geräteeignung / Voltage type contrasted with magnitude, frequency, current capability, safety, and device suitability

**Application cases**

- `constant-pulsating-and-sinusoidal-traces`
  - Task demand (DE): Drei bereitgestellte U-t-Diagramme zeigen eine konstante positive Spannung, eine zwischen null und positiven Werten pulsierende Spannung und einen sinusförmig zwischen positiven und negativen Werten wechselnden Verlauf. Klassifiziere alle drei, markiere mögliche Polaritätswechsel und erkläre, warum Schwankung allein keine Wechselspannung definiert.
  - Task demand (EN): Three supplied voltage-time graphs show a constant positive voltage, a voltage pulsing between zero and positive values, and a sinusoidal trace alternating between positive and negative values. Classify all three, mark any polarity reversals, and explain why variation alone does not define alternating voltage.
  - Expected performance (DE): Die lernende Person ordnet die ersten beiden Verläufe aufgrund gleichbleibender Polarität der Gleichspannung zu, bezeichnet den zweiten präzise als pulsierende Gleichspannung, erkennt beim dritten die wiederholte Umpolung und begründet jede Zuordnung mit Vorzeichen und Anschlussdefinition.
  - Expected performance (EN): The learner classifies the first two traces as direct voltage because polarity is retained, identifies the second precisely as pulsating direct voltage, recognizes repeated polarity reversal in the third, and justifies each classification using sign and terminal definition.
  - Understanding focus (DE): Der pulsierende Verlauf deckt die Fehlvorstellung auf, jede zeitliche Änderung sei Wechselspannung.
  - Understanding focus (EN): The pulsating trace exposes the misconception that every time variation is alternating voltage.
- `adapter-input-output-label-translation`
  - Task demand (DE): Ein fiktives Adapteretikett nennt auf der Eingangsseite ein Wechselspannungssymbol und auf der Ausgangsseite ein Gleichspannungssymbol mit markierter Polarität. Ordne vier bereitgestellte Zeitverläufe den beiden Seiten zu, erkläre die Rolle des Adapters und trenne Spannungsart von der noch ungeprüften Eignung für ein konkretes Gerät.
  - Task demand (EN): A fictional adapter label shows an alternating-voltage symbol on the input side and a direct-voltage symbol with marked polarity on the output side. Assign four supplied time traces to the two sides, explain the adapter's role, and separate voltage type from suitability for a particular device, which has not yet been checked.
  - Expected performance (DE): Die lernende Person hält Ein- und Ausgang auseinander, verbindet den umpolenden Verlauf mit dem Eingang und einen gleich gepolten Verlauf mit dem Ausgang, liest die Polarität relativ zu den Anschlüssen und fordert für die Geräteeignung zusätzlich passende Betrags-, Strom- und Polaritätsangaben.
  - Expected performance (EN): The learner keeps input and output distinct, links the reversing trace with the input and a fixed-polarity trace with the output, reads polarity relative to the terminals, and requires matching magnitude, current, and polarity ratings before assessing device suitability.
  - Understanding focus (DE): Die Übersetzung zwischen Etikett, Anschluss und Zeitdarstellung prüft echte Repräsentationskompetenz.
  - Understanding focus (EN): Translation among label, terminal, and time representation tests genuine representational competence.
- `same-rms-different-time-course`
  - Task demand (DE): Zwei bereitgestellte Spannungsverläufe besitzen denselben angegebenen Effektivwert: einer bleibt positiv und pulsiert, der andere wechselt regelmäßig das Vorzeichen. Konstruiere aus Stichprobendaten die Verläufe, klassifiziere sie und beurteile die Behauptung, gleicher Effektivwert bedeute gleiche Spannungsart.
  - Task demand (EN): Two supplied voltage traces have the same stated rms value: one remains positive and pulsates, while the other regularly changes sign. Construct the traces from sampled data, classify them, and assess the claim that the same rms value means the same voltage type.
  - Expected performance (DE): Die lernende Person erkennt trotz gleicher positiver Kennzahl die feste Polarität des ersten und die Umpolung des zweiten Verlaufs, weist die Behauptung zurück und erklärt, dass der Effektivwert eine Betragswirkung, nicht die vollständige Vorzeichenentwicklung beschreibt.
  - Expected performance (EN): Despite the same positive rating, the learner identifies fixed polarity in the first trace and reversal in the second, rejects the claim, and explains that rms describes an effect of magnitude rather than the complete sign history.
  - Understanding focus (DE): Gleicher Effektivwert bei verschiedener Polaritätsgeschichte trennt Kennzahl und Klassifikationsmerkmal.
  - Understanding focus (EN): Equal rms values with different polarity histories separate a rating from the feature used for classification.
## Page 3: Die Gleichrichterfunktion einer Diodenschaltung erklären

- Full learning-goal ID: `3b586f2a-60e2-5019-aa08-6a47616a1f1f`
- Goal fingerprint: `sha256:d62b0b3dbd3e7e69aee071dd7b1e9f3f9553ba3669e905d98bc3d9a0e7b4daef`
- Page fingerprint: `sha256:dee86f4fc31cab2f1c3de1b3689fc9b48af8867821507b932e6ac3f26b15f45f`
- Topic path: Physik > Bundeslandspezifische Ergänzungen > Sekundarstufe I > Dioden: belegte Quellenanteile

### Canonical description

Die lernende Person kann an einer vorgegebenen einfachen Gleichrichterschaltung bei bekanntem Eingangsspannungsverlauf aus der Polung der Dioden die Stromwege und unter den angegebenen Bauteilannahmen den zeitlichen Verlauf der Spannung am Verbraucher erklären.

### Visualization

/assets/goal-visualizations/physik/3b586f2a-60e2-5019-aa08-6a47616a1f1f/3b586f2a-60e2-5019-aa08-6a47616a1f1f.png

- original digest: `sha256:026c52e440415e75f67b201dab4cf4809751cb26fcfd78f41e9a9941430f4f66`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gleich- und Wechselspannungsversorgungen einordnen — `4a42cddd-7827-5204-87e5-8d9eac7792f1` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Durchlass- und Sperrverhalten einer Diode an einer Kennlinie erklären — `dc55adac-91a5-5cc3-ab47-be008480616f` (outside this book)

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

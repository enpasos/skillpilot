# AI review input: Chemie: endgültiger aktueller D-Kontext

- Book ID: `chemie-final-context-d-009`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:b9b7330ce974a92e8828dfeca93eee2953c0fd166707d1e6fd7b9a449f48899e`
- Selected goals: 3

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Anspruchsvolle chemische Experimente selbstständig durchführen

- Full learning-goal ID: `f79f15c0-e848-5e17-9eb5-26753d35c93b`
- Goal fingerprint: `sha256:7fbda887bd502458a1f81ff9c2a7668f1a9793347dc537a8b20793002f80cbc4`
- Page fingerprint: `sha256:8870786fe124bcf8b3453e739ee5a792e5201f4c5f3f1ba605cd3922488f5384`
- Topic path: Vollständige technische Review-Basis (442 Kompetenzen)

### Canonical description

Die lernende Person kann hypothesengeleitete qualitative und quantitative Experimente überwiegend selbstständig planen, geeignete Analysenmethoden wählen, unter den Sicherheitsbestimmungen tatsächlich durchführen und nachvollziehbar protokollieren.

### Visualization

/assets/goal-visualizations/chemie/f79f15c0-e848-5e17-9eb5-26753d35c93b/f79f15c0-e848-5e17-9eb5-26753d35c93b.png

- original digest: `sha256:4edf9b16dc53248dd291669892efd06c648cda2e7bcd325080f78a2e1406d586`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Chemische Untersuchungen selbst planen und durchführen — `42391b16-bbae-5c77-84e1-d488e714167b` (outside this book)

### Direct reverse prerequisites outside this book

- Eigene saure Proben qualitativ und quantitativ untersuchen — `ab315f52-a9e3-5c1c-a404-7fb1a96a3eaf` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:300965e256ed0deba7d5222df99daf446b3197fef17fba8570fe68159e89dd4e`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `own-method-plan`
  - Essential understanding (DE): Eine überwiegend selbst geplante qualitative UND quantitative Hypothesenprüfung benötigt eine fachlich geeignete Analysenmethode und passende Kontrollen.
  - Essential understanding (EN): A mostly independently planned qualitative AND quantitative hypothesis test needs a scientifically suitable analytical method and appropriate controls.
  - Observable performance (DE): Plant Säureanalyse oder Farbstoffanalyse mit begründeter Methodenwahl, qualitativer Zuordnung, quantitativem Ansatz, Standards/Blank, Wiederholung und konkreter Sicherheitsfreigabe.
  - Observable performance (EN): Plans acid or dye analysis with justified method choice, qualitative assessment, quantitative approach, standards/blank, repeats and specific safety release.
- `actual-analysis-record`
  - Essential understanding (DE): Referenz-Titrationen oder Kalibriergeraden sind keine eigene sichere experimentelle Durchführung.
  - Essential understanding (EN): Reference titrations or calibration lines are not own safe experimental execution.
  - Observable performance (DE): Führt die freigegebene Analyse tatsächlich aus; bewahrt eigene Vorbereitung, Geräte-/Standardprüfung, Rohwerte, pH-/Indikatorbeobachtung bzw. Absorbanz und Abweichungen als Protokoll.
  - Observable performance (EN): Actually executes the released analysis; retains own preparation, instrument/standard checks, raw readings, pH/indicator observation or absorbance and deviations as a record.
- `quantitative-validity`
  - Essential understanding (DE): Stöchiometrie und Kalibrierbereich bestimmen zulässige Auswertung; ein falscher Standard kann absolute Werte verzerren, ein gemeinsamer Faktor kann sich im Verhältnis kürzen.
  - Essential understanding (EN): Stoichiometry and calibration range govern valid evaluation; a wrong standard can bias absolute values while a common factor may cancel in a ratio.
  - Observable performance (DE): Berechnet aus eigenen zulässigen Daten Konzentrationen, prüft Hypothese und Unsicherheit; behandelt falsche Basenkonzentration sowie A=0,810 außerhalb der Farbstoffkalibrierung ohne unzulässige Extrapolation.
  - Observable performance (EN): Calculates concentrations from own valid data, checks hypothesis and uncertainty; handles wrong base concentration and A=0.810 outside the dye calibration without invalid extrapolation.

**Coverage expectations**

- required expectations: `own-method-plan`, `actual-analysis-record`, `quantitative-validity`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `standard-validity`: Gleiche und zeitlich veränderte Maßlösung werden hinsichtlich absoluter Konzentration und Verhältnis getrennt. / Common and temporally changed titrant are distinguished for absolute concentration and ratio.
- `calibration-domain`: Nur neu gemessene Werte innerhalb einer eigenen gültigen Kalibrierung dürfen nach bekannter Verdünnung zurückgerechnet werden. / Only new readings within an own valid calibration may be converted back using known dilution.

**Application cases**

- `upper-hypothesis-investigation-acid-analysis`
  - Task demand (DE): Wähle begründet Indikator-/pH-Analyse und ein quantitatives Titrierverfahren. Plane größtenteils selbst Proben, Blind-/Kontrollprüfung und Wiederholungen, lasse den Plan freigeben und führe ihn tatsächlich aus. Protokolliere qualitative Umschlagbeobachtung, pH-/Volumendaten und berechne aus eigenen Werten das Konzentrationsverhältnis cB/cA (B zu A).
Frische Variation: Plane eine Prüfung für falsch konzentrierte Lauge; erläutere deren Wirkung auf absolute Konzentration und Konzentrationsverhältnis cB/cA (B zu A).
  - Task demand (EN): Justify choice of indicator/pH analysis and quantitative titration. Largely independently plan samples, blank/control checks and repeats, obtain authorisation and actually perform the experiment. Record qualitative colour change, pH/volume data and calculate the concentration ratio cB/cA (B to A) from own values.
Fresh variation: Plan a check for incorrect base concentration; explain its effect on absolute concentrations and the concentration ratio cB/cA (B to A).
  - Expected performance (DE): Ein akzeptabler Plan verwendet je gleiche 10,00-mL-Aliquote, standardisierte Lauge, saubere vorbereitete Geräte, geeigneten schwache-Säure-Endpunkt und wiederholte Volumina. Referenz: 8,00 mL A und 16,00 mL B ergeben cA = 0,00800 mol/L, cB = 0,0160 mol/L und das Konzentrationsverhältnis cB/cA = 2,00. Die echte Durchführung und eigenen Rohwerte müssen davon unabhängig dokumentiert sein. pH allein beweist wegen des Dissoziationsgleichgewichts kein Konzentrationsverhältnis 2; geeignete Stoffmengenanalyse schon innerhalb ihrer Unsicherheit. Die Indikatorwahl nutzt den angegebenen Umschlagsbereich und die eigene Kurve: Methylorange schlägt in dieser schwachen-Säure-Titration vor dem alkalischen Äquivalenzbereich um; Phenolphthalein verlangt einen kontrollierten ersten schwachen Umschlag und Prüfung der Endpunktabweichung. Kalibration mit aktuellen Puffern wird tatsächlich protokolliert; ihre Nominalwerte sind keine Probenmessung.
Frischer Transfer: Mit cSäure=cBase·Veq/VSäure skaliert eine falsch angenommene Basenkonzentration beide absoluten Säurewerte. Modellillustration, keine Messung: Bei tatsächlich 0,00900 statt angenommen 0,0100 mol/L Base und denselben Referenzvolumina 8/16 mL auf 10 mL Probe wären die Konzentrationen 0,00720/0,01440 statt berichteter 0,00800/0,01600 mol/L; die berichteten Werte wären 11,1 % zu hoch. Das Verhältnis B/A bleibt 2, wenn dieselbe unveränderte Maßlösung, gleiche Stöchiometrie und vergleichbare Endpunkterfassung gelten. Bei Drift oder unterschiedlichen Maßlösungen kürzt sich der Fehler nicht zuverlässig. Eigene Standardprüfung gegen geeignete bestätigte Referenz/Lehrkraftstandardisierung und eigene Rohdaten sind nötig; keine zusätzliche gefährliche Durchführung wird hier freigegeben.
  - Expected performance (EN): An acceptable plan uses equal 10.00-mL aliquots, standardised base, clean prepared instruments, an endpoint suitable for a weak acid and repeated volumes. Reference: 8.00 mL for A and 16.00 mL for B yield cA = 0.00800 mol/L, cB = 0.0160 mol/L and concentration ratio cB/cA = 2.00. Actual execution and own raw values must be independently recorded. pH alone does not prove a concentration ratio of 2 because of dissociation equilibrium; an appropriate amount analysis can within its uncertainty. Indicator choice uses the stated transition range and own curve: methyl orange changes before the alkaline equivalence region in this weak-acid titration; phenolphthalein requires a controlled first faint colour change and assessment of endpoint bias. Actually log calibration with current buffers; their nominal values are not sample readings.
Fresh transfer: Using cAcid=cBase·Veq/VAcid, an incorrectly assumed base concentration scales both absolute acid results. Model illustration, not a measurement: with actual 0.00900 rather than assumed 0.0100 mol/L base and the same reference volumes 8/16 mL for a 10 mL sample, concentrations would be 0.00720/0.01440 rather than reported 0.00800/0.01600 mol/L; reported readings would be 11.1% high. B/A remains 2 if the same unchanged titrant, stoichiometry and comparable endpoint detection apply. Drift or different titrants prevent reliable cancellation. Own standard checks against a suitable confirmed reference/teacher standardisation and own raw data are required; no additional hazardous execution is released here.
  - Understanding focus (DE): Quantitative Stöchiometrie trennt gemeinsame absolute Standardverzerrung und unter Bedingungen robustes Verhältnis.
  - Understanding focus (EN): Quantitative stoichiometry separates common absolute standard bias from a conditionally robust ratio.
- `upper-hypothesis-investigation-colour-analysis`
  - Task demand (DE): Plane selbst qualitative Farbprüfung und quantitative photometrische Analyse mit Blindprobe, Kalibration und Wiederholung. Lass den konkret stoffbezogenen Plan freigeben, führe ihn tatsächlich aus und dokumentiere deine Werte. Begründe, wie die Methode die Hypothese prüft und wann verdünnt werden müsste.
Frische Variation: Begründe für den bereitgestellten Modellwert A = 0,810, weshalb die gültige Kalibration 0–6 mg/L mit ihrem oberen Modellwert A = 0,490 keine Auswertung der unverdünnten Probe erlaubt. Wähle eine zweifache Verdünnung als ersten Prüfversuch: 10,00 mL Aliquot im 20,00-mL-Messkolben bis Marke auffüllen und mischen; erläutere die Gerätefehlergrenzen. Dieser Vorschlag garantiert noch keinen Wert im gültigen Bereich. Erst eine neue tatsächliche In-Bereich-Messung mit eigener gültiger Kalibration erlaubt die Bestimmung von cverdünnt und die Rückrechnung cunverdünnt = 2·cverdünnt. Liegt der neue Wert weiterhin außerhalb, ist eine weitere bekannte Verdünnung und eine neue gültige Messung erforderlich; den Gesamtfaktor dokumentieren. Aus A = 0,810 wird weder die ursprüngliche Konzentration noch der neue Messwert extrapoliert. Modellplanung ersetzt keine Durchführung. Echte Ausführung verlangt Freigabe, eigenen Volumenlog und eigene Messwerte.
  - Task demand (EN): Independently plan qualitative colour checks and quantitative photometric analysis with blank, calibration and repeats. Obtain authorisation of the substance-specific plan, actually perform it and document your values. Justify how the method tests the hypothesis and when dilution would be necessary.
Fresh variation: For the supplied model value A = 0.810, explain why the valid 0–6 mg/L calibration with its upper model value A = 0.490 does not permit evaluation of the undiluted sample. Choose a twofold dilution as an initial trial: dilute a 10.00-mL aliquot to the mark in a 20.00-mL flask and mix; explain instrument error limits. This proposal does not yet guarantee a value within the valid range. Only a new actual in-range reading using own valid calibration permits determination of cdiluted and back-calculation cundiluted = 2·cdiluted. If the new reading remains outside the range, another known dilution and a new valid reading are required; record the overall factor. Neither original concentration nor the new reading is extrapolated from A = 0.810. Model planning does not replace execution. Actual execution requires authorisation, own volume log and own readings.
  - Expected performance (DE): Ein möglicher Plan vergleicht Farbe und Blindprobe unter gleichen Bedingungen, prüft Standards, misst U wiederholt in sauberen Küvetten und nutzt die gültige Kalibration. Referenz U = 0,290 ergibt (0,290−0,010)/0,080 = 3,50 mg/L. Echte U-Werte erst bei Durchführung eintragen. Ähnliche Farbe allein identifiziert X nicht eindeutig. Außerhalb des linearen Bereichs ist eine bekannte Verdünnung und Rückrechnung nötig; Durchführung darf nicht durch Modellrechnung ersetzt werden.
Frischer Transfer: A=0,810 liegt über dem höchsten Standard A=0,490: Die gültige Kalibrierung 0–6 mg/L erlaubt keine berichtbare Ausgangskonzentration daraus. Zunächst eine bekannte neue Verdünnung planen, etwa 10,00 mL auf 20,00 mL als nominalen Faktor 2, und nach Freigabe tatsächlich messen. Faktor 2 garantiert ohne gültigen Ausgangswert keinen in-range-Wert. Nur wenn der neue eigene Wert in der eigenen gültigen Kalibrierung liegt, gilt cOriginal=2·cVerdünnung; andernfalls einen weiteren bekannten Faktor und neue Messung nutzen. Mit den bereitgestellten absoluten Volumengrenzen liegt allein das Faktorintervall zwischen 19,98/10,02≈1,9940 und 20,02/9,98≈2,0060; das ist keine Gesamtunsicherheit. Keine neue Absorbanz wird aus 0,810 extrapoliert oder als gemessen erfunden.
  - Expected performance (EN): A possible plan compares colour and blank under equal conditions, checks standards, repeatedly measures U in clean cuvettes and uses valid calibration. Reference U = 0.290 gives (0.290−0.010)/0.080 = 3.50 mg/L. Enter actual U values only during execution. Similar colour alone does not identify X uniquely. Outside the linear range, a known dilution and back-calculation are required; actual execution cannot be replaced by model arithmetic.
Fresh transfer: A=0.810 exceeds the highest standard A=0.490: valid calibration over 0–6 mg/L cannot yield a reportable original concentration from it. First plan a known new dilution, such as 10.00 mL to 20.00 mL with nominal factor 2, and actually measure after release. Factor 2 does not guarantee an in-range reading without a valid starting value. Only if the new own reading lies within the own valid calibration use cOriginal=2·cDiluted; otherwise use another known factor and a new measurement. With the supplied absolute volume limits the factor interval alone is 19.98/10.02≈1.9940 to 20.02/9.98≈2.0060; this is not total uncertainty. No new absorbance is extrapolated from 0.810 or invented as measured.
  - Understanding focus (DE): Eigene Analyse respektiert Kalibrierbereich und tatsächlich neue Verdünnungs-/Messprodukte.
  - Understanding focus (EN): Own analysis respects calibration range and actually new dilution/measurement products.
## Page 2: Polyadditionen analysieren (LK)

- Full learning-goal ID: `f947cd04-952a-5a9d-9445-3ffc70e02c3c`
- Goal fingerprint: `sha256:91ff858ec3b2ce6539b33fc7c9c2e3152398691edf57d8b37a877ef336ac97b4`
- Page fingerprint: `sha256:537a9b1848783944c4b26cec8eecb98e56baeaa1517d66d4bb2e4c05f8a1e8a4`
- Topic path: Vollständige technische Review-Basis (442 Kompetenzen)

### Canonical description

Die lernende Person kann die Bildung von Polyurethanen erläutern und Besonderheiten der Reaktionsführung erklären.

### Visualization

/assets/goal-visualizations/chemie/f947cd04-952a-5a9d-9445-3ffc70e02c3c/f947cd04-952a-5a9d-9445-3ffc70e02c3c.png

- original digest: `sha256:1704dabc275aea63e09ed793fe211d110a45a30a0ab09b013d32231a74dd7372`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Kunststoffe einteilen — `3e9eb5d0-3407-5a1e-9492-ad87f98d303d` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Reaktionsbedingungen der Kunststoffsynthesen vergleichen — `0559cec7-330b-57f1-a409-31cf1b4ac9fb` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:aa9fce2dfa036f0793f910ce51d83e9043e7bb8b31e19e4b26e37589311dacf5`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Isocyanat und Alkohol bilden Urethangruppen ohne Abspaltung eines kleinen Moleküls in der trockenen Hauptreaktion. Die Bildung lässt sich als nucleophile Addition des Alkohol-O am elektrophilen NCO-C mit Protonübertragung erklären.
  - Essential understanding (EN): Isocyanate and alcohol form urethane groups without a small-molecule byproduct in the dry main reaction. Formation can be explained through nucleophilic addition of alcohol O at electrophilic NCO C with proton transfer.
  - Observable performance (DE): Begründet N/E-Rollen, zeigt einen valenzrichtigen Additions-/Protonübertragungsweg und leitet Bindungsmotiv und Repetiereinheit mit korrekten O-, N- und Carbonylbindungen ab.
  - Observable performance (EN): Explains N/E roles, shows a valence-correct addition/proton-transfer route and derives linkage and repeat unit with correct O, N and carbonyl bonds.
- `e2`
  - Essential understanding (DE): Funktionalität und Äquivalentverhältnis steuern Kettenbildung und Vernetzung.
  - Essential understanding (EN): Functionality and equivalent ratio control chains and crosslinking.
  - Observable performance (DE): Zählt OH/NCO-Äquivalente und unterscheidet lineare Ketten von verzweigten Netzwerken.
  - Observable performance (EN): Counts OH/NCO equivalents and distinguishes linear chains from branched networks.
- `e3`
  - Essential understanding (DE): Wasser kann mit Isocyanat CO₂ erzeugen; Schäumen ist von trockener Polyaddition zu unterscheiden.
  - Essential understanding (EN): Water can react with isocyanate to generate CO₂; foaming differs from dry polyaddition.
  - Observable performance (DE): Interpretiert einen neuen Feuchtefall und begründet datenbasierte Reaktionskontrolle ohne Laboranleitung.
  - Observable performance (EN): Interprets a new moisture scenario and justifies data-based process control without laboratory instructions.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Diol oder Triol / Diol or triol
- `v2`: Äquivalentverhältnis / Equivalent ratio
- `v3`: Trocken oder feucht / Dry or moist

**Application cases**

- `f947cd04-case-1`
  - Task demand (DE): Kennzeichne das Alkohol-Sauerstoffatom als Nucleophil und das NCO-Kohlenstoffatom als Elektrophil und begründe dies anhand der Elektronenpaare bzw. Bindungspolarisierung. Erläutere mit valenzrichtigen Zwischenformeln oder Elektronenpaarbewegungen einen vereinfachten Additions- und Protonübertragungsweg. Formuliere die trockene Reaktion R–N=C=O + HO–R′ einschließlich der Produktstruktur und begründe, warum dabei kein Wasser abgespalten wird. Leite aus dem angegebenen Diol und Diisocyanat eine valenzrichtige Wiederholungseinheit der linearen Polyurethankette in Charge L ab. Berechne die OH- und NCO-Gruppenmengen beider Chargen und erläutere die Bedeutung der drei OH-Gruppen des Triols. Erkläre die Ketten- bzw. Vernetzungstendenz unter Umsatzvorbehalt. Beurteile die Eignung für einen formstabilen Klebstoff ausdrücklich unter den Voraussetzungen zu Umsatz, Haftung und Einsatztemperatur.
  - Task demand (EN): Identify the alcohol oxygen as the nucleophile and the NCO carbon as the electrophile, explaining this through electron pairs and bond polarisation. Use valence-correct intermediate formulas or electron-pair movements to explain a simplified addition and proton-transfer route. Formulate the dry reaction R–N=C=O + HO–R′ including its product structure and explain why it eliminates no water. Derive a valence-correct repeat unit of the linear polyurethane chain in batch L from the supplied diol and diisocyanate. Calculate the OH and NCO group amounts in both batches and explain the significance of the triol’s three OH groups. Explain chain versus crosslinking tendencies subject to conversion. Assess suitability for a shape-stable adhesive explicitly subject to conversion, adhesion and service-temperature conditions.
  - Expected performance (DE): Das Alkohol-O stellt ein freies Elektronenpaar bereit; das positiv polarisierte zentrale NCO-C ist der elektrophile Angriffsort. Als formales, valenzrichtiges Modell kann eine neue O–C-Bindung mit Verschiebung des C=N-π-Elektronenpaars zum N entstehen: R–N⁻–C(=O)–O⁺(H)–R′. Protonübertragung vom O zum N liefert neutrales R–NH–C(=O)–O–R′. Das ist ein vereinfachtes Elektronenpaarmodell, kein Nachweis eines langlebigen Zwischenprodukts; ein valenzrichtiger konzertierter oder protonenvermittelter Weg ist ebenfalls zulässig. Es wird kein H₂O abgespalten. Produkt R–NH–C(=O)–O–R′, kein H₂O. L je 200 mol OH/NCO, beide bifunktionell: lineare Ketten möglich. N 210 mol OH und 210 mol NCO; Triol ermöglicht Verzweigungen und bei ausreichender Umsetzung ein Netz. Wiederholung –O–R′–O–C(=O)–NH–R–NH–C(=O)–. N ist plausible formstabile Wahl; Vernetzungsgrad, Haftung, Temperatur und vollständiger Umsatz sind nicht allein durch Äquivalenz bewiesen.
  - Expected performance (EN): The alcohol O supplies a lone pair; the positively polarised central NCO C is the electrophilic attack site. A formal valence-correct model forms a new O–C bond while shifting the C=N π pair to N: R–N⁻–C(=O)–O⁺(H)–R′. Proton transfer from O to N yields neutral R–NH–C(=O)–O–R′. This is a simplified electron-pair model, not evidence for a long-lived intermediate; a valence-correct concerted or proton-mediated route is also acceptable. No H₂O is eliminated. Product R–NH–C(=O)–O–R′, no H₂O. L has 200 mol each OH/NCO and both monomers are bifunctional: linear chains are possible. N has 210 mol each OH/NCO; triol permits branches and a network at sufficient conversion. Repeat –O–R′–O–C(=O)–NH–R–NH–C(=O)–. N is a plausible shape-stable choice; equivalence alone proves neither crosslink density, adhesion, service temperature nor complete conversion.
  - Understanding focus (DE): Zusätzlich fallbezogen: Alkohol-O als Nucleophil und NCO-C als Elektrophil; valenzrichtige Addition/Protonübertragung ohne H₂O. Fallbezogene Aspekte: R–NH–C(=O)–O–R′ und valenzrichtiges Urethan-Repetiermotiv, ohne Wasserabspaltung. / L: 200/200 mol OH/NCO; N: 210/210 mol, Triol zählt drei OH-Gruppen. / L linear möglich, N verzweigungs-/netzfähig; N-Klebstoff nur unter Umsatz/Haftungs-/Temperaturvorbehalt. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Additional case-specific aspect: alcohol O as nucleophile and NCO C as electrophile; valence-correct addition/proton transfer without H₂O. Case-specific aspects: R–NH–C(=O)–O–R′ and valence-correct urethane repeat motif, without water elimination. / L: 200/200 mol OH/NCO; N: 210/210 mol, triol contributes three OH groups. / L may be linear, N permits branching/network; N adhesive choice remains conditional on conversion/adhesion/temperature. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
- `f947cd04-case-2`
  - Task demand (DE): Erkläre Hauptreaktion und Nebenreaktion. Berechne die theoretische CO₂-Stoffmenge, den NCO-Verbrauch und den dann für OH verbleibenden NCO-Vorrat, wenn die angegebenen 2 mmol Wasser den vollständigen gegebenen Zweischrittpfad durchlaufen. Beurteile die Gleichsetzung von Blasen mit erfolgreicher trockener Polyaddition. Plane und begründe einen Trocken-/Feuchtvergleich bei gleichen übrigen Bedingungen sowie eine zusätzliche Restgruppen- oder Umsatzmessung. Erkläre, warum die tatsächlich gemessene Gasmenge durch Löslichkeit oder Gasverlust von der theoretischen Menge abweichen kann.
  - Task demand (EN): Explain main and side reactions. Calculate the theoretical amount of CO₂, NCO consumption and the NCO inventory then remaining for OH if the supplied 2 mmol water undergo the complete given two-step route. Assess whether bubbles prove successful dry polyaddition. Plan and justify a dry/moist comparison with all other conditions matched and an additional residual-group or conversion measurement. Explain why the gas amount actually measured can differ from the theoretical amount through dissolution or gas loss.
  - Expected performance (DE): Trocken entsteht Urethan ohne Gasabspaltung.2 mmol Wasser können 2 mmol CO₂ und nach anschließender Harnstoffbildung 4 mmol NCO-Verbrauch bewirken; für OH bleiben maximal 96 mmol NCO dieses Pfads. Blasen stützen Wassernebenreaktion, nicht Qualität des PU-Netzes. Trocken/feucht bei identischen übrigen Bedingungen sowie Restgruppen-/Umsatzmessung trennen die Effekte; tatsächliche Gasmenge kann durch Löslichkeit/Verlust abweichen.
  - Expected performance (EN): Dry reaction forms urethane without gas elimination.2 mmol water may produce 2 mmol CO₂ and consume 4 mmol NCO after subsequent urea formation, leaving at most 96 mmol NCO for OH in this route. Bubbles support the water side reaction, not PU-network quality. Matched dry/moist controls and residual-group/conversion measurements separate effects; actual gas collection may differ through dissolution or loss.
  - Understanding focus (DE): Fallbezogene Aspekte: Trockene Urethanbildung ohne Gas von Wasser→Amin+CO₂ und anschließender Harnstoffbildung unterscheiden. / 2 mmol H₂O→2 mmol CO₂, bis 4 mmol NCO-Verbrauch; höchstens 96 mmol NCO für OH auf diesem Pfad. / Blasen belegen nicht gutes PU-Netz; matched trocken/feucht plus Restgruppen/Umsatz, Gasverlustgrenze berücksichtigen. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Case-specific aspects: Distinguish dry urethane formation without gas from water→amine+CO₂ and subsequent urea formation. / 2 mmol H₂O→2 mmol CO₂, up to 4 mmol NCO consumed; at most 96 mmol NCO for OH through this path. / Bubbles do not establish a good PU network; matched dry/wet plus residual groups/conversion, allowing gas-loss limits. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
## Page 3: Entsorgung und Recycling von Batterien und Akkumulatoren bewerten

- Full learning-goal ID: `f9e6d689-6e59-59a4-9f21-8c2d44413244`
- Goal fingerprint: `sha256:47b1e60d5879e1c31e6408f3a1749ab12495408d8e4cbf8d8fe4973fa0edd4b0`
- Page fingerprint: `sha256:8b44d90ad341af467f31182a828ed09e31743c76683237ad2a1a471c3e8c84f7`
- Topic path: Vollständige technische Review-Basis (442 Kompetenzen)

### Canonical description

Die lernende Person kann Entsorgung und Recycling von Batterien und Akkumulatoren an geeigneten Beispielen fachlich diskutieren und anhand der Umweltfolgen begründet bewerten.

### Visualization

/assets/goal-visualizations/chemie/f9e6d689-6e59-59a4-9f21-8c2d44413244/f9e6d689-6e59-59a4-9f21-8c2d44413244.png

- original digest: `sha256:4a596cd0ec9e62c3b8911cc1cf876e2c5ecba34e1b2ecbe596191a4080b3e514`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Entsorgung und Recycling von Batterien und Akkumulatoren bewerten — `c5394fb8-9411-5533-b2af-831c4c67b4be` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b6bc6ce16b91fbf66f69c7955dc5f0972218abd20bebf6a75d1f1f4e00f08ce6`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Umweltfolgen von Entsorgung hängen von den enthaltenen Stoffen und davon ab, ob sie kontrolliert erfasst oder in die Umwelt freigesetzt werden. Nicht wiederaufladbare Batterien und Akkumulatoren gehören beide zum betrachteten Umfang; das Betriebsprinzip allein bestimmt nicht das Entsorgungsurteil.
  - Essential understanding (EN): Environmental consequences of disposal depend on contained substances and whether they are controlled or released into the environment. Both non-rechargeable batteries and accumulators are in scope; the operating principle alone does not determine a disposal judgment.
  - Observable performance (DE): Verknüpft in einem Fall zu einer Primärbatterie und einem Akkumulator die gegebenen Stoff- und Freisetzungsangaben mit konkreten Umweltfolgen und unterscheidet Daten von nicht belegten Verallgemeinerungen.
  - Observable performance (EN): Links supplied substance and release information to concrete environmental consequences for a primary battery and an accumulator, distinguishing data from unsupported generalizations.
- `e2`
  - Essential understanding (DE): Kontrollierte Sammlung kann Freisetzung vermeiden; Recycling kann Stoffe zurückgewinnen und neuen Rohstoffbedarf vermindern. Sammlung ist noch keine vollständige Rückgewinnung. Aufbereitung benötigt Ressourcen und Energie und kann Reststoffe hinterlassen.
  - Essential understanding (EN): Controlled collection can avoid releases; recycling can recover substances and reduce demand for new raw materials. Collection is not yet complete recovery. Treatment uses resources and energy and may leave residues.
  - Observable performance (DE): Erklärt anhand der Fallinformationen den Nutzen kontrollierter Erfassung und tatsächlicher Rückgewinnung und benennt zugleich verbleibende Aufbereitungsfolgen; erklärt keine unaufgeforderten industriellen Mechanismen.
  - Observable performance (EN): Explains benefits of controlled collection and actual recovery using the case information while identifying remaining treatment impacts; does not add unrequested industrial mechanisms.
- `e3`
  - Essential understanding (DE): Eine begründete Umweltbewertung verbindet Stofffolgen, Rückgewinnung und die angegebenen Randbedingungen. Unterschiedliche Batteriezusammensetzungen oder Behandlungswege können andere Abwägungen verlangen; ein einzelnes Merkmal beweist keine universelle Rangfolge.
  - Essential understanding (EN): A reasoned environmental assessment connects substance consequences, recovery and supplied conditions. Different battery compositions or treatment routes may require different judgments; one feature does not establish a universal ranking.
  - Observable performance (DE): Diskutiert begründete Handlungsoptionen für beide Spannungsquellen, verteidigt ein bedingtes Urteil gegen eine Fehlbehauptung und überträgt die Begründung auf eine geänderte Zusammensetzung oder Behandlungssituation.
  - Observable performance (EN): Discusses reasoned options for both electrochemical sources, defends a conditional judgment against a misconception and transfers the reasoning to a changed composition or treatment situation.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Primärbatterie und unterschiedliche Akkumulatorzusammensetzung / Primary battery and different accumulator composition
- `v2`: Freisetzungsfolge, kontrollierte Sammlung und Rückgewinnungsumfang / Release impacts, controlled collection and recovery extent
- `v3`: Energie-/Reststoffgrenzen und neue kritische Stofffolge / Energy/residue boundaries and a new critical substance impact

**Application cases**

- `f9e6d689-case-1`
  - Task demand (DE): 1. Diskutiere die Folgen von U und K für P UND Q und verknüpfe Stoffangaben mit Umweltfolgen. 2. Erkläre, was Erfassung und was tatsächliche Rückgewinnung leisten; benenne je einen Nutzen und eine verbleibende Folge der Aufbereitung. 3. Beurteile K gegenüber U unter diesen Angaben. Widerlege oder begrenze: „Bei Q werden viele Metalle zurückgewonnen, also ist Q-Recycling umweltneutral.“ Übertrage deine Begründung auf K*. Keine praktische Behandlung und keine Elektrodenreaktionen sind verlangt.
  - Task demand (EN): 1. Discuss U and K for BOTH P and Q, linking substance information to environmental consequences. 2. Explain what collection and actual recovery achieve; state one benefit and one remaining treatment impact. 3. Assess K against U under these data. Refute or limit: “Much of Q's metal is recovered, so Q recycling is environmentally neutral.” Transfer your reasoning to K*. No practical treatment or electrode reactions are required.
  - Expected performance (DE): U ermöglicht bei P Elektrolytfreisetzung und bei Q zusätzlich Freisetzung umweltkritischer Bleiverbindungen; die gleiche Sammelbezeichnung bedeutet keine gleiche Zusammensetzung. K vermindert diese unkontrollierte Freisetzung. Erfassung hält Abfallstoffe kontrolliert zurück; erst Aufbereitung gewinnt Metallrohstoff zurück. 60 % beziehungsweise 90 % Rückgewinnung können neuen Metallbedarf vermindern, bedeuten aber weder vollständige Stoffrückführung noch Nullfolgen. Energiebedarf und kontrolliert zu behandelnde Reststoffe verbleiben. K ist unter den gegebenen Freisetzungs- und Rückgewinnungsbedingungen gegenüber U begründet vorzuziehen. K* kann den metallischen Reststrom für Q weiter vermindern; positiver Energiebedarf und Folgen der Elektrolyt-/Reststoffbehandlung verschwinden dadurch nicht. Weder K noch K* ist damit pauschal umweltneutral; ein Vergleich aller realen Anlagen ist nicht belegt.
  - Expected performance (EN): U permits electrolyte releases from P and additionally releases of environmentally concerning lead compounds from Q; one collection label does not imply identical composition. K reduces these uncontrolled releases. Collection retains wastes under control; only treatment recovers metal raw material. Recovery of 60% or 90% can reduce new metal demand but means neither complete material return nor zero impacts. Energy use and residues requiring controlled treatment remain. Under the supplied release/recovery conditions, K is a reasoned preference over U. K* may reduce Q's metallic residue further, but positive energy demand and electrolyte/residue-treatment impacts do not disappear. Neither K nor K* is therefore automatically environmentally neutral; a ranking of all real plants is unsupported.
  - Understanding focus (DE): Erklärt für P und Q unterschiedliche enthaltene Stoffe und daraus die in U möglichen Freisetzungsfolgen; K begrenzt diese. / Trennt Erfassung von Rückgewinnung; erklärt Rohstoffnutzen aus 60/90 % und verbleibende Energie-/Reststofffolgen. / Begründet K gegenüber U und überträgt auf K*: vollständige Metallrückgewinnung entfernt nicht Energie-/Elektrolytfolgen.
  - Understanding focus (EN): Explains different contents and resulting possible releases under U for P and Q; K limits them. / Distinguishes collection from recovery; explains raw-material benefits from 60/90% and remaining energy/residue impacts. / Justifies K over U and transfers to K*: full metal recovery does not remove energy/electrolyte impacts.
- `f9e6d689-case-2`
  - Task demand (DE): 1. Erläutere für P und R den Zielkonflikt zwischen Rückgewinnung und Energieaufwand; erkläre, weshalb kontrollierte Erfassung dennoch wichtig bleibt. 2. Diskutiere zwei vertretbare Gewichtungen und gib ein bedingtes Urteil, ohne aus einer Kennzahl eine Gesamtumweltzahl zu machen. 3. Prüfe dein Urteil anhand der neuen R-Information und begründe, ob du es bestätigst oder anpasst. Erkläre, weshalb diese Information nicht automatisch auch P oder alle Akkumulatortypen betrifft. Welche zusätzliche Angabe wäre für ein abschließendes Gesamturteil wichtig?
  - Task demand (EN): 1. Explain the recovery/energy trade-off for P and R and why controlled collection still matters. 2. Discuss two defensible weightings and give a conditional judgment without turning one indicator into an overall environmental score. 3. Review your judgment using the new R information and justify whether you confirm or adjust it. Explain why this information does not automatically apply to P or all accumulator types. What further information would matter for a final overall judgment?
  - Expected performance (DE): Bei beiden Arten kann Erfassung kritische Freisetzungen begrenzen. A gewinnt jeweils mehr Metall zurück, benötigt aber innerhalb der angegebenen Grenze mehr Energie als B. Wer Metallrückführung besonders gewichtet, kann A vorläufig begründet wählen; wer diesen Aufbereitungsenergiebedarf gewichtet, kann B wählen. Keine Gewichtung beweist eine Gesamtumweltrangfolge, weil unter anderem ersetzte Primärrohstoffbereitstellung und weitere Folgen fehlen. Die neue R-Information verändert die stoffliche Umweltfolge: Für R spricht nun die kontrollierte Rückhaltung des kritischen Restes für B, auch bei geringerer Metallrückgewinnung. Für P ist kein entsprechender Befund gegeben; das R-Urteil darf nicht pauschal übertragen werden. Angaben zur Art/Menge und Umweltrelevanz des freigesetzten Restes und zu den sonstigen Folgen würden die Abwägung verbessern. Konstruktions- oder Ladegleichungen sind dafür nicht erforderlich.
  - Expected performance (EN): For both types, collection can limit critical releases. A recovers more metal but uses more energy than B within the stated boundary. Prioritizing metal return can justify a provisional A choice; prioritizing this treatment energy can justify B. Neither weighting proves an overall environmental ranking because displaced primary raw-material supply and other impacts are missing. The new R information changes the material-related environmental consequence: for R, B's control of the critical residue now supports B despite lower metal recovery. No such observation is given for P, so R's judgment must not be generalized. Information about the residue's type/amount and environmental relevance and other impacts would improve the judgment. Construction or charging equations are not required for this reasoning.
  - Understanding focus (DE): Unterscheidet P von Nickel-Metallhydrid-R und erklärt die geänderte kritische Reststofffreisetzung nur für R. / Erklärt mehr Metallrückführung bei A, mehr Energie bei A und Nutzen kontrollierter Erfassung ohne Nullfolgenbehauptung. / Diskutiert zwei Gewichtungen, gibt ein bedingtes Urteil und revidiert R angesichts des Freisetzungsbefunds; nennt relevante fehlende Angaben.
  - Understanding focus (EN): Distinguishes P from nickel-metal-hydride R and explains the changed critical-residue release only for R. / Explains greater metal return and energy use for A and benefits of controlled collection without claiming zero impacts. / Discusses two weightings, gives a conditional judgment and revises R for the release observation; identifies relevant missing information.

# AI review input: Chemie – zwei neue aktuelle Lernzielseiten

- Book ID: `chemie-current439-new459-and-F03-native-two-20261016-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:3c13c29ff3b29577ce82282f8d5a2b085f17710885da8ed26a0d7b6b92affe64`
- Selected goals: 2

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Werkstoffliches Recycling und Monomerrückgewinnung beurteilen

- Full learning-goal ID: `459724db-9f9a-5967-8d9a-2b6277415275`
- Goal fingerprint: `sha256:383313b108c51f3f50a5c146e4c60b1f3e45d457c687d14fadcb5039f07c5e70`
- Page fingerprint: `sha256:24f9bd5f103689fa6f5cefa550cd32f668fccf5d9c1441088840a2c3a6a91b6a`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Quellengebundene Chemie-Ergänzungen

### Canonical description

Die lernende Person kann werkstoffliches Recycling durch Umschmelzen von Thermoplasten und rohstoffliches Recycling am gegebenen Beispiel einer Zerlegung in Monomere fachlich erklären, die überwiegende Erhaltung beziehungsweise Spaltung der Polymerketten unterscheiden und beide Wege für denselben Produktbedarf anhand bereitgestellter Qualitäts-, Ausbeute-, Energie- und Kostendaten ökologisch und ökonomisch begründet beurteilen sowie die Grenzen der Daten benennen.

### Visualization

/assets/goal-visualizations/chemie/459724db-9f9a-5967-8d9a-2b6277415275/459724db-9f9a-5967-8d9a-2b6277415275.png

- original digest: `sha256:d21e3880923a65975d05b8d205a5be09949d9ea9f7fcf51aeb861e92608e7497`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Thermisches Verhalten von Kunststoffen erklären — `3aef6d91-04ff-5ec7-b92e-ccf330d9816a` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ff57ee07135494cd4cd936828f3a53c44ff590eee83288753cf0018071ed0281`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Werkstoffliche Aufbereitung erhält Polymerketten überwiegend; rohstoffliche Monomerrückgewinnung spaltet Ketten, benötigt Aufreinigung und für neues Polymer erneute Polymerisation.
  - Essential understanding (EN): Mechanical processing largely retains polymer chains; feedstock monomer recovery breaks chains and requires purification and repolymerisation for new polymer.
  - Observable performance (DE): Erklärt beide Wege am gegebenen PMMA/MMA-Modell und trennt Monomer, wiederverwendbares Polymer und nicht zurückgewonnenes Material.
  - Observable performance (EN): Explains both routes using the supplied PMMA/MMA model and distinguishes monomer, usable polymer and unrecovered material.
- `e2`
  - Essential understanding (DE): Ökologische/ökonomische Größen werden erst bei gleichem spezifikationsgerechtem Produktbedarf, transparenten Ausbeuten und konsistenten Grenzen vergleichbar.
  - Essential understanding (EN): Environmental/economic quantities become comparable only for the same specification-compliant demand with explicit yields and consistent boundaries.
  - Observable performance (DE): Rechnet bereitgestellte Massen-, Energie- und Kostenwerte auf dieselbe geeignete Produktmenge um und berücksichtigt im Transfer den gegebenen Qualitätsbedarf samt nötigem Neumaterial.
  - Observable performance (EN): Converts supplied mass, energy and cost data to the same suitable output and, in transfer, accounts for the stated quality requirement and necessary virgin material.
- `e3`
  - Essential understanding (DE): Eine Routenwahl folgt begründeten Kriterien und Daten, keine Methode ist durch den Routennamen pauschal ökologisch und ökonomisch überlegen.
  - Essential understanding (EN): A route choice follows explicit criteria and evidence; no route name establishes universal environmental and economic superiority.
  - Observable performance (DE): Begründet eine bedingte Routenwahl, bearbeitet einen Zielkonflikt und begrenzt interessengebundene Immer-Behauptungen mit tatsächlichen Bilanzlücken.
  - Observable performance (EN): Justifies a conditional route choice, weighs a trade-off and bounds interested always claims with actual accounting gaps.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `quality`: Gleiche gesicherte Qualität versus geprüfte Mischung mit notwendigem Neumaterial / Same verified quality versus a tested blend requiring virgin material
- `normalisation`: Pro-kg-Normierung versus inverse Ertrags- und Mischungsbilanz / Per-kg normalisation versus inverse yield and blend balance
- `decision`: Gleichgerichtete Energiekosten und Kosten versus tatsächlicher Zielkonflikt / Aligned energy and cost results versus an actual trade-off

**Application cases**

- `common-recycling-pmma-equivalent-granulate`
  - Task demand (DE): Erkläre an den Ketten-/Monomerangaben beide Wege. Berechne Energie und betrachtete Kosten je1kg gleichwertigem PMMA-Granulat. Wähle vorläufig für den gegebenen Bedarf und prüfe den Werbesatz anhand der Zahlen, Bilanzgrenzen und Quelle.
  - Task demand (EN): Explain both routes using the supplied chain/monomer information. Calculate energy and specified costs per1kg equivalent PMMA granulate. Make a provisional choice for this demand and assess the advertising claim using the data, boundaries and source.
  - Expected performance (DE): Mechanisch bleiben die Ketten überwiegend erhalten; gereinigte Thermoplaste werden erneut aufgeschmolzen. Rohstofflich werden Ketten zu MMA gespalten, MMA wird aufgereinigt und erneut zu PMMA polymerisiert; MMA selbst ist noch kein gleichwertiges Granulat. Mechanisch:40/80=0,50kWh/kg und120/80=1,50Euro/kg. Monomerroute:100/75=1,33kWh/kg und225/75=3,00Euro/kg. Für die gegebenen gleichen Qualitätsanforderungen spricht die betrachtete Energie-/Betriebskostenbilanz vorläufig für die mechanische Route.Mechanisch20kg und bei der Monomerroute25kg liegen außerhalb des jeweiligen Zielprodukts; vollständige geschlossene Rückgewinnung ist nicht gezeigt. Der Immer-Satz widerspricht hier den Betriebskosten und ist ökologisch unbelegt: Energieträger/Emissionen, Hilfsstoffe, Reststoffbehandlung und Transport fehlen; der Anbieter hat ein wirtschaftliches Interesse. Gleiche Qualität und gleiche Grenzen sind Bedingungen des Vergleichs, kein universelles Urteil.
  - Expected performance (EN): Mechanical recycling largely retains the chains and remelts the cleaned thermoplastic. Feedstock recycling breaks chains into MMA, purifies the MMA and polymerises it back into PMMA; MMA alone is not equivalent granulate. Mechanical:40/80=0.50kWh/kg and120/80=1.50euros/kg. Monomer route:100/75=1.33kWh/kg and225/75=3.00euros/kg. For these identical quality requirements, the stated operating-energy/cost comparison provisionally favours mechanical recycling.Mechanical recycling leaves20kg and the monomer route25kg outside their respective target products; complete closed recovery is not demonstrated. The “always” claim conflicts with these operating costs and is environmentally unsupported: energy sources/emissions, auxiliaries, residues and transport are missing; the vendor has a commercial interest. Equal quality and boundaries are conditions of this comparison, not a universal conclusion.
  - Understanding focus (DE): Nur die konkret ausgewiesenen Aspekte der Rubrik werten. Das PMMA/MMA-Modell wird geliefert; geprüft sind Erklärung, gleicher Bedarf, Zahlenbezug und begründete Urteilsgrenzen.
  - Understanding focus (EN): Score only the aspects explicitly listed in the rubric. The PMMA/MMA model is supplied; explanation, the same demand, numerical reference and justified decision limits are assessed.
- `common-recycling-pmma-quality-blend-transfer`
  - Task demand (DE): Stelle für beide Wege60kg spezifikationsgerechtes Granulat bereit. Berechne bei der mechanischen Route Regranulat-/Neumaterialmassen, nötigen Abfalleinsatz, Gesamtenergie und Kosten; berechne dieselben relevanten Größen für die Monomerroute. Erkläre den stofflichen Unterschied und prüfe beide Betreiberaussagen. Begründe eine bedingte ökologische/ökonomische Entscheidung für denselben Gehäusebedarf.
  - Task demand (EN): Supply60kg specification-compliant granulate by each route. For the mechanical route, calculate regranulate/virgin masses, waste required, total energy and costs; calculate the corresponding quantities for the monomer route. Explain the substance-level difference and assess both operator claims. Justify a conditional environmental/economic choice for the same housing demand.
  - Expected performance (DE): Mechanisch braucht man45kg Regranulat+15kg Neumaterial. Für45kg bei90%Ertrag sind50kg Abfall nötig. Energie45·0,40+15·3,00+60·0,10=69kWh; Kosten45·1,00+15·2,00+60·0,20=87Euro. Monomerroute:60/0,85=70,59kg Abfall; Energie60·(85/85)=60kWh; Kosten60·(127,50/85)=90Euro. Mechanisch wird weitgehend dieselbe Kette erneut geformt, die Monomerroute spaltet Ketten und polymerisiert gereinigtes MMA erneut. Beide erfüllen den gegebenen gleichen Bedarf, aber nur mit15kg neuem PMMA im mechanischen Gemisch. Die mechanische Wahl spart im Modell3Euro, die Monomerroute9kWh. Eine Entscheidung hängt daher von offengelegter Gewichtung und fehlenden Umweltdaten ab; beide begründeten bedingten Entscheidungen sind zulässig. Annahmemasse ist keine Produktmasse: pro100kg nur90kg Regranulat oder85kg Monomerroute-PMMA, nicht100kg. Die Energiebehauptung ist im gegebenen Qualitätsfall falsch. Die neuen15kg sowie Restströme widerlegen einen verlustfreien vollständig geschlossenen Kreislauf; Energie ist zudem keine vollständige Ökobilanz.
  - Expected performance (EN): Mechanical route:45kg regranulate+15kg virgin PMMA. At90%yield,45kg regranulate requires50kg waste. Energy45·0.40+15·3.00+60·0.10=69kWh; costs45·1.00+15·2.00+60·0.20=87euros. Monomer route:60/0.85=70.59kg waste; energy60·(85/85)=60kWh; cost60·(127.50/85)=90euros. Mechanical recycling mainly reforms the same chains; the monomer route breaks chains and polymerises purified MMA again. Both satisfy the same supplied demand, but the mechanical blend needs15kg virgin PMMA. Mechanical saves3euros in this model; the monomer route saves9kWh. The choice therefore depends on stated weighting and missing environmental data; either justified conditional choice is acceptable. Reception mass is not product mass:100kg yields90kg regranulate or85kg monomer-route PMMA, not100kg. The energy claim fails for this quality case. The15kg virgin input and residual streams refute a loss-free fully closed cycle; energy is not a complete environmental assessment.
  - Understanding focus (DE): Nur die konkret ausgewiesenen Aspekte der Rubrik werten. Das PMMA/MMA-Modell wird geliefert; geprüft sind Erklärung, gleicher Bedarf, Zahlenbezug und begründete Urteilsgrenzen.
  - Understanding focus (EN): Score only the aspects explicitly listed in the rubric. The PMMA/MMA model is supplied; explanation, the same demand, numerical reference and justified decision limits are assessed.
## Page 2: Temperaturabhängige Löslichkeit und Kristallbildung untersuchen

- Full learning-goal ID: `8b2d351e-e44f-5385-9b89-13ef54b5918f`
- Goal fingerprint: `sha256:fef630484d6d665dc6854761507c64ed8d82230363e378ea77c7638805891894`
- Page fingerprint: `sha256:3f9b81a205c951cb52a1930d6334476243edfe11dfd80741b95133ac7818c170`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Quellengebundene Chemie-Ergänzungen

### Canonical description

Die lernende Person kann in einer freigegebenen und betreuten Untersuchung die Löslichkeit eines Feststoffs bei verschiedenen Temperaturen näherungsweise bestimmen, eigene Mess- und Beobachtungsdaten in einem Löslichkeitsdiagramm darstellen und damit Kristallbildung beim Abkühlen beziehungsweise bei Lösungsmittelverlust begründen; sie unterscheidet Sättigung von einer höheren oder geringeren Stoffkonzentration und benennt Grenzen der Messung.

### Visualization

/assets/goal-visualizations/chemie/8b2d351e-e44f-5385-9b89-13ef54b5918f/8b2d351e-e44f-5385-9b89-13ef54b5918f.png

- original digest: `sha256:5ab0d74e268f86c8adffe1385fbf20e62f84099bab9877a501f66e29e502adeb`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Allgemeine Sicherheitsregeln im Chemielabor anwenden — `13d4f336-ab16-54a7-9479-c920b458f385` (outside this book)
- Löslichkeit und Sättigung aus Daten erklären — `413040cd-ba74-5227-948c-a778b0bd0f56` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4b9863c45b82dc3cc688d8f62bb407929ea4b1f18d286e7efee1a6bfcde30a37`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Eine Untersuchung wird durch kontrollierte Variablen, eigene Durchführung und nachvollziehbare Rohbeobachtungen belegt; bereitgestellte Zahlen sind keine ausgeführteMessung.
  - Essential understanding (EN): An investigation is evidenced by controlled variables, own performance and traceable raw observations; supplied numbers are not performed measurements.
  - Observable performance (DE): Führt den freigegebenen Temperatur-/Kristallisationsvergleich tatsächlich aus, protokolliert eigene Mengen, Temperaturen, Kontrollen und Abweichungen; trennt Modellvergleich von Ausführung.
  - Observable performance (EN): Actually performs the authorised temperature/crystallisation comparison, records own masses, temperatures, controls and deviations, and separates model comparison from execution.
- `e2`
  - Essential understanding (DE): Eine Löslichkeitskurve ordnet einer Temperatur eine normierte Sättigungsgrenze mit Messunsicherheit zu; die Steigung ist stoff- und bereichsabhängig.
  - Essential understanding (EN): A solubility curve assigns a normalised saturation limit with uncertainty to temperature; its slope depends on substance and range.
  - Observable performance (DE): Stellt eigene und Vergleichsdaten mit richtigenAchsen/Einheiten/Intervallen dar, interpoliert nur im begründetenBereich und beurteilt dieAuflösung einer kleinenTemperaturwirkung.
  - Observable performance (EN): Represents own/comparison data with correctaxes/units/intervals, interpolates only over a justifiedrange and assesses resolution of a smalltemperatureeffect.
- `e3`
  - Essential understanding (DE): Kristallbildung folgt aus einer Stoffbilanz relativ zur aktuellenLöslichkeitskapazität; Temperaturänderung und Lösungsmittelverlust sind verschiedene Ursachen.
  - Essential understanding (EN): Crystallisation follows a materialbalance relative to currentdissolvingcapacity; temperaturechange and solventloss are distinctcauses.
  - Observable performance (DE): Erklärt den kontrolliertenAbkühlversuch undC/E-Vergleich, berechnet gelösteMasse/Kristalle/Restkapazität aus den gegebenenGrenzen und trennt Gleichgewichtsmodell vom tatsächlichen beobachtetenErtrag.
  - Observable performance (EN): Explains the controlledcooling andC/Ecomparison, calculates dissolvedmass/crystals/capacity from suppliedlimits and separates equilibrium model from actual observedyield.
- `e4`
  - Essential understanding (DE): Konzentriert/verdünnt ist ein relativer Mengenvergleich; Sättigung ist temperatur- und stoffbezogen. Keine universelleAbkühl- oderKlarheitsregel ersetzt Daten.
  - Essential understanding (EN): Concentrated/dilute is a relativequantitycomparison; saturation depends on substance andtemperature. No universalcooling orclarityrule replacesdata.
  - Observable performance (DE): Begründet neueWassermengen-, flache/abnehmendeKurven- undKlarheitsgegenfälle; fordert fehlendeVerlust-/Zeit-/Temperaturdaten statt konkreteMess-/Kristallmassen zuerfinden.
  - Observable performance (EN): Justifies changedwaterquantity, flat/decreasingcurve andclaritycountercases; requests missingloss/time/temperaturedata rather than inventing measured/crystalmasses.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `slope`: Steile Zunahme gegenüber nahezu flacher und gegeben abnehmenderS(T)-Kurve / Steepincrease versus nearlyflat and supplieddecreasingS(T)curve
- `control`: KonstanteWassermenge beimAbkühlen gegenüber dokumentiertemWasserverlust bei gleicherEndtemperatur / Constantwater oncooling versus documentedwaterloss at the same finaltemperature
- `evidence`: EigeneDurchführung, Messauflösung undKristallisationsverzögerung gegenüber synthetischerGleichgewichtsbilanz / Ownperformance, measurementresolution anddelayedcrystallisation versus synthetic equilibrium balance

**Application cases**

- `f03-a-temperature-capacity-and-cooling`
  - Task demand (DE): Vollmaterial tmp/chemie-m7-resumed-20261016/HE-G9-F03-one-coherent-solubility-crystallisation-investigation-author-candidate-v1/MATERIALS.two-whole-different-DE-EN-F03-cases.AUTHOR.inactive.json #f03-a-temperature-capacity-and-cooling. Führe den freigegebenen Untersuchungsplan tatsächlich aus und gib deinen eigenen Rohdaten-/Beobachtungslog mit Kontrollbedingungen, Wiederholungen und Abweichungen ab. Kennzeichne klar, welche Zahlen von dir stammen und welche nur Vergleichsmaterial sind. Eine Planung oder ein kopiertes Musterprotokoll ersetzt die Durchführung nicht. Normiere die Vergleichsintervalle auf100gWasser. ZeichneT/°C auf derx-Achse undS/(gKNO3 je100gWasser) auf dery-Achse mit Punkten/Intervallen und begründeter Verbindung. Stelle daneben deine eigenen Daten mit ihrer Unsicherheit dar. Berechne unter dem gegebenen Gleichgewichtsmodell, wie viel aus dem3,00g-Ansatz bei20°C kristallisiert; schätze auch die Bandbreite aus dem20°C-Intervall. Für einen neuen, getrennten Modellzustand mit3,00gSalz und5,00gWasser bei35°C soll nur innerhalb30–40°C linear interpoliert werden. Berechne die näherungsweise noch gelöste Masse und Kristallmasse. Unterscheide diese lokale Interpolation von einer bewiesenen linearen Naturgesetzlichkeit. Beurteile: „Die Lösung mit mehr Salz je100gWasser muss gesättigt sein; jede ungesättigte Lösung ist verdünnter als jede gesättigte.“ Vergleiche den40°C-Ansatz60g/100gWasser mit einer bei20°C gesättigten Modelllösung32g/100gWasser. Begründe anschließend den Transfer mit10,00gWasser, weiterhin3,00gSalz, nach Abkühlung auf20°C.
  - Task demand (EN): Complete material tmp/chemie-m7-resumed-20261016/HE-G9-F03-one-coherent-solubility-crystallisation-investigation-author-candidate-v1/MATERIALS.two-whole-different-DE-EN-F03-cases.AUTHOR.inactive.json #f03-a-temperature-capacity-and-cooling. Actually perform the authorised investigation and submit your own raw measurements/observations with controls, repetitions and deviations. Clearly separate your data from the supplied comparison material. A plan or copied model log does not replace execution. Normalise the comparison intervals to100gwater. PlotT/°C horizontally andS/(gKNO3 per100gwater) vertically, showing points/intervals and a justified connecting curve. Show your own values and uncertainty alongside them. Under the stated equilibrium model, calculate how much crystallises from the3.00g sample at20°C and estimate a range using the20°C interval. For a new separate model state with3.00gsolute and5.00gwater at35°C, use linear interpolation only within30–40°C. Estimate dissolved and crystal masses. Distinguish this local interpolation from a proven linear law of nature. Assess “The solution containing more salt per100gwater must be saturated; every unsaturated solution is more dilute than every saturated one.” Compare the40°C sample at60g/100gwater with a20°C saturated model solution at32g/100gwater. Then explain the transfer with10.00gwater, still3.00gsolute, cooled to20°C.
  - Expected performance (DE): Eigene freigegebene Durchführung mit Rohmassen/Temperaturen/Endpunktintervallen, Wiederholung, Wasserverlustkontrolle und echten Kristall- oder Nichtbeobachtungen belegen; ein Vergleichs-/Musterlog ist keine Ausführung. Vergleichsintervalle31–33/45–47/63–65gje100gWasser, Mittelpunkte32/46/64; AchsenT/°C undS/(gSalz je100gWasser), Unsicherheit und stoff-/bereichsgebundene Kurve.3,00g in5,00gWasser:40°C-Kapazität3,20g, bei20°C1,60g gelöst und1,40gKristalle im Gleichgewicht; Intervall1,35–1,45g. S(35)≈55 durch ausdrücklich lokaleInterpolation,2,75g gelöst/0,25gKristalle.60g/100gWasser bei40°C ist ungesättigt und relativ konzentrierter als die20°C gesättigte32erLösung. Mit10gWasser bleiben3g bei20°C gelöst,0,20gKapazität, keineKristalle erforderlich. NasseKristallmasse oder klaresFoto beweisen keinen tatsächlichen trockenenErtrag; verzögerteKristallisation/Übersättigung und fehlendeZeit-/Verlustkontrollen benennen. VollständigeFalllösung und fallbezogeneRubrik im angegebenenWholematerial, unverändert.
  - Expected performance (EN): Demonstrate own authorised execution with raw masses/temperatures/endpoint intervals, repetition, water-loss controls and actual crystal or non-observations; a comparison/model log is not execution. Comparison intervals31–33/45–47/63–65gper100gwater, midpoints32/46/64; axesT/°C andS/(gsolute per100gwater), uncertainty and a substance/range-specific curve. For3.00g in5.00gwater,40°C capacity3.20g; at20°C1.60g dissolved and1.40g equilibrium crystals, range1.35–1.45g. Local interpolation givesS(35)≈55,2.75g dissolved/0.25g crystals.60g/100gwater at40°C is unsaturated yet more concentrated than a20°C saturated32-value solution. With10gwater all3g remains dissolved at20°C,0.20g capacity,no crystals required. Wet crystal mass or a clear photograph does not prove actual dry yield; explain delayed nucleation/supersaturation and missing time/loss controls. Full worked case and specific rubric remain unchanged in the referenced whole material.
  - Understanding focus (DE): Echte spätereDurchführung und eigenständiger neuerKontroll-/Transferfall liefern zwei unterscheidbareEvidenzleistungen innerhalb einerkohärentenUntersuchung; keine automatischeZwei-Praktika-Quota. SynthetischeDaten oderMusterlösung sind keinAusführungsnachweis.
  - Understanding focus (EN): Actualfutureperformance and a genuinelychangedcontrol/transfer supply two distinctevidenceperformances within one coherent investigation; no automatic two-practicals quota. Syntheticdata or a modelsolution are notexecutionevidence.
- `f03-b-flat-curve-and-solvent-loss-controls`
  - Task demand (DE): Vollmaterial tmp/chemie-m7-resumed-20261016/HE-G9-F03-one-coherent-solubility-crystallisation-investigation-author-candidate-v1/MATERIALS.two-whole-different-DE-EN-F03-cases.AUTHOR.inactive.json #f03-b-flat-curve-and-solvent-loss-controls. Führe die freigegebenen Untersuchungen aus und trenne deinen eigenen Rohdaten-/Beobachtungslog ausdrücklich von den Vergleichsdaten. Begründe Versuchsvariablen, Kontrollen und eine angemessene Verbesserung, falls du die kleine Temperaturwirkung nicht auflösen kannst. Zeichne aus den Vergleichsdaten die nahezu flacheS(T)-Kurve, vergleiche sie mit FallA und berechne aus±0,05g in5,00gWasser die normierte Unsicherheit. Darf ein eigener nahezu gleicher Endpunkt als Beweis exakt temperaturunabhängiger Löslichkeit gelten? Berechne für C und E bei20°C gelösteSalzmasse, möglicheKristallmasse und weitereLösekapazität. Erkläre, welche geänderte Größe inE zurKristallbildung führt. Unterscheide das Verhältnis der insgesamt eingebrachtenSalzmasse zumWasser von der Konzentration des tatsächlich gelöstenSalzes nachKristallbildung. Eine neueProbeF enthält bei20°C0,50gNaCl in5,00gWasser. Vergleiche sie mit C hinsichtlich konzentriert/verdünnt und gesättigt/ungesättigt. Übertrage deineBegründung auf den folgenden anderen ModellstoffR: S(20°C)=40 undS(40°C)=20g/100gWasser.1,00gR in5,00gWasser sind bei40°C gesättigt und klar; wie ändert sich derGleichgewichtszustand beimAbkühlen auf20°C ohneWasserverlust?
  - Task demand (EN): Complete material tmp/chemie-m7-resumed-20261016/HE-G9-F03-one-coherent-solubility-crystallisation-investigation-author-candidate-v1/MATERIALS.two-whole-different-DE-EN-F03-cases.AUTHOR.inactive.json #f03-b-flat-curve-and-solvent-loss-controls. Perform the authorised investigations and clearly separate your own raw data/observation log from comparison data. Justify variables/controls and a suitable improvement if the small temperature effect cannot be resolved. Plot the nearly flatS(T) comparison curve, contrast it with caseA, and normalise the±0.05g uncertainty in5.00gwater. Does your own almost unchanged endpoint prove exactly temperature-independent solubility? For C and E at20°C calculate dissolved salt, possible crystal mass and remaining dissolving capacity. Explain which changed quantity produces crystals inE. Distinguish the ratio of total initially added salt to water from the concentration of actually dissolved salt after crystallisation. A new sampleF contains0.50gNaCl in5.00gwater at20°C. Compare it with C for concentrated/dilute and saturated/unsaturated. Transfer the explanation to another model substanceR: S(20°C)=40 andS(40°C)=20g/100gwater.1.00gR in5.00gwater is saturated and clear at40°C; what equilibrium change follows cooling to20°C without water loss?
  - Expected performance (DE): Eigene tatsächlicheNaCl-Durchführung mit Temperatur-/Endpunktdaten undC/E-Massen-/Zeit-/Kristallkontrollen statt Musterergebnis. Kurve(20;36,0),(30;36,3),(40;36,6);±0,05g bei5gWasser entspricht±1,0g/100gWasser, also0,6Differenz nicht sicher auflösbar; keine exakteTemperaturunabhängigkeit behaupten. C:Kapazität1,80g,1,70g gelöst,0Kristalle,0,10gKapazität,ungesättigt. E nach1g belegtemWasserverlust:4gWasser,1,44g gelöst,0,26gKristalle,Kapazität0,gesamt5,70g; Wasserverlust ist hier Ursache bei gleicherEndtemperatur.42,5g/100gWasser ist Gesamtbeschickung inklusiveKristallen, tatsächlichegelösteKonzentration36. F mit10g/100gWasser relativverdünnter alsC34; beideungesättigt. NeuerStoffR mit abnehmendemS(T): beimAbkühlen Kapazität1→2g,alle1g bleiben gelöst,1gRestkapazität. Ohne Anfangs-/Endmassen, Temperaturverlauf undVerlustdaten kein eindeutigerKristallisationsgrund undkeine tatsächlichen0,26g bestätigen. VollständigeFalllösung/Rubrik im angegebenenWholematerial,unverändert.
  - Expected performance (EN): Own actualNaCl execution needs temperature/endpoint data andC/E mass/time/crystal controls, not a model result. Curve(20,36.0),(30,36.3),(40,36.6);±0.05g in5gwater means±1.0g/100gwater, so the0.6difference is not reliably resolved; do not claim exact temperature independence. C:capacity1.80g,1.70g dissolved,0crystals,0.10gcapacity,unsaturated. E after documented1gwater loss:4gwater,1.44g dissolved,0.26gcrystals,capacity0,total5.70g; water loss causes crystals at the same finaltemperature.42.5g/100gwater is total loading including crystals, whereas dissolvedconcentration is36. F at10g/100gwater is relatively more dilute thanC34;both unsaturated. New substanceR with decreasingS(T): on cooling capacity rises1→2g,all1g stays dissolved,1gcapacity remains. Without initial/final masses,temperature history/loss data,certify neither a unique crystallisation cause nor actual0.26gcrystals. Full worked case/rubric remain unchanged in the referenced whole material.
  - Understanding focus (DE): Echte spätereDurchführung und eigenständiger neuerKontroll-/Transferfall liefern zwei unterscheidbareEvidenzleistungen innerhalb einerkohärentenUntersuchung; keine automatischeZwei-Praktika-Quota. SynthetischeDaten oderMusterlösung sind keinAusführungsnachweis.
  - Understanding focus (EN): Actualfutureperformance and a genuinelychangedcontrol/transfer supply two distinctevidenceperformances within one coherent investigation; no automatic two-practicals quota. Syntheticdata or a modelsolution are notexecutionevidence.

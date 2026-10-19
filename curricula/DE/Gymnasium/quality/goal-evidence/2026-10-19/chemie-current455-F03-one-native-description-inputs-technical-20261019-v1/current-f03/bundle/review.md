# AI review input: Chemie: aktuelle F03-Seitenbindung nach operativer Materialpfadkorrektur

- Book ID: `chemie-current455-f03-one-D-20261019-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:7452d75ecdf3886adf50061841f2de11431ccf4f8511380bd6649d2cbc359c10`
- Selected goals: 1

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Temperaturabhängige Löslichkeit und Kristallbildung untersuchen

- Full learning-goal ID: `8b2d351e-e44f-5385-9b89-13ef54b5918f`
- Goal fingerprint: `sha256:fef630484d6d665dc6854761507c64ed8d82230363e378ea77c7638805891894`
- Page fingerprint: `sha256:daebc85d84d9660df05a154c205adca44aa7fa01f7e32c403af64e7371876a81`
- Topic path: Technische aktuelle QA-Basis aller455 gewöhnlichen Chemieziele

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

Status: `needs_human_review`; profile fingerprint: `sha256:28700cdd77e3c62cf3271e8dc464b57bd9e2847c66384875290f0bec84c91bdd`
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
  - Task demand (DE): Vollmaterial curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-reviewed-inactive-checkpoint-20261016-v1/evidence/HE-G9-F03-one-coherent-solubility-crystallisation-investigation-author-candidate-v1/MATERIALS.two-whole-different-DE-EN-F03-cases.AUTHOR.inactive.json #f03-a-temperature-capacity-and-cooling. Führe den freigegebenen Untersuchungsplan tatsächlich aus und gib deinen eigenen Rohdaten-/Beobachtungslog mit Kontrollbedingungen, Wiederholungen und Abweichungen ab. Kennzeichne klar, welche Zahlen von dir stammen und welche nur Vergleichsmaterial sind. Eine Planung oder ein kopiertes Musterprotokoll ersetzt die Durchführung nicht. Normiere die Vergleichsintervalle auf100gWasser. ZeichneT/°C auf derx-Achse undS/(gKNO3 je100gWasser) auf dery-Achse mit Punkten/Intervallen und begründeter Verbindung. Stelle daneben deine eigenen Daten mit ihrer Unsicherheit dar. Berechne unter dem gegebenen Gleichgewichtsmodell, wie viel aus dem3,00g-Ansatz bei20°C kristallisiert; schätze auch die Bandbreite aus dem20°C-Intervall. Für einen neuen, getrennten Modellzustand mit3,00gSalz und5,00gWasser bei35°C soll nur innerhalb30–40°C linear interpoliert werden. Berechne die näherungsweise noch gelöste Masse und Kristallmasse. Unterscheide diese lokale Interpolation von einer bewiesenen linearen Naturgesetzlichkeit. Beurteile: „Die Lösung mit mehr Salz je100gWasser muss gesättigt sein; jede ungesättigte Lösung ist verdünnter als jede gesättigte.“ Vergleiche den40°C-Ansatz60g/100gWasser mit einer bei20°C gesättigten Modelllösung32g/100gWasser. Begründe anschließend den Transfer mit10,00gWasser, weiterhin3,00gSalz, nach Abkühlung auf20°C.
  - Task demand (EN): Complete material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-reviewed-inactive-checkpoint-20261016-v1/evidence/HE-G9-F03-one-coherent-solubility-crystallisation-investigation-author-candidate-v1/MATERIALS.two-whole-different-DE-EN-F03-cases.AUTHOR.inactive.json #f03-a-temperature-capacity-and-cooling. Actually perform the authorised investigation and submit your own raw measurements/observations with controls, repetitions and deviations. Clearly separate your data from the supplied comparison material. A plan or copied model log does not replace execution. Normalise the comparison intervals to100gwater. PlotT/°C horizontally andS/(gKNO3 per100gwater) vertically, showing points/intervals and a justified connecting curve. Show your own values and uncertainty alongside them. Under the stated equilibrium model, calculate how much crystallises from the3.00g sample at20°C and estimate a range using the20°C interval. For a new separate model state with3.00gsolute and5.00gwater at35°C, use linear interpolation only within30–40°C. Estimate dissolved and crystal masses. Distinguish this local interpolation from a proven linear law of nature. Assess “The solution containing more salt per100gwater must be saturated; every unsaturated solution is more dilute than every saturated one.” Compare the40°C sample at60g/100gwater with a20°C saturated model solution at32g/100gwater. Then explain the transfer with10.00gwater, still3.00gsolute, cooled to20°C.
  - Expected performance (DE): Eigene freigegebene Durchführung mit Rohmassen/Temperaturen/Endpunktintervallen, Wiederholung, Wasserverlustkontrolle und echten Kristall- oder Nichtbeobachtungen belegen; ein Vergleichs-/Musterlog ist keine Ausführung. Vergleichsintervalle31–33/45–47/63–65gje100gWasser, Mittelpunkte32/46/64; AchsenT/°C undS/(gSalz je100gWasser), Unsicherheit und stoff-/bereichsgebundene Kurve.3,00g in5,00gWasser:40°C-Kapazität3,20g, bei20°C1,60g gelöst und1,40gKristalle im Gleichgewicht; Intervall1,35–1,45g. S(35)≈55 durch ausdrücklich lokaleInterpolation,2,75g gelöst/0,25gKristalle.60g/100gWasser bei40°C ist ungesättigt und relativ konzentrierter als die20°C gesättigte32erLösung. Mit10gWasser bleiben3g bei20°C gelöst,0,20gKapazität, keineKristalle erforderlich. NasseKristallmasse oder klaresFoto beweisen keinen tatsächlichen trockenenErtrag; verzögerteKristallisation/Übersättigung und fehlendeZeit-/Verlustkontrollen benennen. VollständigeFalllösung und fallbezogeneRubrik im angegebenenWholematerial, unverändert.
  - Expected performance (EN): Demonstrate own authorised execution with raw masses/temperatures/endpoint intervals, repetition, water-loss controls and actual crystal or non-observations; a comparison/model log is not execution. Comparison intervals31–33/45–47/63–65gper100gwater, midpoints32/46/64; axesT/°C andS/(gsolute per100gwater), uncertainty and a substance/range-specific curve. For3.00g in5.00gwater,40°C capacity3.20g; at20°C1.60g dissolved and1.40g equilibrium crystals, range1.35–1.45g. Local interpolation givesS(35)≈55,2.75g dissolved/0.25g crystals.60g/100gwater at40°C is unsaturated yet more concentrated than a20°C saturated32-value solution. With10gwater all3g remains dissolved at20°C,0.20g capacity,no crystals required. Wet crystal mass or a clear photograph does not prove actual dry yield; explain delayed nucleation/supersaturation and missing time/loss controls. Full worked case and specific rubric remain unchanged in the referenced whole material.
  - Understanding focus (DE): Echte spätereDurchführung und eigenständiger neuerKontroll-/Transferfall liefern zwei unterscheidbareEvidenzleistungen innerhalb einerkohärentenUntersuchung; keine automatischeZwei-Praktika-Quota. SynthetischeDaten oderMusterlösung sind keinAusführungsnachweis.
  - Understanding focus (EN): Actualfutureperformance and a genuinelychangedcontrol/transfer supply two distinctevidenceperformances within one coherent investigation; no automatic two-practicals quota. Syntheticdata or a modelsolution are notexecutionevidence.
- `f03-b-flat-curve-and-solvent-loss-controls`
  - Task demand (DE): Vollmaterial curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-reviewed-inactive-checkpoint-20261016-v1/evidence/HE-G9-F03-one-coherent-solubility-crystallisation-investigation-author-candidate-v1/MATERIALS.two-whole-different-DE-EN-F03-cases.AUTHOR.inactive.json #f03-b-flat-curve-and-solvent-loss-controls. Führe die freigegebenen Untersuchungen aus und trenne deinen eigenen Rohdaten-/Beobachtungslog ausdrücklich von den Vergleichsdaten. Begründe Versuchsvariablen, Kontrollen und eine angemessene Verbesserung, falls du die kleine Temperaturwirkung nicht auflösen kannst. Zeichne aus den Vergleichsdaten die nahezu flacheS(T)-Kurve, vergleiche sie mit FallA und berechne aus±0,05g in5,00gWasser die normierte Unsicherheit. Darf ein eigener nahezu gleicher Endpunkt als Beweis exakt temperaturunabhängiger Löslichkeit gelten? Berechne für C und E bei20°C gelösteSalzmasse, möglicheKristallmasse und weitereLösekapazität. Erkläre, welche geänderte Größe inE zurKristallbildung führt. Unterscheide das Verhältnis der insgesamt eingebrachtenSalzmasse zumWasser von der Konzentration des tatsächlich gelöstenSalzes nachKristallbildung. Eine neueProbeF enthält bei20°C0,50gNaCl in5,00gWasser. Vergleiche sie mit C hinsichtlich konzentriert/verdünnt und gesättigt/ungesättigt. Übertrage deineBegründung auf den folgenden anderen ModellstoffR: S(20°C)=40 undS(40°C)=20g/100gWasser.1,00gR in5,00gWasser sind bei40°C gesättigt und klar; wie ändert sich derGleichgewichtszustand beimAbkühlen auf20°C ohneWasserverlust?
  - Task demand (EN): Complete material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-reviewed-inactive-checkpoint-20261016-v1/evidence/HE-G9-F03-one-coherent-solubility-crystallisation-investigation-author-candidate-v1/MATERIALS.two-whole-different-DE-EN-F03-cases.AUTHOR.inactive.json #f03-b-flat-curve-and-solvent-loss-controls. Perform the authorised investigations and clearly separate your own raw data/observation log from comparison data. Justify variables/controls and a suitable improvement if the small temperature effect cannot be resolved. Plot the nearly flatS(T) comparison curve, contrast it with caseA, and normalise the±0.05g uncertainty in5.00gwater. Does your own almost unchanged endpoint prove exactly temperature-independent solubility? For C and E at20°C calculate dissolved salt, possible crystal mass and remaining dissolving capacity. Explain which changed quantity produces crystals inE. Distinguish the ratio of total initially added salt to water from the concentration of actually dissolved salt after crystallisation. A new sampleF contains0.50gNaCl in5.00gwater at20°C. Compare it with C for concentrated/dilute and saturated/unsaturated. Transfer the explanation to another model substanceR: S(20°C)=40 andS(40°C)=20g/100gwater.1.00gR in5.00gwater is saturated and clear at40°C; what equilibrium change follows cooling to20°C without water loss?
  - Expected performance (DE): Eigene tatsächlicheNaCl-Durchführung mit Temperatur-/Endpunktdaten undC/E-Massen-/Zeit-/Kristallkontrollen statt Musterergebnis. Kurve(20;36,0),(30;36,3),(40;36,6);±0,05g bei5gWasser entspricht±1,0g/100gWasser, also0,6Differenz nicht sicher auflösbar; keine exakteTemperaturunabhängigkeit behaupten. C:Kapazität1,80g,1,70g gelöst,0Kristalle,0,10gKapazität,ungesättigt. E nach1g belegtemWasserverlust:4gWasser,1,44g gelöst,0,26gKristalle,Kapazität0,gesamt5,70g; Wasserverlust ist hier Ursache bei gleicherEndtemperatur.42,5g/100gWasser ist Gesamtbeschickung inklusiveKristallen, tatsächlichegelösteKonzentration36. F mit10g/100gWasser relativverdünnter alsC34; beideungesättigt. NeuerStoffR mit abnehmendemS(T): beimAbkühlen Kapazität1→2g,alle1g bleiben gelöst,1gRestkapazität. Ohne Anfangs-/Endmassen, Temperaturverlauf undVerlustdaten kein eindeutigerKristallisationsgrund undkeine tatsächlichen0,26g bestätigen. VollständigeFalllösung/Rubrik im angegebenenWholematerial,unverändert.
  - Expected performance (EN): Own actualNaCl execution needs temperature/endpoint data andC/E mass/time/crystal controls, not a model result. Curve(20,36.0),(30,36.3),(40,36.6);±0.05g in5gwater means±1.0g/100gwater, so the0.6difference is not reliably resolved; do not claim exact temperature independence. C:capacity1.80g,1.70g dissolved,0crystals,0.10gcapacity,unsaturated. E after documented1gwater loss:4gwater,1.44g dissolved,0.26gcrystals,capacity0,total5.70g; water loss causes crystals at the same finaltemperature.42.5g/100gwater is total loading including crystals, whereas dissolvedconcentration is36. F at10g/100gwater is relatively more dilute thanC34;both unsaturated. New substanceR with decreasingS(T): on cooling capacity rises1→2g,all1g stays dissolved,1gcapacity remains. Without initial/final masses,temperature history/loss data,certify neither a unique crystallisation cause nor actual0.26gcrystals. Full worked case/rubric remain unchanged in the referenced whole material.
  - Understanding focus (DE): Echte spätereDurchführung und eigenständiger neuerKontroll-/Transferfall liefern zwei unterscheidbareEvidenzleistungen innerhalb einerkohärentenUntersuchung; keine automatischeZwei-Praktika-Quota. SynthetischeDaten oderMusterlösung sind keinAusführungsnachweis.
  - Understanding focus (EN): Actualfutureperformance and a genuinelychangedcontrol/transfer supply two distinctevidenceperformances within one coherent investigation; no automatic two-practicals quota. Syntheticdata or a modelsolution are notexecutionevidence.

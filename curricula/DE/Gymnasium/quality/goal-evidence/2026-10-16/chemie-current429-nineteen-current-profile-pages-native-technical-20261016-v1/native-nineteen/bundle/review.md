# AI review input: Chemie – 19 aktuelle Lernzielseiten zur unabhängigen Beschreibungsprüfung

- Book ID: `chemie-current429-nineteen-current-profile-pages-20261016-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:40a06c159eda8a8c45a6b925b48d047324ea0341039fc1ae51e04398a4a6bf49`
- Selected goals: 19

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Oxidationszahlen bestimmen und bilanzieren

- Full learning-goal ID: `4961130b-1ee8-58f2-a319-dff0a864db6a`
- Goal fingerprint: `sha256:6bc7615ac2ad8ea769aef2f2d37e9038ed39ef3bb70a4a7907b7dbf8c1dea23b`
- Page fingerprint: `sha256:2489c63bb2e7e03f113e6cf3afa2d563fec18712aac1b9573d3d3574c92069f4`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Einführungsphase Reaktionsgrundlagen > Redoxreaktionen

### Canonical description

Die lernende Person kann Oxidationszahlen für Atome in anorganischen und organischen Teilchen herleiten, Redoxreaktionen identifizieren und Redoxgleichungen mithilfe von Oxidationszahlen ausgleichen.

### Visualization

/assets/goal-visualizations/chemie/4961130b-1ee8-58f2-a319-dff0a864db6a/4961130b-1ee8-58f2-a319-dff0a864db6a.jpg

- original digest: `sha256:2c067dd25c56802a9fa4ef0f6614682f587f7acf1fcd0e1179b0a0c46860fe4d`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Saure, alkalische und neutrale Lösungen unterscheiden — `d2ccd1d5-56f7-583f-9724-e97441367f91` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Zitronenbatterie und Metallvergleich — `23fc54ce-3519-5292-af90-71bc869f4ff1` (outside this book)
- Redox- und Säure-Base-Reaktionen unterscheiden — `1f30d81c-8a26-5675-8c0a-1cb82e96d3ba` (outside this book)
- Redoxtitrationen am Beispiel Manganometrie deuten — `2fdd759f-8349-5f7e-b29a-6ac7fb0299f9` (outside this book)
- Energiekonzept auf Donator-Akzeptor-Reaktionen anwenden — `cc803809-fa7f-517c-b356-9f2f7caf21a5` (outside this book)
- Triphenylmethanfarbstoff-Synthese mechanistisch darstellen — `53db04a0-ea76-5810-9526-c8639100e497` (outside this book)
- Küpenfärbung erklären und durchführen — `63e0d92b-d86a-53c2-aa0a-bc985fc85174` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ac6bd6a3b6c0b77e50f19a56ff82861eef6428c727d08bf2625af89acf76312b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `g1`
  - Essential understanding (DE): Oxidationszahlen sind formale atombezogene Elektronenbilanzen und keine Ionenladungen.
  - Essential understanding (EN): Oxidation numbers are formal atomwise electron accounts, not ionic charges.
  - Observable performance (DE): Leite Oxidationszahlen an anorganischen und organischen C-Zentren her und unterscheide unveränderte Neutralisation von Redox.
  - Observable performance (EN): Derive numbers for inorganic and organic carbon sites, distinguishing unchanged neutralisation from redox.
- `g2`
  - Essential understanding (DE): Elektronenabgabe und -aufnahme müssen sich in der Gesamtbilanz ausgleichen.
  - Essential understanding (EN): Electron loss and gain must balance overall.
  - Observable performance (DE): Entwickle und prüfe stöchiometrisch korrekte Redoxbilanzen einschließlich Atomen und Ladung.
  - Observable performance (EN): Construct/check stoichiometric redox balances with atoms and charge.

**Coverage expectations**

- required expectations: `g1`, `g2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `inorganic-organic`: Anorganische Ionen gegenüber lokalen C-Atomen in Molekülen. / Inorganic ions versus local carbon atoms in molecules.
- `redox-not-redox`: Elektronenbilanz gegenüber reiner Protonenübertragung. / Electron balance versus pure proton transfer.
- `medium`: Saure Ionenbilanz gegenüber gegebener neutraler organischer Umsetzung. / Acidic ionic balance versus a stated neutral organic transformation.

**Application cases**

- `redox-1`
  - Task demand (DE): Leite für MnO4−/Mn2+ und Fe2+/Fe3+ in saurer Lösung die Oxidationszahlen her, entwickle die Gesamtgleichung und prüfe Atome/Ladung. Vergleiche HCl/NaOH als Gegenbeispiel.
  - Task demand (EN): Derive oxidation numbers for acidic MnO4−/Mn2+ and Fe2+/Fe3+, construct the overall equation, check atoms/charge and compare HCl/NaOH as a counterexample.
  - Expected performance (DE): Mn +VII→+II nimmt formal 5e− auf; Fe +II→+III gibt 1e− ab. MnO4−+8H++5Fe2+→Mn2++4H2O+5Fe3+ ist atom- und ladungserhaltend. Neutralisation ändert die Oxidationszahlen nicht.
  - Expected performance (EN): Mn +VII→+II formally gains 5e− and Fe +II→+III loses 1e−. MnO4−+8H++5Fe2+→Mn2++4H2O+5Fe3+ conserves atoms and charge. Neutralisation does not change oxidation numbers.
  - Understanding focus (DE): Atombezogene formale Bilanz statt Gleichsetzung mit der Gesamtladung.
  - Understanding focus (EN): Atomwise formal accounting rather than equating oxidation number with whole-ion charge.
- `redox-2`
  - Task demand (DE): Leite lokale C-Werte aus Ethanol/Ethanal-Strukturen und CuO her; bilanziere die gegebene Umsetzung und beurteile die Behauptung einer Sauerstoffaufnahme.
  - Task demand (EN): Derive local carbon values from ethanol/ethanal and CuO, balance the supplied transformation and assess the oxygen-gain claim.
  - Expected performance (DE): CH3-C bleibt −III; reagierendes C steigt −I→+I und Cu sinkt +II→0. CH3CH2OH+CuO→CH3CHO+Cu+H2O. Die organische O-Zahl bleibt gleich; die formale Bilanz beweist keinen Mechanismus.
  - Expected performance (EN): CH3 carbon remains −III; the reacting carbon changes −I→+I and copper +II→0. CH3CH2OH+CuO→CH3CHO+Cu+H2O. Organic oxygen count is unchanged; formal accounting proves no mechanism.
  - Understanding focus (DE): Transfer von Ionen zum lokalen organischen Reaktionszentrum.
  - Understanding focus (EN): Transfer from ions to a local organic reaction site.
## Page 2: Lösungen berechnen und pH bestimmen

- Full learning-goal ID: `f1ed86f0-534d-57d7-8952-a004a331cc54`
- Goal fingerprint: `sha256:78542036d20cea40c63b1971734d951f673b10e8fcd0b954a560a26fa9926235`
- Page fingerprint: `sha256:4c9a32ad0dba0436e337d813c721cb803d292835b8420fa4420793458ffb9ee9`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Einführungsphase Reaktionsgrundlagen > Protolysereaktionen

### Canonical description

Die lernende Person kann Stoffmengen, Konzentrationen und pH-Werte starker Säuren und Basen berechnen, saure oder basische Lösungen definierter Stoffmengenkonzentration herstellen und Messergebnisse plausibilisieren.

### Visualization

/assets/goal-visualizations/chemie/f1ed86f0-534d-57d7-8952-a004a331cc54/f1ed86f0-534d-57d7-8952-a004a331cc54.jpg

- original digest: `sha256:30dae90ab464b3ce052dffcbb5f736b19f5ef6faf0f30d5f04fa348c93de6417`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Titrationskurven datengestützt deuten — `28c90c6a-3020-5c51-ac40-d802f3f12d2d` (page 7)
- Konduktometrische Fällungstitrationen durchführen und auswerten — `7c0b944d-3f1f-5d26-84b0-2a359f689cf0` (page 19)

### Prerequisites outside this book

- Lösungen nach Arbeitsanweisung herstellen — `1351706f-4ea6-56e9-951b-87b24cbcdee8` (outside this book)
- Saure, alkalische und neutrale Lösungen unterscheiden — `d2ccd1d5-56f7-583f-9724-e97441367f91` (outside this book)
- Arrhenius-Definitionen wiederholen — `28bb9d15-f865-5843-a035-6066580fea64` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Antazida im Magensafttest — `9746ff9a-c423-5504-9d4d-0fced93fa382` (outside this book)
- Säure-Base-Titrationen planen — `02634fdd-c8ba-591a-b240-77129b1bebb8` (outside this book)
- Faraday-Gesetze quantitativ nutzen — `b8c8f70f-64cb-50b1-970c-e0c4295da3fb` (outside this book)
- Komplexometrische EDTA-Titrationen durchführen — `e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f` (outside this book)
- Fotometrische Konzentrationsbestimmungen auswerten — `ba621c67-b750-5e45-ab37-a51ea45e3ccf` (outside this book)
- Verdauungssäfte chemisch erklären — `3681e688-7880-5bb4-9ab9-ef78289345c8` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f91126bbb75c03f8b75459a705fe63e25a92a8471991f45c5f01e7ace1aac1e0`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `g1`
  - Essential understanding (DE): Verdünnung erhält die gelöste Stoffmenge; definiertes Endvolumen bestimmt die Konzentration.
  - Essential understanding (EN): Dilution conserves dissolved amount; final volume determines concentration.
  - Observable performance (DE): Berechne Stoffmengen/Stockvolumina für starke Säure und mehrwertige Base, begründe Stöchiometrie und Geräte.
  - Observable performance (EN): Calculate acid/divalent-base amounts and stock volumes, justifying stoichiometry/apparatus.
- `g2`
  - Essential understanding (DE): Eine hergestellte Lösung und ihr pH brauchen eigene beobachtete Herstellung und kalibrierte Messung.
  - Essential understanding (EN): Prepared solution and pH require observed personal preparation/calibrated measurement.
  - Observable performance (DE): Führe die freigegebene Herstellung/Messung tatsächlich durch und plausibilisiere eigene Werte einschließlich Wassergrenze und Fehlerprüfung.
  - Observable performance (EN): Actually prepare/measure and assess personal values including water-limit/error checks.

**Coverage expectations**

- required expectations: `g1`, `g2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `acid-base-stoichiometry`: Starke einprotonige Säure gegenüber zweiwertigem Hydroxid und NaOH-Vergleich. / Strong monoprotic acid versus divalent hydroxide and NaOH comparison.
- `concentration-regime`: Normale Verdünnung gegenüber idealer Extremverdünnung mit Autoprotolyse. / Ordinary dilution versus ideal extreme dilution including autoprotolysis.
- `actual-data`: Beobachtete Herstellung/Messung gegenüber vorgegebenen Daten und Fehlersuche. / Observed preparation/measurement versus supplied data and troubleshooting.

**Application cases**

- `solution-1`
  - Task demand (DE): Berechne und begründe 250,0 mL 0,0100 M HCl aus 0,100 M Stock. Stelle und miss die Lösung unter Aufsicht tatsächlich her. Prüfe die Vergleichswerte und die getrennte ideale 10−8-M-Probe mit der gegebenen Bilanzlösung.
  - Task demand (EN): Calculate and justify 250.0 mL 0.0100 M HCl from 0.100 M stock. Actually prepare and measure it under supervision. Assess comparison readings and the separate ideal 10−8-M sample using the supplied balance solution.
  - Expected performance (DE): 2,50 mmol und 25,00 mL Stock; auf Endvolumen auffüllen, kalibriert messen und eigene Handlungen/Rohwerte dokumentieren. pH≈2; 3,02 ist ein Prüfhinweis, keine bewiesene Fehlerursache. Die ideale Extremverdünnung ergibt pH≈6,978 statt 8.
  - Expected performance (EN): 2.50 mmol and 25.00 mL stock; make up to final volume, measure with calibration and document own actions/raw readings. pH≈2; 3.02 prompts checks but proves no specific cause. Ideal extreme dilution gives pH≈6.978, not 8.
  - Understanding focus (DE): Stoffmengenerhaltung, kontrollierte tatsächliche Herstellung und begründete Modellgrenze.
  - Understanding focus (EN): Amount conservation, controlled actual preparation and a justified model limit.
- `solution-2`
  - Task demand (DE): Verdünne unter Aufsicht 25,00 mL 0,00250 M Ca(OH)2 auf 250,0 mL; berechne Masse/Konzentration/pH und vergleiche NaOH bei gleicher formaler Konzentration sowie die gelieferten Messwerte.
  - Task demand (EN): Under supervision dilute 25.00 mL 0.00250 M Ca(OH)2 to 250.0 mL; calculate mass/concentration/pH and compare NaOH at equal formal concentration and the supplied readings.
  - Expected performance (DE): c=2,500·10−4 M, gelöst 4,631 mg, [OH−]=2c und pH≈10,699. NaOH hat pH≈10,398. Eigene beobachtete Herstellung/Messung bleibt erforderlich; CO2, Aktivität und Messung begrenzen den Vergleich.
  - Expected performance (EN): c=2.500·10−4 M, dissolved mass 4.631 mg, [OH−]=2c and pH≈10.699. NaOH gives pH≈10.398. Own observed preparation/measurement is required; CO2, activity and measurement limit comparison.
  - Understanding focus (DE): Geänderte Hydroxidstöchiometrie, keine automatische Übertragung auf NH3.
  - Understanding focus (EN): Changed hydroxide stoichiometry, with no automatic extension to NH3.
## Page 3: Säure-Base-Paare vergleichen

- Full learning-goal ID: `b4777001-f4ed-5fe9-9d98-02319abdea09`
- Goal fingerprint: `sha256:0a305eca237674d462046fe8a6d980667988fcde46bbd9427db1509a6eccd0f9`
- Page fingerprint: `sha256:9fa2f014464d87160ff6af6aee88c6af636f976cd1c0ed26d5d0e7b5680544a1`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Einführungsphase Reaktionsgrundlagen > Protolysereaktionen

### Canonical description

Die lernende Person kann die bevorzugte Richtung einer Protonenübertragung für vorgegebene korrespondierende Säure-Base-Paare anhand angegebener relativer Säure- und Basenstärken begründen, die partnerabhängigen Protonendonator- und Protonenakzeptorrollen auch bei Ampholyten vergleichen und die Grenzen dieser qualitativen Modellvorhersage erläutern.

### Visualization

/assets/goal-visualizations/chemie/b4777001-f4ed-5fe9-9d98-02319abdea09/b4777001-f4ed-5fe9-9d98-02319abdea09.jpg

- original digest: `sha256:2acefe63cdd0fd4a23919410d825d67445bd6ed61ebad4ce3fae7887b8fd9be5`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Brønsted-Konzept anwenden — `1c1420c2-a8e2-520f-8015-6df637a973bd` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Antazida im Magensafttest — `9746ff9a-c423-5504-9d4d-0fced93fa382` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:fab92ecdd8143ab8685f25929fee60aca2a89dfaddac09f00f321d0225ceb699`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `p-pairs`
  - Essential understanding (DE): Korrespondierende Paare unterscheiden sich um H+; Rollen hängen vom Partner ab und stützen denselben Richtungsvergleich.
  - Essential understanding (EN): Conjugate pairs differ by H+; roles depend on the partner and support the same direction comparison.
  - Observable performance (DE): Formuliert und prüft die im vorgelegten Fall benötigten Protonenübertragungen und erläutert die wechselnde Rolle im Ampholytfall.
  - Observable performance (EN): Constructs and checks the proton transfers needed for the supplied case and explains the changing role in an amphiprotic transfer.
- `p-direction`
  - Essential understanding (DE): Eine ausdrücklich vorgegebene relative Stärkenordnung ermöglicht eine qualitative Begründung der bevorzugten Gleichgewichtsseite.
  - Essential understanding (EN): An explicitly supplied relative-strength order supports qualitative justification of the favored equilibrium side.
  - Observable performance (DE): Verknüpft die angegebenen Donator-/Akzeptorstärken mit der Produkt-/Eduktpräferenz, ohne eine ungestützte Konstante herzuleiten.
  - Observable performance (EN): Links the supplied donor/acceptor strengths to product/reactant preference without deriving an unsupported constant.
- `p-limits`
  - Essential understanding (DE): Qualitative Bevorzugung ist keine quantitative Zusammensetzung, vollständige Umsetzung oder Geschwindigkeitsvorhersage; Systemgrenzen sind Teil der Modellannahmen.
  - Essential understanding (EN): Qualitative preference gives neither quantitative composition, completion nor rate; system boundaries form part of the model assumptions.
  - Observable performance (DE): Begrenzt die Folgerungen und benennt im CO2-Fall die Bestandsänderung beim Öffnen ohne neue Zahl.
  - Observable performance (EN): Bounds the conclusions and identifies inventory change on opening the CO2system without giving a new number.

**Coverage expectations**

- required expectations: `p-pairs`, `p-direction`, `p-limits`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `partner-role`: Säure/Ammoniak gegenüber partnerabhängigem HCO3−. / Acid/ammonia versus partner-dependent HCO3−.
- `system-limit`: Geschlossene Modellannahme und mögliche Bestandsänderung bei CO2-Verlust. / Closed-model assumption versus possible inventory change through CO2 loss.

**Application cases**

- `pair-1`
  - Task demand (DE): Formuliere die reversible Protonenübertragung, benenne beide korrespondierenden Paare und die beteiligten Donator-/Akzeptorrollen und prüfe Atome sowie Ladung.
Begründe aus der ausdrücklich gegebenen relativen Stärkenordnung die bevorzugte Seite. Erläutere, weshalb die Begründung über Protonendonator und Protonenakzeptor zusammenpassen muss. Eine K-Herleitung ist nicht verlangt.
Erkläre, warum aus dieser qualitativen Angabe weder eine Zahlenkonstante oder genaue Zusammensetzung noch Geschwindigkeit, Stoffidentität oder garantiert vollständige Umsetzung folgen.
  - Task demand (EN): Write the reversible proton transfer, identify both conjugate pairs and donor/acceptor roles, and check atoms and charge.
Use the explicitly supplied relative-strength order to justify the favored side. Explain why the proton-donor and proton-acceptor comparisons must agree. Deriving K is not required.
Explain why this qualitative information gives neither a numerical constant or exact composition nor rate, substance identity or guaranteed complete conversion.
  - Expected performance (DE): CH3COOH+NH3⇌CH3COO−+NH4+. CH3COOH ist hier Donator, NH3 Akzeptor; die Paare CH3COOH/CH3COO− und NH4+/NH3 unterscheiden sich jeweils um H+. Ladung 0 auf beiden Seiten; alle Atome bleiben erhalten. Nach den vorgegebenen relativen Stärken steht links die stärkere Säure mit der stärkeren Base, rechts das schwächere Paar; die Produktseite ist im angegebenen Modell bevorzugt. Rollen und Stärkevergleiche sind auf diese Partner bezogen. Die qualitative Ordnung legt weder einen Zahlenwert für K noch die Gleichgewichtszusammensetzung fest; dafür wären weitere Gleichgewichts-/Mengen-/Aktivitätsdaten nötig. Bevorzugung ist keine Garantie irreversibler vollständiger Umsetzung und sagt nichts über Geschwindigkeit oder Stoffidentität.
  - Expected performance (EN): CH3COOH+NH3⇌CH3COO−+NH4+. Here CH3COOH donates and NH3 accepts a proton; the pairs CH3COOH/CH3COO− and NH4+/NH3 each differ by H+. Both sides have charge 0 and conserve all atoms. The supplied strengths place the stronger acid and stronger base on the left and the weaker pair on the right, so products are favored in the stated model. Roles and strength comparisons concern these partners. The qualitative order determines neither numerical K nor equilibrium composition; further equilibrium/amount/activity data would be needed. Preference does not establish irreversible completion, a reaction rate, or substance identity.
  - Understanding focus (DE): Partnerbezogene Rollen, Richtung aus der gegebenen Stärkenordnung und begrenzte qualitative Schlussfolgerung.
  - Understanding focus (EN): Partner-dependent roles, direction from supplied relative strengths and bounded qualitative inference.
- `pair-2`
  - Task demand (DE): Formuliere die Reaktionen von HCO3− mit H3O+ und mit OH−; prüfe Atome/Ladungen und begründe die jeweils wechselnde Rolle anhand aller korrespondierenden Paare.
Begründe die bevorzugte Seite der OH−-Reaktion allein aus der gegebenen relativen Donator-/Akzeptorstärke. Trenne die partnerabhängige Rolle von einem festen Stoffetikett. Eine Berechnung aus Ka2/Kw ist nicht verlangt.
Begrenze die Aussage zu Gleichgewichtszusammensetzung, vollständiger Umsetzung und Geschwindigkeit. Erkläre, weshalb möglicher CO2-Verlust nach Öffnen eine andere Systemgrenze erzeugt, ohne einen neuen Zahlenwert zu behaupten.
  - Task demand (EN): Write the reactions of HCO3− with H3O+ and OH−; check atoms/charges and justify its changing role using all conjugate pairs.
Justify the favored side of the OH− reaction using only the supplied relative donor/acceptor strengths. Distinguish the partner-dependent role from a fixed substance label. Calculation from Ka2/Kw is not required.
Bound the conclusions about equilibrium composition, completion and rate. Explain why possible CO2 loss after opening changes the system boundary without claiming a new numerical value.
  - Expected performance (DE): HCO3−+H3O+⇌H2CO3+H2O: HCO3− nimmt H+ auf; Paare H2CO3/HCO3− und H3O+/H2O. Beide Seiten C1, H4, O4, Ladung 0. HCO3−+OH−⇌CO3²−+H2O: HCO3− gibt H+ ab; Paare HCO3−/CO3²− und H2O/OH−. Beide Seiten C1, H2, O4, Ladung −2. Dasselbe Teilchen wirkt abhängig vom Partner als Akzeptor oder Donator. Aus der gegebenen relativen Stärke ist für die OH−-Reaktion die Produktseite mit schwächerem Donator und Akzeptor bevorzugt. Es folgt keine numerische Konstante, exakte Verteilung, Geschwindigkeits- oder Vollständigkeitsgarantie. CO2-Verlust verändert den Stoffbestand und verlässt die geschlossene Systemannahme; ohne neue Bestandsdaten ist kein neuer Zahlenzustand bestimmt.
  - Expected performance (EN): HCO3−+H3O+⇌H2CO3+H2O: HCO3− accepts H+; pairs H2CO3/HCO3− and H3O+/H2O. Both sides have C1, H4, O4, charge 0. HCO3−+OH−⇌CO3²−+H2O: HCO3− donates H+; pairs HCO3−/CO3²− and H2O/OH−. Both sides have C1, H2, O4, charge −2. The same species acts as acceptor or donor depending on its partner. The supplied relative strengths favor products with the weaker donor and acceptor in the OH− reaction. No numerical constant, exact distribution, rate or completion guarantee follows. CO2 loss changes the material inventory and leaves the closed-system assumption; no new numerical state is determined without new inventory data.
  - Understanding focus (DE): Ampholytrolle und geänderte Systemgrenze bei CO2-Verlust ohne ungestützte Zahlenkonstante.
  - Understanding focus (EN): Amphiprotic roles and a changed system boundary under CO2 loss without an unsupported numerical constant.
## Page 4: Gesundheitliche und gesellschaftliche Alkoholrisiken beurteilen

- Full learning-goal ID: `cd9ec99b-b694-5673-863c-55528e31250a`
- Goal fingerprint: `sha256:d81a2f84f6cb80d616dd0a891bb97333042374059902802edcf808e49e397ac1`
- Page fingerprint: `sha256:d22b9377dc9ca4bd81a1a964fda6a9f003b915984b6b59dc8090437669c65263`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Einführungsphase Reaktionsgrundlagen > Einführung organische Verbindungen > Ethanol gesundheitlich und gesellschaftlich einordnen

### Canonical description

Die lernende Person kann körperliche Schädigungen durch alkoholhaltige Getränke, Gefährdungen unter Alkoholeinfluss und Ursachen von Abhängigkeit beschreiben sowie Risiken im Alltag beurteilen.

### Visualization

/assets/goal-visualizations/chemie/cd9ec99b-b694-5673-863c-55528e31250a/cd9ec99b-b694-5673-863c-55528e31250a.jpg

- original digest: `sha256:31212f403f7343fb63a6536bad90b1ebe866bbf6af7913d731deddbc5abede36`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Ethanol-Eigenschaften aus der Hydroxygruppe ableiten — `e1214210-406e-5075-b83c-086b3972ed66` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5e73eeb1757d33cd9786f8b5020f57ba81139bf0ce6573d18a945f5e8a354353`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Akute Beeinträchtigung und mögliche langfristige Schädigung durch Ethanol sind unterschiedliche Risiken.
  - Essential understanding (EN): Acute impairment and possible long-term harm from ethanol are distinct risks.
  - Observable performance (DE): Akute Koordinations-/Urteilsbeeinträchtigung und mögliche langfristige Organschäden getrennt erklären. Natürliche Herkunft nicht mit fehlender Ethanolwirkung verwechseln; akute und chronische Gefährdung unterscheiden.
  - Observable performance (EN): Separately explain acute coordination/judgement impairment and possible long-term organ harm. Do not confuse natural origin with absence of ethanol effects; distinguish acute and chronic risks.
- `e2`
  - Essential understanding (DE): Abhängigkeit kann durch biologische, psychische und soziale Faktoren gemeinsam entstehen.
  - Essential understanding (EN): Dependence can arise through interacting biological, psychological and social factors.
  - Observable performance (DE): Mindestens zwei zusammenwirkende soziale oder individuelle Abhängigkeitsfaktoren ohne monokausale Schuldzuweisung verbinden. Biologische, psychische und soziale Ursachen als Zusammenspiel statt persönlicher Schuld darstellen.
  - Observable performance (EN): Connect at least two interacting social or individual dependence factors without assigning single-cause blame. Present biological, psychological and social factors as interacting rather than personal fault.
- `e3`
  - Essential understanding (DE): Alltagsentscheidungen brauchen konkrete Gesundheits-, Sicherheits- und Teilhabekriterien.
  - Essential understanding (EN): Everyday decisions need explicit health, safety and inclusion criteria.
  - Observable performance (DE): Heimweg und Organisation anhand benannter Sicherheitskriterien begründet auswählen. Eine konkrete Veranstaltungsentscheidung mit transparenten Gesundheits- und Teilhabekriterien begründen.
  - Observable performance (EN): Select journey and organisational measures using explicit safety criteria. Justify a concrete event decision using transparent health and inclusion criteria.
- `e4`
  - Essential understanding (DE): Herkunft, Nüchternheitsgefühl und pauschale Werbung belegen keine individuelle Sicherheit.
  - Essential understanding (EN): Origin, subjective sobriety and blanket advertising do not demonstrate personal safety.
  - Observable performance (DE): Kaffee-Behauptung begrenzt zurückweisen und individuelle Mengen-/Zeitdiagnosen ausdrücklich als unbelegt markieren. Fehlende Risikoquantifizierung offenlegen und keine vermeintlich sichere Konsummenge erfinden.
  - Observable performance (EN): Reject unsupported coffee reasoning and mark individual dose/time diagnoses as unsupported. Disclose missing risk quantification and do not invent a safe amount.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `chemically-meaningful-change`: Eine neue Situation betrifft keinen Heimweg, sondern wiederholtes Trinken als angeblich einziges Mittel gegen Prüfungsstress. Entwickle ohne vorgegebene Antwort eine begründete Präventionsentscheidung und grenze Hilfe von Stigmatisierung ab. Prüfe frisch eine Werbung, die „alkoholarm“ ohne Angabe von Gehalt, Menge oder Zielgruppe als risikofrei bezeichnet. Entscheide eigenständig, welche Informationen und Kriterien für ein Urteil fehlen. / A fresh scenario concerns repeated drinking as an allegedly unique way to manage exam stress. Independently develop a reasoned prevention response and distinguish support from stigma. Assess fresh advertising that calls “low alcohol” risk-free without specifying content, amount or audience. Independently decide what information and criteria are missing.

**Application cases**

- `lab15-02-a`
  - Task demand (DE): Prüfe die Kaffee-Behauptung an den Karten. Begründe eine sichere Heimwegentscheidung und zwei Maßnahmen der Feierorganisation. Erkläre, wie Gruppendruck und wiederholtes Trinken einander verstärken können, ohne Betroffene abzuwerten. Benenne eine Aussage, die die Karten nicht erlauben.
  - Task demand (EN): Assess the coffee claim using the cards. Justify a safe journey decision and two organisational measures. Explain how peer pressure and repeated drinking can reinforce one another without stigmatising people. Name one conclusion not supported by the cards.
  - Expected performance (DE): Die Behauptung liefert keinen verlässlichen Nachweis wiederhergestellter Fähigkeiten; Gefühl ersetzt keinen Funktionstest. Geeignet ist ein Heimweg ohne eigene Verkehrsteilnahme, etwa Abholung durch eine verlässlich nüchterne Begleitperson. Alkoholfreie Angebote und früh geplante Heimwege senken situative Anreize und Risiken. Organrisiko, akute Beeinträchtigung und Abhängigkeitsentstehung sind verschiedene Ebenen. Aus den Karten folgen weder individuelle Diagnose noch eine sichere Menge oder minutengenaue Erholung.
  - Expected performance (EN): The claim gives no reliable evidence of restored ability; subjective feeling is not a functional test. Choose travel without operating a vehicle, such as collection by a reliably sober accompanying person. Alcohol-free options and advance travel plans reduce situational incentives and risks. Organ harm, acute impairment and development of dependence are distinct levels. The cards support no personal diagnosis, safe dose or exact recovery time.
  - Understanding focus (DE): Eine neue Situation betrifft keinen Heimweg, sondern wiederholtes Trinken als angeblich einziges Mittel gegen Prüfungsstress. Entwickle ohne vorgegebene Antwort eine begründete Präventionsentscheidung und grenze Hilfe von Stigmatisierung ab.
  - Understanding focus (EN): A fresh scenario concerns repeated drinking as an allegedly unique way to manage exam stress. Independently develop a reasoned prevention response and distinguish support from stigma.
- `lab15-02-b`
  - Task demand (DE): Korrigiere beide Plakate fachlich und respektvoll. Erkläre für ein jugendliches Publikum körperliche Schädigung, situative Gefährdung und mehrere Abhängigkeitsursachen. Wähle für eine Veranstaltung zwischen leichter Alkoholwerbung und alkoholfreiem Angebot und begründe die Kriterien. Welche konkrete Risikozahl fehlt? Nutze für das konkrete Körperbeispiel und die Unterscheidung akuter und längerfristiger Folgen ausdrücklich die Karten E und F.
  - Task demand (EN): Correct both posters accurately and respectfully. Explain physical harm, situational danger and multiple causes of dependence to a young audience. Choose between easy alcohol promotion and alcohol-free provision for an event and justify criteria. What specific risk figure is missing? Explicitly use cards E and F for the concrete bodily example and for distinguishing acute from longer-term effects.
  - Expected performance (DE): P verwechselt Herkunft mit Wirkung; auch Gärung erzeugt Ethanol. Q ignoriert das Zusammenspiel von Empfindlichkeit, Lernen und Umfeld. Die Entscheidung kann Sicherheit und gleichberechtigte Teilnahme priorisieren; alkoholfreie Angebote vermeiden Konsumdruck. Eine nach Häufigkeit oder Person quantifizierte Risikoprognose ist ohne Daten nicht berechenbar. Gesundheitliche Gründe sind nicht mit moralischen Urteilen über Betroffene gleichzusetzen. Konkret kann akut gestörte Koordination oder klares Denken eine situative Unfallgefahr erhöhen; eine mögliche längerfristige Leberschädigung ist eine andere Wirkungsebene. Die Karten E und F liefern diese Sachbasis, aber keine Individualdiagnose.
  - Expected performance (EN): P confuses origin with effects; fermentation also produces ethanol. Q ignores interacting sensitivity, learning and environment. The decision may prioritise safety and inclusive participation; alcohol-free provision avoids pressure to consume. A person-specific or frequency-specific risk estimate cannot be calculated from missing data. Health reasoning is different from moral judgement of affected people. Specifically, acutely impaired coordination or clear thinking can increase situational accident risk; possible longer-term liver damage is a different level of effect. Cards E and F supply that information without establishing an individual diagnosis.
  - Understanding focus (DE): Prüfe frisch eine Werbung, die „alkoholarm“ ohne Angabe von Gehalt, Menge oder Zielgruppe als risikofrei bezeichnet. Entscheide eigenständig, welche Informationen und Kriterien für ein Urteil fehlen.
  - Understanding focus (EN): Assess fresh advertising that calls “low alcohol” risk-free without specifying content, amount or audience. Independently decide what information and criteria are missing.
## Page 5: Ethanolwirkungen im Körper und Alltagsrisiken einordnen

- Full learning-goal ID: `a25a19ed-aec3-59cc-ae28-31d98746cb9d`
- Goal fingerprint: `sha256:481b784fe3b066675baf5739fecd465d4f51f0e37e910e853afd7d6199692a2c`
- Page fingerprint: `sha256:b0c12b95424599d93dd0510093c57bf4865668b32aee042d05695ece8c601881`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Einführungsphase Reaktionsgrundlagen > Einführung organische Verbindungen > Ethanol gesundheitlich und gesellschaftlich einordnen

### Canonical description

Die lernende Person kann anhand bereitgestellter Informationen Wirkungen von Ethanol im menschlichen Körper und seinen schrittweisen oxidativen Abbau erläutern und daraus Gesundheits- und Sicherheitsrisiken einer konkreten Alltagssituation fachlich begründet beurteilen.

### Visualization

/assets/goal-visualizations/chemie/a25a19ed-aec3-59cc-ae28-31d98746cb9d/a25a19ed-aec3-59cc-ae28-31d98746cb9d.png

- original digest: `sha256:87fabd9bbe77c5c96e6ee0d15b203705258be72ae6f3586ae9e98c60d0b6cef0`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Ethanol-Eigenschaften aus der Hydroxygruppe ableiten — `e1214210-406e-5075-b83c-086b3972ed66` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1e95f9bc9961e2a792030f750d207e55c610613da9b1bae363a5dac329402532`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Akute Funktionsbeeinträchtigung und mögliche längerfristige Schädigung sind unterschiedliche körperliche Folgen. Ein zweckgebundener Nutzen äußerer Anwendung belegt keine Harmlosigkeit beim Konsum.
  - Essential understanding (EN): Acute functional impairment and possible longer-term harm are distinct bodily effects. Purpose-specific benefits of external application do not establish harmlessness of consumption.
  - Observable performance (DE): Erklärt anhand der gegebenen Informationen Körperwirkung und Risikobezug und unterscheidet vorgesehene Anwendung von Konsum.
  - Observable performance (EN): Uses the supplied information to explain bodily effects and risk, distinguishing intended external use from consumption.
- `e2`
  - Essential understanding (DE): Die Metabolisierbarkeit von Ethanol bedeutet nicht sofortige Unschädlichkeit; ein Teilweg kann schädliche Zwischenprodukte enthalten.
  - Essential understanding (EN): Being metabolizable does not make ethanol immediately harmless; a partial pathway can contain harmful intermediates.
  - Observable performance (DE): Deutet das bereitgestellte Ethanol–Ethanal–Acetat-Schema als schrittweise Oxidation und begrenzt seine Aussage zur Körperwirkung; keine auswendig gelernte Biochemie.
  - Observable performance (EN): Interprets the supplied ethanol–ethanal–acetate scheme as stepwise oxidation and explains its limits concerning bodily effects; no memorized biochemistry.
- `e3`
  - Essential understanding (DE): Eine fachliche Alltagsentscheidung braucht Wirkungsbezug, begrenzte Belege und klare Sicherheitskriterien.
  - Essential understanding (EN): A scientifically reasoned everyday decision needs a link to bodily effects, bounded evidence and clear safety criteria.
  - Observable performance (DE): Begründet eine konkrete Sicherheits-/Gesundheitsentscheidung in der frischen Situation und kennzeichnet nicht belegte Individualdiagnosen, sichere Mengen und genaue Abbauzeiten.
  - Observable performance (EN): Justifies a concrete health/safety response in the fresh situation and identifies unsupported diagnoses, safe amounts and exact elimination times.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `context-and-inference`: Von Verkehrssituation zu sachlicher Werbung/zweckgebundener äußerer Anwendung wechseln; fehlerhafte Schlüsse aus Herkunft, Metabolisierbarkeit oder Nutzen prüfen. / Change between traffic, factual advertising and purpose-specific external application; assess faulty inferences from origin, metabolism or benefit.

**Application cases**

- `ethanol-effects-successor-a`
  - Task demand (DE): Erläutere an K1 und K2 den Unterschied zwischen einer akuten Funktionsbeeinträchtigung und einer möglichen längerfristigen Schädigung. Deute den bereitgestellten Abbauweg als schrittweise Oxidation und erkläre, weshalb er weder sofortige Unbedenklichkeit noch eine Abfahrtszeit beweist. Begründe für den Fall einen Heimweg, bei dem die betroffene Person kein Fahrzeug führt, und nenne die Grenzen der Aussage. Ordne außerdem mit Karte D den Nutzen der vorgesehenen äußeren Anwendung ein und widerlege begründet den Schluss, dieser Nutzen mache die Einnahme harmlos.
  - Task demand (EN): Use C1 and C2 to explain the difference between acute impairment and possible longer-term harm. Interpret the supplied pathway as stepwise oxidation and explain why it demonstrates neither immediate harmlessness nor a departure time. Justify a journey in which the affected person does not operate a vehicle, and state the limits of the conclusion. Also use card D to interpret the benefit of the intended external application and explain why that benefit does not make ingestion harmless.
  - Expected performance (DE): Akut kann das gestörte Denken oder die gestörte Koordination schon die aktuelle Verkehrssituation riskant machen; eine mögliche langfristige Organschädigung ist eine andere Zeitebene. Der rechte Kohlenstoff wird von −I zu +I und +III oxidiert; die Enzyme bewirken mehrere Schritte, und das Zwischenprodukt Ethanal ist selbst schädlich. Das Schema ist keine Uhr und zeigt keine gemessene aktuelle Fähigkeit. Ein geplanter Heimweg etwa durch Abholung mit einer verlässlich nüchternen verantwortlichen Person vermeidet eigene Fahrzeugführung. Ob eine bestimmte Person eine Krankheit hat, wie viel sie konsumiert hat oder ab wann sie wieder fahrtüchtig ist, folgt nicht. Die Keimreduktion bezieht sich auf eine vorgesehene äußere Anwendung. Ein Nutzen für diesen Zweck ist mit Risiken der Aufnahme in den Körper vereinbar und beweist keine Harmlosigkeit beim Trinken; unterschiedliche Aufnahmewege und Verwendungszwecke dürfen nicht gleichgesetzt werden.
  - Expected performance (EN): Disrupted thinking or coordination can make the present traffic situation risky; possible longer-term organ damage occurs on a different time scale. The right-hand carbon is oxidized from −I to +I to +III; enzymes mediate several steps, and the intermediate ethanal is itself harmful. The scheme is not a clock and reports no measured current ability. A planned journey such as collection by a reliably sober responsible person avoids operating a vehicle. The information does not establish personal illness, intake or a time when the person becomes fit to drive. Reducing microbes concerns a specified external application. A benefit for that purpose can coexist with risks from intake into the body and does not establish harmlessness of drinking; different routes of exposure and purposes must not be equated.
  - Understanding focus (DE): Neue Situation: Eine Getränkewerbung behauptet „Natürlich vergoren und deshalb für alle risikofrei“. Prüfe die Schlussfolgerung an den Karten und begründe, welche Art von Beleg fehlt, ohne eine sichere Menge zu erfinden.
  - Understanding focus (EN): Fresh situation: a drinks advertisement claims “Naturally fermented, therefore risk-free for everyone”. Assess the inference using the cards and explain what kind of evidence is missing without inventing a safe amount.
- `ethanol-effects-successor-b`
  - Task demand (DE): Erkläre am Material, weshalb der Nutzen einer vorgesehenen äußeren Anwendung und gesundheitliche Risiken beim Konsum nebeneinander bestehen können. Korrigiere beide Plakate mit einer Begründung zu Körperwirkung und zum schrittweisen Abbau. Unterscheide eine begründete allgemeine Risikoaussage von einer unbelegten individuellen Diagnose. Formuliere eine sachliche Beschriftung für eine Schulausstellung.
  - Task demand (EN): Explain from the material why benefits of intended external use can coexist with health risks of consumption. Correct both posters with reasoning about bodily effects and stepwise metabolism. Distinguish a justified general risk statement from an unsupported personal diagnosis. Write a factual caption for a school exhibition.
  - Expected performance (DE): D betrifft einen bestimmten äußeren Verwendungszweck; daraus folgt keine Unbedenklichkeit einer Aufnahme in den Körper. Ethanol kann Denken und Koordination beeinträchtigen und bei wiederholtem starkem Konsum unter anderem die Leber schädigen. Der Abbau ist schrittweise und erzeugt mit Ethanal ein schädliches Zwischenprodukt; Metabolisierbarkeit bedeutet daher keine sofortige Unschädlichkeit. Q macht aus einem möglichen Risiko eine angeblich sichere aktuelle Diagnose und ist durch die Karten nicht gedeckt. Eine passende Beschriftung nennt den zweckgebundenen Nutzen und grenzt ihn von Konsumrisiken ab. Sie behauptet weder eine sichere Konsummenge noch eine Erkrankung aller Konsumierenden.
  - Expected performance (EN): D concerns a specific external purpose and does not establish that intake into the body is harmless. Ethanol can impair thinking and coordination and repeated heavy consumption can damage the liver, among other organs. Metabolism occurs in steps and produces the harmful intermediate ethanal; being metabolizable does not mean immediate harmlessness. Q turns a possible risk into a supposedly certain current diagnosis, which the cards do not support. A suitable caption identifies the purpose-specific benefit and distinguishes it from consumption risks, without claiming a safe intake or illness in every consumer.
  - Understanding focus (DE): Neue Situation: Für einen schulischen Ausflug soll aus dem Satz „Nach einiger Zeit ist Ethanol abgebaut“ eine feste Wartezeit bis zum Fahrradfahren abgeleitet werden. Begründe selbstständig, weshalb das Material diese Zeit nicht festlegt und welche Sicherheitsentscheidung trotzdem vertretbar ist.
  - Understanding focus (EN): Fresh situation: on a school outing, the statement “Ethanol is broken down after some time” is used to infer a fixed waiting time before cycling. Independently explain why this material does not establish that time and what safety response is still defensible.
## Page 6: pK-Werte nutzen

- Full learning-goal ID: `48115ff7-7aca-5d0b-a9e7-7fc6c78434ef`
- Goal fingerprint: `sha256:1aa0edcc590ee24a93b88b0001ddafa68ccbc04d18be76c8bf2691b9a3c3dcf9`
- Page fingerprint: `sha256:f93aee22b67ba0d92fa260086cfd31a0b3d882849d06d4f1d07ab15fe5e76056`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.2 Protolysegleichgewichte

### Canonical description

Die lernende Person kann das Donator-Akzeptor- und Gleichgewichtskonzept auf Protolysereaktionen anwenden, Säure- und Basenstärken über das Massenwirkungsgesetz sowie pKS- und pKB-Werte vergleichen.

### Visualization

/assets/goal-visualizations/chemie/48115ff7-7aca-5d0b-a9e7-7fc6c78434ef/48115ff7-7aca-5d0b-a9e7-7fc6c78434ef.png

- original digest: `sha256:3c3eac20b0e373c7ef4c1b74f82d6d7921db0540158e24b59d1197a5936c8213`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Titrationskurven datengestützt deuten — `28c90c6a-3020-5c51-ac40-d802f3f12d2d` (page 7)
- pH-Werte starker und schwacher einprotoniger Säuren berechnen — `acdfc7d7-6d6b-5a1f-837c-79449c29a305` (page 10)
- pH-Werte starker und schwacher einprotoniger Basen berechnen — `edcfc5f0-900d-5819-830f-3b14af2bc369` (page 11)
- pH-Titrationskurven experimentell aufnehmen und darstellen — `e0944fbb-0761-5f9c-afaa-3d4713ed1bed` (page 14)

### Prerequisites outside this book

- Brønsted-Konzept anwenden — `1c1420c2-a8e2-520f-8015-6df637a973bd` (outside this book)

### Direct reverse prerequisites outside this book

- Lernkarten - Gleichgewichte und Elektrochemie – Kursauswahl — `045efaa4-a91a-5a91-add9-bff49cbed324` (outside this book)
- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Lernkarten - Gleichgewichte und Elektrochemie — `1f2021c0-c633-5240-ae97-e58ecc9d48ca` (outside this book)
- Milchsäure in einer Sportgetränkprobe titrieren — `bacf2568-03bc-5655-8798-cda078c897e3` (outside this book)
- pH-Werte starker Lösungen berechnen — `c224281a-f8a3-58cd-8ca3-2c2e134d61ff` (outside this book)
- Säure-Base-Puffer erklären, auswählen und bewerten — `25729c34-33d5-553a-a723-046113a7da47` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:13ed03714ab558773b6ea8b6fd5bb9d8234cefc5eb6f8a8a44410f84968a2e1a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `g1`
  - Essential understanding (DE): Ka/Kb und pK beschreiben das jeweilige Protolysegleichgewicht bei definierter Wasser-Konvention.
  - Essential understanding (EN): Ka, Kb and pK describe the respective protolysis equilibrium under a defined water convention.
  - Observable performance (DE): Stelle Säure- und Base-MWG auf, vergleiche Konstanten/pK und trenne formalen Gehalt von Stärke.
  - Observable performance (EN): Write acid and base mass-action expressions, compare constants and pK, and distinguish formal amount from strength.
- `g2`
  - Essential understanding (DE): Bei gleichem Gesamtgehalt zeigt Stärke sich an unterschiedlicher Protonenübertragung und Teilchenverteilung.
  - Essential understanding (EN): At equal total content, strength gives different proton transfer and species distributions.
  - Observable performance (DE): Erkläre für Säuren UND Basen die Haupt-/Ionenteilchen bei gleichem Gehalt mit MWG; bloße Formelangabe oder pK-Vergleich reicht nicht.
  - Observable performance (EN): Explain main/ionic species for BOTH acids and bases at equal content using mass action; formulas/pK ranking alone are insufficient.

**Coverage expectations**

- required expectations: `g1`, `g2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `acid-base-particles`: Bei gleichem formalem Gehalt Säure- und Basenpaare anhand ihrer Teilchenverteilungen vergleichen. / Compare acid and base pairs through species distributions at equal formal content.
- `formal-strength`: Von einer pK-Rangfolge zur Erklärung von Protonenübertragung und Wasser-Konvention wechseln. / Move from a pK ranking to explaining proton transfer and the water convention.

**Application cases**

- `source-strength-acids`
  - Task demand (DE): Vergleiche im gegebenen 25-°C-Modell 0,100 M HCl und Essigsäure mit Ka=1,8·10−5. Stelle Protolyse und MWG auf und begründe die Haupt- und Ionenteilchenverteilung bei gleichem formalem Gehalt.
  - Task demand (EN): Compare 0.100 M HCl and acetic acid with Ka=1.8·10−5 in the supplied 25 °C model. Write protolysis/mass action and explain main and ionic species at equal formal content.
  - Expected performance (DE): HCl ist im Modell vollständig protolysiert; Essigsäure bleibt überwiegend HA. Ka=aH3O·aA/aHA enthält die Wasser-Konvention; kleineres pKa entspricht größerem Ka. Gleicher formaler Gehalt bedeutet keine gleiche Ionenkonzentration.
  - Expected performance (EN): HCl is fully transferred in the model, while acetic acid largely remains HA. Ka=aH3O·aA/aHA includes the water convention; lower pKa means larger Ka. Equal formal content does not imply equal ionic concentration.
  - Understanding focus (DE): Stärke wird mit Protonenübertragung erklärt, nicht mit der Konzentration verwechselt.
  - Understanding focus (EN): Explain strength through proton transfer rather than conflating it with concentration.
- `source-strength-bases`
  - Task demand (DE): Vergleiche B1 und B2 bei je 0,100 M mit Kb1=1,8·10−5 und Kb2=1,8·10−9. Begründe Reaktionen, MWG, pKb-Folge und schematische B/BH+/OH−-Verteilung.
  - Task demand (EN): Compare B1 and B2 at 0.100 M with Kb1=1.8·10−5 and Kb2=1.8·10−9. Explain reactions, mass action, pKb order and schematic B/BH+/OH− distributions.
  - Expected performance (DE): B+H2O⇌BH++OH− und Kb=aBH·aOH/aB. In beiden überwiegt B; B1 bildet mehr BH+/OH− als B2. Schematische Zählungen sind Modelldarstellungen, keine gemessenen Ionenzahlen.
  - Expected performance (EN): B+H2O⇌BH++OH− and Kb=aBH·aOH/aB. B dominates both; B1 produces more BH+/OH− than B2. Schematic counts are model representations rather than measured ion counts.
  - Understanding focus (DE): Selbstständiger Basentransfer mit korrektem Akzeptor- und Gleichgewichtsbezug.
  - Understanding focus (EN): Independent base transfer with correct acceptor and equilibrium reasoning.
## Page 7: Titrationskurven datengestützt deuten

- Full learning-goal ID: `28c90c6a-3020-5c51-ac40-d802f3f12d2d`
- Goal fingerprint: `sha256:5e7666abb7cd2c4c761356fcd30cccad0080ed13ebcaeb84fb8683e8b420f9c5`
- Page fingerprint: `sha256:581dc7e55f52e0c6bd82135be49567a3b971a4a7128ee8e5ee38ffb0d6e758c8`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.2 Protolysegleichgewichte

### Canonical description

Die lernende Person kann aus bereitgestellten Titrationsdaten den Verlauf einer Titrationskurve, den Äquivalenzbereich und vorhandene Halbäquivalenz- oder Pufferbereiche erkennen, mit den jeweils pH-bestimmenden Teilchen erklären und daraus begrenzte Aussagen zu Stoffklasse und geeigneten Indikatoren ableiten.

### Visualization

/assets/goal-visualizations/chemie/28c90c6a-3020-5c51-ac40-d802f3f12d2d/28c90c6a-3020-5c51-ac40-d802f3f12d2d.jpg

- original digest: `sha256:300f64e8701b21757f91fc79d9d292a9463438a19c559f05f6b7456c7a4fe98b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Lösungen berechnen und pH bestimmen — `f1ed86f0-534d-57d7-8952-a004a331cc54` (page 2)
- pK-Werte nutzen — `48115ff7-7aca-5d0b-a9e7-7fc6c78434ef` (page 6)

### Direct reverse prerequisites

- Puffer-pH mit der Henderson-Hasselbalch-Gleichung berechnen — `a449e874-6fec-502b-9667-6f078adc4d64` (page 8)
- Charakteristische pH-Werte von Titrationskurven berechnen — `29742d91-732f-5da5-bc46-e963885f9a4a` (page 12)
- Polyprotische Systeme — `dc0470f1-0676-5949-a5cc-02783d478406` (page 13)

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Milchsäure in einer Sportgetränkprobe titrieren — `bacf2568-03bc-5655-8798-cda078c897e3` (outside this book)
- Halbtitration zur pK-Bestimmung nutzen — `059acb11-29b3-5645-ac4c-b4214dc41a2d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:be2bd97fa5b8a51ab5753e851f0ba3b0260f3f2fdb4d780dbc05ef6b55b0c578`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `q1`
  - Essential understanding (DE): Kurvenform und Richtung liefern begrenzte Modellinformationen.
  - Essential understanding (EN): Curve direction and shape supply bounded model information.
  - Observable performance (DE): Die lernende Person beschreibt Verlauf und Stärkehinweise mit tatsächlichen Daten und vermeidet eindeutige Stoffidentifikation ohne weitere Befunde.
  - Observable performance (EN): Describe shape and strength clues from actual data, avoiding unsupported unique substance identification.
- `q2`
  - Essential understanding (DE): Äquivalenz, Halbäquivalenz und Pufferbereich sind verschiedene Begriffe und nur im passenden System vorhanden.
  - Essential understanding (EN): Equivalence, half-equivalence and buffer regions differ and apply only in suitable systems.
  - Observable performance (DE): Sie erkennt vorhandene Bereiche und erläutert die pH-bestimmenden Teilchen; ein Halbvolumen allein ist kein pK-Beweis.
  - Observable performance (EN): Identify regions present and explain pH-controlling species; a half-volume alone does not prove pKa.
- `q3`
  - Essential understanding (DE): Indikatorendpunkt, chemische Äquivalenz und temperaturabhängige Neutralität sind zu unterscheiden.
  - Essential understanding (EN): Indicator endpoint, chemical equivalence and temperature-dependent neutrality differ.
  - Observable performance (DE): Sie begründet anhand des gegebenen Kurvenverlaufs und der Intervalle die Indikatorwahl und Grenzen eines behaupteten Volumenfehlers.
  - Observable performance (EN): Use the supplied curve and intervals to justify an indicator choice and limit volume-error claims.
- `q4`
  - Essential understanding (DE): Menge, Stärke und Stoffklasse erzeugen unterschiedliche Kurvenaussagen.
  - Essential understanding (EN): Amount, strength and substance class yield distinct curve conclusions.
  - Observable performance (DE): Sie erklärt im vorgelegten Vergleich Gemeinsamkeiten und Unterschiede von Puffer-, Äquivalenz- und Überschussbereichen.
  - Observable performance (EN): Explain similarities and differences in buffer, equivalence and excess regions for the supplied comparison.

**Coverage expectations**

- required expectations: `q1`, `q2`, `q3`, `q4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `acid-strength`: Bei gleicher Stoffmenge von starker zu schwacher Säure wechseln und die veränderten Gleichgewichte begründen. / Change from strong to weak acid at equal amount and explain the altered equilibria.
- `curve-region`: Dasselbe Reagenzsystem vor, bei und nach Äquivalenz mit unterschiedlichen Bilanzmodellen behandeln. / Use different balance models for the same reagent system before, at and after equivalence.
- `temperature-and-indicator`: Neutralität bei verändertem pKᵥ und die begrenzte Aussage eines Indikatorbereichs prüfen. / Check neutrality at changed pKᵥ and the limited information supplied by an indicator range.

**Application cases**

- `t05-supplied-acid-curves`
  - Task demand (DE): Deute T05-C1/C2 an den vollständig gelieferten Tabellen. Ordne Stärke und Spezies zu, unterscheide Halbpunkt, Äquivalenz und Neutralität und begründe geeignete Indikatorkandidaten.
  - Task demand (EN): Interpret the complete T05-C1/C2 tables. Classify strength/species, distinguish halfpoint, equivalence and neutrality, and justify indicator candidates.
  - Expected performance (DE): Starke und schwache Säure haben gleichen formalen Äquivalenzverbrauch, aber unterschiedliche Anfangs-, Puffer- und Salzprotolysebereiche. BTB beziehungsweise Phenolphthalein sind begründete Kandidaten. Ohne Farbkriterium und Auflösung folgt kein exakter Volumenfehler oder Molekülnachweis.
  - Expected performance (EN): Strong and weak acids have equal formal equivalence consumption but different initial, buffer and salt-protolysis regions. BTB and phenolphthalein are justified candidates. No exact volume error or molecular identity follows without a colour criterion and sufficient resolution.
  - Understanding focus (DE): Dateninterpretation ohne obligatorische Rechnung charakteristischer pH-Werte.
  - Understanding focus (EN): Data interpretation without mandatory characteristic-point calculations.
- `base-and-polyprotic-supplied-variation`
  - Task demand (DE): Deute die fallende T08-C2-Basenkurve mit B/BH+ und vergleiche im bereitgestellten POLY-QUALITATIVE-C1 die ein- und zweistufigen Modellkurven. Begründe vorhandene Pufferregionen und begrenzte Identifikation.
  - Task demand (EN): Interpret the falling T08-C2 base curve using B/BH+ and compare the supplied single-stage and two-stage model curves in POLY-QUALITATIVE-C1. Explain existing buffer regions and limited identification.
  - Expected performance (DE): Schwache Base hinterlässt saures BH+; der Titrant allein macht Äquivalenz nicht neutral. Glycin besitzt hier Stufen um 25 und 50 mL mit wechselnden Paaren; pH um 6 ist zwischen den ausgeprägten Pufferbereichen. Die Daten beweisen keine allgemeine Stoffidentität.
  - Expected performance (EN): A weak base leaves acidic BH+; titrant strength alone does not establish neutral equivalence. Here glycine has stages near 25 and 50 mL with changing pairs; pH around 6 lies between its main buffer regions. The data establish no unique substance identity.
  - Understanding focus (DE): Geänderte Richtung und Protonenzahl anhand gegebener Daten; keine polyprotische Zahlenrechnung als Zusatzpflicht.
  - Understanding focus (EN): Changed curve direction and proton count from supplied data; no added compulsory polyprotic calculation.
## Page 8: Puffer-pH mit der Henderson-Hasselbalch-Gleichung berechnen

- Full learning-goal ID: `a449e874-6fec-502b-9667-6f078adc4d64`
- Goal fingerprint: `sha256:398b1f670df6f16856ca3ecfb4308b29499357f277311a187ce597924f33b064`
- Page fingerprint: `sha256:000772e35dfcdd5b3e946a2cfffbc6bdfee69c6dc64105ff2d29bf24653e48a1`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.2 Protolysegleichgewichte

### Canonical description

Die lernende Person kann Pufferlösungen mit der Henderson-Hasselbalch-Gleichung quantitativ beschreiben, den pH-Wert aus dem Verhältnis der korrespondierenden Säure-Base-Komponenten berechnen, vorgegebene Säure- oder Basenzugaben in der Stoffmengenbilanz berücksichtigen und die Gültigkeit der verwendeten Näherung einschließlich ihrer Grenzen bei erschöpfter Pufferkomponente begründen.

### Visualization

/assets/goal-visualizations/chemie/a449e874-6fec-502b-9667-6f078adc4d64/a449e874-6fec-502b-9667-6f078adc4d64.jpg

- original digest: `sha256:a30cb96f2fc49c0ecba42a089ea38faf2a734d50a00d459e9eacb6e20a1c8d23`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Titrationskurven datengestützt deuten — `28c90c6a-3020-5c51-ac40-d802f3f12d2d` (page 7)

### Direct reverse prerequisites

- Puffer gezielt designen — `13877340-1370-5278-bb80-31cf382dd6f5` (page 17)

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Henderson-Hasselbalch-Beziehung abrufen — `c8bf3178-383d-570f-825d-d2d7b9507e6e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e1217f023f71cdc1396b2a21054321c17d5d09a59e267e61511d59dabc6f8026`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Die Henderson-Hasselbalch-Gleichung verbindet im geeigneten Modell den pH mit pKₐ und dem Verhältnis des korrespondierenden Paares.
  - Essential understanding (EN): In an appropriate model, the Henderson–Hasselbalch equation relates pH to pKₐ and the conjugate-pair ratio.
  - Observable performance (DE): Die lernende Person ordnet im vorgelegten System Säure und Base zu, bildet den Quotienten in der richtigen Richtung und berechnet den Ausgangs-pH; die ausreichende fachliche Variation wird nach tatsächlich noch offenen Aspekten bestimmt.
  - Observable performance (EN): The learner identifies acid and base in the supplied system, forms the ratio in the correct direction and calculates initial pH; sufficient subject variation is chosen according to aspects still unshown.
- `e2`
  - Essential understanding (DE): Eine starke Säure- oder Basezugabe verändert zuerst die Partnerstoffmengen; erst danach wird das Gleichgewichtsmodell angewendet.
  - Essential understanding (EN): Added strong acid or base first changes the partner amounts; only then is the equilibrium model applied.
  - Observable performance (DE): Sie bilanziert HCl beziehungsweise OH⁻ mit dem passenden Partner und berechnet den neuen pH aus den positiven Restmengen.
  - Observable performance (EN): The learner balances HCl or OH⁻ against its reacting partner and calculates the new pH from positive remaining amounts.
- `e3`
  - Essential understanding (DE): Konstantes Partnerverhältnis bedeutet im idealen Modell gleichen pH, aber nicht gleiche Pufferreserve je Liter; vollständiger Partnerverbrauch beendet die einfache Pufferrechnung.
  - Essential understanding (EN): A constant partner ratio implies equal pH in the ideal model but not equal reserve per litre; complete consumption of a partner ends the simple buffer calculation.
  - Observable performance (DE): Sie erklärt im passenden vorgelegten Fall gemeinsame Verdünnung und Reserve je Liter beziehungsweise erkennt den vollständigen Verbrauch eines Partners und verwirft den Logarithmus negativer Restmengen. Die Fallbindungen weisen diese Teilbeiträge getrennt aus.
  - Observable performance (EN): In the appropriate supplied case, the learner explains common dilution and reserve per litre or recognises complete consumption of a partner and rejects a logarithm of negative amounts. The case bindings identify these contributions separately.
- `e4`
  - Essential understanding (DE): Verdünnung, freie starke Säure und Stoffaustausch dürfen nicht durch ein unverändert übernommenes Verhältnis verwechselt werden.
  - Essential understanding (EN): Dilution, free strong acid and matter exchange cannot be handled by blindly retaining the original ratio.
  - Observable performance (DE): Sie widerlegt eine pH-Abnahme um genau eins bei idealer Pufferverdünnung und begründet, warum unbekannter NH₃-Verlust eine neue Mengenbilanz verlangt.
  - Observable performance (EN): The learner refutes an exact one-unit pH fall on ideal buffer dilution and explains why unknown NH₃ loss requires a new amount balance.
- `e5`
  - Essential understanding (DE): Die Aktivitätsform der HH-Beziehung folgt aus dem Protolyse-MWG. Stoffmengenverhältnisse stehen nur unter den angegebenen gemeinsamen Volumen- und Näherungsannahmen für das tatsächliche konjugierte Verhältnis; eine erschöpfte Reserve oder unbekannter Stoffaustausch hebt diese Rechenbasis auf.
  - Essential understanding (EN): The activity form of the HH relation follows from acid-dissociation mass action. Amount ratios stand for the actual conjugate ratio only under the specified common-volume and approximation assumptions; depleted reserves or unknown exchange invalidate that calculation basis.
  - Observable performance (DE): Die lernende Person begründet MWG, Quotientenrichtung, Bilanz vor Rechnung und Modellbereich anhand des dafür tatsächlich vorgelegten Materials. Sie unterscheidet gemeinsame Verdünnung, Reserve je Liter, erschöpfte Partner und unbekannten Stoffaustausch. G7-C1 trägt MWG/Verdünnung, G7-C2 Erschöpfung, T06-C2 unbekannten NH3-Verlust bei; kein einzelner G7-Fall fordert alle Teile.
  - Observable performance (EN): The learner justifies mass action, ratio orientation, balance before calculation and model domain using the material actually supplied for that aspect. They distinguish common dilution, reserve per litre, depleted partners and unknown exchange. G7-C1 contributes mass action/dilution, G7-C2 depletion and T06-C2 unknown NH3 loss; no individual G7 case asks all parts.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`, `e5`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `acid-versus-base-dose`: Vom Acetatpuffer mit Säurelast zum Ammoniumpuffer mit Baselast wechseln und den jeweils verbrauchten Partner bestimmen. / Change from acetate under acid load to ammonium under base load, identifying the consumed partner.
- `ratio-and-reserve`: Gleiches Verhältnis nach Verdünnung mit veränderter Reserve und mit erschöpftem Partner vergleichen. / Compare an unchanged dilution ratio with altered reserve and an exhausted partner.
- `closed-to-open`: Die geschlossene Mengenbilanz mit unbekanntem NH₃-Verlust konfrontieren, ohne ungestützte Zahlen zu erzeugen. / Challenge the closed amount balance with unknown NH₃ loss without inventing numerical results.

**Application cases**

- `t06-c1`
  - Task demand (DE): Acetatpuffer vor und nach HCl berechnen und die zehnfache Verdünnung prüfen. Vollständiges Material, Auftrag, Lösung und vier Kriterien: materials/EIGHT.complete-retained-cases-and-rubrics.exact.json, Fall T06-C1.
  - Task demand (EN): Calculate acetate buffer pH before and after HCl and assess tenfold dilution. Complete material, task, solution and four criteria: materials/EIGHT.complete-retained-cases-and-rubrics.exact.json, case T06-C1.
  - Expected performance (DE): 1. Aus Kₐ=a(H)·a(A⁻)/a(HA) folgt pH=pKₐ+log(a(A⁻)/a(HA)). Im Modell γ=1 kürzt sich dasselbe Volumen. Anfangs ist pH 5.362. 2. A⁻ + H₃O⁺ → HA + H₂O lässt 35.0 mmol A⁻ und 15.0 mmol HA zurück; pH 5.128. 3. Zehnfache Verdünnung erhält den Quotienten und näherungsweise den pH. Konzentrationen und lokale Kapazität je Liter fallen auf ein Zehntel; die gesamten Partnerstoffmengen des verdünnten Ansatzes bleiben erhalten. Gleicher pH bedeutet keine gleiche Belastbarkeit je Liter. Weitere Verdünnung erfordert neue Wasser-/Aktivitätsprüfungen. 4. Beide Behauptungen sind im gegebenen Bereich falsch: Verdünnung erhält den Quotienten, und HCl wird zunächst von A⁻ aufgenommen, statt vollständig frei zu bleiben. Reserven und Modellgrenzen bleiben endlich.
  - Expected performance (EN): 1. Ka=aH·aA/aHA yields pH=pKa+log(aA/aHA). Common volume cancels in theγ=1 model. Initial pH 5.362. 2. A⁻+H₃O⁺→HA+H₂O leaves 35.0 mmol A⁻/15.0 mmol HA, pH 5.128. 3. Tenfold dilution preserves the ratio and approximately pH under stated conditions. Total buffer concentration and local capacity per litre fall tenfold; the total partner amounts in the diluted whole preparation are unchanged. Same pH does not mean equal load tolerance; further dilution requires new water/activity checks.
4. Both statements are false within the supplied buffer regime: dilution preserves the common ratio, while HCl is first consumed by A⁻. Finite reserves and limits of the ideal assumption remain relevant.
  - Understanding focus (DE): Reaktion kommt vor Logarithmus; pH-Verhältnis und Reserve sind getrennt zu beurteilen.
  - Understanding focus (EN): Reaction precedes the logarithm; assess the pH ratio and reserve separately.
- `t06-c2`
  - Task demand (DE): NH₄⁺/NH₃ mit kleiner und übergroßer OH⁻-Last sowie mit unbekanntem NH₃-Verlust beurteilen. Vollständiges Material, Auftrag, Lösung und vier Kriterien: materials/EIGHT.complete-retained-cases-and-rubrics.exact.json, Fall T06-C2.
  - Task demand (EN): Assess NH₄⁺/NH₃ under small and excessive OH⁻ loads and unknown NH₃ loss. Complete material, task, solution and four criteria: materials/EIGHT.complete-retained-cases-and-rubrics.exact.json, case T06-C2.
  - Expected performance (DE): 1. Das Paar ist NH₄⁺/NH₃; anfangs ist pH 8.949. 2. NH₄⁺ + OH⁻ → NH₃ + H₂O verbraucht 10 mmol Säure und bildet 10 mmol Base: 40/35 mmol und pH 9.192. 3. 60 mmol OH⁻ überschreiten den 50-mmol-Säurevorrat. Eine formal negative NH₄⁺-Menge zeigt Erschöpfung und ist kein Logarithmusargument. 10 mmol formale zusätzliche Baselast verlangen eine neue Bilanz mit Wasser, NH₃ und starkem Baseüberschuss. Im geschlossenen Gefäß ist kein zusätzlicher NH₃-Verlust gegeben. 4. Bei unbekanntem NH₃-Verlust darf das alte Verhältnis nicht übernommen werden; der pH kann sinken. Für eine neue Zahl sind verbleibende Mengen oder Austausch-/Gleichgewichtsdaten nötig.
  - Expected performance (EN): 1. NH₄⁺/NH₃ is the pair; pH 8.949. 2. NH₄⁺+OH⁻→NH₃+H₂O consumes 10 mmol acid and forms 10 mmol base:40/35 mmol, pH 9.192. 3. 60 mmol OH⁻ exceeds 50 mmol acid reserve. A formal negative NH₄⁺ amount signals depletion, not the input of a logarithm.10 mmol is the formal stoichiometric OH⁻ excess, not a determined free-ion amount; new balance including excess base/water and NH₃ is required. Closed-vessel conditions exclude additional open-system change.
4. No: unknown NH₃ loss changes the base/acid ratio and can lower pH. Remaining amounts or flow/equilibrium data are needed for a new numerical pH.
  - Understanding focus (DE): Partnererschöpfung und Stoffaustausch verlangen ein anderes oder ergänztes Modell.
  - Understanding focus (EN): Partner exhaustion and matter exchange require a different or augmented model.
- `retained-g7-1`
  - Task demand (DE): Nutze 0.0100 mol HA/0.0200 mol A− in 1.000 L, pKS 4.80, 0.00500 mol HCl und anschließende Verdünnung auf 2.000 L. Vollständiges Material, Auftrag, Lösung und vier Kriterien: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid-base-seven-existing-whole-goals-fourteen-material-cases-author-20261014-v1/materials.fourteen-complete-cases.de-en.author.md, Fall G7-C1.
  - Task demand (EN): Use 0.0100 mol HA/0.0200 mol A− in 1.000 L, pKa 4.80, 0.00500 mol HCl and subsequent dilution to 2.000 L. Complete material, task, solution and four criteria: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid-base-seven-existing-whole-goals-fourteen-material-cases-author-20261014-v1/materials.fourteen-complete-cases.de-en.author.md, case G7-C1.
  - Expected performance (DE): Anfang pH≈5.101. HCl macht je 0.0150 mol; pH≈4.80. Verdünnung erhält dieses Verhältnis und den Näherungs-pH, halbiert aber die Puffermengen je Liter. Die Aussage gilt im angegebenen Modellbereich.
  - Expected performance (EN): Initial pH≈5.101. HCl leaves 0.0150 mol each; pH≈4.80. Dilution preserves this ratio and approximate pH but halves buffer amounts per litre. The claim is limited to the stipulated model domain.
  - Understanding focus (DE): Stöchiometrie vor MWG und logarithmischen pH vom Kapazitätsbezug je Liter unterscheiden.
  - Understanding focus (EN): Apply stoichiometry before mass action and distinguish logarithmic pH from capacity per litre.
- `retained-g7-2`
  - Task demand (DE): Nutze 0.0200 mol B/0.0100 mol BH+ und pKS 9.20; vergleiche die getrennten Zugaben 0.0150 und 0.0250 mol HCl. Vollständiges Material, Auftrag, Lösung und vier Kriterien: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid-base-seven-existing-whole-goals-fourteen-material-cases-author-20261014-v1/materials.fourteen-complete-cases.de-en.author.md, Fall G7-C2.
  - Task demand (EN): Use 0.0200 mol B/0.0100 mol BH+ and pKa 9.20; compare separate additions of 0.0150 and 0.0250 mol HCl. Complete material, task, solution and four criteria: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid-base-seven-existing-whole-goals-fourteen-material-cases-author-20261014-v1/materials.fourteen-complete-cases.de-en.author.md, case G7-C2.
  - Expected performance (DE): Anfang pH≈9.501; Probe A enthält 0.00500/0.0250 mol B/BH+, pH≈8.501. Probe B verbraucht die 0.0200-mol-Reserve und lässt 0.00500 mol starke Säure übrig; der negative-Mengen-Logarithmus ist unzulässig.
  - Expected performance (EN): Initial pH≈9.501; sample A has 0.00500/0.0250 mol B/BH+, pH≈8.501. Sample B consumes the 0.0200 mol reserve and leaves 0.00500 mol strong acid; a logarithm of a negative amount is invalid.
  - Understanding focus (DE): Die zweite Probe verlangt eine Modellgrenzenentscheidung, keine weitere mechanische Pufferformeleinsetzung.
  - Understanding focus (EN): The second sample requires a model-domain decision rather than another mechanical buffer-formula substitution.
## Page 9: Autoprotolyse und Ionenprodukt des Wassers erklären

- Full learning-goal ID: `07879ea2-b6a1-5eb3-b548-15d45bbcb227`
- Goal fingerprint: `sha256:8ad18615c017e1ee29b826eca541a255d7206d247ce872a7ce8567c1238dfcca`
- Page fingerprint: `sha256:58deceb5d99743f22ee97992e1107fbf2a45a6262ba35d1c8a9828f2030775d6`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.2 Protolysegleichgewichte

### Canonical description

Die lernende Person kann den amphoteren Charakter des Wasser-Moleküls mithilfe der Autoprotolysereaktion beschreiben und daraus das Ionenprodukt des Wassers erklären.

### Visualization

/assets/goal-visualizations/chemie/07879ea2-b6a1-5eb3-b548-15d45bbcb227/07879ea2-b6a1-5eb3-b548-15d45bbcb227.jpg

- original digest: `sha256:c6155c095954ba937ad825b9a24c931e15acfb516e5110f8598919e2e0d0b1bb`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Brønsted-Konzept anwenden — `1c1420c2-a8e2-520f-8015-6df637a973bd` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5b47736995bd92c80feeecd79ef38c73ab249707f2bf2f3a9857c24f8da3d092`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `water-transfer`
  - Essential understanding (DE): Wasser wirkt in der Autoprotolyse zugleich als Protonendonator und -akzeptor; endliches Kw verknüpft beide Ionensorten.
  - Essential understanding (EN): Water acts as both proton donor and acceptor in autoprotolysis; finite Kw couples both ionic species.
  - Observable performance (DE): Erkläre2H2O⇌H3O++OH− und das Ionenprodukt mit Wasser-Konvention und begründe in geeigneten sauren und basischen Fällen die jeweils andere vorhandene Ionensorte.
  - Observable performance (EN): Explain2H2O⇌H3O++OH− and the water convention in Kw, using appropriate acidic and alkaline cases to justify the presence of the other ion.
- `neutrality-temperature`
  - Essential understanding (DE): Neutralität bedeutet im passenden verdünnten Modell Gleichheit beider Ionenkonzentrationen; ihr pH hängt von Kw und Temperatur ab.
  - Essential understanding (EN): In the appropriate dilute model neutrality means equal concentrations of both ions; its pH depends on Kw and temperature.
  - Observable performance (DE): Nutze pH und Kw zur begründeten Ionenzuordnung und erkläre an einer Temperaturvariation pHneutral=pKw/2; keine feste Zahl von Aufgaben oder gegebenen pH-Fällen.
  - Observable performance (EN): Use pH and Kw to justify ionic assignments and explain pHneutral=pKw/2 under a temperature change; no fixed number of tasks or supplied pH cases.

**Coverage expectations**

- required expectations: `water-transfer`, `neutrality-temperature`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `ion-excess`: Von saurer zu basischer Lösung wechseln und beide Ionensorten beibehalten. / Change from acidic to alkaline solution while retaining both ionic species.
- `temperature`: Die Neutralitätsaussage bei geändertem pKw prüfen. / Assess neutrality when pKw changes.

**Application cases**

- `water-ion-comparison`
  - Task demand (DE): Deute die bereitgestellten pH4/9/7-Werte bei25°C im idealen Kw=10−14-Modell und erkläre die Amphoterie des Wassers sowie das Vorhandensein beider Ionen.
  - Task demand (EN): Interpret the supplied pH4/9/7 readings at25°C with ideal Kw=10−14 and explain amphoteric water and the presence of both ions.
  - Expected performance (DE): Bei4:10−4/10−10 M, bei9:10−9/10−5 M, bei7:je10−7 M. Diese Zahlen illustrieren verschiedene Gleichgewichtsverhältnisse; ein Überschuss bedeutet nicht Abwesenheit des Gegenions. Ausreichende Erklärung der Aspekte entscheidet, keine starre Dreifallquote.
  - Expected performance (EN): At4:10−4/10−10 M; at9:10−9/10−5 M; at7:10−7 M each. The values illustrate equilibrium ratios; excess does not mean the other ion is absent. Sufficient explanation of the aspects decides, without a fixed three-case quota.
  - Understanding focus (DE): Gekoppelte Ionenbeziehung aus Autoprotolyse.
  - Understanding focus (EN): Coupled ionic relation from autoprotolysis.
- `water-neutral-temperature`
  - Task demand (DE): Nutze den separaten T05-C1-Temperaturvergleich mitpKw13,20 und nicht hydrolysierenden Gegenionen: begründe den neutralen pH und beurteile „neutral ist immer7“.
  - Task demand (EN): Use the separate T05-C1 comparison withpKw13.20 and non-hydrolysing counterions: justify neutral pH and assess “neutral always means7”.
  - Expected performance (DE): Gleiche Ionenaktivitäten ergebenpH=pKw/2=6,60. Der Protonenübertragungscharakter und das Ionenprodukt bleiben; nur die an Temperatur gebundene Zahl ändert sich. Eine Indikatorfarbe ist kein exakter Konzentrations- oder Stoffnachweis.
  - Expected performance (EN): Equal ion activities givepH=pKw/2=6.60. Proton transfer and the ion product remain; the temperature-bound number changes. Indicator colour is no exact concentration or substance test.
  - Understanding focus (DE): Wasserverständnis selbstständig auf veränderte Modellbedingungen übertragen; Farbdiagnostik ist erläuternd, kein zusätzliches Pflichtziel.
  - Understanding focus (EN): Independently transfer water understanding to changed model conditions; colour diagnostics are illustrative rather than an added compulsory goal.
## Page 10: pH-Werte starker und schwacher einprotoniger Säuren berechnen

- Full learning-goal ID: `acdfc7d7-6d6b-5a1f-837c-79449c29a305`
- Goal fingerprint: `sha256:6f7d31c5c10816bdeb791f213ea3c7bc1851f1acef636d0e0a5c83b89916f17c`
- Page fingerprint: `sha256:d08dc562d030a50aae1c1302245e4a6da838d498732374fbd94f8641c22ad377`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.2 Protolysegleichgewichte > Anfangs-pH-Modelle – erhaltener gemeinsamer Kontext

### Canonical description

Die lernende Person kann für wässrige Lösungen starker und schwacher einprotoniger Säuren die Säurestärke von der formalen Konzentration unterscheiden, die Oxoniumionenkonzentration mithilfe des passenden vollständigen oder unvollständigen Protolysemodells bestimmen und den Anfangs-pH mit selbst aus dem MWG abgeleiteten, begründet geprüften Näherungen berechnen.

### Visualization

/assets/goal-visualizations/chemie/acdfc7d7-6d6b-5a1f-837c-79449c29a305/acdfc7d7-6d6b-5a1f-837c-79449c29a305.png

- original digest: `sha256:b35bf727641f4b8d5483fb1c30e69e66d6ced1a9523750f6fe4591956aaefb4f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- pK-Werte nutzen — `48115ff7-7aca-5d0b-a9e7-7fc6c78434ef` (page 6)

### Direct reverse prerequisites

- Charakteristische pH-Werte von Titrationskurven berechnen — `29742d91-732f-5da5-bc46-e963885f9a4a` (page 12)
- Polyprotische Systeme — `dc0470f1-0676-5949-a5cc-02783d478406` (page 13)

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e1c5146fc490440743d1e98e284c26ee63f5eec44c03f1c01bb0c87cda0bfa01`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `acid-model`
  - Essential understanding (DE): Vollständige starke Protolyse und endliches schwaches Säuregleichgewicht sind verschiedene Anfangsmodelle.
  - Essential understanding (EN): Complete strong-acid transfer and finite weak-acid equilibrium are distinct initial models.
  - Observable performance (DE): Unterscheide Stärke und formale Konzentration, begründe die Reaktion und berechne die Oxoniumkonzentration und den Anfangs-pH des passenden Modells.
  - Observable performance (EN): Distinguish strength/formal concentration, justify the reaction and calculate hydronium and initial pH using the appropriate model.
- `acid-derivation`
  - Essential understanding (DE): Die schwache Säure erfordert MWG und Stoffbilanz; die Wurzelnäherung setzt kleine Umsetzung und vernachlässigbaren Wasserbeitrag voraus.
  - Essential understanding (EN): Weak-acid calculation requires mass action/balance; the square-root approximation assumes small conversion and negligible water contribution.
  - Observable performance (DE): Leite die positive quadratische Lösung und Wurzelnäherung für HA selbst her, prüfe Umsetzungsanteil/Fehler und verwerfe die wasserfreie Rechnung bei extremer Verdünnung.
  - Observable performance (EN): Independently derive the positive quadratic and square-root approximations for HA, check conversion/error and reject a water-free calculation at extreme dilution.

**Coverage expectations**

- required expectations: `acid-model`, `acid-derivation`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `strong-weak-acid`: Starke und schwache Säure bei gleichem formalem Gehalt vergleichen. / Compare strong/weak acids at equal formal content.
- `water-boundary`: Von0,0100 M HA zu10−8 M wechseln und die Näherungsgrenze begründen. / Change from0.0100 M HA to10−8 M and explain the approximation limit.

**Application cases**

- `weak-acid-derivation`
  - Task demand (DE): Bearbeite ausschließlich den HA-Zweig von WEAK-MODEL-C1 mitc0=0,0100 M,pKa4,76: leite aus MWG/Bilanz x²/(c0−x)=Ka und die positive Lösung her; vergleiche Wurzel und quadratische Rechnung.
  - Task demand (EN): Work only the HA branch of WEAK-MODEL-C1 withc0=0.0100 M,pKa4.76: derive x²/(c0−x)=Ka and its positive solution, comparing square-root and quadratic calculation.
  - Expected performance (DE): x=(−Ka+√(Ka²+4Kac0))/2≈4,0827·10−4 M,pH≈3,389; Wurzelnäherung≈3,380. Etwa4,08% Umsetzung begründen die bewertete Näherung; keine universelle Prozentregel.
  - Expected performance (EN): x=(−Ka+√(Ka²+4Kac0))/2≈4.0827·10−4 M,pH≈3.389; square-rootpH≈3.380. About4.08% conversion supports evaluation of the approximation without a universal percentage rule.
  - Understanding focus (DE): Eigenständige Herleitung und Fehlerbewertung im Säurezweig.
  - Understanding focus (EN): Independent derivation/error assessment in the acid branch.
- `acid-strength-and-extreme-dilution`
  - Task demand (DE): Vergleiche den starken Säureanfang in T05-C1 mit dem schwachen Modell und prüfe die10−8-M-HA-Variation in WEAK-MODEL-C1.
  - Task demand (EN): Compare the strong-acid start in T05-C1 with the weak model and assess the10−8-M HA variation in WEAK-MODEL-C1.
  - Expected performance (DE): Für0,100 M starke einprotonige Säure gilt im ModellpH1; die schwache Säure liefert bei gleichem Gehalt weniger Oxonium. Bei10−8 M verletzt√(Kac0) die Stoffbilanzannahme; Wasser/Ladungsbilanz sind nötig und bloßes Verdünnen macht die Säure nicht alkalisch.
  - Expected performance (EN): A0.100 M strong monoprotic acid gives modelpH1; a weak acid gives less hydronium at equal content. At10−8 M,√(Kac0) violates the assumed balance regime; water/charge balance are required and dilution alone does not make the acid alkaline.
  - Understanding focus (DE): Stärke/Konzentration und Wassergrenze statt bloßer Formeleinsetzung; keine Titrationsrechnungspflicht.
  - Understanding focus (EN): Strength/concentration and water limits rather than substitution alone; no added titration-calculation requirement.
## Page 11: pH-Werte starker und schwacher einprotoniger Basen berechnen

- Full learning-goal ID: `edcfc5f0-900d-5819-830f-3b14af2bc369`
- Goal fingerprint: `sha256:3b3f6c1bc0d22cfe177173d165baa452db8c4c74e34ada0c964e0330d3df91f1`
- Page fingerprint: `sha256:437c6d28671dae24ace468ac3d1d10429dd4f6a1681f6206a0c7b1ac1bebda01`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.2 Protolysegleichgewichte > Anfangs-pH-Modelle – erhaltener gemeinsamer Kontext

### Canonical description

Die lernende Person kann für wässrige Lösungen starker und schwacher einprotoniger Basen die Basenstärke von der formalen Konzentration unterscheiden, die Hydroxidionenkonzentration mithilfe des passenden vollständigen oder unvollständigen Protolysemodells bestimmen und den Anfangs-pH über pOH und das temperaturabhängige Ionenprodukt mit selbst aus dem MWG abgeleiteten, begründet geprüften Näherungen berechnen.

### Visualization

/assets/goal-visualizations/chemie/edcfc5f0-900d-5819-830f-3b14af2bc369/edcfc5f0-900d-5819-830f-3b14af2bc369.png

- original digest: `sha256:ff6994b400665878170bd96ea0216300a3a24d125af94db6fb87eff24b01eb99`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- pK-Werte nutzen — `48115ff7-7aca-5d0b-a9e7-7fc6c78434ef` (page 6)

### Direct reverse prerequisites

- Charakteristische pH-Werte von Titrationskurven berechnen — `29742d91-732f-5da5-bc46-e963885f9a4a` (page 12)
- Polyprotische Systeme — `dc0470f1-0676-5949-a5cc-02783d478406` (page 13)

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1d5d9f97af7658ad464db9ad502568cad4334917f9cd9728487f91a0db81dedf`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `base-model`
  - Essential understanding (DE): Starke Dissoziation und schwache Base/Wasser-Protolyse liefern verschiedene Hydroxidkonzentrationen bei gleichem Gehalt.
  - Essential understanding (EN): Strong dissociation and weak-base/water protolysis give different hydroxide concentrations at equal content.
  - Observable performance (DE): Begründe vollständige oder unvollständige Umsetzung und berechne Anfangs-[OH−],pOH undpH mit dem temperaturgebundenenpKw.
  - Observable performance (EN): Justify complete or incomplete conversion and calculate initial[OH−],pOH andpH using temperature-boundpKw.
- `base-derivation`
  - Essential understanding (DE): Die schwache Base erfordert ihr eigenes Kb-MWG und Stoffbilanz; kleine Umsetzung und Wasservernachlässigung sind zu prüfen.
  - Essential understanding (EN): The weak base requires its own Kb mass action/balance, checking small conversion and neglected water.
  - Observable performance (DE): Leite positive quadratische Lösung und Wurzelnäherung selbst her, prüfe Umsetzungsgrad/Fehler und benenne Temperatur- und Extremverdünnungsgrenzen.
  - Observable performance (EN): Independently derive the positive quadratic and square-root approximations, check conversion/error and state temperature/extreme-dilution limits.

**Coverage expectations**

- required expectations: `base-model`, `base-derivation`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `strong-weak-base`: NaOH und NH3 beziehungsweise B bei gleichem formalen Gehalt vergleichen. / Compare NaOH and NH3 or B at equal formal content.
- `temperature-and-water`: pOH→pH nur mit gegebenem temperaturabhängigem pKw verwenden und den Wasserbeitrag prüfen. / ConvertpOH→pH with the supplied temperature-dependentpKw and check water contribution.

**Application cases**

- `weak-base-derivation`
  - Task demand (DE): Bearbeite nur den B-Zweig von WEAK-MODEL-C1:0,0100 M,pKb4,75 bei25°C. Leite B+H2O⇌BH++OH−, MWG und positive Lösung her und prüfe die Wurzelnäherung.
  - Task demand (EN): Work only the B branch of WEAK-MODEL-C1:0.0100 M,pKb4.75 at25°C. Derive B+H2O⇌BH++OH−, mass action and positive solution, checking the square-root approximation.
  - Expected performance (DE): Kb=x²/(c0−x),x≈4,1290·10−4 M,pH≈10,616 nachpOH; Wurzel≈10,625. Rund4,13% Umsetzung und der kleine Wasserbeitrag begründen die Rechnung.
  - Expected performance (EN): Kb=x²/(c0−x),x≈4.1290·10−4 M,pH≈10.616 viapOH; square-root≈10.625. About4.13% conversion and small water contribution justify the calculation.
  - Understanding focus (DE): Eigener Basenzweig statt automatischer Übernahme der Säurerechnung.
  - Understanding focus (EN): A distinct base branch rather than automatic reuse of acid calculation.
- `initial-base-comparison`
  - Task demand (DE): Nutze im vollständigen BASE-Fall ausschließlichV=0 für0,100 M NaOH/NH3 und vergleiche die Modelle bei gleichem Gehalt. Erkläre, welche Angaben bei anderer Temperatur/extremer Verdünnung neu gebraucht würden.
  - Task demand (EN): Use onlyV=0 of the complete BASE case for0.100 M NaOH/NH3 and compare models at equal content. Explain inputs needed at another temperature/extreme dilution.
  - Expected performance (DE): NaOH ergibtpH13,00; NH3 mit eigenemKb-Gleichgewicht≈11,12–11,13. Stärke ist nicht Gehalt. pH=pKw−pOH; Wasser darf nahe neutralen Konzentrationen nicht einfach entfallen. Keine Halb-, Salz- oder Überschusspunktrechnung ist für diesen Anfangs-pH-Atom zusätzlich Pflicht.
  - Expected performance (EN): NaOH givespH13.00; NH3 with its ownKb equilibrium≈11.12–11.13. Strength is not content.pH=pKw−pOH; water cannot simply be omitted near neutral concentrations. Half-, salt- and excess-point calculations are not added requirements of this initial-pH atom.
  - Understanding focus (DE): Unabhängiger Modellvergleich und klar begrenzter Anfangsoperator.
  - Understanding focus (EN): Independent model comparison and a bounded initial-pH operator.
## Page 12: Charakteristische pH-Werte von Titrationskurven berechnen

- Full learning-goal ID: `29742d91-732f-5da5-bc46-e963885f9a4a`
- Goal fingerprint: `sha256:f32bfe67ad45250621b17e5dc34191e8fe435d310f2cf74a6a009b868c352391`
- Page fingerprint: `sha256:d90d38b2845cb32b60c99342fa25a11a8e9898361e81e4c48e892409a351666f`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.2 Protolysegleichgewichte

### Canonical description

Die lernende Person kann für vorgegebene Stellen der Titration einer einprotonigen Säure oder Base das passende stöchiometrische und chemische Gleichgewichtsmodell auswählen, den pH-Wert unter Berücksichtigung des Gesamtvolumens berechnen und die verwendeten Näherungen anhand der Stoffmengen und Gleichgewichtsanteile begründen.

### Visualization

/assets/goal-visualizations/chemie/29742d91-732f-5da5-bc46-e963885f9a4a/29742d91-732f-5da5-bc46-e963885f9a4a.jpg

- original digest: `sha256:622a4159ce4666e492be5db738f7487f225bef2f09bfb33b5cd9dc007afce625`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Titrationskurven datengestützt deuten — `28c90c6a-3020-5c51-ac40-d802f3f12d2d` (page 7)
- pH-Werte starker und schwacher einprotoniger Säuren berechnen — `acdfc7d7-6d6b-5a1f-837c-79449c29a305` (page 10)
- pH-Werte starker und schwacher einprotoniger Basen berechnen — `edcfc5f0-900d-5819-830f-3b14af2bc369` (page 11)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1ac82a80c12053a54f019a2997228d84458a0ffac8030ec9a3701cc47b8c0f72`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `n1`
  - Essential understanding (DE): Vor dem Gleichgewicht steht die Stoffmengenbilanz.
  - Essential understanding (EN): Amount balance precedes equilibrium.
  - Observable performance (DE): Wähle für jede vorgelegte Kurvenstelle das Modell und bilanziere Titrant und Probe unter Einbezug des Gesamtvolumens.
  - Observable performance (EN): Choose each point model and balance titrant/sample with total volume.
- `n2`
  - Essential understanding (DE): Starke Überschüsse, schwache Protolyse und Salzprotolyse verlangen unterschiedliche Rechnungen.
  - Essential understanding (EN): Strong excess, weak protolysis and salt protolysis require distinct calculations.
  - Observable performance (DE): Berechne die im konkreten Quellen-/Aufgabenscope verlangten pH-Punkte mit Einheiten und begründe Wasser-/Aktivitäts-/Umsetzungsnäherungen.
  - Observable performance (EN): Calculate the pH points required by the actual source/task scope with units, justifying water/activity/conversion approximations.
- `n3`
  - Essential understanding (DE): Näherungswerte müssen mit Bilanz und Größenordnung verträglich sein.
  - Essential understanding (EN): Approximate values must fit balances and magnitude.
  - Observable performance (DE): Prüfe die Resultate, grenze Halbpunktregeln ein und vergleiche passende vorgelegte Systemvarianten.
  - Observable performance (EN): Check results, bound halfpoint rules and compare appropriate supplied variants.

**Coverage expectations**

- required expectations: `n1`, `n2`, `n3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `acid-base-regions`: Vom starken/schwachen Säuremodell zum starken/schwachen Basenmodell mit den jeweils richtigen Bilanz- und Gleichgewichtsabschnitten wechseln. / Change from strong/weak acids to strong/weak bases using the appropriate regional balances and equilibria.
- `temperature-boundary`: Neutrale Äquivalenz an das gegebene pKw binden. / Bind neutral equivalence to the supplied pKw.

**Application cases**

- `t05-characteristic-acid-points`
  - Task demand (DE): Berechne für die gegebenen starken/schwachen Säuren die verlangten Anfangs-, Halb-, Äquivalenz- und Überschusspunkte. Begründe Modell und Gesamtvolumen; der konkrete Pflichtumfang folgt dem gewählten aktuellen Kurs.
  - Task demand (EN): Calculate requested initial, half-, equivalence and excess points for the supplied strong/weak acids. Justify models and total volume; compulsory point coverage follows the selected current course.
  - Expected performance (DE): Starke Säure: 1,000/1,477/7,000/11,959. Schwache Säure näherungsweise 2,880/4,760/8,729/11,959. Bilanz kommt vor Gleichgewicht; geringe Protolyse-/Hydrolyseanteile begründen die Näherung.
  - Expected performance (EN): Strong acid: 1.000/1.477/7.000/11.959. Weak acid approximately 2.880/4.760/8.729/11.959. Balance precedes equilibrium; small protolysis/hydrolysis fractions justify approximations.
  - Understanding focus (DE): Numerische Eigenleistung statt Ablesen der vorgegebenen Modellantwort.
  - Understanding focus (EN): Independent numerical work rather than reading supplied model answers.
- `base-four-point-model`
  - Task demand (DE): Bearbeite den vollständigen Basenfall: je 25,00 mL 0,100 M NaOH/NH3 mit 0,100 M HCl bei 0/12,50/25,00/30,00 mL. Leite Ka(NH4+) aus Kb ab und begründe alle verlangten Modelle.
  - Task demand (EN): Work the complete base case: 25.00 mL 0.100 M NaOH/NH3 with 0.100 M HCl at 0/12.50/25.00/30.00 mL. Derive Ka(NH4+) from Kb and justify all requested models.
  - Expected performance (DE): NaOH ungefähr 13,00/12,52/7,00/2,04; NH3 ungefähr 11,12–11,13/9,25/5,28/2,04. Gleiches Veq stammt aus gleicher formaler Menge; die schwache Base verlangt zu Beginn Kb, am Halbpunkt das Paar und am Äquivalenzpunkt NH4+-Protolyse.
  - Expected performance (EN): NaOH approximately 13.00/12.52/7.00/2.04; NH3 approximately 11.12–11.13/9.25/5.28/2.04. Equal Veq follows from equal formal amount; weak-base initial, half- and equivalence points require Kb, conjugate-pair and NH4+-protolysis models respectively.
  - Understanding focus (DE): Vier Punkte sind der konkrete NI-eA-Fallumfang, keine allgemeine zusätzliche Aufgabenquote für alle Kurse.
  - Understanding focus (EN): Four points define this NI advanced-course case, not a universal added task quota.
## Page 13: Polyprotische Systeme

- Full learning-goal ID: `dc0470f1-0676-5949-a5cc-02783d478406`
- Goal fingerprint: `sha256:bdcf2f7d8b10e5e57c0c77b53528e57632edbe2d932b19d3d205c5044ba85eb2`
- Page fingerprint: `sha256:5b606aeb357ceb5b2b54ce031ff8baf6f205ea36d821ae6e6a353cb18776bf73`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.2 Protolysegleichgewichte

### Canonical description

Die lernende Person kann mehrprotonige Säure-Base-Systeme berechnen und Puffereigenschaften bewerten.

### Visualization

/assets/goal-visualizations/chemie/dc0470f1-0676-5949-a5cc-02783d478406/dc0470f1-0676-5949-a5cc-02783d478406.jpg

- original digest: `sha256:58c0c0c9e5d8df32f2c439e099b4c0ae331c000bfc20d71dd72d6fc51b25bf19`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Titrationskurven datengestützt deuten — `28c90c6a-3020-5c51-ac40-d802f3f12d2d` (page 7)
- pH-Werte starker und schwacher einprotoniger Säuren berechnen — `acdfc7d7-6d6b-5a1f-837c-79449c29a305` (page 10)
- pH-Werte starker und schwacher einprotoniger Basen berechnen — `edcfc5f0-900d-5819-830f-3b14af2bc369` (page 11)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:503753d97671ffe62831f2091e3766c1846cb9cca7f07568d1c4d3fedb65ad5c`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `poly-amino-c1-r1`
  - Essential understanding (DE): Glycintitration mit zwei Stufen und Grenzen der Halbpunktregel
  - Essential understanding (EN): Two-stage glycine titration and limits of the halfpoint rule
  - Observable performance (DE): Zwei Äquivalenzen, Spezies und eine vollständige beschriftete Modellkurve werden mit Stoffmengen begründet.
  - Observable performance (EN): Justify two equivalences, species and a fully labelled model plot using amounts.
- `poly-amino-c1-r2`
  - Essential understanding (DE): Glycintitration mit zwei Stufen und Grenzen der Halbpunktregel
  - Essential understanding (EN): Two-stage glycine titration and limits of the halfpoint rule
  - Observable performance (DE): Drei berechnete pH-Bereiche und ihre Näherungen werden zahlenmäßig mit der vollständigen Tabelle verglichen.
  - Observable performance (EN): Numerically compare three calculated pH regions and their approximations with the full table.
- `poly-amino-c1-r3`
  - Essential understanding (DE): Glycintitration mit zwei Stufen und Grenzen der Halbpunktregel
  - Essential understanding (EN): Two-stage glycine titration and limits of the halfpoint rule
  - Observable performance (DE): Die erste Halbpunktabweichung wird durch echte Bilanzanteile und nicht durch eine falsche neue pK-Konstante erklärt.
  - Observable performance (EN): Explain the first-halfpoint deviation with balance contributions, not a false new pKa.
- `poly-amino-c1-r4`
  - Essential understanding (DE): Glycintitration mit zwei Stufen und Grenzen der Halbpunktregel
  - Essential understanding (EN): Two-stage glycine titration and limits of the halfpoint rule
  - Observable performance (DE): Pufferbereiche, Zweiäquivalentverbrauch und begrenzte Identifizierbarkeit werden fachlich bewertet.
  - Observable performance (EN): Evaluate buffer regions, two-equivalent consumption and limited identification.

**Coverage expectations**

- required expectations: `poly-amino-c1-r1`, `poly-amino-c1-r2`, `poly-amino-c1-r3`, `poly-amino-c1-r4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `protonation-stage`: Erste und zweite Glycinstufe sowie mono-/diprotischen Äquivalentverbrauch vergleichen. / Compare first/second glycine stages and mono-/diprotic equivalent consumption.
- `formal-halfpoint`: Formales Halbvolumen und tatsächliches Gleichgewichtsverhältnis mit freiem H+ trennen. / Distinguish formal half-volume from equilibrium species ratio with free H+.

**Application cases**

- `glycine-stage-calculations`
  - Task demand (DE): Nutze den vollständigen idealen Glycinfall mit 2,500 mmol, pKa1=2,34 und pKa2=9,60. Begründe beide Äquivalenzvolumina und berechne Anfang, erste Äquivalenz und zweiten Halbpunkt; vergleiche mit der Tabelle.
  - Task demand (EN): Use the complete ideal glycine case with 2.500 mmol, pKa1=2.34 and pKa2=9.60. Justify both equivalence volumes and calculate initial, first-equivalence and second-halfpoint pH against the table.
  - Expected performance (DE): Veq=25/50 mL. Die erste quadratische Protolyse gibt pH≈1,716; Ampholytnäherung 5,97 gegenüber 5,9888 in der Tabelle, zweiter Halbpunkt≈9,60 gegenüber 9,5983. Die Gleichgewichtsformen und endliche Konzentration erklären die Modellgrenzen.
  - Expected performance (EN): Veq=25/50 mL. First-protolysis quadratic gives pH≈1.716; ampholyte approximation 5.97 versus table 5.9888; second halfpoint≈9.60 versus 9.5983. Equilibrium species and finite concentration explain model limits.
  - Understanding focus (DE): Stufenbezogene Bilanz und begründete Näherung statt pauschaler Halbpunktregel.
  - Understanding focus (EN): Stage-specific balance and justified approximation rather than a blanket halfpoint rule.
- `glycine-first-halfpoint-counterexample`
  - Task demand (DE): Prüfe am vollständigen Material die Behauptung pH=2,34 bei 12,50 mL und bewerte Pufferbereiche sowie den monoprotischen Vergleich.
  - Task demand (EN): Assess pH=2.34 at 12.50 mL using the complete material and evaluate buffer regions and the monoprotic comparison.
  - Expected performance (DE): Die volle Bilanz ergibt 2,4359: freies H+ verändert die Spezies gegenüber den formalen Restmengen. HH als Aktivitätsidentität ist nicht widerlegt. Um pH≈6 fehlt ein ausgeprägter Nachbarpaarbestand; zwei Äquivalente und zwei sichtbare Stufen beweisen keine eindeutige Identität jeder polyprotischen Säure.
  - Expected performance (EN): The full balance gives 2.4359: free H+ changes species relative to formal residual amounts. This does not refute the HH activity identity. Near pH≈6 the neighbouring-pair inventory is small; two equivalents/two visible stages do not uniquely identify every polyprotic acid.
  - Understanding focus (DE): Gegenbeispiel zur exakten 1:1-Formalbilanz und begrenzte Pufferbewertung.
  - Understanding focus (EN): Counterexample to exact formal 1:1 accounting and a bounded buffering assessment.
## Page 14: pH-Titrationskurven experimentell aufnehmen und darstellen

- Full learning-goal ID: `e0944fbb-0761-5f9c-afaa-3d4713ed1bed`
- Goal fingerprint: `sha256:99dc2028f5f2cc9cba26b03e03a4f5f795c0b0d036f7cd6e16f0c246b5be6931`
- Page fingerprint: `sha256:04e88ff3cc013d4150453ecc9ab8945280526b584eda3c1df17cef3788fa3c42`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.2 Protolysegleichgewichte

### Canonical description

Die lernende Person kann unter fachlicher Aufsicht pH-Titrationskurven einprotoniger starker und schwacher Säuren mit einem kalibrierten pH-Meter aufnehmen, Messbedingungen und Zugabevolumina protokollieren und die selbst erhobenen Daten mit geeigneter Auflösung als beschriftete Titrationskurven darstellen und den Halbäquivalenzpunkt der schwachen Säure aus den eigenen Messdaten mit begründeter Unsicherheit experimentell ermitteln.

### Visualization

/assets/goal-visualizations/chemie/e0944fbb-0761-5f9c-afaa-3d4713ed1bed/e0944fbb-0761-5f9c-afaa-3d4713ed1bed.png

- original digest: `sha256:b514713d150602d0676ee75792437722abf689eb7b30d98cfe999bcdfaa53afb`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- pK-Werte nutzen — `48115ff7-7aca-5d0b-a9e7-7fc6c78434ef` (page 6)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Säure-Base-Titrationen planen — `02634fdd-c8ba-591a-b240-77129b1bebb8` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:19092c3bc8dd6201fe44a140383d20afbc05d745615b7da00438c20f801ac1c2`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `practical-ph-curves-p1-r1`
  - Essential understanding (DE): Kalibrierung, Zugabekontrolle und eigene Messung bestimmen die Belastbarkeit einer experimentellen Kurve.
  - Essential understanding (EN): Calibration, controlled additions and personal measurement determine an experimental curve’s reliability.
  - Observable performance (DE): Aufsicht bestätigt tatsächliche fachgerechte Durchführung und eigene Messhandlungen; Kalibrierung, Bedingungen und Rohdaten liegen vor.
  - Observable performance (EN): Supervisor confirms actual correct performance and personal measurements, with calibration, conditions and raw data.
- `practical-ph-curves-p1-r2`
  - Essential understanding (DE): Achsen, Auflösung und Unsicherheit verbinden Messpunkte mit einem begrenzten Äquivalenzbereich.
  - Essential understanding (EN): Axes, resolution and uncertainty connect measurements with a bounded equivalence region.
  - Observable performance (DE): Eigene Daten werden beschriftet gezeichnet; Äquivalenz und Unsicherheit folgen aus Auflösung und Kurvenverlauf.
  - Observable performance (EN): Plot personal data with labels; derive equivalence and uncertainty from resolution and shape.
- `practical-ph-curves-p1-r3`
  - Essential understanding (DE): Ein experimenteller Halbpunkt folgt aus eigenem Äquivalenzbefund und eigener pH-Messung.
  - Essential understanding (EN): An experimental halfpoint follows from personal equivalence evidence and pH measurement.
  - Observable performance (DE): Experimenteller Halbpunkt und pK-Schätzung beruhen auf eigenen Daten mit begründeter Näherung.
  - Observable performance (EN): Experimental halfpoint and pKa estimate use personal data and a justified approximation.
- `practical-ph-curves-p1-r4`
  - Essential understanding (DE): Eine Messkurve bleibt ein unsicherer eigener Befund, dessen Reichweite begründet werden muss.
  - Essential understanding (EN): A measured curve remains an uncertain personal observation whose scope needs justification.
  - Observable performance (DE): Begründe die Aussagekraft und Unsicherheit der eigenen Kurve und des Halbäquivalenzpunkts mit dem tatsächlichen Protokoll. Eine zusätzliche Konzentrationsrechnung ist ergänzend und ersetzt keine Messleistung.
  - Observable performance (EN): Justify the scope and uncertainty of the personal curve and half-equivalence point using the actual record. An additional concentration calculation is supplemental and does not replace measurement performance.

**Coverage expectations**

- required expectations: `practical-ph-curves-p1-r1`, `practical-ph-curves-p1-r2`, `practical-ph-curves-p1-r3`, `practical-ph-curves-p1-r4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `acid-class`: Unter gleichen kontrollierten Bedingungen eigene Kurven starker und schwacher Säure unterscheiden. / Distinguish personally acquired strong/weak-acid curves under controlled conditions.
- `resolution-halfpoint`: Messschritte an den beobachteten Sprung anpassen und die Halbpunktunsicherheit aus eigenen Daten begründen. / Adapt measurement steps to the observed jump and justify halfpoint uncertainty using own data.

**Application cases**

- `practical-strong-acid-curve`
  - Task demand (DE): Führe im freigegebenen PRACTICAL-PH-CURVES-P1 die starke Säuremessreihe selbst unter Aufsicht durch; protokolliere Kalibrierung, Temperatur, Zugabevolumina und rohe pH-Werte und zeichne sie mit angemessener Auflösung.
  - Task demand (EN): Personally perform the strong-acid series under supervision in the authorised PRACTICAL-PH-CURVES-P1, recording calibration, temperature, added volumes and raw pH; plot with appropriate resolution.
  - Expected performance (DE): Ein tatsächlich ausgefülltes Rohprotokoll und beobachtete eigene Handhabung tragen die Durchführung. Achsen, Einheiten und Sprungauflösung begründen den Äquivalenzbereich samt Unsicherheit. Berechnete Sollpunkte ersetzen keine Messdaten.
  - Expected performance (EN): A genuine completed raw record and observed personal handling establish execution. Axes, units and jump resolution support equivalence region/uncertainty. Calculated target points cannot replace measurements.
  - Understanding focus (DE): Eigene kontrollierte Messung und Datendarstellung.
  - Understanding focus (EN): Personally controlled measurement and data representation.
- `practical-weak-acid-halfpoint`
  - Task demand (DE): Nimm die schwache Säurekurve selbst auf und bestimme aus dem beobachtetenVeq den Halbpunkt anhand eigener Messwerte oder begründeter Interpolation/Nachmessung.
  - Task demand (EN): Personally acquire the weak-acid curve and derive half-equivalence from observedVeq using own readings or justified interpolation/remeasurement.
  - Expected performance (DE): Vhalf=Veq/2 verwendet das tatsächlich eingegrenzteVeq. NäherungsweisepHhalf≈pKa wird mit Partnergleichheit und ihren Grenzen begründet; Unsicherheit und Anpassungen bleiben sichtbar. Eine Konzentrationsrechnung kann die Auswertung stützen, ist hier kein eigenständiges zusätzliches Abschlussveto.
  - Expected performance (EN): Vhalf=Veq/2 uses actually boundedVeq. ApproximatepHhalf≈pKa is justified through partner equality and its limits, with uncertainty/adaptations visible. Concentration calculation may support analysis but is not an independent added completion veto.
  - Understanding focus (DE): Experimenteller Halbpunkt der schwachen Säure, ohne fiktive Durchführung oder Messwertsubstitution.
  - Understanding focus (EN): Experimental weak-acid halfpoint without fictional execution or substituted readings.
## Page 15: Geschlossene Puffersysteme

- Full learning-goal ID: `9fef5c29-62bc-5ada-b96b-6885bcb049cb`
- Goal fingerprint: `sha256:73fed7cc4495065b177881a98ad74f77b8d784a7c931aecc023f7e7d3cb2b930`
- Page fingerprint: `sha256:44247bb29190812b3a39fbe2e891314fcc076db6530d54f90c1c738bbf82c663`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.4 Puffersysteme

### Canonical description

Die lernende Person kann das Phosphat-Puffersystem beschreiben und die Wirkung mithilfe von Le Chatelier begründen.

### Visualization

/assets/goal-visualizations/chemie/9fef5c29-62bc-5ada-b96b-6885bcb049cb/9fef5c29-62bc-5ada-b96b-6885bcb049cb.jpg

- original digest: `sha256:d51fe2463e00151b9a57ccc70f5ff3d0d913bb0020363eb4c9f9f30be4d8a603`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Offene Puffersysteme — `5a58126e-0c51-5808-be9e-8faa9dae0c32` (page 16)

### Prerequisites outside this book

- Säure-Base-Puffer erklären, auswählen und bewerten — `25729c34-33d5-553a-a723-046113a7da47` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:8a9cf59b9f5d20dcbe5217fc190ca0cf037d429ccfa861c0109c84bd4c6c5adf`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `phosphate-gk-c1-r1`
  - Essential understanding (DE): Geschlossener Phosphatpuffer: Teilchen und Verschiebung
  - Essential understanding (EN): Closed phosphate buffer: particles and equilibrium shifts
  - Observable performance (DE): Partner, Gleichgewicht und beide Abfangreaktionen sind richtig und erklärt.
  - Observable performance (EN): Correctly explain partners, equilibrium and both buffering reactions.
- `phosphate-gk-c1-r2`
  - Essential understanding (DE): Geschlossener Phosphatpuffer: Teilchen und Verschiebung
  - Essential understanding (EN): Closed phosphate buffer: particles and equilibrium shifts
  - Observable performance (DE): Le Chatelier und Teilchenschema zeigen die korrekten Änderungen; kleiner pH-Effekt wird von unverändertem pH unterschieden.
  - Observable performance (EN): Le Chatelier and particle schemes show the correct changes, distinguishing a small pH change from no change.
- `phosphate-gk-c1-r3`
  - Essential understanding (DE): Geschlossener Phosphatpuffer: Teilchen und Verschiebung
  - Essential understanding (EN): Closed phosphate buffer: particles and equilibrium shifts
  - Observable performance (DE): Endliche Vorräte, Geschlossenheit und eine konkret begrenzte biologische Bedeutung werden getrennt beurteilt.
  - Observable performance (EN): Distinguish finite reserves, closed conditions and one bounded biological role.

**Coverage expectations**

- required expectations: `phosphate-gk-c1-r1`, `phosphate-gk-c1-r2`, `phosphate-gk-c1-r3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `acid-versus-base`: Säurezugabe durch Basenzugabe an getrennten geschlossenen Phosphatportionen ersetzen. / Replace acid addition with base addition in separate closed phosphate portions.
- `reserve-boundary`: Begrenzte Last mit Erschöpfung und dem Missverständnis eines unveränderlichen pH vergleichen. / Compare limited loading with depletion and the misconception of invariant pH.

**Application cases**

- `phosphate-acid`
  - Task demand (DE): Erkläre für H2PO4−/HPO4²− im geschlossenen Modell die begrenzte Säurezugabe mit Gleichgewicht, Abfangreaktion und Teilchenschema.
  - Task demand (EN): Explain a limited acid addition to a closed H2PO4−/HPO4²− buffer using equilibrium, reaction and particle scheme.
  - Expected performance (DE): HPO4²−+H3O+→H2PO4−+H2O; das Gleichgewicht verschiebt zum protonierten Partner. Die Phosphatbilanz bleibt erhalten, der pH fällt begrenzt und bleibt nicht exakt gleich.
  - Expected performance (EN): HPO4²−+H3O+→H2PO4−+H2O; equilibrium shifts towards the protonated partner. Phosphate balance is conserved and pH falls modestly rather than remaining exactly fixed.
  - Understanding focus (DE): Le Chatelier an konkreten Partneränderungen statt bloßem Schlagwort.
  - Understanding focus (EN): Apply Le Chatelier through concrete partner changes rather than a slogan.
- `phosphate-base-and-limits`
  - Task demand (DE): Übertrage auf begrenzte OH−-Zugabe; widerlege unendliche Pufferreserve und grenze die Enzym-/Biologieanalogie ein.
  - Task demand (EN): Transfer to limited OH− addition, reject infinite reserve and bound the enzyme/biology analogy.
  - Expected performance (DE): H2PO4−+OH−→HPO4²−+H2O. Der pH steigt weniger als im ungepufferten Modell; endliche Partnerbestände begrenzen die Wirkung. Geschlossenheit bedeutet fehlenden weiteren Austausch, nicht unbegrenzte Stabilität oder ein Modell des gesamten Bluts.
  - Expected performance (EN): H2PO4−+OH−→HPO4²−+H2O. pH rises less than in the unbuffered model; finite partner amounts limit action. Closed means no further exchange, not unlimited stability or a model of the whole blood system.
  - Understanding focus (DE): Geänderte Belastungsrichtung und ehrliche Systemgrenzen ohne HH-Rechenpflicht.
  - Understanding focus (EN): Changed loading direction and explicit system limits without compulsory HH calculation.
## Page 16: Offene Puffersysteme

- Full learning-goal ID: `5a58126e-0c51-5808-be9e-8faa9dae0c32`
- Goal fingerprint: `sha256:eb2a96c5439017239cb72546f9965f218c96ad89bd1ec7510e57ce9c2eb305d9`
- Page fingerprint: `sha256:3fb4d5af5954e03da54031d54d4061cfd065d775b786ae29c59a86d6b993f38d`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.4 Puffersysteme

### Canonical description

Die lernende Person kann Kohlensäure-Hydrogencarbonat- und Ammoniumpuffer in offenen Systemen qualitativ erläutern.

### Visualization

/assets/goal-visualizations/chemie/5a58126e-0c51-5808-be9e-8faa9dae0c32/5a58126e-0c51-5808-be9e-8faa9dae0c32.jpg

- original digest: `sha256:b14e304fe830a3224ef726a85c82ec31e961e9d0c3c446006f52ed76fffb93cb`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Geschlossene Puffersysteme — `9fef5c29-62bc-5ada-b96b-6885bcb049cb` (page 15)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:98efa8caf2515c120ad6afe727bfe636fb413c007fcc55c16ed3ab74dafbb46a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `open-buffer-c1-r1`
  - Essential understanding (DE): Stoffaustausch verändert offene Puffer
  - Essential understanding (EN): Matter exchange changes open buffers
  - Observable performance (DE): Die gekoppelte CO₂-Gleichgewichtsfolge und beide qualitative Änderungen sind korrekt.
  - Observable performance (EN): Correct coupled CO₂ equilibria and both qualitative directions.
- `open-buffer-c1-r2`
  - Essential understanding (DE): Stoffaustausch verändert offene Puffer
  - Essential understanding (EN): Matter exchange changes open buffers
  - Observable performance (DE): NH₃-Verlust wird als Bilanzänderung und Grenze einer unveränderten HH-Eingabe erklärt.
  - Observable performance (EN): Explain NH₃ loss as a balance change invalidating unchanged HH inputs.
- `open-buffer-c1-r3`
  - Essential understanding (DE): Stoffaustausch verändert offene Puffer
  - Essential understanding (EN): Matter exchange changes open buffers
  - Observable performance (DE): Systemgrenzen und fehlende quantitative Daten werden präzise benannt.
  - Observable performance (EN): Specify system boundaries and missing quantitative data.

**Coverage expectations**

- required expectations: `open-buffer-c1-r1`, `open-buffer-c1-r2`, `open-buffer-c1-r3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `gas-species-and-direction`: CO2-Zufuhr/-Entfernung mit Verlust der basischen Komponente NH3 vergleichen. / Compare CO2 supply/removal with loss of the basic component NH3.
- `open-closed`: Erhaltenen Bestand im geschlossenen Gefäß von Stoffströmen und fehlenden quantitativen Angaben unterscheiden. / Distinguish conserved closed-vessel inventory from flows and missing quantitative inputs.

**Application cases**

- `open-carbonate`
  - Task demand (DE): Stelle Gaslösung, Hydratation und Protolyse des offenen CO2/H2CO3/HCO3−-Systems dar und begründe CO2-Zufuhr sowie Abfuhr qualitativ.
  - Task demand (EN): Represent gas dissolution, hydration and protolysis in the open CO2/H2CO3/HCO3− system and explain supply/removal qualitatively.
  - Expected performance (DE): CO2(g)⇌CO2(aq), CO2(aq)+H2O⇌H2CO3 und H2CO3+H2O⇌HCO3−+H3O+ sind gekoppelt. Mehr CO2 senkt unter sonst passenden Bedingungen tendenziell den pH, Abfuhr wirkt umgekehrt; ohne Austausch-/Bestandsdaten folgt keine Zahl.
  - Expected performance (EN): CO2(g)⇌CO2(aq), CO2(aq)+H2O⇌H2CO3 and H2CO3+H2O⇌HCO3−+H3O+ are coupled. More CO2 tends to lower pH under otherwise suitable conditions; removal reverses this, with no numerical prediction absent flow/inventory data.
  - Understanding focus (DE): Gekoppelte Gleichgewichte und veränderter Stoffbestand.
  - Understanding focus (EN): Coupled equilibria and changed inventory.
- `open-ammonia`
  - Task demand (DE): Vergleiche NH4+/NH3 im geschlossenen Gefäß mit unbekanntem NH3-Verlust und prüfe die Weiterverwendung des alten Verhältnisses.
  - Task demand (EN): Compare closed NH4+/NH3 with unknown NH3 loss and assess reuse of the original ratio.
  - Expected performance (DE): NH3-Verlust entfernt die basische Komponente und ändert Bilanz/Verhältnis; tendenziell sinkt der pH. Die Aktivitätsbeziehung bleibt mit neuen tatsächlichen Anteilen möglich, aber alte Stoffmengen liefern keinen neuen Zahlenwert. Reale Regulation ist ein offenes System mit endlicher Reserve.
  - Expected performance (EN): NH3 loss removes the basic component, changing balance/ratio and tending to lower pH. The activity relation may still hold for actual new species, but old amounts do not determine a new value. Real regulation is an open system with finite reserve.
  - Understanding focus (DE): Kein unverändertes HH-Einsetzen bei unbekanntem Austausch.
  - Understanding focus (EN): No unchanged HH substitution under unknown exchange.
## Page 17: Puffer gezielt designen

- Full learning-goal ID: `13877340-1370-5278-bb80-31cf382dd6f5`
- Goal fingerprint: `sha256:a78ca426e7b347a8106d3057fec0288881a59ae9ec20094379ad87fd27bfabc0`
- Page fingerprint: `sha256:732e784deef7aa9fa22e235b2720f6889b3585c7a137ec998db63328cd49943f`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.4 Puffersysteme

### Canonical description

Die lernende Person kann für einen festgelegten pH-Bereich ein konsistentes Pufferrezept bestimmen und die zulässigen endlichen Säure- und Basenbelastungen aus positiven Reststoffmengen und dem zulässigen Komponentenverhältnis berechnen.

### Visualization

/assets/goal-visualizations/chemie/13877340-1370-5278-bb80-31cf382dd6f5/13877340-1370-5278-bb80-31cf382dd6f5.jpg

- original digest: `sha256:74acbf69dfe6e5b9a17478215df414af46c80d38160652602c9de312930ddad7`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Puffer-pH mit der Henderson-Hasselbalch-Gleichung berechnen — `a449e874-6fec-502b-9667-6f078adc4d64` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5a8cf1ba3d15c976dde173291d78ac39c2cae88fb1313da7ed18e6bc324b2d54`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `recipe`
  - Essential understanding (DE): Ziel-pH und pKa legen im geeigneten Modell das Verhältnis fest; Gesamtgehalt und Endvolumen bestimmen die Mengen.
  - Essential understanding (EN): Target pH and pKa determine the ratio in the appropriate model; total content and final volume determine amounts.
  - Observable performance (DE): Bestimme Partnerverhältnis, Stoffmengen, Stockvolumina und Auffüllen auf das festgelegte Endvolumen konsistent.
  - Observable performance (EN): Determine partner ratio, amounts, stock volumes and making up to final volume consistently.
- `finite-loads`
  - Essential understanding (DE): Endliche Säure- und Basenlasten verändern beide Partner und dürfen den erlaubten Verhältnisbereich oder positive Restmengen nicht verletzen.
  - Essential understanding (EN): Finite acid/base loads change both partners and must preserve the permitted ratio range and positive remaining amounts.
  - Observable performance (DE): Berechne beide getrennten Lastfälle und beide Grenzlasten aus den Stoffmengenbilanzen; unterscheide sie von lokaler Differentialkapazität.
  - Observable performance (EN): Calculate both separate load cases and limiting loads from amount balances, distinguishing them from local differential capacity.
- `domain`
  - Essential understanding (DE): Verdünnung kann das ideale pH-Verhältnis erhalten und zugleich die Reserve je Liter verändern; praktische Eignung braucht weitere Prüfungen.
  - Essential understanding (EN): Dilution may preserve the ideal pH ratio while changing reserve per litre; practical suitability requires further checks.
  - Observable performance (DE): Beurteile Verdünnung/Konzentration und nenne Aktivitäts-, Temperatur-, Standardisierungs- und Messgrenzen ohne eine erfolgte Herstellung zu behaupten.
  - Observable performance (EN): Assess dilution/concentration and state activity, temperature, standardisation and measurement limits without claiming actual preparation.

**Coverage expectations**

- required expectations: `recipe`, `finite-loads`, `domain`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `load-direction`: Getrennte HCl- und NaOH-Lasten sowie unterschiedliche Grenz-pH-Werte vergleichen. / Compare separate HCl/NaOH loads and different limiting pH values.
- `ratio-and-concentration`: Gleiches Verhältnis bei verändertem Gesamtgehalt oder Volumen prüfen. / Assess an equal ratio with changed total content or volume.

**Application cases**

- `buffer-recipe`
  - Task demand (DE): Entwirf im BUFFER-DESIGN-C1 100,0 mL 0,1000 M Phosphatpuffer bei pH7,40, pKa7,21 aus zwei 0,2000-M-Stocks.
  - Task demand (EN): Design 100.0 mL 0.1000 M phosphate buffer at pH7.40, pKa7.21 using two 0.2000-M stocks in BUFFER-DESIGN-C1.
  - Expected performance (DE): r=1,54882, Säure3,92339 mmol und Base6,07661 mmol; 19,6169 und30,3831 mL Stock, auf100,0 mL auffüllen. Die Zahlen sind ein konsistentes ideales Rezept und keine tatsächliche Herstellung.
  - Expected performance (EN): r=1.54882, acid3.92339 mmol and base6.07661 mmol; stock volumes19.6169/30.3831 mL, made up to100.0 mL. These specify a consistent ideal recipe, not actual preparation.
  - Understanding focus (DE): Verhältnis, Gesamtstoffmenge und Endvolumen gemeinsam erfüllen.
  - Understanding focus (EN): Meet ratio, total amount and final-volume constraints together.
- `buffer-finite-loads`
  - Task demand (DE): Prüfe getrennt je1,000 mmol HCl/NaOH und bestimme die Lastgrenzen für7,20≤pH≤7,60. Beurteile Verdünnung und Verdoppelung beider Mengen bei gleichem V.
  - Task demand (EN): Assess separate1.000 mmol HCl/NaOH doses and limiting loads for7.20≤pH≤7.60. Evaluate dilution and doubled amounts at fixed V.
  - Expected performance (DE): Nach den Lasten pH7,22331 beziehungsweise7,59394; Grenzen1,13417 mmol Säure und1,02879 mmol Base, bevor ein Partner vollständig verbraucht ist. Gleicher Quotient erhält idealen pH; Reserve je Liter/Gesamtreserve brauchen ihren jeweiligen Volumenbezug. Die β-Ableitung ist fakultativ und kein Abschlussveto.
  - Expected performance (EN): Loaded pH values7.22331/7.59394; limits1.13417 mmol acid and1.02879 mmol base occur before full depletion. Equal ratio preserves ideal pH; per-litre/whole-preparation reserve require their volume basis. Deriving β is optional and cannot veto completion.
  - Understanding focus (DE): Endliche nichtlineare Bilanz statt Verwechslung mit der lokalen Ableitung.
  - Understanding focus (EN): Finite nonlinear balance rather than conflation with a local derivative.
## Page 18: Pufferwirkung experimentell untersuchen

- Full learning-goal ID: `c61b2a7a-fb0f-5a76-92e9-771c789fa816`
- Goal fingerprint: `sha256:e91463bdecca10760ab77ad507be0745552caa295b2e7fb158193190004301c8`
- Page fingerprint: `sha256:979daed8120a246a8c8351d0d4205175c6a6ede867b54bcc60f0486150f1d17a`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.4 Puffersysteme

### Canonical description

Die lernende Person kann unter fachlicher Aufsicht eine vergleichende Untersuchung der Reaktion eines Puffers und einer ungepufferten Lösung auf begrenzte Säure- und Basenzugaben planen und durchführen, eigene pH-Messwerte dokumentieren und die beobachteten Änderungen mithilfe korrespondierender Säure-Base-Paare und endlicher Pufferreserven erklären.

### Visualization

/assets/goal-visualizations/chemie/c61b2a7a-fb0f-5a76-92e9-771c789fa816/c61b2a7a-fb0f-5a76-92e9-771c789fa816.png

- original digest: `sha256:1224035b1fced589ce3dc98b33d6a86a260a5f70eaa8319df00c5974db6b1c06`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Säure-Base-Puffer erklären, auswählen und bewerten — `25729c34-33d5-553a-a723-046113a7da47` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f09b210a860ae0e509e20f043d446541a86aee938ba25677225ca0780f20f6bf`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `practical-buffer-p1-r1`
  - Essential understanding (DE): Ein fairer Vergleich isoliert Pufferwirkung durch kontrollierte Proben, Dosen und Messbedingungen.
  - Essential understanding (EN): A fair comparison isolates buffering through controlled samples, doses and measurement conditions.
  - Observable performance (DE): Vergleichsfrage, Kontrollbedingungen und Herstellung sind fachlich begründet.
  - Observable performance (EN): Justify the question, controls and preparation.
- `practical-buffer-p1-r2`
  - Essential understanding (DE): Experimentelle Pufferwirkung verlangt persönlich erhobene Rohdaten und beobachtete Handlungen.
  - Essential understanding (EN): Experimental buffering requires personally acquired raw data and observed actions.
  - Observable performance (DE): Eigene Messreihen und Handlungen liegen als Rohprotokoll mit Aufsichtsbeobachtung vor.
  - Observable performance (EN): Provide personal raw series and supervisor observation of actions.
- `practical-buffer-p1-r3`
  - Essential understanding (DE): Beide konjugierten Partner fangen unterschiedliche Lasten ab; die Deutung muss zu den eigenen Daten passen.
  - Essential understanding (EN): The two conjugate partners consume different loads; interpretation must fit personal data.
  - Observable performance (DE): Graphischer Vergleich und beide Reaktionen erklären echte Daten ohne Sollwertersatz.
  - Observable performance (EN): Plots and both reactions explain actual data without target substitution.
- `practical-buffer-p1-r4`
  - Essential understanding (DE): Beobachtete Wirkung bleibt an endliche Dosen und Bedingungen gebunden.
  - Essential understanding (EN): Observed action remains bounded by finite doses and conditions.
  - Observable performance (DE): Schlussfolgerungen bleiben auf endliche Dosen begrenzt und trennen Beobachtung von Kapazitätsdesign.
  - Observable performance (EN): Limit conclusions to finite doses and distinguish observations from capacity design.

**Coverage expectations**

- required expectations: `practical-buffer-p1-r1`, `practical-buffer-p1-r2`, `practical-buffer-p1-r3`, `practical-buffer-p1-r4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `load-direction-control`: Säure- und Basenzugaben an getrennten Puffer- und Wasserportionen vergleichen. / Compare acid/base additions in separate buffer and water portions.
- `dose-and-evidence`: Endliche Dosen und tatsächliche Beobachtungen statt unbegrenzter Pufferbehauptung prüfen. / Assess finite doses and actual observations rather than claiming unlimited buffering.

**Application cases**

- `practical-buffer-acid-control`
  - Task demand (DE): Plane und führe im freigegebenen PRACTICAL-BUFFER-P1 die Säurelast an20,00-mL-Puffer und Wasser getrennt aus; protokolliere eigene stabile pH-Werte und Kontrollen.
  - Task demand (EN): Plan and carry out the authorised PRACTICAL-BUFFER-P1 acid-loading comparison of separate20.00-mL buffer/water portions, recording own stable pH values and controls.
  - Expected performance (DE): Vergleichbare Volumina, Titrantstärke, Dosen, Temperatur und Methode erlauben einen begrenzten Vergleich. Acetat fängtH3O+ ab; die gezeichnetenΔpH beruhen auf eigenen Rohwerten, nicht Erwartungen. Aufsicht bestätigt tatsächliche Handlungen.
  - Expected performance (EN): Comparable volumes, titrant strength, doses, temperature and method support a bounded comparison. Acetate consumesH3O+; plottedΔpH must use own raw readings, not targets. Supervision confirms actual actions.
  - Understanding focus (DE): Faire Kontrolle und eigene Daten zur Säureabfangreaktion.
  - Understanding focus (EN): Fair controls and personal data for acid buffering.
- `practical-buffer-base-control`
  - Task demand (DE): Übertrage den Messplan auf getrennte Basenlast an Puffer/Wasser, erkläre beide Reaktionen und begrenze die Folgerungen aus den tatsächlichen Dosen.
  - Task demand (EN): Transfer the plan to separate base loading of buffer/water, explain both reactions and bound conclusions to actual doses.
  - Expected performance (DE): Essigsäure bindetOH− und bildet Acetat/Wasser. Je Portion sind formal0,500 mmol Partner vorhanden, die größte vorgegebene Last0,100 mmol. Eigene Daten entscheiden über Beobachtungen; sie beweisen weder unbegrenzte Reserve noch ein vollständiges Kapazitätsdesign.
  - Expected performance (EN): Acetic acid consumesOH− to form acetate/water. Each portion has0.500 mmol of each partner and a largest specified dose of0.100 mmol. Own data decide observations; these show neither infinite reserve nor a complete capacity design.
  - Understanding focus (DE): Geänderte Reaktionsrichtung mit eigenem Versuch; keine zusätzliche Erschöpfungs- oder Differentialrechnungspflicht.
  - Understanding focus (EN): Changed reaction direction through personal experiment; no added compulsory depletion/differential calculation.
## Page 19: Konduktometrische Fällungstitrationen durchführen und auswerten

- Full learning-goal ID: `7c0b944d-3f1f-5d26-84b0-2a359f689cf0`
- Goal fingerprint: `sha256:d1862c85a12a38a057af7649a7b88b6115827b894c270ff05c9309a690f9dba1`
- Page fingerprint: `sha256:0d4f9ac76becb4b03714e843db0020de405e853189695a26aea40d934af05f09`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Quantitative und instrumentelle Analytik

### Canonical description

Die lernende Person kann eine konduktometrische Fällungstitration unter kontrollierten Messbedingungen durchführen, den Leitfähigkeitsverlauf mit den gelösten Ionen und ihrer Fällung erklären, den Äquivalenzpunkt aus den Messdaten bestimmen und daraus die Konzentration des bestimmten Ions stöchiometrisch berechnen.

### Visualization

/assets/goal-visualizations/chemie/7c0b944d-3f1f-5d26-84b0-2a359f689cf0/7c0b944d-3f1f-5d26-84b0-2a359f689cf0.png

- original digest: `sha256:2ba79c6ee5a58dceca997db185a975c0cb6cd358d047e5b4de9d3fb432ad3138`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Lösungen berechnen und pH bestimmen — `f1ed86f0-534d-57d7-8952-a004a331cc54` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Die Aussagekraft chemischer Daten beurteilen — `4aa3a130-b517-5ac5-87b2-147fe432cadd` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a972319e8be04b61f7e17ff756e4b5b66db811341a8dbc1322e9aaa337b5df7d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Gelöste Ionen tragen verschieden zur Leitfähigkeit bei; bei der Fällung ändern sich Art und Menge der gelösten Ladungsträger.
  - Essential understanding (EN): Dissolved ions contribute differently to conductivity; precipitation changes the species and amounts of dissolved charge carriers.
  - Observable performance (DE): Erklärt Anfangsabfall und nachfolgenden Anstieg aus allen beteiligten Ionen statt die Farbe als EDTA-Endpunkt umzudeuten.
  - Observable performance (EN): Explains initial decline and subsequent rise from all involved ions rather than treating colour as an EDTA endpoint.
- `e2`
  - Essential understanding (DE): Ein experimenteller Leitfähigkeitsverlauf verlangt kontrollierte eigene Messungen; konstruierte Tabellen sind nur Auswertungsmaterial.
  - Essential understanding (EN): An experimental conductivity curve requires controlled own measurements; constructed tables provide analysis material only.
  - Observable performance (DE): Führt den lokal freigegebenen Versuch tatsächlich durch und dokumentiert beobachtete Bedienung, rohe Daten und Kontrollen.
  - Observable performance (EN): Actually performs the locally authorized experiment and records observed handling, raw data and controls.
- `e3`
  - Essential understanding (DE): Äquivalenzpunkt, Reaktionsstöchiometrie und tatsächliche Probenannahmen bestimmen die berechenbare Konzentration.
  - Essential understanding (EN): Equivalence, reaction stoichiometry and actual sample assumptions determine which concentration can be calculated.
  - Observable performance (DE): Berechnet den Chloridgehalt und begründet den veränderten CaCl2-Faktor sowie die Grenzen bei unbekannter Matrix.
  - Observable performance (EN): Calculates chloride and explains the changed CaCl2 factor and limits in an unknown matrix.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `ion-stoichiometry-matrix`: Von reiner NaCl-Modellprobe zu deklarierter CaCl2-Probe und unbekannter Matrix wechseln. / Change from pure NaCl model sample to declared CaCl2 and an unknown matrix.
- `raw-corrected`: Rohmessung von gesonderter Volumenkorrektur und begrenzter Geradenauswertung unterscheiden. / Distinguish raw measurement from separate volume correction and bounded line analysis.

**Application cases**

- `conductometric-own-series`
  - Task demand (DE): Führe nach örtlicher Methodenfreigabe den vollständigen K1-Untersuchungstyp unter Aufsicht tatsächlich durch; dokumentiere Kalibrierung, Temperatur, rohe Volumen/Leitfähigkeitswerte, kontrollierte Zugaben und eigene Auswertung.
  - Task demand (EN): After local method authorisation actually perform the complete K1 investigation under supervision, documenting calibration, temperature, raw volume/conductivity, controlled additions and own analysis.
  - Expected performance (DE): Ag++Cl−→AgCl(s); Na+ bleibt, Cl− wird vor Äquivalenz durch geringer leitendesNO3− ersetzt, danach steigenAg+ undNO3−. Der synthetische Vergleich hat Schnitt25,00 mL undcCl=0,01000 M; nur eigenes Protokoll belegt Durchführung. Volumenkorrektur beseitigt keine Zell-/Temperatur-/Matrixfehler.
  - Expected performance (EN): Ag++Cl−→AgCl(s); Na+ remains and less-conductingNO3− replacesCl− before equivalence; Ag+/NO3− increase after it. The synthetic comparison intersects at25.00 mL withcCl=0.01000 M; only an own record supports execution. Volume correction removes no cell/temperature/matrix errors.
  - Understanding focus (DE): Tatsächliche kontrollierte Messung und vollständige ionische Deutung, kein EDTA-Nachweis.
  - Understanding focus (EN): Actual controlled measurement and complete ionic interpretation, with no EDTA claim.
- `conductometric-changed-matrix`
  - Task demand (DE): Bearbeite K2 mit20,00 mL deklarierter reinerCaCl2-Probe und20,00 mL0,01000 M AgNO3 bei Äquivalenz. Begründe Chlorid- undCaCl2-Konzentration und grenze die Aussage bei unbekanntem Kation oder anderem fällbarem Anion ein.
  - Task demand (EN): Work K2 with20.00 mL declared pureCaCl2 sample and20.00 mL0.01000 M AgNO3 at equivalence. Justify chloride/CaCl2 concentration and limits with unknown cations or another precipitable anion.
  - Expected performance (DE): nCl=0,2000 mmol,cCl=0,01000 M,cCaCl2=0,005000 M nur unter reinerCaCl2-Annahme. Ein Chloridsignal beweist bei unbekannten Kationen kein Calcium; weitere fällbare Anionen gefährden sogar die Chloridselektivität.
  - Expected performance (EN): nCl=0.2000 mmol,cCl=0.01000 M,cCaCl2=0.005000 M only for pureCaCl2. With unknown cations chloride establishes no calcium concentration; other precipitable anions threaten even chloride selectivity.
  - Understanding focus (DE): Geänderte Stöchiometrie und Selektivitätsgrenzen statt Wiederholung derselben Tabellenablesung.
  - Understanding focus (EN): Changed stoichiometry and selectivity limits rather than repeated reading of the same table.

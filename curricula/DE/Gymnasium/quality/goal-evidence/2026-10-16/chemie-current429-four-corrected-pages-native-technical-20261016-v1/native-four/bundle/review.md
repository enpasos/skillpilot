# AI review input: Chemie – vier aktuelle Lernzielseiten zur unabhängigen Beschreibungsprüfung

- Book ID: `chemie-current429-four-corrected-pages-20261016-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:8958c949d261e32e9d536f1865c1b91d6ef395c1e5aaaed75b6b948ff8db06f4`
- Selected goals: 4

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Säure-Base-Paare vergleichen

- Full learning-goal ID: `b4777001-f4ed-5fe9-9d98-02319abdea09`
- Goal fingerprint: `sha256:0a305eca237674d462046fe8a6d980667988fcde46bbd9427db1509a6eccd0f9`
- Page fingerprint: `sha256:a671a67a46ce80517d2d61a1e989efc7ba0837773be8c779939b76e62e391104`
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
## Page 2: pH-Werte starker und schwacher einprotoniger Basen berechnen

- Full learning-goal ID: `edcfc5f0-900d-5819-830f-3b14af2bc369`
- Goal fingerprint: `sha256:effe2802f5fc32be1bc64106aa4e17bfdc28293997d81646e27722211159cd1d`
- Page fingerprint: `sha256:66c6f287148c4a26b40159115d053644a05a04fb10b1636eb9389a6ab15083a0`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.2 Protolysegleichgewichte > Anfangs-pH-Modelle – erhaltener gemeinsamer Kontext

### Canonical description

Die lernende Person kann für wässrige Lösungen starker und schwacher einprotoniger Basen die Basenstärke von der formalen Konzentration unterscheiden, die Hydroxidionenkonzentration mit dem passenden Dissoziations- oder Protolysemodell bestimmen und den Anfangs-pH über pOH und das temperaturabhängige Ionenprodukt berechnen; Näherungen für schwache Basen leitet sie selbst aus dem MWG ab und prüft ihre Gültigkeit.

### Visualization

/assets/goal-visualizations/chemie/edcfc5f0-900d-5819-830f-3b14af2bc369/edcfc5f0-900d-5819-830f-3b14af2bc369.png

- original digest: `sha256:ff6994b400665878170bd96ea0216300a3a24d125af94db6fb87eff24b01eb99`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Polyprotische Systeme — `dc0470f1-0676-5949-a5cc-02783d478406` (page 3)

### Prerequisites outside this book

- pK-Werte nutzen — `48115ff7-7aca-5d0b-a9e7-7fc6c78434ef` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Charakteristische pH-Werte von Titrationskurven berechnen — `29742d91-732f-5da5-bc46-e963885f9a4a` (outside this book)

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
## Page 3: Polyprotische Systeme

- Full learning-goal ID: `dc0470f1-0676-5949-a5cc-02783d478406`
- Goal fingerprint: `sha256:5c2a1af415b89d6d4d11d9ec5a81afb4c54949ea70285c0114970c1fd4345439`
- Page fingerprint: `sha256:766c64bfd80604127d63bf4c4e58f34b7e37a2b2dcad1d6c68bd9912b9e4b8a1`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.2 Protolysegleichgewichte

### Canonical description

Die lernende Person kann für mehrprotonige Säure-Base-Systeme pH-Werte aus den aufeinanderfolgenden Protolysegleichgewichten mit begründeten Näherungen berechnen und die Pufferbereiche anhand der jeweils vorhandenen korrespondierenden Paare bewerten.

### Visualization

/assets/goal-visualizations/chemie/dc0470f1-0676-5949-a5cc-02783d478406/dc0470f1-0676-5949-a5cc-02783d478406.png

- original digest: `sha256:7000f3bd52d14ba3542f5f018d4139f306db6bc15f3435a308db31ab7cbbd8a6`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- pH-Werte starker und schwacher einprotoniger Basen berechnen — `edcfc5f0-900d-5819-830f-3b14af2bc369` (page 2)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Titrationskurven datengestützt deuten — `28c90c6a-3020-5c51-ac40-d802f3f12d2d` (outside this book)
- pH-Werte starker und schwacher einprotoniger Säuren berechnen — `acdfc7d7-6d6b-5a1f-837c-79449c29a305` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:66ce11f77b458d32592548c33e563258586105ba576c70833f5cd4656cdddf91`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `poly-amino-c1-r1`
  - Essential understanding (DE): Die aufeinanderfolgenden Protonierungsstufen eines mehrprotonigen Systems sind über Stoffmengen- und Ladungsbilanzen verknüpft; im Glycinmodell entsprechen ihnen zwei Protonenäquivalente.
  - Essential understanding (EN): Successive protonation stages of a polyprotic system are linked by material and charge balances; in the glycine model they correspond to two proton equivalents.
  - Observable performance (DE): Zwei Äquivalenzen, Spezies und eine vollständige beschriftete Modellkurve werden mit Stoffmengen begründet.
  - Observable performance (EN): Justify two equivalences, species and a fully labelled model plot using amounts.
- `poly-amino-c1-r2`
  - Essential understanding (DE): Die vorherrschenden Spezies und ihre Gleichgewichte bestimmen, welche pH-Näherung an Anfang, Ampholytpunkt oder Halbpunkt gilt; endliche Konzentration und Bilanzanteile begrenzen die Näherung.
  - Essential understanding (EN): Dominant species and their equilibria determine which pH approximation applies initially, at the ampholyte point or at a halfpoint; finite concentration and balance contributions limit the approximation.
  - Observable performance (DE): Drei berechnete pH-Bereiche und ihre Näherungen werden zahlenmäßig mit der vollständigen Tabelle verglichen.
  - Observable performance (EN): Numerically compare three calculated pH regions and their approximations with the full table.
- `poly-amino-c1-r3`
  - Essential understanding (DE): Ein formales halbes Äquivalenzvolumen garantiert kein tatsächliches 1:1-Verhältnis des korrespondierenden Paares, wenn freie Wasserstoffionen merklich zur Bilanz beitragen; die Henderson-Hasselbalch-Beziehung für Aktivitäten bleibt gültig.
  - Essential understanding (EN): A formal half-equivalence volume does not guarantee an actual 1:1 conjugate-pair ratio when free hydrogen ions contribute appreciably to the balances; the Henderson–Hasselbalch relation for activities remains valid.
  - Observable performance (DE): Die erste Halbpunktabweichung wird durch echte Bilanzanteile und nicht durch eine falsche neue pK-Konstante erklärt.
  - Observable performance (EN): Explain the first-halfpoint deviation with balance contributions, not a false new pKa.
- `poly-amino-c1-r4`
  - Essential understanding (DE): Wirksame Pufferung erfordert einen ausreichenden Bestand beider Partner eines korrespondierenden Paares; zwei verbrauchte Protonenäquivalente oder zwei sichtbare Stufen identifizieren eine Substanz nicht eindeutig.
  - Essential understanding (EN): Effective buffering requires appreciable inventories of both conjugate partners; consumption of two proton equivalents or two visible stages does not uniquely identify a substance.
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
## Page 4: Offene Puffersysteme

- Full learning-goal ID: `5a58126e-0c51-5808-be9e-8faa9dae0c32`
- Goal fingerprint: `sha256:73d99f116208262c6493c96a019f01bef96792c59a0f72010256369433e26b1f`
- Page fingerprint: `sha256:9b1c808eac320b5cc64737d0bad0e2e98b98a39d95b6c25aaf876ea5e83befad`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.4 Puffersysteme

### Canonical description

Die lernende Person kann an Kohlensäure-Hydrogencarbonat- und Ammonium-Ammoniak-Puffern qualitativ erklären, wie Stoffaustausch mit der Umgebung die gekoppelten Gleichgewichte, die Pufferbestandteile und den pH beeinflusst.

### Visualization

/assets/goal-visualizations/chemie/5a58126e-0c51-5808-be9e-8faa9dae0c32/5a58126e-0c51-5808-be9e-8faa9dae0c32.png

- original digest: `sha256:e2b26d5fbd52d7baf8d63eba8b1206947244a6a3b06d39cf9ea21da1b5626408`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Geschlossene Puffersysteme — `9fef5c29-62bc-5ada-b96b-6885bcb049cb` (outside this book)

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

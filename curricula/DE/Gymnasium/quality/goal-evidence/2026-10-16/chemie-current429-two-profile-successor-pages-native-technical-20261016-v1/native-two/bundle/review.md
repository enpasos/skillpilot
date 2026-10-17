# AI review input: Chemie – zwei aktuelle Lernzielseiten zur unabhängigen Beschreibungsprüfung

- Book ID: `chemie-current429-two-profile-successor-pages-20261016-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:d609f3ac3c573ffedb7fba4c3db85aa3f0bb6946a0a8c9fcbdc70a54616be0f7`
- Selected goals: 2

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Polyprotische Systeme

- Full learning-goal ID: `dc0470f1-0676-5949-a5cc-02783d478406`
- Goal fingerprint: `sha256:5c2a1af415b89d6d4d11d9ec5a81afb4c54949ea70285c0114970c1fd4345439`
- Page fingerprint: `sha256:ec4986e1ca62eedbcc61c62c79dbc0cd11b8b8fe0d265446c2252a52e650bcd1`
- Topic path: Chemie – kanonische M7-Prüfsicht > Chemie > Chemisches Gleichgewicht > Q3.2 Protolysegleichgewichte

### Canonical description

Die lernende Person kann für mehrprotonige Säure-Base-Systeme pH-Werte aus den aufeinanderfolgenden Protolysegleichgewichten mit begründeten Näherungen berechnen und die Pufferbereiche anhand der jeweils vorhandenen korrespondierenden Paare bewerten.

### Visualization

/assets/goal-visualizations/chemie/dc0470f1-0676-5949-a5cc-02783d478406/dc0470f1-0676-5949-a5cc-02783d478406.png

- original digest: `sha256:7000f3bd52d14ba3542f5f018d4139f306db6bc15f3435a308db31ab7cbbd8a6`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Titrationskurven datengestützt deuten — `28c90c6a-3020-5c51-ac40-d802f3f12d2d` (outside this book)
- pH-Werte starker und schwacher einprotoniger Säuren berechnen — `acdfc7d7-6d6b-5a1f-837c-79449c29a305` (outside this book)
- pH-Werte starker und schwacher einprotoniger Basen berechnen — `edcfc5f0-900d-5819-830f-3b14af2bc369` (outside this book)

### Direct reverse prerequisites outside this book

- Sek-II-Abschlussaufgaben Chemie bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4aa86253d04b84ddfbd11ed0cd68b16247ed1d740a0a746442c1f5a6f959ea16`
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
- `pka-separation-and-initial-charge`: Unabhängiges neutrales H₂A-System mit pKa1=4,00 und pKa2=5,00 statt Glycin: Gegenionenbilanz, Stufenüberlappung und pH-Näherungen neu beurteilen. / Independent neutral H2A with pKa1=4.00 and pKa2=5.00 replaces glycine: reassess counterion balance, overlapping stages and pH approximations.

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
- `independent-close-pka-neutral-diprotic-transfer`
  - Task demand (DE): Bearbeite den vollständig vorgelegten unabhängigen POLY-FRESH-C2-Fall: 25,00mL0,0500MH₂A mit pKa1=4,00/pKa2=5,00 und0,1000MNaOH. Leite die neue Bilanz ab, berechne Anfang/Ampholyt und prüfe beide formalen Halbpunkte sowie Stufenüberlappung.
  - Task demand (EN): Use complete independent POLY-FRESH-C2:25.00mL0.0500MH2A,pKa1=4.00/pKa2=5.00,0.1000MNaOH. Derive the changed balance, calculate initial/ampholyte pH, and assess both formal halfpoints and overlapping stages.
  - Expected performance (DE): Veq=12,50/25,00mL; volle Bilanz: AnfangspH=2.65826, erste formale Hälfte=3.91019, Ampholyt=4.50106, zweite formale Hälfte=5.09437. Die engeren pKa-Werte führen zu relevanten weiteren Speziesanteilen statt garantierter isolierter 1:1-Pufferpaare.
  - Expected performance (EN): Veq=12.50/25.00mL; full balances: initialpH=2.65826, firstformalhalf=3.91019, ampholyte=4.50106, secondformalhalf=5.09437. Closer pKa values produce appreciable additional species rather than guaranteed isolated1:1bufferpairs.
  - Understanding focus (DE): Unabhängiger Transfer der vollständigen Modellwahl bei geändertem pKa-Abstand und anderer Ausgangsladung; zwei Teilaufträge der alten Glycintitration ersetzen diese frische Variation nicht.
  - Understanding focus (EN): Independent transfer of full model choice under changed pKa separation and initial charge; two subtasks of the old glycine titration do not replace this fresh variation.
## Page 2: Offene Puffersysteme

- Full learning-goal ID: `5a58126e-0c51-5808-be9e-8faa9dae0c32`
- Goal fingerprint: `sha256:73d99f116208262c6493c96a019f01bef96792c59a0f72010256369433e26b1f`
- Page fingerprint: `sha256:cd91332750a5d34c864589a19096a3000538ac83ea129fc8458845b7faaa6037`
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

Status: `needs_human_review`; profile fingerprint: `sha256:a3510966adc2bb44da63f014e516042204116f5aa275a702ee54577b0441a8a2`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `open-buffer-c1-r1`
  - Essential understanding (DE): Stoffaustausch von CO₂ koppelt Gaslösung, Hydratation und Protolyse; bei sonst gleichen Bedingungen verändert CO₂-Zu- oder -Abfuhr den Carbonatbestand und dessen pH-Tendenz.
  - Essential understanding (EN): CO2 exchange couples dissolution, hydration and protolysis; with other conditions controlled, supplying or removing CO2 changes carbonate inventory and its pH tendency.
  - Observable performance (DE): Die gekoppelte CO₂-Gleichgewichtsfolge und beide qualitative Änderungen sind korrekt.
  - Observable performance (EN): Correct coupled CO₂ equilibria and both qualitative directions.
- `open-buffer-c1-r2`
  - Essential understanding (DE): Entweichendes NH₃ entfernt eine basische Pufferkomponente und verändert den NH₄⁺/NH₃-Bestand; das frühere Komponentenverhältnis und die ursprüngliche Basenreserve gelten danach nicht unverändert.
  - Essential understanding (EN): Escaping NH3 removes a basic buffer component and changes NH4+/NH3 inventories; the previous component ratio and initial base reserve no longer apply unchanged.
  - Observable performance (DE): NH₃-Verlust wird als Bilanzänderung und Grenze einer unveränderten HH-Eingabe erklärt.
  - Observable performance (EN): Explain NH₃ loss as a balance change invalidating unchanged HH inputs.
- `open-buffer-c1-r3`
  - Essential understanding (DE): Eine offene Systemgrenze erlaubt Bestandsänderungen; Ausgangsmengen allein legen nach unbekanntem Stoffaustausch keinen neuen Zahlen-pH fest. Geschlossenheit hält den Gesamtbestand fest, bedeutet aber weder unveränderten pH noch unbegrenzte Pufferreserve.
  - Essential understanding (EN): An open boundary permits inventory changes; initial amounts alone determine no new numerical pH after unknown matter exchange. Closure preserves total inventory but implies neither unchanged pH nor unlimited buffer reserve.
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

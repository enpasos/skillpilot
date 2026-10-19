# AI review input: Chemie: gezielte aktuelle Beschreibungs- und Kontextprüfung

- Book ID: `chemie-current454-current-edit-native-d-001-20261018-v1`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:aeabf68f2929b22b58f15800abe0653760733397617529b70f4e7f10604b6feb`
- Selected goals: 20

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: pH-Werte in Alltag, Technik und Biologie erörtern

- Full learning-goal ID: `0bf26276-2780-506c-ac34-35dd44a29409`
- Goal fingerprint: `sha256:3f6c5f65311208c740c0b595bc889fa8b23d4cab3c5ba475ae15e63b1e1cd0ce`
- Page fingerprint: `sha256:9ddeb72b196da7fe39c966b17dac5c6589bfc9ff807cf5e9721d7605e0bffd24`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann die Bedeutung saurer und basischer Lösungen in Alltag, Technik und biologischen Systemen erörtern und Folgen von pH-Wert-Änderungen fachlich abschätzen.

### Visualization

/assets/goal-visualizations/chemie/0bf26276-2780-506c-ac34-35dd44a29409/0bf26276-2780-506c-ac34-35dd44a29409.png

- original digest: `sha256:e4890ddda700dbd6c7d36304c719555cbe05c6d2d4273902ea032a0594a06ae9`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Saure, alkalische und neutrale Lösungen unterscheiden — `d2ccd1d5-56f7-583f-9724-e97441367f91` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1f24cf597fece3c22616ceac2fd9bc1b5950b44aa8661c4d69005437d1e56271`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `core-understanding`
  - Essential understanding (DE): Die Wirkung einer pH-Änderung hängt vom chemischen System, seiner Funktion und den gegebenen Randbedingungen ab. Sauer/basisch sind keine pauschalen Urteile über Nutzen oder Gefahr; ein pH-Wert allein beschreibt weder Pufferkapazität noch Stoffidentität.
  - Essential understanding (EN): Effects of pH changes depend on the chemical system, function and stated conditions. Acidic/basic are not blanket judgments of usefulness or danger; pH alone specifies neither buffer capacity nor substance identity.
  - Observable performance (DE): Oxoniumionen reagieren mit Carbonat: CaCO3 + 2 H3O+ → Ca2+ + CO2 + 3 H2O; der Belag wird umgewandelt. Bei dem gegebenen Enzym fällt die Aktivität von pH 7 zu 3 stark; Protonierung funktioneller Gruppen kann Bindung, Struktur oder Aktivität beeinflussen. „Sauer“ ist deshalb je nach Anwendung hilfreich oder störend. Die Daten beweisen weder die Eignung für alle Werkstoffe noch dieselbe pH-Abhängigkeit aller Enzyme. Konzentration, Kontaktzeit und weitere Stoffe wären zusätzliche Bewertungskriterien.
  - Observable performance (EN): Oxonium ions react with carbonate: CaCO3 + 2 H3O+ → Ca2+ + CO2 + 3 H2O; scale is chemically converted. The supplied enzyme loses considerable activity from pH 7 to 3; protonation of functional groups can affect binding, structure or activity. Thus “acidic” can be useful or disruptive depending on application. These data establish neither compatibility with all materials nor the same pH dependence for every enzyme. Concentration, contact time and other substances are additional criteria.
- `fresh-transfer-and-limit`
  - Essential understanding (DE): Technische Entkalkung und biologische Enzymdaten gegenüber gegebenen Gewässergrenzen und säureempfindlichem Werkstoff; Kriterien statt bloßer pH-Rangfolge. Die Modellgrenze 6,5–8,5 wird nicht als universelle gesetzliche Gewässernorm ausgegeben.
  - Essential understanding (EN): Technical descaling and biological enzyme data versus stated aquatic limits and an acid-sensitive material; criteria rather than a pH ranking. The model range 6.5–8.5 is not presented as a universal statutory aquatic standard.
  - Observable performance (DE): pH 5,0 unterschreitet die gegebene Gewässergrenze und ist für dieses System unerwünscht. Auch für M spricht die Tabelle gegen Kontakt. Ein pH-Wert beschreibt die aktuelle Oxoniumaktivität, nicht die gesamten nachlieferbaren Säureäquivalente: unterschiedlich gepufferte Lösungen können dieselben pH-Werte und verschieden große Neutralisationsbedarfe besitzen. Eine Stoffidentifikation folgt ebenfalls nicht daraus. Vor einer technischen Maßnahme müssten Zusammensetzung, Volumen, Pufferung und Stoffverträglichkeit geklärt werden.
  - Observable performance (EN): pH 5.0 is below the supplied aquatic limit and undesirable for this system. The table also argues against contact with M. pH reflects current oxonium activity, not all acid equivalents that can subsequently be released: differently buffered solutions may have identical pH but different neutralization requirements. It does not identify the acid either. Composition, volume, buffering and material compatibility would need clarification before a technical intervention.

**Coverage expectations**

- required expectations: `core-understanding`, `fresh-transfer-and-limit`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `specific-system-variation`: Technische Entkalkung und biologische Enzymdaten gegenüber gegebenen Gewässergrenzen und säureempfindlichem Werkstoff; Kriterien statt bloßer pH-Rangfolge. / Technical descaling and biological enzyme data versus stated aquatic limits and an acid-sensitive material; criteria rather than a pH ranking.
- `model-boundary`: Die Modellgrenze 6,5–8,5 wird nicht als universelle gesetzliche Gewässernorm ausgegeben. / The model range 6.5–8.5 is not presented as a universal statutory aquatic standard.

**Application cases**

- `chem-next20-0bf26276-case-1`
  - Task demand (DE): Fiktives Unterrichtsmaterial: Kalkbelag enthält CaCO3. Im Modell reagiert er mit Oxoniumionen unter CO2-Bildung. Ein Enzym zeigt bei identischer Temperatur relative Aktivitäten 90 % bei pH 6, 100 % bei pH 7 und 20 % bei pH 3. Die angegebenen Aktivitäten sind ausschließlich Daten dieses Enzyms. Erkläre, warum eine saure Lösung technisch zur Entkalkung nützlich sein kann, eine vergleichbare pH-Absenkung aber die gegebene Enzymfunktion stört. Begründe die Grenzen dieser Bewertung.
  - Task demand (EN): Fictional teaching material: scale contains CaCO3. In the model it reacts with oxonium ions to release CO2. At identical temperature one enzyme has relative activities of 90% at pH 6, 100% at pH 7 and 20% at pH 3. The supplied activities apply only to this enzyme. Explain why an acidic solution can be useful for technical descaling while a comparable pH decrease disrupts the supplied enzyme function. State the limits of the evaluation.
  - Expected performance (DE): Oxoniumionen reagieren mit Carbonat: CaCO3 + 2 H3O+ → Ca2+ + CO2 + 3 H2O; der Belag wird umgewandelt. Bei dem gegebenen Enzym fällt die Aktivität von pH 7 zu 3 stark; Protonierung funktioneller Gruppen kann Bindung, Struktur oder Aktivität beeinflussen. „Sauer“ ist deshalb je nach Anwendung hilfreich oder störend. Die Daten beweisen weder die Eignung für alle Werkstoffe noch dieselbe pH-Abhängigkeit aller Enzyme. Konzentration, Kontaktzeit und weitere Stoffe wären zusätzliche Bewertungskriterien.
  - Expected performance (EN): Oxonium ions react with carbonate: CaCO3 + 2 H3O+ → Ca2+ + CO2 + 3 H2O; scale is chemically converted. The supplied enzyme loses considerable activity from pH 7 to 3; protonation of functional groups can affect binding, structure or activity. Thus “acidic” can be useful or disruptive depending on application. These data establish neither compatibility with all materials nor the same pH dependence for every enzyme. Concentration, contact time and other substances are additional criteria.
  - Understanding focus (DE): Keine Empfehlung zur Selbstbehandlung und keine allgemeine Enzym-pH-Kurve; die Bewertung gilt für vorgegebene Fälle.
  - Understanding focus (EN): No self-treatment recommendation and no universal enzyme pH curve; the evaluation applies to the supplied cases.
- `chem-next20-0bf26276-case-2`
  - Task demand (DE): Frischer fiktiver Planungsfall: Für ein Modellgewässer ist ein zulässiger pH-Bereich 6,5–8,5 vorgegeben; nach Eintrag einer sauren Lösung wird pH 5,0 gemessen. Ein Werkstoff M wird laut bereitgestellter Materialtabelle von sauren Lösungen angegriffen. Zwei Flüssigkeiten mit pH 5,0 haben unterschiedliche, hier nicht bestimmte Pufferkapazitäten. Beurteile Folgen des Eintrags anhand der gegebenen Kriterien und begründe, warum aus dem pH-Wert allein weder die nötige Neutralisationsmenge noch die Identität der Säure folgt.
  - Task demand (EN): Fresh fictional planning case: a model aquatic system has a supplied acceptable pH range of 6.5–8.5; pH 5.0 is measured after an acidic discharge. A supplied compatibility table states that material M is attacked by acidic solutions. Two liquids at pH 5.0 have different, unspecified buffer capacities. Evaluate consequences using the supplied criteria and explain why pH alone determines neither the required neutralization amount nor acid identity.
  - Expected performance (DE): pH 5,0 unterschreitet die gegebene Gewässergrenze und ist für dieses System unerwünscht. Auch für M spricht die Tabelle gegen Kontakt. Ein pH-Wert beschreibt die aktuelle Oxoniumaktivität, nicht die gesamten nachlieferbaren Säureäquivalente: unterschiedlich gepufferte Lösungen können dieselben pH-Werte und verschieden große Neutralisationsbedarfe besitzen. Eine Stoffidentifikation folgt ebenfalls nicht daraus. Vor einer technischen Maßnahme müssten Zusammensetzung, Volumen, Pufferung und Stoffverträglichkeit geklärt werden.
  - Expected performance (EN): pH 5.0 is below the supplied aquatic limit and undesirable for this system. The table also argues against contact with M. pH reflects current oxonium activity, not all acid equivalents that can subsequently be released: differently buffered solutions may have identical pH but different neutralization requirements. It does not identify the acid either. Composition, volume, buffering and material compatibility would need clarification before a technical intervention.
  - Understanding focus (DE): Die Modellgrenze 6,5–8,5 wird nicht als universelle gesetzliche Gewässernorm ausgegeben.
  - Understanding focus (EN): The model range 6.5–8.5 is not presented as a universal statutory aquatic standard.
- `chem-next20-0bf26276-case-3-alkaline`
  - Task demand (DE): Eigene fiktive Unterrichtsdaten, keine Produkt-/Gewässernorm: Bei25°C und5min Kontakt entfernt ein Modellreiniger bei pH7 15% und bei pH10 75% desselben Fettbelags. Ein identischer Verträglichkeitstest zeigt für Werkstoff M bei pH6,5–10,5 keine Veränderung, für N bei pH10 einen Oberflächenschaden. Für genau ein Enzym E sind bei gleicher Temperatur relative Aktivitäten von100% bei pH7 und25% bei pH10 gegeben. Ein Modellgewässer hat den vorgegebenen zulässigen Bereich pH6,5–8,5; das Reinigungsabwasser hat pH10. Zwei Abwässer mit pH10 besitzen unterschiedliche, hier unbestimmte Pufferkapazitäten. Mengen, genaue Zusammensetzung und klinische Daten fehlen.
Beurteile den Nutzen der basischen Lösung für den gegebenen technischen Reinigungsschritt mit M und mit N, die Folgen derselben pH-Erhöhung für Enzym E und die Übertragbarkeit auf das Modellgewässer. Erkläre die alkalische Einordnung im wässrigen Teilchenmodell; leite keine allgemeine Gefährlichkeits-/Enzymregel ab. Ist aus pH10 allein eine Neutralisationsmenge oder die Identität/Stärke einer Base bestimmbar? Benenne konkrete Schlussgrenzen. Nur Dateninterpretation, keine Herstellung, Abgabe oder biologische Behandlung.
  - Task demand (EN): Own fictional teaching data, not a product or aquatic standard: at25°C and5min contact, a model cleaner removes15% of the same grease coating at pH7 and75% at pH10. An identical compatibility test shows no change to material M over pH6.5–10.5, but surface damage to N at pH10. For one specific enzyme E at the same temperature, relative activity is100% at pH7 and25% at pH10. A model aquatic system has a supplied acceptable range pH6.5–8.5; cleaning wastewater has pH10. Two wastewaters at pH10 have different unspecified buffer capacities. Amounts, exact composition and clinical data are absent.
Evaluate the alkaline solution for the supplied technical cleaning step on M and on N, the effect of the same pH rise on enzyme E, and transfer to the model aquatic system. Explain alkalinity using the aqueous species model; derive no universal hazard/enzyme rule. Does pH10 alone determine a neutralization amount or base identity/intrinsic strength? State concrete inference limits. Data interpretation only, no preparation, discharge or biological treatment.
  - Expected performance (DE): Unter den gegebenen25°C/5min-Bedingungen verbessert pH10 die Belagentfernung von15% auf75%. Für M stützt der mitgelieferte Test eine begrenzte Verträglichkeit; N wird beschädigt und ist in diesem Fall ungeeignet. Das ist weder allgemeine Werkstoff- noch Produktsicherheit. Bei25°C liegt eine wässrige pH10-Lösung auf der alkalischen Seite mit mehrOH⁻ alsH₃O⁺; das beweist keine bestimmte Base oder deren konzentrationsunabhängige Stärke. Enzym E zeigt25% statt100% Aktivität; Protonierungszustände können Bindung/Struktur/Aktivität beeinflussen, aber nicht jedes Enzym hat dieselbe Kurve und vollständige irreversible Denaturierung folgt nicht aus diesen Daten. pH10 überschreitet die Modellgewässergrenze8,5; die technische Nützlichkeit rechtfertigt keine Abgabe. Gleicher pH bedeutet bei verschiedener Pufferkapazität nicht gleichen Neutralisationsbedarf; Mengen, Zusammensetzung und nachlieferbare Baseäquivalente fehlen. Aus den Unterrichtsdaten folgt keine tatsächliche Dosier-, Umwelt- oder medizinische Empfehlung.
  - Expected performance (EN): Under the supplied25°C/5min conditions, pH10 improves coating removal from15% to75%. The supplied test supports bounded compatibility for M; N is damaged and unsuitable in this case. This proves neither general material nor product safety. At25°C an aqueous pH10 solution is alkaline with moreOH⁻ thanH₃O⁺; it identifies neither a particular base nor concentration-independent intrinsic strength. Enzyme E shows25% instead of100% activity; protonation states can affect binding/structure/activity, but enzymes need not share this curve and complete irreversible denaturation does not follow. pH10 exceeds the model aquatic upper limit8.5; technical usefulness does not justify discharge. Equal pH with different buffer capacity does not imply equal neutralization demand; amounts, composition and releasable base equivalents are missing. These teaching data supply no actual dosing, environmental or medical recommendation.
  - Understanding focus (DE): Basische technische Wirkung, biologische Folge und Gewässergrenze aus denselben vollständig gegebenen Daten situationsbezogen beurteilen; pH ist keine pauschale Nutzen-/Gefahrenrangfolge.
  - Understanding focus (EN): Judge alkaline technical effects, biological consequences and the aquatic boundary from the same complete supplied data; pH is no blanket ranking of benefit or hazard.
## Page 2: Exotherme und endotherme Reaktionen unterscheiden

- Full learning-goal ID: `1286f2fe-89b7-4454-8e11-85b6abd6e278`
- Goal fingerprint: `sha256:98dd4034f4ac33c798f6ba9c878c8f933f16c30edc89dd4d115a6f7628eb661e`
- Page fingerprint: `sha256:6a2e13c40dd41509390cdfd35940cd4813b77118700d794813d4aafd53333239`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann exotherme und endotherme Reaktionen anhand ihrer Netto-Energieabgabe an die Umgebung beziehungsweise Netto-Energieaufnahme aus der Umgebung unterscheiden und typische Beispiele zuordnen.

### Visualization

/assets/goal-visualizations/chemie/1286f2fe-89b7-4454-8e11-85b6abd6e278/1286f2fe-89b7-4454-8e11-85b6abd6e278.png

- original digest: `sha256:46f0e6695c797aeb57ea5892fd45e2584be8f988aa91068f2edf476f3639adc0`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Chemische Reaktionen von physikalischen Vorgängen unterscheiden — `8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566` (outside this book)

### Direct reverse prerequisites outside this book

- Brennstoffe und Energieträger bewerten — `871eabde-6e19-59d3-bc7c-60977a9837db` (outside this book)
- Innere Energie und Enthalpie in Reaktionssystemen abgrenzen — `4928d5d1-e790-5883-9349-3b03a1c63b99` (outside this book)
- Energieprofile chemischer Reaktionen deuten — `542d88e9-4cd3-5f90-bd20-b50ab030d72a` (outside this book)
- 1. Hauptsatz anwenden — `801790f9-be3a-51fe-9b0f-3452c1bba887` (outside this book)
- Aktivierungsenergie und Katalysatorwirkung erklären — `945d69d5-92a7-5195-8f78-4e56f8e7b633` (outside this book)
- Energieumsatz mit Bindungsänderungen erklären — `a530ee7d-1002-5f02-ae05-a9d46410ac78` (outside this book)
- Brennwert und Heizwert von Energieträgern erläutern — `ecdc3c08-9ba3-56e5-ab00-4b02357867ac` (outside this book)
- Salzbildung energetisch mit Gitterenergie erklären — `c441d9e8-d9d9-5e55-a189-a37345541321` (outside this book)
- CO2-Bilanz und Reaktionswärme von Brennstoffen vergleichen — `4dab7d52-5b89-52ab-a425-17a7707f44c8` (outside this book)
- Brandbedingungen und Brandschutz chemisch begründen — `8576b82b-811a-5e13-b5dc-ec5d42030565` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:46e9a1f30168f64d7244bdf2f41c096fe04826c8908a23555b9343d4e4a33b2f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `b009-1286-net-energy-flow`
  - Essential understanding (DE): Exotherm bedeutet netto Energieabgabe an die Umgebung, endotherm netto Energieaufnahme aus ihr. Eine nötige Startenergie und eine Temperaturänderung ohne geklärte Systemgrenze sind nicht mit der gesamten Reaktionsenergie gleichzusetzen.
  - Essential understanding (EN): Exothermic means net energy transfer to the surroundings, endothermic means net uptake from them. Initial activation energy and a temperature change without a clear system boundary are not the same as the overall reaction energy.
  - Observable performance (DE): Die lernende Person ordnet vorgegebene chemische Reaktionen anhand von Energie- und Kontextdaten begründet zu, benennt die Richtung des Netto-Energieflusses und grenzt Startenergie oder einen Störeffekt ab.
  - Observable performance (EN): The learner classifies supplied chemical reactions from energy and context data, explains the direction of net energy transfer and distinguishes activation or a confounding effect.

**Coverage expectations**

- required expectations: `b009-1286-net-energy-flow`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `reaction-and-representation`: Verbrennungs-Energiedaten werden gegen eine thermische Zersetzung mit Energieniveaus getauscht; beides sind ausdrücklich chemische Reaktionen. / Combustion energy data change to energy levels for thermal decomposition; both are explicitly chemical reactions.
- `initial-versus-net`: Eine nötige Zündung oder fortgesetzte Energiezufuhr wird vom Netto-Energieumsatz getrennt. / Necessary ignition or continued energy input is distinguished from net energy transfer.

**Application cases**

- `methane-combustion-paper-data`
  - Task demand (DE): Ein Arbeitsblatt zeigt die ausgeglichene Verbrennung CH₄ + 2 O₂ → CO₂ + 2 H₂O und Lehrkraftdaten: Nach kurzer Zündung gibt die Reaktion auf die angegebene Stoffmenge mehr Energie an die Umgebung ab, als zum Start eingebracht wurde. Ordne die Reaktion ein, zeichne die relative Lage von Edukten und Produkten und erkläre, warum die Zündung die Nettoeinordnung nicht umkehrt. Es wird kein Versuch durchgeführt.
  - Task demand (EN): A worksheet shows the balanced combustion CH₄ + 2 O₂ → CO₂ + 2 H₂O and teacher-provided data: after brief ignition, the reaction releases more energy to the surroundings for the stated amount than was supplied to start it. Classify the reaction, draw the relative reactant and product energy levels, and explain why ignition does not reverse the net classification. No experiment is carried out.
  - Expected performance (DE): Die Person ordnet exotherm zu, zeigt Produkte energetisch unter den Edukten und beschreibt netto Energie nach außen; Zündenergie wird als Anfangsbedarf, nicht als endotherme Gesamtbilanz gedeutet.
  - Expected performance (EN): The learner classifies the reaction as exothermic, places products below reactants and describes net energy transfer outward; ignition is an initial requirement, not an endothermic overall balance.
  - Understanding focus (DE): Beobachtetes Brennen wird mit der Richtung der Netto-Energiebilanz verbunden, ohne Aktivierung zu verwechseln.
  - Understanding focus (EN): Observed combustion is linked to net energy transfer without confusing it with activation.
- `calcium-carbonate-decomposition-paper-data`
  - Task demand (DE): Eine neue Karte beschreibt die chemische Zersetzung CaCO₃ → CaO + CO₂. Vorgegebene Energiedaten für dieselbe Stoffmenge zeigen Produkte auf höherem Energieniveau als Edukte und fortgesetzte Netto-Energiezufuhr. Ordne die Reaktion ein, gib die Richtung des Energieflusses an und erkläre, warum bloßes Abkühlen eines gemischten Brausetablettenansatzes dafür kein gleichwertiger Beleg wäre. Nur Dateninterpretation, keine Durchführung.
  - Task demand (EN): A fresh card describes the chemical decomposition CaCO₃ → CaO + CO₂. Supplied energy data for the same amount show products above reactants and continued net energy input. Classify the reaction, state the direction of energy transfer and explain why mere cooling of a mixed effervescent-tablet sample would not provide equivalent evidence. Data interpretation only, no experiment.
  - Expected performance (DE): Die Person ordnet endotherm zu und beschreibt netto Energie hinein; das höhere Produktniveau stützt die Zuordnung. Beim Brausetablettengemisch könnten Lösen und Mischen mitwirken, sodass Temperaturabfall allein die Energieart der chemischen Teilreaktion nicht beweist.
  - Expected performance (EN): The learner classifies the decomposition as endothermic and describes net energy input; the higher product level supports this. Dissolution and mixing may affect the effervescent sample, so cooling alone does not prove the chemical subreaction's energy class.
  - Understanding focus (DE): Transfer auf eine echte chemische endotherme Reaktion mit geklärter Systemgrenze und Störfaktor.
  - Understanding focus (EN): Transfer to a genuine endothermic chemical reaction with a clear system boundary and a confounder.
## Page 3: Lösungen nach Arbeitsanweisung herstellen

- Full learning-goal ID: `1351706f-4ea6-56e9-951b-87b24cbcdee8`
- Goal fingerprint: `sha256:75bfaba547c9270be76a5d8a2e73ade591fc020850b85f831966658b5cc293bb`
- Page fingerprint: `sha256:9dc327e212e01c2e788bb5a806edff7c489e7f5701473c6dd60381692152f3da`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann mit zugelassenen Stoffen und einer bereitgestellten Arbeitsanweisung eine homogene Lösung herstellen und die ausgeführten Arbeitsschritte sowie das Ergebnis dokumentieren.

### Visualization

/assets/goal-visualizations/chemie/1351706f-4ea6-56e9-951b-87b24cbcdee8/1351706f-4ea6-56e9-951b-87b24cbcdee8.png

- original digest: `sha256:8a89cfa0b6871f22cde44f6f2a132e99114c1772c5a94de42f3c72b552f8ea71`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Allgemeine Sicherheitsregeln im Chemielabor anwenden — `13d4f336-ab16-54a7-9479-c920b458f385` (outside this book)

### Direct reverse prerequisites outside this book

- Lösungen berechnen und pH bestimmen — `f1ed86f0-534d-57d7-8952-a004a331cc54` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:550e5c3a1df928527b775f4a803a58c8496c829fe960fed11f9f4f31117e4724`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `understanding`
  - Essential understanding (DE): Herstellen ist eine beobachtbare Arbeitsroutine. Sie ist vom Erklären der Löslichkeitsgrenze und vom Berechnen eines Mischungsanteils unabhängig prüfbar.
  - Essential understanding (EN): Preparation is an observable working routine, assessed separately from explaining a solubility limit or calculating a mixture fraction.
  - Observable performance (DE): Ein vollständiger betreuter Aktionslog zeigt getrenntes Tarieren und Abwiegen, vollständiges Übertragen, Rühren, bestätigte Endbeobachtung und Beschriftung nach der bereitgestellten Arbeitsanweisung. Die lernende Person dokumentiert beim alternativen Modul dessen freigegebenes Lösungsmittel und die jeweiligen Schritte; ein Plan ohne durchgeführten Log wird nicht als Ausführung ausgegeben.
  - Observable performance (EN): A complete supervised action log shows separate taring and weighing, complete transfer, stirring, a confirmed final observation and labelling under the supplied instruction. For the alternative module the learner records its permitted solvent and each specified step; a plan without an executed log is not represented as performance.

**Coverage expectations**

- required expectations: `understanding`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-conditions`: In S wählst du versehentlich Wasser statt des freigegebenen ethanolischen Lösungsmittels. Darfst du den erfolgreichen S-Endbefund aus der Vorlage übernehmen? / In S you accidentally choose water instead of its permitted ethanolic solvent. May you copy the successful S endpoint from the example?

**Application cases**

- `preparation-salt-water-performed-log`
  - Task demand (DE): Nur beaufsichtigt mit örtlicher Freigabe oder im moderierten Handlungssimulator; nichts probieren, keine Substitution, kein Erhitzen. Freigegeben: Kochsalz, Wasser, sauberes Becherglas, separate trockene Wägeschale, Spatel, Rührstab, Waage; Brille/Kittel nach örtlicher Anweisung. P-1: Freigabe prüfen; trockenes Becherglas tarieren; 48,0 g Wasser einwiegen; Wasserbecher sicher abstellen; leere Wägeschale tarieren; darin 2,0 g Salz mit sauberem Spatel separat abwiegen; vollständig portionsweise ins Wasser übertragen; rühren, bis keine Kristalle sichtbar sind; mit Inhalt und Datum beschriften. Bei Verschütten oder bleibenden Kristallen stoppen und Lehrkraft fragen, keine Ersatzmenge erraten. Protokolliere Reihenfolge, Massen, bestätigte Endbeobachtung, Abweichungen und Beschriftung. Im Simulator verarbeitet der Moderator jede Aktion einzeln: check_permission → tare_empty_beaker → weigh_water_48g → place_water_beaker_securely → tare_empty_salt_dish → weigh_salt_2g_separately → add_all_salt → stir → inspect → label_salt_solution_date. Vor stir sind Kristalle sichtbar; nach vollständiger Zugabe und stir meldet inspect eine einheitliche Phase ohne Kristalle. Falsche Reihenfolge, anderes Material oder Mengenverlust ergibt STOP ohne Erfolgslog. Führe selbst aus und gib den vollständigen eigenen Aktions-/Rückmeldungslog ab; ein Plan oder abgeschriebener Musterlog genügt nicht.
  - Task demand (EN): Supervised local permission or the facilitator-mediated action simulator only: no tasting, substitutions or heating. Permitted: table salt, water, clean beaker, separate dry weighing dish, spatula, stirring rod and balance; goggles/coat per local instruction. P-1: check permission; tare the dry beaker; weigh 48.0 g water; put the water beaker down securely; tare the empty weighing dish; separately weigh 2.0 g salt with the clean spatula; transfer all salt to the water in portions; stir until no crystals remain; label contents/date. Stop and ask the teacher after spilling or persistent crystals; do not guess replacement quantities. Record order, masses, confirmed final observation, deviations and label. In the simulator the facilitator processes each action separately: check_permission → tare_empty_beaker → weigh_water_48g → place_water_beaker_securely → tare_empty_salt_dish → weigh_salt_2g_separately → add_all_salt → stir → inspect → label_salt_solution_date. Crystals are visible before stir; after complete addition and stir, inspect reports one uniform phase without crystals. Wrong order, other materials or quantity loss gives STOP without a success log. Execute personally and submit the complete own action/returned-feedback log; a plan or copied example is insufficient.
  - Expected performance (DE): Erwartetes erfolgreiches Protokoll: Freigabe geprüft; trockenes Gefäß tariert; 48,0 g Wasser angezeigt; Wasser-Becherglas sicher abgestellt; leere Wägeschale tariert; darin mit sauberem Spatel separat 2,0 g Salz abgewogen und aus der Wägeschale vollständig ins Wasser übertragen; gerührt; Rückmeldung/Beobachtung: keine sichtbaren Kristalle, einheitliche Flüssigkeit ohne getrennte Phase; mit Kochsalzlösung und Datum beschriftet; keine Abweichung. Das ist eine hergestellte Lösung im begrenzten Fall, keine allgemeine Behauptung über beliebige Salz-/Lösungsmittelkombinationen.
  - Expected performance (EN): Expected successful log: permission checked; dry vessel tared; 48.0 g water displayed; water beaker placed securely; empty weighing dish tared; 2.0 g salt weighed separately in that dish with the clean spatula and transferred completely from the dish into the water; stirred; feedback/observation: no visible crystals, uniform liquid without a separate phase; labelled salt solution and date; no deviation. This documents preparation in the bounded case, not a claim about arbitrary salt/solvent combinations.
  - Understanding focus (DE): Herstellen ist eine beobachtbare Arbeitsroutine. Sie ist vom Erklären der Löslichkeitsgrenze und vom Berechnen eines Mischungsanteils unabhängig prüfbar.
  - Understanding focus (EN): Preparation is an observable working routine, assessed separately from explaining a solubility limit or calculating a mixture fraction.
- `preparation-bound-phase-solvent-transfer`
  - Task demand (DE): Nur virtuelle, moderierte P-2-Module, keine realen Stoffe/Gasapparaturen. Jedes Modul startet leer; je Aktion folgt protokollierte Moderatorenrückmeldung. L, Glycerol/Wasser: select_L → check_permission → load_water_18mL → dose_glycerol_2mL → mix_L → inspect → label_L; vor mix_L Schlieren, danach einheitliche Phase. S, fester Modellstoff im freigegebenen ethanolischen Lösungsmittel: select_S → check_permission → load_ethanol_solvent_10mL → dose_S_0_01g → mix_S → inspect → label_S; die gegebene kleine Menge ist vollständig löslich, vor mix_S Partikel, danach gleichmäßig gefärbte Phase ohne Partikel. G, CO2/Wasser bei fest20°C und CO2-Modellpartialdruck1bar: select_G → check_permission → load_water_20mL → contact_CO2_model_aliquot → mix_G → wait_G → inspect → label_G. Festes Modellaliquot0,010g liegt innerhalb der Modell-Aufnahmekapazität0,030g; keine Messwerte. Kontakt zeigt Blasen; nach mix_G/wait_G meldet inspect aufgenommenes Aliquot, eine Flüssigkeitsphase, keine sichtbaren Blasen. T/p nicht ändern. Jede Aktion setzt alle vorherigen desselben Moduls voraus. Falsches Lösungsmittel, falsche Dosis oder Reihenfolge ergibt STOP; nur Neustart des gewählten Moduls führt zum leeren Anfang. Führe L/S/G selbst aus und gib getrennte vollständige Aktions-/Rückmeldungslogs, Endbeobachtung und Beschriftung ab. Benenne Ausgangsphase/Lösungsmittel; übertrage L-Mengen nicht auf S/G. Ein Plan oder Musterlog ist kein Ausführungsnachweis.
  - Task demand (EN): Virtual facilitator-mediated P-2 modules only; no real substances or gas apparatus. Each module starts empty; each action receives logged facilitator feedback. L, glycerol/water: select_L → check_permission → load_water_18mL → dose_glycerol_2mL → mix_L → inspect → label_L; streaks before mix_L, one uniform phase afterwards. S, solid model substance in the permitted ethanolic solvent: select_S → check_permission → load_ethanol_solvent_10mL → dose_S_0_01g → mix_S → inspect → label_S; supplied small amount dissolves completely, particles before mix_S, uniformly coloured phase without particles afterwards. G, CO2/water at fixed20°C and CO2 model partial pressure1bar: select_G → check_permission → load_water_20mL → contact_CO2_model_aliquot → mix_G → wait_G → inspect → label_G. Fixed model aliquot0.010g is within model absorption capacity0.030g; these are not measurements. Contact shows bubbles; after mix_G/wait_G inspect reports absorbed aliquot, one liquid phase, no visible bubbles. Do not change T/p. Each action requires all earlier actions of that module. Wrong solvent, dose or order gives STOP; only restarting the selected module returns to its empty start. Personally execute L/S/G and submit separate complete action/returned-feedback logs, final observation and label. Identify initial phase/solvent; do not copy L quantities to S/G. A plan or sample log is not execution evidence.
  - Expected performance (DE): Erwartet werden drei getrennte Logs mit jeweils geprüftem Modul/Freigabe, dem modulspezifischen Lösungsmittel und der vorgeschriebenen Zugabe. L dokumentiert flüssigen Ausgangsstoff in Wasser, danach keine Schlieren; S festen Ausgangsstoff im ethanolischen Lösungsmittel, danach keine Partikel; G gasförmigen Ausgangsstoff in Wasser unter festgehaltenen Modellbedingungen, Kontakt/Mischen/Warten und bestätigte Aufnahme. Alle enden mit inspect und richtiger Beschriftung. Die L-Mengen und Mischhandlung dürfen nicht ungeprüft auf S oder G übertragen werden.
  - Expected performance (EN): Three separate logs are expected, each with module/permission checked, its specific solvent and prescribed addition. L records a liquid starting substance in water followed by no streaks; S a solid in ethanolic solvent followed by no particles; G a gas in water under fixed model conditions, contact/mixing/waiting and confirmed absorption. Each ends with inspect and its correct label. L’s quantities and mixing action cannot be copied to S or G without using that module’s instruction.
  - Understanding focus (DE): Herstellen ist eine beobachtbare Arbeitsroutine. Sie ist vom Erklären der Löslichkeitsgrenze und vom Berechnen eines Mischungsanteils unabhängig prüfbar.
  - Understanding focus (EN): Preparation is an observable working routine, assessed separately from explaining a solubility limit or calculating a mixture fraction.
## Page 4: Leitfähige Kunststoffe anwenden und mit Metallen vergleichen

- Full learning-goal ID: `14f1fe97-0585-5738-845e-9c49173d8afa`
- Goal fingerprint: `sha256:d63b8bac423689f7ad3f4601ef40931e7c8ed6d1bcc5638214f497f957db9163`
- Page fingerprint: `sha256:ecd632b3a1e9aaaca60b298b12a4569aafe664de74a06318e10e57cdbe8f5f71`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann Einsatzmöglichkeiten elektrisch leitfähiger Kunststoffe beschreiben und Vorteile sowie Nachteile gegenüber metallischen Leitern beurteilen.

### Visualization

/assets/goal-visualizations/chemie/14f1fe97-0585-5738-845e-9c49173d8afa/14f1fe97-0585-5738-845e-9c49173d8afa.jpg

- original digest: `sha256:8ddb0082e924d39885d93b2a0053ed605802d69e91efd5915014d6f80971c576`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Leitfähige Kunststoffe über konjugierte Systeme erklären — `73cbd4d8-5da1-5e54-85ce-c88e7b1613fe` (outside this book)

### Direct reverse prerequisites outside this book

- Leitfähige Polymerwerkstoffe für Sensor und Beschichtung bewerten — `dab7b908-4370-548d-9c99-1de64a7ef129` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4c4d48266901298eafef7e454253b7b535db631a39ff906fc2917fe283af7d13`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Leitfähige Polymermaterialien ermöglichen leichte, flexible oder beschichtbare Bauteile, erfüllen aber nicht automatisch metallische Leitungsanforderungen.
  - Essential understanding (EN): Conducting polymer materials enable light, flexible or coatable components but do not automatically meet metallic conductor requirements.
  - Observable performance (DE): Verbindet zwei konkrete Anwendungen mit erforderlicher Leitfähigkeit und Mechanik.
  - Observable performance (EN): Connects two concrete applications to conductivity and mechanical requirements.
- `e2`
  - Essential understanding (DE): Materialvergleich braucht gleiche Geometrie, zulässigen Widerstand, Masse und Einsatzbedingungen.
  - Essential understanding (EN): Material comparison requires matched geometry, allowable resistance, mass and service conditions.
  - Observable performance (DE): Berechnet Widerstände und begründet Polymer-/Metallwahl mit mindestens einem Vorteil und Nachteil.
  - Observable performance (EN): Calculates resistances and justifies polymer/metal choice with at least one advantage and disadvantage.
- `e3`
  - Essential understanding (DE): Alterung, Kontaktierung und Umweltbeständigkeit können einen zunächst günstigen Vergleich verändern.
  - Essential understanding (EN): Ageing, contacts and environmental stability can change an initially favourable comparison.
  - Observable performance (DE): Überträgt die Auswahl auf eine geänderte Last oder Alterungssituation und benennt offene Daten.
  - Observable performance (EN): Transfers selection to changed loading or ageing and identifies missing evidence.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Antistatik oder Leistungsleitung / Antistatic or power conductor
- `v2`: Geometrie und Masse / Geometry and mass
- `v3`: Alterung und Kontakt / Ageing and contact

**Application cases**

- `14f1fe97-case-1`
  - Task demand (DE): R=L/(σA), L 0.10 m, A 1.0·10⁻⁶m². Polymerσ10³S/m, Dichte 1000 kg/m³; Metallσ5·10⁷S/m, Dichte 8000 kg/m³. Sensor erlaubt R≤150Ω und braucht häufige Biegung; Leistungskabel erlaubt R≤0.01Ω.
Berechne R und Masse. Wähle für beide Aufgaben, erkläre Vorteil/Nachteil und nenne eine fehlende praktische Prüfung.
  - Task demand (EN): R=L/(σA), L 0.10 m, A 1.0·10⁻⁶m². Polymerσ10³S/m, density 1000 kg/m³; metalσ5·10⁷S/m, density 8000 kg/m³. Sensor allows R≤150Ω and frequent bending; power conductor allows R≤0.01Ω.
Calculate R and mass. Select for both uses, explain an advantage/disadvantage and identify a missing practical test.
  - Expected performance (DE): Polymer 100Ω und 0.10 g; Metall 0.002Ω und 0.80 g. Polymer erfüllt Sensor-R und bietet geringere Masse/flexible Verarbeitung, muss Biegezyklen/Kontakte bestehen. Für Leistungskabel nur Metall nach gegebenem Grenzwert; Polymerverlustleistung wäre bei gleichem Strom viel höher. Metallbiegung/Legierung und Polymeralterung sind keine universell feststehenden Eigenschaften.
  - Expected performance (EN): Polymer 100Ω and 0.10 g; metal 0.002Ω and 0.80 g. Polymer meets sensor resistance and offers lower mass/flexible processing, subject to bend-cycle/contact tests. Only metal meets the supplied power-conductor limit; polymer dissipates much more at the same current. Metal flexibility/alloy and polymer ageing are not universal constants.
  - Understanding focus (DE): Fallbezogene Aspekte: Polymer 100Ω/0.10 g, Metall 0.002Ω/0.80 g mit R=L/(σA), ρLA und korrekten Einheiten. / Polymer erfüllt 150Ω-Sensor, nur Metall erfüllt 0.01Ω-Leistungskabel; mechanische Eignung separat prüfen. / Polymermasse/Verarbeitung gegen Widerstandsverluste abwägen; Biegezyklen/Kontakte/Alterung offen. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Case-specific aspects: Polymer 100Ω/0.10 g, metal 0.002Ω/0.80 g via R=L/(σA),ρLA with correct units. / Polymer meets 150Ω sensor, only metal meets 0.01Ω power cable; separately test mechanics. / Trade polymer mass/processing against resistance losses; bending cycles/contacts/ageing open. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
- `14f1fe97-case-2`
  - Task demand (DE): Antistatische flexible Beschichtung zulässiger Flächenwiderstand≤10⁶Ω/□. Polymerfolie anfangs 10⁴, nach Feuchte/1000 Biegezyklen 2·10⁶Ω/□. Dünne Metallfolie anfangs 1Ω/□, danach durch Risse 10⁷Ω/□. Separate Feuchte- und Biegekontrollen fehlen.
Vergleiche Anfangs- und Endzustand. Erkläre mögliche Polymer- und Metallgrenzen und entscheide ob eines bereits geeignet ist. Entwirf eine Kontrolle und eine weitere mögliche Anwendung.
  - Task demand (EN): Flexible antistatic coating requires sheet resistance≤10⁶Ω/□. Polymer film initially 10⁴, after moisture/1000 bend cycles 2·10⁶Ω/□. Thin metal initially 1Ω/□, later 10⁷Ω/□ from cracks. Separate moisture and bending controls missing.
Compare initial and final states. Explain possible polymer and metal limits and decide whether either is already suitable. Design a control and suggest another application.
  - Expected performance (DE): Beide erfüllen anfangs, beide verfehlen nach kombinierter Alterung den Grenzwert. Polymer: Träger-/Dotierungszustand/Kontakte können feuchteabhängig sein; Metall: Risse unterbrechen Wege. Kein aktueller Sieger ohne Verbesserung/Nachprüfung. Faktorielle trocken/feucht und gebogen/ungebogen-Kontrollen trennen Ursachen. Gedruckter flexibler Sensor ist möglich, aber verlangt eigene Widerstands-/Stabilitätsgrenzen.
  - Expected performance (EN): Both initially pass but both fail after combined ageing. Polymer carrier/doping state or contacts may be moisture-sensitive; metal cracks interrupt paths. Neither currently qualifies without improvement and retesting. Factorial dry/wet and bent/unbent controls separate causes. A printed flexible sensor is a possible application but requires its own resistance/stability limits.
  - Understanding focus (DE): Fallbezogene Aspekte: Beide anfangs≤10⁶Ω/□, beide danach darüber; kein bereits geeigneter Sieger. / Polymerträger/Dotierung/Kontakte versus Metallrisse als mögliche Ursachen; trocken/feucht×gebogen/ungebogen trennen. / Gedruckter flexibler Sensor als weitere Anwendung nur mit eigenen Widerstands-/Stabilitätsgrenzen. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Case-specific aspects: Both initially≤10⁶Ω/□, both exceed later; neither already suitable. / Polymer carriers/doping/contacts versus metal cracks as possible causes; separate dry/wet×bent/unbent. / Printed flexible sensor as further application only with its own resistance/stability limits. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
## Page 5: Peptidbindungen erklären

- Full learning-goal ID: `197bc2c5-835e-59e7-9263-5684e89799cc`
- Goal fingerprint: `sha256:f571d9f3ec12d344df9c5db2a16247390514909b1712351be808dceb3404d587`
- Page fingerprint: `sha256:71ce255f6605089c9cc16ac736c2a5c24ff9d20bc223d828b03c80f1d92168e5`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann Kondensationsreaktionen zwischen Aminosäuren formulieren, Peptidbindungen als Verknüpfungsprinzip der Primärstruktur erklären und deren räumlichen Bau sowie Stabilität mit Mesomerie deuten.

### Visualization

/assets/goal-visualizations/chemie/197bc2c5-835e-59e7-9263-5684e89799cc/197bc2c5-835e-59e7-9263-5684e89799cc.png

- original digest: `sha256:168739355aa38ef4b1a2de80ad4db941c41a329e727c92c48ded043684ba82b6`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Aminosäuren charakterisieren — `62149f36-87c0-5a2d-8a78-e7d4203f58c2` (outside this book)
- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Lernkarten - Naturstoffe — `31148286-b8db-57a7-8da2-2e0479240a2c` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Peptidbindung und Biuret-Nachweisgrenze abrufen — `428b4d9c-f6e6-548f-b9da-336466ddb62e` (outside this book)
- Proteinshake und Denaturierung — `8872d828-a025-5e45-af74-3d84caedfb73` (outside this book)
- Aminosäure, Zwitterion und Peptidbindung abrufen — `d92b3a20-28e8-5d1c-a400-d5e1fa03ec81` (outside this book)
- Proteinstruktur und Faltung — `065d764c-daec-5d35-95da-3e922d2029c7` (outside this book)
- Proteine mit der Biuret-Reaktion nachweisen und erklären — `cf270aaf-235a-55a7-94a2-c4d9d7570a6b` (outside this book)
- Carbonsäureester und Carbonsäureamide durch Kondensation bilden — `98ae3f8e-4800-5ff3-bd2c-89434c006143` (outside this book)
- Aminocarbonsäuren und Peptide nachweisen — `5c8f0bbb-103a-579f-87fc-c997afe4fd18` (outside this book)
- Enzymreaktionen und Hemmung modellieren — `f7f35d71-927a-511c-a49e-65a66794a9bc` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:245d5e3309c0b8537a3dfbab508762af84f447e2dae8877fdbaa6ac3487bfb3f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `structure-and-evidence`
  - Essential understanding (DE): Die Peptidbindung ist eine mesomeriestabilisierte Amidbindung und bestimmt lokale Geometrie.
  - Essential understanding (EN): The peptide bond is a resonance-stabilised amide determining local geometry.
  - Observable performance (DE): Die Carboxygruppe des Glycins und Aminogruppe des Alanins bilden -CO-NH- plus H2O; Amino- und Carboxyterminus bleiben. Das ist eine Bilanz, keine spontane Reaktion in Wasser.
  - Observable performance (EN): Glycine carboxyl and alanine amino groups form -CO-NH- plus H2O, retaining amino and carboxyl termini. This is formal balance, not spontaneous reaction in water.
- `fresh-transfer`
  - Essential understanding (DE): Die gleiche fachliche Beziehung wird auf einen veränderten Fall übertragen; Bedingungen und Schlussgrenzen werden benannt.
  - Essential understanding (EN): The same subject relationship is transferred to a changed case with explicit conditions and inference limits.
  - Observable performance (DE): Delokalisierung des N-Elektronenpaars verleiht partiellen Doppelbindungscharakter; die Peptidgruppe ist näherungsweise planar. Grenzstrukturen sind keine wechselnden realen Moleküle.
  - Observable performance (EN): N lone-pair delocalisation gives partial double-bond character; the peptide group is approximately planar. Contributors are not alternating actual molecules.

**Coverage expectations**

- required expectations: `structure-and-evidence`, `fresh-transfer`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-and-conditions`: Material, Stoffstruktur, Messbedingung oder Bewertungsdossier wechseln wie in den zwei ausdrücklich ausgearbeiteten Fällen; quantitative Angaben sind synthetische Aufgabenwerte. / Material, molecular structure, measurement conditions or evaluation dossier vary as explicitly specified in the two worked cases; numerical values are synthetic task data.

**Application cases**

- `case-a`
  - Task demand (DE): Formuliere formal die Kondensation von Glycin und Alanin zum Dipeptid Gly-Ala. Markiere die abgegebene Wassergruppe, Amidbindung und freien Enden.
  - Task demand (EN): Formally write condensation of glycine and alanine to Gly-Ala. Mark eliminated water, amide linkage and free termini.
  - Expected performance (DE): Die Carboxygruppe des Glycins und Aminogruppe des Alanins bilden -CO-NH- plus H2O; Amino- und Carboxyterminus bleiben. Das ist eine Bilanz, keine spontane Reaktion in Wasser.
  - Expected performance (EN): Glycine carboxyl and alanine amino groups form -CO-NH- plus H2O, retaining amino and carboxyl termini. This is formal balance, not spontaneous reaction in water.
  - Understanding focus (DE): Die Peptidbindung ist eine mesomeriestabilisierte Amidbindung und bestimmt lokale Geometrie.
  - Understanding focus (EN): The peptide bond is a resonance-stabilised amide determining local geometry.
- `case-b-transfer`
  - Task demand (DE): Neuer formaler Modellfall, keine Synthese im Wasser: Alanin H₂N–CH(CH₃)–COOH, Glycin H₂N–CH₂–COOH und Serin H₂N–CH(CH₂OH)–COOH sollen in der N→C-Reihenfolge Ala–Gly–Ser verknüpft werden. Nur die α-Amino-/α-Carboxygruppen werden verknüpft; die Serin-Seitenketten-OH-Gruppe bleibt unverändert. Neutrale Strukturformeln dienen ausschließlich der formalen Bilanz; sie beschreiben nicht die gesamte Teilchenverteilung bei einem bestimmten pH.
Formuliere die formale Gesamtreaktion mit vollständiger Tripeptid-Struktur und Wasserbilanz. Markiere beide Peptidbindungen, Amino-/Carboxyterminus und die Primärsequenz. Zeichne für eine Peptidgruppe zwei ladungsrichtige Mesomerie-Grenzstrukturen und begründe Stabilisierung, annähernde lokale Planarität und eingeschränkte C–N-Drehbarkeit. Beurteile: „Alle Bindungen der ganzen Kette sind deshalb starr und die gesamte Faltung ist bekannt.“ Vergleiche anschließend mit Ser–Gly–Ala: bleiben Wasserzahl und Primärstruktur jeweils gleich? Keine reale Herstellung.
  - Task demand (EN): Fresh formal model, not synthesis in water: alanine H₂N–CH(CH₃)–COOH, glycine H₂N–CH₂–COOH and serine H₂N–CH(CH₂OH)–COOH are to be linked in N→C order Ala–Gly–Ser. Link only α-amino/α-carboxyl groups; leave the serine side-chain OH unchanged. Neutral structural formulas serve the formal balance only; they do not describe all species at a specified pH.
Write the formal overall reaction, complete tripeptide structure and water balance. Mark both peptide bonds, amino/carboxyl termini and primary sequence. Draw two charge-correct resonance contributors for one peptide group and explain stabilization, approximate local planarity and restricted C–N rotation. Assess “All bonds in the whole chain are therefore rigid and its complete fold is known.” Then compare Ser–Gly–Ala: do water count and primary structure each remain unchanged? No actual synthesis.
  - Expected performance (DE): Ala+Gly+Ser → H₂N–CH(CH₃)–C(=O)–NH–CH₂–C(=O)–NH–CH(CH₂OH)–COOH +2H₂O. Jede der zwei Verknüpfungen entfernt formal OH aus einer α-Carboxygruppe und H aus einer α-Aminogruppe; die Seitenketten-OH-Gruppe bleibt. Die beiden C(=O)–NH-Verknüpfungen sind Peptidbindungen. N-Terminus: Alanin-Aminogruppe links; C-Terminus: Serin-Carboxygruppe rechts; Primärsequenz Ala–Gly–Ser. Für R–C(=O)–NH–R′ ↔ R–C(–O⁻)=N⁺H–R′ erklären Delokalisierung des N-Elektronenpaars und partieller C–N-Doppelbindungscharakter die lokale Stabilisierung, näherungsweise Planarität und eingeschränkte Rotation. Grenzstrukturen sind keine wechselnden realen Moleküle. Daraus folgt weder Starrheit aller anderen Bindungen noch die gesamte Kettenfaltung oder unbegrenzte Hydrolysestabilität. Ser–Gly–Ala besitzt ebenfalls zwei Peptidbindungen und formal2H₂O, aber eine andere Primärsequenz; gleiche Summenbilanz bedeutet nicht gleiche Struktur.
  - Expected performance (EN): Ala+Gly+Ser → H₂N–CH(CH₃)–C(=O)–NH–CH₂–C(=O)–NH–CH(CH₂OH)–COOH +2H₂O. Each of the two linkages formally removes OH from an α-carboxyl group and H from an α-amino group; the side-chain OH remains. Both C(=O)–NH linkages are peptide bonds. N terminus: alanine amino group on the left; C terminus: serine carboxyl group on the right; primary sequence Ala–Gly–Ser. For R–C(=O)–NH–R′ ↔ R–C(–O⁻)=N⁺H–R′, N lone-pair delocalization and partial C–N double-bond character explain local stabilization, approximate planarity and restricted rotation. Contributors are not alternating actual molecules. This determines neither rigidity of all other bonds nor the entire chain fold or unlimited resistance to hydrolysis. Ser–Gly–Ala also has two peptide bonds and formal2H₂O, but a different primary sequence; equal overall balance does not mean identical structure.
  - Understanding focus (DE): Neue Aminosäurefolge verbindet die ganze formale Kondensation, Primärsequenz und lokale Mesomerie-/Geometriebegründung; lokale Bindungsgeometrie ist keine Gesamtfaltung.
  - Understanding focus (EN): A new amino-acid sequence integrates the complete formal condensation, primary sequence and local resonance/geometry explanation; local bond geometry is not the entire fold.
## Page 6: Massenerhaltung bei Reaktionen erklären

- Full learning-goal ID: `1bdaf7f2-ff3b-455a-a7fb-95a44642762a`
- Goal fingerprint: `sha256:2c0a50fc63f6d45ce572ce72c3fa4a527c88fd2a6b79508fd534560d4779359b`
- Page fingerprint: `sha256:95ee27ecee966af9fbafa142036cfb2ae6c01d0ee1a435643c323e9a96a9ad22`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann einfache Massenbilanz-Versuche unter Berücksichtigung der mitgewogenen Systemgrenze und der erfassten Stoffe auswerten und das Gesetz der Massenerhaltung bei chemischen Reaktionen erklären.

### Visualization

/assets/goal-visualizations/chemie/1bdaf7f2-ff3b-455a-a7fb-95a44642762a/1bdaf7f2-ff3b-455a-a7fb-95a44642762a.jpg

- original digest: `sha256:2931a1e17d68e3384d45d19bb0fa80a02f3c215dea9e592c11a076aca9a8cf6c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Chemische Reaktionen von physikalischen Vorgängen unterscheiden — `8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b9d09d53bf650c385b62930c7320a2890c19afa5523df7415632096742d38346`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `closed-system-mass-conservation`
  - Essential understanding (DE): Chemische Reaktionen ordnen Atome neu an; die Masse aller einbezogenen Stoffe bleibt erhalten. Eine Waage zeigt die Erhaltung nur für ein vollständig erfasstes System ohne unberücksichtigten Stoffaustausch unmittelbar.
  - Essential understanding (EN): Chemical reactions rearrange atoms; the mass of all included substances is conserved. A balance directly shows that conservation only when the whole system is accounted for and no material transfer is ignored.
  - Observable performance (DE): Die lernende Person vergleicht Vorher-nachher-Massen, benennt die mitgewogene Systemgrenze und erklärt scheinbare Abweichungen durch einen möglichen Stoffaustausch, statt das Gesetz als bloßen Merksatz zu wiederholen.
  - Observable performance (EN): The learner compares before-and-after masses, states the weighed system boundary, and explains apparent discrepancies through possible material transfer rather than merely reciting the law.
- `hb-l005-daily-mass-conservation-required`
  - Essential understanding (DE): Die unveränderte Gesamtmasse stützt, dass Atome bei der Reaktion erhalten und neu angeordnet werden. Im offenen gewogenen System fehlen danach 0,40 g des vorgegebenen austretenden Gases; einschließlich der Umgebung bleibt die Masse erhalten. Ein kleinerer Waagenwert beweist keine Vernichtung von Atomen. Ein einzelnes Protokoll ist kein Beweis für jedes denkbare System.
  - Essential understanding (EN): Unchanged total mass supports conservation and rearrangement of atoms. The weighed open system loses 0.40 g of the specified escaping gas; including the surroundings conserves mass. A lower balance reading does not establish destruction of atoms. A single record does not prove every imaginable system.
  - Observable performance (DE): Leite aus dem geschlossenen Ergebnis die Massenerhaltung ab. Erkläre das scheinbare Verschwinden von Masse bei der alltäglichen offenen Brausetablette mit einer sauber benannten Systemgrenze und dem Teilchenmodell. Aus Versuchsergebnissen ableiten UND auf zwei Alltagskontexte übertragen; Systemgrenze, Gasabgabe/Sauerstoffaufnahme und Atomerhaltung erklären. Keine eigene Versuchsdurchführung behaupten.
  - Observable performance (EN): Derive conservation of mass from the closed result. Explain the apparent mass disappearance in the everyday open-tablet example using an explicit system boundary and particle model. Derive from experimental results AND transfer to two everyday contexts; explain boundary, gas release/oxygen uptake and atom conservation. Do not claim personal execution.

**Coverage expectations**

- required expectations: `closed-system-mass-conservation`, `hb-l005-daily-mass-conservation-required`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `system-boundary`: Geschlossenes Gefäß wird mit offenem Gefäß verglichen. / A closed vessel is compared with an open vessel.
- `gas-transfer`: Ein Fall hält das entstehende Gas zurück, der andere lässt es entweichen. / One case retains generated gas, while the other allows it to escape.
- `hb-l005-daily-mass-conservation-required-fresh`: Frisch: Ein Stahlschwamm-Modell in offener Luft wird bei Oxidation schwerer. Zusätzliche Stoffanalyse weist Sauerstoffaufnahme aus der Luft nach. Erkläre die Zunahme; darf man daraus ein neues Gesetz der Massenzunahme ableiten? / Fresh: a steel-wool model gains mass during oxidation in open air. Supplied substance analysis identifies uptake of atmospheric oxygen. Explain the gain; does it establish a new law of increasing mass?

**Application cases**

- `sealed-flask-before-after`
  - Task demand (DE): Ein vorbereitetes Protokoll zeigt eine geschlossene Reaktionsflasche samt Auffangballon mit 150 g vor und 150 g nach einer Gasbildung. Werte die Bilanz aus und erkläre, warum die Masse trotz Gasbildung gleich ist.
  - Task demand (EN): A supplied record shows a sealed reaction flask with a collecting balloon weighing 150 g both before and after gas formation. Analyze the balance and explain why the mass remains equal despite gas formation.
  - Expected performance (DE): Die lernende Person vergleicht 150 g mit 150 g für dasselbe gesamte System, erfasst das Gas im Ballon und erklärt, dass keine Atome verschwinden, sondern Stoffe und Teilchen neu angeordnet werden.
  - Expected performance (EN): The learner compares 150 g with 150 g for the same complete system, includes gas held in the balloon, and explains that atoms do not disappear but are rearranged into different substances and particles.
  - Understanding focus (DE): Die Massenbilanz gilt für das vollständig mitgewogene System.
  - Understanding focus (EN): The mass balance applies to the entire weighed system.
- `fresh-open-gas-loss`
  - Task demand (DE): In einem neuen bereitgestellten Versuch reagiert ein Stoff in einer offenen Schale unter Gasbildung; auf der Waage sinkt die Masse der Schale samt Inhalt von 80 g auf 77 g. Bedeutet das eine Verletzung der Massenerhaltung? Sage die Bilanz für eine vollständig geschlossene Anordnung voraus.
  - Task demand (EN): In a fresh supplied experiment, a substance reacts in an open dish and releases gas; the measured dish and contents fall from 80 g to 77 g. Does this violate conservation of mass? Predict the balance for a fully closed arrangement.
  - Expected performance (DE): Die lernende Person erklärt die 3 g Differenz als möglicherweise entwichene Gasmasse unter der angegebenen Systemgrenze, ohne deren Zusammensetzung zu erfinden. Für eine vollständig geschlossene und mitgewogene Anordnung erwartet sie wieder gleiche Gesamtmassen.
  - Expected performance (EN): The learner explains the 3 g difference as potentially escaped gas under the stated boundary without inventing its composition, and expects equal total masses for a fully closed, wholly weighed arrangement.
  - Understanding focus (DE): Eine scheinbare Abnahme ist mit Erhaltung vereinbar, wenn Masse die Messgrenze verlassen hat.
  - Understanding focus (EN): An apparent decrease is compatible with conservation when mass has left the measured boundary.
- `hb-l005-daily-mass-conservation`
  - Task demand (DE): Leite aus dem geschlossenen Ergebnis die Massenerhaltung ab. Erkläre das scheinbare Verschwinden von Masse bei der alltäglichen offenen Brausetablette mit einer sauber benannten Systemgrenze und dem Teilchenmodell.
Verbindliches ganzes Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current441-HB-lower14-current-whole-union-author-20261017-v1/materials/HB-lower14-ten-complete-DE-EN-cases.pending.json#/cases/0
Frisch: Frisch: Ein Stahlschwamm-Modell in offener Luft wird bei Oxidation schwerer. Zusätzliche Stoffanalyse weist Sauerstoffaufnahme aus der Luft nach. Erkläre die Zunahme; darf man daraus ein neues Gesetz der Massenzunahme ableiten?
  - Task demand (EN): Derive conservation of mass from the closed result. Explain the apparent mass disappearance in the everyday open-tablet example using an explicit system boundary and particle model.
Binding complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current441-HB-lower14-current-whole-union-author-20261017-v1/materials/HB-lower14-ten-complete-DE-EN-cases.pending.json#/cases/0
Fresh: Fresh: a steel-wool model gains mass during oxidation in open air. Supplied substance analysis identifies uptake of atmospheric oxygen. Explain the gain; does it establish a new law of increasing mass?
  - Expected performance (DE): Die unveränderte Gesamtmasse stützt, dass Atome bei der Reaktion erhalten und neu angeordnet werden. Im offenen gewogenen System fehlen danach 0,40 g des vorgegebenen austretenden Gases; einschließlich der Umgebung bleibt die Masse erhalten. Ein kleinerer Waagenwert beweist keine Vernichtung von Atomen. Ein einzelnes Protokoll ist kein Beweis für jedes denkbare System.
Frischer Transfer: Zur gewogenen Stahlprobe kommt Masse aus der Luft hinzu; über die erweiterte Grenze bleiben Atome und Masse erhalten. Weder offener Massenverlust noch offene Massenzunahme widerlegt das geschlossene Bilanzmodell.
  - Expected performance (EN): Unchanged total mass supports conservation and rearrangement of atoms. The weighed open system loses 0.40 g of the specified escaping gas; including the surroundings conserves mass. A lower balance reading does not establish destruction of atoms. A single record does not prove every imaginable system.
Fresh transfer: Mass enters the weighed steel from the air; across the enlarged boundary atoms and mass remain conserved. Neither open-system gain nor loss refutes the closed balance model.
  - Understanding focus (DE): Aus Versuchsergebnissen ableiten UND auf zwei Alltagskontexte übertragen; Systemgrenze, Gasabgabe/Sauerstoffaufnahme und Atomerhaltung erklären. Keine eigene Versuchsdurchführung behaupten.
  - Understanding focus (EN): Derive from experimental results AND transfer to two everyday contexts; explain boundary, gas release/oxygen uptake and atom conservation. Do not claim personal execution.
## Page 7: Biotreibstoffe nach Rohstoff und Herstellungsweg unterscheiden

- Full learning-goal ID: `223e33a4-5545-5332-ac4e-7d7a6cbc587c`
- Goal fingerprint: `sha256:1c2eb30897760a5cbd0727d367bb6642b20e7ef416f6688e62d528bc4cd250c6`
- Page fingerprint: `sha256:b5463d384fce60848ffc13a3e4d1f1ea420d2f59ddb8729f61cd74a8b557d90d`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann anhand bereitgestellter Stoff- und Prozessdaten Pflanzenöl, Biodiesel und Bioethanol nach Rohstoff, Stoffklasse sowie Gewinnungs- beziehungsweise Herstellungsweg unterscheiden, dabei physikalische Trennung und chemische Umwandlung erklären, die Wege nach einer angegebenen Rohstoff-/Prozesskonvention der ersten oder zweiten Treibstoffgeneration zuordnen, ohne daraus eine automatische Klimaneutralität abzuleiten.

### Visualization

/assets/goal-visualizations/chemie/223e33a4-5545-5332-ac4e-7d7a6cbc587c/223e33a4-5545-5332-ac4e-7d7a6cbc587c.png

- original digest: `sha256:858601a4a9593850f356be0c09c2d832dc57d29f04d55c0f667d112ec9fd0967`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Übung: Biotreibstoffwege und getrennte Trennmassenbilanz — `2339b9b1-39c8-59f1-9108-c46966ecf1fd` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:7440c667f25a5833f83089ef676aa9cf1b70ad9ea41874affff783f70b1cb13d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `concept`

**Positive understanding expectations**

- `hb200-plant-oil-production-generations`
  - Essential understanding (DE): Pflanzenöl wird physikalisch als Triglyceridgemisch gewonnen;Biodiesel/Bioethanol entstehen anders. Generationen bezeichnen Rohstoff-/Prozesskontexte.
  - Essential understanding (EN): Plant oil is physically isolated as triglyceride mixture;biodiesel/bioethanol form differently. Generations denote feedstock/process contexts.
  - Observable performance (DE): Die lernende Person erklärt Gewinnungsschritte und unterscheidet Treibstoffwege und Generationen nach Stoffklasse und Kernprozess; sie begrenzt Schlussfolgerungen zur Klimaneutralität anhand der fehlenden Lebenszyklusdaten.
  - Observable performance (EN): The learner explains isolation steps and distinguishes fuel routes and generations by substance class and core process; they bound climate-neutrality conclusions using the missing life-cycle data.

**Coverage expectations**

- required expectations: `hb200-plant-oil-production-generations`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `hb200-plant-oil-production-generations-transfer`: Bedingungswechsel im vollständigen Transfer selbstständig berücksichtigen. / Independently account for changed conditions in the complete transfer.

**Application cases**

- `hb200-plant-oil-routes-0959`
  - Task demand (DE): Industrielles Papierschema Ölfrucht→Reinigen/Zerkleinern→Pressen→Filtern/Raffinieren→Triglyceridgemisch. Optionale industrielle Lösemittelextraktion ist Trennung,keine hier auszuführende Tätigkeit. Ideal100 kg trockene Saat→30 kg Öl+70 kg Presskuchen;Saatölgehalt,Verluste/Feuchte fehlen. Pflanzenöl=Triglyceride. Biodiesel:Triglycerid+3 Methanol→3 Fettsäuremethylester+Glycerin,danach Trennung/Reinigung;keine Betriebsanweisung. Zucker-Bioethanol:C6H12O6→2 C2H5OH+2 CO2,anschließend Abtrennung;real Umsatz begrenzt. Generationenkonvention hier:1 aus Zucker/Stärke/Speiseöl geeigneter Nahrungspflanzen;2 aus lignocellulosischen bzw.benannten Reststoffpfaden. Generation ist Rohstoff-/Prozesszuordnung,keine Nachhaltigkeitsgarantie. Vollständiger BTL-FT-Prozess ist HB-LK;GK benötigt hier nur zutreffende Abgrenzung.
Erkläre konkrete Gewinnungs-/Herstellungsschritte auf Stoffebene. Unterscheide Pflanzenöl,Biodiesel und Bioethanol nach Rohstoff,Stoffklasse,Kernprozess. Verwende Treibstoffe der1./2.Generation und begründe,warum erneuerbar nicht automatisch CO2-neutral ist. Erhaltene vertiefte Biodiesel-/Bioethanolprofile sind zusätzliche Carrier;keine Herstellung durchführen.
  - Task demand (EN): Industrial paper scheme oil crop→cleaning/crushing→pressing→filtering/refining→triglyceride mixture. Optional industrial solvent extraction is separation,not an activity to perform here. Ideal100 kg dry seed→30 kg oil+70 kg press cake;seed oil content,loss/moisture absent. Plant oil=triglycerides. Biodiesel:triglyceride+3 methanol→3 fatty-acid methyl esters+glycerol,then separation/purification;no operating instructions. Sugar bioethanol:C6H12O6→2 C2H5OH+2 CO2,then separation;actual conversion limited. Generation convention:1 from sugar/starch/edible oils of suitable food crops;2 from lignocellulosic or specified residue routes. Generation classifies feedstock/process,not guaranteed sustainability. Full BTL-FT process belongs to HB LK;GK here needs accurate distinction only.
Explain concrete isolation/manufacturing steps at substance level. Distinguish plant oil,biodiesel and bioethanol by feedstock,class,core process. Use first/second-generation fuels and explain why renewable is not automatically carbon-neutral. Retained detailed biodiesel/bioethanol profiles are additional carriers;perform no manufacture.
  - Expected performance (DE): Pressen/Filtern trennt vorhandene Triglyceride;Umesterung bildet neue Ester/Glycerin;Gärung bildet Ethanol/CO2.Anbau,Prozessenergie,Landnutzung,Transport,Nebenprodukte beeinflussen Klimabilanz;Auspuff emittiert auch biogenes CO2.
  - Expected performance (EN): Pressing/filtering separates existing triglycerides;transesterification forms new esters/glycerol;fermentation forms ethanol/CO2.Cultivation,process energy,land use,transport,coproducts affect climate balance;exhaust also releases biogenic CO2.
  - Understanding focus (DE): Pflanzenöl wird physikalisch als Triglyceridgemisch gewonnen;Biodiesel/Bioethanol entstehen anders. Generationen bezeichnen Rohstoff-/Prozesskontexte.
  - Understanding focus (EN): Plant oil is physically isolated as triglyceride mixture;biodiesel/bioethanol form differently. Generations denote feedstock/process contexts.
- `hb200-plant-oil-routes-0959-existing-fresh-transfer`
  - Task demand (DE): Industrielles Papierschema Ölfrucht→Reinigen/Zerkleinern→Pressen→Filtern/Raffinieren→Triglyceridgemisch. Optionale industrielle Lösemittelextraktion ist Trennung,keine hier auszuführende Tätigkeit. Ideal100 kg trockene Saat→30 kg Öl+70 kg Presskuchen;Saatölgehalt,Verluste/Feuchte fehlen. Pflanzenöl=Triglyceride. Biodiesel:Triglycerid+3 Methanol→3 Fettsäuremethylester+Glycerin,danach Trennung/Reinigung;keine Betriebsanweisung. Zucker-Bioethanol:C6H12O6→2 C2H5OH+2 CO2,anschließend Abtrennung;real Umsatz begrenzt. Generationenkonvention hier:1 aus Zucker/Stärke/Speiseöl geeigneter Nahrungspflanzen;2 aus lignocellulosischen bzw.benannten Reststoffpfaden. Generation ist Rohstoff-/Prozesszuordnung,keine Nachhaltigkeitsgarantie. Vollständiger BTL-FT-Prozess ist HB-LK;GK benötigt hier nur zutreffende Abgrenzung.
Restholz wird über Synthesegas zu Kraftstoff;anderer Anbieter nutzt gefiltertes Rapsöl. Beide heißen werblich Biodiesel und klimaneutral. Prüfe ohne neue GK-LK-Detailpflicht.
  - Task demand (EN): Industrial paper scheme oil crop→cleaning/crushing→pressing→filtering/refining→triglyceride mixture. Optional industrial solvent extraction is separation,not an activity to perform here. Ideal100 kg dry seed→30 kg oil+70 kg press cake;seed oil content,loss/moisture absent. Plant oil=triglycerides. Biodiesel:triglyceride+3 methanol→3 fatty-acid methyl esters+glycerol,then separation/purification;no operating instructions. Sugar bioethanol:C6H12O6→2 C2H5OH+2 CO2,then separation;actual conversion limited. Generation convention:1 from sugar/starch/edible oils of suitable food crops;2 from lignocellulosic or specified residue routes. Generation classifies feedstock/process,not guaranteed sustainability. Full BTL-FT process belongs to HB LK;GK here needs accurate distinction only.
Waste wood becomes fuel via syngas;another producer uses filtered rapeseed oil. Both advertise biodiesel and carbon neutrality. Assess without adding LK detail duties for GK.
  - Expected performance (DE): Holz/Synthesegas passt zum zweiten Generationen-/BTL-Kontext,nicht FAME. Gefiltertes Rapsöl bleibt Pflanzenöl,keine Umesterung. Für beide keine automatische Neutralität;LCA-Systemgrenze fehlt.
  - Expected performance (EN): Wood/syngas fits second-generation/BTL context,not FAME. Filtered rapeseed oil remains plant oil,no transesterification. Neither is automatically neutral;LCA boundary absent.
  - Understanding focus (DE): Der bereits vorgegebene Wechsel zu Restholz/Synthesegas und nur gefiltertem Rapsöl prüft die Übertragung der Rohstoff-/Prozesszuordnung; Werbewörter ersetzen keine Stoffklassen-, Umwandlungs- oder Klimabilanzbegründung.
  - Understanding focus (EN): The already supplied switch to waste wood/syngas and merely filtered rapeseed oil tests transfer of feedstock/process classification; marketing labels replace neither substance-class, conversion nor climate-boundary reasoning.
## Page 8: Säure-Base-Puffer erklären, auswählen und bewerten

- Full learning-goal ID: `25729c34-33d5-553a-a723-046113a7da47`
- Goal fingerprint: `sha256:0add63e8e94af77dbb1bb0d14fe9622de510a10e86e59fb707d71ecc0e722356`
- Page fingerprint: `sha256:95bb3d14a9602eced6bbb75f91a42e4c8999a1ec40d58493573556b738e09b27`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann die Wirkung von Säure-Base-Puffern erklären, geeignete Puffersysteme zur Einstellung von pH-Werten wässriger Lösungen auswählen und Einsatzmöglichkeiten in Medizin, Umwelt und Technik quellenkritisch bewerten.

### Visualization

/assets/goal-visualizations/chemie/25729c34-33d5-553a-a723-046113a7da47/25729c34-33d5-553a-a723-046113a7da47.jpg

- original digest: `sha256:1c36aa54a71aa0170145a91112d08de4fc0a2322d60a66becd09d8a7e7b5aacf`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- pK-Werte nutzen — `48115ff7-7aca-5d0b-a9e7-7fc6c78434ef` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Pufferwirkung experimentell untersuchen — `c61b2a7a-fb0f-5a76-92e9-771c789fa816` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:ab2ef5ecbfaf2a8ec040300f17f118310e4ffcedc97bece7f72fd48ab785ff50`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Ein Puffer nimmt begrenzte Säure- und Basemengen durch ein korrespondierendes Paar auf; die Partner werden dabei umgesetzt.
  - Essential understanding (EN): A buffer takes up limited acid and base through a conjugate pair whose partners are consumed in the process.
  - Observable performance (DE): Die lernende Person formuliert die beiden Aufnahmereaktionen und verbindet sie mit der benötigten pH-Nähe und endlichen Reserve.
  - Observable performance (EN): The learner writes the two uptake reactions, relating them to the required pH region and finite reserve.
- `e2`
  - Essential understanding (DE): Ein passender pKₐ ist notwendig für eine begründete Auswahl, ersetzt aber keine Prüfung der chemischen Verträglichkeit.
  - Essential understanding (EN): An appropriate pKₐ supports selection but does not replace a chemical compatibility check.
  - Observable performance (DE): Sie vergleicht die gegebenen Kandidaten und schließt Phosphat bei der ausdrücklich angegebenen Calciumfällung oder Analytbindung aus; bei fehlendem geeigneten Kandidaten benennt sie die Datenlücke.
  - Observable performance (EN): The learner compares the supplied candidates, excludes phosphate where calcium precipitation or analyte loss is stated and identifies the data gap when no suitable candidate is available.
- `e3`
  - Essential understanding (DE): Die Reichweite einer Quelle hängt von Herkunft, Bedingungen und untersuchtem System ab.
  - Essential understanding (EN): A source's reach depends on provenance, conditions and the system investigated.
  - Observable performance (DE): Sie vergleicht die vollständig gegebenen fiktiven Quellen nach Bedingungen, Wiederholungen, Kontrollmessungen und Interessenkonflikten und begrenzt Laborbefunde auf den tatsächlich untersuchten Bereich.
  - Observable performance (EN): The learner compares the fully supplied fictional sources by conditions, replicates, control measurements and interests, limiting laboratory findings to the investigated scope.
- `e4`
  - Essential understanding (DE): Mehr Pufferstoff löst weder jede chemische Unverträglichkeit noch begründet ein Laborbefund automatisch medizinische oder ökologische Eignung.
  - Essential understanding (EN): More buffer does not resolve every chemical incompatibility, and a laboratory finding does not automatically establish medical or ecological suitability.
  - Observable performance (DE): Sie widerlegt die behauptete Lösung durch Verdoppeln der Phosphatmenge beziehungsweise die Übertragung von 100-mL-Proben auf ein offenes Gewässer und nennt fehlende Prüfungen.
  - Observable performance (EN): The learner refutes doubling phosphate as a universal remedy and extrapolating 100 mL vials to open water, stating the missing checks.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `application-constraints`: Forschungsassay, calciumhaltigen Technikprozess und Umweltprobe unter verschiedenen Verträglichkeitsbedingungen vergleichen. / Compare a research assay, calcium-containing technical process and environmental sample under different compatibility constraints.
- `source-scope`: Unabhängigen begrenzten Prüfbericht und ungestützte Anbieterbehauptung anhand der gegebenen vollständigen Texte vergleichen. / Compare a bounded independent report and unsupported vendor claim using the full supplied texts.
- `scale-and-claim`: Von einer Laborentscheidung zur Frage einer medizinischen oder ökologischen Übertragung wechseln, ohne diese zu behaupten. / Move from a laboratory decision to considering medical or ecological extrapolation without asserting it.

**Application cases**

- `t04-c1`
  - Task demand (DE): 25°C; keine Behandlungsempfehlung. Ein Forschungsassay und ein technischer Prüfschritt sollenpH7.0±.2 halten. Kandidaten:AcetatpKa4.76,Phosphat7.20,Ammonium9.25. Gegeben:Phosphat im Assay verträglich,aber im zweiten Ca²⁺-haltigen Prozess fällt ein unlösliches Phosphat aus. Fiktive Quelle A:Methodenblatt mit Autor,Datum,25°C,Totalpuffer50mmol/L und getesteter Säurelast1mmol/L. Fiktive Quelle B:Werbung „Phosphat stabilisiert jedenpH unbegrenzt und ist immer medizinisch sicher“,ohne Daten. Vollständige zusätzliche Quellenkästen (beide eigens erfunden): A, „Methodenblatt der Modell-Laborgruppe A“, 2026-09-01: „Phosphat, 50 mmol/L insgesamt, 25 °C: pH vor 1.00 mmol/L HCl 7.00, danach im idealisierten Test 6.96. Aussage nur für diesen kompatiblen Forschungsassay; keine klinischen Daten.“ B, „Werbeblatt des Modell-Anbieters B“, ohne Datum oder Autor: „Unser Puffer hält jeden pH bei beliebiger Säurelast konstant und ist in jeder medizinischen Anwendung sicher.“ Es gibt keine weiteren externen Quellenkarten.
1. Erkläre die Reaktionen des Phosphatpaares mit H₃O⁺ und OH⁻ und warum derpH nicht absolut konstant bleibt.
2. Wähle für beide Anwendungen unter den gegebenen Daten einen Puffer oder eine begründete offene Alternative.
3. Vergleiche die Quellen A/B und formuliere getrennte Einsatzurteile ohne medizinische Sicherheit abzuleiten.
4. Beurteile, ob die doppelte Phosphatmenge den als unverträglich beschriebenen Ca²⁺-Prozess automatisch geeignet macht; trenne diese Frage von einer medizinischen Sicherheitsbehauptung.
  - Task demand (EN): 25°C, no treatment advice. A research assay and technical test target pH 7.0±.2.Candidates: acetate pKa 4.76, phosphate 7.20, ammonium 9.25.Given: phosphate compatible with assay, but precipitates in the Ca²⁺-containing technical process. Fictional source A: dated/authored method sheet with 25°C, total buffer 50 mmol/L and tested 1 mmol/L acid load. Fictional source B: advertising claims universal unlimited pH stability/medical safety without data. Complete additional source boxes (both invented for this task): A, “Method sheet of model laboratory group A”, 2026-09-01: “Phosphate, total 50 mmol/L, 25 °C: pH before 1.00 mmol/L HCl 7.00, afterwards 6.96 in the idealised test. Claim limited to this compatible research assay; no clinical data.” B, “Marketing sheet of model vendor B”, no date or author: “Our buffer holds every pH constant under any acid load and is safe in every medical use.” There are no further external source cards.
1. Explain phosphate-pair reactions with H₃O⁺/OH⁻ and why pH is not absolutely constant.
2. Select a buffer for each application or justify an unresolved alternative.
3. Compare sources A/B and give separate use judgements without inferring medical safety.
4. Assess whether doubling phosphate automatically makes the stated incompatible Ca²⁺ process suitable; distinguish this from a medical safety claim.
  - Expected performance (DE): 1. HPO₄²⁻ + H₃O⁺ → H₂PO₄⁻ + H₂O und H₂PO₄⁻ + OH⁻ → HPO₄²⁻ + H₂O nehmen Säure/Base auf. Das Verhältnis ändert sich; die Stabilisierung ist endlich. 2. Phosphat passt mit pKₐ 7.20 zum Assay und ist dort laut Material verträglich. Im Calciumprozess schließt die angegebene Fällung es aus. Acetat und Ammonium liegen zu weit entfernt; eine belegte Alternative für pH 7 fehlt. 3. Quelle A nennt nachprüfbare, begrenzte Bedingungen und Last; daraus folgt weder universelle Eignung noch medizinische Sicherheit. B ist eine ungestützte Werbeaussage. 4. Mehr Phosphat beseitigt die gegebene Fällungs-/Matrixunverträglichkeit nicht automatisch. Neue Verträglichkeitsdaten sind nötig; Labor-pH-Stabilität belegt keine klinische Sicherheit.
  - Expected performance (EN): 1. HPO₄²⁻+H₃O⁺→H₂PO₄⁻+H₂O and H₂PO₄⁻+OH⁻→HPO₄²⁻+H₂O consume added acid/base but change the ratio; stabilization is limited. 2. Phosphate is close to pKa 7.20 and compatible with the supplied assay. The stated precipitation rules it out for the Ca²⁺ process. Acetate/ammonium are pKa-distant; data for a valid alternative at 7.0 are missing. 3. A has checkable but limited conditions/load; it cannot be generalized to arbitrary media or medicine. B is unsupported advertising. Lab pH suitability does not prove clinical efficacy or general safety.
4. More buffer does not automatically remove the supplied precipitation/matrix incompatibility. New compatibility evidence is required; pH stabilization or a laboratory trial does not prove clinical safety.
  - Understanding focus (DE): pH-Passung und chemische Verträglichkeit sind gemeinsam nötig; eine nicht belegte Alternative bleibt offen.
  - Understanding focus (EN): pH suitability and chemical compatibility are jointly required; an unsupported alternative remains unresolved.
- `t04-c2`
  - Task demand (DE): 25°C;synthetisches Umwelt-Probenverfahren verlangtpH6.50±.15. Kandidaten X:pKa6.40,keine Analytinterferenz im gegebenen Prüftest;PhosphatpKa7.20,im Prüftest messbarer Analytverlust;AmmoniumpKa9.25. Quelle C:fiktiver unabhängiger Bericht mit12Wiederholungen,Blank/Referenz undpH6.48–6.52 für genau100mLProbengefäße. Quelle D:fiktive Anbieterbroschüre empfiehlt denselben Puffer ungeprüft zur großräumigen Gewässerstabilisierung. Keine Freisetzungs-/Ökosystemdaten. Vollständige zusätzliche Quellenkästen (eigens erfunden): C, „Unabhängige Modell-Prüfstelle C“, 2026-09-02: „Zwölf 100-mL-Proben bei 25 °C, Puffer X; Leerprobe und Referenz mitgeführt. Gemessener pH-Bereich 6.48–6.52, im gegebenen Test kein Analytverlust. Andere Proben und Umweltfolgen wurden nicht untersucht.“ D, „Modell-Anbieter D“, undatiert: „Weil kleine Proben stabil sind, sollte derselbe Stoff ganze Gewässer ohne weitere Untersuchung stabilisieren.“ Weitere Texte oder Karten werden nicht vorausgesetzt.
1. Formuliere für das generische Paar HX/X⁻ die Säure-/Baseaufnahme und erläutere die begrenzte Reserve.
2. Wähle den Puffer für das Probenverfahren mithilfe vonpKa und Interferenzdaten.
3. Bewerte Quellen C/D und begründe, ob aus Probengefäßdaten eine Gewässeranwendung folgt.
4. Erkläre, weshalb zwölf Wiederholungen im Probengefäß keine Repräsentativität für ein ganzes offenes Gewässer oder eine Freisetzungsbewertung herstellen.
  - Task demand (EN): 25°C, synthetic environmental-sample procedure targets pH 6.50±.15.Candidates: X pKa 6.40, no analyte interference in given test; phosphate 7.20 causes measured analyte loss; ammonium 9.25.Fictional source C: independent report with 12 replicates, blank/reference and pH 6.48–6.52 for exact 100 mL sample vials. Fictional source D: vendor brochure generalizes to whole water body buffering without release/ecosystem data. Complete additional source boxes (invented): C, “Independent model testing group C”, 2026-09-02: “Twelve 100 mL samples at 25 °C, buffer X, with blank and reference controls. Measured pH 6.48–6.52; no analyte loss in the stated test. Other samples and environmental effects were not investigated.” D, “Model vendor D”, undated: “Because small samples are stable, the same substance should stabilise whole water bodies without further investigation.” No further texts or cards are required.
1. Write acid/base uptake for HX/X⁻ and explain the finite reserve.
2. Select buffer for the sample procedure using pKa/interference data.
3. Evaluate sources C/D and whether vial data justify whole water body application.
4. Explain why twelve vial replicates do not establish representativeness for an open water body or a release assessment.
  - Expected performance (DE): 1. X⁻ + H₃O⁺ → HX + H₂O und HX + OH⁻ → X⁻ + H₂O setzen endliche Partnervorräte um. 2. X liegt nahe am Ziel-pH und stört laut gegebenem Test nicht. Phosphat verursacht Analytverlust; Ammonium liegt zu weit vom Zielbereich entfernt. 3. Quelle C stützt die begrenzte 25-°C-Probenmethode mit Kontrollen und Wiederholungen. Quelle D überträgt sie ohne Belastungs-, Expositions- oder Ökologiedaten auf ein offenes Gewässer. Ein stabilisiertes 100-mL-Gefäß rechtfertigt keine reale Gewässerdosierung. 4. Wiederholungen prüfen Streuung unter denselben Bedingungen, nicht andere Lasten, Transportvorgänge, Organismen oder Exposition. Für die Übertragung sind zusätzliche Anwendungsnachweise nötig.
  - Expected performance (EN): 1. X⁻+H₃O⁺→HX+H₂O and HX+OH⁻→X⁻+H₂O interconvert finite partner reserves. 2. X is pKa-close and does not interfere in the given assay. Phosphate is unsuitable because of analyte loss; ammonium is too pKa-distant. 3. C supports a bounded 25°C sample procedure with controls/replicates. D generalizes to an open water body without loading/exposure/ecology data. A pH-stabilized 100 mL vial does not justify real water body dosing; the environmental judgement remains limited to sample handling.
4. Replicates assess scatter under the same conditions, not other loads, transport, organisms or exposure. A controlled vial and an open water body require different application evidence.
  - Understanding focus (DE): Geringe Wiederholstreuung in kleinen Gefäßen belegt keine Repräsentativität oder Umweltverträglichkeit.
  - Understanding focus (EN): Low replicate scatter in small vessels does not establish representativeness or ecological compatibility.
## Page 9: Arrhenius-Definitionen wiederholen

- Full learning-goal ID: `28bb9d15-f865-5843-a035-6066580fea64`
- Goal fingerprint: `sha256:3e5559e1a403aae6be59a0b4e4b5b63433d482c9904f0c4c9ac3a9797c92cd97`
- Page fingerprint: `sha256:9bb3fd09c552fe0d4bba809a2fa776be7f6bdf0ed006488fa191c81a688fe024`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann typische anorganische Säuren und Basen mit Namen und Formeln angeben und ihre Wirkung in Wasser nach dem Arrhenius-Konzept erklären.

### Visualization

/assets/goal-visualizations/chemie/28bb9d15-f865-5843-a035-6066580fea64/28bb9d15-f865-5843-a035-6066580fea64.jpg

- original digest: `sha256:50490034f47f3f483418c3dd4998105f369eeeee5b54235cd9745a5c13b7b597`
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

- pH- und pOH-Beziehungen abrufen — `076cb333-3b61-5025-8f32-32afc16f9987` (outside this book)
- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:186afef88ab2d2681cdb4691b65340bb308c1839bf5ea41a4c713fba37940c4a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `names-formulas-and-aqueous-species`
  - Essential understanding (DE): Namen und Formeln typischer anorganischer Säuren und Hydroxide unterstützen das Arrhenius-Teilchenmodell: Säuren erhöhen H3O+, gelöste Hydroxide erhöhen OH− in Wasser. Stoffformel und Lösungsname beschreiben nicht dieselbe Ebene oder sämtliche Lösungsteilchen. Die neun hier verwendeten Stoffe sind vollständig erhaltene Unterrichtsbeispiele, keine abschließende allgemeine Stoffliste.
  - Essential understanding (EN): Names and formulas of typical inorganic acids and hydroxides support the Arrhenius species model: acids increase H3O+ and dissolved hydroxides increase OH− in water. Substance formulas and solution names describe different levels and do not enumerate all solution species. The nine substances used here remain complete teaching examples, not an exhaustive general list.
  - Observable performance (DE): Die Person ordnet an den jeweils verwendeten typischen Beispielen Säure- und Hydroxidnamen, Formeln sowie Lösungsnamen richtig zu und erklärt wässrige Ionenbildung, Stoff/Lösung und die Grenze vollständiger Dissoziationsannahmen. Die beiden vorhandenen Fälle mit fünf Säuren und vier Hydroxiden bleiben vollständig erhalten; die Zahl der Beispiele begründet keine zusätzliche Aufgaben- oder Abrufquote.
  - Observable performance (EN): For the typical examples used in the task, the learner correctly associates acid and hydroxide names, formulas and solution names and explains aqueous ions, the substance/solution distinction and limits of complete-dissociation assumptions. The two existing cases with five acids and four hydroxides remain complete; the number of examples creates no additional task or recall quota.
- `ni-9-10-arrhenius-aqueous-ph-scale-source-observation`
  - Essential understanding (DE): A ist sauer und enthält im Modell mehr H3O+ als OH−; C ist alkalisch und enthält mehr OH− als H3O+. HCl ist Chlorwasserstoff, die wässrige Lösung heißt Salzsäure; NaOH ist Natriumhydroxid. B ist bei den vorgegebenen25°C neutral: [H3O+]=[OH−], beide ungleich null. Die Bezugnahme auf25°C begrenzt die Aussage neutral=pH7. pH4 liegt im gegebenen wässrigen Kontext auf der sauren Seite; der pH-Wert identifiziert weder die Säure noch ihre eigenständige Stärke unabhängig von Konzentration. Das trockene Gas besitzt ohne passende wässrige Bedingung keinen nach diesem Auftrag interpretierbaren pH-Wert. Die vorgegebenen Zahlen sind keine eigenen Rohdaten oder Stoffreinheitsnachweise.
  - Essential understanding (EN): A is acidic, with more H3O+ than OH− in the model; C is alkaline, with more OH− than H3O+. HCl is hydrogen chloride, its aqueous solution hydrochloric acid; NaOH is sodium hydroxide. B is neutral at the specified25°C: [H3O+]=[OH−], neither zero. The stated temperature bounds neutral=pH7. The aqueous pH4 sample is acidic, but pH alone identifies neither the acid nor its intrinsic strength independently of concentration. Dry gas without the aqueous condition has no pH interpretable under this activity. Supplied numbers are not personal raw data or proof of substance purity.
  - Observable performance (DE): Den vollständigen neuen Materialfall anhand der gegebenen Informationen begründet bearbeiten; keine reale Messung oder Tätigkeit behaupten.
  - Observable performance (EN): Reason through the whole new material case using the supplied information; claim no real measurement or action.

**Coverage expectations**

- required expectations: `names-formulas-and-aqueous-species`, `ni-9-10-arrhenius-aqueous-ph-scale-source-observation`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `fresh-material-and-boundaries`: Neue konkrete Stoffe, Angaben, Rollen oder unvollständige Informationen variieren; Antworten an die bereitgestellten Daten binden und die abgefragte Verständnisroutine vollständig zeigen. / Vary concrete substances, information, roles or incomplete evidence; ground answers in supplied data and demonstrate the complete understanding routine.
- `ni-9-10-arrhenius-aqueous-ph-scale-fresh`: erst nach der Erklärung: Für eine unbekannte wässrige Probe ist pH4 angegeben. Klassifiziere und erkläre, ob daraus allein der Stoffname HCl oder eine bestimmte Säurestärke folgt. Einer trockenen HCl-Gasprobe wurde ohne wässrige Messbedingung ebenfalls ein pH-Wert zugewiesen: Beurteile diese Übertragung. / an unidentified aqueous sample has pH4. Classify it and explain whether this alone identifies HCl or an intrinsic acid strength. A dry HCl gas sample was also assigned a pH without an aqueous measurement condition: assess that transfer.

**Application cases**

- `five-acid-names-and-aqueous-model`
  - Task demand (DE): Fiktive Unterrichtskarten nennen Chlorwasserstoff, Salpetersäure, Schwefelsäure, Phosphorsäure und Kohlensäure; ein Laborblatt nennt Salzsäure als wässrige Chlorwasserstofflösung. Gib die fünf Stoffformeln an und ordne HNO3 und H3PO4 ihre Namen zu. Erläutere nach Arrhenius, warum die genannten sauren Lösungen eine gegenüber reinem Wasser erhöhte Oxoniumionenkonzentration haben. Formuliere die wässrige Reaktion von HCl mit Wasser. Vergleiche Chlorwasserstoffgas mit Salzsäure und beurteile „H3PO4 beschreibt alle tatsächlich vorhandenen Teilchen der Lösung“. Materialhinweis: schwache Säuren enthalten in Wasser undissoziierte Moleküle und Ionen; vollständige Dissoziation darf nicht für alle angenommen werden. Keine reale Tätigkeit und keine pH-Rechnung.
  - Task demand (EN): Fictional teaching cards name hydrogen chloride, nitric acid, sulfuric acid, phosphoric acid and carbonic acid; a lab sheet calls aqueous hydrogen chloride hydrochloric acid. Give the five substance formulas and name HNO3 and H3PO4. Use Arrhenius to explain the increased hydronium-ion concentration in these acidic solutions compared with pure water. Write the aqueous HCl/water reaction. Compare hydrogen chloride gas with hydrochloric acid and assess “H3PO4 describes every species actually present in the solution”. Given information: weak acids in water contain undissociated molecules and ions; complete dissociation must not be assumed for every acid. No real activity or pH calculation.
  - Expected performance (DE): HCl, HNO3, H2SO4, H3PO4, H2CO3; HNO3 heißt Salpetersäure und H3PO4 Phosphorsäure. Im Arrhenius-Modell steigt durch die Säure in Wasser die H3O+-Konzentration; HCl+H2O→H3O++Cl−. H+(aq) ist eine Kurzschreibweise für solvatisierte Protonen und kein freies nacktes Proton in der Lösung. HCl(g) ist der Stoff, Salzsäure seine wässrige Lösung. Eine Stoffformel beschreibt die Zusammensetzung des Stoffs, nicht die vollständige Teilchenverteilung der Lösung; H3PO4 kann neben Ionen und Wasser als undissoziiertes Molekül vorliegen. Kartenabruf allein erklärt dies nicht.
  - Expected performance (EN): HCl, HNO3, H2SO4, H3PO4, H2CO3; HNO3 is nitric acid and H3PO4 phosphoric acid. In the Arrhenius model the acid increases H3O+ in water; HCl+H2O→H3O++Cl−. H+(aq) denotes solvated protons rather than a bare free proton in solution. HCl(g) is the substance; hydrochloric acid is its aqueous solution. A substance formula specifies composition, not the complete distribution of solution species; undissociated H3PO4 can coexist with ions and water. Formula recall alone does not explain this.
  - Understanding focus (DE): Namen/Formeln dienen einer begründeten Unterscheidung von Stoff und wässrigem Teilchenmodell; starke und schwache Säuren werden nicht gleichgesetzt.
  - Understanding focus (EN): Names and formulas support a reasoned substance/aqueous-species distinction; strong and weak acids are not equated.
- `four-hydroxides-and-solution-names`
  - Task demand (DE): Neuer fiktiver Datensatz: Natriumhydroxid, Kaliumhydroxid, Calciumhydroxid und Bariumhydroxid; zugehörige wässrige Lösungen heißen Natronlauge, Kalilauge, Kalkwasser und Barytwasser. Kalkwasser bezeichnet hier ausdrücklich die klare Lösung nach Abtrennung ungelösten Feststoffs. Gib die vier Stoffformeln an und beantworte die Rückwärtsfrage nach dem gelösten Stoff in Kalilauge und Barytwasser. Erläutere nach Arrhenius die Basenwirkung der gelösten Hydroxide und die beim Lösen von Ca(OH)2 entstehenden Ionen samt Verhältnis. Beurteile „Kalkwasser ist eine Suspension“ und „Die Lösung besitzt selbst die Summenformel NaOH“. Erkläre, warum gleiche Stoffmengen gelösten NaOH und Ca(OH)2 im gleichen Endvolumen im vollständigen Dissoziationsmodell unterschiedliche OH−-Beiträge liefern. Keine reale Herstellung.
  - Task demand (EN): Fresh fictional data: sodium hydroxide, potassium hydroxide, calcium hydroxide and barium hydroxide; aqueous solutions are sodium hydroxide solution, potassium hydroxide solution, limewater and baryta water. Limewater here explicitly means the clear solution after undissolved solid is removed. Give the four substance formulas and identify the solute in potassium hydroxide solution and baryta water. Use Arrhenius to explain dissolved hydroxides and state the ions and ratio produced by dissolved Ca(OH)2. Assess “limewater is a suspension” and “the solution itself has molecular formula NaOH”. Explain why equal amounts of dissolved NaOH and Ca(OH)2 at the same final volume produce different OH− contributions in the complete-dissociation model. No actual preparation.
  - Expected performance (DE): NaOH, KOH, Ca(OH)2, Ba(OH)2; Kalilauge enthält gelöstes KOH, Barytwasser gelöstes Ba(OH)2. Die gelösten Hydroxide erhöhen die OH−-Konzentration. NaOH→Na++OH−; gelöstes Ca(OH)2→Ca2++2OH−. Das Ca2+:OH−-Verhältnis ist1:2; pro gelöster Formeleinheit entstehen zwei statt eines OH−. Dies ist eine stöchiometrische Modellfolge, keine Aussage über beliebig hohe Löslichkeit. Das definierte klare Kalkwasser ist keine Suspension. NaOH ist die Stoffformel des gelösten Hydroxids; die Lösung ist ein Gemisch aus Wasser und gelösten Teilchen und besitzt diese Formel nicht als Ganzes.
  - Expected performance (EN): NaOH, KOH, Ca(OH)2, Ba(OH)2; potassium hydroxide solution contains dissolved KOH and baryta water dissolved Ba(OH)2. Dissolved hydroxides increase OH− concentration. NaOH→Na++OH−; dissolved Ca(OH)2→Ca2++2OH−. The Ca2+:OH− ratio is1:2 and each dissolved formula unit provides two rather than one OH−. This is a stoichiometric model consequence, not unlimited solubility. The stipulated clear limewater is not a suspension. NaOH is the solute formula; the whole solution is a mixture of water and dissolved species and does not have that formula.
  - Understanding focus (DE): Geänderte Namen/Formeln und mehrwertiges Hydroxid prüfen Transfer; der gelöste Stoff wird von der ganzen Lösung und ungelösten Bestandteilen getrennt.
  - Understanding focus (EN): Changed names/formulas and a divalent hydroxide test transfer; solute, whole solution and undissolved material remain distinct.
- `ni-9-10-arrhenius-aqueous-ph-scale`
  - Task demand (DE): Vorgegebener pH-Skalenausschnitt für diese wässrigen Proben bei25°C:pH<7 sauer, pH=7 neutral, pH>7 alkalisch; auch Zwischenwerte wie6,5 gehören zur entsprechenden Seite. Werte unter0 oder über14 sind nicht allgemein ausgeschlossen. Nutze die Skala als Material; hier wird keine pH-Rechnung oder neue Abrufkarte verlangt. Die Tabelle enthält vorgegebene ausgewertete Referenzwerte wässriger Lösungen bei25°C, keine eigenen Messungen: A enthält gelösten Chlorwasserstoff und hat pH2; B ist reines Wasser mit pH7; C enthält gelöstes Natriumhydroxid und hat pH12. Ordne mithilfe der pH-Skala sauer, neutral oder alkalisch zu. Gib HCl und NaOH mit Stoffnamen an und erkläre den jeweiligen Überschuss an H3O+ beziehungsweise OH− im wässrigen Modell; bei neutralem Wasser sind beide Ionenkonzentrationen gleich, nicht null. Keine logarithmische Rechnung, Mengenbestimmung oder Versuchsdurchführung. Frisch erst nach der Erklärung: Für eine unbekannte wässrige Probe ist pH4 angegeben. Klassifiziere und erkläre, ob daraus allein der Stoffname HCl oder eine bestimmte Säurestärke folgt. Einer trockenen HCl-Gasprobe wurde ohne wässrige Messbedingung ebenfalls ein pH-Wert zugewiesen: Beurteile diese Übertragung.
  - Task demand (EN): Supplied pH-scale excerpt for these aqueous samples at25°C:pH<7 acidic, pH=7 neutral, pH>7 alkaline; fractional values such as6.5 belong to the appropriate side too. Values below0 or above14 are not universally excluded. Use the supplied scale; no pH calculation or new recall card is required. The table supplies evaluated reference values for aqueous solutions at25°C, not personal measurements: A contains dissolved hydrogen chloride and has pH2; B is pure water at pH7; C contains dissolved sodium hydroxide and has pH12. Use the pH scale to classify acidic, neutral or alkaline. Give HCl and NaOH with substance names and explain excess H3O+ or OH− in the aqueous model; neutral water has equal rather than zero ion concentrations. No logarithmic calculation, amount determination or experiment. Released after the explanation: an unidentified aqueous sample has pH4. Classify it and explain whether this alone identifies HCl or an intrinsic acid strength. A dry HCl gas sample was also assigned a pH without an aqueous measurement condition: assess that transfer.
  - Expected performance (DE): A ist sauer und enthält im Modell mehr H3O+ als OH−; C ist alkalisch und enthält mehr OH− als H3O+. HCl ist Chlorwasserstoff, die wässrige Lösung heißt Salzsäure; NaOH ist Natriumhydroxid. B ist bei den vorgegebenen25°C neutral: [H3O+]=[OH−], beide ungleich null. Die Bezugnahme auf25°C begrenzt die Aussage neutral=pH7. pH4 liegt im gegebenen wässrigen Kontext auf der sauren Seite; der pH-Wert identifiziert weder die Säure noch ihre eigenständige Stärke unabhängig von Konzentration. Das trockene Gas besitzt ohne passende wässrige Bedingung keinen nach diesem Auftrag interpretierbaren pH-Wert. Die vorgegebenen Zahlen sind keine eigenen Rohdaten oder Stoffreinheitsnachweise.
  - Expected performance (EN): A is acidic, with more H3O+ than OH− in the model; C is alkaline, with more OH− than H3O+. HCl is hydrogen chloride, its aqueous solution hydrochloric acid; NaOH is sodium hydroxide. B is neutral at the specified25°C: [H3O+]=[OH−], neither zero. The stated temperature bounds neutral=pH7. The aqueous pH4 sample is acidic, but pH alone identifies neither the acid nor its intrinsic strength independently of concentration. Dry gas without the aqueous condition has no pH interpretable under this activity. Supplied numbers are not personal raw data or proof of substance purity.
  - Understanding focus (DE): Vorgegebene pH-Skala und Arrhenius-Teilchenbegründung als Teil des vollständigen vorhandenen Lernziels; keine logarithmische Rechnung, eigene Messung oder neue Abrufkarte. Die offizielle Quellenbindung bleibt auf NI begrenzt; der eigene SkillPilot-Erwerbsumfang ist separat im Autorenentscheid festgehalten. Vollständiges Kandidatenmaterial: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-two-scope-HOLDs-source-author-20261018-v1/materials/AUTHOR.two-whole-material-cases.pending.json#/rows/1/afterWholeMaterialCase
  - Understanding focus (EN): Supplied pH scale and Arrhenius species reasoning form part of the complete existing goal; no logarithmic calculation, personal measurement or new recall card. Official source attribution remains limited to NI; the own SkillPilot acquisition scope is separately stated in the author decision. Complete candidate material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-two-scope-HOLDs-source-author-20261018-v1/materials/AUTHOR.two-whole-material-cases.pending.json#/rows/1/afterWholeMaterialCase
## Page 10: Magensäurebildung und Protonenpumpen-Hemmer erklären

- Full learning-goal ID: `2fac2f0e-bccc-5511-b9fb-cc1bc3aeed00`
- Goal fingerprint: `sha256:252b07f9c1baf25eaa4c5a9d7828786a20cdf33552e7857da08f420fc0f8a4e4`
- Page fingerprint: `sha256:bdc7c0466b4fc0c1c5492892262e9baaf002e860eca5c2afde605f8a673c300e`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann die Bildung von Magensäure chemisch beschreiben und daran die Wirkweise von Protonenpumpen-Hemmern erklären, indem sie einen bereitgestellten Mechanismusbeleg auswertet, im vorgegebenen idealen Stoffmengen-, Konzentrations- und pH-Modell Protonennachlieferung von Neutralisation unterscheidet und die Grenzen gegenüber klinischen Aussagen benennt.

### Visualization

/assets/goal-visualizations/chemie/2fac2f0e-bccc-5511-b9fb-cc1bc3aeed00/2fac2f0e-bccc-5511-b9fb-cc1bc3aeed00.jpg

- original digest: `sha256:9a961959a859b14e71ccfbff06347698864f6a516796085d7ea4f98f3efb4cba`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Antazida und Sodbrennen chemisch bewerten — `126c56ef-25ac-57b6-84df-111b79d01b8d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a791c64ca757f4f663f62449bdb2a1f5990595dff0cdff65fb9bccfe22f38aa0`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Magensäure entsteht durch ATP-gekoppelten Protonentransport und getrennten Chloridtransport.
  - Essential understanding (EN): Gastric acid secretion uses ATP-coupled proton transport and separate chloride transport.
  - Observable performance (DE): Erklärt Protonenquelle, Pumpenrichtung und Ladungsausgleich im vereinfachten Modell.
  - Observable performance (EN): Explains proton source, pump direction and charge balance in the simplified model.
- `e2`
  - Essential understanding (DE): PPI hemmen die H⁺/K⁺-ATPase; vorhandene Säure wird dadurch nicht stöchiometrisch neutralisiert.
  - Essential understanding (EN): PPIs inhibit H⁺/K⁺-ATPase; they do not stoichiometrically neutralize existing acid.
  - Observable performance (DE): Leitet aus einem Mechanismusbeleg die Wirkung auf neue Säuresekretion ab.
  - Observable performance (EN): Uses a mechanism source to infer effects on new acid secretion.
- `e3`
  - Essential understanding (DE): Im vorgegebenen idealen Modell unterscheiden Anfangssäure, neue Sekretion und stöchiometrischer Verbrauch die Pumpenhemmung von Neutralisation. Die daraus berechneten Konzentrationen und pH-Werte stellen genau diese Bilanz dar; der Mechanismusbeleg stützt Zielprotein/Transport, nicht die erfundenen Modellparameter oder klinische Prognosen.
  - Essential understanding (EN): In the supplied ideal model, initial acid, new secretion and stoichiometric consumption distinguish pump inhibition from neutralization. Calculated concentrations and pH values represent that balance; the mechanism source supports target/transport, not fictional model parameters or clinical predictions.
  - Observable performance (DE): Ordnet die gegebenen Mengen chemisch selbstständig zu, bilanziert und berechnet Konzentrationen sowie pH mit den bereitgestellten Umrechnungen/Formeln und Rechner; verbindet das Ergebnis mit dem Mechanismusbeleg und begrenzt die Schlussfolgerung auf das Unterrichtsmodell.
  - Observable performance (EN): Independently allocates the given amounts by chemical role, balances and calculates concentrations and pH using supplied conversions/formulas and a calculator, links the result to the mechanism evidence and limits inference to the teaching model.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Neue Sekretion oder vorhandene Säure / New secretion versus existing acid
- `v2`: Pumpenhemmung oder Neutralisation / Pump inhibition versus neutralization

**Application cases**

- `2fac2f0e-case-1`
  - Task demand (DE): Verwende den vollständigen Lernendenkörper curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-2fac-targeted-scope-material-source-author-20261018-v1/materials/ppi-two-whole-cases.learner.DE-EN.pending.json#/cases/0 mit allen ursprünglichen Angaben sowie Rechen-/Quellenkarte. Erkläre Protonenquelle, ATP-Pumpe und getrenntenCl⁻-Transport; belege Zielprotein und Transportfolge mit NCI-URL/erstem Definitionsabsatz. Berechne beide Modell-pH-Werte selbstständig und begründe aus deiner Mengenbilanz, warum Hemmung nur neuen Zufluss verändert, keine Anfangssäure neutralisiert und keine klinische Zeitprognose liefert.
  - Task demand (EN): Use the complete learner body curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-2fac-targeted-scope-material-source-author-20261018-v1/materials/ppi-two-whole-cases.learner.DE-EN.pending.json#/cases/0 with all original givens and calculation/source cards. Explain proton source, ATP-driven pump and separateCl⁻ transport; cite target/transport using the NCI URL/first definition paragraph. Independently calculate both model-pH values and use your amount balance to explain why inhibition changes only new influx, neutralizes no initial acid and gives no clinical onset prediction.
  - Expected performance (DE): 1. CO₂/H₂O liefert über das Kohlensäuregleichgewicht H⁺/HCO₃⁻. ATP-Kopplung treibt H⁺ gegen sein Gefälle, während K⁺ zurückgetauscht wird; Cl⁻ kommt separat. Im Wasser sind hydratisierte H⁺ (vereinfacht H₃O⁺) und Cl⁻ vorhanden; HCl wird nicht als Molekülpaket gepumpt.
2. Die NCI-Definition unter der angegebenen URL beschreibt H⁺/K⁺-ATPase als Ziel und weniger H⁺-Transport ins Lumen als Folge. Die vorhandenen 10.0 mmol Säure verschwinden dadurch nicht. Recherchebeleg ist die benannte Definition/URL; dieses Paket behauptet keine tatsächliche Lernendenrecherche.
3. Ohne Hemmung: 12.0 mmol/L=0.0120 mol/L, pH 1.921. Mit Hemmung: 10.2 mmol/L=0.0102 mol/L, pH 1.991. Das Modell hemmt nur neuen Zufluss; Puffer, Entleerung, Pharmakokinetik und echte Behandlungsverläufe fehlen, daher keine klinische Zeit-/Wirksamkeitsprognose.

Die Endmenge enthält jeweils die unverbrauchte Anfangssäure; die um1,8mmol verminderte zusätzliche Sekretion ist kein Verbrauch der10,0mmol Anfangssäure. Die pH-Werte sind die vorgegebene ideale Darstellung dieser unterschiedlichen Endkonzentrationen.
  - Expected performance (EN): 1. CO₂/water supplies H⁺/HCO₃⁻ through carbonic-acid equilibrium. ATP coupling drives H⁺ against its gradient in exchange for K⁺; chloride moves separately. Aqueous acid contains hydrated H⁺ (simplified as H₃O⁺) and Cl⁻; intact HCl packets are not pumped.
2. The NCI definition at the supplied URL identifies H⁺/K⁺-ATPase and reduced H⁺ transport into the lumen. Existing 10.0 mmol acid does not disappear. The evidence location is the named definition/URL; this package claims no actual learner research.
3. Without inhibition: 0.0120 mol/L, pH 1.921. With inhibition: 0.0102 mol/L, pH 1.991. Only new influx is inhibited; buffers, emptying, pharmacokinetics and actual treatment trajectories are absent, so no clinical time/efficacy prediction follows.

Both final amounts include the unconsumed initial acid; reducing extra secretion by1.8mmol does not consume the initial10.0mmol. The pH values are the specified ideal representation of these different final concentrations.
  - Understanding focus (DE): Protonenbildung, energiegekoppelte Sekretion und stöchiometrischer Säureverbrauch sind getrennte Vorgänge. Transfer: Bei verändertem Säurezufluss erklären, warum ein Pumpenhemmer vorhandene Säure nicht direkt neutralisiert. Zwei unabhängige Nachweisschritte können in einer integrierten Leistung auftreten; die zwei Fallvarianten sind keine Pflichtaufgabenquote. Sobald alle Aspekte und selbstständiger Transfer hinreichend gezeigt sind, endet die Prüfung. Rechenfunktion und präzise Quellenfundstelle sind bereitgestellte Werkzeuge für denselben chemischen Mechanismusnachweis, keine zusätzliche allgemeine pH-/Recherchekompetenz. Die neuen vollständigen Lernenden-/Lehrerkörper sind getrennt gebunden.
  - Understanding focus (EN): Proton production, energy-coupled secretion and stoichiometric acid consumption are separate processes. Transfer: With changed acid influx explain why a pump inhibitor does not directly neutralize existing acid. Two independent demonstration steps can occur in one integrated performance; the two case variants are not a mandatory task quota. Stop assessment once all aspects and independent transfer are sufficiently shown. Calculation function and precise source location are supplied tools for the same chemical mechanism explanation, not additional general pH/research competencies. Complete learner/teacher bodies are bound separately.
- `2fac2f0e-case-2`
  - Task demand (DE): Verwende den vollständigen Lernendenkörper curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-2fac-targeted-scope-material-source-author-20261018-v1/materials/ppi-two-whole-cases.learner.DE-EN.pending.json#/cases/1 mit allen ursprünglichen Angaben sowie Rechen-/Quellenkarte. Erkläre fortgesetzte Sekretion nach Neutralisation und prüfe die BehauptungP sei eine Neutralisationsbase mit NCI-URL/erstem Definitionsabsatz. Berechne beide End-pH-Werte selbstständig, ordne Verbrauch/Zufluss den Varianten richtig zu und begründe, warum die Mengenreihenfolge keine andere PPI-Wirkweise oder Therapieentscheidung beweist.
  - Task demand (EN): Use the complete learner body curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-2fac-targeted-scope-material-source-author-20261018-v1/materials/ppi-two-whole-cases.learner.DE-EN.pending.json#/cases/1 with all original givens and calculation/source cards. Explain continuing secretion after neutralization and test the claim thatP is a neutralizing base using the NCI URL/first definition paragraph. Independently calculate both final-pH values, allocate consumption/influx correctly and explain why their amount ordering proves neither another PPI mechanism nor a treatment choice.
  - Expected performance (DE): 1. Neutralisation entfernt Lumensäure, schaltet aber nicht automatisch die ATP-gekoppelte H⁺/K⁺-ATPase ab. Neue H⁺-Sekretion mit Cl⁻-Begleittransport bleibt im Modell möglich. Die Protonenquelle und der Transport sind vom Verbrauch im Lumen getrennt.
2. Falsch: Die NCI-Definition beschreibt Hemmung des Pumpenproteins und H⁺-Transports, keine 1:1-Verbrauchsreaktion mit Lumensäure. Die Mechanismen können daher zeitlich verschiedene Modellbilanzen erzeugen. Beleg: NCI Drug Dictionary, Definition Omeprazole, angegebene URL.
3. N: (4−3+2)/0.500=6.00 mmol/L, pH 2.222. P: 4/0.500=8.00 mmol/L, pH 2.097. N hat im gewählten Zeitpunkt weniger H⁺; das ist nur die vorgegebene Bilanz. Dauer, Nebenwirkungen, Indikation und reale Sekretion sind nicht modelliert und erlauben keine Therapieempfehlung.

Die Stoffmenge wird beiN durch den angegebenen Verbrauch verkleinert und anschließend wieder erhöht; beiP bleibt die Anfangsmenge ohne neuen Zufluss erhalten. Die Reihenfolge der End-pH-Werte beschreibt diese Vorgaben, keine andere Wirkweise des Pumpenhemmers.
  - Expected performance (EN): 1. Neutralization consumes luminal acid without automatically disabling ATP-coupled H⁺/K⁺-ATPase. New H⁺ secretion with chloride transport remains possible. Proton production/transport is separate from luminal consumption.
2. False: NCI describes inhibition of pump protein/H⁺ transport, not a 1:1 acid-consumption reaction. The mechanisms can produce different time-dependent model balances. Citation: NCI Drug Dictionary, Omeprazole definition, supplied URL.
3. N: (4−3+2)/0.500=6.00 mmol/L, pH 2.222. P: 4/0.500=8.00 mmol/L, pH 2.097. N has less H⁺ at the chosen instant, solely from the supplied balance. Duration, adverse effects, indications and actual secretion are unmodeled; no treatment recommendation follows.

InN the supplied consumption reduces the amount and later influx raises it; inP the initial amount remains with no new influx. The final-pH ordering describes those givens, not a different pump-inhibitor mechanism.
  - Understanding focus (DE): Protonenbildung, energiegekoppelte Sekretion und stöchiometrischer Säureverbrauch sind getrennte Vorgänge. Transfer: Bei verändertem Säurezufluss erklären, warum ein Pumpenhemmer vorhandene Säure nicht direkt neutralisiert. Zwei unabhängige Nachweisschritte können in einer integrierten Leistung auftreten; die zwei Fallvarianten sind keine Pflichtaufgabenquote. Sobald alle Aspekte und selbstständiger Transfer hinreichend gezeigt sind, endet die Prüfung. Rechenfunktion und präzise Quellenfundstelle sind bereitgestellte Werkzeuge für denselben chemischen Mechanismusnachweis, keine zusätzliche allgemeine pH-/Recherchekompetenz. Die neuen vollständigen Lernenden-/Lehrerkörper sind getrennt gebunden.
  - Understanding focus (EN): Proton production, energy-coupled secretion and stoichiometric acid consumption are separate processes. Transfer: With changed acid influx explain why a pump inhibitor does not directly neutralize existing acid. Two independent demonstration steps can occur in one integrated performance; the two case variants are not a mandatory task quota. Stop assessment once all aspects and independent transfer are sufficiently shown. Calculation function and precise source location are supplied tools for the same chemical mechanism explanation, not additional general pH/research competencies. Complete learner/teacher bodies are bound separately.
## Page 11: Treibhauseffekt über die Strahlungsbilanz erklären

- Full learning-goal ID: `31cce65a-480a-5111-ab3c-da2feb3d4065`
- Goal fingerprint: `sha256:67367e0117facc9bb874bdd31008157bd1a2ef4c73caf360027fdf7f7c950b43`
- Page fingerprint: `sha256:dec65a46445701e9a0c7465d92a02a9b8a105ce1993350206a76d147bc6e73e6`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann den natürlichen und anthropogenen Treibhauseffekt am Energiehaushalt der Erde durch kurzwellige Einstrahlung sowie langwellige Absorption und Emission erklären und aus angegebenen Energieflüssen die anfängliche Energiebilanz und deren physikalische Bedeutung unter den jeweiligen Bedingungen herleiten.

### Visualization

/assets/goal-visualizations/chemie/31cce65a-480a-5111-ab3c-da2feb3d4065/31cce65a-480a-5111-ab3c-da2feb3d4065.png

- original digest: `sha256:addd645e105a09e354553ce7cbe7dfb92d60452053a42f6b7a45ba59ced130f2`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Klimafolgen und Minderungsentscheidungen begründen — `8e6b5d11-8c1b-5220-af20-549a870dbd8c` (page 16)

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Fossilen CO2-Anstieg mit dem Kohlenstoffkreislauf begründen — `0503c975-3934-5206-962e-b1c247de0c12` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Treibhauseffekt über die Strahlungsbilanz erklären — `42a2eaf1-fbb2-5879-b205-7f74dfb1eafa` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:97daeca63715353c302169aae71a5636602e432c612108f944064cb9dbfcce9a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `hb-greenhouse-energy-balance`
  - Essential understanding (DE): Energiehaushalt der Erde und natürlicher/anthropogener Treibhauseffekt werden durch kurzwellige Flüsse, selektive langwellige Absorption/Emission und Energieerhaltung erklärt. Fossiler Bestandszufluss und radiative Wirkung sind verknüpfte unterschiedliche Schritte; keine IR-Spiegelung, Energieerzeugung oder universelle Soforttemperatur.
  - Essential understanding (EN): Earth’s energy budget and natural/anthropogenic greenhouse effects are explained by shortwave fluxes, selective longwave absorption/emission and energy conservation. Fossil stock input and radiative effects are distinct linked steps; no IR mirror, energy creation or universal instant temperature.
  - Observable performance (DE): Die lernende Person zeichnet und erläutert die Flüsse und beide Treibhauseffekte, bilanziert die beiden Ausgangszustände und den eigenständig bearbeiteten Albedotransfer und deutet die Energiebilanz unter den angegebenen Bedingungen. Gesellschaftliche Minderungsurteile werden beim getrennten Argumentationsziel erfasst.
  - Observable performance (EN): The learner draws and explains the fluxes and both greenhouse effects, balances the two initial states and an independently handled albedo transfer, and interprets the energy balance under the stated conditions. Societal mitigation judgments are recorded under the separate argumentation goal.

**Coverage expectations**

- required expectations: `hb-greenhouse-energy-balance`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `hb-greenhouse-energy-balance-changed`: Neue Bedingungen im gebundenen Transfer selbstständig berücksichtigen. / Independently account for changed conditions in the bound transfer.

**Application cases**

- `hb199-greenhouse-energy-climate-main`
  - Task demand (DE): Bearbeite den physikalischen Hauptfall im vollständig gebundenen gemeinsamen Material; die konkrete Lernendenfassung und getrennte Lösung stehen in MATERIAL.complete-joint-cases.pending.json.
  - Task demand (EN): Handle the physical main case in the complete bound joint material; the exact learner version and separate solution are in MATERIAL.complete-joint-cases.pending.json.
  - Expected performance (DE): Die lernende Person zeichnet und erläutert die Flüsse und beide Treibhauseffekte, bilanziert die beiden Ausgangszustände und den eigenständig bearbeiteten Albedotransfer und deutet die Energiebilanz unter den angegebenen Bedingungen. Gesellschaftliche Minderungsurteile werden beim getrennten Argumentationsziel erfasst.
  - Expected performance (EN): The learner draws and explains the fluxes and both greenhouse effects, balances the two initial states and an independently handled albedo transfer, and interprets the energy balance under the stated conditions. Societal mitigation judgments are recorded under the separate argumentation goal.
  - Understanding focus (DE): Energiehaushalt der Erde und natürlicher/anthropogener Treibhauseffekt werden durch kurzwellige Flüsse, selektive langwellige Absorption/Emission und Energieerhaltung erklärt. Fossiler Bestandszufluss und radiative Wirkung sind verknüpfte unterschiedliche Schritte; keine IR-Spiegelung, Energieerzeugung oder universelle Soforttemperatur.
  - Understanding focus (EN): Earth’s energy budget and natural/anthropogenic greenhouse effects are explained by shortwave fluxes, selective longwave absorption/emission and energy conservation. Fossil stock input and radiative effects are distinct linked steps; no IR mirror, energy creation or universal instant temperature.
- `hb199-greenhouse-energy-climate-fresh`
  - Task demand (DE): Bearbeite den physikalischen Albedo-Transfer im vollständig gebundenen gemeinsamen Material; die konkrete Lernendenfassung und getrennte Lösung stehen in MATERIAL.complete-joint-cases.pending.json.
  - Task demand (EN): Handle the physical albedo transfer in the complete bound joint material; the exact learner version and separate solution are in MATERIAL.complete-joint-cases.pending.json.
  - Expected performance (DE): Die lernende Person zeichnet und erläutert die Flüsse und beide Treibhauseffekte, bilanziert die beiden Ausgangszustände und den eigenständig bearbeiteten Albedotransfer und deutet die Energiebilanz unter den angegebenen Bedingungen. Gesellschaftliche Minderungsurteile werden beim getrennten Argumentationsziel erfasst.
  - Expected performance (EN): The learner draws and explains the fluxes and both greenhouse effects, balances the two initial states and an independently handled albedo transfer, and interprets the energy balance under the stated conditions. Societal mitigation judgments are recorded under the separate argumentation goal.
  - Understanding focus (DE): Energiehaushalt der Erde und natürlicher/anthropogener Treibhauseffekt werden durch kurzwellige Flüsse, selektive langwellige Absorption/Emission und Energieerhaltung erklärt. Fossiler Bestandszufluss und radiative Wirkung sind verknüpfte unterschiedliche Schritte; keine IR-Spiegelung, Energieerzeugung oder universelle Soforttemperatur.
  - Understanding focus (EN): Earth’s energy budget and natural/anthropogenic greenhouse effects are explained by shortwave fluxes, selective longwave absorption/emission and energy conservation. Fossil stock input and radiative effects are distinct linked steps; no IR mirror, energy creation or universal instant temperature.
## Page 12: Wirkungsgrade vergleichen

- Full learning-goal ID: `3ec31fe1-e01b-5edd-bd9a-936191d67639`
- Goal fingerprint: `sha256:db73276e663e0b39427ff56b33ab08e8c27141c9e1b0a159456ade76dfe19f53`
- Page fingerprint: `sha256:397122f773db6c01a2ac486d1dac85d4ba8b8f6ffc56b68f5c579d096e890c90`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann Wirkungsgrade verschiedener Energiewandler als Verhältnis nutzbarer zu zugeführter Energie berechnen und unter offengelegten Nutzfunktionen, Energiebezugsgrößen und Systemgrenzen vergleichen.

### Visualization

/assets/goal-visualizations/chemie/3ec31fe1-e01b-5edd-bd9a-936191d67639/3ec31fe1-e01b-5edd-bd9a-936191d67639.jpg

- original digest: `sha256:0aefa276db5223539b7b5982b5488c526d6643c2ba80cebc555eb505fa3467a6`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Pflanzenölkraftstoffe einordnen — `e64a79df-7f21-5651-9b5d-e7d17580569e` (outside this book)
- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:3b7b6993a70deeba243f3b4fe22253416f91b9964ad77fbe1763630ae0e9c6e9`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Wirkungsgrad ist nutzbarerOutput geteilt durchInput an einer erklärten Grenze.
  - Essential understanding (EN): Efficiency is useful output/input at an explicit boundary.
  - Observable performance (DE): energy20-13-a: Drei verschiedene Nutzengrenzen ausdrücklich definieren. energy20-13-b: Strom-/Brennstoff- und Radarbeitsgrenzen korrekt auswählen.
  - Observable performance (EN): energy20-13-a: Explicitly define three useful-output boundaries. energy20-13-b: Select electricity/fuel/wheel-work boundaries correctly.
- `e2`
  - Essential understanding (DE): Teil- und Kettenwirkungsgrade werden auf einer deklarierten Energiebezugsbasis aus tatsächlich genutztem Output berechnet; nicht nachgefragte Wärme ist kein genutzter Dienst.
  - Essential understanding (EN): Partial and chain efficiencies use a declared energy basis and actual useful output; undemanded heat is not used service.
  - Observable performance (DE): energy20-13-a: 30/80/50% und60/85/70% korrekt berechnen. energy20-13-b: 82%,32,8%,25% und gemeinsame15kWh-Servicebasis herleiten.
  - Observable performance (EN): energy20-13-a: Correctly calculate30/80/50% and60/85/70%. energy20-13-b: Derive82%,32.8%,25% and common15kWh service.
- `e3`
  - Essential understanding (DE): Teil- und Kettenwirkungsgrade brauchen offengelegte, für den jeweiligen Vergleich passende Nutzfunktionen und Systemgrenzen. Die jeweils geltenden Unsicherheiten müssen berücksichtigt werden; sie müssen nicht gleich groß sein.
  - Essential understanding (EN): Partial and chain efficiencies require declared useful functions and system boundaries appropriate to the comparison. The applicable uncertainties must be accounted for; they need not be equal in size.
  - Observable performance (DE): energy20-13-a: Energieerhaltung, Nutzung, Vergleichsbasis und absolute Fehlergrenzen auseinanderhalten. energy20-13-b: Verschiedene Nutzfunktionen und einmalige Verlustbilanz erklären; kein Umwelturteil aus einem Teilwirkungsgrad.
  - Observable performance (EN): energy20-13-a: Separate energy conservation, service, comparison basis and absolute error bounds. energy20-13-b: Explain different service functions and count losses once; no environmental verdict from one partial efficiency.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `energy20-13-a-transfer`: Der Wärmebedarf wächst auf5MJ und die Stromnachfrage sinkt. Bestimme neu, welche Kennzahl für diesen Dienst relevant ist, statt einen festen Sieger ausηel abzuleiten. / Heat demand rises to5MJ while electricity demand falls. Reconsider the relevant metric instead of choosing a permanent winner fromηel.
- `energy20-13-b-transfer`: Strom kommt nun direkt aus einerPV-Anlage. Sage, welche bekannte Teilwirkungsgradmessung bleibt und welche Primärenergie-Konvention neu deklariert werden muss. / Electricity now comes directly fromPV. Identify the unchanged measured partial efficiency and the primary-energy convention requiring a new declaration.

**Application cases**

- `energy20-13-a`
  - Task demand (DE): Ganzes eigenes Material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-four-context-satisfied-current422-positive-and-atomic-informed-20261015-v1/materials/four-whole-cases8.targeted-informed-successor.json #energy20-13-a,sha256:e1e84ffeff7db7534372949e9cf38f5dfd2a95546fcfba6d07ee177e369098bf. Berechne elektrische, nominelle Gesamt- und bedarfsbezogene Gesamtwirkungsgrade. Vergleiche auf gemeinsamer Eingangs- oder Servicebasis und erkläre, warum WandlerB nicht85%nutzbare Energie liefert, wenn Wärmebedarf fehlt. Bestimme aus den vorgegebenen Fehlergrenzen passende Wirkungsgradintervalle; zähle den festen Wärmebedarf nicht als weitere Messunsicherheit.
  - Task demand (EN): Whole own material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-four-context-satisfied-current422-positive-and-atomic-informed-20261015-v1/materials/four-whole-cases8.targeted-informed-successor.json #energy20-13-a,sha256:e1e84ffeff7db7534372949e9cf38f5dfd2a95546fcfba6d07ee177e369098bf. Calculate electrical,nominal-total and demand-adjusted efficiencies. Compare on a common input/service basis and explain whyB does not deliver85%useful energy when heat demand is absent. Derive efficiency intervals from the given error bounds; do not treat the fixed heat demand as an extra measurement uncertainty.
  - Expected performance (DE): A:ηel30%, nominell80%, mit2MJBedarf50%. B:ηel60%, nominell85%, mit2MJBedarf70%. Bei gleichem20MJ-Eingang entsprichtA zwei Durchgängen und anderem Serviceumfang; dieser Vergleich muss ausdrücklich bezeichnet werden. Wirkungsgrade sind dimensionslose Anteile, nichtMJ-Werte; ungenutzte Wärme bleibt Energie, aber keine für diese Nachfrage genutzte Arbeit/Wärme. Unsicherheiten verhindern hier nicht den großen Stromunterschied, aber eine feinere Rangfolge braucht Fehlerrechnung und einheitliche Grenze. Bei den ausdrücklich exakten Eingängen ergeben sich für A elektrisch29–31%, nominell78–82% und bedarfsbezogen49–51%; für B59,5–60,5%,84–86% und69,5–70,5%. Für die nominale Summe werden die beiden absoluten Fehlergrenzen konservativ addiert. Bei2MJBedarf liegt selbst die kleinste verfügbare Wärme über dem Bedarf: nur die Stromfehlergrenze wirkt auf den bedarfsbezogenen Zähler. Ohne Wärmenutzung liefert B60% elektrischen Nutzen, nicht85%. Im Transfer mit5MJWärmebedarf wären bei vollständig genutztem Strom die nominalen Werte relevant; sinkende Stromnachfrage ohne Zahlen erlaubt keinen neuen eindeutigen Gesamtnutzen.
  - Expected performance (EN): A:electrical30%,nominal80%,with2MJ demand50%. B:electrical60%,nominal85%,with2MJ demand70%. Equal20MJ input means twoA cycles and a different service total,which must be declared. Efficiencies are dimensionless fractions,notMJ. Unused heat remains energy but is not useful service for this demand. Uncertainty does not erase the large electrical difference;fine rankings need error analysis/common boundaries. With the explicitly exact inputs, A has electrical29–31%, nominal78–82% and demand-adjusted49–51%; B has59.5–60.5%,84–86% and69.5–70.5%. For nominal sums, conservatively add both absolute output error bounds. At2MJ heat demand even the smallest heat output exceeds demand, so only the electricity error bound affects the demand-adjusted numerator. With no heat use, B supplies60% electrical service, not85%. In the5MJ-heat transfer, nominal values apply if all electricity is used; an unspecified reduction in electricity demand prevents a unique new useful-output result.
  - Understanding focus (DE): Der Wärmebedarf wächst auf5MJ und die Stromnachfrage sinkt. Bestimme neu, welche Kennzahl für diesen Dienst relevant ist, statt einen festen Sieger ausηel abzuleiten.
  - Understanding focus (EN): Heat demand rises to5MJ while electricity demand falls. Reconsider the relevant metric instead of choosing a permanent winner fromηel.
- `energy20-13-b`
  - Task demand (DE): Ganzes eigenes Material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-four-context-satisfied-current422-positive-and-atomic-informed-20261015-v1/materials/four-whole-cases8.targeted-informed-successor.json #energy20-13-b,sha256:e1e84ffeff7db7534372949e9cf38f5dfd2a95546fcfba6d07ee177e369098bf. Berechne Steckdose-Rad, Primärenergie-Rad und Brennstoff-Rad-Wirkungsgrad. Normiere für einen Vergleich beide auf15kWh Radarbeit. Prüfe die Behauptung „82%ist direkt mit25%vergleichbar, also ist die ganze Kette82%“. Erkläre zusätzlich, weshalb die80%/5% aus dem Übersichtskontext verschiedene Nutzfunktionen betreffen und keinen allgemeinen Anwendungssieger festlegen.
  - Task demand (EN): Whole own material curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-four-context-satisfied-current422-positive-and-atomic-informed-20261015-v1/materials/four-whole-cases8.targeted-informed-successor.json #energy20-13-b,sha256:e1e84ffeff7db7534372949e9cf38f5dfd2a95546fcfba6d07ee177e369098bf. Calculate socket-to-wheel,primary-to-wheel and fuel-to-wheel efficiencies. Normalise both to15kWh wheel work. Evaluate“82%can directly be compared with25%,so the entire chain is82%”. Also explain why the overview’s80%/5% use different service functions and cannot select a universal application winner.
  - Expected performance (DE): ηsocket=16,4/20=82%; Primärinput20/0,4=50kWh,ηgesamt32,8%. Brennstoff-Rad-Pfad15/60=25%. Für15kWhRad benötigtEV15/0,82≈18,293kWhSteckdosenstrom und45,732kWhPrimärenergie; Verbrennungspfad60kWh.82%beschreibt eine engere Grenze als25%Brennstoff-Rad. Ein anderer Strombereitstellungsweg verändert Primärenergiedefinition und Bilanz; die Daten zeigen keine vollständige Ökobilanz. Die40%-Strecke endet bereits an der Steckdose; ihre Verluste werden einmal berücksichtigt. Brennstoffgewinnung beider Wege und Herstellungsbilanzen sind nicht nachgewiesen. Die80% eines Motors und5% einer Lampe sind korrekt als numerische Anteile verschiedener definierter Nutzformen lesbar; mechanische Arbeit und Licht sind keine austauschbare Dienstleistung. Daraus folgt kein allgemeines Umwelt- oder Einsatzranking.
  - Expected performance (EN): Socket efficiency16.4/20=82%;primary input20/0.4=50kWh,total32.8%. Fuel-to-wheel path15/60=25%. For15kWh wheels,EV needs15/0.82≈18.293kWh socket and45.732kWh primary;combustion60kWh.82%uses a narrower boundary than fuel-to-wheel25%. Another electricity route changes primary-energy conventions/accounting;this is not a completeLCA. The40% path already ends at the socket, so count its losses once. Fuel extraction for both routes and manufacturing inventories are not established. A motor’s80% and a lamp’s5% are numerical fractions of different defined service forms; mechanical work and light are not interchangeable services. They establish no universal environmental or application ranking.
  - Understanding focus (DE): Strom kommt nun direkt aus einerPV-Anlage. Sage, welche bekannte Teilwirkungsgradmessung bleibt und welche Primärenergie-Konvention neu deklariert werden muss.
  - Understanding focus (EN): Electricity now comes directly fromPV. Identify the unchanged measured partial efficiency and the primary-energy convention requiring a new declaration.
## Page 13: Oxidationsprodukte von Alkanolen erklären

- Full learning-goal ID: `5851b53a-162b-5c17-9269-510ee54ad846`
- Goal fingerprint: `sha256:ebc73cd6625e4da997dff260d03f829199ffa5fcf355f8987af37ababb773106`
- Page fingerprint: `sha256:4bc7b5eb44efb21d4fe701057ee1fe8dc58a33eed531a015e479fc18fa75b460`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann die Bildung von Aldehyden, Ketonen und Carbonsäuren bei der Oxidation geeigneter Alkanole erklären.

### Visualization

/assets/goal-visualizations/chemie/5851b53a-162b-5c17-9269-510ee54ad846/5851b53a-162b-5c17-9269-510ee54ad846.jpg

- original digest: `sha256:17070847465ffc8507f9aaf0dad7722f397350015f73a7357c5e8d7620114ae5`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Aldehyd- und Keton-Nachweise durchführen und deuten — `973c12d9-d863-5292-8c68-9c80cdacf9e2` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:7c4d64ace2287bdea6c8267aa872e6d720a80cfbdd6f02cb099c8bdfd096d1e9`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `b002-5851b53a-core`
  - Essential understanding (DE): Die lokale Klasse des Alkanols bestimmt das erste Carbonylprodukt: primär zu Aldehyd, sekundär zu Keton; ein aus einem primären Alkanol hervorgegangener Aldehyd kann weiter zur Carbonsäure oxidieren.
  - Essential understanding (EN): The local alkanol class determines the first carbonyl product: primary to aldehyde, secondary to ketone; a primary-derived aldehyde may oxidize further to a carboxylic acid.
  - Observable performance (DE): Die lernende Person zeichnet zu gegebenen Alkanolstrukturen passende Produkte und erklärt mit Änderungen am OH-tragenden C, weshalb die Produkte verschieden sind.
  - Observable performance (EN): The learner draws suitable products for given alkanol structures and explains via changes at the OH-bearing carbon why the products differ.

**Coverage expectations**

- required expectations: `b002-5851b53a-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `oxidation-depth`: Primäres Alkanol mit begrenzter und weitergehender Oxidation. / A primary alkanol under limited and further oxidation.
- `alkanol-class`: Sekundäres Alkanol als neuer Vergleich ohne Carbonsäureprodukt. / A secondary alkanol as fresh comparison without a carboxylic-acid product.

**Application cases**

- `ethanol-product-sequence`
  - Task demand (DE): Vorgegebene Strukturdaten zeigen Ethanol unter begrenzter und weitergehender Oxidation. Zeichne die zwei aufeinanderfolgenden organischen Produkte und erläutere die Strukturänderung.
  - Task demand (EN): Supplied structure data show ethanol under limited and further oxidation. Draw the two consecutive organic products and explain structural change.
  - Expected performance (DE): Die lernende Person zeichnet Ethanal und danach Ethansäure, unterscheidet Aldehyd- und Carboxylgruppe und behauptet nicht, beide entstünden stets zugleich.
  - Expected performance (EN): The learner draws ethanal then ethanoic acid, distinguishes aldehyde and carboxyl groups, and does not claim both always arise together.
  - Understanding focus (DE): Reaktionsbedingungen steuern die Tiefe, die Ausgangsstruktur begrenzt Produkte.
  - Understanding focus (EN): Conditions control oxidation extent while starting structure constrains products.
- `fresh-secondary-product`
  - Task demand (DE): Ein frischer Fall oxidiert Propan-2-ol unter geeigneten milden Bedingungen. Welches organische Produkt ist plausibel und warum entsteht daraus nicht analog eine Carbonsäure mit demselben C-Gerüst?
  - Task demand (EN): A fresh case oxidizes propan-2-ol under suitable mild conditions. Which organic product is plausible, and why does an analogous carboxylic acid not arise with the same carbon skeleton?
  - Expected performance (DE): Die lernende Person zeichnet Propanon aus dem sekundären OH-C und erklärt, dass das Keton keine weitere analoge C-H-Oxidation am Carbonyl-C besitzt.
  - Expected performance (EN): The learner draws propanone from the secondary OH-bearing carbon and explains that the ketone lacks an analogous carbonyl-carbon H for further oxidation.
  - Understanding focus (DE): Neuer Alkanoltyp prüft Struktur-Produkt-Transfer.
  - Understanding focus (EN): A new alkanol type tests structure-product transfer.
## Page 14: Organische Moleküle mit Molecular Modelling darstellen

- Full learning-goal ID: `707998c1-872d-582d-a2d6-14e7d967cbdb`
- Goal fingerprint: `sha256:e9e2a83a3c62ecc8b946f688ffd7f623702d1522ef8999b4f884fc660f65e1e2`
- Page fingerprint: `sha256:f1be9effc52502dbf4b58b8e5231d129cca38c1b70af0e1e55a24bc2478539ca`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann einfache organische Moleküle durch computerbasiertes Molecular Modelling darstellen.

### Visualization

/assets/goal-visualizations/chemie/707998c1-872d-582d-a2d6-14e7d967cbdb/707998c1-872d-582d-a2d6-14e7d967cbdb.jpg

- original digest: `sha256:c21975a6960da243d5bcb233d6a82be714f0e38aa2e573bb4f79c25dc8fa91f8`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Molekülgeometrien mit dem EPA-Modell erklären — `67cd332f-9db7-50e1-87f6-172ef3714300` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Hybridisierungsmodell und Molecular Modelling vergleichen — `321d801d-28e4-54a2-bd31-8c07bda2f392` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:0bb832e7fb9ee9bb5286cdd5189b69661b4e9fae1a42b80a43ab3089aead1a8e`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `content-specific-understanding`
  - Essential understanding (DE): ComputergestützteMoleküldarstellung verlangt einen tatsächlich erzeugten/bedienten digitalenStrukturgegenstand mit korrekterAtomverknüpfung und räumlicherAnsicht;Modelldarstellung und physischeMolekülmessung bleiben getrennt.
  - Essential understanding (EN): Computer molecular modelling requires an actually created/manipulated digital structure with correct connectivity and spatial views;model display remains distinct from physical molecular measurement.
  - Observable performance (DE): Erforderlicher spätererNachweis:eigeneDigitaleingabe mitC2H6 undje4Bindungsvalenzen amC,Rotations-/Ansichtswechsel anhandeigenerDatei/Ansichten nachvollziehbar. TetraedrischelokaleStruktur wird erläutert,Kugelgrößen sindDarstellungskonventionen. Ohne tatsächlichen digitalenNachweis bleibt dieAusführung offen.
  - Observable performance (EN): Required future evidence:personal digital input withC2H6 and four bond valences perC;rotation/view changes traceable through the personal file/views.Local tetrahedral structure is explained,sphere sizes are display conventions.Without actual digital evidence execution stays open.
- `fresh-transfer-and-model-boundary`
  - Essential understanding (DE): DieSoftware kann mitfalscherBindungsordnung ein anderesMolekül generieren;eine automatischeBildausgabe ist daher kein fachlicherKorrektheitsbeleg und kein bereits erfüllterAusführungsnachweis.
  - Essential understanding (EN): Software can generate a different molecule from incorrect bond order;automatic image output therefore proves neither correctness nor already demonstrated execution.
  - Observable performance (DE): ErforderlicherNachweis:korrektes eigenbearbeitetesC3H6-Modell mitC1=C2 undMethyl-C;lokal planar amAlken,tetraedrisch amMethyl im verwendetenModell. EigeneDatei/Ansichten machenEingriff undRotation prüfbar;diePerson nenntTool-/Geometrie-Modell statt einegezeichneteLänge alsMessung auszugeben.
  - Observable performance (EN): Required evidence:personally edited correctC3H6 model withC1=C2 and a methylC;locally planar at thealkene,tetrahedral at methyl in the chosen model.Personal files/views make edits and rotation checkable;the learner states tool/geometry model instead of treating displayed lengths as measurements.
- `hb230-own-digital-aromatic-structure`
  - Essential understanding (DE): Eigene digitale Modellhandlung erschließt Aromatenstruktur;Visualisierung ist keine Messung.
  - Essential understanding (EN): Own digital modelling explores aromatic structure;visualization is not measurement.
  - Observable performance (DE): Die lernende Person bearbeitet Benzol/Toluol tatsächlich digital,prüft Valenzen/Darstellung und sichert eigene Datei/Aktionsevidenz.
  - Observable performance (EN): The learner actually edits benzene/toluene digitally,checks valences/views and retains own file/action evidence.

**Coverage expectations**

- required expectations: `content-specific-understanding`, `fresh-transfer-and-model-boundary`, `hb230-own-digital-aromatic-structure`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `specific-material-variation`: Ethan gegenüberPropen;Kugel-Stab/Kalotten,digitaleRotation und unterschiedliche lokaleGeometrie. / Ethane versuspropene;ball-and-stick/space-filling,digital rotation and different local geometries.
- `specific-model-limit`: DieSoftware kann mitfalscherBindungsordnung ein anderesMolekül generieren;eine automatischeBildausgabe ist daher kein fachlicherKorrektheitsbeleg und kein bereits erfüllterAusführungsnachweis. / Software can generate a different molecule from incorrect bond order;automatic image output therefore proves neither correctness nor already demonstrated execution.
- `hb230-own-digital-aromatic-structure-transfer`: Bedingungswechsel im vollständigen Transfer selbstständig berücksichtigen. / Independently account for changed conditions in the complete transfer.

**Application cases**

- `chem-next25-707998c1-case-1`
  - Task demand (DE): Späterer praktischerLeistungsfall mit bereitgestelltem schulischenMolecular-Modelling-Programm:ethaneCH3–CH3,zweiC/sechsH,Einfachbindungen. DieSoftware bietet3D-Rotation undKugel-Stab/Kalottenansicht. EinebloßePapierzeichnung und diehier genanntenSollbefunde ersetzen keine eigeneBedienung. Erzeuge tatsächlich denEthan-Strukturgegenstand,prüfeValenzen,rotiere ihn undwechsle dieAnsicht. Speichere dieeigeneModelldatei undzweiAnsichten mitTool-/Modellangabe;erkläre dieDarstellungsgrenze.
  - Task demand (EN): Future practical performance using supplied school molecular-modelling software:ethaneCH3–CH3,twoC/sixH,single bonds.The software offers3D rotation andball-and-stick/space-filling views.A paper drawing and the stated expected findings do not replace personal tool use. Actually create theethane structure,check valences,rotate it and change views.Save the personal model file and two views with tool/model attribution;explain the representation limit.
  - Expected performance (DE): Erforderlicher spätererNachweis:eigeneDigitaleingabe mitC2H6 undje4Bindungsvalenzen amC,Rotations-/Ansichtswechsel anhandeigenerDatei/Ansichten nachvollziehbar. TetraedrischelokaleStruktur wird erläutert,Kugelgrößen sindDarstellungskonventionen. Ohne tatsächlichen digitalenNachweis bleibt dieAusführung offen.
  - Expected performance (EN): Required future evidence:personal digital input withC2H6 and four bond valences perC;rotation/view changes traceable through the personal file/views.Local tetrahedral structure is explained,sphere sizes are display conventions.Without actual digital evidence execution stays open.
  - Understanding focus (DE): EinehübschevorgegebeneScreenshot-Lösung oderbloßeSoftwarebeschreibung belegt keine selbst ausgeführteComputer-Modellierung;keinHumanTrial wird behauptet.
  - Understanding focus (EN): A supplied attractive screenshot or software description establishes no personally executed computer modelling;no human trial is claimed.
- `chem-next25-707998c1-case-2`
  - Task demand (DE): Frischer praktischerFall:PropenCH2=CH–CH3. Einbereitgestellter fehlerhafterDatensatz setzt alleC–C-Bindungen einfach undergänzt dadurchC3H8;dieLernperson darfBindungsordnung undAnsichten ändern. Es existiert hiernochkeine Lernenden-Datei. Korrigiere tatsächlich dieDatendatei zuC3H6,prüfe dieDoppelbindung,zeige räumlicheAlken-/Methylbereiche unddokumentiere Vorher/Nachher. Begründe denVorteil digitalerRotation gegenüber einem2D-Screenshot.
  - Task demand (EN): Fresh practical case:propeneCH2=CH–CH3.A supplied faulty dataset makes allC–C bonds single and adds hydrogens,givingC3H8;the learner may edit bond order and views.No learner file yet exists here. Actually correct the dataset toC3H6,check the double bond,show spatial alkene/methyl regions and document before/after.Explain the advantage of digital rotation over a2D screenshot.
  - Expected performance (DE): ErforderlicherNachweis:korrektes eigenbearbeitetesC3H6-Modell mitC1=C2 undMethyl-C;lokal planar amAlken,tetraedrisch amMethyl im verwendetenModell. EigeneDatei/Ansichten machenEingriff undRotation prüfbar;diePerson nenntTool-/Geometrie-Modell statt einegezeichneteLänge alsMessung auszugeben.
  - Expected performance (EN): Required evidence:personally edited correctC3H6 model withC1=C2 and a methylC;locally planar at thealkene,tetrahedral at methyl in the chosen model.Personal files/views make edits and rotation checkable;the learner states tool/geometry model instead of treating displayed lengths as measurements.
  - Understanding focus (DE): DieSoftware kann mitfalscherBindungsordnung ein anderesMolekül generieren;eine automatischeBildausgabe ist daher kein fachlicherKorrektheitsbeleg und kein bereits erfüllterAusführungsnachweis.
  - Understanding focus (EN): Software can generate a different molecule from incorrect bond order;automatic image output therefore proves neither correctness nor already demonstrated execution.
- `hb230-actual-digital-aromatics-7079`
  - Task demand (DE): Lehrkraft/Lernender wählt tatsächlich verfügbaren Moleküleditor mit3D-Ansicht,kein Anbieterzwang. Benzol C6H6:sechs sp2-C im geschlossenen annähernd ebenen Ring, kontinuierliches π-System. Kekulé-/aromatische Darstellung sind Modelle desselben Moleküls. Programm kann gewählte Konventionen/optimierte Geometrien zeigen;keine reale Bindungslängenmessung. Ohne Werkzeug bleibt digitale Handlung offen.

Erstelle/prüfe Benzol tatsächlich digital;prüfe Formel/Valenzen,wechsle2D/3D,rotiere und erkläre Ringebene/π-System samt Grenzen fest eingezeichneter Doppelbindungen. Sichere eigene bearbeitbare Datei oder geeigneten Export mit nachvollziehbarer eigener Aktionsspur. Bereitgestelltes Bild ersetzt eigene Handlung nicht.

Ändere das eigene Modell tatsächlich zu Toluol C7H8;prüfe Ringkonjugation/Valenzen und irreführende räumliche Ansicht.
  - Task demand (EN): Teacher/learner chooses actually available molecular editor with3D view,no required vendor. Benzene C6H6:six sp2 carbons in approximately planar ring,continuous π system. Kekulé/aromatic depictions model the same molecule. Software shows conventions/optimized geometry,not actual measured bond lengths. Without tool,digital action remains open.

Actually create/check benzene digitally;check formula/valences,switch2D/3D,rotate and explain ring plane/π system and limits of fixed double bonds. Retain own editable file or suitable export with trace of own actions. Supplied image cannot replace own action.

Actually change own model to toluene C7H8;check ring conjugation/valences and misleading perspective.
  - Expected performance (DE): Eigenes Modell hat C6H6/korrekte Valenzen;Delokalisierung ist kein reales Bindungshinundherspringen. Werkzeug und Darstellungen begründen. Export belegt Modellhandlung,nicht Experiment/Elektronendichtemessung.

Methyl ersetzt Ring-H,Ring bleibt gekoppelt,C7H8. Rotation trennt Projektion und Modellgeometrie. Keine reale Messung behaupten.

Tatsächliche eigene Datei/Aktionen;korrekte Struktur/Modellgrenze;neuer Substitutions-/Ansichtstransfer.
  - Expected performance (EN): Own model has C6H6/correct valences;delocalization is not literal bonds jumping back and forth. Justify tool/views. Export supports modelling action,not experiment/electron-density measurement.

Methyl replaces ring H,ring stays coupled,C7H8. Rotation separates projection/model geometry. Claim no actual measurement.

Actual own file/actions;correct structure/model limits;new substitution/view transfer.
  - Understanding focus (DE): Eigene vollständige digitale Aromatendarstellung und neuer Toluol-/Ansichtsfall. Tatsächliche eigene Datei/Aktionen bleiben erforderlich; eine fertige Abbildung ersetzt sie nicht.
  - Understanding focus (EN): An independently created complete digital aromatic representation and fresh toluene/view case. Actual personal files/actions remain required; a supplied picture cannot replace them.
## Page 15: Oxidierbarkeit von Alkanolen vergleichen

- Full learning-goal ID: `858d56e0-ab8f-51a4-b07e-7d9d94cab8e2`
- Goal fingerprint: `sha256:e2abfd07efd9cb4f91c52b77916bd728f0d25c6117212ec14a7af8b988cf685f`
- Page fingerprint: `sha256:ede1e9c4ba27c83b6af0dab9c3e036620660ce3036fea7f28d652c11114233c4`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann primäre, sekundäre und tertiäre Alkanole hinsichtlich ihrer Oxidierbarkeit unter angegebenen Reaktionsbedingungen anhand der Struktur am OH-tragenden Kohlenstoffatom begründet vergleichen.

### Visualization

/assets/goal-visualizations/chemie/858d56e0-ab8f-51a4-b07e-7d9d94cab8e2/858d56e0-ab8f-51a4-b07e-7d9d94cab8e2.png

- original digest: `sha256:1237cee9427da9f28d717851ae52a2dcad39096f19adb4d868d14ab33e712307`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6180304bac6a630095bbc956afda9aa1c7f3a2362b02c2f111d2c30e12939112`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `b002-858d56e0-core`
  - Essential understanding (DE): Primäre und sekundäre Alkanole besitzen am OH-tragenden C ein H für die übliche Oxidation zu Carbonylverbindungen; tertiären fehlt es, weshalb die analoge milde Oxidation nicht greift.
  - Essential understanding (EN): Primary and secondary alkanols carry a hydrogen at the OH-bearing carbon for ordinary oxidation to carbonyl compounds; tertiary ones lack it, so the analogous mild oxidation does not occur.
  - Observable performance (DE): Die lernende Person markiert das relevante C-H in gegebenen Strukturen und ordnet primäres, sekundäres und tertiäres Alkanol unter vergleichbaren milden Bedingungen.
  - Observable performance (EN): The learner marks the relevant C-H in supplied structures and classifies primary, secondary, and tertiary alkanols under comparable mild conditions.

**Coverage expectations**

- required expectations: `b002-858d56e0-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `alkanol-class`: Primär, sekundär und tertiär werden strukturell unterschieden. / Primary, secondary, and tertiary structures are distinguished.
- `branching`: Ein frischer verzweigter Fall prüft die lokale OH-Umgebung. / A fresh branched case tests the local OH environment.

**Application cases**

- `three-propanol-classes`
  - Task demand (DE): Vergleiche Propan-1-ol, Propan-2-ol und 2-Methylpropan-2-ol unter üblichen milden Oxidationsbedingungen. Markiere das H am OH-tragenden C.
  - Task demand (EN): Compare propan-1-ol, propan-2-ol, and 2-methylpropan-2-ol under ordinary mild oxidation conditions. Mark H on the OH-bearing carbon.
  - Expected performance (DE): Die lernende Person ordnet primär, sekundär und tertiär zu; die ersten beiden besitzen das relevante C-H, das tertiäre nicht.
  - Expected performance (EN): The learner classifies primary, secondary, and tertiary; the first two have the relevant C-H, while the tertiary does not.
  - Understanding focus (DE): Lokale Struktur erklärt den Unterschied in der üblichen Oxidation.
  - Understanding focus (EN): Local structure explains the difference in ordinary oxidation.
- `fresh-branched-classification`
  - Task demand (DE): Neue Strukturkarten zeigen 3-Methylbutan-2-ol und 2-Methylbutan-2-ol. Welches lässt sich unter denselben milden Bedingungen zum Carbonyl oxidieren?
  - Task demand (EN): New structure cards show 3-methylbutan-2-ol and 2-methylbutan-2-ol. Which can be oxidized to a carbonyl under the same mild conditions?
  - Expected performance (DE): Die lernende Person erkennt beim ersten das OH-tragende sekundäre C-H und beim zweiten ein tertiäres C ohne H; sie begrenzt die Aussage auf die vorgegebenen Bedingungen.
  - Expected performance (EN): The learner identifies a secondary OH-bearing C-H in the first and a tertiary carbon without H in the second, qualifying the conclusion to the stated conditions.
  - Understanding focus (DE): Verzweigung allein ist kein Ersatz für C-H-Prüfung.
  - Understanding focus (EN): Branching alone is no substitute for checking C-H.
## Page 16: Klimafolgen und Minderungsentscheidungen begründen

- Full learning-goal ID: `8e6b5d11-8c1b-5220-af20-549a870dbd8c`
- Goal fingerprint: `sha256:61e4061ad6ddd0293d93b3fb190203896ad57c060cac0d685cc043d18430bed3`
- Page fingerprint: `sha256:99cda2a0f4d5bb958b77036f25c88be8de42f14637568cd5be28e8624e4dbc90`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann in einem materialgestützten Fall eine Minderungsentscheidung anhand offengelegter Wirksamkeits-, Zeit-, Umsetzungs- und Verteilungskriterien begründen und kommunizieren, indem sie den fossilen CO₂-Zufluss über die bekannte Strahlungswirkung mit Klimafolgen verknüpft und die Bedingungen und Aussagegrenzen der bereitgestellten Angaben berücksichtigt.

### Visualization

/assets/goal-visualizations/chemie/8e6b5d11-8c1b-5220-af20-549a870dbd8c/8e6b5d11-8c1b-5220-af20-549a870dbd8c.png

- original digest: `sha256:69f20687ee2424c525e432757bddf621594328f223590830c56b4412787fb8e8`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Treibhauseffekt über die Strahlungsbilanz erklären — `31cce65a-480a-5111-ab3c-da2feb3d4065` (page 11)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Übung: Treibhauseffekt über die Strahlungsbilanz erklären — `42a2eaf1-fbb2-5879-b205-7f74dfb1eafa` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b33b87d42db82d942dfbf6026d617284174f506f96989141f5f5469452268559`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `hb-climate-causal-mitigation-argument`
  - Essential understanding (DE): Eine fallbezogene Minderungsentscheidung verbindet bekannte Ursachen und begrenzte Folgenaussagen mit offengelegten Kriterien. Wirksamkeit, Zeithorizont, Umsetzbarkeit und Verteilung können unterschiedlich gewichtet werden; Bestandsrückgang, Einzelwetter und exakte regionale Temperatur folgen nicht schon aus weniger Zufluss oder dem vereinfachten Strahlungsschema.
  - Essential understanding (EN): A case-based mitigation decision connects known causes and bounded impact claims with explicit criteria. Effectiveness, timing, feasibility and distribution can be weighted differently; stock decline, single-weather attribution and exact regional temperature do not follow simply from less input or the simplified radiation diagram.
  - Observable performance (DE): Die lernende Person kommuniziert eine korrekte Wirkungskette und begründet mit den vollständig vorgegebenen A/B-Daten ihr begrenztes Urteil. Im geänderten Fall berücksichtigt sie selbstständig die zugleich geänderte Verteilungs- und Wirksamkeitslage und erklärt ihre überarbeitete Abwägung.
  - Observable performance (EN): The learner communicates a correct causal chain and justifies a bounded judgment using the complete supplied A/B data. In the changed case the learner independently accounts for the altered distribution and effectiveness and explains the revised weighing of criteria.

**Coverage expectations**

- required expectations: `hb-climate-causal-mitigation-argument`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `hb-climate-assumptions-distribution-effectiveness`: Vorgegebene Emissionswirkung und Zugangshürde ändern sich unabhängig; Bedingungen und Kriterien neu gewichten. / Supplied emission effectiveness and access barriers change independently; reweigh assumptions and criteria.

**Application cases**

- `hb199-climate-argument-main`
  - Task demand (DE): Bearbeite die vollständige erste Argumentationssituation in MATERIAL.complete-joint-cases.pending.json mit den dortigen Lernendenangaben, ohne vorab die getrennte Lehrerlösung zu erhalten.
  - Task demand (EN): Handle the complete initial argumentation case in MATERIAL.complete-joint-cases.pending.json using its learner givens without first receiving the separate teacher solution.
  - Expected performance (DE): Die lernende Person kommuniziert eine korrekte Wirkungskette und begründet mit den vollständig vorgegebenen A/B-Daten ihr begrenztes Urteil. Im geänderten Fall berücksichtigt sie selbstständig die zugleich geänderte Verteilungs- und Wirksamkeitslage und erklärt ihre überarbeitete Abwägung.
  - Expected performance (EN): The learner communicates a correct causal chain and justifies a bounded judgment using the complete supplied A/B data. In the changed case the learner independently accounts for the altered distribution and effectiveness and explains the revised weighing of criteria.
  - Understanding focus (DE): Eine fallbezogene Minderungsentscheidung verbindet bekannte Ursachen und begrenzte Folgenaussagen mit offengelegten Kriterien. Wirksamkeit, Zeithorizont, Umsetzbarkeit und Verteilung können unterschiedlich gewichtet werden; Bestandsrückgang, Einzelwetter und exakte regionale Temperatur folgen nicht schon aus weniger Zufluss oder dem vereinfachten Strahlungsschema.
  - Understanding focus (EN): A case-based mitigation decision connects known causes and bounded impact claims with explicit criteria. Effectiveness, timing, feasibility and distribution can be weighted differently; stock decline, single-weather attribution and exact regional temperature do not follow simply from less input or the simplified radiation diagram.
- `hb199-climate-argument-fresh`
  - Task demand (DE): Bearbeite die vollständige geänderte Argumentationssituation in MATERIAL.complete-joint-cases.pending.json mit den dortigen Lernendenangaben, ohne vorab die getrennte Lehrerlösung zu erhalten.
  - Task demand (EN): Handle the complete changed argumentation case in MATERIAL.complete-joint-cases.pending.json using its learner givens without first receiving the separate teacher solution.
  - Expected performance (DE): Die lernende Person kommuniziert eine korrekte Wirkungskette und begründet mit den vollständig vorgegebenen A/B-Daten ihr begrenztes Urteil. Im geänderten Fall berücksichtigt sie selbstständig die zugleich geänderte Verteilungs- und Wirksamkeitslage und erklärt ihre überarbeitete Abwägung.
  - Expected performance (EN): The learner communicates a correct causal chain and justifies a bounded judgment using the complete supplied A/B data. In the changed case the learner independently accounts for the altered distribution and effectiveness and explains the revised weighing of criteria.
  - Understanding focus (DE): Eine fallbezogene Minderungsentscheidung verbindet bekannte Ursachen und begrenzte Folgenaussagen mit offengelegten Kriterien. Wirksamkeit, Zeithorizont, Umsetzbarkeit und Verteilung können unterschiedlich gewichtet werden; Bestandsrückgang, Einzelwetter und exakte regionale Temperatur folgen nicht schon aus weniger Zufluss oder dem vereinfachten Strahlungsschema.
  - Understanding focus (EN): A case-based mitigation decision connects known causes and bounded impact claims with explicit criteria. Effectiveness, timing, feasibility and distribution can be weighted differently; stock decline, single-weather attribution and exact regional temperature do not follow simply from less input or the simplified radiation diagram.
## Page 17: Carbonsäurestrukturen und homologe Reihen darstellen

- Full learning-goal ID: `a3788e40-b540-5bed-be37-b33053528422`
- Goal fingerprint: `sha256:29d60ae0d0c6dd4c0e9deaa409a5d7d7322dcf90d49732ab132c3bc098c628d9`
- Page fingerprint: `sha256:8f962626d73d05488b313696ea7c3483fba5496b796b95cfeadc59b40754c187`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann die Carboxygruppe in Struktur- und Skelettformeln erkennen und Carbonsäuren über ihre Strukturformeln zu homologen Reihen ordnen und darstellen.

### Visualization

/assets/goal-visualizations/chemie/a3788e40-b540-5bed-be37-b33053528422/a3788e40-b540-5bed-be37-b33053528422.jpg

- original digest: `sha256:3e70a69c75619fdfb8cdfa185a82fed851168f704463eb1e7a1f3fae5672ab5f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Fruchtsaft zwischen Sorbinsäure und Ascorbinsäure bewerten — `00139854-e5a7-5c12-ab50-2268c80bf776` (outside this book)
- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Sauren Carbonsäurecharakter an Beobachtungen belegen — `dc146a38-994d-58ec-b6a0-5210118b93ae` (outside this book)
- Konservierungsmethoden vergleichen — `33e845cc-1a7b-50d5-99b3-8079575c4e6a` (outside this book)
- Esterbildung und Estereigenschaften erklären — `70b34ae7-4481-590c-9a02-516464750832` (outside this book)
- Acidität begründen — `ca216bc6-5205-5b46-abbd-fd5628e4ca5b` (outside this book)
- Funktionelle Gruppen qualitativ nachweisen — `3de28598-672f-5753-8a45-8f559c2f9dc2` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:0c6ad1afbb28ee5331e74570b6d3a8d1bbd4d7e7637f28b69532cc379d1b9f23`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `carboxyl-structure`
  - Essential understanding (DE): Die Carboxygruppe enthält C=O und O–H am selben Kohlenstoff; ein beliebiges O–H und eine Summenformel allein bestimmen die Stoffklasse nicht.
  - Essential understanding (EN): A carboxyl group has C=O and O–H on the same carbon; an arbitrary O–H or molecular formula alone does not establish the class.
  - Observable performance (DE): Carboxygruppen in Struktur- und Skelettformeln markieren und vollständige bindungs- und H-richtige Strukturformeln schreiben.
  - Observable performance (EN): Mark carboxyl groups in structural and skeletal formulas and draw complete structures with correct bonds and hydrogens.
- `homologous-formulas`
  - Essential understanding (DE): Benachbarte unverzweigte gesättigte Monocarbonsäuren unterscheiden sich um CH₂. Ihre Strukturformeln behalten die Carboxygruppe.
  - Essential understanding (EN): Adjacent unbranched saturated monocarboxylic acids differ by CH₂. Their structural formulas retain the carboxyl group.
  - Observable performance (DE): Eine passende homologe Reihe zeichnen und Carbonsäuren von isomeren Estern oder anderen sauerstoffhaltigen Stoffen unterscheiden.
  - Observable performance (EN): Draw a suitable homologous series and distinguish carboxylic acids from isomeric esters or other oxygen-containing compounds.

**Coverage expectations**

- required expectations: `carboxyl-structure`, `homologous-formulas`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-chemical-case`: Andere Kettenlänge und Darstellungsform; funktionelle Gruppe statt bloßer Summenformel; frischer Säure-/Ester-Isomerfall. / Change chain length and representation; functional group rather than molecular formula alone; fresh acid/ester isomer case.

**Application cases**

- `three-acids-and-ethanol`
  - Task demand (DE): Gegeben sind HCOOH, CH3COOH, CH3CH2COOH und CH3CH2OH. Markiere die Carboxygruppen und zeichne die unverzweigte gesättigte Monocarbonsäurereihe von Methan- bis Butansäure als vollständige Strukturformeln; erläutere den Unterschied zu Ethanol und den CH2-Zuwachs.
  - Task demand (EN): Given HCOOH, CH3COOH, CH3CH2COOH and CH3CH2OH, mark carboxyl groups and draw complete structural formulas for the unbranched saturated methanoic-to-butanoic-acid series; explain the ethanol difference and CH2 increments.
  - Expected performance (DE): HCOOH, CH3COOH, CH3CH2COOH und CH3CH2CH2COOH besitzen C=O und OH am selben C. Benachbarte Glieder unterscheiden sich um CH2. Ethanol hat OH ohne benachbartes Carbonyl. Alle Bindungen/H sind richtig, keine bloßen Summenformeln.
  - Expected performance (EN): HCOOH, CH3COOH, CH3CH2COOH and CH3CH2CH2COOH have C=O and OH on the same carbon. Adjacent members differ by CH2. Ethanol has OH without an adjacent carbonyl. Bonds/hydrogens are correct; molecular formulas alone do not suffice.
  - Understanding focus (DE): Kohärente strukturelle Darstellung einer homologen Stoffklasse; die getrennte Säurebeobachtungspflicht wird im neuen Atom geprüft.
  - Understanding focus (EN): Coherent structural representation of a homologous class; the separate acidic-observation duty is assessed in the new atom.
- `butanoic-acid-versus-ester`
  - Task demand (DE): Die tatsächlich vorhandene Abbildung /assets/assessment-materials/chemie/00139854-e5a7-5c12-ab50-2268c80bf776/structural-isomers.A-B.png zeigt frische Skelettformeln A und B mit C4H8O2. Zeichne vollständige Strukturformeln, markiere gegebenenfalls die Carboxygruppe und begründe die verschiedenen Stoffklassen.
  - Task demand (EN): The actual existing image /assets/assessment-materials/chemie/00139854-e5a7-5c12-ab50-2268c80bf776/structural-isomers.A-B.png gives fresh skeletal formulas A/B with C4H8O2. Draw complete structures, mark any carboxyl group and explain the different classes.
  - Expected performance (DE): A=CH3CH2CH2C(=O)OH ist Butansäure und setzt die homologe Reihe fort. B=CH3C(=O)OCH2CH3 ist ein Ester ohne Carboxy-OH. Gleiche Summenformel beweist keine gleiche Klasse; die dargestellten Bindungen entscheiden.
  - Expected performance (EN): A=CH3CH2CH2C(=O)OH is butanoic acid and continues the series. B=CH3C(=O)OCH2CH3 is an ester without carboxyl OH. Equal molecular formulas do not establish the same class; displayed bonds decide.
  - Understanding focus (DE): Frischer Isomer-/Darstellungstransfer.
  - Understanding focus (EN): Fresh isomer/representation transfer.
## Page 18: BTL-Kraftstoffe über Fischer–Tropsch erklären

- Full learning-goal ID: `abfa609d-9764-5bd8-999c-1d10a7eeac78`
- Goal fingerprint: `sha256:1f136eb60180bc36fc14415f5ed688e4033d94eaa2d73939ee85282f3f1991c5`
- Page fingerprint: `sha256:332c68f875714fd3d98c371e9fa9e275aa393df3ff26439bea6a656f9336567e`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann die Herstellung von BTL-Treibstoff aus Biomasse über Vergasung, Synthesegasreinigung/-einstellung, Fischer–Tropsch-Synthese und Gemischaufarbeitung erklären, eine angegebene ideale Synthesebilanz prüfen und den Weg von Pflanzenöl, Biodiesel und anderen Rohstoff-/Generationskontexten sowie pauschalen CO2-Neutralitätsbehauptungen abgrenzen.

### Visualization

/assets/goal-visualizations/chemie/abfa609d-9764-5bd8-999c-1d10a7eeac78/abfa609d-9764-5bd8-999c-1d10a7eeac78.png

- original digest: `sha256:08dbd30ef2329f83a0371e3e301799a4489634e1ea5ae859e7d7832e246296af`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Einfache Reaktionsgleichungen ableiten — `11bea4c6-7b8a-47e0-8293-2eb1ce34cf66` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: BTL-Kraftstoffe über Fischer–Tropsch erklären — `13e856ab-f7be-53df-a32a-6d6e8242e26c` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:31130b4d8c3a791149f82aa4f700fc85d657a510a6f92932a249b4e81e99c3b1`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `hb-btl-fischer-tropsch`
  - Essential understanding (DE): BTL verbindet Biomassevergasung, gereinigtes Synthesegas, FT-Synthese und Gemischaufarbeitung; ideale Alkanbilanz ist kein realer Selektivitäts-/LCA-Nachweis. Pflanzenöl ist ein Triglyceridgemisch; FAME-Biodiesel besteht aus Fettsäuremethylestern nach Umesterung. Der BTL-Weg erzeugt dagegen über Synthesegas eine Kohlenwasserstoffmischung. Der hier angegebene Generation-2-Reststoffkontext unterscheidet sich vom Generation-1-Kontext geeigneter Nahrungsrohstoffe; die Generation allein ist kein Klimabilanzbeleg.
  - Essential understanding (EN): BTL connects biomass gasification, cleaned syngas, FT synthesis and mixture upgrading; ideal alkane balance is no actual selectivity/LCA evidence. Plant oil is a triglyceride mixture; FAME biodiesel consists of fatty acid methyl esters produced by transesterification. BTL instead produces a hydrocarbon mixture through syngas. The stated generation-2 residue context differs from a generation-1 context using suitable food feedstocks; generation alone does not establish a climate balance.
  - Observable performance (DE): Die lernende Person erklärt die Kette, bilanziert das ideale C8-Modell mit limitierendem Stoff und unterscheidet im neuen Kohle-/H2-Fall Benennung, Stoffbilanz und Klimagrenze. Die Abgrenzung von Pflanzenöl, FAME-Biodiesel und den angegebenen Rohstoff-/Generationskontexten wird chemisch begründet.
  - Observable performance (EN): The learner explains the chain, balances ideal C8 with limiting reactant and distinguishes naming, balance and climate limits in the new coal/H2 case.The distinctions from plant oil, FAME biodiesel and the stipulated feedstock/generation contexts are chemically justified.

**Coverage expectations**

- required expectations: `hb-btl-fischer-tropsch`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `hb-btl-fischer-tropsch-changed`: Neue Bedingungen im gebundenen Transfer selbstständig berücksichtigen. / Independently account for changed conditions in the bound transfer.

**Application cases**

- `hb201-btl-fischer-tropsch-main`
  - Task demand (DE): Ausschließlich industrielles Papierschema: lignocellulosische Biomasse wie Restholz→Vergasung→rohes Synthesegas (wesentlich CO/H2 plus Verunreinigungen)→Reinigung und Einstellung H2/CO→katalytische Fischer–Tropsch-Synthese→Gemisch verschiedener Kohlenwasserstoffketten und Wasser→Abtrennung, gegebenenfalls Hydrocracken/Isomerisieren→Kraftstofffraktionen. Keine Anlage nachbauen, kein CO/H2 erzeugen. Ideales Alkanmodell n CO+(2n+1)H2→CnH2n+2+n H2O; keine gesamte Vergasungsbilanz oder Behauptung reinen FT-Produkts. Rechenfall n=8, 20 mol CO+44 mol H2, nur ideale Reaktion und vollständiger limitierender Umsatz. BTL=Biomass-to-Liquid; Kohleweg CTL, Erdgasweg GTL. BTL ist weder gepresstes Triglyceridöl noch FAME-Biodiesel. Hier Gen2-Kontext lignocellulosischer Reststoff; erste Generation meint hier Zucker/Stärke/Speiseöl geeigneter Nahrungspflanzen. LCA braucht Regeneration, Transport, Prozessenergie, Landnutzungs-/Opportunitätseffekte, Nebenprodukte und Systemgrenze.

Erkläre jeden Schritt und seine Funktion. Prüfe C/H/O-Bilanz des Octanmodells, bestimme limitierenden Stoff, ideale Produkt-/Wassermenge und H2-Rest. Begründe Gemisch/Aufarbeitung, grenze BTL von Pflanzenöl/Biodiesel und Generation1 ab. Prüfe: zweite Generation ist immer CO2-neutral.
  - Task demand (EN): Industrial paper scheme only: lignocellulosic biomass such as waste wood→gasification→raw syngas (mainly CO/H2 plus contaminants)→cleanup and H2/CO adjustment→catalytic Fischer–Tropsch synthesis→mixture of hydrocarbon chain lengths and water→separation, where needed hydrocracking/isomerization→fuel fractions. Build no plant and produce no CO/H2. Ideal alkane model n CO+(2n+1)H2→CnH2n+2+n H2O; not the complete gasification balance or a claim of pure FT product. Calculate n=8, 20 mol CO+44 mol H2, only this ideal reaction and complete limiting conversion. BTL=Biomass-to-Liquid; coal gives CTL, natural gas GTL. BTL is neither pressed triglyceride oil nor FAME biodiesel. Generation 2 here means lignocellulosic residue; first generation here means sugar/starch/edible oils of suitable food crops. LCA needs regrowth, transport, process energy, land-use/opportunity effects, coproducts and boundary.

Explain every step and purpose. Check C/H/O balance for ideal octane; determine limiting reactant, ideal product/water and residual H2. Explain mixture/upgrading, distinguish BTL from plant oil/biodiesel and generation 1. Assess: second generation is always carbon-neutral.
  - Expected performance (DE): 8 CO+17 H2→C8H18+8 H2O erhält 8 C,8 O,34 H. CO limitiert:2,5 mol ideales Octan,20 mol Wasser,42,5 mol H2 verbraucht,1,5 mol übrig. Real entstehen mehrere Kettenlängen/Nebenprodukte; selektive Ausbeute folgt daraus nicht. Reinigung schützt Katalysator; Verhältnissteuerung und Aufarbeitung liefern nutzbare Fraktionen. Nachwachsende Biomasse kann CO2 wieder aufnehmen, aber Verbrennung emittiert CO2; Gesamtneutralität ist LCA-/zeitabhängig. Pflanzenöl ist ein Triglyceridgemisch; FAME-Biodiesel besteht aus Fettsäuremethylestern nach Umesterung. Der BTL-Weg erzeugt dagegen über Synthesegas eine Kohlenwasserstoffmischung. Der hier angegebene Generation-2-Reststoffkontext unterscheidet sich vom Generation-1-Kontext geeigneter Nahrungsrohstoffe; die Generation allein ist kein Klimabilanzbeleg.

Vollständige Biomasse-/Synthesegas-/FT-/Aufarbeitungskette; korrekte Bilanz und Grenzen; BTL/FAME/CTL und Generationen; neuer limitierender Stoff; bedingte LCA.
  - Expected performance (EN): 8 CO+17 H2→C8H18+8 H2O conserves 8 C,8 O,34 H. CO limits:2.5 mol ideal octane,20 mol water,42.5 mol H2 consumed,1.5 mol left. Actual products contain several chain lengths/byproducts; selective yield does not follow. Cleanup protects catalysts; ratio adjustment/upgrading give useful fractions. Regrowing biomass can take up CO2 but combustion emits CO2; overall neutrality depends on LCA/time. Plant oil is a triglyceride mixture; FAME biodiesel consists of fatty acid methyl esters produced by transesterification. BTL instead produces a hydrocarbon mixture through syngas. The stated generation-2 residue context differs from a generation-1 context using suitable food feedstocks; generation alone does not establish a climate balance.

Complete biomass/syngas/FT/upgrading chain; correct balance/limits; BTL/FAME/CTL and generations; new limiting reactant; conditional LCA.
  - Understanding focus (DE): BTL verbindet Biomassevergasung, gereinigtes Synthesegas, FT-Synthese und Gemischaufarbeitung; ideale Alkanbilanz ist kein realer Selektivitäts-/LCA-Nachweis. Pflanzenöl ist ein Triglyceridgemisch; FAME-Biodiesel besteht aus Fettsäuremethylestern nach Umesterung. Der BTL-Weg erzeugt dagegen über Synthesegas eine Kohlenwasserstoffmischung. Der hier angegebene Generation-2-Reststoffkontext unterscheidet sich vom Generation-1-Kontext geeigneter Nahrungsrohstoffe; die Generation allein ist kein Klimabilanzbeleg.
  - Understanding focus (EN): BTL connects biomass gasification, cleaned syngas, FT synthesis and mixture upgrading; ideal alkane balance is no actual selectivity/LCA evidence. Plant oil is a triglyceride mixture; FAME biodiesel consists of fatty acid methyl esters produced by transesterification. BTL instead produces a hydrocarbon mixture through syngas. The stated generation-2 residue context differs from a generation-1 context using suitable food feedstocks; generation alone does not establish a climate balance.
- `hb201-btl-fischer-tropsch-fresh`
  - Task demand (DE): Ausschließlich industrielles Papierschema: lignocellulosische Biomasse wie Restholz→Vergasung→rohes Synthesegas (wesentlich CO/H2 plus Verunreinigungen)→Reinigung und Einstellung H2/CO→katalytische Fischer–Tropsch-Synthese→Gemisch verschiedener Kohlenwasserstoffketten und Wasser→Abtrennung, gegebenenfalls Hydrocracken/Isomerisieren→Kraftstofffraktionen. Keine Anlage nachbauen, kein CO/H2 erzeugen. Ideales Alkanmodell n CO+(2n+1)H2→CnH2n+2+n H2O; keine gesamte Vergasungsbilanz oder Behauptung reinen FT-Produkts. Rechenfall n=8, 20 mol CO+44 mol H2, nur ideale Reaktion und vollständiger limitierender Umsatz. BTL=Biomass-to-Liquid; Kohleweg CTL, Erdgasweg GTL. BTL ist weder gepresstes Triglyceridöl noch FAME-Biodiesel. Hier Gen2-Kontext lignocellulosischer Reststoff; erste Generation meint hier Zucker/Stärke/Speiseöl geeigneter Nahrungspflanzen. LCA braucht Regeneration, Transport, Prozessenergie, Landnutzungs-/Opportunitätseffekte, Nebenprodukte und Systemgrenze.

Neuer Anbieter verwendet Kohle statt Holz, nennt FT-Gemisch BTL-Diesel und klimaneutral. Eingang nun 20 mol CO+34 mol H2. Prüfe Name, ideale Bilanz und Klimafazit.
  - Task demand (EN): Industrial paper scheme only: lignocellulosic biomass such as waste wood→gasification→raw syngas (mainly CO/H2 plus contaminants)→cleanup and H2/CO adjustment→catalytic Fischer–Tropsch synthesis→mixture of hydrocarbon chain lengths and water→separation, where needed hydrocracking/isomerization→fuel fractions. Build no plant and produce no CO/H2. Ideal alkane model n CO+(2n+1)H2→CnH2n+2+n H2O; not the complete gasification balance or a claim of pure FT product. Calculate n=8, 20 mol CO+44 mol H2, only this ideal reaction and complete limiting conversion. BTL=Biomass-to-Liquid; coal gives CTL, natural gas GTL. BTL is neither pressed triglyceride oil nor FAME biodiesel. Generation 2 here means lignocellulosic residue; first generation here means sugar/starch/edible oils of suitable food crops. LCA needs regrowth, transport, process energy, land-use/opportunity effects, coproducts and boundary.

New producer uses coal instead of wood, calls its FT mixture BTL diesel and carbon-neutral. Feed is now 20 mol CO+34 mol H2. Check naming, ideal balance and climate conclusion.
  - Expected performance (DE): Kohle bedeutet CTL, nicht BTL. H2 limitiert:2 mol ideales Octan,16 mol Wasser,4 mol CO bleiben. Reales Gemisch bleibt offen. FT macht weder Rohstoff erneuerbar noch LCA automatisch neutral.

Vollständige Biomasse-/Synthesegas-/FT-/Aufarbeitungskette; korrekte Bilanz und Grenzen; BTL/FAME/CTL und Generationen; neuer limitierender Stoff; bedingte LCA.
  - Expected performance (EN): Coal means CTL, not BTL. H2 limits:2 mol ideal octane,16 mol water,4 mol CO remain. Actual mixture is unresolved. FT makes neither feedstock renewable nor LCA automatically neutral.

Complete biomass/syngas/FT/upgrading chain; correct balance/limits; BTL/FAME/CTL and generations; new limiting reactant; conditional LCA.
  - Understanding focus (DE): BTL verbindet Biomassevergasung, gereinigtes Synthesegas, FT-Synthese und Gemischaufarbeitung; ideale Alkanbilanz ist kein realer Selektivitäts-/LCA-Nachweis. Pflanzenöl ist ein Triglyceridgemisch; FAME-Biodiesel besteht aus Fettsäuremethylestern nach Umesterung. Der BTL-Weg erzeugt dagegen über Synthesegas eine Kohlenwasserstoffmischung. Der hier angegebene Generation-2-Reststoffkontext unterscheidet sich vom Generation-1-Kontext geeigneter Nahrungsrohstoffe; die Generation allein ist kein Klimabilanzbeleg.
  - Understanding focus (EN): BTL connects biomass gasification, cleaned syngas, FT synthesis and mixture upgrading; ideal alkane balance is no actual selectivity/LCA evidence. Plant oil is a triglyceride mixture; FAME biodiesel consists of fatty acid methyl esters produced by transesterification. BTL instead produces a hydrocarbon mixture through syngas. The stated generation-2 residue context differs from a generation-1 context using suitable food feedstocks; generation alone does not establish a climate balance.
## Page 19: Massenbilanzen physikalischer Trennungen prüfen

- Full learning-goal ID: `b732c780-beb8-55f3-8503-edd6b8677a3a`
- Goal fingerprint: `sha256:30945a6d116a6a0b418a89e3acaeef4f452d13bea452deed38348834987b323a`
- Page fingerprint: `sha256:863a313829617618f20153cca3f72e6a8df2bf48700622ff2c420a4e585a62de`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann bei einer physikalischen Stofftrennung aus vollständig bereitgestellten Massenangaben die Gesamtmassenbilanz für eine ausdrücklich benannte Erfassungsgrenze prüfen, scheinbare Fehlmassen bei nachgewiesenen Stoffabgängen erklären und die gewonnene Stoffmasse von einem ohne Anfangsgehalt nicht bestimmbaren Rückgewinnungsgrad unterscheiden.

### Visualization

/assets/goal-visualizations/chemie/b732c780-beb8-55f3-8503-edd6b8677a3a/b732c780-beb8-55f3-8503-edd6b8677a3a.png

- original digest: `sha256:fed2d21cb975e5091e8400eddaad78ed291c5b9b6abe89e7feb293fc024e8ee4`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Biotreibstoffwege und getrennte Trennmassenbilanz — `2339b9b1-39c8-59f1-9108-c46966ecf1fd` (outside this book)
- Stoffe isolieren, reinigen und Ausbeute beurteilen — `e7c3d20e-4b13-560b-b8ee-c5abca8cc624` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:099fe0807cb32a1af702d25b403ba056974449aed4c430b32c9eab500a5d6b0b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `data`

**Positive understanding expectations**

- `physical-separation-accounting-boundary`
  - Essential understanding (DE): Bei einer physikalischen Trennung werden vorhandene Stoffe verteilt. Vollständige Gesamtmassenbilanz und Komponentenrückgewinnung sind verschiedene Aussagen: Die erste braucht alle Stoffströme derselben Grenze, die zweite zusätzlich den ursprünglichen Komponentenbestand.
  - Essential understanding (EN): Physical separation redistributes existing substances. Complete total-mass accounting and component recovery are different claims: the former needs all material flows across one boundary; the latter also needs the original component inventory.
  - Observable performance (DE): Die lernende Person schließt die bereitgestellte 100/30/70-Bilanz, begründet eine offen erfasste Fehlmasse aus einem nachgewiesenen Abgang und lehnt eine aus dem unbekannten Anfangsölgehalt nicht ableitbare Rückgewinnungsquote ab.
  - Observable performance (EN): The learner closes the supplied 100/30/70 accounting, explains a missing mass in an open record through an identified output, and rejects a recovery fraction unsupported by the unknown initial oil inventory.

**Coverage expectations**

- required expectations: `physical-separation-accounting-boundary`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `complete-versus-open-accounting`: Vollständig erfasste Ströme versus enges Protokoll mit nachgewiesenem, nicht mitgewogenem Abgang; gleiche Trennung ohne neue Stoffe. / Complete material flows versus a narrow record with an identified unweighed output; the same physical separation without new substances.

**Application cases**

- `physical-seed-complete-accounting`
  - Task demand (DE): Eigenes ideales Papiermodell, kein Versuch: Ein vollständig erfasstes Trennsystem nimmt 100 kg trockene Saat auf und liefert 30 kg Öl und 70 kg Presskuchen. Es gibt keine weiteren Zu- oder Abgänge; Stoffe werden getrennt, keine neuen gebildet. Der ursprüngliche Saatölgehalt ist unbekannt. Benenne die Erfassungsgrenze und prüfe die Gesamtmassenbilanz. Welche Ölmasse wurde gewonnen? Kannst du bestimmen, welcher Anteil des ursprünglich enthaltenen Öls zurückgewonnen wurde? Begründe die Grenze deiner Aussage.
  - Task demand (EN): Own ideal paper model, not an experiment: a completely accounted separation system takes in 100 kg dry seed and produces 30 kg oil and 70 kg press cake. There are no other inputs or outputs; existing substances are separated without new ones forming. The original seed oil content is unknown. State the accounting boundary and check total-mass accounting. What oil mass was obtained? Can you determine what fraction of the original oil was recovered? Explain the limit of your conclusion.
  - Expected performance (DE): Für das ganze angegebene System gilt 30 + 70 = 100 kg. Die gewonnene Ölmasse beträgt 30 kg. Der ursprüngliche Ölvorrat in der Saat fehlt; daher ist der Rückgewinnungsgrad des Öls unbestimmt. 30 % bezogen auf die Saatmasse ist nicht der Rückgewinnungsgrad des anfangs vorhandenen Öls. Keine chemische Umwandlung und keinen ausgeführten Versuch behaupten.
  - Expected performance (EN): For the whole specified system, 30 + 70 = 100 kg. The recovered oil mass is 30 kg. The original oil inventory is missing, so its recovery fraction is undetermined. 30% of seed mass is not the fraction recovered from the initial oil inventory. Claim neither chemical conversion nor a performed experiment.
  - Understanding focus (DE): Eine Gesamtmassenbilanz zählt alle angegebenen Stoffströme innerhalb derselben Grenze; sie bestimmt keinen fehlenden Anfangsgehalt.
  - Understanding focus (EN): Total-mass accounting counts all supplied material flows across the same boundary; it cannot determine a missing initial content.
- `physical-separation-open-accounting-transfer`
  - Task demand (DE): Frisches eigenes Papiermodell einer rein physikalischen Trennung: 100 kg Saat gehen ein. Das enge Wiegeprotokoll erfasst 30 kg Öl und 68 kg Presskuchen. Weitere 2 kg verschütteter Presskuchen liegen ausdrücklich nachgewiesen außerhalb dieser Waagengrenze; weitere Stoffströme gibt es nicht. Eine Anbieterin behauptet: Die fehlenden 2 kg wurden chemisch vernichtet, und die 30 kg Öl beweisen vollständige Ölrückgewinnung. Prüfe beide Behauptungen, indem du enge und vollständige Erfassungsgrenze vergleichst. Der ursprüngliche Saatölgehalt bleibt unbekannt.
  - Task demand (EN): Fresh own paper model of a purely physical separation: 100 kg seed enters. The narrow weighing record includes 30 kg oil and 68 kg press cake. An additional 2 kg spilled press cake is explicitly identified outside that weighing boundary; there are no other material flows. A supplier claims that the missing 2 kg were chemically destroyed and that 30 kg oil proves complete oil recovery. Assess both claims by comparing narrow and complete accounting boundaries. The original seed oil content remains unknown.
  - Expected performance (DE): Das enge Protokoll zählt 98 kg; einschließlich der nachgewiesenen 2 kg außerhalb seiner Grenze sind 100 kg erfasst. Die Daten zeigen einen ausgelassenen Stoffstrom, keine Vernichtung und keine chemische Reaktion. 30 kg Öl ist eine gewonnene Masse; vollständige Ölrückgewinnung ist ohne ursprünglichen Ölbestand nicht belegbar. Der Bedingungswechsel ist die unvollständige Erfassung mit ausdrücklich lokalisiertem Abgang, nicht nur ein neuer Zahlenwert.
  - Expected performance (EN): The narrow record counts 98 kg; including the identified 2 kg outside its boundary accounts for 100 kg. The data show an omitted material flow, not destruction or chemical reaction. 30 kg oil is a recovered mass; complete recovery cannot be established without the original oil inventory. The changed condition is incomplete accounting with an explicitly located output, not merely new numbers.
  - Understanding focus (DE): Eine Fehlmasse im offenen Protokoll ist von Stoffvernichtung zu unterscheiden. Ein Gesamtmassenabschluss beweist keine vollständige Komponentenrückgewinnung.
  - Understanding focus (EN): Missing mass in an open record differs from destruction. Closing total-mass accounting does not prove full component recovery.
## Page 20: Brennstoffzellen verstehen

- Full learning-goal ID: `b759d50d-0e82-5b10-89a2-fe5271106e50`
- Goal fingerprint: `sha256:ba2c0bf28adf64d8b55b6e81294c95b83a23c82b4a5ba5aab87a1512556ee613`
- Page fingerprint: `sha256:5dbe75dac318c490f02b2a7a74fe97aa5690e6d71a586921087ebde07c62fbae`
- Topic path: Technische Review-Basis aller aktuellen Kompetenzen (454)

### Canonical description

Die lernende Person kann die Vorgänge an den Elektroden einer Wasserstoff-Sauerstoff-Brennstoffzelle beschreiben, die ablaufenden Reaktionen geeignet darstellen und ihren Einsatz als Energiewandler mit Wasserstoff als gespeichertem Energieträger erläutern.

### Visualization

/assets/goal-visualizations/chemie/b759d50d-0e82-5b10-89a2-fe5271106e50/b759d50d-0e82-5b10-89a2-fe5271106e50.png

- original digest: `sha256:fdb49b85bc5c1329c63024ae1cad443fd2f8b71c48cd3c07f8eb5f01162b9cc4`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Galvanische Elemente deuten — `f0939f88-a6af-5334-ac4d-5d54732af25a` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Brennstoffzellen und Verbrennungskraftwerke multiperspektivisch bewerten — `0cf2ffe1-a988-5ffb-ab37-0ac7d58b23dd` (outside this book)
- Blei-Akkumulator beschreiben — `27e4fe9b-4796-579b-8f7d-06c65fb600c0` (outside this book)
- Lithium-Ionen-Akkumulator einordnen — `6b82f80e-f493-5e6b-9709-2d4eca98c137` (outside this book)
- Brennstoffzellen bewerten — `ecce0306-13dc-5563-a097-afe69805a8d6` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:19e88e432071243096f518aa43d7bb9e71b08abf43ecafd206b1505a541145ae`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `fuel-cell-electrodes-and-storage-role`
  - Essential understanding (DE): In einer Wasserstoff-Sauerstoff-Brennstoffzelle wird Wasserstoff oxidiert und Sauerstoff reduziert; die Gesamtreaktion 2 H2 + O2 → 2 H2O setzt chemische Energie als elektrische Energie und Wärme frei. Im PEM-Modell gelangen Elektronen über den Außenkreis und Protonen durch die Membran. Die Zelle ist ein Energiewandler; der zugeführte gespeicherte Wasserstoff trägt die chemische Energie und wird mit Sauerstoff umgesetzt. Aufbauzusatz: Die vollständige Karte verbindet katalytische Elektrodenschichten, gasverteilende leitende Diffusionslagen und Gas-/Wärme-/Kontaktfunktionen der Bipolar-/Trägerplatten mit diesem selben Zellprinzip.
  - Essential understanding (EN): In a hydrogen–oxygen fuel cell hydrogen is oxidized and oxygen reduced; the overall reaction 2 H2 + O2 → 2 H2O releases chemical energy as electrical energy and heat. In the PEM model electrons travel through the external circuit and protons through the membrane. The cell is an energy converter; supplied stored hydrogen carries chemical energy and reacts with oxygen. Construction supplement: the complete card links catalytic electrode layers, conducting gas-distribution layers and gas/heat/contact roles of bipolar/support plates to this same cell principle.
  - Observable performance (DE): Die lernende Person stellt die Elektroden- und Gesamtreaktion für eine benannte Wasserstoff-Sauerstoff-Zelle geeignet dar, erklärt getrennte Ladungswege und unterscheidet in einem neuen Anwendungssystem zugeführten Wasserstoffspeicher und Energiewandler. Die Hilfegrenze des ersten Falls bleibt ausdrücklich sichtbar: vorgegebene Halbgleichungen allein belegen keine ungelenkte Formulierung. Erklärt diese Bauteilfunktionen am gegebenen vollständigen PEM-Modell kausal und wendet die Trennung von innerem Ionenweg und äußerem Elektronenweg im frischen Störfall selbst an.
  - Observable performance (EN): The learner suitably represents electrode and overall reactions for an identified hydrogen–oxygen cell, explains separate charge pathways and distinguishes supplied hydrogen storage from the energy converter in a fresh application system. The assistance boundary in the first case is explicit: supplied half-equations alone do not prove uncued formulation. Causally explains these component roles in the complete supplied PEM model and independently applies internal ion/external electron separation to the fresh failure case.

**Coverage expectations**

- required expectations: `fuel-cell-electrodes-and-storage-role`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `charge-route`: Elektronischer Außenweg und protonischer Membranweg werden mit einem fehlerhaften Kurzschlussmodell kontrastiert. / The external electron route and protonic membrane route are contrasted with an erroneous short-circuit model.
- `system-role`: Eine neue Anordnung und Unterbrechung des inneren Ionenwegs prüfen Zellfunktion sowie die Unterscheidung von Wasserstoffvorrat, zugeführten Stoffen und Energiewandler. Wasserstoffherstellung oder Akkuvergleich sind keine Pflichtleistung dieses Ziels. / A fresh layout and interrupted internal ion route probe cell function and the distinction between hydrogen stock, supplied reactants and converter. Hydrogen production or battery comparison is not a required performance for this goal.

**Application cases**

- `pem-device-and-reaction-balancing`
  - Task demand (DE): Erstelle ohne Vorlage ein einfaches PEM-Modell mit H2-Zufuhr an der Anode, O2-Zufuhr an der Kathode und Lampe im äußeren Kreis. Beschreibe Oxidation/Reduktion, ergänze H2 → 2 H+ + 2 e− und O2 + 4 H+ + 4 e− → 2 H2O zur gemeinsamen Elektronenbilanz und Gesamtreaktion. Warum dürfen die Elektronen nicht durch die Membran zur Kathode abkürzen? Ergänzend ist die vollständige PEM-Bauteilkarte verbindlich: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-recycling-atomicity-source-author-20261018-v2/materials/PEM-complete-components.learner.DE-EN.pending.json. Erkläre die dort benannten Bauteilfunktionen im selben Fall.
  - Task demand (EN): Without a template, construct a simple PEM model with H2 supplied at the anode, O2 at the cathode and a lamp in the external circuit. Explain oxidation/reduction, align H2 → 2 H+ + 2 e− and O2 + 4 H+ + 4 e− → 2 H2O to a common electron balance and derive the overall reaction. Why must electrons not bypass the lamp through the membrane? The complete PEM component card is additionally binding: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-recycling-atomicity-source-author-20261018-v2/materials/PEM-complete-components.learner.DE-EN.pending.json. Explain its named component roles within this case.
  - Expected performance (DE): Die lernende Person verdoppelt die Anodenreaktion, erhält 2 H2 + O2 → 2 H2O und erklärt H+-Transport durch PEM sowie e−-Fluss von Anode über Lampe zur Kathode. Sie bezeichnet Wasserstoff als Elektronendonator und Sauerstoff als Akzeptor und erkennt, dass ein elektronisch leitender Membranweg den nutzbaren Außenstrom kurzschließen würde. Membran trägt H+ von der Anode zur Kathode, nicht Elektronen; Katalysatorschichten ermöglichen die getrennten Elektrodenreaktionen. Gasdiffusionslagen führen Gase zu und Elektronen ab/zu; Bipolar-/Trägerplatten kontaktieren elektrisch und führen Gase/Wärme. 2H2 → 4H+ + 4e−, O2 + 4H+ + 4e− → 2H2O, gesamt 2H2 + O2 → 2H2O. Im frischen Fall fließen äußere Elektronen rechts(H2)→Verbraucher→links(O2). Ein äußeres leitendes Bauteil ersetzt keinen inneren H+-Transport: ohne inneren Ladungsausgleich kein dauernder Strom. H2-Tank speichert den Energieträger, die Zelle wandelt zugeführte chemische Energie um. Die Hilfegrenze der vorgegebenen ersten Halbgleichungen bleibt; erst die neue unabhängige Herleitung zeigt ungeführte Darstellung.
  - Expected performance (EN): The learner doubles the anode reaction, obtains 2 H2 + O2 → 2 H2O and explains H+ transport through the PEM and electron flow from anode through the lamp to cathode. They identify hydrogen as donor and oxygen as acceptor and explain that an electronically conducting membrane would bypass the useful external circuit. Membrane transports H+ from anode to cathode, not electrons; catalyst layers enable separate electrode reactions. Gas-diffusion layers supply gases and conduct electrons; bipolar/support plates provide electrical contact and gas/heat paths. 2H2 → 4H+ + 4e−, O2 + 4H+ + 4e− → 2H2O, overall 2H2 + O2 → 2H2O. Fresh external electrons go right(H2)→load→left(O2). An external conductor cannot replace internal H+ transport: no sustained current without internal charge compensation. H2 tank stores the carrier and cell converts supplied chemical energy. Supplied first half-equations retain their assistance limit; only fresh independent derivation demonstrates uncued representation.
  - Understanding focus (DE): Bilanz und getrennte Ladungswege erklären den Umwandler.
  - Understanding focus (EN): Balance and separate charge routes explain the converter.
- `fresh-reversed-layout-and-blocked-ion-route`
  - Task demand (DE): Ein unabhängiger Modellfall zeigt eine PEM-Brennstoffzelle mit Sauerstoffelektrode links, Wasserstoffelektrode rechts, H2-Tank und Außenverbraucher. Die Membran lässt nur H+-Transport zu. Stelle ohne die Gleichungen des ersten Falls die Elektroden- und Gesamtreaktion geeignet dar und leite die äußere Elektronenrichtung ab. Erkläre, was bei blockiertem H+-Weg trotz angeschlossenem Außenleiter geschieht und was nach unterbrochener H2-Zufuhr folgt. Wo liegt der gespeicherte Energieträger, welches Bauteil wandelt dessen chemische Energie um? Ergänzend ist die vollständige PEM-Bauteilkarte verbindlich: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-recycling-atomicity-source-author-20261018-v2/materials/PEM-complete-components.learner.DE-EN.pending.json. Erkläre die dort benannten Bauteilfunktionen im selben Fall.
  - Task demand (EN): An independent model shows a PEM fuel cell with the oxygen electrode on the left, hydrogen electrode on the right, an H2 tank and an external load. The membrane only permits H+ transport. Without the first case’s equations, suitably represent electrode and overall reactions and infer external electron direction. Explain what happens if H+ transport is blocked despite an intact external conductor and what follows if H2 supply stops. Where is the stored energy carrier and which component converts its chemical energy? The complete PEM component card is additionally binding: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-recycling-atomicity-source-author-20261018-v2/materials/PEM-complete-components.learner.DE-EN.pending.json. Explain its named component roles within this case.
  - Expected performance (DE): Die lernende Person formuliert H2 → 2 H+ + 2 e−, O2 + 4 H+ + 4 e− → 2 H2O und die ausgeglichene Gesamtreaktion 2 H2 + O2 → 2 H2O; eine äquivalente Darstellung mit erhaltenen Atomen und Ladungen ist zulässig. Sie leitet e−-Fluss von der rechten H2-Anode über den Verbraucher zur linken O2-Kathode ab. Ohne inneren Ladungstransport ist kein dauerhafter Außenstrom möglich. Ohne weitere H2-Zufuhr endet die Umsetzung nach Verbrauch des verbliebenen Wasserstoffs; vorhandener oder weiter zugeführter Sauerstoff muss nicht vollständig verbraucht sein. Der Tank enthält den gespeicherten Energieträger; die Zelle wandelt zugeführte chemische Energie um. Eine Erklärung der Wasserstoffherstellung oder des Akkus wird nicht verlangt. Membran trägt H+ von der Anode zur Kathode, nicht Elektronen; Katalysatorschichten ermöglichen die getrennten Elektrodenreaktionen. Gasdiffusionslagen führen Gase zu und Elektronen ab/zu; Bipolar-/Trägerplatten kontaktieren elektrisch und führen Gase/Wärme. 2H2 → 4H+ + 4e−, O2 + 4H+ + 4e− → 2H2O, gesamt 2H2 + O2 → 2H2O. Im frischen Fall fließen äußere Elektronen rechts(H2)→Verbraucher→links(O2). Ein äußeres leitendes Bauteil ersetzt keinen inneren H+-Transport: ohne inneren Ladungsausgleich kein dauernder Strom. H2-Tank speichert den Energieträger, die Zelle wandelt zugeführte chemische Energie um. Die Hilfegrenze der vorgegebenen ersten Halbgleichungen bleibt; erst die neue unabhängige Herleitung zeigt ungeführte Darstellung.
  - Expected performance (EN): The learner formulates H2 → 2 H+ + 2 e−, O2 + 4 H+ + 4 e− → 2 H2O and the balanced overall reaction 2 H2 + O2 → 2 H2O; equivalent atom- and charge-conserving representations are allowed. They infer electron flow from the right-hand H2 anode through the load to the left-hand O2 cathode. Without internal charge transport no sustained external current is possible. Without H2 resupply reaction ends after the residual hydrogen is consumed; any excess or continuing oxygen supply need not be exhausted. The tank contains the stored energy carrier; the cell converts supplied chemical energy. Explanation of hydrogen production or a battery is not required. Membrane transports H+ from anode to cathode, not electrons; catalyst layers enable separate electrode reactions. Gas-diffusion layers supply gases and conduct electrons; bipolar/support plates provide electrical contact and gas/heat paths. 2H2 → 4H+ + 4e−, O2 + 4H+ + 4e− → 2H2O, overall 2H2 + O2 → 2H2O. Fresh external electrons go right(H2)→load→left(O2). An external conductor cannot replace internal H+ transport: no sustained current without internal charge compensation. H2 tank stores the carrier and cell converts supplied chemical energy. Supplied first half-equations retain their assistance limit; only fresh independent derivation demonstrates uncued representation.
  - Understanding focus (DE): Neue Elektrodenlage, ein gestörter Ladungsweg und die begrenzte Stoffzufuhr prüfen das Zellprinzip und die Wandlerrolle unabhängig von der Lehrvorlage.
  - Understanding focus (EN): A fresh electrode layout, interrupted charge route and finite reactant supply probe cell principles and converter role independently of the teaching example.

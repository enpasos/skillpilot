# AI review input: Wirtschaftswissenschaften: historischer fachlicher Nachweis, aktueller Owner-Kontext 6

- Book ID: `de-gym-economics-current346-D45-owner-b06`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:17380060124e846f060694cc123461f16f30ee8666acdac5af9e5b158833ab59`
- Selected goals: 4

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Geldschöpfung praktisch modellieren

- Full learning-goal ID: `5b5d1d53-71c3-5fbf-b1cf-977c868b60e3`
- Goal fingerprint: `sha256:1f57567b0b43dc8362cfb290c773ce8803167cc661aac9d543bbd4f98006713c`
- Page fingerprint: `sha256:08cf2afbeebda8ed5406c2a733a392a7dd55c6e29e819bb6cc36915d46fcf1c7`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften > Q2 Wirtschaft und Wirtschaftspolitik > Preisniveaustabilität in der EWU

### Canonical description

Die lernende Person kann Geldschöpfung in Bilanzmodellen nachvollziehen.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/5b5d1d53-71c3-5fbf-b1cf-977c868b60e3/5b5d1d53-71c3-5fbf-b1cf-977c868b60e3.png

- original digest: `sha256:522a76eb125adc7bdf506d94fb110aeb40218efa64b2c8f72dd440c70a5d23d2`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Wirtschaftswissenschaften? - Relevanz und Orientierung — `6bf2d1cc-e745-50dd-a617-71c06a6c6945` (outside this book)

### Direct reverse prerequisites outside this book

- Q2: Kreditgeld, zwischenbankliche Zahlung und Tilgung bilanzieren — `0d111408-c754-50fa-8cd3-25ec75f6205f` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4c3e057ed50954013ec402ed7d9904313d9a0f89ae1a839e6bdba1d6662ea5db`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `content-specific-understanding`
  - Essential understanding (DE): Bilanzmodelle verfolgen Forderungen, Verbindlichkeiten und Reserven auf beiden Seiten eines Vorgangs. Kreditvergabe erzeugt zunächst Kreditforderung und Kundeneinlage; Zahlungen zwischen Banken verschieben Einlagen und Reserven; Kapitaltilgung kann beides wieder vermindern. Nicht jede Reservenänderung ist neue Kundengeldschöpfung.
  - Essential understanding (EN): Balance-sheet models trace claims, liabilities and reserves on both sides of transactions. Lending initially creates a loan claim and customer deposit; payments across banks shift deposits and reserves; principal repayment can reduce the loan and deposit again. Not every reserve change creates new customer money.
  - Observable performance (DE): Die Person modelliert einen neuen Geldschöpfungs- oder Tilgungsvorgang mit konsistenten Bilanzänderungen, verfolgt eine Zahlung zwischen Banken und erklärt getrennt, wie sich Einlagen, Kreditforderungen und Reserven verändern.
  - Observable performance (EN): The learner models a new creation or repayment transaction with consistent balance-sheet changes, traces a payment across banks, and separately explains changes in deposits, loan claims and reserves.

**Coverage expectations**

- required expectations: `content-specific-understanding`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `transaction`: Kreditvergabe, Zahlung zwischen Banken oder Kapitaltilgung. / Lending, interbank payment or principal repayment.
- `balance-sheet-scope`: Einzelbank, zweite Bank und Gesamtsystem. / One bank, a second bank and the banking system.

**Application cases**

- `loan-and-cross-bank-payment`
  - Task demand (DE): Eine fiktive Bank A hat ausreichend Reserven und vergibt einen Kredit von 100 an Kundin K. K zahlt 60 an einen Verkäufer bei Bank B. Zinsen und Gebühren entfallen. Zeichne die Änderungen beider Bankbilanzen und der Einlagen.
  - Task demand (EN): Fictional bank A has sufficient reserves and lends 100 to customer K, who pays 60 to a seller at bank B. Ignore interest and fees. Model both banks and customer-deposit changes.
  - Expected performance (DE): Die Person bucht bei Kreditvergabe A: Kreditforderung +100, Einlage +100. Die Zahlung vermindert As Reserven und Einlage um60 und erhöht Bs Reserven und Einlage um60; As Kredit bleibt100, Ks Einlage40, Verkäufer60. Gesamteinlagen sind100 zusätzlich, Gesamtreserven durch Zahlung unverändert; keine zweite Schöpfung von60 wird addiert.
  - Expected performance (EN): The learner records A initially gaining a loan claim100 and deposit liability100. Payment lowers A's reserves and deposit60, raising B's reserves and deposit60; A's loan remains100, K holds40 and the seller60. Total deposits rise100; payment leaves total reserves unchanged and does not create an extra60.
  - Understanding focus (DE): Zwei Banken und Geldformen ohne Doppelzählung bilanzieren.
  - Understanding focus (EN): Model two banks and money forms without double counting.
- `repay-versus-transfer`
  - Task demand (DE): Ein unabhängiger Fall zeigt bei einer Bank einen Kredit von80 und die Einlage des Schuldners von80. Er tilgt30 Kapital; danach überweist er20 an eine zweite Kundin derselben Bank. Zinsen entfallen. Modelliere beide Schritte und vergleiche Geldmengenwirkung.
  - Task demand (EN): An independent case has a bank loan80 and the debtor's deposit80. The debtor repays principal30 then transfers20 to another customer at the same bank. Ignore interest. Model both steps and compare their effects on deposit money.
  - Expected performance (DE): Die Person vermindert Kredit und Einlage bei Tilgung jeweils um30. Danach sinkt die Schuldnereinlage von50 auf30 und die zweite Einlage steigt20; Gesamteinlagen bleiben nach der Überweisung50. Innerbanklicher Transfer benötigt hier keine zwischenbankliche Reservebewegung; Tilgung und Zahlung werden nicht als gleiche Geldvernichtung behandelt.
  - Expected performance (EN): The learner lowers loan and deposit30 on repayment. The later transfer lowers the debtor's deposit50 to30 and raises the other deposit20; total deposits remain50. The within-bank transfer needs no interbank reserve movement here; repayment and payment are not treated as identical destruction of money.
  - Understanding focus (DE): Tilgung und bloße Einlagenverschiebung unterscheiden.
  - Understanding focus (EN): Distinguish repayment from a mere shift between deposits.
## Page 2: Inflation in Fallstudien

- Full learning-goal ID: `25278ecf-2e77-556e-9fe6-8f0b954cc680`
- Goal fingerprint: `sha256:bf59644e88fc3a72578732aec77affec702b43a1eca067f7c4a8a01ee05d13b9`
- Page fingerprint: `sha256:e2e9a2531338ddc8d137c818231cce9cdb741ee5d8f82fa336780fb770d783d3`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften > Q2 Wirtschaft und Wirtschaftspolitik > Preisniveaustabilität in der EWU

### Canonical description

Die lernende Person kann Inflationsszenarien historisch/aktuell analysieren.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/25278ecf-2e77-556e-9fe6-8f0b954cc680/25278ecf-2e77-556e-9fe6-8f0b954cc680.png

- original digest: `sha256:7830af5d229835813c140848b8d7116f5efbbccc6fb4001c4e87bb04db375535`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Inflationsursachen und -dynamik — `8ebbbe19-43dd-53ff-a6d0-9d94a5973616` (outside this book)

### Direct reverse prerequisites outside this book

- Inflation und Konjunktur: Modelle und historisches Dossier — `34518145-b7a5-56dc-84fc-8e8b063b2456` (outside this book)
- Inflationsdossier, gewichtete Preise und echte Deflation unterscheiden — `a56f511b-6e24-58fa-a950-974e1a3b9506` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:5d95e37bed0636749fa6c26a6167fc913f6c4e23531715667888315d1f815da1`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `content-specific-understanding`
  - Essential understanding (DE): Fallstudien verbinden datierte Preis-, Mengen-, Nachfrage- und Angebotsinformationen mit einer begründeten Erklärung. Preisniveau, Inflationsrate und Änderung der Rate unterscheiden sich; monetäre Gleichzeitigkeit allein beweist keine alleinige Ursache. Historische Quellen dürfen nicht als aktueller Messstand ausgegeben werden.
  - Essential understanding (EN): Case studies connect dated price, quantity, demand and supply information to a justified explanation. The price level, inflation rate and changes in the rate differ; monetary coincidence alone does not establish a sole cause. Historical sources must not be presented as current measurements.
  - Observable performance (DE): Die Person analysiert datierte historische oder aktuelle Inflationsmaterialien, verbindet Preisentwicklung und ursächliche Hinweise, unterscheidet konkurrierende Erklärungen und begründet Reichweite und Grenzen der Fallinterpretation. Die konkret neuen Fälle führen die im separaten Quellenrestverzeichnis benannte Teilanforderung tatsächlich aus: Gewichte, Messungsgrenze und Disinflation statt Niveauverwechslung. Anhaltende negative Rate, reale Schuldposition und bedingte mehrkausale Analyse.
  - Observable performance (EN): The learner analyses dated historical or current inflation materials, connects price developments with causal evidence, distinguishes competing explanations, and justifies the scope and limits of interpretation. The actual new cases perform the bounded facet identified in the separate source-gap list: Weights, measurement limits and disinflation rather than confusing rates and levels. Sustained negative rates, real debt positions and conditional multicausal analysis.

**Coverage expectations**

- required expectations: `content-specific-understanding`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `substantive-source-bound-variation`: Gewichte, Messungsgrenze und Disinflation statt Niveauverwechslung. / Anhaltende negative Rate, reale Schuldposition und bedingte mehrkausale Analyse. / Weights, measurement limits and disinflation rather than confusing rates and levels. / Sustained negative rates, real debt positions and conditional multicausal analysis.
- `unchanged-valid-historical-application-and-new-source-facets`: Unverändert gültiges datiertes EZB-Pandemie-/Energie-Dossier September2023 bleibt erhalten; die zwei neuen Modellfälle ergänzen gewichtete Messung/Disinflation und echte Deflation. Eine Modellfiktion wird nicht zur historischen Messung umetikettiert. / The unchanged valid dated September2023 ECB pandemic/energy dossier is retained; two new model cases add weighted measurement/disinflation and actual deflation. Fictional model data are not relabelled as historical observations.

**Application cases**

- `historical-pandemic-energy-dossier`
  - Task demand (DE): Ein bereitgestellter historischer EZB-Auszug von September2023 beschreibt die Pandemie-/Energieperiode mit Geldwachstum, Lieferproblemen, höheren Energiepreisen und tragfähiger Nachfrage. Analysiere, ob paralleles Geld- und Preiswachstum allein eine eindeutige Ursache beweist.
  - Task demand (EN): A supplied historical ECB extract from September2023 describes the pandemic/energy period through money growth, supply problems, higher energy costs and resilient demand. Analyse whether parallel money and price growth alone establish one unambiguous cause.
  - Expected performance (DE): Die Person ordnet den damaligen Zeitraum ein, erklärt kosten- und nachfrageseitige Beiträge samt möglicher gegenseitiger Verstärkung und trennt Korrelation von isoliertem Kausalnachweis. Sie vergleicht konkurrierende materialgestützte Erklärungen und nennt zusätzlich nötige Zeit-/Sektorinformationen, ohne die historische Quelle als aktuellen Inflationsbericht auszugeben.
  - Expected performance (EN): The learner identifies the historical period, explains cost and demand contributions with possible reinforcement, and separates correlation from isolated causal proof. They compare source-supported explanations and identify additional timing or sector evidence without presenting the historical text as a current inflation report.
  - Understanding focus (DE): Ein tatsächliches historisches Dossier mehrkausal und zeitgebunden analysieren.
  - Understanding focus (EN): Analyse an actual historical dossier with multiple causes and explicit timing.
- `fixed-weight-basket-inflation-disinflation-and-personal-exposure`
  - Task demand (DE): Fiktive jährliche Preisreihe mit konstantem vereinfachtem Basiswarenkorb: Energiegewicht20%, übrige breite Konsumgruppe80%. Basis beide Teilindizes100. Jahr1:Energie150, übrige100; Jahr2:Energie154,5, übrige103. Gesamtindex=0,2·Energie+0,8·übrige. Ein Haushalt verwendet stattdessen gleiche Basisgewichte50/50. Bereitgestellte Bundesbank-Methodenerläuterung definiert breite allgemeine Preissteigerung und durchschnittlichen Warenkorb; der verlinkte Artikel ist ausdrücklich von2022, seine damaligen Projektionen keine heutigen Messwerte. Analysiere Indizes/Raten, Kaufkraft und mögliche Kosten-/Nachfragedynamik; erkläre Gewichtungs-/Bezugsgrenzen.
  - Task demand (EN): Fictional annual series with a fixed simplified base basket: energy20%, broad other consumption80%, both base indices100. Year1:energy150,other100; year2:154.5/103. Total=0.2·energy+0.8·other. Another household uses base weights50/50. A supplied Bundesbank method explanation defines broad inflation and an average basket; the linked article dates from2022 and its projections are not present observations. Analyse indices/rates, purchasing power and possible cost/demand dynamics; explain weights and reference limits.
  - Expected performance (DE): Gesamtindizes110 und113,3: Raten10% und3%, Disinflation bei weiter steigendem Niveau. Persönlicher Basisindex125/128,75, nicht automatisch amtlicher VPI oder genau tatsächliche laufende Lebenshaltungskosten. Die Person erklärt gewichtete statt einfache ungewichtete Mittelung, unveränderte Mengen/Qualitätsannahmen und unterschiedliche Belastung, trennt Einzelfaktor und breitePreiswirkung sowie Ursachenhypothese von Beweis. Ein fixer Nominalbetrag verliert im allgemeinen Modell Kaufkraft; der2022er-Artikel wird nur methodisch verwendet.
  - Expected performance (EN): Total indices110/113.3 yield10%/3%: disinflation while prices keep rising. Household base indices125/128.75 are neither official CPI nor automatically exact current living costs. The learner explains weighting, fixed quantities/quality and different exposure, separates individual and broad changes and hypotheses from proof. A fixed nominal amount loses model purchasing power; the2022article supplies methods only.
  - Understanding focus (DE): Gewichte, Messungsgrenze und Disinflation statt Niveauverwechslung.
  - Understanding focus (EN): Weights, measurement limits and disinflation rather than confusing rates and levels.
- `persistent-broad-deflation-debt-and-causal-limits`
  - Task demand (DE): Anderes ausdrücklich fiktives Dossier: vergleichbarer breiter Preisindex110→108→106 über drei Jahre; Rückgang betrifft mehrere große Warengruppen, nicht nur Saisonobst. Nominaleinkommen100 und fällige nominale Schulden50 bleiben zunächst gleich; Produktion und Nachfrage fallen, zugleich verbessert sich eine gegebene Produktionstechnik. Erkläre Deflation/Kaufkraft, berechne die Raten und vergleiche Nachfrage- gegenüber Produktivitätsursachen. Prüfe ein pauschales Urteil, jede Preisabnahme sei wohlfahrtssteigernd oder beweise automatisch dieselbe Abwärtsspirale; Messqualität/Gewichte sind explizite Datenfragen.
  - Task demand (EN): Another expressly fictional dossier has comparable broad index110→108→106 over three years, across several large groups rather than seasonal fruit alone. Nominal income100 and debt due50 initially stay fixed; output/demand fall while supplied production technology improves. Explain deflation/purchasing power, calculate rates and compare demand with productivity causes. Assess claims that all price declines improve welfare or automatically establish the same downward spiral; quality measurement and weights are explicit data questions.
  - Expected performance (DE): Raten−2/110≈−1,82% und−2/108≈−1,85% bei allgemeinem anhaltendem Niveaufall: Deflation, keine bloße langsamere positiveInflation. Reale Kaufkraft fester Beträge steigt gegenüber vorherigem Niveau; reale Schuldenlast steigt ebenfalls, Einkommen/Beschäftigung können anders reagieren. Die Person analysiert konkurrierende Nachfrage-/Angebotshinweise, nennt fehlende isolierende Belege und mögliche Erwartungs-/Nachfrageverstärkung als bedingten Mechanismus. Weder ein Einzelpreisschock noch jede Produktivitätsverbesserung beweist eine deflationäreKrise.
  - Expected performance (EN): Rates−2/110≈−1.82% and−2/108≈−1.85% with broad sustained decline mean deflation, not merely slower positive inflation. Fixed sums gain purchasing power relative to the previous level, and real debt burdens also rise; income/jobs may respond differently. The learner analyses competing demand/supply evidence, identifies missing isolating evidence and explains possible expectation/demand feedback conditionally. Neither one relative price shock nor every productivity improvement proves a deflationary crisis.
  - Understanding focus (DE): Anhaltende negative Rate, reale Schuldposition und bedingte mehrkausale Analyse.
  - Understanding focus (EN): Sustained negative rates, real debt positions and conditional multicausal analysis.
## Page 3: Aktuelle Fragen zu Geld und Geldpolitik erörtern

- Full learning-goal ID: `c87e528a-cca8-5060-87cd-60adb4e54bd6`
- Goal fingerprint: `sha256:fd4d98b90b1ceb444c617ef54d5d89197b23c38d5e803676e9cca5c86f50b5e9`
- Page fingerprint: `sha256:d548f9a2cae9b8274fa9a65cd407eaac302576705d72e61872552f3895eb35f3`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften

### Canonical description

Die lernende Person kann aktuelle Fragen zu Geld und Geldpolitik fachlich fundiert erörtern.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/c87e528a-cca8-5060-87cd-60adb4e54bd6/c87e528a-cca8-5060-87cd-60adb4e54bd6.png

- original digest: `sha256:833e6bf741da0fb0e5a62a2ab34af459cca8efb808b507b1c39ae036834d2c76`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- EZB-Entscheidungen mandatsbezogen nachvollziehen — `0242e34e-e2fe-5a0f-8aed-57905c6ebb26` (outside this book)

### Direct reverse prerequisites outside this book

- Q3: Preis-, Zins- und Geldfragen vernetzt beurteilen — `4cc4ce1a-4ffc-5d42-9a2d-61b2b4db02ef` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:c0acf3a748bf8c3e26ed91d98d6df507a22d0ff1ad92d4dbcdb9f2fd980a51ea`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `content-specific-understanding`
  - Essential understanding (DE): Aktuelle Geld-/Geldpolitikfragen verbinden Geldformen, Institutionen, Transmission und unsichere wirtschaftliche Folgen. Datierte Projekt-/Entscheidungsstände und begründete Argumente sind von Prognosen und sicheren Wirkungen zu trennen.
  - Essential understanding (EN): Current money/monetary-policy issues connect money forms, institutions, transmission and uncertain effects. Dated project/decision status and reasoned arguments differ from forecasts and certainty.
  - Observable performance (DE): Die Person erörtert aktuelle Fragen mit wirtschaftlichen Mechanismen und mehreren Perspektiven, prüft Status/Datum und begründet Grenzen ohne aktuelle Daten oder Wirkungen zu erfinden.
  - Observable performance (EN): The learner discusses current issues through mechanisms and several perspectives, checks status/date and explains limits without inventing current data or effects.

**Coverage expectations**

- required expectations: `content-specific-understanding`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `question`: DigitalerEuro-Projektstand versus geldpolitischer Beschluss. / Digital-euro project status versus a monetary decision.
- `reasoning`: Zahlungsmittel/Bankrollen versus Inflation/Transmission. / Payment instruments/bank roles versus inflation/transmission.

**Application cases**

- `digital-euro-status-discussion`
  - Task demand (DE): Nutze den tatsächlichen EZB-Projektstand, gelesen08.10.2026: weitere technische Vorbereitung, mögliche2029-Ausgabe abhängig von Gesetzgebung und späterem Beschluss. Erörtere öffentliches digitales Geld gegenüber Bankeinlagen/Bargeld hinsichtlich Zahlungsfunktion, Zugänglichkeit, Finanzierung und institutionellen Grenzen.
  - Task demand (EN): Use the actual ECB project status read8October2026: further preparation and possible2029 issuance conditional on legislation/later decision. Discuss public digital money versus bank deposits/cash through payment function, access, funding and institutional limits.
  - Expected performance (DE): Die Person erklärt Unterschiede der Geldformen und bedingte Chancen/Risiken, verknüpft wirtschaftliche Funktionen mit Gestaltungsentscheidungen und unterscheidet Vorhaben von eingeführtem Zahlungsmittel. Sie behauptet weder sichere Ausgabe2029 noch automatischen Ersatz von Bargeld/Bankgeld.
  - Expected performance (EN): The learner explains money-form differences and conditional opportunities/risks, links functions to design and distinguishes project from an issued means of payment. They claim neither certain2029 issuance nor automatic replacement of cash/bank money.
  - Understanding focus (DE): Aktuelle Frage mit ehrlich begrenztem Projektstatus.
  - Understanding focus (EN): A current question with honest project-status limits.
- `dated-ecb-rate-discussion`
  - Task demand (DE): Nutze den tatsächlichen EZB-Beschluss10.09.2026 mit25Basispunkten Erhöhung und mittelfristiger Preisstabilitätsbegründung. Erörtere Wirkungskanäle und Einwände zu energiegetriebenen Preisrisiken, Wachstum und Finanzierung verschiedener Akteure; Projektionen sind ausdrücklich bedingte damalige Angaben.
  - Task demand (EN): Use the actual ECB decision10September2026 with a25-basis-point rise and medium-term price-stability rationale. Discuss channels and objections involving energy price risks, growth and funding for differing actors; projections are explicitly conditional information at that time.
  - Expected performance (DE): Die Person begründet Zins-/Nachfrage-/Erwartungskanäle sowie Grenzen gegenüber realen Angebotsengpässen und Verzögerungen. Sie diskutiert unterschiedliche Akteursfolgen und Mandat, ohne jeden Preisrückgang dem Beschluss zuzuschreiben oder einen sicheren weiteren Zinspfad zu behaupten.
  - Expected performance (EN): The learner explains interest/demand/expectation channels and limits with supply bottlenecks/time lags. They discuss differing actor effects and mandate without attributing every price fall to the decision or claiming a certain future rate path.
  - Understanding focus (DE): Andere aktuelle Frage mit begründeter Transmission und Kritik.
  - Understanding focus (EN): Another current question involving reasoned transmission and critique.
## Page 4: Komplexe gesamtwirtschaftliche Problemstellungen vernetzt bearbeiten

- Full learning-goal ID: `94fe52f5-c5f6-592b-87eb-9a983dc2d78f`
- Goal fingerprint: `sha256:06fa60111c8e7ba42de401418908a20326f00bbba996807b831dc4e720e33d9f`
- Page fingerprint: `sha256:485bd19614a6f2c87dffc12770755b8b95904ff7d7218f4ea3e7708403856d96`
- Topic path: Wirtschaftswissenschaften > Wirtschaftswissenschaften

### Canonical description

Die lernende Person kann Lösungsansätze für aktuelle komplexe gesamtwirtschaftliche Problemstellungen entwickeln und erörtern, indem sie erworbene Kompetenzen und volkswirtschaftliche Kenntnisse vernetzt anwendet.

### Visualization

/assets/goal-visualizations/wirtschaftswissenschaften/94fe52f5-c5f6-592b-87eb-9a983dc2d78f/94fe52f5-c5f6-592b-87eb-9a983dc2d78f.png

- original digest: `sha256:52f29c60d9c0679547ebf22345e6a9a40bb7469edfc62e4cf4faea1b4a675932`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Wirtschaftspolitische Maßnahmen perspektivisch bewerten — `950caf4f-1082-56bb-84db-b7174ce6c63f` (outside this book)
- EZB-Entscheidungen mandatsbezogen nachvollziehen — `0242e34e-e2fe-5a0f-8aed-57905c6ebb26` (outside this book)

### Direct reverse prerequisites outside this book

- Q3: Preis-, Zins- und Geldfragen vernetzt beurteilen — `4cc4ce1a-4ffc-5d42-9a2d-61b2b4db02ef` (outside this book)
- Q3: Vernetzte Energieentlastung und Zahlungsübergang — `8c865fee-0c51-5d1b-9309-ace5f555f96d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:decfd15d0595d71e1a657f4d1963003a5a7054a3009c5d1bb2d4b468a012735e`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `content-specific-understanding`
  - Essential understanding (DE): Aktuelle komplexe Makroprobleme verbinden Preise, Wachstum, Beschäftigung, Finanzierung und Verteilung. Ansätze benötigen vernetzte Mechanismen, Zielkonflikte und Modellgrenzen; ein Hebel liefert keine sichere Lösung.
  - Essential understanding (EN): Current complex macro problems connect prices, growth, jobs, funding and distribution. Approaches require linked mechanisms, conflicts and model limits; one instrument offers no certain solution.
  - Observable performance (DE): Die Person entwickelt und diskutiert mehrere Ansätze aus einem tatsächlich datierten Ausgangspunkt, vernetzt Modelle und beurteilt Annahmen, Betroffene und Nebenwirkungen.
  - Observable performance (EN): The learner develops/discusses several approaches from an actual dated starting point, connects models and assesses assumptions, affected groups and side effects.

**Coverage expectations**

- required expectations: `content-specific-understanding`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `problem`: Inflations-/Wachstumskonflikt versus digitale Geld-/Finanzierungsarchitektur. / Inflation/growth conflict versus digital money/funding architecture.
- `integration`: Geld-/Fiskal-/Angebotskanäle versus Teilhabe und Finanzstabilität. / Monetary/fiscal/supply channels versus inclusion and stability.

**Application cases**

- `september2026-policy-package`
  - Task demand (DE): Nutze den tatsächlichen EZB-Beschluss10.09.2026 mit25Basispunkten Erhöhung, Inflationsrisiken und bedingten Wachstumsprojektionen. Ergänze ein klar fiktives begrenztes Modellbudget und energieabhängige Haushalte/Betriebe. Entwickle zwei vernetzte Ansätze aus Geldpolitik, gezielter Entlastung und Angebotsanpassung; erörtere Wachstum, Beschäftigung, Haushalt und Umwelt.
  - Task demand (EN): Use the actual ECB decision10September2026 with a25-basis-point increase, inflation risks and conditional growth projections. Add a clearly fictional limited model budget and energy-dependent households/firms. Develop two connected monetary/targeted-relief/supply approaches; discuss growth, jobs, fiscal and environmental effects.
  - Expected performance (DE): Die Person trennt Beschluss, Modellbudget und Projektion von sicheren Wirkungen. Sie verbindet Zins-/Nachfrage-/Angebotskanäle, Finanzierung/Verteilung und Zeit, prüft Gegeneffekte und begründet bedingte Kombinationen statt einer pauschalen Zins-/Ausgabenlösung.
  - Expected performance (EN): The learner distinguishes decision, model budget and projections from certainty. They connect interest/demand/supply mechanisms, funding/distribution and time, examine opposing effects and justify conditional combinations instead of a blanket rate/spending solution.
  - Understanding focus (DE): Vernetzte Instrumente an aktuellem Problem.
  - Understanding focus (EN): Connected instruments for a current problem.
- `digital-euro-transition`
  - Task demand (DE): Nutze den am08.10.2026 tatsächlich gelesenen EZB-Projektstand: mögliche Ausgabe2029 bleibt von Gesetzgebung und späterer Entscheidung abhängig. Ein fiktives Modell vergleicht Bankgeldhaltung und begrenzte öffentliche digitale Zahlungen. Entwickle und erörtere Ansätze zu Teilhabe, Bankfinanzierung, Stabilität und Übergangskosten; verknüpfe Geld-/Kreislaufmodelle mit Regeln.
  - Task demand (EN): Use the ECB project status actually read on8October2026: possible2029 issuance remains conditional on legislation and later decision. A fictional model compares bank holdings and limited public digital payments. Develop/discuss approaches to inclusion, bank funding, stability and transition costs, linking money/circular-flow models to rules.
  - Expected performance (DE): Die Person verbindet Zahlungs-/Finanzierungsänderung mit wirtschaftlichen und institutionellen Voraussetzungen, nennt mehrere Optionen und prüft Verteilung/Stabilität. Sie unterstellt weder eingeführten digitalen Euro noch automatische Bankverluste oder risikolose Innovation; Modellfolgen bleiben bedingt.
  - Expected performance (EN): The learner connects payment/funding changes with economic/institutional conditions, identifies options and examines distribution/stability. They assume neither an issued digital euro nor automatic bank losses or risk-free innovation; model effects remain conditional.
  - Understanding focus (DE): Anderes aktuelles Problem mit Finanzierungs-/Regelbezug.
  - Understanding focus (EN): A changed current problem involving funding/rules.

# AI review input: Chemie: gezielte Nachprüfung aktueller Kontextänderungen

- Book ID: `chemie-post-ci-context-01`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:93c66863a16c6aa3901a02204983dc2804cb5f29ade70132f2dfc173eea61ae4`
- Selected goals: 20

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Allgemeine Sicherheitsregeln im Chemielabor anwenden

- Full learning-goal ID: `13d4f336-ab16-54a7-9479-c920b458f385`
- Goal fingerprint: `sha256:9216feff81724402c3c0d53f5d31a75c9c36a13467a05ac8b0d2e58cef9f813f`
- Page fingerprint: `sha256:2125f582ed6cd0d83ffa4be15b2e1e7836cd6635d62b94a1249a03229d74d6da`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann grundlegende Sicherheitsregeln im Chemielabor situationsbezogen anwenden.

### Visualization

/assets/goal-visualizations/chemie/13d4f336-ab16-54a7-9479-c920b458f385/13d4f336-ab16-54a7-9479-c920b458f385.jpg

- original digest: `sha256:f8dba4be52feceafcd6c283ed8481c7bde5a69b96b2b2c97393a16564a746f55`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Lösungen nach Arbeitsanweisung herstellen — `1351706f-4ea6-56e9-951b-87b24cbcdee8` (outside this book)
- Biobasierte PLA-Proben kontrolliert untersuchen — `6fa55d29-9d79-5b80-92f2-01f9bb64ef35` (outside this book)
- Temperaturabhängige Löslichkeit und Kristallbildung untersuchen — `8b2d351e-e44f-5385-9b89-13ef54b5918f` (outside this book)
- Gleichgewichtsdynamik nachweisen — `81373fb7-2a4a-5b2c-acd0-b4e775acaa65` (outside this book)
- Planare chromatografische Trennungen durchführen und auswerten — `978a6f25-0601-5457-9211-aab206c95603` (outside this book)
- Saure, alkalische und neutrale Lösungen unterscheiden — `d2ccd1d5-56f7-583f-9724-e97441367f91` (outside this book)
- Säure-Base-Titrationen planen — `02634fdd-c8ba-591a-b240-77129b1bebb8` (outside this book)
- Starke Säuren mittels eigener digitaler pH-Titration bestimmen — `4bd54a18-8dd2-59db-bddf-b4c34a10ba79` (outside this book)
- Komplexometrische EDTA-Titrationen durchführen — `e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f` (outside this book)
- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e598d69823c5983794d54da0fc6196c66f89f177a2585cd99eea8d86e0e356e0`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `experiment`

**Positive understanding expectations**

- `b004-13d4f336-core`
  - Essential understanding (DE): Schutzregeln haben konkrete Anlässe: Augenschutz gegen Spritzer, freie Arbeitsfläche und geeignete Kennzeichnung gegen Verwechslung sowie Lehrkraftanweisung bei Unsicherheit oder Zwischenfall. Sicheres Arbeiten beginnt vor der Materialhandlung.
  - Essential understanding (EN): Safety rules address particular risks: eye protection for splashes, clear workspace and labeling against mix-ups, and teacher direction when uncertain or after an incident. Safe work starts before handling materials.
  - Observable performance (DE): Die lernende Person bereitet an einem ungefährlichen, lehrkraftbetreuten Modellplatz ihren Arbeitsplatz vor, prüft Brille und Beschriftung und meldet einen unklaren Behälter, statt eigenmächtig weiterzumachen.
  - Observable performance (EN): At a harmless teacher-supervised model station, the learner prepares the workspace, checks eye protection and labeling, and reports an unclear vessel rather than proceeding independently.

**Coverage expectations**

- required expectations: `b004-13d4f336-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `phase`: Vorbereitung und Reaktion auf einen Zwischenfall werden getrennt geprüft. / Preparation and response to an incident are tested separately.
- `risk`: Verwechslung und Spritzer erfordern unterschiedliche unmittelbare Handlungen. / Mix-up and splash call for different immediate actions.

**Application cases**

- `supervised-water-model-station`
  - Task demand (DE): An einem lehrkraftbetreuten Modellplatz stehen nur Wasser, zwei klar beschriftete Becher und ein unbeschrifteter Becher. Zeige vor Beginn eine sichere Vorbereitung: Schutzbrille korrekt tragen, Arbeitsplatz freimachen, Beschriftung prüfen und den unklaren Becher der Lehrkraft melden; keine Chemikalien oder Flammen.
  - Task demand (EN): At a teacher-supervised model station there are only water, two labeled beakers and one unlabeled beaker. Demonstrate safe preparation: wear eye protection correctly, clear the workspace, check labels and report the unlabeled beaker to the teacher; no chemicals or flames.
  - Expected performance (DE): Die lernende Person führt die sicheren Vorbereitungsschritte tatsächlich aus, verwendet den unbeschrifteten Becher nicht und erläutert die Verwechslungsgefahr.
  - Expected performance (EN): The learner actually performs the safe preparation, does not use the unlabeled beaker and explains the mix-up risk.
  - Understanding focus (DE): Beobachtete Anwendung statt Regelaufsagen.
  - Understanding focus (EN): Observed application rather than rule recitation.
- `fresh-splash-response-card`
  - Task demand (DE): Eine neue Situationskarte schildert einen unerwarteten Spritzer einer unbekannten Lösung bei einer lehrkraftgeleiteten Schulübung auf Arbeitsfläche und Kleidung; Hautkontakt ist möglich. Entscheide die sofortigen sicheren Schritte für die betroffene Person und begründe, weshalb Du nicht eigenmächtig weiterarbeitest.
  - Task demand (EN): A fresh situation card describes an unexpected splash of an unknown solution during a teacher-run school exercise onto the bench and clothing; skin contact is possible. Decide immediate safe steps for the affected person and why you do not continue on your own.
  - Expected performance (DE): Die lernende Person stoppt die Arbeit, informiert sofort die Lehrkraft und benennt mögliche Haut- und Kleidungskontamination. Betroffene Haut wird unverzüglich mit fließendem Wasser gespült; kontaminierte Kleidung wird unter Lehrkraft-/Ersthelferanweisung zügig abgelegt, ohne weitere Haut zu benetzen. Sie befolgt die örtliche Erste-Hilfe-Regelung und veranlasst nötige weitere Hilfe; sie improvisiert weder Neutralisation noch Entsorgung.
  - Expected performance (EN): The learner stops work, immediately alerts the teacher and identifies possible skin and clothing contamination. Affected skin is promptly rinsed with running water; contaminated clothing is removed promptly under teacher/first-aider direction without spreading contamination to skin. They follow local first-aid procedures and obtain further help as needed; they do not improvise neutralization or disposal.
  - Understanding focus (DE): Neue Kontamination prüft sichere Sofortreaktion, einschließlich Haut und Kleidung, nicht bloß Abstand und Meldung.
  - Understanding focus (EN): A new contamination tests immediate safe action, including skin and clothing, not merely distance and reporting.
## Page 2: Waschvorgänge beeinflussen

- Full learning-goal ID: `1837690e-cfb1-5b1c-96c8-0fb40d6d5d69`
- Goal fingerprint: `sha256:f5dc96676c6951d7d1cef87060a5ce7f1aebb7bf77f2fd772c4b3840ff71499d`
- Page fingerprint: `sha256:0c0bd739a70720c083e669a126ff0decba98da6e54d085e944fa91e67c808bd2`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann den Einfluss von Temperatur, Wasserhärte und Tensidkonzentration auf die Waschwirkung erklären und dabei Dispergiervermögen, Micellenbildung und die Bildung schwer löslicher Kalkseifen berücksichtigen.

### Visualization

/assets/goal-visualizations/chemie/1837690e-cfb1-5b1c-96c8-0fb40d6d5d69/1837690e-cfb1-5b1c-96c8-0fb40d6d5d69.jpg

- original digest: `sha256:eaeda78a62e9842d1d4e9fde9950566be6b47728d379cb97f75086e682c0d333`
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
- Wasserhärte unterscheiden und Enthärtung erklären (LK) — `8a491e3b-5d0b-51d3-9b14-0977ec035dd6` (outside this book)
- Biologische Abbaubarkeit — `e9ea1606-5018-5a36-9ac2-8359747a65d4` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:83306e7f0d60ebf6530247f4dafa459fd5d9caafcbe8051f3bf265e0ae460546`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `concentration-dispersion`
  - Essential understanding (DE): Tensidkonzentration beeinflusst Grenzflächenbelegung, Micellenbildung und Dispergierung. Mehr Tensid oder mehr Schaum bedeutet nicht unbegrenzt bessere Reinigung.
  - Essential understanding (EN): Surfactant concentration affects interfacial adsorption, micelle formation and dispersion. More surfactant or foam does not mean indefinitely better cleaning.
  - Observable performance (DE): Bereitgestellte Konzentrations-/Dispersionsdaten unter vorgegebenen Bedingungen erklären und sinnvolle Dosierungen begründen.
  - Observable performance (EN): Explain supplied concentration/dispersion data under specified conditions and justify sensible doses.
- `hardness-temperature-factors`
  - Essential understanding (DE): Calcium- und Magnesiumionen können mit Seifen schwer lösliche Kalkseifen bilden und verfügbare Seifenanionen vermindern. Temperatur beeinflusst Lösung, Beweglichkeit und die jeweils gegebenen Stoffeigenschaften; ihre Wirkung ist nicht universell monoton.
  - Essential understanding (EN): Calcium and magnesium can precipitate poorly soluble soaps and reduce available soap anions. Temperature affects dissolution, motion and specified material properties; its effect is not universally monotonic.
  - Observable performance (DE): Härte und Temperatur von Konzentration als unabhängige Faktoren unterscheiden, Calciumseifenbildung bilanzieren und einen kontrollierten Vergleich deuten.
  - Observable performance (EN): Separate hardness and temperature from concentration, balance calcium-soap formation and interpret a controlled comparison.

**Coverage expectations**

- required expectations: `concentration-dispersion`, `hardness-temperature-factors`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-chemical-case`: Neue kontrollierte Kombinationen von Härte, Temperatur und Konzentration; Daten erklären und jeweils nur einen Faktor variieren. / Use fresh controlled combinations of hardness, temperature and concentration; explain data and vary one factor at a time.

**Application cases**

- `soap-hardness-concentration-series`
  - Task demand (DE): Gegeben sind gleiche Ölverschmutzung und Temperatur. In weichem Wasser verbessert eine Seifenkonzentrationsreihe die Dispersion bis zu einem Plateau; bei Ca²⁺ treten Niederschlag und schwächere Dispersion auf. Erkläre Micellen/Dispergierung und formuliere die Calciumseifenreaktion.
  - Task demand (EN): At equal oil contamination and temperature, a soft-water soap concentration series improves dispersion up to a plateau; Ca²⁺ produces precipitate and poorer dispersion. Explain micelles/dispersion and write calcium-soap formation.
  - Expected performance (DE): 2 RCOO⁻ + Ca²⁺ → Ca(RCOO)₂(s) ist ladungs- und stoffbilanziert. Präzipitation vermindert verfügbare Seife. Die Konzentrationsdaten passen zu Grenzflächenbelegung/Micellen; ein Plateau und Schaum allein sind kein Beleg unbegrenzter Reinigung.
  - Expected performance (EN): 2 RCOO⁻ + Ca²⁺ → Ca(RCOO)₂(s) balances charge and atoms. Precipitation reduces available soap. Concentration data fit adsorption/micelles; a plateau and foam alone do not prove unlimited cleaning.
  - Understanding focus (DE): Härte und Konzentration mechanistisch verbinden.
  - Understanding focus (EN): Connect hardness and concentration mechanistically.
- `controlled-temperature-replan`
  - Task demand (DE): Eine neue Tabelle variiert bei gleichem Tensid, Wasser und Schmutz getrennt Temperatur und Dosis. Moderate Erwärmung verbessert im Modell die Dispersion, oberhalb einer vorgegebenen Stoffgrenze nimmt sie ab; zusätzliche Dosis hilft nur in einem Bereich. Erkläre die Daten und plane einen Vergleich, der Härte als Ursache prüft.
  - Task demand (EN): A fresh table varies temperature and dose separately at equal surfactant, water and soil. Moderate warming improves model dispersion, above a supplied material limit it declines; extra dose helps only within a range. Explain data and plan a comparison testing hardness.
  - Expected performance (DE): Löslichkeit/Beweglichkeit und die vorgegebene Stoffgrenze erklären die Temperaturdaten; Konzentration wirkt über verfügbare Grenzflächen-/Micellenbildung. Für den Härtevergleich bleiben Temperatur, Dosis und Schmutz gleich, nur Ca/Mg-Gehalt ändert sich. Keine universelle Regel heißer=immer besser oder Schaum=Waschwirkung.
  - Expected performance (EN): Solubility/mobility and the supplied material limit explain temperature data; dose acts through available interfacial/micelle formation. A hardness comparison fixes temperature, dose and soil while changing Ca/Mg. No universal hotter-is-better or foam-equals-cleaning rule.
  - Understanding focus (DE): Frischer Mehrfaktor-/Kontrolltransfer.
  - Understanding focus (EN): Fresh multiple-factor and control transfer.
## Page 3: Magensäurebildung und Protonenpumpen-Hemmer erklären

- Full learning-goal ID: `2fac2f0e-bccc-5511-b9fb-cc1bc3aeed00`
- Goal fingerprint: `sha256:a9a41564174167296a3dd03b5ea1fc8645cf3157f26a93dcf8cddb36ae8be640`
- Page fingerprint: `sha256:1b2444d64bd5b662fe3962108ed0a8ec5af5ac2d73eb09c02d59e3707a4a9977`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Bildung von Magensäure chemisch beschreiben und daran die Wirkweise von Protonenpumpen-Hemmern erklären.

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

Status: `needs_human_review`; profile fingerprint: `sha256:06fbc7e9acfe930481d780c1c220a5e6b6afaf7f65b3331705e4ee1f73836960`
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
  - Essential understanding (DE): Modellbilanz und Quellenbefund erlauben eine begrenzte chemische Schlussfolgerung.
  - Essential understanding (EN): Model balance and source evidence support a bounded chemical inference.
  - Observable performance (DE): Berechnet Modellkonzentrationen und trennt diese von klinischer Wirkung/Anwendung.
  - Observable performance (EN): Calculates model concentrations and separates them from clinical effects/use.

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
  - Task demand (DE): Daten und Bedingungen:
Chemisches Unterrichtsmodell: keine persönlichen Behandlungs-, Dosierungs- oder Einnahmeempfehlungen; erfundene Modellwerte sind keine klinischen Befunde. Primärdossier: NCI Drug Dictionary, Omeprazole, https://www.cancer.gov/publications/dictionaries/cancer-drug/def/omeprazole. Inhaltsparaphrase: aktive Form bindet an H⁺/K⁺-ATPase und hemmt den finalen H⁺/K⁺-Austausch in das Lumen. Schulmodell: CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻; H⁺ wird aus der Belegzelle gegen K⁺ ins Lumen transportiert, Cl⁻ gelangt separat hinein. Geschlossener idealer 1.00-L-Modellraum ohne Puffer/Volumenänderung: anfangs 10.0 mmol H⁺; normalerweise weitere 2.00 mmol; Modellhemmer lässt nur 10% dieses Zusatzflusses zu. HCl vollständig dissoziiert, pH=−log₁₀(c(H⁺)/(1 mol/L)).
Aufgaben:
1. Erkläre chemische Protonenquelle, ATP-Pumpe und Cl⁻-Transport; unterscheide HCl im Wasser von intakten HCl-Molekülen.
2. Identifiziere im Primärdossier Zielprotein und Transportfolge der Hemmung; belege die Aussage mit URL und Abschnitt, ohne einen Neutralisationsmechanismus zu erfinden.
3. Berechne Modell-pH mit und ohne Hemmung und erläutere, warum daraus keine individuelle Wirkungseintrittszeit folgt.
  - Task demand (EN): Data and conditions:
Chemistry teaching model: no personal treatment, dosing or administration recommendation; invented model values are not clinical findings. Primary dossier: NCI Drug Dictionary, Omeprazole, https://www.cancer.gov/publications/dictionaries/cancer-drug/def/omeprazole. Paraphrase: active form binds H⁺/K⁺-ATPase and inhibits final H⁺/K⁺ exchange into the lumen. School model: CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻; H⁺ leaves the parietal cell for the lumen in exchange for K⁺, and Cl⁻ enters separately. Closed ideal 1.00-L model without buffer/volume change: initially 10.0 mmol H⁺; normally 2.00 mmol more; model inhibitor permits 10% of this extra flux. HCl is fully dissociated, pH=−log₁₀(c(H⁺)/(1 mol/L)).
Tasks:
1. Explain proton source, ATP-driven pump and chloride transport; distinguish aqueous HCl from intact HCl molecules.
2. Identify target protein and transport consequence in the primary dossier; cite URL/section without inventing neutralization.
3. Calculate model pH with/without inhibition and explain why it does not establish an individual onset time.
  - Expected performance (DE): 1. CO₂/H₂O liefert über das Kohlensäuregleichgewicht H⁺/HCO₃⁻. ATP-Kopplung treibt H⁺ gegen sein Gefälle, während K⁺ zurückgetauscht wird; Cl⁻ kommt separat. Im Wasser sind hydratisierte H⁺ (vereinfacht H₃O⁺) und Cl⁻ vorhanden; HCl wird nicht als Molekülpaket gepumpt.
2. Die NCI-Definition unter der angegebenen URL beschreibt H⁺/K⁺-ATPase als Ziel und weniger H⁺-Transport ins Lumen als Folge. Die vorhandenen 10.0 mmol Säure verschwinden dadurch nicht. Recherchebeleg ist die benannte Definition/URL; dieses Paket behauptet keine tatsächliche Lernendenrecherche.
3. Ohne Hemmung: 12.0 mmol/L=0.0120 mol/L, pH 1.921. Mit Hemmung: 10.2 mmol/L=0.0102 mol/L, pH 1.991. Das Modell hemmt nur neuen Zufluss; Puffer, Entleerung, Pharmakokinetik und echte Behandlungsverläufe fehlen, daher keine klinische Zeit-/Wirksamkeitsprognose.
  - Expected performance (EN): 1. CO₂/water supplies H⁺/HCO₃⁻ through carbonic-acid equilibrium. ATP coupling drives H⁺ against its gradient in exchange for K⁺; chloride moves separately. Aqueous acid contains hydrated H⁺ (simplified as H₃O⁺) and Cl⁻; intact HCl packets are not pumped.
2. The NCI definition at the supplied URL identifies H⁺/K⁺-ATPase and reduced H⁺ transport into the lumen. Existing 10.0 mmol acid does not disappear. The evidence location is the named definition/URL; this package claims no actual learner research.
3. Without inhibition: 0.0120 mol/L, pH 1.921. With inhibition: 0.0102 mol/L, pH 1.991. Only new influx is inhibited; buffers, emptying, pharmacokinetics and actual treatment trajectories are absent, so no clinical time/efficacy prediction follows.
  - Understanding focus (DE): Protonenbildung, energiegekoppelte Sekretion und stöchiometrischer Säureverbrauch sind getrennte Vorgänge. Transfer: Bei verändertem Säurezufluss erklären, warum ein Pumpenhemmer vorhandene Säure nicht direkt neutralisiert. Zwei unabhängige Nachweisschritte können in einer integrierten Leistung auftreten; die zwei Fallvarianten sind keine Pflichtaufgabenquote. Sobald alle Aspekte und selbstständiger Transfer hinreichend gezeigt sind, endet die Prüfung.
  - Understanding focus (EN): Proton production, energy-coupled secretion and stoichiometric acid consumption are separate processes. Transfer: With changed acid influx explain why a pump inhibitor does not directly neutralize existing acid. Two independent demonstration steps can occur in one integrated performance; the two case variants are not a mandatory task quota. Stop assessment once all aspects and independent transfer are sufficiently shown.
- `2fac2f0e-case-2`
  - Task demand (DE): Daten und Bedingungen:
Chemisches Unterrichtsmodell: keine persönlichen Behandlungs-, Dosierungs- oder Einnahmeempfehlungen; erfundene Modellwerte sind keine klinischen Befunde. Gleiches NCI-Primärdossier https://www.cancer.gov/publications/dictionaries/cancer-drug/def/omeprazole mit derselben Mechanismusparaphrase. Idealraum 0.500 L enthält 4.00 mmol H⁺. Variante N verbraucht durch Modellbase 3.00 mmol H⁺, anschließend liefert eine aktive Pumpe 2.00 mmol nach. Variante P enthält keine Base; blockierter Modellpumpenzufluss ist null. Kein weiterer Stofffluss/Puffer; pH=−log₁₀(c(H⁺)/(1 mol/L)).
Aufgaben:
1. Erkläre, warum die aktive Pumpe bei N weiterhin Säure liefern kann, obwohl vorher H⁺ neutralisiert wurde.
2. Prüfe die Aussage „P ist nur eine andere Neutralisationsbase“ anhand des Primärdossiers; gib einen Quellenbeleg an.
3. Berechne beide End-pH-Werte und entscheide, ob die kleinere Modell-H⁺-Menge eine reale Therapieentscheidung rechtfertigt.
  - Task demand (EN): Data and conditions:
Chemistry teaching model: no personal treatment, dosing or administration recommendation; invented model values are not clinical findings. Same primary NCI dossier https://www.cancer.gov/publications/dictionaries/cancer-drug/def/omeprazole and mechanism paraphrase. Ideal 0.500-L space contains 4.00 mmol H⁺. Variant N consumes 3.00 mmol H⁺ with a model base, followed by 2.00 mmol from an active pump. Variant P contains no base and has zero blocked model pump influx. No other flow/buffer; pH=−log₁₀(c(H⁺)/(1 mol/L)).
Tasks:
1. Explain why an active pump in N can still supply acid after earlier neutralization.
2. Check “P is just another neutralizing base” against the primary dossier and cite the source.
3. Calculate both final pH values and decide whether lower model H⁺ justifies an actual treatment choice.
  - Expected performance (DE): 1. Neutralisation entfernt Lumensäure, schaltet aber nicht automatisch die ATP-gekoppelte H⁺/K⁺-ATPase ab. Neue H⁺-Sekretion mit Cl⁻-Begleittransport bleibt im Modell möglich. Die Protonenquelle und der Transport sind vom Verbrauch im Lumen getrennt.
2. Falsch: Die NCI-Definition beschreibt Hemmung des Pumpenproteins und H⁺-Transports, keine 1:1-Verbrauchsreaktion mit Lumensäure. Die Mechanismen können daher zeitlich verschiedene Modellbilanzen erzeugen. Beleg: NCI Drug Dictionary, Definition Omeprazole, angegebene URL.
3. N: (4−3+2)/0.500=6.00 mmol/L, pH 2.222. P: 4/0.500=8.00 mmol/L, pH 2.097. N hat im gewählten Zeitpunkt weniger H⁺; das ist nur die vorgegebene Bilanz. Dauer, Nebenwirkungen, Indikation und reale Sekretion sind nicht modelliert und erlauben keine Therapieempfehlung.
  - Expected performance (EN): 1. Neutralization consumes luminal acid without automatically disabling ATP-coupled H⁺/K⁺-ATPase. New H⁺ secretion with chloride transport remains possible. Proton production/transport is separate from luminal consumption.
2. False: NCI describes inhibition of pump protein/H⁺ transport, not a 1:1 acid-consumption reaction. The mechanisms can produce different time-dependent model balances. Citation: NCI Drug Dictionary, Omeprazole definition, supplied URL.
3. N: (4−3+2)/0.500=6.00 mmol/L, pH 2.222. P: 4/0.500=8.00 mmol/L, pH 2.097. N has less H⁺ at the chosen instant, solely from the supplied balance. Duration, adverse effects, indications and actual secretion are unmodeled; no treatment recommendation follows.
  - Understanding focus (DE): Protonenbildung, energiegekoppelte Sekretion und stöchiometrischer Säureverbrauch sind getrennte Vorgänge. Transfer: Bei verändertem Säurezufluss erklären, warum ein Pumpenhemmer vorhandene Säure nicht direkt neutralisiert. Zwei unabhängige Nachweisschritte können in einer integrierten Leistung auftreten; die zwei Fallvarianten sind keine Pflichtaufgabenquote. Sobald alle Aspekte und selbstständiger Transfer hinreichend gezeigt sind, endet die Prüfung.
  - Understanding focus (EN): Proton production, energy-coupled secretion and stoichiometric acid consumption are separate processes. Transfer: With changed acid influx explain why a pump inhibitor does not directly neutralize existing acid. Two independent demonstration steps can occur in one integrated performance; the two case variants are not a mandatory task quota. Stop assessment once all aspects and independent transfer are sufficiently shown.
## Page 4: Chemische Quellen und Darstellungen kritisch prüfen

- Full learning-goal ID: `36666b4a-97af-51fc-9983-56cdcc7a8229`
- Goal fingerprint: `sha256:48040c2af3eea2a65f19a4c76c20b2e420d1a46fa65da7e35c3f06c4732cea4b`
- Page fingerprint: `sha256:7b3cd6456da124854e03aa1d4753bf00ba5fa9e6a78117b81c8b180d3091f9af`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann analoge und digitale Quellen oder Darstellungsformen zu chemischen Sachverhalten hinsichtlich ihrer Aussagen, fachlichen Relevanz, Vertrauenswürdigkeit, Urheberschaft und Intention vergleichen und ihre Eignung und Validität für eine konkrete Frage begründet beurteilen.

### Visualization

/assets/goal-visualizations/chemie/36666b4a-97af-51fc-9983-56cdcc7a8229/36666b4a-97af-51fc-9983-56cdcc7a8229.png

- original digest: `sha256:e26aaa12457ea4311e25931b715b46dc47ef8eefcd180bf10c06506507be4ff6`
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
- Halogenkohlenwasserstoffe quellenkritisch bewerten — `3c9bfa10-9a13-50cc-96c8-6213e28d6c54` (outside this book)
- Chemische Wirkungen in historischen und aktuellen Zusammenhängen bewerten — `9f892457-c4e5-56da-830c-bf6cac0c98d7` (outside this book)
- Einflüsse auf die Entwicklung chemischen Wissens bewerten — `e5a5dcd8-053c-55fd-b5c7-bba93779da53` (outside this book)
- Maßnahmen zu organischen Rohstoffen quellenkritisch ableiten — `8b98d8ba-65c6-58d7-92f0-45f4b2456573` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:203de9d84d81668a0619e97e20c4e930a52d832fe56e2b1df1e02a8e31844ebd`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `claims-and-evidence`
  - Essential understanding (DE): Vertrauenswürdigkeit wird für eine konkrete Aussage anhand Urheberschaft, Intention, Methode, Rohdaten und relevanter Grenzen geprüft.
  - Essential understanding (EN): Trustworthiness for a specific claim is checked using authorship, intention, method, raw data and relevant limits.
  - Observable performance (DE): Vergleicht Anbieter-, Labor- und anonymes Material bzw. Fachbericht, Verkaufsgraphik und Modelltext; prüft fachliche Relevanz und Beleglage statt Quellen nur zu etikettieren.
  - Observable performance (EN): Compares vendor, laboratory and anonymous material or technical report, sales chart and model text; checks scientific relevance and evidence rather than merely labelling sources.
- `bounded-validity`
  - Essential understanding (DE): Geringere Absorbanz belegt unter festen Bedingungen eine begrenzte Signaländerung; Löslichkeit belegt keine klinische Wirksamkeit.
  - Essential understanding (EN): Lower absorbance demonstrates a bounded signal change under fixed conditions; solubility does not demonstrate clinical efficacy.
  - Observable performance (DE): Begründet 75 % Absorbanzabnahme und Faktor 10 bzw. 900 % Löslichkeitsanstieg mit korrekter Bezugsgröße und verwirft daraus nicht ableitbare Alles-schadstofffrei-/Wirkungsbehauptungen.
  - Observable performance (EN): Justifies 75% absorbance decrease and factor 10 or 900% solubility increase using the correct reference quantity and rejects unsupported all-pollutant-free/effect claims.
- `revise-source-judgment`
  - Essential understanding (DE): Neue unabhängige Prüfbelege können ein Urteil verbessern; deklarierte Herstellerfinanzierung ist ein zu prüfender Interessenkonflikt, kein automatischer Falschheitsbeweis.
  - Essential understanding (EN): New independent evidence can improve a judgment; declared manufacturer funding is a conflict to examine, not automatic proof of falsehood.
  - Observable performance (DE): Ändert das Quellenurteil nur für tatsächlich neu belegte Aussagen, prüft unabhängige Methode/Analytumfang oder Finanzierung/Datenauswahl und hält die verbleibende Aussagegrenze fest.
  - Observable performance (EN): Revises the source judgment only for actually newly evidenced claims, checks independent method/analyte scope or funding/data selection and records remaining claim limits.

**Coverage expectations**

- required expectations: `claims-and-evidence`, `bounded-validity`, `revise-source-judgment`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `new-verification`: Bisher unvollständige Anbieterangaben erhalten unabhängig überprüfbare Daten. / Previously incomplete vendor claims gain independently checkable data.
- `funding-disclosure`: Ein technisch nachvollziehbarer Bericht legt Herstellerfinanzierung offen. / A technically traceable report discloses manufacturer funding.

**Application cases**

- `upper-source-criticism-dye-removal-claims`
  - Task demand (DE): Vergleiche Aussagen, Darstellungsformen, Relevanz, Urheber und Intention für „Entfernt X den Farbstoff unter diesen Bedingungen?“ und für „Ist Wasser sicher trinkbar?“ Beurteile Eignung und Validität getrennt.
Frische Variation: A ergänzt unabhängige vollständige Prüfdaten: Wie muss das Urteil anhand neuer Evidenz angepasst werden?
  - Task demand (EN): Compare claims, representations, relevance, authors and intent for “Does X remove the dye under these conditions?” and “Is the water safe to drink?” Assess suitability and validity separately.
Fresh variation: A adds independent complete test data: how must the judgment change with new evidence?
  - Expected performance (DE): B trägt einen begrenzten Farbstoffvergleich: 75 % geringere A bei gegebenem System, nicht vollständige Schadstofffreiheit. Offene Methoden/Kontrollen erhöhen Prüfbarkeit; Schulurheber allein garantiert nicht Wahrheit. A verfolgt Verkauf, verschweigt Achsen/Analytes und überdehnt Aussage; C ist mangels Daten nicht valide. Keine Quelle belegt Trinkbarkeit oder medizinische Sicherheit. Auch B kann bei Farbumschlag statt Stoffentfernung weitere Methodenprüfung brauchen.
Frischer Transfer: Ein neues unabhängiges vollständiges Prüfprotokoll kann das bisherige Urteil über A verbessern. Erst tatsächlichen Autor/Unabhängigkeit, Methode, pH/Wellenlänge, Blank, Probenumfang, Wiederholung, Rohdaten und geprüfte Analytliste lesen und prüfen. Wenn es die Abnahme des untersuchten Farbstoffs unter den angegebenen Bedingungen unabhängig bestätigt, diese begrenzte Aussage höher gewichten und den alten pauschalen Zweifel korrigieren. Es belegt nur tatsächlich erfasste Stoffe und Nachweisgrenzen; „alle Schadstoffe entfernt“ oder Trinkwassersicherheit folgt weiterhin nicht. Der Laborbefund B bleibt unter seiner Methodengrenze verwertbar. Die neue Quelle ist im Transfer nur angekündigt; ohne konkrete neue Daten wird kein gelungenes Prüfresultat erfunden.
  - Expected performance (EN): B supports a bounded dye comparison: 75% lower A for the given system, not complete pollutant absence. Open methods/controls increase checkability; school authorship alone does not guarantee truth. A pursues sales, hides axes/analytes and overextends the claim; C lacks valid evidence. None establishes drinkability or medical safety. B may still need further method checks if colour change rather than removal occurs.
Fresh transfer: A new independent complete test protocol can improve the prior judgment of A. First actually read and examine author/independence, method, pH/wavelength, blank, sample scope, repeats, raw data and the analyte list. If it independently confirms reduction of the investigated dye under stated conditions, give that bounded claim greater weight and revise prior general doubt. It supports only actually covered substances and detection limits; “all pollutants removed” or drinking-water safety still does not follow. Laboratory finding B remains usable within its method limits. The new source is only announced in the transfer; without specific new data no successful test result is invented.
  - Understanding focus (DE): Quellenkritik verändert sich durch überprüfbare neue Evidenz und wahrt den tatsächlich geprüften Analytumfang.
  - Understanding focus (EN): Source criticism changes with checkable new evidence and preserves the actually examined analyte scope.
- `upper-source-criticism-pharmaceutical-graph`
  - Task demand (DE): Beurteile Quellen für die konkrete chemische Löslichkeitsfrage und für eine behauptete pharmazeutische Wirkung. Vergleiche Form, Herkunft, Intention, relevante Evidenz und offene Grenzen.
Frische Variation: Wie verändert eine von A deklarierte Herstellerfinanzierung die Bewertung, wenn alle Methoden weiterhin prüfbar sind?
  - Task demand (EN): Assess sources for the specific chemical solubility question and a claimed pharmaceutical effect. Compare form, origin, intent, relevant evidence and unresolved limits.
Fresh variation: How does declared manufacturer funding of A affect evaluation if methods remain checkable?
  - Expected performance (DE): A eignet sich bei geprüften Annahmen zur Modell-Löslichkeit; C zum Theoriebezug, nicht als Q-Messung. B verschweigt Nenner und „besser“-Kriterium; bei Anstieg 1,1→11,0 ist Endwert zehnfach, relative Zunahme 900 %, nicht unklar „1000 % besser“. Keine Quelle zeigt Aufnahme, Wirksamkeit oder klinische Sicherheit. Fachliche Plausibilität, Quellenunabhängigkeit und methodische Begrenzung werden gemeinsam gewichtet.
Frischer Transfer: Herstellerfinanzierung schafft ein relevantes Interesse an günstiger Darstellung, macht fachlich nachvollziehbare pH-/Löslichkeitsdaten aber nicht automatisch falsch. Finanzierung transparent nennen, vollständige Methoden/Rohdaten, Auswahl der pH-Punkte, Unsicherheiten und unabhängige Prüfung verlangen. A kann weiterhin das fiktive Modell unter seinen Voraussetzungen stützen; Finanzierung senkt gegebenenfalls das Vertrauen in unbelegte Verallgemeinerungen. Die berechnete Änderung 1,1→11 ist Faktor 10 bzw. +900 %, ohne Wirksamkeitsbeleg. B bleibt wegen fehlendem Nenner/klinischen Daten ungeeignet für „besser“, C erklärt eine Theorie ohne eigene Q-Messung. Ein Quellenurteil unterscheidet diese Funktionen und die konkrete Sachfrage.
  - Expected performance (EN): A is suitable for model solubility when assumptions hold; C for theory, not as a Q measurement. B hides denominator and meaning of “better”; 1.1→11.0 is a tenfold final value, relative increase 900%, not an unclear “1000% better”. None shows uptake, efficacy or clinical safety. Scientific plausibility, source independence and methodological limits are jointly weighed.
Fresh transfer: Manufacturer funding creates a relevant interest in favourable presentation but does not automatically falsify scientifically traceable pH/solubility data. Disclose funding and require full methods/raw data, selection of pH points, uncertainties and independent checks. A may still support the fictional model under its assumptions; funding may reduce confidence in unsupported generalisations. Computed change 1.1→11 is factor 10 or +900%, without efficacy evidence. B remains unsuitable for “better” because denominator/clinical data are absent; C explains theory without own Q measurements. Source judgment distinguishes these functions and the specific question.
  - Understanding focus (DE): Intention, Beleglage und fachliche Eignung werden differenziert geprüft statt finanziert gleich falsch zu setzen.
  - Understanding focus (EN): Intention, evidence and scientific suitability are examined separately rather than equating funding with falsehood.
## Page 5: Nukleophile Substitution als Donator-Akzeptor-Reaktion beschreiben

- Full learning-goal ID: `3899edf4-a809-54b1-8ee7-4e67aa82dc7c`
- Goal fingerprint: `sha256:ad29cb29db1dd4319610a89e0a4d5ddd63c1a08af90ea94ed34ef2350935583f`
- Page fingerprint: `sha256:53eeb2daebede6784bc19f1d99e9e0398f9aa65da233d623cce577d0a0eaa636`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann nukleophile Substitution als Reaktion eines Elektronenpaardonators mit einem Elektronenpaarakzeptor beschreiben.

### Visualization

/assets/goal-visualizations/chemie/3899edf4-a809-54b1-8ee7-4e67aa82dc7c/3899edf4-a809-54b1-8ee7-4e67aa82dc7c.jpg

- original digest: `sha256:52ce8f6315d92fe9a829f59b2635fbb19c7bbfcdd058b7333348d6b1e014958d`
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
- Substitutionsmechanismen differenzieren (LK) — `a4bac92b-d685-5cb6-94c8-c9b8b878d125` (outside this book)
- SN1/SN2 vergleichen — `cdd4ee76-5b37-54ee-b238-63db71205af0` (outside this book)
- Halogenalkan-Hydroxid-Reaktionsgleichungen formulieren — `d4928773-3be8-5cf1-907c-ef07c96751e8` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1c0dd3c81ced35fec35aa0843b94fdf393d6de734a6655b5d22668750e6b48f2`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `structure-model-reasoning`
  - Essential understanding (DE): Ein Nukleophil bietet ein Elektronenpaar zur neuen Bindung an; das elektrophile C ist Akzeptor und die Abgangsgruppe erhält das alte Bindungselektronenpaar.
  - Essential understanding (EN): A nucleophile offers an electron pair for a new bond; electrophilic C accepts it and the leaving group receives the old bonding electron pair.
  - Observable performance (DE): Die Person markiert Elektronenpaarquelle, Akzeptor-C und Bindungsänderungen an einem vorgegebenen Substitutionsmodell.
  - Observable performance (EN): The learner marks electron-pair origin, acceptor C and bond changes in a supplied substitution model.
- `fresh-application-and-boundary`
  - Essential understanding (DE): Der Elektronenpaarpfeil beginnt am Paar, nicht an einer positiven Ladung; eine Nettogleichung beweist weder SN1/SN2 noch eine universelle Produktverteilung.
  - Essential understanding (EN): An electron-pair arrow starts at the pair, not at a positive charge; a net equation establishes neither SN1/SN2 nor universal product distribution.
  - Observable performance (DE): Der Pfeil muss am O-Paar beginnen und zum C führen; das C-Cl-Paar geht zum Cl. Der Donator bleibt OH−, der Akzeptor das halogentragende C, die Abgangsgruppe wird Cl− statt Br−. Die Ladung wird vollständig bilanziert. Ohne kinetische oder strukturelle Zusatzinformation wird aus dem Halogentausch keine sichere Geschwindigkeit oder ein bestimmter Mechanismustyp behauptet.
  - Observable performance (EN): The arrow starts at the O pair and goes to C; the C-Cl pair goes to Cl. OH− remains donor, halogen-bearing C acceptor; Cl− replaces Br− as leaving group. Charge is fully balanced. Without additional kinetic or structural information the halogen change establishes no definite rate or mechanism type.

**Coverage expectations**

- required expectations: `structure-model-reasoning`, `fresh-application-and-boundary`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-variation`: Chlor- versus Bromalkan, Hydroxid- versus vorgegebener neutraler Elektronenpaardonator, Modelle mit festgelegten Bedingungen. / Chloro- versus bromoalkane, hydroxide versus supplied neutral electron-pair donor, models with specified conditions.
- `counterexample`: Der Elektronenpaarpfeil beginnt am Paar, nicht an einer positiven Ladung; eine Nettogleichung beweist weder SN1/SN2 noch eine universelle Produktverteilung. / An electron-pair arrow starts at the pair, not at a positive charge; a net equation establishes neither SN1/SN2 nor universal product distribution.

**Application cases**

- `chem-current15-3899edf4-case-1`
  - Task demand (DE): Für CH3CH2Br und OH− ist ein Substitutionsfall ausdrücklich vorgegeben. Das O trägt freie Elektronenpaare; die C-Br-Bindung ist zum Br hin polarisiert. Erkläre Donator/Akzeptor und zeichne die beiden Elektronenpaarverschiebungen zum Alkohol und Bromid.
  - Task demand (EN): For CH3CH2Br and OH− a substitution case is explicitly specified. O has lone pairs; C-Br is polarized towards Br. Explain donor/acceptor and draw the two electron-pair shifts to alcohol and bromide.
  - Expected performance (DE): Ein O-Elektronenpaar bildet die C-O-Bindung zum elektrophilen C; das C-Br-Bindungspaar geht zum Br, sodass Br− entsteht. Es folgt CH3CH2Br + OH− → CH3CH2OH + Br− bei erhaltener Ladungsbilanz.
  - Expected performance (EN): An O lone pair forms C-O at electrophilic C; the C-Br pair goes to Br, forming Br−. This gives CH3CH2Br + OH− → CH3CH2OH + Br− with charge conserved.
  - Understanding focus (DE): Donator meint hier Elektronenpaardonator, nicht einen Protonenspender.
  - Understanding focus (EN): Donor here means electron-pair donor rather than proton donor.
- `chem-current15-3899edf4-case-2`
  - Task demand (DE): Frischer vorgegebener Substitutionsfall: CH3CH2Cl mit OH−. Ein falscher Pfeil beginnt am elektrophilen C und zeigt auf das freie O-Elektronenpaar. Korrigiere den Pfeil und erkläre, welche Paarquelle und Abgangsgruppe trotz Halogentausch gleich bzw. verschieden sind.
  - Task demand (EN): Fresh specified substitution case: CH3CH2Cl with OH−. A faulty arrow starts at electrophilic C and points to the O lone pair. Correct the arrow and explain which pair origin and leaving group remain the same or differ after changing the halogen.
  - Expected performance (DE): Der Pfeil muss am O-Paar beginnen und zum C führen; das C-Cl-Paar geht zum Cl. Der Donator bleibt OH−, der Akzeptor das halogentragende C, die Abgangsgruppe wird Cl− statt Br−. Die Ladung wird vollständig bilanziert.
  - Expected performance (EN): The arrow starts at the O pair and goes to C; the C-Cl pair goes to Cl. OH− remains donor, halogen-bearing C acceptor; Cl− replaces Br− as leaving group. Charge is fully balanced.
  - Understanding focus (DE): Ohne kinetische oder strukturelle Zusatzinformation wird aus dem Halogentausch keine sichere Geschwindigkeit oder ein bestimmter Mechanismustyp behauptet.
  - Understanding focus (EN): Without additional kinetic or structural information the halogen change establishes no definite rate or mechanism type.
## Page 6: Einflussfaktoren diskutieren

- Full learning-goal ID: `3ce81f96-4fbb-5022-88b7-337a000315ed`
- Goal fingerprint: `sha256:1d5e3620ccb32c5cccd88d5250fd32a06500d315963028b49a3583e28eb08adc`
- Page fingerprint: `sha256:19389609c567a79a9f10b892b0dff4ae7a27406ff2f08d7857bdfbb7d70686c4`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann den Einfluss von Stoffart, Konzentration, Zerteilungsgrad und Temperatur auf die Reaktionsgeschwindigkeit qualitativ erklären und diese Einflüsse auf Teilchenebene mit der Stoßtheorie begründen.

### Visualization

/assets/goal-visualizations/chemie/3ce81f96-4fbb-5022-88b7-337a000315ed/3ce81f96-4fbb-5022-88b7-337a000315ed.jpg

- original digest: `sha256:7c5d8cd08ea4d03f079bd7776b57785151824c69c5619fc3b0bd439af78577eb`
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
- RGT-Regel anwenden — `56115f9d-1d32-5454-94b1-00dbc4a7bc6f` (outside this book)
- Reaktionsbedingungen hypothesengeleitet untersuchen — `536030f8-70dc-519d-8039-92290c68d95d` (outside this book)
- Autokatalysen untersuchen (LK) — `5cdf490f-bfb2-54c2-bbd7-7062cc69a2ef` (outside this book)
- Katalysatoreinsatz technisch und ökologisch bewerten — `00c647e8-0858-5640-b9da-76d85d528820` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f1fbabbccc291991590e6f8666acf351da4e5ce61df9bf9da1af16972419d2a2`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `whole-duty-1`
  - Essential understanding (DE): Eine größere Konzentration reagierender Teilchen erhöht im betrachteten Stoßmodell typischerweise die Begegnungshäufigkeit. Daraus folgt ohne Kenntnis des Mechanismus kein universelles quantitatives Geschwindigkeitsgesetz.
  - Essential understanding (EN): A higher concentration of reacting particles typically increases encounter frequency in the collision model considered. Without the mechanism, this does not establish a universal quantitative rate law.
  - Observable performance (DE): Konzentration mit Begegnungshäufigkeit erklären. Weitere mögliche Aufgabenvariation: Zerteilungsfehler richtig auf Oberfläche beziehen.
  - Observable performance (EN): Explain concentration through encounter frequency. Further possible task variation: Correct division error using surface.
- `whole-duty-2`
  - Essential understanding (DE): Bei gleicher Masse derselben Substanz bleibt die Stoffmenge durch Zerteilung gleich. Feinere Verteilung vergrößert die zugängliche Oberfläche für heterogene Kontakte.
  - Essential understanding (EN): At equal mass of the same substance, dividing it does not change its amount. Finer division increases accessible surface for heterogeneous contacts.
  - Observable performance (DE): Zerteilung mit Oberfläche statt Gesamtmenge erklären. Weitere mögliche Aufgabenvariation: Konzentrationswirkung qualitativ statt universal quantitativ beschreiben.
  - Observable performance (EN): Explain division through surface rather than total amount. Further possible task variation: Describe concentration qualitatively rather than universally quantitatively.
- `whole-duty-3`
  - Essential understanding (DE): Höhere Temperatur verändert die Bewegungs- und Energieverteilung und erhöht im gegebenen Modell besonders den Anteil ausreichend energiereicher Stöße. Die Aussage setzt unveränderte relevante Stoff- und Katalysatorstruktur voraus.
  - Essential understanding (EN): Higher temperature changes motion and energy distribution and, in the supplied model, particularly increases the fraction of sufficiently energetic collisions. The claim assumes unchanged relevant substance and catalyst structure.
  - Observable performance (DE): Temperatur mit Anteil wirksamer Stöße verknüpfen. Weitere mögliche Aufgabenvariation: Temperatur/Energieverteilung und wirksame Stöße erklären.
  - Observable performance (EN): Connect temperature with fraction of effective collisions. Further possible task variation: Explain temperature/energy distribution and effective collisions.
- `whole-duty-4`
  - Essential understanding (DE): Stoffart und Bindungsumbau beeinflussen die Aktivierungsbarriere; eine passende Orientierung ist eine zusätzliche Bedingung für erfolgreiche Stöße. Gleiche Gesamtzahl von Begegnungen bedeutet daher nicht gleiche Reaktionsgeschwindigkeit.
  - Essential understanding (EN): Substance type and bond rearrangement affect the activation barrier; suitable orientation is an additional condition for successful collisions. Equal total encounters therefore do not imply equal reaction rates.
  - Observable performance (DE): Stoffart,Orientierung/Barriere und Modellgrenzen nennen. Weitere mögliche Aufgabenvariation: Stoffart/Bindungsbarrieren und Orientierung einbeziehen.
  - Observable performance (EN): State species,orientation/barrier and model limits. Further possible task variation: Include species/bond barriers and orientation.

**Coverage expectations**

- required expectations: `whole-duty-1`, `whole-duty-2`, `whole-duty-3`, `whole-duty-4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `whole-case-material`: Vier Faktoren mit kontrollierten Modellvergleichen / Fehlerhafte Ratebegründungen korrigieren / Four factors with controlled model comparisons / Correct faulty rate explanations
- `independent-transfer`: Frisch: ein Enzym wird stark erhitzt und verliert Struktur. Muss die Rate steigen? / Frisch: Rate steigt nach Zugabe einer dritten Substanz,aber Konzentration der Edukte bleibt gleich. Beweist das die Konzentrationserklärung? / Fresh:an enzyme is strongly heated and loses its structure. Must rate increase? / Fresh:rate rises after addition of a third substance,but reactant concentrations stay equal. Does this prove the concentration explanation?

**Application cases**

- `q3-19-a`
  - Task demand (DE): Vier hypothetische Vergleiche bei sonst gleichen Bedingungen: mehr reagierende Teilchen pro Volumen; gleiche Feststoffmasse feiner verteilt; höhere Temperatur ohne Phasenwechsel/Denaturierung; zwei Stoffarten mit unterschiedlich stabilen Bindungen und gleichem Kollisionsangebot. Keine Versuchsausführung. Erkläre für Konzentration,Zerteilungsgrad,Temperatur und Stoffart qualitative Geschwindigkeitsänderungen auf Teilchenebene mit Stoßtheorie. Begrenze universelle Aussagen. Separater Transfer: Frisch: ein Enzym wird stark erhitzt und verliert Struktur. Muss die Rate steigen?
  - Task demand (EN): Four hypothetical comparisons with other conditions fixed:more reacting particles per volume;same solid mass more finely divided;higher temperature without phase change/denaturation;two species with differently stable bonds and equal collision supply. No experiment execution. Explain qualitative rate changes for concentration,division,temperature and species at particle level using collision theory. Bound universal statements. Separate transfer: Fresh:an enzyme is strongly heated and loses its structure. Must rate increase?
  - Expected performance (DE): Mehr Konzentration erhöht typischerweise Begegnungen je Zeit. Feinere Feststoffe bieten mehr zugängliche Oberfläche für heterogene Kontakte,nicht mehr Gesamtstoffmenge. HöhereT erhöht mittlere Bewegung und vor allem Anteil ausreichend energiereicher Stöße. Stoffart beeinflusst Bindungsumbau,Aktivierungsbarriere und geeignete Orientierung; gleiche Anzahl Stöße bedeutet nicht gleiche erfolgreiche Zahl. Die Erklärung gilt bei den Kontrollen,nicht als universelles Konzentrationsgesetz oder unbegrenzte Temperaturregel. Transferantwort: Nein; Denaturierung verändert den wirksamen Katalysator. Die zuvor angenommene unveränderte Stoff-/Katalysatorstruktur gilt nicht. Scoring /10: 2P: Konzentration mit Begegnungshäufigkeit erklären.; 2P: Zerteilung mit Oberfläche statt Gesamtmenge erklären.; 2P: Temperatur mit Anteil wirksamer Stöße verknüpfen.; 2P: Stoffart,Orientierung/Barriere und Modellgrenzen nennen.; 2P: Nein; Denaturierung verändert den wirksamen Katalysator. Die zuvor angenommene unveränderte Stoff-/Katalysatorstruktur gilt nicht.
  - Expected performance (EN): Higher concentration typically increases encounters per time. Finer solids provide more accessible surface for heterogeneous contacts,not more total amount. HigherT increases mean motion and particularly fraction of sufficiently energetic collisions. Species affects bond rearrangement,activation barrier and suitable orientation;equal collision counts do not mean equal successful counts. Explanation applies under controls,not as a universal concentration law or unlimited temperature rule. Transfer response: No;denaturation changes the effective catalyst. The previous assumption of unchanged species/catalyst structure no longer holds. Scoring /10: 2P: Explain concentration through encounter frequency.; 2P: Explain division through surface rather than total amount.; 2P: Connect temperature with fraction of effective collisions.; 2P: State species,orientation/barrier and model limits.; 2P: No;denaturation changes the effective catalyst. The previous assumption of unchanged species/catalyst structure no longer holds.
  - Understanding focus (DE): Nachweis des ganzen aktuellen Ziels durch ausreichend gezeigte zusammenhängende Fachleistung; keine Zusatzaufgabenquote. Vorhandene Fälle sind Alternativen und gezielte Ergänzungen. Synthetische Autorenmaterialien belegen keine tatsächliche Experimentdurchführung oder Lernendenleistung. Quellenanteile bleiben einzeln begrenzt.
  - Understanding focus (EN): Evidence for the whole current goal through sufficiently demonstrated connected scientific performance; no extra-task quota. Available cases are alternatives and targeted additions. Synthetic author material proves no actual experiment execution or learner performance. Source contributions remain individually bounded.
- `q3-19-b`
  - Task demand (DE): Synthetische Aussagen: „Pulver reagiert schneller,weil es mehr Mol enthält“ bei gleicher Masse; „doppelte Konzentration verdoppelt jede Rate“; „jede Kollision ist erfolgreich“; „wärmer bedeutet nur mehr Stöße,keine andere Energieverteilung“. Vergleiche zwei Stoffarten mit verschiedenen Bindungen. Korrigiere alle Aussagen mit Stoßtheorie und erkläre zusätzlich die Stoffartabhängigkeit. Gib für jeden der vier Faktoren eine kontrollierte qualitative Begründung. Separater Transfer: Frisch: Rate steigt nach Zugabe einer dritten Substanz,aber Konzentration der Edukte bleibt gleich. Beweist das die Konzentrationserklärung?
  - Task demand (EN): Synthetic claims:“powder reacts faster because it contains more moles”at equal mass;“double concentration doubles every rate”;“every collision succeeds”;“warming only means more collisions,not changed energy distribution”.Compare two species with different bonds. Correct all claims using collision theory and additionally explain species dependence. Give a controlled qualitative reason for each of the four factors. Separate transfer: Fresh:rate rises after addition of a third substance,but reactant concentrations stay equal. Does this prove the concentration explanation?
  - Expected performance (DE): Bei gleicher Masse derselben Substanz bleibt n gleich; Pulver vergrößert Kontaktfläche. Konzentration erhöht mögliche Begegnungen,jedoch hängt exakte Rate vom Mechanismus/Rategesetz ab. Erfolgreiche Stöße benötigen passende Orientierung und genügend Energie; andere Stoffarten besitzen andere Bindungen/Barrieren. Erwärmung verschiebt die Energieverteilung und erhöht den Anteil über der Barriere. Veränderungen sind bei sonst konstanten Bedingungen zu beurteilen. Transferantwort: Nein; mögliche Katalyse/Mechanismusänderung muss geprüft werden. Ein Konzentrationseffekt ohne Konzentrationsänderung ist nicht belegt. Scoring /10: 2P: Zerteilungsfehler richtig auf Oberfläche beziehen.; 2P: Konzentrationswirkung qualitativ statt universal quantitativ beschreiben.; 2P: Temperatur/Energieverteilung und wirksame Stöße erklären.; 2P: Stoffart/Bindungsbarrieren und Orientierung einbeziehen.; 2P: Nein; mögliche Katalyse/Mechanismusänderung muss geprüft werden. Ein Konzentrationseffekt ohne Konzentrationsänderung ist nicht belegt.
  - Expected performance (EN): At equal mass of the same substance n stays equal;powder enlarges contact surface. Concentration increases possible encounters,but exact rate depends on mechanism/rate law. Successful collisions need suitable orientation and sufficient energy;different species have different bonds/barriers. Warming shifts energy distribution and raises fraction above the barrier. Assess changes with other conditions fixed. Transfer response: No;possible catalysis/mechanism change needs checking. Concentration effect without concentration change is not established. Scoring /10: 2P: Correct division error using surface.; 2P: Describe concentration qualitatively rather than universally quantitatively.; 2P: Explain temperature/energy distribution and effective collisions.; 2P: Include species/bond barriers and orientation.; 2P: No;possible catalysis/mechanism change needs checking. Concentration effect without concentration change is not established.
  - Understanding focus (DE): Nachweis des ganzen aktuellen Ziels durch ausreichend gezeigte zusammenhängende Fachleistung; keine Zusatzaufgabenquote. Vorhandene Fälle sind Alternativen und gezielte Ergänzungen. Synthetische Autorenmaterialien belegen keine tatsächliche Experimentdurchführung oder Lernendenleistung. Quellenanteile bleiben einzeln begrenzt.
  - Understanding focus (EN): Evidence for the whole current goal through sufficiently demonstrated connected scientific performance; no extra-task quota. Available cases are alternatives and targeted additions. Synthetic author material proves no actual experiment execution or learner performance. Source contributions remain individually bounded.
## Page 7: Wirkungsgrade vergleichen

- Full learning-goal ID: `3ec31fe1-e01b-5edd-bd9a-936191d67639`
- Goal fingerprint: `sha256:f0abdaf037371e8c2bf0a89334f2ac63a9173a9d6ea30d6d851359c7e2883eff`
- Page fingerprint: `sha256:eb119b314d4ac8e42fe2241e0a07ec52e68608479542aa59d2994d1c16ee8656`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Wirkungsgrade verschiedener Energiewandler berechnen und vergleichen.

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

Status: `needs_human_review`; profile fingerprint: `sha256:bd365430b53e5613c2496b2a9bec066893ce545e9a12a85d3606df40b41280ff`
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
  - Essential understanding (DE): Teil- und Kettenwirkungsgrade brauchen gleiche Nutzfunktion und Fehlergrenze.
  - Essential understanding (EN): Partial/chain efficiencies need equal service and error boundaries.
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
## Page 8: Elektrophile Addition mechanistisch darstellen

- Full learning-goal ID: `3fb7dea4-f832-5e23-b518-68b13a655b92`
- Goal fingerprint: `sha256:722e36aa5ac92e9b1f2376fbc3de71cb5899b87363325c9772a0bcf5ed6ec030`
- Page fingerprint: `sha256:37e802d2cfb073669db82ea1f7bf62f33eb850ad07946b7549d93c1470375cc3`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann elektrophile Additionen an ungesättigten Kohlenwasserstoffen mechanistisch darstellen.

### Visualization

/assets/goal-visualizations/chemie/3fb7dea4-f832-5e23-b518-68b13a655b92/3fb7dea4-f832-5e23-b518-68b13a655b92.jpg

- original digest: `sha256:a7b330c877298383e79ab4124c2ea750ea7ae58267e538a3ccce3b1eae010a99`
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
- Benzolstruktur deuten — `4bdbdf32-3021-5a0a-b412-b611166b2d21` (outside this book)
- Bindungsänderungen und Nachweise bei Halogenreaktionen deuten — `622f09e5-a5bb-5ccf-919f-bae990c7c116` (outside this book)
- Reaktivität aromatischer Systeme begründen — `b8d3b453-d638-5518-aab0-d84ec2e8567c` (outside this book)
- Reaktionstypen mechanismisch einordnen — `7a05a1ce-45d3-571e-be51-afcd8dfd33ca` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:195e93c8f3dfb798eca7a764bd3974c757406b8ddce0ca79a7a47fc73e3c5b72`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `b003-3fb7dea4-core`
  - Essential understanding (DE): Bei einfacher elektrophiler Addition wird die π-Bindung eines Alkens angegriffen; ein Elektrophil bindet zunächst, danach entsteht eine zweite Bindung mit einem Nukleophil.
  - Essential understanding (EN): In simple electrophilic addition, the alkene π bond reacts with an electrophile first, followed by formation of a second bond with a nucleophile.
  - Observable performance (DE): Die lernende Person zeichnet für ein vorgegebenes Alken und HX Elektronenpfeile, plausible Zwischenstufe und das gesättigtere Additionsprodukt.
  - Observable performance (EN): For a supplied alkene and HX, the learner draws electron arrows, a plausible intermediate, and the more saturated addition product.

**Coverage expectations**

- required expectations: `b003-3fb7dea4-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `alkene`: Symmetrisches Ethen und unsymmetrisches Propen werden verglichen. / Symmetric ethene and asymmetric propene are compared.
- `regio`: Eindeutiges und bedingt regioselektives Produkt werden getrennt. / Unambiguous and conditionally regioselective products are separated.

**Application cases**

- `ethene-hbr-mechanism`
  - Task demand (DE): Zeichne für Ethen und HBr unter ionischen Bedingungen den Angriff der π-Bindung auf H, den Bromid-Angriff und das gesättigte Produkt.
  - Task demand (EN): For ethene with HBr under ionic conditions, draw π-bond attack on H, bromide attack, and the saturated product.
  - Expected performance (DE): Die lernende Person erhält Bromethan und zeigt plausible Elektronenpfeile sowie den Verlust der C=C-Doppelbindung.
  - Expected performance (EN): The learner obtains bromoethane and shows plausible electron arrows and loss of the C=C double bond.
  - Understanding focus (DE): Bindungsänderungen belegen die Addition.
  - Understanding focus (EN): Bond changes demonstrate addition.
- `fresh-propene-hbr`
  - Task demand (DE): Eine neue Aufgabe gibt Propen und HBr ohne Peroxide unter ionischen Bedingungen vor. Skizziere die bevorzugte mögliche Zwischenstufe und begründe ein Hauptprodukt; nenne die Bedingungsgrenze.
  - Task demand (EN): A fresh task gives propene and HBr without peroxides under ionic conditions. Sketch the more plausible intermediate and justify a major product; state the condition limit.
  - Expected performance (DE): Die lernende Person begründet die sekundäre Carbokation-Zwischenstufe und 2-Brompropan als Hauptprodukt; sie behauptet keine bedingungsunabhängige Universalregel.
  - Expected performance (EN): The learner justifies the secondary carbocation intermediate and 2-bromopropane as a major product without making a condition-independent universal rule.
  - Understanding focus (DE): Unsymmetrie prüft mechanistische Begründung.
  - Understanding focus (EN): Asymmetry tests mechanistic reasoning.
## Page 9: Elemente, Verbindungen und Gemische unterscheiden

- Full learning-goal ID: `42a84bca-d27e-581f-a43a-eee424f0504d`
- Goal fingerprint: `sha256:cb2615bbcbaf11d17039a279480013c17f6aea1b8e8171b47f81d8008ba89b48`
- Page fingerprint: `sha256:a8bc29805cef18357dbe468e564ad23195de1aa8227b9756719751935e57743a`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Reinstoffe, Stoffgemische, Elemente und Verbindungen fachlich voneinander abgrenzen und mit Teilchenvorstellungen beschreiben.

### Visualization

/assets/goal-visualizations/chemie/42a84bca-d27e-581f-a43a-eee424f0504d/42a84bca-d27e-581f-a43a-eee424f0504d.jpg

- original digest: `sha256:395a6ff0bd5142b2e7ac7cc505b616843ccfa14f69702bde96019aa3b2737c0f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Gaschromatografische Trennung erklären und Chromatogramme deuten — `5cd8b2a2-2c90-5e29-8061-dd5e3a682f9d` (outside this book)
- Wirkstoffentwicklung, Produktion und Vermarktung verknüpfen — `3eb2a06c-d283-57aa-9eb4-088940c4801a` (outside this book)
- Wirkstoffforschung mit Analyse, Synthese und Molecular Modelling erklären — `93a7ce4d-1c90-568c-9368-cac423011ef9` (outside this book)
- Planare chromatografische Trennungen durchführen und auswerten — `978a6f25-0601-5457-9211-aab206c95603` (outside this book)
- Dünnschichtchromatographie erklären und Rf-Daten deuten — `5fdc4fb2-a23b-5949-8d6b-ad43009120dd` (outside this book)
- Halogene und ihre Verwendung charakterisieren — `58486300-3f84-5aa1-9ed4-66186af62669` (outside this book)
- Wirkstoff-Isolierung als Stofftrennung erklären — `40f2db27-0ebe-5f03-941d-708aebcc64b7` (outside this book)
- Alkalimetalle und ihre Verbindungen charakterisieren — `e0e201bd-a1fd-5985-ab08-fd24c8655f3d` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f71e609109780a7c4a8ebae8ea27e3f1922f91d80ff731b71847a6a0cdff1610`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `b004-42a84bca-core`
  - Essential understanding (DE): Ein Reinstoff ist ein einzelner Stoff mit bestimmter Zusammensetzung, ein Gemisch enthält mehrere Stoffe. In den hier betrachteten Atom- und Molekülbildern zeigt ein Reinstoff eine Art Atome oder Moleküle; das ist keine allgemeine Definition für spätere Ionengitter. Ein Element enthält eine Atomsorte, eine Verbindung mindestens zwei chemisch gebundene Atomsorten.
  - Essential understanding (EN): A pure substance is one substance with a defined composition, whereas a mixture contains several substances. In the atom and molecule diagrams considered here, a pure substance shows one kind of atom or molecule; this is not a universal definition for ionic lattices studied later. An element contains one atom type, while a compound contains at least two chemically bonded atom types.
  - Observable performance (DE): Die lernende Person ordnet neue Atom- und Molekülkarten als Reinstoff oder Gemisch und als Element oder Verbindung ein und begründet anhand von Atomsorten und chemischer Bindung. Ionengitter-Kenntnisse werden nicht verlangt.
  - Observable performance (EN): The learner classifies fresh atom and molecule cards as pure substances or mixtures and as elements or compounds, justifying with atom types and chemical bonding. Knowledge of ionic lattices is not required.

**Coverage expectations**

- required expectations: `b004-42a84bca-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `molecular-particle-composition`: Eine Art Atom oder Molekül und mehrere Arten werden nur innerhalb der gezeigten Atom-/Molekülmodelle verglichen. / One kind of atom or molecule and several kinds are contrasted only within the shown atom/molecule models.
- `atom-composition`: Elementmoleküle und Moleküle aus verschiedenen Atomsorten werden verglichen; Ionengitter bleiben eine Modellgrenze. / Elemental molecules and molecules with different atom types are compared; ionic lattices remain a model boundary.

**Application cases**

- `element-compound-mixture-cards`
  - Task demand (DE): Drei neue Karten zeigen nur gleiche O2-Moleküle, nur gleiche H2O-Moleküle oder eine Mischung aus O2- und H2O-Molekülen. Ordne jede Karte in die Reinstoff/Gemisch-Hierarchie ein und begründe.
  - Task demand (EN): Three fresh cards show only identical O2 molecules, only identical H2O molecules, or a mixture of O2 and H2O molecules. Classify each in the pure-substance/mixture hierarchy and explain.
  - Expected performance (DE): Die lernende Person ordnet O2 als elementaren Reinstoff, H2O als Verbindungs-Reinstoff und die gemeinsame Karte als Gemisch ein; sie nennt gleiche bzw. verschiedene Teilchensorten und Atomsorten.
  - Expected performance (EN): The learner classifies O2 as a pure element, H2O as a pure compound and the combined card as a mixture, citing particle and atom types.
  - Understanding focus (DE): Hierarchie und Bindungen begründen die Einordnung.
  - Understanding focus (EN): Hierarchy and bonding justify the classification.
- `fresh-two-compound-mixture`
  - Task demand (DE): Eine neue Karte zeigt Wasser- und Kohlenstoffdioxid-Moleküle zusammen, eine zweite nur Chlor-Moleküle Cl₂. Ordne beide Karten als Reinstoff oder Gemisch ein; entscheide beim Reinstoff Element oder Verbindung. Erkläre, warum zwei Verbindungen zusammen nicht ein einzelner Reinstoff sind.
  - Task demand (EN): A fresh card combines water and carbon dioxide molecules; another contains only chlorine molecules Cl₂. Classify both cards as pure substance or mixture; decide whether the pure substance is an element or compound. Explain why two compounds together are not one pure substance.
  - Expected performance (DE): Die lernende Person erkennt Wasser/CO₂ als Gemisch zweier Verbindungen und Cl₂ als elementaren Reinstoff. Zwei gleiche Chloratome bilden ein Molekül eines Elements, keine Verbindung verschiedener Elemente; Wasser und CO₂ bleiben zwei Stoffe.
  - Expected performance (EN): The learner identifies water/CO₂ as a mixture of two compounds and Cl₂ as a pure element. Two identical chlorine atoms form a molecule of an element, not a compound of different elements; water and CO₂ remain two substances.
  - Understanding focus (DE): Molekül bedeutet nicht automatisch Verbindung; mehrere Verbindungen zusammen sind ein Gemisch. Die Einordnung bleibt im altersgerechten Molekülmodell.
  - Understanding focus (EN): Molecule does not automatically mean compound; several compounds together form a mixture. The classification stays within the age-appropriate molecular model.
## Page 10: Gesellschaftliche Folgen der Wirkstoffentwicklung historisch und aktuell bewerten

- Full learning-goal ID: `4965395d-e0c5-5e23-a408-a11712aab409`
- Goal fingerprint: `sha256:9bde66bc22bd5a5c4e664646baf41ee6f0a760aaa50d965901c8c5a7c7478e2d`
- Page fingerprint: `sha256:fea9737d55df32e55430e601d2bf1091ee9810fb88968a8c514c22e0c4e92c23`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann anhand bereitgestellter Beispiele die Auswirkungen der Entwicklung von Medikamenten in historischen und aktuellen gesellschaftlichen Zusammenhängen anhand belegter Wirkung, Versorgung und Zugang, Kosten, Sicherheit sowie Resistenz- und Evidenzgrenzen begründet bewerten und ihr Urteil bei geänderten Wirksamkeitsannahmen revidieren.

### Visualization

/assets/goal-visualizations/chemie/4965395d-e0c5-5e23-a408-a11712aab409/4965395d-e0c5-5e23-a408-a11712aab409.png

- original digest: `sha256:a186d4fc32bf522040786a746fb9c603c88c30e63199ef9717f966a8c3ad8596`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Wirkstoffentwicklung historisch und aktuell begründet bewerten — `1b1a7493-1708-509b-962a-ff8195e2c3b4` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1f0f73eac57e2a688275c0757af3fca00559c5b42bd08725ea6ba9901c7d92a1`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `modeling`

**Positive understanding expectations**

- `hb232-historical-current-drug-impact`
  - Essential understanding (DE): Forschung wirkt gesellschaftlich über belegte Wirkung,Entwicklung,Produktion und Zugang;historischer/heutiger Nutzen braucht Kriterien und Grenzen.
  - Essential understanding (EN): Research affects society through supported effects,development,production and access;historical/current benefit needs criteria/limits.
  - Observable performance (DE): Die lernende Person bewertet historische und aktuelle gesellschaftliche Bedeutung am vollständigen Fall und revidiert Annahmen bei neuen Resistenzdaten.
  - Observable performance (EN): The learner evaluates historical/current societal significance in the complete case and revises assumptions under new resistance evidence.

**Coverage expectations**

- required expectations: `hb232-historical-current-drug-impact`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `hb232-historical-current-drug-impact-transfer`: Bedingungswechsel im vollständigen Transfer selbstständig berücksichtigen. / Independently account for changed conditions in the complete transfer.

**Application cases**

- `hb232-drug-society-3eb2`
  - Task demand (DE): Bewerte gesellschaftliche Bedeutung historisch UND aktuell anhand Nutzen,Zugang,Kosten,Sicherheit,Resistenz und Evidenzgrenzen. Unterscheide Befund,Entwicklung,großtechnische Verfügbarkeit und Werbeversprechen. Begründe eine bedingte Förderwahl;Zahlen sind keine medizinische Freigabe.
  - Task demand (EN): Evaluate societal significance historically AND today using benefit,access,cost,safety,resistance and evidence limits. Distinguish finding,development,industrial availability and marketing. Justify a conditional funding choice;numbers give no medical approval.
  - Expected performance (DE): Historischer Nutzen braucht Entwicklung,Produktion und Zugang über Entdeckung hinaus. Bei angenommener gleicher Wirkung spricht im Modell mehr Zugang,niedrigerer Index und Überwachung für A. Das Urteil legt Werte/Kriterien offen. Neue Forschung kann wichtig sein;Neuheit allein belegt weder Wirkung noch gesellschaftlichen Gesamtnutzen.
  - Expected performance (EN): Historical benefit needs development,production and access beyond discovery. With assumed equal efficacy,greater access,lower index and monitoring favour A in this model. Judgment states values/criteria. New research can matter;novelty alone proves neither efficacy nor overall societal benefit.
  - Understanding focus (DE): Forschung wirkt gesellschaftlich über belegte Wirkung,Entwicklung,Produktion und Zugang;historischer/heutiger Nutzen braucht Kriterien und Grenzen.
  - Understanding focus (EN): Research affects society through supported effects,development,production and access;historical/current benefit needs criteria/limits.
- `hb232-drug-society-3eb2-existing-fresh-transfer`
  - Task demand (DE): Neue Resistenzdaten machen alten Wirkstoff für einen Teil unwirksam;belastbare Vergleichsdaten für B fehlen. Übertrage die Entscheidung.
  - Task demand (EN): New resistance data make the old drug ineffective for some;robust comparative evidence for B is absent. Transfer the decision.
  - Expected performance (DE): Gleiche-Wirkung-Annahme entfällt;alte Zahlenrangfolge reicht nicht. Neue Wirksamkeits-/Sicherheitsdaten und Zielgruppenabgrenzung nötig. Forschung/Überwachung neu gewichten;B-Wirkung nicht erfinden,keine Behandlung empfehlen.
  - Expected performance (EN): Equal-efficacy assumption fails;old numerical ranking no longer suffices. New efficacy/safety evidence and population definitions needed. Reweight research/monitoring;invent no B efficacy and recommend no treatment.
  - Understanding focus (DE): Neue Resistenzbefunde heben die vorherige Annahme gleicher Wirksamkeit auf. Das bedingte gesellschaftliche Urteil muss auf neue Evidenzgrenzen reagieren, ohne eine Wirkung von B zu erfinden oder eine Behandlung zu empfehlen.
  - Understanding focus (EN): New resistance findings invalidate the previous equal-efficacy assumption. The conditional societal judgment must respond to changed evidence limits without inventing efficacy for B or recommending treatment.
## Page 11: Qualitätskontrolle von Arzneimitteln an Belegen beurteilen

- Full learning-goal ID: `4a7dee38-1056-5e27-acec-e6a12f58109f`
- Goal fingerprint: `sha256:1dadb8c105a2e71dab7765573e528cacfb3435492020ee871abcbe5f4071e626`
- Page fingerprint: `sha256:e934402404c08d59ea1d033690016a8610a293f37e3afa31eccd459ab5995cce`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann an vorgegebenen Arzneimittel-Unterlagen begründet beurteilen, welche Aussagen über Qualität durch chemische Analytik, dokumentierte gute Herstellungspraxis und den allgemeinen Zweck des Arzneimittelgesetzes gestützt sind, und zwischen diesen Belegarten sowie offenen Qualitätsfragen unterscheiden.

### Visualization

/assets/goal-visualizations/chemie/4a7dee38-1056-5e27-acec-e6a12f58109f/4a7dee38-1056-5e27-acec-e6a12f58109f.png

- original digest: `sha256:c5b9551c683f6f0a9a48622e38200e72aa08aacce9fe8bebfe67b96b19818222`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Chemische Daten dokumentieren und deuten — `49b13b33-34b7-5e4e-861c-b21082cb9922` (outside this book)
- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Arzneimittel-Qualitätsdossiers nach Belegarten beurteilen — `e883c5e9-5634-5a46-a013-15d5a684c5cd` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:acb5ec6b15b6f08a73f2f6a97e8e6d6f6a3d02a03d025a3c8828b45acaca46ad`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `concept`

**Positive understanding expectations**

- `4a7dee38-whole-1`
  - Essential understanding (DE): Analytik und dokumentierte Prozesskontrolle beantworten verschiedene Qualitätsfragen.
  - Essential understanding (EN): Analysis and documented process control answer different quality questions.
  - Observable performance (DE): Ordne im fiktiven Dossier konkrete analytische Befunde und GMP-/Rückverfolgbarkeitsbelege zu; erläutere ihre Reichweite und fehlende Information anhand der bereitgestellten Methodenkarte.
  - Observable performance (EN): Assign concrete analytical findings and GMP/traceability evidence in the fictional dossier; explain scope and missing information using the supplied method card.
- `4a7dee38-whole-2`
  - Essential understanding (DE): Der allgemeine AMG-Zweck ist kein tatsächlicher Einzelfallnachweis oder Ersatz für chemische Belege.
  - Essential understanding (EN): The general AMG purpose is no actual individual authorisation proof or substitute for chemical evidence.
  - Observable performance (DE): Beurteile die begrenzte Qualitätsaussage mit Analytik, Prozessdokumentation und allgemeinem Gesetzeszweck. Löse einen frischen Blank-/Verunreinigungs-/Zuordnungswechsel ohne Rechtsberatung, klinischen Wirksamkeitsnachweis oder reale Chargenfreigabe.
  - Observable performance (EN): Assess a bounded quality claim through analysis, process records and general statutory purpose. Solve a fresh blank/impurity/attribution change without legal advice, clinical efficacy proof or real batch release.

**Coverage expectations**

- required expectations: `4a7dee38-whole-1`, `4a7dee38-whole-2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-condition`: Frische Methodenbedingung oder Beleglage selbstständig beurteilen. / Independently assess a fresh method condition or evidence situation.

**Application cases**

- `pharma-qc-missing-process-records`
  - Task demand (DE): Ordne die vorhandenen und fehlenden Belege Analytik, guter Herstellungspraxis und gesetzlichem Rahmen zu. Beurteile den Werbeschluss und nenne konkret offene Qualitätsfragen. Material: Eigenes fiktives Arzneimittel-Lehrdossier, kein echtes Präparat. Methodenkarte: Chemische Analytik prüft im validierten Methodenbereich Merkmale wie Identität, Gehalt und Verunreinigungen. Gute Herstellungspraxis(GMP) betrifft kontrollierte, dokumentierte Herstellungs-/Prüfprozesse und Rückverfolgbarkeit; eine Peakzeit allein dokumentiert dies nicht. Das AMG nennt als allgemeinen Zweck Schutz im Arzneimittelverkehr insbesondere für Qualität, Wirksamkeit und Unbedenklichkeit (§1, amtlich:https://www.gesetze-im-internet.de/amg_1976/__1.html, tatsächlicher Abruf16.10.2026). Das ist keine hieraus abgeleitete Einzelfallfreigabe. Fiktive ChargeX: Eine Chromatografie ist mit Referenz vereinbar; Detektionsgrenze, vollständige Verunreinigungsprüfung und Chargen-/Reinigungsprotokoll fehlen. Werbung:“Ein Peak beweist Qualität und gesetzliche Freigabe.“
  - Task demand (EN): Assign available/missing evidence to analysis, GMP and legal framework. Assess the advertising inference and identify specific open quality questions. Material: Own fictional pharmaceutical teaching dossier, not an actual product. Method card: chemical analysis checks characteristics such as identity, content and impurities within a validated method scope. GMP concerns controlled, documented manufacturing/testing processes and traceability; a peak time alone does not document this. AMG§1 states the general purpose of protection in medicines circulation, especially quality, efficacy and safety (official:https://www.gesetze-im-internet.de/amg_1976/__1.html, actually accessed16Oct2026). This does not yield an individual authorisation decision. Fictional batchX: chromatography is reference-compatible; detection limit, complete impurity testing and batch/cleaning records are absent. Advertisement:“One peak proves quality and legal approval.”
  - Expected performance (DE): Der kompatible Peak stützt eine begrenzte analytische Aussage, keine eindeutige Reinheit oder Gesamtqualität. Fehlende Chargen-/Reinigungsdokumentation lässt Prozesskontrolle/Rückverfolgbarkeit offen. §1 benennt ein Schutzziel, beweist aber nicht, dassX Anforderungen erfüllt oder freigegeben ist. Nachweisspektrum/-grenze, weitere Qualitätsprüfungen und belastbare Prozessbelege fehlen. Aus dem Lehrblatt folgt weder Anwendungsrat noch tatsächliche Freigabeentscheidung. Frischer Transfer: Nein. Bessere Prozessdokumentation ersetzt die fehlende analytische Selektivität nicht. Die offene Verunreinigungsfrage benötigt geeignete weitere Analytik; keine reale Charge wird hier beurteilt oder freigegeben.
  - Expected performance (EN): The compatible peak supports limited analytical evidence, not unique purity or overall quality. Missing batch/cleaning records leave process control/traceability unresolved. §1 states a protective purpose but does not proveX meets requirements or is authorised. Detection scope/limit, further quality tests and reliable process evidence are missing. This sheet gives neither treatment advice nor an actual release decision. Fresh transfer: No. Better process documentation does not replace missing analytical selectivity. The impurity question needs suitable further analysis; no real batch is judged or released here.
  - Understanding focus (DE): Ganzer benannter E0/G0-Entwurf, vollständige Aufgabe/Lösung/Transfer/Rubrik im Materialobjekt pharma-qc-missing-process-records. Kein beobachteter Lernerfolg.
  - Understanding focus (EN): Whole named E0/G0 design, full task/answer/transfer/rubric in material object pharma-qc-missing-process-records. No observed learner performance.
- `pharma-qc-labelled-approval-and-blank`
  - Task demand (DE): Beurteile anhand der Methodenkarte die Aussage„Das Etikett und die Protokolle machen jede aktuelle Analytik überflüssig“. Welche Belege helfen, welche konkrete Frage bleibt offen? Material: Fiktives UnterrichtsdossierY, keine echten Herstellerdaten: Eine Broschüre trägt das unbestätigte Etikett„zugelassen“. Es gibt nachvollziehbare Chargen-/Prüfdokumentation, eine quantitative Methode mit Kalibrierung im angegebenen Bereich, doch die aktuelle Leerprobe zeigt ein Störsignal nahe dem Zielsignal. Eine zweite Broschüre verweist nur auf AMG§1. Die vollständig bereitgestellte Methodenkarte von Fall1 unterscheidet Analytik, dokumentierte GMP und gesetzlichen Schutzzweck. Keine Aussage zur realen Zulassung oder zu klinischen Wirkungen wird geprüft.
  - Task demand (EN): Assess“the label and records make current analysis unnecessary”using the supplied method card. Which evidence helps and which specific question remains open? Material: Fictional dossierY, not actual manufacturer data: a brochure has an unverified“authorised”label. Traceable batch/testing documentation and a calibrated quantitative method within a stated range are available, but the current blank has an interference near the target signal. Another brochure cites onlyAMG§1. The complete method card fromcase1 distinguishes analysis, documented GMP and legal protective purpose. No actual authorisation or clinical-effect claim is tested.
  - Expected performance (DE): Dokumentierte Prozesse sind relevante Belege; Kalibrierung hilft nur innerhalb eines störungsarmen Methodenbereichs. Ein Störsignal der Leerprobe kann Zuordnung/Quantifizierung verfälschen und muss aufgeklärt werden. Ungeprüftes Etikett und allgemeiner Gesetzeszweck ersetzen weder aktuelle Analytik noch belegte rechtliche Entscheidungen. Offen bleiben Ursache, Selektivität und Bedeutung des Blanks, ohne daraus automatisch echte Unbrauchbarkeit oder Unzulässigkeit eines realen Mittels abzuleiten. Frischer Transfer: Die analytische Störung ist behoben; die Zuordnung/Rückverfolgbarkeit der Prozessdokumentation bleibt offen. Dies sind unterschiedliche Fragen. Ein guter Analysenlauf ersetzt keine verlässliche Chargenzuordnung.
  - Expected performance (EN): Documented processes are relevant; calibration helps only within an interference-controlled scope. A blank interference can distort assignment/quantification and needs investigation. An unverified label and general statutory purpose replace neither current analysis nor documented legal decisions. Cause, selectivity and significance of the blank remain open, without automatically judging an actual medicine unusable or unlawful. Fresh transfer: The analytical interference is resolved; attribution/traceability of process records remains open. These are distinct questions. A good analytical run does not replace reliable batch attribution.
  - Understanding focus (DE): Ganzer benannter E0/G0-Entwurf, vollständige Aufgabe/Lösung/Transfer/Rubrik im Materialobjekt pharma-qc-labelled-approval-and-blank. Kein beobachteter Lernerfolg.
  - Understanding focus (EN): Whole named E0/G0 design, full task/answer/transfer/rubric in material object pharma-qc-labelled-approval-and-blank. No observed learner performance.
## Page 12: Die Aussagekraft chemischer Daten beurteilen

- Full learning-goal ID: `4aa3a130-b517-5ac5-87b2-147fe432cadd`
- Goal fingerprint: `sha256:e66d637f6a24d6598da4d720f9f9cd4308c43541fb974bc6a72d856c6c04acdd`
- Page fingerprint: `sha256:3285d507be30c837de600ff6fc2d3f942d153564cf69c537ee7bce7a0620225c`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Angemessenheit, Gültigkeit und Tragweite erhobener oder recherchierter chemischer Daten beurteilen, mögliche Mess- und Verfahrensfehler anhand der Untersuchungsbedingungen begründen und erklären, welche Schlussfolgerungen die Daten tragen und welche nicht.

### Visualization

/assets/goal-visualizations/chemie/4aa3a130-b517-5ac5-87b2-147fe432cadd/4aa3a130-b517-5ac5-87b2-147fe432cadd.png

- original digest: `sha256:470ca386b735383103c7b9c458015f4ea3354587bd8e41dde4cbb30fa97f3dc0`
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
- Wissenschaftliche Gültigkeitskriterien anwenden — `a0080b5f-13ff-56bc-b8ff-2ff6273e2ec1` (outside this book)
- Komplexometrische EDTA-Titrationen durchführen — `e22a34d4-ac1e-5afe-8f77-0dfa4fd9f44f` (outside this book)
- Stoffgemische qualitativ und quantitativ analysieren — `57d2c98d-30b8-5123-b823-e56a4f22b191` (outside this book)
- Unbekannte Reinstoffproben analytisch identifizieren — `7b80efe6-b77d-5ace-8886-973ba38e6f9e` (outside this book)
- Konduktometrische Fällungstitrationen durchführen und auswerten — `7c0b944d-3f1f-5d26-84b0-2a359f689cf0` (outside this book)
- Fotometrische Konzentrationsbestimmungen auswerten — `ba621c67-b750-5e45-ab37-a51ea45e3ccf` (outside this book)
- Reinstoffgehalt in Stoffgemischen bestimmen — `e313c1ee-a617-54ed-adea-c183da1e03d8` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:9382eb5955f80337e4ab6f3e98f5c73fb8d95bc30f4e193d8fe3b2d8448e06b3`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `adequacy-for-question`
  - Essential understanding (DE): Daten sind nur für eine Fragestellung angemessen, wenn Messprinzip, Probenbedingungen und benötigte Unterscheidung zusammenpassen.
  - Essential understanding (EN): Data are adequate for a question only when measurement principle, sample conditions and required distinction fit together.
  - Observable performance (DE): Prüft am Farbtest Selektivität/Blank und am Leitfähigkeitsvergleich Temperatur, Ionensorte und Kontrollprobe; trennt Messantwort von Stoffidentifikation.
  - Observable performance (EN): Checks selectivity/blank for the colour test and temperature, ion type and control for the conductivity comparison; separates measurement response from substance identification.
- `bounded-conclusion`
  - Essential understanding (DE): Eine positive Antwort eines kreuzreaktiven Tests beweist keinen eindeutigen Stoff; ein unkontrollierter Temperaturunterschied beweist keine Konzentrationsdifferenz.
  - Essential understanding (EN): A positive cross-reactive test does not prove a unique substance; an uncontrolled temperature difference does not prove a concentration difference.
  - Observable performance (DE): Begründet unterstützte und nicht unterstützte Aussagen mit X/Y/Blank bzw. A20/A35/B35 und begrenzt die ±3-Streuung auf das gegebene Modell.
  - Observable performance (EN): Justifies supported and unsupported claims using X/Y/blank or A20/A35/B35 and confines ±3 scatter to the supplied model.
- `fresh-validity-check`
  - Essential understanding (DE): Ein ausgeschlossener Störstoff beseitigt nicht alle Unsicherheit; eine neue ungeladene Matrixkomponente kann Ionenbeweglichkeit verändern.
  - Essential understanding (EN): Excluding one interferent does not remove all uncertainty; a new uncharged matrix component may change ion mobility.
  - Observable performance (DE): Nennt nach Y-Ausschluss weitere relevante Testgrenzen und entwickelt bei Saccharosezugabe einen temperatur- und matrixgleichen Kontroll-/Kalibriervergleich.
  - Observable performance (EN): Names further relevant test limits after excluding Y and develops a temperature- and matrix-matched control/calibration comparison for added sucrose.

**Coverage expectations**

- required expectations: `adequacy-for-question`, `bounded-conclusion`, `fresh-validity-check`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `interferent-exclusion`: Ein bekannter Kreuzreaktant entfällt; andere Interferenzen und Nachweisgrenze bleiben zu prüfen. / One known cross-reactant is removed; other interferences and detection limit still need checking.
- `matrix-change`: Temperaturkontrolle wird um Saccharose-/Viskositäts- und Matrixkontrolle erweitert. / Temperature control is extended by sucrose/viscosity and matrix control.

**Application cases**

- `data-validity-test-not-proof`
  - Task demand (DE): Beurteile Gültigkeit, geeignete Quellen, Blind-/Positivkontrollen und Tragweite von „U enthält X“. Benenne einen Verfahrensfehler und eine geeignete Folgemethode.
Frische Variation: Wenn Y ausgeschlossen wird, erkläre, welche weiteren Informationen vor einem eindeutigen Nachweis noch fehlen können.
  - Task demand (EN): Assess validity, suitable sources, blank/positive controls and the scope of “U contains X”. Identify a procedure error and a suitable follow-up method.
Fresh variation: If Y is excluded, explain what further information may still be missing before unique proof.
  - Expected performance (DE): Die Blank-/Positivkontrolle zeigt grundsätzliches Testansprechen; Y macht den Test nicht spezifisch. U-Farbe ist ein Hinweis auf eine reagierende Komponente, kein eindeutiger X-Nachweis. S ist für Spezifität relevanter als das verkürzte Etikett H; unbekannte Verdünnung/Erhitzung kann Signal verändern. Eine unabhängig spezifischere Analyse mit dokumentierten Bedingungen ist nötig. Blindproben korrigieren keinen grundsätzlich unspezifischen Reaktionsmechanismus. Weil X/Y hier keine Stoffidentitäten oder Trennmerkmale haben, darf kein benanntes Gerät ungeprüft als X-spezifisch gelten. Akzeptabel ist eine konkrete kontrollierte Wiederholung mit dokumentierter Verdünnung/Temperatur und eine begründete Planung zur Validierung einer ergänzenden Methode an bekannten X-, Y- und Blindproben. Für einen eindeutigen X-Nachweis muss deren Spezifität erst belegt werden; Wiederholung des unspezifischen Tests allein identifiziert X weiterhin nicht.
Frischer Transfer: Der Ausschluss von Y beseitigt nur den bekannten Kreuzreaktanten Y. Weitere unbekannte Stoffe, Matrix-/pH-/Temperaturbedingungen, Nachweisgrenze, Empfindlichkeit und Störreaktionen bleiben mögliche Grenzen. Eine positive Antwort ist nur bei dokumentiert validierter Selektivität und passenden Probenbedingungen eine starke Stütze für X. Weitere bekannte X-/Nicht-X-Proben, Blank, geeignete Matrixkontrollen und eine für X validierte unabhängige Methode würden die Aussage verstärken. Eine beliebig genannte zweite Apparatur garantiert noch keine Selektivität. Erhitzen oder Verdünnen kann die tatsächliche Probe verändern; ursprüngliche Probenbedingungen erhalten und kenntlich machen. Kein absoluter Nachweis aller unbekannten Möglichkeiten folgt aus Y-Ausschluss.
  - Expected performance (EN): Blank/positive controls show that the test responds in principle; Y makes it non-specific. U colour indicates a reacting component, not unique proof of X. S is more relevant to specificity than the shortened label H; unknown dilution/heating may alter the signal. An independent more specific analysis under documented conditions is needed. Blanks do not correct an inherently non-specific reaction mechanism. Because X/Y have no identities or discriminating properties here, no named instrument may be presumed X-specific. Accept a concrete controlled repeat with documented dilution/temperature and a justified plan to validate an additional method against known X, Y and blank samples. Its specificity must first be established for unique proof of X; repeating the non-specific test alone still does not identify X.
Fresh transfer: Excluding Y removes only the known cross-reactant Y. Other unknown substances, matrix/pH/temperature conditions, detection limit, sensitivity and interfering reactions remain possible limits. A positive response strongly supports X only with documented validated selectivity and appropriate sample conditions. Further known X/non-X samples, blank, suitable matrix controls and an independent method validated for X would strengthen the claim. Simply naming a second instrument does not guarantee selectivity. Heating or dilution may change the actual sample; retain and label original sample conditions. Excluding Y does not exclude every unknown possibility absolutely.
  - Understanding focus (DE): Neue Selektivitätsinformation begrenzt den Nachweisanspruch konkret statt ihn absolut zu machen.
  - Understanding focus (EN): New selectivity information bounds the identification claim concretely rather than making it absolute.
- `data-validity-temperature-confound`
  - Task demand (DE): Prüfe, welche Folgerung durch Daten getragen wird, welche Störgröße vorliegt und wie ein gültiger Stoffmengenvergleich verbessert werden kann.
Frische Variation: Plane den Vergleich, wenn Probe B zusätzlich Saccharose enthält; erläutere die Grenze reiner Leitfähigkeitsdaten.
  - Task demand (EN): Assess which conclusion the data support, the confounder present and how to improve a valid amount comparison.
Fresh variation: Plan the comparison if B additionally contains sucrose; explain the limit of conductivity-only data.
  - Expected performance (DE): Die 500-µS/cm-Differenz ist mit Temperatur gekoppelt; Kontrolle A35 liegt innerhalb grober Streuung bei B35. Daten belegen kein Mehr an Salz in B. Gleiche Temperatur, Standards, Wiederholungen und bekannte Kompensation/gleiches Ionensystem sind nötig. Streuungsangabe ist nicht die vollständige Messunsicherheit; selbst temperaturgleiche Leitfähigkeit wäre bei unbekannten Ionensorten keine eindeutige NaCl-Konzentration.
Frischer Transfer: Saccharose liefert im beschriebenen Modell keine zusätzlichen dissoziierten Ionen, kann aber Lösungsmatrix und Viskosität und damit die Beweglichkeit vorhandener Ionen verändern. Aus κ lässt sich deshalb weder Saccharosemenge noch gesamter gelöster Stoff direkt bestimmen. Bei gleicher Temperatur NaCl-Kontrollen mit/ohne gleiche Saccharosematrix, geeignete Blanks und eine für diese Matrix validierte Konzentrationskalibrierung vergleichen. Die bereits vorgegebenen A35/B35-Werte enthalten keine neue Saccharosemessung. Eine Behauptung höherer NaCl-Konzentration wäre nur innerhalb geprüfter Ionensorte, Temperatur und Matrix zulässig; die ±3-Wiederholstreuung ersetzt keine Gesamtunsicherheit.
  - Expected performance (EN): The 500-µS/cm difference is confounded by temperature; A35 control lies within rough scatter of B35. Data do not establish more salt in B. Equal temperature, standards, repeats and known compensation/the same ion system are needed. The scatter estimate is not full measurement uncertainty; even equal-temperature conductivity would not uniquely determine NaCl concentration for unknown ion species.
Fresh transfer: Sucrose supplies no additional dissociated ions in the described model but may change solution matrix and viscosity and therefore mobility of existing ions. κ therefore does not directly determine sucrose amount or total dissolved material. At equal temperature compare NaCl controls with/without the same sucrose matrix, suitable blanks and concentration calibration validated for this matrix. The existing A35/B35 values contain no new sucrose measurement. A claim of higher NaCl concentration would be valid only within checked ion type, temperature and matrix; ±3 repeat scatter is not total uncertainty.
  - Understanding focus (DE): Temperaturkontrolle allein löst bei neuer Matrix nicht alle Konzentrations-Gültigkeitsfragen.
  - Understanding focus (EN): Temperature control alone does not resolve every concentration-validity question in a new matrix.
## Page 13: Oxidationsprodukte von Alkanolen erklären

- Full learning-goal ID: `5851b53a-162b-5c17-9269-510ee54ad846`
- Goal fingerprint: `sha256:ebc73cd6625e4da997dff260d03f829199ffa5fcf355f8987af37ababb773106`
- Page fingerprint: `sha256:87955f106b56e204ec49353684000d2822d626694b78105bd99ff729a3b25f30`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

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

Status: `needs_human_review`; profile fingerprint: `sha256:3e9deab1ac46ecb879e7aca3999907c839720168fdf505287d316f2a3197207e`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `b002-5851b53a-core`
  - Essential understanding (DE): Die lokale Klasse des Alkanols bestimmt das erste Carbonylprodukt: primär zu Aldehyd, sekundär zu Keton; ein primäres Aldehyd kann weiter zur Carbonsäure oxidieren.
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
## Page 14: Nanoskalige Silikonoberflächen materialgestützt beurteilen

- Full learning-goal ID: `6413429b-53d8-5ad1-9af6-d0e562cbf0f5`
- Goal fingerprint: `sha256:48fc2d416ba8556f96420896abc0720d7642a85305f1bd6cc613e12e75efe8cc`
- Page fingerprint: `sha256:a3d4f3ad313ba9d32ae217ba27dde770be954ae18464b150ca049a7b2c8c9e01`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Bedeutung von Silikonen für nanoskalige Oberflächenanwendungen anhand von Materialdaten erläutern und Benetzungsbehauptungen beurteilen, indem sie Schichtdicke von Partikelgröße unterscheidet sowie Silikonchemie und Oberflächenstruktur berücksichtigt.

### Visualization

/assets/goal-visualizations/chemie/6413429b-53d8-5ad1-9af6-d0e562cbf0f5/6413429b-53d8-5ad1-9af6-d0e562cbf0f5.png

- original digest: `sha256:241fd5bbbf3a80a1dea330e59fe4e3bf313018af91e4322b478cd0c623b31643`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Silikonoberflächen anhand von Benetzungsdaten beurteilen — `990b6704-879b-522c-a82c-99ce55944cf1` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:87defac088268c47ee7a71e4befc950460b6a897da4f510db899c478f53c678b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Silikone können in nanoskaligen Oberflächenanwendungen relevant sein; Schichtdicke und Partikelgröße sind unterschiedliche Größen.
  - Essential understanding (EN): Silicones can be relevant in nanoscale surface applications; film thickness and particle size are different dimensions.
  - Observable performance (DE): Erläutert eine materialgestützte Nano-Anwendung und trennt Dicke von separat belegter oder unbelegter Partikelgröße.
  - Observable performance (EN): Explains a material-based nano application and separates thickness from independently evidenced or unsupported particle size.
- `e2`
  - Essential understanding (DE): Benetzung hängt von Silikonchemie und Oberflächenstruktur ab; eine gleiche Dicke allein erklärt keine gleiche Benetzung.
  - Essential understanding (EN): Wetting depends on silicone chemistry and surface structure; equal thickness alone does not account for equal wetting.
  - Observable performance (DE): Nutzt die Gleichchemie-Strukturvariation und Gleichdicken-Chemiekontrolle; trennt Kontaktwinkel von Abrollwinkel.
  - Observable performance (EN): Uses same-chemistry structural variation and equal-thickness chemistry control; distinguishes contact angle from roll-off angle.
- `e3`
  - Essential understanding (DE): Daten zu Tropfenbewegung stützen begrenzte Funktionsaussagen, beweisen aber keine Schmutzentfernung oder dauerhafte Selbstreinigung.
  - Essential understanding (EN): Droplet-motion data support bounded functional claims but establish neither dirt removal nor durable self-cleaning.
  - Observable performance (DE): Beurteilt bei geänderter Struktur eine Anwendungsbehauptung und nennt den fehlenden passenden Funktions-/Belastungsnachweis.
  - Observable performance (EN): Assesses an application claim after changed structure and identifies missing relevant functional/loading evidence.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Schichtdicke gegenüber unabhängiger Partikelmessung / Film thickness versus independent particle measurement
- `v2`: Gleiche Chemie, andere Oberflächenstruktur / Same chemistry, different surface structure
- `v3`: Kontaktwinkel, Abrollen und tatsächlicher Funktionsnachweis / Contact angle, roll-off and actual function evidence

**Application cases**

- `e560-nanosurface-case-1`
  - Task demand (DE): 1. Erläutere an diesem Beispiel die Bedeutung von Silikonen für eine nanoskalige Oberflächenanwendung: Welche chemischen und strukturellen Hinweise können Wasserabweisung und bewegliche Tropfen erklären? 2. Vergleiche glatt/nanostrukturiert und die hydrophile Kontrolle. Trägt die Schichtdicke allein das Benetzungsurteil? 3. Prüfe „40 nm Dicke beweist 40 nm Silikonpartikel und eine dauerhaft selbstreinigende Oberfläche“. Begründe, welche Aussagen gestützt sind und welche weitere Beobachtung nötig wäre.
  - Task demand (EN): 1. Explain silicone relevance for a nanoscale surface application in this example: which chemistry/structure evidence can account for water repellency and mobile drops? 2. Compare smooth/nanostructured surfaces and the hydrophilic control. Does film thickness alone establish wetting behaviour? 3. Evaluate “40 nm thickness proves 40 nm silicone particles and a permanently self-cleaning surface.” Explain supported claims and a needed further observation.
  - Expected performance (DE): Eine nanoskalige Siloxanschicht kann als funktionale Oberfläche genutzt werden. Organische Methylgruppen sind mit Wasserabweisung vereinbar; bei gleicher Silikonchemie zeigen geänderte Oberflächenstruktur und 105°/35° gegenüber 155°/5°, dass Chemie allein nicht das gesamte Verhalten festlegt. Der kleinere Abrollwinkel unterstützt beweglichere Tropfen unter den gegebenen Bedingungen. Die hydrophile 40-nm-Kontrolle zeigt, dass gleiche Dicke nicht gleiche Benetzung bedeutet. 40 nm ist eine Schichtdimension, kein gemessener Partikeldurchmesser. Bewegliche Tropfen machen die Anwendung für wasserabweisende/gegebenenfalls reinigende Oberflächen interessant, beweisen aber weder tatsächlichen Schmutzabtrag noch Dauerhaftigkeit. Dafür sind passende Beobachtungen zum Schmutzabtrag und zum Verhalten nach Abrieb nötig; Nano bedeutet nicht automatisch mehr Funktion oder Sicherheit.
  - Expected performance (EN): A nanoscale siloxane film can provide a functional surface. Organic methyl groups are compatible with water repellency; at the same silicone chemistry, changed structure and 105°/35° versus 155°/5° show that chemistry alone does not determine all behaviour. Smaller roll-off angle supports more mobile drops under the stated conditions. The hydrophilic 40-nm control shows that equal thickness does not mean equal wetting. The 40 nm value is a film dimension, not a measured particle diameter. Mobile drops make such surfaces relevant for water-repellent/potentially cleaning applications but establish neither actual dirt removal nor durability. Appropriate dirt-removal observations and behaviour after abrasion are needed; nano does not automatically mean greater function or safety.
  - Understanding focus (DE): Erklärt Nano-Oberflächenanwendung über Silikonchemie und Struktur; trennt Schichtdicke von fehlendem Partikeldurchmesser. / Interpretiert die kontrollierte Strukturvariation und die hydrophile Gleichdickenkontrolle; Chemie und Struktur tragen getrennte Bezüge. / Leitet beweglichere Tropfen aus dem kleineren Abrollwinkel ab und begrenzt Selbstreinigung/Dauerhaftigkeit wegen fehlendem Schmutz-/Abriebnachweis.
  - Understanding focus (EN): Explains nanoscale surface application using silicone chemistry and structure; separates film thickness from missing particle diameter. / Interprets controlled structural variation and hydrophilic equal-thickness control; chemistry and structure contribute distinct links. / Uses smaller roll-off angle to infer more mobile drops and limits cleaning/durability claims because dirt/abrasion evidence is missing.
- `e560-nanosurface-case-2`
  - Task demand (DE): 1. Beschreibe die mögliche Bedeutung der Silikonoberfläche für die Anwendung und unterscheide die beiden Größenangaben 80 nm und 45 nm. 2. Erläutere, was aus A/B bei gleicher Chemie über die Wirkung der Struktur folgt. Beurteile „B hat immer noch einen großen Kontaktwinkel, also rollen Tropfen so leicht ab wie bei A“. 3. Prüfe, ob A oder B damit dauerhaft selbstreinigend ist, und gib ein begrenztes Anwendungsurteil mit einer konkret nötigen weiteren Beobachtung.
  - Task demand (EN): 1. Describe possible silicone-surface relevance for the application and distinguish the 80 nm and 45 nm dimensions. 2. Explain what A/B at the same chemistry show about structural effects. Evaluate “B still has a large contact angle, so drops roll off as easily as in A.” 3. Assess whether A or B is thereby permanently self-cleaning and give a bounded application conclusion with a specific further observation needed.
  - Expected performance (DE): Die 80 nm betreffen die Schicht; 45 nm ist eine separat ausgewiesene Partikelgröße ausschließlich für C. Ohne die Zusatzangabe dürfte man keine Partikelgröße aus 80 nm ableiten. Silikonchemie und passende Oberflächenstruktur können zur nanoskaligen Funktionalisierung beitragen. A/B haben gleiche Chemie, aber andere Struktur und stark unterschiedliche Abrollwinkel. Ein hoher Kontaktwinkel in B bedeutet nach den Angaben nicht gleich leichte Tropfenbewegung: 40° verlangt deutlich mehr Neigung als 5°. Die hydrophile Gleichdickenkontrolle verhindert eine Erklärung allein aus der Dicke. A erscheint für bewegliche Tropfen unter den gegebenen Bedingungen günstiger; echter Schmutztransport, Abrieb- oder Langzeitbeständigkeit bleiben unbelegt. Eine Beobachtung des Schmutzabtrags vor/nach Belastung würde die funktionale Anwendung prüfen. Das Urteil ist daten- und zustandsgebunden, keine Behauptung über alle Silikonprodukte.
  - Expected performance (EN): The 80 nm refers to the film; 45 nm is separately stated particle size only for C. Without that extra information, particle size could not be inferred from 80 nm. Silicone chemistry and suitable surface structure can contribute to nanoscale functionalization. A/B have the same chemistry but different structure and very different roll-off angles. High contact angle in B does not mean equally easy droplet movement: 40° requires much greater tilt than 5°. The hydrophilic equal-thickness control prevents a thickness-only explanation. A appears better for mobile drops under the supplied conditions; actual dirt transport, abrasion resistance or long-term stability remain unsupported. Observing dirt removal before/after loading would test the functional application. The conclusion is data/state-bound, not a statement about every silicone product.
  - Understanding focus (DE): Verbindet Silikon-Oberflächenfunktion mit Materialdaten und unterscheidet 80-nm-Schicht von separat gemessenen 45-nm-Partikeln in C. / Erklärt bei gleicher Chemie die Strukturänderung und trennt hohen Kontaktwinkel von leichtem Abrollen anhand 150°/40° gegenüber 155°/5°. / Begründet ein zustandsgebundenes Anwendungsurteil und benennt fehlenden Schmutzabtrag/Belastungsnachweis statt Nano-Selbstreinigung vorauszusetzen.
  - Understanding focus (EN): Connects silicone surface function to material data and separates 80-nm film from independently measured 45-nm particles in C. / Explains structural change at constant chemistry and distinguishes high contact angle from easy rolling using 150°/40° versus 155°/5°. / Justifies a state-bound application conclusion and identifies missing dirt-removal/loading evidence rather than assuming nano self-cleaning.
## Page 15: Organische Moleküle mit Molecular Modelling darstellen

- Full learning-goal ID: `707998c1-872d-582d-a2d6-14e7d967cbdb`
- Goal fingerprint: `sha256:e9e2a83a3c62ecc8b946f688ffd7f623702d1522ef8999b4f884fc660f65e1e2`
- Page fingerprint: `sha256:c1993bda60175b47273735f58d8f130151f159b96ed21c9aab4b53066dbf1f10`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

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

Status: `needs_human_review`; profile fingerprint: `sha256:26f9acd1dbb9ae7883b73280b574b82835ba2f4de93460fe7cc7341d33acda95`
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
  - Task demand (DE): Erzeuge und prüfe eigene digitale Aromatenmodelle im vollständigen Fall.
  - Task demand (EN): Create/check own digital aromatic models in the complete case.
  - Expected performance (DE): Tatsächliche digitale Handlung und fachliche Darstellungsgrenzen.
  - Expected performance (EN): Actual digital action and scientific representation limits.
  - Understanding focus (DE): Eigene digitale Modellhandlung erschließt Aromatenstruktur;Visualisierung ist keine Messung.
  - Understanding focus (EN): Own digital modelling explores aromatic structure;visualization is not measurement.
## Page 16: Glykosidische Bindungen

- Full learning-goal ID: `7b477c2b-0919-5d70-810b-188a88c55ffc`
- Goal fingerprint: `sha256:daf6c73bab56dd7726c65911eb9c29e78701e34ffaa7a27702776f833b523ab0`
- Page fingerprint: `sha256:bed25935bb021882d2998a71c0d533833263af15f11cbac8310215b0f7417a8a`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Verknüpfung von Zuckerbausteinen durch glykosidische Bindungen und deren Spaltung durch Hydrolyse anhand von Strukturformeln erklären.

### Visualization

/assets/goal-visualizations/chemie/7b477c2b-0919-5d70-810b-188a88c55ffc/7b477c2b-0919-5d70-810b-188a88c55ffc.jpg

- original digest: `sha256:d39a71719eb29f664ce52f42ec7f6f363455cb47d7569936cd40aef96617b820`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Kohlenhydrate analysieren — `8761cfd2-aa1a-56f1-9272-9cf66ef4b271` (outside this book)
- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b9b0e0f67457663ef0fe2e0417586d0db1e9b05e87198cd1e31bea473e79e676`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `structure-and-evidence`
  - Essential understanding (DE): Glykosidische Bindungen verknüpfen Zuckerbausteine; Hydrolyse löst sie mit Wasseraufnahme.
  - Essential understanding (EN): Glycosidic bonds link sugar units; hydrolysis cleaves them with water uptake.
  - Observable performance (DE): Die O-Brücke beteiligt ein anomeres Zentrum; bei Saccharose sind beide beteiligt. Formale Kondensation bilanziert Wasserabgabe; die konkreten C-Positionen werden bezeichnet.
  - Observable performance (EN): An O bridge involves an anomeric centre, both in sucrose. Formal condensation balances water release; actual carbon positions are identified.
- `fresh-transfer`
  - Essential understanding (DE): Die gleiche fachliche Beziehung wird auf einen veränderten Fall übertragen; Bedingungen und Schlussgrenzen werden benannt.
  - Essential understanding (EN): The same subject relationship is transferred to a changed case with explicit conditions and inference limits.
  - Observable performance (DE): Maltose + H2O ergibt zwei Glucoseeinheiten; eine lineare Kette mit n Einheiten benötigt n-1 Wasser für vollständige Bindungsspaltung. Hydrolyse und bloßes Lösen sind verschieden.
  - Observable performance (EN): Maltose plus H2O yields two glucose units; a linear chain of n units requires n-1 waters for complete cleavage. Hydrolysis differs from simply dissolving.

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
  - Task demand (DE): Markiere in bereitgestellten Maltose- und Saccharosestrukturen die glykosidische Bindung und erläutere, welche Gruppen bei formaler Verknüpfung Wasser bilden.
  - Task demand (EN): Mark the glycosidic bond in supplied maltose and sucrose structures and explain groups forming water in formal condensation.
  - Expected performance (DE): Die O-Brücke beteiligt ein anomeres Zentrum; bei Saccharose sind beide beteiligt. Formale Kondensation bilanziert Wasserabgabe; die konkreten C-Positionen werden bezeichnet.
  - Expected performance (EN): An O bridge involves an anomeric centre, both in sucrose. Formal condensation balances water release; actual carbon positions are identified.
  - Understanding focus (DE): Glykosidische Bindungen verknüpfen Zuckerbausteine; Hydrolyse löst sie mit Wasseraufnahme.
  - Understanding focus (EN): Glycosidic bonds link sugar units; hydrolysis cleaves them with water uptake.
- `case-b-transfer`
  - Task demand (DE): Formuliere die vollständige Hydrolyse von Maltose und vergleiche sie mit einem längeren Glucosepolymer.
  - Task demand (EN): Write complete maltose hydrolysis and compare with a longer glucose polymer.
  - Expected performance (DE): Maltose + H2O ergibt zwei Glucoseeinheiten; eine lineare Kette mit n Einheiten benötigt n-1 Wasser für vollständige Bindungsspaltung. Hydrolyse und bloßes Lösen sind verschieden.
  - Expected performance (EN): Maltose plus H2O yields two glucose units; a linear chain of n units requires n-1 waters for complete cleavage. Hydrolysis differs from simply dissolving.
  - Understanding focus (DE): Glykosidische Bindungen verknüpfen Zuckerbausteine; Hydrolyse löst sie mit Wasseraufnahme.
  - Understanding focus (EN): Glycosidic bonds link sugar units; hydrolysis cleaves them with water uptake.
## Page 17: Oxidierbarkeit von Alkanolen vergleichen

- Full learning-goal ID: `858d56e0-ab8f-51a4-b07e-7d9d94cab8e2`
- Goal fingerprint: `sha256:60d40bf5725c58252d84bfc5372d670c19f5f091779b532515e84b067caaf876`
- Page fingerprint: `sha256:97979694842bf8ce6600c62aed3099435654fbd2e44bb255bc9164a004fcaa1c`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann primäre, sekundäre und tertiäre Alkanole hinsichtlich ihrer Oxidierbarkeit vergleichen.

### Visualization

/assets/goal-visualizations/chemie/858d56e0-ab8f-51a4-b07e-7d9d94cab8e2/858d56e0-ab8f-51a4-b07e-7d9d94cab8e2.jpg

- original digest: `sha256:b41cb66d8e816adaf607d253fe0130c19f3a7515fe748465f668106ff063399e`
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
## Page 18: Recyclingstrategien abwägen

- Full learning-goal ID: `8721d943-8368-5304-bd3c-7d7944099662`
- Goal fingerprint: `sha256:76edec10515d64c0b933874f2b9d3907bf2d85f990765c275744b032134a1d0f`
- Page fingerprint: `sha256:071f6f80cb60b395a57fd3d190708c5b7ac85b8a3db095751b2ad42694007117`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann werkstoffliches und rohstoffliches Recycling von Kunststoffen, einschließlich der Hydrolyse geeigneter Polymere, sowie Wertstoffkreisläufe fachlich erklären, ökologisch und wirtschaftlich bewerten und verwendete Quellen quellenkritisch einordnen. Sie kann energetische Verwertung abgrenzen und deren Stoff-/Energiebilanz unter angegebenen Bedingungen beurteilen.

### Visualization

/assets/goal-visualizations/chemie/8721d943-8368-5304-bd3c-7d7944099662/8721d943-8368-5304-bd3c-7d7944099662.png

- original digest: `sha256:212369ab33d87304af093867bf2a3d193e2ccc01268d8c0bbfb1f195f473c730`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Biopolymer-Abbau — `e47b22ec-4443-5aae-bf38-71e3164b6b3e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:854a7a3d13d2b156b0ea358a4c28eb6b68633d25d519c3092f5cc03811b562a5`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Werkstoffliches Recycling erhält Polymerketten überwiegend; rohstoffliche Verfahren spalten sie, Hydrolyse betrifft passende Bindungen.
  - Essential understanding (EN): Mechanical recycling largely retains polymer chains; feedstock routes split them, and hydrolysis requires suitable linkages.
  - Observable performance (DE): Beschreibt drei Prozesswege einschließlich PET-Hydrolyse und PE-Grenze.
  - Observable performance (EN): Describes three routes including PET hydrolysis and the limitation for PE.
- `e2`
  - Essential understanding (DE): Ausbeute, Energie und Produktqualität müssen auf denselben funktionalen Bedarf und Systemgrenzen bezogen werden.
  - Essential understanding (EN): Yield, energy and quality must be compared for the same functional demand and system boundary.
  - Observable performance (DE): Rechnet bereitgestellte Massen- und Energieflüsse mit Verlusten transparent um.
  - Observable performance (EN): Calculates supplied mass and energy flows transparently including losses.
- `e3`
  - Essential understanding (DE): Quellenkritik und Kontext entscheiden über tragfähige ökologische/ökonomische Urteile.
  - Essential understanding (EN): Source criticism and context determine defensible environmental/economic judgements.
  - Observable performance (DE): Begründet einen Kreislauf und revidiert ihn bei geänderter Sortierung oder Produktanforderung.
  - Observable performance (EN): Justifies a cycle and revises it under changed sorting or product requirements.
- `hb208-energy-recovery-distinction`
  - Essential understanding (DE): Energetische Verwertung oxidiert Kunststoff zur Energienutzung und schließt keinen Stoffkreislauf; Vergleich braucht gleiche Funktion/Systemgrenze.
  - Essential understanding (EN): Energy recovery oxidizes plastic for useful energy and closes no material cycle; comparison needs equal function/boundary.
  - Observable performance (DE): Die lernende Person erklärt die drei Wege, bilanziert den PE-Modellfall und begrenzt den Transfer auf unbekannte Gemische.
  - Observable performance (EN): The learner explains three routes, balances the PE model and limits transfer to unknown mixtures.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `hb208-energy-recovery-distinction`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Sortenreinheit / Sorting purity
- `v2`: Produktqualität und Bedarf / Product quality and demand
- `v3`: Energie-/Quellengrenzen / Energy and source boundaries
- `hb208-energy-recovery-distinction-transfer`: Bedingungswechsel im vollständigen Transfer selbstständig berücksichtigen. / Independently account for changed conditions in the complete transfer.

**Application cases**

- `8721d943-case-1`
  - Task demand (DE): Erkläre die Wege und Esterhydrolyse. Berechne Betriebsenergie je kg geeignetem PET für die ersten beiden Wege. Wähle bei ausreichender Regranulatqualität vorläufig und bewerte den Prospektsatz.
  - Task demand (EN): Explain routes and ester hydrolysis. Calculate operational energy per kg of suitable PET for the first two routes. Make a provisional choice if regranulate quality suffices and assess the brochure claim.
  - Expected performance (DE): Mechanisch waschen/zerkleinern/aufschmelzen, Ketten weitgehend erhalten; Hydrolyse spaltet Ester in Säure-/Alkoholprodukte, gereinigt erneut polymerisierbar.0.50 versus 1.33 k Wh/kg geeignetes PET. Mechanisch vorläufig günstiger für diesen Bedarf. Feedstock ist noch kein gleichwertiges PET; Pyrolysezahl daher nicht direkt vergleichbar. Strommix, Qualität, Transport, Chemikalien, Verluste, Kosten und Anbieterinteresse fehlen: „immer“ unbelegt.
  - Expected performance (EN): Mechanical washing/shredding/remelting largely preserves chains; hydrolysis cleaves ester links into acid/alcohol products, which can be purified and repolymerised.0.50 versus 1.33 k Wh/kg suitable PET. Mechanical recycling is provisionally preferable for this demand. Feedstock is not yet equivalent PET, so pyrolysis is not directly comparable. Electricity mix, quality, transport, reagents, losses, costs and vendor interest remain unresolved: “always” is unsupported.
  - Understanding focus (DE): Fallbezogene Aspekte: Mechanische Kettenerhaltung, PET-Esterhydrolyse und Pyrolyse-Feedstock von fertigem PET trennen. / 40/80=0.50 und 100/75≈1.33 kWh/kg geeignetes PET; Pyrolyseprodukt nicht gleichwertig. / Mechanisch vorläufig bei geeigneter Qualität; Strommix, Chemikalien/Transport und Prospektinteresse verhindern Immer-Urteil. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Case-specific aspects: Distinguish mechanical chain retention, PET ester hydrolysis and pyrolysis feedstock from finished PET. / 40/80=0.50 and 100/75≈1.33 kWh/kg suitable PET; pyrolysis product not equivalent. / Mechanical provisionally at adequate quality; electricity mix, chemicals/transport and prospectus interest preclude an always claim. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
- `8721d943-case-2`
  - Task demand (DE): Berechne zurückgewonnenes PET/PE und Verluste. Erkläre warum PE nicht wie PET hydrolysierbar ist. Bewerte Kreislauf versus Platte und welche Daten die Auswahl entscheiden.
  - Task demand (EN): Calculate recovered PET/PE and losses. Explain why PE cannot be hydrolysed like PET. Compare the cycle with the board route and identify deciding evidence.
  - Expected performance (DE): PET 28 kg, PE 45 kg, zusammen 73 kg; 27 kg des ursprünglichen 100 kg nicht im Zielprodukt. PE-C–C-Rückgrat besitzt keine Esterhydrolysestellen. Sortierung plus materialgerechte Wege stützt sortenreinen Kreislauf; Platte erfüllt anderen Bedarf und kann ebenfalls sinnvoll sein. Reststoffbehandlung, Qualität/Neumaterialersatz, Energie/Kosten und reale Nachfrage entscheiden; kein vollständig geschlossener Nullverlustkreislauf.
  - Expected performance (EN): PET 28 kg, PE 45 kg, total 73 kg; 27 kg of the initial 100 kg is outside target products. PE has a C–C backbone without ester-hydrolysis sites. Sorting plus material-specific routes supports a single-polymer cycle; the board serves another demand and may also be useful. Residue treatment, quality/virgin-material displacement, energy/cost and actual demand decide; this is not a loss-free closed cycle.
  - Understanding focus (DE): Fallbezogene Aspekte: PET-Ester hydrolysierbar; PE-C–C ohne Esterstellen, materialgerechte Wege nach Sortierung. / 35·0.8=28 kg PET, 50·0.9=45 kg PE, 73 kg Zielprodukt und 27 kg nicht darin. / 73 kg sortenreines Produkt versus 70 kg Platte erfüllen andere Nachfrage; Qualität, Ersatz, Energie/Kosten/Reststrom entscheiden. Die Verknüpfung zu Erwartungs-IDs behauptet keine vollständige Erfüllung jeder Gesamtprofilerwartung in diesem Einzelfall.
  - Understanding focus (EN): Case-specific aspects: PET esters hydrolysable; PE C–C lacks ester sites, material-specific routes after sorting. / 35·0.8=28 kg PET, 50·0.9=45 kg PE, 73 kg target product and 27 kg outside it. / 73 kg pure products versus 70 kg sheet serve different demand; quality, substitution, energy/cost/residue determine choice. Links to expectation IDs do not assert complete fulfilment of every whole-profile expectation in this one case.
- `hb208-recovery-routes-8721`
  - Task demand (DE): Bearbeite den vollständigen PE-Stoff-/Energievergleich und neuen Mischabfall.
  - Task demand (EN): Handle the complete PE material/energy comparison and new mixed waste.
  - Expected performance (DE): Energienutzung, Stoffrückgewinnung und LCA-Urteil unterscheiden.
  - Expected performance (EN): Distinguish energy use, material recovery and LCA judgment.
  - Understanding focus (DE): Energetische Verwertung oxidiert Kunststoff zur Energienutzung und schließt keinen Stoffkreislauf; Vergleich braucht gleiche Funktion/Systemgrenze.
  - Understanding focus (EN): Energy recovery oxidizes plastic for useful energy and closes no material cycle; comparison needs equal function/boundary.
## Page 19: Einfache Bindungswinkel mit dem EPA-Modell erklären

- Full learning-goal ID: `9b56d01e-c2d7-51d8-b78e-237592c1ed20`
- Goal fingerprint: `sha256:f71621c4f2e0f579cd98db6c6036611adf4112ae572b40ea874dd0c5931741a9`
- Page fingerprint: `sha256:ba6a2392c159fd81988dd414afb9cb0cd688bbbbaa434ce1a6894ecfa08297b2`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann zu bereits dargestellten Molekülgestalten und EPA-Elektronendomänen passende idealisierte einfache Bindungswinkel zuordnen, qualitative Winkelabweichungen durch freie Elektronenpaare begründen und die Grenzen solcher Modellwinkel gegenüber exakten Messwerten erläutern.

### Visualization

/assets/goal-visualizations/chemie/9b56d01e-c2d7-51d8-b78e-237592c1ed20/9b56d01e-c2d7-51d8-b78e-237592c1ed20.jpg

- original digest: `sha256:61cec509a1bb973b24037ac24ba88bb10efaec73a0d5cec3f208909b4f85be06`
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
- Intermolekulare Kräfte vergleichen — `eb7537dd-d11b-50e9-a6d7-51a78e96fc4e` (outside this book)
- Stoffklasseneigenschaften bindungsbezogen vergleichen — `0b6a6a15-b355-5be8-abc9-4ef8df11bcb6` (outside this book)
- Hybridisierung zur Vorhersage organischer Bindungsverhältnisse nutzen — `37b4081a-244a-58d8-b448-88ed83344210` (outside this book)
- Bindungslängen und Molekülgeometrien modellgestützt begründen — `e8ec00a8-48d4-5fa3-9f0e-2ae365328a2e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b3234dde374351e1300028cbeb25f5528d244bcd32c1037a57d96d7fc135ba93`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `angle-only-increment`
  - Essential understanding (DE): Gegebene EPA-Grundanordnungen liefern idealisierte Winkelreferenzen. Freie Paare begründen qualitative Abweichungen, keine exakten Messwerte. Die Molekülgestalt wird vorausgesetzt und nicht erneut abgeschlossen.
  - Essential understanding (EN): Given VSEPR domain arrangements supply idealized angle references. Lone pairs explain qualitative deviations, not exact measurements. Molecular shape is assumed rather than completed again.
  - Observable performance (DE): Ordnet Referenzwinkel zu gegebenen Geometrien zu, begründet eine Winkelverkleinerung durch freie Paare und nennt die Idealisierungsgrenze. Gestaltklassifikation allein genügt nicht.
  - Observable performance (EN): Assigns reference angles to given geometries, justifies compression by lone pairs and states idealization limits. Shape classification alone is insufficient.

**Coverage expectations**

- required expectations: `angle-only-increment`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `given-angle-domain`: Vorgegebene lineare, planare und tetraedrische Domänen und Molekülgestalten. / Supplied linear, planar and tetrahedral domains and molecular shapes.
- `angle-model-boundary`: Freie Paare und Modellwinkel gegenüber Messbehauptungen. / Lone pairs and model angles versus measurement claims.

**Application cases**

- `epa-angle-only-tetrahedral-reference`
  - Task demand (DE): Alle Molekülgestalten und Elektronendomänen sind bereits gegeben; ihre erneute Ableitung oder Klassifikation wird nicht geprüft. Referenz: Vier Domänen sind ideal tetraedrisch angeordnet, mit 109,5°. CH4 ist tetraedrisch ohne freie Paare; H2O ist gewinkelt bei vier Domänen und zwei freien Paaren. Ordne den idealen CH4-Winkel zu und erkläre, weshalb der H–O–H-Winkel qualitativ kleiner sein kann. Welcher exakte Messwert folgt daraus nicht? Frischer Transfer: NH3 ist als trigonal-pyramidal mit vier Domänen und einem freien Paar gegeben. Begründe die Richtung der Winkelabweichung vom Referenzwert.
  - Task demand (EN): All molecular shapes and electron-domain counts are supplied; their derivation or classification is not assessed again. Reference: Four domains are ideally tetrahedral, with 109.5°. CH4 is tetrahedral without lone pairs; H2O is bent with four domains and two lone pairs. Assign the ideal CH4 angle and explain why H–O–H can be smaller. What exact measured value does this not establish? Fresh transfer: NH3 is given as trigonal pyramidal with four domains and one lone pair. Justify the direction of its angle deviation from the reference.
  - Expected performance (DE): CH4 hat im idealen tetraedrischen Modell 109,5°. Im einfachen EPA-Modell beanspruchen freie Paare mehr Raum und drücken Bindungsrichtungen zusammen; der H–O–H-Winkel ist gegenüber 109,5° verkleinert. Eine exakte gemessene Winkelzahl folgt daraus nicht. Für das vorgegebene NH3-Modell wird ebenfalls eine Verkleinerung gegenüber dem tetraedrischen Referenzwinkel begründet. Gestalten nur zu benennen genügt nicht.
  - Expected performance (EN): CH4 has 109.5° in the ideal tetrahedral model. In simple VSEPR, lone pairs occupy more space and compress bond directions; H–O–H is smaller than 109.5°. This does not supply an exact measured angle. For the given NH3 model, likewise justify a reduction from the tetrahedral reference. Merely naming shapes is insufficient.
  - Understanding focus (DE): Gefordert sind Winkelzuordnung, begründete Abweichung und Modellgrenze. Alle Gestalten sind Eingabedaten.
  - Understanding focus (EN): The performance is angle assignment, justified deviation and model limits. All shapes are input data.
- `epa-angle-only-linear-planar-transfer`
  - Task demand (DE): Gegebene Referenzen: linear 180°, trigonal-planar 120°, tetraedrische Domänen 109,5°. CO2 ist linear mit zwei Domänen am C; BH3 ist trigonal-planar mit drei Domänen am B; NH3 ist trigonal-pyramidal mit vier Domänen einschließlich eines freien Paars. Die Formen werden nicht erneut abgefragt. Ordne ideale Winkel zu, begründe, weshalb drei Bindungen bei BH3 und NH3 keine gleichen Winkel erzwingen, und prüfe: „EPA liefert für jedes Molekül den exakten gemessenen Winkel.“ Frische Variation: Eine Messung weicht vom idealen Referenzwinkel ab. Erkläre, weshalb weder Messung noch gesamtes Modell ohne weitere Prüfung verworfen werden dürfen.
  - Task demand (EN): Given references: linear 180°, trigonal planar 120°, tetrahedral domains 109.5°. CO2 is linear with two central-carbon domains; BH3 is trigonal planar with three boron domains; NH3 is trigonal pyramidal with four domains including one lone pair. Shapes are not assessed again. Assign ideal angles, explain why three bonds in BH3 and NH3 do not require equal angles, and assess: “VSEPR gives the exact measured angle for every molecule.” Fresh variation: A measurement differs from the ideal reference. Explain why neither the measurement nor the entire model should be discarded without further checks.
  - Expected performance (DE): CO2 gehört zum linearen 180°- und BH3 zum planaren 120°-Referenzwinkel. NH3 hat tetraedrische Domänen mit 109,5° als Ausgangsideal und einer freipaarbedingten Verkleinerung. Drei Bindungen machen NH3 nicht zu einem 120°-Fall. EPA ist ein idealisierendes Modell; Bedingungen, weitere Einflüsse und Messunsicherheit müssen geprüft werden. Eine Abweichung allein beweist weder einen Messfehler noch ein vollständiges Modellversagen.
  - Expected performance (EN): CO2 uses the linear 180° reference and BH3 the planar 120° reference. NH3 has tetrahedral domains with 109.5° as baseline and lone-pair compression. Three bonds do not make NH3 a 120° case. VSEPR is an idealized model; conditions, further influences and measurement uncertainty require checks. Deviation alone proves neither measurement error nor complete model failure.
  - Understanding focus (DE): Frischer Winkelvergleich ohne wiederholte Gestaltklassifikation.
  - Understanding focus (EN): A fresh angle comparison without repeated shape classification.
## Page 20: Carbonsäuren beschreiben

- Full learning-goal ID: `a3788e40-b540-5bed-be37-b33053528422`
- Goal fingerprint: `sha256:7792898d5d7fc270f728cce983914e05270d20b754a561ebfc55d53cc67b5f6a`
- Page fingerprint: `sha256:8c16a9b48a881cfb8125fe5726c9c137caec33dc2a933b239a9150213a480698`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Carboxygruppen in Struktur- und Skelettformeln erkennen und ihren sauren Charakter anhand geeigneter Beobachtungen nachweisen, homologe Reihen darstellen und Strukturformeln schreiben.

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
- Konservierungsmethoden vergleichen — `33e845cc-1a7b-50d5-99b3-8079575c4e6a` (outside this book)
- Esterbildung und Estereigenschaften erklären — `70b34ae7-4481-590c-9a02-516464750832` (outside this book)
- Acidität begründen — `ca216bc6-5205-5b46-abbd-fd5628e4ca5b` (outside this book)
- Funktionelle Gruppen qualitativ nachweisen — `3de28598-672f-5753-8a45-8f559c2f9dc2` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e3e9c601ac80fd388b9db89b5d0240552d6ac42742bb7d413cae40f35aacbf54`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `carboxyl-acid-evidence`
  - Essential understanding (DE): Die Carboxygruppe enthält C=O und O–H am selben Kohlenstoff. Geeignete Beobachtungen belegen den sauren Charakter; Geruch oder ein beliebiges O–H reichen nicht.
  - Essential understanding (EN): A carboxyl group has C=O and O–H on the same carbon. Suitable observations support acidity; smell or an arbitrary O–H do not suffice.
  - Observable performance (DE): Carboxygruppen in Struktur- und Skelettformeln markieren und bereitgestellte Indikator-/Reaktionsdaten stoffbezogen deuten.
  - Observable performance (EN): Mark carboxyl groups in structural and skeletal formulas and interpret supplied indicator/reaction data for each substance.
- `homologous-formulas`
  - Essential understanding (DE): Benachbarte unverzweigte gesättigte Monocarbonsäuren unterscheiden sich um CH₂. Ihre Strukturformeln behalten die Carboxygruppe.
  - Essential understanding (EN): Adjacent unbranched saturated monocarboxylic acids differ by CH₂. Their structural formulas retain the carboxyl group.
  - Observable performance (DE): Eine passende homologe Reihe zeichnen und Carbonsäuren von isomeren Estern oder anderen sauerstoffhaltigen Stoffen unterscheiden.
  - Observable performance (EN): Draw a suitable homologous series and distinguish carboxylic acids from isomeric esters or other oxygen-containing compounds.

**Coverage expectations**

- required expectations: `carboxyl-acid-evidence`, `homologous-formulas`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `changed-chemical-case`: Andere Kettenlänge und Darstellungsform; funktionelle Gruppe statt bloßer Summenformel; frische Beobachtungsdaten. / Change chain length and representation; functional group rather than molecular formula alone; fresh observation data.

**Application cases**

- `three-acids-and-ethanol`
  - Task demand (DE): Gegeben sind HCOOH, CH₃COOH, CH₃CH₂COOH und CH₃CH₂OH sowie Indikatordaten ihrer vergleichbar konzentrierten Lösungen. Markiere Carboxygruppen, begründe die sauren Befunde und zeichne die homologe Reihe.
  - Task demand (EN): Given HCOOH, CH₃COOH, CH₃CH₂COOH and CH₃CH₂OH with indicator data for comparably concentrated solutions, mark carboxyl groups, explain acidic observations and draw the homologous series.
  - Expected performance (DE): Nur die ersten drei enthalten COOH; ihr CH₂-Zuwachs definiert diese Reihe. Ethanol besitzt OH ohne benachbartes Carbonyl. Die bereitgestellten sauren Indikatorbefunde stützen die Zuordnung, nicht ein bloßer Stoffname.
  - Expected performance (EN): Only the first three contain COOH; their CH₂ increments define this series. Ethanol has OH without an adjacent carbonyl. Supplied acidic indicator observations support the assignment rather than a substance name alone.
  - Understanding focus (DE): Gruppenerkennung, Beobachtung und homologe Struktur.
  - Understanding focus (EN): Group recognition, observation and homologous structure.
- `butanoic-acid-versus-ester`
  - Task demand (DE): Frisch gegeben sind Skelettformeln von Butansäure und Ethylethanoat, beide C₄H₈O₂. Zeichne vollständige Strukturformeln; ordne getrennte Indikatordaten zu und begründe, weshalb die gleiche Summenformel keine gleiche Stoffklasse beweist.
  - Task demand (EN): Fresh skeletal formulas show butanoic acid and ethyl ethanoate, both C₄H₈O₂. Draw full structural formulas, assign separate indicator data and explain why equal molecular formulas do not imply the same class.
  - Expected performance (DE): CH₃CH₂CH₂COOH setzt die unverzweigte Reihe fort und besitzt COOH; CH₃COOCH₂CH₃ ist ein Ester ohne Carboxy-OH. Formeln und bereitgestellte Beobachtungen müssen übereinstimmen; keine pauschale Acidität aller sauerstoffhaltigen Stoffe.
  - Expected performance (EN): CH₃CH₂CH₂COOH continues the unbranched series and has COOH; CH₃COOCH₂CH₃ is an ester without a carboxyl OH. Formulas and supplied observations must agree; not all oxygen-containing compounds are acidic.
  - Understanding focus (DE): Frischer Isomer-/Darstellungstransfer.
  - Understanding focus (EN): Fresh isomer and representation transfer.

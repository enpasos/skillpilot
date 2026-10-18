# AI review input: Chemie: endgültiger aktueller D-Kontext

- Book ID: `chemie-current450-bound-context-d-011`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:dc85256df59d5c8df806af6342ed2e80a656a43e11337b6077905c9abeb724de`
- Selected goals: 20

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Carbonylreaktivität bewerten

- Full learning-goal ID: `6d3a2bad-8c67-5964-a720-375f138adaba`
- Goal fingerprint: `sha256:e786a7c8e4ccc8d80e63a7ec258225494e8f89aab11a57a38bda2f09a76d96cf`
- Page fingerprint: `sha256:12de7591652f9b39e10158d2af159254d2f9d3c2fa3fd461534b99bafc09ea85`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die unterschiedliche Reaktivität vergleichbarer Aldehyde und Ketone bei der nucleophilen Addition unter gleichen Reaktionsbedingungen anhand elektronischer und sterischer Einflüsse mechanistisch begründen.

### Visualization

/assets/goal-visualizations/chemie/6d3a2bad-8c67-5964-a720-375f138adaba/6d3a2bad-8c67-5964-a720-375f138adaba.png

- original digest: `sha256:6d93a4077e45ed542ac81581c190e31fd7b02ef9daf2c566a1e66312aad4132d`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Grignard-Synthesen deuten — `8edee6b6-9ead-515e-93f5-feada64522b2` (page 2)

### Prerequisites outside this book

- Polare Eigenschaften erklären — `91cd4728-b811-562a-970b-18b81dfb4bdf` (outside this book)

### Direct reverse prerequisites outside this book

- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:32961cc3967bf25a18724d3863b60eb1c38f06813f6a3228560fe4bef14cd161`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Carbonyl-C ist elektrophil; nucleophiler Angriff verschiebt die π-Elektronen zum Sauerstoff.
  - Essential understanding (EN): Carbonyl C is electrophilic; nucleophilic attack moves π electrons to oxygen.
  - Observable performance (DE): Zeigt Angriff und tetraedrisches Zwischenprodukt mit korrekten Bindungen/Ladungen.
  - Observable performance (EN): Shows attack and tetrahedral intermediate with correct bonds/charges.
- `e2`
  - Essential understanding (DE): Alkylreste beeinflussen Elektronendichte und sterische Zugänglichkeit des Carbonyl-C.
  - Essential understanding (EN): Alkyl groups affect electron density and steric access at carbonyl C.
  - Observable performance (DE): Begründet Aldehyd/Keton-Reaktivität im gegebenen vergleichbaren Reaktionsmodell.
  - Observable performance (EN): Explains aldehyde/ketone reactivity within the supplied comparable reaction model.
- `e3`
  - Essential understanding (DE): Eine mechanistische Tendenz ist keine universelle absolute Geschwindigkeitsregel.
  - Essential understanding (EN): A mechanistic trend is not a universal absolute rate law.
  - Observable performance (DE): Bewertet veränderte Substituenten und begrenzt Schlussfolgerungen auf angegebene Bedingungen.
  - Observable performance (EN): Assesses changed substituents and restricts inference to stated conditions.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Weniger oder mehr Alkylreste / Fewer or more alkyl groups
- `v2`: Elektronischer und sterischer Beitrag / Electronic and steric contribution

**Application cases**

- `6d3a2bad-case-1`
  - Task demand (DE): Daten und Bedingungen:
Papiermodell nucleophile Addition von Nu⁻. Kandidaten CH₃CHO und CH₃COCH₃; gleicher Nucleophiltyp, Temperatur, Lösungsmittel und Konzentrationen, keine vorgelagerte Protonierung. Alkylreste besitzen hier elektronenschiebenden +I-Effekt; weitere sterische Abschirmung erschwert Angriff. Modellinitialraten als relative Daten: Ethanal6.0, Propanon1.0. Beim ersten Angriff entsteht R₂C(O⁻)(Nu), keine Abgangsgruppe wird eliminiert.
Aufgaben:
1. Formuliere die Elektronenpaarpfeile und Angriffszwischenprodukte beider Carbonyle.
2. Erkläre die modellierte höhere Ethanalreaktivität über Elektronik und Sterik statt nur den Stoffnamen.
3. Bewerte „jedes Aldehyd reagiert immer sechsmal schneller als jedes Keton“ und unterscheide Addition von Acylsubstitution.
  - Task demand (EN): Data and conditions:
Paper nucleophilic-addition model with Nu⁻. Candidates CH₃CHO and CH₃COCH₃ at the same nucleophile, temperature, solvent/concentrations and no prior protonation. Alkyl groups have electron-donating +I effect here; additional steric shielding impedes attack. Relative synthetic initial rates: ethanal6.0, propanone1.0. First attack gives R₂C(O⁻)(Nu); no leaving group is eliminated.
Tasks:
1. Describe electron-pair arrows and attack intermediates for both carbonyls.
2. Explain higher modeled ethanal reactivity using electronics/sterics rather than names.
3. Assess “every aldehyde always reacts six times faster than every ketone” and distinguish addition from acyl substitution.
  - Expected performance (DE): 1. Nu⁻-Elektronenpaar → Carbonyl-C, C=O-π-Paar → O. Ethanal bildet CH₃CH(O⁻)(Nu), Propanon (CH₃)₂C(O⁻)(Nu). Carbonyl-C wird tetraedrisch mit vier Einfachbindungen; −1 liegt am O bei neutral gebundenem Nu aus Nu⁻.
2. Ethanal hat einen Alkylrest und ein kleines H; Propanon hat zwei elektronenschiebende Alkylreste, die C-Elektrophilie relativ vermindern und den Angriff stärker abschirmen. Unter den gleichen Bedingungen passt dies zur höheren Ethanalinitialrate; beide Beiträge begründen die Tendenz.
3. Die6:1-Rate ist nur dieser synthetische Datensatz. Andere Substituenten/Medium/Protonierung können die Rate ändern. In beiden Strukturen fehlt eine am Carbonyl-C gebundene geeignete Abgangsgruppe; hier wird addiert, nicht wie bei einem Acylchlorid substituiert.
  - Expected performance (EN): 1. Nu⁻ lone pair → carbonyl C; C=O π pair → O. Ethanal gives CH₃CH(O⁻)(Nu), propanone (CH₃)₂C(O⁻)(Nu). C becomes tetrahedral with four single bonds; −1 remains on O for a neutrally bonded Nu derived from Nu⁻.
2. Ethanal has one alkyl and a small H; propanone has two electron-donating alkyl groups, reducing relative electrophilicity and shielding attack more. Under equal conditions this fits the higher ethanal initial rate; both contributions support the trend.
3. The6:1 rate applies only to this synthetic data set. Other substituents, medium/protonation can change rates. Neither carbonyl has an appropriate acyl leaving group; this is addition, not acyl substitution as with an acyl chloride.
  - Understanding focus (DE): Carbonylreaktivität ist eine mechanistische bedingte Tendenz aus Elektrophilie und sterischer Zugänglichkeit. Transfer: Ein elektronenziehender Ketonrest kann die grobe Aldehyd/Keton-Rangfolge durchbrechen. Zwei unabhängige Nachweisschritte können in einer integrierten Leistung auftreten; die zwei Fallvarianten sind keine Pflichtaufgabenquote. Sobald alle Aspekte und selbstständiger Transfer hinreichend gezeigt sind, endet die Prüfung.
  - Understanding focus (EN): Carbonyl reactivity is a conditional mechanistic trend involving electrophilicity and steric access. Transfer: An electron-withdrawing ketone substituent can overturn a crude aldehyde/ketone ranking. Two independent demonstration steps can occur in one integrated performance; the two case variants are not a mandatory task quota. Stop assessment once all aspects and independent transfer are sufficiently shown.
- `6d3a2bad-case-2`
  - Task demand (DE): Daten und Bedingungen:
Gleiche Modellbedingungen wie Fall1. A CH₃CH₂CHO, B CH₃CH₂COCH₃, C CF₃COCH₃. Vorgabe: CF₃ wirkt elektronenziehend (−I), CH₃/CH₂CH₃ elektronenschiebend; geometrische/sterische Effekte bleiben zusätzlich möglich. Relative synthetische Raten A4.0/B1.0/C5.0. Nu⁻ wird als neutrales C-gebundenes Nu nach Angriff dargestellt. Keine reale Geschwindigkeitsmessung.
Aufgaben:
1. Zeichne für B und C den Angriff und vergleiche die Bindungs-/Ladungsbilanz.
2. Begründe A gegenüber B mit Alkylzahl und sterischer Zugänglichkeit.
3. Erkläre die schnellere Ketonprobe C und bewerte eine universelle Aldehyd-vor-Keton-Regel.
  - Task demand (EN): Data and conditions:
Same model conditions as case1. A CH₃CH₂CHO, B CH₃CH₂COCH₃, C CF₃COCH₃. Supplied rule: CF₃ withdraws electrons (−I), CH₃/ethyl donate; geometry/sterics may also matter. Synthetic relative rates A4.0/B1.0/C5.0. Nu⁻ is represented as neutral carbon-bound Nu after attack. No actual kinetic measurement.
Tasks:
1. Draw attack on B/C and compare bond/charge balance.
2. Explain A versus B using alkyl count and steric accessibility.
3. Explain faster ketone C and assess a universal aldehyde-before-ketone rule.
  - Expected performance (DE): 1. Beide: Nu⁻ → C, C=O-π → O; B CH₃CH₂C(O⁻)(CH₃)(Nu), C CF₃C(O⁻)(CH₃)(Nu). Vier Einfachbindungen am tetraedrischen C, negative O-Ladung, kein willkürlicher OH- oder Substituentenabgang.
2. Aldehyd A hat an Carbonyl-C H statt des zweiten Alkylrests von B: weniger +I-Beitrag und weniger Abschirmung. Unter diesen Bedingungen ist die höhere Rate von A plausibel. Die Daten beweisen keine isolierte quantitative Aufteilung in Sterik/Elektronik.
3. CF₃ entzieht Elektronendichte und erhöht im gegebenen Modell die Elektrophilie; C kann trotz Ketonklasse schneller als A sein. Dies widerspricht einer universellen Klassenrangfolge, nicht dem mechanistischen Alkylvergleich A/B. Nur die gegebenen vergleichbaren Bedingungen sind beurteilt.
  - Expected performance (EN): 1. Both use Nu⁻ → C and C=O π → O; B gives CH₃CH₂C(O⁻)(CH₃)(Nu), C CF₃C(O⁻)(CH₃)(Nu). C has four single bonds and O negative charge; no arbitrary OH/substituent departure occurs.
2. A has H instead of B’s second alkyl at carbonyl C, giving less electron donation/shielding. Its higher rate is plausible under these conditions. Data do not separately quantify steric/electronic contributions.
3. CF₃ withdraws electron density and increases electrophilicity in the supplied model; C can outrun A despite being a ketone. This rejects a universal class ranking without invalidating A/B alkyl reasoning. Only supplied comparable conditions are assessed.
  - Understanding focus (DE): Carbonylreaktivität ist eine mechanistische bedingte Tendenz aus Elektrophilie und sterischer Zugänglichkeit. Transfer: Ein elektronenziehender Ketonrest kann die grobe Aldehyd/Keton-Rangfolge durchbrechen. Zwei unabhängige Nachweisschritte können in einer integrierten Leistung auftreten; die zwei Fallvarianten sind keine Pflichtaufgabenquote. Sobald alle Aspekte und selbstständiger Transfer hinreichend gezeigt sind, endet die Prüfung.
  - Understanding focus (EN): Carbonyl reactivity is a conditional mechanistic trend involving electrophilicity and steric access. Transfer: An electron-withdrawing ketone substituent can overturn a crude aldehyde/ketone ranking. Two independent demonstration steps can occur in one integrated performance; the two case variants are not a mandatory task quota. Stop assessment once all aspects and independent transfer are sufficiently shown.
## Page 2: Grignard-Synthesen deuten

- Full learning-goal ID: `8edee6b6-9ead-515e-93f5-feada64522b2`
- Goal fingerprint: `sha256:66422b4a3834c03d52e867a2c4f22e892f83545889520d8c389088f04d9f7477`
- Page fingerprint: `sha256:e66a9b271b04cb532b7a62a14c58b0bfc539b23b02f598566f63592b597e5cbe`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Grignard-Reagenzien unter fachlicher Aufsicht und geeigneten wasserfreien Bedingungen zur Addition an Carbonylverbindungen einsetzen sowie die C–C-Bindungsbildung, die Alkoxid-Zwischenstufe und die anschließende Protonierung in Reaktionsschritten darstellen.

### Visualization

/assets/goal-visualizations/chemie/8edee6b6-9ead-515e-93f5-feada64522b2/8edee6b6-9ead-515e-93f5-feada64522b2.jpg

- original digest: `sha256:4fb44587a539d2e20103a08c2c9c5bb8ec612435f0d8b54737394c9b21a1e641`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Carbonylreaktivität bewerten — `6d3a2bad-8c67-5964-a720-375f138adaba` (page 1)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- None

### Direct reverse prerequisites outside this book

- Grignard-Alkoholsynthesen planen und beaufsichtigt ausführen — `d7abdeb3-5b69-5744-b7fd-8149fd92b0d5` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b225c13fed521c9f42815dfac79aa5d49283402f226fdbef73702f19327d1f19`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Grignard-Rest reagiert nucleophil mit Carbonyl-C und bildet eine neue C–C-Bindung.
  - Essential understanding (EN): A Grignard carbon group attacks carbonyl C and forms a new C–C bond.
  - Observable performance (DE): Wählt Reagenz/Carbonyl passend zum Zielalkohol und formuliert Addition/Alkoxid.
  - Observable performance (EN): Selects reagent/carbonyl for a target alcohol and writes addition/alkoxide.
- `e2`
  - Essential understanding (DE): Die Protonierung folgt erst nach der wasserfreien Addition; protische Gruppen verbrauchen Reagenz.
  - Essential understanding (EN): Protonation follows anhydrous addition; protic groups consume reagent.
  - Observable performance (DE): Erklärt Reihenfolge und bilanziert einen gegebenen Wasser-/OH-Störfall.
  - Observable performance (EN): Explains sequence and balances a supplied water/OH interference case.
- `e3`
  - Essential understanding (DE): Reagenzien einsetzen verlangt einen wirklichen geeigneten Operationenkanal.
  - Essential understanding (EN): Using reagents requires an actual suitable operational channel.
  - Observable performance (DE): Setzt das freigegebene Reagenz im entsprechend ausgestatteten betreuten Labor ein; schriftliche Planung beweist keine Ausführung.
  - Observable performance (EN): Uses the authorized reagent in an appropriately equipped supervised lab; a written plan does not prove execution.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Aldehyd oder Keton als Carbonyl / Aldehyde or ketone carbonyl
- `v2`: Wasserfreiheit und protische Gruppe / Anhydrous conditions and protic group

**Application cases**

- `8edee6b6-case-1`
  - Task demand (DE): Daten und Bedingungen:
Papierziel Butan-2-ol CH₃CH(OH)CH₂CH₃. Bausteine CH₃CHO und C₂H₅MgBr in geeignetem trockenem Ether; Schulmodell stellt organisches R als Rδ−/Mgδ+ dar, kein freies isoliertes Carbanion in Lösung.30.0 mmol Ethanal,35.0 mmol Ethylmagnesiumbromid;1.00 mmol unbeabsichtigtes Wasser verbraucht1.00 mmol Reagenz zu Ethan. Erst nach Carbonyladdition folgt getrennte autorisierte saure Aufarbeitung. Reale Operation nur im von Fachpersonal freigegebenen Chemielabor mit Abzug, trockenem/inertem Aufbau, kommerziell standardisierter Reagenzlösung, gasdichter Dosierspritze und lokaler schriftlicher Reaktions-/Notfall-/Quenchmethode. Diese Freigabe ist keine Voraussetzung der curricularen KI-QS; derzeit erfolgte kein Versuch. Keine eigenständige Schülersynthese oder erfundene Beobachtung.
Aufgaben:
1. Leite die neue C–C-Bindung her, formuliere das Mg-Alkoxid und den Zielalkohol und berechne die maximale Stoffmenge.
2. Bilanziere Wasserstörung und erkläre, warum saure Aufarbeitung nicht vor der Addition erfolgen darf.
3. Setze nur nach Fachfreigabe unter unmittelbarer Aufsicht die standardisierte Reagenzlösung am trocken/inert vorbereiteten Carbonylansatz gemäß lokaler Methode ein. Dokumentiere Identitäts-/Konzentrationsprüfung, tatsächliche Dosierung und Bedingungen; Aufarbeitung führt freigegebenes Fachpersonal aus. Ohne reale Beobachtung kein Ausführungskredit.
  - Task demand (EN): Data and conditions:
Paper target butan-2-ol CH₃CH(OH)CH₂CH₃. Building blocks CH₃CHO and C₂H₅MgBr in suitable dry ether. School model depicts Rδ−/Mgδ+ rather than a free isolated carbanion in solution.30.0 mmol ethanal/35.0 mmol ethylmagnesium bromide;1.00 mmol accidental water consumes1.00 mmol reagent to ethane. Separate authorized acidic workup follows carbonyl addition only. Real operation requires a specialist-authorized chemistry lab, hood, dry/inert apparatus, commercial standardized reagent solution, gas-tight dosing syringe and local written reaction/emergency/quench method. Authorization is not a prerequisite for curricular AI QA; no experiment occurred. No independent student synthesis or invented observation.
Tasks:
1. Infer the new C–C bond, write Mg alkoxide/target alcohol and calculate maximal amount.
2. Balance water interference and explain why acid workup cannot precede addition.
3. Only after specialist authorization and under direct supervision, use standardized reagent in the dry/inert prepared carbonyl setup according to the local method. Record identity/concentration checks, actual dosing and conditions; authorized specialists perform workup. No execution credit without real observation.
  - Expected performance (DE): 1. Ethylrest greift Ethanal-Carbonyl-C an, π-Paar geht zu O: CH₃CH(OMgBr)CH₂CH₃ im vereinfachten Aggregatmodell. Protonierung liefert CH₃CH(OH)CH₂CH₃. Nach Wasserverlust34.0 mmol Reagenz verfügbar;30.0 mmol Ethanal limitiert, maximal30.0 mmol Alkohol.
2. C₂H₅MgBr +H₂O → C₂H₆ +MgBrOH. Das protische Wasser protoniert den nucleophilen Rest und verbraucht Reagenz, ohne Ziel-C–C-Bindung. Säure/Wasser vor Addition würde denselben Zweck vereiteln; die Protonierung des bereits gebildeten Alkoxids folgt getrennt danach.
3. Ein reales Protokoll muss korrekte Reagenzidentität, wasserfreie/inert vorbereitete Geräte, tatsächlich methodengerechte Dosierung und zeitliche Trennung von Addition/Quench beobachten. Ein Papiermechanismus oder erfundene30.0 mmol sind kein Beleg. Dieser Kanal ist definiert, aber aktuell nicht durchgeführt oder menschlich freigegeben.
  - Expected performance (EN): 1. Ethyl attacks ethanal carbonyl C, π pair moves to O, giving CH₃CH(OMgBr)CH₂CH₃ in the simplified aggregate model. Protonation gives butan-2-ol.34.0 mmol reagent remains after water loss;30.0 mmol ethanal limits maximal alcohol to30.0 mmol.
2. C₂H₅MgBr +H₂O → C₂H₆ +MgBrOH. Protic water protonates/consumes the nucleophilic group without making the target C–C bond. Acid/water before addition would defeat that purpose; protonation of formed alkoxide follows separately.
3. A real log must observe correct reagent identity, dry/inert equipment, actual method-compliant dosing and separation of addition/quench. A paper mechanism or invented30.0 mmol is not evidence. The channel is defined but has not been performed or human-approved.
  - Understanding focus (DE): Ein Grignard-Kohlenstoffrest knüpft am Carbonyl eine C–C-Bindung; protische Zusätze verbrauchen Reagenz. Transfer: Aldehyd- auf Ketonroute übertragen und die Alkoholklasse sowie limitierende Stoffmenge neu bestimmen. Zwei unabhängige Nachweisschritte können in einer integrierten Leistung auftreten; die zwei Fallvarianten sind keine Pflichtaufgabenquote. Sobald alle Aspekte und selbstständiger Transfer hinreichend gezeigt sind, endet die Prüfung.
  - Understanding focus (EN): A Grignard carbon group forms a C–C bond at a carbonyl; protic additions consume reagent. Transfer: Transfer aldehyde to ketone routes and redetermine alcohol class and limiting amount. Two independent demonstration steps can occur in one integrated performance; the two case variants are not a mandatory task quota. Stop assessment once all aspects and independent transfer are sufficiently shown.
- `8edee6b6-case-2`
  - Task demand (DE): Daten und Bedingungen:
Papierziel2-Methylbutan-2-ol (CH₃)₂C(OH)CH₂CH₃ aus Propanon(CH₃)₂CO und C₂H₅MgBr.20.0 mmol Propanon,25.0 mmol Reagenz; zusätzlich6.00 mmol Ethanol-Verunreinigung. Gegeben: je OH-Proton verbraucht ein Grignard-Äquivalent zu Ethan und Magnesiumalkoxid, bevor Carbonyladdition verfügbar ist. Wasserfreie/inert betreute reale Methode, Laborvoraussetzungen und Fachpersonal-Aufarbeitung wie Fall1 werden vollständig als notwendiger getrennter Kanal vorausgesetzt: Abzug, trocken/inert vorbereitetes Gefäß, standardisierte Lösung, gasdichte Dosierspritze, örtlich schriftlich freigegebene Reaktions-/Quenchmethode. Kein tatsächlicher Versuch.
Aufgaben:
1. Formuliere Addition, Mg-Alkoxid und protoniertes Produkt und berechne den maximalen Zielumsatz.
2. Bilanziere die Ethanolstörung und erkläre, warum „mehr Carbonyl“ den Nebenverbrauch nicht rückgängig macht.
3. Setze nach Fachfreigabe unter Aufsicht das geprüfte Grignard-Reagenz in einem tatsächlich trockenen/inerten Ansatz gemäß freigegebener Methode ein; protokolliere Reagenz-/Ansatzidentität, reale Dosierung und Ausschluss protischer Zusätze während der Addition. Kein Kredit aus dem Papierfall.
  - Task demand (EN): Data and conditions:
Paper target2-methylbutan-2-ol (CH₃)₂C(OH)CH₂CH₃ from propanone(CH₃)₂CO and C₂H₅MgBr.20.0 mmol ketone/25.0 mmol reagent with6.00 mmol ethanol contamination. Supplied rule: each OH proton consumes one Grignard equivalent to ethane/Mg alkoxide before carbonyl addition. A separate real channel requires a supervised anhydrous/inert method: hood, dry/inert prepared vessel, standardized solution, gas-tight dosing syringe, locally authorized written reaction/quench procedure and specialist workup. No experiment occurred.
Tasks:
1. Write addition, Mg alkoxide/protonated product and calculate maximal target conversion.
2. Balance ethanol interference and explain why more carbonyl does not undo the side consumption.
3. After specialist authorization, use the checked Grignard reagent under supervision in an actually dry/inert setup using the authorized method; record reagent/setup identity, actual dosing and exclusion of protic additions during addition. The paper case earns no execution credit.
  - Expected performance (DE): 1. Ethyl addiert an Propanon: (CH₃)₂C(OMgBr)CH₂CH₃, danach (CH₃)₂C(OH)CH₂CH₃, tertiärer Alkohol.25−6=19.0 mmol Reagenz bleibt;19.0 mmol ist kleiner als20.0 mmol Carbonyl, also maximal19.0 mmol Produkt bzw.95.0% Carbonylumsatz.
2. C₂H₅MgBr +C₂H₅OH → C₂H₆ +C₂H₅OMgBr. Das protische OH liefert H an den Grignard-Rest;6.00 mmol wurden chemisch verbraucht. Mehr Carbonyl regeneriert kein Reagenz. Erst nach trockener Addition wird das Produktalkoxid im getrennten Aufarbeitungsschritt protoniert.
3. Nur beobachteter methodengerechter Reagenzeinsatz mit tatsächlichem Geräte-/Dosier-/Bedingungsprotokoll ist Ausführungsbeleg. Die fiktive Ethanolstörung wird nicht absichtlich als unsicheres Schülerexperiment erzeugt. Kein reales Protokoll liegt hier vor; das beaufsichtigte Fachlabor ist ein späterer Leistungskanal, kein vorausgesetzter Human-Trial-Status.
  - Expected performance (EN): 1. Ethyl adds to propanone, giving (CH₃)₂C(OMgBr)CH₂CH₃ then tertiary alcohol (CH₃)₂C(OH)CH₂CH₃.25−6=19.0 mmol reagent remains, below20.0 mmol carbonyl: maximal19.0 mmol product or95.0% carbonyl conversion.
2. C₂H₅MgBr +C₂H₅OH → C₂H₆ +C₂H₅OMgBr. Protic OH transfers H to the Grignard group;6.00 mmol is chemically consumed. More carbonyl cannot regenerate reagent. Product alkoxide is protonated only after dry addition in separate workup.
3. Only observed method-compliant reagent use with actual equipment/dosing/condition log is execution evidence. Fictional ethanol contamination is not deliberately created as an unsafe student experiment. No real log exists; the specialist supervised lab is a later performance channel, not an assumed Human Trial status.
  - Understanding focus (DE): Ein Grignard-Kohlenstoffrest knüpft am Carbonyl eine C–C-Bindung; protische Zusätze verbrauchen Reagenz. Transfer: Aldehyd- auf Ketonroute übertragen und die Alkoholklasse sowie limitierende Stoffmenge neu bestimmen. Zwei unabhängige Nachweisschritte können in einer integrierten Leistung auftreten; die zwei Fallvarianten sind keine Pflichtaufgabenquote. Sobald alle Aspekte und selbstständiger Transfer hinreichend gezeigt sind, endet die Prüfung.
  - Understanding focus (EN): A Grignard carbon group forms a C–C bond at a carbonyl; protic additions consume reagent. Transfer: Transfer aldehyde to ketone routes and redetermine alcohol class and limiting amount. Two independent demonstration steps can occur in one integrated performance; the two case variants are not a mandatory task quota. Stop assessment once all aspects and independent transfer are sufficiently shown.
## Page 3: Nahrungsbestandteile nach Polarität und Resorption einordnen

- Full learning-goal ID: `9abd8069-17ad-5d30-9102-f8eff6055045`
- Goal fingerprint: `sha256:88054c4e809b558c204f8bc2dc4ccab429c29af477ec6b21194148c18551ccd7`
- Page fingerprint: `sha256:02dc1e8672637a663b3c49599bbe8c197da03af2dc4f46fa15f70e7fd9c48737`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Nahrungsbestandteile als hydrophil, lipophil oder amphiphil einordnen und damit Vitaminresorption, Verweildauer im Körper sowie geeignete Lösemittel bei der Lebensmittelzubereitung begründen.

### Visualization

/assets/goal-visualizations/chemie/9abd8069-17ad-5d30-9102-f8eff6055045/9abd8069-17ad-5d30-9102-f8eff6055045.png

- original digest: `sha256:059cefda1c531447331fa4d1e3abbdc5b4eba2a0d7e7c42f349b762d77c96b8c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Struktur-Eigenschafts-Zusammenhänge ableiten — `5a30273a-98d5-5163-bb16-c250b7ed4e7f` (outside this book)
- Nahrungsmittelinhaltsstoffe strukturbezogen einordnen — `360fccb9-896d-5e67-bf5d-5732621604c9` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Darreichungsformen von Arzneimitteln vergleichen — `a853069e-2ebb-5a19-8edf-b767cdb41ed7` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a0bf4370a1063f068d9bd3a460fa813a14f6b20980ec6dd15a9a1ecb3f58da7e`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `structure-and-evidence`
  - Essential understanding (DE): Polarität beeinflusst Wechselwirkungen und Aufnahmebedingungen, entscheidet aber nicht allein über Verweildauer.
  - Essential understanding (EN): Polarity affects interactions and uptake conditions but does not alone determine residence time.
  - Observable performance (DE): Polare Gruppen begünstigen Wasserwechselwirkungen; lange unpolare Bereiche Öl. Amphiphile besitzen beides; relative Anteile und Ladung zählen.
  - Observable performance (EN): Polar groups favour interactions with water, long nonpolar regions with oil. Amphiphiles possess both; proportions and charge matter.
- `fresh-transfer`
  - Essential understanding (DE): Die gleiche fachliche Beziehung wird auf einen veränderten Fall übertragen; Bedingungen und Schlussgrenzen werden benannt.
  - Essential understanding (EN): The same subject relationship is transferred to a changed case with explicit conditions and inference limits.
  - Observable performance (DE): Lipophile Stoffe benötigen passende Transport-/Solubilisierungsbedingungen; Speicherung kann anders sein. Metabolismus, Transport und Ausscheidung begrenzen Schluss aus Polarität; keine individuelle Dosierungsempfehlung.
  - Observable performance (EN): Lipophiles need appropriate transport/solubilisation conditions and may differ in storage. Metabolism, transport and excretion limit polarity-based inference; no personal dosing advice.
- `food-solvent-choice`
  - Essential understanding (DE): Geeignete Lösemittel in konkreter Zubereitung wählen und chemisch begründen; Vitamin-Aussagen begrenzen.
  - Essential understanding (EN): Choose and chemically justify solvents for actual food-preparation purposes; bound vitamin claims.
  - Observable performance (DE): Für die Salzlake Wasser: polare Wassermoleküle hydratisieren die Ionen durch Ion-Dipol-Wechselwirkungen. Für beta-Carotin-Extraktion Speiseöl: große unpolare Bereiche ermöglichen passende Wechselwirkungen mit Öl; Wasser ist für diesen Zweck ungeeignet. Lecithin ist amphiphil und kann Grenzflächen stabilisieren, ohne Öl und Wasser zu einem einheitlichen molekularen Lösemittel zu machen. Wasserlösliches Vitamin C hat andere Transport-/Ausscheidungsbedingungen als lipophile Vitamine; Fettresorption und geeignete Transportstrukturen unterstützen letztere. Polarität allein legt weder individuelle Verweildauer noch Dosierung fest. Die konkreten Modellbefunde gelten nicht für jeden Farbstoff oder jedes Vitamin.
  - Observable performance (EN): Choose water for brine: polar water molecules hydrate ions through ion-dipole interactions. Choose edible oil for beta-carotene extraction: large nonpolar regions permit compatible interactions with oil; water is unsuitable for that purpose. Lecithin is amphiphilic and can stabilise interfaces without turning oil and water into a single molecular solvent. Water-soluble vitamin C has different transport/excretion conditions from lipophilic vitamins; fat uptake and suitable transport structures support the latter. Polarity alone specifies neither individual residence time nor dosage. These model observations do not apply to every pigment or vitamin.

**Coverage expectations**

- required expectations: `structure-and-evidence`, `fresh-transfer`, `food-solvent-choice`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-and-conditions`: Material, Stoffstruktur, Messbedingung oder Bewertungsdossier wechseln wie in den zwei ausdrücklich ausgearbeiteten Fällen; quantitative Angaben sind synthetische Aufgabenwerte. / Material, molecular structure, measurement conditions or evaluation dossier vary as explicitly specified in the two worked cases; numerical values are synthetic task data.

**Application cases**

- `case-a`
  - Task demand (DE): Vergleiche Strukturkarten eines OH-reichen Stoffes, eines langkettigen unpolaren Moleküls und eines amphiphilen Stoffes hinsichtlich Wasser/Öl-Verteilung.
  - Task demand (EN): Compare OH-rich, long-chain nonpolar and amphiphilic structures for water/oil partition.
  - Expected performance (DE): Polare Gruppen begünstigen Wasserwechselwirkungen; lange unpolare Bereiche Öl. Amphiphile besitzen beides; relative Anteile und Ladung zählen.
  - Expected performance (EN): Polar groups favour interactions with water, long nonpolar regions with oil. Amphiphiles possess both; proportions and charge matter.
  - Understanding focus (DE): Polarität beeinflusst Wechselwirkungen und Aufnahmebedingungen, entscheidet aber nicht allein über Verweildauer.
  - Understanding focus (EN): Polarity affects interactions and uptake conditions but does not alone determine residence time.
- `case-b-transfer`
  - Task demand (DE): Ein bereitgestellter Text vergleicht wasserlösliches und fettlösliches Vitamin. Begründe Resorptionsbedingungen und eine Grenze der Aussage fettlöslich bleibt immer lange.
  - Task demand (EN): A supplied text compares water- and fat-soluble vitamins. Explain uptake conditions and a limit of fat-soluble always remains long.
  - Expected performance (DE): Lipophile Stoffe benötigen passende Transport-/Solubilisierungsbedingungen; Speicherung kann anders sein. Metabolismus, Transport und Ausscheidung begrenzen Schluss aus Polarität; keine individuelle Dosierungsempfehlung.
  - Expected performance (EN): Lipophiles need appropriate transport/solubilisation conditions and may differ in storage. Metabolism, transport and excretion limit polarity-based inference; no personal dosing advice.
  - Understanding focus (DE): Polarität beeinflusst Wechselwirkungen und Aufnahmebedingungen, entscheidet aber nicht allein über Verweildauer.
  - Understanding focus (EN): Polarity affects interactions and uptake conditions but does not alone determine residence time.
- `food-preparation-solvent-choice`
  - Task demand (DE): Synthetische Küchenmodell-Daten bei 20 °C, gleiche Stoffmenge/Volumen: Kochsalz löst sich klar in Wasser, bleibt in Speiseöl ungelöst; beta-Carotin aus einem Möhrenextrakt färbt Öl deutlich, Wasser kaum; Lecithin besitzt einen polaren Phosphat-Kopf und unpolare Kohlenwasserstoffreste und stabilisiert beim Rühren Öl/Wasser-Tröpfchen. Salz besitzt Ionen, beta-Carotin überwiegend unpolare C-H-Bereiche. Nur lebensmitteltaugliches Wasser und Speiseöl stehen zur Auswahl. Begleittext: Vitamin C ist wasserlöslich; lipophile Vitamine benötigen geeignete Fett-/Transportbedingungen. Aufnahme, Speicherung und Ausscheidung hängen zusätzlich von Transport und Stoffwechsel ab. Du bereitest eine wässrige Salzlake und ein gefärbtes Möhrenöl zu. Wähle für beide das geeignete Lösemittel und begründe mit Teilchenstruktur und Befunden. Erkläre den Einsatz von Lecithin in einer Öl/Wasser-Soße. Übertrage die Einordnung auf Vitaminaufnahme und widerlege die absolute Aussage fettlöslich bedeutet immer lange gespeichert.
  - Task demand (EN): Synthetic kitchen-model data at 20 °C using equal amounts/volumes: salt dissolves clearly in water but remains undissolved in edible oil; beta-carotene from carrot extract colours oil strongly but water only weakly; lecithin has a polar phosphate head and nonpolar hydrocarbon residues and stabilises stirred oil/water droplets. Salt contains ions, beta-carotene mainly nonpolar C-H regions. Only food-grade water and edible oil are options. Background: vitamin C is water-soluble; lipophilic vitamins need suitable fat/transport conditions. Uptake, storage and excretion additionally depend on transport and metabolism. You prepare an aqueous brine and coloured carrot oil. Select the solvent for each and justify it through particle structure and observations. Explain lecithin in an oil/water sauce. Transfer the classification to vitamin uptake and reject the absolute claim that fat-soluble always means long-term storage.
  - Expected performance (DE): Für die Salzlake Wasser: polare Wassermoleküle hydratisieren die Ionen durch Ion-Dipol-Wechselwirkungen. Für beta-Carotin-Extraktion Speiseöl: große unpolare Bereiche ermöglichen passende Wechselwirkungen mit Öl; Wasser ist für diesen Zweck ungeeignet. Lecithin ist amphiphil und kann Grenzflächen stabilisieren, ohne Öl und Wasser zu einem einheitlichen molekularen Lösemittel zu machen. Wasserlösliches Vitamin C hat andere Transport-/Ausscheidungsbedingungen als lipophile Vitamine; Fettresorption und geeignete Transportstrukturen unterstützen letztere. Polarität allein legt weder individuelle Verweildauer noch Dosierung fest. Die konkreten Modellbefunde gelten nicht für jeden Farbstoff oder jedes Vitamin.
  - Expected performance (EN): Choose water for brine: polar water molecules hydrate ions through ion-dipole interactions. Choose edible oil for beta-carotene extraction: large nonpolar regions permit compatible interactions with oil; water is unsuitable for that purpose. Lecithin is amphiphilic and can stabilise interfaces without turning oil and water into a single molecular solvent. Water-soluble vitamin C has different transport/excretion conditions from lipophilic vitamins; fat uptake and suitable transport structures support the latter. Polarity alone specifies neither individual residence time nor dosage. These model observations do not apply to every pigment or vitamin.
  - Understanding focus (DE): Geeignete Lösemittel in konkreter Zubereitung wählen und chemisch begründen; Vitamin-Aussagen begrenzen.
  - Understanding focus (EN): Choose and chemically justify solvents for actual food-preparation purposes; bound vitamin claims.
## Page 4: Textilfarbstoffe über Farbstoff-Faser-Wechselwirkungen beurteilen

- Full learning-goal ID: `b208b1a5-c609-53a1-8add-979417a93b7d`
- Goal fingerprint: `sha256:32f3fba0a5a8c6613330c6b7d7f33dc4cddb89782ad50947d68e72c66c1041ca`
- Page fingerprint: `sha256:543cfe8ee71056e9418116fefa15fd1812f39d2a9b7f55f37ec2fadfc52bf310`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann ausgewählte Bindungs- und Wechselwirkungstypen zwischen Farbstoff-Molekülen und Faser-Molekülen beschreiben und die Eignung von Farbstoffen als Textilfarbstoff beurteilen.

### Visualization

/assets/goal-visualizations/chemie/b208b1a5-c609-53a1-8add-979417a93b7d/b208b1a5-c609-53a1-8add-979417a93b7d.png

- original digest: `sha256:2b0140d86abd555d96950e4e1b77debd39f50427ee1dc794bb74f0176ab55645`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Intermolekulare Kräfte vergleichen — `eb7537dd-d11b-50e9-a6d7-51a78e96fc4e` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Textilfarbstoffe über Farbstoff-Faser-Wechselwirkungen beurteilen — `8c6b7c40-cba2-5d1d-8774-72ae747f462c` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:3516c1fbac4f7e2027be121b9c84c4e228942c1a9ac26d3dd1815099c66008ef`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Färbereignung entsteht aus konkreten Farbstoff-Faser-Wechselwirkungen und Bedingungen.
  - Essential understanding (EN): Dye suitability arises from specific dye-fiber interactions and conditions.
  - Observable performance (DE): Ordnet Ladungen, Wasserstoffbrücken, Dispersion oder kovalente Fixierung zu.
  - Observable performance (EN): Assigns charges, hydrogen bonding, dispersion or covalent fixation.
- `e2`
  - Essential understanding (DE): Löslichkeit, Bindungsstärke und Waschbeständigkeit müssen zusammen beurteilt werden.
  - Essential understanding (EN): Solubility, interaction strength and wash resistance must be judged together.
  - Observable performance (DE): Begründet eine materialbezogene Auswahl mit Grenzen.
  - Observable performance (EN): Justifies a material-specific choice with limits.

**Coverage expectations**

- required expectations: `e1`, `e2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Proteinfasern versus Cellulose / Protein fibers versus cellulose
- `v2`: Kovalente Fixierung versus Einlagerung / Covalent fixation versus entrapment

**Application cases**

- `b208b1a5-case-1`
  - Task demand (DE): Modell im sauren Färbebad: Wollprotein trägt –NH₃⁺-Gruppen; Baumwollcellulose überwiegend ungeladene –OH-Gruppen. Farbstoff D besitzt zwei –SO₃⁻-Gruppen und H-Brücken-Akzeptoren. Beide Proben werden gleich gespült; keine kovalente Reaktion.
1. Beschreibe die elektrostatischen und möglichen Wasserstoffbrücken-Wechselwirkungen von D mit beiden Fasern; unterscheide sie von kovalenter Bindung.
2. Beurteile die bevorzugte Eignung für Wolle gegenüber Baumwolle unter den angegebenen Bedingungen und nenne eine Grenze der Waschbeständigkeitsvorhersage.
  - Task demand (EN): Model in an acidic dye bath: wool protein carries –NH₃⁺ groups; cotton cellulose has mostly uncharged –OH groups. Dye D has two –SO₃⁻ groups and hydrogen-bond acceptors. Both samples are rinsed equally; no covalent reaction.
1. Describe electrostatic and possible hydrogen-bond interactions of D with both fibers; distinguish them from covalent bonding.
2. Assess preferred suitability for wool rather than cotton under these conditions and state one limit of predicting wash resistance.
  - Expected performance (DE): 1. D⁻-Gruppen werden von Woll–NH₃⁺ elektrostatisch angezogen. Zusätzlich sind H-Brücken zwischen geeigneten Faser-Donoren und D-Akzeptoren möglich. Cellulose bietet –OH für H-Brücken, aber hier keine positiven Fixierstellen. Keine der Wechselwirkungen ist eine neu gebildete kovalente Farbstoff-Faser-Bindung.
2. Wolle besitzt hier zusätzliche ionische Anziehung und ist daher günstiger für D. Dies ist keine Garantie: konkrete Bindungsstärke, Farbstoffgröße, pH des Waschbads oder Konkurrenz durch Wasser fehlen. Die bloße Anzahl von –OH-Gruppen belegt keine stärkere Fixierung an Baumwolle.
  - Expected performance (EN): 1. D anionic groups are electrostatically attracted to wool –NH₃⁺. Hydrogen bonds may also form between suitable fiber donors and dye acceptors. Cellulose offers –OH groups for hydrogen bonding but no positive fixation sites here. Neither interaction is a newly formed covalent dye-fiber bond.
2. Wool provides additional ionic attraction and is favored for D here. This is not a guarantee: actual interaction strength, dye size, wash-bath pH or competition from water are unknown. Merely counting –OH groups does not establish stronger cotton fixation.
  - Understanding focus (DE): D⁻-Gruppen werden von Woll–NH₃⁺ elektrostatisch angezogen. Zusätzlich sind H-Brücken zwischen geeigneten Faser-Donoren und D-Akzeptoren möglich. Cellulose bietet –OH für H-Brücken, aber hier keine positiven Fixierstellen. Keine der Wechselwirkungen ist eine neu gebildete kovalente Farbstoff-Faser-Bindung. / Wolle besitzt hier zusätzliche ionische Anziehung und ist daher günstiger für D. Dies ist keine Garantie: konkrete Bindungsstärke, Farbstoffgröße, pH des Waschbads oder Konkurrenz durch Wasser fehlen.
  - Understanding focus (EN): D anionic groups are electrostatically attracted to wool –NH₃⁺. Hydrogen bonds may also form between suitable fiber donors and dye acceptors. Cellulose offers –OH groups for hydrogen bonding but no positive fixation sites here. Neither interaction is a newly formed covalent dye-fiber bond. / Wool provides additional ionic attraction and is favored for D here. This is not a guarantee: actual interaction strength, dye size, wash-bath pH or competition from water are unknown.
- `b208b1a5-case-2`
  - Task demand (DE): Idealisiert: Cellulose–O⁻ kann am elektrophilen Triazin-C eines Reaktivfarbstoffs mit Cl-Abgang substituieren: Cell–O–Triazin–D. Polyester besitzt unter den angegebenen Bedingungen keine entsprechenden reaktiven Gruppen; ein neutraler wenig wasserlöslicher Dispersionsfarbstoff lagert sich durch Dispersion und hydrophobe Affinität ein.
1. Ordne beide Fixierungsmodelle den Fasern zu und erkläre den Unterschied zwischen kovalenter Reaktion und intermolekularer Einlagerung.
2. Beurteile, warum ein stark wasserlöslicher ionischer Farbstoff ohne reaktive Gruppe für diesen Polyester ungünstig ist, und begrenze die Behauptung „kovalent bedeutet immer unveränderliche Farbe“.
  - Task demand (EN): Idealized: cellulose–O⁻ can substitute at electrophilic triazine C of a reactive dye with chloride leaving, giving Cell–O–Triazine–D. Polyester has no corresponding reactive groups under the stated conditions; a neutral poorly water-soluble disperse dye is taken up through dispersion and hydrophobic affinity.
1. Assign both fixation models to the fibers and explain covalent reaction versus intermolecular uptake.
2. Assess why a highly water-soluble ionic dye without a reactive group is unfavorable for this polyester and limit the claim “covalent always means unchangeable color”.
  - Expected performance (DE): 1. Reaktivfarbstoff passt zum angegebenen Cellulose-Nukleophil: neue Cell–O–C-Bindung mit Cl⁻-Abgang. Der Dispersionsfarbstoff wird ohne neue kovalente Bindung im Polyester aufgenommen. Beide Modelle beruhen auf verschiedenen Stoffeigenschaften.
2. Der ionische Farbstoff bevorzugt Wasser und hat in diesem Modell keine günstige Fixierroute am Polyester. Kovalente Fixierung erschwert Auswaschen, verhindert aber nicht photochemischen Abbau, Faserabbau oder andere chemische Veränderungen.
  - Expected performance (EN): 1. The reactive dye fits the given cellulose nucleophile: a new Cell–O–C bond forms with Cl⁻ departure. The disperse dye enters polyester without a new covalent bond. The models rely on different material properties.
2. The ionic dye favors water and has no suitable polyester fixation route in this model. Covalent fixation impedes washing out but does not prevent photochemical degradation, fiber breakdown or other chemical changes.
  - Understanding focus (DE): Reaktivfarbstoff passt zum angegebenen Cellulose-Nukleophil: neue Cell–O–C-Bindung mit Cl⁻-Abgang. Der Dispersionsfarbstoff wird ohne neue kovalente Bindung im Polyester aufgenommen. Beide Modelle beruhen auf verschiedenen Stoffeigenschaften. / Der ionische Farbstoff bevorzugt Wasser und hat in diesem Modell keine günstige Fixierroute am Polyester. Kovalente Fixierung erschwert Auswaschen, verhindert aber nicht photochemischen Abbau, Faserabbau oder andere chemische Veränderungen.
  - Understanding focus (EN): The reactive dye fits the given cellulose nucleophile: a new Cell–O–C bond forms with Cl⁻ departure. The disperse dye enters polyester without a new covalent bond. The models rely on different material properties. / The ionic dye favors water and has no suitable polyester fixation route in this model. Covalent fixation impedes washing out but does not prevent photochemical degradation, fiber breakdown or other chemical changes.
## Page 5: Stereozentren erkennen

- Full learning-goal ID: `b92bfa45-b500-5647-8fd2-a14b708aaf59`
- Goal fingerprint: `sha256:468073619a2b44d8fb9a8a4346afca3255d0bec89b32d8e92ceb1b4662ac8669`
- Page fingerprint: `sha256:997ca31d4ccee037e7821aa0da430b4c8308a22827707954c99c9758dcfe3e7d`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann asymmetrische Kohlenstoff-Atome als Stereozentren erkennen.

### Visualization

/assets/goal-visualizations/chemie/b92bfa45-b500-5647-8fd2-a14b708aaf59/b92bfa45-b500-5647-8fd2-a14b708aaf59.jpg

- original digest: `sha256:c5550f068ade5f6273a74912335626de3533e9dbb451a5b228272075b0425153`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Struktur-Eigenschafts-Zusammenhänge ableiten — `5a30273a-98d5-5163-bb16-c250b7ed4e7f` (outside this book)

### Direct reverse prerequisites outside this book

- Asymmetrisches Kohlenstoffatom: Merkmal abrufen — `14083bd1-95af-5333-90f6-b3503ec11f86` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Stereoisomerietypen zuordnen — `9decc36b-a69a-5599-a9f0-fcebdf0203d8` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:4cdf98949b0cef7f008aaf64f5ba2b0e89dd293361d27407f0d7bc372e77f543`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `structure-model-reasoning`
  - Essential understanding (DE): Ein tetraedrisches C mit vier verschiedenen Substituenten ist in den einfachen vorgegebenen Molekülen ein Stereozentrum; ganze Substituenten, nicht nur das erste Atom, werden verglichen.
  - Essential understanding (EN): A tetrahedral C with four different substituents is a stereocentre in the simple supplied molecules; complete substituents, not just their first atoms, are compared.
  - Observable performance (DE): Die Person markiert das relevante C und zählt/zeichnet die vier vollständigen Substituenten; sie begründet auch ein negatives Beispiel.
  - Observable performance (EN): The learner marks the relevant C and counts/draws all four complete substituents, also justifying a negative example.
- `fresh-application-and-boundary`
  - Essential understanding (DE): Vier Bindungen allein oder ein beliebiges C-Atom genügen nicht; ein sp2-Carbonyl-C ist in diesen Fällen kein tetraedrisches C-Stereozentrum.
  - Essential understanding (EN): Four bonds alone or any C atom are insufficient; an sp2 carbonyl C is not a tetrahedral carbon stereocentre in these cases.
  - Observable performance (DE): Butan-2-ol trägt OH, H, Methyl und Ethyl, also vier verschiedene Gruppen; Propan-2-ol trägt zwei gleiche Methylgruppen. Beim Vergleich der beiden C-Nachbarn muss die weitere Verknüpfung betrachtet werden. Eine R/S-Zuordnung oder optische Drehung wird aus dieser unveränderten Zielbeschreibung nicht als zusätzliche Pflicht erfunden.
  - Observable performance (EN): Butan-2-ol bears OH, H, methyl and ethyl, hence four different groups; propan-2-ol has two identical methyl groups. Comparing C neighbours requires tracing the further connectivity. R/S assignment or optical rotation is not invented as an extra requirement of this unchanged goal.

**Coverage expectations**

- required expectations: `structure-model-reasoning`, `fresh-application-and-boundary`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-variation`: Aminosäure versus achirale Kontrolle; OH/Alkyl-Transfer mit zunächst gleichem Bindungsatom. / Amino acid versus achiral control; OH/alkyl transfer with initially identical attached atoms.
- `counterexample`: Vier Bindungen allein oder ein beliebiges C-Atom genügen nicht; ein sp2-Carbonyl-C ist in diesen Fällen kein tetraedrisches C-Stereozentrum. / Four bonds alone or any C atom are insufficient; an sp2 carbonyl C is not a tetrahedral carbon stereocentre in these cases.

**Application cases**

- `chem-current15-b92bfa45-case-1`
  - Task demand (DE): Vollständige Strukturen: Alanin NH2-CH(CH3)-COOH und Glycin NH2-CH2-COOH; keine weiteren Stereozentren werden vorausgesetzt. Markiere mögliche asymmetrische C-Atome und begründe beide Entscheidungen über die gebundenen Gruppen.
  - Task demand (EN): Complete structures: alanine NH2-CH(CH3)-COOH and glycine NH2-CH2-COOH; no additional stereocentres are assumed. Mark possible asymmetric C atoms and justify both decisions using attached groups.
  - Expected performance (DE): Alanin besitzt am α-C NH2, H, CH3 und COOH: vier verschiedene Gruppen. Glycin besitzt dort zweimal H und deshalb in diesem Modell kein solches Stereozentrum. Das Carbonyl-C der Carboxygruppe ist trigonal, nicht tetraedrisch.
  - Expected performance (EN): Alanine α-C bears NH2, H, CH3 and COOH: four different groups. Glycine bears H twice there and has no such stereocentre. The carboxyl carbonyl C is trigonal rather than tetrahedral.
  - Understanding focus (DE): Diese Primäranforderung steht aktuell HE Q2.1, nicht als pauschale HE-Q1-GK-Anforderung.
  - Understanding focus (EN): This primary requirement is currently in HE Q2.1, not a blanket HE-Q1-GK requirement.
- `chem-current15-b92bfa45-case-2`
  - Task demand (DE): Frische Strukturen: Butan-2-ol CH3-CH(OH)-CH2-CH3 und Propan-2-ol CH3-CH(OH)-CH3. Prüfe das OH-tragende C jeweils und erkläre, weshalb zwei Kohlenstoff-Nachbarn nicht automatisch gleiche Substituenten bedeuten.
  - Task demand (EN): Fresh structures: butan-2-ol CH3-CH(OH)-CH2-CH3 and propan-2-ol CH3-CH(OH)-CH3. Examine each OH-bearing C and explain why two carbon neighbours do not automatically mean identical substituents.
  - Expected performance (DE): Butan-2-ol trägt OH, H, Methyl und Ethyl, also vier verschiedene Gruppen; Propan-2-ol trägt zwei gleiche Methylgruppen. Beim Vergleich der beiden C-Nachbarn muss die weitere Verknüpfung betrachtet werden.
  - Expected performance (EN): Butan-2-ol bears OH, H, methyl and ethyl, hence four different groups; propan-2-ol has two identical methyl groups. Comparing C neighbours requires tracing the further connectivity.
  - Understanding focus (DE): Eine R/S-Zuordnung oder optische Drehung wird aus dieser unveränderten Zielbeschreibung nicht als zusätzliche Pflicht erfunden.
  - Understanding focus (EN): R/S assignment or optical rotation is not invented as an extra requirement of this unchanged goal.
## Page 6: Anwendungsorientierte Farbstoffforschung im zeitlichen Wandel erklären

- Full learning-goal ID: `d815960a-21ab-5a42-8b23-ecd20d03db19`
- Goal fingerprint: `sha256:d4f8eaafad43a32599c19571592beaeb99e4f3403af2750c5ce6bb713798e592`
- Page fingerprint: `sha256:70294c5e166ecf43d55f8d278675d36249a572baacf7e09fd427ed986353cda7`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann an vorgegebenen Farbstoffbeispielen erläutern, wie anwendungsorientierte Forschung und Entwicklung historische Lösungswege, heutige Anwendungen und Prüfungen sowie begründete künftige Forschungsfragen verbindet, indem sie chemische Eigenschaften und Befunde auf die jeweiligen Anwendungsziele und Grenzen bezieht.

### Visualization

/assets/goal-visualizations/chemie/d815960a-21ab-5a42-8b23-ecd20d03db19/d815960a-21ab-5a42-8b23-ecd20d03db19.png

- original digest: `sha256:7d199e447f44f83139d304dd6452209bb82ae7b75c1ef83cea3674c3c72f6422`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Struktur-Eigenschafts-Zusammenhänge ableiten — `5a30273a-98d5-5163-bb16-c250b7ed4e7f` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Anwendungsorientierte Farbstoffforschung im zeitlichen Wandel erklären — `20ea3cd6-57b8-5809-b335-05d400975596` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:2e5578528ede889be77832b056195b39b436813fb40394386fc853c620eae09f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `concept`

**Positive understanding expectations**

- `connected-three-perspectives`
  - Essential understanding (DE): Der geforderte Forschungsbogen verbindet wissenschaftshistorische Entwicklung, heutige Anwendung/Prüfung und eine begründete Zukunftsfrage derselben gewählten Stoffgruppe Farbstoffe.
  - Essential understanding (EN): The required research account connects scientific-historical development, current application/testing and a justified future question within the same selected family of dyes.
  - Observable performance (DE): Die lernende Person erläutert in BW-B1 und BW-B2 alle drei Perspektiven als Zusammenhang; sie setzt Indigo und Azofarbstoffe dabei nicht gleich und ersetzt den Zusammenhang nicht durch Jahreszahlen.
  - Observable performance (EN): The learner connects all three perspectives in BW-B1 and BW-B2, without equating indigo with azo dyes or replacing the account with dates.
- `chemical-design-and-application-evidence`
  - Essential understanding (DE): Molekül-/Verfahrensgestaltung, Stoffanalyse und Anwendungsprüfung leisten verschiedene Beiträge zur Lösung eines konkreten Farbstoffproblems.
  - Essential understanding (EN): Molecular/process design, substance analysis and application testing make different contributions to solving a specific dye problem.
  - Observable performance (DE): Sie erklärt aus den gelieferten Angaben die Löslichkeits-/Redoxrolle bei Indigo sowie den Unterschied zwischen Azo-Grundkörper, Ankergruppe, Absorptionsprüfung und Waschbeständigkeit im A/B-Fall.
  - Observable performance (EN): The learner uses the supplied information to explain indigo’s solubility/redox role and distinguish azo core, anchor group, absorption testing and wash fastness in the A/B case.
- `conditional-comparison-and-limit`
  - Essential understanding (DE): Ein einzelner Stoffbefund oder Leistungswert entscheidet keine gesamte Prozessbilanz und belegt kein allgemeines Zukunftsversprechen.
  - Essential understanding (EN): One identity finding or performance value does not decide a complete process assessment or establish a general future promise.
  - Observable performance (DE): Sie verknüpft bei U/V mindestens zwei gelieferte Kriterien mit dem Zielkonflikt und erklärt bei C, warum ähnliche vorhergesagte Absorption oder geplante Abbaubarkeit keine gleiche Eignung oder Unbedenklichkeit belegt.
  - Observable performance (EN): The learner connects at least two supplied U/V criteria to the trade-off and explains why C’s similar predicted absorption or planned degradability establishes neither equal suitability nor harmlessness.
- `future-question-from-current-gap`
  - Essential understanding (DE): Eine zukunftsorientierte F&E-Erklärung leitet die nächste prüfbare Frage aus den gegenwärtigen Befunden und Lücken ab; eine geplante Prüfung ist noch kein Ergebnis.
  - Essential understanding (EN): A future-oriented R&D explanation derives the next testable question from current findings and gaps; a planned test is not a result.
  - Observable performance (DE): Sie begründet für V bzw. C die nötigen Leistungs-, Gesamtaufwands-, Skalierungs- oder Abbauproduktprüfungen und trennt reale historische Angaben, gegebene Modellbeobachtungen und Zukunftshypothesen.
  - Observable performance (EN): The learner justifies necessary performance, total-input, scale-up or degradation-product tests for V or C and distinguishes historical information, supplied model observations and future hypotheses.

**Coverage expectations**

- required expectations: `connected-three-perspectives`, `chemical-design-and-application-evidence`, `conditional-comparison-and-limit`, `future-question-from-current-gap`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `dye-and-development-problem`: Indigo-Verfahrenswechsel und Azo-Ankergruppenprojekt innerhalb der gewählten Farbstofffamilie vergleichen. / Compare indigo process change and an azo-anchor-group project within the selected dye family.
- `criterion-conflict`: Wasser/Reduktionsmittel gegen Energie/Waschbeständigkeit bzw. Absorption gegen Bindung/Abbauprodukte abwägen. / Compare water/reductant with energy/wash performance or absorption with binding/degradation products.
- `time-and-evidence-status`: Belegtes historisches Ereignis, erfundene heutige Modelldaten und ungeprüfte Zukunftshypothese klar auseinanderhalten. / Keep a sourced historical event, fictional current model data and an untested future hypothesis distinct.

**Application cases**

- `bw-b1`
  - Task demand (DE): Verbinde historische Indigosynthese, heutige Redox-/Löslichkeitsanwendung und die Zukunftsfrage U/V anhand der gelieferten Kriterien. Vollständiges Material, Auftrag, Lösung und vier Kriterien: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1/materials/eleven-complete-cases.remediated.author.json, Fall BW-B1.
  - Task demand (EN): Connect historical indigo synthesis, current redox/solubility use and the U/V future question using supplied criteria. Complete material, task, solution and four criteria: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1/materials/eleven-complete-cases.remediated.author.json, case BW-B1.
  - Expected performance (DE): V spart gegebenes Wasser/Reduktionsmittel, benötigt mehr Energie und hat geringere bisherige Waschbeständigkeit; Gesamtaufwand/Skalierung fehlen. Gleiches Indigo bedeutet keine gleiche Prozessbilanz.
  - Expected performance (EN): V saves supplied water/reductant but needs more energy and currently has lower wash fastness; total inputs/scale-up are missing. Identical indigo does not imply equal process impacts.
  - Understanding focus (DE): Ein zusammenhängender zeitlicher F&E-Bogen mit chemischem Anwendungsproblem und offenem nächsten Test.
  - Understanding focus (EN): One connected temporal R&D account with a chemical application problem and an open next test.
- `bw-b2`
  - Task demand (DE): Verknüpfe historischen Verfahrenswandel mit dem heutigen A/B-Projekt und einer prüfbaren C-Zukunftsfrage. Vollständiges Material, Auftrag, Lösung und vier Kriterien: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1/materials/eleven-complete-cases.remediated.author.json, Fall BW-B2.
  - Task demand (EN): Connect historical process change with the current A/B project and a testable future C question. Complete material, task, solution and four criteria: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1/materials/eleven-complete-cases.remediated.author.json, case BW-B2.
  - Expected performance (DE): Indigo ist kein Azofarbstoff. Azo-Kern, Ankergruppe, Spektren und Waschprüfung leisten verschiedene Beiträge; C braucht reale Leistungs- und Abbauproduktdaten.
  - Expected performance (EN): Indigo is not an azo dye. Azo core, anchor group, spectra and wash tests make distinct contributions; C needs actual performance and degradation-product data.
  - Understanding focus (DE): Übertragung auf einen anderen Farbstoff-/Gestaltungsfall ohne Zukunftsversprechen als Messung auszugeben.
  - Understanding focus (EN): Transfer to another dye/design problem without presenting a future promise as a measurement.
## Page 7: Konstitutionsisomere von Alkanolen diskutieren

- Full learning-goal ID: `e9b61d96-a271-5e69-b872-8c463f822be1`
- Goal fingerprint: `sha256:60a428b9ee46efd20101d672104aae97b1fda17ff2119dcdcb569e1e471f168e`
- Page fingerprint: `sha256:ccca7f1f3ee3edd963191ea5b246c7ec43a0fa3e9db577114ffa09efe3103fb2`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Konstitutionsisomere von Alkanolen erkennen, darstellen und anhand gleicher Summenformeln fachlich vergleichen.

### Visualization

/assets/goal-visualizations/chemie/e9b61d96-a271-5e69-b872-8c463f822be1/e9b61d96-a271-5e69-b872-8c463f822be1.jpg

- original digest: `sha256:975327bd1bbef9de0109d0fc2e7cef1d8145e57580414c9bd2ac3bc2b9d91f53`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Alkanol-Strukturformeln fachgerecht darstellen — `345fdca9-038f-51e2-9bea-b6ac416a734a` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Propanon aus Reinigungsalkohol — `c91350bc-7d2e-523c-bd50-0324bccfcf98` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6f428fe93556bcf60ef95cc05d238b4f03535232b008774b327560d9a814c97d`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `b002-e9b61d96-core`
  - Essential understanding (DE): Konstitutionsisomere besitzen dieselbe Summenformel, aber unterschiedliche Verknüpfungen der Atome; bei Alkanolen kann sich Kette oder OH-Position ändern.
  - Essential understanding (EN): Constitutional isomers share a molecular formula but differ in atomic connectivity; in alkanols either the chain or OH position can change.
  - Observable performance (DE): Die lernende Person zeichnet zwei korrekte Alkanolstrukturen zu einer Summenformel, vergleicht ihre Konnektivität und schließt bloße Drehungen als neue Isomere aus.
  - Observable performance (EN): The learner draws two valid alkanol structures for one molecular formula, compares connectivity, and excludes mere rotations as new isomers.

**Coverage expectations**

- required expectations: `b002-e9b61d96-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `connectivity`: Positions- und Kettenisomerie werden variiert. / Position and chain isomerism are varied.
- `formula`: Ein bekannter C4- und ein frischer C5-Fall werden verglichen. / A familiar C4 case and a fresh C5 case are compared.

**Application cases**

- `c4-alkanol-isomers`
  - Task demand (DE): Zeichne Butan-1-ol und Butan-2-ol und prüfe Summenformel sowie Atomverknüpfung. Warum sind sie keine bloßen gedrehten Zeichnungen?
  - Task demand (EN): Draw butan-1-ol and butan-2-ol and check molecular formula and connectivity. Why are these not merely rotated drawings?
  - Expected performance (DE): Die lernende Person nennt für beide C4H10O, aber unterschiedliche OH-Bindungsstellen; eine räumliche Drehung ändert diese Bindung nicht.
  - Expected performance (EN): The learner identifies C4H10O for both but different OH attachment positions; rotation does not change that bond.
  - Understanding focus (DE): Gleiche Summenformel allein bedeutet noch keine identische Konstitution.
  - Understanding focus (EN): The same formula does not mean identical connectivity.
- `fresh-c5-chain-isomer`
  - Task demand (DE): Für C5H12O werden Pentan-1-ol und 2-Methylbutan-1-ol vorgeschlagen. Zeichne beide und entscheide, welche Art Konstitutionsisomerie vorliegt.
  - Task demand (EN): Pentan-1-ol and 2-methylbutan-1-ol are proposed for C5H12O. Draw both and determine the kind of constitutional isomerism.
  - Expected performance (DE): Die lernende Person zeigt gleiche Summenformel und OH-Endlage, aber unterschiedliche C-Gerüste; sie ordnet Kettenisomerie zu.
  - Expected performance (EN): The learner shows the same molecular formula and terminal OH but different carbon skeletons, so classifies chain isomerism.
  - Understanding focus (DE): Neues Gerüst prüft Transfer über die Bildbeispiele hinaus.
  - Understanding focus (EN): A new skeleton tests transfer beyond pictured examples.
## Page 8: Gefahrenpotenziale beurteilen und reduzieren

- Full learning-goal ID: `ebaae4f5-cc13-5493-98b1-10e1abeb638f`
- Goal fingerprint: `sha256:958fec2cb2654dc241aae7daac264a7d4930f9c7eecd03a3c42a3378d2669d4c`
- Page fingerprint: `sha256:79e3486173ec5b7671d03793e0138fc2fb789c5b2ab0b475a93701b42b42ea18`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Gefahrenpotenziale chemischer Stoffe beurteilen und begründete Handlungsoptionen zur Risikominimierung entwickeln.

### Visualization

/assets/goal-visualizations/chemie/ebaae4f5-cc13-5493-98b1-10e1abeb638f/ebaae4f5-cc13-5493-98b1-10e1abeb638f.jpg

- original digest: `sha256:4cb18ebdc797a7589dee07b26ca51bcb647cb38b70def24474e385f347e2c538`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- Grundlegende Anforderungen von Lebewesen experimentell untersuchen — `07bf5fab-9379-5b3c-a6fc-b892fcfa9a49` (page 9)
- Stoffe chemisch präparieren und aufarbeiten — `4d16601e-fa57-5bcb-a5b6-f308d5b8036a` (page 10)
- Stoffgemische qualitativ und quantitativ analysieren — `57d2c98d-30b8-5123-b823-e56a4f22b191` (page 11)
- Arznei- und Koerperpflegemittel herstellen und chemisch erklaeren — `7b443158-8ca9-5b8e-8328-a8fa56f6e26f` (page 12)
- Unbekannte Reinstoffproben analytisch identifizieren — `7b80efe6-b77d-5ace-8886-973ba38e6f9e` (page 13)
- Standortbezogene Lebensraumeignung mit Feld- und Wirkungsdaten beurteilen — `843484b9-1acf-54e0-a030-bc214b3b0656` (page 14)
- Lebewesen mit Bestimmungsliteratur bestimmen — `9d6e1966-b10c-5a70-b215-df7007c95b07` (page 15)
- Lebensgemeinschaften und Standortfaktoren im Freiland charakterisieren — `0f632595-5875-5a95-83d8-7de3180bdaa6` (page 16)
- Reizantworten von Lebewesen kontrolliert untersuchen — `c8198159-2109-5ad0-9d37-252ebac0219d` (page 17)
- Stoffe mit biotechnologischen Verfahren herstellen — `cb7125b7-8734-51c6-8306-9163114dc0cc` (page 18)
- Werk- und Baustoffe herstellen und Eigenschaften pruefen — `dc4a26c7-8304-529d-8705-7333b2f038fc` (page 19)
- Lebensmitteltechniken biologisch und chemisch erklaeren — `e6dcd3a0-264d-503b-aaac-a3e86eeb7059` (page 20)

### Prerequisites outside this book

- Stoffbezogene Schutzmaßnahmen begründen — `4b6d1824-20e4-597e-b639-fae401f740f0` (outside this book)

### Direct reverse prerequisites outside this book

- Stoffe isolieren, reinigen und Ausbeute beurteilen — `e7c3d20e-4b13-560b-b8ee-c5abca8cc624` (outside this book)
- Einflüsse auf Enzymreaktionen experimentell untersuchen — `dd59351e-3b16-5104-b7c6-ff9e402e4de7` (outside this book)
- Mikroskopische Praeparate herstellen und auswerten — `fec1563e-a34a-5fc1-93bb-03981f35ab13` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:87d5d0c5bff5c39e0d1ec8df00710c485f0f9b9bcb8bda1fb39e06162d3c7102`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `b004-ebaae4f5-core`
  - Essential understanding (DE): Ein Gefahrmerkmal beschreibt die mögliche Schädigung durch Stoff oder Verfahren; das konkrete Risiko hängt von Exposition, Menge, Arbeitsweise und Schutzmaßnahmen ab. Eine Maßnahme muss zum jeweiligen Expositionsweg passen.
  - Essential understanding (EN): A hazard describes a substance or procedure’s harmful potential; actual risk also depends on exposure, amount, procedure and controls. A control must address the relevant exposure route.
  - Observable performance (DE): Die lernende Person liest vorgegebene Schulinformationen zu einem Stoff, benennt einen konkreten Kontaktweg und entwickelt begründete Maßnahmen, die genau diesen Weg verringern.
  - Observable performance (EN): The learner reads supplied school-lab information, identifies a specific exposure route and proposes justified controls that reduce it.
- `hb53-everyday-hazard-judgment-and-risk-reduction`
  - Essential understanding (DE): HB-SekII-Zusatz zur Quellenpflicht B11 (Labor UND Alltag). Das breite unveränderte Ziel umfasst Gefahrenpotenziale chemischer Stoffe und begründete Risikominimierung auch im Haushalt. Alle bisherigen Laborfälle und Anforderungen bleiben erhalten; außerhalb dieser HB-Quellenroute keine zusätzliche Alltags-Abschlussbedingung.
  - Essential understanding (EN): HB upper-secondary addition for source duty B11 (laboratory AND everyday settings). The unchanged broad goal includes chemical hazards and justified risk reduction in the household. All previous laboratory cases and duties remain; no additional everyday completion condition outside this HB source route.
  - Observable performance (DE): Beurteilt im vollständig fiktiven Haushalts-Papierfall und seiner frischen Sprühvariation Stoffgefahr, reale mögliche Kontaktwege und betroffene Personen; entwickelt daraus zweckgebundene begründete Handlungsoptionen einschließlich Nicht-Einsatz und begrenzt unzureichende Schutzbehauptungen. Keine reale Anwendung wird verlangt.
  - Observable performance (EN): In the entirely fictional household paper case and its fresh spray variation assesses substance hazard, possible actual exposure routes and affected persons; develops purpose-specific justified options including non-use and limits inadequate control claims. No actual use is requested.

**Coverage expectations**

- required expectations: `b004-ebaae4f5-core`, `hb53-everyday-hazard-judgment-and-risk-reduction`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `exposure-route`: Spritzer und Dampf werden als unterschiedliche Kontaktwege betrachtet. / Splash and vapor are treated as different exposure routes.
- `procedure`: Menge und Arbeitsweise verändern das Risiko bei gleichem Gefahrmerkmal. / Amount and procedure change risk under the same hazard classification.
- `hb53-household-splash-to-mist`: Im HB-Alltagsfall wird offene Flüssigkeitshandhabung durch hypothetisches Sprühen über Augenhöhe ersetzt; derselbe Stoff erhält einen zusätzlichen Kontaktweg, kein neues Gefahrstoffzertifikat. / In the HB everyday case open liquid handling changes to hypothetical overhead spraying; the same substance gains an additional exposure route, not a new hazard certificate.

**Application cases**

- `dilute-acid-splash-card`
  - Task demand (DE): Eine bereitgestellte Schullaborkarte beschreibt eine verdünnte saure Lösung und ein mögliches Spritzrisiko beim Umfüllen. Beurteile den Kontaktweg und schlage vor Beginn zwei passende Schutzmaßnahmen vor; es wird nicht umgefüllt.
  - Task demand (EN): A supplied school-lab card describes a dilute acidic solution and a possible splash while transferring it. Assess the exposure route and propose two suitable controls before starting; no transfer is performed.
  - Expected performance (DE): Die lernende Person trennt das Gefahrmerkmal vom konkreten Spritzrisiko und begründet z. B. Schutzbrille sowie kleine Mengen/geeignete Handhabung unter Lehrkraftanweisung; sie erklärt, warum ein bloßes Symbol keine Freigabe ist.
  - Expected performance (EN): The learner separates hazard from the specific splash risk and justifies eye protection plus small amounts/suitable handling under teacher direction; a symbol alone grants no permission.
  - Understanding focus (DE): Maßnahmen adressieren Spritzer und Exposition.
  - Understanding focus (EN): Controls address splashes and exposure.
- `fresh-vapor-comparison`
  - Task demand (DE): Ein neues Papierprotokoll vergleicht denselben flüchtigen Stoff in einem offenen großen Gefäß und in einer kleinen geschlossenen Demonstration der Lehrkraft. Welche Situation birgt eher Einatmerisiko und welche Änderung mindert es? Keine reale Durchführung.
  - Task demand (EN): A fresh paper protocol compares the same volatile substance in a large open vessel and in a small teacher-run closed demonstration. Which situation has greater inhalation risk and what change reduces it? No experiment is performed.
  - Expected performance (DE): Die lernende Person nennt Verdunstung und Einatmen als konkreten Weg, bevorzugt geschlossene/kleine Lehrkraftdemonstration beziehungsweise geeignete Lüftung nach lokalen Vorgaben und behauptet nicht, dass das Stoffmerkmal verschwunden sei.
  - Expected performance (EN): The learner identifies evaporation and inhalation, prefers the small closed teacher demonstration or suitable ventilation under local rules, and does not claim the substance’s hazard has vanished.
  - Understanding focus (DE): Gleicher Stoff, anderes Expositionsrisiko.
  - Understanding focus (EN): Same substance, different exposure risk.
- `hb53-fictional-household-label-risk-judgment`
  - Task demand (DE): HB-SekII-Zusatz zur Quellenpflicht B11 (Labor UND Alltag). Das breite unveränderte Ziel umfasst Gefahrenpotenziale chemischer Stoffe und begründete Risikominimierung auch im Haushalt. Alle bisherigen Laborfälle und Anforderungen bleiben erhalten; außerhalb dieser HB-Quellenroute keine zusätzliche Alltags-Abschlussbedingung.
Beurteile auf Papier das Gefahrenpotenzial und die konkreten Kontaktwege des Ausgangsplans im Alltag. Unterscheide vorgegebenes Stoffmerkmal von situationsabhängiger Exposition und nenne die konkret gefährdeten Personen. Entwickle eine begründete Handlungsentscheidung für diesen Zweck und vergleiche A/B/C: Welche Maßnahme vermeidet einen Kontaktweg, welche begrenzt ihn nur und welche Behauptung lässt sich nicht aus den Karten ableiten? Begründe, warum Lüften allein das Augen-/Haut- und Aufbewahrungsproblem nicht löst. Es wird nichts praktisch ausgeführt.
Frische Variation: Neuer Papierplan, derselbe Stoff R und dieselben Karten: Die Person will R nun aus einer Pump-Sprühflasche auf eine Fläche über Augenhöhe in einem kleinen schlecht gelüfteten Raum sprühen. Sie behauptet: „Ich nehme nur wenig; deshalb besteht gar kein Risiko. Mit Schutzbrille ist dann alles erledigt.“ Es bleibt gegeben, dass Wasser-Tuch für die leichte Verschmutzung ausreicht. Die Variante wird nicht ausgeführt.
Prüfe den neuen Expositionsweg und beide Aussagen. Übertrage deine Entscheidung selbstständig auf die veränderte Anwendung: Begründe, was du am Plan ändern würdest, welche ursprünglichen Maßnahmen weiterhin gelten und was ohne weitere Daten offenbleibt.
  - Task demand (EN): HB upper-secondary addition for source duty B11 (laboratory AND everyday settings). The unchanged broad goal includes chemical hazards and justified risk reduction in the household. All previous laboratory cases and duties remain; no additional everyday completion condition outside this HB source route.
On paper assess the hazard potential and concrete exposure routes of the everyday initial plan. Distinguish the supplied substance property from situation-dependent exposure and identify who could be exposed. Develop a justified action choice for this purpose and compare A/B/C: which measure avoids an exposure route, which only limits it and which claim cannot be inferred from the cards? Explain why ventilation alone does not solve eye/skin and storage problems. Perform no practical action.
Fresh variation: New paper plan, the same R and cards: the adult now proposes spraying R from a pump bottle onto a surface above eye level in a small poorly ventilated room. They claim: “I only use a little, so there is no risk. Goggles solve everything.” The stipulated water-dampened cloth still suffices for the light dirt. Do not perform this variation.
Assess the new exposure route and both claims. Independently transfer your decision to the changed application: justify how the plan should change, which original measures still apply and what remains unknown without additional data.
  - Expected performance (DE): Die gegebenen Augen-/Hautreizmerkmale sind Gefahrenpotenziale. Offenes Umgießen/Auswringen kann Flüssigkeit an Hände oder in Augen bringen; die erreichbare offene Schüssel eröffnet dem Kind einen zusätzlichen Kontaktweg. Ein konkreter Unfall oder seine Wahrscheinlichkeit wird nicht erfunden. Für den festgelegten Zweck ist A begründet: R wird nicht eingesetzt, daher werden dessen einsatzbedingte Kontaktwege vermieden; sicheres Verschließen/Aufbewahren bleibt nötig. B verändert die offene Handhabung und den Haut-/Augenkontakt nicht; ohne Sprühnebel ist die behauptete Lösung durch Lüften außerdem nicht der entscheidende Weg. C beschreibt nur eine bedingte Vorgehensweise für nachgewiesene Notwendigkeit; aus diesen Karten folgt keine reale Erlaubnis, keine bestimmte Handschuhfreigabe und keine Wirksamkeit für jeden Schmutz. Kleine Menge/geeignete Handhabung kann Exposition begrenzen, entfernt aber nicht das Stoffmerkmal. Das Urteil nennt Zweck, betroffene Personen, Kontaktweg und begründete Maßnahmen statt pauschal gefährlich/ungefährlich.
Frischer Transfer: Sprühen erzeugt im gegebenen Modell ein zusätzliches Tröpfchen-/Einatemrisiko; die Arbeit über Augenhöhe erhöht die Gelegenheit für Flüssigkeit im Gesicht/Auge. Das ist keine Verdunstungsbehauptung. Wenig Menge bedeutet nicht null Exposition oder aufgehobenes Gefahrmerkmal; Schutzbrille adressiert die Augen, nicht automatisch Atemwege/Haut oder Kindersicherheit. Der neue Plan widerspricht zudem den gesetzten Verwendungshinweisen. Für den gegebenen Zweck bleibt Nicht-Einsatz von R mit Wasser-Tuch begründet; nicht sprühen/nicht über Augenhöhe arbeiten und weiterhin sicher aufbewahren. Lüften wäre eine mögliche ergänzende Expositionsminderung, keine Erlaubnis für den unzulässigen Plan und keine garantierte Beseitigung aller Risiken. Ohne Expositions-/Schädigungsdaten keine numerische Risikozahl oder sichere Unbedenklichkeit behaupten.
  - Expected performance (EN): The stipulated eye/skin irritation properties are hazards. Open pouring/wringing may bring liquid onto hands or into eyes; the accessible open bowl creates another contact opportunity for the child. Do not invent an actual accident or its probability. A is justified for the specified purpose: R is not used, so its use-related exposure routes are avoided; closing/storing it securely remains necessary. B does not alter open handling or skin/eye exposure; with no spray mist in the initial plan, ventilation is not the decisive route either. C describes a conditional approach for an established need; these cards grant no real permission, no approval of a particular glove and no effectiveness for every kind of dirt. A small amount/suitable handling may limit exposure but does not remove the substance property. The judgment links purpose, persons, route and justified measures instead of a blanket dangerous/safe label.
Fresh transfer: In the given model spraying adds droplet/inhalation exposure; working above eye level increases the opportunity for liquid reaching the face/eyes. This is not an evaporation claim. A small amount does not mean zero exposure or removal of the hazard; goggles address the eyes, not automatically airways/skin or child access. The new plan also contradicts the stipulated use instructions. For this purpose non-use of R with a water-dampened cloth remains justified; avoid spraying/above-eye-level use and retain secure storage. Ventilation may be an additional exposure reduction, not permission for the prohibited plan or a guarantee that all risks disappear. Without exposure/injury data claim no numerical risk or assured harmlessness.
  - Understanding focus (DE): Gefahr und situationsabhängige Exposition im Alltag fachlich beurteilen und passende Handlungsoptionen begründen; alle Produktangaben sind fiktive Aufgabendaten.
  - Understanding focus (EN): Scientifically assess hazard and situation-dependent everyday exposure and justify suitable options; all product statements are fictional task data.
## Page 9: Grundlegende Anforderungen von Lebewesen experimentell untersuchen

- Full learning-goal ID: `07bf5fab-9379-5b3c-a6fc-b892fcfa9a49`
- Goal fingerprint: `sha256:615443e8f975b74000882c5f7b027cbc3e72742d8fe3ffb261822958a82e702d`
- Page fingerprint: `sha256:9bdcd2af1934df78558b75ee39d8f4ef324efee930d858477f0c581ece80ef9e`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann eine prüfbare Hypothese zu einer grundlegenden Anforderung von Lebewesen durch einen kontrollierten Versuch sicher, art- und naturschutzgerecht untersuchen, eigene Bedingungen und Beobachtungen dokumentieren und die Schlussfolgerung auf die geprüften Organismen und Bedingungen begrenzen.

### Visualization

/assets/goal-visualizations/chemie/07bf5fab-9379-5b3c-a6fc-b892fcfa9a49/07bf5fab-9379-5b3c-a6fc-b892fcfa9a49.png

- original digest: `sha256:5c8e3a802ae32173b879e2e0f75ce7d1c431c1950a389df30aa2b2b19bcc2ae2`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gefahrenpotenziale beurteilen und reduzieren — `ebaae4f5-cc13-5493-98b1-10e1abeb638f` (page 8)

### Direct reverse prerequisites

- Standortbezogene Lebensraumeignung mit Feld- und Wirkungsdaten beurteilen — `843484b9-1acf-54e0-a030-bc214b3b0656` (page 14)

### Prerequisites outside this book

- Umgang und Entsorgung von Chemikalien begründen — `7be6f951-a614-52dc-94d3-2ce0d33765ff` (outside this book)
- Gefahrstoffkennzeichnungen deuten — `9e656697-fc05-5aa9-9aca-871af2e89eb7` (outside this book)
- Chemische Daten nachvollziehbar dokumentieren — `9fc800d1-92d1-5ef6-81c1-33960ae034dd` (outside this book)
- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:2e775558aedccfa46c331aaf06349892f8d2401cc07ffaa6268f6e0ff9a07af1`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Ein Anforderungsversuch braucht eine prüfbare Hypothese und eine vorab festgelegte biologische Messgröße.
  - Essential understanding (EN): A requirements experiment needs a testable hypothesis and predefined biological outcome.
  - Observable performance (DE): Legt Wasserangebot, Keimkriterium≥2mm Wurzel, gleiche Charge und Messdauer fest.
  - Observable performance (EN): Defines water availability, germination criterion≥2mm root, matched seed lot and duration.
- `e2`
  - Essential understanding (DE): Feuchtigkeit und Sauerstoffverfügbarkeit dürfen nicht unbemerkt zugleich verändert werden.
  - Essential understanding (EN): Moisture and oxygen availability must not change together unnoticed.
  - Observable performance (DE): FührtA als trockenen/feuchten nicht überfluteten Vergleich aus. FührtB bei gleichem anfänglichem Volumen und dokumentierter eigener Startmasse aus; ergänzt spätere plausible Verdunstung ausschließlich mit Wasser, meldet andere Verluste und beachtet in beiden Fällen Schutz-/Schimmelregeln.
  - Observable performance (EN): PerformsA as an unflooded dry/moist comparison. PerformsB with matched initial volumes and each recorded original starting mass; replaces later plausible evaporation with water only, reports other losses and follows protection/mould rules in both cases.
- `e3`
  - Essential understanding (DE): Wiederholungen begrenzen zufällige und biologische Variation; Samen derselben Schale sind keine unabhängigen Schalen.
  - Essential understanding (EN): Replicates constrain random/biological variation; seeds in one dish are not independent dishes.
  - Observable performance (DE): Hält eigene Keimzählungen und Wiederholungen je Schale fest; inB zusätzlich Start-/Tagesmassen, Wasserzugaben und Verluste. Berechnet Keimanteile und berichtet fehlende/uneindeutige Daten statt Ergebnisse ausA zu übernehmen.
  - Observable performance (EN): Retains original germination counts/replicates by dish; inB also starting/daily masses, water additions and losses. Calculates germination fractions and reports missing/ambiguous data without importing outcomes fromA.
- `e4`
  - Essential understanding (DE): Ein Wasserbefund bestimmt kein allgemeines Optimum oder Salzverhalten.
  - Essential understanding (EN): A water finding determines neither a universal optimum nor salinity response.
  - Observable performance (DE): Prüft neue nominale Salz-Startstufen mit Wasser-Kontrolle und dokumentiertem Wasserhaushalt; begründet Wasser statt Salzlösung bei Verdunstungsausgleich, unterscheidet Lösungs-/Materialverluste und begrenzt die Aussage auf die geprüfte Art und tatsächliche Bedingungen.
  - Observable performance (EN): Tests new nominal initial salinity levels against water control with documented water accounting; justifies water rather than salt-solution evaporation replacement, distinguishes solution/material losses and limits inference to the species and actual conditions.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `independent-changed-condition`: Frisch soll Salzgehalt bei gleichem Wasserangebot geprüft werden. Entwickle unabhängig Verdünnungsstufen, Wasser-Kontrolle und Abbruchregel; übertrage nicht bloß die alte Trocken/Feucht-Erklärung. / Fresh investigation tests salinity with equal water supply. Independently devise dilution levels, water control and a stop rule instead of merely repeating the dry/moist explanation.

**Application cases**

- `bcp-organism-requirements-investigation-a`
  - Task demand (DE): Plane, führe und dokumentiere den Vergleich tatsächlich. Werte die Fremddaten als unabhängiges Lehrbeispiel aus. Erkläre, weshalb Feuchtigkeit nicht mit Sauerstoffausschluss verwechselt werden darf, und welche Aussage über alle Pflanzen unzulässig wäre. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-organism-requirements-investigation-a
  - Task demand (EN): Plan, actually conduct and document the comparison. Analyse external data as a separate teaching example. Explain why moisture must not be confused with oxygen exclusion and what generalisation to all plants would be invalid. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-organism-requirements-investigation-a
  - Expected performance (DE): Feucht51/60=85%, trocken1/60≈1,7%. Daten stützen Wasserbedarf unter diesen Bedingungen, nicht eine ideale Menge oder Eignung für jede Art. Überflutung kann Sauerstoff begrenzen; gleiche Samencharge und Zeit kontrollieren Alternativerklärungen. Einzelne trockene Keimung kann Restfeuchte/Variation sein. Eigene Rohdaten und Schutzverhalten müssen erst beobachtet werden.
  - Expected performance (EN): Moist51/60=85%, dry1/60≈1.7%. Data support a water requirement under these conditions, not an ideal amount or all-species rule. Flooding can limit oxygen; matched seed lot/time control alternatives. A dry germination may reflect residual moisture/variation. Original raw data and protective handling remain to be observed.
  - Understanding focus (DE): Frisch soll Salzgehalt bei gleichem Wasserangebot geprüft werden. Entwickle unabhängig Verdünnungsstufen, Wasser-Kontrolle und Abbruchregel; übertrage nicht bloß die alte Trocken/Feucht-Erklärung.
  - Understanding focus (EN): Fresh investigation tests salinity with equal water supply. Independently devise dilution levels, water control and a stop rule instead of merely repeating the dry/moist explanation.
- `bcp-organism-requirements-investigation-b`
  - Task demand (DE): Nach der ersten Auswertung: Formuliere eine neue Salz-Hypothese und plane unabhängig Kontrolle, Zuteilung und Auswertung. Nutze frische Samen einer Charge und je drei Schalen für Wasser beziehungsweise nominal anfängliche0,5%/1,0% NaCl bei jeweils5,0mL. Führe den freigegebenen Vergleich tatsächlich durch. Dokumentiere die eigene Startmasse jeder vollständigen Schale, tägliche Massen und Keimzählungen sowie ausschließlich mit Wasser ausgeglichene plausible Verdunstungsverluste. Begründe getrennt den Umgang mit Lösungs-/Materialverlusten und biologischen Änderungen; berichte Abweichungen und begrenze die neue Hypothese auf die tatsächlich untersuchten Bedingungen. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-organism-requirements-investigation-b
  - Task demand (EN): After case1 formulate a salinity hypothesis and independently plan controls, assignment and analysis. Use fresh seeds from one lot and three dishes each for water or nominal initial0.5%/1.0% NaCl, each initially5.0mL. Actually conduct the approved comparison. Record each complete dish’s own starting mass, daily masses/germination counts and plausible evaporative losses replaced with water only. Separately justify handling of solution/material losses and biological changes; report deviations and limit the hypothesis to conditions actually studied. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-organism-requirements-investigation-b
  - Expected performance (DE): Verdunstendes Wasser nimmt das gelöste NaCl nicht mit.5,0mL0,5%-Lösung enthalten anfangs0,025g NaCl: Nach1,0mL reiner Wasserverdunstung würde1,0mL derselben Salzlösung weitere0,005g hinzufügen und bei wieder5,0mL ungefähr0,6% statt0,5% ergeben; beim1,0%-Ansatz entsprechend1,2%. Nur Wasser führt bei tatsächlichem reinem Wasserverlust die ursprüngliche Wasserbilanz näherungsweise zurück. Bei entnommener/verschütteter Lösung gehen Wasser und Salz verloren; solche Verluste dürfen nicht wie reine Verdunstung behandelt werden. Eigene m0-Werte, Tagesmassen, Zugaben und Abweichungen müssen vorliegen. Gaswechsel/biologische Veränderungen begrenzen die Massenmethode; die Salzstufen sind nominale Startbedingungen, keine kontinuierlich nachgewiesenen konstanten Konzentrationen. Richtung und Stärke der Keimwirkung bleiben bis zu eigenen Daten offen. Trocken/Feucht-Ergebnisse liefern keinen Salzschwellenwert; fehlende Keimung beweist ohne weitere Prüfung keinen Tod.
  - Expected performance (EN): Evaporating water does not carry dissolved NaCl away. Initially5.0mL0.5% solution contains0.025g NaCl: after1.0mL pure-water evaporation,1.0mL of the same salt solution would add0.005g, giving about0.6% rather than0.5% at5.0mL again; the1.0% treatment would analogously reach1.2%. Only water approximately restores the original water balance after actual water-only loss. Sampling/spilling solution removes both salt and water and must not be treated as pure evaporation. Original m0 values, daily masses, additions and deviations must be available. Gas exchange/biological changes limit gravimetry; salinity levels are nominal starting conditions, not continuously verified constant concentrations. Direction/size of germination effects remain open until original data exist. Dry/moist results give no salinity threshold; non-germination alone does not establish death.
  - Understanding focus (DE): Prüfe die neue Salz-Hypothese mit eigenem Plan und Wasser-Kontrolle. Lege vorab eine Wasserbilanz fest: später nur Wasser für plausible Verdunstung zur eigenen Startmasse, andere Verluste gesondert behandeln. Die alte Trocken/Feucht-Erklärung liefert keine Ergebnisse dieses Falls.
  - Understanding focus (EN): Test the new salinity hypothesis with an original plan and water control. Predefine water accounting: later use water only for plausible evaporation back to each unit’s own starting mass; handle other losses separately. The old dry/moist explanation supplies no results for this case.
## Page 10: Stoffe chemisch präparieren und aufarbeiten

- Full learning-goal ID: `4d16601e-fa57-5bcb-a5b6-f308d5b8036a`
- Goal fingerprint: `sha256:1e967368391d196a7936ae762b4133b1e04e1201fb421a27bfbdf18553aa5593`
- Page fingerprint: `sha256:af350af282ad69ed72192741e5a30abee8486f24723a0cc12ecdda23a6ecdf77`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann eine chemische Präparation anhand von Reaktionsgleichung und Stoffmengen planen, sicher durchführen, aufarbeiten und dokumentieren sowie Produktmasse, Ausbeute und Reinheitsgrenzen begründet unterscheiden.

### Visualization

/assets/goal-visualizations/chemie/4d16601e-fa57-5bcb-a5b6-f308d5b8036a/4d16601e-fa57-5bcb-a5b6-f308d5b8036a.png

- original digest: `sha256:8db5bc9e6a33dce1d77219ef35af2379e19133743c9823cddef67e30912591eb`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gefahrenpotenziale beurteilen und reduzieren — `ebaae4f5-cc13-5493-98b1-10e1abeb638f` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Umgang und Entsorgung von Chemikalien begründen — `7be6f951-a614-52dc-94d3-2ce0d33765ff` (outside this book)
- Gefahrstoffkennzeichnungen deuten — `9e656697-fc05-5aa9-9aca-871af2e89eb7` (outside this book)
- Chemische Daten nachvollziehbar dokumentieren — `9fc800d1-92d1-5ef6-81c1-33960ae034dd` (outside this book)
- Einfache Reaktionsgleichungen ableiten — `11bea4c6-7b8a-47e0-8293-2eb1ce34cf66` (outside this book)
- Molare Masse bestimmen und verwenden — `8a2ad724-df5e-5986-8de9-560ba43caac2` (outside this book)
- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Präparation, Reinigung und Ausbeute – chemische Präparation — `9a6120ff-c645-513d-aa5c-8fab85df4cc0` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:e530136fd110f720cf78cab5b52f18d19ac1fba5233963085cce7f60129ae3a1`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Reaktionsgleichung und limitierendes Edukt begrenzen die theoretische Produktmasse.
  - Essential understanding (EN): Reaction equation and limiting reactant bound theoretical product mass.
  - Observable performance (DE): Bilanziert CaCl2/Na2CO3, bestimmt das limitierende Edukt und berechnet die theoretische Masse vor der Herstellung.
  - Observable performance (EN): Balances CaCl2/Na2CO3, identifies the limiting reactant and calculates theoretical mass before preparation.
- `e2`
  - Essential understanding (DE): Fällung, Waschen und Trocknen bestimmen das gewonnene Produkt und seine Verunreinigungen.
  - Essential understanding (EN): Precipitation, washing and drying determine recovered product and contaminants.
  - Observable performance (DE): Führt Herstellung und kontrollierte Aufarbeitung unter Aufsicht selbst aus und dokumentiert Einwaagen, Waschschritte, Trocknung und Produktmasse.
  - Observable performance (EN): Personally performs preparation and controlled work-up under supervision, recording quantities, washing, drying and product mass.
- `e3`
  - Essential understanding (DE): Ausbeute vergleicht trockene Produktmasse mit der Theorie; sie ist kein Reinheitsnachweis.
  - Essential understanding (EN): Yield compares dry product mass with theory; it is not proof of purity.
  - Observable performance (DE): Berechnet mit den eigenen Mengen die Ausbeute und erklärt Restfeuchte, gelöste Salze und Verluste als getrennte Grenzen.
  - Observable performance (EN): Calculates yield from original amounts and explains residual moisture, soluble salts and losses as distinct limits.
- `e4`
  - Essential understanding (DE): Eine veränderte Stoffmenge kann das limitierende Edukt wechseln.
  - Essential understanding (EN): A changed quantity can switch the limiting reactant.
  - Observable performance (DE): Plant und führt einen neuen Ansatz nach selbständiger Mengenprognose aus und prüft eine abweichende Produktmasse ohne erfundene Reinheitsannahme.
  - Observable performance (EN): Plans and executes a new batch after an independent prediction and examines differing product mass without assuming purity.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `independent-changed-condition`: FallA: ursprünglicher20,0/25,0mL-Ansatz mit verdoppelter CaCl2-Konzentration, passend4,00/2,50mmol. FallB: ausdrücklich ERSTER neuer25,0/30,0mL-Ansatz mit CaCl2 nun0,200mol/L und Carbonat weiter0,100mol/L; Stoffmengen und Limitierung unabhängig herleiten. Die Referenzansätze nicht vermischen. / CaseA: original20.0/25.0mL batch with doubled CaCl2 concentration, consistently4.00/2.50mmol. CaseB: explicitly the FIRST new25.0/30.0mL batch with CaCl2 now0.200mol/L and carbonate still0.100mol/L; independently derive amounts and limitation. Do not mix reference batches.

**Application cases**

- `bcp-chemical-preparation-a`
  - Task demand (DE): Plane und führe die Synthese und Aufarbeitung selbst aus. Begründe limitierendes Edukt und Blindprobe. Berechne theoretische Produktmasse, rohe Massenausbeute und reinheitskorrigierte Ausbeute aus den Lehrdaten. Erkläre den Nutzen des Waschens. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-chemical-preparation-a
  - Task demand (EN): Plan and personally perform synthesis/work-up. Justify limiting reagent and blank. Calculate theoretical mass, gross mass yield and purity-corrected yield from practice data. Explain washing. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-chemical-preparation-a
  - Expected performance (DE): Ca2++CO3^2−→CaCO3(s);2,00 mmol Ca2+ begrenzen gegenüber2,50 mmol Carbonat. Theoretisch0,2002 g; rohe Ausbeute89,9%; reines Produkt0,171 g, korrigiert85,4%. Waschen entfernt lösliche Begleitsalze; zu starkes Waschen/Übertragungsverluste können Menge senken. Ein weißer Niederschlag allein ist kein vollständiger Reinheitsnachweis.
  - Expected performance (EN): Ca2++CO3^2−→CaCO3(s);2.00 mmol Ca2+ limits against2.50 mmol carbonate. Theoretical0.2002 g; gross yield89.9%; pure product0.171 g, corrected85.4%. Washing removes soluble salts; excessive washing/transfer loss can reduce amount. White precipitate alone is not a complete purity test.
  - Understanding focus (DE): Neu bleibt die Carbonatmenge gleich, aber CaCl2 ist doppelt konzentriert. Entscheide selbst über den nun limitierenden Stoff und passe Produktprognose und Kontrolle an.
  - Understanding focus (EN): Fresh carbonate amount stays fixed while CaCl2 concentration doubles. Independently identify the new limiting reagent and adapt the prediction/control.
- `bcp-chemical-preparation-b`
  - Task demand (DE): Leite vor Durchführung für beide neuen Ansätze das limitierende Edukt und die theoretische Produktmasse selbst her. Präpariere sie getrennt, wasche und trockne nach den gleichen freigegebenen Bedingungen und vergleiche deine wirklichen Ausbeuten. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-chemical-preparation-b
  - Task demand (EN): Independently derive the limiting reactant and theoretical mass before both new batches. Prepare separately, wash/dry under the same approved conditions and compare actual yields. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-chemical-preparation-b
  - Expected performance (DE): Beide neuen Ansätze haben2,50mmol limitierendes Edukt und0,25025g theoretisches CaCO3; welches Edukt limitiert, wechselt. Gleiche Theorie erzwingt keine gleiche reale Ausbeute oder Reinheit. Nur tatsächlich gemessene trockene Massen zählen. Zusätzlich eindeutig bezogener Transfer: Zum eindeutig bezeichneten ersten neuen Ansatz: n(Ca2+)=0,0250L·0,200mol/L=0,00500mol=5,00mmol; n(Carbonat)=0,0300L·0,100mol/L=0,00300mol=3,00mmol. Die1:1-Fällung wird durch Carbonat begrenzt; m_theor(CaCO3)=0,00300mol·100,1g/mol=0,3003g. Gleiche Blindprobe und kontrolliertes Waschen bleiben nötig. Theoretische Masse ist keine gemessene Ausbeute oder Reinheit. Die4,00/2,50mmol des ursprünglichen FallsA sind auf diesen neuen Bezug nicht übertragbar.
  - Expected performance (EN): Both new batches have2.50mmol limiting reactant and0.25025g theoretical CaCO3; the limiting reactant switches. Equal theory does not ensure equal actual yield or purity. Only measured dry masses count. Additionally anchored transfer: For the explicitly identified first new batch: n(Ca2+)=0.0250L·0.200mol/L=0.00500mol=5.00mmol; n(carbonate)=0.0300L·0.100mol/L=0.00300mol=3.00mmol. Carbonate limits the1:1 precipitation; m_theoretical(CaCO3)=0.00300mol·100.1g/mol=0.3003g. Retain the blank and controlled washing. Theoretical mass is not measured yield or purity. Original caseA’s4.00/2.50mmol does not apply to this new reference.
  - Understanding focus (DE): Zusätzlicher Transfer nach den beiden neuen Ansätzen: Verwende ausdrücklich den ERSTEN neuen Ansatz als Bezug. Seine25,0mL CaCl2-Lösung sind nun0,200mol/L statt0,100mol/L konzentriert; die30,0mL Na2CO3-Lösung bleiben0,100mol/L. Leite unabhängig die beiden Stoffmengen, das limitierende Edukt und die theoretische CaCO3-Masse her und begründe passende Kontrollen. Es sind keine neuen gemessenen Produktmassen vorgegeben.
  - Understanding focus (EN): Additional transfer after both new batches: explicitly use the FIRST new batch as reference. Its25.0mL CaCl2 solution is now0.200mol/L rather than0.100mol/L; the30.0mL Na2CO3 solution remains0.100mol/L. Independently derive both amounts, the limiting reactant and theoretical CaCO3 mass and justify suitable controls. No new measured product masses are supplied.
## Page 11: Stoffgemische qualitativ und quantitativ analysieren

- Full learning-goal ID: `57d2c98d-30b8-5123-b823-e56a4f22b191`
- Goal fingerprint: `sha256:3c4eae5c5b7ac36c38b81285713bf9c41d6a16c34985e3ba0286c2e059c1935b`
- Page fingerprint: `sha256:748292e05d000909e6a26ca82bda9b23967279fbd9110d79d8ade794e99b29a0`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann geeignete Analyseverfahren auswählen, sicher durchführen und dokumentieren, um die Bestandteile eines Stoffgemisches und ihre Mengenanteile mit nachvollziehbarer Stoffbilanz und Aussagegrenzen zu bestimmen.

### Visualization

/assets/goal-visualizations/chemie/57d2c98d-30b8-5123-b823-e56a4f22b191/57d2c98d-30b8-5123-b823-e56a4f22b191.png

- original digest: `sha256:f5077a2472d58cdac1114c9e8787c64ddc33b80508b0c207113b2375e74d1ff5`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gefahrenpotenziale beurteilen und reduzieren — `ebaae4f5-cc13-5493-98b1-10e1abeb638f` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Umgang und Entsorgung von Chemikalien begründen — `7be6f951-a614-52dc-94d3-2ce0d33765ff` (outside this book)
- Die Aussagekraft chemischer Daten beurteilen — `4aa3a130-b517-5ac5-87b2-147fe432cadd` (outside this book)
- Gefahrstoffkennzeichnungen deuten — `9e656697-fc05-5aa9-9aca-871af2e89eb7` (outside this book)
- Chemische Daten nachvollziehbar dokumentieren — `9fc800d1-92d1-5ef6-81c1-33960ae034dd` (outside this book)
- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Unbekannte Proben und Gemische — `85ba42e5-7625-50b1-aaf4-bd8e233a1de6` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:f33a5fc2b1e35dc5bdaa83685e90f073e9d3ea1e9630b3722e500c3892fc1832`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Eine Stoffeigenschaft begründet einen Trennschritt; Fraktionen sind noch kein universeller Identitätsnachweis.
  - Essential understanding (EN): A material property justifies a separation step; fractions are not a universal identity test.
  - Observable performance (DE): Begründet inA den Magnet-/Löse-/Filtrationsweg für Eisen/NaCl/Sand und inB den entsprechenden Weg mit zusätzlicher Saccharose; kennzeichnet gemeinsame und tatsächlich einzeln bestimmte Fraktionen.
  - Observable performance (EN): Justifies magnetism/dissolution/filtration for iron/NaCl/sand inA and the corresponding route with added sucrose inB; labels combined versus actually separately determined fractions.
- `e2`
  - Essential understanding (DE): Qualitative Zusammensetzung und Mengenanteil brauchen beobachtete Trennung, nicht bloße Datenlektüre.
  - Essential understanding (EN): Qualitative composition and mass fractions need observed separation rather than data reading.
  - Observable performance (DE): Führt die Trennung unter Aufsicht selbst aus, trocknet nach freigegebener Methode, tariert und bewahrt eigene Einwaagen und Rückgewinnungsmassen.
  - Observable performance (EN): Personally separates under supervision, dries by an approved method, tares and retains original input and recovered masses.
- `e3`
  - Essential understanding (DE): Rückgewinnungsbilanz und Zusammensetzung sind verschiedene Aussagen; fehlende Masse ist keine neue Stofffraktion.
  - Essential understanding (EN): Recovery balance and composition are different claims; missing mass is not a new constituent.
  - Observable performance (DE): Bilanziert jede Probe aus ihrer eigenen Einwaage und ihren tatsächlich bestimmten Fraktionen. Nur LehrfallA:24% Eisen,30% Sand,44% Salz,98% Rückgewinnung,2% unzugeordnet. Frischer FallB: keine festen Ergebniszahlen; lösliche NaCl-/Saccharosefraktion ohne selektive Bestimmung nicht aufteilen.
  - Observable performance (EN): Balances each sample against its own input and actually determined fractions. Teaching caseA only:24% iron,30% sand,44% salt,98% recovery,2% unassigned. Fresh caseB: no fixed results; do not divide soluble NaCl/sucrose without selective determination.
- `e4`
  - Essential understanding (DE): Eine geänderte Löslichkeit kann den bisherigen analytischen Schluss mehrdeutig machen.
  - Essential understanding (EN): Changed solubility can make the prior analytical conclusion ambiguous.
  - Observable performance (DE): Entwirft und prüft für einen zusätzlichen löslichen Stoff eine unterscheidende Kontrolle statt den gesamten gelösten Rückstand als NaCl zu etikettieren.
  - Observable performance (EN): Designs and tests a discriminating control for an added soluble material instead of labelling all dissolved residue NaCl.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `independent-changed-condition`: Zusätzlicher löslicher Nicht-Elektrolyt und fehlende quantitative Selektivität. / Added soluble non-electrolyte and missing quantitative selectivity.

**Application cases**

- `bcp-mixture-composition-a`
  - Task demand (DE): Plane und führe die vollständige Trennung einer frisch codierten Eisen/NaCl/Sand-Probe selbst aus; dokumentiere Einwaage, sichere Handgriffe, trockene Fraktionen und Materialbilanz. Werte die getrennt markierten Lehrdaten aus. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-mixture-composition-a
  - Task demand (EN): Plan and personally separate a fresh coded iron/NaCl/sand sample; record input mass, safe actions, dry fractions and material balance. Separately analyse the labelled practice data. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-mixture-composition-a
  - Expected performance (DE): Die Lehrdaten ergeben bei5,00g Ausgangsprobe: Eisen1,20g→24%, Sand1,50g→30%, Salz2,20g→44%; zusammen4,90g beziehungsweise98% Rückgewinnung. Die fehlenden0,10g beziehungsweise2% bleiben unzugeordnet; sie beweisen weder einen vierten Stoff noch die Reinheit einer Fraktion. Eigene praktische Resultate werden erst erhoben.
  - Expected performance (EN): For the5.00g teaching sample: iron1.20g→24%, sand1.50g→30%, salt2.20g→44%; total4.90g or98% recovery. Missing0.10g or2% remains unassigned and establishes neither a fourth material nor fraction purity. Original practical results remain to be collected.
  - Understanding focus (DE): Neu enthält die Probe ein zweites wasserlösliches Salz. Entwickle eigenständig die Zusatzprüfung, die nötig wäre, bevor der ganze lösliche Rückstand NaCl heißen darf.
  - Understanding focus (EN): A fresh sample contains a second soluble salt. Independently devise the additional test needed before calling the whole soluble residue NaCl.
- `bcp-mixture-composition-b`
  - Task demand (DE): Erst nach dem ersten Ergebnis aufdecken: Eine neue10,00-g-Probe enthält Eisen, Sand, NaCl und Saccharose. Plane ohne Mustertrennweg eine zusätzliche Unterscheidung der gelösten Stoffe. Führe die von der Aufsicht freigegebenen Schritte an einem neuen Ansatz aus und bilanziere nur die tatsächlich getrennt bestimmten Fraktionen. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-mixture-composition-b
  - Task demand (EN): Reveal after the first result: a new10.00-g sample contains iron, sand, NaCl and sucrose. Independently plan an additional distinction between the dissolved substances. Carry out the supervisor-approved steps on a new batch and balance only fractions actually separately determined. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-mixture-composition-b
  - Expected performance (DE): Magnet/Filtration unterscheiden Eisen und Sand; das eingedampfte Filtrat enthält beide löslichen Stoffe. Ein qualitativer Leitfähigkeitsbefund kann Elektrolyt anzeigen, liefert ohne matrixgerechte Kalibrierung aber keine einzelnen Massenanteile. Eine ehrliche gemeinsame lösliche Fraktion mit offener Einzelzuordnung ist besser begründet als erfundene vier exakte Anteile. Die versuchte Methode und deren Grenze müssen praktisch dokumentiert werden.
  - Expected performance (EN): Magnetism/filtration distinguish iron and sand; evaporated filtrate contains both solutes. Qualitative conductivity can indicate an electrolyte but does not give individual mass fractions without matrix-appropriate calibration. An honestly combined soluble fraction with unresolved individual allocation is justified; four invented exact fractions are not. Actual method and limits must be recorded.
  - Understanding focus (DE): Dieser frische Fall ergänzt Saccharose als weiteren löslichen Nicht-Elektrolyten. Begründe und prüfe unabhängig, welche selektive Information nötig ist, bevor die gemeinsame lösliche Masse in einzelne NaCl- und Saccharoseanteile aufgeteilt werden darf.
  - Understanding focus (EN): This fresh case adds sucrose as another soluble non-electrolyte. Independently justify and test the selective information needed before dividing combined soluble mass into NaCl and sucrose shares.
## Page 12: Arznei- und Koerperpflegemittel herstellen und chemisch erklaeren

- Full learning-goal ID: `7b443158-8ca9-5b8e-8328-a8fa56f6e26f`
- Goal fingerprint: `sha256:bab5318012c3bb12a9d78ca70b2e17eb656e51b53730c4163f7fea61a7ca04f8`
- Page fingerprint: `sha256:9726e30c32b6f0280ab302bc217ff44ea97ec772ac5561f48830111edbfb8f56`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann ausgewaehlte Arznei- oder Koerperpflegemittel herstellen und die chemischen Grundlagen der Herstellung fachlich erklaeren.

### Visualization

/assets/goal-visualizations/chemie/7b443158-8ca9-5b8e-8328-a8fa56f6e26f/7b443158-8ca9-5b8e-8328-a8fa56f6e26f.jpg

- original digest: `sha256:4b3ab73608f70cf2c3a93994efe81ad61c3758895d3e7d72290c7066f539f73d`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gefahrenpotenziale beurteilen und reduzieren — `ebaae4f5-cc13-5493-98b1-10e1abeb638f` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Umgang und Entsorgung von Chemikalien begründen — `7be6f951-a614-52dc-94d3-2ce0d33765ff` (outside this book)
- Gefahrstoffkennzeichnungen deuten — `9e656697-fc05-5aa9-9aca-871af2e89eb7` (outside this book)
- Chemische Daten nachvollziehbar dokumentieren — `9fc800d1-92d1-5ef6-81c1-33960ae034dd` (outside this book)
- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Materialsysteme und Alltagsprodukte — `ae171e50-f552-5f8f-b618-77a667f3b5f1` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6bab917121ff3c53347231f9d0922a219b069032565fa732c69d1b76cc719923`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Die Rezeptur bestimmt Phasen, Konsistenz und sichere Herstellung eines Modellpflegeprodukts.
  - Essential understanding (EN): Recipe determines phases, consistency and safe production of a model care product.
  - Observable performance (DE): Rezeptur und emulsionsbezogene Kontrollprobe passend planen. Zusammensetzung und sichere Temperaturführung begründet planen.
  - Observable performance (EN): Plan recipe and an appropriate emulsion control. Justifiably plan composition and safe temperature control.
- `e2`
  - Essential understanding (DE): Herstellen ist eine tatsächliche praktische Leistung mit kontrollierten Stoff- und Temperaturbedingungen.
  - Essential understanding (EN): Preparation is actual practical performance with controlled material and temperature conditions.
  - Observable performance (DE): Modellprodukt tatsächlich sicher herstellen und beschriften. Wiegen, Mischen und Gießen tatsächlich unter Heißmaterialkontrolle ausführen.
  - Observable performance (EN): Actually prepare and label the model product safely. Actually weigh, mix and cast with hot-material control.
- `e3`
  - Essential understanding (DE): Grenzflächen, Mischen und Phasenänderungen erklären die Zubereitung ohne erfundene Synthese.
  - Essential understanding (EN): Interfaces, mixing and phase changes explain preparation without an invented synthesis.
  - Observable performance (DE): Grenzflächenwirkung des Emulgators von bloßem Rühren fachlich unterscheiden. Stoffmischung/Phasenänderung von einer unbelegten Reaktionsbehauptung unterscheiden.
  - Observable performance (EN): Distinguish emulsifier interfacial action from stirring alone. Distinguish mixture/phase changes from an unsupported reaction claim.
- `e4`
  - Essential understanding (DE): Schulische Produktmerkmale beweisen weder Hautverträglichkeit noch Haltbarkeit oder Arzneiwirkung.
  - Essential understanding (EN): School product observations establish neither skin compatibility, shelf-life nor medical effects.
  - Observable performance (DE): Originalzeitreihe dokumentieren und Haltbarkeit/Verträglichkeit nicht aus Stabilität ableiten. Eigene vergleichbare Prüfdaten dokumentieren und Körperverträglichkeit offenlassen.
  - Observable performance (EN): Record an original time series and do not infer shelf-life/compatibility from stability. Record original comparable tests and leave bodily compatibility unproven.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `chemically-meaningful-change`: Frisch soll der Ölanteil verdoppelt werden, die Gesamtmasse bleibt10 g. Wähle selbst eine neue Kontrollserie und erkläre, warum dieselbe Emulgatormenge keine gleiche Stabilität garantiert. Frisch soll der Stift bei30°C gelagert werden. Wähle unabhängig die Vergleichsbedingungen und erkläre, warum Daten bei20°C seine Formstabilität bei30°C nicht sichern. / Fresh recipe doubles oil fraction while total mass remains10 g. Independently choose a control series and explain why the same emulsifier mass does not guarantee equal stability. Fresh storage is at30°C. Independently choose comparison conditions and explain why20°C data do not guarantee shape retention at30°C.

**Application cases**

- `lab15-12-a`
  - Task demand (DE): Vollständige eigene Materialien, Protokoll und Daten: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-12-a. Stelle Modellcreme und Kontrolle selbst her. Erkläre Öl/Wasser-Unmischbarkeit, Dispergieren und Wirkung amphiphiler Bestandteile an der Grenzfläche. Dokumentiere reale Phasentrennung und begrenze die Aussage zur Eignung als Körperpflegemittel.
  - Task demand (EN): Complete original materials, protocol and data: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-12-a. Personally prepare model cream and control. Explain oil/water immiscibility, dispersion and amphiphilic interfacial action. Record actual separation and limit the claim about suitability as a personal-care product.
  - Expected performance (DE): Rühren verteilt eine Phase als Tropfen, schafft aber ohne Stabilisierung keine dauerhaft homogene Lösung. Amphiphile Stoffe wechselwirken mit beiden Phasen und können Tröpfchen stabilisieren. Modellcreme ist keine neue Reinsubstanz.30-min-Stabilität ist kein Nachweis von Haltbarkeit, Hautverträglichkeit oder medizinischer Wirkung; hygienische Wasserphase kann verderben.
  - Expected performance (EN): Stirring disperses droplets but does not make a permanently homogeneous solution without stabilisation. Amphiphiles interact with both phases and can stabilise droplets. Model cream is not a new pure substance.30-min stability proves neither shelf-life, skin compatibility nor medical effects; the water phase can spoil.
  - Understanding focus (DE): Gebundenes Fallmaterial sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Frisch soll der Ölanteil verdoppelt werden, die Gesamtmasse bleibt10 g. Wähle selbst eine neue Kontrollserie und erkläre, warum dieselbe Emulgatormenge keine gleiche Stabilität garantiert.
  - Understanding focus (EN): Bound case material sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Fresh recipe doubles oil fraction while total mass remains10 g. Independently choose a control series and explain why the same emulsifier mass does not guarantee equal stability.
- `lab15-12-b`
  - Task demand (DE): Vollständige eigene Materialien, Protokoll und Daten: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-12-b. Stelle beide Modellpflegestifte tatsächlich unter Aufsicht her. Erkläre den Unterschied zwischen Schmelzen, Mischen und chemischer Reaktion. Begründe den Wachsanteil und entwirf eine vergleichbare Festigkeitsprüfung mit eigener Dokumentation.
  - Task demand (EN): Complete original materials, protocol and data: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-12-b. Actually prepare both model balms under supervision. Explain melting, mixing and chemical reaction as different processes. Justify wax fraction and devise a comparable firmness test with original documentation.
  - Expected performance (DE): Wachs bildet beim Abkühlen ein festes Gerüst, Öl verändert die Konsistenz. Es liegt zunächst eine physikalische Präparation ohne belegte Synthese neuer Stoffe vor. Höherer Wachsanteil kann hier geringere Eindringtiefe ergeben; Temperatur, Stempel, Zeit und Dicke kontrollieren. Gebrauchstauglichkeit/Verträglichkeit erfordern andere Nachweise; wasserfrei bedeutet nicht automatisch keimfrei.
  - Expected performance (EN): Wax forms a solid network on cooling; oil changes consistency. This is initially physical preparation, without demonstrated synthesis of new substances. Higher wax fraction may give lower indentation here; control temperature, probe, time and thickness. Usability/compatibility need other evidence; water-free does not mean sterile.
  - Understanding focus (DE): Gebundenes Fallmaterial sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Frisch soll der Stift bei30°C gelagert werden. Wähle unabhängig die Vergleichsbedingungen und erkläre, warum Daten bei20°C seine Formstabilität bei30°C nicht sichern.
  - Understanding focus (EN): Bound case material sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Fresh storage is at30°C. Independently choose comparison conditions and explain why20°C data do not guarantee shape retention at30°C.
## Page 13: Unbekannte Reinstoffproben analytisch identifizieren

- Full learning-goal ID: `7b80efe6-b77d-5ace-8886-973ba38e6f9e`
- Goal fingerprint: `sha256:2dea20b1836ac3a51edc6b157de6d094c39cef1a8ff457d578cec0b53307ae76`
- Page fingerprint: `sha256:39256535b08e338455033fa9a5240fbe93ce0e7dd692b4e580b527d249cb171e`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann für einen begründeten Kandidatenraum unterscheidende Analyseverfahren auswählen, sicher durchführen und dokumentieren, um eine unbekannte Reinstoffprobe anhand von Referenzen zu identifizieren und verbleibende Mehrdeutigkeit offenzulegen.

### Visualization

/assets/goal-visualizations/chemie/7b80efe6-b77d-5ace-8886-973ba38e6f9e/7b80efe6-b77d-5ace-8886-973ba38e6f9e.png

- original digest: `sha256:f5077a2472d58cdac1114c9e8787c64ddc33b80508b0c207113b2375e74d1ff5`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gefahrenpotenziale beurteilen und reduzieren — `ebaae4f5-cc13-5493-98b1-10e1abeb638f` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Umgang und Entsorgung von Chemikalien begründen — `7be6f951-a614-52dc-94d3-2ce0d33765ff` (outside this book)
- Die Aussagekraft chemischer Daten beurteilen — `4aa3a130-b517-5ac5-87b2-147fe432cadd` (outside this book)
- Gefahrstoffkennzeichnungen deuten — `9e656697-fc05-5aa9-9aca-871af2e89eb7` (outside this book)
- Chemische Daten nachvollziehbar dokumentieren — `9fc800d1-92d1-5ef6-81c1-33960ae034dd` (outside this book)
- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Unbekannte Proben und Gemische — `85ba42e5-7625-50b1-aaf4-bd8e233a1de6` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:3f3d32ad820894a33aa28f8851786042b5cfc15d687010530f93b20734f53e0a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Eine Identität gilt nur im begründeten Kandidatenraum und braucht unterscheidende Merkmale.
  - Essential understanding (EN): Identity is conditional on a justified candidate set and discriminating traits.
  - Observable performance (DE): Entwirft fallbezogen einen begründeten Entscheidungsweg: A für NaCl/Saccharose/Sand mittels Löslichkeit und Leitfähigkeit; B für NaCl/KCl mittels selektiver Na-/K-Elementbestimmung mit Referenzen.
  - Observable performance (EN): Designs a justified case-specific route: A uses solubility/conductivity for NaCl/sucrose/sand; B uses selective Na/K elemental analysis with references for NaCl/KCl.
- `e2`
  - Essential understanding (DE): Vergleichbare Referenzen benötigen passende Konzentration, Temperatur, Blindwert und unverunreinigte Probe.
  - Essential understanding (EN): Comparable references require matched concentration, temperature, blank and uncontaminated sample.
  - Observable performance (DE): Führt die jeweils vollständige eigene Proben-/Referenz-/Blindmessung aus: A0,117g/20,0mL bei20°C mit gespülter Leitfähigkeitssonde; B0,100g/20,0mL mit freigegebener Emissionsmessung, zwei unbekannten Aliquoten, Nachblank und aufbewahrten eigenen Spektren.
  - Observable performance (EN): Personally performs each complete sample/reference/blank measurement: A0.117g/20.0mL at20°C with a rinsed conductivity probe; B0.100g/20.0mL with approved emission measurement, two unknown aliquots, final blank and retained original spectra.
- `e3`
  - Essential understanding (DE): Übereinstimmung ist kein analytischer Reinheitsprozentsatz.
  - Essential understanding (EN): Agreement is not an analytical purity percentage.
  - Observable performance (DE): Ordnet nur im jeweiligen Kandidatenraum zu und begrenzt Reinheitsbehauptungen: A deutet U/V,9,95mS/cm und0,3mS/cm Streuung ausschließlich als Lehrdaten; B vergleicht eigene Na-/K-Liniensignaturen samt Blanks und kennzeichnet Mehrdeutigkeit oder Verschleppung ohne übertragene Leitfähigkeitszahlen.
  - Observable performance (EN): Assigns only within each candidate set and limits purity claims: A interprets U/V,9.95mS/cm and0.3mS/cm spread only as teaching data; B compares original Na/K line signatures with blanks, marking ambiguity/carryover without imported conductivity results.
- `e4`
  - Essential understanding (DE): Ein zusätzlicher Elektrolyt verlangt eine unabhängige selektive Information.
  - Essential understanding (EN): An added electrolyte requires independent selective information.
  - Observable performance (DE): Wählt und prüft mit Na-/K-Referenzen eine Elementbestimmung; identifiziert innerhalb des deklarierten NaCl/KCl-Raums und begrenzt Aussagen über Anionen oder Mischungen.
  - Observable performance (EN): Selects and tests elemental analysis against Na/K references; identifies within the declared NaCl/KCl set and limits claims about anions or mixtures.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `independent-changed-condition`: Erweiterter Kandidatenraum erzwingt eine neue selektive Methode; Konzentrationsanpassung und Kontaminationskontrollen bleiben nötig. / An expanded candidate set requires a new selective method; concentration matching and contamination controls remain necessary.

**Application cases**

- `bcp-unknown-pure-substance-identity-a`
  - Task demand (DE): Führe den selbst begründeten Löslichkeits-/Leitfähigkeitsweg mit einer frisch codierten Reinstoffprobe tatsächlich aus; prüfe Blindwert und Referenzen bei20°C und0,117g/20,0mL Gesamtvolumen. Dokumentiere Rohdaten und entscheide einschließlich Mehrdeutigkeiten. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-unknown-pure-substance-identity-a
  - Task demand (EN): Personally execute your justified solubility/conductivity route on a fresh coded pure sample; check blank/references at20°C and0.117g/20.0mL total volume. Record raw data and decide including ambiguity. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-unknown-pure-substance-identity-a
  - Expected performance (DE): U passt im Kandidatenraum zu NaCl, V zu Sand. Saccharose und NaCl sehen gelöst beide klar aus; Leitfähigkeit unterscheidet sie hier. U-Mittel9,95 mS/cm; Streuung0,3 mS/cm ist keine vollständig bestimmte Geräteunsicherheit. Andere ionische Stoffe könnten außerhalb des Kandidatenraums gleich reagieren. Kein analytischer Reinheitsprozentsatz ohne geeignete quantitative Kalibrierung.
  - Expected performance (EN): Within the candidate set U matches NaCl and V sand. Dissolved sucrose and NaCl both look clear; conductivity distinguishes them here. U mean9.95 mS/cm; a0.3 mS/cm spread is not a full instrument uncertainty. Other ionic materials outside the set could behave similarly. No purity percentage without suitable quantitative calibration.
  - Understanding focus (DE): Im frischen Kandidatensatz kommt KCl hinzu, das ebenfalls gut leitet. Wähle selbst eine zusätzliche Referenzmethode; die bisherige Zuordnung darf ohne sie nur „löslicher Elektrolyt“ lauten.
  - Understanding focus (EN): Fresh candidates include KCl, also a good conductor. Independently choose an additional reference method; without it the present assignment is only “soluble electrolyte”.
- `bcp-unknown-pure-substance-identity-b`
  - Task demand (DE): Erst nach der ersten Antwort: Der neue ausdrücklich reine unbekannte Stoff ist entweder NaCl oder KCl; beide sind löslich und leitfähig. Begründe eine selektive Ergänzung, bereite eigene frische Aliquote und Blind-/Referenzproben vor und miss sie am freigegebenen geschlossenen Element-Emissionsmessplatz nach Geräteeinweisung. Zeichne die eigenen Spektren mit Wellenlängenskala auf, entscheide und prüfe Verschleppung durch eine nachfolgende Blindprobe. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-unknown-pure-substance-identity-b
  - Task demand (EN): After case1: a new explicitly pure unknown is NaCl or KCl; both dissolve and conduct. Justify a selective additional method, prepare fresh original aliquots and blank/reference samples and measure at an approved enclosed elemental-emission station after device instruction. Retain original wavelength-labelled spectra, decide and check carryover with a subsequent blank. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-three-material-and-preparation-path-corrections-author-20261015-v1/materials/eight-whole-cases.four-goals.unreviewed-author-successor.json #bcp-unknown-pure-substance-identity-b
  - Expected performance (DE): Na- und K-Referenzen liefern unterscheidende Liniensignaturen; die Auswahl erfolgt gegen gemessene Referenzen, nicht allein nach sichtbarer Flammenfarbe. NIST-Orientierung: Na um589,0/589,6nm; K um766,5/769,9nm. Gemischte Signaturen oder kontaminierte Blanks lassen die reine Kandidatenzuordnung offen. Elementnachweis identifiziert im erklärten NaCl/KCl-Raum, weist aber Chlorid oder analytische Reinheit nicht unabhängig nach. Keine Messwerte werden erfunden.
  - Expected performance (EN): Measured Na and K references provide discriminating line signatures; decide against references rather than visible flame colour alone. NIST orientation: Na near589.0/589.6nm; K near766.5/769.9nm. Mixed signatures or contaminated blanks leave pure-candidate identity unresolved. Elemental evidence identifies within the declared NaCl/KCl set but does not independently establish chloride or analytical purity. No results are invented.
  - Understanding focus (DE): Im frischen Kandidatensatz kommt KCl hinzu, das ebenfalls gut leitet. Wähle selbst eine zusätzliche Referenzmethode; die bisherige Zuordnung darf ohne sie nur „löslicher Elektrolyt“ lauten.
  - Understanding focus (EN): Fresh candidates include KCl, also a good conductor. Independently choose an additional reference method; without it the present assignment is only “soluble electrolyte”.
## Page 14: Standortbezogene Lebensraumeignung mit Feld- und Wirkungsdaten beurteilen

- Full learning-goal ID: `843484b9-1acf-54e0-a030-bc214b3b0656`
- Goal fingerprint: `sha256:828836c1efd00dc9e838b483d96063d55745c4d64760c9ca4a985aacdf1e84e5`
- Page fingerprint: `sha256:76fdd207e45c646d7709e506c3e7ffdadc8e30b2fa754cd7c37ce909ad609ae2`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann eine sichere, art- und naturschutzgerechte ökologische Laboruntersuchung oder manipulative Freilanduntersuchung zur Wirkung eines Umweltfaktors tatsächlich durchführen und deren eigene Wirkungsdaten mit dokumentierten Freilandbedingungen verknüpfen, um eine art-, lebensstadien- und messgrößenbezogene Beurteilung eines Lebensraums mit Unsicherheit, Übertragungsgrenzen und gegebenenfalls offener Entscheidung zu begründen.

### Visualization

/assets/goal-visualizations/chemie/843484b9-1acf-54e0-a030-bc214b3b0656/843484b9-1acf-54e0-a030-bc214b3b0656.png

- original digest: `sha256:2adbd3d3511f215ddbc846674e412a2255829d08da108d9fb69c49842f3c14c5`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gefahrenpotenziale beurteilen und reduzieren — `ebaae4f5-cc13-5493-98b1-10e1abeb638f` (page 8)
- Grundlegende Anforderungen von Lebewesen experimentell untersuchen — `07bf5fab-9379-5b3c-a6fc-b892fcfa9a49` (page 9)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Umgang und Entsorgung von Chemikalien begründen — `7be6f951-a614-52dc-94d3-2ce0d33765ff` (outside this book)
- Gefahrstoffkennzeichnungen deuten — `9e656697-fc05-5aa9-9aca-871af2e89eb7` (outside this book)
- Chemische Daten nachvollziehbar dokumentieren — `9fc800d1-92d1-5ef6-81c1-33960ae034dd` (outside this book)
- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Freiland und Lebensraumeignung — `57537252-0dc6-507a-be9f-8553f567785e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:b522063f76dfbeb732e0d633626e874f91b9568abfe8a511b2f8659bdde4979e`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Lebensraumeignung ist eine begründete Verbindung zwischen art-/lebensstadienbezogener Wirkungsprüfung und tatsächlichen Standortbedingungen.
  - Essential understanding (EN): Habitat suitability is an evidenced connection between species/life-stage-specific effect testing and actual site conditions.
  - Observable performance (DE): Formuliert eine art-/lebensstadien-/messgrößenbezogene Standortfrage und trennt tatsächliche Feldbelege, Lehrdaten und kontrollierte Wirkungsdaten nach Herkunft, Einheit und Zeit.
  - Observable performance (EN): Formulates a species/life-stage/outcome-specific site question and separates actual field evidence,teaching data and controlled effect data by provenance,unit and time.
- `e2`
  - Essential understanding (DE): Die Quelle verlangt tatsächliche ökologische Labor-/manipulative Arbeit; ein früher gemeisterter Grundversuch allein belegt kein neues Standorturteil.
  - Essential understanding (EN): The source requires actual ecological laboratory/manipulative work;an earlier mastered basic experiment alone does not establish a new site judgement.
  - Observable performance (DE): Führt die freigegebene frische ökologische Wirkungsprüfung tatsächlich sicher durch und bewahrt eigene Gefäß-Rohdaten, Bedingungen, Kontrollen und Abweichungen; bloßes Wiederholen eines früheren Keimversuchs zählt nicht als neues Eignungsurteil.
  - Observable performance (EN): Actually conducts the approved fresh ecological effect test safely and retains original vessel data,conditions,controls and deviations;merely repeating an earlier germination experiment does not count as a new suitability judgement.
- `e3`
  - Essential understanding (DE): Vergleichbarkeit, Messgröße, Zeitspanne, Streuung und Mitfaktoren begrenzen die Übertragung zwischen Labor und Freiland.
  - Essential understanding (EN): Comparability,outcome,time span,variation and covariates bound transfer between laboratory and field.
  - Observable performance (DE): Erstellt eine gemeinsame Evidenztabelle: Feldmuster, kontrollierter Effekt, Streuung/Unsicherheit, Vergleichbarkeit und offene Mitfaktoren. Rechnet einen relativen Index nicht in Wassergehalt um und verwechselt Deckung nicht mit Wachstum.
  - Observable performance (EN): Builds a joint evidence table:field pattern,controlled effect,variation/uncertainty,comparability and unresolved covariates. Does not convert a relative index into water content or confuse cover with growth.
- `e4`
  - Essential understanding (DE): Ein Eignungsurteil kann bedingt oder noch nicht entscheidbar sein; eine begründete nächste Messung ist besser als ein unbelegtes Rangurteil.
  - Essential understanding (EN): A suitability judgement can be conditional or unresolved;a justified next measurement is preferable to an unsupported ranking.
  - Observable performance (DE): Begründet je Standort eine bedingte Eignungsaussage oder Nichtentscheidbarkeit mit konkreten Belegen und Grenzen; überträgt das Argument unabhängig auf neue Standortbedingungen und nennt einen begründeten nächsten Beobachtungs-/Prüfschritt.
  - Observable performance (EN): Justifies conditional suitability or non-decidability for each site using specific evidence and limits;independently transfers the argument to changed site conditions and specifies a justified next observation/test.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `fresh-site-inference`: Neue Standortbedingungen, Lebensstadien und Feld-/Labormessgrößen; Vergleichbarkeit und offene Faktoren eigenständig prüfen, ohne Keimung, Deckung und Sprossvermehrung gleichzusetzen. / Changed site conditions,life stages and field/laboratory outcomes;independently assess comparability and unresolved factors without equating germination,cover and frond multiplication.

**Application cases**

- `bcp-controlled-environment-habitat-investigation-a`
  - Task demand (DE): Formuliere vorab eine standortbezogene Frage ausschließlich zur Keimung von Kresse, keine Aussage über alle Rasenpflanzen. Dokumentiere sichere eigene Standortbeobachtungen oder kennzeichne bereitgestellte Feldbelege eindeutig nach Ort/Zeit/Methode und Unsicherheit. Führe den freigegebenen frischen kontrollierten Kressevergleich tatsächlich aus und protokolliere eigene Schalen-Rohdaten. Erstelle danach eine Evidenztabelle mit getrennten Spalten für Feldbeobachtung, kontrollierte Wirkungsprüfung, Vergleichbarkeit und offene Faktoren. Begründe daraus für die zwei Standorte jeweils ein bedingtes Eignungsurteil oder ausdrücklich eine noch nicht entscheidbare Aussage. Nenne konkret die fehlende Verbindung zwischen Feuchteindex und Labormilieu und die weitere Beobachtung, die eine Standortentscheidung tragen könnte. Das Wiederholen eines Keimversuchs oder seiner Keimanteile allein erfüllt dieses Ziel nicht. Unabhängiger Transfer: Neu liegt ein dritter erlaubter Standort im gleichen Feuchteindexbereich, hat aber eine deutlich andere Temperaturspanne. Erarbeite unabhängig eine neue Evidenztabelle und eine begrenzte Eignungsaussage für dieselbe Keimphase: Welche alten Belege sind verwendbar, welche Vergleichbarkeit fehlt und welche zusätzliche sichere Beobachtung oder kontrollierte Prüfung wäre vor einer Entscheidung nötig? Ein zweiter gleicher Kresseversuch allein ist keine Antwort. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-identification-field-habitat-transfer-corrections-author-20261015-v1/materials/five-whole-cases.unreviewed-author-successor.json #bcp-controlled-environment-habitat-investigation-a
  - Task demand (EN): Predefine a site question restricted to cress germination,not all lawn plants. Document original safe site observations or explicitly label supplied field evidence by location,time,method and uncertainty. Actually conduct the approved fresh controlled cress comparison and record original dish-level data. Then create an evidence table with separate columns for field observation,controlled effect testing,comparability and unresolved factors. Use it to justify a conditional suitability judgement or an explicitly unresolved conclusion for each site. State the missing link between moisture index and laboratory conditions and the further observation that could support a site decision. Repeating a germination experiment or its germination fractions alone does not meet this goal. Independent transfer: A fresh permitted third site lies in the same moisture-index range but has a clearly different temperature range. Independently build a new evidence table and bounded suitability statement for the same germination stage: which existing evidence is usable,which comparability is missing,and what additional safe observation or controlled test is needed before deciding? Another identical cress experiment alone is not an answer. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-identification-field-habitat-transfer-corrections-author-20261015-v1/materials/five-whole-cases.unreviewed-author-successor.json #bcp-controlled-environment-habitat-investigation-a
  - Expected performance (DE): Sonnig/schattig unterscheiden sich in den Lehrdaten gemeinsam in Vegetation und Feuchteindex; der Index ist weder Prozent Wasser noch eine Wassermenge für Kresse. Die Rasenverteilung ist kein Kressekeimungsbefund. Ein selbst durchgeführter kontrollierter Vergleich kann einen Feuchteeffekt auf die geprüfte Kressekeimung unter den dokumentierten Bedingungen stützen; er rangiert die beiden Rasenorte ohne begründete Vergleichbarkeit nicht. Das Berichtsergebnis kann daher lauten: Für Kressekeimung ist das getestete feuchtere oder trockenere Labormilieu je nach eigenen Daten günstiger/gleich/unklar, die konkrete Standorteignung bleibt wegen unbekannter Übertragbarkeit, wechselnder Feuchte, Temperatur, Licht oder Substrat offen. Jede Richtung muss aus eigenen Zahlen und Gefäßreplikaten folgen. Benenne eine passende zeitliche Standortmessung und eine begründete Zuordnung des tatsächlichen Keimmilieus, bevor du einen Standort bevorzugst. Kein Anspruch auf Lebenslang-Eignung, Artenreichtum oder gesamte Gemeinschaft. Gleicher relativer Feuchteindex beweist kein gleiches Keimmilieu oder gleiche Temperaturwirkung. Das frühere kontrollierte Ergebnis gilt für seine Temperatur und Bedingungen. Trage die neue Temperaturspanne und ihre Unsicherheit separat ein, entscheide gegebenenfalls noch nicht und begründe eine passende zusätzliche zeitliche Messung beziehungsweise freigegebene kontrollierte Prüfung. Übertrage keine Richtung ohne Daten.
  - Expected performance (EN): In the teaching data,sunny/shaded sites differ jointly in vegetation and moisture index; the index is neither percent water nor a cress water dose. Lawn distribution is not a cress germination result. An original controlled comparison can support a moisture effect on the tested cress germination under recorded conditions; it does not rank the two lawns without justified comparability. A valid report may state that the tested wetter or drier laboratory condition is more favourable/equal/unresolved according to original data,while actual site suitability remains unresolved because of unknown transferability,changing moisture,temperature,light or substrate. Any direction must follow from original counts and vessel replicates. Specify suitable repeated site observations and a justified match to the actual germination environment before preferring a site. Do not claim lifetime suitability,species richness or the whole community. The same relative moisture index does not establish the same germination environment or temperature effect. The old controlled result applies to its temperature and conditions. Record the new temperature range and uncertainty separately,leave the decision unresolved if necessary,and justify a suitable additional time series or approved controlled test. Do not transfer an effect direction without evidence.
  - Understanding focus (DE): Eigenständiges Ergebnis ist das belegte standortbezogene Eignungsargument aus Feld- und kontrollierten Wirkungsdaten samt Unsicherheit. Die grundlegende kontrollierte Untersuchung aus07bf ist Voraussetzung; deren Wiederholung allein schließt843 nicht. Artenbestimmung und Gemeinschaftsaufnahme werden hier nicht erneut zertifiziert. Tatsächliche ökologische Labor-/manipulative Arbeit bleibt quellentreu erforderlich.
  - Understanding focus (EN): The distinct output is an evidenced site-specific suitability argument combining field and controlled effect data with uncertainty. Basic controlled investigation from07bf is a prerequisite;repetition alone does not complete843. Identification and community surveying are not certified again here. Actual ecological laboratory/manipulative work remains required by the source.
- `bcp-controlled-environment-habitat-investigation-b`
  - Task demand (DE): Formuliere unabhängig eine Standortfrage zur Sprossvermehrung der verwendeten Wasserlinsenpopulation. Trenne Freilanddeckung und Standortfaktoren von der zu prüfenden Laborwirkung. Führe den freigegebenen kontrollierten Lichtvergleich tatsächlich mit eigenen täglichen Gefäßdaten, zufälliger Zuteilung und dokumentiertem Positionstausch aus. Führe Feldbeobachtung, kontrollierte Wirkung, Unsicherheit und Übertragungsgrenzen in einer gemeinsamen Evidenztabelle zusammen. Begründe für die zwei Uferstellen ein bedingtes populations-/zeitbezogenes Eignungsurteil oder eine offene Entscheidung und benenne die dafür fehlenden Belege. Freilanddeckung darf nicht als Sprossvermehrung ausgegeben werden; ein wiederholter Standard-Lichtversuch ohne Standortargument genügt nicht. Unabhängiger Transfer: Neu wird eine dritte erlaubte Uferstelle bei ähnlichem Momentan-Lichtwert, aber kürzerer täglicher Beleuchtung und unbekanntem Nährstoffangebot betrachtet. Begründe unabhängig anhand einer neuen Evidenztabelle, welche Aussagen über diese Population aus den alten Feld-/Labordaten tragfähig sind, welche offen bleiben und welche nächste sichere Beobachtung oder kontrollierte Prüfung eine Entscheidung verbessern würde. Erfinde weder Wachstum noch eine allgemeine Nährstoffwirkung. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-identification-field-habitat-transfer-corrections-author-20261015-v1/materials/five-whole-cases.unreviewed-author-successor.json #bcp-controlled-environment-habitat-investigation-b
  - Task demand (EN): Independently formulate a site question about frond multiplication of the duckweed population used. Separate field cover/site factors from the laboratory effect to be tested. Actually conduct the approved controlled light comparison using original daily vessel data,random assignment and recorded position rotation. Integrate field observation,controlled effect,uncertainty and transfer limits into one evidence table. Justify a conditional population/time-specific suitability judgement or an unresolved decision for each bank site,and state the missing evidence. Field cover must not be reported as frond multiplication;a repeated standard light experiment without a site argument is insufficient. Independent transfer: Consider a fresh permitted third bank site with a similar instantaneous light reading but shorter daily illumination and unknown nutrient supply. Independently use a new evidence table to justify which claims about this population the old field/laboratory data support,which remain unresolved,and which next safe observation or controlled test would improve a decision. Do not invent growth or a universal nutrient effect. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-identification-field-habitat-transfer-corrections-author-20261015-v1/materials/five-whole-cases.unreviewed-author-successor.json #bcp-controlled-environment-habitat-investigation-b
  - Expected performance (DE): Die Lehrdaten ergeben20% beziehungsweise etwa6,7% mittlere Deckung und unterscheiden sich zugleich in Licht und Temperatur. Deckung ist Bestand, kein Zuwachs. Eigene kontrollierte Lichtdaten können bei konstanten Mitfaktoren eine Lichtwirkung auf Sprossvermehrung dieser Population unter Laborbedingungen stützen. Eine momentane Feldablesung ist ohne Mess-/Zeit-/gegebenenfalls Spektralvergleich kein Beleg gleicher Exposition. Für eine Standortbeurteilung müssen Temperatur, Nährstoffangebot, Lichtverlauf, Ausgangsbesatz und weitere Einflüsse getrennt begründet werden; fehlende Daten dürfen die Entscheidung offen lassen. Mehr Licht oder mehr Deckung bedeutet nicht allgemein bessere Lebensraumeignung. Widersprüchliche oder Nullbefunde gehören in die Evidenztabelle und dürfen nicht passend gemacht werden. Gleiche Momentanablesung beweist keine gleiche tägliche Exposition; unbekannte Nährstoffe sind ein offener Faktor. Die Laborwirkung gilt für die dortige Population, Lichtdauer und Nährlösung. Trenne belegte Wirkung, begrenzte standortbezogene Vermutung und fehlende Daten; gegebenenfalls bleibt die Eignungsentscheidung offen. Eine passende weitere Messung oder kontrollierte Variation wird begründet, ohne dem Standort bereits eine Wirkung zuzuschreiben.
  - Expected performance (EN): The teaching data give mean cover20% versus about6.7% and differ in both light and temperature. Cover is standing state,not increase. Original controlled light data with matched covariates may support a light effect on frond multiplication of this population under laboratory conditions. An instantaneous field reading does not establish equivalent exposure without matched measurement/time and where relevant spectrum. Site judgement must separately address temperature,nutrients,light history,initial density and other factors; missing evidence may leave the decision unresolved. More light or cover does not universally mean better habitat suitability. Conflicting or null results belong in the evidence table and must not be forced to fit. Equal instantaneous readings do not establish equal daily exposure; unknown nutrients remain unresolved. The laboratory effect applies to its population,illumination duration and nutrient medium. Separate supported effect,bounded site hypothesis and missing evidence; leave suitability unresolved where needed. Justify an appropriate further measurement or controlled variation without already attributing an effect to the site.
  - Understanding focus (DE): Eigenständiges Ergebnis ist das belegte standortbezogene Eignungsargument aus Feld- und kontrollierten Wirkungsdaten samt Unsicherheit. Die grundlegende kontrollierte Untersuchung aus07bf ist Voraussetzung; deren Wiederholung allein schließt843 nicht. Artenbestimmung und Gemeinschaftsaufnahme werden hier nicht erneut zertifiziert. Tatsächliche ökologische Labor-/manipulative Arbeit bleibt quellentreu erforderlich.
  - Understanding focus (EN): The distinct output is an evidenced site-specific suitability argument combining field and controlled effect data with uncertainty. Basic controlled investigation from07bf is a prerequisite;repetition alone does not complete843. Identification and community surveying are not certified again here. Actual ecological laboratory/manipulative work remains required by the source.
## Page 15: Lebewesen mit Bestimmungsliteratur bestimmen

- Full learning-goal ID: `9d6e1966-b10c-5a70-b215-df7007c95b07`
- Goal fingerprint: `sha256:23543090fc0d0240cb19bdae1a5484cb421d43a598490c1bd4574bf26002a006`
- Page fingerprint: `sha256:ac3dc41cbea5e62dc761e71cd1bb097dea6d3a23ebe55192895bbaf7943761a9`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Lebewesen auch im Freiland anhand beobachteter Merkmale und geeigneter Bestimmungsliteratur bestimmen, den Bestimmungsweg dokumentieren und bei unzureichenden Merkmalen eine begründete Gruppen- oder Unsicherheitsangabe beibehalten.

### Visualization

/assets/goal-visualizations/chemie/9d6e1966-b10c-5a70-b215-df7007c95b07/9d6e1966-b10c-5a70-b215-df7007c95b07.png

- original digest: `sha256:fc20ac755ab0331a81917d3ccef106e528ff10d94ce317c7bcf6bd709cc88e2b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gefahrenpotenziale beurteilen und reduzieren — `ebaae4f5-cc13-5493-98b1-10e1abeb638f` (page 8)

### Direct reverse prerequisites

- Lebensgemeinschaften und Standortfaktoren im Freiland charakterisieren — `0f632595-5875-5a95-83d8-7de3180bdaa6` (page 16)

### Prerequisites outside this book

- Umgang und Entsorgung von Chemikalien begründen — `7be6f951-a614-52dc-94d3-2ce0d33765ff` (outside this book)
- Gefahrstoffkennzeichnungen deuten — `9e656697-fc05-5aa9-9aca-871af2e89eb7` (outside this book)
- Chemische Daten nachvollziehbar dokumentieren — `9fc800d1-92d1-5ef6-81c1-33960ae034dd` (outside this book)
- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:75ed7124796c7074f31e9f5542839c76e6d0d4cf6c06721c44f2f39b7ab26dcc`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Beobachtete Merkmale und Bestimmungsliteratur begrenzen die erreichbare taxonomische Auflösung.
  - Essential understanding (EN): Observed traits and identification literature limit taxonomic resolution.
  - Observable performance (DE): Dokumentiert Merkmale, verwendete Literaturstelle, Entscheidungen und Unsicherheit an tatsächlich beobachteten Organismen.
  - Observable performance (EN): Records traits, literature entry, identification decisions and uncertainty for organisms actually observed.
- `e2`
  - Essential understanding (DE): Ein Übungsgruppenschlüssel ist kein Ersatz für geeignete regionale Bestimmungsliteratur.
  - Essential understanding (EN): A practice grouping key does not replace suitable regional identification literature.
  - Observable performance (DE): Prüft Gras/Klee/Löwenzahngruppe beziehungsweise Wasserlinsen-/Algenverdacht gegen einen passenden regionalen Führer und belässt offene Fälle offen.
  - Observable performance (EN): Checks grass/clover/dandelion grouping or duckweed/algal suspicion against a suitable regional guide and retains unresolved cases.
- `e3`
  - Essential understanding (DE): Schonende Feldbestimmung verlangt keine Entnahme geschützter Organismen.
  - Essential understanding (EN): Careful field identification does not require collecting protected organisms.
  - Observable performance (DE): Bestimmt vor Ort vom erlaubten sicheren Weg, dokumentiert nur Organismen und hält Natur-/Artenschutz ein.
  - Observable performance (EN): Identifies in place from a permitted safe path, records only organisms and observes nature/species protection.
- `e4`
  - Essential understanding (DE): Eine frische Bestimmung erfordert selbst geprüfte neue Merkmale und einen dazu passenden eigenständigen Literatur-/Schlüsselweg.
  - Essential understanding (EN): Fresh identification requires independently verified new traits and a matching independent literature/key route.
  - Observable performance (DE): Bestimmt ein frisches tatsächliches Exemplar mit dokumentiert anderer Merkmalskombination unabhängig, nennt genaue Literatur und neuen Schlüsselweg und begrenzt den taxonomischen Befund bei fehlenden Merkmalen.
  - Observable performance (EN): Independently identifies a fresh actual specimen with a documented different trait combination,cites precise literature and a new key route,and limits the taxonomic result when traits are missing.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `fresh-traits-key-route`: Frisches reales Exemplar mit anderer Blatt-/Wedel-/Sporenmerkmalskombination; neue Literaturwahl und vollständiger Entscheidungspfad statt einer Umweltmanipulation. / Fresh real specimen with a different leaf/frond/spore trait combination;new literature choice and complete decision route instead of environmental manipulation.

**Application cases**

- `bcp-organism-identification-a`
  - Task demand (DE): Führe nur die literaturgestützte Bestimmung der tatsächlich beobachteten Rasenpflanzen aus. Bewahre Merkmalsnotizen, eigene Skizzen/Fotos ohne Personendaten, genaue Literaturstelle und den Entscheidungspfad. Benenne bei unzureichenden Merkmalen die begründete Gruppe statt eine Art zu erfinden. Unabhängiger Transfer: Bestimme unabhängig ein bisher nicht bearbeitetes Exemplar vom erlaubten Schulgelände. Die Aufsicht wählt vorab ein tatsächlich zugängliches neues Exemplar mit ungeteilten Rosettenblättern und mehreren kräftigen Längsnerven; Blüten können fehlen. Prüfe die Merkmale selbst, ergänze Blattstellung, Blattrand und Behaarung, wähle passende regionale Bestimmungsliteratur und dokumentiere einen neuen vollständigen Schlüsselweg. Der alte Kurzschlüssel Gras/Klee/Löwenzahngruppe reicht dafür nicht automatisch. Behaupte nur die durch die tatsächlich sichtbaren Merkmale gestützte Gruppe oder Art; fehlen die zugesagten Merkmale vor Ort, halte dies fest und verwende ein von der Aufsicht ausgewähltes anderes neues Exemplar mit dokumentiert anderen Merkmalen. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-identification-field-habitat-transfer-corrections-author-20261015-v1/materials/five-whole-cases.unreviewed-author-successor.json #bcp-organism-identification-a
  - Task demand (EN): Perform only literature-based identification of actually observed lawn plants. Retain trait notes, original sketches/photos without personal data, precise literature entry and decision route. State a justified group if species traits are insufficient. Independent transfer: Independently identify a previously unexamined specimen on permitted school grounds. Before assessment the supervisor selects an actually accessible new specimen with undivided rosette leaves and several strong longitudinal veins; flowers may be absent. Verify the traits yourself,add leaf arrangement,margin and hairs,choose suitable regional identification literature and record a complete new key route. The old grass/clover/dandelion grouping key is not automatically sufficient. Claim only the group or species supported by visible traits;if the promised traits are unavailable,record this and use a different new supervisor-selected specimen with documented changed traits. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-identification-field-habitat-transfer-corrections-author-20261015-v1/materials/five-whole-cases.unreviewed-author-successor.json #bcp-organism-identification-a
  - Expected performance (DE): Bestimmung ist eine begründete Merkmalszuordnung mit benannter Auflösung; drei Gruppen sind nicht automatisch drei Arten. Ein Algenverdacht bleibt ohne die nötigen mikroskopischen Merkmale unbestimmt. Bestimmungsfehler dürfen nicht durch frei erfundene Artnamen verdeckt werden. Die neue Kombination aus Rosette, ungeteilter Blattspreite und kräftigen Längsnerven muss mit selbst geprüften Merkmalen durch geeignete Literatur verfolgt werden; Längsnerven allein machen kein Gras. Jede verwendete Alternative und die genaue Literaturstelle werden notiert. Ohne zur Arttrennung nötige Merkmale bleibt eine begründete Gruppe oder ein offener Befund richtig; aus dem Autorenbrief folgt kein vorgegebener Artname. Ein neuer Versuchsplan zu Licht, Wasser oder Nährstoffen ersetzt diese Bestimmungsleistung nicht.
  - Expected performance (EN): Identification is an argued trait assignment at a stated resolution; three groups do not automatically mean three species. Algal suspicion remains uncertain without necessary microscopic traits. Do not conceal uncertainty by inventing species names. The new combination of rosette,undivided blade and strong longitudinal veins must be followed through suitable literature using independently verified traits; longitudinal veins alone do not establish a grass. Record each key decision and precise literature entry. If species-separating traits are absent,a justified group or unresolved result is appropriate; the author brief supplies no species answer. A new light,water or nutrient experiment does not replace identification.
  - Understanding focus (DE): Eigenständiges Ergebnis: Lebewesen mit Bestimmungsliteratur bestimmen. Die beiden anderen ökologischen Kinder brauchen ihre eigenen Handlungen und Ergebnisse.
  - Understanding focus (EN): Independent outcome: Identify organisms using identification literature. The other two ecological children need their own actions and outcomes.
- `bcp-organism-identification-b`
  - Task demand (DE): Führe unabhängig eine neue literaturgestützte Bestimmung am erlaubten sicheren Gewässerrand aus. Wähle passende Literatur und erkläre, ob sichtbare Merkmale für Wasserlinsengruppe, sicheren Artname oder nur unbestimmten Algenverdacht reichen. Kein Betreten des Wassers oder Wildentnahme. Unabhängiger Transfer: Bestimme unabhängig ein neues, von der Aufsicht vorab ausgewähltes und sicher vom erlaubten Uferweg erreichbares Exemplar mit anderen Merkmalen als Wasserlinsenspross oder Fadenalge: beispielsweise ein tatsächlich vorhandener Farn mit gefiederten Wedeln und an einem geeigneten Blatt sichtbaren Sporenlagern. Beobachte die Merkmale selbst ohne Entnahme oder Betreten des Wassers, wechsle bei Bedarf zu geeigneter regionaler Farn-/Pflanzenliteratur und protokolliere einen vollständigen neuen Entscheidungspfad. Ist ein solches Exemplar nicht verfügbar, wählt die Aufsicht vor Beginn ein anderes reales neues Exemplar mit dokumentierter anderer Merkmalskombination; kein Taxon oder Befund wird erfunden. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-identification-field-habitat-transfer-corrections-author-20261015-v1/materials/five-whole-cases.unreviewed-author-successor.json #bcp-organism-identification-b
  - Task demand (EN): Independently identify organisms at a permitted safe pond edge with suitable literature. Explain whether visible traits support duckweed group, a secure species name or only unconfirmed algae. Do not enter water or collect wild organisms. Independent transfer: Independently identify a new specimen selected beforehand by the supervisor and safely observable from the permitted bank path,with traits different from duckweed fronds or filamentous algae: for example an actually present fern with divided fronds and visible spore-bearing patches on a suitable leaf. Observe traits yourself without collection or entering water,switch to suitable regional fern/plant literature where needed and record a complete new decision route. If that specimen is unavailable,the supervisor selects another real new specimen with a documented changed trait combination before assessment; do not invent a taxon or observation. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-identification-field-habitat-transfer-corrections-author-20261015-v1/materials/five-whole-cases.unreviewed-author-successor.json #bcp-organism-identification-b
  - Expected performance (DE): Bestimmung ist eine begründete Merkmalszuordnung mit benannter Auflösung; drei Gruppen sind nicht automatisch drei Arten. Ein Algenverdacht bleibt ohne die nötigen mikroskopischen Merkmale unbestimmt. Bestimmungsfehler dürfen nicht durch frei erfundene Artnamen verdeckt werden. Ein beobachteter gefiederter Wedel mit tatsächlich sichtbaren Sporenlagern verlangt andere Schlüsselmerkmale und gegebenenfalls andere Literatur als der alte Wasserlinsen-/Algenvergleich. Das tatsächlich Beobachtete, die Schlüsselalternativen und die Literaturstelle tragen die Zuordnung; eine sichere Farnart folgt nicht allein aus dem Wort Farn oder einer allgemeinen Wedelskizze. Fehlende Merkmale begrenzen die taxonomische Auflösung. Licht-/Nährstoffversuche und Häufigkeitsvergleiche sind keine Ersatznachweise.
  - Expected performance (EN): Identification is an argued trait assignment at a stated resolution; three groups do not automatically mean three species. Algal suspicion remains uncertain without necessary microscopic traits. Do not conceal uncertainty by inventing species names. An observed divided frond with actually visible spore-bearing patches calls for different key traits and possibly different literature from the old duckweed/algae comparison. Actual observations,key alternatives and the literature entry support identification;a secure fern species does not follow merely from the word fern or a generic frond sketch. Missing traits limit taxonomic resolution. Light/nutrient experiments and abundance comparisons are not substitute evidence.
  - Understanding focus (DE): Eigenständiges Ergebnis: Lebewesen mit Bestimmungsliteratur bestimmen. Die beiden anderen ökologischen Kinder brauchen ihre eigenen Handlungen und Ergebnisse.
  - Understanding focus (EN): Independent outcome: Identify organisms using identification literature. The other two ecological children need their own actions and outcomes.
## Page 16: Lebensgemeinschaften und Standortfaktoren im Freiland charakterisieren

- Full learning-goal ID: `0f632595-5875-5a95-83d8-7de3180bdaa6`
- Goal fingerprint: `sha256:86ebdbaee1d6a7238d676e25e4a257adffd3b63eaf8daf2367e3f992509523e0`
- Page fingerprint: `sha256:ad9c61f8350cb43e8ae77e37f04c096f5db4c2f35a6fc49058aca89b14f595b7`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann eine hypothesengeleitete ökologische Freilanduntersuchung schonend planen und durchführen, Lebensgemeinschaften sowie abiotische Standortfaktoren qualitativ und quantitativ mit eigener Stichprobe dokumentieren und beobachtete Zusammenhänge von kausalen Aussagen unterscheiden.

### Visualization

/assets/goal-visualizations/chemie/0f632595-5875-5a95-83d8-7de3180bdaa6/0f632595-5875-5a95-83d8-7de3180bdaa6.png

- original digest: `sha256:fc20ac755ab0331a81917d3ccef106e528ff10d94ce317c7bcf6bd709cc88e2b`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gefahrenpotenziale beurteilen und reduzieren — `ebaae4f5-cc13-5493-98b1-10e1abeb638f` (page 8)
- Lebewesen mit Bestimmungsliteratur bestimmen — `9d6e1966-b10c-5a70-b215-df7007c95b07` (page 15)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Umgang und Entsorgung von Chemikalien begründen — `7be6f951-a614-52dc-94d3-2ce0d33765ff` (outside this book)
- Gefahrstoffkennzeichnungen deuten — `9e656697-fc05-5aa9-9aca-871af2e89eb7` (outside this book)
- Chemische Daten nachvollziehbar dokumentieren — `9fc800d1-92d1-5ef6-81c1-33960ae034dd` (outside this book)
- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Freiland und Lebensraumeignung — `57537252-0dc6-507a-be9f-8553f567785e` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d16df560d5355e3dbedaf9f4e287646765ab42eea42a116baa6afe397b9e11b9`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Eine Hypothese bestimmt vergleichbare Stichproben und Messgrößen.
  - Essential understanding (EN): A hypothesis determines comparable samples and outcomes.
  - Observable performance (DE): Legt vorab Zähl-/Deckungsregel, zufällige Sichtflächen, gleiche Flächengröße und zeitnahe abiotische Messung fest.
  - Observable performance (EN): Predefines count/cover criteria, randomised observation areas, matched area and contemporaneous abiotic measurements.
- `e2`
  - Essential understanding (DE): Originaldaten brauchen Ort, Fläche, Einheit, Methode und Unsicherheit.
  - Essential understanding (EN): Original data need site, area, unit, method and uncertainty.
  - Observable performance (DE): Erhebt selbst je drei sichere Stichproben pro Standort mit Licht/Feuchte/Temperatur und bewahrt Rohdaten einschließlich unbestimmter Gruppen.
  - Observable performance (EN): Personally records three safe samples per site with light/moisture/temperature and retains raw data including unknown groups.
- `e3`
  - Essential understanding (DE): Zustand, Flächendichte, relative Indizes und Artenzahl sind unterschiedliche Größen.
  - Essential understanding (EN): Standing state, density, relative indices and species richness are different quantities.
  - Observable performance (DE): Rechnet48/32Grasgruppen-Einheiten pro m² beziehungsweise20/6,7% Deckung korrekt und erklärt den Feuchteindex ohne Prozentwasserbehauptung.
  - Observable performance (EN): Correctly calculates48/32grass-group units per m² or20/6.7% cover and explains the moisture index without calling it percent water.
- `e4`
  - Essential understanding (DE): Ein Standortzusammenhang zeigt ohne Intervention keine alleinige Umweltursache.
  - Essential understanding (EN): A site association does not establish a single environmental cause without intervention.
  - Observable performance (DE): Nennt mögliche Mitursachen und führt für einen neuen erlaubten Lebensraum eine unabhängige faire Beobachtungsstichprobe mit dokumentierten Korrelationsgrenzen aus.
  - Observable performance (EN): States possible covariates and conducts an independent fair observational sample at a new permitted habitat with documented correlation limits.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `fresh-field-sample`: Unabhängige Beobachtungsstichprobe an neuer erlaubter Fläche nach Wetter-/Zeitänderung; vergleichbare Deckungs-/Standortmessung, Streuung und Korrelationsgrenzen, keine Nährstoffmanipulation. / Independent observational sample at a new permitted site after weather/time changes;comparable cover/site measurements,variation and correlation limits,no nutrient manipulation.

**Application cases**

- `bcp-community-site-field-investigation-a`
  - Task demand (DE): Plane eine eigene Hypothese zum Vergleich der beiden erlaubten Schulrasenflächen. Führe nur die schonende Freilandaufnahme mit je drei zufälligen0,25-m²-Rahmen und zugehörigen Standortmessungen tatsächlich aus. Dokumentiere die vorab festgelegte Zähleinheit und bekannte Bestimmungsgrenzen; charakterisiere die Gemeinschaft qualitativ und quantitativ. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-eleven-scope-six-boundaries-whole-author-20261015-v1/materials/twenty-complete-child-cases.raw-E0G0.author.json #bcp-community-site-field-investigation-a
  - Task demand (EN): Plan a hypothesis comparing the two permitted school lawns. Personally conduct only careful field sampling with three random0.25-m² quadrats per site and site measurements. Record the predefined counting unit and identification limits; characterise the community qualitatively and quantitatively. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-eleven-scope-six-boundaries-whole-author-20261015-v1/materials/twenty-complete-child-cases.raw-E0G0.author.json #bcp-community-site-field-investigation-a
  - Expected performance (DE): Rasen-Lehrdaten:12/0,25=48 und8/0,25=32 pro m²; klonale Pflanzen erschweren Individuenzählung. Gewässerrand-Lehrdaten:20% versus20/3≈6,7% Deckung. Dies sind Bestandsbeschreibungen mit variierenden Standortbedingungen; keine kausale Ein-Faktor-Prüfung oder Vermehrungsrate. Die eigenen Messwerte bleiben offen.
  - Expected performance (EN): Lawn practice data:12/0.25=48 and8/0.25=32 per m²; clonal plants complicate individual counts. Pond-edge practice data:20% versus20/3≈6.7% cover. These describe standing communities with covarying conditions, not a causal single-factor test or multiplication rate. Original values remain open.
  - Understanding focus (DE): Eigenständiges Ergebnis: Lebensgemeinschaften und Standortfaktoren im Freiland charakterisieren. Die beiden anderen ökologischen Kinder brauchen ihre eigenen Handlungen und Ergebnisse.
  - Understanding focus (EN): Independent outcome: Characterise communities and site factors in the field. The other two ecological children need their own actions and outcomes.
- `bcp-community-site-field-investigation-b`
  - Task demand (DE): Übertrage die Freilandmethode unabhängig auf zwei sichere Gewässerrandstellen. Lege vor der Erhebung gleiche Sichtfenster, Deckungsschätzung und Zeit-/Licht-/Temperaturbedingungen fest. Erhebe eigene Gemeinschafts- und Standortdaten; gib keine Labor-Vermehrungsrate aus Freilanddeckung aus. Unabhängiger Transfer: Übertrage die Freilandaufnahme unabhängig auf einen neu freigegebenen sicheren Uferabschnitt nach einer Wetteränderung. Lege vorab drei zufällig gewählte gleich große Sichtfenster, Deckungsregel, Beobachtungszeit und passende Licht-/Temperaturmessung fest; führe diese neue schonende Stichprobe tatsächlich durch und bewahre die Originaldaten. Vergleiche sie mit den ersten Abschnitten unter Angabe von Wetter, Jahreszeit und weiteren möglichen Mitursachen. Verändere weder Nährstoffgehalt noch den Lebensraum und leite aus dem Vergleich keine alleinige Umweltursache oder Labor-Wachstumsrate ab. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-identification-field-habitat-transfer-corrections-author-20261015-v1/materials/five-whole-cases.unreviewed-author-successor.json #bcp-community-site-field-investigation-b
  - Task demand (EN): Independently adapt field sampling to two safe pond-edge sites. Predefine matched observation windows, cover estimation and time/light/temperature conditions. Collect original community/site data; do not call field cover a laboratory multiplication rate. Independent transfer: Independently adapt field sampling to a newly permitted safe bank section after a weather change. Predefine three randomly selected matched observation windows,cover criteria,time and suitable light/temperature measurements; actually conduct this new careful sample and retain original data. Compare it with the first sections,reporting weather,season and other possible covariates. Do not alter nutrients or the habitat,and do not infer a single environmental cause or laboratory growth rate from the comparison. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-identification-field-habitat-transfer-corrections-author-20261015-v1/materials/five-whole-cases.unreviewed-author-successor.json #bcp-community-site-field-investigation-b
  - Expected performance (DE): Rasen-Lehrdaten:12/0,25=48 und8/0,25=32 pro m²; klonale Pflanzen erschweren Individuenzählung. Gewässerrand-Lehrdaten:20% versus20/3≈6,7% Deckung. Dies sind Bestandsbeschreibungen mit variierenden Standortbedingungen; keine kausale Ein-Faktor-Prüfung oder Vermehrungsrate. Die eigenen Messwerte bleiben offen. Die neue Aufnahme braucht eigene Flächen-/Deckungsdaten und zeitnahe Standortmessungen mit gleicher Methode und benannter Unsicherheit. Regen, Licht, Temperatur, Beobachtungszeit, Substrat oder Nutzung können gemeinsam variieren; der beobachtete Zusammenhang isoliert keine Ursache. Deckung ist ein Bestandsmaß, keine Sprossvermehrungsrate. Fehlende oder nicht vergleichbare Daten begründen eine offene Aussage statt einen erfundenen Effekt. Eine Nährstoffmanipulation gehört nicht zu diesem beobachtenden Transfer.
  - Expected performance (EN): Lawn practice data:12/0.25=48 and8/0.25=32 per m²; clonal plants complicate individual counts. Pond-edge practice data:20% versus20/3≈6.7% cover. These describe standing communities with covarying conditions, not a causal single-factor test or multiplication rate. Original values remain open. The new survey requires original area/cover observations and contemporaneous site measurements using matched methods with stated uncertainty. Rain,light,temperature,time,substrate or use can covary; an observed association does not isolate a cause. Cover measures standing state,not frond multiplication. Missing or non-comparable data justify an unresolved conclusion rather than an invented effect. Nutrient manipulation is outside this observational transfer.
  - Understanding focus (DE): Eigenständiges Ergebnis: Lebensgemeinschaften und Standortfaktoren im Freiland charakterisieren. Die beiden anderen ökologischen Kinder brauchen ihre eigenen Handlungen und Ergebnisse.
  - Understanding focus (EN): Independent outcome: Characterise communities and site factors in the field. The other two ecological children need their own actions and outcomes.
## Page 17: Reizantworten von Lebewesen kontrolliert untersuchen

- Full learning-goal ID: `c8198159-2109-5ad0-9d37-252ebac0219d`
- Goal fingerprint: `sha256:4a4c2031fc808b47fcb932e84c20b22e723ac8dd4380de2a5a47d8808f76d27b`
- Page fingerprint: `sha256:285bd90943667d46943510b13f5e945cfde6feb337849ff252c07d67aa023240`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann eine Hypothese zu einer beobachtbaren Reizantwort von Lebewesen mit definiertem Reiz, geeigneter Scheinbehandlung und Messregel sicher, art- und naturschutzgerecht prüfen, eigene zeitbezogene Beobachtungen dokumentieren und die Aussage über die Reizantwort von einer nicht gemessenen zellulären Ursache unterscheiden.

### Visualization

/assets/goal-visualizations/chemie/c8198159-2109-5ad0-9d37-252ebac0219d/c8198159-2109-5ad0-9d37-252ebac0219d.png

- original digest: `sha256:63f2cfee5354a94a324c892f01bdfbebac7675c3868a8a1fc4b15aa32f72107f`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gefahrenpotenziale beurteilen und reduzieren — `ebaae4f5-cc13-5493-98b1-10e1abeb638f` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Umgang und Entsorgung von Chemikalien begründen — `7be6f951-a614-52dc-94d3-2ce0d33765ff` (outside this book)
- Gefahrstoffkennzeichnungen deuten — `9e656697-fc05-5aa9-9aca-871af2e89eb7` (outside this book)
- Chemische Daten nachvollziehbar dokumentieren — `9fc800d1-92d1-5ef6-81c1-33960ae034dd` (outside this book)
- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Mikroskopie und Reizantwort — `b2bd0ed3-aaa1-504e-9633-17f84201b624` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:487c041dc2f13dbfb5890370de85bd4a3680894decd8bacda7294bbc8142b960`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Eine Reizantwort wird gegen einen definierten Scheinreiz und einen zeitlich gebundenen Ausgangszustand geprüft.
  - Essential understanding (EN): A stimulus response is tested against a defined sham and time-linked baseline.
  - Observable performance (DE): Begründet Hypothese, Kontakt/Scheinbehandlung, Pflanzenpaarung, Zufallszuteilung und ursprüngliche Messregel des ganzen Mimosa-Designs.
  - Observable performance (EN): Justifies hypothesis, touch/sham, plant matching, random assignment and the whole Mimosa design’s scoring rule.
- `e2`
  - Essential understanding (DE): Schonende Eigenhandlung und Abbruchgrenzen sind Teil des Experiments.
  - Essential understanding (EN): Careful original performance and stop rules are part of the experiment.
  - Observable performance (DE): Führt nur die im ganzen Design erlaubte sanfte Kontakt-/Scheinhandlung aus, hält Schutz- und Abbruchregeln ein und ersetzt keine ausgefallenen Pflanzen heimlich.
  - Observable performance (EN): Performs only the whole design’s permitted gentle touch/sham actions, follows protection/stop rules and does not secretly replace failed plants.
- `e3`
  - Essential understanding (DE): Pflanzen sind Replikate, Blattpaare sind abhängige Messungen innerhalb einer Pflanze.
  - Essential understanding (EN): Plants are replicates; leaflet pairs are dependent observations within a plant.
  - Observable performance (DE): Dokumentiert eigene N/C/U-Rohdaten und Zeitbezug, berichtet n=3Pflanzen pro Bedingung und wertet auch Null-/Scheinreaktionen aus.
  - Observable performance (EN): Records original N/C/U data/timecodes, reports n=3plants per condition and analyses absent/sham responses.
- `e4`
  - Essential understanding (DE): Bewegung belegt keine bestimmte zelluläre Ursache; Handhabung kann den Reizvergleich verfälschen.
  - Essential understanding (EN): Movement does not establish a cellular cause; handling can confound the stimulus comparison.
  - Observable performance (DE): Prüft unabhängig den neuen Topfbewegungsfaktor an sechs vorher nicht gereizten Pflanzen und begrenzt Schlussfolgerungen ohne Schmerz-/Lern-/Ionenkanalbehauptung.
  - Observable performance (EN): Independently tests the new pot-movement factor with six unstimulated plants and limits conclusions without pain/learning/ion-channel claims.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `independent-changed-condition`: Erst nach der Hauptauswertung aufdecken. Fiktive neue Behauptung: „Beim Umstellen des Topfs schließen sich Blätter schon vor dem Pinselkontakt; also ist direkter Blattkontakt gar nicht die einzige mögliche Ursache.“ Entwickle ohne Beispielkontrolle selbst eine prüfbare neue Hypothese und einen Vergleich, der den Beitrag der Topfbewegung von bloßer Handannäherung trennt. Nutze sechs andere, vorher nicht gereizte geöffnete Pflanzen und dieselbe Messregel; vor Durchführung muss die Aufsicht nur Sicherheit und Umsetzbarkeit bestätigen. Zulässige Bewegung höchstens10mm langsam über mindestens2s auf einer ebenen sicheren Unterlage, kein Anheben, Kippen, Ruck, Stoß oder Blattkontakt. Plane Zuteilung, Konstantbedingungen, Daten und Abbruchregel selbst, führe deinen genehmigten Vergleich tatsächlich durch und begründe, was er zur neuen Kausalerklärung aussagt. Die Hauptversuchsergebnisse sind keine Ersatzmessung für diesen neuen Faktor. / Reveal only after main analysis. New fictional claim: “When a pot is moved, leaves close before the brush touches; direct leaf contact therefore need not be the only possible cause.” Independently formulate a new testable hypothesis and a comparison separating pot movement from mere hand approach, without a model control. Use six other previously unstimulated open plants and the same scoring rule; the supervisor checks only safety and feasibility before performance. Allowed movement is at most10mm slowly over at least2s on a level secure support; no lifting, tilting, jerking, impact or leaf contact. Independently plan assignment, constants, recording and stop rule, actually carry out the approved comparison and justify what it shows about the new causal explanation. Main-investigation results are not replacement measurements for this new factor.

**Application cases**

- `bcp-organism-stimulus-response-a`
  - Task demand (DE): Formuliere vor dem Versuch eine prüfbare Hypothese zur Blattreaktion nach mechanischem Kontakt sowie eine mögliche Alternativerklärung. Begründe Paarung, zufällige Zuteilung, Scheinbehandlung und Messregel; führe beide Bedingungen tatsächlich schonend durch und erstelle das eigene unveränderte Rohprotokoll mit Zeitcodes und Abweichungen. Werte deine Pflanzenwerte einschließlich fehlender/unklarer Daten aus. Entscheide mit Belegen, ob die Ergebnisse eine Berührungsreaktion unter diesen Bedingungen stützen, ihr widersprechen oder unentscheidbar bleiben; unterscheide beobachtete Blattbewegung von einer nicht gemessenen zellulären Erklärung.  Nutze in diesem ersten Fall nur die sechs Hauptversuchspflanzen. Der neue Handhabungsfaktor wird erst im zweiten Fall aufgedeckt und mit den sechs separaten Transferpflanzen untersucht. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-eleven-scope-six-boundaries-whole-author-20261015-v1/materials/twenty-complete-child-cases.raw-E0G0.author.json #bcp-organism-stimulus-response-a
  - Task demand (EN): Before the experiment state a testable hypothesis for the leaf response after mechanical contact and one alternative explanation. Justify pairing, random assignment, sham and the scoring rule; actually carry out both conditions carefully and retain an original raw record with timecodes and deviations. Analyse plant values including missing/unclear observations. Decide with evidence whether results support a touch response under these conditions, contradict it or remain inconclusive; distinguish visible leaf movement from an unmeasured cellular explanation.  Use only the six main-comparison plants in this first case. Reveal the new handling factor only in case2 and investigate it with the six separate transfer plants. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-eleven-scope-six-boundaries-whole-author-20261015-v1/materials/twenty-complete-child-cases.raw-E0G0.author.json #bcp-organism-stimulus-response-a
  - Expected performance (DE): Eine tragfähige Hypothese sagt einen stärkeren zeitnahen Anstieg geschlossener Paare nach dem definierten Kontakt als nach der Scheinbehandlung voraus, nicht zwingend bei jeder Pflanze. Alle Ergebnisse bleiben offen, bis eigene Daten vorliegen. Vergleichbare Ausgangszustände, ausgeloste Pflanzen/Reihenfolge, konstante Bedingungen und Scheinbewegung begrenzen Erklärungen durch Hand-/Schattenbewegung, Zeit und Pflegezustand; sie eliminieren nicht jede Variation. Größere Δp-Werte der Kontaktgruppe bei brauchbaren Scheinwerten stützen eine stimulusgebundene Reaktion dieser Pflanzen; ähnliche/unklare Werte erlauben diesen Schluss nicht. Eine Sekundenskala ist mit rascher Bewegung vereinbar und belegt kein neues Wachstum, aber auch keine elektrischen Signale, bestimmten Ionenkanäle, Schmerz, Bewusstsein oder Lernen. Video allein misst keine zelluläre Ursache. Blattpaare dürfen nicht als voneinander unabhängige Replikate gezählt werden; n=3 Pflanzen pro Bedingung bleibt klein. Nullreaktion, hohe Scheinreaktion und Ausfälle müssen berichtet statt durch Wiederholen bis zum Wunschergebnis beseitigt werden.
  - Expected performance (EN): A defensible hypothesis predicts a larger prompt increase in closed pairs after the defined contact than after sham, without requiring every plant to respond. All outcomes remain open until original data exist. Comparable baseline, random assignment/order, constant conditions and sham motion limit explanations involving hand/shadow motion, time and care state without removing all variability. Larger touch Δp values with interpretable sham data support stimulus-associated responsiveness of these plants; similar/ambiguous values do not. A seconds-scale change is compatible with rapid movement rather than newly produced growth, but does not demonstrate electrical signals, particular ion channels, pain, consciousness or learning. Video does not measure a cellular cause. Leaflet pairs are not independent replicates; n=3 plants per condition is small. Absent responses, strong sham responses and missing data must be reported rather than removed by repeating until a desired result appears.
  - Understanding focus (DE): Das ganze ursprüngliche12-Pflanzen-Design bleibt erhalten: sechs Pflanzen im Hauptvergleich, sechs andere im erst anschließend aufgedeckten Transfer; keine erneute Reizung derselben Pflanzen als unabhängige Leistung.
  - Understanding focus (EN): Retain the whole original12-plant design: six plants in the main comparison and six others in the transfer revealed afterward; repeated stimulation of the same plants is not an independent performance.
- `bcp-organism-stimulus-response-b`
  - Task demand (DE): Erst nach der Hauptauswertung aufdecken. Fiktive neue Behauptung: „Beim Umstellen des Topfs schließen sich Blätter schon vor dem Pinselkontakt; also ist direkter Blattkontakt gar nicht die einzige mögliche Ursache.“ Entwickle ohne Beispielkontrolle selbst eine prüfbare neue Hypothese und einen Vergleich, der den Beitrag der Topfbewegung von bloßer Handannäherung trennt. Nutze sechs andere, vorher nicht gereizte geöffnete Pflanzen und dieselbe Messregel; vor Durchführung muss die Aufsicht nur Sicherheit und Umsetzbarkeit bestätigen. Zulässige Bewegung höchstens10mm langsam über mindestens2s auf einer ebenen sicheren Unterlage, kein Anheben, Kippen, Ruck, Stoß oder Blattkontakt. Plane Zuteilung, Konstantbedingungen, Daten und Abbruchregel selbst, führe deinen genehmigten Vergleich tatsächlich durch und begründe, was er zur neuen Kausalerklärung aussagt. Die Hauptversuchsergebnisse sind keine Ersatzmessung für diesen neuen Faktor. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-eleven-scope-six-boundaries-whole-author-20261015-v1/materials/twenty-complete-child-cases.raw-E0G0.author.json #bcp-organism-stimulus-response-b
  - Task demand (EN): Reveal only after main analysis. New fictional claim: “When a pot is moved, leaves close before the brush touches; direct leaf contact therefore need not be the only possible cause.” Independently formulate a new testable hypothesis and a comparison separating pot movement from mere hand approach, without a model control. Use six other previously unstimulated open plants and the same scoring rule; the supervisor checks only safety and feasibility before performance. Allowed movement is at most10mm slowly over at least2s on a level secure support; no lifting, tilting, jerking, impact or leaf contact. Independently plan assignment, constants, recording and stop rule, actually carry out the approved comparison and justify what it shows about the new causal explanation. Main-investigation results are not replacement measurements for this new factor. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-eleven-scope-six-boundaries-whole-author-20261015-v1/materials/twenty-complete-child-cases.raw-E0G0.author.json #bcp-organism-stimulus-response-b
  - Expected performance (DE): Zurückhalten: Ein möglicher tragfähiger Vergleich lost innerhalb dreier Größenpaare langsames Verschieben gegen gleich lange Handannäherung an den stillstehenden Topf aus; beide ohne Blattkontakt und unter gleicher Helligkeit/Temperatur, mit eigenem N/C/U-Video vor/nachher. Andere begründete gleichwertig kontrollierte Designs sind zulässig. Unterschiedliche Reaktionen können zeigen, dass unter den getesteten Bedingungen auch Handhabung als mechanischer Reiz infrage kommt; beide Bedingungen ohne Unterschied beweisen nicht, dass stärkere oder andersartige Bewegungen nie wirken. Der neue Versuch trennt nicht einzelne zelluläre Signalwege und widerlegt nicht einen zusätzlich möglichen direkten Berührungseffekt. Eine16-malige Wiederholung oder ein fallender Topf wäre keine zulässige Lösung.
  - Expected performance (EN): Withhold: One defensible comparison randomly assigns within three size pairs slow sliding versus a matched-duration hand approach to a stationary pot; both without leaf contact, under matched light/temperature and with original N/C/U videos before/after. Other equivalently controlled justified designs are acceptable. Different responses may show that handling is also a plausible mechanical stimulus under the tested conditions; no difference does not prove that stronger or different movement never works. The new investigation neither separates cellular signaling pathways nor rules out an additional direct-touch effect. Repeating16 times or dropping a pot is not an acceptable design.
  - Understanding focus (DE): Nur die sechs im ganzen Design reservierten, vorher nicht gereizten Transferpflanzen verwenden. Die sichere Bewegungsgrenze des ganzen Falles bleibt bindend; keine zusätzliche Kontaktserie.
  - Understanding focus (EN): Use only the six originally reserved and unstimulated transfer plants. Retain the whole case’s safe movement limit; no extra touch series.
## Page 18: Stoffe mit biotechnologischen Verfahren herstellen

- Full learning-goal ID: `cb7125b7-8734-51c6-8306-9163114dc0cc`
- Goal fingerprint: `sha256:f8df3986c726ceae3124081c6018b9730566c87da065d0a6da4ff81042566a35`
- Page fingerprint: `sha256:165b455d58f6199a0385b7265bf9def7eb9b85a184c9d192bb90a2199e471cab`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann einen biotechnologischen Herstellungsweg mit geeigneten biologischen Kontrollen planen, sicher durchführen, aufarbeiten und dokumentieren sowie die erhaltene Präparation und die Grenzen des Produktnachweises fachlich begründen.

### Visualization

/assets/goal-visualizations/chemie/cb7125b7-8734-51c6-8306-9163114dc0cc/cb7125b7-8734-51c6-8306-9163114dc0cc.png

- original digest: `sha256:6ac6ef94944cbdc3c606a07cadacdca0353a28ec2eee38d410624da03a756112`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gefahrenpotenziale beurteilen und reduzieren — `ebaae4f5-cc13-5493-98b1-10e1abeb638f` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Umgang und Entsorgung von Chemikalien begründen — `7be6f951-a614-52dc-94d3-2ce0d33765ff` (outside this book)
- Gefahrstoffkennzeichnungen deuten — `9e656697-fc05-5aa9-9aca-871af2e89eb7` (outside this book)
- Chemische Daten nachvollziehbar dokumentieren — `9fc800d1-92d1-5ef6-81c1-33960ae034dd` (outside this book)
- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Biotechnologie und Enzymreaktion — `44af0ce3-e16a-5f05-99ae-1087c2c82f47` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a8fff2e1305f427f378285107e69595fbc2d077b5fb7aad9a0e7f555a25d4b58`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Eine biologische Herstellung hängt von aktivem biologischem Material und geeigneten Substraten ab.
  - Essential understanding (EN): Biological production depends on active biological material and suitable substrates.
  - Observable performance (DE): Plant aktive und inaktivierte Hefe bei gleichen Mengen und30°C und begründet die biologischen Kontrollen.
  - Observable performance (EN): Plans active and inactive yeast with matched quantities at30°C and justifies biological controls.
- `e2`
  - Essential understanding (DE): Die hergestellte Präparation muss tatsächlich gewonnen und aufgearbeitet werden.
  - Essential understanding (EN): The preparation must actually be produced and worked up.
  - Observable performance (DE): Führt Ansatz, Gasbeobachtung und Filtration sicher ohne Druckaufbau aus; hält eigene Stoffmengen, Zeiten und Verluste fest.
  - Observable performance (EN): Performs batch preparation, gas observation and filtration safely without pressure build-up; retains original amounts, times and losses.
- `e3`
  - Essential understanding (DE): Gasbildung ist kein Nachweis reinen Ethanols und keine vollständige Stoffbilanz.
  - Essential understanding (EN): Gas formation does not identify pure ethanol or establish a complete balance.
  - Observable performance (DE): Erklärt die Gärungsgleichung als Modell, unterscheidet Hefezellen von gelösten Stoffen und nennt zusätzliche Produktnachweise.
  - Observable performance (EN): Explains the fermentation equation as a model, distinguishes yeast cells from solutes and states additional product tests.
- `e4`
  - Essential understanding (DE): Ein anderes Substrat kann eine Vorbehandlung benötigen; die Kontrolle muss diese von lebender Hefe trennen.
  - Essential understanding (EN): A changed substrate can require pretreatment; controls must separate this from live yeast.
  - Observable performance (DE): Prüft unabhängig Stärke und eine freigegebene Vorbehandlung gegen Stärke-ohne-Vorbehandlung und Glucosekontrolle.
  - Observable performance (EN): Independently tests starch and an approved pretreatment against starch without pretreatment and a glucose control.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `independent-changed-condition`: Frisch wird Stärke statt Glucose angeboten. Entscheide ohne Rezeptvorgabe, ob derselbe Ansatz genügt, und plane eine Vorbehandlung samt Kontrolle, statt gleiche Gasbildung vorauszusetzen. / Fresh feedstock is starch instead of glucose. Independently decide whether the same batch works and plan pretreatment plus control instead of assuming identical gas production.

**Application cases**

- `bcp-biotechnological-preparation-a`
  - Task demand (DE): Führe Planung, kontrollierte Herstellung und Aufarbeitung aus und dokumentiere Originaldaten. Erkläre die Rolle lebender Hefe und den Unterschied zwischen Präparat und Reinstoff. Prüfe die Reichweite der Lehrdaten und benenne einen zusätzlichen Stoffnachweis. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-eleven-scope-six-boundaries-whole-author-20261015-v1/materials/twenty-complete-child-cases.raw-E0G0.author.json #bcp-biotechnological-preparation-a
  - Task demand (EN): Execute planning, controlled preparation and work-up and record original data. Explain living yeast’s role and the distinction between preparation and pure substance. Assess the reach of practice data and name an additional chemical identification test. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-eleven-scope-six-boundaries-whole-author-20261015-v1/materials/twenty-complete-child-cases.raw-E0G0.author.json #bcp-biotechnological-preparation-a
  - Expected performance (DE): Aktiver Ansatz bildet mehr Gas; die Kontrolle stützt einen Zusammenhang mit aktiver Hefe. Modell der alkoholischen Gärung: C6H12O6→2C2H5OH+2CO2, aber Gasmenge allein beweist weder Gasidentität noch Ethanolreinheit; gelöstes Gas/Undichtigkeit begrenzen Mengen. Filtration trennt Hefezellen, nicht gelösten Zucker/Ethanol. Geeigneter kontrollierter CO2-Nachweis wäre ergänzend nötig.
  - Expected performance (EN): Active batch gives more gas; control supports a relationship with active yeast. Alcoholic fermentation model: C6H12O6→2C2H5OH+2CO2, but gas volume alone proves neither gas identity nor ethanol purity; dissolved gas/leaks limit quantities. Filtering removes yeast cells, not dissolved sugar/ethanol. A suitable controlled CO2 test would be additional evidence.
  - Understanding focus (DE): Frisch wird Stärke statt Glucose angeboten. Entscheide ohne Rezeptvorgabe, ob derselbe Ansatz genügt, und plane eine Vorbehandlung samt Kontrolle, statt gleiche Gasbildung vorauszusetzen.
  - Understanding focus (EN): Fresh feedstock is starch instead of glucose. Independently decide whether the same batch works and plan pretreatment plus control instead of assuming identical gas production.
- `bcp-biotechnological-preparation-b`
  - Task demand (DE): Frisch wird Stärke statt Glucose angeboten. Entscheide ohne Rezeptvorgabe, ob derselbe Ansatz genügt, und plane eine Vorbehandlung samt Kontrolle, statt gleiche Gasbildung vorauszusetzen. Führe nach Sicherheitsprüfung eigene neue Kontrollansätze tatsächlich aus, arbeite sie getrennt auf und dokumentiere Ergebnisse sowie eine gegebenenfalls nicht wirksame Vorbehandlung. Vollständiges Material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-eleven-scope-six-boundaries-whole-author-20261015-v1/materials/twenty-complete-child-cases.raw-E0G0.author.json #bcp-biotechnological-preparation-b
  - Task demand (EN): Fresh feedstock is starch instead of glucose. Independently decide whether the same batch works and plan pretreatment plus control instead of assuming identical gas production. After safety assessment actually execute original new controlled batches, work them up separately and record outcomes including any ineffective pretreatment. Complete material: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-bcp-eleven-scope-six-boundaries-whole-author-20261015-v1/materials/twenty-complete-child-cases.raw-E0G0.author.json #bcp-biotechnological-preparation-b
  - Expected performance (DE): Bäckerhefe setzt Stärke nicht automatisch wie freie Glucose um; eine geprüfte enzymatische Hydrolyse plus Stärke-ohne-Enzym- und Glucosekontrolle prüft die Vorbehandlung.
  - Expected performance (EN): Baker’s yeast does not automatically use starch like free glucose; assessed enzymatic hydrolysis plus starch-without-enzyme and glucose controls test pretreatment.
  - Understanding focus (DE): Frisch wird Stärke statt Glucose angeboten. Entscheide ohne Rezeptvorgabe, ob derselbe Ansatz genügt, und plane eine Vorbehandlung samt Kontrolle, statt gleiche Gasbildung vorauszusetzen.
  - Understanding focus (EN): Fresh feedstock is starch instead of glucose. Independently decide whether the same batch works and plan pretreatment plus control instead of assuming identical gas production.
## Page 19: Werk- und Baustoffe herstellen und Eigenschaften pruefen

- Full learning-goal ID: `dc4a26c7-8304-529d-8705-7333b2f038fc`
- Goal fingerprint: `sha256:cc6bba805832dd179a489711cfa5be15249f257eef0a931fe7650cb4f250c95d`
- Page fingerprint: `sha256:1256cec9a66e0a74f15d962434784ad9f53a21bde284bd8c34c132e50853a375`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Werk- und Baustoffe herstellen, deren Eigenschaften unter vergleichbaren Bedingungen untersuchen und daraus Einsatzmoeglichkeiten begruendet beurteilen.

### Visualization

/assets/goal-visualizations/chemie/dc4a26c7-8304-529d-8705-7333b2f038fc/dc4a26c7-8304-529d-8705-7333b2f038fc.jpg

- original digest: `sha256:257550eca54bef5af2b60983eb8366589f41af4454a070223def1b786e9e3cba`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gefahrenpotenziale beurteilen und reduzieren — `ebaae4f5-cc13-5493-98b1-10e1abeb638f` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Umgang und Entsorgung von Chemikalien begründen — `7be6f951-a614-52dc-94d3-2ce0d33765ff` (outside this book)
- Gefahrstoffkennzeichnungen deuten — `9e656697-fc05-5aa9-9aca-871af2e89eb7` (outside this book)
- Chemische Daten nachvollziehbar dokumentieren — `9fc800d1-92d1-5ef6-81c1-33960ae034dd` (outside this book)
- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Direct reverse prerequisites outside this book

- Werk- und Baustoffe zu funktionellen Systemen kombinieren — `ffebca5e-76b5-55d7-80d6-df1e7d2c75ea` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:8dbb102027fa7570ac1f688a4d5b0d001b23dbf37043531fc4bf9dc6507b503f`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Rezeptur und gleiche Geometrie/Lagerung erlauben einen begründeten Materialvergleich.
  - Essential understanding (EN): Recipe and matched geometry/storage permit a justified material comparison.
  - Observable performance (DE): Materialrezeptur und gleiche Prüfkörperbedingungen begründet planen. Weichmacheranteil als Einflussgröße bei gleicher Grundrezeptur planen.
  - Observable performance (EN): Justifiably plan recipes and equal specimen conditions. Plan plasticiser fraction as variable with equal base recipe.
- `e2`
  - Essential understanding (DE): Materialherstellung und Prüfung müssen tatsächlich sicher ausgeführt werden.
  - Essential understanding (EN): Material production and testing must actually be performed safely.
  - Observable performance (DE): Herstellung und Belastung tatsächlich staub-/bruchgeschützt ausführen. Folien tatsächlich mit beaufsichtigter Wärmeführung herstellen.
  - Observable performance (EN): Actually make/load specimens with dust/fracture protection. Actually make films with supervised heating.
- `e3`
  - Essential understanding (DE): Originaldaten benötigen passende Einheiten, Wiederholungen und getrennte Prüfkriterien.
  - Essential understanding (EN): Original data need suitable units, replicates and distinct test criteria.
  - Observable performance (DE): Eigene Wiederholungen und Mittelwerte mit1-N-Auflösung dokumentieren. Dicke, Trocknung und getrennte Biege-/Wasserprüfungen original dokumentieren.
  - Observable performance (EN): Record original repeats/means with1-N resolution. Record original thickness, drying and distinct bending/water tests.
- `e4`
  - Essential understanding (DE): Chemische/strukturelle Eigenschaften begründen nur bedingungsspezifische Anwendungen.
  - Essential understanding (EN): Chemical/structural properties justify only condition-specific applications.
  - Observable performance (DE): Abbindemodell, mögliche Poren und begrenzte Anwendungseignung verbinden. 7/4 mm und20/35% anwendungsspezifisch deuten, Zugfestigkeit nicht erfinden.
  - Observable performance (EN): Connect setting, possible pores and bounded application suitability. Interpret7/4 mm and20/35% by application without inventing tensile strength.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `chemically-meaningful-change`: Frisch soll ein Bauteil in feuchter Umgebung dienen. Wähle selbst eine Feuchteprüfung und erkläre, warum Trockenbruchlasten das neue Kriterium nicht ersetzen. Frisch wird die Dicke verdoppelt. Plane unabhängig den Vergleich, der Materialwirkung von geometrischer Verstärkung trennt, bevor du „besserer Werkstoff“ behauptest. / Fresh use is in a damp environment. Independently choose a moisture test and explain why dry failure loads cannot replace that criterion. Fresh film thickness doubles. Independently plan a comparison separating material effects from geometry before claiming a better material.

**Application cases**

- `lab15-13-a`
  - Task demand (DE): Vollständige eigene Materialien, Protokoll und Daten: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-13-a. Stelle die Prüfkörper selbst her und prüfe sie vergleichbar. Erkläre Abbindung anhand des gegebenen Modells: Halbhydrat+Wasser→Dihydrat; überschüssiges Wasser kann Poren hinterlassen. Beurteile den Einsatz als trockene Innenraumdekoration gegenüber belastetem Außenbauteil.
  - Task demand (EN): Complete original materials, protocol and data: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-13-a. Personally make and comparably test specimens. Explain setting using the supplied model: hemihydrate+water→dihydrate; excess water can leave pores. Assess use for dry indoor decoration versus a loaded outdoor component.
  - Expected performance (DE): CaSO4·0,5H2O+1,5H2O→CaSO4·2H2O. Mittelbruchlasten9/5 N sprechen hier für robustere A-Prüfkörper; Wasser/Gips-Verhältnis beeinflusst Porenbildung, aber Restfeuchte ist nicht gemessen. Gleiche Geometrie, Stützweite und Alter sind nötig. Keine Bauzulassung aus sechs Schulproben; Feuchte-/Dauerlastverhalten fehlt.
  - Expected performance (EN): CaSO4·0.5H2O+1.5H2O→CaSO4·2H2O. Mean loads9/5 N favour A specimens here; water/plaster ratio affects porosity, but residual moisture was not measured. Match geometry, span and age. Six school specimens give no structural certification; moisture/long-term loading remain unknown.
  - Understanding focus (DE): Gebundenes Fallmaterial sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Frisch soll ein Bauteil in feuchter Umgebung dienen. Wähle selbst eine Feuchteprüfung und erkläre, warum Trockenbruchlasten das neue Kriterium nicht ersetzen.
  - Understanding focus (EN): Bound case material sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Fresh use is in a damp environment. Independently choose a moisture test and explain why dry failure loads cannot replace that criterion.
- `lab15-13-b`
  - Task demand (DE): Vollständige eigene Materialien, Protokoll und Daten: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-13-b. Stelle beide Folien tatsächlich her. Erkläre nach dem Modell Glycerin als zwischen Ketten wirkenden Weichmacher, keine behauptete Neupolymerisation. Prüfe flexibel vs wasserbeständig als getrennte Kriterien und beurteile eine Innenraum-Abdeckung.
  - Task demand (EN): Complete original materials, protocol and data: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-13-b. Actually prepare both films. Explain glycerol as a between-chain plasticiser in the supplied model, without claiming new polymerisation. Test flexibility and water resistance as separate criteria and assess an indoor cover.
  - Expected performance (DE): Mehr Glycerin kann Kettenbeweglichkeit und Wasseraufnahme erhöhen. Mittelradius A7 mm/B4 mm: B lässt sich hier enger biegen. Das bedeutet keine größere Zugfestigkeit;35% Wasseraufnahme spricht gegen feuchtebelastete Nutzung. Dicke/Trocknung verfälschen Vergleich, sind daher zu kontrollieren. Keine Aussage zu industrieller Kompostierbarkeit aus diesen Daten.
  - Expected performance (EN): More glycerol can increase chain mobility and water uptake. Mean radius A7 mm/B4 mm: B bends more tightly here. This does not establish higher tensile strength;35% uptake argues against moisture exposure. Control thickness/drying because they distort comparison. These data say nothing about industrial compostability.
  - Understanding focus (DE): Gebundenes Fallmaterial sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Frisch wird die Dicke verdoppelt. Plane unabhängig den Vergleich, der Materialwirkung von geometrischer Verstärkung trennt, bevor du „besserer Werkstoff“ behauptest.
  - Understanding focus (EN): Bound case material sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Fresh film thickness doubles. Independently plan a comparison separating material effects from geometry before claiming a better material.
## Page 20: Lebensmitteltechniken biologisch und chemisch erklaeren

- Full learning-goal ID: `e6dcd3a0-264d-503b-aaac-a3e86eeb7059`
- Goal fingerprint: `sha256:abf84d20650e04173ec1448023d33bdf1ab8fd00fe3217eda09dcfae931f3d3d`
- Page fingerprint: `sha256:2a719eb9db51964e84ab02c24669859b4c8635588062cce1ad84f002b9d2467f`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann alltagsrelevante Techniken zur Zubereitung und Veredelung von Lebensmitteln praktisch einsetzen und ihre biologischen sowie chemischen Grundlagen erklaeren.

### Visualization

/assets/goal-visualizations/chemie/e6dcd3a0-264d-503b-aaac-a3e86eeb7059/e6dcd3a0-264d-503b-aaac-a3e86eeb7059.jpg

- original digest: `sha256:3fff8b29708c26e05036645800fc5a7c7ff498144ca56fbbbdba9b617c2d489c`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- Gefahrenpotenziale beurteilen und reduzieren — `ebaae4f5-cc13-5493-98b1-10e1abeb638f` (page 8)

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Umgang und Entsorgung von Chemikalien begründen — `7be6f951-a614-52dc-94d3-2ce0d33765ff` (outside this book)
- Gefahrstoffkennzeichnungen deuten — `9e656697-fc05-5aa9-9aca-871af2e89eb7` (outside this book)
- Chemische Daten nachvollziehbar dokumentieren — `9fc800d1-92d1-5ef6-81c1-33960ae034dd` (outside this book)
- Angeleitete chemische Untersuchungen sicher durchführen — `e81a4aed-9695-533e-8eb7-7a0c714346ea` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Materialsysteme und Alltagsprodukte — `ae171e50-f552-5f8f-b618-77a667f3b5f1` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:d21a9167d2ad3cdc7bf521ed586ae759b330636ab673a2dd58ddeb0371caf7fc`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Lebensmitteltechnik ist ein kontrolliertes Verfahren mit passender Hygiene und Vergleichsbedingung.
  - Essential understanding (EN): Food preparation is a controlled process with suitable hygiene and comparison conditions.
  - Observable performance (DE): Mengen, Zeit, Temperatur und inaktivierte Kontrolle sinnvoll festlegen. Definierte Starter-/Kontrollbedingungen und Hygiene vorab festlegen.
  - Observable performance (EN): Set quantities, time, temperature and inactivated control sensibly. Set defined starter/control conditions and hygiene beforehand.
- `e2`
  - Essential understanding (DE): Praktisches Einsetzen einer Technik verlangt die tatsächliche Herstellung.
  - Essential understanding (EN): Practical application requires actual preparation.
  - Observable performance (DE): Lebensmitteltechnik tatsächlich hygienisch ausführen und sicher dokumentieren. Präparation, pH-Probenahme und Entsorgung tatsächlich sicher ausführen.
  - Observable performance (EN): Actually perform the food technique hygienically and record it safely. Actually perform preparation, pH sampling and disposal safely.
- `e3`
  - Essential understanding (DE): Biologische Stoffumsetzung und chemisch-physikalische Strukturänderung erklären das Produkt gemeinsam.
  - Essential understanding (EN): Biological conversion and chemical/physical structural change jointly explain the product.
  - Observable performance (DE): Biologische Gärung mit Gasrückhalt im stofflichen Teiggerüst verbinden. Biologische Umsetzung mit Säure-/Proteinänderung fachlich verknüpfen.
  - Observable performance (EN): Link biological fermentation with gas retention in the dough material. Link biological conversion to acid/protein changes accurately.
- `e4`
  - Essential understanding (DE): Volumen, pH und Aussehen sind begrenzte Messgrößen und kein Sicherheitsnachweis.
  - Essential understanding (EN): Volume, pH and appearance are limited measures, not evidence of safety.
  - Observable performance (DE): 52,5%/1,9% korrekt deuten und Gasproduktion nicht mit Teigvolumen gleichsetzen. Originalbeobachtung und Streifenauflösung dokumentieren; Produktsicherheit nicht aus Dicke ableiten.
  - Observable performance (EN): Interpret52.5%/1.9% correctly and avoid equating gas production with dough volume. Record original observations and strip resolution; do not infer safety from thickness.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `chemically-meaningful-change`: Frisch wird glutenfreies Mehl eingesetzt, während der Hefe-Gasansatz gleich bleibt. Plane eigenständig einen Vergleich, der verringerte Gasbildung von schlechterem Gasrückhalt unterscheidet. Frisch wird eine laktosefreie Milch derselben Proteinklasse angeboten. Entwirf eigenständig einen Vergleich; leite die Starteraktivität weder allein aus dem Wort „frei“ noch aus gleichem Aussehen ab. / Fresh dough uses gluten-free flour while yeast gas production stays unchanged. Independently plan a comparison separating reduced gas production from poorer retention. Fresh material is lactose-free milk of the same protein class. Independently devise a comparison; infer starter activity neither from the word “free” nor identical appearance.

**Application cases**

- `lab15-09-a`
  - Task demand (DE): Vollständige eigene Materialien, Protokoll und Daten: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-09-a. Stelle beide Teige tatsächlich her. Erkläre biologische Gasbildung und die chemisch-physikalische Rolle des Teiggerüsts beim Aufgehen. Werte Lehrdaten relativ zum Start aus; unterscheide Gasproduktion und Gasrückhalt. Begründe einen Zusatztest.
  - Task demand (EN): Complete original materials, protocol and data: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-09-a. Actually prepare both doughs. Explain biological gas production and the chemical/physical role of the dough network in rising. Evaluate practice data relative to start; distinguish gas production from retention. Justify an additional test.
  - Expected performance (DE): Hefe verstoffwechselt Zucker; CO2 kann sich im Teiggerüst sammeln. A-Mittel122 mL entspricht52,5% Zunahme; B81,5 mL etwa1,9%. Volumenzunahme misst nicht allein gebildetes CO2, da Gas entweichen kann und Kneten die Struktur verändert. Inaktivierte Hefe ist Kontrolle, aber Erwärmen kann weitere Eigenschaften ändern. Ein separater kontrollierter Gasansatz ergänzt die Prüfung.
  - Expected performance (EN): Yeast metabolises sugar; CO2 can accumulate in the dough network. Mean A122 mL means52.5% rise; B81.5 mL about1.9%. Rise is not a direct measure of all produced CO2 because gas escapes and kneading changes structure. Inactivated yeast is a control, but heating may change other properties. A separate controlled gas test complements it.
  - Understanding focus (DE): Gebundenes Fallmaterial sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Frisch wird glutenfreies Mehl eingesetzt, während der Hefe-Gasansatz gleich bleibt. Plane eigenständig einen Vergleich, der verringerte Gasbildung von schlechterem Gasrückhalt unterscheidet.
  - Understanding focus (EN): Bound case material sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Fresh dough uses gluten-free flour while yeast gas production stays unchanged. Independently plan a comparison separating reduced gas production from poorer retention.
- `lab15-09-b`
  - Task demand (DE): Vollständige eigene Materialien, Protokoll und Daten: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-09-b. Führe die freigegebene Technik tatsächlich durch und dokumentiere die Bedingungen. Erkläre, wie bakterielle Stoffumsetzung, Säurebildung und verändertes Proteinverhalten zusammenhängen. Begründe die Kontrolle und eine Grenze der pH-Streifen.
  - Task demand (EN): Complete original materials, protocol and data: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-09-b. Actually perform the approved technique and record conditions. Explain the link between bacterial metabolism, acid formation and changed protein behaviour. Justify the control and one limitation of pH strips.
  - Expected performance (DE): Starterbakterien können Milchzucker zu Milchsäure umsetzen; sinkender pH verändert Wechselwirkungen der Milchproteine und begünstigt Gerinnung. pH4,5 ist nur streifenaufgelöst, kein genauer Säuregehalt. Dickwerden allein identifiziert weder Mikroben noch Produktsicherheit. Ohne Starter kann längere Lagerung trotzdem Veränderungen hervorrufen; die Kontrolle bleibt zeitlich begrenzt.
  - Expected performance (EN): Starter bacteria can convert milk sugar into lactic acid; lower pH changes protein interactions and favours coagulation. A pH4.5 strip reading is approximate, not exact acid concentration. Thickening alone identifies neither microbes nor product safety. A no-starter batch can still change on prolonged storage; control interpretation is time-bounded.
  - Understanding focus (DE): Gebundenes Fallmaterial sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Frisch wird eine laktosefreie Milch derselben Proteinklasse angeboten. Entwirf eigenständig einen Vergleich; leite die Starteraktivität weder allein aus dem Wort „frei“ noch aus gleichem Aussehen ab.
  - Understanding focus (EN): Bound case material sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Fresh material is lactose-free milk of the same protein class. Independently devise a comparison; infer starter activity neither from the word “free” nor identical appearance.

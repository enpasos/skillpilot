# AI review input: Chemie: endgültiger aktueller D-Kontext

- Book ID: `chemie-current450-bound-context-d-002`
- Book edition: `curricular-atomic-v1`
- Publication mode: `review`
- BookModel digest: `sha256:10b8a6eb748bfa37943d8ae8ca44e6041a8326ef37e7631064ef778c4d60efe7`
- Selected goals: 20

The PDF and this Markdown are parallel review surfaces. The normalized JSON is authoritative for exact IDs, relationships, fingerprints, and evidence-profile fields.

## Page 1: Molares Volumen von Gasen nutzen

- Full learning-goal ID: `2924f784-5261-54e8-93ee-49ac3b3cd300`
- Goal fingerprint: `sha256:64919e2a2875afd5046ed9c20b9c66c52f6c97903c4f05d4f6ce0dd2d20da6db`
- Page fingerprint: `sha256:edfb04d4d865bb8ca97275381e8c42c61f03ab0ee687e86f96465185a46c1a85`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann das molare Volumen von Gasen bei festgelegten Bedingungen beschreiben und fuer einfache Stoffmengen-Volumen-Bezuege verwenden.

### Visualization

/assets/goal-visualizations/chemie/2924f784-5261-54e8-93ee-49ac3b3cd300/2924f784-5261-54e8-93ee-49ac3b3cd300.jpg

- original digest: `sha256:2da231248a43019efccfc184b58f1414f5398f1bbc0b2496134de4577c6ff928`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Avogadro-These fuer Gasvolumina erlaeutern — `1e5a4b89-69f1-5379-811e-c8ec76faad2a` (outside this book)

### Direct reverse prerequisites outside this book

- Molares Volumen: Formel und Bedingungsbindung abrufen — `5a75246d-2dd8-5756-8404-41bff88f3416` (outside this book)
- Molare Masse von Gasen bestimmen — `199570f4-b3c3-5e12-877d-ced97e9f6968` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:a97ebe4e53879769a31ed570db26fcdef7df6cc06707de5ba674baf47bfdfedd`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `condition-specific-molar-volume`
  - Essential understanding (DE): Vm ist das Volumen pro Stoffmenge eines Gases unter festgelegten Bedingungen. Im idealen Modell gilt die proportionale Volumen-Stoffmengen-Beziehung bei diesen Bedingungen; ein anderer Vm-Wert kann bei geändertem Druck oder geänderter Temperatur gelten. In einem geschlossenen System ohne Reaktion bleibt n beim Zustandswechsel erhalten, während V sich ändern kann.
  - Essential understanding (EN): Molar volume is gas volume per amount under specified conditions. The ideal model gives a proportional volume-to-amount relation at those conditions; pressure or temperature changes can give a different molar volume. In a closed nonreacting system, amount is conserved during a change of state although volume can change.
  - Observable performance (DE): Die lernende Person deutet L/mol, bestimmt V oder n mit dem zum Zustand passenden Vm und begründet, warum ein fester Zahlenwert nicht ohne Bedingungen übertragen werden darf.
  - Observable performance (EN): The learner interprets L/mol, determines volume or amount using the molar volume for the actual state and explains why a numerical value cannot be transferred without its conditions.

**Coverage expectations**

- required expectations: `condition-specific-molar-volume`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `conversion-direction`: Stoffmenge→Volumen wird durch Volumen→Stoffmenge ersetzt. / Amount-to-volume is replaced by volume-to-amount conversion.
- `state-change`: Bei einem geschlossenen Zustandswechsel ändert sich Vm, nicht die Stoffmenge. / Molar volume changes during a closed state change while amount remains constant.

**Application cases**

- `molar-volume-reference-state`
  - Task demand (DE): Für ideale Gase gelten in den gerundeten Schulmodelldaten bei20°C und101,6kPa: Vm=24,0L/mol. Bestimme das Volumen von0,25mol N2 und die Stoffmenge in12,0L He bei denselben Bedingungen. Erkläre die Bedeutung von24,0L/mol und ob es ein universeller Wert für alle Gaszustände ist.
  - Task demand (EN): The rounded school-model data for ideal gases at20°C and101.6kPa give Vm=24.0L/mol. Determine the volume of0.25mol N2 and the amount in12.0L He under those same conditions. Explain24.0L/mol and whether it is universal across all gas states.
  - Expected performance (DE): 0,25mol N2 haben6,00L;12,0L He entsprechen0,500mol.24,0L/mol bezeichnet das Volumen je mol Gasteilchen bei den angegebenen Bedingungen. Es ist kein bedingungsloser oder stoffunabhängig real-exakter Naturwert; die Aussagen nutzen das ideale Modell und gerundete Daten.
  - Expected performance (EN): 0.25mol N2 occupies6.00L and12.0L He corresponds to0.500mol.24.0L/mol denotes volume per mol of gas particles under the stated conditions. It is not an unconditional, exactly real-gas constant; the results use the ideal model and rounded data.
  - Understanding focus (DE): Beide Umrechnungsrichtungen werden aus Volumen pro mol einschließlich Bedingungen begründet.
  - Understanding focus (EN): Both conversion directions are justified using volume per mol and its conditions.
- `closed-volume-change-fresh`
  - Task demand (DE): Frischer Fall ohne Rechenweg: Ein geschlossenes, nicht reagierendes ideales Gas hat bei ZustandB20°C/81,3kPa9,00L. FürB geben die gerundeten Modelldaten Vm=30,0L/mol; für ZustandA20°C/101,6kPa Vm=24,0L/mol. Welches Volumen erhält dieselbe Gasprobe inA? Prüfe die Behauptung,9,00L müsse erhalten bleiben, weil kein Gas verloren geht.
  - Task demand (EN): Fresh case without a worked method: a closed, nonreacting ideal gas occupies9.00L at stateB20°C/81.3kPa. The rounded model data give Vm=30.0L/mol forB and Vm=24.0L/mol for stateA20°C/101.6kPa. What volume does the same sample occupy inA? Check the claim that9.00L must be conserved because no gas is lost.
  - Expected performance (DE): InB enthält die Probe0,300mol. Ohne Teilchenaustausch oder Reaktion bleibt diese Stoffmenge inA gleich; bei24,0L/mol ergeben sich7,20L. Erhalten ist die Teilchen-/Stoffmenge, nicht das Volumen. Ein mit24,0L/mol aus dem B-Volumen berechnetes n wäre ein Zustandsfehler.
  - Expected performance (EN): The sample contains0.300mol inB. With no particle exchange or reaction, its amount remains the same inA, giving7.20L at24.0L/mol. Particle count/amount is conserved, not volume. Calculating the B amount using24.0L/mol would mix states.
  - Understanding focus (DE): Ungeholfener Zustandswechsel: passende Modelldaten auswählen und Erhaltungsgröße erklären.
  - Understanding focus (EN): An uncued state change requires selecting the correct model data and explaining the conserved quantity.
## Page 2: Luftzusammensetzung für Verbrennungen beschreiben

- Full learning-goal ID: `2dae4132-40a9-5ee3-ac0c-11c5d1302f36`
- Goal fingerprint: `sha256:c50eea992f8bcde93417e8ece8c0f9691a6fed4c17f1f9ace189cfcd3d2c7296`
- Page fingerprint: `sha256:029747eb2922322de6a993da16d098530b499d80b4b8d6e28d22a49f6d865d54`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die Zusammensetzung von Luft fachlich beschreiben und Sauerstoff als reaktionswirksamen Bestandteil bei Verbrennungen einordnen.

### Visualization

/assets/goal-visualizations/chemie/2dae4132-40a9-5ee3-ac0c-11c5d1302f36/2dae4132-40a9-5ee3-ac0c-11c5d1302f36.jpg

- original digest: `sha256:5c501136745da416799818b8e337884ae8e85249693815f259616bdbe237e414`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Chemische Reaktionen von physikalischen Vorgängen unterscheiden — `8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566` (outside this book)

### Direct reverse prerequisites outside this book

- Einfache Verbrennungsvorgänge chemisch deuten — `fa203f3a-0e81-5bcb-a4c8-e4374b7f04a3` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:3a3c71503c94cdb970b233ede25851810236680f0c16d09c14ca4909888b8c0a`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `air-mixture-and-reactive-oxygen`
  - Essential understanding (DE): Luft enthält ungefähr 78 % Stickstoff, 21 % Sauerstoff und geringe Anteile anderer Gase. Bei einfachen Verbrennungen ist Sauerstoff der reaktionswirksame Luftbestandteil; die übrigen Luftgase sind in diesem Zusammenhang nicht der Brennstoff.
  - Essential understanding (EN): Air contains roughly 78% nitrogen, 21% oxygen, and small amounts of other gases. In simple combustion, oxygen is the reactive component of air; the other gases are not the fuel in this context.
  - Observable performance (DE): Die lernende Person beschreibt die ungefähren Anteile und erklärt aus einer neuen Beobachtung, weshalb eine verringerte Sauerstoffzufuhr das Brennen beeinflusst, obwohl weiterhin Luft oder andere Gase vorhanden sein können.
  - Observable performance (EN): The learner describes the approximate fractions and uses a new observation to explain why reduced oxygen supply affects burning even when air or other gases may still be present.

**Coverage expectations**

- required expectations: `air-mixture-and-reactive-oxygen`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `oxygen-supply`: Offene Luftzufuhr wird mit begrenzter Zufuhr verglichen. / Open air supply is compared with restricted supply.
- `other-gases`: Ein zweiter Fall nennt ausdrücklich verbleibenden Stickstoff oder ein anderes nicht brennbares Gas. / A second case explicitly mentions remaining nitrogen or another noncombustible gas.

**Application cases**

- `covered-candle-observation`
  - Task demand (DE): Ein bereitgestelltes Beobachtungsprotokoll zeigt: Eine Kerze brennt zunächst in Luft und erlischt nach dem Abdecken, obwohl noch Gas im Gefäß ist. Beschreibe die grobe Luftzusammensetzung und erkläre, welcher Luftbestandteil für die Verbrennung verfügbar sein muss.
  - Task demand (EN): A supplied observation record shows a candle initially burning in air and then going out after being covered, although gas remains in the vessel. Describe the broad composition of air and explain which component must be available for combustion.
  - Expected performance (DE): Die lernende Person nennt Stickstoff als Hauptanteil und Sauerstoff als etwa ein Fünftel der Luft. Sie erklärt, dass mit abnehmender Sauerstoffverfügbarkeit das Brennen endet, und folgert nicht aus dem verbleibenden Gas, dass Stickstoff die Kerze weiterbrennen lässt.
  - Expected performance (EN): The learner identifies nitrogen as the main fraction and oxygen as about one fifth of air. They explain that burning ends as oxygen availability falls and do not infer from remaining gas that nitrogen keeps the candle burning.
  - Understanding focus (DE): Gemischanteile und chemische Rolle sind unterschiedliche Aussagen.
  - Understanding focus (EN): Mixture fraction and chemical role are different claims.
- `fresh-airflow-change`
  - Task demand (DE): Für einen neuen, unbeobachteten Modellfall erhält dieselbe kleine Flamme einmal freie Luftzufuhr und einmal nur einen engen Luftspalt. Sage die wahrscheinliche Änderung voraus und erkläre, weshalb der große Stickstoffanteil den Sauerstoff nicht ersetzt. Es ist keine Durchführung verlangt.
  - Task demand (EN): In a new, unobserved model case, the same small flame has free air access in one setup and only a narrow air gap in another. Predict the likely change and explain why the large nitrogen fraction does not replace oxygen. No experiment is requested.
  - Expected performance (DE): Die lernende Person erwartet bei begrenzter Zufuhr ein schwächeres oder erlöschendes Brennen und begründet dies mit weniger nachströmendem Sauerstoff, nicht mit dem Gesamtvolumen des Gasgemisches allein.
  - Expected performance (EN): The learner expects weaker burning or extinction with restricted supply and explains it through reduced replenishment of oxygen, rather than total gas-mixture volume alone.
  - Understanding focus (DE): Die Rolle des Sauerstoffs trägt eine eigenständige Vorhersage im geänderten Fall.
  - Understanding focus (EN): Oxygen's role supports an independent prediction in the changed case.
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
## Page 4: Treibhauseffekt über die Strahlungsbilanz erklären

- Full learning-goal ID: `31cce65a-480a-5111-ab3c-da2feb3d4065`
- Goal fingerprint: `sha256:31b9fceceff5aa6aab22e7a4ce94e6ae8a1bcb19903f6ffd0296a7dfaf47f98b`
- Page fingerprint: `sha256:e23dfe41f6f758c7533f28e3504c0c8c5c1e57bca513d435a6124ec7cd72e56a`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann den Energiehaushalt der Erde sowie natürlichen und anthropogenen Treibhauseffekt durch kurzwellige Einstrahlung, langwellige Absorption/Emission und Energieerhaltung erklären, fossilen CO2-Bestandsanstieg mit der Strahlungswirkung verknüpfen sowie Klimafolgen und Minderungsoptionen bedingt darstellen und begründet bewerten.

### Visualization

/assets/goal-visualizations/chemie/31cce65a-480a-5111-ab3c-da2feb3d4065/31cce65a-480a-5111-ab3c-da2feb3d4065.png

- original digest: `sha256:addd645e105a09e354553ce7cbe7dfb92d60452053a42f6b7a45ba59ced130f2`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Fossilen CO2-Anstieg mit dem Kohlenstoffkreislauf begründen — `0503c975-3934-5206-962e-b1c247de0c12` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Treibhauseffekt über die Strahlungsbilanz erklären — `42a2eaf1-fbb2-5879-b205-7f74dfb1eafa` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:970bf33eb633c7524a23ae52f6d2d58d3d36a8f7b289d35cdadfb6974b4992a0`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `hb-greenhouse-energy-balance`
  - Essential understanding (DE): Energiehaushalt der Erde, natürlicher und anthropogener Treibhauseffekt unterscheiden Bestand, Strahlungswirkung und Klimareaktion; der Mechanismus ist selektive Absorption/Emission, keine IR-Reflexion.
  - Essential understanding (EN): Earth energy budget and natural/anthropogenic greenhouse effects distinguish stock, radiation and climate response; the mechanism is selective absorption/emission, not IR reflection.
  - Observable performance (DE): Die lernende Person erklärt und bilanziert beide Zustände, kommuniziert die Wirkungskette und bewertet Minderung bedingt; sie korrigiert ihre Folgerung beim neuen Albedofall selbstständig.
  - Observable performance (EN): The learner explains/balances both states, communicates the causal chain and conditionally evaluates mitigation, independently revising inference in the new albedo case.

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
  - Task demand (DE): Bearbeite den vollständigen Hauptfall im gebundenen Material hb199-greenhouse-energy-climate.
  - Task demand (EN): Handle the complete main case in bound material hb199-greenhouse-energy-climate.
  - Expected performance (DE): Die lernende Person erklärt und bilanziert beide Zustände, kommuniziert die Wirkungskette und bewertet Minderung bedingt; sie korrigiert ihre Folgerung beim neuen Albedofall selbstständig.
  - Expected performance (EN): The learner explains/balances both states, communicates the causal chain and conditionally evaluates mitigation, independently revising inference in the new albedo case.
  - Understanding focus (DE): Energiehaushalt der Erde, natürlicher und anthropogener Treibhauseffekt unterscheiden Bestand, Strahlungswirkung und Klimareaktion; der Mechanismus ist selektive Absorption/Emission, keine IR-Reflexion.
  - Understanding focus (EN): Earth energy budget and natural/anthropogenic greenhouse effects distinguish stock, radiation and climate response; the mechanism is selective absorption/emission, not IR reflection.
- `hb199-greenhouse-energy-climate-fresh`
  - Task demand (DE): Bearbeite den vollständigen frischen Transfer im gebundenen Material hb199-greenhouse-energy-climate.
  - Task demand (EN): Handle the complete fresh transfer in bound material hb199-greenhouse-energy-climate.
  - Expected performance (DE): Die lernende Person erklärt und bilanziert beide Zustände, kommuniziert die Wirkungskette und bewertet Minderung bedingt; sie korrigiert ihre Folgerung beim neuen Albedofall selbstständig.
  - Expected performance (EN): The learner explains/balances both states, communicates the causal chain and conditionally evaluates mitigation, independently revising inference in the new albedo case.
  - Understanding focus (DE): Energiehaushalt der Erde, natürlicher und anthropogener Treibhauseffekt unterscheiden Bestand, Strahlungswirkung und Klimareaktion; der Mechanismus ist selektive Absorption/Emission, keine IR-Reflexion.
  - Understanding focus (EN): Earth energy budget and natural/anthropogenic greenhouse effects distinguish stock, radiation and climate response; the mechanism is selective absorption/emission, not IR reflection.
## Page 5: Indikatorfarbstoffe über Strukturänderungen erklären

- Full learning-goal ID: `34da1a4c-5082-54c8-9084-a94826fd36cd`
- Goal fingerprint: `sha256:e01bc7ab7489d246be6c0e46ff434fabdec23508ae6c4308ab665ab386776de9`
- Page fingerprint: `sha256:75acb211d1639a7654af37789578e901242f7fda5461043c7ef692c5f91b183d`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann erklären, wie Säure-Base- oder Redoxreaktionen delokalisierte Elektronensysteme verändern, und damit die Funktionsweise von Indikatoren beschreiben.

### Visualization

/assets/goal-visualizations/chemie/34da1a4c-5082-54c8-9084-a94826fd36cd/34da1a4c-5082-54c8-9084-a94826fd36cd.jpg

- original digest: `sha256:59d4a7280e8dd111ae235f674c6654c02665c98a9615c42cceff35550993fbd3`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Indikatorfarbstoffe über Strukturänderungen erklären — `a0aff485-59bc-537f-aab7-d50e78e2506a` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:93a5bf2f9174aa4350de7cd349eddfe7e257c2002fd6407ac1016a2e4bb64a75`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `modeling`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Säure-Base- oder Redoxwechsel ändern Elektronenverteilung und Spektrum eines Indikators.
  - Essential understanding (EN): Acid-base or redox changes alter an indicator’s electron distribution and spectrum.
  - Observable performance (DE): Verknüpft Teilchenform, Gleichgewicht und Farbe.
  - Observable performance (EN): Connects particle form, equilibrium and color.
- `e2`
  - Essential understanding (DE): Der Indikator zeigt ein chemisches Gleichgewicht, nicht einen beliebigen Farbumschlag ohne Strukturgrund.
  - Essential understanding (EN): An indicator reports a chemical equilibrium rather than an arbitrary color switch without structural basis.
  - Observable performance (DE): Überträgt das Modell auf eine veränderte chemische Bedingung.
  - Observable performance (EN): Transfers the model to a changed chemical condition.

**Coverage expectations**

- required expectations: `e1`, `e2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Protolyse versus Redoxform / Protolysis versus redox form
- `v2`: Gleichgewicht und Konjugationsunterbrechung / Equilibrium and interrupted conjugation

**Application cases**

- `34da1a4c-case-1`
  - Task demand (DE): Idealisierter Indikator HIn ⇌ H⁺ + In⁻: HIn hat im Modell unterbrochene ausgedehnte Konjugation und kein sichtbares Maximum; In⁻ ist planar konjugiert mit λmax 560 nm. pKₐ=7,0; gleicher solvent- und konzentrationsbezogener Zustand, keine weitere Protolyse.
1. Erkläre den Zusammenhang zwischen den beiden Strukturformen und der sichtbaren Absorption; unterscheide das Gleichgewicht von mesomeren Grenzformeln.
2. Bestimme mit [In⁻]/[HIn]=10^(pH−pKₐ) die dominierende Form bei pH 6 und 8 und erkläre die Farbumschlagrichtung.
  - Task demand (EN): Idealized indicator HIn ⇌ H⁺ + In⁻: HIn has interrupted extended conjugation and no visible maximum in this model; In⁻ is planar and conjugated with λmax 560 nm. pKₐ=7.0; same solvent and concentration conditions, no further protolysis.
1. Explain the connection between both structures and visible absorption; distinguish the equilibrium from resonance contributors.
2. Use [In⁻]/[HIn]=10^(pH−pKₐ) to identify the dominant form at pH 6 and 8 and explain the color-change direction.
  - Expected performance (DE): 1. In⁻ besitzt die längere konjugierte Elektronenverteilung und absorbiert im Modell sichtbar bei 560 nm; HIn nicht. HIn und In⁻ unterscheiden sich durch ein Proton und sind echte Teilchenformen im Gleichgewicht. Mesomere Formen desselben Teilchens unterscheiden sich nicht in Atomzusammensetzung.
2. Bei pH 6 beträgt das Verhältnis 0,1: HIn dominiert. Bei pH 8 beträgt es 10: In⁻ dominiert. Steigender pH begünstigt die konjugierte sichtbare Absorberform, daher stärkere Indikatorfarbe; der Übergang ist graduell, kein scharfer Einzel-pH.
  - Expected performance (EN): 1. In⁻ has the more extended conjugated distribution and absorbs visibly at 560 nm in the model; HIn does not. HIn and In⁻ differ by a proton and are real forms in equilibrium. Resonance contributors of one particle do not differ in composition.
2. At pH 6 the ratio is 0.1, so HIn dominates. At pH 8 it is 10, so In⁻ dominates. Higher pH favors the conjugated visible absorber and therefore stronger indicator color; the transition is gradual, not one sharp pH value.
  - Understanding focus (DE): In⁻ besitzt die längere konjugierte Elektronenverteilung und absorbiert im Modell sichtbar bei 560 nm; HIn nicht. HIn und In⁻ unterscheiden sich durch ein Proton und sind echte Teilchenformen im Gleichgewicht. Mesomere Formen desselben Teilchens unterscheiden sich nicht in Atomzusammensetzung. / Bei pH 6 beträgt das Verhältnis 0,1: HIn dominiert. Bei pH 8 beträgt es 10: In⁻ dominiert. Steigender pH begünstigt die konjugierte sichtbare Absorberform, daher stärkere Indikatorfarbe; der Übergang ist graduell, kein scharfer Einzel-pH.
  - Understanding focus (EN): In⁻ has the more extended conjugated distribution and absorbs visibly at 560 nm in the model; HIn does not. HIn and In⁻ differ by a proton and are real forms in equilibrium. Resonance contributors of one particle do not differ in composition. / At pH 6 the ratio is 0.1, so HIn dominates. At pH 8 it is 10, so In⁻ dominates. Higher pH favors the conjugated visible absorber and therefore stronger indicator color; the transition is gradual, not one sharp pH value.
- `34da1a4c-case-2`
  - Task demand (DE): Vereinfachtes Redoxindikator-Modell: B⁺ + H⁺ + 2e⁻ ⇌ BH. B⁺ ist delokalisiert, absorbiert im Modell 530–700 nm stark und lässt 430–480 nm weitgehend durch; BH hat ein unterbrochenes π-System und erscheint ohne weitere Banden farblos. Ein Reduktionsmittel liefert Elektronen; Luftsauerstoff kann den Rückweg fördern. Keine reale Stoffzubereitung.
1. Prüfe die Ladungsbilanz und erkläre die Entfärbung bei Reduktion über die vorgegebene Strukturänderung; begründe die blaue Erscheinung der oxidierten Form.
2. Erkläre die erwartete Rückfärbung bei Luftkontakt und begründe, warum dieses Signal allein keinen bestimmten pH-Wert misst.
  - Task demand (EN): Simplified redox-indicator model: B⁺ + H⁺ + 2e⁻ ⇌ BH. B⁺ is delocalized, strongly absorbs 530–700 nm in the model and largely transmits 430–480 nm; BH has an interrupted pi system and appears colorless without other bands. A reducing agent supplies electrons; air oxygen can promote reversal. No actual preparation.
1. Check charge balance and explain decolorization upon reduction through the supplied structural change; explain why the oxidized form looks blue.
2. Explain predicted recoloring on air exposure and why this signal alone does not measure a particular pH.
  - Expected performance (DE): 1. Links +1+1−2=0, rechts BH neutral. Reduktion unterbricht im Modell die ausgedehnte Delokalisierung, sodass die sichtbare Bande entfällt. B⁺ entzieht dem Weißlicht vorwiegend grüne bis rote Anteile; das verbleibende blaue Licht erklärt die modellierte blaue Erscheinung.
2. Luftsauerstoff wirkt als Elektronenakzeptor und ermöglicht Oxidation zurück zu B⁺. Das Signal hängt von Redoxbedingungen und gegebenenfalls auch Protonenaktivität ab; ohne Kalibrierung und definierte Bedingungen gibt es keinen eindeutigen pH-Wert.
  - Expected performance (EN): 1. Left charge +1+1−2=0 equals neutral BH. Reduction interrupts extended delocalization in the model, removing the visible band. B⁺ removes mainly green-to-red components from white light; remaining blue light explains its modeled blue appearance.
2. Air oxygen acts as an electron acceptor and permits oxidation back to B⁺. The signal depends on redox conditions and potentially proton activity; without calibration and controlled conditions it gives no unique pH value.
  - Understanding focus (DE): Links +1+1−2=0, rechts BH neutral. Reduktion unterbricht im Modell die ausgedehnte Delokalisierung, sodass die sichtbare Bande entfällt. B⁺ entzieht dem Weißlicht vorwiegend grüne bis rote Anteile; das verbleibende blaue Licht erklärt die modellierte blaue Erscheinung. / Luftsauerstoff wirkt als Elektronenakzeptor und ermöglicht Oxidation zurück zu B⁺. Das Signal hängt von Redoxbedingungen und gegebenenfalls auch Protonenaktivität ab; ohne Kalibrierung und definierte Bedingungen gibt es keinen eindeutigen pH-Wert.
  - Understanding focus (EN): Left charge +1+1−2=0 equals neutral BH. Reduction interrupts extended delocalization in the model, removing the visible band. B⁺ removes mainly green-to-red components from white light; remaining blue light explains its modeled blue appearance. / Air oxygen acts as an electron acceptor and permits oxidation back to B⁺. The signal depends on redox conditions and potentially proton activity; without calibration and controlled conditions it gives no unique pH value.
## Page 6: Chemische Quellen und Darstellungen kritisch prüfen

- Full learning-goal ID: `36666b4a-97af-51fc-9983-56cdcc7a8229`
- Goal fingerprint: `sha256:48040c2af3eea2a65f19a4c76c20b2e420d1a46fa65da7e35c3f06c4732cea4b`
- Page fingerprint: `sha256:8399a4d71c70b9abd7a1912d2247ffbe7edd876d32512d6cdc1ba7a22fc4ba73`
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
## Page 7: Nukleophile Substitution als Donator-Akzeptor-Reaktion beschreiben

- Full learning-goal ID: `3899edf4-a809-54b1-8ee7-4e67aa82dc7c`
- Goal fingerprint: `sha256:ad29cb29db1dd4319610a89e0a4d5ddd63c1a08af90ea94ed34ef2350935583f`
- Page fingerprint: `sha256:ac97fd8c795fe174eedc424e5cab20f9641ae28e53d2c0a8ceb1c838e182d4b0`
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
## Page 8: Einflussfaktoren diskutieren

- Full learning-goal ID: `3ce81f96-4fbb-5022-88b7-337a000315ed`
- Goal fingerprint: `sha256:1d5e3620ccb32c5cccd88d5250fd32a06500d315963028b49a3583e28eb08adc`
- Page fingerprint: `sha256:a31a12d7bdbeb9741a28e5d54ca213c95212add4e65b067836b47f1506a6a8ac`
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
## Page 9: Eigenschaften über Wechselwirkungen erklären

- Full learning-goal ID: `3d3231f9-039d-5ce5-9e8e-af219c7fee08`
- Goal fingerprint: `sha256:4723ce2f2cc438602bce3221479a8d2e0379e77231caceab889cb44e9b45bbbd`
- Page fingerprint: `sha256:d0d0f8ff1453fd6133dbaf0aeaae379e0a404a5625328ab190e2db27fafdb699`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann den Einfluss von Van-der-Waals-Kräften und Wasserstoffbrücken auf Schmelz- und Siedetemperaturen sowie Löslichkeiten ausgewählter Stoffe begründen.

### Visualization

/assets/goal-visualizations/chemie/3d3231f9-039d-5ce5-9e8e-af219c7fee08/3d3231f9-039d-5ce5-9e8e-af219c7fee08.jpg

- original digest: `sha256:de5de83ca4aff9d4f851b78f9baeb5132ac257241e186e330a761838ce735c70`
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
- Ethanol-Eigenschaften aus der Hydroxygruppe ableiten — `e1214210-406e-5075-b83c-086b3972ed66` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:17cadb7a07f964e791ccf1d8dec02d3ba0fa4a20ab085356445c525bae5901f4`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `structure-model-reasoning`
  - Essential understanding (DE): Zwischenmolekulare Anziehung erklärt zusammen mit Molekülgröße/-form Siedeverhalten und Mischbarkeit; alle betrachteten Moleküle besitzen London-Wechselwirkungen.
  - Essential understanding (EN): Intermolecular attraction together with molecular size/shape explains boiling behaviour and miscibility; all molecules considered have London interactions.
  - Observable performance (DE): Die Person identifiziert Wasserstoffbrücken-Donor/-Akzeptor und London-Beiträge und verbindet sie mit dem Trennen/Mischen von Molekülen.
  - Observable performance (EN): The learner identifies hydrogen-bond donors/acceptors and London contributions and connects them to separating/mixing molecules.
- `fresh-application-and-boundary`
  - Essential understanding (DE): Die Stärke einer einzelnen Wechselwirkung ersetzt nicht die Betrachtung aller Beiträge; Schmelztemperaturen hängen zusätzlich von Kristallpackung ab.
  - Essential understanding (EN): The strength of an individual interaction does not replace considering all contributions; melting also depends on crystal packing.
  - Observable performance (DE): Die größere Kohlenwasserstoffoberfläche erhöht polarisierbare Kontaktmöglichkeiten; der hydrophobe Anteil wächst relativ zur einen OH-Gruppe. Beide können Wasserstoffbrücken bilden, dennoch ist Hexan-1-ol viel schlechter mit Wasser mischbar. Eine sichere Schmelzrangfolge braucht Packungs-/Messinformationen. Beim Schmelzen wird die geordnete Festkörperpackung aufgehoben und die Anordnung der zwischenmolekularen Kontakte verändert; die Moleküle bleiben in der Flüssigkeit intakt und üben weiter London-Anziehung aus. Die vorgegebene günstigere symmetrische Packung stabilisiert im Modell die feste Phase und begründet zusammen mit den Fusionsdaten den höheren Schmelzwert des kompakten Isomers; dies ist keine direkte Folgerung aus einer Siedetemperatur oder eine allgemeine Verzweigungsregel. Eine OH-Gruppe macht nicht jedes Molekül vollständig wasserlöslich; höhere Siedetemperatur impliziert keine zwingend höhere Schmelztemperatur.
  - Observable performance (EN): The larger hydrocarbon surface increases polarizable contact possibilities; the hydrophobic fraction grows relative to the single OH group. Both can hydrogen-bond, yet hexan-1-ol mixes much less well with water. A reliable melting order needs packing or measurement information. Melting disrupts ordered solid packing and changes the arrangement of intermolecular contacts; the molecules remain intact in the liquid and still exert London attraction. In the given model, favourable symmetrical packing stabilises the solid phase and, together with the fusion data, accounts for the compact isomer melting higher; this is not inferred directly from boiling temperature or a universal branching rule. One OH group does not make every molecule fully water-soluble; a higher boiling point does not imply a necessarily higher melting point.
- `positive-melting-model-explanation`
  - Essential understanding (DE): Schmelzen verändert die geordnete Packung und zwischenmolekulare Kontakte einer festen Phase; Moleküle bleiben intakt. London-Anziehung zusammen mit vorgegebenen Form-/Packungsinformationen und Fusionsdaten ermöglicht eine begründete Schmelzerklärung, ohne eine allgemeine Siede-Schmelz-Rangfolge zu behaupten.
  - Essential understanding (EN): Melting changes ordered packing and intermolecular contacts in a solid phase; molecules remain intact. London attraction together with supplied shape/packing information and fusion data supports a justified melting explanation without claiming a universal boiling-to-melting ranking.
  - Observable performance (DE): Die Person erklärt am gegebenen n-Pentan/2,2-Dimethylpropan-Modell den höheren Fusionswert des symmetrischen kompakten Isomers mit der im Modell günstigeren Festkörperpackung; sie unterscheidet das Aufheben geordneter Packung von Molekültrennung beim Sieden und von kovalenter Bindungsspaltung.
  - Observable performance (EN): Using the given n-pentane/2,2-dimethylpropane model, the learner accounts for the symmetrical compact isomer having the higher fusion value through favourable solid packing in that model, and distinguishes loss of ordered packing from molecular separation in boiling and from covalent-bond cleavage.

**Coverage expectations**

- required expectations: `structure-model-reasoning`, `fresh-application-and-boundary`, `positive-melting-model-explanation`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `material-variation`: Hydroxygruppe, Kettenlänge, Molekülform und Wahl eines polaren oder unpolaren Lösemittels. / Hydroxyl group, chain length, molecular shape and choice of polar or nonpolar solvent.
- `counterexample`: Die Stärke einer einzelnen Wechselwirkung ersetzt nicht die Betrachtung aller Beiträge; Schmelztemperaturen hängen zusätzlich von Kristallpackung ab. / The strength of an individual interaction does not replace considering all contributions; melting also depends on crystal packing.

**Application cases**

- `chem-current15-3d3231f9-case-1`
  - Task demand (DE): Strukturen: Ethanol CH3CH2OH, Propan CH3CH2CH3, Wasser H2O. Ethanol und Propan besitzen ähnliche molare Masse; es werden keine Messwerte vorgegeben. Begründe den deutlich höheren Siedepunkt von Ethanol gegenüber Propan und die gute Mischbarkeit von Ethanol mit Wasser anhand der Strukturen.
  - Task demand (EN): Structures: ethanol CH3CH2OH, propane CH3CH2CH3, water H2O. Ethanol and propane have similar molar mass; no measurements are supplied. Explain ethanol boiling much higher than propane and mixing well with water using their structures.
  - Expected performance (DE): Beide besitzen London-Kräfte; Ethanol bietet zusätzlich polare O-H/C-O-Bindungen und Wasserstoffbrücken zwischen Molekülen sowie mit Wasser. Beim Sieden werden intermolekulare Wechselwirkungen überwunden, nicht C-C-Bindungen zerlegt.
  - Expected performance (EN): Both have London interactions; ethanol additionally offers polar O-H/C-O bonds and hydrogen bonding between molecules and with water. Boiling overcomes intermolecular interactions rather than breaking C-C bonds.
  - Understanding focus (DE): Ein Wasserstoff an einem Kohlenstoff ist in diesen Stoffen kein gleichwertiger Wasserstoffbrücken-Donor.
  - Understanding focus (EN): A hydrogen bonded to carbon in these substances is not an equivalent hydrogen-bond donor.
- `chem-current15-3d3231f9-case-2`
  - Task demand (DE): Frischer Vergleich: Ethanol CH3CH2OH und Hexan-1-ol CH3(CH2)5OH; beide enthalten genau eine Hydroxygruppe. Zusätzlich gegeben: n-Pentan CH3(CH2)3CH3 und 2,2-Dimethylpropan C(CH3)4 sind unpolare C5H12-Isomere; gerundete NIST-Fusionswerte sind 143 K beziehungsweise 255 K. Vorgegebenes qualitatives Packungsmodell: Beide Feststoffe werden durch London-Anziehung zusammengehalten; die kompakte, hochsymmetrische Form des 2,2-Dimethylpropans begünstigt im Modell eine regelmäßigere Packung und Stabilisierung der festen Phase. Dieses vereinfachte Modell ist kein neuer gemessener Kristallstrukturbeleg. Begründe, warum die längere Kette zugleich den London-Beitrag erhöht und die Mischbarkeit mit Wasser vermindert. Sage, welche Schmelzrangfolge aus diesen Angaben noch nicht sicher folgt. Erkläre anhand der gegebenen Packungs- und Fusionsangaben positiv den höheren Schmelzwert von 2,2-Dimethylpropan und was sich beim Schmelzen gegenüber dem Sieden ändert.
  - Task demand (EN): Fresh comparison: ethanol CH3CH2OH and hexan-1-ol CH3(CH2)5OH; each contains exactly one hydroxyl group. Additionally supplied: n-pentane CH3(CH2)3CH3 and 2,2-dimethylpropane C(CH3)4 are nonpolar C5H12 isomers; rounded NIST fusion values are 143 K and 255 K, respectively. Given qualitative packing model: London attraction holds both solids together; in the model the compact, highly symmetrical shape of 2,2-dimethylpropane favours more regular packing and stabilisation of the solid phase. This simplified model is not new measured crystal-structure evidence. Explain why the longer chain increases the London contribution while reducing water miscibility. State which melting order cannot yet be established. Using the supplied packing and fusion information, explain positively the higher melting value of 2,2-dimethylpropane and what changes in melting compared with boiling.
  - Expected performance (DE): Die größere Kohlenwasserstoffoberfläche erhöht polarisierbare Kontaktmöglichkeiten; der hydrophobe Anteil wächst relativ zur einen OH-Gruppe. Beide können Wasserstoffbrücken bilden, dennoch ist Hexan-1-ol viel schlechter mit Wasser mischbar. Eine sichere Schmelzrangfolge braucht Packungs-/Messinformationen. Beim Schmelzen wird die geordnete Festkörperpackung aufgehoben und die Anordnung der zwischenmolekularen Kontakte verändert; die Moleküle bleiben in der Flüssigkeit intakt und üben weiter London-Anziehung aus. Die vorgegebene günstigere symmetrische Packung stabilisiert im Modell die feste Phase und begründet zusammen mit den Fusionsdaten den höheren Schmelzwert des kompakten Isomers; dies ist keine direkte Folgerung aus einer Siedetemperatur oder eine allgemeine Verzweigungsregel.
  - Expected performance (EN): The larger hydrocarbon surface increases polarizable contact possibilities; the hydrophobic fraction grows relative to the single OH group. Both can hydrogen-bond, yet hexan-1-ol mixes much less well with water. A reliable melting order needs packing or measurement information. Melting disrupts ordered solid packing and changes the arrangement of intermolecular contacts; the molecules remain intact in the liquid and still exert London attraction. In the given model, favourable symmetrical packing stabilises the solid phase and, together with the fusion data, accounts for the compact isomer melting higher; this is not inferred directly from boiling temperature or a universal branching rule.
  - Understanding focus (DE): Eine OH-Gruppe macht nicht jedes Molekül vollständig wasserlöslich; höhere Siedetemperatur impliziert keine zwingend höhere Schmelztemperatur.
  - Understanding focus (EN): One OH group does not make every molecule fully water-soluble; a higher boiling point does not imply a necessarily higher melting point.
## Page 10: Wirkungsgrade vergleichen

- Full learning-goal ID: `3ec31fe1-e01b-5edd-bd9a-936191d67639`
- Goal fingerprint: `sha256:f0abdaf037371e8c2bf0a89334f2ac63a9173a9d6ea30d6d851359c7e2883eff`
- Page fingerprint: `sha256:fd2f840df6832e128dbd1d76e721fcd1d1b999db2fb53b1336c5c1c53b4972b8`
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
## Page 11: Elektrophile Addition mechanistisch darstellen

- Full learning-goal ID: `3fb7dea4-f832-5e23-b518-68b13a655b92`
- Goal fingerprint: `sha256:722e36aa5ac92e9b1f2376fbc3de71cb5899b87363325c9772a0bcf5ed6ec030`
- Page fingerprint: `sha256:94612ff6bff1914d31baad1a3cd7e0fb8e6ffe9c8d93a46c2c00e61bc40de15a`
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
## Page 12: Halogenidionen-Nachweise deuten

- Full learning-goal ID: `41396457-d97b-55f3-9804-2af1bb188e79`
- Goal fingerprint: `sha256:47d0c86d818239c266fda78eaf08ff3fe3a9fbfc44b957e0132f262d4604d213`
- Page fingerprint: `sha256:0918557dcf05cdc253fa524d4519dfcdbf848ae5d8bb9d500cec173218dc4d71`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Nachweise für Halogenidionen im Kontext nukleophiler Substitution fachlich deuten.

### Visualization

/assets/goal-visualizations/chemie/41396457-d97b-55f3-9804-2af1bb188e79/41396457-d97b-55f3-9804-2af1bb188e79.jpg

- original digest: `sha256:612afb3bf298f744f55ae7b68e40b0595e806b7b5d10ef2d60742c46e73f35c8`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Halogenalkan-Hydroxid-Reaktionsgleichungen formulieren — `d4928773-3be8-5cf1-907c-ef07c96751e8` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- Silberhalogenid-Nachweise: typische Farben abrufen — `1831bfd4-922f-5415-b9e7-0c8adcd8c5fd` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Aldehyd-/Keton- und Halogenidnachweise: Merkmale abrufen — `567b5b63-8cc5-562f-85d1-13e2bbda9b54` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:799934bf80cd5390769eb307218b5e8afdb2750877122c43b4d2045a4378d7db`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `data`

**Positive understanding expectations**

- `b002-41396457-core`
  - Essential understanding (DE): Bei nukleophiler Substitution kann eine abgehende Halogenidion-Spezies mit Silberionen einen charakteristischen Niederschlag bilden; der Befund ist an die Probe und Störionen gebunden.
  - Essential understanding (EN): In nucleophilic substitution, a released halide ion may form a characteristic precipitate with silver ions; the result depends on the sample and interfering ions.
  - Observable performance (DE): Die lernende Person deutet für eine bereitgestellte Reaktionslösung einen passenden Silbernitratbefund und verbindet das Halogenidion mit der Abgangsgruppe.
  - Observable performance (EN): The learner interprets a supplied silver-nitrate result for a reaction solution and links the halide ion to the leaving group.

**Coverage expectations**

- required expectations: `b002-41396457-core`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `halide`: Bromid- und Chloridion liefern unterschiedliche Silberhalogenidbefunde. / Bromide and chloride give different silver-halide observations.
- `control`: Eine Blindprobe prüft bereits vorhandenes Halogenid. / A blank control checks pre-existing halide.

**Application cases**

- `bromoethane-product-test`
  - Task demand (DE): Nach einer vorgegebenen nukleophilen Substitution von Bromethan zeigt die wässrige Produktlösung mit Silbernitrat einen hellgelben Niederschlag. Deute dessen Bezug zur Abgangsgruppe.
  - Task demand (EN): After a supplied nucleophilic substitution of bromoethane, the aqueous product solution gives a pale-yellow precipitate with silver nitrate. Interpret its relation to the leaving group.
  - Expected performance (DE): Die lernende Person deutet den Befund als Hinweis auf Bromidionen und verbindet Br− mit der C-Br-Spaltung, ohne daraus allein die vollständige organische Produktstruktur abzuleiten.
  - Expected performance (EN): The learner interprets the result as evidence of bromide and links Br− to C-Br cleavage without deriving the full organic product structure from the precipitate alone.
  - Understanding focus (DE): Der Nachweis stützt eine Teilbehauptung über die Substitution.
  - Understanding focus (EN): The test supports a bounded claim about substitution.
- `fresh-chloride-control`
  - Task demand (DE): In einem neuen Chlorethan-Fall enthält schon die Ausgangsprobe Chlorid; nach Reaktion entsteht ebenfalls ein weißer Silbernitratniederschlag. Welche zusätzliche Vergleichsprobe ist für den Reaktionsschluss nötig?
  - Task demand (EN): In a fresh chloroethane case, the starting sample already contains chloride; a white silver-nitrate precipitate also appears after reaction. Which extra comparison is needed to infer reaction?
  - Expected performance (DE): Die lernende Person fordert eine geeignete Blind- oder Vorherprobe und erklärt, dass der weiße Niederschlag allein keine neu freigesetzten Cl−-Ionen beweist.
  - Expected performance (EN): The learner asks for a suitable blank or before sample and explains that the white precipitate alone does not prove newly released Cl−.
  - Understanding focus (DE): Kontrolle trennt Nachweis von unzulässiger Kausalbehauptung.
  - Understanding focus (EN): A control separates detection from an unsupported causal claim.
## Page 13: Grundlegende Laborarbeitsweisen anwenden

- Full learning-goal ID: `416dfd33-8b43-5c49-903c-9847b95e4208`
- Goal fingerprint: `sha256:4764fadfc8bd0a58527fdfb048fcc3bdffd7c56af8283095722feb827471a67d`
- Page fingerprint: `sha256:6089568e4ceeeef93d85bcf0680a3612b1821b3b70bfe94c4503160a9c2aaa6e`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann grundlegende chemische Laborarbeitsweisen sachgerecht ausführen und Beobachtungen geordnet dokumentieren.

### Visualization

/assets/goal-visualizations/chemie/416dfd33-8b43-5c49-903c-9847b95e4208/416dfd33-8b43-5c49-903c-9847b95e4208.jpg

- original digest: `sha256:78b63028b8d91dcb10c8a0801af73c276b427995958ccdba005bbf2bcd12ec44`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)

### Direct reverse prerequisites outside this book

- None

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:6152f1cfaec2bc954ca6928c572f0d95191d539bfe8149c6efb350de02a74f76`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `e1`
  - Essential understanding (DE): Masse und Volumen brauchen passende Geräte und eindeutige Einheiten.
  - Essential understanding (EN): Mass and volume need suitable apparatus and explicit units.
  - Observable performance (DE): Tara und Einwaage tatsächlich korrekt vorführen; notierte Masse mit Einheit statt abgeschriebener Sollmenge. Geeignete Geräte bereitstellen, beschriften und Messbereich passend wählen.
  - Observable performance (EN): Actually demonstrate taring and weighing; record mass with units rather than copying the target. Prepare and label suitable apparatus and choose an appropriate range.
- `e2`
  - Essential understanding (DE): Sachgerechtes Übertragen und Trennen ist eine beobachtbare Handlung.
  - Essential understanding (EN): Appropriate transfer and separation are observable actions.
  - Observable performance (DE): Volumen auf Augenhöhe ablesen und Filter passend einsetzen; kein Überlaufen oder Vermischen beschrifteter Gefäße. Absetzen, langsames Abgießen und Saugballpipette tatsächlich sachgerecht zeigen.
  - Observable performance (EN): Read at eye level and fit the filter; avoid overflow or mixing labelled vessels. Actually demonstrate settling, slow decanting and bulb pipetting.
- `e3`
  - Essential understanding (DE): Ein Originalprotokoll trennt eigene Beobachtungen von fremden Lehrdaten.
  - Essential understanding (EN): An original record distinguishes own observations from external practice data.
  - Observable performance (DE): Eigenes Protokoll enthält Reihenfolge und rohe Beobachtungen; Lehrdaten sind als fremde Übungsdaten markiert. Übertragenes Volumen und Rest mit Einheit sowie Verluste unmittelbar dokumentieren.
  - Observable performance (EN): Own record contains sequence and raw observations; practice data are marked as external. Immediately record transferred and residual volumes with units and losses.
- `e4`
  - Essential understanding (DE): Klarheit, Stoffreinheit und Rückgewinnung sind verschiedene Aussagen.
  - Essential understanding (EN): Clarity, purity and recovery are different claims.
  - Observable performance (DE): Klarheit von Stoffreinheit unterscheiden und erklären, weshalb Salz durch den Filter gelangt. Begründen, warum fehlende vollständige Rückgewinnung und ungenaue Tropfenzahl keine sichere Messfehlerdiagnose erlauben.
  - Observable performance (EN): Distinguish clarity from purity and explain why salt passes through paper. Explain why incomplete recovery and an imprecise drop count do not uniquely diagnose a reading error.

**Coverage expectations**

- required expectations: `e1`, `e2`, `e3`, `e4`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `chemically-meaningful-change`: Ein neuer Ansatz enthält statt Sand löslichen Zucker. Wähle selbst, ob Filtration noch einen Rückstand liefern sollte, und führe einen entsprechend begründeten Kontrollansatz aus. Erhalte frisch ein Gemisch mit fein verteiltem Sand, das nach 2 min noch trüb ist. Entscheide ohne Methodenvorgabe, wie du klares Wasser gewinnst, und demonstriere die angepasste Handhabung. / A fresh batch contains soluble sugar instead of sand. Independently decide whether filtration should retain a solid and carry out a justified control. Receive a fresh mixture of fine sand still cloudy after two minutes. Without a method cue, choose how to obtain clear liquid and demonstrate the adapted handling.

**Application cases**

- `lab15-01-a`
  - Task demand (DE): Vollständige eigene Materialien, Protokoll und Daten: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-01-a. Führe den Ansatz aus und protokolliere deine tatsächlich verwendeten Mengen und Arbeitsschritte. Ordne die Lehrdaten getrennt als Vergleich ein. Erkläre, warum klares Filtrat nicht automatisch reines Wasser ist. Demonstriere anschließend eine eigene korrekte Volumenablesung, ohne die Zahl eines anderen abzuschreiben.
  - Task demand (EN): Complete original materials, protocol and data: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-01-a. Carry out the batch and record your actual quantities and actions. Mark supplied practice data separately for comparison. Explain why clear filtrate need not be pure water. Then demonstrate an independent correct volume reading without copying another person’s value.
  - Expected performance (DE): Die Waage misst Masse; der Zylinder das Flüssigkeitsvolumen. Der unten liegende Meniskus wird bei Wasser auf Augenhöhe gelesen. Sand bleibt wegen seiner Teilchengröße im Filter, gelöstes Salz passiert mit Wasser. Trübung und Klarheit sind Beobachtungen; gelöstes Salz ist eine begründete Deutung. Nasse Rückstandsmasse wäre keine trockene Sandmasse. Tatsächliche Geschicklichkeit und Dokumentation bleiben bis zur Ausführung unbeobachtet.
  - Expected performance (EN): The balance measures mass; the cylinder measures liquid volume. Read the bottom of a water meniscus at eye level. Sand is retained by particle size, while dissolved salt passes with water. Cloudiness and clarity are observations; dissolved salt is an inference. Wet residue mass is not dry sand mass. Actual handling and documentation remain unobserved until performance.
  - Understanding focus (DE): Gebundenes Fallmaterial sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Ein neuer Ansatz enthält statt Sand löslichen Zucker. Wähle selbst, ob Filtration noch einen Rückstand liefern sollte, und führe einen entsprechend begründeten Kontrollansatz aus.
  - Understanding focus (EN): Bound case material sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. A fresh batch contains soluble sugar instead of sand. Independently decide whether filtration should retain a solid and carry out a justified control.
- `lab15-01-b`
  - Task demand (DE): Vollständige eigene Materialien, Protokoll und Daten: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-01-b. Zeige Dekantieren und dosiertes Pipettieren selbst. Notiere die tatsächlich übertragenen Volumina, unerwünschte Körner und Restflüssigkeit. Begründe die Wahl gegenüber sofortigem kräftigem Ausgießen. Kannst du aus zurückbleibender Flüssigkeit auf falsche Volumenablesung schließen?
  - Task demand (EN): Complete original materials, protocol and data: curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1/materials/thirty-complete-DE-EN-cases.author.json #lab15-01-b. Demonstrate decanting and controlled pipetting yourself. Record actual transferred volumes, unwanted grains and residual liquid. Justify the choice over immediate vigorous pouring. Does residual liquid prove an incorrect volume reading?
  - Expected performance (DE): Absetzen ermöglicht die Trennung eines Überstands von großen dichten Körnern; Flüssigkeitsreste sind beabsichtigt und beschränken Rückgewinnung. Eine Tropfpipette dosiert, ist aber kein kalibriertes Präzisionsmessgerät. Restflüssigkeit allein beweist keinen Ablesefehler; Benetzung, bewusster Rest und Verschütten sind verschieden. Eigenes Protokoll muss reale Abweichungen enthalten.
  - Expected performance (EN): Settling allows supernatant to be separated from large dense grains; leaving liquid is intentional and limits recovery. A dropper dispenses but is not a calibrated precision measuring device. Residual liquid alone does not prove a reading error; wetting, a deliberate remainder and spillage differ. The original record must retain actual deviations.
  - Understanding focus (DE): Gebundenes Fallmaterial sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Erhalte frisch ein Gemisch mit fein verteiltem Sand, das nach 2 min noch trüb ist. Entscheide ohne Methodenvorgabe, wie du klares Wasser gewinnst, und demonstriere die angepasste Handhabung.
  - Understanding focus (EN): Bound case material sha256:237164761cab4389b6d3de236f3193c7708b5db0116db47cb660cf08feea7c5d. Receive a fresh mixture of fine sand still cloudy after two minutes. Without a method cue, choose how to obtain clear liquid and demonstrate the adapted handling.
## Page 14: Innere Energie und Enthalpie in Reaktionssystemen abgrenzen

- Full learning-goal ID: `4928d5d1-e790-5883-9349-3b03a1c63b99`
- Goal fingerprint: `sha256:35fc9a069241bd6addca548ec2af9759605f29141ae5431120af791ab6afdd72`
- Page fingerprint: `sha256:4578b13628615af57b1993a4a1ab69b134ac717569bc93c174b76640a27e2824`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann unterschiedliche Reaktionssysteme unterscheiden, Wärme und Arbeit als Formen der Energieänderung in einem geschlossenen System mit variablem Volumen beschreiben und die Änderung der inneren Energie (Reaktionsenergie) von der Änderung der Enthalpie (Reaktionsenthalpie) abgrenzen.

### Visualization

/assets/goal-visualizations/chemie/4928d5d1-e790-5883-9349-3b03a1c63b99/4928d5d1-e790-5883-9349-3b03a1c63b99.jpg

- original digest: `sha256:3fe8ae78ae5dbd7582baa035f4cc8041a1473d5764e09ec03c011618e2327191`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Exotherme und endotherme Reaktionen unterscheiden — `1286f2fe-89b7-4454-8e11-85b6abd6e278` (outside this book)

### Direct reverse prerequisites outside this book

- HE-GK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `14577339-9e0c-5b44-8e47-91e1a4947367` (outside this book)
- HE-LK: Materialgestützte Chemie-Abschlussaufgabe bearbeiten — `32705a3a-9b7f-5cc0-ba41-881d13d0c45b` (outside this book)
- Enthalpien berechnen — `4a08f31f-204c-5339-9d9f-5d2af28d5d5c` (outside this book)
- Standard-Reaktionsenthalpien aus Bildungsenthalpien berechnen — `4663fd80-1618-5211-8020-18f4b80979fc` (outside this book)
- Grenzen der Umwandlung von Wärme in Arbeit erklären — `dc5173e8-6e63-58d3-a79b-bd74ef3cb98b` (outside this book)
- Energiekonzept auf Donator-Akzeptor-Reaktionen anwenden — `cc803809-fa7f-517c-b356-9f2f7caf21a5` (outside this book)
- Reaktionsenthalpien aus Bindungsverhältnissen begründen — `3e433dae-99f9-5a95-ad63-d5fa0b5f6836` (outside this book)
- Elektrische Arbeit galvanischer Zellen ermitteln — `96fd8608-8d98-53f0-9b86-1311c3220fd3` (outside this book)
- Brennstoffzellen und Verbrennungskraftwerke multiperspektivisch bewerten — `0cf2ffe1-a988-5ffb-ab37-0ac7d58b23dd` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:66e96662e073f3168edd35dcfb1eb021194c4251d01b27bc70e7380a198ecd76`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `concept`

**Positive understanding expectations**

- `system-boundary-heat-work-state`
  - Essential understanding (DE): Offene Systeme tauschen Stoff und Energie, geschlossene Systeme Energie, aber keinen Stoff, isolierte Systeme beides nicht aus. Wärme und Arbeit sind Übertragungsformen; innere Energie U und Enthalpie H = U + pV sind Zustandsgrößen. Bei nur Volumenarbeit gilt ΔU = q + w. Für konstanten Außendruck gilt w = −p_extΔV. In einem geschlossenen System mit ausschließlich Volumenarbeit gilt q_p = ΔH bei konstantem, mechanisch ausgeglichenem System- und Außendruck; q_V = ΔU gilt bei konstantem Volumen und ohne andere Arbeit.
  - Essential understanding (EN): Open systems exchange matter and energy, closed systems energy but not matter, and isolated systems neither. Heat and work are transfer modes; internal energy U and enthalpy H = U + pV are state functions. With only pressure–volume work, ΔU = q + w. For constant external pressure, w = −p_extΔV. For a closed system with only pressure–volume work, q_p = ΔH holds at constant, mechanically balanced system and external pressure; q_V = ΔU holds at constant volume with no other work.
  - Observable performance (DE): Die lernende Person legt eine Systemgrenze fest, klassifiziert den Austausch und erläutert anhand eines Kolbens sowie eines starren Gefäßes, warum gemessene Wärme je nach Bedingung ΔH oder ΔU entspricht.
  - Observable performance (EN): The learner defines a system boundary, classifies exchange and uses a piston and a rigid vessel to explain why measured heat corresponds to ΔH or ΔU depending on conditions.
- `source-required-th-schematic-internal-energy-diagram`
  - Essential understanding (DE): Die ausdrücklich zusätzliche TH-Quellenanforderung für das erhöhte Anforderungsniveau (gedruckte S. 40/PDF-S. 45, rechte Tabellenspalte) verlangt ein schematisches Energiediagramm. Die historische Extraktion sourceGoals/44 bezeichnet sie GK_LK; die tatsächliche Spaltenlage weist sie jedoch dem erhöhten Niveau zu. Der Darstellungsfall bleibt innerhalb des vorhandenen breiten SkillPilot-Zielumfangs nutzbar; daraus entsteht keine universelle offizielle GK-Pflicht. Keine zusätzliche numerische pΔV-/Molrechnung und keine starre Zusatzaufgabenquote.
  - Essential understanding (EN): The explicitly additional TH source requirement for the advanced demand level (printed p. 40/PDF p. 45, right-hand table column) requires a schematic energy diagram. Historical extraction sourceGoals/44 labels it basic/advanced; the actual column placement assigns it to the advanced level. The representation remains usable within the existing broad SkillPilot target, without creating a universal official basic-course duty. No extra numerical pΔV/mole calculation or fixed extra-task quota is imposed.
  - Observable performance (DE): A: Nach oben gerichteter q-Pfeil, danach ein kürzerer abwärts gerichteter w_on-Pfeil; U_f liegt über U_0 und unter der rechnerischen Zwischenmarke nach q. Der direkte ΔU-Pfeil zeigt von U_0 nach U_f aufwärts: Die positive Wärmeübertragung überwiegt die negative Arbeitsübertragung. B: Zuerst eine abwärts gerichtete negative Wärmestufe, danach eine kleinere aufwärts gerichtete positive Kompressionsarbeitsstufe; der Endpegel liegt unter U_0, der direkte ΔU-Pfeil zeigt abwärts. Beide Diagramme zeigen die algebraische Summe q+w_on als wirkliche Anfangs-/Enddifferenz der inneren Energie und behalten die gewählte Vorzeichenkonvention bei. Die Teilpfeile bezeichnen Übertragungsgrößen, keine im System gespeicherten Sorten von Wärme oder Arbeit. Zwischenmarken sind Hilfen der Bilanz, keine behaupteten realen Zustände. H=U+pV enthält zusätzlich pV; ohne Angaben zur Änderung dieses Terms darf der U-Pfeil nicht pauschal als ΔH bezeichnet werden. Die Diagramme werden selbst erstellt und erläutert; ein bloßes Energie-Grenzpfeilbild oder die verbale Behauptung „Energie bleibt erhalten“ erfüllt den Darstellungsoperator nicht. Maßstäbliche Joule- oder Volumenarbeitsrechnungen sind hier keine zusätzliche Pflicht. Die ausdrücklich zusätzliche TH-Quellenanforderung für das erhöhte Anforderungsniveau (gedruckte S. 40/PDF-S. 45, rechte Tabellenspalte) verlangt ein schematisches Energiediagramm. Die historische Extraktion sourceGoals/44 bezeichnet sie GK_LK; die tatsächliche Spaltenlage weist sie jedoch dem erhöhten Niveau zu. Der Darstellungsfall bleibt innerhalb des vorhandenen breiten SkillPilot-Zielumfangs nutzbar; daraus entsteht keine universelle offizielle GK-Pflicht. Keine zusätzliche numerische pΔV-/Molrechnung und keine starre Zusatzaufgabenquote.
  - Observable performance (EN): A: q points upward, followed by a shorter downward w_on step; U_f is above U_0 and below the bookkeeping intermediate after q. The direct ΔU arrow runs upward from U_0 to U_f: positive heat transfer exceeds negative work transfer. B: a downward negative heat step is followed by a smaller upward positive compression-work step; the final level is below U_0, so the direct ΔU arrow points downward. Both diagrams show the algebraic sum q+w_on as the actual initial-to-final internal-energy difference while retaining the sign convention. Partial arrows represent transfers, not stored kinds of heat or work. Intermediate marks aid the balance rather than assert actual states. H=U+pV also includes pV, whose change must be known before relabelling the U arrow as ΔH. The learner constructs and explains the diagrams; a boundary-arrow picture or simply saying energy is conserved does not satisfy this representation operator. Scaled joule or volume-work calculations are not an additional requirement here. The explicitly additional TH source requirement for the advanced demand level (printed p. 40/PDF p. 45, right-hand table column) requires a schematic energy diagram. Historical extraction sourceGoals/44 labels it basic/advanced; the actual column placement assigns it to the advanced level. The representation remains usable within the existing broad SkillPilot target, without creating a universal official basic-course duty. No extra numerical pΔV/mole calculation or fixed extra-task quota is imposed.

**Coverage expectations**

- required expectations: `system-boundary-heat-work-state`, `source-required-th-schematic-internal-energy-diagram`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `boundary`: Offene, geschlossene und ideal isolierte Systeme haben verschiedene Austauschmöglichkeiten. / Open, closed and ideally isolated systems have different exchange possibilities.
- `mechanical-condition`: Ein beweglicher Kolben bei konstantem Außendruck wird mit einem starren Gefäß verglichen. / A movable piston at constant external pressure is contrasted with a rigid vessel.
- `actual-source-th-energy-diagram`: Die ausdrücklich zusätzliche TH-Quellenanforderung für das erhöhte Anforderungsniveau (gedruckte S. 40/PDF-S. 45, rechte Tabellenspalte) verlangt ein schematisches Energiediagramm. Die historische Extraktion sourceGoals/44 bezeichnet sie GK_LK; die tatsächliche Spaltenlage weist sie jedoch dem erhöhten Niveau zu. Der Darstellungsfall bleibt innerhalb des vorhandenen breiten SkillPilot-Zielumfangs nutzbar; daraus entsteht keine universelle offizielle GK-Pflicht. Keine zusätzliche numerische pΔV-/Molrechnung und keine starre Zusatzaufgabenquote. / The explicitly additional TH source requirement for the advanced demand level (printed p. 40/PDF p. 45, right-hand table column) requires a schematic energy diagram. Historical extraction sourceGoals/44 labels it basic/advanced; the actual column placement assigns it to the advanced level. The representation remains usable within the existing broad SkillPilot target, without creating a universal official basic-course duty. No extra numerical pΔV/mole calculation or fixed extra-task quota is imposed.

**Application cases**

- `closed-expanding-piston`
  - Task demand (DE): In einem geschlossenen Modell-Reaktionszylinder verschiebt sich der Kolben gegen konstanten Außendruck; der Systemdruck ist während der betrachteten Änderung ebenfalls konstant und mechanisch mit dem Außendruck ausgeglichen. Das System nimmt 500 J Wärme auf und leistet 200 J Volumenarbeit nach außen; andere Arbeit ist ausgeschlossen. Klassifiziere das System, bestimme ΔU und erkläre, welche Bedeutung die 500 J bei konstantem Druck für ΔH haben. Ist „geschlossen“ gleich „energieisoliert“?
  - Task demand (EN): In a closed model reaction cylinder the piston moves against constant external pressure; during the modelled change the system pressure is also constant and mechanically balanced with the external pressure. The system absorbs 500 J of heat and does 200 J of pressure–volume work on its surroundings; other work is excluded. Classify the system, find ΔU and explain what the 500 J mean for ΔH at constant pressure. Does closed mean energy-isolated?
  - Expected performance (DE): Die lernende Person erkennt keinen Stoff-, aber Energieaustausch, setzt w = −200 J und erhält ΔU = +300 J. Bei konstantem Druck und ausschließlich Volumenarbeit ist ΔH = q_p = +500 J; sie erklärt die Differenz durch pV-Arbeit und verwirft die Gleichsetzung geschlossen/isoliert sowie Wärme als im System gespeicherte Zustandsgröße.
  - Expected performance (EN): The learner identifies energy exchange without matter exchange, uses w = −200 J and obtains ΔU = +300 J. At constant pressure with only pressure–volume work, ΔH = q_p = +500 J; they explain the difference through pV work and reject both closed = isolated and heat as a stored state function.
  - Understanding focus (DE): Systemgrenze und Arbeitsvorzeichen begründen den Unterschied zwischen ΔU und ΔH.
  - Understanding focus (EN): Boundary and work signs explain the difference between ΔU and ΔH.
- `fresh-rigid-open-isolated-classification`
  - Task demand (DE): Ein unabhängiges Papierprotokoll zeigt dieselbe Reaktion in einem starren gasdichten Kalorimeter, einem offenen Becher und einem ideal gegen sämtlichen Energie- und Stoffaustausch isolierten Gesamtsystem. Dessen starre Außengrenze lässt weder Wärme noch Arbeit noch Stoff passieren; auch elektrische oder andere Arbeitsübertragung ist ausgeschlossen. Beim starren Kalorimeter werden 800 J Wärme nach außen übertragen, ohne andere Arbeit. Klassifiziere alle drei Grenzen, deute ΔU im Kalorimeter und erkläre, warum daraus ohne Zusatzdaten nicht ΔH = −800 J folgt. Welche Aussage über die gesamte innere Energie erlaubt die ausdrücklich vollständig isolierte Grenze?
  - Task demand (EN): An independent paper protocol shows the same reaction in a rigid gas-tight calorimeter, an open beaker and a total system ideally isolated against every exchange of energy and matter. Its rigid outer boundary admits neither heat nor work nor matter; electrical and other work transfer are also excluded. The rigid calorimeter releases 800 J of heat with no other work. Classify all three boundaries, interpret ΔU in the calorimeter and explain why this alone does not establish ΔH = −800 J. What statement about total internal energy follows from the explicitly fully isolated boundary?
  - Expected performance (DE): Die lernende Person unterscheidet geschlossen/offen/isoliert, erhält im starren Kalorimeter w = 0 und ΔU = q_V = −800 J und nennt Δ(pV) als fehlenden Zusammenhang zu ΔH. Für das ausdrücklich vollständig isolierte Gesamtsystem begründet sie q = 0, w = 0 und keinen Stoffaustausch: Die gesamte innere Energie bleibt unverändert, obwohl innerhalb Reaktion und Temperaturänderung stattfinden können. Sie wendet diese Aussage auf das gewählte Gesamtsystem an, nicht auf jeden inneren Teilbereich; eine nur wärme- und stoffdichte bewegliche Grenze wäre dafür unzureichend, weil noch Arbeit übertragen werden könnte.
  - Expected performance (EN): The learner distinguishes closed/open/isolated, obtains w = 0 and ΔU = q_V = −800 J for the rigid calorimeter and identifies Δ(pV) as the missing link to ΔH. For the explicitly fully isolated total system they justify q = 0, w = 0 and no matter exchange: total internal energy stays constant even though reaction and temperature changes can occur internally. They apply this claim to the chosen total system, not every internal part; a boundary that blocked heat and matter but could move would be insufficient because it could still transfer work.
  - Understanding focus (DE): Eine neue Grenze verändert die zulässige thermodynamische Aussage.
  - Understanding focus (EN): A fresh boundary changes the permissible thermodynamic claim.
- `th-internal-energy-level-diagram-heat-and-volume-work`
  - Task demand (DE): Schematischer Darstellungsauftrag für ein geschlossenes Reaktionssystem; ausschließlich Volumenarbeit, keine Stoffübertragung. Vorzeichenkonvention: q und w_on sind positiv bei Energieübertragung in das System. Zeichne ein U-Niveaudiagramm mit nach oben wachsender innerer Energie; der frei gewählte Anfangspegel U_0 ist keine absolute Energiebestimmung. Fall A: Das System nimmt Wärme auf und gibt bei Expansion Volumenarbeit ab; die aufgenommene Wärme ist größer als der Betrag der abgegebenen Arbeit. Zeichne nacheinander eine positive Wärmestufe und eine kleinere negative Arbeitsstufe als ausdrückliche Bilanzzerlegung; kennzeichne die rechnerische Zwischenmarke und den Endpegel U_f. Zeichne zusätzlich einen direkten Gesamtpfeil von U_0 nach U_f und beschrifte ihn ΔU. Begründe Pfeilrichtungen, relative Längen und Endniveau. Diese Zerlegung behauptet keinen real nacheinander ablaufenden Prozess und keinen gemessenen Zwischenzustand. Frischer Gegenfall B: Ein anderes geschlossenes System gibt Wärme ab und wird komprimiert; die zugeführte Arbeit ist kleiner als der Betrag der abgegebenen Wärme. Entwirf ein zweites passendes Niveaudiagramm und begründe das Vorzeichen von ΔU. Ein reines Gefäßbild mit Grenzpfeilen genügt nicht. Es sind keine Joulewerte, pΔV-Berechnung oder molare Skalierung verlangt. Erkläre abschließend, warum der Gesamtpfeil die Änderung von U und nicht ohne weitere Bedingungsprüfung die Änderung von H darstellt.
  - Task demand (EN): Schematic representation task for a closed reacting system with pressure–volume work only and no matter transfer. Sign convention: q and w_on are positive for energy transferred into the system. Draw an internal-energy level diagram with U increasing upward; the freely chosen initial level U_0 is not an absolute energy measurement. Case A: the system absorbs heat and transfers volume work outward during expansion; absorbed heat exceeds the magnitude of outward work. Show a positive heat step followed by a smaller negative work step as an explicit bookkeeping decomposition, marking the bookkeeping intermediate and final level U_f. Also draw a direct total arrow from U_0 to U_f labelled ΔU. Justify directions, relative lengths and final level. This decomposition claims neither a real sequence of separate processes nor a measured intermediate state. Fresh countercase B: another closed system releases heat and is compressed; incoming work is smaller than the magnitude of outgoing heat. Construct a second appropriate level diagram and justify the sign of ΔU. A vessel picture with boundary arrows alone is insufficient. No joule values, pΔV calculation or molar scaling are required. Finally explain why the total arrow represents a change in U rather than, without checking further conditions, a change in H.
  - Expected performance (DE): A: Nach oben gerichteter q-Pfeil, danach ein kürzerer abwärts gerichteter w_on-Pfeil; U_f liegt über U_0 und unter der rechnerischen Zwischenmarke nach q. Der direkte ΔU-Pfeil zeigt von U_0 nach U_f aufwärts: Die positive Wärmeübertragung überwiegt die negative Arbeitsübertragung. B: Zuerst eine abwärts gerichtete negative Wärmestufe, danach eine kleinere aufwärts gerichtete positive Kompressionsarbeitsstufe; der Endpegel liegt unter U_0, der direkte ΔU-Pfeil zeigt abwärts. Beide Diagramme zeigen die algebraische Summe q+w_on als wirkliche Anfangs-/Enddifferenz der inneren Energie und behalten die gewählte Vorzeichenkonvention bei. Die Teilpfeile bezeichnen Übertragungsgrößen, keine im System gespeicherten Sorten von Wärme oder Arbeit. Zwischenmarken sind Hilfen der Bilanz, keine behaupteten realen Zustände. H=U+pV enthält zusätzlich pV; ohne Angaben zur Änderung dieses Terms darf der U-Pfeil nicht pauschal als ΔH bezeichnet werden. Die Diagramme werden selbst erstellt und erläutert; ein bloßes Energie-Grenzpfeilbild oder die verbale Behauptung „Energie bleibt erhalten“ erfüllt den Darstellungsoperator nicht. Maßstäbliche Joule- oder Volumenarbeitsrechnungen sind hier keine zusätzliche Pflicht.
  - Expected performance (EN): A: q points upward, followed by a shorter downward w_on step; U_f is above U_0 and below the bookkeeping intermediate after q. The direct ΔU arrow runs upward from U_0 to U_f: positive heat transfer exceeds negative work transfer. B: a downward negative heat step is followed by a smaller upward positive compression-work step; the final level is below U_0, so the direct ΔU arrow points downward. Both diagrams show the algebraic sum q+w_on as the actual initial-to-final internal-energy difference while retaining the sign convention. Partial arrows represent transfers, not stored kinds of heat or work. Intermediate marks aid the balance rather than assert actual states. H=U+pV also includes pV, whose change must be known before relabelling the U arrow as ΔH. The learner constructs and explains the diagrams; a boundary-arrow picture or simply saying energy is conserved does not satisfy this representation operator. Scaled joule or volume-work calculations are not an additional requirement here.
  - Understanding focus (DE): Eine tatsächliche schematische U-Niveaudarstellung mit Wärme-/Arbeitsbeiträgen und der resultierenden Gesamtänderung erstellen und in einem anderen Vorzeichenfall eigenständig übertragen.
  - Understanding focus (EN): Construct an actual schematic U-level representation with heat/work contributions and resulting total change, then independently transfer it to a different sign case.
## Page 15: Gesellschaftliche Folgen der Wirkstoffentwicklung historisch und aktuell bewerten

- Full learning-goal ID: `4965395d-e0c5-5e23-a408-a11712aab409`
- Goal fingerprint: `sha256:9bde66bc22bd5a5c4e664646baf41ee6f0a760aaa50d965901c8c5a7c7478e2d`
- Page fingerprint: `sha256:3ea041b2288a08725ba160b795e61ff92ef328f688283a2fd3518cbf41089066`
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
## Page 16: Qualitätskontrolle von Arzneimitteln an Belegen beurteilen

- Full learning-goal ID: `4a7dee38-1056-5e27-acec-e6a12f58109f`
- Goal fingerprint: `sha256:1dadb8c105a2e71dab7765573e528cacfb3435492020ee871abcbe5f4071e626`
- Page fingerprint: `sha256:d90af18f714dfb530d269289c055f00b11760758bb272ee2a6ba138e7a1abc6a`
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
## Page 17: Die Aussagekraft chemischer Daten beurteilen

- Full learning-goal ID: `4aa3a130-b517-5ac5-87b2-147fe432cadd`
- Goal fingerprint: `sha256:e66d637f6a24d6598da4d720f9f9cd4308c43541fb974bc6a72d856c6c04acdd`
- Page fingerprint: `sha256:adf72ab00c081634e60b57bbc0e71e5de81d593941e69cfd714e38c89a5185bd`
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
## Page 18: Starke Säuren mittels eigener digitaler pH-Titration bestimmen

- Full learning-goal ID: `4bd54a18-8dd2-59db-bddf-b4c34a10ba79`
- Goal fingerprint: `sha256:60a3e15585d0f668d6c685ee19fe688a781ab1103b72274ab788c715f4d4a77f`
- Page fingerprint: `sha256:8f6b34307613279c7db73127077fc6749ea0b5593e4869a5336029022140c020`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann eine quantitative Titration einer starken einprotonigen Säure mit begründeter Maßlösung planen und unter fachlicher Aufsicht selbst durchführen, zugehörige eigene Volumen- und pH-Messwerte mit geeigneter pH-Erfassung dokumentieren, diese mit digitalen Werkzeugen als numerische XY-Titrationskurve darstellen und daraus die Probenkonzentration stöchiometrisch bestimmen sowie Endpunktbeobachtung, Äquivalenzbereich und Messunsicherheit begründet unterscheiden.

### Visualization

/assets/goal-visualizations/chemie/4bd54a18-8dd2-59db-bddf-b4c34a10ba79/4bd54a18-8dd2-59db-bddf-b4c34a10ba79.png

- original digest: `sha256:6fab7c2a037327902b741abcbd38a43c9e30a4b177677a57e4cee3b8eab76429`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Allgemeine Sicherheitsregeln im Chemielabor anwenden — `13d4f336-ab16-54a7-9479-c920b458f385` (outside this book)
- Brønsted-Konzept anwenden — `1c1420c2-a8e2-520f-8015-6df637a973bd` (outside this book)
- Stoffmenge und Einheit Mol nutzen — `1dc15fa2-fca4-56b0-b5c1-4d215613dde0` (outside this book)

### Direct reverse prerequisites outside this book

- Prüfung: Starke Säuren mittels eigener digitaler pH-Titration bestimmen — `11837e4e-71bc-5374-892e-6c8cd4f0c29b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:9b6f06dbf1f596e5f0bb0d270c590f4bbafd62a2572581b60ff9b6e4188bdf42`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E0`; maximum claim scope: `G0`
Archetype: `experiment`

**Positive understanding expectations**

- `plan-own-quantitative-execution`
  - Essential understanding (DE): Eigene Planung und Durchführung mit geeigneter Maßlösung, geeignet erfassten pH-Werten und prüfbarer Rohquelle sind nötig; Planung oder Sollkurve allein genügt nicht.
  - Essential understanding (EN): Personal planning and execution with a suitable standard solution, suitable pH readings and a checkable raw source are required; a plan or ideal curve alone is insufficient.
  - Observable performance (DE): Nutze den eigenen begründeten Titrationsplan und die tatsächliche eigene Durchführung für starke einprotonige Säure und bekannte NaOH-Maßlösung. Erforderlich sind echte Bürettenstände/zugegebene Volumina, Probenvolumen, Maßlösungskonzentration, Indikatorbeobachtung und eine unter Lehrkraftfreigabe tatsächlich aufgenommene Folge zugehöriger pH-Werte. Falls diese pH-Folge im alten Protokoll fehlt, muss sie erst real in der freigegebenen Untersuchung erfasst werden; eine gegebene Kurve oder idealisierte Simulation ersetzt sie nicht. Handübertragung vorhandener echter Messpaare ist zulässig; Sensorautomation, Export oder synchrones Logging sind keine zusätzliche Pflicht. Keine neuen Chemikalien oder Durchführungsschritte werden hier angeordnet.
  - Observable performance (EN): Use the personally justified titration plan and actual own execution for a strong monoprotic acid and a known NaOH standard solution. Required records are genuine burette readings/added volumes, sample volume, titrant concentration, indicator observation and a corresponding sequence of pH values actually acquired under teacher release. If the old record lacks that pH sequence, it must first be obtained in the released investigation; a supplied curve or idealised simulation cannot replace it. Checked manual transcription of genuine recorded pairs is allowed; automated sensors, export and synchronous logging are not added requirements. No new chemicals or practical procedure are prescribed here.
- `digital-xy-amount-and-uncertainty`
  - Essential understanding (DE): Die eigene digitale Datei mit überprüfbarer Rohquelle ist der Leistungsbeleg, nicht ein fertiger Autorenplot. Eine kategorial gleichabständige x-Achse darf ungleiche Volumenschritte nicht verzerren. Aus endlich weit auseinanderliegenden pH-Punkten folgt ein begrenzter Bereich, kein mathematisch exakter Äquivalenzpunkt. Die Konzentrationsbestimmung bezieht verbrauchte Maßlösung über das stöchiometrische Stoffmengenverhältnis auf das ursprüngliche Probevolumen. Eine gute digitale Darstellung beweist für sich keine tatsächliche Laborhandlung; dafür ist der eigene praktische Beleg dieses neuen Zielkandidaten erforderlich.
  - Essential understanding (EN): The personal digital file with a checkable raw source is the performance evidence, not an author-supplied plot. An evenly spaced categorical x-axis must not distort unequal volume steps. Finitely separated pH points support a bounded region rather than an exact mathematical equivalence point. Concentration determination relates consumed titrant through reaction amount ratio to the original sample volume. A good digital plot alone does not establish actual laboratory execution; the practical evidence for this new goal candidate remains required.
  - Observable performance (DE): Erstelle selbst eine digitale Datei aus diesen eigenen Messpaaren. Bewahre die unveränderte Rohquelle und dokumentiere Übertragung, Einheiten und begründete Korrekturen. Zeichne ein beschriftetes numerisches XY-Diagramm: wirklich zugegebenes Maßlösungsvolumen auf x, gemessener pH auf y; ungleiche Volumenschritte müssen sichtbar bleiben. Beschreibe den gemessenen Kurvenverlauf und begrenze den steilen Bereich aus den tatsächlich vorhandenen Punkten. Vergleiche die Indikatorbeobachtung mit diesem Bereich und begründe die für die Konzentrationsbestimmung verwendete Volumengrenze. Rechne mit der passenden Reaktionsstöchiometrie und dem ursprünglichen Probenvolumen; trenne beobachteten Endpunkt und Äquivalenzbegriff und benenne die Mess-/Ablesegrenze.
  - Observable performance (EN): Create your own digital file from these personal measurement pairs. Retain the unchanged raw source and document transcription, units and justified corrections. Make a labelled numeric XY plot with genuinely added titrant volume on x and measured pH on y; unequal volume steps must remain visible. Describe the measured curve and bound its steep region using the points actually available. Compare the indicator observation with that region and justify the volume bound used for concentration determination. Use the appropriate reaction stoichiometry and original sample volume; distinguish observed endpoint from equivalence and state measurement/reading limits.
- `independent-digital-source-correction`
  - Essential understanding (DE): Volumeneinheit und Originaleintrag kontrollieren, keine Wunschkurve erzeugen. Den zehnfach zu kleinen Schritt korrigieren, die wirkliche kumulative Volumenskala im XY-Diagramm verwenden und den steilen Bereich sowie die daraus verwendete Volumengrenze neu beurteilen. Falls Konzentration/Unsicherheit davon abhängen, auch diese begründet neu berechnen. Eine fremde Sollkurve ist keine Rohquelle.
  - Essential understanding (EN): Check units and original record without manufacturing a desired curve. Correct the tenfold-small step, use genuine cumulative volume coordinates in an XY plot and reassess the steep region and chosen volume bound. If concentration/uncertainty depends on it, recompute them with reasons. An external ideal curve is not a raw measurement source.
  - Observable performance (DE): Frischer Dateifehler: Ein echter Volumenschritt von 0,20 mL wurde mit 0,02 mL eingetragen; zusätzlich behandelt ein Liniendiagramm alle Messpunkte als gleich weit auseinander. Prüfe die digitale Datei an der unveränderten eigenen Rohquelle und begründe die Korrektur. Wie verändern sich Darstellung und belegbarer Endpunktbereich?
  - Observable performance (EN): Fresh file defect: a genuine 0.20mL volume step was entered as0.02mL, while a line chart treats all records as equally spaced. Check the digital file against the unchanged personal raw source and justify correction. How do the plot and supported endpoint bounds change?

**Coverage expectations**

- required expectations: `plan-own-quantitative-execution`, `digital-xy-amount-and-uncertainty`, `independent-digital-source-correction`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `raw-origin-and-real-volume-axis`: Frischer Dateifehler: Ein echter Volumenschritt von 0,20 mL wurde mit 0,02 mL eingetragen; zusätzlich behandelt ein Liniendiagramm alle Messpunkte als gleich weit auseinander. Prüfe die digitale Datei an der unveränderten eigenen Rohquelle und begründe die Korrektur. Wie verändern sich Darstellung und belegbarer Endpunktbereich? / Fresh file defect: a genuine 0.20mL volume step was entered as0.02mL, while a line chart treats all records as equally spaced. Check the digital file against the unchanged personal raw source and justify correction. How do the plot and supported endpoint bounds change?

**Application cases**

- `actual-strong-acid-digital-curve`
  - Task demand (DE): curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-five-P-scope-operator-remediation-author-20261018-v1/AUTHOR.complete-DE-EN-material-routes.pending.json#/materials/5. Erstelle selbst eine digitale Datei aus diesen eigenen Messpaaren. Bewahre die unveränderte Rohquelle und dokumentiere Übertragung, Einheiten und begründete Korrekturen. Zeichne ein beschriftetes numerisches XY-Diagramm: wirklich zugegebenes Maßlösungsvolumen auf x, gemessener pH auf y; ungleiche Volumenschritte müssen sichtbar bleiben. Beschreibe den gemessenen Kurvenverlauf und begrenze den steilen Bereich aus den tatsächlich vorhandenen Punkten. Vergleiche die Indikatorbeobachtung mit diesem Bereich und begründe die für die Konzentrationsbestimmung verwendete Volumengrenze. Rechne mit der passenden Reaktionsstöchiometrie und dem ursprünglichen Probenvolumen; trenne beobachteten Endpunkt und Äquivalenzbegriff und benenne die Mess-/Ablesegrenze.
  - Task demand (EN): curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-five-P-scope-operator-remediation-author-20261018-v1/AUTHOR.complete-DE-EN-material-routes.pending.json#/materials/5. Create your own digital file from these personal measurement pairs. Retain the unchanged raw source and document transcription, units and justified corrections. Make a labelled numeric XY plot with genuinely added titrant volume on x and measured pH on y; unequal volume steps must remain visible. Describe the measured curve and bound its steep region using the points actually available. Compare the indicator observation with that region and justify the volume bound used for concentration determination. Use the appropriate reaction stoichiometry and original sample volume; distinguish observed endpoint from equivalence and state measurement/reading limits.
  - Expected performance (DE): Die eigene digitale Datei mit überprüfbarer Rohquelle ist der Leistungsbeleg, nicht ein fertiger Autorenplot. Eine kategorial gleichabständige x-Achse darf ungleiche Volumenschritte nicht verzerren. Aus endlich weit auseinanderliegenden pH-Punkten folgt ein begrenzter Bereich, kein mathematisch exakter Äquivalenzpunkt. Die Konzentrationsbestimmung bezieht verbrauchte Maßlösung über das stöchiometrische Stoffmengenverhältnis auf das ursprüngliche Probevolumen. Eine gute digitale Darstellung beweist für sich keine tatsächliche Laborhandlung; dafür ist der eigene praktische Beleg dieses neuen Zielkandidaten erforderlich.
  - Expected performance (EN): The personal digital file with a checkable raw source is the performance evidence, not an author-supplied plot. An evenly spaced categorical x-axis must not distort unequal volume steps. Finitely separated pH points support a bounded region rather than an exact mathematical equivalence point. Concentration determination relates consumed titrant through reaction amount ratio to the original sample volume. A good digital plot alone does not establish actual laboratory execution; the practical evidence for this new goal candidate remains required.
  - Understanding focus (DE): Eigener vollständiger quantitativer pH-/Digital-Untersuchungsablauf.
  - Understanding focus (EN): Personal complete quantitative pH/digital investigation.
- `digital-volume-axis-fresh-transfer`
  - Task demand (DE): Frischer Dateifehler: Ein echter Volumenschritt von 0,20 mL wurde mit 0,02 mL eingetragen; zusätzlich behandelt ein Liniendiagramm alle Messpunkte als gleich weit auseinander. Prüfe die digitale Datei an der unveränderten eigenen Rohquelle und begründe die Korrektur. Wie verändern sich Darstellung und belegbarer Endpunktbereich?
  - Task demand (EN): Fresh file defect: a genuine 0.20mL volume step was entered as0.02mL, while a line chart treats all records as equally spaced. Check the digital file against the unchanged personal raw source and justify correction. How do the plot and supported endpoint bounds change?
  - Expected performance (DE): Volumeneinheit und Originaleintrag kontrollieren, keine Wunschkurve erzeugen. Den zehnfach zu kleinen Schritt korrigieren, die wirkliche kumulative Volumenskala im XY-Diagramm verwenden und den steilen Bereich sowie die daraus verwendete Volumengrenze neu beurteilen. Falls Konzentration/Unsicherheit davon abhängen, auch diese begründet neu berechnen. Eine fremde Sollkurve ist keine Rohquelle.
  - Expected performance (EN): Check units and original record without manufacturing a desired curve. Correct the tenfold-small step, use genuine cumulative volume coordinates in an XY plot and reassess the steep region and chosen volume bound. If concentration/uncertainty depends on it, recompute them with reasons. An external ideal curve is not a raw measurement source.
  - Understanding focus (DE): Neue überprüfbare Datei-/Koordinatenkorrektur mit Mengenbezug.
  - Understanding focus (EN): Fresh checkable file/coordinate correction with concentration reference.
## Page 19: Triphenylmethanfarbstoff-Synthese mechanistisch darstellen

- Full learning-goal ID: `53db04a0-ea76-5810-9526-c8639100e497`
- Goal fingerprint: `sha256:22652fd19fca2ba96da08b964a2880b43ce14a034fbedbdaa0af66a7fb1306ae`
- Page fingerprint: `sha256:cc695deb3421ecf2755d8cb3cb96f2ffe9f70397f1a7f9a78853fac310fa7985`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann die vollständige Syntheseroute eines Triphenylmethanfarbstoffs aus einem aromatischen Aldehyd und aktivierten aromatischen Kupplungspartnern über säurekatalysierte Kondensation zur Leukoverbindung und anschließende Oxidation zum Farbstoffkation auf Teilchenebene mechanistisch darstellen und die Reaktions- und Ladungsbilanz erklären.

### Visualization

/assets/goal-visualizations/chemie/53db04a0-ea76-5810-9526-c8639100e497/53db04a0-ea76-5810-9526-c8639100e497.png

- original digest: `sha256:333611b58af74d954a489cb85f697d07fec80afbfdfce0f7d9b2ca7429eef496`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Warum Chemie? - Relevanz und Orientierung — `a9c22adc-b543-5b0c-a2d8-3189facdff08` (outside this book)
- Elektrophile Substitution am Aromaten modellieren — `17ab1148-7383-5cab-8b91-73aff795f1e4` (outside this book)
- Brønsted-Konzept anwenden — `1c1420c2-a8e2-520f-8015-6df637a973bd` (outside this book)
- Oxidationszahlen bestimmen und bilanzieren — `4961130b-1ee8-58f2-a319-dff0a864db6a` (outside this book)

### Direct reverse prerequisites outside this book

- Übung: Triphenylmethanfarbstoff-Synthese mechanistisch darstellen — `c8d83dac-839d-561f-a85d-a3e1dfbc506b` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:1c3fbfd48c4798e2422797db89f66275da136d9c1a92fe011d655ecfc74566c5`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `procedure`

**Positive understanding expectations**

- `e2`
  - Essential understanding (DE): Eine Triphenylmethanroute koppelt zweimal einen aktivierten Aromaten an ein Carbonylkohlenstoffzentrum und erzeugt den Farbstoff erst durch Oxidation der Leukoverbindung.
  - Essential understanding (EN): A triphenylmethane route attaches two activated arenes to a carbonyl carbon and produces the dye only after oxidizing the leuco compound.
  - Observable performance (DE): Stellt die Kondensationsschritte und ladungsbilanzierte Oxidation dar.
  - Observable performance (EN): Represents condensation steps and charge-balanced oxidation.

**Coverage expectations**

- required expectations: `e2`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `v1`: Aromatischer Aldehydrest / Aromatic aldehyde residue
- `v2`: Leukoverbindung, Farbstoffkation und Oxidationsbilanz / Leuco compound, dye cation and oxidation balance

**Application cases**

- `53db04a0-case-1`
  - Task demand (DE): Nur Papiermechanismen, keine Ausführung. Triarylmethan: Ph–CHO + 2 Ar–H, Ar–H=N,N-Dimethylanilin, Angriff jeweils para zum –N(CH₃)₂. Säurekatalyse liefert Ph–CH(Ar)₂; anschließende Oxidation liefert [Ph–C(Ar)₂]⁺.
1. Stelle für Ph–CHO die Carbonylprotonierung, zwei para-Angriffe von Ar–H mit Wasserabspaltung zwischen ihnen und die jeweilige Rearomatisierung dar; schreibe Kondensationsgleichung und Oxidationshalbreaktion.
  - Task demand (EN): Paper mechanisms only, no execution. Triarylmethane: Ph–CHO + 2 Ar–H, with Ar–H=N,N-dimethylaniline and each attack para to –N(CH₃)₂. Acid catalysis gives Ph–CH(Ar)₂; oxidation then gives [Ph–C(Ar)₂]⁺.
1. Show carbonyl protonation, two para attacks by Ar–H with water loss between them and each rearomatization; write the condensation equation and oxidation half-equation.
  - Expected performance (DE): 1. O-Protonierung ergibt Ph–CH=OH⁺. Ring-π→Carbonyl-C und C=O-π→O erzeugen den ersten Ring-σ-Komplex; Deprotonierung liefert Ph–CH(OH)–Ar. OH-Protonierung und C–O→O lassen H₂O abgehen: Ph–CH(Ar)⁺. Zweiter Ring-π-Angriff und Ring-H⁺-Abgabe liefern Ph–CH(Ar)₂. Gesamt: PhCHO+2 ArH→PhCH(Ar)₂+H₂O. Oxidation: PhCH(Ar)₂→[PhC(Ar)₂]⁺+H⁺+2e⁻ (Ladung 0=+1+1−2).
  - Expected performance (EN): 1. O protonation gives Ph–CH=OH⁺. Ring pi→carbonyl C and C=O pi→O produce the first ring sigma complex; deprotonation gives Ph–CH(OH)–Ar. OH protonation and C–O→O release H₂O, giving Ph–CH(Ar)⁺. A second ring pi attack and ring H⁺ loss give Ph–CH(Ar)₂. Overall: PhCHO+2 ArH→PhCH(Ar)₂+H₂O. Oxidation: PhCH(Ar)₂→[PhC(Ar)₂]⁺+H⁺+2e⁻, with 0=+1+1−2 charge.
  - Understanding focus (DE): Eine Triphenylmethanroute koppelt zweimal einen aktivierten Aromaten an ein Carbonylkohlenstoffzentrum und erzeugt den Farbstoff erst durch Oxidation der Leukoverbindung.
  - Understanding focus (EN): A triphenylmethane route attaches two activated arenes to a carbonyl carbon and produces the dye only after oxidizing the leuco compound.
- `53db04a0-case-2`
  - Task demand (DE): Papiermodell: Die Route verwendet p-CH₃–C₆H₄–CHO + 2 N,N-Dimethylanilin. Bezeichne p-CH₃–C₆H₄ als R und den para-gekoppelten Dimethylaminophenylrest als Ar. Gegenionen sind Zuschauer; keine Stoffe werden hergestellt. Die Papierroute ist bei X = R–CH(OH)–Ar nach dem ersten Ringangriff und seiner Rearomatisierung unterbrochen. Ein fehlerhafter Routenentwurf nennt X die fertige Leukoverbindung und will danach nur die Oxidationsstufe der Leukoverbindung R–CH(Ar)₂ verwenden, um [R–C(Ar)₂]⁺ zu erhalten. Zu prüfen ist nur diese angegebene Route; andere mögliche Oxidationsprodukte von X sind nicht gefragt.
1. Übertrage die säurekatalysierte Carbonylroute auf R–CHO: zeige beide Ringangriffe, Protonierungs- und Wasserabspaltungsschritte sowie die Oxidation von R–CH(Ar)₂; unterscheide Leukoverbindung und Farbstoffkation.
2. Prüfe den Routenentwurf für X: Begründe anhand der gebundenen Arylreste und der OH-Gruppe, ob X bereits die Leukoverbindung ist. Erkläre, ob die Oxidationshalbreaktion dieser Leukoverbindung allein die noch fehlende Aryl-C–C-Bindung erzeugen kann. Benenne und begründe die noch nötigen Stufen bis zum vorgesehenen Farbstoffkation und korrigiere ihre Reihenfolge.
  - Task demand (EN): Paper model: The route uses p-CH₃–C₆H₄–CHO + 2 N,N-dimethylaniline. Write R for p-CH₃–C₆H₄ and Ar for the para-attached dimethylaminophenyl residue. Counterions are spectators; no substances are made. The paper route is interrupted at X = R–CH(OH)–Ar after the first arene attack and its rearomatization. An incorrect route draft calls X the completed leuco compound and then proposes only the oxidation step of the leuco compound R–CH(Ar)₂ to obtain [R–C(Ar)₂]⁺. Assess only this stated route; other possible oxidation products of X are not requested.
1. Transfer the acid-catalyzed carbonyl route to R–CHO: show both ring attacks, protonation and water-loss steps and oxidation of R–CH(Ar)₂; distinguish the leuco compound from the dye cation.
2. Assess the route draft for X: use the attached aryl groups and the OH group to justify whether X is already the leuco compound. Explain whether that leuco compound oxidation half-equation alone can create the still missing aryl C–C bond. Identify and justify the remaining stages up to the intended dye cation and correct their order.
  - Expected performance (DE): 1. R–CH=OH⁺ wird vom Ring-π-Paar angegriffen, C=O-π→O; nach Ringdeprotonierung entsteht R–CH(OH)–Ar. OH-Protonierung, H₂O-Abgabe und zweiter Ringangriff ergeben nach erneuter Ringdeprotonierung R–CH(Ar)₂. RCHO+2ArH→RCH(Ar)₂+H₂O. RCH(Ar)₂→[RC(Ar)₂]⁺+H⁺+2e⁻ ist ladungsbilanziert. Der sp³-Leukokohlenstoff unterbricht die ausgedehnte Kopplung; das sp²-Kation ermöglicht donorstabilisierte delokalisierte Formen.
2. X trägt am zentralen C nur R und einen Ar-Rest sowie H und OH; die neutrale Leukoverbindung R–CH(Ar)₂ trägt dagegen drei Arylreste und keine OH-Gruppe. X ist daher die Zwischenstufe nach der ersten Addition und noch nicht die fertige Leukoverbindung. Die angegebene Leuko-Oxidationshalbreaktion verändert die zentrale H-Besetzung und die Ladungs-/Elektronenbilanz; sie fügt keinen Ar-Rest hinzu und kann die fehlende Aryl-C–C-Bindung nicht erzeugen. Im vorgegebenen Routenmodell fehlen zunächst OH-Protonierung und H₂O-Abgabe zu R–CH(Ar)⁺, dann der zweite Ar–H-Ringangriff und die Rearomatisierung durch Ring-H⁺-Abgabe zu R–CH(Ar)₂. Erst danach passt die Oxidation zu [R–C(Ar)₂]⁺ mit H⁺ + 2e⁻ (Ladung 0 = +1 +1 −2). Eine unbekannte alternative Oxidation von X wird damit nicht vorhergesagt.
  - Expected performance (EN): 1. Ring pi attacks R–CH=OH⁺ while C=O pi moves to O; ring deprotonation gives R–CH(OH)–Ar. OH protonation, water loss and second ring attack give R–CH(Ar)₂ after another ring deprotonation. RCHO+2ArH→RCH(Ar)₂+H₂O. RCH(Ar)₂→[RC(Ar)₂]⁺+H⁺+2e⁻ balances charge. The sp³ leuco carbon interrupts extended coupling; the sp² cation supports donor-stabilized delocalized contributors.
2. At its central C, X has only R and one Ar residue together with H and OH; the neutral leuco compound R–CH(Ar)₂ instead has three aryl residues and no OH group. X is therefore the intermediate after the first addition, not the completed leuco compound. The stated leuco oxidation half-equation changes the central H occupancy and the charge/electron balance; it adds no Ar residue and cannot create the missing aryl C–C bond. In the supplied route model, OH protonation and loss of H₂O to give R–CH(Ar)⁺ are still needed, followed by the second Ar–H arene attack and rearomatization by ring-H⁺ loss to R–CH(Ar)₂. Only then does oxidation to [R–C(Ar)₂]⁺ with H⁺ + 2e⁻ apply (charge 0 = +1 +1 −2). This makes no prediction about an unknown alternative oxidation of X.
  - Understanding focus (DE): Eine Triphenylmethanroute koppelt zweimal einen aktivierten Aromaten an ein Carbonylkohlenstoffzentrum und erzeugt den Farbstoff erst durch Oxidation der Leukoverbindung.
  - Understanding focus (EN): A triphenylmethane route attaches two activated arenes to a carbonyl carbon and produces the dye only after oxidizing the leuco compound.
## Page 20: Energieprofile chemischer Reaktionen deuten

- Full learning-goal ID: `542d88e9-4cd3-5f90-bd20-b50ab030d72a`
- Goal fingerprint: `sha256:6c9da2522ba93060ec7800dc4f03861aa336e5f201e30ab004d7fd8f730700a1`
- Page fingerprint: `sha256:5cbc299cad77a57fbfbfd0e70402c13c778ddb92a33092be2cb212664239a755`
- Topic path: Vollständige technische Review-Basis (450 Kompetenzen)

### Canonical description

Die lernende Person kann Energieänderungen chemischer Reaktionen klassifizieren und Energieprofile auch für katalysierte Reaktionen grafisch darstellen und deuten.

### Visualization

/assets/goal-visualizations/chemie/542d88e9-4cd3-5f90-bd20-b50ab030d72a/542d88e9-4cd3-5f90-bd20-b50ab030d72a.jpg

- original digest: `sha256:a3a8f4d3ec0717958226a593732fb802aa2d39b6297127d7e0fc3affa280a024`
- QA status: `review_candidate`
- approved for public publication: `false`

### Direct prerequisites

- None

### Direct reverse prerequisites

- None

### Prerequisites outside this book

- Exotherme und endotherme Reaktionen unterscheiden — `1286f2fe-89b7-4454-8e11-85b6abd6e278` (outside this book)

### Direct reverse prerequisites outside this book

- Katalysatoreinsatz technisch und ökologisch bewerten — `00c647e8-0858-5640-b9da-76d85d528820` (outside this book)
- Aktivierungsenergie und Katalysatorwirkung erklären — `945d69d5-92a7-5195-8f78-4e56f8e7b633` (outside this book)

### Evidence-profile candidate

Status: `needs_human_review`; profile fingerprint: `sha256:9d0308fb05b0c0ec5fa62e956f6377e4409b8af6df543b4a2024fca7cfeae77b`
Contract: `positive-understanding-evidence-v2`; authority: `ai_candidate`; evidence level: `E1`; maximum claim scope: `G1`
Archetype: `representation`

**Positive understanding expectations**

- `energy-levels-barrier-and-catalyst-path`
  - Essential understanding (DE): Im Energieprofil bestimmt die Lage der Produkt- relativ zur Eduktenergie exotherm oder endotherm. Der höchste Punkt über dem Eduktniveau kennzeichnet die Aktivierungsbarriere; ein katalysierter Weg kann sie senken, während Anfangs- und Endniveau gleich bleiben.
  - Essential understanding (EN): In an energy profile, the product level relative to the reactant level determines exothermic or endothermic change. The peak above the reactant level represents the activation barrier; a catalyzed path may lower it while leaving initial and final levels unchanged.
  - Observable performance (DE): Die lernende Person stellt für vorgegebene qualitative Energielagen ein Profil mit beschrifteten Achsen, Edukten, Produkten und Barriere dar, ordnet die Energieänderung ein und deutet einen alternativen katalysierten Weg ohne Änderung der Reaktionsenergie.
  - Observable performance (EN): Given qualitative energy levels, the learner constructs a profile with labeled axes, reactants, products, and barrier, classifies the energy change, and interprets an alternative catalyzed path without changing reaction energy.

**Coverage expectations**

- required expectations: `energy-levels-barrier-and-catalyst-path`
- alternative expectation groups: None
- minimum independent demonstrations: 2
- fresh variation required: true
- independent transfer required: true

**Variation axes**

- `energy-direction`: Exotherme und endotherme Endniveaus wechseln. / Exothermic and endothermic final levels alternate.
- `path`: Unkatalysierter und katalysierter Reaktionsweg werden verglichen. / Uncatalyzed and catalyzed reaction paths are compared.

**Application cases**

- `exothermic-profile-construction`
  - Task demand (DE): Ein neuer Text beschreibt eine Reaktion mit Produkten auf niedrigerem Energieniveau als die Edukte und einer deutlich höheren Zwischenbarriere. Zeichne ein qualitatives Energieprofil, kennzeichne Energieänderung und Aktivierungsenergie und ergänze einen katalysierten Weg.
  - Task demand (EN): A fresh text describes a reaction whose products lie below the reactants in energy and whose intermediate barrier is considerably higher. Draw a qualitative energy profile, mark reaction energy change and activation energy, and add a catalyzed path.
  - Expected performance (DE): Die lernende Person zeichnet eine Energie- und Reaktionsverlaufsachse, ein niedrigeres Produktniveau und eine Barriere oberhalb der Edukte. Die katalysierte Kurve hat einen niedrigeren Gipfel, aber dieselben Anfangs- und Endniveaus; die Reaktion bleibt exotherm.
  - Expected performance (EN): The learner labels energy and reaction-progress axes, places products below reactants, and shows a peak above the reactants. The catalyzed curve has a lower peak but the same initial and final levels; the reaction remains exothermic.
  - Understanding focus (DE): Reaktionsenergie und Aktivierungsbarriere werden getrennt codiert.
  - Understanding focus (EN): Reaction energy and activation barrier are encoded separately.
- `fresh-endothermic-claim-check`
  - Task demand (DE): In einem unabhängig vorgelegten endothermen Fall liegt das Produktniveau höher. Eine Skizze zeigt mit Katalysator einen niedrigeren Gipfel, aber zusätzlich ein Produktniveau unter den Edukten. Prüfe die Skizze und korrigiere sie mit Begründung.
  - Task demand (EN): In an independently supplied endothermic case, the products are at a higher level. A sketch shows a lower peak with a catalyst but also places the products below the reactants. Check and correct the sketch with reasons.
  - Expected performance (DE): Die lernende Person hält das höhere Produktniveau bei beiden Wegen fest, senkt nur die Barriere und erklärt, dass der Katalysator die Energiedifferenz und damit die Einordnung als endotherm nicht ändert.
  - Expected performance (EN): The learner keeps products above reactants for both paths, lowers only the barrier, and explains that the catalyst does not change the energy difference or the endothermic classification.
  - Understanding focus (DE): Ein veränderter Weg darf die Anfangs-/Endbilanz nicht verfälschen.
  - Understanding focus (EN): A changed path must not distort the initial-to-final balance.

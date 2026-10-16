import json, pathlib, re, hashlib, datetime

ROOT = pathlib.Path(__file__).resolve().parent
BASE = ROOT.parent / 'chemie-equilibrium16-final-PNG-current422-native-preparation-technical-20261015-v2/native-sixteen'
first = (ROOT / 'D-FIRST.independent-science.md').read_text()
seal = json.loads((ROOT / 'D-FIRST.seal.json').read_text())
assert hashlib.sha256(first.encode()).hexdigest() == seal['sha256']
chunks = re.split(r'\n## \d+\. ', first)[1:]
source = json.loads((BASE / 'round-a/description-review-input.json').read_text())
campaign = json.loads((BASE / 'round-a/description-review-campaign.json').read_text())
bundle = json.loads((BASE / 'round-a/review-bundle-manifest.json').read_text())

# Bilingual serialization of the competence-specific chains already sealed in FIRST.
chains = [
('Sättigung ist dynamisch; die stöchiometrischen Aktivitäten im Löslichkeitsprodukt bestimmen die Löslichkeit. Verschiedene Salzstöchiometrien erlauben keine Rangfolge aus KL allein.',
 'Saturation is dynamic; stoichiometric activities in the solubility product determine solubility. Different salt stoichiometries prevent ranking by Ksp alone.',
 'Die lernende Person leitet AgCl- und CaF2-Ausdrücke und Löslichkeiten her, berücksichtigt Mischverdünnung vor dem Q-Vergleich und erklärt den Gleichioneffekt bei unverändertem KL.',
 'The learner derives AgCl and CaF2 expressions and solubilities, accounts for mixing dilution before comparing Q, and explains the common-ion effect at unchanged Ksp.',
 'Bei geänderter Salzstöchiometrie oder Verdünnung mit zuvor entferntem Bodenkörper wird die Sättigungsargumentation selbstständig neu aufgebaut.',
 'With changed salt stoichiometry or dilution after removing excess solid, the learner independently reconstructs the saturation argument.'),
('Elektronenübertragung und vorzeichenrichtige Wärmebilanz beschreiben denselben Stoffumsatz unter einer festgelegten System- und Arbeitsgrenze.',
 'Electron transfer and a signed heat balance describe the same conversion under defined system and work boundaries.',
 'Die lernende Person konstruiert Teilgleichungen und einen sicheren kontrollierten Messplan, berechnet 887,4 J und etwa −222 kJ/mol Cu2+-Umsatz und trennt Wärmeverlust von unvollständigem Umsatz.',
 'The learner constructs half-reactions and a safe controlled measurement plan, calculates 887.4 J and about −222 kJ/mol Cu2+ conversion, and separates heat loss from incomplete conversion.',
 'Bei räumlich getrennter Redoxreaktion in einer belasteten galvanischen Zelle begründet sie, welche elektrische Arbeit durch eine reine Wärmemessung nicht erfasst wird.',
 'For spatially separated redox conversion in a loaded galvanic cell, the learner explains which electrical work a heat-only measurement misses.'),
('Elektronische und ionische Leitwege koppeln anodische Auflösung an kathodische Reduktion; Opferanoden schützen durch bevorzugte eigene Oxidation.',
 'Electronic and ionic paths couple anodic dissolution to cathodic reduction; sacrificial anodes protect through their preferential oxidation.',
 'Die lernende Person erklärt beschädigte Zn-/Sn-Schichten mit Teilgleichungen, Flächeneffekten und geschlossenen Leitwegen und trennt thermodynamische Richtung von Korrosionsrate.',
 'The learner explains damaged Zn/Sn coatings through half-reactions, area effects and closed conducting paths, and distinguishes thermodynamic direction from corrosion rate.',
 'Für sauerstoffarmes saures Medium oder Fremdstromschutz werden kathodische Reaktion, Polung und Schutzbedingungen neu begründet.',
 'For oxygen-poor acid or impressed-current protection, the learner rederives the cathodic reaction, polarity and protection conditions.'),
('Zur selben formulierten Zellreaktion gehören das stöchiometrische Q, die Elektronenzahl n und die reversible Spannung; offene und belastete Zelle sind zu unterscheiden.',
 'The stoichiometric Q, electron number n and reversible voltage refer to the same written cell reaction; open-circuit and loaded conditions differ.',
 'Die lernende Person leitet Polung, Q und 59,16 mV beziehungsweise 1,04084 V her und erklärt die Spannungsinvarianz beim Verdoppeln aller Reaktionskoeffizienten.',
 'The learner derives polarity, Q and 59.16 mV or 1.04084 V and explains voltage invariance when all reaction coefficients are doubled.',
 'Aus einer neuen hochohmig gemessenen Spannung wird unter angegebenen Modellbedingungen eine unbekannte Metallionenaktivität hergeleitet; die jeweilige Kursgrenze bleibt erhalten.',
 'From a new high-impedance voltage measurement, the learner derives an unknown metal-ion activity under stated model conditions while retaining the applicable course boundary.'),
('Eine prüfbare kinetische Hypothese benötigt Variablenkontrolle und eine geeignete Ratenmessgröße; Gasfreisetzung, Endumsatz und Rate sind verschiedene Aussagen.',
 'A testable kinetic hypothesis requires variable control and a suitable rate measure; gas release, final conversion and rate are distinct claims.',
 'Die lernende Person plant sichere wiederholbare Messungen, wertet 0,20/0,75 mL/s mit Unsicherheit aus, erklärt den Oberflächeneffekt und erkennt konfundierte Tablettenvergleiche.',
 'The learner plans safe repeatable measurements, evaluates 0.20/0.75 mL/s with uncertainty, explains surface effects and identifies confounded tablet comparisons.',
 'Bei gleicher Säurestoffmenge und veränderter Konzentration erkennt sie die neue Volumen-/Mischkonfundierung oder entwirft eine Kontrolle auf thermische Enzymdeaktivierung.',
 'At equal acid amount but changed concentration, the learner identifies new volume/mixing confounds or designs a control for thermal enzyme deactivation.'),
('Ein Produkt kann seine weitere Bildung über einen katalytischen Weg beschleunigen; eine S-Kurve allein weist diesen Zusammenhang nicht nach.',
 'A product can accelerate its further formation through a catalytic route; an S-shaped curve alone does not establish that relationship.',
 'Die lernende Person berechnet Absorbanz-Verbrauchsraten, bilanziert Permanganat/Oxalat atom- und ladungsrichtig und beurteilt Produktzugabe gegen Matrix- und Temperaturkontrollen.',
 'The learner calculates absorbance-consumption rates, balances permanganate/oxalate atoms and charge, and evaluates product seeding against matrix and temperature controls.',
 'Bei Temperaturanstieg ohne wirksame Produktzugabe oder bei hemmendem Produkt wird die Autokatalysehypothese gegen Alternativen geprüft.',
 'With heating but ineffective product seeding, or with an inhibitory product, the learner tests the autocatalysis hypothesis against alternatives.'),
('Die Beziehung pi=ciRT verknüpft gasförmige stöchiometrische Produkte; Standardzustände legen den Umrechnungsfaktor und die Konvention fest.',
 'The relation pi=ciRT connects gas-phase stoichiometric products; standard states determine the conversion factor and convention.',
 'Die lernende Person leitet RTc°/p° und gasförmiges Δν her, berechnet Kp=0,123879 und Kc=0,004811 und begründet nötige Fugazitätskorrekturen.',
 'The learner derives RTc°/p° and gas-phase Δν, calculates Kp=0.123879 and Kc=0.004811, and explains when fugacity corrections are needed.',
 'Bei verdoppelter Reaktionsgleichung oder einem dichten überkritischen Gas werden Konstanten und die Gültigkeit des Herleitungsschritts neu geprüft.',
 'With a doubled reaction equation or a dense supercritical gas, the learner reassesses the constants and validity of the derivation.'),
('Die Temperaturabhängigkeit von K folgt aus der Reaktionsenthalpie; Aktivierungsenergie und Einstellgeschwindigkeit sind andere Größen.',
 'The temperature dependence of K follows from reaction enthalpy; activation energy and equilibration rate are different quantities.',
 'Die lernende Person berechnet K2≈0,3558 und den Sekantenwert −27,66 kJ/mol mit konsistenten Einheiten und Vorzeichen und erklärt die Annahme konstanter Enthalpie.',
 'The learner calculates K2≈0.3558 and the −27.66 kJ/mol secant estimate with consistent units and signs and explains the constant-enthalpy assumption.',
 'Sie leitet die Folgen der Reaktionsumkehr für K und Enthalpie her oder erklärt fast unverändertes K bei schnellerer Gleichgewichtseinstellung.',
 'The learner derives how reversing the reaction changes K and enthalpy, or explains nearly unchanged K with faster equilibration.'),
('Gemeinsame freie Spezies koppeln Lösen an Protonierung oder Komplexbildung; Reaktionsaddition verknüpft Konstanten und Stoffbilanzen schließen das Modell.',
 'Shared free species couple dissolution to protonation or complexation; adding reactions combines constants and material balances close the model.',
 'Die lernende Person leitet KL/Ka2 und KLβ2 her, unterscheidet Reservoirbedingungen von geschlossenen Bilanzen und prüft freie gegenüber gesamten gelösten Stoffmengen.',
 'The learner derives Ksp/Ka2 and Kspβ2, distinguishes reservoir conditions from closed balances and checks free against total dissolved amounts.',
 'Beim Öffnen für CO2-Austausch oder beim Wechsel zu 1:1-Liganden werden Randbedingung, Exponenten und Bilanz selbstständig neu aufgestellt.',
 'When opening to CO2 exchange or changing to a 1:1 ligand, the learner independently reconstructs boundary conditions, exponents and balances.'),
('pE/Eh-pH-Grenzen folgen Elektronen-/Protonen- und Löslichkeitsgleichgewichten unter festgelegten Aktivitäten und liefern keine Korrosionsrate.',
 'pE/Eh–pH boundaries follow electron/proton and solubility equilibria at specified activities and do not provide a corrosion rate.',
 'Die lernende Person konstruiert Wasser- und Cu-Grenzen sowie konsistente vertikale und geneigte Metallhydroxidgrenzen, ordnet Punkte ein und begründet fehlende Passivierungsevidenz.',
 'The learner constructs water and Cu boundaries and consistent vertical/sloping metal-hydroxide boundaries, classifies points and explains missing passivation evidence.',
 'Geänderte freie Ionenaktivität oder ein neuer Ligand führen zu einer begründeten Neubewertung der Stabilitätsgrenzen.',
 'Changed free-ion activity or a new ligand leads to a justified reassessment of the stability boundaries.'),
('Die Reaktionsrichtung bestimmt die Vorzeichen von E und ΔrG; ein offener Außenkreis ist vom globalen chemischen Gleichgewicht Q=K verschieden.',
 'Reaction direction determines the signs of E and ΔrG; an open external circuit differs from global chemical equilibrium Q=K.',
 'Die lernende Person leitet Rückumsatzarbeit und Q=K her und trennt 1,22884 V reversible Wasserspaltung von Betriebsverlusten und Katalysatorwirkung.',
 'The learner derives reverse-conversion work and Q=K and distinguishes reversible water splitting at 1.22884 V from operating losses and catalyst effects.',
 'Bei geänderter Gasrandbedingung erklärt sie mit dem neuen Q die veränderte reversible Elektrolysespannung.',
 'With a changed gas boundary condition, the learner uses the new Q to explain the changed reversible electrolysis voltage.'),
('Elementarschritt-Hypothesen müssen Stoffbilanz und beobachtetes Gesetz reproduzieren; mehrere Mechanismen können dasselbe Gesetz ergeben.',
 'Elementary-step hypotheses must reproduce stoichiometry and the observed law; multiple mechanisms may yield the same law.',
 'Die lernende Person bestimmt Ordnungen und k=0,20, eliminiert Zwischenprodukte beider Modelle und leitet die vollständige Quasistationaritätsbilanz samt Grenzraten her.',
 'The learner determines orders and k=0.20, eliminates intermediates in both models and derives the full steady-state balance and limiting rates.',
 'O2-Sättigung oder ein anfänglicher Zwischenproduktanstieg veranlassen eine begründete Neubewertung der Ausgangsnäherung.',
 'O2 saturation or initial intermediate accumulation prompts a justified reassessment of the original approximation.'),
('Katalytische Wege unterscheiden sich in Phasenlage, Bindung und Barrieren bei gleichen thermodynamischen Endzuständen; Enzymkatalyse kann Phasenkategorien überlappen.',
 'Catalytic routes differ in phases, binding and barriers at identical thermodynamic endpoints; enzyme catalysis can overlap phase categories.',
 'Die lernende Person vergleicht Profile und Rückbarrieren auf gleichem Energiebezug und trennt Enzymdeaktivierung sowie Transportbegrenzung von chemischen Aktivierungsbarrieren.',
 'The learner compares profiles and reverse barriers on the same energy reference and separates enzyme deactivation and transport limitations from chemical activation barriers.',
 'Bei Enzymimmobilisierung oder geänderter Rührabhängigkeit am Feststoff werden Phasenzuordnung und Barrierenaussage neu begründet.',
 'After enzyme immobilisation or changed stirring dependence at a solid, the learner rejustifies phase classification and barrier conclusions.'),
('Katalyse verändert Wege und Raten; eine Ökobewertung braucht gleiche Funktion, Lebensdauer, Energie-, Emissions- und Rohstoffgrenzen.',
 'Catalysis changes pathways and rates; environmental evaluation requires equal function, lifetime and energy/emission/resource boundaries.',
 'Die lernende Person bilanziert CO-Oxidation und SCR, trennt gleiche stoffliche CO2-Bildung von 2300 kg CO2e Teilvorteil und beurteilt Schwefelübertragbarkeit und NH3-Schlupf.',
 'The learner balances CO oxidation and SCR, separates identical material CO2 formation from a 2300 kg CO2e partial advantage, and evaluates sulfur transferability and NH3 slip.',
 'Nach Vergiftung oder einem Zielkonflikt zwischen Schlupf, Energie und Rohstoffbedarf prüft sie gleiche Reinigungsleistung und zusätzlich benötigte Daten.',
 'After poisoning or a trade-off among slip, energy and resources, the learner reassesses equivalent cleaning service and additional data requirements.'),
('Freie Aktivitätsänderungen verändern Q und reversible Triebkraft; die Menge eines vorhandenen reinen Metalls ist kein Faktor in Q.',
 'Free-activity changes alter Q and reversible driving force; the amount of a present pure metal is not a factor in Q.',
 'Die lernende Person begründet +8,90 mV, null und +29,58 mV der Optionen und erklärt 1,01126 V nach Cu-Komplexierung trotz gleichen Gesamtgehalts.',
 'The learner justifies +8.90 mV, zero and +29.58 mV for the options and explains 1.01126 V after Cu complexation despite unchanged total content.',
 'Bei erhöhtem Innenwiderstand oder einem beide Halbzellen betreffenden Liganden wird das Spannungs- beziehungsweise Leistungsziel neu beurteilt.',
 'With increased internal resistance or a ligand affecting both half-cells, the learner reassesses the voltage or power objective.'),
('Pt, Standard-H2-Druck und Protonenaktivität eins definieren eine relative Referenz; null Volt ist eine Konvention mit chemischer Funktion.',
 'Pt, standard H2 pressure and unit proton activity define a relative reference; zero volts is a convention with a chemical function.',
 'Die lernende Person konstruiert Ladungswege und Cu-/Zn-Polung, leitet die Daniell-Standardspannung her und unterscheidet mit gegebener Beziehung eine Nichtstandard-Wasserstoffelektrode von SHE.',
 'The learner constructs charge paths and Cu/Zn polarity, derives Daniell standard voltage and uses a supplied relation to distinguish a nonstandard hydrogen electrode from SHE.',
 'Bei geändertem H2-Druck und gleicher Protonenaktivität erklärt sie die Abweichung vom SHE-Zustand und die Änderung des Reaktionsquotienten.',
 'At changed H2 pressure and fixed proton activity, the learner explains departure from the SHE state and the changed reaction quotient.')
]
fields = ['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
batch = campaign['batches'][0]
run_id = 'chemie-equilibrium16-final-native-fresh-independent-a-20261015-v1-D'
results = ROOT / 'D-results'
results.mkdir(exist_ok=True)
records = []
for i, (g, chunk, chain) in enumerate(zip(source['goals'], chunks, chains),1):
    header, body = chunk.split('\n',1)
    decision = header.rsplit(' — ',1)[1].lower()
    rationale = body.split('\n\nUnderstanding:',1)[0].strip()
    if 'Replacement DE:' in rationale:
        rationale = rationale.split('\n\nReplacement DE:',1)[0]
    scope = ' Scope: sealed D-FIRST and actual final native-v2 PDF/HTML/model, 32 complete bilingual cases, 16 profile bodies, finite whole source-cell/partner/passages; no whole-national mapping or effective projection approval.'
    if i in [4,9,11]:
        profile_issue = body.split('Profile alignment: revise',1)[1].split('\n\n',1)[0]
        rationale += ' Profile recommendation: revise' + profile_issue
    record = {
        '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion':1,'recordId':f'{run_id}-{i:02}', 'runId':run_id,
        'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],
        'bundleFingerprint':source['bundleFingerprint'],'bookDigest':source['bookDigest'],
        **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
        'decision':decision,'understandingEvidence':dict(zip(fields,chain)),
        'rationale':rationale+scope,
        'evidenceProfileContract':'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation':'revise' if i in [4,9,11] else 'none',
        'recordStatus':'candidate','reviewAuthority':'ai_candidate'
    }
    if decision=='revise':
        record['proposedDescriptionDe']=re.search(r'Replacement DE: (.+)',body).group(1)
        record['proposedDescriptionEn']=re.search(r'Replacement EN: (.+)',body).group(1)
    records.append(record)
out=results/(batch['batchId']+'.records.jsonl')
out.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
digest=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
parameters={'generationParameters':'not exposed to this reviewer','reviewer':'independent native A','scientificFirstSeal':seal['sha256'],'task':'D16 exact final-v2 first pass','startedAtBasis':'earliest persisted scientific reading extract in this own root; initial criteria reading preceded this timestamp'}
(ROOT/'D-generation-parameters.json').write_text(json.dumps(parameters,ensure_ascii=False,indent=2)+'\n')
roles=['book_pdf','book_pdf_render_manifest','book_html','book_html_render_manifest','book_model','review_prompt','review_criteria']
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run_id,
     'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],
     'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],
     'provider':'OpenAI Codex','model':'GPT-6 (exact runtime snapshot not exposed)', 'role':'subject_reviewer',
     'promptFamilyId':'goal-description-understanding-evidence-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],
     'generationParametersFingerprint':digest(ROOT/'D-generation-parameters.json'), 'independenceGroupId':campaign['independenceGroupId'],
     'blindToOtherRuns':True,'goalIds':batch['goalIds'],
     'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in roles]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],
     'startedAt':datetime.datetime.fromtimestamp(min(p.stat().st_mtime for p in ROOT.glob('READ.*.txt')),datetime.timezone.utc).isoformat(),'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'completed','outputDigest':digest(out),'toolchainVersion':'skillpilot-stock-description-review-v2'}
(results/(batch['batchId']+'.run.json')).write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
assert len(records)==16
print(json.dumps({'records':len(records),'decisions':{k:sum(x['decision']==k for x in records) for k in ['keep','revise','split_review','block']},'out':str(out)},ensure_ascii=False))

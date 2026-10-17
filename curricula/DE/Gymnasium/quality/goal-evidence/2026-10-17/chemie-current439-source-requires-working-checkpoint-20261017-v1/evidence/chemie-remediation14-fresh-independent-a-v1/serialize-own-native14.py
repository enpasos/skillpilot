from pathlib import Path
import json,hashlib,datetime
OUT=Path('/mnt/e/skillpilot-chemie-L7-20261017/chemie-remediation14-fresh-independent-a-v1')
pin=json.load(open(OUT/'INPUT.final-selector.pin.json'))
ROUND=Path(pin['nativeRoot'])/'round-a'
first=json.load(open(OUT/'FIRST14.independent-scientific-observations.json'))
seal=json.load(open(OUT/'FIRST14.seal.json'))
assert hashlib.sha256((OUT/'FIRST14.independent-scientific-observations.json').read_bytes()).hexdigest()==seal['sha256']
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
# These are the reviewer's own goal-specific bilingual formulations, not copied profile judgments.
E={
'bbe038e9':[
'Im einfachen Elektronenpaarmodell entsteht eine bindende gemeinsame Elektronenpaarbesetzung durch geeignete Orbitalüberlappung; Anziehung und Abstoßung bestimmen einen günstigen Abstand.',
'In the simple electron-pair model, suitable orbital overlap permits a shared bonding pair; attraction and repulsion determine a favourable separation.',
'Die lernende Person deutet H2 und HCl mit passenden Valenzelektronen, entgegengesetztem Spin und einem gemeinsamen bindenden Paar und begrenzt die Aussage des Modells.',
'The learner interprets H2 and HCl using the appropriate valence electrons, opposite spins and a shared bonding pair, and states the model limits.',
'An einer veränderten Überlappungs- oder Abstandszeichnung begründet die lernende Person, weshalb stärkere Annäherung nicht stets stabiler ist und welche Besetzung eine Bindung erklärt.',
'Given a changed overlap or separation diagram, the learner explains why closer approach is not always more stable and which occupancy accounts for bonding.'],
'92c99237':[
'Molekülformel, Strukturformel und räumliches Modell enthalten unterschiedlich viel Information; eine Summenformel legt die Verknüpfung bei Isomeren nicht eindeutig fest.',
'Molecular formula, structural formula and spatial model provide different information; an isomeric molecular formula does not uniquely determine connectivity.',
'Die lernende Person überführt ausreichend bestimmte Ethanol- oder Ethen-Darstellungen konsistent ineinander und prüft Atome, Bindigkeiten und vorhandene freie Elektronenpaare.',
'The learner consistently converts sufficiently specified ethanol or ethene representations and checks atoms, valence and represented lone pairs.',
'Für C2H6O unterscheidet die lernende Person Ethanol und Dimethylether und benennt die zusätzliche Strukturinformation, die zur eindeutigen Umwandlung benötigt wird.',
'For C2H6O the learner distinguishes ethanol from dimethyl ether and identifies the extra structural information needed for a unique conversion.'],
'c0f1bf09':[
'Stoffkreisläufe verbinden Stofftransport, physikalische Zustandsänderungen und chemische Umwandlungen unter Atomerhaltung; ein Stoffkreislauf ist kein geschlossener Energiekreislauf.',
'Material cycles connect transport, physical state changes and chemical transformations while conserving atoms; a material cycle is not a closed energy cycle.',
'Die lernende Person erklärt ausgewählte Kohlenstoff- und Kalkkreislaufschritte mit passenden Teilchen oder Reaktionsgleichungen und unterscheidet Reaktion von Transport oder Phasenwechsel.',
'The learner explains selected carbon and lime cycle steps using appropriate particles or equations and distinguishes reaction from transport or phase change.',
'In einer veränderten Kreislaufdarstellung ordnet die lernende Person etwa CO2-Aufnahme, Carbonatbildung und Verdunstung begründet ein und verfolgt Stoff und Energie getrennt.',
'In a changed cycle diagram the learner justifies the classification of CO2 uptake, carbonate formation and evaporation, tracking matter and energy separately.'],
'f85b4651':[
'In einem vorgegebenen Valenz-MO-Schema ergibt die halbe Differenz bindender und antibindender Elektronenzahlen die Bindungsordnung; ungepaarte Elektronen erlauben eine begrenzte Aussage zum Magnetismus.',
'In a supplied valence MO scheme, half the difference between bonding and antibonding electron counts gives bond order; unpaired electrons support a bounded magnetic interpretation.',
'Die lernende Person liest die tatsächlichen Besetzungen eines N2- oder O2-Schemas, zählt selbst und begründet Bindungsordnung und gegebenenfalls ungepaarte Elektronen.',
'The learner reads the actual N2 or O2 orbital occupancies, independently counts electrons and justifies bond order and, where applicable, unpaired electrons.',
'Beim Übergang zu N2+ oder O2+ bestimmt die lernende Person aus dem jeweils höchsten besetzten Orbital die geänderte Besetzung und erklärt den unterschiedlichen Einfluss auf die Bindungsordnung.',
'For N2+ or O2+, the learner determines the changed occupancy from the highest occupied orbital and explains its different effect on bond order.'],
'91cd4728':[
'London-Kräfte wirken zwischen allen Molekülen; permanente Dipole und geeignete Wasserstoffbrücken verändern zusätzlich intermolekulare Anziehung und damit Stoffeigenschaften.',
'London forces act between all molecules; permanent dipoles and suitable hydrogen bonds add intermolecular attraction and affect properties.',
'Die lernende Person vergleicht Propan, Dimethylether und Ethanol anhand vorgegebener Strukturen und Siededaten, trennt molare Masse von Wechselwirkungen und erklärt Wasserstoffbrückendonator und -akzeptor.',
'The learner compares propane, dimethyl ether and ethanol using supplied structures and boiling data, separates molar mass from interactions and explains hydrogen-bond donation and acceptance.',
'Für einen Ether in Wasser begründet die lernende Person dessen Akzeptorrolle trotz fehlender OH-Gruppe und grenzt eine qualitative Löslichkeitsdeutung von einer unbelegten vollständigen Mischbarkeitsaussage ab.',
'For an ether in water, the learner explains its acceptor role despite having no OH group and distinguishes qualitative solubility reasoning from an unsupported complete-miscibility claim.'],
'cf270aaf':[
'Die violette Biuretreaktion beruht im geeigneten alkalischen Milieu auf Cu(II)-Koordination durch geeignete Peptidgruppen; blaue Lösungen oder Trübungen sind kein gleichwertiger positiver Befund.',
'The violet Biuret response involves Cu(II) coordination by suitable peptide groups under appropriate alkaline conditions; blue solutions or precipitates are not equivalent positive results.',
'Die lernende Person führt die genehmigte kontrollierte Untersuchung tatsächlich durch, dokumentiert reale Beobachtungen bei festgehaltenen Bedingungen, prüft Positiv- und Blindkontrolle und erklärt den Befund im Teilchenmodell.',
'The learner actually carries out the authorized controlled investigation, records real observations under fixed conditions, checks positive and blank controls and explains the result with a particle model.',
'Bei verändertem Proteinanteil oder ungültiger Kontrolle entscheidet die lernende Person begründet über Aussagegrenzen, Ursachenprüfung und erforderliche neue Messung, ohne fremde Daten als eigene Durchführung auszugeben.',
'For a changed protein content or invalid control, the learner justifies inference limits, checks causes and determines whether a new measurement is needed without presenting supplied data as personal execution.'],
'b8d3b453':[
'Delokalisierung stabilisiert das aromatische System; eine elektrophile Substitution verliert die Aromatizität vorübergehend und stellt sie durch Protonenabgabe wieder her.',
'Delocalization stabilizes the aromatic system; electrophilic substitution temporarily loses aromaticity and restores it through proton loss.',
'Die lernende Person verfolgt Elektronenverteilung, Ladung und Bindungen eines vorgegebenen sigma-Komplexes und begründet die Rückbildung des aromatischen Systems statt einer pauschalen Reaktionsträgheit.',
'The learner tracks electron distribution, charge and bonds in a supplied sigma complex and explains restoration of aromaticity rather than claiming blanket inertness.',
'An einem neuen NO2+-Papierfall vergleicht die lernende Person Protonenabgabe und eine ausdrücklich hypothetische Abfangreaktion und erklärt anhand einer gegebenen Hydrierung, weshalb aromatisch nicht niemals Addition bedeutet.',
'In a fresh NO2+ paper case, the learner compares proton loss with an explicitly hypothetical capture step and uses supplied hydrogenation to explain why aromatic does not mean addition is impossible.'],
'28c90c6a':[
'Titrationskurven verknüpfen Stoffmengenverhältnis und Säure-Base-Gleichgewichte mit Anfangs-, Puffer-, Äquivalenz- und Überschussbereichen; Neutralität und Äquivalenz sind verschiedene Begriffe.',
'Titration curves connect mole ratios and acid-base equilibria with initial, buffer, equivalence and excess regions; neutrality and equivalence are distinct concepts.',
'Die lernende Person deutet vorgegebene starke und schwache Säure- oder Basenkurven, lokalisiert charakteristische Bereiche und begründet einen passenden Indikator aus dem tatsächlichen steilen Bereich.',
'The learner interprets supplied strong and weak acid or base curves, locates characteristic regions and justifies an indicator using the actual steep interval.',
'Bei einer umgekehrten Titrationsrichtung, verändertem pKw oder einer mehrstufigen Glycinkurve begründet die lernende Person die veränderte qualitative Deutung, ohne Äquivalenz stets mit pH 7 oder einem beliebigen Zwischenpunkt mit guter Pufferung gleichzusetzen.',
'For reversed titration direction, changed pKw or a multistage glycine curve, the learner explains the changed qualitative interpretation without equating equivalence with pH 7 or any intermediate point with effective buffering.'],
'e20d205f':[
'Umweltbilanzen sind nur bei gleicher Funktion, konsistenten Systemgrenzen und offengelegten Annahmen vergleichbar; eine einzelne Klimakategorie ersetzt keine vollständige Umweltbewertung.',
'Environmental balances are comparable only with a common function, consistent system boundaries and explicit assumptions; a climate category alone is not a complete environmental assessment.',
'Die lernende Person normalisiert vorgegebene Daten auf dieselbe Nutzfunktion, begründet berücksichtigte Beiträge und Gutschriften und trennt Daten, Unsicherheit und Bewertungskriterien.',
'The learner normalizes supplied data to the same useful function, justifies included contributions and credits and separates data, uncertainty and evaluation criteria.',
'Bei verändertem Wirkungsgrad oder tatsächlich genutzter statt nur angebotener Wärme prüft die lernende Person, ob eine Rangfolge oder Gutschrift noch gilt, und begrenzt das Ergebnis auf die erfassten Wirkungskategorien.',
'For changed efficiency or actually used rather than merely available heat, the learner tests whether a ranking or credit still applies and limits the conclusion to the assessed impact categories.'],
'7dc80ee2':[
'Wasserstoff ist ein Energieträger; Herstellung, Speicherung und Rückumwandlung haben eigene Stoff-, Energie- und Systemgrenzen, deren Verluste sich entlang einer Kette auswirken.',
'Hydrogen is an energy carrier; production, storage and reconversion have distinct material, energy and system boundaries, with losses acting along the chain.',
'Die lernende Person erklärt vorgegebene Herstellungspfade mit ausgeglichener Wasserspaltung, verfolgt Wirkungsgrade und vergleicht Speichermassen unter Einbeziehung des gesamten Speichersystems.',
'The learner explains supplied production routes with balanced water splitting, follows efficiencies and compares storage masses using the entire storage system.',
'Bei einem geänderten Sonnenenergiepfad oder Speichersystem bewertet die lernende Person nutzbare Energie auf gemeinsamer Basis und behandelt zusätzlich benötigte Wärme getrennt von elektrischem Ertrag.',
'For a changed solar-energy route or storage system, the learner evaluates usable energy on a common basis and treats additional heat separately from electrical yield.'],
'a78aacf9':[
'Waschmittelbestandteile erfüllen verschiedene Funktionen: Tenside unterstützen Schmutzentfernung, Builder binden Härteionen, Enzyme katalysieren geeignete Hydrolysen, Bleichmittel oxidieren und Aufheller fluoreszieren.',
'Detergent components serve different functions: surfactants aid soil removal, builders bind hardness ions, enzymes catalyse suitable hydrolyses, bleaches oxidize and brighteners fluoresce.',
'Die lernende Person ordnet begründet Komponenten eines vorgegebenen Waschmittels passenden Flecken, Wasserbedingungen und Textilien zu und erklärt die jeweils zugrunde liegende Wirkung.',
'The learner justifies matching components of a supplied detergent to stains, water conditions and fabrics and explains the underlying effects.',
'Bei härterem Wasser, einem Proteintextil oder veränderter Bleichverträglichkeit begründet die lernende Person eine angepasste Wahl und verwechselt optische Aufhellung nicht mit zusätzlichem Abbau von Schmutz.',
'For harder water, a protein textile or changed bleach tolerance, the learner justifies an adapted choice and does not confuse optical brightening with additional soil degradation.'],
'188bd684':[
'Industrielle Farbstoffentwicklung verbindet chemische Innovation mit Investition, Anwendungen, Wettbewerb und sozialen Folgen; unterschiedliche Quellen belegen unterschiedliche Ausschnitte.',
'Industrial dye development connects chemical innovation with investment, applications, competition and social effects; different sources establish different parts of this history.',
'Die lernende Person beurteilt die wirtschaftliche Bedeutung des synthetischen Indigos anhand tatsächlich zugänglicher historischer Quellen, ordnet Herkunft und Interessen ein und trennt belegte Investition von unbelegtem Gewinn.',
'The learner assesses the economic significance of synthetic indigo using actual accessible historical sources, considers provenance and interests and distinguishes documented investment from unproven profit.',
'Für den neuen Indanthren-Fall begründet die lernende Person, wie Eigenschaften neue Anwendungen und innerbetrieblichen Wettbewerb ermöglichen, und benennt zusätzliche Belege für eine belastbare langfristige Markt- oder Gewinnbehauptung.',
'For the new Indanthrene case, the learner explains how properties enable applications and internal competition and identifies extra evidence needed for a defensible long-term market or profit claim.'],
'5c8f0bbb':[
'Nachweisreaktionen sprechen auf geeignete funktionelle Strukturen unter bestimmten Bedingungen an; ein positiver Farbbefund identifiziert eine Stoffklasse nicht immer eindeutig.',
'Detection reactions respond to suitable functional structures under specified conditions; a positive colour response does not always uniquely identify a substance class.',
'Die lernende Person wählt geeignete Aminosäure- oder Peptidnachweise, führt die genehmigten Untersuchungen tatsächlich durch, wertet Kontrollen aus und begründet die Grenzen der Farbinterpretation.',
'The learner selects suitable amino-acid or peptide tests, actually performs authorized investigations, evaluates controls and explains the limits of colour interpretation.',
'Mit vorgegebenen Prolin-, Glycin- und Ethanolaminstrukturen erklärt die lernende Person unterschiedliche Ninhydrinbefunde und ein nicht eindeutiges Positivsignal; dieser Papiertransfer ersetzt die verlangte eigene Durchführung nicht.',
'Using supplied proline, glycine and ethanolamine structures, the learner explains different ninhydrin responses and a nonunique positive signal; this paper transfer does not replace required actual execution.'],
'64a5bb87':[
'Proteinproduktionswege lassen sich nur mit vergleichbarer Funktion, transparenten Systemgrenzen und geprüften Quellen ökologisch, ökonomisch und ethisch begründet bewerten.',
'Protein production routes require a comparable function, transparent system boundaries and checked sources for reasoned ecological, economic and ethical evaluation.',
'Die lernende Person recherchiert selbstständig, dokumentiert die Herkunft der verwendeten Informationen, prüft Gegenquellen und begründet eine begrenzte Bewertung anhand aller drei Kriterienbereiche.',
'The learner independently researches and documents information provenance, checks counter-sources and justifies a bounded evaluation across all three criterion areas.',
'Bei einer veränderten Produktionsweise oder widersprüchlichen Daten prüft die lernende Person Vergleichbarkeit und Unsicherheit neu und passt ihr Urteil begründet an, statt pauschal pflanzlich gegen tierisch zu werten.',
'For a changed production route or conflicting data, the learner reassesses comparability and uncertainty and justifiably adapts the judgment instead of making a blanket plant-versus-animal ranking.']}
input=json.load(open(ROUND/'description-review-input.json'))
campaign=json.load(open(ROUND/'description-review-campaign.json'))
bundle=json.load(open(ROUND/'review-bundle-manifest.json'))
byfirst={r['goalId']:r for r in first['results']}
keys=['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
runId='chemie-remediation14-independent-a-20261017-observed-science-v1'
records=[]
for i,g in enumerate(input['goals']):
 own=byfirst[g['goalId']]
 for k in ['goalFingerprint','pageFingerprint','currentDescriptionDe','currentDescriptionEn']: assert own[k]==g[k]
 r={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':runId+'-'+str(i+1).zfill(2),'runId':runId,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest']}
 for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:r[k]=g[k]
 r.update({'decision':'keep','understandingEvidence':dict(zip(keys,E[g['goalId'][:8]])),'rationale':own['descriptionRationale']+' '+own['positiveEvidenceMaterialRationale'],'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'revise' if own['positiveEvidenceMaterialVerdict']=='REVISE' else 'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
 records.append(r)
results=OUT/'native-round-a-results';results.mkdir(exist_ok=True)
batch=campaign['batches'][0]
recpath=results/(batch['batchId']+'.records.jsonl')
recpath.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
params={'actualAgent':'/root/chemie_four_image_fresh_independent_v_20261017','provider':'OpenAI','knownModelFamily':'GPT-6','exactModelSnapshot':'not exposed in agent context','samplingParameters':'not exposed in agent context; not invented','reviewMethod':'independent actual whole current scientific review, sealed FIRST before native serialization','scientificInputReadingStartedAtUTC':first['timing']['scientificInputReadingStartedAtUTC'],'scientificFirstFindingsSealedAtUTC':seal['sealedAtUTC'],'nativeSerializationStartedAtUTC':started,'priorOwnVAndAMNotD14Votes':True,'peerReviewResultsRead':False}
parbytes=(json.dumps(params,ensure_ascii=False,sort_keys=True,indent=2)+'\n').encode();(OUT/'NATIVE.actual-run-parameters.json').write_bytes(parbytes)
roles=['book_pdf','book_pdf_render_manifest','book_model','review_input_json','review_prompt','review_criteria','run_manifest_schema']
arts=[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts'] if a['role'] in roles]
arts.append({'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']})
completed=datetime.datetime.now(datetime.timezone.utc).isoformat()
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runId,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':bundle['bundleFingerprint'],'bookDigest':bundle['bookModelDigest'],'provider':'OpenAI','model':'GPT-6 (Codex agent; exact model snapshot not exposed)','role':'subject_reviewer','promptFamilyId':'goal-description-understanding-evidence-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':'sha256:'+hashlib.sha256(parbytes).hexdigest(),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':arts,'startedAt':first['timing']['scientificInputReadingStartedAtUTC'],'completedAt':completed,'status':'completed','outputDigest':'sha256:'+hashlib.sha256(recpath.read_bytes()).hexdigest(),'toolchainVersion':'goal-description-review-v1'}
runpath=results/(batch['batchId']+'.run.json');runpath.write_text(json.dumps(run,ensure_ascii=False,indent=2)+'\n')
(OUT/'NATIVE.serialization-timing.json').write_text(json.dumps({'scientificInputStartedAt':run['startedAt'],'FIRSTSealedAt':seal['sealedAtUTC'],'nativeSerializationStartedAt':started,'nativeSerializationCompletedAt':completed,'meaning':'Run covers scientific work plus later serialization. FIRST was sealed before serializer code execution. No guessed historical timestamps.'},indent=2)+'\n')
print(json.dumps({'recordsPath':str(recpath),'recordsSha256':hashlib.sha256(recpath.read_bytes()).hexdigest(),'runPath':str(runpath),'runSha256':hashlib.sha256(runpath.read_bytes()).hexdigest(),'records':len(records),'decisionCounts':{'keep':14},'profileRecommendations':{'none':11,'revise':3}},indent=2))

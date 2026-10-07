from pathlib import Path
import json, copy, hashlib, datetime
R=Path('.')
B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
P=B/'chemie-current-atomic-description-positive-gap-author-v2'
V1=B/'chemie-current-atomic-description-positive-gap-author-v1'
def read(p): return json.loads(p.read_text())
def write(n,v): (P/n).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def bind(p): return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
materials=read(P/'thirty-complete-materials.de-en.author-corrections.candidate.json')
specs=read(P/'fifteen-positive-profile-specifications.author-corrections.candidate.json')
ms={c['caseId']:c for c in materials['materials']}
ps={g['goalId'].split('-')[0]:g['profile'] for g in specs['goals']}

# Existing n-pentane/neopentane case receives explicit data/model; no new measured lattice claim.
c=ms['chem-current15-5a30273a-case-2']
assert 'Kristallpackung und Messwerte sind nicht gegeben.' in c['material']['de']
c['material']['de']='Frischer Strukturvergleich: n-Pentan CH3(CH2)3CH3 und 2,2-Dimethylpropan C(CH3)4 haben dieselbe Summenformel C5H12 und keine OH-Gruppe. Das zweite Molekül ist kompakter und hochsymmetrisch. Gegeben sind gerundete NIST-Fusionswerte von 143 K beziehungsweise 255 K sowie ein vereinfachtes eigenes Packungsmodell: London-Anziehung hält beide molekularen Feststoffe zusammen; die symmetrische kompakte Form begünstigt im Modell eine regelmäßigere Packung und Stabilisierung der festen Phase. Dieser qualitative Modellhinweis ist kein neuer gemessener Kristallstrukturbeleg.'
c['material']['en']='Fresh comparison: n-pentane CH3(CH2)3CH3 and 2,2-dimethylpropane C(CH3)4 have the same molecular formula C5H12 and no OH group. The second molecule is more compact and highly symmetrical. Supplied are rounded NIST fusion values of 143 K and 255 K, respectively, and a simplified own packing model: London attraction holds both molecular solids together; in the model the symmetrical compact shape favours more regular packing and stabilisation of the solid phase. This qualitative model information is not new measured crystal-structure evidence.'
c['taskDemand']['de']='Begründe eine qualitative Siedevorhersage und erkläre anhand der gegebenen Daten und des Packungsmodells positiv die Schmelzrangfolge. Unterscheide das Aufheben fester Packung vom Sieden und von einer Bindungsspaltung innerhalb der Moleküle.'
c['taskDemand']['en']='Justify a qualitative boiling prediction and use the supplied data and packing model to explain positively the melting order. Distinguish disrupting solid packing from boiling and from breaking bonds within molecules.'
c['expectedPerformance']['de']='Die größere Kontaktfläche der unverzweigten Form begünstigt London-Anziehung und den höheren Siedepunkt gegenüber der kompakten Form. Die gegebenen Fusionsdaten zeigen dagegen den höheren Schmelzwert des symmetrischen kompakten Isomers. Im vorgegebenen Modell stabilisiert die günstigere regelmäßige Packung dessen feste Phase. Beim Schmelzen wird die geordnete Packung aufgehoben und zwischenmolekulare Kontakte ändern sich; die C5H12-Moleküle bleiben erhalten und London-Anziehung wirkt auch in der Flüssigkeit weiter. Sieden betrifft den Übergang in die Gasphase, nicht die Schmelzrangfolge. Eine quantitative Schmelzvorhersage oder eine allgemeine Verzweigungsregel folgt aus dem qualitativen Modell nicht.'
c['expectedPerformance']['en']='The extended structure offers greater contact area and stronger London attraction, supporting a higher boiling point than the compact form. The supplied fusion data instead show the symmetrical compact isomer melting higher. In the given model its favourable regular packing stabilises the solid phase. Melting disrupts ordered packing and changes intermolecular contacts; the C5H12 molecules remain intact and London attraction persists in the liquid. Boiling concerns transition into the gas phase, not the melting order. The qualitative model gives neither a quantitative melting prediction nor a universal branching rule.'

# Given bromine observations remain exactly as before. Learner must now choose and bound a test.
c=ms['chem-current15-622f09e5-case-2']
c['taskDemand']['de']+=' Wähle außerdem für eine neue unbekannte organische Probe C eine geeignete erste Nachweismethode für eine C=C-Bindung. Nenne passende Licht-, Lösemittel- und Mischbedingungen, die erwartete Beobachtung sowie Positiv-, Negativ- und Blindkontrolle und begrenze die Schlussfolgerung.'
c['taskDemand']['en']+=' Also choose a suitable initial test for a C=C bond in a fresh unknown organic sample C. State appropriate light, solvent and mixing conditions, the expected observation, positive and negative controls and a blank, and limit the inference.'
c['expectedPerformance']['de']+=' Ein begrenzter erster Ansatz ist ein Bromverbrauchstest im Dunkeln unter vergleichbaren Lösemittel- und Mischbedingungen: Eine passende Reaktion an C=C kann die Bromfarbe vermindern. Das bekannte Alken A dient als Positivkontrolle, das bekannte Alkan B im Dunkeln als Negativkontrolle, der Ansatz ohne organische Probe als Blindkontrolle. Der Vergleich darf weder Licht-induzierte Substitution noch bloße unterschiedliche Verteilung der Bromfarbe als C=C-Nachweis behandeln. Auch andere bromverbrauchende Stoffe können ein positives Ergebnis verursachen; der Befund allein identifiziert C nicht eindeutig.'
c['expectedPerformance']['en']+=' A bounded initial choice is a bromine-consumption test in the dark under comparable solvent and mixing conditions: a suitable C=C reaction can diminish bromine colour. Known alkene A is the positive control, known alkane B in the dark the negative control, and the sample-free preparation the blank. Light-induced substitution and merely different partitioning of bromine colour must not be treated as proof of C=C. Other bromine-consuming compounds can also give a positive result; this observation alone does not uniquely identify C.'

# Add only an explicitly simplified donor/acceptor orbital model, not a full copper complex.
c=ms['chem-current15-363c5740-case-1']
c['material']['de']+=' Im zusätzlich vorgegebenen qualitativen Orbitalmodell ist das nichtbindende Donororbital am Liganden-O mit einem Elektronenpaar besetzt; am Zentralion wird ein energetisch geeignetes unbesetztes Akzeptororbital schematisch dargestellt. Das Modell behauptet weder, dass alle Cu(II)-d-Orbitale leer sind, noch eine bestimmte vollständige Komplexgeometrie.'
c['material']['en']+=' In the additionally supplied qualitative orbital model, the ligand-O nonbonding donor orbital contains an electron pair; an energetically suitable unoccupied acceptor orbital is represented schematically at the central ion. The model claims neither that all Cu(II) d orbitals are empty nor a particular complete complex geometry.'
c['taskDemand']['de']+=' Ordne dabei das besetzte Liganden-Donororbital und das unbesetzte Zentralion-Akzeptororbital ausdrücklich zu und erkläre, warum beide für das Modell der Bindungsbildung benötigt werden.'
c['taskDemand']['en']+=' Explicitly identify the occupied ligand donor orbital and unoccupied central-ion acceptor orbital and explain why both are needed in the bond-formation model.'
c['expectedPerformance']['de']+=' Im vorgegebenen Modell ist das besetzte nichtbindende Ligandenorbital die Paarquelle, das unbesetzte passende Zentralionorbital der Akzeptor; ihre Wechselwirkung erklärt die Ausbildung der gemeinsamen Bindung. Aus dem schematischen Akzeptororbital folgt keine Aussage, dass sämtliche Metall-d-Orbitale leer seien.'
c['expectedPerformance']['en']+=' In the supplied model the occupied ligand nonbonding orbital is the pair source and the suitable unoccupied central-ion orbital the acceptor; their interaction explains formation of the shared bond. The schematic acceptor orbital does not imply that all metal d orbitals are empty.'

for short in ['3d3231f9','5a30273a','622f09e5','363c5740']:
 profile=ps[short]
 for brief in profile['applicationCaseBriefs']:
  case=ms[brief['id']]
  for lang in ['de','en']:
   suffix=lang.capitalize()
   brief['taskDemand'+suffix]=case['material'][lang]+' '+case['taskDemand'][lang]
   brief['expectedPerformance'+suffix]=case['expectedPerformance'][lang]
   brief['understandingFocus'+suffix]=case['specificBoundaryOrCounterexample'][lang]
 fresh=ms['chem-current15-'+short+'-case-2']
 profile['expectations'][1]['observablePerformanceDe']=fresh['expectedPerformance']['de']+' '+fresh['specificBoundaryOrCounterexample']['de']
 profile['expectations'][1]['observablePerformanceEn']=fresh['expectedPerformance']['en']+' '+fresh['specificBoundaryOrCounterexample']['en']

melting=copy.deepcopy(next(e for e in ps['3d3231f9']['expectations'] if e['id']=='positive-melting-model-explanation'))
ps['5a30273a']['expectations'].append(melting)
ps['5a30273a']['coverageExpectations']['requiredExpectationIds'].append(melting['id'])

test={'id':'independent-test-choice-conditions-controls','essentialUnderstandingDe':'Die lernende Person muss eine passende Nachweismethode selbst wählen und Bedingungen, erwartete Beobachtung, Kontrollansätze und die begrenzte Aussage begründen; bloße Deutung bereits gelieferter Farbbeobachtungen genügt nicht.','essentialUnderstandingEn':'The learner must independently choose an appropriate test and justify conditions, expected observation, controls and the bounded inference; interpreting supplied colour observations alone is insufficient.','observablePerformanceDe':'Für die neue Probe C schlägt die Person einen Bromverbrauchstest im Dunkeln unter vergleichbaren Lösemittel-/Mischbedingungen vor, erwartet gegebenenfalls Farbverminderung und benennt bekanntes Alken, bekanntes Alkan im Dunkeln und probenfreien Blindansatz als Positiv-/Negativ-/Blindkontrollen. Sie trennt mögliche Addition von Lichtsubstitution, physischer Farbverteilung und anderen bromverbrauchenden Reaktionen.','observablePerformanceEn':'For new sample C the learner proposes a bromine-consumption test in the dark with comparable solvent/mixing conditions, anticipates possible colour loss and names a known alkene, a known alkane in the dark and a sample-free blank as positive, negative and blank controls. They distinguish possible addition from light-induced substitution, physical colour partitioning and other bromine-consuming reactions.'}
ps['622f09e5']['expectations'].append(test)
ps['622f09e5']['coverageExpectations']['requiredExpectationIds'].append(test['id'])

practical=ps['973c12d9']['expectations'][0]
practical['observablePerformanceDe']='Für den praktischen Leistungsanteil muss die Person eine tatsächlich beaufsichtigte Durchführung nach einem konkret lokal freigegebenen Lehrkraftprotokoll zeigen: freigegebene Nachweisbedingungen einhalten, Ethanal-/Propanon-Vergleich und Blindkontrolle angemessen behandeln, eigene tatsächliche Beobachtungen getrennt von der Deutung dokumentieren und Aldehydoxidation/Cu(II)-Reduktion begründen. Die beiden fiktiven Papierfälle reichen für diesen praktischen Nachweis nicht aus. Dieser Vertrag verlangt künftige beobachtbare Leistung; er behauptet keine bereits erfolgte Durchführung, menschliche Freigabe oder Erprobung.'
practical['observablePerformanceEn']='For the practical performance component, the learner must show actual supervised execution following a specific locally approved teacher protocol: follow its approved test conditions, appropriately handle ethanal/propanone comparison and a blank, document their own actual observations separately from interpretation and justify aldehyde oxidation/Cu(II) reduction. The two fictional paper cases do not suffice for this practical evidence. This contract requires future observable performance; it claims no prior execution, human approval or trial.'
# Both actual fictional materials remain unchanged; no observed pupil activity is invented.

orb=ps['363c5740']['expectations'][0]
orb['essentialUnderstandingDe']='Bei koordinativer Bindungsbildung stellt ein besetztes nichtbindendes Liganden-Donororbital ein freies Elektronenpaar bereit; ein energetisch geeignetes unbesetztes Orbital am Zentralatom oder Zentralion übernimmt im vorgegebenen qualitativen Modell die Akzeptorrolle. Herkunft des Paars und gemeinsame Bindung sind zu unterscheiden.'
orb['essentialUnderstandingEn']='In coordinate-bond formation an occupied ligand nonbonding donor orbital supplies a lone pair; an energetically suitable unoccupied orbital at the central atom or ion takes the acceptor role in the supplied qualitative model. Pair origin and shared bond must be distinguished.'
orb['observablePerformanceDe']='Die Person identifiziert im vorgegebenen Kupfer(II)-Tartrat-Ausschnitt das Liganden-O, sein besetztes Donororbital und das ausdrücklich dargestellte unbesetzte Zentralion-Akzeptororbital, erläutert deren Wechselwirkung bei Bindungsbildung und die Rolle der Tartratkomplexierung in der Fehling-Lösung. Das Modell behauptet keine vollständige Komplexgeometrie oder leere Gesamtheit der Cu(II)-d-Orbitale.'
orb['observablePerformanceEn']='In the supplied copper(II)-tartrate fragment the learner identifies ligand O, its occupied donor orbital and the explicitly represented unoccupied central-ion acceptor orbital, explains their interaction in bond formation and tartrate complexation in Fehling solution. The model claims neither a complete complex geometry nor that all Cu(II) d orbitals are empty.'

write('thirty-complete-materials.de-en.author-corrections.candidate.json',materials)
write('fifteen-positive-profile-specifications.author-corrections.candidate.json',specs)
oldmat=read(V1/'thirty-complete-materials.de-en.author-candidates.json')['materials']
oldspec=read(V1/'fifteen-positive-profile-specifications.author-candidates.json')['goals']
unchanged_cases=[a['caseId'] for a,b in zip(oldmat,materials['materials']) if a==b]
unchanged_profiles=[a['goalId'] for a,b in zip(oldspec,specs['goals']) if a==b]
assert len(unchanged_cases)==26
assert len(unchanged_profiles)==9
assert all(ms[c['caseId']]==c for c in oldmat if c['goalId'].startswith(('dd58c029','973c12d9')))
responses=[
 {'goalShortId':'dd58c029','reportedFinding':'Molecular formula cannot specify connectivity','authorCorrection':'Two expectation DE/EN fields only; both material cases unchanged'},
 {'goalShortId':'3d3231f9','reportedFinding':'Positive melting explanation missing','authorCorrection':'One existing case extended with actual NIST fusion values and explicitly own qualitative packing model; positive melting expectation required'},
 {'goalShortId':'5a30273a','reportedFinding':'Positive melting explanation missing','authorCorrection':'Existing isomer case now supplies actual NIST fusion values and qualitative packing information; positive melting expectation required'},
 {'goalShortId':'622f09e5','reportedFinding':'Own suitable test/conditions/observation/controls not explicit','authorCorrection':'Given case observations unchanged; task and expected performance require own bounded bromine test for fresh sample C; mandatory profile expectation'},
 {'goalShortId':'973c12d9','reportedFinding':'Explain-only observable performance does not require actual execution','authorCorrection':'Mandatory observable performance explicitly requires future actual supervised approved-protocol execution; both fictional materials remain exact and cannot fulfill that component'},
 {'goalShortId':'363c5740','reportedFinding':'Vacant central acceptor orbital not explicit','authorCorrection':'One fragment case and first mandatory expectation explicitly bind occupied ligand donor/unoccupied central acceptor orbitals; no exact full copper geometry or all-empty-d claim'},
]
write('six-parent-reported-p-findings-and-literal-reuse.author.json',{'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'AUTHOR response to parent-delivered full P-A science findings and preliminary P-B; no independent approval','immutableV1':bind(V1/'description-positive-gap-author-v1.final.freeze.json'),'reportedFindingResponses':responses,'unchanged26WholeCases':unchanged_cases,'unchanged9WholeProfiles':unchanged_profiles,'changedWholeCaseIds':[a['caseId'] for a,b in zip(oldmat,materials['materials']) if a!=b],'changedWholeProfileGoalIds':[a['goalId'] for a,b in zip(oldspec,specs['goals']) if a!=b],'actualMaterialBodies':30,'actualProfileSpecifications':15,'frozenV1Untouched':True,'independentPScienceApproval':False,'independentA_P_BFindingsFullyFinal':False,'newMaterialFacts':'NIST fusion values actually read; packing model explicitly own didactic input','actualLearnerEvidence':False,'humanApproval':False,'humanTrial':False,'strictNetGain':0,'activeWrites':False})
print(json.dumps({'unchangedWholeCases':26,'unchangedWholeProfiles':9,'targetedChangedCases':4,'targetedChangedProfiles':6,'independentApproval':False,'finalFreezePendingRemainingFindings':True}))

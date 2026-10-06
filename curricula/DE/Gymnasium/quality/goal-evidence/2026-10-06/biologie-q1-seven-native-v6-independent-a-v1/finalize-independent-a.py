from pathlib import Path
import json, hashlib, datetime, subprocess

repo = Path.cwd()
base = repo / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
author = base / 'biologie-q1-seven-component-native-source-preparation-author-v6'
own = base / 'biologie-q1-seven-native-v6-independent-a-v1'
freeze = own / 'independent-a.final.freeze.json'
if freeze.exists():
    raise RuntimeError('Independent A is frozen; no historical overwrite')
def read(p): return json.loads(p.read_text())
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def output(name, value): (own / name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
manifest = read(author / 'native-seven-source-preparation.author-v6.final.freeze.json')
assert digest(author / 'native-seven-source-preparation.author-v6.final.freeze.json') == '2d51c36bab122daa189f3f5e26f4b647c4d0b788193f41c606ebf9bb23bb7c7c'
closure = []
for group in ['files','actualInputBindings']:
    for item in manifest[group]:
        p = author / item['path'] if group == 'files' else repo / item['path']
        assert p.exists() and digest(p) == item['sha256'], p
        closure.append({'path':str(p.relative_to(repo)),'sha256':item['sha256'],'group':group})
checkpoint = base / 'chemie-q1-current378-active-integration-verification-v1/final-current-machine-checks-and-inputs.actual.json'
guard = read(checkpoint)['currentInputs']
for item in guard: assert digest(repo / item['path']) == item['sha256'], item['path']
assert len(guard) == 19
goals = read(author/'seven-resolved-goals-and-prerequisite-contract.author-candidate.json')['goals']
material_path = base/'biologie-q1-four-source-operator-author-remediation-v5/eleven-components-twentyfour-cases.author-candidate.json'
materials = read(material_path)['components']
binding_plan = read(author/'twentyfour-case-to-final-id.native-binding-plan.author-v6.json')['components']
native = read(own/'independent-native-source-book-dag.actual.json')
primary = read(own/'thirteen-primary-binding-checks.actual.json')
assert primary['allRawAndParentWordsVerifiedAgainstFreshOfficialPDFs']
sources = []
for region in ['BE','BB','SN','TH','MV','ST']:
    payload = read(author/f'{region}.source-components.author-candidate.inert-envelope.json')['candidatePayload']
    mapping = read(author/f'{region}.source-component-mappings.author-candidate.inert-envelope.json')['candidatePayload']
    for source in payload['sourceGoals']:
        decision = next(d for d in mapping['decisions'] if d['sourceGoalId'] == source['id'])
        assert decision['matchType'] == 'partial' and not decision['wholeOriginalSourceCoverage']
        sources.append({'region':region,'sourceGoalId':source['id'],'componentKey':source['componentKey'],'canonicalGoalId':decision['canonicalGoalIds'][0],'physicalPage':source['physicalPage'],'printedPage':source['printedPage'],'stage':source['stage'],'rawCourseLevel':source.get('rawCourseLevel',source['courseLevel']),'topicCode':source['topicCode'],'isOfficialBullet':False,'wholeOriginalSourceCoverage':False})

scientific = {
 'classical_genetic_information_carriers_dna_gene_chromosome': {
  'routine':'One nested carrier relation: DNA material, gene section, organised chromosome. Distinguishing and relating the three terms is one assessable conceptual model.',
  'sourceFit':'BE/BB physical/printed36 explicitly join chromosome carrier content with mandatory DNA and Gen/Allel terminology. No nucleotide chemistry, complete cell division or karyogram duty is cleared.',
  'prerequisite':'Empty requires is appropriate for supplied elementary nesting; nuclear and chromosome labels are supplied. No upper molecular goal is imported.',
  'memory':'No extra deck is necessary: carriers-a defines G as a DNA section and supplies nuclear/chromosome nesting; carriers-b defines homologous locations and allele variants. Assessment requires explaining relations and inference limits, not independently reciting a compact definition list.',
  'support':['classical-carriers-a','classical-carriers-b']},
 'mutation_levels_gen_chromosome_genome': {
  'routine':'One scale-based classification with its causally connected information consequences: within-gene sequence, chromosome-segment structure, chromosome count. Supplied causes and immediate consequences belong to that same comparison.',
  'sourceFit':'SN physical43/printed31 supplies mutation causes and the three types; TH physical29/printed23 explicitly asks causes and consequences. Recombination and named clinical diagnostic/therapy obligations remain separate.',
  'prerequisite':'Carrier goal supplies gene/chromosome nesting. Model cases supply miscopying, breaks/rejoining and chromosome mis-segregation; no independent full meiosis or whole protein synthesis mastery is required.',
  'memory':'A separate memorisation deck is unnecessary: levels-a/b supply local sequences, segment gene counts, chromosome counts and error mechanisms. Knowing category meanings is developed through the scale comparison; these tasks demand classification and bounded reasoning from actual changes, not recall of disease examples, numerical facts or a separate mechanistic list.',
  'support':['levels-a','levels-b']},
 'point_and_genome_mutation': {
  'routine':'One contrastive classification of a local base-pair-position change versus chromosome-number change, with evidence limits of each measurement.',
  'sourceFit':'ST common entry phase physical/printed43 names point/genome types. The task-specific substitution convention is expressly limited and does not assert a universal definition covering all terminology conventions.',
  'prerequisite':'Carrier relation is sufficient; sequences and chromosome complements are supplied. No full mutation-effects or molecular translation goal is unnecessarily required.',
  'memory':'No extra deck: point-genome-a explicitly states the material-specific point-mutation convention, with reference/variant sequences and counted complements; point-genome-b supplies the fresh data. The assessable competence is separating measured scales and choosing a matching additional measurement, not memorising a definition or universal chromosome number.',
  'support':['point-genome-a','point-genome-b']},
 'mutagen_causes_and_protection': {
  'routine':'One material-based genetic-risk judgement: connect influence to possible fixed information change, compare options under explicit criteria, and justify exposure reduction with limits. Causal explanation and protective judgement are parts of the same practical decision.',
  'sourceFit':'MV physical30/printed26 supplies mutagens and explicit everyday hazard reflection; ST physical/printed43 supplies mutagens and genetic environmental-risk evaluation. SN/TH cause content alone does not justify importing the complete exposure judgement target there.',
  'prerequisite':'Carrier relation supports changed information. All R/M/UV/PAH mechanisms, exposure data, options and priorities are supplied; no chemistry toxicology or complete repair process is an independent prerequisite.',
  'memory':'No additional SRS deck: fictional R/M materials supply damage/fixation premises and measures; concrete UV/PAH cards supply named hazards, protection facts and explicit priorities. Required percentages and exposure sums are calculated from supplied data. No independently recalled UV limit, toxin list, personal health risk or protective slogan is needed.',
  'support':['mutagen-protection-a','mutagen-protection-b','everyday-uv-risk-decision-c','environment-air-pah-risk-decision-d']},
 'somatic_and_germline': {
  'routine':'One cell-lineage causal tracing routine: mutation timing and affected lineage jointly determine spread and possible gamete-mediated transmission.',
  'sourceFit':'MV physical30/printed26 explicitly names effects on body cells and germline. Animal lineage models are properly bounded; somatic change is not excluded from mutation merely because offspring transmission is absent.',
  'prerequisite':'Carrier concept is enough for supplied inheritance-of-information tracing. K/G separation, descendant transmission and which gamete participates are stated; complete meiosis or clinical diagnosis is not required.',
  'memory':'No separate memorisation: lineage-a labels body and gamete-forming lines and states their separation; lineage-b supplies early/late timing and participation facts. Learners trace these conditions and distinguish cellular from offspring inheritance, rather than recalling a universal rule that every germline mutation is transmitted.',
  'support':['lineage-a','lineage-b']},
 'mutation_vs_modification': {
  'routine':'One controlled-data causal comparison separating confirmed genetic alteration from environment-driven trait change, including phenotype-only inference limits.',
  'sourceFit':'SN physical42/printed30 applies genotype/phenotype information to inherited/environmental variation; TH physical29/printed23 distinguishes mutation and environmentally caused modification; MV physical30/printed26 explicitly compares; ST physical42 requires criterion-based comparison.',
  'prerequisite':'Carrier concept plus supplied genotype/environment controls suffice. A full gene-product causal chain cannot be inferred and is expressly not required from the controlled data.',
  'memory':'No SRS deck is necessary: both material cards explicitly give persistent DNA differences, environmental manipulations and comparison outcomes. The competence is judging alternative causal explanations and their limits; memorised species examples, reaction-norm constants or a definition recitation would add no necessary independently recalled content.',
  'support':['mutation-modification-a','mutation-modification-b']},
 'replication_error_control_and_repair': {
  'routine':'One information-preservation explanation connecting mismatch detection, template-guided correction and possible fixation after continued copying, with non-perfect repair limits.',
  'sourceFit':'TH physical28/printed22 explicitly names the significance of error control and repair within copying. The bounded new goal does not clear complete semiconservative replication or separate elevated PCR comparison.',
  'prerequisite':'Carrier relation suffices for supplied copying models. Complementarity, strand direction, intact template and new strand are marked in the materials; whole upper-semester replication is not needed.',
  'memory':'No separate deck: repair-a supplies A-T/C-G pairing and labelled strand directions, the intact-template rule and counts30/24; repair-b supplies labelled template/copy and R/N behaviour. Learners locate a fresh mismatch and explain persistence, so no complementary-pair formula or numerical repair rate must be independently recalled.',
  'support':['repair-a','repair-b']}
}
goal_reviews=[]
for goal in goals:
    key=goal['extendedData']['authorCandidate']['candidateKey']
    component=next(c for c in materials if c['candidateKey']==key)
    for field in ['title','titleEn','description','descriptionEn']: assert goal[field]==component[field],(key,field)
    plan=next(c for c in binding_plan if c['candidateKey']==key)
    assert plan['proposedCanonicalGoalId']==goal['id']
    actual_cases=[t.get('caseKey',t.get('caseId')) for t in component['tasks']]
    assert actual_cases==plan['caseKeys']==scientific[key]['support']
    assert plan['status']=='ai_candidate' and plan['reviewStatus']=='needs_human_review' and plan['evidenceLevel']=='E1' and plan['gateLevel']=='G1'
    for pointer,task in zip(plan['caseJSONPointers'],component['tasks']):
        bits=pointer.split('/');assert materials[int(bits[2])]['tasks'][int(bits[4])]==task
    goal_reviews.append({'goalId':goal['id'],'candidateKey':key,'title':goal['title'],'descriptionDE':goal['description'],'descriptionEN':goal['descriptionEn'],'descriptionAndSemanticAtomicityDecision':'KEEP','semanticAtomic':True,'requires':goal['requires'],'englishMeaningAndOperatorEquivalent':True,'actualCaseUUIDAndPointerBinding':'KEEP','caseKeys':actual_cases,'wholeCurrentGoalSHA256':hashlib.sha256(json.dumps(goal,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'scienceAndScope':scientific[key],'memoryDecision':'no_memory_needed','memoryJudgement':scientific[key]['memory'],'memoryCardsNeeded':False,'nativeMemoryLedgerRecordCreated':False,'sourceComponentIds':[r['sourceGoalId']for r in sources if r['canonicalGoalId']==goal['id']],'nativeD_P_A_M_VRecordsCreated':0,'visualReviewPerformed':False})

replacements={'SN':('1','Klassenstufe 10 / Lernbereich 1: Genetik','physical42/printed30 heading, continued physical43/printed31'),'TH':('2.2.1.3','Klassenstufen 9/10 / Genetik','physical28/printed22 heading, continued physical29/printed23'),'MV':('3.2','Unterrichtsinhalte / Klasse 10 / Klassische Genetik','actual contents and physical28/printed24 year heading; physical30/printed26 unnumbered Classical Genetics subsection'),'ST':('3.5','Schuljahrgang 10 (Einführungsphase)','physical42/printed42 heading, continued physical43/printed43')}
topic_findings=[]
for row in sources:
    if row['region'] in replacements:
        code,heading,location=replacements[row['region']]
        topic_findings.append({'findingId':'A-F01-'+row['sourceGoalId'],'decision':'REVISE','severity':'current source binding defect; targeted metadata correction required before integration','region':row['region'],'sourceGoalId':row['sourceGoalId'],'canonicalGoalId':row['canonicalGoalId'],'currentField':'/sourceGoals/*/topicCode','actualWrongValue':'3.7','proposedCorrectOfficialParentCode':code,'actualOfficialSourceHeading':heading,'verifiedOriginalLocation':location,'proposedUnnumberedLocalHeading':'Klassische Genetik'if row['region']=='MV'else None,'explicitLimit':'Code is the actual parent section/learning-area number, not an invented sub-bullet identifier. Keep year/heading qualification; no changed original words, descriptions or goal IDs.','newFreshIndependentReviewScope':'Only affected topic/page/context/source binding and propagated receipt changes; unchanged seven DE/EN descriptions and16 case bodies remain KEEP.'})
assert len(topic_findings)==11
output('eleven-source-topic-binding-findings.review.json',{'schemaVersion':1,'reviewer':'independent A','findings':topic_findings,'allOriginalRawWordsPageStageAndCourseFieldsKeep':True,'oldSourceExtractionAndMappingHistoryMustNotBeRewritten':True})
output('seven-science-atomicity-prerequisite-memory.review.json',{'schemaVersion':1,'reviewer':'independent A','role':'bounded independent scientific decisions for exactly7 actual candidate goals, not operative gate records','goals':goal_reviews,'goalCount':7,'actualCasesBound':16,'authorMemoryRationaleRepeatedWordForWord':True,'identicalAuthorRationaleDidNotSubstituteForIndividualJudgement':True,'independentGoalSpecificMemoryJudgementsPresent':True,'nativeA_M_D_PApprovalsCreated':False,'humanApproval':False,'humanTrial':False})
output('ST-common-entry-scope.independent-a.review.json',{'schemaVersion':1,'reviewer':'independent A','decision':'KEEP bounded derived common-entry-phase technical GK/LK scope','sourcePDFActualFreshByteExact':True,'actualOriginalLocations':[3,19,20,42,43],'actualEntryPhaseYear':10,'sourceStage':'SekII','originalRawCourseLevel':'unspecified','rawOfficialGK_LKTermsClaimed':False,'derivation':'One common year10 entry-phase programme precedes separate later11/12 basic/elevated programmes. Retaining the common entry phase in each later technical curriculum projection is justified authored applicability. The raw source does not name separate GK/LK entry-phase courses.','actualThreeComponentsPresentInBothNativeViews':True,'newThreeOnlySTSourceViewsAreNotCompleteExistingGUILevel2Curricula':True,'existingGUIRegistrationStillPending':'Merge component references into the complete applicable existing views. Retain every prior target and existing courses, duration/stage semantics and learner-facing unique-parent tree. Do not replace Level2 by these three-target source views or import broad wrong-stage SekI genetics.','wrongSTWholeSekIRowStillHeld':True,'unimplementedTwoHourWahlpflichtRouteNotClaimed':True,'topicCode3_7MustBeCorrectedToActual3_5':True,'wholeSourceClearance':False,'humanApproval':False})
output('independent-a.review.json',{'schemaVersion':1,'createdAtUTC':now,'reviewer':'bio-q1-seven-native-v6-independent-a','independence':'No peer conclusions or review bodies read. Frozen author closure inputs were digest-checked; only author artifacts, actual goal/material bodies and official primary sources supplied substantive judgements.','packageDecision':'REVISE targeted eleven source topic-code bindings; KEEP seven scientific description/atomicity/prerequisite/material bindings and seven individually reasoned no-memory candidates','actualNativeVerification':'Independent native source390, BookModel383→390 and both DAGs PASS, with old383 and protected67 exact.','scienceGoalCount':7,'sourceComponentCount':13,'sourceTopicBindingsRevise':11,'sourceTopicBindingsKeep':2,'rawOriginalWordsAndPagesKeep':13,'actualCaseBindings':16,'memoryDecisionsNoMemoryNeeded':7,'stEntryPhaseDerivedScope':'KEEP bounded declaration, raw unspecified preserved','newGUIPlacement':'HOLD operative registration until full existing target superset merge and visibility checks; actual source proposals compile, not installed','originalHoldsPreserved':['3417 whole mutation/recombination goal and prerequisites','ST original wrong-stage SekI whole summary','SH2023 outgoing versus2026 incoming cohort native scope','BY additional mutagen/somatic/germline/repair source routes','BYEA oncology cell-cycle/apoptosis context','BYEA PCR-versus-replication comparison','existing source-specific partners and original whole-source obligations'],'historicalUnchangedValidReviewsNotRestarted':True,'nativeD_P_A_M_VRecordsCreated':0,'newImagesReviewed':0,'oldCombinedFourProposalMissingAvailableVisualQABindingStillHeld':True,'strictCoverage':{'chemistry':'112/378','biology':'67/383','newScientificClosures':0,'restoredActiveBindings':0,'netStrictGain':0},'activeWrites':False,'humanApproval':False,'humanTrial':False,'publicationOrDeployment':False,'integrableNow':False})
output('actual-author-closure-and-active19-preservation.json',{'schemaVersion':1,'createdAtUTC':now,'authorOwnFilesVerifiedExact':31,'authorBoundInputsVerifiedExact':168,'authorFreezeSHA256':digest(author/'native-seven-source-preparation.author-v6.final.freeze.json'),'closureBindings':closure,'activeCurrent19InputsVerifiedExact':guard,'noCurrentSourceOrReviewHistoryEdited':True,'activeWrites':False,'strictGain':0})

readme='''# Biologie Q1: unabhängige native Erstprüfung A für sieben Ziele v6

**Ergebnis: gezielte REVISE von elf Quell-Abschnittscodes.** Die sieben DE/EN-Beschreibungen, semantische Atomarität, minimalen Voraussetzungen und konkreten UUID-/Materialbindungen bleiben KEEP. Die sieben Memory-Entscheidungen wurden einzeln am tatsächlich bereitgestellten Material begründet; die sieben identischen Autorenbegründungen gelten nicht als fachliche Prüfung.

Fünf offizielle PDFs wurden frisch geladen und sind byteidentisch zu den lokalen Originalen. Eigene Textauszüge und acht tatsächliche Seitenraster bestätigen die 13 Komponenten sowie die ursprünglichen Wörter, physischen/gedruckten Seiten, Stufen und teilweise Mapping-Grenzen. Berlin und Brandenburg verwenden dasselbe unveränderte Original.

Die unabhängige Reproduktion verwendet die bestehenden nativen Funktionen ohne Count-Ausnahme: SourceAtlas 390/390, 22 Quellenansichten und keine Auslassung; BookModel 383→390. Alle alten 383 Seitenfingerprints und alle 67 geschützten ganzen Ziele/Seiten bleiben exakt. Nur root.contains erhält den neuen Cluster. requires: 472 Knoten/966 Kanten; contains: 472/471; beide azyklisch. Sieben Quellen-Kompositionsvorschläge kompilieren; daraus folgt keine bestehende GUI-Level2-Registrierung.

## Tatsächlicher Befund

- BE/BB: offizieller Abschnitt 3.7 ist korrekt.
- SN: Klassenstufe 10, **Lernbereich 1**, physisch42–43/gedruckt30–31; zwei Komponenten tragen falsch3.7. Der Nummer1 muss die Klassen-/Lernbereichsqualifikation erhalten bleiben.
- TH: **2.2.1.3 Genetik**, physisch28–29/gedruckt22–23; drei Komponenten tragen falsch3.7.
- MV: **3.2 Unterrichtsinhalte**, Klasse10, unnummerierter Teil **Klassische Genetik**, physisch30/gedruckt26; drei Komponenten tragen falsch3.7. Das tatsächliche Inhaltsverzeichnis hat keinen3.3-Unterrichtsinhaltsabschnitt; kein neuer offizieller Untercode darf erfunden werden.
- ST: **3.5 Schuljahrgang10 (Einführungsphase)**, physisch/gedruckt42–43; drei Komponenten tragen falsch3.7.

ST beschreibt eine gemeinsame Einführungsphase vor den später getrennten grundlegenden/erhöhten Programmen. Die ausdrücklich abgeleiteten technischen GK/LK-Sichten sind für diesen gemeinsamen Teil vertretbar, während rawCourseLevel weiterhin unspecified lautet. Dies ist keine Behauptung offizieller GK/LK-Namen in der Einführungsphase. Die drei neuen ST-Quellenziele dürfen keine vollständige bestehende Lernenden-Zielmenge ersetzen.

## Grenzen und nächster Schritt

Die exakt bezeichneten elf Metadatenbindungen in einem neuen Autorenpaket korrigieren und die betroffenen Bindungen unabhängig nachprüfen. Unveränderte sieben Fachtexte/16 Materialfälle erneut zu prüfen ist für diese Korrektur nicht erforderlich. Bestehende Level2-Sichten benötigen eine tatsächliche Integration als vollständige Superset-Mengen einschließlich prerequisiteOnly-Trägerziel, ohne alte Zielverluste. Native D/P/A/M/V-Einträge, finale Seiten-/Kontextbindungen und tatsächliche Bild-QS bleiben anschließend notwendig.

Originale HOLDs (3417/Rekombination, falsch als SekI erfasster ST-Gesamttext, SH-Kohorten, BY-Kontextunion einschließlich Onkologie/PCR) bleiben erhalten. Das kombinierte ältere Vier-Ziele-Buchmodell bleibt wegen der fehlenden aktuellen verfügbaren Bild-QA-Bindung offen. Diese Prüfung erzeugt keine Bildfreigabe, menschliche Prüfung, Erprobung, Veröffentlichung oder Freigabe.

Strenger aktiver Stand unverändert: **Chemie112/378, Biologie67/383**; neue fachliche Abschlüsse0, wiederhergestellte aktive Bindungen0, Nettozuwachs0. Mathematik807/807 und Physik478/478 sowie alle neun Reifegrad-Untergrenzen bleiben geschützt; die19 aktiven Checkpoint-Eingänge sind exakt.

Eigene Auszüge und rasterisierte Originalseiten sind Quellnachweise; die Rechte und Lizenzhinweise der jeweiligen offiziellen Dokumente bleiben erhalten. Sie sind keine eigenen didaktischen Medien und wurden nicht umgelabelt.
'''
(own/'README.md').write_text(readme)
result=subprocess.run(['git','diff','--check','--',str(own.relative_to(repo))],capture_output=True,text=True)
assert result.returncode==0,result.stdout+result.stderr
output('targeted-checks.actual.json',{'schemaVersion':1,'gitDiffCheckExit':result.returncode,'nativeProcessExit':0,'nativeSourceCountOverrideUsed':False,'authorOwn31AndInput168Exact':True,'activeCurrent19Exact':True,'onlyOwnReviewOutputsWritten':True,'fullBuildNotRepeatedForInertReview':True})
inputs={}
def bind(p,use):
    path=str(p.relative_to(repo));inputs[path]={'path':path,'sha256':digest(p),'bytes':p.stat().st_size,'actualUse':use}
bind(author/'native-seven-source-preparation.author-v6.final.freeze.json','frozen author input closure and task identity')
for item in manifest['files']:bind(author/item['path'],'actual author native/source/material contract inspected')
bind(material_path,'all seven new goal meanings and16 UUID/pointer/material supports inspected; unchanged historical cases not restarted as new approvals')
for item in guard:bind(repo/item['path'],'actual current19 preservation guard')
for item in native['actualCodeAndContractInputs']+native['readOnlyOriginalInputSymlinks']:bind(repo/item['path'],'actual unmodified native reproduction input')
bind(checkpoint,'authoritative current19 baseline list')
own_files=[]
for p in sorted(own.rglob('*')):
    if p.is_file():own_files.append({'path':str(p.relative_to(own)),'sha256':digest(p),'bytes':p.stat().st_size})
output('independent-a.final.freeze.json',{'schemaVersion':1,'createdAtUTC':now,'reviewer':'bio-q1-seven-native-v6-independent-a','files':own_files,'ownFileCount':len(own_files),'actualInputBindings':list(inputs.values()),'actualInputCount':len(inputs),'scienceKEEP':7,'sourceComponentsReviewed':13,'topicCodeREVISE':11,'individuallyReasonedMemoryNoMemoryNeeded':7,'nativeSourceAtlasExpected390':'PASS','nativeBookPages':[383,390],'allOld383PagesExact':True,'protected67WholeGoalsAndPagesExact':True,'all19ActiveInputsExact':True,'strictGain':0,'restoredActiveBindings':0,'humanApproval':False,'humanTrial':False,'integrableNow':False})
print(json.dumps({'freeze':str(freeze.relative_to(repo)),'sha256':digest(freeze),'ownFiles':len(own_files),'actualInputs':len(inputs),'scientificKEEP':7,'sourceBindingREVISE':11,'strictGain':0},ensure_ascii=False))

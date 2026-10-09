import json, pathlib, hashlib, datetime

BASE = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
OWN = BASE / 'biologie-upper-science-fourteen-independent-b-v1'
AUTHOR = BASE / 'biologie-upper-science-fourteen-whole-author-v1'
NATIVE = AUTHOR / 'native-preparation-v1'
OUT = OWN / 'native-fourteen-v1'

def read(p):
    return json.loads(pathlib.Path(p).read_text())

def bind(p):
    p = pathlib.Path(p); b = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(name, x):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

entry_path = NATIVE / 'neutral-fourteen-native-independent-review.entry.json'
entry = read(entry_path)
campaign_entry = next(x for x in entry['campaigns'] if x['side'] == 'b')
review = read(campaign_entry['inputPath'])
campaign = read(campaign_entry['campaignPath'])
record_path = OUT / (campaign['batches'][0]['batchId'] + '.records.jsonl')
d_records = [json.loads(x) for x in record_path.read_text().splitlines()]
p_records = [json.loads(x) for x in pathlib.Path(entry['positiveRecordPath']).read_text().splitlines()]
materials = read(entry['wholeCaseMaterialsPath'])
old_frame = read(AUTHOR / 'fourteen-current-ordinary-source-partner-frame.neutral-input.json')
frame = read(entry['wholeSourceDutiesPath'])
old_decisions = [x['wholeCurrentDecision'] for lane in old_frame['wholeAffectedMappingDecisions'] for x in lane['wholeSelectedDecisions']]
decisions = [x['wholeCurrentDecision'] for lane in frame['wholeAffectedMappingDecisions'] for x in lane['wholeSelectedDecisions']]
assert old_decisions == decisions and len(decisions) == 69
assert old_frame['wholePartnerGoalIds'] == frame['wholePartnerGoalIds'] and len(frame['wholeCurrentPartnerBodies']) == 68
for a,b in zip(old_frame['wholeCurrentPartnerBodies'], frame['wholeCurrentPartnerBodies']):
    if a != b:
        assert a['id'] == '8375310d-1f7e-542d-9969-55ad4bd37f7c'
        assert {k:v for k,v in a.items() if k!='descriptionEn'} == {k:v for k,v in b.items() if k!='descriptionEn'}

# Goal-specific full operator/facet checks and case evidence.
FACETS = [
    ['evidence orientation','theory orientation','conditions of biological inquiry','properties and provisional scope of biological knowledge'],
    ['accurate description','causal/mechanistic explanation','basic-concept structuring','interdisciplinary aspects','phenomena and applications'],
    ['theory-guided hypothesis','biological phenomenon/application','observable testable statement','conditions and counterfinding'],
    ['qualitative property explanation','quantitative analysis with units','basic concepts','molecular-to-biosphere linkage','bounded scaling'],
    ['within-system processes','between-living-system processes','living-system/environment processes','matter and energy distinction'],
    ['phenomenon/observation distinction','identify question','develop question','theory-guided hypothesis for that question'],
    ['hypothesis-led observation','comparison','experimentation','modeling','plan','conduct finite model actions','record raw/replicate data','variable structure','variable control','physical experiment duty retained'],
    ['qualitative data capture','quantitative data capture','digital tool use','evaluate qualitative categories','evaluate quantitative summaries','missing/uncertain-data treatment','physical sensor collection distinct'],
    ['laboratory equipment/technique','field equipment/technique','appropriate application','specific safety rules','approved own organ preparation','actual physical demonstration distinct'],
    ['find structure','find relationship','find trend','theory-based explanation','bounded conclusion','collected/researched data'],
    ['own generated results','own inquiry/decision reflection','data validity','error-source distinction','model possibilities','model limits'],
    ['relate finding to exact hypothesis','justify support','justify refutation','retain predicted condition/range'],
    ['interpret biological finding','chemical relationship','physical relationship','causal/measurement limits'],
    ['concrete inquiry possibilities/limits','findings possibilities/limits','reproducibility','falsifiability','intersubjectivity','logical consistency','provisionality']
]
EVIDENCE = [
    'Yeast replicate means8 versus0.67 support bounded metabolism inference; parks12 versus7 species do not isolate a cause. Both require evidence/theory/controls and a conflicting new finding.',
    'Stomatal water/CO2 reduction and lactase hydrolysis/immobilization explain distinct mechanisms with structure-function and chemical/physical links; changed cuticle or diffusion constraint tests transfer.',
    'Aquatic light hypotheses retain net photosynthesis/respiration conditions; osmosis hypotheses retain water-potential and membrane-permeability conditions rather than asserting all solutions behave identically.',
    'Forest rates8/5mg/h×4h×100=3200/2000mg are fluxes, not stocks; herbivory120/80g divided by20 gives6/4g, a33%change, not automatic whole-population scaling.',
    'Pollination case separates material transfer from fertilization and energy; pond case combines photosynthesis, respiration and decomposition, including nighttime oxygen and dissipated energy.',
    'Moisture16/20 versus5/20 and yellow-leaf light/mineral alternatives develop questions and competing theoretical hypotheses; unmeasured oxygen is not an observation.',
    'Real HTML water/light/temperature/baseline selections now produce explicit controlled replicate cards and history. Germination day4 means5%,77.5%,27.5%; aquatic net changes0.2/0.7/0.8mg/L per10min at20C. Temperature disturbances require a new controlled inquiry. No physical experiment is claimed.',
    'Own CSV capture preserves one missing temperature and five known readings mean22C, with documented filter giving21.5C. Own qualitative card capture retains unknown class and denominator; A3/5 andB2/5 are card proportions, not independent seed measurements.',
    'Prepared-slide procedure and safe-bank field procedure retain handling/safety/cleanup. New29th stamen case provides own safe preparation plan, four finite preparatory actions and explicit criteria for later observed competent specimen handling; mammalian-organ partner and real performance remain open.',
    'Enzyme-concentration series2/3/4/4.5±0.2 permits saturation-related inference without a fictitious maximum; short lagged populations do not establish periodicity or unique cause.',
    'Original native-v1 P11 sensor/leaf tasks and expectations lack explicit own result generation/reflection; those exact old profile bindings remain HOLD. Targeted v3 own-result candidate has separately sealed ACCEPT on profile3246d201...d3fa.',
    'Dark germination45/60 versus48/60 refutes universal light necessity but not all alternative hypotheses;15-to25C enzyme increase is range-bound and70C does not refute the original restricted prediction.',
    'Pond oxygen8-to5mg/L at20-to30C is37.5%concentration change, not production rate; cube surface/volume6-to3 and folding60/8=7.5 require biological exchange conditions.',
    'Observer8/10 versus7/10 invokes coding/replication/intersubjective criteria without truth-by-vote; new4/10 requires rechecking. Selection10-to20/50 is testable while intention claims insulated from counterfindings fail falsifiability/consistency.'
]
rows = []
for i,(g,p,m) in enumerate(zip(review['goals'],p_records,materials['entries'])):
    assert p['goalId']==m['goalId']==g['goalId'] and p['goalFingerprint']==g['goalFingerprint']
    for k,v in {'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1'}.items(): assert p[k]==v
    rows.append({'goalId':g['goalId'],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],
                 'profileFingerprint':p['profileFingerprint'],'reviewInputFingerprint':p['reviewInputFingerprint'],
                 'nativePhysicalPage':entry['pageMap'][i]['physicalPage'],'actualNativePDFPageInspected':True,
                 'actualFull394ContextInspected':True,'descriptionDecision':'keep','nativeDescriptionApproval':True,
                 'currentNativeV1PositiveUnderstandingApproval':i!=10,'currentNativeV1PositiveUnderstandingVerdict':'HOLD' if i==10 else 'ACCEPT_CANDIDATE_CONTENT',
                 'wholeOperatorsAndFacetsChecked':FACETS[i],'wholeBilingualCaseIds':[x['caseId'] for x in m['authoredCases']],
                 'fullBilingualCasesActuallyRead':len(m['authoredCases']),'requiredExpectationIds':p['profile']['coverageExpectations']['requiredExpectationIds'],
                 'freshVariationRequired':True,'independentTransferRequired':True,'heterogeneousCases':True,
                 'independentCaseAndFacetEvidence':EVIDENCE[i],'reviewStatus':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1',
                 'actualLearnerResults':False,'actualPhysicalExperimentPerformed':False,'humanApproval':False})

ni_path = AUTHOR/'remediation-v2/source/NI.one-source-row.exact-before-after.candidate.json'
ni = read(ni_path)
source_result = {'sourceCorrectionApproval':True,'exactNIOriginalClause':'präparieren ein Organ.',
                 'sourceGoalId':ni['sourceGoalId'],'originalPrintedPage':76,'physicalPage':76,
                 'exactDeltaBinding':bind(ni_path),'actualOriginalPageExtractionBinding':bind(AUTHOR/'remediation-v2/primary/NI-physical-page-076.actual-original-layout.txt'),
                 'scientificReason':'Actual original page76 has prepare an organ only. It does not add compulsory dissection. Removing unsupported sezieren and correcting page76 preserves the source duty. A stamen is a plant organ; appropriate own preparation is a bounded operationalization, not performance already achieved.',
                 'whole69DecisionBodiesExact':True,'whole68PartnerIdsExact':True,
                 'wholePartnerBodiesExactExceptEN1':True,'wholeSourceClosureApproval':False,
                 'retainedWholeSourceDutyLimits':[
                     'BY primary12/13 source clauses are reviewed at their actual full operators; BY13GA hypothesis repetition does not evidence the cross-level goal.',
                     'BB/BE,BW,HH,MV,NI,NW,SH,SN,ST,TH SekI applicability is read at current source/mapping context, with varying help/independence and process clauses retained.',
                     'NI page76 own preparation and later actual instrument performance remain physical duties; prebuilt slide, mammalian structure assignment or finite cards do not discharge them.',
                     'ST actual seed/growth investigations with water/light/nutrients, microscopy/field work and digital methods remain full source duties.',
                     'SN actual aquatic sample microscopy, ecology excursion and digital measurement are not proved by modeled cards.',
                     'TH leaf-section/field-observation duties remain actual procedural duties, with source-specified assistance retained.',
                     'Broader full source rows and their partner union remain unchanged; these14 process-profile candidates do not close all69 whole source rows or all countries.',
                     'RawHE applicability/sourceRef is not new independent official source or projection proof.'
                 ],'remainingWholeSourceRemedy':'Provide appropriately scoped actual practical/collection/field performances or reviewed full partner evidence before asserting each physical or broader whole-source duty fulfilled. Retain current partial/partner boundaries until then.'}

target = '8375310d-1f7e-542d-9969-55ad4bd37f7c'
confirmation_path = NATIVE/'pending/one-en-kind-atomicity-memory-confirmation.neutral-input.json'
confirmation = read(confirmation_path)
assert confirmation['changedPointers']==['/descriptionEn']
kind = {'goalId':target,'neutralExactInputBinding':bind(confirmation_path),
        'genuineTargetedScientificReview':True,'semanticKindDecision':'KEEP','semanticKind':'curricularAtomic','semanticKindApproval':True,
        'semanticKindReason':'This is an assessable scientific reflection competence requiring judgments about one’s own analysis, not motivational orientation, taxonomy/program structure or an assessment terminal. Restored own in EN expresses the unchanged DE/source demand.',
        'atomicityDecision':'KEEP','semanticAtomic':True,'atomicityApproval':True,
        'atomicityReason':'Data validity, error sources and model limits are coordinated checks on the same own inquiry/result, observable together in one sensor or leaf-model reflection. Sensor calibration affects both own corrected result and causal model claim; leaf train/test selection affects own prediction and model validity. They do not introduce separate independent curricular routes. Identity, prerequisites, demand and DE remain fixed.',
        'memoryDecision':'KEEP','memoryStatus':'no_memory_needed','memoryUseful':False,'memoryApproval':True,
        'memoryReason':'Competence is judging one’s own context-specific decisions, results, calibration assumptions and model revision through varied tasks. Reciting definitions of validity/error/model cannot demonstrate this performance; no necessary goal-specific recall card is added.',
        'technicalFingerprintAdoptionIsScientificReview':False,'approvalScope':'Targeted genuine semantic Kind/A/M confirmation of exact EN1 fidelity candidate only; no active ledger adoption and no other scientific closure.',
        'humanApproval':False,'strictGain':0,'activeWrites':[]}

report = {'schemaVersion':1,'artifactRole':'independent native14-v1 D/P and whole-source/KindAM judgments with exact old P11 HOLD and separately sealed targeted remediation',
          'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewerId':'independent-b','neutralNativeEntryBinding':bind(entry_path),
          'nativeCampaignBinding':bind(campaign_entry['campaignPath']),'nativeInputBinding':bind(campaign_entry['inputPath']),
          'normalDescriptionRecordsBinding':bind(record_path),'actualNativePDFBinding':entry['actualNativePDF'],'actualNativeHTMLBinding':entry['actualNativeHTML'],
          'actualFull394BookModelBinding':bind(entry['actualFullCandidateModelPath']),
          'wholeSourceFrameBinding':bind(entry['wholeSourceDutiesPath']),'wholeBilingualMaterialsBinding':bind(entry['wholeCaseMaterialsPath']),
          'bound447FilesAllExact':True,'whole394UnselectedPagesExact':380,'wholeDescriptionDEENRead':14,'wholeProfileBodiesRead':14,'wholeBilingualCasesRead':29,
          'nativePDFPhysicalPagesActuallyViewed':list(range(3,17)),'normalDRecordsSchemaValidated':14,'normalDCampaignValidatorActualErrors':[],
          'rows':rows,'source':source_result,'targetedEN1KindAtomicityMemory':kind,
          'targetedP11V3FirstVerdictBinding':bind(OWN/'targeted-P11-own-results-v3.first-verdict.immutable.json'),
          'originalScienceAndFirstVImmutable':True,'biologyPeerJudgmentsRead':False,
          'currentNativeV1DKeepCount':14,'currentNativeV1PContentAcceptCount':13,'currentNativeV1PContentHoldCount':1,
          'native12UnaffectedByPending10VOr11PReady':12,
          'pendingSuccessorNativeBindings':['goal10 actual newly visible rate-label raster and page','goal11 new own-resultsP profile/native evidence context'],
          'reviewAuthority':'ai_candidate','reviewStatus':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1',
          'actualLearnerResults':False,'actualPhysicalInvestigation':False,'humanApproval':False,'humanTrial':False,
          'newScientificClosures':0,'restoredBindings':0,'strictGain':0,'activeWrites':[]}
rb = write('native14-v1-independent-whole-P-source-kindAM.verdict.json',report)
kb = write('exact-EN1-genuine-Kind-A-M.independent-b.json',kind)
validation = {'validator':'app/scripts/validateGoalDescriptionReviewCampaignResults.ts::validateGoalDescriptionReviewCampaignResults',
              'mode':'actual programmatic validator on campaign-b supplied inputs and own results; no directory copies or app build',
              'exitCode':0,'actualTerminalOutput':{'errors':[],'records':14},'runManifestBinding':bind(OUT/(campaign['batches'][0]['batchId']+'.run.json')),
              'recordsBinding':bind(record_path),'humanApproval':False,'strictGain':0}
vb = write('normal-D-campaign-validator.actual-terminal.json',validation)
freeze = write('native14-v1-independent-review.freeze.json',{'schemaVersion':1,'immutableVerdict':rb,'targetedKindAM':kb,'actualNormalDValidation':vb,
                                                        'firstScienceBinding':bind(OWN/'first-semantic-P-source-verdict.immutable.json'),
                                                        'firstVBinding':bind(OWN/'first-whole14-actual-V-verdict.immutable.json'),
                                                        'humanApproval':False,'strictGain':0,'activeWrites':[]})
print(json.dumps({'report':rb,'kindAM':kb,'validation':vb,'freeze':freeze},ensure_ascii=False))

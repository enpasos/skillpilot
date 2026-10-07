import copy, datetime, hashlib, json, pathlib

REPO = pathlib.Path('/home/enpasos/projects/skillpilot')
BASE = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
OWN = BASE + 'biologie-q1-seven-active-integration-independent-b-v1/'
PREP = BASE + 'biologie-q1-seven-final-native-review-inputs-author-v1/'
CAND = BASE + 'biologie-q1-seven-reviewed-integration-candidate-v1/'
INPUTS = {}
def data(path):
    b = (REPO/path).read_bytes()
    INPUTS[path] = dict(path=path, sha256=hashlib.sha256(b).hexdigest(), bytes=len(b))
    return b
def read(path): return json.loads(data(path))
def check(condition, why):
    if not condition: raise AssertionError(why)
def diffs(a,b,path=''):
    if type(a) != type(b): return [dict(path=path,before=a,after=b)]
    if isinstance(a,dict):
        out=[]
        for k in sorted(set(a)|set(b)):
            if k not in a or k not in b: out.append(dict(path=path+'/'+k,before=a.get(k),after=b.get(k)))
            else: out += diffs(a[k],b[k],path+'/'+k)
        return out
    if isinstance(a,list):
        if len(a)!=len(b): return [dict(path=path,before=a,after=b)]
        return [d for i,(x,y) in enumerate(zip(a,b)) for d in diffs(x,y,path+'/'+str(i))]
    return [] if a==b else [dict(path=path,before=a,after=b)]

capture=read(OWN+'before/active-before.capture.json')
before=read(OWN+'before/00-DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
active=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
candidate=read(CAND+'canonical-390.integration-candidate.json')
check(active==candidate,'Active canonical differs from independently reviewed integration candidate')
old={g['id']:g for g in before['goals']}; current={g['id']:g for g in active['goals']}
root='e8d54127-d42e-51f5-bfa5-51d826069f95'; cluster='d32d7a5e-26ac-5019-85f2-c994e2c6e795'
dinput=read(PREP+'round-b/description-review-input.json'); ids=[r['goalId'] for r in dinput['goals']]
check(len(old)==464 and len(current)==472 and set(current)-set(old)==set(ids+[cluster]),'Unexpected node membership')
old_changes=[]
for id,g in old.items():
    restored=copy.deepcopy(current[id])
    if id==root:
        check(restored['contains']==g['contains']+[cluster],'Unexpected root insertion')
        restored['contains'].remove(cluster)
        old_changes.append(dict(goalId=id,field='contains',added=[cluster]))
    check(restored==g,'Historical goal delta '+id)
check(current[cluster]['contains']==ids,'Unexpected new branch membership/order')
for id in ids:
    check(current[id]['requires']==([] if id==ids[0] else [ids[0]]),'Nonminimal reviewed requires '+id)
    check('authorCandidate' not in current[id].get('extendedData',{}),'Transient metadata returned')

qa_before=read(OWN+'before/01-biologie.qa.json'); qa=read('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
qb={r['goalId']:r for r in qa_before['records']}; qa_by={r['goalId']:r for r in qa['records']}
check(len(qb)==383 and len(qa_by)==390 and set(qa_by)-set(qb)==set(ids),'Unexpected QA membership')
check(all(qa_by[id]==row for id,row in qb.items()),'Old QA row changed')
old_images=[]
for row in capture['availableOldPublicImages']:
    data(row['path']); check(INPUTS[row['path']]['sha256']==row['sha256'],'Old image changed '+row['goalId']);old_images.append(row)
check(len(old_images)==67,'Before capture image count differs')
stage1=read(CAND+'qa-artifacts/reviewed-seven-active-integration.stage-1.actual.json')
copied=[]
for row in stage1['actualCopiedAssets']:
    source=data(row['source']['path']); target=data(row['destination']['path'])
    check(source==target and INPUTS[row['destination']['path']]['sha256']==row['source']['sha256'],'Copied asset bytes differ')
    copied.append(dict(source=INPUTS[row['source']['path']],destination=INPUTS[row['destination']['path']]))
check(len(copied)==28,'Expected 7 times 3 PNG copies and 7 prompts')
for id in ids:
    row=qa_by[id]; check(row['aiApproved']=='yes' and row['humanApproved']=='no','Visualization approval boundary')
    check(row['aiApprovedAssetSha256']==row['assetSha256'],'Visualization QA hash mismatch')
    check(row['assetSha256']=='sha256:'+INPUTS[row['publicAssetPath']]['sha256'],'Public image differs from reviewed image')
    check(len(current[id]['resourceLinks'])==1 and current[id]['resourceLinks'][0]['url']==row['imageUrl'],'Goal image binding differs')

sources=[]; st_pending=[]
components=dict(zip(['classical_genetic_information_carriers_dna_gene_chromosome','mutation_levels_gen_chromosome_genome','point_and_genome_mutation','mutagen_causes_and_protection','somatic_and_germline','mutation_vs_modification','replication_error_control_and_repair'],ids))
for st in ['BE','BB','SN','TH','MV','ST']:
    old_source=read(PREP+'inputs/source-components/'+st+'.source-extraction.candidate.json')
    source_path=f'curricula/DE/Gymnasium/input/{st}/source-components/DE_{st}_BIOLOGIE_GENETICS_COMPONENTS.author-v6.source-extraction.json'
    source=read(source_path)
    sd=diffs(old_source,source)
    expected_sd=[dict(path='/qualityReview/status',before='author_candidate_awaiting_two_independent_reviews',after='machine_reviewed_bounded_components')]
    if st=='ST': expected_sd += [dict(path=f'/sourceGoals/{i}/courseProfileDerivation/independentReview',before='pending',after='machine_reviewed_bounded_common_entry_phase') for i in range(3)]
    check(sd==expected_sd,'Unexpected extraction promotion fields '+st)
    check(source['wholeNationalClearance'] is False and source['originalWholeSourceDecisionsUnchanged'] is True,'Whole source hold removed '+st)
    check(source['qualityReview']['humanApproval'] is False and source['qualityReview']['humanTrial'] is False,'Human approval claimed '+st)
    map_path=f'curricula/DE/Gymnasium/mapping/DE-{st}/source-components/{st.lower()}_biology_genetics_components.author-v6.review.json'
    old_map=read(PREP+'inputs/source-components/'+st+'.mapping.candidate.json'); mapping=read(map_path)
    md=diffs(old_map,mapping)
    allowed=['/sourceExtractionPath','/reviewStatus','/machineReviewEvidence']+[f'/decisions/{i}/independentReviewStatus' for i in range(len(mapping['decisions']))]
    check(set(d['path'] for d in md)==set(allowed),'Unexpected mapping promotion fields '+st)
    check(mapping['sourceExtractionPath']==source_path and mapping['reviewStatus']=='machine_reviewed_bounded_components','Wrong active mapping route/status')
    me=mapping['machineReviewEvidence']
    check(me['humanApproval'] is False and me['wholeOriginalSourceCoverage'] is False and me['originalAuthorRationalesPreservedAsAuthored'] is True,'Wrong current review authority')
    check(BASE+'biologie-q1-seven-native-v7-independent-b-v1/independent-b-v7.first-pass.final.freeze.json' in me['independentSourceReviewFreezePaths'],'Own source review missing')
    check(BASE+'biologie-q1-seven-native-v7-independent-b-v1/independent-b-v8-targeted-followup.final.freeze.json' in me['independentSourceReviewFreezePaths'],'Own v8 source followup missing')
    check(mapping['wholeOriginalSourceCoverage'] is False and mapping['humanApproval'] is False and mapping['humanTrial'] is False,'Whole/human mapping clearance claimed')
    sb={r['id']:r for r in source['sourceGoals']}; rows=[]
    for decision in mapping['decisions']:
        sg=sb[decision['sourceGoalId']]
        check(decision['decision']=='mapped' and decision['matchType']=='partial' and decision['wholeOriginalSourceCoverage'] is False,'Wrong bounded component decision')
        check(decision['canonicalGoalIds']==[components[sg['componentKey']]],'Source/goal UUID binding differs')
        check(decision['independentReviewStatus']=='machine_reviewed_by_two_independent_reviews','Unpromoted source review')
        check(sg['wholeOriginalBulletCoverage'] is False and sg['wholeOriginalSummaryPreserved'] is True and sg['isOfficialBullet'] is False,'Original bullet boundary collapsed')
        if st=='MV': check(sg['sourceSectionContext']['parentHeadingPhysicalPage']==17 and sg['sourceSectionContext']['parentHeadingPrintedPage']==13,'MV heading location regressed')
        if st=='ST':
            check(sg['stage']=='SekII' and sg['courseProfile']=='GK_LK' and sg['rawCourseLevel']=='unspecified' and sg['courseProfileIsOriginalOfficialTerm'] is False,'ST course/stage boundary changed')
            check(sg['courseProfileDerivation']['independentReview']=='machine_reviewed_bounded_common_entry_phase','ST reviewed scope qualifier missing')
        else: check(sg['stage']=='SekI','Non-ST source stage changed')
        if st in ['BE','BB']: check(decision['canonicalGoalIds']==[ids[0]],'Carrier direct scope widened')
        else: check(ids[0] not in decision['canonicalGoalIds'],'Carrier indirect prerequisite promoted to direct source')
        rows.append(dict(sourceGoalId=sg['id'],canonicalGoalIds=decision['canonicalGoalIds'],componentKey=sg['componentKey'],stage=sg['stage'],topicCode=sg['topicCode'],physicalPage=sg['physicalPage'],printedPage=sg['printedPage'],sourceSectionContext=sg.get('sourceSectionContext'),verdict='KEEP',reason='Actual active component payload is identical to personally read and independently reviewed final v7/v8 original-source component. Only bounded machine review metadata and production route changed.'))
    sources.append(dict(region=st,sourcePath=source_path,mappingPath=map_path,sourceDeltas=sd,mappingDeltaPaths=[d['path'] for d in md],components=rows,wholeOriginalSourceHoldRetained=True,authoredHistoricalRationalesPreserved=True,peerAResultsRead=False))
check(sum(len(s['components']) for s in sources)==13,'Wrong component count')

registry_before=read(OWN+'before/03-de-gymnasium-math-physics.config.json'); registry=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
reg_restored=copy.deepcopy(registry); rb=[s for s in registry_before['subjects'] if s['subject']=='biologie'][0]; ra=[s for s in registry['subjects'] if s['subject']=='biologie'][0]
rd=diffs(rb,ra)
check(set(d['path'] for d in rd)=={'/semanticAtomicityConfigPath','/memoryReviewConfigPath','/resolutionIndexPaths','/positiveEvidenceConfigPaths'},'Unexpected registry scientific scope delta')
for key in ['resolutionIndexPaths','positiveEvidenceConfigPaths']: check(ra[key][:-1]==rb[key],'Historical registry bindings removed '+key)
reg_restored['subjects']=[rb if s['subject']=='biologie' else s for s in reg_restored['subjects']]
check(reg_restored==registry_before,'Other subject/config changed')
positive=data(CAND+'positive.seven.independent-current.review.jsonl'); own_positive=data(BASE+'biologie-q1-seven-final-native-p-independent-b-v1/positive-evidence.seven.independent-b.review.jsonl')
check(positive==own_positive,'Production current P rows differ from own seven frozen B records')
drecords=data(CAND+'native-d-seven/round-b/results/independent-b.batch-001.records.jsonl')
check(drecords==data(BASE+'biologie-q1-seven-final-native-d-independent-b-v1/results/independent-b.batch-001.records.jsonl'),'Copied native B description records differ')

guard_changes=[]
for row in capture['checkpoint19ActualBeforeBindings']:
    data(row['path']); actual=INPUTS[row['path']]
    if actual['sha256']!=row['sha256']: guard_changes.append(dict(path=row['path'],before=row['sha256'],after=actual['sha256']))
allowed_guard_changes={'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','app/scripts/sourceCoverageAndApplicabilityRegression.test.ts','docs/qa-ci/status/curriculum-quality-status.json','docs/qa-ci/status/curriculum-quality-status.md','docs/legal/ai-transparency-inventory.json'}
check(all(r['path'] in allowed_guard_changes for r in guard_changes),'Unrelated central protected input changed')
report=dict(schemaVersion=1,createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),role='Independent B actual active integration delta review, scoped to seven already reviewed Biology Q1 goals and 13 source components',verdict='KEEP',oldCanonicalNodeCount=464,currentCanonicalNodeCount=472,old383WholeAtomicGoalsUnchanged=True,onlyHistoricalNodeDelta=old_changes,newGoalIds=ids,minimalRequiresRetained=True,old383QARowsUnchanged=True,old67ActuallyExistingPublicPNGsUnchanged=True,old316MissingRowsNotClaimedAsImageCoverage=True,newAssetCopies=copied,sourcePromotions=sources,stUnchangedAuthorDerivationPendingQualifier=st_pending,stMetadataNote='Unchanged historical author qualifier; operative machine review status is the explicitly promoted extraction/mapping status. Root was notified. No scope/science change.',registryChangedFields=[r['path'] for r in rd],otherRegistrySubjectsExact=True,oldDAndPBindingsPreserved=True,currentPSevenRecordsExactlyOwnFrozenB=True,currentDSevenBRecordsExactlyOwnFrozenB=True,protected19ActualChanges=guard_changes,retainedWholeSourceHolds=['Whole original documents and retained summary goals','All uncovered bullet aspects','SH cohort boundaries','ST common entry phase versus later technical GK/LK','Old BY/3417 and four-operative-goal obligations'],peerAReviewOutputsRead=False,activeWrites=False,humanApproval=False,humanTrial=False,centralFullCheckPerformedByThisReviewer=False,allActualInputs=list(INPUTS.values()))
report['stMetadataNote']='The three stale pending qualifiers reported by reviewer B were replaced only by machine_reviewed_bounded_common_entry_phase. Actual recursive payload comparison proves no change to stage, raw course names, technical projections, original section evidence, or any source/aspect content.'
(REPO/OWN/'active-deltas.independent-b.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(verdict='KEEP',oldGoals=383,oldImages=67,newGoals=7,sourceComponents=13,copiedAssets=28,STMetadataPending=len(st_pending))))

import datetime, hashlib, json, pathlib, subprocess

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
OUT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-four-current-D56-native-owner-context-scoping-AUTHOR-INERT-c-v1/current-root-P15-QA346-qualified-native-followers-v2'
MANIFEST = SRC / 'actual20-indirect-current-ID-original-two-review-P-page-source-context-manifest.AUTHOR-INERT.json'
CAN = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
REG = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
BOOKCFG = ROOT / 'app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
guards = {}
def binding(path):
    p = pathlib.Path(path)
    if not p.is_absolute(): p = ROOT / p
    b = p.read_bytes()
    item = {'path': str(p.relative_to(ROOT)), 'sha256':'sha256:'+hashlib.sha256(b).hexdigest(), 'bytes':len(b)}
    guards[item['path']] = item
    return item
def read(path):
    binding(path)
    p = pathlib.Path(path)
    return json.loads((p if p.is_absolute() else ROOT/p).read_text())
def lines(path):
    binding(path)
    p = pathlib.Path(path)
    return [json.loads(x) for x in (p if p.is_absolute() else ROOT/p).read_text().splitlines() if x.strip()]
def contained(node, expected):
    if isinstance(node,dict): return node == expected or any(contained(v,expected) for v in node.values())
    if isinstance(node,list): return any(contained(v,expected) for v in node)
    return False
def refs(page):
    return {(f,r['goalId']):r for f in ['requires','reverseRequires','externalPrerequisites','externalReverseRequires'] for r in page[f]}

started = datetime.datetime.now(datetime.timezone.utc).isoformat()
headBefore = subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
assert hashlib.sha256(MANIFEST.read_bytes()).hexdigest() == 'f4ed01b3cc0d0396277c723cb42e004c1cc9c140b7ed6d0f63ac8fd930ed1cb8'
manifest = read(MANIFEST)
notes = read(OUT/'own-individual-context-judgments.json')
assert len(notes['judgments']) == 20 and len({x['prefix'] for x in notes['judgments']}) == 20
canon = {x['id']:x for x in read(CAN)['goals']}
reg = read(REG)
subject = next(x for x in reg['subjects'] if x['subject'] == 'wirtschaftswissenschaften')
bookcfg = read(BOOKCFG)
bookprofiles = {x['goalId']:x for p in bookcfg['evidenceReviewPaths'] for x in lines(p)}
currentProfiles = {}
for p in subject['positiveEvidenceConfigPaths']:
    cfg=read(p)
    for r in lines(cfg['reviewPath']):
        if r['goalId'] in currentProfiles: assert currentProfiles[r['goalId']] == r
        currentProfiles[r['goalId']]=r
rows = []
for info in manifest['goals']:
    actual=binding(info['wholeContextArtifact']['path'])
    assert actual == info['wholeContextArtifact']
    d=read(info['wholeContextArtifact']['path']); gid=d['goalId']; g=d['wholeCurrentGoal']
    assert g == canon[gid]
    assert d['wholeCurrentPositiveRecord'] == currentProfiles[gid] == bookprofiles[gid]
    assert d['wholeCurrentPositiveRecord']['status']=='needs_human_review'
    assert d['wholeCurrentPositiveRecord']['reviewAuthority']=='ai_candidate'
    assert d['wholeCurrentPositiveRecord']['evidenceLevel']=='E1'
    assert d['wholeCurrentPositiveRecord']['maximumClaimScope']=='G1'
    ownerPath=ROOT/info['oldRegisteredOwner']; owner=read(ownerPath)
    resolutionInfo=next(r for r in owner['resolutions'] if r['goalId']==gid)
    oldResolutionPath=ownerPath.parent/resolutionInfo['resolutionPath']
    oldResolution=read(oldResolutionPath)
    assert oldResolution == d['wholeOriginalResolution']
    assert binding(oldResolutionPath)['sha256']==resolutionInfo['resolutionDigest']
    oldFacts=[]
    for wrapped in d['wholeOriginalRegisteredTwoRoundRecordsAndRuns']:
        roundName='round-a' if wrapped['round']=='first' else 'round-b'
        roundPath=ownerPath.parent/roundName
        record=wrapped['wholeOriginalScientificRecord']; run=wrapped['wholeOriginalActualRun']
        runfiles=list((roundPath/'results').glob('*.run.json'))
        matching=[p for p in runfiles if read(p).get('runId')==run['runId']]
        assert len(matching)==1 and read(matching[0])==run
        recordfiles=list((roundPath/'results').glob('*.records.jsonl'))
        matchingRecords=[]
        for p in recordfiles:
            hits=[r for r in lines(p) if r.get('recordId')==record['recordId']]
            matchingRecords.extend((p,r) for r in hits)
        assert len(matchingRecords)==1 and matchingRecords[0][1]==record
        assert binding(matchingRecords[0][0])['sha256']==run['outputDigest']
        originalInput=next(r['wholeOriginalInputGoal'] for r in d['wholeOriginalRegisteredBothInputs'] if r['round']==wrapped['round'])
        originalInputFile=read(roundPath/'description-review-input.json')
        assert contained(originalInputFile,originalInput)
        assert originalInput['currentDescriptionDe']==g['description'] and originalInput['currentDescriptionEn']==g['descriptionEn']
        assert originalInput['currentTitleDe']==g['title'] and originalInput['currentTitleEn']==g['titleEn']
        oldProfile=originalInput['reviewContext'].get('evidenceProfile')
        if oldProfile is not None: assert oldProfile==d['wholeCurrentPositiveRecord']
        oldFacts.append({'round':wrapped['round'],'recordId':record['recordId'],'runId':run['runId'],'provider':run['provider'],'model':run['model'],'startedAt':run['startedAt'],'completedAt':run['completedAt'],'independenceGroupId':run['independenceGroupId'],'blindToOtherRuns':run['blindToOtherRuns'],'wholeOriginalRunAndRecordExact':True,'evidenceProfileWasNull':oldProfile is None,'wholeOldEmbeddedProfileExactIfPresent':True if oldProfile is not None else None})
    for s in d['existingSourceOriginFacetsAndPartialBoundaries']:
        assert binding(s['sourceFile']['path'])==s['sourceFile']
        assert binding(s['mappingFile']['path'])==s['mappingFile']
        assert contained(read(s['sourceFile']['path']),s['wholeExistingSourceAtom'])
        assert contained(read(s['sourceFile']['path']),s['wholeExistingSourcePassage'])
        for edge in s['wholeCurrentMappings']: assert contained(read(s['mappingFile']['path']),edge)
        for decision in s['wholeCurrentDecisions']: assert contained(read(s['mappingFile']['path']),decision)
    for ng in d['wholeCurrentNeighborGoalBodies']: assert ng==canon[ng['id']]
    oldPage=d['wholeOriginalRegisteredBothInputs'][0]['wholeOriginalInputGoal']['reviewContext']['page']
    newPage=d['wholeCurrentNativePage']; oldrefs=refs(oldPage); newrefs=refs(newPage)
    changed=[{'relationship':key[0],'goalId':key[1],'before':oldrefs.get(key),'current':newrefs.get(key)} for key in sorted(set(oldrefs)|set(newrefs)) if oldrefs.get(key)!=newrefs.get(key)]
    note=next(x for x in notes['judgments'] if gid.startswith(x['prefix']))
    rows.append({'goalId':gid,'titleDe':g['title'],'decision':note['decision'],'inputArtifact':actual,'wholeCurrentGoalAndPMatchActive':True,'oldPEmbeddedParityClaim':not oldFacts[0]['evidenceProfileWasNull'],'actualCurrentCaseCount':len(d['wholeCurrentPositiveRecord']['profile']['applicationCaseBriefs']),'wholeHistoricalDualReviewFacts':oldFacts,'wholeHistoricalResolutionExact':True,'acceptedHistoricalSynthesis':oldResolution.get('synthesis',{}),'nativePageCurrentAsSupplied':newPage,'actualNeighborFieldDeltas':changed,'sourceFacetBindings':[{k:s[k] for k in ['sourceFile','mappingFile']} for s in d['existingSourceOriginFacetsAndPartialBoundaries']],'contextAssessment':note})
assert len(rows)==20
assert sum(r['actualCurrentCaseCount'] for r in rows)==41
ended=datetime.datetime.now(datetime.timezone.utc).isoformat()
endguards=[]
for path,initial in list(guards.items()):
    p=ROOT/path
    b=p.read_bytes(); final={'path':path,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
    assert final==initial
    endguards.append(final)
headEnd=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
absent=[r['goalId'] for r in rows if r['wholeHistoricalDualReviewFacts'][0]['evidenceProfileWasNull']]
present=[r['goalId'] for r in rows if not r['wholeHistoricalDualReviewFacts'][0]['evidenceProfileWasNull']]
assert len(absent)==17 and len(present)==3
report={'status':'independent-bounded-current-context-KEEP-20-author-P-absence-metadata-REVISE-not-native-D-activation','provider':'OpenAI','model':'GPT-6','runtime':'Codex','exactModelRevision':'not_exposed','samplingParameters':'not_exposed','actualTechnicalAuditStartedAt':started,'actualTechnicalAuditCompletedAt':ended,'reviewInputHead':manifest['HEAD'],'technicalAuditHeadBefore':headBefore,'technicalAuditHeadEnd':headEnd,'historicalTimesArePreservedNotNewExecutions':True,'headBoundary':'Root-authorized archive/documentation merge may advance HEAD without changing measured inputs; individual byte guards are authoritative.','currentContentCaseCount':41,'decisions':{'KEEP':20,'REVISE':0,'OPEN':0},'860Boundary':'KEEP only actual accepted_first historical analysis evidence, current whole P2 and unchanged descriptions. Historical rejected B production field remains visible and is not called scientific parity. No new review of valid unchanged goal.','actualOldPAbsentIds17':absent,'actualOldPWholeExactPresentIds3':present,'authorMetadataFinding':{'decision':'REVISE','fields':['oldPositiveProfileWasAbsent','currentPWasAbsentFromOldDescriptionInput'],'affectedIds':present,'reason':'The actual original inputs contain entire P records for these three in both rounds. Those old/current records are whole-object exact. Correct the author indicator additively; no historical science changes required.'},'newBlindReview':False,'humanApproval':False,'strictM7CountClaim':False,'activeWrites':0,'existingSourceScopeAndVisualApprovalsNotNewlyGranted':True,'CNewCurrentJudgmentsRead':False,'rows':rows,'actualInputAndEndguards':endguards}
target=OUT/'actual-twenty-current-whole-context-and-historical-dual-proof-independent-KEEP.READONLY.json'
assert not target.exists();target.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
ownfiles=[p for p in OUT.iterdir() if p.is_file()]
seal={'status':'SEALED-20-bounded-context-KEEP-with-explicit-860-accepted-first-and-P-null-boundaries','sealedAt':ended,'activeWrites':0,'newBlindDReview':False,'humanApproval':False,'strictM7Claim':False,'inputEndguardCount':len(endguards),'artifacts':[{'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in sorted(ownfiles)]}
sealpath=OUT/'SEALED-twenty-current-contexts-original-dual-science-preserved-860-accepted-first.READONLY.json'
assert not sealpath.exists();sealpath.write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'seal':str(sealpath.relative_to(ROOT)),'sha256':hashlib.sha256(sealpath.read_bytes()).hexdigest(),'endguards':len(endguards),'decisions':report['decisions'],'cases':41}))

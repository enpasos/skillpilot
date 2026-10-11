from pathlib import Path
import datetime, hashlib, importlib.util, json

R=Path.cwd();O=Path(__file__).resolve().parent
load=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def b(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(name,v):
    with(O/name).open('x')as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def without(x,keys):return {k:v for k,v in x.items()if k not in keys}
plan=load(O/'actual-current2-native-groups-and-qualified-source-context-plan.INERT.json')
before=load(O/'inputs-before-current2-native-preparation.READONLY.json')
route=load(O/'actual2-current-registry-prefix-and-per-goal-terminal-owner-candidate.INERT.json')
probe=load(O/'actual-original-native-D-only-current2-candidate-ID-set-measurement.READONLY.json')
checks=load(O/'actual-two-native-current-owner-standalone-V2-container-checks.AUTHOR-INERT.json')
assert checks['readyNativeStandaloneCount']==2
assert probe['before']['descriptionReadyCount']==291 and probe['candidate']['descriptionReadyCount']==291
assert probe['gainedDescriptionReadyGoalIds']==probe['lostDescriptionReadyGoalIds']==[]
assert probe['selected2ReadyGoalIds']==[] and probe['status']=='FAIL-bounded-owner-native-validation'
assert probe['candidate']['scopeIssues']==probe['candidate']['chainIssues']==[]
assert route['baselineIndexCount']==67 and route['candidateIndexCount']==69
assert route['baselineSupersessionCount']==161 and route['candidateSupersessionCount']==163
science=[]
bindings={'campaignId','roundId','bundleFingerprint','bookDigest','pageFingerprint'}
for g in plan['groups']:
    for label,role in [('round-a','first'),('round-b','second')]:
        rd=R/g['outputDirectory']/label
        records=[json.loads(l)for l in next((rd/'results').glob('*.records.jsonl')).read_text().splitlines()]
        run=load(next((rd/'results').glob('*.run.json')))
        assert len(records)==1
        originalRound=next(x for x in g['originalPairs'][g['goalIds'][0]]['existingIndependentRounds']if x['round']==role)
        originalRecord=next(json.loads(l)for l in(R/originalRound['actualResults']['path']).read_text().splitlines()if json.loads(l)['goalId']==g['goalIds'][0])
        originalRun=load(R/originalRound['runManifest']['path'])
        assert without(records[0],bindings)==without(originalRecord,bindings)
        for k in ['runId','provider','model','startedAt','completedAt','blindToOtherRuns','generationParameters','generationParametersFingerprint']:
            assert run.get(k)==originalRun.get(k)
        science.append({'goalId':g['goalIds'][0],'round':role,'wholeOriginalRecordScienceAndStatusExact':True,'wholeOriginalProviderModelScientificTimesAndParametersExact':True,'originalRunId':run['runId'],'originalScientificStartedAt':run['startedAt'],'originalScientificCompletedAt':run['completedAt'],'newReviewRunOrInference':False,'currentQualifiedWholePContextBinding':g['contextQualification'],'wholeHistoricalPExact':g['qualifiedCurrentWholeInput']['wholeBothOriginalRecordsAndInputsAndRuns'][0]['wholeCurrentPExact']})
    gid=g['goalIds'][0];old=load(R/g['originalPairs'][gid]['resolution']['path']);new=load(R/g['outputDirectory']/'resolutions'/f'{gid}.resolution.json')
    def syn(x):
        c=json.loads(json.dumps(x));c.pop('synthesisId');
        for d in c['dissent']:d.pop('dissentId')
        return c
    assert syn(old['synthesis'])==syn(new['synthesis'])
    assert old['goal']['finalText']==new['goal']['finalText']and old['goal']['goalFingerprint']==new['goal']['goalFingerprint']
end=[]
for binding in before['bindings']:
    actual=b(R/binding['path']);assert actual==binding,('input drift',binding['path'])
    end.append({'before':binding,'after':actual,'exact':True})
write('actual-two-current-source-context-original-science-native-owner-and-chain-boundaries.AUTHOR-INERT.receipt.json',{
 'status':'AUTHOR-INERT-two-native-standalone-PASS-central-chain-still-open','actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'originalScientificRecordAndRunParity':science,'nativeStandaloneReady2':True,'nativeCurrentDOnlyBefore':291,'nativeCurrentDOnlyCandidate':291,'gainedIds':[],'lostIds':[],'selectedTwoCurrentReady':[],'scopedChainGraphIssues':[],'historicalDescriptionIssuesRetainedCount':len(probe['candidate']['descriptionIssues']),
 'honestNativeExit':'The original D loader completed with zero scope/chain-graph issues; the wrapper exits1 because both intended owners remain blocked by invalid whole older shared index contexts. Neither current singleton index has native standalone errors. This is not a whole-registry PASS or a strict-completion claim.',
 'concreteRemainingOlderSharedContextBoundaries':[{'goalId':'0d8cb18d-7fd9-56f5-8009-8045d44f4127','invalidOtherGoalInRequiredOlderIndex':'099086bb-5100-5ce0-8334-0aab8850a48e','historicalIndex':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-methods-twenty-current311-resumed-native-preparation-20261008-v1/native-d-methods20-ordered-final/resolution-index.json'},{'goalId':'596c02e3-6263-5084-8593-c5f51808326b','invalidOtherGoalInRequiredOlderIndex':'dae93971-726c-56e5-8044-19dbd40febf7','historicalIndex':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current336-D124-thirteen-concrete-native-configs-inert-a-v1/native/current336-D124-batch-12/resolution-index.json'}],
 'candidateRegistryOnly':{'path':route['candidateRegistryPath'],'indices':69,'supersessions':163,'addedIndices':route['addedIndexPaths'],'addedSupersessions':route['addedSupersessions'],'current67And161PrefixesExact':True,'foreignSubjectObjectsExact':True},
 'twoMeaningQualification':plan['qualifiedSourceContextSeal'],'e2CurrentStrictOwnerRetainedNoDuplicate':plan['alreadyCurrentE2ContextRetainedNoDuplicateOwner'],'whole0dPParityClaim':False,'current0dActualQualifiedEditorialChanges':'four profile language strings plus profile fingerprint/reason/reviewer/reviewedAt; both whole case briefs and all other profile fields exact; historical P-REVISE preserved, current qualification separate','whole596PParity':True,
 'inputBeforeAfter':end,'activeWrites':0,'newD2Reviews':0,'newModelInferenceRuns':0,'humanApproval':False,'sourceCoverageOrCountryCourseUpgrade':False,'integratedClosures':0,'strictClosures':0})
spec=importlib.util.spec_from_file_location('native_schema_validator',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
errors=mod.curriculum_symlink_errors(str(R));assert not errors
parsed=[]
for p in O.rglob('*'):
    if not p.is_file():continue
    assert not p.is_symlink()
    if p.suffix=='.json':load(p);parsed.append(str(p.relative_to(R)))
    elif p.suffix=='.jsonl':
        lines=p.read_text().splitlines();assert all(l.strip()for l in lines)
        for l in lines:json.loads(l)
        parsed.append(str(p.relative_to(R)))
write('actual-original-curriculum-symlink-check-and-whole-written-JSON-JSONL-parse.READONLY.json',{'originalCall':'scripts/validate_schemas.py:curriculum_symlink_errors(repo_root)','errors':errors,'ownSymlinks':0,'parsedWholeFiles':parsed,'activeWrites':0})
artifacts=[b(p)for p in sorted(O.rglob('*'))if p.is_file()]
write('SEALED-two-source-qualified-current-native-owner-followers-original-science-no-new-reviews.INERT.json',{'status':'SEALED-AUTHOR-INERT-native-two-standalone-PASS-original-science-central291-unchanged-chain-open','actualUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'artifacts':artifacts,'inputGuardCount':len(end),'wholeOriginalScientificRecords':4,'wholeOriginalRunFacts':4,'groups':2,'candidateIndexCount':69,'candidateSupersessionCount':163,'nativeBeforeAndCandidateD':291,'nativeGainCount':0,'nativeLossCount':0,'e2NoDuplicateOwner':True,'independentQualificationAndRootIntegrationPending':True,'activeWrites':0,'newD2Reviews':0,'newInferenceRuns':0,'sourceCoverageUpgrade':False,'humanApproval':False,'strictClosures':0})
print(json.dumps({'artifacts':len(artifacts),'endguards':len(end),'nativeStandaloneReady':2,'currentBeforeAndCandidateD':291,'gains':0,'losses':0,'activeWrites':0}))

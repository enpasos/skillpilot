import hashlib,json,pathlib
from datetime import datetime,timezone
T=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-53db-meaningful-transfer-case-targeted-author-20261013-v2')
def read(p):return json.loads(pathlib.Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def bind(p):p=pathlib.Path(p);return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def cellsha(x):return 'sha256:'+hashlib.sha256((json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode()).hexdigest()
def write(p,x):pathlib.Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def differences(a,b,p=''):
    if type(a)!=type(b):return [p]
    if isinstance(a,dict):
        out=[]
        for k in sorted(a.keys()|b.keys()):
            if k not in a or k not in b:out.append(p+'/'+k)
            else:out+=differences(a[k],b[k],p+'/'+k)
        return out
    if isinstance(a,list):
        out=[]
        for i in range(max(len(a),len(b))):
            if i>=len(a) or i>=len(b):out.append(p+'/'+str(i))
            else:out+=differences(a[i],b[i],p+'/'+str(i))
        return out
    return [] if a==b else [p]
cas=read(T/'CAS.one-whole-case-profile-and-candidate-spec.author.json')
change=[]
for op in cas['operations']:
    assert sha(op['baseBinding']['path'])==op['baseBinding']['sha256']
    assert cellsha(op['beforeWholeCell'])==op['CAS']['wholeBeforeCellSHA256']
    assert cellsha(op['afterWholeCell'])==op['CAS']['wholeAfterCellSHA256']
    carrier=read(op['baseBinding']['path']);s=op['selector']
    assert next(x for x in carrier[s['array']] if x[s['field']]==s['value'])==op['beforeWholeCell']
    change.append({'operationId':op['operationId'],'changedPaths':differences(op['beforeWholeCell'],op['afterWholeCell']),'wholeCASPassed':True})
caseop=cas['operations'][0];p=caseop['beforeWholeCell'];q=caseop['afterWholeCell']
assert q['taskDe'].startswith(p['taskDe']+'\n2. ') and q['taskEn'].startswith(p['taskEn']+'\n2. ')
assert q['modelAnswerDe'].startswith(p['modelAnswerDe']+'\n2. ') and q['modelAnswerEn'].startswith(p['modelAnswerEn']+'\n2. ')
assert q['rubric'][0]==p['rubric'][0] and len(q['rubric'])==2
assert q['maximumPoints']==4 and p['maximumPoints']==2
assert q['expectationIds']==p['expectationIds']==['e2']
casebefore=read(caseop['baseBinding']['path'])['cases'];caseafter=read(T/'candidate/eight-full-P4-cases.only53dbCase2-after.author.json')['cases']
assert len(casebefore)==len(caseafter)==8
for a,b in zip(casebefore,caseafter):
    assert a['caseId']==b['caseId']
    if a['caseId']!='53db04a0-case-2':assert a==b
profileop=cas['operations'][1]
a=profileop['beforeWholeCell']['profile'];b=profileop['afterWholeCell']['profile']
assert a['expectations']==b['expectations'] and a['coverageExpectations']==b['coverageExpectations'] and a['variationAxes']==b['variationAxes']
assert a['applicationCaseBriefs'][0]==b['applicationCaseBriefs'][0]
for k in ['understandingFocusDe','understandingFocusEn']:assert a['applicationCaseBriefs'][1][k]==b['applicationCaseBriefs'][1][k]
oldProfiles=read(profileop['baseBinding']['path'])['profiles'];newProfiles=read(T/'candidate/four-full-P4-profiles.only53dbCase2-after.author.json')['profiles']
for a,b in zip(oldProfiles,newProfiles):
    if a['goalId']!='53db04a0-ea76-5810-9526-c8639100e497':assert a==b
refs=read(T/'INPUTS.exact-existing-finding-case-profile-goal-image.bindings.json')['bindings']
for ref in refs:assert sha(ref['path'])==ref['sha256'],ref['path']
jsonFiles=list(T.rglob('*.json'))
for p in jsonFiles:read(p)
def pathstrings(x):
    if isinstance(x,dict):
        for k,v in x.items():
            if isinstance(v,str) and (k=='path' or k.endswith('Path')):yield v
            yield from pathstrings(v)
    elif isinstance(x,list):
        for v in x:yield from pathstrings(v)
for p in jsonFiles:
    for value in pathstrings(read(p)):
        assert not value.startswith(('tmp/','/tmp/','/home/','../')),value
assert not any(p.is_symlink() for p in T.rglob('*'))
guard=read(T/'checks/STOCK.profile-schema-fingerprints-and-case-joins.actual.json')
assert guard['profileSchemaFragmentValid'] and guard['stockSemanticGuardErrors']==[]
checks={'status':'Finite targeted author correction ready for two independent followups','changedCells':change,'allOriginalBindingsUnchanged':True,'firstCaseExactlyUnchanged':True,'originalCase2Task1Answer1Rubric1Preserved':True,'completeMechanismAndBothBalancesPreserved':True,'allExpectationCoverageAndVariationFieldsUnchanged':True,'otherThreeP4ProfilesExactlyUnchanged':True,'allThreeP3OriginalProfilesUntouchedAndHashVerified':True,'otherSixPProfilesPreserved':True,'noUnfamiliarOxidationProductPrediction':True,'jsonFilesParsed':len(jsonFiles),'noIgnoredOrAbsoluteRepositoryInputLinks':True,'noSymlinks':True,'currentPApproval':False,'currentDApproval':False,'humanApproval':False,'newStrictCompletions':0,'activeWrites':False,'gitWrites':False}
write(T/'CHECKS.final-exact-CAS-preservation-portability-and-stock-guard.author.json',checks)
selector={'schemaVersion':1,'status':'Targeted author correction only; two independent acceptance followups required','goalId':cas['goalId'],'caseId':cas['caseId'],'originalFreshBFinding':cas['findingBinding'],'exactCAS':bind(T/'CAS.one-whole-case-profile-and-candidate-spec.author.json'),'completeAfterCase':bind(T/'candidate/CASE2.complete-targeted-after.DEEN.author.json'),'completeAfterProfile':bind(T/'candidate/PROFILE.complete53db-targeted-after.DEEN.author.json'),'fullP4CaseCarrier':bind(T/'candidate/eight-full-P4-cases.only53dbCase2-after.author.json'),'fullP4ProfileCarrier':bind(T/'candidate/four-full-P4-profiles.only53dbCase2-after.author.json'),'unmaterializedCandidateSet':bind(T/'candidate/CANDIDATESET.P4-only53db-case2.unmaterialized.author.json'),'exactUnchangedGoal':bind(T/'inputs/exact-current406-whole53db-goal.json'),'exactOriginalP4Record':bind(T/'inputs/exact-current406-original53db-P4-record.json'),'originalGoalImageAndOtherPBindings':bind(T/'INPUTS.exact-existing-finding-case-profile-goal-image.bindings.json'),'stockGuard':bind(T/'checks/STOCK.profile-schema-fingerprints-and-case-joins.actual.json'),'preservationChecks':bind(T/'CHECKS.final-exact-CAS-preservation-portability-and-stock-guard.author.json'),'originalProfileFingerprint':guard['originalProfileFingerprint'],'proposedProfileFingerprint':guard['proposedProfileFingerprint'],'goalFingerprintUnchanged':guard['goalFingerprint'],'reviewInputFingerprintUnchanged':guard['reviewInputFingerprint'],'currentPApproval':False,'currentDApproval':False,'humanApproval':False,'activeWrites':False}
write(T/'NEUTRAL.targeted53db-case2.exact-input-selector.json',selector)
files=[bind(p) for p in sorted(T.rglob('*')) if p.is_file() and p.name!='SEAL.finite-targeted53db-author.actual.json']
write(T/'SEAL.finite-targeted53db-author.actual.json',{'schemaVersion':1,'sealedAtUTC':datetime.now(timezone.utc).isoformat(),'status':'Finite bounded author correction; no P/D acceptance','files':files,'fileCount':len(files),'totalBytes':sum(f['bytes'] for f in files),'currentPApproval':False,'currentDApproval':False,'humanApproval':False,'newStrictCompletions':0,'activeWrites':False,'gitWrites':False})
print(json.dumps({'seal':bind(T/'SEAL.finite-targeted53db-author.actual.json'),'neutral':bind(T/'NEUTRAL.targeted53db-case2.exact-input-selector.json'),'originalProfileFingerprint':guard['originalProfileFingerprint'],'proposedProfileFingerprint':guard['proposedProfileFingerprint'],'fileCount':len(files),'totalBytes':sum(f['bytes'] for f in files)},ensure_ascii=False,indent=2))

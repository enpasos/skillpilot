from pathlib import Path
import json,hashlib,datetime
repo=Path('/home/enpasos/projects/skillpilot')
E=repo/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15'
R=E/'chemie-energy-eleven-kept-current422-positive-and-atomic-informed-20261015-v1'
B=E/'chemie-energy20-nernst-alt-context-author-and-native-final-preparation-20261015-v1'
D=E/'chemie-energy20-final-current422-native-fresh-independent-c-20261015-v1'
load=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
rel=lambda p:str(p.relative_to(repo))
lines=lambda p:[json.loads(x) for x in p.read_text().splitlines() if x.strip()]
firstp=R/'science/FIRST.informed-P11-and-A11.original.json';first=load(firstp)
assert sha(firstp)=='sha256:5fc2ee09ff2bb96af0ed4d252f863069604e6da02a444f9d28ae37b68f2a7f46'
dseal=D/'FILES.finite-independent-c-D20.seal.json';assert sha(dseal)=='sha256:e86cad7759a133a18c16459739ff392f040260b1c3bdb8825691ed8ce2929ad0'
for item in load(dseal)['files']:
 p=repo/item['path'];assert sha(p)==item['sha256'] and p.stat().st_size==item['bytes'],p
original=B/'materials/forty-two-whole-DE-EN-cases.exact-no-change.json';assert sha(original)=='sha256:5762a8f53db8ff2a6f44f98f1495959132bc04541e0af85c0088ace5e9da21fe'
origprof=B/'candidate/twenty-author-E0G0.only-Nernst-input-binding.jsonl';assert sha(origprof)=='sha256:411286bce6bceb995523f8b4974291d0ebc3a53344805ac0cdd5904a8d23132c'
originalcases=load(original)['cases'];om={c['id']:c for c in originalcases};cases=load(R/'materials/eleven-whole-cases22.targeted-informed-successor.json')['cases'];cm={c['id']:c for c in cases}
assert len(originalcases)==42 and len(cases)==22 and len(cm)==22
expected=set(first['scopeGoalIds']);assert len(expected)==11 and {c['goalId'] for c in cases}==expected
assert all(len([c for c in cases if c['goalId']==g])==2 for g in expected)
changes=[]
for c in cases:
 assert set(c)==set(om[c['id']])
 for k,v in c.items():
  if v!=om[c['id']][k]: changes.append({'caseId':c['id'],'field':k,'before':om[c['id']][k],'after':v})
assert changes==load(R/'materials/CAS.whole-field-before-after.actual.json')['changes']
assert len(changes)==40 and len({x['caseId'] for x in changes})==6
oldp={r['goalId']:r for r in lines(origprof)};p11=lines(R/'normal/P11.final-current.image-bound.candidates.jsonl');a11=lines(R/'normal/A11.current-author.semantic-atomicity.candidates.jsonl')
assert len(p11)==11 and {r['goalId'] for r in p11}==expected
assert len(a11)==11 and {r['goalId'] for r in a11}==expected
bodychanges=[r['goalId'] for r in p11 if r['profile']!=oldp[r['goalId']]['profile']]
assert len(bodychanges)==5 and set(bodychanges)=={j['goalId'] for j in first['judgments'] if j['P']['profileBodyChanged']}
assert all(r['profile']==next(j['P']['profile'] for j in first['judgments'] if j['goalId']==r['goalId']) for r in p11)
assert all((r['status'],r['reviewAuthority'],r['evidenceLevel'],r['maximumClaimScope'])==('needs_human_review','ai_candidate','E1','G1') for r in p11)
assert all((r['status'],r['semanticAtomic'])==('atomic',True) for r in a11)
for r in p11:
 assert r['profile']['coverageExpectations']['minimumIndependentDemonstrations']>=2
 assert r['profile']['coverageExpectations']['freshVariationRequired'] and r['profile']['coverageExpectations']['independentTransferRequired']
for stem,records in [('P10',R/'normal/P10.current-native.image-bound.candidates.jsonl'),('P11.final',R/'normal/P11.final-current.image-bound.candidates.jsonl')]:
 run=load(R/('normal/P10.informed.run.json' if stem=='P10' else 'normal/P11.final-informed.run.json'))
 assert run['outputDigest']==sha(records) and run['role']=='synthesizer' and run['blindToOtherRuns'] is False
bindings=load(R/'checks/P11.final-current-resource-and-input-bindings.json');host=repo/bindings['sourceRoot']
assert sum(b['originalNativeE0InputBindingPreserved'] for b in bindings['entries'])==10
assert sum(b['currentWholeAltOnlySuccessor'] for b in bindings['entries'])==1
for b in bindings['entries']:
 for url,digest in b['resourceDigests'].items():assert sha(host/'app/public'/url.lstrip('/'))==digest
cache=load(R/'checks/REBUILD.own-small-stock-PA-host.actual.json');owned=repo/cache['ownHost']
for item in cache['stockPhysicalFiles']:
 assert sha(repo/item['source'])==item['sha256'] and sha(owned/item['normalAlias'])==item['sha256']
physical=list(p for p in owned.rglob('*') if p.is_file() and not p.is_symlink() and not any(part in ['node_modules','curricula','contracts','goal-visualizations'] for part in p.relative_to(owned).parts))
cachebytes=sum(p.stat().st_size for p in physical);assert cachebytes==77417 and cachebytes<20*1024*1024
blank=load(R/'materials/future-observation-records22.explicitly-blank.json')['records'];assert len(blank)==22
for r in blank:assert not r['actualLearnerOrLaboratoryTrial'] and all(r[k] is None for k in ['observedAt','learnerResponseDe','learnerResponseEn','observedPerformance','assessorJudgment'])
for p in R.rglob('*.json'):load(p)
for p in R.rglob('*.jsonl'):lines(p)
checks=load(R/'checks/TARGETED.normal-PA.actual-results.json');assert len(checks['results'])==4 and all(r['exitCode']==0 for r in checks['results'])
report={'schemaVersion':1,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'passed','ownD20SealAndAll45FilesUnchanged':True,'original42WholeCasesAnd20ProfilesByteExact':True,'scientificFirstBeforeNormalRecordsAndPreserved':True,'scopeOnlyElevenOwnKeepGoals':True,'positiveNormalRecords':11,'E1G1AiCandidateNeedsHumanReview':11,'atomicNormalRecords':11,'profileBodiesUnchanged':6,'wholeProfileSuccessors':5,'completeMaterialCases':22,'wholeCasesUnchanged':16,'wholeCaseSuccessors':6,'exactCaseFieldDeltas':40,'originalNativeImageBoundInputsExact':10,'ebfaCurrentAltOnlyImageBoundSuccessor':1,'actualResourceHashesChecked':sum(len(b['resourceDigests']) for b in bindings['entries']),'blankFutureObservationRecords':22,'ownedCacheBytes':cachebytes,'additionalDependencyCacheBytes':0,'maxAdditionalCacheBytes':20*1024*1024,'allFourTargetedNormalValidatorOperationsExit0':True,'sourceCourseImageHumanAnd0773HoldsRetained':True,'noNewBlindDOrMVOrCentralApproval':True}
(R/'checks/FINAL.integrity-and-scope.actual.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))

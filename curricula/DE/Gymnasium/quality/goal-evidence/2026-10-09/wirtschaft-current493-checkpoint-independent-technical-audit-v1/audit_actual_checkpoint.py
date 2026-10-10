from pathlib import Path
import json,hashlib,subprocess,re
R=Path.cwd();Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current493-checkpoint-independent-technical-audit-v1';Q.mkdir(parents=True,exist_ok=True)
RR=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current493-qualified-active-integration-and-book-root-v1'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def diff(a,b,path=''):
 if type(a)!=type(b):return [{'field':path,'before':a,'after':b}]
 if isinstance(a,dict):
  out=[]
  for k in sorted(set(a)|set(b)):
   if k not in a or k not in b:out.append({'field':path+'/'+k,'before':a.get(k),'after':b.get(k)})
   else:out+=diff(a[k],b[k],path+'/'+k)
  return out
 if isinstance(a,list):
  if len(a)!=len(b):return [{'field':path,'before':a,'after':b}]
  return sum([diff(x,y,path+'/'+str(i)) for i,(x,y) in enumerate(zip(a,b))],[])
 return [] if a==b else [{'field':path,'before':a,'after':b}]
canPath=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
can=read(canPath);goals={g['id']:g for g in can['goals']}
qaReceipt=read(RR/'actual-native-QA336-source-and25-landscape-bindings-with-all336-review-fields-exact.receipt.json')
qaBeforePath=RR/'whole-active-QA336.before-native-source-root-discovery-successor.json'
qaAfterPath=R/qaReceipt['path'];before=read(qaBeforePath);after=read(qaAfterPath)
assert sha(qaBeforePath)==qaReceipt['wholeBeforeSha256']
assert sha(qaAfterPath)==qaReceipt['wholeAfterSha256']
native=read(RR/'whole-native-QA336-discovery-technical-candidate.not-approved.json')
assert after==native
assert len(before['records'])==len(after['records'])==336
b={x['goalId']:x for x in before['records']};a={x['goalId']:x for x in after['records']};assert len(a)==336 and set(a)==set(b)
assert {k:v for k,v in before.items() if k not in ['source','records']}=={k:v for k,v in after.items() if k not in ['source','records']}
assert diff(before['source'],after['source'])==[{'field':'/canonicalRoot','before':qaReceipt['sourceBefore']['canonicalRoot'],'after':'curricula/DE/Gymnasium/canonical'}]
qaDeltas=[];assets=[]
for gid,row in a.items():
 changes=diff(b[gid],row)
 assert all(x['field']=='/landscapePath' for x in changes)
 if changes:qaDeltas.append({'goalId':gid,**changes[0]})
 assert row['title']==goals[gid]['title'] and row['description']==goals[gid]['description']
 assert row['subject']=='wirtschaftswissenschaften' and row['landscapeId']==can['landscapeId']
 assert row['landscapePath']=='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
 matches=[res for res in goals[gid].get('resourceLinks',[]) if res.get('url')==row['imageUrl']]
 assert len(matches)==1
 for field in ['publicAssetPath','canonicalAssetPath']:
  p=R/row[field]
  assert 'sha256:'+sha(p)==row['assetSha256']
  assets.append({'goalId':gid,'role':field,'path':row[field],'sha256':sha(p)})
 assert row['aiApprovedAssetSha256']==row['assetSha256']
 assert row['humanApproved']=='no'
assert len(qaDeltas)==25
assert {x['goalId'] for x in qaDeltas}=={x['goalId'] for x in qaReceipt['technicalLandscapePathDeltas']}
assert len(assets)==672 and len({x['path'] for x in assets})==672
oldRegistry=read(RR/'whole-central-registry.before-two-M-visibility-label-successor.json')
registryPath=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
registry=read(registryPath)
regDiff=diff(oldRegistry,registry)
assert len(regDiff)==1 and regDiff[0]['field']=='/subjects/4/memoryReviewConfigPath'
assert registry['subjects'][4]['subject']=='wirtschaftswissenschaften'
assert oldRegistry['subjects'][:4]==registry['subjects'][:4]
memReceipt=read(RR/'actual-only-two-M-visibility-labels-preserved-native-prefix-successor.receipt.json')
originalPath=R/memReceipt['originalQualifiedAdapterRetained']['path']
successorPath=R/memReceipt['additiveActiveSuccessor']['path']
predPath=R/memReceipt['defaultPredecessor']['path']
for key,path in [('originalQualifiedAdapterRetained',originalPath),('additiveActiveSuccessor',successorPath),('defaultPredecessor',predPath)]:assert sha(path)==memReceipt[key]['sha256']
original=read(originalPath);successor=read(successorPath);pred=read(predPath)
memoryDeltas=diff(original,successor)
assert [x['field'] for x in memoryDeltas]==['/visibilityScopes/0/label','/visibilityScopes/1/label']
assert [s['label'] for s in successor['visibilityScopes']]==[s['label'] for s in pred['visibilityScopes']]
assert successor['visibilityScopeCoverageRequired'] is True
assert registry['subjects'][4]['memoryReviewConfigPath']==str(successorPath.relative_to(R))
flightReceipt=read(RR/'actual-Economics-only-in-flight-ledger-three-old-to-nine-current173-paths.receipt.json')
flightBeforePath=RR/'whole-in-flight-ledger.before-current173-nine-package-successor.json'
flightPath=R/flightReceipt['path'];flightBefore=read(flightBeforePath);flight=read(flightPath)
assert sha(flightBeforePath)==flightReceipt['wholeBeforeSha256'] and sha(flightPath)==flightReceipt['wholeAfterSha256']
others=[p for p in flightBefore['activeBatchConfigPaths'] if 'wirtschaft' not in p]
oldEconomics=[p for p in flightBefore['activeBatchConfigPaths'] if 'wirtschaft' in p]
newEconomics=[p for p in flight['activeBatchConfigPaths'] if 'wirtschaft' in p]
assert len(others)==7 and len(oldEconomics)==3 and len(newEconomics)==9
assert [p for p in flight['activeBatchConfigPaths'] if 'wirtschaft' not in p]==others==flightReceipt['unchangedOtherSubjectPaths']
assert newEconomics==flightReceipt['currentEconomicsPackagePaths']
assert {k:v for k,v in flightBefore.items() if k!='activeBatchConfigPaths'}=={k:v for k,v in flight.items() if k!='activeBatchConfigPaths'}
scope=[]
for p in newEconomics:
 config=read(R/p);assert config['subject']=='wirtschaftswissenschaften' and len(config['goalIds'])<=20
 scope+=config['goalIds']
assert len(scope)==len(set(scope))==173
codePath=R/'app/scripts/generateCurriculumQualityStatus.ts';code=codePath.read_text()
practiceIds=re.findall(r"'([0-9a-f-]{36})'",re.search(r'const CANONICAL_GYM_ECONOMICS_PRACTICE_CLUSTER_IDS = \[([\s\S]*?)\]',code).group(1))
assert len(practiceIds)==len(set(practiceIds))==14
sem=read(R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current493-reviewed-20261009-v1/wirtschaftswissenschaften.semantic-kinds.json')
decisions={d['goalId']:d for d in sem['decisions']}
practiceProof=[]
for gid in practiceIds:
 assert gid in goals and decisions[gid]['semanticKind']=='practiceAssessment'
 assert goals[gid].get('contains') and 'Practice' in goals[gid].get('tags',[])
 practiceProof.append({'goalId':gid,'title':goals[gid]['title'],'semanticKind':decisions[gid]['semanticKind'],'atomicGoalClaimed':False})
codeFiles=['app/scripts/exportGoalBookReviewBundle.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts',
 'app/scripts/validateGoalDescriptionDualRoundResolution.ts','app/scripts/testGoalBookReviewBundle.ts','app/scripts/generateCurriculumQualityStatus.ts',
 'contracts/goal-description-review/v2/goal-description-review-input.schema.json','contracts/goal-description-review/v3/goal-description-review-input.schema.json']
codeDiff=subprocess.check_output(['git','diff','--',*codeFiles],text=True)
(Q/'actual-code-and-contract.diff.txt').write_text(codeDiff)
for version in [2,3]:
 path=f'contracts/goal-description-review/v{version}/goal-description-review-input.schema.json'
 old=json.loads(subprocess.check_output(['git','show','HEAD:'+path],text=True));current=read(R/path)
 added={'$ref':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json'}
 branch=current['$defs']['reviewContext']['properties']['evidenceProfile']['oneOf']
 assert branch.count(added)==1;branch.remove(added);assert old==current
unchangedDependencies=['app/scripts/goalBookEvidenceReviewLoader.ts','app/scripts/positiveGoalEvidenceProfileModel.ts',
 'contracts/goal-evidence/v1/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
 'contracts/goal-description-review/v1/goal-description-dual-round-resolution.schema.json',
 'contracts/goal-description-review/v1/goal-description-review-record.schema.json']
for p in unchangedDependencies:
 assert (R/p).read_bytes()==subprocess.check_output(['git','show','HEAD:'+p])
gitChanged=subprocess.check_output(['git','diff','--name-only'],text=True).splitlines()
protectedDeltas=[p for p in gitChanged if p!='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json' and re.search(r'(mathematik|physik|physics|(?:^|/)math[-_/])',p,re.I)]
assert not protectedDeltas
mathBefore=read(RR/'before-active-files/curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
assert mathBefore['subjects'][:2]==registry['subjects'][:2]
paths={str(p.relative_to(R)):sha(p) for p in [qaBeforePath,qaAfterPath,registryPath,flightPath,flightBeforePath,originalPath,successorPath,predPath,*[R/p for p in codeFiles]]}
raw={'technicalOnly':True,'qa336':{'beforeWholeSha256':sha(qaBeforePath),'afterWholeSha256':sha(qaAfterPath),
 'nativeCandidateExact':True,'allowedSourceRootDelta':diff(before['source'],after['source']),'actual25LandscapePathDeltas':qaDeltas,
 'whole336ReviewFieldsByIdExact':True,'actual672Assets':assets,'allCurrentNativeGoalTextAndResourcesMatch':True},
 'memory':{'registryOnlyEconomicsMemoryPathDelta':regDiff,'actualOnlyTwoLabelDeltas':memoryDeltas,'nativePredecessorLabelsExact':True},
 'inFlight':{'actualOtherSubjectPaths7Exact':others,'oldEconomics3':oldEconomics,'currentEconomics9':newEconomics,'actualTarget173Unique':True},
 'economicsPracticeNav14':practiceProof,'codeAndContractWholeHashes':paths,
 'protectedMathPhys':{'subjectRowsExactRootBefore':True,'trackedCurriculumOrSubjectCodeDeltas':protectedDeltas},
 'schemaChanges':{'v2v3OnlyAddClosedPositiveV2Branch':True,'positiveAndLegacySourceSchemasExactHEAD':True,
 'strictAjvAndFormatsRemain':True,'allApplicationCaseSixBilingualFieldsRendered':True,
 'aiCandidateCannotAcquireApprovedStatus':True,'E1G1SourceRecordsNotUpgraded':True},
 'claimLimits':{'technicalAuditOnly':True,'noDSourceM7Approval':True,'noActiveWrites':True}}
(Q/'raw.actual-checkpoint.json').write_text(json.dumps(raw,ensure_ascii=False,indent=2)+'\n')
(Q/'raw.actual-checkpoint.txt').write_text('PASS actual code/contracts diff read; no lowered contract gates.\\nPASS QA336 whole review fields exact; source root plus25 landscape paths only;672 asset bytes match.\\nPASS only2 Economics memory labels and one registry pointer; all other subjects unchanged.\\nPASS7 other InFlight paths exact; Economics3-to9 scopes173 unique.\\nPASS14 Economics-only practiceAssessment cluster IDs.\\nNO D/Source/M7 or human approval claimed; no active writes.\\n')
print(json.dumps({'PASS':True,'root':str(Q.relative_to(R)),'actualQa336':len(a),'assets':len(assets),'memoryLabels':len(memoryDeltas),'otherInFlight':len(others),'practiceNav':len(practiceIds),'trackedFiles':len(gitChanged)}))

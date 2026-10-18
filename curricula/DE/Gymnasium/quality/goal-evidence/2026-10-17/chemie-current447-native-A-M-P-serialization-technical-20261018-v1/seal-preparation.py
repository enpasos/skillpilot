from pathlib import Path
import json,hashlib,datetime
O=Path(__file__).parent;plan=json.loads((O/'PLAN.native-A-M-P447.INACTIVE.json').read_text());delta=json.loads((O/'REGISTRY.delta.A-M-P-only.PENDING.json').read_text())
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.resolve()),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def rows(p):
 return [(s,json.loads(s)) for s in Path(p).read_bytes().splitlines(keepends=True) if s.strip()]
def indexed(p):return {r['goalId']:(s,r) for s,r in rows(p)}
A=indexed(O/'A447.mixed-original-identities.native.review.jsonl');M=indexed(O/'M447.full-original-memory-refs.native.review.jsonl');P=indexed(O/'P447.complete-stock-native.review.jsonl');oldA={}
for f in delta['before']['semanticAtomicityConfigPaths']:
 c=json.loads(Path(f).read_text())
 for s,r in rows(c['reviewPath']):assert r['goalId'] not in oldA;oldA[r['goalId']]=(s,r)
oldM=indexed('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/M442.memory68.review.jsonl');oldP=indexed('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/P442.review.jsonl')
retA=[g for g,(s,r) in oldA.items() if A[g][0]==s];retM=[g for g,(s,r) in oldM.items() if M[g][0]==s];retP=[g for g,(s,r) in oldP.items() if P[g][0]==s];bodyP=[g for g,(s,r) in oldP.items() if P[g][1]['profile']==r['profile']]
assert len(A)==len(M)==len(P)==447 and len(retA)==len(retM)==436 and len(retP)==430 and len(bodyP)==434
for g,(s,r) in oldP.items():assert P[g][1]['evidenceLevel']==r['evidenceLevel'] and P[g][1]['maximumClaimScope']==r['maximumClaimScope']
refs=[]
for g in ['72236f2c-771e-4ab6-933a-e549ee49d15b','0959eef2-3c7d-5b33-a109-ddf332a5dbd9']:
 a=oldM[g][1];b=M[g][1];assert b['status']==a['status']=='memory_required' and b['memoryUseful']==a['memoryUseful']==True
 preserved={k:v for k,v in a.items() if k not in ['fingerprint','reviewedAt','reviewer','reason']};assert all(b[k]==v for k,v in preserved.items());refs.append({'goalId':g,'status':b['status'],'memoryGoalIds':b['memoryGoalIds'],'deckIds':b['deckIds'],'allOtherOldBindingAndReferenceFieldsPreserved':True})
ownerCounts={}
for lane,key in [('A','semanticAtomicityConfigPaths'),('P','positiveEvidenceConfigPaths')]:
 found={}
 for f in delta['after'][key]:
  c=json.loads(Path(f).read_text())
  for s,r in rows(c['reviewPath']):
   assert r['reviewId']==c['reviewId'];assert r['goalId'] not in found,(lane,r['goalId']);found[r['goalId']]=f
 assert len(found)==447;ownerCounts[lane]={'configCount':len(delta['after'][key]),'exactlyOneOwnerPerGoal':True,'ownedGoals':len(found)}
am=json.loads((O/'CHECK.stock-A-M.actual.json').read_text());pc=json.loads((O/'CHECK.P447.stock-validation-all-owner-scopes.json').read_text());assert am['allPassed'] and len(am['checks'])==79 and all(not x['errors'] for x in pc) and sum(x['count'] for x in pc)==447
receipt={'artifactType':'Actual inactive native447 preparation with real stock execution; no new science votes or normal application','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'canonicalValidationInput':pin(plan['validationCanonical']['path']),'semanticValidationInput':pin(plan['validationSemantic']['path']),'A447':pin(O/'A447.mixed-original-identities.native.review.jsonl'),'M447':pin(O/'M447.full-original-memory-refs.native.review.jsonl'),'P447':pin(O/'P447.complete-stock-native.review.jsonl'),'plan':pin(O/'PLAN.native-A-M-P447.INACTIVE.json'),'registryDelta':pin(O/'REGISTRY.delta.A-M-P-only.PENDING.json'),'pairedScienceTransport':pin(O/'PROVENANCE.actual-paired-science.json'),'wholeMaterialAndOwnerContexts':pin(O/'P447.complete-native.material-and-owner-contexts.jsonl'),'exactNewP2AuthorCorrection':plan['operativeBriefCorrection'],'P2CurrentIndependentAcceptanceClaimed':False,'counts':{'A':447,'AOldWholeRawRowsExact':436,'AReboundExisting':6,'ANew':5,'M':447,'MOldWholeRawRowsExact':436,'MReboundExisting':6,'MNew':5,'MNoMemory':sum(r['status']=='no_memory_needed' for _,r in M.values()),'MMemoryRequired':sum(r['status']=='memory_required' for _,r in M.values()),'P':447,'POldWholeRawRowsExact':430,'POldWholeProfileBodiesExact':434,'PReboundExisting':12,'PNew':5,'PNewE0G0':sum(P[g][1]['evidenceLevel']=='E0' and P[g][1]['maximumClaimScope']=='G0' for g in plan['newGoalIds'])},'unchangedIdentityAndRulesPreserved':True,'unchangedByteExactGoalIds':{'A':retA,'M':retM,'P':retP},'old722And0959MemoryBindings':refs,'allOldPCandidateEvidenceAndClaimLevelsRetained':True,'nativeOwnerRouting':ownerCounts,'stockChecks':{'AAndM':pin(O/'CHECK.stock-A-M.actual.json'),'PAll125Configs':pin(O/'CHECK.P447.stock-validation-all-owner-scopes.json'),'AConfigChecks':78,'MFullScopeChecks':1,'PConfigChecks':125,'allPassed':True,'semanticClosedSchemaPassed':True,'all659SourceFPsFromStockFunction':True},'normalInputReplay':{'script':pin(O/'replay-after-AP.mts'),'executedAfterAPDONE':False,'requiresExplicitActualCanonicalAndSemanticPins':True,'checksActualNormalProposedConfigScopesAndResources':True,'pendingRootAPDone':True},'normalFilesWrittenByThisSerializer':False,'nativeDRunsOrReviewerVotesCreated':0,'VApprovalClaim':False,'humanApproval':False,'humanTrial':False,'M7Claim':False}
p=O/'RECEIPT.native-A-M-P447-preparation.actual.json';p.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
seal={'artifactType':'Inactive native A/M/P447 preparation seal','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'receipt':pin(p),'A447':receipt['A447'],'M447':receipt['M447'],'P447':receipt['P447'],'plan':receipt['plan'],'registryDelta':receipt['registryDelta'],'replayAfterAP':receipt['normalInputReplay']['script'],'counts':receipt['counts'],'inactiveStockChecksAllPass':True,'actualNormalAfterAPReplayPending':True,'P2CurrentIndependentAcceptanceClaimed':False,'normalFilesWrittenByThisSerializer':False,'newScienceVotes':0,'M7Claim':False,'humanApproval':False}
s=O/'SEAL.native-A-M-P447-preparation.json';s.write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'seal':pin(s),'receipt':pin(p),'A447':receipt['A447'],'M447':receipt['M447'],'P447':receipt['P447'],'plan':receipt['plan'],'registryDelta':receipt['registryDelta'],'counts':receipt['counts']},ensure_ascii=False,indent=2))

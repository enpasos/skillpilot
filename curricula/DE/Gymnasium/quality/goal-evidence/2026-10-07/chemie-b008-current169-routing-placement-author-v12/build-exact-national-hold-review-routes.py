# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from collections import defaultdict
import json,hashlib
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;assert not(OWN/'author.final.freeze.json').exists()
def read(p):return json.loads(p.read_text())
def bind(p):b=p.read_bytes();return{'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def h(v):return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True).encode()).hexdigest()
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
originPath=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3/all-national-original-nine-source-obligations.actual.json';origin=read(originPath)['directBindings'];index={(r['mappingPath'],r['sourceExtractionPath'],r['wholeSourceGoal']['id'],r['wholeMapping']['canonicalGoalId']):(i,r)for i,r in enumerate(origin)};assert len(index)==1646
receipt=read(OWN/'inputs/source-projection.current.receipt.json.bin');groups=receipt['witnessGroups'];bindings=receipt['inputBindings'];families=set(read(OWN/'current169-protected-guard-and-field-intents.author.json')['originalNineFamilies']);sourceKeys=set();scopeRows=[];allOriginal=[]
for i,row in enumerate(origin):
 allOriginal.append({'originArrayIndex':i,'wholeOriginalMappingValueSha256':h(row['wholeMapping']),'wholeOriginalSourceGoalValueSha256':h(row['wholeSourceGoal']),'wholeOriginalPassageValueSha256':h(row['wholePassage']),'mappingPath':row['mappingPath'],'sourceExtractionPath':row['sourceExtractionPath'],'sourceGoalId':row['wholeSourceGoal']['id'],'familyGoalId':row['wholeMapping']['canonicalGoalId'],'originalMatchType':row['wholeMapping']['matchType'],'sourceSpan':row['wholeSourceGoal'].get('sourceSpan'),'actualWholeSourceText':row['wholeSourceGoal'].get('sourceText'),'officialPrimaryInputRoutes':row['actualPrimaryDocuments'],'wholeSourceClosure':'not newly decided in v12; unchanged original source statuses are preserved'})
for scope in receipt['scopes']:
 refs=[]
 for n in scope['witnessGroupRefs']:
  group=groups[n]
  if group['mappedTargetGoalId']not in families:continue
  key=(bindings[group['mappingInput']]['path'],bindings[group['extractionInput']]['path'],group['sourceGoalId'],group['mappedTargetGoalId']);sourceKeys.add(key);assert key in index,key;i,row=index[key]
  refs.append({'originArrayIndex':i,'sourceGoalId':group['sourceGoalId'],'familyGoalId':group['mappedTargetGoalId'],'sourceSpan':row['wholeSourceGoal'].get('sourceSpan'),'actualWholeSourceText':row['wholeSourceGoal'].get('sourceText'),'originalMatchType':row['wholeMapping']['matchType'],'profileBasis':group['profileBasis'],'coverage':group['coverage'],'actualMappedTargetGoalIds':group['goalIds'],'sourceClaim':'whole original operator/content duty remains distinct from prospective component selection'})
 if refs:scopeRows.append({'viewId':scope['viewId'],'scope':{k:scope.get(k)for k in ['jurisdiction','stage','durationModel','courseProfile']},'actualOriginalSourceWitnesses':refs,'wholeSourceDutyOrProjectionIndependentlyApproved':False})
notProjected=[{'originArrayIndex':i,'sourceGoalId':row['wholeSourceGoal']['id'],'mappingPath':row['mappingPath'],'sourceExtractionPath':row['sourceExtractionPath'],'familyGoalId':row['wholeMapping']['canonicalGoalId'],'sourceSpan':row['wholeSourceGoal'].get('sourceSpan'),'actualWholeSourceText':row['wholeSourceGoal'].get('sourceText'),'routingHold':'Original duty has no currently resolved witness among the source facets; do not infer applicability from phase or map all children.'}for key,(i,row)in index.items()if key not in sourceKeys]
write(OWN/'exact-original1646-current-source-witness-and-primary-review-routes.author-input.json',{'role':'Exact current scope source witness routing into unchanged complete historical original duties; no historical count used as closure','immutableOriginalInventory':bind(originPath),'originArrayName':'directBindings','originalWholeDuties':allOriginal,'currentSourceScopesWithOriginalFamilyWitnesses':scopeRows,'actualCurrentlyProjectedUniqueSourceDutyKeys':len(sourceKeys),'originalUnresolvedFacetDutyRoutes':notProjected,'originalDutiesWithoutResolvedCurrentFacetCount':len(notProjected),'sourceCoverageApprovalsAdded':0,'allCurrentSourceScopesRequireGenuineOperatorStageCourseSelection':True,'sameWholeSourceIDsDoNotApproveEveryNewChild':True,'strictGain':0,'activeWrites':0,'humanApproval':False})
print(json.dumps({'sourceInventoryOriginalWholeRows':1646,'actuallyProjectedUniqueOriginalSourceKeys':len(sourceKeys),'currentOriginalSourceFacetScopes':len(scopeRows),'originalMissingCurrentScope':len(notProjected),'strictGain':0}))

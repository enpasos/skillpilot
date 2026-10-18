from pathlib import Path
import json,hashlib
O=Path(__file__).parent
B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-five-description-two-duty-split-author-20261017-v1')
a=json.loads((B/'AUTHOR.five-current-remediations-and-two-narrow-duty-candidates.pending.json').read_text())
scope=json.loads((B/'SCOPE.two-duty-partitions-and-core-retentions.pending.json').read_text());source=json.loads((B/'SOURCE.two-carrier-partitions.pending.json').read_text());mat=json.loads((B/'MATERIAL.seven-complete-operative-bindings.json').read_text());profiles=json.loads((B/'PROFILES.seven-whole-author-candidates.json').read_text())
def pin(p):
 b=Path(p).read_bytes();return {'path':str(Path(p).resolve()),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def oh(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def ptr(v,p):
 for k in p.split('/')[1:]:
  k=k.replace('~1','/').replace('~0','~');v=v[int(k)] if isinstance(v,list) else v[k]
 return v
c=json.loads(Path(a['inputCanonical']['path']).read_text());g={x['id']:x for x in c['goals']};ps={r['goalId']:r for r in map(json.loads,Path(a['inputWholeProfiles']['path']).read_text().splitlines())}
existing=[]
for i,r in enumerate(a['records']):
 p=r['beforeWholeProfile'];q=r['afterWholeProfile'];existing.append({'goalId':r['goalId'],'currentBeforeGoalExact':g[r['goalId']]==r['beforeGoal'],'currentBeforeProfileExact':ps[r['goalId']]['profile']==p,'wholeProfileUnchanged':p==q,'profileCollectionExact':profiles['records'][i]['profile']==q,'profileCollectionObjectHashMatches':oh(q)==r['afterProfile']['wholeObjectSHA256'],'afterGoalObjectHashMatches':oh(r['afterGoal'])==r['afterWholeGoalSHA256'],'requiredExpectationIdsBefore':p['coverageExpectations']['requiredExpectationIds'],'requiredExpectationIdsAfter':q['coverageExpectations']['requiredExpectationIds'],'preservedWholeObjects':{k:[v['id'] for v in p[k] if v in q[k]] for k in ['expectations','variationAxes','applicationCaseBriefs']},'coverageThresholdAndTransferUnchanged':all(p['coverageExpectations'][k]==q['coverageExpectations'][k] for k in ['minimumIndependentDemonstrations','freshVariationRequired','independentTransferRequired','alternativeExpectationGroups'])})
partitions=[]
for ri,ni in [(2,0),(3,1)]:
 r=a['records'][ri];n=a['newCandidateGoals'][ni];p=r['beforeWholeProfile'];q=r['afterWholeProfile'];new=n['profile'];partitions.append({'coreGoalId':r['goalId'],'newGoalId':n['goalId'],'exactObjectPartitionByField':{k:len(p[k])==len(q[k])+len(new[k]) and all(z in q[k]+new[k] for z in p[k]) for k in ['expectations','variationAxes','applicationCaseBriefs']},'requiredIdsPartitionExact':p['coverageExpectations']['requiredExpectationIds']==q['coverageExpectations']['requiredExpectationIds']+new['coverageExpectations']['requiredExpectationIds'],'oldNonIdCoveragePolicyUnchangedInBoth':all(p['coverageExpectations'][k]==q['coverageExpectations'][k]==new['coverageExpectations'][k] for k in ['minimumIndependentDemonstrations','freshVariationRequired','independentTransferRequired','alternativeExpectationGroups']),'newIdAbsentFromCurrentCanonical':n['goalId'] not in g,'newGoalProfileCollectionExact':profiles['records'][5+ni]['profile']==new})
views={r['viewId']:r for r in json.loads((O/'CHECK.actual-41-view-roles-and-proposed-coordinates.json').read_text())['rows']}
view_checks=[]
for r in scope['rows']:
 v=json.loads(Path(r['currentViewPin']['path']).read_text());current=views[r['viewId']];view_checks.append({'viewId':r['viewId'],'predecessorGoalId':r['predecessorGoalId'],'separateDutyGoalId':r['separateDutyGoalId'],'actualCurrentPinMatches':pin(r['currentViewPin']['path'])['sha256']==r['currentViewPin']['sha256'],'scopeExact':v['scope']==r['scope'],'referencesExact':all(ptr(v,z['pointer'])==z['node'] for z in r['currentReferences']),'actualOldRoleMatches':current['current'][r['predecessorGoalId']]==r['currentRole'],'shadowCoreRoleMatches':current['shadowAfterListedPlacements'][r['coreGoalId']]==r['proposedCoreRole'],'shadowNewRoleMatches':current['shadowAfterListedPlacements'][r['separateDutyGoalId']]==r['proposedSeparateDutyRole']})
source_checks=[]
for r in source['rows']:
 x=json.loads(Path(r['sourceGoal']['path']).read_text());m=json.loads(Path(r['currentMappingDecision']['path']).read_text());sg=ptr(x,r['sourceGoal']['jsonPointer']);md=ptr(m,r['currentMappingDecision']['jsonPointer']);before=md['canonicalGoalIds'];repl=r['replaceOnlyCarrier'];after=[repl['toCandidateGoalId'] if z==repl['fromCanonicalGoalId'] else z for z in before];source_checks.append({'ordinal':r['ordinal'],'sourceWholeObjectHashMatches':oh(sg)==r['sourceGoal']['wholeObjectSHA256'],'currentMappingObjectHashMatches':oh(md)==r['currentMappingDecision']['wholeObjectSHA256'],'courseLevel':sg['courseLevel'],'currentCarrierIds':before,'proposedCarrierIds':after,'sourceAndMappingPins':[pin(r['sourceGoal']['path']),pin(r['currentMappingDecision']['path'])]})
pins=[pin(B/f) for f in ['AUTHOR.five-current-remediations-and-two-narrow-duty-candidates.pending.json','PROFILES.seven-whole-author-candidates.json','SCOPE.two-duty-partitions-and-core-retentions.pending.json','SOURCE.two-carrier-partitions.pending.json','MATERIAL.seven-complete-operative-bindings.json']]
pins += [pin(a[k]['path']) for k in ['inputCanonical','inputWholeProfiles']]
for r in mat['rows']:
 for k in ['materialFiles','completeMaterial']:
  for z in r.get(k,[]) if k=='materialFiles' else ([r[k]] if k in r else []):
   zpin=pin(z['path']);assert zpin['sha256']==z['sha256'] and zpin['bytes']==z['bytes'];pins.append(zpin)
pins += [pin(p) for p in ['curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf','curricula/DE/Gymnasium/input/SH/Fachanforderungen_Chemie_Sekundarstufe_2022_barrierearm.pdf','curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf','app/public/data/de_gymnasium_chemistry_flashcards_basics_seki.de.json','app/public/data/de_gymnasium_chemistry_flashcards_organic_q1.de.json',a['records'][0]['existingMemoryRecord']['path']]]
assert all(v['currentBeforeGoalExact'] and v['currentBeforeProfileExact'] and v['profileCollectionExact'] and v['profileCollectionObjectHashMatches'] and v['afterGoalObjectHashMatches'] and v['coverageThresholdAndTransferUnchanged'] for v in existing)
assert all(all(v['exactObjectPartitionByField'].values()) and v['requiredIdsPartitionExact'] and v['oldNonIdCoveragePolicyUnchangedInBoth'] and v['newGoalProfileCollectionExact'] for v in partitions)
assert all(all(v[k] for k in ['actualCurrentPinMatches','scopeExact','referencesExact','actualOldRoleMatches','shadowCoreRoleMatches','shadowNewRoleMatches']) for v in view_checks)
assert all(v['sourceWholeObjectHashMatches'] and v['currentMappingObjectHashMatches'] for v in source_checks)
x={'artifactType':'independent-informed-five-D-two-duty-readonly-binding-retention-check','wholeObjectHashAlgorithm':'SHA256 of UTF-8 JSON with sorted object keys, ensure_ascii=false and compact separators','actualReadPins':list({p['path']:p for p in pins}.values()),'existingFive':existing,'exactTwoDutyPartitions':partitions,'actualScopeCoordinates':view_checks,'sourceReplacements':source_checks,'scopeAndViewCheck':pin(O/'CHECK.actual-41-view-roles-and-proposed-coordinates.json'),'normalWrites':False}
(O/'CHECK.actual-bindings-exact-P-partitions-and-scope.json').write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'allChecksPassed':True,'existingFive':[{k:v[k] for k in ['goalId','wholeProfileUnchanged','currentBeforeGoalExact','currentBeforeProfileExact']} for v in existing],'partitions':partitions,'coordinates':len(view_checks),'sources':source_checks},ensure_ascii=False,indent=2))

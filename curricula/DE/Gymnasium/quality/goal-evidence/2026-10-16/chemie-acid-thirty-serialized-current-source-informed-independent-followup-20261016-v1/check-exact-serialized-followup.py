# SPDX-License-Identifier: Apache-2.0
"""Finite serialization audit against the already decided thirty-row science list."""
import json,pathlib,hashlib,copy,collections,datetime
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16')
R=B/'chemie-acid-thirty-serialized-current-source-informed-independent-followup-20261016-v1'
A=B/'chemie-current-normal-source-thirty-reviewed-dispositions-technical-20261016-v1'
S=A/'OUTPUTS.finite-current-normal-source-after-thirty-exact-informed-dispositions.selector.json'
def read(p):return json.loads(pathlib.Path(p).read_text())
def pin(p):
 p=pathlib.Path(p);return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def objsha(x):return 'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def put(n,x):(R/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
inputs={}
def consume(p):
 if isinstance(p,dict):
  assert pin(p['path'])==p,p;path=p['path']
 else:path=str(p)
 inputs[path]=pin(path);return read(path)
sel=consume(S);assert pin(S)['sha256']=='sha256:990d73045881d56a12fd2a73fe1b0427af3726dc7a38519675d5e8d6564495fc'
new=consume(sel['currentNormalSources']);ops=consume(sel['exactThirtyOperations'])['operations'];hist=consume(sel['completeExcludedHistory'])['relations'];locops=consume(sel['twoLocatorOnlyCorrections'])['operations'];authorchecks=consume(sel['actualCompletePairChecks'])
review=consume(new['currentHistoricalEdgeDispositionReview']);loc=consume(new['twoExactBWLocatorCorrections'])['findings'];hbsel=consume(new['twoExactHBContextColumns']);hbops=consume(hbsel['beforeAfterOperations']);before=consume(hbsel['wholeBeforeSelection'])
newaliases={a['normalHostAlias']:a for a in new['aliases']};oldaliases={a['normalHostAlias']:a for a in before['aliases']};assert len(newaliases)==len(new['aliases'])==36;assert set(newaliases)==set(oldaliases)
old={a:consume(x['physicalRepositorySource'])for a,x in oldaliases.items()};cur={a:consume(x['physicalRepositorySource'])for a,x in newaliases.items()}
selected={r['sourceGoalId']:r for r in review['rows']};assert len(selected)==30;assert len(ops)==30;assert {o['sourceGoalId']for o in ops}==set(selected)
opby={o['sourceGoalId']:o for o in ops};lby={x['sourceGoalId']:x for x in loc};assert len(lby)==len(locops)==2
expectedhist=[];rowchecks=[]
for gid,r in selected.items():
 op=opby[gid];alias=op['normalMappingAlias'];oldm=old[alias];newm=cur[alias]
 bd=[x for x in oldm['decisions']if x['sourceGoalId']==gid];ad=[x for x in newm['decisions']if x['sourceGoalId']==gid];assert len(bd)==len(ad)==1
 be=[x for x in oldm['mappings']if x['legacyGoalId']==gid];ae=[x for x in newm['mappings']if x['legacyGoalId']==gid]
 assert op['wholeBeforeDecision']==bd[0] and op['wholeAfterDecision']==ad[0]
 assert op['wholeCurrentBeforeLegacyEdges']==be and op['wholeCurrentAfterLegacyEdges']==ae
 assert op['exactIndependentDisposition']==r
 assert ad[0]['canonicalGoalIds']==r['authorOperation']['currentCanonicalGoalIdsAfterDisposition']
 assert ae==r['authorOperation']['currentLegacyEdgesAfterDisposition']
 expected=copy.deepcopy(bd[0]);allowed=['canonicalGoalIds','reviewedAt','reviewer','rationale','reviewAuthority','reviewStatus','currentHistoricalEdgeDisposition','matchType']
 changes=[k for k in set(bd[0])|set(ad[0])if bd[0].get(k)!=ad[0].get(k)];assert set(changes)<=set(allowed),(gid,changes)
 assert ad[0].get('boundedSourceEvidence')==bd[0].get('boundedSourceEvidence')
 assert ad[0]['currentHistoricalEdgeDisposition']['independentInformedReview']==new['currentHistoricalEdgeDispositionReview'];assert ad[0]['currentHistoricalEdgeDisposition']['sourceGoalId']==gid
 extalias=newm['sourceExtractionPath'];oldg=next(g for g in old[extalias]['sourceGoals']if g['id']==gid);newg=next(g for g in cur[extalias]['sourceGoals']if g['id']==gid)
 frozen=consume(r['wholeSourceBody']['container'])
 for part in r['wholeSourceBody']['pointer'].strip('/').split('/'):frozen=frozen[int(part)]if isinstance(frozen,list)else frozen[part]
 assert oldg==frozen
 expectedg=copy.deepcopy(frozen)
 if gid in lby:assert expectedg['sourceRef']==lby[gid]['before'];expectedg['sourceRef']=lby[gid]['after']
 assert newg==expectedg
 passageid=newg['passageId'];oldp=next(p for p in old[extalias]['passages']if p['id']==passageid);newp=next(p for p in cur[extalias]['passages']if p['id']==passageid);assert oldp==newp
 oldids={e['canonicalGoalId']for e in be};newids={e['canonicalGoalId']for e in ae}
 for e in r['historicalEdgeDispositions']:
  assert e['historicalWholeEdge']in be
  assert (e['targetGoalId']in newids)==e['includeInCurrentCanonicalGoalIds']
  if not e['includeInCurrentCanonicalGoalIds']:expectedhist.append({'sourceGoalId':gid,'completeHistoricalEdge':e['historicalWholeEdge'],'action':e['action'],'reasonDe':e['sourceSpecificScientificReasonDe'],'currentEvidenceTransport':False})
 rowchecks.append({'sourceGoalId':gid,'normalMappingAlias':alias,'normalSourceAlias':extalias,'wholeSourceBeforeObjectSHA256':objsha(oldg),'wholeSourceAfterObjectSHA256':objsha(newg),'onlySourceBodyChange':'sourceRef S.32→S.33'if gid in lby else None,'wholePassageObjectUnchanged':True,'wholeBeforeDecisionRetainedInOperations':True,'currentWholeDecisionEqualsSerializedOperation':True,'selectedDecisionChangedFields':sorted(changes),'exactCurrentCanonicalGoalIds':ad[0]['canonicalGoalIds'],'exactCurrentLegacyEdges':ae,'allHistoricalActionsExact':True,'wholeOperatorAllocationsUnchanged':True})
assert hist==expectedhist and len(hist)==46
files=[];mapcount=0
for alias in sorted(newaliases):
 bo,af=old[alias],cur[alias];changed=bo!=af;assert changed==newaliases[alias]['changedInThisExactFollowup'];top=[k for k in set(bo)|set(af)if bo.get(k)!=af.get(k)]
 entry={'normalAlias':alias,'before':inputs[oldaliases[alias]['physicalRepositorySource']['path']],'after':inputs[newaliases[alias]['physicalRepositorySource']['path']],'changed':changed,'changedTopLevelFields':sorted(top)}
 if 'decisions'in bo:
  mapcount+=1;assert set(top)<=set(['decisions','mappings']);bs=[x for x in bo['decisions']if x['sourceGoalId']not in selected];ns=[x for x in af['decisions']if x['sourceGoalId']not in selected];assert bs==ns
  be=[x for x in bo['mappings']if x['legacyGoalId']not in selected];ne=[x for x in af['mappings']if x['legacyGoalId']not in selected];assert be==ne
  assert [x['sourceGoalId']for x in bo['decisions']]==[x['sourceGoalId']for x in af['decisions']]
  entry.update(unselectedWholeDecisionsPreserved=len(bs),unselectedWholeEdgesPreserved=len(be),orderedDecisionIdentitiesPreserved=True)
 elif changed:
  if alias==hbsel['normalExtractionAlias']:
   assert inputs[oldaliases[alias]['physicalRepositorySource']['path']]['sha256']=='sha256:8bac4b5a6c1f63938932a31f238377482b618b7d43916d95d85d7c175fa30cb2'
   assert set(top)=={'passages'};hbexpected=copy.deepcopy(bo);hbdict={p['id']:p for p in hbexpected['passages']}
   for operation in hbops['operations']:
    pid=operation['passageId'];assert hbdict[pid]==operation['wholeBefore'];assert 'structuredOfficialTerminologyContext'not in hbdict[pid]
    hbdict[pid]['structuredOfficialTerminologyContext']=operation['wholeAfter']['structuredOfficialTerminologyContext'];assert hbdict[pid]==operation['wholeAfter']
   assert af==hbexpected;assert af==consume(hbsel['completeExtraction'])
   entry.update(exactHBContextFieldsAdded=2,allWholeSourceGoalsAndOtherPassagesPreserved=True,sourceDocumentsUnchanged=True,HBScienceReviewedAgain=False)
  else:
   assert set(top)=={'sourceGoals'};expectedext=copy.deepcopy(bo);changedids=[]
   for g in expectedext['sourceGoals']:
    if g['id']in lby:assert g['sourceRef']==lby[g['id']]['before'];g['sourceRef']=lby[g['id']]['after'];changedids.append(g['id'])
   assert len(changedids)==2;assert expectedext==af
   entry.update(exactBWLocatorIDs=changedids,onlyTwoSourceRefFieldsChanged=True,allOtherWholeSourceGoalAndPassageAndDocumentFieldsPreserved=True)
 files.append(entry)
assert mapcount==18;assert sum(f['changed']for f in files)==9
# Bounded pair consistency only, using every full current pair and no build or projection.
pairs=[]
for alias,m in cur.items():
 if 'decisions'not in m:continue
 e=cur[m['sourceExtractionPath']];assert e['subject']=='Chemie';ids=[g['id']for g in e['sourceGoals']];assert len(ids)==len(set(ids));counts=collections.Counter(d['sourceGoalId']for d in m['decisions']);assert set(counts)==set(ids)and set(counts.values())=={1};edges=collections.defaultdict(set)
 for x in m['mappings']:assert x['legacyGoalId']in counts;edges[x['legacyGoalId']].add(x['canonicalGoalId'])
 assert len(m['mappings'])==len({(x['legacyGoalId'],x['canonicalGoalId'])for x in m['mappings']})
 for d in m['decisions']:assert set(d['canonicalGoalIds'])==edges[d['sourceGoalId']]
 pairs.append({'normalMappingAlias':alias,'normalSourceAlias':m['sourceExtractionPath'],'sourceGoalCount':len(ids),'completeDecisionCoverage':True,'decisionLegacyTargetEquality':True,'allWholeDocumentsPreservedAgainstPriorJointInput':True})
assert len(pairs)==18
for x in locops:
 assert x['scientificLocatorFinding']==lby[x['sourceGoalId']];assert x['wholeBefore']['sourceRef']==lby[x['sourceGoalId']]['before'];assert x['wholeAfter']['sourceRef']==lby[x['sourceGoalId']]['after'];a=copy.deepcopy(x['wholeBefore']);a['sourceRef']=x['wholeAfter']['sourceRef'];assert a==x['wholeAfter']
for v in inputs.values():assert pin(v['path'])==v
put('CHECKS.independent-exact-serialized-thirty-and-all-eighteen-pairs.json',{'schemaVersion':1,'role':'Actual narrow serialized-object audit against own already-fixed scientific dispositions, not another scientific or gate vote','sourceRows':rowchecks,'wholeCurrentAliasDifferences':files,'all18CurrentPairConsistencyChecks':pairs,'allChecksPassed':True,'counts':{'originalSourceRows':30,'historicalEdges':74,'exactKeptOldCurrentPartialEdges':28,'wholeExcludedHistoricalEdgesRetained':46,'wholeBeforeSelectedDecisionsRetained':30,'BWLocatorOnlyChanges':2,'HBContextOnlyAdditions':2,'wholeCurrentAliases':36,'changedWholeFiles':9,'normalMappingPairs':18},'fullBuildOrAtlasRun':False})
put('INPUTS.finite-serialized-followup-pins.json',{'schemaVersion':1,'role':'Exact consumed serialized inputs only','files':list(inputs.values()),'noFullPrimaryTextCopies':True})
report={'schemaVersion':1,'role':'Original thirty-row informed scientific reviewer: narrowly bounded actual serialized follow-up','reviewer':'/root/chemie_acid30_historical_edge_informed_science_20261016','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verdict':'EXACT_SERIALIZED_APPLICATION_SUPPORTED_FOR_THE_PREVIOUSLY_DECIDED_THIRTY_ROWS','authorSelector':pin(S),'ownPreviousScientificReview':new['currentHistoricalEdgeDispositionReview'],'finiteInputs':pin(R/'INPUTS.finite-serialized-followup-pins.json'),'actualOwnChecks':pin(R/'CHECKS.independent-exact-serialized-thirty-and-all-eighteen-pairs.json'),'findings':[],'resolvedItems':['All30 current canonicalGoalIds arrays and complete selected legacy-edge arrays exactly equal own previously fixed actions.','All74 historical dispositions are applied:28 bounded partial retentions stay current,46 excluded whole edges with exact reasons remain in history, and all30 whole before decisions/edge arrays remain in operations.','All30 complete source bodies remain exact against their accepted final bodies except the two precisely authorized BW sourceRef32→33 locator changes. All30 associated whole passage objects are unchanged.','All36 complete normal aliases preserve the same alias set and original document contracts. Exactly9 whole files differ:7 mappings,1 BW extraction with two sourceRef-only edits,1 HB extraction with two exact already-authored context additions.','All unselected whole mapping decisions and edge objects and ordered decision identities are preserved. Every other whole extraction/document/source-goal/passage field is unchanged. No shortened operator or replacement official document is introduced.','The whole HB extraction is byte-exact to its separate two-column author candidate. Against8bac… only two structuredOfficialTerminologyContext fields were added; all whole SourceGoals remain unchanged. This is identity verification, not renewed HB science.','Actual bounded consistency checks pass for all18 complete current source/mapping pairs.'],'sourceProjectionReady':True,'sourceProjectionReadyMeaning':'Technical serialized inputs are ready to be supplied to an actual bounded Atlas/input check. This is not scientific whole-source/course acceptance and is not evidence that an Atlas, Native or gate run succeeded.','wholeSourceUnionApproved':False,'wholeCourseApproved':False,'newScientificVotes':0,'freshBlindFIRST':False,'newDReview':False,'NormalPAMV':False,'actualPracticalPerformance':False,'Native':False,'AtlasRun':False,'Host':False,'Central':False,'GitHubWrites':0,'activeSourceMappingViewDeckWrites':0,'HumanApproval':False,'HumanTrial':False}
put('FOLLOWUP.independent-informed-exact-current-source-serialization.json',report)
seal={'schemaVersion':1,'role':'Additive exact serialized follow-up seal','files':[pin(p)for p in sorted(R.iterdir())if p.is_file()and p.name not in ['SEAL.informed-exact-serialized-followup.json','OUTPUTS.informed-exact-serialized-followup.selector.json']],'allInputPinsRecheckedUnchanged':True,'wholeScientificUnionApproved':False,'HumanApproval':False,'HumanTrial':False};put('SEAL.informed-exact-serialized-followup.json',seal)
selector={'schemaVersion':1,'role':report['role'],'report':pin(R/'FOLLOWUP.independent-informed-exact-current-source-serialization.json'),'actualChecks':pin(R/'CHECKS.independent-exact-serialized-thirty-and-all-eighteen-pairs.json'),'finiteInputs':pin(R/'INPUTS.finite-serialized-followup-pins.json'),'seal':pin(R/'SEAL.informed-exact-serialized-followup.json'),'sourceProjectionReady':True,'readinessMeaning':report['sourceProjectionReadyMeaning'],'wholeSourceUnionApproved':False,'newScientificVotes':0,'NormalPAMV':False,'Native':False,'AtlasRun':False,'Central':False,'HumanApproval':False,'HumanTrial':False};put('OUTPUTS.informed-exact-serialized-followup.selector.json',selector)
print(json.dumps({'selector':pin(R/'OUTPUTS.informed-exact-serialized-followup.selector.json'),'report':selector['report'],'checks':selector['actualChecks'],'allPassed':True,'rowCount':len(rowchecks),'pairCount':len(pairs)},indent=2))

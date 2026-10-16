# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,datetime,collections,subprocess
T=pathlib.Path('tmp/chemie-halftitration-electrophoresis-two-source-course-targeted-author-successor-20261016-v1');s=json.loads((T/'author-state.json').read_text());R=pathlib.Path(s['root']);new=s['newPlanningId'];old='d1244f5d-9a12-5b74-97fe-ae974f40af26';half='059acb11-29b3-5645-ac4c-b4214dc41a2d';parent='6b6bceca-e1d9-56f7-ae6c-d7f7c2fa9338'
load=lambda p:json.loads(pathlib.Path(p).read_text())
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def pin(p):p=pathlib.Path(p);return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
b=load(R/'before/CANONICAL.current709b.whole.json');a=load(R/'after/CANONICAL.whole-author-candidate-579.json');bi={g['id']:g for g in b['goals']};ai={g['id']:g for g in a['goals']}
changed=[k for k in bi if bi[k]!=ai[k]];assert set(changed)=={old,parent};assert set(ai)-set(bi)=={new};assert not set(bi)-set(ai);assert ai[half]==bi[half]
protectedFive=['5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c','b8c8f70f-64cb-50b1-970c-e0c4295da3fb','c245d5fd-ce46-5b45-ab2e-e610547b5f7c','e62c6c58-b688-59c3-8ac5-2cfc26ac22d7','f0ba30a8-84b3-5915-bf85-6c3a176064d2'];assert all(ai[k]==bi[k] for k in protectedFive)
assert len(b['goals'])==578 and len(a['goals'])==579;assert len(ai)==len(a['goals'])
assert all(ai[k]==bi[k] for k in bi if k not in [old,parent]) # Includes all five protected successors and Methods4 targets.
assert all(ai[k]==bi[k] for k in ['978a6f25-0601-5457-9211-aab206c95603','413c5ee5-7826-549f-ad76-63743c59b188','882630ba-815c-5c6b-868c-2e6cd7eef459','b7b5df21-78f3-5408-89f1-36deed450695'])
for edge in ['contains','requires']:
 done=set();active=set()
 def visit(id):
  if id in active:raise AssertionError('cycle '+edge+' '+id)
  if id in done:return
  active.add(id)
  for z in ai[id].get(edge,[]):assert z in ai;visit(z)
  active.remove(id);done.add(id)
 for id in ai:visit(id)
assert ai[parent]['extendedData']['applicabilityMappingInheritance']=='boundary';assert ai[new]['requires']==[old];assert ai[new]['applicability']=={'jurisdiction':['DE-BY']};assert ai[new]['tags']==['LK','canonical','SekII']
mb=load(R/'before/BY.whole-mapping.json');ma=load(R/'after/BY.whole-mapping.author-candidate.json');sidea='19ac25e8-9605-5406-9b6a-537ea5f2ce57';sidga='125533a1-908e-5e16-86da-f1f3d00db9a5'
key=lambda x:(x['legacyGoalId'],x['canonicalGoalId']);bm={key(z):z for z in mb['mappings']};am={key(z):z for z in ma['mappings']};assert set(bm)<=set(am);assert set(am)-set(bm)=={(sidea,new)}
assert [k for k in bm if bm[k]!=am[k]]==[(sidea,old)]
assert am[(sidea,old)]['matchType']=='partial' and am[(sidea,new)]['matchType']=='partial';assert am[(sidga,old)]['matchType']=='exact'
bd={z['sourceGoalId']:z for z in mb['decisions']};ad={z['sourceGoalId']:z for z in ma['decisions']};assert bd.keys()==ad.keys();assert set(k for k in bd if bd[k]!=ad[k])=={sidea,sidga}
assert set(bd[sidea]['canonicalGoalIds'])<=set(ad[sidea]['canonicalGoalIds']);assert set(ad[sidea]['canonicalGoalIds'])-set(bd[sidea]['canonicalGoalIds'])=={new}
for n in ['BY','NI']:
 assert (R/f'before/{n}.whole-source-extraction.json').read_bytes()==(R/f'after/{n}.whole-source-extraction.unchanged.json').read_bytes()
assert (R/'before/NI.whole-mapping.json').read_bytes()==(R/'after/NI.whole-mapping.unchanged.json').read_bytes()
views=load(R/'VIEWS.whole-CAS.scope-and-retention.author.json');ops=[]
for v in views:
 before=pathlib.Path(v['before']['path']);after=pathlib.Path(v['after']['path']);bb=load(before);aa=load(after);z=aa['rootNodes'][0]['children'];assert len([x['goalId'] for x in z])==len(set(x['goalId'] for x in z));assert all(x['goalId'] in ai for x in z)
 if v['scope']['jurisdiction']=='DE-BY' and v['scope']['courseProfile']=='LK':assert v['addedTargetIds']==[new]
 else:assert before.read_bytes()==after.read_bytes();assert not v['newPlanningTarget']
 if v['scope']['jurisdiction']=='DE-NI':assert not v['059Target']
 if v['scope']['courseProfile']=='GK':assert not v['newPlanningTarget']
 ops.append({'logicalTarget':'app/scripts/config/goal-books/inactive/chemie-current578-final-b608-source-bounded-20261016-v1/source-views/'+before.name,'before':v['before'],'after':v['after'],'mode':'replace-only-if-sha-matches' if before.read_bytes()!=after.read_bytes() else 'assert-byte-identical-no-op','proposedOnly':True})
cs=load(R/'cases/FOUR.whole-operator-specific-material-task-solution-rubric.author.json')['cases'];ps=load(R/'profiles/P.TWO.whole-raw-authored-operator-successors.json');assert len(cs)==4 and len(ps)==2;ci={x['caseId']:x for x in cs}
for p in ps:
 ids=p['wholeCaseIds'];assert len(ids)==2
 for id in ids:
  c=ci[id];assert c['goalId']==p['goalId'];assert all(c[k] for k in ['material','taskDe','taskEn','workedSolutionDe','workedSolutionEn','rubric']);assert c['evidenceLevel']=='E0' and c['maximumClaimScope']=='G0';assert not c['actualPracticalExecutionRequired'] and not c['learnerEvidenceObserved']
 exids={x['id'] for x in p['profile']['expectations']};assert set(p['profile']['coverageExpectations']['requiredExpectationIds'])<=exids
 assert len(p['profile']['applicationCaseBriefs'])==2
# Whole CAS are reviewable proposals. No own authored file is offered as a normal D/P vote.
source=load(R/'SOURCE-COURSE.actual-evidence-and-individual-dispositions.author.json');assert source['059']['currentNIDirectIncomingMappingEdges']==0;assert source['059']['priorAuthorRouteBefore']
ops.insert(0,{'logicalTarget':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','before':pin(R/'before/CANONICAL.current709b.whole.json'),'after':pin(R/'after/CANONICAL.whole-author-candidate-579.json'),'mode':'replace-only-if-sha-matches','changedExistingGoalIds':changed,'newGoalIds':[new],'proposedOnly':True})
ops.insert(1,{'logicalTarget':load(R/'contexts/D124.seven-whole-direct-source-contexts-and-partners.json')[0]['normalMappingPath'],'before':pin(R/'before/BY.whole-mapping.json'),'after':pin(R/'after/BY.whole-mapping.author-candidate.json'),'mode':'replace-only-if-sha-matches','changedSourceGoalIds':[sidga,sidea],'oldPartnerIdsRetained':True,'proposedOnly':True})
for state in ['BY','NI']:ops.append({'logicalTarget':('curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json' if state=='BY' else 'curricula/DE/Gymnasium/input/NI/upper-secondary/source-extraction/DE_NI_CHEMIE_SEKII_KC2022.source-extraction.json'),'before':pin(R/f'before/{state}.whole-source-extraction.json'),'after':pin(R/f'after/{state}.whole-source-extraction.unchanged.json'),'mode':'assert-byte-identical-no-op','proposedOnly':True})
save(R/'CAS.whole-proposed-operations.before-SHA-guards.json',{'role':'Inactive author proposal; parent integrates only after required independent review. Do not copy over a changed baseline.','baselineWholeCanonicalSha256':pin(R/'before/CANONICAL.current709b.whole.json')['sha256'],'operations':ops,'newAtomDelta':1,'allOriginalIdsRetained':True,'noCurrentNormalHostWrites':True,'sourceViewGenerationNotExecuted':True,'sourceSummaryNotRecastAsSuccessorApproval':True,'openHolds':source['d124']['wholeSourceStatus'],'noHumanApproval':True,'strictM7NetGain':0})
# Check every input hash again, including preserved independent FIRST and informed selector.
for p in s['inputs']:assert pin(p['path'])==p
frozen=[('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-native15-fresh-independent-b-20261016-v1/OUTPUTS.fresh-independent-b.finite.selector.json','06990bfca28f1e3d4c1edadf08c1f3ff7a89a2dc762893f3e07dee564fd810d0'),('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-native15-fresh-independent-b-20261016-v1/SCIENCE-FIRST.b.jsonl','abbf5da2c1672ee2e3df6cb5e48df478ae22eb6f6ed021a5ca3f33d81a5f999e'),('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-native15-five-P-findings-original-independent-B-informed-followup-20261016-v1/OUTPUTS.informed-P5-finite.selector.json','bc1f56bf873e2e9dd41add8f7000b172ec8382c452bd70c1110731396664505e')]
for p,sha in frozen:assert pin(p)['sha256']=='sha256:'+sha
parsed=[]
for p in R.rglob('*.json'):load(p);parsed.append(str(p))
broken=[str(p) for p in R.rglob('*') if p.is_symlink() and not p.exists()];assert not broken
checks={'checkedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS-bounded-author-CAS-structure-and-retention-only','wholeGoalCounts':{'before':578,'after':579},'existingGoalIdsRetained':578,'protectedFiveWholeBodiesUnchanged':protectedFive,'unchangedExistingWholeGoalBodies':576,'changedExistingWholeGoalBodies':changed,'addedGoalId':new,'actualAtomicTypeCounts':{'before':sum(g.get('type')=='atomic' for g in b['goals']),'after':sum(g.get('type')=='atomic' for g in a['goals'])},'curricularAtomicDenominator':'Ordinary current429 unchanged in normal host. Proposed +1 genuine atom; successor semantics and denominator require independent Kind/source review, not silently430 accepted.','separateDAGChecks':['contains acyclic with all references resolved','requires acyclic with all references resolved'],'allOriginalMappingPartnerIdsRetained':True,'unrelatedBYMappingAndDecisionRowsUnchanged':True,'BYMappingDelta':{'newPartialEdges':1,'oldEAExactNowPartial':1,'changedDecisionRows':2},'wholeSourceExtractionBytesUnchanged':['BY','NI'],'NIWholeMappingByteUnchanged':True,'wholeViewsChecked':4,'BYGKByteUnchanged':True,'NIViewsByteUnchanged':True,'newPlanningTargets':['DE-BY SekII LK'],'newPlanningNotInGKOrNI':True,'wholeAuthoredCasesChecked':4,'rawAuthoredProfilesChecked':2,'wholeCasesBilingualComplete':True,'frozenPriorSelectorsAndFIRSTUnchanged':[pin(p) for p,_ in frozen],'allPinnedExternalInputsUnchanged':True,'jsonFilesParsed':len(parsed),'ownBrokenSymlinks':broken,'sourceSemanticApproval':False,'normalReviewRecordsProduced':0,'fullBuildPerformed':False,'runtimeOrSecurityOrPublicationWrites':False,'HumanApproval':False,'HumanTrial':False,'strictM7NetGain':0}
save(R/'checks/CHECKS.actual-bounded-structure-retention-and-scope.json',checks)
print(json.dumps(checks,ensure_ascii=False,indent=2))

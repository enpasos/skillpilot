from pathlib import Path
import collections, copy, csv, datetime, hashlib, json

E=Path('/mnt/e/skillpilot-chemie-L7-20261017')
K=E/'current439-remediation14-guarded-root-integration-technical-v1/capsule'
C=K/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
A=E/'current439-source-surrogate-necessity-independent-a-v1/FIRST.edge-conclusions.tsv'
B=E/'current439-source-surrogate-necessity-independent-b-v1/FIRST-PHYSICAL-EDGE-DECISIONS.frozen.json'
G=E/'current439-requires-closure-source-surrogate-neutral-preparation-technical-v1/science/REVIEW-GROUPS.common-prerequisite-dependent-scientific-necessity.pending.json'
P=E/'current439-SN-indicator-P1-native1-root-v2/capsule/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-SN-indicator-P1-native1-root-v2/P439.f79-corrected-and-SN-own-indicator.author-candidate.aggregate.jsonl'
O=E/'current439-paired51-overbroad-requires-remediation-author-root-v1'
assert not O.exists();(O/'candidate').mkdir(parents=True)
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def w(p,d):
 with p.open('x') as f:json.dump(d,f,ensure_ascii=False,indent=2);f.write('\n')
guards=[pin(x) for x in [C,A,B,G,P]]
assert guards[0]['sha256']=='38c437d5fa0e24f8587b26cbdb2e3f168f3ffaf915aaaef885f918ac22c668e0'
assert guards[4]['sha256']=='56cfed452aa7fa0eb5c08650885af1db961d7d15e0ad33dfc0f6d3e80ef7512b'
aa=list(csv.reader(A.open(),delimiter='\t'));bb=json.loads(B.read_text())['groups'];groups=json.loads(G.read_text())['groups']
assert len(aa)==len(bb)==len(groups)==83
original=json.loads(C.read_text());candidate=copy.deepcopy(original)
byid={g['id']:g for g in candidate['goals']};oldbyid={g['id']:g for g in original['goals']}
profiles={r['goalId']:r['profile'] for r in map(json.loads,P.read_text().splitlines())}
approved=[];removed=[];dissent=[];counts=collections.Counter()
for a,b,g in zip(aa,bb,groups):
 assert int(a[0])==b['groupIndex']+1
 assert b['reviewGroupId']==g['reviewGroupId']
 prereq=g['prerequisiteGoalId'];dependent=g['directDependentGoalId']
 assert prereq==b['prerequisiteGoalId'] and dependent==b['directDependentGoalId']
 assert prereq in oldbyid[dependent].get('requires',[]),(prereq,dependent)
 key=(a[1],b['physicalNecessityDecision']);counts[key]+=1
 decision={'groupIndex':b['groupIndex'],'reviewGroupId':g['reviewGroupId'],'prerequisiteGoalId':prereq,'directDependentGoalId':dependent,'A':{'physicalDecision':a[1],'classification':a[2],'reason':a[3]},'B':{'physicalDecision':b['physicalNecessityDecision'],'reason':b['scientificNecessityRationaleDe']},'sourceAndCourseAcceptance':'separate pending jurisdiction dispositions; no source-registry approval derived from this physical pair'}
 if key==('reject','reject'):
  before=byid[dependent]['requires'][:]
  byid[dependent]['requires']=[x for x in before if x!=prereq]
  assert len(byid[dependent]['requires'])==len(before)-1
  decision.update({'authorChange':'remove only this unnecessary whole-competency prerequisite; target identity/content and practical/conceptual evidence requirements retained','prerequisiteWholeCurrentGoal':oldbyid[prereq],'dependentWholeCurrentGoal':oldbyid[dependent],'wholePrerequisiteProfile':profiles.get(prereq),'wholeDependentProfile':profiles.get(dependent)})
  removed.append(decision)
 elif key==('approve','approve'):
  approved.append(decision)
 else:
  decision['authorChange']='NONE; genuine independent dissent remains explicitly open'
  dissent.append(decision)
assert len(removed)==51 and len(approved)==29 and len(dissent)==3
changed=[g['id'] for g in candidate['goals'] if g!=oldbyid[g['id']]]
for g in candidate['goals']:
 old=oldbyid[g['id']]
 assert g.keys()==old.keys()
 for k in g:
  if k!='requires':assert g[k]==old[k],(g['id'],k)
 assert set(g.get('requires',[]))<=set(old.get('requires',[]))
assert len(original['goals'])==len(candidate['goals'])==650
assert [g['id'] for g in candidate['goals']]==[g['id'] for g in original['goals']]
cp=O/'candidate/DE_DEU_S_GYM_CANONICAL_CHEMIE.C650.paired51-requires-only.PENDING.json';w(cp,candidate)
w(O/'AUTHOR.51-exact-negative-edge-findings-and-whole-competence-inputs.json',{'role':'Author correction candidate for genuine paired physical-necessity findings; not integration, independent acceptance or current M7','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'oldCanonical':pin(C),'twoIndependentImmutablePhysicalFIRSTs':[pin(A),pin(B)],'removedPairs':removed,'changedDependentGoalIds':changed,'newGoals':0,'retiredGoals':0,'changedGoalTitlesDescriptionsExamplesResourcesTagsKindsAndAllOtherFields':0,'targetedNewDPageContextAndPInputReviewsRequired':True,'existingCurrent439DescriptionsAndWholePProfilesAreRetainedNotReauthored':True,'noSourceCoverageGatesRelaxed':True,'sourceSpecificApprovals':0,'MainKOrOtherSubjectChanges':False,'humanApproval':False})
w(O/'HOLD.three-genuine-physical-necessity-dissents.no-author-change.json',{'groups':dissent,'heldCount':3,'changesMadeForHeldGroups':0})
w(O/'KEEP.29-paired-physical-necessity-findings.source-qualifications-pending.json',{'groups':approved,'sourceRegistryApprovals':0})
summary={'role':'Inactive C650 requires-only author successor after actual frozen independent physical findings. All source/curriculum targets retained; no active integration or strict progress counted.','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'candidate':pin(cp),'inputGuards':guards,'wholeCurrentGoalCount':650,'currentCurricularAtomicDenominatorUnchanged':439,'removedUnnecessaryRequiresPairs':51,'distinctDependentGoalBodiesChangedOnlyInRequires':len(changed),'changedDependentGoalIds':changed,'prerequisiteEndIds':sorted({x['prerequisiteGoalId'] for x in removed}),'pairedPositivePhysicalGroups':29,'heldDissentGroups':3,'allOtherGoalFieldsAndIdsValueExact':True,'oldP439AndCorrectedF79LineNotModified':True,'sourceCourseJurisdictionReviewsStillSeparateAndOpen':True,'oldCanonicalAndAllOriginalEvidenceRetained':True,'nextStep':'Finish independent source/course packets; inspect each factual negative author change, resolve three substantive dissents, rebuild only affected page/context/P bindings against final graph, then compile normal scope/source coverage once as a stable batch. Do not activate or count hash refreshes as science.','strictGainClaimed':0,'activated':False,'humanApproval':False}
for guard in guards:assert pin(Path(guard['path']))==guard
w(O/'SELECTOR.paired51-requires-only-author-candidate-and-three-dissents.sealed.json',summary)
print(json.dumps({'selector':pin(O/'SELECTOR.paired51-requires-only-author-candidate-and-three-dissents.sealed.json'),'candidate':pin(cp),'changedDependentGoals':len(changed),'pairsRemoved':len(removed),'dissentHeld':len(dissent)}),flush=True)

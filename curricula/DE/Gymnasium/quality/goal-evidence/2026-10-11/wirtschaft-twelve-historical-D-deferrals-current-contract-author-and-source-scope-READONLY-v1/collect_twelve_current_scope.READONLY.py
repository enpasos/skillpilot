import copy, hashlib, json, subprocess
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
REPO=Path('/home/enpasos/projects/skillpilot')
OUT=Path(__file__).resolve().parent
Q=REPO/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
READ={}
def read(rel):
 p=REPO/rel
 raw=p.read_bytes()
 READ[str(p.relative_to(REPO))]={'path':str(p.relative_to(REPO)),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
 return json.loads(raw)
def write(name,value):
 p=OUT/name
 with p.open('x') as f:
  json.dump(value,f,ensure_ascii=False,indent=2)
  f.write('\n')
def goals(value):
 return value['goals'] if isinstance(value,dict) else value
def diffs(a,b,path=''):
 if type(a)!=type(b):return [{'field':path,'before':a,'current':b}]
 if isinstance(a,dict):
  out=[]
  for k in sorted(set(a)|set(b)):
   if k not in a:out.append({'field':path+'/'+k,'addedCurrent':b[k]})
   elif k not in b:out.append({'field':path+'/'+k,'removedHistorical':a[k]})
   else:out+=diffs(a[k],b[k],path+'/'+k)
  return out
 if a!=b:return [{'field':path,'before':a,'current':b}]
 return []
base=Q/'wirtschaft-D56-final-source-current-context-native-preparation-root-v22/native'
deferrals=[]
for d in sorted(base.iterdir()):
 p=d/'synthesis-decisions.json'
 if not p.exists():continue
 a=read(p.relative_to(REPO))
 for row in a.get('deferredGoals',[]):
  deferrals.append({'manifestPath':str(p.relative_to(REPO)),'batch':d.name,'originalDeferral':row})
ids=[x['originalDeferral']['goalId'] for x in deferrals]
assert len(ids)==12 and len(set(ids))==12
regpath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
reg=read(regpath)
subject=next(x for x in reg['subjects'] if x['subject']=='wirtschaftswissenschaften')
can=read(subject['landscapePath']); current={g['id']:g for g in can['goals']}
oldpath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-final56-seven-bounded-description-remedies-WHOLE-INERT-root-author-v1/whole679.exact-current-BEFORE.json.snapshot'
old={g['id']:g for g in read(oldpath)['goals']}
sevenpath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-final56-seven-bounded-description-remedies-WHOLE-INERT-root-author-v1/seven-whole-proposed-goals.INERT.json'
seven={g['id']:g for g in goals(read(sevenpath))}
authorpaths={
 '7c72848d-8bc9-58e2-a690-fd17ac650a88':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-7c121-b84-practice-prerequisite-scope-INERT-author-round-a-v1/seven-whole-proposed-goals.INERT.json',
 'dd38e0c5-d77b-5893-815c-548ea2a84429':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-dd38-543b-source-course-f08-036ea-followers-AUTHOR-INERT-round-b-v1/candidates/six-whole-content-successor-goals.INERT.json',
 '543bf91f-f6c6-5b1b-ba9e-43de321d8c7f':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-dd38-543b-source-course-f08-036ea-followers-AUTHOR-INERT-round-b-v1/candidates/six-whole-content-successor-goals.INERT.json',
 '648224f4-cc8f-5f41-9cae-6d783cd1ae77':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-6482-5aaf-79d-source-scope-f6bc-0b3d-followers-AUTHOR-INERT-round-b-v1/candidates/three-whole-content-goals.scope-candidate.INERT.json',
 '1826fe19-4d06-5183-9b41-9121ae1cc219':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-1826-three-atomic-competences-six-real-P-cases-AUTHOR-INERT-root-v1/three-whole-goal-candidates.INERT.json'
}
authors={
 '7c72848d-8bc9-58e2-a690-fd17ac650a88':'/root/economics_final56_current_round_a',
 'dd38e0c5-d77b-5893-815c-548ea2a84429':'/root/economics_final56_current_round_b',
 '543bf91f-f6c6-5b1b-ba9e-43de321d8c7f':'/root/economics_final56_current_round_b',
 '648224f4-cc8f-5f41-9cae-6d783cd1ae77':'/root/economics_final56_current_round_b',
 '1826fe19-4d06-5183-9b41-9121ae1cc219':'/root/economics_final679_required_gate_plan'
}
profile_records={}
for cp in subject['positiveEvidenceConfigPaths']:
 c=read(cp)
 matched=set(ids)&set(c['scope'].get('goalIds',[]))
 if not matched:continue
 rp=c['reviewPath'];raw=(REPO/rp).read_bytes()
 READ[rp]={'path':rp,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
 for i,line in enumerate(raw.decode().splitlines(),1):
  r=json.loads(line)
  if r['goalId'] in matched:
   assert r['goalId'] not in profile_records
   profile_records[r['goalId']]={'configPath':cp,'recordPath':rp,'recordLine':i,'wholeRecord':r}
assert set(profile_records)==set(ids)
common_path='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-twelve-existing-current-goal-image-fit-independent-a-READONLY-v1/actual-twelve-whole-current-goal-P-source-and-existing-view-inputs.READONLY.json'
common=read(common_path)
mapping_paths={b['mappingPath'] for x in common for b in x['sourceBoundaries']}
assert len(mapping_paths)==30
source_rows={gid:[] for gid in ids}
for mp in sorted(mapping_paths):
 m=read(mp);sp=m['sourceExtractionPath'];s=read(sp)
 atoms={g['id']:g for g in s['sourceGoals']}
 passages={g.get('id',g.get('passageId')):g for g in s.get('passages',[])}
 ds={g['sourceGoalId']:g for g in m['decisions']}
 for edge in m['mappings']:
  gid=edge['canonicalGoalId']
  if gid not in source_rows:continue
  sid=edge['legacyGoalId']
  if sid not in atoms:
   source_rows[gid].append({'mappingPath':mp,'sourceExtractionPath':sp,'edge':edge,'sourceAtomFound':False,'sourceOriginalFacetNotAutomaticallyInferred':True})
   continue
  a=atoms[sid]
  source_rows[gid].append({'mappingPath':mp,'sourceExtractionPath':sp,'edge':edge,'sourceAtomFound':True,'wholeCurrentSourceAtom':a,'wholeCurrentParent':passages.get(a.get('passageId')),'sourceDocument':s.get('sourceDocuments',s.get('sourceDocument')),'sourceJurisdiction':s.get('jurisdiction'),'sourceStage':s.get('stage'),'wholeMappingDecision':ds.get(sid),'boundary':'The actual source edge and its declared matchType are recorded; partial or selected-case evidence never proves the entire source requirement or universal country/course obligation.'})
rows=[]
for item in deferrals:
 gid=item['originalDeferral']['goalId'];g=current[gid]
 ap=sevenpath if gid in seven else authorpaths[gid]
 ag=seven[gid] if gid in seven else next(x for x in goals(read(ap)) if x['id']==gid)
 author=authors.get(gid,'/root')
 contract_fields=['title','titleEn','description','descriptionEn','requires','contains','tags','dimensionTags']
 shared=['/root/economics_final679_required_gate_plan contributed technical fieldwise integration and some source/scope metadata; no blindness or independence of those authored context deltas is claimed.']
 old_payload=old[gid];p=profile_records[gid]
 row={
  'goalId':gid,'historicalDeferral':item,
  'wholeHistoricalGoal':old_payload,'wholeCurrentGoal':g,
  'allActualGoalFieldDeltas':diffs(old_payload,g),
  'descriptionStrings':{k:{'historical':old_payload.get(k),'current':g.get(k)} for k in ['title','titleEn','description','descriptionEn']},
  'actualRequiresDelta':{'historical':old_payload['requires'],'current':g['requires']},
  'authorship':{'goalContractAuthor':author,'authorCandidatePath':ap,'currentContractFieldsEqualAuthoredCandidate':{k:g.get(k)==ag.get(k) for k in contract_fields},'scopingReviewer':'/root/economics_final679_required_gate_plan','scopingReviewerAuthoredCurrentGoalContract':author=='/root/economics_final679_required_gate_plan','laterNewDReviewerIndependenceForGoalAndP':'not independent: authored retained monopoly contract and its P cases' if author=='/root/economics_final679_required_gate_plan' else 'goal/P author is a different agent; historical and shared technical/source exposure disclosed','sourceAndCompositionContributionDisclosure':shared,'authorshipBasis':'Bounded original author artifacts and explicit task provenance in the shared session; folder labels alone are not treated as authorship proof.'},
  'currentPositiveRecord':p,
  'actualApplicationCases':copy.deepcopy(p['wholeRecord']['profile']['applicationCaseBriefs']),
  'directCurrentSourceAssignmentCount':len(source_rows[gid]),
  'directCurrentSourceMatchTypes':dict(Counter(x['edge']['matchType'] for x in source_rows[gid])),
  'currentSourceContextsArtifact':'actual-twelve-current-source-edges-atoms-parents-and-partial-boundaries.READONLY.json',
  'currentRequiresWholeGoals':[current[r] for r in g['requires']],
  'newDJudgment':'NOT_PERFORMED; awaiting stable native M7 review bundle',
  'currentNativePFreshnessClaimed':False,
  'existingReviewsNotBlindlyReassigned':True
 }
 rows.append(row)
write('actual-twelve-original-deferrals-current-whole-contracts-P-and-authorship.READONLY.json',{'evidenceKind':'bounded-readonly-scoping-not-description-review','observedAtUtc':datetime.now(timezone.utc).isoformat(),'historicalSource':'six original final56-v22 synthesis manifests; only their deferredGoals are used as original problem statements','actualCurrentGoalIds':ids,'actualDeferralCount':12,'currentCanonicalPath':subject['landscapePath'],'currentRegistryPath':regpath,'stableNativeM7BundleReceived':False,'currentPConfigsAreProvisionalPreM7BindingSnapshot':True,'goals':rows})
write('actual-twelve-current-source-edges-atoms-parents-and-partial-boundaries.READONLY.json',{'evidenceKind':'read-only-current-source-context-inventory-not-source-science-review','sourceMappingFileCount':30,'goalSourceContexts':source_rows,'scientificLimits':['Whole linked current source atoms and parents are context inputs, not new approvals.','Declared exact/partial matchType is preserved as repository data; this inventory does not convert a partial edge into whole source, course or country coverage.','Selected official facets, authored extensions and prerequisite-only roles remain distinct.','No current Round-A or Round-B D result artifact was opened.']})
bpath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-seven-bounded-remedies-independent-qualified-INERT-v22/actual-independent-seven-scientific-qualification.json'
b=read(bpath)
brows=[]
for r in b['records']:
 if r['goalId'] not in ids:continue
 gid=r['goalId']
 brows.append({'goalId':gid,'reviewer':b['reviewer'],'role':b['role'],'path':bpath,'onlyCandidateContractBindingComparedNoNewDecisionRead':True,'descriptionDeEqualsCurrent':r['candidateDescriptionDe']==current[gid]['description'],'descriptionEnEqualsCurrent':r['candidateDescriptionEn']==current[gid]['descriptionEn'],'candidateRequiresEqualsCurrent':r['candidateRequires']==current[gid]['requires'],'notFormalCurrentD':True,'reuseConclusion':'Cannot reuse this earlier broad market-failure wording qualification as a current narrowed-monopoly D decision.'})
write('actual-existing-B-review-binding-and-later-independence-boundaries.READONLY.json',{'evidenceKind':'review-provenance-and-input-binding-inventory-only','existingIndependentBMetadataCompared':brows,'otherCurrentDRoundResultsRead':False,'newIndependentBPathsFromRootStillPending':True,'reviewReuseRule':'A valid existing review may be reused only for its actual unchanged full scientific contract and bound context; same ID or a refreshed hash alone is insufficient.','laterDReviewWaitingForStableNativeBundle':True,'own1826GoalPAuthorshipExplicit':True,'sevenDescriptionAuthorIsRoot':True,'narrowed7cGoalPAuthorIsAgentA':True,'dd38And543And648GoalPAuthorIsSeparateAgentB':True,'noNewDescriptionGateVerdicts':True})
end=[]
for b in READ.values():
 p=REPO/b['path'];raw=p.read_bytes();now={'path':b['path'],'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
 if now!=b:end.append({'before':b,'after':now})
write('actual-scoping-input-before-after-bindings.READONLY.json',{'inputBindings':list(READ.values()),'inputsChangedDuringThisFastSnapshot':end,'activeWrites':0,'newRoundResultsRead':False,'nativeGeneratorsRun':0,'newDDecisions':0,'M7OrStrictCompletionsClaimed':False})
print(json.dumps({'output':str(OUT.relative_to(REPO)),'actualIds':ids,'deferrals':len(rows),'sourceContextCounts':{g:len(v) for g,v in source_rows.items()},'currentContractCandidateMismatches':{r['goalId']:[k for k,v in r['authorship']['currentContractFieldsEqualAuthoredCandidate'].items() if not v] for r in rows},'changedInputs':len(end),'sourceAtomsFound':sum(x.get('sourceAtomFound',False) for v in source_rows.values() for x in v),'sourceAtomsMissing':sum(not x.get('sourceAtomFound',False) for v in source_rows.values() for x in v)},ensure_ascii=False))


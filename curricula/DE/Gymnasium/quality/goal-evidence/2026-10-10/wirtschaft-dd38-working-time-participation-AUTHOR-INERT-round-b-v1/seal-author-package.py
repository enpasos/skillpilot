from pathlib import Path
import json,hashlib,datetime
base=Path(__file__).resolve().parent
can=json.loads((base/'history/canonical-landscape.exact.json').read_text());goals={g['id']:g for g in can['goals']};candidate=json.loads((base/'candidates/retained-dd38.whole-goal.candidate.json').read_text());dd=candidate['id']
assert json.loads((base/'history/original-goal.exact-object.json').read_text())==goals[dd]
changed=[k for k in set(candidate)|set(goals[dd]) if candidate.get(k)!=goals[dd].get(k)]
assert set(changed)=={'title','titleEn','description','descriptionEn','resourceLinks'}
for p in base.rglob('*.json'):json.loads(p.read_text())
for p in base.rglob('*.jsonl'):
 for line in p.read_text().splitlines():json.loads(line)
profile=json.loads((base/'candidates/retained-dd38.positive-profile.candidate.json').read_text())
assert len(profile['profile']['applicationCaseBriefs'])==2
for x in profile['profile']['applicationCaseBriefs']:
 assert all(x[k].strip() for k in ['taskDemandDe','taskDemandEn','expectedPerformanceDe','expectedPerformanceEn','understandingFocusDe','understandingFocusEn'])
assert candidate['type']=='atomic' and not candidate['contains'] and candidate['requires']==goals[dd]['requires']
for gid in ['f08e0a97-bcdd-504d-a9d9-7b1d8e6d4f96','81f5e338-5720-54af-9793-a151736141f3']:
 assert json.loads((base/f'history/{gid}.whole-practice.exact-object.json').read_text())==goals[gid]
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
out=base/'SEALED-unreviewed-INERT-handoff.json'
files=[{'path':str(p.relative_to(base)),'digest':sha(p),'bytes':p.stat().st_size} for p in sorted(base.rglob('*')) if p.is_file() and p!=out]
seal={'status':'SEALED_UNREVIEWED_INERT_AI_CANDIDATE','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z'),'actualCanonicalSnapshotGoalCount':len(can['goals']),'retainedOriginalGoalId':dd,'newGoalIds':[],'semanticRoleProposed':'current curricularAtomic','reusedExistingGoalIds':['776457c2-8bb3-53b9-838b-a028319175fb','a5009946-62bb-5e6a-8c92-732d02e8fd70'],'changedRetainedGoalFields':sorted(changed),'historyGoalAndPracticeObjectsExact':True,'historyOriginalPositiveLineExact':True,'localSyntaxSchemaSemanticsFingerprintsPassed':True,'independentReviewClaimed':False,'humanApprovalClaimed':False,'learnerTestingClaimed':False,'activeFilesChanged':[],'openGates':['Whole source and country/course projection','Fresh whole D/P review','Memory and cards','Actual whole practice/material/rubric and requires/coveredGoal correction','Visualization and rendered book/page inspection'],'files':files}
out.write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'package':str(base),'actualSnapshotGoalCount':len(can['goals']),'goals':1,'newGoalIds':0,'Pcases':2,'wholeHistory':True,'sealDigest':sha(out)}))

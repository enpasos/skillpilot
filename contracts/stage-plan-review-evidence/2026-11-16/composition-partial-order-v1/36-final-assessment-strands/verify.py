import copy,datetime,hashlib,json,subprocess
from pathlib import Path
root=Path('/home/enpasos/projects/skillpilot');out=root/'tmp/pipeline/laender-stufen/gesamt/review/assessment-strands-root';path=root/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before=json.loads((out/'canonical-before.json').read_text());after=json.loads(path.read_text());ids={'a8dc0290-9f80-5763-8943-e16b8d2aa860','7cfaf48e-e420-5c09-8ec2-932f0dba4d08','f41e4e30-794e-5ce4-ba5e-cc72712cd691'}
expected=copy.deepcopy(before)
for g in expected['goals']:
 if g['id'] in ids:
  assert g['examData']['coveredStrands']==[]
  g['examData']['coveredStrands']=['LI_BEWEGUNG']
assert after==expected,'Unexpected catalog change'
byid={g['id']:g for g in after['goals']};old=json.loads(subprocess.check_output(['git','show','9975a142f7a26f1c4ff31c46a70e149d82a3fce5:'+str(path.relative_to(root))],text=True,cwd=root));oldby={g['id']:g for g in old['goals']}
existing_changes=[x for x in oldby if oldby[x]!=byid[x]]
assert set(existing_changes)=={'a8dc0290-9f80-5763-8943-e16b8d2aa860','bf980fff-b62b-4ea4-a20d-31681a7ad785'}
reasons={'a8dc0290-9f80-5763-8943-e16b8d2aa860':'Two motion cases: cart a/v/s diagrams and direction reversal; braking until rest, stopping distance and limits. All five scoring cores assess these motion quantities.','7cfaf48e-e420-5c09-8ec2-932f0dba4d08':'The two assessed documentation cases require calculation and bounded interpretation of cart speeds and pendulum periods. Cores a-own-evaluation and b-own-evaluation explicitly score these motion quantities. This classification does not add a separate covered competency.','f41e4e30-794e-5ce4-ba5e-cc72712cd691':'Both actual free-fall series assess measured time-position data, graphical acceleration inference and own motion laws with initial conditions. The two graph-g and initial-law core pairs directly bind motion.'}
rows=[]
for gid in sorted(ids):
 g=byid[gid];original=json.loads((out/(gid+'.before.json')).read_text());actual=copy.deepcopy(g);actual['examData']['coveredStrands']=[];assert actual==original
 (out/(gid+'.after.json')).write_text(json.dumps(g,ensure_ascii=False,indent=2)+'\n')
 rows.append({'goalId':gid,'coveredStrands':['LI_BEWEGUNG'],'contentRationale':reasons[gid],'allOtherFieldsExact':True,'beforeSha256':sha(out/(gid+'.before.json')),'afterSha256':sha(out/(gid+'.after.json')),'taskArtifactSha256':sha(root/g['examData']['sourceArtifactPath'])})
receipt={'at':datetime.datetime.now().astimezone().isoformat(),'reviewer':'root','author':'he_ephase_source_review','status':'PASS','beforeCanonicalSha256':sha(out/'canonical-before.json'),'afterCanonicalSha256':sha(path),'exactThreeFieldDelta':True,'otherGoalObjectsUnchanged':847,'existingGoalObjectsUnchangedAgainstMain':839,'separatelyChangedExistingProgramRoot':'nine new task links','rows':rows,'limits':'Independent content-metadata classification only; previous content/rubric/release evidence remains bound to its original bytes. No new official-source claim, learner result, trial or effectiveness evidence.'}
(out/'review.actual.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({'status':'PASS','canonicalSha256':sha(path),'changedFields':3,'otherGoalsUnchanged':847}))

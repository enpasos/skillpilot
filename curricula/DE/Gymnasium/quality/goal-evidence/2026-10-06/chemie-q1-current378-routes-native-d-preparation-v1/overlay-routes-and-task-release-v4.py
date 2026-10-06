from pathlib import Path
import hashlib,json,shutil,datetime
ROOT=Path('/home/enpasos/projects/skillpilot');REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1');OWN=ROOT/REL;ISO=ROOT/'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1'
V4=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-routes-and-machine-task-release-author-v4'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
freeze=V4/'author-routes-and-machine-task-state.final.freeze.json';assert sha(freeze)=='458e101c40be8ecf5d6fa87429ee8d732759694ae820611192eefaee306d9cb4'
f=json.loads(freeze.read_text());assert len(f['files'])==5
for row in f['files']:
 p=V4/row['path'];assert sha(p)==row['sha256'] and p.stat().st_size==row['bytes']
canon=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');src=V4/'proposed-active-tree'/canon;dst=ISO/canon
assert sha(dst)=='f8ea8be15f3c1965ab1056127fbbf8e40c3aaf217f4aacacd8630d53960fb27b'
before=json.loads(dst.read_text());after=json.loads(src.read_text());b={g['id']:g for g in before['goals']};a={g['id']:g for g in after['goals']};changes=sorted(id for id in b if b[id]!=a[id])
taskIds=['4cb74d76-99f1-5264-b1e3-448cda47b005','171b47e2-2c53-50f2-a145-a26b896fd73f'];oldTaskIds=['00139854-e5a7-5c12-ab50-2268c80bf776','bf6c39f0-1e44-53b2-8ff6-025f2e36e125','c91350bc-7d2e-523c-bd50-0324bccfcf98']
assert changes==sorted(taskIds+oldTaskIds)
for id in oldTaskIds:
 trim=json.loads(json.dumps(a[id]));trim['requires']=b[id]['requires'];assert trim==b[id]
 assert a[id]['requires']==[x for x in b[id]['requires'] if x!='0d59b62e-d3f9-5969-b961-0c5e26316c04']
for id in taskIds:
 assert a[id]['examData']['reviewStatus']=='released'
 assert a[id]['examData']['scoring']==b[id]['examData']['scoring']
 assert a[id]['examData']['scoring']['maxPoints']==a[id]['examData']['scoring']['passingPoints']==24
beforeSha=sha(dst);shutil.copy2(dst,OWN/'canonical-before-v4.snapshot.json');shutil.copy2(src,dst)
ledger=ISO/'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';shutil.copy2(ledger,OWN/'semantic-kinds.before-v4.snapshot.json')
receipt={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verifiedV4FreezeSHA256':sha(freeze),'verifiedV4Files':5,'beforeCanonicalSHA256':beforeSha,'afterCanonicalSHA256':sha(dst),'changedGoalIds':changes,'other474WholeGoalsExact':True,'threeOldTasksOnlyNew0d59RequirementRemoved':True,'twoNewTasksMaxAndPassing24Exact':True,'twoNewTasksRubricsExact':True,'newTaskStatus':'released','statusBasis':'Parent-author v4 documents actual independent A and B full content KEEP; machine review only. This technical preparer does not make the content decision.','activeWrites':False,'nativeCompilerChanged':False,'scienceReviewDecision':None,'humanApproval':False}
(OWN/'routes-and-task-release-v4-overlay.actual.receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'changedWholeGoals':len(changes),'afterCanonicalSHA256':sha(dst),'allOldTaskRubricsAndReleaseExact':True}))

# SPDX-License-Identifier: Apache-2.0
import hashlib, json, shutil, subprocess
from pathlib import Path
R=Path.cwd();P=Path(__file__).resolve().parent;PR=P.relative_to(R)
C=R/'tmp/medical10-current397-v3-normal-private-capsule'
E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
OLD=E/'biologie-medical-ethics-ten-current397-author-successor-20261011-v2'
BASE=E/'biologie-nature-eight-current397-targeted-material-source-author-successor-root-20261011-v2'
def load(p):return json.loads(p.read_text())
def ref(p):return {'path':str(p.relative_to(R)),'bytes':p.stat().st_size,'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()}
def put(name,x):
 p=P/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return ref(p)
def command(name,script,args):
 cmd=[str(R/'app/node_modules/.bin/tsx'),str(C/'app/scripts'/script)]+args
 q=subprocess.run(cmd,cwd=C,capture_output=True,text=True)
 put('checks/'+name+'.actual-command.json',{'argv':cmd,'exitCode':q.returncode,'stdout':q.stdout,'stderr':q.stderr,'activeWrites':False,'independentVerdictsCreated':0})
 print(name,q.returncode,q.stdout[-300:],q.stderr[-600:],flush=True);assert q.returncode==0
command('normal-P10-materialization','materializePositiveGoalEvidenceCandidates.ts',['--config',str(PR/'positive/P10-medical.author-pending.config.json'),'--candidates',str(PR/'profiles/ten-complete-positive-candidates.author.json'),'--write'])
shutil.copyfile(C/PR/'positive/P10-medical.author-pending.review.jsonl',P/'positive/P10-medical.author-pending.review.jsonl')
command('normal31-source-atlas','buildGoalBookSourceAtlasInputs.ts',['--config',str(PR/'sources/normal397-medical10.author.inputs.json')])
command('normal397-model','buildGoalBookModel.ts',[str(PR/'native/whole397-medical10.normal.config.json')])
shutil.copyfile(C/PR/'native/whole397-medical10.normal-model.actual.json',P/'native/whole397-medical10.normal-model.actual.json')
atlas=load(P/'sources/normal397-medical10.author.inputs.json')
for f in (C/Path(atlas['manifestPath']).parent).rglob('*'):
 if f.is_file():
  dst=P/'sources/normal-output'/f.relative_to(C/Path(atlas['manifestPath']).parent);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(f,dst)
model=load(P/'native/whole397-medical10.normal-model.actual.json');pages={r['goalId']:r for r in model['pages']}
prior=load(BASE/'native/whole397.author.normal-model.actual.json');previous={r['goalId']:r for r in prior['pages']}
assert set(pages)==set(previous) and len(pages)==397
delta=[]
for gid,p in pages.items():
 old=previous[gid]; changed=[k for k in p if p[k]!=old.get(k) and k not in ['pageFingerprint','goalFingerprint']]
 if changed or p['pageFingerprint']!=old['pageFingerprint']:delta.append({'goalId':gid,'beforePageFingerprint':old['pageFingerprint'],'afterPageFingerprint':p['pageFingerprint'],'changedFields':changed,'before':old,'after':p})
ids=load(P/'FIRST.actual-neutral-medical10-continuation-author-inputs.json')['goalIds']
union=[gid for gid in pages if gid in set(ids)|{d['goalId'] for d in delta}]
put('checks/current397-whole-normal-page-deltas.actual.json',{'basis':ref(BASE/'native/whole397.author.normal-model.actual.json'),'candidate':ref(P/'native/whole397-medical10.normal-model.actual.json'),'actualChangedPages':len(delta),'whole397Count':397,'affectedNativeUnion':union,'changedPages':delta,'unchangedPageCount':397-len(delta),'reviewIsNotComplete':True})
bc=load(OLD/'native/current397-medical-native-union.author.batch.config.json')
bc.update({'batchId':'biologie-medical10-current397-native-actual-union-20261011-v3','bookId':'biologie-medical10-current397-native-actual-union-20261011-v3','baseGoalBookConfigPath':str(PR/'native/whole397-medical10.normal.config.json'),'goalIds':union,'outputDirectory':str(PR/'native/current397-medical-native-union')})
put('native/current397-medical-native-union.author.batch.config.json',bc)
dst=C/PR/'native/current397-medical-native-union.author.batch.config.json';dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(P/'native/current397-medical-native-union.author.batch.config.json',dst)
command('normal-native-union-preparation','materializeGoalDescriptionRolloutBatch.ts',['prepare','--config',str(PR/'native/current397-medical-native-union.author.batch.config.json')])
shutil.copytree(C/PR/'native/current397-medical-native-union',P/'native/current397-medical-native-union',dirs_exist_ok=True)
command('normal-native-union-check','materializeGoalDescriptionRolloutBatch.ts',['check','--config',str(PR/'native/current397-medical-native-union.author.batch.config.json')])
print(json.dumps({'actualNativeUnion':len(union),'actualPageDelta':len(delta),'unchangedPages':397-len(delta),'sourcePairs':31,'independentVerdicts':0}),flush=True)

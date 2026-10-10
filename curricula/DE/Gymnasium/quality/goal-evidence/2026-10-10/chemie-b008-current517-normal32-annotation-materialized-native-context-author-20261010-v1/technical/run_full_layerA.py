# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,subprocess,datetime,time,shutil
R=Path.cwd();N=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-normal32-annotation-materialized-native-context-author-20261010-v1');C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule';tsx=str(R/'app/node_modules/.bin/tsx')
def run(name,args):
 start=time.monotonic();p=subprocess.run([tsx,*args],cwd=C,capture_output=True,text=True);out=N/'checks'/f'{name}.stdout.log';out.write_text(p.stdout);(N/'checks'/f'{name}.terminal.actual.json').write_text(json.dumps({'argv':[tsx,*args],'capsuleRoot':str(C),'actualExitCode':p.returncode,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'durationSeconds':time.monotonic()-start,'stdoutPath':str(out),'stderr':p.stderr,'normalToolsUnchanged':True,'role':'SOURCE/route AUTHOR machine checks; current independent review pending','activeWrites':[]},indent=2)+'\n');print(name,'EXIT',p.returncode,p.stdout[-1800:],p.stderr[-2400:],flush=True);return p.returncode
for rel in ['docs/qa-ci/status/curriculum-quality-status.json','docs/qa-ci/status/curriculum-quality-status.md']:
 p=C/rel;assert p.parent.resolve().is_relative_to(C.resolve())
 if p.exists()or p.is_symlink():p.unlink()
run('full-current-LayerA-generate',['app/scripts/generateCurriculumQualityStatus.ts'])
status=C/'docs/qa-ci/status/curriculum-quality-status.json'
if status.exists():
 x=json.loads(status.read_text());chem=next(s for s in x['curricula']if s['subject']=='Chemie');(N/'checks/full-current-LayerA-Chemistry.actual.json').write_text(json.dumps({'schemaVersion':1,'normalRulesVersion':x['rulesVersion'],'chemistry':chem,'otherSubjectMaturities':[{k:s.get(k)for k in ['subject','landscapeId','maturity','goals','atomicGoals']}for s in x['curricula']if s['subject']!='Chemie'],'activeWrites':[]},ensure_ascii=False,indent=2)+'\n');print('Actual full normal LayerA Chem',chem['maturity'],[(r['id'],r['status'])for r in chem['rules']],flush=True)

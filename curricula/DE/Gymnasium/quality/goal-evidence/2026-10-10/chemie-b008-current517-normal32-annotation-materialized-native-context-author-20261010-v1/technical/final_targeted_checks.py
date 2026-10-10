# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,subprocess,datetime,time,shutil,hashlib
R=Path.cwd();N=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-normal32-annotation-materialized-native-context-author-20261010-v1');C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule';tsx=str(R/'app/node_modules/.bin/tsx')
def run(name,args):
 start=time.monotonic();p=subprocess.run([tsx,*args],cwd=C,capture_output=True,text=True);out=N/'checks'/f'{name}.stdout.log';out.write_text(p.stdout);(N/'checks'/f'{name}.terminal.actual.json').write_text(json.dumps({'argv':[tsx,*args],'capsuleRoot':str(C),'actualExitCode':p.returncode,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'durationSeconds':time.monotonic()-start,'stdoutPath':str(out),'stderr':p.stderr,'normalToolsUnchanged':True,'role':'AUTHOR deterministic machine preparation; no new current science gates','activeWrites':[]},indent=2)+'\n');print(name,'EXIT',p.returncode,p.stdout[-1800:],p.stderr[-2500:],flush=True);assert p.returncode==0
run('P36-exact-retained-normal',['app/scripts/positiveGoalEvidenceReview.ts','--config='+str(N/'positive/unchanged36.current-reviewed.portable.config.json'),'--mode=check'])
run('normal-compile-post-materialization',['app/scripts/compileApplicability.ts'])
post=C/'tmp/applicability/c436b994-8f44-5134-b9f8-0c9f5d6a5ba0.json';shutil.copyfile(post,N/'checks/original-normal-compiler-after-materialization.Chemistry.actual.json');x=json.loads(post.read_text());assert x['summary']['errors']==0and x['summary']['warnings']==0;assert not any(f['code']=='APV-203'for f in x['findings']);print('Chemistry normal compiler summary',x['summary'])

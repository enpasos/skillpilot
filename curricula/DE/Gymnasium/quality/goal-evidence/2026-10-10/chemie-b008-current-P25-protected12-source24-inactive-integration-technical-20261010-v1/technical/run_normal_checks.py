# SPDX-License-Identifier: Apache-2.0
import datetime,json,pathlib,shutil,subprocess,time
R=pathlib.Path('/home/enpasos/projects/skillpilot'); P=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-P25-protected12-source24-inactive-integration-technical-20261010-v1');C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule'; NODE=shutil.which('node'); TSX=str(R/'app/node_modules/tsx/dist/cli.mjs')
def put(p,x):
 f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);t=f.with_name(f.name+'.writing-tmp');t.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');t.replace(f)
def run(name,script,args):
 start=time.monotonic();at=datetime.datetime.now(datetime.timezone.utc).isoformat();cmd=[NODE,TSX,str(C/script),*args];r=subprocess.run(cmd,cwd=C,capture_output=True,text=True);put('checks/'+name+'.terminal.actual.json',{'schemaVersion':1,'command':cmd,'cwdRole':'Ignored selective isolated normal execution capsule; conventional active path binding only inside capsule','startedAt':at,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':r.returncode,'durationSeconds':time.monotonic()-start,'stdout':r.stdout,'stderr':r.stderr,'normalRulesChanged':False,'activeWrites':[],'strictProgressClaim':False});print(name,'EXIT',r.returncode,flush=True);return r
qa=run('normal-whole-current-chemie-QA-generation-complete-helper-attempt2','app/scripts/generateGoalVisualizationQaLedgers.ts',['--subject=chemie']);assert qa.returncode==0,qa.stderr
f=R/P/'candidate/current-QA.after-normal-generation.future-active.json';shutil.copyfile(C/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json',f)
res=run('normal-chemie-inactive-central-five-gate','app/scripts/reportDeepUnderstandingRollout.ts',['--config='+str(P/'registry/chemie-only-normal-check.config.json'),'--mode=check','--format=json'])
if res.stdout.strip().startswith('{'):
 put('checks/normal-chemie-inactive-central-five-gate.actual.report.json',json.loads(res.stdout))
atlas=run('normal-bounded378-source-atlas-build','app/scripts/buildGoalBookSourceAtlasInputs.ts',['--config',str(P/'source-atlas/bounded378-normal-isolated.inputs.json')])
if atlas.returncode==0:
 run('normal-bounded378-source-atlas-check','app/scripts/buildGoalBookSourceAtlasInputs.ts',['--config',str(P/'source-atlas/bounded378-normal-isolated.inputs.json'),'--check'])
 src=C/'app/scripts/config/goal-books/inactive-chemie-current-P25-source24-20261010-v1';dest=R/P/'source-atlas/generated-actual';shutil.copytree(src,dest,dirs_exist_ok=True)
print('DONE NORMAL CHECK PHASE',flush=True)

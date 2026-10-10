# SPDX-License-Identifier: Apache-2.0
import pathlib,subprocess,json,time,datetime,shutil
R=pathlib.Path.cwd();O=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1');C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule';T=R/'app/node_modules/.bin/tsx'
def run(label,args,required=True):
 cmd=[str(T),*args];start=time.monotonic();p=subprocess.run(cmd,cwd=C,capture_output=True,text=True);target=O/'checks'/f'{label}.terminal.actual.json';assert not target.exists();target.write_text(json.dumps({'schemaVersion':1,'argv':cmd,'cwdDiagnosticOnly':str(C),'exitCode':p.returncode,'durationSeconds':time.monotonic()-start,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stdout':p.stdout if label!='candidate-central'else '(separate full report file)','stderr':p.stderr,'normalRulesChanged':False,'activeWrites':[]},ensure_ascii=False,indent=2)+'\n');
 if label=='candidate-central':(O/'checks/candidate-central.actual.report.json').write_text(p.stdout)
 print(label,'actual exit',p.returncode,p.stdout[-1200:] if label!='candidate-central'else 'full report captured',p.stderr[-700:],flush=True)
 if required and p.returncode:raise SystemExit(p.returncode)
 return p
run('P38-normal',['app/scripts/positiveGoalEvidenceReview.ts','--config='+str(O/'positive/whole38.current-paired-reviewed.future-active.config.json'),'--mode=check'])
run('candidate-central',['app/scripts/reportDeepUnderstandingRollout.ts','--config='+str(O/'registry/all-subjects.chemie-only-merge.future-active.config.json'),'--mode=check','--format=json'])

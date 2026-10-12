"""Apache-2.0. Run unchanged normal CLIs in the existing private app execution context."""
from pathlib import Path
import subprocess,json,datetime,hashlib
R=Path('/home/enpasos/projects/skillpilot')
O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-original-eleven-D9-technical-adoption-agent-20261013-v1')
X=R/'tmp/chemie-q4-current220-prep/execution'
C=O/'configs/native-D11.original-D9.batch.config.json';N=O/'native-D11'
hashbytes=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
scripts=['materializeGoalDescriptionRolloutBatch.ts','materializeGoalDescriptionRolloutSynthesisManifest.ts','materializeGoalDescriptionRolloutResolutions.ts','validateGoalDescriptionRolloutSynthesisDecisionManifest.ts','validateGoalDescriptionDualRoundResolution.ts','goalBookModel.ts']
bindings=[]
for name in scripts:
 a=R/'app/scripts'/name;b=X/'app/scripts'/name
 assert hashbytes(a)==hashbytes(b),name
 bindings.append({'productionPath':str(a.relative_to(R)),'executionPath':str(b.relative_to(R)),'sha256':'sha256:'+hashbytes(a),'byteExact':True})
commands=[['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',str(C),'--write'],['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','--config',str(C),'--authoring',str(N/'synthesis-authoring.json'),'--write'],['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',str(C),'--synthesis-manifest',str(N/'synthesis-decisions.json'),'--write'],['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',str(C),'--write']]
for n,argv in enumerate(commands,1):
 stem=R/O/'checks'/f'normal-D9-adoption-step-{n}';assert not stem.with_suffix('.receipt.json').exists()
 started=datetime.datetime.now(datetime.timezone.utc).isoformat()
 p=subprocess.run(argv,cwd=X,text=True,capture_output=True)
 stem.with_suffix('.stdout.txt').write_text(p.stdout);stem.with_suffix('.stderr.txt').write_text(p.stderr)
 stem.with_suffix('.receipt.json').write_text(json.dumps({'schemaVersion':1,'argv':argv,'cwd':str(X.relative_to(R)),'startedAtUTC':started,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'productionScriptCopies':bindings,'unmodifiedProductionCode':True,'writesOnlyOwnedAdoptionOutputs':True,'activeOrGitWrites':0},ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'step':n,'exitCode':p.returncode,'stdout':p.stdout.strip(),'stderr':p.stderr.strip()}))
 if p.returncode:raise SystemExit(p.returncode)

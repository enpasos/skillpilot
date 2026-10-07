from pathlib import Path
from datetime import datetime,timezone
import json, subprocess, sys
ROOT=Path('/home/enpasos/projects/skillpilot');BASE=Path(__file__).resolve().parent.parent;NATIVE=BASE/'native-root'
op=sys.argv[1];tsx=ROOT/'app/node_modules/.bin/tsx'
commands={
 'd17-prepare':['app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config','configs/native-d-seventeen.batch.config.json'],
 'dc441-prepare':['app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config','configs/native-d-c441.batch.config.json'],
 'd17-check':['app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config','configs/native-d-seventeen.batch.config.json'],
 'dc441-check':['app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config','configs/native-d-c441.batch.config.json'],
 'p18-materialize':['app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config','configs/positive18.author-candidates.config.json','--candidates','candidate/positive18.author-candidate-set.json','--write'],
 'p18-check':['app/scripts/positiveGoalEvidenceReview.ts','--mode=check','--config=configs/positive18.author-candidates.config.json'],
}
argv=[str(tsx),*commands[op]];start=datetime.now(timezone.utc).isoformat();r=subprocess.run(argv,cwd=NATIVE,capture_output=True,text=True);finish=datetime.now(timezone.utc).isoformat()
for ext,body in [('stdout.txt',r.stdout),('stderr.txt',r.stderr)]: (BASE/'receipts'/f'{op}.{ext}').write_text(body)
(BASE/'receipts'/f'{op}.call.json').write_text(json.dumps({'role':'Unchanged native tool run in isolated repository','argv':argv,'cwd':str(NATIVE),'startedAt':start,'finishedAt':finish,'exitCode':r.returncode,'activeWrites':False},indent=2)+'\n')
print(json.dumps({'operation':op,'exitCode':r.returncode,'stdout':r.stdout[-1600:],'stderr':r.stderr[-1800:]}));raise SystemExit(r.returncode)

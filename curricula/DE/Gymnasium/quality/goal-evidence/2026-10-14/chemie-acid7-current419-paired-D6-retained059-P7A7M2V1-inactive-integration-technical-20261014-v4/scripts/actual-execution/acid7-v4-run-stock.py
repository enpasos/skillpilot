import json,subprocess,sys
from datetime import datetime,timezone
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-acid7-current419-paired-D6-retained059-P7A7M2V1-inactive-integration-technical-20261014-v4'
label,which,script,*args=sys.argv[1:]
H=R/('tmp/chemie-resume-20261014/NAT9-host' if which=='historical' else 'tmp/chemie-resume-20261014/acid7-integration-v4-host')
argv=['node',str(R/'app/node_modules/tsx/dist/cli.mjs'),script,*args]
t=datetime.now(timezone.utc).isoformat();p=subprocess.run(argv,cwd=H,capture_output=True,text=True);end=datetime.now(timezone.utc).isoformat()
for k,v in [('stdout',p.stdout),('stderr',p.stderr)]:(O/f'receipts/{label}.{k}.actual.txt').write_text(v)
(O/f'receipts/{label}.completed-run.actual.json').write_text(json.dumps({'argv':argv,'cwd':str(H),'startedAtUTC':t,'completedAtUTC':end,'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr,'role':'Informed technical execution only; no new independent scientific vote'},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'label':label,'exitCode':p.returncode,'stdout':p.stdout[-4500:],'stderr':p.stderr[-4500:]}));raise SystemExit(p.returncode)

from pathlib import Path
import json, sys, subprocess, datetime
ROOT=Path('/home/enpasos/projects/skillpilot')
REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1')
ISO=ROOT/'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1'
name=sys.argv[1];argv=sys.argv[2:]
cwd=ISO
if argv[0]=='--read-only-live-root':
    cwd=ROOT;argv=argv[1:]
start=datetime.datetime.now(datetime.timezone.utc).isoformat()
r=subprocess.run(argv,cwd=cwd,capture_output=True,text=True)
obj={'schemaVersion':1,'stage':name,'commandArgv':argv,'cwd':str(cwd),'liveTreeReadOnly':cwd==ROOT,'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr,'nativeCodeModified':False,'activeWrites':False,'scienceReviewDecision':None}
p=ROOT/REL/'terminal'/f'{name}.actual.receipt.json';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
print(r.stdout,end='');print(r.stderr,end='',file=sys.stderr)
sys.exit(r.returncode)

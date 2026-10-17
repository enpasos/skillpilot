from pathlib import Path
from hashlib import sha256
from datetime import datetime,timezone
import subprocess,time,json,os,sys
O=Path(__file__).resolve().parent
prep=json.loads((O/'PREPARATION.post-FIRST.fresh-A1-and-exact-rest24.json').read_text())
role=sys.argv[1]
selected=next(item for item in prep['configs'] if item['role']==role)
C=Path(prep['physicalCheckCapsule'])
config_path=C/selected['relativePath']
config=json.loads(config_path.read_text())
script=C/'app/scripts/semanticAtomicityReview.ts'
paths=[script,config_path,C/config['reviewPath'],C/config['landscapePath']]
def pin(path):
 b=path.read_bytes();return {'path':str(path),'resolvedPath':str(path.resolve()),'sha256':sha256(b).hexdigest(),'bytes':len(b)}
before=[pin(p) for p in paths]
command=['node','--preserve-symlinks','--preserve-symlinks-main','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs',str(script),'--config='+selected['relativePath'],'--mode=check']
started=datetime.now(timezone.utc).isoformat();t=time.monotonic()
with (O/(role+'.stock-check.stdout.txt')).open('xb') as stdout,(O/(role+'.stock-check.stderr.txt')).open('xb') as stderr:
 result=subprocess.run(command,cwd=C,env=dict(os.environ,TSX_DISABLE_CACHE='1',NO_COLOR='1'),stdout=stdout,stderr=stderr)
finished=datetime.now(timezone.utc).isoformat();elapsed=time.monotonic()-t
after=[pin(p) for p in paths]
meta={'schemaVersion':1,'role':role,'command':command,'cwd':str(C),'environmentOverrides':{'TSX_DISABLE_CACHE':'1','NO_COLOR':'1'},'startedAt':started,'finishedAt':finished,'elapsedSeconds':elapsed,'exitCode':result.returncode,'executionAttempt':1,'observationTimeoutRerun':False,'inputsBefore':before,'inputsAfter':after,'allInputsUnchanged':before==after,'fullCentralCompilerPdfRun':False,'mode':'check','human':False,'applied':False}
path=O/(role+'.stock-check.execution.json');assert not path.exists();path.write_text(json.dumps(meta,indent=2)+'\n')
print(json.dumps(meta,indent=2));print((O/(role+'.stock-check.stdout.txt')).read_text());print((O/(role+'.stock-check.stderr.txt')).read_text())
if before!=after:raise SystemExit(3)
raise SystemExit(result.returncode)

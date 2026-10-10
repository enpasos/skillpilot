# SPDX-License-Identifier: Apache-2.0
import hashlib,json,subprocess,sys,shutil
from datetime import datetime,timezone
from pathlib import Path
R=Path.cwd();P=Path(__file__).resolve().parent.relative_to(R);C=Path((R/'tmp/m7-resumption-20261010/biologie-four-native-technical/capsule.actual.path.txt').read_text().strip());label=sys.argv[1];command=sys.argv[2:];directory=R/P/'terminal';directory.mkdir(exist_ok=True)
assert not (directory/(label+'.terminal.actual.json')).exists()
start=datetime.now(timezone.utc).isoformat();result=subprocess.run(command,cwd=C,text=True,capture_output=True)
files=[]
for kind,body in [('stdout',result.stdout),('stderr',result.stderr)]:
 p=P/'terminal'/(label+'.'+kind+'.actual.txt');(R/p).write_text(body);data=(R/p).read_bytes();files.append({'kind':kind,'path':str(p),'sha256':'sha256:'+hashlib.sha256(data).hexdigest(),'bytes':len(data)})
proof={'schemaVersion':1,'label':label,'actualArgv':command,'executionCwdDiagnosticOnly':str(C),'startedAt':start,'finishedAt':datetime.now(timezone.utc).isoformat(),'actualExitCode':result.returncode,'outputs':files,'scientificOrHumanApproval':False};(directory/(label+'.terminal.actual.json')).write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'label':label,'exitCode':result.returncode,'stdoutTail':result.stdout[-2200:],'stderrTail':result.stderr[-3500:]},ensure_ascii=False))
if result.returncode==0 and label=='P12-materialize':shutil.copyfile(C/P/'positive/twelve-current-raster.P.pending.review.jsonl',R/P/'positive/twelve-current-raster.P.pending.review.jsonl')
if result.returncode==0 and label.startswith('native12-prepare'):shutil.copytree(C/P/'native/twelve-current-native',R/P/'native/twelve-current-native')
sys.exit(result.returncode)

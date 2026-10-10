import shutil,subprocess,json,datetime,hashlib,tempfile,os
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot')
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-raster-native-technical-author-20261010-v1')
T=R/'tmp/m7-resumption-20261010/biologie-insect-eight-native-technical'
C=Path((T/'capsule.actual.path.txt').read_text().strip())
tsx=str(R/'app/node_modules/.bin/tsx')
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def atomic(p,data):
 p.parent.mkdir(parents=True,exist_ok=True)
 with tempfile.NamedTemporaryFile(dir=T,prefix='atomic-output-',delete=False) as f:
  f.write(data.encode() if isinstance(data,str) else data);s=f.name
 os.replace(s,p)
def run(label,args,cwd):
 d=R/P/'terminal';d.mkdir(exist_ok=True)
 started=datetime.datetime.now(datetime.timezone.utc).isoformat()
 result=subprocess.run(args,cwd=cwd,capture_output=True,text=True)
 out=P/'terminal'/f'{label}.stdout.actual.txt';err=P/'terminal'/f'{label}.stderr.actual.txt'
 atomic(R/out,result.stdout);atomic(R/err,result.stderr)
 proof={'schemaVersion':1,'label':label,'executionArgvDiagnostic':args,'executionCwdDiagnosticOnly':str(cwd),'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':result.returncode,'stdout':ref(out),'stderr':ref(err),'scientificApprovalFromNormalValidation':False}
 atomic(d/f'{label}.terminal.actual.json',json.dumps(proof,indent=2)+'\n')
 print(json.dumps({'label':label,'exitCode':result.returncode,'stdoutTail':result.stdout[-1600:],'stderrTail':result.stderr[-1600:]},ensure_ascii=False),flush=True)
 assert result.returncode==0,f'Actual failure retained: {label}'

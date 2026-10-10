# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,subprocess,datetime,sys,shutil
R=pathlib.Path('/home/enpasos/projects/skillpilot');P=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-verhalten-hormone-ten-sehbahn-v3-current343-native-technical-successor-20261010-v2');C=pathlib.Path((R/'tmp/m7-resumption-20261010/biologie-four-native-technical/capsule.actual.path.txt').read_text().strip())
def ref(p):b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
label=sys.argv[1];args=sys.argv[2:];d=R/P/'terminal';d.mkdir(exist_ok=True);start=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(args,cwd=C,capture_output=True,text=True)
o=P/'terminal'/f'{label}.stdout.actual.txt';e=P/'terminal'/f'{label}.stderr.actual.txt';assert not (R/o).exists();(R/o).write_text(r.stdout);(R/e).write_text(r.stderr)
proof={'schemaVersion':1,'label':label,'executionArgvDiagnosticOnly':args,'executionCwdDiagnosticOnly':str(C),'startedAt':start,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':r.returncode,'stdout':ref(o),'stderr':ref(e),'scientificApprovalFromTechnicalExecution':False};(d/f'{label}.terminal.actual.json').write_text(json.dumps(proof,indent=2)+'\n');print(json.dumps({'label':label,'exit':r.returncode,'stdoutTail':r.stdout[-2800:],'stderrTail':r.stderr[-4000:]},ensure_ascii=False))
if label=='P10-materialize' and r.returncode==0:shutil.copyfile(C/P/'positive/ten-current-raster.P.pending.review.jsonl',R/P/'positive/ten-current-raster.P.pending.review.jsonl')
if label=='native10-prepare' and r.returncode==0:shutil.copytree(C/P/'native/ten-current-native',R/P/'native/ten-current-native')
sys.exit(r.returncode)

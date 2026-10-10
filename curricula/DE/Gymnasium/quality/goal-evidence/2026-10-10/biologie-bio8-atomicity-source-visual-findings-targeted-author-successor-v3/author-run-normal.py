# SPDX-License-Identifier: Apache-2.0
import datetime, hashlib, json, pathlib, subprocess, sys
R=pathlib.Path('/home/enpasos/projects/skillpilot')
P=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3')
C=R/'tmp/m7-bio8-findings-v3-author-isolated-capsule'
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
label=sys.argv[1];args=sys.argv[2:];started=datetime.datetime.now(datetime.timezone.utc).isoformat()
r=subprocess.run(args,cwd=C,capture_output=True,text=True)
o=P/'terminal'/(label+'.stdout.actual.txt');e=P/'terminal'/(label+'.stderr.actual.txt')
assert not (R/o).exists();(R/o).write_text(r.stdout);(R/e).write_text(r.stderr)
p=R/P/'terminal'/(label+'.terminal.actual.json');p.write_text(json.dumps({'label':label,'executionCwdDiagnosticOnly':str(C),'argvDiagnosticOnly':args,'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':r.returncode,'stdout':ref(o),'stderr':ref(e),'scientificApproval':False},indent=2)+'\n')
print(json.dumps({'label':label,'exit':r.returncode,'stdoutTail':r.stdout[-2200:],'stderrTail':r.stderr[-2500:]},ensure_ascii=False),flush=True)
sys.exit(r.returncode)

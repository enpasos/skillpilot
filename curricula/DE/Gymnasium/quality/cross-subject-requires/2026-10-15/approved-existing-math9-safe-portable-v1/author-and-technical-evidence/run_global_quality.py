"""Native global five-subject status plus all protected floors; no Main writes."""
from pathlib import Path
import datetime,subprocess,os,json,hashlib
M=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;R=O/'isolated-root-with-current-D-v2';N=M/'tmp/ci-tools/node-v20.20.2-linux-x64/bin/node'
nameprefix=__import__('sys').argv[1]
def bind(p):
 b=p.read_bytes();return {'path':str(p.relative_to(M)),'bytes':len(b),'sha256':'sha256:'+hashlib.sha256(b).hexdigest()}
def run(name,script,extra=[]):
 argv=[str(N),str(R/'app/node_modules/tsx/dist/cli.mjs'),str(R/'app/scripts'/script)]+extra;start=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with (O/(name+'.stdout.raw.txt')).open('xb') as a,(O/(name+'.stderr.raw.txt')).open('xb') as b:p=subprocess.run(argv,cwd=R/'app',env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},stdout=a,stderr=b)
 (O/(name+'.execution.actual.json')).write_text(json.dumps({'argv':argv,'cwd':str(R/'app'),'startedAtUTC':start,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'stdout':bind(O/(name+'.stdout.raw.txt')),'stderr':bind(O/(name+'.stderr.raw.txt')),'MainWrites':False},indent=2)+'\n');print(name,p.returncode,flush=True)
 return p.returncode
for rel in ['docs/qa-ci/status/curriculum-quality-status.json','docs/qa-ci/status/curriculum-quality-status.md']:assert not (R/rel).is_symlink() and R in (R/rel).resolve().parents
run(nameprefix+'-generate','generateCurriculumQualityStatus.ts')
for rel in ['docs/qa-ci/status/curriculum-quality-status.json','docs/qa-ci/status/curriculum-quality-status.md']:(O/(nameprefix+'-'+Path(rel).name)).write_bytes((R/rel).read_bytes())
run(nameprefix+'-all10floors','checkCurriculumMaturityFloors.ts')

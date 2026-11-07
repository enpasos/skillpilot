from pathlib import Path
import json,subprocess,os,hashlib,datetime,re
W=Path('/dev/shm/curriculum-ci-parallel-core-candidate-20261107');C=W/'candidate-root';(W/'temporary').mkdir(exist_ok=True)
args=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind',str(W),str(W),'--chdir',str(C),'--','node','--test','scripts/plugin_ci_workflows.test.mjs'];rec={'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':args,'cwd':str(C)}
with (W/'normal-node-test.stdout').open('w') as o,(W/'normal-node-test.stderr').open('w') as e:p=subprocess.run(args,cwd=C,stdout=o,stderr=e,env={**os.environ,'TMPDIR':str(W/'temporary')})
rec.update(exitCode=p.returncode,finishedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),stdoutSha256=hashlib.sha256((W/'normal-node-test.stdout').read_bytes()).hexdigest(),stderrSha256=hashlib.sha256((W/'normal-node-test.stderr').read_bytes()).hexdigest());(W/'normal-node-test.execution.json').write_text(json.dumps(rec,indent=2)+'\n');print('node test exit',p.returncode);print((W/'normal-node-test.stdout').read_text());print((W/'normal-node-test.stderr').read_text());assert p.returncode==0
out=(W/'normal-node-test.stdout').read_text()
for key,value in [('tests',16),('pass',16),('fail',0),('cancelled',0),('skipped',0),('todo',0)]:assert re.search(r'^# '+key+' '+str(value)+r'$',out,re.M),key

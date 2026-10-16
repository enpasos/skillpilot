# SPDX-License-Identifier: Apache-2.0
# Run unchanged owning CLI with a read-only canonical-path candidate mount.
from pathlib import Path
import json,subprocess,os,sys,datetime,hashlib
L=Path(os.environ.get('FIRST20_REPLAY_WORK',str(Path(__file__).resolve().parent)));C=json.loads((L/'CONFIG.actual.json').read_text());R=Path(C['root']);P=Path(C['packet']);B=Path(os.environ.get('FIRST20_BWRAP',str(R/'tmp/ci-tools/hermetic-consumer-tools-20261015-v1/root/usr/bin/bwrap')));Q=R/'curricula/quality/cross-subject-requires'
assert hashlib.sha256(B.read_bytes()).hexdigest()=='e318903862396f96de3df57264e0158682b952fd3fb53ac23d876413e7b30f71'
name,script,*args=sys.argv[1:];out=L/'normal-cli-receipts';out.mkdir(exist_ok=True)
mount=[str(B),'--die-with-parent','--new-session','--unshare-user','--unshare-pid','--unshare-ipc','--unshare-uts','--unshare-net','--cap-drop','ALL','--ro-bind','/','/','--bind',str(L),str(L),'--tmpfs','/tmp','--proc','/proc','--dev','/dev','--tmpfs',str(Q)]
for p in sorted(Q.iterdir()):mount+=['--ro-bind',str(p),str(p)]
mount+=['--ro-bind',str(P.parent),str(Q/'2026-10-16'),'--remount-ro',str(Q),'--chdir',str(R/'app')]
env=dict(os.environ,TMPDIR='/tmp',XDG_CACHE_HOME=str(L/'execution-cache'),GIT_OPTIONAL_LOCKS='0',PATH=str(Path(C['node']).parent)+':'+os.environ['PATH'])
command=[C['node'],str(R/'app/node_modules/tsx/dist/cli.mjs'),str(R/script),*args];full=mount+['--',*command];start=datetime.datetime.now(datetime.timezone.utc).isoformat()
with (out/(name+'.stdout.actual.txt')).open('xb') as stdout,(out/(name+'.stderr.actual.txt')).open('xb') as stderr:p=subprocess.run(full,cwd=L,env=env,stdout=stdout,stderr=stderr)
receipt={'command':command,'mountCommand':mount,'cwd':str(R/'app'),'startUTC':start,'endUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'RootOSReadOnly':True,'candidateCanonicalMountReadOnly':True,'onlyOwnLaneWritable':True,'TMPDIR':'/tmp','nodeVersion':'v20.20.2','owningCLI':{'path':script,'sha256':'sha256:'+hashlib.sha256((R/script).read_bytes()).hexdigest()},'stdout':str((out/(name+'.stdout.actual.txt')).relative_to(L)),'stderr':str((out/(name+'.stderr.actual.txt')).relative_to(L))}
(out/(name+'.execution.actual.json')).write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt));print((out/(name+'.stdout.actual.txt')).read_text());print((out/(name+'.stderr.actual.txt')).read_text());raise SystemExit(p.returncode)

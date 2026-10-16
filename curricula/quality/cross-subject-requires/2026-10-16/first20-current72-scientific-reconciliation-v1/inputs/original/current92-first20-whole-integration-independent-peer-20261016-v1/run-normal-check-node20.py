import sys,subprocess,json,datetime,os,pathlib,hashlib
R=pathlib.Path('/home/enpasos/projects/skillpilot')
L=pathlib.Path(__file__).resolve().parent
name,script,*args=sys.argv[1:]
cmd=[str(R/'tmp/ci-tools/node-v20.20.2-linux-x64/bin/node'),'--import','tsx',str(R/script),*args]
start=datetime.datetime.now(datetime.timezone.utc).isoformat()
env=dict(os.environ,GIT_OPTIONAL_LOCKS='0',TMPDIR=str(L/'private-scratch'),XDG_CACHE_HOME=str(L/'ephemeral-cache'))
(L/'private-scratch').mkdir(exist_ok=True);(L/'ephemeral-cache').mkdir(exist_ok=True)
out=L/'checks';out.mkdir(exist_ok=True)
with (out/(name+'.stdout.actual.txt')).open('wb') as stdout,(out/(name+'.stderr.actual.txt')).open('wb') as stderr:
 p=subprocess.run(cmd,cwd=R/'app',env=env,stdout=stdout,stderr=stderr)
receipt={'startUTC':start,'endUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':cmd,'cwd':str(R/'app'),'exitCode':p.returncode,'rootOSReadonly':True,'onlyOwnLaneWritable':True,'owningCLISha256':hashlib.sha256((R/script).read_bytes()).hexdigest(),'stdout':str(out/(name+'.stdout.actual.txt')),'stderr':str(out/(name+'.stderr.actual.txt'))}
(out/(name+'.execution.actual.json')).write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
raise SystemExit(p.returncode)

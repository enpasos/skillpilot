from pathlib import Path
import json,subprocess,time,hashlib,os
R=Path('/home/enpasos/projects/skillpilot');P=Path(__file__).resolve().parent;s=json.loads((P/'private-workspace.json').read_bytes());W=Path(s['workspace']);(W/'tmp').mkdir(exist_ok=True)
name=os.environ.get('STEP','core');prefix=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind',str(W),str(W),'--setenv','TMPDIR',str(W/'tmp'),'--chdir',str(R)]
if name=='app-after':prefix+=['--ro-bind',str(W/'after.json'),str(R/s['source'])]
script=P/('joint_witnesses.mts'if name=='joint'else'validate.mts');args=[str(R/'app/node_modules/.bin/tsx'),str(script)]+([]if name=='joint'else[name]);argv=prefix+['--']+args;t=time.time();p=subprocess.run(argv,capture_output=True)
(P/(name+'.stdout')).write_bytes(p.stdout);(P/(name+'.stderr')).write_bytes(p.stderr);(P/(name+'.execution.json')).write_text(json.dumps({'argv':argv,'exitCode':p.returncode,'elapsedSeconds':time.time()-t,'stdoutSha256':hashlib.sha256(p.stdout).hexdigest(),'stderrSha256':hashlib.sha256(p.stderr).hexdigest(),'activeRootReadOnly':True},indent=2)+'\n');print(name,p.returncode,p.stdout.decode()[-1200:],p.stderr.decode()[-1500:]);assert p.returncode==0

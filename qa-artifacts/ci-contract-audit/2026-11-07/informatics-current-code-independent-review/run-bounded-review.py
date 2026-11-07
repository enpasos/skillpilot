from pathlib import Path
import json, subprocess, time, hashlib
R=Path('/home/enpasos/projects/skillpilot')
D=Path(__file__).resolve().parent
W=Path('/dev/shm/informatics-e-reviewed-current-20261107')
cmd=['bwrap','--die-with-parent','--unshare-net','--ro-bind','/','/','--proc','/proc','--dev','/dev','--tmpfs','/tmp']
for rel in ['app/scripts','app/src','contracts/curriculum-assessment-coverage']:
 cmd+=['--ro-bind',str(W/'native-code'/rel),str(R/rel)]
for row in json.loads((D.parent/'informatics-e-reviewed-current-definition-candidate/changed-files.json').read_text())['files']:
 rel=row['path']
 if rel.startswith(('app/scripts/','contracts/curriculum-assessment-coverage/')):continue
 cmd+=['--ro-bind',str(W/'candidate'/rel),str(R/rel)]
cmd+=['--setenv','TSX_DISABLE_CACHE','1','--setenv','TMPDIR','/tmp','--chdir',str(R),'--',str(R/'app/node_modules/.bin/tsx')]
for label,entry in [('existing-current14',str(R/'app/scripts/testInformaticsCurrentDefinitionRevision.ts')),('independent-countercases',str(D/'independent-countercases.mts'))]:
 full=cmd+[entry];t=time.time();p=subprocess.run(full,capture_output=True,text=True)
 (D/(label+'.stdout')).write_text(p.stdout);(D/(label+'.stderr')).write_text(p.stderr)
 (D/(label+'.receipt.json')).write_text(json.dumps({'command':full,'startUnix':t,'endUnix':time.time(),'exitCode':p.returncode,'stdoutSha256':hashlib.sha256(p.stdout.encode()).hexdigest(),'stderrSha256':hashlib.sha256(p.stderr.encode()).hexdigest(),'networkDisabled':True,'activeInputsReadOnly':True},indent=2)+'\n')
 print(label,p.returncode,p.stdout[-2500:],p.stderr[-1000:])
 if p.returncode:raise SystemExit(p.returncode)

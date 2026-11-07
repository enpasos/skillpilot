from pathlib import Path
import hashlib,json,subprocess,time,shutil
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;s=json.loads((O/'private-workspace.json').read_text());W=Path(s['workspace'])
a=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind',str(W),str(W),'--setenv','TMPDIR',str(W/'tmp'),'--chdir',str(R)]
for n,p in enumerate(s['assets']):a+=['--ro-bind',str(W/f'asset-dir-{n}'/Path(p).name),str(R/p)]
a+=['--ro-bind',s['candidateQa'],str(R/s['qa']),'--',str(R/'app/node_modules/.bin/tsx'),str(O/'final-native-math.ts')]
t=time.time();p=subprocess.run(a,capture_output=True)
(O/'final-native-math.stdout.txt').write_bytes(p.stdout);(O/'final-native-math.stderr.txt').write_bytes(p.stderr);(O/'final-native-math.execution.json').write_text(json.dumps({'argv':a,'exitCode':p.returncode,'elapsedSeconds':time.time()-t,'stdoutSha256':hashlib.sha256(p.stdout).hexdigest(),'stderrSha256':hashlib.sha256(p.stderr).hexdigest(),'sourceRoBoundByWholeRoot':True,'actualIndependentPRecord':True,'activeWrites':False},indent=2)+'\n')
for name in ['final-native-math-report.json.gz','final-native-math-summary.json']:
 if(W/name).exists():shutil.copy2(W/name,O/name)
for f,g in s['protected'].items():assert hashlib.sha256((R/f).read_bytes()).hexdigest()==g['sha256'],f
print(p.stdout.decode(),flush=True);print(p.stderr.decode(),flush=True);assert p.returncode==0,p.returncode

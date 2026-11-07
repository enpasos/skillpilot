import sys,json,hashlib,subprocess,time,datetime
from pathlib import Path
sys.dont_write_bytecode=True
R=Path('/home/enpasos/projects/skillpilot');W=Path(__file__).parent;J=lambda x:(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode();H=lambda b:hashlib.sha256(b).hexdigest();p=json.loads((W/'proposal.json').read_bytes())
# Pin current source and executing implementation; do not write or freeze Git metadata in the live checkout.
files=set(R.joinpath('app/src').rglob('*.ts'))|set(R.joinpath('app/src').rglob('*.tsx'))|set(R.joinpath('app/scripts').rglob('*.ts'))|set(R.joinpath('app/scripts').rglob('*.tsx'))
for dirname in ['mapping','provenance','composition-views']:
 files |= set((R/'curricula/DE/Gymnasium'/dirname).rglob('*.json'))
for dirname in ['semantic-atomicity','memory-card-review']:
 files |= set((R/'curricula/DE/Gymnasium/quality'/dirname).glob('*.json'))
guards={str(f.relative_to(R)):H(f.read_bytes())for f in sorted(files)};(W/'input-guards.before.json').write_bytes(J(guards))
for mode in ['baseline','candidate']:
 for pin in p['catalogSources']:assert H((R/pin['path']).read_bytes())==pin['sha256'],pin['path']
 cmd=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind',str(W),str(W),'--setenv','TMPDIR',str(W/'tmp'),'--setenv','GIT_INDEX_FILE',str(W/'git-index.readonly'),'--setenv','PYTHONDONTWRITEBYTECODE','1']
 for pin in p['catalogSources']:
  src=W/'candidate.json' if mode=='candidate' and pin['landscapeId']==p['source']['landscapeId'] else W/'snapshot'/pin['path'];cmd+=['--ro-bind',str(src),str(R/pin['path'])]
 cmd+=['--chdir',str(R),'--',str(R/'app/node_modules/.bin/tsx'),str(W/'native-scope.mts'),mode]
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();ts=time.monotonic()
 with (W/(mode+'.stdout')).open('wb')as out,(W/(mode+'.stderr')).open('wb')as err:process=subprocess.run(cmd,stdout=out,stderr=err)
 receipt={'argv':cmd,'startedAtActual':start,'completedAtActual':datetime.datetime.now(datetime.timezone.utc).isoformat(),'seconds':time.monotonic()-ts,'exitCode':process.returncode,'stdoutSha256':H((W/(mode+'.stdout')).read_bytes()),'stderrSha256':H((W/(mode+'.stderr')).read_bytes()),'sourceSha256':p['source']['sha256']if mode=='baseline'else p['candidateSourceSha256']};(W/(mode+'-execution.json')).write_bytes(J(receipt));print(json.dumps({'mode':mode,'exitCode':process.returncode,'seconds':receipt['seconds']}),flush=True);assert process.returncode==0
for path,sha in guards.items():assert H((R/path).read_bytes())==sha,path
for pin in p['catalogSources']:assert H((R/pin['path']).read_bytes())==pin['sha256'],pin['path']
(W/'input-guards.after.json').write_bytes(J({'allInputHashesUnchanged':True,'guardedFiles':len(guards),'canonicalSources':len(p['catalogSources'])}));print('readonly native scope pair finished; all root input guards unchanged',flush=True)

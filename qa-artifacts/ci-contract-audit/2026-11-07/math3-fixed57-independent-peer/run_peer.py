import importlib.util,json,subprocess,time,hashlib,shutil,os
from pathlib import Path
W=Path(__file__).resolve().parent;A=Path('/dev/shm/skillpilot-fixed57-vj2adrns');R=Path('/home/enpasos/projects/skillpilot');H=lambda b:hashlib.sha256(b).hexdigest();spec=importlib.util.spec_from_file_location('author_prefix',A/'run-native.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
# Read only all other RAM; only this peer's private root is writable.
def prefix(current=True,authority=True,extra=None):
 a=m.prefix(current=current,authority=authority,shallow=True);i=a.index('--bind');assert a[i+1:i+3]==['/dev/shm','/dev/shm'];a[i]='--ro-bind';a[i+3:i+3]=['--bind',str(W),str(W)];t=a.index('TMPDIR');a[t+1]=str(W/'scratch')
 for s,t in extra or[]:a+=['--bind',str(s),str(t)]
 return a
idx=json.loads((A/'candidate/contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json').read_bytes());mid='ce198bc9-b014-52ba-814f-25cc3e020668';rec=next(r['receipt']['path']for r in idx['rows']if r['goalId']==mid);sources=[(A/'source-e4de.json',R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'),(A/'candidate/contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json',R/'contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json'),(R/rec,R/rec),(A/'asset0'/f'{mid}.png',R/f'app/public/assets/goal-visualizations/mathematik/{mid}/{mid}.png'),(A/'asset1'/f'{mid}.png',R/f'curricula/DE/Gymnasium/visualizations/mathematik/{mid}/{mid}.png')];copies=[];pins=[]
for i,(source,target)in enumerate(sources):
 raw=source.read_bytes();dest=W/f'own-input-{i}';dest.write_bytes(raw);copies.append((dest,target));pins.append({'original':str(source),'private':str(dest),'mountedAt':str(target),'sha256':H(raw)})
(W/'own-current-inputs.json').write_text(json.dumps(pins,indent=2)+'\n')
def run(name,args,current=True,authority=True,extra=None,expected=0):
 argv=prefix(current,authority,extra)+['--']+[str(x)for x in args];t=time.time();p=subprocess.run(argv,capture_output=True);(W/'results'/f'{name}.stdout').write_bytes(p.stdout);(W/'results'/f'{name}.stderr').write_bytes(p.stderr);out={'name':name,'argv':argv,'exit':p.returncode,'seconds':time.time()-t,'stdoutSha256':H(p.stdout),'stderrSha256':H(p.stderr)};(W/'results'/f'{name}.command.json').write_text(json.dumps(out,indent=2)+'\n');print(name,p.returncode,flush=True);assert p.returncode==expected,(p.stdout[-2000:],p.stderr[-3000:]);return p
run('independent-current-controls',[R/'app/node_modules/.bin/tsx',W/'peer.mts'],extra=copies)
for p in pins:assert H(Path(p['original']).read_bytes())==p['sha256']and H(Path(p['private']).read_bytes())==p['sha256']
run('independent-normal57-maturity',[R/'app/node_modules/.bin/tsx',R/'app/scripts/testVisualizationContextMaturity.ts'])

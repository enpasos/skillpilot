#!/usr/bin/env python3
from pathlib import Path
import datetime,gzip,hashlib,json,subprocess,time
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[3]
OLD=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-authority-integration-candidate'
W=Path(json.loads((OUT/'ram-location.json').read_bytes())['path'])
(OUT/'results').mkdir(exist_ok=True)
sha=lambda raw:hashlib.sha256(raw).hexdigest()
def prefix(shallow=True,extras=()):
 args=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind','/dev/shm','/dev/shm',
  '--ro-bind',str(W/'scripts'),str(ROOT/'app/scripts'),'--ro-bind',str(W/'root-scripts'),str(ROOT/'scripts'),
  '--ro-bind',str(W/'contracts'),str(ROOT/'contracts/goal-visualization-context/v1'),
  '--ro-bind',str(W/'politikwirtschaft49.readonly.json'),str(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_POLITIKWIRTSCHAFT.de.json'),
  '--ro-bind',str(W/'workspace.index.readonly'),str(W/'workspace.index.readonly'),'--setenv','GIT_INDEX_FILE',str(W/'workspace.index.readonly'),
  '--setenv','TMPDIR',str(W/'scratch'),'--chdir',str(ROOT)]
 if shallow:args+=['--ro-bind',str(W/'host/.git'),str(ROOT/'.git')]
 for source,target in extras:args+=['--ro-bind',str(source),str(target)]
 return args
def run(name,args,expected=0,shallow=True,extras=(),pattern=None):
 command=prefix(shallow,extras)+['--']+list(map(str,args));start=datetime.datetime.now(datetime.timezone.utc).isoformat();clock=time.monotonic()
 result=subprocess.run(command,capture_output=True)
 for suffix,raw in [('stdout',result.stdout),('stderr',result.stderr)]:(OUT/f'results/{name}.{suffix}.gz').write_bytes(gzip.compress(raw,mtime=0))
 record={'name':name,'startedUtc':start,'completedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'argv':command,
  'exitCode':result.returncode,'expectedExitCode':expected,'elapsedSeconds':time.monotonic()-clock,'stdoutSha256':sha(result.stdout),'stderrSha256':sha(result.stderr),
  'sourceFramePoWiSha256':sha((W/'politikwirtschaft49.readonly.json').read_bytes()),'kernelSourceSha256':sha((W/'root-scripts/visualization_review_git_capsule.py').read_bytes())}
 (OUT/f'results/{name}.execution.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps({key:value for key,value in record.items()if key!='argv'}),flush=True)
 assert result.returncode==expected,(name,result.stdout[-1000:],result.stderr[-2500:])
 if pattern:assert pattern.encode()in result.stdout+result.stderr,(name,pattern)
 return result

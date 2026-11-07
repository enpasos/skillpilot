#!/usr/bin/env python3
"""Normal module paths, read-only host, actual unrelated shallow Git, own RAM outputs."""
from pathlib import Path
import datetime,gzip,hashlib,json,os,subprocess,time
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[3]
W=Path(json.loads((OUT/'ram-location.json').read_bytes())['path'])
sha=lambda raw:hashlib.sha256(raw).hexdigest()
def prefix(shallow=True,extras=()):
 args=['bwrap','--ro-bind','/','/','--dev-bind','/dev','/dev','--proc','/proc','--bind','/dev/shm','/dev/shm',
  '--ro-bind',str(W/'scripts'),str(ROOT/'app/scripts'),'--ro-bind',str(W/'contracts'),str(ROOT/'contracts/goal-visualization-context/v1'),
  '--ro-bind',str(W/'root-scripts'),str(ROOT/'scripts'),'--setenv','TMPDIR',str(W/'scratch'),
  '--setenv','GIT_INDEX_FILE',str(W/'workspace.index.readonly'),'--ro-bind',str(W/'workspace.index.readonly'),str(W/'workspace.index.readonly'),
  '--chdir',str(ROOT)]
 if shallow:args+=['--ro-bind',str(W/'host/.git'),str(ROOT/'.git')]
 for source,target in extras:args+=['--ro-bind',str(source),str(target)]
 return args
def run(name,args,expected=0,shallow=True,extras=(),pattern=None):
 command=prefix(shallow,extras)+['--']+list(map(str,args));start=datetime.datetime.now(datetime.timezone.utc).isoformat();clock=time.monotonic()
 result=subprocess.run(command,capture_output=True)
 (W/'results'/f'{name}.stdout').write_bytes(result.stdout);(W/'results'/f'{name}.stderr').write_bytes(result.stderr)
 record={'name':name,'startedUtc':start,'completedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
  'argv':command,'exitCode':result.returncode,'expectedExitCode':expected,'elapsedSeconds':time.monotonic()-clock,
  'stdoutSha256':sha(result.stdout),'stderrSha256':sha(result.stderr),
  'workspaceIndexSnapshotSha256':sha((W/'workspace.index.readonly').read_bytes()),'actualHostHistory':'unrelated-depth1'if shallow else'actual-readonly-full-original-history'}
 (OUT/'results').mkdir(exist_ok=True)
 (OUT/'results'/f'{name}.execution.json').write_text(json.dumps(record,indent=2)+'\n')
 for suffix,data in [('stdout',result.stdout),('stderr',result.stderr)]:
  (OUT/'results'/f'{name}.{suffix}.gz').write_bytes(gzip.compress(data,mtime=0))
 print(json.dumps({k:v for k,v in record.items()if k!='argv'}),flush=True)
 assert result.returncode==expected,(name,result.stdout[-1500:],result.stderr[-4000:])
 if pattern:assert pattern.encode()in result.stdout+result.stderr,(name,pattern)
 return result
if __name__=='__main__':
 result=run('collector74',[ROOT/'app/node_modules/.bin/tsx',ROOT/'app/scripts/collectVisualizationContextEconomics17Originals.ts'],shallow=False)
 path=W/'contracts/qualified-context-index-economics17-2026-11-07.json';path.write_bytes(result.stdout)
 dest=OUT/'private-code/contracts/goal-visualization-context/v1'/path.name;dest.write_bytes(result.stdout)
 print(json.dumps({'newIndexSha256':sha(result.stdout),'newIndexBytes':len(result.stdout)}),flush=True)

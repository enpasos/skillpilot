"""One actual bounded stock prepare and check for a separately bound final native4."""
from pathlib import Path
import datetime,hashlib,json,os,subprocess,sys,time
O=Path(__file__).resolve().parent;K=O/'capsule'
prep=Path(sys.argv[1]);version=sys.argv[2]
assert prep.is_relative_to(O) and version=='v3'
h=json.loads(prep.read_text());checks=[]
assert not Path(h['nativeRoot']).exists()
for mode in ['prepare','check']:
 argv=['node','--preserve-symlinks','--preserve-symlinks-main','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs',str(K/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),mode,'--config',h['configRelativePath']]
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
 result=subprocess.run(argv,cwd=K,text=True,capture_output=True,check=False,env=dict(os.environ,TSX_DISABLE_CACHE='1',NO_COLOR='1'))
 for stream,text in [('stdout',result.stdout),('stderr',result.stderr)]:
  out=O/f'STOCK.native4-{version}.{mode}.{stream}.txt'
  with out.open('x') as f:f.write(text)
 execution={'mode':mode,'argv':argv,'cwd':str(K),'startedAtUTC':started,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':time.monotonic()-t,'exitCode':result.returncode,'actualStdout':result.stdout,'actualStderr':result.stderr}
 out=O/f'STOCK.native4-{version}.{mode}.execution.json'
 with out.open('x') as f:json.dump(execution,f,indent=2);f.write('\n')
 checks.append(execution)
 assert result.returncode==0,result.stderr
for expected in h['sourceGuards']:
 raw=Path(expected['path']).read_bytes();assert hashlib.sha256(raw).hexdigest()==expected['sha256'] and len(raw)==expected['bytes'],expected['path']
out=O/f'CHECK.one-bounded-native4-{version}-prepare-and-stock-check.json'
with out.open('x') as f:json.dump({'role':'One bounded current4 native prepare/check; no full central or full439 publication','checks':checks,'sourceGuardsUnchanged':True,'frozen14Unchanged':True,'newScientificDecisions':False,'humanApproval':False},f,indent=2);f.write('\n')
print(json.dumps({'checks':[{'mode':c['mode'],'exitCode':c['exitCode'],'stdout':c['actualStdout']} for c in checks]}))

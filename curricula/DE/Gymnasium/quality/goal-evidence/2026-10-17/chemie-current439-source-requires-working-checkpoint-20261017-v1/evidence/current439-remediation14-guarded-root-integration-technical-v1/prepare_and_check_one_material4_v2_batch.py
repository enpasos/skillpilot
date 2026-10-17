from pathlib import Path
import datetime,hashlib,json,os,subprocess,time
O=Path(__file__).resolve().parent;K=O/'capsule'
p=O/'PREPARATION.current4-v2-inputs.json'
while not p.exists():
 raise RuntimeError('Exact current4 inputs must finish before prepare')
h=json.loads(p.read_text());checks=[]
for mode in ['prepare','check']:
 argv=['node','--preserve-symlinks','--preserve-symlinks-main','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs',str(K/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),mode,'--config',h['configRelativePath']]
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();result=subprocess.run(argv,cwd=K,text=True,capture_output=True,check=False,env=dict(os.environ,TSX_DISABLE_CACHE='1',NO_COLOR='1'))
 for stream,text in [('stdout',result.stdout),('stderr',result.stderr)]:
  out=O/f'STOCK.native4-v2.{mode}.{stream}.txt';assert not out.exists();out.write_text(text)
 execution={'mode':mode,'argv':argv,'cwd':str(K),'startedAtUTC':started,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':time.monotonic()-t,'exitCode':result.returncode,'actualStdout':result.stdout,'actualStderr':result.stderr}
 out=O/f'STOCK.native4-v2.{mode}.execution.json';assert not out.exists();out.write_text(json.dumps(execution,indent=2)+'\n');checks.append(execution)
 assert result.returncode==0,result.stderr
for expected in h['sourceGuards']:
 raw=Path(expected['path']).read_bytes();assert hashlib.sha256(raw).hexdigest()==expected['sha256'] and len(raw)==expected['bytes'],expected['path']
out=O/'CHECK.one-bounded-native4-v2-prepare-and-stock-check.json';assert not out.exists();out.write_text(json.dumps({'role':'One bounded current4 native prepare/check; no full central or full439 publication','checks':checks,'sourceGuardsUnchanged':True,'frozen14Unchanged':True,'newScientificDecisions':False,'humanApproval':False},indent=2)+'\n');print(json.dumps({'checks':[{'mode':c['mode'],'exitCode':c['exitCode'],'stdout':c['actualStdout']} for c in checks]}))

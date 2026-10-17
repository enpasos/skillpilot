from pathlib import Path
import datetime,hashlib,json,os,subprocess
O=Path(__file__).resolve().parent;K=O/'capsule';h=json.loads((O/'HANDOFF.exact-current-AM-P-prospective-integration.json').read_text())
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def run(label,script,args):
 argv=['node','--preserve-symlinks','--preserve-symlinks-main','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs',str(K/'app/scripts'/script),*args]
 r=subprocess.run(argv,cwd=K/'app',text=True,capture_output=True,check=False,env=dict(os.environ,TSX_DISABLE_CACHE='1',NO_COLOR='1'))
 pins={}
 for key,data in [('stdout',r.stdout),('stderr',r.stderr)]:
  p=O/f'STOCK.{label}.{key}.txt';assert not p.exists();p.write_text(data);pins[key]=pin(p)
 out={'label':label,'argv':argv,'cwd':str(K/'app'),'exitCode':r.returncode,'actualStdout':r.stdout,'actualStderr':r.stderr,**pins}
 p=O/f'STOCK.{label}.execution.json';assert not p.exists();p.write_text(json.dumps(out,indent=2)+'\n')
 assert r.returncode==0,(label,r.stderr,r.stdout)
 return out
checks=[]
checks.append(run('QA.chemie-stock-metadata-generate','generateGoalVisualizationQaLedgers.ts',['--subjects=chemie']))
qa=K/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json';before=json.loads(Path(h['sourceVQADraft']['path']).read_text());after=json.loads(qa.read_text());bp={r['goalId']:r for r in before['records']};ap={r['goalId']:r for r in after['records']}
ids={r['goalId'] for r in h['Achanges'] for _ in []} if False else set(json.loads((O.parent/'current439-remediation14-author-assembly-technical-v1/PLAN.author14.exact-prospective-change-map.json').read_text())['descriptionGoalIds'])
changes=[]
assert set(bp)==set(ap)
for gid in bp:
 fields=[k for k in set(bp[gid])|set(ap[gid]) if bp[gid].get(k)!=ap[gid].get(k)]
 if fields:
  assert gid in ids and set(fields)<= {'title','description'},(gid,fields)
  changes.append({'goalId':gid,'stockGeneratedFields':fields})
assert len(changes)==4
checks.append(run('QA.chemie-stock-metadata-check','generateGoalVisualizationQaLedgers.ts',['--subjects=chemie','--check']))
for n,ref in enumerate(h['stockChecksToRun']['A']['changedConfigPaths'],1):checks.append(run(f'A.changed-{n:02d}','semanticAtomicityReview.ts',[f'--config={ref}','--mode=check']))
checks.append(run('M.current439-actual4','memoryCardReview.ts',[f"--config={h['stockChecksToRun']['M']['configPath']}",'--mode=check']))
for expected in h['sourceGuards']:assert pin(expected['path'])==expected,expected['path']
result={'role':'Actual scoped stock A/M and Chemistry QA checks; no full central run','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'QAStockMetadataChangesOnly':changes,'QAStandard':pin(qa),'sourceGuardsUnchanged':True,'humanApproval':False,'fullCentralRun':False}
p=O/'CHECK.actual-A-M-QA-stock-lanes.json';assert not p.exists();p.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'checkCount':len(checks),'allExitZero':True,'qaChanges':changes,'QA':pin(qa),'receipt':pin(p)}))

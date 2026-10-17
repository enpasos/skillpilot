from pathlib import Path
import json,hashlib,os,subprocess,datetime,time

O=Path(__file__).parent
C=O/'capsule'
ready=json.loads((O/'PREPARATION.ready-for-exactly-one-model-run.json').read_text())
start=O/'EXECUTION.exactly-one-full439-model.started.json'
assert not start.exists(), 'A model invocation was already started; inspect its handle/receipt without restarting.'
H=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
    p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':H(b),'bytes':len(b)}
conf=C/ready['goalBookConfigRelative']
out=C/ready['modelRelative']
assert not out.exists()
assert (C/'app/scripts/buildGoalBookModel.ts').read_bytes()==Path('/home/enpasos/projects/skillpilot/app/scripts/buildGoalBookModel.ts').read_bytes()
assert (C/'app/scripts/goalBookModel.ts').read_bytes()==Path('/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts').read_bytes()
argv=['node','--preserve-symlinks','--preserve-symlinks-main','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs','app/scripts/buildGoalBookModel.ts',ready['goalBookConfigRelative']]
env=os.environ.copy();(O/'cache').mkdir(exist_ok=True)
env['TMPDIR']=str(O/'cache');env['TSX_DISABLE_CACHE']='1'
stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
with start.open('x') as f:json.dump({'startedAtUTC':stamp,'argv':argv,'cwd':str(C),'config':pin(conf),'stockEntry':pin(C/'app/scripts/buildGoalBookModel.ts'),'stockModelHelper':pin(C/'app/scripts/goalBookModel.ts'),'tsxLoader':pin('/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs'),'nodeVersion':subprocess.check_output(['node','--version'],text=True).strip(),'newVotes':0,'NativeOrCentralInvoked':False,'restartOnObservationTimeout':False},f,ensure_ascii=False,indent=2);f.write('\n')
beg=time.monotonic()
with (O/'model.stock.stdout.txt').open('xb') as so,(O/'model.stock.stderr.txt').open('xb') as se:
    p=subprocess.Popen(argv,cwd=C,env=env,stdout=so,stderr=se)
    print(json.dumps({'modelPID':p.pid,'startReceipt':str(start),'outputPath':str(out),'observationTimeoutIsNotCancellation':True}),flush=True)
    code=p.wait()
result={'exitCode':code,'elapsedSeconds':time.monotonic()-beg,'argv':argv,'cwd':str(C),'startedAtUTC':stamp,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stdout':pin(O/'model.stock.stdout.txt'),'stderr':pin(O/'model.stock.stderr.txt'),'modelInvocationCount':1,'NativeOrCentralInvoked':False,'M7':False,'HumanApproval':False}
if code==0:
    model=json.loads(out.read_text());config=json.loads(conf.read_text())
    sem=json.loads((C/config['semanticKindLedgerPath']).read_text())
    atomic={x['goalId'] for x in sem['decisions'] if x['semanticKind']=='curricularAtomic'}
    ids=[x['goalId'] for x in model['pages']]
    assert len(ids)==len(set(ids))==len(atomic)==439 and set(ids)==atomic
    result.update({'model':pin(out),'actualPageCount':len(ids),'actualDistinctGoalCount':len(set(ids)),'exactCurrentCurricularAtomic439IDSet':True,'modelDigest':model['digest'],'modelTopLevelKeys':list(model),'modelPageKeys':list(model['pages'][0]),'current439GoalIds':sorted(ids),'actualStockLoaderBuiltModel':True,'semanticKindLedger':pin(C/config['semanticKindLedgerPath']),'exactWholeP439':pin(C/config['evidenceReviewPaths'][0])})
with (O/'EXECUTION.exactly-one-full439-model.completed.json').open('x') as f:json.dump(result,f,ensure_ascii=False,indent=2);f.write('\n')
print(json.dumps(result if code else {k:v for k,v in result.items() if k!='current439GoalIds'},ensure_ascii=False),flush=True)
raise SystemExit(code)

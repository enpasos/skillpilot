import pathlib,json,subprocess,time,datetime,hashlib
W=pathlib.Path('/dev/shm/math-matrix-d-resolution-20261107');R=pathlib.Path('/home/enpasos/projects/skillpilot');base=json.loads((W/'bwrap-prefix.json').read_bytes());before=json.loads((W/'frozen-inputs-before.json').read_bytes());runs=[]
for name,args in [('three-current-indices',[str(W/'check-current-indices.mts')]),('existing-dual-round-controls',['app/scripts/testGoalDescriptionDualRoundResolution.ts']),('existing-supersession-controls',['app/scripts/testDeepUnderstandingSupersessionChains.ts'])]:
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
 with (W/(name+'.stdout.txt')).open('wb')as out,(W/(name+'.stderr.txt')).open('wb')as err:run=subprocess.run(base+args,stdout=out,stderr=err)
 row={'name':name,'argv':base+args,'actualStartedAt':start,'actualCompletedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'seconds':time.monotonic()-t,'exitCode':run.returncode};runs.append(row);(W/'check-execution.json').write_text(json.dumps(runs,indent=2)+'\n');print(json.dumps({k:v for k,v in row.items()if k!='argv'}),flush=True)
 assert all(hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()==h for p,h in before.items())
 if run.returncode:raise SystemExit(run.returncode)
print('THREE_CHECKS_COMPLETE',flush=True)

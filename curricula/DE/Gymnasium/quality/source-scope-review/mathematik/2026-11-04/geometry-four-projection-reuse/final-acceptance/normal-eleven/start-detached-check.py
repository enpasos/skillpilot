from pathlib import Path
import subprocess,json,sys,datetime
H=Path(__file__).resolve().parent;P=H/'final-bound-checks/execution.json';v=json.loads(P.read_text());attempts=[r for r in v['commands']if r['name']=='goalbook-model'];assert len(attempts)==2 and attempts[-1]['attempt']==2 and attempts[-1]['exitCode']==143
with(H/'detached-goalbook-runner.stdout.txt').open('wb')as out,(H/'detached-goalbook-runner.stderr.txt').open('wb')as err:
 cmd=[sys.executable,str(H/'run-normal-checks.py'),'goalbook-model'];p=subprocess.Popen(cmd,cwd=H,stdin=subprocess.DEVNULL,stdout=out,stderr=err,start_new_session=True,close_fds=True)
r={'status':'DETACHED_ONLY_OPEN_GOALBOOK_ATTEMPT3_STARTED','pid':p.pid,'argv':cmd,'cwd':str(H),'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'newSession':True,'stdin':'DEVNULL','stdout':'detached-goalbook-runner.stdout.txt','stderr':'detached-goalbook-runner.stderr.txt','terminalReceipt':'final-bound-checks/execution.json','otherPassedChecksNotRepeated':True};(H/'detached-goalbook-start.actual.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps(r))

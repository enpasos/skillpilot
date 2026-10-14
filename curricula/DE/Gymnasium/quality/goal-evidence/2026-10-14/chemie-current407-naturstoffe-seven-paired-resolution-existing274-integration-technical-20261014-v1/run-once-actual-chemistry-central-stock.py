# Apache-2.0. One normal central Chemistry check; retain actual stdout, stderr, completion.
import datetime,hashlib,json,pathlib,subprocess
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent;H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host';rel=str(O.relative_to(R));(O/'receipts').mkdir(exist_ok=True)
out=O/'receipts/ACTUAL.current407-N7-existing274-central.stdout.txt';err=O/'receipts/ACTUAL.current407-N7-existing274-central.stderr.txt';completion=O/'receipts/ACTUAL.current407-N7-existing274-central.completed-run.json'
assert not out.exists() and not completion.exists(),'Single central attempt already exists; retain it, never overwrite.'
command=[str(R/'app/node_modules/.bin/tsx'),'app/scripts/reportDeepUnderstandingRollout.ts','--config='+rel+'/config/chemie-current407-N7-existing274.inactive.config.json','--mode=check','--format=json']
started=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(command,cwd=H,text=True,capture_output=True);out.write_text(p.stdout);err.write_text(p.stderr)
def bind(x):return {'path':str(x.relative_to(R)),'bytes':x.stat().st_size,'sha256':'sha256:'+hashlib.sha256(x.read_bytes()).hexdigest()}
report=None;parseError=None
try:report=json.loads(p.stdout)
except Exception as e:parseError=str(e)
reportPath=None
if report is not None:
 reportPath=O/'receipts/ACTUAL.current407-N7-existing274-central.stock-report.json';reportPath.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
receipt={'schemaVersion':1,'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':command,'cwd':str(H),'exitCode':p.returncode,'stockCentralRunsInThisIntegration':1,'stdout':bind(out),'stderr':bind(err),'fullStockReport':bind(reportPath) if reportPath else None,'stdoutJsonParseError':parseError,'newScientificVotes':0,'activeWrites':False}
completion.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
if report:
 s=report['subjects'][0];print(json.dumps({'exitCode':p.returncode,'strictComplete':s['strictComplete'],'denominator':s['denominator'],'blockingIssueCount':report['blockingIssueCount'],'requiredChecks':s['requiredChecks'],'issues':s['issues']},ensure_ascii=False),flush=True)
else:print(json.dumps({'exitCode':p.returncode,'parseError':parseError,'stderr':p.stderr,'stdout':p.stdout[:2000]},ensure_ascii=False),flush=True)
raise SystemExit(p.returncode)

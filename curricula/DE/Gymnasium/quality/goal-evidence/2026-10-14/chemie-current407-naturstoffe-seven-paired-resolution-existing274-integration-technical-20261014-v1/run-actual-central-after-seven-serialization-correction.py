# Apache-2.0. Necessary second actual receipt after one proven seven-field serialization defect.
import datetime,hashlib,json,pathlib,subprocess
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path(__file__).parent;H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host';rel=str(O.relative_to(R));read=lambda p:json.loads(p.read_text())
first=read(O/'receipts/ACTUAL.current407-N7-existing274-central.completed-run.json');narrow=read(O/'checks/STOCK.seven-existing-V-approval-YesNo-serialization-and-freshness.actual.json')
assert first['exitCode']==1 and narrow['exitCode']==0 and len(narrow['exactSevenApprovalSerializationDeltas'])==7
out=O/'receipts/CORRECTED.current407-N7-existing274-central.stdout.txt';err=O/'receipts/CORRECTED.current407-N7-existing274-central.stderr.txt';receipt=O/'receipts/CORRECTED.current407-N7-existing274-central.completed-run.json';assert not out.exists() and not receipt.exists()
command=[str(R/'app/node_modules/.bin/tsx'),'app/scripts/reportDeepUnderstandingRollout.ts','--config='+rel+'/config/chemie-current407-N7-existing274.inactive.config.json','--mode=check','--format=json']
started=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(command,cwd=H,text=True,capture_output=True);out.write_text(p.stdout);err.write_text(p.stderr)
def bind(x):return {'path':str(x.relative_to(R)),'bytes':x.stat().st_size,'sha256':'sha256:'+hashlib.sha256(x.read_bytes()).hexdigest()}
report=None;parseError=None
try:report=json.loads(p.stdout)
except Exception as e:parseError=str(e)
reportPath=None
if report is not None:
 reportPath=O/'receipts/CORRECTED.current407-N7-existing274-central.stock-report.json';reportPath.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
receipt.write_text(json.dumps({'schemaVersion':1,'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':command,'cwd':str(H),'exitCode':p.returncode,
 'necessaryRetryReason':'The initial complete run passed five stock checks and exposed raw boolean approval serialization. All seven actual V approvals were serialized to stock yes/no; exact narrow freshness check now PASS. No science/threshold/status or other412 QA record changed.',
 'preservedInitialFailedCompleteReceipt':bind(O/'receipts/ACTUAL.current407-N7-existing274-central.completed-run.json'),'exactNarrowCorrectionReceipt':bind(O/'checks/STOCK.seven-existing-V-approval-YesNo-serialization-and-freshness.actual.json'),
 'stdout':bind(out),'stderr':bind(err),'fullStockReport':bind(reportPath) if reportPath else None,'stdoutJsonParseError':parseError,'totalCompleteCentralAttempts':2,'newScienceVotes':0,'activeWrites':False},ensure_ascii=False,indent=2)+'\n')
if report:
 s=report['subjects'][0];print(json.dumps({'exitCode':p.returncode,'strictComplete':s['strictComplete'],'denominator':s['denominator'],'blockingIssueCount':report['blockingIssueCount'],'requiredChecks':s['requiredChecks'],'issues':s['issues']},ensure_ascii=False),flush=True)
else:print(json.dumps({'exitCode':p.returncode,'parseError':parseError,'stderr':p.stderr,'stdout':p.stdout[:2000]},ensure_ascii=False),flush=True)
raise SystemExit(p.returncode)

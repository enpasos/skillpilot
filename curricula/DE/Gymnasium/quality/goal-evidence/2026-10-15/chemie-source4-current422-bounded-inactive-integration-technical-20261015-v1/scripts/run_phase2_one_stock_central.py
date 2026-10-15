# SPDX-License-Identifier: Apache-2.0
"""Execute exactly the one root-authorized unchanged stock central report."""
import datetime,subprocess,time
from phase2_exact_cas import *
ready=OWN/'phase2/READY.exact-current-source4-inputs-before-one-Central.actual.json';r=load(ready)
assert r['ROOTREADY'] and r['allowedCentralRuns']==1 and r['actualCentralRunsBefore']==0
cfg=verify(r['centralConfig']);mp=load(OWN/'phase2/REBUILD.final-current-source4.reference-only-assets.physical-map.json');host=REPO/mp['executionHost']
started=OWN/'phase2/CENTRAL.once.started.actual.json';assert not started.exists()
argv=[str(REPO/'app/node_modules/.bin/tsx'),str(host/'app/scripts/reportDeepUnderstandingRollout.ts'),'--config='+cfg.relative_to(REPO).as_posix(),'--format=json']
start=datetime.datetime.now(datetime.timezone.utc).isoformat();put(started,{'startedAtUTC':start,'argv':argv,'cwd':mp['executionHost'],'readyCAS':ref(ready),'allowedRuns':1,'repeatAuthorized':False})
t=time.monotonic();p=subprocess.run(argv,cwd=host,capture_output=True)
out=OWN/'phase2/CENTRAL.current422.source4.stock-report.actual.json';err=OWN/'phase2/CENTRAL.current422.source4.stderr.actual.txt';out.write_bytes(p.stdout);err.write_bytes(p.stderr)
receipt={'role':'One actual unchanged stock central; no active integration or new science vote','argv':argv,'cwd':mp['executionHost'],'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'stdout':ref(out),'stderr':ref(err),'actualCentralRuns':1,'repeatAuthorized':False,'nativeBuilds':0,'activeWrites':0}
put(OWN/'phase2/CENTRAL.current422.source4.command.actual.json',receipt)
print(json.dumps(receipt))
if p.returncode:raise SystemExit(p.stdout.decode()+p.stderr.decode())
q=load(out);s=q['subjects'][0];print(json.dumps({'strictComplete':s['strictComplete'],'remaining':s['remaining'],'denominator':s['denominator'],'gates':s['gates'],'requiredChecks':s['requiredChecks'],'issues':s['issues'],'blockingIssueCount':q['blockingIssueCount']}))

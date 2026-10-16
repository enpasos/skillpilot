# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,datetime,subprocess,time
repo=Path.cwd();R=Path(__file__).resolve().parents[1];load=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();rel=lambda p:str(p.relative_to(repo))
readyPath=R/'checks/READY.actual-final-D4-V4-and-one-central-authorization.json';ready=load(readyPath);assert ready['allowedFullCentralRuns']==1 and ready['D4SixCommandsAndIndependentPortableCheckPass'] and ready['actualGenuineVMetadataRowsExact']==6
cfg=repo/ready['finalCentralConfig']['path'];assert sha(cfg)==ready['finalCentralConfig']['sha256'];m=load(R/'checks/REBUILD.energy18-final.physical-exact-map.v3.json');host=repo/m['executionHost'];assert m['fullCentralAllowed'] and not m['pendingD4V4']
for row in m['stockPhysicalModules']:assert sha(host/row['path'])==row['sha256']
out=R/'checks/CENTRAL.current422.energy18.stock-report.actual.json';err=R/'checks/CENTRAL.current422.energy18.stderr.actual.txt';receipt=R/'checks/CENTRAL.exactly-one-final.command.actual.json';startMarker=R/'checks/CENTRAL.exactly-one.started-marker.json'
assert not any(p.exists() for p in [out,err,receipt,startMarker]),'Exactly one full central run; preserve any previous result'
argv=[str(repo/'app/node_modules/.bin/tsx'),str(host/'app/scripts/reportDeepUnderstandingRollout.ts'),'--config='+rel(cfg),'--format=json'];start=datetime.datetime.now(datetime.timezone.utc).isoformat();startMarker.write_text(json.dumps({'argv':argv,'cwd':rel(host),'startedAtUTC':start,'authorizationDigest':sha(readyPath),'actualFullCentralRunNumber':1,'maxAuthorizedRuns':1},indent=2)+'\n');t=time.monotonic()
with out.open('wb') as o,err.open('wb') as e:p=subprocess.run(argv,cwd=host,stdout=o,stderr=e)
x={'argv':argv,'cwd':rel(host),'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'actualFullCentralRunCountThisPacket':1,'unmodifiedStockFullCentral':True,'stdoutJsonPath':rel(out),'stdoutSha256':sha(out),'stderrRawPath':rel(err),'stderrSha256':sha(err),'authorizationPath':rel(readyPath),'authorizationDigest':sha(readyPath),'newScientificVotes':0,'activeIntegration':False,'M7Grant':False};receipt.write_text(json.dumps(x,indent=2)+'\n');print(json.dumps(x),flush=True)
try:
 d=load(out);s=d['subjects'][0];print(json.dumps({k:s[k] for k in ['denominator','strictComplete','gates','requiredChecks','strictCompletionReady','issues']},ensure_ascii=False),flush=True)
except Exception as e:print('Actual central output not a report:',type(e).__name__,str(e),flush=True);raise
if p.returncode:raise SystemExit(p.returncode)
assert len(s['requiredChecks'])==6 and all(c['status']=='pass' for c in s['requiredChecks']) and not s['issues']

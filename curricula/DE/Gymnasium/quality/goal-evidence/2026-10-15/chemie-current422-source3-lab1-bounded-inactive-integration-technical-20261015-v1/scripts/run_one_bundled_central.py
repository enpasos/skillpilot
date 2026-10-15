# SPDX-License-Identifier: Apache-2.0
"""One complete unchanged-stock measurement after all sealed inputs are bound."""
import hashlib,json,subprocess,time
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-integration.seal.json').exists()
assert json.loads((OWN/'checks/CHECK.technical-input-merge-before-central.actual.json').read_text())['pass']
host=ROOT/json.loads((OWN/'checks/REBUILD.current422-final.alias50-selected431.physical-map.json').read_text())['executionHost']
out=OWN/'checks/CENTRAL.current422.stock-report.actual.json';err=OWN/'checks/CENTRAL.current422.stderr.actual.txt'
assert not out.exists() and not err.exists(),'Never overwrite a measurement attempt'
cmd=[str(ROOT/'app/node_modules/.bin/tsx'),str(host/'app/scripts/reportDeepUnderstandingRollout.ts'),'--config='+REL+'/config/central.current422.source3-lab1.final.inactive.config.json','--format=json']
start=datetime.now(timezone.utc).isoformat();t=time.monotonic()
with out.open('w') as o,err.open('w') as e:r=subprocess.run(cmd,cwd=host,stdout=o,stderr=e)
receipt={'argv':cmd,'cwd':host.relative_to(ROOT).as_posix(),'startedAtUTC':start,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':r.returncode,'unmodifiedStockFullCentral':True,'firstBundledAttempt':True,'stdoutJsonPath':out.relative_to(ROOT).as_posix(),'stdoutSha256':'sha256:'+hashlib.sha256(out.read_bytes()).hexdigest(),'stderrRawPath':err.relative_to(ROOT).as_posix(),'stderrSha256':'sha256:'+hashlib.sha256(err.read_bytes()).hexdigest(),'newScienceVotes':0,'activeIntegration':False}
(OWN/'checks/CENTRAL.command.actual.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt),flush=True)
if out.stat().st_size:
 try:
  d=json.loads(out.read_text());s=d['subjects'][0];print(json.dumps({k:s[k] for k in ['denominator','strictComplete','gates','requiredChecks','strictCompletionReady','issues']},ensure_ascii=False),flush=True)
 except Exception as exc:print(str(exc),flush=True)
if r.returncode:print(err.read_text()[-3500:]);raise SystemExit(r.returncode)

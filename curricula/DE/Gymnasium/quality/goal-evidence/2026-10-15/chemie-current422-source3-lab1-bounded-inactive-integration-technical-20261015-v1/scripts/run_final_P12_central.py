# SPDX-License-Identifier: Apache-2.0
"""Actual final Stock measurement with explicit original P12 selection; no new science."""
import hashlib,json,subprocess,time
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-integration.seal.json').exists()
host=ROOT/json.loads((OWN/'checks/REBUILD.current422-final-P12.alias50-selected431.physical-map.json').read_text())['executionHost']
cfg=REL+'/config/central.current422.source3-lab1.final-P12.inactive.config.json'
out=OWN/'checks/CENTRAL.current422.final-P12.stock-report.actual.json';err=OWN/'checks/CENTRAL.current422.final-P12.stderr.actual.txt'
assert not out.exists() and not err.exists()
cmd=[str(ROOT/'app/node_modules/.bin/tsx'),str(host/'app/scripts/reportDeepUnderstandingRollout.ts'),'--config='+cfg,'--format=json']
start=datetime.now(timezone.utc).isoformat();t=time.monotonic()
with out.open('w') as o,err.open('w') as e:r=subprocess.run(cmd,cwd=host,stdout=o,stderr=e)
receipt={'argv':cmd,'cwd':host.relative_to(ROOT).as_posix(),'startedAtUTC':start,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':r.returncode,'unmodifiedStockFullCentral':True,'technicalRepairAndExplicitOriginalE1SelectionOfPreservedEarlierAttempts':True,'stdoutJsonPath':out.relative_to(ROOT).as_posix(),'stdoutSha256':'sha256:'+hashlib.sha256(out.read_bytes()).hexdigest(),'stderrRawPath':err.relative_to(ROOT).as_posix(),'stderrSha256':'sha256:'+hashlib.sha256(err.read_bytes()).hexdigest(),'newScienceVotes':0,'activeIntegration':False}
(OWN/'checks/CENTRAL.final-P12.command.actual.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt),flush=True)
d=json.loads(out.read_text());s=d['subjects'][0];print(json.dumps({k:s[k] for k in ['denominator','strictComplete','gates','requiredChecks','strictCompletionReady','issues']},ensure_ascii=False),flush=True)
assert r.returncode==0 and all(c['status']=='pass' for c in s['requiredChecks']) and not s['issues']

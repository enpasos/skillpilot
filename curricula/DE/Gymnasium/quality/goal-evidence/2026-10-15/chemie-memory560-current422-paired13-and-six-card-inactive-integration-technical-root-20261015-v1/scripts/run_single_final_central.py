# SPDX-License-Identifier: Apache-2.0
"""Exactly one final bundled unchanged stock central report, after targeted checks."""
import datetime,hashlib,json,subprocess,time
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-integration.seal.json').exists()
assert json.loads((OWN/'checks/CHECK.final-inputs-before-single-central.actual.json').read_text())['pass']
HOST=ROOT/json.loads((OWN/'checks/REBUILD.memory560-native13.physical-exact-map.json').read_text())['executionHost']
CFG=REL+'/config/central.current422.memory560-genuine13-inactive.config.json'
out=OWN/'checks/CENTRAL.current422.memory560-native13-six-cards.stock-report.actual.json';err=OWN/'checks/CENTRAL.current422.memory560-native13-six-cards.stderr.actual.txt'
assert not out.exists() and not err.exists()
argv=[str(ROOT/'app/node_modules/.bin/tsx'),str(HOST/'app/scripts/reportDeepUnderstandingRollout.ts'),'--config='+CFG,'--format=json']
start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
with out.open('wb') as o,err.open('wb') as e:p=subprocess.run(argv,cwd=HOST,stdout=o,stderr=e)
receipt={'argv':argv,'cwd':HOST.relative_to(ROOT).as_posix(),'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'actualFullCentralRunCountThisPacket':1,'unmodifiedStockFullCentral':True,'stdoutJsonPath':out.relative_to(ROOT).as_posix(),'stdoutSha256':'sha256:'+hashlib.sha256(out.read_bytes()).hexdigest(),'stderrRawPath':err.relative_to(ROOT).as_posix(),'stderrSha256':'sha256:'+hashlib.sha256(err.read_bytes()).hexdigest(),'newScientificVotes':0,'activeIntegration':False}
(OWN/'checks/CENTRAL.single-final.command.actual.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt),flush=True)
d=json.loads(out.read_text());s=d['subjects'][0];print(json.dumps({k:s[k] for k in ['denominator','strictComplete','gates','requiredChecks','strictCompletionReady','issues']},ensure_ascii=False),flush=True)
assert p.returncode==0 and len(s['requiredChecks'])==6 and all(r['status']=='pass' for r in s['requiredChecks']) and not s['issues']

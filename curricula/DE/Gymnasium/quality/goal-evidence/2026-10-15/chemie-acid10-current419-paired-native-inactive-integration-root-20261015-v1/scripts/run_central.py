# SPDX-License-Identifier: Apache-2.0
"""Measure the frozen inactive candidate with unmodified stock checks."""
import subprocess,json,time
from datetime import datetime,timezone
from pathlib import Path
root=Path.cwd();own=Path(__file__).resolve().parents[1];host=root/'tmp/chemie-m7-resumed-20261015/acid10-current419-integration-host'
assert not (own/'FILES.finite-integration.seal.json').exists(), 'Never write a sealed packet'
cmd=[str(root/'app/node_modules/.bin/tsx'),str(host/'app/scripts/reportDeepUnderstandingRollout.ts'),'--config='+str(own.relative_to(root)/'config/central.current419.P10-A7-D3.final.inactive.config.json'),'--format=json']
start=datetime.now(timezone.utc).isoformat();t=time.monotonic();out=own/'checks/CENTRAL.current419-P10-A7-D3.stock-report.actual.json';err=own/'checks/CENTRAL.current419-P10-A7-D3.stderr.txt'
assert not out.exists() and not err.exists()
with out.open('w') as f,err.open('w') as e:r=subprocess.run(cmd,cwd=host,stdout=f,stderr=e)
receipt={'command':cmd,'startedAtUTC':start,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':r.returncode,'stockEngineUnmodified':True,'inactiveCandidate':True}
(own/'checks/CENTRAL.command.actual.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt),flush=True)
if r.returncode:print(err.read_text()[-2500:]);raise SystemExit(r.returncode)
d=json.loads(out.read_text());s=d['subjects'][0];print(json.dumps({k:s[k] for k in ['denominator','strictComplete','percentage','gates','requiredChecks','strictCompletionReady','issues']},ensure_ascii=False),flush=True)
assert all(x['status']=='pass' for x in s['requiredChecks']) and not s['issues']

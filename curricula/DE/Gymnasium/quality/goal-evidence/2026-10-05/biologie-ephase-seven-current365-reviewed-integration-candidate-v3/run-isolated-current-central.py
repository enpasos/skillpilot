#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,shutil,subprocess
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT);ISO=ROOT/'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert not (OWN/'future-biologie-central.terminal.receipt.json').exists()
for p in OWN.rglob('*'):
 if p.is_file():
  dest=ISO/p.relative_to(ROOT);dest.parent.mkdir(parents=True,exist_ok=True);assert dest.parent.resolve().is_relative_to(ISO.resolve()) and not dest.is_symlink()
  if not dest.exists()or sha(dest)!=sha(p):shutil.copy2(p,dest)
start=datetime.now(timezone.utc).isoformat();cmd=['app/node_modules/.bin/tsx','app/scripts/reportDeepUnderstandingRollout.ts','--config='+str(REL/'central-biologie-future.config.json'),'--mode=check','--format=json'];p=subprocess.run(cmd,cwd=ISO,capture_output=True)
out=OWN/'future-biologie-central.report.json';err=OWN/'future-biologie-central.stderr.txt';out.write_bytes(p.stdout);err.write_bytes(p.stderr)
receipt={'command':cmd,'cwd':str(ISO),'startedAtUTC':start,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'actualExitCode':p.returncode,'reportPath':str(out.relative_to(ROOT)),'reportSHA256':sha(out),'stderrPath':str(err.relative_to(ROOT)),'stderrSHA256':sha(err),'activeWrites':0,'humanApproval':False,'humanTrial':False};(OWN/'future-biologie-central.terminal.receipt.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt));print(p.stderr.decode()[:3000])
if p.returncode==0:
 s=json.loads(p.stdout)['subjects'][0];print(json.dumps({k:s[k]for k in ['subject','strictComplete','denominator','gates','issues','requiredChecks']}))
raise SystemExit(p.returncode)

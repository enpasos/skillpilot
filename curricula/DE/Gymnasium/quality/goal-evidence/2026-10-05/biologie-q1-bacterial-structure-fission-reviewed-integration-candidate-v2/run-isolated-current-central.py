#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime,timezone
import argparse,hashlib,json,shutil,subprocess
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT)
ISO=ROOT/'tmp/biologie-q1-bacterial-structure-fission-native-isolated-20261005-v1'
parser=argparse.ArgumentParser();parser.add_argument('--name',default='future-biologie-central');args=parser.parse_args()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for p in OWN.rglob('*'):
    if p.is_file():
        dest=ISO/p.relative_to(ROOT);dest.parent.mkdir(parents=True,exist_ok=True)
        if not dest.exists() or sha(dest)!=sha(p):shutil.copy2(p,dest)
start=datetime.now(timezone.utc).isoformat();cmd=['app/node_modules/.bin/tsx','app/scripts/reportDeepUnderstandingRollout.ts',f'--config={REL}/central-biologie-future.config.json','--mode=check','--format=json'];p=subprocess.run(cmd,cwd=ISO,capture_output=True);end=datetime.now(timezone.utc).isoformat()
out=OWN/(args.name+'.report.json');err=OWN/(args.name+'.stderr.txt');out.write_bytes(p.stdout);err.write_bytes(p.stderr)
receipt={'command':cmd,'cwd':str(ISO),'startedAtUTC':start,'completedAtUTC':end,'actualExitCode':p.returncode,'reportPath':str(out.relative_to(ROOT)),'reportSHA256':sha(out),'stderrPath':str(err.relative_to(ROOT)),'stderrSHA256':sha(err),'activeWrites':0,'humanApproval':False,'humanTrial':False}
(OWN/(args.name+'.terminal.receipt.json')).write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt),flush=True)
if p.stdout:
    try:
        report=json.loads(p.stdout);print(json.dumps([{k:s[k] for k in ['subject','strictComplete','denominator','percentage','gates','issues','requiredChecks']} for s in report['subjects']],ensure_ascii=False),flush=True)
    except ValueError:print(p.stdout.decode()[:2000])
print(p.stderr.decode()[:3000]);raise SystemExit(p.returncode)

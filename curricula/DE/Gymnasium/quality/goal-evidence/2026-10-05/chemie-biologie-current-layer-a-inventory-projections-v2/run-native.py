#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Capture actual bounded native measurements; never mutate active inputs."""
from pathlib import Path
from datetime import datetime,timezone
import sys,hashlib,json,subprocess
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
step,label=sys.argv[1:];assert label and all(c.islower() or c.isdigit() or c=='-' for c in label)
commands={'emit':['node','scripts/check_ai_transparency_inventory.mjs','--emit-layer-a-patch'],'inventory-check':['node','scripts/check_ai_transparency_inventory.mjs'],'projection':['app/node_modules/.bin/tsx',str(OWN/'measure-projection-targets.mts'),label]}
command=commands[step];assert not (OWN/(label+'.receipt.json')).exists()
started=datetime.now(timezone.utc).isoformat();process=subprocess.run(command,cwd=ROOT,capture_output=True)
out=OWN/(label+'.stdout.txt');err=OWN/(label+'.stderr.txt');out.write_bytes(process.stdout);err.write_bytes(process.stderr)
(OWN/(label+'.receipt.json')).write_text(json.dumps({'command':command,'cwd':str(ROOT),'startedAtUTC':started,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'actualExitCode':process.returncode,'stdoutPath':str(out.relative_to(ROOT)),'stdoutSHA256':sha(out),'stderrPath':str(err.relative_to(ROOT)),'stderrSHA256':sha(err),'checkerSourceSHA256':sha(ROOT/'scripts/check_ai_transparency_inventory.mjs'),'humanApproval':False,'backendTestsRun':False,'activeWritesByRunner':0},indent=2)+'\n')
print(json.dumps({'step':step,'label':label,'actualExitCode':process.returncode,'stdoutBytes':out.stat().st_size,'stderr':process.stderr.decode()[:2400]}));sys.exit(process.returncode)

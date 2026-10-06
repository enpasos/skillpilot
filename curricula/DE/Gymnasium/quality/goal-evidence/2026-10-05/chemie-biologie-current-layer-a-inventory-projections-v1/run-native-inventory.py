#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Retain actual inventory checker output; this runner never mutates active data."""
from pathlib import Path
from datetime import datetime,timezone
import sys,hashlib,json,subprocess
ROOT=Path.cwd().resolve();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();step=sys.argv[1];commands={'emit-measured-patch':['node','scripts/check_ai_transparency_inventory.mjs','--emit-layer-a-patch'],'current-inventory-check':['node','scripts/check_ai_transparency_inventory.mjs']}
assert step in commands and not (OWN/(step+'.actual.receipt.json')).exists()
t=datetime.now(timezone.utc).isoformat();p=subprocess.run(commands[step],cwd=ROOT,capture_output=True);o=OWN/(step+'.stdout.txt');e=OWN/(step+'.stderr.txt');o.write_bytes(p.stdout);e.write_bytes(p.stderr)
(OWN/(step+'.actual.receipt.json')).write_text(json.dumps({'command':commands[step],'cwd':str(ROOT),'startedAtUTC':t,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'actualExitCode':p.returncode,'stdoutPath':str(o.relative_to(ROOT)),'stdoutSHA256':sha(o),'stderrPath':str(e.relative_to(ROOT)),'stderrSHA256':sha(e),'checkerSourceSHA256':sha(ROOT/'scripts/check_ai_transparency_inventory.mjs'),'humanApproval':False,'runtimeOrJavaWrites':0,'activeWritesByRunner':0},indent=2)+'\n');print(json.dumps({'step':step,'actualExitCode':p.returncode,'stdoutBytes':o.stat().st_size,'stderr':p.stderr.decode()[:1800]}));raise SystemExit(p.returncode)

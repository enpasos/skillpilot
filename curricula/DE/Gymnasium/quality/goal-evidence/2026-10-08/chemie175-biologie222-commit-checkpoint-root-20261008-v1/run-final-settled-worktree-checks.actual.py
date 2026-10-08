# SPDX-License-Identifier: Apache-2.0
"""Capture the ordinary stable-chem175-bio222 dependent checks and measured Layer-A refresh."""
from pathlib import Path
import concurrent.futures
import datetime
import hashlib
import json
import subprocess
import sys
import time

ROOT=Path.cwd();OUT=Path(__file__).resolve().parent
CANON=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
EXPECTED='4ba55e4eccaf1892d4f541a0ef20eb0402170b1c6f2543e05ce7b00e30fa30a5'
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(n,x):
 p=OUT/n
 with p.open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
 return p
def run(label,argv):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
 print('START '+label,flush=True)
 r=subprocess.run(argv,cwd=ROOT,capture_output=True,text=True)
 for k,v in [('stdout',r.stdout),('stderr',r.stderr)]:
  with (OUT/(label+'.'+k+'.actual.txt')).open('x') as f:f.write(v)
 write(label+'.terminal.actual.json',{'argv':argv,'startedAtUTC':start,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':r.returncode,'elapsedSeconds':time.monotonic()-t,'stdout':bind(OUT/(label+'.stdout.actual.txt')),'stderr':bind(OUT/(label+'.stderr.actual.txt')),'actualStableBiologyCanonicalSha256':bind(CANON)['sha256'],'humanApproval':False})
 print('END '+label+' actualExitCode='+str(r.returncode),flush=True)
 return r
assert bind(CANON)['sha256']==EXPECTED

assert run('final-settled-worktree-full-validate-schemas',['python','scripts/validate_schemas.py']).returncode==0
assert run('final-settled-worktree-committable-symlinks',['python','-c',"import sys,json;sys.path.insert(0,'scripts');import validate_schemas;e=validate_schemas.curriculum_symlink_errors();print(json.dumps({'errorCount':len(e),'errors':e}));sys.exit(bool(e))"]).returncode==0
assert run('final-settled-worktree-diff-check',['git','diff','--check']).returncode==0

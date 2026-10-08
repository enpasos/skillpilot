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

# Previous two session handles missing; ps confirmed no schema/build process remains.
# Preserve completed original checks, rerun only the actually interrupted schema/build commands.
def build_and_verify():
 r=run('stable-full-application-build-resumed-after-confirmed-interruption',['npm','--prefix','app','run','build:application'])
 if r.returncode==0:
  return run('built-local-ai-transparency-artifact-resumed',['node','scripts/verify_ai_transparency_artifact.mjs','backend/src/main/resources/static']).returncode
 return r.returncode
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 schema=pool.submit(run,'full-validate-schemas-resumed-after-confirmed-interruption',['python','scripts/validate_schemas.py'])
 build=pool.submit(build_and_verify)
 results=[schema.result().returncode,build.result()]
write('resumed-actual-terminal-summary.json',{'actualExitCodes':results,'allPassed':all(x==0 for x in results),'scope':'Only actually interrupted schema/build plus dependent deployed-local inventory artifact; existing completed checks unchanged.','humanApproval':False,'productionDeployment':False})
assert all(x==0 for x in results),results

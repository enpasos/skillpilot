# SPDX-License-Identifier: Apache-2.0
"""Run affected native engineering checks and retain every actual terminal."""
from pathlib import Path
import datetime, hashlib, json, subprocess, time

R=Path.cwd(); D=Path(__file__).resolve().parent
def write(p,o):
 p.parent.mkdir(parents=True,exist_ok=True)
 b=o if isinstance(o,bytes) else (json.dumps(o,ensure_ascii=False,indent=2)+'\n').encode()
 with p.open('xb')as f:f.write(b)
def run(name,argv):
 start=time.monotonic();result=subprocess.run(argv,cwd=R,capture_output=True)
 stdout=D/f'checks/{name}.stdout.actual.txt';stderr=D/f'checks/{name}.stderr.actual.txt'
 write(stdout,result.stdout);write(stderr,result.stderr)
 terminal={'check':name,'actualCommand':argv,'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':result.returncode,'elapsedSeconds':time.monotonic()-start,'stdoutPath':str(stdout.relative_to(R)),'stderrPath':str(stderr.relative_to(R)),'activeWrites':0,'approvalInferred':False}
 write(D/f'checks/{name}.terminal.actual.json',terminal)
 print(json.dumps(terminal),flush=True)
 if result.returncode:raise SystemExit(result.returncode)
run('native-current-full392-four-raster-author',['node','app/node_modules/tsx/dist/cli.mjs',str((D/'materialize-current-four-native-author.mts').relative_to(R))])
run('current-A392-retained-plus-genuine-A2',['npm','--prefix','app','run','quality:semantic-atomicity:check','--','--config='+str((D/'candidate/A.current392.inactive.config.json').relative_to(R))])
run('current-M392-retained-plus-genuine-M2',['npm','--prefix','app','run','quality:memory-card-review:check','--','--config='+str((D/'candidate/M.current392.inactive.config.json').relative_to(R))])
run('current-position-only-original-D-subset-proof',['node','app/node_modules/tsx/dist/cli.mjs',str((D/'trace-current-position-only-historical-D-bindings.technical.mts').relative_to(R))])
pages=D/'native-raster-candidate/four/actual-physical-pages';pages.mkdir(parents=True,exist_ok=True)
run('native-four-whole-physical-pages',['pdftoppm','-f','3','-l','6','-scale-to','1400','-png',str(D/'native-raster-candidate/four/bundle/book.pdf'),str(pages/'actual-physical-page')])
print(json.dumps({'actualAffectedNativeChecks':5,'allActualExitCodes':0,'nativeFourAuthorNotApproval':True,'activeWrites':0,'strictGainClaimed':0}),flush=True)

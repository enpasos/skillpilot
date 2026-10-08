# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import datetime
import hashlib
import json
import signal
import subprocess
import sys
import time

ROOT=Path.cwd();OUT=Path(__file__).resolve().parent
CANON=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
assert hashlib.sha256(CANON.read_bytes()).hexdigest()=='82e0a67ecd7a1b765336349b66eb60279f91ea67a169c8667a08c93e5d68137d'
def write(n,x):
 with (OUT/n).open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
write('initial-full-build-shell-interruption.actual.json',{'observedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'unifiedExecSessionId':59674,'actualShellExitCode':143,'underlyingBuildCompletionObserved':False,'originalCaptureOutputRunnerTerminatedBeforeWritingResult':True,'actualSubsequentProcessCheckNoRemainingBuildOrChromium':True,'actualAvailableMemoryGiBAtInspection':24,'causeEstablished':False,'successClaimed':False,'humanApproval':False})
argv=['npm','--prefix','app','run','build:application'];label='stable204-full-application-build-persistent-retry'
started=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
stdout=OUT/(label+'.stdout.actual.txt');stderr=OUT/(label+'.stderr.actual.txt')
with stdout.open('x') as o,stderr.open('x') as e:
 p=subprocess.Popen(argv,cwd=ROOT,stdout=o,stderr=e)
 write(label+'.started.actual.json',{'argv':argv,'startedAtUTC':started,'pid':p.pid,'onlyOwnChildProcess':True,'completed':False,'successClaimed':False})
 def interrupted(sig,frame):
  p.terminate()
  try:rc=p.wait(timeout=20)
  except subprocess.TimeoutExpired:rc=None
  write(label+'.interruption.actual.json',{'actualSignal':sig,'childReturnCode':rc,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':time.monotonic()-t,'stdout':str(stdout.relative_to(ROOT)),'stderr':str(stderr.relative_to(ROOT)),'underlyingBuildSuccessClaimed':False})
  sys.exit(128+sig)
 signal.signal(signal.SIGTERM,interrupted)
 rc=p.wait()
write(label+'.terminal.actual.json',{'argv':argv,'startedAtUTC':started,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualExitCode':rc,'elapsedSeconds':time.monotonic()-t,'stdout':str(stdout.relative_to(ROOT)),'stderr':str(stderr.relative_to(ROOT)),'canonicalSha256':hashlib.sha256(CANON.read_bytes()).hexdigest(),'humanApproval':False})
print(json.dumps({'buildActualExitCode':rc,'elapsedSeconds':time.monotonic()-t}),flush=True)
assert rc==0
argv=['node','scripts/verify_ai_transparency_artifact.mjs','backend/src/main/resources/static'];label='stable204-built-local-ai-transparency-artifact'
r=subprocess.run(argv,cwd=ROOT,capture_output=True,text=True)
for k,v in [('stdout',r.stdout),('stderr',r.stderr)]:
 with (OUT/(label+'.'+k+'.actual.txt')).open('x') as f:f.write(v)
write(label+'.terminal.actual.json',{'argv':argv,'actualExitCode':r.returncode,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'humanApproval':False})
print(json.dumps({'builtArtifactActualExitCode':r.returncode}),flush=True)
assert r.returncode==0

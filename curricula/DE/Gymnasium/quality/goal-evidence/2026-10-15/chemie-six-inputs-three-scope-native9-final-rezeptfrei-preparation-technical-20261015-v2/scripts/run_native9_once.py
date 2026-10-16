# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import sys,json,time,subprocess,hashlib
R=Path.cwd();O=Path(__file__).resolve().parents[1];mode=sys.argv[1];assert mode in ['prepare','check'];mp=json.loads((O/'checks/REBUILD.native9.final-actual-V2.physical-map.json').read_text());H=R/mp['executionHost'];receipt=O/('checks/NATIVE.'+mode+'.actual.json');assert not receipt.exists(),'This exact stock mode must run only once'
if mode=='prepare':assert not(O/'native-nine').exists()
else:assert json.loads((O/'checks/NATIVE.prepare.actual.json').read_text())['exitCode']==0
cmd=['node',str(R/'app/node_modules/tsx/dist/cli.mjs'),str(H/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),mode,'--config',str((O/'config/native9.normal-prepare-only.config.json').relative_to(R))];assert '--write'not in cmd
start=time.monotonic();run=subprocess.run(cmd,cwd=H,capture_output=True,text=True);duration=time.monotonic()-start
stdout=O/('checks/NATIVE.'+mode+'.stdout.actual.txt');stderr=O/('checks/NATIVE.'+mode+'.stderr.actual.txt');stdout.write_text(run.stdout);stderr.write_text(run.stderr)
data={'role':'Actual unchanged stock native9 command, no review votes','mode':mode,'command':cmd,'cwd':str(H.relative_to(R)),'exitCode':run.returncode,'durationSeconds':round(duration,3),'writeFlagUsed':False,'stdoutPath':str(stdout.relative_to(R)),'stderrPath':str(stderr.relative_to(R)),'finalPhysicalMapSha256':'sha256:'+hashlib.sha256((O/'checks/REBUILD.native9.final-actual-V2.physical-map.json').read_bytes()).hexdigest(),'newScienceVotes':0}
receipt.write_text(json.dumps(data,indent=2)+'\n');print(json.dumps(data));print(run.stdout[-2500:]);print(run.stderr[-2500:]if run.stderr else'')
raise SystemExit(run.returncode)

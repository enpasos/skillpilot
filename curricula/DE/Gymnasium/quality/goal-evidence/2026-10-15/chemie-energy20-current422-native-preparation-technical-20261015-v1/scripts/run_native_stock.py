# SPDX-License-Identifier: Apache-2.0
"""Only normal twenty-goal prepare/check; blank campaigns, no scientific review."""
import hashlib,json,subprocess,time
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-native-preparation.seal.json').exists()
mapping=json.loads((OWN/'checks/REBUILD.current422-native560.physical-map.json').read_text());host=ROOT/mapping['executionHost'];receipts=[]
for mode in ['prepare','check']:
 cmd=[str(ROOT/'app/node_modules/.bin/tsx'),str(host/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),mode,'--config',REL+'/config/native20.normal-prepare-only.config.json']
 start=datetime.now(timezone.utc).isoformat();t=time.monotonic();r=subprocess.run(cmd,cwd=host,capture_output=True,text=True)
 output=OWN/'checks'/('COMMAND.native20-stock-'+mode+'.actual.txt');output.write_text('argv: '+json.dumps(cmd)+'\ncwd: '+mapping['executionHost']+'\nexitCode: '+str(r.returncode)+'\nstdout:\n'+r.stdout+'\nstderr:\n'+r.stderr)
 receipts.append({'name':'native20-stock-'+mode,'argv':cmd,'cwd':mapping['executionHost'],'startedAtUTC':start,'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':r.returncode,'rawOutput':output.relative_to(ROOT).as_posix(),'rawOutputSha256':'sha256:'+hashlib.sha256(output.read_bytes()).hexdigest(),'newScientificVote':False})
 (OWN/'checks/COMMANDS.actual-native20-stock.json').write_text(json.dumps({'commands':receipts,'centralExecuted':False,'newVotes':0},indent=2)+'\n')
 print(json.dumps({'mode':mode,'exitCode':r.returncode,'elapsedSeconds':round(time.monotonic()-t,3),'stdout':r.stdout,'stderr':r.stderr[-4000:]}),flush=True)
 if r.returncode:raise SystemExit(r.returncode)

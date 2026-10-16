# SPDX-License-Identifier: Apache-2.0
"""Stock D2 prepare/check and existing A/M reuse eligibility only; no reviews or central."""
import hashlib,json,subprocess,time
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-native-preparation.seal.json').exists()
mapping=json.loads((OWN/'checks/REBUILD.current422-lab2-native.physical-map.json').read_text());host=ROOT/mapping['executionHost']
cmds=[('D2-stock-prepare','app/scripts/materializeGoalDescriptionRolloutBatch.ts',['prepare','--config',REL+'/config/native2.normal-prepare-only.config.json']),
 ('D2-stock-check','app/scripts/materializeGoalDescriptionRolloutBatch.ts',['check','--config',REL+'/config/native2.normal-prepare-only.config.json']),
 ('A2-original-reuse-check','app/scripts/semanticAtomicityReview.ts',['--config='+REL+'/config/A2.existing-eligibility-only.config.json','--mode=check']),
 ('M2-original-reuse-check','app/scripts/memoryCardReview.ts',['--config='+REL+'/config/M2.existing-eligibility-only.config.json','--mode=check'])]
receipts=[]
for name,module,args in cmds:
 cmd=[str(ROOT/'app/node_modules/.bin/tsx'),str(host/module),*args]
 start=datetime.now(timezone.utc).isoformat();t=time.monotonic();r=subprocess.run(cmd,cwd=host,capture_output=True,text=True)
 output=OWN/'checks'/('COMMAND.'+name+'.actual.txt');output.write_text('argv: '+json.dumps(cmd)+'\ncwd: '+mapping['executionHost']+'\nexitCode: '+str(r.returncode)+'\nstdout:\n'+r.stdout+'\nstderr:\n'+r.stderr)
 receipts.append({'name':name,'argv':cmd,'cwd':mapping['executionHost'],'startedAtUTC':start,'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':r.returncode,'rawOutput':output.relative_to(ROOT).as_posix(),'rawOutputSha256':'sha256:'+hashlib.sha256(output.read_bytes()).hexdigest(),'noNewScientificVote':True})
 (OWN/'checks/COMMANDS.actual-native-and-reuse.json').write_text(json.dumps({'commands':receipts,'centralExecuted':False,'newVotes':0},indent=2)+'\n')
 print(json.dumps({'name':name,'exitCode':r.returncode,'elapsedSeconds':round(time.monotonic()-t,3)}),flush=True)
 if r.returncode:print((r.stdout+r.stderr)[-4500:],flush=True);raise SystemExit(r.returncode)

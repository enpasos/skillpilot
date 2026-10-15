# SPDX-License-Identifier: Apache-2.0
"""One concrete QA host fix recheck, then previously unrun D9 steps once."""
import datetime,json,subprocess,time
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(REPO).as_posix()
MP=json.loads((OWN/'checks/REBUILD.current422.final-A-B2-C.discovery-exact.physical-map.json').read_text());HOST=REPO/MP['executionHost'];TSX=REPO/'app/node_modules/.bin/tsx'
cfg=REL+'/config/native9.original-A-blind-B2.pair-only.config.json'
commands=[('QA438-fixed-exact358-discovery','generateGoalVisualizationQaLedgers.ts',['--check','--subject=chemie']),
 ('D9-native-check','materializeGoalDescriptionRolloutBatch.ts',['check','--config',cfg]),
 ('D9-native-summarize','materializeGoalDescriptionRolloutBatch.ts',['summarize','--config',cfg,'--write']),
 ('D9-native-synthesis','materializeGoalDescriptionRolloutSynthesisManifest.ts',['--config',cfg,'--authoring',REL+'/native9/synthesis-authoring.json','--write']),
 ('D9-native-resolutions','materializeGoalDescriptionRolloutResolutions.ts',['--config',cfg,'--synthesis-manifest',REL+'/native9/synthesis-decisions.json','--write']),
 ('D9-native-finalize','materializeGoalDescriptionRolloutBatch.ts',['finalize','--config',cfg,'--write']),
 ('D9-native-final-check','materializeGoalDescriptionRolloutBatch.ts',['check','--config',cfg])]
for name,script,args in commands:
 receipt=OWN/'checks'/f'PREFLIGHT.{name}.command.actual.json';assert not receipt.exists(),receipt
 argv=[str(TSX),str(HOST/'app/scripts'/script),*args];start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();p=subprocess.run(argv,cwd=HOST,capture_output=True)
 out=OWN/'checks'/f'PREFLIGHT.{name}.stdout.actual.txt';err=OWN/'checks'/f'PREFLIGHT.{name}.stderr.actual.txt';out.write_bytes(p.stdout);err.write_bytes(p.stderr)
 r={'role':'Actual unchanged stock targeted step; no central','name':name,'argv':argv,'cwd':MP['executionHost'],'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'stdoutPath':out.relative_to(REPO).as_posix(),'stderrPath':err.relative_to(REPO).as_posix(),'newScientificVotes':0,'centralRuns':0}
 receipt.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({'step':name,'exitCode':p.returncode}),flush=True)
 if p.returncode:raise SystemExit(p.stderr.decode()+p.stdout.decode())

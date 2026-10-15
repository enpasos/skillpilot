# SPDX-License-Identifier: Apache-2.0
"""Omit an invalid empty optional array; preserve nine genuine decisions exactly."""
import datetime,hashlib,json,subprocess,time
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(REPO).as_posix()
mp=json.loads((OWN/'checks/REBUILD.current422.final-A-B2-C.discovery-exact.physical-map.json').read_text());host=REPO/mp['executionHost'];tsx=REPO/'app/node_modules/.bin/tsx'
source=OWN/'native9/synthesis-authoring.json';a=json.loads(source.read_text());assert a['deferredGoals']==[]
del a['deferredGoals'];dest=OWN/'native9/synthesis-authoring.omit-empty-optional-deferrals.json';assert not dest.exists();dest.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n')
cfg=REL+'/config/native9.original-A-blind-B2.pair-only.config.json'
commands=[('D9-native-synthesis-fixed-optional-array','materializeGoalDescriptionRolloutSynthesisManifest.ts',['--config',cfg,'--authoring',dest.relative_to(REPO).as_posix(),'--write']),
 ('D9-native-resolutions','materializeGoalDescriptionRolloutResolutions.ts',['--config',cfg,'--synthesis-manifest',REL+'/native9/synthesis-decisions.json','--write']),
 ('D9-native-finalize','materializeGoalDescriptionRolloutBatch.ts',['finalize','--config',cfg,'--write']),
 ('D9-native-final-check','materializeGoalDescriptionRolloutBatch.ts',['check','--config',cfg])]
for name,script,args in commands:
 receipt=OWN/'checks'/f'PREFLIGHT.{name}.command.actual.json';assert not receipt.exists()
 argv=[str(tsx),str(host/'app/scripts'/script),*args];start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();p=subprocess.run(argv,cwd=host,capture_output=True)
 out=OWN/'checks'/f'PREFLIGHT.{name}.stdout.actual.txt';err=OWN/'checks'/f'PREFLIGHT.{name}.stderr.actual.txt';out.write_bytes(p.stdout);err.write_bytes(p.stderr)
 receipt.write_text(json.dumps({'role':'Actual unchanged stock targeted step; optional-array technical correction only','name':name,'argv':argv,'cwd':mp['executionHost'],'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'stdoutPath':out.relative_to(REPO).as_posix(),'stderrPath':err.relative_to(REPO).as_posix(),'newScienceVotes':0,'centralRuns':0},indent=2)+'\n')
 print(json.dumps({'step':name,'exitCode':p.returncode}),flush=True)
 if p.returncode:raise SystemExit(p.stderr.decode()+p.stdout.decode())

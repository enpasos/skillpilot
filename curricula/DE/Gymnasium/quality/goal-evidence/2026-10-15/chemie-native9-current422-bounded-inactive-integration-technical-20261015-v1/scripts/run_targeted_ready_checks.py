# SPDX-License-Identifier: Apache-2.0
"""Run each ready affected stock check/pairing step once; no central here."""
import datetime,json,subprocess,time
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(REPO).as_posix()
MP=json.loads((OWN/'checks/REBUILD.current422.final-A-B2-C.physical-map.json').read_text())
HOST=REPO/MP['executionHost'];TSX=REPO/'app/node_modules/.bin/tsx'
commands=[]
for kind,script in [('P','positiveGoalEvidenceReview.ts'),('A','semanticAtomicityReview.ts')]:
 for p in sorted((OWN/'config').glob(kind+'*-*.config.json')):
  commands.append((p.stem,script,['--config='+p.relative_to(REPO).as_posix(),'--mode=check']))
csel=json.loads((OWN/'checks/SELECTION.final-C-exact-P2-A2-M422-QA438.json').read_text())
commands.append(('M422-final-C-ten-scopes','memoryCardReview.ts',['--config='+csel['finalM422Config']['path'],'--mode=check']))
commands.append(('QA438-final-C-original-order','generateGoalVisualizationQaLedgers.ts',['--check','--subject=chemie']))
cfg=REL+'/config/native9.original-A-blind-B2.pair-only.config.json'
commands += [
 ('D9-native-check','materializeGoalDescriptionRolloutBatch.ts',['check','--config',cfg]),
 ('D9-native-summarize','materializeGoalDescriptionRolloutBatch.ts',['summarize','--config',cfg,'--write']),
 ('D9-native-synthesis','materializeGoalDescriptionRolloutSynthesisManifest.ts',['--config',cfg,'--authoring',REL+'/native9/synthesis-authoring.json','--write']),
 ('D9-native-resolutions','materializeGoalDescriptionRolloutResolutions.ts',['--config',cfg,'--synthesis-manifest',REL+'/native9/synthesis-decisions.json','--write']),
 ('D9-native-finalize','materializeGoalDescriptionRolloutBatch.ts',['finalize','--config',cfg,'--write']),
 ('D9-native-final-check','materializeGoalDescriptionRolloutBatch.ts',['check','--config',cfg])]
assert len(commands)==16,len(commands)
receipts=[]
for name,script,args in commands:
 receipt=OWN/'checks'/f'PREFLIGHT.{name}.command.actual.json';assert not receipt.exists(),receipt
 argv=[str(TSX),str(HOST/'app/scripts'/script),*args]
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();p=subprocess.run(argv,cwd=HOST,capture_output=True)
 out=OWN/'checks'/f'PREFLIGHT.{name}.stdout.actual.txt';err=OWN/'checks'/f'PREFLIGHT.{name}.stderr.actual.txt';out.write_bytes(p.stdout);err.write_bytes(p.stderr)
 r={'role':'Actual unchanged stock ready step; technical integration only','name':name,'argv':argv,'cwd':MP['executionHost'],'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'stdoutPath':out.relative_to(REPO).as_posix(),'stderrPath':err.relative_to(REPO).as_posix(),'newScientificVotes':0,'centralRuns':0}
 receipt.write_text(json.dumps(r,indent=2)+'\n');receipts.append(r)
 print(json.dumps({'step':name,'exitCode':p.returncode}),flush=True)
 if p.returncode:raise SystemExit(p.stderr.decode()+p.stdout.decode())
(OWN/'checks/PREFLIGHT.all-affected-PA-residuals-finalC-D9-pair.actual.json').write_text(json.dumps({'role':'Actual16 affected ready steps, no central','results':receipts,'allExit0':True,'centralRuns':0,'newScienceVotes':0},indent=2)+'\n')

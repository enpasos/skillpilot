# SPDX-License-Identifier: Apache-2.0
"""Execute the unchanged native six-command pairing pipeline with real clocks."""
import datetime,json,subprocess
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-four-contexts-paired-native-technical.seal.json').exists()
HOST=ROOT/'tmp/chemie-four-paired-portable-20261015-host-v1'
CFG=REL+'/config/native4.frozen560-paired.config.json'
TSX=ROOT/'app/node_modules/.bin/tsx'
commands=[('native-check', 'materializeGoalDescriptionRolloutBatch.ts',['check','--config',CFG]),
 ('native-summarize','materializeGoalDescriptionRolloutBatch.ts',['summarize','--config',CFG,'--write']),
 ('native-synthesis','materializeGoalDescriptionRolloutSynthesisManifest.ts',['--config',CFG,'--authoring',REL+'/native-four/synthesis-authoring.stock-bounded.json','--write']),
 ('native-resolutions','materializeGoalDescriptionRolloutResolutions.ts',['--config',CFG,'--synthesis-manifest',REL+'/native-four/synthesis-decisions.json','--write']),
 ('native-finalize','materializeGoalDescriptionRolloutBatch.ts',['finalize','--config',CFG,'--write']),
 ('native-final-check','materializeGoalDescriptionRolloutBatch.ts',['check','--config',CFG])]
receipts=[]
for name,script,args in commands:
 argv=[str(TSX),str(HOST/'app/scripts'/script),*args];start=datetime.datetime.now(datetime.timezone.utc).isoformat()
 p=subprocess.run(argv,cwd=HOST,capture_output=True);end=datetime.datetime.now(datetime.timezone.utc).isoformat()
 (OWN/'checks'/f'{name}.stdout.actual.txt').write_bytes(p.stdout);(OWN/'checks'/f'{name}.stderr.actual.txt').write_bytes(p.stderr)
 receipt={'role':'Actual unchanged stock command; informed technical integration only','argv':argv,'cwd':HOST.relative_to(ROOT).as_posix(),'startedAtUTC':start,'completedAtUTC':end,'exitCode':p.returncode,'newScientificVotes':0}
 (OWN/'checks'/f'{name}.command.actual.json').write_text(json.dumps(receipt,indent=2)+'\n');receipts.append(receipt)
 print(json.dumps({'step':name,'exitCode':p.returncode}),flush=True)
 if p.returncode:raise SystemExit(p.stderr.decode()+p.stdout.decode())
manifest=json.loads((OWN/'native-four/synthesis-decisions.json').read_text())
runs=[json.loads(p.read_text()) for p in (OWN/'native-four').glob('round-*/results/*.run.json')]
latest=max(datetime.datetime.fromisoformat(r['completedAt'].replace('Z','+00:00')) for r in runs)
actual=datetime.datetime.fromisoformat(manifest['synthesizedAt'].replace('Z','+00:00'))
assert abs((actual-latest).total_seconds()-1)<0.001
(OWN/'checks/native4.actual-clock-and-logical-synthesis-time.json').write_text(json.dumps({'role':'Logical reproducibility timestamp is distinct from actual execution clock','originalRunCompletedAt':[r['completedAt'] for r in runs],'stockSynthesizedAt':manifest['synthesizedAt'],'rule':'maximum genuine original run.completedAt +1000ms','actualSynthesisCommand':receipts[2],'newScientificVotes':0},indent=2)+'\n')

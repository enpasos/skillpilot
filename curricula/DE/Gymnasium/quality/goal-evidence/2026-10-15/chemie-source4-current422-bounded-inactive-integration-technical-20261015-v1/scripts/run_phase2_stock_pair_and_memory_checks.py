# SPDX-License-Identifier: Apache-2.0
"""Execute each ready stock pairing step and final selected memory check once."""
import datetime,hashlib,json,subprocess,time
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(REPO).as_posix();mp=json.loads((OWN/'checks/REBUILD.phase1.final-current-aliases.reference-only-assets.physical-map.json').read_text());host=REPO/mp['executionHost'];s=json.loads((OWN/'candidate/PREPARED.exact-current422-selection.awaiting-genuine-B-and-ROOTREADY.json').read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
cfg=REL+'/phase2/config/native4.original-A-B.pair-only.config.json'
commands=[('D4-check-original-pair','materializeGoalDescriptionRolloutBatch.ts',['check','--config',cfg]),('D4-summarize','materializeGoalDescriptionRolloutBatch.ts',['summarize','--config',cfg,'--write']),('D4-synthesis','materializeGoalDescriptionRolloutSynthesisManifest.ts',['--config',cfg,'--authoring',REL+'/phase2/native-four/synthesis-authoring.json','--write']),('D4-resolutions','materializeGoalDescriptionRolloutResolutions.ts',['--config',cfg,'--synthesis-manifest',REL+'/phase2/native-four/synthesis-decisions.json','--write']),('D4-finalize','materializeGoalDescriptionRolloutBatch.ts',['finalize','--config',cfg,'--write']),('D4-final-check','materializeGoalDescriptionRolloutBatch.ts',['check','--config',cfg]),('M422-current-C-ten-scopes','memoryCardReview.ts',['--config='+s['memoryReviewConfigPath'],'--mode=check'])]
for name,script,args in commands:
 receipt=OWN/'phase2'/f'{name}.command.actual.json';assert not receipt.exists()
 argv=[str(REPO/'app/node_modules/.bin/tsx'),str(host/'app/scripts'/script),*args];start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();p=subprocess.run(argv,cwd=host,capture_output=True)
 out=OWN/'phase2'/f'{name}.stdout.actual.txt';err=OWN/'phase2'/f'{name}.stderr.actual.txt';out.write_bytes(p.stdout);err.write_bytes(p.stderr)
 receipt.write_text(json.dumps({'role':'Actual unchanged stock technical pairing/resource check; no new science vote','name':name,'argv':argv,'cwd':mp['executionHost'],'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'stdout':ref(out),'stderr':ref(err),'nativeRenders':0,'centralRuns':0},indent=2)+'\n');print(json.dumps({'step':name,'exitCode':p.returncode}),flush=True)
 if p.returncode:raise SystemExit(p.stdout.decode()+p.stderr.decode())

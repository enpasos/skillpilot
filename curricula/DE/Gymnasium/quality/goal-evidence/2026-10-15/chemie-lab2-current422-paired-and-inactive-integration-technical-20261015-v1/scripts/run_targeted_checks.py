# SPDX-License-Identifier: Apache-2.0
"""Only targeted normal P2, QA freshness and exact data merge checks."""
import datetime,json,subprocess
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-integration.seal.json').exists()
HOST=ROOT/'tmp/chemie-m7-resumed-20261015/lab2-and-carbonyl3-final-current422-host-v1';TSX=ROOT/'app/node_modules/.bin/tsx'
steps=[('P2-current-normal',HOST/'app/scripts/positiveGoalEvidenceReview.ts',['--config='+REL+'/config/P2.original-independent-a.normal-address.config.json','--mode=check'],HOST),('QA438-normal-freshness',HOST/'app/scripts/generateGoalVisualizationQaLedgers.ts',['--subjects=chemie','--check'],HOST),('exact-final-inputs',OWN/'scripts/check_final_inputs.mts',[],ROOT)]
for name,script,args,cwd in steps:
 argv=[str(TSX),str(script),*args];start=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(argv,cwd=cwd,capture_output=True);end=datetime.datetime.now(datetime.timezone.utc).isoformat()
 (OWN/'checks'/f'{name}.stdout.actual.txt').write_bytes(p.stdout);(OWN/'checks'/f'{name}.stderr.actual.txt').write_bytes(p.stderr)
 (OWN/'checks'/f'{name}.command.actual.json').write_text(json.dumps({'argv':argv,'cwd':cwd.relative_to(ROOT).as_posix() or '.','startedAtUTC':start,'completedAtUTC':end,'exitCode':p.returncode,'newVotes':0},indent=2)+'\n')
 print(json.dumps({'step':name,'exitCode':p.returncode}),flush=True)
 if p.returncode:raise SystemExit(p.stderr.decode()+p.stdout.decode())

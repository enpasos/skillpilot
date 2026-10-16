# SPDX-License-Identifier: Apache-2.0
"""One actual check for each changed P/A/residual config and current QA freshness."""
import datetime,hashlib,json,subprocess,time
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];mp=json.loads((OWN/'checks/REBUILD.phase1.final-current-aliases.reference-only-assets.physical-map.json').read_text());host=REPO/mp['executionHost']
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
commands=[]
for kind,script in [('P','positiveGoalEvidenceReview.ts'),('A','semanticAtomicityReview.ts')]:
 for cfg in sorted((OWN/'config').glob(kind+'*.config.json')):
  commands.append((cfg.stem,script,['--config='+cfg.relative_to(REPO).as_posix(),'--mode=check']))
commands.append(('QA438-current-C-exact-empty-legacy-discovery','generateGoalVisualizationQaLedgers.ts',['--check','--subject=chemie']))
assert len(commands)==5
receipts=[]
for name,script,args in commands:
 receipt=OWN/'checks'/f'PREFLIGHT.{name}.command.actual.json';assert not receipt.exists()
 argv=[str(REPO/'app/node_modules/.bin/tsx'),str(host/'app/scripts'/script),*args];start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();p=subprocess.run(argv,cwd=host,capture_output=True)
 out=OWN/'checks'/f'PREFLIGHT.{name}.stdout.actual.txt';err=OWN/'checks'/f'PREFLIGHT.{name}.stderr.actual.txt';out.write_bytes(p.stdout);err.write_bytes(p.stderr)
 row={'role':'Actual unchanged stock affected binding/freshness check; phase1 only','name':name,'argv':argv,'cwd':mp['executionHost'],'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'stdout':ref(out),'stderr':ref(err),'newScienceVotes':0,'newD4ResolutionChecks':0,'centralRuns':0,'ROOTREADY':False}
 receipt.write_text(json.dumps(row,indent=2)+'\n');receipts.append(row);print(json.dumps({'step':name,'exitCode':p.returncode}),flush=True)
 if p.returncode:raise SystemExit(p.stdout.decode()+p.stderr.decode())
(OWN/'checks/PREFLIGHT.phase1-five-affected-actual-checks.json').write_text(json.dumps({'role':'Actual limited phase1 checks, no D4/Central/Native execution','results':receipts,'allExit0':True,'BPending':True,'ROOTREADY':False,'centralRuns':0},indent=2)+'\n')

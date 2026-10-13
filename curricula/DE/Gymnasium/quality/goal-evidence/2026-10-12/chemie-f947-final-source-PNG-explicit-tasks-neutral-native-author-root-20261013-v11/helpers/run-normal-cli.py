# Apache-2.0. Captures actual normal CLI execution in an isolated private root.
from pathlib import Path
import datetime, hashlib, json, shutil, subprocess, sys
R=Path('/home/enpasos/projects/skillpilot')
N=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-f947-final-source-PNG-explicit-tasks-neutral-native-author-root-20261013-v11')
X=R/'tmp/chemie-f947-final-neutral-native-execution-20261013-v11'
kind=sys.argv[1];cfg=N/'configs'/({'P-materialize':'P1.author.inactive.config.json','P-check':'P1.author.inactive.config.json','M-check':'M402.original-retained.inactive.config.json','native-prepare':'native-D1.final-neutral.batch.config.json','native-check':'native-D1.final-neutral.batch.config.json'}[kind])
module={'P-materialize':'materializePositiveGoalEvidenceCandidates.ts','P-check':'positiveGoalEvidenceReview.ts','M-check':'memoryCardReview.ts','native-prepare':'materializeGoalDescriptionRolloutBatch.ts','native-check':'materializeGoalDescriptionRolloutBatch.ts'}[kind]
argv=['app/node_modules/.bin/tsx','app/scripts/'+module]
if kind=='P-materialize':argv+=['--config',str(cfg),'--candidates',str(N/'positive/P1.complete-demands.author-candidate-set.unbound.json'),'--write']
elif kind.startswith('native-'):argv+=[kind.removeprefix('native-'),'--config',str(cfg)]
else:argv+=['--config='+str(cfg),'--mode=check']
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
label=kind+('.'+sys.argv[2] if len(sys.argv)>2 else '');base=R/N/'checks'/label;assert not Path(str(base)+'.actual.json').exists()
for path in [X/N,X/N/'configs',X/'curricula/DE/Gymnasium/quality',X/'curricula/DE/Gymnasium/quality/goal-book-publication']:
 cur=X
 for part in path.relative_to(X).parts:
  cur=cur/part;assert cur.is_dir() and not cur.is_symlink(),cur
assert sha(R/'app/scripts'/module)==sha(X/'app/scripts'/module)
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
with open(str(base)+'.stdout.txt','wb') as out,open(str(base)+'.stderr.txt','wb') as err:
 result=subprocess.run(argv,cwd=X,stdout=out,stderr=err)
receipt={'schemaVersion':1,'argv':argv,'cwd':str(X.relative_to(R)),'startedAtUTC':started,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':result.returncode,'configPath':str(cfg),'configSha256':sha(R/cfg),'productionModuleSha256':sha(R/'app/scripts'/module),'executedModuleSha256':sha(X/'app/scripts'/module),'stdoutSha256':sha(Path(str(base)+'.stdout.txt')),'stderrSha256':sha(Path(str(base)+'.stderr.txt')),'allMutableOutputParentChainsPrivate':True,'activeWrites':False,'newIndependentScientificVotes':0,'humanApproval':False}
Path(str(base)+'.actual.json').write_text(json.dumps(receipt,indent=2)+'\n')
if result.returncode==0:
 if kind=='P-materialize':
  path=N/'positive/P1.final-complete-demands.author.normal.jsonl';assert not (R/path).exists();shutil.copyfile(X/path,R/path)
 if kind=='native-prepare':
  assert not (R/N/'native-D1').exists();shutil.copytree(X/N/'native-D1',R/N/'native-D1',symlinks=False)
 if kind=='M-check':
  path=N/'checks/M402.normal.report.md'
  if (X/path).exists():shutil.copyfile(X/path,R/path)
print(json.dumps({'kind':kind,'exitCode':result.returncode,'receipt':str(Path(str(base)+'.actual.json').relative_to(R))}))
print(Path(str(base)+'.stdout.txt').read_text()[-2500:]);print(Path(str(base)+'.stderr.txt').read_text()[-3500:])
sys.exit(result.returncode)

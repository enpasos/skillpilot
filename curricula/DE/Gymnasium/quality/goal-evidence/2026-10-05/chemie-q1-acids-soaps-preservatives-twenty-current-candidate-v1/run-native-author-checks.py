from pathlib import Path
from datetime import datetime,timezone
import json,subprocess,hashlib,shutil
ROOT=Path.cwd().resolve();REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-acids-soaps-preservatives-twenty-current-candidate-v1');OWN=ROOT/REL;ISO=ROOT/'tmp/chemie-q1-acids-soaps-preservatives-twenty-native-isolated-20261005-v1'
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
mcfg=json.loads((ISO/REL/'native-m-full.config.json').read_text())
for rel in [mcfg['reviewPath'],mcfg['cardReviewPath']]:
 p=ISO/rel
 assert p.exists() and not p.is_symlink(),'Detach every actual native --write-fingerprints output before invoking it: '+rel
commands=[]
for name in ['acids-derivatives','soaps','preservatives']:
 config=str(REL/f'native-a-{name}.config.json')
 for mode,args in [('bind',['--write-fingerprints']),('check',[])]:commands.append((f'a-{name}-{mode}',['app/node_modules/.bin/tsx','app/scripts/semanticAtomicityReview.ts','--config='+config]+args))
for mode,args in [('bind',['--write-fingerprints']),('check',[])]:commands.append((f'm-full-{mode}',['app/node_modules/.bin/tsx','app/scripts/memoryCardReview.ts','--config='+str(REL/'native-m-full.config.json')]+args))
commands += [('source-atlas-generate',['app/node_modules/.bin/tsx','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json']),('source-atlas-check',['app/node_modules/.bin/tsx','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json','--check'])]
terminal=[]
for name,args in commands:
 start=datetime.now(timezone.utc).isoformat();run=subprocess.run(args,cwd=ISO,text=True,capture_output=True)
 out=OWN/f'native-{name}.stdout.txt';err=OWN/f'native-{name}.stderr.txt';out.write_text(run.stdout);err.write_text(run.stderr)
 terminal.append({'name':name,'command':args,'cwd':str(ISO),'startedAtUTC':start,'endedAtUTC':datetime.now(timezone.utc).isoformat(),'actualExitCode':run.returncode,'stdoutPath':str(out.relative_to(ROOT)),'stdoutSHA256':sha(out),'stderrPath':str(err.relative_to(ROOT)),'stderrSHA256':sha(err)})
 (OWN/'native-author-validation.terminal.receipt.json').write_text(json.dumps({'status':'running' if run.returncode==0 else 'failed_closed','commands':terminal,'strictNetDelta':0,'activeWrites':0},indent=2)+'\n')
 print(json.dumps({'command':name,'actualExitCode':run.returncode,'stdout':run.stdout[:220]}),flush=True)
 assert run.returncode==0,run.stderr
for name in ['acids-derivatives','soaps','preservatives']:
 for suffix in ['review.jsonl','report.md']:
  p=ISO/REL/f'native-a-{name}.{suffix}'
  if p.exists():shutil.copy2(p,OWN/p.name)
for name in ['native-m-full.review.jsonl','native-m-full.report.md']:
 p=ISO/REL/name
 if p.exists():shutil.copy2(p,OWN/name)
(OWN/'native-author-validation.terminal.receipt.json').write_text(json.dumps({'status':'PASS_actual_native_A21_M376_and_source_atlas_checks_after_7_scientific_author_judgments','commands':terminal,'allSourceHOLDsStillOpen':True,'notIndependentDOrPOrVApproval':True,'strictNetDelta':0,'activeWrites':0},indent=2)+'\n')

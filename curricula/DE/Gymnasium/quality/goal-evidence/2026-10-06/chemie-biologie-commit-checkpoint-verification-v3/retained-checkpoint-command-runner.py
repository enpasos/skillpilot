import subprocess,json,hashlib,datetime
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
root=Path('/home/enpasos/projects/skillpilot')
out=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-biologie-commit-checkpoint-verification-v3'
commands={
 'docs-links':['npm','--prefix','app','run','check:docs-links'],
 'docs-indexes':['npm','--prefix','app','run','check:docs-indexes'],
 'affected-regression':['app/node_modules/.bin/tsx','--test','app/scripts/sourceCoverageAndApplicabilityRegression.test.ts'],
 'git-diff-check':['git','diff','--check']}
def run(item):
 name,argv=item;r=subprocess.run(argv,cwd=root,capture_output=True,text=True)
 for stream in ['stdout','stderr']:(out/f'{name}.actual.{stream}.txt').write_text(getattr(r,stream))
 receipt={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'argv':argv,'exitCode':r.returncode,'stdout':f'{name}.actual.stdout.txt','stderr':f'{name}.actual.stderr.txt','stdoutSha256':hashlib.sha256(r.stdout.encode()).hexdigest(),'stderrSha256':hashlib.sha256(r.stderr.encode()).hexdigest(),'claimScope':'named affected checkpoint check only; no new complete M7 or host acceptance'}
 (out/f'{name}.actual.receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
 return {'check':name,'exitCode':r.returncode,'actualStdoutTail':r.stdout[-1400:],'actualStderrTail':r.stderr[-800:]}
with ThreadPoolExecutor(max_workers=4) as pool:
 results=list(pool.map(run,commands.items()))
print(json.dumps(results,ensure_ascii=False,indent=2));assert all(x['exitCode']==0 for x in results)

from pathlib import Path
import subprocess,json,datetime,concurrent.futures
repo=Path(__file__).resolve().parents[9]
# Repository location is explicit to avoid reliance on synthetic host cwd.
repo=Path('/home/enpasos/projects/skillpilot')
root=repo/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-eleven-kept-current422-positive-and-atomic-informed-20261015-v1'
host=repo/'tmp/chemie-m7-resumed-20261015/energy-eleven-kept-informed-pa-host-v1'
rel=lambda p:str(p.relative_to(repo))
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()

def run(name,args):
    start=now();p=subprocess.run(args,cwd=host,text=True,capture_output=True);end=now()
    (root/'checks'/f'{name}.stdout.txt').write_text(p.stdout)
    (root/'checks'/f'{name}.stderr.txt').write_text(p.stderr)
    result={'name':name,'args':args,'cwd':rel(host),'startedAt':start,'completedAt':end,'exitCode':p.returncode,'stdoutPath':rel(root/'checks'/f'{name}.stdout.txt'),'stderrPath':rel(root/'checks'/f'{name}.stderr.txt')}
    print(name,p.returncode,p.stdout,flush=True)
    return result
pconf=lambda name:'--config='+rel(root/'normal'/name)
px=['./app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts']
ax=['./app/node_modules/.bin/tsx','app/scripts/semanticAtomicityReview.ts']
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    futures=[pool.submit(run,'P10.stock-check',px+[pconf('P10.current-native.image-bound.config.json'),'--mode=check']),pool.submit(run,'P11.final.stock-check',px+[pconf('P11.final-current.image-bound.config.json'),'--mode=check']),pool.submit(run,'A11.stock-write-fingerprints',ax+[pconf('A11.current-author.semantic-atomicity.config.json'),'--write-fingerprints'])]
    results=[f.result() for f in futures]
if results[2]['exitCode']==0:
    results.append(run('A11.final.stock-check',ax+[pconf('A11.current-author.semantic-atomicity.config.json'),'--mode=check']))
(root/'checks/TARGETED.normal-PA.actual-results.json').write_text(json.dumps({'schemaVersion':1,'role':'Actual scoped normal validators; machine checks do not prove scientific/Human/source/course/image approval','results':results},indent=2)+'\n')
if any(r['exitCode'] for r in results):raise SystemExit(1)

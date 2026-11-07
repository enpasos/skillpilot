from pathlib import Path
import json,subprocess
W=Path(__file__).parent;R=Path('/home/enpasos/projects/skillpilot');index=json.loads((W/'index-reference.json').read_text());capsule=W/'capsule-132';h=__import__('hashlib').sha256((capsule/'capsule.json').read_bytes()).hexdigest();rows=[]
for action in ['build','materialize']:
 for kind,bound,message in [('working',192*1024*1024,'actual working'),('object',295355808,'actual object'),('embedded',14589625,'actual embedded')]:
  budgets={'working':308*1024*1024,'object':282*1024*1024,'embedded':14*1024*1024};budgets[kind]=bound;output=W/('must-not-exist-'+action+'-'+kind);args=['python3',str(W/'run_ro.py'),'--v2','python3','-B','scripts/visualization_qualified_context_capsule.py',action,'--repository-root',str(R),'--accepted-commit','25a6f2164a81a7e6ae50db3557d20521fecf5124','--accepted-census-sha256',index['sha256'],'--census-path',index['path'],'--capsule',str(capsule),'--accepted-capsule-sha256',h,'--output',str(output)]
  for name,value in budgets.items():args+=['--maximum-'+name+'-bytes',str(value)]
  r=subprocess.run(args,capture_output=True,text=True);assert r.returncode!=0 and message in r.stderr and not output.exists(),(action,kind,r.stdout,r.stderr);rows.append({'action':action,'kind':kind,'budget':bound,'exitCode':r.returncode,'outputCreated':False,'stderr':r.stderr,'stdout':r.stdout})
(W/'lower-budget-results.json').write_text(json.dumps({'rows':rows,'allRejectedBeforeOutput':True},indent=2)+'\n');print(json.dumps({'cases':len(rows),'allRejectedBeforeOutput':True}))

from pathlib import Path
import subprocess,datetime,time,json,concurrent.futures
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;AUTHOR=OWN.parent/'biologie-he-evolution-one-current-subset-first-pass-neutral-root-20261008-v3';Q=AUTHOR/'round-b'
commands=[('D1P1-actual-native-API',['app/node_modules/.bin/tsx',str(OWN/'check-current-one-own-native-D-P.independent-b.mts')]),('D1-current-standard-CLI',['app/node_modules/.bin/tsx','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',str(Q/'review-bundle-manifest.json'),'--input',str(Q/'description-review-input.json'),'--campaign',str(Q/'description-review-campaign.json'),'--batches-dir',str(Q/'batches'),'--results-dir',str(OWN/'current-one-first-pass-b/results')])]
def run(c):
 n,a=c;t=time.time();started=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(a,capture_output=True,text=True)
 for suffix,txt in [('stdout.actual.txt',r.stdout),('stderr.actual.txt',r.stderr)]:
  with (OWN/(n+'.'+suffix)).open('x') as f:f.write(txt)
 o={'argv':a,'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'wallSeconds':time.time()-t,'actualExitCode':r.returncode,'stdout':n+'.stdout.actual.txt','stderr':n+'.stderr.actual.txt'}
 with (OWN/(n+'.terminal.actual.json')).open('x') as f:f.write(json.dumps(o,indent=2)+'\n')
 return o
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as e:results=list(e.map(run,commands))
print(json.dumps(results));assert all(x['actualExitCode']==0 for x in results)

from pathlib import Path
import subprocess,datetime,time,json,concurrent.futures
OWN=Path(__file__).resolve().parent;AUTHOR=OWN.parent/'chemie-q3-whole-twenty-raster-native-remediation-technical-20261008-v2';Q=AUTHOR/'native/final-two/round-b'
commands=[('D2P2-actual-native-API',['app/node_modules/.bin/tsx',str(OWN/'check-two-own-actual-native-D-P.independent-b.mts')]),('D2-actual-standard-CLI',['app/node_modules/.bin/tsx','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',str(Q/'review-bundle-manifest.json'),'--input',str(Q/'description-review-input.json'),'--campaign',str(Q/'description-review-campaign.json'),'--batches-dir',str(Q/'batches'),'--results-dir',str(OWN/'round-b/results')])]
def run(c):
 n,a=c;t=time.time();started=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(a,capture_output=True,text=True)
 for suffix,txt in [('stdout.actual.txt',r.stdout),('stderr.actual.txt',r.stderr)]:
  with (OWN/(n+'.'+suffix)).open('x') as f:f.write(txt)
 o={'argv':a,'startedAt':started,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'wallSeconds':time.time()-t,'actualExitCode':r.returncode,'stdout':n+'.stdout.actual.txt','stderr':n+'.stderr.actual.txt'}
 with (OWN/(n+'.terminal.actual.json')).open('x') as f:f.write(json.dumps(o,indent=2)+'\n')
 return o
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:results=list(ex.map(run,commands))
print(json.dumps(results));assert all(x['actualExitCode']==0 for x in results)

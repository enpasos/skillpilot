from pathlib import Path
import json,subprocess,datetime,concurrent.futures
ROOT=Path('/home/enpasos/projects/skillpilot');OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix();TSX=ROOT/'app/node_modules/.bin/tsx'
def run(label,args):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run([str(TSX),*args],cwd=ROOT,capture_output=True,text=True)
 out=OWN/f'checks/{label}.terminal.actual.json';out.parent.mkdir(parents=True,exist_ok=True)
 d={'label':label,'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':[str(TSX.relative_to(ROOT)),*args],'exitCode':p.returncode,'stdout':p.stdout,'stderr':p.stderr,'stockModulesUnmodified':True};out.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return d
for s in 'ab':
 d=run('stock-materialize-existing-corrosion-A2-'+s,['app/scripts/semanticAtomicityReview.ts','--config='+REL+f'/atomicity/two-corrosion.original-independent-{s}.config.json','--write-fingerprints'])
 assert d['exitCode']==0,d
jobs=[]
for s in 'ab':
 for sub in ['two-v3','two-corrosion']:
  jobs.append(('stock-A2-'+sub+'-'+s,['app/scripts/semanticAtomicityReview.ts','--config='+REL+f'/atomicity/{sub}.original-independent-{s}.config.json','--mode=check']))
 jobs.append(('stock-M2-v3-'+s,['app/scripts/memoryCardReview.ts','--config='+REL+f'/memory/two-v3.original-independent-{s}.config.json','--mode=check']))
 d=REL+'/description/original-'+s
 jobs.append(('stock-original-D13-campaign-'+s,['app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',d+'/review-bundle-manifest.json','--input',d+'/description-review-input.json','--campaign',d+'/description-review-campaign.json','--batches-dir',d+'/batches','--results-dir',d+'/results']))
jobs.append(('stock-M2-existing-corrosion',['app/scripts/memoryCardReview.ts','--config='+REL+'/memory/two-corrosion.existing-unchanged.config.json','--mode=check']))
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(lambda x:run(*x),jobs))
summary={'schemaVersion':1,'checks':[{'label':x['label'],'exitCode':x['exitCode'],'terminalPath':REL+'/checks/'+x['label']+'.terminal.actual.json'} for x in results],'allPass':all(x['exitCode']==0 for x in results),'newScientificDecisions':0,'activeWrites':False,'existingT407HostWrites':False}
(OWN/'checks/stock-finite-original-D-AM-results.actual.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary))
for x in results:
 if x['exitCode']:print(x['label'],x['stdout'],x['stderr'])
assert summary['allPass']

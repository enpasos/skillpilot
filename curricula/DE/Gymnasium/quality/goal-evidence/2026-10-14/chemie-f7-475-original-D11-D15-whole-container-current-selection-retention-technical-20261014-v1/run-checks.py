from pathlib import Path
import subprocess,json,datetime,sys,concurrent.futures
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).parent
stage=sys.argv[1];own=str(O.relative_to(R));tsx=['node','app/node_modules/tsx/dist/cli.mjs'];jobs=[]
if stage=='preflight':
 for x in ['P1-f7','A1-f7','P1-475','A1-475']:
  script='positiveGoalEvidenceReview.ts' if x.startswith('P') else 'semanticAtomicityReview.ts'
  jobs.append((x,tsx+['app/scripts/'+script,'--config='+own+'/config/'+x+'.current412.actual-candidate.scoped.config.json','--mode=check']))
 for x in ['D11','D15']:jobs.append((x+'-summary',tsx+['app/scripts/materializeGoalDescriptionRolloutBatch.ts','summarize','--config',own+'/config/'+x+'.whole-original.historical-only.batch.config.json','--write']))
else:
 for x in ['D11','D15']:
  cfg=own+'/config/'+x+'.whole-original.historical-only.batch.config.json'
  if stage=='synthesis':cmd=tsx+['app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','--config',cfg,'--authoring',own+'/'+x+'/synthesis-authoring.complete-originals.no-new-science.json','--write']
  elif stage=='resolutions':cmd=tsx+['app/scripts/materializeGoalDescriptionRolloutResolutions.ts','--config',cfg,'--synthesis-manifest',own+'/'+x+'/synthesis-decisions.json','--write']
  elif stage=='finalize':cmd=tsx+['app/scripts/materializeGoalDescriptionRolloutBatch.ts','finalize','--config',cfg,'--write']
  else:raise ValueError(stage)
  jobs.append((x+'-'+stage,cmd))
def run(job):
 name,cmd=job;now=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(cmd,cwd=R,capture_output=True,text=True);out=O/'receipts';out.mkdir(exist_ok=True);(out/(name+'.stdout.txt')).write_text(p.stdout);(out/(name+'.stderr.txt')).write_text(p.stderr);r={'name':name,'startedAtUTC':now,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'argv':cmd,'cwd':str(R),'exitCode':p.returncode,'stdoutPath':str((out/(name+'.stdout.txt')).relative_to(R)),'stderrPath':str((out/(name+'.stderr.txt')).relative_to(R))};(out/(name+'.actual.json')).write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');return r,p.stdout[-900:],p.stderr[-1200:]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
 for r,out,err in pool.map(run,jobs):print(json.dumps(r),out,err)

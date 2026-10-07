import concurrent.futures, datetime, hashlib, json, pathlib, subprocess
repo=pathlib.Path('/home/enpasos/projects/skillpilot')
base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
own=base+'biologie-q1-seven-active-integration-independent-b-v1/'
candidate=base+'biologie-q1-seven-reviewed-integration-candidate-v1/'
prepared=base+'biologie-q1-seven-final-native-review-inputs-author-v1/'
commands=[
 ('atomicity',['app/node_modules/.bin/tsx','app/scripts/semanticAtomicityReview.ts','--config='+candidate+'full-atomicity.current.config.json','--mode=check']),
 ('memory',['app/node_modules/.bin/tsx','app/scripts/memoryCardReview.ts','--config='+candidate+'full-memory.current.config.json','--mode=check']),
 ('positive',['app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+candidate+'positive.seven.independent-current.config.json','--mode=check']),
 ('description-b',['app/node_modules/.bin/tsx','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',prepared+'bundle/manifest.json','--input',prepared+'round-b/description-review-input.json','--campaign',prepared+'round-b/description-review-campaign.json','--batches-dir',prepared+'round-b/batches','--results-dir',candidate+'native-d-seven/round-b/results'])
]
def run(row):
 name,cmd=row
 r=subprocess.run(cmd,cwd=repo,capture_output=True)
 outputs=[]
 for stream,b in [('stdout',r.stdout),('stderr',r.stderr)]:
  path=own+'native-active-'+name+'.actual.'+stream+'.txt';(repo/path).write_bytes(b)
  outputs.append(dict(path=path,sha256=hashlib.sha256(b).hexdigest(),bytes=len(b)))
 return dict(lane=name,commandArgv=cmd,actualExitCode=r.returncode,actualOutputs=outputs,nativeCheckerUnmodified=True,gateWeakening=False,activeWrites=False)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: results=list(pool.map(run,commands))
out=dict(schemaVersion=1,createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),checks=results,allActualExitCodesZero=all(r['actualExitCode']==0 for r in results),historicalScientificReviewsRestarted=False,humanApproval=False,humanTrial=False,activeWrites=False)
(repo/own/'native-active-checks.independent-b.actual.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({r['lane']:r['actualExitCode'] for r in results}))
if not out['allActualExitCodesZero']: raise SystemExit(1)

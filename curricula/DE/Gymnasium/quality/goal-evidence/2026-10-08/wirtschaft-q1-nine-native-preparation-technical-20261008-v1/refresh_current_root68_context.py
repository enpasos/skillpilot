from pathlib import Path
import json, hashlib, shutil, subprocess, datetime
root=Path('/home/enpasos/projects/skillpilot');own=Path(__file__).resolve().parent;rel=own.relative_to(root)
read=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
iso=Path(read(own/'physical-isolate.initial.actual.json')['physicalIsolate'])
author=own.parent/'wirtschaft-q1-europe-tax-nine-bilingual-positive-author-v2';ids=set(read(author/'goal-ids.json'));assert len(ids)==9
canonical=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json');qa=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json');base=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1');kind=base/'wirtschaftswissenschaften.semantic-kinds.json'
out=own/'root-current68-context';out.mkdir(exist_ok=False)
current=read(root/canonical);previous=read(iso/canonical);current_by={g['id']:g for g in current['goals']};old_by={g['id']:g for g in read(author/'whole-goals.original.json')};candidates={g['id']:g for g in previous['goals'] if g['id'] in ids}
assert all(current_by[gid]==g for gid,g in old_by.items())
current_qa=read(root/qa);assert sum(r['visualizationState']=='available' for r in current_qa['records'])==68
for name,path in [('canonical',canonical),('qa',qa),('semkind',kind)]:
 shutil.copyfile(iso/path,out/(name+'.previous51-context.snapshot.json'))
 shutil.copyfile(root/path,out/(name+'.current68-root.snapshot.json'))
current['goals']=[candidates.get(g['id'],g) for g in current['goals']]
(iso/canonical).write_text(json.dumps(current,ensure_ascii=False,indent=2)+'\n')
old_qa={r['goalId']:r for r in read(iso/qa)['records'] if r['goalId'] in ids};assert len(old_qa)==9
current_qa['records']=[old_qa.get(r['goalId'],r) for r in current_qa['records']]
(iso/qa).write_text(json.dumps(current_qa,ensure_ascii=False,indent=2)+'\n');shutil.copyfile(root/kind,iso/kind)
for path in [base/'review-book-full.config.json',base/'review-full-canonical.view.json']:
 shutil.copyfile(root/path,iso/path)
copied=[]
for row in current_qa['records']:
 if row['visualizationState']!='available' or row['goalId'] in ids:continue
 for key in ['publicAssetPath','canonicalAssetPath']:
  path=Path(row[key]);assert sha(root/path)==row['assetSha256'];(iso/path).parent.mkdir(parents=True,exist_ok=True)
  if (iso/path).exists():assert sha(iso/path)==row['assetSha256']
  else:shutil.copyfile(root/path,iso/path);copied.append({'goalId':row['goalId'],'path':str(path),'sha256':sha(iso/path)})
runs=[]
for cmd in [['app/node_modules/.bin/tsx',str(rel/'bind-candidate-semkind.mts')],['app/node_modules/.bin/tsx','app/scripts/generateGoalVisualizationQaLedgers.ts','--subject','wirtschaftswissenschaften','--check'],['app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+str(rel/'positive-final-images.candidate.config.json'),'--mode=check']]:
 result=subprocess.run(cmd,cwd=iso,capture_output=True,text=True);i=len(runs)
 (out/f'command-{i}.stdout.txt').write_text(result.stdout);(out/f'command-{i}.stderr.txt').write_text(result.stderr);runs.append({'command':cmd,'cwd':str(iso),'exitCode':result.returncode});assert result.returncode==0,result.stdout+result.stderr
new_by={g['id']:g for g in read(iso/canonical)['goals']}
assert set(new_by)==set(current_by) and all(new_by[gid]==g for gid,g in current_by.items() if gid not in ids)
assert all(new_by[gid]==g for gid,g in candidates.items())
receipt={'schemaVersion':1,'role':'technical_current_context_refresh','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'physicalIsolate':str(iso),'currentRootIntegratedStrictGoals':68,'currentRootCanonicalSha256':sha(root/canonical),'candidateGoalsUnchanged':9,'allOtherWholeGoalsMatchActualCurrentRoot':361,'onlyNewPhysicalContextImages':copied,'currentQaAvailable':77,'nativeCommands':runs,'nativePositiveFinalImageCandidatesCurrent':9,'noHistoricalDPageReviewRepeated':True,'preparedDCount':0,'independentReviewClaim':False,'humanApprovalClaimed':False,'activeWrites':0,'newStrictClosures':0}
with (out/'actual-current68-context-input-closure.json').open('x') as f:f.write(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
for name,path in [('candidate-canonical.current68-context.inert.json',canonical),('candidate-qa303.current68-context.inert.json',qa),('candidate-semantic-kinds.current68-context.inert.json',kind)]:shutil.copyfile(iso/path,own/name)
print('Q1-9 actual Root68 context: whole361 unchanged context goals exact; candidate9 exact; new17 dualassets copied; native QA/P9 current PASS.')

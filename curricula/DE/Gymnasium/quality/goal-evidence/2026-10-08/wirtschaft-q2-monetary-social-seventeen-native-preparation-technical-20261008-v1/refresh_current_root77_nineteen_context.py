"""Only isolated current context updates; preserve all historical D files."""
from pathlib import Path
import json, hashlib, shutil, subprocess, datetime
root=Path('/home/enpasos/projects/skillpilot')
parent=Path(__file__).resolve().parent.parent
read=lambda p:json.loads(p.read_text())
sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
canonical=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
qa=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json')
base=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1')
kind=base/'wirtschaftswissenschaften.semantic-kinds.json'
current_root=read(root/canonical);current_qa=read(root/qa)
assert sum(r['visualizationState']=='available' for r in current_qa['records'])==77
actual_root_sha=sha(root/canonical)
for package,count,label,author_name in [
 ('wirtschaft-q2-nineteen-native-preparation-technical-20261008-v1',19,'q2-nineteen','wirtschaft-q2-conjuncture-competition-nineteen-bilingual-positive-author-v1')]:
 own=parent/package;rel=own.relative_to(root)
 iso=Path(read(own/'physical-isolate.initial.actual.json')['physicalIsolate'])
 frozen=read(own/f'native-d-{label}-final.prepared-freeze.actual.json')['byteExactReturnedNativeFiles']
 assert len(frozen)==28
 for row in frozen:assert sha(root/row['path'])==sha(iso/row['path'])==row['sha256']
 ids=set(read(parent/author_name/'goal-ids.json'));assert len(ids)==count
 originals=read(parent/author_name/'whole-goals.original.json')
 root_by={g['id']:g for g in current_root['goals']}
 assert all(root_by[g['id']]==g for g in originals)
 out=own/'root-current77-context';out.mkdir(exist_ok=False)
 (iso/rel/'root-current77-context').mkdir(exist_ok=True)
 before=read(iso/canonical);selected={g['id']:g for g in before['goals'] if g['id'] in ids}
 assert len(selected)==count
 for name,path in [('canonical',canonical),('qa',qa),('semkind',kind)]:
  shutil.copyfile(iso/path,out/(name+'.previous68-context.snapshot.json'))
  shutil.copyfile(root/path,out/(name+'.current77-root.snapshot.json'))
 candidate=dict(current_root,goals=[selected.get(g['id'],g) for g in current_root['goals']])
 (iso/canonical).write_text(json.dumps(candidate,ensure_ascii=False,indent=2)+'\n')
 selected_qa={r['goalId']:r for r in read(iso/qa)['records'] if r['goalId'] in ids}
 assert len(selected_qa)==count
 new_qa=dict(current_qa,records=[selected_qa.get(r['goalId'],r) for r in current_qa['records']])
 (iso/qa).write_text(json.dumps(new_qa,ensure_ascii=False,indent=2)+'\n')
 shutil.copyfile(root/kind,iso/kind)
 for path in [base/'review-book-full.config.json',base/'review-full-canonical.view.json']:shutil.copyfile(root/path,iso/path)
 copied=[]
 for row in new_qa['records']:
  if row['visualizationState']!='available' or row['goalId'] in ids:continue
  for key in ['publicAssetPath','canonicalAssetPath']:
   path=Path(row[key]);assert sha(root/path)==row['assetSha256']
   (iso/path).parent.mkdir(parents=True,exist_ok=True)
   if (iso/path).exists():assert sha(iso/path)==row['assetSha256']
   else:shutil.copyfile(root/path,iso/path);copied.append({'goalId':row['goalId'],'path':str(path),'sha256':sha(iso/path)})
 runs=[]
 for cmd in [['app/node_modules/.bin/tsx',str(rel/'bind-candidate-semkind.mts')],['app/node_modules/.bin/tsx','app/scripts/generateGoalVisualizationQaLedgers.ts','--subject','wirtschaftswissenschaften','--check'],['app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+str(rel/'positive-final-images.candidate.config.json'),'--mode=check']]:
  result=subprocess.run(cmd,cwd=iso,capture_output=True,text=True);i=len(runs)
  for suffix,text in [('stdout',result.stdout),('stderr',result.stderr)]:
   with(out/f'command-{i}.{suffix}.txt').open('x') as stream:stream.write(text)
  runs.append({'command':cmd,'cwd':str(iso),'exitCode':result.returncode})
  assert result.returncode==0,result.stdout+result.stderr
 after=read(iso/canonical);after_by={g['id']:g for g in after['goals']}
 assert all(after_by[gid]==g for gid,g in root_by.items() if gid not in ids)
 assert all(after_by[gid]==g for gid,g in selected.items())
 # Native full-page rebuild in memory must match the original prepared model exactly.
 helper=(iso/'tmp/check-current-root77-pages.mts');helper.parent.mkdir(exist_ok=True)
 code="""import assert from 'node:assert/strict';import{readFileSync,writeFileSync}from'node:fs';import{loadGoalBookBuildInputs,stableGoalBookJson}from'../app/scripts/goalBookModel.ts';import{buildGoalDescriptionRolloutSubsetModel}from'../app/scripts/materializeGoalDescriptionRolloutBatch.ts';
const base=BASE;const label=LABEL;const c=JSON.parse(readFileSync(base+'/native-d-'+label+'.final.batch.config.json','utf8'));const frozen=JSON.parse(readFileSync(base+'/native-d-'+label+'-final/bundle/book-model.json','utf8'));const build=await loadGoalBookBuildInputs(c.baseGoalBookConfigPath);const current=buildGoalDescriptionRolloutSubsetModel({baseModel:build.model,goalIds:c.goalIds,bookId:c.bookId,title:c.title});const rows=current.pages.map((p:any,i:number)=>({goalId:p.goalId,wholePageEquivalent:stableGoalBookJson(p)===stableGoalBookJson(frozen.pages[i]),pageFingerprint:p.pageFingerprint,goalFingerprint:p.goalFingerprint}));assert.equal(rows.length,COUNT);assert(rows.every((r:any)=>r.wholePageEquivalent));writeFileSync(base+'/root-current77-context/native-current77-whole-page-parity.actual.json',JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),role:'technical_current_native_page_countercheck',currentRootIntegratedContext:77,physicalIsolate:process.cwd(),wholeCurrentNativePages:COUNT,observations:rows,allWholeCurrentNativePagesMatchFinalFreeze:true,independentReviewClaim:false,humanApprovalClaimed:false,activeWrites:0,newStrictClosures:0},null,2)+'\\n',{flag:'wx'});console.log('Current Root77 whole native pages COUNT PASS, historical freeze unchanged.');
""".replace('BASE',json.dumps(str(rel))).replace('LABEL',json.dumps(label)).replace('COUNT',str(count))
 with helper.open('x') as stream:stream.write(code)
 cmd=['app/node_modules/.bin/tsx','tmp/check-current-root77-pages.mts'];result=subprocess.run(cmd,cwd=iso,capture_output=True,text=True)
 for suffix,text in [('stdout',result.stdout),('stderr',result.stderr)]:
  with(out/f'whole-page-parity.{suffix}.txt').open('x') as stream:stream.write(text)
 assert result.returncode==0,result.stdout+result.stderr
 shutil.copyfile(iso/rel/'root-current77-context/native-current77-whole-page-parity.actual.json',out/'native-current77-whole-page-parity.actual.json')
 for row in frozen:assert sha(root/row['path'])==sha(iso/row['path'])==row['sha256']
 assert sha(root/canonical)==actual_root_sha,'Root canonical changed while current context was being verified.'
 with(out/'actual-current77-context-input-closure.json').open('x') as stream:
  stream.write(json.dumps({'schemaVersion':1,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'technical_current_context_refresh','physicalIsolate':str(iso),'currentRootIntegratedStrictGoals':77,'currentRootCanonicalSha256':actual_root_sha,'candidateGoalsUnchanged':count,'allOtherWholeGoalsMatchCurrentRoot':370-count,'newPhysicalImages':copied,'nativeCommands':runs,'currentQaAvailable':77+count,'nativePositiveCandidatesCurrent':count,'wholeCurrentPagesMatchOriginalFreeze':True,'historical28FreezeFilesVerifiedBeforeAndAfter':True,'independentReviewClaim':False,'activeWrites':0,'newStrictClosures':0},ensure_ascii=False,indent=2)+'\n')
 for name,path in [('candidate-canonical.current77-context.inert.json',canonical),('candidate-qa303.current77-context.inert.json',qa),('candidate-semantic-kinds.current77-context.inert.json',kind)]:
  assert not(own/name).exists();shutil.copyfile(iso/path,own/name)
 print(f'{count} current Root77 whole pages/native QA/P PASS; historical freeze28 byte-exact.')

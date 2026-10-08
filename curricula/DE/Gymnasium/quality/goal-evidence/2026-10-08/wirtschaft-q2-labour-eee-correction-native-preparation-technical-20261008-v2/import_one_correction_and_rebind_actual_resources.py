# Apache-2.0. One actual corrected PNG and its current native resource/page bindings; no live writes.
from pathlib import Path
import json,hashlib,shutil,subprocess,datetime,os
root=Path('/home/enpasos/projects/skillpilot');iso=Path('/tmp/skillpilot-wirtschaft-q2-labour-twelve-native-qnj7b9dg');B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08');own=B/'wirtschaft-q2-labour-eee-correction-native-preparation-technical-20261008-v2';prior=B/'wirtschaft-q2-labour-twelve-native-preparation-technical-20261008-v1';author=B/'wirtschaft-q2-labour-twelve-bilingual-positive-author-v2';gid='eee7217a-c2fb-58b6-ba84-2a8d5235edb5'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json';SEM='curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1/wirtschaftswissenschaften.semantic-kinds.json'
selection=Path('curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-q2-labour-twelve-independent-image-review-20261008-v1/actual-final-twelve-KEEP-after-two-corrections.receipt.json');alts=selection.parent/'actual-final-twelve-alttexts-after-two-corrections.json';read=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x')as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
assert sha(root/selection)=='sha256:f8cb4304e0750bd515e5429811893d6d595e962687affcefd8c4337c682c58b4'
selected=read(root/selection);assert selected['finalKeepCount']==12 and selected['openFindings']==[]
item=next(x for x in selected['selection']if x['goalId']==gid);asset=Path(item['candidatePath']);image_review=read(root/item['independentReceiptPath']);assert sha(root/asset)=='sha256:'+item['assetSha256'];assert sha(root/item['independentReceiptPath'])=='sha256:'+item['independentReceiptSha256'];assert image_review['decision']=='KEEP' and image_review['aiApproved']=='yes' and image_review['humanApprovalClaimed']is False;assert all(x['actualViewImageUsed']for x in image_review['inspections'])
generation=read(root/image_review['generationReceiptPath']);assert generation['provider']=='OpenAI Codex image_gen';prompt=asset.parent/'actual-prompt.txt';args=asset.parent/'actual-imagegen-call.args.json';assert prompt.exists()and args.exists()
frozen=read(root/prior/'native-d-q2-labour-twelve-final.prepared-freeze.actual.json')['byteExactReturnedNativeFiles'];assert len(frozen)==28
for f in frozen:assert sha(root/f['path'])==sha(iso/f['path'])==f['sha256']
assert read(root/B/'wirtschaft-q2-labour-twelve-reviewed-current-source-bindings-v2/current113-native-wholepage-parity.actual.json')['allWholePagesExactlyUnchanged']
(iso/own).mkdir(exist_ok=False)
for p in[CAN,QA,SEM]:
 dest=root/own/'before-correction-physical-input-bytes'/Path(p).name;dest.parent.mkdir(parents=True,exist_ok=True)
 with dest.open('xb')as f:f.write((iso/p).read_bytes())
for p in[selection,alts,asset,prompt,args,Path(item['independentReceiptPath']),Path(image_review['generationReceiptPath'])]:
 dest=iso/p;dest.parent.mkdir(parents=True,exist_ok=True)
 if not dest.exists():shutil.copyfile(root/p,dest)
 else:assert dest.read_bytes()==(root/p).read_bytes()
# Capture the actually active source2 pointer/extraction as context, without pretending D v3 embeds it.
mapping=Path('curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_wirtschaft_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json');source=Path(read(root/mapping)['sourceExtractionPath']);assert 'wirtschaft-q2-bw-two-current-source-location-successors-author-v1/'in str(source)
for p in[mapping,source]:
 dest=iso/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/p,dest)
commands=[]
def run(name,cmd,env=None):
 r=subprocess.run(cmd,cwd=iso,capture_output=True,text=True,env=env)
 for k,t in[('stdout',r.stdout),('stderr',r.stderr)]:
  with(root/own/(name+'.'+k+'.txt')).open('x')as f:f.write(t)
 commands.append({'name':name,'command':cmd,'workingDirectory':str(iso),'actualExitCode':r.returncode});assert r.returncode==0,r.stdout+r.stderr
run('import-one-corrected-png',['node','scripts/import_goal_visualization.mjs',gid,str(asset),'--landscape',CAN,'--subject','wirtschaftswissenschaften','--lang','de','--provider',generation['provider'],'--review-status','approved_ai','--license','CC-BY-4.0','--alt-text',item['altText'],'--prompt',str(prompt)])
run('native-generate-current-qa303',['app/node_modules/.bin/tsx','app/scripts/generateGoalVisualizationQaLedgers.ts','--subject','wirtschaftswissenschaften'])
qa=read(iso/QA);row=next(r for r in qa['records']if r['goalId']==gid);assert row['assetSha256']=='sha256:'+item['assetSha256'];row.update(aiApproved='yes',aiApprovedAssetSha256=row['assetSha256'],aiReviewedAt=image_review['reviewedAt'][:10],aiReviewer=image_review['reviewer']['agentIdentity'],aiNotes='Actual independent corrected-image review: '+item['independentReceiptPath']+' (sha256:'+item['independentReceiptSha256']+'). '+image_review['actualSubjectReview']+' '+image_review['actualActorPerspectiveReview'],humanApproved='no',humanReviewedAt=None,humanReviewer='')
(iso/QA).write_text(json.dumps(qa,ensure_ascii=False,indent=2)+'\n')
run('native-qa303-check',['app/node_modules/.bin/tsx','app/scripts/generateGoalVisualizationQaLedgers.ts','--subject','wirtschaftswissenschaften','--check'])
# Candidate semantic-kind decisions stay identical; only an actual bounded resource source-binding if needed.
script=own/'bind-only-eee-current-kind.mts';code="import{readFile,writeFile}from'node:fs/promises';import{fingerprintSemanticKindSourceGoal}from'../../../../../../../app/scripts/goalBookModel.ts';const cp="+json.dumps(CAN)+",sp="+json.dumps(SEM)+";const c=JSON.parse(await readFile(cp,'utf8')),s=JSON.parse(await readFile(sp,'utf8'));const g=c.goals.find((g:any)=>g.id==="+json.dumps(gid)+"),d=s.decisions.find((d:any)=>d.goalId==="+json.dumps(gid)+");d.sourceFingerprint=fingerprintSemanticKindSourceGoal(g);await writeFile(sp,JSON.stringify(s,null,2)+String.fromCharCode(10));"
with(iso/script).open('x')as f:f.write(code)
run('bind-only-eee-kind',['app/node_modules/.bin/tsx',str(script)])
oldconfig=read(root/prior/'positive-final-images.candidate.config.json');cfg=dict(oldconfig,reviewPath=str(own/'positive-final-resources.records.candidate.jsonl'));stage=dict(cfg,reviewPath=str(own/'native-fresh-materialization-staging.records.jsonl'));write(iso/own/'positive-materialization-staging.config.json',stage)
run('native-materialize-unchanged-positive12',['app/node_modules/.bin/tsx','app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',str(own/'positive-materialization-staging.config.json'),'--candidates',str(author/'positive.candidates.json'),'--write'])
oldlines=(root/oldconfig['reviewPath']).read_bytes().splitlines(keepends=True);fresh={json.loads(l)['goalId']:l for l in(iso/stage['reviewPath']).read_bytes().splitlines(keepends=True)};merged=b''.join(fresh[gid]if json.loads(l)['goalId']==gid else l for l in oldlines);assert len(oldlines)==12
(iso/cfg['reviewPath']).write_bytes(merged);write(iso/own/'positive-final-resources.candidate.config.json',cfg)
run('native-positive-current12-check',['app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+str(own/'positive-final-resources.candidate.config.json'),'--mode=check'])
oldrecord=next(json.loads(l)for l in oldlines if json.loads(l)['goalId']==gid);nextrecord=json.loads(fresh[gid]);assert nextrecord['profile']==oldrecord['profile'] and nextrecord['profileFingerprint']==oldrecord['profileFingerprint'];assert nextrecord['status']=='needs_human_review'and nextrecord['reviewAuthority']=='ai_candidate'and nextrecord['reviewRunIds']==[]
for name,p in [('candidate-canonical.current113-corrected-image.inert.json',CAN),('candidate-qa303.current113-corrected-image.inert.json',QA),('candidate-semantic-kinds.current113-corrected-image.inert.json',SEM)]:
 with(root/own/name).open('xb')as f:f.write((iso/p).read_bytes())
write(root/own/'one-corrected-asset-and-positive-resource-successor.actual.json',{'schemaVersion':1,'role':'technical_one_corrected_asset_import_and_current_resource_binding','actualCheckedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'physicalIsolate':str(iso),'currentRootStrictBaseline':113,'selectionPath':str(selection),'selectionSha256':sha(root/selection),'actualPromptPath':str(prompt),'actualPromptSha256':sha(root/prompt),'actualPromptPersistedAfterGeneration':'True per actual-imagegen-call.args.json; native BEFORE preparation remains separately genuine. No earlier prompt-file chronology claimed.','correctedGoalId':gid,'assetPath':str(asset),'assetSha256':sha(root/asset),'independentReviewPath':item['independentReceiptPath'],'independentReviewSha256':'sha256:'+item['independentReceiptSha256'],'activeCurrentSource2MappingPath':str(mapping),'activeCurrentSource2MappingSha256':sha(root/mapping),'activeCurrentSource2ExtractionPath':str(source),'activeCurrentSource2ExtractionSha256':sha(root/source),'unchangedPriorPositiveRecordsByteExact':11,'sameSubstantivePositiveProfile':True,'nativePositiveCurrentCandidateRecords':12,'commands':commands,'independentApprovalByPreparationClaimed':False,'humanApprovalClaimed':False,'activeWrites':0,'newStrictClosures':0})
for p in(iso/own).rglob('*'):
 if p.is_file():
  dest=root/p.relative_to(iso);dest.parent.mkdir(parents=True,exist_ok=True)
  if dest.exists():assert dest.read_bytes()==p.read_bytes()
  else:shutil.copyfile(p,dest)
print('Actual eee-v2 imported; QA303PASS; native currentP12PASS; eleven P records byteexact; P content same; Root113/source2; old28frozenbytes untouched.')

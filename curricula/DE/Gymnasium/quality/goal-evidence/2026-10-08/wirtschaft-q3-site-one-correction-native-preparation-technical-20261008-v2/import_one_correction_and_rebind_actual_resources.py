# Apache-2.0. One actual corrected PNG and its current native resource/page bindings; no live writes.
from pathlib import Path
import json,hashlib,shutil,subprocess,datetime,os
root=Path('/home/enpasos/projects/skillpilot');iso=Path('/tmp/skillpilot-wirtschaft-q3-twenty-three-native-kd_f3f9x');B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08');own=B/'wirtschaft-q3-site-one-correction-native-preparation-technical-20261008-v2';prior=B/'wirtschaft-q3-twenty-three-native-preparation-technical-20261008-v1';author=B/'wirtschaft-q3-global-currency-integration-twenty-three-bilingual-positive-author-v2';gid='7f8f6648-6faa-52c5-9793-3654ef9dc36d'
CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json';SEM='curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1/wirtschaftswissenschaften.semantic-kinds.json'
selection=Path('curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-q3-site-competition-one-independent-image-review-20261008-v2/actual-final-twenty-three-selection-22priorKEEP-1correctedKEEP.receipt.json');alts=selection.parent/'actual-corrected-site-competition-alttext.candidate.json';read=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x')as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
assert sha(root/selection)=='sha256:3b3bf8387c32ba530f6adcff00c78e6035cde7bb6638027729d7e7c4b47c29dd'
selected=read(root/selection);assert selected['counts']['currentSelectedKEEP']==23 and selected['counts']['currentBlockingImageFindings']==0
item=next(x for x in selected['currentSelectedAssets']if x['goalId']==gid);asset=Path(item['assetPath']);image_review=read(root/item['reviewReceiptPath']);assert sha(root/asset)==item['assetSha256'];assert sha(root/item['reviewReceiptPath'])==item['reviewReceiptSha256'];assert image_review['decision']=='KEEP' and image_review['aiApproved']=='yes' and image_review['humanApprovalClaimed']is False;assert all(x['actualViewImage']for x in image_review['inspections'])
item['altText']=read(root/alts)['altText'];assert read(root/alts)['goalId']==gid
generation=read(root/image_review['generationReceiptPath']);assert generation['provider']=='OpenAI Codex image_gen';prompt=asset.parent/'actual-prompt.txt';args=asset.parent/'actual-imagegen-call.args.json';assert prompt.exists()and args.exists()
frozen=[]
for name in ['native-d-q3-global-currency-seventeen-final.prepared-freeze.actual.json','native-d-q3-europe-integration-six-final.prepared-freeze.actual.json']:frozen.extend(read(root/prior/name)['byteExactReturnedNativeFiles'])
assert len(frozen)==56
for f in frozen:assert sha(root/f['path'])==sha(iso/f['path'])==f['sha256']
assert read(root/B/'wirtschaft-q3-twenty-three-reviewed-current-source-bindings-v3/current125-native-wholepage-parity.actual.json')['allWholePagesExactlyUnchanged']
(iso/own).mkdir(exist_ok=False)
for p in[CAN,QA,SEM]:
 dest=root/own/'before-correction-physical-input-bytes'/Path(p).name;dest.parent.mkdir(parents=True,exist_ok=True)
 with dest.open('xb')as f:f.write((iso/p).read_bytes())
for p in[selection,alts,asset,prompt,args,Path(item['reviewReceiptPath']),Path(image_review['generationReceiptPath'])]:
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
qa=read(iso/QA);row=next(r for r in qa['records']if r['goalId']==gid);assert row['assetSha256']==item['assetSha256'];row.update(aiApproved='yes',aiApprovedAssetSha256=row['assetSha256'],aiReviewedAt=image_review['reviewedAt'][:10],aiReviewer=image_review['reviewer']['agentIdentity'],aiNotes='Actual independent corrected-image review: '+item['reviewReceiptPath']+' ('+item['reviewReceiptSha256']+'). '+image_review['actualSubjectReview']+' '+image_review['actualActorPerspectiveAndReadabilityReview'],humanApproved='no',humanReviewedAt=None,humanReviewer='')
(iso/QA).write_text(json.dumps(qa,ensure_ascii=False,indent=2)+'\n')
run('native-qa303-check',['app/node_modules/.bin/tsx','app/scripts/generateGoalVisualizationQaLedgers.ts','--subject','wirtschaftswissenschaften','--check'])
# Candidate semantic-kind decisions stay identical; only an actual bounded resource source-binding if needed.
script=own/'bind-only-site-current-kind.mts';code="import{readFile,writeFile}from'node:fs/promises';import{fingerprintSemanticKindSourceGoal}from'../../../../../../../app/scripts/goalBookModel.ts';const cp="+json.dumps(CAN)+",sp="+json.dumps(SEM)+";const c=JSON.parse(await readFile(cp,'utf8')),s=JSON.parse(await readFile(sp,'utf8'));const g=c.goals.find((g:any)=>g.id==="+json.dumps(gid)+"),d=s.decisions.find((d:any)=>d.goalId==="+json.dumps(gid)+");d.sourceFingerprint=fingerprintSemanticKindSourceGoal(g);await writeFile(sp,JSON.stringify(s,null,2)+String.fromCharCode(10));"
with(iso/script).open('x')as f:f.write(code)
run('bind-only-site-kind',['app/node_modules/.bin/tsx',str(script)])
oldconfig=read(root/prior/'positive-final-images.candidate.config.json');cfg=dict(oldconfig,reviewPath=str(own/'positive-final-resources.records.candidate.jsonl'));stage=dict(cfg,reviewPath=str(own/'native-fresh-materialization-staging.records.jsonl'));write(iso/own/'positive-materialization-staging.config.json',stage)
run('native-materialize-unchanged-positive23',['app/node_modules/.bin/tsx','app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',str(own/'positive-materialization-staging.config.json'),'--candidates',str(author/'positive.candidates.json'),'--write'])
oldlines=(root/oldconfig['reviewPath']).read_bytes().splitlines(keepends=True);fresh={json.loads(l)['goalId']:l for l in(iso/stage['reviewPath']).read_bytes().splitlines(keepends=True)};merged=b''.join(fresh[gid]if json.loads(l)['goalId']==gid else l for l in oldlines);assert len(oldlines)==23
(iso/cfg['reviewPath']).write_bytes(merged);write(iso/own/'positive-final-resources.candidate.config.json',cfg)
run('native-positive-current23-check',['app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts','--config='+str(own/'positive-final-resources.candidate.config.json'),'--mode=check'])
oldrecord=next(json.loads(l)for l in oldlines if json.loads(l)['goalId']==gid);nextrecord=json.loads(fresh[gid]);assert nextrecord['profile']==oldrecord['profile'] and nextrecord['profileFingerprint']==oldrecord['profileFingerprint'];assert nextrecord['status']=='needs_human_review'and nextrecord['reviewAuthority']=='ai_candidate'and nextrecord['reviewRunIds']==[]
for name,p in [('candidate-canonical.current125-corrected-image.inert.json',CAN),('candidate-qa303.current125-corrected-image.inert.json',QA),('candidate-semantic-kinds.current125-corrected-image.inert.json',SEM)]:
 with(root/own/name).open('xb')as f:f.write((iso/p).read_bytes())
write(root/own/'one-corrected-asset-and-positive-resource-successor.actual.json',{'schemaVersion':1,'role':'technical_one_corrected_asset_import_and_current_resource_binding','actualCheckedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'physicalIsolate':str(iso),'currentRootStrictBaseline':125,'selectionPath':str(selection),'selectionSha256':sha(root/selection),'actualPromptPath':str(prompt),'actualPromptSha256':sha(root/prompt),'actualPromptChronology':'Actual prompt and provider-call argument bytes retained and matched to generation provenance; actual native BEFORE chronology separately recorded in the cited independent receipt.','correctedGoalId':gid,'assetPath':str(asset),'assetSha256':sha(root/asset),'independentReviewPath':item['reviewReceiptPath'],'independentReviewSha256':item['reviewReceiptSha256'],'activeCurrentSource2MappingPath':str(mapping),'activeCurrentSource2MappingSha256':sha(root/mapping),'activeCurrentSource2ExtractionPath':str(source),'activeCurrentSource2ExtractionSha256':sha(root/source),'unchangedPriorPositiveRecordsByteExact':22,'sameSubstantivePositiveProfile':True,'nativePositiveCurrentCandidateRecords':23,'commands':commands,'independentApprovalByPreparationClaimed':False,'humanApprovalClaimed':False,'activeWrites':0,'newStrictClosures':0})
for p in(iso/own).rglob('*'):
 if p.is_file():
  dest=root/p.relative_to(iso);dest.parent.mkdir(parents=True,exist_ok=True)
  if dest.exists():assert dest.read_bytes()==p.read_bytes()
  else:shutil.copyfile(p,dest)
print('Actual7f-v2 imported; QA303PASS; native currentP23PASS;22 P records byteexact; P content same; Root125/source2; old56frozenbytes untouched.')

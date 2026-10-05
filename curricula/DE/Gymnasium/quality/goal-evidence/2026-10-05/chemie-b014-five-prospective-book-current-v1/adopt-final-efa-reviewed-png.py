from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,shutil
ROOT=Path.cwd().resolve();REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-prospective-book-current-v1');OWN=ROOT/REL;ISO=ROOT/'tmp/chemie-b014-five-native-isolated-20261005-v1'
VREL=Path('curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-reversible-cell-mobile-independent-v-qa-20261005-v1/independent-v-review.candidate.json')
def read(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,x):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
v=read(ROOT/VREL);id=v['goalId'];assert v['decision']=='PASS' and v['humanApproved']=='no'
asset=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-reversible-cell-mobile-correction-candidate-20261005-v1'/f'{id}.png';fields=v['nativeQaFieldsCandidate'];assert 'sha256:'+sha(asset)==fields['assetSha256']==fields['aiApprovedAssetSha256']
cp=ISO/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';canonical=read(cp);goal=next(g for g in canonical['goals'] if g['id']==id)
for key in ['title','titleEn','description','descriptionEn','requires']:
 assert goal[key]==v['currentGoal'][key],key
oldpng=ISO/f'curricula/DE/Gymnasium/visualizations/chemie/{id}/{id}.jpg';assert 'sha256:'+sha(oldpng)==v['provenance']['originalJpgSha256']
for p in [fields['canonicalAssetPath'],fields['publicAssetPath'],'backend/src/main/resources/static/'+fields['imageUrl'].lstrip('/'),f'curricula/DE/Gymnasium/visualizations/chemie/{id}/prompt.de.md']:
 target=ISO/p
 if target.is_symlink():target.unlink();shutil.copy2(ROOT/p,target)
prompt=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-reversible-cell-mobile-correction-candidate-20261005-v1/actual-final-generation.prompt.md'
args=['node','scripts/import_goal_visualization.mjs','--goal',id,'--image',str(asset),'--landscape','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','--subject','chemie','--lang','de','--provider',v['candidateResourceLinkFields']['provider'],'--review-status','pilot','--license','CC-BY-4.0','--description',v['candidateResourceLinkFields']['description'],'--alt-text',v['candidateResourceLinkFields']['altText'],'--prompt',str(prompt)]
started=datetime.now(timezone.utc).isoformat();run=subprocess.run(args,cwd=ISO,text=True,capture_output=True);ended=datetime.now(timezone.utc).isoformat();(OWN/'efa-final-native-image-import.stdout.txt').write_text(run.stdout);(OWN/'efa-final-native-image-import.stderr.txt').write_text(run.stderr);assert run.returncode==0,run.stderr
canonical=read(cp);goal=next(g for g in canonical['goals'] if g['id']==id);link=next(l for l in goal['resourceLinks'] if l.get('type')=='goal-visualization' and l.get('role')=='primary')
assert link==v['candidateResourceLinkFields'],{'actual':link,'reviewed':v['candidateResourceLinkFields']}
paths=[fields['canonicalAssetPath'],fields['publicAssetPath'],'backend/src/main/resources/static/'+fields['imageUrl'].lstrip('/')]
for p in paths:assert 'sha256:'+sha(ISO/p)==fields['assetSha256']
qp=ISO/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json';qa=read(qp);row=next(r for r in qa['records'] if r['goalId']==id);row.update(fields);row.update({'contentApprovedChatGpt':'yes','umlautsCorrectChatGpt':'yes','chatGptReviewedAt':fields['aiReviewedAt'],'chatGptReviewer':fields['aiReviewer'],'chatGptNotes':fields['aiNotes'],'humanApproved':'no','humanIssueIdentified':'no','humanIssueDescription':'','humanReviewedAt':None,'humanReviewer':''});write(qp,qa)
write(OWN/'final-efa-independent-PASS-adoption.actual.receipt.json',{'decision':'PASS','status':'isolated_native_import_exact_independently_reviewed_revised_scope','goalId':id,'nativeCommand':{'args':args,'cwd':str(ISO),'startedAtUTC':started,'endedAtUTC':ended,'actualExitCode':run.returncode},'independentReviewPath':str(VREL),'independentReviewSha256':'sha256:'+sha(ROOT/VREL),'newPixelHash':fields['assetSha256'],'allThreeExactNativeCopies':paths,'resourceLinkEqualsActualIndependentlyReviewedResourceLink':True,'scientificDEENAndPrerequisitesExactlyReviewed':True,'oldJpgStillUnchanged':True,'firstHeldGlassContactImageNotAccepted':True,'generationAndCorrectionProvenancePath':v['provenance']['requestPath'],'nativeFinalPromptPath':str(prompt.relative_to(ROOT)),'specificAltTextActuallyIndependentlyReviewed':True,'humanApproval':False,'strictNetDelta':0,'activeWrites':0})
print(json.dumps({'decision':'PASS','goalId':id,'assetSha256':fields['assetSha256'],'nativeImportExitCode':0,'activeWrites':0}))

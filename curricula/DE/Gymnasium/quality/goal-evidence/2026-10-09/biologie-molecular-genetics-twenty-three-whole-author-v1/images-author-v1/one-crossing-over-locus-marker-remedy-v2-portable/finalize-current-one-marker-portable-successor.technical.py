# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import copy,datetime,hashlib,json,subprocess
from scripts.validate_schemas import curriculum_symlink_errors
ROOT=Path.cwd().resolve(); B=Path(__file__).resolve().parent.relative_to(ROOT); OLD=B.parent/'one-crossing-over-locus-marker-remedy-v1'; BASE=B.parent/'six-targeted-phone-and-population-remedies-v1/neutral-all23-current-selected-images-with-six-targeted-successors.author-review.entry.json'
def read(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p); p=p.relative_to(ROOT) if p.is_absolute() else p; z=p.read_bytes();assert not p.is_symlink();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(z).hexdigest(),'bytes':len(z)}
def relative_paths(z):
 if isinstance(z,dict):return {k:relative_paths(v) for k,v in z.items()}
 if isinstance(z,list):return [relative_paths(x) for x in z]
 if isinstance(z,str) and z.startswith(str(ROOT)+'/'):return z[len(str(ROOT))+1:]
 return z
def write(p,z):assert not p.exists();p.write_text(json.dumps(z,ensure_ascii=False,indent=2)+'\n')
prior=read(BASE); original=read(OLD/'neutral-one-current-crossing-over-marker-raster-successor.author-review.entry.json');z=relative_paths(original['images'][0]);assert z['ordinal']==15
receipt=B/'actual-selected-imagegen-v2.portable-provenance.receipt.json'
write(receipt,{'tool':'image_gen__imagegen','provider':'built-in ChatGPT/Codex image_gen','model':None,'rawGeneratedOutput':z['actualGenerationProvenance']['rawGeneratedOutput'],'savedAsset':bind(OLD/'candidate-v2.png'),'dimensions':[1672,941],'originalEditPrompt':bind(OLD/'two-output-marker-restoration.edit-v2.original.prompt.en.md'),'referenceImage':bind(OLD/'candidate-v1.png'),'actualGenerationSucceeded':True,'generationSuccessIsNotApproval':True})
z['actualGenerationProvenance']=read(receipt);z['generationReceiptBinding']=bind(receipt)
prev=next(e for e in prior['images'] if e['ordinal']==15)
for k in ['wholeCurrentGoal','descriptionDe','altTextDe','resourceLinkCandidate']:assert z[k]==prev[k]
whole=copy.deepcopy(prior)
for key in ['entries','images']:
 whole[key]=[copy.deepcopy(z) if e['ordinal']==15 else copy.deepcopy(e) for e in prior[key]]
 for a,b in zip(prior[key],whole[key]):
  if a['ordinal']!=15:assert a==b
  assert a['wholeCurrentGoal']==b['wholeCurrentGoal']
whole.update({'role':'Neutral current23 selected rasters; exactly one current marker-remedy successor, no review outcome','preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'predecessorCurrent23ImageEntry':bind(BASE),'currentScienceV7Entry':relative_paths(original['currentScienceV7Entry']),'changedImageGoalIds':[z['goalId']],'retention':{'other22WholeImageEntriesExactPredecessor':True,'all23WholeGoalObjectsExactPredecessor':True,'allOldRastersPromptsFirstSealsPreserved':True},'independentCurrentOneVReviewPending':True,'targetedOneNativeFollowupPending':True,'activeWrites':0,'strictGain':0,'humanApproval':False})
wp=B/'neutral-all23-current-selected-images-with-one-marker-successor.author-review.entry.json';write(wp,whole)
ep=B/'neutral-one-current-crossing-over-marker-raster-successor.author-review.entry.json';write(ep,{'schemaVersion':1,'role':'Neutral one actual crossing-over marker raster successor, independent review pending, no author or peer verdict text','preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'images':[z],'entries':[copy.deepcopy(z)],'wholeCurrent23Entry':bind(wp),'currentScienceV7Entry':relative_paths(original['currentScienceV7Entry']),'predecessorCurrent23Entry':bind(BASE),'other22WholeImageEntriesExact':True,'all23WholeGoalObjectsExact':True,'descriptionAltAndResourceLinkSemanticsExactPredecessor':True,'previousNative23AndNative6FirstSealsImmutable':True,'independentReviewsPending':True,'humanApproval':False,'activeWrites':0,'strictGain':0})
write(B/'portable-input-path-successor.actual.json',{'purpose':'Technical path normalization only; all selected PNG bytes and goal/caption/profile semantics unchanged. Initial absolute repository paths in first author entry preserved as actual failed technical output; current operative bindings relative.','historicalFirstEntry':bind(OLD/'neutral-one-current-crossing-over-marker-raster-successor.author-review.entry.json'),'historicalFirstSeal':bind(OLD/'one-crossing-over-marker-raster-and-current23.author.first.freeze.json'),'earlierAuthorObservationHoldRetained':bind(OLD/'generation-v2.actual-author-hold.receipt.json'),'actualAdditiveObservationCorrectionRetained':bind(OLD/'actual-author-marker-inventory-and-observation-correction.json'),'selectedRaster':bind(OLD/'candidate-v2.png'),'actualImageGenerationCountInThisSuccessor':0,'independentApproval':False,'activeWrites':0})
assert all(not p.is_symlink() for p in B.rglob('*'))
for p in B.rglob('*.json'):read(p)
paths=[str(p) for p in B.rglob('*') if p.is_file()];c=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(paths)+'\n',text=True,capture_output=True);assert c.returncode==1,c.stdout
errors=curriculum_symlink_errors(Path('curricula'));assert not errors,errors
write(B/'normal-current-relative-paths-and-symlink-check.actual.json',{'currentImagesPathsRelative':not z['path'].startswith('/'),'currentResourceBindingsRelative':True,'other22WholeImageEntriesLiteralExact':True,'all23WholeGoalsExact':True,'currentPNGBytesUnchanged':True,'JSONParse':True,'gitCheckIgnoreExit':c.returncode,'ordinaryCurriculumSymlinkErrors':errors,'activeWrites':0})
sp=B/'one-crossing-over-marker-raster-and-current23.author.first.freeze.json'; inputs=[bind(BASE),bind(OLD/'one-crossing-over-marker-raster-and-current23.author.first.freeze.json'),bind(OLD/'candidate-v2.png'),bind(OLD/'candidate-v2.author-view-360.png'),bind(OLD/'candidate-v2.author-view-680.png'),bind(OLD/'two-output-marker-restoration.edit-v2.original.prompt.en.md'),bind(OLD/'reconstruction-v2.actual-seen-marker-corrected.de.md')]
write(sp,{'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Actual current portable author first seal; independent reviews pending','inputs':inputs,'outputs':[bind(p) for p in sorted(B.rglob('*')) if p.is_file()],'independentApproval':False,'humanApproval':False,'activeWrites':0,'strictGain':0})
print(json.dumps({'neutralEntry':bind(ep),'current23':bind(wp),'firstSeal':bind(sp),'selectedRaster':bind(OLD/'candidate-v2.png')}))

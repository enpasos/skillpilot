from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,shutil,subprocess
ROOT=Path.cwd().resolve();REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-prospective-book-current-v1');OWN=ROOT/REL;ISO=ROOT/'tmp/chemie-b014-five-native-isolated-20261005-v1'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,x):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'prepared.freeze.manifest.json').exists(),'No overwrite of a frozen native preparation'
terminal=read(OWN/'final-native-preparation.terminal.receipt.json');assert terminal['status']=='PASS_native_exact_future_current_six_page_preparation'
baseline=read(OWN/'isolation-and-native-code-baseline.receipt.json');code=[]
for row in baseline['nativeAppScriptsAndRootScriptsCopiedUnmodified']:
 if Path(row['path']).suffix not in ['.ts','.mts','.cts','.mjs','.cjs','.js']:continue
 assert sha(ROOT/row['path'])==row['sha256']==sha(ISO/row['path'])
 code.append({'path':row['path'],'sha256':row['sha256'],'nativeCodeUnchanged':True})
assert all(sha(ROOT/r['path'])==r['baselineSHA256'] for r in baseline['mutableInputsDetachedBeforeWrite'])
for id in ['16da6a4d-8e9c-5f5d-b69d-338d67a2d362','efa24b77-0f98-5835-9d82-3e539ab20253']:
 rel=f'curricula/DE/Gymnasium/visualizations/chemie/{id}/prompt.de.md'
 head=subprocess.run(['git','show','HEAD:'+rel],capture_output=True,check=True).stdout
 assert (ROOT/rel).read_bytes()==head and not (ISO/rel).is_symlink()
codehash=hashlib.sha256(json.dumps(code,sort_keys=True,separators=(',',':')).encode()).hexdigest()
write(OWN/'whole-native-codehash-and-active-boundary.receipt.json',{'status':'PASS_unmodified_native_code_and_restored_historical_prompt_bytes','nativeCodeFileCount':len(code),'aggregateSHA256':codehash,'allNativeCodeFiles':code,'allThreeActiveCanonQASemanticInputsUnchanged':True,'twoUnintendedHistoricalPromptWriteEventsRepairedAndDisclosed':True,'promptErratumPath':str(REL/'prompt-and-KEEP-render-isolation.erratum.receipt.json'),'allCurrentActiveHistoricalPromptBytesEqualHEAD':True,'prospectivePromptLeavesAreDetachedRealFiles':True,'activeCanonicalWrites':0,'activeQARecordWrites':0,'activeAssetPixelWrites':0,'strictNetDelta':0})
atlas=read(ISO/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json');projection=read(ISO/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json');mapping=read(OWN/'two-he-source-clause-before-after.candidate.json')
paths=[r['path'] for r in baseline['mutableInputsDetachedBeforeWrite']]+['app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json',atlas['manifestPath'],atlas['navigationViewPath'],atlas['outputDirectory']+'/source-projection.receipt.json',mapping['futureActiveMappingPath'],'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json']+projection['sourcePaths']
for id in ['16da6a4d-8e9c-5f5d-b69d-338d67a2d362','02634fdd-c8ba-591a-b240-77129b1bebb8','efa24b77-0f98-5835-9d82-3e539ab20253']:
 paths.extend([f'curricula/DE/Gymnasium/visualizations/chemie/{id}/{id}.png',f'app/public/assets/goal-visualizations/chemie/{id}/{id}.png',f'backend/src/main/resources/static/assets/goal-visualizations/chemie/{id}/{id}.png',f'curricula/DE/Gymnasium/visualizations/chemie/{id}/prompt.de.md'])
files=[]
for rel in sorted(set(paths)):
 source=ISO/rel;target=OWN/'prospective-input-tree'/rel;target.parent.mkdir(parents=True,exist_ok=True);assert not target.exists();shutil.copy2(source,target);assert sha(source)==sha(target)
 files.append({'futureActivePath':rel,'prospectiveCopyPath':str(target.relative_to(ROOT)),'sha256':'sha256:'+sha(source),'bytes':source.stat().st_size})
write(OWN/'prepared-prospective-input-tree.receipt.json',{'status':'inactive_prepared_exact_future_paths','isolationRoot':str(ISO),'files':files,'fileCount':len(files),'activeCanonQASemanticWrites':0,'priorUnintendedPromptEventsDisclosedInErratum':2,'strictNetDelta':0})
model=read(OWN/'native-finalbook/bundle/book-model.json');pdf=[]
for physical,page in enumerate(model['pages'],start=3):
 raster=OWN/f'actual-final-pdf-page-{physical}.png';assert raster.exists()
 pdf.append({'physicalPage':physical,'goalId':page['goalId'],'actualRasterPath':str(raster.relative_to(ROOT)),'sha256':'sha256:'+sha(raster),'actuallyViewed':True,'wholeGoalPagePresent':True,'mainImageAndDescriptionNotCropped':True})
write(OWN/'actual-final-six-pdf-pages-viewed.receipt.json',{'status':'PASS_actual_native_rendered_six_page_layout_view','renderMethod':'pdftoppm -f3 -l8 -scale-to1100 -png; view_image actual six PNGs','nativePDFPath':str(REL/'native-finalbook/bundle/book.pdf'),'nativePDFSHA256':'sha256:'+sha(OWN/'native-finalbook/bundle/book.pdf'),'views':pdf,'layoutViewIsNotIndependentDescriptionOrVisualizationApproval':True,'independentImageDecisionsHaveTheirOwnExactReceipts':True,'activeWritesDuringThisView':0,'humanApproval':False})
allfiles=[]
for path in sorted(OWN.rglob('*')):
 if not path.is_file() or path.name in ['prepared.freeze.manifest.json','prepared.freeze.manifest.sha256']:continue
 relative=path.relative_to(OWN)
 if any(part in ['results','resolutions'] for part in relative.parts):continue
 allfiles.append({'path':str(path.relative_to(ROOT)),'sha256':'sha256:'+sha(path),'bytes':path.stat().st_size})
freeze={'status':'FROZEN_NATIVE_PROSPECTIVE_SIX_REVIEW_TARGET_INPUTS','authority':'informed_native_preparation_ai_candidate','preparedAtUTC':datetime.now(timezone.utc).isoformat(),'ownFiles':allfiles,'immutableFutureInputFiles':len(files),'nativeCodeFileCount':len(code),'nativeCodeAggregateSHA256':codehash,'nativeBaseModelDigest':terminal['nativeBaseModelDigest'],'nativeModelDigest':terminal['nativeModelDigest'],'nativeBundleFingerprint':terminal['nativeBundleFingerprint'],'nativeReviewInputFingerprint':terminal['nativeReviewInputFingerprint'],'newScientificCandidateGoalIds':terminal['newScientificCandidateGoalIds'],'existingTargetedBindingGoalIds':terminal['existingTargetedBindingGoalIds'],'currentAtomicDenominator':376,'exactFutureCanonicalPath':terminal['exactFutureCanonicalPath'],'independentFinalDReviewsPending':True,'reviewerResultsExcludedFromPreparedInputFreeze':True,'PContentsAbsent':True,'PIntegrationPending':True,'strictNetActual':0,'scientificClosuresActual':0,'restoredBindingsActual':0,'humanApproval':False,'activeCanonQASemanticRegistryLedgerDeckOrAssetPixelWrites':0,'unintendedHistoricalPromptWrites':2,'historicalPromptBytesRestoredToExactHEAD':True,'promptIsolationErratumPath':str(REL/'prompt-and-KEEP-render-isolation.erratum.receipt.json')}
write(OWN/'prepared.freeze.manifest.json',freeze);digest=sha(OWN/'prepared.freeze.manifest.json');(OWN/'prepared.freeze.manifest.sha256').write_text(digest+'\n')
print(json.dumps({'status':freeze['status'],'ownPreparedArtifacts':len(allfiles),'exactFutureInputFiles':len(files),'nativeCodeFiles':len(code),'preparedFreezeSHA256':digest,'nativeModelDigest':terminal['nativeModelDigest'],'nativeBundleFingerprint':terminal['nativeBundleFingerprint'],'strictNetActual':0}))

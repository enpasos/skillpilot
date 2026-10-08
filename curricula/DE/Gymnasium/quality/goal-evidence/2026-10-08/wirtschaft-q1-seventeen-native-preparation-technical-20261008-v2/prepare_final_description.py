"""Apache-2.0. Native physical Q1 preparation and byte-exact inert return."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, os, shutil, subprocess

ROOT=Path(__file__).resolve().parents[7]
OWN=Path(__file__).resolve().parent
REL=OWN.relative_to(ROOT)
AUTHOR=OWN.parent/'wirtschaft-q1-first-three-clusters-seventeen-bilingual-positive-author-v3'
IMAGES=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-q1-seventeen-image-author-20261008-v1'
SELECTION=IMAGES/'independent-review/independent-q1-seventeen-image-final-selection.receipt.json'
CLOSURE=OWN.parent/'wirtschaft-q1-seventeen-independent-positive-parity-review-v1/independent-two-findings-current-v2-closure.receipt.json'
BASE='curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1'
CANONICAL='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'

def read(path): return json.loads(path.read_text())
def sha(path): return 'sha256:'+hashlib.sha256(path.read_bytes()).hexdigest()
def write(path,value):
 path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')

def main():
 freeze=OWN/'native-d-q1-seventeen-final.prepared-freeze.actual.json'
 assert not freeze.exists(),'Preserve existing final preparation; use a separate version for new candidate inputs.'
 assert read(CLOSURE)['remainingCurrentTextFindings']==0
 assert sha(OWN.parent/'wirtschaft-q1-first-three-clusters-seventeen-bilingual-positive-author-v2/whole-goals.candidate.json')==read(CLOSURE)['inputWholeGoalsSha256']
 assert (AUTHOR/'positive.candidates.json').read_bytes()==(OWN.parent/'wirtschaft-q1-first-three-clusters-seventeen-bilingual-positive-author-v2/positive.candidates.json').read_bytes()
 taxonomy_receipt=OWN.parent/'wirtschaft-q1-two-demand-level-author-v1/independent-root-two-whole-goal-taxonomy-review.actual.json'
 assert taxonomy_receipt.exists(), 'Wait for the actual independent two-goal taxonomy review receipt'
 taxonomy_review=read(taxonomy_receipt)
 assert taxonomy_review['fieldsAccepted']==2 and all(row['decision']=='accept_bounded_AB2_taxonomy' and row['actualWholeGoalRead'] for row in taxonomy_review['rows'])
 reviewed_two_path=OWN.parent/'wirtschaft-q1-two-demand-level-author-v1/whole-goals.candidate.json'
 accepted_two={g['id']:g for g in read(reviewed_two_path)}
 current_whole={g['id']:g for g in read(AUTHOR/'whole-goals.candidate.json')}
 assert set(accepted_two)=={row['goalId'] for row in taxonomy_review['rows']}
 assert all(current_whole[gid]==g for gid,g in accepted_two.items())
 taxonomy_am_receipt=OWN.parent/'wirtschaft-q1-two-demand-level-author-v1/independent-root-two-taxonomy-AM-impact.actual.json'
 assert set(read(taxonomy_am_receipt)['goalIds'])==set(accepted_two)
 assert read(CLOSURE)['acceptedCurrentTextProfiles']==17 and read(CLOSURE)['acceptedCurrentGoalTranslationPairs']==17
 # The independently corrected EN724 is intentionally a successor; image review binds unchanged DE.
 current_goal_map={g['id']:g for g in read(AUTHOR/'whole-goals.candidate.json')}
 for item in read(SELECTION)['currentSelectedAssets']:
  image_review=read(ROOT/item['reviewReceiptPath']);g=current_goal_map[item['goalId']]
  assert image_review['goalTitle']==g['title'] and image_review['goalDescription']==g['description']
 isolate=Path(read(OWN/'physical-isolate.initial.actual.json')['physicalIsolate'])
 assert isolate.is_dir() and not isolate.is_symlink()
 imported=read(OWN/'final-image-import-positive-binding.actual.json')
 assert imported['selectedActualAssetCount']==17 and imported['machineApprovedCurrentImages']==17
 selected=read(SELECTION)['currentSelectedAssets']; ids=read(AUTHOR/'goal-ids.json')
 assert [s['goalId'] for s in selected]==ids
 config={
  '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
  'schemaVersion':1,'batchId':'wirtschaft-q1-seventeen-current303-final-author-v3-20261008',
  'subject':'wirtschaftswissenschaften','subjectLabel':'Wirtschaftswissenschaften',
  'bookId':'de-gym-wirtschaft-q1-seventeen-current303-final-author-v3-20261008',
  'title':'Wirtschaftswissenschaften Q1: 17 aktuelle Lernziele zu Verfassung, Demokratie und Wirtschaftspolitik',
  'baseGoalBookConfigPath':BASE+'/review-book-full.config.json','goalIds':ids,
  'outputDirectory':str(REL/'native-d-q1-seventeen-final'),
  'feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback',
  'promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
  'criteriaPath':str(AUTHOR.relative_to(ROOT)/'authoring-review.criteria.md'),
  'printDerivativeProfile':'bounded-atlas'}
 config_rel=REL/'native-d-q1-seventeen.final.batch.config.json'
 write(OWN/config_rel.name,config);write(isolate/config_rel,config)
 logs=OWN/'actual-native-d-preparation-logs'; logs.mkdir(exist_ok=True)
 previous=read(OWN.parent/'wirtschaft-e2-twenty-native-preparation-technical-20261008-v2/actual-native-d-preparation-logs/command-results.actual.json')[0]
 binary=Path(previous['environmentPathPrefix']);library=Path(previous['environmentLibraryPathPrefix'])
 assert (binary/'pdfinfo').exists() and (binary/'pdftohtml').exists()
 env=os.environ.copy();env['PATH']=str(binary)+os.pathsep+env.get('PATH','');env['LD_LIBRARY_PATH']=str(library)+os.pathsep+env.get('LD_LIBRARY_PATH','')
 runs=[]
 if (logs/'command-results.actual.json').exists():
  runs=read(logs/'command-results.actual.json')
  assert len(runs)==2 and all(r['actualExitCode']==0 for r in runs), 'Existing native preparation incomplete'
  assert [r['command'][2] for r in runs]==['prepare','check']
 for action in ([] if runs else ['prepare','check']):
  command=['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts',action,'--config',str(config_rel)]
  started=datetime.now(timezone.utc).isoformat();result=subprocess.run(command,cwd=isolate,env=env,capture_output=True,text=True)
  (logs/(action+'.stdout.txt')).write_text(result.stdout);(logs/(action+'.stderr.txt')).write_text(result.stderr)
  runs.append({'command':command,'cwd':str(isolate),'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),'actualExitCode':result.returncode,'environmentPathPrefix':str(binary),'environmentLibraryPathPrefix':str(library)})
  write(logs/'command-results.actual.json',runs)
  assert result.returncode==0,result.stdout+'\n'+result.stderr
 output_rel=Path(config['outputDirectory']);source=isolate/output_rel;target=ROOT/output_rel
 if not target.exists(): shutil.copytree(source,target)
 files=[]
 for p in target.rglob('*'):
  if p.is_file():
   assert sha(p)==sha(source/p.relative_to(target))
   files.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size})
 model=read(target/'bundle/book-model.json');manifest=read(target/'bundle/manifest.json');render=read(target/'bundle/book.pdf.render-manifest.json')
 assert len(model['pages'])==17
 assets={asset['publicPath']:asset for asset in render['assets']}
 proof=[]
 for s,page in zip(selected,model['pages']):
  assert page['goalId']==s['goalId']
  v=page['visualization'];r=assets[v['url']]
  assert v['originalDigest']==s['assetSha256']==r['sourceSha256']
  assert sha(ROOT/s['assetPath'])==s['assetSha256'] and sha(ROOT/s['reviewReceiptPath'])==s['reviewReceiptSha256']
  assert v['approvedForPublication'] is False
  assert page['evidenceReview'] is None,'No legacy-v1 profile should be invented in the book.'
  proof.append({'goalId':page['goalId'],'pageNumber':page['pageNumber'],'goalFingerprint':page['goalFingerprint'],'pageFingerprint':page['pageFingerprint'],'imageUrl':v['url'],'sourceAssetSha256':v['originalDigest'],'nativePdfRenderedDerivativeSha256':r['renderedSha256'],'reviewReceiptPath':s['reviewReceiptPath'],'reviewReceiptSha256':s['reviewReceiptSha256'],'bookHumanPublicationStatus':v['qaStatus'],'approvedForPublication':False})
 write(freeze,{'schemaVersion':1,'role':'technical_preparer','actualFreezeAt':datetime.now(timezone.utc).isoformat(),'physicalIsolate':str(isolate),'nativePrepareActualExitCode':runs[0]['actualExitCode'],'nativeCheckActualExitCode':runs[1]['actualExitCode'],'nativeCommandReceiptPath':str((logs/'command-results.actual.json').relative_to(ROOT)),'batchId':config['batchId'],'bundleFingerprint':manifest['bundleFingerprint'],'bookModelDigest':manifest['bookModelDigest'],'curriculumAtomicDenominatorAtPreparation':303,'frozenGoalCount':17,'currentReviewedAssessmentOverlayReceipt':str((OWN/'author-and-assessment-context.actual.json').relative_to(ROOT)),'independentPositiveCorrectionClosurePath':str(CLOSURE.relative_to(ROOT)),'independentPositiveCorrectionClosureSha256':sha(CLOSURE),'independentDemandLevelReviewPath':str(taxonomy_receipt.relative_to(ROOT)),'independentDemandLevelReviewSha256':sha(taxonomy_receipt),'independentDemandLevelAMImpactPath':str(taxonomy_am_receipt.relative_to(ROOT)),'independentDemandLevelAMImpactSha256':sha(taxonomy_am_receipt),'reviewedTwoWholeCandidateSha256':sha(reviewed_two_path),'nativeCurrentPositiveCandidateCount':17,'nativeCurrentPositiveRecordSha256':sha(OWN/'positive-final-images.records.candidate.jsonl'),'nativeCurrentPositiveRequireApproved':False,'actualSourcePngToNativeBookProof':proof,'byteExactReturnedNativeFiles':files,'legacyBookEvidenceReviewPaths':[],'positiveV2ProfilesInDescriptionBook':False,'positiveV2EvidenceLane':'Separate native actual final-image/source-bound candidates, independently substantively accepted.','independentReviewsPerformedByPreparation':0,'activeWrites':0,'newStrictClosures':0,'humanReleaseGatePreserved':True})
 print(json.dumps({'physicalIsolate':str(isolate),'nativePrepareExit':0,'nativeCheckExit':0,'frozenGoalCount':17,'bundleFingerprint':manifest['bundleFingerprint'],'bookModelDigest':manifest['bookModelDigest'],'returnedByteExactFiles':len(files),'activeWrites':0}))

if __name__=='__main__': main()

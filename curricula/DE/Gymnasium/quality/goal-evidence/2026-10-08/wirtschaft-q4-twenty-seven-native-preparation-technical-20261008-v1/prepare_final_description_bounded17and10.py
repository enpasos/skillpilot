"""Apache-2.0. Native physical Q1 preparation and byte-exact inert return."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, os, shutil, subprocess

ROOT=Path(__file__).resolve().parents[7]
OWN=Path(__file__).resolve().parent
REL=OWN.relative_to(ROOT)
AUTHOR=OWN.parent/'wirtschaft-q4-development-ethics-twenty-seven-bilingual-positive-author-v2'
IMAGES=ROOT/'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-q4-twenty-seven-image-author-20261008-v1'
SELECTION=IMAGES/'independent-final-twenty-seven-selection-v1/actual-final-twenty-seven-KEEP-selection.receipt.json'
CLOSURE=OWN.parent/'wirtschaft-q4-twenty-seven-independent-positive-source-AM-review-v1/targeted-fed15-whole-bilingual-profile-v2-closure.actual.json'
BASE='curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1'
CANONICAL='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'

def read(path): return json.loads(path.read_text())
def sha(path): return 'sha256:'+hashlib.sha256(path.read_bytes()).hexdigest()
def write(path,value):
 path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')

def prepare_one(label,count,start,end):
 freeze=OWN/('native-d-'+label+'-final.prepared-freeze.actual.json')
 assert not freeze.exists(),'Preserve existing final preparation; use a separate version for new candidate inputs.'
 closure=read(CLOSURE)
 assert closure['currentWholeProfilesIndependentAccepted']==27 and closure['humanApprovalClaimed'] is False
 assert sha(AUTHOR/'positive.candidates.json')==closure['newPositiveCandidateSha256']
 assert (OWN.parent/'wirtschaft-q4-development-ethics-twenty-seven-bilingual-positive-author-v1/whole-goals.candidate.json').read_bytes()==(AUTHOR/'whole-goals.candidate.json').read_bytes()
 assert sha(SELECTION)=='sha256:a1f2c1e5bf11178143b8f0e4070fe7e262f10aeace07beda9800e33e4c763a8e'
 all_ids=read(AUTHOR/'goal-ids.json')
 selected_all=[{'goalId':s['goalId'],'assetPath':s['candidatePath'],'assetSha256':s['assetSha256'],'reviewReceiptPath':s['independentReceiptPath'],'reviewReceiptSha256':s['independentReceiptSha256']} for s in read(SELECTION)['selection']]
 assert len(selected_all)==27 and {s['goalId'] for s in selected_all}==set(all_ids)
 selected_all.sort(key=lambda s:all_ids.index(s['goalId']))
 isolate=Path(read(OWN/'physical-isolate.initial.actual.json')['physicalIsolate'])
 assert isolate.is_dir() and not isolate.is_symlink()
 imported=read(OWN/'final-image-import-positive-binding.actual.json')
 assert imported['selectedActualAssetCount']==27 and imported['machineApprovedCurrentImages']==27
 all_ids=read(AUTHOR/'goal-ids.json');ids=all_ids[start:end]
 selected=[r for r in selected_all if r['goalId'] in set(ids)]
 assert len(ids)==count
 assert [s['goalId'] for s in selected]==ids
 config={
  '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
  'schemaVersion':1,'batchId':'wirtschaft-'+label+'-current303-final-author-v2-20261008',
  'subject':'wirtschaftswissenschaften','subjectLabel':'Wirtschaftswissenschaften',
  'bookId':'de-gym-wirtschaft-'+label+'-current303-final-author-v2-20261008',
  'title':'Wirtschaftswissenschaften Q4: '+str(count)+' aktuelle Lernziele zu '+('Entwicklung und Globalisierung, Teil1' if count==17 else 'Entwicklung und Ethik, Teil2'),
  'baseGoalBookConfigPath':BASE+'/review-book-full.config.json','goalIds':ids,
  'outputDirectory':str(REL/('native-d-'+label+'-final')),
  'feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback',
  'promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
  'criteriaPath':str(AUTHOR.relative_to(ROOT)/'authoring-review.criteria.md'),
  'printDerivativeProfile':'bounded-atlas'}
 config_rel=REL/('native-d-'+label+'.final.batch.config.json')
 write(OWN/config_rel.name,config);write(isolate/config_rel,config)
 logs=OWN/('actual-native-d-preparation-logs-'+label); logs.mkdir(exist_ok=True)
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
 assert len(model['pages'])==count
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
 write(freeze,{'schemaVersion':1,'role':'technical_preparer','actualFreezeAt':datetime.now(timezone.utc).isoformat(),'physicalIsolate':str(isolate),'nativePrepareActualExitCode':runs[0]['actualExitCode'],'nativeCheckActualExitCode':runs[1]['actualExitCode'],'nativeCommandReceiptPath':str((logs/'command-results.actual.json').relative_to(ROOT)),'batchId':config['batchId'],'bundleFingerprint':manifest['bundleFingerprint'],'bookModelDigest':manifest['bookModelDigest'],'curriculumAtomicDenominatorAtPreparation':303,'frozenGoalCount':count,'currentReviewedAssessmentOverlayReceipt':str((OWN/'author-and-assessment-context.actual.json').relative_to(ROOT)),'independentPositiveCorrectionClosurePath':str(CLOSURE.relative_to(ROOT)),'independentPositiveCorrectionClosureSha256':sha(CLOSURE),'nativeCurrentPositiveCandidateCount':27,'nativeCurrentPositiveRecordSha256':sha(OWN/'positive-final-images.records.candidate.jsonl'),'nativeCurrentPositiveRequireApproved':False,'actualSourcePngToNativeBookProof':proof,'byteExactReturnedNativeFiles':files,'legacyBookEvidenceReviewPaths':[],'positiveV2ProfilesInDescriptionBook':False,'positiveV2EvidenceLane':'Separate native actual final-image/source-bound candidates, independently substantively accepted.','independentReviewsPerformedByPreparation':0,'activeWrites':0,'newStrictClosures':0,'humanReleaseGatePreserved':True})
 print(json.dumps({'physicalIsolate':str(isolate),'nativePrepareExit':0,'nativeCheckExit':0,'frozenGoalCount':count,'bundleFingerprint':manifest['bundleFingerprint'],'bookModelDigest':manifest['bookModelDigest'],'returnedByteExactFiles':len(files),'activeWrites':0}))

if __name__=='__main__':
 prepare_one('q4-development-seventeen',17,0,17)
 prepare_one('q4-ethics-development-ten',10,17,27)
 freezes=[];files=[]
 for label in ['q4-development-seventeen','q4-ethics-development-ten']:
  path=OWN/('native-d-'+label+'-final.prepared-freeze.actual.json');r=read(path)
  freezes.append({'path':str(path.relative_to(ROOT)),'sha256':sha(path),'frozenGoalCount':r['frozenGoalCount'],'bundleFingerprint':r['bundleFingerprint'],'bookModelDigest':r['bookModelDigest']});files.extend(r['byteExactReturnedNativeFiles'])
 assert len(files)==56
 with(OWN/'native-d-q4-bounded17-and10.prepared-package.actual.json').open('x')as stream:
  stream.write(json.dumps({'schemaVersion':1,'role':'technical_bounded_prepared_package','createdAt':datetime.now(timezone.utc).isoformat(),'physicalIsolate':str(Path(read(OWN/'physical-isolate.initial.actual.json')['physicalIsolate'])),'currentGoalCount':27,'nativeBatchGoalCounts':[17,10],'nativeMaximumBatchSizeRespected':20,'actualPrepareAndChecksPassed':4,'frozenBatches':freezes,'byteExactReturnedNativeFiles':files,'positiveFinalCurrentAiCandidates':27,'positiveV2InDescriptionBook':False,'independentReviewsPerformedByPreparation':0,'activeWrites':0,'newStrictClosures':0,'humanReleaseGatePreserved':True},ensure_ascii=False,indent=2)+'\n')
 print('Q4 same27currentgoals: bounded17+10nativeprepare/checkPASS;56returnednativefilesbyteexact;0independentreviews/strictgrowth.')

"""Apache-2.0. Separate physical native EEF candidate; no active writes/review claims."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib,json,os,shutil,subprocess,tempfile
ROOT=Path(__file__).resolve().parents[7]
AUTHOR=Path(__file__).resolve().parent
OWN=AUTHOR.parent/'wirtschaft-e2-bias-concept-clarification-native-preparation-20261008-v1'
REL=OWN.relative_to(ROOT)
BASE='curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1'
CANONICAL='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json'
OLD=AUTHOR.parent/'wirtschaft-e2-twenty-native-preparation-technical-20261008-v2'
POSITIVE_AUTHOR=AUTHOR.parent/'wirtschaft-e2-twenty-bilingual-positive-author-v2'
GID='eef95305-c811-50a4-9157-bfd4e5780c24'

def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')

def main():
 OWN.mkdir(exist_ok=False);started=datetime.now(timezone.utc).isoformat()
 isolate=Path(tempfile.mkdtemp(prefix='skillpilot-wirtschaft-e2-bias-concept-native-'))
 copied=[]
 def copy(p):
  target=isolate/p.relative_to(ROOT);target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target);assert sha(p)==sha(target);copied.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size})
 for folder in ['app/scripts','app/src','contracts']:
  shutil.copytree(ROOT/folder,isolate/folder)
  for target in (isolate/folder).rglob('*'):
   if target.is_file():
    source=ROOT/target.relative_to(isolate);assert sha(source)==sha(target);copied.append({'path':str(source.relative_to(ROOT)),'sha256':sha(source),'bytes':source.stat().st_size})
 (isolate/'app/node_modules').symlink_to(ROOT/'app/node_modules',target_is_directory=True)
 for name in ['app/package.json','app/tsconfig.json',CANONICAL,QA,BASE+'/review-book-full.config.json',BASE+'/review-full-canonical.view.json',BASE+'/wirtschaftswissenschaften.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md','LICENSING.md']:copy(ROOT/name)
 for p in [AUTHOR/'whole-goal.original.json',AUTHOR/'whole-goal.candidate.json',AUTHOR/'author-clarification.actual.json',OLD/'positive-final-images.candidate.config.json',OLD/'positive-final-images.records.candidate.jsonl',OLD/'native-d-e2-twenty.final.batch.config.json',OLD/'native-d-e2-twenty-final/bundle/book-model.json',OLD/'native-d-e2-twenty-final/round-a/description-review-input.json',POSITIVE_AUTHOR/'positive.candidates.json',POSITIVE_AUTHOR/'authoring-review.criteria.md',POSITIVE_AUTHOR/'goal-ids.json']:copy(p)
 qa=read(ROOT/QA);available=[r for r in qa['records'] if r['visualizationState']=='available'];assert len(available)==20
 for r in available:
  for key in ['canonicalAssetPath','publicAssetPath']:
   source=ROOT/r[key];assert sha(source)==r['assetSha256'];copy(source)
 (isolate/'app/public/assets/goal-visualizations/wirtschaftswissenschaften').mkdir(parents=True,exist_ok=True)
 current=read(isolate/CANONICAL);old=read(AUTHOR/'whole-goal.original.json');candidate=read(AUTHOR/'whole-goal.candidate.json');assert old['id']==candidate['id']==GID
 assert next(g for g in current['goals'] if g['id']==GID)==old,'Current full source changed after root author capture.'
 fields=sorted(k for k in set(old)|set(candidate) if old.get(k)!=candidate.get(k));assert fields==['description','descriptionEn','titleEn']
 for i,g in enumerate(current['goals']):
  if g['id']==GID:current['goals'][i]=candidate
 write(isolate/CANONICAL,current);write(OWN/'candidate-canonical.current20.inert.json',current)
 script_rel=REL/'native-compare-and-bind.mts';script=isolate/script_rel;script.parent.mkdir(parents=True,exist_ok=True)
 script.write_text("""// Unchanged native APIs; exact scope/context comparison, no review claim.
import { readFile,writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { loadGoalBookBuildInputs,stableGoalBookJson,fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
const cPath='"""+CANONICAL+"""', sPath='"""+BASE+"""/wirtschaftswissenschaften.semantic-kinds.json'
const landscape=JSON.parse(await readFile(cPath,'utf8')), semkind=JSON.parse(await readFile(sPath,'utf8'))
const goals=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const changed=[]
for(const decision of semkind.decisions){const next=fingerprintSemanticKindSourceGoal(goals.get(decision.goalId) as any);if(next!==decision.sourceFingerprint)changed.push(decision.goalId);decision.sourceFingerprint=next}
if(JSON.stringify(changed)!==JSON.stringify(['"""+GID+"""']))throw new Error('More than actual single source-semkind binding changed: '+JSON.stringify(changed))
await writeFile(sPath,JSON.stringify(semkind,null,2)+'\\n')
const base=await loadGoalBookBuildInputs('"""+BASE+"""/review-book-full.config.json')
const oldConfig=JSON.parse(await readFile('"""+str((OLD/'native-d-e2-twenty.final.batch.config.json').relative_to(ROOT))+"""','utf8'))
const model=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:oldConfig.goalIds,bookId:oldConfig.bookId,title:oldConfig.title})
const oldModel=JSON.parse(await readFile('"""+str((OLD/'native-d-e2-twenty-final/bundle/book-model.json').relative_to(ROOT))+"""','utf8'))
const oldInput=JSON.parse(await readFile('"""+str((OLD/'native-d-e2-twenty-final/round-a/description-review-input.json').relative_to(ROOT))+"""','utf8'))
const comparison=[]
for(let i=0;i<model.pages.length;i++){
 const page=model.pages[i],before=oldModel.pages[i],previous=oldInput.goals[i],g:any=goals.get(page.goalId)
 const unchangedPage=stableGoalBookJson(page)===stableGoalBookJson(before)
 const unchangedBilingual=['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn'].every((key,j)=>previous[key]===[g.title,g.titleEn,g.description,g.descriptionEn][j])
 const unchangedContext=stableGoalBookJson(buildGoalDescriptionCanonicalContext(g))===stableGoalBookJson(previous.canonicalContext)
 if(page.goalId!=='"""+GID+"""'&&!(unchangedPage&&unchangedBilingual&&unchangedContext))throw new Error('Affected neighbour requires actual targeted followup: '+page.goalId)
 comparison.push({goalId:page.goalId,unchangedPage,unchangedBilingual,unchangedContext,oldGoalFingerprint:before.goalFingerprint,newGoalFingerprint:page.goalFingerprint,oldPageFingerprint:before.pageFingerprint,newPageFingerprint:page.pageFingerprint})
}
await writeFile('"""+str(REL/'native-current20-model-comparison.inert.json')+"""',JSON.stringify(model,null,2)+'\\n')
await writeFile('"""+str(REL/'native-nineteen-retained-page-context-comparison.actual.json')+"""',JSON.stringify({role:'technical_preparer',checkedAt:new Date().toISOString(),nativeApis:['loadGoalBookBuildInputs','buildGoalDescriptionRolloutSubsetModel','buildGoalDescriptionCanonicalContext'],semanticKindSourceBindingChangedGoalIds:changed,comparison,retainedUnchangedGoals:comparison.filter(r=>r.goalId!=='"""+GID+"""').length,descriptionReviewsRepeated:0,independentReviewClaim:false,activeWrites:0},null,2)+'\\n')
console.log('Native source/page/bilingual/context comparison retains19; only EEF source binding changed. No D replay.')
""")
 copy(script) if script.is_relative_to(ROOT) else None
 shutil.copy2(script,OWN/script.name)
 logs=OWN/'actual-native-logs';logs.mkdir();runs=[]
 previous=read(OLD/'actual-native-d-preparation-logs/command-results.actual.json')[0];binary=previous['environmentPathPrefix'];library=previous['environmentLibraryPathPrefix'];env=os.environ.copy();env['PATH']=binary+os.pathsep+env.get('PATH','');env['LD_LIBRARY_PATH']=library+os.pathsep+env.get('LD_LIBRARY_PATH','')
 def run(name,command):
  start=datetime.now(timezone.utc).isoformat();result=subprocess.run(command,cwd=isolate,env=env,capture_output=True,text=True);(logs/(name+'.stdout.txt')).write_text(result.stdout);(logs/(name+'.stderr.txt')).write_text(result.stderr);runs.append({'name':name,'command':command,'cwd':str(isolate),'startedAt':start,'completedAt':datetime.now(timezone.utc).isoformat(),'actualExitCode':result.returncode,'nativePopplerBinaryPrefix':binary,'nativePopplerLibraryPrefix':library});write(logs/'command-results.actual.json',runs);assert result.returncode==0,result.stdout+'\n'+result.stderr
 tsx='app/node_modules/.bin/tsx';run('native-affected-scope-comparison',[tsx,str(script_rel)])
 pconfig=read(OLD/'positive-final-images.candidate.config.json');pconfig['reviewPath']=str(REL/'positive-current20-one-source-successor.records.candidate.jsonl');pconfig['scope']['label']='Economics current20 with one EEF source-binding successor; actual impact/visual parity review still required'
 pconfig_rel=REL/'positive-current20-one-source-successor.candidate.config.json';write(isolate/pconfig_rel,pconfig);write(OWN/pconfig_rel.name,pconfig)
 run('materialize-positive-current20-single-source-successor',[tsx,'app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',str(pconfig_rel),'--candidates',str((POSITIVE_AUTHOR/'positive.candidates.json').relative_to(ROOT)),'--write'])
 run('positive-current20-single-source-check',[tsx,'app/scripts/positiveGoalEvidenceReview.ts','--config='+str(pconfig_rel),'--mode=check'])
 before_lines=(OLD/'positive-final-images.records.candidate.jsonl').read_bytes().splitlines(keepends=True);after_lines=(isolate/pconfig['reviewPath']).read_bytes().splitlines(keepends=True);assert len(before_lines)==len(after_lines)==20;record_proof=[]
 for old_line,new_line in zip(before_lines,after_lines):
  before_record=json.loads(old_line);after_record=json.loads(new_line);assert before_record['goalId']==after_record['goalId'];changed_fields=sorted(k for k in set(before_record)|set(after_record) if before_record.get(k)!=after_record.get(k));assert before_record['profile']==after_record['profile']
  if before_record['goalId']!=GID:assert old_line==new_line and changed_fields==[]
  else:assert changed_fields==['goalFingerprint','reviewInputFingerprint']
  record_proof.append({'goalId':before_record['goalId'],'byteExactRetained':old_line==new_line,'changedBindingFields':changed_fields,'profileContentUnchanged':True})
 psource=isolate/pconfig['reviewPath'];shutil.copy2(psource,OWN/psource.name)
 write(OWN/'positive-current20-one-source-successor.actual.json',{'schemaVersion':1,'role':'technical_preparer','createdAt':datetime.now(timezone.utc).isoformat(),'sourceConfigPath':str((OLD/'positive-final-images.candidate.config.json').relative_to(ROOT)),'sourceConfigSha256':sha(OLD/'positive-final-images.candidate.config.json'),'sourceRecordsSha256':sha(OLD/'positive-final-images.records.candidate.jsonl'),'successorConfigPath':str((OWN/pconfig_rel.name).relative_to(ROOT)),'successorRecordsPath':str((OWN/psource.name).relative_to(ROOT)),'successorRecordsSha256':sha(OWN/psource.name),'preservedHistoricalReviewId':pconfig['reviewId'],'recordProof':record_proof,'byteExactRetainedRecords':19,'actualSourceBindingSuccessors':1,'unchangedPositiveProfileContents':20,'independentImpactReviewRequired':True,'machineImageRebindingClaim':False,'nativeCheckExitCode':0,'activeWrites':0,'strictDelta':0})
 old_batch=read(OLD/'native-d-e2-twenty.final.batch.config.json');dconfig={**old_batch,'batchId':'wirtschaft-e2-bias-concept-clarification-single-current303-20261008-v1','bookId':'de-gym-wirtschaft-e2-bias-concept-clarification-single-current303-20261008-v1','title':'Wirtschaftswissenschaften: ein aktuelles Lernziel zur Anwendung von Entscheidungsbias-Konzepten','goalIds':[GID],'outputDirectory':str(REL/'native-d-eef-single-final')};dconfig_rel=REL/'native-d-eef-single.final.batch.config.json';write(OWN/dconfig_rel.name,dconfig);write(isolate/dconfig_rel,dconfig)
 run('description-single-prepare',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',str(dconfig_rel)]);run('description-single-check',[tsx,'app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',str(dconfig_rel)])
 source_output=isolate/dconfig['outputDirectory'];root_output=ROOT/dconfig['outputDirectory'];shutil.copytree(source_output,root_output);returned=[]
 for p in root_output.rglob('*'):
  if p.is_file():assert sha(p)==sha(source_output/p.relative_to(root_output));returned.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size})
 for name in ['native-current20-model-comparison.inert.json','native-nineteen-retained-page-context-comparison.actual.json']:shutil.copy2(isolate/REL/name,OWN/name)
 write(OWN/'candidate-semkind.current20.inert.json',read(isolate/(BASE+'/wirtschaftswissenschaften.semantic-kinds.json')))
 manifest=read(root_output/'bundle/manifest.json');model=read(root_output/'bundle/book-model.json');eef_qa=next(r for r in qa['records'] if r['goalId']==GID);assert eef_qa['description']==old['description'];assert model['pages'][0]['visualization']['originalDigest']==eef_qa['assetSha256']
 write(OWN/'native-single.prepared-freeze.actual.json',{'schemaVersion':1,'role':'technical_preparer','actualFreezeAt':datetime.now(timezone.utc).isoformat(),'physicalIsolate':str(isolate),'actualCandidateGoalId':GID,'candidateWholeGoalPath':str((AUTHOR/'whole-goal.candidate.json').relative_to(ROOT)),'candidateWholeGoalSha256':sha(AUTHOR/'whole-goal.candidate.json'),'candidateFieldsExactly':fields,'batchId':dconfig['batchId'],'bundleFingerprint':manifest['bundleFingerprint'],'bookModelDigest':manifest['bookModelDigest'],'frozenGoals':1,'nativePrepareAndCheckExitCodes':[0,0],'retainedNativeUnchangedDescriptionPages':19,'oldHistoricalBundleUnchanged':True,'positiveProfilesUnchanged':20,'positiveRecordsByteExactRetained':19,'positiveSingleCurrentSourceBinding':1,'imageAssetSha256Unchanged':eef_qa['assetSha256'],'oldQaDescriptionPreservedPendingActualMotifReview':True,'candidateImageSourceApprovalRebindingClaim':False,'independentPAMAndImageImpactReviewPending':True,'independentDescriptionReviewsPerformed':0,'legacyBookEvidenceReviewPaths':[],'humanApprovalClaim':False,'byteExactReturnedNativeArtifacts':returned,'activeWrites':0,'newStrictClosures':0})
 write(OWN/'physical-isolate.initial.actual.json',{'role':'technical_preparer','startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),'physicalIsolate':str(isolate),'physicalCopies':copied,'nodeModulesDependencySymlinkOnly':True,'wholeHistoricalQualityDirectoriesCopied':False,'nativeCommands':runs,'sourceRootInputHashes':{'canonical':sha(ROOT/CANONICAL),'qa':sha(ROOT/QA),'semkind':sha(ROOT/(BASE+'/wirtschaftswissenschaften.semantic-kinds.json'))},'activeWrites':0,'independentReviewClaim':False})
 print(json.dumps({'physicalIsolate':str(isolate),'nativeFrozenGoals':1,'retainedNativePages':19,'retainedByteExactPRecords':19,'newCurrentPSourceBindings':1,'bundleFingerprint':manifest['bundleFingerprint'],'bookModelDigest':manifest['bookModelDigest'],'activeWrites':0,'allImpactAndDescriptionClosuresPending':True}))

if __name__=='__main__':main()

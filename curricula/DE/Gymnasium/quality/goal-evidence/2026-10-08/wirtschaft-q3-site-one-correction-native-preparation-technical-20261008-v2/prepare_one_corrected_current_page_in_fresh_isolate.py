# Apache-2.0. Native one-page corrected image context; no review approval and no historical overwrite.
from pathlib import Path
import json,hashlib,shutil,subprocess,os,datetime
root=Path('/home/enpasos/projects/skillpilot');iso=Path('/tmp/skillpilot-wirtschaft-q3-site-one-native-ivd5iuag');B=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08');own=B/'wirtschaft-q3-site-one-correction-native-preparation-technical-20261008-v2';prior=B/'wirtschaft-q3-twenty-three-native-preparation-technical-20261008-v1';gid='7f8f6648-6faa-52c5-9793-3654ef9dc36d'
read=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x')as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
assert read(root/own/'one-corrected-asset-and-positive-resource-successor.actual.json')['unchangedPriorPositiveRecordsByteExact']==22
script=own/'native-one-page-actual-whole-twenty-three-impact.mts';code="""// Apache-2.0. Actual entire twelve native pages compared; no source-locator lane invented.
import{readFile,writeFile}from'node:fs/promises'
import{loadGoalBookBuildInputs}from'../../../../../../../app/scripts/goalBookModel.ts'
import{buildGoalDescriptionRolloutSubsetModel}from'../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
const iso=ISOSTR,own=OWNSTR,prior=PRIORSTR,gid=GIDSTR
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'))
const comparisons:any[]=[]
for(const name of ['native-d-q3-global-currency-seventeen.final.batch.config.json','native-d-q3-europe-integration-six.final.batch.config.json']){
 const c=await read(prior+'/'+name),old=await read(c.outputDirectory+'/bundle/book-model.json'),base=await loadGoalBookBuildInputs(c.baseGoalBookConfigPath,iso)
 const current=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:c.goalIds,bookId:c.bookId,title:c.title})
 comparisons.push(...old.pages.map((p:any,i:number)=>({goalId:p.goalId,title:p.title,oldPageFingerprint:p.pageFingerprint,currentPageFingerprint:current.pages[i].pageFingerprint,entirePageByteEquivalent:JSON.stringify(p)===JSON.stringify(current.pages[i]),changedFields:Object.keys(p).filter(k=>JSON.stringify(p[k])!==JSON.stringify(current.pages[i][k]))})))
}
if(comparisons.length!==23)throw Error('Expected actual whole23 pages')
const changed=comparisons.filter((x:any)=>!x.entirePageByteEquivalent)
if(changed.length!==1||changed[0].goalId!==gid)throw Error(JSON.stringify(comparisons))
await writeFile(own+'/actual-one-corrected-and-twenty-two-unchanged-native-pages.receipt.json',JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),physicalIsolate:iso,currentRootStrictBaseline:125,wholePagesCompared:23,unchangedWholePages:22,changedWholePageGoalIds:[gid],actualComparisons:comparisons,source2Lane:'Actual current source2 correction independently reviewed and integrated by root; native D-v3 page contract contains no original sourceRef locators. Source-binding actual impact is separately retained.',independentSubstantiveReviewClaim:false,activeWrites:0},null,2)+String.fromCharCode(10),{flag:'wx'})
console.log('Actual native whole23 comparison: only7f page changed,22 byteequivalent.')
""".replace('ISOSTR',json.dumps(str(iso))).replace('OWNSTR',json.dumps(str(own))).replace('PRIORSTR',json.dumps(str(prior))).replace('GIDSTR',json.dumps(gid))
with(root/script).open('x')as f:f.write(code)
r=subprocess.run(['app/node_modules/.bin/tsx',str(script)],cwd=root,capture_output=True,text=True)
for k,t in[('stdout',r.stdout),('stderr',r.stderr)]:
 with(root/own/('actual-page-impact.'+k+'.txt')).open('x')as f:f.write(t)
assert r.returncode==0,r.stdout+r.stderr
oldcfg=read(root/prior/'native-d-q3-global-currency-seventeen.final.batch.config.json');cfg=dict(oldcfg,batchId='wirtschaft-q3-site-one-current303-corrected-image-v2-20261008',bookId='de-gym-wirtschaft-q3-site-one-current303-corrected-image-v2-20261008',title='Wirtschaftswissenschaften Q3: Standortvergleich nach gezielter Neutralisierung unbelegter Ratings',goalIds=[gid],outputDirectory=str(own/'native-d-q3-site-one-final-v2'))
config=own/'native-d-q3-site-one.final.batch.config.json';write(root/config,cfg);write(iso/config,cfg)
previous=read(root/B/'wirtschaft-e2-twenty-native-preparation-technical-20261008-v2/actual-native-d-preparation-logs/command-results.actual.json')[0];env=os.environ.copy();env['PATH']=previous['environmentPathPrefix']+os.pathsep+env.get('PATH','');env['LD_LIBRARY_PATH']=previous['environmentLibraryPathPrefix']+os.pathsep+env.get('LD_LIBRARY_PATH','');runs=[]
for action in['prepare','check']:
 command=['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts',action,'--config',str(config)];r=subprocess.run(command,cwd=iso,env=env,capture_output=True,text=True)
 for k,t in[('stdout',r.stdout),('stderr',r.stderr)]:
  with(root/own/(action+'.'+k+'.txt')).open('x')as f:f.write(t)
 runs.append({'action':action,'command':command,'workingDirectory':str(iso),'actualExitCode':r.returncode,'environmentPathPrefix':previous['environmentPathPrefix'],'environmentLibraryPathPrefix':previous['environmentLibraryPathPrefix']});assert r.returncode==0,r.stdout+r.stderr
source=iso/cfg['outputDirectory'];dest=root/cfg['outputDirectory'];shutil.copytree(source,dest);files=[]
for p in dest.rglob('*'):
 if p.is_file():
  assert sha(p)==sha(source/p.relative_to(dest));files.append({'path':str(p.relative_to(root)),'sha256':sha(p),'bytes':p.stat().st_size})
assert len(files)==28
model=read(dest/'bundle/book-model.json');manifest=read(dest/'bundle/manifest.json');page=model['pages'][0];assert page['goalId']==gid and page['evidenceReview']is None and page['visualization']['originalDigest']=='sha256:454cee32ae08b8ca6cddb5997eddc0e88768e31159d4f7d00574833677493876'and page['visualization']['approvedForPublication']is False
frozen=[]
for name in ['native-d-q3-global-currency-seventeen-final.prepared-freeze.actual.json','native-d-q3-europe-integration-six-final.prepared-freeze.actual.json']:frozen.extend(read(root/prior/name)['byteExactReturnedNativeFiles'])
for f in frozen:assert sha(root/f['path'])==sha(iso/f['path'])==f['sha256']
write(root/own/'native-d-q3-site-one-final-v2.prepared-freeze.actual.json',{'schemaVersion':1,'role':'technical_bounded_actual_corrected_image_page_successor','actualCheckedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'physicalIsolate':str(iso),'currentRootStrictBaseline':125,'nativePrepareActualExitCode':0,'nativeCheckActualExitCode':0,'batchConfigPath':str(config),'bundleFingerprint':manifest['bundleFingerprint'],'bookModelDigest':manifest['bookModelDigest'],'frozenGoalCount':1,'correctedGoalId':gid,'actualCorrectedAssetSha256':page['visualization']['originalDigest'],'goalFingerprint':page['goalFingerprint'],'pageFingerprint':page['pageFingerprint'],'originalTwoBundlesAndAll56FilesUnchanged':True,'twentyTwoEntirePagesActuallyUnchangedReceipt':str(own/'actual-one-corrected-and-twenty-two-unchanged-native-pages.receipt.json'),'currentPositiveTwentyThreeConfigPath':str(own/'positive-final-resources.candidate.config.json'),'currentPositiveTwentyThreeRecordsPath':str(own/'positive-final-resources.records.candidate.jsonl'),'currentPositiveTwentyThreeRecordsSha256':sha(root/own/'positive-final-resources.records.candidate.jsonl'),'twentyTwoPositiveRecordsByteExact':22,'positiveSubstantiveProfileUnchanged':True,'positiveV2InBook':False,'bookEvidenceProfileNull':True,'byteExactReturnedNativeFiles':files,'actualNativeCommands':runs,'independentReviewsPerformed':0,'humanApprovalClaimed':False,'activeWrites':0,'newStrictClosures':0,'nextStep':'Actual independent A/B reinspection of only corrected7f successor page; unchanged other22 whole pages and historical review evidence retained. Current successor must explicitly supersede only7f in the historical17 bundle at integration.'})
print(json.dumps({'frozenGoals':1,'actualUnchangedWholePages':22,'prepare':0,'check':0,'bundleFingerprint':manifest['bundleFingerprint'],'bookModelDigest':manifest['bookModelDigest'],'physicalIsolate':str(iso),'filesReturned':28}))

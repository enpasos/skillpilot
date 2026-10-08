# Apache-2.0. New physical source rebase, no historical environment mutations or new substantive approval.
from pathlib import Path
import json,hashlib,datetime,shutil,subprocess,tempfile,sys
root=Path('/home/enpasos/projects/skillpilot');b=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08')
which=sys.argv[1];assert which in['q4','he16']
if which=='q4':
 prior=b/'wirtschaft-q4-twenty-seven-reviewed-current-source-bindings-v1';own=b/'wirtschaft-q4-twenty-seven-reviewed-current-source-bindings-v2';base=b/'wirtschaft-q4-twenty-seven-native-preparation-technical-20261008-v1';old=Path('/tmp/skillpilot-wirtschaft-q4-twenty-seven-native-1msa7bpb');author=b/'wirtschaft-q4-development-ethics-twenty-seven-bilingual-positive-author-v2';names=['native-d-q4-development-seventeen','native-d-q4-ethics-development-ten'];n=27
else:
 prior=b/'wirtschaft-q3-trade-finance-sixteen-reviewed-current-source-bindings-v1';own=b/'wirtschaft-q3-trade-finance-sixteen-reviewed-current-source-bindings-v2';base=b/'wirtschaft-q3-trade-finance-sixteen-native-preparation-technical-20261008-v1';old=Path('/tmp/skillpilot-wirtschaft-q3-trade-finance-sixteen-native-m1j35kaq');author=b/'wirtschaft-q3-trade-finance-sixteen-bilingual-positive-author-v1';names=['native-d-q3-trade-finance-sixteen'];n=16
read=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x')as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
assert not(root/own).exists();(root/own).mkdir()
registry=read(root/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');econ=next(r for r in registry['subjects']if r['subject']=='wirtschaftswissenschaften');assert 'wirtschaft-q3-twenty-three-reviewed-current-source-bindings-v3/'in econ['semanticAtomicityConfigPath']
report=read(root/'tmp/economics-m7-root-q3-twenty-three-integration-current.actual.json');assert report['subjects']['wirtschaftswissenschaften']['strictComplete']==148
ids=set(read(root/author/'goal-ids.json'));assert len(ids)==n
frozen=[f for name in names for f in read(root/base/(name+'-final.prepared-freeze.actual.json'))['byteExactReturnedNativeFiles']];assert len(frozen)==28*len(names)
for f in frozen:assert sha(root/f['path'])==sha(old/f['path'])==f['sha256']
iso=Path(tempfile.mkdtemp(prefix='skillpilot-wirtschaft-'+which+'-current148-reviewed-rebase-'))
for folder in['app/scripts','app/src','contracts']:shutil.copytree(root/folder,iso/folder)
(iso/'app/node_modules').symlink_to(root/'app/node_modules',target_is_directory=True)
CAN=econ['landscapePath'];QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json';SEM=econ['semanticKindLedgerPath'];BASE='curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1'
for p in['app/package.json','app/tsconfig.json',BASE+'/review-book-full.config.json',BASE+'/review-full-canonical.view.json',str(author/'authoring-review.criteria.md')]:
 target=iso/p;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/p,target)
retained={}
for path,key in[(CAN,'goals'),(QA,'records'),(SEM,'decisions')]:
 live=read(root/path);before=read(old/path);getid=lambda x:x['id']if key=='goals'else x['goalId'];selected={getid(x):x for x in before[key]if getid(x)in ids};assert set(selected)==ids
 merged=dict(live);merged[key]=[selected[getid(x)]if getid(x)in ids else x for x in live[key]];write(iso/path,merged);retained[path]={'actualLiveSha256':sha(root/path),'priorOwnPhysicalSha256':sha(old/path),'candidateSha256':sha(iso/path),'selectedWholeItemsRetained':n,'otherWholeItemsEqualToLive':sum(getid(x)not in ids for x in merged[key])}
 for x in merged[key]:assert x==(selected[getid(x)]if getid(x)in ids else next(l for l in live[key]if getid(l)==getid(x)))
assets=[]
for r in read(iso/QA)['records']:
 if r['visualizationState']=='available':
  source=old if r['goalId']in ids else root
  for key in['publicAssetPath','canonicalAssetPath']:
   path=r[key];assert sha(source/path)==r['assetSha256'];target=iso/path;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source/path,target);assert sha(target)==r['assetSha256'];assets.append({'goalId':r['goalId'],'path':path,'sha256':r['assetSha256']})
assert len(assets)==2*(148+n)
configs={};retention={};commands=[]
for kind,key in [('atomicity','semanticAtomicityConfigPath'),('memory','memoryReviewConfigPath')]:
 cfg=read(root/econ[key]);configs[kind]=cfg;raw=(root/cfg['reviewPath']).read_bytes();lines=raw.splitlines(keepends=True);live={json.loads(l)['goalId']:l for l in lines};ownprior={json.loads(l)['goalId']:l for l in(root/prior/(kind+'.review.jsonl')).read_bytes().splitlines(keepends=True)};assert len(live)==303
 merged=b''.join(ownprior[json.loads(l)['goalId']]if json.loads(l)['goalId']in ids else l for l in lines);(iso/own).mkdir(parents=True,exist_ok=True);out=own/(kind+'.review.jsonl');(iso/out).write_bytes(merged);newcfg=dict(cfg,reviewPath=str(out))
 if kind=='memory':
  data=(root/cfg['cardReviewPath']).read_bytes();assert len(data.splitlines())==51 and data==(root/prior/'memory.cards.review.jsonl').read_bytes();cards=own/'memory.cards.review.jsonl';(iso/cards).write_bytes(data);newcfg.update(cardReviewPath=str(cards),reportPath=str(own/'memory.native-report.md'))
 write(iso/own/(kind+'.config.json'),newcfg)
 for l in merged.splitlines(keepends=True):assert l==(ownprior[json.loads(l)['goalId']]if json.loads(l)['goalId']in ids else live[json.loads(l)['goalId']])
 retention[kind]={'previousActiveConfigPath':econ[key],'previousActiveRecordsSha256':'sha256:'+hashlib.sha256(raw).hexdigest(),'selectedOwnPriorReviewedRecordsPath':str(prior/(kind+'.review.jsonl')),'selectedOwnRecordLinesByteExact':n,'otherActiveRecordLinesByteExact':303-n,'candidateRecordsSha256':'sha256:'+hashlib.sha256(merged).hexdigest()}
source=read(iso/CAN);decks={Path('app/public')/v.lstrip('/')for g in source['goals']if g.get('nodeKind')=='memory'for k in['vocabularySource','vocabularySourceEn']if(v:=g.get('extendedData',{}).get(k))};views={Path(v['viewPath'])for v in configs['memory']['visibilityScopes']};assert len(decks)==5 and len(views)==2;inputs=[]
for p in sorted(decks|views):
 target=iso/p;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/p,target);assert target.read_bytes()==(root/p).read_bytes();inputs.append({'path':str(p),'sha256':sha(target),'role':'actual_deck'if p in decks else'configured_view'})
for kind,script in[('atomicity','app/scripts/semanticAtomicityReview.ts'),('memory','app/scripts/memoryCardReview.ts')]:
 command=['app/node_modules/.bin/tsx',script,'--config='+str(own/(kind+'.config.json')),'--mode=check'];r=subprocess.run(command,cwd=iso,capture_output=True,text=True)
 for ext,text in[('stdout',r.stdout),('stderr',r.stderr)]:
  with(iso/own/(kind+'.native-check.'+ext+'.txt')).open('x')as f:f.write(text)
 commands.append({'command':command,'cwd':str(iso),'actualExitCode':r.returncode});assert r.returncode==0,r.stdout+r.stderr
# Actual whole native pages, with live148 context and own reviewed overlay, compared against immutable original freezes.
code="""// Apache-2.0. Entire native page parity, not a new independent review.
import{readFile,writeFile}from'node:fs/promises';import{loadGoalBookBuildInputs}from'../../../../../../../app/scripts/goalBookModel.ts';import{buildGoalDescriptionRolloutSubsetModel}from'../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts';
const root=ROOT,iso=ISO,base=BASE,own=OWN,names=NAMES;const comparisons:any[]=[];
for(const name of names){const c=JSON.parse(await readFile(root+'/'+base+'/'+name+'.final.batch.config.json','utf8')),old=JSON.parse(await readFile(root+'/'+c.outputDirectory+'/bundle/book-model.json','utf8')),input=await loadGoalBookBuildInputs(c.baseGoalBookConfigPath,iso),current=buildGoalDescriptionRolloutSubsetModel({baseModel:input.model,goalIds:c.goalIds,bookId:c.bookId,title:c.title});comparisons.push(...old.pages.map((p:any,i:number)=>({goalId:p.goalId,entirePageExactlyUnchanged:JSON.stringify(p)===JSON.stringify(current.pages[i]),oldPageFingerprint:p.pageFingerprint,currentPageFingerprint:current.pages[i].pageFingerprint,changedFields:Object.keys(p).filter(k=>JSON.stringify(p[k])!==JSON.stringify(current.pages[i][k]))})));}
await writeFile(own+'/current148-native-wholepage-parity.actual.json',JSON.stringify({schemaVersion:1,actualCheckedAt:new Date().toISOString(),physicalIsolate:iso,currentStrictBaseline:148,wholePagesCompared:comparisons.length,allWholePagesExactlyUnchanged:comparisons.every((p:any)=>p.entirePageExactlyUnchanged),actualWholePageComparisons:comparisons,independentReviewClaim:false,activeWrites:0},null,2)+String.fromCharCode(10),{flag:'wx'});console.log(JSON.stringify({wholePages:comparisons.length,unchanged:comparisons.filter((p:any)=>p.entirePageExactlyUnchanged).length}));
"""
for key,value in[('ROOT',str(root)),('ISO',str(iso)),('BASE',str(base)),('OWN',str(own)),('NAMES',names)]:code=code.replace('='+key+';', '='+json.dumps(value)+';').replace('='+key+',','='+json.dumps(value)+',')
script=own/'native-current148-wholepage-parity.mts';(root/script).write_text(code);r=subprocess.run(['app/node_modules/.bin/tsx',str(script)],cwd=root,capture_output=True,text=True)
for ext,text in[('stdout',r.stdout),('stderr',r.stderr)]:
 with(root/own/('current148-page-parity.'+ext+'.txt')).open('x')as f:f.write(text)
assert r.returncode==0,r.stdout+r.stderr;parity=read(root/own/'current148-native-wholepage-parity.actual.json');assert parity['wholePagesCompared']==n
for f in frozen:assert sha(root/f['path'])==sha(old/f['path'])==f['sha256']
write(iso/own/'native-full-successor-check.actual.json',{'schemaVersion':1,'role':'technical_exact_reviewed_own_record_rebase','actualCheckedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'physicalIsolate':str(iso),'historicalPhysicalIsolateNeverMutated':str(old),'currentStrictBaseline':148,'ordinaryDecisions':303,'selectedOwnReviewedRecordsByteExactPerGate':n,'otherActiveRecordsByteExactPerGate':303-n,'cardsByteExact':51,'visibilityChecks':98,'gateRecordRetention':retention,'actualInputs':inputs,'commands':commands,'actualCurrentContextWholeItemRetention':retained,'physicalCurrentDualAssets':assets,'frozenNativeRootAndHistoricalFilesExactlyPreserved':len(frozen),'currentWholePageParityPath':str(own/'current148-native-wholepage-parity.actual.json'),'currentWholePageParity':parity['allWholePagesExactlyUnchanged'],'previousIndependentBindingReceipt':str(prior/'native-full-successor-check.actual.json'),'nativeFingerprintWrites':0,'independentSubstantiveReviewClaim':False,'fullAMNewReviewClaim':False,'humanApprovalClaimed':False,'activeWrites':0,'newStrictClosures':0,'limits':['Q4 actual scope/image findings still require independently accepted bounded successor; this exact-record rebase carries original reviewed own goal fields and does not adjudicate them.']if which=='q4'else[]})
for p in(iso/own).rglob('*'):
 if p.is_file():
  dest=root/p.relative_to(iso);dest.parent.mkdir(parents=True,exist_ok=True)
  if dest.exists():assert dest.read_bytes()==p.read_bytes()
  else:shutil.copyfile(p,dest)
print(json.dumps({'package':which,'records':303,'ownByteExact':n,'otherByteExact':303-n,'cards':51,'visibilityChecks':98,'currentWholePagesUnchanged':parity['allWholePagesExactlyUnchanged'],'physicalIsolate':str(iso)}))

"""New current12 targeted stock preparation; no old material reconstruction."""
from pathlib import Path
import copy,datetime,hashlib,json,os,subprocess,time

O=Path(__file__).parent
F=O.parent/'current439-remediation14-guarded-root-integration-technical-v1/capsule'
K=O/'capsule'
REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-b008-terminal12-native-preparation-technical-c-v1')
R=K/REL
CAN=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
SEM=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-author-assembly-technical-v1/SEM650.same-kinds-four-description-source-bindings.author-draft.json')
OLD4=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-material4-v3-targeted-preparation-technical-v1')
P=OLD4/'P439.material4-v3-only28c-author-profile-current.aggregate.jsonl'
M=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-guarded-root-integration-technical-v1/config/M439.actual-native4-other435-exact.config.json')
IDS=['e81a4aed-9695-533e-8eb7-7a0c714346ea','42391b16-bbae-5c77-84e1-d488e714167b','f79f15c0-e848-5e17-9eb5-26753d35c93b','99d41b0f-e958-54cf-a077-9bed1704a303','5b1bb5d9-07b1-5ba9-b320-cc97be917c60','ac8b6c0f-98b2-5092-806d-d9498efbfa35','36666b4a-97af-51fc-9983-56cdcc7a8229','431a0f03-f28a-5e56-a61f-000336d0b410','38e30bb9-6145-5da0-80b8-36e3c45e15d0','6c9adc36-b6d0-57fa-8e02-5e156aebfecc','1f354a60-be44-512b-8f8b-f67c8c456035','86d34f1f-692d-5522-a9a4-a71c65b24de7']
guards={}
def pin(path):
 b=Path(path).read_bytes();return {'path':str(path),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def read(path):return json.loads(Path(path).read_bytes())
def own(path):
 assert path==K or K in path.parents
 if path==K:return
 own(path.parent)
 if path.is_symlink():
  source=Path(os.readlink(path));source=source if source.is_absolute() else path.parent/source
  children=list(source.iterdir());path.unlink();path.mkdir()
  for child in children:(path/child.name).symlink_to(child,target_is_directory=child.is_dir())
 elif not path.exists():path.mkdir()
 assert path.is_dir() and not path.is_symlink()
def put(path,obj):
 assert path==O or O in path.parents
 own(path.parent) if K in path.parents else path.parent.mkdir(parents=True,exist_ok=True)
 assert not path.exists() and not path.is_symlink()
 path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');return pin(path)
def frozen(rel,expected=None,source=None):
 source=Path(source) if source else F/rel;before=pin(source)
 if expected:assert before['sha256']==expected,(str(source),before)
 guards[str(source)]=before
 target=K/rel;own(target.parent)
 if target.is_symlink():target.unlink()
 assert not target.exists(),str(target)
 target.write_bytes(source.read_bytes());assert pin(target)['sha256']==before['sha256']
 return pin(target)
assert not K.exists() and not K.is_symlink()
K.mkdir()
for child in F.iterdir():(K/child.name).symlink_to(child,target_is_directory=child.is_dir())
own(R)
canonical_pin=frozen(CAN,'38c437d5fa0e24f8587b26cbdb2e3f168f3ffaf915aaaef885f918ac22c668e0')
sem_pin=frozen(SEM,'4807fb1139038dadbb6a1edde1f6f7b7e7f67a95e62c0fb2aaac7ca94d69bda6')
p_pin=frozen(REL/'P439.current-v3.exact.full.jsonl','eb2019c4bb61b375d2959a4c03c32c479da7a31f0ef1b4d39d44e477ec2a26f6',F/P)
base=read(F/OLD4/'base.full439.material4-v3.author-input.config.json')
qa_pin=frozen(Path(base['goalVisualizationQaPath']))
fullview_pin=frozen(Path(base['compositionViewPath']))
memory=read(F/M);guards[str(F/M)]=pin(F/M)
view_pins=[]
for scope in memory['visibilityScopes']:
 vp=frozen(Path(scope['viewPath']));view_pins.append({'label':scope['label'],'pin':vp})
assert len(view_pins)==39
land=read(K/CAN);goals={g['id']:g for g in land['goals']}
records=[json.loads(line) for line in (K/REL/'P439.current-v3.exact.full.jsonl').read_text().splitlines() if line.strip()]
profiles={g['goalId']:g for g in records};assert len(goals)==650 and len(profiles)==439 and set(IDS)<=set(profiles)
qa=read(K/base['goalVisualizationQaPath']);qa_rows={r['goalId']:r for r in qa['records']}
assets={}
for gid in IDS:
 paths=[]
 for link in goals[gid].get('resourceLinks',[]):
  url=link.get('url','')
  if url.startswith('/assets/') or url.startswith('/data/'):paths.append('app/public'+url)
 q=qa_rows.get(gid,{})
 for key in ['publicAssetPath','canonicalAssetPath']:
  if q.get(key):paths.append(q[key])
 for path in paths:
  if path not in assets:assets[path]=frozen(Path(path))
base.update({'bookId':'chemie-current439-b008-terminal12-full439-input-20261017-v1','title':'Chemie – aktueller vollständiger Inhaltsstand für zwölf gezielte neue D-Seiten','evidenceReviewPaths':[str(REL/'P439.current-v3.exact.full.jsonl')],'outputPath':str(REL/'book-model.full439.input-reference.json')})
base_pin=put(R/'base.full439.current12.config.json',base)
cfg=read(F/OLD4/'material4-v3.batch.config.json')
cfg.update({'batchId':'chemie-current439-b008-terminal12-new-current-20261017-v1','bookId':'chemie-current439-b008-terminal12-new-current-20261017-v1','title':'Chemie – zwölf aktuelle Ziele, neue gezielte D-Prüfseiten','baseGoalBookConfigPath':str(REL/'base.full439.current12.config.json'),'goalIds':IDS,'outputDirectory':str(REL/'native12')})
cfg_pin=put(R/'current12.batch.config.json',cfg)
for rel in [Path(cfg['promptPath']),Path(cfg['criteriaPath'])]:frozen(rel)
prep=put(O/'PREPARATION.current12.source-frozen-before-stock.json',{'role':'Fresh current12 preparation from unchanged current C650/P439V3/SEM650/39contexts; no old missing material reconstruction','capsule':str(K),'reviewRootRelativePath':str(REL),'nativeRoot':str(R/'native12'),'configRelativePath':str(REL/'current12.batch.config.json'),'goalIds':IDS,'sourceCanonicalPin':canonical_pin,'sourceSEM650Pin':sem_pin,'sourceP439Pin':p_pin,'sourceQaPin':qa_pin,'sourceFullViewPin':fullview_pin,'viewPins':view_pins,'assetPins':list(assets.values()),'configPin':cfg_pin,'sourceGuards':list(guards.values()),'historicalB008BytesEdited':False,'scienceBodyChanges':False,'newScienceVotes':0})
print(json.dumps({'phase':'source-frozen','preparation':prep,'assets':len(assets),'views':len(view_pins)}),flush=True)
executions=[]
for mode in ['prepare','check']:
 argv=['node','--preserve-symlinks','--preserve-symlinks-main','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs',str(K/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),mode,'--config',str(REL/'current12.batch.config.json')]
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
 result=subprocess.run(argv,cwd=K,text=True,capture_output=True,env=dict(os.environ,TSX_DISABLE_CACHE='1',NO_COLOR='1'))
 execution={'mode':mode,'argv':argv,'cwd':str(K),'startedAtUTC':start,'elapsedSeconds':time.monotonic()-t,'exitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr}
 put(O/f'STOCK.current12.{mode}.execution.json',execution);executions.append(execution)
 print(json.dumps({'phase':mode,'exitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr}),flush=True)
 assert result.returncode==0,result.stderr
native=R/'native12';manifest=read(native/'batch-manifest.json');raw=read(native/'round-a/description-review-input.json');assert raw==read(native/'round-b/description-review-input.json')
model=read(native/'bundle/book-model.json');pages={p['goalId']:p for p in model['pages']};assert len(pages)==12
FORBID={'reviewer','reason','reviewId','reviewedAt','reviewRunIds','dissent','evidenceReview','authorRemediation','newIndependentReviewStatus','authorRecommendation','authorStatus','independentApproval','independentReview','status','reviewAuthority','evidenceLevel','maximumClaimScope'}
def scientific(value):
 if isinstance(value,list):return [scientific(v) for v in value]
 if isinstance(value,dict):return {k:scientific(v) for k,v in value.items() if k not in FORBID}
 return value
safe_rows=[]
for row in raw['goals']:
 gid=row['goalId'];ctx=row['reviewContext'];safe={k:copy.deepcopy(v) for k,v in row.items() if k!='reviewContext'}
 safe['reviewContext']={'page':scientific(ctx['page']),'evidenceProfile':{'goalId':gid,'goalFingerprint':profiles[gid]['goalFingerprint'],'profileRuleVersion':profiles[gid]['profileRuleVersion'],'profileFingerprint':profiles[gid]['profileFingerprint'],'profile':copy.deepcopy(profiles[gid]['profile'])}}
 assert safe['reviewContext']['evidenceProfile']['profile']==ctx['evidenceProfile']['profile']
 safe['currentCanonicalScientificFields']=scientific(goals[gid]);safe['currentDirectPrerequisiteScientificFields']=[scientific(goals[r]) for r in goals[gid].get('requires',[]) if r in goals]
 safe_rows.append(safe)
world={'schemaVersion':1,'role':'Current scientific content and authored39contexts only; no historical or peer judgments','currentCanonical':scientific(land),'current439ProfileBodies':[{'goalId':r['goalId'],'goalFingerprint':r['goalFingerprint'],'profileFingerprint':r['profileFingerprint'],'profile':copy.deepcopy(r['profile'])} for r in records],'authored39Contexts':[{'label':v['label'],'view':scientific(read(v['pin']['path']))} for v in view_pins]}
world_pin=put(R/'CONTEXT.current650-P439V3-39views.scientific-content-only.json',world)
view={'schemaVersion':1,'role':'Clean new CURRENT12 D scientific input, no prior review metadata','goalIds':IDS,'goalCount':12,'currentAtomicDenominator':439,'originalReviewInputFingerprint':raw['reviewInputFingerprint'],'originalBundleFingerprint':manifest['artifacts']['bundleFingerprint'],'originalBookDigest':manifest['artifacts']['bookModelDigest'],'goals':safe_rows,'wholeCurrentScientificContextPin':world_pin,'assetPins':list(assets.values()),'selectionRule':'Exact current goal text/context/page plus current profile body, real assets and complete authored contexts. Page evidenceReview and wrapper reason/reviewer/old-run/status metadata are excluded. Native raw wrappers are technical serialization inputs only after each own FIRST.','historicalMissingMaterialsReconstructed':False,'newScientificVotes':0,'humanApproval':False}
view_pin=put(R/'REVIEW.current12.whole-scientific-content.no-review-metadata.json',view)
rounds=[]
for label,key in [('round-a','first'),('round-b','second')]:
 binding=manifest['artifacts']['rounds'][key];rd=native/label
 rounds.append({'round':label,**{k:binding[k] for k in ['campaignId','roundId','independenceGroupId','batchId','batchInputFingerprint']},'inputPins':[pin(rd/'review-bundle-manifest.json'),pin(rd/'description-review-input.json'),pin(rd/'description-review-campaign.json'),pin(rd/'batches'/(binding['batchId']+'.input.jsonl'))]})
for expected in guards.values():assert pin(expected['path'])==expected,expected['path']
selector={'schemaVersion':1,'role':'Frozen new targeted CURRENT12 independent D review entry point','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PREPARED_FOR_FRESH_INDEPENDENT_REVIEW_NOT_ACCEPTED','view':view_pin,'wholeCurrentScientificContextPin':world_pin,'capsule':str(K),'nativeRoot':str(native),'goalIds':IDS,'goalCount':12,'currentAtomicDenominator':439,'configPin':cfg_pin,'batchManifestPin':pin(native/'batch-manifest.json'),'bookDigest':manifest['artifacts']['bookModelDigest'],'bundleFingerprint':manifest['artifacts']['bundleFingerprint'],'reviewInputFingerprint':manifest['artifacts']['reviewInputFingerprint'],'rounds':rounds,'bundleArtifactPins':[pin(p) for p in sorted((native/'bundle').rglob('*')) if p.is_file()],'actualCurrentAssetPins':list(assets.values()),'currentCanonicalPin':canonical_pin,'currentP439PinForTechnicalSerializationOnly':p_pin,'currentSEM650PinForTechnicalSerializationOnly':sem_pin,'viewPins':view_pins,'sourceGuards':list(guards.values()),'sourceGuardsUnchanged':True,'technicalBindingRule':'Read only clean view, actual images and whole current clean context before own FIRST. Use exact raw native fingerprints/campaign fields only for technical serialization after own FIRST. New CURRENT12 source content only; old b008 missing artifacts are neither recreated nor claimed recovered.','outcomesPredetermined':False,'newReviewRecordsCreated':False,'newScientificVotes':0,'humanApproval':False,'fullCentralOrFullBuildRun':False}
selector_pin=put(R/'SELECTOR.clean-current12-reviewer-inputs.sealed.json',selector)
receipt=put(O/'RECEIPT.current12-native-preparation-and-clean-seal.json',{'role':'New targeted current12 stock prepare/check and exact clean projection; no science judgments','selector':selector_pin,'view':view_pin,'world':world_pin,'preparation':prep,'actualStockChecks':[{'mode':x['mode'],'exitCode':x['exitCode'],'stdout':x['stdout']} for x in executions],'sourceGuardCount':len(guards),'sourceGuardsUnchanged':True,'sourceBodiesChanged':False,'newReviewRecordsCreated':False,'historicalB008BytesModifiedOrRecreated':False,'fullCentralOrFullBuildRun':False,'humanApproval':False,'newScientificVotes':0})
for p in sorted(R.rglob('*')):
 if p.is_file() and not p.is_symlink():p.chmod(0o444)
print(json.dumps({'phase':'sealed','selector':selector_pin,'view':view_pin,'world':world_pin,'receipt':receipt,'nativeRoot':str(native),'rounds':rounds}),flush=True)

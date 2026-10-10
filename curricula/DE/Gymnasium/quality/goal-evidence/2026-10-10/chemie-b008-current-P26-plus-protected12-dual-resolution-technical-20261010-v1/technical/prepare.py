from pathlib import Path
import json,hashlib,os,shutil,datetime
R=Path.cwd(); BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
OUT=BASE/'chemie-b008-current-P26-plus-protected12-dual-resolution-technical-20261010-v1'
AUTH26=BASE/'chemie-b008-current-whole-P26-native-continuation-author-20261010-v1'
AUTH12=BASE/'chemie-b008-protected-twelve-current-native-technical-author-20261010-v1'
A26=BASE/'chemie-b008-whole-P26-current-native-independent-a-20261010-v1'
B26=BASE/'chemie-b008-whole-P26-current-native-independent-b-20261010-v1'
A12=BASE/'chemie-b008-protected-twelve-current-native-independent-a-20261010-v1'
B12=BASE/'chemie-b008-protected-twelve-current-native-independent-b-20261010-v1'
sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest()
def dump(p,j):
 p.parent.mkdir(parents=True,exist_ok=True)
 b=(json.dumps(j,ensure_ascii=False,indent=2)+'\n').encode()
 if p.exists():assert p.read_bytes()==b,str(p)
 else:p.write_bytes(b)
 return b
freezes=[(A26/'independent-a.final.freeze.json','9aaf791c3b000fd21f4192807c9badb1d9abcd13bd68784e21ecdbfb9f0004cf'),(B26/'FINAL.freeze.json','d1f9b3e782c2b0606a849d83f2e991f64afc247f0351eb4a81c094bbf5826c09'),(A12/'independent-a.final.freeze.json','334d70434b22a4c1fe364d3b0757e6a3eb82ece01ed06509fbe3acae8cdfafb0'),(B12/'FINAL.freeze.json','0e37f511e1a2d272b77a70b2e541d547cdc3469313ec23417adb08bb3015e598')]
checked=[]
def verify_items(v):
 if isinstance(v,dict):
  if isinstance(v.get('path'),str) and isinstance(v.get('sha256'),str):
   p=Path(v['path']);assert p.is_file(),str(p)
   b=p.read_bytes();expected=v['sha256'].removeprefix('sha256:');assert hashlib.sha256(b).hexdigest()==expected,str(p)
   if isinstance(v.get('bytes'),int):assert len(b)==v['bytes'],str(p)
   checked.append({'path':str(p),'sha256':sha(b),'bytes':len(b)})
  for w in v.values():verify_items(w)
 elif isinstance(v,list):
  for w in v:verify_items(w)
for p,s in freezes:
 b=p.read_bytes();assert hashlib.sha256(b).hexdigest()==s,str(p);verify_items(json.loads(b))
entries=[(B26/'completed-independent-b.integration-entry.json','9734681f9474a9d73814212b7a86e3b4883747039336094381f6d006f1d46e69'),(B12/'completed-independent-b12-current-native-context.entry.json','53bf4428e7903096e2ddfba6b2293480ae9bf089310b1648de4db8d4b705860e')]
for p,s in entries:assert hashlib.sha256(p.read_bytes()).hexdigest()==s
OUT.mkdir(parents=True,exist_ok=True); copies=[];groups=[];links=[]
def copy(src,dst):
 b=src.read_bytes();dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.exists():assert dst.read_bytes()==b,str(dst)
 else:dst.write_bytes(b)
 copies.append({'sourcePath':str(src),'targetPath':str(dst),'sha256':sha(b),'bytes':len(b)})
for name,author,size,ra,rb in [('current-20',AUTH26,20,A26/'results/current-20',B26/'normal-b20/results'),('current-6',AUTH26,6,A26/'results/current-6',B26/'normal-b6/results'),('protected-12',AUTH12,12,A12/'results',B12/'normal-b12/results-normal-valid')]:
 src=author/f'native/current-{size}';dst=OUT/name;dst.mkdir(parents=True,exist_ok=True)
 cfgSource=author/f'native/current-{size}.normal-rollout.batch.config.json';cfg=json.loads(cfgSource.read_text());oldCfg=dict(cfg);cfg['outputDirectory']=str(dst)
 cfgPath=dst/'batch.config.json';cfgBytes=dump(cfgPath,cfg)
 manifest=json.loads((src/'batch-manifest.json').read_text());oldManifest=json.loads((src/'batch-manifest.json').read_text());manifest['configPath']=str(cfgPath);manifest['configDigest']=sha(cfgBytes)
 dump(dst/'batch-manifest.json',manifest)
 assert [k for k in cfg if cfg[k]!=oldCfg[k]]==['outputDirectory']
 assert set(k for k in manifest if manifest[k]!=oldManifest[k])=={'configPath','configDigest'}
 target=os.path.relpath(src/'bundle',dst)
 if (dst/'bundle').is_symlink():assert os.readlink(dst/'bundle')==target
 else:(dst/'bundle').symlink_to(target,target_is_directory=True)
 links.append({'path':str(dst/'bundle'),'relativeTarget':target,'resolvedRepositoryTarget':str(src/'bundle'),'manifestSha256':sha((src/'bundle/manifest.json').read_bytes()),'bookModelSha256':sha((src/'bundle/book-model.json').read_bytes())})
 for roundName,resultSource in [('round-a',ra),('round-b',rb)]:
  for p in sorted((src/roundName).rglob('*')):
   if p.is_file():copy(p,dst/roundName/p.relative_to(src/roundName))
  resultfiles=[p for p in sorted(resultSource.iterdir()) if p.is_file() and (p.name.endswith('.records.jsonl') or p.name.endswith('.run.json'))]
  assert len(resultfiles)==2,(resultSource,resultfiles)
  if name=='protected-12' and roundName=='round-b':assert resultSource==B12/'normal-b12/results-normal-valid'
  for p in resultfiles:copy(p,dst/roundName/'results'/p.name)
 groups.append({'group':name,'configPath':str(cfgPath),'batchId':manifest['batchId'],'goalIds':manifest['goalIds'],'firstResultsSource':str(ra),'secondResultsSource':str(rb),'configTechnicalChangeOnly':['outputDirectory'],'manifestTechnicalChangeOnly':['configPath','configDigest']})
dump(OUT/'exact-native-copy-and-scientific-freeze-verification.actual.json',{'schemaVersion':1,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Technical exact-byte integration by existing independent reviewer A; no third scientific review','scientificFreezes':[{'path':str(p),'sha256':'sha256:'+s} for p,s in freezes],'scientificBoundArtifactsVerified':checked,'copies':copies,'portableBundleLinks':links,'groups':groups,'rejectedB12ExportsSelected':False,'validB12ExportDirectory':str(B12/'normal-b12/results-normal-valid'),'sourceHold':{'covered':355,'candidateAtomic':398,'uncovered':43,'oldOmitted':19,'newChildren':24,'unresolvedScopes':496},'activeChanges':False,'strictNewCompletions':0,'strictRestoredBindings':0,'strictNetGain':0,'humanApproval':False,'humanTrial':False,'modelParameters':{'provider':'OpenAI','execution':'Codex active agent','exactModelVersion':'unknown','samplingParameters':'unknown'},'allCheckersUnchanged':True})
dump(OUT/'native-groups.technical.json',groups)
print(f'Prepared {len(groups)} groups; copied {len(copies)} exact files; verified {len(checked)} immutable scientific bindings; selected valid B12 export only')

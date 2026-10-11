import json, hashlib, subprocess, pathlib, datetime, os
R=pathlib.Path('/home/enpasos/projects/skillpilot'); O=pathlib.Path('/tmp/economics-b68-merge-preservation-independent-a');O.mkdir(exist_ok=True)
LOCAL='9067bb2cdaeb90aec1b0d6b541cea5330a2e8fd5';REMOTE='b68f8e5b579807837845ed91969d4293b35a503d';BASE='5344554de0cb8243fbca26275978cb5396e1ded9'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';POL='curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json';ATLAS='app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json'
def git(*a):return subprocess.check_output(['git',*a],cwd=R)
def tree(ref):
 d={}
 for line in git('ls-tree','-r','-z',ref).split(b'\0'):
  if line:
   meta,p=line.split(b'\t',1); mode,typ,oid=meta.split();d[p.decode()]={'mode':mode.decode(),'oid':oid.decode()}
 return d
T=tree(LOCAL);U=tree(REMOTE);B=tree(BASE)
def original(ref,p):return git('show',ref+':'+p)
def sha(b):return hashlib.sha256(b).hexdigest()
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def j(ref,p):return json.loads(original(ref,p))
def current(p):
 f=R/p
 if f.is_symlink(): return os.readlink(f).encode()
 return f.read_bytes()
def equal(ref,p):
 t=T if ref==LOCAL else U
 try:b=current(p);return {'path':p,'reference':ref,'originalGitBlob':t[p]['oid'],'currentSha256':sha(b),'wholeByteExact':blob(b)==t[p]['oid'],'symlink':(R/p).is_symlink()}
 except Exception as e:return {'path':p,'reference':ref,'wholeByteExact':False,'error':str(e)}
def subjects(x):return {z['subject']:z for z in x['subjects']}
localS=subjects(j(LOCAL,REG));remoteS=subjects(j(REMOTE,REG));liveS=subjects(json.loads(current(REG)))
protections=set();reasons={}
def protect(p,why):
 if p in T: protections.add(p);reasons.setdefault(p,[]).append(why)
# All tracked non-history Economics assets, layouts, canonical, mappings, generated content and subject-specific code/config.
for p in T:
 if ('wirtschaft' in p.lower() or 'economics' in p.lower()) and '/quality/goal-evidence/' not in p and '/quality/goal-visualization-review/' not in p:
  protect(p,'Economics named active/non-history path')
# Protect exact consumed configs and all local file dependencies linked from current subject/book config.
seen=set(); queue=[]
def paths(v,owner):
 if isinstance(v,dict):
  for k,z in v.items():
   if k=='reportPath':continue # derived output, regenerated separately by Root
   paths(z,owner)
 elif isinstance(v,list):
  for z in v:paths(z,owner)
 elif isinstance(v,str):
  q=v
  if q.startswith('/assets/'):q='app/public'+q
  if q in T:protect(q,'bound local dependency of '+owner);queue.append(q)
  elif q and not q.startswith(('http:','https:','sha256:','/')) and ('/' in q or q.endswith(('.json','.jsonl','.md','.png'))):
   q=str(pathlib.PurePosixPath(owner).parent/q)
   if q in T:protect(q,'bound relative dependency of '+owner);queue.append(q)
paths(localS['wirtschaftswissenschaften'],REG)
book='app/scripts/config/goal-books/de-gym-economics-current-canonical.json';queue.append(book)
while queue:
 p=queue.pop()
 if p in seen:continue
 seen.add(p);protect(p,'active dependency closure')
 if p.endswith('.config.json') or p==book or p.endswith('resolution-index.json'):
  try:paths(j(LOCAL,p),p)
  except (ValueError,subprocess.CalledProcessError):pass
# Canonical resource links plus exact QA canonical/public/runtime image and prompt copies.
can=localS['wirtschaftswissenschaften']['landscapePath']
for goal in j(LOCAL,can)['goals']: paths(goal.get('resourceLinks',[]),can)
for p in list(protections):
 if '/visualizations/wirtschaftswissenschaften/' in p and p.endswith('.png'):
  protect(str(pathlib.PurePosixPath(p).parent/'prompt.de.md'),'bound canonical visualization prompt')
# All original named Economics D-science/history pointers linked above are byte guards, not re-reviewed.
protectedRows=[equal(LOCAL,p) for p in sorted(protections)]
incoming=[p for p in sorted(set(U)|set(B)) if U.get(p)!=B.get(p)]
shared={REG,ATLAS,'docs/legal/ai-transparency-inventory.json','docs/qa-ci/index.md','docs/qa-ci/status/curriculum-quality-status.json','docs/qa-ci/status/curriculum-quality-status.md','docs/qa-ci/status/curriculum-source-coverage-audit.json','docs/qa-ci/status/curriculum-source-coverage-audit.md'}
remoteRows=[equal(REMOTE,p) for p in incoming if p not in shared and p in U]
mathphys=[]
for s in ['mathematik','physik']:
 for p in [localS[s]['landscapePath'],localS[s]['semanticKindLedgerPath'],localS[s]['visualizationQaPath'],localS[s]['semanticAtomicityConfigPath'],localS[s]['memoryReviewConfigPath']]:mathphys.append(equal(LOCAL,p))
remoteA=j(REMOTE,ATLAS);liveA=json.loads(current(ATLAS))
def diffs(a,b,path=''):
 if type(a)!=type(b):return [{'path':path,'before':a,'after':b}]
 if isinstance(a,dict):return sum((diffs(a.get(k),b.get(k),path+'/'+str(k)) for k in sorted(set(a)|set(b))),[])
 if isinstance(a,list):
  if len(a)!=len(b):return [{'path':path,'beforeLength':len(a),'afterLength':len(b)}]
  return sum((diffs(x,y,path+'/'+str(i)) for i,(x,y) in enumerate(zip(a,b))),[])
 return [] if a==b else [{'path':path,'before':a,'after':b}]
atlasD=diffs(remoteA,liveA)
localPolicySha=sha(original(LOCAL,POL));policyBindingIndices=[i for i,z in enumerate(remoteA['inputBindings']) if z['path']==POL]
atlasAllowed=(len(atlasD)==1 and len(policyBindingIndices)==1 and atlasD[0]['path']=='/inputBindings/'+str(policyBindingIndices[0])+'/sha256' and atlasD[0]['after']=='sha256:'+localPolicySha)
atlasOutputs=[equal(REMOTE,z['path']) for z in remoteA['outputBindings']]
atlasInputs=[]
for z in remoteA['inputBindings']:
 if z['path']==POL:continue
 p=z['path']
 if p in U:atlasInputs.append(equal(REMOTE,p))
 elif (R/p).exists():
  b=current(p);atlasInputs.append({'path':p,'reference':REMOTE,'referenceReceiptSha256':z['sha256'],'currentSha256':sha(b),'wholeByteExact':z['sha256']=='sha256:'+sha(b),'basis':'Ignored local source bytes compared to exact b68 native receipt binding'})
 else:atlasInputs.append({'path':p,'reference':REMOTE,'referenceReceiptSha256':z['sha256'],'wholeByteExact':None,'wholeReferenceBindingExact':True,'basis':'Historical referenced artifact is not materialized locally or tracked in b68; unchanged receipt field only, no actual-file-byte claim'})
subjectRows=[{'subject':s,'reference':LOCAL if s!='biologie' else REMOTE,'wholeSubjectExact':liveS.get(s)==(localS if s!='biologie' else remoteS).get(s)} for s in ['wirtschaftswissenschaften','mathematik','physik','biologie']]
bookOutput=j(LOCAL,book)['outputPath'];bookFile=R/bookOutput
bookGenerated={'path':bookOutput,'currentlyExists':bookFile.exists(),'currentSha256':sha(bookFile.read_bytes()) if bookFile.exists() else None,'boundary':'Ignored generated output has no committed9067 blob; source/config/P/Page inputs exact above. This snapshot is a before-native-build byte guard, not a current build claim.'}
report={'schemaVersion':1,'kind':'independent-readonly-bounded-merge-preservation','status':'KEEP-active-input-and-atlas-preservation; final-generated-status-and-new-head-CI-OPEN','observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'references':{'local':LOCAL,'incomingRemote':REMOTE,'commonBase':BASE,'actualHEAD':git('rev-parse','HEAD').decode().strip(),'actualMERGE_HEAD':git('rev-parse','MERGE_HEAD').decode().strip()},'permissions':{'repositoryWrites':0,'fetches':0,'nativeBuildsOrTests':0,'newScientificReviews':0,'tmpOnly':True},'subjects':subjectRows,'economics':{'protectedPaths':len(protectedRows),'wholeExactCount':sum(z['wholeByteExact'] for z in protectedRows),'unexpectedChangedPaths':[z for z in protectedRows if not z['wholeByteExact']],'guards':protectedRows,'boundPathReasons':reasons,'currentGoalContextChanges':[] if all(z['wholeByteExact'] for z in protectedRows) and subjectRows[0]['wholeSubjectExact'] else ['OPEN: see byte or subject deltas'],'ordinaryCount':346,'canonicalGoalCount':702,'generatedBookBeforeSnapshot':bookGenerated},'incomingRemote':{'changedPaths':len(incoming),'sharedExceptionPaths':sorted(shared),'nonsharedWholeExactCount':sum(z['wholeByteExact'] for z in remoteRows),'nonsharedTotal':len(remoteRows),'unexpectedChangedPaths':[z for z in remoteRows if not z['wholeByteExact']],'guards':remoteRows},'biologyAtlas':{'currentCounts':liveA['counts'],'oneQualifiedPolicyShaDeltaOnly':atlasAllowed,'exactLogicalDeltas':atlasD,'outputs':atlasOutputs,'allOutputBytesExactRemote':all(z['wholeByteExact'] for z in atlasOutputs),'inputsExceptPolicy':atlasInputs,'allOtherExistingInputsExactRemote':all(z['wholeByteExact'] for z in atlasInputs if z['wholeByteExact'] is not None),'nonmaterializedHistoricalReferences':[z for z in atlasInputs if z['wholeByteExact'] is None],'qualifiedSharedPolicy':equal(LOCAL,POL),'noNewBioScienceOrImageReview':True},'mathPhysics':{'protectedOrdinaryCounts':{'mathematik':807,'physik':478},'guards':mathphys,'wholeExact':all(z['wholeByteExact'] for z in mathphys)},'deferred':['Shared central/status/source-audit/inventory outputs are still being regenerated by Root; no final freshness assertion.','New merge-HEAD CI is pending; prior9067 CI cannot certify mergedHEAD.','Biology science is preserved from incoming b68, not independently re-reviewed here.']}
assert all(x['wholeSubjectExact'] for x in subjectRows),subjectRows
assert all(z['wholeByteExact'] for z in protectedRows),report['economics']['unexpectedChangedPaths']
assert all(z['wholeByteExact'] for z in remoteRows),report['incomingRemote']['unexpectedChangedPaths']
assert atlasAllowed,atlasD
assert report['biologyAtlas']['allOutputBytesExactRemote'] and report['biologyAtlas']['allOtherExistingInputsExactRemote']
assert report['mathPhysics']['wholeExact']
p=O/'actual-active-inputs-Economics9067-Biologyb68-and-policy-only-native-atlas-preservation.READONLY.json';p.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'receipt':str(p),'sha256':sha(p.read_bytes()),'subjects':subjectRows,'economicsPaths':len(protectedRows),'incomingExact':len(remoteRows),'atlasOutputsExact':len(atlasOutputs),'atlasExistingInputsExactExceptPolicy':sum(z['wholeByteExact'] is not None for z in atlasInputs),'nonmaterializedPreservedReferences':sum(z['wholeByteExact'] is None for z in atlasInputs),'atlasDeltas':atlasD,'mathPhysicsPaths':len(mathphys)},ensure_ascii=False,indent=2))

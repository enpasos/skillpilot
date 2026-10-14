# Apache-2.0. Inactive technical preparation; no new review vote or host mutation.
import copy, datetime, hashlib, json, pathlib, shutil
R=pathlib.Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14'
O=pathlib.Path(__file__).parent;I=E/'chemie-current407-native5-paired-resolution-and-P1-existing270-integration-technical-20261014-v1'
N=E/'chemie-current407-naturstoffe-seven-shared-native-first-pass-technical-20261014-v1'
M=E/'chemie-M311-current407-native7-memory-carry-acquisition-bounded-20261014-v1'
RNI=E/'chemie-NI2652-three-reviewed-partial-decisions-current407-transport-root-20261014-v1'
H=R/'tmp/checkpoint-chemie-20261013/current407-corrected-P8-native4-physical-host'
canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
sem='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
qa='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
read=lambda p:json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(n,j):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists():assert read(p)==j,p
 else:p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
 return p
def cp(p,n):
 dst=O/n;dst.parent.mkdir(parents=True,exist_ok=True)
 if not dst.exists():shutil.copyfile(p,dst)
 assert p.read_bytes()==dst.read_bytes();return dst
def local(s):
 p=R/s
 return p if p.exists() else H/s
neutral=read(N/'NEUTRAL.current407-naturstoffe-seven-shared-native-FIRST_PASS.exact-input-selector.json');ids=neutral['goalIds'];idset=set(ids)
prior=read(I/'FINAL.native5-existing270-to-actual274-technical-integration.manifest.json')
measure=read(I/'MEASURE.actual274-current407-native5-plus-four-preserved270-and262.actual.json')
priorReport=read(R/measure['fullStockReport']['path']);priorSubject=priorReport['subjects'][0]
assert priorSubject['strictComplete']==274
assert set(measure['protected262StrictIds']).issubset(priorSubject['strictCompleteGoalIds'])
before=read(R/prior['canonicalCandidate']['path']);after=read(R/neutral['wholeCurrentCanonical']['path']);bi={g['id']:g for g in before['goals']};ai={g['id']:g for g in after['goals']}
assert read(H/canon)==before and len(bi)==len(ai)==533 and bi.keys()==ai.keys()
changed=[g for g in bi if bi[g]!=ai[g]];assert set(changed)=={'3681e688-7880-5bb4-9ab9-ef78289345c8','68292f39-04e7-5924-b6a5-731c7f7f82ee','8da5c5cf-d346-5df9-b4c9-26938fc80a88','b4ca3af2-77f1-59e8-955d-c4959e284242'}
for gid in bi:assert {k:v for k,v in bi[gid].items() if k!='resourceLinks'}=={k:v for k,v in ai[gid].items() if k!='resourceLinks'}
cp(H/canon,'inputs/whole533-I274-canonical.before.byte-exact.json');cp(H/sem,'inputs/whole533-I274-semantic.before.byte-exact.json');cp(H/qa,'inputs/whole419-I274-QA.before.byte-exact.json')
assert sha(H/qa)==prior['operativeQACandidate']['sha256']
cp(R/neutral['wholeCurrentCanonical']['path'],'candidate/canonical533.current407.N7.inactive.json')
ledger=read(H/sem);nledger=read(R/neutral['semanticLedger']['path']);assert ledger['decisions']==nledger['decisions'];assert sum(d['semanticKind']=='curricularAtomic' for d in ledger['decisions'])==407
assert ledger['sourceLandscapePath']==canon
cp(H/sem,'candidate/semantic533.current407.N7.normal-alias.inactive.json')
oldqa=read(H/qa);nqa=read(R/neutral['goalVisualizationQA']['path']);oldby={r['goalId']:r for r in oldqa['records']};newby={r['goalId']:r for r in nqa['records']};assert len(oldby)==len(newby)==419
preparedqa=copy.deepcopy(oldqa)
for i,row in enumerate(preparedqa['records']):
 if row['goalId'] in idset:
  replacement=copy.deepcopy(newby[row['goalId']]);replacement['landscapePath']=row['landscapePath'];preparedqa['records'][i]=replacement
assert all(r==oldby[r['goalId']] for r in preparedqa['records'] if r['goalId'] not in idset)
qafter=write('candidate/QA.current407.N7.I274-exact-except-seven-reviewed-bindings.inactive.json',preparedqa)
v=read(N/'originals/V7.original-b.actual-selection-and-byte-bindings.json');vb={x['goalId']:x for x in v['assetBindings']};approved={x['goalId']:x for x in v['goals']};assets=[]
for gid in ids:
 row=next(r for r in preparedqa['records'] if r['goalId']==gid);source=R/vb[gid]['ownReadOnlyHardlink']['path']
 assert row['aiApproved'] is True and row['aiApprovedAssetSha256']==row['assetSha256']==sha(source)==vb[gid]['original']['sha256']
 assert row['aiReviewer']==v['reviewer'] if 'reviewer' in v else bool(row['aiReviewer'])
 assert row['title']==ai[gid]['title'] and row['description']==ai[gid]['description']
 assert any(r.get('url')==row['imageUrl'] for r in ai[gid]['resourceLinks'])
 assets.append({'goalId':gid,'wholeActualVDecision':approved[gid],'exactVSource':bind(source),'originalVPixelBinding':vb[gid]['original'],
  'expectedPublicPath':row['publicAssetPath'],'expectedCanonicalPath':row['canonicalAssetPath'],'sha256':sha(source),
  'newImageImportRequired':gid in changed,'physicalBeforePublic':bind(H/row['publicAssetPath']) if (H/row['publicAssetPath']).exists() else None,
  'physicalBeforeCanonical':bind(H/row['canonicalAssetPath']) if (H/row['canonicalAssetPath']).exists() else None})
for a in assets:
 if not a['newImageImportRequired']:
  assert (H/a['expectedPublicPath']).exists() and sha(H/a['expectedPublicPath'])==a['sha256']
  assert (H/a['expectedCanonicalPath']).exists() and sha(H/a['expectedCanonicalPath'])==a['sha256']

config=read(I/'config/chemie-current407-native5-existing270.inactive.config.json');subject=config['subjects'][0]
assert len(config['subjects'])==1 and subject['subject']=='chemie'
config['reportId']='chemie-current407-naturstoffe-seven-existing274-inactive-20261014-v1'
transports=[]
for lane,sourceName in [('A','A7.a.preserved-original-stock-check.config.json'),('P','P7.a.preserved-original-stock-check.config.json'),('P','P7.b.preserved-original-stock-check.config.json')]:
 src=N/'configs'/sourceName;c=read(src);rp=R/c['reviewPath'];dst=cp(rp,f'{lane}/{rp.name}')
 scopeIds=set(c['scope'].get('goalIds',c['scope'].get('leafGoalIds',[])));assert scopeIds==idset
 if lane=='P':assert rp.read_bytes()==(N/'originals'/('P7.a.exact-original-lines.jsonl' if '.a.' in sourceName else 'P7.b.exact-original-lines.jsonl')).read_bytes()
 c['landscapePath']=canon;c['reviewPath']=str(dst.relative_to(R))
 if 'semanticKindLedgerPath' in c:c['semanticKindLedgerPath']=sem
 out=write('config/'+sourceName,c)
 transports.append({'lane':lane,'originalConfig':bind(src),'operativeScopedConfig':bind(out),'originalRecord':bind(rp),'exactCopiedRecord':bind(dst),'onlySourceAndRecordAddressChanges':True})
 if lane=='A':subject['semanticAtomicityConfigPaths'].append(str(out.relative_to(R)))
 elif '.a.' in sourceName:subject['positiveEvidenceConfigPaths'].append(str(out.relative_to(R)))
 for originalConfig in subject['semanticAtomicityConfigPaths'][:-1] if lane=='A' else subject['positiveEvidenceConfigPaths'][:-1]:
  oc=read(local(originalConfig));rows=[json.loads(x) for x in local(oc['reviewPath']).read_text().splitlines() if x.strip()]
  assert not (set(r['goalId'] for r in rows)&idset),'duplicate existing selected A/P owner'

mc=read(local(subject['memoryReviewConfigPath']));oldlines=local(mc['reviewPath']).read_text().splitlines(keepends=True);assert len(oldlines)==407 and len(mc['visibilityScopes'])==9
cp(local(mc['reviewPath']),'inputs/M407.previous-whole-original-science.byte-exact.jsonl')
cp(local(mc['cardReviewPath']),'M/M407.all75-original-card-records.byte-exact.jsonl')
assert len((O/'M/M407.all75-original-card-records.byte-exact.jsonl').read_text().splitlines())==75
replacements={};mhistory=[]
for label in ['a','b']:
 cp(N/f'originals/M7.{label}.exact-original-lines.jsonl',f'M/originals/M7.{label}.exact-original-lines.jsonl')
 cp(N/f'originals/C1.{label}.exact-original-card004-line.jsonl',f'M/originals/C1.{label}.exact-original-card004-line.jsonl')
for line in (N/'originals/M7.a.exact-original-lines.jsonl').read_text().splitlines(keepends=True):
 original=json.loads(line);r=copy.deepcopy(original);assert r['status'] in ['no_memory_needed','memory_required']
 assert (r['status']=='memory_required')==(r['goalId']=='5c8f0bbb-103a-579f-87fc-c997afe4fd18')
 alias=r['reviewId']!=mc['reviewId'];r['reviewId']=mc['reviewId']
 replacements[r['goalId']]=json.dumps(r,ensure_ascii=False)+'\n' if alias else line
 assert {k:v for k,v in original.items() if k!='reviewId'}=={k:v for k,v in r.items() if k!='reviewId'}
 mhistory.append({'goalId':r['goalId'],'before':json.loads(next(x for x in oldlines if json.loads(x)['goalId']==r['goalId'])),'originalScientificRecord':original,'after':r,'originalScientificFieldsVerbatim':True,'reviewIdAliasingRequired':alias,'onlyAllowedTransportField':'reviewId' if alias else None})
assert set(replacements)==idset
newlines=[replacements.get(json.loads(line)['goalId'],line) for line in oldlines]
mr=O/'M/M407.actual-original-science-plus-exact-N7-seven.jsonl';mr.write_text(''.join(newlines));assert sum(a==b for a,b in zip(oldlines,newlines) if json.loads(a)['goalId'] not in idset)==400
mc['reviewPath']=str(mr.relative_to(R));mc['cardReviewPath']=str((O/'M/M407.all75-original-card-records.byte-exact.jsonl').relative_to(R));mc['reportPath']=str((O/'checks/M407.stock.md').relative_to(R))
mout=write('config/M407.original-science-plus-seven.normal-alias.config.json',mc);subject['memoryReviewConfigPath']=str(mout.relative_to(R))
# Final D7 index and terminal-owner supersession edges are appended only after actual A final seal and stock resolutions.
write('config/chemie-current407-N7-existing274.before-D7-index.inactive.config.json',config)
Mscience=read(M/'SCIENTIFIC.current-M311-global-carry-and-four-BB-BE-acquisition-HOLD.actual.json');assert Mscience['wholeNineScopeAcquisitionDecision']=='HOLD_BB_BE_FOUR_COURSE_SCOPES'
rni=read(RNI/'NEUTRAL.FINAL.three-carrier-current407-and-bounded-NI-atlas.exact-input-selector.json');ni=[]
for x in rni['allThreeExactCandidateBindings']:
 src=R/x['path'];logical='curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/'+src.name;assert sha(H/logical)==x['sha256'];ni.append({'logicalHostPath':logical,'candidate':x,'hostBindingBeforeN7':bind(H/logical)})
write('PREFLIGHT.exact-N7-I274-canonical-QA-P-A-M-and-NI3-preservation.actual.json',{
 'schemaVersion':1,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scopeGoalIds':ids,'baseI274':bind(I/'FINAL.native5-existing270-to-actual274-technical-integration.manifest.json'),
 'baseStrict274Ids':priorSubject['strictCompleteGoalIds'],'protected262StrictIds':measure['protected262StrictIds'],
 'neutralN7':bind(N/'NEUTRAL.current407-naturstoffe-seven-shared-native-FIRST_PASS.exact-input-selector.json'),
 'canonicalChangedGoalIds':changed,'onlyResourceLinksChangedOnExactlyFour':True,'allOther529WholeNodesAndAll533NonresourceFieldsExact':True,
 'semantic533AllDecisionsExact':True,'globalAtomicDenominator':407,
 'operativeQA':bind(qafter),'operativeQAOriginalRecords':419,'operativeQAOnlySevenSelectedRecordsChanged':True,'allOther412WholeQARecordsExact':True,
 'rawN7QAUnselectedChangesNotImported':True,'selectedCurrentPhysicalAssetsAndOriginalVApprovals':assets,
 'exactScopedRecordConfigTransports':transports,'M407SevenOriginalGlobalScientificRecordTransport':mhistory,
 'M407Other400OriginalLinesExact':True,'M407All75WholeCardRecordsExact':True,'M407OriginalNineVisibilityScopesAndRoot442ScopeExact':True,
 'actualOriginalM7StatusCounts':{'no_memory_needed':6,'memory_required':1},'5cOriginalMemoryRequiredStatusNotRewritten':True,
 'M311BoundedScientificReceipt':bind(M/'SCIENTIFIC.current-M311-global-carry-and-four-BB-BE-acquisition-HOLD.actual.json'),
 'M311ScopeAcquisitionHolds':Mscience['scopeResidualFinding'],'stockMDoesNotEraseSourceAcquisitionHold':True,
 'sourceNI3MustRemainExact':ni,'newD7AResultImportsAwaitFinalSeal':True,'newScienceVotes':0,'activeWrites':False,'hostMutationsPerformed':False})
print(json.dumps({'scope':7,'resourceOnlyChanges':4,'QAOther412Exact':True,'A7/P7NoPreviousOwner':True,'M407Other400AndCards75Exact':True,'NI3Exact':3,'preparedBeforeD7IndexConfig':str((O/'config/chemie-current407-N7-existing274.before-D7-index.inactive.config.json').relative_to(R))}))

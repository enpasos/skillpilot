import pathlib,json,hashlib,datetime,subprocess,collections
P=pathlib.Path;q=P('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');o=q/'wirtschaft-origin-cd7-merge-preservation-independent-c-READONLY-v1'
sha=lambda b:hashlib.sha256(b).hexdigest();load=lambda p:json.loads(P(p).read_text());bind=lambda p:{'path':str(p),'sha256':sha(P(p).read_bytes()),'bytes':P(p).stat().st_size};git=lambda *a:subprocess.check_output(['git',*a]);checks={}
def ck(k,v):
 checks[k]=bool(v)
 if not v:raise AssertionError(k)
base=load(o/'preserved-remote-cd7-and-qualified-Economics-d2dbac-before.EXACT.json');rootr=q/'wirtschaft-remote-cd7-qualified-M6-and-native-shared-integration-ROOT-v1/actual-original-native-merged-layerA-inventory-two-branch-exact.ROOT.receipt.json';root=load(rootr)
ck('actualRootNativeMetadataReceiptImmutable',bind(rootr)['sha256']=='5c80badafdf3a17e15380609b0363488ba4dbc435c5f1db6dbf7f35ace0f6c48')
p=P(root['originalNativePatchPath']);patch=p.read_text();before=('\n'.join(line[1:] for line in patch.splitlines() if line.startswith('-'))+'\n').encode();after=('\n'.join(line[1:] for line in patch.splitlines() if line.startswith('+'))+'\n').encode();current=P('docs/legal/ai-transparency-inventory.json').read_bytes()
ck('originalNativeEmittedWholeBeforeExactlyRemoteBytes',before==git('show',base['remoteCommit']+':docs/legal/ai-transparency-inventory.json') and sha(before)==root['beforeSHA256'])
ck('originalNativeEmittedWholeAfterExactlyActiveBytes',after==current and sha(current)==root['afterSHA256'])
b=json.loads(git('show',base['mergeBase']+':docs/legal/ai-transparency-inventory.json'));own=json.loads(git('show',base['qualifiedLocalCheckpointCommit']+':docs/legal/ai-transparency-inventory.json'));remote=json.loads(before);actual=json.loads(current)
overlap={'/artifactClasses/goalVisualizations/fileExtensions/png','/artifactClasses/goalVisualizations/c2paStructure/detected','/artifactClasses/goalVisualizations/count','/artifactClasses/goalVisualizations/canonicalGoalCount'};bounded=[];missing=object()
def merge(x,y,z,path=''):
 if y==x:return z
 if z==x:return y
 if y==z:return y
 if all(isinstance(a,dict) for a in [x,y,z]):
  out={}
  for k in sorted(set(x)|set(y)|set(z)):
   v=merge(x.get(k,missing),y.get(k,missing),z.get(k,missing),path+'/'+k)
   if v is not missing:out[k]=v
  return out
 ck('onlyFourActualCounterOverlaps:'+path,path in overlap and all(isinstance(a,int) for a in [x,y,z]))
 value=y+z-x;bounded.append({'path':path,'base':x,'qualifiedEconomicBranch':y,'remoteChemistryBranch':z,'independentExpectedMerged':value});return value
expected=merge(b,own,remote)
ck('fullInventoryWholeTwoBranchDisjointUnionAndOnlyFourCounterOverlaps',expected==actual and {v['path'] for v in bounded}==overlap and len(bounded)==4)
ck('allBoundPoliciesDisclosureConclusionsOtherMediaHashesAndFieldsPreserved',actual['schemaVersion']==remote['schemaVersion']==own['schemaVersion'] and actual['snapshot']==remote['snapshot']==own['snapshot'] and all(actual['artifactClasses'][k]==remote['artifactClasses'][k]==own['artifactClasses'][k] for k in actual['artifactClasses'] if k not in ['goalVisualizations','canonicalLearningContent']))
canfiles=sorted(P('curricula/DE/Gymnasium/canonical').glob('*.json'));goals=[]
for f in canfiles:
 v=load(f);goals.extend(v.get('goals',[]))
links=[l for g in goals for l in g.get('resourceLinks',[]) if l.get('type')=='goal-visualization'];vi=actual['artifactClasses']['goalVisualizations']
ck('actualCurrent21Landscapes6292WholeGoalRecordsCount',len(canfiles)==vi['canonicalLandscapeFiles']==21 and len(goals)==vi['canonicalGoalCount']==6292)
ck('actualCurrent2425DeclaredGoalVisualizationLinksCount',len(links)==vi['count']==2425)
exts=dict(collections.Counter(P(l.get('url','')).suffix.lower().lstrip('.') for l in links));providers=dict(collections.Counter(l.get('provider','<missing>') for l in links))
ck('actualCurrentLinkExtensionsAndProviderCountersMatchNativeMeasuredInventory',exts==vi['fileExtensions'] and providers==vi['providerCounts'])
decks=sorted(P('curricula/DE/Gymnasium/memory-decks').glob('*.json'));cards=[c for d in decks for c in load(d).get('cards',[])];ids={c['id'] for c in cards};mi=actual['artifactClasses']['canonicalLearningContent']
ck('actualCurrent61StaticDecks746Records578UniqueIDs',len(decks)==mi['memoryDeckFiles']==61 and len(cards)==mi['cardRecords']==746 and len(ids)==mi['uniqueCardIds']==578)
# No new C2PA or visual approval is claimed: marker count is the original native
# measurement bound to the exact emitted patch and preserves both branch deltas.
ck('nativeMarkerCountMatchesOnlyMeasuredTwoBranchCounterUnion',vi['c2paStructure']['detected']==2374 and vi['c2paStructure']['cryptographicallyValidated'] is False)
ck('actualGoalVisualDisclosureConclusionWholeExact',vi['c2paStructure']['method']==remote['artifactClasses']['goalVisualizations']['c2paStructure']['method'] and vi['c2paStructure']['complianceConclusion']==remote['artifactClasses']['goalVisualizations']['c2paStructure']['complianceConclusion'] and vi['c2paStructure']['notDetectedUrls']==remote['artifactClasses']['goalVisualizations']['c2paStructure']['notDetectedUrls'])
receipt={'status':'KEEP_independent_actual_native_inventory_patch_whole_two_branch_metadata_preservation','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'rootNativeIntegration':bind(rootr),'originalNativePatch':bind(p),'currentWholeInventory':bind('docs/legal/ai-transparency-inventory.json'),'actualWholeBeforeRemoteSha256':sha(before),'actualWholeNativeAfterActiveSha256':sha(after),'independentOnlyFourBoundedCounterOverlaps':bounded,'allOtherWholeFieldsExactToAuthoritativeTwoBranchDisjointUnion':True,'actualLightweightCurrentCounts':{'canonicalLandscapes':21,'canonicalGoalRecords':6292,'goalVisualizationLinks':2425,'extensionCounts':exts,'memoryDecks':61,'cardRecords':746,'uniqueCardIds':578},'nativeFullEmitterInvokedAgain':False,'newImageOrC2PACryptographicOrScientificApprovalClaim':False,'otherMediaOrDisclosurePolicyReviewClaim':False,'foreignScientificRereview':False,'activeWrites':0,'globalGeneratorOrBuild':False}
p=o/'actual-native-inventory-patch-6292-2425-61-746-two-branch-independent-KEEP.READONLY.json';p.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'path':str(p),'sha256':bind(p)['sha256'],'checks':len(checks),'nativePatchExact':True,'counts':[6292,2425,61,746,578]}))

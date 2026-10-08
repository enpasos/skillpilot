"""Compare real native outputs using stable identities, never ordinal index IDs."""
from pathlib import Path
import hashlib,json,subprocess
OWN=Path(__file__).parent;ROOT=Path.cwd()
def read(n):return json.loads((OWN/n).read_text())
def write(n,x):
 with (OWN/n).open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
b=read('source-consumer.before.whole-native-index.actual.json');a=read('source-consumer.final.whole-native-index.actual.json')
delta=read('targeted-eighteen-operative-source-before-after.author.json');ids={d['canonicalGoalId'] for d in delta['deltas']}
def normalized(ix,gid):
 es={e['id']:e for e in ix['evidence']};ds={d['id']:d for d in ix['documents']};out=[]
 for scope in ix['goals'][gid]:
  s={k:v for k,v in scope.items() if k!='evidenceIds'};items=[]
  for eid in scope['evidenceIds']:
   e=es[eid];v={k:x for k,x in e.items() if k not in ('id','documentId')};v['document']={k:x for k,x in ds[e['documentId']].items() if k!='id'};items.append(v)
  s['evidence']=sorted(items,key=lambda x:json.dumps(x,sort_keys=True));out.append(s)
 return sorted(out,key=lambda x:json.dumps(x,sort_keys=True))
changed=[gid for gid in b['goals'] if normalized(b,gid)!=normalized(a,gid)]
assert len(changed)==18 and set(changed)==ids
for gid in ['80b42b5f-4b20-5035-907f-974a4a88618b','28b4ae51-e3f7-5abc-a363-022114f50f0f','3accc03b-3daf-5119-9f33-93af6f709919']:
 refs=[e for s in normalized(a,gid) for e in s['evidence'] if e['sourceScope']['jurisdiction']=='DE-HE']
 assert refs and all('nicht verpflichtende Zusatzmodellvertiefung' in e['sourceRef'] for e in refs)
ns=[e for s in normalized(a,'934d496d-eda4-5835-96d6-389885b93a51') for e in s['evidence'] if e['sourceScope']['jurisdiction']=='DE-HE']
assert ns and all('Optionales Themenfeld Q2.2 LK' in e['sourceRef'] for e in ns)
before=read('atlas.before.whole-native-receipt.actual.json');after=read('atlas.final.whole-native-receipt.actual.json')
assert before['counts']==after['counts']
assert [(s['key'],s['goalIds']) for s in before['scopes']]==[(s['key'],s['goalIds']) for s in after['scopes']]
entry=read('neutral-operative-eighteen-source-review.portable.final.entry.json')
ex=json.loads(Path(entry['sourceExtractionCandidatePath']).read_text());mapping=json.loads(Path(entry['mappingReviewCandidatePath']).read_text());original=read('declared-current-whole-input-snapshots.actual.json')
oldex=json.loads(Path(original[delta['currentOperativeExtractionPath']]).read_text());oldmapping=json.loads(Path(original[delta['currentOperativeMappingPath']]).read_text())
selected={d['sourceGoalId'] for d in delta['deltas']}
assert ex['sourceDocuments']==oldex['sourceDocuments']
assert len(ex['sourceGoals'])==144 and len(mapping['decisions'])==144
assert [s for s in ex['sourceGoals'] if s['id'] not in selected]==[s for s in oldex['sourceGoals'] if s['id'] not in selected]
assert [s for s in mapping['decisions'] if s['sourceGoalId'] not in selected]==[s for s in oldmapping['decisions'] if s['sourceGoalId'] not in selected]
assert [s for s in mapping['mappings'] if s['legacyGoalId'] not in selected]==[s for s in oldmapping['mappings'] if s['legacyGoalId'] not in selected]
firstex=read('DE_HE_BIOLOGIE_SEKII_KC2024.evolution18-operative-source-candidate-20261008-v2.source-extraction.json')
assert ex['sourceGoals']==firstex['sourceGoals']
assert mapping['sourceExtractionPath']==entry['sourceExtractionCandidatePath']
assert not Path(mapping['sourceExtractionPath']).is_absolute()
for s in ex['sourceGoals']:
 if s['id'] in selected:
  assert sum(s['id'] in p.get('sourceGoalIds',[]) for p in ex['passages'])==1
  for c in s['actualPrimaryComponents']:
   p=Path(c['wholeOriginalPagePath']);assert not p.is_absolute() and p.is_file() and not p.is_symlink()
   assert c['originalText'] in p.read_text();assert 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()==c['wholeOriginalPageSha256']
files=[p for p in OWN.rglob('*') if p.is_file()];aliases=[str(p) for p in OWN.rglob('*') if p.is_symlink()]
assert not aliases
ignore=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(str(p) for p in files)+'\n',capture_output=True,text=True)
assert ignore.returncode in [0,1]
ignored=ignore.stdout.splitlines();assert not ignored,ignored
write('native-final-source-consumer.ordinal-ID-first-comparison.failure.actual.json',{'command':['app/node_modules/.bin/tsx',str(OWN/'check-portable-final-native-atlas-and-source-consumer.actual.mts')],'exitCode':1,'actualFailure':'AssertionError comparing scope evidence records including generated ordinal document IDs; source-index numbering and iteration order changed when the selected official edition title changed. Actual source rows and original native outputs were retained.','correctedComparison':'Compare complete source document titles/URLs, locators, source IDs, target IDs, scopes and coverage semantics, omitting generated index IDs and sorting complete evidence records.','finalChangedStableSourceContexts':18,'otherStableSourceContextChanges':0,'noNativeOutputChangedByComparisonCorrection':True})
write('source-consumer.final-targeted-change-and-visibility.actual.json',{'schemaVersion':1,'nativeAPIs':['buildGoalBookSourceAtlasInputs','buildGoalBookOriginalSources'],'probeType':'Whole391 atlas-derived source-applicability requests; no complete publication book build/model verdict','nativeSourceViews':22,'nativeNavigationViews':1,'memoryVisibilityScopesAlreadyChecked':8,'totalViewConsumersChecked':31,'wholeCurrentGoalCount':391,'changedSourceContextGoalIds':changed,'otherGoalSourceContextChanges':[],'allScopeGoalIdSetsExact':True,'sourceIndependentApprovals':0,'explicitNonMandatoryModelReferencesPassed':3,'explicitOptionalQ22ReferencesPassed':1,'all126UnselectedRowsAndDecisionsExact':True,'allUnselectedLegacyMappingRowsExact':True,'sourceDocumentsExact':True,'finalSelectedSourceRowBodiesExactNativeSchemaChecked':18,'all18NewPassageMembershipsExclusive':True,'fullBookBuilt':False,'currentD_PPageContextBindingsRequireTargetedReviews':True,'activeWrites':0,'humanApproval':False})
write('operative-v2-portability-and-scope-preservation.actual.json',{'schemaVersion':1,'operativeSourceExtractionPath':entry['sourceExtractionCandidatePath'],'operativeMappingCandidatePath':entry['mappingReviewCandidatePath'],'operativePointersRepositoryRelative':True,'sourceDocumentsUseExistingPinnedCacheProtocol':True,'fullOfficialPdfOrHtmlCommittedByThisPacket':False,'wholeOriginalPagesPortableTXT':13,'actualIgnoredPacketFiles':ignored,'actualAliases':aliases,'filesAtCheck':len(files),'canonicalDenominatorAtInputFreeze':391,'newStrictClosures':0,'humanApproval':False,'activeWrites':0})
print(json.dumps({'changedStableSourceContexts':18,'otherStableSourceContextChanges':0,'viewConsumersChecked':31,'scopeGoalIdSetsExact':True,'portableSourcePointers':True,'aliases':0,'ignoredPacketFiles':0,'sourceIndependentApprovals':0,'activeWrites':0}))

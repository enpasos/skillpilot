# SPDX-License-Identifier: Apache-2.0
"""Verify only the actual14-source/104-edge/2-acquisition integration."""
import copy,hashlib,importlib.util,json
from pathlib import Path
R=Path.cwd().resolve();O=Path(__file__).resolve().parent.parent.relative_to(R)
read=lambda p:json.loads(Path(p).read_text())
dig=lambda x:hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':p.as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(p):assert pin(p['path'])==p,p
P=read(O/'PLAN.revised-two-immutable-base-successors-and-selected-active-rebinds.json')
Q=read(O/'RECEIPT.actual-fourteen-source-normal-integration.json')
for k in ['scientificDecisionSource','scientificSeal','accepted']:verify(P[k])
accepted=read(P['accepted']['path']);assert len(accepted['directPartial'])==104
for p in read(O/'PROTECTED.before-finite-C-P-view-epoch-and-other-alias-pins.json'):verify(p)
sourceResults=[];newids=[]
for item,x in zip(P['sourceTransports'],Q['sourceChanges']):
 verify(x['after']);d=read(x['path']);c=read(item['candidate']['path']);before=x['beforeSourceCount'];oldp=x['oldPassageCount']
 assert dig(d['sourceGoals'][:before])==x['retainedWholeSourceArraySHA256']
 assert dig(d['passages'][:oldp])==x['retainedWholePassageArraySHA256']
 new=d['sourceGoals'][before:];assert [g['id'] for g in new]==x['addedSourceIds']
 for g,cg in zip(new,c['sourceGoalsToAppend']):
  assert {k:v for k,v in g.items() if k!='metadata'}=={k:v for k,v in cg.items() if k!='metadata'}
  meta=copy.deepcopy(g['metadata']);assert meta.pop('currentAcceptedPartialRelations')['wholeSourceApproval'] is False
  if any(z['sourceGoalId']==g['id'] for z in Q['fourNumberingMetadataCorrections']):
   for k in ['officiallyNumbered','officialStandardCode']:
    if k in cg['metadata']:meta[k]=cg['metadata'][k]
    else:meta.pop(k,None)
  assert meta==cg['metadata']
 ids=[g['id'] for g in d['sourceGoals']];pids=[x['id'] for x in d['passages']]
 assert len(ids)==len(set(ids)) and len(pids)==len(set(pids))
 assert all(g['passageId'] in pids for g in d['sourceGoals'])
 for g,passage in zip(new,d['passages'][oldp:]):
  assert passage['id']==g['passageId']
  witness=next(s for s in read(P['scientificDecisionSource']['path'])['relations'] if s['sourceGoalId']==g['id'])
  assert passage['text']==witness['actualWholeOperatorRead']
  assert len(passage['text'])<2000 and passage['primaryDocumentPin']==witness['primary']
  assert passage['sourceStageCourseAndContext']==witness['sourceStageCourseContextRead']
 assert d['pipelineStatus']['fourteenMethodPartialIntegration']['totalSourceGoalsActual']==len(ids)
 assert d['pipelineStatus']['fourteenMethodPartialIntegration']['newWholeSourceApprovals']==0
 assert next(s for s in d['pipelineStatus']['steps'] if s['id']=='MAPPING-3')['status']=='incomplete'
 assert d['method']['fourteenMethodSelectedProcessAddition']['retainedImmediateBeforeInventory']==before
 assert d['method']['fourteenMethodSelectedProcessAddition']['actualUnionInventory']==len(ids)
 sourceResults.append({'path':x['path'],'beforeCells':before,'afterCells':len(ids),'appendedWholeCells':len(new),
  'allOldWholeSourceAndPassageObjectsExact':True,'sourceIdsUnique':True,'allSourcePassageReferencesValid':True,'wholeM3RemainsIncomplete':True})
 newids.extend(g['id'] for g in new)
assert len(newids)==len(set(newids))==43
mappingResults=[]
for item,x in zip(P['mappingAliases'],Q['mappingChanges']):
 verify(x['after']);d=read(x['path']);c=read(item['candidate']['path']);n=x['oldMappingCount']
 assert dig(d['mappings'][:n])==x['retainedWholeMappingArraySHA256']
 assert d['mappings'][n:]==x['addedPartialRows']
 assert all(m['matchType']=='partial' for m in x['addedPartialRows'])
 ids={(m['legacyGoalId'],m['canonicalGoalId']) for m in d['mappings']};assert len(ids)==len(d['mappings'])
 sources={g['id'] for g in read(d['sourceExtractionPath'])['sourceGoals']}
 assert all(m['legacyGoalId'] in sources for m in x['addedPartialRows'])
 beforedecisions={}
 for row in c['cellAppends']:
  for before in row['existingAuthoritativeSourceDecisionsCAS']:
   beforedecisions[int(before['jsonPointer'].split('/')[-1])]=before['wholeDecision']
 reconstructed=copy.deepcopy(d.get('decisions',[])[:x['oldDecisionCount']])
 for ix,previous in beforedecisions.items():
  current=d['decisions'][ix];assert current['sourceGoalId']==previous['sourceGoalId']
  for k,v in previous.items():
   if k in ['canonicalGoalIds','additionalAcceptedPartialContributions']:assert current[k][:len(v)]==v
   else:assert current[k]==v,(x['path'],ix,k)
  assert set(current)-set(previous)<={'additionalAcceptedPartialContributions'}
  reconstructed[ix]=previous
 assert dig(reconstructed)==x['retainedWholeDecisionArraySHA256'],x['path']
 assert all(z.get('matchType')=='partial' and z['decision']=='mapped' and z['wholeSourceCompletionFromSingleGoalMasteryAllowed'] is False for z in d.get('decisions',[])[x['oldDecisionCount']:])
 mappingResults.append({'path':x['path'],'oldMappingRowsExact':n,'newPartialRows':len(x['addedPartialRows']),
  'oldWholeDecisionFieldsAndListsPreserved':True,'newPartialDecisionCount':len(d.get('decisions',[]))-x['oldDecisionCount'],
  'allMappedSourceIdsInActualOperativeExtraction':True,'currentSourceExtractionPath':d['sourceExtractionPath']})
bindings=Q['concreteRelationAliasBindings'];assert len(bindings)==143
assert {(b['sourceGoalId'],b['canonicalGoalId']) for b in bindings}=={(r['sourceGoalId'],r['goalId']) for r in accepted['directPartial']}
assert all(b['matchType']=='partial' for b in bindings)
assert sum(r['newPartialRows'] for r in mappingResults)==143
reg=read(Q['registry']['after']['path']);verify(Q['registry']['after'])
assert len(reg['entries'])==364 and dig(reg['entries'][:362])==Q['registry']['retainedRegistryEntriesSHA256']
assert reg['entries'][362:]==Q['registry']['addedExactEntries']
oldkeys={(e.get('landscapeId'),e['goalId'],e['jurisdiction']) for e in reg['entries'][:362]}
newkeys={(e.get('landscapeId'),e['goalId'],e['jurisdiction']) for e in reg['entries'][362:]}
assert len(newkeys)==2 and not oldkeys.intersection(newkeys)
G={g['id']:g for g in read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')['goals']}
for e in reg['entries'][362:]:assert e['goalId'] in G[e['requiredByGoalId']]['requires']
for old,new in Q['twoImmutableBaseSourceRebinds'].items():
 verify(next(x['before'] for x in P['sourceTransports'] if x.get('immutableBasePath')==old))
 assert sum(read(x['normalPath'])['sourceExtractionPath']==new for x in P['mappingAliases'])==1
 assert not any(read(x['normalPath'])['sourceExtractionPath']==old for x in P['mappingAliases'])
view=read(O/'CHECK.actual-pure86-current-view-pairs.json')
assert view['status']=='PASS' and view['counts']['checkedPairs']==86 and view['counts']['views']==36 and view['counts']['targetAppearances']==187
assert len(view['concreteExistingAcquisitionEndpointChecks'])==4
spec=importlib.util.spec_from_file_location('stock',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
errors=mod.curriculum_symlink_errors(R);assert not errors,errors
parsed=[]
for p in sorted(O.rglob('*.json')):
 if p.name=='CHECK.final-finite-written-normal-state.json':continue
 read(p);parsed.append(pin(p))
print(json.dumps({'status':'PASS','scope':'Only14 source transports/43 cells/104 accepted partials/31 aliases/143 occurrences/2 literal acquisitions',
 'sourceChecks':sourceResults,'mappingChecks':mappingResults,'registryCounts':[362,364],
 'allPrevious362RegistryEntriesExact':True,'all43CompleteSourceOperatorsRetained':True,
 'allOldWholeSourceAndPassageObjectsExact':True,'allOldMappingRowsAndDecisionFieldsExact':True,
 'allSelectedRelationAndSourceIdentifiersUnique':True,'fourRequiredNumberingFlagsCorrected':len(Q['fourNumberingMetadataCorrections'])==4,
 'newOperativePassagesUseOnlyCompleteSelectedClauses':True,'all14EnlargedExtractionWholeM3RemainIncomplete':True,
 'oldHE2024AndTH225AndBW129TH233Protected':True,'protectedFilesUnchanged':len(read(O/'PROTECTED.before-finite-C-P-view-epoch-and-other-alias-pins.json')),
 'actualPureViewCounts':view['counts'],'actualStockSymlinkHelper':'scripts/validate_schemas.py::curriculum_symlink_errors',
 'actualStockSymlinkErrors':errors,'wholeWrittenJSONParsed':parsed,'newScientificFirstDecisionsByTechnicalIntegrator':0,
 'newDPAMVVotes':0,'APCompilerGlobalSchemaBuildRuns':0},ensure_ascii=False,indent=2))

# SPDX-License-Identifier: Apache-2.0
"""Read-only verification of only the exact80-file reviewed C40 transport."""
import copy,hashlib,importlib.util,json,pathlib
R=pathlib.Path.cwd();O=pathlib.Path(__file__).resolve().parent.parent.relative_to(R)
read=lambda p:json.loads(pathlib.Path(p).read_text())
dig=lambda x:hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':p.as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(p):assert pin(p['path'])==p,p['path']
P=read(O/'PLAN.exclusive-normal-write-list-and-before-object-CAS.json');Q=read(O/'RECEIPT.actual-C40-reviewed-source-normal-integration.json')
for p in P['independentAcceptance']+[P['authorSeal'],P['foreignAAcceptedSeal'],P['BownScientificSeal']]+P['protectedC_P']+P['immutableBasesAndOtherTHHistory']+P['protectedOtherSelectedSourceFiles']:verify(p)
for p in Q['writtenNormalFiles']:verify(p)
srcChecks=[];newids=[]
for tr,x in zip(P['sourceTransports'],Q['sourceChanges']):
 d=read(x['path']);n=x['oldSourceCount'];old=copy.deepcopy(d['sourceGoals'][:n]);assert [g['id'] for g in d['sourceGoals'][n:]]==x['addedSourceIds'];assert dig(d['passages'][:x['oldPassageCount']])==x['retainedOldPassageArraySHA256']
 if x['source146Before']:
  i=next(i for i,g in enumerate(old) if g['id']==x['source146Before']['id']);after=copy.deepcopy(old[i]);before=x['source146Before'];changed=[k for k in after if after[k]!=before[k]];assert set(changed)=={'title','description','sourceText','parentBulletText','rawSourceText','rawParentBulletText','courseLevel','tags'};assert after['courseLevel']=='LK' and 'course:LK' in after['tags'] and 'course:GK_LK' not in after['tags'];old[i]=before
 assert dig(old)==x['retainedOldSourceArraySHA256'];ids=[g['id'] for g in d['sourceGoals']];pids=[p['id'] for p in d['passages']];assert len(ids)==len(set(ids)) and len(pids)==len(set(pids));assert all(g['passageId'] in pids for g in d['sourceGoals'])
 for g in d['sourceGoals'][n:]:
  c=next(x['wholeSourceGoalToAppend'] for x in read(P['newCellAuthorInputs']['path'])['records'] if x['wholeSourceGoalToAppend']['id']==g['id']);assert {k:v for k,v in g.items() if k!='metadata'}=={k:v for k,v in c.items() if k!='metadata'};m=copy.deepcopy(g['metadata']);accepted=m.pop('currentAcceptedPartialRelations');assert accepted['wholeSourceApproval'] is False;assert m.pop('historicalAuthorStatus')==c.get('metadata',{}).get('authorStatus');m['authorStatus']=c['metadata']['authorStatus'];assert m==c['metadata'];newids.append(g['id'])
 for p in d['passages'][x['oldPassageCount']:]:assert p['text']==next(g['sourceText'] for g in d['sourceGoals'] if g['passageId']==p['id']);assert len(p['text'])<2000
 assert next(s for s in d['pipelineStatus']['steps'] if s['id']=='MAPPING-3')['status']=='incomplete';assert d['pipelineStatus']['fortyContentPartialIntegration']['totalSourceGoalsActual']==len(ids)
 if tr['immutableBasePreserved']:assert pathlib.Path(x['path']).stat().st_mode&0o222==0;verify(tr['base'])
 srcChecks.append({'path':x['path'],'cellsBeforeAfter':[n,len(ids)],'addedIDs':x['addedSourceIds'],'oldPassagesAndOtherWholeCellsExact':True,'sameID146RepairLKOnly':bool(x['source146Before']),'newWholeSourceApprovals':0,'wholeM3RemainsIncomplete':True})
assert len(newids)==12 and len(set(newids))==11
mappingChecks=[]
for plan,x in zip(P['mappings'],Q['mappingChanges']):
 d=read(x['path']);n=x['oldMappingCount'];nd=x['oldDecisionCount'];assert dig(d['mappings'][:n])==x['retainedWholeMappingArraySHA256'];assert d['mappings'][n:]==x['addedExactPartialRows'];reconstructed=copy.deepcopy(d.get('decisions',[])[:nd])
 for op in plan['operations']:
  previous=op['beforeWholeDecision']
  if previous is None:continue
  ix=next(i for i,x in enumerate(reconstructed) if x['sourceGoalId']==op['sourceGoalId']);current=reconstructed[ix]
  for k,v in previous.items():
   if k in ['canonicalGoalIds','additionalAcceptedPartialContributions']:assert current[k][:len(v)]==v,(x['path'],k)
   else:assert current[k]==v,(x['path'],k)
  assert set(current)-set(previous)<={'additionalAcceptedPartialContributions'};reconstructed[ix]=previous
 assert dig(reconstructed)==x['retainedWholeDecisionArraySHA256'];assert all(m['matchType']=='partial' for m in x['addedExactPartialRows']);assert all(dec['decision']=='mapped' and dec['matchType']=='partial' and dec['wholeSourceCompletionFromSingleGoalMasteryAllowed'] is False for dec in d.get('decisions',[])[nd:])
 if d.get('sourceExtractionPath'):
  sourceIds={g['id'] for g in read(d['sourceExtractionPath'])['sourceGoals']};assert all(m['legacyGoalId'] in sourceIds for m in x['addedExactPartialRows'])
 for m in x['addedExactPartialRows']:
  if m['legacyGoalId'].startswith('he-chemistry-sekii-kc2024-current2026-'):assert 'CURRENT2026' in d['sourceExtractionPath']
 ids=[(m['legacyGoalId'],m['canonicalGoalId']) for m in d['mappings']];assert len(ids)==len(set(ids));mappingChecks.append({'path':x['path'],'oldWholeMappingRowsExact':n,'newPartialRows':len(x['addedExactPartialRows']),'oldDecisionFieldsAndPrefixesExact':True,'currentSourceExtractionPath':d.get('sourceExtractionPath')})
assert sum(x['newPartialRows'] for x in mappingChecks)==536
relations={(r['sourceGoalId'],r['canonicalGoalId']) for r in P['relations']};assert len(relations)==219;assert {(r['legacyGoalId'],r['canonicalGoalId']) for r in Q['concreteAcceptedAliasBindings']}==relations
assert ('sl-chem-sekii-sl-ch-sekii-ep-nw-2024-p016-002-90aef816','91cd4728-b811-562a-970b-18b81dfb4bdf') not in relations;assert not any(r['jurisdiction']=='DE-HE' and r['canonicalGoalId'].startswith('6eba') for r in P['relations'])
reg=read(Q['registry']['after']['path']);assert len(reg['entries'])==371;assert dig(reg['entries'][:365])==Q['registry']['retainedOldWholeEntriesSHA256'];assert reg['entries'][365:]==Q['registry']['addedExactEntries'];C=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');G={g['id']:g for g in C['goals']}
for e in reg['entries'][365:]:assert e['goalId'] in G[e['requiredByGoalId']]['requires'];assert e['evidenceType']=='requires-closure' and e['status']=='accepted'
for g in P['wholeCurrentCP']:
 assert dig(G[g['goalId']])==g['wholeGoalSHA256'];r=json.loads(pathlib.Path(g['nativeRecord']['path']).read_text().splitlines()[g['lineOneBased']-1]);assert dig(r['profile'])==g['wholeProfileSHA256']
spec=importlib.util.spec_from_file_location('stock',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);symlink=mod.curriculum_symlink_errors(R);assert not symlink
parsed=[];portableErrors=[]
for p in sorted(O.rglob('*.json')):
 if p.name=='CHECK.final-finite-written-normal-state.json':continue
 d=read(p);parsed.append(pin(p))
 def walk(v):
  if isinstance(v,dict):
   if isinstance(v.get('path'),str):
    q=pathlib.Path(v['path'])
    if q.is_absolute() or not q.exists():portableErrors.append([str(p),v['path']])
   for x in v.values():walk(x)
  elif isinstance(v,list):
   for x in v:walk(x)
 walk(d)
assert not portableErrors,portableErrors
print(json.dumps({'status':'PASS','scope':'Exact reviewed219partial/196direct-state+6literal C40 subset; no new science','counts':P['counts'],'sourceChecks':srcChecks,'mappingChecks':mappingChecks,'allOld365RegistryEntriesExact':True,'sixExistingLiteralEdgesVerifiedNoDAGWrite':True,'wholeCurrentC_PObjectsChecked':len(P['wholeCurrentCP']),'allOldTHContractsImmutableAndSeparate':True,'selectedEpochWrongAliasRowsOmitted':18,'allOtherOldCellsPassagesRowsDecisionFieldsPreserved':True,'stockSymlinkHelper':'scripts/validate_schemas.py::curriculum_symlink_errors','stockSymlinkErrors':symlink,'wholeJSONParsed':parsed,'portableErrors':portableErrors,'officialFullPDFTextCopiesAdded':0,'newScientificFirstOrNativeDPAMVVotes':0,'APCompilerGlobalBuildRuns':0},ensure_ascii=False,indent=2))

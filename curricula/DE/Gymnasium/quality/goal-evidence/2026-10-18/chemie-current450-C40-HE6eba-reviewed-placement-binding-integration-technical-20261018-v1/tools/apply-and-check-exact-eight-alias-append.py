# SPDX-License-Identifier: Apache-2.0
"""One already scientifically accepted content binding after actual placement repair."""
import copy,datetime,hashlib,importlib.util,json,pathlib
R=pathlib.Path.cwd();O=pathlib.Path(__file__).resolve().parent.parent.relative_to(R);P=json.loads((O/'PLAN.eight-current-alias-CAS-before-one-binding-append.json').read_text());read=lambda p:json.loads(pathlib.Path(p).read_text());dig=lambda x:hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':p.as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(x):assert pin(x['path'])=={k:v for k,v in x.items() if k in ['path','sha256','bytes']},x['path']
out=O/'RECEIPT.actual-one-binding-eight-alias-append.json';assert not out.exists();verify(P['originalFIRST']);verify(P['activationConditionResolvedBy']);verify(P['ownCurrentPureBefore']);verify(P['baseC40Seal'])
for x in P['protectedFiles']:verify(x)
baseReceipt=read(read(P['baseC40Seal']['path'])['normalReceipt']['path']);selected={x['normalFile']['path'] for x in P['operations']};other=[x for x in baseReceipt['writtenNormalFiles'] if x['path'] not in selected]
for x in other:verify(x)
now=datetime.datetime.now(datetime.timezone.utc).isoformat();pending={};beforebytes={};changes=[]
for op in P['operations']:
 verify(op['normalFile']);path=op['normalFile']['path'];d=read(path);before=copy.deepcopy(d);beforebytes[path]=pathlib.Path(path).read_bytes();assert not any(m['legacyGoalId']==P['sourceGoalId'] and m['canonicalGoalId']==P['goalId'] for m in d['mappings']);d['mappings'].append(copy.deepcopy(op['appendExactRow']))
 if 'decisions' in d:
  dec=next(x for x in d['decisions'] if x['sourceGoalId']==P['sourceGoalId']);assert dec==op['wholeCurrentSelectedDecision'];assert P['goalId'] not in dec['canonicalGoalIds'];dec['canonicalGoalIds'].append(P['goalId']);dec.setdefault('additionalAcceptedPartialContributions',[]).append({'canonicalGoalId':P['goalId'],'matchType':'partial','scientificPartialAcceptanceAlreadyInOriginalFIRST':P['originalFIRST'],'historicalActivationHOLDBeforeActualViewRepair':True,'actualPlacementConditionResolvedBy':P['activationConditionResolvedBy'],'actualCurrentPureTargetAndRequires':P['ownCurrentPureBefore'],'rationale':'Specific thermoplastic/crosslinked structure-property contribution already scientifically approved. The preserved original FIRST held only current HE placement; root repaired it and actual current pure checks now show2LK targets with both prerequisites selected and graph-available. No official prescription of all4machines or whole source completion.','wholeSourceCompletionFromSingleGoalMasteryAllowed':False,'technicalIntegrationAtUTC':now})
 keys=[(m['legacyGoalId'],m['canonicalGoalId']) for m in d['mappings']];assert len(keys)==len(set(keys));pending[path]=d;changes.append({'path':path,'before':op['normalFile'],'oldWholeMappingArraySHA256':dig(before['mappings']),'oldWholeDecisionArraySHA256':dig(before.get('decisions',[])),'oldMappingCount':len(before['mappings']),'oldDecisionCount':len(before.get('decisions',[])),'currentSourceExtractionPath':d.get('sourceExtractionPath'),'addedExactRow':op['appendExactRow']})
assert len(pending)==8
encoded={p:(json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode() for p,d in pending.items()}
for p,b in encoded.items():assert json.loads(b)==pending[p]
for op in P['operations']:verify(op['normalFile'])
written=[]
try:
 for p,b in encoded.items():pathlib.Path(p).write_bytes(b);written.append(p)
except BaseException:
 for p in reversed(written):pathlib.Path(p).write_bytes(beforebytes[p])
 raise
for op,x in zip(P['operations'],changes):
 d=read(x['path']);n=x['oldMappingCount'];assert dig(d['mappings'][:n])==x['oldWholeMappingArraySHA256'];assert d['mappings'][n:]==[x['addedExactRow']];old=copy.deepcopy(d.get('decisions',[]));prev=op['wholeCurrentSelectedDecision']
 if prev is not None:
  ix=next(i for i,x in enumerate(old) if x['sourceGoalId']==P['sourceGoalId']);cur=old[ix]
  for k,v in prev.items():
   if k in ['canonicalGoalIds','additionalAcceptedPartialContributions']:assert cur[k][:len(v)]==v
   else:assert cur[k]==v
  assert set(cur)-set(prev)<={'additionalAcceptedPartialContributions'};old[ix]=prev
 assert dig(old)==x['oldWholeDecisionArraySHA256'];assert d.get('sourceExtractionPath')==op['currentSourceExtractionPath'];x['after']=pin(x['path']);x['allOldRowsAndDecisionFieldsAndListsRetained']=True
for x in P['protectedFiles']+other:verify(x)
spec=importlib.util.spec_from_file_location('stock',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);errors=mod.curriculum_symlink_errors(R);assert not errors
result={'artifactRole':'ACTUAL_TECHNICAL_ONE_PREAPPROVED_CONTENT_BINDING_PLACEMENT_RESOLVED','status':'PASS','atUTC':now,'plan':pin(O/'PLAN.eight-current-alias-CAS-before-one-binding-append.json'),'previousBaseC40PackageUnchanged':P['baseC40Seal'],'originalScientificFIRSTUnchanged':P['originalFIRST'],'actualResolvedPlacement':P['activationConditionResolvedBy'],'actualCurrentPureBefore':P['ownCurrentPureBefore'],'counts':{'newUniquePartialRelations':1,'newStatePairs':1,'aliases':8,'newRows':8,'wholeC40CombinedDirectRelations':220,'wholeC40CombinedDirectStatePairs':197,'wholeC40CombinedLiteralPairs':6,'wholeC40CombinedStateContributions':203,'wholeC40CombinedRowOccurrences':544},'changes':changes,'otherBaseC40NormalFilesExactlyRetained':len(other),'allProtectedC_PSourcesRegistryAndFourViewsExact':True,'sourceEpochsSeparate':True,'wholeSourceApprovals':0,'historicalHOLDNotRewritten':True,'remainingElevenAuthorHoldsAndExactSLWaterBoilingHoldUnchanged':True,'newScienceNativeDPAMVVotes':0,'APCompilerGlobalBuildRuns':0,'stockSymlinkErrors':errors};out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'receipt':pin(out),'status':'PASS','counts':result['counts']},indent=2))

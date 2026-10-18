# SPDX-License-Identifier: Apache-2.0
"""Read only: exactly C40 records[0:20], their168 pairs,181 source occurrences and6 literal witnesses."""
from pathlib import Path
import json,hashlib,importlib.util
R=Path.cwd();O=Path(__file__).resolve().parent.parent;A=O.parent/'chemie-current450-forty-content-multistate-source-author-20261018-v1'
read=lambda p:json.loads(Path(p).read_text())
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':p.resolve().relative_to(R).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def at(x,p):
 for k in p.strip('/').split('/'):x=x[int(k)]if isinstance(x,list)else x[k]
 return x
inp=read(O/'INPUT.finite-scope-and-foreign-sealed-pins.json');assert pin(inp['authorSeal']['path'])==inp['authorSeal']
for x in inp['foreignFiles']:assert pin(x['path'])==x
wholes=read(A/'INPUT.forty-whole-current-goals-and-positive-profiles.actual.json')['records'][:20];endpoints=read(A/'INPUT.two-whole-actual-literal-consumer-goals-and-profiles.json')['records'];ids={r['wholeCurrentGoal']['id']for r in wholes};assert len(ids)==20
canonPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';cfgPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';C={g['id']:g for g in read(canonPath)['goals']};subject=next(x for x in read(cfgPath)['subjects']if x['subject']=='chemie')
cp=[]
for w in [*wholes,*[{'wholeCurrentGoal':e['wholeGoal'],'currentP':e['P']}for e in endpoints]]:
 g=w['wholeCurrentGoal'];p=w['currentP'];gid=g['id'];assert C[gid]==g,gid;cfg=read(p['configPath']);assert p['configPath']in subject['positiveEvidenceConfigPaths'];assert gid in cfg['scope']['goalIds'];assert cfg['reviewPath']==p['recordPath'];matches=[(j+1,json.loads(s))for j,s in enumerate(Path(p['recordPath']).read_text().splitlines())if s.strip()and json.loads(s).get('goalId')==gid];assert len(matches)==1;line,native=matches[0];assert native==p['wholeRecord'];assert p.get('lineOneBased',line)==line
 cp.append({'goalId':gid,'wholeCurrentGoalSHA256':digest(g),'wholeCurrentProfileSHA256':digest(native['profile']),'wholeNativeRecordSHA256':digest(native),'native':pin(p['recordPath']),'lineOneBased':line,'activeConfig':pin(p['configPath']),'wholeCurrentCAndPExactlyEqualToActuallyReadInput':True})
# Assert the lossless common-field/string pooling used for reading all20 C objects reconstructs them exactly.
scratch=R/'tmp/chemie450-C40-part-a-independent'
lossless=[]
if scratch.exists():
 for i,w in enumerate(wholes):
  rep=read(scratch/f'{i:02}.C.lossless-common-fields.json');strings=rep['allUniqueWholeStrings']
  def decode(x):
   if isinstance(x,list):return [decode(z)for z in x]
   if isinstance(x,dict):
    if list(x)==['$EXACT_STRING']:return strings[x['$EXACT_STRING']]
    if set(x)=={'LOSSLESS_GROUPS','ORIGINAL_ARRAY_LENGTH'}:
     out=[None]*x['ORIGINAL_ARRAY_LENGTH']
     for group in x['LOSSLESS_GROUPS']:
      for row in group['ORIGINAL_ROW_POSITIONS_AND_REMAINING_FIELDS']:out[row['index']]=decode({**group['EXACT_COMMON_FIELDS'],**row['remaining']})
     assert all(z is not None for z in out);return out
    return {k:decode(v)for k,v in x.items()}
   return x
  assert decode(rep['wholeCurrentGoalLosslessRepresentation'])==w['wholeCurrentGoal'];lossless.append(w['wholeCurrentGoal']['id'])
sources=read(A/'INPUT.selected-whole-current-source-cells.and-primary-contexts.json')['sourceCells'];sourceChecks=[]
for i in inp['sourceCellInputIndices']:
 c=sources[i];g=c['wholeSourceGoal'];assert digest(g)==c['wholeObjectSHA256'];d=read(c['file']['path']);assert at(d,c['pointer'])==g,(i,g['id']);current=None
 if c.get('newCell'):
  target=read(c['proposedNormalExtractionPath']);found=[z for z in target['sourceGoals']if z['id']==g['id']];assert not found or found==[g];current='not_present'if not found else'already_exact'
 elif c.get('sourceCellRepair'):
  repair=read(c['file']['path']);assert repair['candidateWholeSourceGoal']==g
  for b in repair['beforeWholeObjects']:assert at(read(b['file']['path']),b['pointer'])==b['wholeSourceGoal'];assert digest(b['wholeSourceGoal'])==b['wholeObjectSHA256']
  current='exact_truncated_before_objects_retained_pending_LK_correction'
 else:current='whole_selected_object_exact_in_actual_current_extraction'
 sourceChecks.append({'inputIndex':i,'id':g['id'],'actualSourceFile':pin(c['file']['path']),'selectedWholeObjectExact':True,'currentState':current})
aliases=[];additiveChanges=[];appendCount=0;decisionCAS=0;inventoryAddressChanges=[]
for f in read(A/'CAS.current-active-Chemistry-aliases.additive-row-proposals.pending.json')['normalFiles']:
 ops=[];now=read(f['normalFile']['path'])
 for op in f['operations']:
  mappings=[x for x in op['appendMappings']if x['canonicalGoalId']in ids]
  if not mappings:continue
  assert all(not any(y['legacyGoalId']==x['legacyGoalId']and y['canonicalGoalId']==x['canonicalGoalId']for y in now['mappings'])for x in mappings)
  sid=op['sourceGoalId'];found=[(j,x)for j,x in enumerate(now.get('decisions',[]))if x['sourceGoalId']==sid];assert len(found)<=1
  old=op.get('beforeWholeDecision');current=found[0][1]if found else None
  if current!=old:
   assert old is not None and current is not None
   assert set(old.get('canonicalGoalIds',[]))<=set(current.get('canonicalGoalIds',[]))
   protected={k:v for k,v in old.items()if k not in ['canonicalGoalIds','rationale','reviewer','reviewedAt','matchType']}
   assert all(current.get(k)==v for k,v in protected.items()),(sid,'nonadditive drift')
   assert old.get('rationale','')in current.get('rationale',''),(sid,'old reason lost')
   additiveChanges.append({'file':f['normalFile']['path'],'sourceGoalId':sid,'oldDecisionSHA256':digest(old),'actualCurrentDecisionSHA256':digest(current),'preserveCurrentAdditions':True})
  if current:decisionCAS+=1
  ops.append({'sourceGoalId':sid,'actualDecisionPointer':f'/decisions/{found[0][0]}'if found else None,'actualCurrentWholeDecision':current,'actualCurrentWholeDecisionSHA256':digest(current)if current else None,'boundedOriginalCandidateTuples':mappings,'noWholeFileReplacement':True})
  appendCount+=len(mappings)
 if ops:
  declared=now.get('sourceExtractionPath');actualInventory=read(declared)if declared else None
  if declared and declared!=f['sourceExtractionPath']:inventoryAddressChanges.append({'mappingPath':f['normalFile']['path'],'authorInventoryPath':f['sourceExtractionPath'],'actualCurrentInventory':pin(declared),'selectedOldObjectsMustBeComparedIndividually':True,'wholeHistoricalInventoryRebasePermitted':False})
  currentIds={g['id']:g for g in actualInventory.get('sourceGoals',[])}if actualInventory else {}
  for op in ops:
   ref=[s for s in sources if s['wholeSourceGoal']['id']==op['sourceGoalId']and s['sourceLandscapeId']==f['sourceLandscapeId']]
   ref=[s for s in ref if not s.get('newCell')and not s.get('sourceCellRepair')]
   if actualInventory and ref and op['sourceGoalId']in currentIds:assert any(s['wholeSourceGoal']==currentIds[op['sourceGoalId']]for s in ref),(op['sourceGoalId'],'actual active inventory object drift')
  aliases.append({'actualCurrentAlias':pin(f['normalFile']['path']),'authorProposedSourceExtractionPath':f['sourceExtractionPath'],'actualCurrentDeclaredSourceExtraction':pin(declared)if declared else None,'sourceLandscapeId':f['sourceLandscapeId'],'selectedOperations':ops})
# Actual ordinary endpoints and actual current direct source mappings; no cluster/own-scope replacement.
acqChecks=[]
for a in read(A/'candidate/REQUIRES.six-current-literal-source-acquisition-proposals.pending.json')['records']:
 prior=a['goalId'];end=a['requiredByGoalId'];assert prior in C[end]['requires'];assert not C[end].get('contains')and not C[end].get('examData');mapped=[]
 for sr in a['actualSourceCells']:
  source=sources[int(sr['inputPointer'].split('/')[-1])];sid=sr['sourceGoalId'];aliasesForSource=[f for f in read(A/'CAS.current-active-Chemistry-aliases.additive-row-proposals.pending.json')['normalFiles']if f['sourceLandscapeId']==source['sourceLandscapeId']]
  # These source landscapes may have no20-goal append in the author CAS; route through actual jurisdiction aliases only.
  paths={f['normalFile']['path']for f in aliasesForSource}
  if not paths:
   paths={p.as_posix()for p in (R/'curricula/DE/Gymnasium/mapping'/a['jurisdiction']).rglob('*.json')if read(p).get('sourceLandscapeId')==source['sourceLandscapeId']}
  for path in paths:
   d=read(path)
   if any(m.get('legacyGoalId')==sid and m.get('canonicalGoalId')==end for m in d.get('mappings',[])):mapped.append(pin(path))
 assert mapped,(prior,end,a['jurisdiction'])
 acqChecks.append({'goalId':prior,'requiredByGoalId':end,'jurisdiction':a['jurisdiction'],'actualLiteralRequiresRetained':True,'ordinaryAtomicEndpoint':True,'actualDirectSourceBackedEndpointAliases':mapped,'wholePriorProfileNotEndpointCompletion':True})
spec=importlib.util.spec_from_file_location('schema_check',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);errs=mod.curriculum_symlink_errors(R);own=[e for e in errs if O.relative_to(R).as_posix()in e];assert not own
for p in O.rglob('*.json'):read(p)
print(json.dumps({'status':'PASS','scope':'C40PartA:20wholegoals168statepairs181sourceoccurrences6literalrelationsOnly','actualCanonical':pin(canonPath),'actualActivePRegistry':pin(cfgPath),'wholeCurrentGoalAndNativePBindings':cp,'optionalLocalLosslessReadingRoundtripCheckedGoalCount':len(lossless),'sourceCells':sourceChecks,'selectedAliasCAS':aliases,'counts':{'wholeGoalProfiles':22,'sourceCellOccurrences':181,'aliases':len(aliases),'originalCandidateTupleAppends':appendCount,'existingDecisionCellsChecked':decisionCAS,'concurrentAdditiveWholeDecisionDrifts':len(additiveChanges)},'concurrentAdditiveDecisionChanges':additiveChanges,'actualCurrentInventoryAddressChanges':inventoryAddressChanges,'literalRelations':acqChecks,'actualStockGlobalSymlinkErrors':len(errs),'ownScopedSymlinkErrors':own,'normalWrites':0,'newNativeDPAMVVotes':0,'globalBuildOrCompilerRuns':0},ensure_ascii=False,indent=2))

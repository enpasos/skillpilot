# SPDX-License-Identifier: Apache-2.0
"""One-shot CAS-guarded transport of the exact independently accepted C40 subset."""
import copy,datetime,hashlib,json,pathlib
R=pathlib.Path.cwd();O=pathlib.Path(__file__).resolve().parent.parent.relative_to(R);P=json.loads((O/'PLAN.exclusive-normal-write-list-and-before-object-CAS.json').read_text());T=R/'tmp/chemie-C40-integration'
read=lambda p:json.loads(pathlib.Path(p).read_text())
dig=lambda x:hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();return {'path':p.as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(p):assert pin(p['path'])==p,p['path']
receipt=O/'RECEIPT.actual-C40-reviewed-source-normal-integration.json';assert not receipt.exists(),'Already integrated'
for x in P['writeFiles']:
 if x['before']:verify(x['before'])
 else:assert not pathlib.Path(x['path']).exists(),x['path']
for x in P['protectedC_P']+P['immutableBasesAndOtherTHHistory']+P['protectedOtherSelectedSourceFiles']:verify(x)
for x in P['independentAcceptance']+[P['authorSeal'],P['foreignAAcceptedSeal'],P['BownScientificSeal']]:verify(x)
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat();rels={(r['sourceGoalId'],r['canonicalGoalId']):r for r in P['relations']};cells={r['wholeSourceGoalToAppend']['id']:r for r in read(P['newCellAuthorInputs']['path'])['records']};allBefore={x['path']:pathlib.Path(x['path']).read_bytes() for x in P['writeFiles'] if x['before']};pending={};sourceChanges=[]
for tr in P['sourceTransports']:
 d=read(tr['base']['path']);before=copy.deepcopy(d);newids=tr['newCellIds']
 if tr.get('source146Before'):
  ix=next(i for i,g in enumerate(d['sourceGoals']) if g['id']==tr['source146Before']['id']);assert d['sourceGoals'][ix]==tr['source146Before'];old=d['sourceGoals'][ix];new=tr['source146AfterRequired'];changed=[]
  for k in ['title','description','sourceText','parentBulletText','rawSourceText','rawParentBulletText','courseLevel','tags']:
   if old[k]!=new[k]:changed.append(k);old[k]=copy.deepcopy(new[k])
  assert set(changed)=={'title','description','sourceText','parentBulletText','rawSourceText','rawParentBulletText','courseLevel','tags'}
 for sid in newids:
  c=cells[sid];g=copy.deepcopy(c['wholeSourceGoalToAppend']);p=copy.deepcopy(c['wholePassageToAppend']);assert p['text']==g['sourceText'];rr=[r for r in rels.values() if r['sourceGoalId']==sid];assert rr
  meta=g.setdefault('metadata',{});meta['historicalAuthorStatus']=meta.get('authorStatus');meta['authorStatus']='independently accepted selected partial contributions; no whole official source approval';meta['currentAcceptedPartialRelations']={'acceptedRefs':[r['scientificAcceptedRef'] for r in rr],'wholeSourceApproval':False,'newScientificDecisionsByTechnicalIntegrator':0}
  d['sourceGoals'].append(g);d['passages'].append(p)
 ids=[g['id'] for g in d['sourceGoals']];pids=[p['id'] for p in d['passages']];assert len(ids)==len(set(ids));assert len(pids)==len(set(pids));assert all(g['passageId'] in pids for g in d['sourceGoals'])
 historicalPipeline=copy.deepcopy(d.get('pipelineStatus',{}));method=d.get('method');assert isinstance(method,dict);method['fortyContentAcceptedPartialAddition']={'technicalIntegration':str(O),'independentAcceptedRefs':P['independentAcceptance'],'retainedImmediateBeforeCells':len(before['sourceGoals']),'newCompleteSelectedCells':len(newids),'currentActualUnionCells':len(ids),'selectedSameIDCorrections':1 if tr.get('source146Before') else 0,'allOtherOldCellsAndPassagesExact':True,'noWholeOfficialStandardsUniverseClaim':True,'previousPipelineStatusHistorical':historicalPipeline}
 pipeline=d.setdefault('pipelineStatus',{});pipeline['currentStep']='MAPPING-3';pipeline['fortyContentPartialIntegration']={'status':'accepted-specific-partial-relations-only','totalSourceGoalsActual':len(ids),'retainedImmediateBeforeCells':len(before['sourceGoals']),'newCompleteSelectedCells':len(newids),'newWholeSourceApprovals':0,'newScientificFirstDecisionsByTechnicalIntegrator':0,'independentAcceptedRefs':P['independentAcceptance'],'wholeSourceCoverageComplete':False}
 for step in pipeline.get('steps',[]):
  if step['id']=='MAPPING-1':
   for ck in step.get('checks',[]):
    if ck['id']=='expected-topic-coverage':ck['details']=f"All {len(before['passages'])} previous passages retained exactly; {len(newids)} complete selected clause passages appended. Not a full standards inventory."
  if step['id']=='MAPPING-2':
   for ck in step.get('checks',[]):
    if 'source-goals-created'==ck['id'] or 'source-goal-count' in ck['id']:
     ck['details']=f"Current actual union {len(ids)}={len(before['sourceGoals'])} retained immediate-before cells +{len(newids)} complete selected operators. Historical peer/content counts remain in method.fortyContentAcceptedPartialAddition.previousPipelineStatusHistorical; no automatic full-standards claim."
  if step['id']=='MAPPING-3':
   step['status']='incomplete'
   for ck in step.get('checks',[]):
    if ck['id'] in ['m3-all-source-goals-reviewed','m3-all-source-goals-covered-by-canonical','all-source-goals-reviewed','all-source-goals-covered-by-canonical']:
     ck['passed']=False;ck['details']='New selected operators have accepted specific partial relations only. No whole official source completion or practical performance is established; previous completeness is historical.'
 assert next(s for s in pipeline['steps'] if s['id']=='MAPPING-3')['status']=='incomplete'
 pending[tr['destination']]=d;sourceChanges.append({'path':tr['destination'],'baseBefore':tr['base'],'basePreserved':tr['immutableBasePreserved'],'oldSourceCount':len(before['sourceGoals']),'newSourceCount':len(ids),'oldPassageCount':len(before['passages']),'addedSourceIds':newids,'retainedOldSourceArraySHA256':dig(before['sourceGoals']),'retainedOldPassageArraySHA256':dig(before['passages']),'source146Before':tr.get('source146Before'),'source146After':next((g for g in d['sourceGoals'] if g['id']==tr.get('source146Before',{}).get('id')),None),'wholeM3RemainsIncomplete':True})
mappingChanges=[];bindings=[]
for plan in P['mappings']:
 path=plan['before']['path'];d=read(path);before=copy.deepcopy(d);hasDecisions='decisions' in d;newrows=[];modifiedDecisions=[]
 if plan['afterSourceExtractionPath']!=plan['actualBeforeSourceExtractionPath']:d['sourceExtractionPath']=plan['afterSourceExtractionPath']
 for op in plan['operations']:
  sid=op['sourceGoalId'];rows=op['appendMappings'];selected=[rels[(m['legacyGoalId'],m['canonicalGoalId'])] for m in rows];d['mappings'].extend(copy.deepcopy(rows));newrows.extend(rows)
  for m,r in zip(rows,selected):bindings.append({'normalAlias':path,**m,'scientificAcceptedRef':r['scientificAcceptedRef'],'actualSourceExtractionPath':plan['afterSourceExtractionPath'],'wholeOfficialSourceCredit':False})
  if hasDecisions:
   existing=next((x for x in d['decisions'] if x.get('sourceGoalId')==sid),None);assert existing==op['beforeWholeDecision']
   contributions=[{'canonicalGoalId':m['canonicalGoalId'],'matchType':'partial','acceptedScientificRef':r['scientificAcceptedRef'],'rationale':r['rationale'],'wholeSourceCompletionFromSingleGoalMasteryAllowed':False} for m,r in zip(rows,selected)]
   if existing is not None:
    for m in rows:
     if m['canonicalGoalId'] not in existing['canonicalGoalIds']:existing['canonicalGoalIds'].append(m['canonicalGoalId'])
    existing.setdefault('additionalAcceptedPartialContributions',[]).extend(contributions);modifiedDecisions.append({'sourceGoalId':sid,'oldWholeDecisionSHA256':dig(op['beforeWholeDecision']),'currentScientificRefs':[r['scientificAcceptedRef'] for r in selected]})
   else:
    inventory=d['sourceExtractionPath'];sourcedata=pending.get(inventory) or read(inventory);g=next(x for x in sourcedata['sourceGoals'] if x['id']==sid)
    d['decisions'].append({'sourceGoalId':sid,'topicCode':g['topicCode'],'sourceSpan':g.get('sourceSpan',g.get('sourceRef')),'decision':'mapped','canonicalGoalIds':[m['canonicalGoalId'] for m in rows],'matchType':'partial','rationale':'Specific source-to-goal components independently accepted in the referenced actual informed FIRST decisions; all other source verbs/context remain separate.','reviewer':'Technical transport only; actual independent scientific acceptance references below','reviewedAt':NOW,'additionalAcceptedPartialContributions':contributions,'wholeSourceCompletionFromSingleGoalMasteryAllowed':False})
 keys=[(m['legacyGoalId'],m['canonicalGoalId']) for m in d['mappings']];assert len(keys)==len(set(keys)),path
 if d.get('sourceExtractionPath'):
  inventory=pending.get(d['sourceExtractionPath']) or read(d['sourceExtractionPath']);sourceids={x['id'] for x in inventory['sourceGoals']};assert all(m['legacyGoalId'] in sourceids for m in newrows),path
 pending[path]=d;mappingChanges.append({'path':path,'before':plan['before'],'oldMappingCount':len(before['mappings']),'newMappingCount':len(d['mappings']),'oldDecisionCount':len(before.get('decisions',[])),'newDecisionCount':len(d.get('decisions',[])),'retainedWholeMappingArraySHA256':dig(before['mappings']),'retainedWholeDecisionArraySHA256':dig(before.get('decisions',[])),'addedExactPartialRows':newrows,'existingDecisionExtensions':modifiedDecisions,'oldSourceExtractionPath':plan['actualBeforeSourceExtractionPath'],'newSourceExtractionPath':plan['afterSourceExtractionPath']})
regpath=P['registry']['before']['path'];reg=read(regpath);oldRegistry=copy.deepcopy(reg);L=read(P['registry']['literalAccepted']['path'])['records'];added=[]
for n,l in enumerate(L):
 ref={**P['registry']['literalAccepted'],'jsonPointer':f'/records/{n}'};e={'landscapeId':'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0','goalId':l['goalId'],'jurisdiction':l['jurisdiction'],'evidenceType':'requires-closure','requiredByGoalId':l['requiredByGoalId'],'status':'accepted','rationale':l['independentReasonEn']+' '+l['sourceScopeBoundary']+' Existing literal requires only; dependent mastery never implies prior mastery. Actual independent informed acceptance: '+ref['path']+ref['jsonPointer']+' (SHA256 '+ref['sha256']+'). Technical integration adds no new scientific/native vote, no whole official source credit and no learner execution. Source witnesses: '+', '.join(s['sourceGoalId'] for s in l['actualSourceCells'])+'.'};reg['entries'].append(e);added.append(e)
assert len(reg['entries'])==P['counts']['registryAfter'];pending[regpath]=reg
assert set(pending)=={x['path'] for x in P['writeFiles']};assert len(bindings)==P['counts']['newMappingRowOccurrences'];assert {(b['legacyGoalId'],b['canonicalGoalId']) for b in bindings}==set(rels)
encoded={p:(json.dumps(d,ensure_ascii=False,indent=2)+'\n').encode() for p,d in pending.items()}
for p,b in encoded.items():assert json.loads(b)==pending[p]
# All mutations are prepared and all finite checks above complete before the first normal write.
for x in P['writeFiles']:
 if x['before']:verify(x['before'])
written=[]
try:
 for p,b in encoded.items():pathlib.Path(p).write_bytes(b);written.append(p)
except BaseException:
 for p in reversed(written):
  if p in allBefore:pathlib.Path(p).write_bytes(allBefore[p])
  else:pathlib.Path(p).unlink()
 raise
for tr in P['sourceTransports']:
 if tr['immutableBasePreserved']:pathlib.Path(tr['destination']).chmod(0o444)
for x in sourceChanges:x['after']=pin(x['path'])
for x in mappingChanges:x['after']=pin(x['path'])
result={'artifactRole':'ACTUAL_TECHNICAL_NORMAL_INTEGRATION_NO_NEW_SCIENTIFIC_VOTE','atUTC':NOW,'plan':pin(O/'PLAN.exclusive-normal-write-list-and-before-object-CAS.json'),'independentAcceptance':P['independentAcceptance'],'counts':P['counts'],'sourceChanges':sourceChanges,'mappingChanges':mappingChanges,'concreteAcceptedAliasBindings':bindings,'registry':{'before':P['registry']['before'],'after':pin(regpath),'oldEntries':len(oldRegistry['entries']),'newEntries':len(reg['entries']),'retainedOldWholeEntriesSHA256':dig(oldRegistry['entries']),'addedExactEntries':added},'writtenNormalFiles':[pin(x['path']) for x in P['writeFiles']],'heldRelationsUnchanged':P['heldExactRelations'],'allElevenUnacceptedPairsRemainHeld':True,'excludedEpochWrongAliasOccurrences':P['excludedEpochWrongAliasOccurrences'],'newScientificFirstDecisions':0,'newNativeDPAMVVotes':0,'wholeOfficialSourceApprovals':0,'APCompilerGlobalBuildRuns':0,'allWholeSourceM3RemainIncomplete':True,'normalC_P_ViewsCanonicalDAGImagesChanged':False,'oldTH225And235ContractsByteExact':True}
receipt.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':'WRITTEN_FINITE_CHECK_PENDING','receipt':pin(receipt),'counts':P['counts'],'writtenFiles':len(written)},indent=2))

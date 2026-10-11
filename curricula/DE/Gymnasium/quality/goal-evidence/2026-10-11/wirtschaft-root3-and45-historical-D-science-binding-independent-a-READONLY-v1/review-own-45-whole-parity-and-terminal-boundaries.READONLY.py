import json, pathlib, hashlib, datetime, subprocess, collections
R=pathlib.Path('/home/enpasos/projects/skillpilot'); Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'; O=Q/'wirtschaft-forty-five-historical-D2-current-native-owner-followers-AUTHOR-INERT-v1'; V=O/'current-root-D12-qualified-prefix-registry-followers-v2'; OUT=pathlib.Path(__file__).parent
BIND={}
def bind(p):
 p=pathlib.Path(p);p=p if p.is_absolute()else R/p;b=p.read_bytes();v={'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)};BIND[v['path']]=v;return v
def obj(p):bind(p);return json.loads(pathlib.Path(p).read_text())
def verify(b):
 p=R/b['path']; a=bind(p);assert a['sha256']==('sha256:'+b['sha256'].removeprefix('sha256:')) and ('bytes'not in b or a['bytes']==b['bytes']), b['path'];return p
def stable(x):return json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':'))
def byid(x,gid):return next(v for v in x if v['goalId']==gid)
def deltas(a,b,p=''):
 if type(a)!=type(b):return [{'path':p,'before':a,'current':b}]
 if isinstance(a,dict):return sum((deltas(a.get(k),b.get(k),p+'/'+k)for k in sorted(set(a)|set(b))),[])
 if isinstance(a,list):
  if len(a)!=len(b):return [{'path':p,'before':a,'current':b}]
  return sum((deltas(x,y,p+'/'+str(i))for i,(x,y)in enumerate(zip(a,b))),[])
 return []if a==b else [{'path':p,'before':a,'current':b}]
def strip(x,keys):return {k:v for k,v in x.items()if k not in keys}
def normalize_page(p):
 omitted={'pageFingerprint','pageNumber','treeOrder','navigationOrder','requires','externalPrerequisites','reverseRequires','externalReverseRequires'}
 q=strip(p,omitted)
 q['wholeRequiresIdTitleUnion']=sorted((v['goalId'],v['title'])for v in p['requires']+p['externalPrerequisites'])
 q['wholeReverseRequiresIdTitleUnion']=sorted((v['goalId'],v['title'])for v in p['reverseRequires']+p['externalReverseRequires'])
 return q
def write(n,d):p=OUT/n;assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return bind(p)
started=datetime.datetime.now(datetime.timezone.utc).isoformat();head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip()
plan=obj(O/'actual-current45-native-groups-and-exact-original-science-plan.INERT.json'); c49=obj(verify(plan['sourceC49Scoping']));can=obj(verify(plan['currentCanonical']));canby={g['id']:g for g in can['goals']};bookcfg=obj(verify(plan['currentBookConfig']));P={x['goalId']:x for x in map(json.loads,verify(plan['currentCombinedP'][0]).read_text().splitlines())}
recordallowed={'campaignId','roundId','bundleFingerprint','bookDigest','pageFingerprint'}
runallowed={'campaignId','roundId','bundleFingerprint','bookDigest','promptFingerprint','criteriaFingerprint','independenceGroupId','batchId','batchInputFingerprint','goalIds','outputDigest','inputArtifacts'}
recordrows=[];runrows=[];goalrows=[];synthrows=[];sourcerows=[];pages=[]
for g in plan['groups']:
 n=R/g['outputDirectory']; h=R/g['exactWholeScienceHistoryDirectory']; originalS=obj(h/'synthesis-decisions.json'); newS=obj(n/'synthesis-decisions.json')
 for label,role in [('round-a','first'),('round-b','second')]:
  ni=obj(n/label/'description-review-input.json'); oi=obj(h/label/'description-review-input.json');nc=obj(n/label/'description-review-campaign.json');oc=obj(h/label/'description-review-campaign.json');batch=nc['batches'][0]['batchId'];newRecordsP=n/label/'results'/(batch+'.records.jsonl');bind(newRecordsP);nr=list(map(json.loads,newRecordsP.read_text().splitlines()));newRunP=n/label/'results'/(batch+'.run.json');newRun=obj(newRunP);sameOldRun=None
  assert nc['promptFingerprint']==oc['promptFingerprint']and nc['criteriaFingerprint']==oc['criteriaFingerprint']
  for gid in g['goalIds']:
   pair=g['originalPairs'][gid]; oldr=next(v for v in pair['existingIndependentRounds']if v['round']==role); oldRecordFile=verify(oldr['actualResults']);raw=next(l.rstrip(b'\r')for l in oldRecordFile.read_bytes().split(b'\n')if l.strip()and json.loads(l)['goalId']==gid);assert 'sha256:'+hashlib.sha256(raw).hexdigest()==oldr['actualRecordDigest']; oldRecord=json.loads(raw); newRecord=byid(nr,gid);assert strip(oldRecord,recordallowed)==strip(newRecord,recordallowed),gid
   oldrun=obj(verify(oldr['runManifest']));assert strip(oldrun,runallowed)==strip(newRun,runallowed),gid
   assert sameOldRun is None or sameOldRun==oldrun;sameOldRun=oldrun
   before=byid(oi['goals'],gid);after=byid(ni['goals'],gid)
   for k in ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','canonicalContext','goalFingerprint']:assert before[k]==after[k],(gid,k)
   assert before['reviewContext']['evidenceProfile']==after['reviewContext']['evidenceProfile']==P[gid],gid
   assert before['reviewContext']['page']['visualization']==after['reviewContext']['page']['visualization'],gid
   cd=deltas(before['reviewContext']['page'],after['reviewContext']['page']);pages.append({'goalId':gid,'round':role,'pageDeltas':cd})
   recordrows.append({'goalId':gid,'round':role,'originalRecordFile':bind(oldRecordFile),'newRecordFile':bind(newRecordsP),'wholeScientificRecordExceptFiveContainerBindingsExact':True,'changedFields':list(sorted(k for k in set(oldRecord)|set(newRecord)if oldRecord.get(k)!=newRecord.get(k))),'wholeCanonicalContextDEENPVisualizationExact':True,'historicalProvider':oldrun['provider'],'historicalModel':oldrun['model'],'historicalRunId':oldrun['runId'],'historicalStartedAt':oldrun['startedAt'],'historicalCompletedAt':oldrun['completedAt'],'historicalParametersFingerprint':oldrun['generationParametersFingerprint'],'recordStatus':newRecord['recordStatus'],'reviewAuthority':newRecord['reviewAuthority']})
  runrows.append({'group':g['groupNumber'],'round':role,'originalRun':bind(verify(next(iter(g['originalPairs'].values()))['existingIndependentRounds'][0 if role=='first'else 1]['runManifest'])),'newRun':bind(newRunP),'wholeRunExceptExplicitContainerBindingsExact':True,'actualHistoricalProviderModelParametersToolchainTimeBlindnessStatusPreserved':True,'changedFields':list(sorted(k for k in set(sameOldRun)|set(newRun)if sameOldRun.get(k)!=newRun.get(k))),'newModelInference':False})
 for gid in g['goalIds']:
  currentrow=byid(c49['current49'],gid);w=obj(verify(currentrow['wholeBinding']));assert w['actualWholeCurrentGoal']==canby[gid]and w['actualWholeCurrentPositiveRecord']==P[gid]
  currentNative=byid(ni['goals'],gid);assert w['nativeCurrentCanonicalContext']==currentNative['canonicalContext'];assert normalize_page(w['currentNativePage'])==normalize_page(currentNative['reviewContext']['page']),gid
  x=byid(originalS['decisions'],gid);y=byid(newS['decisions'],gid);sa={'decisionId','records','pageFingerprint','goalReviewContextFingerprint'};assert strip(x,sa)==strip(y,sa),gid
  oldRes=obj(verify(g['originalPairs'][gid]['resolution']));newRes=obj(n/'resolutions'/(gid+'.resolution.json'));sx=oldRes['synthesis'];sy=newRes['synthesis'];assert strip(sx,{'synthesisId','dissent'})==strip(sy,{'synthesisId','dissent'});assert [strip(v,{'dissentId'})for v in sx['dissent']]==[strip(v,{'dissentId'})for v in sy['dissent']]
  assert oldRes['decision']==newRes['decision']and oldRes['status']==newRes['status']and oldRes['goal']['finalText']==newRes['goal']['finalText'];synthrows.append({'goalId':gid,'oldResolution':bind(verify(g['originalPairs'][gid]['resolution'])),'newResolution':bind(n/'resolutions'/(gid+'.resolution.json')),'wholeSynthesisScienceRationaleUnderstandingDissentDispositionAuthorityHumanAndTimesExact':True,'technicalDecisionAndDissentIdsOnlyChanged':True})
  for src in w['wholeActualExistingSourceOrigins']:
   sd=obj(verify(src['sourceFile']));md=obj(verify(src['mappingFile']));atom=src['wholeCurrentOriginSourceAtom'];assert next(v for v in sd['sourceGoals']if v['id']==atom['id'])==atom
   parent=src['wholeCurrentParentPassage'];assert next(v for v in sd['passages']if v['id']==parent['id'])==parent
   assert [v for v in md['mappings']if v['legacyGoalId']==atom['id']]==src['wholeCurrentMappings']
   assert [v for v in md['decisions']if v['sourceGoalId']==atom['id']]==src['wholeCurrentDecisions']
   sourcerows.append({'goalId':gid,'sourceGoalId':atom['id'],'source':src['sourceFile'],'mapping':src['mappingFile'],'wholeCurrentSourceAtomParentAllSiblingEdgesAndDecisionsExact':True,'matchTypes':[v['matchType']for v in src['wholeCurrentMappings']],'reusedExistingSourceQualificationNotNewWholeSourceScience':True})
  goalrows.append({'goalId':gid,'wholeGoalAndPCurrentCanonicalBookExact':True,'existingC49Context':currentrow['wholeBinding'],'actuallyChangedNeighborTitles':currentrow['twoRoundParity'][0]['actuallyChangedNeighborTitles'],'individualScopeDecision':'KEEP technical scientific-history preservation; existing source and neighbor qualifications reused'})
assert len(recordrows)==90 and len(runrows)==30 and len(goalrows)==45 and len(synthrows)==45 and len(sourcerows)==43
# Whole preserved original artifacts are bound independently, not treated as new model calls.
oldseal=obj(O/'SEALED-forty-five-whole-historical-science-current-native-owner-followers-and-open-chain-boundaries.AUTHOR-INERT.json');v2seal=obj(V/'SEALED-qualified51-116-prefix-plus-exact45-native-followers-and-measured257-to281.INERT.json')
def check_bound_tree(x):
 if isinstance(x,dict):
  if 'path'in x and 'sha256'in x and (R/x['path']).is_file():verify(x)
  for v in x.values():check_bound_tree(v)
 elif isinstance(x,list):
  for v in x:check_bound_tree(v)
check_bound_tree(oldseal);check_bound_tree(v2seal)
baseP=V/'actual-whole-current-registry-before45.EXACT.json';candP=V/'candidate-current45-only-owner-registry.INERT.config.json';base=obj(baseP);cand=obj(candP);active=obj(R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');aa,bb=base['subjects'][4],active['subjects'][4];assert strip(aa,{'resolutionIndexPaths'})==strip(bb,{'resolutionIndexPaths'}) and bb['resolutionIndexPaths'][:len(aa['resolutionIndexPaths'])]==aa['resolutionIndexPaths'] and len(bb['resolutionIndexPaths'])==len(aa['resolutionIndexPaths'])+1;assert base['subjects'][:4]==active['subjects'][:4] and base['subjects'][5:]==active['subjects'][5:];authorizedRootD10Delta={'base51Indices116Edges':bind(baseP),'actual52Indices116Edges':bind(R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),'onlyOneRootD10IndexAppended':bb['resolutionIndexPaths'][-1],'noOtherRegistryFieldsChanged':True,'noCurrentD10OtherRoundRecordsRead':True}
assert base['subjects'][:4]==cand['subjects'][:4]and base['subjects'][5:]==cand['subjects'][5:];a,b=base['subjects'][4],cand['subjects'][4]
assert strip(a,{'resolutionIndexPaths','resolutionSupersessions'})==strip(b,{'resolutionIndexPaths','resolutionSupersessions'});assert b['resolutionIndexPaths'][:len(a['resolutionIndexPaths'])]==a['resolutionIndexPaths'];assert b['resolutionSupersessions'][:len(a['resolutionSupersessions'])]==a['resolutionSupersessions'];addedindices=b['resolutionIndexPaths'][len(a['resolutionIndexPaths']):];addededges=b['resolutionSupersessions'][len(a['resolutionSupersessions']):]
assert len(addedindices)==15 and len(addededges)==45 and {v['goalId']for v in addededges}==set(plan['requestedGoalIds']);assert not set(plan['Root2Current3ReusedIDs']+plan['explicitOpen6de'])&{v['goalId']for v in addededges}
# Independently verify chain direction and terminal-owner uniqueness for every appended goal, including preexisting supersession edges.
chainrows=[]
for gid in plan['requestedGoalIds']:
 edges=[v for v in b['resolutionSupersessions']if v['goalId']==gid]; successors={}
 for e in edges:
  assert e['supersededIndexPath']not in successors or successors[e['supersededIndexPath']]==e['replacementIndexPath'];successors[e['supersededIndexPath']]=e['replacementIndexPath']
 new=next(v for v in addededges if v['goalId']==gid);terminal=new['replacementIndexPath'];assert terminal not in successors
 nodes=set(v for e in edges for v in [e['supersededIndexPath'],e['replacementIndexPath']]);ends=set()
 for node in nodes:
  seen=set();step=node
  while step in successors:assert step not in seen;seen.add(step);step=successors[step]
  ends.add(step)
 assert ends=={terminal};idx=obj(R/terminal);entry=byid(idx['resolutions'],gid);assert entry['strictDescriptionComplete']and entry['decision']=='keep_current'
 chainrows.append({'goalId':gid,'chainEdgeCount':len(edges),'uniqueTerminalOwner':terminal,'allHistoricalIndexNodesLeadToSameTerminal':True,'cycleOrBranchConflict':False})
measurement=obj(V/'actual-original-native-D-only-current45-candidate-ID-set-measurement.READONLY.json');before=set(measurement['before']['descriptionReadyGoalIds']);after=set(measurement['candidate']['descriptionReadyGoalIds']);gains=after-before;loss=before-after;assert sorted(gains)==measurement['gainedDescriptionReadyGoalIds']and not loss
assert len(gains)==24;direct=sorted(gains&set(plan['requestedGoalIds']));indirect=sorted(gains-set(plan['requestedGoalIds']));assert len(direct)==10 and len(indirect)==14
summary={'startedAtUtc':started,'completedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'HEADbefore':head,'HEADend':subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip(),'status':'independent-bounded-history-and-current-binding-parity-KEEP-with-explicit-indirect-qualification-hold','wholeScientificRecords90':recordrows,'wholeHistoricalRuns30':runrows,'wholeCurrentGoals45':goalrows,'wholeAcceptedSyntheses45':synthrows,'wholeExistingSourceContexts43':sourcerows,'pageDeltas90':pages,'registry':{'base':bind(baseP),'candidate':bind(candP),'onlyEconomicsAppendFieldsChanged':True,'old51Index116EdgePrefixesExact':True,'documentedRootD10RegistryAdvanceDuringReadOnlyReview':authorizedRootD10Delta,'appended15Indices45Edges':True,'Root2OwnersAnd6deExcludedFromNewOwnerClaims':True,'terminalChains45':chainrows},'nativeMeasurement':{'binding':bind(V/'actual-original-native-D-only-current45-candidate-ID-set-measurement.READONLY.json'),'authorGlobalStatusRetained':measurement['status'],'globalStatusExplanation':'Author probe demanded all45 selected IDs ready;16 actually ready and29 blocked in shared historical indices. Scope/chain graph0 and standalone45 native passes do not imply a full-registry PASS.','before257':len(before),'candidate281':len(after),'direct10':direct,'indirect14':indirect,'loss0':len(loss),'newScientificStrictClosuresConditional3':['3e26fb9e-634c-5454-b11f-1d925201182c','79edbe3a-7557-5b3b-a0f2-c31f45b6dad7','87e1971d-d153-59eb-81d9-e361caf83a26'],'bindingRestorationsConditional21':21},'boundaries':{'newHistoricalScientificReviews':0,'newModelInferenceCalls':0,'own7cNewIndependentScienceApproval':False,'humanApproval':False,'activeWrites':0,'candidateRegistryActivationReady':False,'indirectSevenC12PlusSourceE2acRequireSeparateCurrentContextQualification':True,'strictM7Claim':False},'inputBindings':list(BIND.values())}
write('actual-independent-90-records30-runs45-syntheses43-source-and-terminal-guards.READONLY.json',summary)
print(json.dumps({'records':len(recordrows),'runs':len(runrows),'goals':len(goalrows),'source':len(sourcerows),'distinctPageDeltaPaths':collections.Counter(d['path'].split('/')[1]for p in pages for d in p['pageDeltas']),'titles':[v for v in goalrows if v['actuallyChangedNeighborTitles']],'bindings':len(BIND),'direct10':direct,'indirect14':indirect}))

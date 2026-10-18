# SPDX-License-Identifier: Apache-2.0
"""One-shot, before-pin-guarded additive normal integration; no new science."""
import copy, datetime, hashlib, json
from pathlib import Path
R=Path.cwd().resolve();O=Path(__file__).resolve().parent.parent.relative_to(R)
A=O.parent/'chemie-current450-fourteen-method-multistate-source-author-20261018-v1'
B=O.parent/'chemie-current450-fourteen-method-multistate-source-informed-independent-b-20261018-v1'
read=lambda p:json.loads(Path(p).read_text())
dig=lambda x:hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':p.as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def verify(p):assert pin(p['path'])==p,p
plan=read(O/'PLAN.revised-two-immutable-base-successors-and-selected-active-rebinds.json')
for k in ['scientificDecisionSource','scientificSeal','accepted']:verify(plan[k])
accepted=read(plan['accepted']['path']);review=read(plan['scientificDecisionSource']['path'])
assert len(accepted['directPartial'])==104 and len(accepted['literalAcquisition'])==2
assert len(accepted['heldPairs'])==3
for item in plan['sourceTransports']+plan['mappingAliases']:verify(item['before']);verify(item['candidate'])
verify(plan['registryBefore'])
normals={x['normalPath']:read(x.get('immutableBasePath',x['normalPath'])) for x in plan['sourceTransports']}
normals.update({x['normalPath']:read(x['normalPath']) for x in plan['mappingAliases']})
normals[plan['registryBefore']['path']]=read(plan['registryBefore']['path'])
originals=copy.deepcopy(normals)
rebind={x['immutableBasePath']:x['normalPath'] for x in plan['sourceTransports'] if x.get('immutableBasePath')}
for target in rebind.values():assert not Path(target).exists(),target
sources=read(A/'INPUT.selected-whole-source-cells-and-primary-operators.json')
sourceById={s['wholeSourceGoal']['id']:s for s in sources}
relations={r['relationId']:r for r in review['relations']}
direct={(r['sourceGoalId'],r['goalId']):r for r in accepted['directPartial']}
def ref(row):return row['independentAcceptedRef']
def contribution(row):
 r=relations[row['relationId']]
 return {'canonicalGoalId':row['goalId'],'matchType':'partial','independentAcceptedRef':ref(row),
  'currentWholeGoalSHA256':row['wholeCurrentGoalSHA256'],'currentWholeProfileSHA256':row['wholeCurrentProfileSHA256'],
  'acceptedPartDe':r['individualAcceptedPartDe'],'acceptedPartEn':r['individualAcceptedPartEn'],
  'remainingDutiesDe':r['individualRemainingDutiesDe'],'remainingDutiesEn':r['individualRemainingDutiesEn'],
  'wholeSourceApproval':False,'actualLearnerExecutionClaim':False,'newScientificVoteByTechnicalIntegrator':False}

protected={plan['scientificDecisionSource']['path'],plan['scientificSeal']['path'],plan['accepted']['path'],
 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',
 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'}
for s in sources:
 for p in s['currentFamilyExtractions']+s['currentMappingAliases']:protected.add(p['path'])
for r in read(B/'CHECK.current-selected-inputs-and-CAS.actual.json')['wholeCurrentCAndP']:
 protected.add(r['ownerConfig']['path']);protected.add(r['nativeReview']['path'])
for r in read(B/'CHECK.current-views.actual.json')['pairs']:
 for v in r['checks']:protected.add(v['actualCurrentView']['path'])
protected.update(['curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json',
 'curricula/DE/Gymnasium/input/TH/upper-secondary/source-extraction/DE_TH_CHEMIE_SEKII_LEHRPLAN_GYMNASIUM_2024.source-extraction.json'])
protected.update(rebind)
for p in Path('curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary').glob('*.json'):
 if p.as_posix() not in normals:protected.add(p.as_posix())
for p in Path('curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary').glob('*.json'):
 if p.as_posix() not in normals:protected.add(p.as_posix())
protectpins=[pin(p) for p in sorted(protected-set(normals)) if Path(p).exists()]
put(O/'PROTECTED.before-finite-C-P-view-epoch-and-other-alias-pins.json',protectpins)

sourceChanges=[];metadataCorrections=[];passageChanges=[]
for item in plan['sourceTransports']:
 p=item['normalPath'];d=normals[p];old=originals[p];c=read(item['candidate']['path'])
 ids={g['id'] for g in d['sourceGoals']};pids={x['id'] for x in d['passages']}
 assert not ids.intersection(g['id'] for g in c['sourceGoalsToAppend'])
 assert not pids.intersection(x['id'] for x in c['passagesToAppend'])
 new=[]
 for before in c['sourceGoalsToAppend']:
  g=copy.deepcopy(before);sid=g['id'];meta=g.setdefault('metadata',{})
  if sid in ['th-chemistry-seki-process-standard-b-2-3','bw-chemistry-sekii-process-standard-2-1-5','bw-chemistry-sekii-process-standard-2-1-6','bw-chemistry-sekii-process-standard-2-3-11']:
   code='B2.3' if sid.startswith('th-') else {'bw-chemistry-sekii-process-standard-2-1-5':'2.1 item5','bw-chemistry-sekii-process-standard-2-1-6':'2.1 item6','bw-chemistry-sekii-process-standard-2-3-11':'2.3 item11'}[sid]
   meta['officiallyNumbered']=True;meta['officialStandardCode']=code
   metadataCorrections.append({'sourceGoalId':sid,'beforeMetadataSHA256':dig(before['metadata']),
       'correction':'Actual official numbering, as required by the sealed independent review','officialCode':code})
  rows=[r for r in accepted['directPartial'] if r['sourceGoalId']==sid]
  assert rows
  meta['currentAcceptedPartialRelations']={'review':plan['scientificDecisionSource'],'bindings':[ref(r) for r in rows],
     'authorInactiveWordingIsHistoricalSnapshot':True,'wholeSourceApproval':False}
  new.append(g)
 d['sourceGoals'].extend(new)
 # Full selected operator is operative; copied complete PDF-page verification text is not.
 for before in c['passagesToAppend']:
  clause=next(g for g in new if g['passageId']==before['id']);s=sourceById[clause['id']]
  after=copy.deepcopy(before);after['title']='Selected complete official operator; full original page context referenced'
  after['text']=s['actualWholePrimaryOperator']
  after['scope']='Only this entire selected operator is newly operative. Full original primary-page context was read and remains available at the pinned official PDF; all unselected operators remain without a new binding vote.'
  after['primaryDocumentPin']=s['primary'];after['sourceStageCourseAndContext']=s['verifiedStageCourseAndContext']
  d['passages'].append(after)
  passageChanges.append({'path':p,'passageId':after['id'],'candidateWholePageTextSHA256':dig(before['text']),
     'operativeCompleteSelectedTextSHA256':dig(after['text']),'sourceGoalId':clause['id'],
     'reason':'Avoid copied full official verification pages; preserve complete selected operative clause and exact primary/context locator. No source operator truncated.'})
 if 'expectedTopicCodes' in d:
  for passage in d['passages'][len(old['passages']):]:
   if passage['topicCode'] not in d['expectedTopicCodes']:d['expectedTopicCodes'].append(passage['topicCode'])
 actual=len(d['sourceGoals']);oldcount=len(old['sourceGoals']);n=len(new)
 method=d.setdefault('method',{});assert 'fourteenMethodSelectedProcessAddition' not in method
 method['fourteenMethodSelectedProcessAddition']={'technicalIntegration':'Authorised additive integration of independently accepted foreign author relations; no new scientific vote',
   'candidate':item['candidate'],'independentAcceptedRef':plan['accepted'],'retainedImmediateBeforeInventory':oldcount,
   'newCompleteSelectedOperatorCells':n,'actualUnionInventory':actual,'allOldSourceCellsAndPassagesExactlyRetained':True,
   'noCompleteOfficialStandardsUniverseClaim':True,'wholeSourceCoverageEstablished':False,
   'historicalPipelineStatusBeforeThisAddition':old['pipelineStatus']}
 pipe=d['pipelineStatus'];pipe['currentStep']='MAPPING-3'
 for step in pipe.get('steps',[]):
  for check in step.get('checks',[]):
   cid=check['id']
   if step['id']=='MAPPING-1' and cid=='expected-topic-coverage':check['details']=f'All {len(old["passages"])} previous operative passages retained exactly; {n} selected complete-operator passages added. This is not the complete official standards universe.'
   if step['id']=='MAPPING-2' and cid=='source-goals-created':check['details']=f'{actual} actual cells = {oldcount} retained immediate previous inventory + {n} new whole selected operators. Previous content/standard phases remain historical; no unselected standard counted.'
   if step['id']=='MAPPING-2' and cid=='source-goal-count-peer-baseline':
    check['label']='Historische Basis und neu ausgewählte vollständige Operatoren getrennt gezählt'
    check['details']=f'Previous peer comparisons concern their historical inventory only; original evidence retained in method.fourteenMethodSelectedProcessAddition.historicalPipelineStatusBeforeThisAddition. Current actual union {actual}={oldcount}+{n}; no full-standards benchmark.'
   if step['id']=='MAPPING-3' and cid=='mapping-2-complete':check['details']=f'{actual} actual source cells exist. Historical M3 results remain scoped to their prior inventory. Current individually accepted partial relations do not prove all whole-source duties.'
   if step['id']=='MAPPING-3' and cid in ['m3-all-source-goals-reviewed','m3-all-source-goals-covered-by-canonical']:
    check['passed']=False;check['details']=f'{n} newly selected whole operator cells have specific partial relations only. No new whole-source approval; all remaining verbs, stage/course/context and actual-performance duties remain open. Historical completeness is retained only in the saved previous pipeline record.'
  if step['id']=='MAPPING-3':step['status']='incomplete'
 if 'selectedProcessIntegration' in pipe:
  pipe['selectedProcessIntegration']['totalSourceGoalsActual']=actual
  pipe['selectedProcessIntegration']['historicalRecordBeforeFourteenAddition']=True
 pipe['fourteenMethodPartialIntegration']={'status':'accepted-partial-contributions-only','totalSourceGoalsActual':actual,
   'retainedImmediateBeforeCells':oldcount,'newCompleteSelectedOperatorCells':n,'newWholeSourceApprovals':0,
   'newScientificFirstDecisionsByTechnicalIntegrator':0,'independentAcceptedRef':plan['accepted'],
   'newSourceCellPartialBindings':[{'sourceGoalId':g['id'],'acceptedPartialRelations':[ref(r) for r in accepted['directPartial'] if r['sourceGoalId']==g['id']],'wholeSourceApproval':False} for g in new],
   'historicalM3DoesNotExtendAutomaticallyToNewCells':True,'wholeSourceCoverageComplete':False}
 assert d['sourceGoals'][:oldcount]==old['sourceGoals'] and d['passages'][:len(old['passages'])]==old['passages']
 sourceChanges.append({'path':p,'before':item['before'],'retainedWholeSourceArraySHA256':dig(old['sourceGoals']),
   'retainedWholePassageArraySHA256':dig(old['passages']),'beforeSourceCount':oldcount,'newSourceCount':actual,
   'addedSourceIds':[g['id'] for g in new],'oldPassageCount':len(old['passages'])})

mappingChanges=[];relationBindings=[]
for item in plan['mappingAliases']:
 p=item['normalPath'];d=normals[p];old=originals[p];c=read(item['candidate']['path'])
 assert d['sourceExtractionPath']==c['sourceExtractionPathAtAuthoring']
 if d['sourceExtractionPath'] in rebind:d['sourceExtractionPath']=rebind[d['sourceExtractionPath']]
 src=normals.get(d['sourceExtractionPath']) or read(d['sourceExtractionPath']);sourceids={g['id'] for g in src['sourceGoals']}
 added=[];decisionAdds=[];group={}
 for q in c['cellAppends']:
  m=copy.deepcopy(q['mappingToAppend']);key=(m['legacyGoalId'],m['canonicalGoalId']);assert key in direct
  assert m['matchType']=='partial' and m['legacyGoalId'] in sourceids
  assert not any((x['legacyGoalId'],x['canonicalGoalId'])==key for x in d['mappings'])
  row=direct[key];group.setdefault(key[0],[]).append(row);added.append(m);d['mappings'].append(m)
  relationBindings.append({'relationId':row['relationId'],'sourceGoalId':key[0],'canonicalGoalId':key[1],
      'mappingPath':p,'sourceExtractionPath':d['sourceExtractionPath'],'matchType':'partial','independentAcceptedRef':ref(row)})
 for sid,rows in group.items():
  existing=[z for z in d.setdefault('decisions',[]) if z.get('sourceGoalId')==sid];assert len(existing)<=1
  if existing:
   z=existing[0];assert z['decision']=='mapped'
   for row in rows:
    if row['goalId'] not in z['canonicalGoalIds']:z['canonicalGoalIds'].append(row['goalId'])
   z.setdefault('additionalAcceptedPartialContributions',[]).extend(contribution(row) for row in rows)
  else:
   s=sourceById[sid];g=s['wholeSourceGoal']
   z={'sourceGoalId':sid,'topicCode':g['topicCode'],'sourceSpan':g['sourceSpan'],
      'sourceCourseLevel':g.get('courseLevel','unspecified'),'sourceStageCourseAndContext':s['verifiedStageCourseAndContext'],
      'decision':'mapped','canonicalGoalIds':[row['goalId'] for row in rows],'matchType':'partial',
      'rationale':'Only the specific independently accepted partial source relations below are current. No whole-source/course/topic coverage or learner execution is asserted.',
      'reviewedAt':'2026-10-18','reviewer':'Independent informed B source reviewer; technical integrator adds no vote',
      'scientificEvidence':[ref(row) for row in rows],
      'additionalAcceptedPartialContributions':[contribution(row) for row in rows],
      'wholeSourceCompletionFromSingleGoalMasteryAllowed':False}
   d['decisions'].append(z);decisionAdds.append(sid)
 d['fourteenMethodPartialIntegration']={'independentAcceptedRef':plan['accepted'],'newPartialMappingRows':len(added),
  'newSourceDecisionIds':decisionAdds,'allOldMappingRowsAndOldDecisionFieldsPreserved':True,
  'wholeSourceCoverageEstablished':False,'newScientificFirstDecisionsByTechnicalIntegrator':0}
 assert d['mappings'][:len(old['mappings'])]==old['mappings']
 for before,after in zip(old.get('decisions',[]),d.get('decisions',[])):
  for k,v in before.items():
   if k in ['canonicalGoalIds','additionalAcceptedPartialContributions']:assert after[k][:len(v)]==v
   else:assert after[k]==v,(p,before['sourceGoalId'],k)
 mappingChanges.append({'path':p,'before':item['before'],'oldMappingCount':len(old['mappings']),
  'addedPartialRows':added,'retainedWholeMappingArraySHA256':dig(old['mappings']),
  'retainedWholeDecisionArraySHA256':dig(old.get('decisions',[])),
  'newSourceDecisionIds':decisionAdds,'oldDecisionCount':len(old.get('decisions',[]))})

registryPath=plan['registryBefore']['path'];reg=normals[registryPath]
assert len(reg['entries'])==362
registryAdds=[]
for row in accepted['literalAcquisition']:
 assert not any(e['goalId']==row['goalId'] and e['jurisdiction']==row['jurisdiction'] for e in reg['entries'])
 relation=relations[row['relationId']]
 e={'landscapeId':'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0','goalId':row['goalId'],'jurisdiction':row['jurisdiction'],
    'evidenceType':'requires-closure','requiredByGoalId':'e7c3d20e-4b13-560b-b8ee-c5abca8cc624','status':'accepted',
    'rationale':'Independent informed B accepted only the actual direct e7c3d20e.requires→9e656 acquisition support. Current whole endpoint/profile and whole label goal/profile were read. Existing '+row['sourceGoalId']+' backs real pure-substance isolation/recrystallisation; safe own ASA/purification work needs pictogram-plus-H-statement interpretation. Official context is3.1 introductory elective-compulsory topics, primary17: italic isolation on25 is a possible optional extension in both course forms, not a universal official Gymnasium/Q/GK/LK duty and not evidence of learner selection. No direct official label standard, endpoint mastery or whole-source coverage is claimed. Exact independent decision: '+ref(row)['path']+'#'+ref(row)['jsonPointer']+'. Technical integration adds no scientific vote.'}
 reg['entries'].append(e);registryAdds.append(e)
assert len(reg['entries'])==364 and reg['entries'][:362]==originals[registryPath]['entries']

# All preconditions validated before the first mutation; each write also has exact CAS.
for item in plan['sourceTransports']+plan['mappingAliases']:verify(item['before'])
verify(plan['registryBefore'])
for p in protectpins:verify(p)
for p,d in normals.items():
 assert p in plan['exclusiveNormalWritePaths'];put(p,d)
for p in protectpins:verify(p)
for c in sourceChanges+mappingChanges:c['after']=pin(c['path'])
receipt={'role':'ACTUAL_TECHNICAL_NORMAL_INTEGRATION_NO_NEW_SCIENCE','integratedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'independentAcceptedRef':plan['accepted'],'independentScience':plan['scientificDecisionSource'],
 'sourceChanges':sourceChanges,'mappingChanges':mappingChanges,'concreteRelationAliasBindings':relationBindings,
 'fourNumberingMetadataCorrections':metadataCorrections,'newPassageCompleteOperatorNormalization':passageChanges,
 'registry':{'before':plan['registryBefore'],'after':pin(registryPath),'oldCount':362,'newCount':364,'addedExactEntries':registryAdds,'retainedRegistryEntriesSHA256':dig(originals[registryPath]['entries']),'allPreviousEntriesExact':True},
 'counts':{'normalFiles':46,'mutableExistingFiles':44,'newImmutableBaseSuccessorFiles':2,'extractions':14,'newWholeSelectedCells':43,'directPartialRelations':len(direct),
 'mappingAliases':31,'newPartialMappingOccurrences':len(relationBindings),'literalAcquisitions':2,'heldPairsKept':3},
 'wholeSourceBoundaries':'All complete source operators retain all additional verbs, context, stage/course and real-performance demands. Partial mapped decisions do not establish whole-source completion. All14 enlarged extraction M3 statuses are incomplete; prior pipeline completeness is preserved as historical scope.',
 'oldWholeCellsAndPassagesPreserved':True,'oldMappingRowsAndAllOldDecisionFieldsPreserved':True,
 'priorHOLDREJECTReinterpreted':False,'newScientificFirstDecisionsByTechnicalIntegrator':0,'newDPAMVVotes':0,
 'normalWritesInSuccessfulAttempt':46,'transientFirstAttemptAndRecovery':'RECEIPT.transient-first-attempt-and-exact-recovery.json',
 'twoImmutableBaseSourceRebinds':rebind,'APCompilerBuildRuns':0,'newFullOfficialPDFVerificationTextCopies':0}
put(O/'RECEIPT.actual-fourteen-source-normal-integration.json',receipt)
print(json.dumps({'status':'WRITTEN_FINITE_PENDING_FINAL_CHECKS','counts':receipt['counts'],'receipt':pin(O/'RECEIPT.actual-fourteen-source-normal-integration.json')},indent=2))

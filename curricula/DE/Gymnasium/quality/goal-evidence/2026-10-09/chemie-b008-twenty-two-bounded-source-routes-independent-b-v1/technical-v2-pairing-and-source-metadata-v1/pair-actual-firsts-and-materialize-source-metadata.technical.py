# SPDX-License-Identifier: Apache-2.0
# Technical adoption of prior immutable source judgments, never a fresh scientific review.
import copy, datetime, hashlib, json, pathlib
ROOT=pathlib.Path('.').resolve()
BASE=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
OWN=BASE/'chemie-b008-twenty-two-bounded-source-routes-independent-b-v1/technical-v2-pairing-and-source-metadata-v1'
AUTHOR=BASE/'chemie-b008-current-twenty-six-native-preparation-author-v1'
V2=AUTHOR/'twenty-two-bounded-source-routes-author-v2'
V1=AUTHOR/'twenty-two-bounded-source-routes-author-v1'
A=BASE/'chemie-b008-twenty-two-source-pairing-root-v1'
B=BASE/'chemie-b008-twenty-two-bounded-source-routes-independent-b-v1'
BF=B/'remediation-v2-single-route-independent-followup-v1'
STAMP=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(pathlib.Path(p).read_text())
def bind(p):
 p=pathlib.Path(p);raw=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def check(d):
 a=bind(d['path']);assert a['sha256']==d['sha256'].removeprefix('sha256:'),(d,a)
 if 'bytes' in d:assert a['bytes']==d['bytes'],(d,a)
 return a
def value(v):return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(name,v):
 p=OWN/name
 assert not p.exists(),p
 p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
 return bind(p)
def allbindings(o):
 if isinstance(o,dict):
  if isinstance(o.get('path'),str) and isinstance(o.get('sha256'),str):yield o
  for v in o.values():yield from allbindings(v)
 elif isinstance(o,list):
  for v in o:yield from allbindings(v)
entry=read(V2/'neutral-twenty-two-whole-bounded-source-routes.author-independent-review.entry.json')
assert bind(V2/'neutral-twenty-two-whole-bounded-source-routes.author-independent-review.entry.json')['sha256']=='1f34795387a46948277bd84f242eff5f5bce3f9df2f01e1833a831691a78a404'
checked=[check(d) for d in allbindings(entry)]
inputs=read(entry['whole22SourceRoleAndPartnerInput']['path']);old=read(V1/'whole-twenty-two-source-route-operator-scope-and-partner.neutral-input.json')
extraction=read(entry['newOrdinarySourceExtraction']['path']);oldex=read(V1/'BY-twenty-two-whole-clause-bounded-routes.source-extraction.author-candidate.json')
mapping=read(entry['newOrdinaryMapping']['path']);oldmap=read(V1/'BY-twenty-two-partial-source-routes.ordinary-mapping.author-candidate.json')
partners=read(entry['whole18CurrentAndProspectivePartnerBodies']['path']);oldpartners=read(V1/'all-eighteen-whole-original-current-and-prospective-partners.neutral-input.json')
arem=read(A/'one-C9-successor.exact-scientific-input-and-preservation.independent-A.actual.json')
av=read(A/'one-C9-actual-source-successor.independent-A.first-followup.verdict.json')
bv=read(BF/'single-source-successor.independent-b.first-followup-verdict.immutable.json')
assert bind(A/'one-C9-actual-source-successor.independent-A.first-followup.verdict.json')['sha256']=='cdce98da95a3b0a625a4b878d8773a10effaa3b8e0e6e787580267529c4efe39'
assert bind(BF/'single-source-successor.independent-b.first-followup.freeze.json')['sha256']=='d9fff7a6602fd6dcd15b615dff2ee3b8d3817c5b54e5b712d5a00fb6e60e8599'
# Validate seals and actual exact input receipts, preserving distinct metadata/times.
firstfiles=[A/'one-C9-actual-source-successor.independent-A.first-followup.freeze.json',BF/'single-source-successor.independent-b.first-followup.freeze.json',A/'five-new-lower-source-roles.conservative-first-pair.freeze.json',B/'source22-five-new-whole-role.independent-b.first.freeze.json']
for p in firstfiles:
 for d in allbindings(read(p)):checked.append(check(d))
changed='by-chem-b008-scope-a39a75ae-310a-5bc7-8822-983cd289d3a1';removed='by-chem-b008-scope-97b4c9fa-f168-51e4-8ac8-eea11e602f60'
target='5b1bb5d9-07b1-5ba9-b320-cc97be917c60';orig='582de4c8-0b88-5191-b6d6-7cd73c5c069d';symbol='49d7ff04-469d-59d8-a4df-5b7be048cd37'
source={s['id']:s for s in extraction['sourceGoals']};oldsource={s['id']:s for s in oldex['sourceGoals']}
assert len(source)==len(oldsource)==49
shared=set(source)&set(oldsource);assert len(shared)==48
assert all(source[k]==oldsource[k] for k in shared)
dec={s['sourceGoalId']:s for s in mapping['decisions']};olddec={s['sourceGoalId']:s for s in oldmap['decisions']}
assert all(dec[k]==olddec[k] for k in shared)
assert [m for m in mapping['mappings'] if m['legacyGoalId']!=changed]==[m for m in oldmap['mappings'] if m['legacyGoalId']!=removed]
assert len(mapping['mappings'])==59 and all(e['matchType']=='partial' for e in mapping['mappings'])
assert inputs['wholeSelectedGoals']==old['wholeSelectedGoals']
assert partners['partners']==oldpartners['partners'] and len(partners['partners'])==18
assert inputs['existingPairedBoundedRoleGoalIds']==old['existingPairedBoundedRoleGoalIds'] and len(inputs['existingPairedBoundedRoleGoalIds'])==17
old17=[r for r in old['selectedRoleRows'] if r['goalId'] in inputs['existingPairedBoundedRoleGoalIds']]
new17=[r for r in inputs['selectedRoleRows'] if r['goalId'] in inputs['existingPairedBoundedRoleGoalIds']]
assert old17==new17
correct=source[changed]
assert correct==arem['actualCorrectWholeClause']
assert correct['sourceSpan']=='C9-HG_SG_MUG_WWG_SWG.1.11' and correct['stage']=='SekI' and correct['courseLevel']=='unspecified'
sc=correct['extendedData']['scopedWholeOriginalClauseRole'];assert sc['originalSourceGoalId']==orig
assert sc['actualOriginalOccurrence']['sourceGoalId']=='d79d7aa5-4c6d-5734-98ae-b932fa93dca8'
assert sc['wholeOriginalPartnerGoalIds']==['b6327e98-8ab9-5d7f-b826-4023bc1a56a7']
primary=read(V2/'actual-one-C9-nonNTG-whole-clause-remediation-and-original-preservation.json')['actualRetainedOfficialPrimary']
checked.append(check(primary));primarytxt=pathlib.Path(primary['path']).read_text()
assert ' '.join(correct['sourceText'].split()) in ' '.join(primarytxt.split())
originalex=read(extraction['extendedData']['originalExtraction']['path']);originalmap=read(extraction['extendedData']['originalWholeMapping']['path'])
checked.extend([check(extraction['extendedData']['originalExtraction']),check(extraction['extendedData']['originalWholeMapping'])])
assert len(originalex['sourceGoals'])==332 and len(originalmap['mappings'])==418
os={s['id']:s for s in originalex['sourceGoals']};od={s['sourceGoalId']:s for s in originalmap['decisions']}
assert os[orig]['sourceText']==correct['sourceText']
assert sc['wholeOriginalEdges']==[m for m in originalmap['mappings'] if m['legacyGoalId']==orig]
symbolproof={'wholeOriginalSourceValueSHA256':value(os[symbol]),'wholeOriginalDecisionValueSHA256':value(od[symbol]),'allOriginalPartnerEdges':[m for m in originalmap['mappings'] if m['legacyGoalId']==symbol]}
assert [m['canonicalGoalId'] for m in symbolproof['allOriginalPartnerEdges']]==['95dc0ee5-a0af-5682-af32-d66e36fbeb50','e7c363d4-e02d-4895-8750-ba62c2eb63fe']
# Full explicit whole original clauses/decisions/partners remain real original values.
for c in inputs['wholeOriginalClausesPassagesDecisionsAndAllPartnerEdges']:
 o=c['wholeOriginalSourceGoal'];assert os[o['id']]==o
 assert od[o['id']]==c['wholeOriginalDecision']
 assert [m for m in originalmap['mappings'] if m['legacyGoalId']==o['id']]==c['wholeOriginalEdges']
for d in inputs['originalAllMappingInputsUnchanged']:checked.append(check(d))
assert len(inputs['originalAllMappingInputsUnchanged'])==33
pair5=read(A/'five-new-lower-source-roles.conservative-independent-first-pair.actual.json')
checked.append(bind(A/'five-new-lower-source-roles.conservative-independent-first-pair.actual.json'))
for d in allbindings(pair5):checked.append(check(d))
p5={r['goalId']:r for r in pair5['records']};assert len(p5)==5
assert [r['decision'] for r in p5.values()].count('HOLD_ONE_WRONG_SOURCE_ROUTE')==1
assert av['decision']=='ACCEPT_BOUNDED_GIVEN_SIMPLE_SOURCE_ROUTE_ONLY'
assert bv['targetedResult']['decision']=='ACCEPT_BOUNDED_PARTIAL_CANDIDATE_ONLY'
# Reuse the precise independently sealed partial operator reason, not merely its digest.
pair12path=BASE/'chemie-b008-by12-ga-twelve-boundary-source-pairing-root-v1/twelve-boundary-source.technical-pairing.json';pair12=read(pair12path)
assert not pair12['boundedComponentDefectsRequiringRevision'] and not pair12['pairingDisagreements']
for d in pair12['inputBindings']:checked.append(check(d))
a12=read(pair12['inputBindings'][2]['path']);b12=read(pair12['inputBindings'][3]['path'])
a12rows={r['prospectiveGoalId']:r for r in a12['rows']};b12rows={r['prospectiveGoalId']:r for r in b12['rows']}
a7path=BASE/'chemie-b008-source19-remaining-seven-whole-independent-a-root-v1/seven-whole-source-science-P.first.independent-A.verdict.json';b7path=BASE/'chemie-b008-source19-remaining-seven-whole-independent-b-v1/whole-seven.independent-b.first-verdict.immutable.json'
a7=read(a7path);b7=read(b7path)
reused=[]
for r in new17:
 gid=r['goalId'];oid=r['originalSourceGoalId'];sid=r['scopedSourceGoalId'];ev=r['existingBoundedRoleEvidence']
 if 'path' in ev:
  checked.append(check(ev));a=a12rows[gid];b=b12rows[gid]
  comps=[c for c in a['contributions'] if c['sourceGoalId']==oid]
  assert comps and comps[0]['scope']['compatibilityProfile']=='GK' and source[sid]['courseLevel']=='GK'
  reasons={'A':a['operatorJudgement'],'B':b['rationaleDe'],'Aremaining':a['remainingBoundary'],'Bremaining':b['unresolvedWholeDutiesDe']}
  evidence={'pairedSource12':bind(pair12path),'independentA':bind(pair12['inputBindings'][2]['path']),'independentB':bind(pair12['inputBindings'][3]['path'])}
 else:
  checked.extend([check(ev['independentA']),check(ev['independentB'])])
  aa=[c for c in a7['sourceComponentJudgments'] if c['goalId']==gid and c['sourceGoalId']==oid];bb=[c for c in b7['sourceResults'] if c['proposedChildGoalId']==gid and c['sourceGoalId']==oid]
  assert len(aa)==1 and len(bb)==1,(gid,oid)
  assert aa[0]['decision']=='SUPPORTED_PARTIAL_CANDIDATE_ONLY' and bb[0]['proposedRelationScientificDecision']=='ACCEPT_BOUNDED_PARTIAL_CANDIDATE'
  reasons={'A':aa[0]['operatorReason'],'B':bb[0]['ownSemanticCorrespondenceAndDutyLimits']}
  evidence={'independentA':bind(a7path),'independentB':bind(b7path)}
 reused.append({'goalId':gid,'scopedSourceGoalId':sid,'originalSourceGoalId':oid,'sourceSpan':source[sid]['sourceSpan'],'unchangedWholeRoleValueSHA256':value(r),'priorGenuineScience':evidence,'exactPriorOperatorReasons':reasons,'freshScientificReviewPerformed':False,'wholeSourceCleared':False})
assert len(set(r['goalId'] for r in reused))==17
checkedunique={d['path']:d for d in checked}
inputfirst=write('source22-v2-technical-pairing.input.first.freeze.json',{'schemaVersion':1,'role':'Exact technical pairing intake; both genuine independent scientific firsts already sealed','createdAt':STAMP,'bindings':list(checkedunique.values()),'independentAFirst':bind(firstfiles[0]),'independentBFirst':bind(firstfiles[1]),'genuineDistinctReviewerMetadata':{'A':{k:av.get(k) for k in ['role','reviewedAt']},'B':{k:bv.get(k) for k in ['reviewer','role','reviewedAt']}},'activeWrites':[],'humanApproval':False,'strictGain':0})
proof=write('single-C9-successor-and22-bounded-role-reuse.technical-pair.actual.json',{'schemaVersion':1,'artifactRole':'Technical conservative pairing of actual sealed scientific target judgments and unchanged historical bounded roles','createdAt':STAMP,'inputFirst':inputfirst,'targetGoalId':target,'targetSourceId':changed,'originalSourceId':orig,'actualWholeClause':correct,'wholeTargetDEEN':next(g for g in inputs['wholeSelectedGoals'] if g['id']==target),'independentA':{'verdict':bind(A/'one-C9-actual-source-successor.independent-A.first-followup.verdict.json'),'first':bind(firstfiles[0]),'actualDecision':av['decision'],'wholeOwnReason':av['ownReasonDe']},'independentB':{'verdict':bind(BF/'single-source-successor.independent-b.first-followup-verdict.immutable.json'),'first':bind(firstfiles[1]),'actualTargetJudgment':bv['targetedResult']},'technicalJointDecision':'BOTH_ACCEPT_THE_EXACT_BOUNDED_GIVEN_SIMPLE_SOURCE_PARTIAL_ROUTE_ONLY','technicalScopeReasonDe':'C9 ohne NTG .1.11 trägt die vorgegebene einfache Quellenroute. Die fachlich begründeten A-/B-Folgeurteile lesen diesen Operator tatsächlich; das generische OR im ganzen 5b1 bleibt erhalten. C9 NTG gegeben UND selbst recherchiert bleibt ein getrenntes Pflichtstück. Originaler b632-Partner, Symbolpflicht .1.10 und ihre zwei Partner bleiben vollständig erhalten. Keine neue whole-source-, native- oder Kursfreigabe.','singleC9OldFindingResolvedForBoundedCandidateOnly':True,'unchanged48WholeClausesAndDecisions':48,'unchanged58PartialEdges':58,'unchanged22WholeGoals':22,'unchanged18WholePartners':18,'historical17RoleReuse':reused,'unchanged20OtherNewFivePartialEdges':20,'oldFiveFirstPair':bind(A/'five-new-lower-source-roles.conservative-independent-first-pair.actual.json'),'original332BYRows418EdgesUnchanged':True,'all33OriginalMappingBindingsUnchanged':True,'originalSymbolDutyAndAllEdges':symbolproof,'C11UnspecifiedWholeCourseHOLD':True,'opaque17ViewsAndProtected8ContextsUntouched':True,'wholeSource395AtlasApproval':False,'currentNativeD_P_A_M_VApproval':False,'freshScientificVerdictsGenerated':False,'activeWrites':[],'humanApproval':False,'humanTrial':False,'strictGain':0,'newScientificClosures':0,'restoredBindings':0})
first=write('source22-v2-technical-pair.first.freeze.json',{'schemaVersion':1,'role':'Immutable technical pair proof sealed before ordinary reviewer metadata successor','createdAt':STAMP,'proof':proof,'inputFirst':inputfirst,'script':bind(OWN/'pair-actual-firsts-and-materialize-source-metadata.technical.py'),'humanApproval':False,'strictGain':0})
# Ordinary successor only; exact source/operator/scope/target/partner/rationale preservation.
new=copy.deepcopy(mapping)
new['reviewId']='by-chemistry-b008-twenty-two-bounded-routes-genuine-A-B-review-metadata-successor-v1'
new['status']={'authority':'ai_candidate','status':'needs_human_review','reviewScope':'bounded_partial_source_routes_only','wholeSourceClearance':False,'nationalAtlasApproval':False,'courseScopeUncertaintyPreserved':True,'humanApproval':False}
for d in new['decisions']:
 assert d['reviewer'] is None and d['reviewedAt'] is None
 d['reviewer']='Genuine sealed independent A and B bounded-source judgments; technical metadata adoption by /root/bio_science14_independent_b (not a new science review)'
 d['reviewedAt']=STAMP
 d['reviewStatus']='ai_candidate_bounded_partial_reviewed_needs_human_review'
 assert d['wholeSourceClearance'] is False
 assert {k:v for k,v in d.items() if k not in ['reviewer','reviewedAt','reviewStatus']}=={k:v for k,v in dec[d['sourceGoalId']].items() if k not in ['reviewer','reviewedAt','reviewStatus']}
assert new['mappings']==mapping['mappings']
assert {k:v for k,v in new.items() if k not in ['reviewId','status','decisions']}=={k:v for k,v in mapping.items() if k not in ['reviewId','status','decisions']}
metab=write('BY-twenty-two-partial-source-routes.ordinary-mapping.genuine-review-metadata-successor.json',new)
links=[]
for d in new['decisions']:
 s=source[d['sourceGoalId']];w=[]
 for gid in d['canonicalGoalIds']:
  rows=[r for r in reused if r['goalId']==gid and r['scopedSourceGoalId']==s['id']]
  if rows:evidence=rows[0]
  elif s['id']==changed:evidence={'genuineSuccessorPair':proof,'Afirst':bind(firstfiles[0]),'Bfirst':bind(firstfiles[1])}
  else:
   assert gid in p5
   assert p5[gid]['decision'] in ['ACCEPT_BOUNDED_PARTIAL_ROLE_ONLY','HOLD_ONE_WRONG_SOURCE_ROUTE']
   assert s['id']!=removed
   evidence={'originalFiveFirstPair':bind(A/'five-new-lower-source-roles.conservative-independent-first-pair.actual.json'),'genuineAReason':p5[gid]['independentAReason'],'genuineBReason':p5[gid]['independentBReason'],'singleWrongOldRouteExcluded':True}
  w.append({'canonicalGoalId':gid,'sourceJudgmentEvidence':evidence})
 links.append({'sourceGoalId':s['id'],'originalSourceGoalId':s['extendedData']['scopedWholeOriginalClauseRole']['originalSourceGoalId'],'actualWholeClauseValueSHA256':value(s),'originalRationaleUnchanged':d['rationale'],'allWholeOriginalPartnersUnchanged':d['wholeOriginalPartnerGoalIds'],'decisionTargets':w,'wholeCourseHOLD':s['sourceSpan'].startswith('C11.'),'wholeSourceCleared':False})
metaproof=write('actual49-reviewed-metadata-59-partial-edge-22-role-binding.receipt.json',{'schemaVersion':1,'createdAt':STAMP,'normalMappingSuccessor':metab,'unchangedExactSourceExtraction':entry['newOrdinarySourceExtraction'],'actualPartialEdgeCount':59,'actualScopedClauseCount':49,'actualWholeGoalCount':22,'allSourceOperatorScopePartnerAndTargetValuesUnchanged':True,'changedTopFields':['reviewId','status'],'changedDecisionFieldsOnly':['reviewer','reviewedAt','reviewStatus'],'statusTypeCorrectionFromAuthorStringToNormalSchemaObjectIsMetadataOnly':True,'historicalReviewerTimesRemainInBoundOriginalFirsts':'New reviewedAt is technical adoption time, not a backdated new science review; genuine prior A/B times and full reasons remain in sealed proof bindings.','records':links,'technicalPairFirst':first,'C11ActualCourseStillUnspecified':True,'wholeSourceNationalAtlasNativeApproval':False,'humanApproval':False,'strictGain':0})
config=read(entry['ordinaryProspectiveAtlasConfig']['path']);assert config['expectedCurricularAtomicGoalCount']==395 and config['expectedUnresolvedScopeDecisionCount']==496
oldmapping=entry['newOrdinaryMapping']['path'];assert config['mappingPaths'].count(oldmapping)==1
config['mappingPaths']=[metab['path'] if p==oldmapping else p for p in config['mappingPaths']]
cb=write('whole395-source22-reviewed-metadata.ordinary-inputs.candidate-only.json',config)
write('technical-pair-and-successor.authoring.receipt.json',{'schemaVersion':1,'technicalPair':proof,'technicalFirst':first,'actualOrdinaryMappingSuccessor':metab,'actualMetadataReceipt':metaproof,'actualOrdinaryAtlasConfig':cb,'onlyOneNewMappingPathChangedFromAuthorConfig':True,'originalExpected395And496Retained':True,'normalBookLocalOutputPathsKeptForPureReadOnlyAPI':'No output directories, views or manifests are written; normal pure API computes or rejects.','activeWrites':[],'humanApproval':False,'strictGain':0})
print(json.dumps({'technicalPair':proof,'first':first,'mapping':metab,'config':cb}))

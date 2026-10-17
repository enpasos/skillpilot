# SPDX-License-Identifier: Apache-2.0
"""Bounded author adapter. Never writes active inputs or claims new science."""
from pathlib import Path
from datetime import datetime, timezone
from collections import Counter, defaultdict
import copy, hashlib, json

R=Path.cwd()
O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-edta-five-normal-source-adapter-author-20261016-v1'
S=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-edta-conductometry-source-and-prerequisite-whole-author-successor-20261016-v2/neutral/FIVE.whole-source-successors.corrected-RP-and-final-partners.author.json'
A=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-edta-conductometry-final-source-course-informed-independent-followup-20261016-v3/FOLLOWUP.scientific-final-informed-source-PA-review.json'
C=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-edta-conductometry-source-and-prerequisite-whole-author-successor-20261016-v2/candidate/WHOLE.canonical575.acid-final-context-plus-conductometry.author.json'
assert not O.exists(),'Preserve any prior output; do not overwrite sealed history'
NOW=datetime.now(timezone.utc).isoformat()
REVIEWER='/root/chemie_conductometry_independent_visual_20261016, technical source-adapter author, informed candidate'
def read(p):return json.loads(p.read_text())
def rawhash(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);p=p if p.is_absolute() else R/p;b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':rawhash(b),'bytes':len(b)}
def verify(x):
 p=R/x['path'];assert pin(p)==x,(x,pin(p));return p
def objpin(v):return rawhash(json.dumps(v,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode())
def put(p,v):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def write_copy(p,b):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_bytes(b)
assert pin(A)['sha256']=='sha256:55499237ac03cf3bab30c10494b2937726b53be5fc51cc7db2d3fa369f2a4459'
assert pin(S)['sha256']=='sha256:5a49b9188e9eca14986b071f76dbb23eed5ad978cfd06468ddb4e16455abc560'
author=read(S);science=read(A);canonical=read(C);targets={g['id'] for g in canonical['goals']};target_landscape=canonical['landscapeId']
assert len(author)==5
# Strict baseline checks happen before any author output is created.
baselines=[]
for row in author:
 ep=verify(row['extractionBinding']);mp=verify(row['mappingBinding']);e=read(ep);m=read(mp);gid=row['wholeSourceCellBefore']['id']
 assert m['sourceExtractionPath']==row['extractionBinding']['path']
 assert m['sourceLandscapeId']==e['sourceLandscapeId'] and m['targetLandscapeId']==target_landscape
 assert [x for x in e['sourceGoals'] if x['id']==gid]==[row['wholeSourceCellBefore']]
 assert [x for x in m['mappings'] if x['legacyGoalId']==gid]==row['wholeMappingRowBefore']
 assert [x for x in m['decisions'] if x['sourceGoalId']==gid]==row['wholeDecisionsBefore']
 baselines.append((row,ep,mp,e,m))
O.mkdir(parents=True)
results=[];operations=[];checks=[];unchanged=[];aliases=[]
for row,ep,mp,old_e,old_m in baselines:
 jurisdiction=row['jurisdiction'];gid=row['wholeSourceCellBefore']['id'];e=copy.deepcopy(old_e);m=copy.deepcopy(old_m)
 source_before=row['wholeSourceCellBefore'];source_after=copy.deepcopy(row['wholeSourceCellAfter'])
 e['sourceGoals']=[source_after if g['id']==gid else g for g in e['sourceGoals']]
 old_edges=row['wholeMappingRowBefore'];new_edges=copy.deepcopy(row['wholeProposedSourceEdges'])
 edge_start=next(i for i,x in enumerate(m['mappings']) if x['legacyGoalId']==gid)
 m['mappings']=[x for x in m['mappings'] if x['legacyGoalId']!=gid]
 m['mappings'][edge_start:edge_start]=new_edges
 # BY's exact whole mapping and source row remain untouched, not a new verdict.
 changed_decision=copy.deepcopy(row['wholeDecisionsBefore'][0])
 if jurisdiction!='DE-BY':
  changed_decision.update(canonicalGoalIds=list(dict.fromkeys(x['canonicalGoalId'] for x in new_edges)),reviewedAt=NOW,reviewer=REVIEWER)
  if jurisdiction in ['DE-BB','DE-BE']:
   rationale='Informed technical-author candidate implementing the independently supported bounded LK conductometry contribution and removal of an unsupported EDTA mandate. Both edges remain partial. The retained general-data partner is preserved author context, not a new complete source-union approval.'
  elif jurisdiction=='DE-RP':
   rationale='Informed technical-author candidate removes only the unsupported EDTA edge and applies the independently supported optional Baustein1.5/page36 locator repair. All other original partial targets are retained unchanged as context. Their complete complexometry/source union remains HOLD; no new whole-union approval.'
  else:
   rationale='Informed technical-author candidate removes only the unsupported EDTA edge from an optional research-example list. Every other original partial edge is retained unchanged as context. The historical/current/future research-perspective whole union remains HOLD; no new source-union approval.'
  changed_decision.update(rationale=rationale,reviewStatus='informed-author-candidate',reviewAuthority='ai_candidate',boundedSourceEvidence={'scientificDisposition':pin(A),'originalWholeAuthorSourceInput':pin(S),'wholeSourceUnionApproved':False,'HumanApproval':False,'HumanTrial':False})
  if jurisdiction=='DE-RP':changed_decision['sourceSpan']=source_after['sourceSpan']
  m['decisions']=[changed_decision if d['sourceGoalId']==gid else d for d in m['decisions']]
 new_sources=[];new_decisions=[];new_fragment_edges=[];passage_ops=[]
 for cell in row.get('additionalWholePerformanceCells',[]):
  assert jurisdiction in ['DE-BB','DE-BE'] and cell['courseLevel']=='LK'
  assert cell['id'] not in {g['id'] for g in old_e['sourceGoals']}
  assert cell['wholeAllocatedGoalIds']==['7c0b944d-3f1f-5d26-84b0-2a359f689cf0']
  # All scientific text, UUID, document and scope come from the frozen author/A inputs.
  g={'id':cell['id'],'passageId':source_after['passageId'],'topicCode':cell['topicCode'],'topicTitle':source_after['topicTitle'],'title':cell['sourceText'],'description':'Verfasste Operationalisierung des amtlichen LK-Quellenfragments (kein wörtliches zusätzliches Lehrplanzitat): '+cell['sourceText'],'sourceDocumentKey':source_after['sourceDocumentKey'],'sourceRef':cell['sourceRef'],'sourceText':cell['sourceText'],'sourceSpan':{'passageId':source_after['passageId'],'label':cell['sourceText'],'printedPage':42,'physicalPage':42,'courseColumn':'Leistungskurs (zusätzlich zum Grundkurs)'},'parentBulletText':cell['parentBulletText'],'courseLevel':'LK','granularity':'official-source-fragment','tags':copy.deepcopy(cell['tags']),'metadata':{'extractionMethod':'informed-author-serialization-of-exact-official-source-fragment','authoredOperationalisation':True,'sourceTextIsExactFrozenFragment':True,'wholeSourceUnionApproved':False,'frozenAuthorInput':pin(S),'boundedIndependentSourceDisposition':pin(A),'HumanApproval':False,'HumanTrial':False}}
  e['sourceGoals'].append(g);new_sources.append(g)
  edge={'legacyGoalId':g['id'],'canonicalGoalId':'7c0b944d-3f1f-5d26-84b0-2a359f689cf0','matchType':'partial','reviewDecisionId':g['id']}
  d={'sourceGoalId':g['id'],'topicCode':g['topicCode'],'sourceSpan':g['sourceRef'],'decision':'mapped','canonicalGoalIds':[edge['canonicalGoalId']],'rationale':'Informed technical-author candidate for this exact official LK fragment only. The complete conductometry method operationalises the bounded contribution; this partial edge does not approve the entire source/curriculum or claim observed experimental performance. Source-A554992 preserves the original A-FIRST science and supports this unchanged source fragment.','reviewedAt':NOW,'reviewer':REVIEWER,'reviewStatus':'informed-author-candidate','reviewAuthority':'ai_candidate','boundedSourceEvidence':{'scientificDisposition':pin(A),'originalWholeAuthorSourceInput':pin(S),'wholeSourceUnionApproved':False,'actualExperimentExecuted':False,'HumanApproval':False,'HumanTrial':False}}
  m['mappings'].append(edge);m['decisions'].append(d);new_decisions.append(d);new_fragment_edges.append(edge)
 if new_sources:
  pid=source_after['passageId'];original_p=next(p for p in old_e['passages'] if p['id']==pid);new_p=copy.deepcopy(original_p)
  assert all(g['id'] not in new_p['sourceGoalIds'] for g in new_sources)
  new_p['sourceGoalIds'] += [g['id'] for g in new_sources]
  e['passages']=[new_p if p['id']==pid else p for p in e['passages']]
  passage_ops.append({'passageId':pid,'wholeBefore':original_p,'wholeAfter':new_p,'onlyChangedField':'sourceGoalIds','allOriginalPassageFieldsAndRawTextPreserved':all(original_p[k]==new_p[k] for k in original_p if k!='sourceGoalIds')})
  summary=copy.deepcopy(m.get('summary',{}));assert summary=={'sourceGoals':203,'mappedSourceGoals':203,'needsCanonicalGoal':0,'exactMappings':100,'partialMappings':103}
  summary.update(sourceGoals=205,mappedSourceGoals=205,partialMappings=105);m['summary']=summary
 # Whole unaffected entries and head fields are asserted before serialization.
 old_source_by={g['id']:g for g in old_e['sourceGoals']};new_source_by={g['id']:g for g in e['sourceGoals']};old_dec_by={d['sourceGoalId']:d for d in old_m['decisions']};new_dec_by={d['sourceGoalId']:d for d in m['decisions']}
 for key in old_e:
  if key not in ['sourceGoals','passages']:assert old_e[key]==e[key]
 for key in old_m:
  if key not in ['mappings','decisions','summary']:assert old_m[key]==m[key]
 for sg in old_source_by:
  if sg!=gid:assert old_source_by[sg]==new_source_by[sg]
 for sg in old_dec_by:
  if sg!=gid:assert old_dec_by[sg]==new_dec_by[sg]
 assert [x for x in old_m['mappings'] if x['legacyGoalId']!=gid]==[x for x in m['mappings'] if x['legacyGoalId']!=gid and x['legacyGoalId'] not in {g['id'] for g in new_sources}]
 expected_changed_sources={gid} if source_before!=source_after else set()
 actual_changed_sources={k for k in old_source_by if old_source_by[k]!=new_source_by[k]};assert actual_changed_sources==expected_changed_sources
 expected_changed_dec={gid} if jurisdiction!='DE-BY' else set();assert {k for k in old_dec_by if old_dec_by[k]!=new_dec_by[k]}==expected_changed_dec
 # Complete normal reader structural checks; no source projection or gate.
 source_ids=[g['id'] for g in e['sourceGoals']];assert len(source_ids)==len(set(source_ids))
 decisions=Counter(d['sourceGoalId'] for d in m['decisions']);assert set(decisions)==set(source_ids) and all(n==1 for n in decisions.values())
 passage_ids={p['id'] for p in e['passages']};assert len(passage_ids)==len(e['passages'])
 assert all(g['passageId'] in passage_ids for g in e['sourceGoals'])
 edges=defaultdict(set)
 for edge in m['mappings']:
  assert edge['legacyGoalId'] in set(source_ids) and edge['reviewDecisionId']==edge['legacyGoalId'] and edge['canonicalGoalId'] in targets
  assert edge['matchType'] in ['exact','partial'];edges[edge['legacyGoalId']].add(edge['canonicalGoalId'])
 assert len(m['mappings'])==len({(x['legacyGoalId'],x['canonicalGoalId']) for x in m['mappings']})
 for d in m['decisions']:
  assert d['reviewer'] and d['reviewedAt'] and d['rationale'];assert set(d.get('canonicalGoalIds',[]))==edges[d['sourceGoalId']]
 extraction_out=O/'sources'/f'{jurisdiction}.whole-normal-source-extraction.author.json';mapping_out=O/'mappings'/f'{jurisdiction}.whole-normal-mapping.author.review.json'
 if e==old_e:write_copy(extraction_out,ep.read_bytes())
 else:put(extraction_out,e)
 if m==old_m:write_copy(mapping_out,mp.read_bytes())
 else:put(mapping_out,m)
 operation={'jurisdiction':jurisdiction,'sourceGoalId':gid,'sourceExtractionBefore':pin(ep),'mappingBefore':pin(mp),'wholeSourceGoalBefore':source_before,'wholeSourceGoalAfter':source_after,'wholeOldDecisionBefore':row['wholeDecisionsBefore'],'wholeOldDecisionAfter':[new_dec_by[gid]],'legacyEdgesBefore':old_edges,'legacyEdgesAfter':new_edges,'additionalWholeSourceGoals':new_sources,'additionalWholeDecisions':new_decisions,'additionalLegacyEdges':new_fragment_edges,'wholePassageOperations':passage_ops,'wholeSourceUnionApproved':False}
 operations.append(operation)
 un={'jurisdiction':jurisdiction,'wholeSourceHeaderBeforeObjectSha256':objpin({k:v for k,v in old_e.items() if k not in ['sourceGoals','passages']}),'wholeSourceHeaderAfterObjectSha256':objpin({k:v for k,v in e.items() if k not in ['sourceGoals','passages']}),'wholeMappingHeaderExcludingMechanicalSummaryBeforeObjectSha256':objpin({k:v for k,v in old_m.items() if k not in ['mappings','decisions','summary']}),'wholeMappingHeaderExcludingMechanicalSummaryAfterObjectSha256':objpin({k:v for k,v in m.items() if k not in ['mappings','decisions','summary']}),'untouchedSourceGoals':[{'id':g['id'],'wholeObjectSha256':objpin(g)} for g in old_e['sourceGoals'] if g['id'] not in expected_changed_sources],'untouchedDecisions':[{'sourceGoalId':d['sourceGoalId'],'wholeObjectSha256':objpin(d)} for d in old_m['decisions'] if d['sourceGoalId'] not in expected_changed_dec],'untouchedLegacyRowsWholeArraySha256':objpin([x for x in old_m['mappings'] if x['legacyGoalId']!=gid]),'untouchedLegacyRowsCount':len([x for x in old_m['mappings'] if x['legacyGoalId']!=gid]),'untouchedPassages':[{'id':p['id'],'wholeObjectSha256':objpin(p)} for p in old_e['passages'] if not new_sources or p['id']!=source_after['passageId']],'BYExactWholeSourceAndMapping':jurisdiction=='DE-BY' and extraction_out.read_bytes()==ep.read_bytes() and mapping_out.read_bytes()==mp.read_bytes()}
 unchanged.append(un)
 item={'jurisdiction':jurisdiction,'normalExtractionAlias':row['extractionBinding']['path'],'completeExtraction':pin(extraction_out),'normalMappingAlias':row['mappingBinding']['path'],'completeMapping':pin(mapping_out),'sourceGoals':len(e['sourceGoals']),'decisions':len(m['decisions']),'legacyEdges':len(m['mappings']),'newSourceGoalIds':[g['id'] for g in new_sources],'updatedExistingSourceGoalIds':list(expected_changed_sources),'updatedExistingDecisionIds':list(expected_changed_dec),'wholeSourceUnionAccepted':False};results.append(item)
 aliases.extend([{'normalHostAlias':row['extractionBinding']['path'],'physicalRepositorySource':pin(extraction_out)},{'normalHostAlias':row['mappingBinding']['path'],'physicalRepositorySource':pin(mapping_out)}])
 checks.append({'jurisdiction':jurisdiction,'sourceGoalIdsUnique':True,'exactlyOneDecisionPerCurrentSourceGoal':True,'completeDecisionCoverage':True,'allLegacyEdgeSetsEqualDecisionTargetSets':True,'noDuplicateEdges':True,'noDanglingPassageOrCanonicalTarget':True,'allUnchangedObjectsPreserved':True,'normalMappingPointerResolvedThroughExplicitCandidateAlias':True,'readProjectedCourseOrWholeUnionApproval':False})
put(O/'OPERATIONS.five-exact-before-after-and-four-source-fragments.author.json',{'schemaVersion':1,'role':'Bounded technical author operations, not a scientific vote','operations':operations})
put(O/'PRESERVED.all-untouched-source-goal-decision-passage-and-head-pins.json',{'schemaVersion':1,'hashMethod':'SHA256 of UTF8 JSON sort_keys=True ensure_ascii=False separators comma colon; comparisons are exact whole-object equality before hashing','rows':unchanged,'allOriginalInputFilesStillExact':[pin(ep) for _,ep,_,_,_ in baselines]+[pin(mp) for _,_,mp,_,_ in baselines]})
put(O/'CHECKS.actual-five-complete-files.structural-reader.json',{'schemaVersion':1,'role':'Actual bounded structural/identity check only, no Atlas/Native/QA gate','checks':checks,'allPassed':True,'readerCheckStillRequired':'Stock sourceAtlasFacet/document resolver bounded read of the ten actual files, no build call','actualHostsCreated':0,'normalPAMV':0,'Native':0,'Central':0})
put(O/'NEUTRAL.five-complete-normal-shaped-source-and-mapping-inputs.selector.json',{'schemaVersion':1,'role':'Finite complete source-shaped and mapping-shaped candidate artifacts for independent informed review; not normal-source adoption or source/whole-union acceptance','originalFrozenAuthorInput':pin(S),'originalInformedAScience':pin(A),'canonicalTargetContext':pin(C),'rows':results,'futureIsolatedHostAliases':aliases,'normalSourceExtractionPathMeaning':'Each complete mapping retains its original logical sourceExtractionPath. Resolve it through the explicit candidate alias map above; reading the active tree directly would read baseline data and is not an adapter test. No host was created.','historicalHeaderStatusMeaning':'Original top-level pipeline/status complete and other head fields are retained history, not a new whole-source or human approval. Changed/new decisions explicitly say informed-author-candidate, partial contribution and wholeSourceUnionApproved=false.','sourceTextOrWholePerformanceNarrowing':False,'remainingUncertainties':['Original independent A must inspect these actual serialized SourceGoal/Passage/Decision/legacy-edge bytes in an informed follow-up before integration.','RP and BW retained complete partner unions remain HOLD. Preserved other partial edges are context only and not newly scientifically cleared.','The general-data partner of BB/BE is retained; no blanket source union accepted.','Adapter is EDTA-five only. Source overlaps with Foundation/Acid/Alcohol and joint final projection are not composed or accepted.','No new actual experiment, NormalP/A/M/V, Native or Central result is present.'],'newScientificReviewVotes':0,'newIndependentDescriptionVotes':0,'HumanApproval':False,'HumanTrial':False,'activeWrites':0,'GitWrites':0})
print(json.dumps({'root':str(O.relative_to(R)),'filesSoFar':len([p for p in O.rglob('*') if p.is_file()]),'bytesSoFar':sum(p.stat().st_size for p in O.rglob('*') if p.is_file()),'rows':[{k:x[k] for k in ['jurisdiction','sourceGoals','decisions','legacyEdges','newSourceGoalIds']} for x in results]},ensure_ascii=False,indent=2))

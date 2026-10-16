# SPDX-License-Identifier: Apache-2.0
"""Mechanical, bounded Acid36 author adapter. Never adopts or reviews source science."""
from pathlib import Path
from collections import defaultdict,Counter
from datetime import datetime,timezone
import copy,hashlib,json
R=Path.cwd();E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
O=E/'chemie-acid-thirtysix-normal-source-adapter-author-20261016-v1'
F=E/'chemie-acid-two-residual-course-routes-and-card-origin-whole-author-successor-20261016-v2'
S=F/'sources/SOURCES.final-whole36source-rows-and-bounded-allocations.author.json'
B=E/'chemie-acid-two-pairs-complete-cases-source-memory-author-successor-20261016-v1/sources/WHOLE.final-source-cells-and-operator-partner-allocations.author.json'
A=E/'chemie-acid-final-three-view-card-origin-informed-independent-followup-20261016-v2/FIRST.informed-final-three-view-card-origin-source-PA.review.json'
C=R/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
NOW=datetime.now(timezone.utc).isoformat()
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);p=p if p.is_absolute() else R/p;b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def objpin(o):return 'sha256:'+hashlib.sha256(json.dumps(o,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def verify(p):
 a=pin(p['path']);assert all(a[k]==v for k,v in p.items() if k in a),(p,a)
def put(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x')as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
assert not O.exists()
assert pin(S)['sha256']=='sha256:b02ebe03ce9913b1ae4ae784c040df75aabcf9385e186c274b835b2bdbaa2f39'
assert pin(B)['sha256']=='sha256:58950b5e4f8eeaddb1ae1bcda6baf186d3298fb07ab5f551fb3305d26956d1cb'
assert pin(A)['sha256']=='sha256:502077a4d437e8ae952423598324911b0d35b6e27c06da1470bdc2b80c2774e5'
assert pin(C)['sha256']=='sha256:da3e18b54ff65e72c15f7f87a160f38d952362d468ece0b9893f32e3e7958782'
source=read(S);before={r['sourceGoalId']:r for r in read(B)['rows']};neutral=read(F/'NEUTRAL.final-whole-inputs.manifest.json');verify(neutral['wholeFinalSourceBodies']);verify(neutral['wholeUnchangedCanonical574'])
canonical=read(R/neutral['wholeUnchangedCanonical574']['path']);targets={g['id'] for g in canonical['goals']};science=read(A);assert science['claimLimits']['wholeCourseSourceAcceptance'] is False
cfg=read(C);mapping_by_source=defaultdict(list)
for p in cfg['mappingPaths']:
 m=read(R/p);mapping_by_source[m['sourceLandscapeId']].append((p,m))
mapping_pins={
 'DE-BB':'eee4983862b4a1c65a347a8165095a416bab973384e25a6b901120c8d9a30767',
 'DE-BE':'8539dd21c380c1d0d4e942ff23a61f6a2aa6a3a905356bd5be5dddcddd781ab9',
 'DE-HE':'279d43dacea3fc4831b97550d5d0f12eef368cf05d2dce89d4eb988fe78a4685',
 'DE-NI':'8045241a574b3514d0545e5fa9f9466d9e831cb31738647f0d3e403ebde67322',
 'DE-HB':'2b8ee1efc9336b67e566b4322d850598127cf24f0df07c4708ef6eabc6437462',
 'DE-BW':'58cda40fdc3086c5ac9cee7591b81f38a76438281dba88dd816c496ebd1c59a7',
 'DE-SH':'e12fd693d43e48cb1655c6723651152c53a6ae5c79dbc29d1828037dc7cfd0ba'}
groups=defaultdict(list);originals={};dedup={};before_checks=[]
for ordinal,row in enumerate(source['sourceRows']):
 verify(row['sourceExtraction']);ep=row['sourceExtraction']['path'];e=read(R/ep);gid=row['sourceGoalId'];assert row['wholeBody']['id']==gid
 matches=mapping_by_source[e['sourceLandscapeId']];assert len(matches)==1,('HOLD source alias ambiguous',gid);mp,m=matches[0];assert pin(mp)['sha256']=='sha256:'+mapping_pins[e['jurisdiction']]
 assert m['targetLandscapeId']==canonical['landscapeId'];key=(ep,mp);originals[key]=(e,m)
 if (ep,gid) in dedup:assert dedup[(ep,gid)]==row,('HOLD conflicting repeated source body',gid);continue
 dedup[(ep,gid)]=row
 sg=[g for g in e['sourceGoals']if g['id']==gid];ds=[d for d in m['decisions']if d['sourceGoalId']==gid];edges=[a for a in m['mappings']if a['legacyGoalId']==gid]
 prior=before.get(gid,{})
 if 'wholeSourceBodyBefore'in prior:
  assert sg==([]if prior['wholeSourceBodyBefore']is None else[prior['wholeSourceBodyBefore']])
 if 'wholeBeforeMappingDecisions'in prior:assert ds==prior['wholeBeforeMappingDecisions']
 if 'wholeBeforeMappingRows'in prior:assert edges==prior['wholeBeforeMappingRows']
 if not sg:
  assert gid=='hb-chemistry-sekii-gyo2022-3-3-1-2-protolyse-primary-lk-polyprotic-curves-p23' and not ds and not edges and row['wholeBody']['courseLevel']=='LK'
 else:assert len(sg)==len(ds)==1
 assert set(row['proposedCanonicalGoalIds'])=={a['goalId']for a in row['operatorAllocations']} and set(row['proposedCanonicalGoalIds'])<=targets
 groups[key].append((row,sg,ds,edges));before_checks.append({'sourceGoalId':gid,'wholeBeforeSourceGoal':sg,'wholeBeforeDecisions':ds,'wholeBeforeLegacyEdges':edges,'extraction':pin(ep),'mapping':pin(mp),'declaredHistoricalBeforeBodyCompared':bool(prior),'genuineNewId':not sg})
assert len(dedup)==36 and len(groups)==7
O.mkdir(parents=True);operations=[];preserved=[];rows=[];aliases=[];holds=[];passage_ops=[]
for (ep,mp),items in groups.items():
 old_e,old_m=originals[(ep,mp)];e=copy.deepcopy(old_e);m=copy.deepcopy(old_m);changed={r['sourceGoalId']for r,_,_,_ in items};replacements={};dsmap={};edgemap={};new_ids=[]
 for row,sg,ds,old_edges in items:
  gid=row['sourceGoalId'];g=copy.deepcopy(row['wholeBody']);replacements[gid]=g;proposed=row['proposedCanonicalGoalIds'];oldtargets=[a['canonicalGoalId']for a in old_edges]
  # An omitted old partner is not silently deleted or newly endorsed. Preserve its exact edge object and surface a HOLD.
  old_only=[a for a in old_edges if a['canonicalGoalId']not in proposed]
  if old_only:holds.append({'sourceGoalId':gid,'type':'UNLISTED_HISTORICAL_PARTNER_DISPOSITION_REQUIRES_EXACT_SOURCE_REVIEW','preservedWholeHistoricalEdges':old_only,'boundedProposedContributions':proposed,'reason':'A shorter proposed component array is not a complete independently authorized edge-removal operation. Historical context is retained, not newly scientifically accepted.','readyForSourceProjection':False})
  final_edges=[copy.deepcopy(a)for a in old_edges if a['canonicalGoalId']not in proposed]
  final_edges += [{'legacyGoalId':gid,'canonicalGoalId':t,'matchType':'partial','reviewDecisionId':gid}for t in proposed]
  # The complete reader decision must describe every retained edge honestly, with proposed and historical subsets distinguished.
  alltargets=list(dict.fromkeys(a['canonicalGoalId']for a in final_edges));edgemap[gid]=final_edges
  d={'sourceGoalId':gid,'topicCode':g['topicCode'],'sourceSpan':copy.deepcopy(g.get('sourceSpan',g.get('sourceRef'))),'decision':'mapped','canonicalGoalIds':alltargets,'matchType':'partial','rationale':'Bounded informed technical-author candidate. Only the explicitly listed proposed contributions carry the frozen Acid36 allocation; every unlisted historical edge is preserved as unreviewed context and requires exact disposition before actual Source projection. No source/canonical whole-goal equivalence, new scientific review or whole-course acceptance is asserted.','reviewedAt':NOW,'reviewer':'/root/chemie_conductometry_independent_visual_20261016; technical Acid36 source adapter author','reviewStatus':'informed-author-candidate','reviewAuthority':'ai_candidate','boundedSourceEvidence':{'wholeFinalSourceInput':pin(S),'originalHistoricalBeforeContainer':pin(B),'latestInformedResidualScientificLimits':pin(A),'boundedProposedCanonicalGoalIds':proposed,'exactOperatorAllocations':copy.deepcopy(row['operatorAllocations']),'historicalContextOnlyTargetGoalIds':[a['canonicalGoalId']for a in old_only],'historicalContextEdgesNewlyApproved':False,'wholeSourceUnionApproved':False,'wholeCourseApproved':False,'actualLearnerFulfilmentClaimed':False,'HumanApproval':False,'HumanTrial':False}}
  dsmap[gid]=d
  if not sg:new_ids.append(gid)
  operations.append({'baselineExtraction':pin(ep),'baselineMapping':pin(mp),'normalExtractionAlias':m['sourceExtractionPath'],'sourceGoalId':gid,'wholeSourceGoalBefore':sg,'wholeSourceGoalAfter':g,'wholeDecisionsBefore':ds,'wholeDecisionAfter':d,'wholeLegacyEdgesBefore':old_edges,'wholeLegacyEdgesAfter':final_edges,'boundedProposedPartialTargetIds':proposed,'unlistedHistoricalContextEdgesPreserved':old_only,'sourceScienceUnchangedByAdapter':True,'readyForSourceProjection':not old_only})
 e['sourceGoals']=[replacements.get(g['id'],g)for g in old_e['sourceGoals']]+[replacements[gid]for gid in new_ids]
 m['decisions']=[dsmap.get(d['sourceGoalId'],d)for d in old_m['decisions']]+[dsmap[gid]for gid in new_ids]
 all_edges=[];seen=set()
 for edge in old_m['mappings']:
  gid=edge['legacyGoalId']
  if gid not in changed:all_edges.append(edge)
  elif gid not in seen:all_edges+=edgemap[gid];seen.add(gid)
 for gid in new_ids:all_edges+=edgemap[gid]
 assert seen==changed-set(new_ids);m['mappings']=all_edges
 # Acid does not select its competing HB whole-passage header. Only membership for the one new cell changes.
 for gid in new_ids:
  pid=replacements[gid]['passageId'];p=next(p for p in e['passages']if p['id']==pid);oldp=copy.deepcopy(p)
  p['sourceGoalIds']=list(dict.fromkeys(g['id']for g in e['sourceGoals']if g['passageId']==pid))
  assert {k:v for k,v in p.items()if k!='sourceGoalIds'}=={k:v for k,v in oldp.items()if k!='sourceGoalIds'}
  passage_ops.append({'baselineExtraction':pin(ep),'passageId':pid,'wholeBefore':oldp,'wholeAfter':copy.deepcopy(p),'onlyChangedField':'sourceGoalIds','sourceGoalIdsDerivedFromCompleteCurrentCandidateSourceGoals':True,'competingAcidHeaderPassageNotSelected':True,'finalFoundationWholePassageNotTouched':True,'requiresExactMembershipCompositionWithFoundation':True})
 if 'summary'in m:
  assert len(e['sourceGoals'])==len(old_e['sourceGoals'])
  es=defaultdict(list)
  for edge in m['mappings']:es[edge['legacyGoalId']].append(edge)
  exact=sum(bool(es[d['sourceGoalId']])and all(a['matchType']=='exact'for a in es[d['sourceGoalId']])for d in m['decisions'])
  m['summary']=dict(m['summary'],sourceGoals=len(e['sourceGoals']),mappedSourceGoals=sum(d['decision']=='mapped'for d in m['decisions']),needsCanonicalGoal=sum(d['decision']!='mapped'for d in m['decisions']),exactMappings=exact,partialMappings=len(m['decisions'])-exact)
 for key in old_e:
  if key not in ['sourceGoals','passages']:assert old_e[key]==e[key]
 for key in old_m:
  if key not in ['mappings','decisions','summary']:assert old_m[key]==m[key]
 assert [g for g in old_e['sourceGoals']if g['id']not in changed]==[g for g in e['sourceGoals']if g['id']not in changed]
 assert [d for d in old_m['decisions']if d['sourceGoalId']not in changed]==[d for d in m['decisions']if d['sourceGoalId']not in changed]
 assert [a for a in old_m['mappings']if a['legacyGoalId']not in changed]==[a for a in m['mappings']if a['legacyGoalId']not in changed]
 gids={g['id']for g in e['sourceGoals']};dids=Counter(d['sourceGoalId']for d in m['decisions']);assert len(gids)==len(e['sourceGoals'])and set(dids)==gids and all(v==1 for v in dids.values())
 es=defaultdict(set)
 for a in m['mappings']:assert a['legacyGoalId']in gids and a['canonicalGoalId']in targets and a['reviewDecisionId']==a['legacyGoalId'];es[a['legacyGoalId']].add(a['canonicalGoalId'])
 assert len(m['mappings'])==len({(a['legacyGoalId'],a['canonicalGoalId'])for a in m['mappings']})
 for d in m['decisions']:assert set(d.get('canonicalGoalIds',[]))==es[d['sourceGoalId']]
 for p in e['passages']:assert set(p['sourceGoalIds'])=={g['id']for g in e['sourceGoals']if g['passageId']==p['id']} and len(p['sourceGoalIds'])==len(set(p['sourceGoalIds']))
 so=O/'sources'/f'{e["jurisdiction"]}.whole-normal-extraction.author.json';mo=O/'mappings'/f'{e["jurisdiction"]}.whole-normal-mapping.author.review.json';put(so,e);put(mo,m)
 rows.append({'jurisdiction':e['jurisdiction'],'stage':e['stage'],'completeExtraction':pin(so),'completeMapping':pin(mo),'baselineExtraction':pin(ep),'baselineMapping':pin(mp),'normalExtractionAlias':m['sourceExtractionPath'],'normalMappingAlias':mp,'sourceGoals':len(e['sourceGoals']),'decisions':len(m['decisions']),'legacyEdges':len(m['mappings']),'selectedSourceGoalIds':[r['sourceGoalId']for r,_,_,_ in items],'newSourceGoalIds':new_ids})
 aliases += [{'normalHostAlias':m['sourceExtractionPath'],'physicalRepositorySource':pin(so)},{'normalHostAlias':mp,'physicalRepositorySource':pin(mo)}]
 preserved.append({'jurisdiction':e['jurisdiction'],'allUnselectedWholeObjectsExactlyEqual':True,'unselectedSourceGoals':[{'id':g['id'],'objectSha256':objpin(g)}for g in old_e['sourceGoals']if g['id']not in changed],'unselectedDecisions':[{'sourceGoalId':d['sourceGoalId'],'objectSha256':objpin(d)}for d in old_m['decisions']if d['sourceGoalId']not in changed],'unselectedLegacyRowsArraySha256':objpin([a for a in old_m['mappings']if a['legacyGoalId']not in changed]),'sourceHeaderObjectSha256':objpin({k:v for k,v in old_e.items()if k not in ['sourceGoals','passages']}),'mappingHeaderObjectSha256':objpin({k:v for k,v in old_m.items()if k not in ['mappings','decisions','summary']})})
put(O/'INPUTS.exact-seven-normal-pairs-and-thirtysix-before-snapshots.json',{'wholeFinalSourceInput':pin(S),'originalHistoricalBeforeContainer':pin(B),'latestResidualScientificLimits':pin(A),'logicalMappingSelection':pin(C),'rows':before_checks,'deduplicatedSourceRows':36,'duplicateRowsSkipped':len(source['sourceRows'])-36,'oldHostNotAssumedPresent':True})
put(O/'OPERATIONS.thirtysix-whole-source-decision-legacy-pairs.author.json',{'rows':operations,'role':'Bounded author operations, no fresh source science','allSelectedNewContributionsPartial':True})
put(O/'OPERATIONS.one-HB-membership-only.no-competing-passage-selection.author.json',{'rows':passage_ops,'otherFullPassagesUnchanged':True,'HBFiveSiblingPrimaryCellsHeaderNotAddedAsNewNormalRows':True,'FoundationAndEDTAArtifactsUnchanged':True})
put(O/'PRESERVED.all-unselected-whole-object-pins.json',{'rows':preserved,'originalWholeInputFilesStillExact':[pin(p)for pair in originals for p in pair]})
put(O/'HOLDS.exact-unlisted-historical-partner-dispositions.author.json',{'role':'Concrete source edge boundaries; no silent union acceptance or old-edge deletion','holds':holds,'count':len(holds),'informedOriginalSourceReviewerMustResolveActualSerializedOperations':True,'actualSourceProjectionReady':not holds})
put(O/'NEUTRAL.seven-complete-normal-source-pairs.thirtysix-selected-cells.author-selector.json',{'schemaVersion':1,'role':'Finite full normal-shaped Acid36 AUTHOR adapter candidate; historical unlisted edge dispositions remain HOLD','wholeFinalSourceInput':pin(S),'latestScientificLimits':pin(A),'canonicalTargetContext':neutral['wholeUnchangedCanonical574'],'rows':rows,'futureIsolatedHostAliases':aliases,'exactBeforeSnapshots':pin(O/'INPUTS.exact-seven-normal-pairs-and-thirtysix-before-snapshots.json'),'operations':pin(O/'OPERATIONS.thirtysix-whole-source-decision-legacy-pairs.author.json'),'passageOperations':pin(O/'OPERATIONS.one-HB-membership-only.no-competing-passage-selection.author.json'),'remainingSourceEdgeHolds':pin(O/'HOLDS.exact-unlisted-historical-partner-dispositions.author.json'),'sourceProjectionReady':not holds,'HistoricalHeaderMeaning':'Original complete/status headings are unchanged history, not whole-source/whole-course/human acceptance.','scopeExclusions':['No Foundation/EDTA artifact changed.','Ten HB sibling header cells are not independently inserted; Foundation current-ID operations own them.','No source-course view or deck changes.','No Host, Atlas, Normal P/A/M/V, Native, Central or Git step.'],'HumanApproval':False,'HumanTrial':False,'newScientificReviewVotes':0,'activeWrites':0,'GitWrites':0})
print(json.dumps({'root':str(O.relative_to(R)),'normalPairs':len(rows),'selectedCells':36,'newCells':sum(len(r['newSourceGoalIds'])for r in rows),'historicalEdgeDispositionHolds':len(holds),'rows':[{k:r[k]for k in ['jurisdiction','sourceGoals','decisions','legacyEdges']}for r in rows],'bytes':sum(p.stat().st_size for p in O.rglob('*')if p.is_file())},ensure_ascii=False,indent=2))

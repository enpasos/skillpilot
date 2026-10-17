# SPDX-License-Identifier: Apache-2.0
"""Apply exact informed edge dispositions and two locator-only corrections."""
from pathlib import Path
from collections import defaultdict,Counter
from datetime import datetime,timezone
import copy,hashlib,json,shutil
R=Path.cwd();E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
O=E/'chemie-current-normal-source-thirty-reviewed-dispositions-technical-20261016-v1'
B=E/'chemie-four-module-normal-source-exact-key-composition-technical-20261016-v1/NEUTRAL.exact-normal-source-aliases-and-whole-pairs.json'
S=E/'chemie-acid-thirty-historical-partner-informed-independent-followup-20261016-v1/OUTPUTS.exact-thirty-informed-historical-dispositions.selector.json'
HB=E/'chemie-hb20-two-whole-mandatory-terminology-contexts-author-20261016-v1/OUTPUTS.two-HB20-official-context-columns.author-selector.json'
def read(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(v):
 p=R/v['path'];assert pin(p)==v,v;return p
def put(p,d):
 p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
assert not O.exists();assert pin(S)['sha256']=='sha256:d39804ed713b06e4e1548a9b8376ca1a178cbe41b0baa10fd2f9fdaa89fce525'
baseline=read(B);selector=read(S);reviewpath=verify(selector['exactScientificDispositions']);review=read(reviewpath);locatorpath=verify(selector['primaryLocatorCorrections']);locators=read(locatorpath)['findings'];assert len(review['rows'])==30 and len(locators)==2
aliases={a['normalHostAlias']:copy.deepcopy(a) for a in baseline['aliases']};current={k:read(verify(a['physicalRepositorySource'])) for k,a in aliases.items()};before=copy.deepcopy(current)
hb=read(HB);hb_alias=hb['normalExtractionAlias'];hb_after=read(verify(hb['completeExtraction']));assert len(hb_after['sourceGoals'])==len(current[hb_alias]['sourceGoals']);assert hb_after['sourceGoals']==current[hb_alias]['sourceGoals'];assert all(hb_after[k]==current[hb_alias][k] for k in current[hb_alias] if k!='passages');current[hb_alias]=hb_after
ops=[];history=[];now=datetime.now(timezone.utc).isoformat()
for row in review['rows']:
 gid=row['sourceGoalId'];matches=[(a,m) for a,m in current.items() if 'decisions' in m and any(d['sourceGoalId']==gid for d in m['decisions'])];assert len(matches)==1,(gid,len(matches));alias,m=matches[0];e=current[m['sourceExtractionPath']];g=[g for g in e['sourceGoals'] if g['id']==gid];assert len(g)==1
 src=read(verify(row['wholeSourceBody']['container']))
 frozen=src
 for part in row['wholeSourceBody']['pointer'].strip('/').split('/'):frozen=frozen[int(part)] if isinstance(frozen,list) else frozen[part]
 assert g[0]==frozen,gid
 old_d=[d for d in m['decisions'] if d['sourceGoalId']==gid];assert len(old_d)==1;old_d=old_d[0];old_edges=[x for x in m['mappings'] if x['legacyGoalId']==gid];a=row['authorOperation'];edges=copy.deepcopy(a['currentLegacyEdgesAfterDisposition']);targets=a['currentCanonicalGoalIdsAfterDisposition']
 assert targets and set(targets)=={x['canonicalGoalId'] for x in edges};assert all(x['legacyGoalId']==gid and x['matchType']=='partial' for x in edges)
 actions={x['targetGoalId']:x for x in row['historicalEdgeDispositions']};assert len(actions)==len(row['historicalEdgeDispositions'])
 for x in row['historicalEdgeDispositions']:
  assert x['historicalWholeEdge'] in old_edges
  assert (x['targetGoalId'] in targets)==x['includeInCurrentCanonicalGoalIds']
 assert set(a['excludeFromCurrentCanonicalGoalIdsAndLegacyEdges']).isdisjoint(targets)
 d=copy.deepcopy(old_d);d.update(canonicalGoalIds=copy.deepcopy(targets),reviewedAt=now,reviewer='/root, technical author serializing the exact independent informed source-edge disposition',rationale='Current bounded partial contributions follow the exact independently informed per-edge scientific disposition. Every historical whole edge and before decision is retained in immutable source history and the complete operation sidecar. Context-only and scientifically unsupported current inherited claims are excluded from the actual canonicalGoalIds and legacy arrays because the stock reader has no context-only filter. No source operator is narrowed, no whole source union/course or observed learner/laboratory performance is approved.',reviewAuthority='ai_candidate',reviewStatus='informed-author-candidate',currentHistoricalEdgeDisposition={'independentInformedReview':pin(reviewpath),'sourceGoalId':gid,'originalScientificReviewer':review['reviewer'],'wholeSourceUnionApproved':False,'HumanApproval':False,'HumanTrial':False})
 d.pop('historicalContextOnlyTargetGoalIds',None);d.pop('sourceProjectionReady',None)
 if 'matchType' in d:d['matchType']='partial'
 m['decisions']=[d if x['sourceGoalId']==gid else x for x in m['decisions']]
 i=next(i for i,x in enumerate(m['mappings']) if x['legacyGoalId']==gid);others=[x for x in m['mappings'] if x['legacyGoalId']!=gid];m['mappings']=others[:i]+edges+others[i:]
 assert [x for x in m['mappings'] if x['legacyGoalId']!=gid]==[x for x in before[alias]['mappings'] if x['legacyGoalId']!=gid] if sum(1 for q in ops if q['normalMappingAlias']==alias)==0 else True
 ops.append({'normalMappingAlias':alias,'sourceGoalId':gid,'wholeBeforeDecision':old_d,'wholeAfterDecision':d,'wholeCurrentBeforeLegacyEdges':old_edges,'wholeCurrentAfterLegacyEdges':edges,'exactIndependentDisposition':row})
 history.extend({'sourceGoalId':gid,'completeHistoricalEdge':x['historicalWholeEdge'],'action':x['action'],'reasonDe':x['sourceSpecificScientificReasonDe'],'currentEvidenceTransport':False} for x in row['historicalEdgeDispositions'] if not x['includeInCurrentCanonicalGoalIds'])
locator_ops=[]
for finding in locators:
 gid=finding['sourceGoalId'];matches=[(a,e) for a,e in current.items() if 'sourceGoals' in e and any(g['id']==gid for g in e['sourceGoals'])];assert len(matches)==1;alias,e=matches[0];g=next(g for g in e['sourceGoals'] if g['id']==gid);oldg=copy.deepcopy(g);assert g['sourceRef']==finding['before'];assert g['sourceSpan']==finding['wholeBeforeSourceSpan'];verify(finding['wholeOriginalPrimaryPDF']);g['sourceRef']=finding['after'];assert {k:v for k,v in oldg.items() if k!='sourceRef'}=={k:v for k,v in g.items() if k!='sourceRef'};locator_ops.append({'normalExtractionAlias':alias,'sourceGoalId':gid,'wholeBefore':oldg,'wholeAfter':copy.deepcopy(g),'onlyChangedField':'sourceRef','scientificLocatorFinding':finding})
assert len(history)==46 and len(ops)==30
checks=[]
for alias,m in current.items():
 if 'sourceExtractionPath' not in m:continue
 e=current[m['sourceExtractionPath']];ids={g['id'] for g in e['sourceGoals']};counts=Counter(d['sourceGoalId'] for d in m['decisions']);assert set(counts)==ids and set(counts.values())=={1};es=defaultdict(set)
 for x in m['mappings']:assert x['legacyGoalId'] in ids;es[x['legacyGoalId']].add(x['canonicalGoalId'])
 assert len(m['mappings'])==len({(x['legacyGoalId'],x['canonicalGoalId']) for x in m['mappings']})
 for d in m['decisions']:assert set(d['canonicalGoalIds'])==es[d['sourceGoalId']]
 checks.append({'mappingAlias':alias,'sourceAlias':m['sourceExtractionPath'],'sourceGoalCount':len(ids),'completeDecisionCoverage':True,'legacyDecisionTargetEquality':True})
O.mkdir(parents=True);final_aliases=[]
for index,(alias,body) in enumerate(sorted(current.items()),1):
 a=copy.deepcopy(aliases[alias])
 if body!=before[alias]:
  p=O/'current'/(f'{index:02d}-'+Path(alias).name);put(p,body);a['physicalRepositorySource']=pin(p);a['changedInThisExactFollowup']=True
 else:a['changedInThisExactFollowup']=False
 final_aliases.append(a)
put(O/'OPERATIONS.exact-thirty-current-decisions-and-whole-edge-arrays.json',{'role':'Technical author application, no new scientific vote','independentReview':pin(reviewpath),'operations':ops})
put(O/'HISTORY.complete-fortysix-excluded-old-edge-objects-and-reasons.json',{'role':'Complete old relations retained for history, explicitly not active source evidence','relations':history,'completeBeforeDecisionsInOperations':True,'originalAllFilesUnmodified':True})
put(O/'OPERATIONS.exact-two-BW-page-only-source-reference-corrections.json',{'independentLocatorFinding':pin(locatorpath),'operations':locator_ops,'noSourceTextOrOperatorNarrowing':True})
put(O/'CHECKS.actual-complete-current-eighteen-pairs.json',{'schemaVersion':1,'rows':checks,'allPassed':True,'actualAtlasRuns':0,'Native':0,'Central':0})
put(O/'NEUTRAL.current-complete-normal-source-pairs.after-informed-dispositions.json',{'schemaVersion':1,'role':'Complete current source candidates after exact informed edge actions and metadata corrections; final informed serialized-byte review and actual projection still required','aliases':final_aliases,'completePairs':18,'currentHistoricalEdgeDispositionReview':pin(reviewpath),'twoExactHBContextColumns':pin(HB),'twoExactBWLocatorCorrections':pin(locatorpath),'noWholeSourceOrCourseApproval':True,'allWholeSourceOperatorsUnshortened':True,'HumanApproval':False,'HumanTrial':False})
put(O/'OUTPUTS.finite-current-normal-source-after-thirty-exact-informed-dispositions.selector.json',{'schemaVersion':1,'role':'Technical exact informed-disposition application, pending serialized review; not Atlas or M7 acceptance','currentNormalSources':pin(O/'NEUTRAL.current-complete-normal-source-pairs.after-informed-dispositions.json'),'exactThirtyOperations':pin(O/'OPERATIONS.exact-thirty-current-decisions-and-whole-edge-arrays.json'),'completeExcludedHistory':pin(O/'HISTORY.complete-fortysix-excluded-old-edge-objects-and-reasons.json'),'twoLocatorOnlyCorrections':pin(O/'OPERATIONS.exact-two-BW-page-only-source-reference-corrections.json'),'actualCompletePairChecks':pin(O/'CHECKS.actual-complete-current-eighteen-pairs.json'),'oldEdgesIndividuallyDisposed':74,'boundedCurrentRetentions':28,'retainedHistoryOnly':34,'removedUnsupportedCurrentInheritance':12,'newScientificVotes':0,'actualAtlasRuns':0,'Native':0,'NormalPAMV':0,'Central':0,'activeWrites':0,'GitWrites':0})
(O/'scripts').mkdir();shutil.copyfile(Path(__file__),O/'scripts/apply_reviewed_thirty.py')
put(O/'SEAL.finite-current-normal-source-after-thirty-informed-dispositions.json',{'files':[pin(p) for p in sorted(O.rglob('*')) if p.is_file()],'noSelfHash':True})
print(json.dumps({'selector':pin(O/'OUTPUTS.finite-current-normal-source-after-thirty-exact-informed-dispositions.selector.json'),'normalAliases':len(final_aliases),'newWholeCurrentFiles':sum(x['changedInThisExactFollowup'] for x in final_aliases),'historyOnlyEdges':len(history),'allPairsConsistent':len(checks)},indent=2))

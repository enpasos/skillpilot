# SPDX-License-Identifier: Apache-2.0
# Read-only facts from the actual stock terminal selector and current pinned data.
import json,hashlib,re
from pathlib import Path
from datetime import datetime,timezone
O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-final-practice-release-and-native-binding-audit-technical-20261018-v1')
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 b=Path(p).read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(name,data):(O/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'; E='app/scripts/generateCurriculumQualityStatus.ts'
d=read(C);by={g['id']:g for g in d['goals']}; src=Path(E).read_text()
clusterids=re.findall(r"'([a-f0-9-]{36})'",src.split('const CANONICAL_GYM_CHEMISTRY_SEK2_PRACTICE_CLUSTER_IDS = [',1)[1].split(']',1)[0])
def memory(g):return g.get('nodeKind')=='memory' or 'memorization' in g.get('tags',[]) or any(t.startswith('srs-deck:') for t in g.get('tags',[]))
terminalids=[id for cid in clusterids for id in by[cid].get('contains',[]) if id in by and not by[id].get('contains') and not memory(by[id])]
parents={id:[g['id'] for g in d['goals'] if id in g.get('contains',[])] for id in by}
rows=[]
for g in d['goals']:
 if 'examData' not in g:continue
 ex=g['examData']; coverage={k:bool([v for v in ex.get(k,[]) if isinstance(v,str) and v.strip()]) for k in ['coveredGoalIds','coveredStrands','demandLevels']}
 rows.append({'goalId':g['id'],'title':g['title'],'tags':g.get('tags',[]),'directParents':parents[g['id']],'inExactStockTerminalScope':g['id'] in terminalids,'reviewStatus':ex.get('reviewStatus'),'explicitStatusBlocksReadiness':bool(str(ex.get('reviewStatus','')).strip()) and str(ex.get('reviewStatus','')).strip().lower()!='released','releaseCoverageMetadataIssues':(['reviewStatus is not released'] if str(ex.get('reviewStatus','')).strip().lower()!='released' else [])+['missing '+k for k,v in coverage.items() if not v],'taskAndSolutionNonblank':all(isinstance(ex.get(k),str) and bool(ex[k].strip()) for k in ['taskContent','solutionContent']),'sourceArtifactPath':ex.get('sourceArtifactPath')})
from collections import Counter
scope=[r for r in rows if r['inExactStockTerminalScope']]
dump('FACTS.actual-terminal-CQR203-scope-and-nine-legacy-boundaries.json',{'role':'EXACT_SELECTOR_AND_METADATA_FACTS_NOT_NEW_SCIENCE_OR_FULL_CQR_EVALUATION','measuredAtUTC':datetime.now(timezone.utc).isoformat(),'canonical':pin(C),'stockEvaluator':pin(E),'selector':'Direct children of configured six clusters, resolved, atomic by empty contains, nonmemory; no recursive root traversal and no whole canonical exam universe.','clusters':[{'id':id,'title':by[id]['title'],'directAtomicNonmemoryChildren':sum(id2 in terminalids for id2 in by[id].get('contains',[]))} for id in clusterids],'summary':{'allCanonicalExams':len(rows),'terminalExamOccurrences':len(scope),'terminalGoalOccurrences':len(terminalids),'terminalUniqueGoalIds':len(set(terminalids)),'missingExamDataIds':[id for id in terminalids if 'examData' not in by[id]],'terminalStatusCounts':dict(Counter(r['reviewStatus'] or 'legacy_missing' for r in scope)),'terminalExplicitNonreleasedIds':[r['goalId'] for r in scope if r['explicitStatusBlocksReadiness']],'terminalReleaseCoverageIssueIds':[r['goalId'] for r in scope if r['releaseCoverageMetadataIssues']],'nineLegacyStatusCasesOutsideTerminalScope':sum(not r['inExactStockTerminalScope'] for r in rows if r['reviewStatus'] not in ['released','draft'])},'allExamRows':rows,'normalWrites':0})
# Compare pre-orientation whole goals, selected P ownership and actual current requires.
A='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-twenty-seven-orientation-entry-author-20261018-v1/AUTHOR.27-orientation-entry-requires-only.pending.json'
a=read(A); p=read(O/'FACTS.actual-current-P-fingerprints-and-exam-release-inventory.json'); stale={r['goalId']:r for r in p['records'] if not r['reviewInputFingerprintCurrent']};transport=[]
for r in a['records']:
 before=r['beforeWholeGoal'];now=by[r['goalId']];keys=sorted(k for k in before.keys()|now.keys() if before.get(k)!=now.get(k));owner=stale[r['goalId']]
 transport.append({'goalId':r['goalId'],'wholeGoalChangedTopLevelFields':keys,'beforeRequires':before.get('requires',[]),'currentRequires':now.get('requires',[]),'addedRequires':[x for x in now.get('requires',[]) if x not in before.get('requires',[])],'removedRequires':[x for x in before.get('requires',[]) if x not in now.get('requires',[])],'currentOriginalPOwner':owner})
# Exact embedded earlier whole assessment design, not a new acceptance or release vote.
H='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-three-recycling-current406-graph-scope-independent-20261013-v1/DECISIONS.independent-graph-scope-assessment-and-three-AM.actual.json'
h=read(H);old=next(r for r in h['assessmentDecisions'] if r['goalId']=='ee494d08-9514-54f2-ac5e-eebc20ca8725');g=by[old['goalId']]
dump('FACTS.actual27-P-context-delta-and-existing-ee494-design-binding.json',{'role':'EXACT_CONTEXT_AND_PRIOR_REVIEW_BINDING_FACTS_NOT_NEW_VOTES','canonical':pin(C),'orientationAuthorInput':pin(A),'PFactInput':pin(O/'FACTS.actual-current-P-fingerprints-and-exam-release-inventory.json'),'PTransportRecords':transport,'summary':{'stalePRecords':len(stale),'requiresOnlyWholeGoalChanges':all(r['wholeGoalChangedTopLevelFields']==['requires'] for r in transport),'allAppendExactlyOrientation':all(r['addedRequires']==[a['orientationAnchorGoalId']] and not r['removedRequires'] for r in transport),'unchanged450GoalAndProfileFingerprints':not p['summary']['goalFingerprintStaleIds'] and not p['summary']['wholeProfileFingerprintStaleIds']},'earlierEe494AssessmentDesign':{'source':pin(H),'originalDecision':old['verdict'],'wholeEmbeddedGoalEqualsCurrent':old['wholeCurrentGoal']==g,'wholeExamDataEqualsCurrent':old['wholeCurrentGoal']['examData']==g['examData'],'requiresEqualsCurrent':old['requires']==g['requires'],'coveredGoalIdsEqualsCurrent':old['coveredGoalIds']==g['examData']['coveredGoalIds'],'historicalMachineNotReleaseBoundary':old.get('machineDesignAcceptanceIsNotRuntimeOrHumanRelease'),'historicalStatusRemains':old.get('originalExamReviewStatusUnchanged'),'newScientificAcceptanceVote':False,'newReleaseAuthority':False},'normalWrites':0})
print(json.dumps({'terminalClusters':len(clusterids),'terminalExams':len(scope),'terminalStatusCounts':dict(Counter(r['reviewStatus'] or 'legacy_missing' for r in scope)),'nineLegacyOutside':all(not r['inExactStockTerminalScope'] for r in rows if r['reviewStatus'] not in ['released','draft']),'PStale':len(stale),'27RequiresOnly':all(r['wholeGoalChangedTopLevelFields']==['requires'] for r in transport),'ee494ExamDataExactPriorDesign':old['wholeCurrentGoal']['examData']==g['examData']},indent=2))

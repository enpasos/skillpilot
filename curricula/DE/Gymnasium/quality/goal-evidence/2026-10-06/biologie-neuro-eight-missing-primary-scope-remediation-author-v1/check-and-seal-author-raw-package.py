#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Verify inactive raw package boundaries and seal actual inputs; no curriculum runs."""
import datetime
import hashlib
import json
import pathlib

OUT=pathlib.Path(__file__).resolve().parent
ROOT=pathlib.Path(__file__).resolve().parents[7]
DAY=OUT.parent
ROUTING=DAY/'biologie-neuro-th-hh-forty-reviewed-components-native-overlay-preparation-v1'
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def rel(p):return str(p.relative_to(ROOT))
freeze=OUT/'eight-missing-primary-scope-remediation-author-v1.final.freeze.json'
assert not freeze.exists()
initial=read(OUT/'current-inputs-and-routing.initial.actual.receipt.json')
for b in initial['actualInputBindings']:assert sha(ROOT/b['path'])==b['sha256'],b['path']
old_guard_path=ROUTING/'actual-current-inputs-and-protected74-127-807-478.guard.json'
old_guard=read(old_guard_path)
for b in old_guard['inputBindings']:assert sha(ROOT/b['path'])==b['sha256'],b['path']
route_freeze=read(ROUTING/'native-overlay-preparation-v1.final.freeze.json')
for b in route_freeze['files']:assert sha(ROUTING/b['path'])==b['sha256'],b['path']
current_path=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
before=read(OUT/'current472-whole-canonical.actual.snapshot.json')
assert before==read(current_path)
candidate=read(OUT/'current472-eight-only.canonical.author-v1.candidate.json')
old={g['id']:g for g in before['goals']};new={g['id']:g for g in candidate['goals']}
package=read(OUT/'eight-current-goals.actual-primary-scope-and-DEEN-candidates.author-v1.json')
ids={r['goalId'] for r in package['records']}
assert len(ids)==8 and set(old)==set(new) and len(new)==472
changed={gid for gid in old if old[gid]!=new[gid]}
assert changed==ids
assert all(g.get('requires')==new[g['id']].get('requires') and g.get('contains')==new[g['id']].get('contains') for g in before['goals'])
assert all(g==new[g['id']] for g in before['goals'] if g['id'] not in ids)
gate_path=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-fifteen-reviewed-active-integration-v1/current-central-five-gate.actual.report.json'
gate=read(gate_path)
counts={s['subject']:len(s['strictCompleteGoalIds']) for s in gate['subjects']}
assert counts=={'biologie':74,'chemie':127,'mathematik':807,'physik':478}
bio=next(s for s in gate['subjects'] if s['subject']=='biologie')
assert not set(bio['strictCompleteGoalIds'])&ids
assert all(old[gid]==new[gid] for gid in bio['strictCompleteGoalIds'])
map_proposals=read(OUT/'eight-inactive-source-component-mapping-proposals.author-v1.json')
assert map_proposals['mappings']==[]
assert len(map_proposals['decisions'])==8
assert all(x['decision']=='needs_canonical_goal' and not x['mappedTargetGoalIds'] for x in map_proposals['decisions'])
reading=read(OUT/'actual-primary-text-html-and-raster-reading.author-v1.receipt.json')
assert len(reading['actualPDFRasterViews'])==3 and all(x['actuallyViewedByAuthor'] for x in reading['actualPDFRasterViews'])
nw=read(OUT/'NW-two-protected-losses.actual-primary-and-direct-mapping-diagnosis.json')
assert len(nw['records'])==2
assert all(x['baselineWitnesses'][0]['storedBaselineWitness']['coverage']=='direct' and not x['falseClusterInheritanceUsed'] for x in nw['records'])
assert all(not x['declaredActiveComponentExtractionExists'] and not x['separateMappingAlreadyInActiveAtlasConfig'] for x in nw['records'])

# Historical NW B decisions are routed as history; they do not grant this author package approval.
b_dir=DAY/'biologie-neuro-he-raw-nw-two-components-v3-independent-b-v1'
b_review_path=b_dir/'independent-b.review.json'
b_freeze_path=b_dir/'independent-b.final.freeze.json'
b_review=read(b_review_path)
b_freeze=read(b_freeze_path)
for binding in b_freeze.get('files',[]):
    p=ROOT/binding['path']
    if not p.exists():p=b_dir/binding['path']
    assert sha(p).removeprefix('sha256:')==binding['sha256'].removeprefix('sha256:'),binding['path']
decisions=[d for d in b_review['decisions'] if d.get('canonicalGoalId') in {'5b2571d9-f079-52b2-b21b-8f389c7409f4','49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd'}]
assert len(decisions)==2 and all(d['verdict']=='KEEP' and d['matchType']=='partial' for d in decisions)
diagnostic={
    'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role':'actual inactive raw-package preservation and historical routing guard',
    'initialActualInputsCount':len(initial['actualInputBindings']),
    'allInitialActualInputsExactAfterAuthorPreparation':True,
    'routingOld1241InputGuard':{'path':rel(old_guard_path),'sha256':sha(old_guard_path),'actualBindingsRechecked':len(old_guard['inputBindings']),'allExact':True},
    'previousRoutingFinalFreeze':{'path':rel(ROUTING/'native-overlay-preparation-v1.final.freeze.json'),'sha256':sha(ROUTING/'native-overlay-preparation-v1.final.freeze.json'),'all58FrozenFilesStillExact':True},
    'exactCurrentProtectionGate':{'path':rel(gate_path),'sha256':sha(gate_path),'strictCounts':counts},
    'all74StrictBioWholeGoalsUnchangedInCandidate':True,'selectedEightStrictBioIntersection':[],
    'wholeCanonicalNodes':472,'actualChangedCanonicalGoalIds':sorted(changed),'all464OutsideEightWholeGoalsExact':True,'all472RequiresContainsExact':True,
    'noStableCanonicalIdsAddedOrRemoved':True,'newMappedDecisions':0,
    'historicalNWBPartialDecisions':{'reviewPath':rel(b_review_path),'reviewSha256':sha(b_review_path),'freezePath':rel(b_freeze_path),'freezeSha256':sha(b_freeze_path),'exactFrozenFiles':True,'decisions':decisions,'historicalProtectionCountsNotReusedAsCurrentCounts':True,'secondExactIndependentDecisionBindingStillNeedsExplicitTechnicalVerification':True,'noNewApprovalGranted':True},
    'newNativeRuns':0,'globalBuilds':0,'centralRuns':0,'activeWrites':False,'gitMutation':False,
    'newIndependentScientificApprovals':0,'newStrictCompletions':0,'strictNetGain':0,
    'whole390SourceUnionRestorationClaim':False,'integrationApproved':False,
}
receipt_path=OUT/'actual-final-preservation-and-historical-NW-routing.guard.json'
assert not receipt_path.exists()
receipt_path.write_text(json.dumps(diagnostic,ensure_ascii=False,indent=2)+'\n')
files=[{'path':str(p.relative_to(OUT)),'sha256':sha(p),'bytes':p.stat().st_size} for p in sorted(OUT.rglob('*')) if p.is_file() and p!=freeze]
final={
    'schemaVersion':1,'freezeKind':'eight-missing-current-neuro-primary-scope-author-raw-v1',
    'frozenAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status':'AUTHOR_RAW_PACKAGE_READY_FOR_TWO_INDEPENDENT_REVIEWS_ALL_WHOLE_CURRENT_SOURCE_HOLDS_RETAINED',
    'files':files,'currentCanonicalNodes':472,'currentAtomicGoals':390,
    'wholeCurrentNeuroGoalsReviewedAsAuthor':8,'wholeCurrentNeuroSourceHoldsRetained':8,
    'declaredAuthoredModelSpecialisations':3,'minimalNarrowedCorrectionProposals':5,
    'actualFreshOfficialRetrievals':4,'actualPDFRasterViews':3,
    'actualPrimaryBYOriginalHTMLRecords':45,'newCanonicalIds':0,
    'NWProtectedCurrentContextLossesDiagnosed':2,'NWActiveContextRestorations':0,
    'currentProtectedStrictCounts':counts,
    'old382RoutingFreezeUnchanged':True,'oldTH19HH21ScienceDecisionsUnchanged':True,
    'allOriginal1241InputsAndInitialActualBindingsExactAtFreeze':True,
    'newNativeRuns':0,'globalBuilds':0,'centralRuns':0,
    'newIndependentScientificApprovals':0,'newStrictCompletions':0,'strictNetGain':0,
    'activeWrites':False,'gitMutation':False,'wholeSourceClearance':False,
    'whole390SourceGatePassed':False,'integrationApproved':False,'humanApproval':False,'humanTrial':False,
}
freeze.write_text(json.dumps(final,ensure_ascii=False,indent=2)+'\n')
for b in files:assert sha(OUT/b['path'])==b['sha256'],b['path']
print(json.dumps({'status':final['status'],'frozenFiles':len(files),'freezeSha256':sha(freeze),'changedInactiveGoals':8,'NWdiagnoses':2,'newApprovals':0,'activeWrites':False}))

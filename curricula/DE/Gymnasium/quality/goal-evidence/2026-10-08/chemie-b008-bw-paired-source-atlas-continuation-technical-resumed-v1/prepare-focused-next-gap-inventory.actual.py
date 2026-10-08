# SPDX-License-Identifier: Apache-2.0
"""Route exact existing evidence into review-sized groups; never decide new source science."""
import collections, hashlib, json, os, subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[7]; OWN=Path(__file__).resolve().parent; BASE=OWN.parent
def read(p):return json.loads(p.read_text())
def bind(p):
    b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,value):
    p=OWN/name;p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n');return bind(p)
gap=read(OWN/'exact38-missing-whole-goals-and-linked-source-evidence.diagnostic.json')
integration=read(OWN/'paired-nine-normal-fields.integration.actual.json')
v11=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b008-twenty-six-native-source-preparation-author-v11/twenty-six-partial-source-components-and-original-national-holds.author-candidate.json'
prospective=read(v11); pby={r['nativeCandidateGoalId']:r for r in prospective['placements']}
slpath=BASE/'chemie-b008-sl-specific-source-continuation-author-root-20261008-v21/exact-sl-primary-course-components-and-three-view-proposals.author.json'
sl=read(slpath); by_goal=collections.defaultdict(list)
for r in sl['specificPartialChildComponents']:by_goal[r['specificChildGoalId']].append(r)
catalog={r['sourceRef']:r for r in gap['sharedActualLinkedWholeSourceEvidence']}
ex_cache={}; evidence={}
def actual_source(extraction_path,sid):
    ep=ROOT/extraction_path
    if extraction_path not in ex_cache:ex_cache[extraction_path]=read(ep)
    e=ex_cache[extraction_path];goal=next((g for g in e['sourceGoals'] if g['id']==sid),None)
    if not goal:return None
    passage=next((p for p in e['passages'] if p['id']==goal.get('passageId')),None)
    key=extraction_path+'::'+sid
    evidence[key]={'sourceEvidenceKey':key,'sourceExtraction':bind(ep),'wholeActualSourceGoal':goal,'wholeActualPassage':passage,'officialSourceDocuments':e.get('sourceDocuments') or [e.get('sourceDocument')]}
    return key
rows=[]
for r in gap['actual38MissingWholeGoals']:
    gid=r['goalId']; prov=r['wholeGoal'].get('extendedData',{}).get('provenance',{})
    row={'goalId':gid,'title':r['title'],'candidateKey':r['routineCandidateKey'],'actualGapGroup':r['actualGapGroup'],
         'actualMissingFields':r['missingFields'],'currentDirectSourceIDs':[catalog[ref]['sourceGoalId'] for ref in r['directMappedSourceRefs']],
         'candidateSourceIDs':[],'candidateSourcesAreNotApproved':True,'genuinePairedSourceApprovalVerifiedInThisPacket':False}
    if gid in pby:
        pb=pby[gid]; cs=[]
        for c in pb['primaryComponents']:
            key=actual_source(c['originalSourceExtractionBinding']['path'],c['originalSourceGoalId']);assert key
            row['candidateSourceIDs'].append(c['originalSourceGoalId'])
            cs.append({'sourceEvidenceKey':key,'wholeAuthorComponent':c,'noScientificApprovalAdded':True})
        row['existingBYProspectiveComponents']=cs;row['BYOperatorContractDe']=pb['sourceOperatorContractDe'];row['BYProspectiveStatus']=pb['status']
    if by_goal[gid]:
        row['existingSLProspectiveComponents']=by_goal[gid]
        row['candidateSourceIDs'] += [x['currentExistingSourceGoalId'] for x in by_goal[gid]]
    linked=[]
    for scope in [prov,prov.get('historicalCompoundSourceContext',{})]:
        if scope.get('sourceExtractionPath') and scope.get('sourceGoalId'):
            key=actual_source(scope['sourceExtractionPath'],scope['sourceGoalId']);assert key
            linked.append({'sourceEvidenceKey':key,'boundProvenance':scope,'sourceBindingReviewPacket':bind(ROOT/scope['sourceBindingReviewPath']) if scope.get('sourceBindingReviewPath') and (ROOT/scope['sourceBindingReviewPath']).exists() else None})
            row['candidateSourceIDs'].append(scope['sourceGoalId'])
    if linked:row['existingHEOrRPProvenanceEvidence']=linked
    if r['actualGapGroup']=='eleven-historical-HE-RP-content-direct-source-binding-gaps':
        row['historicalAuthoredSourceID']=(prov.get('historicalProvenance')or prov).get('sourceGoalId')
        row['indexedOfficialSourceIDAbsentFromCurrentProvenance']=not bool(linked)
        row['nextReviewBoundary']='whole goal and actual official operator/content/course correspondence; historical canonical provenance UUID is not an official extraction mapping decision'
    if r['directMappedSourceRefs']:
        row['actualCurrentDirectMappings']=[{'sourceGoalId':catalog[ref]['sourceGoalId'],'sourceStage':catalog[ref]['sourceStage'],'sourceCourseProfile':catalog[ref]['sourceCourseProfile'],'reviewer':catalog[ref]['normalDecision'].get('reviewer'),'reviewedAt':catalog[ref]['normalDecision'].get('reviewedAt'),'actualWholeSourceGoal':catalog[ref]['wholeSourceGoal'],'actualWholePassage':catalog[ref]['wholePassage']} for ref in r['directMappedSourceRefs']]
    row['candidateSourceIDs']=sorted(set(row['candidateSourceIDs']));rows.append(row)
groups=collections.Counter(r['actualGapGroup'] for r in rows)
assert groups=={'nineteen-B008-boundary-child-source-binding-gaps':19,'eleven-historical-HE-RP-content-direct-source-binding-gaps':11,'eight-BY-practical-authored-course-policy-gaps':8}
sl_missing=[]
for n in ['SekI','SekII']:
    mp=BASE/f'chemie-b008-sl-specific-source-continuation-author-root-20261008-v21/candidate-source-mappings/{n}.source-mapping.author-candidate.json'
    m=read(mp)
    for d in m['decisions']:
        missing=[k for k in ['reviewer','reviewedAt','rationale'] if not d.get(k)]
        if missing:sl_missing.append({'mapping':bind(mp),'sourceGoalId':d['sourceGoalId'],'decision':d['decision'],'canonicalGoalIds':d['canonicalGoalIds'],'missingOrdinaryFields':missing,'notFixableByInventedReviewNames':True})
body={'schemaVersion':1,'role':'Focused neutral next-gap inventory, candidate source routes copied from existing packets; no source or placement approval',
      'createdAtUTC':datetime.now(timezone.utc).isoformat(),'exact38WholeGoalGapBinding':bind(OWN/'exact38-missing-whole-goals-and-linked-source-evidence.diagnostic.json'),
      'actualGroups':dict(groups),'wholeGoalRoutes':rows,'linkedActualCandidateSourceEvidence':list(evidence.values()),
      'existingProspectivePacketBindings':[bind(v11),bind(slpath)],
      'SLPendingActualOrdinaryMetadataHolds':sl_missing,'SLFirstActualOrdinaryHold':'sl-chem-seki-sl-ch-seki-8-2024-p013-004-e3b97259',
      'genuinePairedReviewVerifiedAndAvailable':integration['independentEvidence'],
      'pairedReviewActualBoundary':'BW9 source IDs,12 partial bindings,four targets + one prerequisiteOnly; no whole-source closure',
      'otherExistingSourceReviewPackagesNotAuditedForScienceOrIndependenceInThisTechnicalWork':True,
      'newSourceIDsOrScienceApprovalsAdded':0,'strictGain':0,'activeWrites':0,'humanApproval':False,'humanTrial':False}
write('focused38-next-source-placement-review-gaps.neutral.json',body)

material=read(ROOT/integration['whole26Profiles52Cases']['path'])
bindings=[material[k] for k in ['currentWhole504Source','nativeBindings','profilesSource','casesSource']]
for b in bindings:assert bind(ROOT/b['path'])==b
canonical=read(ROOT/integration['whole504Canonical']['path']); canon={g['id']:g for g in canonical['goals']}
for r in material['routineBodies']:
    old=r['wholeGoal']; now=canon[old['id']]
    for k in ['title','titleEn','description','descriptionEn','requires','contains']:assert old.get(k)==now.get(k),(old['id'],k)
assert len(material['routineBodies'])==26
assert sum(len(r['wholeTwoCases'])for r in material['routineBodies'])==52
protected=read(BASE/'chemie-b008-source-view-placements-author-resumed-v1/author.candidate-ready.entry.json')['protectedActiveLandscapes']
for b in protected:assert bind(ROOT/b['path'])==b
capsule=ROOT/'tmp/chemie-b008-bw-paired-source-atlas-continuation-technical-resumed-v1-capsule'
assert not any(p.is_symlink() for p in capsule.rglob('*'))
for relation in ['requires','contains']:
    visiting=set();done=set()
    def visit(gid):
        assert gid not in visiting,(relation,gid)
        if gid in done:return
        visiting.add(gid)
        for c in canon[gid].get(relation,[]):visit(c.removeprefix(canonical['landscapeId']+':'))
        visiting.remove(gid);done.add(gid)
    for gid in canon:visit(gid)
write('checks/focused-material-dag-protected-inputs-and-portable-boundary.actual.json',{
    'role':'Affected exact scientific-material and protected input boundaries, no new scientific verdict',
    'whole26ActualScienceFieldsExactRetained':True,'exact26Profiles52CasesReferencedInputBindings':bindings,
    'protectedActiveLandscapeBindingsVerifiedExact':protected,'containsAndRequiresAcyclic':True,'capsuleHasNoSymlinks':True,
    'BFirstAndFinalPinsStillExact':integration['independentEvidence'],'activeWrites':0,'humanApproval':False})
print(json.dumps({'groups':dict(groups),'candidateSources':len(evidence),'SLActualMissingMetadataRecords':len(sl_missing),'firstSLHold':body['SLFirstActualOrdinaryHold']}))

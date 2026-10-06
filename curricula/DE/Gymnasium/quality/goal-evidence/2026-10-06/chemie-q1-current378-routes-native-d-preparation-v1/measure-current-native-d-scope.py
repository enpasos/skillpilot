from pathlib import Path
import json, hashlib, datetime, sys
ROOT=Path('/home/enpasos/projects/skillpilot')
REL=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1')
OWN=ROOT/REL
ISO=ROOT/'tmp/chemie-q1-current378-routes-native-d-preparation-20261006-v1'
ROUTE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-author-candidate-v1'
OLD=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-quantitative-reviewed-integration-candidate-v1'
stage=sys.argv[1] if len(sys.argv)>1 else 'routes-v2-before-additive-followup'
def stable(obj):return json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def digest(obj):return 'sha256:'+hashlib.sha256(stable(obj).encode()).hexdigest()
def wr(path,obj):
    path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
baseline=json.loads((OWN/'native-models/full-current376.book-model.json').read_text())
candidate=json.loads((ISO/REL/'native-models/full-current378-routes-v2.book-model.json').read_text())
bp={p['goalId']:p for p in baseline['pages']};cp={p['goalId']:p for p in candidate['pages']}
bindings=json.loads((ROUTE/'34-current-strict-d-binding-inputs.author-frozen.json').read_text())
strict=bindings['currentStrictGoalIds']
baseGoals={g['id']:g for g in json.loads((OWN/'actual-current376-inputs/canonical.chemie.json').read_text())['goals']}
candidateGoals={g['id']:g for g in json.loads((ISO/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').read_text())['goals']}
changed=[];unchanged=[]
for id in strict:
    assert baseGoals[id]==candidateGoals[id],f'Own raw scientific goal changed: {id}'
    before,after=bp[id],cp[id]
    fields=sorted(k for k in set(before)|set(after) if before.get(k)!=after.get(k))
    row={'goalId':id,'titleDe':after['title'],'ownWholeCanonicalGoalExact':True,'ownGoalFingerprintExact':before['goalFingerprint']==after['goalFingerprint'],'changedFullNativePageFields':fields,'beforeFullNativePageFingerprint':before['pageFingerprint'],'afterFullNativePageFingerprint':after['pageFingerprint'],'beforeFullNativePage':before,'afterFullNativePage':after,'sourceMetadataChanged':'applicability' in fields,'dependentReferencesChanged':any(k in fields for k in ['reverseRequires','externalReverseRequires']),'prerequisiteReferencesChanged':any(k in fields for k in ['requires','externalPrerequisites']),'pageNumberOrNavigationChanged':any(k in fields for k in ['pageNumber','navigationOrder','treeOrder']),'scienceReviewDecision':None}
    (changed if fields else unchanged).append(row)
actual={r['goalId'] for r in changed}
prior={r['goalId'] for r in bindings['live376ToReviewed378PriorDeltaRows']}
route={r['goalId'] for r in bindings['perGoalLiveReviewedAndRoutePageInputs']}
assert all(bp[r['goalId']]==r['live376Page'] for r in bindings['perGoalLiveReviewedAndRoutePageInputs'])
anchors=json.loads((OLD/'native-finalbook/batch-manifest.json').read_text())['goalIds']
union=actual|set(anchors)
ordered=[p['goalId'] for p in candidate['pages'] if p['goalId'] in union]
assert len(ordered)==len(union)
rows=[]
for id in ordered:
    old=bp.get(id);new=cp[id]
    goalOld=baseGoals.get(id);goalNew=candidateGoals[id]
    rows.append({'goalId':id,'titleDe':new['title'],'category':(['changed-current-strict-page'] if id in actual else [])+(['old-ten-scientific-or-existing-D-anchor'] if id in anchors else []),'current376Present':old is not None,'canonicalFieldDeltaFromLive376':sorted(k for k in set(goalOld or {})|set(goalNew) if (goalOld or {}).get(k)!=goalNew.get(k)),'fullNativePageFieldDeltaFromLive376':sorted(k for k in set(old or {})|set(new) if (old or {}).get(k)!=new.get(k)),'current378FullNativePageFingerprint':new['pageFingerprint'],'current378FullNativeGoalFingerprint':new['goalFingerprint'],'scienceReviewDecision':None})
summary={'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stage':stage,'nativeBaselinePages':len(bp),'nativeCandidatePages':len(cp),'currentStrictGoalsChecked':len(strict),'current104OwnWholeScientificGoalsExact':True,'changedCurrentStrictPages':len(changed),'unchangedCurrentStrictPages':len(unchanged),'authorRouteDeltaPages':len(route),'earlierReviewedDeltaPages':len(prior),'routeAndEarlierOverlap':len(route&prior),'freshActualMatchesAuthorUnion':actual==route|prior,'freshBaselineMatchesAll34AuthorEmbeddedLivePages':True,'oldTenAnchorCount':len(anchors),'oldAnchorOverlapWithChangedStrict':len(set(anchors)&actual),'nativeDUnionCount':len(ordered),'nativeDUnionOrderedGoalIds':ordered,'nativeBatchSizes':[len(ordered[i:i+20]) for i in range(0,len(ordered),20)],'nativeBaselineDigest':baseline['digest'],'nativeCandidateDigest':candidate['digest'],'portableReviewPreparationPendingScopeFollowup':True,'activeWrites':False,'scienceReviewDecisions':[],'humanApproval':False}
wr(OWN/f'{stage}.scope-summary.actual.json',summary)
wr(OWN/f'{stage}.strict104-native-page-deltas.actual.json',{'changed':changed,'unchanged':unchanged})
wr(OWN/f'{stage}.native-d-union.actual.json',{'orderedGoalIds':ordered,'rows':rows})
print(json.dumps({k:summary[k] for k in ['changedCurrentStrictPages','unchangedCurrentStrictPages','routeAndEarlierOverlap','nativeDUnionCount','nativeBatchSizes','freshActualMatchesAuthorUnion']}))

import copy, hashlib, json, pathlib, shutil

ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
A=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current678-international-operations-policy33-current645-fieldwise-status-nav-scope-author-a-v1'
O=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current678-five-nav-status-practice-purpose-independent-merge-audit-v1'
V2=A/'twentyone-past-author-candidate-review-notes-only-successor-v2'

def read(p):return json.loads(pathlib.Path(p).read_text())
def relative(p):
    p=pathlib.Path(p)
    return str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else str(p)
def digest(p):
    p=pathlib.Path(p)
    return dict(path=relative(p),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size)
def bound(d):
    p=ROOT/d['path'];assert digest(p)['sha256']==d['sha256'];return p
def write(n,x):
    p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return digest(p)
def delta(a,b,p=''):
    if a==b:return []
    if isinstance(a,dict) and isinstance(b,dict):return sum((delta(a.get(k),b.get(k),p+'/'+k) for k in sorted(set(a)|set(b))),[])
    return [dict(field=p,before=a,after=b)]

oldindex=read(A/'actual-fieldwise678-foreign33-fiveNav359-references-author-index.json')
index_path=V2/'actual-final-fieldwise678-V2-21note-only-full-before-after-binding-index.AUTHOR.json'
I=read(index_path)
before=read(bound(oldindex['wholeAfterCAN']))
after=read(bound(I['wholeAfterCAN']))
bm,am=({g['id']:g for g in x['goals']} for x in (before,after))
ds=delta(before,after)
# The whole goals array is unpacked for exact individual comparisons, never treated as a hash-only science claim.
whole_rows=[]
changed=[]
for g in bm:
    d=delta(bm[g],am[g])
    if d:
        assert len(d)==1 and d[0]['field']=='/examData/reviewNote'
        changed.append(g)
        assert 'ist ein inaktiver Autorenkandidat' in d[0]['before']
        assert 'wurde als inaktiver Autorenkandidat erstellt' in d[0]['after']
        assert 'gesonderten unabhängigen Scope-Nachweis' in d[0]['after']
        assert 'Menschliche Prüfung, Freigabe und Erprobung bleiben getrennt.' in d[0]['after']
        assert d[0]['after'].split('Die Länder-/Kursbindung')[0]==d[0]['before'].split('Die Länder-/Kursbindung')[0]
        whole_rows.append(dict(materialId=g,wholeBeforeNote=d[0]['before'],wholeAfterNote=d[0]['after'],actualDelta=d,decision='KEEP: temporal provenance and distinct authority lanes',reason='The past creation status is true both before and after qualified integration. The separate independent scope evidence is an integration condition, not falsely implied by material science. Human review/testing remains explicitly separate. No current pending or completed learner/human claim is introduced.'))
assert len(changed)==21
assert set(changed)=={r['goalId'] for r in I['actual21ReviewNotePastTemporalOnlyDeltas']}
for row in I['actual21ReviewNotePastTemporalOnlyDeltas']:
    assert bm[row['goalId']]['examData']['reviewNote']==row['wholeBefore']
    assert am[row['goalId']]['examData']['reviewNote']==row['wholeAfter']
assert {k:v for k,v in before.items() if k!='goals'}=={k:v for k,v in after.items() if k!='goals'}
assert {k:v for k,v in oldindex.items() if k not in ('wholeAfterCAN','wholeForeign33StatusOnlyBodies')}=={k:v for k,v in I.items() if k not in ('wholeAfterCAN','wholeForeign33StatusOnlyBodies','wholePreviousV1Index','actual21ReviewNotePastTemporalOnlyDeltas','actualScopeNativeV1ReuseReason')}
final33=read(bound(I['wholeForeign33StatusOnlyBodies']))
assert all(am[g['id']]==g for g in final33) and len(final33)==33
unchanged12=[g for g in final33 if g['id'] not in changed]
assert len(unchanged12)==12
assert all(g['examData']['reviewNote']==bm[g['id']]['examData']['reviewNote'] for g in unchanged12)
assert all('Keine menschliche Freigabe oder Erprobung' in g['examData']['reviewNote'] and 'Länder-/Kurszugänge werden getrennt geprüft' in g['examData']['reviewNote'] for g in unchanged12)
note_followup=write('actual21-past-candidate-notes-targeted-followup-and-all33-final-human-scope-lanes.KEEP.independent.json',dict(
    finalAuthorIndex=digest(index_path),finalCAN=I['wholeAfterCAN'],originalWhole678=oldindex['wholeAfterCAN'],
    actualTwentyoneLiteralNoteDecisions=whole_rows,actualTwelveUnchangedInternationalNotes=[dict(materialId=g['id'],wholeNote=g['examData']['reviewNote'],decision='KEEP: actual distinct review lane',reason='The statement says country/course access has a separate review lane; it makes no assertion that the lane is presently pending or completed and no human-approval assertion. It remains true after qualified integration.') for g in unchanged12],
    changedTaskSolutionRubricRequiresTagsStatusCoverageNavViews=0,newScientificWholeBodyReviews=0,activeWrites=0))

active=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
old645=read(bound(I['wholeBeforeCAN']))
assert active.read_bytes()==bound(I['wholeBeforeCAN']).read_bytes()
oldmap={g['id']:g for g in old645['goals']}
sem_path=ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current645-company-finance-consumer-labour48-20261010-v16/wirtschaftswissenschaften.semantic-kinds.json'
sem=read(sem_path)
ordinary=[d['goalId'] for d in sem['decisions'] if d['semanticKind']=='curricularAtomic']
mem=[d['goalId'] for d in sem['decisions'] if d['semanticKind']=='memory']
orientation=[d['goalId'] for d in sem['decisions'] if d['semanticKind']=='orientation']
assert len(ordinary)==336 and len(mem)==10 and len(orientation)==1
assert all(oldmap[g]==am[g] for g in ordinary+mem+orientation)
memoryconfig=ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current494-qualified-M3-media-20261009-v4/wirtschaftswissenschaften.memory336-reviewed34.config.json'
mc=read(memoryconfig)
review_guards=[digest(memoryconfig),digest(ROOT/mc['reviewPath']),digest(ROOT/mc['cardReviewPath'])]
source_guards=[digest(ROOT/('curricula/DE/Gymnasium/provenance/'+n)) for n in ['source-landscape-registry.json','canonical-goal-applicability-override-registry.json','source-goal-membership-registry.json','canonical-goal-provenance-registry.json','source-goal-closure-registry.json']]
semantic_guard=write('actual-current645-semantic-ten-whole-memory-orientation-and-source-registry-lane-endguard.independent.json',dict(
    activeCAN=digest(active),activeSEM=digest(sem_path),wholeTenMemoryNodes=[oldmap[g] for g in mem],wholeOrientationNode=oldmap[orientation[0]],
    wholeMemoryAndCardReviewGuards=review_guards,sourceRegistryPhysicalReadGuards=source_guards,
    ordinary336WholeContractsUnchanged=True,all32SubjectCountryRoleChanges=0,
    sourcecoverageTotalsNotRecomputedByThisSemanticReviewer=True,RootFreshNativeSourceAuthoritySeparate=True,
    noNewMemorisationCardsOrOriginRequirements=True,activeWrites=0))

# Bounded contract guards, not substituted for Root's genuine native scope negatives.
neg=[]
def no_universal_nav_gate(nav):return nav['requires']==[]
q4=am['5113c64b-405d-5f4b-bae9-70fe530b5e69']
false_gate=copy.deepcopy(q4);false_gate['requires']=['14c05eec-87af-5fd6-832a-4f5d9d280e66']
assert not no_universal_nav_gate(false_gate)
neg.append(dict(kind='independent bounded semantic guard',wholeCounterexample=false_gate,detected=True,reason='A phase-wide content prerequisite would add a new universal mastery gate unsupported by these independent materials. It is rejected rather than inferred from the phase label.'))
false_country=copy.deepcopy(q4);false_country['applicability']['jurisdiction'].append('DE-BY')
assert set(false_country['applicability']['jurisdiction'])-set(oldmap[q4['id']]['applicability']['jurisdiction']) != {'DE-HB'}
neg.append(dict(kind='independent bounded exact-jurisdiction guard',wholeCounterexample=false_country,detected=True,reason='The actual reviewed child-union follower authorizes only Bremen. An additional Bavaria jurisdiction has no bound candidate provenance and is rejected; no country source obligation is manufactured.'))
negative=write('actual-two-bounded-nav-universal-gate-and-unproved-country-claim-negative-guards.independent.json',neg)

history=write('actual-own-targeted-review-execution-and-technical-read-shape-history.json',dict(
    runs=[dict(command='python3 /tmp/economics678-independent-nav-status-semantics.py',exitCode=1,reason='The first narrow guard incorrectly counted direct root children rather than actual goalEntry references inside the new inert structure. Failed before evidence artifacts; no semantic finding against the author.'),dict(command='python3 /tmp/economics678-independent-nav-status-semantics.py',exitCode=1,reason='The second guard used cases rather than actual native profile.applicationCaseBriefs. Existing written literal decision artifacts were retained exact; the failed profile guard was not counted PASS.'),dict(command='python3 /tmp/economics678-independent-nav-status-semantics.py',exitCode=0,reason='Correct actual reference shape and native profile field. Original literal artifacts byteexact reused; actual current645 P336685/43-config/35-view endguard passed.')],
    authorScienceAndAuthorNativeWorksNotCountedAsOwn=True,RootFreshWholeNativeFramesNotClaimedAsOwn=True,activeWrites=0))

helpers=O/'own-executed-semantic-review-helpers';helpers.mkdir(exist_ok=True)
for helper in [pathlib.Path('/tmp/economics678-independent-nav-status-semantics.py'),pathlib.Path(__file__)]:
    target=helpers/helper.name
    assert not target.exists();target.write_bytes(helper.read_bytes())

prior=read(O/'actual-current678-nav-status-purpose-independent-portable-input-manifest.json')
for row in prior['immutableInputs']+prior['artifacts']:
    bound(row)
for row in review_guards+source_guards:bound(row)
final_manifest=write('actual-final678-whole-nav-status-semantic-purpose-portable-manifest.json',dict(
    originalWhole645678AndViewsInputs=prior['immutableInputs'],finalAuthorNoteOnlyIndex=digest(index_path),finalCAN=I['wholeAfterCAN'],final33StatusNotes=I['wholeForeign33StatusOnlyBodies'],
    reusedOriginalSemanticDecisions=prior['artifacts'],newTargetedArtifacts=[note_followup,semantic_guard,negative,history],
    helpers=[digest(p) for p in helpers.iterdir()],activeWrites=0))
seal=write('actual-final-current678-five-whole-nav33-status16-existing-support-purpose-independent-KEEP.handoff.receipt.json',dict(
    role='FINAL_INDEPENDENT_WHOLE_NAVIGATION_STATUS_AND_PRACTICE_ROLE_SEMANTICS_KEEP_ONLY',reviewer='/root/economics_merge_audit',author='/root/economics_m2_source_independent_a',
    finalFrozenAuthorIndex=digest(index_path),actualReviewedWholeCurrent678=I['wholeAfterCAN'],qualifiedThreeWholeScienceSeals={k:I[k] for k in ['internationalScienceReceipt','operationsScienceReceipt','policyScienceReceipt']},
    fiveWholeIndividualNavDecisions=digest(O/'actual-five-whole-nav-individual-purpose-decisions-and-exact-field-deltas.independent.json'),
    original33LiteralStatusOnlyBindings=digest(O/'actual-thirtythree-whole-qualified-body-status-only-literal-bindings.independent.json'),final21TemporalNoteFollowup=note_followup,
    all16ExistingSupportSemanticDecisions=digest(O/'actual16-existing-support-contexts-eight-country-eight-national-semantic-decisions.independent.json'),
    whole35ViewPracticeOnlyAppendBoundaries=digest(O/'actual35-authored-view-purpose-and359-practice-only-append-boundaries.independent.json'),
    current645P33668543GroupsEndguard=digest(O/'actual-current645-v16-336-whole-goals-P68543configs-and35-activeviews-exact-endguard.independent.json'),
    actualTenWholeMemoryOneOrientationAndSourceLaneEndguard=semantic_guard,
    ownBoundedSemanticNegatives=negative,executionHistory=history,portableManifest=final_manifest,
    counts=dict(wholeNavKEEP=5,statusOnlyWholeMaterials=33,temporalNotesOnly=21,unchangedInternationalLaneNotes=12,newCountryPracticeRefs=359,newNationalExplicitRefs=0,wholeViewsRead=35,existingSupportContexts=16,actualCountryDirectExistingPOnlyContexts=8,nationalJurisdictionSupportContexts=8,newOrdinarySupportMemoryRefs=0,oldNonNavWholeGoalsExact=640,ordinary336WholeContractsExact=336,POriginalCases685=685,current43ConfigGroups=43,wholeMemoryNodesExact=10,orientationWholeExact=1,Q4PreviousJurisdictions=13,Q4CurrentJurisdictions=14,actualNewQ4Jurisdiction=['DE-HB'],newWholeBodyScienceReviews=0),
    Q1EnglishPurposeBoundedReason='The actual complete 6694 DE/EN case separates institutional R, temporary demand S, year1 construction demand and year3 access/productivity. The short navigation phrase names real channels without defining all process policy as demand or replacing the full curriculum contract.',
    SourceCoverageAndCurrent64ScopeNumericalQualificationOwnedByRoot=True,
    noOwnNative2112ReplayClaim=True,noNewSourceOrCountryCompulsoryGoalClaims=True,
    noHumanDImageOrStrictClosure=True,activeWrites=0,images=0,strictNet=0))
print(json.dumps(seal))

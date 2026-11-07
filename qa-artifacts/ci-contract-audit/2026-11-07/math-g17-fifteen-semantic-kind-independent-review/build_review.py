"""Extract read-only evidence for fifteen manually reasoned kind decisions.

All output stays beside this file. This is not a curriculum/QA producer.
"""
from pathlib import Path
from datetime import datetime, timezone
import gzip
import hashlib
import json

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[3]
BASE = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-07'
SOURCE_PACKAGE = BASE / 'math-g17-fifteen-source-revision-candidate'
COMBINED_PACKAGE = BASE / 'math-g17-fifteen-p-route-cold132-successor-candidate'
SOURCE_PATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
LEDGER_PATH = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
INTRO = '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'

def sha(b):
    return hashlib.sha256(b).hexdigest()

def load(path):
    return json.loads(path.read_bytes())

def pin(path):
    path = path.resolve()
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha(data), 'bytes': len(data)}

def save(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

before_bytes = gzip.decompress((SOURCE_PACKAGE / 'before-source.json.gz').read_bytes())
after_bytes = gzip.decompress((SOURCE_PACKAGE / 'after-source.json.gz').read_bytes())
assert sha(before_bytes) == 'e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06'
assert sha(after_bytes) == '9f3945e209e0cef503428e0a20c3c2302261346e35f533bf1264e525f16cdf96'
assert (ROOT / SOURCE_PATH).read_bytes() == before_bytes
assert sha((ROOT / LEDGER_PATH).read_bytes()) == '188ff969598df64e6f455c761f30f65240cba6ad6304558baaefd15b8d82baea'
assert sha((COMBINED_PACKAGE / 'receipt.json').read_bytes()) == '1686711c3df95a7a7a376809ba88075b5dfa4388f977b94db93063c6c0c56ef0'
assert sha((COMBINED_PACKAGE / 'inventory.json').read_bytes()) == 'a0ff2d286f89f9c2261906bf02042329e03e4730bf74684cb52cd3a87c701e0b'
before, after = json.loads(before_bytes), json.loads(after_bytes)
old_by = {g['id']: g for g in before['goals']}
new_by = {g['id']: g for g in after['goals']}
ledger = load(ROOT / LEDGER_PATH)
hold = load(COMBINED_PACKAGE / 'additional-semantic-kind-hold.json')
manual = load(OUT / 'manual-decisions.json')
selected = {r['goalId'] for r in hold['rows']}
assert len(manual) == len(selected) == 15
assert {r['goalId'] for r in manual} == selected
assert [g['id'] for g in before['goals']] == [g['id'] for g in after['goals']]
assert {k:v for k,v in before.items() if k != 'goals'} == {k:v for k,v in after.items() if k != 'goals'}
assert {i for i in old_by if old_by[i] != new_by[i]} == selected
parents = {i: [] for i in new_by}
for g in after['goals']:
    for c in g.get('contains', []):
        parents.setdefault(c, []).append(g['id'])
units = {u['id']: u for u in after['programUnits']}

def ancestor_ids(i):
    found, pending = set(), list(parents[i])
    while pending:
        a = pending.pop()
        if a in found:
            continue
        found.add(a)
        pending.extend(parents[a])
    return sorted(found)

def full_unit_chain(unit_id):
    chain = []
    while unit_id:
        unit = units[unit_id]
        chain.append(unit)
        unit_id = unit.get('parentUnitId')
    return chain

rows = []
for decision in manual:
    i = decision['goalId']
    old, new = old_by[i], new_by[i]
    assert {k:v for k,v in old.items() if k != 'requires'} == {k:v for k,v in new.items() if k != 'requires'}
    assert old['requires'].count(INTRO) == 1
    assert new['requires'] == [x for x in old['requires'] if x != INTRO]
    assert new['type'] == 'atomic' and new['contains'] == []
    assert not set(new).intersection({'goalType', 'nodeKind', 'examData', 'memoryData', 'cards', 'flashcards', 'extendedData'})
    assert not any(t in {'Practice','Assessment','Motivation','Orientation','memorization'} or t.startswith('srs-deck:') for t in new['tags'])
    old_decision = next(d for d in ledger['decisions'] if d['goalId'] == i)
    h = next(x for x in hold['rows'] if x['goalId'] == i)
    assert old_decision == h['ledgerDecision']
    ancestors = ancestor_ids(i)
    placement_rows = [p for p in after['goalPlacements'] if p['goalId'] in {i, *ancestors}]
    assert all(old_by[a] == new_by[a] for a in ancestors)
    rows.append({
        **decision,
        'sourceGoalPointer': f"/goals/{next(n for n,g in enumerate(after['goals']) if g['id']==i)}",
        'oldGoalComplete': old, 'currentGoalComplete': new,
        'fieldChange': {'onlyChangedField': 'requires', 'before': old['requires'], 'after': new['requires'], 'removed': INTRO},
        'oldLedgerDecision': old_decision,
        'oldLedgerPointer': f"/decisions/{next(n for n,d in enumerate(ledger['decisions']) if d['goalId']==i)}",
        'expectedSource15FingerprintFromHold': h['expectedSource15Fingerprint'],
        'structuralKindEvidence': {'type': new['type'], 'goalType': {'state':'missing'}, 'nodeKind': {'state':'missing'}, 'contains': [], 'semanticAtomic': {'state':'value','value':new['semanticAtomic']} if 'semanticAtomic' in new else {'state':'missing'}},
        'specialWorkflowEvidence': {'examData': {'state':'missing'}, 'cardAndDeckFields': {'state':'missing'}, 'specialWorkflowTags': [], 'extendedData': {'state':'missing'}, 'resourceLinks': new.get('resourceLinks',[]), 'interpretation': 'Visualisierungslinks sind Lehrmaterial; keine Assessment- oder Deckbindung im vollständigen Sourcegoal.'},
        'placementEvidence': {'directParentsComplete': [new_by[a] for a in parents[i]], 'allAncestorsComplete': [new_by[a] for a in ancestors], 'directPlacements': [p for p in placement_rows if p['goalId']==i], 'ancestorPlacements': [{'placement':p,'unitChain':full_unit_chain(p['unitId'])} for p in placement_rows if p['goalId']!=i], 'placementAndAncestorBytesSemanticallyUnchanged': True},
        'retainedPrerequisitesComplete': [new_by[x] for x in new['requires']],
    })

norm_paths = [
    'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-v1.profile.json',
    'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json',
    'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json',
    'app/scripts/goalBookModel.ts',
    'docs/concept/skill-graph/node-types.md',
    'docs/concept/skill-graph/graph-definition.md',
    'curricula/DE/Gymnasium/quality/release-model/README.md',
    'app/scripts/reportDeepUnderstandingRollout.ts',
    'app/scripts/validateGoalDescriptionDualRoundResolution.ts',
    'app/scripts/validateGoalDescriptionReviewCampaign.ts',
    'app/scripts/semanticAtomicityReview.ts',
    'app/scripts/memoryCardReview.ts',
    'app/scripts/goalEvidenceProfileModel.ts',
]
review = {
    'schemaVersion': 1,
    'status': 'FIFTEEN_INDIVIDUALLY_RECONSIDERED_CURRICULAR_ATOMIC_PRIVATE_ONLY',
    'reviewActor': {'identity':'Codex /root/math15_semantic_kind_review', 'role':'independent AI semantic-kind reviewer', 'humanReviewer': False, 'authoredSource15OrPriorP15OrTransport':False},
    'attestedAtActualUTC': datetime.now(timezone.utc).isoformat(),
    'reviewMethodDescription': 'Full current DE/EN goals, complete old comparison, structural and special workflow markers, direct parents, all canonical ancestor placements and retained prerequisites read; fifteen concrete judgments written before native ledger construction. Existing decisions were comparison evidence, not the decision rule.',
    'sourcePins': {'before': {'canonicalPath':SOURCE_PATH,'sha256':sha(before_bytes),'bytes':len(before_bytes),'archive':pin(SOURCE_PACKAGE/'before-source.json.gz')},'after': {'canonicalPath':SOURCE_PATH,'sha256':sha(after_bytes),'bytes':len(after_bytes),'archive':pin(SOURCE_PACKAGE/'after-source.json.gz')}},
    'oldLedger':pin(ROOT/LEDGER_PATH),
    'exactCombinedPredecessor':{'receipt':pin(COMBINED_PACKAGE/'receipt.json'),'inventory':pin(COMBINED_PACKAGE/'inventory.json'),'additionalHold':pin(COMBINED_PACKAGE/'additional-semantic-kind-hold.json')},
    'normAndValidatorBindings':[pin(ROOT/p) for p in norm_paths],
    'normReading': [
        {'path':norm_paths[0],'anchor':'/semanticKinds and /semanticKindDecisions','finding':'Assessable subject competence is curricularAtomic; title/ID inference forbidden; unknown or stale decisions rejected.'},
        {'path':norm_paths[2],'anchor':'/$defs/semanticKindDecision and /$defs/semanticKindLedger','finding':'Closed schemas. Existing recheck-curricular-atomic basis is allowed. reviewMethod is fixed. Actor/time/rationale belong in external review evidence, not added ledger fields.'},
        {'path':norm_paths[3],'anchor':'fingerprintSemanticKindSourceGoal; parseSemanticKindLedger','finding':'Native fingerprint includes ordered requires; parser checks source binding, exact one-decision coverage, freshness and counts. Parser success does not perform the fachliche kind review.'},
        {'path':norm_paths[4],'anchor':'Orientation, Understanding, Memorize, Exam','finding':'Orientation has no correctness test; understanding is assessable knowledge/action; memory owns card workflow; exam carries task/scoring workflow.'},
    ],
    'sourceComparison':{'changedGoals':15,'otherGoalsUnchanged':1237,'allTopLevelMetadataUnchanged':True,'onlyChangedGoalField':'requires','removedId':INTRO},
    'decisions': rows,
    'scopeLimits': {'newAtomicityApproval':False,'newPositiveEvidenceApproval':False,'newDescriptionReview':False,'imageApproval':False,'M7Claim':False,'humanApproval':False,'activeWrites':False,'producerRuns':0,'sourceAProbes':0,'databaseOrDeploymentActions':0,'gitActions':0},
}
save('independent-review.json',review)

# Read exact registered D inputs only. No D review, rebind or producer execution.
config_path = COMBINED_PACKAGE/'native-combined.config.json'
config = load(config_path)['subjects'][0]
d_rows=[]
d_pins={}
for index_path in config['resolutionIndexPaths']:
    ip=ROOT/index_path
    index=load(ip)
    for entry in index['resolutions']:
        i=entry['goalId']
        if i not in selected:
            continue
        group=next(g for g in index['groups'] if g['groupId']==entry['groupId'])
        gd=(ip.parent/group.get('artifactDirectory',group['groupId'])).resolve()
        rp=(ip.parent/entry['resolutionPath']).resolve()
        assert 'sha256:'+sha(rp.read_bytes()) == entry['resolutionDigest']
        round_rows=[]
        for rn in ['round-a','round-b']:
            inp=gd/rn/'description-review-input.json'
            data=load(inp)
            matches=[(j,g) for j,g in enumerate(data['goals']) if g['goalId']==i]
            assert len(matches)==1
            j,goal=matches[0]
            old_requires=goal['canonicalContext']['requires']
            assert old_requires==old_by[i]['requires']
            assert INTRO in old_requires and INTRO not in new_by[i]['requires']
            round_rows.append({'round':rn,'input':pin(inp),'goalPointer':f'/goals/{j}','inputReviewFingerprint':data['reviewInputFingerprint'],'canonicalContextComplete':goal['canonicalContext'],'retainedRequires':old_requires,'source15Requires':new_by[i]['requires'],'requiresEqualToBeforeSource':True,'requiresEqualToSource15':False})
            d_pins[str(inp)]=pin(inp)
        d_pins[str(ip)]=pin(ip)
        d_pins[str(rp)]=pin(rp)
        d_rows.append({'goalId':i,'registeredIndex':pin(ip),'resolution':pin(rp),'indexEntry':entry,'group':group,'rounds':round_rows,'freshnessFinding':'Both registered D input contexts retain the removed Intro requires. The existing current-context equality check must reject Source15 once current curricularAtomic scope is restored.'})
assert len(d_rows)==15 and {x['goalId'] for x in d_rows}==selected
d_report={
    'status':'ADDITIONAL_D_CONTEXT_FRESHNESS_HOLD_READ_ONLY_STATIC_EVIDENCE',
    'inspectedAtActualUTC':datetime.now(timezone.utc).isoformat(),
    'actor':'Codex /root/math15_semantic_kind_review',
    'combinedConfig':pin(config_path),
    'affectedGoals':15,'registeredIndices':len({x['registeredIndex']['path'] for x in d_rows}),
    'bothRoundsInspected':True,'roundGoalContexts':sum(len(x['rounds']) for x in d_rows),
    'nativeContractEvidence':{'contextBuilder':{'path':'app/scripts/validateGoalDescriptionReviewCampaign.ts','anchor':'buildGoalDescriptionCanonicalContext, requires at line 264'},'contextComparison':{'path':'app/scripts/validateGoalDescriptionDualRoundResolution.ts','anchor':'validateCurrentGoalBindings, lines 710-712'},'earlyScopeReturn':{'path':'app/scripts/reportDeepUnderstandingRollout.ts','anchor':'validateResolutionIndex, not current curricularAtomic then early return before loadRound'}},
    'rows':d_rows,
    'requiredFollowup':'Current D evidence for these fifteen goals needs a legitimate successor process under the existing D contract. Do not overwrite historical round inputs, reviewer identities/times or resolution hashes. This kind review is not either blind D round.',
    'A_M':'Existing A/M fingerprint payloads do not include requires or ledger bytes; the source comparison changes none of their payload fields. No A/M rebind is implied by this kind-only delta; no A/M producer run is claimed.',
    'P_V':'The separately sealed P15/transport predecessor is not re-reviewed here. Kind delta changes no Source15 or P/V content. Whole-file ledger pin changes, if any prospective transport tracks it, are an application/closure binding obligation rather than permission to alter old receipts.',
    'producerRuns':0,'modifiedFreshnessInputs':[],
}
save('additional-D-freshness-hold.json',d_report)

# Pre/post preservation guards: all existing predecessor artifacts plus every read active input.
protected={}
for directory in [SOURCE_PACKAGE,COMBINED_PACKAGE]:
    for path in sorted(directory.rglob('*')):
        if path.is_file():
            protected[str(path)]=pin(path)
for p in [SOURCE_PATH,LEDGER_PATH,*norm_paths]:
    path=ROOT/p
    protected[str(path)]=pin(path)
protected.update(d_pins)
save('protected-inputs.before.json',list(protected.values()))
print(json.dumps({'reviewed':len(rows),'DContextsWithRetainedIntro':30,'DIndices':d_report['registeredIndices'],'guardedFiles':len(protected),'activeWrites':False,'producerRuns':0}))

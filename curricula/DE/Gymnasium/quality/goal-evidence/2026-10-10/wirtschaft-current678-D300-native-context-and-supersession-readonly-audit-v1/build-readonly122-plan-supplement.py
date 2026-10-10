import hashlib
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
SUPPLEMENT = OUT / 'twelve-targeted122-ID-plan-and27-cascade-exclusion-readonly-successor-v2'
SUPPLEMENT.mkdir(exist_ok=True)

def bind(p):
    p = Path(p).resolve()
    b = p.read_bytes()
    try:
        name = str(p.relative_to(ROOT))
    except ValueError:
        name = str(p)
    return {'path': name, 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def load(p):
    return json.loads(Path(p).read_text())

def write(name, obj):
    p = SUPPLEMENT / name
    with p.open('x') as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write('\n')
    return bind(p)

inputs = [
    OUT / 'actual-final-D300-native86-context31-chain27-cascade-readonly.handoff.json',
    OUT / 'actual-300-terminal-owners-whole-native-contexts86-deltas-and335-historical-claims.READONLY.json',
    Path('/tmp/economics-current678-D149-readonly-final-handoff-a.json'),
    Path('/tmp/economics-current678-D-readonly-inventory-a.actual.json'),
]
guards = [bind(p) for p in inputs]
matrix = load(inputs[1])
a_handoff = load(inputs[2])
a = load(inputs[3])
cascade = {
    r['goalId'] for r in matrix['whole31NativeLinearChainsAndIndividualFailureCauses']
    if r['ownTerminalContextExact']
}
direct_changed = set(matrix['actualContextDifferentGoalIds86'])
no_owner = set(matrix['noRegisteredHistoricalTerminalOwnerGoalIds36'])
direct = direct_changed | no_owner
assert len(cascade) == 27 and len(direct) == 122 and not (cascade & direct)
assert direct | cascade == set(matrix['current149OpenGoalIds'])
assert not (direct & set(matrix['exactCurrent187StrictGoalIdsRetained']))
inventory = {x['goalId']: x for x in a['currentIdInventory']}
owner_rows = {x['goalId']: x for x in matrix['whole300TerminalOwners']}
packages = []
for old_package in a_handoff['twelveDisjoint149Packages']:
    ids = [x for x in old_package['goalIds'] if x in direct]
    packages.append({
        'packageId': old_package['packageId'].replace('open', 'direct122'),
        'label': old_package['label'],
        'goalIds': ids,
        'count': len(ids),
        'actualChangedContextGoalIds': [x for x in ids if x in direct_changed],
        'noHistoricalTerminalOwnerGoalIds': [x for x in ids if x in no_owner],
        'excludedExactTerminalCascadeGoalIds': [x for x in old_package['goalIds'] if x in cascade],
        'wholeOriginal149Package': old_package,
        'individualRows': [{
            'goalId': x,
            'lane': 'Actually changed historical current context; genuine current binding/science comparison required'
                if x in direct_changed else 'No historical terminal owner; valid historical prepared evidence must be compared before targeted current review',
            'actualContextDeltas': owner_rows[x]['actualContextDeltas'] if x in owner_rows else [],
            'terminalOwnerIndexPath': owner_rows[x]['terminalOwnerIndexPath'] if x in owner_rows else None,
            'wholeAgentAReadonlyInventoryRow': inventory[x],
            'wholeLaterUnresolvedNonKeepFindings': [r for r in a['unresolvedHistoricalNonKeepFindings'] if r['goalId'] == x],
            'scienceApprovalClaimed': False,
            'freshStableBookPageComparisonRequired': True,
        } for x in ids],
    })
flattened = [x for p in packages for x in p['goalIds']]
assert len(packages) == 12 and len(flattened) == 122 and len(set(flattened)) == 122
assert set(flattened) == direct and max(p['count'] for p in packages) <= 20

portable = []
for i, name in [(2, 'whole-original-AgentA-D149-readonly-final-handoff.BYTE-EXACT.json'),
                (3, 'whole-original-AgentA-D336-readonly-inventory.BYTE-EXACT.json')]:
    p = SUPPLEMENT / name
    with p.open('xb') as f:
        f.write(inputs[i].read_bytes())
    b = bind(p)
    assert b['sha256'] == guards[i]['sha256']
    portable.append(b)

plan = write('actual-twelve-disjoint122-direct-current-review-ID-packages-minus27-index-cascade.READONLY.json', {
    'authority': 'Readonly operational ID plan; no new review decisions or blanket new-science requirement',
    'original237cNativeMatrix': guards[1],
    'counts': {'actualChangedContextOwners': 86, 'noHistoricalTerminalOwner': 36,
               'directReviewIDs': 122, 'excludedOwnExactIndexCascadeOwners': 27,
               'packages': 12, 'futureSeparate048GoalClarification': 1},
    'whole122GoalIDs': flattened,
    'wholeTwelvePackages': packages,
    'whole27OwnExactIndexCascadeIDs': sorted(cascade),
    'whole31ChainsRetained': matrix['whole31NativeLinearChainsAndIndividualFailureCauses'],
    'constraint': 'Do not prepare inputs until the actual stable post15/048 production Book exists. Reuse only actually unchanged qualified whole evidence. Own-context equality is not blanket acceptance of a later unresolved finding.',
    'current187NativeIDsProtected': matrix['exactCurrent187StrictGoalIdsRetained'],
})
conflicts = write('actual-later048-and5b5ed-candidate-findings-preserved-outside-index-cascade-acceptance.READONLY.json', {
    'authority': 'Existing unresolved candidate findings copied as evidence; no new scientific verdict',
    'later048NativeValidOwnerFinding': a['laterFindingAgainstCurrentlyNativeValidOwner'],
    'laterOwnExactCascadeFinding': [r for r in a['unresolvedHistoricalNonKeepFindings'] if r['goalId'] in cascade],
    'disposition': '048 is separately authorized for a minimal future clarification and two independent current rounds. The existing5b5ed A01 REVISE must be reconciled explicitly; it is excluded from the122 only because the registered own terminal context is exact. Native owner restoration does not dispose of that later candidate finding.',
    'automaticCurrentResolutionClaimed': False,
    'twoIndependentRoundsClaimed': False,
})
assert [bind(p) for p in inputs] == guards
handoff = write('actual-final-D300-audit-and122-twelve-package27-cascade-exclusion.READONLY-handoff-v2.json', {
    'parentWholeNativeD300Audit': guards[0],
    'wholeOriginalAgentAInputs': portable,
    'targeted122Plan': plan,
    'laterFindingsPreserved': conflicts,
    'wholeInputEndguards': guards,
    'oldScope': '237c/febb, not yet the independently qualified15-field6bfa integration or a fresh production Book',
    'nativeReadOnlyParentExecution': 'Pure native canonical-context and chain predicates actually executed, exit0; no future resolution validation claimed',
    'packageCounts': [p['count'] for p in packages],
    'activeWrites': 0, 'reviewRecords': 0, 'newScienceApprovals': 0,
    'futureReadyStateClaimed': False,
})
print(json.dumps({'handoff': handoff, 'plan': plan, 'conflicts': conflicts,
                  'packageCounts': [p['count'] for p in packages], 'activeWrites': 0,
                  'reviewRecords': 0}, ensure_ascii=False))

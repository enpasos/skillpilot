# SPDX-License-Identifier: Apache-2.0
"""Adopt genuine paired source verdicts as bounded evidence, never invent reviews."""
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess
import time

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
SL21 = BASE / 'chemie-b008-sl-specific-source-continuation-author-root-20261008-v21'
BY22 = BASE / 'chemie-b008-by-sixteen-source-facet-author-root-20261008-v22'
BYA = BASE / 'chemie-b008-by-sixteen-source-placement-independent-a-20261008-v22'
BYB = BASE / 'chemie-b008-by-sixteen-source-facet-independent-b-20261008-v22'
SLA = BASE / 'chemie-b008-sl-three-framework-bridge-independent-a-addendum-20261008-v23'
SLB = BASE / 'chemie-b008-sl-three-framework-bridge-independent-b-20261008-v23'
assert not (OWN / 'paired-source-refinement.first.freeze.json').exists()

def load(p):
    return json.loads(p.read_text())

def bind(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def put(p, d):
    assert p.is_relative_to(OWN)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

def exact(binding):
    p = ROOT / binding['path']
    b = p.read_bytes()
    assert hashlib.sha256(b).hexdigest() == binding['sha256'].removeprefix('sha256:'), p
    assert len(b) == binding.get('bytes', len(b)), p

seals = [
    (BYA / 'BY16-source-placement.independent-a.first-verdict.freeze.json', ['inputs', 'ownedArtifacts']),
    (BYB / 'by16-b.first-verdict.seal.json', ['inputs', 'outputs']),
    (SLA / 'three-framework-bridge.independent-a.first-addendum.freeze.json', ['inputs', 'ownedArtifacts']),
    (SLB / 'sl-framework-b.first-verdict.seal.json', ['inputs', 'outputs']),
]
verified = []
for path, keys in seals:
    seal = load(path)
    bindings = [row for key in keys for row in seal.get(key, [])]
    for row in bindings:
        exact(row)
    verified.append({'firstSeal': bind(path), 'actualExactInputAndOutputBindings': len(bindings), 'hashMismatches': []})

canonical_path = SL21 / 'candidate/canonical.current504-sl-source-metadata.author-candidate.json'
canonical = load(canonical_path)
goals = {g['id']: g for g in canonical['goals']}
assert len(goals) == 504
by_author = load(BY22 / 'sixteen-original-BY-routes-and-bounded-current-components.author.json')
by_a_path = BYA / 'BY20-components16-placement12-partners.independent-a.first.verdicts.json'
by_a = load(by_a_path)
by_b_path = BYB / '20-bounded-source-components.actual-independent-b.records.jsonl'
by_b = [json.loads(line) for line in by_b_path.read_text().splitlines() if line.strip()]
a_rows = by_a['componentVerdicts20']
assert len(a_rows) == len(by_b) == by_author['partialComponents'] == 20
by_b_map = {(x['originArrayIndex'], x['sourceGoalId'], x['canonicalGoalId']): x for x in by_b}
assert len(by_b_map) == 20
by_pairs = []
for a in a_rows:
    key = (a['originalRouteIndex'], a['sourceGoalId'], a['canonicalChildGoalId'])
    b = by_b_map[key]
    assert a['verdict'] == 'ACCEPT_EXACT_BOUNDED_SOURCE_COMPONENT'
    assert b['decision'] == 'ACCEPT_BOUNDED_PARTIAL_SOURCE_COMPONENT'
    assert a['matchType'] == b['matchType'] == 'partial'
    assert a['wholeCurrentInactiveRoutine'] == goals[key[2]]
    assert not b['wholeSourceDutyComplete'] and not b['wholeTargetUnionComplete']
    by_pairs.append({'routeIndex': key[0], 'sourceGoalId': key[1], 'canonicalChildGoalId': key[2],
        'actualIndependentA': deepcopy(a), 'actualIndependentB': deepcopy(b),
        'pairedDisposition': 'EXACT_PARTIAL_ROLE_ACCEPTED; ORDINARY_TRACK_AND_COURSE_PROJECTION_PENDING',
        'wholeSourceClosure': False, 'wholeTargetUnionClosure': False})
assert len(by_a['sourceSpecificPlacementVerdicts16']) == 16
assert all(x['verdict'] == 'ACCEPT_EXACT_SOURCE_SPECIFIC_SCOPE_ONLY' for x in by_a['sourceSpecificPlacementVerdicts16'])

sl_a_path = SLA / 'three-whole-framework-source-placement.independent-a.first-addendum.verdicts.json'
sl_a = load(sl_a_path)['wholeCurrentTargetVerdicts3']
sl_b_path = SLB / 'three-whole-target-source-placement.actual-independent-b.records.jsonl'
sl_b = {x['goalId']: x for x in (json.loads(s) for s in sl_b_path.read_text().splitlines() if s.strip())}
assert len(sl_a) == len(sl_b) == 3
sl_pairs = []
upper = {'ac8b6c0f-98b2-5092-806d-d9498efbfa35', '36666b4a-97af-51fc-9983-56cdcc7a8229'}
lower = '75e2eff1-f871-5461-9e3f-26d0b333ce2f'
for a in sl_a:
    gid = a['goalId']
    b = sl_b[gid]
    assert a['wholeUnchangedCurrentInactiveGoal'] == b['wholeCurrentGoal'] == goals[gid]
    if gid in upper:
        assert a['verdict'].startswith('ACCEPT_') and b['wholeSLTargetCleared'] is True
        disposition = 'WHOLE_EXACT_SL_GK_LK_END_OF_QUALIFICATION_TARGET_SOURCE_ROLE_ACCEPTED'
    else:
        assert gid == lower and a['verdict'].startswith('KEEP_HOLD_') and b['wholeSLTargetCleared'] is False
        disposition = 'WHOLE_SL_SEKI_TARGET_SOURCE_AND_GRADE_SCOPE_REMAINS_HOLD'
    sl_pairs.append({'goalId': gid, 'actualIndependentA': deepcopy(a), 'actualIndependentB': deepcopy(b),
        'pairedDisposition': disposition, 'ordinaryAtlasAdoptionPending': True,
        'wholeOriginalSourceClosure': False, 'wholeNationalSourceUnionClosure': False})

put(OWN / 'paired-genuine-source-verdicts.actual.json', {
    'schemaVersion': 1, 'role': 'Technical pairing of actual independently first-sealed source verdicts; no generated scientific judgment',
    'verifiedOriginalFirstSeals': verified, 'pairedBY20PartialComponents': by_pairs,
    'pairedSL3WholeCurrentTargets': sl_pairs, 'SL2WholeUpperTargetSourceRolesAccepted': sorted(upper),
    'SLWholeLowerTargetStillHOLD': lower, 'BYGK_LKOrdinaryPlacementApproved': False,
    'sourceNativeNTGAndSeparateBcP12_13ChoiceBoundariesRetained': True,
    'SL65WholeOriginalDutiesAndNational1646Retained': True,
    'allCurrent177AndEightContextHoldsUnchanged': True,
    'newNativeDPAMVApproval': False, 'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False,
})

# Byte-exact inactive carry-forward. It is not a new scientific review or a live adoption.
candidate = OWN / 'candidate/canonical.current504.exact-retained.json'
candidate.parent.mkdir(parents=True, exist_ok=True)
candidate.write_bytes(canonical_path.read_bytes())
atlas_path = ROOT / 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
atlas = deepcopy(load(atlas_path))
atlas['landscapePath'] = str(candidate.relative_to(ROOT))
atlas['semanticKindLedgerPath'] = str((SL21 / 'native/current504.semantic-kind.technical-input.json').relative_to(ROOT))
atlas['expectedCurricularAtomicGoalCount'] = 395
for stage, marker in [('SekI', '/lower-secondary/'), ('SekII', '/upper-secondary/')]:
    matches = [p for p in atlas['mappingPaths'] if '/DE-SL/' in p and marker in p]
    assert len(matches) == 1
    replacement = str((SL21 / f'candidate-source-mappings/{stage}.source-mapping.author-candidate.json').relative_to(ROOT))
    atlas['mappingPaths'][atlas['mappingPaths'].index(matches[0])] = replacement
inactive = 'app/scripts/config/goal-books/inactive/chemie-b008-paired-source-refinement-20261008-v24'
atlas['outputDirectory'] = inactive + '/source-views'
atlas['manifestPath'] = inactive + '/atlas.manifest.json'
atlas['navigationViewPath'] = inactive + '/atlas.navigation.view.json'
config_path = OWN / 'ordinary-atlas.current504.pending-source-decisions.probe.inputs.json'
put(config_path, atlas)

# Execute the unchanged normal loader once. A failure is real pending work, never a green alias.
argv = ['node', 'app/node_modules/tsx/dist/cli.mjs', 'app/scripts/buildGoalBookSourceAtlasInputs.ts', '--config', str(config_path.relative_to(ROOT))]
started = datetime.now(timezone.utc).isoformat()
t = time.monotonic()
run = subprocess.run(argv, cwd=ROOT, capture_output=True, text=True)
(OWN / 'ordinary-atlas.stdout.actual.txt').write_text(run.stdout)
(OWN / 'ordinary-atlas.stderr.actual.txt').write_text(run.stderr)
put(OWN / 'ordinary-atlas.terminal.actual.json', {'argv': argv, 'startedAt': started,
    'endedAt': datetime.now(timezone.utc).isoformat(), 'elapsedSeconds': time.monotonic() - t,
    'actualExitCode': run.returncode, 'stdout': bind(OWN / 'ordinary-atlas.stdout.actual.txt'),
    'stderr': bind(OWN / 'ordinary-atlas.stderr.actual.txt'), 'newScientificApproval': False,
    'ordinaryAtlasReady': run.returncode == 0, 'activeWrites': 0})
put(OWN / 'neutral-paired-source-refinement.technical.entry.json', {'schemaVersion': 1,
    'role': 'Bounded technical adoption of paired BY/SL source evidence; ordinary projection remains separately unready',
    'pairedVerdicts': bind(OWN / 'paired-genuine-source-verdicts.actual.json'),
    'whole504CandidateExactToReviewedV21': bind(candidate),
    'ordinaryAtlasInputs': bind(config_path), 'ordinaryAtlasActualTerminal': bind(OWN / 'ordinary-atlas.terminal.actual.json'),
    'actualPairedBYPartialComponents': 20, 'actualPairedSLWholeUpperTargetRoles': 2,
    'lowerSLWholeTargetHoldRetained': True, 'ordinaryAtlasReady': run.returncode == 0,
    'other35CPV009AndAllOriginalDutyHoldsRetained': True,
    'all26Profiles52CasesScienceUnchanged': True, 'newScientificCompletions': 0,
    'restoredStrictBindings': 0, 'activeWrites': 0, 'humanApproval': False, 'humanTrial': False})
print(json.dumps({'pairedBYPartialComponents': 20, 'pairedSLWholeUpperRoles': 2,
    'originalFirstSealBindingsExact': sum(x['actualExactInputAndOutputBindings'] for x in verified),
    'ordinaryAtlasActualExitCode': run.returncode, 'strictGain': 0, 'activeWrites': 0}))

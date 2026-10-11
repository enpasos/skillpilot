#!/usr/bin/env python3
"""Prepare, then adopt the bounded reviewed B007 successor without editing history.

This is a package integration receipt, not a new scientific review. All actual
reviews and page inspections must pass before the active files may be written.
"""
import copy
import datetime
import hashlib
import json
import pathlib
import sys

ROOT = pathlib.Path.cwd()
E = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11')
BASE = E / 'chemie-b007-v7-root-normal-final-integration-20261011-v1'
STAGE = E / 'chemie-b007-v7-final-native31-root-integration-candidate-20261011-v1'
PAGES = E / 'chemie-b007-v7-final-native31-root-page-inspection-20261011-v1'
AUTHOR = E / 'chemie-b007-targeted-scoring-source-binding-author-successor-20261011-v7'
REGISTRY = pathlib.Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
LAND = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
KINDS = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
SOURCE_INPUTS = pathlib.Path('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
LEDGER = pathlib.Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')

def read(path):
    return json.loads(pathlib.Path(path).read_text())

def serialized(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()

def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def write(path, value):
    path = pathlib.Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(serialized(value))
    return str(path)

def subject(registry):
    return next(item for item in registry['subjects'] if item['subject'] == 'chemie')

mode = sys.argv[1] if len(sys.argv) == 2 else ''
if mode == '--prepare':
    assert not (BASE / 'active-adoption-plan.actual.json').exists(), 'Refuse to overwrite an existing adoption plan'
    original = read(REGISTRY)
    candidate = read(BASE / 'inactive.registry.config.json')
    assert [s for s in original['subjects'] if s['subject'] != 'chemie'] == [s for s in candidate['subjects'] if s['subject'] != 'chemie']
    proposed = copy.deepcopy(candidate)
    chemistry = subject(proposed)
    old = subject(original)
    chemistry.update(landscapePath=LAND, semanticKindLedgerPath=KINDS, visualizationQaPath=QA)

    def active_config(path):
        data = read(path)
        data['landscapePath'] = LAND
        if 'semanticKindLedgerPath' in data:
            data['semanticKindLedgerPath'] = KINDS
        if 'reportPath' in data:
            data['reportPath'] = str(BASE / 'checks/memory402.active.normal.actual.report.md')
        destination = BASE / 'active-configs' / pathlib.Path(path).name
        if destination.exists():
            assert destination.read_bytes() == serialized(data), f'Different prepared config: {destination}'
            return str(destination)
        return write(destination, data)

    chemistry['semanticAtomicityConfigPaths'] = [active_config(path) for path in chemistry['semanticAtomicityConfigPaths']]
    chemistry['positiveEvidenceConfigPaths'] = [active_config(path) for path in chemistry['positiveEvidenceConfigPaths']]
    chemistry['memoryReviewConfigPath'] = active_config(chemistry['memoryReviewConfigPath'])
    assert all(edge in chemistry['resolutionSupersessions'] for edge in old['resolutionSupersessions'])
    assert all(path in chemistry['resolutionIndexPaths'] for path in old['resolutionIndexPaths'])
    assert chemistry['resolutionWithdrawals'] == old['resolutionWithdrawals']

    output = {}
    output[LAND] = (STAGE / 'candidate/whole523-six-child-DE15-deck.inactive.json').read_bytes()
    kinds = read(STAGE / 'candidate/semantic-kinds.current523.DE15-deck.inactive.json')
    kinds['sourceLandscapePath'] = LAND
    output[KINDS] = serialized(kinds)
    qa = read(subject(candidate)['visualizationQaPath'])
    for row in qa['records']:
        row['landscapePath'] = LAND
    old_qa = read(QA)
    old_rows = {row['goalId']: row for row in old_qa['records']}
    new_rows = {row['goalId']: row for row in qa['records']}
    assert all(new_rows[gid] == row for gid, row in old_rows.items()), 'An existing QA decision would change'
    assert len(new_rows) - len(old_rows) == 6
    for row in qa['records']:
        if row['goalId'] not in old_rows:
            assert row['contentApprovedChatGpt'] == 'yes'
            assert row['umlautsCorrectChatGpt'] == 'yes'
            assert row['aiApproved'] == 'yes'
            assert row['aiApprovedAssetSha256'] == row['assetSha256']
            assert row['humanApproved'] == 'no'
    output[QA] = serialized(qa)
    output[str(REGISTRY)] = serialized(proposed)

    source = read(SOURCE_INPUTS)
    author_source = read(AUTHOR / 'candidate/source-atlas.normal-helper.inactive.inputs.json')
    mappings = []
    mapping_adoptions = []
    for original_path, reviewed_path in zip(source['mappingPaths'], author_source['mappingPaths'], strict=True):
        if original_path == reviewed_path:
            mappings.append(original_path)
            continue
        target = BASE / 'active-source-mappings' / pathlib.Path(reviewed_path).name
        assert not target.exists(), str(target)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(pathlib.Path(reviewed_path).read_bytes())
        mappings.append(str(target))
        mapping_adoptions.append({'originalPathPreserved': original_path, 'reviewedSuccessor': reviewed_path, 'operativeExactCopy': str(target), 'sha256': digest(target.read_bytes())})
    assert len(mapping_adoptions) == 5
    source['mappingPaths'] = mappings
    source['expectedCurricularAtomicGoalCount'] = 382
    assert source['expectedUnresolvedScopeDecisionCount'] == author_source['expectedUnresolvedScopeDecisionCount'] == 496
    output[str(SOURCE_INPUTS)] = serialized(source)
    ledger = read(LEDGER)
    removed = [path for path in ledger['activeBatchConfigPaths'] if 'b007-two-current-open-20261007-v2.config.json' in path]
    assert len(removed) == 1
    assert set(read(removed[0])['goalIds']) == {'53fd1bfd-facb-54ae-b2dc-f667ed1414fc', '7be6f951-a614-52dc-94d3-2ce0d33765ff'}
    goals = {goal['id']: goal for goal in json.loads(output[LAND])['goals']}
    assert all(goals[gid].get('contains') for gid in read(removed[0])['goalIds'])
    ledger['activeBatchConfigPaths'] = [path for path in ledger['activeBatchConfigPaths'] if path not in removed]
    output[str(LEDGER)] = serialized(ledger)
    rows = []
    for target, data in output.items():
        staged = BASE / 'active-staged-files' / target
        staged.parent.mkdir(parents=True, exist_ok=True)
        staged.write_bytes(data)
        current = pathlib.Path(target).read_bytes()
        rows.append({'targetPath': target, 'stagedPath': str(staged), 'currentSha256': digest(current), 'proposedSha256': digest(data), 'bytes': len(data)})
    write(BASE / 'active-adoption-plan.actual.json', {
        'preparedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'scope': 'Reviewed six B007 successors, two former atoms become clusters; current scientific review bodies and old source mappings retained. No other subject or Human approval changes.',
        'files': rows, 'sourceMappingSuccessors': mapping_adoptions,
        'closedInFlightFormerParentBatch': removed,
        'requiredInspections': [str(PAGES / 'complete40-pdf-actual-pixel-inspection.root.json'), str(PAGES / 'complete40-html-actual-pixel-inspection.machine.json')],
        'activeApplied': False,
    })
    print(f'Prepared {len(rows)} active file changes, 65 path-only operative configs and five exact mapping successors; no active write.')
elif mode == '--apply':
    assert not (BASE / 'active-adoption-applied.actual.json').exists(), 'Refuse a duplicate activation'
    plan = read(BASE / 'active-adoption-plan.actual.json')
    protection = read(BASE / 'checks/current206-protected-to-candidate212.actual.json')
    assert protection['lostOldStrict'] == [] and len(protection['newStrict']) == 6
    assert protection['blockingIssueCount'] == 0 and all(c['status'] == 'pass' for c in protection['requiredChecks'])
    for path in plan['requiredInspections']:
        inspection = read(path)
        assert len(inspection['rows']) == 40
        assert inspection['actualPixelInspectionStillRequired'] is False
        assert inspection['findingCount'] == 0
    for item in plan['files']:
        assert digest(pathlib.Path(item['targetPath']).read_bytes()) == item['currentSha256'], f"Active input changed: {item['targetPath']}"
        assert digest(pathlib.Path(item['stagedPath']).read_bytes()) == item['proposedSha256']
    for item in plan['files']:
        target = pathlib.Path(item['targetPath'])
        backup = BASE / 'pre-adoption-exact-files' / item['targetPath']
        backup.parent.mkdir(parents=True, exist_ok=True)
        backup.write_bytes(target.read_bytes())
        target.write_bytes(pathlib.Path(item['stagedPath']).read_bytes())
    write(BASE / 'active-adoption-applied.actual.json', {
        'appliedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'exactPlanSha256': digest((BASE / 'active-adoption-plan.actual.json').read_bytes()),
        'scope': plan['scope'], 'files': plan['files'],
        'strictCompletionClaimedBeforeActiveCentralCheck': 0,
        'humanApproval': False,
        'nextRequired': 'Normal source-atlas generation, active central strict check, protected IDs and required Layer-A checks',
    })
    print('Applied the six planned curriculum/config/ledger files; active checks remain required.')
else:
    raise SystemExit('Usage: adopt-reviewed-b007.py --prepare | --apply')

# SPDX-License-Identifier: Apache-2.0
"""Bind current ordinary inputs and expose genuine missing A/M decisions without adoption."""
import copy
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent


def read(path):
    return json.loads(path.read_text())


def bind(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(),
            'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def jsonl(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


registry_path = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
subject = next(row for row in read(registry_path)['subjects'] if row['subject'] == 'chemie')
canonical = read(ROOT / subject['landscapePath'])
future = read(OWN / 'candidate/canonical504-current26-resource-links.inactive.json')
current_goals = {g['id']: g for g in canonical['goals']}
future_goals = {g['id']: g for g in future['goals']}
raw = read(OWN / 'input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json')
ids = [row['wholeGoal']['id'] for row in raw['routineBodies']]
source21 = read(OWN / 'input/whole21-BY-source-duties36-edges79-occurrences.exact-neutral-input.json')
partner_ids = sorted({gid for row in source21['rows'] for gid in row['allOriginalPartnerGoalIds']})
source_config_path = ROOT / 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
source_config = read(source_config_path)
source_bindings = []
for mapping_path in source_config['mappingPaths']:
    path = ROOT / mapping_path
    mapping = read(path)
    extraction = ROOT / mapping['sourceExtractionPath']
    source_bindings.append({'mapping': bind(path), 'extraction': bind(extraction),
                            'actualWholeDecisionCount': len(mapping['decisions']),
                            'actualWholeMappingEdgeCount': len(mapping['mappings'])})
assert len(source_bindings) == 32
original_national_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3/all-national-original-nine-source-obligations.actual.json'
original_national = read(original_national_path)
assert len(original_national['directBindings']) == 1646
atomic_config_path = ROOT / 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-chemistry-inquiry-communication.config.json'
atomic_config = read(atomic_config_path)
atomic_rows = jsonl(ROOT / atomic_config['reviewPath'])
memory_config_path = ROOT / subject['memoryReviewConfigPath']
memory_config = read(memory_config_path)
memory_rows = jsonl(ROOT / memory_config['reviewPath'])
assert len(memory_rows) == 378
cards_path = ROOT / memory_config['cardReviewPath']
card_rows = jsonl(cards_path)
input = {
    'schemaVersion': 1, 'role': 'Neutral whole current ordinary source, partner, A/M and visibility inputs; no scientific verdict',
    'currentActiveChemistrySubjectRegistryValue': subject,
    'currentChemistryCanonicalBinding': bind(ROOT / subject['landscapePath']),
    'futureWhole504CanonicalBinding': bind(OWN / 'candidate/canonical504-current26-resource-links.inactive.json'),
    'whole26CurrentScientificRoutines': [{'goalId': gid, 'wholeInactiveGoal': future_goals[gid],
                                       'wholeCurrentGoalIfAlreadyExisting': current_goals.get(gid)} for gid in ids],
    'wholeOriginalSourcePartnerGoals': [{'goalId': gid, 'wholeCurrentGoal': current_goals[gid],
                                        'wholeInactiveCandidateGoal': future_goals[gid]} for gid in partner_ids],
    'whole21BYSourcePartnerFramePath': (OWN / 'input/whole21-BY-source-duties36-edges79-occurrences.exact-neutral-input.json').relative_to(ROOT).as_posix(),
    'wholeCurrent32SourceMappingExtractionBindings': source_bindings,
    'currentSourceAtlasInputBinding': bind(source_config_path),
    'originalWhole1646B008SourceDutyInventory': bind(original_national_path),
    'originalInventoryCountIsNotAClaimThatAllCurrentMappingsWereReviewedAgain': True,
    'actualUnmodifiedCurrentAtomicityConfig': bind(atomic_config_path),
    'actualUnmodifiedCurrentAtomicityRecords': bind(ROOT / atomic_config['reviewPath']),
    'wholeCurrentAtomicityRecords': atomic_rows,
    'actualUnmodifiedCurrentMemoryConfig': bind(memory_config_path),
    'actualUnmodifiedCurrentMemoryRecords': bind(ROOT / memory_config['reviewPath']),
    'wholeCurrent378MemoryRows': memory_rows,
    'actualUnmodifiedCurrentCardRecords': bind(cards_path), 'wholeCurrentCardRows': card_rows,
    'actualUnmodifiedCurrentVisibilityScopes': [{'scope': scope, 'exactViewBinding': bind(ROOT / scope['viewPath'])}
                                              for scope in memory_config['visibilityScopes']],
    'inactiveKindClassificationsAreTechnicalCandidatesNotNewScientificDecisions': True,
    'sourceScopeCourseAndTargetedEightContextApproval': False,
    'activeWrites': [], 'newScientificClosures': 0, 'restoredBindings': 0, 'netStrictGain': 0, 'humanApproval': False,
}
write(OWN / 'input/current-whole-source-partner-atomicity-memory-frame.neutral.json', input)
future_path = (OWN / 'candidate/canonical504-current26-resource-links.inactive.json').relative_to(ROOT).as_posix()
configs = []
for name, config, script in [('atomicity', atomic_config, 'semanticAtomicityReview.ts'),
                              ('memory', memory_config, 'memoryCardReview.ts')]:
    config = copy.deepcopy(config)
    config['landscapePath'] = future_path
    if name == 'memory':
        config['reportPath'] = (OWN / 'checks/memory395-existing378-records.normal-report.md').relative_to(ROOT).as_posix()
    path = OWN / f'candidate/{name}.current-unmodified-records.future504.normal-probe.config.json'
    write(path, config)
    command = ['node', str(ROOT / 'app/node_modules/tsx/dist/cli.mjs'), str(ROOT / 'app/scripts' / script),
               '--config=' + path.relative_to(ROOT).as_posix(), '--mode=check']
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, timeout=90)
    log = OWN / f'checks/{name}.future504-unmodified-current-records.actual.stdout.txt'
    assert not log.exists()
    log.write_text(result.stdout + result.stderr)
    terminal = {'schemaVersion': 1, 'argv': command, 'actualExitCode': result.returncode,
                'normalOutput': bind(log), 'scientificReviewOrApproval': False,
                'fingerprintWrites': 0, 'activeWrites': [], 'expectedPendingReviewProbe': True,
                'normalMissingStaleObsoleteMessages': [line for line in result.stdout.splitlines()
                                                     if any(term in line for term in ['Missing ', 'Stale ', 'Obsolete ', 'blocking issues'])]}
    write(OWN / f'checks/{name}.future504-unmodified-current-records.actual-terminal.json', terminal)
    configs.append({'name': name, 'config': bind(path), 'terminal': terminal})
assert next(row for row in read(registry_path)['subjects'] if row['subject'] == 'chemie') == subject
assert bind(ROOT / subject['landscapePath']) == input['currentChemistryCanonicalBinding']
assert bind(ROOT / atomic_config['reviewPath']) == input['actualUnmodifiedCurrentAtomicityRecords']
assert bind(ROOT / memory_config['reviewPath']) == input['actualUnmodifiedCurrentMemoryRecords']
assert bind(cards_path) == input['actualUnmodifiedCurrentCardRecords']
write(OWN / 'checks/current-A-M-source-inputs-preserved-and-normal-future-gaps.actual.json', {
    'schemaVersion': 1, 'actualCurrent32SourceMappingBindings': source_bindings,
    'actualCurrentAtomicityRecordCount': len(atomic_rows), 'actualCurrentMemoryRecordCount': len(memory_rows),
    'actualCurrentCardRecordCount': len(card_rows), 'actualCurrentVisibilityScopeCount': len(memory_config['visibilityScopes']),
    'normalFutureProbes': configs, 'currentUnmodifiedRecordsPreserved': True,
    'wholeSourceApproval': False, 'activeWrites': [], 'newScientificClosures': 0, 'netStrictGain': 0,
})
print(json.dumps({'actualCurrentMappings': 32, 'wholePartnerGoals': len(partner_ids),
                  'currentMemory378': True, 'cards': len(card_rows), 'visibilityScopes': len(memory_config['visibilityScopes']),
                  'normalFutureProbeExits': [row['terminal']['actualExitCode'] for row in configs],
                  'activeWrites': 0, 'strictGain': 0}))

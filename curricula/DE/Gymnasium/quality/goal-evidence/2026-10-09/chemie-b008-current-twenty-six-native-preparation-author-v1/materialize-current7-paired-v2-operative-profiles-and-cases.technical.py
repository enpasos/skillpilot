# SPDX-License-Identifier: Apache-2.0
"""Apply paired actual seven-body/four-case v2 inputs in real ordinary fields."""
from pathlib import Path
from copy import deepcopy
from datetime import datetime, timezone
import hashlib
import json
import shutil
import subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OUT = OWN / 'seven-operative-native-preparation-v2'
CAP = ROOT / 'tmp/chemie-b008-current26-native-preparation-20261009-v1-capsule'

def read(path): return json.loads(path.read_text())
def bind(path):
    assert not path.is_symlink(), path
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def verify(declaration):
    actual = bind(ROOT / declaration['path'])
    assert actual['sha256'] == 'sha256:' + declaration['sha256'].removeprefix('sha256:'), declaration['path']
    if 'bytes' in declaration: assert actual['bytes'] == declaration['bytes'], declaration['path']
    return actual
def write(path, value):
    assert path.is_relative_to(OUT) and not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(value if isinstance(value, bytes) else (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode())
    return bind(path)
def cap_copy(path):
    target = CAP / path.relative_to(ROOT)
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists(): assert target.read_bytes() == path.read_bytes(), path
    else: shutil.copyfile(path, target)
def value_digest(value):
    return 'sha256:' + hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
def pointer(value, ptr):
    for token in ptr.strip('/').split('/'):
        token = token.replace('~1', '/').replace('~0', '~')
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value

pair_path = OWN.parent / 'chemie-b008-seven-targeted-positive-materials-pairing-root-v2/seven-current-targeted-independent-material-pair.actual.json'
assert bind(pair_path)['sha256'] == 'sha256:b273b88b7fd1a966e4b149977da8848d064273385e62b6ad7769c2352c0e6f95'
pair = read(pair_path)
for declaration in pair['actualCheckedBindings'] + pair['independentFirstFollowupSeals'] + pair['actualIndependentVerdicts']:
    verify(declaration)
author_entry_path = ROOT / pair['neutralAuthorEntry']['path']; verify(pair['neutralAuthorEntry'])
author_entry = read(author_entry_path)
spec_path = ROOT / author_entry['newNormalCandidateSetForNativeMaterialization']['path']
verify(author_entry['newNormalCandidateSetForNativeMaterialization'])
specs = read(spec_path)
assert len(specs['goals']) == 7
ids = [spec['goalId'] for spec in specs['goals']]
assert len(ids) == len(set(ids)) == 7
raw_path = OWN / 'input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json'
raw = read(raw_path); originals = {row['wholeGoal']['id']: row for row in raw['routineBodies']}
archive_path = ROOT / author_entry['originalWholeSevenGoalsOldProfilesAndFourteenCases']['path']
verify(author_entry['originalWholeSevenGoalsOldProfilesAndFourteenCases'])
archive = read(archive_path)
supplements_path = ROOT / author_entry['originalFourteenArchivedWholeCasesAndWorkedTransfers']['path']
verify(author_entry['originalFourteenArchivedWholeCasesAndWorkedTransfers'])
supplements = read(supplements_path)
by_case = {row['caseKey']: row for row in supplements['cases']}
assert len(by_case) == 14
overrides_path = ROOT / pair['currentOperativeFourCaseOverrides']['path']; verify(pair['currentOperativeFourCaseOverrides'])
overrides = read(overrides_path)
by_override = {row['caseKey']: row for row in overrides['entries']}
assert len(by_override) == 4
material_index_path = ROOT / pair['currentElevenMaterialBindings']['path']; verify(pair['currentElevenMaterialBindings'])
material_index = read(material_index_path)
assert len(material_index['files']) == 11
for declaration in material_index['files']:
    verify(declaration)
    cap_copy(ROOT / declaration['path'])

materials = []
changed_cases = []
for spec in specs['goals']:
    gid = spec['goalId']; original = originals[gid]
    cases = []
    for old_case in original['wholeTwoCases']:
        supplement = by_case[old_case['caseKey']]
        assert supplement['originalWholeCase'] == old_case
        assert supplement['operativeGoalId'] == gid
        archive_pointer = supplement['originalWholeCasePointer']
        verify(archive_pointer['file'])
        assert pointer(archive, archive_pointer['jsonPointer']) == old_case
        assert value_digest(old_case) == archive_pointer['valueSha256']
        operative = deepcopy(old_case)
        worked = deepcopy(supplement['authoredWorkedTaskResponse'])
        delta = []
        override = by_override.get(old_case['caseKey'])
        if override:
            assert override['goalId'] == gid and override['replacesOriginalScopeContract'] is True
            replacements = override['replacementFields']
            # Replace actual operative source scope fields; never leave old scope authoritative.
            for key in ['sourceOperatorScopeContractDe', 'sourceOperatorScopeContractEn']:
                if key in replacements:
                    operative[key] = deepcopy(replacements[key]); delta.append(key)
            # Conditional analogue/digital route goes into ordinary task/answer/rubric fields.
            # The unchanged original whole digital task remains in its immutable archive.
            if 'analogueAlternativeLearnerTask' in replacements:
                operative['learnerTask'] = deepcopy(replacements['analogueAlternativeLearnerTask'])
                operative['expectedAnswer'] = deepcopy(replacements['analogueOrDigitalExpectedPerformance'])
                operative['requiredAssessmentCriteria'] = deepcopy(replacements['requiredAssessmentCriteriaOverride'])
                worked = deepcopy(replacements['analogueOrDigitalExpectedPerformance'])
                delta += ['learnerTask', 'expectedAnswer', 'requiredAssessmentCriteria']
                brief = next(row for row in spec['profile']['applicationCaseBriefs'] if row['id'] == operative['caseKey'])
                assert operative['learnerTask'] == {'de': brief['taskDemandDe'], 'en': brief['taskDemandEn']}
                assert operative['expectedAnswer'] == {'de': brief['expectedPerformanceDe'], 'en': brief['expectedPerformanceEn']}
            assert sorted(delta) == sorted(key for key in set(old_case) | set(operative) if old_case.get(key) != operative.get(key))
            changed_cases.append({'goalId': gid, 'caseKey': operative['caseKey'], 'changedOrdinaryCaseFields': delta,
                                  'genuinePairedOverride': {'file': bind(overrides_path), 'jsonPointer': '/entries/' + str(overrides['entries'].index(override))},
                                  'allOtherOrdinaryWholeCaseFieldsExact': True,
                                  'digitalOriginalCaseStillWholeAndMandatoryWhenSelected': True})
        else: assert operative == old_case
        cases.append({'caseKey': operative['caseKey'], 'wholeOperativeCase': operative,
                      'authoredWorkedTaskResponse': worked,
                      'freshTransferTask': deepcopy(supplement['freshTransferTask']),
                      'authoredWorkedFreshTransferResponse': deepcopy(supplement['authoredWorkedFreshTransferResponse']),
                      'originalWholeArchivePointer': deepcopy(archive_pointer),
                      'ordinaryChangedFields': delta,
                      'actualPracticalOrDigitalLearnerPerformanceCertified': False})
    materials.append({'goalId': gid, 'candidateKey': original['candidateKey'],
                      'wholeUnchangedOriginalGoalBeforeResources': original['wholeGoal'],
                      'wholeOriginalProfileBeforeNormalV2': original['wholeProfile'],
                      'wholePairedNormalV2Profile': deepcopy(spec['profile']),
                      'wholeOperativeCases': cases,
                      'allWholeOriginalArchivedCasesValueExact': True})
assert len(changed_cases) == 4
materials_path = OUT / 'current-seven-fourteen-operative-cases-and-whole-profiles.neutral-input.json'
write(materials_path, {'schemaVersion': 1, 'role': 'Fourteen actual operative whole cases and seven paired profile bodies; actual ordinary fields supersede four old case scopes',
                      'entries': materials, 'exactChangedOperativeCases': changed_cases,
                      'original14ArchivesRemainExact': True, 'unchangedOperativeWholeCaseBodies': 10,
                      'finiteElevenOperativeMaterials': bind(material_index_path),
                      'noOwnPhysicalExperimentOrDigitalLearnerFileClaim': True,
                      'source19WholeAndCourseTargetBoundariesStillHeld': True,
                      'humanApproval': False, 'activeWrites': [], 'strictGain': 0})
review_id = 'chemie-b008-seven-current-raster-operative-v2-native-author-20261009-v1'
current_set = deepcopy(specs)
current_set['reviewId'] = review_id
current_set['reviewedAt'] = datetime.now(timezone.utc).isoformat()
current_set['reviewer'] = 'Codex technical assembly of genuine paired seven v2 author bodies; current native/source context approval pending'
for spec in current_set['goals']:
    spec['reason'] += ' Actual current selected raster binding only; whole source, course, placement, current Native7 and A/M remain pending.'
    spec['dissent'] = list(spec.get('dissent', [])) + ['Current Native7 and whole Source19/course/target union remain HOLD; paired material component acceptance is not M7 closure.']
set_path = OUT / 'P7.actual-operative-v2.normal-author-candidate-set.json'
write(set_path, current_set)
record_path = OUT / 'P7.actual-current-raster.ordinary-author-candidate.review.jsonl'
config_path = OUT / 'P7.actual-current-raster.ordinary-author-candidate.config.json'
canonical_path = OWN / 'candidate/canonical504-current26-resource-links.inactive.json'
kinds_path = OWN / 'candidate/semantic-kinds.current504.technical-review-input.json'
criteria_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
config = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
          'schemaVersion': 2, 'reviewId': review_id, 'goalFingerprintRuleVersion': 'goal-evidence-v1',
          'profileRuleVersion': 'positive-understanding-evidence-v2', 'landscapeId': 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',
          'landscapePath': str(canonical_path.relative_to(ROOT)), 'semanticKindLedgerPath': str(kinds_path.relative_to(ROOT)),
          'reviewCriteriaPath': str(criteria_path.relative_to(ROOT)), 'reviewPath': str(record_path.relative_to(ROOT)),
          'reviewRunManifestPaths': [], 'reviewedResourceTypes': ['goal-visualization'], 'requireApproved': False,
          'scope': {'label': 'Seven whole operative paired v2 bodies with current rasters; all native/source/whole course gates pending', 'goalIds': ids}}
write(config_path, config)
for path in [set_path, config_path, canonical_path, kinds_path, criteria_path]: cap_copy(path)
command = [str(ROOT / 'app/node_modules/.bin/tsx'), 'scripts/materializePositiveGoalEvidenceCandidates.ts',
           '--config', str(config_path.relative_to(ROOT)), '--candidates', str(set_path.relative_to(ROOT)), '--write']
result = subprocess.run(command, cwd=CAP / 'app', capture_output=True, text=True, timeout=60)
log_path = OUT / 'ordinary-current-seven-P-materializer.actual.stdout.txt'
write(log_path, (result.stdout + result.stderr).encode())
write(OUT / 'ordinary-current-seven-P-materializer.actual-terminal.json', {'schemaVersion': 1, 'argv': command,
      'cwd': str((CAP / 'app').relative_to(ROOT)), 'actualExitCode': result.returncode, 'normalOutput': bind(log_path),
      'genuineMaterialPairComponentReused': bind(pair_path), 'noNewIndependentReview': True,
      'activeWrites': [], 'newScientificClosures': 0, 'strictGain': 0})
assert result.returncode == 0, result.stdout + result.stderr
write(record_path, (CAP / record_path.relative_to(ROOT)).read_bytes())
records = [json.loads(line) for line in record_path.read_text().splitlines() if line.strip()]
assert [record['goalId'] for record in records] == ids
for spec, record in zip(current_set['goals'], records):
    assert record['profile'] == spec['profile']
    assert record['reviewAuthority'] == 'ai_candidate' and record['status'] == 'needs_human_review'
    assert record['reviewRunIds'] == [] and record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1'
entry_path = OUT / 'neutral-current-seven-operative-material-profile-native-intake.entry.json'
write(entry_path, {'schemaVersion': 1, 'role': 'Neutral technical current Native7/P7 intake from genuinely paired material components; no current native or whole source approval',
                  'goalIds': ids, 'wholeOperativeCaseCount': 14, 'wholeProfileCount': 7,
                  'wholeOperativeCasesAndProfileBodies': bind(materials_path), 'actualElevenFiniteMaterials': bind(material_index_path),
                  'genuinePairedMaterialComponentEntry': bind(pair_path), 'immutableOriginalArchive': bind(archive_path),
                  'originalWholeProfile52CaseUniverse': bind(raw_path), 'currentNormalCandidateSet': bind(set_path),
                  'currentNormalPConfig': bind(config_path), 'currentNormalPRecords': bind(record_path),
                  'normalMaterializerTerminal': bind(OUT / 'ordinary-current-seven-P-materializer.actual-terminal.json'),
                  'actualOperativeFourCaseOverridesAppliedToOrdinaryFields': changed_cases,
                  'pairedTwoProfileBodiesAndFiveUnchangedBodiesValueExact': True,
                  'historicalFourteenCasesAndOriginalSealsNeverOverwritten': True,
                  'unselectedDigitalImplementationNotAMandatoryCommonCoreRequirement': True,
                  'selectedDigitalOriginalStillRequiresOwnImplementationAndAllSixChecks': True,
                  'P2DeviceLiteralUsesActualBoundCorrectedCSV': True,
                  'currentSourceOperatorCourseViewAndNativeApproval': False,
                  'AandMScientificAndNativeGatesStillPending': True,
                  'status': 'ai_candidate/needs_human_review/E1/G1', 'actualPracticalPerformanceCertified': False,
                  'newScientificClosures': 0, 'restoredBindings': 0, 'netStrictGain': 0, 'activeWrites': [],
                  'humanApproval': False, 'humanTrial': False})
print(json.dumps({'entry': bind(entry_path), 'operativeProfileCount': 7, 'operativeWholeCases': 14,
                  'actualCaseOverridesApplied': 4, 'unchangedOtherWholeCases': 10,
                  'ordinaryPTechnicalSchema': 'PASS', 'currentNativeAndSourceApproval': False,
                  'strictGain': 0, 'activeWrites': 0}, ensure_ascii=False))

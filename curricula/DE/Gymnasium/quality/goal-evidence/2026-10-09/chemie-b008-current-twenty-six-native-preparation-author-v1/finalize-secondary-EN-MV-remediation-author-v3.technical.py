# SPDX-License-Identifier: Apache-2.0
"""Seal finite actual source/EN/model candidates without scientific approvals."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import importlib.util
import json

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OUT = OWN / 'source-view-remediation-author-v3'

def read(p): return json.loads(p.read_text())
def bind(p):
    assert not p.is_symlink(), p
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def write(name, value):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(p)
def verify_binding(b):
    actual = bind(ROOT / b['path'])
    assert actual['sha256'] == b['sha256'].removeprefix('sha256:') and actual['bytes'] == b['bytes'], b['path']
    return actual

proof_path = OUT / 'actual-three-secondary-one-EN-one-MV-profile.normal-contract-proof.json'
proof = read(proof_path)
assert proof['MVWholeOneNormalProfile']['normalErrors'] == []
assert proof['MVWholeOneNormalProfile']['authority'] == 'ai_candidate'
assert proof['MVWholeOneNormalProfile']['status'] == 'needs_human_review'
assert len(proof['whole16Views']) == 16 and proof['actualRemainingOpaqueReferences'] == 17
assert all(v['wholeBeforeTargetAtoms'] == v['wholeAfterTargetAtoms'] for v in proof['whole16Views'])
assert len(proof['threeNewSecondaryPartialSourceFacets']) == 3
assert proof['other503GoalObjectsExact'] and proof['descriptionDERequiresAndImagesExact']
mv_original_entry = read(OUT / 'MV-metal-model-one-unchanged-goal-two-source-bound-cases.neutral-review.entry.json')
candidate_path = OUT / 'MV-metal-model.normal-whole-positive-candidate-set.author-v3-final-lowercase-ids.json'
candidate = read(candidate_path)
old_candidate = read(ROOT / mv_original_entry['normalWholePositiveAuthorCandidateSet']['path'])
def normalize_ids(value):
    if isinstance(value, dict): return {k: (v.lower() if k in ('id', 'reviewId') and isinstance(v, str) else normalize_ids(v)) for k, v in value.items()}
    if isinstance(value, list): return [normalize_ids(v) for v in value]
    return value
assert candidate == normalize_ids(old_candidate), 'Final identifiers only; scientific bodies unchanged'
final_mv_entry = write('neutral-MV-whole-metal-model-final-normal-contract.author.entry.json', {
    **mv_original_entry,
    'normalWholePositiveAuthorCandidateSet': bind(candidate_path),
    'ordinaryCurrentPConfig': proof['MVWholeOneNormalProfile']['config'],
    'ordinaryCurrentPRecords': proof['MVWholeOneNormalProfile']['records'],
    'ordinaryProfileSchemaAndSemanticsErrors': [],
    'exactIdentifierOnlySuccessorFromUnsealedTechnicalDraft': True,
    'wholeOriginalCasesAndSourcePassageBodiesUnchanged': True,
    'technicalProbeIsNotScientificOrNativeApproval': True})
corrections_path = OUT / 'three-secondary-partial-source-companions-four-view-occurrences.author-candidates.json'
corrections = read(corrections_path)
assert sorted(i for c in corrections['corrections'] for i in c['newPartialRole']['entryIndices']) == [19, 26, 31, 34]
original_current_bindings = []
for c in corrections['corrections']:
    duty = c['wholeOriginalSourceDutyAndAllPartners']
    original_current_bindings.extend(verify_binding(duty[k]) for k in ['mappingBinding', 'extractionBinding'])
original_current_bindings.append(verify_binding(mv_original_entry['rootCanonicalInput']))
for b in [proof['canonical'], proof['beforeAuthorCanonical'], proof['newTechnicalKindInput'],
          proof['MVWholeOneNormalProfile']['config'], proof['MVWholeOneNormalProfile']['records']]:
    verify_binding(b)
spec = importlib.util.spec_from_file_location('ordinary_schema_validator', ROOT / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec); spec.loader.exec_module(validator)
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
json_paths = sorted(OUT.rglob('*.json'))
assert all(validator.validate_file(str(p.relative_to(ROOT)), schema) for p in json_paths)
checks = write('actual-selected-v3-JSON-source-binding-and-normal-contract-checks.json', {
    'schemaVersion': 1, 'normalJSONAPI': 'scripts/validate_schemas.py:validate_file',
    'actualCheckedFiles': [bind(p) for p in json_paths], 'errors': [],
    'originalActiveChemistryAndSourceBindingsExact': original_current_bindings,
    'ordinaryProfileAndViewFacets': bind(proof_path),
    'qualityArtifactJSONChecksDoNotGrantSourceOrScientificApproval': True,
    'noValidatorExceptions': True, 'activeWrites': [], 'netStrictGain': 0})
entry = write('neutral-three-secondary-one-EN-one-MV-whole-remediation-v3.author-review.entry.json', {
    'schemaVersion': 1,
    'role': 'New inactive whole-source/EN/model remediation for targeted independent reviews; historical first inputs unchanged',
    'wholeOriginal35SourceOperatorPartnerInput': corrections['wholeOriginal35EntryInput'],
    'threeWholeSecondaryPartialRolesAndAllPartners': bind(corrections_path),
    'wholeRetainedOfficialPrimaryPages': bind(OUT / 'whole-original-primary-source-pages-and-secondary-partner.author-reading.input.json'),
    'canonical504OneENFieldSuccessor': proof['canonical'],
    'wholeRedoxDEENAndOriginalSourceDuty': bind(OUT / 'one-redox-whole-DEEN-fidelity-correction-and-actual-operator.author-candidate.json'),
    'wholeUnchangedMVGoalTwoCasesAndFinalNormalP': final_mv_entry,
    'actualOrdinaryCompilerAndProfileProbe': bind(proof_path),
    'ordinaryJSONAndUnchangedActiveSourceBindings': checks,
    'requiredNewIndependentScope': {
        'secondarySourceRoles': ['DE-RP LK', 'DE-SN LK', 'DE-TH GK+LK'],
        'fourViewOccurrences': [19, 26, 31, 34],
        'oneActualSNPhysicalPageCorrection': 57,
        'redoxENGoalId': '2fdd759f-8349-5f7e-b29a-6ac7fb0299f9',
        'redoxRequiredFollowups': ['D', 'P', 'A', 'M', 'V/context', 'source operator/scope'],
        'MVGoalId': 'fcaf8c9b-bd81-552e-9d91-43649895471e',
        'MVRequiredFollowups': ['whole source/model/P', 'native D/P/context']},
    'actual395AtomicTargetSetsIn16ViewsPreserved': True,
    'noNewGoalsOrPlacementOrImageChanges': True,
    'remaining17OpaqueViewErrorsAreHOLD': True,
    'wholeSource395AndProtectedEightContextsStillHOLD': True,
    'actualRedoxConductAndQuantitativeEvaluationStillPracticalDuty': True,
    'ownWorkedModelCasesDoNotClaimPhysicalPerformance': True,
    'authorStatus': 'ai_candidate', 'independentScientificOrNativeApproval': False,
    'activeWrites': [], 'netStrictGain': 0, 'humanApproval': False, 'humanTrial': False})
files = [p for p in OUT.rglob('*') if p.is_file()] + [Path(__file__),
    OWN / 'check-secondary-EN-MV-remedy-v3.normal-contracts.technical.mts',
    OWN / 'prepare-three-secondary-source-partners-and-one-EN-remedy.author-v3.py',
    OWN / 'author-MV-metal-model-whole-positive-remedy-v3.py']
seal = write('three-secondary-one-EN-one-MV-author-remediation-v3.first.freeze.json', {
    'schemaVersion': 1, 'sealedAt': datetime.now(timezone.utc).isoformat(),
    'files': [bind(p) for p in sorted(set(files))], 'neutralEntry': entry,
    'firstFailedTechnicalAttemptsPreserved': True, 'newCandidateOnly': True,
    'activeWrites': [], 'netStrictGain': 0, 'humanApproval': False})
print(json.dumps({'entry': entry, 'firstSeal': seal, 'ordinaryPerrors': [],
                  'viewTargetsPreserved': 16, 'secondaryEdges': 3, 'remainingOpaqueHolds': 17, 'netStrictGain': 0}))

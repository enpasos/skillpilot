# SPDX-License-Identifier: Apache-2.0
"""Seal genuine finite Native19/P19 inputs after normal checks and index proof."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import importlib.util
import json
import subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OUT = OWN / 'nineteen-operative-native-preparation-v2'
def read(p): return json.loads(p.read_text())
def bind(p):
    assert not p.is_symlink(), p
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}
def verify(b):
    a = bind(ROOT / b['path'])
    assert a['sha256'] == b['sha256'].removeprefix('sha256:') and a['bytes'] == b['bytes'], b['path']
    return a
def write(name, v):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

assert not (OUT / 'current-nineteen-operative-native-v2-author.first.freeze.json').exists()
request = read(OUT / 'four-required-native-nineteen-originals.exact-index-request.json')
assert len(request['files']) == 4
index_rows = []
for b in request['files']:
    actual = verify(b)
    blob = subprocess.run(['git', 'show', ':' + b['path']], capture_output=True, check=True).stdout
    assert blob == (ROOT / b['path']).read_bytes()
    index_rows.append({**actual, 'indexByteExact': True})
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(b['path'] for b in index_rows) + '\n',
                         capture_output=True, text=True)
assert ignored.returncode == 1 and not ignored.stdout
index_proof = write('four-native19-v2-originals.actual-index-byte-and-portability-proof.json', {
    'schemaVersion': 1, 'files': index_rows, 'actualGitCheckIgnoreExit': ignored.returncode,
    'exactTargetedIndexAdditionByRoot': True, 'authorStaging': [], 'noIgnoreOrValidatorChanges': True,
    'noCommitPushPublicationOrApproval': True})
native_path = OUT / 'neutral-current-nineteen-actual-operative-native-independent-review.entry.json'
native = read(native_path)
assert native['all19NativeGoalPageImagePrerequisiteContextsExactAgainstOriginalNative19']
old_first_path = OWN / 'native19-technical-author.first.freeze.json'
old_first = read(old_first_path)
original_bindings = []
for b in old_first['files']: original_bindings.append(verify(b))
normal = read(OUT / 'ordinary-current-nineteen-native-campaign-and-material-bindings.actual.json')
assert normal['normalCampaignErrors'] == [] and normal['actualCurrentNormalProfiles'] == 19
assert normal['actualWholeOperativeCases'] == 38 and normal['actualMaterializedCaseRemedies'] == 4
assert normal['genuineIndependentCurrentNativeResults'] == 0
p_terminal_path = OUT / 'ordinary-current-nineteen-P-check.actual-terminal.json'
assert read(p_terminal_path)['actualExitCode'] == 0
materials = read(OUT / 'current-nineteen-thirty-eight-operative-cases-and-whole-profiles.neutral-input.json')
assert len(materials['entries']) == 19 and len(materials['exactChangedWholeProfileGoalIds']) == 3
assert len(materials['exactFourOrdinaryCaseDeltas']) == 4
schema_spec = importlib.util.spec_from_file_location('normal_schema_validator', ROOT / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(schema_spec); schema_spec.loader.exec_module(validator)
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
paths = sorted(OUT.rglob('*.json'))
errors = [str(p.relative_to(ROOT)) for p in paths if not validator.validate_file(str(p.relative_to(ROOT)), schema)]
assert not errors, errors
schema_proof = write('ordinary-selected-current-nineteen-v2-JSON-schema.actual.json', {
    'schemaVersion': 1, 'normalAPI': 'scripts/validate_schemas.py:validate_file',
    'actualFileCount': len(paths), 'checkedFiles': [bind(p) for p in paths], 'errors': [],
    'noValidatorExceptions': True, 'symlinks': []})
entry = write('neutral-current-nineteen-complete-operative-native-v2-author.handoff.entry.json', {
    'schemaVersion': 1, 'role': 'Neutral complete genuine operative Native19/P19 author input for independent current native reviews',
    'neutralNativeEntry': bind(native_path),
    'wholeOperativeMaterialIntake': bind(OUT / 'neutral-current-nineteen-operative-material-profile-native-intake.entry.json'),
    'ordinaryCampaignAndWholeMaterialCheck': bind(OUT / 'ordinary-current-nineteen-native-campaign-and-material-bindings.actual.json'),
    'ordinaryP19Check': bind(p_terminal_path), 'ordinarySelectedJSONSchemaCheck': schema_proof,
    'actualFourIndexByteProof': index_proof,
    'immutableOriginalNative19First': bind(old_first_path), 'actualOriginalNative19FileBindingsUnchanged': original_bindings,
    'wholeProfileCount': 19, 'wholeBilingualOperativeCases': 38,
    'genuineWholeThreeProfileSuccessors': materials['exactChangedWholeProfileGoalIds'],
    'genuineFourWholeOperativeCaseSuccessors': materials['exactFourOrdinaryCaseDeltas'],
    'unchanged16ScientificMaterialBodiesAnd34OperativeWholeCasesPreserved': True,
    'all19NativeGoalPageImagePrerequisiteContextsExactAgainstOriginalNative19': True,
    'actualWholeOriginal38CasesAnd38WorkedSupplementsPreserved': True,
    'normalIndependentCampaigns': native['campaigns'], 'independentCurrentNativeResults': 'PENDING',
    'wholeSource395AndOrdinaryCourseAtlasIntegration': 'HOLD; no approval inferred from review-only canonical pages',
    'protected177ExactlyEightContextReviewsStillRequired': True,
    'extraNonStrictEN2fddSemanticFollowupIsSeparate': {
        'path': str((OWN / 'source-view-remediation-context-planning-v1/actual-protected177-eight-contexts-plus-one-nonstrict-EN-science-followup.plan.json').relative_to(ROOT)),
        'requiredGenuineEN_D_P_A_M_SourceChecks': True},
    'currentActualAtoms': 378, 'inactiveProspectiveAtoms': 395, 'actualCurrentNationalBookPages': 359,
    'newScientificClosures': 0, 'restoredBindings': 0, 'netStrictGain': 0,
    'authorOrFuturePeerOutcomeTextInCampaignInputs': False,
    'actualLearnerResearchOrPhysicalExperimentOrConstructionCertified': False,
    'activeWrites': [], 'humanApproval': False, 'humanTrial': False})
scripts = [Path(__file__), OWN / 'materialize-current19-paired-operative-v2-profiles-and-cases.technical.py',
           OWN / 'render-current19-operative-v2-native-review-candidate.technical.mts',
           OWN / 'check-current19-operative-v2-normal-campaigns-and-bindings.technical.mts']
files = sorted(set([p for p in OUT.rglob('*') if p.is_file()] + scripts))
seal = write('current-nineteen-operative-native-v2-author.first.freeze.json', {
    'schemaVersion': 1, 'sealedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'First immutable complete actual Native19/P19-v2 technical author outputs, current scientific review still pending',
    'files': [bind(p) for p in files], 'neutralCompleteEntry': entry,
    'original19FirstSealedArtifactsUnchanged': True, 'activeWrites': [], 'netStrictGain': 0, 'humanApproval': False})
print(json.dumps({'neutralEntry': entry, 'firstSeal': seal, 'actualNativeOriginalIndexCount': 4,
                  'ordinaryJSONFileCount': len(paths), 'ordinaryCurrentP19Exit': 0, 'netStrictGain': 0}))

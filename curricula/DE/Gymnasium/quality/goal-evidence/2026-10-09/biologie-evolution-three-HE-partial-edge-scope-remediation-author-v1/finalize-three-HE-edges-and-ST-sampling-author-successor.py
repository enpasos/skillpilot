# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json, hashlib, subprocess, datetime, importlib.util
import jsonschema

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
NATIVE = BASE / 'biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1'
SOURCE = BASE / 'biologie-evolution-eighteen-seven-source-course-remediation-author-v1'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
SEAL = OWN / 'three-HE-edges-and-ST-sampling.author-final.freeze.json'
assert not SEAL.exists()


def read(path):
    return json.loads(path.read_text())


def bind(path):
    assert path.is_file() and not path.is_symlink()
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def verify(value):
    actual = bind(ROOT / value['path'])
    assert actual['sha256'] == 'sha256:' + value['sha256'].removeprefix('sha256:'), value['path']
    if 'bytes' in value:
        assert actual['bytes'] == value['bytes'], value['path']
    return actual


def write(relative, value):
    path = OWN / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(path)


for path in [OWN / 'three-HE-partial-edge.input-FIRST.freeze.json', OWN / 'ST-natural-variation-sampling.input-FIRST.freeze.json']:
    for value in read(path)['inputs']:
        verify(value)
for directory, seal_name in [(SOURCE, 'seven-source-author-successor.final.freeze.json'),
    (NATIVE, 'native17-and-source-contexts.technical-final.freeze.json')]:
    for value in read(directory / seal_name)['files']:
        verify(value)
term = OWN / 'checks/ordinary-native-and-P17-impact-v1.terminal.actual.json'
assert read(term)['actualExitCode'] == 0
impact = read(OWN / 'checks/normal-source-projection-whole394-and-current-P17.actual.json')
assert impact['actualFull394ModelExactlyExistingNativeCandidate'] and impact['actualProtected15ContextUnionExact']
assert impact['actualAdditionalNativePageChanges'] == impact['actualP17RecordChanges'] == []
assert len(impact['actualWholeP17FingerprintAndSemanticChecks']) == 17
frame = read(OWN / 'neutral-inputs/whole35-duty30-partner-original-frame.exact.json')
assert len(frame['wholeOriginalSourceDutyRows']) == 35 and len(frame['wholeOriginalAndCurrentPartnerGoals']) == 30
whole_model = OWN / 'candidate/full394-three-HE-role-corrected.actual-normal-model.json'
jsonschema.validate(read(whole_model), read(ROOT / 'contracts/goal-book/v1/goal-book-model-1.1.schema.json'))
assert read(OWN / 'three-HE-edge-exact-values-and-whole-masked-equality.actual.json')['maskedWholeObjectExact']
assert read(OWN / 'ST-sampling-unit-exact-values-and-whole-masked-equality.actual.json')['maskedWholeFiveProtocolsExact']
spec = importlib.util.spec_from_file_location('normal_validate_schemas', ROOT / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
symlink_errors = validator.curriculum_symlink_errors(ROOT)
assert symlink_errors == []
parsed = []
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
for path in sorted(OWN.rglob('*')):
    if path.is_file():
        assert not path.is_symlink()
        if path.suffix == '.json':
            read(path)
            assert validator.validate_file(str(path), schema)
            parsed.append(path.relative_to(ROOT).as_posix())
        elif path.suffix == '.jsonl':
            for line in path.read_text().splitlines():
                if line.strip():
                    json.loads(line)
files = [str(path.relative_to(ROOT)) for path in OWN.rglob('*') if path.is_file()]
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(files) + '\n', capture_output=True, text=True)
assert ignored.returncode == 1 and ignored.stdout == '', ignored.stdout
checks = write('checks/actual-json-schema-and-preserved-history-portability.json', {'schemaVersion': 1,
    'createdAt': NOW, 'normalCurrent394ModelSchema': 'PASS', 'actualJsonParsedFiles': parsed,
    'normalCurriculumSymlinkErrors': symlink_errors, 'actualIgnoredOperativeFiles': 0,
    'existingSource115AndNative159AllBytesUnchanged': True, 'normalNativeAndP17Impact': bind(term),
    'rawAuthorMappingFormat': 'Existing authoritative review/legacy format retained; normal source projection checked. No publication-schema validation is falsely claimed for a legacy author mapping.',
    'activeWrites': 0, 'independentSourceMethodApproval': False})
source_entry = read(SOURCE / 'neutral-whole35-partner30-seven-source-author-successor.independent-review.entry.json')
native_entry = read(NATIVE / 'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json')
entry = write('neutral-three-HE-partial-edges-and-one-ST-sampling-unit-author-successor.independent-followup.entry.json', {
    'schemaVersion': 1, 'createdAt': NOW, 'role': 'Complete bounded author successor for two genuine independent findings; no independent verdict',
    'findingIds': ['EVO7B-SOURCE-001', 'EVO7S-A-METHOD-003'],
    'inputFirsts': [bind(OWN / 'three-HE-partial-edge.input-FIRST.freeze.json'), bind(OWN / 'ST-natural-variation-sampling.input-FIRST.freeze.json')],
    'actualAuthorFirstJudgments': [bind(OWN / 'three-HE-primary-operator-and-course.author-science-FIRST.verdict.json'),
        bind(OWN / 'ST-natural-variation-sampling.author-science-FIRST.verdict.json')],
    'wholeCorrectedHEMapping': bind(OWN / 'candidate/HE144-three-partial-operator-and-course-edges.whole-successor.review.json'),
    'sourceExtractionExactlyRetained': bind(SOURCE / 'candidate/source-extractions/HE144-four-source-and-course.whole-successor.json'),
    'wholeCorrectedFiveMethodProtocols': bind(OWN / 'candidate/five-whole-method-protocols.ST-sampling-unit-real-successor.json'),
    'exactSemanticDiffs': [bind(OWN / 'three-HE-edge-exact-values-and-whole-masked-equality.actual.json'),
        bind(OWN / 'ST-sampling-unit-exact-values-and-whole-masked-equality.actual.json')],
    'whole35Duty30PartnerOriginalFrame': bind(OWN / 'neutral-inputs/whole35-duty30-partner-original-frame.exact.json'),
    'previousWholeSourceAuthorEntryUnchanged': bind(SOURCE / 'neutral-whole35-partner30-seven-source-author-successor.independent-review.entry.json'),
    'candidateSourceAtlasConfig': bind(OWN / 'candidate/source-atlas.current479-394-three-HE-partial-edges.inputs.json'),
    'ordinarySourceAtlasByteTransports': bind(OWN / 'normal-source-atlas/book-local-output-transports.actual.json'),
    'ordinarySourceProjectionNativeAndP17ExactImpact': bind(OWN / 'checks/normal-source-projection-whole394-and-current-P17.actual.json'),
    'actualNormalTerminal': bind(term), 'actualSchemasJsonPortabilityAndPreservedHistoryChecks': checks,
    'full479CanonicalAnd394KindsExactlyRetained': True, 'wholeCandidateNormal394ModelExactlyExistingNative': bind(whole_model),
    'currentNative17AndProtected15EntryExactlyRetained': bind(NATIVE / 'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json'),
    'actualAdditionalNativePagesChanged': [], 'original19PagesChangedFromActiveBaselineExactlyRetained': True,
    'currentWholeP17RecordBodyAndFingerprintsExactlyRetained': True,
    'normalSourceAtlasBindingChanges': 'Only source-projection.receipt.json input/witness bindings change; all source views, catalog manifest, complete model and page fields remain byte/semantic equal.',
    'sourceReviewTargetGoalIds': ['e3167331-f855-5030-9673-29f55a7b4230', 'ac40db32-5dc7-5c43-8771-bf805d24aa3b', '9b40dae5-6d89-5714-ac96-373e72a7045e'],
    'methodReviewTargetGoalIds': ['0f1549f6-8341-53b0-8161-5eaeb2b37809'],
    'requiredMethodChangeScope': 'Full corrected natural-object observation protocol including sample-unit and leaf/plant ID requirements, actual raw evidence, inference limits, unchanged whole original natural-object duty; never inferred from text performance.',
    'wholeSourceDutyCount': 35, 'wholeOriginalPartnerCount': 30, 'unchangedOtherFourWholeMethodProtocols': True,
    'actualNewLearnerMeasurementRows': 0, 'HE_Q1_5WitnessRemainsOptionalBookLocal': True,
    'fullHELearnerCourseAndSelectionSemantics': 'EVO7S-A-COURSE-001 remains OPEN; separate genuine larger mandatory/elective view candidate required.',
    'remainingSourceAndCourseGates': source_entry['stillOpen'],
    'requiredIndependentFollowups': 'Two genuine independent current targeted scientific/source/method followups and resolved findings. Keep existing current native campaigns and valid unchanged evidence; this author judgment does not close the findings.',
    'held430bAtomarityUnresolved': True, 'separateConditional480AndRegionalSplitUntouched': True,
    'currentStrictBio': '299/394', 'realCandidateTypedEdgeCorrections': 3, 'realCandidateSamplingProtocolCorrection': 1,
    'newScientificM7Closures': 0, 'restoredM7Bindings': 0, 'strictGain': 0,
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'independentApproval': False, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0})
payload = [bind(path) for path in sorted(OWN.rglob('*')) if path.is_file() and path != SEAL]
write(SEAL.name, {'schemaVersion': 1, 'createdAt': NOW, 'role': 'Actual bounded author final byte seal, not scientific approval',
    'neutralEntry': entry, 'files': payload, 'fileCount': len(payload), 'independentResolvedFindings': 0,
    'wholeSourceOrNativeApproval': False, 'humanApproval': False, 'strictGain': 0, 'activeWrites': 0})
for value in read(SEAL)['files']:
    verify(value)
print(json.dumps({'neutralEntry': entry, 'finalSeal': bind(SEAL), 'fileCount': len(payload),
    'realCandidateEdgeCorrections': 3, 'realCandidateSamplingProtocolCorrections': 1,
    'wholeModelsAndP17Unchanged': True, 'additionalNativePageChanges': 0, 'currentStrictBio': '299/394',
    'independentFollowups': 'PENDING', 'fullHECourseSemantics': 'OPEN', 'strictGain': 0}))

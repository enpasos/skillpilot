# SPDX-License-Identifier: Apache-2.0
"""Seal actual portable native17/context15 candidates without independent judgments."""
from pathlib import Path
import json, hashlib, subprocess, datetime, importlib.util
import jsonschema

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
SEAL = OWN / 'native17-and-source-contexts.technical-final.freeze.json'
assert not SEAL.exists()


def read(path):
    return json.loads(path.read_text())


def bind(path):
    assert path.is_file() and not path.is_symlink(), path
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def verify(value):
    actual = bind(ROOT / value['path'])
    assert actual['sha256'] == 'sha256:' + value['sha256'].removeprefix('sha256:'), value['path']
    if 'bytes' in value:
        assert actual['bytes'] == value['bytes'], value['path']
    return actual


def write(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


FIRST = OWN / 'native17-and-source-contexts.technical-FIRST.freeze.json'
first = read(FIRST)
for value in first['inputs'] + first['outputs']:
    verify(value)
ENTRY = OWN / 'neutral-current17-and-protected-contexts.native-independent-review.entry.json'
entry = read(ENTRY)
assert len(entry['goalIds']) == 17 and len(entry['actualProtectedSourceOrPageReviewIds']) == 15
assert entry['actualChangedPageCount'] == 19 and len(entry['actualProtectedPageChangedIds']) == 1
assert len(entry['campaigns']) == 4
assert read(OWN / 'checks/ordinary-native17-materialize-v1.terminal.actual.json')['actualExitCode'] == 0
PTERM = OWN / 'checks/ordinary-P17-current-raster-capsule.terminal.actual.json'
assert read(PTERM)['actualExitCode'] == 0
assert 'Configured goals: 17' in (OWN / 'checks/ordinary-P17-current-raster-capsule.stdout.actual.txt').read_text()
assert 'Blocking issues: 0' in (OWN / 'checks/ordinary-P17-current-raster-capsule.stdout.actual.txt').read_text()
for value in read(OWN / 'checks/active-current-input-hashguard.after.actual.json')['unchanged']:
    verify(value)

# The ordinary original HTML/PDFs are indexed unchanged, not excluded from the record.
originals = []
for batch in entry['nativeBatches']:
    for key in ['originalHTML', 'originalPDF']:
        value = verify(batch[key])
        index = subprocess.run(['git', 'show', ':' + value['path']], capture_output=True, check=True).stdout
        assert index == (ROOT / value['path']).read_bytes()
        originals.append({**value, 'actualIndexByteExact': True})
assert len(originals) == 4
indexed = OWN / 'checks/four-native-originals.actual-index-byte-exact.json'
write(indexed, {'schemaVersion': 1, 'createdAt': NOW, 'files': originals,
    'rootStageAuthorizedByRequestedCommittableNativePreparation': True,
    'ownStageOperations': 0, 'commitCreated': False})

# Explicit schema checks supplement the normal model, renderer, bundle and campaign gates.
runtime = read(ROOT / 'docs/landscape-runtime.schema.json')
jsonschema.validate(read(ROOT / entry['candidateCanonicalPath']), runtime)
schema = read(ROOT / 'contracts/goal-book/v1/goal-book-model-1.1.schema.json')
checked = []
for path in sorted(OWN.rglob('book-model.json')) + [ROOT / entry['actualFullBeforeModelPath'], ROOT / entry['actualFullCandidateModelPath']]:
    jsonschema.validate(read(path), schema)
    checked.append({'binding': bind(path), 'schema': 'contracts/goal-book/v1/goal-book-model-1.1.schema.json'})
for path in sorted(OWN.rglob('*.render-manifest.json')):
    jsonschema.validate(read(path), read(ROOT / 'contracts/goal-book/v1/goal-book-render-manifest-v2.schema.json'))
    checked.append({'binding': bind(path), 'schema': 'contracts/goal-book/v1/goal-book-render-manifest-v2.schema.json'})
for path in sorted(OWN.rglob('review-bundle-manifest.json')):
    jsonschema.validate(read(path), read(ROOT / 'contracts/goal-book/v1/goal-book-review-bundle.schema.json'))
    checked.append({'binding': bind(path), 'schema': 'contracts/goal-book/v1/goal-book-review-bundle.schema.json'})
spec = importlib.util.spec_from_file_location('normal_validate_schemas', ROOT / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
symlinks = validator.curriculum_symlink_errors(ROOT)
assert symlinks == [], symlinks
parsed_json, parsed_jsonl = [], []
for path in sorted(OWN.rglob('*')):
    if not path.is_file():
        continue
    assert not path.is_symlink()
    if path.suffix == '.json':
        json.loads(path.read_text())
        assert validator.validate_file(str(path), runtime), path
        parsed_json.append(path.relative_to(ROOT).as_posix())
    elif path.suffix == '.jsonl':
        lines = [line for line in path.read_text().splitlines() if line.strip()]
        for line in lines:
            json.loads(line)
        parsed_jsonl.append({'path': path.relative_to(ROOT).as_posix(), 'wholeParsedLines': len(lines)})
operative_paths = [str(path.relative_to(ROOT)) for path in sorted(OWN.rglob('*')) if path.is_file()]
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(operative_paths) + '\n', capture_output=True, text=True)
assert ignored.returncode == 1 and ignored.stdout == '', ignored.stdout
script_code = [bind(ROOT / path) for path in ['app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/goalBookModel.ts',
    'app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'app/scripts/goalBookRenderer.ts',
    'app/scripts/exportGoalBookReviewBundle.ts', 'app/scripts/createGoalDescriptionReviewCampaign.ts',
    'app/scripts/validateGoalDescriptionReviewCampaign.ts', 'app/scripts/positiveGoalEvidenceProfileModel.ts',
    'scripts/validate_schemas.py']]
contracts = OWN / 'checks/current17-and-context15.schemas-json-portability.actual.json'
write(contracts, {'schemaVersion': 1, 'createdAt': NOW, 'candidateLandscapeRuntimeSchema': 'PASS',
    'actualSchemaChecks': checked, 'normalModelRendererBundleCampaignChecks': entry['ordinaryModelBundleCampaignChecks'],
    'actualParsedJsonCount': len(parsed_json), 'actualParsedJsonFiles': parsed_json, 'actualParsedJsonlFiles': parsed_jsonl,
    'normalCurriculumSymlinkErrors': symlinks, 'gitCheckIgnoreArgv': ['git', 'check-ignore', '--stdin'],
    'actualGitCheckIgnoreExit': ignored.returncode, 'actualIgnoredOperativeFileCount': 0,
    'normalCodeBindings': script_code, 'fourNativeOriginalIndexByteCheck': bind(indexed),
    'wholeCurrent479AndKinds394Preserved': True, 'all394HumanQAFieldsPreserved': True,
    'allSource35AndPartner30DutiesRetained': True, 'semanticApproval': False, 'activeWrites': 0})

# Preserve the FIRST-bound entry; final technical terminal information is additive.
FINAL_ENTRY = OWN / 'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json'
final = {**entry, 'preparedAt': NOW, 'originalTechnicalFirstEntry': bind(ENTRY), 'technicalFirst': bind(FIRST),
    'ordinaryCurrentP17Terminal': bind(PTERM), 'ordinaryCurrentP17Counts': {'approved': 0, 'needsHumanReview': 17, 'rejected': 0, 'blockingIssues': 0},
    'actualSchemaJsonAndPortabilityChecks': bind(contracts), 'fourNativeOriginalsIndexByteCheck': bind(indexed),
    'technicalFinalSealPath': SEAL.relative_to(ROOT).as_posix(),
    'remainingActualGates': ['Independent current D17/P17 native judgments and resolved findings',
        'Independent targeted reviews of 15 protected source/context changes',
        'Independent complete source/course judgments for all35 original duties/all30 partners; author candidate is not approval',
        'Real atomarity resolution for held430b plus separately reviewed companion/split and semantic-kind/Memory decisions',
        'Real full HE-LK mandatory/elective learner-route semantics remain separate from optional book-local witness',
        'Reviewed active integration, targeted binding checks, final central strict report/CQR303/LayerA/builds',
        'Human review/approval/trial remain separate release gates']}
write(FINAL_ENTRY, final)
files = [bind(path) for path in sorted(OWN.rglob('*')) if path.is_file() and path != SEAL]
write(SEAL, {'schemaVersion': 1, 'createdAt': NOW, 'role': 'Technical author final byte seal, no scientific or human approval',
    'neutralEntry': bind(FINAL_ENTRY), 'first': bind(FIRST), 'files': files, 'fileCount': len(files),
    'actualNormalWholeModelPages': 394, 'actualNativeGoalCounts': [17, 15], 'actualIndependentNativeResults': 0,
    'nativeSemanticApproval': False, 'sourceApproval': False, 'humanApproval': False, 'humanTrial': False,
    'newScientificClosures': 0, 'restoredStrictBindings': 0, 'strictGain': 0, 'activeWrites': 0})
for value in read(SEAL)['files']:
    verify(value)
print(json.dumps({'neutralEntry': bind(FINAL_ENTRY), 'finalSeal': bind(SEAL), 'fileCount': len(files),
    'wholeModels': [394, 394], 'nativeGoalCounts': [17, 15], 'actualCampaigns': 4,
    'actualP17NeedsHuman': 17, 'actualP17Blocking': 0, 'actualChangedPages': 19,
    'actualProtectedPageChanged': final['actualProtectedPageChangedIds'], 'ordinarySchemaChecks': len(checked),
    'actualIndexByteExact': 4, 'independentNativeReviews': 'PENDING', 'sourceSemantics': 'PENDING',
    'currentStrictBio': '299/394', 'strictGain': 0}))

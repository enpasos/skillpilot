#!/usr/bin/env python3
"""Targeted normal contracts and exact historical bytes; no review verdict."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess
import uuid
import jsonschema

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]

def read(path):
    return json.loads(path.read_text())

def bind(path):
    raw = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

def verify(row):
    path = ROOT / row['path']
    assert path.is_file() and not path.is_symlink(), row['path']
    got = bind(path)
    assert got['sha256'] == row.get('sha256', row.get('digest', '')).removeprefix('sha256:'), row['path']
    if 'bytes' in row:
        assert got['bytes'] == row['bytes'], row['path']
    return got

inventory_path = ROOT / 'tmp/m7-resumption-20261010/chem-next-gap-inventory/selected-available-seals.technical-own-file-check.json'
lineage = []
for row in read(inventory_path)['seals']:
    seal = verify(row['seal'])
    payload = read(ROOT / seal['path'])
    own = next(payload[k] for k in ['files', 'outputs', 'ownWholeFiles', 'ownRegularFiles'] if k in payload)
    checked = [verify(file) for file in own]
    assert len(checked) == row['ownFrozenFilesChecked']
    lineage.append({'seal': seal, 'ownFrozenFilesActuallyChecked': len(checked), 'errors': [], 'scope': 'own bytes only, no old canonical-context validity renewal'})
assert sum(row['ownFrozenFilesActuallyChecked'] for row in lineage) == 98
source_lineage = []
for package, name in [
    ('chemie-b007-seven-native-source-independent-a-v3', 'source-native-independent-a.final.freeze.json'),
    ('chemie-b007-seven-native-source-independent-b-v3', 'independent-b.native-source-v3.final.freeze.json'),
]:
    path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06' / package / name
    payload = read(path)
    checked = [verify(file) for file in payload['files']]
    source_lineage.append({'seal': bind(path), 'ownFrozenFilesActuallyChecked': len(checked), 'errors': [], 'newReviewApproval': False})

schemas = []
for file, schema in [
    ('candidate/canonical.baseline517.snapshot.json', 'docs/landscape-runtime.schema.json'),
    ('candidate/canonical.candidate523.inactive.json', 'docs/landscape-runtime.schema.json'),
    ('candidate/semantic-kinds.baseline517.snapshot.json', 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'),
    ('candidate/semantic-kinds.candidate523.inactive.json', 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'),
    ('candidate/all-atoms.review-only.view.json', 'contracts/curriculum-package/v1/composition-view.schema.json'),
    ('candidate/he8-six-routines.prospective-source.view.json', 'contracts/curriculum-package/v1/composition-view.schema.json'),
    ('candidate/he-seki-existing-source-view.bounded-candidate.json', 'contracts/curriculum-package/v1/composition-view.schema.json'),
    ('materials/six-positive-evidence-v2.config.json', 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'),
    ('candidate/candidate-six.batch.config.json', 'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json'),
    ('candidate/baseline-two.batch.config.json', 'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json'),
]:
    errors = list(jsonschema.Draft202012Validator(read(ROOT / schema)).iter_errors(read(HERE / file)))
    assert not errors, [(file, error.message) for error in errors]
    schemas.append({'input': bind(HERE / file), 'schema': bind(ROOT / schema), 'errors': []})
p_validator = jsonschema.Draft202012Validator(read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
records = [json.loads(line) for line in (HERE / 'materials/six-positive-evidence-v2.author.jsonl').read_text().splitlines() if line.strip()]
assert len(records) == 6
for record in records:
    errors = list(p_validator.iter_errors(record))
    assert not errors, [error.message for error in errors]
    assert record['status'] == 'needs_human_review' and record['reviewAuthority'] == 'ai_candidate'
    assert record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1'
    assert not record['reviewRunIds'], 'No author run may be represented as independent review'

prior_cases = read(ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-routines-four-material-corrections-author-v2/cases.de-en.author-candidate.json')['cases']
selected_cases = read(HERE / 'materials/twelve-whole-cases.de-en.unchanged.json')['cases']
assert len(selected_cases) == 12
assert all(case == next(old for old in prior_cases if old['caseLocalKey'] == case['caseLocalKey']) for case in selected_cases)
assert all(case['recordStatus'] == 'ai_candidate' and case['validationStatus'] == 'needs_human_review' and not case['actualLearnerPerformanceRecorded'] for case in selected_cases)
old_cards = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-routines-four-material-corrections-author-v2/primary-cards.de-en.author-candidate.json'
assert read(old_cards) == read(HERE / 'materials/two-whole-primary-cards.de-en.unchanged.json')
deck_path = ROOT / 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_basics_seki.de.json'
stock_ids = {card['id'] for card in read(deck_path)['cards']}
card_checks = []
for decision in read(HERE / 'materials/six-individual-memory-decisions-and-two-card-bindings.author.json')['routineDecisions']:
    for card in decision['cardBindingIntents']:
        expected = str(uuid.uuid5(uuid.UUID(card['nativeCandidateOriginGoalId']), 'primary-card:' + card['cardLocalKey']))
        assert card['candidateCardId'] == expected and expected not in stock_ids
        card_checks.append({'originGoalId': card['nativeCandidateOriginGoalId'], 'cardId': expected, 'noExistingCardCollision': True, 'active': False, 'nativeVisibilityApproval': False})
assert len(card_checks) == 2

guard = read(HERE / 'current-inputs-and-preservation.author.json')
verify(guard['liveBaselineAtAuthoring'])
verify(guard['liveKindsAtAuthoring'])
candidate = read(HERE / 'candidate/canonical.candidate523.inactive.json')
baseline = read(HERE / 'candidate/canonical.baseline517.snapshot.json')
by_id = {goal['id']: goal for goal in candidate['goals']}
assert all(goal['id'] in by_id for goal in baseline['goals'])
assert set(guard['currentStrictGoalIds']) <= set(by_id)
assert not set(guard['currentStrictGoalIds']) & {'7be6f951-a614-52dc-94d3-2ce0d33765ff', '53fd1bfd-facb-54ae-b2dc-f667ed1414fc'}

# The author package itself has no symlinks or ignored operational files.
own_paths = [path for path in HERE.rglob('*') if path.is_file()]
assert not any(path.is_symlink() for path in HERE.rglob('*'))
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(path.relative_to(ROOT).as_posix() for path in own_paths) + '\n', text=True, capture_output=True, cwd=ROOT)
assert ignored.returncode in [0, 1] and not ignored.stdout.strip(), ignored.stdout

required_inputs = []
for configured in ['candidate/baseline-native-book.config.json', 'candidate/candidate-native-book.config.json']:
    config = read(HERE / configured)
    for key in ['landscapePath', 'compositionViewPath', 'semanticKindLedgerPath', 'goalVisualizationQaPath']:
        path = ROOT / config[key]
        assert path.is_file() and path.is_relative_to(ROOT) and not path.is_symlink(), config[key]
        required_inputs.append(bind(path))
    for configured in config['evidenceReviewPaths']:
        required_inputs.append(bind(ROOT / configured))
required_inputs.extend([bind(deck_path), bind(old_cards)])
for goal_id in ['7be6f951-a614-52dc-94d3-2ce0d33765ff', '53fd1bfd-facb-54ae-b2dc-f667ed1414fc']:
    required_inputs.append(bind(ROOT / f'app/public/assets/goal-visualizations/chemie/{goal_id}/{goal_id}.jpg'))
required_inputs = list({row['path']: row for row in required_inputs}.values())
check = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(row['path'] for row in required_inputs) + '\n', text=True, capture_output=True, cwd=ROOT)
assert check.returncode in [0, 1] and not check.stdout.strip(), check.stdout
result = {
    'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'role': 'targeted author portability/normal contracts and historical byte verification; no independent scientific review',
    'historical98OwnFileChecks': lineage, 'priorSourceReviewOwnFileChecks': source_lineage,
    'normalClosedSchemaChecks': schemas, 'normalPRecords': len(records), 'PApproved': 0,
    'wholeCasesExact': 12, 'wholeCardBodiesExact': 2, 'individualCardBinderChecks': card_checks,
    'currentLiveCanonicalAndKindsUnmodified': True, 'allOriginal517IDsRetained': True, 'strict206IDsRetained': True,
    'requiredPortableInputBindings': required_inputs, 'ownSymlinkCount': 0, 'requiredIgnoredInputs': [],
    'privatePrimaryPdfScratchRequiredForNativeExecution': False,
    'nativeSourceFinalApproval': False, 'activeWrites': False, 'strictGain': 0,
    'newScientificCompletions': 0, 'restoredActiveBindings': 0, 'humanApproval': False, 'humanTrial': False,
}
(HERE / 'checks/targeted-author-portability-lineage-and-schemas.actual.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'historicalFrozenOwnFilesExact': 98, 'sourceReviewFrozenOwnFilesExact': sum(row['ownFrozenFilesActuallyChecked'] for row in source_lineage), 'normalClosedSchemas': len(schemas), 'normalPositiveEvidenceCandidates': len(records), 'wholeCaseBodiesExact': 12, 'wholeCardBodiesExact': 2, 'requiredIgnoredInputs': [], 'strictGain': 0}))

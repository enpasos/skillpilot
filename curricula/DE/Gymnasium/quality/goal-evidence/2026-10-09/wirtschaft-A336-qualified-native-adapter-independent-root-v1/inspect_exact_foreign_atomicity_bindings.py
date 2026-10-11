"""Independent technical guards; preserve the existing scientific atomicity decisions."""
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import unicodedata

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
AUTHOR = BASE / 'wirtschaft-current-A336-exact311-and25-qualified-native-adapter-author-v1'
OUT = BASE / 'wirtschaft-A336-qualified-native-adapter-independent-root-v1'


def read(p):
    return json.loads(Path(p).read_text())


def binding(p):
    p = Path(p)
    raw = p.read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(raw).hexdigest(), 'wholeBytes': len(raw)}


def check(b):
    actual = binding(b['path'])
    assert actual['sha256'] == b['sha256'], b['path']
    if 'wholeBytes' in b:
        assert actual['wholeBytes'] == b['wholeBytes']
    return read(b['path'])


def member(value, pointer):
    assert pointer.startswith('$')
    rest = pointer[1:]
    while rest:
        m = re.match(r'^\.([A-Za-z_][A-Za-z_0-9]*)', rest)
        if m:
            value = value[m[1]]
        else:
            m = re.match(r'^\[(\d+)\]', rest)
            assert m, pointer
            value = value[int(m[1])]
        rest = rest[m.end():]
    return value


def normalized(value):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', str(value or ''))).strip()


def native_payload(goal):
    dimensions = goal.get('dimensionTags', {})
    return {'ruleVersion': 'semantic-atomicity-v1', 'goalId': goal['id'], 'shortKey': goal.get('shortKey') or '', 'title': normalized(goal.get('title')), 'titleEn': normalized(goal.get('titleEn')), 'description': normalized(goal.get('description')), 'descriptionEn': normalized(goal.get('descriptionEn')), 'phase': normalized(dimensions.get('phase')), 'area': normalized(dimensions.get('area')), 'topicCode': normalized(dimensions.get('topicCode')), 'nodeKind': normalized(goal.get('nodeKind'))}


def all_strings(value):
    if isinstance(value, dict):
        return [s for v in value.values() for s in all_strings(v)]
    if isinstance(value, list):
        return [s for v in value for s in all_strings(v)]
    return [value] if isinstance(value, str) else []


receipt_path = AUTHOR / 'actual-final-current-A336-exact311-and25-foreign-qualified-native-author-handoff.receipt.json'
receipt = read(receipt_path)
index = check(receipt['wholeTwentyfiveLiteralForeignScientificAndSemanticPayloadBindingIndex'])
config = check(receipt['wholeImportableConfig'])
can = check(receipt['wholeCurrentCAN485V13'])
goals = {g['id']: g for g in can['goals']}
whole_ledger_path = Path(receipt['wholeImportable336Ledger']['path'])
assert binding(whole_ledger_path) == receipt['wholeImportable336Ledger']
raw = whole_ledger_path.read_bytes()
old311 = Path(index['wholeExisting311']['path'])
assert binding(old311) == index['wholeExisting311']
assert raw.startswith(old311.read_bytes())
records = {r['goalId']: r for r in map(json.loads, raw.decode().splitlines())}
assert len(records) == 336
assert len(old311.read_text().splitlines()) == 311
scope = config['scope']['leafGoalIds']
assert len(scope) == 336 and set(scope) == set(records)
sem_path = BASE / 'wirtschaft-current485-V13-two-reviewed-requires-P336-SEM485-binding-only-author-v1/whole-SEM485-only-two-current-reviewed-requires-source-fingerprint-successors.json'
ordinary = {r['goalId'] for r in read(sem_path)['decisions'] if r['semanticKind'] == 'curricularAtomic'}
assert set(records) == ordinary
assert len(index['records']) == 25
rows = []
inputs = [receipt_path, whole_ledger_path, old311, Path(receipt['wholeImportableConfig']['path']), Path(receipt['wholeTwentyfiveLiteralForeignScientificAndSemanticPayloadBindingIndex']['path']), Path(receipt['wholeCurrentCAN485V13']['path']), sem_path, Path('app/scripts/semanticAtomicityReview.ts')]
for row in index['records']:
    scientific_file = check(row['wholeScientificDecisionFile'])
    actual_member = member(scientific_file, row['wholeScientificMemberPointer'])
    assert actual_member == row['wholeScientificMember']
    assert actual_member[row['foreignAtomicityField']] == row['foreignAtomicityDecision']
    assert row['foreignAtomicityDecision'] in ['atomic', 'KEEP', 'KEEP_ONE_CONNECTED_DEVELOPMENT_ANALYSIS']
    assert actual_member[row['foreignReasonField']] == row['foreignReasonExact']
    original_file = check(row['wholeOriginalReviewedGoalFile'])
    original_goal = member(original_file, row['wholeOriginalReviewedGoalPointer'])
    assert original_goal == row['wholeOriginalReviewedGoal']
    goal = goals[row['goalId']]
    assert goal == row['wholeCurrentGoal']
    before_payload = native_payload(original_goal)
    after_payload = native_payload(goal)
    assert before_payload == row['wholeOriginalNativeSemanticPayload']
    assert after_payload == row['wholeCurrentNativeSemanticPayload']
    assert before_payload == after_payload
    expected = 'sha256:' + hashlib.sha256(json.dumps(after_payload, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    native_record = records[row['goalId']]
    assert native_record == row['nativeRecord']
    assert native_record['fingerprint'] == expected
    assert native_record['reason'] == row['foreignReasonExact']
    assert native_record['status'] == 'atomic' and native_record['semanticAtomic'] is True
    science_receipt = check(row['wholeScientificFinalReceipt'])
    assert native_record['reviewer'] == science_receipt['reviewer']
    assert native_record['reviewedAt'] in all_strings(science_receipt)
    if row['goalId'] in ['f0b1bd59-a2ce-562b-bb63-6927f590dce2','2790f704-116b-577d-aca7-b502d57a21f6']:
        assert 'wirtschaft-BE21-independent-root-P6-ground-procedure' in row['wholeScientificDecisionFile']['path']
    inputs.extend(Path(row[key]['path']) for key in ['wholeScientificDecisionFile','wholeScientificFinalReceipt','wholeOriginalReviewedGoalFile'])
    rows.append({'goalId': row['goalId'], 'wholeScientificFile': row['wholeScientificDecisionFile'], 'memberPointer': row['wholeScientificMemberPointer'], 'literalForeignDecision': row['foreignAtomicityDecision'], 'literalReasonExact': True, 'originalReviewerAndReviewTimeExact': True, 'actualOriginalAndCurrentNativeSemanticPayloadExact': True, 'nativeFingerprintExact': True, 'technicalAdapterAccepted': True, 'newScientificApproval': False, 'humanApproval': False})
assert len(rows) == 25
inputs = sorted(set(inputs))
ignore = subprocess.run(['git','check-ignore','--stdin','-z'], input=b'\0'.join(str(p).encode() for p in inputs) + b'\0', capture_output=True)
assert ignore.returncode in (0, 1) and not ignore.stdout
spec = importlib.util.spec_from_file_location('schema_helpers', Path('scripts/validate_schemas.py'))
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)
symlinks = helper.curriculum_symlink_errors()
assert not symlinks
result = {'role': 'Independent Root exact native A336 adapter acceptance. Scientific atomicity judgments are reused, not recreated.', 'authorReceipt': binding(receipt_path), 'whole311RawPrefixExact': True, 'whole311PrefixBytes': len(old311.read_bytes()), 'whole336CurrentScopeMatchesQualifiedOrdinaryKinds': True, 'twentyfiveActualForeignScientificPayloadAndNativeBindingRows': rows, 'requiredWholeInputs': [binding(p) for p in inputs], 'ignoredRequiredInputs': [], 'curriculumSymlinkErrors': symlinks, 'newScientificAtomicityReviews': 0, 'SEMReplacesAtomicity': False, 'humanApproval': False, 'newStrictClosures': 0, 'strictNetGain': 0}
p = OUT / 'actual-independent-whole311-prefix-and25-literal-foreign-current-native-A-bindings.result.json'
assert not p.exists()
p.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
assert read(p) == result
print(json.dumps({'whole311PrefixBytesExact': len(old311.read_bytes()), 'currentScope': len(scope), 'literalQualifiedForeignJudgments': len(rows), 'semanticPayloadDeltas': 0, 'ignoredRequiredInputs': 0, 'curriculumSymlinkErrors': 0, 'newScientificReviews': 0, 'strictNetGain': 0}))

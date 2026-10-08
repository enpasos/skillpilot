from pathlib import Path
import json, hashlib, datetime, shutil, subprocess

root = Path('/home/enpasos/projects/skillpilot')
iso = Path('/tmp/skillpilot-wirtschaft-q2-monetary-social-seventeen-native-yvp_uv2p')
binding = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q2-monetary-social-seventeen-reviewed-translation-bindings-v1')
base = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q2-monetary-social-seventeen-native-preparation-technical-20261008-v1')
review = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q2-seventeen-independent-positive-parity-review-v1')
read = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert not (root / binding / 'native-full-successor-check.actual.json').exists()
freeze = read(root / base / 'native-d-q2-monetary-social-seventeen-final.prepared-freeze.actual.json')
frozen = freeze['byteExactReturnedNativeFiles']
assert len(frozen) == 28
for row in frozen:
    assert sha(root / row['path']) == sha(iso / row['path']) == row['sha256']

registry = read(root / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
econ = next(row for row in registry['subjects'] if row['subject'] == 'wirtschaftswissenschaften')
ids = set(read(root / base / 'native-d-q2-monetary-social-seventeen.final.batch.config.json')['goalIds'])
assert len(ids) == 17
full_review = read(root / review / 'independent-full-seventeen-positive-translation-AM-review.receipt.json')
observations = {row['goalId']: row for row in full_review['perGoalObservations']}
assert set(observations) == ids
assert full_review['reviewer']=='/root' and full_review['independentFromAuthor']=='/root/economics_gate_audit'
assert full_review['openFindings']==0 and full_review['findings']==[]
assert full_review['actualReading']['wholeGermanEnglishGoals']==17 and full_review['actualReading']['wholePositiveProfiles']==17 and full_review['actualReading']['wholeApplicationCases']==34
assert all(o['positiveAndTranslationDecision']=='KEEP' and o['actualIndependentObservation'] for o in observations.values())

(iso / binding).mkdir(parents=True, exist_ok=False)
staging = binding / 'native-fingerprint-staging-only'
(iso / staging).mkdir()
originals = {}
configs = {}
commands = []

def run(kind, script, config_path, stage):
    assert (root / script).read_bytes() == (iso / script).read_bytes()
    command = ['node', 'app/node_modules/tsx/dist/cli.mjs', script, '--config=' + str(config_path), '--mode=check']
    if stage == 'fingerprint-staging':
        command.append('--write-fingerprints')
    result = subprocess.run(command, cwd=iso, capture_output=True, text=True)
    for suffix, text in [('stdout', result.stdout), ('stderr', result.stderr)]:
        with (iso / binding / (kind + '.' + stage + '.' + suffix + '.txt')).open('x') as stream:
            stream.write(text)
    commands.append({'stage': stage, 'command': command, 'workingDirectory': str(iso), 'exitCode': result.returncode, 'nativeEntrypointSha256': sha(root / script)})
    print(result.stdout, result.stderr)
    assert result.returncode == 0

for kind, key in [('atomicity', 'semanticAtomicityConfigPath'), ('memory', 'memoryReviewConfigPath')]:
    old_config = read(root / econ[key])
    original_bytes = (root / old_config['reviewPath']).read_bytes()
    original_lines = original_bytes.splitlines(keepends=True)
    original = {json.loads(line)['goalId']: line for line in original_lines}
    assert len(original) == 303 and ids <= set(original)
    originals[kind] = (original_bytes, original_lines, original, econ[key])
    staged_records = staging / (kind + '.review.jsonl')
    (iso / staged_records).write_bytes(original_bytes)
    stage_config = dict(old_config, reviewPath=str(staged_records))
    if kind == 'memory':
        cards = staging / 'memory.cards.review.jsonl'
        (iso / cards).write_bytes((root / old_config['cardReviewPath']).read_bytes())
        stage_config['cardReviewPath'] = str(cards)
        stage_config['reportPath'] = str(staging / 'memory.report.md')
    stage_config_path = staging / (kind + '.config.json')
    write(iso / stage_config_path, stage_config)
    configs[kind] = old_config

# Use exactly the five real memory decks and the two configured learner views.
source = read(iso / econ['landscapePath'])
deck_paths = set()
for goal in source['goals']:
    if goal.get('nodeKind') == 'memory':
        for key in ['vocabularySource', 'vocabularySourceEn']:
            value = goal.get('extendedData', {}).get(key)
            if value:
                deck_paths.add(Path('app/public') / value.lstrip('/'))
view_paths = {Path(row['viewPath']) for row in configs['memory']['visibilityScopes']}
assert len(deck_paths) == 5 and len(view_paths) == 2
inputs = []
for path in sorted(deck_paths | view_paths):
    (iso / path).parent.mkdir(parents=True, exist_ok=True)
    if (iso / path).exists():
        assert (iso / path).read_bytes() == (root / path).read_bytes()
    else:
        shutil.copyfile(root / path, iso / path)
    inputs.append({'path': str(path), 'sha256': sha(root / path), 'bytes': (root / path).stat().st_size, 'role': 'actual_deck' if path in deck_paths else 'configured_visibility_view'})

retention = {}
for kind, script in [('atomicity', 'app/scripts/semanticAtomicityReview.ts'), ('memory', 'app/scripts/memoryCardReview.ts')]:
    run(kind, script, staging / (kind + '.config.json'), 'fingerprint-staging')
    staged = {json.loads(line)['goalId']: json.loads(line) for line in (iso / staging / (kind + '.review.jsonl')).read_text().splitlines()}
    old_bytes, old_lines, old_records, previous_config_path = originals[kind]
    assert set(staged) == set(old_records)
    merged = []
    for old_line in old_lines:
        old = json.loads(old_line)
        gid = old['goalId']
        if gid not in ids:
            merged.append(old_line)
            continue
        next_record = dict(old)
        next_record['fingerprint'] = staged[gid]['fingerprint']
        next_record['reviewer'] = '/root-independent-q2-translation-parity'
        observation = observations[gid]['semanticAtomicDecision' if kind == 'atomicity' else 'memoryDecision']
        next_record['reason'] = old['reason'] + ' Independently inspected unchanged DE and reviewed EN competence: ' + observation + '. Actual per-goal observation: ' + observations[gid]['actualIndependentObservation'] + '. Source: ' + str(review / 'independent-full-seventeen-positive-translation-AM-review.receipt.json') + '. No new full substantive A/M review is claimed.'
        merged.append((json.dumps(next_record, ensure_ascii=False, separators=(',', ':')) + '\n').encode())
    merged_bytes = b''.join(merged)
    target = binding / (kind + '.review.jsonl')
    (iso / target).write_bytes(merged_bytes)
    changed = {json.loads(line)['goalId'] for line in merged if line != old_records[json.loads(line)['goalId']]}
    assert changed == ids
    assert all(line == old_records[json.loads(line)['goalId']] for line in merged if json.loads(line)['goalId'] not in ids)
    candidate_config = dict(configs[kind], reviewPath=str(target))
    if kind == 'memory':
        candidate_cards = binding / 'memory.cards.review.jsonl'
        original_cards = (root / configs[kind]['cardReviewPath']).read_bytes()
        assert len(original_cards.splitlines()) == 51
        (iso / candidate_cards).write_bytes(original_cards)
        candidate_config['cardReviewPath'] = str(candidate_cards)
        candidate_config['reportPath'] = str(binding / 'memory.native-report.md')
    write(iso / binding / (kind + '.config.json'), candidate_config)
    run(kind, script, binding / (kind + '.config.json'), 'native-check')
    retention[kind] = {'ordinaryDecisions': 303, 'changedGoalIds': sorted(changed), 'unchangedRecordsByteExact': 286, 'previousConfigPath': previous_config_path, 'previousRecordsSha256': 'sha256:' + hashlib.sha256(old_bytes).hexdigest(), 'candidateRecordsSha256': 'sha256:' + hashlib.sha256(merged_bytes).hexdigest()}

for row in frozen:
    assert sha(root / row['path']) == sha(iso / row['path']) == row['sha256']
write(iso / binding / 'native-full-successor-check.actual.json', {'schemaVersion': 1, 'role': 'technical_reviewed_translation_and_metadata_binding_successor', 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'physicalIsolate': str(iso), 'independentlyReviewedTranslationSuccessors': 17, 'ordinaryDecisions': 303, 'unchangedRecordsByteExactPerGate': 286, 'cardsByteExact': 51, 'visibilityChecks': 98, 'actualInputs': inputs, 'commands': commands, 'gateRecordRetention': retention, 'independentReviewPaths': [str(review / 'independent-full-seventeen-positive-translation-AM-review.receipt.json')], 'nativeFingerprintMutationScope': 'new physical temporary staging files only; only 17 current bindings returned', 'independentSubstantiveReviewClaim': False, 'fullAMNewReviewClaim': False, 'humanApprovalClaimed': False, 'activeWrites': 0, 'newStrictClosures': 0, 'checkedFrozenOutputField': 'byteExactReturnedNativeFiles', 'byteExactReturnedNativeFileCount': 28, 'frozenRootAndIsolateHashesVerifiedBeforeAndAfter': True})
for path in (iso / binding).rglob('*'):
    if not path.is_file():
        continue
    destination = root / path.relative_to(iso)
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        assert destination.read_bytes() == path.read_bytes()
    else:
        shutil.copyfile(path, destination)
print('Q2-money-social17: native A303/M303/cards51/views98 PASS; 286 unrelated records per gate and cards51 byte-exact; frozen28 unchanged; no live integration.')

from pathlib import Path
import json, hashlib, datetime, shutil, subprocess

root = Path('/home/enpasos/projects/skillpilot')
iso = Path('/tmp/skillpilot-wirtschaft-company20-native-current191-cpy8d0q4')
binding = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e-company-twenty-reviewed-current-source-bindings-v1')
base = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e-company-twenty-native-preparation-technical-20261008-v1')
review = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e-company-twenty-independent-DEEN-P-AM-taxonomy-review-v1')
read = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert not (root / binding / 'native-full-successor-check.actual.json').exists()
assert read(root/base/'physical-isolate.initial.actual.json')['currentRootImageBaseline']==191
frozen = []
for name in ['native-d-e-company-twenty-final.prepared-freeze.actual.json']:
    frozen.extend(read(root / base / name)['byteExactReturnedNativeFiles'])
assert len(frozen) == 28
for row in frozen:
    assert sha(root / row['path']) == sha(iso / row['path']) == row['sha256']
registry = read(root / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
econ = next(row for row in registry['subjects'] if row['subject'] == 'wirtschaftswissenschaften')
assert 'wirtschaft-q4-twenty-seven-reviewed-current-source-bindings-v4/' in econ['semanticAtomicityConfigPath']
ids = set(read(root / base.parent / 'wirtschaft-e-company-twenty-reviewed-taxonomy-whole-author-v3/goal-ids.json'))
assert len(ids) == 20
full_review=read(root/review/'independent-whole-DEEN-P40-AM40-taxonomy20.actual.receipt.json')
assert sha(root/review/'independent-whole-DEEN-P40-AM40-taxonomy20.actual.receipt.json')=='sha256:d929d13c5121ce7dee3cd4d8df2655d21f956aa346b1e4e3fa9eb54fd67222d3'
closure_path=base.parent/'wirtschaft-e-company-twenty-independent-bounded-P2-taxonomy1-successor-review-v2/independent-bounded-two-whole-profile-one-taxonomy-successor.actual.receipt.json'
closure=read(root/closure_path);assert sha(root/closure_path)=='sha256:33406268f5453f4edbfba5a1d0db26ae6b46e965792a5e979688158ce5078ff9'
assert closure['aggregateInertProfileAcceptances']==closure['aggregateOwnTaxonomyProposalsAccepted']==20 and closure['aggregateExpectedCasesAccepted']==40 and closure['atomicity20Memory20AndPhysicalSevenCardSubstantiveVerdictsRetained']is True
observations={row['goalId']:row for row in full_review['goalReviews']};assert set(observations)==ids
assert all(o['wholeDeEnVerdict']=='retain_bilingual_candidate'and o['semanticAtomicityVerdict']=='retain_atomic'for o in observations.values())
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
    # Full native stdout/stderr retained locally; no verbose stream echo.
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
        next_record['reviewer'] = '/root/economics_visual_memory_audit'
        observation = 'atomic' if kind == 'atomicity' else observations[gid]['memoryVerdict']
        next_record['reviewedAt']=full_review['reviewedAt']
        next_record['reason']=old['reason']+' Actual independent whole-goal DE/EN, positive, taxonomy and A/M parity review: '+observation+'. Goal-specific independent observation: '+observations[gid]['substantiveReason']+' Individually reviewed SkillPilot taxonomy reason: '+observations[gid]['independentDemandLevelReason']+' Source: '+str(review/'independent-whole-DEEN-P40-AM40-taxonomy20.actual.receipt.json')+'. Both actual bounded P findings and taxonomy75 were subsequently independently closed at '+str(closure_path)+'. This technical preparer performs no independent substantive review or full303 new review.'
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
    retention[kind] = {'ordinaryDecisions': 303, 'changedGoalIds': sorted(changed), 'unchangedRecordsByteExact': 283, 'previousConfigPath': previous_config_path, 'previousRecordsSha256': 'sha256:' + hashlib.sha256(old_bytes).hexdigest(), 'candidateRecordsSha256': 'sha256:' + hashlib.sha256(merged_bytes).hexdigest()}

for row in frozen:
    assert sha(root / row['path']) == sha(iso / row['path']) == row['sha256']
write(iso / binding / 'native-full-successor-check.actual.json', {'schemaVersion': 1, 'role': 'technical_reviewed_source_translation_and_metadata_binding_successor', 'currentStrictBaseline': 191, 'priorOwnAMSuccessorExists': False, 'versionLabelExplanation': 'Initial own20 independently reviewed bilingual and individual taxonomy bindings on actual activeQ4-191; other283 current records retained byte exactly.', 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'physicalIsolate': str(iso), 'independentlyReviewedTranslationSuccessors': 20, 'ordinaryDecisions': 303, 'unchangedRecordsByteExactPerGate': 283, 'cardsByteExact': 51, 'visibilityChecks': 98, 'actualInputs': inputs, 'commands': commands, 'gateRecordRetention': retention, 'independentReviewPaths': [str(review/'independent-whole-DEEN-P40-AM40-taxonomy20.actual.receipt.json'),str(closure_path)], 'nativeFingerprintMutationScope': 'new physical temporary staging files only; only20 current bindings returned', 'independentSubstantiveReviewClaim': False, 'fullAMNewReviewClaim': False, 'humanApprovalClaimed': False, 'activeWrites': 0, 'newStrictClosures': 0, 'checkedFrozenOutputField': 'byteExactReturnedNativeFiles', 'byteExactReturnedNativeFileCount': 28, 'frozenRootAndIsolateHashesVerifiedBeforeAndAfter': True})
for path in (iso / binding).rglob('*'):
    if not path.is_file():
        continue
    destination = root / path.relative_to(iso)
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        assert destination.read_bytes() == path.read_bytes()
    else:
        shutil.copyfile(path, destination)
print('Company20 A/M-v1 current191: native A303/M303/cards51/views98PASS; own20 reviewed current bilingual/taxonomy bindings,283 other active records exact,cards51exact,28 freeze files untouched.')

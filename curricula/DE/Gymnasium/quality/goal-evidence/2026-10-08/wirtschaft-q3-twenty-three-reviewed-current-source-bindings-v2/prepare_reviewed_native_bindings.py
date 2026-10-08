from pathlib import Path
import json, hashlib, datetime, shutil, subprocess

root = Path('/home/enpasos/projects/skillpilot')
iso = Path('/tmp/skillpilot-wirtschaft-q3-twenty-three-native-kd_f3f9x')
binding = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q3-twenty-three-reviewed-current-source-bindings-v2')
base = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q3-twenty-three-native-preparation-technical-20261008-v1')
review = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q3-twenty-three-independent-positive-source-AM-review-v1')
read = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def write(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert not (root / binding / 'native-full-successor-check.actual.json').exists()
assert read(root / binding / 'current113-native-wholepage-parity.actual.json')['allWholePagesExactlyUnchanged']
frozen = []
for name in ['native-d-q3-global-currency-seventeen-final.prepared-freeze.actual.json','native-d-q3-europe-integration-six-final.prepared-freeze.actual.json']:
    frozen.extend(read(root / base / name)['byteExactReturnedNativeFiles'])
assert len(frozen) == 56
for row in frozen:
    assert sha(root / row['path']) == sha(iso / row['path']) == row['sha256']
registry = read(root / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
econ = next(row for row in registry['subjects'] if row['subject'] == 'wirtschaftswissenschaften')
assert 'wirtschaft-q2-monetary-social-seventeen-reviewed-translation-bindings-v3/' in econ['semanticAtomicityConfigPath']
ids = set(read(root / base.parent / 'wirtschaft-q3-global-currency-integration-twenty-three-bilingual-positive-author-v2/goal-ids.json'))
assert len(ids) == 23
full_review = read(root / review / 'independent-full-twenty-three-positive-source-translation-AM-review.receipt.json')
observations = {row['goalId']: row for row in full_review['goalSpecificReviews']}
assert set(observations) == ids
assert full_review['reviewer']=='root-independent-integrator' and full_review['openFindings']==[]
assert full_review['wholeProfilesReviewed']==23 and full_review['wholeBilingualCasesReviewed']==46
assert full_review['wholeOriginalAtomicityRecordsReviewed']==23 and full_review['wholeOriginalMemoryRecordsReviewed']==23
assert all(o['translationParityAccepted'] and o['positiveCandidateAcceptedForMachineBinding'] and o['wholeDE_ENGoalAndAllProfileFieldsActuallyRead'] and o['twoWholeBilingualCasesActuallyRead'] and o['fullOriginalAtomicityAndMemoryRecordsActuallyRead'] and o['semanticAtomic'] and not o['openFindings'] for o in observations.values())
physical_goals={g['id']:g for g in read(iso/econ['landscapePath'])['goals']}
assert len(full_review['boundedFiveTaxonomyProposalsAcceptedAfterWholeOperationSourceAndProfileReview'])==5
for tax in full_review['boundedFiveTaxonomyProposalsAcceptedAfterWholeOperationSourceAndProfileReview']:
    assert physical_goals[tax['goalId']]['dimensionTags']['demandLevel']==tax['candidateDemandLevel']
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
        next_record['reviewer'] = 'root-independent-integrator'
        observation = 'atomic' if kind == 'atomicity' else observations[gid]['memoryDecisionRetained']
        next_record['reason'] = old['reason'] + ' Independently inspected current whole DE/EN competence, whole source-aligned profiles and five bounded metadata decisions: ' + observation + '. Actual per-goal observation: ' + observations[gid]['independentAtomicityMemoryParityFinding'] + ' Positive-context observation: ' + observations[gid]['independentPositiveFinding'] + '. Source: ' + str(review / 'independent-full-twenty-three-positive-source-translation-AM-review.receipt.json') + '. This technical binding cites the actual root per-goal source/semantic/memory impact review; the technical preparer performs no independent substantive review.'
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
    retention[kind] = {'ordinaryDecisions': 303, 'changedGoalIds': sorted(changed), 'unchangedRecordsByteExact': 280, 'previousConfigPath': previous_config_path, 'previousRecordsSha256': 'sha256:' + hashlib.sha256(old_bytes).hexdigest(), 'candidateRecordsSha256': 'sha256:' + hashlib.sha256(merged_bytes).hexdigest()}

for row in frozen:
    assert sha(root / row['path']) == sha(iso / row['path']) == row['sha256']
write(iso / binding / 'native-full-successor-check.actual.json', {'schemaVersion': 1, 'role': 'technical_reviewed_source_translation_and_metadata_binding_successor', 'currentStrictBaseline': 113, 'priorOwnAMSuccessorExists': False, 'versionLabelExplanation': 'Fresh initial own23 binding on current113, named v2 to align the requested current113 preparation lane; no historical own23 v1 or retention from a nonexistent file is claimed.', 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'physicalIsolate': str(iso), 'independentlyReviewedTranslationSuccessors': 23, 'ordinaryDecisions': 303, 'unchangedRecordsByteExactPerGate': 280, 'cardsByteExact': 51, 'visibilityChecks': 98, 'actualInputs': inputs, 'commands': commands, 'gateRecordRetention': retention, 'independentReviewPaths': [str(review / 'independent-full-twenty-three-positive-source-translation-AM-review.receipt.json')], 'nativeFingerprintMutationScope': 'new physical temporary staging files only; only 23 current bindings returned', 'independentSubstantiveReviewClaim': False, 'fullAMNewReviewClaim': False, 'humanApprovalClaimed': False, 'activeWrites': 0, 'newStrictClosures': 0, 'checkedFrozenOutputField': 'byteExactReturnedNativeFiles', 'byteExactReturnedNativeFileCount': 56, 'frozenRootAndIsolateHashesVerifiedBeforeAndAfter': True})
for path in (iso / binding).rglob('*'):
    if not path.is_file():
        continue
    destination = root / path.relative_to(iso)
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        assert destination.read_bytes() == path.read_bytes()
    else:
        shutil.copyfile(path, destination)
print('Q3-23 A/M-v2 current113: native A303/M303/cards51/views98PASS; own23 current reviewed bindings,280 other active records exact,cards51exact,56 freeze files untouched.')

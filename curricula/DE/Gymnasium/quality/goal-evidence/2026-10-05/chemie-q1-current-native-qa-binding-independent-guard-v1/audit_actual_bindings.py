#!/usr/bin/env python3
"""Read-only technical audit; writes additive evidence only beside this file."""
import collections
import datetime
import hashlib
import json
import pathlib
import re

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
OUT = pathlib.Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05'
CANDIDATE = BASE / 'chemie-q1-quantitative-reviewed-integration-candidate-v1'
INTEGRATION = BASE / 'chemie-biologie-ni-quantitative-integration-v1'
QA_PATH = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
CANONICAL_PATH = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
REVIEW_ROOT = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review'


def sha(path):
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def read(path):
    return json.loads(path.read_text())


def relative(path):
    return path.relative_to(ROOT).as_posix()


def write(name, value):
    destination = OUT / name
    assert not destination.exists(), f'Additive evidence already exists: {destination}'
    destination.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')


def verify_freeze(path, expected_sha):
    assert sha(path) == expected_sha, f'Freeze changed: {path}'
    manifest = read(path)
    rows = manifest['files']
    assert len(rows) == manifest['fileCount']
    assert len({row['path'] for row in rows}) == len(rows)
    for row in rows:
        target = ROOT / row['path']
        assert target.is_file() and not target.is_symlink(), str(target)
        assert sha(target) == row['sha256'], f'Frozen file changed: {target}'
        if 'bytes' in row:
            assert target.stat().st_size == row['bytes'], str(target)
    return {'path': relative(path), 'sha256': expected_sha,
            'actualVerifiedFileCount': len(rows), 'allPhysicalBytesExact': True}


def disposition(line):
    cells = re.findall(r'`([^`]+)`', line)[1:]
    for cell in cells:
        value = cell.strip().lower()
        if value in ('deferred_provider_limitation', 'deferred_quality_review'):
            return value
        if value == 'accepted' or value.startswith('accepted_') or value == 'approved':
            return 'accepted'
        if value.startswith(('imported', 'withdrawn', 'removed')):
            return 'other_final'
    return None


plan = read(CANDIDATE / 'guarded-apply-plan.json')
before_path = INTEGRATION / 'chemie.qa.before-native-current-binding.json'
after_path = INTEGRATION / 'chemie.qa.after-native-current-binding.json'
before, after = read(before_path), read(after_path)
qa_write = next(row for row in plan['writes'] if row['targetPath'] == relative(QA_PATH))
assert sha(before_path) == qa_write['afterSHA256']
assert before_path.read_bytes() == (ROOT / qa_write['sourcePath']).read_bytes()
assert after_path.read_bytes() == QA_PATH.read_bytes()
assert {k: v for k, v in before.items() if k != 'records'} == {
    k: v for k, v in after.items() if k != 'records'}
assert [row['goalId'] for row in before['records']] == [row['goalId'] for row in after['records']]
before_by_id = {row['goalId']: row for row in before['records']}
after_by_id = {row['goalId']: row for row in after['records']}
assert len(before_by_id) == len(before['records']) == len(after_by_id) == 379
differences = []
for goal_id, old in before_by_id.items():
    new = after_by_id[goal_id]
    assert old.keys() == new.keys()
    for field in old:
        if old[field] != new[field]:
            differences.append({'goalId': goal_id, 'field': field,
                                'before': old[field], 'after': new[field]})
            assert field == 'missingReason'
            assert old[field] == 'no_primary_link'
            assert new[field] == 'deferred_provider_limitation'
            assert old['visualizationState'] == new['visualizationState'] == 'missing'
            assert old['imageUrl'] == old['assetSha256'] == ''
            assert old.get('aiApproved', 'no') == old['humanApproved'] == 'no'
assert len(differences) == 17
changed_ids = {row['goalId'] for row in differences}
assert len(changed_ids) == 17
assert not changed_ids.intersection(plan['protectedStrict104GoalIds'])

# Scan every Markdown file selected by the actual native generator. All 17
# latest relevant rows have distinct review dates between Batch017/018, so
# locale filename tie-breaking cannot alter any of their final decisions.
catalog = []
historical_rows = collections.defaultdict(list)
for file in sorted(REVIEW_ROOT.rglob('chemie-*.md')):
    content = file.read_text()
    match = re.search(r'^(?:Review date|Date):\s*(\d{4}-\d{2}-\d{2})\s*$',
                      content, re.I | re.M)
    fallback = re.search(r'(\d{4}-\d{2}-\d{2})', file.name)
    date = match.group(1) if match else fallback.group(1) if fallback else ''
    catalog.append({'path': relative(file), 'sha256': sha(file), 'reviewDate': date})
    for number, line in enumerate(content.splitlines(), 1):
        identity = re.match(r'^\s*\|\s*`([0-9a-f]{8}-[0-9a-f-]{27,})`\s*\|', line, re.I)
        if not identity or identity.group(1) not in changed_ids:
            continue
        value = disposition(line)
        if value:
            historical_rows[identity.group(1)].append({
                'path': relative(file), 'sha256': sha(file), 'reviewDate': date,
                'line': number, 'actualUuidLeadingRow': line, 'disposition': value})
latest_evidence = []
for goal_id in sorted(changed_ids):
    rows = historical_rows[goal_id]
    assert rows
    newest_date = max(row['reviewDate'] for row in rows)
    newest = [row for row in rows if row['reviewDate'] == newest_date]
    assert len(newest) == 1, f'Ambiguous native latest disposition: {goal_id}'
    assert newest[0]['disposition'] == after_by_id[goal_id]['missingReason']
    assert newest[0]['path'].endswith('/chemie-batch-018.md')
    assert newest[0]['reviewDate'] == '2026-07-17'
    latest_evidence.append({'goalId': goal_id, 'latest': newest[0],
                            'allEarlierUuidLeadingFinalRows': [row for row in rows if row is not newest[0]],
                            'machineVRemainsOpen': True})

backup = INTEGRATION / 'chemistry-before-application' / relative(QA_PATH)
old_operative = {row['goalId']: row for row in read(backup)['records']}
assert len(old_operative) == 376
for goal_id in plan['protectedStrict104GoalIds']:
    assert old_operative[goal_id] == after_by_id[goal_id]
for goal_id in changed_ids:
    assert old_operative[goal_id] == after_by_id[goal_id]

canonical = read(CANONICAL_PATH)
canonical_by_id = {goal['id']: goal for goal in canonical['goals']}
assert CANONICAL_PATH.read_bytes() == (ROOT / plan['futureCanonicalSourcePath']).read_bytes()
old_canonical = {goal['id']: goal for goal in read(CANDIDATE / 'canonical.before.snapshot.json')['goals']}
for goal_id in plan['protectedStrict104GoalIds']:
    assert old_canonical[goal_id] == canonical_by_id[goal_id]
asset_checks = []
for record in after['records']:
    goal = canonical_by_id[record['goalId']]
    normalize = lambda value: re.sub(r'\s+', ' ', str(value or '')).strip()
    assert record['title'] == normalize(goal['title'])
    assert record['description'] == normalize(goal['description'])
    assert record['landscapeId'] == canonical['landscapeId']
    assert record['landscapePath'] == relative(CANONICAL_PATH)
    if record['visualizationState'] == 'missing':
        assert record['goalId'] in changed_ids
        assert not any(link.get('type') == 'goal-visualization' and
                       link.get('role', 'primary') == 'primary' for link in goal.get('resourceLinks', []))
        continue
    link = next(link for link in goal['resourceLinks'] if
                (link.get('type') == 'goal-visualization' or link.get('resourceType') == 'goal-visualization')
                and link.get('role', 'primary') == 'primary')
    assert record['imageUrl'] == link['url']
    url = link['url']
    assert url.startswith('/assets/goal-visualizations/chemie/')
    asset_suffix = url.removeprefix('/assets/goal-visualizations/')
    paths = [ROOT / 'app/public' / url.removeprefix('/'),
             ROOT / 'curricula/DE/Gymnasium/visualizations' / asset_suffix,
             ROOT / 'backend/src/main/resources/static' / url.removeprefix('/')]
    assert record['publicAssetPath'] == relative(paths[0])
    assert record['canonicalAssetPath'] == relative(paths[1])
    hashes = [sha(path) for path in paths]
    assert hashes[0] == hashes[1] == hashes[2]
    assert record['assetSha256'] == 'sha256:' + hashes[0]
    if record.get('aiApproved') == 'yes':
        assert record['aiApprovedAssetSha256'] == record['assetSha256']
    asset_checks.append({'goalId': record['goalId'], 'sha256': hashes[0],
                         'sourceFrontendBackendExact': True})
assert len(asset_checks) == 362

freezes = [verify_freeze(CANDIDATE / 'reviewed-integration.final.freeze.json',
                        'ff7876883da8135572b3650109bc5b11a0ba1f8a0d25b0c47db159214aca06b0')]
for source in read(CANDIDATE / 'all-independent-current-input-freezes.final-byte-verification.actual.json')['freezeVerifications']:
    freezes.append(verify_freeze(ROOT / source['freezePath'], source['freezeSHA256']))
assert sum(row['actualVerifiedFileCount'] for row in freezes) == 806
for item in plan['historicalPreservationGuards']:
    assert sha(ROOT / item['preservedPath']) == item['sha256']
inputs = read(INTEGRATION / 'chemie-native-current-binding.inputs-before.actual.json')['inputs']
unaffected = []
for item in inputs:
    if item['path'] != relative(QA_PATH):
        assert sha(ROOT / item['path']) == item['sha256']
        unaffected.append(item)
for item in plan['protectedOtherCanonicalFiles']:
    assert sha(ROOT / item['path']) == item['sha256']
    unaffected.append(item)
terminal = read(INTEGRATION / 'chemistry-current-native-qa-bindings.terminal.receipt.json')
assert terminal['exitCode'] == 0
assert terminal['command'] == ['app/node_modules/.bin/tsx',
                              'app/scripts/generateGoalVisualizationQaLedgers.ts', '--subject=chemie']
assert sha(INTEGRATION / 'chemistry-current-native-qa-bindings.stdout.txt') == terminal['stdoutSHA256']
assert sha(INTEGRATION / 'chemistry-current-native-qa-bindings.stderr.txt') == terminal['stderrSHA256']

write('fieldwise-independent-differences.actual.json', differences)
write('latest-seventeen-original-dispositions.actual.json', {
    'nativeSelectedMarkdownCatalog': catalog, 'latestCurrentSeventeen': latest_evidence,
    'scope': 'Historical status bindings only; no historical image science re-review.'})
write('frozen-original-science-and-assets-integrity.actual.json', {
    'physicallyVerifiedFreezes': freezes, 'totalFrozenFiles': 806,
    'availableRasterTriples': asset_checks,
    'historicalRasterAndPromptPreservationGuards': plan['historicalPreservationGuards'],
    'unaffectedNativeInputsAndForeignSubjects': unaffected})
write('independent-native-qa-bindings.final.actual.json', {
    'schemaVersion': 1, 'checkedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'kind': 'independent-read-only-current-native-chemistry-qa-status-binding-guard',
    'beforePath': relative(before_path), 'beforeSHA256': sha(before_path),
    'afterPath': relative(after_path), 'afterSHA256': sha(after_path),
    'actualWholeCurrentRecords': 379, 'allIdsOrderTopLevelAndOtherFieldsExact': True,
    'onlyChanges': {'field': 'missingReason', 'count': 17,
                    'before': 'no_primary_link', 'after': 'deferred_provider_limitation'},
    'allSeventeenExactlyRestoreWholePreviousOperativeRecords': True,
    'allSeventeenLatestHistoricalDispositionsActuallyVerified': True,
    'allSeventeenRemainMissingAndMachineVOpen': True,
    'all104WholePreviousCanonicalGoalsAndQARecordsExact': True,
    'allAvailable362SourceFrontendBackendAssetTriplesActuallyHashed': True,
    'allAIAndHumanFieldsExact': True, 'allHistoricalScience806PhysicalFrozenFilesExact': True,
    'nativeWriterExitCode': terminal['exitCode'], 'canonicalAndNativeCodeExact': True,
    'biologyMathematicsPhysicsCanonicalAndQAExact': True,
    'reviewer': '/root/chem_qa_native_guard', 'result': 'PASS', 'openTechnicalFindings': [],
    'newScientificCompletions': 0, 'newScientificApprovals': 0,
    'wholeCurrentM7OrCQR303Claimed': False,
    'humanApproval': False, 'humanTrial': False, 'activeWrites': 0})
print('PASS: 379 records; 17 historical missing-reason bindings; 104 protected goals; '
      '362 asset triples; 806 frozen science files; zero scientific or human approvals.')

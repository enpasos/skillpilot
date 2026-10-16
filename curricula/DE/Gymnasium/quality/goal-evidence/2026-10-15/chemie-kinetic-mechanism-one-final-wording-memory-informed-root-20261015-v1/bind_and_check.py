# SPDX-License-Identifier: Apache-2.0
"""One new informed M decision; actual unchanged stock binder and bounded check."""
import datetime
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

REPO = Path.cwd()
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(REPO).as_posix()
E15 = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15'
PREV = E15 / 'chemie-energy-three-final-wording-memory-targeted-informed-root-20261015-v1'
OLD_HOST = REPO / 'tmp/chemie-m7-resumed-20261015/energy-three-final-wording-memory-minimal-host-v1'
HOST = REPO / 'tmp/chemie-m7-resumed-20261015/kinetic-one-final-wording-memory-minimal-host-v1'
TARGET = '13838147-c26d-54ca-b9be-5f2f0b8e9de5'


def bind(path):
    path = Path(path)
    raw = path.read_bytes()
    return {'path': path.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def read(path):
    return json.loads(Path(path).read_text())


def write(name, value):
    path = OWN / name
    path.parent.mkdir(parents=True, exist_ok=True)
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    assert read(path) == value
    return path


def snapshot(root):
    return {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(root.rglob('*')) if p.is_file() and not p.is_symlink()}


def run(config_rel, mode):
    args = ['node', str(REPO / 'app/node_modules/tsx/dist/cli.mjs'), 'app/scripts/memoryCardReview.ts',
            '--config=' + config_rel, '--mode=check']
    if mode == 'bind':
        args.append('--write-fingerprints')
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    result = subprocess.run(args, cwd=HOST, capture_output=True, text=True)
    checks = OWN / 'checks'
    checks.mkdir(exist_ok=True)
    (checks / f'M422.{mode}.stdout.txt').write_text(result.stdout)
    (checks / f'M422.{mode}.stderr.txt').write_text(result.stderr)
    write(f'checks/M422.{mode}.command.actual.json', {
        'startedAtUTC': started, 'command': ['node', 'app/node_modules/tsx/dist/cli.mjs',
        'app/scripts/memoryCardReview.ts', '--config=' + config_rel, '--mode=check'] +
        (['--write-fingerprints'] if mode == 'bind' else []),
        'cwd': str(HOST.relative_to(REPO)), 'returncode': result.returncode,
        'stockScript': bind(REPO / 'app/scripts/memoryCardReview.ts')})
    assert result.returncode == 0, result.stderr + result.stdout[-4000:]
    return result


assert not HOST.exists()
science = read(OWN / 'FIRST.actual-final-138-wording-memory-judgment.json')
first_seal_path = OWN / 'FILES.FIRST-final-138-wording-M-science.seal.json'
first_seal = read(first_seal_path)
for item in first_seal['files']:
    assert bind(REPO / item['path']) == item
assert science['judgment']['goalId'] == TARGET
assert science['judgment']['status'] == 'no_memory_needed'
assert science['bindingBoundary']['normalMRecordsCreatedAtFIRST'] == 0
assert bind(REPO / science['wholeCanonical']['path']) == science['wholeCanonical']
config_path = PREV / 'config/M422.whole-ten-scopes.final-wording.config.json'
config = read(config_path)
assert len(config['visibilityScopes']) == 10
old_rows_path = REPO / config['reviewPath']
old_raw = old_rows_path.read_bytes()
original_lines = old_raw.splitlines(keepends=True)
assert len(original_lines) == 422
assert bind(old_rows_path) == science['oldM422Source']
cards_path = REPO / config['cardReviewPath']
cards_raw = cards_path.read_bytes()
assert len(cards_raw.splitlines()) == 75
assert bind(cards_path)['sha256'] == 'sha256:96f5d189f15a2bf72d2cb3f3302967b3e5a66ee90ccd70346f9caf4a8ef52ed3'
old_host_before = snapshot(OLD_HOST)
assert sum(p.stat().st_size for p in OLD_HOST.rglob('*') if p.is_file() and not p.is_symlink()) < 10 * 1024 * 1024
shutil.copytree(OLD_HOST, HOST, symlinks=True)
assert bind(HOST / 'app/scripts/memoryCardReview.ts')['sha256'] == bind(REPO / 'app/scripts/memoryCardReview.ts')['sha256']
shutil.copyfile(REPO / science['wholeCanonical']['path'], HOST / config['landscapePath'])
record_rel = REL + '/records/M422.original421-plus-one-final138-wording.review.jsonl'
config_rel = REL + '/config/M422.whole-ten-scopes.final138-wording.config.json'
pending_rows = []
old_target = None
for line in original_lines:
    record = json.loads(line)
    if record['goalId'] != TARGET:
        pending_rows.append(line)
        continue
    old_target = record
    current = {**record, **science['judgment'], 'fingerprint': 'pending-after-original-M-FIRST',
               'reviewedAt': science['completedAtUTC'], 'reviewer': science['reviewer'],
               'firstScienceSeal': bind(first_seal_path)}
    pending_rows.append((json.dumps(current, ensure_ascii=False, separators=(',', ':')) + '\n').encode())
assert old_target == science['oldM138Decision']
private_rows = HOST / record_rel
private_rows.parent.mkdir(parents=True, exist_ok=True)
private_rows.write_bytes(b''.join(pending_rows))
config['reviewPath'] = record_rel
config['reportPath'] = REL + '/checks/M422.report.not-written.md'
write('config/M422.whole-ten-scopes.final138-wording.config.json', config)
private_config = HOST / config_rel
private_config.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(REPO / config_rel, private_config)
assert (HOST / config['cardReviewPath']).read_bytes() == cards_raw

# Use the production fingerprint writer itself, then retain only the target row.
# Its temporary reserialization stays inside the private 5.5 MB execution host.
run(config_rel, 'bind')
bound = [json.loads(line) for line in private_rows.read_text().splitlines()]
new_target = next(row for row in bound if row['goalId'] == TARGET)
assert new_target['fingerprint'] != old_target['fingerprint']
assert new_target['status'] == science['judgment']['status']
assert new_target['reason'] == science['judgment']['reason']
final_lines = [(json.dumps(new_target, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
               if json.loads(line)['goalId'] == TARGET else line for line in original_lines]
assert sum(a == b for a, b in zip(original_lines, final_lines)) == 421
private_rows.write_bytes(b''.join(final_lines))
(HOST / config['cardReviewPath']).write_bytes(cards_raw)
final_path = REPO / record_rel
final_path.parent.mkdir(parents=True, exist_ok=True)
assert not final_path.exists()
final_path.write_bytes(b''.join(final_lines))
write('CAS.one-genuine-final138-M-decision.json', {
    'schemaVersion': 1, 'role': 'One new M science decision, not an automatic hash update',
    'FIRST': bind(OWN / 'FIRST.actual-final-138-wording-memory-judgment.json'),
    'FIRSTSeal': bind(first_seal_path), 'wholeBefore': old_target, 'wholeAfter': new_target,
    'other421RawLinesExact': True, 'all75CardRawLinesExact': True,
    'nativeFingerprintWriter': 'unchanged memoryCardReview.ts --write-fingerprints in private host',
    'privateReserializationRestoredToOriginalOther421And75BytesBeforeCheck': True})
checked = run(config_rel, 'check')
assert 'Ordinary atomic goals in scope: 422' in checked.stdout
counts = {line.split(':', 1)[0]: int(line.split(':', 1)[1].strip()) for line in checked.stdout.splitlines()
          if line.startswith(('Current no-memory decisions:', 'Current memory-required decisions:', 'Current needs developer review:'))}
assert sum(counts.values()) == 422 and counts['Current needs developer review'] == 0
assert 'Composition visibility scopes: 10' in checked.stdout
assert len(final_path.read_bytes().splitlines()) == 422
assert (HOST / config['cardReviewPath']).read_bytes() == cards_raw == cards_path.read_bytes()
assert old_rows_path.read_bytes() == old_raw
assert old_host_before == snapshot(OLD_HOST)
assert sum(a == b for a, b in zip(original_lines, final_path.read_bytes().splitlines(keepends=True))) == 421
host_bytes = sum(p.stat().st_size for p in HOST.rglob('*') if p.is_file() and not p.is_symlink())
assert host_bytes < 10 * 1024 * 1024
source_map = []
for alias in ['app/scripts/memoryCardReview.ts', config['cardReviewPath']] + [x['viewPath'] for x in config['visibilityScopes']]:
    assert (HOST / alias).read_bytes() == (REPO / alias).read_bytes()
    source_map.append({'normalHostAlias': alias, 'physicalRepositorySource': bind(REPO / alias)})
write('checks/REBUILD.final138-M1.minimal-host.json', {
    'schemaVersion': 1, 'executionHost': str(HOST.relative_to(REPO)), 'physicalBytes': host_bytes,
    'oldMinimalHost': str(OLD_HOST.relative_to(REPO)), 'oldMinimalHostRegularFilesUnchanged': True,
    'sourceTemplate': bind(PREV / 'bind_and_check.py'), 'sourceConfig': bind(config_path),
    'normalCanonicalAlias': config['landscapePath'], 'physicalFinalCanonical': science['wholeCanonical'],
    'newConfig': bind(REPO / config_rel), 'newRecords': bind(final_path), 'sourceMap': source_map,
    'dependenciesOnlySymlinkInIgnoredPrivateHost': 'app/node_modules -> repository app/node_modules',
    'noWholeRepositoryCopy': True})
write('NEUTRAL.final-M1-whole422-ten-scopes-pass.json', {
    'schemaVersion': 1, 'role': 'Actual new targeted M138 argument and native fingerprint/check on final wording',
    'canonical': science['wholeCanonical'], 'FIRSTSeal': bind(first_seal_path),
    'normalConfig': bind(REPO / config_rel), 'normalRecords': bind(final_path),
    'normalCheck': bind(OWN / 'checks/M422.check.command.actual.json'),
    'newMJudgments': 1, 'newMStatus': new_target['status'], 'ordinaryGoalsCurrent': 422,
    'visibilityScopes': 10, 'other421MRawLinesExact': True, 'all75CardRawLinesExact': True,
    'newCards': 0, 'otherGateVotes': 0, 'newSourceApprovals': 0, 'strictClosures': 0,
    'machineM7Granted': False, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0, 'gitWrites': 0})
print(json.dumps({'pass': True, 'newMJudgments': 1, 'status': new_target['status'],
                  'normalMemory': '422/422;10scopes', 'other421MRawLinesExact': True,
                  'all75CardRawLinesExact': True, 'oldFingerprint': old_target['fingerprint'],
                  'newFingerprint': new_target['fingerprint'], 'privateHostBytes': host_bytes,
                  'normalRecords': bind(final_path)}, ensure_ascii=False, indent=2))

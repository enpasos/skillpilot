#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Preflight exact bytes; apply only this explicit Chemie plan when requested."""
from pathlib import Path
import argparse, hashlib, json
OWN = Path(__file__).resolve().parent
SOURCE_ROOT = OWN.parents[6]
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p): return json.loads(Path(p).read_text())
def subject_spans(text):
    pos = text.index('[', text.index('"subjects"')) + 1
    decoder = json.JSONDecoder(); result = {}
    while True:
        while text[pos].isspace() or text[pos] == ',': pos += 1
        if text[pos] == ']': return result
        value, length = decoder.raw_decode(text[pos:]); result[value['subject']] = (pos, pos + length, value, text[pos:pos+length]); pos += length
def physical_parent(root, relative):
    current = root
    for name in Path(relative).parts[:-1]:
        current = current / name
        if current.is_symlink():
            original = current.resolve(); current.unlink(); current.mkdir()
            for child in original.iterdir():
                (current / child.name).symlink_to(child, target_is_directory=child.is_dir())
        else: current.mkdir(exist_ok=True)
    return root / relative

parser = argparse.ArgumentParser()
parser.add_argument('--target-root', type=Path, default=SOURCE_ROOT)
group = parser.add_mutually_exclusive_group()
group.add_argument('--apply', action='store_true')
group.add_argument('--simulate', action='store_true')
args = parser.parse_args()
target = args.target_root.resolve()
assert target.exists()
assert not args.simulate or target != SOURCE_ROOT, 'Simulation must be an explicit separate isolate'
plan = read(OWN / 'integration-plan.json')
assert len(plan['explicitFuture24DeltaFiles']) == 24 and len(plan['unchanged49PlannedInputs']) == 49
if args.apply:
    assert sha(SOURCE_ROOT / plan['futureCentralReceiptPath']) == plan['futureCentralReceiptSHA256']
    receipt = read(SOURCE_ROOT / plan['futureCentralReceiptPath'])
    assert receipt['actualExitCode'] == 0
    assert receipt['reportPath'] == plan['futureCentralReportPath']
    assert receipt['reportSHA256'] == plan['futureCentralReportSHA256']
    assert sha(SOURCE_ROOT / plan['futureCentralReportPath']) == receipt['reportSHA256']
    report = read(SOURCE_ROOT / plan['futureCentralReportPath'])['subjects'][0]
    assert report['subject'] == 'chemie' and report['strictComplete'] == 90 and report['denominator'] == 376 and not report['issues']
    assert set(plan['protectedCurrentStrict85GoalIds']).issubset(report['strictCompleteGoalIds'])
    assert set(report['strictCompleteGoalIds']) - set(plan['protectedCurrentStrict85GoalIds']) == set(plan['expectedFiveNewScientificGoalIds'])
for row in plan['explicitFuture24DeltaFiles']:
    assert sha(SOURCE_ROOT / row['prospectiveCopyPath']) == row['sha256']
    dest = target / row['futureActivePath']
    actual = sha(dest) if dest.exists() else None
    assert actual in {row['activeSHA256Before'], row['sha256']}, f'Current delta drift: {row["futureActivePath"]}'
for row in plan['unchanged49PlannedInputs']:
    assert sha(target / row['futureActivePath']) == row['sha256'], f'Unchanged planned input drift: {row["futureActivePath"]}'
for history in plan['bothImageHistories']:
    assert sha(SOURCE_ROOT / history['receiptPath']) == history['receiptSHA256']
    assert len(history['fourExactHistoricalInputs']) == 4
    for row in history['fourExactHistoricalInputs']:
        assert sha(SOURCE_ROOT / row['preservedCopyPath']) == row['sha256']
for row in plan['explicitArchivedOldImageRemovalPlan']:
    path = target / row['originalPath']
    assert not path.exists() or sha(path) == row['sha256']

registry = target / plan['centralRegistryPath']
current_text = registry.read_text(); before = subject_spans(current_text)
replacement = json.dumps(plan['proposedChemie'], ensure_ascii=False, indent=2).replace('\n', '\n    ')
old_raw = before['chemie'][3]
assert hashlib.sha256(old_raw.encode()).hexdigest() == plan['currentChemieRawEntrySHA256'] or old_raw == replacement, 'Current Chemie registry drift'
for subject, expected in plan['protectedMathPhysRawEntries'].items():
    assert hashlib.sha256(before[subject][3].encode()).hexdigest() == expected, f'Protected {subject} registry drift'
start, end = before['chemie'][:2]
next_text = current_text[:start] + replacement + current_text[end:]
after = subject_spans(next_text)
assert all(before[s][3] == after[s][3] for s in before if s != 'chemie')

write_count = 0; removal_count = 0
if args.apply or args.simulate:
    for row in plan['explicitFuture24DeltaFiles']:
        dest = physical_parent(target, row['futureActivePath'])
        if dest.exists() and not dest.is_symlink() and sha(dest) == row['sha256']: continue
        if dest.is_symlink(): dest.unlink()
        dest.write_bytes((SOURCE_ROOT / row['prospectiveCopyPath']).read_bytes()); write_count += 1
    for row in plan['explicitArchivedOldImageRemovalPlan']:
        dest = physical_parent(target, row['originalPath'])
        if dest.exists() or dest.is_symlink(): dest.unlink(); removal_count += 1
    registry = physical_parent(target, plan['centralRegistryPath'])
    if registry.is_symlink(): registry.unlink()
    registry.write_text(next_text)
    assert all(before[s][3] == subject_spans(registry.read_text())[s][3] for s in before if s != 'chemie')
print(json.dumps({'status': 'applied_exact_authorized_plan' if args.apply else 'simulated_exact_plan' if args.simulate else 'read_only_exact_preflight_passed',
    'targetRoot': str(target), 'plannedDeltaFiles': 24, 'changedDeltaFilesWritten': write_count, 'archivedOldJPGCopiesRemoved': removal_count,
    'protectedMathPhysAndUnrelatedBiologieRawRegistryEntriesExact': True, 'humanApproval': False,
    'activeWrites': write_count + removal_count + 1 if target == SOURCE_ROOT and args.apply else 0}))

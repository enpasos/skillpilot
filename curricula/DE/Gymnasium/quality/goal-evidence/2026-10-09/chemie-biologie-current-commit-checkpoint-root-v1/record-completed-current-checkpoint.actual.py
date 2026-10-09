#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind completed ordinary checks and exact current goal sets without a new review."""
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = OUT.parent

def read(path):
    return json.loads(path.read_text())

def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def verify(binding):
    actual = bind(ROOT / binding['path'])
    assert actual['sha256'] == binding['sha256'].removeprefix('sha256:')
    assert actual['bytes'] == binding['bytes']

central_path = OUT / 'central.stdout.actual.txt'
text = central_path.read_text()
central = json.loads(text[text.index('{'):])
subjects = {r['subject']: r for r in central['subjects']}
baseline_path = BASE / 'chemie-biologie-current-resumption-root-v1/resume-baseline.actual.json'
baseline = {r['subject']: r for r in read(baseline_path)['subjects']}
fourteen_path = BASE / 'biologie-upper-science-fourteen-reviewed-integration-root-v1/strict-current-fourteen-new-closures.actual.json'
twentythree_path = BASE / 'biologie-molecular-genetics-reviewed-integration-root-v1/strict-current-twenty-three-new-closures.actual.json'
new14 = set(read(fourteen_path)['newScientificClosures'])
new23 = set(read(twentythree_path)['newStrictCurrentGoalIds'])
before = set(baseline['biologie']['strictCompleteGoalIds'])
after = set(subjects['biologie']['strictCompleteGoalIds'])
assert len(before) == 262 and len(after) == 299
assert before <= after and len(new14) == 14 and len(new23) == 23
assert not new14 & new23 and after - before == new14 | new23
assert subjects['biologie']['denominator'] == baseline['biologie']['denominator'] == 394
assert subjects['chemie']['denominator'] == 378 and subjects['chemie']['strictComplete'] == 177
for subject in ('mathematik', 'physik', 'chemie'):
    assert subjects[subject]['currentGoalIds'] == baseline[subject]['currentGoalIds']
    assert subjects[subject]['strictCompleteGoalIds'] == baseline[subject]['strictCompleteGoalIds']
previous_binding = read(twentythree_path)['previousCentralReport']
verify(previous_binding)
previous_text = (ROOT / previous_binding['path']).read_text()
previous_subjects = {s['subject']: s for s in json.loads(previous_text[previous_text.index('{'):])['subjects']}
assert subjects['wirtschaftswissenschaften'] == previous_subjects['wirtschaftswissenschaften']
assert subjects['mathematik']['strictCompletionReady'] and subjects['physik']['strictCompletionReady']
assert central['blockingIssueCount'] == 0
assert all(len(s['requiredChecks']) == 6 and all(r['status'] == 'pass' for r in s['requiredChecks']) and not s['issues'] for s in subjects.values())
checks = []
for key in ('central', 'images', 'layer-a', 'floors', 'schemas', 'publication-build'):
    p = OUT / (key + '.terminal.actual.json')
    receipt = read(p)
    assert receipt['actualExitCode'] == 0
    assert all(receipt['activeInputsUnchanged'].values())
    for binding in receipt['activeInputsBefore'].values():
        verify(binding)
    verify(receipt['stdout'])
    verify(receipt['stderr'])
    checks.append({'check': key, 'terminal': bind(p), 'actualExitCode': 0})
assert 'Checked 52535 files.' in (OUT / 'schemas.stdout.actual.txt').read_text()
books = (OUT / 'publication-build.stdout.actual.txt').read_text()
assert 'Goal-book publication ready: 5 books; 5 rendered;' in books
for name in ('mathematik', 'physik', 'chemie', 'biologie', 'wirtschaftswissenschaften'):
    assert 'Goal-book publication verified: de-gym-' + name + '-bundesweit' in books
evo = read(BASE / 'biologie-evolution-systematics-behavior-eighteen-whole-author-v1/neutral-whole18-source35-partners30-P18-cases36.author-independent-review.entry.json')
assert len(evo['selectedGoalIds']) == 18 and not set(evo['selectedGoalIds']) & after
proof_path = OUT / 'completed-current-checkpoint.all-ordinary-terminals-and-exact-ID-progress.actual.json'
assert not proof_path.exists()
proof = {'schemaVersion': 1, 'verifiedAt': datetime.now(timezone.utc).isoformat(), 'role': 'Completed current machine checkpoint with existing normal terminal evidence; no new independent scientific review', 'sourceCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(), 'central': bind(central_path), 'baselineBeforeCommitted37Closures': bind(baseline_path), 'normalTerminalChecks': checks, 'subjects': [{k: s[k] for k in ('subject', 'denominator', 'strictComplete', 'remaining', 'percentage', 'gates', 'strictCompletionReady')} for s in subjects.values()], 'newScientificBioClosuresSince262': sorted(new14 | new23), 'fourteenScientificProof': bind(fourteen_path), 'twentyThreeScientificProof': bind(twentythree_path), 'newScientificClosuresSince262': 37, 'restoredExistingStrictBindings': 0, 'all262OldStrictIdsRetained': True, 'sinceCurrent299CommitNewStrictClosures': 0, 'currentInactiveEvo18DisjointStrict299': True, 'normalSchemasFilesChecked': 52535, 'normalVerifiedBooks': 5, 'machineM7CompleteForChemieOrBiologie': False, 'humanApproval': False, 'humanTrial': False, 'remoteCiForCurrentNewWorkVerified': False, 'deploymentPerformed': False}
proof_path.write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n')
assert read(proof_path) == proof
print(json.dumps({'proof': bind(proof_path), 'Biologie': '299/394', 'Chemie': '177/378', 'newScientificSince262': 37, 'sinceCurrentCommit': 0, 'normalChecksPassed': len(checks), 'normalBooksVerified': 5}))

#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind two genuine targeted followups without upgrading whole/source/native gates."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = OUT.parent
sys.path.insert(0, str(ROOT / 'scripts'))
from validate_schemas import curriculum_symlink_errors
def read(p): return json.loads(p.read_text())
def bind(p):
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def write(name, value):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    assert read(p) == value
    return bind(p)
author_path = BASE / 'biologie-evolution-two-material-findings-author-successor-v1/neutral-whole18-two-material-findings-author-successor.targeted-independent-review.entry.json'
a_dir = BASE / 'biologie-evolution-two-material-findings-independent-a-followup-v1'
b_dir = BASE / 'biologie-evolution-two-material-findings-independent-b-followup-v1'
a_path = a_dir / 'neutral-completed-two-material-corrections-independent-A.followup.entry.json'
b_path = b_dir / 'neutral-completed-two-materials-independent-b.followup.entry.json'
author, a, b = [read(p) for p in (author_path, a_path, b_path)]
assert a['neutralAuthorEntry'] == b['neutralAuthorEntry']
assert a['neutralAuthorEntry']['sha256'].removeprefix('sha256:') == bind(author_path)['sha256']
findings = ['EVO18B-MATERIAL-001', 'EVO18B-MATERIAL-002']
assert a['resolvedFindingIds'] == [f['findingId'] for f in b['findingOutcomes']] == findings
assert all(f['status'] == 'resolved_on_exact_successor_material_only' for f in b['findingOutcomes'])
assert a['preservedWholeFrame'] == {'goals': 18, 'cases': 36, 'sourceDuties': 35, 'partners': 30, 'otherProfilesExact': 16, 'textFieldsActuallyChanged': 12}
av_path = a_dir / 'two-material-corrections.independent-A.science-FIRST.verdict.json'
bv_path = ROOT / b['scienceVerdict']['path']
av, bv = read(av_path), read(bv_path)
assert av['reviewer'] != bv['reviewer']
assert av['authorChecksAndPeerSuccessorVerdictsNotReadBeforeFIRST']
assert not bv['disclosedPriorKnowledge']['peerFollowupOrVerdictRead']
assert [r['findingId'] for r in av['casesAndProfiles']] == findings
assert all(r['decision'] == 'SUPPORTED' and r['findingStatusForThisSuccessor'] == 'RESOLVED' for r in av['casesAndProfiles'])
assert [r['findingId'] for r in bv['targetedFindings']] == findings
assert bv['twoMaterialCorrectionsIndependentlyScientificallyAccepted'] and not bv['newMaterialHoldFindings']
assert b['remainingAtomarityFindingExact'] == author['remainingAtomarityFindingExact']
assert b['remainingSourceAndCourseHoldsExact'] == author['remainingSourceAndCourseHoldsExact']
assert len(author['remainingSourceAndCourseHoldsExact']) == 7
a_terminal = ROOT / a['normalP2Terminal']['path']
b_terminal = b_dir / 'normal-check-P2.terminal.actual.json'
assert read(a_terminal)['exitCode'] == read(b_terminal)['exitCode'] == 0
for j in (a, b):
    assert not j['humanApproval'] and not j['humanTrial'] and j['strictGain'] == 0
    assert not j['currentNativeDPApproval'] and not j['wholeSourceApproval']
inputs = [author_path, a_path, b_path, av_path, bv_path, a_terminal, b_terminal,
          a_dir / 'two-material-corrections.independent-A.final.freeze.json',
          b_dir / 'two-materials.independent-b.followup.final.freeze.json']
seen, verified = set(), []
def verify(value):
    if isinstance(value, dict):
        path, sha = value.get('path'), value.get('sha256')
        if isinstance(path, str) and isinstance(sha, str) and len(sha.removeprefix('sha256:')) == 64:
            assert not Path(path).is_absolute(), path
            key = (path, sha)
            if key not in seen:
                seen.add(key)
                p = ROOT / path
                assert p.is_file() and not p.is_symlink(), path
                actual = bind(p)
                assert actual['sha256'] == sha.removeprefix('sha256:'), path
                if isinstance(value.get('bytes'), int): assert actual['bytes'] == value['bytes'], path
                tracked = subprocess.run(['git', 'ls-files', '--error-unmatch', '--', path], cwd=ROOT, capture_output=True).returncode == 0
                ignored = subprocess.run(['git', 'check-ignore', '--quiet', '--', path], cwd=ROOT).returncode == 0
                assert tracked or not ignored, path
                if p.suffix == '.json': read(p)
                if p.suffix == '.jsonl':
                    for line in p.read_text().splitlines():
                        if line.strip(): json.loads(line)
                verified.append(actual)
        for child in value.values(): verify(child)
    elif isinstance(value, list):
        for child in value: verify(child)
for p in inputs:
    verify(bind(p))
    verify(read(p))
assert not curriculum_symlink_errors(ROOT)
first = write('two-material-followups.technical-input.freeze.json', {
    'schemaVersion': 1, 'role': 'Actual genuine A and B targeted followups, not a new whole review',
    'inputs': [bind(p) for p in inputs], 'verifiedBindings': verified, 'normalSymlinkErrors': []})
result = write('two-material-findings.actual-independent-followup-pair.json', {
    'schemaVersion': 1, 'inputFirst': first, 'reviewers': [av['reviewer'], bv['reviewer']],
    'resolvedFindingIdsOnlyForExactSuccessor': findings,
    'currentWhole18Cases36Successor': author['wholeMaterials18Cases36Successor'],
    'currentNormalP18Config': author['normalP18Config'],
    'currentNormalP18CandidateRecords': author['normalP18CandidateRecords'],
    'unchangedSixteenPriorWholeReviewsRetained': True,
    'wholeFrame': {'goals': 18, 'bilingualCases': 36, 'sourceDuties': 35, 'partners': 30},
    'remainingAtomarityFindingExact': author['remainingAtomarityFindingExact'],
    'remainingSourceAndCourseHoldsExact': author['remainingSourceAndCourseHoldsExact'],
    'originalFindingsAndReviewsUnchanged': True, 'currentNativeDPApproval': False,
    'wholeSourceCourseApproval': False, 'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review',
    'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'humanApproval': False, 'humanTrial': False,
    'strictGain': 0, 'newScientificM7Closures': 0, 'restoredM7Bindings': 0, 'activeWrites': []})
entry = write('neutral-completed-two-material-findings.genuine-pair.entry.json', {
    'schemaVersion': 1, 'pair': result, 'materialFindingResolutions': 2,
    'remainingSourceHolds': 7, 'remainingAtomarityHolds': 1,
    'nativeAndActiveIntegration': 'pending', 'strictGain': 0, 'humanApproval': False, 'activeWrites': []})
seal = write('two-material-followups.technical.final.freeze.json', {
    'schemaVersion': 1, 'entry': entry, 'outputs': [bind(p) for p in sorted(OUT.iterdir()) if p.is_file()], 'strictGain': 0})
print(json.dumps({'entry': entry, 'seal': seal, 'verifiedBindings': len(verified), 'resolvedMaterialFindings': 2, 'strictGain': 0}))

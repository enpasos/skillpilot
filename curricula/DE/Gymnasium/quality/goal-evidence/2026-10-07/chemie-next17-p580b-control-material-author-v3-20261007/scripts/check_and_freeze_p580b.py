#!/usr/bin/env python3
"""Bounded equality/binding check and one-time freeze. --check never writes."""
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
ROOT = OUT.parents[6]
BASE = OUT.parent / 'chemie-next17-targeted-description-routing-context-author-v2-20261007'
B = OUT.parent / 'chemie-next17-targeted-independent-d-b-p-binding-20261007-v1'
ID = '580b3616-f121-5d82-ac6b-fc24f145fbdc'
MANIFEST = OUT / 'final-own-files-and-reused-inputs.freeze.json'

def read(path):
    return json.loads(path.read_text())

def pin(path, relative_to=ROOT):
    b = path.read_bytes()
    return {'path': path.relative_to(relative_to).as_posix(), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def verify_directory(directory, freeze):
    data = read(directory / freeze)
    for entry in data['files']:
        assert pin(directory / entry['path'], directory) == entry, entry['path']
    actual = [p for p in directory.rglob('*') if p.is_file() and p.name != freeze]
    assert len(actual) == len(data['files'])
    return len(actual)

base_count = verify_directory(BASE, 'final-own-files.freeze.json')
b_count = verify_directory(B, 'final-own-files-and-reviewed-inputs.freeze.json')
inputs = read(OUT / 'inputs/reused-exact-inputs.manifest.json')
for expected in inputs['reusedInputs'] + [inputs['unchanged580bCurrentVisualizationAsset'], inputs['independentBFindingFreeze'], inputs['baseV2CompleteFreezeCheck']['manifest']]:
    assert pin(ROOT / expected['path']) == expected

old_profiles = read(BASE / 'candidate/positive-evidence17.author-candidate-set.json')['goals']
new_profiles = read(OUT / 'candidate/positive17.corrected-author-candidate-set.json')['goals']
assert len(old_profiles) == len(new_profiles) == 17
assert all(left == right for left, right in zip(old_profiles, new_profiles) if left['goalId'] != ID)
profile = next(g['profile'] for g in new_profiles if g['goalId'] == ID)
old_profile = next(g['profile'] for g in old_profiles if g['goalId'] == ID)
old_cases = read(BASE / 'candidate/complete34-bilingual-material-cases.author.json')['cases']
new_cases = read(OUT / 'candidate/complete34-bilingual-material-cases.author-v3.json')['cases']
assert len(old_cases) == len(new_cases) == 34
assert all(left == right for left, right in zip(old_cases, new_cases) if left['goalId'] != ID)
cases = [c for c in new_cases if c['goalId'] == ID]
old_target_cases = [c for c in old_cases if c['goalId'] == ID]
assert cases[1] == old_target_cases[1]
for key in cases[0]:
    if key != 'expectedPerformance':
        assert cases[0][key] == old_target_cases[0][key]

for brief, case in zip(profile['applicationCaseBriefs'], cases):
    for lang, suffix in [('de', 'De'), ('en', 'En')]:
        assert brief['taskDemand'+suffix] == case['material'][lang]+' '+case['taskDemand'][lang]
        assert brief['expectedPerformance'+suffix] == case['expectedPerformance'][lang]
        assert brief['understandingFocus'+suffix] == case['specificBoundaryOrCounterexample'][lang]
for lang, suffix in [('de', 'De'), ('en', 'En')]:
    assert profile['expectations'][0]['observablePerformance'+suffix] == cases[0]['expectedPerformance'][lang]
    assert ('feuchter Span' if lang == 'de' else 'damp splint') not in cases[0]['expectedPerformance'][lang]
diff = read(OUT / 'candidate/exact-control-sentence-diff.author-v3.json')
assert len(diff['profileChanges']) == 4 and len(diff['completeCaseChanges']) == 2
record_lines = (OUT / 'candidate/positive1.p580b.author-candidates.review.jsonl').read_text().splitlines()
assert len(record_lines) == 1
record = json.loads(record_lines[0])
old_record = next(json.loads(line) for line in (BASE / 'candidate/positive-evidence17.author-candidates.review.jsonl').read_text().splitlines() if json.loads(line)['goalId'] == ID)
assert record['goalId'] == ID and record['profile'] == profile
assert record['goalFingerprint'] == old_record['goalFingerprint']
assert record['reviewInputFingerprint'] == old_record['reviewInputFingerprint']
assert record['profileFingerprint'] != old_record['profileFingerprint']
assert record['reviewAuthority'] == 'ai_candidate' and record['status'] == 'needs_human_review'
assert record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1'
assert record['reviewRunIds'] == []
config = read(OUT / 'configs/positive1.p580b.author-candidates.config.json')
assert config['scope']['goalIds'] == [ID]
assert config['landscapePath'] == (BASE / 'candidate/canonical.whole-current-plus-targeted-corrections.json').relative_to(ROOT).as_posix()
report = {
    'documentType': 'Bounded AUTHOR equality and binding verification; no substantive or independent closure',
    'checkedAtUTC': datetime.now(timezone.utc).isoformat(), 'status': 'PASS',
    'targetedGoalId': ID, 'nativePRecordCount': 1, 'other16WholeProfileCandidateSpecsUnchanged': True,
    'other32MaterialCasesUnchanged': True, 'targetCase2WholeUnchanged': True,
    'targetCase1MaterialTaskAndBoundaryUnchanged': True,
    'targetProfileResponseStringChanges': 4, 'targetCompleteCaseResponseStringChanges': 2,
    'fullBilingualTwoCasesBoundExactly': True,
    'v2CompleteFreezeVerifiedFiles': base_count, 'bCompleteFreezeVerifiedFiles': b_count,
    'reusedNativeD17InputsAndBooksUnchanged': True, 'nativeDRebuild': False,
    'unchangedGoalFingerprint': record['goalFingerprint'],
    'unchangedReviewInputFingerprint': record['reviewInputFingerprint'],
    'oldProfileFingerprint': old_record['profileFingerprint'], 'newProfileFingerprint': record['profileFingerprint'],
    'nativePAuthority': 'ai_candidate / needs_human_review / E1G1; reviewRunIds empty',
    'strictNetGain': 0, 'humanApproval': False, 'independentApproval': False,
    'nextGate': 'New targeted independent A and B P580b judgments on this exact correction; previous revise is not self-closed by the author.',
}
if sys.argv[1:] == ['--check']:
    data = read(MANIFEST)
    actual = [pin(p, OUT) for p in sorted(OUT.rglob('*')) if p.is_file() and p != MANIFEST]
    assert actual == data['files']
    print(json.dumps({'status': 'PASS', 'ownFiles': len(actual), 'v2FilesUnchanged': base_count, 'bFilesUnchanged': b_count, 'manifestSha256': hashlib.sha256(MANIFEST.read_bytes()).hexdigest()}))
else:
    assert not MANIFEST.exists(), 'Refusing to rewrite sealed dossier'
    (OUT / 'qa-artifacts/single-fault-material-profile-d-reuse.check.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    files = [pin(p, OUT) for p in sorted(OUT.rglob('*')) if p.is_file() and p != MANIFEST]
    sealed = {
        'documentType': 'Final own files and exact reused external-input freeze for AUTHOR P580b v3; excludes only this manifest',
        'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'role': 'AUTHOR',
        'authority': 'ai_candidate', 'status': 'needs_human_review', 'strictNetGain': 0,
        'humanApproval': False, 'independentApproval': False,
        'fileCount': len(files), 'totalBytes': sum(f['bytes'] for f in files), 'files': files,
        'reusedInputManifest': pin(OUT / 'inputs/reused-exact-inputs.manifest.json'),
        'v2Freeze': inputs['baseV2CompleteFreezeCheck']['manifest'],
        'bFindingFreeze': inputs['independentBFindingFreeze'],
        'newProfileFingerprint': record['profileFingerprint'],
        'nextGate': report['nextGate'],
    }
    MANIFEST.write_text(json.dumps(sealed, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps({'status': 'SEALED AUTHOR CANDIDATE', 'ownFiles': len(files), 'bytes': sealed['totalBytes'], 'manifestSha256': hashlib.sha256(MANIFEST.read_bytes()).hexdigest()}))

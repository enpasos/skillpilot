#!/usr/bin/env python3
"""Record already completed independent component judgments with ordinary candidate status.

No independent native/image approval, original record alteration or active write.
"""
import datetime
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
AUTHOR = HERE.parent / 'biologie-evolution-systematics-behavior-eighteen-whole-author-v1'
CHECKS = HERE / 'checks'

def bind(path):
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(path, obj):
    assert not path.exists(), f'Immutable existing output: {path}'
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return bind(path)

first = json.loads((HERE / 'whole18-source35-partners30-P18-cases36.independent-c.scientific-FIRST.verdict.json').read_text())
assert first['counts']['supportedBoundedMaterials'] == 18
decisions = {r['goalId']: r for r in first['goalDecisions']}
original_records = [json.loads(s) for s in (AUTHOR / 'eighteen-whole-positive.author-candidate.review.jsonl').read_text().splitlines() if s.strip()]
review_id = HERE.name
timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
records = []
for original in original_records:
    r = json.loads(json.dumps(original))
    r.update({
        'reviewId': review_id,
        'reviewer': 'Codex /root/biology_resume_candidate, actual independent C whole-text/source/material reviewer; model variant not exposed',
        'reviewedAt': timestamp,
        'reason': 'Actual independent whole DE/EN competence, two whole synthetic cases, worked transfers and pair-level rubrics reviewed in immutable scientific FIRST. ' + decisions[r['goalId']]['independentReason'] + ' This supports the bounded material/profile body only. Current native pages, images, operative source/course/placement boundaries and human approval remain pending; no real learner performance or experiment is certified.',
        'status': 'needs_human_review',
        'reviewAuthority': 'ai_candidate',
        'evidenceLevel': 'E1',
        'maximumClaimScope': 'G1',
        'reviewRunIds': [],
        'dissent': [],
    })
    for k in ['goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint', 'reviewCriteriaFingerprint', 'profile']:
        assert r[k] == original[k]
    records.append(r)
records_path = CHECKS / 'P18-bounded-whole-text.independent-c.records.jsonl'
assert not records_path.exists()
records_path.write_text(''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in records))
config = json.loads((AUTHOR / 'eighteen-whole-positive.author-candidate.config.json').read_text())
config.update({'reviewId': review_id, 'reviewPath': str(records_path.relative_to(ROOT)), 'requireApproved': False, 'reviewRunManifestPaths': []})
config['scope']['label'] = 'Independent C bounded whole18 text/material bodies; original fingerprints retained; images/native/source placement pending'
config_path = CHECKS / 'P18-bounded-whole-text.independent-c.config.json'
write(config_path, config)
argv = ['app/node_modules/.bin/tsx', 'app/scripts/positiveGoalEvidenceReview.ts', '--mode=check', '--config=' + str(config_path.relative_to(ROOT))]
p = subprocess.run(argv, cwd=ROOT, capture_output=True, check=False)
stdout_path = CHECKS / 'P18-bounded-whole-text.independent-c.ordinary-check.actual.stdout.txt'
stderr_path = CHECKS / 'P18-bounded-whole-text.independent-c.ordinary-check.actual.stderr.txt'
assert not stdout_path.exists() and not stderr_path.exists()
stdout_path.write_bytes(p.stdout)
stderr_path.write_bytes(p.stderr)
terminal = write(CHECKS / 'P18-bounded-whole-text.independent-c.ordinary-check.actual.terminal.json', {
    'schemaVersion': 1, 'role': 'Actual ordinary P18 candidate-schema/semantic checker, not a native or human approval',
    'argv': argv, 'actualExitCode': p.returncode, 'stdout': bind(stdout_path), 'stderr': bind(stderr_path),
    'config': bind(config_path), 'records': bind(records_path), 'ownScientificFirst': bind(HERE / 'whole18-source35-partners30-P18-cases36.independent-c.scientific-FIRST.verdict.json'),
    'recordStatusCounts': {'needs_human_review': 18, 'approved': 0}, 'actualReviewRunManifestCount': 0,
    'profileBodiesAndAllFourOriginalFingerprintsExact': True, 'currentNativeOrRasterReview': False, 'humanApproval': False, 'activeWrites': [],
})
assert p.returncode == 0, p.stderr.decode()

primary_outputs = []
for key, pdf, pages in [
    ('HH', ROOT / 'curricula/DE/Gymnasium/input/HH/biologie-gym-seki-data.pdf', [27]),
    ('HE', AUTHOR / 'primary/HE-current2025.actual-official.pdf', [38, 40, 42]),
]:
    for page in pages:
        out = HERE / f'primary/{key}-physical-{page:03d}.independent-layout.actual.txt'
        assert not out.exists()
        extract_argv = ['pdftotext', '-layout', '-f', str(page), '-l', str(page), str(pdf.relative_to(ROOT)), '-']
        extraction = subprocess.run(extract_argv, cwd=ROOT, capture_output=True, check=False)
        assert extraction.returncode == 0, extraction.stderr.decode()
        out.write_bytes(extraction.stdout)
        primary_outputs.append({'key': key, 'physicalPage': page, 'originalPDF': bind(pdf), 'argv': extract_argv, 'actualExitCode': extraction.returncode, 'text': bind(out), 'role': 'Exact primary output of the already independently read affected page, not a replacement extraction or new source approval'})
write(HERE / 'primary/four-current-course-origin-pages.independent-c.actual-reextraction.receipt.json', {'schemaVersion': 1, 'role': 'Independent original extraction; historical author inputs untouched', 'rows': primary_outputs, 'activeWrites': []})
print(json.dumps({'ordinaryP18Terminal': terminal, 'primaryPages': len(primary_outputs), 'wholeSourceApproval': False, 'strictGain': 0}, indent=2))

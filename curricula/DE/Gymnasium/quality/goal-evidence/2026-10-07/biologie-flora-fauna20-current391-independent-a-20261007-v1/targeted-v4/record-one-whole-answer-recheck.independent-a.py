# SPDX-License-Identifier: Apache-2.0
"""Append an actual bounded independent A recheck; do not alter prior verdicts."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

root = Path.cwd()
own = Path(__file__).resolve().parent
base = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07'
old = base / 'biologie-flora-fauna20-targeted-P-remediation-root-author-v3'
author = base / 'biologie-flora-fauna20-targeted-P-remediation-root-author-v4'
def read(path): return json.loads(path.read_text())
def write(path, value):
    with path.open('x') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
seal = read(author / 'targeted-one-answer.author.exact.freeze.json')
for binding in seal['frozenFiles']:
    data = (root / binding['path']).read_bytes()
    assert len(data) == binding['bytes']
    assert hashlib.sha256(data).hexdigest() == binding['sha256']
before = read(old / 'twenty-whole-goals-forty-common-DEEN-cases.author-v3.json')
after = read(author / 'twenty-whole-goals-forty-common-DEEN-cases.author-v4.json')
before_p = read(old / 'P20.targeted-two-profiles.author-v3.candidates.json')
after_p = read(author / 'P20.targeted-one-answer.author-v4.candidates.json')
expected = copy.deepcopy(before)
expected['goals'][8]['cases'][1]['modelAnswer'] = after['goals'][8]['cases'][1]['modelAnswer']
assert expected == after
expected_p = copy.deepcopy(before_p)
for key in ['reviewId', 'reviewedAt']: expected_p[key] = after_p[key]
expected_p['goals'][8]['profile']['applicationCaseBriefs'][1]['expectedPerformanceDe'] = after['goals'][8]['cases'][1]['modelAnswer']['de']
expected_p['goals'][8]['profile']['applicationCaseBriefs'][1]['expectedPerformanceEn'] = after['goals'][8]['cases'][1]['modelAnswer']['en']
assert expected_p == after_p
case = after['goals'][8]['cases'][1]
rows = [json.loads(line) for line in (author / 'P20.targeted-one-answer.author-v4.review.jsonl').read_text().splitlines()]
row = rows[8]
assert row['goalId'] == '350c8fab-5f95-5cf0-b8a9-dbc5f425b6fd'
assert row['profile'] == after_p['goals'][8]['profile']
brief = row['profile']['applicationCaseBriefs'][1]
for lang, suffix in [('de', 'De'), ('en', 'En')]:
    assert brief['taskDemand' + suffix] == case['material'][lang] + ' ' + case['task'][lang]
    assert brief['expectedPerformance' + suffix] == case['modelAnswer'][lang]
assert row['status'] == 'needs_human_review'
assert row['reviewAuthority'] == 'ai_candidate'
assert row['evidenceLevel'] == 'E1' and row['maximumClaimScope'] == 'G1'
with (own / 'P1.exact-author-input.review.jsonl').open('x') as stream:
    stream.write(json.dumps(row, ensure_ascii=False) + '\n')
config = read(author / 'P20.targeted-one-answer.author-v4.config.json')
config['scope'] = {'label': 'Independent A targeted whole case 09/2 answer and operative expectation recheck', 'goalIds': [row['goalId']]}
config['reviewPath'] = str((own / 'P1.exact-author-input.review.jsonl').relative_to(root))
write(own / 'P1.exact-targeted.native.config.json', config)
write(own / 'one-whole-case-answer-independent-a.actual.json', {
    'schemaVersion': 1,
    'artifactKind': 'targeted-whole-case-answer-and-operative-expectation-independent-review',
    'recordedAt': datetime.now(timezone.utc).isoformat(),
    'reviewer': '/root/flora_fauna_independent_a',
    'priorOwnFirstScienceSeal': str((own.parent / 'first-twenty-whole-science.freeze.json').relative_to(root)),
    'priorOwnTargetedV3Seal': str((own.parent / 'targeted-v3/targeted-v3.independent-a.final.freeze.json').relative_to(root)),
    'exactAuthorInputSeal': str((author / 'targeted-one-answer.author.exact.freeze.json').relative_to(root)),
    'goalId': row['goalId'], 'caseId': case['id'],
    'actualReading': 'Read both whole materials, tasks and revised answers in DE/EN and the complete operative second brief and expectation. The old v3 first A pass was already sealed before the peer-reported residual was disclosed. This follow-up does not claim A independently discovered that residual.',
    'substantiveVerdict': 'PASS: X is explicitly justified by its lobed blade, Y now by its heart-shaped blade, and Z by its compound ash leaf. All three feature assignments now answer the unchanged task. The bounded reference model is sufficient, while the answer still states that one leaf shape is not a universal species identifier or proof of safe use. Occurrence and human use remain distinct from lineage. Both language answers agree in meaning; the operative P expectation exactly contains the full corrected answer.',
    'resolvedFinding': 'Peer-reported missing heart-shaped-leaf justification for specimen Y in ordinal 9 case 2, independently confirmed and resolved in this targeted A follow-up.',
    'preservedByExactObjectComparison': {'otherWholeCases': 39, 'otherWholeProfiles': 19, 'wholeGoalObjects': 20, 'tasksAndMaterials': 40, 'sourceChoiceDissent': 'unchanged'},
    'unchangedChecks': 'Retain genuinely performed initial A whole-text/source/A/M and v3 P-science checks. No science conclusion is inferred from hash equality alone.',
    'candidateScienceState': {'D20': 'KEEP', 'P20': 'PASS for scoped candidate after all targeted remediations', 'V20AndFinalNativePages': 'pending'},
    'status': row['status'], 'reviewAuthority': row['reviewAuthority'], 'evidenceLevel': row['evidenceLevel'], 'maximumClaimScope': row['maximumClaimScope'],
    'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False, 'humanTrial': False, 'realLearnerEvidence': False,
})
print('Verified exact freeze6; actual whole09/2 DE/EN answer and operative P expectation PASS; unchanged39 cases/19 profiles/20 goals.')

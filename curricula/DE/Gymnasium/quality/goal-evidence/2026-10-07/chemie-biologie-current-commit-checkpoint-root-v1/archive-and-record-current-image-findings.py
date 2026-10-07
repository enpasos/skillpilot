"""Record actual current image findings without touching human decisions or rasters."""
import copy
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
QA = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'


def save(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def fingerprint(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


assert not (OUT / 'chemie.qa.before-current-negative-findings.json').exists(), 'Do not overwrite the historical before state.'
before = json.loads(QA.read_text())
(OUT / 'chemie.qa.before-current-negative-findings.json').write_bytes(QA.read_bytes())
previous = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next25-reviewed-active-integration-root-v1/current-central-five-gate-current-report-routing-final.actual.report.json'
(OUT / 'central-before-current-negative-findings.actual.report.json').write_bytes(previous.read_bytes())
findings = {
    '0bf26276-2780-506c-ac34-35dd44a29409': {
        'expectedAssetSha256': 'c1d27559399a477ccd768241cc9123e7dd1dc760a4bd4b1c280a3297bc5bb774',
        'finding': 'The lemon-juice caption says pH 2, while its red arrow points to pH 3 on the drawn scale. Root confirmed the discrepancy on the actual original raster.',
    },
    'a44af1fa-5988-5b7d-b206-691c6bbf7dd4': {
        'expectedAssetSha256': 'db04ea79750f4ff22b2ef1600315f0de75ec0031516f1aa3a7bf985fb7705c17',
        'finding': 'The lower aqueous beakers label Na+ as yellow and K+ as violet, transferring the flame-test colours to the ions in solution. The flame colours themselves are correct; those aqueous colour assignments are misleading. Root confirmed the actual original.',
    },
    '9751b6d8-cde3-527b-b37c-babb6cee79d2': {
        'expectedAssetSha256': '908a415b5a67c11bc5293a6b0d2898128a9558790e00691e70dee97a65bbc307',
        'finding': 'For HA+B reversible A-+HB+, the diagram universally claims that adding OH- gives more A- and HB+. OH- can consume protons/deprotonate HB+; a general increase in HB+ does not follow. The correctly drawn HA+OH- reaction below does not resolve this contradictory equilibrium claim. Root confirmed the actual original.',
    },
    'c441d9e8-d9d9-5e55-a189-a37345541321': {
        'expectedAssetSha256': None,
        'finding': 'The owner supplied a crop showing the spelling error Gasuförmige Ionen. Root identified and inspected the actual c441 salt-formation PNG, which contains this exact error; the open editor tab 973 identifies a different, unchanged aldehyde-test image. Required label: Gasförmige Ionen. A narrowly targeted correction and fresh exact-asset reviews remain pending.',
    },
}
after = copy.deepcopy(before)
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
rows = {row['goalId']: row for row in after['records']}
for goal_id, finding in findings.items():
    row = rows[goal_id]
    actual = fingerprint(ROOT / row['canonicalAssetPath'])
    assert row['assetSha256'] == 'sha256:' + actual['sha256']
    if finding['expectedAssetSha256']:
        assert actual['sha256'] == finding['expectedAssetSha256']
    finding['actualOriginal'] = actual
    note = 'Current machine REVISE. ' + finding['finding'] + ' No human decision is inferred; historical positive records are retained in the before snapshot.'
    row.update(aiApproved='no', aiReviewedAt=now, aiReviewer='codex-root-current-original-negative-machine-review', aiNotes=note,
               contentApprovedChatGpt='no', chatGptReviewedAt=now, chatGptReviewer='codex-root-current-original-negative-machine-review', chatGptNotes=note)
    if goal_id == 'c441d9e8-d9d9-5e55-a189-a37345541321':
        row['umlautsCorrectChatGpt'] = 'no'
old_by_id = {row['goalId']: row for row in before['records']}
changes = []
for row in after['records']:
    old = old_by_id[row['goalId']]
    assert {k: v for k, v in row.items() if k.startswith('human')} == {k: v for k, v in old.items() if k.startswith('human')}
    changed = [k for k in set(old) | set(row) if old.get(k) != row.get(k)]
    if changed:
        assert row['goalId'] in findings
        assert set(changed) <= {'aiApproved', 'aiReviewedAt', 'aiReviewer', 'aiNotes', 'contentApprovedChatGpt', 'chatGptReviewedAt', 'chatGptReviewer', 'chatGptNotes', 'umlautsCorrectChatGpt'}
        changes.append({'goalId': row['goalId'], 'changedFields': sorted(changed)})
assert len(changes) == 4
save(QA, after)
save(OUT / 'four-current-image-findings-and-negative-machine-decisions.actual.json', {
    'documentType': 'actual original raster negative machine findings, not human review', 'reviewedAtUTC': now,
    'findings': findings, 'actualQaFieldChanges': changes,
    'allHumanFieldsUnchanged': True, 'allOtherQaRowsUnchanged': True,
    'noRasterChanges': True, 'noGoalTextOrGraphChanges': True,
    'previousCentralReport': fingerprint(previous),
    'threePreviouslyOpenGoals': ['0bf26276-2780-506c-ac34-35dd44a29409', 'a44af1fa-5988-5b7d-b206-691c6bbf7dd4', '9751b6d8-cde3-527b-b37c-babb6cee79d2'],
    'previouslyStrictGoalNeedingTargetedTypoCorrection': 'c441d9e8-d9d9-5e55-a189-a37345541321',
    'oldMachinePositiveClaimsRetainedAsHistory': True,
})
print(json.dumps({'actualNegativeMachineRows': len(changes), 'humanFieldsUnchanged': True, 'rasterChanges': 0}))

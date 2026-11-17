import copy
import datetime
import hashlib
import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[5]
base = '9975a142f7a26f1c4ff31c46a70e149d82a3fce5'
physics = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
parent_id = 'bf980fff-b62b-4ea4-a20d-31681a7ad785'
work = root / 'tmp/pipeline/laender-stufen/gesamt'
sha = lambda payload: hashlib.sha256(payload).hexdigest()
read = lambda path: json.loads(path.read_bytes())
old_bytes = lambda path: subprocess.check_output(['git', 'show', f'{base}:{path}'], cwd=root)

manifest = read(work / 'physics/all-nine-assessments/release-manifest.actual.json')
approved = {
    'lens-eye-two-model-simulations': (['DE-MV', 'DE-SL'], '0d8284fd3a36621a53ea04078e7e85427adefc9fc34ea9d9abe0e48785e110a7', 'review/lens-eye-reviewed-candidate'),
    'personal-free-fall-two-series': (['DE-SN'], '54709a76569bce1694ce931614239589482dd65de5e51da68c8de802f04ced33', 'physics/remaining-assessments/sealed-v2'),
    'document-two-provided-investigations': (['DE-SN', 'DE-ST', 'DE-TH'], '40b9a89621596af1e84e20fbc04840e66d44db83274e6d37e44ede5c811b09ad', 'physics/remaining-assessments/sealed-v2'),
    'personal-motor-two-builds': (['DE-MV'], '32dac7cf7a1e8c274c15062430362607224401206d9b70971e56dd03eb35b1e7', 'physics/remaining-assessments/sealed-v2'),
    'astronomical-observation-two-evidence-cases': (['DE-SN'], '20b657f6c85f52eb15282211d0dee28aa4b03186b305f3ac56ef3d5a5a7b95b1', 'physics/remaining-lower-assessments/author-validation/history/before-offer-binding'),
    'decay-chains-two-consistency-audits': (['DE-HH'], '123e08d157d17b0950b168cc5f784be6f80bc46d5cd076a3d5918fc2da9f886e', 'physics/remaining-lower-assessments/author-validation/history/before-offer-binding'),
    'rest-energy-two-system-comparisons': (['DE-HH'], '7b2b21fd2f8569d6efd43ba0f5386b380a456eaa876039de00e294dbc5398454', 'physics/remaining-lower-assessments/author-validation/history/before-offer-binding'),
    'ideal-transformer-two-load-cases': (['DE-SL', 'DE-SN'], '4332a5813f567370d4a1a6ff8fb3487ea6bbd8904b620a8d398cc9d8a6af961a', 'physics/remaining-lower-assessments/author-validation/history/before-offer-binding'),
    'em-spectrum-two-application-maps': (['DE-SL', 'DE-SN'], '10fecdf9681f2ae5529e8f84ab9c898ce2edc59bf8aa3cd9610e3c9b4f81adc0', 'physics/remaining-lower-assessments/author-validation/history/before-offer-binding'),
}
tasks = {row['id']: row for row in manifest['tasks']}
assert len(tasks) == 9
paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', base, '--',
    'curricula/DE/Gymnasium/canonical', 'curricula/DE/Gymnasium/input',
    'curricula/DE/Gymnasium/provenance'], cwd=root, text=True).splitlines()
protected = [p for p in paths if '/canonical/' in p or '/input/' in p or 'prerequisite-reduction-proof-registry' in p]
diff_names = set(subprocess.check_output(['git', 'diff', '--name-only', base, '--',
    'curricula/DE/Gymnasium/canonical', 'curricula/DE/Gymnasium/input',
    'curricula/DE/Gymnasium/provenance'], cwd=root, text=True).splitlines())
assert [p for p in protected if p in diff_names] == [physics]
old, new = json.loads(old_bytes(physics)), read(root / physics)
assert {k: v for k, v in old.items() if k != 'goals'} == {k: v for k, v in new.items() if k != 'goals'}
old_goals, new_goals = ({g['id']: g for g in d['goals']} for d in (old, new))
assert len(new_goals) == len(new['goals']) == 850
assert set(new_goals) - set(old_goals) == set(tasks)
assert set(old_goals) <= set(new_goals)
assert [i for i in old_goals if old_goals[i] != new_goals[i]] == [parent_id]
parent = copy.deepcopy(old_goals[parent_id])
parent['contains'] += list(tasks)
assert new_goals[parent_id] == parent
rows = []
for task_id, row in tasks.items():
    released = new_goals[task_id]
    prefix = Path(row['sourceArtifactPath']).stem
    jurisdictions, candidate_sha, folder = approved[prefix]
    candidate_path = work / folder / (prefix + '.goal.json')
    assert sha(candidate_path.read_bytes()) == candidate_sha
    candidate = read(candidate_path)
    assert candidate['id'] == task_id
    assert candidate['examData']['reviewStatus'] == 'needs_review'
    assert released['examData']['reviewStatus'] == 'released'
    assert released['requires'] == released['examData']['coveredGoalIds'] == candidate['requires']
    courses = [t for t in released['tags'] if t in ['GK', 'LK']]
    assert courses == (['LK'] if prefix in ['decay-chains-two-consistency-audits', 'rest-energy-two-system-comparisons'] else ['GK', 'LK'])
    assert set(courses) <= set(old_goals[released['requires'][0]]['tags'])
    assert released['applicability'] == {'jurisdiction': jurisdictions}
    assert released['extendedData'] == {'applicabilityMappingInheritance': 'boundary', 'applicabilityOverrides': {'jurisdiction': jurisdictions}}
    review_note = released['examData']['reviewNote']
    assert row['contentReview'] in review_note and 'independent-review/offer-bindings.actual.json' in review_note
    review = read(root / row['contentReview'])
    assert review['status'].lower() == 'pass'
    assert review['author'] != review['reviewer']
    expected = copy.deepcopy(candidate)
    expected['examData']['reviewStatus'] = 'released'
    expected['examData']['reviewNote'] = review_note
    expected['applicability'] = released['applicability']
    expected['extendedData'] = released['extendedData']
    assert expected == released, prefix
    for field, digest in [('releasedPath', 'releasedSha256'), ('offeredCandidatePath', 'offeredCandidateSha256'), ('sourceArtifactPath', 'sourceArtifactSha256'), ('contentReview', 'contentReviewSha256')]:
        assert sha((root / row[field]).read_bytes()) == row[digest], field
    assert read(root / row['releasedPath']) == released
    material = work / folder / (prefix + '.md')
    assert material.read_bytes() == (root / row['sourceArtifactPath']).read_bytes(), prefix
    rows.append({'id': task_id, 'contentCandidate': str(candidate_path.relative_to(root)),
        'contentCandidateSha256': candidate_sha, 'releasedSha256': row['releasedSha256'],
        'offeredJurisdictions': jurisdictions, 'courseProfiles': courses,
        'contentReview': row['contentReview'], 'contentReviewSha256': row['contentReviewSha256']})

warning_path = 'docs/qa-ci/applicability-accepted-warnings.json'
previous, current = json.loads(old_bytes(warning_path)), read(root / warning_path)
assert previous['version'] == current['version']
assert len(previous['acceptedWarnings']) == 111
assert current['acceptedWarnings'][:111] == previous['acceptedWarnings']
warnings = current['acceptedWarnings'][111:]
assert len(warnings) == 9 and {w['goalId'] for w in warnings} == set(tasks)
for w in warnings:
    row = tasks[w['goalId']]
    assert w['code'] == 'APV-201' and w['dimension'] == 'jurisdiction'
    assert w['landscapeId'] == new['landscapeId'] if 'landscapeId' in new else w['landscapeId'] == '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
    e = w['evidence']
    assert e['exactOverrideJurisdictions'] == e['compiledJurisdictions'] == row['offeredJurisdictions']
    assert e['humanApproval'] is False and e['officialMandatoryRequirement'] is False and e['officialWholeSourceCredit'] is False
    assert e['releasedGoalPath'] == row['releasedPath'] and e['releasedGoalSha256'] == row['releasedSha256']
    assert sha((root / e['reviewPath']).read_bytes()) == e['reviewFileSha256']
    assert sha((root / e['metadataReviewPath']).read_bytes()) == e['metadataReviewSha256']
    binding = read(root / e['reviewPath'])
    bound_row = binding['rows'][int(e['rowPointer'].rsplit('/', 1)[1])]
    assert bound_row['taskId'] == w['goalId']
    assert bound_row['compiledJurisdictions'] == row['offeredJurisdictions']
    assert bound_row['courseProfiles'] == e['courseProfiles']

report = {'schema': 'skillpilot-final-protected-input-comparison-v2',
    'at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'status': 'PASS',
    'baseCommit': base, 'protectedExistingFiles': len(protected),
    'gitUnchangedExistingFiles': len(protected) - 1,
    'unchangedExistingPhysicsGoals': len(old_goals) - 1,
    'structuralLinkOnly': {'parentId': parent_id, 'appendedAssessmentIds': list(tasks)},
    'newReviewedAssessments': rows,
    'permittedCandidateDelta': ['reviewStatus needs_review to released', 'independent release reviewNote', 'exact own country offering and mapping boundary'],
    'unchangedWarningEntries': 111, 'newPreciselyBoundWarnings': 9,
    'physicsCatalogSha256': sha((root / physics).read_bytes()),
    'warningLedgerSha256': sha((root / warning_path).read_bytes()),
    'preserved': ['840 existing Physics goals exact', 'All existing competency requires and text', 'All retained source bytes', 'V9 and all tracked historical prerequisite-proof registries'],
    'limits': ['Automated immutable-input and exact review-binding comparison; no learner trial or evidence of learning effectiveness.']}
output = Path(__file__).with_name('final-protected-inputs-v2.actual.json')
output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: v for k, v in report.items() if k not in ['newReviewedAssessments', 'structuralLinkOnly']}))

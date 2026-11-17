"""Independent content-review evidence; does not import author calculations."""
from pathlib import Path
from datetime import datetime, timezone
from itertools import product
import hashlib
import json

ROOT = Path('/home/enpasos/projects/skillpilot')
AUTHOR = ROOT / 'tmp/pipeline/laender-stufen/gesamt/physics/remaining-lower-assessments/author-validation'
OUT = Path(__file__).resolve().parent

def sha(data):
    return hashlib.sha256(data).hexdigest()

def emit_review(stem, expected_sha, target, calculations, manual_checks, suffix=''):
    source = AUTHOR / (stem + '.goal.json')
    material = AUTHOR / (stem + '.md')
    raw = source.read_bytes()
    assert sha(raw) == expected_sha, 'Unreviewed candidate bytes'
    goal = json.loads(raw)
    exam = goal['examData']
    assert goal['type'] == 'atomic' and goal['contains'] == []
    assert goal['requires'] == [target] and exam['coveredGoalIds'] == [target]
    assert exam['reviewStatus'] == 'needs_review'
    for field in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
        assert isinstance(exam[field], str) and exam[field].strip()
    scoring = exam['scoring']
    steps = scoring['steps']
    assert len({step['id'] for step in steps}) == len(steps)
    assert sum(step['points'] for step in steps) == scoring['maxPoints']
    assert all(step['points'] == 3 for step in steps)
    assert scoring['passingPoints'] == scoring['maxPoints'] - 1
    outcomes = list(product([0, 2, 3], repeat=len(steps)))
    passing = [outcome for outcome in outcomes if sum(outcome) >= scoring['passingPoints']]
    assert passing and all(0 not in outcome for outcome in passing)
    assert scoring['maxPoints'] - 3 < scoring['passingPoints']
    # The companion artifact must carry the reviewed bilingual prompt and solution.
    text = material.read_text()
    for field in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
        assert exam[field] in text, 'Companion material omits ' + field
    canonical = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
    current = {g['id']:g for g in json.loads(canonical.read_bytes())['goals']}
    target_goal = current[target]
    course_tags = sorted(set(goal.get('tags', [])) & {'GK','LK'})
    target_course_tags = sorted(set(target_goal.get('tags', [])) & {'GK','LK'})
    assert course_tags == target_course_tags, 'Task course tags must match covered target exactly'
    candidate_copy = OUT / (stem + suffix + '.reviewed-candidate.goal.json')
    material_copy = OUT / (stem + suffix + '.reviewed-material.md')
    for path, data in [(candidate_copy, raw), (material_copy, material.read_bytes())]:
        assert not path.exists(), 'Preserve prior retained review candidate'
        path.write_bytes(data)
    payload = json.loads(raw)
    payload['examData'].pop('reviewStatus', None)
    payload['examData'].pop('reviewNote', None)
    report = {
        'schema': 'independent-bilingual-atomic-assessment-content-review-v1',
        'reviewer': '/root/he_ephase_source_review',
        'author': '/root/he_ephase_validation',
        'reviewedAt': datetime.now(timezone.utc).isoformat(),
        'status': 'PASS',
        'releaseRecommendation': 'APPROVE_RELEASE_OF_REVIEWED_CONTENT',
        'learnerTrialOrHumanApproval': False,
        'taskId': goal['id'], 'targetGoalId': target,
        'candidatePins': {str(p.relative_to(ROOT)):sha(p.read_bytes()) for p in [source, material]},
        'retainedOriginalPins': {str(p.relative_to(ROOT)):sha(p.read_bytes()) for p in [candidate_copy, material_copy]},
        'reviewedPayloadDigestExcludingOnlyReleaseStatusAndReviewNote': sha(json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(',',':')).encode()),
        'targetDescription': target_goal['description'],
        'targetGoalDigest': sha(json.dumps(target_goal, ensure_ascii=False, sort_keys=True, separators=(',',':')).encode()),
        'canonicalDocumentSha256AtReviewTime': sha(canonical.read_bytes()),
        'requiresAndCoverage': {'requires':goal['requires'], 'coveredGoalIds':exam['coveredGoalIds'], 'additionalRequiredGoalIds':[]},
        'courseBinding': {'taskCourseTags':course_tags, 'targetCourseTags':target_course_tags, 'exactMatch':True},
        'independentCalculations': calculations,
        'manualContentReview': manual_checks,
        'rubric': {'coreCount':len(steps), 'maxPoints':scoring['maxPoints'], 'passingPoints':scoring['passingPoints'],
                   'enumeratedOutcomes':len(outcomes), 'passingOutcomes':len(passing), 'noMissingCoreCanPass':True,
                   'oneIsolatedNonconceptualSlipAllowed':True, 'noMissingCompleteCaseCanPass':True},
        'limitations': ['AI independent content and numeric review; no human review or learner effectiveness claim.',
                       'Source-stage task selection and final actual CQR/routes are separate integration checks.',
                       'Release may change only reviewStatus/reviewNote without a new content review.']
    }
    destination = OUT / (stem + suffix + '.independent.actual.json')
    assert not destination.exists(), 'Preserve prior original review evidence'
    destination.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'review':str(destination.relative_to(ROOT)), 'taskId':goal['id'], 'status':report['status'], 'releaseRecommendation':report['releaseRecommendation']},indent=2))
    return report

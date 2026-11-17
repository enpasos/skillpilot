import hashlib
import itertools
import json
from fractions import Fraction as F
from pathlib import Path

root = Path(__file__).resolve().parents[5]
author = root / 'tmp/pipeline/laender-stufen/gesamt/physics/lens-eye-assessment/author'
goal_path = author / 'lens-eye-two-model-simulations.goal.json'
goal = json.loads(goal_path.read_text())
reported = json.loads((author / 'author-numerics.actual.json').read_text())
expected_id = '3b7b2b62-e39c-5936-b0d8-5406206e57b6'
covered = '84ddb244-e560-592f-9d43-e84c801fe5b4'
assert goal['id'] == expected_id
assert goal['requires'] == goal['examData']['coveredGoalIds'] == [covered]
assert goal['examData']['reviewStatus'] == 'needs_review'
results = []
for label, distance, height, retina, focal_values, near in [
    ('A', 180, F(9, 5), 20, [15, 18, 20], 90),
    ('B', 120, F(1), 24, [15, 20, 24], 60),
]:
    sharp = F(distance * retina, distance + retina)
    near_sharp = F(near * retina, near + retina)
    image_height = -F(height * retina, distance)
    central_slope = -F(height, distance)
    parallel_slope = -height / sharp
    assert central_slope * retina == height + parallel_slope * retina == image_height == F(-1, 5)
    assert near_sharp < sharp
    rows = []
    for g, f in [(distance, F(f)) for f in focal_values] + [(near, sharp), (near, near_sharp)]:
        image = F(1) / (F(1) / f - F(1, g))
        rows.append(dict(g=g, f=str(f), b_sim=str(image), delta=str(image - retina)))
    result = dict(case=label, sharpF=str(sharp), signedImageHeight=str(image_height), nearSharpF=str(near_sharp), rows=rows)
    assert result == next(r for r in reported['numerics'] if r['case'] == label)
    results.append(result)

scoring = goal['examData']['scoring']
assert len(scoring['steps']) == 8
assert all(step['points'] == 3 for step in scoring['steps'])
assert scoring['maxPoints'] == sum(step['points'] for step in scoring['steps']) == 24
assert scoring['passingPoints'] == 23
passing = [points for points in itertools.product([0, 2, 3], repeat=8) if sum(points) >= 23]
assert len(passing) == 9
assert all(0 not in points for points in passing)

report = {
    'schema': 'skillpilot-independent-assessment-review-v1',
    'reviewer': '/root',
    'author': '/root/he_ephase_implementation',
    'status': 'pass',
    'candidateId': expected_id,
    'pins': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in author.iterdir() if p.is_file()},
    'numericalRecomputation': results,
    'scoringExhaustion': {'cases': 3 ** 8, 'passingCases': len(passing), 'passingWithMissingCore': 0},
    'contentReview': {
        'twoIndependentCases': 'Each case independently constructs two rays, derives the lens equation solution, runs and interprets five numerical model cases, and justifies a model limit.',
        'coverage': 'The single covered atom requires ray construction, lens equation, simulation, quantitative sharpness and model limits. All components are required in both cases.',
        'prerequisites': 'Only the actual lens-eye competence is required. No source membership, assessment coverage or new prerequisite is invented to satisfy QA.',
        'bilingual': 'Both task and solution versions inspected in full, including corrected object heights, image heights, central-ray slopes and near-focus values.',
        'correction': 'Author replaced overly large object heights A9/B5 mm with A1.8/B1.0 mm after independent paraxial-consistency objection. Corrected image heights are both -0.2 mm.',
        'scope': 'Own school model task, explicitly not an official examination, biological measurement, medical assertion or evidence of actual learner success.',
        'rubric': 'Missing any core gives zero in that core; threshold23/24 cannot compensate for a missing core. Exhaustive arithmetic check is separate from this content judgment.',
    },
    'limitations': ['No human learner trial has been performed.', 'Review covers the pinned needs_review candidate; release metadata and catalog insertion must be verified separately.'],
}
out = Path(__file__).with_suffix('.actual.json')
out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'status': report['status'], 'report': str(out), 'numericalCases': len(results), 'scoringCases': 3 ** 8}))

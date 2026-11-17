import hashlib
import itertools
import json
import math
import sys
from fractions import Fraction as F
from pathlib import Path

root = Path(__file__).resolve().parents[5]
candidate_dir = root / sys.argv[1]
output_dir = root / 'tmp/pipeline/laender-stufen/gesamt/review/experimental-assessments'
output_dir.mkdir(exist_ok=True)
catalog_path = root / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
catalog = {g['id']: g for g in json.loads(catalog_path.read_text())['goals']}
expected = {
    'personal-free-fall-two-series': ('f41e4e30-794e-5ce4-ba5e-cc72712cd691', '09029573-864f-40ca-bf8a-cee7bf6dcb73'),
    'document-two-provided-investigations': ('7cfaf48e-e420-5c09-8ec2-932f0dba4d08', 'ad62f563-4fee-5399-8d9c-03a214658aa9'),
    'personal-motor-two-builds': ('e6a89922-75ce-53dd-9e7b-3a683398431c', 'eb30189c-27c6-510b-b235-6543afa18b90'),
}
speeds = [F(3, 5) / t for t in [F(12, 5), F(5, 2), F(13, 5)]]
periods = [t / 20 for t in [F(26), F(129, 5), F(131, 5)]]
numerics = {
    'personal-free-fall-two-series': {
        'idealFeasibilityOnly': [dict(heightM=h, fallSeconds=math.sqrt(2*h/9.81),
            frameIntervalsAt120Hz=120*math.sqrt(2*h/9.81)) for h in [0.25, 0.30, 0.60, 0.80]],
        'slopeRelation': 'For x=(g/2)t^2, fitted slope of x against t^2 is g/2; actual initial conditions and observed data must be checked.',
        'notLearnerMeasurements': True,
    },
    'document-two-provided-investigations': {
        'speedsExact': list(map(str, speeds)), 'meanSpeedExact': str(sum(speeds)/3),
        'meanSpeedDecimal': float(sum(speeds)/3), 'speedRangeExact': str(max(speeds)-min(speeds)),
        'periodsExact': list(map(str, periods)), 'meanPeriodExact': str(sum(periods)/3),
        'periodRangeExact': str(max(periods)-min(periods)), 'timingLimitPerKnown20Periods': str(F(1, 5)/20),
        'invalidRecords': 'Pilot P remains documented but is not a repeat. B4 has unknown count and cannot be silently converted to a period.',
    },
    'personal-motor-two-builds': {
        'conductorForceAndTorqueSignCases': [],
        'supplyPowerUpperBoundW': 3 * 0.3,
        'scopeOfSafetyReview': 'Content-level plausibility only; no real kit or experiment was tested. The task requires a suitable school kit, teacher inspection, current limit and shutdown on faults.',
    },
}
def cross(a, b):
    return (a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0])

for current in [1, -1]:
    for field in [1, -1]:
        torques = []
        for side in [1, -1]:
            position = (side, 0, 0)
            conductor_current = (0, 0, side*current)
            force = cross(conductor_current, (field, 0, 0))
            torque = cross(position, force)
            assert torque == (0, 0, current*field)
            torques.append(torque)
        numerics['personal-motor-two-builds']['conductorForceAndTorqueSignCases'].append(
            dict(currentSign=current, fieldSign=field, sideTorques=torques, totalTorqueZ=2*current*field))

content = {
    'personal-free-fall-two-series': [
        'Both independent real series require three fresh valid releases with five measured time-position pairs each, own graphs and independent g determination.',
        'Time origin, position origin, initial velocity, actual acquisition rate, reading limits, sensitivity and drag/model limits are explicitly treated. No pre-filled table can substitute for personal execution.',
        'The solution permits justified unexpected measured results, avoids forcing9.81, distinguishes repeat scatter from systematic errors and requires both complete own laws.',
    ],
    'document-two-provided-investigations': [
        'Each report independently documents question, setup, method, observations, raw measurements, own calculations and bounded conclusions.',
        'Supplied material is explicitly didactic. Documentation competence does not falsely claim a personally performed experiment.',
        'The two cases require different validity decisions; all original observations and invalid/uncertain records must remain traceable.',
    ],
    'personal-motor-two-builds': [
        'Two independently assembled real open motors require fresh observed starts, current reversal in A and field reversal in B, with the other variables held fixed.',
        'Each case requires own spatial current/field/force explanation, torque and commutation, rather than memorized clockwise labels.',
        'A functioning electrically sustained run must be demonstrated in each assembly; manual spinning or exclusively failed starts cannot complete the construction core.',
    ],
}
reports = []
for name, (task_id, covered_id) in expected.items():
    p = candidate_dir / (name + '.goal.json')
    goal = json.loads(p.read_text())
    exam = goal['examData']
    assert goal['id'] == task_id
    assert goal['requires'] == exam['coveredGoalIds'] == [covered_id]
    assert exam['reviewStatus'] == 'needs_review'
    assert set(goal['tags']) & {'GK', 'LK'} == set(catalog[covered_id]['tags']) & {'GK', 'LK'}
    assert goal['type'] == 'atomic' and not goal['contains']
    assert 'Automatisierte und inhaltliche Aufgabenprüfung' not in exam['solutionContent']
    assert 'Automated/content task review' not in exam['solutionContentEn']
    scoring = exam['scoring']
    assert len(scoring['steps']) == 8 and all(s['points'] == 3 for s in scoring['steps'])
    assert scoring['maxPoints'] == 24 and scoring['passingPoints'] == 23
    passing = [p for p in itertools.product([0, 2, 3], repeat=8) if sum(p) >= 23]
    assert len(passing) == 9 and all(0 not in p for p in passing)
    report = {
        'schema': 'skillpilot-independent-assessment-content-review-v1',
        'reviewer': '/root', 'author': '/root/he_ephase_implementation', 'status': 'PASS',
        'candidateId': task_id, 'coveredGoalId': covered_id,
        'candidatePath': str(p.relative_to(root)), 'candidateSha256': hashlib.sha256(p.read_bytes()).hexdigest(),
        'canonicalGoalAtReview': catalog[covered_id],
        'reviewMethod': 'Both complete language versions, solutions and all scoring cores manually read; independent numerical and vector calculations plus exhaustive rubric enumeration.',
        'contentReview': content[name], 'independentCalculations': numerics[name],
        'rubricCombinations': 3**8, 'passingCombinations': len(passing), 'passingWithAbsentCore': 0,
        'scopeReview': 'Only the actual covered atom is a prerequisite. Task course tags equal the covered competence course tags. No irrelevant ordinary prerequisite is added.',
        'limitations': ['No actual learner execution or human trial has occurred.', 'This is candidate content review; final release metadata, source scopes and actual projections are checked separately.'],
    }
    (output_dir / (name + '.independent.actual.json')).write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    reports.append({'id': task_id, 'status': report['status'], 'candidateSha256': report['candidateSha256']})
print(json.dumps(reports))

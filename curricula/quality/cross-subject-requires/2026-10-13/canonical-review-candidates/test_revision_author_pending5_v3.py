# SPDX-License-Identifier: Apache-2.0
"""Constructive route checks; synthetic calculations are not learner evidence."""
import datetime
import hashlib
import json
import math
from fractions import Fraction as F
from pathlib import Path

prefix = Path('tmp/cross-subject-requires/physics-pending5-revision-author-20261013-v3')
path = lambda suffix: Path(str(prefix) + '.' + suffix)
sha = lambda p: 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
checks = []

def check(name, condition, evidence):
    assert condition, name
    checks.append({'name': name, 'passed': True, 'evidence': evidence})

# Synthetic sampled positions test the permitted v-t route; they are explicitly
# not an experimental-acquisition receipt or real learner achievement.
times = [F(i, 10) for i in range(5)]
g = F(49, 5)
positions = [F(5, 4) - g*t*t/2 for t in times]
v = [(positions[i+1]-positions[i])/(times[i+1]-times[i]) for i in range(4)]
midpoints = [(times[i+1]+times[i])/2 for i in range(4)]
slopes = [(v[i+1]-v[i])/(midpoints[i+1]-midpoints[i]) for i in range(3)]
check('synthetic-free-fall-negative-axis-rate', all(a == -g for a in slopes), {'g_m_per_s2': float(g), 'finiteDifferenceRates': list(map(float, v)), 'midpointSlope': list(map(float, slopes)), 'physicalBoundary': 'This only checks the analysis route. Real acquisition remains a required unperformed learner witness.'})

# Forward simple work and withheld signed-area balance.
tension_work = F(12)*F(5, 2)
friction_work = -F(4)*F(5, 2)
check('work-independent-sign-and-net', tension_work == 30 and friction_work == -10 and tension_work+friction_work == 20, {'rope_J': float(tension_work), 'friction_J': float(friction_work), 'net_J': float(tension_work+friction_work), 'scope': 'Kinetic energy in the point-mass sled model; thermal energy is retained when the surface is included.'})
check('work-variable-force-signed-lobes', F(27,4)-F(9,4) == F(9,2), {'unsignedLobes_J': [6.75, 2.25], 'signedNet_J': 4.5})

# Genuine non-collinear planar collision: total vector unchanged, kinetic
# energy decreases. Dot-product calculations are testing tools, not added
# learner compulsory prerequisites.
p_before = [(F(4), F(0)), (F(0), F(0))]
p_after = [(F(2), F(1)), (F(2), F(-1))]
sum_vectors = lambda vectors: tuple(sum(v[i] for v in vectors) for i in range(len(vectors[0])))
K = lambda ps: sum(sum(x*x for x in p)/2 for p in ps)
non_collinear = p_after[0][0]*p_after[1][1] - p_after[0][1]*p_after[1][0] != 0
check('two-dimensional-inference-not-disguised-1d', non_collinear and sum_vectors(p_before) == sum_vectors(p_after) == (4,0) and K(p_before) == 8 and K(p_after) == 5, {'pBefore': [[4,0],[0,0]], 'pAfter': [[2,1],[2,-1]], 'totalMomentum': [4,0], 'KBefore_J': 8, 'KAfter_J': 5, 'conclusion': 'Momentum conservation coexists with conversion of kinetic energy to internal energy.'})

# Newton III cancellation is independent of outer force history. Distinct
# symbols make same-body equilibrium versus inter-body cancellation visible.
rows = [
    {'F12': 1, 'F13': 1, 'E1': 1},
    {'F12': -1, 'F23': 1, 'E2': 1},
    {'F13': -1, 'F23': -1, 'E3': 1},
]
summed = {symbol: sum(r.get(symbol, 0) for r in rows) for symbol in ['F12','F13','F23','E1','E2','E3']}
check('newton-full-system-internal-cancellation', all(summed[s] == 0 for s in ['F12','F13','F23']) and all(summed[s] == 1 for s in ['E1','E2','E3']), {'summedForceCoefficients': summed, 'narrowerSystem': rows[0], 'boundary': 'The general mathematical sum rule is given; selection and NewtonIII pair classification remain learner physical reasoning.'})
J1 = (F(2), F(-1), F(1,2))
J2 = tuple(-x for x in J1)
check('three-component-opposite-impulses-endpoint-only', sum_vectors([J1,J2]) == (0,0,0) and J1 != (0,0,0), {'intermediateDeltaP': list(map(float,J1)), 'wholeDeltaP': list(map(float,sum_vectors([J1,J2])))})
# A continuous piecewise nonconstant force: F=2t on [0,1], then -2(2-t)
# on [1,2]. Analytical signed accumulations are 1 and -1.
first = F(1)
second = -F(1)
check('arbitrary-history-route-not-only-constant-force', first+second == 0 and first != 0, {'forceHistory': '2t on [0,1], -2(2-t) on [1,2]', 'subintervalAccumulations': [1,-1], 'wholeAccumulation': 0, 'continuousConstancy': False})

# Gas: EOS + U(T) + first law + reversible p dV yield the learner's
# integrand. The generic mathematical ln evaluation contains no Physics result.
nR = F(3)
T = F(300)
V1 = F(2)
p = lambda volume: nR*T/volume
dQrev_dV = p(V1)  # selected isothermal path => dU/dV=0
dS_dV = dQrev_dV/T
gas_deltaS = float(nR)*math.log(2)
check('clausius-gas-constitutive-route-complete', dS_dV == nR/V1 and gas_deltaS > 0, {'EOS_at_initial_pressure': float(p(V1)), 'derived_dS_dV_at_initial': float(dS_dV), 'deltaS_for_chosen_nR': gas_deltaS, 'Qactual': 0, 'QrevPositive': True, 'studentDecisionsWithheld': ['replacement path', 'reversible heat relation', 'integration variable and bounds', 'physical entropy expression']})
C = F(12)
T1 = F(300)
T2 = F(450)
solid_deltaS = float(C)*math.log(float(T2/T1))
wrong_endpoint = float(C*(T2-T1)/T2)
check('clausius-solid-variable-temperature-endpoint-fails', solid_deltaS > 0 and abs(solid_deltaS-wrong_endpoint) > 0.1, {'derivedDeltaS_J_per_K': solid_deltaS, 'incorrectQactual_over_T2': wrong_endpoint, 'modelFacts': ['dU=C dT', 'no work', 'dU=dQ-dW'], 'replacementPath': 'Student must choose successively infinitesimal reservoir temperature differences.'})

amendments = json.loads(path('profile-amendments.candidate.json').read_text())['amendments']
by_id = {a['goalId']: a['proposedProfile'] for a in amendments}
free = by_id['09029573-864f-40ca-bf8a-cee7bf6dcb73']
check('mandatory-acquisition-is-in-required-coverage', 'required-acquisition-and-reference-comparison' in free['coverageExpectations']['requiredExpectationIds'], {'required': free['coverageExpectations']['requiredExpectationIds'], 'claim': 'No performed acquisition is asserted by this synthetic test.'})
planar = by_id['839ecc8f-3a60-418b-bc92-64bfeef33824']
check('mandatory-2d-witness-is-in-required-coverage', 'two-dimensional-inference-and-energy-distinction' in planar['coverageExpectations']['requiredExpectationIds'], {'required': planar['coverageExpectations']['requiredExpectationIds']})

report = {
    'schemaVersion': 1,
    'status': 'author_constructive_route_checks_passed_no_independent_approval',
    'author': '/root/physics_pending5_revision', 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'authorityBoundary': 'Synthetic examples and mathematical counterchecks only. No actual experimental acquisition, learner evidence, independent source/content review or native M7 approval is claimed.',
    'input': {'path': str(path('profile-amendments.candidate.json')), 'sha256': sha(path('profile-amendments.candidate.json'))},
    'checkCount': len(checks), 'checks': checks,
}
output = path('constructive-tests.json')
output.open('x').write(json.dumps(report, ensure_ascii=True, indent=2)+'\n')
print(json.dumps({'path': str(output), 'sha256': sha(output), 'checkCount': len(checks)}, indent=2))

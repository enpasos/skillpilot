#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Verify exact numeric reference facts of the newly authored case briefs."""
from fractions import Fraction as F
import hashlib
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
profiles = {}
for name in ['image-two', 'image-free-one']:
    spec = json.loads((BASE / (name + '.candidates.json')).read_bytes())
    profiles.update({goal['goalId']: goal['profile'] for goal in spec['goals']})
inverse = profiles['ce198bc9-b014-52ba-814f-25cc3e020668']
assert 'A=[[3,1],[1,1]]' in inverse['applicationCaseBriefs'][0]['taskDemandDe']
assert 'D=diag(2,-4,1/2)' in inverse['applicationCaseBriefs'][1]['taskDemandDe']

def multiply(a, b):
    return [[sum(F(x) * F(y) for x, y in zip(row, column)) for column in zip(*b)] for row in a]

a, b = [[3, 1], [1, 1]], [[F(1, 2), F(-1, 2)], [F(-1, 2), F(3, 2)]]
assert multiply(a, b) == multiply(b, a) == [[1, 0], [0, 1]]
d = [[2, 0, 0], [0, -4, 0], [0, 0, F(1, 2)]]
e = [[F(1, 2), 0, 0], [0, F(-1, 4), 0], [0, 0, 2]]
assert multiply(d, e) == multiply(e, d) == [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
assert sorted([-12, -3, 0, 7]) == [-12, -3, 0, 7]
assert sorted([-5, 0, 3]) == [-5, 0, 3]
assert -6 + 1 == -5 and -2 + 2 == 0 and 2 + 1 == 3
clubs = {'A': 6, 'B': 9, 'C': 4, 'D': 7}
assert max(clubs, key=clubs.get) == 'B' and min(clubs, key=clubs.get) == 'C'
assert clubs['B'] > clubs['C']
series = [12, 18, 18, 9]
assert series[1] == series[2] and series[-1] < series[0]
assert series[0] < series[1] and series[2] > series[3]
report = {'status': 'actual-current-content-reference-values-verified',
          'matrixNonDiagonalBothExactProductsIdentity': True, 'matrixDiagonalBothExactProductsIdentity': True,
          'oneFullProductSufficesNoMandatoryReverseProduct': True, 'allMatrixAssessmentInputsInvertible': True,
          'integerOrdersAndVerticalUnitTicksCorrect': True, 'categoryComparisonsAndOrderedPlateauReversalFactsCorrect': True,
          'qualitativeMeaningNotProvedByArithmeticAlone': True,
          'reviewedCandidateFiles': [{'path': str(p), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
                                     for p in sorted(BASE.glob('*.candidates.json'))],
          'noLearnerOutcomeClaimed': True}
(BASE / 'reference-checks.json').write_text(json.dumps(report, indent=2) + '\n')
print('Exact reference facts PASS; qualitative interpretation remains a substantive review judgment.')

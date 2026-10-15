# SPDX-License-Identifier: Apache-2.0
"""Actual informed whole-profile author review; no independent or human approval."""
from pathlib import Path
import datetime
import json
import math
import sympy as sp

OUT = Path(__file__).resolve().parent
data = json.loads((OUT / 'four-whole-Goal-P-Math-and-independent-Requires-review-input.actual.json').read_text())
rows = {r['goalId'][:8]: r for r in data['rows']}
checks = []


def check(label, actual, expected):
    assert math.isclose(float(actual), float(expected), rel_tol=1e-11, abs_tol=1e-11), (label, actual, expected)
    checks.append({'label': label, 'actual': float(actual), 'expected': float(expected), 'passed': True})


def energy(mass, speed):
    return mass * speed * speed / 2


# Both actual current kinetic cases, then independent fresh numbers and a reversed ground velocity.
for label, m, v, answer in [('car', 1000, 10, 50000), ('light car', 250, 20, 50000),
                           ('train forward', .2, 5, 2.5), ('train backward', .2, -5, 2.5),
                           ('ground forward', .2, 20, 40), ('ground backward', .2, 10, 10),
                           ('fresh baseline', 2.4, -3, 10.8), ('fresh double speed', 2.4, 6, 43.2),
                           ('fresh equal energy A', 4.8, 2, 9.6), ('fresh equal energy B', 1.2, 4, 9.6),
                           ('fresh train', .1, 7, 2.45), ('fresh ground forward', .1, 11, 6.05),
                           ('fresh ground reversed', .1, -3, .45)]:
    check(label, energy(m, v), answer)

# The first brief deliberately asks for a fresh graph, not numeric values on the unscaled illustration.
t = sp.Symbol('t', real=True)
position = t**3 / 20
velocity = sp.diff(position, t)
check('train graph mean over20s', (position.subs(t, 20) - position.subs(t, 0)) / 20, 20)
check('train graph instantaneous8s', velocity.subs(t, 8), 9.6)
for h, expected in [(2, 9.8), (1, 9.65), (.5, 9.6125)]:
    secant = (position.subs(t, 8+h) - position.subs(t, 8-h)) / (2*h)
    check(f'shrinking symmetric secant h={h}', secant, expected)
check('endpoint-speed mean is different', (velocity.subs(t, 0)+velocity.subs(t, 20))/2, 30)
check('uniform40s endpoint', 10 * 40, 400)
check('pause20s then acceleration endpoint', 2 * 20**2 / 2, 400)
check('both complete40s averages', 400 / 40, 10)
check('accelerated final velocity differs', 2 * 20, 40)

# All actual circular cases and a fresh non-unit period/radius transfer.
check('turntable omega', 2 * math.pi * .8, 1.6 * math.pi)
check('turntable vA', 1.6 * math.pi * .1, .16 * math.pi)
check('turntable vB', 1.6 * math.pi * .3, .48 * math.pi)
check('drum omega initially', 2 * math.pi / .5, 4 * math.pi)
check('drum v initially', 4 * math.pi * .25, math.pi)
check('drum omega afterwards', 2 * math.pi / 1, 2 * math.pi)
check('drum v afterwards', 2 * math.pi * .25, math.pi / 2)
check('fresh omega T=.8', 2 * math.pi / .8, 2.5 * math.pi)
check('fresh radius .12', 2.5 * math.pi * .12, .3 * math.pi)
check('fresh radius .36', 2.5 * math.pi * .36, .9 * math.pi)
check('fresh partial arc angular rate', (math.pi / 3) / .2, 5 * math.pi / 3)
check('fresh partial arc tangential rate', (.12 * math.pi / 3) / .2, math.pi / 5)

# Whole literal AC cases, including passive terminal polarity and changed controlled quantities.
u_c = 2 * sp.sin(1000*t)
i_c = sp.Rational(1, 100000) * sp.diff(u_c, t)
assert sp.simplify(i_c - sp.Rational(1, 50) * sp.cos(1000*t)) == 0
check('literal C current amplitude', .020, .020)
check('literal C doubled omega', 2000 * 10e-6 * 2, .040)
i_l = sp.Rational(1, 100) * sp.sin(500*t)
u_l = sp.Rational(1, 5) * sp.diff(i_l, t)
assert sp.simplify(u_l - sp.cos(500*t)) == 0
check('literal L amplitude ratio', 1 / .010, 100)
check('literal L doubled omega fixedU', 1 / (1000 * .2), .005)
fresh_u_c = 4 * sp.cos(2000*t+sp.pi/3)
fresh_i_c = sp.Rational(1, 400000) * sp.diff(fresh_u_c, t)
assert sp.simplify(fresh_i_c-sp.Rational(1, 50)*sp.cos(2000*t+sp.pi/3+sp.pi/2)) == 0
check('fresh C base current', 2000 * 2.5e-6 * 4, .020)
check('fresh C triple frequency fixedU', 6000 * 2.5e-6 * 4, .060)
fresh_i_l = sp.Rational(1, 25) * sp.cos(120*t-sp.pi/4)
fresh_u_l = sp.Rational(3, 20) * sp.diff(fresh_i_l, t)
assert sp.simplify(fresh_u_l-sp.Rational(18,25)*sp.cos(120*t-sp.pi/4+sp.pi/2)) == 0
check('fresh L voltage amplitude', .15 * 120 * .04, .72)
check('fresh L half frequency fixedU', .72 / (.15 * 60), .08)

judgments = {
    '7eeff2de': {
        'decision': 'keep',
        'analysis': 'Whole DE/EN Goal and both mandatory expectation/case blocks actually read. Literal50kJ/50kJ and train2.5/2.5 versus ground40/10 are correct. Linear mass and quadratic speed dependence, nonnegative scalar energy, reference-frame dependence and equal-energy nonuniqueness are all operationalized. Supplied formula/units do not replace the newly explicit substitution preparation. Fresh2.4kg at−3m/s gives10.8J; doubling speed gives43.2J. A4.8kg/2m/s and1.2kg/4m/s pair both give9.6J. With train4m/s and relative±7m/s, a0.1kg ball has2.45J in either train direction but6.05J/.45J on the ground, including a reversed ground velocity. No profile/body weakening or extra task quota.',
        'imageContext': 'Actual current JPG viewed. Formula and2kg values1/4/9J show quadratic scaling; illustration is a compatible introduction, not evidence of student mastery or fresh V approval.',
    },
    'bf8517a9': {
        'decision': 'keep',
        'analysis': 'Whole DE/EN Goal/P read. The mandatory performances require the student to choose an interval/instant, construct secant/tangent and interpret sign/units; the open graph brief intentionally requires a task-specific graph. It does not supply a false universal numeric answer. Fresh instantiation s=t^3/20 over20s gives mean20m/s, v(8)=9.6m/s, and shrinking symmetric slopes9.8/9.65/9.6125. Endpoint-speed mean30m/s refutes the unsupported averaging rule. Uniform10m/s for40s and20s pause then2m/s² acceleration both cover400m, yet have different local velocities. Both new Math guards preserve the construction/local-rate duties; no reduction to data supplied by the coach.',
        'imageContext': 'Actual unscaled secant/tangent PNG viewed. It conveys qualitative geometry; a teacher/coach must supply a scaled train graph for the numeric brief. No numerical20s/8s reading is claimed from the illustration.',
    },
    'ec7a0a68': {
        'decision': 'keep',
        'analysis': 'Whole DE/EN Goal/P and all3required expectations read. Actual turntable1.6πrad/s with0.16π/0.48πm/s and drum4π/π then2π/π2 are consistent. Definitions, angular versus tangential units/direction, derivation from s=rφ and a changed fixed quantity are required independently of numeric substitution. The finite revolution examples concern uniform rotation; instantaneous extension uses the same local relation rather than treating a varying speed as constant. Fresh T=.8s at radii.12/.36m yieldsω2.5π andv.3π/.9π. Aπ/3arc in.2s at.12m givesω5π/3 andvπ/5. Radian and substitution guards add preparation without changing these duties.',
        'imageContext': 'Actual PNG viewed. At the rightmost point the counterclockwise rotation and upward tangential arrow agree; r is radial and the displayed sameω radius statement is correct. No new V acceptance.',
    },
    'ef0f2391': {
        'decision': 'keep',
        'analysis': 'Whole DE/EN Goal/P read and both derivative cases solved. Capacitor result.020cos(1000t) and doubling to.040A are correct; inductor1cos(500t)V and fixed-voltage doublingω to5mA are correct. Passive terminal polarity is explicitly separated from opposing induced-emf convention, ideal lossless scope excludes an unasked combined RLC problem. Fresh cosine-origin examples preserve the+π/2 derivative shift: C2.5μF,U4V,ω2000 gives20mA and60mA at tripleω; L.15H,I.04A,ω120 gives.72V, then.08A at halfω withUfixed. The two Math additions do not newly approve minimality of the retained broad Physics prerequisites or repair the independently known37fself-induction-profile issue.',
        'imageContext': 'Actual JPG viewed. IdealC current leadsU by90degrees and idealL current lagsU by90degrees, with reciprocalωC versusωL reactance formulas. It is consistent with the mandatory differential derivation; slogans alone do not satisfy P. No new V acceptance.',
    },
}
records = []
for prefix, judgment in judgments.items():
    row = rows[prefix]
    records.append({'goalId': row['goalId'], **judgment,
                    'wholeDE_ENGoalAndEveryExpectationCoverageVariationAndCaseFieldActuallyRead': True,
                    'profileBodyOrGoalTextChanged': False,
                    'statusAuthorityEvidenceMaximumClaimScopeUnchanged': True,
                    'newIndependentScientificSourceKindDPHumanOrHostApproval': False})
output = {'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'actualAuthor': '/root; fresh informed four-current-P author; configured6.1SolUltra requested, serving build unobserved',
          'role': 'Author keep judgments only; independent P/Kind review pending, D not performed.',
          'records': records, 'numericAssertionsActuallyExecuted': checks,
          'symbolicDerivativeEqualitiesActuallyChecked': 4,
          'originalHumanApprovalOrLearnerTrialClaim': False,
          'minimumIndependentDemonstrationsDoesNotMeanAnExtraTaskQuota': True}
p = OUT / 'four-genuine-whole-P-author-judgments-and-executed-cases.actual.json'
assert not p.exists()
p.write_text(json.dumps(output, ensure_ascii=False, indent=2)+'\n')
print(json.dumps({'informedAuthorKeep': 4, 'actualNumericChecks': len(checks), 'symbolicChecks': 4, 'newIndependentApprovals': 0, 'MainWrites': False}))

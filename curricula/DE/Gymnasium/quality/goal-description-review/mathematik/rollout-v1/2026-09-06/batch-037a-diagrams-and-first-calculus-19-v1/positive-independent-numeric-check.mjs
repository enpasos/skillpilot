import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Independent arithmetic fixtures transcribed from all 38 current task briefs.
// This script is read-only: it prints a receipt and does not write any file.
// It does not execute learners, parse prose into mathematics, or grant approval.
const scriptPath = fileURLToPath(import.meta.url)
const repositoryRoot = resolve(dirname(scriptPath), ...Array(9).fill('..'))
const sourcePath = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-037a-diagrams-and-first-calculus-19-v1.candidates.json'
const expectedSourceDigest = 'sha256:344f54905899f4c7f574cdab0316bf1c5c1c516108711abfc8a2dfdc987fac37'
const digest = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const sourceBytes = readFileSync(resolve(repositoryRoot, sourcePath))
assert.equal(digest(sourceBytes), expectedSourceDigest, 'Candidate bytes changed: reread before rebinding this audit')
const source = JSON.parse(sourceBytes)
assert.equal(source.goals.length, 19)
const boundCases = source.goals.flatMap(goal => goal.profile.applicationCaseBriefs.map(item => ({ goalId: goal.goalId, caseId: item.id })))
assert.equal(boundCases.length, 38)

const results = []
let active
function exact(label, actual, expected) {
  assert.deepEqual(actual, expected, `${active.caseId}: ${label}`)
  active.assertions.push({ label, actual, expected, comparison: 'exact', passed: true })
}
function near(label, actual, expected, tolerance = 1e-10) {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance, `${active.caseId}: ${label}; actual ${actual}, expected ${expected}`)
  active.assertions.push({ label, actual, expected, absoluteTolerance: tolerance, comparison: 'absolute_error', passed: true })
}
function check(goalIndex, caseId, calculation) {
  const goal = source.goals[goalIndex]
  assert.ok(goal.profile.applicationCaseBriefs.some(item => item.id === caseId), `Unknown case ${caseId}`)
  active = { goalId: goal.goalId, caseId, assertions: [], interpretationReview: '', passed: true }
  calculation()
  assert.ok(active.assertions.length > 0)
  assert.ok(active.interpretationReview.length > 0)
  results.push(active)
}
const slope = (x0, y0, x1, y1) => (y1 - y0) / (x1 - x0)
const degrees = radians => radians * 180 / Math.PI
const angle = m => degrees(Math.atan(m))
const evaluate = (coefficients, x) => coefficients.reduceRight((sum, c) => sum * x + c, 0)
const derivative = coefficients => coefficients.slice(1).map((c, index) => c * (index + 1))
const add = (a, b) => Array.from({ length: Math.max(a.length, b.length) }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0))
const multiply = (a, b) => {
  const c = Array(a.length + b.length - 1).fill(0)
  a.forEach((left, i) => b.forEach((right, j) => { c[i + j] += left * right }))
  return c
}
const trim = a => {
  const result = [...a]
  while (result.length > 1 && result.at(-1) === 0) result.pop()
  return result
}
// Exact bivariate polynomial identities in x,h: keys are exponent pairs.
const X = { '1,0': 1 }
const H = { '0,1': 1 }
const biAdd = (...polys) => {
  const result = {}
  for (const p of polys) for (const [key, value] of Object.entries(p)) result[key] = (result[key] ?? 0) + value
  return Object.fromEntries(Object.entries(result).filter(([, value]) => value !== 0).sort(([a], [b]) => a.localeCompare(b)))
}
const biScale = (p, c) => biAdd(Object.fromEntries(Object.entries(p).map(([key, value]) => [key, value * c])))
const biMultiply = (p, q) => {
  const terms = []
  for (const [pk, pv] of Object.entries(p)) for (const [qk, qv] of Object.entries(q)) {
    const [px, ph] = pk.split(',').map(Number), [qx, qh] = qk.split(',').map(Number)
    terms.push({ [`${px + qx},${ph + qh}`]: pv * qv })
  }
  return biAdd(...terms)
}
const biPower = (p, n) => Array.from({ length: n }).reduce(result => biMultiply(result, p), { '0,0': 1 })
const divideByH = p => Object.fromEntries(Object.entries(p).map(([key, value]) => {
  const [xPower, hPower] = key.split(',').map(Number)
  assert.ok(hPower >= 1, 'Exact cancellation requires an h factor in every term')
  return [`${xPower},${hPower - 1}`, value]
}).sort(([a], [b]) => a.localeCompare(b)))

check(0, 'temperature-scale', () => {
  exact('Time midpoint in hours', (2 + 4) / 2, 3)
  exact('Temperature midpoint in degrees Celsius', (0 + 10) / 2, 5)
  active.interpretationReview = 'Uniform scales support 3 h and 5 °C; the axis roles are preserved in both expected answers.'
})
check(0, 'horizontal-unit-factor', () => {
  exact('Group A amount in euros', 2 * 100, 200)
  exact('Group B amount in euros', ((3 + 4) / 2) * 100, 350)
  exact('Amount difference in euros', (((3 + 4) / 2) - 2) * 100, 150)
  active.interpretationReview = 'A and B are categories, while the horizontal numerical readings carry a factor of 100 euros.'
})
check(1, 'reservoir-trend', () => {
  const points = [[0, 20], [2, 60], [5, 60], [7, 40]]
  const highest = Math.max(...points.map(([, volume]) => volume))
  exact('Three segment rates in litres per hour', [slope(0, 20, 2, 60), slope(2, 60, 5, 60), slope(5, 60, 7, 40)], [20, 0, -10])
  exact('Highest volume', highest, 60)
  exact('Plateau endpoints in hours', points.filter(([, volume]) => volume === highest).map(([time]) => time), [2, 5])
  active.interpretationReview = 'Linear segments attain 60 L throughout [2,5]; filling, plateau and decline agree with the signs.'
})
check(1, 'two-distance-lines', () => {
  const a = slope(0, 0, 4, 24), b = slope(0, 8, 4, 16)
  exact('Line slopes in kilometres per hour', [a, b], [6, 2])
  const t = 8 / (a - b)
  exact('Intersection time and distance', [t, a * t, 8 + b * t], [2, 12, 12])
  exact('Intersection belongs to displayed interval', t >= 0 && t <= 4, true)
  active.interpretationReview = 'The 8 km initial offset and faster slope of A give equality at 2 h, followed by A being ahead within the given range.'
})
check(2, 'truncated-bars', () => {
  near('Actual value ratio', 55 / 50, 1.1)
  exact('Actual percentage increase', (55 - 50) / 50 * 100, 10)
  exact('Visible bar-length ratio', (55 - 45) / (50 - 45), 2)
  active.interpretationReview = 'The visible doubling concerns differences from 45; the data increase is only 10 percent.'
})
check(2, 'unequal-time-gaps', () => {
  exact('First interval length and rate', [1 - 0, slope(0, 0, 1, 10)], [1, 10])
  exact('Second interval length', 10 - 1, 9)
  near('Second interval rate and published rounding', slope(1, 10, 10, 20), 1.11, 0.005)
  active.interpretationReview = 'Equal drawn gaps do not represent equal durations; 10 and 10/9 units per year differ.'
})
check(3, 'square-pictograms', () => {
  exact('Displayed area ratio', 2 ** 2 / 1 ** 2, 4)
  exact('Data ratio', 20 / 10, 2)
  active.interpretationReview = 'Equal-width bars of lengths 10 and 20 correctly show the factor of two rather than a fourfold area change.'
})
check(3, 'different-class-sizes', () => {
  exact('Participation percentages', [12 / 20 * 100, 15 / 30 * 100], [60, 50])
  exact('Absolute and relative order differ', 15 > 12 && 15 / 30 < 12 / 20, true)
  active.interpretationReview = 'The percentage comparison needs group sizes; the proposed percentage bars retain this reference information.'
})
check(4, 'travel-average', () => {
  exact('Distance increment and time interval', [460 - 100, 5 - 2], [360, 3])
  exact('Average speed in metres per minute', slope(2, 100, 5, 460), 120)
  exact('Conversion to metres per second', slope(2, 100, 5, 460) / 60, 2)
  active.interpretationReview = 'Two cumulative distance values determine the interval average but do not determine every instantaneous speed.'
})
check(4, 'cooling-average', () => {
  const T = t => evaluate([80, -3, 0.1], t)
  near('Temperature at 2 minutes', T(2), 74.4)
  near('Temperature at 6 minutes', T(6), 65.6)
  near('Average rate in degrees Celsius per minute', slope(2, T(2), 6, T(6)), -2.2)
  exact('Requested interval lies inside model domain', 0 <= 2 && 2 < 6 && 6 <= 8, true)
  active.interpretationReview = 'The negative interval average is consistent with a nonlinear temperature model, without implying a constant local cooling rate.'
})
check(5, 'h-square', () => {
  const hs = [0.1, -0.1, 0.01, -0.01], expected = [4.1, 3.9, 4.01, 3.99]
  hs.forEach((h, i) => near(`Direct difference quotient h=${h}`, ((2 + h) ** 2 - 4) / h, expected[i]))
  const numerator = add(multiply([2, 1], [2, 1]), [-4])
  exact('Exact numerator after expansion around x0=2', numerator, [0, 4, 1])
  assert.equal(numerator[0], 0)
  const quotient = numerator.slice(1)
  exact('Quotient after h cancellation', quotient, [4, 1])
  exact('Limit of 4+h', evaluate(quotient, 0), 4)
  active.interpretationReview = 'All four h values are nonzero; polynomial cancellation gives an exact limiting argument, while the finite table alone does not prove convergence.'
})
check(5, 'h-reciprocal', () => {
  const hs = [0.1, -0.1, 0.01, -0.01], expected = [-0.909091, -1.111111, -0.990099, -1.010101]
  hs.forEach((h, i) => {
    exact(`Domain at h=${h}`, h !== 0 && h !== -1, true)
    near(`Direct quotient at h=${h}`, (1 / (1 + h) - 1) / h, expected[i], 0.0000005)
    near(`Algebraic quotient agreement at h=${h}`, (1 / (1 + h) - 1) / h, -1 / (1 + h))
  })
  exact('Common numerator of 1/(1+h)-1', add([1], [-1, -1]), [0, -1])
  exact('Limit of -1/(1+h)', -1 / (1 + 0), -1)
  active.interpretationReview = 'The original difference quotient requires h not equal to 0 or -1; the simplified rational expression establishes the finite limit -1.'
})
check(6, 'cube-justification', () => {
  const numerator = biAdd(biPower(biAdd(X, H), 3), biScale(biPower(X, 3), -1))
  const quotient = divideByH(numerator)
  exact('Exact cubic difference quotient in x and h', quotient, { '0,2': 1, '1,1': 3, '2,0': 3 })
  exact('Terms surviving h to zero', Object.fromEntries(Object.entries(quotient).filter(([key]) => key.endsWith(',0'))), { '2,0': 3 })
  active.interpretationReview = 'The exact polynomial identity holds for every real x with h nonzero and yields 3x²; it proves this exponent case, not all integer cases.'
})
check(6, 'negative-power-justification', () => {
  exact('Common numerator x-(x+h)', biAdd(X, biScale(biAdd(X, H), -1)), { '0,1': -1 })
  exact('Common denominator x(x+h)', biMultiply(X, biAdd(X, H)), { '1,1': 1, '2,0': 1 })
  for (const x of [-2, -0.5, 1, 3]) {
    near(`Cancelled quotient at x=${x}`, (1 / (x + 0.1) - 1 / x) / 0.1, -1 / (x * (x + 0.1)))
    near(`Negative-exponent rule at x=${x}`, -1 / x ** 2, -1 * x ** -2)
  }
  const originalQuotientDomain = (x, h) => x !== 0 && h !== 0 && x + h !== 0
  exact('Required domain exclusions and an admissible pair', [[0, 1], [1, 0], [1, -1], [1, 0.1]].map(([x, h]) => originalQuotientDomain(x, h)), [false, false, false, true])
  active.interpretationReview = 'The independent algebra preserves x≠0, h≠0 and x+h≠0 before cancellation; the limiting derivative retains x≠0.'
})
check(7, 'constant-multiple', () => {
  exact('Derivative coefficients of -3x²+5', derivative([5, 0, -3]), [0, -6])
  exact('Constant term derivative', derivative([5]), [])
  near('Constant extraction identity witness', (-3 * 7 - (-3 * 2)) / 0.5, -3 * (7 - 2) / 0.5)
  active.interpretationReview = 'The symbolic reasoning factors a fixed c from the difference quotient and uses differentiability of u. The witness is a calculation check, not a substitute for that general justification.'
})
check(7, 'sum-cancellation', () => {
  const u = [0, 0, 0, 1], v = [0, 2, 0, -1]
  exact('Simplified sum coefficients', trim(add(u, v)), [0, 2])
  exact('Sum of derivatives', trim(add(derivative(u), derivative(v))), [2])
  exact('Derivative of simplified sum', derivative(trim(add(u, v))), [2])
  active.interpretationReview = 'The quoted general proof splits the sum quotient into two existing limits; cancellation gives the same constant derivative through either calculation order.'
})
check(8, 'expanded-polynomial', () => {
  exact('Derivative coefficients', derivative([-7, 5, -2, 0, 3]), [5, -4, 0, 12])
  active.interpretationReview = 'The four source summands contribute 12x³, -4x, 5 and 0, including the negative signs and factors.'
})
check(8, 'rearranged-polynomial', () => {
  const expanded = add(multiply([-2, 1], [1, 1]), [0, 0, 1])
  exact('Expanded polynomial coefficients', expanded, [-2, -1, 2])
  exact('Derivative coefficients', derivative(expanded), [-1, 4])
  active.interpretationReview = 'Expansion gives an equivalent polynomial 2x²-x-2 and differentiation gives 4x-1 using only the requested rules.'
})
check(9, 'position-rate', () => {
  const tangent = t => 12 + -2 * (t - 3)
  exact('Tangent passes through the given position', tangent(3), 12)
  exact('Tangent slope in the stated axis units', slope(3, tangent(3), 4, tangent(4)), -2)
  active.interpretationReview = 'Position 12 m and instantaneous signed velocity -2 m/s are distinct quantities; the data do not impose constant velocity on any interval.'
})
check(9, 'zero-volume-rate', () => {
  const witness = [125, -10, 1]
  exact('A compatible smooth witness has the three volumes', [4, 5, 6].map(t => evaluate(witness, t)), [101, 100, 101])
  exact('Witness derivative at 5 minutes', evaluate(derivative(witness), 5), 0)
  exact('Given unequal volume values refute constancy', 101 !== 100, true)
  active.interpretationReview = 'V(t)=100+(t-5)² is a constructed compatibility witness, not a claim that the task uniquely specifies that function. The marked values already refute constant volume.'
})
check(10, 'parabola-slope-assignment', () => {
  const d = derivative([-1, 0, 1])
  exact('Derivative coefficients', d, [0, 2])
  exact('Requested derivative values', [-2, -1, 0, 1].map(x => evaluate(d, x)), [-4, -2, 0, 2])
  exact('Original heights differ from derivative values', [-2, -1, 0, 1].map(x => evaluate([-1, 0, 1], x)), [3, 0, -1, 0])
  active.interpretationReview = 'The term identity f′=2x, not interpolation from four isolated samples, determines the derivative function on all real inputs.'
})
check(10, 'constant-slope-assignment', () => {
  const m = slope(-1, 5, 1, 11), b = 5 - m * -1
  exact('Affine slope and intercept', [m, b], [3, 8])
  exact('Derivative of the resulting line', derivative([b, m]), [3])
  active.interpretationReview = 'The full graph is explicitly affine, so its derivative is identically 3 rather than only matching two sampled slopes.'
})
check(11, 'cubic-graph-to-derivative', () => {
  const f = [0, -3, 0, 1], d = derivative(f)
  exact('Derivative coefficients', d, [-3, 0, 3])
  exact('Stated extremum coordinates', [evaluate(f, -1), evaluate(f, 1)], [2, -2])
  exact('Derivative zeros', [evaluate(d, -1), evaluate(d, 1)], [0, 0])
  exact('Sign-interval witnesses', [-2, 0, 2].map(x => Math.sign(evaluate(d, x))), [1, -1, 1])
  exact('Factorized derivative identity', multiply([-3, 3], [1, 1]), [-3, 0, 3])
  active.interpretationReview = '3(x-1)(x+1) proves the stated signs. The dependence 3x²-3 decreases up to 0 and increases thereafter without requiring a second derivative; the sample signs are illustrative only.'
})
check(11, 'derivative-with-touching-zero', () => {
  exact('Derivative of cubic with arbitrary example constant', derivative([7, 0, 0, 1]), [0, 0, 3])
  exact('Stationary derivative at zero', evaluate([0, 0, 3], 0), 0)
  exact('Cubic values across zero for two heights', [-1, 0, 1].map(x => evaluate([7, 0, 0, 1], x)), [6, 7, 8])
  exact('A changed integration constant preserves derivative', derivative([-4, 0, 0, 1]), derivative([7, 0, 0, 1]))
  active.interpretationReview = 'For a<b, b³-a³=(b-a)(a²+ab+b²)>0, proving strict increase even through the isolated derivative zero. f(0)=C remains free; there is no extremum at zero.'
})
check(12, 'two-antiderivatives', () => {
  exact('Both derivatives', [derivative([3, 0, 1]), derivative([-4, 0, 1])], [[0, 2], [0, 2]])
  exact('Difference of antiderivatives', trim(add([3, 0, 1], [4, 0, -1])), [7])
  active.interpretationReview = 'The constant difference 7 vanishes under differentiation; the requirement F′=f does not require F=f or a unique height.'
})
check(12, 'zero-function', () => {
  exact('Constant derivative values', [evaluate(derivative([5]), -1), evaluate(derivative([5]), 1)], [0, 0])
  exact('Derivative of x', derivative([0, 1]), [1])
  exact('Checked inputs are interior to the open interval', -2 < -1 && 1 < 2, true)
  active.interpretationReview = 'Any constant function has derivative zero throughout (-2,2), whereas G=x has derivative one and is not an antiderivative of the given zero function.'
})
check(13, 'rising-tangent-angle', () => {
  const f = [0, 0, 1], x0 = 1, y0 = evaluate(f, x0), m = evaluate(derivative(f), x0)
  exact('Point and tangent coefficients', [x0, y0, y0 - m * x0, m], [1, 1, -1, 2])
  near('Principal slope angle in degrees', angle(m), 63.43, 0.005)
  active.interpretationReview = 'With equal axis scaling and the stated principal arctangent convention, the tangent y=2x-1 has angle about 63.43 degrees.'
})
check(13, 'falling-reciprocal-angle', () => {
  const x0 = 1, y0 = 1 / x0, m = -1 / x0 ** 2
  exact('Admissible contact and tangent coefficients', [x0 !== 0, y0, y0 - m * x0, m], [true, 1, 2, -1])
  near('Principal slope angle in degrees', angle(m), -45)
  active.interpretationReview = 'The reciprocal is defined at x=1; its tangent y=-x+2 has the negative angle -45 degrees under the same convention.'
})
check(14, 'ramp-guide', () => {
  const x0 = 1, y0 = 1, mT = 2, mN = -1 / mT, bT = y0 - mT * x0, bN = y0 - mN * x0
  exact('Tangent and normal coefficients', [bT, mT, bN, mN], [-1, 2, 1.5, -0.5])
  exact('Common contact point', [bT + mT * x0, bN + mN * x0], [1, 1])
  exact('Perpendicular slope product', mT * mN, -1)
  exact('Normal ground intersection', [-bN / mN, 0], [3, 0])
  active.interpretationReview = 'Equal metre scaling supports the Euclidean perpendicularity calculation; these lines describe the specified local attachment, not the full curved ramp.'
})
check(14, 'vertex-support', () => {
  const f = [5, -4, 1], x0 = 2
  exact('Vertex position and tangent slope', [x0, evaluate(f, x0), evaluate(derivative(f), x0)], [2, 1, 0])
  exact('Vertical normal foot point', [x0, 0], [2, 0])
  exact('Normal direction is perpendicular to horizontal tangent', 1 * 0 + 0 * 1, 0)
  active.interpretationReview = 'The tangent is y=1 and the normal is x=2; no expression -1/0 is evaluated or interpreted as a finite slope.'
})
check(15, 'three-regular-angles', () => {
  const mS = slope(0, 0, 1, 1), mT = evaluate(derivative([0, 0, 1]), 1), mN = -1 / mT
  exact('Three slopes', [mS, mT, mN], [1, 2, -0.5])
  ;[45, 63.43, -26.57].forEach((expected, i) => near(`Principal angle ${i + 1}`, angle([mS, mT, mN][i]), expected, 0.005))
  near('Tangent-normal angle difference', angle(mT) - angle(mN), 90)
  active.interpretationReview = 'The angles use the stated signed principal convention; the tangent-normal difference is 90 degrees although the normal angle is negative.'
})
check(15, 'horizontal-tangent-angles', () => {
  const f = [1, 0, -1], mS = slope(0, evaluate(f, 0), 2, evaluate(f, 2)), mT = evaluate(derivative(f), 0)
  exact('Secant endpoint values and slopes', [evaluate(f, 0), evaluate(f, 2), mS, mT], [1, -3, -2, 0])
  near('Signed secant angle', angle(mS), -63.43, 0.005)
  near('Horizontal tangent angle', angle(mT), 0)
  near('Undirected vertical normal angle', degrees(Math.acos(0)), 90)
  active.interpretationReview = 'The task separately specifies the undirected 90-degree angle for the vertical normal; there is no finite normal slope.'
})
check(16, 'acute-graph-intersection', () => {
  const x = 1, m1 = 2 * x, m2 = 1
  exact('Shared point', [x ** 2, x], [1, 1])
  exact('Tangent slopes', [m1, m2], [2, 1])
  near('Smaller tangent angle', Math.abs(angle(m1) - angle(m2)), 18.43, 0.005)
  near('Independent vector-angle check', degrees(Math.acos((1 + m1 * m2) / Math.hypot(1, m1) / Math.hypot(1, m2))), 18.43, 0.005)
  active.interpretationReview = 'The specified point is x=1; the other intersection at x=0 is not used. Both angle methods give the smaller local angle about 18.43 degrees.'
})
check(16, 'orthogonal-intersection', () => {
  const m1 = 1, m2 = -1
  exact('Shared point values', [0, -0 + 0], [0, 0])
  exact('Slope product and tangent-formula denominator', [m1 * m2, 1 + m1 * m2], [-1, 0])
  near('Vector angle in degrees', degrees(Math.acos((1 + m1 * m2) / Math.hypot(1, m1) / Math.hypot(1, m2))), 90)
  active.interpretationReview = 'Zero denominator is a limitation of that tangent quotient formula, not a missing geometric angle; the directions are perpendicular.'
})
check(17, 'corner-versus-smooth', () => {
  exact('Absolute-value one-sided difference quotients', [-0.1, 0.1].map(h => Math.abs(h) / h), [-1, 1])
  exact('Parabola derivative at zero', evaluate(derivative([0, 0, 1]), 0), 0)
  active.interpretationReview = 'The absolute-value side quotients are identically -1 and +1, proving different side limits; the parabola has the common finite derivative zero.'
})
check(17, 'jump-with-parallel-branches', () => {
  const f = x => x < 0 ? x : x + 1
  exact('Actual value at zero and left-branch limiting value', [f(0), 0], [1, 0])
  near('Right difference quotient', (f(0.01) - f(0)) / 0.01, 1)
  near('Left difference quotient at h=-0.01', (f(-0.01) - f(0)) / -0.01, 101)
  exact('Both branch slopes', [derivative([0, 1]), derivative([1, 1])], [[1], [1]])
  active.interpretationReview = 'The left quotient is (h-1)/h=1-1/h and diverges for h→0−; the right quotient is 1. Open (0,0) and closed (0,1) express the jump despite parallel branches.'
})
check(18, 'wall-enclosure', () => {
  const A = [0, 30, -2], d = derivative(A), a = -d[0] / d[1], b = 30 - 2 * a
  exact('Derivative coefficients', d, [30, -4])
  exact('Stationary dimensions and maximum area', [a, b, evaluate(A, a)], [7.5, 15, 112.5])
  exact('Interior feasibility and fence constraint', [a > 0 && a < 15, 2 * a + b], [true, 30])
  exact('Degenerate endpoint areas', [evaluate(A, 0), evaluate(A, 15)], [0, 0])
  exact('Derivative sign around interior candidate', [Math.sign(evaluate(d, 7)), Math.sign(evaluate(d, 8))], [1, -1])
  active.interpretationReview = 'A′=30-4a changes from positive to negative at 7.5 and A=112.5-2(a-7.5)² proves the global maximum on 0<a<15. Zero endpoint areas refer to degenerate limiting rectangles.'
})
check(18, 'capacity-limited-profit', () => {
  const G = [-64, 20, -1], d = derivative(G), stationary = -d[0] / d[1]
  exact('Derivative coefficients and unconstrained stationary point', [d, stationary], [[20, -2], 10])
  exact('Stationary point excluded by capacity', stationary > 8, true)
  exact('Derivative at domain ends', [evaluate(d, 0), evaluate(d, 8)], [20, 4])
  exact('Profit at both domain ends', [evaluate(G, 0), evaluate(G, 8)], [-64, 32])
  const discrete = Array.from({ length: 9 }, (_, q) => ({ q, profit: evaluate(G, q) }))
  const best = discrete.reduce((a, b) => a.profit > b.profit ? a : b)
  exact('Exhaustive integer-domain maximizer', best, { q: 8, profit: 32 })
  active.interpretationReview = 'The affine derivative decreases only to 4 on [0,8] and is positive throughout; therefore q=8 is also the continuous maximum. Integer enumeration confirms the same feasible boundary answer.'
})

assert.deepEqual(results.map(({ goalId, caseId }) => ({ goalId, caseId })), boundCases, 'Every source case must be audited exactly once in source order')
assert.equal(new Set(results.map(({ goalId, caseId }) => `${goalId}:${caseId}`)).size, 38)
const receipt = {
  schemaVersion: 1,
  checkType: 'independent_numeric_algebraic_countercheck',
  batchId: 'mathematik-rollout-v1-batch-037a-diagrams-and-first-calculus-19-v1-20260906',
  checkedAt: new Date().toISOString(),
  status: 'PASS',
  independence: {
    reviewer: 'independent-round-b-agent',
    authoredCandidateProfiles: false,
    authorNumericReportConsulted: false,
    sourceMutationPerformed: false,
  },
  sourceBinding: { path: sourcePath, digest: digest(sourceBytes), bytes: sourceBytes.length, reviewId: source.reviewId },
  scriptBinding: { path: scriptPath.slice(repositoryRoot.length + 1), digest: digest(readFileSync(scriptPath)) },
  scope: {
    goals: results.length / 2,
    applicationCases: results.length,
    assertions: results.reduce((count, result) => count + result.assertions.length, 0),
    bilingualTaskAndExpectedPerformanceRead: true,
    sourceNaturalLanguageParsedAutomatically: false,
    numericalAndAlgebraicFixturesDerivedIndependentlyFromTaskStatements: true,
    domainAngleAndOptimizationReasoningManuallyReviewed: true,
    allCandidateProfileSemanticsCertified: false,
  },
  authority: {
    aiCandidateOnly: true,
    humanApprovalGranted: false,
    learnerExecutionPerformed: false,
    masteryOrProgressGranted: false,
  },
  findings: [],
  results,
}
process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`)

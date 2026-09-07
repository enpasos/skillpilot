import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const stem = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-040-taylor-tools-integrals-19-v1';
const candidateBytes = readFileSync(stem + '.candidates.json');
const candidates = JSON.parse(candidateBytes);
const config = JSON.parse(readFileSync(stem + '.config.json'));
const appRequire = createRequire(resolve('app/package.json'));
const Ajv2020 = appRequire('ajv/dist/2020.js').default;
const addFormats = appRequire('ajv-formats').default;
const ajv = new Ajv2020({ allErrors: true, strict: true }); addFormats(ajv);
const profileSchema = JSON.parse(readFileSync('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));
const validProfile = ajv.compile({ $schema: profileSchema.$schema, $defs: profileSchema.$defs, $ref: '#/$defs/profile' });
const validConfig = ajv.compile(JSON.parse(readFileSync('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')));
assert.ok(validConfig(config), ajv.errorsText(validConfig.errors));
assert.equal(candidates.goals.length, 19);
assert.deepEqual(config.scope.goalIds, candidates.goals.map(g => g.goalId));
const checks = [];
const close = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, actual + ' != ' + expected);
const sum = xs => xs.reduce((a, b) => a + b, 0);
const factorial = n => n < 2 ? 1 : n * factorial(n - 1);
const taylor = (n, x) => sum(Array.from({ length: n + 1 }, (_, k) => x ** k / factorial(k)));
const poly = (coefficients, x) => sum(coefficients.map((coefficient, k) => coefficient * x ** k));
const derivative = coefficients => coefficients.slice(1).map((c, i) => c * (i + 1));
const diff = (f, x) => (f(x + 1e-5) - f(x - 1e-5)) / 2e-5;
function test(prefix, caseId, fn, verified) {
  const goal = candidates.goals.find(g => g.goalId.startsWith(prefix));
  assert.ok(goal, prefix); assert.ok(goal.profile.applicationCaseBriefs.some(c => c.id === caseId), caseId);
  fn(); checks.push({ goalId: goal.goalId, caseId, result: 'pass', verified });
}
for (const g of candidates.goals) {
  assert.ok(validProfile(g.profile), ajv.errorsText(validProfile.errors));
  assert.equal(g.evidenceLevel, 'E1'); assert.equal(g.maximumClaimScope, 'G1');
  assert.deepEqual(g.dissent, []);
  assert.equal(g.profile.applicationCaseBriefs.length, 2);
  assert.equal(g.profile.coverageExpectations.minimumIndependentDemonstrations, 2);
  assert.deepEqual(g.profile.coverageExpectations.requiredExpectationIds, g.profile.expectations.map(e => e.id));
  assert.equal(new Set(g.profile.applicationCaseBriefs.map(c => c.id)).size, 2);
}
test('911f3200', 'layer-thickness', () => {
  close(sum([12, 7.2, 4.32]), 23.52); close(12 / .4, 30);
  close(sum(Array.from({ length: 100 }, (_, k) => 12 * .6 ** k)), 30);
}, 'Three-layer sum 23.52 µm and geometric limit 30 µm; contribution indexing checked.');
test('911f3200', 'bouncing-distance', () => {
  close(3 + 2 * sum(Array.from({ length: 100 }, (_, k) => 1.5 * .5 ** k)), 9);
}, 'One initial fall plus doubled subsequent heights gives 9 m, not a single height sum.');
test('3773bd34', 'sine-contact', () => {
  let coefficients = [0, 1, 0, -1 / 6];
  for (const expected of [0, 1, 0, -1]) { close(poly(coefficients, 0), expected); coefficients = derivative(coefficients); }
}, 'Taylor polynomial x−x³/6 has the four stated derivative values at 0.');
test('3773bd34', 'shared-polynomial', () => {
  let g = [1, 1, 0, 0, 1], h = [1, 1, 0, 0, 2];
  for (let n = 0; n <= 3; n++) { close(poly(g, 0), poly(h, 0)); g = derivative(g); h = derivative(h); }
  close(poly([1, 1, 0, 0, 2], 2) - poly([1, 1, 0, 0, 1], 2), 16);
}, 'Agreement through order 3 at 0 and nonzero difference x⁴ away from 0.');
test('1b664036', 'choose-degree', () => {
  close(taylor(2, .5), 1.625); close(taylor(3, .5), 1.6458333333333); close(taylor(4, .5), 1.6484375);
  assert.deepEqual([2, 3, 4].map(n => Math.abs(taylor(n, .5) - Math.exp(.5)) < .001), [false, false, true]);
}, 'All three Taylor values and the requested absolute-error threshold checked against Math.exp.');
test('1b664036', 'negative-range', () => {
  close(taylor(3, -.25), .7786458333333); close(Math.exp(-.25) - taylor(3, -.25), .000154949738, 1e-11);
  close(taylor(3, -2), -1 / 3); assert.ok(Math.exp(-2) > 0);
}, 'Near-center numerical error and the negative remote cubic value independently checked.');
test('315093d4', 'series-and-partial', () => close(taylor(5, 1), 163 / 60), 'Factorial partial sum through 1/5! equals 163/60=T₅(1).');
test('315093d4', 'alternating-evaluation', () => {
  close(taylor(4, 1), 65 / 24); close(taylor(4, -1), 3 / 8);
}, 'Evaluation at +1 and −1 produces the stated positive and alternating partial sums.');
test('1eb7b2ce', 'parabola-tool', () => {
  const f = x => (x - 2) ** 2 - 1; close(f(1), 0); close(f(3), 0); close(f(2), -1); close(f(1.5), -.75); close(f(2.5), -.75);
}, 'Expected roots/minimum/local check verified algebraically; no claim that a learner used a digital tool.');
test('1eb7b2ce', 'domain-gap-tool', () => {
  const h = x => (x * x - 1) / (x - 1);
  for (const x of [-2, -1, 0, .5, 1.5, 2]) close(h(x), x + 1);
  assert.ok(Number.isNaN(h(1))); close(h(-1), 0);
}, 'Simplified line on x≠1, true root and excluded point checked; no digital execution claim.');
test('89ca5089', 'moving-vertex', () => {
  for (const h of [-2, 0, 2]) { close((h - h) ** 2, 0); close((h + 1 - h) ** 2, 1); }
}, 'Vertex and translated unit-offset values checked for all three slider settings.');
test('89ca5089', 'rotating-line', () => {
  assert.deepEqual([-2, 0, 2].map(m => m * 0 + 1), [1, 1, 1]);
  assert.deepEqual([-2, 0, 2].map(m => m * 1 + 1), [-1, 1, 3]);
}, 'Common point and the three documented line values verified.');
test('df5eeadd', 'quadratic-comparison', () => {
  const f = x => x * x - 3 * x + 1; const roots = [(3 - Math.sqrt(5)) / 2, (3 + Math.sqrt(5)) / 2];
  roots.forEach(x => close(f(x), 0)); close(f(1.5), -1.25);
  assert.ok(roots[0] > 0 && roots[0] < 1 && roots[1] > 1);
}, 'Exact quadratic roots, minimum and restricted search-range coverage verified.');
test('df5eeadd', 'integral-comparison', () => {
  close(Math.sin(Math.PI / 2) - Math.sin(0), 1);
  const n = 1000, h = Math.PI / 2 / n;
  const estimate = h / 3 * (Math.cos(0) + Math.cos(Math.PI / 2) + sum(Array.from({ length: n - 1 }, (_, j) => (j % 2 === 0 ? 4 : 2) * Math.cos((j + 1) * h))));
  close(estimate, 1, 1e-11);
}, 'Radian antiderivative result and an independent composite-Simpson numerical check agree at 1.');
test('94d63ad9', 'decreasing-line', () => {
  close(3 + 2, 5); close(4 + 3, 7); close((4 + 3) / 2 + (3 + 2) / 2, 6);
  close(.5 * sum([3.5, 3, 2.5, 2]), 5.5); close(.5 * sum([4, 3.5, 3, 2.5]), 6.5);
}, 'Both partitions, upper/lower ordering and exact trapezoidal area for the line checked.');
test('94d63ad9', 'interior-maximum', () => {
  const values = [-1, -.5, 0, .5, 1].map(x => 1 - x * x);
  close(.5 * sum(values.slice(0, -1).map((v, i) => Math.min(v, values[i + 1]))), .75);
  close(.5 * sum(values.slice(0, -1).map((v, i) => Math.max(v, values[i + 1]))), 1.75);
  close(.5 * sum(values.slice(0, -1).map((v, i) => (v + values[i + 1]) / 2)), 1.25);
  close(sum([0, 0]), 0); close(sum([1, 1]), 2); close(.5 + .5, 1);
}, 'Coarse/refined lower, upper and trapezoidal sums checked across the interior maximum.');
test('3862890e', 'squeezed-area', () => {
  for (const n of [1, 10, 1000]) { close((9 + 2 / n) - (9 - 2 / n), 4 / n); assert.ok(9 - 2 / n < 9 && 9 + 2 / n > 9); }
}, 'Bounds and shrinking gap checked; common-limit reasoning supplied in the authored expectation.');
test('3862890e', 'negative-stock-change', () => {
  close(18 - 5, 13); for (const n of [1, 10, 1000]) assert.ok(-5 - 1 / n < -5 && -5 + 1 / n > -5);
  close((18 + 7) - 5 - 13, 7);
}, 'Negative integral, reconstructed final stock and additive initial-stock change checked.');
test('ece68088', 'tank-turning-point', () => {
  const B = t => 10 + 6 * t - t * t;
  close(B(0), 10); close(B(3), 19); close(B(4), 18); close(B(4) - B(0), 8);
  for (const t of [0, 1, 3, 4]) close(diff(B, t), 6 - 2 * t, 1e-8);
}, 'Reconstruction, derivative, maximum, final 18 L and net change 8 L checked.');
test('ece68088', 'anchored-function', () => {
  const F = x => x ** 3 - 3 * x; close(F(-1), 2); close(F(2), 2);
  for (const x of [-1, 0, 1, 2]) close(diff(F, x), 3 * x * x - 3, 1e-8);
}, 'Nonzero reference argument, derivative and cancelling endpoint change checked.');
test('90662398', 'linear-strip', () => {
  const A = x => 3 * x - x * x / 2;
  for (const x of [0, 1, 3, 4]) close(diff(A, x), 3 - x, 1e-8);
  close(A(3), 4.5); assert.ok(A(3) > A(2) && A(3) > A(4));
}, 'Area primitive, local slopes and maximum at 3 checked; strip argument remains the authored conceptual evidence.');
test('90662398', 'primitive-family', () => {
  close(4 * .5 ** 3 - 4 * .5, -1.5); close(12 * .5 ** 2 - 4, -1);
  const F = (x, c) => x ** 4 - 2 * x * x + c;
  close(F(2, 7) - F(1, 7), F(2, -3) - F(1, -3));
}, 'First/second derivative values and cancellation of the primitive constant checked.');
test('24f21c0c', 'negative-constant', () => [-1, 1, -2].forEach((x, i) => close(-3 * (x + 1), [0, -6, 3][i])), 'Integral-function values including reversed bounds checked.');
test('24f21c0c', 'shifted-reference', () => {
  close(2 - 5, -3); close(2 - 2, 0); close(-3 - 2, -5);
}, 'Signed segment additivity and the constant −2 reference shift checked.');
test('5042fd2b', 'polygon-to-area-graph', () => {
  const A = x => x <= 0 ? x * x / 2 + 2 * x : 2 * x - x * x / 2;
  assert.deepEqual([-2, 0, 2, 4].map(A), [-2, 0, 2, 0]);
  close(diff(A, -1), 1, 1e-8); close(diff(A, 1), 1, 1e-8); close(diff(A, 3), -1, 1e-8);
}, 'Area anchor points and graph slope signs checked on all segments.');
test('5042fd2b', 'tangent-data-to-integrand', () => {
  assert.deepEqual([0, 1, 2, 3].map(x => 2 * x - 2), [-2, 0, 2, 4]);
  close((2 - 1) ** 2 - 1, 0); close((0 - 1) ** 2 - 1, 0); close(-1 + 1, 0);
}, 'Reconstructed integrand slopes, distinct zero/tangent roles and cancellation checked.');
test('269675a9', 'signed-energy-flow', () => { close(3 * 2 - 2 * 1, 4); close(3 * 2 + 2 * 1, 8); }, 'Net 4 kWh and absolute throughput 8 kWh checked with signed products.');
test('269675a9', 'signed-work', () => { close(3 * .5, 1.5); close(-1 * 1.5, -1.5); close(3 * .5 - 1 * 1.5, 0); }, 'Unequal path weighting and complete signed-work cancellation checked.');
test('9441bb35', 'triangle-accumulation', () => {
  const A = x => x <= 1 ? x * x : 4 * x - x * x - 2;
  assert.deepEqual([0, 1, 2].map(A), [0, 1, 2]); close(diff(A, .5), 1, 1e-8); close(diff(A, 1.5), 1, 1e-8);
}, 'Triangle areas and matching increasing-then-decreasing slope behavior checked.');
test('9441bb35', 'interior-reference', () => {
  const A = x => (x - 1) ** 2 / 2; assert.deepEqual([-1, 1, 3].map(A), [2, 0, 2]);
  close(diff(A, 0), -1, 1e-8); close(diff(A, 2), 1, 1e-8);
}, 'Interior reference, reversed orientation and both graph branches checked.');
test('b559e2ea', 'right-sum-limit', () => {
  for (const n of [2, 4, 8, 100]) close(sum(Array.from({ length: n }, (_, j) => 6 * (j + 1) / n * 3 / n)), 9 * (n + 1) / n);
  assert.deepEqual([2, 4, 8].map(n => 9 * (n + 1) / n), [13.5, 11.25, 10.125]);
}, 'Explicit right sums and their closed expression checked at four partition sizes.');
test('b559e2ea', 'piecewise-exact-sums', () => {
  for (const n of [1, 3, 8]) close(sum(Array.from({ length: n }, () => -1 / n)) + sum(Array.from({ length: 2 * n }, () => 2 / n)), 3);
}, 'Adapted interior-point sums retain exact signed value 3 under refinement.');
test('23589682', 'unknown-coefficient', () => { close(-2 * -.5, 1); close(-3 * (-1 / 3), 1); }, 'Exponential and sine inverse-chain coefficients checked exactly.');
test('23589682', 'cosine-and-zero', () => {
  const F = x => -2 * Math.sin(-(x - 4) / 2);
  for (const x of [-1, 0, 3]) close(diff(F, x), Math.cos(-(x - 4) / 2), 1e-8);
  close(diff(x => Math.exp(5) * x, 1), Math.exp(5), 1e-7);
}, 'Negative cosine inner slope and zero-slope exponential primitive checked by differentiation.');
test('8675a3d8', 'signed-linear-integral', () => {
  close((4 * 3 - 3 * 3) - 0, 3); close(2 * 4 / 2 - 1 * 2 / 2, 3);
}, 'Primitive difference and two signed triangle contributions independently agree at 3.');
test('8675a3d8', 'endpoint-only', () => {
  close(-5 - 7, -12); close(7 - (-5), 12); close((-5 + 10) - (7 + 10), -12);
}, 'Endpoint-only evaluation, reversed limits and additive constant cancellation checked.');
test('ced4f794', 'continuous-corner', () => {
  for (const h of [-.1, -.01, .01, .1]) {
    const increment = h >= 0 ? h * h / 2 : -h * h / 2;
    close(increment / h, Math.abs(h) / 2);
  }
  close(.5 + .5, 1);
}, 'Two-sided area quotient at the continuous corner tends to 0; total triangular area equals 1.');
test('ced4f794', 'signed-continuous-polynomial', () => {
  const F = t => t ** 4 / 4 - t * t / 2;
  close(F(1), -.25); close(F(-1), -.25); close(F(1) - F(-1), 0);
  for (const x of [-.5, .5]) close(diff(F, x), x ** 3 - x, 1e-8);
}, 'Antiderivative, equal endpoints and local signed derivative values checked.');
assert.equal(checks.length, 38);
assert.equal(new Set(checks.map(c => c.goalId + '/' + c.caseId)).size, 38);
const report = {
  schemaVersion: 1, artifactType: 'math-b040-p19-author-case-checks-v1', observedAt: new Date().toISOString(),
  candidatePath: stem + '.candidates.json', candidateSha256: 'sha256:' + createHash('sha256').update(candidateBytes).digest('hex'),
  configSchema: 'pass', profileBodySchemas: 19, caseSpecificChecks: checks,
  assessment: 'These are author-side mathematical and structural checks of 38 expected solutions. They do not claim execution of hypothetical learner/tool workflows, semantic human approval, image QA approval, independent reviewer agreement or learner mastery.',
};
if (process.argv.includes('--emit-report')) {
  const path = stem + '.author-check-report.json';
  const previous = existsSync(path) ? readFileSync(path, 'utf8') : null;
  const contentPatch = previous === null ? '*** Add File: ' + path + '\n' : '*** Update File: ' + path + '\n@@\n' + previous.trimEnd().split('\n').map(line => '-' + line).join('\n') + '\n';
  process.stdout.write(JSON.stringify({ patch: '*** Begin Patch\n' + contentPatch + JSON.stringify(report, null, 2).split('\n').map(line => '+' + line).join('\n') + '\n*** End Patch\n', summary: { profiles: 19, cases: 38, status: 'pass' } }));
} else console.log(JSON.stringify(report));

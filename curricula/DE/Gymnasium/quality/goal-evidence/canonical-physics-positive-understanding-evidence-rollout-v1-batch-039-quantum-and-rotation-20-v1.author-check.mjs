import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Read-only author check. No profile binding, review runs, or approvals are created.
const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..');
const ownPath = fileURLToPath(import.meta.url);
const candidatePath = ownPath.replace(/\.author-check\.mjs$/, '.candidates.json');
const notesPath = ownPath.replace(/\.author-check\.mjs$/, '.contextnotes.json');
const require = createRequire(resolve(repo, 'app/package.json'));
const Ajv2020 = require('ajv/dist/2020.js').default;
const schema = JSON.parse(readFileSync(resolve(repo, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'), 'utf8'));
const validateProfile = new Ajv2020({ allErrors: true, strict: false }).compile({
  $schema: schema.$schema, $defs: schema.$defs, $ref: '#/$defs/profile'
});
const candidates = JSON.parse(readFileSync(candidatePath, 'utf8'));
const notes = JSON.parse(readFileSync(notesPath, 'utf8'));
const expectedIds = ["d5bff282-741f-4cc5-9622-b77584fdcc5a","1a1c09f0-96b7-4c33-a623-0e8101537876","6031bed0-9baa-4f45-b2a5-57ffb00d39cc","f6e5929f-d52a-42a4-a5d2-ff498ee7083f","727d0946-7019-50ed-8fc6-85db12508733","e296aba6-f407-5944-a2bd-e5296e4c9f06","52b6722a-b3b2-5d2d-a507-0215532b0422","accb1d9e-cd48-5983-bcef-9b9bca4a9114","e2da5eec-45de-5527-9ad7-16f41cacbe58","39b2a0c4-eecf-5049-b58f-e790790a3bf2","cf570e66-2ce2-5923-9033-c97d74119553","37f17e7e-9fcf-5dca-ac10-e94cb8420be5","642aebd7-66cd-5a50-b543-73c4b207525d","5a951a0b-fd6c-51a1-9ffb-2a34ed6d3931","b49e0f6b-df2a-5643-b3ce-a9dfdf25f3bc","21c0a5f2-4152-549a-aa9c-e02ab772f589","8daaf751-93fe-56d9-8697-ac30237061bd","07f298b2-2f5e-5b16-8150-bc603fa78ecd","d02438ba-0cc9-5993-831e-5e44d35e32c4","58db62d4-458f-5e2d-9ca0-968e09f4944b"];
assert.equal(candidates.schemaVersion, 1);
assert.equal(candidates.authoringContract, 'positive-understanding-evidence-candidates-v1');
assert.deepEqual(candidates.goals.map(g => g.goalId), expectedIds);
assert.equal(new Set(expectedIds).size, 20);
assert.ok(Number.isFinite(Date.parse(candidates.reviewedAt)));
let profileChecks = 0;
for (const g of candidates.goals) {
  assert.equal(g.evidenceLevel, 'E1');
  assert.equal(g.maximumClaimScope, 'G1');
  assert.ok(g.reason.trim());
  assert.deepEqual(g.dissent, []);
  assert.ok(validateProfile(g.profile), g.goalId + ': ' + JSON.stringify(validateProfile.errors));
  assert.equal(g.profile.applicationCaseBriefs.length, 2);
  assert.equal(g.profile.coverageExpectations.minimumIndependentDemonstrations, 2);
  assert.deepEqual(g.profile.coverageExpectations.requiredExpectationIds, g.profile.expectations.map(e => e.id));
  for (const key of ['expectations', 'variationAxes', 'applicationCaseBriefs']) {
    assert.equal(new Set(g.profile[key].map(e => e.id)).size, g.profile[key].length);
  }
  for (const e of [...g.profile.expectations, ...g.profile.variationAxes, ...g.profile.applicationCaseBriefs]) {
    for (const [key, value] of Object.entries(e)) {
      if (key.endsWith('En')) {
        assert.notEqual(value, e[key.slice(0, -2) + 'De'], g.goalId + ': untranslated ' + key);
        assert.ok(!/Die lernende Person kann|Die Person erhält/.test(value), g.goalId + ': German EN');
      }
    }
  }
  profileChecks++;
}
let numericalAssertions = 0;
const near = (actual, expected, tolerance = 1e-10, label = '') => {
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    label + ': ' + actual + ' != ' + expected + ' (absolute tolerance ' + tolerance + ')');
  numericalAssertions++;
};
const cross = ([a,b,c], [d,e,f]) => [b*f-c*e, c*d-a*f, a*e-b*d];
const vec = (actual, expected, label) => {
  actual.forEach((x, i) => near(x, expected[i], 1e-12, label + '[' + i + ']'));
};
// Constants in SI, independent from the candidate prose.
const h = 6.62607015e-34, me = 9.1093837139e-31, e = 1.602176634e-19;
const p = U => Math.sqrt(2 * me * e * U);
const ringLambdaPm = (dNm, radiusMm, lengthM) => dNm * 1e-9 * radiusMm * 1e-3 / lengthM * 1e12;
near(p(2500), 2.701373885317499e-23, 1e-35, 'electron momentum 2.50 kV');
near(h / p(2500) * 1e12, 24.52851930646846, 1e-9, 'de Broglie wavelength 2.50 kV');
near(ringLambdaPm(.213, 11.52, .100), 24.5376, 1e-10, 'first ring');
near(ringLambdaPm(.213, 11.52, .100), h / p(2500) * 1e12, .02, 'rounded ring versus de Broglie');
near(ringLambdaPm(.213, 8.14, .100), 17.3382, 1e-10, 'second voltage inner ring');
near(ringLambdaPm(.123, 14.10, .100), 17.343, 1e-10, 'second voltage outer ring');
near(ringLambdaPm(.213, 8.14, .100), h / p(5000) * 1e12, .01, 'second inner versus de Broglie');
near(ringLambdaPm(.123, 14.10, .100), h / p(5000) * 1e12, .01, 'second outer versus de Broglie');
// Complex amplitude addition, not merely substitution into precomputed probabilities.
const outputs = phi => {
  const c = Math.cos(phi), s = Math.sin(phi);
  return [((1+c)**2+s*s)/4, ((1-c)**2+s*s)/4];
};
for (const [phi, target] of [[2*Math.PI/3, [.25,.75]], [Math.PI,[0,1]]]) {
  const out = outputs(phi);
  near(out[0], target[0], 1e-12, 'MZI port 0');
  near(out[1], target[1], 1e-12, 'MZI port 1');
  near(out[0]+out[1], 1, 1e-12, 'MZI normalization');
}
near(.5*.5+.5*.5, .5, 1e-12, 'orthogonal paths port sum');
near(.4*2**2/.8, 2, 1e-12, 'glider string force');
near(5*.2, 1, 1e-12, 'inner sample speed');
near(5*.4, 2, 1e-12, 'outer sample speed');
near(.2*5**2*.2, 1, 1e-12, 'inner sample force');
near(.2*5**2*.4, 2, 1e-12, 'outer sample force');
near(800*12**2/40, 2880, 1e-12, 'required friction');
near(.5*800*10, 4000, 1e-12, 'friction limit');
assert.ok(2880 < 4000); numericalAssertions++;
near(12**2/(.2*10), 72, 1e-12, 'minimum radius');
assert.ok(40 < 72); numericalAssertions++;
near(.75*16, 12, 1e-12, 'door torque');
near(16*0, 0, 1e-12, 'through-axis torque');
near(30*.2-20*.4, -2, 1e-12, 'net lever torque');
near(40*.2-20*.4, 0, 1e-12, 'balanced lever');
near(.5*.3*2**2, .6, 1e-12, 'rotor initial energy');
near(.5*.3*10**2, 15, 1e-12, 'rotor final energy');
near((10-2)/4, 2, 1e-12, 'mean acceleration');
near(.3*(10-2)/4, .6, 1e-12, 'net accelerating torque');
near(.3*(10-2)/4+.15, .75, 1e-12, 'drive torque');
near(.5*.3*(-10)**2, 15, 1e-12, 'negative spin positive energy');
near(0-.5*.3*(-10)**2, -15, 1e-12, 'braking energy change');
near(.3*(0-(-10))/5, .6, 1e-12, 'positive braking torque');
vec(cross([1,0,0], [0,0,-1]), [0,1,0], 'gravity torque about support');
vec(cross([0,0,1], [0,1,0]), [-1,0,0], 'steering torque');
vec(cross([0,0,1], [0,-1,0]), [1,0,0], 'reversed spin steering torque');
near(.12*.050*Math.sin(Math.PI/6), .003, 1e-12, 'dipole 30 degrees');
near(.12*.050, .006, 1e-12, 'dipole 90 degrees');
near(.12*.050*Math.sin(0), 0, 1e-12, 'parallel zero torque');
near(.12*.050*Math.sin(Math.PI), 0, 1e-12, 'antiparallel zero torque');
for (const [k,r,tanTheta,J,T,targetR,targetP,targetB,targetM] of [
  [2e-7,.2,1,1.6e-5,2*Math.PI,4e4,1.6e-5,20e-6,.8],
  [1e-7,.2,.25,1.8e-5,2*Math.PI,2e4,1.8e-5,30e-6,.6],
]) {
  const ratio = r**3*tanTheta/k;
  const product = 4*Math.PI**2*J/T**2;
  const field = Math.sqrt(product/ratio), moment = Math.sqrt(product*ratio);
  near(ratio, targetR, 1e-10, 'Gauss ratio');
  near(product, targetP, 1e-16, 'Gauss product');
  near(field, targetB, 1e-15, 'Gauss B_H');
  near(moment, targetM, 1e-12, 'Gauss magnetic moment');
  near(k*moment/r**3/field, tanTheta, 1e-12, 'Gauss inverse deflection');
  near(2*Math.PI*Math.sqrt(J/(moment*field)), T, 1e-12, 'Gauss inverse period');
}
let imagesChecked = 0;
for (const g of notes.goals) {
  const bytes = readFileSync(resolve(repo, 'app/public' + g.visualization.url));
  assert.equal('sha256:' + createHash('sha256').update(bytes).digest('hex'), g.visualization.digest, g.goalId + ': image changed');
  imagesChecked++;
}
const report = {
  checkedAt: new Date().toISOString(), profileChecks, freshCases: profileChecks*2,
  numericalAssertions, imagesChecked,
  authority: 'author-check only; E1/G1 AI candidates, not D review, P approval, or registry promotion'
};
console.log(JSON.stringify(report, null, 2));

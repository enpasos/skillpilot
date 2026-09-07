// Read-only arithmetic and contract checks; not evidence of learner performance.
const fs = require('node:fs'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const prefix = __filename.replace('.author-check.cjs', '');
const bytes = fs.readFileSync(prefix + '.candidates.json'), set = JSON.parse(bytes);
assert.equal(set.goals.length, 3);
for (const g of set.goals) {
  assert.equal(g.evidenceLevel, 'E1'); assert.equal(g.maximumClaimScope, 'G1');
  assert(!g.goalFingerprint && !g.reviewInputFingerprint && !g.status);
  const p = g.profile;
  assert.deepEqual(p.coverageExpectations.requiredExpectationIds, p.expectations.map(e => e.id));
  assert.equal(p.coverageExpectations.minimumIndependentDemonstrations, 2);
  assert(p.coverageExpectations.freshVariationRequired && p.coverageExpectations.independentTransferRequired);
  assert.equal(p.applicationCaseBriefs.length, 2);
}
let assertions = 0; const cases = [];
const eq = (a, b, tol = 1e-10) => { assert(Math.abs(a-b) <= tol, `${a} != ${b}`); assertions++; };
const yes = a => { assert(a); assertions++; };
const check = (id, caseId, fn) => { const g = set.goals.find(g => g.goalId.startsWith(id)); assert(g.profile.applicationCaseBriefs.some(c => c.id === caseId)); fn(); cases.push({goalId:g.goalId, caseId}); };
check('b9bbd2a8', 'signed-area-and-constant', () => {
  for (const c of [-7, 0, 3]) { const f = x => x*x/2-x+c; eq(f(3)-f(0), 1.5); }
  eq(1*1/2, .5); eq(2*2/2, 2); eq(-.5+2, 1.5); eq(.5+2, 2.5);
});
check('b9bbd2a8', 'accumulation-and-reversed-bound', () => {
  const a = x => x*x+x-2; eq(a(1), 0); eq(a(0), -2); eq((1+3)/2, 2);
  // Difference quotient for a quadratic equals 2x+1+h identically; check samples.
  for (const x of [0, .5, 1, 2]) eq((a(x+.125)-a(x))/.125, 2*x+1+.125);
});
check('c088fd81', 'isolate-power', () => {
  const x = Math.log(5)/Math.log(2); eq(x, 2.321928, .0000005); eq(3*2**x, 15);
  yes(3*2**(5/2) !== 15); for (const y of [-5, 0, 3]) yes(2**y > 0);
});
check('c088fd81', 'two-hour-observation', () => {
  const t = 2*Math.log(2.5)/Math.log(1.25); eq(t, 8.212567, .0000005);
  eq(40*1.25**(t/2), 100); eq(40*1.25**4, 97.65625); eq(40*1.25**5, 122.0703125);
  yes(40*1.25**4 < 100 && 40*1.25**5 > 100); eq(2*Math.ceil(t/2), 10);
});
check('aed3ca99', 'doubling-levels', () => { eq(2**5, 32); eq(Math.log2(32), 5); eq(2**3, 8); eq(Math.log2(8), 3); yes(32/2 !== 5); });
check('aed3ca99', 'decimal-comparison-scale', () => { eq(10**-2, .01); eq(Math.log10(.01), -2); eq(10**0, 1); yes(Number.isNaN(Math.log10(-1))); });
assert.equal(cases.length, 6);
console.log(JSON.stringify({status:'PASS', candidateSha256:'sha256:'+crypto.createHash('sha256').update(bytes).digest('hex'), profiles:3, cases:6, numericAssertions:assertions, checkedCases:cases, authority:'ai_candidate', humanApprovalClaimed:false}, null, 2));

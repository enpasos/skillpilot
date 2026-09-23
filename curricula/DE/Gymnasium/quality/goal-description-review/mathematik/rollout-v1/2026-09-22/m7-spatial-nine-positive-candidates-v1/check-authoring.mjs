import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Read-only checker. Run from the repository root with the repository TS loader.
const root = process.cwd();
const folder = path.dirname(fileURLToPath(import.meta.url));
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const sha = value => 'sha256:' + createHash('sha256').update(value).digest('hex');
const require = createRequire(path.join(root, 'app/package.json'));
const Ajv2020 = require('ajv/dist/2020.js').default;
const addFormats = require('ajv-formats');
const native = await import(pathToFileURL(path.join(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href);
const schemaPath = 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json';
const schema = read(path.join(root, schemaPath));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(schema);
const validateProfile = ajv.compile({ $ref: schema.$id + '#/$defs/profile' });
const candidatesPath = path.join(folder, 'spatial-nine.candidates.json');
const contextPath = path.join(folder, 'authoring-context.json');
const candidates = read(candidatesPath);
const context = read(contextPath);
const canonical = read(path.join(root, context.canonicalPath));
const kinds = read(path.join(root, context.semanticKindLedgerPath)).decisions;
const holdConfigPath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-20/batch-044h-remaining-after-current-six-v1-carryover-after-held7-20260920-v1.config.json';
const holdConfig = read(path.join(root, holdConfigPath));
assert.equal(candidates.schemaVersion, 1);
assert.equal(candidates.authoringContract, 'positive-understanding-evidence-candidates-v1');
assert.equal(candidates.goals.length, 9);
assert.equal(context.finalMaterialization, false);
assert.equal(context.registered, false);
assert.equal(context.resourceBindingsFinal, false);
assert.equal(context.status, 'needs_human_review');
assert.equal(context.reviewAuthority, 'ai_candidate');
assert.deepEqual(candidates.goals.map(g => g.goalId), holdConfig.goalIds);
assert.deepEqual(candidates.goals.map(g => g.goalId), context.goals.map(g => g.goalId));
assert.equal(new Set(candidates.goals.map(g => g.goalId)).size, 9);
const sourceChecks = [];
const profileChecks = [];
for (const candidate of candidates.goals) {
  assert(validateProfile(candidate.profile), JSON.stringify(validateProfile.errors));
  assert.equal(candidate.evidenceLevel, 'E1');
  assert.equal(candidate.maximumClaimScope, 'G1');
  assert.equal(candidate.profile.applicationCaseBriefs.length, 2);
  const coverage = candidate.profile.coverageExpectations;
  assert.equal(coverage.minimumIndependentDemonstrations, 2);
  assert.equal(coverage.freshVariationRequired, true);
  assert.equal(coverage.independentTransferRequired, true);
  assert.deepEqual(coverage.requiredExpectationIds, candidate.profile.expectations.map(e => e.id));
  assert.deepEqual(coverage.alternativeExpectationGroups, []);
  for (const collection of ['expectations', 'variationAxes', 'applicationCaseBriefs']) {
    const values = candidate.profile[collection];
    assert.equal(new Set(values.map(v => v.id)).size, values.length);
  }
  const saved = context.goals.find(g => g.goalId === candidate.goalId);
  const current = canonical.goals.find(g => g.id === candidate.goalId);
  const kind = kinds.find(g => g.goalId === candidate.goalId);
  assert.equal(kind.semanticKind, saved.effectiveSemanticKind);
  assert.equal(native.fingerprintGoalForPositiveEvidence(current, kind.semanticKind), saved.goalFingerprint);
  assert.equal(native.fingerprintPositiveGoalEvidenceProfile(candidate.profile), saved.profileFingerprint);
  for (const key of ['title', 'titleEn', 'description', 'descriptionEn', 'requires', 'contains', 'dimensionTags']) {
    assert.deepEqual(current[key], saved.currentGoal[key], candidate.goalId + ':' + key);
  }
  for (const related of [...saved.parents, ...saved.prerequisites]) {
    const active = canonical.goals.find(g => g.id === related.id);
    for (const key of ['title', 'titleEn', 'description', 'descriptionEn']) {
      assert.deepEqual(active[key], related[key], related.id + ':' + key);
    }
  }
  for (const source of saved.originalUnderstandingEvidence) {
    const raw = fs.readFileSync(path.join(root, source.path), 'utf8');
    assert.equal(sha(raw), source.sourceFileSha256);
    const line = raw.trim().split('\n').find(line => JSON.parse(line).recordId === source.recordId);
    assert(line);
    assert.equal(sha(line), source.sourceRecordLineSha256);
    assert.deepEqual(JSON.parse(line).understandingEvidence, source.understandingEvidence);
    sourceChecks.push({ goalId: candidate.goalId, round: source.round, recordId: source.recordId, passed: true });
  }
  profileChecks.push({ goalId: candidate.goalId, profileFingerprint: saved.profileFingerprint, goalFingerprint: saved.goalFingerprint, schemaPassed: true, currentTextAndContextPassed: true });
}
let assertions = 0;
const eq = (actual, expected) => { assertions++; assert.deepEqual(actual, expected); };
const near = (actual, expected) => { assertions++; assert(Math.abs(actual - expected) < 1e-10, actual + ' != ' + expected); };
const add = (a,b) => a.map((v,i) => v + b[i]);
const sub = (a,b) => a.map((v,i) => v - b[i]);
const mul = (s,a) => a.map(v => { const result = s*v; return result === 0 ? 0 : result; });
const squareNorm = a => a.reduce((sum,v) => sum + v*v, 0);
const norm = a => Math.sqrt(squareNorm(a));
const product = (xs,ys,zs) => xs.flatMap(x => ys.flatMap(y => zs.map(z => [x,y,z])));
const sorted = vectors => vectors.map(v => JSON.stringify(v)).sort();
const det = (a,b,c) => a[0]*(b[1]*c[2]-b[2]*c[1])-b[0]*(a[1]*c[2]-a[2]*c[1])+c[0]*(a[1]*b[2]-a[2]*b[1]);
const collinear = (u,v) => {
  const i = u.findIndex(x => x !== 0);
  if (i === -1) return true;
  const k = v[i]/u[i];
  return u.every((x,j) => Math.abs(k*x-v[j]) < 1e-10);
};
const caseChecks = [];
function checkCase(prefix, caseId, run, explanation) {
  const candidate = candidates.goals.find(g => g.goalId.startsWith(prefix));
  assert(candidate.profile.applicationCaseBriefs.some(c => c.id === caseId));
  const before = assertions;
  run();
  caseChecks.push({ goalId: candidate.goalId, caseId, arithmeticAssertions: assertions-before, result: 'pass', explanation });
}
checkCase('be0e8715','three-roles-in-one-frame',()=>{
  eq(sub([2,0,4],[-1,2,0]),[3,-2,4]);
  eq(add([-1,2,0],[3,-2,4]),[2,0,4]);
  eq(squareNorm([3,-2,4])>0,true);
},'AB=(3,-2,4); its translated representative ends at B and is nonzero.');
checkCase('be0e8715','shifted-origin-fixed-displacement',()=>{
  const p=[5,1,4],q=[3,4,4],o=[2,-1,1];
  eq(sub(p,o),[3,2,3]); eq(sub(q,o),[1,5,3]);
  eq(sub(q,p),[-2,3,0]); eq(sub(sub(q,o),sub(p,o)),sub(q,p));
},'New position vectors are (3,2,3),(1,5,3); displacement remains (-2,3,0).');
checkCase('aae119f2','corner-frame-for-block',()=>{
  const vertices=product([0,5],[0,2],[0,6]);
  eq(vertices.length,8); eq(new Set(sorted(vertices)).size,8);
  eq(sub([5,0,0],[0,0,0]),[5,0,0]);
  eq(sub([5,2,0],[5,0,0]),[0,2,0]);
  eq(sub([5,2,6],[5,2,0]),[0,0,6]);
},'Eight distinct vertices correspond to perpendicular 5 cm,2 cm,6 cm edges.');
checkCase('aae119f2','symmetry-origin-aquarium',()=>{
  const vertices=product([-40,40],[-20,20],[0,50]);
  eq(sorted(vertices.map(p=>sub(p,[-40,-20,0]))),sorted(product([0,80],[0,40],[0,50])));
  eq(sub([-40,20,50],[-40,-20,0]),[0,40,50]);
  eq(vertices.length,8);
},'Centred and corner coordinates describe the same 80×40×50 cm aquarium.');
checkCase('eb6bfdd9','two-points-overlap-in-top-view',()=>{
  const p=[-2,3,4],q=[-2,3,-1];
  eq(p.slice(0,2),q.slice(0,2));
  eq(p[2]-q[2],5); eq(JSON.stringify(p)===JSON.stringify(q),false);
},'xy projections coincide, while heights differ by5. This checks geometry, not an executed software session.');
checkCase('eb6bfdd9','apparent-crossing-of-segments',()=>{
  const a=[-3,0,2],b=[3,0,2],c=[0,-2,-1],d=[0,2,-1];
  eq(mul(0.5,add(a,b)),[0,0,2]); eq(mul(0.5,add(c,d)),[0,0,-1]);
  eq(a[2],b[2]); eq(c[2],d[2]); eq(a[2]===c[2],false);
},'Projected segments cross at(0,0), but every point has z=2 or z=-1, so no spatial intersection.');
checkCase('f37b0a72','scaled-leg-in-spatial-route',()=>{
  eq(mul(2,[3,1,-1]),[6,2,-2]);
  eq(add([1,-2,3],mul(2,[3,1,-1])),[7,0,1]);
  near(norm(mul(2,[3,1,-1]))/norm([3,1,-1]),2);
},'2b=(6,2,-2), a+2b=(7,0,1), length ratio2.');
checkCase('f37b0a72','negative-half-and-return',()=>{
  const u=[-4,2,6],v=[-1,3,1],step=mul(-0.5,u),total=add(step,v);
  eq(step,[2,-1,-3]); eq(total,[1,2,-2]);
  eq(add(total,[-1,-2,2]),[0,0,0]); near(norm(step)/norm(u),0.5);
  eq(squareNorm(mul(0,u)),0);
},'Negative half-scale reverses orientation and halves length; return vector cancels(1,2,-2); zero displacement has zero norm.');
checkCase('72dfc164','negative-weight-with-three-component-check',()=>{
  eq(add(mul(2,[1,1,0]),mul(-1,[0,1,1])),[2,1,-1]);
  eq(2+(-1),1);
},'Weights(2,-1) pass all three components; x and z separately determine the weights.');
checkCase('72dfc164','redundant-generators-two-representations',()=>{
  const p=[2,-1,0],q=[4,-2,0];
  eq(q,mul(2,p)); eq(mul(3,p),[6,-3,0]); eq(add(p,q),[6,-3,0]);
  eq(p[2],0); eq(q[2],0); eq([6,-3,1][2]===0,false);
},'Both(3,0) and(1,1) generate(6,-3,0); every combination has z=0, excluding(6,-3,1).');
checkCase('6fc9246a','pairwise-noncollinear-dependent-triple',()=>{
  const a=[1,2,0],b=[0,1,1],c=[2,5,1];
  eq(sub(add(mul(2,a),b),c),[0,0,0]);
  eq(collinear(a,b),false); eq(collinear(a,c),false); eq(collinear(b,c),false);
  eq(det(a,b,c),0);
},'2a+b-c=0 with nonzero coefficients; no pair is collinear, but the family spans a plane.');
checkCase('6fc9246a','independent-triple-plus-zero',()=>{
  const p=[1,0,1],q=[0,1,1],r=[0,0,2],zero=[0,0,0];
  eq(det(p,q,r),2);
  eq(add(add(mul(0,p),mul(0,q)),add(mul(0,r),mul(1,zero))),zero);
  eq([0,0,0,1].some(x=>x!==0),true);
},'Nonzero determinant2 mechanically confirms the learner-facing component proof; adding zero gives a nontrivial relation without changing span.');
checkCase('54cfe5ce','negative-multiple-with-zero-component',()=>{
  const v=[0,3,-6],w=[0,-2,4],t=[1,-2,4];
  eq(mul(-2/3,v),w); eq(collinear(v,w),true); eq(collinear(v,t),false);
  near(norm(w)/norm(v),2/3);
},'Factor -2/3 works in all components for w, but no factor can turn v_x=0 into t_x=1.');
checkCase('54cfe5ce','parameter-completion-and-zero-vector',()=>{
  const u=[2,0,-1]; eq(mul(3,u),[6,0,-3]);
  eq(3*u[1],0); eq(collinear(u,[0,0,0]),true);
  eq(squareNorm([0,0,0]),0);
},'x fixes factor3, y therefore requires k=0; zero is a zero multiple under the explicitly stated convention.');
checkCase('68d4faef','straight-distance-versus-coordinate-route',()=>{
  const delta=sub([1,-2,3],[-3,2,1]);
  eq(delta,[4,-4,2]); eq(squareNorm(delta),36); eq(norm(delta),6);
  eq(delta.reduce((s,v)=>s+Math.abs(v),0),10);
},'Straight distance6 m versus axis-parallel route10 m; negative y displacement is squared in the norm.');
checkCase('68d4faef','same-points-new-origin-and-order',()=>{
  const p=[1,-2,3],q=[3,1,9],o=[5,1,-2],pp=sub(p,o),qp=sub(q,o);
  eq(sub(q,p),[2,3,6]); eq(norm(sub(q,p)),7);
  eq(pp,[-4,-3,5]); eq(qp,[-2,0,11]);
  eq(sub(pp,qp),[-2,-3,-6]); eq(norm(sub(pp,qp)),7);
},'Origin translation cancels; reversed vector(-2,-3,-6) retains norm7 cm.');
checkCase('69eda7f9','interior-brace-of-rectangular-frame',()=>{
  const a=[0,0,0],c=[4,4,0],g=[4,4,7];
  eq(sub(g,a),[4,4,7]); eq(norm(sub(g,a)),9);
  eq(squareNorm(sub(c,a)),32); near(norm(sub(c,a)),4*Math.sqrt(2));
  eq(norm(sub(g,a))>norm(sub(c,a)),true);
},'Brace AG is9 m; different segment AC is4√2 m.');
checkCase('69eda7f9','offset-pyramid-lateral-edge',()=>{
  const a=[1,2,0],b=[7,2,0],c=[7,8,0],s=[4,5,4];
  eq(sub(s,b),[-3,3,4]); eq(squareNorm(sub(s,b)),34);
  eq(sub(c,a),[6,6,0]); eq(squareNorm(sub(c,a)),72);
  near(norm(sub(c,a)),6*Math.sqrt(2));
},'Non-origin segment BS has length√34 cm; floor diagonal AC has length6√2 cm.');
assert.equal(caseChecks.length,18);
// A single linear projection preserves vector addition and scaling; a screen
// projection is not used as a Euclidean length measurement or as a converse
// test of 3D collinearity.
const projection = ([x,y,z]) => [-x+y, -0.4*x+z];
for (const [a,b,k] of [
  [[1,-2,3],[3,1,-1],2],
  [[-4,2,6],[-1,3,1],-0.5],
  [[1,1,0],[0,1,1],2],
  [[0,3,-6],[0,-2,4],-2/3],
]) {
  const left=projection(add(a,mul(k,b))),right=add(projection(a),mul(k,projection(b)));
  left.forEach((v,i)=>near(v,right[i]));
  projection(mul(k,a)).forEach((v,i)=>near(v,k*projection(a)[i]));
}
const result = {
  schemaVersion:1,
  checkedAt:new Date().toISOString(),
  checker:'check-authoring.mjs',
  result:'pass',
  candidateSetSha256:sha(fs.readFileSync(candidatesPath)),
  contextSha256:sha(fs.readFileSync(contextPath)),
  checkerSha256:sha(fs.readFileSync(fileURLToPath(import.meta.url))),
  profileSchemaPath:schemaPath,
  profileSchemaSha256:sha(fs.readFileSync(path.join(root,schemaPath))),
  nativeProfileFingerprintFunction:'app/scripts/positiveGoalEvidenceProfileModel.ts#fingerprintPositiveGoalEvidenceProfile',
  nativeGoalFingerprintFunction:'app/scripts/positiveGoalEvidenceProfileModel.ts#fingerprintGoalForPositiveEvidence',
  scopeGoals:9,
  bilingualApplicationCases:18,
  sourceRecordsChecked:18,
  arithmeticAssertions:assertions,
  profileChecks,sourceChecks,caseChecks,
  projectionCheck:'Four vector triples checked with one linear projection; no actual image review or screen-distance measurement is claimed.',
  finalMaterialization:false,
  registered:false,
  fullNativeReviewInputGateRun:false,
  limitation:'Only the native profile-body schema and native semantic/profile fingerprints were checked. Asset/resource and reviewInput bindings remain pending; no full native P record or current D/V/human approval is asserted. Software outcomes are mathematically derived expectations, not an executed learner/software test.'
};
console.log(JSON.stringify(result,null,2));

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
const candidatesPath = path.join(folder, 'matrix-probability-ten.candidates.json');
const contextPath = path.join(folder, 'authoring-context.json');
const candidates = read(candidatesPath);
const context = read(contextPath);
const canonical = read(path.join(root, context.canonicalPath));
const kinds = read(path.join(root, context.semanticKindLedgerPath)).decisions;
const holdConfigPath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-20/batch-046h-current-source-image-and-wording-holds-13-v1-carryover-after-held7-20260920-v1.config.json';
const holdConfig = read(path.join(root, holdConfigPath));
assert.equal(candidates.schemaVersion, 1);
assert.equal(candidates.authoringContract, 'positive-understanding-evidence-candidates-v1');
assert.equal(candidates.goals.length, 10);
assert.equal(context.finalMaterialization, false);
assert.equal(context.registered, false);
assert.equal(context.resourceBindingsFinal, false);
assert.equal(context.status, 'needs_human_review');
assert.equal(context.reviewAuthority, 'ai_candidate');
assert.deepEqual(candidates.goals.map(g => g.goalId), holdConfig.goalIds);
assert.deepEqual(candidates.goals.map(g => g.goalId), context.goals.map(g => g.goalId));
assert.equal(new Set(candidates.goals.map(g => g.goalId)).size, 10);
assert.equal(sha(fs.readFileSync(path.join(root, context.triageSource.path))), context.triageSource.sha256);
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
    const original = JSON.parse(line);
    assert.deepEqual(original.understandingEvidence, source.understandingEvidence);
    for (const [oldKey,newKey] of [['currentTitleDe','title'],['currentTitleEn','titleEn'],['currentDescriptionDe','description'],['currentDescriptionEn','descriptionEn']]) {
      assert.equal(original[oldKey], current[newKey], candidate.goalId + ': unchanged original competence');
    }
    sourceChecks.push({ goalId: candidate.goalId, round: source.round, recordId: source.recordId, passed: true });
  }
  profileChecks.push({ goalId: candidate.goalId, profileFingerprint: saved.profileFingerprint, goalFingerprint: saved.goalFingerprint, schemaPassed: true, currentTextAndContextPassed: true });
}
let assertions = 0;
const eq = (actual,expected) => { assertions++; assert.deepEqual(actual,expected); };
const near = (actual,expected) => { assertions++; assert(Math.abs(actual-expected)<1e-10,actual+' != '+expected); };
const clean = x => x === 0 ? 0 : x;
const add = (a,b) => a.map((x,i)=>clean(x+b[i]));
const sub = (a,b) => a.map((x,i)=>clean(x-b[i]));
const scale = (k,v) => v.map(x=>clean(k*x));
const dot = (a,b) => a.reduce((s,x,i)=>s+x*b[i],0);
const norm2 = v => dot(v,v);
const mv = (a,v) => { assert(a.every(row=>row.length===v.length)); return a.map(row=>clean(dot(row,v))); };
const tr = a => a[0].map((_,i)=>a.map(row=>row[i]));
const mm = (a,b) => { assert(a.every(row=>row.length===b.length)); return a.map(row=>tr(b).map(col=>clean(dot(row,col)))); };
const identity = n => Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));
const power = (a,n) => { let result=identity(a.length); for(let i=0;i<n;i++)result=mm(result,a);return result; };
const vn = (a,b) => { eq(a.length,b.length); a.forEach((x,i)=>near(x,b[i])); };
const mn = (a,b) => { eq(a.length,b.length); a.forEach((row,i)=>vn(row,b[i])); };
const gcd = (a,b) => { a=Math.abs(a);b=Math.abs(b);while(b!==0){const r=a%b;a=b;b=r;}return a; };
const fraction = (n,d) => { assert(Number.isSafeInteger(n)&&Number.isSafeInteger(d)&&d>0);const g=gcd(n,d);return (n/g)+'/'+(d/g); };
const rowSums = a => a.map(row=>row.reduce((s,x)=>s+x,0));
const colSums = a => rowSums(tr(a));
const stochastic = a => { colSums(a).forEach(s=>near(s,1));eq(a.flat().every(x=>x>=0&&x<=1),true); };
const state = v => {near(v.reduce((s,x)=>s+x,0),1);eq(v.every(x=>x>=0&&x<=1),true);};
const caseChecks = [];
function checkCase(prefix,caseId,run,explanation) {
  const candidate=candidates.goals.find(g=>g.goalId.startsWith(prefix));
  assert(candidate.profile.applicationCaseBriefs.some(c=>c.id===caseId));
  const before=assertions;run();
  caseChecks.push({goalId:candidate.goalId,caseId,arithmeticAssertions:assertions-before,result:'pass',explanation});
}
checkCase('0de1e45c','finite-horizons-of-two-state-process',()=>{
  const m=[[3/4,1/2],[1/4,1/2]];
  stochastic(m);
  const p1=mv(power(m,1),[1,0]),p2=mv(power(m,2),[1,0]),p4=mv(power(m,4),[1,0]),q4=mv(power(m,4),[0,1]);
  eq(p1,[3/4,1/4]);eq(p2,[11/16,5/16]);eq(p4,[171/256,85/256]);eq(q4,[170/256,86/256]);
  [p1,p2,p4,q4].forEach(state);
  eq(p4[0]-q4[0],1/256);
  eq(Math.abs(p4[0]-2/3)<Math.abs(p2[0]-2/3),true);
},'Finite powers give 3/4,11/16,171/256 in state A; alternate start gives170/256 after4 steps. No general convergence proof is claimed from these values.');
checkCase('0de1e45c','persistent-alternation-at-large-step-counts',()=>{
  const s=[[0,1],[1,0]],v=[7/10,3/10];
  eq(power(s,2),identity(2));eq(mv(power(s,20),v),v);eq(mv(power(s,21),v),[3/10,7/10]);
  eq(mv(s,[1/2,1/2]),[1/2,1/2]);state(v);
},'S²=I establishes the even/odd pattern for all step counts; an equally split state stays fixed.');
checkCase('922d89fc','given-power-formula-and-identical-limit-columns',()=>{
  const m=[[7/10,1/5],[3/10,4/5]],g=[[2/5,2/5],[3/5,3/5]];
  const formula=n=>[[2/5+(3/5)*2**(-n),2/5-(2/5)*2**(-n)],[3/5-(3/5)*2**(-n),3/5+(2/5)*2**(-n)]];
  stochastic(m);stochastic(g);
  mn(mm(g,g),g);
  mn(m,g.map((row,i)=>row.map((value,j)=>value+0.5*((i===j?1:0)-value))));
  for(const n of [0,1,2,4,8])mn(power(m,n),formula(n));
  for(const v of [[1,0],[0,1],[1/4,3/4]])vn(mv(g,v),[2/5,3/5]);
  vn(mv(m,[2/5,3/5]),[2/5,3/5]);mn(mm(m,g),g);
},'The supplied exact formula tends entrywise to G because2^(-n)→0. Power spot checks and MG=G support the manual symbolic derivation, not replace it.');
checkCase('922d89fc','same-fixed-vector-different-long-term-claims',()=>{
  const s=[[0,1],[1,0]],i=identity(2),v=[3/4,1/4],g=[1/2,1/2];
  eq(power(s,2),i);eq(power(s,3),s);eq(mv(s,v),[1/4,3/4]);eq(mv(i,v),v);
  eq(mv(s,g),g);eq(mv(i,g),g);eq(power(i,7),i);
  eq(mv(i,[1,0]),[1,0]);eq(mv(i,[0,1]),[0,1]);
},'S alternates and has no matrix limit; I is its own limit and retains the initial state. Both share g.');
checkCase('4c494716','shadow-on-vertical-axis',()=>{
  const a=[[0,0],[2,1]],p=[-2,5],q=[3,-1];
  eq(mv(a,[1,0]),[0,2]);eq(mv(a,[0,1]),[0,1]);
  eq(mv(a,p),[0,1]);eq(mv(a,q),[0,5]);
  eq(sub(mv(a,p),p),scale(-p[0],[1,-2]));
  eq(sub(mv(a,q),q),scale(-q[0],[1,-2]));eq(mm(a,a),a);
},'Matrix columns match basis images; both point-image differences are multiples of(1,-2); images lie on x=0.');
checkCase('4c494716','read-spatial-shadow-from-matrix',()=>{
  const a=[[1,0,-1],[0,1,2],[0,0,0]],u=[4,1,-2],v=[1,0,1],d=[1,-2,1];
  eq(mv(a,u),[6,-3,0]);eq(mv(a,v),[0,2,0]);
  for(const p of [u,v])eq(sub(mv(a,p),p),scale(-p[2],d));
  eq(mv(a,[2,-3,0]),[2,-3,0]);eq(mm(a,a),a);eq(tr(a)[2],[-1,2,0]);
},'Rule(x-z,y+2z,0) is a projection onto xy along(1,-2,1); fixed plane and A²=A agree.');
checkCase('4d331ba0','two-images-under-given-shear',()=>{
  const a=[[1,-2],[0,1]];
  eq(mv(a,[-1,3]),[-7,3]);eq(mv(a,[2,0]),[2,0]);eq(a.length,2);eq(a[0].length,2);
},'Two correctly matched point images follow from the given2×2 matrix; y is retained.');
checkCase('4d331ba0','rectangular-map-with-equal-images',()=>{
  const b=[[1,0,1],[0,1,-1]],u=[2,-3,1],v=[1,-2,2];
  eq(b.length,2);eq(b[0].length,3);eq(mv(b,u),[3,-4]);eq(mv(b,v),[3,-4]);
  eq(JSON.stringify(u)===JSON.stringify(v),false);
},'A2×3 matrix sends3×1 columns to2×1 columns; distinct points have equal x+z and y-z.');
checkCase('b72d87d4','reflection-in-yz-plane',()=>{
  const s=[[-1,0,0],[0,1,0],[0,0,1]],p=[-3,2,5],pp=mv(s,p);
  eq(pp,[3,2,5]);eq(scale(1/2,add(p,pp)),[0,2,5]);eq(sub(pp,p),[6,0,0]);
  eq(Math.abs(p[0]),3);eq(Math.abs(pp[0]),3);eq(tr(s),[[-1,0,0],[0,1,0],[0,0,1]]);
},'Only x changes sign; midpoint lies in yz and the connecting segment is normal to that plane.');
checkCase('b72d87d4','xz-reflection-fixed-point-and-return',()=>{
  const t=[[1,0,0],[0,-1,0],[0,0,1]],q=[4,-2,-1],r=[-1,0,3];
  eq(mv(t,q),[4,2,-1]);eq(mv(t,r),r);eq(mv(t,mv(t,q)),q);eq(mm(t,t),identity(3));
  eq(scale(1/2,add(q,mv(t,q))),[4,0,-1]);
},'Only y changes sign; the in-plane point is fixed and applying the same reflection twice returns each point.');
checkCase('55039f9c','orthogonal-projection-onto-yz',()=>{
  const a=[[0,0,0],[0,1,0],[0,0,1]],p=[-4,2,5],r=[0,-3,1];
  eq(tr(a),[[0,0,0],[0,1,0],[0,0,1]]);eq(mv(a,p),[0,2,5]);eq(mv(a,r),r);
  eq(sub(mv(a,p),p),[4,0,0]);eq(mm(a,a),a);
},'The x basis vector maps to zero; x-normal projection preserves y,z and fixes its image plane.');
checkCase('55039f9c','oblique-projection-onto-xy',()=>{
  const b=[[1,0,-1],[0,1,1/2],[0,0,0]],q=[3,-2,4],d=[2,-1,2],qp=mv(b,q);
  eq(qp,[-1,0,0]);eq(sub(qp,q),[-4,2,-4]);eq(sub(qp,q),scale(-2,d));
  eq(add(q,scale(-q[2]/d[2],d)),qp);eq(d[2]!==0,true);
  eq(mv(b,[2,-1,0]),[2,-1,0]);eq(mm(b,b),b);
  eq(mv([[1,0,0],[0,1,0],[0,0,0]],q),[3,-2,0]);
},'t=-z/2 yields the stated matrix; QQprime=-2d and zprime=0. Nonzero d_z ensures a unique image.');
checkCase('35558905','negative-dilation-in-plane',()=>{
  const a=[[-3,0],[0,-3]],p=[-1,4],q=[2,-2];
  eq(mv(a,p),[3,-12]);eq(mv(a,q),[-6,6]);
  eq(norm2(p),17);eq(norm2(mv(a,p)),9*17);
  eq(norm2(q),8);eq(norm2(mv(a,q)),9*8);eq(mv(a,[0,0]),[0,0]);
},'Negative factor-3 gives opposite rays and positive distance factor3, with squared norm factor9.');
checkCase('35558905','positive-contraction-in-space',()=>{
  const b=[[1/4,0,0],[0,1/4,0],[0,0,1/4]],r=[8,-4,12];
  eq(mv(b,r),[2,-1,3]);eq(mv(b,[0,0,0]),[0,0,0]);eq(norm2(r),224);eq(norm2(mv(b,r)),14);
  near(Math.sqrt(norm2(mv(b,r))/norm2(r)),1/4);eq(tr(b),b);
},'Positive factor1/4 preserves the ray; √224=4√14 and the image norm is√14.');
checkCase('7bd8f022','positive-quarter-turn-about-x',()=>{
  const rx=[[1,0,0],[0,0,-1],[0,1,0]],p=[2,-3,4],pp=mv(rx,p);
  eq(tr(rx),[[1,0,0],[0,0,1],[0,-1,0]]);eq(pp,[2,-4,-3]);
  eq(pp[0],p[0]);eq(norm2(p),29);eq(norm2(pp),29);eq(mv(rx,[5,0,0]),[5,0,0]);
  eq(mm(tr(rx),rx),identity(3));
},'Active right-handed+x quarter-turn sends e_y to e_z and e_z to-e_y; length and x are preserved.');
checkCase('7bd8f022','negative-sixty-degrees-about-y',()=>{
  const h=Math.sqrt(3)/2,ry=[[1/2,0,-h],[0,1,0],[h,0,1/2]],q=[2,-1,0],qp=mv(ry,q);
  vn(qp,[1,-1,Math.sqrt(3)]);eq(qp[1],q[1]);eq(norm2(q),5);near(norm2(qp),5);
  mn(mm(tr(ry),ry),identity(3));eq(ry[2][0]>0,true);eq(ry[0][2]<0,true);
  near(Math.cos(-Math.PI/3),1/2);near(Math.sin(-Math.PI/3),-h);
},'The y-axis rotation block has sine=-√3/2, giving(1,-1,√3), norm²5 and fixed y. Radical identities are also derived explicitly in the profile.');
checkCase('52e57eb5','visitor-four-field-table',()=>{
  const a=[[27,45],[63,45]];
  eq(rowSums(a),[72,108]);eq(colSums(a),[90,90]);eq(rowSums(a).reduce((s,x)=>s+x,0),180);
  eq(a.map(row=>row.map(x=>fraction(x,180))),[['3/20','1/4'],['7/20','1/4']]);
  eq(fraction(27,180),'3/20');eq(fraction(27,90),'3/10');eq(fraction(27,72),'3/8');
},'Counts and margins reconstruct the given group; joint and two reversed conditional ratios use180,90,72.');
checkCase('52e57eb5','relative-multi-field-travel-table',()=>{
  const percentages=[[10,20],[20,10],[30,10]],a=percentages.map(row=>row.map(x=>250*x/100));
  eq(a,[[25,50],[50,25],[75,25]]);eq(rowSums(a),[75,75,100]);eq(colSums(a),[150,100]);
  eq(percentages.flat().reduce((s,x)=>s+x,0),100);
  eq(fraction(75,250),'3/10');eq(fraction(75,100),'3/4');eq(fraction(75,150),'1/2');
},'Six whole-population percentages form a3×2 table; conditional denominators are bus total100 and bottle total150.');
checkCase('c3b9c561','dispatch-counts-and-express-first-tree',()=>{
  const a=[[48,12],[52,48]];
  eq(rowSums(a),[60,100]);eq(colSums(a),[100,60]);
  eq(fraction(48,60),'4/5');eq(fraction(48,100),'12/25');eq(fraction(52,100),'13/25');
  eq(fraction(60,160),'3/8');eq(fraction(100,160),'5/8');
  eq([fraction(3*4,8*5),fraction(3*1,8*5),fraction(5*13,8*25),fraction(5*12,8*25)],a.flat().map(x=>fraction(x,160)));
  eq(fraction(3*4,8*5),'3/10');
},'Every express-first tree product matches its table cell; reversing the condition changes60 to100.');
checkCase('c3b9c561','relative-bag-tree-reversed-and-zero-condition',()=>{
  const exactCells=[fraction(3*2,10*5),fraction(3*3,10*5),fraction(7*1,10*10),fraction(7*9,10*10)];
  eq(exactCells,['3/25','9/50','7/100','63/100']);
  const countsPer100=[[12,18],[7,63]];
  eq(colSums(countsPer100),[19,81]);eq(rowSums(countsPer100),[30,70]);
  eq(fraction(12,19),'12/19');eq(fraction(18,81),'2/9');
  eq(countsPer100.flat().reduce((s,x)=>s+x,0),100);
  const greenMass=100-countsPer100.flat().reduce((s,x)=>s+x,0);
  eq(greenMass,0);eq(greenMass>0,false);
},'All four path products are exact fractions; reverse conditioning yields12/19 and2/9. Green has zero mass, so no elementary conditional quotient is defined.');
assert.equal(caseChecks.length,20);
const result={
  schemaVersion:1,checkedAt:new Date().toISOString(),checker:'check-authoring.mjs',result:'pass',
  candidateSetSha256:sha(fs.readFileSync(candidatesPath)),contextSha256:sha(fs.readFileSync(contextPath)),
  checkerSha256:sha(fs.readFileSync(fileURLToPath(import.meta.url))),
  profileSchemaPath:schemaPath,profileSchemaSha256:sha(fs.readFileSync(path.join(root,schemaPath))),
  nativeProfileFingerprintFunction:'app/scripts/positiveGoalEvidenceProfileModel.ts#fingerprintPositiveGoalEvidenceProfile',
  nativeGoalFingerprintFunction:'app/scripts/positiveGoalEvidenceProfileModel.ts#fingerprintGoalForPositiveEvidence',
  scopeGoals:10,bilingualApplicationCases:20,sourceRecordsChecked:20,originalGoalTextComparisons:80,
  arithmeticAssertions:assertions,profileChecks,sourceChecks,caseChecks,
  arithmeticMethod:'Integer ratios are reduced by exact gcd; matrix/vector operations and radical/trigonometric checks use tolerance1e-10 where needed. Algebraic convergence, parity, projection uniqueness, and orientation arguments are stated explicitly in the authored criteria and README, not inferred from floating-point checks alone.',
  finalMaterialization:false,registered:false,fullNativeReviewInputGateRun:false,
  limitation:'Native profile-body schema and native semantic/profile fingerprints only. Asset/resource and reviewInput bindings remain pending. No full native P record, current D/V/scope approval, human approval, learner performance, or real-host acceptance is asserted.'
};
console.log(JSON.stringify(result,null,2));

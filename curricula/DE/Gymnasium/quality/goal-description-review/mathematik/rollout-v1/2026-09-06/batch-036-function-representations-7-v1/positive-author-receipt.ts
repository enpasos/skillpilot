import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../../../app/scripts/positiveGoalEvidenceReview'
import { parseAndValidateGoalBookModel, stableGoalBookJson } from '../../../../../../../../../app/scripts/goalBookModel'

async function main() {
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-036-function-representations-7-v1'
const prefix = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-036-function-representations-7-v1'
const configPath = prefix + '.config.json'
const candidatesPath = prefix + '.candidates.json'
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (v: Buffer | string) => 'sha256:' + createHash('sha256').update(v).digest('hex')
const config = json(configPath)
const candidates = json(candidatesPath)
const manifest = json(base + '/bundle/manifest.json')
const model = parseAndValidateGoalBookModel(json(base + '/bundle/book-model.json'))
const inputs = readFileSync(base + '/bundle/review-input.jsonl', 'utf8').trim().split('\n').map(line => JSON.parse(line))
const landscape = json(config.landscapePath)
const ledger = json(config.semanticKindLedgerPath)
const promptPath = 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md'
assert.equal(model.digest, 'sha256:7c3228cf0fa28432222a22e11c5933d5339a41f953480713e62394b6a113a2d9')
assert.equal(manifest.bookModelDigest, model.digest)
assert.equal(manifest.bundleFingerprint, 'sha256:70f64bfcf938c65ea2e98e3132d2dbec6385902819485c419fc8f90993094cec')
assert.equal(model.source.landscapeDigest, sha(stableGoalBookJson(landscape)))
assert.equal(model.source.semanticKindLedgerDigest, sha(stableGoalBookJson(ledger)))
assert.deepEqual(config.scope.goalIds, model.pages.map(p => p.goalId))
assert.deepEqual(config.scope.goalIds, inputs.map(p => p.page.goalId))
assert.deepEqual(config.scope.goalIds, candidates.goals.map((g: any) => g.goalId))
assert.equal(config.scope.goalIds.length, 7)
for (const a of manifest.artifacts) assert.equal(sha(readFileSync(base + '/bundle/' + a.path)), a.digest, a.role)
for (let i=0;i<inputs.length;i++) {
  assert.deepEqual(inputs[i].page, model.pages[i])
  assert.equal(inputs[i].bookDigest, model.digest)
  const goal = landscape.goals.find((g: any) => g.id === inputs[i].page.goalId)
  assert.equal(goal.title, inputs[i].page.title)
  assert.equal(goal.description, inputs[i].page.description)
  assert.ok(goal.titleEn && goal.descriptionEn)
}
const checks: Array<{caseId:string; assertions:string[]}> = []
const check = (caseId:string, fn:()=>void, assertions:string[]) => { fn(); checks.push({caseId, assertions}) }
const eq = (a:number,b:number) => assert.ok(Math.abs(a-b)<1e-12, String(a)+' != '+String(b))
check('scaled-lines',()=>{eq((-2)+2,0);eq((4-0)/(2-(-2)),1);eq(1+2,3)},['g(x)=x+2: zero -2, slope1, intersection with y=3 at (1,3); two x-units per square preserved'])
check('sampled-volume',()=>{eq([6,10,10,4][2],10);eq(Math.max(6,10,10,4),10);eq(4-10,-6)},['V(5)=10 L; sampled maximum10 L at2 and5 min; change -6 L; no interpolation assumption'])
check('quadratic-section',()=>{const f=(x:number)=>(x-1)**2-4;[-1,3].forEach(x=>eq(f(x),0));eq(f(1),-4);eq(f(0),-3);eq(f(-2),5);eq(f(4),5)},['vertex(1,-4); zeros -1,3; intercept-3; endpoints both5; given domain[-2,4]'])
check('restricted-reciprocal',()=>{[-4,-2,-1,1,2,4].forEach((x,i)=>eq(2/x,[-.5,-1,-2,2,1,.5][i]))},['points verified; signs follow x; 2/x has no zero; only intervals[-4,-1] and[1,4] plotted'])
check('parabolic-features',()=>{const f=(x:number)=>.75*(x-2)**2-3;eq(f(2),-3);eq(f(0),0);eq(f(4),0);eq(f(1),f(3))},['consistent quadratic witness a=.75>0,h2,k-3; zeros0,4; symmetry aboutx2; full equation not required'])
check('affine-features',()=>{const f=(x:number)=>-2*x+3;eq(f(-1),5);eq(f(2),-1);eq(f(1.5),0);eq(f(0),3)},['m=-2,b=3,zero1.5 verified in stated affine class'])
check('inner-factor',()=>{const pts=[[-2,1],[0,2],[4,-1]];const expected=[[0,-1],[1,2],[3,-7]];pts.forEach(([u,v],i)=>{const x=1+u/2;eq(2*(x-1),u);eq(x,expected[i][0]);eq(3*v-4,expected[i][1])})},['(u,v) maps to(1+u/2,3v-4); reciprocal horizontal factor verified at all3 points'])
check('labelled-graph-pairs',()=>{[[-2,0],[0,4],[2,2]].forEach(([x,y],i)=>{eq(2*x-1,[-5,-1,3][i]);eq(.5*y+1,[1,3,2][i])})},['xprime=2x-1,yprime=.5y+1 verifies all3 named pairs; affine coordinate maps preserve connecting segments'])
check('affine-equation',()=>{const f=(x:number)=>2*x+5;eq(f(-2),1);eq(f(1),7);eq((7-1)/(1+2),2)},['f=2x+5 verifies bothpoints; uniqueness only in affine class with distinct x'])
check('vertex-equation',()=>{const f=(x:number)=>2*(x-1)**2-2;eq(f(1),-2);eq(f(3),6);eq(f(-1),6);eq((6+2)/(3-1)**2,2)},['f=2(x-1)^2-2; vertex and bothpoints verified; opening fixed by off-axispoint'])
check('affine-table',()=>{const f=(x:number)=>3*x+2;[-1,1,4,2].forEach((x,i)=>eq(f(x),[-1,5,14,8][i]));eq((5+1)/(1+1),3);eq((14-5)/(4-1),3)},['unequal input gaps yield same slope3; f=3x+2; addedpoint(2,8) checked'])
check('quadratic-rule',()=>{const f=(x:number)=>x*x-2*x;[-1,0,1,2,3,.5].forEach((x,i)=>eq(f(x),[3,0,-1,0,3,-.75][i]));eq(f(.25),f(1.75))},['table3,0,-1,0,3; vertex(1,-1),zeros0,2; f(.5)=-.75; symmetryx1'])
check('scaled-graph-check',()=>{eq((3-1)/(4-0),.5);eq((3-1)/(2-0),1);eq(.5*2+1,2);eq(1*2+1,3)},['A slope.5/intercept1 matches; B slope1 gives3 instead of2 atx2; scaling issue is possible cause, not inferred learner history'])
check('finite-samples',()=>{[-1,0,1].forEach(x=>eq(x*x,x**4));eq(.5**2,.25);eq(.5**4,.0625);assert.notEqual(.5**2,.5**4)},['x^2 andx^4 agree at3 samples but differ at.5; counterexample on same domain[-1,1]'])
assert.equal(checks.length,14)
const records = await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:candidates})
assert.equal(records.length,7)
records.forEach(r=>{
  assert.equal(r.profile.archetype,'representation')
  assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate')
  assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1')
  assert.deepEqual(r.reviewRunIds,[])
  assert.equal(r.profile.applicationCaseBriefs.length,2)
  assert.equal(r.profile.coverageExpectations.minimumIndependentDemonstrations,2)
})
const reviewText = records.map(r=>JSON.stringify(r)).join('\n')+'\n'
let nativeValidation: any = {status:'not-yet-written; --emit builds native records in memory'}
if (!process.argv.includes('--emit')) {
  assert.equal(readFileSync(config.reviewPath,'utf8'),reviewText)
  const result = reviewPositiveGoalEvidenceConfig(configPath)
  assert.deepEqual(result.errors,[])
  nativeValidation = {status:'PASS',counts:result.counts,errors:result.errors,recordCount:result.records.length}
}
const receipt = {
  receiptKind:'math-b036-positive-author-checks-v1',
  authoringStartedAt:'2026-09-06T09:27:20Z',
  checkedAt:new Date().toISOString(),
  authoringScope:'exact seven current original pages and canonical bilingual goals; no A/B review outputs, synthesis or other profiles read during authoring',
  authority:'AI candidate E1/G1 only; no human, normative-source, image or learner-mastery approval',
  nativeModelDigest:model.digest,
  bundleFingerprint:manifest.bundleFingerprint,
  sourceModelDigest:model.source.landscapeDigest,
  sourceRawDigest:sha(readFileSync(config.landscapePath)),
  sourceLedgerRawDigest:sha(readFileSync(config.semanticKindLedgerPath)),
  inputBindings: [promptPath,config.reviewCriteriaPath,base+'/bundle/manifest.json',base+'/bundle/book-model.json',base+'/bundle/review-input.jsonl','contracts/goal-evidence/v2/goal-evidence-profile.schema.json',configPath,candidatesPath].map(path=>({path,rawSha256:sha(readFileSync(path))})),
  profileBindings:records.map(r=>({goalId:r.goalId,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,criteriaFingerprint:r.reviewCriteriaFingerprint})),
  mathematicsChecks:checks,
  nativeValidation,
  reviewOutputDigest:sha(reviewText),
  reviewedResourceTypes:config.reviewedResourceTypes,
  reviewRunIds:[],
  uncertainties:records.map(r=>({goalId:r.goalId,dissent:r.dissent}))
}
console.log(JSON.stringify(process.argv.includes('--emit')?{reviewText,receipt}:receipt,null,2))
}
void main().catch(error => { console.error(error); process.exitCode = 1 })

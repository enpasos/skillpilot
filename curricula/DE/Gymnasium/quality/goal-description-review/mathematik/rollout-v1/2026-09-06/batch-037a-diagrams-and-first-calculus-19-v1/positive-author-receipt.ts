import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {buildPositiveGoalEvidenceCandidateRecords} from '../../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import {reviewPositiveGoalEvidenceConfig} from '../../../../../../../../../app/scripts/positiveGoalEvidenceReview'
import {fingerprintGoalForPositiveEvidence} from '../../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {parseAndValidateGoalBookModel,stableGoalBookJson} from '../../../../../../../../../app/scripts/goalBookModel'

async function main() {
const base='curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-037a-diagrams-and-first-calculus-19-v1'
const prefix='curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-037a-diagrams-and-first-calculus-19-v1'
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(x:Buffer|string)=>'sha256:'+createHash('sha256').update(x).digest('hex')
const config=json(prefix+'.config.json'),candidates=json(prefix+'.candidates.json')
const held=json(base+'/positive-author-unbound-7c0dee9b-draft.json')
const checks:Array<{caseId:string;verifiedReasoning:string}>= []
const eq=(a:number,b:number,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,String(a)+' != '+String(b))
const test=(caseId:string,fn:()=>void,verifiedReasoning:string)=>{fn();checks.push({caseId,verifiedReasoning})}
const degrees=(m:number)=>Math.atan(m)*180/Math.PI
const dpoly=(a:number[])=>a.slice(1).map((v,i)=>(i+1)*v)
const mul=(a:number[],b:number[])=>{const c=Array(a.length+b.length-1).fill(0);a.forEach((v,i)=>b.forEach((w,j)=>c[i+j]+=v*w));return c}
test('temperature-scale',()=>{eq((2+4)/2,3);eq((0+10)/2,5)},'Linear scale midpoints give3 h and5 °C; axis roles remain distinct.')
test('horizontal-unit-factor',()=>{eq(2*100,200);eq(3.5*100,350);eq(350-200,150)},'Category labels are not numerical positions; quantitative scale carries multiplier100€.')
test('reservoir-trend',()=>{eq((60-20)/2,20);eq((60-60)/3,0);eq((40-60)/2,-10);eq(Math.max(20,60,60,40),60)},'Specified linear segments give +20,0,-10 L/h and a maximum plateau60 L on[2,5].')
test('two-distance-lines',()=>{eq(24/4,6);eq((16-8)/4,2);eq(6*2,2*2+8)},'A=6t,B=2t+8 intersect at(2,12); A starts8 behind and has larger slope.')
test('truncated-bars',()=>{eq(55/50,1.1);eq((55-50)/50,.1);eq((55-45)/(50-45),2)},'Displayed lengths have ratio2 but actual values ratio1.1; cut baseline45 explains the discrepancy.')
test('unequal-time-gaps',()=>{eq((10-0)/(1-0),10);eq((20-10)/(10-1),10/9)},'Equal graphical horizontal gaps encode1 and9 years, so the two real rates differ.')
test('square-pictograms',()=>{eq(2**2/1**2,4);eq(20/10,2)},'Square area ratio4 differs from data ratio2; equal-width zero-baseline bars preserve count ratios.')
test('different-class-sizes',()=>{eq(12/20,.6);eq(15/30,.5);assert.ok(15>12)},'B has larger absolute count, A larger participation proportion; denominators20 and30 stay explicit.')
test('travel-average',()=>{eq((460-100)/(5-2),120);eq(120/60,2)},'Cumulative distance difference360m over3min gives120m/min=2m/s, not a full instantaneous-speed course.')
test('cooling-average',()=>{const f=(t:number)=>80-3*t+.1*t*t;eq(f(2),74.4);eq(f(6),65.6);eq((f(6)-f(2))/4,-2.2)},'Endpoint temperatures give-2.2°C/min on[2,6]; quadratic model is not a constant-rate model.')
test('h-square',()=>{[.1,-.1,.01,-.01].forEach((h,i)=>{eq(((2+h)**2-4)/h,[4.1,3.9,4.01,3.99][i]);eq(((2+h)**2-4)/h,4+h)})},'Algebra:((2+h)^2-4)/h=4+h for h≠0, hence exact limit4. Finite numerical table illustrates but does not prove it.')
test('h-reciprocal',()=>{[.1,-.1,.01,-.01].forEach((h,i)=>{eq((1/(1+h)-1)/h,[-10/11,-10/9,-100/101,-100/99][i]);eq((1/(1+h)-1)/h,-1/(1+h))})},'Algebra Q=-1/(1+h),h≠0,-1; denominator tends to1, giving limit-1. Finite rounded rows alone prove neither existence nor value.')
test('cube-justification',()=>{[-2,0,1,3].forEach(x=>[.2,-.1].forEach(h=>eq(((x+h)**3-x**3)/h,3*x*x+3*x*h+h*h)))},'Exact binomial expansion:(x+h)^3-x^3=3x²h+3xh²+h³; divide by h≠0 then take h→0 to obtain3x². Numeric checks corroborate, not replace, the identity.')
test('negative-power-justification',()=>{[-2,1,3].forEach(x=>[.2,-.1].forEach(h=>eq((1/(x+h)-1/x)/h,-1/(x*(x+h)))))},'Common-denominator identity gives-1/[x(x+h)] with x≠0,h≠0,x+h≠0; limit -x^-2. This proves n=-1 only, not all integers.')
test('constant-multiple',()=>{assert.deepEqual(dpoly([5,0,-3]),[0,-6]);[-2,0,3].forEach(x=>eq(-3*(2*x),-6*x))},'For constant c, quotient factors as cQ_u(h); differentiability permits limit c u′. Applied F=-3x²+5 gives-6x; c cannot depend on x.')
test('sum-cancellation',()=>{assert.deepEqual(dpoly([0,0,0,1]),[0,0,3]);assert.deepEqual(dpoly([0,2,0,-1]),[2,0,-3]);assert.deepEqual(dpoly([0,2]),[2])},'Q_(u+v)=Q_u+Q_v; both derivatives exist, so limits add. x³+(-x³+2x)=2x and derivative terms cancel to2.')
test('expanded-polynomial',()=>assert.deepEqual(dpoly([-7,5,-2,0,3]),[5,-4,0,12]),'Coefficient differentiation gives12x³-4x+5; -7 contributes0 once.')
test('rearranged-polynomial',()=>{const f=mul([-2,1],[1,1]);assert.deepEqual(f,[-2,-1,1]);f[2]+=1;assert.deepEqual(dpoly(f),[-1,4])},'Polynomial multiplication gives x²-x-2; plusx² gives2x²-x-2 and derivative4x-1 without a product-rule requirement.')
test('position-rate',()=>{const s=(t:number)=>12-2*(t-3)+(t-3)**2;eq(s(3),12);eq(-2+2*(3-3),-2)},'A consistent smooth witness has position12m and instantaneous rate-2m/s at3s. Rate is signed coordinate change; no constant interval velocity follows.')
test('zero-volume-rate',()=>{const v=(t:number)=>100+(t-5)**2;eq(v(5),100);eq(v(4),101);eq(v(6),101);eq(2*(5-5),0)},'Smooth witness gives rate0 at5min but different neighbouring volumes101L, so pointwise zero does not imply interval constancy.')
test('parabola-slope-assignment',()=>{[-2,-1,0,1].forEach((x,i)=>eq(2*x,[-4,-2,0,2][i]));assert.deepEqual(dpoly([-1,0,1]),[0,2])},'Known f=x²-1 yields derivative function2x; finite slope pairs illustrate this justified assignment rather than determine an arbitrary function.')
test('constant-slope-assignment',()=>{eq((11-5)/(1-(-1)),3);eq(3*(-1)+8,5);eq(3+8,11)},'Known full affine graph has constant slope3; derivative graph is horizontaly3, independent of original varying heights.')
test('cubic-graph-to-derivative',()=>{const f=(x:number)=>x**3-3*x,df=(x:number)=>3*x*x-3;eq(f(-1),2);eq(f(1),-2);eq(df(-1),0);eq(df(1),0);assert.ok(df(-2)>0&&df(0)<0&&df(2)>0);eq(df(0),-3)},'Exact derivative3x²-3 has stated signs and decreases until x=0, attaining value-3, then increases. Sign changes classify maximum at-1 and minimum at1; no f″ required.')
test('derivative-with-touching-zero',()=>{eq(3*0**2,0);[-2,-1,1,2].forEach(x=>assert.ok(3*x*x>0));assert.ok((-1)**3<0&&0<1**3)},'Derivative3x² is positive except at0; the original is strictly increasing and stationary at0 without an extremum. f=x³+C illustrates height freedom; strict increase does not require f′>0 at every single input.')
test('two-antiderivatives',()=>{assert.deepEqual(dpoly([3,0,1]),[0,2]);assert.deepEqual(dpoly([-4,0,1]),[0,2]);eq(3-(-4),7)},'Both given functions satisfy F′=H′=2x and differ by constant7; the definition is F′=f, not F=f.')
test('zero-function',()=>{assert.deepEqual(dpoly([5]),[]);assert.deepEqual(dpoly([0,1]),[1])},'Constant5 has derivative0, while x has derivative1. Both function height and derivative must retain their roles on(-2,2).')
test('rising-tangent-angle',()=>{eq(1**2,1);eq(2*1,2);eq(2*1-1,1);eq(degrees(2),63.43494882292201)},'P(1,1),m2 gives tangent2x-1 and signed slope angle63.4349488° with equal axes.')
test('falling-reciprocal-angle',()=>{eq(1/1,1);eq(-1/1**2,-1);eq(-1+2,1);eq(degrees(-1),-45)},'Reciprocal at1 gives tangent -x+2 and signed angle-45°; principal-angle convention is explicit.')
test('ramp-guide',()=>{eq(2*1-1,1);eq(-.5*1+1.5,1);eq(2*(-.5),-1);eq(-.5*3+1.5,0)},'Tangent2x-1 and normal-.5x+1.5 pass through(1,1); normal reaches ground at(3,0), with equal metre axes.')
test('vertex-support',()=>{eq((2-2)**2+1,1);eq(2*(2-2),0)},'Vertex(2,1) has tangent y1 and vertical normal x2; ground foot(2,0). No finite -1/0 slope exists.')
test('three-regular-angles',()=>{eq((1-0)/(1-0),1);eq(degrees(1),45);eq(degrees(2),63.43494882292201);eq(degrees(-.5),-26.56505117707799)},'For x²: secant0→1 slope1, tangent at1 slope2, normal-.5; respective signed angles45°,63.4349488°,-26.5650512°.')
test('horizontal-tangent-angles',()=>{eq(((1-2**2)-(1-0**2))/2,-2);eq(-2*0,0);eq(degrees(-2),-63.43494882292201);eq(degrees(0),0)},'For1-x²: secant0→2 slope-2, tangent at0 slope0, normal vertical; vertical undirected angle90° handled outside the open arctan range.')
test('acute-graph-intersection',()=>{eq(1**2,1);eq(Math.abs(degrees(2)-degrees(1)),18.43494882292201);eq(degrees(1/3),18.43494882292201)},'At(1,1), x² andx have tangent slopes2,1 and smaller angle18.4349488°; local tangent directions, not secants.')
test('orthogonal-intersection',()=>{eq(1*(-1),-1);eq(Math.abs(degrees(1)-degrees(-1)),90)},'x and-x intersect orthogonally at0; 1+m1m2=0 means use the right-angle case, not an undefined geometric intersection.')
test('corner-versus-smooth',()=>{[-.1,-.01].forEach(h=>eq(Math.abs(h)/h,-1));[.1,.01].forEach(h=>eq(Math.abs(h)/h,1));eq(2*0,0)},'|x| has one-sided slopes-1,+1 at0; x² has common slope0. Corner and smooth horizontal tangent are distinct exact graph structures.')
test('jump-with-parallel-branches',()=>{const f=(x:number)=>x<0?x:x+1;eq(f(0),1);eq(f(-.1),-.1);eq((f(.1)-f(0))/.1,1);eq((f(-.1)-f(0))/(-.1),11)},'Left branch approaches0 but f(0)=1; jump prevents differentiability despite both branch slopes1. Left quotient is1-1/h and diverges as h→0-.')
test('wall-enclosure',()=>{eq(2*7.5+15,30);eq(7.5*15,112.5);eq(30-4*7.5,0);eq(0*(30-0),0);eq(15*(30-30),0)},'2a+b30 gives A30a-2a²=112.5-2(a-7.5)²; interior maximuma7.5,b15,area112.5m²; degenerate endpoints have zero area.')
test('capacity-limited-profit',()=>{const g=(q:number)=>-q*q+20*q-64;eq(g(8),32);eq(g(0),-64);eq(20-2*10,0);assert.ok(20-2*8>0);assert.equal(Math.max(...Array.from({length:9},(_,q)=>g(q))),32)},'Stationary q10 is inadmissible; derivative positive on[0,8] gives maximumq8,value32. Integer restriction gives the same boundary solution.')
test('cubic-three-slopes',()=>{eq((2**3-0)/2,4);eq(3*1**2,3);eq(3*(-1/3),-1)},'UNBOUND7c: secant0→2 slope4, tangent at1 slope3, normal-1/3; no angle requirement.')
test('vertex-three-slopes',()=>{eq(((3-2)**2-(2-2)**2)/(3-2),1);eq(2*(2-2),0)},'UNBOUND7c: secant2→3 slope1, tangent at2 zero, normal vertical without finite slope; no angle requirement.')
const expectedIds=[...candidates.goals.flatMap((g:any)=>g.profile.applicationCaseBriefs.map((c:any)=>c.id)),...held.goal.profile.applicationCaseBriefs.map((c:any)=>c.id)]
assert.equal(checks.length,40);assert.equal(new Set(checks.map(c=>c.caseId)).size,40)
assert.deepEqual(checks.map(c=>c.caseId).sort(),expectedIds.sort())
const arithmeticReceipt={checkedAt:new Date().toISOString(),caseCount:checks.length,checks,independentArithmeticCrosscheck:{actor:'/root/math_b033b_blind_b',scope:'seven explicitly supplied mathematical subproblems only; no repository review/profile access, no profile authorship or judgement delegated',results:'h-method both formulas and tables; ordinary and vertical normals; angle conventions and intersectionangles; wall and boundary-profit extrema all independently confirmed',reviewRunClaim:false}}
if(process.argv.includes('--math-only')) {console.log(JSON.stringify(arithmeticReceipt,null,2));return}
const manifest=json(base+'/bundle/manifest.json')
const model=parseAndValidateGoalBookModel(json(base+'/bundle/book-model.json'))
const inputs=readFileSync(base+'/bundle/review-input.jsonl','utf8').trim().split('\n').map(line=>JSON.parse(line))
assert.equal(model.digest,'sha256:f0d7f2b628e5d4755366156acd9aded5c319046e52b13326af6febf99efc32bc')
assert.equal(manifest.bundleFingerprint,'sha256:1a83aa529c2ab0b02ceaa982ee50347aa9ab2581f7ed1a610ad3dd8af11a94b9')
assert.equal(manifest.bookModelDigest,model.digest)
assert.deepEqual(config.scope.goalIds,model.pages.map(p=>p.goalId))
assert.deepEqual(config.scope.goalIds,candidates.goals.map((g:any)=>g.goalId))
assert.equal(config.scope.goalIds.length,19)
assert.ok(!config.scope.goalIds.includes(held.goal.goalId))
for(const artifact of manifest.artifacts)assert.equal(sha(readFileSync(base+'/bundle/'+artifact.path)),artifact.digest,artifact.role)
const landscape=json(config.landscapePath),ledger=json(config.semanticKindLedgerPath)
const sourceBindings=[]
for(let i=0;i<inputs.length;i++){
  assert.deepEqual(inputs[i].page,model.pages[i]);assert.equal(inputs[i].bookDigest,model.digest)
  const goal=landscape.goals.find((g:any)=>g.id===inputs[i].page.goalId)
  const kind=ledger.decisions.find((g:any)=>g.goalId===goal.id)
  assert.equal(kind.decisionStatus,'authoritative');assert.equal(kind.semanticKind,'curricularAtomic')
  assert.equal(goal.title,inputs[i].page.title);assert.equal(goal.description,inputs[i].page.description)
  assert.equal(fingerprintGoalForPositiveEvidence(goal,kind.semanticKind),inputs[i].page.goalFingerprint)
  const oldRequires=[...(inputs[i].page.requires??[]),...(inputs[i].page.externalPrerequisites??[])].map(g=>g.goalId).sort()
  assert.deepEqual([...(goal.requires??[])].sort(),oldRequires)
  sourceBindings.push({goalId:goal.id,title:goal.title,titleEn:goal.titleEn,description:goal.description,descriptionEn:goal.descriptionEn,goalFingerprint:inputs[i].page.goalFingerprint,originalPageFingerprint:inputs[i].page.pageFingerprint,currentVisualizationMetadata:goal.resourceLinks??[],originalVisualization:inputs[i].page.visualization})
}
const records=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:candidates})
assert.equal(records.length,19)
for(const r of records){
 assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate')
 assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1');assert.deepEqual(r.reviewRunIds,[])
 assert.equal(r.profile.applicationCaseBriefs.length,2);assert.equal(r.profile.coverageExpectations.minimumIndependentDemonstrations,2)
}
const reviewText=records.map(r=>JSON.stringify(r)).join('\n')+'\n'
if(process.argv.includes('--review-only')) {console.log(JSON.stringify({reviewText}));return}
let nativeValidation:any={status:'native records built in memory; not yet ledger-validated'}
if(!process.argv.includes('--emit')){
 assert.equal(readFileSync(config.reviewPath,'utf8'),reviewText)
 const result=reviewPositiveGoalEvidenceConfig(prefix+'.config.json')
 assert.deepEqual(result.errors,[]);nativeValidation={status:'PASS',recordCount:result.records.length,counts:result.counts,errors:result.errors}
}
const paths=[prefix+'.candidates.json',prefix+'.config.json',config.landscapePath,config.semanticKindLedgerPath,config.reviewCriteriaPath,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md',base+'/bundle/book-model.json',base+'/bundle/review-input.jsonl',base+'/bundle/manifest.json','contracts/goal-evidence/v2/goal-evidence-profile.schema.json',base+'/positive-author-unbound-7c0dee9b-draft.json']
const receipt={receiptKind:'math-b037a-positive-author-v1',authoringStartedAt:'2026-09-06T09:46:16Z',checkedAt:new Date().toISOString(),authoringOriginalModelDigest:model.digest,authoringOriginalBundleFingerprint:manifest.bundleFingerprint,originalSourceModelDigest:model.source.landscapeDigest,currentSourceModelDigest:sha(stableGoalBookJson(landscape)),sourceBindings,artifactBindings:paths.map(path=>({path,rawSha256:sha(readFileSync(path))})),profileBindings:records.map(r=>({goalId:r.goalId,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,criteriaFingerprint:r.reviewCriteriaFingerprint})),reviewOutputDigest:sha(reviewText),nativeValidation,arithmeticReceipt,reviewedResourceTypes:[],reviewRunIds:[],authority:'AI candidate E1/G1 only; no human, normative-source, image or learner-mastery approval',heldGoal:{goalId:held.goal.goalId,bindingStatus:'historical draft remains unbound; separate P1 binding is outside this P19 config'},sourceInterpretation:'Original page frames are preserved. Current goal semantic fingerprints and prerequisite sets are exact matches. Any subsequent image metadata/byte repair is separately recorded, not an original-source equality or image-review claim.'}
console.log(JSON.stringify(process.argv.includes('--emit')?{reviewText,receipt}:receipt,null,2))
}
void main().catch(error=>{console.error(error);process.exitCode=1})

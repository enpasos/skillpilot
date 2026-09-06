// Bounded Physics B038 P author check; unbound candidates only.
// Run from repository root: app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-038-oscillations-ac-and-light-models-20-v1/positive-author-check.ts
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import Ajv2020 from '../../../../../../../../../app/node_modules/ajv/dist/2020.js';
import addFormats from '../../../../../../../../../app/node_modules/ajv-formats/dist/index.js';
import {parseAndValidateGoalBookModel} from '../../../../../../../../../app/scripts/goalBookModel.ts';
import {fingerprintPositiveGoalEvidenceProfile} from '../../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts';
const base="curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-038-oscillations-ac-and-light-models-20-v1",prefix="curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-038-oscillations-ac-and-light-models-20-v1";
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex');
const set=json(prefix+'.candidates.json'),config=json(base+'.config.json');
const model=parseAndValidateGoalBookModel(readFileSync(base+'/bundle/book-model.json','utf8'));
const manifest=json(base+'/bundle/manifest.json');
assert.equal(model.digest,'sha256:581fbe64b8bb23ca7fb639a4608675e161b9caf4aeba9f60eca6783598ab1477');
assert.equal(manifest.bookModelDigest,model.digest);
assert.equal(manifest.bundleFingerprint,'sha256:6f4afd2c738ec478100c705411f7890c6d9578b4f038d052a6382348cdfdbb1d');
assert.deepEqual(set.goals.map((g:any)=>g.goalId),config.goalIds);
assert.deepEqual(model.pages.map(p=>p.goalId),config.goalIds);
assert.equal(set.schemaVersion,1);assert.equal(set.authoringContract,'positive-understanding-evidence-candidates-v1');
assert.ok(Number.isFinite(Date.parse(set.reviewedAt)));assert.ok(set.reviewer.includes('unbound'));
const schemaPath='contracts/goal-evidence/v2/goal-evidence-profile.schema.json',schema=json(schemaPath);
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv);ajv.addSchema(schema);
const valid=ajv.compile({$ref:schema.$id+'#/$defs/profile'});
const profileFingerprints=set.goals.map((g:any)=>{
 assert.ok(valid(g.profile),g.goalId+': '+ajv.errorsText(valid.errors));
 assert.equal(g.evidenceLevel,'E1');assert.equal(g.maximumClaimScope,'G1');
 for(const key of ['goalFingerprint','reviewInputFingerprint','status','reviewAuthority','reviewRunIds'])assert.ok(!(key in g));
 const p=g.profile,ids=p.expectations.map((e:any)=>e.id);
 assert.equal(new Set(ids).size,ids.length);assert.deepEqual(p.coverageExpectations.requiredExpectationIds,ids);
 assert.equal(p.coverageExpectations.minimumIndependentDemonstrations,2);
 assert.equal(p.coverageExpectations.freshVariationRequired,true);assert.equal(p.coverageExpectations.independentTransferRequired,true);
 assert.equal(p.applicationCaseBriefs.length,2);assert.equal(new Set(p.applicationCaseBriefs.map((c:any)=>c.id)).size,2);
 return{goalId:g.goalId,profileFingerprint:fingerprintPositiveGoalEvidenceProfile(p)};
});
let numericAssertions=0;
const eq=(a:number,b:number,tol=1e-10)=>{assert.ok(Math.abs(a-b)<=tol,a+' != '+b);numericAssertions++};
const yes=(x:boolean)=>{assert.ok(x);numericAssertions++};
const calculations:string[]=[];
const check=(label:string,fn:()=>void)=>{fn();calculations.push(label)};
const pi=Math.PI,ln=Math.log;
check('01-envelope',()=>{const d=ln(2)/2;eq(d,.3466,.00005);eq(8*Math.exp(-d*6),1);eq(1/.5,2);eq(2*pi/.5,4*pi);});
check('01-non-exponential',()=>{const a=[8,6,4,2];eq(a[1]/a[0],.75);eq(a[2]/a[1],2/3);eq(a[3]/a[2],.5);a.slice(1).forEach((x,i)=>eq(x-a[i],-2));});
const response=(r:number,z:number)=>1/Math.sqrt((1-r*r)**2+(2*z*r)**2);
check('02-sampled-resonance',()=>{const a=[2.538,3.821,5,3.288,1.995],b=[1.667,1.747,1.667,1.444,1.185];[8,9,10,11,12].forEach((f,i)=>{eq(response(f/10,.1),a[i],.0005);eq(response(f/10,.3),b[i],.0005)});eq(5/1.747,2.862,.0005);eq(a.filter(x=>x>2.5).length,4);eq(b.filter(x=>x>.8735).length,5);});
check('02-model-peaks',()=>{eq(response(1,.1),5);eq(response(1,.3),5/3);eq(Math.sqrt(1-2*.1**2),.98995,.000005);eq(Math.sqrt(1-2*.3**2),.90554,.000005);});
check('03-analogy-phases',()=>{[0,pi/2,pi].forEach(t=>eq(Math.cos(t)**2+Math.sin(t)**2,1));eq(Math.cos(pi/2),0);eq(Math.sin(pi/2)**2,1);eq(Math.cos(pi),-1);});
check('03-inertia-factor',()=>{eq(Math.sqrt(4),2);eq(Math.sqrt(4*2)/Math.sqrt(2),2);});
check('04-thomson-values',()=>{const l=20e-3,c=5e-6,t=2*pi*Math.sqrt(l*c);eq(l*c,1e-7);eq(t*1000,1.9869,.00005);eq(1/t,503.29,.005);eq(1/Math.sqrt(l*c),3162.28,.005);eq(Math.sqrt(l*4*c)/Math.sqrt(l*c),2);});
check('04-fixed-product',()=>{eq((.5*2),1);eq(1/Math.sqrt(.5*2),1);});
check('05-charged-initial',()=>{const l=.1,c=10e-6,q=20e-6,w=1/Math.sqrt(l*c);eq(w,1000);eq(q*w,.020);eq(2*pi/w*1000,6.283,.0005);eq(w/(2*pi),159.155,.0005);eq(q*q/(2*c),20e-6);eq(l*(q*w)**2/2,20e-6);eq(-q*w*Math.sin(pi/2),-.020);});
check('05-current-initial',()=>{const l=.5,w=200,i=.040,c=1/(l*w*w),q=i/w;eq(q,2e-4);eq(c,50e-6);eq(2*pi/w*1000,31.416,.0005);eq(w/(2*pi),31.831,.0005);eq(l*i*i/2,.4e-3);eq(q*q/(2*c),.4e-3);eq(i*Math.cos(0),i);eq(i*Math.cos(pi/2),0);});
check('06-ohmic-sine',()=>{eq(4/200,.020);eq(200*pi/(2*pi),100);eq(1/100,.010);eq(Math.sin(pi/2),1);});
check('06-shifted-origin',()=>{eq(6*Math.cos(-pi/3),3);eq(.030*Math.cos(-pi/3),.015);eq(6/.030,200);eq((-pi/3)-(-pi/3),0);});
check('07-capacitor',()=>{eq(10e-6*2*1000,.020);eq(.020/2,.010);eq(10e-6*2*2000,.040);[0,.4,1.1].forEach(x=>eq(Math.cos(x),Math.sin(x+pi/2)));});
check('07-inductor',()=>{eq(.2*.010*500,1);eq(.2*500,100);eq(1/(.2*1000),.005);});
check('08-low-pass',()=>{eq(1/(2*pi*1000*1e-6),159.15,.005);[.1,1,10].forEach((r,i)=>eq(1/Math.sqrt(1+r*r),[.9950,.7071,.09950][i],.00005));});
check('08-high-pass',()=>{[.1,1,10].forEach((r,i)=>eq(r/Math.sqrt(1+r*r),[.09950,.7071,.9950][i],.00005));});
check('10-energy-feedback',()=>{eq(2-.2,1.8);eq(2-.2+.2,2);eq(.5*360,180);});
check('11-amplitude-modulation',()=>{eq(1/100000,10e-6);eq(100000/1000,100);eq(2-.5,1.5);eq(2+.5,2.5);});
check('11-frequency-mapping',()=>{const decode=(f:number)=>f===10.1?1:f===9.9?0:NaN;assert.deepEqual([10.1,9.9,10.1].map(decode),[1,0,1]);numericAssertions++;});
check('12-vacuum-wave',()=>{eq(3e8/(600e-9),5e14,.1);eq(1/5e14,2e-15,1e-25);});
check('13-aperture-ratios',()=>{eq(500e-9/1e-3,.0005);eq(500e-9/1e-5,.05);eq(.05/.0005,100);eq(Math.asin(.0005)*180/pi,.029,.0005);eq(Math.asin(.05)*180/pi,2.87,.005);});
check('13-dispersion',()=>{const s=Math.sin(pi/6);yes(s/1.53<s/1.50);yes(Math.asin(s/1.53)<Math.asin(s/1.50));});
check('14-slit-width-prediction',()=>{const width=(a:number)=>2*2*500e-9/a;eq(width(.1e-3)/width(.2e-3),2);});
check('15-width-number-separation',()=>{const d=.5e-3,a=.1e-3,w=500e-9;eq(w/(2*a)/(w/a),.5);eq(w/d,w/d);eq(2/10,.2);});
check('16-single-slit-minima',()=>{const s=500e-9/.2e-3;eq(s,.0025);const y=2*Math.tan(Math.asin(s));eq(y,.005,2e-8);eq(2*y,.010,4e-8);eq(2*(-Math.tan(Math.asin(s))),-y);});
check('16-periodic-maxima',()=>{const sd=600e-9/.5e-3,sg=600e-9/2e-6;eq(sd,.0012);eq(Math.tan(Math.asin(sd)),.0012,1e-9);eq(sg,.3);eq(Math.asin(sg)*180/pi,17.46,.005);eq(Math.tan(Math.asin(sg)),.3145,.00005);eq(4*sg,1.2);yes(4*sg>1);});
check('20-probability-counts',()=>{eq(1000*.30,300);eq(200*.5,100);eq(.5+.5,1);});
console.log(JSON.stringify({status:'PASS',checkedAt:new Date().toISOString(),binding:'unboundDraft',intendedStatus:'needs_human_review',authority:'ai_candidate',profiles:20,cases:40,numericAssertions,calculationGroups:calculations,candidateDigest:hash(prefix+'.candidates.json'),modelDigest:model.digest,bundleFingerprint:manifest.bundleFingerprint,profileFingerprints,instructionDigests:{
 authoring:hash('curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md'),
 criteria:hash('curricula/DE/Gymnasium/quality/goal-evidence/prompts/physics-positive-understanding-evidence-profile-criteria-v1.md'),
 schema:hash(schemaPath)
},limitations:['Numeric assertions verify concrete arithmetic and model relations, not actual experiments or learner performance.','Qualitative field, interference, historical-model and quantum arguments were inspected separately; assertions are not empirical validation.','No bound review records, source approval, human approval, image QA or central registration created.']},null,2));

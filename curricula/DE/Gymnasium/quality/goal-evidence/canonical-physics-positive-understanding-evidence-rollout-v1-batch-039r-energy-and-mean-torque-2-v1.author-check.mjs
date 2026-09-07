import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../../../../..');
const own=fileURLToPath(import.meta.url).replace(/\.author-check\.mjs$/,'');
const oldPrefix=resolve(repo,'curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-039-quantum-and-rotation-20-v1');
const current19=resolve(repo,'curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-039-current-quantum-and-rotation-19-v1');
const read=p=>readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=s=>'sha256:'+createHash('sha256').update(s).digest('hex');
const originals=[
 ['.candidates.json','sha256:b0b2d7cd49b7049c9e602c86bf27c94a1a78793a9d8d7fd5645378adf4f9fefb'],
 ['.author-check.mjs','sha256:d457c766c45542f8d405c4f7ec767e1bcaf8c9f38493158ad6f663209ec453a8'],
 ['.contextnotes.json','sha256:43fcdd97199b6b05b575f76c609c77b38eb0f39816d6b3456cbbe033d935ff9b']
];
for(const [ext,digest] of originals) assert.equal(sha(read(oldPrefix+ext)),digest,'immutable original '+ext);
const old=json(oldPrefix+'.candidates.json'),p19=json(current19+'.candidates.json'),p2=json(own+'.candidates.json');
const energy='5a951a0b-fd6c-51a1-9ffb-2a34ed6d3931',moment='c2c3cdc5-3e87-47c4-89fd-4eb2c5c2f2ea';
assert.equal(p19.goals.length,19);assert.deepEqual(p19.goals,old.goals.filter(g=>g.goalId!==energy));
assert.deepEqual(p2.goals.map(g=>g.goalId),[energy,moment]);
assert.equal(new Set([...p19.goals,...p2.goals].map(g=>g.goalId)).size,21);
const require=createRequire(resolve(repo,'app/package.json'));
const Ajv2020=require('ajv/dist/2020.js').default;
const schema=json(resolve(repo,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));
const valid=new Ajv2020({strict:false,allErrors:true}).compile({$schema:schema.$schema,$defs:schema.$defs,$ref:'#/$defs/profile'});
for(const [prefix,set] of [[current19,p19],[own,p2]]) {
 const config=json(prefix+'.config.json');
 assert.equal(config.reviewId,set.reviewId);
 assert.deepEqual(config.scope.goalIds,set.goals.map(g=>g.goalId));
 assert.deepEqual(config.reviewedResourceTypes,[]);
 assert.equal(config.requireApproved,false);
 for(const g of set.goals) {
  assert.equal(g.evidenceLevel,'E1');assert.equal(g.maximumClaimScope,'G1');assert.deepEqual(g.dissent,[]);
  assert.ok(valid(g.profile),g.goalId+': '+JSON.stringify(valid.errors));
  assert.equal(g.profile.applicationCaseBriefs.length,2);
  assert.deepEqual(g.profile.coverageExpectations.requiredExpectationIds,g.profile.expectations.map(e=>e.id));
  for(const key of ['expectations','variationAxes','applicationCaseBriefs']) {
   assert.equal(new Set(g.profile[key].map(e=>e.id)).size,g.profile[key].length);
   for(const item of g.profile[key]) for(const [key,value] of Object.entries(item)) if(key.endsWith('En')) {
    assert.notEqual(value,item[key.slice(0,-2)+'De']);
    assert.ok(!/Die Person|Die lernende|Beschleunigungsmoment/.test(value));
   }
  }
 }
}
const oldCases=new Set(old.goals.flatMap(g=>g.profile.applicationCaseBriefs.map(c=>JSON.stringify(c))));
for(const g of p2.goals) for(const c of g.profile.applicationCaseBriefs) assert.ok(!oldCases.has(JSON.stringify(c)));
let numericalAssertions=0;
const near=(actual,expected,label)=>{assert.ok(Math.abs(actual-expected)<1e-12,label+': '+actual+' != '+expected);numericalAssertions++;};
const rotE=(I,w)=>.5*I*w*w;
near(.4/.16,2.5,'inertia ratio');near(rotE(.16,5),2,'rotor A energy');near(rotE(.4,5),5,'rotor B energy');
near(rotE(.4,2.5),1.25,'rotor B half speed');near(rotE(.4,2.5)/rotE(.4,5),.25,'quadratic speed ratio');
near(rotE(.25,8),8,'positive spin');near(rotE(.25,0),0,'rest');near(rotE(.25,-8),8,'negative spin');
near(rotE(.25,-8)-rotE(.25,8),0,'equal endpoint energies');
near((3-9)/2,-3,'run A alpha');near((-9-(-3))/2,-3,'run B alpha');near(.8*(-3),-2.4,'mean torque');
near(Math.abs(3)-Math.abs(9),-6,'A braking');near(Math.abs(-9)-Math.abs(-3),6,'B speeding up');
const timeMean=entries=>entries.reduce((s,[a,t])=>s+a*t,0)/entries.reduce((s,[a,t])=>s+t,0);
const advance=(initial,entries)=>initial+entries.reduce((s,[a,t])=>s+a*t,0);
for(const [name,history,mean,end] of [['A',[[4,2]],4,20],['B',[[8,1],[0,1]],4,20],['C',[[4,1],[-4,1]],0,12]]) {
 near(timeMean(history),mean,name+' mean alpha');
 near(.5*timeMean(history),.5*mean,name+' mean net torque');
 near(advance(12,history),end,name+' final omega');
}
near(advance(12,[[4,1]]),16,'C intermediate omega');
near(.5*4,2,'C nonzero first torque');near(.5*(-4),-2,'C nonzero second torque');
const canonical=json(resolve(repo,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'));
const gc=id=>canonical.goals.find(g=>g.id===id);
for(const id of [energy,moment])assert.deepEqual(gc(id).requires,['642aebd7-66cd-5a50-b543-73c4b207525d']);
assert.ok(!gc(energy).description.includes('Beschleunigungsmoment'));
assert.ok(gc(moment).description.includes('mittlere')&&gc(moment).description.includes('konstantem Trägheitsmoment'));
assert.ok(gc('b49e0f6b-df2a-5643-b3ce-a9dfdf25f3bc').description.includes('Änderung der Drehimpulsrichtung'));
const goalHashes=p19.goals.map(g=>({goalId:g.goalId,exactCandidateBodySha256:sha(JSON.stringify(g)),exactProfileBodySha256:sha(JSON.stringify(g.profile)),matchesOriginal:true}));
console.log(JSON.stringify({checkedAt:new Date().toISOString(),status:'PASS',originalFilesUnchanged:originals.map(([extension,digest])=>({path:oldPrefix+extension,sha256:digest})),derivedProfiles:19,derivedFreshCases:38,newProfiles:2,newFreshCases:4,numericalAssertions,profileSchemaChecks:21,goalHashes,authority:'Read-only author check; no human approval, learner performance, D-review, registry or progress claim.'},null,2));

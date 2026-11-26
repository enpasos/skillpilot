#!/usr/bin/env node
// Author-side structural checks only, never independent free-response marking.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const base=path.dirname(fileURLToPath(import.meta.url));
const read=rel=>JSON.parse(readFileSync(path.join(base,rel),'utf8'));
const sha=rel=>createHash('sha256').update(readFileSync(path.join(base,rel))).digest('hex');
const c=read('candidate.goal.json'),e=c.examData,s=e.scoring;
assert.equal(c.id,'2569d84a-5bf1-542b-bc43-6ade1df971c4');
assert.deepEqual(c.requires,['b77a7e93-22f9-5722-a4cc-f18a149ab030']);
assert.deepEqual(e.coveredGoalIds,c.requires);
assert.equal(e.reviewStatus,'needs_review');
assert.equal(s.maxPoints,16);assert.equal(s.passingPoints,13.5);
assert.ok(s.passingPoints/s.maxPoints<=0.85);
assert.equal(s.steps.reduce((n,x)=>n+x.points,0),16);
assert.deepEqual(s.steps.map(x=>x.id),['A','B','C','D']);
assert.deepEqual(s,read('rubric.json'));
for(const step of s.steps){assert.equal(step.points,4);assert.ok(step.points>16-13.5);assert.ok(step.description.length<2000);assert.ok(step.description.includes(' / EN: '));}
for(const key of ['taskContent','taskContentEn','solutionContent','solutionContentEn'])assert.ok(e[key].length>0);
for(const key of ['taskContent','taskContentEn']){
 assert.ok(e[key].includes('![')&&e[key].includes('/assets/assessment-materials/physik/'));
 assert.ok(!e[key].includes('6 m/s'));
 assert.ok(!e[key].includes('v_A'));
}
assert.equal(sha('../v1/candidate.goal.json'),'8eee901bbea353b180cea7ca64a46fa90ca506bcf82db192d794b136749a6e8e');
const cases=read('blind/scripts.json').cases,expected=read('author/expectations.json').cases;
assert.equal(cases.length,20);assert.equal(new Set(cases.map(x=>x.id)).size,20);
assert.deepEqual(cases.map(x=>x.id),expected.map(x=>x.id));
for(const item of cases){
 assert.deepEqual(Object.keys(item).sort(),['drawingPaths','id','responseDe','responseEn']);
 assert.ok(item.responseDe&&item.responseEn);
 for(const drawing of item.drawingPaths)assert.equal(readFileSync(path.join(base,'blind',drawing)).subarray(1,4).toString(),'PNG');
}
for(const item of expected){
 assert.deepEqual(item.expectedPointsDe,item.expectedPointsEn);
 assert.equal(Object.values(item.expectedPointsDe).reduce((a,b)=>a+b,0),item.expectedTotal);
 assert.equal(item.expectedPass,item.expectedTotal>=13.5);
 assert.ok(Object.values(item.expectedPointsDe).every(n=>n>=0&&n<=4));
}
for(const [criterion,id]of Object.entries(read('author/core-protection.actual.json').actualOmissionCases)){
 const item=expected.find(x=>x.id===id);assert.equal(item.expectedPointsDe[criterion],1);assert.equal(item.expectedTotal,13);assert.equal(item.expectedPass,false);
}
assert.ok(expected.some(x=>x.expectedTotal===13.5&&x.expectedPass));
assert.ok(expected.some(x=>x.expectedTotal===13&&!x.expectedPass));
assert.ok(expected.some(x=>x.expectedTotal===15.5&&x.expectedPass));
assert.equal(expected.find(x=>x.id==='S20').expectedPass,false);
const renderer=read('author/render.actual.json');assert.equal(renderer.status,'pass');assert.equal(renderer.observations.length,4);
assert.equal(renderer.candidateSha256,sha('candidate.goal.json'));
for(const f of read('author/manifest.json').files)assert.equal(sha(f.path),f.sha256,f.path);
const result={status:'pass',scope:'author-side-structural-validation-not-independent-marking',candidateSha256:sha('candidate.goal.json'),maxPoints:16,passingPoints:13.5,passingPercentage:84.375,caseCount:20,diagramCount:10,stepUtf16:s.steps.map(x=>({id:x.id,utf16Units:x.description.length})),coreWeightCheck:'Each subject core has3 points; supplement-only maximum13 <13.5.',actualGoalCardRenders:4,priorCandidatePreserved:true};
writeFileSync(path.join(base,'author/validation.actual.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));

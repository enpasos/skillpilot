#!/usr/bin/env node
// Structural author-side validation only. This does not mark free-text submissions.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base=path.dirname(fileURLToPath(import.meta.url));
const read=rel=>JSON.parse(readFileSync(path.join(base,rel),'utf8'));
const candidate=read('candidate.goal.json');
const exam=candidate.examData;
const rubric=exam.scoring;
const cases=read('blind/scripts.json').cases;
const expected=read('author/expectations.json').cases;
const scope=read('scope.json');
const sha=rel=>createHash('sha256').update(readFileSync(path.join(base,rel))).digest('hex');
assert.equal(candidate.id,'2569d84a-5bf1-542b-bc43-6ade1df971c4');
assert.deepEqual(candidate.requires,['b77a7e93-22f9-5722-a4cc-f18a149ab030']);
assert.deepEqual(exam.coveredGoalIds,candidate.requires);
assert.deepEqual(candidate.contains,[]);
assert.equal(candidate.type,'atomic');
assert.equal(exam.reviewStatus,'needs_review');
assert.match(candidate.title,/^Prüfungsaufgabe: /u);
assert.match(candidate.description,/^Die lernende Person kann /u);
assert.equal(rubric.maxPoints,12);
assert.equal(rubric.passingPoints,10);
assert.ok(rubric.passingPoints/rubric.maxPoints<=0.85);
assert.deepEqual(rubric,read('rubric.json'));
assert.deepEqual(rubric.steps.map(s=>s.id),['A','B','C','D']);
assert.equal(rubric.steps.reduce((n,s)=>n+s.points,0),rubric.maxPoints);
for(const s of rubric.steps){
  assert.equal(s.points,3);
  assert.ok(s.points>rubric.maxPoints-rubric.passingPoints);
  assert.ok(s.description.length<2000,`${s.id}: UTF16`);
  assert.ok(s.description.includes(' / EN: '));
}
const publicFields=[candidate.title,candidate.titleEn,candidate.description,candidate.descriptionEn,...['taskContent','taskContentEn','solutionContent','solutionContentEn'].map(k=>exam[k])];
assert.ok(publicFields.every(t=>t.length>0));
assert.ok(publicFields.every(t=>!/(?:K4|rubricVersion|needs_review|Blindpaket|marker-a|marker-b)/u.test(t)));
assert.match(exam.taskContent,/Eine reine Textbeschreibung ersetzt die Zeichnung nicht/u);
assert.match(exam.taskContentEn,/A text description alone does not replace the drawing/u);
assert.equal(scope.regularTargetLandCount,14);
assert.equal(scope.jurisdictions.length,14);
assert.equal(scope.offerViews.length,42);
assert.ok(scope.offerViews.every(x=>['SekI','CrossStage'].includes(x.scope.stage)));
assert.ok(scope.offerViews.every(x=>!['DE-HE','DE-BW'].includes(x.scope.jurisdiction)));
assert.equal(cases.length,20);
assert.equal(new Set(cases.map(c=>c.id)).size,20);
assert.deepEqual(cases.map(c=>c.id),expected.map(c=>c.id));
for(const c of cases){
  assert.deepEqual(Object.keys(c).sort(),['drawingPaths','id','responseDe','responseEn']);
  assert.ok(c.responseDe.length>0&&c.responseEn.length>0);
  for(const drawing of c.drawingPaths){
    const image=readFileSync(path.join(base,'blind',drawing));
    assert.equal(image.subarray(1,4).toString(),'PNG');
  }
}
for(const e of expected){
  assert.deepEqual(e.expectedPointsDe,e.expectedPointsEn);
  assert.equal(Object.values(e.expectedPointsDe).reduce((a,b)=>a+b,0),e.expectedTotal);
  assert.equal(e.expectedPass,e.expectedTotal>=rubric.passingPoints);
  assert.ok(Object.values(e.expectedPointsDe).every(n=>n>=0&&n<=3));
}
assert.ok(expected.some(x=>x.expectedTotal===10));
assert.ok(expected.some(x=>x.expectedTotal===9.5));
assert.ok(expected.some(x=>x.expectedTotal===11.5));
assert.ok(cases.some(x=>x.drawingPaths.length===0));
for(const f of read('author/manifest.json').files)assert.equal(sha(f.path),f.sha256,f.path);
const result={status:'pass',scope:'author-side-structural-validation-only',candidateSha256:sha('candidate.goal.json'),cases:cases.length,drawingFiles:7,offerViews:scope.offerViews.length,maxPoints:12,passingPoints:10,passingPercentage:100*10/12,steps:rubric.steps.map(s=>({id:s.id,points:s.points,utf16Units:s.description.length})),note:'No independent marking, learner result, catalog activation or curriculum CI result is asserted.'};
writeFileSync(path.join(base,'author/validation.actual.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));

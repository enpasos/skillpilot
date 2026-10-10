import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {collectWholeMaterialPrerequisiteClosure} from './generateCurriculumQualityStatus.ts';
const O=process.argv[2];
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const c=read(O+'/whole-current597-immutable-economics-before-finance12.exact.json');
const original=JSON.stringify(c);
const materials=read(O+'/whole-twelve-local-finance-integration-market.DEEN-readable-two-real-cases.DRAFT-author-v2.json');
assert.equal(c.goals.length,597);
const ids=new Set(c.goals.map((g:any)=>g.id));
for(const g of materials){assert(!ids.has(g.id));assert.deepEqual(g.requires,g.examData.coveredGoalIds);assert.equal(g.examData.reviewStatus,'draft');ids.add(g.id);}
const candidate={...c,goals:[...c.goals,...materials]};
const rows=materials.map((g:any)=>{
 const closure=collectWholeMaterialPrerequisiteClosure(candidate,g.id);
 assert.equal(closure.unresolvedReferences.size,0);
 assert(closure.atomicGoalIds.has(g.requires[0]));
 return {materialId:g.id,wholeAssessedGoalId:g.requires[0],wholeAssessedGoal:c.goals.find((x:any)=>x.id===g.requires[0]),
  actualAtomicPrerequisiteIds:[...closure.atomicGoalIds].sort(),actualUnresolvedReferences:[...closure.unresolvedReferences].sort(),
  unplacedWholeBodyOnly:true,noCountryCourseOrRouteApproval:true};
});
assert.equal(JSON.stringify(c),original);
const digest=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
writeFileSync(O+'/actual-twelve-unplaced-full-current597-inherited-atomic-prerequisite-closures.native-AUTHOR.json',JSON.stringify({
 role:'AUTHOR native complete unplaced closure intake only; no scientific/scope approval',actualCurrentGoalCount:597,
 actualCandidateGoalCount:609,actualUnplacedBodyCount:12,actualUnresolvedReferenceCount:0,
 actualWholeCurrentCANSHA256:digest(O+'/whole-current597-immutable-economics-before-finance12.exact.json'),
 actualBodySHA256:digest(O+'/whole-twelve-local-finance-integration-market.DEEN-readable-two-real-cases.DRAFT-author-v2.json'),rows
},null,2)+'\n');
console.log(JSON.stringify({actualUnplacedBodies:12,actualCurrent597:true,actualUnresolvedReferences:0}));

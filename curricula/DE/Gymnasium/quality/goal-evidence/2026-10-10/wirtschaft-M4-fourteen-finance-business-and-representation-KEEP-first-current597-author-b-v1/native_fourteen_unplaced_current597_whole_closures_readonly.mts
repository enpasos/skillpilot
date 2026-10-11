import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {collectWholeMaterialPrerequisiteClosure} from './generateCurriculumQualityStatus.ts';
const root=process.argv[2], O=process.argv[3];
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const intake=read(O+'/actual-current597-fourteen-whole-contracts-original-P28-ten-existing-materials-and64-scope-KEEP-first.AUTHOR-intake.json');
const input=root+'/'+intake.immutableWholeCurrent597.path;
const c=read(input), original=JSON.stringify(c);
const bp=O+'/whole-fourteen-finance-business-representation-human-source-labels-and-learner-solutions.DRAFT-author-v2.json';
const materials=read(bp);
assert.equal(c.goals.length,597);assert.equal(materials.length,14);
const ids=new Set(c.goals.map((g:any)=>g.id));
for(const g of materials){assert(!ids.has(g.id));assert.deepEqual(g.requires,g.examData.coveredGoalIds);assert.equal(g.examData.reviewStatus,'draft');ids.add(g.id);}
const candidate={...c,goals:[...c.goals,...materials]};
const rows=materials.map((g:any)=>{
 const closure=collectWholeMaterialPrerequisiteClosure(candidate,g.id);
 assert.equal(closure.unresolvedReferences.size,0);
 assert(closure.atomicGoalIds.has(g.requires[0]));
 return {materialId:g.id,wholeAssessedGoalId:g.requires[0],actualAtomicPrerequisiteIds:[...closure.atomicGoalIds].sort(),
  actualUnresolvedReferences:[...closure.unresolvedReferences].sort(),unplacedWholeBodyOnly:true,noCountryCourseOrRouteApproval:true};
});
assert.equal(JSON.stringify(c),original);
const digest=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
writeFileSync(O+'/actual-fourteen-unplaced-current597-final-ops-inherited-atomic-closures.native-AUTHOR.json',JSON.stringify({
 role:'AUTHOR actual native unplaced whole closure only; no compiler/science/source/country/course/route/nav approval',
 actualCurrentGoalCount:597,actualCandidateUnplacedGoalCount:611,actualBodyCount:14,
 actualWholeCurrentCANSHA256:digest(input),actualFinalBodySHA256:digest(bp),
 actualUnresolvedReferenceCount:0,rows
},null,2)+'\n');
console.log(JSON.stringify({actualUnplacedBodies:14,actualCurrent597:true,actualUnresolvedReferences:0}));

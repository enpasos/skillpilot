import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {collectWholeMaterialPrerequisiteClosure} from './generateCurriculumQualityStatus.ts';
const root=process.argv[2], O=process.argv[3];
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const intake=read(O+'/whole-current597-twelve-DEEN-contracts-original-P24-seven-retained-materials.author-intake.json');
const input=root+'/'+intake.immutableWhole597InputPath;
const c=read(input), original=JSON.stringify(c);
const bp=O+'/whole-twelve-labour-society-only-three-separated-source-and-interest-boundaries.DRAFT-author-v2.json';
const materials=read(bp);
assert.equal(c.goals.length,597);assert.equal(materials.length,12);
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
writeFileSync(O+'/actual-twelve-unplaced-current597-final-labour-inherited-atomic-closures.native-AUTHOR.json',JSON.stringify({
 role:'AUTHOR actual native unplaced whole closure only; no compiler/science/source/country/course/route/nav approval',
 actualCurrentGoalCount:597,actualCandidateUnplacedGoalCount:609,actualBodyCount:12,
 actualWholeCurrentCANSHA256:digest(input),actualFinalBodySHA256:digest(bp),
 actualUnresolvedReferenceCount:0,rows
},null,2)+'\n');
console.log(JSON.stringify({actualUnplacedBodies:12,actualCurrent597:true,actualUnresolvedReferences:0}));

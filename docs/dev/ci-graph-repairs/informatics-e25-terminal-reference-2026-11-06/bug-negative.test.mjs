import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { reserveV0 } from './buggy.mjs';
const failures=[];
for(const [name,places,accepted,reserved] of [['valid-small',2,true,5],['exact-fit',3,true,6],['overbook',4,false,3]]) {
 const course={capacity:6,reserved:3};
 try{assert.equal(reserveV0(course,places),accepted);assert.equal(course.reserved,reserved);}
 catch(error){failures.push({name,places,expectedAccepted:accepted,expectedReserved:reserved,actualReserved:course.reserved,error:error.message});}
}
writeFileSync(new URL('./bug-negative-results.json',import.meta.url),JSON.stringify({expectedBrokenProgram:true,failedCases:failures},null,2)+'\n');
console.log(JSON.stringify({actualOldProgramRequirementFailures:failures.length,failures}));
process.exit(failures.length===3?1:2);

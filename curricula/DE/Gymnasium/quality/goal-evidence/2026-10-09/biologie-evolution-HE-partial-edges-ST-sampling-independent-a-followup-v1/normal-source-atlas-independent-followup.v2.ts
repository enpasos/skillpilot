// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildGoalBookSourceAtlasInputs, readGoalBookSourceAtlasInputConfig } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts';
const own=dirname(fileURLToPath(import.meta.url));const root=resolve(own,'../../../../../../..');
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-three-HE-partial-edge-scope-remediation-author-v1');
const native=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1');
const ref=(p:string)=>{const b=readFileSync(p);return {path:relative(root,p),sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const newConfig=resolve(author,'candidate/source-atlas.current479-394-three-HE-partial-edges.inputs.json');
const oldConfig=resolve(native,'candidate/source-atlas.current479-394-whole-source7.inputs.json');
const results=[];
for(const [label,config] of [['current-partial-three-v2',newConfig]] as const){
 const result=buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig(relative(root,config),root),root);const output=resolve(own,'normal-source-atlas',label);mkdirSync(output,{recursive:true});const transports=[];
 for(const [intendedPath,b] of Object.entries(result.outputs)){const p=resolve(output,basename(intendedPath));writeFileSync(p,b);transports.push({intendedPath,actualTransport:ref(p),activeWrite:false});}
 if(result.receipt.counts.canonicalCurricularAtomicGoals!==394||result.receipt.counts.publishedCurricularAtomicGoals!==394)throw new Error('394 count changed');
 results.push({label,config:ref(config),counts:result.receipt.counts,claims:result.receipt.claims,transports});
}
writeFileSync(resolve(own,'normal-source-atlas-independent-followup.v2.actual.json'),JSON.stringify({schemaVersion:1,role:'independent actual ordinary source-atlas bounded technical check after own science FIRST',ordinaryFunction:'buildGoalBookSourceAtlasInputs',results,activeWrites:0,mandatoryOrElectiveWholeCourseApproval:false,humanApproval:false,strictGain:0},null,2)+'\n');
console.log(JSON.stringify({results:results.map(x=>({label:x.label,counts:x.counts})),activeWrites:0}));

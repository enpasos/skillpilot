// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync,lstatSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {copyGoalVisualizationAsset} from '../../../../../../../scripts/deploy_goal_visualizations';
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-transparency-runtime-copy-preparation-technical-20261018-v1/';
assert(!existsSync(O+'FREEZE.technical.sha256.json'),'Frozen preparation record is immutable');
const input=JSON.parse(readFileSync(O+'INPUTS.raw-before-frozen-and-exact124-missing-backend.json','utf8'));
const pin=(path:string)=>{const b=readFileSync(path);return{path,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}};
for(const p of input.frozenInputPins)assert.deepEqual(pin(p.path),p,'Frozen input changed before bounded copy');
assert.equal(input.missingBackendCopies.length,124);
const startedUTC=new Date().toISOString(),outputs=[];
for(const row of input.missingBackendCopies){
 assert(!existsSync(row.backendOutputPath),'Only absent generated backend copies may be written');
 assert(row.backendOutputPath.startsWith('backend/src/main/resources/static/assets/goal-visualizations/chemie/'));
 assert(row.backendOutputPath.endsWith('.png'));
 assert.deepEqual(pin(row.sourcePin.path),row.sourcePin);
 assert.deepEqual(pin(row.frontendPin.path),row.frontendPin);
 copyGoalVisualizationAsset(row.sourcePin.path,'backend/src/main/resources/static/assets/goal-visualizations',row.relativePath);
 const output=pin(row.backendOutputPath),s=lstatSync(row.backendOutputPath);assert.equal(output.sha256,row.sourcePin.sha256);assert(s.isFile()&&!s.isSymbolicLink()&&s.nlink===1);
 outputs.push({goalId:row.goalId,source:row.sourcePin,frontend:row.frontendPin,output,byteExact:true,regularFile:true,linkCount:s.nlink});
}
for(const p of [...input.frozenInputPins,...input.existingBackendCopyPins])assert.deepEqual(pin(p.path),p,'Frozen/source/frontend/existing-backend input changed');
writeFileSync(O+'RESULT.exact124-existing-production-backend-copies.json',JSON.stringify({role:'BOUNDED_EXISTING_ASSET_PREPARATION_ONLY',startedUTC,finishedUTC:new Date().toISOString(),productionFunction:'scripts/deploy_goal_visualizations.ts::copyGoalVisualizationAsset',outputs,backendPNGOutputs:outputs.length,sourceAndFrontendImageWrites:0,otherBuildOrPluginOutputs:0,existingBackendCopiesUnchanged:input.existingBackendCopyPins.length,allFrozenInputPinsExact:true,newImageOrHumanApproval:false},null,2)+'\n');
console.log('Copied exactly '+outputs.length+' missing Chemistry backend PNGs with the existing production function; all frozen/source/frontend/existing backend inputs exact.');

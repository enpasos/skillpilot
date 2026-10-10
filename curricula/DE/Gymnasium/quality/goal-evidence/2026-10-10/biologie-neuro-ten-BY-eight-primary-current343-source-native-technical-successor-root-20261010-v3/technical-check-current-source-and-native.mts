// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const R='/home/enpasos/projects/skillpilot';
const C=readFileSync(resolve(R,'tmp/m7-resumption-20261010/biologie-four-native-technical/capsule.actual.path.txt'),'utf8').trim();
const B='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/';
const V=B+'biologie-neuro-verhalten-hormone-ten-sehbahn-v3-current343-native-technical-successor-20261010-v2';
const P=B+'biologie-neuro-ten-BY-eight-primary-current343-source-native-technical-successor-root-20261010-v3';
const {buildGoalBookSourceAtlasInputs,compactGoalBookSourceAtlasReceipt,expandGoalBookSourceAtlasReceipt}=await import(pathToFileURL(resolve(C,'app/scripts/goalBookSourceAtlasInputs.ts')).href);
const {loadGoalBookBuildInputs,stableGoalBookJson}=await import(pathToFileURL(resolve(C,'app/scripts/goalBookModel.ts')).href);
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'));
const put=(p:string,x:any)=>writeFileSync(resolve(R,P,p),JSON.stringify(x,null,2)+'\n');
const current=buildGoalBookSourceAtlasInputs(read(P+'/sources/current-eight-BY-primary.normal-atlas.config.json'),C);
const before=expandGoalBookSourceAtlasReceipt(read(V+'/sources/current-after-normal-source-atlas.receipt.compact.json'));
put('sources/current-eight-BY-primary.actual-normal-source-atlas.receipt.compact.json',compactGoalBookSourceAtlasReceipt(current.receipt));
put('checks/actual-normal-source-atlas-before-after-structure.json',{
 schemaVersion:1,beforeKeys:Object.keys(before),currentKeys:Object.keys(current.receipt),
 beforeCounts:before.counts,currentCounts:current.receipt.counts,
 beforeScopes:before.scopes,currentScopes:current.receipt.scopes,
 actualNormalApi:'buildGoalBookSourceAtlasInputs',technicalOnly:true,scientificApproval:false,
});
const oldModel=read(V+'/native/current394-after.actual-normal-model.json');
const model=(await loadGoalBookBuildInputs(V+'/native/current394-after.normal.config.json',C)).model;
assert.equal(stableGoalBookJson(model),stableGoalBookJson(oldModel));
put('checks/actual-current394-native-and-P-remain-exact.normal.json',{
 schemaVersion:1,actualNormalApi:'loadGoalBookBuildInputs',sameNormalConfigAndCanonicalAndP:true,
 all394WholePageBodiesAndDigestExact:true,protected343WholePageBodiesExact:true,
 sourceOnlySuccessorDoesNotRewriteCanonicalNativePInputs:true,
 scientificApprovalFromTechnicalComparison:false,humanApproval:false,activeStrictGain:0,
});
console.log(JSON.stringify({normalSourceAtlasPassed:true,beforeCounts:before.counts,currentCounts:current.receipt.counts,whole394NativeAndPExact:true,currentScopes:current.receipt.scopes.length}));

// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {loadGoalBookBuildInputs} from '../../../../../../../app/scripts/goalBookModel.ts';
import {reviewPositiveGoalEvidenceConfig} from '../../../../../../../app/scripts/positiveGoalEvidenceReview.ts';
const root=resolve('.'),base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09',own=base+'/biologie-evolution-sixteen-reviewed-active-integration-root-v1';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));const bind=(p:string)=>{const b=readFileSync(p);return {path:p,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const actual=(await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',root)).model;
const priorPath=base+'/biologie-evolution-sixteen-current-inactive-native-comparison-technical-b-v1/candidate/full394-only16-corrected-source.model.json',prior=read(priorPath);
const oldMap=new Map(prior.pages.map((p:any)=>[p.goalId,p]));const deltas=actual.pages.filter((p:any)=>JSON.stringify(p)!==JSON.stringify(oldMap.get(p.goalId))).map((p:any)=>({goalId:p.goalId,changedFields:Object.keys(p).filter(k=>JSON.stringify(p[k])!==JSON.stringify((oldMap.get(p.goalId) as any)?.[k])),before:oldMap.get(p.goalId),after:p}));
writeFileSync(own+'/current394-active-normal-model.actual.json',JSON.stringify(actual,null,2)+'\n');
const p=reviewPositiveGoalEvidenceConfig(own+'/P16-exact-genuine-A-reviewed.active.config.json');
writeFileSync(own+'/current394-and-P16-exact-normal-adoption-comparison.actual.json',JSON.stringify({schemaVersion:1,role:'Actual normal current394 and currentP16 measured after ordinary imports; no new review claimed',currentModel:bind(own+'/current394-active-normal-model.actual.json'),reviewedPriorModel:bind(priorPath),actualPages:actual.pages.length,priorPages:prior.pages.length,wholePageDeltas:deltas,normalP16Counts:p.counts,normalP16Errors:p.errors,humanApproval:false,humanTrial:false},null,2)+'\n');
assert.equal(actual.pages.length,394);assert.deepEqual(p.errors,[]);assert.deepEqual(deltas,[],'Actual whole current native pages must equal genuinely independently reviewed exact16 baseline');
console.log(JSON.stringify({actualPages:actual.pages.length,wholePageDeltas:deltas.length,P16:p.counts,errors:p.errors}));

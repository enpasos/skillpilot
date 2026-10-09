// SPDX-License-Identifier: Apache-2.0
// Bounded independent use of existing normal source-atlas/compiler functions.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildGoalBookSourceAtlasInputs, readGoalBookSourceAtlasInputConfig } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts';
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts';
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts';
const own=dirname(fileURLToPath(import.meta.url));
const root=resolve(own,'../../../../../../..');
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-eighteen-seven-source-course-remediation-author-v1');
const sha=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex');
const ref=(path:string)=>({path:relative(root,path),sha256:sha(readFileSync(path)),bytes:readFileSync(path).length});
const atlasChecks=[];
for (const [label,name] of [['book-catalog','candidate/source-atlas.whole479-book-catalog-with-optional-witness.inputs.json'],['mandatory-diagnostic','candidate/conditional/source-atlas.whole479-mandatory-only-diagnostic.inputs.json'],['selected-only','candidate/conditional/source-atlas.whole479-explicit-Q1-5-selection-only.inputs.json']]) {
 const config=resolve(author,name); const result=buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig(relative(root,config),root),root);
 const transports=[]; const dir=resolve(own,'normal-atlas',label); mkdirSync(dir,{recursive:true});
 for (const [intendedPath,bytes] of Object.entries(result.outputs)) { const dest=resolve(dir,basename(intendedPath)); writeFileSync(dest,bytes); transports.push({intendedPath,actualTransport:ref(dest),activeWrite:false}); }
 atlasChecks.push({config:ref(config),counts:result.receipt.counts,claims:result.receipt.claims,sourceApproval:false,learnerDefaultApproval:false,transports});
}
const raw=JSON.parse(readFileSync(resolve(author,'input/current-canonical479.exact.json'),'utf8')); const canon=normalizeCanonicalLandscape(raw);
const views=[];
for (const n of ['de-mv-gym-seki-biology.view.json','de-sn-gym-seki-biology.view.json','de-st-gym-seki-biology.view.json','de-th-gym-seki-biology.view.json','HE-LK-Q2-1-limited-core-source-role-preview.view.json','HE-Q1-5-LK-explicitly-selected.view.json']) {
 const path=resolve(author,'candidate/composition-views',n);const view=normalizeCompositionView(JSON.parse(readFileSync(path,'utf8')));const compiled=compileCompositionView(view,canon);const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(canon.goals.map(g=>[g.id,g])));
 views.push({binding:ref(path),viewId:view.viewId,scope:view.scope,findings:compiled.findings,targetGoalIds:[...roles.targetGoalIds].sort(),prerequisiteOnlyGoalIds:[...roles.prerequisiteOnlyGoalIds].sort(),fullCourseApproval:false});
}
writeFileSync(resolve(own,'normal-source-atlas-and-six-view-independent-check.actual.json'),JSON.stringify({schemaVersion:1,role:'independent-existing-normal-functions-technical-only',ordinaryAtlasFunction:'buildGoalBookSourceAtlasInputs',ordinaryCompiler:'compileCompositionView',atlasChecks,views,activeWrites:false,sourceApproval:false,fullCourseApproval:false,humanApproval:false,strictGain:0},null,2)+'\n');
console.log(JSON.stringify({atlas:atlasChecks.map(x=>x.counts),views:views.map(x=>({viewId:x.viewId,errors:x.findings.filter(f=>f.severity==='error').length,targets:x.targetGoalIds.length})),activeWrites:false}));

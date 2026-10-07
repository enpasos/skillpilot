// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {compileCompositionView} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
const own=dirname(fileURLToPath(import.meta.url)),root=resolve(own,'../../../../../../..'),a='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-native-source-preparation-author-v3/',inputs=new Map<string,any>()
const read=(p:string)=>{const bytes=readFileSync(resolve(root,p));inputs.set(p,{path:p,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});return JSON.parse(bytes.toString('utf8'))}
const attach=(c:any,k:any)=>{const kinds=new Map(k.decisions.map((d:any)=>[d.goalId,d.semanticKind]));return normalizeCanonicalLandscape({...c,goals:c.goals.map((g:any)=>({...g,semanticKind:kinds.get(g.id)}))})}
const before=attach(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),read('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'))
const after=attach(read(a+'qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.four-route-proposals.author-candidate.json'),read(a+'qa-artifacts/chemie.semantic-kinds.four-route-proposals.author-candidate.json'))
const manifest=read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json'),split=['7be6f951-a614-52dc-94d3-2ce0d33765ff','53fd1bfd-facb-54ae-b2dc-f667ed1414fc'],rows:any[]=[]
for(const p of manifest.sourcePaths){const v=read(p),refs:any[]=[];const visit=(nodes:any[])=>{for(const n of nodes){if(split.includes(n.goalId))refs.push({kind:n.kind,goalId:n.goalId,projectionRole:n.projectionRole??'target'});if(n.children)visit(n.children)}};visit(v.rootNodes);if(!refs.length)continue;const oldResult=compileCompositionView(v,before),newResult=compileCompositionView(v,after);rows.push({path:p,viewId:v.viewId,scope:v.scope,refs,convertedGoalEntryHolds:newResult.findings.filter((f:any)=>f.code==='CPV-009'&&split.includes(f.goalId)),otherAddedFindings:newResult.findings.filter((f:any)=>!oldResult.findings.some((x:any)=>JSON.stringify(x)===JSON.stringify(f))&&!(f.code==='CPV-009'&&split.includes(f.goalId)))})}
assert.equal(manifest.sourcePaths.length,48);assert.equal(rows.length,40);assert.equal(rows.reduce((n,r)=>n+r.convertedGoalEntryHolds.length,0),72)
writeFileSync(resolve(own,'actual-affected-source-view-compiler-holds-independent-a.json'),JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),configured48:48,affected40:40,actualConvertedGoalEntryCPV009Holds:72,rows,inputBindings:[...inputs.values()],activeWrites:false,nationalSourceCoverageOrViewApproval:false,humanApproval:false,strictCompletionsAdded:0},null,2)+'\n')
console.log(JSON.stringify({affectedSourceViews:40,convertedGoalEntryHolds:72,notNationalSourceAtlasBuild:true,activeWrites:false}))

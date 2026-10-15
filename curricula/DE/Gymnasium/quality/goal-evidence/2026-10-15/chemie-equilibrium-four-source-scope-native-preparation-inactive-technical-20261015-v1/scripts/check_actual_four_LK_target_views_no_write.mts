// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const own=resolve(dirname(fileURLToPath(import.meta.url)),'..');let repo=own
while(true){try{readFileSync(resolve(repo,'AGENTS.md'));break}catch{repo=dirname(repo)}}
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const plan=read(resolve(own,'checks/INPUTS.no-render-stock-context.plan.technical.json')),host=resolve(repo,plan.host)
const {normalizeCanonicalLandscape}=await import(pathToFileURL(resolve(host,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds}=await import(pathToFileURL(resolve(host,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const canonical=normalizeCanonicalLandscape(read(resolve(repo,plan.canonical.path))),by=new Map(canonical.goals.map((g:any)=>[g.id,g]))
const files=['curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-sekii-chemistry-lk.view.json','curricula/DE/Gymnasium/composition-views/chemie/de-he-lk.view.json','app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/de-gym-chemie-bundesweit-source-de-by-sekii-lk.view.json','app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/de-gym-chemie-bundesweit-source-de-he-sekii-lk.view.json']
const views=[]
for(const path of files){
 const p=resolve(repo,path),b=readFileSync(p),v=normalizeCompositionView(JSON.parse(b.toString())),compiled=compileCompositionView(v,canonical),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,by,new Map([[canonical.landscapeId,canonical.goals[0].id]]))
 const flat:any[]=[];const visit=(n:any)=>{flat.push(n);n.children?.forEach(visit)};compiled.compiledRootNodes.forEach(visit)
 views.push({input:{path,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length},viewId:v.viewId,scope:v.scope,wholeUnchangedView:v,findings:compiled.findings,goals:plan.targetGoalIds.map((goalId:string)=>({goalId,target:roles.targetGoalIds.has(goalId),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(goalId),compiledOccurrences:flat.filter(n=>n.sourceGoalId===goalId).length}))})
}
if(views.some(v=>v.findings.length))throw new Error('Actual compiler findings '+JSON.stringify(views.map(v=>v.findings)))
if(!views.slice(0,2).every(v=>v.goals.every((g:any)=>g.target&&g.compiledOccurrences===1)))throw new Error('Existing LK target scope differs')
if(!views.slice(2).every(v=>v.goals.every((g:any)=>!g.target&&!g.prerequisiteOnly&&g.compiledOccurrences===0)))throw new Error('SourceAtlas scope differs')
writeFileSync(resolve(own,'inputs/actual-existing-LK-and-SourceAtlas-four-target-compiler-scope.neutral.json'),JSON.stringify({role:'Actual unchanged stock compiler outputs and complete view bodies; no new source/course approval',canonical:plan.canonical,views,allFourRemainExistingNationalAndHE_LKTargets:true,allFourAbsentFromExistingBY_HE_LKSourceAtlas:true,unreviewedAuthorDeclarationChangesRuntimeScope:false,sourceOrCourseApproval:false,activeWrites:0},null,2)+'\n')
console.log(JSON.stringify({views:4,compilerFindings:0,nationalAndHE_LKAllFourTarget:true,sourceAtlasBY_HE_LKNoneOfFour:true,writesToActiveFiles:0}))

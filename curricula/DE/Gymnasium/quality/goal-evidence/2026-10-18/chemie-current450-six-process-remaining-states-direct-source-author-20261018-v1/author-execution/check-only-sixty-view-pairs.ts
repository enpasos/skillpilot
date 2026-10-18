import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {createRequire} from 'node:module'
const {collectAuthoritativeTargetAtomicGoalIds}=createRequire(path.resolve('package.json'))('./app/scripts/compositionViewSourceCoverage.ts')
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-six-process-remaining-states-direct-source-author-20261018-v1'
const input=JSON.parse(fs.readFileSync(`${base}/MATRIX.sixty-current-goal-country-direct-source-author.json`,'utf8'))
const landscape=JSON.parse(fs.readFileSync('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','utf8'))
const countries=[...new Set(input.map((x:any)=>x.jurisdiction))] as string[]
const pin=(p:string)=>{const b=fs.readFileSync(p);return {path:p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const rows:any[]=[]
for(const country of countries){
 for(const course of ['gk','lk']){
  const file=`curricula/DE/Gymnasium/composition-views/chemie/${country.toLowerCase()}-${course}.view.json`
  const view=JSON.parse(fs.readFileSync(file,'utf8'))
  const targets=collectAuthoritativeTargetAtomicGoalIds(landscape,view)
  const sixOnly=input.filter((r:any)=>r.jurisdiction===country).map((r:any)=>({goalId:r.goalId,isTarget:targets.has(r.goalId)}))
  rows.push({view:pin(file),viewId:view.viewId,scope:view.scope,selectedGoalTargets:sixOnly})
 }
}
const nonTargetViewPairs=rows.flatMap(r=>r.selectedGoalTargets.filter((x:any)=>!x.isTarget).map((x:any)=>({view:r.view.path,goalId:x.goalId})))
const missing=input.filter((r:any)=>!rows.some(v=>v.scope.jurisdiction===r.jurisdiction&&v.selectedGoalTargets.some((x:any)=>x.goalId===r.goalId&&x.isTarget)))
if(missing.length)throw new Error(JSON.stringify(missing))
for(const r of input){
 r.currentTargetViews=rows.filter(v=>v.scope.jurisdiction===r.jurisdiction&&v.selectedGoalTargets.some((x:any)=>x.goalId===r.goalId&&x.isTarget)).map(v=>({view:v.view,viewId:v.viewId,scope:v.scope,isExistingTarget:true,sourceStageIsNotInferredFromViewOrTags:true}))
 r.currentNonTargetViews=nonTargetViewPairs.filter(v=>v.goalId===r.goalId&&v.view.includes(r.jurisdiction.toLowerCase())).map(v=>({path:v.view,isExistingTarget:false,noMappingScopeExpansion:true}))
}
fs.writeFileSync(`${base}/MATRIX.sixty-current-goal-country-direct-source-author.json`,JSON.stringify(input,null,2)+'\n')
fs.writeFileSync(`${base}/CHECK.sixty-pairs-existing-current-views.json`,JSON.stringify({method:'Pure existing authoritative target traversal for only these60pairs in26views; no composition compiler, full audit, build or normal write.',status:'PASS',pairs:input.length,views:rows,nonTargetViewPairs,missing},null,2)+'\n')
console.log(JSON.stringify({status:'PASS',pairs:input.length,viewFiles:rows.length,missing:missing.length}))

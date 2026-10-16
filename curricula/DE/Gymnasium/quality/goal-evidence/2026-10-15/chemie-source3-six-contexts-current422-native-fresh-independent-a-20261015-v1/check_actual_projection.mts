// SPDX-License-Identifier: Apache-2.0
// Original reviewer A: exact bounded course projections, without mutation.
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const own = dirname(fileURLToPath(import.meta.url))
const repo = resolve(own, '../../../../../../..')
const read = (p: string) => JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const digest = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(repo,p))).digest('hex')
const prep = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-source3-six-contexts-current422-native-preparation-root-20261015-v1'
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-four-source-duties-explicit-compulsory-domain-carriers-author-20261014-v3'
const neutral = read(prep + '/NEUTRAL.native-nine-physical-inputs.json')
const landscape = read(neutral.wholeCanonical.path)
const byId = new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
const {collectAuthoritativeTargetAtomicGoalIds} = await import(pathToFileURL(resolve(repo,'app/scripts/compositionViewSourceCoverage.ts')).href)
const {compileCompositionView, collectCompositionProjectionRoleGoalIds} = await import(pathToFileURL(resolve(repo,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const closure = (id:string, contents:boolean) => {
  const seen = new Set<string>(), stack = [...byId.get(id).requires]
  while(stack.length){const p=stack.pop() as string;if(seen.has(p))continue;seen.add(p);const g=byId.get(p);stack.push(...(g?.requires??[]));if(contents)stack.push(...(g?.contains??[]))}
  return [...seen].sort()
}
const reports=[]
for(const name of ['de-hb-lk','de-hb-gk','de-bw-lk','de-bw-gk']){
  const path=base+(['de-hb-lk','de-bw-lk'].includes(name)?'/candidate/views/'+name+'.view.author.json':'/inputs/views/'+name+'.view.exact.json')
  const view=read(path), compiled=compileCompositionView(view,landscape),targets=collectAuthoritativeTargetAtomicGoalIds(landscape,view)
  const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,byId)
  const goalRows=neutral.newSourceGoalIds.map((id:string)=>({goalId:id,target:targets.has(id),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(id),
    directRequires:byId.get(id).requires,
    missingAtomicPrerequisites:closure(id,true).filter(p=>!(byId.get(p)?.contains?.length)&&!targets.has(p)).map(p=>({goalId:p,title:byId.get(p).title,prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(p)})),
    rawRequiresClosure:closure(id,false),containsExpandedRequiresClosure:closure(id,true)}))
  reports.push({view:name,path,digest:digest(path),scope:view.scope,compileFindings:compiled.findings,targetAtomicCount:targets.size,targetAtomicIds:[...targets].sort(),newGoals:goalRows})
}
const report={schemaVersion:1,runId:read(own.slice(repo.length+1)+'/ORIGINAL-LIVE-RUN.json').run_id,checkedAt:new Date().toISOString(),canonical:neutral.wholeCanonical,
  meaning:'Exact stock compile plus actual learner projection target membership. Missing targets are acquisition-route gaps, not evidence of an executed learner failure or runtime leak. Cluster contents are checked separately and never credited from a cluster label.',
  productionHelpers:['app/scripts/compositionViewSourceCoverage.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/compositionViewRuntime.ts'].map(path=>({path,digest:digest(path)})),reports}
writeFileSync(resolve(own,'CHECK.actual-course-projections.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(reports.map(r=>({view:r.view,targetAtomicCount:r.targetAtomicCount,findings:r.compileFindings,selected:r.newGoals.filter((x:any)=>x.target)})),null,2))

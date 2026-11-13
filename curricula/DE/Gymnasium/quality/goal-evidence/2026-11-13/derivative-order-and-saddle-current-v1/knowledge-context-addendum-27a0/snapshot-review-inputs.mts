// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCanonicalCatalog } from '../../../../../../../../app/scripts/deriveKnowledgeContext.ts'
import { KnowledgeContextIndex } from '../../../../../../../../app/scripts/lib/knowledgeContext.ts'
const directory=dirname(fileURLToPath(import.meta.url)),root=resolve(directory,'../../../../../../../..')
const read=(path:string)=>readFileSync(resolve(root,path)),json=(path:string)=>JSON.parse(read(path).toString()),hash=(bytes:Buffer|string)=>`sha256:${createHash('sha256').update(bytes).digest('hex')}`
// Preserve the actual earlier input snapshot once its source canonical has changed.
const recorded=json(`${directory}/derivation.receipt.json`)
const mathBinding=recorded.inputs.find((item:any)=>item.path==='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
if(hash(read(mathBinding.path))!==mathBinding.sha256)throw new Error('Historical first-stage Math input changed; do not overwrite its content snapshot')
const delta=json(`${directory}/secured-scope-delta.json`),ids=new Set(delta.differences.map((entry:any)=>entry.goal.id))
const registryPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const subject=json(registryPath).subjects.find((entry:any)=>entry.subject==='mathematik')
const landscape=json(subject.landscapePath),memory=read('curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl').toString().trim().split('\n').map(line=>JSON.parse(line))
const inputs=landscape.goals.filter((goal:any)=>ids.has(goal.id)).map((goal:any)=>{
 const positive=[]
 for(const configPath of subject.positiveEvidenceConfigPaths){const config=json(configPath);if(!config.scope.goalIds.includes(goal.id))continue;const lines=read(config.reviewPath).toString().match(/[^\n]*\n|[^\n]+$/gu)??[];const line=lines.find(line=>line.trim()&&JSON.parse(line).goalId===goal.id);positive.push({configPath,reviewPath:config.reviewPath,recordLineSha256:hash(line!),record:JSON.parse(line!)})}
 const images=(goal.resourceLinks??[]).filter((link:any)=>link.type==='goal-visualization').map((link:any)=>{const canonicalPath=`curricula/DE/Gymnasium/visualizations/mathematik/${goal.id}/${link.url.split('/').at(-1)}`;const publicPath=`app/public${link.url}`;return {link,canonicalPath,canonicalSha256:hash(read(canonicalPath)),publicPath,publicSha256:hash(read(publicPath))}})
 return {goal,positive,images,memoryDecision:memory.find((entry:any)=>entry.goalId===goal.id),embeddedAssessment:goal.examData??null}
})
const catalog=loadCanonicalCatalog(),current=new KnowledgeContextIndex(catalog),oldMath=JSON.parse(execFileSync('git',['show',`64124c1ec4:${subject.landscapePath}`],{cwd:root,maxBuffer:15000000}).toString()),before=new KnowledgeContextIndex(catalog.map(landscape=>landscape.landscapeId===oldMath.landscapeId?oldMath:landscape))
const otherLosses=[]
for(const key of current.graph.atomicKeys(landscape.landscapeId)){if(current.graph.kind(key)==='ordinary')continue;const after=new Set(current.securedKeys(key));const lost=before.securedKeys(key).filter(value=>!after.has(value));if(lost.length)otherLosses.push({goalId:current.graph.goal(key).id,title:current.graph.goal(key).title,kind:current.graph.kind(key),lost})}
writeFileSync(resolve(directory,'current-review-inputs.json'),`${JSON.stringify({schemaVersion:1,registryPath,registrySha256:hash(read(registryPath)),inputs,otherAtomicGoalsLosingSecuredScope:otherLosses,note:'Exact extracted current content, not new native review judgments or sufficiency acceptance.'},null,2)}\n`)
console.log(JSON.stringify({ordinaryInputs:inputs.length,positiveRecords:inputs.reduce((n:any,g:any)=>n+g.positive.length,0),embeddedAssessments:inputs.filter((g:any)=>g.embeddedAssessment).length,memoryRequired:inputs.filter((g:any)=>g.memoryDecision?.status==='memory_required').map((g:any)=>g.goal.id),otherAtomicScopeLosses:otherLosses},null,2))

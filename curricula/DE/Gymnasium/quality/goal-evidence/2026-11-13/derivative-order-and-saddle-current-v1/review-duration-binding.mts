// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { projectOutLearningUnits, sha256WithoutLearningUnitLayer } from '../../../../../../../app/scripts/learningUnitLayerProjection.ts'
const directory = dirname(fileURLToPath(import.meta.url)), root = resolve(directory, '../../../../../../..')
const write = process.argv.includes('--write')
assert.ok(process.argv.slice(2).every(arg => arg === '--write'))
const canonicalPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const planPath='app/scripts/config/math-duration-split-spanning-tree-policy.json'
const baseRef='64124c1ec4^'
const git=(path:string)=>execFileSync('git',['show',`${baseRef}:${path}`],{cwd:root,maxBuffer:15000000})
const hash=(bytes:Buffer|string)=>createHash('sha256').update(bytes).digest('hex')
const stable=(value:any):string=>Array.isArray(value)?`[${value.map(stable).join(',')}]`:value&&typeof value==='object'?`{${Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${JSON.stringify(k)}:${stable(v)}`).join(',')}}`:JSON.stringify(value)
const currentBytes=readFileSync(resolve(root,canonicalPath)), baselineBytes=git(canonicalPath)
const baseline:any=projectOutLearningUnits(JSON.parse(baselineBytes.toString())), current:any=projectOutLearningUnits(JSON.parse(currentBytes.toString()))
const plan=JSON.parse(readFileSync(resolve(root,planPath),'utf8')), historicalPlan=JSON.parse(git(planPath).toString())
assert.equal(sha256WithoutLearningUnitLayer(baselineBytes),historicalPlan.inputs.canonical.sha256,'historical canonical is not the actual pinned input')
const goals=new Map(baseline.goals.map((goal:any)=>[goal.id,goal])), currentGoals=new Map(current.goals.map((goal:any)=>[goal.id,goal]))
assert.equal(goals.size,currentGoals.size)
assert.equal(stable({...baseline,goals:[]}),stable({...current,goals:[]}),'program units, placements, filters or other document fields changed')
const reviewedIds=['350fc8b1-ead0-4239-b28a-217cbd3bd1c3','b3604df4-15a8-41c8-a8b0-50dadd698bd3','d5feba00-4336-4f26-8dba-0537a797eddb']
const priorImageIds=['858113c5-e53b-57bb-b01f-ba95c3ddcb6f','dde9ae98-d97d-598b-92f4-f1616f4d75c8']
const changes:any[]=[]
for(const [goalId,before] of goals){
 const after:any=currentGoals.get(goalId);assert.ok(after,`${goalId}: removed goal`)
 const keys=new Set([...Object.keys(before as any),...Object.keys(after)])
 const changed=[...keys].filter(key=>stable((before as any)[key])!==stable(after[key]))
 if(!changed.length)continue
 const allowed=priorImageIds.includes(goalId as string)?['resourceLinks']:reviewedIds.includes(goalId as string)?['description','descriptionEn','resourceLinks',...(goalId===reviewedIds[0]?['requires']:[])]:[]
 assert.ok(changed.every(key=>allowed.includes(key)),`${goalId}: unaudited structural delta ${changed}`)
 if(priorImageIds.includes(goalId as string)) {
  // This predecessor delta is strictly image metadata, already reviewed in64124c1ec4.
  const headGoal=JSON.parse(execFileSync('git',['show',`64124c1ec4:${canonicalPath}`],{cwd:root,maxBuffer:15000000}).toString()).goals.find((goal:any)=>goal.id===goalId)
  assert.equal(stable(after),stable(headGoal))
 }
 if(reviewedIds.includes(goalId as string)&&changed.includes('resourceLinks')){
  const strip=(links:any[])=>links.map(link=>{const {altText,...rest}=link;return rest})
  assert.equal(stable(strip((before as any).resourceLinks)),stable(strip(after.resourceLinks)),`${goalId}: current resource changed beyond accessible alt text`)
 }
 changes.push({goalId,fields:changed.map(field=>({field,before:(before as any)[field],after:after[field]}))})
}
assert.equal(changes.length,5,'expected two inherited image-metadata corrections and three current goal clarifications')
assert.equal(stable((currentGoals.get(reviewedIds[0]) as any).requires),stable(['845440ce-f63f-5835-903f-739145ca27bd','623cd47f-6f9e-58a7-911c-69e4a8609a27']))
const withoutPin=(value:any)=>({...value,inputs:{...value.inputs,canonical:{...value.inputs.canonical,sha256:null}}})
assert.equal(stable(withoutPin(plan)),stable(withoutPin(historicalPlan)),'layout judgments or independent bindings changed')
const expected=sha256WithoutLearningUnitLayer(currentBytes)
if(write){plan.inputs.canonical.sha256=expected;writeFileSync(resolve(root,planPath),`${JSON.stringify(plan,null,2)}\n`)}
else assert.equal(plan.inputs.canonical.sha256,expected,'current binding not materialized')
const generator=readFileSync(resolve(root,'app/scripts/generateMathDurationCompositionViews.ts'),'utf8')
const block=generator.match(/const GENERATED_VIEW_PATHS = \[([\s\S]*?)\]/u)![1]
const paths=[...block.matchAll(/'([^']+)'/gu)].map(match=>`curricula/DE/Gymnasium/composition-views/mathematik/${match[1]}`)
const beforeOutputs=paths.map(path=>({path,sha256:hash(readFileSync(resolve(root,path)))}))
const check=spawnSync('npm',['--prefix','app','run','-s','check:math-duration-composition-views'],{cwd:root,encoding:'utf8',maxBuffer:3000000})
assert.equal(check.status,0,`regular generator failed: ${check.stdout}\n${check.stderr}`)
const afterOutputs=paths.map(path=>({path,sha256:hash(readFileSync(resolve(root,path)))}))
assert.equal(stable(beforeOutputs),stable(afterOutputs),'generator changed outputs')
const receipt={schemaVersion:1,kind:'technical-reviewed-duration-input-maintenance',baselineRef:execFileSync('git',['rev-parse',baseRef],{cwd:root,encoding:'utf8'}).trim(),canonicalPath,baselineRawSha256:hash(baselineBytes),baselineProjectedSha256:sha256WithoutLearningUnitLayer(baselineBytes),currentRawSha256:hash(currentBytes),currentProjectedSha256:expected,changes,structuralComparison:'Complete projected documents compared; every goal identity, title, contains, type, applicability, taxonomy, placement and document field is identical except the explicitly recorded three descriptions, one prerequisite replacement and resource metadata. Unchanged generated view bytes checked by the unmodified regular generator.',generator:{command:'npm --prefix app run -s check:math-duration-composition-views',exitCode:check.status,stdout:check.stdout,stderr:check.stderr},unchangedOutputs:afterOutputs,note:'No layout/source approval, historical proof rebind, human acceptance or learner-result claim.'}
if(write)writeFileSync(resolve(directory,'duration-binding.receipt.json'),`${JSON.stringify(receipt,null,2)}\n`)
else assert.equal(readFileSync(resolve(directory,'duration-binding.receipt.json'),'utf8'),`${JSON.stringify(receipt,null,2)}\n`)
console.log(`Duration binding ${write?'materialized':'verified'} after complete structural comparison; ${paths.length} unchanged regular-generator outputs.`)

// SPDX-License-Identifier: Apache-2.0
// Independent native enrolment/map-side comparison; not an observed Java learner session.
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
import {execFileSync} from 'node:child_process'
async function main(){
const [root,output]=process.argv.slice(2);assert(root&&output);assert(!fs.existsSync(output));
const load=(p:string)=>import(pathToFileURL(path.join(root,p)).href)
const {prepareLandscapeEntries}=await load("app/src/hooks/useLandscapes.ts")
const {collectCompositionProjectionRoleGoalIds}=await load("app/src/utils/authoring/compositionViewAuthoring.ts")
const {goalMatchesFilters}=await load("app/src/utils/goalFilters.ts")
const base='a4923a80928e4211c02fb53feaadad2054a3fb94'
const canonical='curricula/DE/Gymnasium/canonical',names=fs.readdirSync(path.join(root,canonical)).filter(n=>n.endsWith('.json')).sort()
const beforeRead=(p:string)=>JSON.parse(execFileSync('git',['show',base+':'+p],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024}))
const captures=new Map<string,Buffer>();const afterRead=(p:string)=>{if(!captures.has(p))captures.set(p,fs.readFileSync(path.join(root,p)));return JSON.parse(captures.get(p)!.toString('utf8'))}
const tasks=['d8fc6295-d0db-59e5-bd90-080bbc508c3a','b50e9903-58b3-520d-96bf-d5bc1fe51ebf']
function universe(read:(p:string)=>any){const docs=names.map(n=>read(canonical+'/'+n)),entries=prepareLandscapeEntries(docs),goals=new Map<string,any>(entries.flatMap(e=>e.goals.map(g=>[g.id,g]))),roots=new Map(docs.map(d=>[d.landscapeId,d.goals.find(g=>(g.tags??[]).includes('root'))?.id]));return{goals,roots}}
const old=universe(beforeRead),now=universe(afterRead)
function project(view:any,u:any,filters:string[]){
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,u.goals,u.roots)
 const seeds=new Set<string>([...roles.targetGoalIds].filter(id=>{const g=u.goals.get(id);return g&&g.type!=='cluster'&&!g.contains.length&&goalMatchesFilters(g,filters)})),learning=new Set(seeds),pending=[...seeds]
 while(pending.length){const id=pending.pop()!;for(const raw of u.goals.get(id)?.requires??[]){const req=raw.split(':').at(-1)!;if(!u.goals.has(req))throw Error(req);if(!learning.has(req)){learning.add(req);pending.push(req)}}}
 return{seeds,learning,roles}
}
const rows=[]
for(const state of ['BW','BY','HH','TH'])for(const stage of ['SekI','CrossStage'])for(const course of ['GK','LK'])for(const duration of ['G8','G9']){
 const file='curricula/DE/Gymnasium/composition-views/physik/de-'+state.toLowerCase()+'-'+(stage==='SekI'?'seki':course.toLowerCase())+'.view.json',bv=beforeRead(file),av=afterRead(file),filters=['DE-'+state,course,duration],b=project(bv,old,filters),a=project(av,now,filters)
 const addedSeeds=[...a.seeds].filter(id=>!b.seeds.has(id)).sort(),removedSeeds=[...b.seeds].filter(id=>!a.seeds.has(id)).sort(),addedLearning=[...a.learning].filter(id=>!b.learning.has(id)).sort(),removedLearning=[...b.learning].filter(id=>!a.learning.has(id)).sort()
 if(removedSeeds.length||removedLearning.length||addedSeeds.some(id=>!tasks.includes(id))||JSON.stringify(addedSeeds)!==JSON.stringify(addedLearning))throw Error('unexpected delta '+file)
 rows.push({state:'DE-'+state,stage,course,duration,sourceViewPath:file,sourceViewId:av.viewId,beforeSeedAtomicGoalIds:[...b.seeds].sort(),currentSeedAtomicGoalIds:[...a.seeds].sort(),beforeLearningAtomicGoalIds:[...b.learning].sort(),currentLearningAtomicGoalIds:[...a.learning].sort(),addedSeedAtomicGoalIds:addedSeeds,removedSeedAtomicGoalIds:removedSeeds,addedLearningAtomicGoalIds:addedLearning,removedLearningAtomicGoalIds:removedLearning,
  assessmentAdmission:tasks.map(id=>({goalId:id,authoredTarget:a.roles.targetGoalIds.has(id),authoredSupport:a.roles.prerequisiteOnlyGoalIds.has(id),matchesAllEnrolmentFilters:now.goals.has(id)&&goalMatchesFilters(now.goals.get(id),filters),isSeed:a.seeds.has(id),inLearning:a.learning.has(id)}))})
}
const report={schemaVersion:1,status:'PASS',acceptedAssessmentGoalIds:['d8fc6295-d0db-59e5-bd90-080bbc508c3a','b50e9903-58b3-520d-96bf-d5bc1fe51ebf'],baselineActiveAssessmentGoalIds:['b50e9903-58b3-520d-96bf-d5bc1fe51ebf'],newlyActiveAssessmentGoalIds:['d8fc6295-d0db-59e5-bd90-080bbc508c3a'],baselineCommit:base,method:'Actual app prepareLandscapeEntries, authored role resolution and goalMatchesFilters for explicit state/course/duration, then exact full canonical atomic requires closure. This is a native TypeScript seed/map-side comparison, not a Java learner API observation.',rows}
assert(now.goals.has(tasks[0])&&now.goals.has(tasks[1]));for(const row of rows){const expected=['DE-HH','DE-TH'].includes(row.state)?[tasks[0]]:[];assert.deepEqual(row.addedSeedAtomicGoalIds,expected);assert.deepEqual(row.addedLearningAtomicGoalIds,expected);for(const a of row.assessmentAdmission){assert.equal(a.isSeed,(a.goalId===tasks[1]&&row.state==='DE-BW')||(a.goalId===tasks[0]&&['DE-HH','DE-TH'].includes(row.state)));assert.equal(a.inLearning,a.isSeed)}}
const inputPins=[...captures].map(([p,b])=>({path:p,sha256:createHash('sha256').update(b).digest('hex')}));for(const pin of inputPins)assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,pin.path))).digest('hex'),pin.sha256);
const exactGoalSetsBySha256:Record<string,any>={};const compactRows=rows.map(row=>{const compact:any={...row};for(const key of ['beforeSeedAtomicGoalIds','currentSeedAtomicGoalIds','beforeLearningAtomicGoalIds','currentLearningAtomicGoalIds']){const ids=(row as any)[key],digest=createHash('sha256').update(ids.join('\n')+'\n').digest('hex');exactGoalSetsBySha256[digest]={count:ids.length,goalIds:ids};compact[key]={setSha256:digest,count:ids.length}}return compact})
fs.writeFileSync(output,JSON.stringify({...report,rows:compactRows,exactGoalSetsBySha256,exactSetResolution:'Each row field resolves to exactGoalSetsBySha256[setSha256].goalIds. Digests use UTF8 sorted UUIDs separated by LF with terminal LF.',inputPins},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify(rows.map(r=>({state:r.state,stage:r.stage,course:r.course,duration:r.duration,beforeS:r.beforeSeedAtomicGoalIds.length,afterS:r.currentSeedAtomicGoalIds.length,beforeL:r.beforeLearningAtomicGoalIds.length,afterL:r.currentLearningAtomicGoalIds.length,added:r.addedSeedAtomicGoalIds}))))

}
main().catch(e=>{console.error(e);process.exit(1)})

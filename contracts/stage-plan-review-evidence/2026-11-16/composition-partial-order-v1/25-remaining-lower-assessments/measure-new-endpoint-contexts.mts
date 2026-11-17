import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {createRouteProfiles,evaluateRouteProfile} from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts'
import {buildApplicabilityCompilation} from '/home/enpasos/projects/skillpilot/app/scripts/applicabilityCompiler.ts'
const root='/home/enpasos/projects/skillpilot',base=resolve(root,'tmp/pipeline/laender-stufen/gesamt/physics/remaining-lower-assessments/author-validation')
const candidateNames=['decay-chains-two-consistency-audits','rest-energy-two-system-comparisons','ideal-transformer-two-load-cases','em-spectrum-two-application-maps']
const candidates=candidateNames.map(n=>resolve(base,n+'.goal.json'))
const canonicalDir=resolve(root,'curricula/DE/Gymnasium/canonical')
const files=readdirSync(canonicalDir).filter(n=>n.endsWith('.json')).map(n=>resolve(canonicalDir,n))
const actual=files.map(p=>JSON.parse(readFileSync(p,'utf8')))
// Pure in-memory scenario. No release status, goal or view is written.
const catalog=structuredClone(actual),physics=catalog.find(l=>l.landscapeId==='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a')
const tasks=candidates.map(p=>JSON.parse(readFileSync(p,'utf8')))
for(const task of tasks){task.examData.reviewStatus='released';physics.goals=physics.goals.filter((g:any)=>g.id!==task.id);physics.goals.push(task)}
const profile={...createRouteProfiles().find(p=>p.profileId==='canonical-physics-sek1')!}
profile.terminalAutonomyGoalIds=[...profile.terminalAutonomyGoalIds!,...tasks.map(t=>t.id)]
const dir=resolve(root,'tmp/pipeline/laender-stufen/gesamt/physics/candidate-v34/views')
const views=readdirSync(dir).filter(n=>n.endsWith('.view.json')).map(n=>resolve(dir,n))
const paths=[...files,...views,...candidates,...['app/scripts/generateCurriculumQualityStatus.ts','app/scripts/lib/explicitAtomicRouteEndpoints.ts'].map(p=>resolve(root,p))]
const pin=()=>Object.fromEntries(paths.map(p=>[p.slice(root.length+1),createHash('sha256').update(readFileSync(p)).digest('hex')]))
const before=pin(),applicability=buildApplicabilityCompilation(catalog.map((landscape,i)=>({landscape,file:files[i]}))),rows=[]
for(const state of ['by','hh','mv','sl','sn']){
 const selected=views.filter(p=>p.split('/').at(-1)!.startsWith('de-'+state+'-'))
 const rule=evaluateRouteProfile(physics,profile,applicability,catalog,selected).rules.find(r=>r.id==='CQR-104')!
 rows.push({state,status:rule.status,newEndpointMissingDetails:rule.details?.filter(d=>d.startsWith('Missing terminal autonomy goal(s):')&&tasks.some(t=>d.includes(t.id))),metrics:rule.metrics})
}
const after=pin(),drift=Object.keys(before).filter(p=>before[p]!==after[p])
const result={status:'SIMULATED_RELEASE_FOR_SCOPE_PLANNING_ONLY',actualGoalsOrViewsMutated:false,inputPins:before,inputDrift:drift,extraEligibilityGoalIds:tasks.map(t=>t.id),rows}
writeFileSync(new URL('./new-endpoint-contexts.simulated.actual.json',import.meta.url),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({inputDrift:drift,rows:rows.map(r=>({state:r.state,details:r.newEndpointMissingDetails}))},null,2))

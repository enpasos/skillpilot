import { readFileSync, writeFileSync } from 'node:fs'
import { GYMNASIUM_DURATION_OFFERINGS, GYMNASIUM_CONTENT_OFFERINGS } from '../../app/src/generated/gymnasiumDurationOfferings.ts'
const [output, stagesArgument = 'CrossStage'] = process.argv.slice(2)
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const math = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced', physics = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const general = read('curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json')
const physical = read('curricula/DE/Gymnasium/provenance/gymnasium-physics-duration-model-policy.json')
const overview = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json')
const lands = overview.filters.map((f:any) => f.id).filter((id:string) => /^DE-[A-Z]{2}$/u.test(id)).sort()
const contexts:any[] = [], durations:any[] = [], stages = stagesArgument.split(',')
const add = (land:string|undefined, duration:string|undefined, authorization:string) => {
  for (const stage of stages) for (const profile of ['GK','LK','GK+LK']) contexts.push({ id: `${land ?? 'canonical'}:${duration ?? 'unspecified'}:${stage}:${profile}`, authorization,
    scope: { schoolForm:'Gymnasium', ...(land ? {jurisdiction:land}:{}), ...(duration ? {durationModel:duration}:{}), stage, courseProfile:profile } })
}
add(undefined,undefined,'national-canonical-no-Land-plan-or-duration-claim')
for (const land of lands) {
  const models = (policy:any, subject:string) => [...new Set(policy.decisions.filter((d:any) => d.status==='reviewed' && d.subject===subject && d.jurisdiction===land).flatMap((d:any)=>d.durationModels ?? []))] as string[]
  const m = models(general,'Mathematik'), p = models(physical,'Physik'), union = [...new Set([...m,...p])].sort()
  for (const duration of union) {
    const shared = m.includes(duration) && p.includes(duration)
    const ui:any = GYMNASIUM_DURATION_OFFERINGS, content:any = GYMNASIUM_CONTENT_OFFERINGS
    durations.push({jurisdiction:land,durationModel:duration,mathPolicy:m,physicsPolicy:p,bothReviewedPolicies:shared,
      generatedUiMath:ui[math]?.[land] ?? [],generatedUiPhysics:ui[physics]?.[land] ?? [],
      generatedStagesMath:content[math]?.[land]?.stages ?? [],generatedStagesPhysics:content[physics]?.[land]?.stages ?? [],
      limitation:'A compatible backend view or generated offering is no official full source/stage/duration acceptance.'})
    add(land,duration,shared?'both-subject-reviewed-duration-policies':'unsupported-subject-duration-policy-disagreement')
  }
}
writeFileSync(output,JSON.stringify({landCount:lands.length,stages,durationInventory:durations,contexts},null,2)+'\n')
console.log(`Contexts: ${contexts.length}; ${lands.length} Länder; ${durations.filter(d=>d.bothReviewedPolicies).length} common duration combinations; ${durations.filter(d=>!d.bothReviewedPolicies).length} policy disagreements.`)

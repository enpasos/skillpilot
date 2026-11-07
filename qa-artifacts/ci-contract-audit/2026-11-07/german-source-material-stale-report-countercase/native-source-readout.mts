import fs from 'node:fs'
import path from 'node:path'
import { captureCurriculumSource } from '/home/enpasos/projects/skillpilot/app/scripts/lib/retainedAssessmentCoverage.ts'
import { discoverCurriculumAssessmentScope, evaluateCurriculumExamReadiness } from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts'
const root='/home/enpasos/projects/skillpilot'
const dir=path.join(root,'curricula/DE/Gymnasium/canonical')
const catalog=fs.readdirSync(dir).filter(n=>n.endsWith('.json')).map(n=>{
 const rel='curricula/DE/Gymnasium/canonical/'+n
 return captureCurriculumSource<any>(rel,fs.readFileSync(path.join(root,rel)))
})
const source=catalog.find(s=>s.title?.includes('Deutsch') || s.subject==='Deutsch')
if(!source)throw Error('Missing actual German source')
const scope=discoverCurriculumAssessmentScope(source,undefined,catalog)
const rules=evaluateCurriculumExamReadiness(source,undefined,catalog,scope)
console.log(JSON.stringify({owner:source.landscapeId,definitions:scope.definitionGoalIds.length,required:scope.requiredGoalIds.length,discoveryIssues:scope.discoveryIssues,authenticRetainedContext:!!scope.retainedCoverage,rules:rules.map(r=>({id:r.id,status:r.status,metrics:r.metrics,failingGoalIds:r.assessmentValidation?.failingGoalIds,details:r.details}))}))

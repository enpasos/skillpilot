import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildApplicabilityCompilation as activeBuild} from '../../../../../../../app/scripts/applicabilityCompiler'
import {buildApplicabilityCompilation as inertBuild} from './native-capsule/app/scripts/applicabilityCompiler'
import {normalizeCanonicalLandscape,buildCanonicalGraphIndex} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const out=dirname(fileURLToPath(import.meta.url))
const root=resolve(out,'../../../../../../..')
const land='605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const ids=['1826fe19-4d06-5183-9b41-9121ae1cc219','a2fa1186-df35-5954-a9a9-e311a55e218f','df17fd21-e9b7-598f-970e-8f541d059694','bad728f2-e375-5f98-8f65-511a9e2e6751']
const can='canonical-candidate/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const read=(p:string)=>JSON.parse(readFileSync(resolve(out,p),'utf8'))
const write=(p:string,obj:unknown)=>writeFileSync(resolve(out,p),JSON.stringify(obj,null,2)+'\n')

// Native machine dependencies inspect the current other landscapes only for
// cross-landscape references and memory origins; no other subject review is
// consumed, renewed or scientifically assessed here.
const baseline=activeBuild().reports.find(x=>x.landscapeId===land)!
const candidate=inertBuild().reports.find(x=>x.landscapeId===land)!
write('actual-native-economics-applicability-baseline.READONLY.json',baseline)
write('actual-native-economics-applicability-INERT-candidate.READONLY.json',candidate)
const c=read(can)
const originalApp=new Map(c.goals.map((g:any)=>[g.id,g.applicability]))
for(const g of c.goals) {
  if(!ids.includes(g.id)) continue
  g.applicability=candidate.goals.find(x=>x.goalId===g.id)!.compiledApplicability
}
write(can,c)
write('native-capsule/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json',c)
const canonical=normalizeCanonicalLandscape(c)
const index=buildCanonicalGraphIndex(canonical)
const rawById=new Map(c.goals.map((g:any)=>[g.id,g]))
function closure(targets:Set<string>) {
  const found=new Set<string>(); const unknown=new Set<string>(); const queue=[...targets]
  while(queue.length) {
    const id=queue.shift()!; if(found.has(id))continue; found.add(id)
    const g=rawById.get(id) as any
    if(!g){unknown.add(id);continue}
    for(const req of (g.requires??[])){if(!req.includes(':'))queue.push(req)}
  }
  return {found,unknown}
}
function flatten(nodes:any[]) {return nodes.flatMap(n=>[...(n.sourceGoalId?[n.sourceGoalId]:[]),...flatten(n.children??[])])}
const reports=[]
for(const name of readdirSync(resolve(out,'view-candidates')).filter(x=>x.endsWith('.view.json')).sort()) {
  const v=normalizeCompositionView(read('view-candidates/'+name))
  const compiled=compileCompositionView(v,canonical)
  const role=collectCompositionProjectionRoleGoalIds(v.rootNodes,index.goalById)
  const needed=closure(role.targetGoalIds)
  const visible=flatten(compiled.compiledRootNodes)
  const country=v.scope.jurisdiction
  reports.push({name,scope:v.scope,targetCount:role.targetGoalIds.size,visibleCount:visible.length,
    duplicateVisibleIds:visible.filter((x,i)=>visible.indexOf(x)!==i),findings:compiled.findings,
    fourFacetRoles:ids.map(id=>({id,role:role.targetGoalIds.has(id)?'target':role.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent',
      actuallyRequiredByCurrentTargetClosure:needed.found.has(id),
      nativeCountryApplicability:(rawById.get(id) as any)?.applicability?.jurisdiction??[],
      targetApplicabilitySatisfied:!country||!role.targetGoalIds.has(id)||((rawById.get(id) as any)?.applicability?.jurisdiction??[]).includes(country)})),
    currentTargetPrerequisiteIdsMissingExplicitRole:ids.filter(id=>needed.found.has(id)&&!role.targetGoalIds.has(id)&&!role.prerequisiteOnlyGoalIds.has(id)),
    missingLocalPrerequisiteIds:[...needed.unknown],
    normativeSourceObligationProvenByCompilation:false})
}
write('actual-native-35views-first-pass-and-real-prerequisite-role-needs.READONLY.json',reports)
write('actual-native-four-goal-app-values-and-evidence.READONLY.json',ids.map(id=>({id,
  authorInputApplicability:originalApp.get(id),nativeCompiled:candidate.goals.find(x=>x.goalId===id),
  baseline:baseline.goals.find(x=>x.goalId===id)??null})))
console.log(JSON.stringify({nativeEconomicsBaselineSummary:baseline.summary,nativeEconomicsCandidateSummary:candidate.summary,
  views:reports.length,viewsWithCompileErrors:reports.filter(x=>x.findings.some(f=>f.severity==='error')).length,
  viewsWithFacetRoleNeeds:reports.filter(x=>x.currentTargetPrerequisiteIdsMissingExplicitRole.length).map(x=>({name:x.name,ids:x.currentTargetPrerequisiteIdsMissingExplicitRole})),
  facets:ids.map(id=>({id,compiled:candidate.goals.find(x=>x.goalId===id)?.compiledApplicability}))}))

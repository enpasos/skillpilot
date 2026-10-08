// Apache-2.0. Technical native candidate checks; no live changes or independent review.
import { readFile, writeFile } from 'node:fs/promises'
import { buildCanonicalGraphIndex, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import { evaluateCourseLevelMappingConsistency } from '../../../../../../../app/scripts/generateCurriculumQualityStatus.ts'
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-three-twelve-source-atomicity-author-v2'
const candidate = JSON.parse(await readFile(own + '/canonical-three-clusters-twelve-atoms.inert.json', 'utf8'))
const originals = JSON.parse(await readFile('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json', 'utf8'))
const newIds = JSON.parse(await readFile(own + '/atomic-goal-ids.candidate.json', 'utf8'))
const parentIds = JSON.parse(await readFile(own + '/stable-parent-goal-ids.json', 'utf8'))
const index = buildCanonicalGraphIndex(candidate)
const diagnostics = validateCanonicalLandscape(candidate, index)
if (diagnostics.some((d:any) => d.severity === 'error')) throw new Error(JSON.stringify(diagnostics))
const by = new Map(candidate.goals.map((g:any) => [g.id,g])) as Map<string,any>
if (by.size !== candidate.goals.length) throw new Error('duplicate ID')
for (const edgeType of ['requires','contains']) {
 const visiting=new Set<string>(), done=new Set<string>()
 const visit=(id:string) => { if(visiting.has(id))throw new Error('cycle '+edgeType+' '+id);if(done.has(id))return;visiting.add(id);for(const ref of by.get(id)[edgeType] ?? []) {const next=ref.replace(candidate.landscapeId+':','');if(!by.has(next))throw new Error('missing '+next);visit(next)};visiting.delete(id);done.add(id) }
 for(const id of by.keys()) visit(id)
}
const unchanged = originals.goals.filter((g:any) => !parentIds.includes(g.id))
if(!unchanged.every((g:any) => JSON.stringify(g)===JSON.stringify(by.get(g.id))))throw new Error('unrelated goal delta')
const mappingPath = own + '/mapping/twelve-components-to-canonical-economics.review.candidate.json'
const mapping = {...JSON.parse(await readFile(mappingPath, 'utf8')),file:mappingPath}
const cqr004 = evaluateCourseLevelMappingConsistency(candidate, [mapping])
if(cqr004.status !== 'pass')throw new Error(JSON.stringify(cqr004))
const delta = parentIds.map((id:string) => {const b=originals.goals.find((g:any)=>g.id===id),a=by.get(id);return {goalId:id,fieldDeltas:[...new Set([...Object.keys(b),...Object.keys(a)])].filter(k=>JSON.stringify(b[k])!==JSON.stringify(a[k])),children:a.contains.length,oldRequires:b.requires,newRequires:a.requires}})
await writeFile(own+'/native-targeted-candidate-check.actual.json',JSON.stringify({role:'technical_author_check',actualCheckedAt:new Date().toISOString(),nativeCanonicalAuthoringDiagnostics:diagnostics,containsAndRequiresDagsPass:true,allLocalReferencesExist:true,candidateGoalCount:candidate.goals.length,newAtomicGoalCount:newIds.length,oldWholeGoalsUnchangedExceptThreeStableParents:unchanged.length,stableParentChanges:delta,nativeExplicitComponentMappingCqr004:cqr004,pendingMandatoryChecks:['Independent all15 source/atomicity/memory review','Actual current foreign mapping and jurisdiction coverage/applicability','Two reverseRequires goals and one transitive HE-assessment readiness path','Current full native LayerA on an approved physically isolated integration','New positivev2/images/two D reviews'],limits:['Native authoring checks prove graph structure and target/source pointer consistency; they do not prove source-semantic completeness or independent approval.','SekI component mapping is explicit; CQR004 upper-secondary edge count is0, so no GK/LK subject-matter proof is inferred.'],activeWrites:0,newStrictClosures:0},null,2)+'\n')
console.log(JSON.stringify({nativeGraphDiagnostics:diagnostics.length,allGraphReferencesAndDags:'pass',originalGoalsUnchanged:unchanged.length,newAtomicCandidates:12,nativeCqr004:cqr004.status,activeWrites:0}))

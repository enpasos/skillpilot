// Apache-2.0. Actual native output target-union proof, not a backend reimplementation.
import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {collectAuthoritativeTargetAtomicGoalIds} from '../../../../../../../app/scripts/compositionViewSourceCoverage.ts'
const directory=dirname(fileURLToPath(import.meta.url)),root=resolve(directory,'../../../../../../..')
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'))
const hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const canBytes=await readFile(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))
const landscape=JSON.parse(canBytes.toString()),canonical=normalizeCanonicalLandscape(landscape)
const gk=await read(resolve(directory,'bounded-BY-pair-scope-author-candidate-v3/de-by-gym-economics-gk-macro-bounded.inert.view.json'))
const lk=await read(resolve(directory,'bounded-BY-pair-scope-author-candidate-v3/de-by-gym-economics-lk-macro-bounded.inert.view.json'))
const mergedBytes=await readFile(resolve(directory,'actual-backend-v3-combined-merged-root-nodes.json'))
const merged={...lk,viewId:'de-by-gym-economics-combined-479-native-probe',scope:{...lk.scope,courseProfile:'GK+LK'},rootNodes:JSON.parse(mergedBytes.toString())}
const compiled=compileCompositionView(normalizeCompositionView(merged),canonical)
if(compiled.findings.length)throw new Error(JSON.stringify(compiled.findings))
const expected=new Set([...collectAuthoritativeTargetAtomicGoalIds(landscape,gk),...collectAuthoritativeTargetAtomicGoalIds(landscape,lk)])
const actual=collectAuthoritativeTargetAtomicGoalIds(landscape,merged)
const missing=[...expected].filter(x=>!actual.has(x)),added=[...actual].filter(x=>!expected.has(x))
if(missing.length||added.length||!actual.has('479fb87a-3a5a-5892-8b3e-dfb1d07e9612'))throw new Error('Combined target union mismatch')
const roles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(merged).rootNodes,new Map(landscape.goals.map((g:any)=>[g.id,g])))
const receipt={role:'actual_native_target_union_check_on_actual_backend_merged_output',createdAt:new Date().toISOString(),
 canonicalSha256:hash(canBytes),actualBackendMergedOutputSha256:hash(mergedBytes),nativeCompileFindings:compiled.findings,
 expectedWholeAtomicTargetUnionCount:expected.size,actualWholeAtomicTargets:actual.size,missing,added,
 actual479Target:true,wholeTwentyTargetsVerified:JSON.parse(await readFile(resolve(directory,'twenty-individual-regional-basic-source-dispositions.actual.json'),'utf8')).every((r:any)=>actual.has(r.goalId)),actual479PrerequisiteOnly:roles.prerequisiteOnlyGoalIds.has('479fb87a-3a5a-5892-8b3e-dfb1d07e9612'),
 completeRegionalCurriculumApprovalClaim:false,actualPrivateLearnerOrHostAcceptanceClaim:false,activeWrites:0,humanApprovalClaim:false}
await writeFile(resolve(directory,'actual-native-backend-v3-combined-target-union.receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(`PASS actual backend merged output: ${actual.size} exact native atomic targets, 479 target, no missing/added goals.`)

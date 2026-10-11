import fs from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { compileGoalBookChapterProjection } from '../../../../../../../app/src/utils/goalBookChapterProjection'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-booknav38b-membership-technical-independent-a-READONLY-v1'
const currentNavPath = 'app/scripts/config/goal-books/navigation/de-gym-economics-current-canonical.view.json'
const corePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const priorPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-common346-native-P45-Book346-binding-technical-a-INERT-v1/whole346.review-only-native-book-model.INERT.json'
const candidatePath = process.argv[2]
if (!candidatePath) throw new Error('Expected actual independently authored whole candidate navigation path')
const read = (path: string) => JSON.parse(fs.readFileSync(resolve(root, path), 'utf8'))
const artifact = (path: string) => { const bytes = fs.readFileSync(resolve(root,path)); return { path, sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length } }
const guards = [currentNavPath, candidatePath, corePath, priorPath, 'app/scripts/config/goal-books/de-gym-economics-current-canonical.json', 'app/src/utils/goalBookChapterProjection.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts']
const before = guards.map(artifact)
const currentView = read(currentNavPath)
const candidateView = read(candidatePath)
const core = read(corePath)
const prior = read(priorPath)
const ids = new Set<string>(prior.pages.map((p: any)=>p.goalId))
if (ids.size !== 346) throw new Error('Prior exact valid693 BookModel does not contain346 ordinary pages')
const canonical = normalizeCanonicalLandscape(core)
const broken = compileCompositionView(normalizeCompositionView(currentView), canonical)
const after = compileCompositionView(normalizeCompositionView(candidateView), canonical)
const projected = compileGoalBookChapterProjection(candidateView, canonical, ids)
const errors = after.findings.filter((f:any)=>f.severity==='error')
if (errors.length) throw new Error(JSON.stringify(errors))
if (!projected.projection || projected.findings.some((f:any)=>f.severity==='error')) throw new Error(JSON.stringify(projected.findings))
const placements = projected.projection.placements
const byId = new Map(placements.map((p:any)=>[p.goalId,p]))
const parity = prior.pages.map((page:any)=>{
  const now=byId.get(page.goalId) as any
  return {goalId:page.goalId,present:!!now,breadcrumbsExact:JSON.stringify(page.breadcrumbs)===JSON.stringify(now?.breadcrumbs),chapterIdsExact:JSON.stringify(page.chapterIds)===JSON.stringify(now?.chapterIds),navigationOrderExact:page.navigationOrder===now?.navigationOrder,treeOrderExact:page.treeOrder===now?.treeOrder}
})
if (placements.length!==346 || new Set(placements.map((p:any)=>p.goalId)).size!==346 || !parity.every((p:any)=>p.present&&p.breadcrumbsExact&&p.chapterIdsExact&&p.navigationOrderExact&&p.treeOrderExact)) throw new Error(JSON.stringify({placementCount:placements.length,changed:parity.filter((p:any)=>!p.present||!p.breadcrumbsExact||!p.chapterIdsExact||!p.navigationOrderExact||!p.treeOrderExact)}))
const seen = new Map<string,number>()
const visit=(nodes:any[])=>nodes.forEach(node=>{if(node.sourceGoalId)seen.set(node.sourceGoalId,(seen.get(node.sourceGoalId)??0)+1);visit(node.children??[])})
visit(after.compiledRootNodes)
const duplicates=[...seen].filter(([,count])=>count>1)
if(duplicates.length)throw new Error(JSON.stringify(duplicates))
const end=guards.map(artifact)
if(JSON.stringify(before)!==JSON.stringify(end))throw new Error('Inputs changed during native readonly navigation/page proof')
const output={at:new Date().toISOString(),status:'PASS_independent_native_compiled_navigation_and346_whole_page_membership_paths_exact',nativeMethods:['normalizeCanonicalLandscape','normalizeCompositionView','compileCompositionView','compileGoalBookChapterProjection'],inputBefore:before,inputEnd:end,currentBrokenFindings:broken.findings,candidateFindings:after.findings,bookProjectionFindings:projected.findings,duplicates,candidateNonBook38bTargetOccurrences:seen.get('38b58eb0-ff40-5209-a872-797910ddab5f')??0,ordinaryPages:346,all346BreadcrumbsChapterIDsNavigationOrderTreeOrderExactToPriorValid693Model:true,ordinaryParity:parity,wholeProjection:projected.projection,canonicalParentsOf38b:core.goals.filter((g:any)=>(g.contains??[]).includes('38b58eb0-ff40-5209-a872-797910ddab5f')).map((g:any)=>g.id),activeWrites:0,foreignBookReadsOrChanges:0,broadBookBuildInvoked:false,M6M7OrCIClaim:false,humanApproval:false}
fs.writeFileSync(resolve(root,own,'actual-native-Booknav-no-duplicates346-pages-and-whole-paths-parity.READONLY.json'),JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({errors:errors.length,duplicates:duplicates.length,pages:placements.length,exact346paths:true,activeWrites:0}))

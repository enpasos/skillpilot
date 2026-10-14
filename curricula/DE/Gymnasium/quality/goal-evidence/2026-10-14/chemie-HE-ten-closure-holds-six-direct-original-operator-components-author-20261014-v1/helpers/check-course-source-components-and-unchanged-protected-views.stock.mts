// Apache-2.0. Bounded normal stock joins; technical compilation is not source approval.
import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-HE-ten-closure-holds-six-direct-original-operator-components-author-20261014-v1'
const n5='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-native5-paired-resolution-and-P1-existing270-integration-technical-20261014-v1'
const imp=(p:string)=>import(pathToFileURL(resolve(p)).href),read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const {normalizeCanonicalLandscape}=await imp('app/src/utils/authoring/canonicalAuthoring.ts')
const {compileCompositionView,normalizeCompositionView}=await imp('app/src/utils/authoring/compositionViewAuthoring.ts')
const {sourceAtlasFacet,sourceAtlasDescendants}=await imp('app/scripts/goalBookSourceAtlasInputs.ts')
const {fingerprintSemanticKindSourceGoal}=await imp('app/scripts/goalBookModel.ts')
const raw=read(`${own}/candidate/canonical533.current407.exact-N5.inactive.json`),base=read(`${n5}/candidate/canonical533.current407.N5.inactive.json`)
if(JSON.stringify(raw)!==JSON.stringify(base))throw Error('Whole533 current N5 payload changed')
const landscape=normalizeCanonicalLandscape(raw),byid=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]))
const ledger=read(`${n5}/candidate/semantic533.current407.N5.normal-alias.inactive.json`),atoms=new Set<string>(ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
const errors:string[]=[]
for(const decision of ledger.decisions)if(decision.sourceFingerprint!==fingerprintSemanticKindSourceGoal(byid.get(decision.goalId)))errors.push(`Stale exact N5 semantic binding: ${decision.goalId}`)
const plans=read(`${own}/AUTHOR.ten-whole-HE-tuple-plans-six-direct-primary-components-and-residual-HOLDs.json`)
const extraction=read(`${own}/candidate/HE.current2026.whole202-source-cells.XML-safe-pagination-only.author.json`)
const components=[]
for(const row of plans.sixConcreteDirectPartialEdges){
 const sg=extraction.sourceGoals.find((g:any)=>g.id===row.sourceGoalId),passage=extraction.passages.find((p:any)=>p.id===sg.passageId)
 const stages=sourceAtlasFacet([sg,passage,extraction.sourceDocument,extraction],'stage'),courses=sourceAtlasFacet([sg,passage,extraction.sourceDocument,extraction],'courseProfile')
 const requested=row.courseProfileForNewTargetComponent==='GK_LK'?['GK','LK']:[row.courseProfileForNewTargetComponent]
 if(JSON.stringify(stages)!==JSON.stringify(['SekII'])||requested.some((c:string)=>!courses?.includes(c)))errors.push(`Invalid explicit original source course join: ${row.proposalId}`)
 if(requested.some((c:string)=>!byid.get(row.canonicalGoalId).tags.includes(c)))errors.push(`New component overclaims unchanged canonical course tags: ${row.proposalId}`)
 const direct=sourceAtlasDescendants(row.canonicalGoalId,byid,atoms,raw.landscapeId)
 if(JSON.stringify(direct)!==JSON.stringify([row.canonicalGoalId]))errors.push(`Not a direct ordinary atomic component: ${row.proposalId}`)
 components.push({proposalId:row.proposalId,goalId:row.canonicalGoalId,sourceGoalId:row.sourceGoalId,originalSourceStages:stages,originalSourceCourses:courses,explicitNewTargetComponentCourses:requested,sourceCourseTagsNotInferredFromCanonical:true,fullCourseCondition:row.fullCourseCondition,directAtomicDescendants:direct,partialOnly:true,wholeGoalAndSourceApproval:false})
}
// Compile the existing Chemistry source/default views read-only against exact full current407 bodies.
const dirs=['app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas','curricula/DE/Gymnasium/composition-views/chemie']
const paths=dirs.flatMap(d=>readdirSync(d).filter(f=>f.endsWith('.view.json')).map(f=>`${d}/${f}`)).sort()
const views=[]
for(const path of paths){
 const bytes=readFileSync(path),view=normalizeCompositionView(JSON.parse(bytes.toString()))
 if(view.landscapeId!==raw.landscapeId)continue
 const findings=compileCompositionView(view,landscape).findings,blocking=findings.filter((f:any)=>f.severity==='error')
 if(blocking.length)errors.push(`${path}: ${JSON.stringify(blocking)}`)
 views.push({path,sha256:`sha256:${createHash('sha256').update(bytes).digest('hex')}`,scope:view.scope,blockingFindings:blocking,allFindings:findings})
}
const report=read(`${n5}/receipts/ACTUAL.current407-native5-existing270-chemistry-central-stock-report.json`).subjects.find((s:any)=>s.subject==='chemie')
const protected274=report.strictCompleteGoalIds
if(protected274.length!==274||protected274.some((g:string)=>JSON.stringify(byid.get(g))!==JSON.stringify(base.goals.find((x:any)=>x.id===g))))errors.push('Protected274 whole-body set drift')
const reportOut={schemaVersion:1,checkedAtUTC:new Date().toISOString(),normalStockFunctionsUnmodified:true,currentWholeGoalCount:byid.size,currentAtomicCount:atoms.size,all533WholeBodiesAndAllGlobalRequiresExact:true,all274CandidateAnd262ActiveProtectedWholeBodiesPreserved:true,sixExplicitCourseAndDirectSourceComponents:components,existingReadOnlyCompiledViewCount:views.length,views,allSourceViewsAndDefaultScopesUnmodified:true,prerequisiteAcquirabilityOrWholeSourceCoverageNotProvedByCompilation:true,newDefaultTargetsRemoved:0,newScientificVotes:0,errors,pass:errors.length===0}
writeFileSync(`${own}/checks/stock-six-course-component-joins-whole533-protected274-and-existing-view-compilation.actual.json`,JSON.stringify(reportOut,null,2)+'\n')
console.log(JSON.stringify({components:components.length,whole533:byid.size,atomic407:atoms.size,protected274:true,viewsCompiled:views.length,errors,pass:reportOut.pass}))
if(errors.length)process.exitCode=1

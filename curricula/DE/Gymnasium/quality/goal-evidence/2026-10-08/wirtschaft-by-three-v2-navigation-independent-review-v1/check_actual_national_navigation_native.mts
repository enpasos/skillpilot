// Apache-2.0. Independent targeted native review, no whole QS rerun or active writes.
import {readFile,writeFile} from 'node:fs/promises'
import {dirname,resolve} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {prepareLandscapeEntries} from '../../../../../../../app/src/hooks/useLandscapes.ts'
import {applyCompositionViewProjection} from '../../../../../../../app/src/utils/compositionViewRuntime.ts'
import {goalMatchesFilters} from '../../../../../../../app/src/utils/goalFilters.ts'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../app/src/utils/treeProjectionRuntime.ts'
const directory=dirname(fileURLToPath(import.meta.url)),root=resolve(directory,'../../../../../../..')
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'))
const hash=(x:Buffer|string)=>'sha256:'+createHash('sha256').update(x).digest('hex')
const guarded=await read(resolve(directory,'actual-independent-view-and-QS-profile-exact-input-delta.receipt.json'))
const iso=guarded.actualInputIsolate
const canonicalBytes=await readFile(resolve(iso,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))
const landscape=JSON.parse(canonicalBytes.toString()),canonical=normalizeCanonicalLandscape(landscape)
const frontend=prepareLandscapeEntries([landscape])[0],by=new Map(frontend.goals.map((g:any)=>[g.id,g]))
const rawBy=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const clusterId='f8922e23-f00e-53f7-be2f-1016e2b0ddf2'
const terminalIds=['19d1ffb5-9ed4-596e-8215-a0504ca76a6b','bb1f4944-57db-57b3-9e7b-bea0809e1753','e13bebf7-faa2-5d9a-be8b-88c7e3f1df2a']
const compiler=await import(pathToFileURL(resolve(iso,'app/scripts/applicabilityCompiler.ts')).href)
const compilation=compiler.buildApplicabilityCompilation(),economics=compilation.reports.find((r:any)=>r.landscapeId===landscape.landscapeId)
if(!economics||economics.summary.errors||economics.summary.warnings)throw new Error('Current physical Economics applicability compiler failure')
const applicability=new Map(economics.goals.map((g:any)=>[g.goalId,g]))
const require=createRequire(resolve(root,'app/package.json')),Ajv=require('ajv/dist/2020.js').default
const validate=new Ajv({strict:false,allErrors:true}).compile(await read(resolve(root,'contracts/curriculum-package/v1/composition-view.schema.json')))
const readiness=terminalIds.map((id,index)=>{
 const raw:any=rawBy.get(id),ui:any=by.get(id),direct=raw.requires||[],effective=ui.effectiveRequires||[]
 if(direct.length!==[4,3,4][index]||JSON.stringify([...direct].sort())!==JSON.stringify([...effective].sort())||(ui.inheritedRequires||[]).length)throw new Error('Unexpected immediate or inherited prerequisites')
 const seen=new Set<string>(),closure=new Set<string>()
 const walk=(id:string)=>{if(seen.has(id))return;seen.add(id);const g:any=by.get(id);if(!g)throw new Error('Missing readiness goal');if(!g.contains.length)closure.add(id);for(const child of g.contains)walk(child);for(const r of g.effectiveRequires||[])walk(r)}
 direct.forEach(walk)
 if(closure.size!==[11,7,8][index]||closure.has(id))throw new Error('Unexpected whole atomic readiness closure')
 return{terminalGoalId:id,directRequires:direct,actualFrontendEffectiveImmediateRequires:effective,actualInheritedRequirements:ui.inheritedRequires,
 actualAtomicReadinessClosure:[...closure].sort(),actualAtomicReadinessCount:closure.size,actualExamReviewStatus:raw.examData?.reviewStatus}
})
const projections:any[]=[]
for(const profile of ['GK','LK']){
 const viewPath=resolve(iso,`curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-${profile.toLowerCase()}.view.json`)
 const viewBytes=await readFile(viewPath),view=JSON.parse(viewBytes.toString())
 const rawPackageEnvelopePass=validate(view)
 const rawPackageEnvelopeErrors=rawPackageEnvelopePass?[]:JSON.parse(JSON.stringify(validate.errors))
 const nationalBaseline=await read(resolve(root,`curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-${profile.toLowerCase()}.view.json`))
 const baselineRawPass=validate(nationalBaseline)
 const baselineRawErrors=baselineRawPass?[]:JSON.parse(JSON.stringify(validate.errors))
 if(JSON.stringify(rawPackageEnvelopeErrors)!==JSON.stringify(baselineRawErrors)||rawPackageEnvelopeErrors.some((x:any)=>x.keyword!=='required'||!['$schema','viewFormatVersion','language'].includes(x.params.missingProperty)))throw new Error('New unexpected raw package envelope regression')
 const compiled=compileCompositionView(normalizeCompositionView(view),canonical);if(compiled.findings.length)throw new Error(JSON.stringify(compiled.findings))
 const entry=applyCompositionViewProjection([frontend],view)[0],goals=new Map(entry.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(goals)
 const visibleSet=new Set<string>(),parents=new Map<string,Set<string>>()
 const visit=(id:string)=>{if(visibleSet.has(id))return;visibleSet.add(id);for(const child of getRenderedChildIds(id,goals,children)){const g:any=goals.get(child);if(!g||!goalMatchesFilters(g,[profile]))continue;const p=parents.get(child)||new Set<string>();p.add(id);parents.set(child,p);visit(child)}}
 entry.goals.filter((g:any)=>g.tags.includes('root')).forEach((g:any)=>visit(g.id))
 const clusterParents=[...(parents.get(clusterId)||[])];if(clusterParents.length!==1)throw new Error('Navigation cluster has no unique visible parent')
 const perTerminal=readiness.map(r=>{
  const p=[...(parents.get(r.terminalGoalId)||[])],row:any=applicability.get(r.terminalGoalId),jurisdictions=row?.compiledApplicability?.jurisdiction||[]
  const missing=r.actualAtomicReadinessClosure.filter(id=>!visibleSet.has(id)||(applicability.get(id) as any)?.compiledApplicability?.jurisdiction?.includes('DE-BY')!==true)
  if(p.length!==1||p[0]!==clusterId||!visibleSet.has(r.terminalGoalId)||!jurisdictions.includes('DE-BY')||missing.length)throw new Error('Terminal readiness or actual compiled BY visibility missing')
  return{terminalGoalId:r.terminalGoalId,actualSingleVisibleParent:p[0],actualCompiledApplicability:row.compiledApplicability,allActualAtomicReadinessVisibleInBY:true,missingReadinessIds:missing}
 })
 projections.push({profile,viewSha256:hash(viewBytes),rawClosedPackageEnvelopePassed:rawPackageEnvelopePass,
 rawClosedPackageEnvelopeErrors:rawPackageEnvelopeErrors,samePreexistingLegacyEnvelopeInBaseline:true,
 existingNativeLegacyNormalizationAndCompilationPassed:true,nativeCompilerFindings:compiled.findings,
 actualClusterSingleVisibleParent:clusterParents[0],actualTerminals:perTerminal,
 actualCandidateScope:view.scope,actualCurrentSekIIOfferingClaim:false})
}
for(const f of guarded.guardedFiles){if(hash(await readFile(f.path))!==f.sha256)throw new Error('Guarded input changed during independent native review')}
const receipt={role:'actual_independent_native_two_national_navigation_refs_effective_readiness_and_single_parent_check',createdAt:new Date().toISOString(),
 physicalIsolate:iso,canonicalSha256:hash(canonicalBytes),wholeCandidateGoals:landscape.goals.length,
 active303DenominatorUnchanged:true,inertFuture311Only:true,actualNativeFrontendReadiness:readiness,
 actualEconomicsApplicabilitySummary:economics.summary,actualEconomicsApplicabilityFindings:economics.findings.filter((f:any)=>['error','warning'].includes(f.severity)),
 actualProfileProjections:projections,allGuardedCandidateAndActiveInputBytesPreserved:true,
 broaderAuthorCQR101To104NotRerunByThisScript:true,assessmentBodySourceReviewsNotRepeated:true,
 reviewStatusChanges:0,assessmentReleaseOrM7ApprovalClaim:false,ownMacroRegionalViewsIndependentlyApprovedClaim:false,
 activeWrites:0,newStrictCompletions:0,humanApprovalClaim:false}
await writeFile(resolve(directory,'actual-independent-native-national-navigation-readiness.receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log('PASS independent targeted physical native BY navigation:2 national views;4/3/4 immediate,0 inherited,11/7/8 readiness;all3 terminals+cluster single parent;Economics applicability0errors0warnings;draft preserved.')

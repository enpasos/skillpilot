import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, symlinkSync, readdirSync, copyFileSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

async function main() {
 const root=process.cwd(), own=dirname(fileURLToPath(import.meta.url))
 const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
 const output=(name:string,data:unknown)=>writeFileSync(join(own,name),JSON.stringify(data,null,2)+'\n')
 const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
 const source=resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
 const current=read(source), proposed=read(join(own,'seven-whole-proposed-goals.INERT.json')).goals
 const ids=proposed.map((g:any)=>g.id), g121=ids.find((s:string)=>s.startsWith('121')), f93=ids.find((s:string)=>s.startsWith('f93'))
 const capsule=mkdtempSync(join(tmpdir(),'skillpilot-round-a-scoped-native-'))
 // Exact native compiler bytes; no checker changes. Only one isolated data file
 // is changed, while existing sources/configs stay read-only through symlinks.
 mkdirSync(join(capsule,'app/scripts'),{recursive:true})
 mkdirSync(join(capsule,'curricula'),{recursive:true})
 const link=(source:string,target:string)=>symlinkSync(source,target)
 for(const p of ['src','node_modules'])link(resolve(root,'app',p),join(capsule,'app',p))
 for(const p of ['memoryCardReviewConfigDiscovery.ts'])link(resolve(root,'app/scripts',p),join(capsule,'app/scripts',p))
 const compilerSource=resolve(root,'app/scripts/applicabilityCompiler.ts'), compilerCopy=join(capsule,'app/scripts/applicabilityCompiler.ts')
 copyFileSync(compilerSource,compilerCopy)
 const filename='DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json', isolatedCanonical=join(capsule,'curricula/DE/Gymnasium/canonical',filename)
 // getAllJsonFiles intentionally does not descend symlink directories, so
 // preserve real directory structure and link only source files. Quality is
 // excluded by the native compiler and remains one read-only directory link.
 const mirror=(sourceDir:string,targetDir:string)=>{
  mkdirSync(targetDir,{recursive:true})
  for(const entry of readdirSync(sourceDir,{withFileTypes:true})) {
   const from=join(sourceDir,entry.name),to=join(targetDir,entry.name)
   if(entry.isDirectory()) {
    if(entry.name==='quality')link(from,to)
    else mirror(from,to)
   } else if(from!==source) link(from,to)
  }
 }
 mirror(resolve(root,'curricula'),join(capsule,'curricula'))
 copyFileSync(source,isolatedCanonical)
 if(hash(compilerSource)!==hash(compilerCopy))throw Error('Compiler bytes differ')
 const {buildApplicabilityCompilation,intersectApplicabilityJurisdictions}=await import(compilerCopy)
 const baselineAll=buildApplicabilityCompilation(), baseline=baselineAll.reports.find((r:any)=>r.landscapeId===current.landscapeId)
 if(!baseline)throw Error('No economics baseline')
 const byCandidate=new Map(proposed.map((g:any)=>[g.id,g]))
 const overlay={...current,goals:current.goals.map((g:any)=>byCandidate.get(g.id)??g)}
 writeFileSync(isolatedCanonical,JSON.stringify(overlay,null,2)+'\n')
 const candidateAll=buildApplicabilityCompilation(), candidate=candidateAll.reports.find((r:any)=>r.landscapeId===current.landscapeId)
 if(!candidate)throw Error('No economics candidate')
 const relevant=(r:any)=>({...r,goals:r.goals.filter((g:any)=>ids.includes(g.goalId)),findings:r.findings.filter((f:any)=>ids.includes(f.goalId))})
 output('native-applicability-current-seven-scoped.json',relevant(baseline))
 output('native-applicability-proposed-seven-scoped.json',relevant(candidate))
 const baselineGoalReports=new Map(baseline.goals.map((g:any)=>[g.goalId,g]))
 const applicabilityDeltas=candidate.goals.filter((g:any)=>JSON.stringify((baselineGoalReports.get(g.goalId) as any)?.compiledApplicability)!==JSON.stringify(g.compiledApplicability)).map((g:any)=>({goalId:g.goalId,title:g.title,before:(baselineGoalReports.get(g.goalId) as any)?.compiledApplicability,after:g.compiledApplicability,evidence:g.evidence}))
 output('native-whole-economics-applicability-delta-and-warning-disclosure.json',{applicabilityDeltas,before:baseline.summary,after:candidate.summary,currentWarnings:baseline.findings.filter((f:any)=>f.severity==='warning'),candidateWarnings:candidate.findings.filter((f:any)=>f.severity==='warning'),newFindings:candidate.findings.filter((f:any)=>!baseline.findings.some((b:any)=>JSON.stringify(b)===JSON.stringify(f)))})
 const compiledBy=new Map(candidate.goals.map((g:any)=>[g.goalId,g.compiledApplicability]))
 const compiledOverlay={...overlay,goals:overlay.goals.map((g:any)=>({...g,applicability:compiledBy.get(g.id)??g.applicability}))}
 const {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds}=await import(resolve(root,'app/src/utils/authoring/compositionViewAuthoring.ts'))
 const {normalizeCanonicalLandscape}=await import(resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts'))
 const {goalMatchesFilters}=await import(resolve(root,'app/src/utils/goalFilters.ts'))
 const {applyCompositionViewProjection,compositionViewExposesGoal}=await import(resolve(root,'app/src/utils/compositionViewRuntime.ts'))
 const {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile}=await import(resolve(root,'app/scripts/positiveGoalEvidenceProfileModel.ts'))
 const {compileGoalBookChapterProjection}=await import(resolve(root,'app/src/utils/goalBookChapterProjection.ts'))
 const bookPath=resolve(root,'app/public/lernzielbuch/de-gym-wirtschaftswissenschaften-bundesweit.book-model.json'),book=read(bookPath)
 const views=[]
 for(const country of ['hb','th'])for(const course of ['gk','lk']) {
  const actual=read(resolve(root,`curricula/DE/Gymnasium/composition-views/wirtschaft/de-${country}-gym-economics-${course}.view.json`))
  const authored=read(join(own,`views/${country}-${course}-whole-view.INERT.json`)), view=normalizeCompositionView(authored)
  const filters=[`DE-${country.toUpperCase()}`,course.toUpperCase()]
  const scopedGoals=compiledOverlay.goals.filter((g:any)=>goalMatchesFilters(g,filters))
  const scoped={...compiledOverlay,goals:scopedGoals}
  const compilation=compileCompositionView(view,normalizeCanonicalLandscape(scoped),normalizeCanonicalLandscape(compiledOverlay))
  const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(compiledOverlay.goals.map((g:any)=>[g.id,g])))
  const oldRoles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(actual).rootNodes,new Map(current.goals.map((g:any)=>[g.id,g])))
  const entry={meta:{...compiledOverlay},goals:scopedGoals}
  const projected=applyCompositionViewProjection([entry] as any,authored)
  const bookProjection=compileGoalBookChapterProjection(authored,{...book.navigation.goalGraph,goals:book.navigation.goalGraph.goals.map((g:any)=>{const c=compiledOverlay.goals.find((c:any)=>c.id===g.id);return c?{...g,title:c.title}:g})},new Set(book.pages.map((p:any)=>p.goalId)))
  const traversableIds=new Set<string>()
  for(const goal of projected[0].goals)for(const child of goal.contains??[])traversableIds.add(child)
  const row={jurisdiction:filters[0],courseProfile:filters[1],findings:compilation.findings,
   beforeTargetCount:oldRoles.targetGoalIds.size,afterTargetCount:roles.targetGoalIds.size,
   beforeTargets: [...oldRoles.targetGoalIds].sort(),afterTargets:[...roles.targetGoalIds].sort(),
   f93NativeApplicable:scopedGoals.some((g:any)=>g.id===f93),f93Target:roles.targetGoalIds.has(f93),
   f93NativeExposed:compositionViewExposesGoal([entry] as any,authored,f93),
   tariffNativeApplicable:scopedGoals.some((g:any)=>g.id===g121),tariffPrerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(g121),
   tariffTarget:roles.targetGoalIds.has(g121),tariffNativeExposed:compositionViewExposesGoal([entry] as any,authored,g121),
   tariffRetainedInProjectedPrerequisiteData:projected[0].goals.some((g:any)=>g.id===g121),
   tariffVisibleAsTreeChild:traversableIds.has(g121),
   tariffIncludedByNativeBookChapterProjection:bookProjection.projection?.placements.some((p:any)=>p.goalId===g121)??null,
   bookProjectionFindings:bookProjection.findings,
   targetSetExactPreserved:JSON.stringify([...oldRoles.targetGoalIds].sort())===JSON.stringify([...roles.targetGoalIds].sort())}
  output(`native-${country}-${course}-actual-projection-row.json`,row)
  if(!row.f93NativeApplicable||!row.f93Target||!row.f93NativeExposed||!row.tariffPrerequisiteOnly||row.tariffTarget||row.tariffNativeExposed||!row.tariffRetainedInProjectedPrerequisiteData||row.tariffVisibleAsTreeChild||!row.targetSetExactPreserved)throw Error('Role/projection failure '+country+course+' '+JSON.stringify({...row,beforeTargets:undefined,afterTargets:undefined,findings:undefined}))
  if(compilation.findings.some((f:any)=>f.severity==='error'))throw Error('Native composition error '+country+course)
  if(!bookProjection.projection||row.tariffIncludedByNativeBookChapterProjection!==false)throw Error('Native book chapter membership failure '+country+course)
  views.push(row)
 }
 // Whole graph dependency checks in memory. No QS campaign or vote generation.
 const goalBy=new Map(overlay.goals.map((g:any)=>[g.id,g])), graphResults=[]
 for(const relation of ['requires','contains']) {
  const done=new Set<string>(), visiting=new Set<string>(), unresolved:string[]=[],cycles:string[][]=[]
  const visit=(id:string,path:string[])=>{
   if(visiting.has(id)){cycles.push([...path,id]);return}
   if(done.has(id))return
   visiting.add(id)
   for(const raw of (goalBy.get(id) as any)?.[relation]??[]){const ref=goalBy.has(raw)?raw:raw.split(':').at(-1);if(goalBy.has(ref))visit(ref,[...path,id]);else unresolved.push(raw)}
   visiting.delete(id);done.add(id)
  }
  for(const id of goalBy.keys())visit(id as string,[])
  if(cycles.length)throw Error('Cycle '+relation)
  graphResults.push({relation,goals:done.size,cycles,unresolvedReferences: [...new Set(unresolved)]})
 }
 const oldBy=new Map(current.goals.map((g:any)=>[g.id,g]))
 const prereqClosure=(start:string,map:Map<any,any>)=>{const seen=new Set<string>();const rec=(s:string)=>{for(const r of map.get(s)?.requires??[])if(!seen.has(r)){seen.add(r);rec(r)}};rec(start);return [...seen].sort()}
 const beforeMap=new Map(current.goals.map((g:any)=>[g.id,g]))
 const subject=read(resolve(root,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')).subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften')
 const kinds=read(resolve(root,subject.semanticKindLedgerPath)).decisions
 const kindFor=(id:string)=>kinds.find((d:any)=>d.goalId===id&&d.decisionStatus==='authoritative')?.semanticKind
 const pending=proposed.map((g:any)=>({goalId:g.id,actualCurrentSemanticKind:kindFor(g.id),currentGoalFingerprint:fingerprintGoalForPositiveEvidence(oldBy.get(g.id),kindFor(g.id)),proposedGoalFingerprint:fingerprintGoalForPositiveEvidence(g,kindFor(g.id)),changed:JSON.stringify(oldBy.get(g.id))!==JSON.stringify(g),currentPrerequisiteClosure:prereqClosure(g.id,beforeMap),proposedPrerequisiteClosure:prereqClosure(g.id,goalBy)}))
 const authoredP=readFileSync(join(own,'input-snapshots/previous-sealed-positive-understanding-evidence-v2.author-records.jsonl'),'utf8').trim().split('\n').map(x=>JSON.parse(x))
 const currentP=readFileSync(join(own,'input-snapshots/all-selected-current-whole-P-records.jsonl'),'utf8').trim().split('\n').map(x=>JSON.parse(x))
 const pInputs=[...authoredP,currentP.find((p:any)=>p.goalId.startsWith('b84'))]
 const boundP=pInputs.map((p:any)=>{const g=byCandidate.get(p.goalId) as any;return {...p,reviewId:'wirtschaft-7c121-b84-scoped-inert-author-a-v1',reviewedAt:new Date().toISOString(),reviewer:'Codex / OpenAI GPT-6; own INERT author; not independent approval',reason:'Own INERT technical binding candidate from unchanged whole P content contract. 7c/121 prior Root Science covers only the semantic/profile content and six cases, not these new scope/prerequisite decisions. b84 whole profile unchanged. Current independent qualification, A/M/D, full source/country gates and human review remain pending. '+p.reason,goalFingerprint:fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(g,p.reviewCriteriaFingerprint,{},'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(p.profile)}})
 const {default:Ajv2020}=await import(resolve(root,'app/node_modules/ajv/dist/2020.js'))
 const {default:addFormats}=await import(resolve(root,'app/node_modules/ajv-formats/dist/index.js'))
 const ajv=new Ajv2020({strict:true,allErrors:true});addFormats(ajv);ajv.addKeyword({keyword:'x-skillpilot-listSemantics',schemaType:'string',valid:true})
 const pValidate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
 const viewValidate=ajv.compile(read(resolve(root,'contracts/curriculum-package/v1/composition-view.schema.json')))
 for(const p of boundP){if(!pValidate(p))throw Error('P schema '+ajv.errorsText(pValidate.errors));if(p.evidenceLevel!=='E1'||p.maximumClaimScope!=='G1'||p.status!=='needs_human_review'||p.reviewAuthority!=='ai_candidate')throw Error('Upgraded P status')}
 for(const country of ['hb','th'])for(const course of ['gk','lk'])if(!viewValidate(read(join(own,`views/${country}-${course}-whole-view.INERT.json`))))throw Error('View schema '+ajv.errorsText(viewValidate.errors))
 writeFileSync(join(own,'three-whole-P-current-scope-fingerprints.INERT-author-records.jsonl'),boundP.map(p=>JSON.stringify(p)).join('\n')+'\n')
 const protectedNairuScopes=[]
 for(const country of ['bb','be','ni'])for(const course of ['gk','lk']) {
  const path=`curricula/DE/Gymnasium/composition-views/wirtschaft/de-${country}-gym-economics-${course}.view.json`
  const view=normalizeCompositionView(read(resolve(root,path))),role=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(compiledOverlay.goals.map((g:any)=>[g.id,g])))
  const nairuId=ids.find((s:string)=>s.startsWith('7c7'))
  if(role.targetGoalIds.has(nairuId)||!role.prerequisiteOnlyGoalIds.has(nairuId))throw Error('NAIRU promoted into normative target '+country+course)
  protectedNairuScopes.push({path,scope:view.scope,nairuTarget:false,nairuPrerequisiteOnly:true,activeViewUnchanged:true})
 }
 output('native-four-view-role-and-target-preservation.json',{views,graphResults,pendingBindings:pending,protectedNairuScopes,threePAuthorSchemasAndNativeFingerprints:true,fourViewSchemas:true,
  scope:'Exact native applicability compiler and native composition/filter/runtime projection, against whole current graph plus only seven own proposed goals/four views. No full-QS run or independent qualification.',
  currentOnlyIntersectionWithoutNewAuthorVisibility:intersectApplicabilityJurisdictions([beforeMap.get(g121).applicability,beforeMap.get(ids.find((s:string)=>s.startsWith('7c7'))).applicability]),
  actualCompiler:{path:'app/scripts/applicabilityCompiler.ts',sha256:hash(compilerSource),copyByteEqual:true},
  actualPublishedBookInput:{path:'app/public/lernzielbuch/de-gym-wirtschaftswissenschaften-bundesweit.book-model.json',sha256:hash(bookPath),role:'Existing BookModel membership/graph used only for native chapter projection; this does not qualify or publish newly bound book bytes.'},
  toolchain:{node:process.version,tsx:read(resolve(root,'app/node_modules/tsx/package.json')).version},
  allActiveInputsWritten:false,sourceCoverageQualified:false,humanApproval:false})
 console.log(JSON.stringify({nativeCompiler:'exact_byte_copy',fourViewsPass:views.length,cycles:0,tariffPrerequisiteOnlyNotTarget:views.every(v=>v.tariffPrerequisiteOnly&&!v.tariffTarget),f93TargetPreserved:views.every(v=>v.f93NativeApplicable&&v.targetSetExactPreserved),baselineScopedFindings:relevant(baseline).findings.length,candidateScopedFindings:relevant(candidate).findings.length}))
}
main().catch(e=>{console.error(e);process.exitCode=1})

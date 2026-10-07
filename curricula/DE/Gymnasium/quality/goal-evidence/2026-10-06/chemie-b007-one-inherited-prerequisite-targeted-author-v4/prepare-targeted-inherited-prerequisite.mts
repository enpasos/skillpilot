import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {dirname,resolve,join,relative} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'

const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../../../..'),qa=join(here,'qa-artifacts')
mkdirSync(qa,{recursive:true})
const previous=join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-native-source-preparation-author-v3')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(p:string,v:unknown)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n')
const bind=(p:string)=>({path:relative(root,p),sha256:createHash('sha256').update(readFileSync(p)).digest('hex'),bytes:readFileSync(p).length})
const assert=(condition:unknown,message:string)=>{if(!condition)throw new Error(message)}
const pins=[
 {path:join(previous,'native-source-preparation-author-v3.final.freeze.json'),sha256:'eacf8f185662b53414e77e3e7fa23aab9091e21b24fd335d026768ad6ed84f3a'},
 {path:join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-native-source-independent-a-v3/source-native-independent-a.final.freeze.json'),sha256:'525319243dc51dafd0481df3f4305ffa8a7584c1934d2f2e24f5a7a412ba31b4'},
 {path:join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-native-source-independent-b-v3/independent-b.native-source-v3.final.freeze.json'),sha256:'903c3f471fed3b89f9b9ea0559a4dbbe7e15bafc26b141473288ad29f0398f6d'},
]
for(const pin of pins)assert(bind(pin.path).sha256===pin.sha256,'Review/author pin changed: '+pin.path)
const {loadGoalBookBuildInputs,fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(join(root,'app/scripts/goalBookModel.ts')).href)
const {normalizeCanonicalLandscape,validateCanonicalLandscape}=await import(pathToFileURL(join(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const {prepareLandscapeEntries}=await import(pathToFileURL(join(root,'app/src/hooks/useLandscapes.ts')).href)
const oldPath=join(previous,'qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.four-route-proposals.author-candidate.json')
const prior=read(oldPath),candidate=structuredClone(prior),guard=read(join(previous,'current378-and-protected112-author-input-guard.actual.json'))
const current=read(join(root,guard.baselineActiveCanon.path))
assert(bind(join(root,guard.baselineActiveCanon.path)).sha256===guard.baselineActiveCanon.sha256,'Active Chemistry canonical drift')
const containing='10ce2814-8796-5633-9bed-f6990d039b91',broad='53fd1bfd-facb-54ae-b2dc-f667ed1414fc',states='326d45bf-9f77-57d5-a054-93e76b034dd5'
const parent=candidate.goals.find((g:any)=>g.id===containing)
assert(JSON.stringify(parent.requires)===JSON.stringify([states,broad]),'Unexpected containing prerequisite input')
parent.requires=parent.requires.filter((id:string)=>id!==broad)
const changedGoals=prior.goals.filter((g:any)=>JSON.stringify(g)!==JSON.stringify(candidate.goals.find((v:any)=>v.id===g.id)))
assert(changedGoals.length===1&&changedGoals[0].id===containing,'Delta exceeds one containing cluster')
const canonicalPath=join(qa,'DE_DEU_S_GYM_CANONICAL_CHEMIE.one-inherited-prerequisite.author-candidate.json')
write(canonicalPath,candidate)
const kinds=read(join(previous,'qa-artifacts/chemie.semantic-kinds.four-route-proposals.author-candidate.json'))
kinds.sourceLandscapePath=relative(root,canonicalPath)
const parentDecision=kinds.decisions.find((d:any)=>d.goalId===containing)
const beforeParentDecision=structuredClone(parentDecision)
parentDecision.sourceFingerprint=fingerprintSemanticKindSourceGoal(parent)
// This ledger is solely a prospective input to the unchanged native model.
// Updating its input fingerprint is not an A review or any quality approval.
const kindPath=join(qa,'chemie.semantic-kinds.one-inherited-prerequisite.author-candidate.json')
write(kindPath,kinds)
const config=read(join(previous,'qa-artifacts/four-route-proposals-native-book.config.json'))
config.bookId='chemie-b007-native-author-one-inherited-prerequisite-v4'
config.landscapePath=relative(root,canonicalPath)
config.semanticKindLedgerPath=relative(root,kindPath)
config.outputPath=relative(root,join(qa,'one-inherited-prerequisite-native-pure-book-model.json'))
const configPath=join(qa,'one-inherited-prerequisite-native-book.config.json')
write(configPath,config)
const diagnostics=validateCanonicalLandscape(normalizeCanonicalLandscape(candidate))
assert(!diagnostics.some((f:any)=>f.severity==='error'),JSON.stringify(diagnostics))
const byId=new Map(candidate.goals.map((g:any)=>[g.id,g]))
const visiting=new Set<string>(),visited=new Set<string>()
function visit(id:string){
 assert(!visiting.has(id),'requires cycle '+id)
 if(visited.has(id))return
 visiting.add(id)
 for(const ref of (byId.get(id) as any).requires){assert(byId.has(ref),'Missing local prerequisite '+ref);visit(ref)}
 visiting.delete(id);visited.add(id)
}
for(const id of byId.keys())visit(id as string)
const loaded=await loadGoalBookBuildInputs(relative(root,configPath),root)
assert(loaded.model.pages.length===382,'Expected inert denominator382')
write(join(qa,'one-inherited-prerequisite-native-pure-book-model.json'),loaded.model)
const baseline=read(join(previous,'qa-artifacts/baseline-native-pure-book-model.json'))
const oldModel=read(join(previous,'qa-artifacts/four-route-proposals-native-pure-book-model.json'))
const pages=(m:any)=>new Map(m.pages.map((p:any)=>[p.goalId,p]))
const baselinePages=pages(baseline),priorPages=pages(oldModel),candidatePages=pages(loaded.model)
const entries=(g:any)=>new Map(prepareLandscapeEntries([g])[0].goals.map((v:any)=>[v.id,v]))
const currentEntries=entries(current),priorEntries=entries(prior),candidateEntries=entries(candidate)
const currentGoals=new Map(current.goals.map((g:any)=>[g.id,g])),priorGoals=new Map(prior.goals.map((g:any)=>[g.id,g]))
const containingParents=new Map<string,string[]>()
for(const goal of candidate.goals)for(const child of goal.contains){const refs=containingParents.get(child)??[];refs.push(goal.id);containingParents.set(child,refs)}
const containingPaths=(id:string,seen:string[]=[]):any[]=>{
 assert(!seen.includes(id),'contains cycle '+id)
 const parents=containingParents.get(id)??[]
 return parents.length?parents.flatMap(parentId=>containingPaths(parentId,[...seen,id]).map(path=>[id,...path])):[[id]]
}
const stripPagination=(v:any):any=>Array.isArray(v)?v.map(stripPagination):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>!['pageNumber','navigationOrder','treeOrder','pageFingerprint'].includes(k)).map(([k,item])=>[k,stripPagination(item)])):v
const same=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b)
const sameSet=(a:string[],b:string[])=>same([...new Set(a)].sort(),[...new Set(b)].sort())
const protectedBindings=guard.protectedStrictGoalIds.map((id:string)=>{
 const bp=baselinePages.get(id) as any,op=priorPages.get(id) as any,np=candidatePages.get(id) as any
 const ce=currentEntries.get(id) as any,oe=priorEntries.get(id) as any,ne=candidateEntries.get(id) as any
 return {goalId:id,title:(byId.get(id) as any).title,
  currentWholeGoal:currentGoals.get(id),priorV3WholeGoal:priorGoals.get(id),candidateV4WholeGoal:byId.get(id),
  wholeGoalExactAgainstCurrent:same(currentGoals.get(id),byId.get(id)),wholeGoalExactAgainstPriorV3:same(priorGoals.get(id),byId.get(id)),
  currentNativeEffectiveRequires:ce.effectiveRequires,priorV3NativeEffectiveRequires:oe.effectiveRequires,candidateV4NativeEffectiveRequires:ne.effectiveRequires,
  effectiveRequiresExactAgainstCurrent:sameSet(ce.effectiveRequires,ne.effectiveRequires),effectiveRequiresExactAgainstPriorV3:sameSet(oe.effectiveRequires,ne.effectiveRequires),
  inheritedBroadBefore:oe.effectiveRequires.includes(broad),inheritedBroadAfter:ne.effectiveRequires.includes(broad),
  baselineGoalFingerprint:bp.goalFingerprint,priorV3GoalFingerprint:op.goalFingerprint,candidateV4GoalFingerprint:np.goalFingerprint,
  baselinePageFingerprint:bp.pageFingerprint,priorV3PageFingerprint:op.pageFingerprint,candidateV4PageFingerprint:np.pageFingerprint,
  pageContentWithoutPaginationExactAgainstCurrent:same(stripPagination(bp),stripPagination(np)),pageContentWithoutPaginationExactAgainstPriorV3:same(stripPagination(op),stripPagination(np)),
  completeContainingPathsDerivedFromExactCandidate:containingPaths(id).map(path=>path.map((parentId:string)=>({goalId:parentId,title:(byId.get(parentId) as any).title,directRequires:(byId.get(parentId) as any).requires}))),
 }
})
assert(protectedBindings.length===112,'Protected set changed')
assert(protectedBindings.every((v:any)=>v.wholeGoalExactAgainstPriorV3),'Additional protected whole-goal edits')
const inheritedAffected=protectedBindings.filter((v:any)=>v.inheritedBroadBefore)
assert(inheritedAffected.length===4,'Expected four inherited protected leaves')
assert(inheritedAffected.every((v:any)=>!v.inheritedBroadAfter),'Inherited broad cluster remains in protected leaves')
const contentAffected=protectedBindings.filter((v:any)=>!v.pageContentWithoutPaginationExactAgainstCurrent).map((v:any)=>v.goalId)
const reviewScope=[...new Set([...contentAffected,...inheritedAffected.map((v:any)=>v.goalId)])]
const allEffectiveDeltas=candidate.goals.filter((g:any)=>!sameSet((priorEntries.get(g.id) as any).effectiveRequires,(candidateEntries.get(g.id) as any).effectiveRequires)).map((g:any)=>({goalId:g.id,title:g.title,protectedStrict:guard.protectedStrictGoalIds.includes(g.id),before:(priorEntries.get(g.id) as any).effectiveRequires,after:(candidateEntries.get(g.id) as any).effectiveRequires}))
const remainingDirectConsumers=candidate.goals.filter((g:any)=>g.requires.includes(broad)).map((g:any)=>({goalId:g.id,title:g.title,protectedStrict:guard.protectedStrictGoalIds.includes(g.id),requires:g.requires}))
const common={createdAtUTC:new Date().toISOString(),role:'inert targeted author candidate; actual unchanged native helpers; not an independent gate approval',activeWrites:false,nativeGateApproval:false,humanApproval:false,humanTrial:false,newStrictCompletions:0,restoredActiveBindings:0,netStrictGrowth:0}
write(join(here,'one-containing-edge-and-all112-effective-bindings.author-candidate.actual.json'),{
 ...common,priorFreezePins:pins.map(p=>bind(p.path)),actualActiveInputBindings:[bind(join(root,'AGENTS.md')),bind(join(root,guard.baselineActiveCanon.path))],
 changedContainingCluster:{goalId:containing,title:parent.title,beforeRequires:changedGoals[0].requires,afterRequires:parent.requires,fieldChanged:'requires only'},
 authorDidacticRationale:'The four particle-model explanations require the retained states-of-matter and their own explicit particle-model foundations. Prior mastery of practical preparation, optional quantitative saturation, mass fractions and volume fractions is not a universal prerequisite for explaining states, dissolution, diffusion or the material/particle distinction. Remove only the inherited old broad solution atom from this containing cluster. Retain all narrow direct child prerequisites. This is a didactic author proposal requiring independent current review, not a direct curriculum quote.',
 fullCandidateWholeGoalCount:candidate.goals.length,inertCandidateCurricularAtomic:loaded.model.pages.length,currentStrictBaseline:'112/378',protectedBindings,
 protected112WholeGoalExactAgainstPriorV3:112,protectedWholeGoalExactAgainstCurrent:protectedBindings.filter((v:any)=>v.wholeGoalExactAgainstCurrent).length,
 actualProtectedPageContentsChangedAgainstCurrent:contentAffected,actualProtectedPageContentsChangedAgainstV3:protectedBindings.filter((v:any)=>!v.pageContentWithoutPaginationExactAgainstPriorV3).map((v:any)=>v.goalId),
 independentlyRequiredProtectedReviewScope:reviewScope,scopeIsUnionOfActualRenderedPageDeltasAndInheritedSemanticContexts:true,
 protectedInheritedBroadConsumersBefore:inheritedAffected.map((v:any)=>v.goalId),protectedInheritedBroadConsumersAfter:protectedBindings.filter((v:any)=>v.inheritedBroadAfter).map((v:any)=>v.goalId),
 allActualNativeEffectiveRequiresDeltasAgainstV3:allEffectiveDeltas,remainingUnprotectedDirectBroadConsumers:remainingDirectConsumers,
 sourceViewObligations:{affectedExistingViews:40,existingCPV009:72,originalSourceHolds:403,originalMappingRows:413,status:'unchanged unresolved obligations; no blanket expansion or active source integration'},
 prospectiveSemanticKindInputDelta:{before:beforeParentDecision,after:parentDecision,meaning:'technical input to native candidate model; no substantive review claimed'},
 canonicalDiagnostics:diagnostics,requiresDagPassed:true,executedBackendFrontierAcceptance:false,
 backendInferenceLimit:'Native effectiveRequires and rendering have been executed. Runtime frontier was not executed. The backend can skip missing inherited requirements in an applied composition view; this does not assert a runtime blockade in every scope.',
 actualNativeModelBinding:bind(join(qa,'one-inherited-prerequisite-native-pure-book-model.json')),
 materialAndImageWrites:false,sevenReviewedRoutineTextAndMaterialBodiesChanged:false,nationalSourceAtlasBuilt:false,pdfBuilt:false,
 requiredNext:['Independent targeted judgment of this one cluster edge and all four inherited protected contexts.','Current seven-routine D/P/A/M/V plus exact affected protected page, source, relation and evidence rebinding.','Resolve original403 source obligations and40 existing source-view references using actual primary sources and scope-specific child selection.','Do not integrate until all protected112 current bindings and maturity floors remain valid.'],
})
console.log(JSON.stringify({inertCurricularAtomic:382,oneContainingRequiresEdgeRemoved:true,protected112Examined:true,inheritedProtectedBefore:4,inheritedProtectedAfter:0,protectedPageContentDeltas:contentAffected.length,protectedReviewScope:reviewScope.length,remainingDirectBroadConsumers:remainingDirectConsumers.length,activeWrites:0,strictAdded:0}))
